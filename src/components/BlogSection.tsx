'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
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
  BookOpen,
  Clock,
  Sparkles,
} from 'lucide-react';
import { blogsData, BlogItem } from '@/lib/blogsData';

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

const categories = [
  'All',
  'PDF Tools',
  'Image & DP Tools',
  'Privacy & Security',
  'Conversion',
] as const;

export default function BlogSection() {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filteredBlogs =
    activeCategory === 'All'
      ? blogsData
      : blogsData.filter((item) => item.category === activeCategory);

  return (
    <section id="blog-section" className="relative py-20 scroll-mt-20 overflow-hidden">
      {/* Background Atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -z-10 inset-0 overflow-hidden"
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full opacity-25 dark:opacity-15 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(124, 58, 237, 0.35) 0%, rgba(59, 130, 246, 0.20) 40%, transparent 75%)',
            filter: 'blur(120px)',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-brand-500/15 via-purple-500/15 to-indigo-500/15 text-brand-700 dark:text-brand-300 border border-brand-500/30 dark:border-brand-400/30 backdrop-blur-md shadow-xs mb-4">
            <BookOpen className="w-3.5 h-3.5 text-brand-500" />
            <span>📚 Client-Side Knowledge Base</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-zinc-900 dark:text-white mb-4 tracking-tight">
            Step-by-Step Guides &amp; Privacy Tutorials
          </h2>

          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Learn how to convert, compress, protect, and optimize files locally in your browser with zero server uploads.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            const count =
              cat === 'All'
                ? blogsData.length
                : blogsData.filter((b) => b.category === cat).length;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`relative px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-600 text-white shadow-md shadow-brand-500/25 scale-[1.02]'
                    : 'bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:border-brand-500/30 backdrop-blur-md'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-zinc-200/70 dark:bg-zinc-700/70 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Responsive 3-Column Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredBlogs.map((blog) => {
              const IconComponent = iconMap[blog.icon] || FileText;

              return (
                <motion.div
                  key={blog.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="h-full"
                >
                  <article className="glass-card p-6 sm:p-7 h-full flex flex-col justify-between rounded-3xl border border-white/80 dark:border-zinc-800/80 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300 group">
                    <div>
                      {/* Top Meta Row */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20">
                          {blog.category}
                        </span>
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {blog.readTime}
                        </span>
                      </div>

                      {/* Thumbnail or Vector Illustration Glow Box */}
                      {blog.thumbnail ? (
                        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-md group-hover:scale-[1.02] transition-transform duration-300 bg-zinc-950 flex items-center justify-center">
                          <Image
                            src={blog.thumbnail}
                            alt={blog.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className={blog.id === 'full-dp-maker' ? 'object-contain' : 'object-cover'}
                          />
                        </div>
                      ) : (
                        <div className="relative mb-5 inline-block">
                          <div
                            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${blog.accentColor} border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300`}
                          >
                            <IconComponent className="w-7 h-7 text-brand-600 dark:text-brand-400" />
                          </div>
                          <div className="absolute -inset-1 rounded-2xl bg-brand-500/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </div>
                      )}

                      {/* H3 Title */}
                      <h3 className="text-lg sm:text-xl font-bold font-display text-zinc-900 dark:text-white mb-2.5 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 leading-snug">
                        <Link href={`/blog/${blog.slug}`}>
                          {blog.title}
                        </Link>
                      </h3>

                      {/* 2-Line Summary */}
                      <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6 line-clamp-2">
                        {blog.excerpt}
                      </p>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between gap-2">
                      <Link
                        href={`/blog/${blog.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 group-hover:underline cursor-pointer"
                      >
                        <span>Read Full Guide</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>

                      <Link
                        href={blog.toolPath}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-brand-500/10 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-brand-600 dark:hover:text-brand-300 transition-all border border-transparent hover:border-brand-500/20 cursor-pointer"
                      >
                        <span>Try Tool</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </article>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
