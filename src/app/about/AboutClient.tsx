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
      'Time is your most valuable asset. Our algorithms execute directly on your CPU/GPU hardware using WebAssembly and HTML5 APIs, turning minutes of waiting into instantaneous processing.',
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  },
  {
    icon: Lock,
    title: 'Privacy-First Architecture',
    description:
      'Privacy by design. 9 tools run 100% locally in your browser memory, while server tools process requests over encrypted HTTPS and delete files immediately.',
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: Target,
    title: 'Clinical Precision',
    description:
      'Zero compromise on output fidelity. Whether compressing multi-gigabyte PDFs, re-encoding document XMLs, or generating vector QR codes, we preserve structure and quality.',
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
          We believe professional file transformation shouldn&apos;t require clunky software subscriptions,
          data tracking, or tedious workflows. We bring clinical precision and instantaneous
          private and instantaneous computing to everyone.
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
            Engineered from day one around the belief that privacy and speed must go hand in hand.
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
            The CompixorAi team is composed of engineers, designers, and systems architects dedicated
            to refining the modern digital workspace. We witnessed the daily friction in file
            management—corrupted formatting, privacy leaks, slow web upload queues, and bloated software.
          </p>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
            Our platform operates on an <strong>atmospheric minimalism</strong> philosophy. The interface stays
            clean, unobtrusive, and lightweight, while heavy binary computation happens silently and instantaneously
            inside modern browser threads.
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
            Unlike legacy SaaS document platforms that force users to upload confidential files to centralized cloud clusters, Compixor runs compiled WebAssembly binaries directly inside your local browser tab.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-4">
              01
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">Zero Network Transmission</h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Document buffers, image pixels, and encryption keys never travel across the internet. Computation takes place in device RAM and terminates immediately when you close the tab.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mb-4">
              02
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">V8 Memory Sandboxing</h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Every operation executes within the browser&apos;s hardware-isolated virtual machine sandbox, strictly isolated from persistent filesystem storage and tracking scripts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold mb-4">
              03
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">Corporate Compliance Ready</h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Compliant with non-disclosure agreements (NDAs), GDPR privacy guidelines, and HIPAA confidentiality principles because no third-party data processing occurs.
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
            Every output generated by Compixor adheres to recognized ISO, consular, and document interchange standards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
            <span className="text-xs font-bold uppercase text-brand-600 dark:text-brand-400 tracking-wider">ISO 32000-1 / 2</span>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white mt-1 mb-2">PDF Document Architecture</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Standard-compliant xref indexing, object dictionaries, and AES-256 cryptographic structures for universal viewer compatibility.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
            <span className="text-xs font-bold uppercase text-brand-600 dark:text-brand-400 tracking-wider">ICAO Doc 9303</span>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white mt-1 mb-2">Biometric Passport Photos</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Facial landmark positioning, crown-to-chin ratios, 300 DPI JFIF resolution, and printable multi-photo layout sheets.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
            <span className="text-xs font-bold uppercase text-brand-600 dark:text-brand-400 tracking-wider">ISO/IEC 18004</span>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white mt-1 mb-2">Vector QR Matrix Codes</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Level H (30%) Reed-Solomon error correction, permanent static encoding, and infinite vector SVG/high-res PNG exports.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
            <span className="text-xs font-bold uppercase text-brand-600 dark:text-brand-400 tracking-wider">ECMA-376 / OOXML</span>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white mt-1 mb-2">Office OpenXML Packaging</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Native Microsoft Word (.docx) syntax preservation, table cell geometry, and structural image stream optimization.
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
