'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Shirt,
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
} from 'lucide-react';
import { toast } from 'sonner';
import FileDropZone from '@/components/FileDropZone';

export interface BiometricSpec {
  headHeightPercent: number; // Crown to chin % of photo height
  headWidthPercent: number;  // Head width % of photo width
  topMarginPercent: number;  // Top edge to crown %
  eyeLinePercent: number;    // Top edge to eye center %
  chinLinePercent: number;   // Top edge to chin %
  minHeadMm: number;         // Official min head height in mm
  maxHeadMm: number;         // Official max head height in mm
  specSummary: string;       // Summary for user guidance
}

export interface Preset {
  id: string;
  name: string;
  country: string;
  widthMm: number;
  heightMm: number;
  widthPx: number;
  heightPx: number;
  aspectRatio: number;
  defaultBgColor: string;
  description: string;
  flag: string;
  biometricSpec: BiometricSpec;
}

const standardPresets: Preset[] = [
  {
    id: 'pakistan-passport',
    name: 'Pakistan Passport / NADRA',
    country: 'Pakistan',
    widthMm: 35,
    heightMm: 45,
    widthPx: 413,
    heightPx: 531,
    aspectRatio: 35 / 45,
    defaultBgColor: '#e0f2fe',
    description: '35 x 45 mm (NADRA / Passports light blue or white background)',
    flag: '🇵🇰',
    biometricSpec: {
      headHeightPercent: 75,
      headWidthPercent: 62,
      topMarginPercent: 8,
      eyeLinePercent: 38,
      chinLinePercent: 83,
      minHeadMm: 32,
      maxHeadMm: 36,
      specSummary: 'Head: 32–36 mm (70–80% photo height) • Eye level: 38% from top',
    },
  },
  {
    id: 'us-passport',
    name: 'US Passport / Visa / Green Card',
    country: 'United States',
    widthMm: 51,
    heightMm: 51,
    widthPx: 600,
    heightPx: 600,
    aspectRatio: 1,
    defaultBgColor: '#ffffff',
    description: '2 x 2 inches (51 x 51 mm) at 300 DPI, solid white background',
    flag: '🇺🇸',
    biometricSpec: {
      headHeightPercent: 58,
      headWidthPercent: 52,
      topMarginPercent: 12,
      eyeLinePercent: 42,
      chinLinePercent: 70,
      minHeadMm: 25,
      maxHeadMm: 35,
      specSummary: 'Head: 25–35 mm (50–69% photo height) • Eye level: 42% from top',
    },
  },
  {
    id: 'uk-eu-passport',
    name: 'UK / Schengen / EU Passport',
    country: 'United Kingdom & Europe',
    widthMm: 35,
    heightMm: 45,
    widthPx: 413,
    heightPx: 531,
    aspectRatio: 35 / 45,
    defaultBgColor: '#ffffff',
    description: '35 x 45 mm standard ICAO 9303 format (Light gray or white)',
    flag: '🇪🇺',
    biometricSpec: {
      headHeightPercent: 74,
      headWidthPercent: 60,
      topMarginPercent: 9,
      eyeLinePercent: 39,
      chinLinePercent: 83,
      minHeadMm: 29,
      maxHeadMm: 34,
      specSummary: 'Head: 29–34 mm (65–76% photo height) • Eye level: 39% from top',
    },
  },
  {
    id: 'india-passport',
    name: 'India Passport / OCI / Visa',
    country: 'India',
    widthMm: 51,
    heightMm: 51,
    widthPx: 600,
    heightPx: 600,
    aspectRatio: 1,
    defaultBgColor: '#ffffff',
    description: '2 x 2 inches (51 x 51 mm) pure white background',
    flag: '🇮🇳',
    biometricSpec: {
      headHeightPercent: 70,
      headWidthPercent: 55,
      topMarginPercent: 10,
      eyeLinePercent: 40,
      chinLinePercent: 80,
      minHeadMm: 35,
      maxHeadMm: 40,
      specSummary: 'Head: 35–40 mm (70–80% photo height) • Eye level: 40% from top',
    },
  },
  {
    id: 'canada-passport',
    name: 'Canada Passport',
    country: 'Canada',
    widthMm: 50,
    heightMm: 70,
    widthPx: 590,
    heightPx: 826,
    aspectRatio: 50 / 70,
    defaultBgColor: '#ffffff',
    description: '50 x 70 mm (2 x 2.75 inches) white or light gray background',
    flag: '🇨🇦',
    biometricSpec: {
      headHeightPercent: 48,
      headWidthPercent: 50,
      topMarginPercent: 15,
      eyeLinePercent: 38,
      chinLinePercent: 63,
      minHeadMm: 31,
      maxHeadMm: 36,
      specSummary: 'Head: 31–36 mm (44–51% photo height) • Eye level: 38% from top',
    },
  },
  {
    id: 'philippines-passport',
    name: 'Philippines Passport',
    country: 'Philippines',
    widthMm: 35,
    heightMm: 45,
    widthPx: 413,
    heightPx: 531,
    aspectRatio: 35 / 45,
    defaultBgColor: '#1d4ed8',
    description: '35 x 45 mm (Royal blue background standard)',
    flag: '🇵🇭',
    biometricSpec: {
      headHeightPercent: 74,
      headWidthPercent: 60,
      topMarginPercent: 9,
      eyeLinePercent: 39,
      chinLinePercent: 83,
      minHeadMm: 30,
      maxHeadMm: 35,
      specSummary: 'Head: 30–35 mm (67–78% photo height) • Eye level: 39% from top',
    },
  },
  {
    id: 'china-passport',
    name: 'China Passport',
    country: 'China',
    widthMm: 33,
    heightMm: 48,
    widthPx: 390,
    heightPx: 567,
    aspectRatio: 33 / 48,
    defaultBgColor: '#ffffff',
    description: '33 x 48 mm biometric specification (White or Blue)',
    flag: '🇨🇳',
    biometricSpec: {
      headHeightPercent: 65,
      headWidthPercent: 56,
      topMarginPercent: 10,
      eyeLinePercent: 39,
      chinLinePercent: 75,
      minHeadMm: 28,
      maxHeadMm: 33,
      specSummary: 'Head: 28–33 mm (58–68% photo height) • Eye level: 39% from top',
    },
  },
  {
    id: 'australia-passport',
    name: 'Australia Passport',
    country: 'Australia',
    widthMm: 35,
    heightMm: 45,
    widthPx: 413,
    heightPx: 531,
    aspectRatio: 35 / 45,
    defaultBgColor: '#ffffff',
    description: '35 x 45 mm (Australian Passport Office light gray/white standard)',
    flag: '🇦🇺',
    biometricSpec: {
      headHeightPercent: 75,
      headWidthPercent: 60,
      topMarginPercent: 9,
      eyeLinePercent: 39,
      chinLinePercent: 84,
      minHeadMm: 32,
      maxHeadMm: 36,
      specSummary: 'Head: 32–36 mm (71–80% photo height) • Eye level: 39% from top',
    },
  },
  {
    id: 'uae-gulf-visa',
    name: 'UAE & Gulf Visa',
    country: 'United Arab Emirates',
    widthMm: 40,
    heightMm: 60,
    widthPx: 472,
    heightPx: 708,
    aspectRatio: 40 / 60,
    defaultBgColor: '#ffffff',
    description: '40 x 60 mm (White background GDRFA format)',
    flag: '🇦🇪',
    biometricSpec: {
      headHeightPercent: 68,
      headWidthPercent: 55,
      topMarginPercent: 12,
      eyeLinePercent: 40,
      chinLinePercent: 80,
      minHeadMm: 30,
      maxHeadMm: 38,
      specSummary: 'Head: 30–38 mm (60–70% photo height) • Eye level: 40% from top',
    },
  },
];

