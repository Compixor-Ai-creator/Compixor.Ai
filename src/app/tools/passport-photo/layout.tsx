import type { Metadata } from 'next';
import { SoftwareAppJsonLd, BreadcrumbJsonLd, FaqJsonLd, HowToJsonLd } from '@/components/JsonLd';
import { passportPhotoFaqs } from '@/data/faqs';

const TITLE = 'Free Passport Photo Maker Online - 9 Countries, Auto Background | Compixor AI';
const DESCRIPTION =
  'Create compliant passport & ID photos online free — auto background removal, biometric alignment, printable sheet with cut marks. Supports US, UK, Pakistan NADRA, India, Canada & more. 100% private, no uploads.';
const CANONICAL_URL = 'https://compixor-ai.vercel.app/tools/passport-photo';

export const metadata: Metadata = {
  title: {
    absolute: TITLE,
  },
  description: DESCRIPTION,
  keywords: [
    'passport photo maker',
    'passport photo online free',
    'id photo maker online',
    'passport size photo maker',
    'nadra photo requirements',
    'passport photo background remover',
    'visa photo maker free',
    'printable passport photo',
    'biometric photo maker',
    'passport photo size checker',
    'id photo background remover free',
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
        alt: 'Free Passport Photo Maker Online - Compixor AI',
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

const passportHowToSteps = [
  {
    name: 'Upload Portrait Image',
    text: 'Drop or select your portrait photo or smartphone selfie. All processing runs locally in browser RAM.',
  },
  {
    name: 'Select Country Preset',
    text: 'Choose your official document format such as Pakistan NADRA (35×45mm), US Visa (2×2 inch), UK/EU Schengen, or enter custom millimeters.',
  },
  {
    name: 'Align with Biometric Guides',
    text: 'Use the interactive face overlay to align crown, eye axis, and chin level within official 70-80% height parameters.',
  },
  {
    name: 'Automatic Background Matting & Formal Attire',
    text: 'Our IS-Net FP16 engine removes messy backdrops instantly to solid white or blue, and allows adding formal suit overlays.',
  },
  {
    name: 'Download Photo or Print Sheet',
    text: 'Export an official single photo or a high-res 300 DPI multi-photo printable sheet with cutting guides.',
  },
];

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
      <HowToJsonLd
        name="How to Make Official Passport Size Photos Online for Free"
        description="Step-by-step guide to create government-compliant passport and visa photos with zero server uploads."
        steps={passportHowToSteps}
        totalTime="PT1M"
      />
      <FaqJsonLd faqs={passportPhotoFaqs} />
      {children}
    </>
  );
}
