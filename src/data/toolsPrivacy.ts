export type ToolProcessingType = 'local' | 'server';

export interface ToolPrivacyConfig {
  slug: string;
  name: string;
  processingType: ToolProcessingType;
  badgeLabel: string;
  privacyClaim: string;
  detailDescription: string;
}

export const TOOLS_PRIVACY_CONFIG: Record<string, ToolPrivacyConfig> = {
  'pdf-compressor': {
    slug: 'pdf-compressor',
    name: 'PDF Compressor',
    processingType: 'local',
    badgeLabel: 'Zero Server Uploads',
    privacyClaim: '100% Client-Side In Browser RAM',
    detailDescription: 'Compression runs entirely inside your browser using WebAssembly. Files never leave your device.',
  },
  'pdf-organizer': {
    slug: 'pdf-organizer',
    name: 'PDF Merge & Split',
    processingType: 'local',
    badgeLabel: 'Zero Server Uploads',
    privacyClaim: '100% Client-Side In Browser RAM',
    detailDescription: 'Merging, splitting, and page reordering execute locally in device memory. No files are uploaded.',
  },
  'add-watermark': {
    slug: 'add-watermark',
    name: 'Add Watermark',
    processingType: 'local',
    badgeLabel: 'Zero Server Uploads',
    privacyClaim: '100% Client-Side In Browser RAM',
    detailDescription: 'Watermark stamping runs in your browser via HTML5 Canvas and client-side PDF libraries. Zero uploads.',
  },
  'remove-watermark': {
    slug: 'remove-watermark',
    name: 'Remove Watermark',
    processingType: 'local',
    badgeLabel: 'Zero Server Uploads',
    privacyClaim: '100% Client-Side In Browser RAM',
    detailDescription: 'Vector redaction and text stream filtering run directly on your device. Zero cloud uploads.',
  },
  'protect-pdf': {
    slug: 'protect-pdf',
    name: 'Protect PDF',
    processingType: 'local',
    badgeLabel: 'Zero Server Uploads',
    privacyClaim: '100% Client-Side In Browser RAM',
    detailDescription: 'AES-256 encryption executes in browser RAM. Passwords and documents are never sent across the internet.',
  },
  'unlock-pdf': {
    slug: 'unlock-pdf',
    name: 'Unlock PDF',
    processingType: 'local',
    badgeLabel: 'Zero Server Uploads',
    privacyClaim: '100% Client-Side In Browser RAM',
    detailDescription: 'Decryption algorithms run 100% locally in your browser session. Zero file uploads.',
  },
  'word-compressor': {
    slug: 'word-compressor',
    name: 'Word Compressor',
    processingType: 'local',
    badgeLabel: 'Zero Server Uploads',
    privacyClaim: '100% Client-Side In Browser RAM',
    detailDescription: 'DOCX archive re-packing and image downscaling run on-device via JSZip. Documents never touch a server.',
  },
  'full-dp-maker': {
    slug: 'full-dp-maker',
    name: 'Full DP Maker',
    processingType: 'local',
    badgeLabel: 'Zero Server Uploads',
    privacyClaim: '100% Client-Side In Browser RAM',
    detailDescription: 'Image expansion and ambient background blurring render via HTML5 Canvas in RAM. Zero cloud storage.',
  },
  'qr-generator': {
    slug: 'qr-generator',
    name: 'QR Code Generator',
    processingType: 'local',
    badgeLabel: 'Zero Server Uploads',
    privacyClaim: '100% Client-Side In Browser RAM',
    detailDescription: 'Barcodes, WiFi passwords, and vCard data are encoded locally into SVG/PNG. No data is transmitted.',
  },
  'passport-photo': {
    slug: 'passport-photo',
    name: 'Passport Photo Maker',
    processingType: 'server',
    badgeLabel: 'RAM-Only Server Processing',
    privacyClaim: 'Encrypted In-Memory Processing • Immediate Deletion',
    detailDescription: 'Photo layout and printing are local; optional AI background removal is sent over HTTPS, processed in memory, and immediately deleted with zero permanent storage.',
  },
  'pdf-to-word': {
    slug: 'pdf-to-word',
    name: 'PDF to Word Converter',
    processingType: 'server',
    badgeLabel: 'RAM-Only Server Processing',
    privacyClaim: 'Encrypted In-Memory Processing • Immediate Deletion',
    detailDescription: 'Documents are sent over secure HTTPS to our OCR engine, converted entirely in volatile memory, and immediately deleted without persistent storage.',
  },
  'img-to-word': {
    slug: 'img-to-word',
    name: 'Image to Word Converter',
    processingType: 'server',
    badgeLabel: 'RAM-Only Server Processing',
    privacyClaim: 'Encrypted In-Memory Processing • Immediate Deletion',
    detailDescription: 'Images are sent over encrypted HTTPS to our OCR engine, converted in memory, and immediately purged with no logs or storage.',
  },
};

export function getToolPrivacy(slug: string): ToolPrivacyConfig {
  return TOOLS_PRIVACY_CONFIG[slug] || {
    slug,
    name: slug,
    processingType: 'local',
    badgeLabel: 'Zero Server Uploads',
    privacyClaim: '100% Client-Side In Browser RAM',
    detailDescription: 'Processed safely in your browser session.',
  };
}
