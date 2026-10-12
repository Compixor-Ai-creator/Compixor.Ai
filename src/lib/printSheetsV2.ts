/**
 * Compixor AI — Studio Print Sheets V2 Engine
 * ============================================
 * Provides pixel-exact A6 (2 photos) and A5 (6 photos) print sheet generation
 * at 300 DPI with crop marks, paper margins, 300 DPI JFIF/pHYs metadata injection,
 * and vector PDF document generation.
 *
 * All original sheet presets ('a4', '3-per-a4', 'custom') remain untouched.
 */

import { PDFDocument } from 'pdf-lib';

export interface SheetPresetSpec {
  id: 'a6-2' | 'a5-6';
  name: string;
  paperName: 'A6' | 'A5';
  paperWidthMm: number;
  paperHeightMm: number;
  widthPx: number;  // 300 DPI
  heightPx: number; // 300 DPI
  targetCount: number;
  gapMm: number;
  minMarginMm: number;
}

export const STUDIO_SHEET_PRESETS: Record<'a6-2' | 'a5-6', SheetPresetSpec> = {
  'a6-2': {
    id: 'a6-2',
    name: 'A6 - 2 photos',
    paperName: 'A6',
    paperWidthMm: 105,
    paperHeightMm: 148,
    widthPx: 1240, // round(105 / 25.4 * 300) = 1240
    heightPx: 1748, // round(148 / 25.4 * 300) = 1748
    targetCount: 2,
    gapMm: 2.5,
    minMarginMm: 0, // A6 centered, thin crop marks outside
  },
  'a5-6': {
    id: 'a5-6',
    name: 'A5 - 6 photos',
    paperName: 'A5',
    paperWidthMm: 148,
    paperHeightMm: 210,
    widthPx: 1748, // round(148 / 25.4 * 300) = 1748
    heightPx: 2480, // round(210 / 25.4 * 300) = 2480
    targetCount: 6,
    gapMm: 2.5,
    minMarginMm: 5.0, // 5 mm minimum paper margin
  },
};

/**
 * Pixel exact conversion from mm to 300 DPI: round(mm / 25.4 * 300)
 */
export function mmTo300DpiPx(mm: number): number {
  return Math.round((mm / 25.4) * 300);
}

export interface SheetLayoutResult {
  sheetW: number;
  sheetH: number;
  photoW: number;
  photoH: number;
  cols: number;
  rows: number;
  actualCount: number;
  targetCount: number;
  fitsRequested: boolean;
  reducedMessage?: string;
  positions: Array<{ x: number; y: number; w: number; h: number }>;
}

/**
 * Computes exact layout positions for A6 (side-by-side) or A5 (grid)
 */
