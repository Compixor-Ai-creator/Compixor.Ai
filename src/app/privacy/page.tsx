export const dynamic = 'force-static';
import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  ServerOff,
  Cpu,
  Server,
  Database,
  Globe2,
  FileCheck,
  Mail,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
      {/* Semantic Visible Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-8"
      >
        <Link
          href="/"
          className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <span
          className="text-zinc-900 dark:text-zinc-100 font-semibold"
          aria-current="page"
        >
          Privacy Policy
        </span>
      </nav>

      {/* Page Header */}
      <header className="text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          Strict Privacy Architecture
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-zinc-900 dark:text-white mb-4 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed mb-3">
          Learn how Compixor AI processes files, handles technical information, and manages data when you use our online PDF and document tools.
        </p>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
          Last Updated: October 2026 • Effective Immediately
        </p>
      </header>

      {/* Summary Highlight Box */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border-emerald-500/30 mb-12 bg-emerald-500/5">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-bold font-display text-zinc-900 dark:text-white">
              The Compixor AI Privacy Commitment
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              This Compixor AI Privacy Policy outlines our transparent approach to file privacy and security. We maintain an architectural distinction between client-side and server-assisted operations: nine tools process documents completely inside your local browser memory, while three specialized conversion utilities use secure, temporary server processing over encrypted HTTPS. We do not store your files, inspect their contents, or retain facial biometric data. Standard technical server logs are maintained strictly for performance, uptime, and security diagnostics.
            </p>
          </div>
        </div>
      </div>

      {/* Policy Content Sections */}
      <div className="space-y-12 text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-zinc-900 dark:text-white flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-brand-500" />
            Privacy at Compixor AI
          </h2>
          <p>
            At Compixor AI, we believe user privacy should be built into system architecture rather than treated as an afterthought. When you use our platform for online PDF tools privacy, you are never required to register an account, submit an email address, or enter personal identity credentials.
          </p>
          <p>
            Our core mission is to provide high-performance document and media utilities with minimal data exposure. By leveraging modern web standards, we avoid centralized file storage and reduce data transmission to the absolute operational minimum required for each specific tool. For further context regarding our platform mission, visit our{' '}
            <Link
              href="/about"
              className="text-brand-600 dark:text-brand-400 font-medium underline underline-offset-2 hover:text-brand-700 dark:hover:text-brand-300"
            >
              About Us
            </Link>{' '}
            page.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-brand-500" />
            Local and Server-Side File Processing
          </h2>
          <p>
            To deliver both absolute privacy and advanced conversion capabilities, our PDF and document file processing is structured into two clearly differentiated operational models:
          </p>

          <div className="space-y-5">
            {/* Subsection 2.1 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-700/70 space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                Client-Side Browser Processing (9 Tools)
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
                For nine of our utilities, browser-based PDF processing runs entirely on your local device. The application code executes in your browser memory utilizing WebAssembly (Wasm), Web Workers, and HTML5 Canvas APIs. <strong>Your file bytes are never uploaded to our servers or transmitted over the internet.</strong>
              </p>
              <div className="pt-2">
                <p className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-200 mb-2">
                  Tools operating 100% locally on your device:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <Link href="/tools/pdf-compressor" className="hover:text-brand-600 dark:hover:text-brand-400 underline underline-offset-2">
                      PDF Compressor
                    </Link>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <Link href="/tools/pdf-organizer" className="hover:text-brand-600 dark:hover:text-brand-400 underline underline-offset-2">
                      PDF Merge &amp; Split (PDF Organizer)
                    </Link>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <Link href="/tools/add-watermark" className="hover:text-brand-600 dark:hover:text-brand-400 underline underline-offset-2">
                      Add Watermark
                    </Link>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <Link href="/tools/remove-watermark" className="hover:text-brand-600 dark:hover:text-brand-400 underline underline-offset-2">
                      Remove Watermark
                    </Link>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <Link href="/tools/protect-pdf" className="hover:text-brand-600 dark:hover:text-brand-400 underline underline-offset-2">
                      Protect PDF (AES-256)
                    </Link>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <Link href="/tools/unlock-pdf" className="hover:text-brand-600 dark:hover:text-brand-400 underline underline-offset-2">
                      Unlock PDF
                    </Link>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <Link href="/tools/word-compressor" className="hover:text-brand-600 dark:hover:text-brand-400 underline underline-offset-2">
                      Word Compressor (.docx)
                    </Link>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <Link href="/tools/full-dp-maker" className="hover:text-brand-600 dark:hover:text-brand-400 underline underline-offset-2">
                      WhatsApp Full DP Maker
                    </Link>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <Link href="/tools/qr-generator" className="hover:text-brand-600 dark:hover:text-brand-400 underline underline-offset-2">
                      Vector QR Code Generator
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Subsection 2.2 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-700/70 space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-brand-500 shrink-0" />
                Server-Assisted Conversion &amp; Processing (3 Tools)
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
                Certain specialized tasks require advanced computing environments and machine learning models that cannot run efficiently across all mobile devices or browser memory limits. Three tools utilize secure server-assisted processing:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
                <li>
                  <Link href="/tools/passport-photo" className="font-semibold text-zinc-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 underline underline-offset-2">
                    Biometric Passport Photo Maker
                  </Link>
                  : When AI cloud background removal is selected, the image is transmitted securely to our backend server for background matting. Users may also select the client-side Private Mode option to keep processing local.
                </li>
                <li>
                  <Link href="/tools/img-to-word" className="font-semibold text-zinc-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 underline underline-offset-2">
                    Image to Word
                  </Link>
                  : Transmits the image over encrypted HTTPS to our processing backend for multi-lingual optical character recognition (OCR) and DOCX document reconstruction.
                </li>
                <li>
                  <Link href="/tools/pdf-to-word" className="font-semibold text-zinc-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 underline underline-offset-2">
                    PDF to Word
                  </Link>
                  : Transmits the source document over encrypted HTTPS for layout analysis, text extraction, font preservation, and conversion into editable Microsoft Word (.docx) format.
                </li>
              </ul>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 bg-brand-500/5 dark:bg-brand-500/10 p-3 rounded-xl border border-brand-500/10">
                <strong>Ephemaral In-Memory Lifecycle:</strong> For these three server-assisted utilities, files are handled strictly in transient memory buffers or temporary working directories that are deleted immediately once conversion finishes and the file is returned. Files are never retained on our servers.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Database className="w-5 h-5 text-brand-500" />
            Information We Collect and Technical Logs
          </h2>
          <p>
            We adhere strictly to data minimization principles. We distinguish between operational technical metadata and user file content:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 space-y-2">
              <h3 className="font-bold text-zinc-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Technical Logs Collected
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                When you connect to our website and APIs, standard automated web server logs record technical diagnostics:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                <li>Internet Protocol (IP) address</li>
                <li>HTTP request method and destination path</li>
                <li>HTTP response status code</li>
                <li>Browser user agent string</li>
                <li>Timestamp and processing latency</li>
              </ul>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                These logs are maintained solely for network security, DDoS mitigation, and server performance monitoring.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 space-y-2">
              <h3 className="font-bold text-zinc-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Information We Never Collect
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                We design our systems to ensure your document data remains completely confidential:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                <li>No document contents, text excerpts, or metadata indexing</li>
                <li>No facial embeddings, facial geometry, or biometric templates</li>
                <li>No passwords or decryption keys entered in PDF tools</li>
                <li>No QR code text, URL destinations, or payload data</li>
                <li>No personal user profiles or marketing tracking IDs</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-zinc-900 dark:text-white flex items-center gap-2.5">
            <EyeOff className="w-5 h-5 text-brand-500" />
            Browser Storage and Cookies
          </h2>
          <p>
            Compixor AI does not utilize third-party advertising cookies, cross-site tracking beacons, or commercial profiling scripts.
          </p>
          <p>
            We utilize lightweight, client-side browser <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono text-brand-600 dark:text-brand-400">localStorage</code> strictly to store functional preferences:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            <li>
              <strong className="text-zinc-900 dark:text-zinc-200">Theme Preference:</strong> The <code className="text-xs font-mono">compixor-theme</code> key remembers whether you prefer dark or light mode interface styling across browser visits.
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-zinc-200">Functional Counters:</strong> An internal counter stores the number of files processed on your current device to trigger non-intrusive user feedback prompts.
            </li>
          </ul>
          <p>
            To understand overall site performance and uptime, we utilize Vercel Analytics, a privacy-first web telemetry service that records aggregate, cookieless metrics (such as page views and general device categories) without capturing personal identity or tracking individuals across the web.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Globe2 className="w-5 h-5 text-brand-500" />
            Third-Party Processing Services
          </h2>
          <p>
            We are transparent regarding any third-party file processing required to deliver advanced functionality:
          </p>
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 space-y-3">
            <h3 className="font-bold text-zinc-900 dark:text-white text-sm sm:text-base">
              Google Gemini AI (Urdu and Arabic OCR)
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              When using <Link href="/tools/img-to-word" className="text-brand-600 dark:text-brand-400 underline underline-offset-2">Image to Word</Link> or <Link href="/tools/pdf-to-word" className="text-brand-600 dark:hover:text-brand-400 underline underline-offset-2">PDF to Word</Link> for complex Urdu or Arabic document transcription, designated image segments may be sent to Google’s Gemini API as an external processor. These transmissions occur strictly for character transcription and text extraction during conversion. Transmitted data is not used to train proprietary public models.
            </p>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Our website infrastructure and content delivery are hosted through enterprise cloud providers (including Vercel) that maintain SOC 2 compliance and rigorous transport-layer encryption.
            </p>
          </div>
        </section>

        {/* Section 6 */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-zinc-900 dark:text-white flex items-center gap-2.5">
            <ServerOff className="w-5 h-5 text-brand-500" />
            File Retention and Data Security
          </h2>
          <p>
            Our document processing and data retention model is governed by zero permanent storage:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
            <li>
              <strong className="text-zinc-900 dark:text-zinc-200">Zero File Retention:</strong> We do not retain, archive, or backup user documents. Once a file conversion finishes and the result is transferred to your device, the temporary server buffer is immediately erased from system storage.
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-zinc-200">Transport-Level Encryption:</strong> All communications between your web browser and our processing backend are encrypted using modern Transport Layer Security (HTTPS / TLS 1.3).
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-zinc-200">No Model Training:</strong> User document contents, uploaded photos, and transformed text are never used, analyzed, or sold to train artificial intelligence or machine learning models.
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-zinc-200">No Facial Data Retention:</strong> When processing biometric passport photos, facial landmarks and cropping dimensions are discarded immediately upon file download.
            </li>
          </ul>
        </section>

        {/* Section 7 */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Mail className="w-5 h-5 text-brand-500" />
            Privacy Rights and Contact Information
          </h2>
          <p>
            Compixor AI designs its tools around data minimization and privacy-first principles. Because we do not require account sign-ups, maintain user profiles, or store uploaded files, we generally do not hold personal data linked to your identity.
          </p>
          <p>
            If you have questions regarding this Privacy Policy, technical logs, or how our tools process data, please contact our support team:
          </p>
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 space-y-2 text-xs sm:text-sm">
            <p>
              <strong className="text-zinc-900 dark:text-zinc-200">Contact Email:</strong>{' '}
              <a
                href="mailto:support@compixor-ai.cloud"
                className="text-brand-600 dark:text-brand-400 font-medium hover:underline"
              >
                support@compixor-ai.cloud
              </a>
            </p>
            <p>
              <strong className="text-zinc-900 dark:text-zinc-200">Contact Page:</strong>{' '}
              <Link
                href="/contact"
                className="text-brand-600 dark:text-brand-400 font-medium hover:underline"
              >
                https://compixor-ai.cloud/contact
              </Link>
            </p>
            <p>
              <strong className="text-zinc-900 dark:text-zinc-200">Terms of Service:</strong>{' '}
              <Link
                href="/terms"
                className="text-brand-600 dark:text-brand-400 font-medium hover:underline"
              >
                View Terms of Service
              </Link>
            </p>
          </div>
        </section>

        {/* Section 8 */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-zinc-900 dark:text-white flex items-center gap-2.5">
            <FileCheck className="w-5 h-5 text-brand-500" />
            Changes to This Privacy Policy
          </h2>
          <p>
            We may periodically revise this Privacy Policy to reflect technical updates, infrastructure improvements, or new tools added to our catalog. Any modifications will be posted directly on this page with an updated revision date. We encourage users to review this page periodically to remain informed about how we safeguard file privacy.
          </p>
        </section>
      </div>
    </div>
  );
}
