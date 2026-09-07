import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'COMPIXOR.AI — Professional Media & Document Tools',
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
  openGraph: {
    title: 'COMPIXOR.AI — Professional Media & Document Tools',
    description:
      'Transform your files instantly with AI-powered tools that never leave your browser.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
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
      </body>
    </html>
  );
}
