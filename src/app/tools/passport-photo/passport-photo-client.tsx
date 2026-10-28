'use client';


import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ToolFeedback from '@/components/ToolFeedback';
import { incrementFilesDone } from '@/lib/feedbackCounter';
import {
  Camera,
  Upload,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  ZoomIn,
  ZoomOut,
  Sliders,
  Download,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  ChevronDown,
  HelpCircle,
  Eye,
  RefreshCw,
  Maximize2,
  FileCheck,
  Palette,
  Scissors,
  Check,
  FileDown,
  Settings2,
  ArrowLeft,
  PlusCircle,
  Grid,
  FileText,
  SlidersHorizontal,
  Loader2,
  ShieldCheck,
  Image as ImageIcon,
  Move,
  Crosshair,
} from 'lucide-react';
import { toast } from 'sonner';
import FileDropZone from '@/components/FileDropZone';
import DropAnywhere from '@/components/DropAnywhere';
import RelatedTools from '@/components/RelatedTools';
import PassportBeforeAfter from '@/components/PassportBeforeAfter';
import {
  removeBackground,
  removeBackgroundISNet,
  refineCutoutCanvas,
  sampleOriginalBgColor,
  computeImageSha256,
  cutoutCache,
  prepareUploadBlob,
  MattingProgress,
} from '@/utils/backgroundMatting';
import {
  computeStudioLayout,
  renderStudioSheetToCanvas,
  injectJpegDpi300,
  injectPngDpi300,
  generateStudioPdf,
  SheetLayoutResult,
} from '@/lib/printSheetsV2';
import { parseImageHeaderDimensions } from '@/utils/imageHeaderParser';
import { createPassportWorkingCopy, PASSPORT_UPLOAD_CONFIG } from '@/utils/imageWorkingCopy';

import {
  type BiometricSpec,
  type Preset,
  type ColorOption,
  standardPresets,
  classicalColors,
} from './presets';


type SheetPresetOption = 'a4' | '3-per-a4' | 'a6-2' | 'a5-6' | 'custom';

const sizeLimitOptions = [
  { id: 'uncompressed', label: 'Original Quality (Max Resolution)', maxBytes: 0 },
  { id: '500kb', label: 'Under 500 KB', maxBytes: 500 * 1024 },
  { id: '240kb', label: 'Under 240 KB (US State Dept / CEAC)', maxBytes: 240 * 1024 },
  { id: '100kb', label: 'Under 100 KB (India OCI / UK Gov)', maxBytes: 100 * 1024 },
  { id: '50kb', label: 'Under 50 KB (NADRA / Online Visa)', maxBytes: 50 * 1024 },
  { id: '30kb', label: 'Under 30 KB', maxBytes: 30 * 1024 },
];

// High-precision morphological mask cleanup (Open/Close) + smoothstep edge feathering
function cleanAndRefineAlphaMask(
  rawMask: Uint8Array,
  width: number,
  height: number,
  sensitivity: number,
  featherRadius: number
): Uint8Array {
  const total = width * height;
  const smoothed = new Uint8Array(total);

  // 1. Smoothstep Sigmoidal Mapping (preserves continuous soft hair alpha)
  // Maps raw 0..255 confidence values through an S-curve centered on sensitivity
  const center = (sensitivity / 100) * 255;
  const range = Math.max(25, featherRadius * 16);
  const low = Math.max(0, center - range);
  const high = Math.min(255, center + range);

  for (let i = 0; i < total; i++) {
    const v = rawMask[i];
    if (v <= low) {
      smoothed[i] = 0;
    } else if (v >= high) {
      smoothed[i] = 255;
    } else {
      const t = (v - low) / (high - low);
      smoothed[i] = Math.round(t * t * (3 - 2 * t) * 255);
    }
  }

  // 2. Morphological Closing (3x3 Dilation then Erosion)
  // Fills small dark pinholes and gaps inside hair, beard, and clothing
  const dilated = new Uint8Array(total);
  for (let y = 1; y < height - 1; y++) {
    const yw = y * width;
    for (let x = 1; x < width - 1; x++) {
      let maxV = smoothed[yw + x];
      maxV = Math.max(maxV, smoothed[yw - width + x], smoothed[yw + width + x], smoothed[yw + x - 1], smoothed[yw + x + 1]);
      dilated[yw + x] = maxV;
    }
  }
  const closed = new Uint8Array(total);
  for (let y = 1; y < height - 1; y++) {
    const yw = y * width;
    for (let x = 1; x < width - 1; x++) {
      let minV = dilated[yw + x];
      minV = Math.min(minV, dilated[yw - width + x], dilated[yw + width + x], dilated[yw + x - 1], dilated[yw + x + 1]);
      closed[yw + x] = minV;
    }
  }

  // 3. Morphological Opening (3x3 Erosion then Dilation)
  // Removes isolated noisy islands and stray specks in background
  const eroded = new Uint8Array(total);
  for (let y = 1; y < height - 1; y++) {
    const yw = y * width;
    for (let x = 1; x < width - 1; x++) {
      let minV = closed[yw + x];
      minV = Math.min(minV, closed[yw - width + x], closed[yw + width + x], closed[yw + x - 1], closed[yw + x + 1]);
      eroded[yw + x] = minV;
    }
  }
  const cleaned = new Uint8Array(total);
  for (let y = 1; y < height - 1; y++) {
    const yw = y * width;
    for (let x = 1; x < width - 1; x++) {
      let maxV = eroded[yw + x];
      maxV = Math.max(maxV, eroded[yw - width + x], eroded[yw + width + x], eroded[yw + x - 1], eroded[yw + x + 1]);
      cleaned[yw + x] = maxV;
    }
  }

  // Preserve soft gradient hair edges from smoothed mask
  for (let i = 0; i < total; i++) {
    if (smoothed[i] > 12 && smoothed[i] < 242) {
      cleaned[i] = smoothed[i];
    }
  }

  return cleaned;
}

// Alpha De-Spill & De-Fringing
// Un-mixes and neutralizes residual background color halos on semi-transparent hair/jawline edges
function applyColorDeSpill(
  srcData: ImageData,
  alphaMask: Uint8Array,
  width: number,
  height: number,
  bgR: number,
  bgG: number,
  bgB: number
) {
  const d = srcData.data;
  const total = width * height;

  for (let i = 0; i < total; i++) {
    const a = alphaMask[i];
    const idx = i * 4;

    // Set alpha
    d[idx + 3] = a;

    if (a === 0) continue;

    // For semi-transparent edge pixels (hair strands, jawline, clothing boundary)
    if (a < 245) {
      const alphaFactor = a / 255;
      const r = d[idx];
      const g = d[idx + 1];
      const b = d[idx + 2];

      // Measure color distance to original background color
      const bgDist = Math.sqrt(Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2));

      // If this edge pixel has strong contamination from the background:
      if (bgDist < 95) {
        const invA = 1 - alphaFactor;
        let cleanR = Math.max(0, Math.min(255, (r - invA * bgR) / Math.max(0.12, alphaFactor)));
        let cleanG = Math.max(0, Math.min(255, (g - invA * bgG) / Math.max(0.12, alphaFactor)));
        let cleanB = Math.max(0, Math.min(255, (b - invA * bgB) / Math.max(0.12, alphaFactor)));

        // Neutralize saturated background halo on fine hair strands
        const avgLum = cleanR * 0.299 + cleanG * 0.587 + cleanB * 0.114;
        cleanR = cleanR * 0.55 + avgLum * 0.45;
        cleanG = cleanG * 0.55 + avgLum * 0.45;
        cleanB = cleanB * 0.55 + avgLum * 0.45;

        d[idx] = Math.round(cleanR);
        d[idx + 1] = Math.round(cleanG);
        d[idx + 2] = Math.round(cleanB);
      }
    }
  }
}

// GPU-accelerated Gaussian mask blur via Canvas 2D filter
// Softens harsh MediaPipe segmentation edges — crucial for natural-looking hair/skin boundaries
// Uses the browser's compositing engine (GPU) instead of CPU loops — runs in <5ms
function applyCanvasMaskBlur(alpha: Uint8Array, width: number, height: number, blurPx: number): Uint8Array {
  if (blurPx <= 0) return alpha;

  // Step 1: Write grayscale mask to a canvas (R=G=B=alpha, A=255)
  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = width;
  srcCanvas.height = height;
  const srcCtx = srcCanvas.getContext('2d')!;
  const imgData = srcCtx.createImageData(width, height);
  for (let i = 0; i < width * height; i++) {
    imgData.data[i * 4]     = alpha[i]; // R
    imgData.data[i * 4 + 1] = alpha[i]; // G
    imgData.data[i * 4 + 2] = alpha[i]; // B
    imgData.data[i * 4 + 3] = 255;       // A opaque
  }
  srcCtx.putImageData(imgData, 0, 0);

  // Step 2: Draw with GPU blur filter onto a second canvas
  const dstCanvas = document.createElement('canvas');
  dstCanvas.width = width;
  dstCanvas.height = height;
  const dstCtx = dstCanvas.getContext('2d')!;
  dstCtx.filter = `blur(${blurPx}px)`;
  dstCtx.drawImage(srcCanvas, 0, 0);

  // Step 3: Read back the blurred grayscale values as alpha
  const blurredData = dstCtx.getImageData(0, 0, width, height);
  const result = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    result[i] = blurredData.data[i * 4]; // Red channel = grayscale
  }
  return result;
}


