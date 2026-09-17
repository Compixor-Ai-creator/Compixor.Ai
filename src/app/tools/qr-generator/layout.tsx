import type { Metadata } from 'next';
import { SoftwareAppJsonLd, BreadcrumbJsonLd, FaqJsonLd } from '@/components/JsonLd';
import { qrGeneratorFaqs } from '@/data/faqs';

const TITLE = 'Free QR Code Generator - Custom Colors & SVG Export | Compixor AI';
const DESCRIPTION =
  'Generate high-resolution QR codes for websites, WiFi & contact cards. Custom colors, instant SVG/PNG download — 100% free.';
const CANONICAL_URL = 'https://compixor-ai.vercel.app/tools/qr-generator';

export const metadata: Metadata = {
  title: {
    absolute: TITLE,
  },
  description: DESCRIPTION,
  keywords: [
    'qr code generator free',
    'high resolution qr code',
    'custom qr code maker',
    'svg qr code online',
    'vector qr code maker',
    'free qr code with logo',
    'wifi qr code generator',
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
        alt: 'Free QR Code Generator - Compixor AI',
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

export default function QrGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SoftwareAppJsonLd
        name="Free QR Code Generator"
        description={DESCRIPTION}
        url={CANONICAL_URL}
        applicationCategory="Utility"
        operatingSystem="Any/Web"
        price="0"
        priceCurrency="USD"
        ratingValue="4.9"
        reviewCount="1280"
        featureList={[
          'Permanent Static QR Codes (Zero Redirects or Expirations)',
          'Custom Center Logo & Image Embedding',
          'Scalable Vector SVG & High-DPI PNG Exports',
          'Vibrant Gradient & Corner Square Dot Customization',
          'Presets for URLs, Wi-Fi Networks, vCards & Email',
        ]}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://compixor-ai.vercel.app/' },
          { name: 'Tools', url: 'https://compixor-ai.vercel.app/#tools' },
          { name: 'QR Code Generator', url: CANONICAL_URL },
        ]}
      />
      <FaqJsonLd faqs={qrGeneratorFaqs} />
      {children}
    </>
  );
}
