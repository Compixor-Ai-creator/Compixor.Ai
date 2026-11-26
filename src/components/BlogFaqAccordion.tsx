'use client';

import React, { useRef } from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

interface BlogFaqAccordionProps {
  faqs: FaqItem[];
}

export default function BlogFaqAccordion({ faqs }: BlogFaqAccordionProps) {
  // Headless UI v2 <Disclosure> is uncontrolled (there is no `open` prop), so
  // "only one question open at a time" is enforced by holding each panel's own
  // `close()` and calling every other one when an item is opened. This keeps the
  // single-open behaviour of the previous hand-rolled accordion without
  // remounting panels (which would kill the collapse animation).
  const closers = useRef<Array<(() => void) | null>>([]);

  const openOnly = (index: number) => {
    closers.current.forEach((close, i) => {
      if (i !== index) close?.();
    });
  };

  return (
    <div className="space-y-3.5 my-8">
      {faqs.map((faq, index) => (
        <Disclosure
          as="div"
          key={index}
          defaultOpen={index === 0}
          className="glass-card rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden transition-[border-color,box-shadow] duration-200 ease-out hover:border-brand-500/30"
        >
          {({ open, close }) => {
            // Kept up to date on every render so the parent can close siblings.
            closers.current[index] = close;

            return (
              <>
                <h3 className="m-0">
                  <DisclosureButton
                    type="button"
                    onClick={() => openOnly(index)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-zinc-900 dark:text-zinc-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5 text-sm sm:text-base font-bold">
                      <HelpCircle className="w-4 h-4 text-brand-500 shrink-0" />
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-zinc-400 transition-transform duration-300 shrink-0 ${
                        open ? 'rotate-180 text-brand-500' : ''
                      }`}
                    />
                  </DisclosureButton>
                </h3>

                {/*
                  `static` keeps the panel mounted in both states.
                  Smooth zero-to-auto height using CSS grid-template-rows (0fr -> 1fr)
                  with inner wrapper overflow-hidden and min-height-0.
                */}
                <DisclosurePanel
                  static
                  className="grid grid-rows-[0fr] opacity-0 invisible data-[open]:visible data-[open]:grid-rows-[1fr] data-[open]:opacity-100 transition-[grid-template-rows,opacity,visibility] duration-[220ms] ease-out motion-reduce:transition-none data-[open]:border-t data-[open]:border-zinc-100 dark:data-[open]:border-zinc-800/60"
                >
                  <div className="overflow-hidden min-h-0">
                    <div className="px-5 pt-2 pb-5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      <p className="m-0">{faq.answer}</p>
                    </div>
                  </div>
                </DisclosurePanel>
              </>
            );
          }}
        </Disclosure>
      ))}
    </div>
  );
}
