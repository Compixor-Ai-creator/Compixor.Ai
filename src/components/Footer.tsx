'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Heart, ArrowUpRight } from 'lucide-react';

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
              Professional-grade document and media tools that run entirely in your browser.
              Your files never touch remote servers — 100% private, instant execution.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              All Client-Side Systems Operational
            </div>
          </div>

          {/* Tools */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-4 font-display">
              Tools Suite
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/tools/pdf-organizer"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors"
                >
                  PDF Merge & Split
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/pdf-compressor"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors"
                >
                  PDF Compressor
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/word-compressor"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors"
                >
                  Word Compressor
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/passport-photo"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors"
                >
                  Passport Photo Maker
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/full-dp-maker"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors"
                >
                  Full DP Maker
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/qr-generator"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors"
                >
                  QR Code Generator
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Architecture */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-4 font-display">
              Company
            </h4>
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
            </ul>
          </div>

          {/* Guarantee */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-4 font-display">
              Privacy Promise
            </h4>
            <div className="glass-card p-4 rounded-2xl space-y-2 border-emerald-500/20">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                Zero Cloud Uploads
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                Every calculation is carried out in browser memory. Documents are never stored or reviewed.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            © {new Date().getFullYear()} CompixorAi. Built with clinical precision.
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
            Designed for privacy & performance
          </p>
        </div>
      </div>
    </footer>
  );
}
