/**
 * Compixor AI — Pure Backend PDF to Word Engine (v10.4 Argon Client)
 * File: src/utils/pdfToWordEngine.ts
 *
 * Key Fixes:
 * 1. Completely removes the client-side browser DOCX builder fallback that produced damaged/broken layouts.
 * 2. Routes BOTH digital and scanned PDFs strictly through the Hostinger VPS backend (https://api.compixor-ai.cloud).
 * 3. Automatically falls back from `/api/convert-pdf-to-docx` to `/api/convert-img-to-docx` on the backend
 *    if the server is still running v10.3 (since v10.3 already supports PDF rendering via PyMuPDF).
 * 4. Throws a clean, user-friendly error message when the backend is unavailable or busy instead of corrupting output.
 */

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

const OCR_API_BASE =
  process.env.NEXT_PUBLIC_IMG2WORD_API_URL?.replace(/\/$/, '') ??
  'https://api.compixor-ai.cloud';

const PDF_ENDPOINT = `${OCR_API_BASE}/api/convert-pdf-to-docx`;
const IMG_FALLBACK_ENDPOINT = `${OCR_API_BASE}/api/convert-img-to-docx`;
const REQUEST_TIMEOUT_MS = 120_000; // 120 seconds max wait before showing clean error

/**
 * Lightweight page count inspector using PDF header/cross-reference markers.
 * Returns textChars = 0 so the caller always uses the backend pipeline instead of local browser conversion.
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
    // Always return textChars: 0 so page.tsx never triggers local browser-based conversion
    return { pageCount, textChars: 0 };
  } catch {
    return { pageCount: 1, textChars: 0 };
  }
}

/**
 * Always returns true so that all PDFs are processed by the backend v10.4 Argon engine
 * rather than the client-side web browser fallback.
 */
export async function isScannedPdf(_pdfBuffer: ArrayBuffer): Promise<boolean> {
  return true;
}

/**
 * Core backend caller for PDF-to-Word conversion.
 * Never falls back to in-browser generation; throws a clear error if the backend fails.
 */
async function callBackendPdfToDocx(
  file: File,
  onProgress?: (p: ConversionProgress) => void
): Promise<ConversionResult> {
  onProgress?.({
    percent: 15,
    message: 'Connecting to Compixor AI Backend Engine (v10.4 Argon)...',
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const buildFormData = () => {
      const form = new FormData();
      form.append('files', file, file.name);
      form.append('language', 'eng');
      return form;
    };

    onProgress?.({
      percent: 35,
      message: 'Processing PDF layout & tables on secure server...',
    });

    // Try dedicated PDF endpoint first; if server is still on v10.3 (404), route to /api/convert-img-to-docx
    let res = await fetch(PDF_ENDPOINT, {
      method: 'POST',
      body: buildFormData(),
      signal: controller.signal,
    });

    if (res.status === 404) {
      res = await fetch(IMG_FALLBACK_ENDPOINT, {
        method: 'POST',
        body: buildFormData(),
        signal: controller.signal,
      });
    }

    if (!res.ok) {
      let serverDetail = '';
      try {
        const errJson = await res.json();
        serverDetail = errJson?.detail || errJson?.error || '';
      } catch {
        serverDetail = await res.text().catch(() => '');
      }
      throw new Error(
        serverDetail ||
          `Server is busy right now (HTTP ${res.status}). Please try again in a few moments.`
      );
    }

    onProgress?.({
      percent: 85,
      message: 'Finalizing editable Word (.docx) document...',
    });

    const blob = await res.blob();
    if (!blob || blob.size < 100) {
      throw new Error(
        'Backend returned an empty document. Please try again in a few moments.'
      );
    }

    const totalWords = parseInt(res.headers.get('X-Word-Count') ?? '0', 10) || 0;
    const pageCount = parseInt(res.headers.get('X-Page-Count') ?? '1', 10) || 1;
    const baseName = file.name.replace(/\.pdf$/i, '') || 'document';

    onProgress?.({
      percent: 100,
      message: 'Conversion complete!',
      currentPage: pageCount,
      totalPages: pageCount,
    });

    return {
      blob,
      pageCount,
      totalWords,
      fileName: `${baseName}.docx`,
    };
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(
        'Server took too long to respond (timeout). Please try again in a moment or upload a smaller PDF.'
      );
    }
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error(
        'Unable to reach the conversion server right now. Please check your connection and try again shortly.'
      );
    }
    throw err instanceof Error
      ? err
      : new Error('Conversion failed on the server. Please try again shortly.');
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Primary backend PDF-to-Word conversion entry point called by page.tsx.
 */
export async function convertScannedPdfToDocx(
  file: File,
  onProgress?: (p: ConversionProgress) => void
): Promise<ConversionResult> {
  return callBackendPdfToDocx(file, onProgress);
}

/**
 * Legacy digital PDF entry point — now also routes strictly through the backend API
 * so the web-based browser engine never runs or produces damaged files.
 */
export async function convertPdfToDocx(
  pdfBuffer: ArrayBuffer,
  originalFileName: string,
  onProgress?: (p: ConversionProgress) => void
): Promise<ConversionResult> {
  const file = new File(
    [pdfBuffer],
    originalFileName.endsWith('.pdf') ? originalFileName : `${originalFileName}.pdf`,
    { type: 'application/pdf' }
  );
  return callBackendPdfToDocx(file, onProgress);
}
