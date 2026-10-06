/**
 * imgToWordEngine.ts  (API-based v2)
 * ─────────────────────────────────────────────────────────────────────────────
 * Replaces the Tesseract.js client-side engine with a call to the
 * Compixor AI PaddleOCR FastAPI backend hosted on Hostinger VPS.
 *
 * ✅ Drop-in compatible — page.tsx imports & function signatures unchanged.
 * ✅ Single image: convertImageToWord()
 * ✅ Batch images: convertImagesToWord()
 * ✅ Progress events: Uploading → Processing → Finalizing → Done
 * ✅ Graceful error messages
 *
 * Environment variable (set in .env.local):
 *   NEXT_PUBLIC_IMG2WORD_API_URL=https://api.compixor-ai.cloud
 */

// ── Types (same interface as before — page.tsx untouched) ─────────────────────

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
  textContent: string;   // Empty string — server doesn't return preview text
  pageCount: number;
  wordCount: number;
  processingTimeMs: number;
}

export interface ImgToWordOptions {
  language?: OcrLanguage;
  onProgress?: (evt: OcrProgressEvent) => void;
  minConfidence?: number; // Unused — server-side threshold applied
}

// ── Language options map (for UI dropdown — unchanged) ────────────────────────

export const LANGUAGE_OPTIONS: { value: OcrLanguage; label: string }[] = [
  { value: 'eng',     label: 'English (Default)' },
  { value: 'eng+urd', label: 'English + Urdu (Bilingual)' },
  { value: 'urd',     label: 'Urdu (اردو)' },
  { value: 'eng+ara', label: 'English + Arabic (Bilingual)' },
  { value: 'ara',     label: 'Arabic (العربية)' },
  { value: 'fra',     label: 'French' },
  { value: 'deu',     label: 'German' },
  { value: 'spa',     label: 'Spanish' },
  { value: 'por',     label: 'Portuguese' },
  { value: 'ita',     label: 'Italian' },
  { value: 'rus',     label: 'Russian' },
  { value: 'chi_sim', label: 'Chinese (Simplified)' },
  { value: 'jpn',     label: 'Japanese' },
];

// ── Internal helpers ──────────────────────────────────────────────────────────

const API_BASE =
  process.env.NEXT_PUBLIC_IMG2WORD_API_URL?.replace(/\/$/, '') ??
  'https://api.compixor-ai.cloud';

const ENDPOINT = `${API_BASE}/api/convert-img-to-docx`;

/**
 * Fires fake progress events so the progress bar stays lively while we wait
 * for the server response (XHR upload + OCR time).
 * Returns a cleanup function to stop the interval.
 */
function startFakeProgress(
  onProgress: ((e: OcrProgressEvent) => void) | undefined,
  phases: { status: string; from: number; to: number; durationMs: number }[],
): () => void {
  if (!onProgress) return () => {};

  let phaseIdx = 0;
  let phaseStart = performance.now();
  let stopped = false;

  const tick = () => {
    if (stopped) return;
    const phase = phases[phaseIdx];
    if (!phase) return;

    const elapsed = performance.now() - phaseStart;
    const pct = Math.min(elapsed / phase.durationMs, 1);
    const progress = phase.from + pct * (phase.to - phase.from);

    onProgress({ status: phase.status, progress });

    if (pct >= 1) {
      phaseIdx++;
      phaseStart = performance.now();
      if (phaseIdx >= phases.length) return;
    }
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
  return () => { stopped = true; };
}

/**
 * Core conversion function — uploads files to Hostinger API,
 * receives .docx binary, parses response headers for metadata.
 */
async function callApi(
  files: File[],
  language: OcrLanguage,
  onProgress?: (e: OcrProgressEvent) => void,
): Promise<ImgToWordResult> {
  const t0 = performance.now();

  // Phase durations vary by batch size
  const isLarge = files.length > 3 || files.reduce((s, f) => s + f.size, 0) > 5_000_000;

  const stopProgress = startFakeProgress(onProgress, [
    { status: 'Uploading images…',     from: 0.00, to: 0.25, durationMs: isLarge ? 3000 : 1500 },
    { status: 'Running PaddleOCR…',    from: 0.25, to: 0.80, durationMs: isLarge ? 10000 : 5000 },
    { status: 'Finalizing document…',  from: 0.80, to: 0.95, durationMs: isLarge ? 2000 : 1000 },
  ]);

  try {
    const form = new FormData();
    for (const file of files) {
      form.append('files', file, file.name);
    }
    form.append('language', language);

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      body: form,
      // No Content-Type header — browser sets it with boundary automatically
    });

    if (!res.ok) {
      let detail = `Server error ${res.status}`;
      try {
        const json = await res.json();
        detail = json?.detail ?? detail;
      } catch {
        // Non-JSON error body — use status text
        detail = res.statusText || detail;
      }
      throw new Error(detail);
    }

    const docxBlob = await res.blob();

    // Parse metadata from response headers
    const processingTimeMs =
      parseInt(res.headers.get('X-Processing-Time-Ms') ?? '0', 10) ||
      Math.round(performance.now() - t0);
    const wordCount = parseInt(res.headers.get('X-Word-Count') ?? '0', 10);
    const pageCount = parseInt(res.headers.get('X-Page-Count') ?? `${files.length}`, 10);

    onProgress?.({ status: 'Done!', progress: 1 });

    return {
      docxBlob,
      textContent: '',   // Server doesn't return plain-text preview
      pageCount,
      wordCount,
      processingTimeMs,
    };
  } finally {
    stopProgress();
  }
}

// ── Public API (same signatures as Tesseract version) ─────────────────────────

/**
 * Convert a single image to an editable Word document.
 *
 * @param file      The image File object from the browser
 * @param options   { language, onProgress }
 * @returns         ImgToWordResult with docxBlob ready for download
 */
export async function convertImageToWord(
  file: File,
  options: ImgToWordOptions = {},
): Promise<ImgToWordResult> {
  const { language = 'eng', onProgress } = options;
  return callApi([file], language, onProgress);
}

/**
 * Convert multiple images (batch) into a single Word document,
 * with each image as a separate page.
 *
 * @param files     Array of image File objects
 * @param options   { language, onProgress }
 * @returns         ImgToWordResult with combined docxBlob
 */
export async function convertImagesToWord(
  files: File[],
  options: ImgToWordOptions = {},
): Promise<ImgToWordResult> {
  const { language = 'eng', onProgress } = options;
  if (!files.length) throw new Error('No files provided.');
  return callApi(files, language, onProgress);
}
