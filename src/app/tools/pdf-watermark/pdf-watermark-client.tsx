'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  RotateCcw,
  Eye,
  Loader2,
  Image as ImageIcon,
  Type,
  Layers,
  Grid,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Eraser,
  Sliders,
  ShieldCheck,
  Zap,
  Lock,
  Info,
  ChevronLeft,
  ChevronRight,
  MousePointer,
  Crop,
  Copy,
  Check,
  Stamp,
  MonitorSmartphone,
} from 'lucide-react';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import RelatedPdfTools from '@/components/RelatedPdfTools';
import {
  TextWatermarkOptions,
  ImageWatermarkOptions,
  WatermarkFontFamily,
  WatermarkFontStyle,
  WatermarkLayout,
  WatermarkLayer,
  WatermarkPageRangeType,
  RenderQuality,
  RedactionBox,
  addTextWatermark,
  addImageWatermark,
  removeCompixorWatermarks,
  stripDigitalWatermarks,
  removeGenericTextWatermark,
  redactAreaOnPage,
  canvasCoordsToPdf,
  calculateTextPositions,
  calculateImagePositions,
} from '@/utils/pdfWatermarkEngine';

// PDF.js dynamic loader
async function getPdfJs() {
  const pdfjs = await import('pdfjs-dist');
  if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }
  return pdfjs;
}

// Helper to format file sizes
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

const STORAGE_KEY = 'compixor_watermark_settings_v1';

// Default persisted settings
interface SavedSettings {
  watermarkType: 'text' | 'image';
  text: string;
  fontFamily: WatermarkFontFamily;
  fontStyle: WatermarkFontStyle;
  fontSize: number;
  color: string;
  opacity: number;
  rotation: number;
  layer: WatermarkLayer;
  layout: WatermarkLayout;
  pageRange: WatermarkPageRangeType;
  customPages: string;
  renderScale: number;
  quality: RenderQuality;
  imageScale: number;
  imageOpacity: number;
  imageRotation: number;
}

const DEFAULT_SETTINGS: SavedSettings = {
  watermarkType: 'text',
  text: 'CONFIDENTIAL',
  fontFamily: 'Helvetica',
  fontStyle: 'bold',
  fontSize: 48,
  color: '#4f46e5',
  opacity: 25,
  rotation: -45,
  layer: 'foreground',
  layout: 'center-single',
  pageRange: 'all',
  customPages: '1-3',
  renderScale: 1.0,
  quality: 'good',
  imageScale: 50,
  imageOpacity: 30,
  imageRotation: 0,
};

const COLOR_PRESETS = [
  { name: 'Brand Violet', hex: '#7c3aed' },
  { name: 'Royal Indigo', hex: '#4f46e5' },
  { name: 'Cyber Cyan', hex: '#06b6d4' },
  { name: 'Emerald Green', hex: '#10b981' },
  { name: 'Amber Gold', hex: '#f59e0b' },
  { name: 'Rose Crimson', hex: '#e11d48' },
  { name: 'Slate Gray', hex: '#475569' },
  { name: 'Carbon Black', hex: '#0f172a' },
  { name: 'Pure White', hex: '#ffffff' },
];

const FAQS = [
  {
    q: 'Does this tool upload my documents to any server?',
    a: 'No. Compixor runs 100% locally inside your web browser using WebAssembly and client-side JavaScript. Your files and watermarks never leave your computer or touch an external server.',
  },
  {
    q: 'Will adding a watermark flatten or rasterize my PDF text?',
    a: 'No! Unlike tools that convert entire pages into low-resolution JPEG images, Compixor injects native vector text layers and XObjects directly into the PDF content stream. The underlying text remains 100% crisp, vector-sharp, and selectable.',
  },
  {
    q: 'How does lossless watermark removal work?',
    a: 'Watermarks created with Compixor are tagged with structured marked content (/Artifact /CompixorWatermark). When removing, our engine strips the dedicated watermark stream while leaving every original page content stream 100% byte-identical.',
  },
  {
    q: 'Can I remove watermarks from PDFs created by other software?',
    a: 'Yes. You can use our "Targeted Text Matcher" to strip matching text operators from the PDF stream, or the "Interactive Erase Box" tool to vector-redact watermark blocks. For scanned/flattened pages where the watermark is baked into image pixels, automatic stream removal is not possible, so a redaction patch or OCR fallback should be used.',
  },
  {
    q: 'Are my watermark settings saved between browser sessions?',
    a: 'Yes. Your selected text, font, color, opacity, rotation, scale, and layout preferences are automatically saved in your browser’s localStorage.',
  },
];

