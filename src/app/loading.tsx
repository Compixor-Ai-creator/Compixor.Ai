import React from 'react';
import StaticToolSkeleton from '@/components/StaticToolSkeleton';

export default function RootLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      <StaticToolSkeleton />
    </div>
  );
}
