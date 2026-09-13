import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Custom QR Code Generator — Free Vector SVG & High-Res PNG QR Maker',
  description:
    'Create customized, high-resolution QR codes with embedded center logos, gradient colors, and unique dot styles. Export in scalable SVG and high-DPI PNG format.',
  keywords: [
    'custom qr code generator svg',
    'qr code generator with logo free',
    'vector qr code maker online',
    'high resolution png qr code',
    'branded qr code maker',
  ],
  alternates: {
    canonical: 'https://compixor-ai.vercel.app/tools/qr-generator',
  },
  openGraph: {
    title: 'Custom QR Code Generator — Free Vector SVG & High-Res PNG QR Maker',
    description:
      'Generate stunning branded QR codes with logos, custom colors, and dot patterns. Free, instant in-browser SVG/PNG download.',
    url: 'https://compixor-ai.vercel.app/tools/qr-generator',
    type: 'website',
  },
};

export default function QrGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
