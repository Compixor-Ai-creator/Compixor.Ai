"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import './sections.css';

const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const Cpu = () => (<Svg><rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></Svg>);
const Lock = () => (<Svg><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></Svg>);

export default function PrivacySteps() {
  const reduce = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const m = window.matchMedia('(max-width: 1023px)');
    const onChange = () => setIsMobile(m.matches);
    onChange();
    m.addEventListener('change', onChange);
    return () => m.removeEventListener('change', onChange);
  }, []);

  const easeOut = [0.23, 1, 0.32, 1] as const;

  return (
    <section id="what-happens" className="cx-sec scroll-mt-20" style={{ position: 'relative', overflow: 'hidden' }} aria-labelledby="how-h">
      <div className="cx-container" style={{ position: 'relative', zIndex: 1 }}>
        <motion.header
          className="cx-sec__head"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.28, ease: easeOut }}
        >
          <p className="cx-eyebrow">Data Architecture</p>
          <h2 id="how-h" className="cx-h2">What happens to <em>your file</em></h2>
        </motion.header>

        <ol className="st-grid">
          {/* STEP 1 */}
          <motion.li
            className="st"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.28, ease: easeOut, delay: isMobile ? 0 : 0 }}
          >
            <motion.span
              className="st-label"
              initial={reduce ? false : { scale: 0.9, opacity: 0.5 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.28, ease: easeOut, delay: isMobile ? 0.04 : 0.05 }}
              style={{ display: "inline-block", transformOrigin: "left center" }}
            >
              <b>01</b>/ Ingest
            </motion.span>
            <h3>Loaded in RAM</h3>
            <p>Your document is read directly into your browser memory (RAM) through standard web APIs without outbound transmission.</p>

            <motion.span
              className="st-connector"
              aria-hidden="true"
              initial={reduce ? false : (isMobile ? { scaleY: 0 } : { scaleX: 0 })}
              whileInView={isMobile ? { scaleY: 1 } : { scaleX: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.28, ease: easeOut, delay: isMobile ? 0.08 : 0.14 }}
              style={{ transformOrigin: isMobile ? "top center" : "left center" }}
            />
          </motion.li>

          {/* STEP 2 */}
          <motion.li
            className="st st--main"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.28, ease: easeOut, delay: isMobile ? 0 : 0.15 }}
          >
            <motion.span
              className="st-label"
              initial={reduce ? false : { scale: 0.9, opacity: 0.5 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.28, ease: easeOut, delay: isMobile ? 0.04 : 0.20 }}
              style={{ display: "inline-block", transformOrigin: "left center" }}
            >
              <b>02</b>/ Process
            </motion.span>
            <h3>Processed on your device, or securely</h3>
            <div className="st-paths">
              <motion.div
                className="st-path"
                initial={reduce ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.24, ease: easeOut, delay: isMobile ? 0.06 : 0.27 }}
              >
                <span className="cx-chip cx-chip--device"><Cpu />On-device (9 tools)</span>
                <p>9 client-side tools execute transforms 100% inside your browser WebAssembly sandbox.</p>
              </motion.div>
              <motion.div
                className="st-path"
                initial={reduce ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.24, ease: easeOut, delay: isMobile ? 0.14 : 0.35 }}
              >
                <span className="cx-chip cx-chip--server"><Lock />Secure HTTPS (3 tools)</span>
                <p>PDF to Word, Image to Word and Passport Photo process over encrypted HTTPS and are permanently deleted right after return.</p>
              </motion.div>
            </div>
            <Link href="/privacy" className="st-link">
              <span>Read our Privacy Policy</span>
              <span className="st-link-arrow" aria-hidden="true">&nbsp;→</span>
            </Link>

            <motion.span
              className="st-connector"
              aria-hidden="true"
              initial={reduce ? false : (isMobile ? { scaleY: 0 } : { scaleX: 0 })}
              whileInView={isMobile ? { scaleY: 1 } : { scaleX: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.28, ease: easeOut, delay: isMobile ? 0.08 : 0.29 }}
              style={{ transformOrigin: isMobile ? "top center" : "left center" }}
            />
          </motion.li>

          {/* STEP 3 */}
          <motion.li
            className="st"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.28, ease: easeOut, delay: isMobile ? 0 : 0.30 }}
          >
            <motion.span
              className="st-label"
              initial={reduce ? false : { scale: 0.9, opacity: 0.5 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.28, ease: easeOut, delay: isMobile ? 0.04 : 0.35 }}
              style={{ display: "inline-block", transformOrigin: "left center" }}
            >
              <b>03</b>/ Export
            </motion.span>
            <h3>Direct download</h3>
            <p>The transformed file buffer is written directly to your device disk with zero server retention or copies.</p>
          </motion.li>
        </ol>
      </div>
    </section>
  );
}
