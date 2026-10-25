import React from 'react';
import { ShieldCheck, Lock, EyeOff, ServerOff, CheckCircle, Cpu, Server } from 'lucide-react';

// Metadata is authoritatively exported from layout.tsx


export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          Strict Privacy Architecture
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-display text-zinc-900 dark:text-white mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          Last Updated: August 2026 • Effective Immediately
        </p>
      </div>

      {/* Summary Highlight Box */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border-emerald-500/30 mb-12 bg-emerald-500/5">
        <h3 className="text-lg font-bold font-display text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-500" />
          The Compixor Privacy Architecture
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          At Compixor, transparency and data minimization are our foundational principles. We operate an architectural split: 9 tools run completely client-side in your browser memory without uploading anything, while 3 tools utilize secure server-assisted processing over encrypted HTTPS where files are deleted immediately after conversion. We do not store your files or log their contents. Standard technical logs (IP address, request status, processing time) are kept.
        </p>
      </div>

      <div className="space-y-10 text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-xl font-bold font-display text-zinc-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-brand-500" />
            1. Local vs. Server File Processing Architecture
          </h2>
          <div className="space-y-4 text-zinc-600 dark:text-zinc-400 text-sm">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 space-y-2">
              <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Local In-Browser Processing (9 Tools)
              </h4>
              <p>
                <strong>PDF Compressor</strong>, <strong>PDF Merge & Split (PDF Organizer)</strong>, <strong>Add Watermark</strong>, <strong>Remove Watermark</strong>, <strong>Protect PDF</strong>, <strong>Unlock PDF</strong>, <strong>Word Compressor</strong>, <strong>WhatsApp Full DP Maker</strong>, and <strong>Vector QR Code Generator</strong> operate 100% client-side in your device&apos;s browser memory (WebAssembly & HTML5 Canvas). Your files never leave your computer or phone.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 space-y-2">
              <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-500" />
                Secure Server Processing (3 Tools)
              </h4>
              <p>
                <strong>Biometric Passport Photo Maker</strong> (for AI background removal, with an on-device Private Mode option available), <strong>Image to Word</strong> (OCR reconstruction), and <strong>PDF to Word</strong> (document conversion) transmit your files over encrypted HTTPS to our secure processing server. Processing is executed in-memory or transient temporary buffers that are deleted from our server immediately upon completion. For Urdu/Arabic text recognition within Image to Word and PDF to Word, image portions may be sent to Google&apos;s Gemini AI service as a third-party processor for transcription. We do not store your files or log their contents. Standard technical logs (IP address, request status, processing time) are kept.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-zinc-900 dark:text-white flex items-center gap-2">
            <ServerOff className="w-5 h-5 text-brand-500" />
            2. Information Storage & Logging
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-600 dark:text-zinc-400 text-sm">
            <li>We do not store your files or log their contents. Standard technical logs (IP address, request status, processing time) are kept.</li>
            <li>We do <strong>not</strong> retain biometric data or facial embeddings from passport photo processing.</li>
            <li>We do <strong>not</strong> inspect, monetize, or train models on user document contents.</li>
            <li>We do <strong>not</strong> track or log QR code contents or user credentials.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-zinc-900 dark:text-white flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-brand-500" />
            3. Local Browser Storage & Cookies
          </h2>
          <p>
            Compixor may use lightweight browser <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono">localStorage</code> solely to remember your UI preferences (such as light vs. dark mode). No tracking cookies, marketing beacons, or third-party behavioral profiling scripts are embedded on this site.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-zinc-900 dark:text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-brand-500" />
            4. Alignment with GDPR & CCPA Principles
          </h2>
          <p>
            Compixor aligns with core international data minimization principles under GDPR and CCPA by design (Privacy by Architecture: local execution for client tools, immediate ephemeral deletion for server utilities, and zero vendor profiling).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-zinc-900 dark:text-white">
            5. Changes to This Policy
          </h2>
          <p>
            We may update our Privacy Policy periodically to reflect enhancements or new tools. Any updates will be posted directly on this page with an updated revision date.
          </p>
        </section>
      </div>
    </div>
  );
}
