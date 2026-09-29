import type { Metadata } from 'next';

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
  | 'qr-generator';

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
  title: string; // Max 60 chars, primary keyword near start
  description: string; // Exactly 150-160 chars
  canonicalUrl: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  keywords: string[]; // Top 8-10 only for meta tag
  h1: string;
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

export const BASE_URL = 'https://compixor-ai.vercel.app';
export const AUTHOR_NAME = 'Haroon Ali';

export const homepageSeoData: HomepageSeoData = {
  title: 'Free Online PDF Tools No Upload - Privacy First | Compixor',
  description:
    'Free online PDF tools no upload needed. Client side PDF, Word, photo, and QR toolkit created by Haroon Ali. 100% private, free, and works in your browser.',
  canonicalUrl: `${BASE_URL}/`,
  primaryKeyword: 'free online pdf tools no upload',
  secondaryKeywords: [
    'compixor ai',
    'client side pdf tools',
    'privacy first document tools',
    'free pdf tools online',
    'pdf and photo tools in browser',
    'haroon ali',
  ],
  keywords: [
    'free online pdf tools no upload',
    'compixor ai',
    'client side pdf tools',
    'privacy first document tools',
    'free pdf tools online',
    'pdf and photo tools in browser',
    'haroon ali',
    'in-browser document converter',
  ],
  h1: 'Free Online PDF Tools — No Upload',
  introParagraph:
    'Welcome to Compixor AI, your trusted suite of free online pdf tools no upload needed, founded and developed by Haroon Ali. Designed for professionals, students, lawyers, and creators worldwide, Compixor offers client side pdf tools and privacy first document tools that process files 100% locally in your web browser. Compress PDFs, merge and split pages, add or remove watermarks, password protect documents, convert biometric passport photos, and generate vector QR codes. Free, no signup, no upload, works in your browser with zero server data storage and zero cloud leakage.',
  faqs: [
    {
      q: 'How does Compixor AI process files without uploading them?',
      a: 'Compixor AI uses client-side WebAssembly, HTML5 Canvas, and Web Workers. Computation executes directly inside your browser memory on your own device, so no file is ever uploaded to a remote server.',
    },
    {
      q: 'Are all Compixor AI tools completely free with no signup?',
      a: 'Yes. Every tool is 100% free with no account registration, no credit cards, and no usage limits. You can process unlimited files at zero cost.',
    },
    {
      q: 'Can I safely use Compixor AI for confidential corporate documents?',
      a: 'Absolutely. Because your files never traverse the network or sit on third-party cloud infrastructure, Compixor is fully compliant with strict privacy regulations including GDPR and enterprise NDA requirements.',
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
    title: 'Compress PDF Online Free - Reduce File Size | Compixor',
    description:
      'Compress PDF online free without uploading files. Reduce PDF size to 100kb, 200kb, or 1mb with no quality loss. Fast, private, works in your browser today.',
    canonicalUrl: `${BASE_URL}/tools/pdf-compressor`,
    primaryKeyword: 'compress pdf online free',
    secondaryKeywords: [
      'compress pdf',
      'compress pdf document',
      'compress pdf to 100kb',
      'compress pdf to 200kb',
      'compress pdf to 500kb',
      'compress pdf to 1mb',
      'reduce pdf size online',
      'pdf size reducer without losing quality',
      'compress pdf without uploading',
      'compress pdf for whatsapp',
      'compress pdf for email',
      'pdf compressor no signup',
    ],
    keywords: [
      'compress pdf online free',
      'compress pdf',
      'compress pdf document',
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
        a: 'Compixor AI uses client-side WebAssembly to compress PDF files directly inside your browser memory. Your documents never leave your computer or travel over the internet, ensuring 100% data privacy.',
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
    relatedToolSlugs: ['pdf-organizer', 'protect-pdf', 'word-compressor'],
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
    title: 'Merge PDF Online Free - Combine & Split Pages | Compixor',
    description:
      'Merge PDF online free without upload. Combine PDF files into one, split pages, or extract sheets with no watermark. Free, no signup, works in your browser.',
    canonicalUrl: `${BASE_URL}/tools/pdf-organizer`,
    primaryKeyword: 'merge pdf online free',
    secondaryKeywords: [
      'merge pdfs',
      'merge pdf documents',
      'combine pdf files into one',
      'join pdf files free',
      'split pdf pages online',
      'extract pages from pdf',
      'pdf merger no watermark',
      'merge pdf without upload',
    ],
    keywords: [
      'merge pdf online free',
      'merge pdfs',
      'merge pdf documents',
      'combine pdf files into one',
      'join pdf files free',
      'split pdf pages online',
      'extract pages from pdf',
      'pdf merger no watermark',
      'merge pdf without upload',
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
        title: 'Zero Watermark Guarantee',
        description: 'Export pristine documents containing only your original materials with no added stamps or ads.',
      },
      {
        title: 'Client-Side Assembly',
        description: 'All merging and splitting takes place in your browser buffer with zero data transferred online.',
      },
    ],
    relatedToolSlugs: ['pdf-compressor', 'add-watermark', 'protect-pdf'],
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
    title: 'Add Watermark to PDF Online Free - Text & Logo | Compixor',
    description:
      'Add watermark to PDF online free without upload. Stamp custom text or transparent logo images with full privacy. Free, no signup, works in your browser now.',
    canonicalUrl: `${BASE_URL}/tools/add-watermark`,
    primaryKeyword: 'add watermark to pdf online free',
    secondaryKeywords: [
      'pdf watermark maker',
      'add text watermark to pdf',
      'add logo to pdf',
      'confidential watermark pdf',
      'watermark pdf without software',
      'add watermark to pdf without upload',
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
    title: 'Remove Watermark from PDF Free - Erase Stamps | Compixor',
    description:
      'Remove watermark from PDF free without upload or Adobe Acrobat. Erase stamps, logos, and text overlays in seconds. Free, no signup, works in your browser.',
    canonicalUrl: `${BASE_URL}/tools/remove-watermark`,
    primaryKeyword: 'remove watermark from pdf free',
    secondaryKeywords: [
      'pdf watermark remover online',
      'how to remove watermark from pdf',
      'delete watermark from pdf without software',
      'remove watermark from pdf without adobe',
      'remove pdf watermark no upload',
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
        description: 'Process private legal briefs and academic papers with 100% local privacy guarantee.',
      },
    ],
    relatedToolSlugs: ['add-watermark', 'pdf-compressor', 'unlock-pdf'],
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
    title: 'Password Protect PDF Online Free - AES-256 | Compixor',
    description:
      'Password protect PDF online free with strong AES-256 encryption. Lock PDF files, restrict editing and printing safely. Free, no signup, no upload required.',
    canonicalUrl: `${BASE_URL}/tools/protect-pdf`,
    primaryKeyword: 'password protect pdf online free',
    secondaryKeywords: [
      'lock pdf with password',
      'encrypt pdf online',
      'add password to pdf',
      'restrict pdf editing and printing',
      'protect pdf without upload',
      'AES-256 pdf encryption',
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
      'Easily password protect PDF online free using military-grade security standards. Compixor AI allows you to lock PDF with password protection and encrypt PDF online directly in your browser. Whether you need to add password to PDF for personal bank statements, client NDAs, or tax forms, our engine applies robust AES-256 PDF encryption. You can also restrict PDF editing and printing permissions to prevent unauthorized alterations or copying. Protect PDF without upload: free, no signup, no upload, works in your browser with zero data transmission. Your confidential passwords and documents remain exclusively on your device, guaranteeing total compliance.',
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
        title: 'AES-256 Military Encryption',
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
    relatedToolSlugs: ['unlock-pdf', 'pdf-compressor', 'add-watermark'],
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
    title: 'Unlock PDF Online Free - Remove Password | Compixor',
    description:
      'Unlock PDF online free without uploading files. Remove PDF password security and printing restrictions instantly. 100% private, works in your browser today.',
    canonicalUrl: `${BASE_URL}/tools/unlock-pdf`,
    primaryKeyword: 'unlock pdf online free',
    secondaryKeywords: [
      'remove password from pdf',
      'pdf password remover',
      'unlock pdf without password',
      'remove pdf restrictions',
      'unlock pdf no upload',
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
    title: 'Compress Word Document Online Free - Reduce DOCX | Compixor',
    description:
      'Compress Word document online free without losing quality. Reduce DOCX file size with embedded images for email attachments. Free, no upload, works in browser.',
    canonicalUrl: `${BASE_URL}/tools/word-compressor`,
    primaryKeyword: 'compress word document online free',
    secondaryKeywords: [
      'reduce docx file size',
      'compress word file with images',
      'word file size reducer',
      'compress doc file for email',
      'compress word document without losing quality',
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
    relatedToolSlugs: ['pdf-compressor', 'pdf-organizer', 'qr-generator'],
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any (Web Browser)',
    featureList: [
      'Reduce DOCX file size up to 90%',
      'Optimize embedded images without formatting loss',
      'Format and table preservation guarantee',
      'Ready for Outlook/Gmail 25MB email caps',
      '100% in-browser client-side compression',
    ],
  },

  'passport-photo': {
    slug: 'passport-photo',
    name: 'Passport Photo Maker',
    title: 'Passport Size Photo Maker Online Free | Compixor',
    description:
      'Passport size photo maker online free. Create compliant 35x45 mm, 2x2 inch and NADRA Pakistan CNIC photos with white background on 4x6 sheet in your browser.',
    canonicalUrl: `${BASE_URL}/tools/passport-photo`,
    primaryKeyword: 'passport size photo maker online free',
    secondaryKeywords: [
      'passport photo maker pakistan',
      'nadra passport photo size',
      'cnic photo maker online',
      'visa photo maker online',
      'biometric passport photo online',
      'passport photo white background',
      'passport photo 4x6 print sheet',
      '35x45 mm photo maker',
      '2x2 inch passport photo online',
    ],
    keywords: [
      'passport size photo maker online free',
      'passport photo maker pakistan',
      'nadra passport photo size',
      'cnic photo maker online',
      'visa photo maker online',
      'biometric passport photo online',
      'passport photo white background',
      'passport photo 4x6 print sheet',
      '35x45 mm photo maker',
      '2x2 inch passport photo online',
    ],
    h1: 'Passport Size Photo Maker Online Free',
    introParagraph:
      'Create official biometric passport photo online with our passport size photo maker online free. Compixor AI converts ordinary smartphone selfies into compliant government identification photos in seconds. Whether you need a passport photo maker Pakistan for NADRA passport photo size and CNIC photo maker online, a 2x2 inch passport photo online for US visas, or a standard 35x45 mm photo maker for UK, Schengen, and Canadian applications, our local AI handles it all. Generate a crisp passport photo white background and a 300 DPI passport photo 4x6 print sheet: free, no signup, no upload, works in your browser with zero studio wait times.',
    howToSteps: [
      {
        name: 'Upload Your Portrait',
        text: 'Take or select a front-facing portrait with neutral lighting from your phone or PC.',
      },
      {
        name: 'Select Country Preset',
        text: 'Choose Pakistan NADRA/CNIC, US Visa 2x2", UK 35x45mm, Schengen, or custom dimensions.',
      },
      {
        name: 'AI Background & Face Alignment',
        text: 'Use in-browser AI to remove background, set pure white/blue color, and align face guidelines.',
      },
      {
        name: 'Download Printable 4x6 Sheet',
        text: 'Export high-res individual photos or a multi-photo 4x6 printable grid for pennies at any local printer.',
      },
    ],
    faqs: [
      {
        q: 'How does the passport size photo maker online free ensure compliance?',
        a: 'Compixor provides official dimension presets (e.g., 35x45 mm, 2x2 inch) and biometric face positioning guides that ensure your head and eye level match official embassy standards.',
      },
      {
        q: 'Is this suitable as a passport photo maker Pakistan for NADRA and CNIC?',
        a: 'Yes. We have dedicated presets for NADRA passport photo size (35x45 mm) and CNIC photo maker online with exact white or blue background requirements.',
      },
      {
        q: 'Can I make a biometric passport photo with white background from a selfie?',
        a: 'Yes. Our client-side AI automatically removes busy backgrounds and applies a clean white, off-white, or light blue backdrop without uploading your selfie to external servers.',
      },
      {
        q: 'What is the passport photo 4x6 print sheet?',
        a: 'It is a standard 4x6 inch photographic grid rendered at 300 DPI containing multiple identical passport photos with cut guidelines, ready to print cheaply at local photo labs.',
      },
      {
        q: 'Are my personal photos kept private?',
        a: 'Absolutely. Face detection and background matting execute 100% locally on your computer GPU/CPU. No photo is ever uploaded or saved on our servers.',
      },
    ],
    features: [
      {
        title: 'Local AI Background Removal',
        description: 'Removes busy home backgrounds and substitutes pure white, off-white, or embassy blue backdrops.',
      },
      {
        title: 'Official Embassy Sizing Presets',
        description: 'Preconfigured dimensions for US 2x2", Pakistan NADRA 35x45mm, UK, Schengen, Canada, and India.',
      },
      {
        title: '300 DPI 4x6 Printable Sheet',
        description: 'Generates a ready-to-print photographic sheet with crop marks for cheap retail printing.',
      },
    ],
    relatedToolSlugs: ['full-dp-maker', 'qr-generator', 'pdf-compressor'],
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any (Web Browser)',
    featureList: [
      'Official biometric passport and visa dimensions',
      'AI background removal with solid color backdrops',
      'Biometric head height and eye-line guidelines',
      '300 DPI 4x6 printable cut sheet export',
      '100% private in-browser portrait processing',
    ],
  },

  'full-dp-maker': {
    slug: 'full-dp-maker',
    name: 'Full DP Maker',
    title: 'WhatsApp DP Without Crop - Full Size Photo | Compixor',
    description:
      'WhatsApp DP without crop maker online. Post full size profile pictures for Instagram & WhatsApp with stylish blur backgrounds. Free, works in your browser.',
    canonicalUrl: `${BASE_URL}/tools/full-dp-maker`,
    primaryKeyword: 'whatsapp dp without crop',
    secondaryKeywords: [
      'full size dp maker',
      'full dp maker for whatsapp',
      'instagram full dp without cropping',
      'profile picture without crop',
      'dp maker online free',
      'whatsapp full photo dp',
    ],
    keywords: [
      'whatsapp dp without crop',
      'full size dp maker',
      'full dp maker for whatsapp',
      'instagram full dp without cropping',
      'profile picture without crop',
      'dp maker online free',
      'whatsapp full photo dp',
      'no crop profile picture',
    ],
    h1: 'WhatsApp DP Without Crop',
    introParagraph:
      'Easily set your WhatsApp DP without crop using Compixor AI. Our full size dp maker transforms vertical and horizontal photos into perfect 1:1 square profile pictures without ugly forced cropping. If you are looking for a full dp maker for whatsapp or instagram full dp without cropping, our tool adds aesthetic HD blurred backgrounds, stylish gradients, or solid borders to preserve your entire picture. Enjoy a fast profile picture without crop and dp maker online free: free, no signup, no upload, works in your browser with instant canvas rendering. Create stunning whatsapp full photo dp images ready for immediate upload to all social media apps.',
    howToSteps: [
      {
        name: 'Choose Your Photo',
        text: 'Select any vertical, horizontal, or portrait photo from your device.',
      },
      {
        name: 'Pick Canvas Background',
        text: 'Select Blurred Background, Aesthetic Gradient, Clean White, or Solid Color.',
      },
      {
        name: 'Adjust Zoom & Framing',
        text: 'Fine-tune the position, rotation, corner radius, or border shadow with interactive controls.',
      },
      {
        name: 'Export Full Resolution',
        text: 'Download your square 1:1 image instantly with zero loss in clarity.',
      },
    ],
    faqs: [
      {
        q: 'How can I set a WhatsApp DP without crop?',
        a: 'Social apps require 1:1 square avatars. Compixor places your original rectangular photo onto a 1:1 canvas with beautiful matching blurred borders, so no part of your face or background is cropped.',
      },
      {
        q: 'Can I use this for Instagram and other social profile pictures?',
        a: 'Yes. It works seamlessly as an Instagram full dp without cropping, as well as for Telegram, Facebook, LinkedIn, Discord, and TikTok avatars.',
      },
      {
        q: 'Will my image lose quality when resized?',
        a: 'No. Compixor exports at crisp 1080x1080 or original source resolution using high-quality bicubic canvas interpolation, preserving maximum image clarity.',
      },
      {
        q: 'Can I customize the background style behind my photo?',
        a: 'Yes. You can choose from mirror blur, gaussian soft blur, elegant dark/light gradients, rounded corners, or solid borders.',
      },
      {
        q: 'Does this DP maker upload my pictures to any server?',
        a: 'No. All canvas rendering happens locally in your browser memory. Your personal photos remain 100% private on your own device.',
      },
    ],
    features: [
      {
        title: 'HD Aesthetic Background Blur',
        description: 'Fills square canvas edges with matching blurred tones from your original photograph.',
      },
      {
        title: 'Multi-Platform Compatibility',
        description: 'Optimized 1:1 aspect ratio ready for WhatsApp, Instagram, Telegram, LinkedIn, and Discord.',
      },
      {
        title: 'Instant Canvas Export',
        description: 'High-speed local rendering in WebP, PNG, or high-quality JPEG with zero server waiting.',
      },
    ],
    relatedToolSlugs: ['passport-photo', 'qr-generator', 'add-watermark'],
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any (Web Browser)',
    featureList: [
      'No-crop 1:1 square canvas generator',
      'Realistic Gaussian and mirror background blur',
      'Aesthetic gradient and solid frame backdrops',
      'Rounded corner and drop shadow styling',
      '100% private client-side image processing',
    ],
  },

  'qr-generator': {
    slug: 'qr-generator',
    name: 'QR Code Generator',
    title: 'QR Code Generator Free No Signup - SVG & Logo | Compixor',
    description:
      'QR code generator free no signup required. Create custom color QR codes with logos for URLs, WiFi, and WhatsApp links in SVG or PNG. Works in your browser.',
    canonicalUrl: `${BASE_URL}/tools/qr-generator`,
    primaryKeyword: 'qr code generator free no signup',
    secondaryKeywords: [
      'qr code with logo',
      'create qr code for whatsapp link',
      'wifi qr code generator',
      'qr code generator for url',
      'qr code generator without expiry',
      'custom color qr code',
      'qr code generator svg png',
    ],
    keywords: [
      'qr code generator free no signup',
      'qr code with logo',
      'create qr code for whatsapp link',
      'wifi qr code generator',
      'qr code generator for url',
      'qr code generator without expiry',
      'custom color qr code',
      'qr code generator svg png',
    ],
    h1: 'QR Code Generator Free No Signup',
    introParagraph:
      'Design custom barcodes with our qr code generator free no signup required. Compixor AI enables creators, businesses, and restaurants to generate high-resolution QR codes that never expire. Create a custom color qr code with logo embedded in the center, configure a wifi qr code generator for instant network sharing, or create qr code for whatsapp link and vCard contacts. Our qr code generator for url exports clean vector SVG and PNG formats for print-ready marketing materials. As a true qr code generator without expiry: free, no signup, no upload, works in your browser with instantaneous real-time rendering and zero subscription lock-ins.',
    howToSteps: [
      {
        name: 'Select QR Type',
        text: 'Choose URL, WiFi network, WhatsApp message, Plain Text, or Email.',
      },
      {
        name: 'Input Destination Details',
        text: 'Enter your link or credentials into the input field for real-time matrix generation.',
      },
      {
        name: 'Customize Brand Styling',
        text: 'Pick foreground/background colors, dot patterns, corner styles, and upload your central logo.',
      },
      {
        name: 'Download Vector or PNG',
        text: 'Export sharp PNG for digital use or scalable vector SVG for print flyers and billboards.',
      },
    ],
    faqs: [
      {
        q: 'Is this QR code generator free with no signup and no expiry?',
        a: 'Yes. Compixor creates permanent, static QR codes that encode your data directly into the pixel matrix. They work indefinitely without subscriptions or expiration dates.',
      },
      {
        q: 'Can I add my business logo to the QR code?',
        a: 'Yes. You can upload any PNG, JPG, or SVG logo to sit centered inside the QR code, with automatic error correction adjustments to ensure reliable scanning.',
      },
      {
        q: 'How do I create a QR code for a WiFi network or WhatsApp link?',
        a: 'Select the WiFi or WhatsApp tab, enter your network name (SSID) and password or phone number, and Compixor formats the exact scanning protocol automatically.',
      },
      {
        q: 'What formats can I export my QR code in?',
        a: 'You can export in raster PNG (standard or 4K resolution) or scalable vector SVG for print materials, flyers, stickers, and billboards.',
      },
      {
        q: 'Are my QR codes tracked or stored on your servers?',
        a: 'No. Everything is rendered client-side on HTML5 Canvas. We do not track scan counts or store your links or WiFi passwords on any server.',
      },
    ],
    features: [
      {
        title: 'Permanent Static QR Codes',
        description: 'Encoded directly into the matrix with zero expiration dates or redirect middleman servers.',
      },
      {
        title: 'Scalable Vector SVG Export',
        description: 'Export infinite-resolution SVG files ideal for packaging, posters, business cards, and billboards.',
      },
      {
        title: 'Custom Brand Identity',
        description: 'Upload your company logo and adjust gradient dots, eye patterns, and custom palettes.',
      },
    ],
    relatedToolSlugs: ['pdf-compressor', 'passport-photo', 'full-dp-maker'],
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any (Web Browser)',
    featureList: [
      'Permanent static QR codes with zero expiration',
      'Central logo embedding with high error correction',
      'WiFi, URL, WhatsApp, vCard, and SMS presets',
      'Vector SVG and 4K PNG export formats',
      '100% private in-browser generation',
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

  return {
    title: {
      absolute: tool.title,
    },
    description: tool.description,
    keywords: tool.keywords,
    alternates: {
      canonical: tool.canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: tool.title,
      description: tool.description,
      url: tool.canonicalUrl,
      type: 'website',
      siteName: 'Compixor AI',
      images: [
        {
          url: '/images/og-banner.png',
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
      images: ['/images/og-banner.png'],
    },
  };
}

/**
 * Returns structured JSON-LD schemas for any tool page:
 * - WebApplication (UtilitiesApplication, Any (Web Browser), offers $0, browserRequirements, author/publisher Person "Haroon Ali")
 * - FAQPage (strictly matching visible FAQs)
 * - HowTo (matching visible steps)
 * - BreadcrumbList (Home > Tools > [Tool Name])
 */
export function getToolSchemas(slug: ToolSlug): Record<string, any>[] {
  const tool = seoConfig[slug];
  if (!tool) return [];

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    url: tool.canonicalUrl,
    description: tool.description,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any (Web Browser)',
    browserRequirements: 'Requires a modern web browser with HTML5 and WebAssembly support',
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
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: BASE_URL,
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
        item: `${BASE_URL}/`,
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
 * Returns Homepage JSON-LD schemas:
 * - WebSite schema
 * - Organization schema (Compixor AI, logo, founder Haroon Ali)
 * - ItemList schema listing all 10 tools
 */
export function getHomepageSchemas(): Record<string, any>[] {
  const toolKeys = Object.keys(seoConfig) as ToolSlug[];

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Compixor AI',
    alternateName: ['Compixor', 'Compixor AI', 'Compixor.Ai'],
    url: `${BASE_URL}/`,
    description: homepageSeoData.description,
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Compixor AI',
      url: BASE_URL,
      logo: `${BASE_URL}/icon.png`,
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Compixor AI',
    url: `${BASE_URL}/`,
    logo: `${BASE_URL}/icon.png`,
    founder: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      jobTitle: 'Founder & Lead Developer',
      url: BASE_URL,
    },
    description:
      'Free, privacy-first, 100% client-side toolkit with zero file uploads developed by Haroon Ali.',
    sameAs: ['https://compixor.ai', BASE_URL],
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Compixor AI Client-Side Tools',
    description: 'Complete collection of free, in-browser privacy-first document and media tools.',
    itemListElement: toolKeys.map((slug, idx) => {
      const tool = seoConfig[slug];
      return {
        '@type': 'ListItem',
        position: idx + 1,
        name: tool.name,
        url: tool.canonicalUrl,
        description: tool.description,
      };
    }),
  };

  return [websiteSchema, organizationSchema, itemListSchema];
}
