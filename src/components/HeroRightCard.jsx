/* ==========================================================================
     Compixor — Hero Right Card  ·  v4 (reference rebuild)
     File: HeroRightCard.jsx
     HTML + CSS + inline SVG only. No images, no libraries.
     --------------------------------------------------------------------------
     · Row 1 : Compress PDF  (left)          Protect PDF   (right)
     · Center: 3D shield + tilted glowing orbit ring + glowing platform
     · Row 2 : Add Watermark (left) | pills | Passport Photo (right)
     · Curved dotted connectors (chip → shield)
     · Bottom tab bar with auto-rotating active tab (3s)
     ========================================================================== */

'use client';

import { useEffect, useRef } from 'react';

/* ---------------------------------------------------------------------------
   Hero Right Card — 3D shield + glass chips + tab bar
   ---------------------------------------------------------------------------
   CSS: styles/hero-card.css (alag file — koi style tag nahi)
   Behaviour: tab bar har 3s par khud badalta hai (sirf desktop),
              hover/focus par pause, viewport se bahar ho to band,
              prefers-reduced-motion respect karta hai.
   --------------------------------------------------------------------------- */

export default function HeroRightCard() {
  const cardRef = useRef(null);

  useEffect(() => {
    const bar = cardRef.current?.querySelector('.cxg-tabs[data-rotate]');
    const card = cardRef.current;
    if (!bar || !card) return;

    const tabs = Array.from(bar.querySelectorAll('.cxg-tab'));
    const chips = Array.from(card.querySelectorAll('.cxg-chip'));
    if (!tabs.length) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isDesktop = window.matchMedia(
      '(min-width:1024px) and (hover:hover) and (pointer:fine)'
    ).matches;

    let i = Math.max(0, tabs.findIndex((t) => t.classList.contains('is-active')));
    let timer = null;
    let paused = false;

    const paint = () => {
      tabs.forEach((t, n) => {
        t.classList.toggle('is-active', n === i);
        t.setAttribute('aria-current', n === i ? 'true' : 'false');
      });
      const tool = tabs[i]?.getAttribute('data-tool');
      chips.forEach((c) => {
        c.classList.toggle('is-lit', c.getAttribute('data-tool') === tool);
      });
    };

    const tick = () => {
      if (paused) return;
      i = (i + 1) % tabs.length;
      paint();
    };

    const start = () => {
      if (reduce || !isDesktop || timer) return;
      timer = setInterval(tick, 3000);
    };
    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    paint();
    if (!isDesktop || reduce) return;   // mobile: kuch nahi

    const pause = () => { paused = true; stop(); };
    const resume = () => { paused = false; paint(); start(); };

    bar.addEventListener('mouseenter', pause);
    bar.addEventListener('mouseleave', resume);
    bar.addEventListener('focusin', pause);
    bar.addEventListener('focusout', resume);
    card.addEventListener('mouseenter', pause);
    card.addEventListener('mouseleave', resume);

    const onTabClick = (e) => {
      const idx = tabs.indexOf(e.currentTarget);
      if (idx >= 0) { i = idx; paint(); }
    };
    tabs.forEach((t) => t.addEventListener('click', onTabClick));

    let io = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => entries.forEach((e) => {
          card.classList.toggle('cxg-live', e.isIntersecting);
          e.isIntersecting ? start() : stop();
        }),
        { threshold: 0.15 }
      );
      io.observe(card);
    } else {
      card.classList.add('cxg-live');
      start();
    }

    /* cleanup — navigation/unmount par sab band (memory leak nahi) */
    return () => {
      stop();
      bar.removeEventListener('mouseenter', pause);
      bar.removeEventListener('mouseleave', resume);
      bar.removeEventListener('focusin', pause);
      bar.removeEventListener('focusout', resume);
      card.removeEventListener('mouseenter', pause);
      card.removeEventListener('mouseleave', resume);
      tabs.forEach((t) => t.removeEventListener('click', onTabClick));
      if (io) io.disconnect();
      card.classList.remove('cxg-live');
    };
  }, []);

  return (
    <aside ref={cardRef} className="cxg-card" aria-label="Your files stay secure & private">
      
        {/* ---------- background: one lavender gradient + 2 soft waves ---------- */}
        <svg className="cxg-bg" viewBox="0 0 560 420" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="cxgBgG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f0e6fe" />
              <stop offset=".42" stopColor="#f5ecfe" />
              <stop offset=".72" stopColor="#ecdcfd" />
              <stop offset="1" stopColor="#fbf2fe" />
            </linearGradient>
            <linearGradient id="cxgWaveG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#a78bfa" />
              <stop offset="1" stopColor="#7c3aed" />
            </linearGradient>
            <radialGradient id="cxgHazeG" cx=".5" cy=".5" r=".5">
              <stop stopColor="#8b5cf6" stopOpacity=".24" />
              <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="560" height="420" fill="url(#cxgBgG)" />
          {/* wave 1: top-right sweep */}
          <path d="M560 0v190c-78-10-152-44-206-92C310 62 300 26 296 0z" fill="url(#cxgWaveG)" opacity=".40" />
          {/* wave 2: left / bottom sweep */}
          <path d="M0 420V236c56 6 112 30 158 70 34 30 58 70 70 114z" fill="url(#cxgWaveG)" opacity=".40" />
          <path d="M0 168c74 8 148 2 212-20 58-20 92-52 108-92-58 30-140 46-208 40C60 92 24 74 0 54z"
                fill="url(#cxgWaveG)" opacity=".26" />
          {/* soft haze: glass chips ke peechay colour, taake frosting saaf dikhe */}
          <ellipse cx="120" cy="46" rx="150" ry="86" fill="url(#cxgHazeG)" />
          <ellipse cx="150" cy="300" rx="164" ry="92" fill="url(#cxgHazeG)" />
          <ellipse cx="440" cy="60" rx="130" ry="80" fill="url(#cxgHazeG)" />
        </svg>
      
        {/* ---------- curved dotted connectors ---------- */}
        <svg className="cxg-wires" viewBox="0 0 430 296" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path d="M138 44C166 52 182 72 188 104" />
          <path d="M292 44C264 52 248 72 242 104" />
          <path d="M138 252C166 244 182 220 188 190" />
          <path d="M292 252C264 244 248 220 242 190" />
        </svg>
      
        {/* ================= ROW 1 ================= */}
        <div className="cxg-row cxg-row-top">
          <a className="cxg-chip" href="/tools/pdf-compressor" data-tool="compress">
            <span className="cxg-tile" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                   strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 4v6H4" /><path d="M4 10l6-6" />
                <path d="M14 20v-6h6" /><path d="M20 14l-6 6" />
              </svg>
            </span>
            <span className="cxg-sep" aria-hidden="true"></span>
            <span className="cxg-lb">Compress PDF<i aria-hidden="true"></i></span>
          </a>
      
          <a className="cxg-chip" href="/tools/protect-pdf" data-tool="protect">
            <span className="cxg-tile" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                   strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="10" width="16" height="11" rx="3" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
            </span>
            <span className="cxg-sep" aria-hidden="true"></span>
            <span className="cxg-lb">Protect PDF<i aria-hidden="true"></i></span>
          </a>
        </div>
      
        {/* ================= CENTER ================= */}
        <div className="cxg-mid">
          <div className="cxg-art">
            <svg className="cxg-art-svg" viewBox="0 0 240 250" fill="none" xmlns="http://www.w3.org/2000/svg"
                 role="img" aria-label="Your files stay on your device">
              <defs>
                <linearGradient id="cxgShieldG" x1="52" y1="18" x2="176" y2="196" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ddd6fe" /><stop offset=".3" stopColor="#a78bfa" />
                  <stop offset=".66" stopColor="#7c3aed" /><stop offset="1" stopColor="#5b21b6" />
                </linearGradient>
                <linearGradient id="cxgGlossG" x1="70" y1="30" x2="130" y2="130" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#fff" stopOpacity=".55" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="cxgRimG" x1="170" y1="60" x2="150" y2="170" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#fff" stopOpacity=".85" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="cxgLockG" x1="86" y1="112" x2="150" y2="176" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ffffff" /><stop offset="1" stopColor="#efe7ff" />
                </linearGradient>
                <linearGradient id="cxgKeyG" x1="106" y1="132" x2="134" y2="166" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#8b5cf6" /><stop offset="1" stopColor="#4c1d95" />
                </linearGradient>
                <linearGradient id="cxgOrbitG" x1="20" y1="120" x2="220" y2="150" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ffffff" stopOpacity=".95" />
                  <stop offset=".42" stopColor="#c4b5fd" />
                  <stop offset=".78" stopColor="#a78bfa" stopOpacity=".9" />
                  <stop offset="1" stopColor="#ffffff" stopOpacity=".65" />
                </linearGradient>
                <radialGradient id="cxgPlateG" cx=".5" cy=".5" r=".5">
                  <stop stopColor="#c4b5fd" stopOpacity=".72" />
                  <stop offset=".5" stopColor="#a78bfa" stopOpacity=".3" />
                  <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
                </radialGradient>
              </defs>
      
              {/* ambient shadow (filter ke baghair) */}
              <ellipse cx="120" cy="216" rx="86" ry="26" fill="url(#cxgPlateG)" opacity=".85" />
              {/* platform glow */}
              <ellipse cx="120" cy="206" rx="96" ry="30" fill="url(#cxgPlateG)" />
              <g stroke="#a78bfa" fill="none" strokeLinecap="round">
                <ellipse cx="120" cy="206" rx="80" ry="23" strokeOpacity=".55" strokeWidth="1.5" />
                <ellipse cx="120" cy="206" rx="60" ry="16" strokeOpacity=".5" strokeWidth="1.4" />
                <ellipse cx="120" cy="206" rx="38" ry="9" strokeOpacity=".28" strokeWidth="1.1" />
              </g>
      
              {/* orbit ring: back half (soft outer glow + core stroke) */}
              <g transform="rotate(-16 120 132)">
                <ellipse cx="120" cy="132" rx="116" ry="56" stroke="#c4b5fd"
                         strokeOpacity=".42" strokeWidth="5.5" />
                <ellipse cx="120" cy="132" rx="116" ry="56" stroke="url(#cxgOrbitG)"
                         strokeOpacity="1" strokeWidth="1.9" />
              </g>
      
              {/* shield */}
              <g>
                <path d="M120 26c23 15 46 21 69 24v55c0 47-32 78-69 93-37-15-69-46-69-93V50c23-3 46-9 69-24z"
                      fill="url(#cxgShieldG)" />
                <path d="M120 40c17 11 34 16 51 19v46c0 38-25 63-51 76-26-13-51-38-51-76V59c17-3 34-8 51-19z"
                      fill="url(#cxgGlossG)" />
                <path d="M178 62v43c0 33-16 56-40 72" stroke="url(#cxgRimG)" strokeWidth="3.2"
                      strokeLinecap="round" fill="none" />
                {/* lock plate */}
                <rect x="86" y="112" width="68" height="60" rx="15" fill="url(#cxgLockG)" />
                <rect x="86" y="112" width="68" height="60" rx="15" stroke="#fff" strokeOpacity=".7" strokeWidth="1.4" />
                <path d="M105 112v-13a15 15 0 0 1 30 0v13" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
                <circle cx="120" cy="136" r="7.5" fill="url(#cxgKeyG)" />
                <rect x="116.8" y="140" width="6.4" height="14" rx="3.2" fill="url(#cxgKeyG)" />
              </g>
      
              {/* orbit ring: front arc (over the shield) */}
              <g transform="rotate(-16 120 132)">
                <path d="M236 133a116 56 0 0 1-116 56" stroke="#c4b5fd" strokeOpacity=".45"
                      strokeWidth="5.5" strokeLinecap="round" fill="none" />
                <path d="M236 133a116 56 0 0 1-116 56" stroke="url(#cxgOrbitG)" strokeWidth="2.2"
                      strokeLinecap="round" fill="none" />
              </g>
            </svg>
          </div>
        </div>
      
        {/* ================= ROW 2 ================= */}
        <div className="cxg-row cxg-row-bot">
          <a className="cxg-chip" href="/tools/add-watermark" data-tool="watermark">
            <span className="cxg-tile" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                   strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8.5" r="4" /><path d="M7 15h10l2.4 5.4H4.6z" />
              </svg>
            </span>
            <span className="cxg-sep" aria-hidden="true"></span>
            <span className="cxg-lb">Add Watermark<i aria-hidden="true"></i></span>
          </a>
      
          <a className="cxg-chip" href="/tools/passport-photo" data-tool="resize">
            <span className="cxg-tile" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                   strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="3" />
                <circle cx="8.6" cy="9.6" r="1.7" />
                <path d="M4 17.4l4.6-4.3 4.4 4.3 3-2.7 4 3.6" />
              </svg>
            </span>
            <span className="cxg-sep" aria-hidden="true"></span>
            <span className="cxg-lb">Image Resize<i aria-hidden="true"></i></span>
          </a>
        </div>
      
        {/* ================= TAB BAR ================= */}
        <nav className="cxg-tabs" aria-label="Popular tools" data-rotate>
          <a className="cxg-tab is-active" href="/tools/pdf-compressor" data-tool="compress" aria-label="Compress PDF tool">
            <span className="cxg-tab-ic" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                   strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 4v6H4" /><path d="M4 10l6-6" /><path d="M14 20v-6h6" /><path d="M20 14l-6 6" />
              </svg>
            </span>
            <span className="cxg-tab-tx">Compress</span>
            <i className="cxg-tab-ul" aria-hidden="true"></i>
          </a>
          <a className="cxg-tab" href="/tools/add-watermark" data-tool="watermark" aria-label="Add Watermark to PDF tool">
            <span className="cxg-tab-ic" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                   strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8.5" r="4" /><path d="M7 15h10l2.4 5.4H4.6z" />
              </svg>
            </span>
            <span className="cxg-tab-tx">Watermark</span>
            <i className="cxg-tab-ul" aria-hidden="true"></i>
          </a>
          <a className="cxg-tab" href="/tools/protect-pdf" data-tool="protect" aria-label="Protect PDF with password tool">
            <span className="cxg-tab-ic" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                   strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="10" width="16" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
            </span>
            <span className="cxg-tab-tx">Protect</span>
            <i className="cxg-tab-ul" aria-hidden="true"></i>
          </a>
          <a className="cxg-tab" href="/tools/passport-photo" data-tool="resize" aria-label="Passport Photo Maker and Image Resize tool">
            <span className="cxg-tab-ic" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                   strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="8.6" cy="9.6" r="1.7" />
                <path d="M4 17.4l4.6-4.3 4.4 4.3 3-2.7 4 3.6" />
              </svg>
            </span>
            <span className="cxg-tab-tx">Resize</span>
            <i className="cxg-tab-ul" aria-hidden="true"></i>
          </a>
        </nav>
      
    </aside>
  );
}
