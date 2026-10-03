import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
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
  BookOpen,
} from 'lucide-react';
import {
  blogsData,
  getBlogBySlug,
  getAllBlogSlugs,
  getRelatedBlogs,
} from '@/lib/blogsData';
import BlogFaqAccordion from '@/components/BlogFaqAccordion';
import StickyBlogCta from '@/components/StickyBlogCta';

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
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.metaTitle,
      description: blog.metaDescription,
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
        item: 'https://compixor-ai.vercel.app/#blog-section',
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
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full opacity-35 dark:opacity-20 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(124, 58, 237, 0.35) 0%, rgba(99, 102, 241, 0.20) 40%, transparent 75%)',
            filter: 'blur(120px)',
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ============ BREADCRUMBS ============ */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-8 overflow-x-auto pb-1"
        >
          <Link
            href="/"
            className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors whitespace-nowrap"
          >
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <Link
            href="/#blog-section"
            className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors whitespace-nowrap"
          >
            Blogs
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
        <header className="mb-12">
          {/* Category & Read Time Pills */}
          <div className="flex flex-wrap items-center gap-2.5 mb-5">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20">
              {blog.category}
            </span>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80">
              <Clock className="w-3.5 h-3.5" />
              {blog.readTime}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Client-Side Privacy
            </span>
          </div>

          {/* Main H1 Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-zinc-900 dark:text-white leading-[1.12] tracking-tight mb-6">
            {blog.title}
          </h1>

          {/* Excerpt / Lead */}
          <p className="text-base sm:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
            {blog.excerpt}
          </p>

          {/* Quick Launch Card */}
          <div className="glass-card p-4 sm:p-5 rounded-2xl border border-brand-500/20 bg-brand-500/5 dark:bg-brand-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${blog.accentColor} flex items-center justify-center text-zinc-900 dark:text-white shrink-0 border border-zinc-200/70 dark:border-zinc-700/70 shadow-sm`}
              >
                <IconComponent className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Interactive Tool
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
        </header>

        {/* ============ ARTICLE BODY ============ */}
        <article className="prose dark:prose-invert max-w-none">
          {/* Intro Callout */}
          <div className="glass-card p-6 sm:p-7 rounded-2xl border-l-4 border-l-brand-500 border-zinc-200/80 dark:border-zinc-800/80 my-8 bg-zinc-50/70 dark:bg-zinc-900/60">
            <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium m-0">
              {blog.content.intro}
            </p>
          </div>

          {/* Structured Sections */}
          {blog.content.sections.map((section, idx) => (
            <section key={idx} className="my-10">
              <h2 className="text-2xl sm:text-3xl font-black font-display text-zinc-900 dark:text-white tracking-tight mb-4">
                {section.heading}
              </h2>

              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed mb-5">
                {section.body}
              </p>

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
            <section className="my-14 not-prose">
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
            <section className="my-14 not-prose">
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
        </article>

        {/* ============ RELATED GUIDES SECTION ============ */}
        {relatedArticles.length > 0 && (
          <aside className="mt-20 pt-12 border-t border-zinc-200/80 dark:border-zinc-800/80">
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
                href="/#blog-section"
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

      {/* Sticky Bottom Tool CTA Banner */}
      <StickyBlogCta toolTitle={blog.title} toolPath={blog.toolPath} />
    </div>
  );
}
