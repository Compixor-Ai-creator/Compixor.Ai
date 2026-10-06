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
  ArrowRight,
  Languages,
  Eye,
  X,
  Plus,
  Layers,
  FileCheck2,
} from 'lucide-react';
import WordIcon from '@/components/WordIcon';
import { toast } from 'sonner';
import FileDropZone from '@/components/FileDropZone';
import DropAnywhere from '@/components/DropAnywhere';
import ToolSeoSection from '@/components/ToolSeoSection';
import { ImgToWordPreviewMockup } from '@/components/VisualProofMockup';
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

const ACCEPTED_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif', '.tif', '.tiff'];
const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/bmp',
  'image/gif',
  'image/tiff',
];

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
      const combined = [...prev, ...valid].slice(0, 10);
      const newUrls = valid
        .slice(0, combined.length - prev.length)
        .map((f) => URL.createObjectURL(f));
      setPreviewUrls((p) => [...p, ...newUrls].slice(0, 10));
      return combined;
    });
    setResult(null);
    setError(null);
  }, []);

  const handleFileDrop = useCallback((f: File) => addFiles([f]), [addFiles]);

  const handleMultipleFiles = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) addFiles(Array.from(e.target.files));
      e.target.value = '';
    },
    [addFiles],
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setResult(null);
  }, []);

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
      const res =
        files.length === 1
          ? await convertImageToWord(files[0], { language, onProgress })
          : await convertImagesToWord(files, { language, onProgress });

      const outputName = getOutputFileName(files);

      setResult({
        blob: res.docxBlob,
        wordCount: res.wordCount,
        pageCount: res.pageCount,
        timeMs: res.processingTimeMs,
        outputName,
      });
      setPreviewText(res.textContent);

      // Instant browser download trigger (in-memory Blob)
      const downloadUrl = URL.createObjectURL(res.docxBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = outputName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 60000);

      toast.success('Word document generated and downloaded!');
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

  const hasFiles = files.length > 0;
  const totalOriginalSize = files.reduce((acc, f) => acc + f.size, 0);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Fullscreen Drop Anywhere Drag & Drop Overlay */}
      <DropAnywhere
        onFileDrop={handleFileDrop}
        accept={ACCEPTED_EXTS.join(',')}
        title="Drop image(s) anywhere"
        subtitle="to convert to editable Word (.docx) with OCR instantly (up to 10 images)"
      />

      {/* Header */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Victory / Transformation Preview Card (Locked Image → Editable DOCX) */}
        <div className="w-full flex justify-center mb-6 select-none pointer-events-none">
          <div className="p-3 sm:p-4 rounded-3xl bg-white/60 dark:bg-zinc-900/60 border border-violet-500/20 dark:border-violet-500/30 shadow-lg backdrop-blur-md flex items-center justify-center gap-4 sm:gap-6">
            {/* Left: Raw Locked Image (Problem) */}
            <div className="flex flex-col items-center space-y-1">
              <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl bg-amber-500/10 border-2 border-dashed border-amber-400 relative flex flex-col items-center justify-center p-2">
                <div className="w-10 h-13 rounded-lg bg-white dark:bg-zinc-800 shadow-sm border border-amber-200 dark:border-amber-900/50 flex flex-col items-center justify-between p-1.5">
                  <span className="text-[7.5px] font-bold text-amber-500">IMG</span>
                  <div className="w-full flex items-center justify-center my-0.5">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-[6.5px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-950/60 px-1 rounded">
                    Locked
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-amber-500">Raw Image (Pixels)</span>
            </div>

            {/* Center Arrow with OCR Badge */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-7 h-7 rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-300 flex items-center justify-center font-black text-sm">
                &rarr;
              </div>
              <span className="text-[8px] font-bold text-violet-500 uppercase tracking-wider">
                OCR
              </span>
            </div>

            {/* Right: Editable Word DOCX (Victory) */}
            <div className="flex flex-col items-center space-y-1">
              <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl bg-gradient-to-br from-violet-600/20 via-indigo-600/20 to-purple-600/20 border-2 border-violet-500 relative flex flex-col items-center justify-center p-2 shadow-md">
                <div className="w-10 h-13 rounded-lg bg-white dark:bg-zinc-800 shadow-sm border border-violet-500/40 flex flex-col items-center justify-between p-1.5 relative">
                  <span className="text-[7.5px] font-bold text-violet-600">DOCX</span>
                  <div className="w-full space-y-0.5">
                    <div className="w-full h-0.5 bg-violet-500/60 rounded" />
                    <div className="w-4/5 h-0.5 bg-indigo-500/60 rounded" />
                    <div className="w-3/5 h-0.5 bg-purple-500/60 rounded" />
                  </div>
                  <span className="text-[6.5px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-1 rounded">
                    Editable
                  </span>
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[7px] font-black shadow-xs">
                    ✓
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400">
                100% Editable
              </span>
            </div>
          </div>
        </div>

        {/* Animated Badge Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/25 mb-4 animate-float-subtle shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-violet-500 animate-spin-slow" />
          Tesseract WebAssembly OCR &amp; Batch Image to DOCX
        </div>

        {/* H1 with Option 3 Vibrant Prism (Violet-Fuchsia-Pink) Gradient + Floating Particles */}
        <div className="relative inline-block mb-4">
          <div className="absolute -top-3 -left-5 w-2 h-2 rounded-full bg-violet-400/80 animate-pulse" />
          <div
            className="absolute -top-2 -right-5 w-1.5 h-1.5 rounded-full bg-fuchsia-400/80 animate-pulse"
            style={{ animationDelay: '0.6s' }}
          />
          <div
            className="absolute -bottom-1 left-1/3 w-1.5 h-1.5 rounded-full bg-pink-400/70 animate-pulse"
            style={{ animationDelay: '1.2s' }}
          />
          <Sparkles className="absolute -top-6 right-1 w-4 h-4 text-fuchsia-400/70 animate-spin-slow" />
          <h1 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-zinc-900 dark:text-white">
            <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-400 bg-clip-text text-transparent">
              Image to Word Converter
            </span>{' '}
            <span className="inline-block">Online Free</span>
          </h1>
        </div>

        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto mb-5">
          Convert JPG, PNG, WebP, or scanned photos into fully editable Microsoft Word (.docx)
          documents with local Tesseract OCR. Preserves paragraph layout, text formatting, and image
          clarity — zero blurry pixels, zero uploads.
        </p>

        {/* Clean Keyword Badges / Tags */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-2xl mx-auto">
          {[
            'Image to Word',
            'JPG / PNG to DOCX',
            'Tesseract OCR Engine',
            '10+ Languages Supported',
            '100% In-Browser',
            'Zero Cloud Uploads',
          ].map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-white/70 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/60 backdrop-blur-sm text-zinc-700 dark:text-zinc-300 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              {tag}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Main Workspace Glass Card */}
      <motion.div
        className="glass-card p-6 sm:p-8 rounded-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Upload Dropzone (When no files in batch) */}
        {!hasFiles && (
          <div className="space-y-5">
            <FileDropZone
              accept="image/*,.jpg,.jpeg,.png,.webp,.bmp,.gif,.tif,.tiff"
              onFileDrop={handleFileDrop}
              maxSizeMB={25}
              title="Drop your Image(s) here"
              subtitle="or click to browse from your device (Up to 10 images, max 25MB each)"
            />

            {/* Language Selector Bar Below Dropzone */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-300">
              <div className="flex items-center gap-2 font-medium">
                <Languages className="w-4 h-4 text-violet-500 shrink-0" />
                <span>Default Recognition Language:</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as OcrLanguage)}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 cursor-pointer shadow-xs"
                >
                  {LANGUAGE_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-zinc-400 hidden sm:inline">• 10+ Languages Supported</span>
              </div>
            </div>
          </div>
        )}

        {/* When Files Exist in Batch Queue */}
        {hasFiles && (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                    {files.length} Image{files.length > 1 ? 's' : ''} in Batch Queue
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Total Original Size: {formatFileSize(totalOriginalSize)}
                    {result && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold ml-2">
                        • {result.wordCount.toLocaleString()} words extracted in{' '}
                        {(result.timeMs / 1000).toFixed(1)}s
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {files.length < 10 && !isProcessing && (
                  <label className="cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-lg border border-violet-500/30 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 transition">
                    + Add More
                    <input
                      type="file"
                      accept={ACCEPTED_EXTS.join(',')}
                      multiple
                      className="hidden"
                      onChange={handleMultipleFiles}
                    />
                  </label>
                )}
                <button
                  onClick={reset}
                  disabled={isProcessing}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition disabled:opacity-30 cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Language Selector Option */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-violet-500/5 dark:bg-violet-950/20 border border-violet-500/20 text-xs">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-violet-500 shrink-0" />
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  Select OCR Recognition Language:
                </span>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as OcrLanguage)}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {LANGUAGE_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Grid of uploaded images */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {files.map((f, i) => (
                <div
                  key={i}
                  className="relative group rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 aspect-square bg-zinc-100 dark:bg-zinc-800 shadow-xs"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrls[i]} alt={f.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-2">
                    <p className="text-white text-[10px] text-center font-medium leading-tight line-clamp-2">
                      {f.name}
                    </p>
                    <p className="text-zinc-300 text-[9px]">{formatFileSize(f.size)}</p>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    disabled={isProcessing}
                    aria-label={`Remove ${f.name}`}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500/90 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm disabled:opacity-30 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {files.length < 10 && !isProcessing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-violet-500 hover:bg-violet-500/5 flex flex-col items-center justify-center gap-1.5 text-zinc-400 dark:text-zinc-500 hover:text-violet-600 dark:hover:text-violet-400 transition-all cursor-pointer"
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-[11px] font-semibold">Add more</span>
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

            {/* Processing Progress Bar */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  key="progress"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-2"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-500" />
                      <span className="font-semibold">{progressLabel || 'Processing OCR…'}</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400">
                      {progress}%
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden shadow-inner">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: 'linear' }}
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center mt-2">
                    Tesseract.js WebAssembly OCR running in local browser RAM — zero bytes leave your device.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs sm:text-sm"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">OCR Process Error</p>
                    <p className="mt-0.5">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success / Result Card */}
            <AnimatePresence>
              {result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl bg-gradient-to-br from-emerald-50/90 to-teal-50/90 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200/70 dark:border-emerald-800/50 p-5 sm:p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3.5 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                      <FileCheck2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-white text-base">
                        Word Document Successfully Generated!
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {result.wordCount.toLocaleString()} words extracted across {result.pageCount}{' '}
                        page{result.pageCount !== 1 ? 's' : ''} in{' '}
                        {(result.timeMs / 1000).toFixed(1)}s
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    <button
                      onClick={handleDownload}
                      className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-violet-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download .docx Document</span>
                      <WordIcon className="w-4 h-4" />
                    </button>
                    {previewText && (
                      <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer shadow-xs"
                      >
                        <Eye className="w-4 h-4 text-violet-500" />
                        <span>{showPreview ? 'Hide' : 'Preview'} Text</span>
                      </button>
                    )}
                    <button
                      onClick={reset}
                      className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>New</span>
                    </button>
                  </div>

                  {/* Collapsible Text Preview */}
                  <AnimatePresence>
                    {showPreview && previewText && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 overflow-hidden"
                      >
                        <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 max-h-56 overflow-y-auto shadow-inner">
                          <pre className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
                            {previewText.slice(0, 3000)}
                            {previewText.length > 3000 ? '\n…(truncated for preview)' : ''}
                          </pre>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Action Convert Button */}
            {!result && (
              <div className="pt-2">
                <button
                  onClick={handleConvert}
                  disabled={!hasFiles || isProcessing}
                  className="w-full py-4 px-6 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:via-indigo-500 hover:to-purple-500 text-white rounded-2xl text-base font-bold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.005] active:scale-[0.99] flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Extracting OCR Typography…</span>
                    </>
                  ) : (
                    <>
                      <ScanText className="w-5 h-5" />
                      <span>Convert Image{files.length > 1 ? 's' : ''} to Word (.docx)</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* ── 3 Feature Highlight Cards (Directly below Workspace, matching PDF Compressor standard) ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* Card 1: Tesseract WebAssembly OCR */}
        <div className="p-6 rounded-2xl glass-card flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 p-2.5 flex items-center justify-center mb-4 border border-violet-500/20">
              <ScanText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1">
              Tesseract WebAssembly OCR
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Client-side neural network OCR engine extracts printed and handwritten typography directly
              in device RAM with zero external API calls.
            </p>
          </div>
        </div>

        {/* Card 2: Native DOCX Typography */}
        <div className="p-6 rounded-2xl glass-card flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2.5 flex items-center justify-center mb-4 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1">
              Native DOCX Typography
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Generates genuine Microsoft Word XML (.docx) with real paragraph flows, selectable characters,
              and font scaling — never a flat image wrapper.
            </p>
          </div>
        </div>

        {/* Card 3: Multi-Language Batching */}
        <div className="p-6 rounded-2xl glass-card flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 p-2.5 flex items-center justify-center mb-4 border border-indigo-500/20">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1">
              Multi-Language &amp; Batch
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Process up to 10 photos concurrently across English, Urdu, Arabic, Spanish, French, German,
              and stitch pages into a unified document.
            </p>
          </div>
        </div>
      </section>

      {/* ── How Image to Word OCR Works in Your Browser (Visual Step-by-Step Walkthrough) ── */}
      <section className="mt-16 p-6 sm:p-8 rounded-3xl glass-card border border-zinc-200/80 dark:border-zinc-800/80">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-zinc-900 dark:text-white">
              How Image to Word OCR Works in Your Browser
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Client-side WebAssembly neural text recognition with zero server uploads
            </p>
          </div>

          {/* Visual Step-by-Step Cards (Matching PDF Compressor Layout) */}
          <div className="space-y-12 pt-4">
            {/* Step 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Visual Card 1 */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-50/80 to-zinc-50 dark:from-zinc-900/90 dark:to-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                <div className="bg-white dark:bg-zinc-800/90 rounded-2xl p-4 shadow-sm border border-zinc-200/70 dark:border-zinc-700/60 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span>
                    <span>receipt_scan.jpg</span>
                    <span className="ml-auto text-[11px] bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-300 px-2 py-0.5 rounded-md font-mono">
                      3.4 MB
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-700/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        Browser Tab Sandbox
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                      0 Bytes Transmitted
                    </span>
                  </div>
                </div>
              </div>

              {/* Text for Step 1 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm">
                    1
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Load &amp; Preprocess Image in Memory
                  </h3>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed pl-11">
                  When you drop an image into Compixor, HTML5 Canvas pre-processes contrast, grayscale
                  thresholds, and dimensions locally inside your browser sandbox — zero cloud uploads,
                  processed entirely in device RAM.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Text for Step 2 */}
              <div className="space-y-3 order-2 md:order-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm">
                    2
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Neural OCR Text Recognition
                  </h3>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed pl-11">
                  Tesseract WebAssembly neural models scan pixels for word baselines, character glyphs,
                  and line breaks. Runs directly on your device CPU/GPU with high accuracy across 10+
                  languages.
                </p>
              </div>

              {/* Visual Card 2 */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/80 to-zinc-50 dark:from-zinc-900/90 dark:to-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-sm order-1 md:order-2">
                <div className="bg-white dark:bg-zinc-800/90 rounded-2xl p-4 shadow-sm border border-zinc-200/70 dark:border-zinc-700/60 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-violet-500" />
                      Tesseract.js Engine Active
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full text-[11px]">
                      98.6% Accuracy Score
                    </span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-violet-600 to-indigo-500 h-full w-[98%] rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-500 pt-1">
                    <span className="bg-zinc-50 dark:bg-zinc-900 px-2 py-1 rounded text-center">
                      Layout: Multi-Paragraph
                    </span>
                    <span className="bg-zinc-50 dark:bg-zinc-900 px-2 py-1 rounded text-center">
                      Engine: Client WASM
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Visual Card 3 */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50/80 to-zinc-50 dark:from-zinc-900/90 dark:to-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                <div className="bg-white dark:bg-zinc-800/90 rounded-2xl p-4 shadow-sm border border-zinc-200/70 dark:border-zinc-700/60 space-y-3 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <FileCheck2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                      receipt_scan.docx
                    </h4>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      JPG Scan &rarr; <span className="font-bold text-emerald-600">Editable Word Document</span>
                    </p>
                  </div>
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 text-white text-xs font-semibold shadow-xs">
                      <Download className="w-3.5 h-3.5" /> Instant Single or Batch DOCX
                    </span>
                  </div>
                </div>
              </div>

              {/* Text for Step 3 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm">
                    3
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Instant Safe DOCX Download
                  </h3>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed pl-11">
                  Extracted text is compiled into a clean, compliant Microsoft Word XML document (.docx).
                  Ready for instant download in seconds, fully editable in Microsoft Word, Google Docs,
                  or LibreOffice.
                </p>
              </div>
            </div>
          </div>

          {/* Under the hood technical overview */}
          <div className="space-y-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed pt-4">
            <p>
              Most online image OCR tools upload your receipts, contracts, or personal photos to an external
              server to process them. This poses severe data compliance and confidentiality risks when dealing
              with corporate records or private identity documents.
            </p>
            <p>
              Compixor operates 100% differently. Using WebAssembly, the complete Tesseract OCR neural engine
              and Microsoft Word document generator execute locally inside your browser tab. Zero bytes ever
              leave your device.
            </p>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-white mb-2">
                Here&apos;s what happens under the hood during conversion:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                <li>
                  <strong className="text-zinc-800 dark:text-zinc-200">Canvas Pre-Processing:</strong> Image
                  pixels are normalized for optimal binarization, skew correction, and contrast enhancement.
                </li>
                <li>
                  <strong className="text-zinc-800 dark:text-zinc-200">Neural Glyph Matching:</strong> Tesseract
                  WebAssembly analyzes line heights, font structures, and language patterns.
                </li>
                <li>
                  <strong className="text-zinc-800 dark:text-zinc-200">Document Structure Assembly:</strong> Word
                  paragraphs, line breaks, and page boundaries are programmatically assembled using standard OpenXML.
                </li>
                <li>
                  <strong className="text-zinc-800 dark:text-zinc-200">Lossless DOCX Packaging:</strong> The
                  Word file is zipped and packaged locally into a <code className="text-xs font-mono">.docx</code> file
                  delivered directly to your browser downloads folder.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ── Visual Proof Benchmark Mockup ── */}
      <ImgToWordPreviewMockup />

      {/* ── SEO Section (HowTo Victory + FAQs) ── */}
      <ToolSeoSection toolSlug="img-to-word" />
    </div>
  );
}
