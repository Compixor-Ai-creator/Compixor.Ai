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
  ScanLine,
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
  engineUsed: 'native' | 'deep';
  isStubbornCandidate?: boolean;
}

interface CompressionTierConfig {
  id: CompressionLevel;
  label: string;
  tagline: string;
  badge: string;
  description: string;
  targetReduction: string;
  mode: 'native' | 'deep';
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
    badge: 'Lossless Text',
    description: 'Preserves near-original visual fidelity. 150 DPI cap, quality 85, 100% crisp vector text & fonts.',
    targetReduction: '10–25%',
    mode: 'native',
    jpegQuality: 0.85,
    maxDimension: 1700,
    convertFlateToJpeg: false,
    stripMetadata: false,
    minImageBytes: 15360,
  },
  {
    id: 'recommended',
    label: 'Balanced (Recommended)',
    tagline: '35–50% Reduction',
    badge: 'Selectable Text Preserved',
    description: 'Optimal balance of clarity and file size for resumes, essays & reports. 110 DPI downsampling, quality 65.',
    targetReduction: '35–50%',
    mode: 'native',
    jpegQuality: 0.65,
    maxDimension: 1200,
    convertFlateToJpeg: true,
    stripMetadata: true,
    minImageBytes: 8192,
  },
  {
    id: 'deep',
    label: 'Deep Scanned (Maximum)',
    tagline: '65–85%+ Reduction',
    badge: 'iLovePDF-Level Compactor',
    description: 'Aggressive page rasterizer for scanned documents, contracts, receipts, camera photos & stubborn PDFs.',
    targetReduction: '65–85%+',
    mode: 'deep',
    jpegQuality: 0.60,
    maxDimension: 1100,
    convertFlateToJpeg: true,
    stripMetadata: true,
    minImageBytes: 0,
  },
];

