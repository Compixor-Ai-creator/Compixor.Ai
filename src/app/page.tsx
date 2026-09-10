'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileDown,
  FileText,
  Camera,
  QrCode,
  Shield,
  Zap,
  Lock,
  ArrowRight,
  Sparkles,
  MonitorSmartphone,
  CheckCircle2,
  Cpu,
  ChevronDown,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/SocialIcons';

const tools = [
  {
    href: '/tools/pdf-compressor',
    icon: FileDown,
    title: 'PDF Compressor',
    tagline: 'Up to 90% Size Reduction',
    description: 'Compress heavy PDF documents client-side with full visual quality preservation and customizable compression levels.',
    color: 'from-brand-500 to-indigo-600',
    stats: 'Avg 75% Reduction',
    badge: 'Popular',
  },
  {
    href: '/tools/word-compressor',
    icon: FileText,
    title: 'Word Compressor',
    tagline: 'Lossless Docx Optimizer',
    description: 'Shrink Microsoft Word .docx files by inspecting and re-compressing embedded high-res images without altering styles.',
    color: 'from-blue-500 to-cyan-500',
    stats: 'Preserves Layout',
    badge: 'Fast',
  },
  {
    href: '/tools/passport-photo',
    icon: Camera,
    title: 'Passport Photo Maker',
    tagline: 'Official Biometric Formats',
    description: 'Crop and scale portraits to US 2x2", UK/EU 35x45mm, India, and Canada specs with smart face guides and 4x6" printable sheets.',
    color: 'from-emerald-500 to-teal-500',
    stats: 'ICAO Compliant',
    badge: 'Trending',
  },
  {
    href: '/tools/full-dp-maker',
    icon: WhatsAppIcon,
    title: 'Full DP Maker',
    tagline: 'No Crop Profile Picture',
    description: 'Fit whole portrait & landscape photos inside WhatsApp, Instagram, and Facebook avatar circles with blur, color, and mirror backgrounds.',
    color: 'from-violet-500 to-purple-600',
    stats: 'No Crop & HD',
    badge: 'New',
  },
  {
    href: '/tools/qr-generator',
    icon: QrCode,
    title: 'QR Code Generator',
    tagline: 'Custom Vectors & Colors',
    description: 'Generate high-resolution QR codes for websites, Wi-Fi credentials, and contact cards with custom color palettes and SVG exports.',
    color: 'from-amber-500 to-rose-500',
    stats: 'SVG & PNG Export',
    badge: 'Static & Permanent',
  },
];

const trustSignals = [
  {
    icon: Lock,
    title: '100% Client-Side',
    description: 'Files are processed inside browser memory — zero bytes uploaded to remote servers.',
  },
  {
    icon: Zap,
    title: 'Instant Execution',
    description: 'No network queue or server waiting times. Transforms complete in milliseconds.',
  },
  {
    icon: Shield,
    title: 'Privacy Guaranteed',
    description: 'Zero data harvesting or storage. What happens in your browser stays in your browser.',
  },
  {
    icon: MonitorSmartphone,
    title: 'Cross-Platform',
    description: 'Runs flawlessly on desktop browsers, tablets, iOS Safari, and Android Chrome.',
  },
];

