import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Passport Photo Maker Online — Free Biometric ID, Visa & Passport Photos',
  description:
    'Free online biometric passport size photo maker with AI background matting. Official sizes for Pakistan NADRA, US Visa, UK/EU, India, Canada, and UAE. Print ready 300 DPI sheets.',
  keywords: [
    'NADRA passport photo maker free',
    'passport photo maker online',
    'us visa photo size online',
    'pakistan passport size photo online',
    'biometric passport photo studio',
    'passport photo background removal free',
    'print passport photo sheet a4',
  ],
  alternates: {
    canonical: 'https://compixor-ai.vercel.app/tools/passport-photo',
  },
  openGraph: {
    title: 'Passport Photo Maker Online — Free Biometric ID, Visa & Passport Photos',
    description:
      'Create official passport and visa photos with automatic AI background removal, country guidelines, and printable tiled sheets. 100% free and in-browser.',
    url: 'https://compixor-ai.vercel.app/tools/passport-photo',
    type: 'website',
  },
};

export default function PassportPhotoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
