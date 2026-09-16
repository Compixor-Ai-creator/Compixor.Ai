import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add Watermark to PDF Online — 100% Private & Free | Compixor.Ai',
  description:
    'Stamp custom vector text or image watermarks onto PDF documents instantly in your browser. Configure opacity, rotation, and custom page ranges with zero server uploads.',
  keywords: [
    'add watermark to pdf',
    'watermark pdf online free',
    'stamp pdf watermark',
    'client side pdf watermarking',
    'vector watermark pdf',
    'image watermark pdf',
    'confidential stamp pdf',
    'private pdf watermark maker',
  ],
  alternates: {
    canonical: 'https://compixor-ai.vercel.app/tools/add-watermark',
  },
  openGraph: {
    title: 'Add Watermark to PDF Online — 100% Private & Free | Compixor.Ai',
    description:
      'Stamp custom vector text or image watermarks onto PDF documents instantly in your browser. Configure opacity, rotation, and custom page ranges with zero server uploads.',
    url: 'https://compixor-ai.vercel.app/tools/add-watermark',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Add Watermark to PDF Online — 100% Private & Free | Compixor.Ai',
    description:
      'Stamp custom vector text or image watermarks onto PDF documents instantly in your browser. Configure opacity, rotation, and custom page ranges with zero server uploads.',
  },
};

export default function AddWatermarkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
