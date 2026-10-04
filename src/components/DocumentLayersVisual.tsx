'use client';

import React from 'react';
import Image from 'next/image';
import { Layers } from 'lucide-react';

export default function DocumentLayersVisual() {
  return (
    <div className="my-8 not-prose w-full">
      <div className="relative rounded-3xl bg-zinc-950/90 border border-zinc-800/80 p-3 sm:p-5 shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-zinc-800/60 shadow-lg bg-zinc-900">
          <Image
            src="/blog/pdf-security-layers.jpg"
            alt="PDF Security Multi-Layer Pipeline Architecture: Document, Encryption, Watermark, Flatten"
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
        <div className="flex items-center justify-between pt-3 px-2 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-zinc-300">Multi-Layer PDF Security Architecture</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline-block">Client-Side RAM Pipeline</span>
        </div>
      </div>
    </div>
  );
}
