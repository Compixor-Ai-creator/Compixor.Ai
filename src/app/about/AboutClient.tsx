'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap,
  Lock,
  Target,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Sparkles,
  Layers,
  Heart,
  Mail,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import { CONTACT_EMAIL } from '@/lib/config';

const values = [
  {
    icon: Zap,
    title: 'Lightning Speed',
    description:
      'Your time matters. Our tools run directly on your device using WebAssembly. You get instant results without waiting in long server lines.',
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  },
  {
    icon: Lock,
    title: 'Privacy-First Architecture',
    description:
      'Privacy comes first. Your files are processed right inside your browser memory. We never store, read, or share your documents.',
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: Target,
    title: 'Clinical Precision',
    description:
      'Top quality every time. Whether you compress large PDFs or make sharp QR codes, we preserve your original layout and text.',
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  },
];

const stats = [
  { label: 'Privacy Standard', value: 'Privacy-First' },
  { label: 'Files Processed Locally', value: '100% Private' },
  { label: 'Average Execution Time', value: '< 1.2s' },
  { label: 'Permanent File Retention', value: '0%' },
];

export default function AboutClient() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      {/* Hero */}
      <motion.div
        className="text-center max-w-3xl mx-auto mb-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-500 dark:text-brand-300 border border-brand-500/20 mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Our Mission & Architecture
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-display text-zinc-900 dark:text-white leading-[1.1] mb-6">
          The Mission Behind <span className="text-gradient">CompixorAi</span>
        </h1>
        <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-300 leading-relaxed">
          We believe editing files should be simple, private, and fast. You should not have to pay for costly software, wait in slow upload queues, or give away your personal data. Compixor gives you fast, private tools that run right in your web browser.
        </p>
      </motion.div>

      {/* Stats Banner */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-6 text-center rounded-2xl">
            <p className="text-3xl sm:text-4xl font-black font-display text-brand-500 dark:text-brand-300 mb-1">
              {stat.value}
            </p>
            <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {stat.label}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Core Values Bento Grid */}
      <section className="mb-24">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-zinc-900 dark:text-white mb-3">
            Core Engineering Principles
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Built from day one so you get fast results without giving up your privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((v, idx) => {
            const Icon = v.icon;
            return (
              <div
                key={idx}
                className="glass-card p-8 rounded-3xl flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${v.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold font-display text-zinc-900 dark:text-white mb-3">
                    {v.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {v.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Narrative Section */}
      <section className="glass-card p-8 md:p-12 rounded-3xl mb-24 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <Cpu className="w-3.5 h-3.5" />
            Atmospheric Minimalism
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-zinc-900 dark:text-white">
            Engineering Effortless Power
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
            Our team of engineers and designers build tools for the modern web. We saw common problems with everyday file tasks: slow uploads, broken layouts, and privacy risks with cloud servers.
          </p>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
            We keep our tools simple and clean. You get a clear interface with zero clutter. All heavy processing happens silently and fast right inside your browser.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-zinc-900 text-white font-mono text-xs space-y-3 shadow-2xl border border-zinc-800">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800 text-zinc-400">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-2 text-[11px]">compixor-engine // client-worker.wasm</span>
          </div>
          <p className="text-emerald-400">✓ Initializing WebAssembly memory sandbox...</p>
          <p className="text-cyan-400">✓ Mounting local FileSystem stream (Zero Network)</p>
          <p className="text-zinc-300">→ PDF structural stream parser active</p>
          <p className="text-zinc-300">→ Biometric facial landmark anchor: OK</p>
          <p className="text-zinc-300">→ Vector matrix generator: 280x280 SVG</p>
          <p className="text-brand-300 font-semibold pt-2">★ Transformation complete in 184ms [0 KB uploaded]</p>
        </div>
      </section>

      {/* Privacy & Security Architecture Deep Dive */}
      <section className="glass-card p-8 md:p-12 rounded-3xl mb-24 border border-zinc-200/80 dark:border-zinc-800/80">
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-4">
            <ShieldCheck className="w-4 h-4" />
            Zero-Knowledge Security Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-zinc-900 dark:text-white mb-4">
            How Client-Side Computing Protects Your Data
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
            Most online tools make you upload sensitive files to remote servers. Compixor works differently. All code runs right inside your web browser tab.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-4">
              01
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">Zero Network Transmission</h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Your documents, images, and keys never travel over the internet. Everything stays in your device RAM and disappears as soon as you close your tab.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mb-4">
              02
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">V8 Memory Sandboxing</h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Each task runs inside your browser&apos;s secure sandbox. It stays completely separate from tracking scripts and cannot touch your personal files.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold mb-4">
              03
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">Corporate Compliance Ready</h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Safe for sensitive contracts, business plans, and personal records. Since no files ever reach our servers, your data remains fully confidential.
            </p>
          </div>
        </div>
      </section>

      {/* Global Standards & Technical Compliance */}
      <section className="glass-card p-8 md:p-12 rounded-3xl mb-24 border border-zinc-200/80 dark:border-zinc-800/80">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 mb-4">
            <Globe className="w-4 h-4" />
            Global Standards & Technical Compliance
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-zinc-900 dark:text-white mb-3">
            Built Strictly to International Specifications
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Every file you create meets official worldwide standards for formats, printing, and security.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
            <span className="text-xs font-bold uppercase text-brand-600 dark:text-brand-400 tracking-wider">ISO 32000-1 / 2</span>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white mt-1 mb-2">PDF Document Architecture</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Standard PDF formatting and AES-256 encryption. Your PDF files open smoothly in Adobe Acrobat and any modern reader.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
            <span className="text-xs font-bold uppercase text-brand-600 dark:text-brand-400 tracking-wider">ICAO Doc 9303</span>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white mt-1 mb-2">Biometric Passport Photos</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Exact photo sizes and head dimensions at 300 DPI. Ready to print on photo paper for visas and passports.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
            <span className="text-xs font-bold uppercase text-brand-600 dark:text-brand-400 tracking-wider">ISO/IEC 18004</span>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white mt-1 mb-2">Vector QR Matrix Codes</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              High error correction and sharp vector graphics. Your QR codes scan quickly and never expire.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
            <span className="text-xs font-bold uppercase text-brand-600 dark:text-brand-400 tracking-wider">ECMA-376 / OOXML</span>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white mt-1 mb-2">Office OpenXML Packaging</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Clean Word DOCX format. Keeps your tables, text styles, and images looking just right in Microsoft Word.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <div className="glow-border p-10 md:p-14 text-center max-w-3xl mx-auto rounded-3xl">
        <h2 className="text-3xl font-black font-display text-zinc-900 dark:text-white mb-4">
          Experience CompixorAi Today
        </h2>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mb-8 max-w-md mx-auto">
          Start compressing documents, generating QR codes, or creating passport photos with zero sign-up.
        </p>
        <Link href="/tools/pdf-compressor" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3.5">
          Explore Free Tools
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Contact Section — Email Only */}
      <section
        id="contact"
        className="scroll-mt-24 mt-20 glass-card p-8 md:p-12 text-center max-w-2xl mx-auto rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80"
      >
        <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-display text-zinc-900 dark:text-white mb-2">
          Contact Us
        </h2>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mb-6 max-w-md mx-auto">
          Have a question, feedback, or need assistance? Reach out to our team directly via email.
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="btn-primary inline-flex items-center gap-2 text-sm sm:text-base px-6 py-3 font-semibold"
        >
          <Mail className="w-4 h-4" />
          <span>Contact Support ({CONTACT_EMAIL})</span>
        </a>
      </section>
    </div>
  );
}
