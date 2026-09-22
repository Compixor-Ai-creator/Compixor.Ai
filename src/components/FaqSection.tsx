'use client';

import React from 'react';
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
  includeJsonLd = false,
}: FaqSectionProps) {
  return (
    <section className="mt-16 pt-10 border-t border-zinc-200/80 dark:border-zinc-800/80">
      {includeJsonLd && faqs && faqs.length > 0 && (
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
        <h2 className="text-2xl font-bold font-display text-zinc-900 dark:text-white mb-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            {subtitle}
          </p>
        )}
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <details
            key={idx}
            className="group glass-card rounded-xl overflow-hidden transition"
          >
            <summary className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-zinc-900 dark:text-white cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4 text-brand-500 shrink-0" />
                {faq.q}
              </span>
              <ChevronDown className="w-4 h-4 text-zinc-400 transition-transform duration-200 group-open:rotate-180 shrink-0" />
            </summary>
            {/* The answer is always present in initial SSR DOM HTML for Googlebot and SEO indexation */}
            <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
