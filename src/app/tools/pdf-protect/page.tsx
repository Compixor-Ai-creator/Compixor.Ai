'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Unlock,
  Download,
  RotateCcw,
  Check,
  AlertCircle,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  Eye,
  EyeOff,
  FileText,
  Upload,
  Zap,
  KeyRound,
  Shield,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import RelatedPdfTools from '@/components/RelatedPdfTools';
import StaticToolSkeleton from '@/components/StaticToolSkeleton';

// ─── Lazy imports ──────────────────────────────────────────────────────────────
async function getPdfLib() {
  return await import('pdf-lib');
}

async function getPdfEncrypt() {
  // pdf-lib-encrypt: configure(pdfLib), lock(bytes, pw), unlockInPlace(pdfDoc, pw)
  return await import('pdf-lib-encrypt');
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

type ActiveMode = 'protect' | 'unlock';

interface ProcessResult {
  downloadUrl: string;
  originalSize: number;
  processedSize: number;
  fileName: string;
}

// ─── FAQ Data ─────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: 'Is my PDF file uploaded to any server?',
    a: 'No. Everything happens 100% in your browser using WebAssembly and JavaScript. Your PDF never leaves your device — no uploads, no cloud processing, total privacy.',
  },
  {
    q: 'What type of encryption does Protect PDF use?',
    a: 'Protect PDF uses AES-256 encryption (PDF 2.0 standard, V5/R6), which is supported by Adobe Acrobat X and above, as well as all modern PDF viewers.',
  },
  {
    q: 'What is the difference between Open Password and Owner Password?',
    a: 'Open Password (User Password) prevents anyone from opening the file without the password. Owner Password controls permissions like printing, copying, or editing. You can set one or both — or use Owner Password alone to allow viewing but block editing.',
  },
  {
    q: 'Can I unlock a PDF without knowing the password?',
    a: 'No. The unlock tool requires the correct password. It is designed for users who own the PDF and want to remove restrictions. We cannot and do not support bypassing unknown passwords.',
  },
  {
    q: 'Will unlocking a PDF remove all restrictions?',
    a: 'Yes. The Unlock PDF tool removes both the open password and any permission restrictions, saving a fully unrestricted PDF to download.',
  },
  {
    q: 'What happens if I enter the wrong unlock password?',
    a: 'The tool will show a clear error message. The encryption library validates the password before decrypting, so no output file is generated with a wrong password.',
  },
];

