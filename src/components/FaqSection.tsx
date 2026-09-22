'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { FaqItem } from '@/components/JsonLd';

interface FaqSectionProps {
  title?: string;
  subtitle?: string;
  faqs: FaqItem[];
  includeJsonLd?: boolean;
}

export default function FaqSection({
  title = 'Frequently Asked Questions',
  subtitle = 'Answers to common questions about this tool',
  faqs,
  includeJsonLd = true,
}: FaqSectionProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="mt-16 pt-10 border-t border-zinc-200/80 dark:border-zinc-800/80 max-w-4xl mx-auto px-4 sm:px-6">
      {includeJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map((item) => ({
                '@type': 'Question',
                name: item.q,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: item.a,
                },
              })),
            }),
          }}
        />
      )}

      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black font-display text-zinc-900 dark:text-white mb-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            {subtitle}
          </p>
        )}
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = activeFaq === idx;
          const panelId = `tool-faq-panel-${idx}`;
          const triggerId = `tool-faq-trigger-${idx}`;

          return (
            <div key={idx} className="glass-card rounded-2xl overflow-hidden transition">
              <button
                id={triggerId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setActiveFaq(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-zinc-900 dark:text-white cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-brand-500 shrink-0" />
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {/* Answer always in DOM for SEO & view-source — hidden via CSS, never unmounted */}
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
    </section>
  );
}
