import type { Metadata } from 'next';
import { SoftwareAppJsonLd, BreadcrumbJsonLd, FaqJsonLd, HowToJsonLd } from '@/components/JsonLd';
import { pdfToWordFaqs } from '@/data/faqs';

// SEO rule: Title ≤ 60 chars, Description 150–160 chars
const TITLE = 'PDF to Word Converter Free — No OCR & OCR | Compixor';
const DESCRIPTION =
  'Convert PDF to editable Word (.docx) free. No OCR for digital PDFs, OCR for scanned docs. Supports Urdu, Arabic & 80+ languages. Zero uploads, 100% private.';
const CANONICAL_URL = 'https://compixor-ai.vercel.app/tools/pdf-to-word';

export const metadata: Metadata = {
  title: {
    absolute: TITLE,
  },
  description: DESCRIPTION,
  keywords: [
    'pdf to word',
    'convert pdf to word online free',
    'pdf to docx converter',
    'pdf to word no ocr',
    'ocr pdf to word',
    'scanned pdf to word converter',
    'pdf to word urdu',
    'pdf to word arabic',
    'free pdf to word converter without email',
    'client side pdf to word',
    'pdf to editable docx online',
    'convert pdf to word without losing formatting',
    'offline pdf to word in browser',
    'private pdf to docx converter',
    'pdf to word converter no upload',
    'best free pdf to word converter',
    'pdf to word with ocr free',
    'image pdf to word converter',
    'pdf to doc',
    'pdf to docx',
    'convert pdf to editable word online',
    'pdf table to word converter',
    'dpdf alternative free',
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
        alt: 'Free PDF to Word Converter — No OCR & OCR Modes — Compixor AI',
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

const pdfToWordHowToSteps = [
  {
    name: 'Select or Drop PDF File',
    text: 'Drag and drop your PDF document into the browser dropzone or choose it from your local storage.',
  },
  {
    name: 'Extract Text & Layout in Browser',
    text: 'Compixor extracts text lines, font sizes, and structural headings directly in browser memory without sending data to any cloud server.',
  },
  {
    name: 'Generate OpenXML Word Document',
    text: 'Our client-side engine compiles a standard ISO/IEC 29500 compliant Word (.docx) file containing editable paragraphs.',
  },
  {
    name: 'Download Editable DOCX',
    text: 'Click Download Word Document to save your converted .docx file ready for Microsoft Word, Google Docs, or LibreOffice.',
  },
];

export default function PdfToWordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SoftwareAppJsonLd
        name="Free PDF to Word Converter Online"
        description={DESCRIPTION}
        url={CANONICAL_URL}
        applicationCategory="Utility"
        operatingSystem="Any/Web"
        price="0"
        priceCurrency="USD"
        featureList={[
          'No OCR Mode — instant conversion for digital/selectable-text PDFs',
          'OCR Mode — reads scanned & image-based PDFs (80+ languages)',
          'Supports Urdu, Arabic, English, French, German & more',
          'Standard ISO/IEC 29500 OpenXML (.docx) Output',
          'Zero Server Uploads — 100% Client-Side Privacy',
          'No Signup, No Email, No Watermark',
        ]}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://compixor-ai.vercel.app/' },
          { name: 'Tools', url: 'https://compixor-ai.vercel.app/#tools' },
          { name: 'PDF to Word Converter', url: CANONICAL_URL },
        ]}
      />
      <HowToJsonLd
        name="How to Convert PDF to Editable Word Document for Free"
        description="Step-by-step instructions on converting PDF files to editable Microsoft Word (.docx) documents in browser RAM."
        steps={pdfToWordHowToSteps}
        totalTime="PT30S"
      />
      <FaqJsonLd faqs={pdfToWordFaqs} />
      {children}
    </>
  );
}
