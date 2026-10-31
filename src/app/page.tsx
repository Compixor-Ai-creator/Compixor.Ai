'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Shield,
  Zap,
  Lock,
  ArrowRight,
  Sparkles,
  MonitorSmartphone,
  CheckCircle2,
  Cpu,
  Check,
  X as XIcon,
  HelpCircle,
  FileCheck,
  Server,
  Layers,
  BookOpen,
} from 'lucide-react';
import { FaqJsonLd } from '@/components/JsonLd';
import HomeFaqAccordion from '@/components/HomeFaqAccordion';
import WhyTrustCompixor from '@/components/WhyTrustCompixor';
import WhatUsersSay from '@/components/WhatUsersSay';
import HeroCTA from '@/components/HeroCTA';
import ClientSideGuideSection from '@/components/ClientSideGuideSection';
import { ContainerTextFlip } from '@/components/ui/container-text-flip';
import { tools } from '@/data/tools';

const trustSignals = [
  {
    icon: Lock,
    title: 'Privacy-First Architecture',
    description: '9 tools run 100% locally in your browser memory using WebAssembly. Server tools delete files immediately after processing.',
  },
  {
    icon: Zap,
    title: 'Instant Execution',
    description: 'No network queue or server waiting times. Transforms complete in milliseconds right on your device.',
  },
  {
    icon: Shield,
    title: 'Privacy By Architecture',
    description: 'Maximum privacy across all utilities with zero tracking, zero permanent storage, and zero data leakage.',
  },
  {
    icon: MonitorSmartphone,
    title: 'Cross-Platform',
    description: 'Runs flawlessly on desktop browsers, tablets, iOS Safari, Android Chrome, and Linux systems.',
  },
];

const homeFaqs = [
  {
    q: 'What is client-side PDF processing?',
    a: 'Client-side PDF processing refers to executing all document transformations directly within the user web browser memory using WebAssembly and HTML5 Canvas. Unlike conventional cloud converters, zero document bytes are transmitted across the internet to external servers, delivering instantaneous processing speed while maintaining total confidentiality for sensitive personal and corporate records.',
  },
  {
    q: 'Are my files uploaded to Compixor servers?',
    a: 'No, your files are not uploaded to remote servers for 9 of our core client-side tools. Processing happens exclusively in your device local memory. For our 3 server-assisted OCR and passport tools, files are transmitted over TLS-encrypted HTTPS, processed immediately in temporary RAM, and purged with zero permanent retention.',
  },
  {
    q: 'How does Compixor compress and edit files for free?',
    a: 'Compixor eliminates expensive cloud server hosting by offloading computational tasks directly to your browser CPU and GPU via WebAssembly. Because we avoid heavy cloud infrastructure costs, we provide 100% free, unlimited document utilities with zero paywalls, no artificial file queues, and zero forced watermarks on exported files.',
  },
  {
    q: 'Is client-side document processing secure for sensitive business files?',
    a: 'Yes, client-side document processing provides the highest standard of data security for confidential contracts, legal briefs, and financial statements. Because files never leave your local browser sandbox, there is zero risk of server data breaches, third-party snooping, or unauthorized cloud storage exposure.',
  },
  {
    q: 'Can I print biometric passport photos made on Compixor at retail stores?',
    a: 'Yes, Compixor renders biometric passport photo sheets at exact 300 DPI resolution calibrated for standard 4x6 inch photographic paper. You can save your generated printable grid and print it for pennies at retail kiosks including CVS, Walgreens, Boots, Walmart, or any standard photo printer.',
  },
  {
    q: 'Is there a limit on how many files I can process?',
    a: 'No, Compixor imposes zero artificial restrictions on file count or session duration. You can merge, compress, protect, and convert as many documents as your workflow requires without encountering daily quotas, hourly waiting periods, or subscription upgrade prompts.',
  },
];

