'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  ShieldCheck,
  ArrowRight,
  Eye,
  FileCheck2,
  Upload,
  Trash2,
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
  OcrProgressEvent,
} from '@/utils/imgToWordEngine';

// ── Helpers ────────────────────────────────────────────────────────────────────

function getOutputFileName(file: File): string {
  const base = file.name.replace(/\.[^.]+$/, '');
  return `${base}-converted.docx`;
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
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

  // ── File handling (Single File Focus) ───────────────────────────────────────

  const setSingleFile = useCallback((newFile: File) => {
    if (!isValidImageFile(newFile)) {
      toast.error(`"${newFile.name}" is not a supported image format.`);
      return;
    }
    if (newFile.size > 25 * 1024 * 1024) {
      toast.error(`"${newFile.name}" exceeds the 25 MB limit.`);
      return;
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(newFile);
    setFile(newFile);
    setPreviewUrl(url);
    setResult(null);
    setError(null);
  }, [previewUrl]);

  // Support direct clipboard paste (Ctrl + V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const pastedFile = items[i].getAsFile();
          if (pastedFile) {
            setSingleFile(pastedFile);
            toast.success('Pasted image from clipboard!');
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [setSingleFile]);

  const handleFileDrop = useCallback((f: File) => setSingleFile(f), [setSingleFile]);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) setSingleFile(selected);
      e.target.value = '';
    },
    [setSingleFile],
  );

  const reset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setProgressLabel('');
    setPreviewText(null);
    setShowPreview(false);
  }, [previewUrl]);

  // ── Conversion (Universal AI Engine v10) ────────────────────────────────────

  const handleConvert = useCallback(async () => {
    if (!file) return;
    setIsProcessing(true);
    setResult(null);
    setError(null);
    setProgress(0);
    setProgressLabel('AI is working: Uploading image…');

    const onProgress = (evt: OcrProgressEvent) => {
      setProgress(Math.round(evt.progress * 100));
      setProgressLabel(evt.status);
    };

    try {
      const res = await convertImageToWord(file, { onProgress });
      const outputName = getOutputFileName(file);

      setResult({
        blob: res.docxBlob,
        wordCount: res.wordCount,
        pageCount: res.pageCount,
        timeMs: res.processingTimeMs,
        outputName,
      });
      setPreviewText(res.textContent);

      // Manual download only: Do NOT automatically trigger browser download
      toast.success('Word document generated successfully! Click below to download.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'OCR conversion failed unexpectedly.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  }, [file]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.outputName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }, [result]);

  const hasFile = file !== null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Fullscreen Drop Anywhere Drag & Drop Overlay */}
      <DropAnywhere
        onFileDrop={handleFileDrop}
        accept={ACCEPTED_EXTS.join(',')}
        title="Drop image anywhere"
        subtitle="to convert to editable Word (.docx) with Universal AI OCR instantly"
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
          Universal AI Document Engine &amp; Image to DOCX
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
          documents with Universal AI OCR. Preserves paragraph layout, text formatting, and table
          grids — zero data leak, zero blurry pixels.
        </p>

        {/* Clean Keyword Badges / Tags */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-2xl mx-auto">
          {[
            { label: 'Zero Data Leak', icon: ShieldCheck, highlight: true },
            { label: 'Universal AI Engine v10', icon: Sparkles },
            { label: 'Table Grid Reconstruction', icon: CheckCircle2 },
            { label: 'English & Urdu Multilingual', icon: CheckCircle2 },
            { label: 'Native Word DOCX', icon: CheckCircle2 },
            { label: 'In-Memory Processing', icon: CheckCircle2 },
          ].map(({ label, icon: Icon, highlight }) => (
            <span
              key={label}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm shadow-xs ${
                highlight
                  ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold'
                  : 'bg-white/70 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-emerald-500'}`} />
              {label}
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
        {/* Upload Dropzone (When no file selected) */}
        {!hasFile && (
          <div className="space-y-4">
            <FileDropZone
              accept="image/*,.jpg,.jpeg,.png,.webp,.bmp,.gif,.tif,.tiff"
              onFileDrop={handleFileDrop}
              maxSizeMB={25}
              title="Drop your Image here"
              subtitle="or click to browse from your device (Single image, max 25MB)"
            />
            <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 pt-1">
              <Sparkles className="w-3.5 h-3.5 text-violet-500 shrink-0" />
              <span>Universal AI Engine auto-detects tables, English, Urdu &amp; Arabic text</span>
            </div>
          </div>
        )}

        {/* When File is Selected */}
        {hasFile && file && (
          <div className="space-y-6">
            {/* Uploaded Source Document Card (Always visible when file is loaded) */}
            <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 bg-zinc-50/70 dark:bg-zinc-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Thumbnail with Source Image */}
                {previewUrl ? (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shrink-0 shadow-xs relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold shrink-0">
                    <FileText className="w-8 h-8" />
                  </div>
                )}

                {/* File Details & Badges */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {result ? (
                      <>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-200/70 dark:bg-zinc-700/60 px-2 py-0.5 rounded-md border border-zinc-300/80 dark:border-zinc-600">
                          <ImageIcon className="w-3 h-3 text-violet-500" />
                          Uploaded Original Image
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Converted Successfully
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Single Document Mode
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">
                          <ShieldCheck className="w-3 h-3" />
                          Zero Data Leak
                        </span>
                      </>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white truncate max-w-xs sm:max-w-md">
                    {file.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    File Size: {formatFileSize(file.size)} • Auto-detects tables, English &amp; Urdu
                  </p>
                </div>
              </div>

              {/* Actions: Change Image (with icon) & Remove (with icon) */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {!isProcessing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold px-3 py-2 rounded-xl border border-violet-500/30 text-violet-600 dark:text-violet-400 bg-violet-500/5 hover:bg-violet-500/15 transition shadow-xs"
                    title="Select a different image"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Change Image</span>
                  </button>
                )}
                <button
                  onClick={reset}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition disabled:opacity-30 cursor-pointer"
                  title="Remove image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>

            {/* Hidden File Input for Change Image */}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_EXTS.join(',')}
              className="sr-only"
              onChange={handleFileInputChange}
            />

            {/* Laser Scan AI Animation During Processing (Theme Adaptive) */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  key="progress"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-6 sm:p-7 rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-violet-200 dark:border-violet-500/40 space-y-5 shadow-xl backdrop-blur-sm"
                >
                  {/* Large Transformation Cards with Continuous Laser Scan Beam */}
                  <div className="flex items-center justify-center gap-5 sm:gap-8 py-3">
                    {/* Left: Document Card with Laser Scanning Beam */}
                    <div className="relative w-20 h-28 sm:w-24 sm:h-32 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border-2 border-violet-400/70 dark:border-violet-500/60 overflow-hidden flex flex-col items-center justify-center shadow-lg shadow-violet-500/10 dark:shadow-violet-500/20">
                      {previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewUrl} alt={file.name} className="w-full h-full object-cover opacity-90 dark:opacity-75" />
                      ) : (
                        <FileText className="w-9 h-9 text-violet-500 dark:text-violet-400" />
                      )}
                      <div className="absolute inset-0 bg-violet-600/5 dark:bg-violet-950/25 pointer-events-none" />
                      
                      {/* Continuous Moving Laser Scanning Beam */}
                      <motion.div
                        className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 shadow-[0_0_14px_#c084fc] z-20 pointer-events-none"
                        animate={{ top: ['4%', '92%', '4%'] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                      />
                      
                      <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white bg-zinc-900/80 dark:bg-black/75 px-1.5 py-0.5 rounded backdrop-blur-xs z-20 uppercase tracking-widest shadow-xs">
                        Scanning
                      </span>
                    </div>

                    {/* Dynamic Arrow */}
                    <div className="flex flex-col items-center gap-1 text-violet-600 dark:text-violet-400">
                      <span className="text-2xl sm:text-3xl font-bold animate-pulse">&rarr;</span>
                      <span className="text-[10px] font-mono font-bold text-violet-600 dark:text-violet-300">AI OCR</span>
                    </div>

                    {/* Right: Word DOCX Victory Card with Word Logo */}
                    <div className="relative w-20 h-28 sm:w-24 sm:h-32 rounded-2xl bg-blue-50/90 dark:bg-blue-600/20 border-2 border-blue-400/70 dark:border-blue-500/50 flex flex-col items-center justify-center shadow-lg shadow-blue-500/10 dark:shadow-blue-500/20">
                      <WordIcon className="w-12 h-12" />
                      <span className="text-[9px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded uppercase tracking-widest mt-2">
                        DOCX
                      </span>
                    </div>
                  </div>

                  {/* AI Progress Label with Ping Dot */}
                  <div className="text-center space-y-1.5">
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-violet-700 dark:text-violet-200 bg-violet-500/10 dark:bg-violet-500/20 px-3.5 py-1.5 rounded-full border border-violet-500/25 dark:border-violet-500/40 shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-violet-600 dark:bg-violet-400 animate-ping" />
                      <span>{progressLabel || 'AI is working: Scanning image layout & table grids...'}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Ephemeral RAM buffer • Auto-purged after conversion
                    </p>
                  </div>

                  {/* Animated Gradient Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                      <span>Neural Extraction</span>
                      <span className="text-violet-600 dark:text-violet-400 font-bold">{progress}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden shadow-inner">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: 'linear' }}
                      />
                    </div>
                  </div>
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

            {/* Success / Result Card (Manual Download + Prominent Word Logo) */}
            <AnimatePresence>
              {result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-3xl bg-gradient-to-br from-emerald-50/90 via-teal-50/70 to-blue-50/60 dark:from-emerald-950/40 dark:via-zinc-900 dark:to-teal-950/30 border border-emerald-300/70 dark:border-emerald-800/60 p-5 sm:p-7 shadow-lg"
                >
                  <div className="flex items-center gap-3.5 mb-5">
                    {/* Prominent Word Logo in Result Header */}
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/15 border border-blue-500/25 p-2 flex items-center justify-center shrink-0 shadow-sm">
                      <WordIcon className="w-8 h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-zinc-900 dark:text-white text-base">
                          Word Document Successfully Generated!
                        </h4>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Zero Data Leak
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">
                        {result.outputName} • Ready to download (Generated in{' '}
                        {(result.timeMs / 1000).toFixed(1)}s)
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={handleDownload}
                      className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-md shadow-violet-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    >
                      <Download className="w-4 h-4 shrink-0" />
                      <span className="sm:hidden">Download .docx</span>
                      <span className="hidden sm:inline">Download Word Document (.docx)</span>
                      <WordIcon className="w-4 h-4 shrink-0" />
                    </button>
                    {previewText && (
                      <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer shadow-xs"
                      >
                        <Eye className="w-4 h-4 text-violet-500 shrink-0" />
                        <span>{showPreview ? 'Hide' : 'Preview'} Text</span>
                      </button>
                    )}
                    <button
                      onClick={reset}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                      <span>Convert Another</span>
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
                  disabled={!file || isProcessing}
                  className="w-full py-4 px-6 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:via-indigo-500 hover:to-purple-500 text-white rounded-2xl text-base font-bold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.005] active:scale-[0.99] flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{progressLabel || 'Extracting Typography…'}</span>
                    </>
                  ) : (
                    <>
                      <ScanText className="w-5 h-5" />
                      <span>Convert Image to Word (.docx)</span>
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

        {/* Card 3: Multi-Language & Layouts */}
        <div className="p-6 rounded-2xl glass-card flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 p-2.5 flex items-center justify-center mb-4 border border-indigo-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1">
              Multi-Language &amp; Layouts
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Universal AI recognition extracts English, Urdu, Arabic, numbers, and tabular data with
              accurate spatial reconstruction into Word.
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
                  thresholds, and dimensions locally inside your browser sandbox — zero data leak,
                  processed securely in device RAM.
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
