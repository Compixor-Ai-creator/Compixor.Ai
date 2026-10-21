/**
 * imgToWordEngine.ts
 * Dedicated Backend API client for Image to Word (.docx) conversion.
 * 
 * 100% Server-Assisted: All OCR and DOCX synthesis execute on the secure
 * Compixor backend API. No local/browser-based fallback.
 */

import {
  API_ENDPOINTS,
  validateDocxBlob,
  isDocxContentType,
  getFriendlyErrorMessage,
} from '@/lib/api-config';

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
  onProgress?: (evt: OcrProgressEvent) => void;
  minConfidence?: number;
}

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

const IMG_CONVERSION_TIMEOUT_MS = 120_000; // 120 seconds

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

async function callApi(
  files: File[],
  language: OcrLanguage = 'eng+urd',
  onProgress?: (e: OcrProgressEvent) => void,
): Promise<ImgToWordResult> {
  const t0 = performance.now();
  const isLarge = files.length > 3 || files.reduce((s, f) => s + f.size, 0) > 5_000_000;

  const stopProgress = startFakeProgress(onProgress, [
    { status: 'Uploading image securely over HTTPS…',       from: 0.00, to: 0.20, durationMs: isLarge ? 2500 : 1200 },
    { status: 'Scanning layout, columns, and tables…',      from: 0.20, to: 0.55, durationMs: isLarge ? 8000 : 4000 },
    { status: 'Recognizing typography with neural OCR…',    from: 0.55, to: 0.85, durationMs: isLarge ? 8000 : 4000 },
    { status: 'Packaging editable Word (.docx) document…',  from: 0.85, to: 0.98, durationMs: isLarge ? 2000 : 1000 },
  ]);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), IMG_CONVERSION_TIMEOUT_MS);

  try {
    const form = new FormData();
    for (const file of files) {
      form.append('files', file, file.name);
    }
    form.append('language', language);

    let res: Response;
    try {
      res = await fetch(API_ENDPOINTS.convertImgToDocx, {
        method: 'POST',
        body: form,
        signal: controller.signal,
      });
    } catch (networkErr: unknown) {
      if (controller.signal.aborted) {
        throw new Error(getFriendlyErrorMessage(504, 'timeout'));
      }
      throw new Error(getFriendlyErrorMessage(undefined, 'Network error. Please check your internet connection.'));
    }

    if (res.status !== 200) {
      let detail = '';
      try {
        const json = await res.json();
        detail = json?.detail || '';
      } catch {
        detail = res.statusText || '';
      }
      throw new Error(getFriendlyErrorMessage(res.status, detail));
    }

    const contentType = res.headers.get('content-type');
    if (!isDocxContentType(contentType)) {
      throw new Error('Conversion failed. Server returned an invalid response format.');
    }

    const docxBlob = await res.blob();
    if (!docxBlob || docxBlob.size === 0) {
      throw new Error('Conversion failed. Received an empty document from the server.');
    }

    const isValidZip = await validateDocxBlob(docxBlob);
    if (!isValidZip) {
      throw new Error('Conversion failed. The returned document file is corrupted.');
    }

    const processingTimeMs =
      parseInt(res.headers.get('X-Processing-Time-Ms') ?? '0', 10) ||
      Math.round(performance.now() - t0);
    const wordCount = parseInt(res.headers.get('X-Word-Count') ?? '0', 10);
    const pageCount = parseInt(res.headers.get('X-Page-Count') ?? `${files.length}`, 10);

    onProgress?.({ status: 'Word document ready to download!', progress: 1 });

    return {
      docxBlob,
      textContent: '',
      pageCount: isNaN(pageCount) || pageCount < 1 ? files.length : pageCount,
      wordCount: isNaN(wordCount) ? 0 : wordCount,
      processingTimeMs,
    };
  } finally {
    clearTimeout(timeoutId);
    stopProgress();
  }
}

export async function convertImageToWord(
  file: File,
  options: ImgToWordOptions = {},
): Promise<ImgToWordResult> {
  const { language = 'eng+urd', onProgress } = options;
  return callApi([file], language, onProgress);
}

export async function convertImagesToWord(
  files: File[],
  options: ImgToWordOptions = {},
): Promise<ImgToWordResult> {
  const { language = 'eng', onProgress } = options;
  if (!files.length) throw new Error('No files provided.');
  return callApi(files, language, onProgress);
}
