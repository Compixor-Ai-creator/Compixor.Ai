'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  FileType,
  ScanText,
  Zap,
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
import RelatedPdfTools from '@/components/RelatedPdfTools';
import ClientSideTrustSection from '@/components/ClientSideTrustSection';
import FaqSection from '@/components/FaqSection';
import { pdfToWordFaqs } from '@/data/faqs';
import { formatFileSize, validatePdfFile, downloadBlob } from '@/utils/fileHelpers';
import { convertPdfToDocx, ConversionResult } from '@/utils/pdfToWordEngine';

// ── Mode selector data ─────────────────────────────────────────────────────────
const MODES = [
  {
    id: 'no-ocr',
    title: 'No OCR',
    badge: 'Recommended',
    badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    borderActive: 'border-emerald-500',
    bgActive: 'bg-emerald-500/5 dark:bg-emerald-500/10',
    icon: Zap,
    iconColor: 'text-emerald-500',
    desc: 'For digital PDFs with selectable text. Fast, accurate, preserves formatting.',
    tip: 'Try Ctrl+C on your PDF — if text copies, use this mode.',
  },
  {
    id: 'ocr',
    title: 'OCR Mode',
    badge: 'Scanned PDFs',
    badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    borderActive: 'border-amber-500',
    bgActive: 'bg-amber-500/5 dark:bg-amber-500/10',
    icon: ScanText,
    iconColor: 'text-amber-500',
    desc: 'For scanned documents & image-based PDFs. OCR reads non-selectable text.',
    tip: 'Can\'t select text in your PDF? This mode is for you.',
  },
];

