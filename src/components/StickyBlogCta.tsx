'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, X, ShieldCheck } from 'lucide-react';

interface StickyBlogCtaProps {
  toolTitle: string;
  toolPath: string;
}

export default function StickyBlogCta({ toolTitle, toolPath }: StickyBlogCtaProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past 300px
      if (window.scrollY > 300 && !dismissed) {
        setVisible(true);
      } else if (window.scrollY <= 300) {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dismissed]);

  if (!visible || dismissed) return null;

  return (
    <aside
      aria-label="Launch tool callout"
      className="fixed bottom-4 inset-x-4 sm:bottom-6 sm:inset-x-auto sm:right-6 sm:max-w-md z-40 transition-all duration-300 animate-slide-up"
    >
      <div className="glass-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-brand-500/30 dark:border-brand-400/30 shadow-[0_15px_35px_-5px_rgba(124,58,237,0.35)] backdrop-blur-2xl relative overflow-hidden bg-white/95 dark:bg-zinc-900/95">
        {/* Glow Accent Beam */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-500 via-purple-500 to-indigo-500" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                100% In-Browser RAM
              </p>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1 mt-0.5">
                Ready to try {toolTitle}?
              </h4>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 mb-3.5 leading-snug">
          Zero file uploads, no watermarks, and no sign-up required. Run this tool in your browser now.
        </p>

        <div className="flex items-center gap-2">
          <Link
            href={toolPath}
            className="flex-1 btn-primary py-2.5 px-4 text-xs font-bold inline-flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <span>Launch Tool Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
