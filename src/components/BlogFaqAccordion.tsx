'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

interface BlogFaqAccordionProps {
  faqs: FaqItem[];
}

export default function BlogFaqAccordion({ faqs }: BlogFaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-3.5 my-8">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="glass-card rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden transition-all duration-200 hover:border-brand-500/30"
          >
            <button
              type="button"
              onClick={() => toggle(index)}
              className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-zinc-900 dark:text-zinc-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
              aria-expanded={isOpen}
            >
              <span className="flex items-center gap-2.5 text-sm sm:text-base font-bold">
                <HelpCircle className="w-4 h-4 text-brand-500 shrink-0" />
                {faq.question}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-zinc-400 transition-transform duration-300 shrink-0 ${
                  isOpen ? 'rotate-180 text-brand-500' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
