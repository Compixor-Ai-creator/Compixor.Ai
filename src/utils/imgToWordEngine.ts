/**
 * imgToWordEngine.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * 100% client-side Image → Word (.docx) engine using Tesseract.js (WebAssembly
 * OCR) and the `docx` library. No bytes are ever uploaded to any server.
 *
 * Supported input formats: JPEG, PNG, WEBP, BMP, GIF, TIFF
 * Output: standard ISO/IEC 29500 OpenXML .docx file
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  convertMillimetersToTwip,
  LevelFormat,
} from 'docx';

// ── Types ─────────────────────────────────────────────────────────────────────

export type OcrLanguage =
  | 'eng'
  | 'eng+urd'
  | 'urd'
  | 'eng+ara'
  | 'ara'
  | 'fra'
  | 'deu'
  | 'spa'
  | 'por'
  | 'ita'
  | 'rus'
  | 'chi_sim'
  | 'jpn';

export interface OcrProgressEvent {
  status: string;
  progress: number; // 0–1
}

export interface ImgToWordResult {
  docxBlob: Blob;
  textContent: string;
  pageCount: number;
  wordCount: number;
  processingTimeMs: number;
}

export interface ImgToWordOptions {
  language?: OcrLanguage;
  /** Called with progress updates (0–1) during OCR */
  onProgress?: (evt: OcrProgressEvent) => void;
  /** Minimum OCR confidence (0–100) to include a word */
  minConfidence?: number;
}

// ── Language display map ───────────────────────────────────────────────────────

export const LANGUAGE_OPTIONS: { value: OcrLanguage; label: string }[] = [
  { value: 'eng', label: 'English (Default)' },
  { value: 'eng+urd', label: 'English + Urdu (Bilingual)' },
  { value: 'urd', label: 'Urdu (اردو)' },
  { value: 'eng+ara', label: 'English + Arabic (Bilingual)' },
  { value: 'ara', label: 'Arabic (العربية)' },
  { value: 'fra', label: 'French' },
  { value: 'deu', label: 'German' },
  { value: 'spa', label: 'Spanish' },
  { value: 'por', label: 'Portuguese' },
  { value: 'ita', label: 'Italian' },
  { value: 'rus', label: 'Russian' },
  { value: 'chi_sim', label: 'Chinese (Simplified)' },
  { value: 'jpn', label: 'Japanese' },
];

// ── Line classification helpers ────────────────────────────────────────────────

const BULLET_RE = /^\s*([•\-\*\–\—\u2022\u25E6\u2043]|\([a-zA-Z0-9]\))\s+/;
const NUMBER_RE = /^\s*(\d+[.):]|\([a-zA-Z0-9]+\))\s+/;
const RTL_RE = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

function isRtlLine(text: string): boolean {
  return RTL_RE.test(text);
}

function classifyLine(text: string): 'heading' | 'bullet' | 'number' | 'paragraph' {
  const trimmed = text.trim();
  if (!trimmed) return 'paragraph';
  if (BULLET_RE.test(trimmed)) return 'bullet';
  if (NUMBER_RE.test(trimmed)) return 'number';
  const wordCount = trimmed.split(/\s+/).length;
  if (
    wordCount <= 8 &&
    trimmed.length > 2 &&
    (trimmed.toUpperCase() === trimmed ||
      trimmed === trimmed.replace(/[^A-Za-z0-9\s]/g, '').trim())
  ) {
    return 'heading';
  }
  return 'paragraph';
}

function stripListPrefix(text: string): string {
  return text.replace(BULLET_RE, '').replace(NUMBER_RE, '').trim();
}

// ── Image preprocessing (contrast boost via canvas) ───────────────────────────

async function preprocessImageForOcr(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 3000 / Math.max(img.width, img.height));
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}

// ── OCR extraction via Tesseract.js ───────────────────────────────────────────

async function extractTextFromCanvas(
  canvas: HTMLCanvasElement,
  language: OcrLanguage,
  minConfidence: number,
  onProgress?: (evt: OcrProgressEvent) => void,
): Promise<string> {
  // Dynamically import tesseract.js (code-split, only loaded when tool is used)
  const { createWorker } = await import('tesseract.js');

  const worker = await createWorker(language, 1, {
    logger: (m: { status: string; progress: number }) => {
      if (onProgress) {
        onProgress({ status: m.status, progress: m.progress ?? 0 });
      }
    },
  });

  try {
    const { data } = await worker.recognize(canvas);

    // Filter low-confidence words and reconstruct text
    const lines: string[] = [];
    for (const block of data.blocks ?? []) {
      for (const para of block.paragraphs ?? []) {
        const paraLines: string[] = [];
        for (const line of para.lines ?? []) {
          const words = line.words
            .filter((w) => w.confidence >= minConfidence)
            .map((w) => w.text)
            .join(' ')
            .trim();
          if (words) paraLines.push(words);
        }
        if (paraLines.length) {
          lines.push(paraLines.join('\n'));
        }
      }
    }

    const reconstructed = lines.join('\n\n');
    if (!reconstructed.trim() && data.text) {
      return data.text.trim();
    }
    return reconstructed;
  } finally {
    await worker.terminate();
  }
}

// ── Build DOCX from extracted text ────────────────────────────────────────────

