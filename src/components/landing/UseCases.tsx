import React from 'react';
import { Briefcase, GraduationCap, Scale, Stethoscope } from 'lucide-react';

const cases = [
  {
    icon: Scale,
    title: 'Legal & Compliance',
    desc: 'Redact, sign, and merge sensitive client disclosures. Client files never hit external cloud infrastructure on 9 of our tools.',
  },
  {
    icon: Stethoscope,
    title: 'Healthcare & HIPAA',
    desc: 'Compress patient diagnostic scans and sanitize records locally in-memory before sharing with medical providers.',
  },
  {
    icon: Briefcase,
    title: 'Financial & Banking',
    desc: 'Audit statements, watermark confidential investor decks, and encrypt tax forms with client-side AES-256.',
  },
  {
    icon: GraduationCap,
    title: 'Academic & Research',
    desc: 'Combine dissertations, extract data tables, and generate high-density biometric photo sheets with zero cost.',
  },
];

export default function UseCases() {
  return (
    <section id="use-cases" className="cx-eclipse-night py-16 sm:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="cx-step-num uppercase">Built for Critical Work</span>
          <h2 className="cx-heading-2 mt-2">Trusted Across Regulated Industries</h2>
          <p className="mt-4 text-base sm:text-lg" style={{ color: 'var(--cx-text-mid)' }}>
            When file privacy is non-negotiable, teams choose Compixor.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cases.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.title} className="cx-card p-6 flex flex-col justify-between">
                <div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: 'var(--cx-bg-3)', color: 'var(--cx-accent-bright)' }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="cx-heading-3 mb-2">{c.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--cx-text-mid)' }}>
                    {c.desc}
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