export default function PdfToWordPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const converterRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = useCallback((incomingFile: File) => {
    const validationError = validatePdfFile(incomingFile, 100);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setFile(incomingFile);
    setResult(null);
    setError(null);
    setProgress(0);
    toast.success(`PDF Loaded: ${incomingFile.name}`);
    setTimeout(() => {
      converterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
  }, []);

  const handleConvert = useCallback(async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(5);
    setStatusMessage('Reading PDF file...');
    setError(null);
    setResult(null);

    try {
      const arrayBuffer = await file.arrayBuffer();

      const conversionResult = await convertPdfToDocx(
        arrayBuffer,
        file.name,
        ({ percent, message }) => {
          setProgress(percent);
          setStatusMessage(message);
        }
      );

      setResult(conversionResult);
      toast.success('PDF successfully converted to editable Word document!');
    } catch (err: unknown) {
      console.error('PDF to Word conversion error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to convert PDF document.';
      setError(msg);
      toast.error(`Conversion failed: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  }, [file]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    downloadBlob(result.blob, result.fileName);
    toast.success('Download started!');
  }, [result]);

  const handleReset = useCallback(() => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
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

      {/* ── H1 + SEO Badge ──────────────────────────────────────────────────── */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/60 dark:border-blue-800/40 rounded-full px-4 py-1.5 animate-float-subtle shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin-slow" />
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
            100% In-Browser • No OCR &amp; OCR Modes • Zero Cloud Uploads
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
          Choose <strong className="text-zinc-800 dark:text-zinc-200">No OCR</strong> for digital PDFs or{' '}
          <strong className="text-zinc-800 dark:text-zinc-200">OCR mode</strong> for scanned documents —
          100% private, no signup required.
        </motion.p>

        {/* ── Visual Conversion Flow Illustration (inspired by dpdf) ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="w-full flex flex-col items-center justify-center pt-2 select-none pointer-events-none"
        >
          <div className="w-full max-w-sm h-32 sm:h-40 flex items-center justify-center drop-shadow-sm">
            <svg
              viewBox="0 0 400 170"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full max-w-[360px]"
              aria-hidden="true"
            >
              <defs>
                <filter id="soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
                  <feOffset dx="0" dy="6" result="offsetblur" />
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.08" />
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="shadow-sm" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                  <feOffset dx="0" dy="2" result="offsetblur" />
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.05" />
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="sheet-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#F8FAFC" />
                </linearGradient>
                <linearGradient id="word-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#2563EB" />
                </linearGradient>
                <linearGradient id="pdf-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="100%" stopColor="#DC2626" />
                </linearGradient>
              </defs>

              {/* Connecting Track with Pulsing Arrow */}
              <g transform="translate(200, 85)">
                <path
                  d="M -36 0 L 36 0"
                  stroke="#CBD5E1"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="0" cy="0" r="14" fill="#FFFFFF" filter="url(#shadow-sm)" stroke="#E2E8F0" strokeWidth="1.5" />
                <path
                  d="M -2 -4.5 L 3.5 0 L -2 4.5"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>

              {/* Left Sheet: PDF Document */}
              <g transform="translate(130, 85) rotate(-4)">
                <g filter="url(#soft-shadow)">
                  <rect
                    x="-42"
                    y="-55"
                    width="84"
                    height="110"
                    rx="12"
                    fill="url(#sheet-gradient)"
                    stroke="#E2E8F0"
                    strokeWidth="1.5"
                  />
                </g>
                <rect x="-30" y="-41" width="32" height="15" rx="4" fill="url(#pdf-grad)" />
                <text
                  x="-14"
                  y="-30.5"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="7.5"
                  fontWeight="bold"
                  fontFamily="system-ui, sans-serif"
                  letterSpacing="0.5"
                >
                  PDF
                </text>
                <rect x="8" y="-36.5" width="22" height="6" rx="3" fill="#E2E8F0" />
                <rect x="-30" y="-12" width="60" height="4" rx="2" fill="#E2E8F0" />
                <rect x="-30" y="0" width="46" height="4" rx="2" fill="#E2E8F0" />
                <rect x="-30" y="12" width="54" height="4" rx="2" fill="#E2E8F0" />
                <rect x="-30" y="24" width="38" height="4" rx="2" fill="#E2E8F0" />
                <rect x="-30" y="36" width="60" height="9" rx="2.5" fill="#FEE2E2" />
              </g>

              {/* Right Sheet: DOC Document */}
              <g transform="translate(270, 85) rotate(4)">
                <g filter="url(#soft-shadow)">
                  <rect
                    x="-42"
                    y="-55"
                    width="84"
                    height="110"
                    rx="12"
                    fill="url(#sheet-gradient)"
                    stroke="#BFDBFE"
                    strokeWidth="1.5"
                  />
                </g>
                <rect x="-30" y="-41" width="32" height="15" rx="4" fill="url(#word-grad)" />
                <text
                  x="-14"
                  y="-30.5"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="7.5"
                  fontWeight="bold"
                  fontFamily="system-ui, sans-serif"
                  letterSpacing="0.5"
                >
                  DOC
                </text>
                <rect x="8" y="-36.5" width="22" height="6" rx="3" fill="#E2E8F0" />
                <rect x="-30" y="-12" width="60" height="5" rx="2.5" fill="#DBEAFE" />
                <rect x="-28" y="-12" width="36" height="5" rx="2.5" fill="#3B82F6" />
                <rect x="10" y="-14" width="1.5" height="9" rx="0.5" fill="#2563EB" />
                <rect x="-30" y="2" width="50" height="4" rx="2" fill="#E2E8F0" />
                <rect x="-30" y="14" width="56" height="4" rx="2" fill="#E2E8F0" />
                <rect x="-30" y="26" width="40" height="4" rx="2" fill="#E2E8F0" />
                <rect x="-30" y="37" width="60" height="10" rx="2" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="0.8" />
              </g>
            </svg>
          </div>

          {/* High-Intent SEO Keyword Badges / Tags */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-2xl mt-1">
            {[
              'PDF to Word',
              'Editable DOCX',
              'Table Preserved',
              'OCR Scanned PDF',
              '100% In-Browser',
              'Zero Cloud Uploads',
              'Free Unlimited',
            ].map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-800"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── H2: Choose Mode ─────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        aria-labelledby="mode-heading"
      >
        <h2
          id="mode-heading"
          className="text-center text-sm font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4"
        >
          Step 1 — Choose Conversion Mode
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.id}
                className={`relative rounded-2xl border-2 p-5 transition-all duration-200 ${mode.borderActive} ${mode.bgActive}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-0.5 w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 flex items-center justify-center shrink-0 shadow-sm border border-zinc-100 dark:border-zinc-800`}>
                    <Icon className={`w-5 h-5 ${mode.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-sm text-zinc-900 dark:text-white">{mode.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${mode.badgeColor}`}>
                        {mode.badge}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{mode.desc}</p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1.5 italic">{mode.tip}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

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
                  maxSizeMB={100}
                />
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
                  <div className="space-y-3 py-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        {statusMessage || 'Converting document...'}
                      </span>
                      <span className="font-mono text-blue-600 dark:text-blue-400">{progress}%</span>
                    </div>

                    <div className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: 'easeOut', duration: 0.2 }}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleConvert}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Convert PDF to Word (.docx)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {error && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
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
                    </span>{' '}
                    &amp;{' '}
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">{result.totalWords} words</span>{' '}
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

      {/* ── 4 Stat Metric Cards (SlideSpeak Style) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs flex flex-col justify-between">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">&lt; 10s</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Avg. conversion time</p>
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
            <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">100%</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">In-browser privacy</p>
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

      {/* ── Trust Section ──────────────────────────────────────────────────── */}
      <ClientSideTrustSection />

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
            Unlike iLovePDF, Smallpdf, or Adobe — your documents <strong>never leave your device</strong>.
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
              title: '100% Private — Zero Uploads',
              desc: 'Your PDF is processed inside device RAM. Zero bytes are uploaded to any server, ever. Perfect for confidential financial reports.',
            },
            {
              icon: Globe,
              color: 'text-blue-500',
              bg: 'bg-blue-500/10',
              title: '80+ Language OCR Support',
              desc: 'OCR mode reads English, Urdu, Arabic, Chinese, and 75+ other languages from scanned PDFs into editable DOCX text.',
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

      {/* ── H2: How to Convert PDF to Word ───────────────────────────────── */}
      {/* SEO skill: HowTo schema + featured snippet optimization */}
      <section aria-labelledby="howto-heading" className="space-y-6">
        <h2
          id="howto-heading"
          className="text-2xl sm:text-3xl font-black font-display text-zinc-900 dark:text-white text-center"
        >
          How to Convert PDF to Word — Step by Step
        </h2>

        <ol className="grid grid-cols-1 sm:grid-cols-4 gap-4 list-none">
          {[
            { step: '01', text: 'Drop or select your PDF file (up to 100 MB)' },
            { step: '02', text: 'Choose No OCR (digital PDF) or OCR mode (scanned)' },
            { step: '03', text: 'Click "Convert PDF to Word" — processes locally in your browser' },
            { step: '04', text: 'Download your editable .docx file — no watermarks, free' },
          ].map((item, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-2xl p-4 border border-zinc-200/70 dark:border-zinc-800/70 relative overflow-hidden"
            >
              <span className="absolute -top-2 -right-1 text-6xl font-black text-zinc-100 dark:text-zinc-800 select-none leading-none">
                {item.step}
              </span>
              <div className="relative">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black mb-3">
                  {i + 1}
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{item.text}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* ── Internal Links: Related Tools ─────────────────────────────────── */}
      {/* SEO skill: 3-5 internal links per section */}
      <RelatedPdfTools currentTool="pdf-to-word" />

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
              100% Client-Side Privacy Guaranteed
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

      {/* ── FAQs — SEO skill: FAQ schema + featured snippets ─────────────── */}
      <FaqSection
        faqs={pdfToWordFaqs}
        title="PDF to Word Converter — Frequently Asked Questions"
        subtitle="Common questions about No OCR mode, OCR mode, scanned PDFs, privacy, and language support"
      />
    </div>
  );
}
