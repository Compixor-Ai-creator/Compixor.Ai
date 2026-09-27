import type { Metadata } from 'next';
import { SoftwareAppJsonLd, BreadcrumbJsonLd, FaqJsonLd, HowToJsonLd } from '@/components/JsonLd';
import { unlockPdfFaqs } from '@/data/faqs';

const TITLE = 'Unlock PDF Online Free - Remove Password & Restrictions | Compixor AI';
const DESCRIPTION =
  'Remove password protection and restrictions from your PDF online free — instant, private, no server upload. Note: you must know the existing password to unlock.';
const CANONICAL_URL = 'https://compixor-ai.vercel.app/tools/unlock-pdf';

export const metadata: Metadata = {
  title: {
    absolute: TITLE,
  },
  description: DESCRIPTION,
  keywords: [
    'unlock pdf online free',
    'remove pdf password online',
    'remove pdf restrictions free',
    'decrypt pdf online',
    'remove owner password pdf',
    'pdf password remover no upload',
    'unlock protected pdf free',
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
        alt: 'Unlock PDF Online Free - Compixor AI',
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

const unlockPdfHowToSteps = [
  {
    name: 'Select Password-Protected PDF',
    text: 'Drop or select your encrypted PDF document into the browser.',
  },
  {
    name: 'Enter Document Password',
    text: 'Type the valid password to unlock permission restrictions or open locks.',
  },
  {
    name: 'Decrypt Client-Side',
    text: 'Click Unlock PDF. The encryption dictionaries are stripped locally in browser RAM with zero server communication.',
  },
  {
    name: 'Download Unrestricted PDF',
    text: 'Save your unlocked, completely editable and printable PDF document instantly.',
  },
];

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
      <HowToJsonLd
        name="How to Unlock and Remove Password from PDF for Free"
        description="Step-by-step guide to removing passwords and permission restrictions from PDF files in memory."
        steps={unlockPdfHowToSteps}
        totalTime="PT30S"
      />
      <FaqJsonLd faqs={unlockPdfFaqs} />
      {children}
    </>
  );
}
