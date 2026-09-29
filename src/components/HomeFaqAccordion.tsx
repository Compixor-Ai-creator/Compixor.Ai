'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

interface HomeFaqAccordionProps {
  faqs: FaqItem[];
}

export default function HomeFaqAccordion({ faqs }: HomeFaqAccordionProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {faqs.map((faq, idx) => {
        const isOpen = activeFaq === idx;
        const panelId = `faq-panel-${idx}`;
        const triggerId = `faq-trigger-${idx}`;
        return (
          <div key={idx} className="glass-card rounded-2xl overflow-hidden transition">
            <button
              id={triggerId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setActiveFaq(isOpen ? null : idx)}
              className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-zinc-900 dark:text-white"
            >
              <span className="flex items-center gap-3">
                <HelpCircle className="w-4 h-4 text-brand-500 shrink-0" />
                {faq.q}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              className={`px-5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 transition-all duration-300 overflow-hidden ${
                isOpen ? 'max-h-96 pb-5 pt-3 opacity-100' : 'max-h-0 pb-0 pt-0 opacity-0'
              }`}
            >
              {faq.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
