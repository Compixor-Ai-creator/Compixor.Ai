import React from 'react';
import { FileText } from 'lucide-react';

// Metadata is authoritatively exported from layout.tsx


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
          Last Updated: August 2026 • Please read carefully before using Compixor
        </p>
      </div>

      <div className="space-y-10 text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-zinc-900 dark:text-white">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or utilizing the Compixor web platform and tool suite, you acknowledge and agree to be bound by these Terms of Service and all applicable laws. If you do not agree to these terms, you must discontinue use of the website immediately.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-zinc-900 dark:text-white">
            2. File Handling & Intellectual Property
          </h2>
          <p>
            You retain 100% full ownership, rights, and copyright of all files, documents, and assets transformed or created using our tools:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-600 dark:text-zinc-400 text-sm">
            <li>
              <strong>Client-Side Tools (9 Tools):</strong> For PDF Compressor, PDF Merge & Split, Add Watermark, Remove Watermark, Protect PDF, Unlock PDF, Word Compressor, WhatsApp Full DP Maker, and QR Code Generator, computation runs entirely in your local browser memory. Files never leave your device.
            </li>
            <li>
              <strong>Server-Assisted Tools (3 Tools):</strong> For Biometric Passport Photo Maker (with an on-device Private Mode option), Image to Word, and PDF to Word, files are transmitted over secure HTTPS solely to complete the requested processing and are deleted immediately thereafter. For Urdu/Arabic text recognition in Image to Word and PDF to Word, image portions may be processed by Google&apos;s Gemini AI service as a third-party processor. We do not store your files or log their contents. Standard technical logs (IP address, request status, processing time) are kept. We claim no intellectual property rights over your uploaded or converted assets.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-zinc-900 dark:text-white">
            3. Disclaimer of Warranties
          </h2>
          <p>
            Compixor is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind, whether express or implied. While we strive for absolute precision and standard biometric compliance, you are solely responsible for ensuring your passport or official documentation meets specific local authority and embassy guidelines before submission.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-zinc-900 dark:text-white">
            4. Limitation of Liability
          </h2>
          <p>
            Under no circumstances shall Compixor, its creators, or affiliates be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use this service.
          </p>
        </section>
      </div>
    </div>
  );
}
