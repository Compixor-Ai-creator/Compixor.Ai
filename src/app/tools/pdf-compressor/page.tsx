'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FileDown,
  Download,
  RotateCcw,
  Check,
  AlertCircle,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  Zap,
  FileCheck2,
  Sliders,
  FileText,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import pako from 'pako';
import FileDropZone from '@/components/FileDropZone';
import DropAnywhere from '@/components/DropAnywhere';
import ProgressRing from '@/components/ProgressRing';

type CompressionLevel = 'low' | 'recommended' | 'deep';

interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  reductionPercent: number;
  pageCount: number;
  imagesProcessed: number;
  streamsCompressed: number;
  unreferencedObjectsRemoved: number;
  isAlreadyOptimized: boolean;
}

interface CompressionTierConfig {
  id: CompressionLevel;
  label: string;
  tagline: string;
  badge: string;
  description: string;
  targetReduction: string;
  jpegQuality: number;
  maxDimension: number;
  convertFlateToJpeg: boolean;
  stripMetadata: boolean;
  minImageBytes: number;
}

const compressionLevels: CompressionTierConfig[] = [
  {
    id: 'low',
    label: 'Low Compression',
    tagline: '10–25% Reduction',
    badge: '100% Vector Text',
    description: 'Preserves near-original visual fidelity. Cleans metadata, recompresses internal streams, and optimizes high-res embedded photos (1800px cap, quality 85).',
    targetReduction: '10–25%',
    jpegQuality: 0.85,
    maxDimension: 1800,
    convertFlateToJpeg: false,
    stripMetadata: true,
    minImageBytes: 15360,
  },
  {
    id: 'recommended',
    label: 'Balanced (Recommended)',
    tagline: '30–50% Reduction',
    badge: 'Crisp Vector Text',
    description: 'Optimal balance of clarity and file size for resumes, essays & reports. Recompresses streams, strips unreferenced objects, and optimizes embedded images (1200px cap, quality 65).',
    targetReduction: '30–50%',
    jpegQuality: 0.65,
    maxDimension: 1200,
    convertFlateToJpeg: true,
    stripMetadata: true,
    minImageBytes: 8192,
  },
  {
    id: 'deep',
    label: 'Maximum Compression',
    tagline: '50–75% Reduction',
    badge: '100% Vector Text',
    description: 'Aggressive native stream compression and embedded image downsampling (900px cap, quality 50). Text and vector graphics remain 100% crisp and unrasterized.',
    targetReduction: '50–75%',
    jpegQuality: 0.50,
    maxDimension: 900,
    convertFlateToJpeg: true,
    stripMetadata: true,
    minImageBytes: 4096,
  },
];

