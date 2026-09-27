import type { Metadata } from 'next';
import { SoftwareAppJsonLd, BreadcrumbJsonLd, FaqJsonLd } from '@/components/JsonLd';
import { removeWatermarkFaqs } from '@/data/faqs';

const TITLE = 'Remove Watermark from PDF Online Free - Lossless | Compixor AI';
const DESCRIPTION =
  'Remove watermarks from PDF files online free — lossless removal, no quality loss, no server upload. Works on text and image watermarks. 100% private and browser-based.';
const CANONICAL_URL = 'https://compixor-ai.vercel.app/tools/remove-watermark';

export const metadata: Metadata = {
  title: {
    absolute: TITLE,
  },
  description: DESCRIPTION,
  keywords: [
    'remove watermark from pdf',
    'pdf watermark remover free online',
    'delete watermark pdf',
    'erase watermark from pdf',
    'remove watermark without losing quality',
    'free pdf watermark eraser',
    'remove stamp from pdf',
    'no upload watermark remover',
    'remove text watermark from pdf online free',
    'remove camscanner watermark from pdf free',
    'online pdf watermark cleaner without registration',
    'erase draft stamp from pdf file',
    'how to remove background watermark from pdf',
    'delete watermark from downloaded pdf',
    'remove watermark from scanned pdf online',
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
        alt: 'Remove Watermark from PDF Online Free - Compixor AI',
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

export default function RemoveWatermarkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SoftwareAppJsonLd
        name="Remove Watermark from PDF Online Free"
        description={DESCRIPTION}
        url={CANONICAL_URL}
        applicationCategory="Utility"
        operatingSystem="Any/Web"
        price="0"
        priceCurrency="USD"
        featureList={[
          '100% Client-Side In-Browser Watermark Removal',
          'Lossless Structured Artifact Removal',
          'Interactive Vector Erase & Redaction Tool',
          'Targeted Text Matcher Engine',
          'Zero Login & Zero Server Uploads',
        ]}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://compixor-ai.vercel.app/' },
          { name: 'Tools', url: 'https://compixor-ai.vercel.app/#tools' },
          { name: 'Remove PDF Watermark', url: CANONICAL_URL },
        ]}
      />
      <FaqJsonLd faqs={removeWatermarkFaqs} />
      {children}
    </>
  );
}
