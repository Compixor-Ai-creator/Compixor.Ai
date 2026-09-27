import type { Metadata } from 'next';
import { SoftwareAppJsonLd, BreadcrumbJsonLd, FaqJsonLd, HowToJsonLd } from '@/components/JsonLd';
import { protectPdfFaqs } from '@/data/faqs';

const TITLE = 'Password Protect PDF Online Free - AES-256 Encryption | Compixor AI';
const DESCRIPTION =
  'Password protect your PDF online free with AES-256 encryption — restrict printing, copying & editing separately. 100% client-side, your password never leaves your browser.';
const CANONICAL_URL = 'https://compixor-ai.vercel.app/tools/protect-pdf';

export const metadata: Metadata = {
  title: {
    absolute: TITLE,
  },
  description: DESCRIPTION,
  keywords: [
    'password protect pdf online free',
    'encrypt pdf online',
    'aes 256 pdf encryption',
    'add password to pdf free',
    'restrict pdf editing',
    'secure pdf online no upload',
    'pdf permission password',
    'lock pdf file online free',
    'set password to pdf file online free',
    'how to lock pdf without adobe acrobat',
    'prevent copying from pdf file online',
    'secure confidential pdf online',
    'offline client side pdf encryptor',
    'block printing and editing pdf online free',
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
        alt: 'Password Protect PDF Online Free - Compixor AI',
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
