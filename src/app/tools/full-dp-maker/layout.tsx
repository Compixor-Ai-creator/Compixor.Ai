import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Full DP Maker Online — No Crop Profile Picture for WhatsApp & Instagram',
  description:
    'Create uncropped full-size profile pictures for WhatsApp, Instagram, Facebook, and Telegram. Add aesthetic background blur, gradients, or mirror effects without cropping.',
  keywords: [
    'no crop whatsapp dp maker',
    'full dp profile picture maker',
    'square photo maker without cropping',
    'instagram no crop dp generator',
    'fit full photo in whatsapp dp',
  ],
  alternates: {
    canonical: 'https://compixor-ai.vercel.app/tools/full-dp-maker',
  },
  openGraph: {
    title: 'Full DP Maker Online — No Crop Profile Picture for WhatsApp & Instagram',
    description:
      'Fit complete rectangular photos into square profile pictures with background blur, colors, or gradients. Fast and free.',
    url: 'https://compixor-ai.vercel.app/tools/full-dp-maker',
    type: 'website',
  },
};

export default function FullDpMakerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
