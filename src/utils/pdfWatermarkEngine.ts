import {
  PDFDocument,
  PDFName,
  PDFArray,
  PDFRef,
  PDFStream,
  PDFRawStream,
  PDFDict,
  StandardFonts,
  degreesToRadians,
} from 'pdf-lib';
import pako from 'pako';

export type WatermarkFontFamily = 'Helvetica' | 'TimesRoman' | 'Courier';
export type WatermarkFontStyle = 'regular' | 'bold' | 'italic' | 'bold-italic';
export type WatermarkLayout = 'center-single' | 'tiled' | 'diagonal-tiled' | 'corners';
export type WatermarkLayer = 'foreground' | 'background';
export type WatermarkPageRangeType = 'all' | 'current' | 'custom';
export type RenderQuality = 'draft' | 'good' | 'best';

export interface TextWatermarkOptions {
  text: string;
  fontFamily: WatermarkFontFamily;
  fontStyle: WatermarkFontStyle;
  fontSize: number; // in pt
  color: string; // Hex e.g. '#ff0000' or rgb string
  opacity: number; // 0 to 100
  rotation: number; // -180 to 180 degrees
  layer: WatermarkLayer;
  layout: WatermarkLayout;
  pageRange: WatermarkPageRangeType;
  customPages?: string;
  currentPageIndex?: number;
}

export interface ImageWatermarkOptions {
  imageData: Uint8Array;
  imageFormat: 'png' | 'jpeg';
  scale: number; // 10 to 300 percent
  opacity: number; // 0 to 100
  rotation: number; // degrees
  layer: WatermarkLayer;
  layout: WatermarkLayout;
  pageRange: WatermarkPageRangeType;
  customPages?: string;
  currentPageIndex?: number;
}

export interface RedactionBox {
  x: number; // PDF points (bottom-left origin)
  y: number;
  width: number;
  height: number;
  color?: string; // Hex color for patch, default '#ffffff'
}

// Convert Hex string to RGB (0-1 range for pdf-lib)
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (cleaned.length !== 6) {
    return { r: 0.5, g: 0.5, b: 0.5 };
  }
  const intVal = parseInt(cleaned, 16);
  return {
    r: ((intVal >> 16) & 255) / 255,
    g: ((intVal >> 8) & 255) / 255,
    b: (intVal & 255) / 255,
  };
}

// Helper to select StandardFont variant
export function getStandardFontName(
  family: WatermarkFontFamily,
  style: WatermarkFontStyle
): StandardFonts {
  switch (family) {
    case 'TimesRoman':
      if (style === 'bold') return StandardFonts.TimesRomanBold;
      if (style === 'italic') return StandardFonts.TimesRomanItalic;
      if (style === 'bold-italic') return StandardFonts.TimesRomanBoldItalic;
      return StandardFonts.TimesRoman;
    case 'Courier':
      if (style === 'bold') return StandardFonts.CourierBold;
      if (style === 'italic') return StandardFonts.CourierOblique;
      if (style === 'bold-italic') return StandardFonts.CourierBoldOblique;
      return StandardFonts.Courier;
    case 'Helvetica':
    default:
      if (style === 'bold') return StandardFonts.HelveticaBold;
      if (style === 'italic') return StandardFonts.HelveticaOblique;
      if (style === 'bold-italic') return StandardFonts.HelveticaBoldOblique;
      return StandardFonts.Helvetica;
  }
}

// Helper to parse page range string like "1, 3-5, 8" into 0-indexed page numbers
export function parsePageRange(
  rangeType: WatermarkPageRangeType,
  totalPages: number,
  currentPageIndex = 0,
  customRange = ''
): number[] {
  if (rangeType === 'all') {
    return Array.from({ length: totalPages }, (_, i) => i);
  }
  if (rangeType === 'current') {
    return currentPageIndex >= 0 && currentPageIndex < totalPages ? [currentPageIndex] : [0];
  }

  // Custom range
  const indices = new Set<number>();
  const parts = customRange.split(',').map((p) => p.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const lower = Math.min(start, end);
        const upper = Math.max(start, end);
        for (let i = lower; i <= upper; i++) {
          if (i >= 1 && i <= totalPages) {
            indices.add(i - 1);
          }
        }
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        indices.add(pageNum - 1);
      }
    }
  }

  const result = Array.from(indices).sort((a, b) => a - b);
  return result.length > 0 ? result : [0];
}

// Compute grid positions for tiled text watermarks
export function calculateTextPositions(
  pageWidth: number,
  pageHeight: number,
  textWidth: number,
  textHeight: number,
  layout: WatermarkLayout,
  rotationDegrees: number
): Array<{ x: number; y: number }> {
  switch (layout) {
    case 'center-single': {
      const centerX = (pageWidth - textWidth) / 2;
      const centerY = (pageHeight - textHeight) / 2;
      return [{ x: centerX, y: centerY }];
    }

    case 'tiled': {
      const stepX = Math.max(textWidth + 80, 160);
      const stepY = Math.max(textHeight + 100, 140);
      const positions: Array<{ x: number; y: number }> = [];

      const startX = -stepX * 0.5;
      const endX = pageWidth + stepX * 0.5;
      const startY = -stepY * 0.5;
      const endY = pageHeight + stepY * 0.5;

      for (let y = startY; y <= endY; y += stepY) {
        for (let x = startX; x <= endX; x += stepX) {
          positions.push({ x, y });
        }
      }
      return positions;
    }

    case 'diagonal-tiled': {
      const stepX = Math.max(textWidth + 100, 180);
      const stepY = Math.max(textHeight + 120, 160);
      const positions: Array<{ x: number; y: number }> = [];

      const startX = -stepX;
      const endX = pageWidth + stepX;
      const startY = -stepY;
      const endY = pageHeight + stepY;

      let row = 0;
      for (let y = startY; y <= endY; y += stepY) {
        const xOffset = (row % 2) * (stepX / 2);
        for (let x = startX + xOffset; x <= endX; x += stepX) {
          positions.push({ x, y });
        }
        row++;
      }
      return positions;
    }

    case 'corners': {
      const margin = 36; // 0.5 inch from border
      return [
        { x: margin, y: pageHeight - margin - textHeight }, // Top-Left
        { x: Math.max(margin, pageWidth - margin - textWidth), y: pageHeight - margin - textHeight }, // Top-Right
        { x: margin, y: margin }, // Bottom-Left
        { x: Math.max(margin, pageWidth - margin - textWidth), y: margin }, // Bottom-Right
      ];
    }
  }
}

// Compute grid positions for image watermarks
export function calculateImagePositions(
  pageWidth: number,
  pageHeight: number,
  imgWidth: number,
  imgHeight: number,
  layout: WatermarkLayout
): Array<{ x: number; y: number }> {
  switch (layout) {
    case 'center-single':
      return [{ x: (pageWidth - imgWidth) / 2, y: (pageHeight - imgHeight) / 2 }];
    case 'tiled': {
      const stepX = Math.max(imgWidth + 60, 140);
      const stepY = Math.max(imgHeight + 60, 140);
      const positions: Array<{ x: number; y: number }> = [];
      for (let y = -stepY * 0.3; y <= pageHeight + stepY * 0.3; y += stepY) {
        for (let x = -stepX * 0.3; x <= pageWidth + stepX * 0.3; x += stepX) {
          positions.push({ x, y });
        }
      }
      return positions;
    }
    case 'diagonal-tiled': {
      const stepX = Math.max(imgWidth + 80, 160);
      const stepY = Math.max(imgHeight + 80, 160);
      const positions: Array<{ x: number; y: number }> = [];
      let row = 0;
      for (let y = -stepY * 0.3; y <= pageHeight + stepY * 0.3; y += stepY) {
        const offset = (row % 2) * (stepX / 2);
        for (let x = -stepX * 0.3 + offset; x <= pageWidth + stepX * 0.3; x += stepX) {
          positions.push({ x, y });
        }
        row++;
      }
      return positions;
    }
    case 'corners': {
      const margin = 36;
      return [
        { x: margin, y: pageHeight - margin - imgHeight },
        { x: Math.max(margin, pageWidth - margin - imgWidth), y: pageHeight - margin - imgHeight },
        { x: margin, y: margin },
        { x: Math.max(margin, pageWidth - margin - imgWidth), y: margin },
      ];
    }
  }
}

