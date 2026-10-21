import React from 'react';
import { Shield, Zap, Lock, Cpu, CheckCircle2, FileCheck } from 'lucide-react';

export default function ClientSideGuideSection() {
  return (
    <section className="py-16 md:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="glass-card p-8 sm:p-12 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xl relative overflow-hidden">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20 mb-4">
            <Cpu className="w-3.5 h-3.5 text-brand-500" />
            In-Browser Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-zinc-900 dark:text-white mb-4 tracking-tight">
            How Client-Side In-Browser Processing Protects Your Data
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Most online document converters require uploading your private files to remote cloud servers, creating security risks, network delays, and subscription paywalls. Compixor AI takes a fundamentally different architectural approach. Every conversion, compression, and biometric transformation executes directly inside your browser memory using WebAssembly and HTML5 Canvas.
          </p>
        </div>

        {/* 4 Informational Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Card 1 */}
          <div className="space-y-3 p-6 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold mb-2">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-display text-zinc-900 dark:text-white">
              Zero Network Latency &amp; Instant Execution
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              When processing large documents such as 80MB PDF portfolios or high-resolution photos, traditional platforms make you wait while your internet connection uploads the entire file to an overseas server. With local memory execution, your modern multi-core processor processes the raw byte stream at bus speeds exceeding several gigabytes per second. Transforms take mere milliseconds instead of minutes.
            </p>
          </div>

          {/* Card 2 */}
          <div className="space-y-3 p-6 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold mb-2">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-display text-zinc-900 dark:text-white">
              Sandboxed RAM Isolation &amp; Total Privacy
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Every document you open is loaded into an isolated TypedArray in your browser RAM. Neither our servers nor any third party ever receives your files. Once you finish downloading your processed output or close the browser tab, the allocated memory buffer is instantly released and purged by your operating system garbage collector, leaving zero trace behind.
            </p>
          </div>

          {/* Card 3 */}
          <div className="space-y-3 p-6 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold mb-2">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-display text-zinc-900 dark:text-white">
              Enterprise Compliance &amp; Confidentiality
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Corporate attorneys, medical researchers, and financial analysts regularly handle non-disclosure agreements, patient records, and tax filings that strictly prohibit third-party cloud uploads. Because Compixor AI acts entirely on the client side, using our platform violates zero data protection policies, ensuring strict alignment with GDPR, HIPAA, and corporate confidentiality requirements.
            </p>
          </div>

          {/* Card 4 */}
          <div className="space-y-3 p-6 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold mb-2">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-display text-zinc-900 dark:text-white">
              Standard 256-Bit Cryptography &amp; Quality
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Our tools deliver uncompromising accuracy. PDF files are encrypted using standard 256-bit AES cryptographic algorithms, biometric passport portraits are verified against official government guidelines (35x45mm and 2x2 inch standards at 300 DPI), and vector QR codes are exported as infinite-resolution SVG vectors ready for commercial billboard printing.
            </p>
          </div>
        </div>

        {/* Informative Summary Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-500/10 via-purple-500/10 to-emerald-500/10 border border-brand-500/20 text-center">
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
            No accounts to create. No file size queues. No recurring charges.
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Experience complete digital autonomy. Compixor AI empowers creators, developers, and everyday users to optimize, secure, and convert files safely with the speed and reliability of modern client-side engineering.
          </p>
        </div>
      </div>
    </section>
  );
}
