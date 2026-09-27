import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free PDF Watermark & Remover Online — 100% Private | Compixor.Ai',
  description:
    'Add custom text or image watermarks to PDF files or remove existing watermarks losslessly in your browser. 100% client-side, zero server uploads.',
  keywords: [
    'pdf watermark online',
    'remove watermark from pdf',
    'add watermark to pdf free',
    'pdf watermark remover client side',
    'erase watermark from pdf',
    'vector pdf watermark',
    'image watermark pdf',
    'private pdf watermarking',
    'add logo to pdf online free',
    'pdf confidential stamp online',
    'remove text watermark from pdf online',
    'batch add watermark to pdf',
    'erase draft stamp from pdf free',
    'transparent watermark for pdf online',
    'watermark pdf pages without adobe acrobat',
  ],
  alternates: {
    canonical: 'https://compixor-ai.vercel.app/tools/pdf-watermark',
  },
  openGraph: {
    title: 'Free PDF Watermark & Remover Online — 100% Private | Compixor.Ai',
    description:
      'Add custom text or image watermarks to PDF files or remove existing watermarks losslessly in your browser. 100% client-side, zero server uploads.',
    url: 'https://compixor-ai.vercel.app/tools/pdf-watermark',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free PDF Watermark & Remover Online — 100% Private | Compixor.Ai',
    description:
      'Add custom text or image watermarks to PDF files or remove existing watermarks losslessly in your browser. 100% client-side, zero server uploads.',
  },
};

export default function PdfWatermarkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
