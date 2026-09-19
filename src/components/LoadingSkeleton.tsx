'use client';

import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

// Base static skeleton bar (No animation / no shimmer)
export default function LoadingSkeleton({ className = '', lines = 3 }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded-lg bg-zinc-200/80 dark:bg-zinc-800/80"
          style={{ width: `${100 - i * 15}%` }}
        />
      ))}
    </div>
  );
}

// Tool Card Skeleton — static placeholders without animation
export function ToolCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-card p-7 sm:p-8 h-full flex flex-col justify-between rounded-3xl ${className}`}>
      <div>
        {/* Icon + Badge row */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-zinc-200/80 dark:bg-zinc-700/80 shrink-0" />
          <div className="h-6 w-16 rounded-full bg-zinc-200/80 dark:bg-zinc-700/80" />
        </div>

        {/* Title */}
        <div className="h-6 w-3/4 rounded-lg mb-2 bg-zinc-200/80 dark:bg-zinc-700/80" />

        {/* Tagline */}
        <div className="h-4 w-1/2 rounded mb-4 bg-zinc-200/60 dark:bg-zinc-700/60" />

        {/* Description lines */}
        <div className="space-y-2 mb-6">
          <div className="h-3.5 w-full rounded bg-zinc-200/80 dark:bg-zinc-700/80" />
          <div className="h-3.5 w-5/6 rounded bg-zinc-200/80 dark:bg-zinc-700/80" />
          <div className="h-3.5 w-4/6 rounded bg-zinc-200/80 dark:bg-zinc-700/80" />
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
        <div className="h-3 w-28 rounded bg-zinc-200/80 dark:bg-zinc-700/80" />
        <div className="h-3 w-20 rounded bg-zinc-200/80 dark:bg-zinc-700/80" />
      </div>
    </div>
  );
}

// Hero Feature List Skeleton — static placeholders without animation
export function HeroFeaturesSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-card p-5 sm:p-6 rounded-3xl border border-white/60 dark:border-white/10 shadow-2xl backdrop-blur-xl ${className}`}>
      {/* Header row */}
      <div className="flex items-center justify-between pb-3.5 mb-2.5 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          <div className="h-3 w-32 rounded bg-zinc-200/80 dark:bg-zinc-700/80" />
        </div>
        <div className="h-5 w-20 rounded-full bg-zinc-200/80 dark:bg-zinc-700/80" />
      </div>

      {/* Feature rows */}
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3.5 p-2.5 sm:p-3 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-zinc-200/80 dark:bg-zinc-700/80 shrink-0" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div
                className="h-3 rounded bg-zinc-200/80 dark:bg-zinc-700/80"
                style={{ width: `${65 + (i % 3) * 10}%` }}
              />
              <div
                className="h-2.5 rounded bg-zinc-200/80 dark:bg-zinc-700/80"
                style={{ width: `${45 + (i % 4) * 8}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Generic card skeleton (No animation)
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-zinc-200/80 dark:bg-zinc-700/80 mb-4" />
      <div className="h-5 w-2/3 rounded bg-zinc-200/80 dark:bg-zinc-700/80 mb-3" />
      <LoadingSkeleton lines={2} />
    </div>
  );
}
