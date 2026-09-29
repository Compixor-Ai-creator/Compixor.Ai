import React from 'react';
import PdfWatermarkClient from '../pdf-watermark/pdf-watermark-client';
import { removeWatermarkFaqs } from '@/data/faqs';
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

      {/* ── Static Semantic Content (How to Use, Features, FAQs) ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-16">
        {/* How It Works Steps */}
        <section aria-labelledby="remove-watermark-how-heading">
          <h2 id="remove-watermark-how-heading" className="text-2xl font-bold font-display text-zinc-900 dark:text-white mb-2 text-center">
            How to Remove Watermarks from a PDF File
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-8">
            Fast, clean, and completed entirely within your browser memory
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                step: '1',
                title: 'Upload PDF',
                desc: 'Select or drag and drop your watermarked PDF into the local canvas.',
              },
              {
                step: '2',
                title: 'Detect Watermarks',
                desc: 'Automatic scanner finds embedded watermark layers and stamp annotations.',
              },
              {
                step: '3',
                title: 'Erase or Redact',
                desc: 'One-click strip removes identified watermark layers, or draw a box to redact.',
              },
              {
                step: '4',
                title: 'Download Clean PDF',
                desc: 'Save your cleaned, watermark-free PDF instantly with original text quality.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="glass-card rounded-2xl p-5 border border-zinc-200/70 dark:border-zinc-800/60 text-center">
                <span className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs inline-flex items-center justify-center mb-3">
                  {step}
                </span>
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-1">{title}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section aria-labelledby="remove-features-heading">
          <h2 id="remove-features-heading" className="text-2xl font-bold font-display text-zinc-900 dark:text-white mb-6 text-center">
            Precision PDF Watermark Cleaner
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="glass-card p-5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/60">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                <Eraser className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 mb-1.5">Stream-Level Removal</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Strips raw watermark operators directly from PDF content streams rather than smudging or blurring pixels.
              </p>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/60">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 mb-1.5">Interactive Box Redaction</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Click and drag to redact custom stamp boxes with exact coordinate matching across single or all pages.
              </p>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/60">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 mb-1.5">100% Private Execution</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                All byte modifications happen entirely in your local browser sandbox. No file is ever transmitted over the network.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section aria-labelledby="remove-faqs-heading">
          <h2 id="remove-faqs-heading" className="text-2xl font-bold font-display text-zinc-900 dark:text-white mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {removeWatermarkFaqs.map((faq, i) => (
              <div key={i} className="glass-card p-5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/60">
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                  {faq.q}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
