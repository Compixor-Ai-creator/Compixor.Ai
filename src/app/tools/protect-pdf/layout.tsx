import type { Metadata } from 'next';
import { SoftwareAppJsonLd, BreadcrumbJsonLd, FaqJsonLd, HowToJsonLd } from '@/components/JsonLd';
import { protectPdfFaqs } from '@/data/faqs';

const TITLE = 'Protect PDF Online - Add Password & AES-256 Encryption Free | Compixor AI';
const DESCRIPTION =
  'Password protect your PDF files online for free. Add AES-256 open passwords and permission restrictions with 100% client-side privacy. Zero server uploads.';
const CANONICAL_URL = 'https://compixor-ai.vercel.app/tools/protect-pdf';

export const metadata: Metadata = {
  title: {
    absolute: TITLE,
  },
  description: DESCRIPTION,
  keywords: [
    'protect pdf',
    'password protect pdf',
    'encrypt pdf online',
    'free pdf protector',
    'add password to pdf',
    'pdf security online',
    'client-side pdf encryption',
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
        alt: 'Protect PDF Online - Compixor AI',
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

const protectPdfHowToSteps = [
  {
    name: 'Select or Drop PDF',
    text: 'Select your PDF document or drag and drop it into the secure browser canvas.',
  },
  {
    name: 'Set Open and Owner Passwords',
    text: 'Enter a strong open password to prevent unauthorized viewing, and optionally set an owner password to block printing, editing, or copying.',
  },
  {
    name: 'Encrypt in Memory',
    text: 'Click Protect PDF. The document is encrypted client-side using industry-standard AES-256 cipher without uploading to any server.',
  },
  {
    name: 'Download Protected PDF',
    text: 'Save your password-protected PDF file instantly. The file opens securely on all standard PDF viewers.',
  },
];

export default function ProtectPdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SoftwareAppJsonLd
        name="Protect PDF Online"
        description={DESCRIPTION}
        url={CANONICAL_URL}
        applicationCategory="Utility"
        operatingSystem="Any/Web"
        price="0"
        priceCurrency="USD"
        featureList={[
          '100% Client-Side In-Browser Encryption',
          'Standard AES-256 PDF Security',
          'Open & Permission Passwords Support',
          'Granular Restrictions (Print, Copy, Edit)',
          'Zero Server Storage or Uploads',
        ]}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://compixor-ai.vercel.app/' },
          { name: 'Tools', url: 'https://compixor-ai.vercel.app/#tools' },
          { name: 'Protect PDF', url: CANONICAL_URL },
        ]}
      />
      <HowToJsonLd
        name="How to Password Protect a PDF File for Free"
        description="Step-by-step instructions to encrypt and add password protection to any PDF document in your browser."
        steps={protectPdfHowToSteps}
        totalTime="PT30S"
      />
      <FaqJsonLd faqs={protectPdfFaqs} />
      {children}
    </>
  );
}
