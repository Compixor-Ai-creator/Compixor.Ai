/**
 * pdfToWordEngine.ts
 * 100% Client-Side PDF to Word (.docx) Conversion Engine.
 * Features:
 * - Intelligent X-Coordinate Column & Table Detection
 * - Real Microsoft Word Tables (<w:tbl>) for Tabular/Ledger Reports
 * - Landscape & Portrait Auto-Detection
 * - Heading & Typography Hierarchy Preservation
 * - Fully private in-browser RAM execution
 */

import { getPdfJs } from '@/utils/pdfLoader';
import type { Paragraph, Table, TableRow } from 'docx';

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
  width: number;
  fontSize: number;
  hasEol?: boolean;
}

interface CellToken {
  text: string;
  startX: number;
  endX: number;
  fontSize: number;
}

interface ParsedLine {
  y: number;
  cells: CellToken[];
  fullText: string;
  avgFontSize: number;
}

/**
 * Checks if a string represents a number, currency, or percentage.
 */
function isNumericOrCurrency(str: string): boolean {
  const trimmed = str.trim();
  if (!trimmed) return false;
  return /^[+-]?[\$£€¥Rs\.]?\s*[\d,]+(\.\d+)?%?$/.test(trimmed);
}

/**
 * Converts a PDF ArrayBuffer into an editable Word (.docx) Blob.
 * Automatically identifies tabular regions and converts them into genuine Word Tables.
 */
