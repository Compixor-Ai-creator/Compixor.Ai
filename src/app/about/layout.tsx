import type { Metadata } from 'next';
import { OrganizationJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: {
    absolute: 'About Compixor AI — Private Client-Side Media & Document Toolkit',
  },
  description:
    'Learn about Compixor AI, created by Haroon Ali. Discover our atmospheric minimalism philosophy and 100% private, client-side WebAssembly file processing architecture.',
  alternates: {
    canonical: 'https://compixor-ai.vercel.app/about',
  },
  openGraph: {
    title: 'About Compixor AI — Private Client-Side Media & Document Toolkit',
    description:
      'Learn about Compixor AI, created by Haroon Ali. Discover our atmospheric minimalism philosophy and 100% private, client-side WebAssembly file processing architecture.',
    url: 'https://compixor-ai.vercel.app/about',
    type: 'website',
    images: [
      {
        url: 'https://compixor-ai.vercel.app/images/og-banner.png',
        width: 1200,
        height: 630,
        alt: 'About Compixor AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Compixor AI — Private Client-Side Media & Document Toolkit',
    description:
      'Learn about Compixor AI, created by Haroon Ali. Discover our atmospheric minimalism philosophy and 100% private, client-side WebAssembly file processing architecture.',
    images: ['https://compixor-ai.vercel.app/images/og-banner.png'],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <OrganizationJsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://compixor-ai.vercel.app/' },
          { name: 'About', url: 'https://compixor-ai.vercel.app/about' },
        ]}
      />
      {children}
    </>
  );
}
