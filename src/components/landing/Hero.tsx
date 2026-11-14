'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.45,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section
      id="hero-section"
      className="relative pt-6 sm:pt-10 pb-24 sm:pb-32 overflow-hidden bg-[var(--cx-bg)]"
    >
      {/* ================= BACKGROUND AMBIENCE (TARGET-MATCHING) ================= */}
      {/* Star dots pattern (dark mode only) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-25 dark:opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(1.5px 1.5px at 20px 30px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 80px 120px, #e2d9ff, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 160px 70px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 240px 210px, #c4b5fd, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 320px 140px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 400px 290px, #ddd6fe, rgba(0,0,0,0))
          `,
          backgroundSize: '460px 360px',
        }}
      />

      {/* Top-left diagonal violet light beam */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-36 -left-32 w-[680px] sm:w-[880px] h-[680px] sm:h-[880px] z-0"
        style={{
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.36) 0%, rgba(139, 92, 246, 0.22) 32%, rgba(109, 40, 217, 0.08) 55%, transparent 72%)',
          filter: 'blur(52px)',
          transform: 'rotate(-12deg)',
        }}
      />

      {/* Right-edge blue-teal nebula mist */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[14%] -right-28 w-[420px] sm:w-[520px] h-[420px] sm:h-[520px] z-0"
        style={{
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.13) 0%, rgba(139, 92, 246, 0.08) 45%, transparent 70%)',
          filter: 'blur(64px)',
        }}
      />

      {/* ================= ECLIPSE RING (BEHIND H1 TOP-RIGHT) ================= */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute z-0 rounded-full
                   w-[270px] h-[270px] sm:w-[320px] sm:h-[320px] lg:w-[350px] lg:h-[350px]
                   right-[4%] sm:right-[10%] lg:right-[13%] xl:right-[15%]
                   top-[14%] sm:top-[12%] lg:top-[10%]"
        style={{
          background: 'var(--cx-bg)',
          border: '1px solid rgba(139, 92, 246, 0.35)',
          borderRight: '3px solid rgba(245, 243, 255, 0.98)',
          borderTop: '2px solid rgba(196, 181, 253, 0.85)',
          boxShadow: `
            20px -4px 75px 12px rgba(139, 92, 246, 0.85),
            32px 0 115px 24px rgba(124, 58, 237, 0.55),
            inset -14px 0 32px rgba(167, 139, 250, 0.65),
            inset -3px 0 8px rgba(255, 255, 255, 0.95)
          `,
        }}
      />

      {/* ================= HERO CONTENT (CENTERED) ================= */}
      <div className="cx-container relative z-10 flex flex-col items-center text-center px-4 sm:px-6">
        <motion.div
          className="flex flex-col items-center max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge Pill */}
          <motion.div variants={itemVariants} className="mb-5 sm:mb-6">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-[13px] font-medium
                         bg-white/[0.05] dark:bg-white/[0.05] text-zinc-800 dark:text-[#f4f2ff]
                         border border-black/10 dark:border-white/15 backdrop-blur-md shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>All-in-One Private PDF &amp; Image Toolkit • Zero File Storage</span>
            </span>
          </motion.div>

          {/* H1 Heading (2 Lines on Desktop, Inter 800) */}
          <motion.h1
            variants={itemVariants}
            id="hero-heading"
            className="font-extrabold tracking-[-0.03em] leading-[1.1] mb-5
                       text-3xl sm:text-5xl lg:text-[3.5rem] xl:text-[4rem]
                       text-zinc-950 dark:text-white"
            style={{ fontFamily: 'var(--font-inter), sans-serif' }}
          >
            <span>Free Private PDF, Word &amp;</span>
            <br />
            <span
              className="bg-gradient-to-r from-[#6d28d9] via-[#8b5cf6] to-[#a78bfa]
                         dark:from-[#a78bfa] dark:via-[#c4b5fd] dark:to-[#e0d4ff]
                         bg-clip-text text-transparent inline-block"
            >
              Photo Tools in Your Browser
            </span>
          </motion.h1>

          {/* Subtitle (Exact 3-line copy fix) */}
          <motion.p
            variants={itemVariants}
            id="hero-summary"
            className="text-base sm:text-lg text-[#5b5675] dark:text-[#9b97b5]
                       max-w-[650px] mx-auto mb-8 sm:mb-10 leading-relaxed font-normal"
            style={{ fontFamily: 'var(--font-inter), sans-serif' }}
          >
            Compixor is a private web toolkit to compress, merge, protect, watermark, and convert
            documents directly in your browser. 9 of our 12 tools run locally on your device with
            zero photo or document uploads.
          </motion.p>

          {/* Two CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto mb-6 sm:mb-8"
          >
            {/* Primary Button */}
            <Link
              href="/#tools"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2
                         min-h-[46px] px-6 sm:px-7 py-3 rounded-full text-sm sm:text-base font-semibold text-white
                         bg-gradient-to-r from-[#4c2fb8] to-[#6a46e0]
                         shadow-lg shadow-purple-900/40 hover:brightness-110 active:scale-[0.98]
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78bfa] focus-visible:ring-offset-2
                         transition-all duration-200"
            >
              <span>Start Now — Make Your Life Easy</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Link>

            {/* Secondary Button */}
            <Link
              href="/#tools"
              className="w-full sm:w-auto inline-flex items-center justify-center
                         min-h-[46px] px-6 sm:px-7 py-3 rounded-full text-sm sm:text-base font-medium
                         border border-zinc-300 dark:border-white/20
                         bg-white/80 dark:bg-white/[0.05]
                         text-zinc-900 dark:text-white
                         hover:bg-zinc-100 dark:hover:bg-white/[0.10]
                         active:scale-[0.98] backdrop-blur-md
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78bfa] focus-visible:ring-offset-2
                         transition-all duration-200"
            >
              <span>Explore All 12 Tools</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* ================= 3D TILTED TABLET SHOWCASE ================= */}
        <motion.div
          className="w-full max-w-5xl mx-auto [perspective:1200px]"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <div
            className="w-full relative overflow-hidden
                       rounded-t-[28px] sm:rounded-t-[38px]
                       border-t-2 border-x-2 border-purple-500/40
                       bg-[#08070f]
                       shadow-[0_-16px_50px_rgba(139,92,246,0.32)]
                       transform [transform:rotateX(10deg)] sm:[transform:rotateX(18deg)] lg:[transform:rotateX(20deg)]
                       transition-transform duration-300"
            style={{
              transformOrigin: 'bottom center',
            }}
          >
            {/* Subtle top edge specular highlight line */}
            <div
              aria-hidden="true"
              className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-300 to-transparent opacity-75 z-10 pointer-events-none"
            />

            <Image
              src="/brand/hero-orbit.png"
              alt="Compixor tools orbiting a PDF: compress, convert to Word, edit image, QR generator, merge and split, protect PDF"
              width={1672}
              height={941}
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1040px"
              className="w-full h-auto object-cover select-none pointer-events-none block"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
