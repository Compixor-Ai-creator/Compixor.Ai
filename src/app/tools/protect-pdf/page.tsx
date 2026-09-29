import React from 'react';
import ProtectPdfClient from '@/components/ProtectPdfClient';
import { protectPdfFaqs } from '@/data/faqs';
import { Shield, Lock, FileCheck, KeyRound, Cpu, EyeOff, Sparkles } from 'lucide-react';

export default function ProtectPdfPage() {
  return (
    <div className="relative">
      {/* ── Semantic Server-Rendered Hero for SEO & Crawlers ── */}
      <header className="pt-8 pb-4 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200/60 dark:border-indigo-800/40 rounded-full px-4 py-1.5 mb-4 animate-float-subtle shadow-xs">
          <Shield className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 tracking-wide uppercase">
            100% Client-Side · Military-Grade AES-256
          </span>
        </div>

        {/* H1 with Vibrant Indigo-Purple-Pink Gradient + Floating Particles */}
        <div className="relative inline-block mb-4">
          <div className="absolute -top-3 -left-5 w-2 h-2 rounded-full bg-indigo-400/80 animate-pulse" />
          <div className="absolute -top-2 -right-5 w-1.5 h-1.5 rounded-full bg-purple-500/80 animate-pulse" style={{ animationDelay: '0.6s' }} />
          <div className="absolute -bottom-1 left-1/3 w-1.5 h-1.5 rounded-full bg-pink-400/70 animate-pulse" style={{ animationDelay: '1.2s' }} />
          <Sparkles className="absolute -top-6 right-1 w-4 h-4 text-indigo-400/70 animate-spin-slow" />

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-zinc-900 dark:text-white tracking-tight">
            Password Protect PDF{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Online Free
            </span>
          </h1>
        </div>

        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Encrypt your PDF documents with standard AES-256 encryption. Set open passwords, permission restrictions (printing, copying, and editing), and protect sensitive records directly in your browser without uploading files to any remote server.
        </p>
        {/* ── Security Flow Illustration ── */}
        <div className="w-full flex flex-col items-center justify-center pt-3 pb-2 select-none pointer-events-none">
          <div className="w-full max-w-sm h-28 sm:h-36 flex items-center justify-center drop-shadow-sm">
            <svg viewBox="0 0 400 150" fill="none" xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full max-w-[360px]" aria-hidden="true">
              <defs>
                <filter id="sec-shad" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
                  <feOffset dx="0" dy="5" result="offsetblur" />
                  <feComponentTransfer><feFuncA type="linear" slope="0.08" /></feComponentTransfer>
                  <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <linearGradient id="sec-indigo" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6366F1" /><stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
                <linearGradient id="sec-pdf" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#EF4444" /><stop offset="100%" stopColor="#DC2626" />
                </linearGradient>
              </defs>
              {/* Open PDF (before) */}
              <g transform="translate(110, 75) rotate(-3)" filter="url(#sec-shad)">
                <rect x="-44" y="-58" width="88" height="116" rx="11" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
                <rect x="-32" y="-44" width="34" height="15" rx="3" fill="url(#sec-pdf)" />
                <text x="-15" y="-33" textAnchor="middle" fill="#FFFFFF" fontSize="7.5" fontWeight="bold" fontFamily="system-ui">PDF</text>
                <rect x="7" y="-41" width="22" height="6" rx="3" fill="#E2E8F0" />
                <rect x="-32" y="-18" width="64" height="4" rx="2" fill="#E2E8F0" />
                <rect x="-32" y="-6" width="50" height="4" rx="2" fill="#E2E8F0" />
                <rect x="-32" y="6" width="58" height="4" rx="2" fill="#E2E8F0" />
                <rect x="-32" y="18" width="40" height="4" rx="2" fill="#E2E8F0" />
                <rect x="-32" y="30" width="64" height="10" rx="2.5" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
                <text x="0" y="39" textAnchor="middle" fill="#94A3B8" fontSize="6.5" fontWeight="bold" fontFamily="system-ui">UNLOCKED</text>
              </g>
              {/* Arrow with lock */}
              <g transform="translate(200, 75)">
                <path d="M -38 0 L 38 0" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" fill="none" />
                <circle cx="0" cy="0" r="16" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" filter="url(#sec-shad)" />
                <rect x="-5" y="-2" width="10" height="8" rx="2" fill="url(#sec-indigo)" />
                <path d="M -3 -2 L -3 -5 C -3 -7.5 3 -7.5 3 -5 L 3 -2" fill="none" stroke="url(#sec-indigo)" strokeWidth="1.8" strokeLinecap="round" />
              </g>
              {/* Locked PDF (after) */}
              <g transform="translate(290, 75) rotate(3)" filter="url(#sec-shad)">
                <rect x="-44" y="-58" width="88" height="116" rx="11" fill="#FFFFFF" stroke="#C7D2FE" strokeWidth="1.5" />
                <rect x="-32" y="-44" width="34" height="15" rx="3" fill="url(#sec-indigo)" />
                <text x="-15" y="-33" textAnchor="middle" fill="#FFFFFF" fontSize="7.5" fontWeight="bold" fontFamily="system-ui">PDF</text>
                <rect x="7" y="-41" width="22" height="6" rx="3" fill="#E2E8F0" />
                <rect x="-32" y="-18" width="64" height="4" rx="2" fill="#E8E8F0" />
                <rect x="-32" y="-6" width="50" height="4" rx="2" fill="#E8E8F0" />
                <rect x="-32" y="6" width="58" height="4" rx="2" fill="#E8E8F0" />
                <rect x="-32" y="18" width="40" height="4" rx="2" fill="#E8E8F0" />
                <rect x="-32" y="29" width="64" height="12" rx="3" fill="#EEF2FF" stroke="#A5B4FC" strokeWidth="1" />
                <rect x="-9" y="32" width="18" height="8" rx="2" fill="url(#sec-indigo)" />
                <path d="M -5 32 L -5 29 C -5 26.5 5 26.5 5 29 L 5 32" fill="none" stroke="url(#sec-indigo)" strokeWidth="1.8" strokeLinecap="round" />
                <text x="12" y="39" textAnchor="middle" fill="#6366F1" fontSize="5.5" fontWeight="bold" fontFamily="system-ui">AES-256</text>
                <circle cx="22" cy="-52" r="8" fill="#22C55E" />
                <path d="M18.5 -52 L21 -49 L25.5 -55" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </svg>
          </div>

          {/* Clean Keyword Badges / Tags (No '#' prefix) */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-2xl mx-auto mt-2">
            {[
              'AES-256 Encryption',
              'Password Protect',
              'Permissions Control',
              'Offline Security',
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

      {/* ── Interactive Client Tool ── */}
      <main>
        <ProtectPdfClient />
      </main>

      {/* ── Static Semantic Content (How to Use, Features, FAQs) for Crawlers & A11y ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-16">
        {/* How It Works Steps */}
        <section aria-labelledby="how-it-works-heading">
          <h2 id="how-it-works-heading" className="text-2xl font-bold font-display text-zinc-900 dark:text-white mb-2 text-center">
            How to Password Protect a PDF File
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-8">
            Simple 4-step workflow running 100% locally in your browser memory
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                step: '1',
                title: 'Select PDF',
                desc: 'Upload or drag and drop your PDF into the secure client canvas.',
              },
              {
                step: '2',
                title: 'Set Passwords',
                desc: 'Choose an Open Password for viewing and an Owner Password for permissions.',
              },
              {
                step: '3',
                title: 'Set Permissions',
                desc: 'Toggle restrictions to forbid unauthorized printing, text copying, or editing.',
              },
              {
                step: '4',
                title: 'Download Encrypted',
                desc: 'Save your AES-256 protected PDF instantly with zero server wait times.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="glass-card rounded-2xl p-5 border border-zinc-200/70 dark:border-zinc-800/60 text-center">
                <span className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs inline-flex items-center justify-center mb-3">
                  {step}
                </span>
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-1">{title}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Security Features */}
        <section aria-labelledby="features-heading">
          <h2 id="features-heading" className="text-2xl font-bold font-display text-zinc-900 dark:text-white mb-6 text-center">
            Engineered for Total Confidentiality
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="glass-card p-5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/60">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 mb-1.5">Standard AES-256</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Uses ISO 32000-compliant AES-256 encryption recognized by Adobe Acrobat, Apple Preview, Google Chrome, and PDF readers worldwide.
              </p>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/60">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 mb-1.5">Zero Cloud Uploads</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Cryptography is executed directly via Web Crypto and local WebAssembly in browser RAM. Your passwords and documents never touch a server.
              </p>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/60">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 mb-1.5">Granular Permissions</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Configure owner restrictions to permit printing while blocking modification and content extraction, tailored for business contracts and reports.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section aria-labelledby="faqs-heading">
          <h2 id="faqs-heading" className="text-2xl font-bold font-display text-zinc-900 dark:text-white mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {protectPdfFaqs.map((faq, i) => (
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
