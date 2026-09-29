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
} from 'lucide-react';
import { seoConfig, ToolSlug, BASE_URL } from '@/lib/seo-config';

interface ToolSeoSectionProps {
  toolSlug: ToolSlug;
}

export default function ToolSeoSection({ toolSlug }: ToolSeoSectionProps) {
  const tool = seoConfig[toolSlug];
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  if (!tool) return null;

  return (
    <section className="mt-16 pt-12 border-t border-zinc-200/80 dark:border-zinc-800/80 max-w-4xl mx-auto px-4 sm:px-6">
      {/* ── 1. Comprehensive Tool Intro & Privacy Differentiation ── */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-zinc-200/70 dark:border-zinc-800/60 shadow-sm mb-12">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            About {tool.name}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-display text-zinc-900 dark:text-white mb-4 tracking-tight">
          {tool.h1} — Safe, Fast &amp; 100% Client-Side
        </h2>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
          {tool.introParagraph}
        </p>

        {/* Feature Badges */}
        <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800/60 flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            Zero Server Uploads
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
            Runs in Browser Memory
          </span>
        </div>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {tool.howToSteps.map((step, idx) => (
            <div
              key={idx}
              className="glass-card p-5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/60 flex items-start gap-4 transition-all hover:border-brand-500/30"
            >
              <div className="w-8 h-8 rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-400 font-black flex items-center justify-center text-sm shrink-0 border border-brand-500/20">
                {idx + 1}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
                  {step.name}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {step.text}
                </p>
              </div>
            </div>
          ))}
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
            Common questions about {tool.name} and client-side processing
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {tool.relatedToolSlugs.map((relSlug) => {
            const relTool = seoConfig[relSlug];
            if (!relTool) return null;
            return (
              <Link
                key={relSlug}
                href={`/tools/${relSlug}`}
                className="glass-card p-4 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/60 hover:border-brand-500/40 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {relTool.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-snug">
                    {relTool.primaryKeyword}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
