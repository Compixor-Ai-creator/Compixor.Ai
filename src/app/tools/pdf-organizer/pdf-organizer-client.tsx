'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Files,
  Scissors,
  Upload,
  Download,
  Trash2,
  MoveUp,
  MoveDown,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  RotateCcw,
  Check,
  X,
  FileDown,
  Archive,
  Layers,
  ShieldCheck,
  Zap,
  Lock,
  MonitorSmartphone,
  Eye,
  Plus,
  Loader2,
  FileSpreadsheet,
  Image as ImageIcon,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  ListFilter,
} from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import RelatedPdfTools from '@/components/RelatedPdfTools';

// Helper to format bytes
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

// Types
interface MergeFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  fileType: 'pdf' | 'image';
  pageCount: number;
  thumbnailUrl: string | null;
  isEncrypted: boolean;
  isCorrupted: boolean;
  errorMessage?: string;
}

interface MergePageItem {
  id: string;
  fileId: string;
  fileName: string;
  sourcePageIndex: number;
  displayPageNumber: number;
  fileType: 'pdf' | 'image';
  thumbnailUrl: string | null;
  rotation: number; // 0, 90, 180, 270 degrees
}

// Helper to decode an image (e.g. WEBP or fallback PNG/JPG) into a transparent canvas and export as PNG bytes
async function decodeImageToPngBytes(file: File): Promise<{ bytes: Uint8Array; isPng: true }> {
  // 1. Try createImageBitmap if supported (native browser decoding)
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable');
      // Ensure canvas is clear so transparent alpha channels are strictly preserved
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();
      const pngBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!pngBlob) throw new Error('Failed to convert canvas to PNG');
      const pngBuffer = await pngBlob.arrayBuffer();
      return { bytes: new Uint8Array(pngBuffer), isPng: true };
    } catch (err) {
      console.warn('createImageBitmap decoding failed, falling back to Image element:', err);
    }
  }

  // 2. Fallback using native HTMLImageElement + canvas
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            reject(new Error('Failed to convert canvas to PNG'));
            return;
          }
          const reBuffer = await blob.arrayBuffer();
          resolve({ bytes: new Uint8Array(reBuffer), isPng: true });
        },
        'image/png'
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to decode image'));
    };
    img.src = url;
  });
}

// Image to PDF embed bytes helper
async function imageFileToEmbedData(file: File): Promise<{ bytes: Uint8Array; isPng: boolean }> {
  const isWebp = file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp');
  const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');

  // pdf-lib does not have native embedWebp() — decode WEBP into canvas and convert to PNG blob
  if (isWebp) {
    return decodeImageToPngBytes(file);
  }

  const buffer = await file.arrayBuffer();

  try {
    const testDoc = await PDFDocument.create();
    if (isPng) {
      await testDoc.embedPng(buffer);
      return { bytes: new Uint8Array(buffer), isPng: true };
    } else {
      await testDoc.embedJpg(buffer);
      return { bytes: new Uint8Array(buffer), isPng: false };
    }
  } catch {
    // If direct embedding has issues with color space or headers, re-encode via transparent canvas as PNG
    return decodeImageToPngBytes(file);
  }
}

interface SplitThumbnail {
  pageNumber: number;
  thumbnailUrl: string | null;
  width: number;
  height: number;
}

type SplitMode = 'range' | 'all-pages' | 'selected-individual';

interface RangeValidation {
  isValid: boolean;
  pages: number[];
  error?: string;
  warning?: string;
}

// PDF.js loader with CDN worker
async function getPdfJs() {
  const pdfjs = await import('pdfjs-dist');
  if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }
  return pdfjs;
}

// Render first page thumbnail for Merge list
async function renderFirstPageThumbnail(arrayBuffer: ArrayBuffer): Promise<{ thumbnailUrl: string | null; pageCount: number }> {
  try {
    const pdfjs = await getPdfJs();
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer.slice(0)) });
    const pdf = await loadingTask.promise;
    const pageCount = pdf.numPages;

    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 0.35 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      await page.render({ canvasContext: ctx, viewport }).promise;
      const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.85);
      return { thumbnailUrl, pageCount };
    }
    return { thumbnailUrl: null, pageCount };
  } catch (err) {
    console.warn('PDF.js thumbnail render error:', err);
    return { thumbnailUrl: null, pageCount: 1 };
  }
}

