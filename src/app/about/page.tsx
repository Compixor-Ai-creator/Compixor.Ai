import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'About Us — Mission & Architecture',
  description:
    'Learn about Compixor AI, our mission, and our privacy-first engineering architecture. Fast, zero data leak document and media processing directly in your browser.',
  alternates: {
    canonical: 'https://compixor-ai.cloud/about',
  },
  openGraph: {
    title: 'About Us — Mission & Architecture | Compixor AI',
    description:
      'Learn about Compixor AI, our mission, and our privacy-first engineering architecture. Fast, zero data leak document and media processing directly in your browser.',
    url: 'https://compixor-ai.cloud/about',
    siteName: 'Compixor AI',
    type: 'website',
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
