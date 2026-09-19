'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ToolCardSkeleton, HeroFeaturesSkeleton } from '@/components/LoadingSkeleton';
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
  Crop,
  ShieldCheck,
  Files,
  Stamp,
  Eraser,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/SocialIcons';
import { FaqJsonLd } from '@/components/JsonLd';

const heroFeatures = [
  {
    href: '/tools/add-watermark',
    icon: Stamp,
    title: 'Add Watermark to PDF',
    description: 'Add vector text/image watermarks with opacity and rotation controls',
    color: 'from-rose-500 to-pink-600',
    badge: 'New',
  },
  {
    href: '/tools/remove-watermark',
    icon: Eraser,
    title: 'Remove Watermark from PDF',
    description: 'Detect, strip text watermarks or erase stamps losslessly with zero uploads',
    color: 'from-amber-500 to-rose-600',
    badge: 'Featured',
  },
  {
    href: '/tools/pdf-organizer',
    icon: Files,
    title: 'PDF Merge & Split Organizer',
    description: 'Combine multiple PDFs or extract exact page ranges',
    color: 'from-cyan-500 to-indigo-600',
    badge: 'Popular',
  },
  {
    href: '/tools/passport-photo',
    icon: Camera,
    title: 'Biometric Passport Photo Maker',
    description: 'NADRA, US Visa & Schengen ready',
    color: 'from-emerald-500 to-teal-500',
    badge: 'Popular',
  },
  {
    href: '/tools/pdf-compressor',
    icon: FileDown,
    title: 'Smart Document Compressor',
    description: 'Reduce PDF & Word size without quality loss',
    color: 'from-brand-500 to-indigo-600',
    badge: 'Fast',
  },
  {
    href: '/tools/full-dp-maker',
    icon: Crop,
    title: 'All Social Media DP Resizer',
    description: 'No-crop square fit for WhatsApp, Instagram & Facebook with blur background',
    color: 'from-violet-500 to-purple-600',
    badge: 'Trending',
  },
  {
    href: '/tools/qr-generator',
    icon: QrCode,
    title: 'High-Res QR Code Generator',
    description: 'Custom styles, instant download',
    color: 'from-amber-500 to-rose-500',
    badge: 'Instant',
  },
  {
    href: '#tools',
    icon: ShieldCheck,
    title: '100% Client-Side Privacy',
    description: 'Zero uploads to servers, instant browser-level processing',
    color: 'from-cyan-500 to-blue-600',
    badge: '100% Private',
  },
];