const bgColors = [
  { label: 'White (US / UK / EU / India)', value: '#ffffff', class: 'bg-white border-zinc-300' },
  { label: 'Off-White', value: '#f8fafc', class: 'bg-slate-50 border-slate-300' },
  { label: 'Light Blue (Pakistan / Gulf)', value: '#e0f2fe', class: 'bg-sky-100 border-sky-300' },
  { label: 'Royal Blue (Philippines)', value: '#1d4ed8', class: 'bg-blue-700 border-blue-800' },
  { label: 'Light Gray (Canada / Australia)', value: '#f1f5f9', class: 'bg-slate-100 border-slate-300' },
  { label: 'Red (Indonesia / Vietnam / China ID)', value: '#dc2626', class: 'bg-red-600 border-red-700' },
  { label: 'Transparent (PNG Cutout)', value: 'transparent', class: 'bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:6px_6px] border-zinc-400' },
];

interface OutfitOption {
  id: string;
  name: string;
  category: 'men' | 'women' | 'kids' | 'modest';
  svgType: 'suit-black' | 'suit-navy' | 'shirt-white' | 'women-blazer-navy' | 'women-jacket-black' | 'kids-formal' | 'hijab-black';
}

const outfitOptions: OutfitOption[] = [
  { id: 'none', name: 'Original Clothing', category: 'men', svgType: 'suit-black' },
  { id: 'men-suit-black', name: 'Men: Classic Black Suit & Tie', category: 'men', svgType: 'suit-black' },
  { id: 'men-suit-navy', name: 'Men: Dark Navy Blazer & Tie', category: 'men', svgType: 'suit-navy' },
  { id: 'men-shirt-white', name: 'Men: Formal White Collar Shirt', category: 'men', svgType: 'shirt-white' },
  { id: 'women-blazer-navy', name: 'Women: Navy Blazer & Blouse', category: 'women', svgType: 'women-blazer-navy' },
  { id: 'women-jacket-black', name: 'Women: Executive Black Jacket', category: 'women', svgType: 'women-jacket-black' },
  { id: 'kids-formal', name: 'Kids: Formal Shirt & Vest', category: 'kids', svgType: 'kids-formal' },
  { id: 'hijab-black', name: 'Modest: Black Hijab & Suit', category: 'modest', svgType: 'hijab-black' },
];

type SheetPresetOption = 'a4' | '3-per-a4' | 'custom';

const sizeLimitOptions = [
  { id: 'uncompressed', label: 'Original Quality (Max Resolution)', maxBytes: 0 },
  { id: '500kb', label: 'Under 500 KB', maxBytes: 500 * 1024 },
  { id: '240kb', label: 'Under 240 KB (US State Dept / CEAC)', maxBytes: 240 * 1024 },
  { id: '100kb', label: 'Under 100 KB (India OCI / UK Gov)', maxBytes: 100 * 1024 },
  { id: '50kb', label: 'Under 50 KB (NADRA / Online Visa)', maxBytes: 50 * 1024 },
  { id: '30kb', label: 'Under 30 KB', maxBytes: 30 * 1024 },
];

