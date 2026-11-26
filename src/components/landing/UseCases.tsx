"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { tools } from '@/data/tools';
import './sections.css';

const CASES = [
  { title: 'Students', line: 'Shrink assignments and scanned notes to fit upload limits.',
    tools: ['/tools/pdf-compressor', '/tools/pdf-organizer'] },
  { title: 'Job applications', line: 'Turn a PDF resume into an editable Word file and make a passport-size photo for the form.',
    tools: ['/tools/pdf-to-word', '/tools/passport-photo'] },
  { title: 'Visa & government forms', line: 'Get files under portal size limits and prepare a passport-size photo, without installing software.',
    tools: ['/tools/pdf-compressor', '/tools/passport-photo'] },
  { title: 'Office & small business', line: 'Pull text from scanned pages into Word, and password-protect files before you share them.',
    tools: ['/tools/img-to-word', '/tools/protect-pdf'] },
];
const name = (h: string) => (tools as any[]).find(t => t.href === h)?.name ?? h;

export default function UseCases() {
  const reduce = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const m = window.matchMedia('(max-width: 767px)');
    const onChange = () => setIsMobile(m.matches);
    onChange();
    m.addEventListener('change', onChange);
    return () => m.removeEventListener('change', onChange);
  }, []);

  const easeOut = [0.23, 1, 0.32, 1] as const;

  return (
    <section className="cx-sec" style={{ position: 'relative', overflow: 'visible' }} aria-labelledby="uc-h">
      <div className="cx-container" style={{ position: 'relative', zIndex: 1 }}>
        <motion.header
          className="cx-sec__head"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.28, ease: easeOut }}
        >
          <p className="cx-eyebrow">Use cases</p>
          <h2 id="uc-h" className="cx-h2">Made for <em>everyday paperwork</em></h2>
        </motion.header>
        <ul className="uc-grid">
          {CASES.map((c, i) => {
            const columns = isMobile ? 1 : 2;
            const colIndex = i % columns;
            const cardDelay = isMobile ? 0 : Math.min(0.15, colIndex * 0.05);

            return (
              <motion.li
                key={c.title}
                className="uc"
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.28, ease: easeOut, delay: cardDelay }}
              >
                <motion.h3
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.24, ease: easeOut, delay: cardDelay }}
                >
                  {c.title}
                </motion.h3>
                <motion.p
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.24, ease: easeOut, delay: cardDelay + 0.04 }}
                >
                  {c.line}
                </motion.p>
                <motion.div
                  className="uc-tools"
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.24, ease: easeOut, delay: cardDelay + 0.08 }}
                >
                  {c.tools.map(h => (
                    <Link key={h} href={h} className="uc-tool">
                      <span>{name(h)}</span>
                      <span className="uc-tool-arrow" aria-hidden="true">&nbsp;&rarr;</span>
                    </Link>
                  ))}
                </motion.div>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
