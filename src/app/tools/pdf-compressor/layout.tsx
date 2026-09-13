import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF Compressor Online — Free Client-Side PDF Reducer Without Upload',
  description:
    'Compress PDF files directly inside your browser with zero remote server file uploads. Dual engine support: preserve selectable vector text or perform deep scanned optimization.',
  keywords: [
    'client side pdf compressor',
    'compress pdf online without upload',
    'reduce pdf file size free',
    'private pdf compressor',
    'shrink pdf in browser',
    'scanned pdf compressor offline',
  ],
  alternates: {
    canonical: 'https://compixor-ai.vercel.app/tools/pdf-compressor',
  },
  openGraph: {
    title: 'PDF Compressor Online — Free Client-Side PDF Reducer Without Upload',
    description:
      'Reduce PDF file size up to 90% without uploading your confidential documents to any server. Fast, free, and completely private.',
    url: 'https://compixor-ai.vercel.app/tools/pdf-compressor',
    type: 'website',
  },
};

export default function PdfCompressorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
