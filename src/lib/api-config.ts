/**
 * api-config.ts
 * Centralized backend API configuration for Compixor server-assisted tools.
 */

export const BACKEND_API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
  process.env.NEXT_PUBLIC_IMG2WORD_API_URL?.replace(/\/$/, '') ||
  'https://api.compixor-ai.cloud';

export const API_ENDPOINTS = {
  convertImgToDocx: `${BACKEND_API_BASE}/api/convert-img-to-docx`,
  convertPdfToDocx: `${BACKEND_API_BASE}/api/convert-pdf-to-docx`,
} as const;

/**
 * Client timeouts per endpoint (longer than server nginx timeouts:
 * Image to Word 200s vs nginx 180s, PDF to Word 450s vs nginx 420s).
 */
export const TIMEOUTS = {
  imgToDocxMs: 200_000, // 200 seconds
  pdfToDocxMs: 450_000, // 450 seconds
} as const;

export const MAX_FILE_SIZE_BYTES = 30 * 1024 * 1024; // 30 MB
export const MAX_FILE_SIZE_MB = 30;
export const FILE_TOO_LARGE_MSG = 'The file is too large. Maximum size is 30 MB.';

/**
 * Validates file size client-side before sending any request to the backend.
 */
export function checkFileSize(file: File): void {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(FILE_TOO_LARGE_MSG);
  }
}

/**
 * Validates that a received blob is a valid, non-empty DOCX file.
 * Checks for size > 0 and the ZIP header magic bytes 'PK' (0x50, 0x4B).
 */
export async function validateDocxBlob(blob: Blob): Promise<boolean> {
  if (!blob || blob.size < 4) return false;
  const slice = blob.slice(0, 4);
  const buffer = await slice.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  // Zip archive signature: 0x50 0x4B (ASCII "PK")
  return bytes[0] === 0x50 && bytes[1] === 0x4B;
}

/**
 * Validates that the Content-Type header corresponds to a DOCX or generic binary stream.
 */
export function isDocxContentType(contentType: string | null): boolean {
  if (!contentType) return false;
  const lower = contentType.toLowerCase();
  return (
    lower.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') ||
    lower.includes('application/octet-stream')
  );
}

/**
 * Maps HTTP status codes and error types into friendly user-facing messages.
 */
export function getFriendlyErrorMessage(status?: number, detail?: string): string {
  if (status === 413) {
    return FILE_TOO_LARGE_MSG;
  }
  if (status === 429) {
    return 'Too many requests. Please wait a moment before trying again.';
  }
  if (status === 504 || (detail && detail.toLowerCase().includes('timeout'))) {
    return 'Conversion timed out. Our server is busy or the document is too complex. Please try again.';
  }
  if (detail && detail.trim().length > 0 && !detail.startsWith('{') && !detail.startsWith('<')) {
    return `Conversion failed: ${detail}`;
  }
  return 'Conversion failed. Our server is busy or unavailable. Please try again in a moment.';
}
