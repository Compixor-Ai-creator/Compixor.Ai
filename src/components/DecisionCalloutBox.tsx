'use client';

import React from 'react';
import Link from 'next/link';
import { Info, ArrowRight, ExternalLink } from 'lucide-react';

export interface DecisionItem {
  boldText: string;
  descText: string;
  toolName?: string;
  toolPath?: string;
}

interface DecisionCalloutBoxProps {
  title?: string;
  items?: DecisionItem[];
  defaultToolName: string;
  defaultToolPath: string;
}

export default function DecisionCalloutBox({
  title = 'What do you want to do? (10-second decision)',
  items,
  defaultToolName,
  defaultToolPath,
}: DecisionCalloutBoxProps) {
  // If items not provided, provide default tailored items
  const decisionItems: DecisionItem[] = items && items.length > 0
    ? items
    : [
        {
          boldText: 'Execute immediately with 100% in-browser privacy',
          descText: 'Start processing right away in device RAM with zero file uploads.',
          toolName: defaultToolName,
          toolPath: defaultToolPath,
        },
        {
          boldText: 'Learn the exact technical guidelines & specs',
          descText: 'Read the detailed requirements, dimension tables, and FAQs below.',
        },
      ];

  return (
    <aside
      aria-label="Quick decision guidance"
      className="my-8 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/30 p-5 sm:p-6 text-zinc-800 dark:text-blue-100 shadow-sm not-prose"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-5 h-5" />
        </div>

        <div className="space-y-3 flex-1 min-w-0">
          <h3 className="font-bold text-base sm:text-lg text-blue-900 dark:text-blue-200 tracking-tight">
            {title}
          </h3>

          <ul className="space-y-2.5 text-xs sm:text-sm leading-relaxed">
            {decisionItems.map((item, idx) => (
              <li key={idx} className="flex flex-wrap items-baseline gap-1.5">
                <span className="text-blue-500 font-bold">•</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {item.boldText}:
                </span>
                <span className="text-zinc-600 dark:text-zinc-300">
                  {item.descText}
                </span>

                {item.toolName && item.toolPath && (
                  <Link
                    href={item.toolPath}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white dark:bg-zinc-800 text-brand-600 dark:text-brand-300 border border-brand-500/30 hover:border-brand-500 hover:shadow-xs transition-all ml-1 align-baseline cursor-pointer"
                  >
                    <span>{item.toolName}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
