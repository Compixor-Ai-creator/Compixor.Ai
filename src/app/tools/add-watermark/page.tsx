import React from 'react';
import PdfWatermarkClient from '../pdf-watermark/pdf-watermark-client';
import { addWatermarkFaqs } from '@/data/faqs';
import { Stamp, Shield, Layers, Sliders, CheckCircle2, Cpu } from 'lucide-react';

export default function AddWatermarkPage() {
  return (
    <div className="relative">
      {/* ── Interactive Client Tool (has its own hero header built-in) ── */}
      <main>
        <PdfWatermarkClient initialMode="add" />
      </main>

      {/* ── Static Semantic Content (How to Use, Features, FAQs) for Crawlers & A11y ── */}
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
