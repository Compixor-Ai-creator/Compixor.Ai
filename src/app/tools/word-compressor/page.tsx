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

const wordFaqs = wordCompressorFaqs;

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
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

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

      {/* FAQ Section */}
      <section className="mt-16 pt-10 border-t border-zinc-200 dark:border-zinc-800">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold font-display text-zinc-900 dark:text-white mb-2">
            Word Compressor FAQs
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Learn how embedded images and docx archives are optimized
          </p>
        </div>

        <div className="space-y-3">
          {wordFaqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="glass-card rounded-xl overflow-hidden transition">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-zinc-900 dark:text-white"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-brand-500 shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
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
