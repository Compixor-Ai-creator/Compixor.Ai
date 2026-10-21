'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Heart, ArrowUpRight, MessageSquarePlus } from 'lucide-react';
import { tools } from '@/data/tools';

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-surface-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
              Client-side by default with private memory-only AI processing.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </div>
          </div>

          {/* Tools */}
          <div>
            <p className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-4 font-display">
              Tools Suite
            </p>
            <ul className="space-y-2.5">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <li key={tool.href}>
                    <Link
                      href={tool.href}
                      className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors flex items-center gap-2 group"
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
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors"
                >
                  Blogs &amp; Guides
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/about#contact"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors"
                >
                  Contact Page
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@compixor-ai.online"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors"
                >
                  support@compixor-ai.online
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@compixor-ai.online?subject=Feature%20Request%20-%20Compixor%20AI&body=Describe%20the%20tool%20or%20feature%20you%20would%20like%20to%20see%3A"
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
                  href="mailto:support@compixor-ai.online?subject=General%20Feedback%20-%20Compixor%20AI&body=Your%20feedback%20or%20suggestions%3A"
                  onClick={(e) => {
                    if (typeof window !== 'undefined') {
                      e.preventDefault();
                      window.dispatchEvent(
                        new CustomEvent('compixor:open-feedback', { detail: { category: 'feedback' } })
                      );
                    }
                  }}
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors"
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
                Zero Cloud Uploads
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                Every calculation is carried out in browser memory. Documents are never stored or reviewed.
              </p>
            </div>

            {/* Official Social Profile Links */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Connect with Us</p>
              <div className="flex items-center gap-3">
                <a
                  href="https://x.com/compixor_ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Compixor AI on X (Twitter)"
                  className="w-8 h-8 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/70 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                >
                  <span className="text-xs font-bold">𝕏</span>
                </a>
                <a
                  href="https://github.com/Compixor-Ai-creator"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Compixor AI on GitHub"
                  className="w-8 h-8 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/70 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                >
                  <span className="text-xs font-bold">GH</span>
                </a>
                <a
                  href="https://linkedin.com/company/compixor"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Compixor AI on LinkedIn"
                  className="w-8 h-8 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/70 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                >
                  <span className="text-xs font-bold">in</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar with Physical/Digital Address */}
        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            © 2026 Compixor AI. Architecture by <span className="font-semibold text-zinc-700 dark:text-zinc-300">Haroon Ali</span>. Compixor AI Digital Studio • Global Cloud Services.
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 shrink-0">
            Updated October 2026 · Zero Server Storage Policy
          </p>
        </div>
      </div>
    </footer>
  );
}
