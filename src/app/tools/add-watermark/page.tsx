import React from 'react';
import PdfWatermarkClient from '../pdf-watermark/pdf-watermark-client';
import { addWatermarkFaqs } from '@/data/faqs';
import { Stamp, Shield, Sliders, Sparkles } from 'lucide-react';

export default function AddWatermarkPage() {
  return (
    <div className="relative">
      {/* ── Semantic Server-Rendered Hero with Themed SVG Illustration & Animations ── */}
      <header className="pt-8 pb-4 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Animated Badge Pill */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40 border border-rose-200/60 dark:border-rose-800/40 rounded-full px-4 py-1.5 animate-float-subtle shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-spin-slow" />
          <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 tracking-wide uppercase">
            100% Client-Side · Text &amp; Logo Stamping
          </span>
        </div>

        {/* H1 with Vibrant Rose & Sunset Amber Gradient + Floating Decorative Elements */}
        <div className="relative inline-block">
          {/* Animated floating particles around title */}
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

        {/* ── Visual Conversion Flow Illustration (Clean PDF → Stamp → Watermarked PDF) ── */}
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
                <filter id="addwm-shadow" x="-50%" y="-50%" width="200%" height="200%">
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
                <linearGradient id="addwm-rose" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#F43F5E" />
                  <stop offset="100%" stopColor="#E11D48" />
                </linearGradient>
                <linearGradient id="addwm-gold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FB7185" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>

              {/* Left Sheet: Plain PDF */}
              <g transform="translate(130, 85) rotate(-4)">
                <g filter="url(#addwm-shadow)">
                  <rect
                    x="-42"
                    y="-55"
                    width="84"
                    height="110"
                    rx="12"
                    fill="#FFFFFF"
                    stroke="#E2E8F0"
                    strokeWidth="1.5"
                  />
                </g>
                <rect x="-30" y="-41" width="32" height="15" rx="4" fill="#94A3B8" />
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
                <rect x="-30" y="36" width="60" height="9" rx="2.5" fill="#F1F5F9" />
              </g>

              {/* Connecting Track with Stamp Icon */}
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
                <rect x="-6" y="-6" width="12" height="6" rx="2" fill="url(#addwm-rose)" />
                <rect x="-4" y="0" width="8" height="4" rx="1" fill="#E2E8F0" />
                <rect x="-7" y="4" width="14" height="3" rx="1" fill="url(#addwm-rose)" />
              </g>

              {/* Right Sheet: Stamped / Watermarked PDF */}
              <g transform="translate(270, 85) rotate(4)">
                <g filter="url(#addwm-shadow)">
                  <rect
                    x="-42"
                    y="-55"
                    width="84"
                    height="110"
                    rx="12"
                    fill="#FFFFFF"
                    stroke="#FECDD3"
                    strokeWidth="1.5"
                  />
                </g>
                <rect x="-30" y="-41" width="32" height="15" rx="4" fill="url(#addwm-rose)" />
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

                {/* Diagonal Branded Stamp Overlay */}
                <g transform="rotate(-30)">
                  <rect x="-32" y="-7" width="64" height="14" rx="3" fill="#FFE4E6" stroke="#F43F5E" strokeWidth="0.8" />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="#F43F5E"
                    fontSize="7"
                    fontWeight="black"
                    letterSpacing="0.8"
                    fontFamily="system-ui, sans-serif"
                  >
                    CONFIDENTIAL
                  </text>
                </g>

                {/* Stamped Badge */}
                <circle cx="28" cy="-48" r="8" fill="#F43F5E" />
                <path d="M24.5 -48 L27 -45.5 L31.5 -50.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </svg>
          </div>

          {/* Clean Keyword Badges / Tags (No '#' prefix) */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-2xl mt-1">
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
                className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-800"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ── Interactive Client Tool (hideHeader suppresses duplicate inner header) ── */}
      <main>
        <PdfWatermarkClient initialMode="add" hideHeader={true} />
      </main>

      {/* ── Static Semantic Content (How to Use, Features, FAQs) ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-16">
        {/* How It Works Steps */}
        <section aria-labelledby="add-watermark-how-heading">
          <h2 id="add-watermark-how-heading" className="text-2xl font-bold font-display text-zinc-900 dark:text-white mb-2 text-center">
            How to Add a Watermark to a PDF File
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-8">
            Simple 4-step workflow running 100% locally in your browser memory
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                step: '1',
                title: 'Upload PDF',
                desc: 'Select or drag and drop your PDF into the secure client canvas.',
              },
              {
                step: '2',
                title: 'Configure Watermark',
                desc: 'Choose Text or Image mode. Enter text or upload your logo.',
              },
              {
                step: '3',
                title: 'Position & Opacity',
                desc: 'Adjust rotation, transparency, font size, and choose single, range, or all pages.',
              },
              {
                step: '4',
                title: 'Download Stamped PDF',
                desc: 'Save your watermarked PDF instantly with zero server wait times.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="glass-card rounded-2xl p-5 border border-zinc-200/70 dark:border-zinc-800/60 text-center">
                <span className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs inline-flex items-center justify-center mb-3">
                  {step}
                </span>
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-1">{title}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section aria-labelledby="watermark-features-heading">
          <h2 id="watermark-features-heading" className="text-2xl font-bold font-display text-zinc-900 dark:text-white mb-6 text-center">
            Professional PDF Stamping Engine
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="glass-card p-5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/60">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-3">
                <Stamp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 mb-1.5">Text &amp; Image Logos</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Stamp confidential notices, draft markers, dates, or full company transparent PNG logos with vector-level precision.
              </p>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/60">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 mb-1.5">Live Interactive Preview</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                See real-time canvas rendering of your exact PDF pages before exporting, ensuring the placement and opacity are perfect.
              </p>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/60">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 mb-1.5">100% Client-Side Privacy</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Documents are embedded and rendered directly in your browser memory using local WebAssembly. Zero files are uploaded.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section aria-labelledby="watermark-faqs-heading">
          <h2 id="watermark-faqs-heading" className="text-2xl font-bold font-display text-zinc-900 dark:text-white mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {addWatermarkFaqs.map((faq, i) => (
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
