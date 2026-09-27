/**
 * pdfLoader.ts
 * Centralized lazy-loaders for pdf-lib and pdfjs-dist.
 * Ensures GlobalWorkerOptions.workerSrc is set exactly once.
 */

// ─── pdf-lib ──────────────────────────────────────────────────────────────────
export const getPdfLib = () => import('pdf-lib');

// ─── pdf-lib-encrypt ─────────────────────────────────────────────────────────
export const getPdfEncrypt = () => import('pdf-lib-encrypt');

// ─── pdfjs-dist ──────────────────────────────────────────────────────────────
let pdfjsWorkerInitialized = false;

export async function getPdfJs() {
  const pdfjs = await import('pdfjs-dist');
  if (typeof window !== 'undefined' && !pdfjsWorkerInitialized) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    pdfjsWorkerInitialized = true;
  }
  return pdfjs;
}
