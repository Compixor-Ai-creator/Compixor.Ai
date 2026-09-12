/**
 * High-Precision Client-Side Background Removal & Passport Photo Compositing Pipeline
 * Powered by @imgly/background-removal (IS-Net FP16)
 *
 * 100% Client-Side / Zero Server Uploads
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
  chokeAmount?: number;    // 0 to 1.5px (recommended: 0.6px)
  decontaminate?: boolean;
  originalBgColor?: { r: number; g: number; b: number } | null;
}

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
 * Executes high-precision client-side background removal using @imgly/background-removal (IS-Net FP16)
 */
export async function removeBackgroundISNet(
  imageSource: ImageData | HTMLCanvasElement | Blob | string,
  onProgress?: MattingProgressCallback
): Promise<Blob> {
  const imgly = await import('@imgly/background-removal');
  const removeBgFn: (image: any, config?: any) => Promise<Blob> =
    (imgly as any).removeBackground || (imgly as any).default || (imgly as any);

  const resultBlob = await removeBgFn(imageSource, {
    model: 'isnet_fp16',
    output: {
      format: 'image/png',
      quality: 1.0,
    },
    progress: (key: string, current: number, total: number) => {
      let stage = 'Refining portrait matting...';
      if (key.includes('fetch') || key.includes('download')) {
        stage = 'Downloading IS-Net AI Model...';
      } else if (key.includes('onnx') || key.includes('init')) {
        stage = 'Initializing ONNX WebAssembly Engine...';
      } else if (key.includes('compute') || key.includes('inference')) {
        stage = 'Generating High-Precision Alpha Mask...';
      } else if (key.includes('encode')) {
        stage = 'Rendering PNG cutout...';
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
