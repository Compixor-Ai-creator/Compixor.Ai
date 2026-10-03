'use client';

import React from 'react';
import { ToolSlug } from '@/lib/seo-config';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Upload,
  Sliders,
  Cpu,
  Download,
  FileText,
  Lock,
  Unlock,
  Shield,
  Eraser,
  Stamp,
  Layers,
  FileCheck,
  QrCode,
  Image as ImageIcon,
} from 'lucide-react';

interface ToolHowToVictoryProps {
  toolSlug: ToolSlug;
}

export default function ToolHowToVictory({ toolSlug }: ToolHowToVictoryProps) {
  switch (toolSlug) {
    case 'passport-photo':
      return (
        <VictoryCard
          badgeText="Biometric Transformation Preview"
          badgeColor="from-violet-500/15 to-indigo-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30"
          engineTitle="Local AI Face Detection & Matting"
          engineSub="300 DPI Embassy Standard · Zero Server Upload"
          beforeTitle="Raw Portrait Photo"
          beforeBadge="Uncalibrated"
          beforeBadgeColor="bg-amber-500 text-white"
          beforeContent={
            <div className="w-18 h-22 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 flex flex-col items-center justify-center p-2 relative shadow-xs">
              <div className="w-8 h-8 rounded-full bg-amber-200 dark:bg-amber-800/60 flex items-center justify-center text-amber-700 dark:text-amber-200 text-xs font-bold mb-1">
                👤
              </div>
              <div className="w-10 h-1 bg-amber-300 dark:bg-amber-700 rounded-full mb-1" />
              <div className="w-7 h-1 bg-amber-200 dark:bg-amber-800 rounded-full" />
              <span className="text-[7px] font-semibold text-amber-600 dark:text-amber-400 mt-1">Busy Background</span>
            </div>
          }
          afterTitle="Official 4x6 Printable Grid"
          afterBadge="300 DPI Compliant"
          afterBadgeColor="bg-emerald-500 text-white"
          afterContent={
            <div className="w-22 h-22 p-1.5 rounded-xl bg-white dark:bg-zinc-800 border-2 border-emerald-500/60 shadow-md grid grid-cols-2 gap-1 relative overflow-hidden">
              <div className="rounded bg-sky-50 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-700 flex flex-col items-center justify-center">
                <span className="text-[6.5px] font-black text-sky-700 dark:text-sky-300">35x45</span>
                <span className="text-[5.5px] text-sky-500">White</span>
              </div>
              <div className="rounded bg-sky-50 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-700 flex flex-col items-center justify-center">
                <span className="text-[6.5px] font-black text-sky-700 dark:text-sky-300">35x45</span>
                <span className="text-[5.5px] text-sky-500">White</span>
              </div>
              <div className="rounded bg-sky-50 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-700 flex flex-col items-center justify-center">
                <span className="text-[6.5px] font-black text-sky-700 dark:text-sky-300">35x45</span>
                <span className="text-[5.5px] text-sky-500">White</span>
              </div>
              <div className="rounded bg-sky-50 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-700 flex flex-col items-center justify-center">
                <span className="text-[6.5px] font-black text-sky-700 dark:text-sky-300">35x45</span>
                <span className="text-[5.5px] text-sky-500">White</span>
              </div>
            </div>
          }
        />
      );

    case 'pdf-compressor':
      return (
        <VictoryCard
          badgeText="Compression Transformation Preview"
          badgeColor="from-rose-500/15 to-orange-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
          engineTitle="Pako Flate & Stream Optimizer"
          engineSub="Vector Text Preserved · Re-encodes Raster Images"
          beforeTitle="Heavy Bulky PDF"
          beforeBadge="24.8 MB"
          beforeBadgeColor="bg-rose-500 text-white"
          beforeContent={
            <div className="w-18 h-22 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/60 flex flex-col items-center justify-between p-2 shadow-xs">
              <span className="text-[7.5px] font-black text-rose-600">PDF</span>
              <div className="w-full space-y-1">
                <div className="w-full h-1 bg-rose-300 dark:bg-rose-700 rounded" />
                <div className="w-4/5 h-1 bg-rose-300 dark:bg-rose-700 rounded" />
                <div className="w-3/5 h-1 bg-rose-300 dark:bg-rose-700 rounded" />
              </div>
              <span className="text-[7px] font-bold text-rose-600 dark:text-rose-400">Large Size</span>
            </div>
          }
          afterTitle="Optimized PDF"
          afterBadge="1.9 MB (-92%)"
          afterBadgeColor="bg-emerald-500 text-white"
          afterContent={
            <div className="w-18 h-22 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border-2 border-emerald-500 flex flex-col items-center justify-between p-2 shadow-md relative">
              <span className="text-[7.5px] font-black text-emerald-600">PDF</span>
              <div className="w-full space-y-1">
                <div className="w-full h-1 bg-emerald-400 rounded" />
                <div className="w-4/5 h-1 bg-emerald-400 rounded" />
                <div className="w-3/5 h-1 bg-emerald-400 rounded" />
              </div>
              <span className="text-[7px] font-black text-emerald-600 uppercase tracking-wider">Crisp Vector</span>
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-black shadow-xs">✓</div>
            </div>
          }
        />
      );

    case 'pdf-to-word':
      return (
        <VictoryCard
          badgeText="Conversion Transformation Preview"
          badgeColor="from-blue-500/15 to-indigo-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30"
          engineTitle="Dual Engine OCR & OpenXML Synthesizer"
          engineSub="Preserves Headings, Tables & Selectable Text"
          beforeTitle="Static Read-Only PDF"
          beforeBadge="Locked Text"
          beforeBadgeColor="bg-red-500 text-white"
          beforeContent={
            <div className="w-18 h-22 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800/60 flex flex-col items-center justify-between p-2 shadow-xs">
              <span className="text-[8px] font-black text-red-600">PDF</span>
              <div className="w-full space-y-1">
                <div className="w-full h-1 bg-red-300 dark:bg-red-700 rounded" />
                <div className="w-4/5 h-1 bg-red-300 dark:bg-red-700 rounded" />
                <div className="w-3/5 h-1 bg-red-300 dark:bg-red-700 rounded" />
              </div>
              <span className="text-[6.5px] font-semibold text-red-500">Non-Editable</span>
            </div>
          }
          afterTitle="Editable Word Document"
          afterBadge="100% DOCX"
          afterBadgeColor="bg-blue-600 text-white"
          afterContent={
            <div className="w-18 h-22 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border-2 border-blue-500 flex flex-col items-center justify-between p-2 shadow-md relative">
              <span className="text-[8px] font-black text-blue-600">DOCX</span>
              <div className="w-full space-y-1">
                <div className="w-full h-1 bg-blue-400 rounded flex items-center justify-end"><span className="w-0.5 h-1.5 bg-blue-600 animate-pulse mr-0.5" /></div>
                <div className="w-4/5 h-1 bg-blue-300 dark:bg-blue-600 rounded" />
                <div className="w-3/5 h-1 bg-blue-300 dark:bg-blue-600 rounded" />
              </div>
              <span className="text-[6.5px] font-bold text-blue-600 uppercase">Live Cursor</span>
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] font-black shadow-xs">✓</div>
            </div>
          }
        />
      );

    case 'add-watermark':
      return (
        <VictoryCard
          badgeText="Watermarking Transformation Preview"
          badgeColor="from-rose-500/15 to-pink-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
          engineTitle="Vector Layer & Content Stream Injection"
          engineSub="Custom Opacity, Rotation & Font Styling"
          beforeTitle="Unbranded PDF"
          beforeBadge="Plain"
          beforeBadgeColor="bg-zinc-500 text-white"
          beforeContent={
            <div className="w-18 h-22 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-between p-2 shadow-xs">
              <span className="text-[7.5px] font-bold text-zinc-500">PDF</span>
              <div className="w-full space-y-1">
                <div className="w-full h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
                <div className="w-4/5 h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
                <div className="w-3/5 h-0.5 bg-zinc-300 dark:bg-zinc-600 rounded" />
              </div>
              <span className="text-[6.5px] text-zinc-400">Unprotected</span>
            </div>
          }
          afterTitle="100% Branded PDF"
          afterBadge="Stamped"
          afterBadgeColor="bg-rose-500 text-white"
          afterContent={
            <div className="w-18 h-22 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40 border-2 border-rose-500 flex flex-col items-center justify-between p-2 shadow-md relative overflow-hidden">
              <span className="text-[7.5px] font-bold text-rose-600">PDF</span>
              <span className="text-[6px] font-black text-rose-600 -rotate-30 uppercase tracking-widest border border-rose-400 px-1 py-0.5 bg-white/70 dark:bg-zinc-900/70 rounded">
                CONFIDENTIAL
              </span>
              <span className="text-[6.5px] font-bold text-rose-600">Vector Protected</span>
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[8px] font-black shadow-xs">✓</div>
            </div>
          }
        />
      );

    case 'remove-watermark':
      return (
        <VictoryCard
          badgeText="Cleansing Transformation Preview"
          badgeColor="from-emerald-500/15 to-teal-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
          engineTitle="Dual Engine Stream Cleanser & Box Eraser"
          engineSub="Removes Overlays & Stamped Background Artifacts"
          beforeTitle="Watermarked Document"
          beforeBadge="Obscured"
          beforeBadgeColor="bg-amber-500 text-white"
          beforeContent={
            <div className="w-18 h-22 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 flex flex-col items-center justify-between p-2 shadow-xs relative overflow-hidden">
              <span className="text-[7.5px] font-bold text-zinc-500">PDF</span>
              <span className="text-[6px] font-black text-amber-600 -rotate-30 uppercase tracking-widest border border-amber-400 px-1 py-0.5 bg-white/60 dark:bg-zinc-900/60 rounded">
                SAMPLE STAMP
              </span>
              <span className="text-[6.5px] text-amber-700 dark:text-amber-400">Blocked Text</span>
            </div>
          }
          afterTitle="Cleaned Pristine PDF"
          afterBadge="100% Erased"
          afterBadgeColor="bg-emerald-500 text-white"
          afterContent={
            <div className="w-18 h-22 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border-2 border-emerald-500 flex flex-col items-center justify-between p-2 shadow-md relative">
              <span className="text-[7.5px] font-black text-emerald-600">PDF</span>
              <div className="w-full space-y-1">
                <div className="w-full h-1 bg-emerald-400 rounded" />
                <div className="w-4/5 h-1 bg-emerald-400 rounded" />
                <div className="w-3/5 h-1 bg-emerald-400 rounded" />
              </div>
              <span className="text-[6.5px] font-bold text-emerald-600 uppercase">Original Text Intact</span>
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-black shadow-xs">✓</div>
            </div>
          }
        />
      );

    case 'pdf-organizer':
      return (
        <VictoryCard
          badgeText="Organization Transformation Preview"
          badgeColor="from-indigo-500/15 to-blue-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30"
          engineTitle="Drag & Drop Visual Sequencer"
          engineSub="Merge Multiple Files · Split Pages · Rotate Layouts"
          beforeTitle="Scattered PDF Documents"
          beforeBadge="Separate Files"
          beforeBadgeColor="bg-amber-500 text-white"
          beforeContent={
            <div className="w-20 h-22 flex items-center justify-center relative">
              <div className="w-10 h-14 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 -rotate-12 absolute left-1 shadow-xs flex items-center justify-center text-[7px] font-bold text-zinc-500">Doc A</div>
              <div className="w-10 h-14 rounded-lg bg-zinc-200 dark:bg-zinc-700 border border-zinc-400 dark:border-zinc-600 rotate-6 absolute right-1 shadow-xs flex items-center justify-center text-[7px] font-bold text-zinc-600">Doc B</div>
              <div className="w-10 h-14 rounded-lg bg-white dark:bg-zinc-800 border border-brand-500 z-10 shadow-sm flex items-center justify-center text-[7px] font-bold text-brand-600">Doc C</div>
            </div>
          }
          afterTitle="Unified Merged PDF"
          afterBadge="1 Bound PDF"
          afterBadgeColor="bg-indigo-600 text-white"
          afterContent={
            <div className="w-18 h-22 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 border-2 border-indigo-500 flex flex-col items-center justify-between p-2 shadow-md relative">
              <span className="text-[7.5px] font-black text-indigo-600">MERGED PDF</span>
              <div className="flex gap-0.5">
                <span className="w-2.5 h-3 rounded-xs bg-indigo-200 dark:bg-indigo-800 text-[5px] flex items-center justify-center font-bold">1</span>
                <span className="w-2.5 h-3 rounded-xs bg-indigo-300 dark:bg-indigo-700 text-[5px] flex items-center justify-center font-bold">2</span>
                <span className="w-2.5 h-3 rounded-xs bg-indigo-400 dark:bg-indigo-600 text-[5px] flex items-center justify-center font-bold text-white">3</span>
              </div>
              <span className="text-[6.5px] font-bold text-indigo-600">Perfect Order</span>
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[8px] font-black shadow-xs">✓</div>
            </div>
          }
        />
      );

    case 'protect-pdf':
      return (
        <VictoryCard
          badgeText="Security Transformation Preview"
          badgeColor="from-indigo-500/15 to-purple-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30"
          engineTitle="AES-256 Military Cryptography Engine"
          engineSub="Configurable User & Owner Permission Restrictions"
          beforeTitle="Unencrypted Open PDF"
          beforeBadge="Public Access"
          beforeBadgeColor="bg-amber-500 text-white"
          beforeContent={
            <div className="w-18 h-22 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 flex flex-col items-center justify-between p-2 shadow-xs">
              <span className="text-[7.5px] font-bold text-amber-600">PDF</span>
              <Unlock className="w-6 h-6 text-amber-500" />
              <span className="text-[6.5px] font-semibold text-amber-600">Zero Password</span>
            </div>
          }
          afterTitle="Encrypted Shielded PDF"
          afterBadge="AES-256 Locked"
          afterBadgeColor="bg-indigo-600 text-white"
          afterContent={
            <div className="w-18 h-22 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border-2 border-indigo-500 flex flex-col items-center justify-between p-2 shadow-md relative">
              <span className="text-[7.5px] font-black text-indigo-600">PDF</span>
              <Lock className="w-6 h-6 text-indigo-600" />
              <span className="text-[6.5px] font-bold text-indigo-600">Password Guarded</span>
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[8px] font-black shadow-xs">✓</div>
            </div>
          }
        />
      );

    case 'unlock-pdf':
      return (
        <VictoryCard
          badgeText="Decryption Transformation Preview"
          badgeColor="from-emerald-500/15 to-teal-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
          engineTitle="In-Browser Permission Decryptor"
          engineSub="Clears Password Flags · Enables Printing & Editing"
          beforeTitle="Locked Restricted PDF"
          beforeBadge="Password Required"
          beforeBadgeColor="bg-rose-500 text-white"
          beforeContent={
            <div className="w-18 h-22 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/60 flex flex-col items-center justify-between p-2 shadow-xs">
              <span className="text-[7.5px] font-bold text-rose-600">PDF</span>
              <Lock className="w-6 h-6 text-rose-500" />
              <span className="text-[6.5px] font-semibold text-rose-600">Locked</span>
            </div>
          }
          afterTitle="Unlocked Accessible PDF"
          afterBadge="Permanently Open"
          afterBadgeColor="bg-emerald-500 text-white"
          afterContent={
            <div className="w-18 h-22 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border-2 border-emerald-500 flex flex-col items-center justify-between p-2 shadow-md relative">
              <span className="text-[7.5px] font-black text-emerald-600">PDF</span>
              <Unlock className="w-6 h-6 text-emerald-600" />
              <span className="text-[6.5px] font-bold text-emerald-600">Unrestricted</span>
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-black shadow-xs">✓</div>
            </div>
          }
        />
      );

    case 'word-compressor':
      return (
        <VictoryCard
          badgeText="DOCX Compression Preview"
          badgeColor="from-blue-500/15 to-cyan-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30"
          engineTitle="DOCX ZIP Stream Media Re-Encoder"
          engineSub="Compresses Heavy Images · Zero XML Distortion"
          beforeTitle="Bloated Word File"
          beforeBadge="38.2 MB"
          beforeBadgeColor="bg-rose-500 text-white"
          beforeContent={
            <div className="w-18 h-22 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/60 flex flex-col items-center justify-between p-2 shadow-xs">
              <span className="text-[8px] font-black text-rose-600">DOCX</span>
              <div className="w-full space-y-1">
                <div className="w-full h-1 bg-rose-300 dark:bg-rose-700 rounded" />
                <div className="w-4/5 h-1 bg-rose-300 dark:bg-rose-700 rounded" />
              </div>
              <span className="text-[6.5px] font-bold text-rose-600">Email Bounce</span>
            </div>
          }
          afterTitle="Email-Ready Word File"
          afterBadge="3.1 MB (-91%)"
          afterBadgeColor="bg-emerald-500 text-white"
          afterContent={
            <div className="w-18 h-22 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border-2 border-emerald-500 flex flex-col items-center justify-between p-2 shadow-md relative">
              <span className="text-[8px] font-black text-emerald-600">DOCX</span>
              <div className="w-full space-y-1">
                <div className="w-full h-1 bg-emerald-400 rounded" />
                <div className="w-4/5 h-1 bg-emerald-400 rounded" />
              </div>
              <span className="text-[6.5px] font-black text-emerald-600 uppercase">Fast Send</span>
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-black shadow-xs">✓</div>
            </div>
          }
        />
      );

    case 'full-dp-maker':
      return (
        <VictoryCard
          badgeText="Social DP Transformation Preview"
          badgeColor="from-purple-500/15 to-pink-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30"
          engineTitle="Smart HD Mirror Blur Canvas Engine"
          engineSub="Extends Margins into 1:1 Square · Zero Face Cropping"
          beforeTitle="Vertical 9:16 Photo"
          beforeBadge="Forced Crop"
          beforeBadgeColor="bg-amber-500 text-white"
          beforeContent={
            <div className="w-18 h-22 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 flex flex-col items-center justify-center p-2 shadow-xs relative">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-red-500 flex items-center justify-center">
                <span className="text-sm">👤</span>
              </div>
              <span className="text-[6px] font-bold text-red-500 mt-1">Cuts Off Head</span>
            </div>
          }
          afterTitle="1:1 Square No-Crop DP"
          afterBadge="100% Complete"
          afterBadgeColor="bg-purple-600 text-white"
          afterContent={
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-indigo-500/20 border-2 border-purple-500 flex items-center justify-center shadow-md relative backdrop-blur-sm">
              <div className="w-12 h-16 rounded-lg bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center border border-purple-400/40">
                <span className="text-xs">👤</span>
              </div>
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[8px] font-black shadow-xs">✓</div>
            </div>
          }
        />
      );

    case 'qr-generator':
      return (
        <VictoryCard
          badgeText="Vector QR Transformation Preview"
          badgeColor="from-teal-500/15 to-emerald-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30"
          engineTitle="Reed-Solomon Matrix & SVG Generator"
          engineSub="Permanent Static Codes · Logo Embedding"
          beforeTitle="Raw URL / Text Link"
          beforeBadge="Plain Text"
          beforeBadgeColor="bg-indigo-500 text-white"
          beforeContent={
            <div className="w-20 h-22 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex flex-col items-center justify-center p-2 shadow-xs">
              <span className="text-[6.5px] font-mono text-indigo-600 dark:text-indigo-400 break-all text-center leading-tight">
                https://compixor.ai/tool?id=83921
              </span>
              <span className="text-[6.5px] font-semibold text-zinc-400 mt-2">Unformatted</span>
            </div>
          }
          afterTitle="High-Res Vector QR Code"
          afterBadge="Scan Ready"
          afterBadgeColor="bg-emerald-500 text-white"
          afterContent={
            <div className="w-20 h-20 rounded-2xl bg-zinc-900 text-white border-2 border-emerald-500 p-2 flex flex-col items-center justify-center shadow-md relative">
              <div className="w-12 h-12 bg-white rounded-md p-1 grid grid-cols-3 gap-0.5">
                <div className="bg-black rounded-xs" /><div className="bg-black rounded-xs" /><div className="bg-black rounded-xs" />
                <div className="bg-black rounded-xs" /><div className="bg-brand-500 rounded-xs" /><div className="bg-black rounded-xs" />
                <div className="bg-black rounded-xs" /><div className="bg-black rounded-xs" /><div className="bg-black rounded-xs" />
              </div>
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-black shadow-xs">✓</div>
            </div>
          }
        />
      );

    case 'img-to-word':
      return (
        <VictoryCard
          badgeText="OCR Transformation Preview"
          badgeColor="from-violet-500/15 to-indigo-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30"
          engineTitle="Tesseract.js WebAssembly OCR"
          engineSub="Recognises Text, Headings & Lists · 10+ Languages"
          beforeTitle="Scanned / Photo Image"
          beforeBadge="Unextractable"
          beforeBadgeColor="bg-amber-500 text-white"
          beforeContent={
            <div className="w-18 h-22 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 flex flex-col items-center justify-between p-2 shadow-xs relative overflow-hidden">
              <span className="text-[7px] font-bold text-amber-600">IMG</span>
              <div className="w-12 h-10 rounded bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-[6px] font-semibold text-amber-600">Text Locked in Pixels</span>
            </div>
          }
          afterTitle="Editable Word Document"
          afterBadge="100% DOCX"
          afterBadgeColor="bg-violet-600 text-white"
          afterContent={
            <div className="w-18 h-22 rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/40 dark:to-indigo-950/40 border-2 border-violet-500 flex flex-col items-center justify-between p-2 shadow-md relative">
              <span className="text-[8px] font-black text-violet-600">DOCX</span>
              <div className="w-full space-y-1">
                <div className="w-full h-1 bg-violet-400 rounded flex items-center justify-end"><span className="w-0.5 h-1.5 bg-violet-600 animate-pulse mr-0.5" /></div>
                <div className="w-4/5 h-1 bg-indigo-300 dark:bg-indigo-600 rounded" />
                <div className="w-3/5 h-1 bg-violet-300 dark:bg-violet-700 rounded" />
              </div>
              <span className="text-[6.5px] font-bold text-violet-600 uppercase">Live Editable</span>
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center text-[8px] font-black shadow-xs">✓</div>
            </div>
          }
        />
      );

    default:
      return null;
  }
}

