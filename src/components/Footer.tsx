'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Heart, ArrowUpRight, MessageSquarePlus } from 'lucide-react';
import { tools } from '@/data/tools';
import { SITE_URL, SITE_SHARE_TEXT, CONTACT_EMAIL, getShareUrls } from '@/lib/config';
import {
  LinkedInIcon,
  TwitterXIcon,
  WhatsAppIcon,
  FacebookIcon,
} from '@/components/SocialIcons';

export default function Footer() {
  const shareUrls = getShareUrls(SITE_URL, SITE_SHARE_TEXT);

  return (
    <footer className="relative mt-24 border-t border-black/[0.06] dark:border-white/[0.06] bg-zinc-50/50 dark:bg-surface-900/40">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center shadow-glow">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold font-display tracking-tight">
                <span className="text-gradient">COMPIXOR</span>
                <span className="text-brand-500 dark:text-brand-400">.AI</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
              Professional-grade document and media tools engineered for privacy and speed.
              Most tools run 100% locally in your browser with zero file uploads.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </div>
            {/* Copyright & Architecture Note */}
            <div className="pt-2 space-y-1">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                © 2026 Compixor AI. Architecture by <span className="font-semibold text-zinc-700 dark:text-zinc-300">Haroon Ali</span>. Compixor AI Digital Studio • Global Cloud Services.
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Updated October 2026 · Zero Server Storage Policy
              </p>
            </div>
          </div>

          {/* Tools */}
          <div>
            <p className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-4 font-display">
              Tools Suite
            </p>
            <ul className="space-y-3">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <li key={tool.href}>
                    <Link
                      href={tool.href}
                      className="text-sm text-[#52525b] dark:text-zinc-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors flex items-center gap-2 group"
                    >
                      <Icon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-brand-500 transition-colors shrink-0" aria-hidden="true" />
                      <span>{tool.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Company & Architecture */}
          <div>
            <p className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-4 font-display">
              Company
            </p>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-[#52525b] dark:text-zinc-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-[#52525b] dark:text-zinc-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors"
                >
                  Blogs &amp; Guides
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-[#52525b] dark:text-zinc-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-[#52525b] dark:text-zinc-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/about#contact"
                  className="text-sm text-[#52525b] dark:text-zinc-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-sm text-[#52525b] dark:text-zinc-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=Feature%20Request%20-%20Compixor%20AI&body=Describe%20the%20tool%20or%20feature%20you%20would%20like%20to%20see%3A`}
                  onClick={(e) => {
                    if (typeof window !== 'undefined') {
                      e.preventDefault();
                      window.dispatchEvent(
                        new CustomEvent('compixor:open-feedback', { detail: { category: 'request' } })
                      );
                    }
                  }}
                  className="text-sm text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1.5"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>Request a Tool</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=General%20Feedback%20-%20Compixor%20AI&body=Your%20feedback%20or%20suggestions%3A`}
                  onClick={(e) => {
                    if (typeof window !== 'undefined') {
                      e.preventDefault();
                      window.dispatchEvent(
                        new CustomEvent('compixor:open-feedback', { detail: { category: 'feedback' } })
                      );
                    }
                  }}
                  className="text-sm text-[#52525b] dark:text-zinc-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors"
                >
                  Give Feedback
                </a>
              </li>
            </ul>
          </div>

          {/* Guarantee & Social */}
          <div>
            <p className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-4 font-display">
              Privacy &amp; Social
            </p>
            <div className="glass-card p-4 rounded-2xl space-y-2 border-emerald-500/20 mb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                Privacy-First Architecture
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                9 tools run 100% locally in your browser. Server tools process files in memory and delete them immediately.
              </p>
            </div>

            {/* Share Compixor */}
            <div className="space-y-2 mb-4">
              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Share Compixor</p>
              <div className="flex items-center gap-2">
                <a
                  href={shareUrls.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share Compixor AI on LinkedIn"
                  className="w-8 h-8 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/70 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-[#0A66C2] hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                >
                  <LinkedInIcon className="w-4 h-4" />
                </a>
                <a
                  href={shareUrls.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share Compixor AI on X"
                  className="w-8 h-8 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/70 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                >
                  <TwitterXIcon className="w-4 h-4" />
                </a>
                <a
                  href={shareUrls.whatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share Compixor AI on WhatsApp"
                  className="w-8 h-8 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/70 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-[#25D366] hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                </a>
                <a
                  href={shareUrls.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share Compixor AI on Facebook"
                  className="w-8 h-8 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/70 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-[#1877F2] hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Official Open Source Link */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Open Source</p>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/Compixor-Ai-creator"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Compixor AI on GitHub"
                  className="w-8 h-8 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/70 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                >
                  <span className="text-xs font-bold">GH</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Architectural SVG Watermark (Perfect center, exactly aligned to footer grid container) */}
        <div className="footer-watermark pt-12 pb-20 pointer-events-none select-none overflow-visible" aria-hidden="true">
          <svg viewBox="0 0 1000 150" preserveAspectRatio="xMidYMid meet" className="block w-full h-auto" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="wmFade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.07" className="stop-bottom" />
              </linearGradient>
            </defs>
            <text
              x="500"
              y="125"
              textAnchor="middle"
              fontFamily="Inter, system-ui, sans-serif"
              fontWeight="800"
              fontSize="150"
              letterSpacing="-4"
              textLength={960}
              lengthAdjust="spacingAndGlyphs"
              fill="url(#wmFade)"
            >COMPIXOR AI</text>
          </svg>
        </div>
      </div>
    </footer>
  );
}
