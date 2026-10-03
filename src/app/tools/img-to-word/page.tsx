'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ImageIcon,
  Download,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  ScanText,
  Zap,
  ShieldCheck,
  Globe,
  ArrowRight,
  Trophy,
  Star,
  Laptop,
  Languages,
  Eye,
  X,
  Plus,
} from 'lucide-react';
import WordIcon from '@/components/WordIcon';
import Link from 'next/link';
import { toast } from 'sonner';
import FileDropZone from '@/components/FileDropZone';
import DropAnywhere from '@/components/DropAnywhere';
import ClientSideTrustSection from '@/components/ClientSideTrustSection';
import RelatedTools from '@/components/RelatedTools';
import ToolSeoSection from '@/components/ToolSeoSection';
import { formatFileSize } from '@/utils/fileHelpers';
import {
  convertImageToWord,
  convertImagesToWord,
  LANGUAGE_OPTIONS,
  OcrLanguage,
  OcrProgressEvent,
} from '@/utils/imgToWordEngine';

// ── Helpers ────────────────────────────────────────────────────────────────────

function getOutputFileName(files: File[]): string {
  if (files.length === 1) {
    const base = files[0].name.replace(/\.[^.]+$/, '');
    return `${base}-converted.docx`;
  }
  return `compixor-img-to-word-${files.length}-images.docx`;
}

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/bmp',
  'image/gif',
  'image/tiff',
];
const ACCEPTED_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif', '.tif', '.tiff'];

