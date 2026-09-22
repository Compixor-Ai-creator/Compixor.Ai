'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  Link as LinkIcon,
  Type,
  Wifi,
  User,
  Mail,
  Phone,
  Download,
  Copy,
  Check,
  Sparkles,
  Palette,
  Sliders,
  ShieldCheck,
  Zap,
  HelpCircle,
  ChevronDown,
  Upload,
  X,
  Image as ImageIcon,
  Layers,
  Wand2,
} from 'lucide-react';
import { toast } from 'sonner';
import RelatedTools from '@/components/RelatedTools';
import ClientSideTrustSection from '@/components/ClientSideTrustSection';
import FaqSection from '@/components/FaqSection';
import { qrGeneratorFaqs } from '@/data/faqs';

type TabType = 'url' | 'text' | 'wifi' | 'contact' | 'email' | 'phone';
type DotType = 'square' | 'dots' | 'rounded' | 'classy' | 'extra-rounded';
type CornerType = 'square' | 'dot' | 'extra-rounded';
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

interface StylePreset {
  id: string;
  name: string;
  description?: string;
  fgColor: string;
  bgColor: string;
  cornerColor: string;
  dotType: DotType;
  cornerType: CornerType;
  gradientCss?: string;
  gradient?: {
    type: 'linear' | 'radial';
    rotation?: number;
    colorStops: { offset: number; color: string }[];
  };
}

const solidPresets: StylePreset[] = [
  {
    id: 'compixor-blue',
    name: 'Electric Blue',
    fgColor: '#2563eb',
    bgColor: '#ffffff',
    cornerColor: '#1d4ed8',
    dotType: 'rounded',
    cornerType: 'extra-rounded',
  },
  {
    id: 'cyber-neon',
    name: 'Cyber Violet',
    fgColor: '#7c3aed',
    bgColor: '#faf5ff',
    cornerColor: '#6d28d9',
    dotType: 'classy',
    cornerType: 'extra-rounded',
  },
  {
    id: 'emerald-luxe',
    name: 'Emerald Luxe',
    fgColor: '#059669',
    bgColor: '#f0fdf4',
    cornerColor: '#047857',
    dotType: 'dots',
    cornerType: 'dot',
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Orange',
    fgColor: '#ea580c',
    bgColor: '#fff7ed',
    cornerColor: '#c2410c',
    dotType: 'rounded',
    cornerType: 'extra-rounded',
  },
  {
    id: 'midnight-dark',
    name: 'Obsidian Black',
    fgColor: '#0f172a',
    bgColor: '#ffffff',
    cornerColor: '#0f172a',
    dotType: 'square',
    cornerType: 'square',
  },
];