const howToSteps = [
  {
    step: '1',
    title: 'Select Your Utility',
    description: 'Choose any of our 12 browser-native utilities for PDF compression, page merging, watermark removal, or photo formatting.',
  },
  {
    step: '2',
    title: 'Open Your Local File',
    description: 'Drag and drop or browse files from your device. Documents load directly into isolated browser RAM without server upload delays.',
  },
  {
    step: '3',
    title: 'Configure Your Settings',
    description: 'Fine-tune compression levels, page ranges, passport dimensions, or AES-256 encryption passwords with live previews.',
  },
  {
    step: '4',
    title: 'Export Instantly',
    description: 'Download your high-fidelity documents immediately. Your browser garbage collector clears memory buffers automatically.',
  },
];

const comparisonData = [
  {
    feature: 'File Privacy & Uploads',
    compixor: 'Zero server uploads; runs 100% in local browser RAM',
    cloud: 'Uploaded to third-party cloud servers overseas',
    desktop: 'Local disk execution; requires full machine access',
  },
  {
    feature: 'Processing Speed',
    compixor: 'Instant memory-bus speed (milliseconds execution)',
    cloud: 'Slow upload/download queues dependent on broadband',
    desktop: 'Fast local processing speed',
  },
  {
    feature: 'Cost & Paywalls',
    compixor: '100% Free with zero limits and no watermarks',
    cloud: '$15–$25 monthly subscriptions or strict hourly caps',
    desktop: '$100–$300+ expensive perpetual licenses',
  },
  {
    feature: 'Device Compatibility',
    compixor: 'Works on any device with a modern web browser',
    cloud: 'Web-based but requires high continuous bandwidth',
    desktop: 'Locked to specific OS (Windows or macOS only)',
  },
  {
    feature: 'Account Requirements',
    compixor: 'Zero sign-ups, no logins, and zero email tracking',
    cloud: 'Mandatory registration, email capture, and logins',
    desktop: 'License activation and periodic account checks',
  },
];

