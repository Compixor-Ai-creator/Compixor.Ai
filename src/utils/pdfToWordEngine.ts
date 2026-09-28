/**
 * pdfToWordEngine.ts
 * 100% Client-Side PDF to Word (.docx) Conversion Engine.
 * Extracts text, structural lines, and formatting from PDF pages via PDF.js,
 * then generates an ISO/IEC 29500 compliant Word document via docx.
 */

import { getPdfJs } from '@/utils/pdfLoader';
import type { Paragraph } from 'docx';

export interface ConversionProgress {
  percent: number;
  message: string;
  currentPage?: number;
  totalPages?: number;
}

export interface ConversionResult {
  blob: Blob;
  pageCount: number;
  totalWords: number;
  fileName: string;
}

interface TextItemData {
  str: string;
  x: number;
  y: number;
  fontSize: number;
  hasEol?: boolean;
}

interface LineData {
  y: number;
  items: TextItemData[];
  text: string;
  avgFontSize: number;
}

/**
 * Converts a PDF ArrayBuffer into an editable Word (.docx) Blob.
 * Everything runs inside the browser with zero server uploads.
 */
export async function convertPdfToDocx(
  pdfBuffer: ArrayBuffer,
  originalFileName: string,
  onProgress?: (p: ConversionProgress) => void
): Promise<ConversionResult> {
  onProgress?.({ percent: 10, message: 'Loading PDF document engine...' });

  const pdfjs = await getPdfJs();
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(pdfBuffer.slice(0)) });
  const pdfDoc = await loadingTask.promise;
  const pageCount = pdfDoc.numPages;

  onProgress?.({
    percent: 20,
    message: `Parsing document structure (${pageCount} page${pageCount > 1 ? 's' : ''})...`,
    totalPages: pageCount,
  });

  // Dynamic import of docx library
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak } = await import('docx');

  const docxParagraphs: Paragraph[] = [];
  let totalWordCount = 0;

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const pageProgress = 25 + Math.round((pageNum / pageCount) * 55);
    onProgress?.({
      percent: pageProgress,
      message: `Extracting text and layout from Page ${pageNum} of ${pageCount}...`,
      currentPage: pageNum,
      totalPages: pageCount,
    });

    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1 });

    const rawItems: TextItemData[] = [];

    for (const item of textContent.items) {
      if ('str' in item && typeof item.str === 'string' && item.str.trim().length > 0) {
        const transform = item.transform; // [scaleX, skewY, skewX, scaleY, tx, ty]
        const tx = transform[4];
        const ty = viewport.height - transform[5]; // Flip Y so top = 0
        const fontSize = Math.max(9, Math.round(Math.hypot(transform[0], transform[1])));

        rawItems.push({
          str: item.str,
          x: tx,
          y: ty,
          fontSize,
          hasEol: item.hasEOL,
        });
      }
    }

    if (rawItems.length === 0) {
      // Empty page or scanned page without OCR layer
      docxParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `[Page ${pageNum}: Image/Scanned content or blank page]`,
              italics: true,
              color: '888888',
            }),
          ],
        })
      );
    } else {
      // Group items into lines by matching Y coordinates within threshold
      rawItems.sort((a, b) => {
        if (Math.abs(a.y - b.y) <= 4) {
          return a.x - b.x; // same line: left to right
        }
        return a.y - b.y; // top to bottom
      });

      const lines: LineData[] = [];
      let currentLineItems: TextItemData[] = [];
      let currentLineY = rawItems[0].y;

      for (const item of rawItems) {
        if (currentLineItems.length === 0 || Math.abs(item.y - currentLineY) <= 4) {
          currentLineItems.push(item);
          currentLineY = item.y;
        } else {
          // Finish previous line
          currentLineItems.sort((a, b) => a.x - b.x);
          const lineText = currentLineItems.map((i) => i.str).join(' ');
          const avgFont =
            currentLineItems.reduce((acc, i) => acc + i.fontSize, 0) / currentLineItems.length;

          lines.push({
            y: currentLineY,
            items: [...currentLineItems],
            text: lineText,
            avgFontSize: avgFont,
          });

          currentLineItems = [item];
          currentLineY = item.y;
        }
      }

      if (currentLineItems.length > 0) {
        currentLineItems.sort((a, b) => a.x - b.x);
        const lineText = currentLineItems.map((i) => i.str).join(' ');
        const avgFont =
          currentLineItems.reduce((acc, i) => acc + i.fontSize, 0) / currentLineItems.length;

        lines.push({
          y: currentLineY,
          items: currentLineItems,
          text: lineText,
          avgFontSize: avgFont,
        });
      }

      // Convert lines to docx paragraphs
      for (const line of lines) {
        const trimmed = line.text.trim();
        if (!trimmed) continue;

        const words = trimmed.split(/\s+/).length;
        totalWordCount += words;

        // Heading detection based on font size
        const isH1 = line.avgFontSize >= 18;
        const isH2 = line.avgFontSize >= 14 && line.avgFontSize < 18;

        if (isH1) {
          docxParagraphs.push(
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 240, after: 120 },
              children: [
                new TextRun({
                  text: trimmed,
                  bold: true,
                  size: Math.round(line.avgFontSize * 2), // docx sizes are in half-points
                }),
              ],
            })
          );
        } else if (isH2) {
          docxParagraphs.push(
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 180, after: 80 },
              children: [
                new TextRun({
                  text: trimmed,
                  bold: true,
                  size: Math.round(line.avgFontSize * 2),
                }),
              ],
            })
          );
        } else {
          docxParagraphs.push(
            new Paragraph({
              spacing: { after: 120, line: 276 },
              children: [
                new TextRun({
                  text: trimmed,
                  size: 24, // 12pt standard
                }),
              ],
            })
          );
        }
      }
    }

    // Page break between pages (except after last page)
    if (pageNum < pageCount) {
      docxParagraphs.push(
        new Paragraph({
          children: [new PageBreak()],
        })
      );
    }
  }

  onProgress?.({ percent: 85, message: 'Assembling OpenXML Word document (.docx)...' });

  // Create DOCX document with standard 1" margins
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }, // 1 inch in DXA
          },
        },
        children: docxParagraphs,
      },
    ],
  });

  onProgress?.({ percent: 95, message: 'Generating downloadable Word document...' });

  const docxBlob = await Packer.toBlob(doc);

  onProgress?.({ percent: 100, message: 'Conversion completed!' });

  const baseName = originalFileName.replace(/\.pdf$/i, '');
  const finalFileName = `${baseName}_converted.docx`;

  return {
    blob: docxBlob,
    pageCount,
    totalWords: totalWordCount,
    fileName: finalFileName,
  };
}