const gradientPresets: StylePreset[] = [
  {
    id: 'aurora-gradient',
    name: 'Aurora Gradient',
    description: 'blue → purple → pink',
    fgColor: '#3b82f6',
    bgColor: '#ffffff',
    cornerColor: '#8b5cf6',
    dotType: 'rounded',
    cornerType: 'extra-rounded',
    gradientCss: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
    gradient: {
      type: 'linear',
      rotation: Math.PI / 4,
      colorStops: [
        { offset: 0, color: '#3b82f6' },
        { offset: 0.5, color: '#8b5cf6' },
        { offset: 1, color: '#ec4899' },
      ],
    },
  },
  {
    id: 'sunset-gradient',
    name: 'Sunset Gradient',
    description: 'orange → red → pink',
    fgColor: '#f97316',
    bgColor: '#ffffff',
    cornerColor: '#ef4444',
    dotType: 'rounded',
    cornerType: 'extra-rounded',
    gradientCss: 'linear-gradient(135deg, #f97316 0%, #ef4444 50%, #ec4899 100%)',
    gradient: {
      type: 'linear',
      rotation: Math.PI / 4,
      colorStops: [
        { offset: 0, color: '#f97316' },
        { offset: 0.5, color: '#ef4444' },
        { offset: 1, color: '#ec4899' },
      ],
    },
  },
  {
    id: 'ocean-gradient',
    name: 'Ocean Gradient',
    description: 'cyan → blue → violet',
    fgColor: '#06b6d4',
    bgColor: '#ffffff',
    cornerColor: '#3b82f6',
    dotType: 'rounded',
    cornerType: 'extra-rounded',
    gradientCss: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%)',
    gradient: {
      type: 'linear',
      rotation: Math.PI / 4,
      colorStops: [
        { offset: 0, color: '#06b6d4' },
        { offset: 0.5, color: '#3b82f6' },
        { offset: 1, color: '#6366f1' },
      ],
    },
  },
  {
    id: 'forest-gradient',
    name: 'Forest Gradient',
    description: 'emerald → teal → dark green',
    fgColor: '#10b981',
    bgColor: '#ffffff',
    cornerColor: '#0d9488',
    dotType: 'rounded',
    cornerType: 'extra-rounded',
    gradientCss: 'linear-gradient(135deg, #10b981 0%, #0d9488 50%, #064e3b 100%)',
    gradient: {
      type: 'linear',
      rotation: Math.PI / 4,
      colorStops: [
        { offset: 0, color: '#10b981' },
        { offset: 0.5, color: '#0d9488' },
        { offset: 1, color: '#064e3b' },
      ],
    },
  },
  {
    id: 'neon-gradient',
    name: 'Neon Gradient',
    description: 'violet → magenta → electric blue',
    fgColor: '#8b5cf6',
    bgColor: '#ffffff',
    cornerColor: '#d946ef',
    dotType: 'classy',
    cornerType: 'extra-rounded',
    gradientCss: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 50%, #06b6d4 100%)',
    gradient: {
      type: 'linear',
      rotation: Math.PI / 4,
      colorStops: [
        { offset: 0, color: '#8b5cf6' },
        { offset: 0.5, color: '#d946ef' },
        { offset: 1, color: '#06b6d4' },
      ],
    },
  },
  {
    id: 'golden-gradient',
    name: 'Golden Gradient',
    description: 'yellow → orange → coral',
    fgColor: '#eab308',
    bgColor: '#ffffff',
    cornerColor: '#f97316',
    dotType: 'rounded',
    cornerType: 'extra-rounded',
    gradientCss: 'linear-gradient(135deg, #eab308 0%, #f97316 50%, #f43f5e 100%)',
    gradient: {
      type: 'linear',
      rotation: Math.PI / 4,
      colorStops: [
        { offset: 0, color: '#eab308' },
        { offset: 0.5, color: '#f97316' },
        { offset: 1, color: '#f43f5e' },
      ],
    },
  },
  {
    id: 'ice-gradient',
    name: 'Ice Gradient',
    description: 'white → cyan → light blue',
    fgColor: '#0891b2',
    bgColor: '#ffffff',
    cornerColor: '#0284c7',
    dotType: 'rounded',
    cornerType: 'extra-rounded',
    gradientCss: 'linear-gradient(135deg, #ffffff 0%, #22d3ee 50%, #38bdf8 100%)',
    gradient: {
      type: 'linear',
      rotation: Math.PI / 4,
      colorStops: [
        { offset: 0, color: '#cffafe' },
        { offset: 0.5, color: '#06b6d4' },
        { offset: 1, color: '#0284c7' },
      ],
    },
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    description: 'multi-color gradient',
    fgColor: '#8b5cf6',
    bgColor: '#ffffff',
    cornerColor: '#7c3aed',
    dotType: 'rounded',
    cornerType: 'extra-rounded',
    gradientCss: 'linear-gradient(135deg, #ef4444 0%, #f97316 20%, #eab308 40%, #10b981 60%, #06b6d4 80%, #8b5cf6 100%)',
    gradient: {
      type: 'linear',
      rotation: Math.PI / 4,
      colorStops: [
        { offset: 0, color: '#ef4444' },
        { offset: 0.2, color: '#f97316' },
        { offset: 0.4, color: '#eab308' },
        { offset: 0.6, color: '#10b981' },
        { offset: 0.8, color: '#06b6d4' },
        { offset: 1, color: '#8b5cf6' },
      ],
    },
  },
  {
    id: 'cosmic-violet',
    name: 'Cosmic Violet',
    description: 'indigo → purple → magenta',
    fgColor: '#6366f1',
    bgColor: '#ffffff',
    cornerColor: '#9333ea',
    dotType: 'classy',
    cornerType: 'extra-rounded',
    gradientCss: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 50%, #e11d48 100%)',
    gradient: {
      type: 'linear',
      rotation: Math.PI / 4,
      colorStops: [
        { offset: 0, color: '#4f46e5' },
        { offset: 0.5, color: '#9333ea' },
        { offset: 1, color: '#e11d48' },
      ],
    },
  },
  {
    id: 'solar-flare',
    name: 'Solar Flare',
    description: 'amber → red → dark crimson',
    fgColor: '#f59e0b',
    bgColor: '#ffffff',
    cornerColor: '#dc2626',
    dotType: 'rounded',
    cornerType: 'extra-rounded',
    gradientCss: 'linear-gradient(135deg, #fbbf24 0%, #f87171 50%, #991b1b 100%)',
    gradient: {
      type: 'linear',
      rotation: Math.PI / 4,
      colorStops: [
        { offset: 0, color: '#fbbf24' },
        { offset: 0.5, color: '#f87171' },
        { offset: 1, color: '#991b1b' },
      ],
    },
  },
  {
    id: 'mint-breeze',
    name: 'Mint Breeze',
    description: 'lime → emerald → cyan',
    fgColor: '#10b981',
    bgColor: '#ffffff',
    cornerColor: '#06b6d4',
    dotType: 'rounded',
    cornerType: 'extra-rounded',
    gradientCss: 'linear-gradient(135deg, #84cc16 0%, #10b981 50%, #06b6d4 100%)',
    gradient: {
      type: 'linear',
      rotation: Math.PI / 4,
      colorStops: [
        { offset: 0, color: '#84cc16' },
        { offset: 0.5, color: '#10b981' },
        { offset: 1, color: '#06b6d4' },
      ],
    },
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    description: 'blush → peach → gold',
    fgColor: '#f43f5e',
    bgColor: '#ffffff',
    cornerColor: '#fb923c',
    dotType: 'rounded',
    cornerType: 'extra-rounded',
    gradientCss: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 50%, #fbbf24 100%)',
    gradient: {
      type: 'linear',
      rotation: Math.PI / 4,
      colorStops: [
        { offset: 0, color: '#f43f5e' },
        { offset: 0.5, color: '#fb923c' },
        { offset: 1, color: '#fbbf24' },
      ],
    },
  },
];