const glossaryTerms = [
  {
    term: 'Client-Side Processing',
    definition: 'Executing data transformations, document rendering, and image filtering directly within the end-user browser memory (RAM) without transmitting raw bytes to any external server.',
  },
  {
    term: 'Zero Data Leak Architecture',
    definition: 'A privacy-first software paradigm guaranteeing that user documents, personal identifiers, and file metadata are never stored on persistent disks, analytics databases, or remote servers.',
  },
  {
    term: 'Browser WebAssembly Sandbox',
    definition: 'A high-performance, secure binary execution environment built into modern web browsers that executes near-native assembly code in isolated memory boundaries.',
  },
  {
    term: 'Biometric 300 DPI Standard',
    definition: 'The official physical print density standard (300 dots per inch) required by international government passport agencies (e.g., US State Department, Schengen, NADRA) for physical photo prints.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function HomePage() {
  return (
    <div className="relative overflow-x-clip">
      <FaqJsonLd faqs={homeFaqs} />

      {/* ============ BREADCRUMB NAVIGATION ============ */}
      <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <ol className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <li>
            <Link
              href="https://compixor-ai.cloud"
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              Home
            </Link>
          </li>
          <li aria-hidden="true" className="text-zinc-400 dark:text-zinc-600">
            /
          </li>
          <li aria-current="page" className="text-zinc-800 dark:text-zinc-200 font-medium">
            All PDF, Word &amp; Photo Tools
          </li>
        </ol>
      </nav>

      {/* ============ HERO HEADER SECTION ============ */}
      <header id="hero-section" className="relative isolate overflow-hidden">
        {/* Visible Purple & Pink Blurred Blobs Behind Hero Content */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -z-10 w-[420px] h-[420px] rounded-full blur-[80px] opacity-55"
          style={{
            top: '-80px',
            left: '-80px',
            backgroundColor: '#8b5cf6',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -z-10 w-[420px] h-[420px] rounded-full blur-[80px] opacity-55"
          style={{
            top: '120px',
            right: '10%',
            backgroundColor: '#ec4899',
          }}
        />

        {/* Architectural Dot Matrix Grid and Aurora Canopies */}
        <div
          aria-hidden="true"
          className="hidden md:block pointer-events-none absolute -z-10 inset-0 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(rgba(124,58,237,0.12)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_75%_55%_at_50%_35%,black_40%,transparent_100%)] pointer-events-none" />

          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1100px] h-[580px] rounded-full opacity-45 dark:opacity-30 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 85% 60% at 50% -10%, rgba(124, 58, 237, 0.40) 0%, rgba(99, 102, 241, 0.28) 28%, rgba(244, 63, 94, 0.22) 55%, rgba(251, 146, 60, 0.16) 75%, transparent 95%)',
              filter: 'blur(110px)',
            }}
          />

          <div
            className="absolute top-4 -left-28 w-[640px] h-[520px] rounded-full opacity-40 dark:opacity-25 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 35% 40%, rgba(124, 58, 237, 0.35) 0%, rgba(99, 102, 241, 0.20) 45%, transparent 75%)',
              filter: 'blur(110px)',
            }}
          />

          <div
            className="absolute top-2 -right-16 w-[720px] h-[560px] rounded-full opacity-45 dark:opacity-30 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 70% 60% at 55% 45%, rgba(244, 63, 94, 0.28) 0%, rgba(251, 146, 60, 0.20) 35%, rgba(168, 85, 247, 0.14) 65%, transparent 85%)',
              filter: 'blur(120px)',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 md:pt-16 pb-10 sm:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Hero Copy & CTA with smooth stagger */}
            <motion.div
              className="lg:col-span-7 text-left"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              {/* Badge */}
              <motion.div variants={itemVariants} className="mb-4">
                <span
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-white/45 dark:bg-white/[0.08] text-brand-700 dark:text-brand-300 border border-white/60 dark:border-white/20 shadow-[0_8px_32px_rgba(124,58,237,0.12)] animate-float-subtle"
                  style={{
                    WebkitBackdropFilter: 'blur(14px) saturate(160%)',
                    backdropFilter: 'blur(14px) saturate(160%)',
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-500 animate-spin-slow" />
                  All-in-One Private PDF &amp; Image Toolkit
                </span>
              </motion.div>

              {/* Author & Last-Updated Metadata */}
              <motion.div variants={itemVariants} className="mb-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  By <strong className="font-semibold text-zinc-800 dark:text-zinc-200">Haroon Ali</strong> (Compixor AI) · Last updated: <time dateTime="2026-10-31">October 31, 2026</time>
                </p>
              </motion.div>

              {/* Single Clean Sentence H1 for Crawlers & Accessibility */}
              <h1 id="hero-heading" className="sr-only">
                Free Private PDF, Word &amp; Photo Tools That Run in Your Browser
              </h1>

              {/* Visual Display Heading */}
              <div
                aria-hidden="true"
                className="font-black font-display mb-6 tracking-tight"
                style={{
                  fontSize: 'clamp(1.65rem, 5.5vw, 4.25rem)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                }}
              >
                <span className="block whitespace-nowrap">
                  <span className="text-zinc-900 dark:text-white">Transform </span>
                  <span className="bg-gradient-to-r from-brand-600 via-purple-600 to-rose-500 bg-clip-text text-transparent">
                    Your Files.
                  </span>
                </span>
                <span aria-hidden="true" className="block max-w-full">
                  <span className="inline-flex flex-wrap items-baseline gap-x-[0.25em] gap-y-1 sm:whitespace-nowrap">
                    <span className="text-zinc-900 dark:text-white">Privacy </span>
                    <ContainerTextFlip
                      words={['First.', 'Guaranteed.', 'Protected.']}
                      interval={3000}
                      textClassName="bg-gradient-to-r from-brand-600 via-purple-600 to-rose-500 bg-clip-text text-transparent font-black font-display"
                    />
                  </span>
                </span>
              </div>

              {/* Answer-Targeting Definition Paragraph (Featured Snippet Pattern) */}
              <p
                id="hero-summary"
                className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mb-6 leading-relaxed"
              >
                Compixor is a free online PDF, Word, photo, and QR toolkit that runs inside your web browser. Every tool processes your files locally on your device with zero server uploads and zero data leaks. You can merge, compress, convert, and edit documents in seconds without sign-ups.
              </p>

              {/* Declarative WebMCP Tool Search Form */}
              <motion.div variants={itemVariants} className="mb-6">
                <form
                  id="compixor-tool-search-form"
                  action="#tools"
                  method="GET"
                  // @ts-expect-error declarative WebMCP attribute
                  toolname="searchCompixorTools"
                  tooldescription="Search and filter free client-side PDF, Word, photo, and QR tools that run locally in the browser"
                  className="max-w-xl relative flex items-center"
                >
                  <label htmlFor="tool-query-input" className="sr-only">
                    Find a browser tool
                  </label>
                  <input
                    id="tool-query-input"
                    name="q"
                    type="search"
                    placeholder="Find tool (e.g., Merge PDF, PDF to Word, Compress Photo...)"
                    // @ts-expect-error declarative WebMCP attribute
                    toolparamdescription="Keyword or file format to filter available Compixor client-side tools"
                    className="w-full pl-4 pr-28 py-3 rounded-2xl bg-white/70 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/80 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 backdrop-blur-md shadow-sm transition"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <span>Search</span>
                  </button>
                </form>
              </motion.div>

              {/* Primary CTA */}
              <motion.div variants={itemVariants}>
                <HeroCTA />
              </motion.div>

              {/* Sub-tags / Badges */}
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 pt-4"
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
                  9 Tools Run Locally
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700/80 backdrop-blur-md text-zinc-800 dark:text-zinc-200 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  No Sign-Up Required
                </span>
              </motion.div>
            </motion.div>

            {/* Right Column: Core Tools Feature Highlight Card */}
            <motion.div
              className="lg:col-span-5 hidden lg:block"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative">
                <div className="absolute -top-3.5 -left-3.5 z-20 hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold glass-pill text-brand-600 dark:text-brand-300 animate-float-subtle">
                  <Sparkles className="w-3 h-3 text-brand-500" />
                  <span>Private &amp; Fast</span>
                </div>

                <div className="absolute -bottom-3.5 -right-3.5 z-20 hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold glass-pill text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Privacy First</span>
                </div>

                <div className="glass-panel p-5 sm:p-6 rounded-[22px] relative overflow-hidden flex flex-col hover:border-brand-500/30 transition-all duration-300">
                  <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-500/70 via-rose-400/60 to-transparent pointer-events-none" />
                  <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-br from-rose-500/15 via-amber-400/10 to-transparent blur-2xl pointer-events-none" />

                  <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-white/60 dark:border-white/10 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                        Core Toolkit
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Private Suite
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-300 border border-brand-500/20">
                      {tools.length} Tools Available
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1 overscroll-contain no-scrollbar">
                    {tools.map((feat) => {
                      const Icon = feat.navIcon || feat.icon;
                      return (
                        <Link
                          key={feat.href}
                          href={feat.href}
                          className="group flex items-center gap-3.5 p-2.5 sm:p-3 rounded-2xl transition-all duration-200 hover:bg-white/70 dark:hover:bg-white/10 hover:shadow-xs border border-transparent hover:border-white/80 dark:hover:border-white/10"
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

                  <div className="pointer-events-none -mx-6 -mb-6 mt-2 pt-4 pb-2 bg-gradient-to-t from-white/80 dark:from-surface-950/80 to-transparent flex items-center justify-center">
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
      </header>

      {/* ============ TOOLS SUITE GRID ============ */}
      <section id="tools" className="relative py-10 sm:py-16 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-8 sm:mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 id="tools-suite-heading" className="text-3xl sm:text-4xl font-black font-display text-zinc-900 dark:text-white mb-3">
              Free Online PDF, Word &amp; Photo Tools
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
              Every tool is engineered for lightning execution, maximum file fidelity, and absolute privacy.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.02 }}
            variants={containerVariants}
          >
            {tools.map((tool) => {
              const Icon = tool.icon;
              const toolId = `tool-${tool.href.replace('/tools/', '')}`;
              return (
                <motion.article key={tool.href} variants={itemVariants}>
                  <Link href={tool.href} className="block group h-full">
                    <div className="glass-card p-5 sm:p-7 md:p-8 h-full flex flex-col justify-between rounded-[22px] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand-500/10">
                      <div>
                        <div className="flex items-start justify-between gap-4 mb-6">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-1 transition-all duration-300 shadow-md`}>
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full glass-pill text-zinc-700 dark:text-zinc-200 transition-colors group-hover:border-brand-500/40 group-hover:text-brand-600 dark:group-hover:text-brand-300">
                            {tool.badge}
                          </span>
                        </div>

                        <h3 id={toolId} className="text-xl font-bold font-display text-zinc-900 dark:text-white mb-1.5 flex items-center gap-2">
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
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ============ HOW-TO ORDERED LIST SECTION ============ */}
      <section id="how-to-use" className="relative py-10 sm:py-16 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-6 sm:p-10 md:p-12 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xl">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20 mb-3">
                <BookOpen className="w-3.5 h-3.5 text-brand-500" />
                Step-by-Step Guide
              </span>
              <h2 id="how-to-process-files" className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-zinc-900 dark:text-white mb-3">
                How to Edit PDF, Word &amp; Photo Files Privately in Your Browser
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                Follow these four simple steps to process files locally on your device with complete privacy.
              </p>
            </div>

            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 list-none p-0 m-0">
              {howToSteps.map((step) => (
                <li
                  key={step.step}
                  className="p-5 sm:p-6 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-brand-600 text-white font-black text-sm flex items-center justify-center mb-4 shadow-sm shadow-brand-500/30">
                      {step.step}
                    </div>
                    <h3 id={`how-to-step-${step.step}`} className="text-base font-bold font-display text-zinc-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ============ STRUCTURED COMPARISON TABLE ============ */}
      <section id="privacy-comparison" className="relative py-10 sm:py-16 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 mb-3">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              Architecture Comparison
            </span>
            <h2 id="tool-architecture-comparison" className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-zinc-900 dark:text-white mb-3">
              Compixor vs. Cloud PDF Tools vs. Desktop Software
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
              See why client-side execution delivers superior confidentiality, lower latency, and zero subscription costs.
            </p>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 shadow-xl overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/80">
                  <th scope="col" className="p-4 sm:p-5 font-bold text-zinc-900 dark:text-white min-w-[160px]">
                    Feature / Capability
                  </th>
                  <th scope="col" className="p-4 sm:p-5 font-bold text-brand-700 dark:text-brand-300 bg-brand-500/5 min-w-[200px]">
                    Compixor (Client-Side)
                  </th>
                  <th scope="col" className="p-4 sm:p-5 font-bold text-zinc-700 dark:text-zinc-300 min-w-[180px]">
                    Traditional Cloud Tools
                  </th>
                  <th scope="col" className="p-4 sm:p-5 font-bold text-zinc-700 dark:text-zinc-300 min-w-[180px]">
                    Desktop Software
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                {comparisonData.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-white/40 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <th scope="row" className="p-4 sm:p-5 font-semibold text-zinc-900 dark:text-white">
                      {row.feature}
                    </th>
                    <td className="p-4 sm:p-5 font-medium text-brand-700 dark:text-brand-300 bg-brand-500/5">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{row.compixor}</span>
                      </div>
                    </td>
                    <td className="p-4 sm:p-5 text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-start gap-2">
                        <XIcon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>{row.cloud}</span>
                      </div>
                    </td>
                    <td className="p-4 sm:p-5 text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold shrink-0 mt-0.5">~</span>
                        <span>{row.desktop}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ============ TRUST ARCHITECTURE ============ */}
      <section id="trust-architecture" className="relative py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-8 sm:mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 id="trust-architecture-heading" className="text-3xl sm:text-4xl font-black font-display text-zinc-900 dark:text-white mb-3">
              Private Tools That Never Upload Your Files
            </h2>
            <p id="what-is-compixor" className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Client-side PDF processing refers to executing all document transformations directly within the user web browser memory using WebAssembly and HTML5 Canvas, completely eliminating the need to transmit private document bytes across the network to external cloud servers.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {trustSignals.map((signal, i) => {
              const Icon = signal.icon;
              const signalId = `trust-signal-${signal.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
              return (
                <motion.article
                  key={i}
                  variants={itemVariants}
                  className="glass-card p-5 sm:p-6 text-center rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-brand-500/30 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4 text-brand-500 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 id={signalId} className="font-bold font-display text-zinc-900 dark:text-white mb-2 text-base">
                    {signal.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {signal.description}
                  </p>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ============ SEMANTIC GLOSSARY <dl> ============ */}
      <aside id="terminology-glossary" aria-label="Privacy and Architecture Glossary" className="relative py-10 sm:py-16 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-6 sm:p-10 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xl">
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 mb-3">
                <Layers className="w-3.5 h-3.5 text-purple-500" />
                Key Concepts
              </span>
              <h3 id="core-architecture-glossary" className="text-2xl sm:text-3xl font-black font-display text-zinc-900 dark:text-white mb-2">
                Client-Side Architecture Glossary
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                Core definitions powering Compixor zero-upload browser tool suite.
              </p>
            </div>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {glossaryTerms.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60"
                >
                  <dt className="text-sm font-bold font-display text-zinc-900 dark:text-white mb-1.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-500 inline-block"></span>
                    {item.term}
                  </dt>
                  <dd className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed ml-4">
                    {item.definition}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </aside>

      {/* ============ WHY TRUST COMPIXOR ============ */}
      <WhyTrustCompixor />

      {/* ============ WHAT USERS SAY ============ */}
      <WhatUsersSay />

      {/* ============ CLIENT-SIDE ARCHITECTURE GUIDE ============ */}
      <ClientSideGuideSection />

      {/* ============ FAQ ACCORDION ============ */}
      <section id="faq-section" className="py-10 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center mb-8">
          <h2 id="faq-heading" className="text-3xl font-black font-display text-zinc-900 dark:text-white mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Got questions about browser privacy, WebAssembly, or file security? We have answers.
          </p>

          {/* Declarative WebMCP FAQ Search Form */}
          <form
            id="compixor-faq-form"
            action="#faq-section"
            method="GET"
            // @ts-expect-error declarative WebMCP attribute
            toolname="searchFAQ"
            tooldescription="Search Compixor FAQ answers about local browser privacy, supported formats, and tool usage"
            className="max-w-xl mx-auto mb-8 relative flex items-center"
          >
            <label htmlFor="faq-query-input" className="sr-only">
              Search FAQ
            </label>
            <input
              id="faq-query-input"
              name="faq_query"
              type="search"
              placeholder="Search FAQ (e.g., privacy, file safety, WebAssembly)..."
              // @ts-expect-error declarative WebMCP attribute
              toolparamdescription="Question or keyword to lookup in FAQ knowledge base"
              className="w-full pl-4 pr-32 py-3 rounded-2xl bg-white/70 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/80 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 backdrop-blur-md shadow-sm transition"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>Find Answer</span>
            </button>
          </form>
        </div>

        <HomeFaqAccordion faqs={homeFaqs} />
      </section>

      {/* ============ CTA BOX ============ */}
      <section id="cta-section" className="py-10 sm:py-16 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="hidden md:flex pointer-events-none absolute -z-10 inset-0 items-center justify-center"
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
            className="glow-border p-6 sm:p-10 md:p-14 rounded-3xl"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 id="cta-heading" className="text-2xl sm:text-3xl font-black font-display text-zinc-900 dark:text-white mb-3">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mb-8 max-w-lg mx-auto">
              Select a tool and start processing files in seconds. No credit card or registration needed.
            </p>
            <a
              href="#tools"
              className="btn-primary inline-flex items-center justify-center gap-2 text-sm sm:text-base px-6 sm:px-8 py-3.5 font-bold cursor-pointer w-full sm:w-auto min-h-[44px]"
            >
              <span>Start Now — Make Your Life Easy</span>
              <ArrowRight className="w-5 h-5 shrink-0" />
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
