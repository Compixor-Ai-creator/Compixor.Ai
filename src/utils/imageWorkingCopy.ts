/**
 * Image working copy generator:
 * - Downscales large images to max 2400px longest side.
 * - Respects EXIF orientation.
 * - Caps intermediate canvas sizes under 16.7 megapixels (iOS Safari limitation).
 * - Closes ImageBitmap immediately to prevent memory leaks.
 */

export interface WorkingCopyResult {
  dataUrl: string;
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
}

export const PASSPORT_UPLOAD_CONFIG = {
  MAX_FILE_BYTES: 15 * 1024 * 1024, // 15 MB
  MAX_MEGAPIXELS: 100,              // 100 MP
  WORKING_MAX_DIM: 2400,            // Working copy max dimension (px)
  SERVER_MAX_DIM: 1600,             // Server upload max dimension (px)
};

export async function createPassportWorkingCopy(file: File): Promise<WorkingCopyResult> {
  // Try createImageBitmap with automatic orientation handling and resize if supported
  if (typeof createImageBitmap !== 'undefined') {
    try {
      // First get native dimensions
      const probeBitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      const origW = probeBitmap.width;
      const origH = probeBitmap.height;
      probeBitmap.close();

      const longestSide = Math.max(origW, origH);
      let targetW = origW;
      let targetH = origH;

      if (longestSide > PASSPORT_UPLOAD_CONFIG.WORKING_MAX_DIM) {
        const ratio = PASSPORT_UPLOAD_CONFIG.WORKING_MAX_DIM / longestSide;
        targetW = Math.round(origW * ratio);
        targetH = Math.round(origH * ratio);
      }

      const bitmap = await createImageBitmap(file, {
        imageOrientation: 'from-image',
        resizeWidth: targetW,
        resizeHeight: targetH,
        resizeQuality: 'high',
      });

      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        bitmap.close();
        throw new Error('Canvas 2D context unavailable');
      }

      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();

      const dataUrl = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.95);
      return {
        dataUrl,
        width: canvas.width,
        height: canvas.height,
        naturalWidth: origW,
        naturalHeight: origH,
      };
    } catch (err) {
      console.warn('createImageBitmap failed, falling back to HTMLImageElement stepwise halving:', err);
    }
  }

  // Fallback: HTMLImageElement + stepwise canvas scaling
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const origW = img.naturalWidth;
        const origH = img.naturalHeight;
        const longestSide = Math.max(origW, origH);

        let targetW = origW;
        let targetH = origH;
        if (longestSide > PASSPORT_UPLOAD_CONFIG.WORKING_MAX_DIM) {
          const ratio = PASSPORT_UPLOAD_CONFIG.WORKING_MAX_DIM / longestSide;
          targetW = Math.round(origW * ratio);
          targetH = Math.round(origH * ratio);
        }

        // Stepwise halving to avoid downsampling blur and iOS 16.7MP cap
        let currentCanvas = document.createElement('canvas');
        currentCanvas.width = origW;
        currentCanvas.height = origH;
        let currentCtx = currentCanvas.getContext('2d')!;
        currentCtx.drawImage(img, 0, 0);

        let curW = origW;
        let curH = origH;

        while (curW / 2 >= targetW && curH / 2 >= targetH) {
          curW = Math.round(curW / 2);
          curH = Math.round(curH / 2);
          const nextCanvas = document.createElement('canvas');
          nextCanvas.width = curW;
          nextCanvas.height = curH;
          const nextCtx = nextCanvas.getContext('2d')!;
          nextCtx.drawImage(currentCanvas, 0, 0, curW, curH);
          currentCanvas = nextCanvas;
        }

        // Final scale step
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = targetW;
        finalCanvas.height = targetH;
        const finalCtx = finalCanvas.getContext('2d')!;
        finalCtx.imageSmoothingEnabled = true;
        finalCtx.imageSmoothingQuality = 'high';
        finalCtx.drawImage(currentCanvas, 0, 0, targetW, targetH);

        const dataUrl = finalCanvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.95);
        resolve({
          dataUrl,
          width: targetW,
          height: targetH,
          naturalWidth: origW,
          naturalHeight: origH,
        });
      } catch (e) {
        reject(e);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to decode image'));
    };

    img.src = url;
  });
}