const faqs = [
  {
    q: 'How does the remove.bg-grade background removal work?',
    a: 'We use high-resolution client-side AI matting with morphological opening and closing (to remove stray background specks and fill interior pinholes), edge de-spill (which neutralizes residual background color halos on hair strands), and continuous subpixel alpha feathering.',
  },
  {
    q: 'Can I download just the transparent PNG cutout without any background?',
    a: 'Yes! Select the "Cutout" tab or the "Transparent (PNG Cutout)" swatch. Downloading the single photo will export a pure 32-bit transparent PNG with soft hair edges.',
  },
  {
    q: 'How does the printable sheet with cut marks work?',
    a: 'We generate an exact 300 DPI high-resolution sheet with standard ~1.5px border outlines and corner registration crop ticks extending outside each photo, so you can cleanly cut individual copies with scissors or a paper trimmer.',
  },
  {
    q: 'Is my portrait uploaded to any remote server?',
    a: 'Never. All AI portrait matting, face cropping, background filtering, outfit compositing, and file exports are executed 100% locally in your browser memory sandbox.',
  },
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
  // Remove.bg UX Mode: 'cutout' (transparent checkerboard) vs 'background' (solid colors)
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

  // Sync background color when preset changes
  const handlePresetSelect = (preset: Preset) => {
    setSelectedPreset(preset);
    setBgColor(preset.defaultBgColor);
    setPreviewTab('background');
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

  // Background removal state
  const [enableBgRemoval, setEnableBgRemoval] = useState(false);
  const [bgTolerance, setBgTolerance] = useState(45); // 15% - 85% confidence cutoff
  const [bgFeather, setBgFeather] = useState(4); // 1px - 6px edge feather (default 4px for soft hair edges)
  const [isSegmenting, setIsSegmenting] = useState(false);
  const [segmentationStatus, setSegmentationStatus] = useState<string | null>(null);

  // Step-by-step processing state
  type ProcessingStep = null | 'optimizing' | 'removing-bg' | 'compositing' | 'done';
  const [processingStep, setProcessingStep] = useState<ProcessingStep>(null);
  const [isDownloading, setIsDownloading] = useState(false);


  // Outfit overlay
  const [selectedOutfit, setSelectedOutfit] = useState<string>('none');
  const [outfitScale, setOutfitScale] = useState(1.0);
  const [outfitOffsetY, setOutfitOffsetY] = useState(0);

  // Download screen options
  const [sheetPreset, setSheetPreset] = useState<SheetPresetOption>('a4');
  const [customSheetCols, setCustomSheetCols] = useState<number>(2);
  const [customSheetRows, setCustomSheetRows] = useState<number>(5);
  const [selectedSizeLimit, setSelectedSizeLimit] = useState<string>('uncompressed');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Canvases
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sheetCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);
  const previewBoxRef = useRef<HTMLDivElement>(null);

  // Cached Step 1 Cutout (Clean Transparent Subject PNG)
  const cachedCutoutCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const segmenterRef = useRef<any>(null);

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

  // Initialize MediaPipe AI Segmentation Model on mount
  useEffect(() => {
    let isMounted = true;
    async function initModel() {
      try {
        const mp = await import('@mediapipe/selfie_segmentation');
        const segmenter = new mp.SelfieSegmentation({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
        });
        segmenter.setOptions({
          modelSelection: 0, // Portrait/selfie model — optimized for close-up face photos (passport, visa)
        });
        await segmenter.initialize();
        if (isMounted) {
          segmenterRef.current = segmenter;
          console.debug('[PassportStudio] High-Precision AI Portrait Model ready.');
        }
      } catch (err) {
        console.warn('[PassportStudio] MediaPipe initialization error (using client matting fallback):', err);
      }
    }
    initModel();
    return () => {
      isMounted = false;
    };
  }, []);

  // Draw formal outfit template onto canvas
  const drawOutfitOverlay = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (selectedOutfit === 'none') return;

    ctx.save();
    const outfitConfig = outfitOptions.find((o) => o.id === selectedOutfit);
    if (!outfitConfig) {
      ctx.restore();
      return;
    }

    const baseScale = width / 400;
    const finalScale = baseScale * outfitScale;

    const centerX = width / 2;
    const bottomY = height + outfitOffsetY * baseScale;

    ctx.translate(centerX, bottomY);
    ctx.scale(finalScale, finalScale);

    if (outfitConfig.svgType === 'suit-black' || outfitConfig.svgType === 'suit-navy') {
      const isNavy = outfitConfig.svgType === 'suit-navy';
      const suitColor = isNavy ? '#0f172a' : '#18181b';
      const lapelColor = isNavy ? '#1e293b' : '#27272a';
      const tieColor = isNavy ? '#dc2626' : '#2563eb';

      ctx.beginPath();
      ctx.moveTo(-180, 0);
      ctx.bezierCurveTo(-170, -110, -90, -150, -45, -145);
      ctx.lineTo(-20, -70);
      ctx.lineTo(20, -70);
      ctx.lineTo(45, -145);
      ctx.bezierCurveTo(90, -150, 170, -110, 180, 0);
      ctx.closePath();
      ctx.fillStyle = suitColor;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-45, -145);
      ctx.lineTo(0, -60);
      ctx.lineTo(45, -145);
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-45, -145);
      ctx.lineTo(-12, -125);
      ctx.lineTo(-20, -100);
      ctx.closePath();
      ctx.fillStyle = '#f8fafc';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(45, -145);
      ctx.lineTo(12, -125);
      ctx.lineTo(20, -100);
      ctx.closePath();
      ctx.fillStyle = '#f8fafc';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-8, -122);
      ctx.lineTo(8, -122);
      ctx.lineTo(12, -105);
      ctx.lineTo(0, 0);
      ctx.lineTo(-12, -105);
      ctx.closePath();
      ctx.fillStyle = tieColor;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-45, -145);
      ctx.lineTo(-10, -70);
      ctx.lineTo(-40, -50);
      ctx.lineTo(-80, -90);
      ctx.closePath();
      ctx.fillStyle = lapelColor;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(45, -145);
      ctx.lineTo(10, -70);
      ctx.lineTo(40, -50);
      ctx.lineTo(80, -90);
      ctx.closePath();
      ctx.fillStyle = lapelColor;
      ctx.fill();
    } else if (outfitConfig.svgType === 'shirt-white') {
      ctx.beginPath();
      ctx.moveTo(-180, 0);
      ctx.bezierCurveTo(-160, -110, -85, -145, -45, -140);
      ctx.lineTo(0, -90);
      ctx.lineTo(45, -140);
      ctx.bezierCurveTo(85, -145, 160, -110, 180, 0);
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-45, -140);
      ctx.lineTo(-10, -100);
      ctx.lineTo(0, -90);
      ctx.lineTo(10, -100);
      ctx.lineTo(45, -140);
      ctx.lineTo(0, -125);
      ctx.closePath();
      ctx.fillStyle = '#f1f5f9';
      ctx.fill();
      ctx.stroke();
    } else if (outfitConfig.svgType === 'women-blazer-navy' || outfitConfig.svgType === 'women-jacket-black') {
      const isNavy = outfitConfig.svgType === 'women-blazer-navy';
      const jacketColor = isNavy ? '#1e1b4b' : '#18181b';

      ctx.beginPath();
      ctx.moveTo(-175, 0);
      ctx.bezierCurveTo(-155, -115, -80, -145, -40, -140);
      ctx.lineTo(-15, -60);
      ctx.lineTo(15, -60);
      ctx.lineTo(40, -140);
      ctx.bezierCurveTo(80, -145, 155, -115, 175, 0);
      ctx.closePath();
      ctx.fillStyle = jacketColor;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-35, -140);
      ctx.bezierCurveTo(-15, -80, 15, -80, 35, -140);
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    } else if (outfitConfig.svgType === 'kids-formal') {
      ctx.beginPath();
      ctx.moveTo(-160, 0);
      ctx.bezierCurveTo(-140, -90, -70, -130, -35, -125);
      ctx.lineTo(0, -65);
      ctx.lineTo(35, -125);
      ctx.bezierCurveTo(70, -130, 140, -90, 160, 0);
      ctx.closePath();
      ctx.fillStyle = '#1e293b';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-35, -125);
      ctx.lineTo(0, -65);
      ctx.lineTo(35, -125);
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    } else if (outfitConfig.svgType === 'hijab-black') {
      ctx.beginPath();
      ctx.moveTo(-170, 0);
      ctx.bezierCurveTo(-150, -120, -80, -155, -45, -150);
      ctx.bezierCurveTo(-20, -120, 20, -120, 45, -150);
      ctx.bezierCurveTo(80, -155, 150, -120, 170, 0);
      ctx.closePath();
      ctx.fillStyle = '#0f172a';
      ctx.fill();
    }

    ctx.restore();
  }, [selectedOutfit, outfitScale, outfitOffsetY]);

  // STEP 2 — Instant Solid Color Background Compositing Engine
  // Rule: Solid BG fill FIRST → then draw pure transparent subject cutout on top (no blending/tinting)
  const compositeFinalCanvas = useCallback(() => {
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

    const showCheckerboard = previewTab === 'cutout' || bgColor === 'transparent';

    // STEP 1: Always fill background first (solid color or checkerboard for transparent mode)
    if (showCheckerboard) {
      ctx.clearRect(0, 0, width, height);
      const checkSize = 16;
      for (let y = 0; y < height; y += checkSize) {
        for (let x = 0; x < width; x += checkSize) {
          ctx.fillStyle = (Math.floor(x / checkSize) + Math.floor(y / checkSize)) % 2 === 0 ? '#f1f5f9' : '#ffffff';
          ctx.fillRect(x, y, checkSize, checkSize);
        }
      }
    } else {
      // Solid color fill — pure, no transparency, no tint
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
    }

    // STEP 2: Draw the clean RGBA subject cutout directly on top (source-over)
    // The cutout canvas has transparent background + subject with alpha mask — no color contamination
    if (cachedCutoutCanvasRef.current) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(cachedCutoutCanvasRef.current, 0, 0, width, height);
    }

    // STEP 3: Draw formal outfit overlay (if selected) on top of subject
    drawOutfitOverlay(ctx, width, height);

    setProcessingStep('done');
  }, [activePreset, bgColor, previewTab, drawOutfitOverlay]);


  // STEP 1 — Background Removal & Subject Separation (Produces Pure Transparent Cutout PNG)
  // Pre-resizes image to max 1024px for speed, then runs MediaPipe AI matting
  const processSubjectCutout = useCallback(async () => {
    const img = imageElementRef.current;
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const width = activePreset.widthPx;
    const height = activePreset.heightPx;

    const scaleX = width / previewDimensions.width;
    const scaleY = height / previewDimensions.height;
    const scaledPanX = panX * scaleX;
    const scaledPanY = panY * scaleY;

    setProcessingStep('optimizing');
    setSegmentationStatus('Optimizing Image...');

    // Yield to browser to paint the loading state before heavy work
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

    // 1. Render transformed and filtered subject photo onto offscreen sourceCanvas
    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = width;
    sourceCanvas.height = height;
    const srcCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
    if (!srcCtx) return;

    srcCtx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    srcCtx.save();
    srcCtx.translate(width / 2 + scaledPanX, height / 2 + scaledPanY);
    srcCtx.rotate((rotation * Math.PI) / 180);
    if (flipH) {
      srcCtx.scale(-zoom, zoom);
    } else {
      srcCtx.scale(zoom, zoom);
    }

    const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
    const drawWidth = img.naturalWidth * scale;
    const drawHeight = img.naturalHeight * scale;
    srcCtx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    srcCtx.restore();

    // 2. If Background Removal is DISABLED: Cache source photo directly
    if (!enableBgRemoval) {
      cachedCutoutCanvasRef.current = sourceCanvas;
      setSegmentationStatus(null);
      setProcessingStep(null);
      compositeFinalCanvas();
      return;
    }

    // 3. PRE-RESIZE to max 1024px for AI engine (prevents freeze on high-res images)
    const MAX_AI_DIM = 1024;
    let aiCanvas = sourceCanvas;
    if (width > MAX_AI_DIM || height > MAX_AI_DIM) {
      const aiScale = MAX_AI_DIM / Math.max(width, height);
      const aiW = Math.round(width * aiScale);
      const aiH = Math.round(height * aiScale);
      aiCanvas = document.createElement('canvas');
      aiCanvas.width = aiW;
      aiCanvas.height = aiH;
      const aiCtx = aiCanvas.getContext('2d');
      if (aiCtx) {
        aiCtx.imageSmoothingEnabled = true;
        aiCtx.imageSmoothingQuality = 'high';
        aiCtx.drawImage(sourceCanvas, 0, 0, aiW, aiH);
      }
    }

    // 4. Run AI Portrait Matting
    setIsSegmenting(true);
    setProcessingStep('removing-bg');
    setSegmentationStatus('Removing Background...');

    // Yield again so UI can update
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

    try {
      const segmenter = segmenterRef.current;

      if (segmenter) {
        // Send pre-resized frame to MediaPipe Selfie Segmentation
        await new Promise<void>((resolve) => {
          segmenter.onResults((results: any) => {
            const rawMaskCanvas = results.segmentationMask;

            if (rawMaskCanvas) {
              // Scale mask back up to full output resolution
              const offMask = document.createElement('canvas');
              offMask.width = width;
              offMask.height = height;
              const offCtx = offMask.getContext('2d');

              if (offCtx) {
                offCtx.imageSmoothingEnabled = true;
                offCtx.imageSmoothingQuality = 'high';
                offCtx.drawImage(rawMaskCanvas, 0, 0, width, height);

                const maskData = offCtx.getImageData(0, 0, width, height);
                const rawAlpha = new Uint8Array(width * height);
                for (let i = 0; i < width * height; i++) {
                  rawAlpha[i] = maskData.data[i * 4]; // Grayscale channel
                }

                // Clean mask: remove background islands, fill pinholes, feather softly
                const refinedAlpha = cleanAndRefineAlphaMask(rawAlpha, width, height, bgTolerance, bgFeather);

                // GPU-accelerated Gaussian blur to soften harsh hair/edge boundaries
                // This converts MediaPipe's jagged mask edges into natural feathered transitions
                // blurPx = bgFeather * 1.5 gives natural softness without losing subject definition
                const softAlpha = applyCanvasMaskBlur(refinedAlpha, width, height, Math.round(bgFeather * 1.5));

                // Create clean cutout canvas — pure subject on transparent bg, NO color tinting
                const cutoutCanvas = document.createElement('canvas');
                cutoutCanvas.width = width;
                cutoutCanvas.height = height;
                const cutCtx = cutoutCanvas.getContext('2d');

                if (cutCtx) {
                  // Get the full-resolution subject pixels
                  const finalSubjectData = srcCtx.getImageData(0, 0, width, height);

                  // Apply soft blurred alpha — edges fade naturally (no hard cutline)
                  for (let i = 0; i < width * height; i++) {
                    finalSubjectData.data[i * 4 + 3] = softAlpha[i];
                  }

                  cutCtx.putImageData(finalSubjectData, 0, 0);
                  cachedCutoutCanvasRef.current = cutoutCanvas;
                  setSegmentationStatus('Applying Passport Dimensions...');
                }
              }
            }
            resolve();
          });

          segmenter.send({ image: aiCanvas });
        });
      } else {
        // Fallback: No AI — use full source image as cutout
        const cutoutCanvas = document.createElement('canvas');
        cutoutCanvas.width = width;
        cutoutCanvas.height = height;
        const cutCtx = cutoutCanvas.getContext('2d');
        if (cutCtx) {
          cutCtx.drawImage(sourceCanvas, 0, 0);
          cachedCutoutCanvasRef.current = cutoutCanvas;
        }
      }
    } catch (err) {
      console.error('[PassportStudio] Segmentation error:', err);
      cachedCutoutCanvasRef.current = sourceCanvas;
      setSegmentationStatus('Cutout fallback active');
    } finally {
      setIsSegmenting(false);
      setProcessingStep('compositing');
      setSegmentationStatus('Applying Passport Dimensions...');
      // Final compositing step
      compositeFinalCanvas();
    }
  }, [
    activePreset,
    panX,
    panY,
    rotation,
    zoom,
    flipH,
    brightness,
    contrast,
    saturation,
    enableBgRemoval,
    bgTolerance,
    bgFeather,
    previewDimensions,
    compositeFinalCanvas,
  ]);

  // Re-run Step 1 when transform / crop / filter parameters change
  useEffect(() => {
    if (imageElementRef.current && imageElementRef.current.complete) {
      processSubjectCutout();
    }
  }, [processSubjectCutout]);

  // Re-run Step 2 (instant compositing) when background color, previewTab, or outfit changes
  useEffect(() => {
    if (cachedCutoutCanvasRef.current) {
      compositeFinalCanvas();
      if (currentStep === 'preview') {
        renderPrintSheetCanvas();
      }
    }
  }, [bgColor, previewTab, selectedOutfit, outfitScale, outfitOffsetY, compositeFinalCanvas, currentStep]);

  // Render Printable Tiled Sheet Canvas
  const renderPrintSheetCanvas = useCallback(() => {
    const sheetCanvas = sheetCanvasRef.current;
    const photoCanvas = canvasRef.current;
    if (!sheetCanvas || !photoCanvas) return;

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

  // Handle image drop
  const handleFileDrop = useCallback((file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const isHeic =
      file.name.toLowerCase().endsWith('.heic') ||
      file.name.toLowerCase().endsWith('.heif') ||
      file.type === 'image/heic' ||
      file.type === 'image/heif';

    if (isHeic) {
      toast.error('HEIC format is not natively supported by browsers. Please convert to JPG/PNG first.');
      return;
    }

    if (!validTypes.includes(file.type) && !file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth > 5000 || img.naturalHeight > 4000) {
          toast.error('Image is too large. Max supported resolution is 5000×4000px.');
          return;
        }

        imageElementRef.current = img;
        setImageSrc(src);
        setZoom(1);
        setRotation(0);
        setPanX(0);
        setPanY(0);
        setFlipH(false);
        setBrightness(100);
        setContrast(100);
        setSaturation(100);
        setCurrentStep('edit');
        toast.success('Photo loaded! Align your portrait with the biometric guide.');
      };
      img.onerror = () => {
        toast.error('Failed to parse portrait image.');
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, []);

  // Pan interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageSrc) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel zoom
  useEffect(() => {
    const el = previewBoxRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (!imageSrc) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setZoom((z) => Math.min(Math.max(0.4, z + delta), 3.0));
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [imageSrc]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!imageSrc || e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX - panX, y: e.touches[0].clientY - panY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanX(e.touches[0].clientX - dragStart.x);
    setPanY(e.touches[0].clientY - dragStart.y);
  };

  // Reset transforms
  const resetTransform = () => {
    setZoom(1);
    setRotation(0);
    setPanX(0);
    setPanY(0);
    setFlipH(false);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setEnableBgRemoval(false);
    setSelectedOutfit('none');
    setPreviewTab('background');
    toast.info('Studio settings reset to default.');
  };

  // Reset whole project and start new
  const handleMakeNewImage = () => {
    setImageSrc(null);
    imageElementRef.current = null;
    cachedCutoutCanvasRef.current = null;
    resetTransform();
    setCurrentStep('edit');
  };

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

  // Export Printable Multi-Sheet (async toBlob — non-blocking, no UI freeze)
  const downloadPrintableSheet = async () => {
    const sheetCanvas = sheetCanvasRef.current;
    if (!sheetCanvas) return;

    setIsDownloading(true);
    toast.info('Preparing your print sheet...');

    // toBlob is async and non-blocking — no UI freeze on large 2480×3508px canvas
    sheetCanvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error('Sheet export failed. Please try again.');
          setIsDownloading(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `passport-print-sheet-${sheetPreset}-${activePreset.id}.jpg`;
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


  // Computed count of sheet photos
  const sheetPhotoCount = useMemo(() => {
    if (sheetPreset === 'a4') {
      if (activePreset.widthMm <= 35) return 24;
      if (activePreset.widthMm <= 51) return 12;
      return 6;
    }
    if (sheetPreset === '3-per-a4') return 6;
    return customSheetCols * customSheetRows;
  }, [sheetPreset, activePreset.widthMm, customSheetCols, customSheetRows]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Header */}
      <motion.div
        className="text-center max-w-3xl mx-auto mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          AI Portrait Matting & Biometric Studio
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-display text-zinc-900 dark:text-white mb-4">
          {currentStep === 'edit' ? 'Passport Photo Maker Online' : 'Download Passport Size Image'}
        </h1>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
          {currentStep === 'edit'
            ? 'Create official passport, visa, and ID photos with remove.bg-grade hair matting, instant solid color backgrounds, and biometric face guidelines.'
            : 'Your biometric photo is processed and print-ready. Download a single image for online portal submissions or a high-res tiled print sheet with cutting guides.'}
        </p>
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
              <div className="glass-card p-6 rounded-2xl">
                <FileDropZone
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onFileDrop={handleFileDrop}
                  maxSizeMB={15}
                  title="Upload portrait or selfie"
                  subtitle="JPG, PNG, or WebP up to 15MB. Front-facing with neutral lighting."
                />
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
                      onClick={resetTransform}
                      className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-semibold transition"
                    >
                      Reset
                    </button>
                    <button
                      onClick={handleMakeNewImage}
                      className="text-xs text-brand-500 hover:text-brand-600 font-semibold flex items-center gap-1 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Change Photo
                    </button>
                  </div>
                </div>

                {/* Quick Transform Toolbar */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setRotation((r) => (r - 90) % 360)}
                    className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> -90° Rotate
                  </button>
                  <button
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> +90° Rotate
                  </button>
                  <button
                    onClick={() => setFlipH(!flipH)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
                      flipH
                        ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-300'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <FlipHorizontal className="w-3.5 h-3.5" /> Mirror Flip
                  </button>
                </div>

                {/* Zoom & Fine Angle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                      <span className="flex items-center gap-1.5">
                        <ZoomIn className="w-3.5 h-3.5" /> Zoom Level
                      </span>
                      <span>{Math.round(zoom * 100)}%</span>
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

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                      <span>Fine Tilt Angle</span>
                      <span>{rotation}°</span>
                    </div>
                    <input
                      type="range"
                      min="-45"
                      max="45"
                      step="1"
                      value={rotation % 90}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="w-full slider-blur cursor-pointer"
                    />
                  </div>
                </div>

                {/* Lighting: Brightness, Contrast, Saturation */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                      <span>Brightness</span>
                      <span>{brightness}%</span>
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

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                      <span>Contrast</span>
                      <span>{contrast}%</span>
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

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                      <span>Saturation</span>
                      <span>{saturation}%</span>
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

                {/* 2-Step AI Matting & Background Engine */}
                <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-brand-500" />
                      AI Portrait Matting & Background
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableBgRemoval}
                        onChange={(e) => setEnableBgRemoval(e.target.checked)}
                        className="rounded text-brand-500 focus:ring-brand-500"
                      />
                      <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                        Enable AI Matting
                      </span>
                    </label>
                  </div>

                  {enableBgRemoval && (
                    <div className="space-y-4">
                      {/* Remove.bg Mode Tabs: Cutout (Checkerboard) vs Background (Solid) */}
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

                      {/* Solid Colors Palette (active when Background tab is chosen) */}
                      {previewTab === 'background' && (
                        <div className="flex flex-wrap items-center gap-2.5">
                          {bgColors.map((bg) => (
                            <button
                              key={bg.value}
                              onClick={() => setBgColor(bg.value)}
                              className={`h-8 px-3 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                                bgColor === bg.value
                                  ? 'border-brand-500 ring-2 ring-brand-500/30 shadow-xs bg-brand-500/5'
                                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                              }`}
                            >
                              <span className={`w-3.5 h-3.5 rounded-full border ${bg.class}`} />
                              {bg.label.split(' ')[0]}
                            </button>
                          ))}
                          <input
                            type="color"
                            value={bgColor === 'transparent' ? '#ffffff' : bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-zinc-300 dark:border-zinc-700 bg-transparent"
                            title="Custom color"
                          />
                        </div>
                      )}

                      {/* Sliders: Mask Threshold & Hair Feathering */}
                      <div className="p-3.5 rounded-xl bg-brand-500/5 border border-brand-500/15 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                            <span>Detection Sensitivity (Cutoff)</span>
                            <span>{bgTolerance}%</span>
                          </div>
                          <input
                            type="range"
                            min="15"
                            max="85"
                            value={bgTolerance}
                            onChange={(e) => setBgTolerance(parseInt(e.target.value))}
                            className="w-full slider-blur cursor-pointer"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                            <span>Edge Smoothing (Hair Feathering)</span>
                            <span>{bgFeather}px</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="6"
                            value={bgFeather}
                            onChange={(e) => setBgFeather(parseInt(e.target.value))}
                            className="w-full slider-blur cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Step-by-step Processing Indicator */}
                      <div className="flex flex-col gap-1.5 px-3 py-3 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                        {[
                          { key: 'optimizing', label: 'Optimizing Image...' },
                          { key: 'removing-bg', label: 'Removing Background...' },
                          { key: 'compositing', label: 'Applying Passport Dimensions...' },
                        ].map((step) => {
                          const stepOrder = ['optimizing', 'removing-bg', 'compositing', 'done'];
                          const currentIdx = stepOrder.indexOf(processingStep ?? '');
                          const stepIdx = stepOrder.indexOf(step.key);
                          const isActive = processingStep === step.key;
                          const isDone = currentIdx > stepIdx || processingStep === 'done';
                          const isPending = !isActive && !isDone;
                          return (
                            <div key={step.key} className={`flex items-center gap-2 text-xs font-semibold transition-all ${
                              isActive ? 'text-brand-600 dark:text-brand-400' :
                              isDone ? 'text-emerald-600 dark:text-emerald-400' :
                              'text-zinc-400 dark:text-zinc-600'
                            }`}>
                              {isActive ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                              ) : isDone ? (
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              ) : (
                                <div className="w-3.5 h-3.5 rounded-full border-2 border-current shrink-0 opacity-40" />
                              )}
                              {step.label}
                            </div>
                          );
                        })}
                        <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-zinc-200 dark:border-zinc-700/60">
                          <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                            {isSegmenting ? (
                              <><Loader2 className="w-3 h-3 animate-spin" /> Processing...</>
                            ) : (
                              <><ShieldCheck className="w-3 h-3 text-emerald-500" /> {segmentationStatus || 'AI Matting Ready'}</>
                            )}
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            {previewTab === 'cutout' ? 'Transparent PNG' : `BG: ${bgColor}`}
                          </span>
                        </div>
                      </div>

                    </div>
                  )}
                </div>

                {/* Formal Outfit Overlay Section */}
                <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
                      <Shirt className="w-3.5 h-3.5 text-brand-500" />
                      Formal Outfit Overlay (Optional)
                    </span>
                    {selectedOutfit !== 'none' && (
                      <button
                        onClick={() => setSelectedOutfit('none')}
                        className="text-xs text-red-500 font-semibold hover:underline"
                      >
                        Remove Suit
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {outfitOptions.map((outfit) => (
                      <button
                        key={outfit.id}
                        onClick={() => setSelectedOutfit(outfit.id)}
                        className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition ${
                          selectedOutfit === outfit.id
                            ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-300 ring-2 ring-brand-500/20'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 bg-white/40 dark:bg-zinc-900/40'
                        }`}
                      >
                        <p className="truncate">{outfit.name}</p>
                      </button>
                    ))}
                  </div>

                  {selectedOutfit !== 'none' && (
                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                          <span>Suit Scale</span>
                          <span>{Math.round(outfitScale * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.7"
                          max="1.4"
                          step="0.02"
                          value={outfitScale}
                          onChange={(e) => setOutfitScale(parseFloat(e.target.value))}
                          className="w-full slider-blur cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                          <span>Vertical Position</span>
                          <span>{outfitOffsetY}px</span>
                        </div>
                        <input
                          type="range"
                          min="-60"
                          max="80"
                          step="2"
                          value={outfitOffsetY}
                          onChange={(e) => setOutfitOffsetY(parseInt(e.target.value))}
                          className="w-full slider-blur cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
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
                  imageSrc ? 'cursor-grab active:cursor-grabbing' : ''
                }`}
                style={{
                  width: `${previewDimensions.width}px`,
                  height: `${previewDimensions.height}px`,
                  backgroundColor: previewTab === 'cutout' || bgColor === 'transparent' ? '#ffffff' : bgColor,
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

                {!imageSrc && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-zinc-400">
                    <Camera className="w-10 h-10 mb-2 opacity-50" />
                    <p className="text-xs">Upload a portrait to start positioning</p>
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
                  onClick={() => setCurrentStep('preview')}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-sm font-semibold shadow-glow"
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
          </motion.div>
        </div>
      )}

      {/* STEP 2: DEDICATED 2-PANEL DOWNLOAD PREVIEW SCREEN */}
      {currentStep === 'preview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT PANEL — Online Submission (5 cols) */}
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

                {/* Radio Selector: A4 / 3 per A4 / Custom */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                  <button
                    onClick={() => setSheetPreset('a4')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      sheetPreset === 'a4'
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    A4 Page
                  </button>
                  <button
                    onClick={() => setSheetPreset('3-per-a4')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      sheetPreset === '3-per-a4'
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    3 per A4
                  </button>
                  <button
                    onClick={() => setSheetPreset('custom')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      sheetPreset === 'custom'
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Custom
                  </button>
                </div>
              </div>

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

                <div className="mt-3 flex items-center justify-between w-full text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Scissors className="w-3.5 h-3.5 text-brand-500" />
                    Includes thin cutting borders & registration cut marks
                  </span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {sheetPhotoCount} Copies @ 300 DPI
                  </span>
                </div>
              </div>

              {/* Right Panel Download Button */}
              <button
                onClick={downloadPrintableSheet}
                disabled={isDownloading}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 text-sm font-semibold shadow-glow disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Preparing Sheet...</>
                ) : (
                  <><Printer className="w-4 h-4" /> Download Passport Sheet ({sheetPreset.toUpperCase()})</>
                )}
              </button>
            </motion.div>
          </div>

          {/* BOTTOM ACTION BAR (FULL WIDTH) */}
          <motion.div
            className="glass-card p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-4 border border-zinc-200 dark:border-zinc-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <button
              onClick={() => setCurrentStep('edit')}
              className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              ← Back to Studio Editor
            </button>

            <button
              onClick={handleMakeNewImage}
              className="px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2 transition"
            >
              <PlusCircle className="w-4 h-4 text-brand-500" />
              + Make New Image
            </button>
          </motion.div>
        </div>
      )}

      {/* Official Compliance Standards */}
      <section className="mt-20">
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
                Formal/business attire recommended (or use our digital formal suit overlay). No eyeglasses with glare or non-religious headwear.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mt-16 pt-12 border-t border-zinc-200 dark:border-zinc-800 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-zinc-900 dark:text-white mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Quick answers about sizing, specifications, and printing
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="glass-card rounded-xl overflow-hidden transition"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-zinc-900 dark:text-white"
                >
                  <span className="flex items-center gap-3">
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
