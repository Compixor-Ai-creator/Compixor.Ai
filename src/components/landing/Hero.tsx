'use client';

import React from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ShieldCheck } from 'lucide-react';

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
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.45,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const floatAnimation = shouldReduceMotion
    ? {}
    : {
        y: [0, -8, 0],
        transition: {
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };

  return (
    <section id="hero-section" className="relative pt-6 sm:pt-10 pb-12 sm:pb-20 overflow-hidden">
      <div className="cx-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Copy & Actions */}
          <motion.div
            className="lg:col-span-6 flex flex-col items-start text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="mb-4">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[var(--cx-surface)] text-[var(--cx-text)] border border-[var(--cx-line)] shadow-xs">
                <ShieldCheck className="w-4 h-4 text-[var(--cx-accent-soft)] shrink-0" />
                <span>Private PDF &amp; image toolkit</span>
              </span>
            </motion.div>

            {/* H1 Headline */}
            <motion.h1
              variants={itemVariants}
              id="hero-heading"
              className="cx-heading text-3xl sm:text-5xl lg:text-[3.25rem] font-semibold text-[var(--cx-text)] dark:text-[var(--cx-text)] text-zinc-950 dark:text-white leading-[1.14] mb-5 tracking-tight"
            >
              Free{' '}
              <span className="cx-serif-italic font-normal text-[var(--cx-accent-soft)]">
                private
              </span>{' '}
              PDF, Word and photo tools, right in your browser.
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              variants={itemVariants}
              id="hero-summary"
              className="cx-body text-base sm:text-lg text-[var(--cx-muted)] dark:text-[var(--cx-muted)] text-zinc-600 dark:text-zinc-300 max-w-xl mb-8 leading-relaxed"
            >
              Compress, merge, protect, watermark and convert files. 9 of our 12 tools run entirely on your device, so those files never leave it.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-3.5 w-full sm:w-auto"
            >
              <a href="#tools" className="cx-btn-primary w-full sm:w-auto">
                <span>Choose a tool</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </a>
              <a href="#privacy" className="cx-btn-secondary w-full sm:w-auto">
                <span>How privacy works</span>
              </a>
            </motion.div>
          </motion.div>

          {/* Right Column: Hero Orbit Image with soft edge and single viewport glow */}
          <motion.div
            className="lg:col-span-6 flex items-center justify-center lg:justify-end"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <motion.div
              animate={floatAnimation}
              className="relative w-full max-w-[560px] p-2 sm:p-3 bg-[var(--cx-surface)] border border-[var(--cx-line)] shadow-[0_20px_50px_rgba(139,92,246,0.18)]"
              style={{
                borderRadius: 'var(--cx-radius-l)',
              }}
            >
              <div
                className="overflow-hidden relative"
                style={{
                  borderRadius: 'calc(var(--cx-radius-l) - 6px)',
                  WebkitMaskImage: 'radial-gradient(ellipse 98% 98% at 50% 50%, black 82%, transparent 100%)',
                  maskImage: 'radial-gradient(ellipse 98% 98% at 50% 50%, black 82%, transparent 100%)',
                }}
              >
                <Image
                  src="/brand/hero-orbit.png"
                  alt="Compixor tools orbiting a PDF: compress, convert to Word, edit image, QR generator, merge and split, protect PDF"
                  width={1672}
                  height={941}
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 560px"
                  className="w-full h-auto object-cover select-none pointer-events-none"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