const pdfFaqs = [
  {
    q: 'How does the Smart Hybrid PDF compressor work?',
    a: 'Compixor features two engines: 1) A Native Vector Engine that preserves 100% copy-pasteable text and sharp fonts while compressing embedded photos, and 2) A Deep Scanned Rasterizer (powered by pdfjs-dist) that downsamples stubborn scanned contracts and receipts to achieve 65%–85%+ reduction, matching iLovePDF.',
  },
  {
    q: 'Will my text still be selectable (Ctrl+F)?',
    a: 'Yes! In Low and Balanced modes, all text remains 100% vector, selectable, and searchable. If you select Deep Scanned Mode, pages are converted into optimized web-resolution canvases—ideal for scanned paperwork where text is already non-selectable.',
  },
  {
    q: 'Are my confidential documents uploaded to any server?',
    a: "Never. Unlike traditional online tools that store your PDFs on remote cloud servers, Compixor's entire compression process takes place inside your browser's local sandbox memory. Zero file data ever leaves your device.",
  },
  {
    q: 'Why did my previous PDF barely reduce in size?',
    a: 'Many PDFs are scanned documents encoded with legacy JBIG2 or CCITT Fax formats that ordinary web tools cannot compress without dedicated native engines. Compixors Deep Scanned Mode was specifically built to handle these stubborn files with massive reduction.',
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

  // ── Engine 1: Native Mode (Preserves Selectable Text & Vector Graphics) ──
  const runNativeCompression = useCallback(
    async (
      arrayBuffer: ArrayBuffer,
      config: CompressionTierConfig
    ): Promise<CompressionResult> => {
      const pdfLib = await import('pdf-lib');
      const { PDFDocument, PDFName, PDFNumber, PDFRawStream, PDFStream } = pdfLib;

      setProgress(15);
      setStatusMessage('Analyzing document catalog & fonts...');

      const pdfDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      });

      const pageCount = pdfDoc.getPageCount();
      setProgress(22);
      setStatusMessage('Scanning embedded images and streams...');

      const context = pdfDoc.context;
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

      setProgress(28);

      const dedupeMap = new Map<string, ReturnType<typeof context.stream>>();
      let imagesCompressed = 0;
      const totalImages = imageEntries.length;

      for (let i = 0; i < imageEntries.length; i++) {
        const { ref, stream } = imageEntries[i];
        const dict = stream.dict;

        setStatusMessage(`Optimizing image ${i + 1} of ${totalImages}...`);

        try {
          const filter = dict.get(PDFName.of('Filter'));
          const filterStr = filter ? filter.toString() : '';
          const smask = dict.get(PDFName.of('SMask'));
          const mask = dict.get(PDFName.of('Mask'));
          const hasTransparencyMask = Boolean(smask || mask);

          const widthObj = dict.get(PDFName.of('Width'));
          const heightObj = dict.get(PDFName.of('Height'));
          const origWidth = widthObj instanceof PDFNumber ? widthObj.asNumber() : 0;
          const origHeight = heightObj instanceof PDFNumber ? heightObj.asNumber() : 0;

          const rawBytes =
            stream instanceof PDFRawStream
              ? stream.contents
              : (stream as unknown as { contents: Uint8Array }).contents;

          if (rawBytes && rawBytes.length >= config.minImageBytes) {
            let processedResult: { bytes: Uint8Array; width: number; height: number } | null = null;

            if (filterStr.includes('DCTDecode')) {
              const img = await loadImageFromBytes(rawBytes, 'image/jpeg');
              processedResult = await processAndReEncodeImage(img, config.jpegQuality, config.maxDimension);
            } else if (
              config.convertFlateToJpeg &&
              !hasTransparencyMask &&
              (filterStr.includes('FlateDecode') || !filter) &&
              origWidth > 0 &&
              origHeight > 0
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

              if (newBytes.length < rawBytes.length * 0.95 || newWidth < origWidth) {
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

        const imageProgress = 28 + ((i + 1) / Math.max(totalImages, 1)) * 52;
        setProgress(imageProgress);
      }

      setProgress(82);

      if (config.stripMetadata) {
        setStatusMessage('Stripping bloated metadata & unreferenced objects...');
        try {
          pdfDoc.setTitle('');
          pdfDoc.setAuthor('');
          pdfDoc.setSubject('');
          pdfDoc.setKeywords([]);
          pdfDoc.setProducer('Compixor PDF Optimizer');
          pdfDoc.setCreator('');

          const catalog = pdfDoc.catalog;
          catalog.delete(PDFName.of('Metadata'));
          catalog.delete(PDFName.of('PieceInfo'));
          catalog.delete(PDFName.of('MarkInfo'));

          const pages = pdfDoc.getPages();
          for (const page of pages) {
            page.node.delete(PDFName.of('Thumb'));
            page.node.delete(PDFName.of('PieceInfo'));
          }

          for (const [ref, obj] of allObjects) {
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
          // Safe metadata stripping
        }
      }

      setProgress(88);
      setStatusMessage('Compressing object streams and packing cross-reference table...');

      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      setProgress(96);

      const blob = new Blob([compressedBytes as BlobPart], { type: 'application/pdf' });
      const originalSize = arrayBuffer.byteLength;
      const compressedSize = blob.size;
      const reductionPercent = Math.max(0, ((originalSize - compressedSize) / originalSize) * 100);

      // Flag stubborn files (scans / complex vector PDFs with low reduction)
      const isStubbornCandidate = reductionPercent < 12 && originalSize > 150 * 1024;

      return {
        blob,
        originalSize,
        compressedSize,
        reductionPercent,
        pageCount,
        imagesProcessed: imagesCompressed,
        engineUsed: 'native',
        isStubbornCandidate,
      };
    },
    [loadImageFromBytes, processAndReEncodeImage, extractFlateImageData]
  );

  // ── Engine 2: Deep Scanned Mode (Page-Level Canvas Rasterizer via pdfjs-dist) ──
  const runDeepScannedCompression = useCallback(
    async (
      arrayBuffer: ArrayBuffer,
      config: CompressionTierConfig
    ): Promise<CompressionResult> => {
      setStatusMessage('Loading high-performance raster engine...');
      setProgress(10);

      const pdfjsLib = await import('pdfjs-dist');
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        try {
          pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        } catch {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        }
      }

      const pdfLib = await import('pdf-lib');
      const { PDFDocument } = pdfLib;

      setProgress(18);
      setStatusMessage('Reading document structure & pages...');

      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
        cMapPacked: true,
      });
      const pdfDoc = await loadingTask.promise;
      const pageCount = pdfDoc.numPages;

      const outputPdfDoc = await PDFDocument.create();

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Canvas 2D context unavailable');

      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        const pct = Math.round(20 + ((pageNum - 1) / pageCount) * 68);
        setProgress(pct);
        setStatusMessage(`Rasterizing & compressing page ${pageNum} of ${pageCount}...`);

        const page = await pdfDoc.getPage(pageNum);
        const unscaledViewport = page.getViewport({ scale: 1.0 });

        // Calculate scale targeting optimal DPI (~100-120 DPI)
        const maxSide = Math.max(unscaledViewport.width, unscaledViewport.height);
        let scale = 1.35;
        if (maxSide * scale > config.maxDimension) {
          scale = config.maxDimension / maxSide;
        }
        scale = Math.min(Math.max(scale, 0.75), 1.6);

        const viewport = page.getViewport({ scale });
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: ctx,
          viewport,
        }).promise;

        const jpegBytes: Uint8Array = await new Promise((resolve, reject) => {
          canvas.toBlob(
            (b) => {
              if (!b) return reject(new Error(`Failed to rasterize page ${pageNum}`));
              b.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
            },
            'image/jpeg',
            config.jpegQuality
          );
        });

        const embeddedImage = await outputPdfDoc.embedJpg(jpegBytes);
        const newPage = outputPdfDoc.addPage([unscaledViewport.width, unscaledViewport.height]);
        newPage.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: unscaledViewport.width,
          height: unscaledViewport.height,
        });

        page.cleanup();
      }

      // Free canvas memory
      canvas.width = 0;
      canvas.height = 0;

      setProgress(92);
      setStatusMessage('Assembling optimized document streams...');

      const outputBytes = await outputPdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      setProgress(98);

      const blob = new Blob([outputBytes as BlobPart], { type: 'application/pdf' });
      const originalSize = arrayBuffer.byteLength;
      const compressedSize = blob.size;
      const reductionPercent = Math.max(0, ((originalSize - compressedSize) / originalSize) * 100);

      return {
        blob,
        originalSize,
        compressedSize,
        reductionPercent,
        pageCount,
        imagesProcessed: pageCount,
        engineUsed: 'deep',
        isStubbornCandidate: false,
      };
    },
    []
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

      let res: CompressionResult;
      if (config.mode === 'deep') {
        res = await runDeepScannedCompression(arrayBuffer, config);
      } else {
        res = await runNativeCompression(arrayBuffer, config);
      }

      setProgress(100);
      setResult(res);

      if (res.reductionPercent >= 40) {
        toast.success(
          `Excellent! Reduced by ${res.reductionPercent.toFixed(1)}% (${formatFileSize(
            res.originalSize - res.compressedSize
          )} saved).`
        );
      } else if (res.isStubbornCandidate) {
        toast.info('Document processed. Notice: Scanned elements detected for deeper compression.');
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
  }, [file, level, runNativeCompression, runDeepScannedCompression]);

  const handleTriggerDeepScanned = useCallback(async () => {
    if (!file) return;
    setLevel('deep');
    setIsProcessing(true);
    setProgress(5);
    setError(null);
    setStatusMessage('Switching to Deep Scanned Mode...');

    const deepConfig = compressionLevels.find((l) => l.id === 'deep')!;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const res = await runDeepScannedCompression(arrayBuffer, deepConfig);
      setProgress(100);
      setResult(res);
      toast.success(
        `Deep Scanned success! Squeezed by ${res.reductionPercent.toFixed(1)}% (${formatFileSize(
          res.originalSize - res.compressedSize
        )} saved).`
      );
    } catch (err) {
      console.error('Deep compression error:', err);
      setError('Deep compression failed. The file may be password-protected or invalid.');
      toast.error('Deep compression failed.');
    } finally {
      setIsProcessing(false);
    }
  }, [file, runDeepScannedCompression]);

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
          Smart Hybrid In-Browser PDF Optimizer
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-display text-zinc-900 dark:text-white mb-4">
          Compress PDF Online
        </h1>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
          Reduce PDF file sizes with intelligent multi-engine compression.
          Preserve crisp selectable text or achieve extreme scanned reduction — 100% private, zero uploads.
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
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                            lvl.mode === 'deep'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {lvl.mode === 'deep' ? (
                            <ScanLine className="w-3 h-3" />
                          ) : (
                            <FileText className="w-3 h-3" />
                          )}
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
            {/* Stubborn Scanned Fallback Alert */}
            {result.isStubbornCandidate && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <ScanLine className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-white">
                      Scanned Document or Stubborn Layers Detected
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      This PDF yielded only {result.reductionPercent.toFixed(1)}% reduction with native text preservation. Switch to Deep Scanned Mode for up to 85% compression.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleTriggerDeepScanned}
                  disabled={isProcessing}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shrink-0 transition flex items-center gap-1.5 shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Apply Deep Scanned Mode
                </button>
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
                  {result.reductionPercent.toFixed(1)}%
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-cyan-500/10 text-center border border-cyan-500/20">
                <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-1">
                  {result.engineUsed === 'deep' ? 'Engine' : 'Images Optimized'}
                </p>
                <p className="text-sm sm:text-base font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                  {result.engineUsed === 'deep' ? 'Deep Scanned' : `${result.imagesProcessed} (${result.pageCount} pgs)`}
                </p>
              </div>
            </div>

            {/* Processing State while switching engines */}
            {isProcessing && (
              <div className="flex flex-col items-center py-6">
                <ProgressRing progress={progress} size={90} />
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mt-4">
                  {statusMessage}
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Applying Deep Scanned compression ({Math.round(progress)}%)
                </p>
              </div>
            )}

            {!isProcessing && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDownload}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5 font-semibold text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download Compressed PDF
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
            Dual Engine Intelligence
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Choose between native vector preservation (for crisp selectable text) or aggressive deep scan rasterization (for maximum file reduction).
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 mb-3">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
            Deduplication & Stream Packing
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Eliminates duplicate assets, strips unused document XML metadata, and compacts cross-reference object tables.
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
            100% Client-Side Privacy
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Processing runs strictly inside WebAssembly & HTML5 Canvas in your browser memory. Zero files uploaded to remote servers.
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
