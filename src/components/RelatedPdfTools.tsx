'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileDown,
  Files,
  Stamp,
  Eraser,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  LucideIcon,
  Lock,
} from 'lucide-react';

export type PdfToolId =
  | 'add-watermark'
  | 'remove-watermark'
  | 'compressor'
  | 'organizer'
  | 'pdf-watermark'
  | 'pdf-protect';

export interface PdfToolConfig {
  id: PdfToolId;
  name: string;
  badge: string;
  stat: string;
  href: string;
  icon: LucideIcon;
  color: string;
  tagline: string;
  description: string;
}

export const PDF_TOOLS: PdfToolConfig[] = [
  {
    id: 'add-watermark',
    name: 'Add Watermark',
    badge: 'New',
    stat: 'Instant Watermarking',
    href: '/tools/add-watermark',
    icon: Stamp,
    color: 'from-rose-500 to-pink-600',
    tagline: '100% Client-Side Privacy',
    description: 'Add custom vector text or image watermarks with precise opacity, rotation & positioning.',
  },
  {
    id: 'remove-watermark',
    name: 'Remove Watermark',
    badge: 'Featured',
    stat: '100% Removal Detection',
    href: '/tools/remove-watermark',
    icon: Eraser,
    color: 'from-amber-500 to-rose-600',
    tagline: '100% Client-Side Privacy',
    description: 'Detect, strip text watermarks or erase stamps losslessly with interactive vector redaction.',
  },
  {
    id: 'compressor',
    name: 'PDF Compressor',
    badge: 'Popular',
    stat: 'Avg 75% Reduction',
    href: '/tools/pdf-compressor',
    icon: FileDown,
    color: 'from-brand-500 to-indigo-600',
    tagline: '100% Client-Side Privacy',
    description: 'Compress heavy PDF documents client-side with native vector preservation and zero quality loss.',
  },
  {
    id: 'organizer',
    name: 'PDF Merge & Split',
    badge: 'Popular',
    stat: 'Zero Cloud Uploads',
    href: '/tools/pdf-organizer',
    icon: Files,
    color: 'from-cyan-500 to-indigo-600',
    tagline: '100% Client-Side Privacy',
    description: 'Combine multiple PDFs or extract exact page ranges into separate documents with visual previews.',
  },
  {
    id: 'pdf-protect',
    name: 'PDF Protect & Unlock',
    badge: 'New',
    stat: 'AES-256 Encryption',
    href: '/tools/pdf-protect',
    icon: Lock,
    color: 'from-indigo-500 to-purple-600',
    tagline: '100% Client-Side Privacy',
    description: 'Password-protect PDFs with AES-256 encryption and granular permissions, or remove restrictions instantly.',
  },
];

interface RelatedPdfToolsProps {
  currentTool: PdfToolId;
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function RelatedPdfTools({
  currentTool,
  title = 'Related PDF Tools',
  subtitle = 'More client-side document utilities you might need — 100% private, zero uploads.',
  className = '',
}: RelatedPdfToolsProps) {
  // Filter out the active tool so only other tools are shown
  const relatedTools = PDF_TOOLS.filter((tool) => {
    if (tool.id === currentTool) return false;
    // If currently on legacy /tools/pdf-watermark, filter both watermark variants if needed or keep them
    if (currentTool === 'pdf-watermark' && (tool.id === 'add-watermark' || tool.id === 'remove-watermark')) {
      return true;
    }
    return true;
  });

  if (relatedTools.length === 0) return null;

  return (
    <section className={`mt-16 pt-12 border-t border-zinc-200/80 dark:border-zinc-800/80 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20 mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Document Workflow Ecosystem</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-zinc-900 dark:text-white tracking-tight">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {relatedTools.map((tool, idx) => {
          const Icon = tool.icon;
          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="group"
            >
              <Link
                href={tool.href}
                className="flex flex-col justify-between h-full p-6 rounded-2xl glass-card hover:border-brand-500/50 dark:hover:border-brand-500/50 transition-all duration-300 hover:shadow-glow hover:-translate-y-1 relative overflow-hidden"
              >
                {/* Background glow hover effect */}
                <div
                  className="absolute -right-12 -top-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
                    filter: 'blur(20px)',
                  }}
                />

                <div>
                  {/* Header: Icon + Badges */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20">
                        {tool.badge}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {tool.name}
                  </h3>

                  {/* Stat Highlight */}
                  <div className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span>{tool.stat}</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2.5 line-clamp-2 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                {/* Footer Link */}
                <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-brand-600 dark:text-brand-400">
                  <div className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Client-Side</span>
                  </div>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Launch Tool</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
