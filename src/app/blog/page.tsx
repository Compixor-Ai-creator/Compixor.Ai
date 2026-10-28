export const dynamic = 'force-static';
import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Sparkles } from 'lucide-react';
import BlogFilter from '@/components/BlogFilter';

export const metadata: Metadata = {
  title: 'Client-Side Guides & Tutorials',
  description:
    'Step-by-step guides on private PDF compression, password security, 300 DPI passport photos, full WhatsApp DPs, and custom QR codes.',
  alternates: {
    canonical: 'https://compixor-ai.cloud/blog',
  },
  openGraph: {
    title: 'Client-Side Guides & Tutorials | Compixor AI',
    description:
      'Step-by-step guides on private PDF compression, password security, 300 DPI passport photos, full WhatsApp DPs, and custom QR codes.',
    url: 'https://compixor-ai.cloud/blog',
    siteName: 'Compixor AI',
    type: 'website',
    images: [
      {
        url: 'https://compixor-ai.cloud/brand/logo-512.png',
        width: 512,
        height: 512,
        alt: 'Compixor AI Guides & Tutorials',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Client-Side Guides & Tutorials | Compixor AI',
    description:
      'Step-by-step guides on private PDF compression, password security, 300 DPI passport photos, full WhatsApp DPs, and custom QR codes.',
    images: ['https://compixor-ai.cloud/brand/logo-512.png'],
  },
};


const blogIndexSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Compixor AI Blog & Guides',
  description: 'Step-by-step guides on private PDF compression, password security, 300 DPI passport photos, full WhatsApp DPs, and custom QR codes.',
  url: 'https://compixor-ai.cloud/blog',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://compixor-ai.cloud',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Blog',
      item: 'https://compixor-ai.cloud/blog',
    },
  ],
};

export default function BlogIndexPage() {
  return (
    <div className="relative pt-24 pb-20 overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogIndexSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-6"
        >
          <Link
            href="/"
            className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span
            className="text-zinc-900 dark:text-zinc-100 font-semibold"
            aria-current="page"
          >
            Guides &amp; Blogs
          </span>
        </nav>
      </div>

      <BlogFilter />
    </div>
  );
}
