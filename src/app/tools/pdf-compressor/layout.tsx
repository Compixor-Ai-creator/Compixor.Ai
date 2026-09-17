import type { Metadata } from 'next';
import { SoftwareAppJsonLd, BreadcrumbJsonLd, FaqJsonLd } from '@/components/JsonLd';
import { pdfCompressorFaqs } from '@/data/faqs';

const TITLE = 'Free PDF Compressor Online - Reduce File Size Instantly | Compixor AI';
const DESCRIPTION =
  'Compress PDF files online for free in seconds. 100% client-side, no uploads, no quality loss. Reduce PDF size up to 75% instantly.';
const CANONICAL_URL = 'https://compixor-ai.vercel.app/tools/pdf-compressor';

export const metadata: Metadata = {
  title: {
    absolute: TITLE,
  },
  description: DESCRIPTION,
  keywords: [
    'pdf compressor',
    'compress pdf online',
    'reduce pdf size online',
    'compress pdf without losing quality',
    'client side pdf compressor',
    'free pdf compressor',
    'shrink pdf in browser',
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
        ratingValue="4.9"
        reviewCount="1280"
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
      <FaqJsonLd faqs={pdfCompressorFaqs} />
      {children}
    </>
  );
}
