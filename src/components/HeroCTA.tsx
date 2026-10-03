'use client';

import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';

export default function HeroCTA() {
  const handleScrollToBlog = (e: React.MouseEvent) => {
    e.preventDefault();
    const blogSection = document.getElementById('blog-section');
    if (blogSection) {
      blogSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToTools = (e: React.MouseEvent) => {
    e.preventDefault();
    const toolsSection = document.getElementById('tools');
    if (toolsSection) {
      toolsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-6">
      {/* Primary CTA Button */}
      <a
        href="#tools"
        onClick={handleScrollToTools}
        className="relative inline-flex items-center justify-center gap-2.5 text-base sm:text-lg px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-600 shadow-[0_12px_32px_-4px_rgba(124,58,237,0.45)] hover:shadow-[0_18px_45px_-4px_rgba(124,58,237,0.65)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 group overflow-hidden cursor-pointer"
      >
        <span className="relative z-10">Start Now — Make Your Life Easy</span>
        <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1.5 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
      </a>

      {/* Secondary CTA Button (Glassmorphic) */}
      <button
        type="button"
        onClick={handleScrollToBlog}
        className="bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl px-7 py-3.5 font-semibold hover:border-purple-500 hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:-translate-y-0.5 active:translate-y-0 text-base"
      >
        <span>Explore Guides & Blogs 📖</span>
      </button>
    </div>
  );
}