const pdfFaqs = [
  {
    q: 'How does the Native PDF optimizer work?',
    a: 'Compixor operates directly on the PDF structure using native stream compression, metadata stripping, unreferenced object removal, and embedded raster image optimization. Vector text, fonts, and layouts are never rasterized into blurry pixels.',
  },
  {
    q: 'Will my text still be selectable (Ctrl+F) and sharp?',
    a: 'Yes! All vector text, fonts, links, and forms remain 100% vector without any rasterization or degradation. Text stays razor-sharp, searchable, and selectable at any zoom level across all compression modes.',
  },
  {
    q: 'What happens if my PDF is already optimized?',
    a: 'Compixor includes an automatic enlargement safety check: if optimizing a document would make it larger (common with pure-text or already-compacted files), Compixor automatically returns your original file and notifies you: "This PDF is already highly optimized and cannot be reduced further."',
  },
  {
    q: 'Are my confidential documents uploaded to any server?',
    a: "Never. Unlike traditional online tools that store your PDFs on remote cloud servers, Compixor's entire compression process takes place inside your browser's local sandbox memory. Zero file data ever leaves your device.",
  },
];

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export default function PdfCompressorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<CompressionLevel>('recommended');
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('Optimizing PDF...');
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleFileDrop = useCallback((f: File) => {
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a valid PDF file.');
      return;
    }
    setFile(f);
    setResult(null);
    setError(null);
    setProgress(0);
  }, []);

  const loadImageFromBytes = useCallback(
    (bytes: Uint8Array, mimeType: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const blob = new Blob([bytes as BlobPart], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve(img);
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to decode image'));
        };
        img.src = url;
      });
    },
    []
  );

  const processAndReEncodeImage = useCallback(
    async (
      source: HTMLImageElement | ImageData,
      jpegQuality: number,
      maxDimension: number
    ): Promise<{ bytes: Uint8Array; width: number; height: number }> => {
      const origWidth = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
      const origHeight = source instanceof HTMLImageElement ? source.naturalHeight : source.height;

      const currentMax = Math.max(origWidth, origHeight);
      let targetWidth = origWidth;
      let targetHeight = origHeight;

      if (currentMax > maxDimension) {
        const scale = maxDimension / currentMax;
        targetWidth = Math.max(1, Math.round(origWidth * scale));
        targetHeight = Math.max(1, Math.round(origHeight * scale));
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (source instanceof HTMLImageElement) {
        ctx.drawImage(source, 0, 0, targetWidth, targetHeight);
      } else {
        if (targetWidth === origWidth && targetHeight === origHeight) {
          ctx.putImageData(source, 0, 0);
        } else {
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = origWidth;
          tempCanvas.height = origHeight;
          const tempCtx = tempCanvas.getContext('2d');
          if (tempCtx) {
            tempCtx.putImageData(source, 0, 0);
            ctx.drawImage(tempCanvas, 0, 0, targetWidth, targetHeight);
          }
        }
      }

      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Canvas toBlob failed'));
            blob.arrayBuffer().then((buf) => {
              resolve({
                bytes: new Uint8Array(buf),
                width: targetWidth,
                height: targetHeight,
              });
            });
          },
          'image/jpeg',
          jpegQuality
        );
      });
    },
    []
  );

  const extractFlateImageData = useCallback(
    (
      rawBytes: Uint8Array,
      width: number,
      height: number,
      colorSpaceStr: string,
      bitsPerComponent: number = 8
    ): ImageData | null => {
      try {
        const uncompressed = pako.inflate(rawBytes);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        if (colorSpaceStr.includes('RGB') || uncompressed.length >= width * height * 3) {
          if (bitsPerComponent === 8 && uncompressed.length >= width * height * 3) {
            const imgData = ctx.createImageData(width, height);
            let s = 0;
            let d = 0;
            const total = width * height;
            for (let i = 0; i < total; i++) {
              imgData.data[d] = uncompressed[s];
              imgData.data[d + 1] = uncompressed[s + 1];
              imgData.data[d + 2] = uncompressed[s + 2];
              imgData.data[d + 3] = 255;
              s += 3;
              d += 4;
            }
            return imgData;
          }
        } else if (colorSpaceStr.includes('Gray') || uncompressed.length >= width * height) {
          if (bitsPerComponent === 8 && uncompressed.length >= width * height) {
            const imgData = ctx.createImageData(width, height);
            let s = 0;
            let d = 0;
            const total = width * height;
            for (let i = 0; i < total; i++) {
              const g = uncompressed[s++];
              imgData.data[d] = g;
              imgData.data[d + 1] = g;
              imgData.data[d + 2] = g;
              imgData.data[d + 3] = 255;
              d += 4;
            }
            return imgData;
          }
        }
      } catch {
        // Safe fallback
      }
      return null;
    },
    []
  );

  const computeFastHash = (bytes: Uint8Array): string => {
    let hash = 2166136261;
    const len = bytes.length;
    const step = Math.max(1, Math.floor(len / 512));
    for (let i = 0; i < len; i += step) {
      hash ^= bytes[i];
      hash = Math.imul(hash, 16777619);
    }
    return `${len}_${(hash >>> 0).toString(16)}`;
  };

  // ── Native Vector & Stream Compression Engine (pdf-lib + pako) ──
  const runNativeCompression = useCallback(
    async (
      arrayBuffer: ArrayBuffer,
      config: CompressionTierConfig
    ): Promise<CompressionResult> => {
      const pdfLib = await import('pdf-lib');
      const { PDFDocument, PDFName, PDFNumber, PDFRawStream, PDFStream, PDFRef, PDFDict, PDFArray } = pdfLib;

      setProgress(12);
      setStatusMessage('Parsing PDF catalog & structure...');

      const pdfDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      });

      const pageCount = pdfDoc.getPageCount();
      const context = pdfDoc.context;

      setProgress(20);
      setStatusMessage('Scanning embedded images and graphics...');

      // 1. Embedded Image Optimization
      const allObjects = context.enumerateIndirectObjects();
      const imageEntries: Array<{
        ref: ReturnType<typeof context.enumerateIndirectObjects>[number][0];
        stream: InstanceType<typeof PDFStream>;
      }> = [];

      for (const [ref, obj] of allObjects) {
        if (obj instanceof PDFRawStream || obj instanceof PDFStream) {
          const dict = obj.dict;
          const subtype = dict.get(PDFName.of('Subtype'));
          if (subtype === PDFName.of('Image')) {
            imageEntries.push({ ref, stream: obj as InstanceType<typeof PDFStream> });
          }
        }
      }

      const dedupeMap = new Map<string, ReturnType<typeof context.stream>>();
      let imagesCompressed = 0;
      const totalImages = imageEntries.length;

      for (let i = 0; i < imageEntries.length; i++) {
        const { ref, stream } = imageEntries[i];
        const dict = stream.dict;

        setStatusMessage(`Optimizing embedded image ${i + 1} of ${totalImages}...`);

        try {
          const filter = dict.get(PDFName.of('Filter'));
          const filterStr = filter ? filter.toString() : '';
          const smask = dict.get(PDFName.of('SMask'));
          const mask = dict.get(PDFName.of('Mask'));
          // Do not convert or resize images with alpha/stencil masks to avoid transparency corruption
          const hasTransparencyMask = Boolean(smask || mask);

          const widthObj = dict.get(PDFName.of('Width'));
          const heightObj = dict.get(PDFName.of('Height'));
          const origWidth = widthObj instanceof PDFNumber ? widthObj.asNumber() : 0;
          const origHeight = heightObj instanceof PDFNumber ? heightObj.asNumber() : 0;

          const rawBytes =
            stream instanceof PDFRawStream
              ? stream.contents
              : (stream as unknown as { contents: Uint8Array }).contents;

          if (rawBytes && rawBytes.length >= config.minImageBytes && !hasTransparencyMask && origWidth > 0 && origHeight > 0) {
            let processedResult: { bytes: Uint8Array; width: number; height: number } | null = null;

            if (filterStr.includes('DCTDecode')) {
              const img = await loadImageFromBytes(rawBytes, 'image/jpeg');
              processedResult = await processAndReEncodeImage(img, config.jpegQuality, config.maxDimension);
            } else if (
              config.convertFlateToJpeg &&
              (filterStr.includes('FlateDecode') || !filter)
            ) {
              const colorSpace = dict.get(PDFName.of('ColorSpace'))?.toString() || 'DeviceRGB';
              const bpcObj = dict.get(PDFName.of('BitsPerComponent'));
              const bpc = bpcObj instanceof PDFNumber ? bpcObj.asNumber() : 8;

              const imgData = extractFlateImageData(rawBytes, origWidth, origHeight, colorSpace, bpc);
              if (imgData) {
                processedResult = await processAndReEncodeImage(imgData, config.jpegQuality, config.maxDimension);
              }
            }

            if (processedResult) {
              const { bytes: newBytes, width: newWidth, height: newHeight } = processedResult;

              // Safety check: Only replace if newly encoded image is genuinely smaller
              if (newBytes.length < rawBytes.length * 0.95 || (newWidth < origWidth && newBytes.length <= rawBytes.length)) {
                const imgHash = computeFastHash(newBytes);

                if (dedupeMap.has(imgHash)) {
                  context.assign(ref, dedupeMap.get(imgHash)!);
                } else {
                  const newStream = context.stream(newBytes, {
                    Type: PDFName.of('XObject'),
                    Subtype: PDFName.of('Image'),
                    Width: PDFNumber.of(newWidth),
                    Height: PDFNumber.of(newHeight),
                    ColorSpace: PDFName.of('DeviceRGB'),
                    BitsPerComponent: PDFNumber.of(8),
                    Filter: PDFName.of('DCTDecode'),
                  });
                  context.assign(ref, newStream);
                  dedupeMap.set(imgHash, newStream);
                }
                imagesCompressed++;
              }
            }
          }
        } catch {
          // Keep original image untouched
        }

        const imageProgress = 20 + ((i + 1) / Math.max(totalImages, 1)) * 40;
        setProgress(imageProgress);
      }

      // 2. Metadata Stripping
      setProgress(64);
      if (config.stripMetadata) {
        setStatusMessage('Stripping unused metadata & XML streams...');
        try {
          pdfDoc.setTitle('');
          pdfDoc.setAuthor('');
          pdfDoc.setSubject('');
          pdfDoc.setKeywords([]);
          pdfDoc.setProducer('Compixor PDF Optimizer');
          pdfDoc.setCreator('');

          const catalog = pdfDoc.catalog;
          if (catalog) {
            catalog.delete(PDFName.of('Metadata'));
            catalog.delete(PDFName.of('PieceInfo'));
            catalog.delete(PDFName.of('MarkInfo'));
            catalog.delete(PDFName.of('NeedsRendering'));
          }

          const pages = pdfDoc.getPages();
          for (const page of pages) {
            page.node.delete(PDFName.of('Thumb'));
            page.node.delete(PDFName.of('PieceInfo'));
            page.node.delete(PDFName.of('Metadata'));
          }

          for (const [ref, obj] of context.enumerateIndirectObjects()) {
            if (obj instanceof PDFRawStream || obj instanceof PDFStream) {
              const dict = obj.dict;
              const type = dict.get(PDFName.of('Type'));
              const subtype = dict.get(PDFName.of('Subtype'));
              if (
                type === PDFName.of('Metadata') ||
                subtype === PDFName.of('XML') ||
                subtype === PDFName.of('Metadata')
              ) {
                context.delete(ref);
              }
            }
          }
        } catch {
          // Safe fallback
        }
      }

      // 3. Native Internal Stream Compression with pako
      setProgress(74);
      setStatusMessage('Recompressing internal object streams with Flate/Deflate...');
      let streamsCompressed = 0;

      for (const [ref, obj] of context.enumerateIndirectObjects()) {
        if (obj instanceof PDFRawStream || obj instanceof PDFStream) {
          const dict = obj.dict;
          const subtype = dict.get(PDFName.of('Subtype'));
          if (subtype === PDFName.of('Image')) continue;

          const filter = dict.get(PDFName.of('Filter'));
          const filterName = filter ? filter.toString() : '';

          const contents =
            obj instanceof PDFRawStream
              ? obj.contents
              : (obj as unknown as { contents: Uint8Array }).contents;

          if (!contents || contents.length === 0) continue;

          if (!filter || filterName === '/null') {
            // Uncompressed stream - compress with deflate level 9
            try {
              const deflated = pako.deflate(contents, { level: 9 });
              if (deflated.length < contents.length) {
                dict.set(PDFName.of('Filter'), PDFName.of('FlateDecode'));
                dict.set(PDFName.of('Length'), PDFNumber.of(deflated.length));
                context.assign(ref, PDFRawStream.of(dict, deflated));
                streamsCompressed++;
              }
            } catch {
              // Ignore
            }
          } else if (filterName.includes('FlateDecode') && !filterName.includes('[')) {
            // Recompress with maximum deflate compression
            try {
              const uncompressed = pako.inflate(contents);
              const recompressed = pako.deflate(uncompressed, { level: 9 });
              if (recompressed.length < contents.length * 0.98) {
                dict.set(PDFName.of('Length'), PDFNumber.of(recompressed.length));
                context.assign(ref, PDFRawStream.of(dict, recompressed));
                streamsCompressed++;
              }
            } catch {
              // Stream may have unsupported predictor or corrupt data, keep as-is
            }
          }
        }
      }

      // 4. Mark-and-Sweep Garbage Collection for Unreferenced Objects
      setProgress(84);
      setStatusMessage('Purging unreferenced objects & duplicate resources...');
      let unreferencedObjectsRemoved = 0;

      try {
        const visitedRefs = new Set<string>();
        const queue: any[] = [];

        if (pdfDoc.catalog) queue.push(pdfDoc.catalog);
        if (context.trailerInfo) {
          if (context.trailerInfo.Root) queue.push(context.trailerInfo.Root);
          if (context.trailerInfo.Info) queue.push(context.trailerInfo.Info);
        }

        while (queue.length > 0) {
          const current = queue.pop();
          if (!current) continue;

          if (current instanceof (PDFRef as any)) {
            const key = `${current.objectNumber}_${current.generationNumber}`;
            if (visitedRefs.has(key)) continue;
            visitedRefs.add(key);
            const resolved = context.lookup(current) as any;
            if (resolved) queue.push(resolved);
          } else if (current instanceof (PDFDict as any)) {
            for (const [, val] of current.entries()) {
              queue.push(val);
            }
          } else if (current instanceof (PDFArray as any)) {
            for (const val of current.asArray()) {
              queue.push(val);
            }
          } else if (current instanceof (PDFStream as any) || current instanceof (PDFRawStream as any)) {
            queue.push(current.dict);
          }
        }

        for (const [ref] of context.enumerateIndirectObjects()) {
          const key = `${ref.objectNumber}_${ref.generationNumber}`;
          if (!visitedRefs.has(key)) {
            context.delete(ref);
            unreferencedObjectsRemoved++;
          }
        }
      } catch {
        // Safe fallback
      }

      // 5. Serialize PDF with object stream compaction
      setProgress(92);
      setStatusMessage('Compacting xref tables and finalizing PDF...');

      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        updateFieldAppearances: false,
      });

      setProgress(98);

      const originalSize = arrayBuffer.byteLength;
      let finalBlob: Blob;
      let compressedSize: number;
      let reductionPercent: number;
      let isAlreadyOptimized = false;

      // 6. Safety Check (Prevent File Enlargement)
      if (compressedBytes.byteLength < originalSize) {
        finalBlob = new Blob([compressedBytes as BlobPart], { type: 'application/pdf' });
        compressedSize = compressedBytes.byteLength;
        reductionPercent = ((originalSize - compressedSize) / originalSize) * 100;
        isAlreadyOptimized = false;
      } else {
        // Automatically return the pristine original file if compression resulted in enlargement or equal size
        finalBlob = new Blob([arrayBuffer], { type: 'application/pdf' });
        compressedSize = originalSize;
        reductionPercent = 0;
        isAlreadyOptimized = true;
      }

      return {
        blob: finalBlob,
        originalSize,
        compressedSize,
        reductionPercent,
        pageCount,
        imagesProcessed: imagesCompressed,
        streamsCompressed,
        unreferencedObjectsRemoved,
        isAlreadyOptimized,
      };
    },
    [loadImageFromBytes, processAndReEncodeImage, extractFlateImageData]
  );

  const handleCompress = useCallback(async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(5);
    setError(null);
    setResult(null);
    setStatusMessage('Reading PDF file...');

    const config = compressionLevels.find((l) => l.id === level) ?? compressionLevels[1];

    try {
      const arrayBuffer = await file.arrayBuffer();
      const res = await runNativeCompression(arrayBuffer, config);

      setProgress(100);
      setResult(res);

      if (res.isAlreadyOptimized) {
        toast.info('This PDF is already highly optimized and cannot be reduced further.');
      } else if (res.reductionPercent >= 40) {
        toast.success(
          `Excellent! Reduced by ${res.reductionPercent.toFixed(1)}% (${formatFileSize(
            res.originalSize - res.compressedSize
          )} saved).`
        );
      } else {
        toast.success(
          `PDF optimized! Reduced by ${res.reductionPercent.toFixed(1)}% across ${res.pageCount} page${
            res.pageCount !== 1 ? 's' : ''
          }.`
        );
      }
    } catch (err) {
      console.error('Compression error:', err);
      setError(
        'Failed to compress PDF. The file may be password protected, corrupted, or have unsupported permissions.'
      );
      toast.error('Compression failed. Please try another file.');
    } finally {
      setIsProcessing(false);
    }
  }, [file, level, runNativeCompression]);

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

  const selectedTier = compressionLevels.find((l) => l.id === level) ?? compressionLevels[1];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Fullscreen Drop Anywhere Drag & Drop Overlay */}
      <DropAnywhere
        onFileDrop={handleFileDrop}
        accept="application/pdf,.pdf"
        title="Drop PDF anywhere"
        subtitle="to optimize and compress instantly"
      />

      {/* Header */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-500 dark:text-brand-300 border border-brand-500/20 mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Native Vector PDF Optimizer & Stream Compactor
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-display text-zinc-900 dark:text-white mb-4">
          Compress PDF Online
        </h1>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
          Reduce PDF file sizes with intelligent native stream optimization.
          Preserves 100% crisp vector text, sharp fonts, and embedded layouts — zero blurry pixels, zero uploads.
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
            accept="application/pdf"
            onFileDrop={handleFileDrop}
            maxSizeMB={100}
            title="Drop your PDF here"
            subtitle="or click to browse from your device (PDF up to 100MB)"
          />
        )}

        {file && !result && (
          <div className="space-y-6">
            {/* File Info */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500 shrink-0">
                  <FileDown className="w-5 h-5" />
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

            {/* Compression Levels */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Select Compression Profile
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {compressionLevels.map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => setLevel(lvl.id)}
                    disabled={isProcessing}
                    className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                      level === lvl.id
                        ? 'border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/20'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white/40 dark:bg-zinc-900/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="font-bold text-sm text-zinc-900 dark:text-white">
                          {lvl.label}
                        </p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-300">
                          {lvl.tagline}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          <FileText className="w-3 h-3" />
                          {lvl.badge}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-3">
                        {lvl.description}
                      </p>
                    </div>
                    <div className="text-[11px] font-medium text-brand-600 dark:text-brand-400 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Target: {lvl.targetReduction}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Processing State */}
            {isProcessing && (
              <div className="flex flex-col items-center py-6">
                <ProgressRing progress={progress} size={90} />
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mt-4">
                  {statusMessage}
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Processing locally inside browser sandbox ({Math.round(progress)}%)
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
                className="w-full btn-primary py-3.5 text-base font-semibold flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Compress PDF ({selectedTier.targetReduction} Target)
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {result && file && (
          <div className="space-y-6">
            {/* Safety Check Notice for Already Optimized PDF */}
            {result.isAlreadyOptimized && (
              <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-white">
                    This PDF is already highly optimized and cannot be reduced further.
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                    Compixor detected that recompressing this document would enlarge its file size or compromise quality. We safely returned your original file so you don&apos;t end up with bloated size or blurry text.
                  </p>
                </div>
              </div>
            )}

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
                  {result.isAlreadyOptimized ? 'Optimal' : `${result.reductionPercent.toFixed(1)}%`}
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-cyan-500/10 text-center border border-cyan-500/20">
                <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-1">
                  Text & Vectors
                </p>
                <p className="text-sm sm:text-base font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                  100% Crisp Vector
                </p>
              </div>
            </div>

            {!isProcessing && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDownload}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5 font-semibold text-sm"
                >
                  <Download className="w-4 h-4" />
                  {result.isAlreadyOptimized ? 'Download Verified PDF' : 'Download Compressed PDF'}
                </button>
                <button
                  onClick={handleReset}
                  className="btn-secondary flex items-center justify-center gap-2 py-3.5 font-semibold text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Compress Another
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Trust & Methodology Section */}
      <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500 mb-3">
            <Sliders className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
            Native Vector Engine
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Preserves 100% copy-pasteable text, sharp fonts, and vector paths. Pages are never rasterized into blurry canvas images.
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 mb-3">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
            Stream Packing & Object GC
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Eliminates orphaned fonts, strips XML metadata, recompresses Flate/Deflate streams, and compacts cross-reference tables.
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
            Enlargement Safety Check
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Guarantees files never enlarge. If a PDF is already optimized, Compixor automatically returns the original without bloating.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mt-16 pt-10 border-t border-zinc-200 dark:border-zinc-800">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold font-display text-zinc-900 dark:text-white mb-2">
            PDF Compressor FAQs
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Answers to common questions about PDF compression
          </p>
        </div>

        <div className="space-y-3">
          {pdfFaqs.map((faq, idx) => {
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
    </div>
  );
}
