import type { ComponentType } from 'react';
import {
  FileArchive,
  Combine,
  FileText,
  Stamp,
  Eraser,
  Lock,
  Unlock,
  ScanText,
  IdCard,
  Crop,
  QrCode,
  FileDown,
  Files,
} from 'lucide-react';

export type ToolProcessing = 'local' | 'server';

export interface ToolItem {
  id: string;
  name: string;
  title: string;
  label: string;
  href: string;
  shortDescription: string;
  subtitle: string;
  description: string;
  category: 'PDF' | 'Word' | 'Media';
  pdfSubcategory?: 'Compress & Organize' | 'Watermark & Redaction' | 'Security & Access';
  wordSubcategory?: 'Word & Document Processing';
  processing: ToolProcessing;
  icon: ComponentType<{ className?: string }>;
  navIcon?: ComponentType<{ className?: string }>;
  gradient: string;
  color: string;
  badge?: string;
  tagline: string;
  stats: string;
}

export const tools: ToolItem[] = [
  {
    id: 'pdf-compressor',
    name: 'PDF Compressor',
    title: 'Smart PDF Compressor',
    label: 'PDF Compressor',
    href: '/tools/pdf-compressor',
    shortDescription: 'Reduce file size without quality loss',
    subtitle: 'Reduce file size without quality loss',
    description: 'Compress heavy PDF documents client-side with full visual quality preservation and customizable compression levels.',
    category: 'PDF',
    pdfSubcategory: 'Compress & Organize',
    processing: 'local',
    icon: FileArchive,
    navIcon: FileDown,
    gradient: 'from-rose-500 to-red-600',
    color: 'from-brand-500 to-indigo-600',
    badge: 'Popular',
    tagline: 'Zero Data Leak · No Uploads',
    stats: 'Avg 75% Reduction',
  },
  {
    id: 'pdf-organizer',
    name: 'PDF Merge & Split',
    title: 'Smart PDF Merge & Split',
    label: 'PDF Merge & Split',
    href: '/tools/pdf-organizer',
    shortDescription: 'Combine or split pages locally',
    subtitle: 'Combine or split pages locally',
    description: 'Combine multiple PDF files in custom order or extract exact page ranges into separate documents with visual page previews.',
    category: 'PDF',
    pdfSubcategory: 'Compress & Organize',
    processing: 'local',
    icon: Combine,
    navIcon: Files,
    gradient: 'from-blue-500 to-indigo-600',
    color: 'from-cyan-500 to-indigo-600',
    badge: 'Popular',
    tagline: 'Zero Data Leak · No Uploads',
    stats: 'Merge Unlimited · Split in Seconds',
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to Word Converter',
    title: 'PDF to Word Converter',
    label: 'PDF to Word',
    href: '/tools/pdf-to-word',
    shortDescription: 'Convert to editable Word (.docx)',
    subtitle: 'Convert to editable Word (.docx)',
    description: 'Convert PDF files into fully editable Microsoft Word (.docx) documents with zero data retention.',
    category: 'PDF',
    pdfSubcategory: 'Compress & Organize',
    wordSubcategory: 'Word & Document Processing',
    processing: 'server',
    icon: FileText,
    navIcon: FileText,
    gradient: 'from-blue-600 to-indigo-600',
    color: 'from-blue-600 to-indigo-600',
    badge: 'New',
    tagline: 'Zero Data Leak · Secure HTTPS Processing',
    stats: 'Editable DOCX',
  },
  {
    id: 'add-watermark',
    name: 'Add PDF Watermark',
    title: 'Add Watermark to PDF',
    label: 'Add PDF Watermark',
    href: '/tools/add-watermark',
    shortDescription: 'Stamp text or logo onto PDF',
    subtitle: 'Stamp text or logo onto PDF',
    description: 'Add customizable vector text or image watermarks across single, range, or all pages with full opacity and font controls.',
    category: 'PDF',
    pdfSubcategory: 'Watermark & Redaction',
    processing: 'local',
    icon: Stamp,
    navIcon: Stamp,
    gradient: 'from-pink-500 to-rose-600',
    color: 'from-rose-500 to-pink-600',
    badge: 'New',
    tagline: 'Zero Data Leak · No Uploads',
    stats: 'Instant Watermarking',
  },
  {
    id: 'remove-watermark',
    name: 'Remove PDF Watermark',
    title: 'Remove Watermark from PDF',
    label: 'Remove PDF Watermark',
    href: '/tools/remove-watermark',
    shortDescription: 'Clean stamps and watermark layers',
    subtitle: 'Clean stamps and watermark layers',
    description: 'Erase watermarks, logos, and stamps cleanly with intelligent text stream stripping and interactive vector redaction.',
    category: 'PDF',
    pdfSubcategory: 'Watermark & Redaction',
    processing: 'local',
    icon: Eraser,
    navIcon: Eraser,
    gradient: 'from-amber-500 to-orange-600',
    color: 'from-amber-500 to-rose-600',
    badge: 'Featured',
    tagline: 'Zero Data Leak · No Uploads',
    stats: '100% Removal Detection',
  },
  {
    id: 'protect-pdf',
    name: 'Protect PDF',
    title: 'Protect PDF',
    label: 'Protect PDF',
    href: '/tools/protect-pdf',
    shortDescription: 'Add AES-256 password protection',
    subtitle: 'Add AES-256 password protection',
    description: 'Encrypt PDF with standard AES-256 password protection and configure granular restrictions for printing, copying, and editing.',
    category: 'PDF',
    pdfSubcategory: 'Security & Access',
    processing: 'local',
    icon: Lock,
    navIcon: Lock,
    gradient: 'from-indigo-600 to-purple-600',
    color: 'from-indigo-500 to-purple-600',
    badge: 'AES-256',
    tagline: 'Zero Data Leak · No Uploads',
    stats: 'AES-256 Encryption',
  },
  {
    id: 'unlock-pdf',
    name: 'Unlock PDF',
    title: 'Unlock PDF',
    label: 'Unlock PDF',
    href: '/tools/unlock-pdf',
    shortDescription: 'Remove password and restrictions',
    subtitle: 'Remove password and restrictions',
    description: 'Instantly strip password security and remove permission restrictions from PDF files you own directly in your browser.',
    category: 'PDF',
    pdfSubcategory: 'Security & Access',
    processing: 'local',
    icon: Unlock,
    navIcon: Unlock,
    gradient: 'from-emerald-500 to-teal-600',
    color: 'from-purple-500 to-pink-600',
    badge: 'New',
    tagline: 'Zero Data Leak · No Uploads',
    stats: '100% Local Decrypt',
  },
  {
    id: 'word-compressor',
    name: 'Word Compressor',
    title: 'Smart Word Compressor',
    label: 'Word Compressor',
    href: '/tools/word-compressor',
    shortDescription: 'Shrink DOCX size without losing layout',
    subtitle: 'Shrink DOCX size without losing layout',
    description: 'Shrink Microsoft Word .docx files by inspecting and re-compressing embedded high-res images without altering styles.',
    category: 'Word',
    wordSubcategory: 'Word & Document Processing',
    processing: 'local',
    icon: FileArchive,
    navIcon: FileDown,
    gradient: 'from-blue-500 to-indigo-600',
    color: 'from-blue-500 to-cyan-500',
    badge: 'Popular',
    tagline: 'Zero Data Leak · No Uploads',
    stats: 'Preserves Layout',
  },
  {
    id: 'img-to-word',
    name: 'Image to Word Converter',
    title: 'Image to Word Converter',
    label: 'Image to Word Converter',
    href: '/tools/img-to-word',
    shortDescription: 'OCR images to editable Word document',
    subtitle: 'OCR images to editable Word document',
    description: 'Convert JPG, PNG, WEBP, or scanned image files into fully editable Word (.docx) documents using AI OCR.',
    category: 'Word',
    wordSubcategory: 'Word & Document Processing',
    processing: 'server',
    icon: ScanText,
    navIcon: FileText,
    gradient: 'from-violet-600 to-indigo-600',
    color: 'from-violet-600 to-purple-600',
    badge: 'New',
    tagline: 'Zero Data Leak · Secure HTTPS Processing',
    stats: '10+ Languages · Batch OCR',
  },
  {
    id: 'passport-photo',
    name: 'Passport Photo Maker',
    title: 'Biometric Passport Photo Maker',
    label: 'Passport Photo Maker',
    href: '/tools/passport-photo',
    shortDescription: 'Crop & scale to international specs',
    subtitle: 'Crop & scale to international specs',
    description: 'Crop and scale portraits to Pakistan NADRA, US 2x2", UK/EU 35x45mm, and Gulf specs with biometric face guides and 300 DPI printable sheets.',
    category: 'Media',
    processing: 'server',
    icon: IdCard,
    gradient: 'from-emerald-500 to-teal-500',
    color: 'from-emerald-500 to-teal-500',
    badge: 'Trending',
    tagline: 'Zero Data Leak · Secure HTTPS Processing',
    stats: 'ICAO & NADRA Compliant',
  },
  {
    id: 'full-dp-maker',
    name: 'Full DP Maker',
    title: 'No-Crop Full DP Resizer',
    label: 'Full DP Maker',
    href: '/tools/full-dp-maker',
    shortDescription: 'Fit WhatsApp & Instagram DP without crop',
    subtitle: 'Fit WhatsApp & Instagram DP without crop',
    description: 'Resize & fit WhatsApp, Instagram & Facebook profile pictures without cropping (Blur background / 1:1 square canvas).',
    category: 'Media',
    processing: 'local',
    icon: Crop,
    gradient: 'from-violet-500 to-purple-600',
    color: 'from-violet-500 to-purple-600',
    badge: 'Featured',
    tagline: 'Zero Data Leak · No Uploads',
    stats: '1:1 Square & HD Blur',
  },
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    title: 'High-Res QR Code Generator',
    label: 'QR Generator',
    href: '/tools/qr-generator',
    shortDescription: 'Generate vector QR codes instantly',
    subtitle: 'Generate vector QR codes instantly',
    description: 'Generate high-resolution QR codes for websites, Wi-Fi credentials, and contact cards with custom color palettes and SVG exports.',
    category: 'Media',
    processing: 'local',
    icon: QrCode,
    gradient: 'from-amber-500 to-rose-500',
    color: 'from-amber-500 to-rose-500',
    badge: 'Static & Permanent',
    tagline: 'Zero Data Leak · No Uploads',
    stats: 'SVG & PNG Export',
  },
];

export interface PdfCategoryGroup {
  category: string;
  tools: ToolItem[];
}

export const pdfCategories: PdfCategoryGroup[] = [
  {
    category: 'Compress & Organize',
    tools: tools.filter((t) => t.pdfSubcategory === 'Compress & Organize'),
  },
  {
    category: 'Watermark & Redaction',
    tools: tools.filter((t) => t.pdfSubcategory === 'Watermark & Redaction'),
  },
  {
    category: 'Security & Access',
    tools: tools.filter((t) => t.pdfSubcategory === 'Security & Access'),
  },
];

export const pdfToolsList: ToolItem[] = tools.filter((t) => t.category === 'PDF');

export const wordCategories: PdfCategoryGroup[] = [
  {
    category: 'Word & Document Processing',
    tools: [
      tools.find((t) => t.id === 'word-compressor')!,
      tools.find((t) => t.id === 'pdf-to-word')!,
      tools.find((t) => t.id === 'img-to-word')!,
    ],
  },
];

export const wordToolsList: ToolItem[] = wordCategories[0].tools;
