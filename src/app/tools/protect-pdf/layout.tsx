import type { Metadata } from 'next';
import { SoftwareAppJsonLd, BreadcrumbJsonLd, FaqJsonLd } from '@/components/JsonLd';

const TITLE = 'Protect PDF Online - Add Password & AES-256 Encryption Free | Compixor AI';
const DESCRIPTION =
  'Password protect your PDF files online for free. Add AES-256 open passwords and permission restrictions with 100% client-side privacy. Zero server uploads.';
const CANONICAL_URL = 'https://compixor-ai.vercel.app/tools/protect-pdf';

const faqs = [
  {
    q: 'How does Protect PDF secure my files?',
    a: 'Protect PDF encrypts your document using AES-256 encryption directly inside your browser. Your file is never uploaded to any cloud server.',
  },
  {
    q: 'Can I set both Open and Permission passwords?',
    a: 'Yes. You can configure an Open Password (required to view the PDF) and an Owner Password (required to change permissions like copying, editing, or printing).',
  },
  {
    q: 'Will password protected PDFs open on any device?',
    a: 'Yes. AES-256 encrypted PDFs are standard ISO-compliant documents that open on Adobe Acrobat, Apple Preview, Google Chrome, mobile PDF readers, and all standard viewers.',
  },
];

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
        ratingValue="4.9"
        reviewCount="870"
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
      <FaqJsonLd faqs={faqs} />
      {children}
    </>
  );
}
