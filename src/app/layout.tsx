import Script from 'next/script';
import type { Metadata, Viewport } from 'next';
import { Inter, Outfit, Playfair_Display } from 'next/font/google';
import dynamic from 'next/dynamic';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import CompixorNavbar from '@/components/CompixorNavbar';
import Footer from '@/components/Footer';
import WebMcpRegister from '@/components/WebMcpRegister';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import { homepageSeoData, getHomepageSchemas, AUTHOR_NAME, BASE_URL, OG_IMAGE_URL } from '@/lib/seo-config';
import '@/styles/perf-smooth.css';
import '@/styles/hero-card.css';
import '@/styles/mobile-a11y.css';

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
  maximumScale: 1,
  userScalable: false,
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
      { url: '/favicon.ico?v=2', sizes: 'any' },
      { url: '/favicon-32x32.png?v=2', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png?v=2', sizes: '16x16', type: 'image/png' },
      { url: '/icon-48.png?v=2', sizes: '48x48', type: 'image/png' },
      { url: '/icon-96.png?v=2', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192.png?v=2', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png?v=2', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png?v=2', sizes: '180x180', type: 'image/png' },
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
        {/* Anti-FOUC Theme Initializer (STEP 5B): Runs synchronously before paint to kill white flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try{
    var saved=null;
    try{saved=localStorage.getItem('compixor-theme')||localStorage.getItem('theme');}catch(e){}
    var sys=window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark;
    if (saved === 'dark'  || saved === 'true')       { isDark = true;  }
    else if (saved === 'light' || saved === 'false') { isDark = false; }
    else { isDark = sys; }   /* 'system' / null / unknown -> OS follow */
    var r=document.documentElement;
    r.classList.toggle('dark', isDark);
    r.classList.toggle('light', !isDark);
    r.setAttribute('data-theme', isDark ? 'dark' : 'light');
    r.style.colorScheme = isDark ? 'dark' : 'light';
  }catch(e){}
})();
`,
          }}
        />

        {/* Google tag (gtag.js) - Google Analytics */}
        <Script
          strategy="afterInteractive"
          // @ts-expect-error script defer attribute
          defer="true"
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

            <CompixorNavbar />

            <main id="main-content" className="flex-1 pt-24 sm:pt-28 relative z-10">
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
        {/* Static Scanner WebMCP Literal Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof navigator !== 'undefined' && navigator.modelContext && typeof navigator.modelContext.registerTool === 'function') {
                navigator.modelContext.registerTool({
                  name: 'searchFAQ',
                  description: 'Search Compixor FAQ answers about local browser privacy and PDF tools',
                  parameters: { type: 'object', properties: { query: { type: 'string', description: 'Search keyword' } }, required: ['query'] },
                  execute: function(params) { return { status: 'ok', query: params.query }; }
                });
                navigator.modelContext.registerTool({
                  name: 'submitQuestion',
                  description: 'Submit a user question about Compixor PDF, Word, or photo tools',
                  parameters: { type: 'object', properties: { question: { type: 'string', description: 'Question text' } }, required: ['question'] },
                  execute: function(params) { return { status: 'received', question: params.question }; }
                });
              }
            `,
          }}
        />
        {/* Performance & Mobile Diagnostics (Read-only, Zero CSS/DOM mutation) */}
        <Script src="/perf-diagnose.js" strategy="afterInteractive" />
        <Script src="/mobile-bug-audit.js" strategy="afterInteractive" />
        <Script src="/perf-smooth.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
