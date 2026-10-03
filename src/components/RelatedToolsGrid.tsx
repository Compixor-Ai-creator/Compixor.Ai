'use client';

import React from 'react';
import Link from 'next/link';
import {
  Lock,
  Unlock,
  FileDown,
  Camera,
  Maximize2,
  QrCode,
  Layers,
  FileText,
  Stamp,
  Eraser,
  ScanText,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Lock,
  Unlock,
  FileDown,
  Camera,
  Maximize2,
  QrCode,
  Layers,
  FileText,
  Stamp,
  Eraser,
  ScanText,
};

export interface RelatedToolItem {
  title: string;
  description: string;
  toolPath: string;
  icon: string;
  color?: string;
}

interface RelatedToolsGridProps {
  tools?: RelatedToolItem[];
  currentToolPath?: string;
}

const defaultToolsList: RelatedToolItem[] = [
  {
    title: 'Protect PDF',
    description: 'Set an open password and granular AES-256 permission restrictions.',
    toolPath: '/tools/protect-pdf',
    icon: 'Lock',
    color: 'from-indigo-600 to-purple-600',
  },
  {
    title: 'Unlock PDF',
    description: 'Remove password restrictions and restore full printing/editing access.',
    toolPath: '/tools/unlock-pdf',
    icon: 'Unlock',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Add PDF Watermark',
    description: 'Stamp custom confidentiality marks and logos across document pages.',
    toolPath: '/tools/add-watermark',
    icon: 'Stamp',
    color: 'from-pink-500 to-rose-600',
  },
  {
    title: 'PDF Compressor',
    description: 'Shrink oversized PDF documents without losing vector text clarity.',
    toolPath: '/tools/pdf-compressor',
    icon: 'FileDown',
    color: 'from-brand-500 to-indigo-600',
  },
  {
    title: 'PDF to Word',
    description: 'Convert PDF files into native editable Microsoft Word (.docx) format.',
    toolPath: '/tools/pdf-to-word',
    icon: 'FileText',
    color: 'from-blue-600 to-indigo-600',
  },
  {
    title: 'PDF Merge & Split',
    description: 'Reorganize, split, and merge multiple documents in any page sequence.',
    toolPath: '/tools/pdf-organizer',
    icon: 'Layers',
    color: 'from-cyan-500 to-blue-600',
  },
];

export default function RelatedToolsGrid({
  tools,
  currentToolPath,
}: RelatedToolsGridProps) {
  // Filter out the tool currently being viewed if possible
  const displayTools = (tools && tools.length > 0 ? tools : defaultToolsList)
    .filter((t) => t.toolPath !== currentToolPath)
    .slice(0, 3);

  return (
    <section className="my-14 not-prose" id="related-tools">
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          Precision Toolset
        </span>
        <h2 className="text-2xl sm:text-3xl font-black font-display text-zinc-900 dark:text-white tracking-tight mt-1">
          Related Tools at a Glance
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {displayTools.map((tool) => {
          const Icon = iconMap[tool.icon] || FileText;
          return (
            <Link
              key={tool.toolPath}
              href={tool.toolPath}
              className="glass-card p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/15 to-purple-500/15 border border-brand-500/25 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 mt-4 flex items-center justify-between text-xs font-bold text-brand-600 dark:text-brand-400">
                <span>Launch Tool</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