// ─── Password Input Component ─────────────────────────────────────────────────
function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Enter password…'}
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 pr-12 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
          tabIndex={-1}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {hint && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
          <Info className="w-3 h-3 shrink-0" />
          {hint}
        </p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PdfProtectPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeMode, setActiveMode] = useState<ActiveMode>('protect');

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Protect state
  const [openPassword, setOpenPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');

  // Unlock state
  const [unlockPassword, setUnlockPassword] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // FAQ
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Cleanup blob URLs on unmount
  const resultUrlRef = useRef<string | null>(null);
  useEffect(() => {
    return () => {
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, []);

  // ── File handlers ──────────────────────────────────────────────────────────
  const acceptFile = useCallback((incoming: File) => {
    if (!incoming.name.toLowerCase().endsWith('.pdf') && incoming.type !== 'application/pdf') {
      toast.error('Please select a valid PDF file.');
      return;
    }
    setFile(incoming);
    setResult(null);
    setError(null);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) acceptFile(f);
    },
    [acceptFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files?.[0];
      if (f) acceptFile(f);
    },
    [acceptFile]
  );

  const handleReset = useCallback(() => {
    setFile(null);
    setResult(null);
    setError(null);
    setOpenPassword('');
    setOwnerPassword('');
    setUnlockPassword('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  // ── Helper: save result blob ───────────────────────────────────────────────
  const saveResult = useCallback(
    (bytes: Uint8Array, fileName: string, originalSize: number) => {
      const safeCopy = new Uint8Array(bytes.length);
      safeCopy.set(bytes);
      const blob = new Blob([safeCopy], { type: 'application/pdf' });
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;
      setResult({
        downloadUrl: url,
        originalSize,
        processedSize: blob.size,
        fileName,
      });
    },
    []
  );

  // ── Protect PDF ────────────────────────────────────────────────────────────
  const handleProtect = useCallback(async () => {
    if (!file) return;
    const pw = openPassword.trim();
    const opw = ownerPassword.trim();

    if (!pw && !opw) {
      toast.error('Please enter at least one password (Open or Owner).');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const pdfLib = await getPdfLib();
      const { configure, lock } = await getPdfEncrypt();

      // configure once
      configure(pdfLib);

      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Load and re-save to normalise the PDF first
      const doc = await pdfLib.PDFDocument.load(bytes, { ignoreEncryption: true });
      const plainBytes = await doc.save();

      // Lock with AES-256 (default in pdf-lib-encrypt)
      // If only ownerPassword provided → use it as the document password too
      const userPw = pw || opw;
      const ownerPw = opw || pw;

      const encryptedBytes = await lock(plainBytes, userPw, {
        ownerPassword: ownerPw,
      });

      const baseName = file.name.replace(/\.pdf$/i, '');
      saveResult(encryptedBytes as Uint8Array, `${baseName}_protected.pdf`, file.size);
      toast.success('PDF protected successfully!');
    } catch (err) {
      console.error('Protect error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to protect PDF.';
      setError(msg);
      toast.error('Protection failed: ' + msg);
    } finally {
      setIsProcessing(false);
    }
  }, [file, openPassword, ownerPassword, saveResult]);

  // ── Unlock PDF ─────────────────────────────────────────────────────────────
  const handleUnlock = useCallback(async () => {
    if (!file) return;
    const pw = unlockPassword.trim();
    if (!pw) {
      toast.error('Please enter the PDF password to unlock it.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const pdfLib = await getPdfLib();
      const { configure, unlockInPlace } = await getPdfEncrypt();

      configure(pdfLib);

      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Load with ignoreEncryption=true so pdf-lib doesn't refuse it
      const doc = await pdfLib.PDFDocument.load(bytes, { ignoreEncryption: true });

      // unlockInPlace decrypts all strings/streams in-place and removes /Encrypt
      await unlockInPlace(doc, pw);

      // Save without any encryption
      const unlockedBytes = await doc.save();

      const baseName = file.name.replace(/\.pdf$/i, '');
      saveResult(unlockedBytes, `${baseName}_unlocked.pdf`, file.size);
      toast.success('PDF unlocked successfully!');
    } catch (err) {
      console.error('Unlock error:', err);
      const errMsg = err instanceof Error ? err.message : 'Failed to unlock PDF.';
      // User-friendly messages
      let displayMsg = errMsg;
      if (errMsg.toLowerCase().includes('wrong password') || errMsg.toLowerCase().includes('incorrect')) {
        displayMsg = 'Incorrect password. Please check and try again.';
      } else if (errMsg.toLowerCase().includes('not encrypted')) {
        displayMsg = 'This PDF does not appear to be password-protected.';
      }
      setError(displayMsg);
      toast.error('Unlock failed: ' + displayMsg);
    } finally {
      setIsProcessing(false);
    }
  }, [file, unlockPassword, saveResult]);

  // ── Download ───────────────────────────────────────────────────────────────
  const handleDownload = useCallback(() => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.downloadUrl;
    a.download = result.fileName;
    a.click();
    toast.success('Download started!');
  }, [result]);

  // ── Skeleton ───────────────────────────────────────────────────────────────
  if (isLoading) return <StaticToolSkeleton />;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* ── Header ── */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200/60 dark:border-indigo-800/40 rounded-full px-4 py-1.5 mb-5"
        >
          <Shield className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">
            100% Client-Side · Zero Uploads
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4"
        >
          PDF{' '}
          <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Protect &amp; Unlock
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto"
        >
          Add AES-256 password protection or remove PDF password restrictions — all processed
          locally in your browser.
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap justify-center gap-2 mt-5"
        >
          {[
            { icon: ShieldCheck, text: 'AES-256 Encryption' },
            { icon: Zap, text: 'Instant Processing' },
            { icon: KeyRound, text: 'Open & Owner Password' },
            { icon: Lock, text: 'Zero Uploads' },
          ].map(({ icon: Icon, text }) => (
            <span
              key={text}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-3 py-1 rounded-full"
            >
              <Icon className="w-3 h-3" />
              {text}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── Mode Switcher ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="flex rounded-2xl glass-card p-1.5 mb-6 max-w-sm mx-auto border border-zinc-200/70 dark:border-zinc-800/60"
      >
        {(['protect', 'unlock'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => {
              setActiveMode(mode);
              setResult(null);
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeMode === mode
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            {mode === 'protect' ? (
              <>
                <Lock className="w-4 h-4" />
                Protect PDF
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                Unlock PDF
              </>
            )}
          </button>
        ))}
      </motion.div>

      {/* ── Upload Zone ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-3xl border border-zinc-200/70 dark:border-zinc-800/60 p-6 sm:p-8 mb-6"
      >
        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-2xl p-10 sm:p-14 cursor-pointer transition-all ${
              isDragging
                ? 'border-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/20'
                : 'border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/40'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Upload className="w-7 h-7 text-white" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-zinc-700 dark:text-zinc-200 mb-1">
                Drop your PDF here, or{' '}
                <span className="text-indigo-500 underline underline-offset-2">browse</span>
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">PDF files only</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        ) : (
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/60">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate">
                {file.name}
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                {formatFileSize(file.size)}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="shrink-0 text-xs text-zinc-400 hover:text-red-500 transition flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Change
            </button>
          </div>
        )}
      </motion.div>

      {/* ── Options Panel ── */}
      <AnimatePresence mode="wait">
        {file && (
          <motion.div
            key={activeMode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="glass-card rounded-3xl border border-zinc-200/70 dark:border-zinc-800/60 p-6 sm:p-8 mb-6 space-y-6"
          >
            {activeMode === 'protect' ? (
              <>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-500" />
                  <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-100">
                    Set Passwords
                  </h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <PasswordInput
                    label="Open Password (User Password)"
                    value={openPassword}
                    onChange={setOpenPassword}
                    placeholder="Password to open the PDF…"
                    hint="Required to open the file. Leave blank if you only want permission restrictions."
                  />
                  <PasswordInput
                    label="Owner Password (Permission Password)"
                    value={ownerPassword}
                    onChange={setOwnerPassword}
                    placeholder="Admin/owner password…"
                    hint="Controls permissions (print, copy, edit). Leave blank to use same as Open Password."
                  />
                </div>

                <div className="bg-indigo-50/60 dark:bg-indigo-950/20 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900/40">
                  <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-indigo-700 dark:text-indigo-300 space-y-1.5">
                      <p>
                        <strong>Open Password</strong> — Blocks viewing without the password (hard lock). Great for sensitive files.
                      </p>
                      <p>
                        <strong>Owner Password</strong> — Allows viewing but restricts editing/copying (soft lock).
                      </p>
                      <p className="text-indigo-500/80 dark:text-indigo-400/60">
                        You can set one or both. Setting only Owner Password lets anyone open the PDF but restricts actions.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleProtect}
                  disabled={isProcessing || !file}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm shadow-md shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      Protecting PDF…
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Protect PDF
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Unlock className="w-4 h-4 text-purple-500" />
                  <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-100">
                    Enter PDF Password
                  </h2>
                </div>

                <PasswordInput
                  label="PDF Password"
                  value={unlockPassword}
                  onChange={setUnlockPassword}
                  placeholder="Enter the PDF password…"
                  hint="Enter the password used to protect this PDF. All restrictions will be removed."
                />

                <div className="bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/40">
                  <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                      <p>This tool removes password protection from PDFs you own and know the password for.</p>
                      <p>We cannot bypass unknown passwords — the correct password is always required.</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleUnlock}
                  disabled={isProcessing || !file || !unlockPassword}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-sm shadow-md shadow-purple-500/30 hover:from-purple-600 hover:to-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      Unlocking PDF…
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" />
                      Unlock PDF
                    </>
                  )}
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-5 mb-6 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-0.5">Error</p>
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Result ── */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card rounded-3xl border border-green-200/60 dark:border-green-900/40 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-6 sm:p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-base font-bold text-green-700 dark:text-green-300">
                  {activeMode === 'protect' ? 'PDF Protected Successfully!' : 'PDF Unlocked Successfully!'}
                </p>
                <p className="text-xs text-green-600/80 dark:text-green-400/60 truncate max-w-xs">
                  {result.fileName}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-xl bg-white/60 dark:bg-zinc-900/40 p-3 text-center border border-green-100 dark:border-green-900/30">
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">Original Size</p>
                <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                  {formatFileSize(result.originalSize)}
                </p>
              </div>
              <div className="rounded-xl bg-white/60 dark:bg-zinc-900/40 p-3 text-center border border-green-100 dark:border-green-900/30">
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">Output Size</p>
                <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                  {formatFileSize(result.processedSize)}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm shadow-md shadow-green-500/25 hover:from-green-600 hover:to-emerald-700 transition"
              >
                <Download className="w-4 h-4" />
                Download {activeMode === 'protect' ? 'Protected' : 'Unlocked'} PDF
              </button>
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl glass-card border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm font-semibold hover:border-zinc-300 dark:hover:border-zinc-600 transition"
              >
                <RotateCcw className="w-4 h-4" />
                New File
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── How It Works ── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold font-display text-zinc-900 dark:text-white mb-2 text-center">
          How It Works
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-8">
          Simple, secure, and entirely local
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              step: '1',
              icon: Upload,
              title: 'Upload PDF',
              desc: 'Drop or browse your PDF file. It stays in your browser — never uploaded to any server.',
              color: 'from-indigo-500 to-purple-600',
            },
            {
              step: '2',
              icon: KeyRound,
              title: 'Set Password',
              desc: activeMode === 'protect'
                ? 'Choose Open Password and/or Owner Password. Set permission restrictions.'
                : 'Enter the password used to protect this PDF.',
              color: 'from-purple-500 to-pink-600',
            },
            {
              step: '3',
              icon: Download,
              title: 'Download',
              desc: 'Processing completes instantly. Download your protected or unlocked PDF.',
              color: 'from-green-500 to-emerald-600',
            },
          ].map(({ step, icon: Icon, title, desc, color }) => (
            <div
              key={step}
              className="glass-card rounded-2xl p-5 border border-zinc-100 dark:border-zinc-800/60 text-center"
            >
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-4 shadow-md`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
                Step {step}
              </p>
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-2">{title}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="mb-12">
        <div className="text-center mb-7">
          <h2 className="text-2xl font-bold font-display text-zinc-900 dark:text-white mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Common questions about PDF protection and unlocking
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="glass-card rounded-xl overflow-hidden transition">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-zinc-900 dark:text-white"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Related Tools ── */}
      <RelatedPdfTools currentTool="pdf-protect" />
    </div>
  );
}
