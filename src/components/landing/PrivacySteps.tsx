'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, FolderUp, Cpu, Download } from 'lucide-react';

export default function PrivacySteps() {
  const steps = [
    {
      num: '01 / CHOOSE',
      title: 'Pick a file',
      desc: 'Select the file you want to work on from your device.',
      icon: FolderUp,
      action: null,
    },
    {
      num: '02 / PROCESS',
      title: 'Processed on your device, or securely',
      desc: '9 tools do the work inside your browser, on your own device. PDF to Word, Image to Word and Passport Photo use our server: the file travels over encrypted HTTPS, is not stored, and is deleted right after processing once the result is returned.',
      icon: Cpu,
      action: {
        text: 'Read our Privacy Policy',
        href: '/privacy',
      },
    },
    {
      num: '03 / DOWNLOAD',
      title: 'Download the result',
      desc: 'Save the finished file straight to your device.',
      icon: Download,
      action: null,
    },
  ];

  return (
    <section
      id="how-it-works-section"
      aria-labelledby="how-it-works-heading"
      className="cx-section relative"
      style={{
        paddingTop: 'clamp(64px, 7vw, 96px)',
        paddingBottom: 'clamp(64px, 7vw, 96px)',
        backgroundColor: 'var(--cx-bg)',
      }}
    >
      <div className="cx-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div
            className="cx-mono inline-block text-xs font-semibold uppercase mb-3"
            style={{
              fontFamily: 'var(--cx-font-mono)',
              letterSpacing: '0.08em',
              color: 'var(--cx-accent-text)',
            }}
          >
            HOW IT WORKS
          </div>
          <h2
            id="how-it-works-heading"
            className="font-bold tracking-tight mb-4"
            style={{
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontSize: 'clamp(28px, 3.2vw, 40px)',
              color: 'var(--cx-text)',
              lineHeight: 1.15,
            }}
          >
            What happens to your file
          </h2>
        </div>

        {/* Steps Grid */}
        <ul
          className="grid grid-cols-1 md:grid-cols-3 gap-6 list-none p-0 m-0"
        >
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <li key={step.num} className="flex">
                <div
                  className="cx-step-card flex flex-col justify-between w-full p-6 sm:p-8"
                  style={{
                    backgroundColor: 'var(--cx-surface)',
                    border: '1px solid var(--cx-line)',
                    borderRadius: 'var(--cx-radius-l)',
                    transition: 'transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span
                        className="cx-mono text-xs font-semibold uppercase"
                        style={{
                          fontFamily: 'var(--cx-font-mono)',
                          letterSpacing: '0.08em',
                          color: 'var(--cx-accent-text)',
                        }}
                      >
                        {step.num}
                      </span>
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: 'var(--cx-surface-2)',
                          color: 'var(--cx-accent-text)',
                          border: '1px solid var(--cx-line)',
                        }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    <h3
                      className="font-bold text-lg sm:text-xl mb-3"
                      style={{ color: 'var(--cx-text)' }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="text-sm sm:text-base leading-relaxed"
                      style={{ color: 'var(--cx-muted)' }}
                    >
                      {step.desc}
                    </p>
                  </div>

                  {step.action && (
                    <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--cx-line)' }}>
                      <Link
                        href={step.action.href}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-colors hover:text-[var(--cx-accent)] min-h-[44px] min-w-[44px] py-2 px-1 focus:outline-none focus:ring-2 focus:ring-[var(--cx-accent)] rounded"
                        style={{ color: 'var(--cx-accent-text)' }}
                      >
                        <span>{step.action.text}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <style jsx>{`
        .cx-step-card:hover {
          transform: translateY(-2px);
          border-color: var(--cx-accent) !important;
          box-shadow: 0 10px 24px -10px rgba(124, 58, 237, 0.2);
        }
      `}</style>
    </section>
  );
}