/**
 * Ensures page Contents is represented as a PDFArray of stream references,
 * returning the array of stream refs.
 */
function getPageContentsArray(doc: PDFDocument, pageNode: PDFDict): PDFArray {
  const contentsKey = PDFName.of('Contents');
  const existing = pageNode.get(contentsKey);

  if (!existing) {
    const arr = doc.context.obj([]);
    pageNode.set(contentsKey, arr);
    return arr;
  }

  if (existing instanceof PDFArray) {
    return existing;
  }

  if (existing instanceof PDFRef) {
    const deref = doc.context.lookup(existing);
    if (deref instanceof PDFArray) {
      return deref;
    }
    // Single stream ref, wrap into an array
    const newArr = doc.context.obj([existing]);
    pageNode.set(contentsKey, newArr);
    return newArr;
  }

  const arr = doc.context.obj([]);
  pageNode.set(contentsKey, arr);
  return arr;
}

/**
 * 1. ADD TEXT WATERMARK
 * Implemented as a dedicated, tagged content stream per page.
 * Keeps original content stream(s) completely untouched for byte-identical round-tripping.
 */
export async function addTextWatermark(
  pdfBytes: ArrayBuffer | Uint8Array,
  options: TextWatermarkOptions
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = doc.getPageCount();
  const targetIndices = parsePageRange(
    options.pageRange,
    totalPages,
    options.currentPageIndex,
    options.customPages
  );

  const fontName = getStandardFontName(options.fontFamily, options.fontStyle);
  const font = await doc.embedFont(fontName);
  const colorRgb = hexToRgb(options.color);
  const normalizedOpacity = Math.max(0.01, Math.min(1, options.opacity / 100));

  const textWidth = font.widthOfTextAtSize(options.text, options.fontSize);
  const textHeight = font.heightAtSize(options.fontSize);

  for (const pageIdx of targetIndices) {
    const page = doc.getPage(pageIdx);
    const { width: pageWidth, height: pageHeight } = page.getSize();

    const positions = calculateTextPositions(
      pageWidth,
      pageHeight,
      textWidth,
      textHeight,
      options.layout,
      options.rotation
    );

    // Font resource in page Resources
    const fontRefKey = `CWFont_${Math.random().toString(36).substring(2, 7)}`;
    const resources = page.node.get(PDFName.of('Resources'));
    let resDict: PDFDict;
    if (resources instanceof PDFRef) {
      resDict = doc.context.lookup(resources) as PDFDict;
    } else if (resources instanceof PDFDict) {
      resDict = resources;
    } else {
      resDict = doc.context.obj({});
      page.node.set(PDFName.of('Resources'), resDict);
    }

    let fontDict: PDFDict;
    const existingFont = resDict.get(PDFName.of('Font'));
    if (existingFont instanceof PDFDict) {
      fontDict = existingFont;
    } else if (existingFont instanceof PDFRef) {
      const lookedUp = doc.context.lookup(existingFont);
      if (lookedUp instanceof PDFDict) {
        fontDict = lookedUp;
      } else {
        fontDict = doc.context.obj({});
        resDict.set(PDFName.of('Font'), fontDict);
      }
    } else {
      fontDict = doc.context.obj({});
      resDict.set(PDFName.of('Font'), fontDict);
    }
    fontDict.set(PDFName.of(fontRefKey), font.ref);

    // Build ExtGState for opacity
    const gsKey = `CWGS_${Math.round(normalizedOpacity * 100)}`;
    let extGStateDict: PDFDict;
    const existingExtGState = resDict.get(PDFName.of('ExtGState'));
    if (existingExtGState instanceof PDFDict) {
      extGStateDict = existingExtGState;
    } else if (existingExtGState instanceof PDFRef) {
      const lookedUp = doc.context.lookup(existingExtGState);
      if (lookedUp instanceof PDFDict) {
        extGStateDict = lookedUp;
      } else {
        extGStateDict = doc.context.obj({});
        resDict.set(PDFName.of('ExtGState'), extGStateDict);
      }
    } else {
      extGStateDict = doc.context.obj({});
      resDict.set(PDFName.of('ExtGState'), extGStateDict);
    }
    const gsEntry = doc.context.obj({
      Type: 'ExtGState',
      ca: normalizedOpacity,
      CA: normalizedOpacity,
    });
    extGStateDict.set(PDFName.of(gsKey), gsEntry);

    const rad = degreesToRadians(options.rotation);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    // Escape PDF string
    const escapedText = options.text
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');

    let streamStr = `/Artifact /CompixorWatermark << /Type /Watermark /Creator (Compixor) >> BDC\n`;
    streamStr += `q\n`;
    streamStr += `/${gsKey} gs\n`;

    for (const pos of positions) {
      streamStr += `q\n`;
      const cx = textWidth / 2;
      const cy = textHeight / 2;
      streamStr += `1 0 0 1 ${pos.x.toFixed(2)} ${pos.y.toFixed(2)} cm\n`;
      streamStr += `1 0 0 1 ${cx.toFixed(2)} ${cy.toFixed(2)} cm\n`;
      streamStr += `${cos.toFixed(5)} ${sin.toFixed(5)} ${(-sin).toFixed(5)} ${cos.toFixed(5)} 0 0 cm\n`;
      streamStr += `1 0 0 1 ${(-cx).toFixed(2)} ${(-cy * 0.7).toFixed(2)} cm\n`;
      streamStr += `BT\n`;
      streamStr += `/${fontRefKey} ${options.fontSize} Tf\n`;
      streamStr += `${colorRgb.r.toFixed(3)} ${colorRgb.g.toFixed(3)} ${colorRgb.b.toFixed(3)} rg\n`;
      streamStr += `(${escapedText}) Tj\n`;
      streamStr += `ET\n`;
      streamStr += `Q\n`;
    }

    streamStr += `Q\n`;
    streamStr += `EMC\n`;

    const streamBytes = new TextEncoder().encode(streamStr);
    const watermarkStream = doc.context.stream(streamBytes, {
      Filter: undefined,
      CompixorWatermark: true,
      CompixorWatermarkType: 'text',
    });
    const watermarkStreamRef = doc.context.register(watermarkStream);

    const contentsArray = getPageContentsArray(doc, page.node);
    if (options.layer === 'background') {
      contentsArray.insert(0, watermarkStreamRef);
    } else {
      // Graphics State Isolation:
      // In many PDFs (e.g. single-stream exports or table invoices), prior streams modify the CTM
      // or clipping path (re W n) without restoring them via Q.
      // We wrap prior streams in q ... Q so the watermark executes in a pristine default graphics state.
      const qStream = doc.context.stream(new TextEncoder().encode('q\n'), {
        CompixorIsolation: true,
      });
      const qStreamRef = doc.context.register(qStream);
      const QStream = doc.context.stream(new TextEncoder().encode('Q\n'), {
        CompixorIsolation: true,
      });
      const QStreamRef = doc.context.register(QStream);

      contentsArray.insert(0, qStreamRef);
      contentsArray.push(QStreamRef);
      contentsArray.push(watermarkStreamRef);
    }
  }

  return await doc.save();
}

