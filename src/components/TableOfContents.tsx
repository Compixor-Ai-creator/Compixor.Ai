'use client';

import React, { useEffect, useState } from 'react';
import { List, ChevronRight } from 'lucide-react';

interface TocItem {
  id: string;
  label: string;
}

interface TableOfContentsProps {
  items: TocItem[];
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0.1,
      }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveId(id);
    }
  };

  return (
    <nav
      aria-label="Table of contents"
      className="sticky top-28 glass-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-3"
    >
      <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-200/60 dark:border-zinc-800/60 text-zinc-900 dark:text-zinc-100 font-bold text-xs uppercase tracking-wider">
        <List className="w-4 h-4 text-brand-500" />
        <span>Table of Contents</span>
      </div>

      <ul className="space-y-1.5 text-xs">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => scrollToSection(e, item.id)}
                className={`group flex items-center justify-between py-1.5 px-2 rounded-lg transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                }`}
              >
                <span className="truncate pr-1">{item.label}</span>
                <ChevronRight
                  className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                    isActive
                      ? 'text-brand-500 translate-x-0.5'
                      : 'text-zinc-400 opacity-0 group-hover:opacity-100'
                  }`}
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