const stylePresets: StylePreset[] = [...solidPresets, ...gradientPresets];

const tabs = [
  { id: 'url' as TabType, label: 'Website URL', icon: LinkIcon },
  { id: 'text' as TabType, label: 'Plain Text', icon: Type },
  { id: 'wifi' as TabType, label: 'Wi-Fi Network', icon: Wifi },
  { id: 'contact' as TabType, label: 'vCard Contact', icon: User },
  { id: 'email' as TabType, label: 'Email Message', icon: Mail },
  { id: 'phone' as TabType, label: 'Phone Call', icon: Phone },
];

export default function QrGeneratorPage() {
  const [activeTab, setActiveTab] = useState<TabType>('url');

  // Input states
  const [urlInput, setUrlInput] = useState('https://compixor.ai');
  const [textInput, setTextInput] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactOrg, setContactOrg] = useState('');
  const [contactTitle, setContactTitle] = useState('');

  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  const [phoneNum, setPhoneNum] = useState('');

  // Styling states
  const [fgColor, setFgColor] = useState('#2563eb');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [cornerColor, setCornerColor] = useState('#1d4ed8');
  const [dotType, setDotType] = useState<DotType>('rounded');
  const [cornerType, setCornerType] = useState<CornerType>('extra-rounded');
  const [ecLevel, setEcLevel] = useState<ErrorCorrectionLevel>('M');
  const [gradient, setGradient] = useState<{
    type: 'linear' | 'radial';
    rotation?: number;
    colorStops: { offset: number; color: string }[];
  } | null>(null);

  // Logo / Image in center
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(0.35);
  const [logoMargin, setLogoMargin] = useState(6);

  const [copied, setCopied] = useState(false);

  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const presetsScrollRef = useRef<HTMLDivElement>(null);
  const gradientScrollRef = useRef<HTMLDivElement>(null);

  // Enable horizontal scrolling with mouse wheel over presets rows
  useEffect(() => {
    const el1 = presetsScrollRef.current;
    const el2 = gradientScrollRef.current;

    const createWheelHandler = (el: HTMLDivElement | null) => (e: WheelEvent) => {
      if (el && el.scrollWidth > el.clientWidth && e.deltaY !== 0 && !e.shiftKey) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    const handler1 = createWheelHandler(el1);
    const handler2 = createWheelHandler(el2);

    if (el1) el1.addEventListener('wheel', handler1, { passive: false });
    if (el2) el2.addEventListener('wheel', handler2, { passive: false });

    return () => {
      if (el1) el1.removeEventListener('wheel', handler1);
      if (el2) el2.removeEventListener('wheel', handler2);
    };
  }, []);

  // Apply a preset
  const applyPreset = (preset: StylePreset) => {
    setFgColor(preset.fgColor);
    setBgColor(preset.bgColor);
    setCornerColor(preset.cornerColor);
    setDotType(preset.dotType);
    setCornerType(preset.cornerType);
    setGradient(preset.gradient || null);
    toast.success(`Applied ${preset.name} style preset!`);
  };

  // Compute final QR payload
  const getQrValue = (): string => {
    switch (activeTab) {
      case 'url':
        return urlInput.trim() || 'https://compixor.ai';
      case 'text':
        return textInput.trim() || 'CompixorAi Client-Side Tools';
      case 'wifi':
        return `WIFI:T:${wifiEncryption};S:${wifiSsid};P:${wifiPassword};H:${wifiHidden ? 'true' : 'false'};;`;
      case 'contact':
        return `BEGIN:VCARD\nVERSION:3.0\nN:${contactName}\nFN:${contactName}\nTITLE:${contactTitle}\nORG:${contactOrg}\nTEL:${contactPhone}\nEMAIL:${contactEmail}\nEND:VCARD`;
      case 'email':
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case 'phone':
        return `tel:${phoneNum.replace(/\s+/g, '')}`;
      default:
        return 'https://compixor.ai';
    }
  };

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoImage(event.target?.result as string);
      // Auto-bump error correction to High for reliable scanning with logos
      setEcLevel('H');
      toast.success('Logo added to QR center (Error correction upgraded to High).');
    };
    reader.readAsDataURL(file);
  };

  // Initialize and update QRCodeStyling
  useEffect(() => {
    let isMounted = true;

    async function renderQr() {
      if (typeof window === 'undefined') return;

      try {
        const QRCodeStyling = (await import('qr-code-styling')).default;

        const options: any = {
          width: 200,
          height: 200,
          type: 'svg',
          data: getQrValue(),
          dotsOptions: {
            color: fgColor,
            type: dotType,
            gradient: gradient || undefined,
          },
          backgroundOptions: {
            color: bgColor,
          },
          cornersSquareOptions: {
            color: cornerColor,
            type: cornerType,
            gradient: gradient || undefined,
          },
          cornersDotOptions: {
            color: cornerColor,
            gradient: gradient || undefined,
          },
          qrOptions: {
            errorCorrectionLevel: logoImage ? 'H' : ecLevel,
          },
        };

        if (logoImage) {
          options.image = logoImage;
          options.imageOptions = {
            hideBackgroundDots: true,
            imageSize: logoSize,
            margin: logoMargin,
            crossOrigin: 'anonymous',
          };
        } else {
          options.image = undefined;
        }

        if (!qrCodeInstance.current) {
          qrCodeInstance.current = new QRCodeStyling(options);
        } else {
          qrCodeInstance.current.update(options);
        }

        if (qrRef.current && isMounted && qrRef.current.children.length === 0) {
          qrCodeInstance.current.append(qrRef.current);
        }
      } catch (err) {
        console.error('Failed to render QR Code:', err);
      }
    }

    renderQr();

    return () => {
      isMounted = false;
    };
  }, [
    activeTab,
    urlInput,
    textInput,
    wifiSsid,
    wifiPassword,
    wifiEncryption,
    wifiHidden,
    contactName,
    contactPhone,
    contactEmail,
    contactOrg,
    contactTitle,
    emailTo,
    emailSubject,
    emailBody,
    phoneNum,
    fgColor,
    bgColor,
    cornerColor,
    dotType,
    cornerType,
    ecLevel,
    gradient,
    logoImage,
    logoSize,
    logoMargin,
  ]);

  const handleDownload = async (extension: 'png' | 'svg') => {
    if (!qrCodeInstance.current) return;
    try {
      if (extension === 'png') {
        qrCodeInstance.current.update({ width: 1000, height: 1000 });
        await qrCodeInstance.current.download({
          name: `compixor-qr-${Date.now()}`,
          extension,
        });
        qrCodeInstance.current.update({ width: 200, height: 200 });
      } else {
        await qrCodeInstance.current.download({
          name: `compixor-qr-${Date.now()}`,
          extension,
        });
      }
      toast.success(`QR code downloaded as ${extension.toUpperCase()}!`);
    } catch (err) {
      toast.error('Failed to download QR code');
    }
  };

  const handleCopy = async () => {
    if (!qrRef.current) return;
    try {
      const svg = qrRef.current.querySelector('svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        img.onload = () => {
          if (ctx) {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, 600, 600);
            ctx.drawImage(img, 0, 0, 600, 600);
            canvas.toBlob(async (blob) => {
              if (blob) {
                await navigator.clipboard.write([
                  new ClipboardItem({ 'image/png': blob }),
                ]);
                setCopied(true);
                toast.success('QR Code copied to clipboard!');
                setTimeout(() => setCopied(false), 2000);
              }
            });
          }
        };
      }
    } catch (err) {
      toast.error('Copy to clipboard is not supported in this browser.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        {/* Hero Section Illustration: Smartphone camera scanning colorful QR code with sparkle/checkmark */}
        <div className="mx-auto w-24 h-24 mb-6 p-4 rounded-3xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-brand-500/20 shadow-xs flex items-center justify-center relative">
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Phone outline */}
            <rect x="18" y="8" width="28" height="48" rx="5" className="stroke-zinc-700 dark:stroke-zinc-300" strokeWidth="2.5" fill="none" />
            <line x1="28" y1="12" x2="36" y2="12" className="stroke-zinc-400" strokeWidth="2" strokeLinecap="round" />
            {/* Phone Screen with QR pattern */}
            <rect x="22" y="16" width="20" height="20" rx="2" className="fill-brand-500/10" />
            <rect x="24" y="18" width="6" height="6" className="fill-blue-600" />
            <rect x="34" y="18" width="6" height="6" className="fill-purple-600" />
            <rect x="24" y="28" width="6" height="6" className="fill-indigo-600" />
            <rect x="32" y="28" width="3" height="3" className="fill-brand-500" />
            <rect x="37" y="31" width="3" height="3" className="fill-purple-500" />
            {/* Camera Viewfinder Crosshairs */}
            <path d="M15 15H12V18M49 15H52V18M15 49H12V46M49 49H52V46" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Laser scan bar */}
            <line x1="14" y1="32" x2="50" y2="32" stroke="#ec4899" strokeWidth="2" strokeDasharray="3 2" />
            {/* Sparkle checkmark badge */}
            <circle cx="48" cy="46" r="9" className="fill-emerald-500 shadow-sm" />
            <path d="M44 46L47 49L52 43" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20 mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Pro Customizer • Logo Embedding • Unlimited Free
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-display text-zinc-900 dark:text-white mb-4">
          Free QR Code Generator Online
        </h1>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 mb-6">
          Create high-resolution, branded QR codes for websites, Wi-Fi networks, vCards, and emails.
          Embed custom logos, choose themes, and export print-ready vector SVGs.
        </p>

        {/* Content Type Icons Row (6 items) */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-300 font-medium">
            <LinkIcon className="w-3.5 h-3.5" /> Website URL
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-300 font-medium">
            <Type className="w-3.5 h-3.5" /> Plain Text
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-300 font-medium">
            <Wifi className="w-3.5 h-3.5" /> Wi-Fi Access
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-300 font-medium">
            <User className="w-3.5 h-3.5" /> vCard Contact
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-300 font-medium">
            <Mail className="w-3.5 h-3.5" /> Email
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-300 font-medium">
            <Phone className="w-3.5 h-3.5" /> Phone Call
          </div>
        </div>
      </div>

      {/* Presets Rows Container */}
      <div className="w-full max-w-7xl mx-auto mb-10 space-y-3">
        {/* Row 1: Solid Color Presets */}
        <div
          ref={presetsScrollRef}
          className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-1 px-1 sm:px-2 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 min-w-[155px] flex items-center gap-1.5 shrink-0 select-none">
            <Wand2 className="w-3.5 h-3.5 text-brand-500" /> Presets:
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {solidPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 hover:border-brand-500 hover:text-brand-500 dark:hover:text-brand-300 transition shadow-sm flex items-center gap-1.5 shrink-0 whitespace-nowrap"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: preset.fgColor }}
                />
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Gradient Presets */}
        <div
          ref={gradientScrollRef}
          className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 px-1 sm:px-2 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 min-w-[155px] flex items-center gap-1.5 shrink-0 select-none">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" /> GRADIENT PRESETS:
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {gradientPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                title={preset.description ? `${preset.name} (${preset.description})` : preset.name}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 hover:border-brand-500 hover:text-brand-500 dark:hover:text-brand-300 transition shadow-sm flex items-center gap-1.5 shrink-0 whitespace-nowrap"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 ring-[0.5px] ring-black/10 dark:ring-white/20"
                  style={{ background: preset.gradientCss || preset.fgColor }}
                />
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tab Selection */}
          <div className="glass-card p-1.5 flex flex-wrap gap-1 rounded-2xl">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-md'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Content Inputs */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold font-display text-zinc-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-500" />
              Content Parameters
            </h3>

            {activeTab === 'url' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Destination URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/promo"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm transition"
                  />
                </div>
              </div>
            )}

            {activeTab === 'text' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Plain Text / Notes
                </label>
                <textarea
                  rows={4}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Enter custom text, Wi-Fi instructions, coupon code..."
                  className="w-full p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm transition resize-none"
                />
              </div>
            )}

            {activeTab === 'wifi' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Network Name (SSID)
                  </label>
                  <input
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    placeholder="e.g. Starbucks_Guest_5G"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm transition"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                      Password
                    </label>
                    <input
                      type="text"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      placeholder="Network Password"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                      Encryption
                    </label>
                    <select
                      value={wifiEncryption}
                      onChange={(e: any) => setWifiEncryption(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm transition"
                    >
                      <option value="WPA">WPA / WPA2 / WPA3</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">None (Open Network)</option>
                    </select>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={wifiHidden}
                    onChange={(e) => setWifiHidden(e.target.checked)}
                    className="rounded text-brand-500 focus:ring-brand-500"
                  />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">Hidden Network SSID</span>
                </label>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Sarah Jenkins"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={contactTitle}
                    onChange={(e) => setContactTitle(e.target.value)}
                    placeholder="Product Manager"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="sarah@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm transition"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Organization / Company
                  </label>
                  <input
                    type="text"
                    value={contactOrg}
                    onChange={(e) => setContactOrg(e.target.value)}
                    placeholder="Innovate Tech Solutions"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm transition"
                  />
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder="support@domain.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Inquiry / Feedback"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Message Body
                  </label>
                  <textarea
                    rows={3}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Pre-populated message..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm transition resize-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'phone' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Telephone Number (Direct Dial)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phoneNum}
                    onChange={(e) => setPhoneNum(e.target.value)}
                    placeholder="+1 (800) 555-0199"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm transition"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Logo & Branding */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold font-display text-zinc-900 dark:text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-500" />
                Center Logo & Icon
              </span>
              {logoImage && (
                <button
                  onClick={() => {
                    setLogoImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    toast.info('Logo removed.');
                  }}
                  className="text-xs text-red-500 hover:underline flex items-center gap-1 font-semibold"
                >
                  <X className="w-3.5 h-3.5" /> Remove Logo
                </button>
              )}
            </h3>

            {!logoImage ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/png,image/jpeg,image/svg+xml"
                  className="hidden"
                  id="logo-upload-input"
                />
                <label
                  htmlFor="logo-upload-input"
                  className="w-full p-4 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-brand-500 dark:hover:border-brand-400 flex flex-col items-center justify-center gap-2 cursor-pointer transition bg-zinc-50/50 dark:bg-zinc-800/30"
                >
                  <Upload className="w-5 h-5 text-zinc-400" />
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Upload PNG / SVG Logo
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Auto-centered with high error correction
                  </span>
                </label>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-4">
                  <img
                    src={logoImage}
                    alt="Custom Logo embedded in QR Code matrix"
                    className="w-12 h-12 object-contain rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white p-1"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      Logo embedded in matrix center
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                      Error Correction Level H Active (30% redundancy)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs text-zinc-500 mb-1">
                      <span>Logo Scale</span>
                      <span>{Math.round(logoSize * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="0.45"
                      step="0.02"
                      value={logoSize}
                      onChange={(e) => setLogoSize(parseFloat(e.target.value))}
                      className="w-full slider-blur cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-zinc-500 mb-1">
                      <span>Logo Margin</span>
                      <span>{logoMargin}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      step="1"
                      value={logoMargin}
                      onChange={(e) => setLogoMargin(parseInt(e.target.value))}
                      className="w-full slider-blur cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Design Customization */}
          <div className="glass-card p-6 rounded-2xl space-y-6">
            <h3 className="text-sm font-bold font-display text-zinc-900 dark:text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-cyan-500" />
              Colors & Matrix Patterns
            </h3>

            {/* Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
                  Pattern Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => {
                      setFgColor(e.target.value);
                      setGradient(null);
                    }}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300 uppercase">{fgColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
                  Corner Eye Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={cornerColor}
                    onChange={(e) => {
                      setCornerColor(e.target.value);
                      setGradient(null);
                    }}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300 uppercase">{cornerColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
                  Background
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300 uppercase">{bgColor}</span>
                </div>
              </div>
            </div>

            {/* Pattern Styles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Dot Pattern
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['rounded', 'dots', 'classy', 'square', 'extra-rounded'] as DotType[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDotType(d)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium capitalize transition ${
                        dotType === d
                          ? 'bg-brand-500 text-white shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Corner Eye Shape
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['extra-rounded', 'square', 'dot'] as CornerType[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCornerType(c)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium capitalize transition ${
                        cornerType === c
                          ? 'bg-brand-500 text-white shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview & Export (5 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          <div className="glass-card p-4 sm:p-5 rounded-2xl text-center space-y-4">
            <h3 className="text-base font-bold font-display text-zinc-900 dark:text-white">
              Live QR Preview
            </h3>

            {/* QR Canvas Container */}
            <div className="flex items-center justify-center p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-inner min-h-[220px] max-w-[240px] mx-auto">
              <div ref={qrRef} className="overflow-hidden rounded-lg flex items-center justify-center" />
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Point your smartphone camera to test instant recognition
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleDownload('png')}
                  className="btn-primary flex items-center justify-center gap-2 py-3 text-sm font-semibold"
                >
                  <Download className="w-4 h-4" />
                  PNG (High-Res)
                </button>
                <button
                  onClick={() => handleDownload('svg')}
                  className="btn-secondary flex items-center justify-center gap-2 py-3 text-sm font-semibold"
                >
                  <Download className="w-4 h-4" />
                  SVG (Vector)
                </button>
              </div>

              <button
                onClick={handleCopy}
                className="w-full py-2.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs flex items-center justify-center gap-2 transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied Image to Clipboard!' : 'Copy to Clipboard'}
              </button>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Static & Permanent</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Scannable forever with zero subscription lockouts.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Feature 1: Logo Embedding */}
        <div className="p-6 rounded-2xl glass-card flex flex-col justify-between">
          <div>
            {/* Simple flat icon of a QR code pattern with a small logo placeholder square in the center */}
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 p-2.5 flex items-center justify-center mb-4 border border-brand-500/20">
              <svg className="w-full h-full" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="8" height="8" rx="2" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="1.8" />
                <rect x="20" y="4" width="8" height="8" rx="2" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="1.8" />
                <rect x="4" y="20" width="8" height="8" rx="2" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="1.8" />
                <rect x="6" y="6" width="4" height="4" className="fill-blue-600 dark:fill-blue-400" />
                <rect x="22" y="6" width="4" height="4" className="fill-blue-600 dark:fill-blue-400" />
                <rect x="6" y="22" width="4" height="4" className="fill-blue-600 dark:fill-blue-400" />
                {/* Logo placeholder in center */}
                <rect x="12" y="12" width="8" height="8" rx="2" className="fill-purple-500/20 stroke-purple-600" strokeWidth="1.6" />
                <circle cx="16" cy="16" r="1.5" className="fill-purple-600" />
              </svg>
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1">
              Center Logo Overlay
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Upload custom brand logos. Error correction automatically upgrades to Level H to ensure 100% scannability.
            </p>
          </div>
        </div>

        {/* Feature 2: SVG/PNG Export */}
        <div className="p-6 rounded-2xl glass-card flex flex-col justify-between">
          <div>
            {/* Simple flat icon showing two file format badges side by side (SVG and PNG) */}
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 p-2.5 flex items-center justify-center mb-4 border border-blue-500/20">
              <svg className="w-full h-full" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="8" width="12" height="16" rx="2" className="fill-blue-500/10 stroke-blue-600 dark:stroke-blue-400" strokeWidth="1.6" />
                <text x="5" y="19" className="text-[7px] font-black fill-blue-600 dark:fill-blue-400">SVG</text>
                <rect x="17" y="8" width="12" height="16" rx="2" className="fill-emerald-500/10 stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="1.6" />
                <text x="19" y="19" className="text-[7px] font-black fill-emerald-600 dark:fill-emerald-400">PNG</text>
              </svg>
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1">
              Infinite-Scale SVG & PNG
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Download mathematical vector SVG for billboards and print, or high-density PNG for digital screens.
            </p>
          </div>
        </div>

        {/* Feature 3: No Expiry */}
        <div className="p-6 rounded-2xl glass-card flex flex-col justify-between">
          <div>
            {/* Simple flat icon of an infinity symbol combined with a QR code corner pattern */}
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2.5 flex items-center justify-center mb-4 border border-emerald-500/20">
              <svg className="w-full h-full" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="8" height="8" rx="2" className="stroke-zinc-400" strokeWidth="1.5" />
                <rect x="6" y="6" width="4" height="4" className="fill-zinc-400" />
                {/* Infinity symbol in green */}
                <path d="M12 21C12 18.8 14 17 16 19C18 21 20 23 23 23C25.2 23 27 21.2 27 19C27 16.8 25.2 15 23 15C20 15 18 17 16 19C14 21 12 23 9 23C6.8 23 5 21.2 5 19C5 16.8 6.8 15 9 15C12 15 14 17 16 19" className="stroke-emerald-500" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1">
              Never Expires • No Account
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Directly encodes payload data into the matrix. Zero redirects, zero middleman servers, scannable forever.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section with Step-by-Step Visual Cards (matching user screenshot) */}
      <section className="mt-16 p-6 sm:p-8 rounded-3xl glass-card border border-zinc-200/80 dark:border-zinc-800/80">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-zinc-900 dark:text-white">
              How Compixor&apos;s QR Code Generator Works
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
              A QR code is a two-dimensional pattern that encodes data directly into a scannable grid. Everything runs 100% locally in your browser.
            </p>
          </div>

          {/* Step 1 & Step 2 Layout (Exact layout requested in user's image) */}
          <div className="space-y-12">
            {/* Step 1 Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Left Visual Card 1: Input URL, floating pills, QR preview */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50/60 via-zinc-50 to-emerald-50/30 dark:from-zinc-900/90 dark:to-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-4">
                  {/* Left inputs mockup */}
                  <div className="flex-1 space-y-3">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 shadow-xs border border-zinc-200/70 dark:border-zinc-700/60 flex items-center justify-between text-xs">
                      <span className="text-zinc-700 dark:text-zinc-200 font-medium">Enter URL</span>
                      <span className="text-zinc-400">📢</span>
                    </div>

                    <div className="relative pl-3 space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-emerald-500/60 shadow-xs text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        <LinkIcon className="w-3 h-3 text-emerald-600" /> URL
                      </div>
                      <div className="block pl-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-white/70 dark:bg-zinc-800/70 text-[10px] text-zinc-400 border border-zinc-200/60">PDF</span>
                      </div>
                      <div className="block pl-8">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-white/50 dark:bg-zinc-800/50 text-[10px] text-zinc-400 border border-zinc-200/40">Multi-URL</span>
                      </div>
                    </div>
                  </div>

                  {/* Right QR Code mockup */}
                  <div className="w-28 h-28 bg-white dark:bg-zinc-800 p-2 rounded-2xl shadow-sm border border-zinc-200/80 dark:border-zinc-700/70 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full" viewBox="0 0 40 40" fill="currentColor">
                      {/* Corner 1 */}
                      <rect x="4" y="4" width="10" height="10" rx="1.5" />
                      <rect x="6" y="6" width="6" height="6" fill="white" />
                      <rect x="7.5" y="7.5" width="3" height="3" />
                      {/* Corner 2 */}
                      <rect x="26" y="4" width="10" height="10" rx="1.5" />
                      <rect x="28" y="6" width="6" height="6" fill="white" />
                      <rect x="29.5" y="7.5" width="3" height="3" />
                      {/* Corner 3 */}
                      <rect x="4" y="26" width="10" height="10" rx="1.5" />
                      <rect x="6" y="28" width="6" height="6" fill="white" />
                      <rect x="7.5" y="29.5" width="3" height="3" />
                      {/* Matrix dots */}
                      <rect x="18" y="6" width="3" height="3" />
                      <rect x="18" y="12" width="3" height="3" />
                      <rect x="6" y="18" width="3" height="3" />
                      <rect x="12" y="18" width="3" height="3" />
                      <rect x="18" y="18" width="4" height="4" />
                      <rect x="26" y="18" width="3" height="3" />
                      <rect x="32" y="18" width="3" height="3" />
                      <rect x="18" y="26" width="3" height="3" />
                      <rect x="24" y="26" width="4" height="4" />
                      <rect x="30" y="26" width="3" height="3" />
                      <rect x="18" y="32" width="3" height="3" />
                      <rect x="26" y="32" width="3" height="3" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Right Description 1 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm">
                    1
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Choose your QR Code type
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed pl-11">
                  Choose your QR Code type based on what you want it to do: open a URL, share WiFi credentials, display contact details (vCard), launch an email, or send phone numbers.
                </p>
              </div>
            </div>

            {/* Step 2 Row (Alternating matching user screenshot) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Left Description 2 */}
              <div className="space-y-3 order-2 md:order-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm">
                    2
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Customize it your way
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed pl-11">
                  Add your details, change the color, style your QR Code, add a logo in the center, and test it in real time before downloading.
                </p>
              </div>

              {/* Right Visual Card 2: Custom color QR, swatches, Logo.png tag, style pills */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-50/60 via-zinc-50 to-blue-50/40 dark:from-zinc-900/90 dark:to-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-sm order-1 md:order-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    {/* QR with purple eyes & center logo */}
                    <div className="w-24 h-24 bg-white dark:bg-zinc-800 p-2 rounded-2xl shadow-sm border border-zinc-200/80 dark:border-zinc-700/70 relative shrink-0">
                      <svg className="w-full h-full" viewBox="0 0 40 40" fill="currentColor">
                        {/* Purple eye corners */}
                        <rect x="4" y="4" width="10" height="10" rx="3" fill="#8b5cf6" />
                        <rect x="6" y="6" width="6" height="6" fill="white" />
                        <circle cx="9" cy="9" r="2" fill="#8b5cf6" />

                        <rect x="26" y="4" width="10" height="10" rx="3" fill="#8b5cf6" />
                        <rect x="28" y="6" width="6" height="6" fill="white" />
                        <circle cx="31" cy="9" r="2" fill="#8b5cf6" />

                        <rect x="4" y="26" width="10" height="10" rx="3" fill="#8b5cf6" />
                        <rect x="6" y="28" width="6" height="6" fill="white" />
                        <circle cx="9" cy="31" r="2" fill="#8b5cf6" />

                        {/* Dots */}
                        <circle cx="19" cy="7" r="1.2" fill="#18181b" />
                        <circle cx="19" cy="13" r="1.2" fill="#18181b" />
                        <circle cx="7" cy="19" r="1.2" fill="#18181b" />
                        <circle cx="33" cy="19" r="1.2" fill="#18181b" />
                        <circle cx="21" cy="27" r="1.2" fill="#18181b" />
                        <circle cx="27" cy="33" r="1.2" fill="#18181b" />
                      </svg>
                      {/* Logo cake/brand center overlay */}
                      <div className="absolute inset-0 m-auto w-7 h-7 rounded-lg bg-white dark:bg-zinc-900 border border-purple-300 shadow-xs flex items-center justify-center text-xs">
                        🧁
                      </div>
                    </div>

                    {/* Swatches & Logo tag */}
                    <div className="flex-1 space-y-3">
                      {/* Color swatches */}
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-zinc-900 shadow-xs"></span>
                        <span className="w-5 h-5 rounded-md bg-purple-600 ring-2 ring-purple-400 shadow-xs"></span>
                        <span className="w-5 h-5 rounded-md bg-amber-500 shadow-xs"></span>
                      </div>

                      {/* Logo.png pill */}
                      <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xs flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-200 text-[11px]">
                          <ImageIcon className="w-3.5 h-3.5 text-purple-600" /> Logo.png
                        </span>
                        <X className="w-3.5 h-3.5 text-zinc-400" />
                      </div>
                    </div>
                  </div>

                  {/* Style presets row (Classic, Rounded, Thin, Smooth) */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1 text-center">
                    <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                      Classic
                    </div>
                    <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-400 text-[10px] font-bold text-purple-600 dark:text-purple-300 shadow-xs">
                      Rounded
                    </div>
                    <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                      Thin
                    </div>
                    <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                      Smooth
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Left Visual Card 3: Download formats */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50/60 to-zinc-50 dark:from-zinc-900/90 dark:to-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                <div className="bg-white dark:bg-zinc-800/90 rounded-2xl p-5 shadow-sm border border-zinc-200/70 dark:border-zinc-700/60 text-center space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4" /> 100% Static & Permanent
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40">
                      <p className="font-bold text-xs text-blue-900 dark:text-blue-200">SVG Vector</p>
                      <p className="text-[10px] text-blue-600/80 mt-0.5">Infinite Scale for Print</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
                      <p className="font-bold text-xs text-emerald-900 dark:text-emerald-200">PNG Format</p>
                      <p className="text-[10px] text-emerald-600/80 mt-0.5">High-Res for Screens</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Description 3 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm">
                    3
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Instant Download — No Expiry
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed pl-11">
                  Download as PNG (for digital use) or vector SVG (for print, posters, and flyers that scale infinitely). Sensitive information like Wi-Fi passwords never touches an external server.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reusable Client-Side Trust & Privacy Section */}
      <ClientSideTrustSection />

      {/* FAQs Section with SSR-friendly DOM rendering */}
      <FaqSection
        title="QR Generator FAQs"
        subtitle="Answers to common questions about our free client-side QR generator"
        faqs={qrGeneratorFaqs}
      />

      {/* Cross-Tool Internal Linking */}
      <RelatedTools currentTool="qr-generator" />
    </div>
  );
}
