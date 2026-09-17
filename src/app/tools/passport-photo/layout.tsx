import type { Metadata } from 'next';
import { SoftwareAppJsonLd, BreadcrumbJsonLd, FaqJsonLd } from '@/components/JsonLd';
import { passportPhotoFaqs } from '@/data/faqs';

const TITLE = 'Passport Size Photo Maker Online Free - NADRA & US Visa | Compixor AI';
const DESCRIPTION =
  'Create passport size photos online free with a white background — NADRA, US Visa & Schengen compliant. No signup, 300 DPI printable sheet.';
const CANONICAL_URL = 'https://compixor-ai.vercel.app/tools/passport-photo';

export const metadata: Metadata = {
  title: {
    absolute: TITLE,
  },
  description: DESCRIPTION,
  keywords: [
    'passport size photo maker',
    'passport size photo maker online free',
    'passport size photo maker free',
    'passport size photo maker with white background',
    'best free online passport photo maker',
    'create passport size photo online free',
    'online passport size photo maker',
    'passport size photo size in cm',
    'nadra passport photo maker',
    'cnic photo online',
    'nicop photo online',
    '35x45mm photo maker',
    'pakistan passport photo online',
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
        alt: 'Passport Size Photo Maker Online Free - Compixor AI',
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

export default function PassportPhotoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SoftwareAppJsonLd
        name="Passport Size Photo Maker Online Free"
        description={DESCRIPTION}
        url={CANONICAL_URL}
        applicationCategory="DesignApplication"
        operatingSystem="Any/Web"
        price="0"
        priceCurrency="USD"
        ratingValue="4.9"
        reviewCount="1280"
        featureList={[
          'AI-Powered Background Removal & Replacement',
          'Official Biometric Presets for Pakistan NADRA, US Visa, UK/EU 35x45mm',
          'Print-Ready 300 DPI Tiled 4x6" Sheet with Cut Guides',
          'Interactive Face Guideline Grid & Rotation Controls',
          '100% Client-Side Privacy with Zero Server Uploads',
        ]}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://compixor-ai.vercel.app/' },
          { name: 'Tools', url: 'https://compixor-ai.vercel.app/#tools' },
          { name: 'Passport Photo Maker', url: CANONICAL_URL },
        ]}
      />
      <FaqJsonLd faqs={passportPhotoFaqs} />
      {children}
    </>
  );
}
