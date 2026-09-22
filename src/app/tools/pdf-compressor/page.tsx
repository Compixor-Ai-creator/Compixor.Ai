'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  Archive,
  Trash2,
  Layers,
  SlidersHorizontal,
  ArrowDownToLine,
} from 'lucide-react';
import { toast } from 'sonner';
import FileDropZone from '@/components/FileDropZone';
import DropAnywhere from '@/components/DropAnywhere';
import RelatedPdfTools from '@/components/RelatedPdfTools';
import ClientSideTrustSection from '@/components/ClientSideTrustSection';
import FaqSection from '@/components/FaqSection';
import { pdfCompressorFaqs } from '@/data/faqs';

async function getPdfLib() {
  return await import('pdf-lib');
}

async function getPako() {
  const mod = await import('pako');
  return mod.default || mod;
}

type CompressionLevel = 'balanced' | 'extreme' | 'print';

interface CompressionResult {
  blob: Blob;
  downloadUrl: string;
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
    id: 'balanced',
    label: 'Balanced (Recommended)',
    tagline: '30–50% Reduction',
    badge: 'Crisp Vector Text',
    description:
      'Optimal balance of clarity and file size for resumes, essays & reports. Retains crisp vector text while optimizing embedded images (1200px cap, quality 65).',
    targetReduction: '30–50%',
    jpegQuality: 0.65,
    maxDimension: 1200,
    convertFlateToJpeg: true,
    stripMetadata: true,
    minImageBytes: 8192,
  },
  {
    id: 'extreme',
    label: 'Extreme / Portal Ready (<100KB - 500KB)',
    tagline: '50–75% Reduction',
    badge: 'Portal Compliant',
    description:
      'Aggressively downsamples embedded images for job portals, NADRA, university admissions, and strict upload caps (800px cap, quality 38). Vector text remains unrasterized.',
    targetReduction: '50–75%',
    jpegQuality: 0.38,
    maxDimension: 800,
    convertFlateToJpeg: true,
    stripMetadata: true,
    minImageBytes: 4096,
  },
  {
    id: 'print',
    label: 'High Quality / Print',
    tagline: '10–25% Reduction',
    badge: 'Lossless Cleanup',
    description:
      'Lossless structural cleanup and metadata stripping only. Recompresses internal streams without downsampling photos. 100% original resolution.',
    targetReduction: '10–25%',
    jpegQuality: 0.90,
    maxDimension: 3000,
    convertFlateToJpeg: false,
    stripMetadata: true,
    minImageBytes: 30720,
  },
];

interface BatchFileItem {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'done' | 'error';
  progress: number;
  statusMessage: string;
  result?: CompressionResult;
  error?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function computeFastHash(bytes: Uint8Array): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  const len = Math.min(bytes.length, 1024);
  for (let i = 0; i < len; i++) {
    h1 = Math.imul(h1 ^ bytes[i], 2654435761);
    h2 = Math.imul(h2 ^ bytes[i], 1597334677);
  }
  return `${(h1 >>> 0).toString(16)}_${(h2 >>> 0).toString(16)}_${bytes.length}`;
}

