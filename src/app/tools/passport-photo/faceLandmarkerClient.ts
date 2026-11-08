/**
 * Client-side manager for MediaPipe Face Landmarker Web Worker.
 * - Lazy-loaded or pre-warmed during idle time on /tools/passport-photo (4G + saveData=false).
 * - Runs in a dedicated Web Worker on a downscaled copy (max 640px) in parallel with server matting.
 * - Self-hosted versioned wasm/model with 1-year immutable caching.
 * - Extracts Landmark 152 for chin tip and iris centers for eye line.
 * - 12-second UI timeout safety: if landmarks take > 12s, UI continues in Option C immediately,
 *   while the download continues in the background so future photos/visits find it in cache.
 * - Emits anonymous GA telemetry: passport_landmarks_ready (with duration_bucket) and passport_landmarks_timeout.
 */

export interface LandmarkResult {
  landmarksAvailable: boolean;
  source: 'landmarks' | 'detector_box' | 'alpha_fallback';
  chinY: number; // In source image pixels
  chinX: number; // In source image pixels
  eyeY: number;  // In source image pixels
  eyeX: number;  // In source image pixels
  durationMs?: number;
  error?: string;
}

let workerInstance: Worker | null = null;
let workerInitFailed = false;
let requestIdCounter = 0;
let isWarmedUp = false;

// Pending requests mapping
const pendingRequests = new Map<number, (result: any) => void>();
// Background late listeners for requests that timed out on UI but finished in worker
const lateCompletionListeners = new Map<number, (result: LandmarkResult) => void>();

// In-memory cache by cache key (e.g. imageSrc or content hash)
const landmarkCache = new Map<string, LandmarkResult>();

/**
 * Anonymous GA event helper (no file names, no image data, no user info)
 */
function sendAnonymousGaEvent(eventName: string, params: Record<string, string | number | boolean>) {
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    try {
      (window as any).gtag('event', eventName, params);
    } catch {
      // Ignore GA errors
    }
  }
}

function getDurationBucket(ms: number): string {
  if (ms < 1000) return '<1s';
  if (ms < 3000) return '1-3s';
  if (ms < 6000) return '3-6s';
  if (ms <= 12000) return '6-12s';
  return '>12s';
}

function getWorker(): Worker | null {
  if (typeof window === 'undefined') return null;
  if (workerInitFailed) return null;
  if (workerInstance) return workerInstance;

  try {
    workerInstance = new Worker(new URL('./faceLandmarker.worker.ts', import.meta.url));
    workerInstance.onmessage = (e: MessageEvent) => {
      const { type, id, ...data } = e.data || {};
      if (type === 'WARMUP_READY') {
        isWarmedUp = true;
        return;
      }
      if (type === 'DETECT_RESULT') {
        const resolver = pendingRequests.get(id);
        if (resolver) {
          pendingRequests.delete(id);
          resolver(data);
        } else {
          // Request timed out for initial UI, but finished in background!
          const lateListener = lateCompletionListeners.get(id);
          if (lateListener && data.success && data.chinNorm && data.eyeNorm) {
            lateCompletionListeners.delete(id);
            // Construct result for late listener
            const lateResult: LandmarkResult = {
              landmarksAvailable: true,
              source: 'landmarks',
              chinY: data.chinY || 0,
              chinX: data.chinX || 0,
              eyeY: data.eyeY || 0,
              eyeX: data.eyeX || 0,
              durationMs: data.durationMs,
            };
            lateListener(lateResult);
          }
        }
      }
    };
    workerInstance.onerror = () => {
      // Silently fall back to Option C on worker error
      pendingRequests.forEach((resolve) => resolve({ success: false, landmarksAvailable: false }));
      pendingRequests.clear();
      lateCompletionListeners.clear();
      workerInitFailed = true;
      workerInstance = null;
    };
    return workerInstance;
  } catch {
    workerInitFailed = true;
    return null;
  }
}

/**
 * Check if the browser connection permits idle prefetching:
 * ONLY if saveData is false AND effectiveType is "4g". Otherwise keeps lazy load.
 */
export function shouldPrefetchLandmarks(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const conn = (navigator as any).connection;
  if (conn) {
    if (conn.saveData === true) return false;
    if (conn.effectiveType !== '4g') return false;
    return true;
  }
  return false;
}

/**
 * Prefetches the landmark assets during browser idle time (before photo upload).
 */
export function prefetchFaceLandmarks(): void {
  if (isWarmedUp || workerInitFailed) return;
  const worker = getWorker();
  if (worker) {
    worker.postMessage({ type: 'WARMUP' });
  }
}

