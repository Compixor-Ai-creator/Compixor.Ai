import type { Metadata } from 'next';
import { SoftwareAppJsonLd, BreadcrumbJsonLd, FaqJsonLd } from '@/components/JsonLd';

const TITLE = 'Unlock PDF Online - Remove PDF Password & Restrictions Free | Compixor AI';
const DESCRIPTION =
  'Unlock password protected PDF files online. Remove passwords and permissions locally in seconds with 100% client-side privacy. Zero server uploads.';
const CANONICAL_URL = 'https://compixor-ai.vercel.app/tools/unlock-pdf';

const faqs = [
  {
    q: 'How does Unlock PDF remove passwords?',
    a: 'Unlock PDF decrypts the document in your browser memory using your provided password, removing all encryption dictionaries and saving an unrestricted PDF.',
  },
  {
    q: 'Can I unlock a PDF without knowing the password?',
    a: 'No. The correct password is required to decrypt the file. This tool is intended for legitimate PDF owners who want to remove restrictions.',
  },
  {
    q: 'Is my unlocked PDF stored on any server?',
    a: 'No. Decryption happens 100% locally in your browser. No files or passwords are ever transmitted to any remote servers.',
  },
];

export const metadata: Metadata = {
  title: {
    absolute: TITLE,
  },
  description: DESCRIPTION,
  keywords: [
    'unlock pdf',
    'remove pdf password',
    'decrypt pdf online',
    'free pdf unlocker',
    'remove restrictions from pdf',
    'pdf password remover',
    'client-side pdf decrypt',
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
        alt: 'Unlock PDF Online - Compixor AI',
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

export default function UnlockPdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SoftwareAppJsonLd
        name="Unlock PDF Online"
        description={DESCRIPTION}
        url={CANONICAL_URL}
        applicationCategory="Utility"
        operatingSystem="Any/Web"
        price="0"
        priceCurrency="USD"
        ratingValue="4.9"
        reviewCount="810"
        featureList={[
          '100% Client-Side In-Browser Decryption',
          'Instant Password Removal',
          'Eliminate Printing & Editing Restrictions',
          'Zero Server Storage or Uploads',
        ]}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://compixor-ai.vercel.app/' },
          { name: 'Tools', url: 'https://compixor-ai.vercel.app/#tools' },
          { name: 'Unlock PDF', url: CANONICAL_URL },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      {children}
    </>
  );
}
