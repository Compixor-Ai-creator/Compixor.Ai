'use client';

import React from 'react';
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
  Unlock,
  ArrowRight,
  Sparkles,
  MonitorSmartphone,
  CheckCircle2,
  Files,
  Stamp,
  Eraser,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/SocialIcons';
import { FaqJsonLd } from '@/components/JsonLd';
import HomeFaqAccordion from '@/components/HomeFaqAccordion';
import CustomerTestimonials from '@/components/CustomerTestimonials';
import WhyChooseCompixor from '@/components/WhyChooseCompixor';

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
    href: '/tools/protect-pdf',
    icon: Lock,
    title: 'Protect PDF',
    tagline: '100% Client-Side Privacy',
    description: 'Encrypt PDF with standard AES-256 password protection and configure granular restrictions for printing, copying, and editing.',
    color: 'from-indigo-500 to-purple-600',
    stats: 'AES-256 Encryption',
    badge: 'New',
  },
  {
    href: '/tools/unlock-pdf',
    icon: Unlock,
    title: 'Unlock PDF',
    tagline: '100% Client-Side Privacy',
    description: 'Instantly strip password security and remove permission restrictions from PDF files you own directly in your browser.',
    color: 'from-purple-500 to-pink-600',
    stats: '100% Local Decrypt',
    badge: 'New',
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
    href: '/tools/pdf-to-word',
    icon: FileText,
    title: 'PDF to Word Converter',
    tagline: '100% Client-Side Privacy',
    description: 'Convert PDF files into fully editable Microsoft Word (.docx) documents in browser RAM with zero cloud uploads.',
    color: 'from-blue-600 to-indigo-600',
    stats: 'Editable DOCX',
    badge: 'New',
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
    title: 'Client-Side Privacy',
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
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function HomePage() {
  return (
    <div className="relative overflow-x-clip">
      <FaqJsonLd faqs={homeFaqs} />
      {/* ============ HERO SECTION ============ */}
      <section className="relative">
        {/* ============ LUXURY ARCHITECTURAL ATMOSPHERE ============ */}
        <div
          aria-hidden="true"
          className="hidden md:block pointer-events-none absolute -z-10 inset-0 overflow-hidden"
        >
          {/* Subtle Architectural Dot Matrix Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(124,58,237,0.12)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_75%_55%_at_50%_35%,black_40%,transparent_100%)] pointer-events-none" />

          {/* Majestic Top-Centered Aurora Mesh Canopy */}
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1100px] h-[580px] rounded-full opacity-45 dark:opacity-30 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 85% 60% at 50% -10%, rgba(124, 58, 237, 0.40) 0%, rgba(99, 102, 241, 0.28) 28%, rgba(244, 63, 94, 0.22) 55%, rgba(251, 146, 60, 0.16) 75%, transparent 95%)',
              filter: 'blur(110px)',
            }}
          />

          {/* Left: Electric Violet Horizon Bloom */}
          <div
            className="absolute top-4 -left-28 w-[640px] h-[520px] rounded-full opacity-40 dark:opacity-25 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 35% 40%, rgba(124, 58, 237, 0.35) 0%, rgba(99, 102, 241, 0.20) 45%, transparent 75%)',
              filter: 'blur(110px)',
            }}
          />

          {/* Right Behind Card: Radiant Luxury Champagne Rose & Warm Sunset Amber Glow */}
          <div
            className="absolute top-2 -right-16 w-[720px] h-[560px] rounded-full opacity-45 dark:opacity-30 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 70% 60% at 55% 45%, rgba(244, 63, 94, 0.28) 0%, rgba(251, 146, 60, 0.20) 35%, rgba(168, 85, 247, 0.14) 65%, transparent 85%)',
              filter: 'blur(120px)',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Hero Copy & CTA with smooth stagger */}
            <motion.div
              className="lg:col-span-7 text-left"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              {/* Badge */}
              <motion.div variants={itemVariants} className="mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-brand-500/15 via-purple-500/15 to-rose-500/15 text-brand-700 dark:text-brand-300 border border-brand-500/30 dark:border-brand-400/30 backdrop-blur-md shadow-xs animate-float-subtle">
                  <Sparkles className="w-3.5 h-3.5 text-brand-500 animate-spin-slow" />
                  All-in-One Client-Side Document &amp; Media Toolkit
                </span>
              </motion.div>

              {/* Headline (Instant paint at opacity 1 — NO element render delay for LCP) */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-display leading-[1.04] tracking-tight mb-6">
                <span className="text-zinc-900 dark:text-white">Transform{' '}</span>
                <span className="bg-gradient-to-r from-brand-600 via-purple-600 to-rose-500 bg-clip-text text-transparent">
                  Your Files.
                </span>
                <br />
                <span className="text-zinc-900 dark:text-white">Zero Server Uploads.</span>
              </h1>

              {/* Subheadline (Instant paint at opacity 1 — ZERO delay for Google Lighthouse LCP) */}
              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mb-8 leading-relaxed">
                High-performance biometric passport photos, document compression, social media DP resizer,
                and vector QR codes — executed <span className="font-semibold text-brand-600 dark:text-brand-300">100% locally</span> in your browser.
              </p>

              {/* Primary CTA with smooth spring entrance */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-6"
              >
                <a
                  href="#tools"
                  className="relative inline-flex items-center justify-center gap-2.5 text-base sm:text-lg px-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-600 shadow-[0_12px_32px_-4px_rgba(124,58,237,0.45)] hover:shadow-[0_18px_45px_-4px_rgba(124,58,237,0.65)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 group overflow-hidden cursor-pointer"
                >
                  <span className="relative z-10">Start Now — Make Your Life Easy</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1.5 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                </a>
              </motion.div>

              {/* Sub-tags / Badges with smooth stagger */}
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-1"
              >
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700/80 backdrop-blur-md text-zinc-800 dark:text-zinc-200 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  100% Free
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700/80 backdrop-blur-md text-zinc-800 dark:text-zinc-200 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  Instant Processing
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700/80 backdrop-blur-md text-zinc-800 dark:text-zinc-200 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  Zero Data Leaks
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700/80 backdrop-blur-md text-zinc-800 dark:text-zinc-200 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  No Sign-Up Required
                </span>
              </motion.div>
            </motion.div>

            {/* Right Column: Core Tools Feature Highlight Card (desktop only) */}
            <motion.div
              className="lg:col-span-5 hidden lg:block"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative">
                {/* Floating Top-Left Micro Tag */}
                <div className="absolute -top-3.5 -left-3.5 z-20 hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/95 dark:bg-zinc-800/95 border border-brand-500/30 text-brand-600 dark:text-brand-300 shadow-lg shadow-brand-500/10 backdrop-blur-md animate-float-subtle">
                  <Sparkles className="w-3 h-3 text-brand-500" />
                  <span>100% In-Browser RAM</span>
                </div>

                {/* Floating Bottom-Right Micro Tag */}
                <div className="absolute -bottom-3.5 -right-3.5 z-20 hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/95 dark:bg-zinc-800/95 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10 backdrop-blur-md">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Zero Cloud Uploads</span>
                </div>

                {/* The Showcase Glass Card */}
                <div className="glass-card p-5 sm:p-6 rounded-3xl border border-white/90 dark:border-white/10 shadow-[0_25px_70px_-15px_rgba(124,58,237,0.20),0_0_0_1px_rgba(255,255,255,0.8)_inset,0_15px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.65)] backdrop-blur-2xl relative overflow-hidden flex flex-col hover:shadow-brand-500/25 transition-all duration-300">
                  {/* Top Border Luxury Dual-Tone Highlight Beam */}
                  <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-500/70 via-rose-400/60 to-transparent pointer-events-none" />
                  {/* Subtle Inner Glass Warm Sheen */}
                  <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-br from-rose-500/15 via-amber-400/10 to-transparent blur-2xl pointer-events-none" />

                  {/* Header Row with dynamic tool count */}
                  <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-zinc-200/70 dark:border-zinc-800/70 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                        Core Toolkit
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        In-Browser
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-300 border border-brand-500/20">
                      {tools.length} Tools Available
                    </span>
                  </div>

                  {/* Scrollable list with no-scrollbar for ultra-clean look */}
                  <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1 overscroll-contain no-scrollbar">
                    {tools.map((feat) => {
                      const Icon = feat.icon;
                      return (
                        <Link
                          key={feat.href}
                          href={feat.href}
                          className="group flex items-center gap-3.5 p-2.5 sm:p-3 rounded-2xl transition-all duration-200 hover:bg-gradient-to-r hover:from-white/90 hover:to-brand-50/40 dark:hover:bg-zinc-800/80 hover:shadow-sm border border-transparent hover:border-brand-500/20"
                        >
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center text-white shrink-0 shadow-sm shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200`}>
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

                  {/* Sleek Bottom Fadeout Hint */}
                  <div className="pointer-events-none -mx-6 -mb-6 mt-2 pt-4 pb-2 bg-gradient-to-t from-white/95 dark:from-zinc-900/95 to-transparent flex items-center justify-center">
                    <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                      <span>Scroll to view all tools</span>
                      <span>↓</span>
                    </span>
                  </div>
                </div>
              </div>
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
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            variants={containerVariants}
          >
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <motion.div key={tool.href} variants={itemVariants}>
                  <Link href={tool.href} className="block group h-full">
                    <div className="glass-card p-7 sm:p-8 h-full flex flex-col justify-between rounded-3xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand-500/10 hover:border-brand-500/30">
                      <div>
                        <div className="flex items-start justify-between gap-4 mb-6">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-1 transition-all duration-300 shadow-md`}>
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors group-hover:bg-brand-500/10 group-hover:text-brand-600 dark:group-hover:text-brand-300">
                            {tool.badge}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold font-display text-zinc-900 dark:text-white mb-1.5 flex items-center gap-2">
                          {tool.title}
                          <ArrowRight className="w-4 h-4 text-brand-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-300" />
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
                        <span className="text-brand-500 group-hover:underline flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-200">
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
                  className="glass-card p-6 text-center rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-brand-500/30 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4 text-brand-500 group-hover:scale-110 transition-transform duration-300">
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

      {/* ============ WHY CHOOSE COMPIXOR AI ============ */}
      <WhyChooseCompixor />

      {/* ============ CUSTOMER FEEDBACK & TESTIMONIALS ============ */}
      <CustomerTestimonials />

      {/* ============ FAQ ACCORDION ============ */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black font-display text-zinc-900 dark:text-white mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Got questions? We&apos;ve got answers.
          </p>
        </div>

        <HomeFaqAccordion faqs={homeFaqs} />
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
