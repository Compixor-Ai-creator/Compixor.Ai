import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
  display: 'swap',
});

const BASE_URL = 'https://compixor.ai';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'COMPIXOR.AI — Professional Media & Document Tools',
    template: '%s | COMPIXOR.AI',
  },
  description:
    'Compress PDFs, optimize Word documents, generate passport photos, and create custom QR codes — all processed locally in your browser. Fast, private, and free.',
  keywords: [
    'PDF compressor',
    'Word document compressor',
    'passport photo generator',
    'QR code generator',
    'online tools',
    'privacy first',
    'client-side processing',
  ],
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: 'COMPIXOR.AI — Professional Media & Document Tools',
    description:
      'Transform your files instantly with AI-powered tools that never leave your browser.',
    type: 'website',
    url: BASE_URL,
    siteName: 'COMPIXOR.AI',
    images: [
      {
        url: '/images/og-banner.png',
        width: 1200,
        height: 630,
        alt: 'COMPIXOR.AI — Professional Media & Document Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'COMPIXOR.AI — Professional Media & Document Tools',
    description:
      'Transform your files instantly with AI-powered tools that never leave your browser.',
    images: ['/images/og-banner.png'],
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/apple-icon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${outfit.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/icon.png?v=3" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/icon.png?v=3" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png?v=3" />
      </head>
      <body className="min-h-screen topo-bg">
        <ThemeProvider>
          <div className="relative min-h-screen flex flex-col">
            {/* Sliding Ambient Blur Glows */}
            <div className="slide-blur-container">
              <div className="slide-blur-orb-1" />
              <div className="slide-blur-orb-2" />
              <div className="slide-blur-orb-3" />
            </div>

            {/* Hero Top Glow */}
            <div className="fixed inset-0 pointer-events-none bg-hero-glow dark:bg-hero-glow-dark" />

            <Navbar />

            <main className="flex-1 pt-16 relative z-10">
              {children}
            </main>

            <Footer />
          </div>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(16px)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)',
              },
            }}
          />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
