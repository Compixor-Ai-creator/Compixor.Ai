'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import {
  HelpCircle,
  ChevronDown,
  ArrowRight,
  BookOpen,
  Shield,
  Check,
  X as XIcon,
  Lock,
  Zap,
  MonitorSmartphone,
  Layers,
} from 'lucide-react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { FaqJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd';
import Hero from '@/components/landing/Hero';
import PrivacySteps from '@/components/landing/PrivacySteps';
import UseCases from '@/components/landing/UseCases';
import WhyTrustCompixor from '@/components/WhyTrustCompixor';
import WhatUsersSay from '@/components/WhatUsersSay';
import { tools } from '@/data/tools';
import '@/components/landing/sections.css';
import { REVEAL } from '@/lib/reveal';

const trustSignals = [
  {
    icon: Lock,
    title: 'Client-Side Execution',
    description: '9 tools process 100% inside your local browser memory (RAM) with 0 byte server uploads.',
  },
  {
    icon: Zap,
    title: 'Instant Millisecond Speed',
    description: 'Transforms run directly on your device CPU cores without network latency or server queue delays.',
  },
  {
    icon: Shield,
    title: 'Zero Tracking or Logins',
    description: 'Open any tool and process files immediately with zero sign-ups, no cookies, and no email requests.',
  },
  {
    icon: MonitorSmartphone,
    title: 'Universal Device Support',
    description: 'Runs consistently across modern desktop browsers, tablets, iOS Safari, Android Chrome, and Linux.',
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
    a: 'Compixor is a free web toolkit that lets you fix, merge, shrink, and change PDF, Word, and photo files right in your browser. 9 core tools run directly on your own device with zero uploads, while specialized utilities process securely over HTTPS with zero permanent file storage.',
  },
  {
    id: 'are-files-safe-faq',
    q: 'Are my PDF and Word files safe from data leaks?',
    a: 'Yes, your files stay safe and private. For our 9 client-side tools, files never leave your device and execute locally in browser RAM. For our 3 server-assisted utilities (PDF to Word, Image to Word, and Passport Photo), data is processed over encrypted HTTPS and not stored; deleted right after processing.',
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
    a: 'No, Compixor never puts ugly stamps, logos, or watermarks on your saved PDF pages, Word docs, or photos. You get full quality output for free without paying for a pro plan.',
  },
  {
    id: 'can-i-work-offline-faq',
    q: 'Can I edit my PDF and photo files without web access?',
    a: 'Yes, once the page loads in your web browser, our 9 client-side tools (including PDF merge, split, compress, watermark, and DP maker) run locally on your device without internet access. Our 3 specialized utilities (PDF to Word, Image to Word, and Passport Photo) require a quick secure connection to process without storing anything.',
  },
  {
    id: 'is-account-needed-faq',
    q: 'Do I need an account or email to save my files?',
    a: 'No, you never need to make an account, type an email address, or share a password to use Compixor. We do not track who you are or ask for credit card details. You just open the tool, fix your file in the browser, and save it right away.',
  },
];

type ToolCategory = 'All' | 'PDF' | 'Word' | 'Media';

