/**
 * High-Precision Background Removal & Passport Photo Compositing Pipeline
 * Powered by Compixor Cloud AI Backend (rembg) with On-Device Fallback (IS-Net FP16)
 *
 * Secure memory-only HTTPS processing & zero photo retention
 */

/**
 * Samples the original background color from outer border perimeter of the image canvas
 */
export function sampleOriginalBgColor(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): { r: number; g: number; b: number } {
  try {
    const sampleBorder = 6;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let rSum = 0;
    let gSum = 0;
    let bSum = 0;
    let count = 0;

    // Sample top edge and top corners
    for (let y = 0; y < Math.min(sampleBorder, height); y++) {
      for (let x = 0; x < width; x += 3) {
        const idx = (y * width + x) * 4;
        rSum += data[idx];
        gSum += data[idx + 1];
        bSum += data[idx + 2];
        count++;
      }
    }

    // Sample left and right top third edges (usually clear background)
    const upperThird = Math.floor(height * 0.4);
    for (let y = sampleBorder; y < upperThird; y += 3) {
      // Left border
      for (let x = 0; x < Math.min(sampleBorder, width); x++) {
        const idx = (y * width + x) * 4;
        rSum += data[idx];
        gSum += data[idx + 1];
        bSum += data[idx + 2];
        count++;
      }
      // Right border
      for (let x = Math.max(0, width - sampleBorder); x < width; x++) {
        const idx = (y * width + x) * 4;
        rSum += data[idx];
        gSum += data[idx + 1];
        bSum += data[idx + 2];
        count++;
      }
    }

    if (count === 0) return { r: 240, g: 240, b: 240 };
    return {
      r: Math.round(rSum / count),
      g: Math.round(gSum / count),
      b: Math.round(bSum / count),
    };
  } catch (err) {
    return { r: 240, g: 240, b: 240 };
  }
}

/**
 * Compixor AI — High-Precision Passport Photo Matting Pipeline
 *
 * Connects directly to our VPS backend (POST /remove-bg?bg=transparent or /api/remove-bg)
 * with automatic graceful fallback to client-side IS-Net neural matting when offline/busy.
 */

export interface MattingProgress {
  stage: string;
  current: number;
  total: number;
  percent: number;
}

export type MattingProgressCallback = (progress: MattingProgress) => void;

export interface EdgeRefinementOptions {
  featherRadius?: number; // 0.8px to 2.5px (recommended: 1.2px)
  chokeAmount?: number;   // 0 to 1.5px (recommended: 0.6px)
  decontaminate?: boolean;
  originalBgColor?: { r: number; g: number; b: number } | null;
}

/**
 * Global in-memory cache keyed by SHA-256 hash of the input image.
 * Guarantees background removal runs ONLY ONCE per unique photo.
 */
export const cutoutCache = new Map<string, HTMLCanvasElement>();

/**
 * Calculates SHA-256 hexadecimal hash of an ArrayBuffer or Blob.
 */
