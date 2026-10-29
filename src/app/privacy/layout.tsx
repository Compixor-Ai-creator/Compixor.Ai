import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: {
    absolute: 'Compixor AI Privacy Policy | PDF & Document Tools',
  },
  description:
    'Read Compixor AI’s Privacy Policy to understand file processing, technical logs, browser storage, third-party services, and how our PDF and document tools handle data.',
  alternates: {
    canonical: 'https://compixor-ai.cloud/privacy',
  },
  openGraph: {
    title: 'Compixor AI Privacy Policy',
    description:
      'Learn how Compixor AI handles file processing, technical information, browser storage, and third-party processing across its document tools.',
    url: 'https://compixor-ai.cloud/privacy',
    type: 'website',
    images: [
      {
        url: 'https://compixor-ai.cloud/images/og-banner-v2.png',
        width: 1200,
        height: 630,
        alt: 'Compixor AI Privacy Policy',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Compixor AI Privacy Policy',
    description:
      'Learn how Compixor AI handles file processing, technical information, browser storage, and third-party processing across its document tools.',
    images: ['https://compixor-ai.cloud/images/og-banner-v2.png'],
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://compixor-ai.cloud/' },
          { name: 'Privacy Policy', url: 'https://compixor-ai.cloud/privacy' },
        ]}
      />
      {children}
    </>
  );
}
