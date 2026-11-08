/**
 * Client-side manager for MediaPipe Face Landmarker Web Worker.
 * - Lazy-loaded only after a photo is uploaded.
 * - Runs in a dedicated Web Worker on a downscaled copy (max 640px) in parallel with server matting.
 * - Self-hosted versioned wasm/model with 1-year immutable caching.
 * - Extracts Landmark 152 for chin tip and iris centers for eye line.
 * - 12-second timeout safety: if landmarks take > 12s or fail, silently falls back to Option C.
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
const pendingRequests = new Map<number, (result: any) => void>();

// In-memory cache by cache key (e.g. imageSrc or content hash)
const landmarkCache = new Map<string, LandmarkResult>();

function getWorker(): Worker | null {
  if (typeof window === 'undefined') return null;
  if (workerInitFailed) return null;
  if (workerInstance) return workerInstance;

  try {
    workerInstance = new Worker(new URL('./faceLandmarker.worker.ts', import.meta.url));
    workerInstance.onmessage = (e: MessageEvent) => {
      const { type, id, ...data } = e.data || {};
      if (type === 'DETECT_RESULT') {
        const resolver = pendingRequests.get(id);
        if (resolver) {
          pendingRequests.delete(id);
          resolver(data);
        }
      }
    };
    workerInstance.onerror = (err) => {
      // Silently fall back to Option C on worker error
      pendingRequests.forEach((resolve) => resolve({ success: false, landmarksAvailable: false }));
      pendingRequests.clear();
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
 * Runs landmark detection on a source image/canvas in a Web Worker on a downscaled copy.
 * Caches result by cacheKey.
 * Max timeout 12 seconds; on timeout/failure silently returns null (Option C).
 */
export async function detectFaceLandmarks(
  source: HTMLImageElement | HTMLCanvasElement,
  cacheKey: string
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

  // 12-second timeout safety as specified in user requirement 4
  const resultPromise = new Promise<any>((resolve) => {
    const timeout = setTimeout(() => {
      if (pendingRequests.has(reqId)) {
        pendingRequests.delete(reqId);
        resolve({ success: false, landmarksAvailable: false, error: 'Worker timed out after 12s' });
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

  const result: LandmarkResult = {
    landmarksAvailable: true,
    source: 'landmarks',
    chinY: Math.round(rawRes.chinNorm.y * srcH),
    chinX: Math.round(rawRes.chinNorm.x * srcW),
    eyeY: Math.round(rawRes.eyeNorm.y * srcH),
    eyeX: Math.round(rawRes.eyeNorm.x * srcW),
    durationMs: rawRes.durationMs,
  };

  landmarkCache.set(cacheKey, result);
  return result;
}