/**
 * 2. ADD IMAGE WATERMARK
 * Embeds image as an XObject and creates a tagged watermark stream.
 */
export async function addImageWatermark(
  pdfBytes: ArrayBuffer | Uint8Array,
  options: ImageWatermarkOptions
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = doc.getPageCount();
  const targetIndices = parsePageRange(
    options.pageRange,
    totalPages,
    options.currentPageIndex,
    options.customPages
  );

  let embeddedImage;
  if (options.imageFormat === 'png') {
    embeddedImage = await doc.embedPng(options.imageData);
  } else {
    embeddedImage = await doc.embedJpg(options.imageData);
  }

  const { width: origWidth, height: origHeight } = embeddedImage;
  const scaleRatio = Math.max(0.05, options.scale / 100);
  const targetWidth = origWidth * scaleRatio;
  const targetHeight = origHeight * scaleRatio;
  const normalizedOpacity = Math.max(0.01, Math.min(1, options.opacity / 100));

  for (const pageIdx of targetIndices) {
    const page = doc.getPage(pageIdx);
    const { width: pageWidth, height: pageHeight } = page.getSize();

    const positions = calculateImagePositions(
      pageWidth,
      pageHeight,
      targetWidth,
      targetHeight,
      options.layout
    );

    // Resources & XObject
    const resources = page.node.get(PDFName.of('Resources'));
    let resDict: PDFDict;
    if (resources instanceof PDFRef) {
      resDict = doc.context.lookup(resources) as PDFDict;
    } else if (resources instanceof PDFDict) {
      resDict = resources;
    } else {
      resDict = doc.context.obj({});
      page.node.set(PDFName.of('Resources'), resDict);
    }

    let xObjectDict: PDFDict;
    const existingXObject = resDict.get(PDFName.of('XObject'));
    if (existingXObject instanceof PDFDict) {
      xObjectDict = existingXObject;
    } else if (existingXObject instanceof PDFRef) {
      const lookedUp = doc.context.lookup(existingXObject);
      if (lookedUp instanceof PDFDict) {
        xObjectDict = lookedUp;
      } else {
        xObjectDict = doc.context.obj({});
        resDict.set(PDFName.of('XObject'), xObjectDict);
      }
    } else {
      xObjectDict = doc.context.obj({});
      resDict.set(PDFName.of('XObject'), xObjectDict);
    }
    const imgXKey = `CompixorWatermarkImage_${Math.random().toString(36).substring(2, 7)}`;
    xObjectDict.set(PDFName.of(imgXKey), embeddedImage.ref);

    // ExtGState for opacity
    const gsKey = `CWGS_${Math.round(normalizedOpacity * 100)}`;
    let extGStateDict: PDFDict;
    const existingExtGState = resDict.get(PDFName.of('ExtGState'));
    if (existingExtGState instanceof PDFDict) {
      extGStateDict = existingExtGState;
    } else if (existingExtGState instanceof PDFRef) {
      const lookedUp = doc.context.lookup(existingExtGState);
      if (lookedUp instanceof PDFDict) {
        extGStateDict = lookedUp;
      } else {
        extGStateDict = doc.context.obj({});
        resDict.set(PDFName.of('ExtGState'), extGStateDict);
      }
    } else {
      extGStateDict = doc.context.obj({});
      resDict.set(PDFName.of('ExtGState'), extGStateDict);
    }
    const gsEntry = doc.context.obj({
      Type: 'ExtGState',
      ca: normalizedOpacity,
      CA: normalizedOpacity,
    });
    extGStateDict.set(PDFName.of(gsKey), gsEntry);

    const rad = degreesToRadians(options.rotation);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    let streamStr = `/Artifact /CompixorWatermark << /Type /Watermark /Creator (Compixor) >> BDC\n`;
    streamStr += `q\n`;
    streamStr += `/${gsKey} gs\n`;

    for (const pos of positions) {
      streamStr += `q\n`;
      const cx = targetWidth / 2;
      const cy = targetHeight / 2;
      streamStr += `1 0 0 1 ${pos.x.toFixed(2)} ${pos.y.toFixed(2)} cm\n`;
      streamStr += `1 0 0 1 ${cx.toFixed(2)} ${cy.toFixed(2)} cm\n`;
      streamStr += `${cos.toFixed(5)} ${sin.toFixed(5)} ${(-sin).toFixed(5)} ${cos.toFixed(5)} 0 0 cm\n`;
      streamStr += `1 0 0 1 ${(-cx).toFixed(2)} ${(-cy).toFixed(2)} cm\n`;
      streamStr += `${targetWidth.toFixed(2)} 0 0 ${targetHeight.toFixed(2)} 0 0 cm\n`;
      streamStr += `/${imgXKey} Do\n`;
      streamStr += `Q\n`;
    }

    streamStr += `Q\n`;
    streamStr += `EMC\n`;

    const streamBytes = new TextEncoder().encode(streamStr);
    const watermarkStream = doc.context.stream(streamBytes, {
      Filter: undefined,
      CompixorWatermark: true,
      CompixorWatermarkType: 'image',
    });
    const watermarkStreamRef = doc.context.register(watermarkStream);

    const contentsArray = getPageContentsArray(doc, page.node);
    if (options.layer === 'background') {
      contentsArray.insert(0, watermarkStreamRef);
    } else {
      // Graphics State Isolation
      const qStream = doc.context.stream(new TextEncoder().encode('q\n'), {
        CompixorIsolation: true,
      });
      const qStreamRef = doc.context.register(qStream);
      const QStream = doc.context.stream(new TextEncoder().encode('Q\n'), {
        CompixorIsolation: true,
      });
      const QStreamRef = doc.context.register(QStream);

      contentsArray.insert(0, qStreamRef);
      contentsArray.push(QStreamRef);
      contentsArray.push(watermarkStreamRef);
    }
  }

  return await doc.save();
}

/**
 * 3. REMOVE WATERMARK
 * Exactly and losslessly removes any watermarks added by Compixor.
 * Returns the cleaned PDF bytes and the count of removed watermark layers.
 */
