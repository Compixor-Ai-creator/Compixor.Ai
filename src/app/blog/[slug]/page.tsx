import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  Camera,
  Maximize2,
  QrCode,
  FileArchive,
  Layers,
  FileText,
  Lock,
  Unlock,
  Stamp,
  Eraser,
  FileDown,
  ScanText,
  ArrowRight,
  ChevronRight,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import {
  blogsData,
  getBlogBySlug,
  getAllBlogSlugs,
  getRelatedBlogs,
} from '@/lib/blogsData';
import BlogFaqAccordion from '@/components/BlogFaqAccordion';
import ArticleHeroBanner from '@/components/ArticleHeroBanner';
import DecisionCalloutBox from '@/components/DecisionCalloutBox';
import TableOfContents from '@/components/TableOfContents';
import RelatedToolsGrid from '@/components/RelatedToolsGrid';
import PasswordComparisonVisual from '@/components/PasswordComparisonVisual';
import DocumentLayersVisual from '@/components/DocumentLayersVisual';
import PassportBeforeAfter from '@/components/PassportBeforeAfter';
import {
  LinkedInIcon,
  TwitterXIcon,
  WhatsAppIcon,
  FacebookIcon,
} from '@/components/SocialIcons';
import { getShareUrls } from '@/lib/config';

interface PageProps {
  params: {
    slug: string;
  };
}


const DIRECT_RELATED_GUIDES: Record<string, { title: string; href: string }> = {
  'password-protect-pdf-files-online': {
    title: 'How to Remove a Password from a PDF (Free)',
    href: '/blog/how-to-remove-password-from-pdf',
  },
  'how-to-remove-password-from-pdf': {
    title: 'How to Password Protect a PDF with AES-256',
    href: '/blog/password-protect-pdf-files-online',
  },
  'how-to-add-watermark-to-pdf': {
    title: 'How to Remove a PDF Watermark Cleanly',
    href: '/blog/remove-watermark-from-pdf-cleanly',
  },
  'remove-watermark-from-pdf-cleanly': {
    title: 'How to Add a Watermark to a PDF (Step-by-Step)',
    href: '/blog/how-to-add-watermark-to-pdf',
  },
  'convert-pdf-to-editable-word-online': {
    title: 'How to Extract Text from an Image into Word',
    href: '/blog/extract-text-from-image-to-word',
  },
  'extract-text-from-image-to-word': {
    title: 'Convert PDF to Editable Word Without Layout Loss',
    href: '/blog/convert-pdf-to-editable-word-online',
  },
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Camera,
  Maximize2,
  QrCode,
  FileArchive,
  Layers,
  FileText,
  Lock,
  Unlock,
  Stamp,
  Eraser,
  FileDown,
  ScanText,
};

// Unknown blog slugs return immediate HTTP 404
export const dynamic = 'force-static';
export const dynamicParams = false;

// Statically pre-render all 12 blog posts for instant TTFB & SEO
export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({
    slug,
  }));
}