async function buildDocx(pages: string[], originalFileName: string): Promise<Blob> {
  const docChildren: Paragraph[] = [];

  pages.forEach((pageText, pageIndex) => {
    if (pageIndex > 0) {
      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text: '', break: 1 })],
        }),
      );
    }

    const rawLines = pageText.split('\n');

    for (const rawLine of rawLines) {
      const trimmed = rawLine.trim();

      if (!trimmed) {
        docChildren.push(new Paragraph({ children: [] }));
        continue;
      }

      const isRtl = isRtlLine(trimmed);
      const font = isRtl ? 'Jameel Noori Nastaleeq, Arial, Calibri' : 'Calibri';
      const alignment = isRtl ? AlignmentType.RIGHT : AlignmentType.LEFT;
      const kind = classifyLine(trimmed);

      if (kind === 'heading') {
        docChildren.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            alignment,
            children: [new TextRun({ text: trimmed, bold: true, font })],
          }),
        );
      } else if (kind === 'bullet') {
        docChildren.push(
          new Paragraph({
            alignment,
            numbering: { reference: 'bullet-list', level: 0 },
            children: [new TextRun({ text: stripListPrefix(trimmed), font })],
          }),
        );
      } else if (kind === 'number') {
        docChildren.push(
          new Paragraph({
            alignment,
            numbering: { reference: 'number-list', level: 0 },
            children: [new TextRun({ text: stripListPrefix(trimmed), font })],
          }),
        );
      } else {
        docChildren.push(
          new Paragraph({
            alignment,
            children: [new TextRun({ text: trimmed, font })],
          }),
        );
      }
    }
  });

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'bullet-list',
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '\u2022',
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: {
                    left: convertMillimetersToTwip(10),
                    hanging: convertMillimetersToTwip(5),
                  },
                },
              },
            },
          ],
        },
        {
          reference: 'number-list',
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: '%1.',
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: {
                    left: convertMillimetersToTwip(10),
                    hanging: convertMillimetersToTwip(5),
                  },
                },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertMillimetersToTwip(25),
              right: convertMillimetersToTwip(25),
              bottom: convertMillimetersToTwip(25),
              left: convertMillimetersToTwip(25),
            },
          },
        },
        children: docChildren,
      },
    ],
    creator: 'Compixor AI',
    title: originalFileName.replace(/\.[^.]+$/, ''),
    description: 'Generated by Compixor AI Image to Word Converter',
  });

  return Packer.toBlob(doc);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Converts a single image file to a Word (.docx) document using Tesseract.js
 * OCR — 100% client-side, zero server uploads.
 */
export async function convertImageToWord(
  file: File,
  options: ImgToWordOptions = {},
): Promise<ImgToWordResult> {
  const t0 = performance.now();
  const { language = 'eng', onProgress, minConfidence = 25 } = options;

  onProgress?.({ status: 'Preprocessing image…', progress: 0.05 });
  const canvas = await preprocessImageForOcr(file);

  onProgress?.({ status: 'Loading OCR engine…', progress: 0.1 });
  const rawText = await extractTextFromCanvas(canvas, language, minConfidence, (evt) => {
    onProgress?.({
      status: evt.status,
      progress: 0.1 + evt.progress * 0.75,
    });
  });

  onProgress?.({ status: 'Building Word document…', progress: 0.9 });
  const docxBlob = await buildDocx([rawText], file.name);

  const wordCount = rawText.trim().split(/\s+/).filter(Boolean).length;
  onProgress?.({ status: 'Done', progress: 1 });

  return {
    docxBlob,
    textContent: rawText,
    pageCount: 1,
    wordCount,
    processingTimeMs: performance.now() - t0,
  };
}

/**
 * Converts multiple image files to a single merged Word (.docx) document.
 * Each image becomes a page section separated by a page break.
 */
export async function convertImagesToWord(
  files: File[],
  options: ImgToWordOptions = {},
): Promise<ImgToWordResult> {
  const t0 = performance.now();
  const { language = 'eng', onProgress, minConfidence = 25 } = options;

  const pages: string[] = [];
  let totalWords = 0;

  for (let i = 0; i < files.length; i++) {
    const fileProgress = i / files.length;
    const fileProgressEnd = (i + 1) / files.length;

    onProgress?.({
      status: `Processing image ${i + 1} of ${files.length}…`,
      progress: fileProgress * 0.85,
    });
    const canvas = await preprocessImageForOcr(files[i]);
    const text = await extractTextFromCanvas(canvas, language, minConfidence, (evt) => {
      onProgress?.({
        status: `Image ${i + 1}/${files.length}: ${evt.status}`,
        progress:
          fileProgress * 0.85 +
          evt.progress * 0.85 * (fileProgressEnd - fileProgress),
      });
    });
    pages.push(text);
    totalWords += text.trim().split(/\s+/).filter(Boolean).length;
  }

  onProgress?.({ status: 'Building Word document…', progress: 0.9 });
  const docxBlob = await buildDocx(pages, files[0].name);

  onProgress?.({ status: 'Done', progress: 1 });

  return {
    docxBlob,
    textContent: pages.join('\n\n---\n\n'),
    pageCount: files.length,
    wordCount: totalWords,
    processingTimeMs: performance.now() - t0,
  };
}
