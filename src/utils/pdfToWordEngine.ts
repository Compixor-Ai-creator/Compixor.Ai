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

const PDF_CONVERSION_TIMEOUT_MS = 120_000; // 120 seconds

const STAGES: { afterSec: number; percent: number; message: string }[] = [
  { afterSec: 0, percent: 10, message: 'Uploading your PDF securely over HTTPS...' },
  { afterSec: 3, percent: 28, message: 'Scanning pages, layout, and table grids...' },
  { afterSec: 10, percent: 52, message: 'Reading typography with neural OCR & AI...' },
  { afterSec: 25, percent: 75, message: 'Reconstructing paragraphs, headings, and tables...' },
  { afterSec: 50, percent: 90, message: 'Packaging editable Word (.docx) document...' },
  { afterSec: 85, percent: 95, message: 'Finalizing formatting — finishing up...' },
];

/**
 * Converts a PDF file into an editable Word document via the Compixor backend API.
 */
export async function convertPdfToDocx(
  file: File,
  onProgress?: (p: ConversionProgress) => void,
): Promise<ConversionResult> {
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
  const timeoutId = setTimeout(() => controller.abort(), PDF_CONVERSION_TIMEOUT_MS);

  try {
    const formData = new FormData();
    formData.append('files', file, file.name);
    formData.append('language', 'eng+urd');

    let response: Response;
    try {
      response = await fetch(API_ENDPOINTS.convertPdfToDocx, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
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
        errorDetail = errorJson?.detail || '';
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
