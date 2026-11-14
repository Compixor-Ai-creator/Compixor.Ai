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
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { FaqJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd';
import Hero from '@/components/landing/Hero';
import ToolsBento from '@/components/landing/ToolsBento';
import PrivacySteps from '@/components/landing/PrivacySteps';
import UseCases from '@/components/landing/UseCases';

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
    a: 'No, Compixor never puts ugly stamps, logos, or watermarks on your saved PDF pages, Word docs, or photos. The file you save to your device stays clean and ready for work, school, or print. You get full quality output for free without paying for a pro plan.',
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

export default function HomePage() {
  // FAQ filter. Which questions are *open* is owned by each <Disclosure>
  // (Headless UI v2 has no controlled `open` prop); search only decides what is
  // rendered, and every rendered match mounts open.
  const [faqSearch, setFaqSearch] = useState('');

  const handleFaqSearch = (query: string) => {
    setFaqSearch(query);
  };

  const filteredFaqs = faqSearch.trim()
    ? homeFaqs.filter((faq) => {
        const q = faqSearch.toLowerCase().trim();
        return faq.q.toLowerCase().includes(q) || faq.a.toLowerCase().includes(q);
      })
    : homeFaqs;

  const faqSearchActive = faqSearch.trim().length > 0;

  return (
    <div className="relative overflow-x-clip">
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

      {/* ============ PHASE 3: TOOLS BENTO ============ */}
      <ToolsBento />

      {/* ============ PHASE 3: WHAT HAPPENS TO YOUR FILE ============ */}
      <PrivacySteps />

      {/* ============ PHASE 3: USE CASES ============ */}
      <UseCases />

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
              // Remounting on a filter change is intentional: Headless UI's
              // Disclosure is uncontrolled, so a fresh mount is how "every
              // match opens while filtering, and the first one is open again
              // after Clear filter" is expressed. Keys are stable across
              // keystrokes, so a question the reader collapsed by hand stays
              // collapsed while the query is refined.
              const disclosureKey = `${faq.id}-${faqSearchActive ? 'filtered' : 'default'}`;

              return (
                <Disclosure
                  as="div"
                  key={disclosureKey}
                  defaultOpen={faqSearchActive || originalIndex === 0}
                  className="glass-card rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden transition-all duration-300 hover:border-brand-500/30"
                >
                  {({ open }) => (
                    <>
                      <h3 className="m-0">
                        <DisclosureButton
                          type="button"
                          id={faq.id}
                          className="w-full p-4 sm:p-5 text-left text-base sm:text-lg font-bold font-display text-zinc-900 dark:text-white flex items-center justify-between gap-3 select-none hover:bg-zinc-500/5 transition-colors"
                        >
                          <span className="flex items-center gap-2.5">
                            <HelpCircle className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
                            <span>{faq.q}</span>
                          </span>
                          <ChevronDown
                            className={`w-5 h-5 text-zinc-400 transition-transform duration-300 shrink-0 ${
                              open ? 'rotate-180 text-brand-500' : ''
                            }`}
                          />
                        </DisclosureButton>
                      </h3>
                      {/*
                        `static` keeps the answer mounted in both states: Headless
                        UI would otherwise render it with display:none when closed,
                        and a display:none element cannot animate. Collapse is pure
                        CSS on the `data-open` attribute, so there is no pixel jump.
                      */}
                      <DisclosurePanel
                        static
                        id={`faq-answer-${faq.id}`}
                        className="px-4 sm:px-5 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed overflow-hidden border-transparent max-h-0 opacity-0 pb-0 pt-0 m-0 transition-all duration-300 ease-out data-[open]:max-h-96 data-[open]:opacity-100 data-[open]:pb-4 data-[open]:pt-1 data-[open]:border-t data-[open]:border-zinc-100 dark:data-[open]:border-zinc-800/60 sm:data-[open]:pb-5"
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
              <span>Choose a Tool</span>
              <ArrowRight className="w-5 h-5 shrink-0" />
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
