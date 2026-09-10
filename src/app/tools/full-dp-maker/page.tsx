'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Maximize,
  Upload,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  ZoomIn,
  Sliders,
  Download,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  ChevronDown,
  HelpCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Palette,
  Image as ImageIcon,
  Check,
  FileDown,
  Settings2,
  Crop,
  Copy,
  Share2,
  Sparkle,
  Smartphone,
  CheckCircle,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import FileDropZone from '@/components/FileDropZone';
import { WhatsAppIcon, InstagramIcon, FacebookIcon, TelegramIcon, TwitterXIcon, LinkedInIcon, YouTubeIcon } from '@/components/SocialIcons';

type FillMode = 'blur' | 'color' | 'gradient' | 'mirror' | 'resize' | 'crop';
type ImageFormat = 'image/jpeg' | 'image/png' | 'image/webp';
type SocialPlatform = 'whatsapp' | 'instagram' | 'facebook' | 'telegram' | 'twitter' | 'linkedin' | 'youtube' | 'custom';

interface PresetSize {
  id: string;
  label: string;
  size: number;
  description: string;
}

interface SocialPlatformPreset {
  id: SocialPlatform;
  name: string;
  size: number;
  label: string;
  color: string;
  gradient: string;
  bgColor: string;
  borderColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

const socialPlatformPresets: SocialPlatformPreset[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp DP',
    size: 500,
    label: '500 × 500 px',
    color: 'from-[#25D366] to-[#128C7E]',
    gradient: 'linear-gradient(135deg, #25D366, #128C7E)',
    bgColor: 'bg-[#25D366]/10 border-[#25D366]/30',
    borderColor: 'border-[#25D366]',
    icon: WhatsAppIcon,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    size: 320,
    label: '320 × 320 px',
    color: 'from-[#E1306C] via-[#C13584] to-[#833AB4]',
    gradient: 'linear-gradient(135deg, #833AB4, #C13584, #E1306C)',
    bgColor: 'bg-[#E1306C]/10 border-[#C13584]/30',
    borderColor: 'border-[#C13584]',
    icon: InstagramIcon,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    size: 170,
    label: '170 × 170 px',
    color: 'from-[#1877F2] to-[#0C5CC7]',
    gradient: 'linear-gradient(135deg, #1877F2, #0C5CC7)',
    bgColor: 'bg-[#1877F2]/10 border-[#1877F2]/30',
    borderColor: 'border-[#1877F2]',
    icon: FacebookIcon,
  },
  {
    id: 'telegram',
    name: 'Telegram',
    size: 512,
    label: '512 × 512 px',
    color: 'from-[#2CA5E0] to-[#1B8BC1]',
    gradient: 'linear-gradient(135deg, #2CA5E0, #1B8BC1)',
    bgColor: 'bg-[#2CA5E0]/10 border-[#2CA5E0]/30',
    borderColor: 'border-[#2CA5E0]',
    icon: TelegramIcon,
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    size: 400,
    label: '400 × 400 px',
    color: 'from-[#14171A] to-[#333]',
    gradient: 'linear-gradient(135deg, #14171A, #444)',
    bgColor: 'bg-zinc-900/10 border-zinc-600/30',
    borderColor: 'border-zinc-700',
    icon: TwitterXIcon,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    size: 400,
    label: '400 × 400 px',
    color: 'from-[#0A66C2] to-[#0050A0]',
    gradient: 'linear-gradient(135deg, #0A66C2, #0050A0)',
    bgColor: 'bg-[#0A66C2]/10 border-[#0A66C2]/30',
    borderColor: 'border-[#0A66C2]',
    icon: LinkedInIcon,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    size: 800,
    label: '800 × 800 px',
    color: 'from-[#FF0000] to-[#CC0000]',
    gradient: 'linear-gradient(135deg, #FF0000, #CC0000)',
    bgColor: 'bg-[#FF0000]/10 border-[#FF0000]/30',
    borderColor: 'border-[#FF0000]',
    icon: YouTubeIcon,
  },
];

const sizePresets: PresetSize[] = [
  { id: '1024', label: '1024 × 1024 px', size: 1024, description: 'Recommended HD (Universal standard)' },
  { id: '500', label: '500 × 500 px', size: 500, description: 'WhatsApp Profile Picture' },
  { id: '800', label: '800 × 800 px', size: 800, description: 'Facebook & YouTube Avatar' },
  { id: '1200', label: '1200 × 1200 px', size: 1200, description: 'Instagram High-Resolution' },
  { id: '2048', label: '2048 × 2048 px', size: 2048, description: 'Ultra HD 4K Avatar' },
  { id: 'original', label: 'Original Max Fit', size: 0, description: 'Preserve full camera resolution' },
  { id: 'custom', label: 'Custom Dimension', size: -1, description: 'Specify exact pixel width (1–10,000px)' },
];

