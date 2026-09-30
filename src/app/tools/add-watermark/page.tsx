import ToolSeoSection from "@/components/ToolSeoSection";
import React from 'react';
import PdfWatermarkClient from '@/components/PdfWatermarkClient';
import { Stamp, Shield, Sliders, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AddWatermarkPage() {
  return (
    <div className="relative">
      {/* ── Semantic Server-Rendered Hero with Themed SVG Illustration & Animations ── */}
            {/* ── Semantic Server-Rendered Hero with Image 2 style Transformation Card & Animations ── */}
      <header className="pt-8 pb-4 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Victory / Transformation Preview Card (Plain PDF → Branded Stamped PDF) */}
        <div className="w-full flex justify-center mb-6 select-none pointer-events-none">
          <div className="p-3 sm:p-4 rounded-3xl bg-white/60 dark:bg-zinc-900/60 border border-rose-500/20 dark:border-rose-500/30 shadow-lg backdrop-blur-md flex items-center justify-center gap-4 sm:gap-6">
            {/* Left: Plain PDF (Before) */}
            <div className="flex flex-col items-center space-y-1">
              <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border-2 border-dashed border-zinc-300 dark:border-zinc-700 relative flex flex-col items-center justify-center p-2">
                <div className="w-10 h-13 rounded-lg bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-between p-1.5">
                  <span className="text-[7.5px] font-bold text-zinc-500">PDF</span>
                  <div className="w-full space-y-0.5">
                    <div className="w-full h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
                    <div className="w-4/5 h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
                    <div className="w-3/5 h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
                  </div>
                  <span className="text-[6.5px] font-semibold text-zinc-400">Plain</span>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">Unbranded</span>
            </div>

            {/* Center Arrow */}
            <div className="w-7 h-7 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-300 flex items-center justify-center font-black text-sm">
              &rarr;
            </div>

            {/* Right: Branded Stamped PDF (Victory) */}
            <div className="flex flex-col items-center space-y-1">
              <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl bg-gradient-to-br from-rose-500/20 via-pink-500/20 to-amber-500/20 border-2 border-rose-500 relative flex flex-col items-center justify-center p-2 shadow-md">
                <div className="w-10 h-13 rounded-lg bg-white dark:bg-zinc-800 shadow-sm border border-rose-500/40 flex flex-col items-center justify-between p-1.5 relative overflow-hidden">
                  <span className="text-[7.5px] font-bold text-rose-600">PDF</span>
                  <div className="w-full space-y-0.5">
                    <div className="w-full h-0.5 bg-rose-400/60 rounded" />
                    <div className="w-4/5 h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
                    <div className="w-3/5 h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
                  </div>
                  <span className="text-[5.5px] font-black text-rose-600 -rotate-30 uppercase tracking-widest border border-rose-400 px-0.5">STAMP</span>
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[7px] font-black shadow-xs">✓</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">100% Branded</span>
            </div>
          </div>
        </div>

        {/* Animated Badge Pill */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40 border border-rose-200/60 dark:border-rose-800/40 rounded-full px-4 py-1.5 animate-float-subtle shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-spin-slow" />
          <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 tracking-wide uppercase">
            100% Client-Side · Text &amp; Logo Stamping
          </span>
        </div>

        {/* H1 with Vibrant Rose & Sunset Amber Gradient + Floating Decorative Elements */}
        <div className="relative inline-block">
          <div className="absolute -top-3 -left-5 w-2 h-2 rounded-full bg-rose-500/80 animate-pulse" />
          <div className="absolute -top-2 -right-5 w-1.5 h-1.5 rounded-full bg-amber-400/80 animate-pulse" style={{ animationDelay: '0.6s' }} />
          <div className="absolute -bottom-1 left-1/4 w-1.5 h-1.5 rounded-full bg-pink-400/70 animate-pulse" style={{ animationDelay: '1.2s' }} />
          <Sparkles className="absolute -top-6 right-2 w-4 h-4 text-rose-400/70 animate-spin-slow" />

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-zinc-900 dark:text-white">
            Add Watermark to PDF{' '}
            <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 bg-clip-text text-transparent">
              Online Free
            </span>
          </h1>
        </div>

        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Add custom vector text stamps or transparent PNG logo watermarks across all pages or custom page ranges.
          Full control over opacity, rotation, font style, and precise positioning with zero server uploads.
        </p>

        {/* Clean Keyword Badges / Tags */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-2xl mx-auto pt-2">
          {[
            'Add Watermark',
            'PDF Text Stamp',
            'Logo Watermark',
            'Opacity Control',
            '100% In-Browser',
            'Zero Cloud Uploads',
          ].map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-white/70 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/60 backdrop-blur-sm text-zinc-700 dark:text-zinc-300 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* ── Interactive Client Tool (hideHeader suppresses duplicate inner header) ── */}
      <main>
        <PdfWatermarkClient initialMode="add" hideHeader={true} />
      </main>

      <ToolSeoSection toolSlug="add-watermark" />
    </div>
  );
}
