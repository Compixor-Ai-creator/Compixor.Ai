import type { Metadata } from 'next';
import { SoftwareAppJsonLd, BreadcrumbJsonLd, FaqJsonLd, HowToJsonLd } from '@/components/JsonLd';
import { fullDpMakerFaqs } from '@/data/faqs';

const TITLE = 'No-Crop DP Maker for WhatsApp, Instagram & Facebook Free | Compixor AI';
const DESCRIPTION =
  'Create full-size profile pictures without cropping for WhatsApp, Instagram, Facebook & Telegram. Blur, gradient & mirror backgrounds. 100% free, private, browser-based.';
const CANONICAL_URL = 'https://compixor-ai.vercel.app/tools/full-dp-maker';

export const metadata: Metadata = {
  title: {
    absolute: TITLE,
  },
  description: DESCRIPTION,
  keywords: [
    'whatsapp dp maker',
    'no crop dp maker',
    'whatsapp dp without crop',
    'instagram profile picture resizer',
    'full size whatsapp photo',
    'no crop profile picture',
    'square dp maker online',
    'whatsapp full dp free',
    'crop-free profile picture maker',
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
        alt: 'No-Crop DP Maker for WhatsApp, Instagram & Facebook Free - Compixor AI',
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

const fullDpHowToSteps = [
  {
    name: 'Select or Paste Photo',
    text: 'Drop, browse, or paste (Ctrl+V) your portrait or horizontal photo into the canvas.',
  },
  {
    name: 'Choose Social Platform Preset',
    text: 'Pick your destination such as WhatsApp (500×500), Instagram (1080×1080), or Facebook.',
  },
  {
    name: 'Configure Background Fill',
    text: 'Select Gaussian blur mirroring your photo colors, stylish gradient, or solid minimal color to fill the 1:1 canvas.',
  },
  {
    name: 'Check Circular Safety Guide & Export',
    text: 'Inspect the live dashed circle to verify your face will not be cut off, then download high-resolution PNG or JPG.',
  },
];

export default function FullDpMakerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SoftwareAppJsonLd
        name="No-Crop DP Maker for WhatsApp, Instagram & Facebook"
        description={DESCRIPTION}
        url={CANONICAL_URL}
        applicationCategory="DesignApplication"
        operatingSystem="Any/Web"
        price="0"
        priceCurrency="USD"
        featureList={[
          'No-Crop 1:1 Square Profile Picture Fitting',
          'Aesthetic Gaussian Blur Margin Backgrounds',
          'Solid Color & Vibrant Gradient Presets',
          'Circular Avatar Safety Guide Overlay',
          'High-Resolution Lossless PNG & JPEG Export',
        ]}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://compixor-ai.vercel.app/' },
          { name: 'Tools', url: 'https://compixor-ai.vercel.app/#tools' },
          { name: 'No-Crop DP Maker', url: CANONICAL_URL },
        ]}
      />
      <HowToJsonLd
        name="How to Create a Full Uncropped DP for WhatsApp and Instagram"
        description="Step-by-step tutorial on making a no-crop profile picture with ambient blur backgrounds."
        steps={fullDpHowToSteps}
        totalTime="PT30S"
      />
      <FaqJsonLd faqs={fullDpMakerFaqs} />
      {children}
    </>
  );
}
