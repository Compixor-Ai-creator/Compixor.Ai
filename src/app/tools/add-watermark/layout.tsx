import type { Metadata } from 'next';
import { SoftwareAppJsonLd, BreadcrumbJsonLd, FaqJsonLd } from '@/components/JsonLd';
import { addWatermarkFaqs } from '@/data/faqs';

const TITLE = 'Add Watermark to PDF Online Free - Text & Image Watermark | Compixor AI';
const DESCRIPTION =
  'Add custom text or image watermarks to your PDF with opacity and rotation controls. Free, fast, 100% client-side — no uploads.';
const CANONICAL_URL = 'https://compixor-ai.vercel.app/tools/add-watermark';

export const metadata: Metadata = {
  title: {
    absolute: TITLE,
  },
  description: DESCRIPTION,
  keywords: [
    'add watermark to pdf',
    'pdf watermark online',
    'add text watermark pdf',
    'add logo to pdf free',
    'stamp pdf watermark',
    'vector watermark pdf',
    'confidential stamp pdf',
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
        alt: 'Add Watermark to PDF Online Free - Compixor AI',
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

export default function AddWatermarkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SoftwareAppJsonLd
        name="Add Watermark to PDF Online Free"
        description={DESCRIPTION}
        url={CANONICAL_URL}
        applicationCategory="Utility"
        operatingSystem="Any/Web"
        price="0"
        priceCurrency="USD"
        featureList={[
          '100% Client-Side In-Browser Vector Watermarking',
          'Custom Text & Image/Logo Watermarks',
          'Precision Opacity, Rotation, Scale & Margin Sliders',
          'Custom Page Ranges & Layer Position Controls',
          'Zero Server Uploads & High-Fidelity Output',
        ]}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://compixor-ai.vercel.app/' },
          { name: 'Tools', url: 'https://compixor-ai.vercel.app/#tools' },
          { name: 'Add PDF Watermark', url: CANONICAL_URL },
        ]}
      />
      <FaqJsonLd faqs={addWatermarkFaqs} />
      {children}
    </>
  );
}