const homeFaqs = [
  {
    q: 'How does CompixorAi process files without uploading them?',
    a: 'We leverage modern browser capabilities including HTML5 Canvas, WebAssembly, and local JavaScript workers. Your device performs the computation directly on the raw file buffer.',
  },
  {
    q: 'Is there a limit on how many files I can process?',
    a: 'No! Because all processing happens on your local hardware, there are no artificial hourly limits, paywalls, or queue throttles.',
  },
  {
    q: 'Can I use this on corporate or sensitive business files?',
    a: 'Absolutely. Because files never leave your computer or transmit across the network, CompixorAi is compliant with strict enterprise confidentiality guidelines.',
  },
  {
    q: 'Are printable passport photos formatted correctly for retail printing?',
    a: 'Yes. Our 4x6" printable sheet is rendered at exact 300 DPI resolution, so you can order a standard 4x6" print at CVS, Walgreens, Boots, or Walmart for pennies.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function HomePage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <div className="relative">
      {/* ============ HERO SECTION ============ */}
      <section className="relative overflow-hidden">
        {/* ── Ambient Glow Orbs (pointer-events-none, behind all content) ── */}

        {/* Orb 1 — Violet / Purple — top-left */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -z-10 -top-10 -left-16 w-[480px] h-[480px] rounded-full opacity-30 dark:opacity-25"
          style={{
            background: 'radial-gradient(ellipse at center, #7c3aed 0%, #6d28d9 35%, transparent 70%)',
            filter: 'blur(90px)',
          }}
        />

        {/* Orb 2 — Cyan / Emerald — bottom-right */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -z-10 bottom-0 -right-20 w-[560px] h-[440px] rounded-full opacity-25 dark:opacity-20"
          style={{
            background: 'radial-gradient(ellipse at center, #06b6d4 0%, #10b981 45%, transparent 70%)',
            filter: 'blur(110px)',
          }}
        />

        {/* Orb 3 — Rose / Amber accent — upper-right, very subtle */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -z-10 top-8 right-8 w-[320px] h-[280px] rounded-full opacity-20 dark:opacity-15"
          style={{
            background: 'radial-gradient(ellipse at center, #f43f5e 0%, #fb923c 55%, transparent 72%)',
            filter: 'blur(80px)',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-28 pb-16">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/25 dark:border-brand-400/30 backdrop-blur-sm shadow-sm shadow-brand-500/10">
                <Sparkles className="w-3.5 h-3.5" />
                All-in-One Client-Side Document & Media Toolkit
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-display leading-[0.95] tracking-tight mb-6"
            >
              <span className="text-zinc-900 dark:text-white">Transform{' '}</span>
              <span className="text-gradient">Your Files.</span>
              <br />
              <span className="text-zinc-900 dark:text-white">Zero Server Uploads.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              High-performance PDF compression, Word document optimization, biometric passport photos,
              and vector QR codes — executed <span className="font-semibold text-brand-500 dark:text-brand-300">100% locally</span> in your browser.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              {/* Subtle frosted glass pill wrapping both CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-2 sm:p-2.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/10 backdrop-blur-md shadow-sm w-full sm:w-auto">
                <Link href="/tools/pdf-compressor" className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2 text-base px-8 py-3.5">
                  Compress PDF Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="#tools" className="w-full sm:w-auto btn-secondary flex items-center justify-center gap-2 text-base px-8 py-3.5">
                  Explore All 5 Tools
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============ TOOLS SUITE GRID ============ */}
      <section id="tools" className="relative py-16 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-black font-display text-zinc-900 dark:text-white mb-3">
              Precision Productivity Tools
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
              Every tool is engineered for lightning execution, maximum file fidelity, and absolute privacy.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <motion.div key={tool.href} variants={itemVariants}>
                  <Link href={tool.href} className="block group h-full">
                    <div className="glass-card p-7 sm:p-8 h-full flex flex-col justify-between rounded-3xl">
                      <div>
                        <div className="flex items-start justify-between gap-4 mb-6">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                            {tool.badge}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold font-display text-zinc-900 dark:text-white mb-1.5 flex items-center gap-2">
                          {tool.title}
                          <ArrowRight className="w-4 h-4 text-brand-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                        </h3>
                        <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mb-3">
                          {tool.tagline}
                        </p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                          {tool.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                        <span>{tool.stats}</span>
                        <span className="text-brand-500 group-hover:underline flex items-center gap-1">
                          Launch Tool &rarr;
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ============ TRUST ARCHITECTURE ============ */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-black font-display text-zinc-900 dark:text-white mb-3">
              Engineered with Zero Compromise
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
              How CompixorAi redefines privacy and performance for online utilities.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {trustSignals.map((signal, i) => {
              const Icon = signal.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="glass-card p-6 text-center rounded-2xl"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4 text-brand-500">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold font-display text-zinc-900 dark:text-white mb-2 text-base">
                    {signal.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {signal.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ============ FAQ ACCORDION ============ */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black font-display text-zinc-900 dark:text-white mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Got questions? We've got answers.
          </p>
        </div>

        <div className="space-y-4">
          {homeFaqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="glass-card rounded-2xl overflow-hidden transition">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-zinc-900 dark:text-white"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-brand-500 shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ============ CTA BOX ============ */}
      <section className="py-16 relative overflow-hidden">
        {/* Ambient glow behind the CTA box */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -z-10 inset-0 flex items-center justify-center"
        >
          <div
            className="w-[600px] h-[300px] rounded-full opacity-20 dark:opacity-15"
            style={{
              background: 'radial-gradient(ellipse at center, #7c3aed 0%, #06b6d4 50%, transparent 72%)',
              filter: 'blur(80px)',
            }}
          />
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            className="glow-border p-10 sm:p-14 rounded-3xl"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl font-black font-display text-zinc-900 dark:text-white mb-3">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mb-8 max-w-lg mx-auto">
              Select a tool and start processing files in seconds. No credit card or registration needed.
            </p>
            <Link href="/tools/pdf-compressor" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3.5">
              Start Free Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
