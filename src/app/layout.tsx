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
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-outfit',
  display: 'swap',
  preload: true,
});

const BASE_URL = 'https://compixor-ai.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Compixor AI — Free Online Privacy-First Media & Document Tools',
    template: '%s | Compixor AI — Client-Side Privacy Tools',
  },
  description:
    'Compixor AI is a 100% private, client-side toolkit developed by Haroon Ali. Compress PDFs, make NADRA passport photos, resize social media DPs, and generate QR codes instantly.',
  keywords: [
    'compixor',
    'compixor ai',
    'haroon ali',
    'pdf compressor',
    'passport photo maker',
    'word compressor',
    'dp resizer',
    'qr code generator',
  ],
  authors: [{ name: 'Haroon Ali', url: 'https://compixor-ai.vercel.app' }],
  creator: 'Haroon Ali',
  publisher: 'Compixor AI',
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: 'Compixor AI — Free Online Privacy-First Media & Document Tools',
    description:
      'Compixor AI is a 100% private, client-side toolkit developed by Haroon Ali. Compress PDFs, make NADRA passport photos, resize social media DPs, and generate QR codes instantly.',
    type: 'website',
    url: BASE_URL,
    siteName: 'Compixor AI',
    locale: 'en_US',
    images: [
      {
        url: '/images/og-banner.png',
        width: 1200,
        height: 630,
        alt: 'Compixor AI — Free Online Privacy-First Media & Document Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compixor AI — Free Online Privacy-First Media & Document Tools',
    description:
      'Compixor AI is a 100% private, client-side toolkit developed by Haroon Ali. Compress PDFs, make NADRA passport photos, resize social media DPs, and generate QR codes instantly.',
    images: ['/images/og-banner.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png?v=4', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png?v=4', sizes: '16x16', type: 'image/png' },
      { url: '/icon.png?v=4', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico?v=4',
    apple: [
      { url: '/apple-touch-icon.png?v=4', sizes: '180x180', type: 'image/png' },
    ],
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Compixor.Ai',
    url: 'https://compixor-ai.vercel.app/',
    author: {
      '@type': 'Person',
      name: 'Haroon Ali',
    },
    creator: {
      '@type': 'Person',
      name: 'Haroon Ali',
    },
  };

  const mainWebApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Compixor AI',
    alternateName: ['Compixor', 'Compixor AI', 'Compixor.Ai'],
    url: 'https://compixor-ai.vercel.app/',
    applicationCategory: 'UtilitiesApplication, MultimediaApplication',
    operatingSystem: 'All',
    description:
      'Privacy-first client-side media and document tools developed by Haroon Ali. Includes local PDF merge and split, biometric passport photo maker, document compression, and no-crop DP resizers with zero server uploads.',
    browserRequirements: 'Requires HTML5 compatible browser. Requires HTML5 Canvas support.',
    permissions: '100% client-side privacy. Zero server uploads.',
    author: {
      '@type': 'Person',
      name: 'Haroon Ali',
      jobTitle: 'Founder & Lead Developer',
      url: 'https://compixor-ai.vercel.app/',
    },
    creator: {
      '@type': 'Person',
      name: 'Haroon Ali',
      url: 'https://compixor-ai.vercel.app/',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      '100% Client-side Processing (Zero Server Uploads)',
      'PDF Merge & Split',
      'Biometric Passport Photo Maker',
      'Smart Document & Image Compression',
      'No-Crop Social DP Resizer',
      'QR Code Generator',
    ],
  };

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Compixor AI',
      alternateName: ['Compixor', 'Compixor AI', 'Compixor.Ai'],
      url: 'https://compixor-ai.vercel.app/',
      description: 'Compixor AI is a 100% private, client-side toolkit developed by Haroon Ali. Compress PDFs, make NADRA passport photos, resize social media DPs, and generate QR codes instantly.',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://compixor-ai.vercel.app/?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
      author: {
        '@type': 'Person',
        name: 'Haroon Ali',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Compixor AI',
      url: 'https://compixor-ai.vercel.app/',
      logo: 'https://compixor-ai.vercel.app/icon.png',
      sameAs: [
        'https://compixor.ai',
      ],
      description: 'Provider of client-side privacy-first web utilities for media and documents.',
      founder: {
        '@type': 'Person',
        name: 'Haroon Ali',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Compixor PDF Merge & Split',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires modern web browser with WebAssembly and JavaScript enabled',
      url: 'https://compixor-ai.vercel.app/tools/pdf-organizer',
      description: 'Combine multiple PDF files into one document or extract and split page ranges client-side in the browser with zero server uploads.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Compixor PDF Compressor',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires modern web browser with WebAssembly and JavaScript enabled',
      url: 'https://compixor-ai.vercel.app/tools/pdf-compressor',
      description: 'Compress PDF files directly inside the browser using hybrid native vector and deep scanned canvas engines with zero server uploads.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Compixor Word Compressor',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires modern web browser with JavaScript enabled',
      url: 'https://compixor-ai.vercel.app/tools/word-compressor',
      description: 'Reduce DOCX Microsoft Word file sizes by re-encoding and optimizing embedded media while keeping document formatting intact.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Compixor Passport Photo Maker',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires modern web browser with WebAssembly and canvas support',
      url: 'https://compixor-ai.vercel.app/tools/passport-photo',
      description: 'Generate official biometric passport, visa, and ID photos with local AI background matting, preset country sizes, and 300 DPI printable sheets.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Compixor Full DP Maker',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires modern web browser with canvas support',
      url: 'https://compixor-ai.vercel.app/tools/full-dp-maker',
      description: 'Create uncropped full-size profile pictures for WhatsApp, Instagram, Facebook, and Telegram with aesthetic blur and gradient backgrounds.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Compixor QR Code Generator',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires modern web browser with SVG and canvas support',
      url: 'https://compixor-ai.vercel.app/tools/qr-generator',
      description: 'Design and export high-resolution branded QR codes in PNG and SVG formats with custom logos, dot shapes, and gradient styles.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
  ];

  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Anti-FOUC Theme Initializer Script: runs synchronously before body render */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('compixor-theme');
                  if (saved === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=4" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=4" />
        <link rel="shortcut icon" href="/favicon.ico?v=4" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=4" />
        {/* WebSite Schema (Compixor.Ai by Haroon Ali) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Exact WebApplication JSON-LD Schema for Google Search & Gemini AI Entity Recognition */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(mainWebApplicationSchema),
          }}
        />
        {/* JSON-LD Structured Data: WebSite, Organization & WebApplications */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
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