function StatCountUp({
  target,
  suffix = '',
  reduce = false,
}: {
  target: number;
  suffix?: string;
  reduce?: boolean;
}) {
  const [val, setVal] = useState(target);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    if (reduce || !inView) return;
    let start: number | null = null;
    const dur = 700;
    let frameId: number;

    const animate = (time: number) => {
      if (!start) start = time;
      const progress = Math.min((time - start) / dur, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(ease * target));
      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [inView, reduce, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {reduce ? target : val}{suffix}
    </span>
  );
}

export default function HomePage() {
  const [faqSearch, setFaqSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('All');
  const reduce = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const m = window.matchMedia('(max-width: 768px)');
    const onChange = () => setIsMobile(m.matches);
    onChange();
    m.addEventListener('change', onChange);
    return () => m.removeEventListener('change', onChange);
  }, []);

  const handleFaqSearch = (query: string) => {
    setFaqSearch(query);
  };

  const filteredTools = activeCategory === 'All'
    ? tools
    : tools.filter((tool) => tool.category === activeCategory);

  const filteredFaqs = faqSearch.trim()
    ? homeFaqs.filter((faq) => {
        const q = faqSearch.toLowerCase().trim();
        return faq.q.toLowerCase().includes(q) || faq.a.toLowerCase().includes(q);
      })
    : homeFaqs;

  const faqSearchActive = faqSearch.trim().length > 0;

  return (
    <div className="relative overflow-x-clip w-full max-w-full">
      <noscript>
        <style>{`
          .st, .st-label, .st-connector, .st-path,
          .uc, .uc h3, .uc p, .uc-tools, .uc-tool,
          .cx-rv, .cx-rv--in,
          .cx-line-enter-1, .cx-line-enter-2, .cx-rise,
          .cx-scroll-line,
          [style*="opacity: 0"], [style*="opacity:0"] {
            opacity: 1 !important;
            transform: none !important;
          }
        `}</style>
      </noscript>

      <FaqJsonLd faqs={homeFaqs} />

      {/* Breadcrumb JSON-LD schema (visual breadcrumb omitted on home to match target design) */}
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://compixor-ai.cloud' },
          { name: 'All PDF, Word and Photo Tools', url: 'https://compixor-ai.cloud/#tools' },
        ]}
      />

      {/* ============ HERO SECTION ============ */}
      <Hero />

      {/* ============ ALL TOOLS CATALOG ============ */}
      <section id="tools" className="relative py-10 sm:py-16 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: REVEAL.dist }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: REVEAL.dur, ease: REVEAL.ease }}
            className="text-center max-w-3xl mx-auto mb-8 sm:mb-10"
          >
            <h2 id="tools-catalog-heading" className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-zinc-900 dark:text-white mb-4">
              Explore All Free Private Tools
            </h2>
            <div className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
              Transform, compress, convert, and protect your files in your browser with zero limits.
            </div>
          </motion.div>

          {/* Trust Metric Strip */}
          <div className="mb-8 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
            {[
              { val: <StatCountUp target={12} reduce={Boolean(reduce)} />, label: 'Free Utilities', color: 'text-zinc-900 dark:text-white' },
              { val: <StatCountUp target={9} suffix=" Tools" reduce={Boolean(reduce)} />, label: 'Processed on Device', color: 'text-purple-600 dark:text-purple-400' },
              { val: '0 Permanent', label: 'Server Storage', color: 'text-emerald-600 dark:text-emerald-400' },
              { val: '0', label: 'Paywalls & Ads', color: 'text-zinc-900 dark:text-white' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={reduce ? false : { opacity: 0, y: REVEAL.dist }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: REVEAL.dur, ease: REVEAL.ease, delay: idx * REVEAL.stagger }}
                className="p-3 sm:p-4 rounded-2xl bg-white/40 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 backdrop-blur-sm"
              >
                <div className={`text-xl sm:text-2xl font-black font-display tabular-nums ${stat.color}`}>
                  {stat.val}
                </div>
                <div className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-8 sm:mb-10">
            {(['All', 'PDF', 'Word', 'Media'] as const).map((cat) => {
              const isSelected = activeCategory === cat;
              const count = cat === 'All' ? tools.length : tools.filter((t) => t.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-[background-color,color,transform] duration-[160ms] cursor-pointer flex items-center gap-2 active:scale-[0.98] ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25 scale-[1.02]'
                      : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-700/70'
                  }`}
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                >
                  <span>{cat === 'All' ? 'All Tools' : `${cat} Tools`}</span>
                  <span
                    className={`text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredTools.map((tool, i) => {
              const Icon = tool.icon;
              const isServerTool = tool.processing === 'server' || ['/tools/pdf-to-word', '/tools/img-to-word', '/tools/passport-photo'].includes(tool.href);
              const badgeText = tool.id === 'passport-photo'
                ? 'Secure server processing'
                : isServerTool
                ? 'Secure HTTPS'
                : (tool.processing === 'local' ? 'Local RAM' : 'Secure HTTPS');
              const taglineText = isServerTool ? 'Secure HTTPS · Deleted after processing' : tool.tagline;
              const descriptionText = isServerTool
                ? tool.description.replace(' with zero data retention', '').replace('with zero data retention', '')
                : tool.description;

              // Row-relative stagger: delay is bound to column position (index % columns)
              // capped at var(--reveal-stagger-cap) (450ms)
              const columns = isMobile ? 1 : 3;
              const colIndex = i % columns;
              const cardDelay = isMobile ? 0 : Math.min(REVEAL.staggerCap, colIndex * REVEAL.stagger);

              return (
                <motion.div
                  key={tool.id}
                  initial={reduce ? false : { opacity: 0, y: REVEAL.cardDist, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{
                    duration: REVEAL.dur,
                    ease: REVEAL.ease,
                    delay: cardDelay,
                  }}
                  className="h-full"
                >
                  <Link
                    href={tool.href}
                    className="glass-card group p-6 rounded-3xl flex flex-col justify-between h-full relative overflow-hidden transition-[transform,border-color] duration-[220ms] [@media(hover:hover)]:hover:-translate-y-[6px] [@media(hover:hover)]:hover:border-brand-500/50 active:scale-[0.97] active:duration-[120ms]"
                    style={{ transitionTimingFunction: "var(--reveal-ease)" }}
                  >
                    <div
                      aria-hidden="true"
                      className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 [@media(hover:hover)]:group-hover:opacity-10 transition-opacity duration-[220ms]`}
                      style={{ transitionTimingFunction: "var(--reveal-ease)" }}
                    />
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white shadow-lg [@media(hover:hover)]:group-hover:scale-[1.08] transition-transform duration-[220ms]`}
                          style={{ transitionTimingFunction: "var(--reveal-ease)" }}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${
                          !isServerTool && tool.processing === 'local'
                            ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                        }`}>
                          {badgeText}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-1.5 [@media(hover:hover)]:group-hover:text-brand-500 transition-colors duration-[220ms]">
                        {tool.title}
                      </h3>
                      <div className="text-xs text-brand-600 dark:text-brand-400 font-semibold mb-2">
                        {taglineText}
                      </div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
                        {descriptionText}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60">
                      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        <span>{tool.stats}</span>
                        <span className="text-brand-500 flex items-center gap-1 font-semibold">
                          <span>Launch Tool</span>
                          <span
                            className="inline-block transition-transform duration-[220ms] [@media(hover:hover)]:group-hover:translate-x-1"
                            style={{ transitionTimingFunction: "var(--reveal-ease)" }}
                          >&rarr;</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ HOW-TO ARTICLE (Sole article tag on page) ============ */}
      <motion.article
        id="how-to-article"
        className="relative py-10 sm:py-16 scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        initial={reduce ? false : { opacity: 0, y: REVEAL.dist }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: REVEAL.dur, ease: REVEAL.ease }}
      >
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
      </motion.article>

      {/* ============ PHASE 3: WHAT HAPPENS TO YOUR FILE ============ */}
      <PrivacySteps />

      {/* ============ PHASE 3: USE CASES ============ */}
      <UseCases />

      {/* ============ STRUCTURED COMPARISON TABLE ============ */}
      <motion.section
        id="privacy-comparison"
        className="relative py-10 sm:py-16 scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        initial={reduce ? false : { opacity: 0, y: REVEAL.dist }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: REVEAL.dur, ease: REVEAL.ease }}
      >
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
          <div className="text-xs text-brand-600 dark:text-brand-400 mt-2 font-medium sm:hidden">
            Swipe horizontally to compare columns →
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
                      <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{row.desktop}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* ============ TRUST ARCHITECTURE ============ */}
      <motion.section
        id="trust-architecture"
        className="relative py-10 sm:py-16"
        initial={reduce ? false : { opacity: 0, y: REVEAL.dist }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: REVEAL.dur, ease: REVEAL.ease }}
      >
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
                  className="glass-card p-5 sm:p-6 text-center rounded-2xl transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:border-brand-500/30 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4 text-brand-500 group-hover:scale-105 transition-transform duration-200 ease-out">
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
      </motion.section>

      {/* ============ SEMANTIC GLOSSARY <dl> ============ */}
      <motion.aside
        id="terminology-glossary"
        aria-label="Privacy and Architecture Glossary"
        className="relative py-10 sm:py-16 scroll-mt-20"
        initial={reduce ? false : { opacity: 0, y: REVEAL.dist }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: REVEAL.dur, ease: REVEAL.ease }}
      >
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
      </motion.aside>

      {/* ============ WHY TRUST COMPIXOR ============ */}
      <WhyTrustCompixor />

      {/* ============ WHAT USERS SAY ============ */}
      <WhatUsersSay />

      {/* ============ FAQ SECTION (Modern Accordion with Live Filter & Direct Sibling Pairs) ============ */}
      <motion.section
        id="faq-section"
        className="pt-20 sm:pt-28 pb-10 sm:pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24"
        initial={reduce ? false : { opacity: 0, y: REVEAL.dist }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: REVEAL.dur, ease: REVEAL.ease }}
      >
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
              suppressHydrationWarning
              value={faqSearch}
              onChange={(e) => handleFaqSearch(e.target.value)}
              placeholder="Search questions (e.g., safe files, free tools)..."
              // @ts-expect-error declarative WebMCP attribute
              toolparamdescription="Search keyword"
              data-tool-param-description="Search keyword"
              className="w-full pl-4 pr-24 sm:pr-32 py-3 rounded-2xl bg-white/70 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/80 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 backdrop-blur-md shadow-sm transition"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 sm:px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span className="hidden sm:inline">Search FAQ</span>
              <span className="sm:hidden">Search</span>
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
              const disclosureKey = `${faq.id}-${faqSearchActive ? 'filtered' : 'default'}`;

              return (
                <Disclosure
                  as="div"
                  key={disclosureKey}
                  defaultOpen={faqSearchActive || originalIndex === 0}
                  className="glass-card rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden transition-[border-color,box-shadow] duration-200 ease-out hover:border-brand-500/30"
                >
                  {({ open }) => (
                    <>
                      <h3 className="m-0">
                        <DisclosureButton
                          type="button"
                          id={faq.id}
                          className="w-full p-4 sm:p-5 text-left text-base sm:text-lg font-bold font-display text-zinc-900 dark:text-white flex items-center justify-between gap-3 select-none hover:bg-zinc-500/5 transition-colors duration-150"
                        >
                          <span className="flex items-center gap-2.5">
                            <HelpCircle className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
                            <span>{faq.q}</span>
                          </span>
                          <ChevronDown
                            className={`w-5 h-5 text-zinc-400 transition-transform duration-200 ease-out shrink-0 ${
                              open ? 'rotate-180 text-brand-500' : ''
                            }`}
                          />
                        </DisclosureButton>
                      </h3>
                      <DisclosurePanel
                        static
                        id={`faq-answer-${faq.id}`}
                        className="px-4 sm:px-5 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed overflow-hidden border-transparent max-h-0 opacity-0 pb-0 pt-0 m-0 transition-[max-height,opacity] duration-200 ease-out data-[open]:max-h-96 data-[open]:opacity-100 data-[open]:pb-4 data-[open]:pt-1 data-[open]:border-t data-[open]:border-zinc-100 dark:data-[open]:border-zinc-800/60 sm:data-[open]:pb-5"
                      >
                        <p className="m-0">{faq.a}</p>
                      </DisclosurePanel>
                    </>
                  )}
                </Disclosure>
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
      </motion.section>

      {/* ============ CTA BOX ============ */}
      <motion.section
        id="cta-section"
        className="py-10 sm:py-16 relative overflow-hidden"
        initial={reduce ? false : { opacity: 0, y: REVEAL.dist }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: REVEAL.dur, ease: REVEAL.ease }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -z-10 inset-0 flex items-center justify-center"
        >
          <div
            className="w-full max-w-2xl h-64 rounded-full opacity-30 dark:opacity-20"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.05) 50%, transparent 70%)',
            }}
          />
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glow-border p-6 sm:p-10 md:p-14 rounded-3xl">
            <h2 id="cta-heading" className="text-2xl sm:text-3xl font-black font-display text-zinc-900 dark:text-white mb-3">
              Edit Your Documents in Browser Memory
            </h2>
            <div className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mb-8 max-w-lg mx-auto">
              All 12 tools are free to use without accounts, paywalls, or cloud storage risks.
            </div>
            <a
              href="#tools"
              className="btn-primary inline-flex items-center justify-center gap-2 text-sm sm:text-base px-6 sm:px-8 py-3.5 font-bold cursor-pointer w-full sm:w-auto min-h-[44px] hover:shadow-lg active:scale-[0.98] transition-[transform,opacity,box-shadow] duration-200 ease-out"
            >
              <span>Explore 12 Private Tools</span>
              <ArrowRight className="w-5 h-5 shrink-0" />
            </a>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