export async function computeImageSha256(data: ArrayBuffer | Blob): Promise<string> {
  const buffer = data instanceof Blob ? await data.arrayBuffer() : data;
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Resolves the Background Removal Backend API URL.
 * Env var: NEXT_PUBLIC_BG_API_URL (default: https://api.compixor-ai.cloud)
 */
export function getBgApiUrl(): string {
  if (process.env.NEXT_PUBLIC_BG_API_URL) {
    return process.env.NEXT_PUBLIC_BG_API_URL.replace(/\/$/, '');
  }
  if (process.env.NEXT_PUBLIC_BG_REMOVE_API_URL) {
    return process.env.NEXT_PUBLIC_BG_REMOVE_API_URL.replace(/\/$/, '');
  }
  return 'https://api.compixor-ai.cloud';
}

/**
 * Helper to normalize image sources to a downscaled, EXIF-corrected Blob.
 * Downscales before upload: longest side max 1600 px, JPEG quality 0.9.
 */
export async function prepareUploadBlob(
  imageSource: ImageData | HTMLCanvasElement | Blob | string,
  maxDimension: number = 1600
): Promise<Blob> {
  let imgBitmap: ImageBitmap | HTMLImageElement | HTMLCanvasElement;

  if (imageSource instanceof Blob) {
    try {
      imgBitmap = await createImageBitmap(imageSource, { imageOrientation: 'from-image' });
    } catch {
      const url = URL.createObjectURL(imageSource);
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
      });
      URL.revokeObjectURL(url);
      imgBitmap = img;
    }
  } else if (typeof HTMLCanvasElement !== 'undefined' && imageSource instanceof HTMLCanvasElement) {
    imgBitmap = imageSource;
  } else if (typeof ImageData !== 'undefined' && imageSource instanceof ImageData) {
    const c = document.createElement('canvas');
    c.width = imageSource.width;
    c.height = imageSource.height;
    const ctx = c.getContext('2d');
    if (ctx) ctx.putImageData(imageSource, 0, 0);
    imgBitmap = c;
  } else if (typeof imageSource === 'string') {
    const res = await fetch(imageSource);
    const blob = await res.blob();
    imgBitmap = await createImageBitmap(blob, { imageOrientation: 'from-image' });
  } else {
    throw new Error('Unsupported image source type for upload preparation');
  }

  const w = 'width' in imgBitmap ? imgBitmap.width : (imgBitmap as HTMLImageElement).naturalWidth;
  const h = 'height' in imgBitmap ? imgBitmap.height : (imgBitmap as HTMLImageElement).naturalHeight;

  let targetW = w;
  let targetH = h;
  if (w > maxDimension || h > maxDimension) {
    const ratio = Math.min(maxDimension / w, maxDimension / h);
    targetW = Math.round(w * ratio);
    targetH = Math.round(h * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not create 2D canvas context');
  ctx.drawImage(imgBitmap, 0, 0, targetW, targetH);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to encode downscaled image'));
      },
      'image/jpeg',
      0.9
    );
  });
}

/**
 * Universal Background Removal via Compixor VPS Backend API.
 * Uses XMLHttpRequest for genuine upload progress tracking, AbortController for cancellation,
 * and automatic single-retry on network/5xx failures.
 */
export async function removeBackgroundViaAPI(
  blob: Blob,
  options: {
    signal?: AbortSignal;
    onUploadProgress?: (percent: number) => void;
    onStatusChange?: (statusText: string) => void;
  } = {}
): Promise<Blob> {
  const baseUrl = getBgApiUrl();
  const endpoints = [
    `${baseUrl}/api/remove-bg`,
    `${baseUrl}/api/remove-bg?bg=transparent`,
    `${baseUrl}/remove-bg?bg=transparent`,
    `${baseUrl}/remove-bg`,
  ];

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    if (options.signal?.aborted) {
      throw new DOMException('Upload aborted by user', 'AbortError');
    }

    if (attempt > 0) {
      options.onStatusChange?.('Retrying connection to Compixor AI...');
      await new Promise((r) => setTimeout(r, 1000));
    }

    for (const url of endpoints) {
      try {
        const resultBlob = await new Promise<Blob>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', url, true);
          xhr.responseType = 'blob';
          xhr.timeout = 60000; // 60s timeout

          if (options.signal) {
            options.signal.addEventListener('abort', () => {
              xhr.abort();
              reject(new DOMException('Upload aborted by user', 'AbortError'));
            });
          }

          xhr.upload.onprogress = (evt) => {
            if (evt.lengthComputable && evt.total > 0) {
              const pct = Math.min(99, Math.round((evt.loaded / evt.total) * 100));
              options.onUploadProgress?.(pct);
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(xhr.response);
            } else {
              let errMsg = `Server returned HTTP ${xhr.status}`;
              if (xhr.response instanceof Blob) {
                const reader = new FileReader();
                reader.onload = () => {
                  try {
                    const parsed = JSON.parse(reader.result as string);
                    if (parsed.error) errMsg = parsed.error;
                    else if (parsed.detail) errMsg = typeof parsed.detail === 'string' ? parsed.detail : JSON.stringify(parsed.detail);
                  } catch {}
                  reject(new Error(errMsg));
                };
                reader.readAsText(xhr.response);
              } else {
                reject(new Error(errMsg));
              }
            }
          };

          xhr.onerror = () => reject(new Error('Network connection error to backend'));
          xhr.ontimeout = () => reject(new Error('Request timed out (60s limit)'));

          const fd = new FormData();
          // Supply both field names so any backend routing works flawlessly
          fd.append('file', blob, 'portrait.jpg');
          fd.append('image', blob, 'portrait.jpg');

          options.onStatusChange?.('Uploading photo to secure server...');
          xhr.send(fd);
        });

        return resultBlob;
      } catch (err: any) {
        if (err?.name === 'AbortError') throw err;
        lastError = err;
      }
    }
  }

  throw lastError || new Error('Backend background removal failed after retry');
}

