/**
 * pdfToWordEngine.ts
 * Dedicated Backend API client for PDF to Word (.docx) conversion.
 * 
 * 100% Server-Assisted: All PDF rendering, OCR, and DOCX synthesis execute
 * on the secure Compixor backend API. No local/browser-based fallback.
 */

import {
  API_ENDPOINTS,
  validateDocxBlob,
  isDocxContentType,
  getFriendlyErrorMessage,
  TIMEOUTS,
  checkFileSize,
} from '@/lib/api-config';

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

const STAGES: { afterSec: number; percent: number; message: string }[] = [
  { afterSec: 0, percent: 8, message: 'Uploading your PDF securely over HTTPS...' },
  { afterSec: 4, percent: 20, message: 'Converting... large or scanned files can take a few minutes.' },
  { afterSec: 15, percent: 40, message: 'Scanning pages, layout, and table grids...' },
  { afterSec: 45, percent: 65, message: 'Reading typography with neural OCR & AI...' },
  { afterSec: 100, percent: 80, message: 'Reconstructing paragraphs, headings, and tables...' },
  { afterSec: 180, percent: 90, message: 'Processing complex pages — please keep this tab open...' },
  { afterSec: 300, percent: 95, message: 'Packaging editable Word (.docx) document...' },
  { afterSec: 380, percent: 98, message: 'Finalizing formatting — almost ready...' },
];

/**
 * Lightweight page count inspector using PDF header/cross-reference markers.
 */
export async function inspectPdfText(
  pdfBuffer: ArrayBuffer,
  _samplePages = 3
): Promise<{ pageCount: number; textChars: number }> {
  try {
    const bytes = new Uint8Array(pdfBuffer);
    const raw = new TextDecoder('latin1').decode(bytes);
    const matches = raw.match(/\/Type\s*\/Page\b/g);
    const pageCount = matches && matches.length > 0 ? matches.length : 1;
    return { pageCount, textChars: 0 };
  } catch {
    return { pageCount: 1, textChars: 0 };
  }
}

/**
 * Returns true so that all PDFs are processed by the backend engine.
 */
export async function isScannedPdf(_pdfBuffer: ArrayBuffer): Promise<boolean> {
  return true;
}

/**
 * Converts a PDF file into an editable Word document via the Compixor backend API.
 */
export async function convertPdfToDocx(
  fileOrBuffer: File | ArrayBuffer,
  originalFileNameOrProgress?: string | ((p: ConversionProgress) => void),
  maybeProgress?: (p: ConversionProgress) => void,
): Promise<ConversionResult> {
  let file: File;
  let onProgress: ((p: ConversionProgress) => void) | undefined;

  if (fileOrBuffer instanceof File) {
    file = fileOrBuffer;
    onProgress = typeof originalFileNameOrProgress === 'function' ? originalFileNameOrProgress : maybeProgress;
  } else {
    const fileName = typeof originalFileNameOrProgress === 'string' ? originalFileNameOrProgress : 'document.pdf';
    file = new File([fileOrBuffer], fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`, {
      type: 'application/pdf',
    });
    onProgress = maybeProgress;
  }

  // Pre-flight client-side size check before sending any request
  checkFileSize(file);

  const t0 = Date.now();
  let currentStage = -1;

  const emitProgress = () => {
    const elapsedSec = (Date.now() - t0) / 1000;
    let nextStage = 0;
    for (let i = 0; i < STAGES.length; i++) {
      if (elapsedSec >= STAGES[i].afterSec) nextStage = i;
    }
    if (nextStage !== currentStage) {
      currentStage = nextStage;
      onProgress?.({
        percent: STAGES[currentStage].percent,
        message: STAGES[currentStage].message,
      });
    }
  };

  emitProgress();
  const timer = typeof window !== 'undefined' ? window.setInterval(emitProgress, 1000) : null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.pdfToDocxMs);

  try {
    const buildFormData = () => {
      const formData = new FormData();
      formData.append('files', file, file.name);
      formData.append('language', 'eng');
      return formData;
    };

    let response: Response;
    try {
      response = await fetch(API_ENDPOINTS.convertPdfToDocx, {
        method: 'POST',
        body: buildFormData(),
        signal: controller.signal,
      });

      // If server is on a backend version without dedicated /convert-pdf-to-docx, fall back to /convert-img-to-docx
      if (response.status === 404) {
        response = await fetch(API_ENDPOINTS.convertImgToDocx, {
          method: 'POST',
          body: buildFormData(),
          signal: controller.signal,
        });
      }
    } catch (networkErr: unknown) {
      if (controller.signal.aborted) {
        throw new Error(getFriendlyErrorMessage(504, 'timeout'));
      }
      throw new Error(getFriendlyErrorMessage(undefined, 'Network error. Please check your internet connection.'));
    }

    if (response.status !== 200) {
      let errorDetail = '';
      try {
        const errorJson = await response.json();
        errorDetail = errorJson?.detail || errorJson?.error || '';
      } catch {
        errorDetail = response.statusText || '';
      }
      throw new Error(getFriendlyErrorMessage(response.status, errorDetail));
    }

    const contentType = response.headers.get('content-type');
    if (!isDocxContentType(contentType)) {
      throw new Error('Conversion failed. Server returned an invalid response format.');
    }

    const blob = await response.blob();

    if (!blob || blob.size === 0) {
      throw new Error('Conversion failed. Received an empty document from the server.');
    }

    const isValidZip = await validateDocxBlob(blob);
    if (!isValidZip) {
      throw new Error('Conversion failed. The returned document file is corrupted.');
    }

    const pagesHeader = response.headers.get('X-Pages-Converted') || response.headers.get('X-Page-Count');
    const pageCount = pagesHeader ? parseInt(pagesHeader, 10) : 1;
    const baseName = file.name.replace(/\.pdf$/i, '');
    const fileName = `${baseName}_converted.docx`;

    onProgress?.({ percent: 100, message: 'Word document ready to download!' });

    return {
      blob,
      pageCount: isNaN(pageCount) || pageCount < 1 ? 1 : pageCount,
      totalWords: 0,
      fileName,
    };
  } finally {
    clearTimeout(timeoutId);
    if (timer) clearInterval(timer);
  }
}

/**
 * Backward compatibility alias
 */
export const convertScannedPdfToDocx = convertPdfToDocx;
