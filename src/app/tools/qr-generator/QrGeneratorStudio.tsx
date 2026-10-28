'use client';

import ToolSeoSection from "@/components/ToolSeoSection";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ToolFeedback from '@/components/ToolFeedback';
import { incrementFilesDone } from '@/lib/feedbackCounter';
import { QrCode,
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
  Wand2,
  CheckCircle2,
  MessageCircle,
  CreditCard,
  LayoutTemplate,
  Scan } from 'lucide-react';
import { toast } from 'sonner';
import RelatedTools from '@/components/RelatedTools';
import ClientSideTrustSection from '@/components/ClientSideTrustSection';
import { QrGeneratorPreviewMockup } from '@/components/VisualProofMockup';
import {
  brandLogos,
  brandPresets,
  BrandStylePreset,
  BrandLogoItem,
} from '@/utils/qrBrandAssets';

type TabType = 'url' | 'whatsapp' | 'payment' | 'text' | 'wifi' | 'contact' | 'email' | 'phone';
type DotType = 'square' | 'dots' | 'rounded' | 'classy' | 'extra-rounded';
type CornerType = 'square' | 'dot' | 'extra-rounded';
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
type FrameStyle = 'none' | 'bottom-banner' | 'top-header' | 'polaroid' | 'speech-bubble' | 'minimal-tag';

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
  { id: 'whatsapp' as TabType, label: 'WhatsApp Chat', icon: MessageCircle },
  { id: 'payment' as TabType, label: 'Payments & UPI', icon: CreditCard },
  { id: 'text' as TabType, label: 'Plain Text', icon: Type },
  { id: 'wifi' as TabType, label: 'Wi-Fi Network', icon: Wifi },
  { id: 'contact' as TabType, label: 'vCard Contact', icon: User },
  { id: 'email' as TabType, label: 'Email Message', icon: Mail },
  { id: 'phone' as TabType, label: 'Phone Call', icon: Phone },
];