export function computeStudioLayout(
  sheetType: 'a6-2' | 'a5-6',
  widthMm: number,
  heightMm: number
): SheetLayoutResult {
  const spec = STUDIO_SHEET_PRESETS[sheetType];
  const photoW = mmTo300DpiPx(widthMm);
  const photoH = mmTo300DpiPx(heightMm);
  const gapPx = mmTo300DpiPx(spec.gapMm);
  const minMarginPx = mmTo300DpiPx(spec.minMarginMm);

  if (sheetType === 'a6-2') {
    // A6: target 2 photos side by side (2 cols x 1 row)
    const requiredW2 = 2 * photoW + gapPx;
    const requiredH2 = photoH;

    // Check if 2 photos fit on A6
    if (requiredW2 <= spec.widthPx && requiredH2 <= spec.heightPx) {
      const startX = Math.floor((spec.widthPx - requiredW2) / 2);
      const startY = Math.floor((spec.heightPx - requiredH2) / 2);
      return {
        sheetW: spec.widthPx,
        sheetH: spec.heightPx,
        photoW,
        photoH,
        cols: 2,
        rows: 1,
        actualCount: 2,
        targetCount: 2,
        fitsRequested: true,
        positions: [
          { x: startX, y: startY, w: photoW, h: photoH },
          { x: startX + photoW + gapPx, y: startY, w: photoW, h: photoH },
        ],
      };
    }

    // If 2 side-by-side doesn't fit, check 2 stacked vertically (1 col x 2 rows)
    const requiredW_stack = photoW;
    const requiredH_stack = 2 * photoH + gapPx;
    if (requiredW_stack <= spec.widthPx && requiredH_stack <= spec.heightPx) {
      const startX = Math.floor((spec.widthPx - requiredW_stack) / 2);
      const startY = Math.floor((spec.heightPx - requiredH_stack) / 2);
      return {
        sheetW: spec.widthPx,
        sheetH: spec.heightPx,
        photoW,
        photoH,
        cols: 1,
        rows: 2,
        actualCount: 2,
        targetCount: 2,
        fitsRequested: true,
        positions: [
          { x: startX, y: startY, w: photoW, h: photoH },
          { x: startX, y: startY + photoH + gapPx, w: photoW, h: photoH },
        ],
      };
    }

    // Otherwise reduce to 1 photo
    const startX = Math.floor((spec.widthPx - photoW) / 2);
    const startY = Math.floor((spec.heightPx - photoH) / 2);
    return {
      sheetW: spec.widthPx,
      sheetH: spec.heightPx,
      photoW,
      photoH,
      cols: 1,
      rows: 1,
      actualCount: 1,
      targetCount: 2,
      fitsRequested: false,
      reducedMessage: `Preset dimensions (${widthMm}x${heightMm} mm) exceed A6 paper width for 2 photos. Reduced to 1 photo.`,
      positions: [{ x: startX, y: startY, w: photoW, h: photoH }],
    };
  }

  // sheetType === 'a5-6'
  // A5: target 6 photos in 3 columns x 2 rows with 5mm minimum margin
  const availW = spec.widthPx - 2 * minMarginPx;
  const availH = spec.heightPx - 2 * minMarginPx;

  const reqW6 = 3 * photoW + 2 * gapPx;
  const reqH6 = 2 * photoH + gapPx;

  if (reqW6 <= availW && reqH6 <= availH) {
    const startX = Math.floor((spec.widthPx - reqW6) / 2);
    const startY = Math.floor((spec.heightPx - reqH6) / 2);
    const positions: Array<{ x: number; y: number; w: number; h: number }> = [];
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        positions.push({
          x: startX + c * (photoW + gapPx),
          y: startY + r * (photoH + gapPx),
          w: photoW,
          h: photoH,
        });
      }
    }
    return {
      sheetW: spec.widthPx,
      sheetH: spec.heightPx,
      photoW,
      photoH,
      cols: 3,
      rows: 2,
      actualCount: 6,
      targetCount: 6,
      fitsRequested: true,
      positions,
    };
  }

  // If 3x2 does not fit with margin, try 2 columns x 2 rows (4 photos)
  const reqW4 = 2 * photoW + gapPx;
  const reqH4 = 2 * photoH + gapPx;
  if (reqW4 <= availW && reqH4 <= availH) {
    const startX = Math.floor((spec.widthPx - reqW4) / 2);
    const startY = Math.floor((spec.heightPx - reqH4) / 2);
    const positions: Array<{ x: number; y: number; w: number; h: number }> = [];
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        positions.push({
          x: startX + c * (photoW + gapPx),
          y: startY + r * (photoH + gapPx),
          w: photoW,
          h: photoH,
        });
      }
    }
    return {
      sheetW: spec.widthPx,
      sheetH: spec.heightPx,
      photoW,
      photoH,
      cols: 2,
      rows: 2,
      actualCount: 4,
      targetCount: 6,
      fitsRequested: false,
      reducedMessage: `Preset dimensions (${widthMm}x${heightMm} mm) exceed A5 paper size for 6 photos. Reduced to 4 photos.`,
      positions,
    };
  }

  // Fallback to 2 photos (2 cols x 1 row)
  const startX = Math.floor((spec.widthPx - reqW4) / 2);
  const startY = Math.floor((spec.heightPx - photoH) / 2);
  return {
    sheetW: spec.widthPx,
    sheetH: spec.heightPx,
    photoW,
    photoH,
    cols: 2,
    rows: 1,
    actualCount: 2,
    targetCount: 6,
    fitsRequested: false,
    reducedMessage: `Preset dimensions (${widthMm}x${heightMm} mm) exceed A5 paper size for 6 photos. Reduced to 2 photos.`,
    positions: [
      { x: startX, y: startY, w: photoW, h: photoH },
      { x: startX + photoW + gapPx, y: startY, w: photoW, h: photoH },
    ],
  };
}

/**
 * Draws crop marks outside the photo rectangle
 */
export function drawCropMarks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  tickLength: number = 18
): void {
  // Thin border
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);

  // Outer corner marks
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(x - tickLength, y);
  ctx.lineTo(x, y);
  ctx.lineTo(x, y - tickLength);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(x + w + tickLength, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y - tickLength);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(x - tickLength, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + h + tickLength);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(x + w + tickLength, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w, y + h + tickLength);
  ctx.stroke();
}

/**
 * Renders the studio print sheet onto a canvas
 */
