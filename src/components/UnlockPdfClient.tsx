'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Unlock,
  Download,
  RotateCcw,
  Check,
  AlertCircle,
  Sparkles,
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
import DropAnywhere from '@/components/DropAnywhere';
import RelatedPdfTools from '@/components/RelatedPdfTools';
import { formatFileSize, validatePdfFile, isPdfPasswordError } from '@/utils/fileHelpers';
import { getPdfLib, getPdfEncrypt } from '@/utils/pdfLoader';

interface ProcessResult {
  downloadUrl: string;
  originalSize: number;
  processedSize: number;
  fileName: string;
}

export default function UnlockPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password & visibility
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cleanup blob URLs on unmount
  const resultUrlRef = useRef<string | null>(null);
  useEffect(() => {
    return () => {
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, []);

  const acceptFile = useCallback((incoming: File) => {
    const validationError = validatePdfFile(incoming, 100);
    if (validationError) {
      toast.error(validationError);
      setError(validationError);
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
    setPassword('');
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleUnlock = useCallback(async () => {
    if (!file) return;
    const pw = password.trim();
    if (!pw) {
      const msg = 'Please enter the PDF password.';
      toast.error(msg);
      setError(msg);
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

      if (bytes.length === 0) {
        throw new Error('The uploaded file is empty (0 bytes).');
      }

      // Load with ignoreEncryption=true so pdf-lib doesn't refuse it
      const doc = await pdfLib.PDFDocument.load(bytes, { ignoreEncryption: true });

      // Decrypt all streams & strings in-place and remove /Encrypt
      await unlockInPlace(doc, pw);

      const unlockedBytes = await doc.save();

      const safeCopy = new Uint8Array(unlockedBytes.length);
      safeCopy.set(unlockedBytes);
      const blob = new Blob([safeCopy], { type: 'application/pdf' });

      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;

      const baseName = file.name.replace(/\.pdf$/i, '');
      setResult({
        downloadUrl: url,
        originalSize: file.size,
        processedSize: blob.size,
        fileName: `${baseName}_unlocked.pdf`,
      });
      toast.success('PDF unlocked & restrictions removed!');
    } catch (err) {
      console.error('Unlock error:', err);
      const errMsg = err instanceof Error ? err.message : 'Failed to unlock PDF.';
      let displayMsg = errMsg;
      if (
        isPdfPasswordError(err) ||
        errMsg.toLowerCase().includes('wrong password') ||
        errMsg.toLowerCase().includes('incorrect')
      ) {
        displayMsg = 'Incorrect password for this PDF. Please check your password and try again.';
      } else if (errMsg.toLowerCase().includes('not encrypted')) {
        displayMsg = 'This PDF is not password-protected.';
      }
      setError(displayMsg);
      toast.error(displayMsg);
    } finally {
      setIsProcessing(false);
    }
  }, [file, password]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.downloadUrl;
    a.download = result.fileName;
    a.click();
    toast.success('Download started!');
  }, [result]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <DropAnywhere
        onFileDrop={acceptFile}
        accept="application/pdf,.pdf"
        title="Drop PDF anywhere to unlock"
        subtitle="100% private in-browser decryption & restriction removal"
      />

      {/* Feature Badges */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {[
          { icon: ShieldCheck, text: 'Instant In-Memory Decryption' },
          { icon: KeyRound, text: 'Removes All Permission Locks' },
          { icon: Zap, text: 'Zero Server Uploads' },
          { icon: Shield, text: '100% Confidential' },
        ].map(({ icon: Icon, text }) => (
          <span
            key={text}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/40 px-3.5 py-1.5 rounded-full"
          >
            <Icon className="w-3.5 h-3.5 text-purple-500" />
            {text}
          </span>
        ))}
      </div>

      {/* Upload Zone */}
      <div className="glass-card rounded-3xl border border-zinc-200/70 dark:border-zinc-800/60 p-6 sm:p-8 mb-6 shadow-sm">
        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-2xl p-10 sm:p-14 cursor-pointer transition-all ${
              isDragging
                ? 'border-purple-400 bg-purple-50/60 dark:bg-purple-950/20'
                : 'border-zinc-200 dark:border-zinc-700 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/40'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Upload className="w-7 h-7 text-white" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-zinc-700 dark:text-zinc-200 mb-1">
                Drop your password-protected PDF here, or{' '}
                <span className="text-purple-500 underline underline-offset-2">browse</span>
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">Max size 100MB · 100% private</p>
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0 shadow">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate">{file.name}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{formatFileSize(file.size)}</p>
            </div>
            <button
              onClick={handleReset}
              className="shrink-0 text-xs text-zinc-400 hover:text-red-500 transition flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Change
            </button>
          </div>
        )}
      </div>

      {/* Password Input Panel */}
      {file && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl border border-zinc-200/70 dark:border-zinc-800/60 p-6 sm:p-8 mb-6 space-y-6 shadow-sm"
        >
          <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
            <Unlock className="w-5 h-5 text-purple-500" />
            <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-100">
              Enter Document Password
            </h2>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="unlock-password-input" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <div className="relative">
              <input
                id="unlock-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter the PDF password…"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 pr-12 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
              <Info className="w-3 h-3 shrink-0" />
              Enter the correct password. All open and edit restrictions will be completely removed.
            </p>
          </div>

          <button
            onClick={handleUnlock}
            disabled={isProcessing || !file || !password.trim()}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-sm shadow-md shadow-purple-500/30 hover:from-purple-600 hover:to-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Sparkles className="w-4 h-4 animate-pulse" />
                Unlocking &amp; Decrypting PDF…
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                Unlock &amp; Remove Restrictions
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Error Message */}
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

      {/* Result Display */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card rounded-3xl border border-green-200/60 dark:border-green-900/40 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-6 sm:p-8 mb-8 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-base font-bold text-green-700 dark:text-green-300">
                  PDF Decrypted &amp; Unlocked!
                </p>
                <p className="text-xs text-green-600/80 dark:text-green-400/60 truncate max-w-xs">
                  {result.fileName}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-xl bg-white/60 dark:bg-zinc-900/40 p-3 text-center border border-green-100 dark:border-green-900/30">
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">Encrypted Size</p>
                <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                  {formatFileSize(result.originalSize)}
                </p>
              </div>
              <div className="rounded-xl bg-white/60 dark:bg-zinc-900/40 p-3 text-center border border-green-100 dark:border-green-900/30">
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">Unlocked Size</p>
                <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                  {formatFileSize(result.processedSize)}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm shadow-md shadow-green-500/25 hover:from-green-600 hover:to-emerald-700 transition"
              >
                <Download className="w-4 h-4" />
                Download Unlocked PDF
              </button>
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl glass-card border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm font-semibold hover:border-zinc-300 dark:hover:border-zinc-600 transition"
              >
                <RotateCcw className="w-4 h-4" />
                Unlock Another PDF
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <RelatedPdfTools currentTool="unlock-pdf" />
    </div>
  );
}
