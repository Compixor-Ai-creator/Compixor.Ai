import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Privacy Policy — Client-Side Local Processing Architecture | Compixor AI',
  description:
    'Read Compixor AI privacy policy. Discover our zero-server architecture: files are processed entirely in your browser with zero uploads and zero data retention.',
  alternates: {
    canonical: 'https://compixor-ai.cloud/privacy',
  },
  openGraph: {
    title: 'Privacy Policy — Client-Side Local Processing Architecture | Compixor AI',
    description:
      'Read Compixor AI privacy policy. Discover our zero-server architecture: files are processed entirely in your browser with zero uploads and zero data retention.',
    url: 'https://compixor-ai.cloud/privacy',
    type: 'website',
    images: [
      {
        url: 'https://compixor-ai.cloud/images/og-banner.png',
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
      'Read Compixor AI privacy policy. Discover our zero-server architecture: files are processed entirely in your browser with zero uploads and zero data retention.',
    images: ['https://compixor-ai.cloud/images/og-banner.png'],
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
