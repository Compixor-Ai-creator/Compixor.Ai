'use client';

import React from 'react';
import { Sparkles, CheckCircle2, ArrowRight, Download, FileText, QrCode, Smartphone, Layers, Eye } from 'lucide-react';

export function DpMakerPreviewMockup() {
  return (
    <div className="w-full max-w-3xl mx-auto my-8">
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800/80 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Visual Proof Mockup</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-display text-zinc-900 dark:text-white">
              No-Crop WhatsApp & Instagram DP Preview
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              See how a non-square portrait photo is converted to a full-size square DP without cutting faces.
            </p>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 shrink-0">
            1:1 Square Output
          </span>
        </div>

        {/* Visual Mockup Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          {/* Before: Raw 9:16 Photo */}
          <div className="flex flex-col items-center p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-3">
              Standard Smartphone Photo (9:16)
            </span>
            <div className="w-40 h-56 rounded-xl overflow-hidden relative shadow-md bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-3">
              <div className="w-full h-full rounded-lg bg-zinc-950/20 flex flex-col items-center justify-center text-white text-center p-2 backdrop-blur-xs">
                <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/60 mb-2 flex items-center justify-center">
                  <span className="text-xl">👤</span>
                </div>
                <span className="text-[11px] font-bold">Tall Vertical Image</span>
                <span className="text-[9px] opacity-80 mt-1">Gets cropped on WhatsApp</span>
              </div>
            </div>
            <div className="mt-3 text-[11px] text-red-500 font-medium">
              ❌ Cuts off shoulders or tops of head
            </div>
          </div>

          {/* After: 1:1 Canvas with Ambient Blur Background & Circular Guide */}
          <div className="flex flex-col items-center p-4 rounded-2xl bg-brand-500/5 dark:bg-brand-500/10 border border-brand-500/30">
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 mb-3">
              Compixor Full DP Output (1:1 Canvas)
            </span>
            <div className="w-56 h-56 rounded-xl overflow-hidden relative shadow-lg bg-zinc-900 flex items-center justify-center">
              {/* Blurred background mirroring the photo */}
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 blur-xl opacity-70 scale-125" />
              
              {/* Centered uncropped photo */}
              <div className="w-32 h-48 rounded-lg overflow-hidden relative shadow-2xl z-10 bg-gradient-to-b from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-2 border border-white/20">
                <div className="w-full h-full rounded-md bg-zinc-950/20 flex flex-col items-center justify-center text-white text-center p-1">
                  <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/60 mb-1 flex items-center justify-center">
                    <span className="text-lg">👤</span>
                  </div>
                  <span className="text-[10px] font-bold">100% Intact</span>
                </div>
              </div>

              {/* Dashed Circular Guide Overlay */}
              <div className="absolute inset-2 rounded-full border-2 border-dashed border-white/80 pointer-events-none z-20 shadow-inner" />
              <div className="absolute bottom-2 left-2 z-20 text-[9px] bg-black/70 text-white px-2 py-0.5 rounded-full font-mono">
                Circle Guide
              </div>
            </div>
            <div className="mt-3 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Full picture visible in circular avatar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function QrGeneratorPreviewMockup() {
  return (
    <div className="w-full max-w-3xl mx-auto my-8">
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800/80 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Branded Output Proof</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-display text-zinc-900 dark:text-white">
              Designer QR Codes with High Error Correction
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Generate scannable vector QR codes with rounded modules, custom gradients, and centered brand logos.
            </p>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 shrink-0">
            Vector SVG + High-Res PNG
          </span>
        </div>

        {/* Visual QR Mockup */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          {/* Card 1: URL & Wifi Branded */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center text-center">
            <div className="w-36 h-36 rounded-xl bg-white p-3 shadow-md flex items-center justify-center relative mb-3">
              {/* Stylized QR SVG with gradient */}
              <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="#ffffff" />
                <defs>
                  <linearGradient id="qrGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
                {/* Corner markers with rounded corners */}
                <rect x="10" y="10" width="26" height="26" rx="6" fill="url(#qrGrad1)" />
                <rect x="14" y="14" width="18" height="18" rx="4" fill="#ffffff" />
                <rect x="18" y="18" width="10" height="10" rx="3" fill="url(#qrGrad1)" />

                <rect x="64" y="10" width="26" height="26" rx="6" fill="url(#qrGrad1)" />
                <rect x="68" y="14" width="18" height="18" rx="4" fill="#ffffff" />
                <rect x="72" y="18" width="10" height="10" rx="3" fill="url(#qrGrad1)" />

                <rect x="10" y="64" width="26" height="26" rx="6" fill="url(#qrGrad1)" />
                <rect x="14" y="68" width="18" height="18" rx="4" fill="#ffffff" />
                <rect x="18" y="72" width="10" height="10" rx="3" fill="url(#qrGrad1)" />

                {/* Body dots */}
                <circle cx="45" cy="20" r="3" fill="url(#qrGrad1)" />
                <circle cx="53" cy="25" r="3" fill="url(#qrGrad1)" />
                <circle cx="48" cy="40" r="3" fill="url(#qrGrad1)" />
                <circle cx="30" cy="45" r="3" fill="url(#qrGrad1)" />
                <circle cx="70" cy="45" r="3" fill="url(#qrGrad1)" />
                <circle cx="60" cy="65" r="3" fill="url(#qrGrad1)" />
                <circle cx="45" cy="75" r="3" fill="url(#qrGrad1)" />
                <circle cx="75" cy="75" r="3" fill="url(#qrGrad1)" />

                {/* Center Logo Shield */}
                <circle cx="50" cy="50" r="10" fill="#ffffff" />
                <circle cx="50" cy="50" r="8" fill="#4f46e5" />
                <text x="50" y="53" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">AI</text>
              </svg>
            </div>
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Rounded Gradient QR</span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">With Center Logo Emblem</span>
          </div>

          {/* Card 2: vCard / Contact */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center text-center">
            <div className="w-36 h-36 rounded-xl bg-white p-3 shadow-md flex items-center justify-center relative mb-3">
              <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="#ffffff" />
                <defs>
                  <linearGradient id="qrGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#0d9488" />
                  </linearGradient>
                </defs>
                <rect x="10" y="10" width="24" height="24" rx="2" fill="url(#qrGrad2)" />
                <rect x="14" y="14" width="16" height="16" fill="#ffffff" />
                <rect x="18" y="18" width="8" height="8" fill="url(#qrGrad2)" />

                <rect x="66" y="10" width="24" height="24" rx="2" fill="url(#qrGrad2)" />
                <rect x="70" y="14" width="16" height="16" fill="#ffffff" />
                <rect x="74" y="18" width="8" height="8" fill="url(#qrGrad2)" />

                <rect x="10" y="66" width="24" height="24" rx="2" fill="url(#qrGrad2)" />
                <rect x="14" y="70" width="16" height="16" fill="#ffffff" />
                <rect x="18" y="74" width="8" height="8" fill="url(#qrGrad2)" />

                <rect x="42" y="15" width="6" height="6" rx="1" fill="url(#qrGrad2)" />
                <rect x="52" y="25" width="6" height="6" rx="1" fill="url(#qrGrad2)" />
                <rect x="45" y="42" width="12" height="12" rx="3" fill="url(#qrGrad2)" />
                <rect x="68" y="52" width="6" height="6" rx="1" fill="url(#qrGrad2)" />
                <rect x="42" y="70" width="6" height="6" rx="1" fill="url(#qrGrad2)" />
                <rect x="72" y="75" width="6" height="6" rx="1" fill="url(#qrGrad2)" />
              </svg>
            </div>
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Emerald Business vCard</span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Never Expiring Static Code</span>
          </div>

          {/* Card 3: Features Callout */}
          <div className="p-4 rounded-2xl bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-500/20 flex flex-col justify-center space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Permanent Static Codes (Zero Expiry)</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Level-H Error Correction (Scans with Logo)</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Unlimited Free Vector SVG & 3000px PNG Downloads</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PdfCompressorPreviewMockup() {
  return (
    <div className="w-full max-w-3xl mx-auto my-8">
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800/80 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real Benchmark Reduction</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-display text-zinc-900 dark:text-white">
              Lossless Vector Stream Compression
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Compixor strips unneeded object metadata while keeping fonts, form fields, and text sharp and selectable.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
            Up to 85% Smaller
          </span>
        </div>

        {/* Compression Metric Flow */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800/70">
          {/* Original File */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-zinc-500" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Original Document</p>
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Annual_Report_2026.pdf</p>
              <p className="text-xs font-mono text-zinc-500">18.4 MB</p>
            </div>
          </div>

          {/* Reduction Arrow */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full mb-1">
              -78% Smaller
            </span>
            <div className="flex items-center gap-1 text-zinc-400">
              <span className="h-0.5 w-8 bg-zinc-300 dark:bg-zinc-700" />
              <ArrowRight className="w-4 h-4 text-emerald-500" />
            </div>
          </div>

          {/* Compressed File */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Optimized (Zero Uploads)</p>
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Annual_Report_compressed.pdf</p>
              <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">4.1 MB</p>
            </div>
          </div>
        </div>

        {/* Crisp Vector Quality Note */}
        <div className="mt-4 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Text remains 100% searchable & selectable (Ctrl+F)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>No rasterization or image blur</span>
          </span>
        </div>
      </div>
    </div>
  );
}
