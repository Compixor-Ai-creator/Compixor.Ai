import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import dynamic from 'next/dynamic';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import { homepageSeoData, getHomepageSchemas, AUTHOR_NAME, BASE_URL } from '@/lib/seo-config';

const FeedbackWidget = dynamic(() => import('@/components/FeedbackWidget'), {
  ssr: false,
});

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

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  applicationName: 'Compixor AI',
  appleWebApp: {
    capable: true,
    title: 'Compixor AI',
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
  title: {
    default: homepageSeoData.title,
    template: '%s | Compixor AI — Client-Side Privacy Tools',
  },
  description: homepageSeoData.description,
  keywords: homepageSeoData.keywords,
  authors: [{ name: AUTHOR_NAME, url: BASE_URL }],
  creator: AUTHOR_NAME,
  publisher: 'Compixor AI',
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: homepageSeoData.title,
    description: homepageSeoData.description,
    type: 'website',
    url: BASE_URL,
    siteName: 'Compixor AI',
    locale: 'en_US',
    images: [
      {
        url: '/images/og-banner.png',
        width: 1200,
        height: 630,
        alt: homepageSeoData.title,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: homepageSeoData.title,
    description: homepageSeoData.description,
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
  const homeSchemas = getHomepageSchemas();

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
        {/* Mobile & PWA Meta Tags */}
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-title" content="Compixor AI" />
        <meta name="application-name" content="Compixor AI" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        {/* JSON-LD Structured Data: WebSite, Organization & ItemList */}
        {homeSchemas.map((schema, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      <body className="min-h-screen topo-bg">
        <ThemeProvider>
          <div className="relative min-h-screen flex flex-col">
            {/* Sliding Ambient Blur Glows (Desktop only — disabled on mobile for 60fps scrolling) */}
            <div className="hidden md:block slide-blur-container">
              <div className="slide-blur-orb-1" />
              <div className="slide-blur-orb-2" />
              <div className="slide-blur-orb-3" />
            </div>

            {/* Hero Top Glow (Desktop only) */}
            <div className="hidden md:block fixed inset-0 pointer-events-none bg-hero-glow dark:bg-hero-glow-dark" />

            <Navbar />

            <main className="flex-1 pt-16 relative z-10">
              {children}
            </main>

            <Footer />
          </div>
          <FeedbackWidget />
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
