'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Zap,
  Bot,
  Cpu,
  ArrowRight,
  Home,
  RotateCcw,
  Compass,
  FileDown,
  FileText,
  Camera,
  Maximize,
  QrCode,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';

export interface ErrorStageProps {
  type: '404' | 'error';
  badgeTitle?: string;
  badgeCode?: string;
  systemAlertLabel?: string;
  headlineMain?: string;
  headlineGradient?: string;
  description?: string;
  error?: Error & { digest?: string };
  reset?: () => void;
}

const quickTools = [
  { href: '/tools/pdf-compressor', label: 'PDF Compressor', icon: FileDown },
  { href: '/tools/word-compressor', label: 'Word Compressor', icon: FileText },
  { href: '/tools/passport-photo', label: 'Passport Photo', icon: Camera },
  { href: '/tools/full-dp-maker', label: 'Full DP Maker', icon: Maximize },
  { href: '/tools/qr-generator', label: 'QR Generator', icon: QrCode },
];

export default function ErrorStage({
  type = '404',
  badgeTitle = type === '404' ? 'Oops! 404 Error' : 'Oops! System Error',
  badgeCode = type === '404' ? 'HTTP_404_PAGE_NOT_FOUND' : 'ERR_RUNTIME_EXCEPTION',
  systemAlertLabel = type === '404' ? 'System Alert · Page Not Found' : 'System Alert · Runtime Error',
  headlineMain = type === '404' ? 'Oh No!' : 'System Glitch!',
  headlineGradient = type === '404' ? 'Lost in the Void.' : 'Calculations Interrupted.',
  description = type === '404'
    ? 'The page you were searching for has disconnected or migrated to an unknown sector. All local calculations and memory remain safe and sound.'
    : 'An unexpected glitch occurred during execution. Your local files and browser memory remain completely protected and untampered.',
  error,
  reset,
}: ErrorStageProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="relative w-full min-h-[calc(100vh-8rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Atmospheric Ambient Colorful Glow Orbs */}
      <div className="absolute -top-24 -left-20 w-[450px] h-[450px] bg-cyan-500/15 dark:bg-cyan-500/20 rounded-full blur-3xl pointer-events-none -z-10 animate-ambient-2" />
      <div className="absolute -bottom-24 -right-20 w-[500px] h-[500px] bg-brand-500/15 dark:bg-brand-500/25 rounded-full blur-3xl pointer-events-none -z-10 animate-ambient-1" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-brand-500/20 via-cyan-500/15 to-emerald-500/15 blur-3xl -z-10 rounded-full pointer-events-none opacity-70" />

      {/* Glassmorphic Elevated Container matching Compixor Theme */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-6xl rounded-3xl bg-white/75 dark:bg-surface-900/80 backdrop-blur-2xl shadow-2xl shadow-brand-500/5 dark:shadow-brand-950/60 p-6 sm:p-10 lg:p-14 border border-zinc-200/70 dark:border-brand-500/20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center w-full">
          
          {/* Left Column: Robot Mascot Stage & Floating Micro-badges */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative select-none">
            <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
              
              {/* Backdrop Radial Halo Stage */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-brand-100/85 via-white/95 to-cyan-50/80 shadow-[0_15px_45px_rgba(124,58,237,0.15)] dark:shadow-[0_0_50px_rgba(124,58,237,0.35)] border border-brand-200/50 dark:border-brand-400/30 animate-radar-pulse" />

              {/* Animated Orbit Radar Concentric Rings */}
              <svg
                className="absolute inset-0 w-full h-full stroke-brand-500/25 dark:stroke-brand-400/40 -z-0 pointer-events-none animate-radar-spin origin-center"
                fill="none"
                viewBox="0 0 460 460"
              >
                <circle cx="230" cy="230" r="210" strokeDasharray="6 8" strokeWidth="1.2" />
                <circle cx="230" cy="230" opacity="0.65" r="160" strokeWidth="1" />
                <circle cx="230" cy="230" opacity="0.45" r="110" strokeDasharray="4 6" strokeWidth="1" />
              </svg>

              {/* Holographic Backlight Glow Behind Mascot Screen Area */}
              <div className="absolute top-12 left-1/2 -translate-x-1/2 w-64 h-52 bg-gradient-to-br from-cyan-400/35 via-brand-500/25 to-transparent rounded-full blur-2xl pointer-events-none -z-0 animate-holo-glow" />

              {/* Dynamic Grounding Shadow below Mascot */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-64 h-10 bg-gradient-to-r from-brand-900/15 via-zinc-900/35 to-brand-900/15 rounded-[100%] pointer-events-none z-[5] animate-ground-shadow" />

              {/* Floating Robot Mascot Illustration */}
              <div className="relative z-10 w-full h-full flex items-center justify-center p-4 animate-mascot-float">
                <img
                  src="/images/404-robot.png"
                  alt="System Error Mascot"
                  className="w-[360px] max-w-[90%] h-auto object-contain pointer-events-none select-none mix-blend-multiply drop-shadow-[0_12px_28px_rgba(124,58,237,0.18)]"
                />
              </div>

              {/* Badge 1: Top-Left ERR_DISCONNECT */}
              <div className="absolute top-5 left-2 sm:left-6 bg-white/90 dark:bg-surface-850/90 backdrop-blur-md shadow-lg p-2.5 rounded-xl flex items-center gap-2 border border-zinc-200/80 dark:border-brand-500/30 z-20 animate-badge-1">
                <Zap className="w-4 h-4 text-brand-500 dark:text-brand-400 fill-brand-500/20" />
                <span className="font-mono text-xs text-zinc-700 dark:text-zinc-200 font-semibold tracking-wide">
                  {type === '404' ? 'ERR_DISCONNECT' : 'ERR_CRITICAL_FAIL'}
                </span>
              </div>

              {/* Badge 2: Top-Right Speech Bubble */}
              <div className="absolute -top-3 right-1 sm:right-6 z-20 bg-white/95 dark:bg-surface-850/95 backdrop-blur-md rounded-2xl p-3 shadow-xl shadow-brand-500/10 dark:shadow-brand-950/50 flex items-center gap-2.5 transition-transform duration-300 hover:scale-105 border border-zinc-200/80 dark:border-brand-500/30 animate-badge-2">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center text-brand-500 dark:text-brand-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-zinc-900 dark:text-white leading-tight font-display">
                    {badgeTitle}
                  </span>
                  <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                    {badgeCode}
                  </span>
                </div>
                <div className="absolute -bottom-2 left-6 w-3 h-3 bg-white/95 dark:bg-surface-850/95 rotate-45 border-r border-b border-zinc-200/80 dark:border-brand-500/30" />
              </div>

              {/* Badge 3: Bottom-Right Client Cache Status */}
              <div className="absolute bottom-10 right-2 sm:right-6 bg-white/90 dark:bg-surface-850/90 backdrop-blur-md shadow-lg px-3.5 py-1.5 rounded-xl flex items-center gap-2 border border-zinc-200/80 dark:border-brand-500/30 z-20 animate-badge-3">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse" />
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Client Cache: Intact
                </span>
              </div>
            </div>

            {/* Bottom Worker Node Status Pill */}
            <div className="mt-4 flex items-center gap-2 text-zinc-600 dark:text-zinc-300 bg-zinc-100/80 dark:bg-surface-800/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-zinc-200/80 dark:border-brand-500/20 shadow-sm">
              <Cpu className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
              <span className="font-mono text-xs">
                Worker status:{' '}
                <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
                  Local memory untampered
                </span>
              </span>
            </div>
          </div>

          {/* Right Column: High-Impact Typography & Action Content */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
            
            {/* System Alert Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20 mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400 animate-pulse" />
              <span>{systemAlertLabel}</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-zinc-900 dark:text-white tracking-tight leading-[1.1] mb-4">
              {headlineMain}
              <br />
              <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500 dark:from-brand-400 dark:via-purple-300 dark:to-cyan-400 bg-clip-text text-transparent">
                {headlineGradient}
              </span>
            </h1>

            {/* Explanation */}
            <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg max-w-lg mb-8 leading-relaxed">
              {description}
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 w-full sm:w-auto mb-8">
              {type === 'error' && reset ? (
                <>
                  <button
                    onClick={reset}
                    className="relative overflow-hidden group inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 text-white font-semibold px-7 py-3.5 rounded-xl shadow-glow hover:shadow-glow-lg active:scale-[0.98] transition-all duration-200"
                  >
                    <RotateCcw className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-90" />
                    <span>Try Again</span>
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                  </button>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-zinc-700 dark:text-zinc-200 hover:text-brand-600 dark:hover:text-brand-400 font-semibold px-6 py-3.5 rounded-xl border border-zinc-200 dark:border-brand-500/20 bg-zinc-100/80 dark:bg-surface-800/80 hover:bg-zinc-200/80 dark:hover:bg-surface-700/80 transition-all duration-200 active:scale-[0.98]"
                  >
                    <Home className="w-4 h-4" />
                    <span>Back to Homepage</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/"
                    className="relative overflow-hidden group inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 text-white font-semibold px-7 py-3.5 rounded-xl shadow-glow hover:shadow-glow-lg active:scale-[0.98] transition-all duration-200"
                  >
                    <span>Back to Homepage</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                  </Link>
                  <Link
                    href="/#tools"
                    className="group inline-flex items-center gap-2 text-zinc-700 dark:text-zinc-200 hover:text-brand-600 dark:hover:text-brand-400 font-semibold px-6 py-3.5 rounded-xl border border-zinc-200 dark:border-brand-500/20 bg-zinc-100/80 dark:bg-surface-800/80 hover:bg-zinc-200/80 dark:hover:bg-surface-700/80 transition-all duration-200 active:scale-[0.98]"
                  >
                    <Compass className="w-4 h-4 text-zinc-500 group-hover:text-brand-500 transition-colors" />
                    <span>Explore All Tools</span>
                  </Link>
                </>
              )}
            </div>

            {/* Expandable Technical Diagnostics (for runtime error boundaries) */}
            {error && (
              <div className="w-full max-w-lg mb-8 text-left">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      showDetails ? 'rotate-180' : ''
                    }`}
                  />
                  <span>
                    {showDetails ? 'Hide' : 'Show'} Technical Diagnostics
                  </span>
                </button>
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 p-3 rounded-xl bg-zinc-100/90 dark:bg-surface-950/80 border border-zinc-200 dark:border-brand-500/20 font-mono text-[11px] text-zinc-700 dark:text-zinc-300 overflow-x-auto space-y-1"
                  >
                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{error.name || 'Runtime Exception'}: {error.message}</span>
                    </div>
                    {error.digest && (
                      <div className="text-zinc-500 dark:text-zinc-400">
                        Digest: <span className="text-brand-600 dark:text-brand-300">{error.digest}</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}

            {/* Quick Tools Recovery Bar */}
            <div className="w-full max-w-lg border-t border-zinc-200/80 dark:border-brand-500/20 pt-6">
              <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
                Quick Tool Recovery
              </span>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {quickTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-surface-800 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-300 border border-zinc-200/60 dark:border-brand-500/15 transition-all duration-150"
                    >
                      <Icon className="w-3.5 h-3.5 text-brand-500" />
                      <span>{tool.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </motion.div>
    </div>
  );
}
