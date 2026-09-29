import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Terms of Service — Free Client-Side Utilities | Compixor AI',
  description:
    'Read Compixor AI terms of service. Learn about permitted use, zero-upload guarantees, and full copyright ownership of your processed documents and assets.',
  alternates: {
    canonical: 'https://compixor-ai.vercel.app/terms',
  },
  openGraph: {
    title: 'Terms of Service — Free Client-Side Utilities | Compixor AI',
    description:
      'Read Compixor AI terms of service. Learn about permitted use, zero-upload guarantees, and full copyright ownership of your processed documents and assets.',
    url: 'https://compixor-ai.vercel.app/terms',
    type: 'website',
    images: [
      {
        url: 'https://compixor-ai.vercel.app/images/og-banner.png',
        width: 1200,
        height: 630,
        alt: 'Compixor AI Terms of Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service — Free Client-Side Utilities | Compixor AI',
    description:
      'Read Compixor AI terms of service. Learn about permitted use, zero-upload guarantees, and full copyright ownership of your processed documents and assets.',
    images: ['https://compixor-ai.vercel.app/images/og-banner.png'],
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://compixor-ai.vercel.app/' },
          { name: 'Terms of Service', url: 'https://compixor-ai.vercel.app/terms' },
        ]}
      />
      {children}
    </>
  );
}
