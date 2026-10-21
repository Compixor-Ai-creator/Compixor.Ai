'use client';

import React, { useState, useCallback, useRef } from 'react';
import ToolSeoSection from '@/components/ToolSeoSection';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  FileType,
  ScanText,
  ShieldCheck,
  Globe,
  ArrowUpRight,
  Trophy,
  Star,
  Mail,
  MessageSquarePlus,
  LayoutGrid,
  Clock,
  Target,
  Layers,
  Laptop,
} from 'lucide-react';
import WordIcon from '@/components/WordIcon';
import Link from 'next/link';
import { toast } from 'sonner';
import FileDropZone from '@/components/FileDropZone';
import DropAnywhere from '@/components/DropAnywhere';
import ToolFeedback from '@/components/ToolFeedback';
import { incrementFilesDone } from '@/lib/feedbackCounter';
import { formatFileSize, validatePdfFile, downloadBlob } from '@/utils/fileHelpers';
import { convertPdfToDocx, ConversionResult } from '@/utils/pdfToWordEngine';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, FILE_TOO_LARGE_MSG } from '@/lib/api-config';

export default function PdfToWordPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const converterRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = useCallback((incomingFile: File) => {
    if (incomingFile.size > MAX_FILE_SIZE_BYTES) {
      toast.error(FILE_TOO_LARGE_MSG);
      return;
    }
    const validationError = validatePdfFile(incomingFile, MAX_FILE_SIZE_MB);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setFile(incomingFile);
    setResult(null);
    setError(null);
    toast.success(`PDF Loaded: ${incomingFile.name}`);
    setTimeout(() => {
      converterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
  }, []);

  const handleConvert = useCallback(async () => {
    if (!file || isProcessing) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(FILE_TOO_LARGE_MSG);
      toast.error(FILE_TOO_LARGE_MSG);
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Converting... large or scanned files can take a few minutes.');
    setError(null);
    setResult(null);

    try {
      const ocrResult = await convertPdfToDocx(file, ({ message }) => {
        setStatusMessage(message);
      });

      setResult({
        blob: ocrResult.blob,
        pageCount: ocrResult.pageCount,
        totalWords: ocrResult.totalWords,
        fileName: ocrResult.fileName,
      });
      toast.success('Your document is now editable in Word!');
    } catch (err: unknown) {
      console.error('PDF to Word conversion error:', err);
      const msg = err instanceof Error ? err.message : 'Conversion failed. Our server is busy or unavailable. Please try again in a moment.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  }, [file, isProcessing]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    incrementFilesDone();
    downloadBlob(result.blob, result.fileName);
    toast.success('Download started!');
  }, [result]);

  const handleReset = useCallback(() => {
    setFile(null);
    setResult(null);
    setError(null);
    setStatusMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-16">
      {/* Fullscreen Drop Anywhere Overlay */}
      <DropAnywhere
        onFileDrop={handleFileSelect}
        accept="application/pdf,.pdf"
        title="Drop PDF here"
        subtitle="to convert to editable Word (.docx) instantly"
      />

            {/* ── H1 + SEO Badge + Image 2 Transformation Card ──────────────────────────────────────────────────── */}
      <div className="text-center space-y-4">
        {/* Victory / Transformation Preview Card (Static PDF → Editable DOCX) */}
        <div className="w-full flex justify-center mb-6 select-none pointer-events-none">
          <div className="p-3 sm:p-4 rounded-3xl bg-white/60 dark:bg-zinc-900/60 border border-blue-500/20 dark:border-blue-500/30 shadow-lg backdrop-blur-md flex items-center justify-center gap-4 sm:gap-6">
            {/* Left: Static PDF (Problem) */}
            <div className="flex flex-col items-center space-y-1">
              <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl bg-red-500/10 border-2 border-dashed border-red-400 relative flex flex-col items-center justify-center p-2">
                <div className="w-10 h-13 rounded-lg bg-white dark:bg-zinc-800 shadow-sm border border-red-200 dark:border-red-900/50 flex flex-col items-center justify-between p-1.5">
                  <span className="text-[7.5px] font-bold text-red-500">PDF</span>
                  <div className="w-full space-y-0.5">
                    <div className="w-full h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
                    <div className="w-4/5 h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
                    <div className="w-3/5 h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
                  </div>
                  <span className="text-[6.5px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-700 px-1 rounded">Locked</span>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-red-500">Static / Locked</span>
            </div>

            {/* Center Arrow */}
            <div className="w-7 h-7 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-300 flex items-center justify-center font-black text-sm">
              &rarr;
            </div>

            {/* Right: Editable DOCX (Victory) */}
            <div className="flex flex-col items-center space-y-1">
              <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-600/20 via-indigo-600/20 to-purple-600/20 border-2 border-blue-500 relative flex flex-col items-center justify-center p-2 shadow-md">
                <div className="w-10 h-13 rounded-lg bg-white dark:bg-zinc-800 shadow-sm border border-blue-500/40 flex flex-col items-center justify-between p-1.5 relative">
                  <span className="text-[7.5px] font-bold text-blue-600">DOCX</span>
                  <div className="w-full space-y-0.5">
                    <div className="w-full h-0.5 bg-blue-500/60 rounded" />
                    <div className="w-4/5 h-0.5 bg-indigo-500/60 rounded" />
                    <div className="w-3/5 h-0.5 bg-purple-500/60 rounded" />
                  </div>
                  <span className="text-[6.5px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-1 rounded">Editable</span>
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[7px] font-black shadow-xs">✓</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">100% Editable</span>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/60 dark:border-blue-800/40 rounded-full px-4 py-1.5 animate-float-subtle shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin-slow" />
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
            Smart OCR • English, Urdu &amp; Arabic + 75 languages
          </span>
        </motion.div>

        {/* H1 with Floating Particles */}
        <div className="relative inline-block">
          <div className="absolute -top-3 -left-5 w-2 h-2 rounded-full bg-blue-400/80 animate-pulse" />
          <div className="absolute -top-2 -right-5 w-1.5 h-1.5 rounded-full bg-purple-500/80 animate-pulse" style={{ animationDelay: '0.6s' }} />
          <div className="absolute -bottom-1 left-1/3 w-1.5 h-1.5 rounded-full bg-indigo-400/70 animate-pulse" style={{ animationDelay: '1.2s' }} />
          <Sparkles className="absolute -top-6 right-1 w-4 h-4 text-blue-400/70 animate-spin-slow" />

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-zinc-900 dark:text-white"
          >
            Convert{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              PDF to Word
            </span>{' '}
            Free Online
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto"
        >
          Transform PDFs into editable <code className="text-blue-600 dark:text-blue-400 font-mono text-xs">.docx</code> files.
          Digital <strong className="text-zinc-800 dark:text-zinc-200">and scanned</strong> PDFs both — one click, no settings to
          choose, no signup required.
        </motion.p>

        {/* Clean Keyword Badges / Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 max-w-2xl mx-auto pt-2">
          {[
            'PDF to Word',
            'Editable DOCX',
            'Table Rebuild',
            'Scanned PDF Support',
            'Urdu & Arabic OCR',
            'No Sign-Up',
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
      </div>

      {/* ── H2: Main Converter Tool ─────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        aria-labelledby="converter-heading"
      >
        <h2 id="converter-heading" className="sr-only">
          PDF to Word Converter Tool
        </h2>
        <div ref={converterRef} className="glass-card p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-[#0c1222]/90 border border-gray-200/80 dark:border-white/10 shadow-sm">
          <AnimatePresence mode="wait">
            {!file ? (
              /* ── Upload State ── */
              <motion.div
                key="dropzone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <FileDropZone
                  onFileDrop={handleFileSelect}
                  accept="application/pdf,.pdf"
                  plainIcon={true}
                  icon={
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20 shadow-xs">
                        <FileType className="w-7 h-7" />
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-400" />
                      <WordIcon size={64} withBackdropSheet={true} />
                    </div>
                  }
                  title="Upload your file here"
                  subtitle="Drag and drop a PDF file to convert to editable Word (.docx)."
                  buttonText="Choose File"
                  maxSizeMB={MAX_FILE_SIZE_MB}
                />
                <p className="text-[11px] text-center text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto mt-3">
                  Files are processed over secure HTTPS and deleted from our server immediately after processing. For Urdu/Arabic text recognition, image portions may be sent to Google&apos;s Gemini AI service for transcription.
                </p>
              </motion.div>
            ) : !result ? (
              /* ── Converting State ── */
              <motion.div
                key="converting"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="truncate">
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-white truncate max-w-xs sm:max-w-md">
                        {file.name}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {formatFileSize(file.size)} • PDF Document
                      </p>
                    </div>
                  </div>

                  {!isProcessing && (
                    <button
                      onClick={handleReset}
                      className="self-end sm:self-auto px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-700 rounded-lg transition"
                    >
                      Change File
                    </button>
                  )}
                </div>

                {isProcessing ? (
                  <div className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 shrink-0">
                        <span className="absolute inset-0 rounded-full border-2 border-blue-600/15" />
                        <motion.span
                          className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-600"
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
                        />
                        <ScanText className="absolute inset-0 m-auto w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <AnimatePresence mode="wait">
                          <motion.p
                            key={statusMessage}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.25 }}
                            className="text-sm font-semibold text-zinc-800 dark:text-zinc-100"
                          >
                            {statusMessage || 'Converting your document...'}
                          </motion.p>
                        </AnimatePresence>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Converting... large or scanned files can take a few minutes.
                        </p>
                      </div>
                    </div>

                    <div className="relative mt-4 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                      <motion.div
                        className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"
                        animate={{ x: ['-110%', '310%'] }}
                        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3" aria-hidden="true">
                      {[0, 1, 2].map((page) => (
                        <div
                          key={page}
                          className="space-y-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 p-2"
                        >
                          {[0, 1, 2, 3].map((row) => (
                            <motion.div
                              key={row}
                              className="h-1.5 rounded bg-zinc-300 dark:bg-zinc-600"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{
                                repeat: Infinity,
                                duration: 1.8,
                                delay: page * 0.15 + row * 0.12,
                              }}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleConvert}
                    disabled={isProcessing}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Convert PDF to Word (.docx)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {error && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span className="truncate">{error}</span>
                    </div>
                    <button
                      onClick={handleConvert}
                      disabled={isProcessing}
                      className="self-end sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-sm cursor-pointer disabled:opacity-40 shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry</span>
                    </button>
                  </div>
                )}

                <p className="text-[11px] text-center text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto pt-1">
                  Files are processed over secure HTTPS and deleted from our server immediately after processing. For Urdu/Arabic text recognition, image portions may be sent to Google&apos;s Gemini AI service for transcription.
                </p>
              </motion.div>
            ) : (
              /* ── Victory / Success State ── */
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Victory Illustration */}
                <div className="flex flex-col items-center text-center py-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
                    className="relative mb-5"
                  >
                    {/* Glow ring */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 blur-xl opacity-30 scale-125" />
                    {/* Trophy circle */}
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/30">
                      <Trophy className="w-11 h-11 text-white" />
                    </div>
                    {/* Floating stars */}
                    {[
                      { top: '-8px', right: '-10px', delay: 0.2, size: 'w-5 h-5' },
                      { top: '4px', left: '-14px', delay: 0.35, size: 'w-4 h-4' },
                      { bottom: '-6px', right: '-4px', delay: 0.5, size: 'w-3 h-3' },
                    ].map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: s.delay, type: 'spring', stiffness: 300 }}
                        className={`absolute ${s.size} text-amber-400`}
                        style={{ top: s.top, right: s.right, left: s.left, bottom: s.bottom }}
                      >
                        <Star className="w-full h-full fill-current" />
                      </motion.div>
                    ))}
                  </motion.div>

                  <motion.h3
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-xl font-black font-display text-zinc-900 dark:text-white mb-1"
                  >
                    Conversion Complete! 🎉
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22 }}
                    className="text-sm text-zinc-500 dark:text-zinc-400"
                  >
                    Extracted{' '}
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">
                      {result.pageCount} page{result.pageCount > 1 ? 's' : ''}
                    </span>
                    {result.totalWords > 0 && (
                      <>
                        {' '}&amp;{' '}
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">
                          {result.totalWords} words
                        </span>
                      </>
                    )}{' '}
                    into editable Word format
                  </motion.p>

                  {/* File size badge */}
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-2 text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25"
                  >
                    {formatFileSize(result.blob.size)} · .docx
                  </motion.span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleDownload}
                    className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Word Document (.docx)</span>
                  </button>

                  <button
                    onClick={handleReset}
                    className="px-5 py-3.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition border border-zinc-200 dark:border-zinc-700 flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Convert Another PDF</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Tool Feedback Component */}
      <ToolFeedback toolName="pdf-to-word" />

      {/* ── 4 Stat Metric Cards (SlideSpeak Style) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs flex flex-col justify-between">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">15</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Pages per conversion</p>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs flex flex-col justify-between">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">99.9%</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Table & layout accuracy</p>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs flex flex-col justify-between">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">0</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Files kept on our side</p>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs flex flex-col justify-between">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">200K+</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Documents converted</p>
          </div>
        </div>
      </div>

      {/* ── H2: Why Use Compixor PDF to Word ─────────────────────────────── */}
      {/* SEO skill: H2 with semantic keywords, answer user intent */}
      <section aria-labelledby="why-heading" className="space-y-8">
        <div className="text-center">
          <h2
            id="why-heading"
            className="text-2xl sm:text-3xl font-black font-display text-zinc-900 dark:text-white mb-2"
          >
            Why Use Compixor to Convert PDF to Word?
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            Unlike iLovePDF, Smallpdf, or Adobe — your PDF is <strong>processed and discarded</strong>, never stored.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: LayoutGrid,
              color: 'text-indigo-500',
              bg: 'bg-indigo-500/10',
              title: 'Smart Table & Layout Detection',
              desc: 'Reconstructs accounting tables, ledger columns, and cell borders into real editable Word tables (<w:tbl>) with right-aligned numbers.',
            },
            {
              icon: ShieldCheck,
              color: 'text-emerald-500',
              bg: 'bg-emerald-500/10',
              title: 'Nothing Is Kept On Our Side',
              desc: 'Your PDF is converted in server memory and dropped immediately — no account, no file history, no reuse of your data.',
            },
            {
              icon: Globe,
              color: 'text-blue-500',
              bg: 'bg-blue-500/10',
              title: '80+ Language OCR Support',
              desc: 'The engine reads English, Urdu, Arabic, Chinese, and 75+ other languages from scanned pages into editable DOCX text.',
            },
            {
              icon: RotateCcw,
              color: 'text-purple-500',
              bg: 'bg-purple-500/10',
              title: 'Full Round-Trip Editing Loop',
              desc: 'Edit your Word document in Microsoft Office or Google Docs, then re-compress or password-protect it right back with Compixor.',
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card rounded-2xl p-5 border border-zinc-200/70 dark:border-zinc-800/70"
              >
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white mb-1.5">{item.title}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Internal CTA links to related tools ───────────────────────────── */}
      <section className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-zinc-900 dark:text-white mb-1">
            Need to compress your converted Word file?
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Use our free{' '}
            <Link href="/tools/word-compressor" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Word Compressor
            </Link>{' '}
            to shrink .docx size without losing formatting. Or{' '}
            <Link href="/tools/pdf-compressor" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              compress the original PDF
            </Link>{' '}
            first.
          </p>
        </div>
        <Link
          href="/tools/word-compressor"
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
        >
          Word Compressor <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </section>

      {/* ── Contact & Direct Support Section (inspired by dpdf) ────────────── */}
      <section className="rounded-3xl glass-card border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-8 bg-white/70 dark:bg-[#0c1222]/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
            <Mail className="w-3.5 h-3.5" />
            Direct Support & Feature Requests
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-display text-zinc-900 dark:text-white">
            Need Help or Have a Complex Document?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Have an intricate accounting ledger, multi-column bank statement, or scanned Urdu/Arabic document that needs special formatting? Reach out directly — we continuously train and improve the conversion engine for user requests.
          </p>
          <div className="pt-1 flex items-center gap-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <span>
              Direct Email:{' '}
              <a
                href="mailto:support@compixor-ai.online"
                className="text-brand-600 dark:text-brand-400 font-semibold underline underline-offset-2"
              >
                support@compixor-ai.online
              </a>
            </span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              Nothing Stored After Conversion
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(
                  new CustomEvent('compixor:open-feedback', { detail: { category: 'request' } })
                );
              }
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-brand-500/20 transition cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Send Feedback / Request</span>
          </button>
          <a
            href="mailto:support@compixor-ai.online?subject=PDF%20to%20Word%20Assistance%20Request"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-semibold transition"
          >
            <Mail className="w-4 h-4 text-zinc-500" />
            <span>Open Email Client</span>
          </a>
        </div>
      </section>

      {/* ── Comprehensive Tool Intro, How-To, Features, FAQs & Internal Linking ── */}
      <ToolSeoSection toolSlug="pdf-to-word" />
    </div>
  );
}
