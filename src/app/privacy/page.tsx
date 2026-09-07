'use client';

import React from 'react';
import { ShieldCheck, Lock, EyeOff, ServerOff, CheckCircle } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          Strict Privacy Guarantee
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
          The CompixorAi Privacy Pledge
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          At CompixorAi, we operate under a strict <strong>Zero-Server Architecture</strong>. Your files (PDFs, Word documents, portrait photos, and QR contents) are processed entirely inside your local browser instance. They are never transmitted over the internet to our servers or stored in any database.
        </p>
      </div>

      <div className="space-y-10 text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-zinc-900 dark:text-white flex items-center gap-2">
            <ServerOff className="w-5 h-5 text-brand-500" />
            1. Information We Do Not Collect
          </h2>
          <p>
            Because file transformation occurs client-side using JavaScript, WebAssembly, and HTML5 Canvas:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-600 dark:text-zinc-400 text-sm">
            <li>We do <strong>not</strong> collect or store any files or images you upload.</li>
            <li>We do <strong>not</strong> inspect, read, or catalog document text or embedded media.</li>
            <li>We do <strong>not</strong> track or log the QR code payloads or credentials you generate.</li>
            <li>We do <strong>not</strong> retain biometric data from passport photo cropping.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-zinc-900 dark:text-white flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-brand-500" />
            2. Local Browser Storage & Cookies
          </h2>
          <p>
            CompixorAi may use lightweight browser <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono">localStorage</code> solely to remember your UI preferences (such as light vs. dark mode). No tracking cookies, marketing beacons, or third-party behavioral profiling scripts are embedded on this site.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-zinc-900 dark:text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-brand-500" />
            3. GDPR, CCPA & Global Compliance
          </h2>
          <p>
            Because we do not store, process, or sell personal data on remote servers, CompixorAi naturally complies with GDPR, CCPA, and worldwide data protection regulations by design (Privacy by Architecture).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-zinc-900 dark:text-white">
            4. Changes to This Policy
          </h2>
          <p>
            We may update our Privacy Policy periodically to reflect enhancements or new client-side tools. Any updates will be posted directly on this page with an updated revision date.
          </p>
        </section>
      </div>
    </div>
  );
}
