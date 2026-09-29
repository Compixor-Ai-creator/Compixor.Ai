import React from 'react';
import PdfWatermarkClient from '../pdf-watermark/pdf-watermark-client';
import { removeWatermarkFaqs } from '@/data/faqs';
import { Eraser, Shield, Layers, Sliders, CheckCircle2, Cpu } from 'lucide-react';

export default function RemoveWatermarkPage() {
  return (
    <div className="relative">
      {/* ── Interactive Client Tool (has its own hero header built-in) ── */}
      <main>
        <PdfWatermarkClient initialMode="remove" />
      </main>

      {/* ── Static Semantic Content (How to Use, Features, FAQs) for Crawlers & A11y ── */}
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
