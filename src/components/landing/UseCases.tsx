'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, Briefcase, Globe, Building2, ArrowUpRight } from 'lucide-react';

export default function UseCases() {
  const cases = [
    {
      id: 'students',
      title: 'Students',
      desc: 'Shrink assignments and scanned notes to fit upload limits.',
      icon: GraduationCap,
      tools: [
        { name: 'Compress PDF', href: '/tools/pdf-compressor' },
        { name: 'PDF Merge & Split', href: '/tools/pdf-organizer' },
      ],
    },
    {
      id: 'job-applications',
      title: 'Job applications',
      desc: 'Turn a PDF resume into an editable Word file and make a passport-size photo for the form.',
      icon: Briefcase,
      tools: [
        { name: 'PDF to Word', href: '/tools/pdf-to-word' },
        { name: 'Passport Photo', href: '/tools/passport-photo' },
      ],
    },
    {
      id: 'visa-forms',
      title: 'Visa & government forms',
      desc: 'Get files under portal size limits and prepare a passport-size photo, without installing software.',
      icon: Globe,
      tools: [
        { name: 'Compress PDF', href: '/tools/pdf-compressor' },
        { name: 'Passport Photo', href: '/tools/passport-photo' },
      ],
    },
    {
      id: 'office-business',
      title: 'Office & small business',
      desc: 'Pull text from scanned pages into Word and keep documents tidy.',
      icon: Building2,
      tools: [
        { name: 'Image to Word', href: '/tools/img-to-word' },
        { name: 'PDF Merge & Split', href: '/tools/pdf-organizer' },
      ],
    },
  ];

  return (
    <section
      id="use-cases-section"
      aria-labelledby="use-cases-heading"
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
            USE CASES
          </div>
          <h2
            id="use-cases-heading"
            className="font-bold tracking-tight mb-4"
            style={{
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontSize: 'clamp(28px, 3.2vw, 40px)',
              color: 'var(--cx-text)',
              lineHeight: 1.15,
            }}
          >
            Made for everyday paperwork
          </h2>
        </div>

        {/* 4 Cards Grid */}
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 list-none p-0 m-0">
          {cases.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id} className="flex">
                <div
                  className="cx-usecase-card flex flex-col justify-between w-full p-6 sm:p-8"
                  style={{
                    backgroundColor: 'var(--cx-surface)',
                    border: '1px solid var(--cx-line)',
                    borderRadius: 'var(--cx-radius-l)',
                    transition: 'transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease',
                  }}
                >
                  <div>
                    <div className="flex items-center gap-3.5 mb-4">
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
                      <h3
                        className="font-bold text-lg sm:text-xl"
                        style={{ color: 'var(--cx-text)' }}
                      >
                        {item.title}
                      </h3>
                    </div>

                    <p
                      className="text-sm sm:text-base leading-relaxed mb-6"
                      style={{ color: 'var(--cx-muted)' }}
                    >
                      {item.desc}
                    </p>
                  </div>

                  <div
                    className="pt-4 flex flex-wrap gap-2.5 items-center"
                    style={{ borderTop: '1px solid var(--cx-line)' }}
                  >
                    {item.tools.map((t) => (
                      <Link
                        key={t.href}
                        href={t.href}
                        className="cx-usecase-chip inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all"
                        style={{
                          backgroundColor: 'var(--cx-surface-2)',
                          color: 'var(--cx-text)',
                          border: '1px solid var(--cx-line)',
                          minHeight: '44px',
                        }}
                      >
                        <span>{t.name}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                      </Link>
                    ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <style jsx>{`
        .cx-usecase-card:hover {
          transform: translateY(-2px);
          border-color: var(--cx-accent) !important;
          box-shadow: 0 10px 24px -10px rgba(124, 58, 237, 0.2);
        }
        .cx-usecase-chip:hover {
          border-color: var(--cx-accent) !important;
          color: var(--cx-accent-text) !important;
        }
        .cx-usecase-chip:focus-visible {
          outline: 2px solid var(--cx-accent);
          outline-offset: 2px;
        }
      `}</style>
    </section>
  );
}