export function renderStudioSheetToCanvas(
  targetCanvas: HTMLCanvasElement,
  photoSource: CanvasImageSource,
  sheetType: 'a6-2' | 'a5-6',
  widthMm: number,
  heightMm: number,
  presetName: string
): SheetLayoutResult {
  const layout = computeStudioLayout(sheetType, widthMm, heightMm);

  targetCanvas.width = layout.sheetW;
  targetCanvas.height = layout.sheetH;
  const ctx = targetCanvas.getContext('2d');
  if (!ctx) return layout;

  // Fill solid white paper
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, layout.sheetW, layout.sheetH);

  // Draw photos and crop marks
  for (const pos of layout.positions) {
    ctx.drawImage(photoSource, pos.x, pos.y, pos.w, pos.h);
    drawCropMarks(ctx, pos.x, pos.y, pos.w, pos.h);
  }

  // Studio footer caption
  ctx.font = '20px Inter, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'center';
  const paperLabel = sheetType === 'a6-2' ? 'A6' : 'A5';
  ctx.fillText(
    `CompixorAi Passport Studio • ${presetName} • ${paperLabel} (${layout.actualCount} Photos) • Print at 100% Scale / 300 DPI`,
    layout.sheetW / 2,
    layout.sheetH - 24
  );

  return layout;
}

/**
 * Injects 300 DPI JFIF density into JPEG bytes
 */
export function injectJpegDpi300(bytes: Uint8Array): Uint8Array {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return bytes;

  // JFIF APP0 marker: 0xFF, 0xE0, length (16), 'JFIF\0', version 1.1, unit=1 (dpi), density 300, 300, thumb 0, 0
  const jfifApp0 = new Uint8Array([
    0xff, 0xe0, 0x00, 0x10,
    0x4a, 0x46, 0x49, 0x46, 0x00, // 'JFIF\0'
    0x01, 0x01, // v1.1
    0x01, // density unit: 1 = dots per inch
    0x01, 0x2c, // 300 dpi X
    0x01, 0x2c, // 300 dpi Y
    0x00, 0x00, // no thumbnail
  ]);

  // Check if existing APP0 JFIF marker present
  if (bytes[2] === 0xff && bytes[3] === 0xe0 && bytes[6] === 0x4a && bytes[7] === 0x46 && bytes[8] === 0x49 && bytes[9] === 0x46) {
    const app0Len = (bytes[4] << 8) | bytes[5];
    const out = new Uint8Array(bytes.length - (2 + app0Len) + jfifApp0.length);
    out.set(bytes.subarray(0, 2), 0);
    out.set(jfifApp0, 2);
    out.set(bytes.subarray(2 + 2 + app0Len - 2), 2 + jfifApp0.length);
    return out;
  }

  // Insert right after SOI
  const out = new Uint8Array(bytes.length + jfifApp0.length);
  out.set(bytes.subarray(0, 2), 0);
  out.set(jfifApp0, 2);
  out.set(bytes.subarray(2), 2 + jfifApp0.length);
  return out;
}

// Precomputed CRC32 table for PNG chunk injection
const crcTable: Uint32Array = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Injects 300 DPI pHYs chunk (11811 pixels per meter) into PNG bytes
 */
export function injectPngDpi300(bytes: Uint8Array): Uint8Array {
  // Check PNG signature
  if (
    bytes[0] !== 0x89 ||
    bytes[1] !== 0x50 ||
    bytes[2] !== 0x4e ||
    bytes[3] !== 0x47 ||
    bytes[4] !== 0x0d ||
    bytes[5] !== 0x0a ||
    bytes[6] !== 0x1a ||
    bytes[7] !== 0x0a
  ) {
    return bytes;
  }

  // 300 DPI = round(300 / 0.0254) = 11811 px/meter
  const ppm = 11811;
  const chunkData = new Uint8Array(13); // 4 type + 4 x + 4 y + 1 unit
  // Type: 'pHYs'
  chunkData[0] = 0x70;
  chunkData[1] = 0x48;
  chunkData[2] = 0x59;
  chunkData[3] = 0x73;
  // X ppm (big endian)
  chunkData[4] = (ppm >>> 24) & 0xff;
  chunkData[5] = (ppm >>> 16) & 0xff;
  chunkData[6] = (ppm >>> 8) & 0xff;
  chunkData[7] = ppm & 0xff;
  // Y ppm (big endian)
  chunkData[8] = (ppm >>> 24) & 0xff;
  chunkData[9] = (ppm >>> 16) & 0xff;
  chunkData[10] = (ppm >>> 8) & 0xff;
  chunkData[11] = ppm & 0xff;
  // Unit = 1 (meter)
  chunkData[12] = 1;

  const crcVal = crc32(chunkData);

  const fullChunk = new Uint8Array(4 + 13 + 4); // 4 len + 13 (type+data) + 4 crc
  fullChunk[0] = 0;
  fullChunk[1] = 0;
  fullChunk[2] = 0;
  fullChunk[3] = 9; // length of data is 9
  fullChunk.set(chunkData, 4);
  fullChunk[17] = (crcVal >>> 24) & 0xff;
  fullChunk[18] = (crcVal >>> 16) & 0xff;
  fullChunk[19] = (crcVal >>> 8) & 0xff;
  fullChunk[20] = crcVal & 0xff;

  // Insert immediately after IHDR chunk (signature: 8 bytes + IHDR length (4) + 'IHDR' (4) + data (13) + crc (4) = 33 bytes)
  const insertPos = 33;
  const out = new Uint8Array(bytes.length + fullChunk.length);
  out.set(bytes.subarray(0, insertPos), 0);
  out.set(fullChunk, insertPos);
  out.set(bytes.subarray(insertPos), insertPos + fullChunk.length);
  return out;
}

