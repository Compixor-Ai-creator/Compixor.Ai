import Script from 'next/script';
import type { Metadata, Viewport } from 'next';
import { Inter, Outfit, Playfair_Display } from 'next/font/google';
import dynamic from 'next/dynamic';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WebMcpRegister from '@/components/WebMcpRegister';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import { homepageSeoData, getHomepageSchemas, AUTHOR_NAME, BASE_URL, OG_IMAGE_URL } from '@/lib/seo-config';

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

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
  preload: true,
});

export const viewport: Viewport = {
  themeColor: '#28195e',
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
    template: '%s | Compixor',
  },
  description: homepageSeoData.description,
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
        url: OG_IMAGE_URL,
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
    images: [OG_IMAGE_URL],
  },
manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  robots: {
    index: true,
    follow: true,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
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
      className={`${inter.variable} ${outfit.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Google tag (gtag.js) - Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-LKL3K1VKW6"
        />
        <Script
          id="google-analytics-gtag"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-LKL3K1VKW6', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />

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
        
        {/* AI & GEO Discovery */}
        <link rel="sitemap" type="application/xml" title="Sitemap" href="https://compixor-ai.cloud/sitemap.xml" />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLMs.txt" />
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
        {/* Accessible Skip to Main Content Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-400 font-bold text-xs uppercase tracking-wider transition-all"
        >
          Skip to main content
        </a>
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

            <main id="main-content" className="flex-1 pt-16 relative z-10">
              {children}
            </main>

            <Footer />
          </div>
          <FeedbackWidget />
          <WebMcpRegister />
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
