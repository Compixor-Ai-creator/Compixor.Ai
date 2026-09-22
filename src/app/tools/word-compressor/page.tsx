'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  RotateCcw,
  AlertCircle,
  ImageDown,
  Sparkles,
  HelpCircle,
  ChevronDown,
  FileCheck2,
  Sliders,
  CheckCircle2,
  ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import FileDropZone from '@/components/FileDropZone';
import DropAnywhere from '@/components/DropAnywhere';
import ProgressRing from '@/components/ProgressRing';
import RelatedTools from '@/components/RelatedTools';
import ClientSideTrustSection from '@/components/ClientSideTrustSection';
import FaqSection from '@/components/FaqSection';
import { wordCompressorFaqs } from '@/data/faqs';

interface ImageDetail {
  name: string;
  originalSize: number;
  compressedSize: number;
  savingsPercent: number;
}

interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  reductionPercent: number;
  imagesOptimized: number;
  imageDetails: ImageDetail[];
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export default function WordCompressorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState(0.6);

  const handleFileDrop = useCallback((f: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    const validExts = ['.docx', '.doc'];
    const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();

    if (!validTypes.includes(f.type) && !validExts.includes(ext)) {
      toast.error('Please upload a Word document (.docx).');
      return;
    }
    setFile(f);
    setResult(null);
    setError(null);
    setProgress(0);
  }, []);

  const handleCompress = useCallback(async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      setProgress(10);
      const JSZip = (await import('jszip')).default;

      setProgress(20);
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      setProgress(30);

      const mediaFolder = zip.folder('word/media');
      const imageDetails: ImageDetail[] = [];
      let imagesOptimized = 0;

      if (mediaFolder) {
        const mediaFiles: { name: string; file: any }[] = [];
        mediaFolder.forEach((relativePath, zipEntry) => {
          if (!zipEntry.dir) {
            mediaFiles.push({ name: relativePath, file: zipEntry });
          }
        });

        const totalMedia = mediaFiles.length;

        for (let i = 0; i < totalMedia; i++) {
          const { name, file: zipEntry } = mediaFiles[i];
          const isImage = /\.(jpe?g|png|webp|bmp)$/i.test(name);

          if (isImage) {
            try {
              const imageBlob = await zipEntry.async('blob');
              const origImgSize = imageBlob.size;
              const compressedBlob = await compressImage(imageBlob, quality);

              if (compressedBlob.size < origImgSize) {
                const compressedBuffer = await compressedBlob.arrayBuffer();
                zip.file(`word/media/${name}`, compressedBuffer);
                imagesOptimized++;

                const savings = ((origImgSize - compressedBlob.size) / origImgSize) * 100;
                imageDetails.push({
                  name,
                  originalSize: origImgSize,
                  compressedSize: compressedBlob.size,
                  savingsPercent: savings,
                });
              } else {
                imageDetails.push({
                  name,
                  originalSize: origImgSize,
                  compressedSize: origImgSize,
                  savingsPercent: 0,
                });
              }
            } catch (imgErr) {
              console.warn(`Could not compress image ${name}:`, imgErr);
            }
          }

          const currentProgress = 30 + Math.round(((i + 1) / (totalMedia || 1)) * 50);
          setProgress(currentProgress);
        }
      }

      setProgress(85);

      const compressedBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 },
      });

      setProgress(100);

      const originalSize = file.size;
      const compressedSize = compressedBlob.size;
      const reductionPercent = Math.max(
        0,
        ((originalSize - compressedSize) / originalSize) * 100
      );

      setResult({
        blob: compressedBlob,
        originalSize,
        compressedSize,
        reductionPercent,
        imagesOptimized,
        imageDetails,
      });

      toast.success(
        imagesOptimized > 0
          ? `Word document compressed! Optimized ${imagesOptimized} embedded image(s).`
          : 'Document archive optimized!'
      );
    } catch (err) {
      console.error('Word compression error:', err);
      setError('Failed to compress Word document. The file may be password protected or corrupted.');
      toast.error('Compression failed.');
    } finally {
      setIsProcessing(false);
    }
  }, [file, quality]);

  const handleDownload = useCallback(() => {
    if (!result || !file) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed_${file.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Download started!');
  }, [result, file]);

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setIsProcessing(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Fullscreen Drop Anywhere Drag & Drop Overlay */}
      <DropAnywhere
        onFileDrop={handleFileDrop}
        accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,.docx,.doc"
        title="Drop Word document anywhere"
        subtitle="to optimize embedded images instantly"
      />

      {/* Header */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Hero section icon: Simple flat-style icon of a Word document (blue W logo style) shrinking in size with a compression arrow */}
        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-5 p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 shadow-xs flex items-center justify-center">
          <svg
            className="w-full h-full text-blue-600 dark:text-blue-400"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Word document shrinking in size icon"
            role="img"
          >
            {/* Background larger page outline */}
            <path
              d="M12 10C12 7.79086 13.7909 6 16 6H38L50 18V44C50 46.2091 48.2091 48 46 48H16C13.7909 48 12 46.2091 12 44V10Z"
              className="stroke-blue-200 dark:stroke-blue-800"
              strokeWidth="2"
              strokeDasharray="3 3"
              fill="none"
            />
            {/* Foreground Word Document */}
            <path
              d="M18 18C18 16.8954 18.8954 16 20 16H36L44 24V50C44 51.1046 43.1046 52 42 52H20C18.8954 52 18 51.1046 18 50V18Z"
              className="fill-blue-500/10 stroke-blue-600 dark:stroke-blue-400"
              strokeWidth="2.5"
            />
            <path d="M36 16V24H44" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="2.5" strokeLinejoin="round" />
            {/* "W" logo symbol */}
            <path
              d="M24 30L26.5 42L29.5 33L32.5 42L35 30"
              className="stroke-blue-600 dark:stroke-blue-400"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Compression Arrow */}
            <circle cx="48" cy="48" r="10" className="fill-blue-600 dark:fill-blue-500 shadow-sm" />
            <path d="M44 44L52 52M52 52H46M52 52V46" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Docx Image Optimization Engine
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-display text-zinc-900 dark:text-white mb-4">
          Free Word Document Compressor
        </h1>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
          Shrink bulky Microsoft Word files by optimizing embedded graphics and re-packing XML structures.
        </p>
      </motion.div>

      {/* Main Workspace */}
      <motion.div
        className="glass-card p-6 sm:p-8 rounded-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {!file && (
          <FileDropZone
            accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
            onFileDrop={handleFileDrop}
            title="Drop your Word document here"
            subtitle="or click to browse from device (.docx up to 100MB)"
          />
        )}

        {file && !result && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleReset}
                disabled={isProcessing}
                className="text-xs font-semibold text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition"
              >
                Remove
              </button>
            </div>

            {/* Quality Slider */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-brand-500" />
                  Image Compression Quality
                </span>
                <span>{Math.round(quality * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.9"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                disabled={isProcessing}
                className="w-full slider-blur cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span>Maximum Savings (20%)</span>
                <span>Balanced (60%)</span>
                <span>High Fidelity (90%)</span>
              </div>
            </div>

            {/* Processing State */}
            {isProcessing && (
              <div className="flex flex-col items-center py-6">
                <ProgressRing progress={progress} size={90} />
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mt-4">
                  Extracting and re-compressing images ({Math.round(progress)}%)...
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {!isProcessing && (
              <button
                onClick={handleCompress}
                className="w-full btn-primary py-3.5 text-base font-semibold"
              >
                Compress Word Document Now
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {result && file && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 text-center">
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Original Size</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-white">
                  {formatFileSize(result.originalSize)}
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-brand-500/10 text-center border border-brand-500/20">
                <p className="text-xs font-semibold text-brand-600 dark:text-brand-300 mb-1">Compressed Size</p>
                <p className="text-xl font-bold text-brand-600 dark:text-brand-300">
                  {formatFileSize(result.compressedSize)}
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-emerald-500/10 text-center border border-emerald-500/20">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Reduction</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {result.reductionPercent.toFixed(1)}%
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-cyan-500/10 text-center border border-cyan-500/20">
                <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-1">Images Optimized</p>
                <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
                  {result.imagesOptimized}
                </p>
              </div>
            </div>

            {/* Embedded Images Breakdown List */}
            {result.imageDetails.length > 0 && (
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-brand-500" />
                  Embedded Media Assets Report ({result.imageDetails.length})
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {result.imageDetails.map((img, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-white/70 dark:bg-zinc-800/70 border border-zinc-200/50 dark:border-zinc-700/50"
                    >
                      <span className="font-mono text-zinc-700 dark:text-zinc-300 truncate max-w-[200px]">
                        {img.name}
                      </span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-zinc-400 line-through">
                          {formatFileSize(img.originalSize)}
                        </span>
                        <span className="font-semibold text-zinc-900 dark:text-white">
                          {formatFileSize(img.compressedSize)}
                        </span>
                        {img.savingsPercent > 0 ? (
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            -{Math.round(img.savingsPercent)}%
                          </span>
                        ) : (
                          <span className="text-[11px] text-zinc-400">Kept Optimal</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownload}
                className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5 font-semibold text-sm"
              >
                <Download className="w-4 h-4" />
                Download Compressed Document
              </button>
              <button
                onClick={handleReset}
                className="btn-secondary flex items-center justify-center gap-2 py-3.5 font-semibold text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Compress Another
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Feature Highlights Grid */}
      <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Image Optimization */}
        <div className="p-6 rounded-2xl glass-card flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 p-2.5 flex items-center justify-center mb-4 border border-blue-500/20">
              <svg className="w-full h-full" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="6" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
                <circle cx="10" cy="12" r="2" fill="currentColor" />
                <path d="M6 22L12 16L18 22M16 20L20 16L26 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 8L27 13M27 13H23M27 13V9" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1">
              Image Optimization
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Target and re-encode high-resolution screenshots, photos, and scanned graphics directly inside the DOCX.
            </p>
          </div>
        </div>

        {/* Formatting Preserved */}
        <div className="p-6 rounded-2xl glass-card flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2.5 flex items-center justify-center mb-4 border border-emerald-500/20">
              <svg className="w-full h-full" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 4H20L26 10V28H8V4Z" className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="2" fill="none" />
                <path d="M20 4V10H26" className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="2" />
                <circle cx="17" cy="19" r="6" className="fill-emerald-500" />
                <path d="M14.5 19L16.2 20.7L19.5 17.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1">
              Formatting Preserved
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Fonts, margins, tables, styles, and headers are left 100% byte-exact without changing page layouts.
            </p>
          </div>
        </div>

        {/* Zero Upload */}
        <div className="p-6 rounded-2xl glass-card flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 p-2.5 flex items-center justify-center mb-4 border border-blue-500/20">
              <svg className="w-full h-full" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="6" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
                <line x1="4" y1="11" x2="28" y2="11" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="8" cy="8.5" r="1" fill="currentColor" />
                <circle cx="12" cy="8.5" r="1" fill="currentColor" />
                <path d="M16 15C16 15 19 14 21 16C21 20 18 22 16 23C14 22 11 20 11 16C13 14 16 15 16 15Z" className="fill-blue-500/20 stroke-blue-600 dark:stroke-blue-400" strokeWidth="1.6" />
                <circle cx="16" cy="18.5" r="1" fill="currentColor" />
              </svg>
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1">
              Zero Upload
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Your confidential business contracts and personal documents never leave your browser sandbox.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section with Rich Visual Cards */}
      <section className="mt-16 p-6 sm:p-8 rounded-3xl glass-card border border-zinc-200/80 dark:border-zinc-800/80">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-zinc-900 dark:text-white">
              How Word Document Compression Works
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Large Word files are almost always large because of embedded images — here is how Compixor optimizes them.
            </p>
          </div>

          {/* Visual Step-by-Step Cards (Matching requested illustration layout) */}
          <div className="space-y-12">
            {/* Step 1 & 2 Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Visual Card 1 */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-50/80 to-zinc-50 dark:from-zinc-900/90 dark:to-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                <div className="bg-white dark:bg-zinc-800/90 rounded-2xl p-4 shadow-sm border border-zinc-200/70 dark:border-zinc-700/60 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span>document_final.docx</span>
                    <span className="ml-auto text-[11px] bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-md font-mono">ZIP Archive</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-700/40 text-center">
                      <p className="text-[10px] text-zinc-400 font-mono">/word/document.xml</p>
                      <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mt-1">Text & Tables</p>
                      <span className="inline-block mt-1 text-[9px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">Untouched</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 text-center">
                      <p className="text-[10px] text-blue-500 font-mono">/word/media/*</p>
                      <p className="text-xs font-bold text-blue-900 dark:text-blue-200 mt-1">Embedded Media</p>
                      <span className="inline-block mt-1 text-[9px] text-blue-600 font-semibold bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded">Identified (90% size)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text for Step 1 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm">
                    1
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Unzip DOCX Locally in Browser
                  </h3>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed pl-11">
                  Since a .docx file is technically a ZIP archive of XML files and media assets, your browser reads and unzips it locally without sending a single byte over the internet.
                </p>
              </div>
            </div>

            {/* Step 2 & 3 Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Text for Step 2 */}
              <div className="space-y-3 order-2 md:order-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm">
                    2
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Optimize Embedded Images & Repack XML
                  </h3>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed pl-11">
                  Each embedded image is re-encoded with an optimal compression ratio while XML structures (fonts, tables, margins, and formulas) are repacked cleanly without altering any formatting.
                </p>
              </div>

              {/* Visual Card 2 */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50/80 to-zinc-50 dark:from-zinc-900/90 dark:to-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-sm order-1 md:order-2">
                <div className="bg-white dark:bg-zinc-800/90 rounded-2xl p-4 shadow-sm border border-zinc-200/70 dark:border-zinc-700/60 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-blue-500" />
                      image1.png (4.2 MB)
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full text-[11px]">
                      -72% Saved
                    </span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full w-[72%] rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                    <span>Quality: 60% (Optimal)</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">New Size: 1.1 MB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 & 4 Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Visual Card 3 */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-50/80 to-zinc-50 dark:from-zinc-900/90 dark:to-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                <div className="bg-white dark:bg-zinc-800/90 rounded-2xl p-4 shadow-sm border border-zinc-200/70 dark:border-zinc-700/60 space-y-3 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <FileCheck2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white">compressed_document.docx</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">24.5 MB &rarr; <span className="font-bold text-emerald-600">6.2 MB</span></p>
                  </div>
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-xs">
                      <Download className="w-3.5 h-3.5" /> Instant Safe Download
                    </span>
                  </div>
                </div>
              </div>

              {/* Text for Step 3 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm">
                    3
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Ready for Strict Email Caps & Portals
                  </h3>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed pl-11">
                  The document is rebuilt as a new, smaller .docx file ready for instant download. Perfect for sending via Outlook/Gmail (which cap attachments at 25MB) or uploading to job and university portals with strict limits.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <p>
              <strong>Summary:</strong> Large Word files are almost always large because of embedded images — screenshots, photos, or scanned pages pasted directly into the document at full resolution. Compixor targets exactly this payload while leaving all document formatting, fonts, and tables completely intact.
            </p>
          </div>
        </div>
      </section>

      {/* Reusable Client-Side Trust & Privacy Section */}
      <ClientSideTrustSection />

      {/* FAQs Section with SSR-friendly DOM rendering */}
      <FaqSection
        title="Word Compressor FAQs"
        subtitle="Learn how embedded images and docx archives are optimized"
        faqs={wordCompressorFaqs}
      />

      {/* Cross-Tool Internal Linking */}
      <RelatedTools currentTool="word-compressor" />
    </div>
  );
}

function compressImage(blob: Blob, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      let { width, height } = img;

      const maxDim = 2048;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (compressedBlob) => {
          if (compressedBlob) {
            resolve(compressedBlob);
          } else {
            reject(new Error('Canvas compression failed'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}
