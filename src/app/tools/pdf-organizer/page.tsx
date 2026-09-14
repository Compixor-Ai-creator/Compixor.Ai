import type { Metadata } from 'next';
import PdfOrganizerClient from './pdf-organizer-client';

export const metadata: Metadata = {
  title: 'Free PDF Merge & Split Online — 100% Private | Compixor.Ai',
  description:
    'Combine multiple PDF files or extract specific pages instantly in your browser. Zero file uploads, 100% secure and free.',
  keywords: [
    'pdf merge online',
    'pdf split online',
    'merge pdf client side',
    'split pdf without upload',
    'combine pdf files free',
    'extract pdf pages in browser',
    'private pdf merger',
    'pdf page extractor',
    'free pdf organizer',
  ],
  alternates: {
    canonical: 'https://compixor-ai.vercel.app/tools/pdf-organizer',
  },
  openGraph: {
    title: 'Free PDF Merge & Split Online — 100% Private | Compixor.Ai',
    description:
      'Combine multiple PDF files or extract specific pages instantly in your browser. Zero file uploads, 100% secure and free.',
    url: 'https://compixor-ai.vercel.app/tools/pdf-organizer',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free PDF Merge & Split Online — 100% Private | Compixor.Ai',
    description:
      'Combine multiple PDF files or extract specific pages instantly in your browser. Zero file uploads, 100% secure and free.',
  },
};

export default function PdfOrganizerPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  const initialTab = searchParams?.tab === 'split' ? 'split' : 'merge';
  return <PdfOrganizerClient initialTab={initialTab} />;
}