export default function PassportPhotoPage() {
  const [currentStep, setCurrentStep] = useState<'edit' | 'preview'>('edit');
  // Compixor AI Mode: 'cutout' (transparent checkerboard) vs 'background' (solid colors)
  const [previewTab, setPreviewTab] = useState<'cutout' | 'background'>('background');


  const [isCustomMode, setIsCustomMode] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<Preset>(standardPresets[0]);

  // Custom size state
  const [customUnit, setCustomUnit] = useState<'mm' | 'cm' | 'inch' | 'px'>('mm');
  const [customWidth, setCustomWidth] = useState<number>(35);
  const [customHeight, setCustomHeight] = useState<number>(45);
  const [customDpi, setCustomDpi] = useState<number>(300);

  // Background color state
  const [bgColor, setBgColor] = useState('#ffffff');
  const [customColorsHistory, setCustomColorsHistory] = useState<string[]>([]);
  const [customHexInput, setCustomHexInput] = useState('#ffffff');

  // Load last 5 custom colors from localStorage (wrapped in try/catch)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('compixor-passport-custom-colors');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setCustomColorsHistory(parsed.slice(0, 5));
          }
        }
      }
    } catch (_) {}
  }, []);

  const addCustomColorToHistory = useCallback((colorHex: string) => {
    const clean = colorHex.trim().toUpperCase();
    if (!/^#[0-9A-F]{6}$/i.test(clean)) return;
    setCustomColorsHistory((prev) => {
      const next = [clean, ...prev.filter((c) => c !== clean)].slice(0, 5);
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('compixor-passport-custom-colors', JSON.stringify(next));
        }
      } catch (_) {}
      return next;
    });
  }, []);

  // Sync background color when preset changes
  const handlePresetSelect = (preset: Preset) => {
    setSelectedPreset(preset);
    setBgColor(preset.defaultBgColor);
    setPreviewTab('background');
    if (cachedCutoutCanvasRef.current || imageSrc) {
      setTimeout(() => {
        autoAlignBiometric('preset-change', activeRequestIdRef.current);
      }, 50);
    }
  };


  // Compute active preset object
  const activePreset = useMemo<Preset>(() => {
    if (!isCustomMode) return selectedPreset;

    let widthPx = 413;
    let heightPx = 531;
    let widthMm = 35;
    let heightMm = 45;

    if (customUnit === 'px') {
      widthPx = Math.max(100, Math.round(customWidth));
      heightPx = Math.max(100, Math.round(customHeight));
      widthMm = Math.round((widthPx / customDpi) * 25.4);
      heightMm = Math.round((heightPx / customDpi) * 25.4);
    } else if (customUnit === 'inch') {
      widthPx = Math.round(customWidth * customDpi);
      heightPx = Math.round(customHeight * customDpi);
      widthMm = Math.round(customWidth * 25.4);
      heightMm = Math.round(customHeight * 25.4);
    } else if (customUnit === 'cm') {
      widthMm = customWidth * 10;
      heightMm = customHeight * 10;
      widthPx = Math.round((widthMm / 25.4) * customDpi);
      heightPx = Math.round((heightMm / 25.4) * customDpi);
    } else {
      widthMm = customWidth;
      heightMm = customHeight;
      widthPx = Math.round((widthMm / 25.4) * customDpi);
      heightPx = Math.round((heightMm / 25.4) * customDpi);
    }

    const aspect = widthPx / Math.max(1, heightPx);

    return {
      id: 'custom',
      name: `Custom (${widthMm} × ${heightMm} mm)`,
      country: 'Custom Format',
      widthMm,
      heightMm,
      widthPx,
      heightPx,
      aspectRatio: aspect,
      defaultBgColor: '#ffffff',
      allowedBgColors: ['#ffffff', '#f8fafc', '#e0f2fe', '#438edb', '#1d4ed8', '#f1f5f9', '#dc2626'],
      verified: false,
      description: `${widthPx} × ${heightPx} px @ ${customDpi} DPI`,

      flag: '🛠️',
      biometricSpec: {
        headHeightPercent: 70,
        headWidthPercent: 58,
        topMarginPercent: 10,
        eyeLinePercent: 40,
        chinLinePercent: 80,
        minHeadMm: Math.round(heightMm * 0.65),
        maxHeadMm: Math.round(heightMm * 0.78),
        specSummary: `Head: ~70% height • Eye level: ~40% from top`,
      },
    };
  }, [isCustomMode, selectedPreset, customUnit, customWidth, customHeight, customDpi]);

  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // Transform controls
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Lighting & color adjustments
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [showGuidelines, setShowGuidelines] = useState(true);

  // Background removal state (enabled by default for passport workflow)
  const [enableBgRemoval, setEnableBgRemoval] = useState(true);
  const [bgFeather, setBgFeather] = useState(1.2); // 0.5px - 2.5px edge feather (default 1.2px for natural hair/shoulder softness)
  const [bgChoke, setBgChoke] = useState(0.6); // 0.0px - 1.2px alpha boundary choke to eliminate fringe halos
  const [enableDecontamination, setEnableDecontamination] = useState(false); // Neutralizes original backdrop color bleed (default unchecked)
  const [isSegmenting, setIsSegmenting] = useState(false);
  const [segmentationStatus, setSegmentationStatus] = useState<string | null>(null);
  const [mattingProgress, setMattingProgress] = useState<MattingProgress | null>(null);
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [mattingState, setMattingState] = useState<'idle' | 'uploading' | 'processing' | 'error'>('idle');
  const [lastApiError, setLastApiError] = useState<string | null>(null);
  const requestCountRef = useRef<number>(0);

  // Step-by-step processing state
  type ProcessingStep = null | 'optimizing' | 'removing-bg' | 'compositing' | 'done';
  const [processingStep, setProcessingStep] = useState<ProcessingStep>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Device-only mode toggle & explicit retry
  const [forceOnDevice, setForceOnDevice] = useState(false);
  const currentPhotoHashRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeRequestIdRef = useRef<number>(0);
  const activeObjectUrlRef = useRef<string | null>(null);
  const lastProcessedKeyRef = useRef<string | null>(null);
  const [faceDetected, setFaceDetected] = useState<boolean | null>(null);
  const [measuredBiometrics, setMeasuredBiometrics] = useState<{
    headPercent: number | null;
    crownPercent: number | null;
    eyePercent: number | null;
    chinPercent: number | null;
  }>({ headPercent: null, crownPercent: null, eyePercent: null, chinPercent: null });

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      if (activeObjectUrlRef.current) {
        try {
          URL.revokeObjectURL(activeObjectUrlRef.current);
        } catch (_) {}
      }
    };
  }, []);

  // UX and Mobile Adjust Mode state
  const [isAdjustMode, setIsAdjustMode] = useState(false);
  const [isAdvancedAccordionOpen, setIsAdvancedAccordionOpen] = useState(false);
  const [baselineZoom, setBaselineZoom] = useState(1);
  const [isTooCloseWarning, setIsTooCloseWarning] = useState(false);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef<number>(1);

  // Floating Debug Panel (?debug=1)
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [isDebugExpanded, setIsDebugExpanded] = useState(false);
  const [debugStats, setDebugStats] = useState({
    requestsSent: 0,
    cacheHits: 0,
    lastDurationMs: 0,
    lastUploadedKb: 0,
    lastResult: 'idle' as 'idle' | 'ok' | 'error' | 'fallback',
    mode: 'server' as 'server' | 'on-device',
    cachedHash: 'none',
    lastRenderMs: 0,
    lastAlignCause: 'none' as string,
    zoomDisplay: '100% (1.00x)' as string,
  });

  // Atomic state reset helper (never shows toast automatically)
  const clearTransformState = useCallback(() => {
    setZoom(1);
    setBaselineZoom(1);
    setRotation(0);
    setPanX(0);
    setPanY(0);
    setFlipH(false);
    setIsAdjustMode(false);
    setIsTooCloseWarning(false);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setEnableBgRemoval(true);
    setBgFeather(1.2);
    setBgChoke(0.6);
    setEnableDecontamination(false);
    setMattingProgress(null);
    setPreviewTab('background');
  }, []);


  // Sync debug mode and step=download query param on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setIsDebugMode(params.get('debug') === '1');
      if (params.get('step') === 'download') {
        if (!imageSrc) {
          // If visited without a photo, force Step 1 (Upload/Edit)
          const newParams = new URLSearchParams(window.location.search);
          newParams.delete('step');
          const newUrl = window.location.pathname + (newParams.toString() ? `?${newParams.toString()}` : '');
          window.history.replaceState({}, '', newUrl);
          setCurrentStep('edit');
        } else {
          setCurrentStep('preview');
        }
      }
    }
  }, [imageSrc]);

  // Handle browser back/forward buttons
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('step') === 'download' && imageSrc) {
        setCurrentStep('preview');
      } else {
        setCurrentStep('edit');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [imageSrc]);

  // Download screen options
  const [sheetPreset, setSheetPreset] = useState<SheetPresetOption>('a4');
  const [customSheetCols, setCustomSheetCols] = useState<number>(2);
  const [customSheetRows, setCustomSheetRows] = useState<number>(5);
  const [selectedSizeLimit, setSelectedSizeLimit] = useState<string>('uncompressed');

  // Canvases
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sheetCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);
  const previewBoxRef = useRef<HTMLDivElement>(null);

  const rawCutoutCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cachedCutoutCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const segmenterRef = useRef<any>(null);
  const hasAutoAlignedRef = useRef<boolean>(false);

  // Dynamic preview box
  const previewDimensions = useMemo(() => {
    const maxW = 270;
    const maxH = 350;
    let width = maxW;
    let height = maxW / activePreset.aspectRatio;
    if (height > maxH) {
      height = maxH;
      width = maxH * activePreset.aspectRatio;
    }
    return {
      width: Math.round(width),
      height: Math.round(height),
    };
  }, [activePreset.aspectRatio]);

  // MediaPipe client model removed: Background removal is now 100% processed via FastAPI backend API

  // STEP 2 — Instant Solid Color Background & Transformed Cutout Compositing Engine
  // Rule: Solid BG fill FIRST → then draw clean transformed subject cutout on top (instant 60 FPS client-side)
  const compositeFinalCanvas = useCallback(() => {
    const renderStart = performance.now();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = activePreset.widthPx;
    const height = activePreset.heightPx;
    canvas.width = width;
    canvas.height = height;

    // Reset compositing to standard (no blending artifacts)
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1.0;

    const isTransparent = previewTab === 'cutout' || bgColor === 'transparent';

    // STEP 1: Always fill background first (solid color, linear gradient, or pure transparent for cutout PNG export)
    if (isTransparent) {
      ctx.clearRect(0, 0, width, height);
    } else if (bgColor.startsWith('gradient:')) {
      const parts = bgColor.split(':');
      const fromColor = parts[1] || '#6FB9F2';
      const toColor = parts[2] || '#C1E3FA';
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, fromColor);
      grad.addColorStop(1, toColor);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
    }


    // STEP 2: Draw the subject (cutout or raw photo) with transforms
    // Fall back to raw image so preview canvas is NEVER left blank while background removal processes
    const subjectSource = enableBgRemoval
      ? (cachedCutoutCanvasRef.current || imageElementRef.current)
      : imageElementRef.current;
    if (subjectSource) {
      const srcW = 'naturalWidth' in subjectSource ? (subjectSource as HTMLImageElement).naturalWidth : (subjectSource as HTMLCanvasElement).width;
      const srcH = 'naturalHeight' in subjectSource ? (subjectSource as HTMLImageElement).naturalHeight : (subjectSource as HTMLCanvasElement).height;

      if (srcW > 0 && srcH > 0) {
        const scaleX = width / previewDimensions.width;
        const scaleY = height / previewDimensions.height;
        const scaledPanX = panX * scaleX;
        const scaledPanY = panY * scaleY;

        ctx.save();
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
        ctx.translate(width / 2 + scaledPanX, height / 2 + scaledPanY);
        ctx.rotate((rotation * Math.PI) / 180);
        if (flipH) {
          ctx.scale(-zoom, zoom);
        } else {
          ctx.scale(zoom, zoom);
        }

        const fitScale = Math.max(width / srcW, height / srcH);
        const drawW = srcW * fitScale;
        const drawH = srcH * fitScale;
        ctx.drawImage(subjectSource, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      }
    }

    setProcessingStep('done');
    const renderDuration = Math.round(performance.now() - renderStart);
    setDebugStats((prev) => ({ ...prev, lastRenderMs: renderDuration }));
  }, [
    activePreset,
    bgColor,
    previewTab,
    enableBgRemoval,
    panX,
    panY,
    zoom,
    rotation,
    flipH,
    brightness,
    contrast,
    saturation,
    previewDimensions,
  ]);

  // Face detection helper & Biometric Auto-Aligner (ICAO 9303 70-80% head height alignment)
  // Supports both HTMLCanvasElement (cutout) and HTMLImageElement (raw photo)
  const detectFaceBounds = async (
    source: HTMLCanvasElement | HTMLImageElement
  ): Promise<{ x: number; y: number; width: number; height: number } | null> => {
    const srcW = 'naturalWidth' in source ? (source.naturalWidth || source.width) : source.width;
    const srcH = 'naturalHeight' in source ? (source.naturalHeight || source.height) : source.height;
    if (srcW <= 0 || srcH <= 0) return null;

    if (typeof window !== 'undefined' && 'FaceDetector' in window) {
      try {
        const detector = new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
        const faces = await detector.detect(source);
        if (faces && faces.length > 0) {
          const b = faces[0].boundingBox;
          return { x: b.x, y: b.y, width: b.width, height: b.height };
        }
        return null;
      } catch (_) {}
    }

    let scanCanvas: HTMLCanvasElement;
    let w = srcW;
    let h = srcH;

    if ('getContext' in source) {
      scanCanvas = source as HTMLCanvasElement;
    } else {
      scanCanvas = document.createElement('canvas');
      const maxDim = 800;
      if (w > maxDim || h > maxDim) {
        const ratio = Math.min(maxDim / w, maxDim / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      scanCanvas.width = w;
      scanCanvas.height = h;
      const ctx = scanCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return null;
      ctx.drawImage(source, 0, 0, w, h);
    }

    try {
      const ctx = scanCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return null;
      const data = ctx.getImageData(0, 0, w, h).data;
      let minY = h, maxY = 0, minX = w, maxX = 0;
      let nonTransparentCount = 0;
      const totalPixels = Math.floor(h / 4) * Math.floor(w / 4);

      for (let y = 0; y < h; y += 4) {
        for (let x = 0; x < w; x += 4) {
          if (data[(y * w + x) * 4 + 3] > 60) {
            nonTransparentCount++;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
          }
        }
      }

      // If nearly all pixels are non-transparent (raw photo before background cutout),
      // provide standard portrait head framing
      if (nonTransparentCount > totalPixels * 0.85 || minY >= maxY || minX >= maxX) {
        const scaleX = srcW / w;
        const scaleY = srcH / h;
        return {
          x: Math.round(w * 0.25 * scaleX),
          y: Math.round(h * 0.08 * scaleY),
          width: Math.round(w * 0.50 * scaleX),
          height: Math.round(h * 0.45 * scaleY),
        };
      }

      const subH = maxY - minY;
      const subW = maxX - minX;

      // RULE F: Full-body photo check:
      if (subH > subW * 1.6 || (subH > h * 0.72 && subW < w * 0.55)) {
        return null;
      }

      // Check for head region at the top
      const topQuarterH = Math.round(subH * 0.35);
      let topPixels = 0;
      for (let y = minY; y < minY + topQuarterH; y += 4) {
        for (let x = minX; x < maxX; x += 4) {
          if (data[(y * w + x) * 4 + 3] > 60) {
            topPixels++;
          }
        }
      }

      const scaleX = srcW / w;
      const scaleY = srcH / h;
      return {
        x: Math.round((minX + subW * 0.15) * scaleX),
        y: Math.round(minY * scaleY),
        width: Math.round((subW * 0.7) * scaleX),
        height: Math.round((subH * 0.45) * scaleY),
      };
    } catch (_) {}
    return null;
  };

  const autoAlignBiometric = useCallback(async (
    cause: 'cutout-ready' | 'preset-change' | 'button' | 'new-photo' | 'reset-button' = 'button',
    targetRequestId?: number
  ) => {
    if (targetRequestId !== undefined && targetRequestId !== activeRequestIdRef.current) {
      return;
    }

    const source = cachedCutoutCanvasRef.current || imageElementRef.current;
    if (!source) return;

    const face = await detectFaceBounds(source);
    if (targetRequestId !== undefined && targetRequestId !== activeRequestIdRef.current) {
      return;
    }

    const srcW = 'naturalWidth' in source ? (source.naturalWidth || source.width) : source.width;
    const srcH = 'naturalHeight' in source ? (source.naturalHeight || source.height) : source.height;

    if (!face) {
      setFaceDetected(false);
      setDebugStats((prev) => ({
        ...prev,
        lastAlignCause: cause,
      }));
      if (cause === 'button') {
        toast.warning('Face not detected - drag/zoom the photo so your face is inside the guide');
      }
      return;
    }

    setFaceDetected(true);
    const targetHeadH = activePreset.heightPx * (activePreset.biometricSpec.headHeightPercent / 100);
    const faceHInPreset = face.height * (activePreset.heightPx / srcH);
    let targetZoom = Math.max(0.6, Math.min(2.5, targetHeadH / Math.max(40, faceHInPreset)));

    // Biometric margins check: crown, chin, and ears margin >= 2% (0.02)
    // If crown or chin or ears clip the canvas at targetZoom, cap the zoom to fit the head
    const crownMargin = face.y / srcH;
    const chinMargin = (srcH - (face.y + face.height)) / srcH;
    const leftEarMargin = face.x / srcW;
    const rightEarMargin = (srcW - (face.x + face.width)) / srcW;

    let tooClose = false;
    if (crownMargin < 0.02 || chinMargin < 0.02 || leftEarMargin < 0.02 || rightEarMargin < 0.02) {
      // Prioritize showing full head inside frame over enforcing oversized targetHeadH
      const maxFitZoom = Math.min(
        (activePreset.heightPx * 0.94) / Math.max(40, faceHInPreset),
        targetZoom
      );
      if (maxFitZoom < targetZoom) {
        targetZoom = Math.max(0.6, maxFitZoom);
        tooClose = true;
      }
    }
    setIsTooCloseWarning(tooClose);

    const calculatedZoom = Math.round(targetZoom * 100) / 100;
    setBaselineZoom(calculatedZoom);
    setZoom(calculatedZoom);

    const faceCenterX = (face.x + face.width / 2) / srcW;
    setPanX(-Math.round((faceCenterX - 0.5) * previewDimensions.width));

    const crownY = face.y / srcH;
    const targetCrown = (activePreset.biometricSpec.topMarginPercent ?? 10) / 100;
    setPanY(-Math.round((crownY - targetCrown) * previewDimensions.height));

    setDebugStats((prev) => ({
      ...prev,
      lastAlignCause: cause,
      zoomDisplay: `100% (${calculatedZoom.toFixed(2)}x)`,
    }));

    if (cause === 'new-photo') {
      toast.success('Photo fitted automatically. Tap Adjust to fine-tune.');
    } else if (cause === 'button') {
      toast.success('Biometric auto-alignment applied.');
    }
  }, [activePreset, previewDimensions]);

  // STEP 1 — Background Removal & Subject Separation ON FULL ORIGINAL PHOTO
  // Runs ONCE per unique photo hash (never on color or transform changes)
  const processSubjectCutout = useCallback(async (forceRetry: boolean = false, targetRequestId?: number) => {
    const currentRequestId = targetRequestId ?? activeRequestIdRef.current;
    if (currentRequestId !== activeRequestIdRef.current) return;

    const img = imageElementRef.current;
    if (!img || !img.complete || img.naturalWidth === 0) return;

    // 1. Offscreen canvas for the full original image (max 1600px for crispness and speed)
    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;
    let procW = naturalW;
    let procH = naturalH;
    const maxDim = 1600;
    if (procW > maxDim || procH > maxDim) {
      const ratio = Math.min(maxDim / procW, maxDim / procH);
      procW = Math.round(procW * ratio);
      procH = Math.round(procH * ratio);
    }

    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = procW;
    sourceCanvas.height = procH;
    const srcCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
    if (!srcCtx) return;
    srcCtx.drawImage(img, 0, 0, procW, procH);

    // 2. If Background Removal is DISABLED: Cache source photo directly
    if (!enableBgRemoval) {
      if (currentRequestId !== activeRequestIdRef.current) return;
      rawCutoutCanvasRef.current = sourceCanvas;
      cachedCutoutCanvasRef.current = sourceCanvas;
      setSegmentationStatus(null);
      setMattingProgress(null);
      setProcessingStep('done');
      setIsSegmenting(false);
      setMattingState('idle');
      compositeFinalCanvas();
      return;
    }

    // 3. Prepare upload blob and compute SHA-256 hash
    let preparedBlob: Blob;
    try {
      preparedBlob = await prepareUploadBlob(sourceCanvas, 1600);
    } catch {
      preparedBlob = await new Promise<Blob>((res) => sourceCanvas.toBlob((b) => res(b!), 'image/jpeg', 0.9));
    }

    const photoHash = await computeImageSha256(preparedBlob);
    currentPhotoHashRef.current = photoHash;

    // Check SHA-256 in-memory cache
    if (!forceRetry && cutoutCache.has(photoHash)) {
      if (currentRequestId !== activeRequestIdRef.current) return;
      console.log('[passport] cache hit');
      const cachedRaw = cutoutCache.get(photoHash)!;
      rawCutoutCanvasRef.current = cachedRaw;

      const originalBg = sampleOriginalBgColor(srcCtx, procW, procH);
      const refinedCanvas = refineCutoutCanvas(cachedRaw, {
        featherRadius: bgFeather,
        chokeAmount: bgChoke,
        decontaminate: enableDecontamination,
        originalBgColor: originalBg,
      });

      if (currentRequestId !== activeRequestIdRef.current) return;
      cachedCutoutCanvasRef.current = refinedCanvas;
      setSegmentationStatus('Cutout retrieved from cache');
      setIsSegmenting(false);
      setMattingProgress(null);
      setProcessingStep('done');
      setDebugStats((prev) => ({
        ...prev,
        cacheHits: prev.cacheHits + 1,
        cachedHash: photoHash.slice(0, 8),
        lastResult: 'ok',
      }));

      compositeFinalCanvas();
      return;
    }

    if (forceRetry) {
      cutoutCache.delete(photoHash);
    }

    // 4. Run High-Precision AI Portrait Matting (Backend API with automatic on-device fallback)
    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsSegmenting(true);
    setProcessingStep('removing-bg');
    setMattingState('uploading');
    setUploadPercent(0);
    setLastApiError(null);
    setSegmentationStatus('Uploading photo to secure server...');

    const startTime = performance.now();
    const uploadKb = Math.round(preparedBlob.size / 1024);

    try {
      const result = await removeBackground(preparedBlob, {
        signal: abortController.signal,
        forceOnDevice,
        onUploadProgress: (pct) => {
          if (currentRequestId !== activeRequestIdRef.current) return;
          setUploadPercent(pct);
          if (pct >= 99) {
            setMattingState('processing');
            setSegmentationStatus('Removing background... usually a few seconds');
          }
        },
        onStatusChange: (statusText) => {
          if (currentRequestId !== activeRequestIdRef.current) return;
          setSegmentationStatus(statusText);
        },
        onFallback: () => {
          if (currentRequestId !== activeRequestIdRef.current) return;
          toast.info('Using on-device mode (Compixor IS-Net)...');
        },
      });

      if (currentRequestId !== activeRequestIdRef.current) return;

      const durationMs = Math.round(performance.now() - startTime);

      if (result.mode === 'server') {
        requestCountRef.current += 1;
        const reqNum = requestCountRef.current;
        console.log(`[passport] API call #${reqNum} ${durationMs}ms ${uploadKb}KB`);
      }

      const cutoutImg = new Image();
      const blobUrl = URL.createObjectURL(result.blob);
      try {
        await new Promise<void>((resolve, reject) => {
          cutoutImg.onload = () => resolve();
          cutoutImg.onerror = reject;
          cutoutImg.src = blobUrl;
        });
      } finally {
        URL.revokeObjectURL(blobUrl);
      }

      if (currentRequestId !== activeRequestIdRef.current) return;

      const rawCutoutCanvas = document.createElement('canvas');
      rawCutoutCanvas.width = procW;
      rawCutoutCanvas.height = procH;
      const rcCtx = rawCutoutCanvas.getContext('2d', { willReadFrequently: true });
      rcCtx?.drawImage(cutoutImg, 0, 0, procW, procH);

      // Save into cache keyed by SHA-256
      cutoutCache.set(photoHash, rawCutoutCanvas);
      rawCutoutCanvasRef.current = rawCutoutCanvas;

      // STEP 4: Intermediate Canvas Alpha Mask Smoothing, Edge Feathering & Decontamination
      setProcessingStep('compositing');
      setSegmentationStatus('Smoothing & Decontaminating Boundary...');

      const originalBg = sampleOriginalBgColor(srcCtx, procW, procH);
      const refinedCanvas = refineCutoutCanvas(rawCutoutCanvas, {
        featherRadius: bgFeather,
        chokeAmount: bgChoke,
        decontaminate: enableDecontamination,
        originalBgColor: originalBg,
      });

      if (currentRequestId !== activeRequestIdRef.current) return;

      cachedCutoutCanvasRef.current = refinedCanvas;
      setSegmentationStatus('Biometric Cutout Ready');

      setDebugStats((prev) => ({
        ...prev,
        requestsSent: prev.requestsSent + (result.mode === 'server' ? 1 : 0),
        lastDurationMs: durationMs,
        lastUploadedKb: uploadKb,
        lastResult: result.mode === 'server' ? 'ok' : 'fallback',
        mode: result.mode,
        cachedHash: photoHash.slice(0, 8),
      }));

      // NOTE: Auto-framing already ran on raw image on load! Do not jump/overwrite user adjustments.
    } catch (err: any) {
      if (currentRequestId !== activeRequestIdRef.current || err?.name === 'AbortError') return;
      console.error('[PassportStudio] Matting error:', err);
      setMattingState('error');
      setLastApiError(err?.message || 'Background removal failed');
      setDebugStats((prev) => ({ ...prev, lastResult: 'error' }));
      rawCutoutCanvasRef.current = sourceCanvas;
      cachedCutoutCanvasRef.current = sourceCanvas;
      setSegmentationStatus('Cutout fallback active');
      toast.error(err?.message || 'Processing failed. You can retry or switch to on-device mode.');
    } finally {
      if (currentRequestId === activeRequestIdRef.current) {
        setIsSegmenting(false);
        setMattingProgress(null);
        setProcessingStep('done');
        compositeFinalCanvas();
      }
    }
  }, [
    enableBgRemoval,
    forceOnDevice,
    bgFeather,
    bgChoke,
    enableDecontamination,
    compositeFinalCanvas,
  ]);

  // Instant re-refining when edge sliders (feather / choke / decontamination) are tweaked
  const handleRefineEdgeSettings = useCallback(() => {
    if (!rawCutoutCanvasRef.current || !enableBgRemoval) return;
    requestAnimationFrame(() => {
      if (!rawCutoutCanvasRef.current) return;
      const refined = refineCutoutCanvas(rawCutoutCanvasRef.current, {
        featherRadius: bgFeather,
        chokeAmount: bgChoke,
        decontaminate: enableDecontamination,
      });
      cachedCutoutCanvasRef.current = refined;
      compositeFinalCanvas();
    });
  }, [bgFeather, bgChoke, enableDecontamination, enableBgRemoval, compositeFinalCanvas]);

  useEffect(() => {
    if (rawCutoutCanvasRef.current && enableBgRemoval) {
      handleRefineEdgeSettings();
    }
  }, [bgFeather, bgChoke, enableDecontamination, handleRefineEdgeSettings]);

  // Re-run Step 1 ONLY when raw image or background removal toggle changes (NEVER on transform sliders)
  useEffect(() => {
    const key = `${imageSrc}_${enableBgRemoval}_${forceOnDevice}`;
    if (imageElementRef.current && imageElementRef.current.complete && lastProcessedKeyRef.current !== key) {
      lastProcessedKeyRef.current = key;
      processSubjectCutout(false, activeRequestIdRef.current);
    }
  }, [imageSrc, enableBgRemoval, forceOnDevice, processSubjectCutout]);

  // Render Printable Tiled Sheet Canvas
  const renderPrintSheetCanvas = useCallback(() => {
    const sheetCanvas = sheetCanvasRef.current;
    const photoCanvas = canvasRef.current;
    if (!sheetCanvas || !photoCanvas) return;

    // Delegated V2 Studio Sheets ('a6-2' and 'a5-6')
    if (sheetPreset === 'a6-2' || sheetPreset === 'a5-6') {
      renderStudioSheetToCanvas(
        sheetCanvas,
        photoCanvas,
        sheetPreset,
        activePreset.widthMm,
        activePreset.heightMm,
        activePreset.name
      );
      return;
    }

    let sheetW = 2480; // A4 @ 300 DPI
    let sheetH = 3508;
    let defaultCols = 2;
    let defaultRows = 5;


    if (sheetPreset === '3-per-a4') {
      sheetW = 2480;
      sheetH = 1169;
      defaultCols = 3;
      defaultRows = 2;
    } else if (sheetPreset === 'custom') {
      defaultCols = Math.max(1, customSheetCols);
      defaultRows = Math.max(1, customSheetRows);
    }

    sheetCanvas.width = sheetW;
    sheetCanvas.height = sheetH;
    const sCtx = sheetCanvas.getContext('2d');
    if (!sCtx) return;

    // Solid white sheet background
    sCtx.fillStyle = '#ffffff';
    sCtx.fillRect(0, 0, sheetW, sheetH);

    const marginX = Math.round(sheetW * 0.05);
    const marginY = Math.round(sheetH * 0.05);
    const gutterX = Math.round(sheetW * 0.025);
    const gutterY = Math.round(sheetH * 0.02);

    const availableW = sheetW - marginX * 2;
    const availableH = sheetH - marginY * 2 - 50;

    let cols = defaultCols;
    let rows = defaultRows;

    if (sheetPreset === 'a4') {
      if (activePreset.widthMm <= 35) {
        cols = 4;
        rows = 6;
      } else if (activePreset.widthMm <= 51) {
        cols = 3;
        rows = 4;
      } else {
        cols = 2;
        rows = 3;
      }
    }

    let tileW = Math.floor((availableW - (cols - 1) * gutterX) / cols);
    let tileH = Math.floor(tileW / activePreset.aspectRatio);

    if (tileH * rows + (rows - 1) * gutterY > availableH) {
      tileH = Math.floor((availableH - (rows - 1) * gutterY) / rows);
      tileW = Math.floor(tileH * activePreset.aspectRatio);
    }

    const gridW = cols * tileW + (cols - 1) * gutterX;
    const gridH = rows * tileH + (rows - 1) * gutterY;
    const startX = Math.floor((sheetW - gridW) / 2);
    const startY = Math.floor((sheetH - 50 - gridH) / 2);

    // Render tiles and crop guides
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * (tileW + gutterX);
        const y = startY + r * (tileH + gutterY);

        // Draw photo
        sCtx.drawImage(photoCanvas, x, y, tileW, tileH);

        // Thin cutting border (~1.5px)
        sCtx.strokeStyle = '#94a3b8';
        sCtx.lineWidth = 1.5;
        sCtx.strokeRect(x, y, tileW, tileH);

        // Corner crop marks
        const tickLen = 14;
        sCtx.strokeStyle = '#475569';
        sCtx.lineWidth = 2;

        sCtx.beginPath();
        sCtx.moveTo(x - tickLen, y);
        sCtx.lineTo(x, y);
        sCtx.lineTo(x, y - tickLen);
        sCtx.stroke();

        sCtx.beginPath();
        sCtx.moveTo(x + tileW + tickLen, y);
        sCtx.lineTo(x + tileW, y);
        sCtx.lineTo(x + tileW, y - tickLen);
        sCtx.stroke();

        sCtx.beginPath();
        sCtx.moveTo(x - tickLen, y + tileH);
        sCtx.lineTo(x, y + tileH);
        sCtx.lineTo(x, y + tileH + tickLen);
        sCtx.stroke();

        sCtx.beginPath();
        sCtx.moveTo(x + tileW + tickLen, y + tileH);
        sCtx.lineTo(x + tileW, y + tileH);
        sCtx.lineTo(x + tileW, y + tileH + tickLen);
        sCtx.stroke();
      }
    }

    sCtx.font = '22px Inter, sans-serif';
    sCtx.fillStyle = '#64748b';
    sCtx.textAlign = 'center';
    sCtx.fillText(
      `CompixorAi Passport Studio • ${activePreset.name} (${cols * rows} Photos) • Print at 100% Scale / 300 DPI`,
      sheetW / 2,
      sheetH - 24
    );
  }, [activePreset, sheetPreset, customSheetCols, customSheetRows]);

  // Re-run Step 2 (instant 60 FPS compositing) when ANY transform or styling setting changes
  useEffect(() => {
    compositeFinalCanvas();
    if (currentStep === 'preview') {
      renderPrintSheetCanvas();
    }
  }, [compositeFinalCanvas, currentStep, renderPrintSheetCanvas]);

  // Handle image drop with 15 MB / 100 MP limit and 2400px working copy generator
  const handleFileDrop = useCallback(async (file: File) => {
    // 1. Versioning: abort previous and increment activeRequestId
    abortControllerRef.current?.abort();
    const requestId = ++activeRequestIdRef.current;

    // 2. Atomic state reset for new photo (NO toast here!)
    cachedCutoutCanvasRef.current = null;
    rawCutoutCanvasRef.current = null;
    currentPhotoHashRef.current = null;
    lastProcessedKeyRef.current = null;
    hasAutoAlignedRef.current = false;
    clearTransformState();
    setIsSegmenting(true);
    setMattingState('uploading');
    setUploadPercent(0);
    setSegmentationStatus('Loading portrait...');
    setLastApiError(null);
    setUploadErrorMessage(null);

    // 3. File size check: up to 15 MB
    const maxBytes = PASSPORT_UPLOAD_CONFIG.MAX_FILE_BYTES;
    if (file.size > maxBytes) {
      if (requestId !== activeRequestIdRef.current) return;
      setIsSegmenting(false);
      const mbSize = (file.size / (1024 * 1024)).toFixed(1);
      const msg = `This file is ${mbSize} MB. The maximum is 15 MB. Please use a smaller photo.`;
      setUploadErrorMessage(msg);
      toast.error(msg);
      setResetSignal((s) => s + 1);
      return;
    }

    // 4. Format check
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const isHeic =
      file.name.toLowerCase().endsWith('.heic') ||
      file.name.toLowerCase().endsWith('.heif') ||
      file.type === 'image/heic' ||
      file.type === 'image/heif';

    if (isHeic) {
      // Clear guidance for iPhone HEIC images (or dynamic converter if available)
      try {
        // Dynamic import using Function to prevent TypeScript compile-time module resolution failure
        const dynamicImport = new Function('specifier', 'return import(specifier)');
        const heicModule = await dynamicImport('heic2any');
        const heic2any = heicModule.default || heicModule;
        if (requestId !== activeRequestIdRef.current) return;
        toast.info('Converting iPhone HEIC photo...');
        const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.95 });
        if (requestId !== activeRequestIdRef.current) return;
        const finalBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        file = new File([finalBlob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
      } catch {
        if (requestId !== activeRequestIdRef.current) return;
        setIsSegmenting(false);
        const msg = 'HEIC photos are not supported yet. On iPhone choose Most Compatible, or export as JPG.';
        setUploadErrorMessage(msg);
        toast.error(msg);
        setResetSignal((s) => s + 1);
        return;
      }
    } else if (!validTypes.includes(file.type) && !file.type.startsWith('image/')) {
      if (requestId !== activeRequestIdRef.current) return;
      setIsSegmenting(false);
      const msg = 'Please upload a JPG, PNG or WebP photo.';
      setUploadErrorMessage(msg);
      toast.error(msg);
      setResetSignal((s) => s + 1);
      return;
    }

    // 5. Pre-decode header dimension check (reject if > 100 MP)
    try {
      const headerInfo = await parseImageHeaderDimensions(file);
      if (requestId !== activeRequestIdRef.current) return;
      if (headerInfo) {
        const mp = (headerInfo.width * headerInfo.height) / 1_000_000;
        if (mp > PASSPORT_UPLOAD_CONFIG.MAX_MEGAPIXELS) {
          setIsSegmenting(false);
          const msg = `This photo is ${headerInfo.width} x ${headerInfo.height} px (${Math.round(mp)} MP). The maximum is 100 MP.`;
          setUploadErrorMessage(msg);
          toast.error(msg);
          setResetSignal((s) => s + 1);
          return;
        }
      }
    } catch (_) {}

    // 6. Create working copy (longest side <= 2400px)
    try {
      const working = await createPassportWorkingCopy(file);
      if (requestId !== activeRequestIdRef.current) return;

      const img = new Image();
      img.onload = async () => {
        if (requestId !== activeRequestIdRef.current) return;
        imageElementRef.current = img;
        setImageSrc(working.dataUrl);
        setCurrentStep('edit');
        setUploadErrorMessage(null);
        toast.success('Photo loaded! Align your portrait with the biometric guide.');

        // Immediately auto-frame on raw photo so canvas has correct positioning before matting finishes
        await autoAlignBiometric('new-photo', requestId);
        if (requestId !== activeRequestIdRef.current) return;
        compositeFinalCanvas();
      };
      img.onerror = () => {
        if (requestId !== activeRequestIdRef.current) return;
        setIsSegmenting(false);
        const msg = 'Your photo could not be read. Please try saving it again as a standard JPG or PNG.';
        setUploadErrorMessage(msg);
        toast.error(msg);
        setResetSignal((s) => s + 1);
      };
      img.src = working.dataUrl;
    } catch (err) {
      if (requestId !== activeRequestIdRef.current) return;
      setIsSegmenting(false);
      console.error('Working copy error:', err);
      const msg = 'Your photo could not be read. Please try saving it again as a standard JPG or PNG.';
      setUploadErrorMessage(msg);
      toast.error(msg);
      setResetSignal((s) => s + 1);
    }
  }, [clearTransformState, autoAlignBiometric, compositeFinalCanvas]);

  // Pan interactions (Desktop & Adjust mode)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageSrc || !isAdjustMode) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isAdjustMode) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel zoom (only in adjust mode or active canvas)
  useEffect(() => {
    const el = previewBoxRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (!imageSrc || !isAdjustMode) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setZoom((z) => Math.min(Math.max(0.4, z + delta), 3.0));
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [imageSrc, isAdjustMode]);

  // Touch handlers (Drag & Pinch - only active when Adjust Position mode is on)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!imageSrc || !isAdjustMode) return;
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - panX, y: e.touches[0].clientY - panY });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartDistRef.current = dist;
      pinchStartZoomRef.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!imageSrc || !isAdjustMode) return;
    if (e.touches.length === 1 && isDragging) {
      e.preventDefault();
      setPanX(e.touches[0].clientX - dragStart.x);
      setPanY(e.touches[0].clientY - dragStart.y);
    } else if (e.touches.length === 2 && pinchStartDistRef.current !== null) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = dist / pinchStartDistRef.current;
      const newZoom = Math.min(Math.max(0.4, pinchStartZoomRef.current * scale), 3.0);
      setZoom(Math.round(newZoom * 100) / 100);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    pinchStartDistRef.current = null;
  };

  // Deterministic user-initiated Reset
  const handleReset = useCallback(async () => {
    clearTransformState();
    await autoAlignBiometric('reset-button', activeRequestIdRef.current);
    toast.info('Scale settings reset to default.');
  }, [clearTransformState, autoAlignBiometric]);

  // Reset whole project and start new
  const handleMakeNewImage = useCallback(() => {
    abortControllerRef.current?.abort();
    activeRequestIdRef.current += 1;
    setImageSrc(null);
    imageElementRef.current = null;
    rawCutoutCanvasRef.current = null;
    cachedCutoutCanvasRef.current = null;
    currentPhotoHashRef.current = null;
    lastProcessedKeyRef.current = null;
    hasAutoAlignedRef.current = false;
    setFaceDetected(null);
    setIsSegmenting(false);
    setMattingProgress(null);
    setUploadErrorMessage(null);
    clearTransformState();
    setCurrentStep('edit');
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('step')) {
        params.delete('step');
        const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
        window.history.pushState({}, '', newUrl);
      }
    }
  }, [clearTransformState]);

  // Binary search compression helper to strictly meet target file size limits
  const compressCanvasToLimit = async (canvas: HTMLCanvasElement, maxBytes: number): Promise<Blob> => {
    const format = bgColor === 'transparent' || previewTab === 'cutout' ? 'image/png' : 'image/jpeg';
    const toBlobPromise = (q: number): Promise<Blob> =>
      new Promise((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))), format, q);
      });

    if (maxBytes <= 0 || format === 'image/png') {
      return toBlobPromise(0.98);
    }

    let minQ = 0.15;
    let maxQ = 0.98;
    let bestBlob: Blob = await toBlobPromise(0.15);

    for (let i = 0; i < 6; i++) {
      const midQ = (minQ + maxQ) / 2;
      const blob = await toBlobPromise(midQ);

      if (blob.size <= maxBytes) {
        bestBlob = blob;
        minQ = midQ;
      } else {
        maxQ = midQ;
      }
    }

    return bestBlob;
  };

  // Export Single Photo
  const downloadSinglePhoto = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    incrementFilesDone();

    const limitConfig = sizeLimitOptions.find((o) => o.id === selectedSizeLimit) ?? sizeLimitOptions[0];
    const blob = await compressCanvasToLimit(canvas, limitConfig.maxBytes);
    const isPng = bgColor === 'transparent' || previewTab === 'cutout';
    const ext = isPng ? 'png' : 'jpg';

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `passport-photo-${activePreset.id}-${Math.round(blob.size / 1024)}KB.${ext}`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Photo downloaded! (${Math.round(blob.size / 1024)} KB)`);
  };

  // Export Printable Multi-Sheet (async toBlob — non-blocking, with 300 DPI metadata injection)
  const downloadPrintableSheet = async (formatOverride?: 'jpg' | 'pdf') => {
    const sheetCanvas = sheetCanvasRef.current;
    if (!sheetCanvas) return;

    // Handle PDF export for A6 and A5
    if (formatOverride === 'pdf') {
      try {
        setIsDownloading(true);
        toast.info('Generating studio PDF document...');
        const singlePhotoCanvas = canvasRef.current;
        if (!singlePhotoCanvas) {
          toast.error('Photo canvas not ready');
          setIsDownloading(false);
          return;
        }
        const photoDataUrl = singlePhotoCanvas.toDataURL(bgColor === 'transparent' ? 'image/png' : 'image/jpeg', 0.98);
        const pdfBytes = await generateStudioPdf(
          photoDataUrl,
          sheetPreset as 'a6-2' | 'a5-6',
          activePreset.widthMm,
          activePreset.heightMm,
          activePreset.name
        );
        const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
        incrementFilesDone();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const count = layoutV2.actualCount;
        const paper = sheetPreset === 'a6-2' ? 'A6' : 'A5';
        const countrySlug = activePreset.country.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        link.download = `passport-sheet-${count}x-${activePreset.widthMm}x${activePreset.heightMm}mm-${paper}-${countrySlug}.pdf`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsDownloading(false);
        toast.success('✅ Vector PDF downloaded! Print at 100% / Actual size.');
        return;
      } catch (err) {
        console.error('PDF export error:', err);
        toast.error('Failed to generate PDF');
        setIsDownloading(false);
        return;
      }
    }

    setIsDownloading(true);
    toast.info('Preparing your print sheet...');

    // toBlob is async and non-blocking
    sheetCanvas.toBlob(
      async (blob) => {
        if (!blob) {
          toast.error('Sheet export failed. Please try again.');
          setIsDownloading(false);
          return;
        }

        // If A6 or A5, inject 300 DPI JFIF metadata into JPEG bytes
        let finalBlob = blob;
        if (sheetPreset === 'a6-2' || sheetPreset === 'a5-6') {
          const rawBuffer = new Uint8Array(await blob.arrayBuffer());
          const withDpi = injectJpegDpi300(rawBuffer);
          finalBlob = new Blob([withDpi.buffer as ArrayBuffer], { type: 'image/jpeg' });
        }

        incrementFilesDone();
        const url = URL.createObjectURL(finalBlob);
        const link = document.createElement('a');
        if (sheetPreset === 'a6-2' || sheetPreset === 'a5-6') {
          const count = layoutV2.actualCount;
          const paper = sheetPreset === 'a6-2' ? 'A6' : 'A5';
          const countrySlug = activePreset.country.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          link.download = `passport-sheet-${count}x-${activePreset.widthMm}x${activePreset.heightMm}mm-${paper}-${countrySlug}.jpg`;
        } else {
          link.download = `passport-print-sheet-${sheetPreset}-${activePreset.id}.jpg`;
        }

        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsDownloading(false);
        toast.success(`✅ Print sheet downloaded! Print at 100% scale for correct sizing.`);
      },
      'image/jpeg',
      0.97
    );
  };

  // Layout calculations for V2 studio sheets
  const layoutV2 = useMemo(() => {
    if (sheetPreset === 'a6-2' || sheetPreset === 'a5-6') {
      return computeStudioLayout(sheetPreset, activePreset.widthMm, activePreset.heightMm);
    }
    return {
      sheetW: 2480,
      sheetH: 3508,
      photoW: 413,
      photoH: 531,
      cols: 2,
      rows: 5,
      actualCount: 6,
      targetCount: 6,
      fitsRequested: true,
      positions: [],
    };
  }, [sheetPreset, activePreset.widthMm, activePreset.heightMm]);

  // Computed count of sheet photos
  const sheetPhotoCount = useMemo(() => {
    if (sheetPreset === 'a6-2' || sheetPreset === 'a5-6') {
      return layoutV2.actualCount;
    }
    if (sheetPreset === 'a4') {
      if (activePreset.widthMm <= 35) return 24;
      if (activePreset.widthMm <= 51) return 12;
      return 6;
    }
    if (sheetPreset === '3-per-a4') return 6;
    return customSheetCols * customSheetRows;
  }, [sheetPreset, activePreset.widthMm, customSheetCols, customSheetRows, layoutV2.actualCount]);


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Fullscreen Drop Anywhere Drag & Drop Overlay */}
      <DropAnywhere
        onFileDrop={handleFileDrop}
        accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
        title="Drop image anywhere"
        subtitle="to open in Passport Biometric Studio"
      />

      {/* Header */}
      <motion.div
        className="text-center max-w-3xl mx-auto mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Victory / Transformation Preview Card (Messy Selfie → Official Biometric ID) */}
        <div className="w-full flex justify-center mb-6 select-none pointer-events-none">
          <div className="p-3 sm:p-4 rounded-3xl bg-white/60 dark:bg-zinc-900/60 border border-emerald-500/20 dark:border-emerald-500/30 shadow-lg backdrop-blur-md flex items-center justify-center gap-4 sm:gap-6">
            {/* Left: Messy Casual Selfie (Problem) */}
            <div className="flex flex-col items-center space-y-1">
              <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl bg-red-500/10 border-2 border-dashed border-red-400 relative overflow-hidden flex flex-col items-center justify-center p-1.5">
                <div className="w-12 h-14 bg-zinc-300 dark:bg-zinc-700 rounded-t-lg relative flex flex-col items-center justify-start pt-1.5 overflow-hidden">
                  <div className="w-5 h-5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                  <div className="w-9 h-7 bg-zinc-400 dark:bg-zinc-500 rounded-t-lg mt-1" />
                  {/* Bad crop indicator */}
                  <div className="absolute inset-x-0 top-1 h-0.5 bg-red-500/80" />
                  <div className="absolute inset-x-0 bottom-2 h-0.5 bg-red-500/80" />
                </div>
              </div>
              <span className="text-[10px] font-semibold text-red-500">Uncalibrated</span>
            </div>

            {/* Center Arrow */}
            <div className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-black text-sm">
              &rarr;
            </div>

            {/* Right: Official Biometric 35x45mm Clean Studio Photo (Victory) */}
            <div className="flex flex-col items-center space-y-1">
              <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-blue-500/20 border-2 border-emerald-500 relative flex items-center justify-center p-1.5 shadow-md">
                <div className="w-12 h-15 rounded-md bg-white shadow-sm border border-emerald-500/40 relative flex flex-col items-center justify-start pt-1.5 overflow-hidden">
                  {/* Studio blue gradient shirt + calibrated head */}
                  <div className="w-5 h-5 rounded-full bg-zinc-800" />
                  <div className="w-9 h-7 bg-emerald-700 rounded-t-lg mt-1" />
                  {/* Biometric head guidelines */}
                  <div className="absolute inset-1 rounded-full border border-dashed border-emerald-500/50 pointer-events-none" />
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">100% Compliant</span>
            </div>
          </div>
        </div>

        {/* Animated Badge Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 mb-4 animate-float-subtle shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-spin-slow" />
          AI Portrait Matting &amp; Biometric Studio
        </div>

        {/* H1 with Emerald-Teal-Blue Gradient + Floating Particles */}
        <div className="relative inline-block mb-4">
          <div className="absolute -top-3 -left-5 w-2 h-2 rounded-full bg-emerald-400/80 animate-pulse" />
          <div className="absolute -top-2 -right-5 w-1.5 h-1.5 rounded-full bg-teal-400/80 animate-pulse" style={{ animationDelay: '0.6s' }} />
          <div className="absolute -bottom-1 left-1/3 w-1.5 h-1.5 rounded-full bg-blue-400/70 animate-pulse" style={{ animationDelay: '1.2s' }} />
          <Sparkles className="absolute -top-6 right-1 w-4 h-4 text-emerald-400/70 animate-spin-slow" />

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-zinc-900 dark:text-white">
            <span className="bg-gradient-to-r from-emerald-400 via-teal-500 to-blue-500 bg-clip-text text-transparent">
              Free Passport Size Photo
            </span>{' '}
            Maker Online
          </h1>
        </div>

        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
          {currentStep === 'edit'
            ? 'AI background removal runs in memory on our secure HTTPS server (nothing stored), with an on-device option available. Create official Pakistan NADRA, US Visa, and biometric ID photos with instant background matting and printable sheets.'
            : 'Your biometric photo is processed and print-ready. Download a single image for online portal submissions or a high-res tiled print sheet with cutting guides.'}
        </p>

        {/* Clean Keyword Badges / Tags (No '#' prefix) */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-2xl mx-auto mt-4">
          {[
            'NADRA 35x45mm',
            'US Visa 2x2"',
            'AI Background Removal',
            '300 DPI Print Sheet',
            'In-Memory Processing',
            'On-Device Option',
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

      {/* STEP 1: STUDIO EDITOR VIEW */}
      {currentStep === 'edit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Side: Controls & Studio Tools (7 cols) */}
          <motion.div
            className="lg:col-span-7 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Preset Selector & Custom Mode Switch */}
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Document Size & Country Format
                </label>
                <button
                  onClick={() => setIsCustomMode(!isCustomMode)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    isCustomMode
                      ? 'bg-brand-500 text-white shadow-glow'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  {isCustomMode ? 'Using Custom Size' : 'Custom Dimensions'}
                </button>
              </div>

              {!isCustomMode ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {standardPresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset)}
                      className={`p-3.5 rounded-xl text-left border transition-all ${
                        selectedPreset.id === preset.id
                          ? 'border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/20 shadow-xs'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white/40 dark:bg-zinc-900/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                          <span>{preset.flag}</span>
                          {preset.name}
                        </span>
                        {selectedPreset.id === preset.id && (
                          <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{preset.description}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                        Unit
                      </label>
                      <select
                        value={customUnit}
                        onChange={(e) => setCustomUnit(e.target.value as any)}
                        className="w-full text-xs font-semibold px-2.5 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                      >
                        <option value="mm">mm (Millimeters)</option>
                        <option value="cm">cm (Centimeters)</option>
                        <option value="inch">in (Inches)</option>
                        <option value="px">px (Pixels)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                        Width ({customUnit})
                      </label>
                      <input
                        type="number"
                        min="1"
                        step={customUnit === 'inch' || customUnit === 'cm' ? '0.1' : '1'}
                        value={customWidth}
                        onChange={(e) => setCustomWidth(parseFloat(e.target.value) || 1)}
                        className="w-full text-xs font-semibold px-2.5 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                        Height ({customUnit})
                      </label>
                      <input
                        type="number"
                        min="1"
                        step={customUnit === 'inch' || customUnit === 'cm' ? '0.1' : '1'}
                        value={customHeight}
                        onChange={(e) => setCustomHeight(parseFloat(e.target.value) || 1)}
                        className="w-full text-xs font-semibold px-2.5 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                        Print DPI
                      </label>
                      <select
                        value={customDpi}
                        onChange={(e) => setCustomDpi(parseInt(e.target.value))}
                        className="w-full text-xs font-semibold px-2.5 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                      >
                        <option value="300">300 DPI (Standard)</option>
                        <option value="600">600 DPI (Ultra High)</option>
                        <option value="150">150 DPI (Web ID)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                    <span>
                      Output Resolution: <strong>{activePreset.widthPx} × {activePreset.heightPx} px</strong>
                    </span>
                    <span>
                      Aspect Ratio: <strong>{activePreset.aspectRatio.toFixed(2)}</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Upload Drop Zone */}
            {!imageSrc ? (
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <FileDropZone
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onFileDrop={handleFileDrop}
                  maxSizeMB={15}
                  resetSignal={resetSignal}
                  title="Upload portrait or selfie"
                  subtitle="JPG, PNG, or WebP up to 15MB. Front-facing with neutral lighting."
                />
                {uploadErrorMessage && (
                  <div
                    data-testid="dropzone-error-banner"
                    className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-700 dark:text-red-300 text-xs flex items-center justify-between gap-2.5 animate-in fade-in"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="font-medium">{uploadErrorMessage}</span>
                    </div>
                    <button
                      onClick={() => setUploadErrorMessage(null)}
                      className="text-red-500 hover:text-red-700 dark:hover:text-red-200 text-xs font-bold underline shrink-0 cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Studio Adjustment Controls */
              <div className="glass-card p-6 rounded-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                  <h3 className="text-sm font-bold font-display text-zinc-900 dark:text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-brand-500" />
                    Studio Adjustments & Tools
                  </h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleReset}
                      disabled={isSegmenting}
                      className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reset
                    </button>
                    <button
                      onClick={handleMakeNewImage}
                      className="text-xs text-brand-500 hover:text-brand-600 font-semibold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Change Photo
                    </button>
                  </div>
                </div>

                {/* Quick Transform & Adjust Position Toolbar */}
                <fieldset disabled={isSegmenting} className={`space-y-6 border-0 p-0 m-0 min-w-0 transition-opacity ${isSegmenting ? 'opacity-60 pointer-events-none select-none' : ''}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsAdjustMode(!isAdjustMode)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer min-h-[38px] ${
                      isAdjustMode
                        ? 'border-brand-500 bg-brand-500/15 text-brand-600 dark:text-brand-300 ring-2 ring-brand-500/25'
                        : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <Move className="w-3.5 h-3.5" />
                    {isAdjustMode ? 'Done Adjusting' : 'Adjust Position (Drag/Pinch)'}
                  </button>
                  <button
                    onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                    className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition cursor-pointer min-h-[38px]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> -90° Rotate
                  </button>
                  <button
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition cursor-pointer min-h-[38px]"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> +90° Rotate
                  </button>
                  <button
                    onClick={() => setFlipH(!flipH)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer min-h-[38px] ${
                      flipH
                        ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-300'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <FlipHorizontal className="w-3.5 h-3.5" /> Mirror Flip
                  </button>
                </div>

                {/* Relative Zoom (100% = Auto-fit baseline) */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <ZoomIn className="w-3.5 h-3.5" /> Zoom Level
                    </span>
                    <span>{Math.round((zoom / (baselineZoom || 1)) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.02"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full slider-blur cursor-pointer"
                  />
                </div>

                {/* Lighting & Color Adjustments (Brightness, Contrast, Saturation) */}
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 bg-zinc-50/60 dark:bg-zinc-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-brand-500" />
                      Lighting &amp; Color
                    </span>
                    {(brightness !== 100 || contrast !== 100 || saturation !== 100) && (
                      <button
                        onClick={() => {
                          setBrightness(100);
                          setContrast(100);
                          setSaturation(100);
                        }}
                        className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                      >
                        Reset lighting
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Brightness */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        <span>Brightness</span>
                        <span className="font-mono text-zinc-900 dark:text-white">{brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="60"
                        max="140"
                        value={brightness}
                        onChange={(e) => setBrightness(parseInt(e.target.value))}
                        className="w-full slider-blur cursor-pointer"
                      />
                    </div>

                    {/* Contrast */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        <span>Contrast</span>
                        <span className="font-mono text-zinc-900 dark:text-white">{contrast}%</span>
                      </div>
                      <input
                        type="range"
                        min="60"
                        max="140"
                        value={contrast}
                        onChange={(e) => setContrast(parseInt(e.target.value))}
                        className="w-full slider-blur cursor-pointer"
                      />
                    </div>

                    {/* Saturation */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        <span>Saturation</span>
                        <span className="font-mono text-zinc-900 dark:text-white">{saturation}%</span>
                      </div>
                      <input
                        type="range"
                        min="60"
                        max="140"
                        value={saturation}
                        onChange={(e) => setSaturation(parseInt(e.target.value))}
                        className="w-full slider-blur cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* 2-Step AI Matting & Background Engine */}
                <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-brand-500" />
                      Background removal & colour
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableBgRemoval}
                        onChange={(e) => setEnableBgRemoval(e.target.checked)}
                        className="rounded text-brand-500 focus:ring-brand-500"
                      />
                      <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                        Remove background automatically (AI)
                      </span>
                    </label>
                  </div>

                  {enableBgRemoval && (
                    <div className="space-y-4">
                      {/* Compixor AI Cutout Mode Tabs: Cutout (Checkerboard) vs Background (Solid) */}
                      <div className="flex items-center gap-2 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                        <button
                          onClick={() => setPreviewTab('cutout')}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                            previewTab === 'cutout'
                              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                          }`}
                        >
                          <Scissors className="w-3.5 h-3.5 text-brand-500" />
                          Cutout (Transparent PNG)
                        </button>
                        <button
                          onClick={() => setPreviewTab('background')}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                            previewTab === 'background'
                              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                          }`}
                        >
                          <Palette className="w-3.5 h-3.5 text-emerald-500" />
                          Color Background
                        </button>
                      </div>

                      {/* Solid & Gradient Palette (active when Color Background tab is chosen) */}
                      {previewTab === 'background' && (
                        <div className="space-y-3.5 pt-1">
                          {/* Compliance Warning Note if current color is not accepted for official documents */}
                          {!activePreset.allowedBgColors.includes(bgColor.toLowerCase()) && bgColor !== 'transparent' && (
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                              <span>
                                This colour is not accepted for official {activePreset.country} documents. Use it for personal or social photos.
                              </span>
                            </div>
                          )}

                          {/* Row 1: Recommended for <selected country> */}
                          <div>
                            <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                              Recommended for {activePreset.country}
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                              {classicalColors
                                .filter((c) => activePreset.allowedBgColors.includes(c.value.toLowerCase()))
                                .map((bg) => (
                                  <button
                                    key={`rec-${bg.value}`}
                                    onClick={() => setBgColor(bg.value)}
                                    className={`min-h-[44px] px-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                                      bgColor.toLowerCase() === bg.value.toLowerCase()
                                        ? 'border-brand-500 ring-2 ring-brand-500/30 shadow-xs bg-brand-500/10 text-brand-600 dark:text-brand-300 font-bold'
                                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                    }`}
                                  >
                                    <span className={`w-4 h-4 rounded-full border shadow-2xs ${bg.previewClass}`} />
                                    <span>{bg.label}</span>
                                    {bgColor.toLowerCase() === bg.value.toLowerCase() && (
                                      <Check className="w-3.5 h-3.5 text-brand-500" />
                                    )}
                                  </button>
                                ))}
                            </div>
                          </div>

                          {/* Row 2: More colours (strictly non-duplicate, excluding those already in Recommended) */}
                          <div>
                            <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                              More colours
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                              {classicalColors
                                .filter((c) => !activePreset.allowedBgColors.includes(c.value.toLowerCase()))
                                .map((bg) => (
                                  <button
                                    key={`more-${bg.value}`}
                                    onClick={() => setBgColor(bg.value)}
                                    className={`min-h-[44px] px-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                                      bgColor.toLowerCase() === bg.value.toLowerCase()
                                        ? 'border-brand-500 ring-2 ring-brand-500/30 shadow-xs bg-brand-500/10 text-brand-600 dark:text-brand-300 font-bold'
                                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                    }`}
                                  >
                                    <span className={`w-4 h-4 rounded-full border shadow-2xs ${bg.previewClass}`} />
                                    <span>{bg.label}</span>
                                    {bgColor.toLowerCase() === bg.value.toLowerCase() && (
                                      <Check className="w-3.5 h-3.5 text-brand-500" />
                                    )}
                                  </button>
                                ))}
                            </div>
                          </div>


                          {/* Row 4: Custom Rainbow Tile & Hex Input & History */}
                          <div className="pt-1 flex flex-wrap items-center gap-3">
                            <label
                              className="relative min-h-[44px] px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-brand-500 bg-white dark:bg-zinc-800 flex items-center gap-2.5 cursor-pointer shadow-2xs transition"
                              title="Pick any custom color"
                            >
                              <span
                                className="w-5 h-5 rounded-full border border-zinc-300 dark:border-zinc-600 shrink-0 shadow-2xs"
                                style={{
                                  background: 'conic-gradient(from 180deg, red, yellow, lime, aqua, blue, magenta, red)',
                                }}
                              />
                              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Custom</span>
                              <input
                                type="color"
                                value={bgColor.startsWith('#') ? bgColor : '#ffffff'}
                                onChange={(e) => {
                                  const c = e.target.value.toUpperCase();
                                  setBgColor(c);
                                  setCustomHexInput(c);
                                  addCustomColorToHistory(c);
                                }}
                                className="sr-only"
                              />
                            </label>

                            {/* Hex Text Field */}
                            <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 min-h-[44px]">
                              <span className="text-xs text-zinc-400 font-mono">#</span>
                              <input
                                type="text"
                                maxLength={7}
                                value={customHexInput.replace('#', '')}
                                onChange={(e) => {
                                  const val = '#' + e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
                                  setCustomHexInput(val);
                                  if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                                    setBgColor(val);
                                    addCustomColorToHistory(val);
                                  }
                                }}
                                placeholder="FFFFFF"
                                className="w-20 text-xs font-mono font-bold bg-transparent text-zinc-900 dark:text-white outline-hidden uppercase"
                              />
                            </div>

                            {/* Last 5 Custom Colors from LocalStorage */}
                            {customColorsHistory.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Recent:</span>
                                {customColorsHistory.map((hex, idx) => (
                                  <button
                                    key={`hist-${hex}-${idx}`}
                                    onClick={() => {
                                      setBgColor(hex);
                                      setCustomHexInput(hex);
                                    }}
                                    className="w-7 h-7 rounded-full border border-black/20 shadow-2xs cursor-pointer hover:scale-110 transition shrink-0"
                                    style={{ backgroundColor: hex }}
                                    title={`Recent color: ${hex}`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}


                      {/* Precision Sliders: Soften edges & Trim edge fringe */}
                      <div className="p-3.5 rounded-xl bg-brand-500/5 border border-brand-500/15 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <div className="flex justify-between text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                              <span>Soften edges</span>
                              <span className="font-mono text-brand-600 dark:text-brand-400">{bgFeather.toFixed(1)}px</span>
                            </div>
                            <input
                              type="range"
                              min="0.5"
                              max="2.5"
                              step="0.1"
                              value={bgFeather}
                              onChange={(e) => setBgFeather(parseFloat(e.target.value))}
                              className="w-full slider-blur cursor-pointer"
                              title="Controls Gaussian blur softening on subject contours"
                            />
                            <p className="text-[10px] text-zinc-400 mt-0.5">Smooths hair, neck & shoulder contours</p>
                          </div>
                          <div>
                            <div className="flex justify-between text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                              <span>Trim edge fringe</span>
                              <span className="font-mono text-brand-600 dark:text-brand-400">{bgChoke.toFixed(1)}px</span>
                            </div>
                            <input
                              type="range"
                              min="0.0"
                              max="1.2"
                              step="0.1"
                              value={bgChoke}
                              onChange={(e) => setBgChoke(parseFloat(e.target.value))}
                              className="w-full slider-blur cursor-pointer"
                              title="Insets boundary to remove outer backdrop halo"
                            />
                            <p className="text-[10px] text-zinc-400 mt-0.5">Eliminates outer wall color rim</p>
                          </div>
                        </div>

                        {/* Decontamination Toggle */}
                        <div className="pt-2 border-t border-brand-500/10 flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={enableDecontamination}
                              onChange={(e) => setEnableDecontamination(e.target.checked)}
                              className="rounded text-brand-500 focus:ring-brand-500"
                            />
                            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                              Remove colour halo
                            </span>
                          </label>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            Active
                          </span>
                        </div>
                      </div>

                      {/* Processing Mode & Redo Controls */}
                      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                        {/* Private Mode toggle & Redo Button */}
                        <div className="flex items-center justify-between gap-2">
                          <label
                            className="flex items-center gap-2 cursor-pointer"
                            title="When enabled, background removal runs 100% inside your browser using WebAssembly. No photo data leaves your device."
                          >
                            <input
                              type="checkbox"
                              checked={forceOnDevice}
                              onChange={(e) => setForceOnDevice(e.target.checked)}
                              className="rounded text-brand-500 focus:ring-brand-500"
                            />
                            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                              Private mode: don&apos;t upload my photo
                            </span>
                          </label>

                          <button
                            type="button"
                            onClick={() => processSubjectCutout(true)}
                            disabled={isSegmenting}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer min-h-[36px]"
                          >
                            <RefreshCw className={`w-3 h-3 ${isSegmenting ? 'animate-spin' : ''}`} />
                            Redo background removal
                          </button>
                        </div>

                        {lastApiError && (
                          <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center justify-between gap-2">
                            <span>{lastApiError}</span>
                            <button
                              type="button"
                              onClick={() => processSubjectCutout(true)}
                              className="px-2 py-0.5 rounded bg-red-500 text-white font-bold hover:bg-red-600 transition shrink-0"
                            >
                              Try again
                            </button>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 border-t border-zinc-200 dark:border-zinc-700/60 text-[11px] text-zinc-500 dark:text-zinc-400">
                          <span className="flex items-center gap-1">
                            {isSegmenting ? (
                              <><Loader2 className="w-3 h-3 animate-spin text-brand-500" /> {segmentationStatus || 'Processing...'}</>
                            ) : (
                              <><ShieldCheck className="w-3 h-3 text-emerald-500" /> {segmentationStatus || 'Background removed'}</>
                            )}
                          </span>
                          <span className="font-medium text-zinc-600 dark:text-zinc-300">
                            {previewTab === 'cutout' ? 'Transparent Cutout' : `BG: ${bgColor}`}
                          </span>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              </fieldset>
            </div>
          )}
        </motion.div>

          {/* Right Side: Studio Preview & Biometric Overlay (5 cols) */}
          <motion.div
            className="lg:col-span-5 sticky top-24 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="glass-card p-6 md:p-8 rounded-3xl text-center space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold font-display text-zinc-900 dark:text-white">
                  Biometric Studio Preview
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {activePreset.widthMm} × {activePreset.heightMm} mm
                </span>
              </div>

              {/* Preview Frame with Pan & Zoom */}
              <div
                ref={previewBoxRef}
                className={`relative mx-auto rounded-2xl overflow-hidden shadow-lg border border-zinc-300 dark:border-zinc-700 select-none ${
                  imageSrc && isAdjustMode ? 'cursor-grab active:cursor-grabbing ring-2 ring-brand-500' : ''
                }`}
                style={{
                  width: `${previewDimensions.width}px`,
                  height: `${previewDimensions.height}px`,
                  touchAction: isAdjustMode ? 'none' : 'pan-y',
                  backgroundColor: previewTab === 'cutout' || bgColor === 'transparent' ? '#ffffff' : bgColor,
                  backgroundImage: (previewTab === 'cutout' || bgColor === 'transparent')
                    ? 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)'
                    : 'none',
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
              >
                <canvas ref={canvasRef} className="w-full h-full object-contain block" />

                {/* Honest Loading UX: Overlay shown during removal */}
                {isSegmenting && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 text-white text-center animate-in fade-in duration-200 pointer-events-none">
                    <div className="p-4 rounded-2xl bg-zinc-900/95 border border-white/10 shadow-2xl flex flex-col items-center gap-2.5 max-w-[220px]">
                      <Loader2 className="w-7 h-7 text-brand-400 animate-spin" />
                      {mattingState === 'uploading' ? (
                        <div className="w-full space-y-1.5">
                          <p className="text-xs font-bold text-zinc-100 leading-tight">
                            Uploading photo ({uploadPercent}%)...
                          </p>
                          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-brand-500 h-full rounded-full transition-all duration-200"
                              style={{ width: `${uploadPercent}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs font-bold text-zinc-100 leading-tight">
                          Removing background... usually a few seconds
                        </p>
                      )}
                      <span className="text-[9px] text-zinc-400">Compixor AI Secure Processing</span>
                    </div>
                  </div>
                )}

                {!imageSrc && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
                    {/* Authentic Biometric Sample Portrait */}
                    {/* Generic Passport Photo Illustration — no real person */}
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-sky-50 to-white dark:from-zinc-900 dark:to-zinc-950">
                      <svg
                        viewBox="0 0 200 260"
                        className="w-3/4 h-3/4 opacity-80 dark:opacity-60"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* Clean White Background */}
                        <rect width="200" height="260" fill="white" rx="8" />
                        {/* Head / Hair silhouette */}
                        <ellipse cx="100" cy="88" rx="44" ry="52" fill="#cbd5e1" />
                        {/* Face */}
                        <ellipse cx="100" cy="100" rx="36" ry="44" fill="#e2e8f0" />
                        {/* Neck */}
                        <rect x="88" y="140" width="24" height="20" rx="4" fill="#e2e8f0" />
                        {/* Shoulders / formal top */}
                        <path d="M40,170 Q100,200 160,170 L175,260 L25,260 Z" fill="#94a3b8" />
                        {/* Shirt collar */}
                        <polygon points="100,160 86,175 100,195 114,175" fill="#f8fafc" />
                        {/* Eyes */}
                        <ellipse cx="86" cy="95" rx="5" ry="3.5" fill="#94a3b8" />
                        <ellipse cx="114" cy="95" rx="5" ry="3.5" fill="#94a3b8" />
                        {/* Neutral mouth */}
                        <line x1="90" y1="118" x2="110" y2="118" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
                        {/* Subtle guide lines */}
                        <line x1="0" y1="95" x2="200" y2="95" stroke="#3b82f6" strokeWidth="0.6" strokeDasharray="4,4" opacity="0.5" />
                        <line x1="100" y1="0" x2="100" y2="260" stroke="#3b82f6" strokeWidth="0.6" strokeDasharray="4,4" opacity="0.4" />
                      </svg>
                    </div>

                    {/* Official Biometric Guidelines Overlay across sample */}
                    <div className="absolute inset-0 pointer-events-none border-2 border-brand-500/50 rounded-2xl overflow-hidden">
                      {/* Vertical Center Axis */}
                      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 border-l border-dashed border-cyan-400/70" />

                      {/* Head Crown Guide */}
                      <div
                        className="absolute w-full border-t border-dashed border-amber-400/90 flex items-center justify-end pr-2"
                        style={{ top: `${activePreset.biometricSpec.topMarginPercent}%` }}
                      >
                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-900 bg-amber-300/95 px-1.5 py-0.5 rounded shadow-xs">
                          Crown
                        </span>
                      </div>

                      {/* Oval Biometric Head Enclosure (70-80% height guideline) */}
                      <div
                        className="absolute border-2 border-dashed border-brand-400/90 rounded-full shadow-xs"
                        style={{
                          top: `${activePreset.biometricSpec.topMarginPercent}%`,
                          left: `${(100 - activePreset.biometricSpec.headWidthPercent) / 2}%`,
                          width: `${activePreset.biometricSpec.headWidthPercent}%`,
                          height: `${activePreset.biometricSpec.headHeightPercent}%`,
                        }}
                      />

                      {/* Eye Level Guide */}
                      <div
                        className="absolute w-full border-t border-dashed border-emerald-400/90 flex items-center justify-start pl-2"
                        style={{ top: `${activePreset.biometricSpec.eyeLinePercent}%` }}
                      >
                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-950 bg-emerald-300/95 px-1.5 py-0.5 rounded shadow-xs">
                          Eyes {activePreset.biometricSpec.eyeLinePercent}%
                        </span>
                      </div>

                      {/* Chin Guide */}
                      <div
                        className="absolute w-full border-t border-dashed border-amber-400/90 flex items-center justify-end pr-2"
                        style={{
                          top: `${activePreset.biometricSpec.topMarginPercent + activePreset.biometricSpec.headHeightPercent}%`,
                        }}
                      >
                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-900 bg-amber-300/95 px-1.5 py-0.5 rounded shadow-xs">
                          Chin
                        </span>
                      </div>
                    </div>

                    {/* Subtle upload badge indicator */}
                    <div className="absolute bottom-3 inset-x-3 py-2 px-3 rounded-xl bg-black/65 backdrop-blur-md border border-white/20 text-white text-center shadow-lg">
                      <p className="text-[11px] font-semibold text-white/95">Biometric Studio Preview</p>
                      <p className="text-[9px] text-zinc-300">Upload your portrait to align & export</p>
                    </div>
                  </div>
                )}

                {imageSrc && showGuidelines && (
                  <div
                    className="absolute inset-0 pointer-events-none border-2 border-brand-500/40 rounded-2xl overflow-hidden"
                    key={activePreset.id}
                  >
                    <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 border-l border-dashed border-brand-500/30" />

                    <div
                      className="absolute w-full border-t border-dotted border-amber-500/70 flex items-center justify-end pr-2 transition-all duration-200"
                      style={{ top: `${activePreset.biometricSpec.topMarginPercent}%` }}
                    >
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-white/90 dark:bg-zinc-900/90 px-1 rounded shadow-xs">
                        Crown
                      </span>
                    </div>

                    <div
                      className="absolute border-2 border-dashed border-brand-500/80 rounded-full transition-all duration-200 shadow-xs"
                      style={{
                        top: `${activePreset.biometricSpec.topMarginPercent}%`,
                        left: `${(100 - activePreset.biometricSpec.headWidthPercent) / 2}%`,
                        width: `${activePreset.biometricSpec.headWidthPercent}%`,
                        height: `${activePreset.biometricSpec.headHeightPercent}%`,
                      }}
                    />

                    <div
                      className="absolute w-full border-t border-dashed border-emerald-500/90 flex items-center justify-between px-2 transition-all duration-200"
                      style={{ top: `${activePreset.biometricSpec.eyeLinePercent}%` }}
                    >
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-white/90 dark:bg-zinc-900/90 px-1 rounded shadow-xs flex items-center gap-0.5">
                        <Eye className="w-2.5 h-2.5 inline" /> Eyes
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-white/90 dark:bg-zinc-900/90 px-1 rounded shadow-xs">
                        {activePreset.biometricSpec.eyeLinePercent}%
                      </span>
                    </div>

                    <div
                      className="absolute w-full border-t border-dotted border-amber-500/70 flex items-center justify-end pr-2 transition-all duration-200"
                      style={{ top: `${activePreset.biometricSpec.chinLinePercent}%` }}
                    >
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-white/90 dark:bg-zinc-900/90 px-1 rounded shadow-xs">
                        Chin
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Always-visible Preview Quick Action Buttons */}
              {imageSrc && (
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    onClick={() => setIsAdjustMode(!isAdjustMode)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer min-h-[36px] ${
                      isAdjustMode
                        ? 'border-brand-500 bg-brand-500/15 text-brand-600 dark:text-brand-300 ring-2 ring-brand-500/25'
                        : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <Move className="w-3.5 h-3.5" />
                    {isAdjustMode ? 'Done' : 'Adjust position'}
                  </button>
                </div>
              )}

              {/* Warning note if head was too close to fit without clipping */}
              {isTooCloseWarning && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2 text-left animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>Photo is too close; use a photo with more space around the head.</span>
                </div>
              )}

              {/* Small Biometric Live Checklist */}
              {imageSrc && (
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 text-left text-xs space-y-1.5">
                  <div className="font-bold text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Biometric Check:
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isTooCloseWarning ? 'text-amber-500' : 'text-emerald-500'}`} />
                    <span className="text-zinc-700 dark:text-zinc-300">
                      Head size: {measuredBiometrics.headPercent === null ? 'Not measured' : `${measuredBiometrics.headPercent}% of photo height${isTooCloseWarning ? ' (limited to fit)' : ''}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-zinc-700 dark:text-zinc-300">
                      Eye line: {measuredBiometrics.eyePercent === null ? 'Not measured' : `Measured at ~${measuredBiometrics.eyePercent}% height`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {activePreset.allowedBgColors.includes(bgColor.toLowerCase()) || bgColor === 'transparent' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <span className="text-zinc-700 dark:text-zinc-300">
                      Background: {activePreset.allowedBgColors.includes(bgColor.toLowerCase()) || bgColor === 'transparent' ? `Compliant for ${activePreset.country}` : `Non-official for ${activePreset.country}`}
                    </span>
                  </div>
                </div>
              )}

              {/* Country Biometric Specs Readout */}
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 text-left border border-zinc-200 dark:border-zinc-700/60 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm">{activePreset.flag}</span>
                    {activePreset.name}
                  </span>
                  <span className="text-brand-500 font-mono text-[11px]">
                    {activePreset.widthMm} × {activePreset.heightMm} mm
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                  {activePreset.biometricSpec.specSummary}
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-zinc-200/60 dark:border-zinc-700/60">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showGuidelines}
                      onChange={(e) => setShowGuidelines(e.target.checked)}
                      className="rounded text-brand-500 focus:ring-brand-500"
                    />
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Show Biometric Overlay Guides
                    </span>
                  </label>
                </div>
              </div>

              {/* Proceed to Download Preview Action */}
              {imageSrc ? (
                <button
                  disabled={isSegmenting}
                  onClick={() => {
                    setCurrentStep('preview');
                    if (typeof window !== 'undefined') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-sm font-semibold shadow-glow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileDown className="w-4 h-4" />
                  Proceed to Download Preview & Sheets →
                </button>
              ) : (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    <strong>Compliance Tip:</strong> Align your eyes with the green dashed line and head crown with the top amber guideline.
                  </p>
                </div>
              )}
            </div>

            {/* Tips for the best result */}
            <div className="glass-card p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-left space-y-2.5">
              <h4 className="text-xs font-bold font-display text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Info className="w-4 h-4 text-brand-500 shrink-0" />
                Tips for the best result
              </h4>
              <ul className="text-xs space-y-2 text-zinc-600 dark:text-zinc-400">
                <li className="flex items-start gap-1.5">
                  <span className="text-brand-500 font-bold shrink-0">•</span>
                  <span><strong>Remove colour halo:</strong> turn this on if you see a thin light or dark outline around the hair or shoulders.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-brand-500 font-bold shrink-0">•</span>
                  <span><strong>Soften edges:</strong> smooths hair, neck and shoulder edges so they look natural. Increase it a little if the edges look sharp.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-brand-500 font-bold shrink-0">•</span>
                  <span><strong>Trim edge fringe:</strong> removes the thin coloured rim left from the old background. Increase it slightly if you still see a rim.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-brand-500 font-bold shrink-0">•</span>
                  <span>For the cleanest cut, use a plain, well-lit photo facing the camera.</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      )}

      {/* STEP 3: DEDICATED 2-PANEL DOWNLOAD PREVIEW SCREEN */}
      {currentStep === 'preview' && (
        <div className="space-y-8" id="download-screen-top">
          {/* Step 3 Top Bar: Back to editor & Change photo */}
          <div className="flex items-center justify-between p-4 rounded-2xl glass-card border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setCurrentStep('edit')}
              className="text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:text-brand-500 flex items-center gap-1.5 transition cursor-pointer min-h-[40px] px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700"
            >
              <ArrowLeft className="w-4 h-4" />
              ← Back to editor
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-500 hidden sm:inline">Your photo is ready</span>
              <button
                onClick={handleMakeNewImage}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1.5 transition cursor-pointer min-h-[40px] px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/60"
              >
                <Upload className="w-3.5 h-3.5" />
                Change photo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT PANEL — Online Submission (Single Photo) (5 cols) */}
            <motion.div
              className="lg:col-span-5 glass-card p-6 md:p-8 rounded-3xl space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold font-display text-zinc-900 dark:text-white flex items-center gap-2">
                    <Upload className="w-4 h-4 text-brand-500 rotate-180" />
                    Online Submission
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Single photo for visa portals & web uploads
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-300">
                  Single Image
                </span>
              </div>

              {/* Single Photo Preview Card */}
              <div className="p-6 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 flex flex-col items-center justify-center border border-zinc-200 dark:border-zinc-700/60">
                <div
                  className="rounded-xl overflow-hidden shadow-md border border-zinc-300 dark:border-zinc-700"
                  style={{
                    width: `${previewDimensions.width * 0.85}px`,
                    height: `${previewDimensions.height * 0.85}px`,
                    backgroundColor: previewTab === 'cutout' || bgColor === 'transparent' ? '#ffffff' : bgColor,
                    backgroundImage: (previewTab === 'cutout' || bgColor === 'transparent')
                      ? 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)'
                      : 'none',
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                  }}
                >
                  <canvas ref={canvasRef} className="w-full h-full object-contain block" />
                </div>

                <div className="mt-4 text-center space-y-1">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white">
                    {activePreset.name}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {activePreset.widthMm} × {activePreset.heightMm} mm ({activePreset.widthPx} × {activePreset.heightPx} px @ 300 DPI)
                  </p>
                </div>
              </div>

              {/* Size Limiter Option */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Target File Size Limiter (Government Portal Uploads)
                </label>
                <select
                  value={selectedSizeLimit}
                  onChange={(e) => setSelectedSizeLimit(e.target.value)}
                  className="w-full text-xs font-semibold px-3.5 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                >
                  {sizeLimitOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Left Panel Download Button */}
              <button
                onClick={downloadSinglePhoto}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 text-sm font-semibold shadow-glow"
              >
                <Download className="w-4 h-4" />
                Download Single Photo ({bgColor === 'transparent' || previewTab === 'cutout' ? 'PNG' : 'JPEG'})
              </button>
            </motion.div>

            {/* RIGHT PANEL — Print Sheet (7 cols) */}
            <motion.div
              id="print-sheet-panel"
              className="lg:col-span-7 glass-card p-6 md:p-8 rounded-3xl space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold font-display text-zinc-900 dark:text-white flex items-center gap-2">
                    <Printer className="w-4 h-4 text-emerald-500" />
                    Print Sheet
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Tiled copies with borders and crop registration cut marks
                  </p>
                </div>

                {/* Sheet Selector: A4 / 3 per A4 / A6 - 2 photos / A5 - 6 photos / Custom */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 max-w-full overflow-x-auto">
                  <button
                    onClick={() => setSheetPreset('a4')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap min-h-[44px] sm:min-h-0 ${
                      sheetPreset === 'a4'
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    A4 Page
                  </button>
                  <button
                    onClick={() => setSheetPreset('3-per-a4')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap min-h-[44px] sm:min-h-0 ${
                      sheetPreset === '3-per-a4'
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    3 per A4
                  </button>
                  <button
                    onClick={() => setSheetPreset('a6-2')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap min-h-[44px] sm:min-h-0 ${
                      sheetPreset === 'a6-2'
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    A6 - 2 photos
                  </button>
                  <button
                    onClick={() => setSheetPreset('a5-6')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap min-h-[44px] sm:min-h-0 ${
                      sheetPreset === 'a5-6'
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    A5 - 6 photos
                  </button>
                  <button
                    onClick={() => setSheetPreset('custom')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap min-h-[44px] sm:min-h-0 ${
                      sheetPreset === 'custom'
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Custom
                  </button>
                </div>
              </div>

              {/* Warning note if preset dimensions reduce target count on A6 or A5 */}
              {(sheetPreset === 'a6-2' || sheetPreset === 'a5-6') && layoutV2.reducedMessage && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>{layoutV2.reducedMessage}</span>
                </div>
              )}

              {/* Custom Grid Controls if selected */}
              {sheetPreset === 'custom' && (
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Columns:</span>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={customSheetCols}
                      onChange={(e) => setCustomSheetCols(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-xs font-bold px-2 py-1 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-center"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Rows:</span>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={customSheetRows}
                      onChange={(e) => setCustomSheetRows(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-xs font-bold px-2 py-1 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-center"
                    />
                  </div>
                  <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                    Total: {customSheetCols * customSheetRows} Photos
                  </span>
                </div>
              )}

              {/* Tiled Print Sheet Canvas Preview */}
              <div className="p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 flex flex-col items-center justify-center">
                <div className="w-full max-h-[380px] overflow-auto flex items-center justify-center p-2 rounded-xl bg-zinc-200/50 dark:bg-zinc-900/50">
                  <div className="shadow-2xl rounded-sm overflow-hidden bg-white border border-zinc-300">
                    <canvas
                      ref={sheetCanvasRef}
                      className="max-h-[340px] max-w-full object-contain block"
                    />
                  </div>
                </div>

                <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-2 w-full text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Scissors className="w-3.5 h-3.5 text-brand-500" />
                    Includes thin cutting borders & registration cut marks
                  </span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {sheetPreset === 'a6-2'
                      ? `A6 - ${sheetPhotoCount} photos - ${activePreset.widthMm}x${activePreset.heightMm} mm - 300 DPI`
                      : sheetPreset === 'a5-6'
                      ? `A5 - ${sheetPhotoCount} photos - ${activePreset.widthMm}x${activePreset.heightMm} mm - 300 DPI`
                      : `${sheetPhotoCount} Copies @ 300 DPI`}
                  </span>
                </div>

                {/* Print Dialog Guidance Tip */}
                <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400 text-center italic">
                  💡 In the print dialog choose <strong className="font-semibold text-zinc-700 dark:text-zinc-300">Actual size / 100%</strong> and turn off <strong className="font-semibold text-zinc-700 dark:text-zinc-300">Fit to page</strong>.
                </p>
              </div>

              {/* Right Panel Download Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => downloadPrintableSheet('jpg')}
                  disabled={isDownloading}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 text-sm font-semibold shadow-glow disabled:opacity-70 disabled:cursor-not-allowed min-h-[44px]"
                >
                  {isDownloading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Preparing Sheet...</>
                  ) : (
                    <><Printer className="w-4 h-4" /> Download Print Sheet ({sheetPreset === 'a6-2' ? 'A6 JPG' : sheetPreset === 'a5-6' ? 'A5 JPG' : `${sheetPreset.toUpperCase()} JPG`})</>
                  )}
                </button>

                {(sheetPreset === 'a6-2' || sheetPreset === 'a5-6') && (
                  <button
                    onClick={() => downloadPrintableSheet('pdf')}
                    disabled={isDownloading}
                    className="hidden sm:flex w-full py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 items-center justify-center gap-2 transition min-h-[44px]"
                  >
                    <FileDown className="w-4 h-4 text-emerald-500" />
                    Download PDF ({sheetPreset === 'a6-2' ? 'A6 105x148 mm' : 'A5 148x210 mm'})
                  </button>
                )}
              </div>

            </motion.div>
          </div>

          {/* BOTTOM ACTION BAR (FULL WIDTH) */}
          <motion.div
            className="glass-card p-4 sm:p-5 rounded-2xl flex items-center justify-end gap-4 border border-zinc-200 dark:border-zinc-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <button
              onClick={handleMakeNewImage}
              className="px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2 transition cursor-pointer min-h-[44px]"
            >
              <PlusCircle className="w-4 h-4 text-brand-500" />
              + Make New Image
            </button>
          </motion.div>

          {/* Tool Feedback Component directly below download screen */}
          <ToolFeedback toolName="passport-photo" />
        </div>
      )}

      {/* Before / After Visual Proof Mockup */}
      <PassportBeforeAfter />

      {/* Official Compliance Standards */}
      <section className="mt-14">
        <div className="glass-card p-8 rounded-3xl">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-zinc-900 dark:text-white mb-6">
            Official Biometric Compliance Standards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Expression & Pose
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Neutral expression with both eyes open. Look directly into camera. Closed lips with no smile.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Lighting & Solid Background
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Even lighting with zero harsh shadows. Choose standard white, off-white, or country-specific light blue background.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Attire & Accessories
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Formal/business attire recommended. No eyeglasses with glare or non-religious headwear.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Studio & Home Print Sheet Sizes Reference Table ── */}
      <section className="mt-12">
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-zinc-200/70 dark:border-zinc-800/60 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20 mb-2">
                <Grid className="w-3.5 h-3.5" />
                Paper & Layout Specifications
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-zinc-900 dark:text-white">
                Print Sheet Sizes & Photo Capacities (300 DPI)
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Generated from active studio presets. Every layout preserves pixel-exact dimensions with corner cutting marks.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700/80 text-zinc-500 dark:text-zinc-400">
                  <th className="py-3 px-3 font-semibold">Sheet Option</th>
                  <th className="py-3 px-3 font-semibold">Paper Dimensions</th>
                  <th className="py-3 px-3 font-semibold">Paper Pixels @ 300 DPI</th>
                  <th className="py-3 px-3 font-semibold">Standard 35x45 mm Capacity</th>
                  <th className="py-3 px-3 font-semibold">US 2x2&quot; Capacity</th>
                  <th className="py-3 px-3 font-semibold">Canada 50x70 mm Capacity</th>
                  <th className="py-3 px-3 font-semibold">Features</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                <tr className="hover:bg-zinc-500/5 transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-500" />
                    A6 - 2 photos
                  </td>
                  <td className="py-3.5 px-3">105 x 148 mm (4.13 x 5.83 in)</td>
                  <td className="py-3.5 px-3 font-mono text-[11px] sm:text-xs">1240 x 1748 px</td>
                  <td className="py-3.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">2 photos</td>
                  <td className="py-3.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">2 photos</td>
                  <td className="py-3.5 px-3 text-amber-600 dark:text-amber-400 font-medium">1 photo (auto-adjusted)</td>
                  <td className="py-3.5 px-3 text-zinc-500 dark:text-zinc-400 text-xs">Side-by-side, 2.5mm gap, corner crop marks, PDF</td>
                </tr>
                <tr className="hover:bg-zinc-500/5 transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    A5 - 6 photos
                  </td>
                  <td className="py-3.5 px-3">148 x 210 mm (5.83 x 8.27 in)</td>
                  <td className="py-3.5 px-3 font-mono text-[11px] sm:text-xs">1748 x 2480 px</td>
                  <td className="py-3.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">6 photos (3x2 grid)</td>
                  <td className="py-3.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">4 photos (2x2 grid)</td>
                  <td className="py-3.5 px-3 text-amber-600 dark:text-amber-400 font-medium">4 photos (2x2 grid)</td>
                  <td className="py-3.5 px-3 text-zinc-500 dark:text-zinc-400 text-xs">5mm margin, 2.5mm gap, crop marks, vector PDF</td>
                </tr>
                <tr className="hover:bg-zinc-500/5 transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    A4 Page (Studio)
                  </td>
                  <td className="py-3.5 px-3">210 x 297 mm (8.27 x 11.69 in)</td>
                  <td className="py-3.5 px-3 font-mono text-[11px] sm:text-xs">2480 x 3508 px</td>
                  <td className="py-3.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">24 photos</td>
                  <td className="py-3.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">12 photos</td>
                  <td className="py-3.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">6 photos</td>
                  <td className="py-3.5 px-3 text-zinc-500 dark:text-zinc-400 text-xs">Full-page batch tiling with cutting guides</td>
                </tr>
                <tr className="hover:bg-zinc-500/5 transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-violet-500" />
                    3 per A4
                  </td>
                  <td className="py-3.5 px-3">210 x 297 mm (8.27 x 11.69 in)</td>
                  <td className="py-3.5 px-3 font-mono text-[11px] sm:text-xs">2480 x 3508 px</td>
                  <td className="py-3.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">6 photos</td>
                  <td className="py-3.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">6 photos</td>
                  <td className="py-3.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">6 photos</td>
                  <td className="py-3.5 px-3 text-zinc-500 dark:text-zinc-400 text-xs">Spaced studio cut strips</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── How Passport Photo Prints Are Made at a Studio and at Home ── */}
      <section className="mt-12">
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-zinc-200/70 dark:border-zinc-800/60 shadow-sm space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 mb-2">
              <Printer className="w-3.5 h-3.5" />
              Printing &amp; Lab Guide
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-zinc-900 dark:text-white">
              How Passport Photo Prints Are Made at a Studio and at Home
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Avoid the most common reason for embassy rejections: incorrect physical scaling and paper distortion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/50 space-y-3">
              <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-brand-500/15 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs font-black">1</span>
                Studio Mini-Lab Workflow
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Commercial photo studios rarely print single passport photos. They arrange portraits onto standard photo paper sizes (such as A6 postcard or A5 sheets) at 300 DPI, print them on dye-sublimation or glossy inkjet printers, and cut along calibrated crop marks. Compixor gives you the exact same digital layout without paying studio markups.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/50 space-y-3">
              <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-brand-500/15 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs font-black">2</span>
                Home Printing: The 100% Scale Rule
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                When printing your downloaded JPEG or vector PDF at home, <strong>never use &quot;Fit to page&quot; or &quot;Shrink to fit&quot;</strong>. Doing so alters the physical millimeter dimensions of the photos, causing immediate rejection by visa officers. Always select <strong>&quot;Actual size&quot;</strong> or set page scaling to <strong>100%</strong> in your printer software.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-amber-800 dark:text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Paper &amp; Finish Recommendation:</span> Use 200–250 GSM semi-gloss or satin photo paper. Matte paper is accepted for Pakistan NADRA, UK, and Schengen passports, while glossy or semi-gloss is standard for US Visas and Indian passports.
            </div>
          </div>
        </div>
      </section>

      {/* Floating Debug Panel (?debug=1) — Bottom-LEFT, Collapsible, Copy Report, No Feedback Collision */}
      {isDebugMode && (
        <div className="fixed bottom-4 left-4 z-40 select-none pointer-events-auto">
          {!isDebugExpanded ? (
            <button
              onClick={() => setIsDebugExpanded(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950/95 border border-cyan-500/50 text-cyan-300 font-mono text-xs shadow-2xl backdrop-blur-md hover:bg-zinc-900 transition-all cursor-pointer min-h-[36px]"
              title="Click to expand Passport Studio Debug Panel"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white">Debug</span>
              <span className="text-[10px] text-cyan-400/80">({debugStats.requestsSent} req)</span>
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-zinc-950/95 border border-cyan-500/40 text-cyan-300 font-mono text-xs shadow-2xl backdrop-blur-md w-[320px] max-w-[90vw] space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between border-b border-cyan-500/30 pb-1.5 mb-2">
                <span className="font-bold text-white flex items-center gap-1.5 text-xs truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  Passport Debug (?debug=1)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const report = [
                        `--- Passport Studio Debug Report ---`,
                        `API Requests Sent: ${debugStats.requestsSent}`,
                        `Cache Hits: ${debugStats.cacheHits}`,
                        `Last API Duration: ${debugStats.lastDurationMs} ms`,
                        `Uploaded Size: ${debugStats.lastUploadedKb} KB`,
                        `Result: ${debugStats.lastResult}`,
                        `Mode: ${debugStats.mode}`,
                        `Cutout Cached: ${debugStats.cachedHash}`,
                        `Last Re-render: ${debugStats.lastRenderMs} ms`,
                        `Sheet Preset: ${sheetPreset}`,
                        `Active Country: ${activePreset.name} (${activePreset.widthMm}x${activePreset.heightMm} mm)`,
                        `Timestamp: ${new Date().toISOString()}`,
                      ].join('\n');
                      navigator.clipboard.writeText(report);
                      toast.success('Debug report copied to clipboard!');
                    }}
                    className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 text-[10px] font-sans font-bold transition"
                    title="Copy full debug report"
                  >
                    Copy report
                  </button>
                  <button
                    onClick={() => setIsDebugExpanded(false)}
                    className="w-5 h-5 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs transition"
                    title="Collapse debug panel"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-400">API Requests Sent:</span>
                <span className="font-bold text-white">{debugStats.requestsSent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Cache Hits:</span>
                <span className="font-bold text-emerald-400">{debugStats.cacheHits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Last API Duration:</span>
                <span className="font-bold text-white">{debugStats.lastDurationMs} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Uploaded Size:</span>
                <span className="font-bold text-white">{debugStats.lastUploadedKb} KB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Result:</span>
                <span
                  className={`font-bold ${
                    debugStats.lastResult === 'ok'
                      ? 'text-emerald-400'
                      : debugStats.lastResult === 'error'
                      ? 'text-red-400'
                      : 'text-amber-400'
                  }`}
                >
                  {debugStats.lastResult}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Mode:</span>
                <span className="font-bold text-white">{debugStats.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Cutout Cached:</span>
                <span className="font-bold text-cyan-400">
                  {debugStats.cachedHash !== 'none' ? `yes (${debugStats.cachedHash})` : 'no'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Last align cause:</span>
                <span className="font-bold text-amber-400">
                  {(debugStats as any).lastAlignCause || 'none'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Zoom:</span>
                <span className="font-bold text-white">
                  {(debugStats as any).zoomDisplay || `${Math.round(zoom * 100)}%`}
                </span>
              </div>
              <div className="flex justify-between border-t border-cyan-500/20 pt-1 mt-1">
                <span className="text-zinc-400">Last Re-render:</span>
                <span className="font-bold text-white">{debugStats.lastRenderMs} ms</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