const tools = [
  {
    href: '/tools/add-watermark',
    icon: Stamp,
    title: 'Add Watermark to PDF',
    tagline: '100% Client-Side Privacy',
    description: 'Add customizable vector text or image watermarks across single, range, or all pages with full opacity and font controls.',
    color: 'from-rose-500 to-pink-600',
    stats: 'Instant Watermarking',
    badge: 'New',
  },
  {
    href: '/tools/remove-watermark',
    icon: Eraser,
    title: 'Remove Watermark from PDF',
    tagline: '100% Client-Side Privacy',
    description: 'Erase watermarks, logos, and stamps cleanly with intelligent text stream stripping and interactive vector redaction.',
    color: 'from-amber-500 to-rose-600',
    stats: '100% Removal Detection',
    badge: 'Featured',
  },
  {
    href: '/tools/pdf-organizer',
    icon: Files,
    title: 'Smart PDF Merge & Split',
    tagline: '100% Client-Side Privacy',
    description: 'Combine multiple PDF files in custom order or extract exact page ranges into separate documents with visual page previews.',
    color: 'from-cyan-500 to-indigo-600',
    stats: 'Merge Unlimited · Split in Seconds',
    badge: 'Popular',
  },
  {
    href: '/tools/pdf-compressor',
    icon: FileDown,
    title: 'Smart PDF Compressor',
    tagline: '100% Client-Side Privacy',
    description: 'Compress heavy PDF documents client-side with full visual quality preservation and customizable compression levels.',
    color: 'from-brand-500 to-indigo-600',
    stats: 'Avg 75% Reduction',
    badge: 'Popular',
  },
  {
    href: '/tools/word-compressor',
    icon: FileText,
    title: 'Smart Word Compressor',
    tagline: '100% Client-Side Privacy',
    description: 'Shrink Microsoft Word .docx files by inspecting and re-compressing embedded high-res images without altering styles.',
    color: 'from-blue-500 to-cyan-500',
    stats: 'Preserves Layout',
    badge: 'Fast',
  },
  {
    href: '/tools/passport-photo',
    icon: Camera,
    title: 'Biometric Passport Photo Maker',
    tagline: 'NADRA, US Visa & Schengen Compliant',
    description: 'Crop and scale portraits to Pakistan NADRA, US 2x2", UK/EU 35x45mm, and Gulf specs with biometric face guides and 300 DPI printable sheets.',
    color: 'from-emerald-500 to-teal-500',
    stats: 'ICAO & NADRA Compliant',
    badge: 'Trending',
  },
  {
    href: '/tools/full-dp-maker',
    icon: WhatsAppIcon,
    title: 'No-Crop Full DP Resizer',
    tagline: 'Resize & Fit WhatsApp, Instagram & Facebook Profile Pictures',
    description: 'Resize & fit WhatsApp, Instagram & Facebook profile pictures without cropping (Blur background / 1:1 square canvas).',
    color: 'from-violet-500 to-purple-600',
    stats: '1:1 Square & HD Blur',
    badge: 'Featured',
  },
  {
    href: '/tools/qr-generator',
    icon: QrCode,
    title: 'High-Res QR Code Generator',
    tagline: 'Custom Styles, Colors & Instant Export',
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show skeleton briefly so browser has time to load fonts, scripts & WebAssembly
    // This is especially noticeable on mobile — gives a smooth first-paint experience
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative">
      <FaqJsonLd faqs={homeFaqs} />
      {/* ============ HERO SECTION ============ */}
      <section className="relative overflow-hidden">
        {/* ── Ambient Glow Orbs (pointer-events-none, behind all content) ── */}

        {/* Orb 1 — Violet / Purple — top-left */}
        <div
          aria-hidden="true"
          className="hidden md:block pointer-events-none absolute -z-10 -top-10 -left-16 w-[480px] h-[480px] rounded-full opacity-30 dark:opacity-25"
          style={{
            background: 'radial-gradient(ellipse at center, #7c3aed 0%, #6d28d9 35%, transparent 70%)',
            filter: 'blur(90px)',
          }}
        />

        {/* Orb 2 — Cyan / Emerald — bottom-right */}
        <div
          aria-hidden="true"
          className="hidden md:block pointer-events-none absolute -z-10 bottom-0 -right-20 w-[560px] h-[440px] rounded-full opacity-25 dark:opacity-20"
          style={{
            background: 'radial-gradient(ellipse at center, #06b6d4 0%, #10b981 45%, transparent 70%)',
            filter: 'blur(110px)',
          }}
        />

        {/* Orb 3 — Rose / Amber accent — upper-right, very subtle */}
        <div
          aria-hidden="true"
          className="hidden md:block pointer-events-none absolute -z-10 top-8 right-8 w-[320px] h-[280px] rounded-full opacity-20 dark:opacity-15"
          style={{
            background: 'radial-gradient(ellipse at center, #f43f5e 0%, #fb923c 55%, transparent 72%)',
            filter: 'blur(80px)',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Hero Copy & CTA */}
            <motion.div
              className="lg:col-span-7 text-left"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              {/* Badge */}
              <motion.div variants={itemVariants} className="mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/25 dark:border-brand-400/30 backdrop-blur-sm shadow-sm shadow-brand-500/10">
                  <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                  All-in-One Client-Side Document & Media Toolkit
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={itemVariants}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-display leading-[1.02] tracking-tight mb-6"
              >
                <span className="text-zinc-900 dark:text-white">Transform{' '}</span>
                <span className="text-gradient">Your Files.</span>
                <br />
                <span className="text-zinc-900 dark:text-white">Zero Server Uploads.</span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                variants={itemVariants}
                className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mb-8 leading-relaxed"
              >
                High-performance biometric passport photos, document compression, social media DP resizer,
                and vector QR codes — executed <span className="font-semibold text-brand-500 dark:text-brand-300">100% locally</span> in your browser.
              </motion.p>

              {/* Primary CTA */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6"
              >
                <a
                  href="#tools"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2.5 text-base sm:text-lg px-8 py-4 font-bold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
                >
                  <span>Start Now — Make Your Life Easy</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </motion.div>

              {/* Sub-tags / Badges (General, zero PDF mentions) */}
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-1"
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/60 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/60 backdrop-blur-sm text-zinc-700 dark:text-zinc-300 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  100% Free
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/60 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/60 backdrop-blur-sm text-zinc-700 dark:text-zinc-300 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  Instant Processing
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/60 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/60 backdrop-blur-sm text-zinc-700 dark:text-zinc-300 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  Zero Data Leaks
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/60 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/60 backdrop-blur-sm text-zinc-700 dark:text-zinc-300 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  No Sign-Up Required
                </span>
              </motion.div>
            </motion.div>

            {/* Right Column: 5 Core Tools Feature Highlight Card */}
            <motion.div
              key={isLoading ? 'skeleton-hero' : 'loaded-hero'}
              className="lg:col-span-5"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: isLoading ? 0.2 : 0 }}
            >
              {isLoading ? (
                <HeroFeaturesSkeleton />
              ) : (
                <div className="glass-card p-5 sm:p-6 rounded-3xl border border-white/60 dark:border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                  <div className="flex items-center justify-between pb-3.5 mb-2.5 border-b border-zinc-200/60 dark:border-zinc-800/60">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                        Core Toolkit Features
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-300">
                      8 Essential Tools
                    </span>
                  </div>

                  <div className="space-y-2">
                    {heroFeatures.map((feat, idx) => {
                      const Icon = feat.icon;
                      const isAnchor = feat.href.startsWith('#');
                      return (
                        <Link
                          key={idx}
                          href={feat.href}
                          onClick={
                            isAnchor
                              ? (e) => {
                                  e.preventDefault();
                                  document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
                                }
                              : undefined
                          }
                          className="group flex items-center gap-3.5 p-2.5 sm:p-3 rounded-2xl transition-all duration-200 hover:bg-white/70 dark:hover:bg-zinc-800/70 hover:shadow-sm border border-transparent hover:border-zinc-200/60 dark:hover:border-zinc-700/60"
                        >
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-sm font-bold text-zinc-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                {feat.title}
                              </p>
                              <ArrowRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-snug line-clamp-1 mt-0.5">
                              {feat.description}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
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
            key={isLoading ? 'skeleton-grid' : 'tools-grid'}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            variants={containerVariants}
          >
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <motion.div key={i} variants={itemVariants}>
                    <ToolCardSkeleton />
                  </motion.div>
                ))
              : tools.map((tool) => {
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
            const panelId = `faq-panel-${idx}`;
            const triggerId = `faq-trigger-${idx}`;
            return (
              <div key={idx} className="glass-card rounded-2xl overflow-hidden transition">
                <button
                  id={triggerId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
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
                {/* Answer always in DOM for SEO — hidden via CSS, not unmounted */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  className={`px-5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 transition-all duration-300 overflow-hidden ${
                    isOpen ? 'max-h-96 pb-5 pt-3 opacity-100' : 'max-h-0 pb-0 pt-0 opacity-0'
                  }`}
                >
                  {faq.a}
                </div>
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
            <a
              href="#tools"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3.5 font-bold cursor-pointer"
            >
              <span>Start Now — Make Your Life Easy</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
