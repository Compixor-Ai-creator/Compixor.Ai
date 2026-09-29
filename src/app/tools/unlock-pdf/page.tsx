import React from 'react';
import UnlockPdfClient from '@/components/UnlockPdfClient';
import { unlockPdfFaqs } from '@/data/faqs';
import { Shield, Unlock, FileCheck, KeyRound, Cpu, Lock } from 'lucide-react';

export default function UnlockPdfPage() {
  return (
    <div className="relative">
      {/* ── Semantic Server-Rendered Hero for SEO & Crawlers ── */}
      <header className="pt-8 pb-4 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 rounded-full px-4 py-1.5 mb-4">
          <Shield className="w-3.5 h-3.5 text-purple-500" />
          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 tracking-wide uppercase">
            100% Client-Side · Private In-Browser Decryption
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
          Unlock PDF{' '}
          <span className="bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">
            &amp; Remove Password
          </span>
        </h1>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Remove password security and permission restrictions from your encrypted PDF documents. Decrypt your files instantly in your browser without transmitting any sensitive data over the internet.
        </p>
      </header>

      {/* ── Interactive Client Tool ── */}
      <main>
        <UnlockPdfClient />
      </main>

      {/* ── Static Semantic Content (How to Use, Features, FAQs) for Crawlers & A11y ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-16">
        {/* How It Works Steps */}
        <section aria-labelledby="how-to-unlock-heading">
          <h2 id="how-to-unlock-heading" className="text-2xl font-bold font-display text-zinc-900 dark:text-white mb-2 text-center">
            How to Unlock and Remove PDF Passwords
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-8">
            Fast, secure, and completed entirely within your browser
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                step: '1',
                title: 'Upload Locked PDF',
                desc: 'Select or drag and drop your password-protected PDF document into the browser.',
              },
              {
                step: '2',
                title: 'Enter Password',
                desc: 'Type the document password to authenticate and unlock encrypted streams.',
              },
              {
                step: '3',
                title: 'Download Unrestricted',
                desc: 'Save your clean, unrestricted PDF file ready for editing, printing, and sharing.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="glass-card rounded-2xl p-5 border border-zinc-200/70 dark:border-zinc-800/60 text-center">
                <span className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-xs inline-flex items-center justify-center mb-3">
                  {step}
                </span>
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-1">{title}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Security Features */}
        <section aria-labelledby="unlock-features-heading">
          <h2 id="unlock-features-heading" className="text-2xl font-bold font-display text-zinc-900 dark:text-white mb-6 text-center">
            Enterprise Privacy &amp; Performance
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="glass-card p-5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/60">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3">
                <Unlock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 mb-1.5">Remove All Restrictions</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Cleans the /Encrypt dictionary in-place, removing printing limits, copy blocks, and editing locks for permanent unrestricted access.
              </p>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/60">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 mb-1.5">Zero Remote Transmission</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Unlike online converters that require uploading confidential files to third-party clouds, Compixor decrypts directly in your device RAM.
              </p>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/60">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 mb-1.5">100% Quality Preserved</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Text, vector shapes, embedded high-res images, links, and formatting remain byte-for-byte identical after decryption.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section aria-labelledby="unlock-faqs-heading">
          <h2 id="unlock-faqs-heading" className="text-2xl font-bold font-display text-zinc-900 dark:text-white mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {unlockPdfFaqs.map((faq, i) => (
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