// Render page thumbnail for Split mode
async function renderPageThumbnail(pdfDocProxy: any, pageNum: number): Promise<string | null> {
  try {
    const page = await pdfDocProxy.getPage(pageNum);
    const viewport = page.getViewport({ scale: 0.35 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    await page.render({ canvasContext: ctx, viewport }).promise;
    return canvas.toDataURL('image/jpeg', 0.85);
  } catch (err) {
    console.warn(`Failed to render thumbnail for page ${pageNum}:`, err);
    return null;
  }
}

// FAQ Data
const toolFaqs = [
  {
    q: 'Is there a limit on how many PDFs I can merge or split?',
    a: 'No! Because all processing takes place entirely on your device using client-side WebAssembly, there are no artificial file count limits, daily quotas, or paywalls. You can merge as many documents as your browser memory allows.',
  },
  {
    q: 'Are my confidential documents uploaded to any server?',
    a: 'Never. Unlike traditional online PDF tools that upload your files to remote cloud servers, Compixor executes 100% locally in your browser memory. Zero file data, metadata, or document contents ever leave your device.',
  },
  {
    q: 'How does the range input syntax work for splitting?',
    a: 'You can enter single pages or page ranges separated by commas, such as "1-3, 5, 8-10". Compixor automatically validates bounds, checks for reversed ranges (e.g. 10-5), removes duplicates, and visually highlights the matching pages on the interactive preview grid.',
  },
  {
    q: 'Can this tool process password-protected or encrypted PDFs?',
    a: 'For security and privacy reasons, standard password-protected PDFs must have their security encryption removed before merging or extracting pages. Compixor will immediately alert you if an uploaded PDF is password-encrypted.',
  },
];

export default function PdfOrganizerClient({ initialTab = 'merge' }: { initialTab?: 'merge' | 'split' }) {
  const [activeTab, setActiveTab] = useState<'merge' | 'split'>(initialTab);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // -------------------------------------------------------------
  // FEATURE 1: PDF MERGER STATE
  // -------------------------------------------------------------
  const [mergeFiles, setMergeFiles] = useState<MergeFileItem[]>([]);
  const [mergePages, setMergePages] = useState<MergePageItem[]>([]);
  const [mergeViewMode, setMergeViewMode] = useState<'pages' | 'files'>('pages');
  const [isMerging, setIsMerging] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);
  const [mergeStatus, setMergeStatus] = useState('');
  const [mergeResultBlob, setMergeResultBlob] = useState<Blob | null>(null);
  const [mergeResultStats, setMergeResultStats] = useState<{ count: number; pages: number; size: number } | null>(null);
  const mergeFileInputRef = useRef<HTMLInputElement>(null);
  const [isMergeDragOver, setIsMergeDragOver] = useState(false);
  const mergeDragCounterRef = useRef(0);

  // -------------------------------------------------------------
  // FEATURE 2: PDF SPLITTER STATE
  // -------------------------------------------------------------
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [splitArrayBuffer, setSplitArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [splitPdfDoc, setSplitPdfDoc] = useState<any | null>(null);
  const [splitPageCount, setSplitPageCount] = useState<number>(0);
  const [splitThumbnails, setSplitThumbnails] = useState<SplitThumbnail[]>([]);
  const [isLoadingThumbnails, setIsLoadingThumbnails] = useState(false);
  const [splitError, setSplitError] = useState<string | null>(null);
  const [rangeInput, setRangeInput] = useState<string>('1');
  const [selectedPagesSet, setSelectedPagesSet] = useState<Set<number>>(new Set([1]));
  const [splitMode, setSplitMode] = useState<SplitMode>('range');
  const [isSplitting, setIsSplitting] = useState(false);
  const [splitProgress, setSplitProgress] = useState(0);
  const [splitStatus, setSplitStatus] = useState('');
  const [splitResultBlob, setSplitResultBlob] = useState<Blob | null>(null);
  const [splitResultFilename, setSplitResultFilename] = useState<string>('');
  const [splitResultStats, setSplitResultStats] = useState<{ pages: number; size: number; isZip: boolean } | null>(null);
  const splitFileInputRef = useRef<HTMLInputElement>(null);
  const [isSplitDragOver, setIsSplitDragOver] = useState(false);
  const splitDragCounterRef = useRef(0);
  const [isDraggingGlobal, setIsDraggingGlobal] = useState(false);
  const dragCounterRef = useRef(0);

  // Total size of merge files for 50MB soft warning
  const totalMergeSize = useMemo(() => {
    return mergeFiles.reduce((acc, f) => acc + f.size, 0);
  }, [mergeFiles]);

  const totalMergePages = useMemo(() => {
    return mergeFiles.reduce((acc, f) => acc + (f.isEncrypted || f.isCorrupted ? 0 : f.pageCount), 0);
  }, [mergeFiles]);

  const hasMergeEncryptedOrCorrupted = useMemo(() => {
    return mergeFiles.some((f) => f.isEncrypted || f.isCorrupted);
  }, [mergeFiles]);

  // -------------------------------------------------------------
  // MERGE FILE HANDLERS
  // -------------------------------------------------------------
  const processNewMergeFiles = useCallback(async (files: File[]) => {
    const isPdfFile = (f: File) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
    const isImageFile = (f: File) =>
      f.type === 'image/jpeg' ||
      f.type === 'image/png' ||
      f.type === 'image/webp' ||
      /\.(jpe?g|png|webp)$/i.test(f.name);

    const validFiles = files.filter((f) => isPdfFile(f) || isImageFile(f));

    if (validFiles.length === 0) {
      toast.error('Only PDF, JPG, PNG, and WEBP files are supported.');
      return;
    }

    if (validFiles.length < files.length) {
      toast.error('Only PDF, JPG, PNG, and WEBP files are supported.');
    }

    const toastId = toast.loading(`Analyzing ${validFiles.length} file(s)...`);

    const newItems: MergeFileItem[] = [];
    const newPageItems: MergePageItem[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const id = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const isImg = isImageFile(file);

      if (isImg) {
        // Image item (JPG / PNG / WEBP)
        let thumbnailUrl: string | null = null;
        let isCorrupted = false;
        let errorMessage: string | undefined;

        try {
          thumbnailUrl = URL.createObjectURL(file);
        } catch {
          isCorrupted = true;
          errorMessage = 'Corrupted or unreadable image file.';
        }

        newItems.push({
          id,
          file,
          name: file.name,
          size: file.size,
          fileType: 'image',
          pageCount: 1,
          thumbnailUrl,
          isEncrypted: false,
          isCorrupted,
          errorMessage,
        });

        if (!isCorrupted) {
          newPageItems.push({
            id: `page_${id}_0`,
            fileId: id,
            fileName: file.name,
            sourcePageIndex: 0,
            displayPageNumber: 1,
            fileType: 'image',
            thumbnailUrl,
            rotation: 0,
          });
        }
      } else {
        // PDF item
        try {
          const buffer = await file.arrayBuffer();

          let pageCount = 1;
          let isEncrypted = false;
          let isCorrupted = false;
          let errorMessage: string | undefined;

          try {
            const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
            if ((doc as any).isEncrypted) {
              isEncrypted = true;
              errorMessage = 'This file is encrypted and password-protected.';
            } else {
              pageCount = doc.getPageCount();
            }
          } catch (e: any) {
            const msg = (e?.message || '').toLowerCase();
            if (msg.includes('encrypt') || msg.includes('password')) {
              isEncrypted = true;
              errorMessage = 'This file is encrypted and password-protected.';
            } else {
              isCorrupted = true;
              errorMessage = 'Corrupted or unreadable PDF structure.';
            }
          }

          let thumbnailUrl: string | null = null;
          let pdfjsDocProxy: any = null;

          if (!isEncrypted && !isCorrupted) {
            try {
              const pdfjs = await getPdfJs();
              const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer.slice(0)) });
              pdfjsDocProxy = await loadingTask.promise;
              if (pdfjsDocProxy.numPages > 0) pageCount = pdfjsDocProxy.numPages;
              thumbnailUrl = await renderPageThumbnail(pdfjsDocProxy, 1);
            } catch (err) {
              console.warn('PDF.js thumbnail render error:', err);
            }
          }

          newItems.push({
            id,
            file,
            name: file.name,
            size: file.size,
            fileType: 'pdf',
            pageCount,
            thumbnailUrl,
            isEncrypted,
            isCorrupted,
            errorMessage,
          });

          if (!isEncrypted && !isCorrupted) {
            for (let p = 1; p <= pageCount; p++) {
              newPageItems.push({
                id: `page_${id}_${p - 1}`,
                fileId: id,
                fileName: file.name,
                sourcePageIndex: p - 1,
                displayPageNumber: p,
                fileType: 'pdf',
                thumbnailUrl: p === 1 ? thumbnailUrl : null,
                rotation: 0,
              });
            }

            // Asynchronously load remaining page thumbnails if multi-page
            if (pdfjsDocProxy && pageCount > 1) {
              (async () => {
                for (let p = 2; p <= pageCount; p++) {
                  try {
                    const thumb = await renderPageThumbnail(pdfjsDocProxy, p);
                    if (thumb) {
                      setMergePages((current) =>
                        current.map((item) =>
                          item.fileId === id && item.sourcePageIndex === p - 1
                            ? { ...item, thumbnailUrl: thumb }
                            : item
                        )
                      );
                    }
                  } catch (err) {
                    console.warn(`Failed loading thumbnail for page ${p}:`, err);
                  }
                }
              })();
            }
          }
        } catch {
          newItems.push({
            id,
            file,
            name: file.name,
            size: file.size,
            fileType: 'pdf',
            pageCount: 0,
            thumbnailUrl: null,
            isEncrypted: false,
            isCorrupted: true,
            errorMessage: 'Failed to read file from disk.',
          });
        }
      }
    }

    toast.dismiss(toastId);
    setMergeFiles((prev) => [...prev, ...newItems]);
    setMergePages((prev) => [...prev, ...newPageItems]);
    setMergeResultBlob(null);
    setMergeResultStats(null);
    toast.success(
      `Added ${newItems.length} file${newItems.length > 1 ? 's' : ''} (${newPageItems.length} total pages) to queue.`
    );
  }, []);

  const handleMergeDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    mergeDragCounterRef.current = 0;
    setIsMergeDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processNewMergeFiles(Array.from(e.dataTransfer.files));
    }
  };

  const moveMergeItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === mergeFiles.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...mergeFiles];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setMergeFiles(updated);
  };

  const removeMergeItem = (id: string) => {
    setMergeFiles((prev) => prev.filter((item) => item.id !== id));
    setMergePages((prev) => prev.filter((item) => item.fileId !== id));
  };

  const clearMergeAll = () => {
    setMergeFiles([]);
    setMergePages([]);
    setMergeResultBlob(null);
    setMergeResultStats(null);
  };

  // Page-level manipulation helpers
  const rotateMergePage = (pageId: string) => {
    setMergePages((prev) =>
      prev.map((p) => (p.id === pageId ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    );
  };

  const deleteMergePage = (pageId: string) => {
    setMergePages((prev) => prev.filter((p) => p.id !== pageId));
    toast.info('Page removed from merge sequence.');
  };

  const moveMergePage = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === mergePages.length - 1) return;

    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    setMergePages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(index, 1);
      updated.splice(targetIndex, 0, moved);
      return updated;
    });
  };

  // Perform PDF Merge using page sequence and rotations
  const handleExecuteMerge = async () => {
    if (mergePages.length === 0) {
      toast.error('No pages remaining to merge. Please add files.');
      return;
    }

    if (mergeFiles.length < 2 && mergePages.length < 2) {
      toast.error('Please upload at least 2 files or pages to merge.');
      return;
    }

    if (hasMergeEncryptedOrCorrupted) {
      toast.error('Please remove or decrypt encrypted/corrupted files before merging.');
      return;
    }

    setIsMerging(true);
    setMergeProgress(5);
    setMergeStatus('Initializing PDF compilation...');

    try {
      const mergedPdf = await PDFDocument.create();

      // Pre-load and cache PDFDocuments by fileId to avoid repeated loading
      const pdfDocMap = new Map<string, PDFDocument>();
      for (const f of mergeFiles) {
        if (f.fileType === 'pdf') {
          const buf = await f.file.arrayBuffer();
          const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
          pdfDocMap.set(f.id, doc);
        }
      }

      for (let i = 0; i < mergePages.length; i++) {
        const pageItem = mergePages[i];
        const stepProgress = Math.round(10 + (i / mergePages.length) * 75);
        setMergeProgress(stepProgress);
        setMergeStatus(`Processing page ${i + 1} of ${mergePages.length} ("${pageItem.fileName}")...`);

        const sourceFile = mergeFiles.find((f) => f.id === pageItem.fileId);
        if (!sourceFile) continue;

        if (pageItem.fileType === 'image') {
          // Convert image file into a page in mergedPdf
          const imgData = await imageFileToEmbedData(sourceFile.file);
          const embeddedImg = imgData.isPng
            ? await mergedPdf.embedPng(imgData.bytes)
            : await mergedPdf.embedJpg(imgData.bytes);

          // Standard A4 page dimensions (595.28 x 841.89 points)
          const isLandscape = embeddedImg.width > embeddedImg.height;
          const pageWidth = isLandscape ? 841.89 : 595.28;
          const pageHeight = isLandscape ? 595.28 : 841.89;
          const page = mergedPdf.addPage([pageWidth, pageHeight]);

          const margin = 20;
          const availWidth = pageWidth - margin * 2;
          const availHeight = pageHeight - margin * 2;
          const scale = Math.min(availWidth / embeddedImg.width, availHeight / embeddedImg.height);
          const drawWidth = embeddedImg.width * scale;
          const drawHeight = embeddedImg.height * scale;
          const x = (pageWidth - drawWidth) / 2;
          const y = (pageHeight - drawHeight) / 2;

          page.drawImage(embeddedImg, {
            x,
            y,
            width: drawWidth,
            height: drawHeight,
          });

          if (pageItem.rotation !== 0) {
            page.setRotation(degrees(pageItem.rotation));
          }
        } else {
          // PDF document page
          const srcDoc = pdfDocMap.get(pageItem.fileId);
          if (srcDoc) {
            const [copiedPage] = await mergedPdf.copyPages(srcDoc, [pageItem.sourcePageIndex]);
            const existingAngle = copiedPage.getRotation().angle || 0;
            const finalAngle = (existingAngle + pageItem.rotation) % 360;
            copiedPage.setRotation(degrees(finalAngle));
            mergedPdf.addPage(copiedPage);
          }
        }
      }

      setMergeProgress(90);
      setMergeStatus('Compacting streams and finalizing PDF...');

      const mergedBytes = await mergedPdf.save({ useObjectStreams: true });
      const blob = new Blob([mergedBytes as BlobPart], { type: 'application/pdf' });

      setMergeProgress(100);
      setMergeResultBlob(blob);
      setMergeResultStats({
        count: mergeFiles.length,
        pages: mergePages.length,
        size: blob.size,
      });

      toast.success(
        `Successfully merged ${mergeFiles.length} files (${mergePages.length} total pages)!`
      );
    } catch (err: any) {
      console.error('Merge error:', err);
      toast.error('Failed to merge files. One of the documents or images could not be processed.');
    } finally {
      setIsMerging(false);
    }
  };

  const handleDownloadMerged = () => {
    if (!mergeResultBlob) return;
    const url = URL.createObjectURL(mergeResultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'merged_compixor.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Download started!');
  };

  // -------------------------------------------------------------
  // FEATURE 2: SPLITTER LOGIC & VALIDATION
  // -------------------------------------------------------------
  const processSplitFile = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a valid PDF file.');
      return;
    }

    setSplitFile(file);
    setSplitError(null);
    setSplitResultBlob(null);
    setSplitResultStats(null);
    setIsLoadingThumbnails(true);
    setSplitThumbnails([]);
    setSplitPageCount(0);

    try {
      const buffer = await file.arrayBuffer();
      setSplitArrayBuffer(buffer);

      // Verify encryption with pdf-lib first
      try {
        const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        if ((doc as any).isEncrypted) {
          setSplitError('This file is encrypted and password-protected. Please decrypt it first.');
          setIsLoadingThumbnails(false);
          return;
        }
      } catch (err: any) {
        const msg = (err?.message || '').toLowerCase();
        if (msg.includes('encrypt') || msg.includes('password')) {
          setSplitError('This file is encrypted and password-protected.');
          setIsLoadingThumbnails(false);
          return;
        }
      }

      // Load with PDF.js for rendering
      const pdfjs = await getPdfJs();
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer.slice(0)) });
      const pdf = await loadingTask.promise;
      setSplitPdfDoc(pdf);
      const totalPages = pdf.numPages;
      setSplitPageCount(totalPages);

      // Default selection to all or page 1
      const initialPages = totalPages > 1 ? '1-2' : '1';
      setRangeInput(totalPages > 1 ? `1-${Math.min(totalPages, 3)}` : '1');

      // Progressive thumbnail generation
      const thumbs: SplitThumbnail[] = [];
      for (let i = 1; i <= totalPages; i++) {
        thumbs.push({
          pageNumber: i,
          thumbnailUrl: null,
          width: 140,
          height: 198,
        });
      }
      setSplitThumbnails(thumbs);

      // Render thumbnails asynchronously in background
      (async () => {
        for (let i = 1; i <= totalPages; i++) {
          try {
            const url = await renderPageThumbnail(pdf, i);
            setSplitThumbnails((prev) =>
              prev.map((t) => (t.pageNumber === i ? { ...t, thumbnailUrl: url } : t))
            );
          } catch {
            // Keep fallback
          }
        }
        setIsLoadingThumbnails(false);
      })();

      toast.success(`Loaded PDF with ${totalPages} page${totalPages > 1 ? 's' : ''}!`);
    } catch (err) {
      console.error('Split PDF load error:', err);
      setSplitError('Failed to load PDF. The file may be corrupted or unreadable.');
      setIsLoadingThumbnails(false);
    }
  }, []);

  const handleSplitDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    splitDragCounterRef.current = 0;
    setIsSplitDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSplitFile(e.dataTransfer.files[0]);
    }
  };

  // Global Window Drag & Drop Listeners (Drop Anywhere Overlay)
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer?.types && Array.from(e.dataTransfer.types).includes('Files')) {
        dragCounterRef.current += 1;
        setIsDraggingGlobal(true);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current -= 1;
      if (dragCounterRef.current <= 0) {
        dragCounterRef.current = 0;
        setIsDraggingGlobal(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDraggingGlobal(false);

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const fileList = Array.from(files);

      if (activeTab === 'merge') {
        const isPdfFile = (f: File) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
        const isImageFile = (f: File) =>
          f.type === 'image/jpeg' ||
          f.type === 'image/png' ||
          f.type === 'image/webp' ||
          /\.(jpe?g|png|webp)$/i.test(f.name);

        const validMergeFiles = fileList.filter((f) => isPdfFile(f) || isImageFile(f));

        if (validMergeFiles.length === 0) {
          toast.error('Only PDF, JPG, PNG, and WEBP files are supported.');
          return;
        }

        if (validMergeFiles.length < fileList.length) {
          toast.error('Only PDF, JPG, PNG, and WEBP files are supported.');
        }

        processNewMergeFiles(validMergeFiles);
      } else {
        const isPdfFile = (f: File) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
        const pdfFiles = fileList.filter(isPdfFile);
        if (pdfFiles.length === 0) {
          toast.error('Split mode only supports PDF documents');
          return;
        }
        processSplitFile(pdfFiles[0]);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [activeTab, processNewMergeFiles, processSplitFile]);

  // Strict Range Parser and Validator
  const validateAndParseRange = useCallback(
    (input: string, maxPages: number): RangeValidation => {
      if (!input || !input.trim()) {
        return {
          isValid: false,
          pages: [],
          error: 'Please enter at least one page or range (e.g. 1-3, 5).',
        };
      }

      if (maxPages <= 0) {
        return { isValid: false, pages: [] };
      }

      const rawSegments = input.split(',').map((s) => s.trim()).filter(Boolean);
      if (rawSegments.length === 0) {
        return { isValid: false, pages: [], error: 'Please enter valid page numbers.' };
      }

      const pageSet = new Set<number>();
      let warning: string | undefined;

      for (const segment of rawSegments) {
        // Check if it's a range "X-Y"
        if (segment.includes('-')) {
          const parts = segment.split('-').map((p) => p.trim());
          if (parts.length !== 2) {
            return {
              isValid: false,
              pages: [],
              error: `Invalid range format: "${segment}". Use "start-end" format like 1-4.`,
            };
          }

          const start = parseInt(parts[0], 10);
          const end = parseInt(parts[1], 10);

          if (isNaN(start) || isNaN(end)) {
            return {
              isValid: false,
              pages: [],
              error: `Non-numeric values in range "${segment}".`,
            };
          }

          if (start <= 0 || end <= 0) {
            return {
              isValid: false,
              pages: [],
              error: `Page numbers must be 1 or higher.`,
            };
          }

          if (start > end) {
            return {
              isValid: false,
              pages: [],
              error: `Reversed range "${segment}". Start page (${start}) cannot be greater than end page (${end}).`,
            };
          }

          if (start > maxPages || end > maxPages) {
            return {
              isValid: false,
              pages: [],
              error: `Page in range "${segment}" exceeds document limit of ${maxPages} pages.`,
            };
          }

          for (let p = start; p <= end; p++) {
            pageSet.add(p);
          }
        } else {
          // Single page
          const single = parseInt(segment, 10);
          if (isNaN(single)) {
            return {
              isValid: false,
              pages: [],
              error: `Invalid page number: "${segment}".`,
            };
          }

          if (single <= 0) {
            return {
              isValid: false,
              pages: [],
              error: `Page numbers must be 1 or higher.`,
            };
          }

          if (single > maxPages) {
            return {
              isValid: false,
              pages: [],
              error: `Page ${single} exceeds document limit of ${maxPages} pages.`,
            };
          }

          pageSet.add(single);
        }
      }

      const sortedPages = Array.from(pageSet).sort((a, b) => a - b);
      if (sortedPages.length === 0) {
        return {
          isValid: false,
          pages: [],
          error: 'No valid pages selected.',
        };
      }

      return {
        isValid: true,
        pages: sortedPages,
        warning,
      };
    },
    []
  );

  // Compute validation state in real-time
  const rangeValidation = useMemo(() => {
    return validateAndParseRange(rangeInput, splitPageCount);
  }, [rangeInput, splitPageCount, validateAndParseRange]);

  // Synchronize range validation with selected pages set
  useEffect(() => {
    if (rangeValidation.isValid) {
      setSelectedPagesSet(new Set(rangeValidation.pages));
    }
  }, [rangeValidation]);

  // Convert set of pages into compact range string (e.g. [1,2,3,5] -> "1-3, 5")
  const pagesSetToRangeString = (pages: number[]): string => {
    if (pages.length === 0) return '';
    const sorted = [...pages].sort((a, b) => a - b);
    const ranges: string[] = [];
    let start = sorted[0];
    let prev = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i];
      if (current === prev + 1) {
        prev = current;
      } else {
        ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
        start = current;
        prev = current;
      }
    }
    ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
    return ranges.join(', ');
  };

  // Toggle page thumbnail click
  const togglePageSelection = (pageNum: number) => {
    const nextSet = new Set(selectedPagesSet);
    if (nextSet.has(pageNum)) {
      nextSet.delete(pageNum);
    } else {
      nextSet.add(pageNum);
    }

    if (nextSet.size === 0) {
      setSelectedPagesSet(new Set());
      setRangeInput('');
    } else {
      setSelectedPagesSet(nextSet);
      setRangeInput(pagesSetToRangeString(Array.from(nextSet)));
    }
  };

  // Quick preset page selectors
  const selectAllPages = () => {
    if (splitPageCount <= 0) return;
    const all = Array.from({ length: splitPageCount }, (_, i) => i + 1);
    setSelectedPagesSet(new Set(all));
    setRangeInput(pagesSetToRangeString(all));
  };

  const deselectAllPages = () => {
    setSelectedPagesSet(new Set());
    setRangeInput('');
  };

  const selectOddPages = () => {
    if (splitPageCount <= 0) return;
    const odds = Array.from({ length: splitPageCount }, (_, i) => i + 1).filter((p) => p % 2 !== 0);
    setSelectedPagesSet(new Set(odds));
    setRangeInput(pagesSetToRangeString(odds));
  };

  const selectEvenPages = () => {
    if (splitPageCount <= 0) return;
    const evens = Array.from({ length: splitPageCount }, (_, i) => i + 1).filter((p) => p % 2 === 0);
    setSelectedPagesSet(new Set(evens));
    setRangeInput(pagesSetToRangeString(evens));
  };

  // Split Action
  const handleExecuteSplit = async () => {
    if (!splitFile || !splitArrayBuffer) {
      toast.error('Please upload a PDF to split.');
      return;
    }

    if (splitMode === 'range' && !rangeValidation.isValid) {
      toast.error(rangeValidation.error || 'Please enter a valid page range.');
      return;
    }

    setIsSplitting(true);
    setSplitProgress(10);
    setSplitStatus('Reading document structure...');

    try {
      const srcDoc = await PDFDocument.load(splitArrayBuffer, { ignoreEncryption: true });
      const totalPages = srcDoc.getPageCount();

      // MODE 1: Custom Range -> Single PDF
      if (splitMode === 'range') {
        const pagesToExtract = rangeValidation.pages;
        setSplitStatus(`Extracting ${pagesToExtract.length} pages into a single PDF...`);
        setSplitProgress(35);

        const newDoc = await PDFDocument.create();
        // pdf-lib page indices are 0-indexed
        const indices = pagesToExtract.map((p) => p - 1);
        const copiedPages = await newDoc.copyPages(srcDoc, indices);
        copiedPages.forEach((p) => newDoc.addPage(p));

        setSplitProgress(85);
        setSplitStatus('Compacting xref streams...');

        const pdfBytes = await newDoc.save({ useObjectStreams: true });
        const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
        const baseName = splitFile.name.replace(/\.pdf$/i, '');
        const filename = `${baseName}_extracted.pdf`;

        setSplitResultBlob(blob);
        setSplitResultFilename(filename);
        setSplitResultStats({
          pages: pagesToExtract.length,
          size: blob.size,
          isZip: false,
        });

        toast.success(`Extracted ${pagesToExtract.length} pages successfully!`);
      }

      // MODE 2: Split All Pages -> Zip of individual 1-page PDFs
      else if (splitMode === 'all-pages') {
        setSplitStatus(`Splitting into ${totalPages} single-page documents...`);
        const zip = new JSZip();
        const baseName = splitFile.name.replace(/\.pdf$/i, '');

        for (let i = 0; i < totalPages; i++) {
          const pageNum = i + 1;
          const pct = Math.round(15 + (i / totalPages) * 70);
          setSplitProgress(pct);
          setSplitStatus(`Generating single-page PDF ${pageNum} of ${totalPages}...`);

          const singlePageDoc = await PDFDocument.create();
          const [copiedPage] = await singlePageDoc.copyPages(srcDoc, [i]);
          singlePageDoc.addPage(copiedPage);

          const bytes = await singlePageDoc.save({ useObjectStreams: true });
          zip.file(`${baseName}_page_${pageNum}.pdf`, bytes);
        }

        setSplitProgress(90);
        setSplitStatus('Compressing ZIP archive...');

        const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
          setSplitProgress(Math.round(90 + metadata.percent * 0.1));
        });

        const filename = 'split_documents.zip';
        setSplitResultBlob(zipBlob);
        setSplitResultFilename(filename);
        setSplitResultStats({
          pages: totalPages,
          size: zipBlob.size,
          isZip: true,
        });

        toast.success(`Split all ${totalPages} pages into a ZIP archive!`);
      }

      // MODE 3: Extract Selected Pages as Individual PDFs -> Zip
      else if (splitMode === 'selected-individual') {
        const pagesToExtract = rangeValidation.pages;
        if (pagesToExtract.length === 0) {
          toast.error('No pages selected to extract.');
          setIsSplitting(false);
          return;
        }

        const baseName = splitFile.name.replace(/\.pdf$/i, '');

        // If only 1 page selected, just save directly as a single PDF
        if (pagesToExtract.length === 1) {
          const p = pagesToExtract[0];
          setSplitStatus(`Extracting page ${p}...`);
          const singleDoc = await PDFDocument.create();
          const [copied] = await singleDoc.copyPages(srcDoc, [p - 1]);
          singleDoc.addPage(copied);
          const bytes = await singleDoc.save({ useObjectStreams: true });
          const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
          const filename = `${baseName}_page_${p}.pdf`;

          setSplitResultBlob(blob);
          setSplitResultFilename(filename);
          setSplitResultStats({
            pages: 1,
            size: blob.size,
            isZip: false,
          });
          toast.success(`Extracted page ${p} successfully!`);
        } else {
          // Multiple individual pages -> Zip
          const zip = new JSZip();
          for (let i = 0; i < pagesToExtract.length; i++) {
            const pageNum = pagesToExtract[i];
            const pct = Math.round(15 + (i / pagesToExtract.length) * 70);
            setSplitProgress(pct);
            setSplitStatus(`Extracting page ${pageNum} (${i + 1}/${pagesToExtract.length})...`);

            const singleDoc = await PDFDocument.create();
            const [copied] = await singleDoc.copyPages(srcDoc, [pageNum - 1]);
            singleDoc.addPage(copied);
            const bytes = await singleDoc.save({ useObjectStreams: true });
            zip.file(`${baseName}_page_${pageNum}.pdf`, bytes);
          }

          setSplitProgress(90);
          setSplitStatus('Creating ZIP package...');
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          const filename = `${baseName}_selected_pages.zip`;

          setSplitResultBlob(zipBlob);
          setSplitResultFilename(filename);
          setSplitResultStats({
            pages: pagesToExtract.length,
            size: zipBlob.size,
            isZip: true,
          });

          toast.success(`Extracted ${pagesToExtract.length} pages as individual files into ZIP!`);
        }
      }

      setSplitProgress(100);
    } catch (err: any) {
      console.error('Split execution error:', err);
      toast.error('Failed to split PDF. File might be protected or corrupted.');
    } finally {
      setIsSplitting(false);
    }
  };

  const handleDownloadSplit = () => {
    if (!splitResultBlob) return;
    const url = URL.createObjectURL(splitResultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = splitResultFilename || 'split_document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Download started!');
  };

  const handleResetSplit = () => {
    setSplitFile(null);
    setSplitArrayBuffer(null);
    setSplitPdfDoc(null);
    setSplitThumbnails([]);
    setSplitPageCount(0);
    setSplitError(null);
    setSplitResultBlob(null);
    setSplitResultStats(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Full-Screen Drop Anywhere Overlay */}
      <AnimatePresence>
        {isDraggingGlobal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm border-4 border-dashed border-cyan-500/80 pointer-events-none p-6"
          >
            <div className="flex flex-col items-center justify-center text-center max-w-lg">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mb-6 shadow-glow-cyan animate-pulse">
                <Upload className="w-10 h-10 sm:w-12 sm:h-12 animate-bounce" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-white tracking-tight mb-2 drop-shadow-md">
                {activeTab === 'merge'
                  ? 'Drop your PDF, JPG, PNG, or WEBP files anywhere to add them'
                  : 'Drop your PDF file anywhere to split it'}
              </h2>
              <p className="text-sm sm:text-base text-cyan-200 font-medium">
                {activeTab === 'merge'
                  ? 'Add PDFs or images to your concatenation queue'
                  : 'Open document in the PDF page splitter'}
              </p>
              <div className="mt-4 px-3.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-xs font-semibold text-cyan-300">
                100% Client-Side • Zero Cloud Uploads
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20 mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span>Document Toolkit • 100% In-Browser Engine</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display text-zinc-900 dark:text-white mb-4 tracking-tight">
          Merge & Split PDFs.{' '}
          <span className="text-gradient block sm:inline">Zero Server Uploads.</span>
        </h1>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Combine multiple documents into one or extract exact page ranges seamlessly with zero cloud uploads
          and instantaneous client-side WebAssembly execution.
        </p>

        {/* Trust Badges Row */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mt-6">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-white/70 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/60 backdrop-blur-sm text-zinc-700 dark:text-zinc-300 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            100% Free
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-white/70 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/60 backdrop-blur-sm text-zinc-700 dark:text-zinc-300 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            Instant Processing
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-white/70 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/60 backdrop-blur-sm text-zinc-700 dark:text-zinc-300 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            Zero Data Leaks
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-white/70 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/60 backdrop-blur-sm text-zinc-700 dark:text-zinc-300 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            No Sign-Up Required
          </span>
        </div>
      </motion.div>

      {/* Mode Switcher Tabs */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1.5 rounded-2xl bg-zinc-100 dark:bg-surface-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm max-w-md w-full">
          <button
            onClick={() => setActiveTab('merge')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeTab === 'merge'
                ? 'bg-white dark:bg-surface-800 text-brand-600 dark:text-brand-300 shadow-md border border-brand-500/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Files className="w-4 h-4" />
            <span>Merge PDFs</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300 font-semibold">
              Multi-file
            </span>
          </button>
          <button
            onClick={() => setActiveTab('split')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeTab === 'split'
                ? 'bg-white dark:bg-surface-800 text-brand-600 dark:text-brand-300 shadow-md border border-brand-500/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>Split PDF</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 font-semibold">
              Thumbnails
            </span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: PDF MERGER                                              */}
      {/* ============================================================== */}
      {activeTab === 'merge' && (
        <motion.div
          key="merge-tab"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* Main Merger Card */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl relative overflow-hidden">
            {/* Top Card Badge & Stat */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20">
                  New Tool
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  100% Client-Side Privacy
                </span>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Merge Unlimited Files
              </span>
            </div>

            {/* Hidden Input for adding files */}
            <input
              ref={mergeFileInputRef}
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp,.pdf,.jpg,.jpeg,.png,.webp"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  processNewMergeFiles(Array.from(e.target.files));
                }
              }}
              className="hidden"
            />

            {/* If No Files: Drop Zone */}
            {mergeFiles.length === 0 && (
              <div
                className={`drop-zone p-10 md:p-14 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                  isMergeDragOver ? 'drag-over !border-brand-500 !bg-brand-500/10 ring-4 ring-brand-500/20 shadow-glow scale-[1.01]' : ''
                }`}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  mergeDragCounterRef.current += 1;
                  if (e.dataTransfer?.types && Array.from(e.dataTransfer.types).includes('Files')) {
                    setIsMergeDragOver(true);
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
                  setIsMergeDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  mergeDragCounterRef.current -= 1;
                  if (mergeDragCounterRef.current <= 0) {
                    mergeDragCounterRef.current = 0;
                    setIsMergeDragOver(false);
                  }
                }}
                onDrop={handleMergeDrop}
                onClick={() => mergeFileInputRef.current?.click()}
              >
                <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 mb-4 transition-transform group-hover:scale-110 pointer-events-none">
                  <Files className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1 pointer-events-none">
                  {isMergeDragOver ? 'Drop files to merge them now' : 'Drop PDF, JPG, PNG, or WEBP files here to merge.'}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 pointer-events-none">
                  {isMergeDragOver ? 'Release to add files to merge queue' : 'or click to select multiple documents & images from your computer'}
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 pointer-events-none">
                  <Lock className="w-3 h-3 text-emerald-500" />
                  Converts images to standard A4 pages & merges 100% locally
                </div>
              </div>
            )}

            {/* When Files Exist in Queue */}
            {mergeFiles.length > 0 && !mergeResultBlob && (
              <div className="space-y-6">
                {/* Header bar with total stats & action buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-100/80 dark:bg-surface-850 border border-zinc-200/80 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500 shrink-0">
                      <Files className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                        {mergeFiles.length} File{mergeFiles.length > 1 ? 's' : ''} in Concatenation Queue
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Total {totalMergePages} pages · Combined size {formatFileSize(totalMergeSize)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => mergeFileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-300 hover:bg-brand-500/20 border border-brand-500/20 transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add PDFs or Images
                    </button>
                    <button
                      onClick={clearMergeAll}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 transition"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Soft Warning if > 50MB */}
                {totalMergeSize > 50 * 1024 * 1024 && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                    <div>
                      <p className="font-bold">Large file volume detected ({formatFileSize(totalMergeSize)})</p>
                      <p className="opacity-90">
                        Because merging happens inside your browser's local sandbox memory, processing
                        documents over 50MB may take a few moments.
                      </p>
                    </div>
                  </div>
                )}

                {/* File Error Alert if any encrypted/corrupted */}
                {hasMergeEncryptedOrCorrupted && (
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-xs text-red-700 dark:text-red-300">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                    <div>
                      <p className="font-bold">Action required before merging</p>
                      <p className="opacity-90">
                        One or more files below are password-protected or corrupted. Please remove them or decrypt
                        them to proceed.
                      </p>
                    </div>
                  </div>
                )}

                {/* View Mode Switcher: Page Organizer Grid vs Files List */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
                  <div className="inline-flex p-1 rounded-xl bg-zinc-200/60 dark:bg-surface-800 border border-zinc-200 dark:border-zinc-700/60 text-xs font-semibold self-start">
                    <button
                      onClick={() => setMergeViewMode('pages')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                        mergeViewMode === 'pages'
                          ? 'bg-white dark:bg-surface-700 text-brand-600 dark:text-brand-300 shadow-xs font-bold'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Page Organizer ({mergePages.length} Pages)</span>
                    </button>
                    <button
                      onClick={() => setMergeViewMode('files')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                        mergeViewMode === 'files'
                          ? 'bg-white dark:bg-surface-700 text-brand-600 dark:text-brand-300 shadow-xs font-bold'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      <ListFilter className="w-3.5 h-3.5" />
                      <span>File Queue ({mergeFiles.length} Files)</span>
                    </button>
                  </div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {mergeViewMode === 'pages'
                      ? 'Reorder, rotate & delete individual pages'
                      : 'Adjust full document sequence'}
                  </span>
                </div>

                {/* VIEW 1: PAGE ORGANIZER GRID */}
                {mergeViewMode === 'pages' && (
                  <div className="space-y-3">
                    {mergePages.length === 0 ? (
                      <div className="p-8 text-center rounded-2xl bg-zinc-100/50 dark:bg-surface-800/50 border border-dashed border-zinc-300 dark:border-zinc-700 text-xs text-zinc-500">
                        No pages in merge queue. Upload documents or images above.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 max-h-[580px] overflow-y-auto p-1">
                        {mergePages.map((pageItem, index) => (
                          <div
                            key={pageItem.id}
                            className="group relative rounded-2xl bg-white dark:bg-surface-800 border border-zinc-200/80 dark:border-zinc-700/60 p-2.5 flex flex-col items-center shadow-xs hover:shadow-md hover:border-brand-500/40 transition-all"
                          >
                            {/* Top Card Header: Sequence Number & Rotation Badge */}
                            <div className="w-full flex items-center justify-between mb-2 px-1 text-[11px] font-bold">
                              <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                                #{index + 1}
                              </span>
                              {pageItem.rotation > 0 ? (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] flex items-center gap-1">
                                  <RotateCw className="w-2.5 h-2.5" />
                                  {pageItem.rotation}°
                                </span>
                              ) : (
                                <span className="text-[10px] text-zinc-400">0°</span>
                              )}
                            </div>

                            {/* Thumbnail Container */}
                            <div className="w-full aspect-[3/4] rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-center overflow-hidden relative shadow-inner mb-2">
                              {pageItem.thumbnailUrl ? (
                                <img
                                  src={pageItem.thumbnailUrl}
                                  alt={`Page ${index + 1}`}
                                  style={{
                                    transform: `rotate(${pageItem.rotation}deg)`,
                                    transition: 'transform 0.2s ease',
                                  }}
                                  className="w-full h-full object-contain p-1"
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center text-zinc-400 p-2 text-center">
                                  <FileText className="w-6 h-6 mb-1 opacity-50 text-brand-500" />
                                  <span className="text-[10px]">p.{pageItem.displayPageNumber}</span>
                                </div>
                              )}
                            </div>

                            {/* Source File & Page Snippet */}
                            <div className="w-full text-center px-1 mb-2">
                              <p
                                className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 truncate"
                                title={pageItem.fileName}
                              >
                                {pageItem.fileName}
                              </p>
                              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                                Page {pageItem.displayPageNumber}
                              </p>
                            </div>

                            {/* Action Buttons: Move Left, Rotate 90, Move Right, Delete */}
                            <div className="w-full grid grid-cols-4 gap-1 pt-1.5 border-t border-zinc-100 dark:border-zinc-700/60">
                              <button
                                onClick={() => moveMergePage(index, 'left')}
                                disabled={index === 0 || isMerging}
                                title="Move Left"
                                className="p-1 rounded-lg text-zinc-500 hover:text-brand-600 hover:bg-brand-500/10 disabled:opacity-30 disabled:hover:bg-transparent transition flex items-center justify-center"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => rotateMergePage(pageItem.id)}
                                disabled={isMerging}
                                title="Rotate 90° Clockwise"
                                className="p-1 rounded-lg text-zinc-500 hover:text-amber-600 hover:bg-amber-500/10 disabled:opacity-30 transition flex items-center justify-center"
                              >
                                <RotateCw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => moveMergePage(index, 'right')}
                                disabled={index === mergePages.length - 1 || isMerging}
                                title="Move Right"
                                className="p-1 rounded-lg text-zinc-500 hover:text-brand-600 hover:bg-brand-500/10 disabled:opacity-30 disabled:hover:bg-transparent transition flex items-center justify-center"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteMergePage(pageItem.id)}
                                disabled={isMerging}
                                title="Delete Page"
                                className="p-1 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-red-500/10 disabled:opacity-30 transition flex items-center justify-center"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* VIEW 2: FILES LIST QUEUE */}
                {mergeViewMode === 'files' && (
                  <div className="space-y-2.5">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider pl-1">
                      Drag or use arrows to adjust concatenation order:
                    </p>

                    <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                      {mergeFiles.map((item, index) => (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all ${
                            item.isEncrypted || item.isCorrupted
                              ? 'bg-red-500/5 border-red-500/30'
                              : 'bg-white/70 dark:bg-surface-800/70 border-zinc-200/80 dark:border-zinc-700/60 shadow-xs hover:border-brand-500/40'
                          }`}
                        >
                          {/* Left: Thumbnail & Details */}
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Order index pill */}
                            <span className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-bold flex items-center justify-center shrink-0">
                              {index + 1}
                            </span>

                            {/* Page 1 Thumbnail or Fallback Icon */}
                            <div className="w-12 h-16 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center shrink-0 shadow-xs relative">
                              {item.thumbnailUrl ? (
                                <img
                                  src={item.thumbnailUrl}
                                  alt={`Preview of ${item.name}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : item.fileType === 'image' ? (
                                <ImageIcon className="w-6 h-6 text-cyan-500/60" />
                              ) : (
                                <FileText className="w-6 h-6 text-brand-500/60" />
                              )}
                              {item.isEncrypted && (
                                <div className="absolute inset-0 bg-red-950/70 flex items-center justify-center">
                                  <Lock className="w-4 h-4 text-red-300" />
                                </div>
                              )}
                            </div>

                            {/* File info */}
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-zinc-900 dark:text-white truncate max-w-xs sm:max-w-md">
                                {item.name}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                {item.fileType === 'image' ? (
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                                    <ImageIcon className="w-2.5 h-2.5" />
                                    {item.file.type.includes('webp') || item.name.toLowerCase().endsWith('.webp')
                                      ? 'WEBP'
                                      : item.file.type.includes('png') || item.name.toLowerCase().endsWith('.png')
                                      ? 'PNG'
                                      : 'JPG'}
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20 flex items-center gap-1">
                                    <FileText className="w-2.5 h-2.5" />
                                    PDF
                                  </span>
                                )}
                                <span>{formatFileSize(item.size)}</span>
                                <span>•</span>
                                <span>
                                  {item.isEncrypted ? 'Password Locked' : `${item.pageCount} page${item.pageCount !== 1 ? 's' : ''}`}
                                </span>
                              </div>

                              {item.errorMessage && (
                                <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {item.errorMessage}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right: Order controls & Remove button */}
                          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                            <button
                              onClick={() => moveMergeItem(index, 'up')}
                              disabled={index === 0 || isMerging}
                              title="Move file up in merge order"
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition"
                            >
                              <MoveUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => moveMergeItem(index, 'down')}
                              disabled={index === mergeFiles.length - 1 || isMerging}
                              title="Move file down in merge order"
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition"
                            >
                              <MoveDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeMergeItem(item.id)}
                              disabled={isMerging}
                              title="Remove file"
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress bar during merge */}
                {isMerging && (
                  <div className="space-y-2 p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20">
                    <div className="flex justify-between text-xs font-semibold text-brand-600 dark:text-brand-300">
                      <span>{mergeStatus}</span>
                      <span>{mergeProgress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-brand-500/20 overflow-hidden">
                      <div
                        className="h-full bg-brand-500 transition-all duration-200"
                        style={{ width: `${mergeProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Merge Action CTA */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleExecuteMerge}
                    disabled={isMerging || hasMergeEncryptedOrCorrupted || mergeFiles.length < 2}
                    className="btn-primary w-full py-4 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/25"
                  >
                    {isMerging ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Merging Documents & Images...</span>
                      </>
                    ) : (
                      <>
                        <Files className="w-5 h-5" />
                        <span>Merge {mergeFiles.length} Files Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Merge Result State */}
            {mergeResultBlob && mergeResultStats && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center mb-3 shadow-inner">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black font-display text-zinc-900 dark:text-white mb-1">
                    Documents Successfully Merged!
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Your new combined document is ready for instant download. Zero server uploads occurred.
                  </p>
                </div>

                {/* Stats Summary Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-surface-850 text-center border border-zinc-200 dark:border-zinc-800">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold mb-1">Files Combined</p>
                    <p className="text-xl font-bold text-zinc-900 dark:text-white">{mergeResultStats.count}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-brand-500/10 text-center border border-brand-500/20">
                    <p className="text-xs text-brand-600 dark:text-brand-300 font-semibold mb-1">Total Pages</p>
                    <p className="text-xl font-bold text-brand-600 dark:text-brand-300">{mergeResultStats.pages}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-500/10 text-center border border-emerald-500/20">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1">Final File Size</p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formatFileSize(mergeResultStats.size)}
                    </p>
                  </div>
                </div>

                {/* Download Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleDownloadMerged}
                    className="btn-primary flex-1 py-4 text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download merged_compixor.pdf</span>
                  </button>
                  <button
                    onClick={clearMergeAll}
                    className="btn-secondary py-4 px-6 text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Merge More Files</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: PDF SPLITTER                                            */}
      {/* ============================================================== */}
      {activeTab === 'split' && (
        <motion.div
          key="split-tab"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* Main Splitter Card */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl relative overflow-hidden">
            {/* Top Card Badge & Stat */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/20">
                  Precision Split
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Page Preview & Range Parser
                </span>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Split in Seconds
              </span>
            </div>

            {/* Hidden Input for Split PDF */}
            <input
              ref={splitFileInputRef}
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  processSplitFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            {/* If No PDF Uploaded Yet */}
            {!splitFile && (
              <div
                className={`drop-zone p-10 md:p-14 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                  isSplitDragOver ? 'drag-over !border-cyan-500 !bg-cyan-500/10 ring-4 ring-cyan-500/20 shadow-glow scale-[1.01]' : ''
                }`}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  splitDragCounterRef.current += 1;
                  if (e.dataTransfer?.types && Array.from(e.dataTransfer.types).includes('Files')) {
                    setIsSplitDragOver(true);
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
                  setIsSplitDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  splitDragCounterRef.current -= 1;
                  if (splitDragCounterRef.current <= 0) {
                    splitDragCounterRef.current = 0;
                    setIsSplitDragOver(false);
                  }
                }}
                onDrop={handleSplitDrop}
                onClick={() => splitFileInputRef.current?.click()}
              >
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 mb-4 transition-transform group-hover:scale-110 pointer-events-none">
                  <Scissors className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1 pointer-events-none">
                  {isSplitDragOver ? 'Drop PDF to split now' : 'Drop your PDF here to extract or split'}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 pointer-events-none">
                  {isSplitDragOver ? 'Release file to open page splitter' : 'or click to browse a PDF document from your device'}
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 pointer-events-none">
                  <Lock className="w-3 h-3 text-emerald-500" />
                  Client-side thumbnail rendering & range extraction
                </div>
              </div>
            )}

            {/* If Document Loaded and Not in Result State */}
            {splitFile && !splitResultBlob && (
              <div className="space-y-6">
                {/* File Details Banner */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-100/80 dark:bg-surface-850 border border-zinc-200/80 dark:border-zinc-800">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                        {splitFile.name}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {formatFileSize(splitFile.size)} • {splitPageCount} page{splitPageCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleResetSplit}
                    disabled={isSplitting}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition"
                  >
                    Change PDF
                  </button>
                </div>

                {/* Error Banner if any */}
                {splitError && (
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-xs text-red-700 dark:text-red-300">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                    <div>
                      <p className="font-bold">Cannot process this PDF</p>
                      <p className="opacity-90">{splitError}</p>
                    </div>
                  </div>
                )}

                {!splitError && (
                  <>
                    {/* Split Modes Selector */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => setSplitMode('range')}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          splitMode === 'range'
                            ? 'bg-brand-500/10 border-brand-500/40 text-brand-600 dark:text-brand-300 shadow-sm'
                            : 'bg-zinc-50 dark:bg-surface-850 border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-brand-500/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold uppercase tracking-wider">Mode 1</span>
                          <FileText className="w-4 h-4 text-brand-500" />
                        </div>
                        <h4 className="font-bold text-sm mb-1">Custom Range</h4>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                          Extract selected pages into a single combined PDF document.
                        </p>
                      </button>

                      <button
                        onClick={() => setSplitMode('all-pages')}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          splitMode === 'all-pages'
                            ? 'bg-brand-500/10 border-brand-500/40 text-brand-600 dark:text-brand-300 shadow-sm'
                            : 'bg-zinc-50 dark:bg-surface-850 border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-brand-500/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold uppercase tracking-wider">Mode 2</span>
                          <Archive className="w-4 h-4 text-brand-500" />
                        </div>
                        <h4 className="font-bold text-sm mb-1">Split All Pages</h4>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                          Split every page into a standalone PDF, bundled into a ZIP file.
                        </p>
                      </button>

                      <button
                        onClick={() => setSplitMode('selected-individual')}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          splitMode === 'selected-individual'
                            ? 'bg-brand-500/10 border-brand-500/40 text-brand-600 dark:text-brand-300 shadow-sm'
                            : 'bg-zinc-50 dark:bg-surface-850 border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-brand-500/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold uppercase tracking-wider">Mode 3</span>
                          <Layers className="w-4 h-4 text-brand-500" />
                        </div>
                        <h4 className="font-bold text-sm mb-1">Selected Pages to ZIP</h4>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                          Export each selected page as an individual PDF inside a ZIP.
                        </p>
                      </button>
                    </div>

                    {/* Range Input Field (Shown for Range & Selected modes) */}
                    {splitMode !== 'all-pages' && (
                      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-surface-850 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                            Pages to Extract (e.g. 1-3, 5, 8-10):
                          </label>

                          {/* Quick selection pills */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={selectAllPages}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-zinc-200 dark:bg-zinc-800 hover:bg-brand-500/20 hover:text-brand-600 dark:hover:text-brand-300 transition"
                            >
                              All
                            </button>
                            <button
                              type="button"
                              onClick={selectOddPages}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-zinc-200 dark:bg-zinc-800 hover:bg-brand-500/20 hover:text-brand-600 dark:hover:text-brand-300 transition"
                            >
                              Odds
                            </button>
                            <button
                              type="button"
                              onClick={selectEvenPages}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-zinc-200 dark:bg-zinc-800 hover:bg-brand-500/20 hover:text-brand-600 dark:hover:text-brand-300 transition"
                            >
                              Evens
                            </button>
                            <button
                              type="button"
                              onClick={deselectAllPages}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-zinc-200 dark:bg-zinc-800 hover:bg-red-500/20 hover:text-red-500 transition"
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        <input
                          type="text"
                          value={rangeInput}
                          onChange={(e) => setRangeInput(e.target.value)}
                          placeholder="e.g. 1-3, 5, 8-10"
                          className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-800 border text-sm font-mono transition-all outline-none ${
                            rangeValidation.isValid
                              ? 'border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20'
                              : 'border-red-500/60 focus:ring-2 focus:ring-red-500/20'
                          }`}
                        />

                        {/* Inline validation message */}
                        {rangeValidation.isValid ? (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              {rangeValidation.pages.length} page{rangeValidation.pages.length !== 1 ? 's' : ''} selected: [
                              {rangeValidation.pages.join(', ')}]
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-red-500 font-semibold">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{rangeValidation.error}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Interactive Thumbnail Grid */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          Interactive Page Grid (Click thumbnail to toggle):
                        </p>
                        {isLoadingThumbnails && (
                          <span className="text-xs text-brand-500 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> Rendering page previews...
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-[420px] overflow-y-auto p-2 rounded-2xl bg-zinc-50/50 dark:bg-surface-850/50 border border-zinc-200/60 dark:border-zinc-800/60">
                        {splitThumbnails.map((thumb) => {
                          const isSelected = selectedPagesSet.has(thumb.pageNumber);
                          return (
                            <button
                              key={thumb.pageNumber}
                              type="button"
                              onClick={() => togglePageSelection(thumb.pageNumber)}
                              className={`group relative rounded-xl border-2 overflow-hidden flex flex-col items-center transition-all ${
                                isSelected
                                  ? 'border-brand-500 ring-2 ring-brand-500/30 shadow-md scale-[1.02] bg-brand-500/5'
                                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 bg-white dark:bg-surface-800'
                              }`}
                            >
                              {/* Selection Checkmark */}
                              <div
                                className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-transform ${
                                  isSelected
                                    ? 'bg-brand-500 text-white scale-100'
                                    : 'bg-black/40 text-white/50 scale-90 opacity-0 group-hover:opacity-100'
                                }`}
                              >
                                <Check className="w-3 h-3" />
                              </div>

                              {/* Thumbnail preview */}
                              <div className="w-full aspect-[1/1.414] flex items-center justify-center overflow-hidden bg-zinc-100 dark:bg-zinc-900/60">
                                {thumb.thumbnailUrl ? (
                                  <img
                                    src={thumb.thumbnailUrl}
                                    alt={`Page ${thumb.pageNumber}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="flex flex-col items-center gap-1 text-zinc-400">
                                    <FileText className="w-6 h-6 animate-pulse" />
                                  </div>
                                )}
                              </div>

                              {/* Page counter label */}
                              <div className="w-full py-1.5 px-1 text-center border-t border-zinc-200/60 dark:border-zinc-700/60 bg-white/90 dark:bg-surface-800/90 text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                                Page {thumb.pageNumber}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Progress Bar during split */}
                    {isSplitting && (
                      <div className="space-y-2 p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20">
                        <div className="flex justify-between text-xs font-semibold text-brand-600 dark:text-brand-300">
                          <span>{splitStatus}</span>
                          <span>{splitProgress}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-brand-500/20 overflow-hidden">
                          <div
                            className="h-full bg-brand-500 transition-all duration-200"
                            style={{ width: `${splitProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Split Action Button */}
                    <div className="pt-2">
                      <button
                        onClick={handleExecuteSplit}
                        disabled={
                          isSplitting ||
                          (splitMode !== 'all-pages' && !rangeValidation.isValid)
                        }
                        className="btn-primary w-full py-4 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/25"
                      >
                        {isSplitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Processing PDF...</span>
                          </>
                        ) : (
                          <>
                            <Scissors className="w-5 h-5" />
                            <span>
                              {splitMode === 'range' &&
                                `Extract ${rangeValidation.pages.length} Pages into Single PDF`}
                              {splitMode === 'all-pages' &&
                                `Split All ${splitPageCount} Pages into ZIP Archive`}
                              {splitMode === 'selected-individual' &&
                                `Export ${rangeValidation.pages.length} Individual Pages`}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Split Result State */}
            {splitResultBlob && splitResultStats && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center mb-3 shadow-inner">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black font-display text-zinc-900 dark:text-white mb-1">
                    {splitResultStats.isZip ? 'ZIP Archive Generated!' : 'Pages Successfully Extracted!'}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Ready for immediate client-side download. No files ever left your computer.
                  </p>
                </div>

                {/* Stats Summary Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-surface-850 text-center border border-zinc-200 dark:border-zinc-800">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold mb-1">Output Format</p>
                    <p className="text-lg font-bold text-zinc-900 dark:text-white uppercase">
                      {splitResultStats.isZip ? 'ZIP Archive' : 'PDF Document'}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-brand-500/10 text-center border border-brand-500/20">
                    <p className="text-xs text-brand-600 dark:text-brand-300 font-semibold mb-1">Pages Extracted</p>
                    <p className="text-xl font-bold text-brand-600 dark:text-brand-300">{splitResultStats.pages}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-500/10 text-center border border-emerald-500/20">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1">Archive Size</p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formatFileSize(splitResultStats.size)}
                    </p>
                  </div>
                </div>

                {/* Download Action */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleDownloadSplit}
                    className="btn-primary flex-1 py-4 text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download {splitResultFilename}</span>
                  </button>
                  <button
                    onClick={handleResetSplit}
                    className="btn-secondary py-4 px-6 text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Split Another Document</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* ============================================================== */}
      {/* FEATURE GRID: "Engineered with Zero Compromise"                 */}
      {/* ============================================================== */}
      <section className="mt-16 pt-10 border-t border-zinc-200/80 dark:border-zinc-800/80">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black font-display text-zinc-900 dark:text-white mb-2">
            Engineered with Zero Compromise
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            How Compixor.Ai redefines privacy and performance for modern document workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="glass-card p-6 text-center rounded-2xl hover:border-brand-500/30 transition">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1.5">100% Client-Side</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Files are merged and sliced inside browser RAM — zero bytes ever uploaded to remote servers.
            </p>
          </div>

          <div className="glass-card p-6 text-center rounded-2xl hover:border-cyan-500/30 transition">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 mx-auto mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1.5">Instant Execution</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              No cloud queue bottlenecks or upload lag. Transformations complete locally in milliseconds.
            </p>
          </div>

          <div className="glass-card p-6 text-center rounded-2xl hover:border-emerald-500/30 transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1.5">Privacy Guaranteed</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Zero telemetry on document content. What happens on your device stays strictly on your device.
            </p>
          </div>

          <div className="glass-card p-6 text-center rounded-2xl hover:border-indigo-500/30 transition">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mx-auto mb-4">
              <MonitorSmartphone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1.5">Cross-Platform</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Runs seamlessly on desktop Chrome, Edge, Safari, Firefox, as well as iOS Safari and Android.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* FAQ SECTION                                                    */}
      {/* ============================================================== */}
      <section className="mt-16 pt-10 border-t border-zinc-200/80 dark:border-zinc-800/80">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold font-display text-zinc-900 dark:text-white mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Answers to common questions about client-side PDF merging and splitting
          </p>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {toolFaqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="glass-card rounded-2xl overflow-hidden transition">
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

      {/* Related Tools */}
      <RelatedPdfTools currentTool="organizer" />
    </div>
  );
}
