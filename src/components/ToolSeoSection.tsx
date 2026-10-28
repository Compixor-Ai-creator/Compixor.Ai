'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Upload,
  Sliders,
  Cpu,
  Download,
  BookOpen,
} from 'lucide-react';
import { seoConfig, ToolSlug, BASE_URL } from '@/lib/seo-config';
import ToolHowToVictory from '@/components/ToolHowToVictory';
import ShareToolButton from '@/components/ShareToolButton';
import PrivacyBadge from '@/components/PrivacyBadge';

interface ToolSeoSectionProps {
  toolSlug: ToolSlug;
}

/** Tools whose work is done by our OCR server, so "zero uploads" copy must not be used. */
const SERVER_OCR_TOOLS = new Set<string>(['pdf-to-word', 'img-to-word']);

const TOOL_GUIDE_MAP: Record<string, { title: string; href: string }> = {
  'qr-generator': {
    title: 'How to Make a Custom QR Code with a Logo',
    href: '/blog/how-to-create-custom-qr-code-with-logo',
  },
  'pdf-organizer': {
    title: 'How to Merge and Split PDFs Online (No Upload)',
    href: '/blog/how-to-merge-and-split-pdf-files-online',
  },
  'pdf-compressor': {
    title: 'How to Compress a PDF Without Losing Quality',
    href: '/blog/how-to-compress-pdf-without-losing-quality',
  },
  'full-dp-maker': {
    title: 'Full DP Without Cropping for All Social Media',
    href: '/blog/how-to-set-full-dp-whatsapp-without-cropping',
  },
  'passport-photo': {
    title: 'Passport Photo Size Guide: 300 DPI by Country',
    href: '/blog/passport-size-photo-maker-online-free',
  },
  'protect-pdf': {
    title: 'How to Password Protect a PDF with AES-256',
    href: '/blog/password-protect-pdf-files-online',
  },
  'unlock-pdf': {
    title: 'How to Remove a Password from a PDF (Free)',
    href: '/blog/how-to-remove-password-from-pdf',
  },
  'add-watermark': {
    title: 'How to Add a Watermark to a PDF (Step-by-Step)',
    href: '/blog/how-to-add-watermark-to-pdf',
  },
  'remove-watermark': {
    title: 'How to Remove a PDF Watermark Cleanly',
    href: '/blog/remove-watermark-from-pdf-cleanly',
  },
  'word-compressor': {
    title: 'How to Compress a Word File Without Quality Loss',
    href: '/blog/how-to-compress-word-docx-files',
  },
  'pdf-to-word': {
    title: 'Convert PDF to Editable Word Without Layout Loss',
    href: '/blog/convert-pdf-to-editable-word-online',
  },
  'img-to-word': {
    title: 'How to Extract Text from an Image into Word',
    href: '/blog/extract-text-from-image-to-word',
  },
};