function isValidImageFile(f: File): boolean {
  const ext = f.name.toLowerCase().slice(f.name.lastIndexOf('.'));
  return ACCEPTED_TYPES.includes(f.type) || ACCEPTED_EXTS.includes(ext);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ImgToWordPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [language, setLanguage] = useState<OcrLanguage>('eng');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    blob: Blob;
    wordCount: number;
    pageCount: number;
    timeMs: number;
    outputName: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── File handling ──────────────────────────────────────────────────────────

  const addFiles = useCallback((newFiles: File[]) => {
    const valid = newFiles.filter((f) => {
      if (!isValidImageFile(f)) {
        toast.error(`"${f.name}" is not a supported image format.`);
        return false;
      }
      if (f.size > 25 * 1024 * 1024) {
        toast.error(`"${f.name}" exceeds the 25 MB limit.`);
        return false;
      }
      return true;
    });

    if (!valid.length) return;

    setFiles((prev) => {
      const combined = [...prev, ...valid].slice(0, 10); // max 10 images
      // Build preview URLs for new files
      const newUrls = valid.slice(0, combined.length - prev.length).map((f) =>
        URL.createObjectURL(f),
      );
      setPreviewUrls((p) => [...p, ...newUrls].slice(0, 10));
      return combined;
    });

    setResult(null);
    setError(null);
  }, []);

  const handleFileDrop = useCallback(
    (f: File) => {
      addFiles([f]);
    },
    [addFiles],
  );

  const handleMultipleFiles = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        addFiles(Array.from(e.target.files));
      }
      e.target.value = '';
    },
    [addFiles],
  );

  const removeFile = useCallback(
    (index: number) => {
      setFiles((prev) => {
        const next = prev.filter((_, i) => i !== index);
        return next;
      });
      setPreviewUrls((prev) => {
        URL.revokeObjectURL(prev[index]);
        return prev.filter((_, i) => i !== index);
      });
      setResult(null);
    },
    [],
  );

  const reset = useCallback(() => {
    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    setFiles([]);
    setPreviewUrls([]);
    setResult(null);
    setError(null);
    setProgress(0);
    setProgressLabel('');
    setPreviewText(null);
    setShowPreview(false);
  }, [previewUrls]);

  // ── Conversion ─────────────────────────────────────────────────────────────

  const handleConvert = useCallback(async () => {
    if (!files.length) return;
    setIsProcessing(true);
    setResult(null);
    setError(null);
    setProgress(0);
    setProgressLabel('Starting…');

    const onProgress = (evt: OcrProgressEvent) => {
      setProgress(Math.round(evt.progress * 100));
      setProgressLabel(evt.status.charAt(0).toUpperCase() + evt.status.slice(1));
    };

    try {
      let res;
      if (files.length === 1) {
        res = await convertImageToWord(files[0], { language, onProgress });
      } else {
        res = await convertImagesToWord(files, { language, onProgress });
      }

      setResult({
        blob: res.docxBlob,
        wordCount: res.wordCount,
        pageCount: res.pageCount,
        timeMs: res.processingTimeMs,
        outputName: getOutputFileName(files),
      });
      setPreviewText(res.textContent);
      toast.success('Word document ready — click Download!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'OCR failed unexpectedly.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  }, [files, language]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.outputName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }, [result]);

  // ── Render ─────────────────────────────────────────────────────────────────

  const hasFiles = files.length > 0;

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
      <DropAnywhere onFileDrop={handleFileDrop} accept={ACCEPTED_EXTS.join(',')} />

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-10 overflow-hidden">
        {/* Background orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-violet-500/8 dark:bg-violet-500/12 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-indigo-500/8 dark:bg-indigo-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(124,58,237,0.10)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_30%,black_30%,transparent_100%)] pointer-events-none" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-semibold mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            100% Client-Side · No Upload · Tesseract OCR
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-3 leading-tight"
          >
            Image to Word Converter
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto text-base md:text-lg"
          >
            Convert JPG, PNG, WEBP, or BMP images into fully editable Microsoft Word (.docx)
            documents using in-browser Tesseract OCR — no upload, no sign-up, forever free.
          </motion.p>

          {/* Trust pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2 mt-5"
          >
            {[
              { icon: ShieldCheck, label: 'Zero server upload' },
              { icon: Globe, label: '10+ languages' },
              { icon: Zap, label: 'WebAssembly OCR' },
              { icon: Laptop, label: 'Works in browser' },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-medium"
              >
                <Icon className="w-3 h-3 text-violet-500" />
                {label}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Tool Card ────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden">

          {/* Options bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <Languages className="w-4 h-4 text-violet-500" />
              OCR Language
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as OcrLanguage)}
              disabled={isProcessing}
              className="text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:opacity-50"
            >
              {LANGUAGE_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Drop zone / file list */}
          <div className="p-5">
            <AnimatePresence mode="wait">
              {!hasFiles ? (
                <motion.div key="drop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <FileDropZone
                    onFileDrop={handleFileDrop}
                    accept={ACCEPTED_EXTS.join(',')}
                  />
                </motion.div>
              ) : (
                <motion.div key="filelist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  {/* Image preview grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {files.map((f, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 aspect-square bg-zinc-100 dark:bg-zinc-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewUrls[i]}
                          alt={f.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                          <p className="text-white text-[10px] text-center font-medium leading-tight line-clamp-2">{f.name}</p>
                          <p className="text-zinc-300 text-[9px]">{formatFileSize(f.size)}</p>
                        </div>
                        <button
                          onClick={() => removeFile(i)}
                          disabled={isProcessing}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-30"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {/* Add more button */}
                    {files.length < 10 && !isProcessing && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex flex-col items-center justify-center gap-1 text-zinc-400 dark:text-zinc-500 hover:border-violet-400 hover:text-violet-500 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        <span className="text-[10px]">Add more</span>
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_EXTS.join(',')}
                    multiple
                    className="sr-only"
                    onChange={handleMultipleFiles}
                  />

                  <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
                    {files.length} image{files.length !== 1 ? 's' : ''} selected
                    {files.length > 1 ? ' — will be merged into one Word document' : ''}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-5 pb-4"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-violet-500" />
                    {progressLabel || 'Processing…'}
                  </span>
                  <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                    {progress}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: 'linear' }}
                  />
                </div>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-600 text-center mt-1.5">
                  OCR is running inside your browser — your images never leave your device.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mx-5 mb-4 flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result card */}
          <AnimatePresence>
            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mx-5 mb-5 rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/40 dark:to-indigo-950/40 border border-violet-200 dark:border-violet-800 p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-white text-sm">Word Document Ready</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {result.wordCount.toLocaleString()} words · {result.pageCount} image{result.pageCount !== 1 ? 's' : ''} · {(result.timeMs / 1000).toFixed(1)}s
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleDownload}
                    className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-violet-500/25 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download .docx
                  </button>
                  {previewText && (
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      {showPreview ? 'Hide' : 'Preview'} Text
                    </button>
                  )}
                  <button
                    onClick={reset}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    New
                  </button>
                </div>

                {/* Text preview */}
                <AnimatePresence>
                  {showPreview && previewText && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 overflow-hidden"
                    >
                      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 max-h-48 overflow-y-auto">
                        <pre className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
                          {previewText.slice(0, 2000)}{previewText.length > 2000 ? '\n…(truncated for preview)' : ''}
                        </pre>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          <div className="px-5 pb-5 flex flex-wrap gap-3 justify-between items-center">
            <button
              onClick={handleConvert}
              disabled={!hasFiles || isProcessing}
              className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-lg shadow-violet-500/20 transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running OCR…
                </>
              ) : (
                <>
                  <ScanText className="w-4 h-4" />
                  Convert to Word
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {hasFiles && !isProcessing && (
              <button
                onClick={reset}
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* ── Feature cards ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {[
            {
              icon: ScanText,
              color: 'text-violet-500',
              bg: 'bg-violet-500/10',
              title: 'Tesseract.js OCR',
              desc: 'Industry-standard OCR engine compiled to WebAssembly for fast, accurate character recognition fully inside your browser tab.',
            },
            {
              icon: FileText,
              color: 'text-indigo-500',
              bg: 'bg-indigo-500/10',
              title: 'Structured DOCX Output',
              desc: 'Headings, bullet lists, numbered lists, and paragraphs are detected and formatted as native Word styles — ready to edit instantly.',
            },
            {
              icon: Globe,
              color: 'text-emerald-500',
              bg: 'bg-emerald-500/10',
              title: '10+ Languages',
              desc: 'Recognise English, Arabic, Urdu, French, German, Spanish, Portuguese, Russian, Chinese, Japanese and more.',
            },
          ].map(({ icon: Icon, color, bg, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:shadow-md transition-shadow"
            >
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="font-semibold text-zinc-900 dark:text-white text-sm mb-1">{title}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* ── Victory illustration ─────────────────────────────────────────── */}
        <div className="mt-8 rounded-2xl border border-violet-100 dark:border-violet-900/30 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20 p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
                Transform Images to Editable Documents in Seconds
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl">
                Compixor runs Tesseract OCR natively in your browser using WebAssembly — the same
                engine trusted by developers worldwide. Your photos, scans, and screenshots are
                converted to properly structured Word documents without leaving your device.
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-3">
                {['No watermarks', 'No file size limits', 'Free forever', 'Works offline'].map((feat) => (
                  <span key={feat} className="inline-flex items-center gap-1 text-xs text-violet-700 dark:text-violet-400 font-medium">
                    <Star className="w-3 h-3 fill-current" />
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── SEO section ──────────────────────────────────────────────────── */}
        <ToolSeoSection toolSlug="img-to-word" />

        {/* ── Related tools ────────────────────────────────────────────────── */}
        <RelatedTools currentTool="img-to-word" />
      </section>
    </main>
  );
}
