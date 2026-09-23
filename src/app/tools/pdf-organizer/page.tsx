import type { Metadata } from 'next';
import { Suspense } from 'react';
import PdfOrganizerClient from './pdf-organizer-client';
import { SoftwareAppJsonLd, BreadcrumbJsonLd, FaqJsonLd } from '@/components/JsonLd';
import { pdfOrganizerFaqs } from '@/data/faqs';

const TITLE = 'Merge & Split PDF Online Free - Combine or Extract Pages | Compixor AI';
const DESCRIPTION =
  'Combine multiple PDFs into one or split a PDF into separate files by page range. Free, instant, and 100% private in-browser.';
const CANONICAL_URL = 'https://compixor-ai.vercel.app/tools/pdf-organizer';

export const metadata: Metadata = {
  title: {
    absolute: TITLE,
  },
  description: DESCRIPTION,
  keywords: [
    'merge pdf online',
    'split pdf online',
    'combine pdf files free',
    'extract pdf pages',
    'pdf splitter online',
    'pdf splitter free',
    'online pdf splitter free',
    'pdf page splitter',
    'split pdf pages in half',
    'pdf splitter by page',
    'free pdf splitter no sign up',
    'pdf merger and splitter',
  ],
  alternates: {
    canonical: CANONICAL_URL,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL_URL,
    type: 'website',
    images: [
      {
        url: '/images/og-banner.png',
        width: 1200,
        height: 630,
        alt: 'Merge & Split PDF Online Free - Compixor AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/images/og-banner.png'],
  },
};

function OrganizerClientWrapper({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  const initialTab = searchParams?.tab === 'split' ? 'split' : 'merge';
  return <PdfOrganizerClient initialTab={initialTab} />;
}

export default function PdfOrganizerPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  return (
    <>
      <SoftwareAppJsonLd
        name="Merge & Split PDF Online Free"
        description={DESCRIPTION}
        url={CANONICAL_URL}
        applicationCategory="Utility"
        operatingSystem="Any/Web"
        price="0"
        priceCurrency="USD"
        featureList={[
          '100% Client-Side In-Browser PDF Merging',
          'Fast Page Splitting and Range Extraction',
          'Interactive Visual Page Reordering Grid',
          'Individual Page Rotation & Deletion',
          'Zero Server Uploads & Instant ZIP or PDF Export',
        ]}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://compixor-ai.vercel.app/' },
          { name: 'Tools', url: 'https://compixor-ai.vercel.app/#tools' },
          { name: 'PDF Merge & Split', url: CANONICAL_URL },
        ]}
      />
      <FaqJsonLd faqs={pdfOrganizerFaqs} />
      <Suspense fallback={<div className="min-h-screen" />}>
        <OrganizerClientWrapper searchParams={searchParams} />
      </Suspense>
    </>
  );
}
