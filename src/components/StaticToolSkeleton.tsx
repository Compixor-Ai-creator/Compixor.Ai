import React from 'react';

function StaticBar({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-lg bg-zinc-200/80 dark:bg-zinc-800/80 ${className}`}
    />
  );
}

export default function StaticToolSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Header skeleton (Static - no animation) */}
      <div className="text-center mb-10 space-y-4 flex flex-col items-center">
        {/* Badge */}
        <StaticBar className="h-6 w-48 rounded-full" />
        {/* Main Title */}
        <StaticBar className="h-10 w-72 sm:w-96 rounded-xl" />
        {/* Subtitle */}
        <div className="space-y-2 w-full max-w-lg flex flex-col items-center">
          <StaticBar className="h-3.5 w-full" />
          <StaticBar className="h-3.5 w-4/5" />
        </div>
      </div>

      {/* Feature Pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {[76, 84, 72, 88].map((w, i) => (
          <div
            key={i}
            className="h-7 rounded-full bg-zinc-200/70 dark:bg-zinc-800/70"
            style={{ width: `${w}px` }}
          />
        ))}
      </div>

      {/* Main Upload / Action Card Skeleton */}
      <div className="glass-card rounded-3xl border border-zinc-200/70 dark:border-zinc-800/70 p-8 sm:p-14 flex flex-col items-center gap-5 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-zinc-200/80 dark:bg-zinc-800/80" />
        <StaticBar className="h-5 w-52" />
        <StaticBar className="h-3.5 w-36" />
        <div className="h-11 w-44 rounded-xl bg-zinc-200/90 dark:bg-zinc-700/90 mt-2" />
      </div>

      {/* Options Panel Skeleton */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-5 border border-zinc-200/70 dark:border-zinc-800/70">
        <StaticBar className="h-5 w-36" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-zinc-200/80 dark:bg-zinc-800/80 shrink-0" />
            <div className="flex-1 space-y-2">
              <StaticBar className="h-3.5 w-1/3" />
              <StaticBar className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
