import React from 'react';
import ProtectPdfClient from '@/components/ProtectPdfClient';
import { protectPdfFaqs } from '@/data/faqs';
import { Shield, Lock, FileCheck, KeyRound, Cpu, EyeOff } from 'lucide-react';

export default function ProtectPdfPage() {
  return (
    <div className="relative">
      {/* ── Semantic Server-Rendered Hero for SEO & Crawlers ── */}
      <header className="pt-8 pb-4 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 rounded-full px-4 py-1.5 mb-4">
          <Shield className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">
            100% Client-Side · Military-Grade AES-256
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
          Password Protect PDF{' '}
          <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Online Free
          </span>
        </h1>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Encrypt your PDF documents with standard AES-256 encryption. Set open passwords, permission restrictions (printing, copying, and editing), and protect sensitive records directly in your browser without uploading files to any remote server.
        </p>
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