export default function PdfWatermarkClient({
  initialMode = 'add',
}: {
  initialMode?: 'add' | 'remove';
}) {
  // Mode: Add Watermark vs Remove Watermark
  const [activeMode, setActiveMode] = useState<'add' | 'remove'>(initialMode);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // PDF Document State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [originalBytes, setOriginalBytes] = useState<Uint8Array | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pdfDocProxy, setPdfDocProxy] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [zoomMode, setZoomMode] = useState<string>('fit-page');
  const [pageDimensions, setPageDimensions] = useState<{
    width: number;
    height: number;
    isLandscape: boolean;
  } | null>(null);

  // Persisted Settings
  const [settings, setSettings] = useState<SavedSettings>(DEFAULT_SETTINGS);

  // Image watermark state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBytes, setImageBytes] = useState<Uint8Array | null>(null);
  const [imageFormat, setImageFormat] = useState<'png' | 'jpeg'>('png');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Generic Removal State
  const [searchString, setSearchString] = useState<string>('');
  const [manualToolMode, setManualToolMode] = useState<'pointer' | 'draw-box'>('pointer');
  const [selectionBox, setSelectionBox] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [redactionColor, setRedactionColor] = useState<string>('#ffffff');

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadDragOver, setIsUploadDragOver] = useState<boolean>(false);
  const uploadDragCounterRef = useRef<number>(0);

  // Global window drag and drop state
  const [isDraggingGlobal, setIsDraggingGlobal] = useState<boolean>(false);
  const dragCounterRef = useRef<number>(0);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.warn('Failed to load watermark settings from localStorage:', e);
    }
  }, []);

  // Save settings to localStorage
  const updateSettings = useCallback((updates: Partial<SavedSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to persist settings:', e);
      }
      return next;
    });
  }, []);

  // Handle PDF file upload
  const handlePdfUpload = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a valid PDF document.');
      return;
    }

    try {
      setIsProcessing(true);
      setStatusMessage('Parsing PDF structure in browser...');
      const buffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(buffer);

      const pdfjs = await getPdfJs();
      const loadingTask = pdfjs.getDocument({ data: uint8.slice(0) });
      const doc = await loadingTask.promise;

      setPdfFile(file);
      setPdfBytes(uint8);
      setOriginalBytes(uint8);
      setPageCount(doc.numPages);
      setCurrentPage(1);
      setPdfDocProxy(doc);
      setSelectionBox(null);

      toast.success(`Loaded "${file.name}" (${doc.numPages} pages)`);
    } catch (err: any) {
      console.error('Error loading PDF:', err);
      toast.error(err.message || 'Failed to open PDF document.');
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  }, []);

  // Window-level drag-and-drop listener (Intercepts browser default tab-opening behaviour)
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

      const file = files[0];
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) {
        toast.error('Only PDF documents (.pdf) are supported.');
        return;
      }

      handlePdfUpload(file);
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
  }, [handlePdfUpload]);

  // Handle Image Watermark file upload
  const handleImageUpload = async (file: File) => {
    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
    const isJpg =
      file.type === 'image/jpeg' ||
      file.name.toLowerCase().endsWith('.jpg') ||
      file.name.toLowerCase().endsWith('.jpeg');
    const isWebp = file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp');

    if (!isPng && !isJpg && !isWebp) {
      toast.error('Please upload a PNG, JPEG, or WEBP image.');
      return;
    }

    try {
      let format: 'png' | 'jpeg' = isPng ? 'png' : 'jpeg';
      let bytes: Uint8Array;

      if (isWebp) {
        // Convert WEBP to PNG bytes via canvas to ensure pdf-lib compatibility
        const bitmap = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(bitmap, 0, 0);
          const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
          if (blob) {
            bytes = new Uint8Array(await blob.arrayBuffer());
            format = 'png';
          } else {
            bytes = new Uint8Array(await file.arrayBuffer());
          }
        } else {
          bytes = new Uint8Array(await file.arrayBuffer());
        }
      } else {
        bytes = new Uint8Array(await file.arrayBuffer());
      }

      setImageFile(file);
      setImageBytes(bytes);
      setImageFormat(format);
      setImagePreviewUrl(URL.createObjectURL(file));
      toast.success(`Image watermark loaded: ${file.name}`);
    } catch (err: any) {
      toast.error('Failed to load watermark image: ' + err.message);
    }
  };

  // Render the current page onto canvas with live watermark overlay
  const renderCanvasPreview = useCallback(async () => {
    if (!pdfDocProxy || !canvasRef.current || currentPage < 1) return;

    try {
      const page = await pdfDocProxy.getPage(currentPage);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const baseViewport = page.getViewport({ scale: 1 });
      const isLandscape = baseViewport.width > baseViewport.height;
      setPageDimensions({
        width: Math.round(baseViewport.width),
        height: Math.round(baseViewport.height),
        isLandscape,
      });

      // Map Quality setting to DPI multiplier for razor-sharp rendering
      const dpiMultiplier =
        settings.quality === 'best' ? 2.0 : settings.quality === 'good' ? 1.5 : 1.0;
      const finalScale = dpiMultiplier;

      const viewport = page.getViewport({ scale: finalScale });

      // Match canvas internal resolution to viewport
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Render the base PDF page
      await page.render({ canvasContext: ctx, viewport }).promise;

      // If in "Add Watermark" mode, draw the real-time live preview watermark overlay
      if (activeMode === 'add') {
        const pdfWidth = viewport.width / finalScale;
        const pdfHeight = viewport.height / finalScale;

        ctx.save();
        ctx.scale(finalScale, finalScale);

        if (settings.watermarkType === 'text' && settings.text.trim()) {
          // Draw live text watermark overlay
          ctx.globalAlpha = Math.max(0.01, settings.opacity / 100);
          ctx.fillStyle = settings.color;

          let fontStyleStr = '';
          if (settings.fontStyle === 'bold') fontStyleStr = 'bold ';
          else if (settings.fontStyle === 'italic') fontStyleStr = 'italic ';
          else if (settings.fontStyle === 'bold-italic') fontStyleStr = 'bold italic ';

          let fontFamilyStr = '"Helvetica Neue", Helvetica, Arial, sans-serif';
          if (settings.fontFamily === 'TimesRoman') fontFamilyStr = '"Times New Roman", Times, Georgia, serif';
          if (settings.fontFamily === 'Courier') fontFamilyStr = '"Courier New", Courier, monospace';

          // Note: In canvas context with PDF scaling applied, 1px = 1 PDF point (1/72 inch)
          ctx.font = `${fontStyleStr}${settings.fontSize}px ${fontFamilyStr}`;
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'center';

          const textMetrics = ctx.measureText(settings.text);
          const textWidth = textMetrics.width;
          const textHeight = settings.fontSize * 0.9;

          const positions = calculateTextPositions(
            pdfWidth,
            pdfHeight,
            textWidth,
            textHeight,
            settings.layout,
            settings.rotation
          );

          const rad = (settings.rotation * Math.PI) / 180;

          for (const pos of positions) {
            ctx.save();
            // Note: Canvas origin is top-left, PDF origin is bottom-left
            // pos.y in PDF is from bottom, so canvasY = pdfHeight - pos.y - textHeight / 2
            const canvasX = pos.x + textWidth / 2;
            const canvasY = pdfHeight - pos.y - textHeight / 2;

            ctx.translate(canvasX, canvasY);
            ctx.rotate(-rad); // Invert rotation for canvas coordinates
            ctx.fillText(settings.text, 0, 0);
            ctx.restore();
          }
        } else if (settings.watermarkType === 'image' && imagePreviewUrl) {
          // Draw live image watermark overlay
          const img = new Image();
          img.src = imagePreviewUrl;
          await new Promise((res) => {
            if (img.complete) res(null);
            else img.onload = () => res(null);
          });

          const scaleRatio = Math.max(0.05, settings.imageScale / 100);
          const imgW = img.naturalWidth * scaleRatio;
          const imgH = img.naturalHeight * scaleRatio;

          ctx.globalAlpha = Math.max(0.01, settings.imageOpacity / 100);
          const positions = calculateImagePositions(
            pdfWidth,
            pdfHeight,
            imgW,
            imgH,
            settings.layout
          );

          const rad = (settings.imageRotation * Math.PI) / 180;

          for (const pos of positions) {
            ctx.save();
            const canvasX = pos.x + imgW / 2;
            const canvasY = pdfHeight - pos.y - imgH / 2;

            ctx.translate(canvasX, canvasY);
            ctx.rotate(-rad);
            ctx.drawImage(img, -imgW / 2, -imgH / 2, imgW, imgH);
            ctx.restore();
          }
        }

        ctx.restore();
      }

      // Draw manual selection box if active
      if (activeMode === 'remove' && selectionBox) {
        ctx.save();
        const minX = Math.min(selectionBox.startX, selectionBox.endX);
        const minY = Math.min(selectionBox.startY, selectionBox.endY);
        const boxW = Math.abs(selectionBox.endX - selectionBox.startX);
        const boxH = Math.abs(selectionBox.endY - selectionBox.startY);

        ctx.strokeStyle = '#7c3aed';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(minX, minY, boxW, boxH);

        ctx.fillStyle = 'rgba(124, 58, 237, 0.15)';
        ctx.fillRect(minX, minY, boxW, boxH);
        ctx.restore();
      }
    } catch (err) {
      console.warn('Canvas render update:', err);
    }
  }, [
    pdfDocProxy,
    currentPage,
    activeMode,
    settings,
    imagePreviewUrl,
    selectionBox,
  ]);

  // Compute CSS sizing for the preview canvas based on zoom mode
  const getCanvasStyle = (): React.CSSProperties => {
    if (zoomMode === 'fit-page') {
      return {
        maxWidth: '100%',
        maxHeight: '560px',
        width: 'auto',
        height: 'auto',
        objectFit: 'contain',
        display: 'block',
      };
    }
    if (zoomMode === 'fit-width') {
      return {
        width: '100%',
        height: 'auto',
        display: 'block',
      };
    }
    const zoomPct = parseFloat(zoomMode) || 100;
    const baseW = pageDimensions?.width || 595;
    return {
      width: `${Math.round((baseW * zoomPct) / 100)}px`,
      height: 'auto',
      display: 'block',
    };
  };

  const handleZoomIn = () => {
    const levels = ['50', '75', '100', '125', '150', '200'];
    if (zoomMode === 'fit-page' || zoomMode === 'fit-width') {
      setZoomMode('100');
    } else {
      const idx = levels.indexOf(zoomMode);
      if (idx !== -1 && idx < levels.length - 1) {
        setZoomMode(levels[idx + 1]);
      }
    }
  };

  const handleZoomOut = () => {
    const levels = ['50', '75', '100', '125', '150', '200'];
    if (zoomMode === 'fit-page' || zoomMode === 'fit-width') {
      setZoomMode('75');
    } else {
      const idx = levels.indexOf(zoomMode);
      if (idx !== -1 && idx > 0) {
        setZoomMode(levels[idx - 1]);
      }
    }
  };

  const handleToggleFit = () => {
    setZoomMode((prev) => (prev === 'fit-page' ? '100' : 'fit-page'));
  };

  // Re-render canvas when parameters change
  useEffect(() => {
    renderCanvasPreview();
  }, [renderCanvasPreview]);

  // Apply Text or Image Watermark
  const handleApplyWatermark = async () => {
    if (!originalBytes && !pdfBytes) {
      toast.error('Please upload a PDF first.');
      return;
    }

    try {
      setIsProcessing(true);
      setStatusMessage('Applying vector watermark into PDF stream...');

      const baseBytes = originalBytes || pdfBytes!;
      let newPdfBytes: Uint8Array;

      if (settings.watermarkType === 'text') {
        if (!settings.text.trim()) {
          toast.error('Please enter watermark text.');
          setIsProcessing(false);
          return;
        }

        const options: TextWatermarkOptions = {
          text: settings.text,
          fontFamily: settings.fontFamily,
          fontStyle: settings.fontStyle,
          fontSize: settings.fontSize,
          color: settings.color,
          opacity: settings.opacity,
          rotation: settings.rotation,
          layer: settings.layer,
          layout: settings.layout,
          pageRange: settings.pageRange,
          customPages: settings.customPages,
          currentPageIndex: currentPage - 1,
        };

        newPdfBytes = await addTextWatermark(baseBytes, options);
      } else {
        if (!imageBytes) {
          toast.error('Please upload a watermark image first.');
          setIsProcessing(false);
          return;
        }

        const options: ImageWatermarkOptions = {
          imageData: imageBytes,
          imageFormat,
          scale: settings.imageScale,
          opacity: settings.imageOpacity,
          rotation: settings.imageRotation,
          layer: settings.layer,
          layout: settings.layout,
          pageRange: settings.pageRange,
          customPages: settings.customPages,
          currentPageIndex: currentPage - 1,
        };

        newPdfBytes = await addImageWatermark(baseBytes, options);
      }

      setPdfBytes(newPdfBytes);
      toast.success('Watermark successfully applied to PDF! Ready to download.');
    } catch (err: any) {
      console.error('Error applying watermark:', err);
      toast.error('Failed to apply watermark: ' + err.message);
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  // Remove Watermarks (Engine A: Auto-Strip Digital Watermarks)
  const handleRemoveCompixorWatermarks = async () => {
    if (!pdfBytes) {
      toast.error('Please upload a PDF first.');
      return;
    }

    try {
      setIsProcessing(true);
      setStatusMessage('Engine A: Scanning annotations, /Artifacts & low-opacity watermark layers...');

      const { pdfBytes: cleaned, removedCount } = await stripDigitalWatermarks(pdfBytes);

      if (removedCount === 0) {
        toast.info(
          'No digital watermark layers or stamp annotations detected. If this is a flattened or scanned document, use Engine B: Erase Box below.'
        );
      } else {
        setPdfBytes(cleaned);
        const pdfjs = await getPdfJs();
        const loadingTask = pdfjs.getDocument({ data: cleaned.slice(0) });
        const updatedDoc = await loadingTask.promise;
        setPdfDocProxy(updatedDoc);
        toast.success(`Engine A: Successfully stripped ${removedCount} watermark layer(s)!`);
      }
    } catch (err: any) {
      console.error('Error removing watermark:', err);
      toast.error('Failed to remove watermark: ' + err.message);
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  // Remove Generic Watermark by Matching Search String
  const handleRemoveGenericText = async () => {
    if (!pdfBytes) return;
    if (!searchString.trim()) {
      toast.error('Please enter the watermark text to search and remove.');
      return;
    }

    try {
      setIsProcessing(true);
      setStatusMessage(`Scanning content streams for "${searchString}"...`);

      const { pdfBytes: cleaned, matchesRemoved } = await removeGenericTextWatermark(
        pdfBytes,
        searchString
      );

      if (matchesRemoved === 0) {
        toast.warning(
          `No vector text matching "${searchString}" found. The text might be encoded as an image or scanned bitmap.`
        );
      } else {
        setPdfBytes(cleaned);
        const pdfjs = await getPdfJs();
        const loadingTask = pdfjs.getDocument({ data: cleaned.slice(0) });
        const updatedDoc = await loadingTask.promise;
        setPdfDocProxy(updatedDoc);
        toast.success(`Removed ${matchesRemoved} matching text block(s)!`);
      }
    } catch (err: any) {
      toast.error('Failed to remove text: ' + err.message);
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  // Apply Area Redaction / Erase Box
  const handleApplyRedactionBox = async () => {
    if (!pdfBytes || !selectionBox || !canvasRef.current || !pdfDocProxy) {
      toast.error('Please draw an erase box on the preview canvas first.');
      return;
    }

    try {
      setIsProcessing(true);
      setStatusMessage('Applying vector redaction patch...');

      const page = await pdfDocProxy.getPage(currentPage);
      const canvas = canvasRef.current;
      const { width: pdfWidth, height: pdfHeight } = page.getViewport({ scale: 1 });

      const minX = Math.min(selectionBox.startX, selectionBox.endX);
      const minY = Math.min(selectionBox.startY, selectionBox.endY);
      const boxW = Math.abs(selectionBox.endX - selectionBox.startX);
      const boxH = Math.abs(selectionBox.endY - selectionBox.startY);

      // Convert canvas coordinates to PDF coordinates
      const pdfTopLeft = canvasCoordsToPdf(
        minX,
        minY,
        canvas.width,
        canvas.height,
        pdfWidth,
        pdfHeight
      );
      const pdfBottomRight = canvasCoordsToPdf(
        minX + boxW,
        minY + boxH,
        canvas.width,
        canvas.height,
        pdfWidth,
        pdfHeight
      );

      const box: RedactionBox = {
        x: pdfTopLeft.x,
        y: pdfBottomRight.y,
        width: Math.abs(pdfBottomRight.x - pdfTopLeft.x),
        height: Math.abs(pdfTopLeft.y - pdfBottomRight.y),
        color: redactionColor,
      };

      const cleaned = await redactAreaOnPage(pdfBytes, currentPage - 1, box);
      setPdfBytes(cleaned);

      const pdfjs = await getPdfJs();
      const loadingTask = pdfjs.getDocument({ data: cleaned.slice(0) });
      const updatedDoc = await loadingTask.promise;
      setPdfDocProxy(updatedDoc);
      setSelectionBox(null);
      setManualToolMode('pointer');

      toast.success('Selected watermark area erased successfully!');
    } catch (err: any) {
      toast.error('Failed to erase region: ' + err.message);
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  // Download Output PDF
  const handleDownload = async () => {
    if (!pdfFile || (!pdfBytes && !originalBytes)) {
      toast.error('No PDF available to download.');
      return;
    }

    try {
      setIsProcessing(true);
      setStatusMessage('Preparing your watermarked PDF for download...');

      let exportBytes = pdfBytes;

      // In Add mode, freshly generate with current settings from clean document
      if (activeMode === 'add') {
        const baseBytes = originalBytes || pdfBytes!;
        if (settings.watermarkType === 'text') {
          if (!settings.text.trim()) {
            toast.error('Please enter watermark text before downloading.');
            setIsProcessing(false);
            return;
          }
          const options: TextWatermarkOptions = {
            text: settings.text,
            fontFamily: settings.fontFamily,
            fontStyle: settings.fontStyle,
            fontSize: settings.fontSize,
            color: settings.color,
            opacity: settings.opacity,
            rotation: settings.rotation,
            layer: settings.layer,
            layout: settings.layout,
            pageRange: settings.pageRange,
            customPages: settings.customPages,
            currentPageIndex: currentPage - 1,
          };
          exportBytes = await addTextWatermark(baseBytes, options);
        } else if (imageBytes) {
          const options: ImageWatermarkOptions = {
            imageData: imageBytes,
            imageFormat,
            scale: settings.imageScale,
            opacity: settings.imageOpacity,
            rotation: settings.imageRotation,
            layer: settings.layer,
            layout: settings.layout,
            pageRange: settings.pageRange,
            customPages: settings.customPages,
            currentPageIndex: currentPage - 1,
          };
          exportBytes = await addImageWatermark(baseBytes, options);
        }
      }

      const baseName = pdfFile.name.replace(/\.pdf$/i, '');
      const suffix = activeMode === 'add' ? '_watermarked' : '_cleaned';
      const outputName = `${baseName}${suffix}.pdf`;

      const blob = new Blob([exportBytes as BlobPart], { type: 'application/pdf' });
      saveAs(blob, outputName);
      toast.success(`Saved "${outputName}"`);
    } catch (err: any) {
      console.error('Download error:', err);
      toast.error('Failed to export PDF: ' + err.message);
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  // Clear currently loaded document back to upload state
  const handleClearDocument = () => {
    setPdfFile(null);
    setPdfBytes(null);
    setOriginalBytes(null);
    setPdfDocProxy(null);
    setPageCount(0);
    setCurrentPage(1);
    setSelectionBox(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Reset to original PDF
  const handleReset = async () => {
    if (!originalBytes) return;
    setPdfBytes(originalBytes);
    setSelectionBox(null);

    const pdfjs = await getPdfJs();
    const loadingTask = pdfjs.getDocument({ data: originalBytes.slice(0) });
    const doc = await loadingTask.promise;
    setPdfDocProxy(doc);
    toast.info('Document reset to original state.');
  };

  // Canvas Mouse Events for Box Drawing
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (manualToolMode !== 'draw-box' || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setIsDrawing(true);
    setSelectionBox({ startX: x, startY: y, endX: x, endY: y });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || manualToolMode !== 'draw-box' || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setSelectionBox((prev) => (prev ? { ...prev, endX: x, endY: y } : null));
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
  };

  return (
    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Background ambient radial glow */}
      <div
        className="absolute top-12 left-1/2 -translate-x-1/2 -z-10 w-full max-w-4xl h-96 rounded-full opacity-25 dark:opacity-20 pointer-events-none blur-3xl"
        style={{
          background: 'radial-gradient(ellipse at center, #06b6d4 0%, #3b82f6 40%, transparent 70%)',
        }}
      />

      {/* Full-Screen Drop Anywhere Drag & Drop Overlay */}
      <AnimatePresence>
        {isDraggingGlobal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md border-4 border-dashed border-cyan-500/80 pointer-events-none p-6"
          >
            <div className="flex flex-col items-center justify-center text-center max-w-lg">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mb-6 shadow-glow-cyan animate-pulse">
                <Upload className="w-10 h-10 sm:w-12 sm:h-12 animate-bounce" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-white tracking-tight mb-2 drop-shadow-md">
                Drop your PDF file anywhere to upload
              </h2>
              <p className="text-sm sm:text-base text-cyan-200 font-medium">
                {activeMode === 'add'
                  ? 'Add custom stamps, text, or image watermarks instantly'
                  : 'Open document to clean and remove watermark layers'}
              </p>
              <div className="mt-4 px-3.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-xs font-semibold text-cyan-300">
                100% Client-Side • Zero Server Uploads
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
          <span>Document Security • 100% In-Browser Engine</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display text-zinc-900 dark:text-white mb-4 tracking-tight">
          Protect & Clean PDFs.{' '}
          <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 block sm:inline">
            Zero Server Uploads.
          </span>
        </h1>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Add custom stamps, logos, or remove watermarks seamlessly with zero cloud uploads and instantaneous client-side processing.
        </p>

        {/* 4 Feature Pills Row */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mt-6">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-white/70 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/60 backdrop-blur-sm text-zinc-700 dark:text-zinc-300 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ✓ 100% Free
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-white/70 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/60 backdrop-blur-sm text-zinc-700 dark:text-zinc-300 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ✓ Instant Processing
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-white/70 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/60 backdrop-blur-sm text-zinc-700 dark:text-zinc-300 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ✓ Zero Data Leaks
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-white/70 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/60 backdrop-blur-sm text-zinc-700 dark:text-zinc-300 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ✓ No Sign-Up Required
          </span>
        </div>
      </motion.div>

      {/* Interactive Floating Tab Switcher */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1.5 rounded-2xl bg-zinc-100 dark:bg-surface-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm max-w-md w-full">
          <button
            onClick={() => setActiveMode('add')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeMode === 'add'
                ? 'bg-white dark:bg-surface-800 text-brand-600 dark:text-brand-300 shadow-md border border-brand-500/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Stamp className="w-4 h-4" />
            <span>Add Watermark</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300 font-semibold">
              Stamp
            </span>
          </button>
          <button
            onClick={() => setActiveMode('remove')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeMode === 'remove'
                ? 'bg-white dark:bg-surface-800 text-brand-600 dark:text-brand-300 shadow-md border border-brand-500/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Eraser className="w-4 h-4" />
            <span>Remove Watermark</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 font-semibold">
              Cleaner
            </span>
          </button>
        </div>
      </div>

      {/* Hidden File Input always available across all views */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handlePdfUpload(e.target.files[0]);
            e.target.value = '';
          }
        }}
      />

      {/* Main Workspace */}
      {!pdfFile ? (
        /* Empty State: Upload Dropzone Card */
        <motion.div
          key="upload-view"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="glass-card p-6 sm:p-8 rounded-3xl relative overflow-hidden bg-white/70 dark:bg-[#0c1222]/90 border border-gray-200/80 dark:border-white/10 shadow-sm"
        >
          {/* Top Card Badge & Stat */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-200/60 dark:border-zinc-800/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20">
                {activeMode === 'add' ? 'Add Watermark' : 'Remove Watermark'}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                100% Client-Side Privacy
              </span>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {activeMode === 'add' ? 'Vector Text & Image Stamps' : 'Lossless Removal & Erase'}
            </span>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              uploadDragCounterRef.current += 1;
              if (e.dataTransfer?.types && Array.from(e.dataTransfer.types).includes('Files')) {
                setIsUploadDragOver(true);
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
              setIsUploadDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              uploadDragCounterRef.current -= 1;
              if (uploadDragCounterRef.current <= 0) {
                uploadDragCounterRef.current = 0;
                setIsUploadDragOver(false);
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              uploadDragCounterRef.current = 0;
              setIsUploadDragOver(false);
              if (e.dataTransfer.files?.[0]) handlePdfUpload(e.dataTransfer.files[0]);
            }}
            className={`drop-zone p-10 md:p-14 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 rounded-2xl ${
              isUploadDragOver
                ? 'drag-over !border-brand-500 !bg-brand-500/10 ring-4 ring-brand-500/20 shadow-glow scale-[1.01]'
                : ''
            }`}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center transition-transform group-hover:scale-110 pointer-events-none">
              {activeMode === 'add' ? <Stamp className="w-8 h-8" /> : <Eraser className="w-8 h-8" />}
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1 pointer-events-none">
              {isUploadDragOver
                ? 'Drop PDF to upload it now'
                : activeMode === 'add'
                ? 'Drop your PDF here to add watermark'
                : 'Drop your PDF here to remove watermark'}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 pointer-events-none">
              {isUploadDragOver ? 'Release to open document' : 'or click to browse a PDF document from your device'}
            </p>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 pointer-events-none">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              100% In-Browser Engine • Zero Cloud Uploads
            </div>
          </div>

          {/* Privacy Feature Callouts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60">
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#0c1222]/90 border border-gray-200/80 dark:border-white/10 flex items-start gap-3 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white">100% Private & Offline</h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  Zero server uploads. Your confidential files never leave browser RAM.
                </p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#0c1222]/90 border border-gray-200/80 dark:border-white/10 flex items-start gap-3 shadow-xs">
              <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white">Vector-Sharp Quality</h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  Preserves original vector text and tables without rasterization or blurry pixels.
                </p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#0c1222]/90 border border-gray-200/80 dark:border-white/10 flex items-start gap-3 shadow-xs">
              <Eraser className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white">Exact & Lossless</h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  Watermarks are stripped cleanly while leaving non-watermarked content byte-identical.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Editor Workspace: Active Document View */
        <motion.div
          key="editor-view"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="glass-card p-5 sm:p-7 rounded-3xl space-y-6 bg-white/70 dark:bg-[#0c1222]/90 border border-gray-200/80 dark:border-white/10 shadow-sm"
        >
          {/* Top Document Status & Action Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
                    {pdfFile.name}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                    {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {formatFileSize(pdfBytes?.byteLength || pdfFile.size)} • 100% Client-Side RAM
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 rounded-xl flex items-center gap-1.5 transition border border-brand-500/20 shadow-2xs"
                title="Upload a different PDF document"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Change PDF</span>
              </button>
              <button
                onClick={handleReset}
                className="px-3.5 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl flex items-center gap-1.5 transition border border-zinc-200 dark:border-zinc-700"
                title="Reset changes back to uploaded file"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
              <button
                onClick={handleClearDocument}
                className="p-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl flex items-center justify-center transition border border-rose-200 dark:border-rose-500/30"
                title="Remove file and return to upload dropzone"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:via-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-md shadow-brand-500/25 hover:shadow-brand-500/40 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* Editor Layout: Canvas Preview on Left, Settings on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Live Canvas Preview */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
              {/* Preview Controls Bar */}
              <div className="bg-white dark:bg-[#0c1222]/90 border border-gray-200/80 dark:border-white/10 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                {/* Pagination Controls & Quick Change */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of {pageCount}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
                    disabled={currentPage >= pageCount}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {pageDimensions && (
                    <span className="hidden sm:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                      {pageDimensions.isLandscape ? 'Landscape' : 'Portrait'} • {pageDimensions.width}×{pageDimensions.height} pt
                    </span>
                  )}

                  <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg border border-brand-500/20 bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
                    title="Change or upload a different PDF file"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Change PDF</span>
                  </button>
                </div>

                {/* Render Scale & Quality Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Tool Mode for Remove Watermark */}
                  {activeMode === 'remove' && (
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => setManualToolMode('pointer')}
                        className={`p-1.5 rounded text-xs flex items-center gap-1 transition ${
                          manualToolMode === 'pointer'
                            ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 font-semibold shadow-xs'
                            : 'text-slate-500'
                        }`}
                        title="Pointer"
                      >
                        <MousePointer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setManualToolMode('draw-box')}
                        className={`p-1.5 rounded text-xs flex items-center gap-1 transition ${
                          manualToolMode === 'draw-box'
                            ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 font-semibold shadow-xs'
                            : 'text-slate-500'
                        }`}
                        title="Draw Selection Box over Watermark to Erase"
                      >
                        <Crop className="w-3.5 h-3.5" />
                        <span className="text-[11px] hidden sm:inline">Draw Erase Box</span>
                      </button>
                    </div>
                  )}

                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1 text-xs">
                    <button
                      onClick={handleZoomOut}
                      className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>

                    <select
                      value={zoomMode}
                      onChange={(e) => setZoomMode(e.target.value)}
                      className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 font-medium text-slate-700 dark:text-slate-200"
                    >
                      <option value="fit-page">Fit Page (Full)</option>
                      <option value="fit-width">Fit Width</option>
                      <option value="50">50%</option>
                      <option value="75">75%</option>
                      <option value="100">100%</option>
                      <option value="125">125%</option>
                      <option value="150">150%</option>
                      <option value="200">200%</option>
                    </select>

                    <button
                      onClick={handleZoomIn}
                      className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={handleToggleFit}
                      className={`p-1 rounded-lg border transition ${
                        zoomMode === 'fit-page'
                          ? 'border-brand-500/30 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={zoomMode === 'fit-page' ? 'Fit Page Active' : 'Switch to Fit Page'}
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quality Selector */}
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-slate-400 text-[11px]">DPI:</span>
                    <select
                      value={settings.quality}
                      onChange={(e) => updateSettings({ quality: e.target.value as RenderQuality })}
                      className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 font-medium text-slate-700 dark:text-slate-200"
                    >
                      <option value="draft">Draft (72 DPI)</option>
                      <option value="good">Good (150 DPI)</option>
                      <option value="best">Best (300 DPI)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Canvas Preview Viewport */}
              <div
                ref={previewContainerRef}
                className={`bg-zinc-100/90 dark:bg-zinc-950/70 border border-gray-200/80 dark:border-white/10 rounded-3xl p-3 sm:p-5 min-h-[480px] max-h-[660px] flex items-center justify-center relative shadow-inner ${
                  zoomMode === 'fit-page' ? 'overflow-hidden' : 'overflow-auto'
                }`}
              >
                {isProcessing && (
                  <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs z-20 flex flex-col items-center justify-center gap-3 text-white rounded-3xl">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                    <p className="text-xs font-semibold">{statusMessage || 'Processing PDF...'}</p>
                  </div>
                )}

                <div
                  className={`relative inline-block shadow-2xl rounded-md overflow-hidden bg-white ring-1 ring-black/5 dark:ring-white/10 transition-all ${
                    zoomMode === 'fit-page' ? 'max-h-[580px] max-w-full flex items-center justify-center' : ''
                  }`}
                >
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    style={getCanvasStyle()}
                    className={`block ${
                      manualToolMode === 'draw-box' ? 'cursor-crosshair' : 'cursor-default'
                    }`}
                  />
                </div>
              </div>

              {/* Redaction Box Action Bar (if box drawn) */}
              {activeMode === 'remove' && selectionBox && (
                <div className="bg-white/95 dark:bg-[#0c1222]/95 backdrop-blur-xl border border-brand-500/30 dark:border-brand-500/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-brand-500/5">
                  <div className="flex items-center gap-2 text-xs">
                    <Crop className="w-4 h-4 text-brand-500" />
                    <span className="font-semibold text-brand-600 dark:text-brand-400">
                      Selection Area Marked
                    </span>
                    <span className="text-slate-400">
                      ({Math.round(Math.abs(selectionBox.endX - selectionBox.startX))} ×{' '}
                      {Math.round(Math.abs(selectionBox.endY - selectionBox.startY))} px)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-slate-400">Patch Color:</span>
                      <input
                        type="color"
                        value={redactionColor}
                        onChange={(e) => setRedactionColor(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border border-slate-300 dark:border-slate-700"
                        title="Background matching color"
                      />
                    </div>
                    <button
                      onClick={() => setSelectionBox(null)}
                      className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApplyRedactionBox}
                      className="px-4 py-1.5 text-xs font-bold bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:via-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-md shadow-brand-500/25 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Eraser className="w-3.5 h-3.5" />
                      <span>Erase This Area</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Watermark Settings Panel */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
              {activeMode === 'add' ? (
                /* ADD WATERMARK SETTINGS PANEL */
                <div className="bg-white/80 dark:bg-[#0c1222]/90 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl shadow-brand-500/5 flex flex-col gap-5">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500/15 to-indigo-500/15 dark:from-brand-500/20 dark:to-indigo-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-500/20 shadow-2xs">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Watermark Settings</h2>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Live vector preview & styling</p>
                      </div>
                    </div>

                    {/* Text vs Image Switcher */}
                    <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/70 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/60 shadow-inner">
                      <button
                        onClick={() => updateSettings({ watermarkType: 'text' })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          settings.watermarkType === 'text'
                            ? 'bg-white dark:bg-[#16132a] text-brand-600 dark:text-brand-400 shadow-xs border border-brand-500/20 font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Type className="w-3.5 h-3.5" />
                        <span>Text</span>
                      </button>
                      <button
                        onClick={() => updateSettings({ watermarkType: 'image' })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          settings.watermarkType === 'image'
                            ? 'bg-white dark:bg-[#16132a] text-brand-600 dark:text-brand-400 shadow-xs border border-brand-500/20 font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Image</span>
                      </button>
                    </div>
                  </div>

                  {settings.watermarkType === 'text' ? (
                    /* TEXT WATERMARK CONTROLS */
                    <div className="flex flex-col gap-4">
                      {/* Watermark Text Input */}
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                          <Type className="w-3.5 h-3.5 text-brand-500" />
                          <span>Watermark Text</span>
                        </label>
                        <input
                          type="text"
                          value={settings.text}
                          onChange={(e) => updateSettings({ text: e.target.value })}
                          placeholder="e.g. CONFIDENTIAL, DRAFT, COPY, WASIF"
                          className="w-full text-xs font-medium px-3.5 py-2.5 bg-slate-50/90 dark:bg-slate-850/80 border border-slate-200/90 dark:border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all shadow-2xs"
                        />
                      </div>

                      {/* Font Family & Style */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                            Font Family
                          </label>
                          <select
                            value={settings.fontFamily}
                            onChange={(e) =>
                              updateSettings({ fontFamily: e.target.value as WatermarkFontFamily })
                            }
                            className="w-full text-xs font-medium bg-slate-50/90 dark:bg-slate-850/80 border border-slate-200/90 dark:border-slate-700/80 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-2xs"
                          >
                            <option value="Helvetica">Helvetica (Sans)</option>
                            <option value="TimesRoman">Times Roman (Serif)</option>
                            <option value="Courier">Courier (Mono)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                            Style
                          </label>
                          <select
                            value={settings.fontStyle}
                            onChange={(e) =>
                              updateSettings({ fontStyle: e.target.value as WatermarkFontStyle })
                            }
                            className="w-full text-xs font-medium bg-slate-50/90 dark:bg-slate-850/80 border border-slate-200/90 dark:border-slate-700/80 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-2xs"
                          >
                            <option value="regular">Regular</option>
                            <option value="bold">Bold</option>
                            <option value="italic">Italic</option>
                            <option value="bold-italic">Bold Italic</option>
                          </select>
                        </div>
                      </div>

                      {/* Font Size Slider */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5 text-xs">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Font Size
                          </span>
                          <span className="font-mono px-2 py-0.5 rounded-md bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 font-bold text-xs border border-brand-500/20">
                            {settings.fontSize} pt
                          </span>
                        </div>
                        <input
                          type="range"
                          min="12"
                          max="120"
                          value={settings.fontSize}
                          onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value, 10) })}
                          className="w-full accent-brand-600 dark:accent-brand-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Color Palette & Custom Hex */}
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                          Color & Hue
                        </label>
                        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                          {COLOR_PRESETS.map((preset) => (
                            <button
                              key={preset.hex}
                              onClick={() => updateSettings({ color: preset.hex })}
                              className={`w-6 h-6 rounded-full transition-all relative ${
                                settings.color.toLowerCase() === preset.hex.toLowerCase()
                                  ? 'ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-[#0c1222] scale-110 shadow-sm'
                                  : 'border border-slate-300/80 dark:border-slate-700 hover:scale-105 opacity-85 hover:opacity-100'
                              }`}
                              style={{ backgroundColor: preset.hex }}
                              title={preset.name}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <input
                              type="color"
                              value={settings.color}
                              onChange={(e) => updateSettings({ color: e.target.value })}
                              className="w-9 h-9 rounded-xl cursor-pointer border border-slate-200/90 dark:border-slate-700/80 p-0.5 bg-white dark:bg-slate-800 shadow-2xs"
                            />
                          </div>
                          <input
                            type="text"
                            value={settings.color}
                            onChange={(e) => updateSettings({ color: e.target.value })}
                            className="flex-1 text-xs font-mono uppercase px-3.5 py-2 bg-slate-50/90 dark:bg-slate-850/80 border border-slate-200/90 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-2xs transition-all"
                            placeholder="#4f46e5"
                          />
                        </div>
                      </div>

                      {/* Opacity & Rotation */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between items-center mb-1.5 text-xs">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              Opacity
                            </span>
                            <span className="font-mono px-2 py-0.5 rounded-md bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 font-bold text-xs border border-brand-500/20">
                              {settings.opacity}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="100"
                            value={settings.opacity}
                            onChange={(e) =>
                              updateSettings({ opacity: parseInt(e.target.value, 10) })
                            }
                            className="w-full accent-brand-600 dark:accent-brand-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1.5 text-xs">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              Rotation
                            </span>
                            <span className="font-mono px-2 py-0.5 rounded-md bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 font-bold text-xs border border-brand-500/20">
                              {settings.rotation}°
                            </span>
                          </div>
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            value={settings.rotation}
                            onChange={(e) =>
                              updateSettings({ rotation: parseInt(e.target.value, 10) })
                            }
                            className="w-full accent-brand-600 dark:accent-brand-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                          />
                          <div className="flex justify-between text-[10px] mt-2 gap-1">
                            {[-45, 0, 45, 90].map((deg) => (
                              <button
                                key={deg}
                                type="button"
                                onClick={() => updateSettings({ rotation: deg })}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all ${
                                  settings.rotation === deg
                                    ? 'bg-brand-500/15 border-brand-500/40 text-brand-600 dark:text-brand-400 font-bold'
                                    : 'border-slate-200/80 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/50 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500/30'
                                }`}
                              >
                                {deg}°
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* IMAGE WATERMARK CONTROLS */
                    <div className="flex flex-col gap-4">
                      {/* Image Upload Dropzone */}
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-brand-500" />
                          <span>Watermark Image (PNG / JPG / WEBP)</span>
                        </label>
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
                          }}
                        />

                        {imagePreviewUrl ? (
                          <div className="flex items-center gap-3 p-3 bg-slate-50/90 dark:bg-slate-850/80 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl shadow-2xs">
                            <img
                              src={imagePreviewUrl}
                              alt="Watermark preview"
                              className="w-12 h-12 object-contain rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1"
                            />
                            <div className="flex-1 truncate">
                              <p className="text-xs font-semibold truncate text-slate-900 dark:text-white">{imageFile?.name}</p>
                              <p className="text-[10px] text-slate-400">
                                {imageFile ? formatFileSize(imageFile.size) : ''}
                              </p>
                            </div>
                            <button
                              onClick={() => imageInputRef.current?.click()}
                              className="px-3 py-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-500/10 rounded-xl transition border border-brand-500/20"
                            >
                              Change
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => imageInputRef.current?.click()}
                            className="w-full py-6 border-2 border-dashed border-slate-300/80 dark:border-slate-700/80 hover:border-brand-500 dark:hover:border-brand-400 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition group bg-slate-50/40 dark:bg-slate-900/30"
                          >
                            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 transition">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Click to select image file</span>
                            <span className="text-[10px] text-slate-400">
                              Supports transparent PNG & WEBP
                            </span>
                          </button>
                        )}
                      </div>

                      {/* Scale & Opacity */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between items-center mb-1.5 text-xs">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              Scale
                            </span>
                            <span className="font-mono px-2 py-0.5 rounded-md bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 font-bold text-xs border border-brand-500/20">
                              {settings.imageScale}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="200"
                            value={settings.imageScale}
                            onChange={(e) =>
                              updateSettings({ imageScale: parseInt(e.target.value, 10) })
                            }
                            className="w-full accent-brand-600 dark:accent-brand-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1.5 text-xs">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              Opacity
                            </span>
                            <span className="font-mono px-2 py-0.5 rounded-md bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 font-bold text-xs border border-brand-500/20">
                              {settings.imageOpacity}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="100"
                            value={settings.imageOpacity}
                            onChange={(e) =>
                              updateSettings({ imageOpacity: parseInt(e.target.value, 10) })
                            }
                            className="w-full accent-brand-600 dark:accent-brand-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Rotation */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5 text-xs">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Rotation
                          </span>
                          <span className="font-mono px-2 py-0.5 rounded-md bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 font-bold text-xs border border-brand-500/20">
                            {settings.imageRotation}°
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={settings.imageRotation}
                          onChange={(e) =>
                            updateSettings({ imageRotation: parseInt(e.target.value, 10) })
                          }
                          className="w-full accent-brand-600 dark:accent-brand-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {/* SHARED LAYOUT & LAYER CONTROLS */}
                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex flex-col gap-4">
                    {/* Layout Mode */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                        <Grid className="w-3.5 h-3.5 text-brand-500" />
                        <span>Layout Mode</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'center-single', label: 'Center (Single)', desc: '1 prominent mark' },
                          { id: 'tiled', label: 'Tiled Grid', desc: 'Even horizontal grid' },
                          { id: 'diagonal-tiled', label: 'Diagonal Tiled', desc: 'Full page pattern' },
                          { id: 'corners', label: '4 Corners', desc: 'Discreet border stamp' },
                        ].map((layoutOption) => (
                          <button
                            key={layoutOption.id}
                            type="button"
                            onClick={() =>
                              updateSettings({ layout: layoutOption.id as WatermarkLayout })
                            }
                            className={`p-2.5 rounded-2xl text-left border transition-all ${
                              settings.layout === layoutOption.id
                                ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 ring-1 ring-brand-500/30 shadow-xs'
                                : 'border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-850/50 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="text-xs font-bold leading-tight">{layoutOption.label}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{layoutOption.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Layer Placement */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-brand-500" />
                        <span>Layer Placement</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => updateSettings({ layer: 'foreground' })}
                          className={`p-2.5 rounded-2xl text-left border transition-all ${
                            settings.layer === 'foreground'
                              ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 ring-1 ring-brand-500/30 shadow-xs'
                              : 'border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-850/50 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="text-xs font-bold">On Top of Content</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Overlays text & tables</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSettings({ layer: 'background' })}
                          className={`p-2.5 rounded-2xl text-left border transition-all ${
                            settings.layer === 'background'
                              ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 ring-1 ring-brand-500/30 shadow-xs'
                              : 'border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-850/50 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="text-xs font-bold">Behind Content</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Under text elements</div>
                        </button>
                      </div>
                    </div>

                    {/* Page Range */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-brand-500" />
                        <span>Apply to Pages</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => updateSettings({ pageRange: 'all' })}
                          className={`py-2 px-2 rounded-xl text-xs font-bold border text-center transition-all ${
                            settings.pageRange === 'all'
                              ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 ring-1 ring-brand-500/30 shadow-xs'
                              : 'border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-850/50 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          All ({pageCount})
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSettings({ pageRange: 'current' })}
                          className={`py-2 px-2 rounded-xl text-xs font-bold border text-center transition-all ${
                            settings.pageRange === 'current'
                              ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 ring-1 ring-brand-500/30 shadow-xs'
                              : 'border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-850/50 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          Current (#{currentPage})
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSettings({ pageRange: 'custom' })}
                          className={`py-2 px-2 rounded-xl text-xs font-bold border text-center transition-all ${
                            settings.pageRange === 'custom'
                              ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 ring-1 ring-brand-500/30 shadow-xs'
                              : 'border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-850/50 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          Custom Range
                        </button>
                      </div>

                      {settings.pageRange === 'custom' && (
                        <input
                          type="text"
                          value={settings.customPages}
                          onChange={(e) => updateSettings({ customPages: e.target.value })}
                          placeholder="e.g. 1-3, 5, 8"
                          className="w-full text-xs font-medium px-3.5 py-2.5 bg-slate-50/90 dark:bg-slate-850/80 border border-slate-200/90 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-2xs"
                        />
                      )}
                    </div>
                  </div>

                  {/* Apply Watermark Primary CTA */}
                  <button
                    onClick={handleApplyWatermark}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:via-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-2xl text-xs font-bold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>Apply Watermark to PDF</span>
                  </button>
                </div>
              ) : (
                /* REMOVE WATERMARK SETTINGS PANEL */
                <div className="bg-white/80 dark:bg-[#0c1222]/90 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl shadow-brand-500/5 flex flex-col gap-5">
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500/20 to-indigo-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-500/20 shadow-2xs">
                      <Eraser className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">Watermark Removal Engine</h2>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Automated digital & manual vector erase</p>
                    </div>
                  </div>

                  {/* Engine A: 1-Click Automatic Digital Watermark Stripping */}
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-brand-500/5 to-indigo-500/5 dark:from-brand-500/10 dark:to-indigo-500/10 border border-brand-500/20 dark:border-brand-500/30 flex flex-col gap-3">
                    <div className="flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-brand-500 dark:text-brand-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                            Engine A: 1-Click Auto-Strip
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                            Recommended
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                          Lossless structural stripping: removes /Stamp annotations, /Watermark subtypes,
                          transparent overlay images (SMask), low-opacity /ExtGState, /Artifact streams, and Compixor tags.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCompixorWatermarks}
                      disabled={isProcessing}
                      className="w-full py-3 px-3 text-xs font-bold bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:via-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-md shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Run Engine A: Auto-Strip Digital Watermarks</span>
                    </button>
                  </div>

                  {/* Targeted Text Operator Stripping */}
                  <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Type className="w-3.5 h-3.5 text-brand-500" />
                        <span>Targeted Text Stream Removal</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Search and erase specific vector text operators across all PDF content streams
                        (e.g., &quot;CONFIDENTIAL&quot;, &quot;DRAFT&quot;, &quot;SAMPLE&quot;).
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={searchString}
                        onChange={(e) => setSearchString(e.target.value)}
                        placeholder="e.g. DRAFT or CONFIDENTIAL"
                        className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50/90 dark:bg-slate-850/80 border border-slate-200/90 dark:border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-900 dark:text-white placeholder:text-slate-400 shadow-2xs"
                      />
                      <button
                        onClick={handleRemoveGenericText}
                        disabled={isProcessing || !searchString.trim()}
                        className="px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl disabled:opacity-50 transition cursor-pointer shadow-2xs"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Engine B: Manual Bounding Box Erase / Redaction */}
                  <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Crop className="w-3.5 h-3.5 text-cyan-500" />
                          <span>Engine B: Interactive Eraser / Whiteout Box</span>
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                          For Scanned PDFs
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Drag a selection box over any watermark or logo on the preview canvas to overlay a clean,
                        background-matched vector whiteout rectangle.
                      </p>
                    </div>

                    <button
                      onClick={() => setManualToolMode('draw-box')}
                      className={`w-full py-2.5 px-3 text-xs font-bold border rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
                        manualToolMode === 'draw-box'
                          ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 ring-1 ring-brand-500/30 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Crop className="w-4 h-4" />
                      <span>
                        {manualToolMode === 'draw-box'
                          ? 'Now Drag on Canvas to Select'
                          : 'Draw Erase Box on Canvas'}
                      </span>
                    </button>
                  </div>

                  {/* Warning regarding scanned / rasterized pages */}
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <div className="text-[11px] leading-relaxed">
                      <span className="font-bold">Scanned Document Notice:</span> Watermarks baked
                      or flattened directly into scanned bitmap images cannot be automatically
                      separated via stream objects. Use the Bounding Box Erase tool or an OCR-based
                      detection tool for flattened scans.
                    </div>
                  </div>
                </div>
              )}
            </div>
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
            How Compixor.Ai redefines privacy, vector precision, and speed for PDF watermarking.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="glass-card p-6 text-center rounded-2xl hover:border-brand-500/30 transition">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1.5">100% Client-Side</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Stamps and watermarks are injected directly inside browser RAM. Zero files or bytes are sent to remote servers.
            </p>
          </div>

          <div className="glass-card p-6 text-center rounded-2xl hover:border-cyan-500/30 transition">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 mx-auto mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1.5">Instant Execution</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              No server queues, bandwidth throttling, or upload waiting times. Transformations happen in milliseconds.
            </p>
          </div>

          <div className="glass-card p-6 text-center rounded-2xl hover:border-emerald-500/30 transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1.5">Privacy Guaranteed</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Zero telemetry on document contents. Complete client-side confidentiality for contracts and IDs.
            </p>
          </div>

          <div className="glass-card p-6 text-center rounded-2xl hover:border-indigo-500/30 transition">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mx-auto mb-4">
              <MonitorSmartphone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1.5">Cross-Platform</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Runs seamlessly in Chrome, Edge, Firefox, Safari, and mobile browsers with zero software installation.
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
            Answers to common questions about client-side PDF watermarking and removal
          </p>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {FAQS.map((faq, idx) => {
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
      <RelatedPdfTools currentTool={activeMode === 'add' ? 'add-watermark' : 'remove-watermark'} />
    </div>
  );
}