export default function ToolSeoSection({ toolSlug }: ToolSeoSectionProps) {
  const tool = seoConfig[toolSlug];
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  if (!tool) return null;

  return (
    <section className="mt-16 pt-12 border-t border-zinc-200/80 dark:border-zinc-800/80 max-w-4xl mx-auto px-4 sm:px-6">
      {/* ── 1. Comprehensive Tool Intro & Privacy Differentiation ── */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-zinc-200/70 dark:border-zinc-800/60 shadow-sm mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              About {tool.name}
            </span>
          </div>
          <ShareToolButton toolName={tool.name} toolSlug={toolSlug} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-display text-zinc-900 dark:text-white mb-4 tracking-tight">
          {toolSlug === 'passport-photo'
            ? `${tool.h1} — Official Biometric Standards`
            : SERVER_OCR_TOOLS.has(toolSlug || '')
              ? `${tool.h1} — Accurate OCR, Nothing Stored`
              : `${tool.h1} — Safe, Fast & Zero Data Leak`}
        </h2>
        <div className="mb-4">
          <PrivacyBadge toolSlug={toolSlug} />
        </div>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
          {tool.introParagraph}
        </p>

        {/* Feature Badges */}
        <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800/60 flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            {toolSlug === 'passport-photo'
              ? 'In-Memory / On-Device Privacy'
              : SERVER_OCR_TOOLS.has(toolSlug || '')
                ? 'No Files Kept On Our Side'
                : 'Zero Server Uploads'}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            Free &amp; Unlimited
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            No Sign-Up Needed
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            {toolSlug === 'passport-photo' ? '300 DPI Studio Quality' : SERVER_OCR_TOOLS.has(toolSlug || '') ? 'Converted In Memory, Then Dropped' : 'Runs in Browser Memory'}
          </span>
        </div>

        {/* Link back to in-depth Blog Guide */}
        {TOOL_GUIDE_MAP[toolSlug] && (
          <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-brand-500/5 dark:bg-brand-500/10 border border-brand-500/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Related Guide: Step-by-Step Tutorial
                </p>
                <p className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                  {TOOL_GUIDE_MAP[toolSlug].title}
                </p>
              </div>
            </div>
            <Link
              href={TOOL_GUIDE_MAP[toolSlug].href}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline shrink-0"
            >
              <span>{TOOL_GUIDE_MAP[toolSlug].title}</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Link>
          </div>
        )}
      </div>

      {/* ── 2. Step-by-Step "How to Use" Guide ── */}
      <div className="mb-14">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Quick Walkthrough
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-zinc-900 dark:text-white">
            How to Use {tool.name} Online
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-md mx-auto">
            Get professional results in under a few seconds with four simple steps.
          </p>
        </div>

        {/* ── Illustrated Victory / Transformation Pipeline Showcase ── */}
        <ToolHowToVictory toolSlug={toolSlug} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {tool.howToSteps.map((step, idx) => {
            const stepIcons = [Upload, Sliders, Cpu, Download];
            const StepIcon = stepIcons[idx] || CheckCircle2;
            return (
              <div
                key={idx}
                className="glass-card p-5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/60 flex items-start gap-4 transition-all hover:border-brand-500/40 hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-2xl bg-brand-500/15 text-brand-600 dark:text-brand-400 font-black flex flex-col items-center justify-center shrink-0 border border-brand-500/20 shadow-xs">
                  <StepIcon className="w-4 h-4 mb-0.5" />
                  <span className="text-[9px] leading-none">{idx + 1}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">
                      Step {idx + 1}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
                    {step.name}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {step.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. Why Privacy-First Matters Features Block ── */}
      <div className="mb-14">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black font-display text-zinc-900 dark:text-white">
            Why Privacy-First Matters
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-md mx-auto">
            Your personal photos and sensitive documents deserve 100% confidentiality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {tool.features.map((feature, idx) => (
            <div
              key={idx}
              className="glass-card p-5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/60 space-y-2 hover:border-brand-500/30 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-500/20">
                {idx === 0 ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : idx === 1 ? (
                  <Zap className="w-5 h-5" />
                ) : (
                  <Lock className="w-5 h-5" />
                )}
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Visible Interactive FAQs (Matching FAQPage Schema Word-for-Word) ── */}
      <div className="mb-14">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black font-display text-zinc-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Common questions about {tool.name}
          </p>
        </div>

        <div className="space-y-3">
          {tool.faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            const panelId = `faq-panel-${tool.slug}-${idx}`;
            const triggerId = `faq-trigger-${tool.slug}-${idx}`;

            return (
              <div
                key={idx}
                className="glass-card rounded-2xl overflow-hidden border border-zinc-200/70 dark:border-zinc-800/60 transition"
              >
                <button
                  id={triggerId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-zinc-900 dark:text-white cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-brand-500 shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
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
      </div>

      {/* ── 5. Cross-Tool Internal Linking Section ── */}
      <div className="mb-6 pt-8 border-t border-zinc-200/70 dark:border-zinc-800/60">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-bold font-display text-zinc-900 dark:text-white">
            Related Privacy-First Tools
          </h3>
          <Link
            href="/#tools"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            View all tools <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {(() => {
          // Select exactly 3 related tools by relevance, never showing the current tool
          const availableSlugs = (Object.keys(seoConfig) as ToolSlug[]).filter((s) => s !== tool.slug);
          const primaryRelated = (tool.relatedToolSlugs || []).filter(
            (s) => s !== tool.slug && seoConfig[s]
          );
          const selectedSlugs: ToolSlug[] = [];
          for (const s of primaryRelated) {
            if (!selectedSlugs.includes(s) && selectedSlugs.length < 3) {
              selectedSlugs.push(s);
            }
          }
          for (const s of availableSlugs) {
            if (!selectedSlugs.includes(s) && selectedSlugs.length < 3) {
              selectedSlugs.push(s);
            }
          }

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedSlugs.map((relSlug) => {
                const relTool = seoConfig[relSlug];
                if (!relTool) return null;
                const RelIcon = relTool.icon;

                return (
                  <Link
                    key={relSlug}
                    href={`/tools/${relSlug}`}
                    className="glass-card p-5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/60 hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-500/5 hover:-translate-y-[2px] transition-all duration-200 group flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                  >
                    <div>
                      {/* Top-left icon inside 44x44px rounded square (12px radius) */}
                      {RelIcon && (
                        <div
                          className="w-[44px] h-[44px] rounded-[12px] bg-brand-500/10 dark:bg-brand-400/10 flex items-center justify-center mb-3.5 transition-colors duration-200 group-hover:bg-brand-600 dark:group-hover:bg-brand-500"
                        >
                          <RelIcon
                            className="w-[22px] h-[22px] text-brand-600 dark:text-brand-400 group-hover:text-white transition-colors duration-200"
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                        </div>
                      )}

                      <p className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {relTool.name}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-snug">
                        {relTool.primaryKeyword}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                      <span>Open Tool</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-[3px] transition-transform duration-200" />
                    </div>
                  </Link>
                );
              })}
            </div>
          );
        })()}
      </div>
    </section>
  );
}
