'use client';

import React, { useState } from 'react';
import { ShieldCheck, Check, Key } from 'lucide-react';

export default function PasswordComparisonVisual() {
  const [permissions, setPermissions] = useState({
    copy: true,
    print: true,
    edit: true,
  });

  const togglePermission = (key: keyof typeof permissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allowedCount = Object.values(permissions).filter(Boolean).length;

  return (
    <div className="my-8 not-prose w-full">
      {/* UNIFIED MASTER FRAME */}
      <div className="relative rounded-3xl bg-zinc-900/90 dark:bg-zinc-950/90 text-white border border-zinc-700/60 dark:border-zinc-800/80 p-5 sm:p-7 shadow-2xl overflow-hidden backdrop-blur-xl">
        
        {/* Ambient Backlight Glows */}
        <div className="absolute -top-10 left-1/4 w-60 h-60 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-1/4 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Unified Header Bar */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800/80 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-zinc-300">
              PDF Security Architecture Visualized
            </span>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 border border-zinc-700/60 font-mono hidden sm:inline-block">
            ISO 32000 Standard
          </span>
        </div>

        {/* MAIN DUAL-COLUMN CONTENT (INSIDE SINGLE FRAME) */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800/80 gap-6 md:gap-0 items-stretch relative z-10">
          
          {/* LEFT: OPEN PASSWORD (WITH INSERTED KEY) */}
          <div className="md:pr-8 flex flex-col justify-between py-2 group">
            {/* Visual Lock + Inserted Key */}
            <div className="flex items-center justify-center py-5 relative min-h-[140px]">
              <svg
                className="w-48 sm:w-52 h-28 filter drop-shadow-[0_0_20px_rgba(244,63,94,0.35)] transition-transform duration-300 group-hover:scale-105"
                viewBox="0 0 180 100"
                fill="none"
              >
                {/* Lock Shackle */}
                <path
                  d="M42 45V28C42 16.954 50.954 8 62 8C73.046 8 82 16.954 82 28V45"
                  stroke="url(#shackleGrad)"
                  strokeWidth="8.5"
                  strokeLinecap="round"
                />
                
                {/* Lock Body */}
                <rect
                  x="30"
                  y="42"
                  width="64"
                  height="48"
                  rx="12"
                  fill="url(#bodyGrad)"
                  stroke="url(#roseBorderGrad)"
                  strokeWidth="2.5"
                />
                
                {/* Keyhole Core */}
                <circle cx="56" cy="62" r="5" fill="#09090b" />
                <path d="M54 64L52 76H60L58 64" fill="#09090b" />

                {/* Metallic Inserted Key (Horizontal into Keyhole) */}
                <g id="insertedKey" className="transition-transform duration-300 group-hover:translate-x-1">
                  {/* Key Blade going into Keyhole */}
                  <rect
                    x="56"
                    y="58"
                    width="54"
                    height="7.5"
                    rx="2"
                    fill="url(#keyGrad)"
                    stroke="#78350f"
                    strokeWidth="0.8"
                  />
                  {/* Key Teeth */}
                  <rect x="62" y="65.5" width="5" height="7" rx="1" fill="url(#keyGrad)" stroke="#78350f" strokeWidth="0.7" />
                  <rect x="71" y="65.5" width="4.5" height="5" rx="1" fill="url(#keyGrad)" stroke="#78350f" strokeWidth="0.7" />
                  <rect x="79" y="65.5" width="5" height="8" rx="1" fill="url(#keyGrad)" stroke="#78350f" strokeWidth="0.7" />
                  {/* Shaft Collar */}
                  <rect x="106" y="56" width="6" height="11.5" rx="2" fill="url(#keyRingGrad)" stroke="#92400e" strokeWidth="0.8" />
                  {/* Key Bow / Handle */}
                  <ellipse cx="128" cy="62" rx="16" ry="14" fill="url(#keyRingGrad)" stroke="url(#keyHighlightGrad)" strokeWidth="2" />
                  {/* Inner Key Hole in Bow */}
                  <ellipse cx="128" cy="62" rx="8" ry="7" fill="#18181b" stroke="#78350f" strokeWidth="1" />
                </g>

                <defs>
                  <linearGradient id="shackleGrad" x1="42" y1="8" x2="82" y2="45" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ffffff" />
                    <stop offset="0.4" stopColor="#cbd5e1" />
                    <stop offset="1" stopColor="#475569" />
                  </linearGradient>
                  <linearGradient id="bodyGrad" x1="30" y1="42" x2="94" y2="90" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#27272a" />
                    <stop offset="0.6" stopColor="#18181b" />
                    <stop offset="1" stopColor="#09090b" />
                  </linearGradient>
                  <linearGradient id="roseBorderGrad" x1="30" y1="42" x2="94" y2="90" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#fda4af" />
                    <stop offset="1" stopColor="#be123c" />
                  </linearGradient>
                  <linearGradient id="keyGrad" x1="56" y1="58" x2="110" y2="65" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#fef08a" />
                    <stop offset="0.5" stopColor="#d97706" />
                    <stop offset="1" stopColor="#b45309" />
                  </linearGradient>
                  <linearGradient id="keyRingGrad" x1="110" y1="48" x2="144" y2="76" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#fef3c7" />
                    <stop offset="0.4" stopColor="#f59e0b" />
                    <stop offset="0.8" stopColor="#b45309" />
                    <stop offset="1" stopColor="#78350f" />
                  </linearGradient>
                  <linearGradient id="keyHighlightGrad" x1="112" y1="48" x2="144" y2="76" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ffffff" />
                    <stop offset="0.7" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Typography & Badge */}
            <div className="text-center mt-2">
              <div className="inline-flex items-center gap-2 mb-1.5">
                <h3 className="text-xl font-bold text-white tracking-tight">Open Password</h3>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.7)]">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
                Strong encryption that blocks opening.
              </p>
            </div>

            {/* Bottom Tag */}
            <div className="mt-4 pt-3 flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <span className="text-zinc-400 font-medium">Protection Mechanism:</span>
              <span className="font-bold text-rose-400">Strict AES-256 Lock</span>
            </div>
          </div>

          {/* RIGHT: PERMISSION PASSWORD (WITH UNLOCKED SHACKLE & TOGGLES) */}
          <div className="md:pl-8 flex flex-col justify-between py-2 pt-6 md:pt-2 group">
            {/* Visual Open Lock + Checkboxes beside it */}
            <div className="flex items-center justify-center gap-6 py-5 relative min-h-[140px]">
              
              {/* Open Padlock SVG */}
              <div className="w-24 h-24 relative flex items-center justify-center">
                <svg
                  className="w-20 h-20 filter drop-shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-transform duration-300 group-hover:scale-105"
                  viewBox="0 0 96 96"
                  fill="none"
                >
                  {/* Swung Open Shackle */}
                  <path
                    d="M30 42V24C30 14 38 6 49 6C60 6 68 14 68 24V32"
                    stroke="url(#openShackleGrad)"
                    strokeWidth="8.5"
                    strokeLinecap="round"
                  />
                  {/* Body */}
                  <rect
                    x="22"
                    y="40"
                    width="56"
                    height="46"
                    rx="12"
                    fill="url(#amberBodyGrad)"
                    stroke="url(#amberBorderGrad)"
                    strokeWidth="2.5"
                  />
                  {/* Keyhole */}
                  <circle cx="50" cy="59" r="5" fill="#09090b" />
                  <path d="M48 61L46 73H54L52 61" fill="#09090b" />

                  <defs>
                    <linearGradient id="openShackleGrad" x1="30" y1="6" x2="68" y2="40" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ffffff" />
                      <stop offset="0.4" stopColor="#fde68a" />
                      <stop offset="1" stopColor="#b45309" />
                    </linearGradient>
                    <linearGradient id="amberBodyGrad" x1="22" y1="40" x2="78" y2="86" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#27272a" />
                      <stop offset="0.6" stopColor="#18181b" />
                      <stop offset="1" stopColor="#09090b" />
                    </linearGradient>
                    <linearGradient id="amberBorderGrad" x1="22" y1="40" x2="78" y2="86" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#fde68a" />
                      <stop offset="1" stopColor="#d97706" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Interactive Permissions Checkboxes */}
              <div className="flex flex-col gap-2 min-w-[110px]">
                {(['copy', 'print', 'edit'] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => togglePermission(key)}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all text-left cursor-pointer ${
                      permissions[key]
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                        : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-500 hover:border-zinc-600'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center border text-xs font-bold transition-colors ${
                        permissions[key]
                          ? 'bg-amber-500 border-amber-400 text-zinc-950'
                          : 'border-zinc-600 bg-zinc-800'
                      }`}
                    >
                      {permissions[key] && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                    <span className="text-xs font-bold capitalize">{key}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Typography & Badge */}
            <div className="text-center mt-2">
              <div className="inline-flex items-center gap-2 mb-1.5">
                <h3 className="text-xl font-bold text-white tracking-tight">Permission Password</h3>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.7)]">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
                Soft restrictions.
              </p>
            </div>

            {/* Bottom Tag */}
            <div className="mt-4 pt-3 flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-zinc-400 font-medium">Status:</span>
              <span className="font-bold text-amber-400">{allowedCount} of 3 Allowed</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
