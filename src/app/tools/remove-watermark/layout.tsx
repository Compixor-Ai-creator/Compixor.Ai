import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Remove Watermark from PDF Online — 100% Private & Free | Compixor.Ai',
  description:
    'Losslessly remove watermarks, stamps, and logos from PDF documents in your browser. Vector stream stripping and interactive erase box with zero cloud uploads.',
  keywords: [
    'remove watermark from pdf',
    'pdf watermark remover online',
    'erase watermark from pdf free',
    'pdf redact watermark',
    'clean pdf watermarks',
    'lossless watermark removal',
    'private pdf watermark cleaner',
  ],
  alternates: {
    canonical: 'https://compixor-ai.vercel.app/tools/remove-watermark',
  },
  openGraph: {
    title: 'Remove Watermark from PDF Online — 100% Private & Free | Compixor.Ai',
    description:
      'Losslessly remove watermarks, stamps, and logos from PDF documents in your browser. Vector stream stripping and interactive erase box with zero cloud uploads.',
    url: 'https://compixor-ai.vercel.app/tools/remove-watermark',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Remove Watermark from PDF Online — 100% Private & Free | Compixor.Ai',
    description:
      'Losslessly remove watermarks, stamps, and logos from PDF documents in your browser. Vector stream stripping and interactive erase box with zero cloud uploads.',
  },
};

export default function RemoveWatermarkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
