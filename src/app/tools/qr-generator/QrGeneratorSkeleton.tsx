import React from 'react';
import { Sparkles, QrCode } from 'lucide-react';

export default function QrGeneratorSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-pulse">
      {/* Presets Chips Skeleton */}
      <div className="w-full flex items-center gap-2 overflow-hidden py-2 px-1">
        <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg shrink-0" />
        <div className="h-8 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-xl shrink-0" />
        <div className="h-8 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-xl shrink-0" />
        <div className="h-8 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-xl shrink-0" />
        <div className="h-8 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-xl shrink-0" />
        <div className="h-8 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-xl shrink-0" />
      </div>

      {/* Main Studio 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & Customizer Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tabs Row */}
          <div className="glass-card p-2 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 flex gap-2 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-10 flex-1 bg-zinc-200 dark:bg-zinc-800/80 rounded-xl" />
            ))}
          </div>

          {/* Input Card */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-4">
            <div className="h-4 w-36 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-12 w-full bg-zinc-100 dark:bg-zinc-800/60 rounded-xl" />
            <div className="h-3 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>

          {/* Accordion Panels */}
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
                <div className="h-5 w-40 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-5 w-5 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live QR Preview & Actions */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col items-center justify-center space-y-6">
            <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center space-y-3">
              <QrCode className="w-12 h-12 text-zinc-300 dark:text-zinc-600 animate-pulse" />
              <div className="h-3 w-28 bg-zinc-200 dark:bg-zinc-700 rounded" />
            </div>

            {/* Download Buttons */}
            <div className="w-full grid grid-cols-2 gap-3">
              <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
              <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
            </div>
            <div className="h-11 w-full bg-zinc-100 dark:bg-zinc-800/60 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
