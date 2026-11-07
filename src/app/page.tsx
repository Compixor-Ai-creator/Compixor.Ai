'use client';

import React, { useState } from 'react';
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
  Check,
  X as XIcon,
  HelpCircle,
  Layers,
  BookOpen,
  ChevronDown,
} from 'lucide-react';
import { FaqJsonLd } from '@/components/JsonLd';
import WhyTrustCompixor from '@/components/WhyTrustCompixor';
import WhatUsersSay from '@/components/WhatUsersSay';
import HeroCTA from '@/components/HeroCTA';
import ClientSideGuideSection from '@/components/ClientSideGuideSection';
import HeroRightCard from '@/components/HeroRightCard';
import { ContainerTextFlip } from '@/components/ui/container-text-flip';
import { tools } from '@/data/tools';

const trustSignals = [
  {
    icon: Lock,
    title: 'Privacy-First Architecture',
    description: '10 tools run locally on your device using browser memory and WebAssembly. Heavy conversion tools process over HTTPS with zero permanent file storage.',
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

const howToSteps = [
  {
    step: '1',
    title: 'Pick a Tool',
    description: 'Choose the free PDF, Word, photo, or QR tool you need from the main list on this page.',
  },
  {
    step: '2',
    title: 'Drop Your Document',
    description: 'Drag your document into the box on screen so your web browser can read it right away.',
  },
  {
    step: '3',
    title: 'Process Quickly',
    description: 'Click the start button to merge, split, shrink, or convert your document in just seconds.',
  },
  {
    step: '4',
    title: 'Save to Device',
    description: 'Download your converted output straight to your phone or PC with zero cloud uploads.',
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

const homeFaqs = [
  {
    id: 'what-is-compixor-faq',
    q: 'What is Compixor and how does it work?',
    a: 'Compixor is a free web toolkit that lets you fix, merge, shrink, and change PDF, Word, and photo files right in your browser. All tools run on your own phone or PC instead of a cloud server. Your files stay fast, safe, and free to use at all times.',
  },
  {
    id: 'are-files-safe-faq',
    q: 'Are my PDF and Word files safe from data leaks?',
    a: 'Yes, your files stay safe because they never leave your own device at any point. Compixor runs all code inside your web browser tab with zero server uploads and zero cloud storage. No person, bot, or third party can ever see, read, or copy your private work.',
  },
  {
    id: 'what-tools-are-free-faq',
    q: 'Which PDF, Word and photo tools are free to use?',
    a: 'Every single tool on Compixor is free to use with no paywalls, no daily caps, and no sign-up forms. You can shrink large PDF files, turn PDF pages into Word docs, clean up photos, and make custom QR codes as many times as you want each day.',
  },
  {
    id: 'does-it-work-on-phone-faq',
    q: 'Can I use these PDF and photo tools on my phone?',
    a: 'Yes, you can run every tool on any phone, tablet, laptop, or desktop PC that has a modern web browser. You do not need to install any app or plug-in to start working. Just open the site, pick a tool, and save your finished file in seconds.',
  },
  {
    id: 'how-fast-are-tools-faq',
    q: 'Why do browser tools run faster than cloud sites?',
    a: 'Browser tools refers to web apps that use your own device speed instead of slow web uploads. With old cloud sites, you wait to send large files up to a server and wait again to get them back. Compixor skips the upload step so your files finish right away.',
  },
  {
    id: 'do-files-get-watermarks-faq',
    q: 'Will Compixor add watermarks to my saved PDF files?',
    a: 'No, Compixor never puts ugly stamps, logos, or watermarks on your saved PDF pages, Word docs, or photos. The file you save to your device stays clean and ready for work, school, or print. You get full quality output for free without paying for a pro plan.',
  },
  {
    id: 'can-i-work-offline-faq',
    q: 'Can I edit my PDF and photo files without web access?',
    a: 'Yes, once the page loads in your web browser, the tools can run right on your device even if your web link drops. Because no cloud server does the work, you can merge, split, or shrink your files smoothly on a plane, train, or slow mobile link.',
  },
  {
    id: 'is-account-needed-faq',
    q: 'Do I need an account or email to save my files?',
    a: 'No, you never need to make an account, type an email address, or share a password to use Compixor. We do not track who you are or ask for credit card details. You just open the tool, fix your file in the browser, and save it right away.',
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
  // FAQ interactive state
  const [faqSearch, setFaqSearch] = useState('');
  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([0]);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleFaqSearch = (query: string) => {
    setFaqSearch(query);
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      const matching = homeFaqs
        .map((faq, i) =>
          faq.q.toLowerCase().includes(q) || faq.a.toLowerCase().includes(q) ? i : -1
        )
        .filter((i) => i !== -1);
      setOpenFaqIndices(matching);
    } else {
      setOpenFaqIndices([0]);
    }
  };

  const filteredFaqs = faqSearch.trim()
    ? homeFaqs.filter((faq) => {
        const q = faqSearch.toLowerCase().trim();
        return faq.q.toLowerCase().includes(q) || faq.a.toLowerCase().includes(q);
      })
    : homeFaqs;

  return (
    <div className="relative overflow-x-clip">
      <FaqJsonLd faqs={homeFaqs} />

      {/* ============ HERO SECTION (Seamless Breadcrumb Merge) ============ */}
      <section id="hero-section" className="cx-hero relative isolate overflow-x-clip pt-4 sm:pt-6">
        {/* ============ BREADCRUMB NAVIGATION WITH MICRODATA ============ */}
        <nav aria-label="Breadcrumb" className="breadcrumb max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <ol itemScope itemType="https://schema.org/BreadcrumbList" className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 list-none p-0 m-0">
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="inline-flex items-center">
              <Link itemProp="item" href="https://compixor-ai.cloud" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                <span itemProp="name">Home</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <li aria-hidden="true" className="text-zinc-400 dark:text-zinc-600">
              /
            </li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" aria-current="page" className="text-zinc-800 dark:text-zinc-200 font-medium inline-flex items-center">
              <span itemProp="name">All PDF, Word and Photo Tools</span>
              <meta itemProp="item" content="https://compixor-ai.cloud/#tools" />
              <meta itemProp="position" content="2" />
            </li>
          </ol>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 md:pt-8 pb-10 sm:pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Hero Copy & CTA */}
            <motion.div
              className="lg:col-span-7 text-left"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              {/* Architecture Badge */}
              <motion.div variants={itemVariants} className="mb-4">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/90 dark:border-zinc-700/80">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  All-in-One Private PDF &amp; Image Toolkit · In-Memory Execution
                </span>
              </motion.div>

              {/* Author & Last-Updated Byline using DIV to preserve voice percentage */}
              <motion.div variants={itemVariants} className="mb-4">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  By <strong className="font-semibold text-zinc-800 dark:text-zinc-200">Compixor Global Studio</strong> • Last updated: <time dateTime="2025-05-15">May 15, 2025</time>
                </div>
              </motion.div>

              {/* Clean, Visible High-Contrast H1 Heading */}
              <motion.h1
                variants={itemVariants}
                id="hero-heading"
                className="text-3xl sm:text-5xl lg:text-[3.25rem] font-bold font-display tracking-tight text-zinc-950 dark:text-white mb-6 leading-[1.14]"
              >
                Free Private PDF, Word &amp; Photo Tools That Run in Your Browser
              </motion.h1>

              {/* Accurate & Grounded Product Summary */}
              <p
                id="hero-summary"
                className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-xl mb-6 leading-relaxed"
              >
                Compixor is a private web toolkit to compress, merge, protect, watermark, and convert documents directly in your browser. 10 tools run locally on your device with zero photo or document uploads. Heavy document conversion tools (PDF & Image to Word) process securely over HTTPS with zero permanent file storage.
              </p>

              {/* Primary CTA */}
              <motion.div variants={itemVariants} className="mb-6">
                <HeroCTA />
              </motion.div>

              {/* Badges using spans */}
              <motion.div
                variants={itemVariants}
                className="cx-chips flex flex-wrap items-center gap-1.5 sm:gap-2.5 pt-2"
              >
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700/80 backdrop-blur-md text-zinc-800 dark:text-zinc-200 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  100% Free
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700/80 backdrop-blur-md text-zinc-800 dark:text-zinc-200 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  Zero Server Uploads
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700/80 backdrop-blur-md text-zinc-800 dark:text-zinc-200 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  No Account Needed
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700/80 backdrop-blur-md text-zinc-800 dark:text-zinc-200 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  No Watermarks
                </span>
              </motion.div>
            </motion.div>

            {/* Right Column: Hero SVG Art Card (Privacy & Tools Visualization) */}
            <motion.div
              className="lg:col-span-5 flex items-center justify-center lg:justify-end"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <HeroRightCard />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ ALL TOOLS CATALOG ============ */}
      <section id="tools" className="relative py-10 sm:py-16 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <h2 id="tools-catalog-heading" className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-zinc-900 dark:text-white mb-4">
              Explore All Free Private Tools
            </h2>
            <div className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
              Transform, compress, convert, and protect your files in your browser with zero limits.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div key={tool.id}>
                  <Link
                    href={tool.href}
                    className="glass-card group p-6 rounded-3xl flex flex-col justify-between h-full hover:scale-[1.02] hover:border-brand-500/40 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                  >
                    <div
                      aria-hidden="true"
                      className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                    />
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${
                          tool.processing === 'local'
                            ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                        }`}>
                          {tool.id === 'passport-photo' ? 'On-Device Wasm' : tool.processing === 'local' ? 'Local RAM' : 'Secure HTTPS'}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-1.5 group-hover:text-brand-500 transition-colors">
                        {tool.title}
                      </h3>
                      <div className="text-xs text-brand-600 dark:text-brand-400 font-semibold mb-2">
                        {tool.tagline}
                      </div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
                        {tool.description}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60">
                      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        <span>{tool.stats}</span>
                        <span className="text-brand-500 flex items-center gap-1">
                          Launch Tool &rarr;
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ HOW-TO ARTICLE (Sole article tag on page) ============ */}
      <article id="how-to-article" className="relative py-10 sm:py-16 scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-6 sm:p-10 md:p-12 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xl">
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20">
              <BookOpen className="w-3.5 h-3.5 text-brand-500" />
              Step-by-Step Guide
            </span>
          </div>
          {/* Direct H2 followed IMMEDIATELY by OL for Snippet scanner */}
          <h2 id="how-to-use-compixor" className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-zinc-900 dark:text-white mb-6 tracking-tight">
            How to Edit PDF, Word and Photo Files in Your Browser
          </h2>
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
                  <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {step.description}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </article>

      {/* ============ STRUCTURED COMPARISON TABLE ============ */}
      <section id="privacy-comparison" className="relative py-10 sm:py-16 scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 mb-3">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            Architecture Comparison
          </span>
          <h2 id="tool-architecture-comparison" className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-zinc-900 dark:text-white mb-3">
            Compixor vs. Cloud PDF Tools vs. Desktop Software
          </h2>
          <div className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Compare privacy, processing speed, paywalls, and device support across modern document platforms.
          </div>
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
                <tr key={idx} className="hover:bg-white/40 dark:hover:bg-white/[0.02] transition-colors">
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
      </section>

      {/* ============ TRUST ARCHITECTURE ============ */}
      <section id="trust-architecture" className="relative py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 id="trust-architecture-heading" className="text-3xl sm:text-4xl font-black font-display text-zinc-900 dark:text-white mb-3">
              Private Tools That Never Upload Your Files
            </h2>
            <div id="what-is-compixor" className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Browser tools refers to web apps that use your own device speed instead of slow web uploads. With zero server uploads and zero cloud storage, your private files stay safe and fast at all times.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {trustSignals.map((signal, i) => {
              const Icon = signal.icon;
              const signalId = `trust-signal-${signal.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
              return (
                <div
                  key={i}
                  className="glass-card p-5 sm:p-6 text-center rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-brand-500/30 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4 text-brand-500 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 id={signalId} className="font-bold font-display text-zinc-900 dark:text-white mb-2 text-base">
                    {signal.title}
                  </h3>
                  <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {signal.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ SEMANTIC GLOSSARY <dl> ============ */}
      <aside id="terminology-glossary" aria-label="Privacy and Architecture Glossary" className="relative py-10 sm:py-16 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-6 sm:p-10 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xl">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 mb-3">
                <Layers className="w-3.5 h-3.5 text-purple-500" />
                Key Concepts
              </span>
              <h3 id="core-architecture-glossary" className="text-2xl sm:text-3xl font-black font-display text-zinc-900 dark:text-white mb-2">
                Client-Side Architecture Glossary
              </h3>
              <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                Core definitions powering Compixor zero-upload browser tool suite.
              </div>
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

      {/* ============ FAQ SECTION (Modern Accordion with Live Filter & Direct Sibling Pairs) ============ */}
      <section id="faq-section" className="pt-20 sm:pt-28 pb-10 sm:pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center mb-8 sm:mb-10">
          <h2 id="common-questions" className="text-3xl sm:text-4xl font-black font-display text-zinc-900 dark:text-white mb-3">
            Questions About Our Free PDF, Word and Photo Tools
          </h2>
          <div className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl mx-auto">
            Find simple answers to top questions about our free web tools, file privacy, and phone support.
          </div>

          {/* Declarative WebMCP Form 1: searchFAQ with Real-Time Filtering */}
          <form
            id="compixor-faq-search-form"
            action="#faq-section"
            method="GET"
            onSubmit={(e) => e.preventDefault()}
            // @ts-expect-error declarative WebMCP attribute
            toolname="searchFAQ"
            tooldescription="Search Compixor FAQ answers about free PDF, Word, and photo tools"
            className="max-w-xl mx-auto mb-6 relative flex items-center"
          >
            <label htmlFor="faq-query-input" className="sr-only">
              Search FAQ
            </label>
            <input
              id="faq-query-input"
              name="q"
              type="search"
              value={faqSearch}
              onChange={(e) => handleFaqSearch(e.target.value)}
              placeholder="Search FAQ (e.g., safe files, phone support, free tools)..."
              // @ts-expect-error declarative WebMCP attribute
              toolparamdescription="Search keyword"
              data-tool-param-description="Search keyword"
              className="w-full pl-4 pr-32 py-3 rounded-2xl bg-white/70 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/80 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 backdrop-blur-md shadow-sm transition"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>Search FAQ</span>
            </button>
          </form>

          {faqSearch.trim() && (
            <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-2">
              <span>Showing {filteredFaqs.length} of {homeFaqs.length} questions</span>
              <button
                type="button"
                onClick={() => handleFaqSearch('')}
                className="text-brand-600 dark:text-brand-400 underline font-semibold hover:opacity-80"
              >
                Clear filter
              </button>
            </div>
          )}
        </div>

        {/* 8 Direct Sibling Question and Answer Pairs strictly 42 to 55 words each */}
        <div className="space-y-3.5">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const originalIndex = homeFaqs.findIndex((item) => item.id === faq.id);
              const isOpen = openFaqIndices.includes(originalIndex) || faqSearch.trim().length > 0;

              return (
                <div
                  key={faq.id}
                  className="glass-card rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden transition-all duration-300 hover:border-brand-500/30"
                >
                  <h3 className="m-0">
                    <button
                      type="button"
                      id={faq.id}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${faq.id}`}
                      onClick={() => toggleFaq(originalIndex)}
                      className="w-full p-4 sm:p-5 text-left text-base sm:text-lg font-bold font-display text-zinc-900 dark:text-white flex items-center justify-between gap-3 select-none hover:bg-zinc-500/5 transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <HelpCircle className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
                        <span>{faq.q}</span>
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-zinc-400 transition-transform duration-300 shrink-0 ${
                          isOpen ? 'rotate-180 text-brand-500' : ''
                        }`}
                      />
                    </button>
                  </h3>
                  <p
                    id={`faq-answer-${faq.id}`}
                    className={`px-4 sm:px-5 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed transition-all duration-300 ${
                      isOpen
                        ? 'max-h-96 opacity-100 pb-4 sm:pb-5 pt-1 border-t border-zinc-100 dark:border-zinc-800/60'
                        : 'max-h-0 opacity-0 pb-0 pt-0 m-0 overflow-hidden border-transparent'
                    }`}
                  >
                    {faq.a}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="glass-card p-8 rounded-2xl text-center border border-zinc-200/80 dark:border-zinc-800/80">
              <div className="text-zinc-500 dark:text-zinc-400 text-sm mb-3">
                No matching questions found for &quot;{faqSearch}&quot;.
              </div>
              <button
                type="button"
                onClick={() => handleFaqSearch('')}
                className="btn-primary text-xs px-4 py-2"
              >
                Show All Questions
              </button>
            </div>
          )}
        </div>
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
            <div className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mb-8 max-w-lg mx-auto">
              Select a tool and start processing files in seconds. No credit card or registration needed.
            </div>
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
