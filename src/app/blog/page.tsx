import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Sparkles } from 'lucide-react';
import BlogSection from '@/components/BlogSection';

export const metadata: Metadata = {
  title: 'Client-Side Guides & Tutorials | Compixor AI',
  description:
    'Comprehensive step-by-step guides on PDF compression, password protection, passport photo sizing, WhatsApp DP formatting, and QR code generation.',
  alternates: {
    canonical: 'https://compixor-ai.cloud/blog',
  },
  openGraph: {
    title: 'Client-Side Guides & Tutorials | Compixor AI',
    description:
      'Learn how to convert, compress, protect, and optimize files locally in your browser with zero server uploads.',
    url: 'https://compixor-ai.cloud/blog',
    siteName: 'Compixor AI',
    type: 'website',
  },
};

export default function BlogIndexPage() {
  return (
    <div className="relative pt-24 pb-20 overflow-x-clip">
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

      <BlogSection />
    </div>
  );
}
