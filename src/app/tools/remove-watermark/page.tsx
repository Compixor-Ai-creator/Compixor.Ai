import React from 'react';
import PdfWatermarkClient from '../pdf-watermark/pdf-watermark-client';
import { removeWatermarkFaqs } from '@/data/faqs';
import { Eraser, Shield, Sliders, Sparkles, CheckCircle2 } from 'lucide-react';

export default function RemoveWatermarkPage() {
  return (
    <div className="relative">
      {/* ── Semantic Server-Rendered Hero with Themed SVG Illustration & Animations ── */}
      <header className="pt-8 pb-4 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Animated Badge Pill */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200/60 dark:border-amber-800/40 rounded-full px-4 py-1.5 animate-float-subtle shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 tracking-wide uppercase">
            100% Client-Side · Smart Watermark Stripping &amp; Vector Redaction
          </span>
        </div>

        {/* H1 with Vibrant Red & Yellow / Amber Gradient + Floating Decorative Elements */}
        <div className="relative inline-block">
          {/* Animated floating particles around title */}
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

        {/* ── Visual Conversion Flow Illustration (Watermarked PDF → Eraser → Clean PDF) ── */}
        <div className="w-full flex flex-col items-center justify-center pt-2 select-none pointer-events-none">
          <div className="w-full max-w-sm h-32 sm:h-40 flex items-center justify-center drop-shadow-sm">
            <svg
              viewBox="0 0 400 170"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full max-w-[360px]"
              aria-hidden="true"
            >
              <defs>
                <filter id="wm-shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
                  <feOffset dx="0" dy="6" result="offsetblur" />
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.08" />
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="wm-gold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#E11D48" />
                </linearGradient>
                <linearGradient id="wm-pdf-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="100%" stopColor="#DC2626" />
                </linearGradient>
                <linearGradient id="wm-clean-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>

              {/* Left Sheet: Watermarked PDF */}
              <g transform="translate(130, 85) rotate(-4)">
                <g filter="url(#wm-shadow)">
                  <rect
                    x="-42"
                    y="-55"
                    width="84"
                    height="110"
                    rx="12"
                    fill="#FFFFFF"
                    stroke="#FDE68A"
                    strokeWidth="1.5"
                  />
                </g>
                <rect x="-30" y="-41" width="32" height="15" rx="4" fill="url(#wm-pdf-grad)" />
                <text
                  x="-14"
                  y="-30.5"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="7.5"
                  fontWeight="bold"
                  fontFamily="system-ui, sans-serif"
                >
                  PDF
                </text>
                <rect x="8" y="-36.5" width="22" height="6" rx="3" fill="#E2E8F0" />
                <rect x="-30" y="-12" width="60" height="4" rx="2" fill="#E2E8F0" />
                <rect x="-30" y="0" width="46" height="4" rx="2" fill="#E2E8F0" />
                <rect x="-30" y="12" width="54" height="4" rx="2" fill="#E2E8F0" />
                <rect x="-30" y="24" width="38" height="4" rx="2" fill="#E2E8F0" />

                {/* Diagonal Watermark Stamp */}
                <g transform="rotate(-30)">
                  <rect x="-32" y="-7" width="64" height="14" rx="3" fill="#FEE2E2" stroke="#EF4444" strokeWidth="0.8" strokeDasharray="2 2" />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="#EF4444"
                    fontSize="7"
                    fontWeight="black"
                    letterSpacing="0.8"
                    fontFamily="system-ui, sans-serif"
                  >
                    WATERMARK
                  </text>
                </g>
              </g>

              {/* Connecting Track with Eraser Icon */}
              <g transform="translate(200, 85)">
                <path
                  d="M -36 0 L 36 0"
                  stroke="#CBD5E1"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="0" cy="0" r="15" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
                <path
                  d="M -5 3 L 2 -4 L 6 0 L -1 7 L -5 7 Z"
                  fill="#F59E0B"
                  stroke="#D97706"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                <path d="M 0 5 L 4 1" stroke="#FFFFFF" strokeWidth="1" />
              </g>

              {/* Right Sheet: Clean Unwatermarked PDF */}
              <g transform="translate(270, 85) rotate(4)">
                <g filter="url(#wm-shadow)">
                  <rect
                    x="-42"
                    y="-55"
                    width="84"
                    height="110"
                    rx="12"
                    fill="#FFFFFF"
                    stroke="#A7F3D0"
                    strokeWidth="1.5"
                  />
                </g>
                <rect x="-30" y="-41" width="32" height="15" rx="4" fill="url(#wm-clean-grad)" />
                <text
                  x="-14"
                  y="-30.5"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="7.5"
                  fontWeight="bold"
                  fontFamily="system-ui, sans-serif"
                >
                  PDF
                </text>
                <rect x="8" y="-36.5" width="22" height="6" rx="3" fill="#E2E8F0" />
                <rect x="-30" y="-12" width="60" height="4" rx="2" fill="#E2E8F0" />
                <rect x="-30" y="0" width="50" height="4" rx="2" fill="#E2E8F0" />
                <rect x="-30" y="12" width="56" height="4" rx="2" fill="#E2E8F0" />
                <rect x="-30" y="24" width="40" height="4" rx="2" fill="#E2E8F0" />
                <rect x="-30" y="36" width="60" height="9" rx="2.5" fill="#DCFCE7" />

                {/* Verified Clean Badge */}
                <circle cx="28" cy="-48" r="8" fill="#10B981" />
                <path d="M24.5 -48 L27 -45.5 L31.5 -50.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </svg>
          </div>

          {/* Clean Keyword Badges / Tags (No '#' prefix) */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-2xl mt-1">
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
