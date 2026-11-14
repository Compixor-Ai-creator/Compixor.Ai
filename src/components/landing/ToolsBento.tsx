'use client';

import React from 'react';
import Link from 'next/link';
import { tools, type ToolItem } from '@/data/tools';
import { ArrowRight } from 'lucide-react';

export default function ToolsBento() {
  // Sort tools into layout:
  // 2 BIG: pdf-compressor, passport-photo
  // 2 WIDE: pdf-to-word, first client tool that is not pdf-compressor (pdf-organizer)
  // 8 SMALL: remaining 8 tools
  const bigIds = ['pdf-compressor', 'passport-photo'];
  const wideIds = ['pdf-to-word', 'pdf-organizer'];

  const bigTools = bigIds.map(id => tools.find(t => t.id === id)).filter(Boolean) as ToolItem[];
  const wideTools = wideIds.map(id => tools.find(t => t.id === id)).filter(Boolean) as ToolItem[];
  const smallTools = tools.filter(t => !bigIds.includes(t.id) && !wideIds.includes(t.id));

  // Ordered list for layout rendering:
  // Featured (big + wide) first, then small
  const allOrderedTools = [...bigTools, ...wideTools, ...smallTools];

  return (
    <section
      id="tools-bento-section"
      aria-labelledby="tools-bento-heading"
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
            12 TOOLS
          </div>
          <h2
            id="tools-bento-heading"
            className="font-bold tracking-tight mb-4"
            style={{
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontSize: 'clamp(28px, 3.2vw, 40px)',
              color: 'var(--cx-text)',
              lineHeight: 1.15,
            }}
          >
            Every PDF and photo tool, in one tab
          </h2>
          <p
            className="text-base sm:text-lg leading-relaxed"
            style={{
              color: 'var(--cx-muted)',
              maxWidth: '680px',
              margin: '0 auto',
            }}
          >
            Compress, convert and edit documents and photos in your browser. 9 of our 12 tools run locally on your device; 3 use secure server processing.
          </p>
        </div>

        {/* Bento Grid */}
        <ul
          className="cx-bento-grid"
          style={{
            display: 'grid',
            gridAutoFlow: 'dense',
            gap: '16px',
            listStyle: 'none',
            margin: 0,
            padding: 0,
          }}
        >
          {allOrderedTools.map((tool) => {
            const isBig = bigIds.includes(tool.id);
            const isWide = wideIds.includes(tool.id);
            const isServer = tool.processing === 'server';
            const Icon = tool.icon;

            return (
              <li
                key={tool.id}
                className={`cx-bento-item ${isBig ? 'cx-bento--big' : isWide ? 'cx-bento--wide' : 'cx-bento--small'}`}
              >
                <Link
                  href={tool.href}
                  className="cx-bento-card group"
                  aria-label={`${tool.name}: ${tool.description}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: 'var(--cx-surface-2)',
                        color: 'var(--cx-accent-text)',
                        border: '1px solid var(--cx-line)',
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className="cx-mono text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase"
                      style={{
                        fontFamily: 'var(--cx-font-mono)',
                        letterSpacing: '0.06em',
                        backgroundColor: isServer ? 'rgba(239, 68, 68, 0.08)' : 'rgba(34, 197, 94, 0.08)',
                        color: isServer ? '#ef4444' : '#22c55e',
                        border: isServer ? '1px solid rgba(239, 68, 68, 0.20)' : '1px solid rgba(34, 197, 94, 0.20)',
                      }}
                    >
                      {isServer ? 'Secure server processing' : 'On-device'}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3
                        className="font-bold text-base sm:text-lg mb-1.5 transition-colors group-hover:text-[var(--cx-accent)]"
                        style={{ color: 'var(--cx-text)' }}
                      >
                        {tool.name}
                      </h3>
                      <p
                        className="text-sm leading-relaxed line-clamp-2"
                        style={{ color: 'var(--cx-muted)' }}
                      >
                        {tool.description}
                      </p>
                    </div>

                    {isBig && (
                      <div
                        className="mt-4 pt-3 flex items-center gap-1.5 text-xs font-semibold"
                        style={{
                          color: 'var(--cx-accent-text)',
                          borderTop: '1px solid var(--cx-line)',
                        }}
                      >
                        <span>Open tool</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <style jsx>{`
        .cx-bento-grid {
          grid-template-columns: repeat(4, 1fr);
        }
        .cx-bento--big {
          grid-column: span 2;
          grid-row: span 2;
        }
        .cx-bento--wide {
          grid-column: span 2;
          grid-row: span 1;
        }
        .cx-bento--small {
          grid-column: span 1;
          grid-row: span 1;
        }
        .cx-bento-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 168px;
          padding: 20px;
          border-radius: var(--cx-radius-l);
          background-color: var(--cx-surface);
          border: 1px solid var(--cx-line);
          text-decoration: none;
          transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
        }
        .cx-bento-card:hover {
          transform: translateY(-2px);
          border-color: var(--cx-accent);
          box-shadow: 0 10px 24px -10px rgba(124, 58, 237, 0.2);
        }
        .cx-bento-card:focus-visible {
          outline: 2px solid var(--cx-accent);
          outline-offset: 2px;
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .cx-bento-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .cx-bento--big {
            grid-column: span 2 !important;
            grid-row: span 2 !important;
          }
          .cx-bento--wide {
            grid-column: span 2 !important;
            grid-row: span 1 !important;
          }
          .cx-bento--small {
            grid-column: span 1 !important;
            grid-row: span 1 !important;
          }
        }
        @media (max-width: 639px) {
          .cx-bento-grid {
            grid-template-columns: 1fr !important;
          }
          .cx-bento--big,
          .cx-bento--wide,
          .cx-bento--small {
            grid-column: span 1 !important;
            grid-row: span 1 !important;
          }
        }
      `}</style>
    </section>
  );
}
