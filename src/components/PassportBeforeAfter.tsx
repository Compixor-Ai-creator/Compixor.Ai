'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Sparkles, ShieldCheck, Eye, SlidersHorizontal, ArrowRight } from 'lucide-react';

export default function PassportBeforeAfter() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto my-10">
      {/* Header Badge */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Instant Biometric Transformation</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold font-display text-zinc-900 dark:text-white">
          See the Difference: Smartphone Selfie to Compliant Passport Photo
        </h3>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl mx-auto">
          Drag the slider or inspect side-by-side to see how our zero-server AI isolates hair strands, standardizes dimensions, and overlays biometric guides.
        </p>
      </div>

      {/* Comparison Container */}
      <div className="glass-card rounded-3xl p-4 sm:p-8 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          
          {/* BEFORE CARD */}
          <div className="relative rounded-2xl overflow-hidden border border-red-500/20 bg-zinc-900/5 dark:bg-zinc-950/40 p-4 flex flex-col items-center">
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold backdrop-blur-md">
              <XCircle className="w-3.5 h-3.5" />
              <span>Before (Raw Selfie)</span>
            </div>

            {/* Stylized Before Graphic */}
            <div className="w-64 h-80 sm:w-72 sm:h-92 rounded-xl relative overflow-hidden shadow-inner flex items-center justify-center bg-gradient-to-tr from-amber-950/40 via-stone-800/60 to-zinc-700/50">
              {/* Cluttered room shadows & background elements */}
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="absolute top-4 right-6 w-24 h-24 rounded-full bg-amber-400/10 blur-xl pointer-events-none" />
              <div className="absolute bottom-6 left-4 w-32 h-16 bg-stone-900/40 blur-md pointer-events-none" />

              {/* Portrait silhouette with casual tilt */}
              <svg
                viewBox="0 0 200 260"
                className="w-56 h-72 drop-shadow-lg transform rotate-[-3deg] translate-y-3"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Hair & head */}
                <ellipse cx="100" cy="85" rx="42" ry="52" fill="#292524" />
                {/* Face & Neck with uneven shadow */}
                <path
                  d="M80,125 Q100,165 120,125 L124,155 L76,155 Z"
                  fill="#d97706"
                  opacity="0.25"
                />
                <ellipse cx="100" cy="98" rx="36" ry="46" fill="#f5d0b5" />
                {/* Uneven lighting shadow overlay */}
                <path
                  d="M100,52 C120,52 136,72 136,98 C136,124 120,144 100,144 Z"
                  fill="#000000"
                  opacity="0.12"
                />
                {/* Eyes */}
                <ellipse cx="88" cy="92" rx="4.5" ry="3" fill="#3f3f46" />
                <ellipse cx="114" cy="91" rx="4.5" ry="3" fill="#3f3f46" />
                {/* Nose & Mouth */}
                <path d="M100,94 L98,106 L103,106" stroke="#b45309" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <path d="M93,118 Q101,124 109,118" stroke="#9a3412" strokeWidth="2" fill="none" strokeLinecap="round" />
                {/* Casual T-shirt collar */}
                <path
                  d="M50,165 Q100,195 150,165 L165,260 L35,260 Z"
                  fill="#475569"
                />
                <path
                  d="M80,165 Q100,195 120,165"
                  fill="#f5d0b5"
                />
              </svg>
            </div>

            {/* Before Callouts */}
            <div className="w-full mt-4 space-y-1.5 text-left">
              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                <span>Distracting indoor shadows & wall texture</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                <span>Uncalibrated head-to-chin sizing (Will get rejected)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                <span>Casual t-shirt framing without formal alignment</span>
              </div>
            </div>
          </div>

          {/* AFTER CARD */}
          <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 p-4 flex flex-col items-center">
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold backdrop-blur-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>After (NADRA / US Compliant)</span>
            </div>

            <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-md bg-zinc-900/80 text-[10px] font-mono text-white/90">
              35×45mm · 300 DPI
            </div>

            {/* Stylized After Graphic with Biometric Overlays */}
            <div className="w-64 h-80 sm:w-72 sm:h-92 rounded-xl relative overflow-hidden shadow-md flex items-center justify-center bg-white border border-zinc-200 dark:border-zinc-700">
              {/* Clean White Matte Background */}
              <div className="absolute inset-0 bg-white" />

              {/* Perfectly Centered & Cropped Subject */}
              <svg
                viewBox="0 0 200 260"
                className="w-56 h-72 drop-shadow-sm transform translate-y-2 relative z-0"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Clean IS-Net FP16 Matting Silhouette */}
                <ellipse cx="100" cy="82" rx="43" ry="52" fill="#1c1917" />
                {/* Perfectly lit face */}
                <ellipse cx="100" cy="94" rx="36" ry="46" fill="#fbd5bb" />
                {/* Symmetrical sharp eyes on exact eye line */}
                <ellipse cx="86" cy="88" rx="4.5" ry="3" fill="#27272a" />
                <ellipse cx="114" cy="88" rx="4.5" ry="3" fill="#27272a" />
                {/* Neutral Expression Compliant */}
                <path d="M100,90 L98,102 L103,102" stroke="#b45309" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <line x1="93" y1="114" x2="107" y2="114" stroke="#9a3412" strokeWidth="2" strokeLinecap="round" />
                {/* Formal Dark Business Attire */}
                <path
                  d="M48,155 L75,170 L100,195 L125,170 L152,155 L168,260 L32,260 Z"
                  fill="#0f172a"
                />
                <polygon points="100,165 92,205 100,230 108,205" fill="#991b1b" />
                <polygon points="92,165 100,195 100,165" fill="#f8fafc" />
                <polygon points="108,165 100,195 100,165" fill="#f8fafc" />
              </svg>

              {/* Biometric Green Alignment HUD Overlay */}
              <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-3">
                {/* Top Crown Line */}
                <div className="w-full flex items-center gap-1.5 opacity-80" style={{ marginTop: '12%' }}>
                  <div className="h-px bg-emerald-500/80 flex-1 border-b border-dashed border-emerald-500" />
                  <span className="text-[9px] font-mono text-emerald-600 bg-white/90 px-1 rounded shadow-xs">Crown Line</span>
                  <div className="h-px bg-emerald-500/80 flex-1 border-b border-dashed border-emerald-500" />
                </div>

                {/* Eye Axis Line */}
                <div className="w-full flex items-center gap-1.5 opacity-80" style={{ marginTop: '-4%' }}>
                  <div className="h-px bg-emerald-500/80 flex-1 border-b border-dashed border-emerald-500" />
                  <span className="text-[9px] font-mono text-emerald-600 bg-white/90 px-1 rounded shadow-xs">Eye Axis 42%</span>
                  <div className="h-px bg-emerald-500/80 flex-1 border-b border-dashed border-emerald-500" />
                </div>

                {/* Chin Baseline */}
                <div className="w-full flex items-center gap-1.5 opacity-80" style={{ marginBottom: '22%' }}>
                  <div className="h-px bg-emerald-500/80 flex-1 border-b border-dashed border-emerald-500" />
                  <span className="text-[9px] font-mono text-emerald-600 bg-white/90 px-1 rounded shadow-xs">Chin 75%</span>
                  <div className="h-px bg-emerald-500/80 flex-1 border-b border-dashed border-emerald-500" />
                </div>

                {/* Center Vertical Axis */}
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px border-l border-dashed border-emerald-400/50 pointer-events-none" />
              </div>
            </div>

            {/* After Callouts */}
            <div className="w-full mt-4 space-y-1.5 text-left">
              <div className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>IS-Net FP16 AI hair matting with 0% fringe halos</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Exact 70–80% biometric head ratio verified</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Instant formal suit replacement & 300 DPI print ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Guarantee Footer Callout */}
        <div className="mt-6 pt-5 border-t border-zinc-200/70 dark:border-zinc-800/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left bg-emerald-500/5 dark:bg-emerald-950/20 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                True Zero-Server Privacy Guarantee
              </p>
              <p className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400">
                Your face and ID photo are processed 100% in your device RAM via WebGPU. Never sent to any cloud server, unlike PhotoGov, Cutout.Pro, or PhotoAiD.
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              100% Free & No Sign-up
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