// Dynamic SEO Metadata for each article
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const blog = getBlogBySlug(params.slug);
  if (!blog) {
    return {
      title: 'Page Not Found | Compixor AI',
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = blog.canonicalUrl || `https://compixor-ai.cloud/blog/${blog.slug}`;

  return {
    title: blog.metaTitle,
    description: blog.metaDescription,
        alternates: {
      canonical: canonicalUrl,
    },
        openGraph: {
      title: `${blog.metaTitle} | Compixor`,
      description: blog.metaDescription,
      url: canonicalUrl,
      siteName: 'Compixor AI',
      type: 'article',
      locale: 'en_US',
      publishedTime: blog.datePublished || '2026-10-18T00:00:00.000Z',
      modifiedTime: blog.dateModified || '2026-10-18T00:00:00.000Z',
      images: [
        {
          url: blog.thumbnail
            ? `https://compixor-ai.cloud${blog.thumbnail}`
            : 'https://compixor-ai.cloud/icon.png',
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${blog.metaTitle} | Compixor`,
      description: blog.metaDescription,
      images: [
        blog.thumbnail
          ? `https://compixor-ai.cloud${blog.thumbnail}`
          : 'https://compixor-ai.cloud/icon.png',
      ],
    },
  };
}

export default function BlogPostPage({ params }: PageProps) {
  const blog = getBlogBySlug(params.slug);

  if (!blog) {
    notFound();
  }

  const IconComponent = iconMap[blog.icon] || FileText;
  const relatedArticles = getRelatedBlogs(blog.slug, 3);
  const canonicalUrl = blog.canonicalUrl || `https://compixor-ai.cloud/blog/${blog.slug}`;
  const shareUrls = getShareUrls(canonicalUrl, blog.title);

  const hasInContentFaqs = blog.content.sections.some((s) => s.heading === 'Frequently Asked Questions');
  const hasInContentSteps = blog.content.sections.some((s) => s.orderedList && s.orderedList.length > 0);

  // Dynamic Table of Contents items
  const tocItems = [
    { id: 'decision-box', label: '10-Second Decision' },
    ...blog.content.sections.map((section, idx) => ({
      id: `section-${idx}`,
      label: section.heading,
    })),
    ...(!hasInContentSteps && blog.content.steps && blog.content.steps.length > 0
      ? [{ id: 'steps', label: 'Step-by-Step Tutorial' }]
      : []),
    ...(!hasInContentFaqs && blog.content.faqs && blog.content.faqs.length > 0
      ? [{ id: 'faqs', label: 'Frequently Asked Questions' }]
      : []),
    { id: 'related-tools', label: 'Related Tools at a Glance' },
  ];

  // Structured Data (Article & FAQPage Schema)
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.metaDescription,
    image: [
      blog.thumbnail
        ? `https://compixor-ai.cloud${blog.thumbnail}`
        : 'https://compixor-ai.cloud/icon.png',
    ],
    datePublished: blog.datePublished || '2026-10-18T00:00:00.000Z',
    dateModified: blog.dateModified || '2026-10-18T00:00:00.000Z',
    author: {
      '@type': 'Person',
      name: 'Haroon Ali',
      url: 'https://compixor-ai.cloud/about',
      jobTitle: 'Founder & Lead Developer',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Compixor AI',
      logo: {
        '@type': 'ImageObject',
        url: 'https://compixor-ai.cloud/icon.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: blog.content.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
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
      {
        '@type': 'ListItem',
        position: 3,
        name: blog.title,
        item: canonicalUrl,
      },
    ],
  };

  const howToSchema =
    blog.content.steps && blog.content.steps.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: blog.title,
          description: blog.metaDescription,
          image: blog.thumbnail
            ? `https://compixor-ai.cloud${blog.thumbnail}`
            : 'https://compixor-ai.cloud/icon.png',
          step: blog.content.steps.map((s) => ({
            '@type': 'HowToStep',
            position: s.stepNumber,
            name: s.title,
            text: s.description,
          })),
        }
      : null;

  const webAppSchema = (() => {
    if (blog.slug === 'passport-size-photo-maker-online-free') {
      return {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Compixor AI Passport Photo Maker',
        url: 'https://compixor-ai.cloud/tools/passport-photo',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'All (Web Browser)',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        featureList: [
          'Biometric passport and visa photo maker',
          '300 DPI high-resolution export',
          'Automatic AI background removal',
          '100% in-browser client-side privacy',
        ],
      };
    }
    if (blog.slug === 'how-to-create-custom-qr-code-with-logo') {
      return {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Compixor AI Custom QR Code Generator with Logo',
        url: 'https://compixor-ai.cloud/tools/qr-generator',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'All (Web Browser)',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        featureList: [
          'Create custom QR codes with central logo and brand colors',
          'Permanent static QR codes with zero expiration date',
          'Reed-Solomon Level H (30%) Error Correction',
          'Scalable vector SVG and high-resolution PNG export',
          '100% in-browser client-side privacy with zero uploads',
        ],
      };
    }
    if (blog.slug === 'how-to-merge-and-split-pdf-files-online') {
      return {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Compixor AI PDF Organizer: Merge & Split Pages',
        url: 'https://compixor-ai.cloud/tools/pdf-organizer',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'All (Web Browser)',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        featureList: [
          'Merge multiple PDF files in custom visual sequence',
          'Split PDFs and extract specific page ranges (e.g. 1-3, 5, 8-10)',
          'Drag-and-drop thumbnail reordering and 90-degree page rotation',
          '100% in-browser client-side RAM processing via pdf-lib',
          'Zero file uploads, no watermarks, and no sign-up required',
        ],
      };
    }
    if (blog.slug === 'how-to-compress-pdf-without-losing-quality') {
      return {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Compixor AI PDF Compressor Online',
        url: 'https://compixor-ai.cloud/tools/pdf-compressor',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'All (Web Browser)',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        featureList: [
          'Compress PDF documents without losing visual quality',
          'Intelligent HTML5 canvas image downsampling and pako stream deflation',
          '100% in-browser client-side RAM processing',
          'Zero file uploads, no watermarks, and no queue limits',
        ],
      };
    }
    if (blog.slug === 'how-to-set-full-dp-whatsapp-without-cropping') {
      return {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Compixor AI Full DP Maker for All Social Media',
        url: 'https://compixor-ai.cloud/tools/full-dp-maker',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'All (Web Browser)',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        featureList: [
          'Fit rectangular portraits and landscapes to 1:1 square canvas',
          'Frosted ambient blur, solid color, and gradient padding',
          'Circular safe-zone preview for WhatsApp, Instagram, Facebook & X avatars',
          '100% in-browser client-side canvas processing with zero uploads',
        ],
      };
    }
    if (blog.toolPath) {
      return {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: `Compixor AI ${blog.title}`,
        url: `https://compixor-ai.cloud${blog.toolPath}`,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'All (Web Browser)',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      };
    }
    return null;
  })();

  return (
    <div className="relative pt-24 pb-20 overflow-x-clip">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      )}
      {webAppSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
        />
      )}

      {/* Ambient Aurora Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -z-10 inset-0 overflow-hidden"
      >
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] rounded-full opacity-35 dark:opacity-20 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(124, 58, 237, 0.35) 0%, rgba(99, 102, 241, 0.20) 40%, transparent 75%)',
            filter: 'blur(120px)',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ============ BREADCRUMBS ============ */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-8 overflow-x-auto pb-1 max-w-4xl mx-auto xl:max-w-none"
        >
          <Link
            href="/"
            className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors whitespace-nowrap"
          >
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <Link
            href="/blog"
            className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors whitespace-nowrap"
          >
            Blog
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span
            className="text-zinc-900 dark:text-zinc-100 font-semibold truncate max-w-[240px] sm:max-w-md"
            aria-current="page"
          >
            {blog.title}
          </span>
        </nav>

        {/* ============ ARTICLE HEADER ============ */}
        <header className="max-w-4xl mx-auto text-left sm:text-center mb-8">
          {/* Category, Date & Read Time Pills */}
          <div className="flex flex-wrap items-center justify-start sm:justify-center gap-2.5 mb-5">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20">
              {blog.category}
            </span>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80">
              <Calendar className="w-3.5 h-3.5" />
              {blog.datePublished
                ? new Date(blog.datePublished).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })
                : 'October 2026'}
            </span>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80">
              <Clock className="w-3.5 h-3.5" />
              {blog.readTime}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% In-Browser Privacy
            </span>
          </div>

          {/* Main H1 Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-zinc-900 dark:text-white leading-[1.18] tracking-tight mb-6">
            {blog.title}
          </h1>

          {/* Excerpt / Lead Paragraph */}
          <p className="text-base sm:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6 max-w-3xl mx-auto">
            {blog.excerpt}
          </p>

          {/* ============ FEATURED VISUAL MOCKUP BANNER (dpdf-style) ============ */}
          <ArticleHeroBanner
            id={blog.id}
            title={blog.title}
            category={blog.category}
            accentColor={blog.accentColor}
            thumbnail={blog.thumbnail}
          />
        </header>

        {/* ============ MAIN TWO-COLUMN READING LAYOUT ============ */}
        <div className="flex flex-col xl:flex-row xl:gap-12 justify-center items-start mt-8">
          {/* Left: Article Content Column */}
          <main className="w-full max-w-3xl min-w-0 prose dark:prose-invert">
            {/* Intro Callout */}
            <div className="glass-card p-6 sm:p-7 rounded-2xl border-l-4 border-l-brand-500 border-zinc-200/80 dark:border-zinc-800/80 my-6 bg-zinc-50/70 dark:bg-zinc-900/60 not-prose">
              <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium m-0">
                {blog.content.intro}
              </p>
            </div>

            {/* Direct Answer / Key Takeaways Snippet Box */}
            {blog.keyTakeaways && (
              <div className="glass-card p-5 sm:p-6 rounded-2xl border-l-4 border-l-emerald-500 border-zinc-200/80 dark:border-zinc-800/80 my-6 bg-emerald-500/5 dark:bg-emerald-500/10 not-prose shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Direct Answer / Key Takeaways
                  </span>
                </div>
                <p className="text-sm sm:text-base text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium m-0">
                  {blog.keyTakeaways}
                </p>
              </div>
            )}

            {/* Prominent Call-To-Action Card (Step 1) */}
            <div className="glass-card p-4 sm:p-5 rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-500/10 via-purple-500/5 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4 not-prose my-6 shadow-sm flex-wrap min-w-0 overflow-hidden">
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${blog.accentColor} flex items-center justify-center text-zinc-900 dark:text-white shrink-0 border border-zinc-200/70 dark:border-zinc-700/70 shadow-sm`}
                >
                  <IconComponent className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> 100% In-Browser • Zero File Uploads
                  </p>
                  <p className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white m-0 truncate">
                    Try the {blog.toolName || 'Free Tool'}
                  </p>
                </div>
              </div>

              <Link
                href={blog.toolPath}
                className="btn-primary py-2.5 px-5 text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-md max-w-full"
              >
                <span className="truncate">{blog.ctaLabel || 'Launch Free Tool'}</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>

            {/* Quick Decision Box (dpdf 10-second decision style) */}
            <div id="decision-box">
              <DecisionCalloutBox
                title={blog.decisionBox?.title}
                items={blog.decisionBox?.items}
                defaultToolName={blog.title}
                defaultToolPath={blog.toolPath}
              />
            </div>

            {/* Structured Sections */}
            {blog.content.sections.map((section, idx) => (
              <section key={idx} id={`section-${idx}`} className="my-10 scroll-mt-24">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 dark:text-white tracking-tight mb-4 border-b border-zinc-200/70 dark:border-zinc-800/70 pb-3">
                  {section.heading}
                </h2>

                <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed mb-5">
                  {section.body}
                </p>

                {/* Password Types Visual Matrix (Open Password vs Permission Password) */}
                {blog.slug === 'password-protect-pdf-files-online' && idx === 0 && (
                  <PasswordComparisonVisual />
                )}

                {/* Multi-Layer Pipeline Architecture (Document, Encryption, Watermark, Flatten) */}
                {blog.slug === 'password-protect-pdf-files-online' && idx === 1 && (
                  <DocumentLayersVisual />
                )}

                {/* Passport Photo Before / After Biometric Transformation */}
                {blog.slug === 'passport-size-photo-maker-online-free' && idx === 0 && (
                  <PassportBeforeAfter />
                )}

                {/* PDF Compression Efficiency Benchmark Diagram */}
                {blog.slug === 'how-to-compress-pdf-without-losing-quality' && idx === 0 && (
                  <div className="my-8 not-prose w-full">
                    <div className="relative rounded-3xl bg-zinc-950/90 border border-zinc-800/80 p-3 sm:p-5 shadow-2xl overflow-hidden backdrop-blur-xl">
                      <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-zinc-800/60 shadow-lg bg-zinc-900">
                        <Image
                          src="/blog/pdf-compression-benchmark.webp"
                          alt="PDF Compression Efficiency Benchmark: Text, Color Scan, B&W Scan, CAD Drawing"
                          width={1200}
                          height={675}
                          sizes="(max-width: 768px) 100vw, 800px"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-3 px-2 text-xs text-zinc-400">
                        <span className="font-semibold text-zinc-300">Topology Benchmark &amp; Reduction Yields</span>
                        <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline-block">Client-Side Memory Analysis</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* MRC Layer Segmentation Architecture Diagram */}
                {blog.slug === 'how-to-compress-pdf-without-losing-quality' && idx === 2 && (
                  <div className="my-8 not-prose w-full">
                    <div className="relative rounded-3xl bg-zinc-950/90 border border-zinc-800/80 p-3 sm:p-5 shadow-2xl overflow-hidden backdrop-blur-xl">
                      <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-zinc-800/60 shadow-lg bg-zinc-900">
                        <Image
                          src="/blog/mrc-layer-segmentation.webp"
                          alt="Mixed Raster Content (MRC) 3-Layer Decomposition Architecture"
                          width={1200}
                          height={675}
                          sizes="(max-width: 768px) 100vw, 800px"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-3 px-2 text-xs text-zinc-400">
                        <span className="font-semibold text-zinc-300">Mixed Raster Content (MRC) 3-Layer Decomposition</span>
                        <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline-block">Loss-Free Chromatic Separation</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* PDF Watermark Architecture Comparison Visual Diagram */}
                {blog.slug === 'how-to-add-watermark-to-pdf' && idx === 0 && (
                  <div className="my-8 not-prose w-full">
                    <div className="relative rounded-3xl bg-zinc-950/90 border border-zinc-800/80 p-3 sm:p-5 shadow-2xl overflow-hidden backdrop-blur-xl">
                      <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-zinc-800/60 shadow-lg bg-zinc-900">
                        <Image
                          src="/blog/pdf-watermark-architecture.webp"
                          alt="PDF Watermark Architecture Comparison: Text Watermark vs Image Watermark (ISO 32000 Standard)"
                          width={1200}
                          height={675}
                          sizes="(max-width: 768px) 100vw, 800px"
                          className="w-full h-full object-contain sm:object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-3 px-2 text-xs text-zinc-400">
                        <span className="font-semibold text-zinc-300">PDF Watermark Architecture Comparison</span>
                        <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline-block">ISO 32000 Standard • Vector vs Asset</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* PDF Security Architecture Workflow Diagram (Encrypt -> Watermark -> Flatten) */}
                {blog.slug === 'how-to-add-watermark-to-pdf' && idx === 6 && (
                  <div className="my-8 not-prose w-full">
                    <div className="relative rounded-3xl bg-zinc-950/90 border border-zinc-800/80 p-3 sm:p-5 shadow-2xl overflow-hidden backdrop-blur-xl">
                      <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-zinc-800/60 shadow-lg bg-zinc-900">
                        <Image
                          src="/blog/pdf-security-workflow.webp"
                          alt="PDF Security Architecture Visualized: Encrypt, Watermark, and Flatten (ISO 32000 Standard)"
                          width={1200}
                          height={675}
                          sizes="(max-width: 768px) 100vw, 800px"
                          className="w-full h-full object-contain sm:object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-3 px-2 text-xs text-zinc-400">
                        <span className="font-semibold text-zinc-300">PDF Security Architecture Visualized</span>
                        <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline-block">Strict AES-256 Lock • Watermark • Flatten</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* WhatsApp Full DP vs Cropped Comparison Banner */}
                {blog.slug === 'how-to-set-full-dp-whatsapp-without-cropping' && idx === 0 && (
                  <div className="my-8 not-prose w-full">
                    <div className="relative rounded-3xl bg-zinc-950/90 border border-zinc-800/80 p-3 sm:p-5 shadow-2xl overflow-hidden backdrop-blur-xl">
                      <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-zinc-800/60 shadow-lg bg-zinc-900">
                        <Image
                          src="/blog/whatsapp-full-dp-banner.webp"
                          alt="WhatsApp DP Comparison: Annoying Crop Window vs Uncropped Full DP with Ambient Frosted Blur"
                          width={1200}
                          height={675}
                          sizes="(max-width: 768px) 100vw, 800px"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-3 px-2 text-xs text-zinc-400">
                        <span className="font-semibold text-zinc-300">WhatsApp DP Canvas Transformation</span>
                        <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline-block">1:1 Square Pad • Frosted Ambient Blur • 100% In-Browser</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Aspect Ratio Split Comparison Infographic */}
                {blog.slug === 'how-to-set-full-dp-whatsapp-without-cropping' && idx === 2 && (
                  <div className="my-8 not-prose w-full">
                    <div className="relative rounded-3xl bg-zinc-950/90 border border-zinc-800/80 p-3 sm:p-5 shadow-2xl overflow-hidden backdrop-blur-xl">
                      <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-zinc-800/60 shadow-lg bg-zinc-900">
                        <Image
                          src="/blog/aspect-ratio-comparison.webp"
                          alt="Aspect Ratio Comparison: 9:16 Portrait Forced Square Crop vs 1:1 Expanded Canvas with Circular Safe Zone"
                          width={1200}
                          height={675}
                          sizes="(max-width: 768px) 100vw, 800px"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-3 px-2 text-xs text-zinc-400">
                        <span className="font-semibold text-zinc-300">Aspect Ratio &amp; Circular Safe-Zone Anatomy</span>
                        <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline-block">9:16 Forced Crop vs 1:1 Safe Zone</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Passport Print Sheet Sample Graphic (A5 6-Photo Grid with Crop Marks & 300 DPI) */}
                {blog.slug === 'passport-size-photo-maker-online-free' && idx === 4 && (
                  <div className="my-8 not-prose w-full">
                    <div className="relative rounded-3xl bg-zinc-950/90 border border-zinc-800/80 p-3 sm:p-6 shadow-2xl overflow-hidden backdrop-blur-xl">
                      <div className="relative w-full rounded-2xl overflow-hidden border border-zinc-800/60 shadow-lg bg-zinc-900/90 flex items-center justify-center p-2 sm:p-4">
                        <Image
                          src="/blog/passport-print-sheet-sample.webp"
                          alt="A5 passport photo sheet with 6 Pakistan NADRA 35x45mm photos, corner cut marks, and 300 DPI layout"
                          width={1000}
                          height={700}
                          sizes="(max-width: 768px) 100vw, 800px"
                          loading="lazy"
                          className="w-full h-auto rounded-xl object-contain shadow-md"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 px-2 text-xs text-zinc-400 gap-2">
                        <span className="font-semibold text-zinc-200">
                          Sample Output: A5 Sheet with 6 Biometric 35 × 45 mm Photos (Pakistan NADRA / Visa)
                        </span>
                        <span className="text-[11px] font-mono text-zinc-400">
                          300 DPI JFIF • 3 × 2 Grid • Hairline Crosshair Cut Marks
                        </span>
                      </div>
                    </div>
                  </div>
                )}



                {/* Sample / Template Image Gallery */}
                {section.images && (
                  <div className="my-8 not-prose">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      {section.images.map((img, iIdx) => (
                        <figure
                          key={iIdx}
                          className="m-0 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 p-2 sm:p-2.5 shadow-sm"
                        >
                          <div className="relative w-full max-w-[140px] mx-auto aspect-square rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
                            <Image
                              src={img.src}
                              alt={img.alt}
                              width={140}
                              height={140}
                              sizes="(max-width: 640px) 32vw, 140px"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <figcaption className="pt-2 text-[10px] sm:text-[11px] leading-snug text-zinc-600 dark:text-zinc-400 text-center font-medium">
                            {img.caption}
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  </div>
                )}

                {/* Styled Bullet Points */}
                {section.list && (
                  <ul className="my-5 space-y-3 not-prose pl-0">
                    {section.list.map((listItem, lIdx) => {
                      const colonIndex = listItem.indexOf(':');
                      const hasPrefix = colonIndex > 0;
                      const prefix = hasPrefix ? listItem.slice(0, colonIndex + 1) : '';
                      const rest = hasPrefix ? listItem.slice(colonIndex + 1) : listItem;

                      return (
                        <li
                          key={lIdx}
                          className="flex items-start gap-3 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed"
                        >
                          <span className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5 select-none">
                            ✓
                          </span>
                          <span>
                            {hasPrefix && (
                              <strong className="text-zinc-900 dark:text-white font-bold">
                                {prefix}
                              </strong>
                            )}
                            {rest}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {/* Styled Ordered List */}
                {section.orderedList && (
                  <ol className="my-6 space-y-4 not-prose pl-0">
                    {section.orderedList.map((stepItem, sIdx) => {
                      const colonIndex = stepItem.indexOf(':');
                      const hasPrefix = colonIndex > 0;
                      const prefix = hasPrefix ? stepItem.slice(0, colonIndex + 1) : '';
                      const rest = hasPrefix ? stepItem.slice(colonIndex + 1) : stepItem;

                      return (
                        <li
                          key={sIdx}
                          className="flex items-start gap-3.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60"
                        >
                          <span className="w-6 h-6 rounded-lg bg-brand-500/15 text-brand-600 dark:text-brand-400 font-black flex items-center justify-center text-xs shrink-0 mt-0.5">
                            {sIdx + 1}
                          </span>
                          <span>
                            {hasPrefix && (
                              <strong className="text-zinc-900 dark:text-white font-bold block sm:inline mr-1">
                                {prefix}
                              </strong>
                            )}
                            {rest}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                )}

                {/* Comparison / Specification Table */}
                {section.table && (
                  <div className="my-7 overflow-x-auto rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs not-prose">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead className="bg-zinc-100/90 dark:bg-zinc-800/90 border-b border-zinc-200 dark:border-zinc-700">
                        <tr>
                          {section.table.headers.map((header, hIdx) => (
                            <th
                              key={hIdx}
                              className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md">
                        {section.table.rows.map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            className="hover:bg-brand-500/5 transition-colors"
                          >
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className="py-3 px-4 text-zinc-700 dark:text-zinc-300 font-medium"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Table Explanatory Note */}
                {section.tableNote && (
                  <div className="mt-3 p-3.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 text-xs leading-relaxed not-prose">
                    <p className="m-0 text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 shrink-0">Note:</span>
                      <span>{section.tableNote}</span>
                    </p>
                  </div>
                )}

                {/* In-Section FAQ Accordion */}
                {section.heading === 'Frequently Asked Questions' && blog.content.faqs && (
                  <div className="mt-6 not-prose">
                    <BlogFaqAccordion faqs={blog.content.faqs} />
                  </div>
                )}

                {/* In-Section CTA Button */}
                {section.cta && (
                  <div className="mt-8 not-prose text-center sm:text-left">
                    <Link
                      href={section.cta.href}
                      className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold shadow-md cursor-pointer"
                    >
                      <span>{section.cta.text}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </section>
            ))}

            {/* ============ STEP-BY-STEP VISUAL TUTORIAL ============ */}
            {!hasInContentSteps && blog.content.steps && blog.content.steps.length > 0 && (
              <section id="steps" className="my-14 not-prose scroll-mt-24">
                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                    Quick Walkthrough
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 dark:text-white tracking-tight mt-1">
                    How to Use in 3 Simple Steps
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {blog.content.steps.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="glass-card p-6 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 flex flex-col justify-between hover:border-brand-500/30 hover:shadow-lg transition-all"
                    >
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-md mb-4">
                          {step.stepNumber}
                        </div>
                        <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-2">
                          {step.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}


            {/* Direct Cross-Link to Paired Guide */}
            {DIRECT_RELATED_GUIDES[blog.slug] && (
              <div className="my-8 p-5 rounded-2xl bg-zinc-50/90 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-between gap-4 not-prose shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 m-0">
                      Related Companion Guide
                    </p>
                    <Link
                      href={DIRECT_RELATED_GUIDES[blog.slug].href}
                      className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                    >
                      {DIRECT_RELATED_GUIDES[blog.slug].title} &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* ============ IN-ARTICLE MID CTA BANNER ============ */}
            <div className="my-14 glass-card p-8 sm:p-10 rounded-3xl border border-brand-500/30 bg-gradient-to-br from-brand-500/10 via-purple-500/5 to-transparent text-center relative overflow-hidden not-prose shadow-xl">
              <div className="max-w-xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3 border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  100% In-Browser Privacy
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 dark:text-white mb-3">
                  Experience {blog.toolName || blog.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                  Zero file uploads, no watermarks, and no sign-up required. Your files remain completely secure in device RAM.
                </p>
                <Link
                  href={blog.toolPath}
                  className="btn-primary inline-flex items-center gap-2 text-sm sm:text-base px-8 py-3.5 font-bold cursor-pointer"
                >
                  <span>Launch Tool in Browser</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* ============ FAQS ACCORDION SECTION ============ */}
            {!hasInContentFaqs && blog.content.faqs && blog.content.faqs.length > 0 && (
              <section id="faqs" className="my-14 not-prose scroll-mt-24">
                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                    Got Questions?
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black font-display text-zinc-900 dark:text-white tracking-tight mt-1">
                    Frequently Asked Questions
                  </h2>
                </div>

                <BlogFaqAccordion faqs={blog.content.faqs} />
              </section>
            )}

            {/* ============ TRY THE FREE TOOL NEAR END (Step 1) ============ */}
            <div className="my-8 p-5 sm:p-6 rounded-2xl bg-brand-500/5 dark:bg-brand-500/10 border border-brand-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 not-prose shadow-sm flex-wrap min-w-0 overflow-hidden">
              <div className="min-w-0 flex-1">
                <p className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white m-0">
                  Ready to test it yourself?
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-0">
                  Process your files locally in your browser with zero limits, zero watermarks, and complete privacy.
                </p>
              </div>
              <Link
                href={blog.toolPath}
                className="btn-primary py-2.5 px-5 text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-md max-w-full"
              >
                <span className="truncate">{blog.ctaLabel || 'Try the Free Tool'}</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>

            {/* ============ EDITORIAL REVIEW & AUTHOR CREDENTIALS BOX (E-E-A-T) ============ */}
            <div className="my-10 glass-card p-6 sm:p-7 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/60 not-prose">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/70 dark:border-zinc-800/70">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-md flex items-center justify-center">
                    <Image
                      src="/images/compixor-badge.png"
                      alt="Compixor AI Team"
                      width={48}
                      height={48}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-zinc-900 dark:text-white m-0">
                      Compixor AI Team
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 m-0">
                      Reviewed by AI Imaging &amp; Document Compliance Specialists
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {blog.slug === 'passport-size-photo-maker-online-free' ? (
                    <>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        ICAO 9303 Compliant
                      </span>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        300 DPI Verified
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Zero Server Uploads
                      </span>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        100% Free &amp; Unlimited
                      </span>
                    </>
                  )}
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    100% In-Browser Privacy
                  </span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                <p className="m-0">
                  {blog.slug === 'passport-size-photo-maker-online-free'
                    ? 'Standards strictly mapped against ISO/IEC 19794-5 & ICAO Doc 9303 consular biometric criteria.'
                    : 'Engineered for privacy and performance. All file buffers are processed in client-side RAM and never stored.'}
                </p>
                <div className="flex items-center gap-2.5 shrink-0 overflow-visible">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm mr-1">Share this guide:</span>
                  <a
                    href={shareUrls.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    aria-label="Share on LinkedIn"
                    className="social-btn"
                    style={{ '--glow': '#0A66C2' } as React.CSSProperties}
                  >
                    <LinkedInIcon className="w-[18px] h-[18px]" />
                  </a>
                  <a
                    href={shareUrls.x}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    aria-label="Share on X"
                    className="social-btn social-btn-x"
                  >
                    <TwitterXIcon className="w-[18px] h-[18px]" />
                  </a>
                  <a
                    href={shareUrls.whatsApp}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    aria-label="Share on WhatsApp"
                    className="social-btn"
                    style={{ '--glow': '#25D366' } as React.CSSProperties}
                  >
                    <WhatsAppIcon className="w-[18px] h-[18px]" />
                  </a>
                  <a
                    href={shareUrls.facebook}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    aria-label="Share on Facebook"
                    className="social-btn"
                    style={{ '--glow': '#1877F2' } as React.CSSProperties}
                  >
                    <FacebookIcon className="w-[18px] h-[18px]" />
                  </a>
                </div>
              </div>
            </div>

            {/* ============ RELATED TOOLS AT A GLANCE (dpdf style) ============ */}
            <RelatedToolsGrid
              tools={blog.relatedTools}
              currentToolPath={blog.toolPath}
            />
          </main>

          {/* Right: Sticky Table of Contents Sidebar (Desktop Only) */}
          <aside className="hidden xl:block w-72 shrink-0">
            <TableOfContents items={tocItems} />
          </aside>
        </div>

        {/* ============ RELATED ARTICLES CAROUSEL ============ */}
        {relatedArticles.length > 0 && (
          <aside className="mt-20 pt-12 border-t border-zinc-200/80 dark:border-zinc-800/80 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Continue Reading
                </span>
                <h3 className="text-2xl font-black font-display text-zinc-900 dark:text-white tracking-tight mt-1">
                  Related Guides &amp; Tutorials
                </h3>
              </div>
              <Link
                href="/blog"
                className="text-xs sm:text-sm font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>All Guides</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => {
                const RelIcon = iconMap[rel.icon] || FileText;
                return (
                  <article
                    key={rel.id}
                    className="glass-card p-5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 flex flex-col justify-between hover:border-brand-500/40 hover:shadow-lg transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                        <span className="font-semibold text-brand-600 dark:text-brand-400">
                          {rel.category}
                        </span>
                        <span>{rel.readTime}</span>
                      </div>
                      {rel.thumbnail && (
                        <div
                          className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-3 border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-950"
                          style={{ aspectRatio: '16 / 9' }}
                        >
                          <Image
                            src={rel.thumbnail}
                            alt={rel.title}
                            width={640}
                            height={360}
                            sizes="(max-width: 768px) 100vw, 400px"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 mb-2">
                        <Link href={`/blog/${rel.slug}`}>{rel.title}</Link>
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                        {rel.excerpt}
                      </p>
                    </div>

                    <Link
                      href={`/blog/${rel.slug}`}
                      className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1 group-hover:underline"
                    >
                      <span>Read Guide</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </article>
                );
              })}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