interface VictoryCardProps {
  badgeText: string;
  badgeColor: string;
  engineTitle: string;
  engineSub: string;
  beforeTitle: string;
  beforeBadge: string;
  beforeBadgeColor: string;
  beforeContent: React.ReactNode;
  afterTitle: string;
  afterBadge: string;
  afterBadgeColor: string;
  afterContent: React.ReactNode;
}

function VictoryCard({
  badgeText,
  badgeColor,
  engineTitle,
  engineSub,
  beforeTitle,
  beforeBadge,
  beforeBadgeColor,
  beforeContent,
  afterTitle,
  afterBadge,
  afterBadgeColor,
  afterContent,
}: VictoryCardProps) {
  return (
    <div className="w-full mb-8 rounded-3xl bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 p-4 sm:p-6 shadow-lg backdrop-blur-md relative overflow-hidden">
      {/* Top Banner Tag */}
      <div className="flex justify-center mb-5">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r border ${badgeColor} shadow-2xs`}>
          <Sparkles className="w-3.5 h-3.5" />
          <span>{badgeText}</span>
        </div>
      </div>

      {/* 3-Column Illustrated Transformation Pipeline */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
        {/* Left: Input Before Mockup */}
        <div className="flex-1 w-full flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Step 1: Input</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${beforeBadgeColor}`}>{beforeBadge}</span>
          </div>
          <div className="p-2 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 min-h-[104px] flex items-center justify-center">
            {beforeContent}
          </div>
          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-2">{beforeTitle}</span>
        </div>

        {/* Center: In-Browser Engine Arrow */}
        <div className="flex flex-col items-center justify-center px-2 py-1 text-center shrink-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20 mb-1.5">
            <Cpu className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-extrabold text-zinc-900 dark:text-white leading-tight">{engineTitle}</span>
          <span className="text-[9.5px] text-zinc-500 dark:text-zinc-400 mt-0.5 max-w-[200px]">{engineSub}</span>
          <div className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            <span>Under 2 Seconds</span>
          </div>
        </div>

        {/* Right: Victory Output Mockup */}
        <div className="flex-1 w-full flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Step 4: Victory</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${afterBadgeColor}`}>{afterBadge}</span>
          </div>
          <div className="p-2 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 min-h-[104px] flex items-center justify-center">
            {afterContent}
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2">{afterTitle}</span>
        </div>
      </div>
    </div>
  );
}
