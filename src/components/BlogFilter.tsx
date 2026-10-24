'use client';

import React, { useState } from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import { blogsData } from '@/lib/blogsData';
import BlogGrid from '@/components/BlogGrid';

const categories = [
  'All',
  'PDF Tools',
  'Image & DP Tools',
  'Privacy & Security',
  'Conversion',
] as const;

export default function BlogFilter() {
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
            Learn how to convert, compress, protect, and optimize documents and media with maximum
            privacy and speed.
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

        {/* Blog Cards Grid */}
        <BlogGrid blogs={filteredBlogs} />
      </div>
    </section>
  );
}
