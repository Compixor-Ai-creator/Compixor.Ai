'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileDown,
  FileText,
  Camera,
  QrCode,
  Crop,
  Files,
  Stamp,
  Eraser,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  LucideIcon,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/SocialIcons';

export type ToolId =
  | 'pdf-compressor'
  | 'word-compressor'
  | 'add-watermark'
  | 'remove-watermark'
  | 'pdf-organizer'
  | 'passport-photo'
  | 'full-dp-maker'
  | 'qr-generator';

export interface ToolItem {
  id: ToolId;
  name: string;
  badge: string;
  stat: string;
  href: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  color: string;
  tagline: string;
  description: string;
}

export const ALL_TOOLS: ToolItem[] = [
  {
    id: 'pdf-compressor',
    name: 'PDF Compressor',
    badge: 'Popular',
    stat: 'Up to 75% Reduction',
    href: '/tools/pdf-compressor',
    icon: FileDown,
    color: 'from-brand-500 to-indigo-600',
    tagline: '100% Client-Side Privacy',
    description: 'Compress PDF files online free. Native vector preservation with zero quality loss and no server uploads.',
  },
  {
    id: 'word-compressor',
    name: 'Word Compressor',
    badge: 'Fast',
    stat: 'Preserves Formatting',
    href: '/tools/word-compressor',
    icon: FileText,
    color: 'from-blue-500 to-cyan-500',
    tagline: '100% Private, Browser-Based',
    description: 'Shrink DOCX Microsoft Word files by compressing embedded images without losing document structure.',
  },
  {
    id: 'add-watermark',
    name: 'Add PDF Watermark',
    badge: 'New',
    stat: 'Text & Image Stamps',
    href: '/tools/add-watermark',
    icon: Stamp,
    color: 'from-rose-500 to-pink-600',
    tagline: '100% Client-Side Privacy',
    description: 'Add custom text or image watermarks to your PDF with opacity and rotation controls.',
  },
  {
    id: 'remove-watermark',
    name: 'Remove PDF Watermark',
    badge: 'Featured',
    stat: 'No Software Needed',
    href: '/tools/remove-watermark',
    icon: Eraser,
    color: 'from-amber-500 to-rose-600',
    tagline: 'No Login Required',
    description: 'Remove watermarks, logos, and stamps from PDF files free online with zero server uploads.',
  },
  {
    id: 'pdf-organizer',
    name: 'PDF Merge & Split',
    badge: 'Popular',
    stat: 'Combine or Extract',
    href: '/tools/pdf-organizer',
    icon: Files,
    color: 'from-cyan-500 to-indigo-600',
    tagline: 'Instant In-Browser Engine',
    description: 'Combine multiple PDFs into one or split a PDF into separate files by custom page ranges.',
  },
  {
    id: 'passport-photo',
    name: 'Passport Photo Maker',
    badge: 'Trending',
    stat: 'NADRA & US Visa Ready',
    href: '/tools/passport-photo',
    icon: Camera,
    color: 'from-emerald-500 to-teal-500',
    tagline: '300 DPI Printable Sheet',
    description: 'Create passport size photos online with white background matting and international size presets.',
  },
  {
    id: 'full-dp-maker',
    name: 'No-Crop DP Maker',
    badge: 'Featured',
    stat: 'Blur & Square Canvas',
    href: '/tools/full-dp-maker',
    icon: WhatsAppIcon,
    color: 'from-violet-500 to-purple-600',
    tagline: 'For WhatsApp & Instagram',
    description: 'Resize profile pictures without cropping. Perfect square fit with aesthetic background blur.',
  },
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    badge: 'Instant',
    stat: 'SVG & High-Res PNG',
    href: '/tools/qr-generator',
    icon: QrCode,
    color: 'from-amber-500 to-rose-500',
    tagline: 'Custom Colors & Logos',
    description: 'Generate high-resolution QR codes for websites, WiFi & contact cards with custom styling.',
  },
];

// Mapping of primary related tools per tool for rich contextual cross-linking
const RELATED_TOOL_IDS: Record<ToolId, ToolId[]> = {
  'pdf-compressor': ['pdf-organizer', 'word-compressor', 'add-watermark', 'remove-watermark'],
  'word-compressor': ['pdf-compressor', 'pdf-organizer', 'qr-generator', 'add-watermark'],
  'add-watermark': ['remove-watermark', 'pdf-compressor', 'pdf-organizer', 'word-compressor'],
  'remove-watermark': ['add-watermark', 'pdf-compressor', 'pdf-organizer', 'word-compressor'],
  'pdf-organizer': ['pdf-compressor', 'add-watermark', 'remove-watermark', 'word-compressor'],
  'passport-photo': ['full-dp-maker', 'qr-generator', 'pdf-compressor', 'pdf-organizer'],
  'full-dp-maker': ['passport-photo', 'qr-generator', 'pdf-compressor', 'word-compressor'],
  'qr-generator': ['full-dp-maker', 'pdf-compressor', 'word-compressor', 'passport-photo'],
};

interface RelatedToolsProps {
  currentTool: ToolId;
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function RelatedTools({
  currentTool,
  title = 'Explore Related Tools',
  subtitle = 'Enhance your productivity with more 100% private, client-side media and document utilities.',
  className = '',
}: RelatedToolsProps) {
  const recommendedIds = RELATED_TOOL_IDS[currentTool] || [];
  const relatedList = ALL_TOOLS.filter((t) => recommendedIds.includes(t.id)).slice(0, 3);

  if (relatedList.length === 0) return null;

  return (
    <section className={`mt-16 pt-12 border-t border-zinc-200/80 dark:border-zinc-800/80 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20 mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Workflow Ecosystem</span>
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
        {relatedList.map((tool, idx) => {
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
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20">
                      {tool.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {tool.name}
                  </h3>

                  <div className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span>{tool.stat}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2.5 line-clamp-2 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

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
