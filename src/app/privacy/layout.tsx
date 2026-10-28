import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Privacy Policy - Files Never Leave Your Browser',
  description: 'Read the Compixor AI privacy policy. Our zero-server architecture processes all files locally in your browser with zero uploads.',
  alternates: {
    canonical: 'https://compixor-ai.cloud/privacy',
  },
  openGraph: {
    title: 'Privacy Policy — Client-Side Local Processing Architecture | Compixor AI',
    description:
      'Read the Compixor AI privacy policy. Our zero-server architecture processes all files locally in your browser with zero uploads.',
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
    card: 'summary_large_image',
    title: 'Privacy Policy — Client-Side Local Processing Architecture | Compixor AI',
    description:
      'Read the Compixor AI privacy policy. Our zero-server architecture processes all files locally in your browser with zero uploads.',
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