/**
 * Executes high-precision client-side background removal using @imgly/background-removal (IS-Net FP16)
 * Used as automatic fallback when backend returns 429/503 or network is completely offline.
 */
export async function removeBackgroundISNet(
  imageSource: ImageData | HTMLCanvasElement | Blob | string,
  onProgress?: MattingProgressCallback
): Promise<Blob> {
  const imgly = await import('@imgly/background-removal');
  const removeMattingFn: (image: any, config?: any) => Promise<Blob> =
    (imgly as any).removeBackground || (imgly as any).default || (imgly as any);

  const resultBlob = await removeMattingFn(imageSource, {
    model: 'isnet_fp16',
    output: {
      format: 'image/png',
      quality: 1.0,
    },
    progress: (key: string, current: number, total: number) => {
      let stage = 'Refining portrait matting on device...';
      if (key.includes('fetch') || key.includes('download')) {
        stage = 'Downloading on-device AI model...';
      } else if (key.includes('onnx') || key.includes('init')) {
        stage = 'Initializing WebAssembly engine...';
      } else if (key.includes('compute') || key.includes('inference')) {
        stage = 'Processing alpha mask locally...';
      } else if (key.includes('encode')) {
        stage = 'Generating PNG cutout...';
      }

      const percent = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
      onProgress?.({
        stage,
        current,
        total,
        percent,
      });
    },
  });

  return resultBlob;
}

/**
 * Universal Background Removal entry point:
 * Uses Compixor VPS Backend API first with automatic on-device fallback if offline or overloaded.
 */
export async function removeBackground(
  imageSource: ImageData | HTMLCanvasElement | Blob | string,
  options: {
    signal?: AbortSignal;
    onUploadProgress?: (percent: number) => void;
    onStatusChange?: (statusText: string) => void;
    forceOnDevice?: boolean;
    onFallback?: () => void;
  } = {}
): Promise<{ blob: Blob; mode: 'server' | 'on-device' }> {
  if (options.forceOnDevice) {
    options.onStatusChange?.('Processing on device only...');
    const blob = await removeBackgroundISNet(imageSource, (p) => {
      options.onStatusChange?.(p.stage);
    });
    return { blob, mode: 'on-device' };
  }

  try {
    const preparedBlob = await prepareUploadBlob(imageSource);
    const blob = await removeBackgroundViaAPI(preparedBlob, {
      signal: options.signal,
      onUploadProgress: options.onUploadProgress,
      onStatusChange: options.onStatusChange,
    });
    return { blob, mode: 'server' };
  } catch (apiErr: any) {
    if (apiErr?.name === 'AbortError') throw apiErr;
    console.warn('[passport] Backend error or offline, falling back to on-device mode:', apiErr);
    options.onFallback?.();
    options.onStatusChange?.('Using on-device mode (IS-Net)...');
    const blob = await removeBackgroundISNet(imageSource, (p) => {
      options.onStatusChange?.(p.stage);
    });
    return { blob, mode: 'on-device' };
  }
}

/**
 * Intermediate Canvas Processing Step:
 * 1. Alpha erosion (choke) to nip edge halos
 * 2. GPU-accelerated Gaussian blur edge feathering (1.0px - 1.5px) to eliminate staircasing / jagged contours
 * 3. Color decontamination along boundary hair/neck/shoulder pixels
 * 4. Crisp interior preservation (facial core untouched for 300 DPI sharpness)
 */
