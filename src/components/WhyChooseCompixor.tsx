'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  FileArchive,
  Layers,
  Stamp,
  Lock,
  Camera,
  Image as ImageIcon,
  QrCode,
  Zap,
  ShieldCheck,
  Target,
  Sparkles,
  ServerOff,
  CheckCircle2,
  HardDrive,
  KeyRound,
} from 'lucide-react';

const toolkitMiniApps = [
  { name: 'Compress', icon: FileArchive, color: 'text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20' },
  { name: 'Merge', icon: Layers, color: 'text-blue-500 bg-blue-500/10 dark:bg-blue-500/20' },
  { name: 'Watermark', icon: Stamp, color: 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/20' },
  { name: 'Word', icon: FileText, color: 'text-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/20' },
  { name: 'Protect', icon: Lock, color: 'text-purple-500 bg-purple-500/10 dark:bg-purple-500/20' },
  { name: 'Passport', icon: Camera, color: 'text-rose-500 bg-rose-500/10 dark:bg-rose-500/20' },
  { name: 'Full DP', icon: ImageIcon, color: 'text-violet-500 bg-violet-500/10 dark:bg-violet-500/20' },
  { name: 'QR Code', icon: QrCode, color: 'text-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/20' },
  { name: 'Unlock', icon: KeyRound, color: 'text-teal-500 bg-teal-500/10 dark:bg-teal-500/20' },
];

export default function WhyChooseCompixor() {
  return (
    <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      {/* Subtle Background Glow Accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full opacity-15 dark:opacity-20"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(124, 58, 237, 0.45) 0%, rgba(6, 182, 212, 0.25) 50%, transparent 70%)',
          filter: 'blur(90px)',
        }}
      />

      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20 mb-3 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Modern Client-Side Standard</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-zinc-900 dark:text-white tracking-tight mb-4">
          Why choose Compixor AI?
        </h2>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
          From quick fixes to share-ready documents, get everything done in one place — 100% in your browser.
        </p>
      </div>

      {/* 3 Pillar Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
        {/* ================= CARD 1: ONE COMPLETE WORKSPACE ================= */}
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex flex-col rounded-3xl p-6 sm:p-7 bg-zinc-50/80 dark:bg-surface-900/60 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:shadow-xl hover:border-brand-500/30 transition-all duration-300"
        >
          {/* Card Visual Mockup Container */}
          <div className="h-64 rounded-2xl bg-zinc-100/70 dark:bg-surface-800/60 border border-zinc-200/60 dark:border-zinc-700/50 p-4 flex items-center justify-center relative overflow-hidden mb-6 group">
            {/* Ambient inner card glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-indigo-500/5 pointer-events-none" />

            {/* Floating Unified Toolkit Interface */}
            <div className="w-full max-w-[260px] bg-white dark:bg-surface-900 rounded-2xl p-3.5 shadow-lg shadow-zinc-950/5 dark:shadow-black/40 border border-zinc-200/80 dark:border-zinc-700/80 transform group-hover:scale-[1.02] transition-transform duration-300">
              {/* 3x3 Mini Tools Grid */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {toolkitMiniApps.map((tool) => {
                  const ToolIcon = tool.icon;
                  return (
                    <div
                      key={tool.name}
                      className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-zinc-50 dark:bg-surface-800/80 border border-zinc-100 dark:border-zinc-700/40 hover:scale-105 transition-transform"
                    >
                      <div className={`w-7 h-7 rounded-lg ${tool.color} flex items-center justify-center mb-1`}>
                        <ToolIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[60px] text-center">
                        {tool.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Toolkit Tag */}
              <div className="text-center pt-1 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
                  Unified Client Toolkit
                </span>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 flex flex-col justify-end">
            <h3 className="text-xl font-bold font-display text-zinc-900 dark:text-white mb-2">
              One complete workspace
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              PDF compression, document merging, watermark protection, DOCX optimization, and AI passport photos — all consolidated into a single seamless client suite.
            </p>
          </div>
        </motion.div>

        {/* ================= CARD 2: ACCURACY & SPEED YOU CAN TRUST ================= */}
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex flex-col rounded-3xl p-6 sm:p-7 bg-zinc-50/80 dark:bg-surface-900/60 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:shadow-xl hover:border-brand-500/30 transition-all duration-300"
        >
          {/* Card Visual Mockup Container */}
          <div className="h-64 rounded-2xl bg-zinc-100/70 dark:bg-surface-800/60 border border-zinc-200/60 dark:border-zinc-700/50 p-4 flex items-center justify-center relative overflow-hidden mb-6 group">
            {/* Ambient inner card glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-brand-500/5 pointer-events-none" />

            {/* Floating Metric Slates */}
            <div className="w-full max-w-[260px] space-y-2.5 transform group-hover:scale-[1.02] transition-transform duration-300">
              {/* Progress Card */}
              <div className="bg-white dark:bg-surface-900 rounded-xl p-3 shadow-md shadow-zinc-950/5 dark:shadow-black/30 border border-zinc-200/80 dark:border-zinc-700/80">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  <span>Overall progress</span>
                  <span className="text-brand-600 dark:text-brand-400">100%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full w-full animate-pulse" />
                </div>
              </div>

              {/* Avg Processing Time Card */}
              <div className="bg-white dark:bg-surface-900 rounded-xl p-2.5 shadow-md shadow-zinc-950/5 dark:shadow-black/30 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 fill-emerald-500/30" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Avg. processing time</p>
                  <p className="text-sm font-black text-zinc-900 dark:text-white">&lt; 1.2s in RAM</p>
                </div>
              </div>

              {/* Text & Vector Accuracy Card */}
              <div className="bg-white dark:bg-surface-900 rounded-xl p-2.5 shadow-md shadow-zinc-950/5 dark:shadow-black/30 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Layout & Text Fidelity</p>
                  <p className="text-sm font-black text-zinc-900 dark:text-white">99.9% Preserved</p>
                </div>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 flex flex-col justify-end">
            <h3 className="text-xl font-bold font-display text-zinc-900 dark:text-white mb-2">
              Accuracy you can trust
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Get pixel-perfect, clean files in seconds. WebAssembly and WebGPU execute transforms locally with zero degradation to typography, vectors, or form fields.
            </p>
          </div>
        </motion.div>

        {/* ================= CARD 3: BUILT-IN SECURITY ================= */}
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex flex-col rounded-3xl p-6 sm:p-7 bg-zinc-50/80 dark:bg-surface-900/60 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:shadow-xl hover:border-brand-500/30 transition-all duration-300"
        >
          {/* Card Visual Mockup Container */}
          <div className="h-64 rounded-2xl bg-zinc-100/70 dark:bg-surface-800/60 border border-zinc-200/60 dark:border-zinc-700/50 p-4 flex items-center justify-center relative overflow-hidden mb-6 group">
            {/* Ambient inner card glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

            {/* Floating Security Badge Stack */}
            <div className="w-full max-w-[260px] relative transform group-hover:scale-[1.02] transition-transform duration-300 flex flex-col items-center">
              {/* Floating Top Pill */}
              <div className="absolute -top-3.5 left-2 px-2.5 py-1 rounded-full bg-white dark:bg-surface-900 border border-zinc-200/80 dark:border-zinc-700/80 shadow-md text-[10px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 z-10">
                <Lock className="w-3 h-3 text-amber-500" />
                <span>AES-256 WebCrypto</span>
              </div>

              {/* Main Center Security Card */}
              <div className="w-full bg-white dark:bg-surface-900 rounded-2xl p-4 shadow-lg shadow-zinc-950/5 dark:shadow-black/40 border border-zinc-200/80 dark:border-zinc-700/80 text-center space-y-2 mt-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                    Client-Side Execution
                  </h4>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-snug mt-0.5">
                    Your files are processed in local device memory. Zero bytes transmitted to remote servers.
                  </p>
                </div>
              </div>

              {/* Floating Bottom Pill */}
              <div className="mt-2.5 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/25 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 shadow-xs">
                <ServerOff className="w-3 h-3" />
                <span>0 Byte Cloud Upload</span>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 flex flex-col justify-end">
            <h3 className="text-xl font-bold font-display text-zinc-900 dark:text-white mb-2">
              Built-in security
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Process confidential legal contracts, bank audits, and personal IDs with complete peace of mind. What runs in your browser stays strictly in your browser.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