/**
 * Reads back DPI from image bytes to verify 300 DPI metadata injection
 */
export function readImageDpi(bytes: Uint8Array): { dpiX: number; dpiY: number } | null {
  // JPEG check
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    for (let i = 2; i < bytes.length - 10; i++) {
      if (bytes[i] === 0xff && bytes[i + 1] === 0xe0 && bytes[i + 4] === 0x4a && bytes[i + 5] === 0x46) {
        const unit = bytes[i + 11];
        const dpiX = (bytes[i + 12] << 8) | bytes[i + 13];
        const dpiY = (bytes[i + 14] << 8) | bytes[i + 15];
        if (unit === 1) return { dpiX, dpiY };
      }
    }
  }

  // PNG check
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e) {
    for (let i = 8; i < bytes.length - 12; i++) {
      if (
        bytes[i] === 0x70 &&
        bytes[i + 1] === 0x48 &&
        bytes[i + 2] === 0x59 &&
        bytes[i + 3] === 0x73
      ) {
        const xPpm = (bytes[i + 4] << 24) | (bytes[i + 5] << 16) | (bytes[i + 6] << 8) | bytes[i + 7];
        const yPpm = (bytes[i + 8] << 24) | (bytes[i + 9] << 16) | (bytes[i + 10] << 8) | bytes[i + 11];
        const unit = bytes[i + 12];
        if (unit === 1) {
          return {
            dpiX: Math.round(xPpm * 0.0254),
            dpiY: Math.round(yPpm * 0.0254),
          };
        }
      }
    }
  }

  return null;
}

/**
 * Generates an exact millimeter-dimension PDF document for A6 or A5 sheet
 */
export async function generateStudioPdf(
  photoDataUrl: string,
  sheetType: 'a6-2' | 'a5-6',
  widthMm: number,
  heightMm: number,
  presetName: string
): Promise<Uint8Array> {
  const spec = STUDIO_SHEET_PRESETS[sheetType];
  const layout = computeStudioLayout(sheetType, widthMm, heightMm);

  // PDF dimensions in points: 1 mm = 72 / 25.4 points ≈ 2.83465 pt
  const MM_TO_PT = 72 / 25.4;
  const pageWidthPt = spec.paperWidthMm * MM_TO_PT;
  const pageHeightPt = spec.paperHeightMm * MM_TO_PT;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([pageWidthPt, pageHeightPt]);

  // Embed photo
  const imageBytes = await (await fetch(photoDataUrl)).arrayBuffer();
  let embeddedImage;
  if (photoDataUrl.startsWith('data:image/png')) {
    embeddedImage = await pdfDoc.embedPng(imageBytes);
  } else {
    embeddedImage = await pdfDoc.embedJpg(imageBytes);
  }

  const photoWidthPt = widthMm * MM_TO_PT;
  const photoHeightPt = heightMm * MM_TO_PT;
  const gapPt = spec.gapMm * MM_TO_PT;

  if (sheetType === 'a6-2') {
    const totalW = layout.actualCount * photoWidthPt + (layout.actualCount - 1) * gapPt;
    const startXPt = (pageWidthPt - totalW) / 2;
    const startYPt = (pageHeightPt - photoHeightPt) / 2;

    for (let i = 0; i < layout.actualCount; i++) {
      const x = startXPt + i * (photoWidthPt + gapPt);
      // In PDF coordinate system, origin is bottom-left
      page.drawImage(embeddedImage, {
        x,
        y: startYPt,
        width: photoWidthPt,
        height: photoHeightPt,
      });
    }
  } else {
    // A5: 3 columns x 2 rows (or reduced)
    const cols = layout.cols;
    const rows = layout.rows;
    const totalW = cols * photoWidthPt + (cols - 1) * gapPt;
    const totalH = rows * photoHeightPt + (rows - 1) * gapPt;
    const startXPt = (pageWidthPt - totalW) / 2;
    const startYPt = (pageHeightPt - totalH) / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startXPt + c * (photoWidthPt + gapPt);
        // Flip y for PDF bottom-left coordinate system
        const y = pageHeightPt - (startYPt + (r + 1) * photoHeightPt + r * gapPt);
        page.drawImage(embeddedImage, {
          x,
          y,
          width: photoWidthPt,
          height: photoHeightPt,
        });
      }
    }
  }

  return await pdfDoc.save();
}
