import type { Metadata } from 'next';
import { SoftwareAppJsonLd, BreadcrumbJsonLd, FaqJsonLd } from '@/components/JsonLd';
import { removeWatermarkFaqs } from '@/data/faqs';

const TITLE = 'PDF Watermark Remover Online Free - No Login Required | Compixor AI';
const DESCRIPTION =
  'Remove watermarks, logos, and stamps from PDF files free online. No login, no upload, no software — 100% private and instant.';
const CANONICAL_URL = 'https://compixor-ai.vercel.app/tools/remove-watermark';

export const metadata: Metadata = {
  title: {
    absolute: TITLE,
  },
  description: DESCRIPTION,
  keywords: [
    'pdf watermark remover',
    'pdf watermark remover online',
    'pdf watermark remover free',
    'pdf watermark remover online free',
    'pdf watermark remover online free without login',
    'remove watermark from pdf online',
    'pdf file watermark remover',
    'pdf background watermark remover',
    'delete pdf watermark online',
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
        alt: 'PDF Watermark Remover Online Free - Compixor AI',
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
        name="PDF Watermark Remover Online Free"
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
