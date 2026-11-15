import React from 'react';
import { Lock, Shield, HardDrive, CheckCircle } from 'lucide-react';

const steps = [
  {
    n: '01',
    icon: HardDrive,
    title: 'Drop Files in Your Browser',
    desc: 'Your files are read into local device memory. For 9 of our 12 tools, nothing is sent to a server.',
  },
  {
    n: '02',
    icon: Lock,
    title: 'Client-Side WebAssembly Processing',
    desc: 'Compression, conversion, and watermarking run inside your browser engine at memory-bus speeds.',
  },
  {
    n: '03',
    icon: Shield,
    title: 'Secure Ephemeral Server Option',
    desc: 'For the 3 tools requiring server processing (PDF to Word, Image to Word, Passport Photo), files transfer over encrypted HTTPS and follow our Secure Ephemeral Lifecycle with automatic deletion after processing.',
  },
  {
    n: '04',
    icon: CheckCircle,
    title: 'Instant Download & Discard',
    desc: 'Save output directly to your device. Memory is freed as soon as you close or refresh the tab.',
  },
];

export default function PrivacySteps() {
  return (
    <section id="how-it-works" className="cx-eclipse-night py-16 sm:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="cx-step-num uppercase">Private by Architecture</span>
          <h2 className="cx-heading-2 mt-2">How Compixor Works in 4 Steps</h2>
          <p className="mt-4 text-base sm:text-lg" style={{ color: 'var(--cx-text-mid)' }}>
            True zero-knowledge file processing. Here is what happens when you use Compixor.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.n} className="cx-card p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="cx-step-num">{s.n}</span>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'var(--cx-bg-3)', color: 'var(--cx-accent-bright)' }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="cx-heading-3 mb-2">{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--cx-text-mid)' }}>
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
