'use client';

import React from 'react';
import Image from 'next/image';
import {
  Lock,
  Unlock,
  ShieldCheck,
  FileDown,
  Camera,
  Maximize2,
  QrCode,
  Layers,
  FileText,
  Stamp,
  Eraser,
  ScanText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface ArticleHeroBannerProps {
  id: string;
  title: string;
  category: string;
  accentColor: string;
}

export default function ArticleHeroBanner({
  id,
  title,
  category,
  accentColor,
}: ArticleHeroBannerProps) {
  if (id === 'protect-pdf') {
    return (
      <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl bg-zinc-950 my-8">
        <Image
          src="/blog/password-protect-pdf-hero.jpg"
          alt={title}
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="object-cover"
        />
      </div>
    );
  }

  if (id === 'pdf-compressor') {
    return (
      <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl bg-zinc-950 my-8">
        <Image
          src="/blog/pdf-compressor-hero.png"
          alt={title}
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="object-cover"
        />
      </div>
    );
  }

  if (id === 'add-pdf-watermark') {
    return (
      <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl bg-zinc-950 my-8">
        <Image
          src="/blog/pdf-watermark-hero.jpg"
          alt={title}
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 flex items-center justify-center p-6 sm:p-10 my-8 group">
      {/* Ambient Mesh Glow Backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-30"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(124, 58, 237, 0.45) 0%, rgba(59, 130, 246, 0.25) 45%, transparent 75%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Subtle Dot Matrix Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Dynamic Visual Mockup Content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center justify-center">
        {/* Scenario 1: Protect & Unlock PDF */}
        {(id === 'protect-pdf' || id === 'unlock-pdf') && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 w-full">
            {/* Locked Card */}
            <div className="glass-card p-5 rounded-2xl border border-rose-500/40 bg-zinc-900/80 text-white flex items-center gap-3.5 shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <Lock className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  AES-256 Bit
                </div>
                <p className="text-sm font-bold text-white">Confidential.pdf</p>
                <p className="text-[11px] text-zinc-400">Encrypted in Device RAM</p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-zinc-300 font-bold text-sm shrink-0">
              ⇄
            </div>

            {/* Unlocked Card */}
            <div className="glass-card p-5 rounded-2xl border border-emerald-500/40 bg-zinc-900/80 text-white flex items-center gap-3.5 shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <Unlock className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Permission Free
                </div>
                <p className="text-sm font-bold text-white">Unlocked.pdf</p>
                <p className="text-[11px] text-zinc-400">Full Print &amp; Edit Access</p>
              </div>
            </div>
          </div>
        )}

        {/* Scenario 2: PDF & Word Compressor */}
        {(id === 'pdf-compressor' || id === 'word-compressor') && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 w-full">
            <div className="glass-card p-5 rounded-2xl border border-amber-500/40 bg-zinc-900/80 text-white flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shrink-0">
                <FileDown className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Original File</span>
                <p className="text-sm font-bold text-white">HeavyDocument.pdf</p>
                <p className="text-xs font-semibold text-rose-400">28.4 MB (Too Big for Email)</p>
              </div>
            </div>

            <div className="text-brand-400 font-black text-xl">→</div>

            <div className="glass-card p-5 rounded-2xl border border-emerald-500/40 bg-zinc-900/80 text-white flex items-center gap-3.5 shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center text-white shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">93% Compressed</span>
                <p className="text-sm font-bold text-white">OptimizedDocument.pdf</p>
                <p className="text-xs font-semibold text-emerald-400">1.8 MB (Razor-Sharp Text)</p>
              </div>
            </div>
          </div>
        )}

        {/* Scenario 3: Passport Photo Maker */}
        {id === 'passport-photo-maker' && (
          <div className="flex items-center justify-center gap-5 sm:gap-8 w-full">
            <div className="glass-card p-4 rounded-2xl border border-sky-500/40 bg-zinc-900/80 text-white flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-sky-400/80 flex flex-col items-center justify-center relative overflow-hidden bg-sky-500/10 mb-2">
                <div className="w-12 h-16 rounded-full border border-sky-400/60 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-sky-400" />
                </div>
                <div className="absolute top-1 text-[8px] font-bold text-sky-300">ICAO GUIDE</div>
              </div>
              <span className="text-xs font-bold text-white">2 x 2 inches (51x51mm)</span>
              <span className="text-[10px] text-sky-400 font-semibold">US / NADRA Compliant</span>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-indigo-500/40 bg-zinc-900/80 text-white flex flex-col items-center text-center">
              <div className="w-20 h-24 rounded-xl border-2 border-dashed border-indigo-400/80 flex flex-col items-center justify-center relative overflow-hidden bg-indigo-500/10 mb-2">
                <div className="w-10 h-14 rounded-full border border-indigo-400/60 flex items-center justify-center">
                  <Camera className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="absolute top-1 text-[8px] font-bold text-indigo-300">300 DPI</div>
              </div>
              <span className="text-xs font-bold text-white">35 x 45 mm</span>
              <span className="text-[10px] text-indigo-400 font-semibold">Schengen &amp; UK Visa</span>
            </div>
          </div>
        )}

        {/* Scenario 4: WhatsApp Full DP Maker */}
        {id === 'full-dp-maker' && (
          <div className="flex items-center justify-center gap-6 w-full">
            <div className="glass-card p-4 rounded-2xl border border-purple-500/40 bg-zinc-900/80 text-white flex items-center gap-4">
              {/* Rectangular Photo */}
              <div className="w-16 h-24 rounded-lg bg-zinc-800 border border-zinc-700 flex flex-col items-center justify-center text-zinc-400 text-xs">
                <span>9:16</span>
                <span className="text-[9px]">Portrait</span>
              </div>

              <span className="text-purple-400 font-bold text-lg">→</span>

              {/* 1:1 Square with Blur Backdrop */}
              <div className="w-24 h-24 rounded-xl relative overflow-hidden border border-purple-500/60 flex items-center justify-center bg-gradient-to-br from-purple-800/40 to-pink-800/40 backdrop-blur-md">
                <div className="absolute inset-0 bg-purple-500/20 blur-md" />
                <div className="w-12 h-20 rounded bg-white/20 border border-white/40 relative z-10" />
                <div className="absolute inset-1 rounded-full border border-emerald-400/70 pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* Scenario 5: QR Code Generator */}
        {id === 'qr-generator' && (
          <div className="flex items-center justify-center gap-4">
            <div className="glass-card p-5 rounded-2xl border border-teal-500/40 bg-zinc-900/80 text-white flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-white p-2 flex items-center justify-center shadow-lg">
                <QrCode className="w-16 h-16 text-zinc-900" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Vector Scalable</span>
                <p className="text-sm font-bold text-white">Custom Brand Barcode</p>
                <p className="text-[11px] text-zinc-400">Zero Expiration • SVG &amp; PNG</p>
              </div>
            </div>
          </div>
        )}

        {/* Default / Fallback Scenario */}
        {!['protect-pdf', 'unlock-pdf', 'pdf-compressor', 'word-compressor', 'passport-photo-maker', 'full-dp-maker', 'qr-generator'].includes(id) && (
          <div className="glass-card p-6 rounded-2xl border border-brand-500/40 bg-zinc-900/80 text-white flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="text-left">
              <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider">
                {category}
              </span>
              <p className="text-base font-bold text-white">{title}</p>
              <p className="text-xs text-zinc-400">100% Client-Side In-Browser Execution</p>
            </div>
          </div>
        )}
      </div>

      {/* Floating Trust Badge */}
      <div className="absolute bottom-3 right-4 sm:bottom-4 sm:right-6 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/90 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-700/80 shadow-md backdrop-blur-md">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Zero Server Uploads</span>
      </div>
    </div>
  );
}