export async function convertPdfToDocx(
  pdfBuffer: ArrayBuffer,
  originalFileName: string,
  onProgress?: (p: ConversionProgress) => void
): Promise<ConversionResult> {
  onProgress?.({ percent: 8, message: 'Initializing PDF document reader...' });

  const pdfjs = await getPdfJs();
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(pdfBuffer.slice(0)) });
  const pdfDoc = await loadingTask.promise;
  const pageCount = pdfDoc.numPages;

  onProgress?.({
    percent: 18,
    message: `Analyzing document layout (${pageCount} page${pageCount > 1 ? 's' : ''})...`,
    totalPages: pageCount,
  });

  // Dynamic import of docx components
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    PageBreak,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
    ShadingType,
    AlignmentType,
    PageOrientation,
  } = await import('docx');

  const docChildren: (Paragraph | Table)[] = [];
  let totalWordCount = 0;
  let detectedLandscape = false;

  // Check first page orientation
  if (pageCount > 0) {
    const firstPage = await pdfDoc.getPage(1);
    const vp = firstPage.getViewport({ scale: 1 });
    detectedLandscape = vp.width > vp.height;
  }

  // Calculate page and content dimensions in DXA (1440 DXA = 1 inch)
  const pageWidthDxa = detectedLandscape ? 15840 : 12240;
  const marginDxa = 1080; // 0.75 inch margins for better tabular space
  const contentWidthDxa = pageWidthDxa - marginDxa * 2; // e.g. 13680 for landscape, 10080 for portrait

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const pageProgress = 20 + Math.round((pageNum / pageCount) * 60);
    onProgress?.({
      percent: pageProgress,
      message: `Reconstructing layout for Page ${pageNum} of ${pageCount}...`,
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
        const ty = viewport.height - transform[5]; // Flip Y coordinate so top is 0
        const fontSize = Math.max(8, Math.round(Math.hypot(transform[0], transform[1])));
        const rawWidth = typeof item.width === 'number' && item.width > 0
          ? item.width
          : item.str.length * fontSize * 0.52;

        rawItems.push({
          str: item.str,
          x: tx,
          y: ty,
          width: rawWidth,
          fontSize,
          hasEol: item.hasEOL,
        });
      }
    }

    if (rawItems.length === 0) {
      // Empty or scanned page
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `[Page ${pageNum}: Image or empty content]`,
              italics: true,
              color: '888888',
            }),
          ],
        })
      );
    } else {
      // Sort items top-to-bottom, then left-to-right
      rawItems.sort((a, b) => {
        if (Math.abs(a.y - b.y) <= 3) {
          return a.x - b.x;
        }
        return a.y - b.y;
      });

      // Group items into coherent horizontal lines
      const lineBuckets: TextItemData[][] = [];
      let currentBucket: TextItemData[] = [];
      let currentBucketY = rawItems[0].y;

      for (const it of rawItems) {
        if (currentBucket.length === 0 || Math.abs(it.y - currentBucketY) <= 3.5) {
          currentBucket.push(it);
          currentBucketY = it.y;
        } else {
          currentBucket.sort((a, b) => a.x - b.x);
          lineBuckets.push([...currentBucket]);
          currentBucket = [it];
          currentBucketY = it.y;
        }
      }
      if (currentBucket.length > 0) {
        currentBucket.sort((a, b) => a.x - b.x);
        lineBuckets.push(currentBucket);
      }

      // Tokenize each line into column cells based on horizontal gaps
      const parsedLines: ParsedLine[] = [];

      for (const bucket of lineBuckets) {
        const cells: CellToken[] = [];
        let currentCell: CellToken | null = null;
        let sumFont = 0;

        for (const item of bucket) {
          sumFont += item.fontSize;
          const cleanStr = item.str.trim();
          if (!cleanStr) continue;

          // Gap threshold to distinguish between words in same cell vs separate columns
          const gapThreshold = Math.max(10, item.fontSize * 0.95);

          if (!currentCell) {
            currentCell = {
              text: cleanStr,
              startX: item.x,
              endX: item.x + item.width,
              fontSize: item.fontSize,
            };
          } else if (item.x - currentCell.endX > gapThreshold) {
            // Significant gap indicates next column!
            cells.push(currentCell);
            currentCell = {
              text: cleanStr,
              startX: item.x,
              endX: item.x + item.width,
              fontSize: item.fontSize,
            };
          } else {
            // Words within same cell
            currentCell.text += ' ' + cleanStr;
            currentCell.endX = item.x + item.width;
          }
        }

        if (currentCell) {
          cells.push(currentCell);
        }

        if (cells.length > 0) {
          const fullText = cells.map((c) => c.text).join(' ');
          totalWordCount += fullText.split(/\s+/).length;

          parsedLines.push({
            y: bucket[0].y,
            cells,
            fullText,
            avgFontSize: sumFont / bucket.length,
          });
        }
      }

      // Group parsed lines into Blocks (Paragraphs vs Table Blocks)
      // A line is considered tabular if it has >= 3 columns, or 2 wide columns spanning > 45% of page
      type Block =
        | { type: 'table'; rows: ParsedLine[] }
        | { type: 'paragraph'; line: ParsedLine };

      const blocks: Block[] = [];
      let pendingTableRows: ParsedLine[] = [];

      const flushTable = () => {
        if (pendingTableRows.length > 0) {
          if (pendingTableRows.length >= 2 || pendingTableRows[0].cells.length >= 4) {
            blocks.push({ type: 'table', rows: [...pendingTableRows] });
          } else {
            // Single isolated line with few columns -> treat as regular paragraphs
            for (const r of pendingTableRows) {
              blocks.push({ type: 'paragraph', line: r });
            }
          }
          pendingTableRows = [];
        }
      };

      for (const line of parsedLines) {
        const isTabular =
          line.cells.length >= 3 ||
          (line.cells.length === 2 &&
            line.cells[1].startX - line.cells[0].startX > viewport.width * 0.35);

        if (isTabular) {
          pendingTableRows.push(line);
        } else {
          flushTable();
          blocks.push({ type: 'paragraph', line });
        }
      }
      flushTable();

      // Render each block into docx elements
      for (const block of blocks) {
        if (block.type === 'paragraph') {
          const line = block.line;
          const trimmed = line.fullText.trim();
          if (!trimmed) continue;

          const isH1 = line.avgFontSize >= 17;
          const isH2 = line.avgFontSize >= 13 && line.avgFontSize < 17;

          if (isH1) {
            docChildren.push(
              new Paragraph({
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 240, after: 120 },
                children: [
                  new TextRun({
                    text: trimmed,
                    bold: true,
                    size: Math.round(line.avgFontSize * 2),
                    color: '1E3A8A', // Classic professional dark blue
                  }),
                ],
              })
            );
          } else if (isH2) {
            docChildren.push(
              new Paragraph({
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 180, after: 80 },
                children: [
                  new TextRun({
                    text: trimmed,
                    bold: true,
                    size: Math.round(line.avgFontSize * 2),
                    color: '2563EB',
                  }),
                ],
              })
            );
          } else {
            docChildren.push(
              new Paragraph({
                spacing: { after: 100, line: 260 },
                children: [
                  new TextRun({
                    text: trimmed,
                    size: 22, // 11pt readable font
                  }),
                ],
              })
            );
          }
        } else {
          // ── Real Word Table Construction ───────────────────────────────────
          const rows = block.rows;

          // 1. Gather all column start anchors across all rows in table
          const allStarts: number[] = [];
          for (const r of rows) {
            for (const c of r.cells) {
              allStarts.push(c.startX);
            }
          }
          allStarts.sort((a, b) => a - b);

          // Cluster anchor points within 14pt of each other
          const colAnchors: number[] = [];
          for (const s of allStarts) {
            const found = colAnchors.find((anchor) => Math.abs(anchor - s) <= 14);
            if (found === undefined) {
              colAnchors.push(s);
            }
          }
          colAnchors.sort((a, b) => a - b);

          const colCount = Math.max(1, colAnchors.length);

          // 2. Compute column widths in DXA
          const rawColWidths: number[] = [];
          for (let i = 0; i < colCount; i++) {
            if (i < colCount - 1) {
              rawColWidths.push(Math.max(25, colAnchors[i + 1] - colAnchors[i]));
            } else {
              rawColWidths.push(50); // Default last column span
            }
          }

          const sumRaw = rawColWidths.reduce((acc, w) => acc + w, 0);
          const colWidthsDxa: number[] = rawColWidths.map((w) =>
            Math.max(400, Math.round((w / sumRaw) * contentWidthDxa))
          );

          // Adjust last column to ensure exact sum equals contentWidthDxa
          const currentSum = colWidthsDxa.reduce((acc, w) => acc + w, 0);
          colWidthsDxa[colWidthsDxa.length - 1] += contentWidthDxa - currentSum;

          // 3. Build Table Rows & Cells
          const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' };
          const cellBorders = {
            top: tableBorder,
            bottom: tableBorder,
            left: tableBorder,
            right: tableBorder,
          };

          const docxRows: TableRow[] = [];

          for (let rIdx = 0; rIdx < rows.length; rIdx++) {
            const rowData = rows[rIdx];
            const isHeaderRow =
              rIdx === 0 ||
              /sr\.?\s*no|date|sum|type|invoice|salesman|net\s*amt|amount|balance/i.test(
                rowData.fullText
              );

            // Map this row's cells into column slots
            const rowCellsText: string[] = new Array(colCount).fill('');

            for (const cellToken of rowData.cells) {
              // Find closest column anchor
              let closestCol = 0;
              let minDiff = Infinity;
              for (let aIdx = 0; aIdx < colCount; aIdx++) {
                const diff = Math.abs(colAnchors[aIdx] - cellToken.startX);
                if (diff < minDiff) {
                  minDiff = diff;
                  closestCol = aIdx;
                }
              }

              if (rowCellsText[closestCol]) {
                rowCellsText[closestCol] += ' ' + cellToken.text;
              } else {
                rowCellsText[closestCol] = cellToken.text;
              }
            }

            const docxCells = rowCellsText.map((cellText, cIdx) => {
              const trimmed = cellText.trim();
              const isNumeric = isNumericOrCurrency(trimmed);

              return new TableCell({
                width: { size: colWidthsDxa[cIdx], type: WidthType.DXA },
                borders: cellBorders,
                shading: isHeaderRow
                  ? { fill: 'F3F4F6', type: ShadingType.CLEAR }
                  : undefined,
                margins: { top: 70, bottom: 70, left: 90, right: 90 },
                children: [
                  new Paragraph({
                    alignment: isNumeric ? AlignmentType.RIGHT : AlignmentType.LEFT,
                    spacing: { before: 0, after: 0, line: 220 },
                    children: [
                      new TextRun({
                        text: trimmed || ' ',
                        bold: isHeaderRow,
                        size: isHeaderRow ? 19 : 18, // 9pt - 9.5pt crisp table typography
                        color: isHeaderRow ? '111827' : '374151',
                      }),
                    ],
                  }),
                ],
              });
            });

            docxRows.push(
              new TableRow({
                tableHeader: isHeaderRow,
                children: docxCells,
              })
            );
          }

          docChildren.push(
            new Table({
              width: { size: contentWidthDxa, type: WidthType.DXA },
              columnWidths: colWidthsDxa,
              rows: docxRows,
            })
          );

          // Add subtle spacing after table
          docChildren.push(
            new Paragraph({
              spacing: { after: 160 },
              children: [],
            })
          );
        }
      }
    }

    // Page break between pages (except last page)
    if (pageNum < pageCount) {
      docChildren.push(
        new Paragraph({
          children: [new PageBreak()],
        })
      );
    }
  }

  onProgress?.({ percent: 88, message: 'Assembling ISO/IEC 29500 Word document (.docx)...' });

  // Create DOCX document with matching orientation and standard margins
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: pageWidthDxa,
              height: detectedLandscape ? 12240 : 15840,
              orientation: detectedLandscape
                ? PageOrientation.LANDSCAPE
                : PageOrientation.PORTRAIT,
            },
            margin: { top: marginDxa, right: marginDxa, bottom: marginDxa, left: marginDxa },
          },
        },
        children: docChildren,
      },
    ],
  });

  onProgress?.({ percent: 96, message: 'Generating downloadable Word document...' });

  const docxBlob = await Packer.toBlob(doc);

  onProgress?.({ percent: 100, message: 'Conversion completed successfully!' });

  const baseName = originalFileName.replace(/\.pdf$/i, '');
  const finalFileName = `${baseName}_converted.docx`;

  return {
    blob: docxBlob,
    pageCount,
    totalWords: totalWordCount,
    fileName: finalFileName,
  };
}
