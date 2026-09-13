import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Word Document Compressor — Reduce DOCX File Size Online',
  description:
    'Optimize Microsoft Word DOCX files locally in your browser. Extracts, compresses, and re-encodes embedded high-res images without altering document XML, styles, or tables.',
  keywords: [
    'word document docx compressor',
    'reduce word file size online free',
    'compress docx in browser',
    'shrink word document images',
    'microsoft word file size reducer',
  ],
  alternates: {
    canonical: 'https://compixor-ai.vercel.app/tools/word-compressor',
  },
  openGraph: {
    title: 'Word Document Compressor — Reduce DOCX File Size Online',
    description:
      'Reduce large Microsoft Word documents by optimizing embedded photos and illustrations in-memory. Zero server uploads.',
    url: 'https://compixor-ai.vercel.app/tools/word-compressor',
    type: 'website',
  },
};

export default function WordCompressorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
