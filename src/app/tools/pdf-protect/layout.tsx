import type { Metadata } from 'next';
import { SoftwareAppJsonLd, BreadcrumbJsonLd, FaqJsonLd } from '@/components/JsonLd';

const TITLE = 'Free PDF Protect & Unlock Online - Password Encrypt or Remove PDF Password | Compixor AI';
const DESCRIPTION =
  'Password-protect your PDF with AES-128 encryption or unlock/remove password restrictions — 100% client-side, zero uploads, instant processing in your browser.';
const CANONICAL_URL = 'https://compixor-ai.vercel.app/tools/pdf-protect';

const faqs = [
  {
    q: 'Is my PDF file uploaded to any server?',
    a: 'No. Everything happens 100% in your browser. Your PDF never leaves your device — no uploads, no cloud processing, total privacy.',
  },
  {
    q: 'What type of encryption does Protect PDF use?',
    a: 'Protect PDF uses AES-128 encryption, the standard supported by all major PDF viewers including Adobe Acrobat, Chrome, and mobile apps.',
  },
  {
    q: 'What is the difference between Open Password and Owner Password?',
    a: 'Open Password blocks opening the file without a password. Owner Password restricts actions like printing, copying or editing while still allowing the file to be viewed.',
  },
  {
    q: 'Can I unlock a PDF without knowing the password?',
    a: 'No. The unlock tool requires the correct password. It is designed for users who own the PDF and want to remove restrictions — we do not support bypassing unknown passwords.',
  },
  {
    q: 'Will unlocking remove all restrictions?',
    a: 'Yes. The Unlock PDF tool removes both the open password and any permission restrictions, producing a fully unrestricted PDF.',
  },
];

export const metadata: Metadata = {
  title: {
    absolute: TITLE,
  },
  description: DESCRIPTION,
  keywords: [
    'protect pdf online',
    'pdf password protect',
    'unlock pdf online',
    'remove pdf password',
    'encrypt pdf',
    'pdf protection free',
    'client side pdf encryption',
    'free pdf password remover',
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
        alt: 'Free PDF Protect & Unlock - Compixor AI',
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

export default function PdfProtectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SoftwareAppJsonLd
        name="Free PDF Protect & Unlock Online"
        description={DESCRIPTION}
        url={CANONICAL_URL}
        applicationCategory="Utility"
        operatingSystem="Any/Web"
        price="0"
        priceCurrency="USD"
        featureList={[
          '100% Client-Side Browser Processing',
          'AES-128 Password Encryption',
          'Open Password & Owner/Permission Password',
          'Granular Permission Control (Print, Copy, Edit, Annotate)',
          'Remove PDF Password & Restrictions Instantly',
        ]}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://compixor-ai.vercel.app/' },
          { name: 'Tools', url: 'https://compixor-ai.vercel.app/#tools' },
          { name: 'PDF Protect & Unlock', url: CANONICAL_URL },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      {children}
    </>
  );
}