const colorSwatches = [
  { label: 'Pure White', value: '#ffffff', class: 'bg-white border-zinc-300' },
  { label: 'Dark Slate', value: '#0f172a', class: 'bg-slate-900 border-slate-700' },
  { label: 'Soft Cream', value: '#fef3c7', class: 'bg-amber-100 border-amber-300' },
  { label: 'Pastel Sky', value: '#e0f2fe', class: 'bg-sky-100 border-sky-300' },
  { label: 'Pastel Rose', value: '#fce7f3', class: 'bg-pink-100 border-pink-300' },
  { label: 'Deep Navy', value: '#1e293b', class: 'bg-slate-800 border-slate-600' },
  { label: 'Emerald Glow', value: '#064e3b', class: 'bg-emerald-900 border-emerald-700' },
  { label: 'Royal Purple', value: '#581c87', class: 'bg-purple-900 border-purple-700' },
];

const gradientPresets = [
  { name: 'Sunset Glow', c1: '#f43f5e', c2: '#fb923c', angle: 135 },
  { name: 'Ocean Breeze', c1: '#0284c7', c2: '#38bdf8', angle: 135 },
  { name: 'Cyberpunk', c1: '#8b5cf6', c2: '#ec4899', angle: 135 },
  { name: 'Emerald Wave', c1: '#059669', c2: '#34d399', angle: 135 },
  { name: 'Midnight', c1: '#0f172a', c2: '#334155', angle: 135 },
  { name: 'Soft Peach', c1: '#fed7aa', c2: '#fbcfe8', angle: 135 },
];

const platformSizes = [
  { platform: 'WhatsApp', size: '500 × 500 px', minSize: '192 × 192 px', shape: 'Circle', notes: 'Displayed as circle in chat & contacts' },
  { platform: 'Instagram', size: '320 × 320 px', minSize: '110 × 110 px', shape: 'Circle', notes: 'Best exported at 1024px for sharp retina screens' },
  { platform: 'Facebook', size: '170 × 170 px', minSize: '800 × 800 px recommended', shape: 'Circle', notes: 'Shown as circle on mobile, square on pages' },
  { platform: 'Telegram', size: '512 × 512 px', minSize: '512 × 512 px', shape: 'Circle', notes: 'Auto-crops to circle with high compression' },
  { platform: 'Twitter / X', size: '400 × 400 px', minSize: '200 × 200 px', shape: 'Circle', notes: 'Max file size 2MB (JPG or PNG)' },
  { platform: 'LinkedIn', size: '400 × 400 px', minSize: '400 × 400 px', shape: 'Circle', notes: 'Professional business portraits' },
  { platform: 'YouTube', size: '800 × 800 px', minSize: '98 × 98 px', shape: 'Circle', notes: 'Channel avatar across web & mobile' },
  { platform: 'Discord', size: '128 × 128 px', minSize: '512 × 512 px recommended', shape: 'Circle', notes: 'Supports animated GIF or static DP' },
];

const faqs = [
  {
    q: 'Why do WhatsApp and Instagram cut off my profile pictures?',
    a: 'WhatsApp, Instagram, and Facebook mandate a strict 1:1 square ratio for profile pictures, and then display them inside a circular mask. If your photo is a portrait (tall) or landscape (wide), the app forces you to crop out friends, scenery, or your full outfit. Full DP Maker fits your whole photo inside a square and fills the empty margins with aesthetic blur, color, or gradient backgrounds.',
  },
  {
    q: 'Does the circular guide appear on the downloaded image?',
    a: 'No! The circular dashed guide is strictly a preview aid inside the tool to help you ensure faces and text stay safely inside the avatar boundary. The exported file is a clean, crisp square image.',
  },
  {
    q: 'What is the best background fill mode?',
    a: 'The "Blur" mode is the most popular choice used by influencers and creators: it scales your photo into the background with a soft Gaussian blur, making your profile picture feel expansive and natural. For clean minimal aesthetics, the "Color" (White or Black) and "Gradient" modes are also favorites.',
  },
  {
    q: 'Is my photo uploaded to any server?',
    a: 'Never. Compixor processes all image manipulations, Gaussian blurs, gradients, and exports 100% client-side in your web browser memory sandbox. Your personal photos never leave your device.',
  },
  {
    q: 'Can I paste an image directly from my clipboard?',
    a: 'Yes! Just take a screenshot or copy any image and press Ctrl+V (or Cmd+V on Mac) anywhere on this page to load it instantly.',
  },
];