/**
 * Runs landmark detection on a source image/canvas in a Web Worker on a downscaled copy.
 * Caches result by cacheKey.
 * Max UI timeout 12 seconds; on timeout, UI falls back to Option C immediately while
 * background download continues uninterrupted so next photo/visit finds it in cache.
 */
export async function detectFaceLandmarks(
  source: HTMLImageElement | HTMLCanvasElement,
  cacheKey: string,
  onBackgroundUpgrade?: (result: LandmarkResult) => void
): Promise<LandmarkResult | null> {
  if (landmarkCache.has(cacheKey)) {
    return landmarkCache.get(cacheKey)!;
  }

  const worker = getWorker();
  if (!worker) {
    return null;
  }

  const srcW = 'naturalWidth' in source ? (source.naturalWidth || source.width) : source.width;
  const srcH = 'naturalHeight' in source ? (source.naturalHeight || source.height) : source.height;

  if (srcW <= 0 || srcH <= 0) return null;

  // Downscale image to max 640px dimension for fast worker inference & transfer
  const maxDim = 640;
  const scale = Math.min(1, maxDim / Math.max(srcW, srcH));
  const downW = Math.round(srcW * scale);
  const downH = Math.round(srcH * scale);

  const offscreen = document.createElement('canvas');
  offscreen.width = downW;
  offscreen.height = downH;
  const ctx = offscreen.getContext('2d');
  if (!ctx) return null;

  ctx.drawImage(source, 0, 0, downW, downH);

  let bitmapOrData: ImageBitmap | ImageData | null = null;
  let transferList: Transferable[] = [];

  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(offscreen);
      bitmapOrData = bitmap;
      transferList = [bitmap];
    } catch {
      bitmapOrData = ctx.getImageData(0, 0, downW, downH);
    }
  } else {
    bitmapOrData = ctx.getImageData(0, 0, downW, downH);
  }

  const reqId = ++requestIdCounter;

  // 12-second UI timeout safety:
  // If > 12s, resolve null to unblock UI into Option C, but KEEP lateCompletionListener
  // so the worker continues downloading in the background and populates cache/upgrade!
  const resultPromise = new Promise<any>((resolve) => {
    const timeout = setTimeout(() => {
      if (pendingRequests.has(reqId)) {
        pendingRequests.delete(reqId);

        // Anonymous GA event: timeout after 12s
        sendAnonymousGaEvent('passport_landmarks_timeout', {
          timeout_sec: 12,
        });

        // Register late completion listener so when the download finishes, cache is filled
        if (onBackgroundUpgrade) {
          lateCompletionListeners.set(reqId, (lateRes) => {
            lateRes.chinY = Math.round(lateRes.chinY * srcH);
            lateRes.chinX = Math.round(lateRes.chinX * srcW);
            lateRes.eyeY = Math.round(lateRes.eyeY * srcH);
            lateRes.eyeX = Math.round(lateRes.eyeX * srcW);
            landmarkCache.set(cacheKey, lateRes);
            onBackgroundUpgrade(lateRes);
          });
        }

        resolve({ success: false, landmarksAvailable: false, error: 'UI timeout after 12s (continuing in background)' });
      }
    }, 12000);

    pendingRequests.set(reqId, (res) => {
      clearTimeout(timeout);
      resolve(res);
    });
  });

  try {
    if (bitmapOrData instanceof ImageBitmap && transferList.length > 0) {
      worker.postMessage({ type: 'DETECT', id: reqId, imageBitmap: bitmapOrData, width: downW, height: downH }, transferList);
    } else {
      worker.postMessage({ type: 'DETECT', id: reqId, imageData: bitmapOrData, width: downW, height: downH });
    }
  } catch {
    pendingRequests.delete(reqId);
    return null;
  }

  const rawRes = await resultPromise;
  if (!rawRes || !rawRes.success || !rawRes.chinNorm || !rawRes.eyeNorm) {
    return null;
  }

  const durationMs = rawRes.durationMs || 0;

  // Anonymous GA event: landmarks ready with duration bucket
  sendAnonymousGaEvent('passport_landmarks_ready', {
    duration_bucket: getDurationBucket(durationMs),
  });

  const result: LandmarkResult = {
    landmarksAvailable: true,
    source: 'landmarks',
    chinY: Math.round(rawRes.chinNorm.y * srcH),
    chinX: Math.round(rawRes.chinNorm.x * srcW),
    eyeY: Math.round(rawRes.eyeNorm.y * srcH),
    eyeX: Math.round(rawRes.eyeNorm.x * srcW),
    durationMs,
  };

  landmarkCache.set(cacheKey, result);
  return result;
}
