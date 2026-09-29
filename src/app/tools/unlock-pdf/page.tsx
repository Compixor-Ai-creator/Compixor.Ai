import React from 'react';
import UnlockPdfClient from '@/components/UnlockPdfClient';
import { unlockPdfFaqs } from '@/data/faqs';
import { Shield, Unlock, FileCheck, KeyRound, Cpu, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

export default function UnlockPdfPage() {
  return (
    <div className="relative">
      {/* ── Semantic Server-Rendered Hero for SEO & Crawlers ── */}
            {/* ── Semantic Server-Rendered Hero with Image 2 style Transformation Card & Animations ── */}
      <header className="pt-8 pb-4 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Victory / Transformation Preview Card (Password-Locked PDF → Unlocked PDF) */}
        <div className="w-full flex justify-center mb-6 select-none pointer-events-none">
          <div className="p-3 sm:p-4 rounded-3xl bg-white/60 dark:bg-zinc-900/60 border border-emerald-500/20 dark:border-emerald-500/30 shadow-lg backdrop-blur-md flex items-center justify-center gap-4 sm:gap-6">
            {/* Left: Password Locked PDF (Problem) */}
            <div className="flex flex-col items-center space-y-1">
              <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl bg-red-500/10 border-2 border-dashed border-red-400 relative flex flex-col items-center justify-center p-2">
                <div className="w-10 h-13 rounded-lg bg-white dark:bg-zinc-800 shadow-sm border border-red-200 dark:border-red-900/50 flex flex-col items-center justify-between p-1.5 relative">
                  <span className="text-[7.5px] font-bold text-red-500">PDF</span>
                  <div className="w-full space-y-0.5">
                    <div className="w-full h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
                    <div className="w-4/5 h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
                    <div className="w-3/5 h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
                  </div>
                  <span className="text-[6.5px] font-bold text-red-600 bg-red-100 dark:bg-red-950/60 px-1 rounded">Locked</span>
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white flex items-center justify-center text-[7px] font-black shadow-xs">🔒</div>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-red-500">Password Locked</span>
            </div>

            {/* Center Arrow */}
            <div className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-black text-sm">
              &rarr;
            </div>

            {/* Right: 100% Unlocked PDF (Victory) */}
            <div className="flex flex-col items-center space-y-1">
              <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border-2 border-emerald-500 relative flex flex-col items-center justify-center p-2 shadow-md">
                <div className="w-10 h-13 rounded-lg bg-white dark:bg-zinc-800 shadow-sm border border-emerald-500/40 flex flex-col items-center justify-between p-1.5 relative">
                  <span className="text-[7.5px] font-bold text-emerald-600">PDF</span>
                  <div className="w-full space-y-0.5">
                    <div className="w-full h-0.5 bg-emerald-400/60 rounded" />
                    <div className="w-4/5 h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
                    <div className="w-3/5 h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
                  </div>
                  <span className="text-[6.5px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-1 rounded">Unlocked</span>
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[7px] font-black shadow-xs">✓</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">100% Unlocked</span>
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200/60 dark:border-emerald-800/40 rounded-full px-4 py-1.5 mb-4 animate-float-subtle shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-spin-slow" />
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 tracking-wide uppercase">
            100% Client-Side · Private In-Browser Decryption
          </span>
        </div>

        {/* H1 with Vibrant Emerald-Teal-Cyan Gradient + Floating Particles */}
        <div className="relative inline-block mb-4">
          <div className="absolute -top-3 -left-5 w-2 h-2 rounded-full bg-emerald-400/80 animate-pulse" />
          <div className="absolute -top-2 -right-5 w-1.5 h-1.5 rounded-full bg-cyan-400/80 animate-pulse" style={{ animationDelay: '0.6s' }} />
          <div className="absolute -bottom-1 left-1/3 w-1.5 h-1.5 rounded-full bg-teal-400/70 animate-pulse" style={{ animationDelay: '1.2s' }} />
          <Sparkles className="absolute -top-6 right-1 w-4 h-4 text-emerald-400/70 animate-spin-slow" />

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-zinc-900 dark:text-white tracking-tight">
            Unlock PDF{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              &amp; Remove Password
            </span>
          </h1>
        </div>

        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-5">
          Remove password security and permission restrictions from your encrypted PDF documents. Decrypt your files instantly in your browser without transmitting any sensitive data over the internet.
        </p>

        {/* Clean Keyword Badges / Tags */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-2xl mx-auto">
          {[
            'Unlock PDF',
            'Remove Restrictions',
            'Strip Password',
            'Local Decryption',
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
