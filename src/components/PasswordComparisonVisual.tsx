'use client';

import React, { useState } from 'react';
import { ShieldCheck, Check, Key, Lock, Unlock } from 'lucide-react';

export default function PasswordComparisonVisual() {
  const [permissions, setPermissions] = useState({
    copy: true,
    print: true,
    edit: false,
  });

  const togglePermission = (key: keyof typeof permissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allowedCount = Object.values(permissions).filter(Boolean).length;

  return (
    <div className="my-8 not-prose w-full">
      {/* UNIFIED MASTER FRAME */}
      <div className="relative rounded-2xl bg-zinc-900 text-white border border-zinc-800 p-5 sm:p-7 shadow-xl overflow-hidden">
        {/* Top Unified Header Bar */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-800 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span className="text-xs font-bold tracking-wider uppercase text-zinc-300">
              PDF Security Architecture Visualized
            </span>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 font-mono hidden sm:inline-block">
            ISO 32000 Standard
          </span>
        </div>

        {/* MAIN DUAL-COLUMN CONTENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800 gap-6 md:gap-0 items-stretch relative z-10">
          {/* LEFT: OPEN PASSWORD (REAL OS-STYLE PASSWORD DIALOG) */}
          <div className="md:pr-8 flex flex-col justify-between py-2">
            <div>
              {/* Clean OS Dialog Mockup */}
              <div className="rounded-xl border border-zinc-700/80 bg-zinc-950/80 p-4 shadow-md max-w-sm mx-auto mb-4">
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">Security Prompt</span>
                </div>

                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Lock className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-200">Password Required</p>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      Enter the document open password to decrypt this PDF.
                    </p>
                  </div>
                </div>

                {/* Password Input Field with Button */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 font-mono text-xs">
                    <span className="text-zinc-500">Key:</span>
                    <span className="tracking-widest text-zinc-200">••••••••••••</span>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <span className="px-3 py-1 rounded-md bg-zinc-800 text-zinc-400 text-[11px] font-medium border border-zinc-700">
                      Cancel
                    </span>
                    <span className="px-3 py-1 rounded-md bg-purple-600 text-white text-[11px] font-semibold">
                      Unlock PDF
                    </span>
                  </div>
                </div>
              </div>

              {/* Typography & Badge */}
              <div className="text-center mt-2">
                <div className="inline-flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-white tracking-tight">Open Password</h3>
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-purple-500 text-white">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
                  Blocks unauthorized opening. AES-256 encrypted bytes require this key to render in memory.
                </p>
              </div>
            </div>

            {/* Bottom Tag */}
            <div className="mt-4 pt-3 flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-zinc-800/60 border border-zinc-700/60">
              <span className="text-zinc-400 font-medium">Protection Scope:</span>
              <span className="font-semibold text-purple-400">Total File Decryption</span>
            </div>
          </div>

          {/* RIGHT: PERMISSION PASSWORD (REAL OS-STYLE PERMISSIONS CONTROL) */}
          <div className="md:pl-8 flex flex-col justify-between py-2 pt-6 md:pt-2">
            <div>
              {/* Clean OS Permissions Dialog Mockup */}
              <div className="rounded-xl border border-zinc-700/80 bg-zinc-950/80 p-4 shadow-md max-w-sm mx-auto mb-4">
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">Owner Permissions</span>
                </div>

                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Key className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-200">Feature Restrictions</p>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      Toggle actions permitted without owner authentication.
                    </p>
                  </div>
                </div>

                {/* Interactive Permissions Toggles */}
                <div className="space-y-1.5">
                  {(['copy', 'print', 'edit'] as const).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => togglePermission(key)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                        permissions[key]
                          ? 'bg-zinc-900 border-purple-500/40 text-zinc-200'
                          : 'bg-zinc-900/40 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      <span className="capitalize font-medium">Allow {key} content</span>
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${
                          permissions[key]
                            ? 'bg-purple-600 text-white'
                            : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                        }`}
                      >
                        {permissions[key] ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Typography & Badge */}
              <div className="text-center mt-2">
                <div className="inline-flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-white tracking-tight">Permissions Password</h3>
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-purple-500 text-white">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
                  Allows viewing while restricting copying, editing, or printing until unlocked with owner key.
                </p>
              </div>
            </div>

            {/* Bottom Tag */}
            <div className="mt-4 pt-3 flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-zinc-800/60 border border-zinc-700/60">
              <span className="text-zinc-400 font-medium">Status:</span>
              <span className="font-semibold text-purple-400">{allowedCount} of 3 Allowed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
