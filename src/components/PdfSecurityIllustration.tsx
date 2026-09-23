'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, ShieldCheck, Check, ArrowRight, ShieldAlert, Cpu, HardDrive } from 'lucide-react';

interface PdfSecurityIllustrationProps {
  mode?: 'protect' | 'unlock';
}

export default function PdfSecurityIllustration({ mode = 'protect' }: PdfSecurityIllustrationProps) {
  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800/80 shadow-lg relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Central Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>100% Client-Side In-Browser Processing</span>
          </div>
        </div>

        {/* Transformation Flow Diagram */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 my-4">
          
          {/* State 1: Locked / Encrypted */}
          <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-red-500/5 dark:bg-red-950/20 border border-red-500/20 w-44">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25 mb-3 text-white">
              <Lock className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold text-red-600 dark:text-red-400">
              {mode === 'protect' ? 'Plain Open File' : 'Locked / Restricted'}
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              {mode === 'protect' ? 'Vulnerable to tampering' : 'Encrypted with password'}
            </span>
          </div>

          {/* Transformation Arrow with Local Engine Tag */}
          <div className="flex flex-col items-center gap-1.5 my-2 sm:my-0">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
              <Cpu className="w-3 h-3 text-indigo-500" />
              <span>WebAssembly Engine</span>
            </div>
            <div className="flex items-center text-zinc-400 dark:text-zinc-500">
              <span className="h-0.5 w-6 bg-gradient-to-r from-red-400 via-indigo-400 to-emerald-400 hidden sm:block" />
              <ArrowRight className="w-5 h-5 text-indigo-500" />
              <span className="h-0.5 w-6 bg-gradient-to-r from-indigo-400 to-emerald-400 hidden sm:block" />
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Instant Local Decrypt/Lock
            </span>
          </div>

          {/* State 2: Unlocked / Secure */}
          <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 w-44">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-3 text-white relative">
              <Unlock className="w-7 h-7" />
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 text-zinc-950 flex items-center justify-center shadow">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {mode === 'protect' ? 'AES-256 Protected' : 'Decrypted & Unlocked'}
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              {mode === 'protect' ? 'ISO Standard Security' : '100% Full Permissions'}
            </span>
          </div>
        </div>

        {/* Security Specs Row */}
        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Zero Server Uploads</p>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Bytes stay in your device RAM</p>
          </div>
          <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">AES-256 Bit Cipher</p>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Military-grade ISO encryption</p>
          </div>
          <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">No Data Logs</p>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Memory auto-cleared on close</p>
          </div>
        </div>
      </div>
    </div>
  );
}
