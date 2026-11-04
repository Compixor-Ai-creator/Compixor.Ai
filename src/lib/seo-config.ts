import type { Metadata } from 'next';
import type React from 'react';
import type { LucideIcon } from 'lucide-react';
import FullDpIcon from '@/components/FullDpIcon';
import {
  FileText,
  FileArchive,
  Combine,
  QrCode,
  Stamp,
  Eraser,
  Lock,
  LockOpen,
  IdCard,
  ScanText,
} from 'lucide-react';

export type ToolSlug =
  | 'pdf-compressor'
  | 'pdf-organizer'
  | 'add-watermark'
  | 'remove-watermark'
  | 'protect-pdf'
  | 'unlock-pdf'
  | 'word-compressor'
  | 'passport-photo'
  | 'full-dp-maker'
  | 'qr-generator'
  | 'pdf-to-word'
  | 'img-to-word';

export interface HowToStep {
  name: string;
  text: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface FeatureItem {
  title: string;
  description: string;
}

export interface ToolSeoData {
  slug: ToolSlug;
  name: string;
  icon: LucideIcon | React.ComponentType<{ className?: string; variant?: 'full' | 'compact' }>;
  title: string; // Max 60 chars, primary keyword near start
  description: string; // Exactly 150-160 chars
  canonicalUrl: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  longTailKeywords: string[]; // 10 targeted long-tail search queries
  keywords: string[]; // Top 8-10 only for meta tag
  h1: string;
  searchIntent: string;
  introParagraph: string; // 100-150 words, primary keyword in first 100 words, brand differentiator
  howToSteps: HowToStep[];
  faqs: FaqItem[];
  features: FeatureItem[];
  relatedToolSlugs: ToolSlug[];
  applicationCategory: string;
  operatingSystem: string;
  featureList: string[];
}

export interface HomepageSeoData {
  title: string;
  description: string;
  canonicalUrl: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  keywords: string[];
  h1: string;
  introParagraph: string;
  faqs: FaqItem[];
}

export const BASE_URL = 'https://compixor-ai.cloud';
export const AUTHOR_NAME = 'Haroon Ali';
export const OG_IMAGE_URL = `${BASE_URL}/images/og-banner-v2.png`;

export const homepageSeoData: HomepageSeoData = {
  title: 'Free PDF, Word & Photo Tools Online - Private & Fast | Compixor',
  description: 'Free online PDF, Word and photo tools with no file upload required. Client-side document converter, photo editor, and QR toolkit. 100% private and in your browser.',
  canonicalUrl: BASE_URL,
  primaryKeyword: 'free online pdf tools no upload',
  secondaryKeywords: [
    'compixor ai',
    'client side pdf tools',
    'privacy first document tools',
    'free pdf tools online',
    'pdf and photo tools in browser',
    'online document utilities',
  ],
  keywords: [
    'free online pdf tools no upload',
    'compixor ai',
    'client side pdf tools',
    'privacy first document tools',
    'free pdf tools online',
    'pdf and photo tools in browser',
    'in-browser document converter',
    'private online file tools',
  ],
  h1: 'Free Online PDF Tools — No Upload',
  introParagraph:
    'Welcome to Compixor AI, your trusted suite of free online PDF and media tools. Designed for professionals, students, lawyers, and creators worldwide, Compixor offers privacy-first document tools where 9 tools run 100% locally in your web browser. Compress PDFs, merge and split pages, convert PDF to Word, add or remove watermarks, password protect documents, convert biometric passport photos, and generate vector QR codes. Free, no signup required, with zero permanent file storage and instant processing.',
  faqs: [
    {
      q: 'How does Compixor AI process files privately?',
      a: '9 of our tools execute 100% locally inside your browser memory using WebAssembly and HTML5 Canvas with zero uploads. Our 3 server-assisted tools process files securely over HTTPS and delete them immediately after conversion.',
    },
    {
      q: 'Are all Compixor AI tools completely free with no signup?',
      a: 'Yes. Every tool is 100% free with no account registration, no credit cards, and no usage limits. You can process unlimited files at zero cost.',
    },
    {
      q: 'Can I safely use Compixor AI for confidential corporate documents?',
      a: 'Yes. For our 9 client-side tools, files never leave your browser. For server-assisted tools, files are transmitted over encrypted HTTPS, processed in memory, and deleted immediately without permanent retention.',
    },
    {
      q: 'Does Compixor AI work on mobile devices?',
      a: 'Yes. Compixor runs smoothly on iOS Safari, Android Chrome, and modern desktop browsers without downloading extra software or plugins.',
    },
  ],
};

export const seoConfig: Record<ToolSlug, ToolSeoData> = {
  'pdf-compressor': {
    slug: 'pdf-compressor',
    name: 'PDF Compressor',
    icon: FileArchive,
    title: 'Compress PDF Online Free - Reduce File Size',
    description:
      'Compress PDF online free without uploading files. Reduce PDF size to 100kb, 200kb, or 1mb with zero quality loss. Fast, private, in-browser.',
    canonicalUrl: `${BASE_URL}/tools/pdf-compressor`,
    primaryKeyword: 'compress pdf online free',
    searchIntent:
      'Users looking to reduce PDF file size for email attachments, online job portals, university submissions, or WhatsApp sharing without losing text clarity or uploading private documents to external servers.',
    secondaryKeywords: [
      'compress pdf',
      'reduce pdf file size',
      'compress pdf without losing quality',
      'compress pdf to 1mb',
      'compress pdf to 500kb',
      'compress pdf to 200kb',
      'compress pdf to 100kb',
      'make pdf smaller',
      'reduce pdf size online',
      'free pdf compressor',
      'compress large pdf',
      'compress pdf for email',
    ],
    longTailKeywords: [
      'compress pdf online free',
      'reduce pdf file size',
      'compress pdf without losing quality',
      'compress pdf to 1mb',
      'compress pdf to 500kb',
      'compress pdf to 300kb',
      'compress pdf to 200kb',
      'compress pdf to 100kb',
      'compress pdf for email attachment',
      'compress pdf without uploading files',
    ],
    keywords: [
      'compress pdf online free',
      'compress pdf',
      'reduce pdf file size',
      'compress pdf to 100kb',
      'compress pdf to 200kb',
      'reduce pdf size online',
      'pdf size reducer without losing quality',
      'compress pdf without uploading',
      'compress pdf for whatsapp',
      'pdf compressor no signup',
    ],
    h1: 'Compress PDF Online Free',
    introParagraph:
      'Need to compress PDF online free without risking sensitive data? Compixor AI is a 100% client-side PDF compressor designed to reduce PDF size online quickly while maintaining crisp vector text and sharp embedded images. Whether you need to compress PDF to 100kb, 200kb, or 500kb for government job portals, university applications, or compress PDF for WhatsApp and email attachments, our in-browser engine handles everything locally. Enjoy a true PDF size reducer without losing quality: free, no signup, no upload, works in your browser using modern WebAssembly technology. Your files never touch external servers or cloud queues, giving you instant results and total privacy.',
    howToSteps: [
      {
        name: 'Drop Your PDF Document',
        text: 'Drag and drop up to 5 PDF files into the secure drop zone, or browse from your device.',
      },
      {
        name: 'Select Compression Tier',
        text: 'Choose Balanced (ideal for email attachments), Extreme (for portals under 100KB–500KB), or High Quality Print.',
      },
      {
        name: 'In-Browser Local Optimization',
        text: 'Compixor cleans unreferenced objects and re-encodes raster streams without converting text pages to blurry images.',
      },
      {
        name: 'Download Instantly',
        text: 'Save your compressed PDF document immediately or download a bundled ZIP archive with one click.',
      },
    ],
    faqs: [
      {
        q: 'How can I compress PDF online free without uploading my files?',
        a: 'Compixor AI uses client-side WebAssembly to compress PDF files directly inside your browser memory. Your documents never leave your computer or travel over the internet, ensuring complete data privacy.',
      },
      {
        q: 'Can I compress PDF to 100kb, 200kb, or 500kb for job portals?',
        a: 'Yes. Use the Extreme compression preset or specify a custom target size in kilobytes. Compixor recalculates image resolutions and strips redundant metadata so your document meets strict portal upload limits.',
      },
      {
        q: 'Will compressing my PDF document reduce text quality or blur fonts?',
        a: "No. Compixor's vector-preserving engine only optimizes raster image streams and removes unreferenced objects. Your fonts, vector shapes, form fields, and text remain sharp and searchable (Ctrl+F).",
      },
      {
        q: 'How do I compress PDF for WhatsApp or email attachments?',
        a: 'Select your PDF, choose the Balanced compression mode (which typically achieves 40% to 75% reduction), and download your file in seconds. It will easily fit standard email and messaging size limits.',
      },
      {
        q: 'Is there any file limit or signup required?',
        a: 'None at all. Compixor is free, no signup, no upload, works in your browser with unlimited daily conversions and batch processing support.',
      },
      {
        q: 'What happens if my PDF is already compressed?',
        a: "Compixor's Size Inflation Guard automatically detects when a PDF is already optimized. If running compression again would increase the file size, the tool automatically returns your original file untouched — so you never end up with a larger file than you started with.",
      },
      {
        q: 'Can I upload and compress multiple PDFs at once?',
        a: 'Yes. You can drop or select up to 5 PDF files at once (each up to 100MB). All files are compressed concurrently in your browser with live progress tracking, and you can download them individually or as a single ZIP archive.',
      },
    ],
    features: [
      {
        title: 'Native Vector Preservation',
        description: 'Fonts, vector lines, and digital text remain razor sharp at any zoom level — zero rasterization.',
      },
      {
        title: 'Size Inflation Guard',
        description: 'If a PDF is already compressed, Compixor automatically returns your original file so it never grows larger.',
      },
      {
        title: '100% Client-Side Privacy',
        description: 'All operations execute inside your browser memory. Your files never touch external cloud servers.',
      },
    ],
    relatedToolSlugs: ['pdf-to-word', 'pdf-organizer', 'protect-pdf'],
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any (Web Browser)',
    featureList: [
      'In-browser vector stream optimization',
      'Compress PDF to 100kb, 200kb, or 500kb',
      'Batch PDF compression up to 5 files',
      'Zero server upload privacy',
      'Custom target kilobyte sizing',
    ],
  },

  'pdf-organizer': {
    slug: 'pdf-organizer',
    name: 'PDF Merge & Split',
    icon: Combine,
    title: 'Merge PDF Online Free - Combine & Split Pages',
    description:
      'Merge PDF online free without upload. Combine PDF files into one, split pages, or extract sheets with no watermark. Free and works in browser.',
    canonicalUrl: `${BASE_URL}/tools/pdf-organizer`,
    primaryKeyword: 'merge pdf online free',
    searchIntent:
      'Users seeking to combine multiple PDF documents into a single file or extract/split individual page ranges without watermarks, registration, or uploading confidential records.',
    secondaryKeywords: [
      'merge pdf online',
      'split pdf online',
      'combine pdf files into one',
      'merge multiple pdfs into one',
      'combine pdf pages',
      'split pdf by pages',
      'extract pages from pdf',
      'separate pdf pages',
      'split pdf into multiple files',
      'free pdf merger and splitter',
      'pdf merger no watermark',
      'merge pdf without upload',
    ],
    longTailKeywords: [
      'merge multiple pdfs into one',
      'combine pdf files into one',
      'merge pdf online free',
      'combine pdf pages',
      'split pdf online',
      'split pdf by pages',
      'extract pages from pdf',
      'separate pdf pages',
      'split pdf into multiple files',
      'free pdf merger and splitter',
    ],
    keywords: [
      'merge pdf online free',
      'merge multiple pdfs into one',
      'combine pdf files into one',
      'split pdf online',
      'extract pages from pdf',
      'pdf merger no watermark',
      'merge pdf without upload',
      'split pdf by pages',
      'combine pdf pages',
      'free pdf merger',
    ],
    h1: 'Merge PDF Online Free',
    introParagraph:
      'Easily merge PDF online free without compromising file confidentiality. Compixor AI provides a fast, intuitive toolkit to combine PDF files into one single document, join PDF files free, or split PDF pages online by custom page ranges. Whether you want to assemble business contracts, merge PDFs for student assignments, or extract pages from PDF files, everything executes entirely on your device. Experience a professional PDF merger no watermark: free, no signup, no upload, works in your browser with real-time visual page previews. Organize, reorder, delete, and join PDF documents effortlessly with zero server latency and total privacy.',
    howToSteps: [
      {
        name: 'Add PDF Files',
        text: 'Drop multiple PDF documents or select pages you wish to organize or join.',
      },
      {
        name: 'Arrange Page Sequence',
        text: 'Drag and drop visual thumbnails to reorder pages, rotate sideways sheets, or delete unnecessary pages.',
      },
      {
        name: 'Choose Merge or Split',
        text: 'Select Combine All to merge into one file, or choose Split by Range to export specific page subsets.',
      },
      {
        name: 'Export Instantly',
        text: 'Click Save to assemble and download your newly organized PDF document in seconds.',
      },
    ],
    faqs: [
      {
        q: 'How do I merge PDF online free without uploading documents?',
        a: 'Simply drop your PDF files into Compixor. Our browser-based engine combines your PDF documents entirely inside local memory using client-side JavaScript, meaning zero server transmission.',
      },
      {
        q: 'Can I combine PDF files into one and reorder pages?',
        a: 'Yes. You can drag and drop page thumbnails to rearrange them in any sequence, rotate oriented pages, or delete specific pages before merging into a single final file.',
      },
      {
        q: 'Does this PDF merger add any watermark to my files?',
        a: 'Never. Compixor is a clean, professional PDF merger no watermark. Your exported documents contain only your original content without branding or stamps.',
      },
      {
        q: 'How can I split PDF pages online or extract pages from PDF?',
        a: 'Switch to the Split tab, specify individual page numbers or ranges (e.g., 1-3, 5, 8-10), and extract those exact sheets into a new lightweight PDF file in one click.',
      },
      {
        q: 'Is there a limit on how many PDF files I can merge?',
        a: 'Because processing relies on your own device hardware rather than server queues, you can merge multiple large PDF files with no daily caps or subscriptions.',
      },
    ],
    features: [
      {
        title: 'Visual Drag-and-Drop Grid',
        description: 'Interactive page thumbnails let you reorder, rotate, or delete individual sheets with ease.',
      },
      {
        title: 'Clean Watermark-Free Output',
        description: 'Export pristine documents containing only your original materials with no added stamps or ads.',
      },
      {
        title: 'Client-Side Assembly',
        description: 'All merging and splitting takes place in your browser buffer with zero data transferred online.',
      },
    ],
    relatedToolSlugs: ['pdf-to-word', 'pdf-compressor', 'add-watermark'],
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any (Web Browser)',
    featureList: [
      'Combine multiple PDF files into one',
      'Split PDF pages by custom ranges',
      'Reorder, rotate, and delete pages visually',
      'No watermark on exported files',
      '100% private in-browser merging',
    ],
  },

  'add-watermark': {
    slug: 'add-watermark',
    name: 'Add PDF Watermark',
    icon: Stamp,
    title: 'Add Watermark to PDF Online Free - Text & Logo',
    description:
      'Add watermark to PDF online free without upload. Stamp custom text or transparent logo images with full privacy. Free, works in your browser.',
    canonicalUrl: `${BASE_URL}/tools/add-watermark`,
    primaryKeyword: 'add watermark to pdf online free',
    searchIntent:
      'Users needing to brand draft proposals, add confidential text stamps, or embed company logos into PDF documents across all or selected pages with precise opacity and angle controls.',
    secondaryKeywords: [
      'add watermark to pdf online',
      'add text watermark to pdf',
      'add image watermark to pdf',
      'watermark pdf online free',
      'add logo to pdf',
      'pdf watermark maker',
      'watermark multiple pdf pages',
      'stamp pdf online',
      'add confidential watermark to pdf',
      'free pdf watermark tool',
    ],
    longTailKeywords: [
      'add watermark to pdf online',
      'add text watermark to pdf',
      'add image watermark to pdf',
      'watermark pdf online free',
      'add logo to pdf',
      'pdf watermark maker',
      'watermark multiple pdf pages',
      'stamp pdf online',
      'add confidential watermark to pdf',
      'free pdf watermark tool',
    ],
    keywords: [
      'add watermark to pdf online free',
      'pdf watermark maker',
      'add text watermark to pdf',
      'add logo to pdf',
      'confidential watermark pdf',
      'watermark pdf without software',
      'add watermark to pdf without upload',
      'stamp pdf online',
    ],
    h1: 'Add Watermark to PDF Online Free',
    introParagraph:
      'Protect your intellectual property and add watermark to PDF online free in seconds. Compixor AI is an in-browser PDF watermark maker that lets you stamp custom text or add logo to PDF documents with complete layout control. Stamp a confidential watermark PDF, apply copyright notices, or brand draft proposals across all pages or custom page ranges. You can watermark PDF without software installation: free, no signup, no upload, works in your browser with real-time visual positioning, opacity sliders, and font rotation. Safeguard sensitive financial statements, legal contracts, and client reports with zero server exposure.',
    howToSteps: [
      {
        name: 'Select PDF File',
        text: 'Choose the document you want to brand or protect from unauthorized distribution.',
      },
      {
        name: 'Choose Watermark Type',
        text: 'Select either customizable text (e.g., CONFIDENTIAL, DRAFT) or upload a logo image (PNG/JPG).',
      },
      {
        name: 'Adjust Style & Position',
        text: 'Customize font size, rotation angle, opacity, color, and select target pages.',
      },
      {
        name: 'Apply & Download',
        text: 'Stamping is rendered directly in browser memory for instant download.',
      },
    ],
    faqs: [
      {
        q: 'How can I add watermark to PDF online free without uploading files?',
        a: 'Compixor applies your watermarks directly in browser memory using client-side PDF modification engines. Your file never leaves your computer, ensuring absolute privacy.',
      },
      {
        q: 'Can I add both text and image logos as watermarks?',
        a: 'Yes. You can add text watermark to PDF with custom typography, rotation, and opacity, or add logo to PDF using transparent PNGs or JPG brand badges.',
      },
      {
        q: 'Can I apply a confidential watermark PDF across specific pages only?',
        a: 'Yes. You can choose to stamp all pages, only the first page, odd/even pages, or a customized page range like 1-5, 8.',
      },
      {
        q: 'Do I need to install Adobe Acrobat or extra software?',
        a: 'No software is needed. You can watermark PDF without software directly in Chrome, Edge, Safari, or Firefox on desktop and mobile.',
      },
      {
        q: 'Does adding a watermark degrade the original PDF text?',
        a: 'Not at all. The watermark is layered on top of or beneath existing content streams without re-rasterizing your vector text or destroying existing form fields.',
      },
      {
        q: 'Will adding a watermark flatten or rasterize my PDF text?',
        a: 'No! Unlike tools that convert entire pages into low-resolution JPEG images, Compixor injects native vector text layers and XObjects directly into the PDF content stream. The underlying text remains 100% crisp, vector-sharp, and selectable.',
      },
      {
        q: 'Are my watermark settings saved between browser sessions?',
        a: 'Yes. Your selected text, font, color, opacity, rotation, scale, and layout preferences are automatically saved in your browser’s localStorage.',
      },
    ],
    features: [
      {
        title: 'Custom Text & Logo Watermarks',
        description: 'Choose diagonal text stamps or upload transparent PNG company logos with pixel-perfect placement.',
      },
      {
        title: 'Precise Opacity & Angle Control',
        description: 'Adjust transparency from 5% to 100% and rotate watermarks from -90° to +90° to match your brand.',
      },
      {
        title: 'Zero Server Transmission',
        description: 'Client-side stamping ensures client contracts and financial records remain 100% confidential.',
      },
    ],
    relatedToolSlugs: ['remove-watermark', 'protect-pdf', 'pdf-organizer'],
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any (Web Browser)',
    featureList: [
      'Add text watermarks with custom rotation and font styling',
      'Embed company logos and transparent PNG stamps',
      'Selective page range watermarking',
      'Under-content and overlay layer options',
      '100% private in-browser document stamping',
    ],
  },

  'remove-watermark': {
    slug: 'remove-watermark',
    name: 'Remove PDF Watermark',
    icon: Eraser,
    title: 'Remove Watermark from PDF Free - Erase Stamps',
    description:
      'Remove watermark from PDF free without upload or Adobe Acrobat. Erase stamps, logos, and text overlays in seconds. Free, works in your browser.',
    canonicalUrl: `${BASE_URL}/tools/remove-watermark`,
    primaryKeyword: 'remove watermark from pdf free',
    searchIntent:
      'Users looking to delete unwanted background text, draft stamps, sample watermarks, or logos from PDF files without paying for expensive PDF editors or uploading sensitive files.',
    secondaryKeywords: [
      'pdf watermark remover',
      'remove pdf watermark online',
      'erase watermark from pdf',
      'remove text watermark from pdf',
      'remove image watermark from pdf',
      'pdf watermark remover free',
      'delete watermark from pdf',
      'clean watermark from pdf',
      'remove pdf stamp',
      'how to remove watermark from pdf',
    ],
    longTailKeywords: [
      'remove watermark from pdf online',
      'pdf watermark remover',
      'erase watermark from pdf',
      'remove text watermark from pdf',
      'remove image watermark from pdf',
      'pdf watermark remover free',
      'delete watermark from pdf',
      'clean watermark from pdf',
      'remove pdf stamp',
      'how to remove watermark from pdf without adobe',
    ],
    keywords: [
      'remove watermark from pdf free',
      'pdf watermark remover online',
      'how to remove watermark from pdf',
      'delete watermark from pdf without software',
      'remove watermark from pdf without adobe',
      'remove pdf watermark no upload',
      'erase pdf stamps',
      'clean pdf documents',
    ],
    h1: 'Remove Watermark from PDF Free',
    introParagraph:
      'Looking to remove watermark from PDF free without compromising document privacy? Compixor AI features a cutting-edge PDF watermark remover online that strips unwanted stamps, draft notices, background text, and sample logos from PDF files. If you are wondering how to remove watermark from PDF without Adobe Acrobat or expensive subscriptions, our dual-engine eraser provides both automated digital layer stripping and interactive visual area redaction. Delete watermark from PDF without software: free, no signup, no upload, works in your browser using local WebAssembly. Clean invoices, legal exhibits, research reports, and academic papers with pristine text preservation.',
    howToSteps: [
      {
        name: 'Load Watermarked PDF',
        text: 'Drop your PDF into the tool for instant local parsing without server upload.',
      },
      {
        name: 'Select Removal Method',
        text: 'Use Auto Clean to detect standard watermark layers, or select the visual box eraser.',
      },
      {
        name: 'Target Watermark Text',
        text: 'Enter the text phrase (e.g., DRAFT, CONFIDENTIAL) or draw a box over the logo stamp.',
      },
      {
        name: 'Erase & Download',
        text: 'Download the cleaned PDF with watermarks eradicated and underlying text intact.',
      },
    ],
    faqs: [
      {
        q: 'How to remove watermark from PDF without software or Adobe Acrobat?',
        a: 'Simply load your PDF into Compixor. Our browser-based PDF watermark remover online parses internal content streams and removes watermark objects without needing Adobe Acrobat.',
      },
      {
        q: 'Can I remove PDF watermark with no upload to third-party servers?',
        a: 'Yes. Compixor operates 100% client-side. The entire watermark extraction and PDF rewriting occur in your browser private memory.',
      },
      {
        q: 'Will removing the watermark damage the text underneath?',
        a: 'Our smart stream-filtering engine isolates overlay stamp objects and text operators, removing only the watermark while keeping original vector text and layouts byte-identical.',
      },
      {
        q: 'Can I remove transparent image logos and colored stamps?',
        a: 'Yes. You can use the Interactive Visual Redaction mode to draw a precise boundary box over any graphic stamp, logo, or background artifact to erase it.',
      },
      {
        q: 'Is this tool completely free with no signup?',
        a: 'Yes. Compixor is free, no signup, no upload, works in your browser with unlimited daily watermark removals.',
      },
      {
        q: 'How does lossless watermark removal work?',
        a: 'Watermarks created with Compixor are tagged with structured marked content (/Artifact /CompixorWatermark). When removing, our engine strips the dedicated watermark stream while leaving every original page content stream 100% byte-identical.',
      },
      {
        q: 'Can I remove watermarks from PDFs created by other software?',
        a: 'Yes. You can use our Targeted Text Matcher to strip matching text operators from the PDF stream, or the Interactive Erase Box tool to vector-redact watermark blocks. For scanned/flattened pages where the watermark is baked into image pixels, automatic stream removal is not possible, so a redaction patch or OCR fallback should be used.',
      },
    ],
    features: [
      {
        title: 'Dual Engine Stripping',
        description: 'Automated content-stream operator filtering combined with interactive visual box redaction.',
      },
      {
        title: 'Byte-Identical Preservation',
        description: 'Underlying document typography, vectors, and embedded images remain completely undamaged.',
      },
      {
        title: 'Zero Cloud Storage',
        description: 'Process private legal briefs and academic papers with 100% local browser execution.',
      },
    ],
    relatedToolSlugs: ['add-watermark', 'unlock-pdf', 'pdf-compressor'],
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any (Web Browser)',
    featureList: [
      'Automatic digital watermark stream stripping',
      'Visual interactive bounding box stamp redaction',
      'Targeted string pattern watermark removal',
      'Preserve crisp vector text and fonts underneath',
      'Zero server upload privacy',
    ],
  },

  'protect-pdf': {
    slug: 'protect-pdf',
    name: 'Protect PDF',
    icon: Lock,
    title: 'Password Protect PDF Online Free - AES-256',
    description:
      'Password protect PDF online free with strong AES-256 encryption. Lock PDF files, restrict editing and printing safely with zero file uploads.',
    canonicalUrl: `${BASE_URL}/tools/protect-pdf`,
    primaryKeyword: 'password protect pdf online free',
    searchIntent:
      'Users wanting to lock PDF files with strong passwords, encrypt sensitive documents (bank statements, contracts, personal records), and configure printing/editing restrictions.',
    secondaryKeywords: [
      'protect pdf with password',
      'password protect pdf online',
      'encrypt pdf online',
      'secure pdf with password',
      'pdf password protection',
      'protect pdf from editing',
      'protect pdf from copying',
      'secure pdf online free',
      'encrypt pdf with password',
      'pdf security tool',
    ],
    longTailKeywords: [
      'protect pdf with password',
      'password protect pdf online',
      'encrypt pdf online',
      'secure pdf with password',
      'pdf password protection',
      'protect pdf from editing',
      'protect pdf from copying',
      'secure pdf online free',
      'encrypt pdf with password',
      'aes 256 pdf encryption online',
    ],
    keywords: [
      'password protect pdf online free',
      'lock pdf with password',
      'encrypt pdf online',
      'add password to pdf',
      'restrict pdf editing and printing',
      'protect pdf without upload',
      'AES-256 pdf encryption',
      'secure pdf documents',
    ],
    h1: 'Password Protect PDF Online Free',
    introParagraph:
      'Easily password protect PDF online free using robust security standards. Compixor AI allows you to lock PDF with password protection and encrypt PDF online directly in your browser. Whether you need to add password to PDF for personal bank statements, client contracts, or tax forms, our engine applies robust AES-256 PDF encryption. You can also restrict PDF editing and printing permissions to prevent unauthorized alterations or copying. Protect PDF without upload: free, no signup, no upload, works in your browser with zero data transmission. Your confidential passwords and documents remain exclusively on your device, ensuring confidential local execution.',
    howToSteps: [
      {
        name: 'Drop Your PDF File',
        text: 'Add the document you want to secure from unauthorized access or copying.',
      },
      {
        name: 'Set Strong Password',
        text: 'Enter a secure user password required to open and view the document.',
      },
      {
        name: 'Configure Restrictions',
        text: 'Optionally set permissions to block printing, editing, and content copying.',
      },
      {
        name: 'Encrypt & Save',
        text: 'Compixor applies AES-256 encryption locally and saves your locked file immediately.',
      },
    ],
    faqs: [
      {
        q: 'How do I password protect PDF online free without uploading it?',
        a: 'Compixor encrypts your PDF locally inside browser memory using WebAssembly cryptographic libraries. Your document and password never travel across any network.',
      },
      {
        q: 'What encryption standard is used to lock PDF with password?',
        a: 'We employ standard AES-256 (Advanced Encryption Standard 256-bit) and RC4/AES-128 algorithms compatible with Adobe Acrobat and all standard PDF readers.',
      },
      {
        q: 'Can I restrict PDF editing and printing without blocking viewing?',
        a: 'Yes. By specifying permissions, you can allow recipients to read the PDF while restricting them from modifying text, extracting pages, or sending it to printers.',
      },
      {
        q: 'What happens if I forget the password I set?',
        a: 'Because encryption is computed locally with zero server key storage, only someone with the password can open the encrypted PDF. Always keep a safe record of your password.',
      },
      {
        q: 'Is there any cost or registration required to encrypt PDF online?',
        a: 'No. Compixor is 100% free, no signup, no upload, works in your browser with no file quantity limits.',
      },
    ],
    features: [
      {
        title: 'AES-256 Encryption',
        description: 'Industry-standard encryption ensures your documents cannot be decrypted without your password.',
      },
      {
        title: 'Granular Access Permissions',
        description: 'Prevent document modification, assembly, form filling, and high-resolution printing.',
      },
      {
        title: 'Zero Server Key Exposure',
        description: 'Passwords and encryption keys are generated in local browser memory and never stored.',
      },
    ],
    relatedToolSlugs: ['unlock-pdf', 'pdf-compressor', 'pdf-organizer'],
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any (Web Browser)',
    featureList: [
      'AES-256 and AES-128 standard PDF encryption',
      'User password protection to restrict viewing',
      'Owner password permissions to restrict editing and printing',
      'Zero server upload client-side cryptography',
      'Compatible with Adobe Acrobat and all PDF viewers',
    ],
  },

  'unlock-pdf': {
    slug: 'unlock-pdf',
    name: 'Unlock PDF',
    icon: LockOpen,
    title: 'Unlock PDF Online Free - Remove Password',
    description:
      'Unlock PDF online free without uploading files. Remove PDF password security and printing restrictions instantly. 100% private and in-browser.',
    canonicalUrl: `${BASE_URL}/tools/unlock-pdf`,
    primaryKeyword: 'unlock pdf online free',
    searchIntent:
      'Users who own password-protected PDFs (salary slips, utility bills, receipts) and want to permanently remove password prompts or clear printing/copying permission locks.',
    secondaryKeywords: [
      'remove pdf password',
      'unlock protected pdf',
      'remove pdf restrictions',
      'pdf password remover',
      'unlock pdf with password',
      'remove editing restrictions from pdf',
      'unlock secured pdf',
      'pdf unlocker online',
      'free pdf unlock tool',
      'decrypt pdf document',
    ],
    longTailKeywords: [
      'unlock pdf online free',
      'remove pdf password',
      'unlock protected pdf',
      'remove pdf restrictions',
      'pdf password remover',
      'unlock pdf with password',
      'remove editing restrictions from pdf',
      'unlock secured pdf',
      'pdf unlocker online',
      'free pdf unlock tool',
    ],
    keywords: [
      'unlock pdf online free',
      'remove password from pdf',
      'pdf password remover',
      'unlock pdf without password',
      'remove pdf restrictions',
      'unlock pdf no upload',
      'decrypt pdf document',
      'remove pdf printing lock',
    ],
    h1: 'Unlock PDF Online Free',
    introParagraph:
      'Quickly unlock PDF online free to remove password from PDF documents you own. Compixor AI serves as a fast, secure PDF password remover that decrypts password-protected files and helps remove PDF restrictions on printing, copying, and editing. If you know the password and are tired of re-entering it every time you open your utility bills or financial records, our tool strips encryption permanently in seconds. Unlock PDF no upload: free, no signup, no upload, works in your browser with 100% private local execution. Save an unlocked, unrestricted copy of your PDF without sending sensitive personal data across the internet.',
    howToSteps: [
      {
        name: 'Select Locked PDF',
        text: 'Drag and drop your password-protected PDF document into the browser.',
      },
      {
        name: 'Enter Current Password',
        text: 'Type the valid password to authorize decryption in memory.',
      },
      {
        name: 'Strip Security Restrictions',
        text: 'Compixor cleans the encryption envelope and permission blocks locally.',
      },
      {
        name: 'Download Unlocked PDF',
        text: 'Save the clean, permanently unlocked PDF file ready for quick access.',
      },
    ],
    faqs: [
      {
        q: 'How can I unlock PDF online free without uploading my file?',
        a: 'Compixor decrypts the document directly in browser memory. Since the file is never sent to a remote server, your sensitive data and passwords remain completely secure.',
      },
      {
        q: 'Can I remove password from PDF permanently?',
        a: 'Yes. Once you provide the current password, Compixor removes the encryption flags and exports a fresh, unlocked PDF that will never ask for a password again.',
      },
      {
        q: 'Can this tool remove PDF restrictions on copying and printing?',
        a: 'Yes. Owner restrictions that prevent printing, copying text, or editing forms are stripped cleanly, giving you full access to your document.',
      },
      {
        q: 'Can I unlock PDF without password if I forgot it?',
        a: 'Standard owner permissions can often be cleared, but PDFs with strong AES-256 user open passwords require entering the authorized password once to verify decryption.',
      },
      {
        q: 'Is there any charge or subscription needed to unlock PDF files?',
        a: 'Compixor is completely free, no signup, no upload, works in your browser on desktop, tablet, and mobile devices.',
      },
    ],
    features: [
      {
        title: 'Permanent Password Removal',
        description: 'Removes the encryption dictionary so you never have to re-enter your password again.',
      },
      {
        title: 'Strip Printing & Copying Limits',
        description: 'Restores full rights to print, select text, and edit forms on restricted documents.',
      },
      {
        title: '100% Private In-Browser Decryption',
        description: 'Passwords and sensitive financial records are processed locally in RAM with zero cloud exposure.',
      },
    ],
    relatedToolSlugs: ['protect-pdf', 'pdf-compressor', 'remove-watermark'],
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any (Web Browser)',
    featureList: [
      'Permanent password removal for authorized files',
      'Strip owner editing, printing, and copying restrictions',
      'Retain 100% original text, layout, and image quality',
      'Client-side decryption in browser memory',
      'Zero server upload privacy',
    ],
  },

  'word-compressor': {
    slug: 'word-compressor',
    name: 'Word Compressor',
    icon: FileArchive,
    title: 'Compress Word Document Online Free (DOCX)',
    description:
      'Compress Word document online free without losing quality. Reduce DOCX file size with embedded images for email attachments. Zero upload.',
    canonicalUrl: `${BASE_URL}/tools/word-compressor`,
    primaryKeyword: 'compress word document online free',
    searchIntent:
      'Users looking to shrink large Microsoft Word (.docx) files bloated by embedded photos or screenshots so they can be emailed (under 25MB) or submitted to portal limits without formatting changes.',
    secondaryKeywords: [
      'compress word document online',
      'compress docx',
      'reduce docx file size',
      'word document compressor',
      'reduce word file size',
      'compress docx without losing formatting',
      'make word document smaller',
      'shrink docx file',
      'compress word file online',
      'free word compressor',
    ],
    longTailKeywords: [
      'compress word document online',
      'compress docx',
      'reduce docx file size',
      'word document compressor',
      'reduce word file size',
      'compress docx without losing formatting',
      'make word document smaller',
      'shrink docx file',
      'compress word file online',
      'free word compressor',
    ],
    keywords: [
      'compress word document online free',
      'reduce docx file size',
      'compress word file with images',
      'word file size reducer',
      'compress doc file for email',
      'compress word document without losing quality',
      'shrink docx online',
      'free word compressor',
    ],
    h1: 'Compress Word Document Online Free',
    introParagraph:
      'Easily compress Word document online free without losing quality. Compixor AI is an efficient Word file size reducer engineered to reduce DOCX file size by re-compressing high-resolution embedded media, screenshots, and illustrations. When preparing to compress DOC file for email attachments or submit university dissertations, large uncompressed photos often bloat files beyond upload limits. Compixor lets you compress Word file with images while preserving your exact typography, tables, margins, styles, and XML layout intact. It is free, no signup, no upload, works in your browser with zero server data storage. Reclaim storage space and share reports instantly.',
    howToSteps: [
      {
        name: 'Drop Your Word File',
        text: 'Select or drop your .docx document into the browser drop zone.',
      },
      {
        name: 'Select Image Quality',
        text: 'Choose between Balanced (high reduction) or Maximum Quality presets.',
      },
      {
        name: 'In-Browser DOCX Compression',
        text: 'Our engine unpacks the DOCX ZIP archive, compresses internal photos, and repacks XML structures locally.',
      },
      {
        name: 'Download Compressed DOCX',
        text: 'Save your significantly smaller Word file ready for emailing.',
      },
    ],
    faqs: [
      {
        q: 'How to compress Word document online free without uploading files?',
        a: 'Compixor unpacks your DOCX file directly inside your browser memory using JavaScript, compresses embedded graphics, and rebuilds the file without sending data to any server.',
      },
      {
        q: 'Will compressing my Word file alter formatting, tables, or fonts?',
        a: 'No. Only embedded raster images are re-encoded. All text styles, fonts, margins, formulas, tables, and XML document structures remain completely unchanged.',
      },
      {
        q: 'How much can I reduce DOCX file size?',
        a: 'For documents with multiple embedded camera photos or screenshots, reductions between 40% and 80% are common. Documents with only raw text are already compact.',
      },
      {
        q: 'Can I compress Word file for email attachments?',
        a: 'Yes. Compixor easily shrinks 25MB+ Word documents down to under 5MB, making them ideal for standard email attachment size limits.',
      },
      {
        q: 'Is there any software installation or signup needed?',
        a: 'None. Compixor is free, no signup, no upload, works in your browser across all modern operating systems.',
      },
      {
        q: 'What if my Word document has no images?',
        a: "If your document contains no embedded images, there is very little to compress — text and XML markup are already extremely lightweight. In this case, Compixor will return your file with minimal or no size change, since further compression would provide no real benefit.",
      },
    ],
    features: [
      {
        title: 'Targeted Media Re-Encoding',
        description: 'Downsamples and compresses embedded JPEG and PNG images where 90% of file bloat occurs.',
      },
      {
        title: 'Zero Formatting Distortion',
        description: 'Document XML, paragraph styles, headers, tables, and citations remain 100% untouched.',
      },
      {
        title: 'Local Client-Side Execution',
        description: 'Unzips, optimizes, and repacks DOCX files inside your browser tab with zero cloud exposure.',
      },
    ],
    relatedToolSlugs: ['img-to-word', 'pdf-to-word', 'pdf-compressor'],
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any (Web Browser)',
    featureList: [
      'Reduce DOCX file size up to 90%',
      'Optimize embedded images without formatting loss',
      'High-fidelity layout and table preservation',
      'Ready for Outlook/Gmail 25MB email caps',
      '100% in-browser client-side compression',
    ],
  },

  'passport-photo': {
    slug: 'passport-photo',
    name: 'Passport Photo Maker',
    icon: IdCard,
    title: 'Pakistani Passport Size Photo Maker – 35x45mm 300 DPI | Compixor',
    description:
      'Create official 35x45 mm Pakistan passport and NADRA CNIC photos online free. AI white or light blue background, 300 DPI print sheets, private in-browser tool.',
    canonicalUrl: `${BASE_URL}/tools/passport-photo`,
    primaryKeyword: 'pakistani passport size photo maker',
    searchIntent:
      'Users wanting to create official biometric passport, visa, or identity photos for Pakistan NADRA CNIC, DGIP passport renewals, PAK-ID portal, and international embassies with pure white or light blue background, 300 DPI print sheets, and file size limits under 50KB.',
    secondaryKeywords: [
      'nadra cnic photo size online',
      '35x45 mm photo maker online free',
      'passport photo 300 dpi white background pakistan',
      'dgip passport photo requirements',
      'nicop photo size',
      'compress passport photo to 20kb pakistan',
      'change photo background to white online free',
      'passport photo print sheet a4 a5 a6',
      'pak id photo upload requirements',
      'passport photo maker pakistan',
      'nadra passport photo size',
      'cnic photo size and maker',
      '6 passport photos on a5',
      '2 passport photos on a6',
      'make passport photos at home and print',
      'passport photo blue white red background',
      'id photo background changer',
      'passport size photo banane ka tarika',
      'passport size photo online banayen',
      'nadra photo size kitna hota hai',
    ],
    longTailKeywords: [
      'pakistani passport size photo maker online free',
      'nadra cnic photo size online 35x45 mm',
      '35x45 mm photo maker online free 300 dpi',
      'passport photo 300 dpi white background pakistan',
      'dgip passport photo requirements online',
      'nicop photo size for overseas pakistanis',
      'compress passport photo to 20kb pakistan pak id',
      'passport photo maker no signup private',
      '6 passport photos on a5 print sheet with crop marks',
      'make passport photos at home and print at 100 percent',
    ],
    keywords: [
      'pakistani passport size photo maker',
      'nadra cnic photo size online',
      'passport size photo maker online free',
      '35x45 mm photo maker',
      'passport photo 300 dpi white background pakistan',
      'dgip passport photo requirements',
      'nicop photo size',
      'compress passport photo to 20kb pakistan',
      'passport photo maker pakistan',
      'nadra passport photo size',
      'cnic photo size and maker',
      'passport photo print sheet a4 a5 a6',
      'change photo background colour online free',
      'id photo background changer',
      'pak id photo upload requirements',
    ],
    h1: 'Pakistani Passport Size Photo Maker Online Free (NADRA & DGIP 35×45 mm)',
    introParagraph:
      'Create official biometric passport and ID photos online with Compixor\'s free passport photo maker. Specifically calibrated for Pakistan DGIP passport requirements (35×45 mm), NADRA CNIC and NICOP identity cards, and the PAK-ID mobile portal, our studio also supports US 2×2 inch, UK, and European Schengen specifications. AI removes your background instantly in local memory—switch effortlessly to official white, off-white, light blue, or sky blue. Export single JPEG portraits with our under-50KB portal limiter, or generate 300 DPI studio print sheets (A4, A5 with 6 photos, A6 with 2 photos) with calibrated crop marks ready for home or lab printing with zero signups and zero watermarks.',
    howToSteps: [
      {
        name: 'Upload Your Portrait Photo',
        text: 'Upload any front-facing smartphone portrait taken in natural daylight. In Private Mode, processing runs 100% locally on your device without leaving your browser.',
      },
      {
        name: 'Select Country Biometric Preset',
        text: 'Choose Pakistan Passport / NADRA CNIC (35×45 mm), US Passport / Visa (2×2 inch), UK / Schengen (35×45 mm), Canada (50×70 mm), or custom dimensions.',
      },
      {
        name: 'Set Official Background Color',
        text: 'AI cleanly segments hair and shoulders. Select official white (for international visas & PAK-ID portal) or consular light blue (for manual NADRA submissions).',
      },
      {
        name: 'Align Facial Proportions with Biometric Guides',
        text: 'Toggle the biometric overlay guides to verify that your head height occupies 70% to 80% of the vertical frame (32–36 mm for Pakistan).',
      },
      {
        name: 'Download 300 DPI Image or Print Sheet (A4, A5, A6)',
        text: 'Export a single digital JPEG under 50 KB for online portals, or download a 300 DPI print-ready sheet (A4, A5 with 6 photos, A6 with 2 photos) with precision crop marks.',
      },
    ],
    faqs: [
      {
        q: 'What is the official Pakistani passport photo size in mm and pixels?',
        a: 'The official Pakistan DGIP passport and NADRA CNIC photo size is 35 mm wide by 45 mm high (35×45 mm). At standard 300 DPI print density, this translates to exactly 413×531 pixels. For high-resolution 600 DPI printing, the pixel count is 826×1062 pixels.',
      },
      {
        q: 'Does Pakistan passport and NADRA require a white or light blue background?',
        a: 'For official online passport renewals through the DGIP e-Services portal and the NADRA PAK-ID mobile application, a plain solid white background is mandatory. For in-person applications at local NADRA executive centers and passport offices, light blue (#e0f2fe) is traditionally accepted and commonly used. Compixor lets you toggle between official white and light blue in a single click.',
      },
      {
        q: 'What are the photo upload requirements for the NADRA PAK-ID mobile app?',
        a: 'The NADRA PAK-ID application requires a front-facing portrait with a solid white background, neutral facial expression (no teeth showing), both ears and shoulders visible, no flash glare on eyeglasses, and a file size between 20 KB and 50 KB. Compixor includes a dedicated file-size limiter to ensure your image passes PAK-ID upload validations.',
      },
      {
        q: 'How do I compress my passport photo to under 50 KB or 20 KB for Pakistani government portals?',
        a: 'When exporting your photo from Compixor, use our built-in file size limiter slider. Our client-side canvas engine automatically adjusts JPEG compression tables to keep the file under 50 KB (or down to 20 KB) while preserving critical 300 DPI facial biometric sharpness required by government automated scanners.',
      },
      {
        q: 'What is the head height and facial ratio required for Pakistan passport photos?',
        a: 'According to ICAO 9303 standards adopted by Pakistan DGIP and NADRA, the distance from the bottom of the chin to the crown of the head must measure between 32 mm and 36 mm (occupying 70% to 80% of the total 45 mm photo height). Turn on Compixor\'s Biometric Overlay Guide to align your face perfectly within these parameters.',
      },
      {
        q: 'Can I take a Pakistani passport photo with my smartphone at home?',
        a: 'Yes. Stand approximately 4 to 5 feet away from your phone camera against any wall in indirect natural daylight facing a window. Keep your head straight with a neutral expression. Upload the portrait to Compixor—our AI removes room shadows and clutter, sets the background to pure white or light blue, and formats the photo to official 35×45 mm dimensions.',
      },
      {
        q: 'How do I print 6 passport photos on an A5 sheet or 2 photos on an A6 sheet?',
        a: 'In the Compixor export panel, select "Print Sheet" and choose either A5 (which fits 6 standard 35×45 mm photos in a 3×2 grid) or A6 (which fits 2 photos side by side). Both layouts include calibrated hairline corner crop marks and standard 300 DPI JFIF density tags.',
      },
      {
        q: 'Why must I disable "Fit to Page" when printing passport photos at home?',
        a: 'Enabling "Fit to page" or "Shrink to fit" forces printer software to scale the entire layout down to accommodate printer hardware margins, shrinking your 35×45 mm photos to 31×40 mm and causing immediate consular rejection. Always select "Actual size" or set page scaling to exactly 100%.',
      },
      {
        q: 'Does Compixor upload my biometric face photos to any external server?',
        a: 'No. Compixor is built privacy-first. When you enable Private Mode, background segmentation, cropping, and 300 DPI rendering occur 100% locally in your device RAM using WebAssembly and HTML5 Canvas. Your biometric photos never touch a remote cloud server or external database.',
      },
      {
        q: 'Can I wear eyeglasses or a hijab/headscarf in a Pakistani passport photo?',
        a: 'Eyeglasses are generally discouraged; if worn, frames must be thin, cannot cover any part of the eyes, and must have zero flash glare or reflections. Hijabs and religious headscarves are fully permitted for Pakistani passports and NADRA cards, provided the face is completely visible from the bottom of the chin to the top of the forehead, including both cheeks and jawline.',
      },
      {
        q: 'What is the difference between DGIP passport photo rules and NADRA CNIC photo rules?',
        a: 'DGIP passport specifications strictly follow international ICAO 9303 standards for machine-readable travel documents, requiring a pure white background for digital e-services and 70–80% head coverage. NADRA CNIC requirements for manual center submissions historically permitted light blue backgrounds. Compixor supports both presets seamlessly.',
      },
      {
        q: 'Can I use this tool for US 2x2 inch, UK 35x45 mm, and Schengen visa photos too?',
        a: 'Yes. In addition to Pakistan NADRA (35×45 mm), Compixor includes verified presets for United States passports and visas (51×51 mm / 2×2 in with 50–69% head height), UK HM Passport Office (35×45 mm on light grey/cream), European Schengen visas (35×45 mm on white), Canada (50×70 mm), and China (33×48 mm).',
      },
    ],
    features: [
      {
        title: 'Pakistan NADRA & DGIP Presets',
        description: 'Exact 35×45 mm dimensions, 32–36 mm head height guides, and under-50KB portal file compression.',
      },
      {
        title: 'AI Background Changer (White & Light Blue)',
        description: 'Instant sub-pixel edge matting without green halos. One-click toggle between consular white and NADRA blue.',
      },
      {
        title: '300 DPI Studio Print Sheets (A4, A5, A6)',
        description: 'Tiled multi-photo sheets (A5 fits 6 photos, A6 fits 2 photos) with calibrated corner crop marks ready for home printing.',
      },
    ],
    relatedToolSlugs: ['full-dp-maker', 'qr-generator', 'pdf-compressor'],
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any (Web Browser)',
    featureList: [
      'Official Pakistan NADRA CNIC & DGIP passport 35×45 mm dimensions',
      'AI background removal with consular white and light blue swatches',
      '300 DPI studio print sheets: A4, A5 (6 photos), A6 (2 photos)',
      'Government online portal file-size limiter (under 50 KB / 20 KB)',
      'Biometric head height overlay guides (70%–80% ratio)',
      '100% in-browser Private Mode execution with zero server uploads',
      'Free forever with zero watermarks and no account registration',
    ],
  },
  
  'full-dp-maker': {
    slug: 'full-dp-maker',
    name: 'Full DP Maker',
    icon: FullDpIcon,
    title: 'Free Full DP Maker for WhatsApp – No Crop, 1080p | Compixor',
    description:
      'Create full-size WhatsApp DP without cropping. 100% private in-browser tool, blur/gradient fills, live circle preview, HD 1080×1080. Free, no signup, no watermark.',
    canonicalUrl: `${BASE_URL}/tools/full-dp-maker`,
    primaryKeyword: 'full dp maker whatsapp',
    searchIntent:
      'Users wanting to upload full vertical portraits or wide group photos as 1:1 square profile pictures on WhatsApp, Instagram, Facebook, and LinkedIn without having faces, heads, or shoes cropped out.',
    secondaryKeywords: [
      'whatsapp dp without cropping',
      'full size dp whatsapp',
      'whatsapp dp size',
      'dp maker no crop',
      'whatsapp profile picture size',
      'whatsapp dp resizer',
      'blur background dp maker',
      'full dp for whatsapp group photo',
      'set full photo as whatsapp dp',
      'square fit profile picture',
    ],
    longTailKeywords: [
      'how to set full dp on whatsapp without cropping',
      'how to make full size dp for whatsapp',
      'whatsapp dp size 640x640 or 1080x1080',
      'full dp maker online free no signup',
      'whatsapp profile picture full photo no crop',
      'blur background photo for whatsapp dp',
      'whatsapp dp safe zone circle preview',
      'best whatsapp dp maker without watermark',
      'full dp maker pakistan',
      'whatsapp dp size pakistan',
      'convert portrait to square for dp',
      'full dp maker online free without watermark',
    ],
    keywords: [
      'full dp maker whatsapp',
      'whatsapp dp without cropping',
      'full size dp whatsapp',
      'whatsapp dp size',
      'dp maker no crop',
      'whatsapp profile picture size',
      'blur background dp maker',
      'full dp maker online free',
      'whatsapp dp safe zone',
      'no crop profile picture',
    ],
    h1: 'Free Full DP Maker for WhatsApp: Set Full-Size Profile Pictures Without Cropping',
    introParagraph:
      'Create uncropped WhatsApp display pictures with Compixor\'s free Full DP Maker. Our 100% in-browser, client-side tool uses HTML5 Canvas so your personal photos are NEVER uploaded to any server. Fit any portrait (3:4, 9:16) or horizontal landscape into a sharp 1080×1080 HD square canvas with smart frosted ambient blur, clean studio white, or custom palette borders. Enjoy ultimate privacy, instant offline capability, zero signups, zero watermarks, no ads, and unlimited free exports across WhatsApp, Instagram, Facebook, and LinkedIn.',
    howToSteps: [
      {
        name: 'Upload or Paste Your Image',
        text: 'Click the upload area, drag and drop your photo, or press Ctrl+V (Cmd+V on Mac) to paste directly from your clipboard. Supports JPG, PNG, and WebP files up to 20 MB.',
      },
      {
        name: 'Choose Your Background Style',
        text: 'Select Blur to organically extend photo colors, Studio for clean monochrome framing, Gradient for subtle tonal transitions, or Mirror to reflect outer edges.',
      },
      {
        name: 'Adjust Scale and Positioning',
        text: 'Use the zoom and pan controls to fit and center your portrait or landscape photo comfortably inside the canvas.',
      },
      {
        name: 'Verify Circular Safe Zone',
        text: 'Toggle the circle mask preview to confirm key subjects, faces, or product logos sit comfortably within the central 75% to 80% circle.',
      },
      {
        name: 'Export in 1080x1080 Resolution',
        text: 'Click Download Full DP to export a high-definition 1080x1080 pixel image directly to your device storage.',
      },
      {
        name: 'Set Photo in WhatsApp',
        text: 'Open WhatsApp Settings, select Edit Profile Photo, and pick your downloaded image. The entire photo fits without requiring any cropping.',
      },
    ],
    faqs: [
      {
        q: 'What is the recommended upload size for a WhatsApp DP?',
        a: 'While Meta does not publish an official fixed dimension, the industry-standard recommendation for optimal clarity is 1080 × 1080 px. WhatsApp\'s servers internally downsample profile photos to approximately 640 × 640 px for network delivery. Uploading a master 1080 × 1080 px file guarantees that downsampling retains crisp lines and sharp facial details without pixelation.',
      },
      {
        q: 'Does Compixor store or upload my personal photos to a server?',
        a: 'No. Compixor executes 100% locally in your web browser using HTML5 Canvas technology. Your photos are never sent across the internet, never processed by remote cloud workers, and never stored on any external server or database. When you close or refresh your browser tab, your image data is completely cleared from memory.',
      },
      {
        q: 'Why does my picture look circular in the chat list but square when tapped?',
        a: 'WhatsApp employs a dual-presentation interface. In conversation feeds, contact lists, and status tabs, WhatsApp overlays a circular CSS mask over your avatar to maintain visual uniformity. When a contact taps on your profile photo, WhatsApp opens the raw file in its full-screen viewer, revealing the entire 1:1 square canvas including your background borders.',
      },
      {
        q: 'Which fill mode works best for vertical group pictures?',
        a: 'For group shots and full-length portraits, the Blur fill mode is generally the most aesthetic. It creates a softened, mirrored color palette sampled directly from your photo’s existing background, giving the picture an organic, studio-edited appearance rather than leaving stark blank margins.',
      },
      {
        q: 'What is the WhatsApp DP circle safe zone?',
        a: 'The circle safe zone represents the central 75% to 80% area of your 1:1 square image. Because WhatsApp clips off the four outer corners in contact lists, any important visual elements—such as human faces, logos, or typography—must remain within this central circle to prevent awkward clipping.',
      },
      {
        q: 'Can I use this tool offline or on a weak mobile network?',
        a: 'Yes. Because the entire processing script loads into your browser cache upon initial visit, Compixor can resize and format profile pictures completely offline. You can turn on Airplane Mode or work through unstable cellular connections without experiencing delays or dropped uploads.',
      },
      {
        q: 'Why is the exported image 1080 × 1080 instead of 500 × 500?',
        a: 'Legacy online tools frequently export at 500 × 500 px to conserve server processing power and cloud bandwidth. However, modern smartphone displays utilize high pixel densities (Retina, AMOLED, Super AMOLED). An image exported at 500 × 500 px appears visibly blurry on modern phones. Compixor exports at 1080 × 1080 px to ensure superior high-definition clarity.',
      },
      {
        q: 'Does this tool add any watermark or require an account?',
        a: 'No. Compixor is committed to zero-friction utility: there are no signups, no credit systems, no subscription walls, and absolutely no watermarks stamped onto your exported pictures.',
      },
      {
        q: 'How can small business owners format catalogue or product photos for WhatsApp?',
        a: 'Business owners can upload rectangular product photos, select a neutral Studio white or subtle gray border, and scale the product so that important model numbers, labels, or product boundaries remain visible inside the circular safe-zone preview. This ensures customers see the product clearly in their chat inbox before even tapping to expand.',
      },
      {
        q: 'Will downloading my DP reduce the image resolution?',
        a: 'No. Compixor preserves high visual fidelity by rendering your original pixels onto an ultra-sharp 1080 × 1080 canvas. Unlike messaging apps that aggressively strip image metadata and detail, our client-side exporter outputs clean, high-density JPG or PNG files within the ideal 200–500 KB range.',
      },
      {
        q: 'Can I use the same exported 1080 × 1080 picture for Instagram and Facebook?',
        a: 'Yes. As outlined in our Unified Platform Dimension Matrix, Instagram, Facebook, Telegram, LinkedIn, and X (Twitter) all use 1:1 square master dimensions with circular cropping in primary feeds. A single 1080 × 1080 px export from Compixor works universally across all your social channels.',
      },
      {
        q: 'Does Compixor work on budget Android smartphones and mobile browsers?',
        a: 'Yes. We have tested Compixor extensively across budget and mid-range Android devices (including Samsung Galaxy A-series, Xiaomi Redmi, Infinix, and Tecno) using Chrome, Samsung Internet, and Firefox. The client-side canvas engine executes smoothly with negligible memory usage.',
      },
    ],
    features: [
      {
        title: '100% In-Browser Privacy (HTML5 Canvas)',
        description: 'Files are processed in device RAM with zero server contact and zero cloud uploads.',
      },
      {
        title: 'Smart Frosted Ambient Blur',
        description: 'Automatically renders an aesthetically blurred, color-matched clone of your photo into the square margins.',
      },
      {
        title: '1080×1080 Lossless HD Scaling',
        description: 'Pre-formats images to 1080p square resolution so WhatsApp downscaling preserves maximum edge clarity.',
      },
      {
        title: 'Live Circular Safe-Zone Preview',
        description: 'Simulates WhatsApp and Instagram circular viewports in real time to avoid cut-off ears, foreheads, or logos.',
      },
    ],
    relatedToolSlugs: ['passport-photo', 'qr-generator', 'pdf-compressor', 'pdf-to-word', 'word-compressor'],
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any (Web Browser)',
    featureList: [
      '100% In-Browser / Client-Side (HTML5 Canvas)',
      'No server uploads - zero privacy leak',
      'Smart ambient Gaussian blur background generator',
      'Circular safe-zone live overlay preview',
      'Minimalist solid color & custom palette picker',
      '1080x1080 HD high-resolution export',
      'Free forever with no signup and no watermarks',
      'Works offline after initial page load',
    ],
  },

  'qr-generator': {
    slug: 'qr-generator',
    name: 'QR Code Generator',
    icon: QrCode,
    title: 'QR Code Generator with Logo Free – No Expiry, SVG | Compixor',
    description:
      'Create custom QR codes with your logo free. Permanent static barcodes for URLs, WiFi & WhatsApp that never expire. Vector SVG & 4K PNG. 100% private in-browser.',
    canonicalUrl: `${BASE_URL}/tools/qr-generator`,
    primaryKeyword: 'qr code generator with logo free',
    searchIntent:
      'Users looking for a 100% free, private online tool to generate permanent custom QR codes with embedded brand logos, custom colors, and vector SVG exports that never expire and have zero scan caps or monthly fees.',
    secondaryKeywords: [
      'custom qr code with logo',
      'free qr code generator no signup',
      'qr code with logo svg permanent no expiry',
      'free qr code maker in browser',
      'custom qr code generator faster than canva',
      'qr code monkey alternative private',
      'static qr code generator no expiration',
      'wifi qr code generator with password',
      'whatsapp qr code generator with message',
      'qr code generator svg png',
      'url qr code generator',
      'free custom qr code maker',
      'permanent qr code maker',
    ],
    longTailKeywords: [
      'qr code generator with logo free online no signup',
      'custom qr code with logo vector svg download',
      'free qr code maker with logo no expiration date',
      'permanent static qr code generator free forever',
      'qr code with logo svg permanent no expiry in browser',
      'wifi qr code generator with password wpa2 wpa3',
      'whatsapp qr code generator with pre filled message',
      'custom qr code generator faster than canva pro',
      'qrcode monkey alternative without ads or paywalls',
      'best free qr code generator for commercial print',
    ],
    keywords: [
      'qr code generator with logo free',
      'custom qr code with logo',
      'free qr code generator no signup',
      'permanent qr code without expiry',
      'qr code with logo svg',
      'wifi qr code generator',
      'whatsapp link qr code generator',
      'custom color qr code maker',
      'qr code generator svg png',
      'static qr code generator free',
    ],
    h1: 'Free QR Code Generator with Logo (Permanent, No Expiry, Vector SVG)',
    introParagraph:
      'Generate branded, scannable barcodes in seconds with Compixor\'s free custom QR code generator with logo. Unlike commercial services that hijack your links with redirect trackers and deactivate your codes after a 14-day trial, Compixor creates 100% permanent, static QR codes that never expire. Encode website URLs, guest Wi-Fi networks (WPA2/WPA3), direct WhatsApp messages, digital vCards, or Google Maps locations directly into the geometric matrix. Embed your custom company logo with high Reed-Solomon Level H (30%) error correction, customize dot styles and brand color palettes, and export razor-sharp vector SVG and 4K PNG files for flyers, packaging, and billboards—running 100% in your browser RAM with zero server tracking, zero signups, and zero watermarks.',
    howToSteps: [
      {
        name: 'Select QR Data Type',
        text: 'Choose Website URL, Wi-Fi network, WhatsApp direct message, vCard digital business card, Google Maps location, or Plain Text.',
      },
      {
        name: 'Input Destination Details',
        text: 'Enter your target website link or network credentials. Compixor formats and encodes the data matrix in real-time in your browser memory.',
      },
      {
        name: 'Embed Brand Logo & Customize Palette',
        text: 'Upload your company logo (PNG/SVG). Our engine sets 30% Reed-Solomon error correction and lets you customize dot patterns, corner eyes, and brand colors.',
      },
      {
        name: 'Download Lossless Vector SVG or 4K PNG',
        text: 'Download scalable vector SVG for commercial print flyers, packaging, and billboards, or 4K PNG for web and screens with permanent static zero-expiry encoding.',
      },
    ],
    faqs: [
      {
        q: 'Will my generated QR code ever expire or stop working?',
        a: 'No, never. Compixor creates 100% permanent static QR codes. Your destination URL, text, or credentials are encoded directly into the physical pixel arrangement of the matrix. Because there are no middleman redirect servers, cloud proxies, or tracking databases, your QR code remains scannable forever with unlimited lifetime scans.',
      },
      {
        q: 'Is adding a company logo completely free with no watermark?',
        a: 'Yes. You can upload any PNG, JPEG, or SVG logo or icon into the center of your QR code at zero cost. Compixor never adds watermarks, branding stamps, or promotional frames to your downloaded files.',
      },
      {
        q: 'What is the difference between static and dynamic QR codes?',
        a: 'Static QR codes burn your data directly into the matrix—they work permanently offline, have zero redirects, and never expire. Dynamic QR codes route scanners through a third-party redirect server; most commercial providers use dynamic codes to hold your barcodes hostage after a 14-day trial, demanding $15 to $35/month. Compixor generates true static codes that you own forever.',
      },
      {
        q: 'How does Reed-Solomon error correction allow a logo in the center?',
        a: 'QR code specifications incorporate Reed-Solomon algebraic error correction algorithms. When you upload a logo, Compixor automatically sets error correction to Level H (High), which provides 30% mathematical data redundancy. This allows up to 30% of the center matrix to be obscured by your logo while optical phone cameras reconstruct 100% of the data flawlessly.',
      },
      {
        q: 'Can I create a QR code for guest Wi-Fi connection without revealing the password?',
        a: 'Yes. Select the Wi-Fi tab, type your network SSID and password, and choose your encryption type (WPA/WPA2/WPA3). Guests scan the code with their smartphone camera to join your Wi-Fi instantly without typing or viewing complex passwords. All encoding happens in your browser RAM, so your Wi-Fi password is never sent to our servers.',
      },
      {
        q: 'How do I generate a direct WhatsApp chat QR code with a pre-filled message?',
        a: 'Select the WhatsApp tab, enter your phone number with your country code (e.g. +92 for Pakistan), and type an optional pre-filled greeting (e.g. "Hi, I\'d like to place an order"). When a customer scans your code, WhatsApp opens directly into a 1-on-1 chat with your number and pre-populates your text.',
      },
      {
        q: 'What is the advantage of downloading vector SVG instead of PNG?',
        a: 'Vector SVG is composed of mathematical paths rather than fixed pixels. This means an SVG QR code can be scaled infinitely—from a 1-inch business card to a 50-foot highway billboard—without losing crispness or becoming pixelated. PNG is ideal for web, digital menus, and email signatures, while SVG is required for professional offset print shops.',
      },
      {
        q: 'What is the minimum recommended print size for a scannable QR code?',
        a: 'For close-range handheld items like business cards, product tags, or table tents, the minimum recommended size is 2 × 2 cm (0.8 × 0.8 inches). For posters, banners, and billboards, follow the 10:1 distance rule: the QR code width should be at least one-tenth of the expected scanning distance (e.g., 20 cm wide for a 2-meter viewing distance).',
      },
      {
        q: 'Are my website links, passwords, or contact cards saved on Compixor\'s servers?',
        a: 'No. Compixor executes 100% client-side in your web browser using HTML5 Canvas and local JavaScript. Your links, Wi-Fi credentials, and vCard personal contacts are never transmitted over the internet, logged into databases, or tracked by analytics cookies. You can even disconnect from the internet after the page loads and generate codes offline.',
      },
      {
        q: 'Can I customize colors, dot styles, and corner eye shapes?',
        a: 'Yes. Compixor provides deep aesthetic customization. You can choose custom foreground colors matching your brand hex code, change background colors, select rounded or smooth module dots, and style outer and inner corner eye markers while ensuring high optical scanning contrast.',
      },
      {
        q: 'How does Compixor compare to QRCode Monkey, Canva, or Bitly QR generators?',
        a: 'Unlike Bitly and QR Code Generator which lock dynamic codes behind expensive recurring subscriptions, Compixor\'s static codes never expire. Unlike Canva, which requires an account signup and charges $12.99/month for Canva Pro to export vector SVG, Compixor provides instant, free vector SVG and 4K PNG downloads with zero login friction.',
      },
      {
        q: 'Does Compixor support digital contactless payment QR codes (like Raast, UPI, or PayPal)?',
        a: 'Yes. You can encode digital payment URLs or standard payment deep links (such as Pakistan Raast P2P/P2M payment links, Indian UPI payment URIs, PayPal.me links, or crypto addresses) so customers can scan and initiate instant contactless payments at store checkouts.',
      },
    ],
    features: [
      {
        title: 'Permanent Static Encoding',
        description: 'Encoded directly into geometric modules with zero middleman redirects, zero expiration dates, and unlimited lifetime scans.',
      },
      {
        title: 'Logo Embedding with Level H (30%) Error Correction',
        description: 'Upload PNG or SVG company logos with mathematical 30% redundancy so cameras scan reliably under all conditions.',
      },
      {
        title: 'Vector SVG & 4K PNG Downloads',
        description: 'Download infinitely scalable vector SVG for print banners and billboards or high-density PNG for digital screens.',
      },
    ],
    relatedToolSlugs: ['full-dp-maker', 'passport-photo', 'pdf-compressor'],
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any (Web Browser)',
    featureList: [
      'Permanent static QR codes with zero expiration and unlimited scans',
      'Central logo embedding with Reed-Solomon Level H (30%) error correction',
      'Lossless vector SVG and 4K PNG print exports',
      'Presets for URLs, Wi-Fi networks, WhatsApp direct chat, and vCards',
      'Custom brand color swatches, dot modules, and corner eye styles',
      '100% in-browser client-side privacy with zero server logging',
      'Free forever with no signup, no subscriptions, and no watermarks',
    ],
  },
  
  'pdf-to-word': {
    slug: 'pdf-to-word',
    name: 'PDF to Word Converter',
    icon: FileText,
    title: 'Convert PDF to Word Online Free - Editable DOCX',
    description:
      'Convert PDF to Word online free with no signup. Turn digital or scanned PDFs into editable DOCX with OCR for English, Urdu and Arabic in RAM.',
    canonicalUrl: `${BASE_URL}/tools/pdf-to-word`,
    primaryKeyword: 'convert pdf to word online free',
    searchIntent:
      'Users looking to convert digital or scanned PDF files into editable Microsoft Word documents (.docx) without entering email addresses or paying subscriptions.',
    secondaryKeywords: [
      'pdf to word',
      'convert pdf to word online free',
      'pdf to docx converter',
      'pdf to word no ocr',
      'ocr pdf to word',
      'scanned pdf to word converter',
      'free pdf to word converter without email',
      'client side pdf to word',
      'pdf to editable docx online',
      'convert pdf to word without losing formatting',
    ],
    longTailKeywords: [
      'convert pdf to word online free',
      'pdf to word converter without email',
      'pdf to editable docx online',
      'convert pdf to word without losing formatting',
      'scanned pdf to word ocr free',
      'client side pdf to word converter',
      'pdf to word converter no upload',
      'pdf table to word converter online',
      'urdu pdf to word converter online',
      'free pdf to docx converter no signup',
    ],
    keywords: [
      'convert pdf to word online free',
      'pdf to word',
      'pdf to docx',
      'pdf to word converter free',
      'scanned pdf to word ocr',
      'pdf to editable docx',
      'pdf to word without email',
      'pdf to word converter no upload',
    ],
    h1: 'Convert PDF to Word Online Free',
    introParagraph:
      'Convert PDF to Word online free with no email address or account required. Compixor AI turns digital and scanned PDFs into clean, fully editable Microsoft Word (.docx) files. A single OCR engine — Tesseract with an AI cleanup pass — reads text, columns and tables from ordinary PDFs as well as scans, including English, Urdu and Arabic documents. Files are processed on our own secure server, never stored, and the editable Word file is handed straight back to your browser.',
    howToSteps: [
      {
        name: 'Drop Your PDF Document',
        text: 'Select or drag and drop your PDF file into the secure drop zone.',
      },
      {
        name: 'Click Convert',
        text: 'No modes to choose — the engine detects the layout, text and tables of every page automatically.',
      },
      {
        name: 'OCR Text Recognition',
        text: 'Compixor renders each page, recognises the characters and rebuilds headings, columns and tables.',
      },
      {
        name: 'Download Editable DOCX',
        text: 'Save your standard ISO/IEC 29500 OpenXML Word document immediately with zero wait time.',
      },
    ],
    faqs: [
      {
        q: 'How can I convert PDF to Word online free without an account?',
        a: 'Drop the PDF and click convert — no email, no signup, no watermark. Your file is converted in our server memory and discarded right after; nothing is kept on our side.',
      },
      {
        q: 'Do I have to choose between OCR and no-OCR modes?',
        a: 'No. One engine inspects every page, recognises the characters with OCR and then rebuilds the layout, so digital and scanned PDFs follow the same single click.',
      },
      {
        q: 'Does this converter preserve formatting, tables, and headings?',
        a: 'Yes. Our layout engine calculates bounding boxes, font weights, and spacing to reconstruct standard Microsoft Word paragraphs, headings, and table structures cleanly in the exported .docx.',
      },
      {
        q: 'Can I convert Urdu, Arabic, or foreign language PDFs to Word?',
        a: 'Yes. Our OCR engine supports multi-language recognition including Urdu, Arabic, French, German, Spanish, and English.',
      },
      {
        q: 'Do I need to enter an email address or register an account?',
        a: 'No email or registration is ever requested. Compixor is completely free with no usage limits, no credit cards, and no watermarks on your generated Word files.',
      },
    ],
    features: [
      {
        title: 'Single-Pass OCR Engine',
        description: 'One click handles selectable-text PDFs and image-based scans with the same recognition pipeline.',
      },
      {
        title: 'Standard DOCX Output',
        description: 'Exports ISO/IEC 29500 compliant Word documents fully compatible with Microsoft Word and Google Docs.',
      },
      {
        title: 'No Storage On Our Side',
        description: 'Files are converted in memory and dropped immediately — no account, no file history.',
      },
    ],
    relatedToolSlugs: ['img-to-word', 'word-compressor', 'pdf-compressor'],
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any (Web Browser)',
    featureList: [
      'Convert PDF to editable DOCX online',
      'Automatic handling of digital and scanned PDFs',
      'Multi-language OCR support including Urdu and Arabic',
      'No account and no stored files',
      'Standard ISO/IEC 29500 OpenXML output',
    ],
  },

  'img-to-word': {
    slug: 'img-to-word',
    name: 'Image to Word Converter',
    icon: ScanText,
    title: 'Image to Word Converter Online Free',
    description:
      'Convert JPG, PNG, or WEBP images to editable Word DOCX free online. Private in-browser OCR for 10+ languages with instant download.',
    canonicalUrl: `${BASE_URL}/tools/img-to-word`,
    primaryKeyword: 'image to word converter online free',
    searchIntent:
      'Users who have scanned documents, screenshots, or photos of text and need to convert them into editable Microsoft Word documents without uploading to external servers.',
    secondaryKeywords: [
      'image to word converter online free',
      'jpg to word converter',
      'png to word converter',
      'image to docx',
      'photo to word converter',
      'ocr image to word',
      'convert image to word online free',
      'scan to word converter',
      'screenshot to word',
      'image text to word',
      'free ocr to word',
    ],
    longTailKeywords: [
      'convert jpg image to word document free',
      'png to docx converter online no upload',
      'ocr image to editable word document',
      'convert photo to word online free',
      'jpg to word converter no signup',
      'scan to word free browser tool',
      'image to word converter without watermark',
      'convert screenshot to word document',
      'arabic ocr to word online free',
      'tesseract ocr image to docx',
    ],
    keywords: [
      'image to word converter online free',
      'image to word converter',
      'jpg to word converter',
      'png to word converter',
      'ocr image to word',
      'convert image to word online free',
      'photo to docx converter',
      'scan to word online',
      'image to docx no upload',
      'tesseract ocr online',
      'screenshot to word converter',
    ],
    h1: 'Image to Word Converter Online Free',
    introParagraph:
      'Compixor\'s free Image to Word Converter transforms JPG, PNG, WEBP, BMP, and GIF images into fully editable Microsoft Word (.docx) documents. Powered by high-accuracy neural OCR, our image to word converter recognises printed text, detects headings and lists, and produces clean, structured DOCX files with zero sign-up. Files are processed securely over HTTPS and deleted immediately after conversion.',
    howToSteps: [
      {
        name: 'Upload Your Image',
        text: 'Drag and drop a JPG, PNG, WEBP, BMP, GIF, or TIFF file into the secure drop zone, or click Browse to select up to 10 images.',
      },
      {
        name: 'Choose OCR Language',
        text: 'Select the language of the text in your image from the language dropdown. Supports English, Arabic, French, German, Spanish, Portuguese, Russian, Chinese, and Japanese.',
      },
      {
        name: 'Run Neural OCR',
        text: 'Click Convert to Word. High-accuracy neural OCR processes the image securely and deletes file buffers immediately after conversion.',
      },
      {
        name: 'Download Editable DOCX',
        text: 'Download your structured Word (.docx) document instantly. Headings, bullet lists, and paragraphs are preserved and ready to edit in Microsoft Word or Google Docs.',
      },
    ],
    faqs: [
      {
        q: 'How does Compixor handle the privacy of converted images?',
        a: 'Files are processed securely over encrypted HTTPS and deleted immediately after conversion. We do not store your files or log their contents. For Urdu and Arabic OCR, image portions may be processed by Google Gemini AI.',
      },
      {
        q: 'What image formats can I convert to Word?',
        a: 'You can convert JPG, JPEG, PNG, WEBP, BMP, GIF, and TIFF images to Word (.docx). Up to 10 images can be converted at once into a single merged Word document.',
      },
      {
        q: 'Can I convert Arabic, Urdu, or other non-English images to Word?',
        a: 'Yes. Compixor supports OCR recognition in English, Arabic, French, German, Spanish, Portuguese, Italian, Russian, Simplified Chinese, and Japanese. Select the matching language before converting.',
      },
      {
        q: 'Does the Word output preserve headings and bullet lists?',
        a: 'Yes. The conversion engine analyses line height, capitalisation, and list markers to reconstruct standard Microsoft Word paragraph styles — including Heading 2, bullet lists, and numbered lists — in the exported .docx file.',
      },
      {
        q: 'Is there a file size or page limit?',
        a: 'Each image can be up to 25 MB, and you can process up to 10 images per batch. There are no artificial usage limits — Compixor is completely free with zero paywalls.',
      },
    ],
    features: [
      {
        title: 'Universal Neural OCR Engine',
        description: 'High-accuracy optical character recognition extracts text, headings, and tables with immediate server buffer deletion.',
      },
      {
        title: 'Structured Word Output',
        description: 'Headings, bullets, numbered lists, and paragraphs are detected and formatted as native Word styles in the exported .docx.',
      },
      {
        title: '10+ Language OCR Support',
        description: 'Recognise and convert English, Arabic, French, German, Spanish, Russian, Chinese, Japanese, and more.',
      },
      {
        title: 'Batch Multi-Image Conversion',
        description: 'Convert up to 10 images simultaneously into a single merged Word document — ideal for multi-page scanned contracts.',
      },
    ],
    relatedToolSlugs: ['pdf-to-word', 'word-compressor', 'full-dp-maker'],
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any (Web Browser)',
    featureList: [
      'Convert JPG PNG WEBP BMP TIFF to editable Word DOCX',
      'High-accuracy neural OCR engine',
      'Multi-language OCR: English Arabic French German Spanish Russian Chinese Japanese',
      'Batch convert up to 10 images into one document',
      'Secure HTTPS processing with immediate file deletion',
      'Heading and list detection for structured output',
      'Free with no signup, no watermarks, no usage limits',
    ],
  },
};

/**
 * Generates standard Next.js Metadata for any tool page
 */
export function getToolMetadata(slug: ToolSlug): Metadata {
  const tool = seoConfig[slug];
  if (!tool) {
    throw new Error(`SEO config not found for slug: ${slug}`);
  }

  const ogImageUrl =
    slug === 'full-dp-maker'
      ? `${BASE_URL}/blog/whatsapp-full-dp-maker-thumbnail.webp`
      : OG_IMAGE_URL;

  const ogTitle = tool.title.endsWith('| Compixor')
    ? tool.title
    : `${tool.title} | Compixor`;

  return {
    title: tool.title.endsWith('| Compixor') ? { absolute: tool.title } : tool.title,
    description: tool.description,
    alternates: {
      canonical: tool.canonicalUrl,
    },
    openGraph: {
      title: ogTitle,
      description: tool.description,
      url: tool.canonicalUrl,
      type: 'website',
      siteName: 'Compixor AI',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${tool.name} — Compixor AI`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.title,
      description: tool.description,
      images: [ogImageUrl],
    },
  };
}

/**
 * Returns structured JSON-LD schemas for any tool page:
 * - WebApplication (UtilitiesApplication, Any (Web Browser), offers $0, browserRequirements, author/publisher Organization "Compixor AI")
 * - FAQPage (strictly matching visible FAQs)
 * - HowTo (matching visible steps)
 * - BreadcrumbList (Home > Tools > [Tool Name])
 */
export function getToolSchemas(slug: ToolSlug): Record<string, any>[] {
  const tool = seoConfig[slug];
  if (!tool) return [];

  const toolImage =
    slug === 'full-dp-maker'
      ? `${BASE_URL}/blog/whatsapp-full-dp-maker-thumbnail.webp`
      : OG_IMAGE_URL;

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': ['SoftwareApplication', 'WebApplication'],
    name: tool.name,
    url: tool.canonicalUrl,
    description: tool.description,
    image: toolImage,
    applicationCategory: tool.applicationCategory || 'UtilitiesApplication',
    operatingSystem: tool.operatingSystem || 'Any (Web Browser)',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: tool.featureList,
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Compixor AI',
      url: BASE_URL,
      logo: `${BASE_URL}/brand/logo-512.png`,
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: tool.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to use ${tool.name} Online`,
    description: `Step-by-step instructions to use ${tool.name} online for free with zero uploads.`,
    totalTime: 'PT1M',
    step: tool.howToSteps.map((step, idx) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      name: step.name,
      text: step.text,
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tools',
        item: `${BASE_URL}/#tools`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: tool.name,
        item: tool.canonicalUrl,
      },
    ],
  };

  return [webAppSchema, faqSchema, howToSchema, breadcrumbSchema];
}

/**
 * Returns Homepage JSON-LD schemas covering all 10 recommended properties across 7 schema blocks:
 * - Organization schema
 * - Person schema
 * - WebSite schema
 * - WebPage schema
 * - BreadcrumbList schema
 * - ItemList schema
 * - FAQPage schema
 */
export function getHomepageSchemas(): Record<string, any>[] {
  const toolKeys = Object.keys(seoConfig) as ToolSlug[];

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: 'Compixor AI',
    url: BASE_URL,
    image: OG_IMAGE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/brand/logo-512.png`,
      width: 512,
      height: 512,
    },
    email: 'support@compixor-ai.cloud',
    sameAs: [
      'https://github.com/compixor',
      'https://www.linkedin.com/company/compixor-ai',
      'https://github.com/Compixor-Ai-creator',
    ],
    founder: {
      '@id': `${BASE_URL}/#author`,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@compixor-ai.cloud',
      url: `${BASE_URL}/contact`,
      availableLanguage: ['en', 'English'],
    },
    description:
      'Free, privacy-first document and media toolkit with zero permanent storage developed by Haroon Ali.',
  };

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${BASE_URL}/#author`,
    name: AUTHOR_NAME,
    jobTitle: 'Founder & Lead Developer',
    description: 'Founder and lead engineer of Compixor AI, building browser-native client-side tools.',
    worksFor: { '@id': `${BASE_URL}/#organization` },
    url: `${BASE_URL}/about`,
    image: `${BASE_URL}/brand/logo-512.png`,
    sameAs: [
      'https://www.linkedin.com/in/haroon-ali',
      'https://github.com/haroon-ali',
    ],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    name: 'Compixor - Free Online PDF, Word & Photo Tools',
    alternateName: ['Compixor', 'Compixor AI', 'Compixor.Ai'],
    url: BASE_URL,
    description: homepageSeoData.description,
    publisher: { '@id': `${BASE_URL}/#organization` },
    inLanguage: 'en',
    image: OG_IMAGE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const webpageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${BASE_URL}/#webpage`,
    url: BASE_URL,
    mainEntityOfPage: BASE_URL,
    name: 'Free Online PDF Tools - Private & Fast | Compixor',
    description: homepageSeoData.description,
    image: OG_IMAGE_URL,
    isPartOf: { '@id': `${BASE_URL}/#website` },
    author: { '@id': `${BASE_URL}/#author` },
    publisher: { '@id': `${BASE_URL}/#organization` },
    datePublished: '2025-01-15T00:00:00Z',
    dateModified: '2025-10-31T13:43:48Z',
    inLanguage: 'en',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#hero-summary', '#what-is-compixor', '#faq-section'],
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${BASE_URL}/#breadcrumb`,
    name: 'Compixor Navigation Breadcrumbs',
    description: 'Breadcrumbs navigation hierarchy for Compixor AI tools',
    numberOfItems: 2,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'All PDF, Word and Photo Tools',
        item: `${BASE_URL}/#tools`,
      },
    ],
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${BASE_URL}/#tools-list`,
    name: 'Compixor AI Tools Suite',
    description: 'Complete collection of free, in-browser privacy-first document and media tools.',
    url: `${BASE_URL}/#tools`,
    mainEntityOfPage: `${BASE_URL}/#tools`,
    numberOfItems: toolKeys.length,
    itemListElement: toolKeys.map((slug, idx) => {
      const tool = seoConfig[slug];
      return {
        '@type': 'ListItem',
        position: idx + 1,
        name: tool.name,
        url: tool.canonicalUrl,
        description: tool.description,
        image: tool.canonicalUrl ? `${BASE_URL}/brand/logo-512.png` : OG_IMAGE_URL,
      };
    }),
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${BASE_URL}/#faq`,
    name: 'Compixor Frequently Asked Questions',
    description: 'Frequently asked questions about Compixor free browser PDF, Word and photo tools',
    url: `${BASE_URL}/#faq-section`,
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Compixor and how does it work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Compixor is a free web toolkit that lets you fix, merge, shrink, and change PDF, Word, and photo files right in your browser. All tools run on your own phone or PC instead of a cloud server. Your files stay fast, safe, and free to use at all times.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are my PDF and Word files safe from data leaks?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, your files stay safe because they never leave your own device at any point. Compixor runs all code inside your web browser tab with zero server uploads and zero cloud storage. No person, bot, or third party can ever see, read, or copy your private work.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which PDF, Word and photo tools are free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Every single tool on Compixor is free to use with no paywalls, no daily caps, and no sign-up forms. You can shrink large PDF files, turn PDF pages into Word docs, clean up photos, and make custom QR codes as many times as you want each day.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I use these PDF and photo tools on my phone?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, you can run every tool on any phone, tablet, laptop, or desktop PC that has a modern web browser. You do not need to install any app or plug-in to start working. Just open the site, pick a tool, and save your finished file in seconds.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why do browser tools run faster than cloud sites?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Browser tools refers to web apps that use your own device speed instead of slow web uploads. With old cloud sites, you wait to send large files up to a server and wait again to get them back. Compixor skips the upload step so your files finish right away.',
        },
      },
      {
        '@type': 'Question',
        name: 'Will Compixor add watermarks to my saved PDF files?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No, Compixor never puts ugly stamps, logos, or watermarks on your saved PDF pages, Word docs, or photos. The file you save to your device stays clean and ready for work, school, or print. You get full quality output for free without paying for a pro plan.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I edit my PDF and photo files without web access?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, once the page loads in your web browser, the tools can run right on your device even if your web link drops. Because no cloud server does the work, you can merge, split, or shrink your files smoothly on a plane, train, or slow mobile link.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need an account or email to save my files?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No, you never need to make an account, type an email address, or share a password to use Compixor. We do not track who you are or ask for credit card details. You just open the tool, fix your file in the browser, and save it right away.',
        },
      },
    ],
  };

  return [
    organizationSchema,
    personSchema,
    websiteSchema,
    webpageSchema,
    breadcrumbSchema,
    itemListSchema,
    faqSchema,
  ];
}
