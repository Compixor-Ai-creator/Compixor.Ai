'use client';

import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export default function LoadingSkeleton({ className = '', lines = 3 }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 rounded-lg bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800 animate-shimmer`}
          style={{
            backgroundSize: '200% 100%',
            width: `${100 - i * 15}%`,
          }}
        />
      ))}
    </div>
  );
}

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-zinc-700 animate-shimmer mb-4" style={{ backgroundSize: '200% 100%' }} />
      <div className="h-5 w-2/3 rounded bg-zinc-200 dark:bg-zinc-700 animate-shimmer mb-3" style={{ backgroundSize: '200% 100%' }} />
      <LoadingSkeleton lines={2} />
    </div>
  );
}
