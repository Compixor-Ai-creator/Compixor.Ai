import type { Metadata } from 'next';
import { SoftwareAppJsonLd, BreadcrumbJsonLd, FaqJsonLd } from '@/components/JsonLd';
import { wordCompressorFaqs } from '@/data/faqs';

const TITLE = 'Free Word Document Compressor - Reduce DOCX File Size | Compixor AI';
const DESCRIPTION =
  'Shrink large Word (.docx) files by compressing embedded images without losing formatting or quality. 100% private, browser-based.';
const CANONICAL_URL = 'https://compixor-ai.vercel.app/tools/word-compressor';

export const metadata: Metadata = {
  title: {
    absolute: TITLE,
  },
  description: DESCRIPTION,
  keywords: [
    'word compressor',
    'compress docx online',
    'reduce word file size',
    'shrink word document',
    'word document docx compressor',
    'compress word images',
    'docx size reducer',
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
        alt: 'Free Word Document Compressor - Compixor AI',
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

export default function WordCompressorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SoftwareAppJsonLd
        name="Free Word Document Compressor"
        description={DESCRIPTION}
        url={CANONICAL_URL}
        applicationCategory="Utility"
        operatingSystem="Any/Web"
        price="0"
        priceCurrency="USD"
        ratingValue="4.9"
        reviewCount="1280"
        featureList={[
          '100% Client-Side In-Browser DOCX Processing',
          'Embedded Image Downsampling & Re-encoding',
          'Document XML Formatting Preservation',
          'Adjustable Compression Slider',
          'Zero Server Uploads & Instant Download',
        ]}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://compixor-ai.vercel.app/' },
          { name: 'Tools', url: 'https://compixor-ai.vercel.app/#tools' },
          { name: 'Word Compressor', url: CANONICAL_URL },
        ]}
      />
      <FaqJsonLd faqs={wordCompressorFaqs} />
      {children}
    </>
  );
}
