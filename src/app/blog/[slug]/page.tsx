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
  ExternalLink,
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

interface PageProps {
  params: {
    slug: string;
  };
}

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
      title: 'Article Not Found | Compixor AI',
      description: 'The requested guide could not be found.',
    };
  }

  const canonicalUrl = `https://compixor-ai.vercel.app/blog/${blog.slug}`;

  return {
    title: `${blog.metaTitle} | Compixor AI`,
    description: blog.metaDescription,
    keywords: [
      blog.targetKeyword,
      blog.category,
      'client-side',
      'in-browser tool',
      'privacy first',
      'Compixor',
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: blog.metaTitle,
      description: blog.metaDescription,
      url: canonicalUrl,
      siteName: 'Compixor AI',
      type: 'article',
      locale: 'en_US',
      images: [
        {
          url: blog.thumbnail
            ? `https://compixor-ai.vercel.app${blog.thumbnail}`
            : 'https://compixor-ai.vercel.app/icon.png',
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.metaTitle,
      description: blog.metaDescription,
      images: [
        blog.thumbnail
          ? `https://compixor-ai.vercel.app${blog.thumbnail}`
          : 'https://compixor-ai.vercel.app/icon.png',
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

  // Dynamic Table of Contents items
  const tocItems = [
    { id: 'decision-box', label: '10-Second Decision' },
    ...blog.content.sections.map((section, idx) => ({
      id: `section-${idx}`,
      label: section.heading,
    })),
    ...(blog.content.steps && blog.content.steps.length > 0
      ? [{ id: 'steps', label: 'Step-by-Step Tutorial' }]
      : []),
    ...(blog.content.faqs && blog.content.faqs.length > 0
      ? [{ id: 'faqs', label: 'Frequently Asked Questions' }]
      : []),
    { id: 'related-tools', label: 'Related Tools at a Glance' },
  ];

  // Structured Data (Article & FAQPage Schema)
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.metaDescription,
    author: {
      '@type': 'Organization',
      name: 'Compixor AI',
      url: 'https://compixor-ai.vercel.app',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Compixor AI',
      logo: {
        '@type': 'ImageObject',
        url: 'https://compixor-ai.vercel.app/icon.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://compixor-ai.vercel.app/blog/${blog.slug}`,
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
        item: 'https://compixor-ai.vercel.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blogs',
        item: 'https://compixor-ai.vercel.app/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: blog.title,
        item: `https://compixor-ai.vercel.app/blog/${blog.slug}`,
      },
    ],
  };

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
              February 2026
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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-zinc-900 dark:text-white leading-[1.12] tracking-tight mb-6">
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
          />
        </header>

        {/* ============ MAIN TWO-COLUMN READING LAYOUT ============ */}
        <div className="flex flex-col xl:flex-row xl:gap-12 justify-center items-start mt-8">
          {/* Left: Article Content Column */}
          <main className="w-full max-w-3xl min-w-0 prose dark:prose-invert">
            {/* Quick Decision Box (dpdf 10-second decision style) */}
            <div id="decision-box">
              <DecisionCalloutBox
                title={blog.decisionBox?.title}
                items={blog.decisionBox?.items}
                defaultToolName={blog.title}
                defaultToolPath={blog.toolPath}
              />
            </div>

            {/* Quick Launch Direct Card */}
            <div className="glass-card p-4 sm:p-5 rounded-2xl border border-brand-500/20 bg-brand-500/5 dark:bg-brand-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 not-prose my-6 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${blog.accentColor} flex items-center justify-center text-zinc-900 dark:text-white shrink-0 border border-zinc-200/70 dark:border-zinc-700/70 shadow-sm`}
                >
                  <IconComponent className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                    Client-Side Utility
                  </p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">
                    Execute this tool right now in your browser
                  </p>
                </div>
              </div>

              <Link
                href={blog.toolPath}
                className="btn-primary py-2.5 px-5 text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-md"
              >
                <span>Launch Tool Now</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

            {/* Intro Callout */}
            <div className="glass-card p-6 sm:p-7 rounded-2xl border-l-4 border-l-brand-500 border-zinc-200/80 dark:border-zinc-800/80 my-8 bg-zinc-50/70 dark:bg-zinc-900/60 not-prose">
              <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium m-0">
                {blog.content.intro}
              </p>
            </div>

            {/* Structured Sections */}
            {blog.content.sections.map((section, idx) => (
              <section key={idx} id={`section-${idx}`} className="my-10 scroll-mt-24">
                <h2 className="text-2xl sm:text-3xl font-black font-display text-zinc-900 dark:text-white tracking-tight mb-4 border-b border-zinc-200/70 dark:border-zinc-800/70 pb-3">
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

                {/* PDF Compression Efficiency Benchmark Diagram */}
                {blog.slug === 'how-to-compress-pdf-without-losing-quality' && idx === 0 && (
                  <div className="my-8 not-prose w-full">
                    <div className="relative rounded-3xl bg-zinc-950/90 border border-zinc-800/80 p-3 sm:p-5 shadow-2xl overflow-hidden backdrop-blur-xl">
                      <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-zinc-800/60 shadow-lg bg-zinc-900">
                        <Image
                          src="/blog/pdf-compression-benchmark.png"
                          alt="PDF Compression Efficiency Benchmark: Text, Color Scan, B&W Scan, CAD Drawing"
                          fill
                          sizes="(max-width: 768px) 100vw, 768px"
                          className="object-cover"
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
                          src="/blog/mrc-layer-segmentation.png"
                          alt="Mixed Raster Content (MRC) 3-Layer Decomposition Architecture"
                          fill
                          sizes="(max-width: 768px) 100vw, 768px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-3 px-2 text-xs text-zinc-400">
                        <span className="font-semibold text-zinc-300">Mixed Raster Content (MRC) 3-Layer Decomposition</span>
                        <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline-block">Loss-Free Chromatic Separation</span>
                      </div>
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
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
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
              </section>
            ))}

            {/* ============ STEP-BY-STEP VISUAL TUTORIAL ============ */}
            {blog.content.steps && blog.content.steps.length > 0 && (
              <section id="steps" className="my-14 not-prose scroll-mt-24">
                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                    Quick Walkthrough
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black font-display text-zinc-900 dark:text-white tracking-tight mt-1">
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

            {/* ============ IN-ARTICLE MID CTA BANNER ============ */}
            <div className="my-14 glass-card p-8 sm:p-10 rounded-3xl border border-brand-500/30 bg-gradient-to-br from-brand-500/10 via-purple-500/5 to-transparent text-center relative overflow-hidden not-prose shadow-xl">
              <div className="max-w-xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3 border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  100% In-Browser Privacy
                </div>
                <h3 className="text-2xl sm:text-3xl font-black font-display text-zinc-900 dark:text-white mb-3">
                  Experience {blog.title}
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
            {blog.content.faqs && blog.content.faqs.length > 0 && (
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
                        <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-3 border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-950">
                          <Image
                            src={rel.thumbnail}
                            alt={rel.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover"
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
