import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function ClientSideTrustSection() {
  return (
    <section className="mt-16 p-6 sm:p-8 rounded-3xl glass-card border border-brand-500/20 bg-gradient-to-br from-brand-500/[0.03] via-transparent to-emerald-500/[0.03]">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 justify-between">
        <div className="flex-1 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Zero Cloud Uploads • 100% Private
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-display text-zinc-900 dark:text-white">
            Why 100% Client-Side Actually Matters
          </h2>

          <div className="space-y-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
            <p>
              Most online file tools — including well-known names like Adobe and Smallpdf — upload your file to a remote server, process it there, and send back the result. Your document sits on someone else&apos;s infrastructure, even if briefly, and even if it&apos;s later deleted.
            </p>
            <p>
              Compixor works differently: every tool runs entirely inside your browser using WebAssembly and client-side JavaScript. Your files, photos, and data are never uploaded, transmitted, or stored anywhere — they exist only in your device&apos;s memory while you&apos;re using the tool.
            </p>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Zero server uploads — ever</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>No account or signup required</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>No file size limits imposed by upload restrictions</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Works even with sensitive documents (contracts, IDs, WiFi passwords)</span>
            </li>
            <li className="flex items-center gap-2 sm:col-span-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Faster — no upload/download round trip</span>
            </li>
          </ul>
        </div>

        {/* Minimalist illustration matching:
            "Simple flat icon of a browser window with a shield and lock symbol inside,
            and a crossed-out cloud/server icon next to it representing 'no server upload' —
            minimalist line art style, blue and green accent colors, no text in the icon itself" */}
        <div className="shrink-0 w-full lg:w-72 flex items-center justify-center p-6 rounded-2xl bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
          <svg
            className="w-48 h-40 text-brand-500"
            viewBox="0 0 200 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Browser local processing with zero server uploads icon"
            role="img"
          >
            {/* Browser window */}
            <rect x="15" y="20" width="110" height="95" rx="8" className="stroke-brand-500/80 dark:stroke-brand-400" strokeWidth="2.5" fill="none" />
            <line x1="15" y1="38" x2="125" y2="38" className="stroke-brand-500/50 dark:stroke-brand-400/50" strokeWidth="2" />
            <circle cx="27" cy="29" r="2.5" className="fill-brand-400" />
            <circle cx="36" cy="29" r="2.5" className="fill-brand-300" />
            <circle cx="45" cy="29" r="2.5" className="fill-brand-200" />

            {/* Shield with lock inside browser */}
            <path
              d="M70 52 C70 52 82 48 88 46 C94 48 106 52 106 52 C106 72 96 85 88 92 C80 85 70 72 70 52 Z"
              className="fill-emerald-500/15 stroke-emerald-500 dark:stroke-emerald-400"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            {/* Lock inside shield */}
            <rect x="83" y="66" width="10" height="8" rx="1.5" className="fill-emerald-600 dark:fill-emerald-400" />
            <path d="M85 66 V62 C85 60.3 86.3 59 88 59 C89.7 59 91 60.3 91 62 V66" className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="1.6" strokeLinecap="round" />

            {/* Local chip / memory rays */}
            <line x1="32" y1="56" x2="52" y2="56" className="stroke-brand-400/60" strokeWidth="2" strokeLinecap="round" />
            <line x1="32" y1="68" x2="58" y2="68" className="stroke-brand-400/60" strokeWidth="2" strokeLinecap="round" />
            <line x1="32" y1="80" x2="48" y2="80" className="stroke-brand-400/60" strokeWidth="2" strokeLinecap="round" />

            {/* Cloud with strike-through (Crossed-out cloud/server) */}
            <g transform="translate(115, 60)">
              {/* Cloud outline */}
              <path
                d="M48 42 H18 C12.5 42 8 37.5 8 32 C8 27.2 11.5 23.2 16.2 22.2 C17.8 14.5 24.6 9 32.5 9 C39.5 9 45.7 13.5 48 20 C53 20.5 57 24.8 57 30 C57 36.6 52.6 42 48 42 Z"
                className="stroke-zinc-400 dark:stroke-zinc-500 fill-zinc-100/50 dark:fill-zinc-800/50"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Server lines inside cloud */}
              <line x1="24" y1="26" x2="42" y2="26" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="24" y1="33" x2="38" y2="33" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1.8" strokeLinecap="round" />
              {/* Crossed-out red strike line */}
              <line x1="6" y1="8" x2="60" y2="46" className="stroke-red-500 dark:stroke-red-400" strokeWidth="3" strokeLinecap="round" />
            </g>

            {/* Checkmark badge */}
            <circle cx="40" cy="125" r="14" className="fill-emerald-500" />
            <path d="M34 125 L38 129 L46 120" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <text x="62" y="129" className="text-[11px] font-bold fill-zinc-700 dark:fill-zinc-200" style={{ fontVariant: 'all-small-caps' }}>
              100% In-Browser Memory
            </text>
          </svg>
        </div>
      </div>
    </section>
  );
}