export async function removeCompixorWatermarks(
  pdfBytes: ArrayBuffer | Uint8Array
): Promise<{ pdfBytes: Uint8Array; removedCount: number }> {
  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  let removedCount = 0;
  const pages = doc.getPages();

  for (const page of pages) {
    const contentsKey = PDFName.of('Contents');
    const contents = page.node.get(contentsKey);
    if (!contents) continue;

    const streamsToCheck: Array<{ ref?: PDFRef; stream: PDFStream | PDFRawStream }> = [];

    if (contents instanceof PDFRef) {
      const deref = doc.context.lookup(contents);
      if (deref instanceof PDFArray) {
        for (let i = 0; i < deref.size(); i++) {
          const item = deref.get(i);
          if (item instanceof PDFRef) {
            const s = doc.context.lookup(item);
            if (s instanceof PDFStream || s instanceof PDFRawStream) {
              streamsToCheck.push({ ref: item, stream: s });
            }
          }
        }
      } else if (deref instanceof PDFStream || deref instanceof PDFRawStream) {
        streamsToCheck.push({ ref: contents, stream: deref });
      }
    } else if (contents instanceof PDFArray) {
      for (let i = 0; i < contents.size(); i++) {
        const item = contents.get(i);
        if (item instanceof PDFRef) {
          const s = doc.context.lookup(item);
          if (s instanceof PDFStream || s instanceof PDFRawStream) {
            streamsToCheck.push({ ref: item, stream: s });
          }
        }
      }
    }

    const refsToRemove = new Set<PDFRef>();

    for (const { ref, stream } of streamsToCheck) {
      // Check 1: Dictionary flag
      const isWatermark = stream.dict.get(PDFName.of('CompixorWatermark'));
      const isIsolation = stream.dict.get(PDFName.of('CompixorIsolation'));
      if (isWatermark || isIsolation) {
        if (ref) refsToRemove.add(ref);
        if (isWatermark) removedCount++;
        continue;
      }

      // Check 2: Content inspection for /Artifact /CompixorWatermark
      let rawBytes: Uint8Array | null = null;
      if (stream instanceof PDFRawStream) {
        rawBytes = stream.contents;
      } else if ('contents' in stream) {
        rawBytes = (stream as unknown as { contents: Uint8Array }).contents;
      }

      if (rawBytes) {
        let textContent = '';
        try {
          const filter = stream.dict.get(PDFName.of('Filter'));
          if (filter === PDFName.of('FlateDecode')) {
            const decompressed = pako.inflate(rawBytes);
            textContent = new TextDecoder().decode(decompressed);
          } else {
            textContent = new TextDecoder().decode(rawBytes);
          }
        } catch {
          textContent = new TextDecoder().decode(rawBytes.slice(0, 500));
        }

        if (textContent.includes('/CompixorWatermark')) {
          if (ref) refsToRemove.add(ref);
          removedCount++;
        }
      }
    }

    // Remove from page Contents array
    if (refsToRemove.size > 0) {
      if (contents instanceof PDFArray) {
        for (let i = contents.size() - 1; i >= 0; i--) {
          const item = contents.get(i);
          if (item instanceof PDFRef && refsToRemove.has(item)) {
            contents.remove(i);
          }
        }
      } else if (contents instanceof PDFRef) {
        const deref = doc.context.lookup(contents);
        if (deref instanceof PDFArray) {
          for (let i = deref.size() - 1; i >= 0; i--) {
            const item = deref.get(i);
            if (item instanceof PDFRef && refsToRemove.has(item)) {
              deref.remove(i);
            }
          }
        } else if (refsToRemove.has(contents)) {
          page.node.delete(contentsKey);
        }
      }

      // Clean up from context
      refsToRemove.forEach((ref) => {
        try {
          doc.context.delete(ref);
        } catch {}
      });

      // Clean up any Compixor XObjects from Resources
      const resources = page.node.get(PDFName.of('Resources'));
      let resDict: PDFDict | null = null;
      if (resources instanceof PDFRef) {
        resDict = doc.context.lookup(resources) as PDFDict;
      } else if (resources instanceof PDFDict) {
        resDict = resources;
      }

      if (resDict) {
        const xObj = resDict.get(PDFName.of('XObject'));
        if (xObj instanceof PDFDict) {
          const entries = xObj.entries();
          for (const [key] of entries) {
            if (key.asString().startsWith('CompixorWatermarkImage_')) {
              xObj.delete(key);
            }
          }
        }
      }
    }
  }

  const saved = await doc.save();
  return { pdfBytes: saved, removedCount };
}

/**
 * 4. GENERIC WATERMARK REMOVAL / REDACTION FOR FOREIGN PDFs
 * Mode A: Remove text blocks matching a specific string from content stream.
 * Mode B: Redact / erase bounding box (clean vector patch).
 */
export async function removeGenericTextWatermark(
  pdfBytes: ArrayBuffer | Uint8Array,
  searchString: string,
  pageIndices?: number[]
): Promise<{ pdfBytes: Uint8Array; matchesRemoved: number }> {
  if (!searchString.trim()) {
    return { pdfBytes: new Uint8Array(pdfBytes), matchesRemoved: 0 };
  }

  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  let matchesRemoved = 0;
  const pages = doc.getPages();
  const targetPages = pageIndices || Array.from({ length: pages.length }, (_, i) => i);

  for (const pageIdx of targetPages) {
    if (pageIdx < 0 || pageIdx >= pages.length) continue;
    const page = pages[pageIdx];
    const contentsKey = PDFName.of('Contents');
    const contents = page.node.get(contentsKey);
    if (!contents) continue;

    const streamRefs: PDFRef[] = [];
    if (contents instanceof PDFRef) {
      const deref = doc.context.lookup(contents);
      if (deref instanceof PDFArray) {
        for (let i = 0; i < deref.size(); i++) {
          const item = deref.get(i);
          if (item instanceof PDFRef) streamRefs.push(item);
        }
      } else {
        streamRefs.push(contents);
      }
    } else if (contents instanceof PDFArray) {
      for (let i = 0; i < contents.size(); i++) {
        const item = contents.get(i);
        if (item instanceof PDFRef) streamRefs.push(item);
      }
    }

    for (const ref of streamRefs) {
      const obj = doc.context.lookup(ref);
      if (!(obj instanceof PDFStream || obj instanceof PDFRawStream)) continue;

      let rawBytes: Uint8Array | null = null;
      if (obj instanceof PDFRawStream) {
        rawBytes = obj.contents;
      } else if ('contents' in obj) {
        rawBytes = (obj as unknown as { contents: Uint8Array }).contents;
      }
      if (!rawBytes) continue;

      const isFlate = obj.dict.get(PDFName.of('Filter')) === PDFName.of('FlateDecode');
      let streamText = '';
      try {
        if (isFlate) {
          const inflated = pako.inflate(rawBytes);
          streamText = new TextDecoder().decode(inflated);
        } else {
          streamText = new TextDecoder().decode(rawBytes);
        }
      } catch {
        continue;
      }

      // Check if searchString appears in stream (either literal or hex-encoded)
      const searchLower = searchString.trim().toLowerCase();
      const hexSearch = Array.from(new TextEncoder().encode(searchString.trim()))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
        .toLowerCase();

      // Decode hex strings like <436F6E66...> or <004C002F...> into readable ASCII for inspection
      const decodedInspectionText = streamText.replace(/<([0-9a-fA-F]+)>/g, (_, hex) => {
        let ascii2 = '';
        if (hex.length >= 4 && hex.length % 4 === 0) {
          for (let i = 0; i < hex.length; i += 4) {
            const charCode = parseInt(hex.substring(i, i + 4), 16);
            if (charCode >= 32 && charCode <= 126) {
              ascii2 += String.fromCharCode(charCode);
            }
          }
        }
        let ascii1 = '';
        for (let i = 0; i < hex.length; i += 2) {
          const byte = parseInt(hex.substring(i, i + 2), 16);
          if (byte >= 32 && byte <= 126) {
            ascii1 += String.fromCharCode(byte);
          }
        }
        return `(${ascii2} ${ascii1})`;
      });

      const containsSearch =
        streamText.toLowerCase().includes(searchLower) ||
        streamText.toLowerCase().includes(hexSearch) ||
        decodedInspectionText.toLowerCase().includes(searchLower) ||
        decodedInspectionText.toLowerCase().replace(/\s+/g, '').includes(searchLower.replace(/\s+/g, ''));

      if (containsSearch) {
        // Strategy: Parse BT ... ET text blocks
        const btEtRegex = /BT[\s\S]*?ET/g;
        let modifiedText = streamText.replace(btEtRegex, (match) => {
          const blockDecoded = match.replace(/<([0-9a-fA-F]+)>/g, (_, hex) => {
            let ascii2 = '';
            if (hex.length >= 4 && hex.length % 4 === 0) {
              for (let i = 0; i < hex.length; i += 4) {
                const charCode = parseInt(hex.substring(i, i + 4), 16);
                if (charCode >= 32 && charCode <= 126) {
                  ascii2 += String.fromCharCode(charCode);
                }
              }
            }
            let ascii1 = '';
            for (let i = 0; i < hex.length; i += 2) {
              const byte = parseInt(hex.substring(i, i + 2), 16);
              if (byte >= 32 && byte <= 126) {
                ascii1 += String.fromCharCode(byte);
              }
            }
            return `(${ascii2} ${ascii1})`;
          });

          if (
            match.toLowerCase().includes(searchLower) ||
            match.toLowerCase().includes(hexSearch) ||
            blockDecoded.toLowerCase().includes(searchLower) ||
            blockDecoded.toLowerCase().replace(/\s+/g, '').includes(searchLower.replace(/\s+/g, ''))
          ) {
            matchesRemoved++;
            return ''; // Remove matching text block
          }
          return match;
        });

        // Also check standalone Tj / TJ lines in case not wrapped strictly
        const escapedSearch = searchString.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const tjRegex = new RegExp(`\\([^)]*${escapedSearch}[^)]*\\)\\s*Tj`, 'gi');
        modifiedText = modifiedText.replace(tjRegex, () => {
          matchesRemoved++;
          return '() Tj';
        });

        const modifiedBytes = new TextEncoder().encode(modifiedText);
        if (isFlate) {
          const deflated = pako.deflate(modifiedBytes);
          const newStream = doc.context.stream(deflated, {
            Filter: 'FlateDecode',
          });
          doc.context.assign(ref, newStream);
        } else {
          const newStream = doc.context.stream(modifiedBytes);
          doc.context.assign(ref, newStream);
        }
      }
    }
  }

  const saved = await doc.save();
  return { pdfBytes: saved, matchesRemoved };
}

