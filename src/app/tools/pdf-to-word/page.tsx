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
} from 'lucide-react';
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
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/60 dark:border-blue-800/40 rounded-full px-4 py-1.5"
        >
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
            100% In-Browser • No OCR & OCR Modes • Zero Cloud Uploads
          </span>
        </motion.div>

        {/* H1 — primary keyword first per SEO skill */}
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
        <div className="glass-card p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-[#0c1222]/90 border border-gray-200/80 dark:border-white/10 shadow-sm">
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
                  title="Drop your PDF here or browse"
                  subtitle="Supports digital & scanned PDFs up to 100 MB • 100% private"
                  icon={<FileType className="w-8 h-8 text-blue-500" />}
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {
              icon: ShieldCheck,
              color: 'text-emerald-500',
              bg: 'bg-emerald-500/10',
              title: '100% Private — Zero Uploads',
              desc: 'Your PDF is processed in browser RAM. Nothing is sent to any server, ever. Perfect for confidential documents.',
            },
            {
              icon: Globe,
              color: 'text-blue-500',
              bg: 'bg-blue-500/10',
              title: '80+ Language OCR Support',
              desc: 'OCR mode reads English, Urdu, Arabic, French, German, Chinese, and 75+ other languages from scanned PDFs.',
            },
            {
              icon: Zap,
              color: 'text-amber-500',
              bg: 'bg-amber-500/10',
              title: 'No OCR = Instant Conversion',
              desc: 'Digital PDFs convert in seconds — no queue, no wait, no signup. Just upload and download your .docx.',
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
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

      {/* ── FAQs — SEO skill: FAQ schema + featured snippets ─────────────── */}
      <FaqSection
        faqs={pdfToWordFaqs}
        title="PDF to Word Converter — Frequently Asked Questions"
        subtitle="Common questions about No OCR mode, OCR mode, scanned PDFs, privacy, and language support"
      />
    </div>
  );
}
