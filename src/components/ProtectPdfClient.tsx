'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
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
  Printer,
  Copy,
  Edit3,
} from 'lucide-react';
import { toast } from 'sonner';
import DropAnywhere from '@/components/DropAnywhere';
import { formatFileSize, validatePdfFile } from '@/utils/fileHelpers';
import { getPdfLib, getPdfEncrypt } from '@/utils/pdfLoader';

interface ProcessResult {
  downloadUrl: string;
  originalSize: number;
  processedSize: number;
  fileName: string;
}

function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
  id,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  id: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
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

export default function ProtectPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Passwords
  const [openPassword, setOpenPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');

  // Permissions Toggles
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(true);
  const [allowModifying, setAllowModifying] = useState(false);

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
    setOpenPassword('');
    setOwnerPassword('');
    setAllowPrinting(true);
    setAllowCopying(true);
    setAllowModifying(false);
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleProtect = useCallback(async () => {
    if (!file) return;
    const pw = openPassword.trim();
    const opw = ownerPassword.trim();

    if (!pw && !opw) {
      const msg = 'Please enter at least an Open Password or an Owner Password.';
      toast.error(msg);
      setError(msg);
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const pdfLib = await getPdfLib();
      const { configure, lock } = await getPdfEncrypt();

      configure(pdfLib);

      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      if (bytes.length === 0) {
        throw new Error('The uploaded file is empty (0 bytes).');
      }

      // Load PDF
      const doc = await pdfLib.PDFDocument.load(bytes, { ignoreEncryption: true });

      if (doc.isEncrypted) {
        throw new Error(
          'This PDF is already password-protected. Please unlock it using the Unlock PDF tool before applying new encryption.'
        );
      }

      const plainBytes = await doc.save();

      // Calculate ISO 32000-1 /P permission bitfield
      let permissions = -4; // All allowed by default
      if (!allowPrinting) permissions &= ~(4 | 2048);
      if (!allowCopying) permissions &= ~16;
      if (!allowModifying) permissions &= ~(8 | 32 | 1024);

      const userPw = pw || opw;
      const ownerPw = opw || pw;

      const encryptedBytes = await lock(plainBytes, userPw, {
        ownerPassword: ownerPw,
        permissions,
      });

      const safeCopy = new Uint8Array(encryptedBytes.length);
      safeCopy.set(encryptedBytes as Uint8Array);
      const blob = new Blob([safeCopy], { type: 'application/pdf' });

      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;

      const baseName = file.name.replace(/\.pdf$/i, '');
      setResult({
        downloadUrl: url,
        originalSize: file.size,
        processedSize: blob.size,
        fileName: `${baseName}_protected.pdf`,
      });
      toast.success('PDF encrypted successfully with AES-256!');
    } catch (err) {
      console.error('Protect error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to protect PDF.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  }, [file, openPassword, ownerPassword, allowPrinting, allowCopying, allowModifying]);

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
        title="Drop PDF anywhere to protect"
        subtitle="100% private in-browser AES-256 encryption"
      />

      {/* Feature Badges */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {[
          { icon: ShieldCheck, text: 'AES-256 Military Encryption' },
          { icon: KeyRound, text: 'Open & Owner Passwords' },
          { icon: Zap, text: 'Instant In-Memory Execution' },
          { icon: Lock, text: 'Zero Server Uploads' },
        ].map(({ icon: Icon, text }) => (
          <span
            key={text}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40 px-3.5 py-1.5 rounded-full"
          >
            <Icon className="w-3.5 h-3.5 text-indigo-500" />
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
              <p className="text-xs text-zinc-400 dark:text-zinc-500">Max size 100MB · 100% confidential</p>
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

      {/* Encryption Settings */}
      {file && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl border border-zinc-200/70 dark:border-zinc-800/60 p-6 sm:p-8 mb-6 space-y-6 shadow-sm"
        >
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
            <div className="flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-indigo-500" />
              <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-100">
                Configure Security &amp; Permissions
              </h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              AES-256
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <PasswordInput
              id="protect-open-pw"
              label="Open Password (Document Password)"
              value={openPassword}
              onChange={setOpenPassword}
              placeholder="e.g. MySecurePassword123"
              hint="Required to open and view the PDF."
            />
            <PasswordInput
              id="protect-owner-pw"
              label="Owner Password (Permissions Password)"
              value={ownerPassword}
              onChange={setOwnerPassword}
              placeholder="e.g. AdminControlPassword456"
              hint="Controls permissions below. Leave blank to match Open Password."
            />
          </div>

          {/* Granular Permission Toggles */}
          <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
              Document Permissions
            </h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60 bg-zinc-50/60 dark:bg-zinc-900/40 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition">
                <input
                  type="checkbox"
                  checked={allowPrinting}
                  onChange={(e) => setAllowPrinting(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300 dark:border-zinc-700"
                />
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <Printer className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Allow Printing</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60 bg-zinc-50/60 dark:bg-zinc-900/40 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition">
                <input
                  type="checkbox"
                  checked={allowCopying}
                  onChange={(e) => setAllowCopying(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300 dark:border-zinc-700"
                />
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <Copy className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Allow Copying Text</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60 bg-zinc-50/60 dark:bg-zinc-900/40 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition">
                <input
                  type="checkbox"
                  checked={allowModifying}
                  onChange={(e) => setAllowModifying(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300 dark:border-zinc-700"
                />
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <Edit3 className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Allow Editing</span>
                </div>
              </label>
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
                Encrypting PDF with AES-256…
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Encrypt &amp; Protect PDF
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
                  PDF Encrypted Successfully!
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
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">Protected Size</p>
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
                Download Protected PDF
              </button>
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl glass-card border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm font-semibold hover:border-zinc-300 dark:hover:border-zinc-600 transition"
              >
                <RotateCcw className="w-4 h-4" />
                Protect Another PDF
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