/**
 * Redact / Erase Area
 * Draws a clean vector rectangle (matching white or specified background) over the user-selected box.
 */
export async function redactAreaOnPage(
  pdfBytes: ArrayBuffer | Uint8Array,
  pageIndex: number,
  box: RedactionBox
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  if (pageIndex < 0 || pageIndex >= doc.getPageCount()) {
    return new Uint8Array(pdfBytes);
  }

  const page = doc.getPage(pageIndex);
  const color = hexToRgb(box.color || '#ffffff');

  // Vector operator for filling rectangle:
  // q
  // r g b rg
  // x y w h re
  // f
  // Q
  const opStr = `\nq\n${color.r.toFixed(3)} ${color.g.toFixed(3)} ${color.b.toFixed(3)} rg\n${box.x.toFixed(2)} ${box.y.toFixed(2)} ${box.width.toFixed(2)} ${box.height.toFixed(2)} re\nf\nQ\n`;
  const opBytes = new TextEncoder().encode(opStr);

  const redactStream = doc.context.stream(opBytes, {
    Filter: undefined,
    CompixorRedaction: true,
  });
  const redactStreamRef = doc.context.register(redactStream);

  const contentsArray = getPageContentsArray(doc, page.node);
  contentsArray.push(redactStreamRef);

  return await doc.save();
}

/**
 * Helper to convert canvas click/box coordinates (origin top-left, scaled)
 * to PDF points (origin bottom-left, 72 pt/inch).
 */
export function canvasCoordsToPdf(
  canvasX: number,
  canvasY: number,
  canvasWidth: number,
  canvasHeight: number,
  pdfWidth: number,
  pdfHeight: number
): { x: number; y: number } {
  const scaleX = pdfWidth / canvasWidth;
  const scaleY = pdfHeight / canvasHeight;

  const x = canvasX * scaleX;
  const y = (canvasHeight - canvasY) * scaleY;

  return { x, y };
}

// ─────────────────────────────────────────────────────────────────────────────
// SMART ENGINE HELPERS (Engine A Upgrade)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Decode a PDF hex string like <004D004F004C...> (UTF-16BE) or <4D4F4C...> (Latin-1)
 * into a plain JS string for keyword matching.
 * This catches custom watermarks like "MOLVI SAQIB" stored as hex in PDF streams.
 */
function decodeHexPdfString(hex: string): string {
  hex = hex.trim();
  // Try UTF-16BE first: groups of 4 hex chars
  if (hex.length >= 4 && hex.length % 4 === 0) {
    let decoded = '';
    for (let i = 0; i < hex.length; i += 4) {
      const code = parseInt(hex.substring(i, i + 4), 16);
      if (code > 0) decoded += String.fromCharCode(code);
    }
    if (decoded.length > 0 && /[a-zA-Z\u0600-\u06FF]/.test(decoded)) return decoded;
  }
  // Latin-1 fallback: groups of 2 hex chars
  let decoded = '';
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.substring(i, i + 2), 16);
    if (byte >= 32) decoded += String.fromCharCode(byte);
  }
  return decoded;
}

/**
 * Extract all visible text tokens from a PDF content stream string.
 * Handles both hex <DEADBEEF> and literal (Hello) PDF string encodings.
 */
function extractTextFromStream(streamText: string): { full: string; blocks: string[] } {
  const blocks: string[] = [];

  // Hex strings: <DEADBEEF>
  const hexRegex = /<([0-9a-fA-F]{2,})>/g;
  let m: RegExpExecArray | null;
  while ((m = hexRegex.exec(streamText)) !== null) {
    const decoded = decodeHexPdfString(m[1]);
    if (decoded.trim().length > 0) blocks.push(decoded.trim());
  }

  // Literal PDF strings: (Hello World)
  const litRegex = /\(([^)\\]*(?:\\.[^)\\]*)*)\)/g;
  while ((m = litRegex.exec(streamText)) !== null) {
    const raw = m[1].replace(/\\(.)/g, '$1');
    if (raw.trim().length > 0) blocks.push(raw.trim());
  }

  return { full: blocks.join(' '), blocks };
}

/**
 * Parse a PDF Tm text matrix [a b c d e f] and return the rotation angle in degrees.
 * PDF Tm rotation = atan2(b, a).
 */
function getRotationFromMatrix(a: number, b: number): number {
  const rad = Math.atan2(b, a);
  const deg = (rad * 180) / Math.PI;
  return (deg + 360) % 360;
}

/**
 * Returns true if a PDF content stream contains text rendered at a diagonal angle
 * (20°–70° or 110°–160°), which is characteristic of overlay watermarks.
 * Checks both Tm (text matrix) and cm (concat matrix) operators.
 */
