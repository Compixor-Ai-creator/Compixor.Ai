'use client';

import React from 'react';
import { CheckCircle2, XCircle, Sparkles, ShieldCheck } from 'lucide-react';
import BeforeAfterSlider from './BeforeAfterSlider';

export default function PassportBeforeAfter() {
  return (
    <section className="w-full max-w-5xl mx-auto my-12 px-2 sm:px-4">
      {/* Header Badge */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Biometric Transformation</span>
        </div>
        <h2 className="text-xl sm:text-3xl font-bold font-display text-zinc-900 dark:text-white">
          See the Difference: Casual Portrait to Official Passport Photo
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-2xl mx-auto leading-relaxed">
          Drag the interactive slider below to inspect how our AI engine isolates individual hair strands, removes the backdrop, and prepares official government-compliant portraits in real time.
        </p>
      </div>

      {/* Comparison Showcase Container */}
      <div className="glass-card rounded-3xl p-4 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Interactive Slider (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <BeforeAfterSlider
              beforeSrc="/images/demo/passport-demo-before.jpg?v=2"
              afterSrc="/images/demo/passport-demo-after.jpg?v=2"
              showColorSwitcher={false}
              showBiometricGuide={true}
              aspectRatio="3/4"
              beforeLabel="Before"
              afterLabel="After"
              className="max-w-md w-full"
            />
          </div>

          {/* Right Column: Key Feature Callouts & Verification Checklist (5 cols) */}
          <div className="lg:col-span-5 space-y-5 text-left">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-500 font-mono">
                Real-Time Matting Inspection
              </span>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-1">
                Zero Fringe Halos & Natural Hair Transparency
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
                Our AI uses morphological edge smoothing and de-halo filtering to preserve fine hair details while cleanly segmenting the subject.
              </p>
            </div>

            {/* Before vs After Comparison List */}
            <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <div className="p-3.5 rounded-xl bg-red-500/5 dark:bg-red-950/20 border border-red-500/20 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>Before (Smartphone Selfie Issues)</span>
                </div>
                <ul className="text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1 pl-6 list-disc">
                  <li>Distracting colored background, shadows, and wall textures</li>
                  <li>Inconsistent head proportions (often rejected by automated visa gates)</li>
                  <li>Uneven ambient color bleed onto clothing and shoulders</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>After (Official Government Compliance)</span>
                </div>
                <ul className="text-[11px] text-zinc-700 dark:text-zinc-300 space-y-1 pl-6 list-disc font-medium">
                  <li>Clean isolated subject ready for official passport backdrops</li>
                  <li>Exact biometric eye axis and chin-to-crown proportions</li>
                  <li>Sharp 300 DPI ready for automated online portals & photo printing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Guarantee Footer Callout */}
        <div className="mt-8 pt-5 border-t border-zinc-200/70 dark:border-zinc-800/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left bg-emerald-500/5 dark:bg-emerald-950/20 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                Strict Privacy Architecture — Zero Photo Retention
              </p>
              <p className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400">
                Your photo is sent securely to our server only to remove the background. We do not store it. Your edited photo stays in your browser until you download it or close the page.
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              100% Free & No Watermarks
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