export function refineCutoutCanvas(
  rawCutoutCanvas: HTMLCanvasElement,
  options: EdgeRefinementOptions = {}
): HTMLCanvasElement {
  const width = rawCutoutCanvas.width;
  const height = rawCutoutCanvas.height;
  const featherRadius = options.featherRadius ?? 1.2;
  const choke = options.chokeAmount ?? 0.6;
  const decontaminate = options.decontaminate ?? true;

  // Offscreen output canvas
  const outCanvas = document.createElement('canvas');
  outCanvas.width = width;
  outCanvas.height = height;
  const outCtx = outCanvas.getContext('2d', { willReadFrequently: true });
  if (!outCtx) return rawCutoutCanvas;

  const rawCtx = rawCutoutCanvas.getContext('2d', { willReadFrequently: true });
  if (!rawCtx) return rawCutoutCanvas;

  const rawData = rawCtx.getImageData(0, 0, width, height);
  const data = rawData.data;
  const total = width * height;

  // Step 1: Extract Alpha Channel
  const alphaBuffer = new Uint8Array(total);
  for (let i = 0; i < total; i++) {
    alphaBuffer[i] = data[i * 4 + 3];
  }

  // Step 2: Alpha Choke / Inset (eliminates outer 1px halo contamination)
  let chokedAlpha = alphaBuffer;
  if (choke > 0) {
    chokedAlpha = new Uint8Array(total);
    for (let y = 1; y < height - 1; y++) {
      const yw = y * width;
      for (let x = 1; x < width - 1; x++) {
        const idx = yw + x;
        const curA = alphaBuffer[idx];
        if (curA === 0) {
          chokedAlpha[idx] = 0;
          continue;
        }

        // 3x3 minimum neighbor sampling
        const minNeighbor = Math.min(
          alphaBuffer[yw - width + x],
          alphaBuffer[yw + width + x],
          alphaBuffer[yw + x - 1],
          alphaBuffer[yw + x + 1],
          alphaBuffer[yw - width + x - 1],
          alphaBuffer[yw - width + x + 1],
          alphaBuffer[yw + width + x - 1],
          alphaBuffer[yw + width + x + 1]
        );

        // Blend based on choke amount
        const chokedVal = curA * (1 - choke) + minNeighbor * choke;
        chokedAlpha[idx] = Math.round(chokedVal);
      }
    }
  }

  // Step 3: GPU-Accelerated Gaussian Blur on Alpha Mask Canvas
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = width;
  maskCanvas.height = height;
  const maskCtx = maskCanvas.getContext('2d');

  let blurredAlpha = chokedAlpha;
  if (maskCtx && featherRadius > 0) {
    // Write grayscale mask: R=G=B=A, Alpha=255
    const maskImgData = maskCtx.createImageData(width, height);
    for (let i = 0; i < total; i++) {
      const val = chokedAlpha[i];
      const pIdx = i * 4;
      maskImgData.data[pIdx] = val;
      maskImgData.data[pIdx + 1] = val;
      maskImgData.data[pIdx + 2] = val;
      maskImgData.data[pIdx + 3] = 255;
    }
    maskCtx.putImageData(maskImgData, 0, 0);

    // Draw with hardware-accelerated Gaussian blur filter
    const blurCanvas = document.createElement('canvas');
    blurCanvas.width = width;
    blurCanvas.height = height;
    const blurCtx = blurCanvas.getContext('2d');

    if (blurCtx) {
      blurCtx.filter = `blur(${featherRadius.toFixed(2)}px)`;
      blurCtx.drawImage(maskCanvas, 0, 0);

      const blurImgData = blurCtx.getImageData(0, 0, width, height);
      blurredAlpha = new Uint8Array(total);
      for (let i = 0; i < total; i++) {
        blurredAlpha[i] = blurImgData.data[i * 4];
      }
    }
  }

  // Step 4: Alpha Sigmoid Anti-Aliasing & Interior Detail Preservation
  // CRITICAL: Any interior pixel where original alpha >= 248 remains 100% UNTOUCHED (255)
  // This guarantees zero blur or softening of facial details, eyes, lips, or hair core.
  const finalAlpha = new Uint8Array(total);
  for (let i = 0; i < total; i++) {
    const origA = alphaBuffer[i];
    if (origA >= 248) {
      finalAlpha[i] = 255; // Pure sharp solid interior
    } else if (origA <= 3) {
      finalAlpha[i] = 0;   // Pure transparent background
    } else {
      // Subpixel smoothed boundary
      const bA = blurredAlpha[i];
      // Mild S-curve contrast on the blurred transition to avoid woolly/foggy edges
      const norm = bA / 255;
      const smooth = norm * norm * (3 - 2 * norm);
      finalAlpha[i] = Math.round(smooth * 255);
    }
  }

  // Step 5: Background Decontamination (De-spill & Halo Neutralization)
  const bg = options.originalBgColor ?? sampleOriginalBgColor(rawCtx, width, height);
  const bgR = bg.r;
  const bgG = bg.g;
  const bgB = bg.b;

  const resultData = outCtx.createImageData(width, height);
  const resData = resultData.data;

  for (let i = 0; i < total; i++) {
    const pIdx = i * 4;
    const a = finalAlpha[i];
    resData[pIdx + 3] = a;

    if (a === 0) {
      resData[pIdx] = 0;
      resData[pIdx + 1] = 0;
      resData[pIdx + 2] = 0;
      continue;
    }

    let r = data[pIdx];
    let g = data[pIdx + 1];
    let b = data[pIdx + 2];

    // For semi-transparent edge boundary pixels (hair strands, neck, shoulders)
    if (decontaminate && a > 8 && a < 248) {
      const alphaFactor = a / 255;
      const invAlpha = 1 - alphaFactor;

      // Unmix the observed color by removing the estimated original background contribution
      let cleanR = (r - invAlpha * bgR) / Math.max(0.2, alphaFactor);
      let cleanG = (g - invAlpha * bgG) / Math.max(0.2, alphaFactor);
      let cleanB = (b - invAlpha * bgB) / Math.max(0.2, alphaFactor);

      cleanR = Math.max(0, Math.min(255, cleanR));
      cleanG = Math.max(0, Math.min(255, cleanG));
      cleanB = Math.max(0, Math.min(255, cleanB));

      // Neutralize chromatic fringing on fine hair strands
      const lum = cleanR * 0.299 + cleanG * 0.587 + cleanB * 0.114;
      const deColorWeight = (1 - alphaFactor) * 0.45; // stronger de-saturation near outermost boundary
      r = Math.round(cleanR * (1 - deColorWeight) + lum * deColorWeight);
      g = Math.round(cleanG * (1 - deColorWeight) + lum * deColorWeight);
      b = Math.round(cleanB * (1 - deColorWeight) + lum * deColorWeight);
    }

    resData[pIdx] = r;
    resData[pIdx + 1] = g;
    resData[pIdx + 2] = b;
  }

  outCtx.putImageData(resultData, 0, 0);
  return outCanvas;
}

/**
 * Composite the refined subject onto the solid passport background at 300 DPI specifications
 */
export function compositePassportPhoto(
  destCanvas: HTMLCanvasElement,
  cutoutCanvas: HTMLCanvasElement | null,
  options: {
    width: number;
    height: number;
    bgColor: string;
    isTransparentMode: boolean;
  }
) {
  destCanvas.width = options.width;
  destCanvas.height = options.height;

  const ctx = destCanvas.getContext('2d');
  if (!ctx) return;

  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1.0;

  // Step 1: Background rendering
  if (options.isTransparentMode || options.bgColor === 'transparent') {
    ctx.clearRect(0, 0, options.width, options.height);
  } else {
    // Pure solid color background (e.g. #FFFFFF or #e0f2fe)
    ctx.fillStyle = options.bgColor;
    ctx.fillRect(0, 0, options.width, options.height);
  }

  // Step 2: Clean compositing of decontaminated, feathered subject
  if (cutoutCanvas) {
    ctx.drawImage(cutoutCanvas, 0, 0, options.width, options.height);
  }
}