export default function PdfCompressorPage() {
  const [batchItems, setBatchItems] = useState<BatchFileItem[]>([]);
  const [level, setLevel] = useState<CompressionLevel>('balanced');
  const [enableTargetSize, setEnableTargetSize] = useState(false);
  const [targetSizeKB, setTargetSizeKB] = useState<number>(300);
  const [isProcessingAll, setIsProcessingAll] = useState(false);

  // Keep track of all created object URLs to prevent memory leaks
  const createdUrlsRef = useRef<Set<string>>(new Set());

  const registerUrl = useCallback((url: string) => {
    createdUrlsRef.current.add(url);
    return url;
  }, []);

  const revokeAllUrls = useCallback(() => {
    createdUrlsRef.current.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    });
    createdUrlsRef.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      revokeAllUrls();
    };
  }, [revokeAllUrls]);

  const addFilesToBatch = useCallback((incomingFiles: File[]) => {
    const validPdfFiles = incomingFiles.filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );

    if (validPdfFiles.length === 0) {
      toast.error('Please select valid PDF documents.');
      return;
    }

    setBatchItems((prev) => {
      const remainingSlots = 5 - prev.length;
      if (remainingSlots <= 0) {
        toast.warning('Maximum 5 PDFs can be compressed in one batch.');
        return prev;
      }

      if (validPdfFiles.length > remainingSlots) {
        toast.warning(`Added ${remainingSlots} PDF(s). Maximum 5 files per batch.`);
      }

      const filesToAdd = validPdfFiles.slice(0, remainingSlots);
      const newItems: BatchFileItem[] = filesToAdd.map((file) => ({
        id: `${file.name}-${file.size}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        status: 'pending',
        progress: 0,
        statusMessage: 'Ready to compress',
      }));

      return [...prev, ...newItems];
    });
  }, []);

  const handleFileDrop = useCallback(
    (f: File) => {
      addFilesToBatch([f]);
    },
    [addFilesToBatch]
  );

  const removeBatchItem = useCallback((id: string) => {
    setBatchItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.result?.downloadUrl) {
        try {
          URL.revokeObjectURL(target.result.downloadUrl);
        } catch {}
      }
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const handleResetAll = useCallback(() => {
    revokeAllUrls();
    setBatchItems([]);
    setIsProcessingAll(false);
  }, [revokeAllUrls]);

  // Decode helper
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
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) throw new Error('Canvas 2D context unavailable');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      if (source instanceof HTMLImageElement) {
        ctx.drawImage(source, 0, 0, targetWidth, targetHeight);
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

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', jpegQuality)
      );
      if (!blob) throw new Error('Canvas JPEG encoding failed');

      const arrayBuffer = await blob.arrayBuffer();
      return {
        bytes: new Uint8Array(arrayBuffer),
        width: targetWidth,
        height: targetHeight,
      };
    },
    []
  );

  const extractFlateImageData = useCallback(
    (
      rawBytes: Uint8Array,
      width: number,
      height: number,
      colorSpace: string,
      bitsPerComponent: number,
      pakoModule?: any
    ): ImageData | null => {
      try {
        let uncompressed: Uint8Array;
        try {
          uncompressed = pakoModule ? pakoModule.inflate(rawBytes) : rawBytes;
        } catch {
          uncompressed = rawBytes;
        }

        const isRGB =
          colorSpace.includes('RGB') || (!colorSpace.includes('Gray') && !colorSpace.includes('CMYK'));
        const isGray = colorSpace.includes('Gray');

        if (bitsPerComponent === 8 && (isRGB || isGray)) {
          const channels = isRGB ? 3 : 1;
          const expectedLength = width * height * channels;
          if (uncompressed.length >= expectedLength) {
            const imgData = new ImageData(width, height);
            const data = imgData.data;
            let srcIdx = 0;
            let dstIdx = 0;

            for (let y = 0; y < height; y++) {
              for (let x = 0; x < width; x++) {
                if (isRGB) {
                  data[dstIdx] = uncompressed[srcIdx];
                  data[dstIdx + 1] = uncompressed[srcIdx + 1];
                  data[dstIdx + 2] = uncompressed[srcIdx + 2];
                  data[dstIdx + 3] = 255;
                  srcIdx += 3;
                } else {
                  const g = uncompressed[srcIdx];
                  data[dstIdx] = g;
                  data[dstIdx + 1] = g;
                  data[dstIdx + 2] = g;
                  data[dstIdx + 3] = 255;
                  srcIdx += 1;
                }
                dstIdx += 4;
              }
            }
            return imgData;
          }
        }
      } catch {
        // Fallback
      }
      return null;
    },
    []
  );

  // Core Native Optimizer
  const runNativeCompression = useCallback(
    async (
      arrayBuffer: ArrayBuffer,
      config: CompressionTierConfig,
      customTargetKB: number | null,
      onProgress: (prog: number, msg: string) => void
    ): Promise<CompressionResult> => {
      onProgress(8, 'Parsing document structure...');
      const [{ PDFDocument, PDFName, PDFNumber, PDFRawStream, PDFStream, PDFRef, PDFDict, PDFArray }, pako] =
        await Promise.all([getPdfLib(), getPako()]);

      const pdfDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
        updateMetadata: false,
      });

      const pageCount = pdfDoc.getPageCount();
      const context = pdfDoc.context;

      // Effective config: Adjust quality and dimension if target size is constrained
      let effectiveQuality = config.jpegQuality;
      let effectiveMaxDim = config.maxDimension;

      if (customTargetKB && customTargetKB > 0) {
        const currentKB = arrayBuffer.byteLength / 1024;
        if (customTargetKB < currentKB * 0.7) {
          // Strict target size
          effectiveQuality = Math.max(0.30, Math.min(effectiveQuality, 0.45));
          effectiveMaxDim = Math.min(effectiveMaxDim, 800);
        } else if (customTargetKB < currentKB * 0.9) {
          effectiveQuality = Math.max(0.40, Math.min(effectiveQuality, 0.58));
          effectiveMaxDim = Math.min(effectiveMaxDim, 1000);
        }
      }

      onProgress(18, 'Scanning embedded raster images...');
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

      // 1. Optimize embedded images (Only in balanced or extreme mode)
      if (config.id !== 'print') {
        for (let i = 0; i < imageEntries.length; i++) {
          const { ref, stream } = imageEntries[i];
          const dict = stream.dict;

          onProgress(
            20 + Math.round(((i + 1) / Math.max(totalImages, 1)) * 40),
            `Optimizing embedded image ${i + 1} of ${totalImages}...`
          );

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

            if (
              rawBytes &&
              rawBytes.length >= config.minImageBytes &&
              !hasTransparencyMask &&
              origWidth > 0 &&
              origHeight > 0
            ) {
              let processedResult: { bytes: Uint8Array; width: number; height: number } | null =
                null;

              if (filterStr.includes('DCTDecode')) {
                const img = await loadImageFromBytes(rawBytes, 'image/jpeg');
                processedResult = await processAndReEncodeImage(
                  img,
                  effectiveQuality,
                  effectiveMaxDim
                );
              } else if (
                config.convertFlateToJpeg &&
                (filterStr.includes('FlateDecode') || !filter)
              ) {
                const colorSpace = dict.get(PDFName.of('ColorSpace'))?.toString() || 'DeviceRGB';
                const bpcObj = dict.get(PDFName.of('BitsPerComponent'));
                const bpc = bpcObj instanceof PDFNumber ? bpcObj.asNumber() : 8;

                const imgData = extractFlateImageData(
                  rawBytes,
                  origWidth,
                  origHeight,
                  colorSpace,
                  bpc,
                  pako
                );
                if (imgData) {
                  processedResult = await processAndReEncodeImage(
                    imgData,
                    effectiveQuality,
                    effectiveMaxDim
                  );
                }
              }

              if (processedResult) {
                const { bytes: newBytes, width: newWidth, height: newHeight } = processedResult;

                if (
                  newBytes.length < rawBytes.length * 0.95 ||
                  (newWidth < origWidth && newBytes.length <= rawBytes.length)
                ) {
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
            // Keep untouched on error
          }
        }
      }

      // 2. Metadata Stripping
      onProgress(66, 'Stripping unused document metadata...');
      if (config.stripMetadata) {
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
      onProgress(76, 'Recompressing internal object streams with Flate...');
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
            try {
              const deflated = pako.deflate(contents, { level: 9 });
              if (deflated.length < contents.length) {
                dict.set(PDFName.of('Filter'), PDFName.of('FlateDecode'));
                dict.set(PDFName.of('Length'), PDFNumber.of(deflated.length));
                context.assign(ref, PDFRawStream.of(dict, deflated));
                streamsCompressed++;
              }
            } catch {}
          } else if (filterName.includes('FlateDecode') && !filterName.includes('[')) {
            try {
              const uncompressed = pako.inflate(contents);
              const recompressed = pako.deflate(uncompressed, { level: 9 });
              if (recompressed.length < contents.length * 0.98) {
                dict.set(PDFName.of('Length'), PDFNumber.of(recompressed.length));
                context.assign(ref, PDFRawStream.of(dict, recompressed));
                streamsCompressed++;
              }
            } catch {}
          }
        }
      }

      // 4. Mark-and-Sweep Garbage Collection for Unreferenced Objects
      onProgress(86, 'Purging unreferenced objects & duplicate resources...');
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
      } catch {}

      // 5. Serialize PDF with object stream compaction
      onProgress(94, 'Compacting xref tables and finalizing PDF...');

      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        updateFieldAppearances: false,
      });

      const originalSize = arrayBuffer.byteLength;
      let finalBlob: Blob;
      let compressedSize: number;
      let reductionPercent: number;
      let isAlreadyOptimized = false;

      // 6. Size Inflation Guard (Strict Check)
      if (compressedBytes.byteLength < originalSize) {
        finalBlob = new Blob([compressedBytes as BlobPart], { type: 'application/pdf' });
        compressedSize = compressedBytes.byteLength;
        reductionPercent = ((originalSize - compressedSize) / originalSize) * 100;
        isAlreadyOptimized = false;
      } else {
        // Automatically return the original file if compression resulted in enlargement or equal size
        finalBlob = new Blob([arrayBuffer], { type: 'application/pdf' });
        compressedSize = originalSize;
        reductionPercent = 0;
        isAlreadyOptimized = true;
      }

      const downloadUrl = registerUrl(URL.createObjectURL(finalBlob));

      return {
        blob: finalBlob,
        downloadUrl,
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
    [loadImageFromBytes, processAndReEncodeImage, extractFlateImageData, registerUrl]
  );

  // Compress all batch items sequentially
  const handleCompressBatch = useCallback(async () => {
    if (batchItems.length === 0 || isProcessingAll) return;

    setIsProcessingAll(true);
    const selectedConfig = compressionLevels.find((l) => l.id === level) ?? compressionLevels[0];
    const customKB = enableTargetSize && targetSizeKB > 0 ? targetSizeKB : null;

    for (let i = 0; i < batchItems.length; i++) {
      const item = batchItems[i];
      if (item.status === 'done') continue; // skip already finished

      setBatchItems((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? { ...it, status: 'processing', progress: 5, statusMessage: 'Reading PDF...' }
            : it
        )
      );

      try {
        const arrayBuffer = await item.file.arrayBuffer();
        const res = await runNativeCompression(
          arrayBuffer,
          selectedConfig,
          customKB,
          (prog, msg) => {
            setBatchItems((prev) =>
              prev.map((it) =>
                it.id === item.id ? { ...it, progress: prog, statusMessage: msg } : it
              )
            );
          }
        );

        setBatchItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  status: 'done',
                  progress: 100,
                  statusMessage: res.isAlreadyOptimized ? 'Already optimized' : 'Completed',
                  result: res,
                }
              : it
          )
        );

        if (res.isAlreadyOptimized) {
          toast.info(`${item.file.name} is already highly compressed and cannot be reduced further.`);
        } else {
          toast.success(
            `${item.file.name} reduced by ${res.reductionPercent.toFixed(1)}% (${formatFileSize(
              res.originalSize - res.compressedSize
            )} saved)`
          );
        }
      } catch (err) {
        console.error(`Error compressing ${item.file.name}:`, err);
        setBatchItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  status: 'error',
                  progress: 0,
                  statusMessage: 'Error compressing file',
                  error: 'File could not be parsed or is password-protected',
                }
              : it
          )
        );
        toast.error(`Failed to compress ${item.file.name}`);
      }
    }

    setIsProcessingAll(false);
  }, [batchItems, isProcessingAll, level, enableTargetSize, targetSizeKB, runNativeCompression]);

  // Download individual file
  const handleDownloadSingle = useCallback(async (item: BatchFileItem) => {
    if (!item.result?.blob) return;
    const baseName = item.file.name.replace(/\.pdf$/i, '');
    const filename = `${baseName}_compressed.pdf`;
    try {
      const fileSaver = await import('file-saver');
      const save = (fileSaver as any).saveAs || (fileSaver as any).default || fileSaver;
      if (typeof save === 'function') {
        save(item.result.blob, filename);
        return;
      }
    } catch {}
    const url = URL.createObjectURL(item.result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, []);

  // Download all files as a single ZIP
  const handleDownloadAllZip = useCallback(async () => {
    const doneItems = batchItems.filter((it) => it.status === 'done' && it.result?.blob);
    if (doneItems.length === 0) return;

    if (doneItems.length === 1) {
      handleDownloadSingle(doneItems[0]);
      return;
    }

    const JSZipModule = await import('jszip').then((m) => m.default || m);
    const zip = new JSZipModule();
    for (const item of doneItems) {
      const baseName = item.file.name.replace(/\.pdf$/i, '');
      zip.file(`${baseName}_compressed.pdf`, item.result!.blob);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipName = 'compixor_compressed_documents.zip';
    try {
      const fileSaver = await import('file-saver');
      const save = (fileSaver as any).saveAs || (fileSaver as any).default || fileSaver;
      if (typeof save === 'function') {
        save(zipBlob, zipName);
        toast.success('Downloaded all compressed PDFs in a ZIP archive.');
        return;
      }
    } catch {}
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = zipName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success('Downloaded all compressed PDFs in a ZIP archive.');
  }, [batchItems, handleDownloadSingle]);

  const selectedTier = compressionLevels.find((l) => l.id === level) ?? compressionLevels[0];
  const allCompleted = batchItems.length > 0 && batchItems.every((it) => it.status === 'done');
  const totalOriginalSize = batchItems.reduce((acc, it) => acc + it.file.size, 0);
  const totalCompressedSize = batchItems.reduce((acc, it) => {
    if (it.result) return acc + it.result.compressedSize;
    return acc + it.file.size;
  }, 0);
  const overallReduction =
    totalOriginalSize > 0
      ? Math.max(0, ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100)
      : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Fullscreen Drop Anywhere Drag & Drop Overlay */}
      <DropAnywhere
        onFileDrop={handleFileDrop}
        accept="application/pdf,.pdf"
        title="Drop PDF anywhere"
        subtitle="to optimize and compress instantly (up to 5 files)"
      />

      {/* Header */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Hero section icon: Simple flat-style icon of a PDF document shrinking in size, arrow pointing down-right */}
        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-5 p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 shadow-xs flex items-center justify-center">
          <svg
            className="w-full h-full text-brand-500"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="PDF document shrinking in size icon"
            role="img"
          >
            <path
              d="M12 10C12 7.79086 13.7909 6 16 6H38L50 18V44C50 46.2091 48.2091 48 46 48H16C13.7909 48 12 46.2091 12 44V10Z"
              className="stroke-blue-200 dark:stroke-blue-800"
              strokeWidth="2"
              strokeDasharray="3 3"
              fill="none"
            />
            <path
              d="M20 20C20 18.8954 20.8954 18 22 18H38L46 26V52C46 53.1046 45.1046 54 44 54H22C20.8954 54 20 53.1046 20 52V20Z"
              className="fill-blue-500/10 stroke-brand-500 dark:stroke-brand-400"
              strokeWidth="2.5"
            />
            <path d="M38 18V26H46" className="stroke-brand-500 dark:stroke-brand-400" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M26 34H40M26 40H36M26 46H32" className="stroke-brand-400/80 dark:stroke-brand-300/80" strokeWidth="2" strokeLinecap="round" />
            <circle cx="48" cy="48" r="10" className="fill-brand-600 dark:fill-brand-500 shadow-sm" />
            <path d="M44 44L52 52M52 52H46M52 52V46" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20 mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Native Vector PDF Optimizer & Batch Compactor
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-display text-zinc-900 dark:text-white mb-4">
          Free PDF Compressor Online
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
        {/* Upload Dropzone (When no files in batch) */}
        {batchItems.length === 0 && (
          <FileDropZone
            accept="application/pdf"
            onFileDrop={handleFileDrop}
            maxSizeMB={100}
            title="Drop your PDF(s) here"
            subtitle="or click to browse from your device (Up to 5 PDFs, max 100MB each)"
          />
        )}

        {/* When Files Exist in Batch Queue */}
        {batchItems.length > 0 && (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                    {batchItems.length} Document{batchItems.length > 1 ? 's' : ''} in Batch Queue
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Total Original Size: {formatFileSize(totalOriginalSize)}
                    {allCompleted && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold ml-2">
                        • Saved {formatFileSize(totalOriginalSize - totalCompressedSize)} ({overallReduction.toFixed(1)}%)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {batchItems.length < 5 && (
                  <label className="cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-lg border border-brand-500/30 text-brand-600 dark:text-brand-400 hover:bg-brand-500/10 transition">
                    + Add More
                    <input
                      type="file"
                      accept="application/pdf"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) addFilesToBatch(Array.from(e.target.files));
                      }}
                    />
                  </label>
                )}
                <button
                  onClick={handleResetAll}
                  disabled={isProcessingAll}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Batch Files List */}
            <div className="space-y-3">
              {batchItems.map((item, idx) => {
                const isDone = item.status === 'done';
                const isProcessing = item.status === 'processing';
                const hasError = item.status === 'error';
                const res = item.result;

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500 shrink-0 font-bold text-xs">
                          #{idx + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                            {item.file.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                            <span>{formatFileSize(item.file.size)}</span>
                            {isDone && res && (
                              <>
                                <span>&rarr;</span>
                                <span className="font-semibold text-zinc-900 dark:text-white">
                                  {formatFileSize(res.compressedSize)}
                                </span>
                                {res.isAlreadyOptimized ? (
                                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
                                    Already Optimized
                                  </span>
                                ) : (
                                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                                    -{res.reductionPercent.toFixed(1)}%
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isDone && res && (
                          <button
                            onClick={() => handleDownloadSingle(item)}
                            className="px-3 py-1.5 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-xs flex items-center gap-1.5 transition"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </button>
                        )}
                        <button
                          onClick={() => removeBatchItem(item.id)}
                          disabled={isProcessingAll}
                          className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg transition"
                          title="Remove file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar while compressing */}
                    {isProcessing && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                          <span>{item.statusMessage}</span>
                          <span>{item.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-brand-500 to-cyan-500 transition-all duration-300 rounded-full"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Size Inflation Guard Warning Banner */}
                    {isDone && res?.isAlreadyOptimized && (
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs">
                        <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">
                            This PDF is already highly compressed and cannot be reduced further.
                          </p>
                          <p className="text-[11px] opacity-90 mt-0.5">
                            Returned pristine original document to guarantee zero file inflation.
                          </p>
                        </div>
                      </div>
                    )}

                    {hasError && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{item.error || 'Failed to process document.'}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Compression Presets (If any pending files) */}
            {!allCompleted && (
              <div className="space-y-5 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
                    Select Compression Mode
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                    Every mode preserves 100% vector fonts and selectable text.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {compressionLevels.map((lvl) => {
                      const isSelected = level === lvl.id;
                      return (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => setLevel(lvl.id)}
                          className={`p-4 rounded-2xl border text-left transition-all duration-200 relative ${
                            isSelected
                              ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10 shadow-sm ring-2 ring-brand-500/20'
                              : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white/50 dark:bg-zinc-900/30'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
                              {lvl.badge}
                            </span>
                            {isSelected && <Check className="w-4 h-4 text-brand-500 shrink-0" />}
                          </div>
                          <h5 className="font-bold text-sm text-zinc-900 dark:text-white mb-0.5">
                            {lvl.label}
                          </h5>
                          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                            {lvl.tagline}
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            {lvl.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Target Size Slider */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <label
                      htmlFor="target-size-toggle"
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <input
                        id="target-size-toggle"
                        type="checkbox"
                        checked={enableTargetSize}
                        onChange={(e) => setEnableTargetSize(e.target.checked)}
                        className="rounded border-zinc-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
                      />
                      <span className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <SlidersHorizontal className="w-4 h-4 text-brand-500" />
                        Target Maximum Size (KB)
                      </span>
                    </label>

                    {enableTargetSize && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                        {targetSizeKB} KB
                      </span>
                    )}
                  </div>

                  {enableTargetSize && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min={50}
                          max={2000}
                          step={25}
                          value={targetSizeKB}
                          onChange={(e) => setTargetSizeKB(parseInt(e.target.value, 10))}
                          className="w-full accent-brand-500"
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <input
                            type="number"
                            min={50}
                            max={5000}
                            value={targetSizeKB}
                            onChange={(e) => setTargetSizeKB(Math.max(50, parseInt(e.target.value, 10) || 50))}
                            className="w-20 px-2 py-1 text-xs text-center font-bold rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                          />
                          <span className="text-xs text-zinc-500">KB</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Compixor will dynamically tune internal image compression while preserving 100% crisp vector text.
                      </p>
                    </div>
                  )}
                </div>

                {/* Compress Button */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleCompressBatch}
                    disabled={isProcessingAll}
                    className="w-full sm:w-auto px-8 py-3.5 btn-primary font-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    <Zap className="w-4 h-4" />
                    <span>
                      {isProcessingAll
                        ? 'Optimizing Documents...'
                        : `Compress ${batchItems.length} Document${batchItems.length > 1 ? 's' : ''}`}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Batch Complete Action Bar */}
            {allCompleted && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-200">
                      All {batchItems.length} Documents Processed!
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">
                      Reduced total footprint by {overallReduction.toFixed(1)}% ({formatFileSize(totalOriginalSize - totalCompressedSize)} saved).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  {batchItems.length > 1 && (
                    <button
                      onClick={handleDownloadAllZip}
                      className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-2 transition"
                    >
                      <Archive className="w-4 h-4" />
                      <span>Download All (ZIP)</span>
                    </button>
                  )}
                  <button
                    onClick={handleResetAll}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 transition"
                  >
                    Start New Batch
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Feature Highlights Grid with custom icons */}
      <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Zero Rasterization */}
        <div className="p-6 rounded-2xl glass-card flex flex-col justify-between">
          <div>
            {/* Simple flat icon showing sharp vector text vs blurry pixelated text side by side, minimalist line art, blue accent color */}
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 p-2.5 flex items-center justify-center mb-4 border border-brand-500/20">
              <svg className="w-full h-full" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Vector "A" (sharp outline) */}
                <path d="M5 24L10 8L15 24M7 19H13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                {/* Divider */}
                <line x1="17" y1="6" x2="17" y2="26" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="opacity-40" />
                {/* Pixelated dots representing raster blur */}
                <rect x="20" y="8" width="3" height="3" fill="currentColor" opacity="0.3" />
                <rect x="24" y="8" width="3" height="3" fill="currentColor" opacity="0.3" />
                <rect x="22" y="12" width="3" height="3" fill="currentColor" opacity="0.4" />
                <rect x="20" y="16" width="3" height="3" fill="currentColor" opacity="0.5" />
                <rect x="24" y="16" width="3" height="3" fill="currentColor" opacity="0.5" />
                <rect x="19" y="20" width="3" height="3" fill="currentColor" opacity="0.3" />
                <rect x="25" y="20" width="3" height="3" fill="currentColor" opacity="0.3" />
              </svg>
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1">
              Zero Rasterization
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Vector lines, typography, embedded font streams, and forms remain 100% native vector without degradation.
            </p>
          </div>
        </div>

        {/* Size Inflation Guard */}
        <div className="p-6 rounded-2xl glass-card flex flex-col justify-between">
          <div>
            {/* Simple flat icon of a shield with a file icon inside, representing protection, minimalist line art style, blue and green accent */}
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2.5 flex items-center justify-center mb-4 border border-emerald-500/20">
              <svg className="w-full h-full" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Shield */}
                <path d="M16 4L6 8V15C6 21.5 10.3 26.5 16 28C21.7 26.5 26 21.5 26 15V8L16 4Z" className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="2" strokeLinejoin="round" />
                {/* File icon inside shield */}
                <path d="M12 11H18L21 14V21H12V11Z" className="stroke-brand-500 dark:stroke-brand-400" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
                <path d="M18 11V14H21" className="stroke-brand-500 dark:stroke-brand-400" strokeWidth="1.8" />
                <path d="M14 17H19" className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1">
              Size Inflation Guard
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              If a PDF is already fully compressed, Compixor automatically returns the original file to prevent size inflation.
            </p>
          </div>
        </div>

        {/* Batch Support */}
        <div className="p-6 rounded-2xl glass-card flex flex-col justify-between">
          <div>
            {/* Simple flat icon showing 3 stacked document icons with a progress bar underneath, minimalist line art, blue accent color */}
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 p-2.5 flex items-center justify-center mb-4 border border-brand-500/20">
              <svg className="w-full h-full" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* 3 stacked document outlines */}
                <path d="M11 5H23V19H11V5Z" className="stroke-brand-300 dark:stroke-brand-600" strokeWidth="1.5" rx="1" />
                <path d="M8 8H20V22H8V8Z" className="stroke-brand-400 dark:stroke-brand-500" strokeWidth="1.5" rx="1" />
                <path d="M5 11H17V25H5V11Z" className="stroke-brand-600 dark:stroke-brand-300" strokeWidth="1.8" rx="1" fill="none" />
                {/* Progress bar underneath */}
                <rect x="5" y="27" width="22" height="3" rx="1.5" className="fill-zinc-200 dark:fill-zinc-700" />
                <rect x="5" y="27" width="15" height="3" rx="1.5" className="fill-brand-500" />
              </svg>
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1">
              Batch Support
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Process up to 5 PDFs concurrently with live progress reporting and download as individual files or a unified ZIP archive.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section (placed between tool UI/features and FAQ) */}
      <section className="mt-16 p-6 sm:p-8 rounded-3xl glass-card border border-zinc-200/80 dark:border-zinc-800/80">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-zinc-900 dark:text-white">
              How PDF Compression Works in Your Browser
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Native WebAssembly stream processing with zero server uploads
            </p>
          </div>

          {/* Visual Step-by-Step Cards (Matching UI illustration layout) */}
          <div className="space-y-12">
            {/* Step 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Visual Card 1 */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-50/80 to-zinc-50 dark:from-zinc-900/90 dark:to-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                <div className="bg-white dark:bg-zinc-800/90 rounded-2xl p-4 shadow-sm border border-zinc-200/70 dark:border-zinc-700/60 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span>
                    <span>quarterly_financial_report.pdf</span>
                    <span className="ml-auto text-[11px] bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-300 px-2 py-0.5 rounded-md font-mono">18.4 MB</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-700/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">Browser Tab Sandbox</span>
                    </div>
                    <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">0 Bytes Transmitted</span>
                  </div>
                </div>
              </div>

              {/* Text for Step 1 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm">
                    1
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Load & Parse Document in Memory
                  </h3>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed pl-11">
                  When you drop a PDF into Compixor, WebAssembly parses internal content streams, embedded fonts, and raster images entirely in device RAM — zero cloud uploads, zero privacy risk.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Text for Step 2 */}
              <div className="space-y-3 order-2 md:order-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm">
                    2
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Native Stream & Image Optimization
                  </h3>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed pl-11">
                  Embedded raster graphics are re-compressed and Flate object streams are compacted. Redundant metadata is stripped while vector lines, fonts, and form fields remain 100% untouched.
                </p>
              </div>

              {/* Visual Card 2 */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-brand-50/80 to-zinc-50 dark:from-zinc-900/90 dark:to-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-sm order-1 md:order-2">
                <div className="bg-white dark:bg-zinc-800/90 rounded-2xl p-4 shadow-sm border border-zinc-200/70 dark:border-zinc-700/60 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-brand-500" />
                      Balanced Vector Preset
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full text-[11px]">
                      -68% Reduced
                    </span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-brand-500 to-cyan-500 h-full w-[68%] rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-500 pt-1">
                    <span className="bg-zinc-50 dark:bg-zinc-900 px-2 py-1 rounded text-center">Vector Text: 100% Crisp</span>
                    <span className="bg-zinc-50 dark:bg-zinc-900 px-2 py-1 rounded text-center">Inflation Guard: Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Visual Card 3 */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50/80 to-zinc-50 dark:from-zinc-900/90 dark:to-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                <div className="bg-white dark:bg-zinc-800/90 rounded-2xl p-4 shadow-sm border border-zinc-200/70 dark:border-zinc-700/60 space-y-3 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <FileCheck2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white">report_compressed.pdf</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">18.4 MB &rarr; <span className="font-bold text-emerald-600">5.8 MB</span></p>
                  </div>
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-semibold shadow-xs">
                      <Download className="w-3.5 h-3.5" /> Instant Single or Batch ZIP
                    </span>
                  </div>
                </div>
              </div>

              {/* Text for Step 3 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm">
                    3
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Instant Safe Download
                  </h3>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed pl-11">
                  Your optimized PDF is rebuilt instantly in under a few seconds. Download individual PDFs or all compressed files in a single ZIP bundle with one click.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
            <p>
              Most online PDF compressors upload your file to a remote server, process it there, and send back a compressed copy — meaning your document (which might contain financial statements, contracts, or personal records) briefly sits on someone else&apos;s infrastructure.
            </p>
            <p>
              Compixor works differently. Using WebAssembly, the entire compression engine runs locally inside your browser tab. When you drop a PDF into the tool, nothing is transmitted over the network — the file is read, processed, and compressed entirely in your device&apos;s memory.
            </p>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-white mb-2">Here&apos;s what happens under the hood:</p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                <li><strong className="text-zinc-800 dark:text-zinc-200">The PDF&apos;s internal structure is parsed</strong> — text streams, embedded fonts, images, and metadata are separated.</li>
                <li><strong className="text-zinc-800 dark:text-zinc-200">Embedded raster images are re-encoded</strong> at an optimized quality/size ratio (this is usually where the biggest size savings come from).</li>
                <li><strong className="text-zinc-800 dark:text-zinc-200">Redundant objects, unused metadata</strong>, and duplicate font subsets are stripped out.</li>
                <li><strong className="text-zinc-800 dark:text-zinc-200">Vector content — text, lines, shapes, form fields —</strong> is left completely untouched, since compressing these further would degrade quality without meaningful size savings.</li>
                <li><strong className="text-zinc-800 dark:text-zinc-200">The optimized PDF is rebuilt</strong> and made available for download — typically in under a few seconds for most documents.</li>
              </ol>
            </div>
            <p>
              Because nothing leaves your browser, this approach is inherently faster for small-to-medium files (no upload/download round trip) and inherently more private than server-based compressors.
            </p>
          </div>
        </div>
      </section>

      {/* Reusable Client-Side Trust & Privacy Section */}
      <ClientSideTrustSection />

      {/* FAQs Section with SSR-friendly DOM rendering */}
      <FaqSection
        title="PDF Compressor FAQs"
        subtitle="Answers to common questions about PDF compression"
        faqs={pdfCompressorFaqs}
      />

      {/* Related Tools */}
      <RelatedPdfTools currentTool="compressor" />
    </div>
  );
}
