/* ==========================================================================
   Compixor — Hero SVG Art Card  ·  v2 (richer palette)
   File: CxArtCard.tsx   ·   Zero dependencies   ·   SSR-safe
   ========================================================================== */

'use client';

import { useEffect, useRef } from 'react';

export default function CxArtCard() {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => card.classList.toggle('cx-paused', !e.isIntersecting)),
      { threshold: 0.05 }
    );
    io.observe(card);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={cardRef} className="cx-art-card" aria-label="Your files stay secure & private">
      <svg viewBox="0 0 480 348" xmlns="http://www.w3.org/2000/svg" role="img"
             aria-label="PDF, Word, image and QR files stay on your device — compress, watermark and protect PDFs privately">
          <defs>
            <linearGradient id="cxBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f6f0ff"/><stop offset=".55" stopColor="#fdf5fb"/><stop offset="1" stopColor="#fff1f6"/>
            </linearGradient>
            <linearGradient id="cxShield" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#a78bfa"/><stop offset=".55" stopColor="#7c3aed"/><stop offset="1" stopColor="#6d28d9"/>
            </linearGradient>
            <linearGradient id="cxDev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff"/><stop offset="1" stopColor="#f8f4ff"/>
            </linearGradient>
            <radialGradient id="cxGlowGrad">
              <stop offset="0" stopColor="#8b5cf6" stopOpacity=".62"/>
              <stop offset="1" stopColor="#8b5cf6" stopOpacity="0"/>
            </radialGradient>
            <linearGradient id="cxPdfG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fb7185"/><stop offset="1" stopColor="#e11d48"/>
            </linearGradient>
            <linearGradient id="cxWordG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#3b82f6"/><stop offset="1" stopColor="#1d4ed8"/>
            </linearGradient>
            <linearGradient id="cxImgG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fbbf24"/><stop offset="1" stopColor="#f59e0b"/>
            </linearGradient>
            <linearGradient id="cxWaterG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fb7185"/><stop offset="1" stopColor="#be123c"/>
            </linearGradient>
            <linearGradient id="cxProtG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#a78bfa"/><stop offset="1" stopColor="#6d28d9"/>
            </linearGradient>
          </defs>
    
          <rect width="480" height="348" fill="url(#cxBg)"/>
          <circle cx="34" cy="26" r="152" fill="#e7ddff" opacity=".85"/>
          <circle cx="456" cy="330" r="162" fill="#ffdcea" opacity=".8"/>
          <circle cx="430" cy="18" r="96" fill="#dceeff" opacity=".8"/>
          <circle cx="112" cy="330" r="112" fill="#fff0dd" opacity=".55"/>
    
          <circle className="cx-ring cx-anim" cx="240" cy="146" r="114" fill="none"
                  stroke="#d6c8fb" strokeWidth="1.6" strokeDasharray="4 8"/>
    
          <g>
            <circle cx="183" cy="47"  r="3.6" fill="#a78bfa" stroke="#fff" strokeWidth="2"/>
            <circle cx="297" cy="47"  r="3.6" fill="#f472b6" stroke="#fff" strokeWidth="2"/>
            <circle cx="183" cy="245" r="3.6" fill="#38bdf8" stroke="#fff" strokeWidth="2"/>
            <circle cx="297" cy="245" r="3.6" fill="#fbbf24" stroke="#fff" strokeWidth="2"/>
          </g>
    
          <path className="cx-spark cx-sp1 cx-anim" d="M137 106 L138.68 110.32 L143 112 L138.68 113.68 L137 118 L135.32 113.68 L131 112 L135.32 110.32 Z" fill="#c4b5fd" opacity=".9"/>
          <path className="cx-spark cx-sp2 cx-anim" d="M342 191 L343.96 196.04 L349 198 L343.96 199.96 L342 205 L340.04 199.96 L335 198 L340.04 196.04 Z" fill="#f9a8d4" opacity=".9"/>
    
          <ellipse className="cx-glow cx-anim" cx="240" cy="150" rx="62" ry="62" fill="url(#cxGlowGrad)" opacity=".32"/>
    
          <g>
            <rect x="152" y="76" width="176" height="134" rx="15" fill="#4c1d95" opacity=".06" transform="translate(0,4)"/>
            <rect x="152" y="76" width="176" height="134" rx="15" fill="url(#cxDev)" stroke="#e9dcfb"/>
            <circle cx="170" cy="91" r="3.6" fill="#f472b6"/>
            <circle cx="182" cy="91" r="3.6" fill="#fbbf24"/>
            <circle cx="194" cy="91" r="3.6" fill="#4ade80"/>
            <rect x="166" y="106" width="148" height="1" fill="#f2ecfe"/>
      
            <path d="M240 116c10 6.5 19 9 28 10.5v21c0 18-14 30-28 35.5-14-5.5-28-17.5-28-35.5v-21c9-1.5 18-4 28-10.5z"
                  fill="url(#cxShield)"/>
            <path d="M240 122c7 4.4 13 6.2 19.5 7.4v15.6c0 12.6-9.8 21-19.5 24.8-9.7-3.8-19.5-12.2-19.5-24.8v-15.6c6.5-1.2 12.5-3 19.5-7.4z"
                  fill="#fff" opacity=".14"/>
            <rect x="230" y="138" width="20" height="15" rx="3.6" fill="#fff"/>
            <path d="M233.6 138v-4.9a6.4 6.4 0 0 1 12.8 0V138" fill="none" stroke="#fff"
                  strokeWidth="2.6" strokeLinecap="round"/>
            <rect x="238.4" y="143.4" width="3.2" height="5.4" rx="1.6" fill="#7c3aed"/>
            <text x="240" y="198" textAnchor="middle" fontFamily="system-ui,sans-serif"
                  fontSize="10.2" fontWeight="800" fill="#4c1d95">Your device</text>
          </g>
    
          <g stroke="#c4b5fd" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeDasharray="3 5">
            <path d="M132 62 L176 100"/>
            <path d="M350 56 L306 96"/>
            <path d="M136 162 L152 158"/>
            <path d="M344 158 L330 154"/>
            <path d="M142 252 L180 216"/>
            <path d="M346 256 L306 218"/>
          </g>
    
          <g fontFamily="system-ui,sans-serif">
            <g className="cx-chip cx-f1 cx-anim">
              <rect x="8" y="44" width="126" height="40" rx="12" fill="#4c1d95" opacity=".07"/>
              <rect x="8" y="40" width="126" height="40" rx="12" fill="#fff" stroke="#ece2fb"/>
              <rect x="17" y="49" width="22" height="22" rx="6.5" fill="url(#cxPdfG)"/>
              <text x="28" y="62.6" textAnchor="middle" fontSize="5.6" fontWeight="900" fill="#fff">PDF</text>
              <text x="47" y="58" fontSize="9.4" fontWeight="800" fill="#241f2e">contract.pdf</text>
              <text x="47" y="69" fontSize="7.4" fontWeight="600" fill="#8b8496">Compress &amp; merge</text>
            </g>
            <g className="cx-chip cx-f2 cx-anim">
              <rect x="346" y="38" width="126" height="40" rx="12" fill="#4c1d95" opacity=".07"/>
              <rect x="346" y="34" width="126" height="40" rx="12" fill="#fff" stroke="#ece2fb"/>
              <rect x="355" y="43" width="22" height="22" rx="6.5" fill="url(#cxWordG)"/>
              <text x="366" y="57.8" textAnchor="middle" fontSize="11" fontWeight="900" fill="#fff">W</text>
              <text x="385" y="52" fontSize="9.4" fontWeight="800" fill="#241f2e">report.docx</text>
              <text x="385" y="63" fontSize="7.4" fontWeight="600" fill="#8b8496">Editable DOCX</text>
            </g>
            <g className="cx-chip cx-f3 cx-anim">
              <rect x="4" y="146" width="134" height="40" rx="12" fill="#4c1d95" opacity=".07"/>
              <rect x="4" y="142" width="134" height="40" rx="12" fill="#fff" stroke="#ece2fb"/>
              <rect x="13" y="151" width="22" height="22" rx="6.5" fill="url(#cxWaterG)"/>
              <circle cx="24" cy="158" r="3.1" fill="none" stroke="#fff" strokeWidth="1.6"/><path d="M19.4 164.2h9.2l1.5 3.6H17.9z" fill="#fff" opacity=".95"/>
              <text x="43" y="160" fontSize="9.4" fontWeight="800" fill="#241f2e">Add Watermark</text>
              <text x="43" y="171" fontSize="7.4" fontWeight="600" fill="#8b8496">Text, logo, stamp</text>
            </g>
            <g className="cx-chip cx-f4 cx-anim">
              <rect x="342" y="144" width="134" height="40" rx="12" fill="#4c1d95" opacity=".07"/>
              <rect x="342" y="140" width="134" height="40" rx="12" fill="#fff" stroke="#ece2fb"/>
              <rect x="351" y="149" width="22" height="22" rx="6.5" fill="url(#cxProtG)"/>
              <rect x="356.6" y="159" width="10.8" height="8.4" rx="2.2" fill="#fff"/><path d="M358.8 159v-2.6a3.2 3.2 0 0 1 6.4 0V159" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round"/><circle cx="362" cy="163" r="1.3" fill="#7c3aed"/>
              <text x="381" y="158" fontSize="9.4" fontWeight="800" fill="#241f2e">Protect PDF</text>
              <text x="381" y="169" fontSize="7.4" fontWeight="600" fill="#8b8496">AES-256 password</text>
            </g>
            <g className="cx-chip cx-f5 cx-anim">
              <rect x="12" y="244" width="122" height="40" rx="12" fill="#4c1d95" opacity=".07"/>
              <rect x="12" y="240" width="122" height="40" rx="12" fill="#fff" stroke="#ece2fb"/>
              <rect x="21" y="249" width="22" height="22" rx="6.5" fill="#111827"/>
              <rect x="26" y="254" width="7" height="7" rx="1.2" fill="#fff"/><rect x="28.1" y="256.1" width="2.8" height="2.8" fill="#111827"/><rect x="34" y="254" width="7" height="7" rx="1.2" fill="#fff"/><rect x="36.1" y="256.1" width="2.8" height="2.8" fill="#111827"/><rect x="26" y="262" width="7" height="7" rx="1.2" fill="#fff"/><rect x="28.1" y="264.1" width="2.8" height="2.8" fill="#111827"/><rect x="35" y="263" width="2.4" height="2.4" fill="#fff"/><rect x="38" y="265" width="2" height="2" fill="#fff"/><rect x="35" y="266.4" width="2" height="2" fill="#fff"/>
              <text x="51" y="258" fontSize="9.4" fontWeight="800" fill="#241f2e">QR Code</text>
              <text x="51" y="269" fontSize="7.4" fontWeight="600" fill="#8b8496">Scan &amp; share</text>
            </g>
            <g className="cx-chip cx-f6 cx-anim">
              <rect x="346" y="248" width="126" height="40" rx="12" fill="#4c1d95" opacity=".07"/>
              <rect x="346" y="244" width="126" height="40" rx="12" fill="#fff" stroke="#ece2fb"/>
              <rect x="355" y="253" width="22" height="22" rx="6.5" fill="url(#cxImgG)"/>
              <circle cx="362" cy="259.8" r="2" fill="#fff" opacity=".95"/><path d="M359 270 L364.4 263 l3.4 3.8 2.8-2.6 3.4 5.8z" fill="#fff" opacity=".95"/>
              <text x="385" y="262" fontSize="9.4" fontWeight="800" fill="#241f2e">photo.jpg</text>
              <text x="385" y="273" fontSize="7.4" fontWeight="600" fill="#8b8496">Resize &amp; convert</text>
            </g>
          </g>
    
          <g className="cx-badge cx-anim">
            <rect x="148" y="298" width="184" height="28" rx="14" fill="#ecfdf3" stroke="#b7f2cd"/>
            <circle cx="170" cy="312" r="4" fill="#22c55e"/>
            <text x="258" y="316" textAnchor="middle" fontFamily="system-ui,sans-serif"
                  fontSize="10" fontWeight="800" fill="#15803d">0 bytes uploaded</text>
          </g>
        </svg>
      <div className="cx-art-foot">
          <div>
            <span className="cx-ft-ic cx-ft-compress">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7h10M4 17h10"/><path d="m17 4 3 3-3 3"/><path d="m17 14 3 3-3 3"/>
              </svg>
            </span>
            <b>Compress</b>
          </div>
          <div>
            <span className="cx-ft-ic cx-ft-water">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="9" r="5"/><path d="M8 16h8l2 4H6z"/>
              </svg>
            </span>
            <b>Watermark</b>
          </div>
          <div>
            <span className="cx-ft-ic cx-ft-protect">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="11" width="16" height="10" rx="3"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
              </svg>
            </span>
            <b>Protect</b>
          </div>
          <div>
            <span className="cx-ft-ic cx-ft-qr">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.2" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="3" height="3" rx=".6"/>
                <rect x="18.5" y="18.5" width="2.5" height="2.5" rx=".6"/><rect x="14" y="19" width="2.5" height="2.5" rx=".6"/>
              </svg>
            </span>
            <b>QR Code</b>
          </div>
        </div>
    </div>
  );
}