function hasAngledText(streamText: string): boolean {
  // Check Tm operator: a b c d e f Tm
  const tmRegex = /(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+Tm/g;
  let m: RegExpExecArray | null;
  while ((m = tmRegex.exec(streamText)) !== null) {
    const a = parseFloat(m[1]);
    const b = parseFloat(m[2]);
    const angle = getRotationFromMatrix(a, b);
    const absAngle = angle <= 180 ? angle : 360 - angle;
    if ((absAngle >= 20 && absAngle <= 70) || (absAngle >= 110 && absAngle <= 160)) {
      return true;
    }
  }
  // Check cm operator: a b c d e f cm (only when b is non-zero, indicating rotation)
  const cmRegex = /(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+cm/g;
  while ((m = cmRegex.exec(streamText)) !== null) {
    const a = parseFloat(m[1]);
    const b = parseFloat(m[2]);
    if (Math.abs(b) < 0.01) continue; // Skip pure scale/translate (no rotation)
    const angle = getRotationFromMatrix(a, b);
    const absAngle = angle <= 180 ? angle : 360 - angle;
    if ((absAngle >= 20 && absAngle <= 70) || (absAngle >= 110 && absAngle <= 160)) {
      return true;
    }
  }
  return false;
}

/**
 * Decompress a PDF content stream into its text representation.
 * Returns empty string on failure.
 */
function decompressStream(obj: PDFStream | PDFRawStream): string {
  let rawBytes: Uint8Array | null = null;
  if (obj instanceof PDFRawStream) {
    rawBytes = obj.contents;
  } else if ('contents' in obj) {
    rawBytes = (obj as unknown as { contents: Uint8Array }).contents;
  }
  if (!rawBytes) return '';
  try {
    const isFlate = obj.dict.get(PDFName.of('Filter')) === PDFName.of('FlateDecode');
    if (isFlate) {
      return new TextDecoder().decode(pako.inflate(rawBytes));
    }
    return new TextDecoder().decode(rawBytes);
  } catch {
    return '';
  }
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * 5. ENGINE A: STRIP DIGITAL WATERMARKS (Smart Upgraded)
 * Strips digital watermarks using multiple detection strategies:
 *  1. Annotations with /Subtype /Stamp or /Watermark
 *  2. Resources /ExtGState with low opacity (ca < 0.8 or CA < 0.8)
 *  3. XObjects named watermark|stamp|draft|compixor
 *  4. /Artifact marked content streams (/Type /Watermark or /CompixorWatermark)
 *  5. [NEW] Multi-page repeat hunter — same text on 3+ pages → watermark candidate
 *  6. [NEW] Angle/rotation detector — diagonal text at 20°–70° → watermark candidate
 *  7. [NEW] Hex-decoded text matching — decodes <hex> strings before keyword matching
 */
export async function stripDigitalWatermarks(
  pdfBytes: ArrayBuffer | Uint8Array
): Promise<{ pdfBytes: Uint8Array; removedCount: number }> {
  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  let removedCount = 0;
  const pages = doc.getPages();

  // ── [NEW] STRATEGY 5: Multi-Page Repeat Hunter ──────────────────────────────
  // Scan all pages first. Collect every distinct decoded text token and count how
  // many pages it appears on. Tokens seen on ≥3 pages (or all pages in short PDFs)
  // are flagged as watermark candidates and targeted for removal below.
  const textPageCount = new Map<string, number>(); // token → page count
  const minRepeatPages = Math.max(2, Math.min(3, pages.length)); // 2 for 2-page, 3 for 3+

  for (const pg of pages) {
    const pgContents = pg.node.get(PDFName.of('Contents'));
    if (!pgContents) continue;

    const pgRefs: PDFRef[] = [];
    if (pgContents instanceof PDFRef) {
      const deref = doc.context.lookup(pgContents);
      if (deref instanceof PDFArray) {
        for (let i = 0; i < deref.size(); i++) {
          const item = deref.get(i);
          if (item instanceof PDFRef) pgRefs.push(item);
        }
      } else {
        pgRefs.push(pgContents);
      }
    } else if (pgContents instanceof PDFArray) {
      for (let i = 0; i < pgContents.size(); i++) {
        const item = pgContents.get(i);
        if (item instanceof PDFRef) pgRefs.push(item);
      }
    }

    // Collect unique tokens seen on this page (avoid double-counting same stream)
    const pageTokens = new Set<string>();
    for (const ref of pgRefs) {
      const obj = doc.context.lookup(ref);
      if (!(obj instanceof PDFStream || obj instanceof PDFRawStream)) continue;
      const streamText = decompressStream(obj);
      if (!streamText) continue;
      const { blocks } = extractTextFromStream(streamText);
      for (const block of blocks) {
        const normalized = block.toLowerCase().trim().replace(/\s+/g, ' ');
        if (normalized.length >= 3) pageTokens.add(normalized);
      }
    }

    // Increment global count for each unique token on this page
    Array.from(pageTokens).forEach((token) => {
      textPageCount.set(token, (textPageCount.get(token) ?? 0) + 1);
    });
  }

  // Build set of repeat-watermark text tokens
  const repeatWatermarkTokens = new Set<string>();
  Array.from(textPageCount.entries()).forEach(([token, count]) => {
    if (count >= minRepeatPages) {
      repeatWatermarkTokens.add(token);
    }
  });

  // ── [NEW] GLOBAL WATERMARK XOBJECT PRE-PASS ────────────────────────────────
  // Scan all pages to identify watermark image/form XObjects across the whole document.
  // Many PDFs share watermark image objects across pages (e.g. /Im0 on P1, /Im1 on P2 both
  // pointing to the same underlying Image ref). Scanning globally ensures EVERY page knows
  // which XObjects are watermarks, even if another page processed it first.
  const globalWatermarkXObjKeys = new Set<string>();
  const globalWatermarkXObjRefs = new Set<PDFRef>();

  for (const pg of pages) {
    const res = pg.node.get(PDFName.of('Resources'));
    if (!res) continue;
    let resDict: PDFDict | null = null;
    if (res instanceof PDFRef) {
      const deref = doc.context.lookup(res);
      if (deref instanceof PDFDict) resDict = deref;
    } else if (res instanceof PDFDict) {
      resDict = res;
    }
    if (!resDict) continue;

    const xObjVal = resDict.get(PDFName.of('XObject'));
    let xObjDict: PDFDict | null = null;
    if (xObjVal instanceof PDFRef) {
      const deref = doc.context.lookup(xObjVal);
      if (deref instanceof PDFDict) xObjDict = deref;
    } else if (xObjVal instanceof PDFDict) {
      xObjDict = xObjVal;
    }
    if (!xObjDict) continue;

    for (const [key, val] of xObjDict.entries()) {
      const xName = key.asString().replace(/^\//, '');
      let xObj: any = null;
      let refObj: PDFRef | null = null;
      if (val instanceof PDFRef) {
        refObj = val;
        xObj = doc.context.lookup(val);
      } else {
        xObj = val;
      }

      if (xObj && xObj.dict) {
        const subtype = xObj.dict.get(PDFName.of('Subtype'));
        const subtypeName = subtype ? subtype.toString() : '';
        const isNamedWm = /watermark|stamp|compixor|draft/i.test(xName);

        if (subtypeName === '/Image') {
          const smask = xObj.dict.get(PDFName.of('SMask'));
          const mask = xObj.dict.get(PDFName.of('Mask'));
          // Image with transparency mask or watermark name
          if (smask || mask || isNamedWm) {
            globalWatermarkXObjKeys.add(xName);
            if (refObj) globalWatermarkXObjRefs.add(refObj);
          }
        } else if (subtypeName === '/Form') {
          let formContent = '';
          try {
            if (typeof xObj.getContents === 'function') {
              const raw = xObj.getContents();
              const filter = xObj.dict.get(PDFName.of('Filter'));
              if (filter === PDFName.of('FlateDecode')) {
                formContent = new TextDecoder().decode(pako.inflate(raw));
              } else {
                formContent = new TextDecoder().decode(raw);
              }
            }
          } catch {}

          if (isNamedWm || /watermark|confidential|draft|sample|compixor/i.test(formContent)) {
            globalWatermarkXObjKeys.add(xName);
            if (refObj) globalWatermarkXObjRefs.add(refObj);
          }
        }
      }
    }
  }
  // ────────────────────────────────────────────────────────────────────────────

  for (const page of pages) {
    // 1. Scan and strip /Stamp and /Watermark subtype annotations from page.node
    const annotsKey = PDFName.of('Annots');
    const annots = page.node.get(annotsKey);
    if (annots) {
      let annotsArray: PDFArray | null = null;
      if (annots instanceof PDFArray) {
        annotsArray = annots;
      } else if (annots instanceof PDFRef) {
        const deref = doc.context.lookup(annots);
        if (deref instanceof PDFArray) annotsArray = deref;
      }

      if (annotsArray) {
        for (let i = annotsArray.size() - 1; i >= 0; i--) {
          const item = annotsArray.get(i);
          let annotDict: PDFDict | null = null;
          if (item instanceof PDFDict) {
            annotDict = item;
          } else if (item instanceof PDFRef) {
            const deref = doc.context.lookup(item);
            if (deref instanceof PDFDict) annotDict = deref;
          }

          if (annotDict) {
            const subtype = annotDict.get(PDFName.of('Subtype'));
            const subtypeName = subtype instanceof PDFName ? subtype.asString() : '';
            if (
              subtypeName === '/Watermark' ||
              subtypeName === '/Stamp' ||
              subtypeName === 'Watermark' ||
              subtypeName === 'Stamp'
            ) {
              annotsArray.remove(i);
              removedCount++;
              if (item instanceof PDFRef) {
                try {
                  doc.context.delete(item);
                } catch {}
              }
            }
          }
        }
      }
    }

    // 2. Inspect /Resources /ExtGState for low-opacity watermark states (ca < 0.8 or CA < 0.8)
    const lowOpacityGsKeys = new Set<string>();
    const resources = page.node.get(PDFName.of('Resources'));
    let resDict: PDFDict | null = null;
    if (resources instanceof PDFRef) {
      const deref = doc.context.lookup(resources);
      if (deref instanceof PDFDict) resDict = deref;
    } else if (resources instanceof PDFDict) {
      resDict = resources;
    }

    if (resDict) {
      const extGState = resDict.get(PDFName.of('ExtGState'));
      let extGStateDict: PDFDict | null = null;
      if (extGState instanceof PDFRef) {
        const deref = doc.context.lookup(extGState);
        if (deref instanceof PDFDict) extGStateDict = deref;
      } else if (extGState instanceof PDFDict) {
        extGStateDict = extGState;
      }

      if (extGStateDict) {
        const entries = extGStateDict.entries();
        for (const [key, val] of entries) {
          let gsDict: PDFDict | null = null;
          if (val instanceof PDFDict) {
            gsDict = val;
          } else if (val instanceof PDFRef) {
            const deref = doc.context.lookup(val);
            if (deref instanceof PDFDict) gsDict = deref;
          }

          if (gsDict) {
            const ca = gsDict.get(PDFName.of('ca')) as any;
            const CA = gsDict.get(PDFName.of('CA')) as any;
            const caVal = typeof ca?.asNumber === 'function' ? ca.asNumber() : null;
            const CAVal = typeof CA?.asNumber === 'function' ? CA.asNumber() : null;

            if ((caVal !== null && caVal < 0.8) || (CAVal !== null && CAVal < 0.8)) {
              lowOpacityGsKeys.add(key.asString().replace(/^\//, ''));
            }
          }
        }
      }
    }

    // 3. Inherit watermark XObject keys from global pre-pass
    const watermarkXObjKeys = new Set<string>(globalWatermarkXObjKeys);
    const watermarkXObjRefs = new Set<PDFRef>(globalWatermarkXObjRefs);
    if (resDict) {
      const xObjVal = resDict.get(PDFName.of('XObject'));
      let xObjDict: PDFDict | null = null;
      if (xObjVal instanceof PDFRef) {
        const deref = doc.context.lookup(xObjVal);
        if (deref instanceof PDFDict) xObjDict = deref;
      } else if (xObjVal instanceof PDFDict) {
        xObjDict = xObjVal;
      }

      if (xObjDict) {
        for (const [key, val] of xObjDict.entries()) {
          const xName = key.asString().replace(/^\//, '');
          let xObj: any = null;
          let refObj: PDFRef | null = null;
          if (val instanceof PDFRef) {
            refObj = val;
            xObj = doc.context.lookup(val);
          } else {
            xObj = val;
          }

          if (xObj && xObj.dict) {
            const subtype = xObj.dict.get(PDFName.of('Subtype'));
            const subtypeName = subtype ? subtype.toString() : '';
            const isNamedWm = /watermark|stamp|compixor|draft/i.test(xName);

            if (subtypeName === '/Image') {
              const smask = xObj.dict.get(PDFName.of('SMask'));
              const mask = xObj.dict.get(PDFName.of('Mask'));
              if (smask || mask || isNamedWm) {
                watermarkXObjKeys.add(xName);
                if (refObj) watermarkXObjRefs.add(refObj);
              }
            } else if (subtypeName === '/Form') {
              let formContent = '';
              try {
                if (typeof xObj.getContents === 'function') {
                  const raw = xObj.getContents();
                  const filter = xObj.dict.get(PDFName.of('Filter'));
                  if (filter === PDFName.of('FlateDecode')) {
                    formContent = new TextDecoder().decode(pako.inflate(raw));
                  } else {
                    formContent = new TextDecoder().decode(raw);
                  }
                }
              } catch {}

              if (isNamedWm || /watermark|confidential|draft|sample|compixor/i.test(formContent)) {
                watermarkXObjKeys.add(xName);
                if (refObj) watermarkXObjRefs.add(refObj);
              }
            }
          }
        }
      }
    }

    // 4. Inspect page Contents stream:
    const contentsKey = PDFName.of('Contents');
    const contents = page.node.get(contentsKey);
    if (!contents) continue;

    let streamArray: PDFArray | null = null;
    const streamRefs: PDFRef[] = [];

    if (contents instanceof PDFArray) {
      streamArray = contents;
      for (let i = 0; i < contents.size(); i++) {
        const item = contents.get(i);
        if (item instanceof PDFRef) streamRefs.push(item);
      }
    } else if (contents instanceof PDFRef) {
      const deref = doc.context.lookup(contents);
      if (deref instanceof PDFArray) {
        streamArray = deref;
        for (let i = 0; i < deref.size(); i++) {
          const item = deref.get(i);
          if (item instanceof PDFRef) streamRefs.push(item);
        }
      } else {
        streamRefs.push(contents);
      }
    }

    const streamsToDelete = new Set<PDFRef>();

    for (const ref of streamRefs) {
      const obj = doc.context.lookup(ref);
      if (!(obj instanceof PDFStream || obj instanceof PDFRawStream)) continue;

      let rawBytes: Uint8Array | null = null;
      if (obj instanceof PDFRawStream) {
        rawBytes = obj.contents;
      } else if ('contents' in obj) {
        rawBytes = (obj as unknown as { contents: Uint8Array }).contents;
      }
      if (!rawBytes) continue;

      const isFlate = obj.dict.get(PDFName.of('Filter')) === PDFName.of('FlateDecode');
      let streamText = '';
      try {
        if (isFlate) {
          const inflated = pako.inflate(rawBytes);
          streamText = new TextDecoder().decode(inflated);
        } else {
          streamText = new TextDecoder().decode(rawBytes);
        }
      } catch {
        continue;
      }

      // ── DEDICATED STREAM DETECTION (multi-stream pages only) ──────────────
      // Only attempt full-stream deletion when page has multiple streams —
      // we can safely delete a stream without touching the rest of the page.
      if (streamRefs.length > 1) {
        let isDedicatedOverlay = false;

        // Check if stream invokes any candidate watermark XObject
        for (const wmKey of Array.from(watermarkXObjKeys)) {
          const doRegex = new RegExp(`\\/${wmKey}\\s+Do`);
          if (doRegex.test(streamText) && streamText.length < 1000) {
            isDedicatedOverlay = true;
            break;
          }
        }

        // Original keyword check (/Artifact watermark markers)
        if (!isDedicatedOverlay && streamText.length < 800 && /BT[\s\S]*?ET/.test(streamText)) {
          if (
            /\/Artifact\s*<<[^>]*\/Type\s*\/Watermark/i.test(streamText) ||
            /\/Artifact\s*\/CompixorWatermark/i.test(streamText) ||
            /watermark|confidential|sample|draft/i.test(streamText)
          ) {
            isDedicatedOverlay = true;
          }
        }

        // Strategy 6: Angle detector — short stream with diagonal text
        if (!isDedicatedOverlay && streamText.length < 1500 && /BT[\s\S]*?ET/.test(streamText)) {
          if (hasAngledText(streamText)) {
            const hasMeaningfulGraphics =
              /\d+\s+\d+\s+\d+\s+\d+\s+re\s+f/.test(streamText) && streamText.length > 600;
            if (!hasMeaningfulGraphics) {
              isDedicatedOverlay = true;
            }
          }
        }

        // Strategy 5: Repeat token match — text found on 3+ pages
        if (!isDedicatedOverlay && streamText.length < 2000 && repeatWatermarkTokens.size > 0) {
          const { blocks } = extractTextFromStream(streamText);
          for (const block of blocks) {
            const normalized = block.toLowerCase().trim().replace(/\s+/g, ' ');
            if (repeatWatermarkTokens.has(normalized)) {
              isDedicatedOverlay = true;
              break;
            }
          }
        }

        if (isDedicatedOverlay) {
          streamsToDelete.add(ref);
          removedCount++;
          continue;
        }
      }

      // ── INLINE STRIPPING (works on ALL pages, single or multi-stream) ─────
      // Parse the stream and surgically remove only watermark BT..ET blocks.
      let modifiedText = streamText;
      let streamModified = false;

      // Strip invocations of candidate watermark XObjects
      for (const wmKey of Array.from(watermarkXObjKeys)) {
        const doRegex = new RegExp(
          `(?:q\\s*)?(?:[0-9.-]+\\s+){6}cm\\s*\\/${wmKey}\\s+Do(?:\\s*Q)?|\\/${wmKey}\\s+Do`,
          'g'
        );
        if (doRegex.test(modifiedText)) {
          modifiedText = modifiedText.replace(doRegex, () => {
            removedCount++;
            streamModified = true;
            return '';
          });
        }
      }

      // Strip /Artifact << ... /Type /Watermark ... >> BDC ... EMC blocks
      const artifactWatermarkRegex =
        /\/Artifact\s*<<[^>]*\/Type\s*\/Watermark[^>]*>>\s*BDC[\s\S]*?EMC/gi;
      if (artifactWatermarkRegex.test(modifiedText)) {
        modifiedText = modifiedText.replace(artifactWatermarkRegex, () => {
          removedCount++;
          streamModified = true;
          return '';
        });
      }

      // Strip Compixor /Artifact blocks
      const compixorArtifactRegex = /\/Artifact\s*\/CompixorWatermark[\s\S]*?EMC/gi;
      if (compixorArtifactRegex.test(modifiedText)) {
        modifiedText = modifiedText.replace(compixorArtifactRegex, () => {
          removedCount++;
          streamModified = true;
          return '';
        });
      }

      // Strip low-opacity graphic state blocks (q ... /GS gs ... Q)
      Array.from(lowOpacityGsKeys).forEach((gsKey) => {
        const gsPattern = new RegExp(`q[\\s\\S]*?\\/${gsKey}\\s+gs[\\s\\S]*?Q`, 'g');
        if (gsPattern.test(modifiedText)) {
          modifiedText = modifiedText.replace(gsPattern, () => {
            removedCount++;
            streamModified = true;
            return '';
          });
        }
      });

      // ── [NEW] STRATEGY 6 INLINE: Remove angled BT..ET blocks from any stream ─
      // For single-stream pages, we can't delete the whole stream.
      // Instead, surgically find BT..ET blocks where the Tm matrix is diagonal
      // (20°–70°) and strip only those blocks.
      if (!streamModified || true) {
        // Run always — catches watermarks even in shared/single streams
        modifiedText = modifiedText.replace(/BT[\s\S]*?ET/g, (block) => {
          // Only remove if this BT..ET block itself has angled text
          if (!hasAngledText(block)) return block;
          // Safety: skip if it contains meaningful table/border graphics
          if (/\d+\s+\d+\s+\d+\s+\d+\s+re\s+f/.test(block)) return block;
          removedCount++;
          streamModified = true;
          return '';
        });
      }

      // ── [NEW] STRATEGY 5 INLINE: Remove repeat-pattern BT..ET blocks ─────────
      // For single-stream pages, surgically remove BT..ET blocks whose decoded
      // text matches repeat-watermark tokens (found on 3+ pages).
      if (repeatWatermarkTokens.size > 0) {
        modifiedText = modifiedText.replace(/BT[\s\S]*?ET/g, (block) => {
          const { blocks } = extractTextFromStream(block);
          for (const b of blocks) {
            const normalized = b.toLowerCase().trim().replace(/\s+/g, ' ');
            if (repeatWatermarkTokens.has(normalized)) {
              removedCount++;
              streamModified = true;
              return '';
            }
          }
          return block;
        });
      }

      // ── [NEW] STRATEGY 7 INLINE: Hex-decoded text watermark removal ──────────
      // Decode hex strings inside each BT..ET block. If the decoded content
      // contains only 1–5 words (typical watermark), AND the block has low opacity
      // or angled text, remove it. This catches "MOLVI SAQIB" style watermarks.
      if (lowOpacityGsKeys.size > 0 || hasAngledText(modifiedText)) {
        modifiedText = modifiedText.replace(/BT[\s\S]*?ET/g, (block) => {
          const { full: decoded, blocks } = extractTextFromStream(block);
          if (!decoded.trim()) return block;
          // Typical watermarks are short (1–6 words), not paragraph text
          const wordCount = decoded.trim().split(/\s+/).length;
          if (wordCount > 8) return block; // Skip — looks like real content
          // Only remove if the block is angled OR uses a low-opacity gs
          const blockIsAngled = hasAngledText(block);
          const blockUsesLowOpacity = Array.from(lowOpacityGsKeys).some((k) =>
            new RegExp(`\\/${k}\\s+gs`).test(block)
          );
          if (blockIsAngled || blockUsesLowOpacity) {
            removedCount++;
            streamModified = true;
            return '';
          }
          return block;
        });
      }

      if (streamModified) {
        const modifiedBytes = new TextEncoder().encode(modifiedText);
        if (isFlate) {
          const deflated = pako.deflate(modifiedBytes);
          const newStream = doc.context.stream(deflated, {
            Filter: 'FlateDecode',
          });
          doc.context.assign(ref, newStream);
        } else {
          const newStream = doc.context.stream(modifiedBytes);
          doc.context.assign(ref, newStream);
        }
      }
    }


    // Delete marked streams from streamArray
    if (streamArray && streamsToDelete.size > 0) {
      for (let i = streamArray.size() - 1; i >= 0; i--) {
        const item = streamArray.get(i);
        if (item instanceof PDFRef && streamsToDelete.has(item)) {
          streamArray.remove(i);
          try {
            doc.context.delete(item);
          } catch {}
        }
      }
    }

    // Clean up removed XObjects from Resources dictionary
    if (resDict && watermarkXObjKeys.size > 0) {
      const xObjVal = resDict.get(PDFName.of('XObject'));
      let xObjDict: PDFDict | null = null;
      if (xObjVal instanceof PDFRef) {
        const deref = doc.context.lookup(xObjVal);
        if (deref instanceof PDFDict) xObjDict = deref;
      } else if (xObjVal instanceof PDFDict) {
        xObjDict = xObjVal;
      }

      if (xObjDict) {
        for (const wmKey of Array.from(watermarkXObjKeys)) {
          xObjDict.delete(PDFName.of(wmKey));
        }
      }
    }
  }

  // Safely delete collected watermark XObjects from document context only AFTER all pages have finished processing
  for (const ref of Array.from(globalWatermarkXObjRefs)) {
    try {
      doc.context.delete(ref);
    } catch {}
  }

  // Also run removeCompixorWatermarks check to catch explicit Compixor registered streams
  const compixorRes = await removeCompixorWatermarks(await doc.save());
  removedCount += compixorRes.removedCount;

  return {
    pdfBytes: compixorRes.pdfBytes,
    removedCount,
  };
}

