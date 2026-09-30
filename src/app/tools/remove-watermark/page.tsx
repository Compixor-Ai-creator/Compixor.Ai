import ToolSeoSection from "@/components/ToolSeoSection";
import React from 'react';
import PdfWatermarkClient from '@/components/PdfWatermarkClient';
import { Eraser, Shield, Sliders, Sparkles, CheckCircle2 } from 'lucide-react';

export default function RemoveWatermarkPage() {
  return (
    <div className="relative">
      {/* ── Semantic Server-Rendered Hero with Themed SVG Illustration & Animations ── */}
            {/* ── Semantic Server-Rendered Hero with Image 2 style Transformation Card & Animations ── */}
      <header className="pt-8 pb-4 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Victory / Transformation Preview Card (Watermarked PDF → Clean PDF) */}
        <div className="w-full flex justify-center mb-6 select-none pointer-events-none">
          <div className="p-3 sm:p-4 rounded-3xl bg-white/60 dark:bg-zinc-900/60 border border-amber-500/20 dark:border-amber-500/30 shadow-lg backdrop-blur-md flex items-center justify-center gap-4 sm:gap-6">
            {/* Left: Watermarked PDF (Problem) */}
            <div className="flex flex-col items-center space-y-1">
              <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl bg-red-500/10 border-2 border-dashed border-red-400 relative flex flex-col items-center justify-center p-2">
                <div className="w-10 h-13 rounded-lg bg-white dark:bg-zinc-800 shadow-sm border border-red-200 dark:border-red-900/50 flex flex-col items-center justify-between p-1.5 relative overflow-hidden">
                  <span className="text-[7.5px] font-bold text-red-500">PDF</span>
                  <div className="w-full space-y-0.5">
                    <div className="w-full h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
                    <div className="w-4/5 h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
                    <div className="w-3/5 h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
                  </div>
                  {/* Diagonal Watermark */}
                  <span className="text-[5.5px] font-black text-red-500/90 -rotate-30 uppercase tracking-widest border border-dashed border-red-400/80 px-0.5">STAMP</span>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-red-500">Watermarked</span>
            </div>

            {/* Center Arrow */}
            <div className="w-7 h-7 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-300 flex items-center justify-center font-black text-sm">
              &rarr;
            </div>

            {/* Right: Clean Unwatermarked PDF (Victory) */}
            <div className="flex flex-col items-center space-y-1">
              <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-rose-500/20 border-2 border-amber-500 relative flex flex-col items-center justify-center p-2 shadow-md">
                <div className="w-10 h-13 rounded-lg bg-white dark:bg-zinc-800 shadow-sm border border-amber-500/40 flex flex-col items-center justify-between p-1.5 relative">
                  <span className="text-[7.5px] font-bold text-emerald-600">PDF</span>
                  <div className="w-full space-y-0.5">
                    <div className="w-full h-0.5 bg-emerald-400/60 rounded" />
                    <div className="w-4/5 h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
                    <div className="w-3/5 h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
                  </div>
                  <span className="text-[6.5px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-1 rounded">Clean</span>
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[7px] font-black shadow-xs">✓</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">100% Clean</span>
            </div>
          </div>
        </div>

        {/* Animated Badge Pill */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200/60 dark:border-amber-800/40 rounded-full px-4 py-1.5 animate-float-subtle shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 tracking-wide uppercase">
            100% Client-Side · Smart Watermark Stripping &amp; Vector Redaction
          </span>
        </div>

        {/* H1 with Vibrant Red & Yellow / Amber Gradient + Floating Decorative Elements */}
        <div className="relative inline-block">
          <div className="absolute -top-3 -left-5 w-2 h-2 rounded-full bg-amber-400/80 animate-pulse" />
          <div className="absolute -top-2 -right-5 w-2 h-2 rounded-full bg-rose-500/80 animate-pulse" style={{ animationDelay: '0.6s' }} />
          <div className="absolute -bottom-1 left-1/4 w-1.5 h-1.5 rounded-full bg-orange-400/70 animate-pulse" style={{ animationDelay: '1.2s' }} />
          <Sparkles className="absolute -top-6 right-2 w-4 h-4 text-amber-400/70 animate-spin-slow" />

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-zinc-900 dark:text-white">
            Remove Watermark from PDF{' '}
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 bg-clip-text text-transparent">
              Online Free
            </span>
          </h1>
        </div>

        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Erase watermarks, logos, and stamps cleanly with intelligent text stream stripping and interactive vector redaction.
          Remove background stamps from single pages or entire documents with zero server uploads.
        </p>

        {/* Clean Keyword Badges / Tags */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-2xl mx-auto pt-2">
          {[
            'Remove Watermark',
            'PDF Stamp Eraser',
            'Vector Redaction',
            '100% In-Browser',
            'Zero Cloud Uploads',
            'Free Unlimited',
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
        <PdfWatermarkClient initialMode="remove" hideHeader={true} />
      </main>

      <ToolSeoSection toolSlug="remove-watermark" />
    </div>
  );
}