export default function FullDpMakerPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Fill mode
  const [fillMode, setFillMode] = useState<FillMode>('blur');

  // Fill settings
  const [blurAmount, setBlurAmount] = useState<number>(25);
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [gradientColor1, setGradientColor1] = useState<string>('#8b5cf6');
  const [gradientColor2, setGradientColor2] = useState<string>('#ec4899');
  const [gradientAngle, setGradientAngle] = useState<number>(135);
  const [mirrorBlur, setMirrorBlur] = useState<number>(10);

  // Foreground photo adjustments
  const [zoom, setZoom] = useState<number>(1.0);
  const [photoSize, setPhotoSize] = useState<number>(100); // 20% to 100% (allows shrinking photo to comfortably fit in circle)
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [cornerRadius, setCornerRadius] = useState<number>(0);
  const [enableShadow, setEnableShadow] = useState<boolean>(false);
  const [enableBorder, setEnableBorder] = useState<boolean>(false);

  // Guide and preview
  const [showCircleGuide, setShowCircleGuide] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Export settings
  const [selectedSizePreset, setSelectedSizePreset] = useState<string>('1024');
  const [customSizeInput, setCustomSizeInput] = useState<number>(1024);
  const [exportFormat, setExportFormat] = useState<ImageFormat>('image/jpeg');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [downloadedInfo, setDownloadedInfo] = useState<{ size: string; res: string } | null>(null);

  // Social platform selection
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('whatsapp');

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Canvases & refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);
  const previewBoxRef = useRef<HTMLDivElement>(null);

  const previewCanvasSize = 540;

  // Clipboard paste support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            handleFileLoad(file);
            toast.success('Pasted image from clipboard!');
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Compute final export dimensions
  const finalExportDimension = useMemo(() => {
    if (selectedSizePreset === 'custom') {
      return Math.min(10000, Math.max(1, customSizeInput || 1024));
    }
    if (selectedSizePreset === 'original') {
      return Math.max(naturalSize.width, naturalSize.height) || 1024;
    }
    const preset = sizePresets.find((p) => p.id === selectedSizePreset);
    return preset ? preset.size : 1024;
  }, [selectedSizePreset, customSizeInput, naturalSize]);

  // Main Canvas Render Logic (shared between preview and export)
  const renderSquareDP = useCallback(
    (targetCanvas: HTMLCanvasElement, renderSize: number, isExport: boolean = false) => {
      const img = imageElementRef.current;
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const ctx = targetCanvas.getContext('2d');
      if (!ctx) return;

      targetCanvas.width = renderSize;
      targetCanvas.height = renderSize;

      const W = renderSize;
      const H = renderSize;
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;

      // Scale pan coordinates proportionally to target resolution
      const scaleCoord = renderSize / previewCanvasSize;
      const scaledPanX = panX * scaleCoord;
      const scaledPanY = panY * scaleCoord;

      ctx.clearRect(0, 0, W, H);

      // -------------------------------------------------------------
      // 1. BACKGROUND FILL RENDERING
      // -------------------------------------------------------------
      if (fillMode === 'blur') {
        // Blur background: scale image up to cover the square canvas
        const coverScale = Math.max(W / imgW, H / imgH);
        const bgW = imgW * coverScale;
        const bgH = imgH * coverScale;

        ctx.save();
        const scaledBlur = Math.round(blurAmount * (renderSize / 600));
        ctx.filter = `blur(${scaledBlur}px) brightness(95%) saturate(115%)`;
        ctx.drawImage(img, (W - bgW) / 2, (H - bgH) / 2, bgW, bgH);
        ctx.restore();

        // Subtle dark scrim so foreground photo pops
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, W, H);
      } else if (fillMode === 'color') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, W, H);
      } else if (fillMode === 'gradient') {
        const rad = (gradientAngle * Math.PI) / 180;
        const x1 = W / 2 - (Math.cos(rad) * W) / 2;
        const y1 = H / 2 - (Math.sin(rad) * H) / 2;
        const x2 = W / 2 + (Math.cos(rad) * W) / 2;
        const y2 = H / 2 + (Math.sin(rad) * H) / 2;

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, gradientColor1);
        grad.addColorStop(1, gradientColor2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      } else if (fillMode === 'mirror') {
        // Mirror fill: flip edges outward to fill empty margins
        ctx.save();
        if (mirrorBlur > 0) {
          const scaledMirrorBlur = Math.round(mirrorBlur * (renderSize / 600));
          ctx.filter = `blur(${scaledMirrorBlur}px)`;
        }

        const isLandscape = imgW >= imgH;
        if (isLandscape) {
          // Empty space is on top & bottom: draw mirrored copies above & below
          const fitH = (W / imgW) * imgH;
          const emptyMargin = (H - fitH) / 2;

          // Top mirror
          ctx.save();
          ctx.translate(0, emptyMargin);
          ctx.scale(1, -1);
          ctx.drawImage(img, 0, 0, W, fitH);
          ctx.restore();

          // Bottom mirror
          ctx.save();
          ctx.translate(0, H - emptyMargin);
          ctx.scale(1, -1);
          ctx.drawImage(img, 0, -fitH, W, fitH);
          ctx.restore();
        } else {
          // Empty space is on left & right: draw mirrored copies left & right
          const fitW = (H / imgH) * imgW;
          const emptyMargin = (W - fitW) / 2;

          // Left mirror
          ctx.save();
          ctx.translate(emptyMargin, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(img, 0, 0, fitW, H);
          ctx.restore();

          // Right mirror
          ctx.save();
          ctx.translate(W - emptyMargin, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(img, -fitW, 0, fitW, H);
          ctx.restore();
        }
        ctx.restore();

        // Subtle shadow/seam barrier
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, W, H);
      } else if (fillMode === 'resize') {
        // Direct stretch to fill square
        ctx.drawImage(img, 0, 0, W, H);
        return; // Full stretch doesn't require foreground overlay
      } else if (fillMode === 'crop') {
        // Standard zoom/drag square crop
        const coverScale = Math.max(W / imgW, H / imgH) * zoom;
        const cropW = imgW * coverScale;
        const cropH = imgH * coverScale;

        ctx.save();
        ctx.translate(W / 2 + scaledPanX, H / 2 + scaledPanY);
        ctx.rotate((rotation * Math.PI) / 180);
        if (flipH) ctx.scale(-1, 1);
        ctx.drawImage(img, -cropW / 2, -cropH / 2, cropW, cropH);
        ctx.restore();
        return; // Fill & crop doesn't require separate foreground overlay
      }

      // -------------------------------------------------------------
      // 2. FOREGROUND PHOTO RENDERING (For Blur, Color, Gradient, Mirror)
      // -------------------------------------------------------------
      const baseFitScale = Math.min(W / imgW, H / imgH);
      const effectiveScale = baseFitScale * (photoSize / 100) * zoom;
      const fgW = imgW * effectiveScale;
      const fgH = imgH * effectiveScale;

      ctx.save();
      ctx.translate(W / 2 + scaledPanX, H / 2 + scaledPanY);
      ctx.rotate((rotation * Math.PI) / 180);
      if (flipH) ctx.scale(-1, 1);

      // Optional Drop Shadow
      if (enableShadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = Math.round(18 * scaleCoord);
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = Math.round(6 * scaleCoord);
      }

      // Optional Rounded Corners on foreground photo
      if (cornerRadius > 0) {
        const scaledRadius = Math.round(cornerRadius * scaleCoord);
        ctx.beginPath();
        const rx = -fgW / 2;
        const ry = -fgH / 2;
        const rw = fgW;
        const rh = fgH;
        ctx.roundRect(rx, ry, rw, rh, scaledRadius);
        ctx.clip();
      }

      ctx.drawImage(img, -fgW / 2, -fgH / 2, fgW, fgH);

      // Optional Thin Border
      if (enableBorder) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = Math.round(3 * scaleCoord);
        ctx.strokeRect(-fgW / 2, -fgH / 2, fgW, fgH);
      }

      ctx.restore();
    },
    [
      fillMode,
      blurAmount,
      bgColor,
      gradientColor1,
      gradientColor2,
      gradientAngle,
      mirrorBlur,
      zoom,
      photoSize,
      rotation,
      flipH,
      panX,
      panY,
      cornerRadius,
      enableShadow,
      enableBorder,
    ]
  );

  // Redraw preview canvas on any change
  useEffect(() => {
    if (canvasRef.current && imageElementRef.current && imageElementRef.current.complete) {
      renderSquareDP(canvasRef.current, previewCanvasSize, false);
    }
  }, [renderSquareDP, imageSrc]);

  // Load image file
  const handleFileLoad = useCallback((file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
    if (!validTypes.includes(file.type) && !file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        imageElementRef.current = img;
        setImageSrc(src);
        setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
        setZoom(1.0);
        setPhotoSize(100);
        setRotation(0);
        setPanX(0);
        setPanY(0);
        setFlipH(false);
        setDownloadSuccess(false);
        toast.success(`Photo loaded (${img.naturalWidth} × ${img.naturalHeight} px)!`);
      };
      img.onerror = () => {
        toast.error('Failed to parse image file.');
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, []);

  // Pan interactions (mouse drag & touch drag on canvas)
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

  // Wheel zoom on preview
  useEffect(() => {
    const el = previewBoxRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (!imageSrc) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setZoom((z) => Math.min(Math.max(0.4, z + delta), 2.5));
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [imageSrc]);

  // Touch pan
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

  // Reset tool
  const resetAllSettings = () => {
    setZoom(1.0);
    setPhotoSize(100);
    setRotation(0);
    setPanX(0);
    setPanY(0);
    setFlipH(false);
    setFillMode('blur');
    setBlurAmount(25);
    setBgColor('#ffffff');
    setCornerRadius(0);
    setEnableShadow(false);
    setEnableBorder(false);
    toast.info('Settings reset to default.');
  };

  // Start new image
  const startNewImage = () => {
    setImageSrc(null);
    imageElementRef.current = null;
    resetAllSettings();
    setDownloadSuccess(false);
  };

  // Export Full DP Image
  const handleDownload = () => {
    const img = imageElementRef.current;
    if (!img) return;

    const exportCanvas = document.createElement('canvas');
    renderSquareDP(exportCanvas, finalExportDimension, true);

    const ext = exportFormat === 'image/png' ? 'png' : exportFormat === 'image/webp' ? 'webp' : 'jpg';
    const quality = exportFormat === 'image/png' ? undefined : 0.95;

    exportCanvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error('Failed to export image.');
          return;
        }

        const sizeKb = Math.round(blob.size / 1024);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `full-dp-${finalExportDimension}x${finalExportDimension}.${ext}`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setDownloadedInfo({
          size: `${sizeKb} KB`,
          res: `${finalExportDimension} × ${finalExportDimension} px`,
        });
        setDownloadSuccess(true);
        toast.success(`Downloaded ${finalExportDimension}×${finalExportDimension} DP (${sizeKb} KB)!`);
      },
      exportFormat,
      quality
    );
  };

  // Select a social platform preset — syncs resolution and ensures full-photo fill mode
  const selectPlatform = useCallback(
    (platformId: SocialPlatform) => {
      setSelectedPlatform(platformId);
      const preset = socialPlatformPresets.find((p) => p.id === platformId);
      if (preset) {
        setSelectedSizePreset(String(preset.size));
        // If user is in 'crop' mode, switch to 'blur' to preserve the full photo
        if (fillMode === 'crop' || fillMode === 'resize') {
          setFillMode('blur');
        }
      }
    },
    [fillMode]
  );

  // 1-Click Download: instantly export at the active platform resolution
  const handleOneClickDownload = useCallback(
    (platformId?: SocialPlatform) => {
      const img = imageElementRef.current;
      if (!img) {
        toast.info('Upload a photo first to download your DP!');
        return;
      }

      const targetPlatform = platformId ?? selectedPlatform;
      const preset = socialPlatformPresets.find((p) => p.id === targetPlatform);
      if (!preset) return;

      const exportSize = preset.size;
      const exportCanvas = document.createElement('canvas');
      renderSquareDP(exportCanvas, exportSize, true);

      const ext = exportFormat === 'image/png' ? 'png' : exportFormat === 'image/webp' ? 'webp' : 'jpg';
      const quality = exportFormat === 'image/png' ? undefined : 0.95;

      exportCanvas.toBlob(
        (blob) => {
          if (!blob) {
            toast.error('Failed to export image.');
            return;
          }
          const sizeKb = Math.round(blob.size / 1024);
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `${targetPlatform}-dp-${exportSize}x${exportSize}.${ext}`;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          setDownloadedInfo({ size: `${sizeKb} KB`, res: `${exportSize} × ${exportSize} px` });
          setDownloadSuccess(true);
          toast.success(`${preset.name} DP downloaded! (${exportSize}×${exportSize}px, ${sizeKb} KB)`);
        },
        exportFormat,
        quality
      );
    },
    [selectedPlatform, exportFormat, renderSquareDP]
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 md:py-16">
      {/* Header */}
      <motion.div
        className="text-center max-w-3xl mx-auto mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20 mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          No Crop Profile Picture Maker
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-display text-zinc-900 dark:text-white mb-4">
          Full DP Maker Online
        </h1>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
          Create full-size profile pictures for WhatsApp, Instagram, Facebook, and Telegram without cropping anything out.
          Fit whole portraits or landscape shots with aesthetic blur, color, gradient, and mirror backgrounds.
        </p>
      </motion.div>

      {/* Main App Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-8 items-start">
        {/* Left Side: Controls & Background Fill Modes (7 cols) */}
        <motion.div
          className="lg:col-span-7 space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Upload Area */}
          {!imageSrc ? (
            <div className="glass-card p-4 sm:p-6 rounded-3xl space-y-4">
              <FileDropZone
                accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
                onFileDrop={handleFileLoad}
                maxSizeMB={20}
                title="Drop photo here or click to browse"
                subtitle="Supports JPG, PNG, WebP up to 20MB. You can also paste from clipboard (Ctrl+V)!"
              />
              <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 pt-2">
                <Copy className="w-3.5 h-3.5 text-brand-500" />
                <span>Tip: Press <strong>Ctrl+V</strong> or <strong>Cmd+V</strong> anywhere to paste an image directly!</span>
              </div>
            </div>
          ) : (
            /* Editing Controls */
            <div className="glass-card p-4 sm:p-6 rounded-3xl space-y-5 sm:space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div>
                  <h3 className="text-sm font-bold font-display text-zinc-900 dark:text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-brand-500" />
                    Background Fill Mode
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Choose how the empty square margins are filled
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={resetAllSettings}
                    className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-semibold transition"
                  >
                    Reset
                  </button>
                  <button
                    onClick={startNewImage}
                    className="text-xs text-brand-500 hover:text-brand-600 font-semibold flex items-center gap-1 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    New Photo
                  </button>
                </div>
              </div>

              {/* ── Social Platform Preset Selector ── */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-brand-500" />
                  Platform Preset — 1:1 Square DP
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {socialPlatformPresets.map((platform) => {
                    const PlatformIcon = platform.icon;
                    const isActive = selectedPlatform === platform.id;
                    return (
                      <button
                        key={platform.id}
                        id={`platform-${platform.id}`}
                        onClick={() => selectPlatform(platform.id)}
                        className={`relative py-2.5 px-2 rounded-2xl border-2 text-center transition-all duration-200 overflow-hidden ${
                          isActive
                            ? `${platform.bgColor} shadow-md`
                            : 'border-zinc-200 dark:border-zinc-700/70 bg-white/40 dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-600'
                        }`}
                      >
                        {/* Active gradient shimmer strip */}
                        {isActive && (
                          <div
                            className={`absolute inset-x-0 top-0 h-[3px] rounded-t-xl bg-gradient-to-r ${platform.color}`}
                          />
                        )}
                        <PlatformIcon
                          className={`w-4 h-4 mx-auto mb-1 transition-colors ${
                            isActive ? 'text-zinc-800 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'
                          }`}
                        />
                        <span
                          className={`block text-[10px] font-bold leading-tight truncate ${
                            isActive ? 'text-zinc-800 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          {platform.name}
                        </span>
                        <span className="block text-[9px] text-zinc-500 dark:text-zinc-500 mt-0.5 font-mono truncate">
                          {platform.label}
                        </span>
                        {isActive && (
                          <span
                            className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-br ${platform.color}`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-500 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                  Full photo is preserved — no cropping. Selecting a platform sets the download resolution automatically.
                </p>
              </div>

              {/* Background Fill Modes Switcher */}

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {(
                  [
                    { id: 'blur', label: 'Blur', desc: 'Gaussian blur' },
                    { id: 'color', label: 'Color', desc: 'Solid tint' },
                    { id: 'gradient', label: 'Gradient', desc: '2-Color linear' },
                    { id: 'mirror', label: 'Mirror', desc: 'Reflect edges' },
                    { id: 'resize', label: 'Stretch', desc: 'Distort square' },
                    { id: 'crop', label: 'Crop', desc: 'Standard fill' },
                  ] as { id: FillMode; label: string; desc: string }[]
                ).map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setFillMode(mode.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      fillMode === mode.id
                        ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-300 ring-2 ring-brand-500/20 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 bg-white/40 dark:bg-zinc-900/40'
                    }`}
                  >
                    <span className="block font-bold text-xs">{mode.label}</span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate block">{mode.desc}</span>
                  </button>
                ))}
              </div>

              {/* Fill Mode Specific Settings */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-4">
                {/* 1. Blur Mode Settings */}
                {fillMode === 'blur' && (
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                      <span>Gaussian Blur Strength</span>
                      <span>{blurAmount}px</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="60"
                      value={blurAmount}
                      onChange={(e) => setBlurAmount(parseInt(e.target.value))}
                      className="w-full slider-blur cursor-pointer"
                    />
                  </div>
                )}

                {/* 2. Color Mode Settings */}
                {fillMode === 'color' && (
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block">
                      Choose Background Color
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {colorSwatches.map((swatch) => (
                        <button
                          key={swatch.value}
                          onClick={() => setBgColor(swatch.value)}
                          className={`h-8 px-3 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                            bgColor === swatch.value
                              ? 'border-brand-500 ring-2 ring-brand-500/30 shadow-xs'
                              : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full border ${swatch.class}`} />
                          {swatch.label.split(' ')[0]}
                        </button>
                      ))}
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-zinc-300 dark:border-zinc-700 bg-transparent"
                        title="Custom color"
                      />
                    </div>
                  </div>
                )}

                {/* 3. Gradient Mode Settings */}
                {fillMode === 'gradient' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {gradientPresets.map((gp) => (
                        <button
                          key={gp.name}
                          onClick={() => {
                            setGradientColor1(gp.c1);
                            setGradientColor2(gp.c2);
                            setGradientAngle(gp.angle);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white shadow-xs transition hover:scale-105"
                          style={{
                            background: `linear-gradient(135deg, ${gp.c1}, ${gp.c2})`,
                          }}
                        >
                          {gp.name}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                          Start Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={gradientColor1}
                            onChange={(e) => setGradientColor1(e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-zinc-300 dark:border-zinc-700 bg-transparent"
                          />
                          <span className="text-xs font-mono">{gradientColor1}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                          End Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={gradientColor2}
                            onChange={(e) => setGradientColor2(e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-zinc-300 dark:border-zinc-700 bg-transparent"
                          />
                          <span className="text-xs font-mono">{gradientColor2}</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                          <span>Angle</span>
                          <span>{gradientAngle}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={gradientAngle}
                          onChange={(e) => setGradientAngle(parseInt(e.target.value))}
                          className="w-full slider-blur cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Mirror Mode Settings */}
                {fillMode === 'mirror' && (
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                      <span>Edge Seam Softening (Mirror Blur)</span>
                      <span>{mirrorBlur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={mirrorBlur}
                      onChange={(e) => setMirrorBlur(parseInt(e.target.value))}
                      className="w-full slider-blur cursor-pointer"
                    />
                  </div>
                )}

                {/* 5. Resize Mode Settings */}
                {fillMode === 'resize' && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Stretches your photo to directly fill the square. Great for near-square photos where slight aspect ratio change isn't noticeable.
                  </p>
                )}

                {/* 6. Crop Mode Settings */}
                {fillMode === 'crop' && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Traditional square crop. Use the zoom slider and drag the photo on the right to position your crop.
                  </p>
                )}
              </div>

              {/* Foreground Photo Adjustments */}
              {fillMode !== 'resize' && (
                <div className="space-y-4 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
                    <Maximize className="w-3.5 h-3.5 text-brand-500" />
                    Photo Sizing & Position
                  </h4>

                  {/* Photo Size & Zoom Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                        <span>Fit Inside Circle (Photo Size)</span>
                        <span>{photoSize}%</span>
                      </div>
                      <input
                        type="range"
                        min="25"
                        max="100"
                        value={photoSize}
                        onChange={(e) => setPhotoSize(parseInt(e.target.value))}
                        className="w-full slider-blur cursor-pointer"
                      />
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 block">
                        Shrink to 70–80% to fit the entire rectangle inside WhatsApp/Instagram circular avatars!
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                        <span>Zoom</span>
                        <span>{Math.round(zoom * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.02"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full slider-blur cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Rotate & Flip toolbar */}
                  <div className="flex flex-wrap gap-2 pt-2">
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
                    <button
                      onClick={() => {
                        setPanX(0);
                        setPanY(0);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition"
                    >
                      Center Photo
                    </button>
                  </div>

                  {/* Optional Styling Effects */}
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                        <span>Corner Radius</span>
                        <span>{cornerRadius}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        value={cornerRadius}
                        onChange={(e) => setCornerRadius(parseInt(e.target.value))}
                        className="w-full slider-blur cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enableShadow}
                          onChange={(e) => setEnableShadow(e.target.checked)}
                          className="rounded text-brand-500 focus:ring-brand-500"
                        />
                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          Drop Shadow
                        </span>
                      </label>
                    </div>
                    <div className="flex items-center gap-2 pt-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enableBorder}
                          onChange={(e) => setEnableBorder(e.target.checked)}
                          className="rounded text-brand-500 focus:ring-brand-500"
                        />
                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          White Border
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Right Side: Interactive Preview & Download Settings (5 cols) */}
        <motion.div
          className="lg:col-span-5 lg:sticky lg:top-24 space-y-5 md:space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="glass-card p-4 sm:p-6 md:p-8 rounded-3xl text-center space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-display text-zinc-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-brand-500" />
                DP Live Preview
              </h3>

              {/* Circle Avatar Crop Guide Switch */}
              <button
                onClick={() => setShowCircleGuide(!showCircleGuide)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  showCircleGuide
                    ? 'bg-brand-500/15 text-brand-600 dark:text-brand-300 border border-brand-500/30'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700'
                }`}
                title="Toggle circle avatar crop guide"
              >
                {showCircleGuide ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {showCircleGuide ? 'Circle Guide On' : 'Circle Guide Off'}
              </button>
            </div>

            {/* Square Canvas Box */}
            <div
              ref={previewBoxRef}
              className={`relative mx-auto rounded-2xl overflow-hidden shadow-2xl border border-zinc-300 dark:border-zinc-700 select-none aspect-square max-w-[380px] w-full ${
                imageSrc ? 'cursor-grab active:cursor-grabbing' : ''
              }`}
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
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50">
                  <ImageIcon className="w-12 h-12 mb-3 opacity-40" />
                  <p className="text-xs font-medium">Upload or paste a photo to start</p>
                </div>
              )}

              {/* Circle Avatar Crop Guide Overlay (Preview-Only) */}
              {imageSrc && showCircleGuide && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Subtle darkening outside the circle */}
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <defs>
                      <mask id="circle-mask">
                        <rect width="100" height="100" fill="white" />
                        <circle cx="50" cy="50" r="49" fill="black" />
                      </mask>
                    </defs>
                    <rect width="100" height="100" fill="rgba(0, 0, 0, 0.45)" mask="url(#circle-mask)" />
                    <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="1.2" strokeDasharray="3 2" />
                  </svg>

                  {/* Label badge — updates with active platform */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white uppercase tracking-wider whitespace-nowrap">
                    {socialPlatformPresets.find((p) => p.id === selectedPlatform)?.name ?? 'WhatsApp'} Circle Guide
                  </div>
                </div>
              )}
            </div>

            {/* Drag instruction */}
            {imageSrc && (
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-1">
                <span>🖱️ Drag canvas to reposition • Scroll mouse wheel to zoom</span>
              </p>
            )}

            {/* ── 1-Click Download DP — Prominent Action ── */}
            {imageSrc ? (
              <div className="space-y-3">
                {/* Main 1-click button */}
                <button
                  id="one-click-download-dp"
                  onClick={() => handleOneClickDownload()}
                  className="w-full relative overflow-hidden rounded-2xl py-3.5 px-4 flex items-center justify-center gap-3 font-bold text-sm text-white shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl"
                  style={{
                    background: socialPlatformPresets.find((p) => p.id === selectedPlatform)?.gradient ?? 'linear-gradient(135deg, #25D366, #128C7E)',
                  }}
                >
                  {/* Subtle shimmer overlay */}
                  <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity rounded-2xl" />
                  <Zap className="w-5 h-5 shrink-0" />
                  <span className="flex flex-col items-start leading-tight">
                    <span className="text-sm font-black">1-Click Download DP</span>
                    <span className="text-[11px] font-medium opacity-90">
                      {socialPlatformPresets.find((p) => p.id === selectedPlatform)?.name} •{' '}
                      {socialPlatformPresets.find((p) => p.id === selectedPlatform)?.label} • No Crop
                    </span>
                  </span>
                  <Download className="w-4 h-4 shrink-0 ml-auto" />
                </button>

                {/* Quick download pills for other platforms */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {socialPlatformPresets
                    .filter((p) => p.id !== selectedPlatform)
                    .map((platform) => {
                      const PlatformIcon = platform.icon;
                      return (
                        <button
                          key={platform.id}
                          onClick={() => handleOneClickDownload(platform.id)}
                          title={`Download ${platform.name} (${platform.label})`}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 bg-white/50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all"
                        >
                          <PlatformIcon className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[60px]">{platform.name.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            ) : (
              /* No photo yet — show teaser button */
              <button
                id="one-click-download-dp-empty"
                onClick={() => toast.info('Upload a photo first to enable 1-click DP download.')}
                className="w-full rounded-2xl py-4 px-5 flex items-center justify-center gap-3 font-bold text-sm border-2 border-dashed border-zinc-300 dark:border-zinc-600 text-zinc-400 dark:text-zinc-500 hover:border-brand-400 hover:text-brand-500 transition-all duration-200"
              >
                <Zap className="w-5 h-5" />
                <span className="text-sm">1-Click Download DP</span>
                <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">Upload first</span>
              </button>
            )}

            {/* Export Settings Panel */}
            {imageSrc && (
              <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-left">
                {/* Size Preset Selector */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Output Resolution
                  </label>
                  <select
                    value={selectedSizePreset}
                    onChange={(e) => setSelectedSizePreset(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  >
                    {sizePresets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label} ({p.description})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom numeric dimension input */}
                {selectedSizePreset === 'custom' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                      Custom Size (1 to 10,000 px)
                    </label>
                    <input
                      type="number"
                      min="100"
                      max="10000"
                      value={customSizeInput}
                      onChange={(e) => setCustomSizeInput(parseInt(e.target.value) || 1024)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                    />
                  </div>
                )}

                {/* Output Format Selector */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Image File Format
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: 'image/jpeg', label: 'JPG / JPEG' },
                        { id: 'image/png', label: 'PNG' },
                        { id: 'image/webp', label: 'WEBP' },
                      ] as { id: ImageFormat; label: string }[]
                    ).map((fmt) => (
                      <button
                        key={fmt.id}
                        onClick={() => setExportFormat(fmt.id)}
                        className={`py-2 rounded-xl text-xs font-semibold border transition ${
                          exportFormat === fmt.id
                            ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-300 ring-2 ring-brand-500/20'
                            : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-sm font-semibold shadow-glow"
                >
                  <Download className="w-4 h-4" />
                  Download Full DP ({finalExportDimension} × {finalExportDimension} px)
                </button>

                {/* Post Download Confirmation Banner */}
                {downloadSuccess && downloadedInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2"
                  >
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                      <CheckCircle className="w-4 h-4" />
                      DP Exported Successfully ({downloadedInfo.res} • {downloadedInfo.size})
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleDownload}
                        className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-brand-500 underline"
                      >
                        Download again
                      </button>
                      <span className="text-zinc-400">•</span>
                      <button
                        onClick={startNewImage}
                        className="text-xs font-semibold text-brand-500 hover:underline"
                      >
                        Make another DP
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Section 1: How It Works & Why Social Media Crops */}
      <section className="mt-20">
        <div className="glass-card p-8 rounded-3xl space-y-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold font-display text-zinc-900 dark:text-white mb-2">
              Why Social Media Cuts Off Your Photos (And How to Fix It)
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              When you take photos with your smartphone camera, they are naturally shot in <strong>3:4, 9:16 portrait</strong>, or <strong>16:9 landscape</strong> ratios.
              However, WhatsApp, Instagram, Telegram, and Facebook only accept <strong>1:1 square profile photos</strong>, forcing you to crop out the edges.
              Full DP Maker intelligently fits your whole photo inside a square canvas without stretching or cropping, filling the empty borders with an aesthetic blur or color background.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
              <span className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black text-sm">
                1
              </span>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Upload or Paste Photo</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Drag and drop your full body portrait, group shot, or landscape picture. You can even press Ctrl+V to paste from clipboard.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
              <span className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black text-sm">
                2
              </span>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Choose Background Fill</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Select from Gaussian Blur, solid colors, smooth 2-color gradients, or outward mirror reflections.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
              <span className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black text-sm">
                3
              </span>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Check Circle & Download</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Use the dashed circle guide to ensure faces and text stay visible, then download in high-res 1024px or 4K.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Reference Table of Profile Picture Sizes by Platform */}
      <section className="mt-16">
        <div className="glass-card p-8 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-zinc-900 dark:text-white">
                Social Media Profile Picture Size Guide (2026)
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                Official profile picture and avatar dimensions across all major apps
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300">
              1:1 Aspect Ratio
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                  <th className="py-3 px-4 font-bold">Platform</th>
                  <th className="py-3 px-4 font-bold">Recommended DP Size</th>
                  <th className="py-3 px-4 font-bold">Display Shape</th>
                  <th className="py-3 px-4 font-bold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {platformSizes.map((p) => (
                  <tr key={p.platform} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition">
                    <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-white">
                      {p.platform}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-brand-600 dark:text-brand-400 font-semibold">
                      {p.size}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-300">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[11px] font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        {p.shape}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-zinc-500 dark:text-zinc-400">
                      {p.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 3: Frequently Asked Questions */}
      <section className="mt-16 pt-12 border-t border-zinc-200 dark:border-zinc-800 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-zinc-900 dark:text-white mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Everything you need to know about creating full-size DPs without cropping
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
