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
        {/* Decorative floating elements */}
        <div className="relative inline-block mb-2" aria-hidden="true">
          <div className="absolute -top-3 -left-4 w-2 h-2 rounded-full bg-purple-400/60 animate-pulse" style={{animationDelay: '0.3s'}} />
          <div className="absolute -top-1 -right-3 w-1.5 h-1.5 rounded-full bg-indigo-400/70 animate-pulse" style={{animationDelay: '0.8s'}} />
          <div className="absolute -bottom-2 left-1/4 w-1.5 h-1.5 rounded-full bg-purple-300/60 animate-pulse" style={{animationDelay: '1.3s'}} />
          <svg className="absolute -top-5 right-0 w-4 h-4 text-purple-400/60 animate-spin" style={{animationDuration:'8s'}} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L13.09 8.26L19 7L15.45 12L19 17L13.09 15.74L12 22L10.91 15.74L5 17L8.55 12L5 7L10.91 8.26L12 2Z" />
          </svg>
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
        {/* ── Unlock Flow Illustration ── */}
        <div className="w-full flex flex-col items-center justify-center pt-3 pb-2 select-none pointer-events-none">
          <div className="w-full max-w-sm h-28 sm:h-36 flex items-center justify-center drop-shadow-sm">
            <svg viewBox="0 0 400 150" fill="none" xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full max-w-[360px]" aria-hidden="true">
              <defs>
                <filter id="unlock-shad" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
                  <feOffset dx="0" dy="5" result="offsetblur" />
                  <feComponentTransfer><feFuncA type="linear" slope="0.08" /></feComponentTransfer>
                  <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <linearGradient id="unlock-purple" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#6366F1" />
                </linearGradient>
                <linearGradient id="unlock-pdf" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#EF4444" /><stop offset="100%" stopColor="#DC2626" />
                </linearGradient>
              </defs>
              {/* Locked PDF (before) */}
              <g transform="translate(110, 75) rotate(-3)" filter="url(#unlock-shad)">
                <rect x="-44" y="-58" width="88" height="116" rx="11" fill="#FFFFFF" stroke="#DDD6FE" strokeWidth="1.5" />
                <rect x="-32" y="-44" width="34" height="15" rx="3" fill="url(#unlock-pdf)" />
                <text x="-15" y="-33" textAnchor="middle" fill="#FFFFFF" fontSize="7.5" fontWeight="bold" fontFamily="system-ui">PDF</text>
                <rect x="-32" y="-18" width="64" height="4" rx="2" fill="#EEE" />
                <rect x="-32" y="-6" width="50" height="4" rx="2" fill="#EEE" />
                <rect x="-32" y="6" width="58" height="4" rx="2" fill="#EEE" />
                <rect x="-32" y="28" width="64" height="12" rx="3" fill="#F3F0FF" stroke="#C4B5FD" strokeWidth="1" />
                <rect x="-9" y="31" width="18" height="8" rx="2" fill="url(#unlock-purple)" />
                <path d="M -5 31 L -5 28 C -5 25.5 5 25.5 5 28 L 5 31" fill="none" stroke="url(#unlock-purple)" strokeWidth="1.8" strokeLinecap="round" />
              </g>
              {/* Arrow with key */}
              <g transform="translate(200, 75)">
                <path d="M -38 0 L 38 0" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" fill="none" />
                <circle cx="0" cy="0" r="16" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" filter="url(#unlock-shad)" />
                <circle cx="-2" cy="-1" r="4" fill="none" stroke="url(#unlock-purple)" strokeWidth="2" />
                <path d="M 2 -1 L 8 -1 M 7 -1 L 7 2 M 5 -1 L 5 1.5" fill="none" stroke="url(#unlock-purple)" strokeWidth="1.8" strokeLinecap="round" />
              </g>
              {/* Unlocked PDF (after) */}
              <g transform="translate(290, 75) rotate(3)" filter="url(#unlock-shad)">
                <rect x="-44" y="-58" width="88" height="116" rx="11" fill="#FFFFFF" stroke="#BBF7D0" strokeWidth="1.5" />
                <rect x="-32" y="-44" width="34" height="15" rx="3" fill="url(#unlock-purple)" />
                <text x="-15" y="-33" textAnchor="middle" fill="#FFFFFF" fontSize="7.5" fontWeight="bold" fontFamily="system-ui">PDF</text>
                <rect x="7" y="-41" width="22" height="6" rx="3" fill="#E2E8F0" />
                <rect x="-32" y="-18" width="64" height="4" rx="2" fill="#E2E8F0" />
                <rect x="-32" y="-6" width="50" height="4" rx="2" fill="#E2E8F0" />
                <rect x="-32" y="6" width="58" height="4" rx="2" fill="#E2E8F0" />
                <rect x="-32" y="18" width="40" height="4" rx="2" fill="#E2E8F0" />
                <rect x="-32" y="29" width="64" height="12" rx="3" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="1" />
                <text x="0" y="39" textAnchor="middle" fill="#16A34A" fontSize="6.5" fontWeight="bold" fontFamily="system-ui">UNLOCKED ✓</text>
                <circle cx="22" cy="-52" r="8" fill="#22C55E" />
                <path d="M18.5 -52 L21 -49 L25.5 -55" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </svg>
          </div>
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