export default function QrGeneratorStudio() {
  const [activeTab, setActiveTab] = useState<TabType>('url');

  // Input states
  const [urlInput, setUrlInput] = useState('https://compixor.ai');
  const [waPhone, setWaPhone] = useState('');
  const [waMessage, setWaMessage] = useState('Hi! I am contacting you via Compixor QR.');

  const [payType, setPayType] = useState<'paypal' | 'upi' | 'crypto'>('paypal');
  const [payRecipient, setPayRecipient] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payNote, setPayNote] = useState('');

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

  // Styling states (Default: Obsidian Black)
  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [cornerColor, setCornerColor] = useState('#0f172a');
  const [cornerDotColor, setCornerDotColor] = useState('#0f172a');
  const [dotType, setDotType] = useState<DotType>('square');
  const [cornerType, setCornerType] = useState<CornerType>('square');
  const [ecLevel, setEcLevel] = useState<ErrorCorrectionLevel>('M');
  const [gradient, setGradient] = useState<{
    type: 'linear' | 'radial';
    rotation?: number;
    colorStops: { offset: number; color: string }[];
  } | null>(null);

  // Logo / Image in center
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [selectedBrandLogoId, setSelectedBrandLogoId] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(0.35);
  const [logoMargin, setLogoMargin] = useState(6);

  // CTA Frame & Badges ("SCAN ME") State
  const [frameStyle, setFrameStyle] = useState<FrameStyle>('none');
  const [frameText, setFrameText] = useState('SCAN ME');
  const [frameColor, setFrameColor] = useState('#0f172a');
  const [frameTextColor, setFrameTextColor] = useState('#ffffff');

  const [copied, setCopied] = useState(false);

  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const presetsScrollRef = useRef<HTMLDivElement>(null);
  const gradientScrollRef = useRef<HTMLDivElement>(null);
  const brandScrollRef = useRef<HTMLDivElement>(null);

  // Enable horizontal scrolling with mouse wheel over presets rows
  useEffect(() => {
    const el1 = presetsScrollRef.current;
    const el2 = gradientScrollRef.current;
    const el3 = brandScrollRef.current;

    const createWheelHandler = (el: HTMLDivElement | null) => (e: WheelEvent) => {
      if (el && el.scrollWidth > el.clientWidth && e.deltaY !== 0 && !e.shiftKey) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    const handler1 = createWheelHandler(el1);
    const handler2 = createWheelHandler(el2);
    const handler3 = createWheelHandler(el3);

    if (el1) el1.addEventListener('wheel', handler1, { passive: false });
    if (el2) el2.addEventListener('wheel', handler2, { passive: false });
    if (el3) el3.addEventListener('wheel', handler3, { passive: false });

    return () => {
      if (el1) el1.removeEventListener('wheel', handler1);
      if (el2) el2.removeEventListener('wheel', handler2);
      if (el3) el3.removeEventListener('wheel', handler3);
    };
  }, []);

  // Apply a standard preset
  const applyPreset = (preset: StylePreset) => {
    setFgColor(preset.fgColor);
    setBgColor(preset.bgColor);
    setCornerColor(preset.cornerColor);
    setCornerDotColor(preset.cornerColor);
    setFrameColor(preset.cornerColor || preset.fgColor);
    setDotType(preset.dotType);
    setCornerType(preset.cornerType);
    setGradient(preset.gradient || null);
    toast.success(`Applied ${preset.name} style preset!`);
  };

  // Apply an artistic brand preset
  const applyBrandPreset = (preset: BrandStylePreset) => {
    setFgColor(preset.fgColor);
    setBgColor(preset.bgColor);
    setCornerColor(preset.cornerColor);
    setCornerDotColor(preset.cornerDotColor || preset.cornerColor);
    setFrameColor(preset.cornerColor || preset.fgColor);
    setDotType(preset.dotType);
    setCornerType(preset.cornerType);
    setGradient(preset.gradient || null);

    if (preset.logoId) {
      const logo = brandLogos.find((l) => l.id === preset.logoId);
      if (logo) {
        setLogoImage(logo.svgDataUri);
        setSelectedBrandLogoId(logo.id);
        setEcLevel('H');
        setLogoSize(preset.logoSize || 0.35);
        setLogoMargin(preset.logoMargin ?? 6);
      }
    }
    toast.success(`Applied ${preset.name} brand template!`);
  };

  // Handle Quick Brand Logo selection
  const handleSelectBrandLogo = (logo: BrandLogoItem) => {
    if (selectedBrandLogoId === logo.id && logoImage === logo.svgDataUri) {
      setLogoImage(null);
      setSelectedBrandLogoId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.info('Logo removed.');
    } else {
      setLogoImage(logo.svgDataUri);
      setSelectedBrandLogoId(logo.id);
      setEcLevel('H');
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success(`${logo.name} logo applied! (Error correction set to High)`);
    }
  };

  // Compute final QR payload
  const getQrValue = (): string => {
    switch (activeTab) {
      case 'url':
        return urlInput.trim() || 'https://compixor.ai';
      case 'whatsapp': {
        const cleanPhone = waPhone.replace(/[^\d+]/g, '').replace(/^\+/, '');
        const encodedMsg = encodeURIComponent(waMessage.trim());
        return cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodedMsg}` : 'https://wa.me/';
      }
      case 'payment': {
        if (payType === 'paypal') {
          const cleanUser = payRecipient.replace(/^@/, '').trim();
          return payAmount
            ? `https://paypal.me/${cleanUser}/${payAmount}`
            : `https://paypal.me/${cleanUser}`;
        } else if (payType === 'upi') {
          const pa = encodeURIComponent(payRecipient.trim());
          const am = payAmount ? `&am=${encodeURIComponent(payAmount.trim())}` : '';
          const tn = payNote ? `&tn=${encodeURIComponent(payNote.trim())}` : '';
          return `upi://pay?pa=${pa}&pn=${pa}${am}${tn}&cu=INR`;
        } else {
          const addr = payRecipient.trim();
          return payAmount ? `bitcoin:${addr}?amount=${payAmount}` : `bitcoin:${addr}`;
        }
      }
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
      setSelectedBrandLogoId(null);
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
          margin: 10,
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
            color: cornerDotColor || cornerColor,
            type: cornerType === 'extra-rounded' ? 'dot' : (cornerType === 'dot' ? 'dot' : 'square'),
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
    waPhone,
    waMessage,
    payType,
    payRecipient,
    payAmount,
    payNote,
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
    cornerDotColor,
    dotType,
    cornerType,
    ecLevel,
    gradient,
    logoImage,
    logoSize,
    logoMargin,
  ]);

  // Framed PNG Generator Helper
  const createFramedBlob = async (mime: 'image/png'): Promise<Blob | null> => {
    if (!qrRef.current) return null;
    const svgEl = qrRef.current.querySelector('svg');
    if (!svgEl) return null;

    return new Promise((resolve) => {
      const svgData = new XMLSerializer().serializeToString(svgEl);
      const img = new Image();
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));

      img.onload = () => {
        const qrSize = 800;
        let cardWidth = 1000;
        let cardHeight = 1000;
        let qrX = 100;
        let qrY = 100;

        if (frameStyle === 'bottom-banner') {
          cardWidth = 1000;
          cardHeight = 1200;
          qrX = 100;
          qrY = 70;
        } else if (frameStyle === 'top-header') {
          cardWidth = 1000;
          cardHeight = 1200;
          qrX = 100;
          qrY = 280;
        } else if (frameStyle === 'polaroid') {
          cardWidth = 1000;
          cardHeight = 1250;
          qrX = 100;
          qrY = 100;
        } else if (frameStyle === 'speech-bubble') {
          cardWidth = 1000;
          cardHeight = 1200;
          qrX = 100;
          qrY = 280;
        } else if (frameStyle === 'minimal-tag') {
          cardWidth = 1000;
          cardHeight = 1150;
          qrX = 100;
          qrY = 90;
        }

        const canvas = document.createElement('canvas');
        canvas.width = cardWidth;
        canvas.height = cardHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);

        // Fill background
        ctx.fillStyle = frameStyle === 'polaroid' ? '#ffffff' : (bgColor || '#ffffff');
        ctx.fillRect(0, 0, cardWidth, cardHeight);

        // Border decoration
        if (frameStyle === 'bottom-banner' || frameStyle === 'top-header') {
          ctx.strokeStyle = frameColor;
          ctx.lineWidth = 14;
          ctx.strokeRect(7, 7, cardWidth - 14, cardHeight - 14);
        } else if (frameStyle === 'polaroid') {
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 4;
          ctx.strokeRect(2, 2, cardWidth - 4, cardHeight - 4);
        }

        // Top header
        if (frameStyle === 'top-header') {
          ctx.fillStyle = frameColor;
          ctx.fillRect(0, 0, cardWidth, 190);
          ctx.fillStyle = frameTextColor;
          ctx.font = 'bold 54px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText((frameText || 'SCAN ME').toUpperCase(), cardWidth / 2, 95);
        }

        // Speech bubble
        if (frameStyle === 'speech-bubble') {
          ctx.fillStyle = frameColor;
          const bubbleW = 560;
          const bubbleH = 110;
          const bx = (cardWidth - bubbleW) / 2;
          const by = 60;
          ctx.beginPath();
          ctx.roundRect(bx, by, bubbleW, bubbleH, 55);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(cardWidth / 2 - 25, by + bubbleH);
          ctx.lineTo(cardWidth / 2 + 25, by + bubbleH);
          ctx.lineTo(cardWidth / 2, by + bubbleH + 30);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = frameTextColor;
          ctx.font = 'bold 44px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText((frameText || 'SCAN ME').toUpperCase(), cardWidth / 2, by + bubbleH / 2);
        }

        // Draw QR code image
        ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

        // Bottom banner
        if (frameStyle === 'bottom-banner') {
          ctx.fillStyle = frameColor;
          ctx.fillRect(0, 950, cardWidth, 250);
          ctx.fillStyle = frameTextColor;
          ctx.font = 'bold 56px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText((frameText || 'SCAN ME').toUpperCase(), cardWidth / 2, 1075);
        }

        // Polaroid caption
        if (frameStyle === 'polaroid') {
          ctx.fillStyle = frameColor;
          ctx.font = 'bold 58px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText((frameText || 'SCAN ME').toUpperCase(), cardWidth / 2, 1080);
        }

        // Minimal tag
        if (frameStyle === 'minimal-tag') {
          ctx.fillStyle = frameColor;
          const tagW = 480;
          const tagH = 90;
          const tx = (cardWidth - tagW) / 2;
          const ty = 980;
          ctx.beginPath();
          ctx.roundRect(tx, ty, tagW, tagH, 45);
          ctx.fill();
          ctx.fillStyle = frameTextColor;
          ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText((frameText || 'SCAN ME').toUpperCase(), cardWidth / 2, ty + tagH / 2);
        }

        canvas.toBlob((blob) => resolve(blob), mime);
      };

      img.onerror = () => resolve(null);
    });
  };

  // Framed SVG Generator Helper
  const createFramedSvgString = (): string | null => {
    if (!qrRef.current) return null;
    const svgEl = qrRef.current.querySelector('svg');
    if (!svgEl) return null;

    const qrInner = svgEl.innerHTML;
    let cardW = 1000;
    let cardH = 1000;
    let qrX = 100;
    let qrY = 100;
    let frameMarkup = '';

    const safeText = (frameText || 'SCAN ME').toUpperCase();

    if (frameStyle === 'bottom-banner') {
      cardW = 1000;
      cardH = 1200;
      qrX = 100;
      qrY = 70;
      frameMarkup = `
        <rect x="7" y="7" width="986" height="1186" rx="28" fill="none" stroke="${frameColor}" stroke-width="14"/>
        <path d="M0,950 L1000,950 L1000,1172 A28,28 0 0 1 972,1200 L28,1200 A28,28 0 0 1 0,1172 Z" fill="${frameColor}"/>
        <text x="500" y="1085" fill="${frameTextColor}" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="56" text-anchor="middle">${safeText}</text>
      `;
    } else if (frameStyle === 'top-header') {
      cardW = 1000;
      cardH = 1200;
      qrX = 100;
      qrY = 280;
      frameMarkup = `
        <rect x="7" y="7" width="986" height="1186" rx="28" fill="none" stroke="${frameColor}" stroke-width="14"/>
        <path d="M28,0 L972,0 A28,28 0 0 1 1000,28 L1000,190 L0,190 L0,28 A28,28 0 0 1 28,0 Z" fill="${frameColor}"/>
        <text x="500" y="115" fill="${frameTextColor}" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="56" text-anchor="middle">${safeText}</text>
      `;
    } else if (frameStyle === 'polaroid') {
      cardW = 1000;
      cardH = 1250;
      qrX = 100;
      qrY = 100;
      frameMarkup = `
        <rect x="3" y="3" width="994" height="1244" rx="24" fill="#ffffff" stroke="#e2e8f0" stroke-width="6"/>
        <text x="500" y="1085" fill="${frameColor}" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="58" text-anchor="middle">${safeText}</text>
      `;
    } else if (frameStyle === 'speech-bubble') {
      cardW = 1000;
      cardH = 1200;
      qrX = 100;
      qrY = 280;
      frameMarkup = `
        <rect x="220" y="60" width="560" height="110" rx="55" fill="${frameColor}"/>
        <polygon points="475,170 525,170 500,200" fill="${frameColor}"/>
        <text x="500" y="132" fill="${frameTextColor}" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="44" text-anchor="middle">${safeText}</text>
      `;
    } else if (frameStyle === 'minimal-tag') {
      cardW = 1000;
      cardH = 1150;
      qrX = 100;
      qrY = 90;
      frameMarkup = `
        <rect x="260" y="980" width="480" height="90" rx="45" fill="${frameColor}"/>
        <text x="500" y="1040" fill="${frameTextColor}" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="42" text-anchor="middle">${safeText}</text>
      `;
    }

    const bgFill = frameStyle === 'polaroid' ? '#ffffff' : (bgColor || '#ffffff');
    return `
      <svg width="${cardW}" height="${cardH}" viewBox="0 0 ${cardW} ${cardH}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${cardW}" height="${cardH}" fill="${bgFill}"/>
        <g transform="translate(${qrX}, ${qrY}) scale(4)">
          ${qrInner}
        </g>
        ${frameMarkup}
      </svg>
    `.trim();
  };

  const handleDownload = async (extension: 'png' | 'svg') => {
    if (!qrCodeInstance.current) return;
    incrementFilesDone();
    try {
      if (frameStyle !== 'none') {
        if (extension === 'png') {
          const blob = await createFramedBlob('image/png');
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `compixor-qr-framed-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Framed QR code downloaded as high-res PNG!');
            return;
          }
        } else {
          const svgString = createFramedSvgString();
          if (svgString) {
            const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `compixor-qr-framed-${Date.now()}.svg`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Framed QR code downloaded as vector SVG!');
            return;
          }
        }
      }

      // Standard Download without frame
      if (extension === 'png') {
        qrCodeInstance.current.update({ width: 1000, height: 1000, margin: 40 });
        await qrCodeInstance.current.download({
          name: `compixor-qr-${Date.now()}`,
          extension,
        });
        qrCodeInstance.current.update({ width: 200, height: 200, margin: 10 });
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
      if (frameStyle !== 'none') {
        const blob = await createFramedBlob('image/png');
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopied(true);
          toast.success('Framed QR code copied to clipboard!');
          setTimeout(() => setCopied(false), 2000);
          return;
        }
      }

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
    <>
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

        {/* Row 3: Artistic Brand Templates */}
        <div
          ref={brandScrollRef}
          className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 px-1 sm:px-2 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 min-w-[155px] flex items-center gap-1.5 shrink-0 select-none">
            <Sparkles className="w-3.5 h-3.5 text-purple-500 animate-spin-slow" /> BRAND TEMPLATES:
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {brandPresets.map((preset) => {
              const brandLogo = brandLogos.find((l) => l.id === preset.logoId);
              return (
                <button
                  key={preset.id}
                  onClick={() => applyBrandPreset(preset)}
                  title={preset.description}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border border-purple-200/80 dark:border-purple-800/60 bg-gradient-to-r from-purple-50/70 via-pink-50/60 to-amber-50/50 dark:from-purple-950/40 dark:via-pink-950/30 dark:to-amber-950/20 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-300 transition shadow-sm flex items-center gap-2 shrink-0 whitespace-nowrap group"
                >
                  {brandLogo && (
                    <img
                      src={brandLogo.svgDataUri}
                      alt={brandLogo.name}
                      className="w-4 h-4 object-contain rounded-full shadow-xs shrink-0"
                    />
                  )}
                  <span>{preset.name}</span>
                </button>
              );
            })}
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

            {activeTab === 'whatsapp' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                    WhatsApp Phone Number (with Country Code)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <MessageCircle className="w-4 h-4 text-emerald-500" />
                    </div>
                    <input
                      type="tel"
                      value={waPhone}
                      onChange={(e) => setWaPhone(e.target.value)}
                      placeholder="+1 (555) 234-5678 or 923001234567"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm transition"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Enter digits with country code (e.g. +1 for US, +44 for UK, +92 for PK)
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Pre-filled Message (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={waMessage}
                    onChange={(e) => setWaMessage(e.target.value)}
                    placeholder="Hi! I want to inquire about your products / services..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm transition resize-none"
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">
                    When scanned, opens WhatsApp with this message ready in chat!
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={brandLogos.find((b) => b.id === 'whatsapp')?.svgDataUri}
                      alt="WhatsApp"
                      className="w-6 h-6 shrink-0"
                    />
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      Apply WhatsApp Official Theme &amp; Frame?
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const waPreset = brandPresets.find((b) => b.id === 'brand-whatsapp');
                      if (waPreset) applyBrandPreset(waPreset);
                      setFrameStyle('bottom-banner');
                      setFrameText('CHAT ON WHATSAPP');
                      setFrameColor('#25D366');
                      setFrameTextColor('#ffffff');
                    }}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
                  >
                    Apply Theme
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'paypal', label: 'PayPal.Me' },
                      { id: 'upi', label: 'UPI / GPay / Paytm' },
                      { id: 'crypto', label: 'Crypto Wallet' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPayType(p.id as any)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition ${
                          payType === p.id
                            ? 'bg-brand-500 text-white shadow-sm'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {payType === 'paypal' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                        PayPal Username / Link
                      </label>
                      <input
                        type="text"
                        value={payRecipient}
                        onChange={(e) => setPayRecipient(e.target.value)}
                        placeholder="e.g. yourname or paypal.me/yourname"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                        Amount (Optional)
                      </label>
                      <input
                        type="number"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        placeholder="e.g. 25.00"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm transition"
                      />
                    </div>
                  </div>
                )}

                {payType === 'upi' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                        UPI ID / VPA
                      </label>
                      <input
                        type="text"
                        value={payRecipient}
                        onChange={(e) => setPayRecipient(e.target.value)}
                        placeholder="e.g. merchant@okaxis or mobile@paytm"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm transition"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                          Amount INR (Optional)
                        </label>
                        <input
                          type="number"
                          value={payAmount}
                          onChange={(e) => setPayAmount(e.target.value)}
                          placeholder="e.g. 500"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                          Note / Remark
                        </label>
                        <input
                          type="text"
                          value={payNote}
                          onChange={(e) => setPayNote(e.target.value)}
                          placeholder="e.g. Invoice payment"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm transition"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {payType === 'crypto' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                        Crypto Wallet Address (BTC / ETH / USDT)
                      </label>
                      <input
                        type="text"
                        value={payRecipient}
                        onChange={(e) => setPayRecipient(e.target.value)}
                        placeholder="e.g. 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm transition font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                        Crypto Amount (Optional)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        placeholder="e.g. 0.05"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm transition"
                      />
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                    Apply matching &quot;SCAN TO PAY&quot; frame?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFrameStyle('bottom-banner');
                      setFrameText('SCAN TO PAY');
                      setFrameColor('#7c3aed');
                      setFrameTextColor('#ffffff');
                    }}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition shadow-xs"
                  >
                    Apply Frame
                  </button>
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
                    placeholder="Alex Morgan"
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
                    placeholder="alex@company.com"
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
                Center Logo &amp; Icon
              </span>
              {logoImage && (
                <button
                  onClick={() => {
                    setLogoImage(null);
                    setSelectedBrandLogoId(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    toast.info('Logo removed.');
                  }}
                  className="text-xs text-red-500 hover:underline flex items-center gap-1 font-semibold"
                >
                  <X className="w-3.5 h-3.5" /> Remove Logo
                </button>
              )}
            </h3>

            {/* Quick Brand Badges Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Quick Brand &amp; Utility Badges
              </label>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                {brandLogos.map((brand) => {
                  const isSelected = selectedBrandLogoId === brand.id && logoImage === brand.svgDataUri;
                  return (
                    <button
                      key={brand.id}
                      type="button"
                      onClick={() => handleSelectBrandLogo(brand)}
                      title={`${brand.name} badge`}
                      className={`relative p-2 rounded-xl border flex flex-col items-center justify-center transition aspect-square group ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/40 ring-2 ring-brand-500 shadow-sm'
                          : 'border-zinc-200 dark:border-zinc-700/80 bg-white/70 dark:bg-zinc-800/60 hover:border-brand-400 dark:hover:border-brand-400'
                      }`}
                    >
                      <img
                        src={brand.svgDataUri}
                        alt={brand.name}
                        className="w-6 h-6 object-contain transition-transform group-hover:scale-110"
                      />
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-500 rounded-full flex items-center justify-center text-[9px] text-white font-bold">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {!logoImage ? (
              <div className="space-y-3 pt-1">
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-zinc-200 dark:border-zinc-700"></div>
                  <span className="shrink-0 px-2 text-[11px] text-zinc-400 uppercase font-semibold">Or upload custom</span>
                  <div className="flex-grow border-t border-zinc-200 dark:border-zinc-700"></div>
                </div>
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
              Colors &amp; Matrix Patterns
            </h3>

            {/* Colors (4 columns: Pattern, Outer Corner Eye, Inner Eye Pupil, Background) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 truncate">
                  Pattern Color
                </label>
                <div className="flex items-center gap-2 sm:gap-3">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => {
                      setFgColor(e.target.value);
                      setGradient(null);
                    }}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl cursor-pointer border-0 bg-transparent shrink-0"
                  />
                  <span className="text-[11px] sm:text-xs font-mono text-zinc-700 dark:text-zinc-300 uppercase truncate">{fgColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 truncate" title="Outer Corner Eye Ring">
                  Corner Ring
                </label>
                <div className="flex items-center gap-2 sm:gap-3">
                  <input
                    type="color"
                    value={cornerColor}
                    onChange={(e) => {
                      setCornerColor(e.target.value);
                      setGradient(null);
                    }}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl cursor-pointer border-0 bg-transparent shrink-0"
                  />
                  <span className="text-[11px] sm:text-xs font-mono text-zinc-700 dark:text-zinc-300 uppercase truncate">{cornerColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 truncate" title="Inner Corner Eye Pupil">
                  Eye Pupil
                </label>
                <div className="flex items-center gap-2 sm:gap-3">
                  <input
                    type="color"
                    value={cornerDotColor}
                    onChange={(e) => {
                      setCornerDotColor(e.target.value);
                      setGradient(null);
                    }}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl cursor-pointer border-0 bg-transparent shrink-0"
                  />
                  <span className="text-[11px] sm:text-xs font-mono text-zinc-700 dark:text-zinc-300 uppercase truncate">{cornerDotColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 truncate">
                  Background
                </label>
                <div className="flex items-center gap-2 sm:gap-3">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl cursor-pointer border-0 bg-transparent shrink-0"
                  />
                  <span className="text-[11px] sm:text-xs font-mono text-zinc-700 dark:text-zinc-300 uppercase truncate">{bgColor}</span>
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

          {/* CTA Frame & Badges ("SCAN ME") */}
          <div className="glass-card p-6 rounded-2xl space-y-5">
            <h3 className="text-sm font-bold font-display text-zinc-900 dark:text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4 text-purple-500" />
                Call-to-Action Frame (&quot;SCAN ME&quot;)
              </span>
              {frameStyle !== 'none' && (
                <button
                  type="button"
                  onClick={() => setFrameStyle('none')}
                  className="text-xs text-red-500 hover:underline flex items-center gap-1 font-semibold"
                >
                  <X className="w-3.5 h-3.5" /> Remove Frame
                </button>
              )}
            </h3>

            {/* Frame Styles Selector */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { id: 'none', label: 'No Frame' },
                { id: 'bottom-banner', label: 'Bottom Banner' },
                { id: 'top-header', label: 'Top Header' },
                { id: 'polaroid', label: 'Polaroid Card' },
                { id: 'speech-bubble', label: 'Speech Bubble' },
                { id: 'minimal-tag', label: 'Minimal Tag' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFrameStyle(f.id as FrameStyle)}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition ${
                    frameStyle === f.id
                      ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/40 ring-2 ring-brand-500 shadow-sm text-brand-600 dark:text-brand-300 font-bold'
                      : 'border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 text-xs font-semibold'
                  }`}
                >
                  <span className="text-[11px] leading-tight">{f.label}</span>
                </button>
              ))}
            </div>

            {frameStyle !== 'none' && (
              <div className="space-y-4 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                    Frame Text Caption
                  </label>
                  <input
                    type="text"
                    value={frameText}
                    onChange={(e) => setFrameText(e.target.value)}
                    placeholder="e.g. SCAN ME"
                    maxLength={30}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm transition uppercase font-bold"
                  />
                  {/* Quick Text Suggestions */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[
                      'SCAN ME',
                      'SCAN FOR MENU',
                      'CONNECT WI-FI',
                      'SCAN TO PAY',
                      'CHAT ON WHATSAPP',
                      'FOLLOW US',
                    ].map((txt) => (
                      <button
                        key={txt}
                        type="button"
                        onClick={() => setFrameText(txt)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition ${
                          frameText === txt
                            ? 'border-brand-500 bg-brand-500 text-white'
                            : 'border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-brand-400'
                        }`}
                      >
                        {txt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
                      Frame Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={frameColor}
                        onChange={(e) => setFrameColor(e.target.value)}
                        className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                      />
                      <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300 uppercase">{frameColor}</span>
                    </div>
                  </div>

                  {frameStyle !== 'polaroid' && (
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
                        Text Color
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={frameTextColor}
                          onChange={(e) => setFrameTextColor(e.target.value)}
                          className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                        />
                        <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300 uppercase">{frameTextColor}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Preview & Export (5 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          <div className="glass-card p-4 sm:p-5 rounded-2xl text-center space-y-4">
            <h3 className="text-base font-bold font-display text-zinc-900 dark:text-white">
              Live QR Preview
            </h3>

            {/* QR Canvas Container with Clean High-Contrast Stage for Dark Mode Scanning */}
            <div className="flex items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 shadow-inner min-h-[240px] max-w-[280px] mx-auto overflow-hidden">
              <div
                className={`transition-all duration-300 flex flex-col items-center justify-center ${
                  frameStyle === 'bottom-banner'
                    ? 'rounded-2xl overflow-hidden shadow-xl border-2'
                    : frameStyle === 'top-header'
                    ? 'rounded-2xl overflow-hidden shadow-xl border-2'
                    : frameStyle === 'polaroid'
                    ? 'rounded-2xl p-3 pb-3.5 shadow-2xl border-2 bg-white dark:bg-zinc-900'
                    : frameStyle === 'speech-bubble'
                    ? 'rounded-2xl p-2.5 shadow-xl border-2 flex flex-col items-center'
                    : frameStyle === 'minimal-tag'
                    ? 'rounded-2xl p-2.5 shadow-xl border-2 flex flex-col items-center gap-2'
                    : 'p-2 rounded-xl shadow-lg border border-zinc-200/80 dark:border-zinc-600/60'
                }`}
                style={{
                  backgroundColor: frameStyle === 'polaroid' ? '#ffffff' : (bgColor || '#ffffff'),
                  borderColor: frameStyle !== 'none' ? frameColor : 'transparent',
                }}
              >
                {/* Top header if active */}
                {frameStyle === 'top-header' && (
                  <div
                    className="w-full py-1.5 px-3 flex items-center justify-center gap-1.5 font-bold text-xs uppercase tracking-wider text-center"
                    style={{ backgroundColor: frameColor, color: frameTextColor }}
                  >
                    <Scan className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{frameText || 'SCAN ME'}</span>
                  </div>
                )}

                {/* Speech bubble header if active */}
                {frameStyle === 'speech-bubble' && (
                  <div className="flex flex-col items-center mb-1">
                    <div
                      className="py-1 px-3 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-sm"
                      style={{ backgroundColor: frameColor, color: frameTextColor }}
                    >
                      <Scan className="w-3 h-3 shrink-0" />
                      <span>{frameText || 'SCAN ME'}</span>
                    </div>
                    <div
                      className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px]"
                      style={{ borderTopColor: frameColor }}
                    />
                  </div>
                )}

                {/* The QR Canvas itself */}
                <div
                  className="p-1 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: bgColor || '#ffffff' }}
                >
                  <div ref={qrRef} className="flex items-center justify-center" />
                </div>

                {/* Bottom banner if active */}
                {frameStyle === 'bottom-banner' && (
                  <div
                    className="w-full py-2 px-3 flex items-center justify-center gap-1.5 font-bold text-xs uppercase tracking-wider text-center"
                    style={{ backgroundColor: frameColor, color: frameTextColor }}
                  >
                    <Scan className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{frameText || 'SCAN ME'}</span>
                  </div>
                )}

                {/* Polaroid caption if active */}
                {frameStyle === 'polaroid' && (
                  <div
                    className="w-full pt-2 pb-0.5 font-bold text-xs uppercase tracking-wider text-center font-display"
                    style={{ color: frameColor }}
                  >
                    {frameText || 'SCAN ME'}
                  </div>
                )}

                {/* Minimal tag if active */}
                {frameStyle === 'minimal-tag' && (
                  <div
                    className="py-0.5 px-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs"
                    style={{ backgroundColor: frameColor, color: frameTextColor }}
                  >
                    <Scan className="w-3 h-3 shrink-0" />
                    <span>{frameText || 'SCAN ME'}</span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Point your smartphone camera to test instant recognition
            </p>

            {/* Helpful Hint / Preset Guide for Users */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-violet-500/10 border border-blue-500/20 text-center space-y-1.5">
              <p className="text-xs font-bold text-zinc-900 dark:text-white flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                <span>Theme &amp; Color: Use PRESETS Above</span>
              </p>
              <p className="text-[11.5px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Click any <strong>Preset</strong> button above (Electric Blue, Emerald, Sunset, etc.) to customize your QR color!
              </p>
            </div>

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

      {/* Tool Feedback Component */}
      <ToolFeedback toolName="qr-generator" />


    </>
  );
}
