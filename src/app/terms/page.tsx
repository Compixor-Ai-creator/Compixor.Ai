'use client';

import React from 'react';
import { FileText, CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-500 dark:text-brand-300 border border-brand-500/20 mb-4">
          <FileText className="w-3.5 h-3.5" />
          Legal Agreement
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-display text-zinc-900 dark:text-white mb-4">
          Terms of Service
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          Last Updated: August 2026 • Please read carefully before using CompixorAi
        </p>
      </div>

      <div className="space-y-10 text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-zinc-900 dark:text-white">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or utilizing the CompixorAi web platform and client-side tool suite, you acknowledge and agree to be bound by these Terms of Service and all applicable laws. If you do not agree to these terms, you must discontinue use of the website immediately.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-zinc-900 dark:text-white">
            2. Permitted Use & Intellectual Property
          </h2>
          <p>
            You are free to utilize all tools (including PDF compression, Word optimization, Passport photo generation, and QR code creation) for both personal and commercial projects without licensing fees. You retain 100% full ownership and copyrights of all files, documents, and assets created or transformed using our tools.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-zinc-900 dark:text-white">
            3. Disclaimer of Warranties
          </h2>
          <p>
            CompixorAi is provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied. While we strive for absolute precision and standard biometric compliance, you are solely responsible for ensuring your passport or official documentation meets specific local embassy guidelines before submission.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-zinc-900 dark:text-white">
            4. Limitation of Liability
          </h2>
          <p>
            Under no circumstances shall CompixorAi, its creators, or affiliates be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use this service or loss of files.
          </p>
        </section>
      </div>
    </div>
  );
}
