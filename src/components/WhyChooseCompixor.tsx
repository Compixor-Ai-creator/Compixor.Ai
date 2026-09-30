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
  Check,
  Activity,
  ArrowUpRight,
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function WhyChooseCompixor() {
  return (
    <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Aurora & Grid Backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -z-10 inset-0 flex items-center justify-center overflow-hidden"
      >
        <div
          className="w-[900px] h-[450px] rounded-full opacity-20 dark:opacity-25"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(124, 58, 237, 0.45) 0%, rgba(59, 130, 246, 0.25) 40%, rgba(6, 182, 212, 0.15) 65%, transparent 80%)',
            filter: 'blur(100px)',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(124,58,237,0.08)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />
      </div>

      {/* Section Header */}
      <motion.div
        className="text-center max-w-2xl mx-auto mb-16 sm:mb-20"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/25 mb-3 shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-500 animate-spin-slow" />
          <span>The Modern Client-Side Standard</span>
        </motion.div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-zinc-900 dark:text-white tracking-tight mb-4">
          Why choose Compixor AI?
        </h2>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
          From quick fixes to share-ready documents, get everything done in one place — 100% in your browser.
        </p>
      </motion.div>

      {/* 3 Pillar Cards Grid with Staggered Entrance */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch"
      >
        {/* ================= CARD 1: ONE COMPLETE WORKSPACE ================= */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -8, transition: { duration: 0.25, ease: 'easeOut' } }}
          className="group relative flex flex-col rounded-3xl p-6 sm:p-7 bg-white/70 dark:bg-surface-900/60 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:shadow-2xl hover:shadow-brand-500/10 hover:border-brand-500/40 transition-all duration-300"
        >
          {/* Subtle Hover Gradient Rim */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-brand-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          {/* Card Visual Mockup Container */}
          <div className="h-68 rounded-2xl bg-gradient-to-b from-zinc-50 to-zinc-100/70 dark:from-surface-850/80 dark:to-surface-800/60 border border-zinc-200/60 dark:border-zinc-700/50 p-4 flex items-center justify-center relative overflow-hidden mb-6">
            {/* Ambient inner card glow */}
            <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full bg-brand-500/10 dark:bg-brand-500/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-36 h-36 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-2xl pointer-events-none" />

            {/* Floating Top Badge: 11 Client Tools */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-2 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-[10px] font-black shadow-lg shadow-brand-500/30 flex items-center gap-1.5 z-20"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>11 Unified Tools</span>
            </motion.div>

            {/* Floating Bottom Badge: 100% In-Browser */}
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              className="absolute -bottom-2 left-4 px-3 py-1 rounded-full bg-white dark:bg-surface-900 border border-zinc-200/90 dark:border-zinc-700/90 shadow-md text-[10px] font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 z-20"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Zero Installation</span>
            </motion.div>

            {/* Floating Unified Toolkit Interface */}
            <div className="w-full max-w-[260px] bg-white dark:bg-surface-900 rounded-2xl p-3.5 shadow-xl shadow-zinc-950/5 dark:shadow-black/50 border border-zinc-200/90 dark:border-zinc-700/90 transform group-hover:scale-[1.03] transition-transform duration-300 relative z-10">
              {/* 3x3 Mini Tools Grid */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {toolkitMiniApps.map((tool) => {
                  const ToolIcon = tool.icon;
                  return (
                    <div
                      key={tool.name}
                      className="group/item flex flex-col items-center justify-center p-1.5 rounded-xl bg-zinc-50 dark:bg-surface-800/80 border border-zinc-100 dark:border-zinc-700/40 hover:border-brand-500/30 hover:scale-105 hover:shadow-xs transition-all duration-200 cursor-default"
                    >
                      <div className={`w-7 h-7 rounded-lg ${tool.color} flex items-center justify-center mb-1 group-hover/item:rotate-6 transition-transform`}>
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
              <div className="text-center pt-1.5 border-t border-zinc-100 dark:border-zinc-800/90 flex items-center justify-between px-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
                  Unified Client Suite
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 flex flex-col justify-end">
            <h3 className="text-xl font-bold font-display text-zinc-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              One complete workspace
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              PDF compression, document merging, watermark protection, DOCX optimization, and AI passport photos — all consolidated into a single seamless client suite.
            </p>
          </div>
        </motion.div>

        {/* ================= CARD 2: ACCURACY & SPEED YOU CAN TRUST ================= */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -8, transition: { duration: 0.25, ease: 'easeOut' } }}
          className="group relative flex flex-col rounded-3xl p-6 sm:p-7 bg-white/70 dark:bg-surface-900/60 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-500/40 transition-all duration-300"
        >
          {/* Subtle Hover Gradient Rim */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          {/* Card Visual Mockup Container */}
          <div className="h-68 rounded-2xl bg-gradient-to-b from-zinc-50 to-zinc-100/70 dark:from-surface-850/80 dark:to-surface-800/60 border border-zinc-200/60 dark:border-zinc-700/50 p-4 flex items-center justify-center relative overflow-hidden mb-6">
            {/* Ambient inner card glow */}
            <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-36 h-36 rounded-full bg-brand-500/10 dark:bg-brand-500/20 blur-2xl pointer-events-none" />

            {/* Floating Top Badge: Zero Queue */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              className="absolute -top-2 right-4 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 z-20"
            >
              <Zap className="w-3 h-3 fill-amber-300 text-amber-300" />
              <span>Zero Server Queue</span>
            </motion.div>

            {/* Floating Bottom Badge: Client Wasm Engine */}
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-2 left-4 px-3 py-1 rounded-full bg-white dark:bg-surface-900 border border-zinc-200/90 dark:border-zinc-700/90 shadow-md text-[10px] font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 z-20"
            >
              <Activity className="w-3.5 h-3.5 text-brand-500" />
              <span>WebAssembly 60 FPS</span>
            </motion.div>

            {/* Floating Metric Slates */}
            <div className="w-full max-w-[260px] space-y-2.5 transform group-hover:scale-[1.03] transition-transform duration-300 relative z-10">
              {/* Progress Card with Animated Gradient Shimmer */}
              <div className="bg-white dark:bg-surface-900 rounded-xl p-3 shadow-md shadow-zinc-950/5 dark:shadow-black/40 border border-zinc-200/80 dark:border-zinc-700/80">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                    Overall progress
                  </span>
                  <span className="text-brand-600 dark:text-brand-400 font-mono font-black">100%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative">
                  <motion.div
                    animate={{ width: ['90%', '100%', '90%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="h-full bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-400 rounded-full"
                  />
                </div>
              </div>

              {/* Avg Processing Time Card */}
              <div className="bg-white dark:bg-surface-900 rounded-xl p-2.5 shadow-md shadow-zinc-950/5 dark:shadow-black/40 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 fill-emerald-500/30" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 leading-tight">Avg. execution</p>
                    <p className="text-xs font-black text-zinc-900 dark:text-white">&lt; 1.2s in RAM</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Instant
                </span>
              </div>

              {/* Text & Vector Accuracy Card */}
              <div className="bg-white dark:bg-surface-900 rounded-xl p-2.5 shadow-md shadow-zinc-950/5 dark:shadow-black/40 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 leading-tight">Layout & Vector</p>
                    <p className="text-xs font-black text-zinc-900 dark:text-white">99.9% Preserved</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  Lossless
                </span>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 flex flex-col justify-end">
            <h3 className="text-xl font-bold font-display text-zinc-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Accuracy you can trust
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Get pixel-perfect, clean files in seconds. WebAssembly and WebGPU execute transforms locally with zero degradation to typography, vectors, or form fields.
            </p>
          </div>
        </motion.div>

        {/* ================= CARD 3: BUILT-IN SECURITY ================= */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -8, transition: { duration: 0.25, ease: 'easeOut' } }}
          className="group relative flex flex-col rounded-3xl p-6 sm:p-7 bg-white/70 dark:bg-surface-900/60 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/40 transition-all duration-300"
        >
          {/* Subtle Hover Gradient Rim */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          {/* Card Visual Mockup Container */}
          <div className="h-68 rounded-2xl bg-gradient-to-b from-zinc-50 to-zinc-100/70 dark:from-surface-850/80 dark:to-surface-800/60 border border-zinc-200/60 dark:border-zinc-700/50 p-4 flex items-center justify-center relative overflow-hidden mb-6">
            {/* Ambient inner card glow */}
            <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-36 h-36 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 blur-2xl pointer-events-none" />

            {/* Floating Top Badge: AES-256 WebCrypto */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
              className="absolute -top-2 left-4 px-3 py-1 rounded-full bg-white dark:bg-surface-900 border border-zinc-200/90 dark:border-zinc-700/90 shadow-md text-[10px] font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 z-20"
            >
              <Lock className="w-3 h-3 text-amber-500" />
              <span>AES-256 WebCrypto</span>
            </motion.div>

            {/* Floating Top-Right Pill: Privacy by Architecture */}
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              className="absolute -top-2 right-4 px-2.5 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black shadow-lg shadow-indigo-500/30 flex items-center gap-1.5 z-20"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Zero-Server</span>
            </motion.div>

            {/* Main Center Security Card with Radar Pulse */}
            <div className="w-full max-w-[260px] bg-white dark:bg-surface-900 rounded-2xl p-4 shadow-xl shadow-zinc-950/5 dark:shadow-black/50 border border-zinc-200/90 dark:border-zinc-700/90 text-center space-y-2.5 transform group-hover:scale-[1.03] transition-transform duration-300 relative z-10">
              {/* Radar Pulsing Icon */}
              <div className="relative w-12 h-12 mx-auto">
                <span className="absolute inset-0 rounded-2xl bg-emerald-500/20 animate-ping opacity-75" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center justify-center gap-1.5">
                  <span>Client-Side RAM Isolation</span>
                </h4>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-snug mt-0.5 max-w-[210px] mx-auto">
                  Files process in local device RAM buffer. Zero bytes leave your browser.
                </p>
              </div>

              {/* Status Indicators Row */}
              <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-zinc-100 dark:border-zinc-800 text-[10px]">
                <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 py-1 rounded-lg">
                  <Check className="w-3 h-3" />
                  <span>No Cloud Log</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-cyan-600 dark:text-cyan-400 font-semibold bg-cyan-500/10 py-1 rounded-lg">
                  <HardDrive className="w-3 h-3" />
                  <span>Auto-Clears</span>
                </div>
              </div>
            </div>

            {/* Floating Bottom Pill: 0 Byte Upload */}
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 3.9, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute -bottom-2 right-6 px-3 py-1 rounded-full bg-emerald-500/15 dark:bg-emerald-500/25 border border-emerald-500/35 text-[10px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 shadow-md z-20 backdrop-blur-xs"
            >
              <ServerOff className="w-3 h-3 text-emerald-500" />
              <span>0 Byte Remote Upload</span>
            </motion.div>
          </div>

          {/* Text Content */}
          <div className="flex-1 flex flex-col justify-end">
            <h3 className="text-xl font-bold font-display text-zinc-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Built-in security
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Process confidential legal contracts, bank audits, and personal IDs with complete peace of mind. What runs in your browser stays strictly in your browser.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
