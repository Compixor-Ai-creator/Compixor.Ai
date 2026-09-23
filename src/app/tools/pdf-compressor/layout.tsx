import type { Metadata } from 'next';
import { SoftwareAppJsonLd, BreadcrumbJsonLd, FaqJsonLd, HowToJsonLd } from '@/components/JsonLd';
import { pdfCompressorFaqs } from '@/data/faqs';

const TITLE = 'Free PDF Compressor Online - Reduce File Size Up to 75% | Compixor AI';
const DESCRIPTION =
  'Compress PDF files online free — 100% client-side, zero uploads, zero quality loss. Native vector optimization preserves sharp text & fonts. Reduce PDF size up to 75% instantly in your browser.';
const CANONICAL_URL = 'https://compixor-ai.vercel.app/tools/pdf-compressor';

export const metadata: Metadata = {
  title: {
    absolute: TITLE,
  },
  description: DESCRIPTION,
  keywords: [
    'pdf compressor',
    'compress pdf online free',
    'reduce pdf size online',
    'compress pdf without losing quality',
    'client side pdf compressor',
    'pdf compressor no upload',
    'shrink pdf in browser',
    'batch pdf compressor',
    'compress pdf to smaller size',
    'private pdf compressor',
  ],
  alternates: {
    canonical: CANONICAL_URL,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL_URL,
    type: 'website',
    images: [
      {
        url: '/images/og-banner.png',
        width: 1200,
        height: 630,
        alt: 'Free PDF Compressor Online - Compixor AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/images/og-banner.png'],
  },
};

const pdfCompressorHowToSteps = [
  {
    name: 'Upload PDF Document(s)',
    text: 'Drop or select up to 5 PDF files at once. All processing takes place locally in your browser memory.',
  },
  {
    name: 'Select Compression Level',
    text: 'Choose Balanced (recommended for emails and portals), Extreme (maximum size reduction), or High Quality Print.',
  },
  {
    name: 'Optimize in Browser',
    text: 'Compixor strips redundant objects and optimizes image streams without converting text pages into blurry raster images.',
  },
  {
    name: 'Download Compressed Files',
    text: 'Save your compressed PDF or download a single ZIP archive containing all optimized files.',
  },
];

export default function PdfCompressorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SoftwareAppJsonLd
        name="Free PDF Compressor Online"
        description={DESCRIPTION}
        url={CANONICAL_URL}
        applicationCategory="Utility"
        operatingSystem="Any/Web"
        price="0"
        priceCurrency="USD"
        featureList={[
          '100% Client-Side In-Browser Compression',
          'Native Stream Optimization & Vector Text Preservation',
          'Batch PDF Compression up to 5 files',
          'Multiple Compression Presets (Balanced, Extreme, Print)',
          'Zero Server Uploads & Instant ZIP Export',
        ]}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://compixor-ai.vercel.app/' },
          { name: 'Tools', url: 'https://compixor-ai.vercel.app/#tools' },
          { name: 'Free PDF Compressor', url: CANONICAL_URL },
        ]}
      />
      <HowToJsonLd
        name="How to Compress PDF Files Online Without Quality Loss"
        description="Step-by-step instructions on reducing PDF file sizes with local vector stream optimization."
        steps={pdfCompressorHowToSteps}
        totalTime="PT30S"
      />
      <FaqJsonLd faqs={pdfCompressorFaqs} />
      {children}
    </>
  );
}
