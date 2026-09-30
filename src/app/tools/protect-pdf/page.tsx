import ToolSeoSection from "@/components/ToolSeoSection";
import React from 'react';
import ProtectPdfClient from '@/components/ProtectPdfClient';
import { Shield, Lock, FileCheck, KeyRound, Cpu, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ProtectPdfPage() {
  return (
    <div className="relative">
      {/* ── Semantic Server-Rendered Hero for SEO & Crawlers ── */}
            {/* ── Semantic Server-Rendered Hero with Image 2 style Transformation Card & Animations ── */}
      <header className="pt-8 pb-4 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Victory / Transformation Preview Card (Unprotected PDF → AES-256 Encrypted PDF) */}
        <div className="w-full flex justify-center mb-6 select-none pointer-events-none">
          <div className="p-3 sm:p-4 rounded-3xl bg-white/60 dark:bg-zinc-900/60 border border-indigo-500/20 dark:border-indigo-500/30 shadow-lg backdrop-blur-md flex items-center justify-center gap-4 sm:gap-6">
            {/* Left: Open Unprotected PDF (Problem) */}
            <div className="flex flex-col items-center space-y-1">
              <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl bg-red-500/10 border-2 border-dashed border-red-400 relative flex flex-col items-center justify-center p-2">
                <div className="w-10 h-13 rounded-lg bg-white dark:bg-zinc-800 shadow-sm border border-red-200 dark:border-red-900/50 flex flex-col items-center justify-between p-1.5">
                  <span className="text-[7.5px] font-bold text-red-500">PDF</span>
                  <div className="w-full space-y-0.5">
                    <div className="w-full h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
                    <div className="w-4/5 h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
                    <div className="w-3/5 h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
                  </div>
                  <span className="text-[6.5px] font-bold text-red-600 bg-red-100 dark:bg-red-950/60 px-1 rounded">Open</span>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-red-500">Unprotected</span>
            </div>

            {/* Center Arrow */}
            <div className="w-7 h-7 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-black text-sm">
              &rarr;
            </div>

            {/* Right: AES-256 Protected PDF (Victory) */}
            <div className="flex flex-col items-center space-y-1">
              <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border-2 border-indigo-500 relative flex flex-col items-center justify-center p-2 shadow-md">
                <div className="w-10 h-13 rounded-lg bg-white dark:bg-zinc-800 shadow-sm border border-indigo-500/40 flex flex-col items-center justify-between p-1.5 relative">
                  <span className="text-[7.5px] font-bold text-indigo-600">PDF</span>
                  <div className="w-full space-y-0.5">
                    <div className="w-full h-0.5 bg-indigo-400/60 rounded" />
                    <div className="w-4/5 h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
                    <div className="w-3/5 h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
                  </div>
                  <span className="text-[6.5px] font-bold text-indigo-600 bg-indigo-100 dark:bg-indigo-950/60 px-1 rounded">AES-256</span>
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[7px] font-black shadow-xs">🔒</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">100% Encrypted</span>
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200/60 dark:border-indigo-800/40 rounded-full px-4 py-1.5 mb-4 animate-float-subtle shadow-xs">
          <Shield className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 tracking-wide uppercase">
            100% Client-Side · Standard AES-256 Encryption
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

        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-5">
          Encrypt your PDF documents with standard AES-256 encryption. Set open passwords, permission restrictions (printing, copying, and editing), and protect sensitive records directly in your browser without uploading files to any remote server.
        </p>

        {/* Clean Keyword Badges / Tags */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-2xl mx-auto">
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

        <ToolSeoSection toolSlug="protect-pdf" />
      </div>
    </div>
  );
}
