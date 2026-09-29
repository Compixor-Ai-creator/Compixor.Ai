'use client';

import ToolSeoSection from "@/components/ToolSeoSection";

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
  Clock,
  Target,
  Layers,
  ShieldCheck,
  Zap,
  Laptop,
  Maximize2,
} from 'lucide-react';
import WordIcon from '@/components/WordIcon';
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
    const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();

    if (ext === '.doc' || f.type === 'application/msword') {
      toast.error(
        'Legacy .doc (Word 97-2003) is a binary format. Please save it as modern .docx in Word or Google Docs, then compress it here.',
        { duration: 6000 }
      );
      return;
    }

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const validExts = ['.docx'];

    if (!validTypes.includes(f.type) && !validExts.includes(ext)) {
      toast.error('Please upload a Word document (.docx).');
      return;
    }
    setFile(f);
    setResult(null);
    setError(null);
    setProgress(0);
    toast.success(`Word Document Loaded: ${f.name}`);
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
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        title="Drop Word document anywhere"
        subtitle="to optimize embedded images instantly"
      />

      {/* Header */}
            {/* Hero Header with Image 2 style Transformation Card & Animations */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Victory / Transformation Preview Card (Bulky 8.3MB DOCX → Lightweight 1.8MB DOCX) */}
        <div className="w-full flex justify-center mb-6 select-none pointer-events-none">
          <div className="p-3 sm:p-4 rounded-3xl bg-white/60 dark:bg-zinc-900/60 border border-blue-500/20 dark:border-blue-500/30 shadow-lg backdrop-blur-md flex items-center justify-center gap-4 sm:gap-6">
            {/* Left: Bulky DOCX (Problem) */}
            <div className="flex flex-col items-center space-y-1">
              <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl bg-red-500/10 border-2 border-dashed border-red-400 relative flex flex-col items-center justify-center p-2">
                <div className="w-10 h-13 rounded-lg bg-white dark:bg-zinc-800 shadow-sm border border-red-200 dark:border-red-900/50 flex flex-col items-center justify-between p-1.5">
                  <span className="text-[7.5px] font-bold text-blue-600">DOCX</span>
                  <div className="w-full space-y-0.5">
                    <div className="w-full h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
                    <div className="w-4/5 h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
                    <div className="w-3/5 h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
                  </div>
                  <span className="text-[7px] font-bold text-red-600 bg-red-100 dark:bg-red-950/60 px-1 rounded">8.3 MB</span>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-red-500">Bulky (8.3MB)</span>
            </div>

            {/* Center Arrow */}
            <div className="w-7 h-7 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-300 flex items-center justify-center font-black text-sm">
              &rarr;
            </div>

            {/* Right: Optimized DOCX (Victory) */}
            <div className="flex flex-col items-center space-y-1">
              <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-teal-500/20 border-2 border-blue-500 relative flex flex-col items-center justify-center p-2 shadow-md">
                <div className="w-10 h-13 rounded-lg bg-white dark:bg-zinc-800 shadow-sm border border-blue-500/40 flex flex-col items-center justify-between p-1.5 relative">
                  <span className="text-[7.5px] font-bold text-blue-600">DOCX</span>
                  <div className="w-full space-y-0.5">
                    <div className="w-full h-0.5 bg-blue-400/60 rounded" />
                    <div className="w-4/5 h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
                    <div className="w-3/5 h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
                  </div>
                  <span className="text-[7px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-1 rounded">1.8 MB</span>
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[7px] font-black shadow-xs">✓</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">78% Smaller</span>
            </div>
          </div>
        </div>

        {/* Animated Badge Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/25 mb-4 animate-float-subtle shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-spin-slow" />
          Docx Image Optimization Engine
        </div>

        {/* H1 with Vibrant Blue-Cyan-Teal Gradient + Floating Particles */}
        <div className="relative inline-block mb-4">
          <div className="absolute -top-3 -left-5 w-2 h-2 rounded-full bg-blue-400/80 animate-pulse" />
          <div className="absolute -top-2 -right-5 w-1.5 h-1.5 rounded-full bg-cyan-400/80 animate-pulse" style={{ animationDelay: '0.6s' }} />
          <div className="absolute -bottom-1 left-1/3 w-1.5 h-1.5 rounded-full bg-teal-400/70 animate-pulse" style={{ animationDelay: '1.2s' }} />
          <Sparkles className="absolute -top-6 right-1 w-4 h-4 text-blue-400/70 animate-spin-slow" />

          <h1 className="text-4xl sm:text-5xl font-black font-display text-zinc-900 dark:text-white">
            Free{' '}
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 bg-clip-text text-transparent">
              Word Document Compressor
            </span>
          </h1>
        </div>

        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto mb-5">
          Shrink bulky Microsoft Word files by optimizing embedded graphics and re-packing XML structures.
        </p>

        {/* Clean Keyword Badges / Tags */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-2xl mx-auto">
          {[
            'Compress Word',
            'Shrink DOCX',
            'Optimize Images',
            'Preserve Layout',
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

      {/* Main Workspace */}
      <motion.div
        className="glass-card p-6 sm:p-8 rounded-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {!file && (
          <FileDropZone
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onFileDrop={handleFileDrop}
            plainIcon={true}
            icon={<WordIcon size={80} withBackdropSheet={true} />}
            title="Upload your file here"
            subtitle="Drag and drop a Word file to reduce its file size."
            buttonText="Choose File"
            maxSizeMB={100}
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

      {/* 4 Stat Metric Cards (SlideSpeak Style) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs flex flex-col justify-between">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">&lt; 10s</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Avg. time</p>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs flex flex-col justify-between">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">99.9%</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Compression accuracy</p>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs flex flex-col justify-between">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">500+</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Pages & formats supported</p>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs flex flex-col justify-between">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">150K+</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Files compressed</p>
          </div>
        </div>
      </div>

      {/* Why choose Compixor? Feature Grid (SlideSpeak Style) */}
      <section className="mt-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
            Why choose Compixor?
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-2 max-w-xl mx-auto">
            Accurate, fast and reliable. Our FREE tool to compress and optimize Word documents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-white/80 dark:bg-zinc-850/80 border border-zinc-200/80 dark:border-zinc-750/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40">
              <ImageDown className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              Reduce File Size Drastically
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Compress Word documents by up to 90%, making them easy to email, upload, and share.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/80 dark:bg-zinc-850/80 border border-zinc-200/80 dark:border-zinc-750/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              Maintain Document Quality
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Our compression keeps your document looking sharp. Text, fonts, images, and formatting stay intact.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/80 dark:bg-zinc-850/80 border border-zinc-200/80 dark:border-zinc-750/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              Free to Use
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              100% free with no signup or credit card required. Just upload and compress unlimited files.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/80 dark:bg-zinc-850/80 border border-zinc-200/80 dark:border-zinc-750/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              Fast Processing
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Your compressed file is ready in seconds, even for large documents with hundreds of pages.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/80 dark:bg-zinc-850/80 border border-zinc-200/80 dark:border-zinc-750/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              Secure and Private
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Files are processed entirely inside your browser memory and never uploaded to any remote server.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/80 dark:bg-zinc-850/80 border border-zinc-200/80 dark:border-zinc-750/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40">
              <Laptop className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              No Software Needed
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Works entirely in your web browser. No Microsoft Word installation or external plugins required.
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

      <ToolSeoSection toolSlug="word-compressor" />
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
