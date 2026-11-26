"use client";

import React, { useEffect, useState } from "react";
import { useReducedMotion, motion, AnimatePresence } from "framer-motion";
import { FileText, Lock, ArrowDown, Check, Download, Cpu, HardDrive } from "lucide-react";
import "./tablet-flatten.css";

type Beat = "idle" | "dropped" | "processing" | "settled";

export default function TabletFlatten() {
  const reduce = useReducedMotion();
  const [beat, setBeat] = useState<Beat>(reduce ? "settled" : "idle");
  const [sizeCounter, setSizeCounter] = useState(14.8);

  // 3-Beat Animation Timeline
  useEffect(() => {
    if (reduce) {
      setBeat("settled");
      setSizeCounter(3.2);
      return;
    }

    let t1: NodeJS.Timeout, t2: NodeJS.Timeout, t3: NodeJS.Timeout, t4: NodeJS.Timeout;

    const runLoop = () => {
      // Beat 1: Idle file hovers and drops (0s -> 1.0s)
      setBeat("idle");
      setSizeCounter(14.8);

      t1 = setTimeout(() => {
        setBeat("dropped");
      }, 1000);

      // Beat 2: Processing starts and size rolls (1.8s -> 3.2s)
      t2 = setTimeout(() => {
        setBeat("processing");
        const start = 14.8;
        const target = 3.2;
        const duration = 1200;
        const startTime = Date.now();

        const rollTimer = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(1, elapsed / duration);
          const current = +(start - (start - target) * progress).toFixed(1);
          setSizeCounter(current);
          if (progress >= 1) clearInterval(rollTimer);
        }, 30);
      }, 1800);

      // Beat 3: Download pill settles; hold for 1.8s, then reset
      t3 = setTimeout(() => {
        setBeat("settled");
        setSizeCounter(3.2);
      }, 3400);

      // Reset after 1.8s hold (3.4s + 1.8s = 5.2s total loop)
      t4 = setTimeout(() => {
        runLoop();
      }, 5200);
    };

    runLoop();

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [reduce]);

  return (
    <div className="cx-hero-product-stage">
      {/* ================= DESKTOP & TABLET 1:1 SCALE STAGE (HIDDEN ON MOBILE) ================= */}
      <div className="hidden md:block cx-window-frame">
        {/* Browser Chrome Header */}
        <div className="cx-window-bar">
          <div className="cx-window-dots" aria-hidden="true">
            <span className="dot dot-close" />
            <span className="dot dot-min" />
            <span className="dot dot-max" />
          </div>
          <div className="cx-window-url">
            <Lock className="w-3 h-3 text-purple-400" />
            <span>compixor-ai.cloud/tools/pdf-compressor</span>
          </div>
          <div className="cx-window-status">
            <span className="cx-window-pulse" />
            <span>Local Browser RAM</span>
          </div>
        </div>

        {/* Window Interior at 1:1 Scale */}
        <div className="cx-window-body">
          <div className="cx-window-main">
            {/* Tool Banner Inside Window */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Smart PDF Compressor</h2>
                <p className="text-xs text-zinc-400">Lossless in-memory compression without network transfer</p>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Wasm v2.4
              </span>
            </div>

            {/* Drop Zone Area with 3-Beat Animation */}
            <div
              className={`cx-drop-zone ${
                beat === "dropped" || beat === "processing" ? "cx-drop-zone--active" : ""
              }`}
            >
              {/* Dropping / Active Document Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key="doc-card"
                  initial={reduce ? false : { y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="cx-file-chip"
                >
                  <div className="w-10 h-10 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-rose-400" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-200 truncate">Q4_Financial_Report.pdf</p>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                      <span>Original: 14.8 MB</span>
                      {beat === "processing" || beat === "settled" ? (
                        <span className="text-emerald-400 font-bold font-sans">
                          → {sizeCounter.toFixed(1)} MB (-78%)
                        </span>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Status / Action Footer */}
              <div className="mt-4 w-full flex items-center justify-between">
                <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {beat === "idle" && "Ready to drop PDF (Max 500MB)"}
                  {beat === "dropped" && "Analyzing PDF content streams..."}
                  {beat === "processing" && "Optimizing images & fonts in device RAM..."}
                  {beat === "settled" && "Completed with 0 byte server uploads"}
                </div>

                {/* Settle Download Pill */}
                <div
                  className={`cx-download-pill ${
                    beat === "settled" ? "cx-download-pill--ready" : ""
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save Compressed PDF ({sizeCounter.toFixed(1)} MB)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Satellite Card (Overlapping Side Surface) */}
          <div className="cx-satellite-panel">
            <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-zinc-800">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-zinc-200">Local Engine Metrics</span>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Environment:</span>
                <span className="font-mono text-zinc-200 text-[11px]">Client Sandbox</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Server Uploads:</span>
                <span className="font-mono text-emerald-400 font-bold text-[11px]">0 Bytes</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Process Time:</span>
                <span className="font-mono text-purple-300 text-[11px]">184 ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Saved Space:</span>
                <span className="font-mono text-emerald-400 font-bold text-[11px]">11.6 MB</span>
              </div>
            </div>
            <div className="mt-4 pt-2.5 border-t border-zinc-800/80 flex items-center gap-1.5 text-[10px] text-zinc-400">
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Full font & form fidelity preserved</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MOBILE COMPACT VIEW (358–390PX VIEWPORTS) ================= */}
      <div className="block md:hidden cx-mobile-compact-frame">
        {/* Mini Browser Bar */}
        <div className="cx-window-bar">
          <div className="cx-window-dots" aria-hidden="true">
            <span className="dot dot-close" />
            <span className="dot dot-min" />
            <span className="dot dot-max" />
          </div>
          <div className="cx-window-url text-[10px]">
            <Lock className="w-2.5 h-2.5 text-purple-400" />
            <span>PDF Compressor (Local)</span>
          </div>
        </div>

        {/* Compact Drop Zone Focused on Result */}
        <div className="p-4 bg-zinc-950/95 space-y-3">
          <div className="cx-file-chip">
            <div className="w-9 h-9 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-200 truncate">Financial_Report.pdf</p>
              <p className="text-[11px] font-mono text-emerald-400 font-semibold">
                14.8 MB → {sizeCounter.toFixed(1)} MB (-78%)
              </p>
            </div>
          </div>

          <div
            className={`cx-download-pill w-full justify-center ${
              beat === "settled" ? "cx-download-pill--ready" : ""
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save Compressed PDF ({sizeCounter.toFixed(1)} MB)</span>
          </div>

          <div className="text-center text-[10px] text-zinc-400">
            100% processed in browser RAM • 0 byte upload
          </div>
        </div>
      </div>
    </div>
  );
}
