'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function HeroArtCard() {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          card.classList.toggle('cx-paused', !entry.isIntersecting);
        });
      },
      { threshold: 0.05 }
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="cx-art-card relative w-full max-w-[470px] mx-auto lg:ml-auto bg-white/95 dark:bg-zinc-900/90 border border-violet-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/10 backdrop-blur-md select-none transition-all duration-300"
      aria-label="Your files never leave your device"
    >
      <svg
        viewBox="0 0 480 372"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="PDF, Word, image and QR files stay on your device — compress, watermark and protect PDFs privately"
        className="block w-full h-auto"
      >
        <defs>
          <linearGradient id="cxBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f8f3ff" className="dark:stop-color-zinc-900" />
            <stop offset="1" stopColor="#fdf4ff" className="dark:stop-color-zinc-950" />
          </linearGradient>
          <linearGradient id="cxShield" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#a78bfa" />
            <stop offset="1" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="cxDev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#f6f2ff" />
          </linearGradient>
          <radialGradient id="cxGlowGrad">
            <stop offset="0" stopColor="#8b5cf6" stopOpacity="0.55" />
            <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="cxPdfG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fb7185" />
            <stop offset="1" stopColor="#e11d48" />
          </linearGradient>
          <linearGradient id="cxWordG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#38bdf8" />
            <stop offset="1" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="cxImgG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fbbf24" />
            <stop offset="1" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="cxWaterG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fb7185" />
            <stop offset="1" stopColor="#be123c" />
          </linearGradient>
          <linearGradient id="cxProtG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#a78bfa" />
            <stop offset="1" stopColor="#6d28d9" />
          </linearGradient>
        </defs>

        {/* Background Backdrop */}
        <rect width="480" height="372" fill="url(#cxBg)" className="fill-purple-50/50 dark:fill-zinc-900/60" />
        <circle cx="56" cy="46" r="150" fill="#ede7ff" opacity="0.6" className="dark:opacity-10" />
        <circle cx="446" cy="332" r="165" fill="#ffe8f3" opacity="0.5" className="dark:opacity-10" />
        <circle cx="434" cy="34" r="92" fill="#e6f4ff" opacity="0.5" className="dark:opacity-10" />

        {/* Rotating Dashed Ring */}
        <circle
          className="cx-ring cx-anim"
          cx="240"
          cy="150"
          r="108"
          fill="none"
          stroke="#dcd1fb"
          strokeWidth="1.5"
          strokeDasharray="4 8"
        />

        {/* Glow Behind Shield */}
        <ellipse className="cx-glow cx-anim" cx="240" cy="152" rx="60" ry="60" fill="url(#cxGlowGrad)" opacity="0.25" />

        {/* Device / Browser Window */}
        <g>
          <rect x="154" y="82" width="172" height="126" rx="15" fill="url(#cxDev)" stroke="#e7ddfb" />
          <circle cx="171" cy="97" r="3.6" fill="#f472b6" />
          <circle cx="183" cy="97" r="3.6" fill="#fbbf24" />
          <circle cx="195" cy="97" r="3.6" fill="#4ade80" />
          <rect x="168" y="112" width="144" height="1" fill="#f1eafe" />

          {/* Shield + Lock */}
          <path
            d="M240 126c9 6 17 8.5 25 9.5v19c0 16-12.5 26.5-25 31.5-12.5-5-25-15.5-25-31.5v-19c8-1 16-3.5 25-9.5z"
            fill="url(#cxShield)"
          />
          <rect x="231.5" y="146" width="17" height="13" rx="3.2" fill="#fff" opacity="0.96" />
          <path
            d="M234.5 146v-4.2a5.6 5.6 0 0 1 11.2 0V146"
            fill="none"
            stroke="#fff"
            strokeWidth="2.3"
            strokeLinecap="round"
          />
          <rect x="238.7" y="150.8" width="2.8" height="4.6" rx="1.4" fill="#7c3aed" />

          <text
            x="240"
            y="196"
            textAnchor="middle"
            fontFamily="system-ui,sans-serif"
            fontSize="10"
            fontWeight="800"
            fill="#4c1d95"
          >
            Your device
          </text>
        </g>

        {/* Connector Dashes */}
        <g stroke="#c4b5fd" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeDasharray="3 5">
          <path d="M130 64 L176 104" />
          <path d="M352 58 L308 100" />
          <path d="M126 160 L152 156" />
          <path d="M340 158 L316 154" />
          <path d="M140 250 L180 214" />
          <path d="M344 254 L304 216" />
        </g>

        {/* Floating Tool Chips */}
        <g fontFamily="system-ui,sans-serif">
          {/* 1 · PDF */}
          <Link href="/tools/pdf-compressor" aria-label="PDF Tools">
            <g className="cx-chip cx-f1 cx-anim cursor-pointer transition-transform hover:scale-105">
              <rect x="24" y="44" width="112" height="40" rx="12" fill="#fff" stroke="#f0eafb" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.04))" />
              <rect x="33" y="54" width="19" height="22" rx="3" fill="url(#cxPdfG)" />
              <path d="M45.5 54H50a2 2 0 0 1 2 2v4.5L45.5 54z" fill="#fff" opacity="0.45" />
              <text x="42.5" y="69.5" textAnchor="middle" fontSize="5.6" fontWeight="900" fill="#fff">
                PDF
              </text>
              <text x="59" y="63" fontSize="10" fontWeight="800" fill="#2c2c35">
                contract.pdf
              </text>
              <text x="59" y="75" fontSize="8" fontWeight="600" fill="#9a9aa5">
                Compress &amp; merge
              </text>
            </g>
          </Link>

          {/* 2 · Word */}
          <Link href="/tools/word-compressor" aria-label="Word Compressor">
            <g className="cx-chip cx-f2 cx-anim cursor-pointer transition-transform hover:scale-105">
              <rect x="344" y="38" width="112" height="40" rx="12" fill="#fff" stroke="#f0eafb" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.04))" />
              <rect x="353" y="48" width="19" height="22" rx="3" fill="url(#cxWordG)" />
              <path d="M365.5 48H370a2 2 0 0 1 2 2v4.5L365.5 48z" fill="#fff" opacity="0.45" />
              <text x="362.5" y="65" textAnchor="middle" fontSize="10.5" fontWeight="900" fill="#fff">
                W
              </text>
              <text x="379" y="57" fontSize="10" fontWeight="800" fill="#2c2c35">
                report.docx
              </text>
              <text x="379" y="69" fontSize="8" fontWeight="600" fill="#9a9aa5">
                Editable DOCX
              </text>
            </g>
          </Link>

          {/* 3 · Add Watermark */}
          <Link href="/tools/add-watermark" aria-label="Add Watermark">
            <g className="cx-chip cx-f3 cx-anim cursor-pointer transition-transform hover:scale-105">
              <rect x="10" y="140" width="118" height="40" rx="12" fill="#fffafc" stroke="#ffe1ec" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.04))" />
              <circle cx="28" cy="154" r="5.6" fill="none" stroke="#e11d48" strokeWidth="2" />
              <path d="M24.6 160.6h6.8l1.8 5.4H22.8z" fill="url(#cxWaterG)" />
              <text x="41" y="158" fontSize="9.8" fontWeight="800" fill="#2c2c35">
                Add Watermark
              </text>
              <text x="41" y="170" fontSize="8" fontWeight="600" fill="#c88c9c">
                Text, logo, stamp
              </text>
            </g>
          </Link>

          {/* 4 · Protect PDF */}
          <Link href="/tools/protect-pdf" aria-label="Protect PDF">
            <g className="cx-chip cx-f4 cx-anim cursor-pointer transition-transform hover:scale-105">
              <rect x="340" y="138" width="118" height="40" rx="12" fill="#fbf9ff" stroke="#e9dcff" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.04))" />
              <rect x="349" y="155" width="13" height="10" rx="2.6" fill="url(#cxProtG)" />
              <path
                d="M351.8 155v-3.2a3.7 3.7 0 0 1 7.4 0V155"
                fill="none"
                stroke="#6d28d9"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
              <text x="371" y="158" fontSize="9.8" fontWeight="800" fill="#2c2c35">
                Protect PDF
              </text>
              <text x="371" y="170" fontSize="8" fontWeight="600" fill="#9d8cc4">
                AES-256 password
              </text>
            </g>
          </Link>

          {/* 5 · QR Code */}
          <Link href="/tools/qr-generator" aria-label="QR Code Generator">
            <g className="cx-chip cx-f5 cx-anim cursor-pointer transition-transform hover:scale-105">
              <rect x="34" y="238" width="106" height="40" rx="12" fill="#fff" stroke="#f0eafb" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.04))" />
              <rect x="43" y="247" width="22" height="22" rx="4" fill="#111827" />
              <rect x="46.5" y="250.5" width="6" height="6" rx="1" fill="#fff" />
              <rect x="48.4" y="252.4" width="2.2" height="2.2" fill="#111827" />
              <rect x="55.5" y="250.5" width="6" height="6" rx="1" fill="#fff" />
              <rect x="57.4" y="252.4" width="2.2" height="2.2" fill="#111827" />
              <rect x="46.5" y="259.5" width="6" height="6" rx="1" fill="#fff" />
              <rect x="48.4" y="261.4" width="2.2" height="2.2" fill="#111827" />
              <rect x="56" y="260" width="2" height="2" fill="#fff" />
              <rect x="60" y="263" width="2.4" height="2.4" fill="#fff" />
              <text x="73" y="257" fontSize="10" fontWeight="800" fill="#2c2c35">
                QR Code
              </text>
              <text x="73" y="269" fontSize="8" fontWeight="600" fill="#9a9aa5">
                Scan &amp; share
              </text>
            </g>
          </Link>

          {/* 6 · Image */}
          <Link href="/tools/passport-photo" aria-label="Photo Maker">
            <g className="cx-chip cx-f6 cx-anim cursor-pointer transition-transform hover:scale-105">
              <rect x="342" y="242" width="112" height="40" rx="12" fill="#fff" stroke="#f0eafb" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.04))" />
              <rect x="351" y="251" width="22" height="22" rx="4" fill="url(#cxImgG)" />
              <circle cx="357" cy="257" r="2" fill="#fff" opacity="0.95" />
              <path d="M353 270.5 358.4 264l4.2 4.6 2.6-2.6 3.6 4.5z" fill="#fff" opacity="0.95" />
              <text x="381" y="261" fontSize="10" fontWeight="800" fill="#2c2c35">
                photo.jpg
              </text>
              <text x="381" y="273" fontSize="8" fontWeight="600" fill="#9a9aa5">
                Resize &amp; convert
              </text>
            </g>
          </Link>
        </g>

        {/* 0 Bytes Uploaded Badge */}
        <g className="cx-badge cx-anim">
          <rect x="150" y="308" width="180" height="26" rx="13" fill="#fff" stroke="#e9e0ff" filter="drop-shadow(0 2px 6px rgba(109,40,217,0.08))" />
          <circle cx="168" cy="321" r="4" fill="#22c55e" />
          <text
            x="240"
            y="325"
            textAnchor="middle"
            fontFamily="system-ui,sans-serif"
            fontSize="10"
            fontWeight="800"
            fill="#6d28d9"
          >
            0 bytes uploaded
          </text>
        </g>
      </svg>

      {/* Footer Tool Strip */}
      <div className="grid grid-cols-4 gap-px bg-violet-100/70 dark:bg-zinc-800 border-t border-violet-100/70 dark:border-zinc-800">
        <Link
          href="/tools/pdf-compressor"
          className="p-2.5 sm:py-3 sm:px-2 text-center bg-violet-50/50 dark:bg-zinc-900/90 hover:bg-violet-100/60 dark:hover:bg-zinc-800/80 transition-colors group"
        >
          <span className="w-7 h-7 mx-auto mb-1 rounded-lg bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6d28d9"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 7h10M4 17h10" />
              <path d="m17 4 3 3-3 3" />
              <path d="m17 14 3 3-3 3" />
            </svg>
          </span>
          <b className="block text-[9.5px] font-extrabold tracking-wider uppercase text-zinc-700 dark:text-zinc-300">
            Compress
          </b>
        </Link>
        <Link
          href="/tools/add-watermark"
          className="p-2.5 sm:py-3 sm:px-2 text-center bg-violet-50/50 dark:bg-zinc-900/90 hover:bg-violet-100/60 dark:hover:bg-zinc-800/80 transition-colors group"
        >
          <span className="w-7 h-7 mx-auto mb-1 rounded-lg bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#e11d48"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="9" r="5" />
              <path d="M8 16h8l2 4H6z" />
            </svg>
          </span>
          <b className="block text-[9.5px] font-extrabold tracking-wider uppercase text-zinc-700 dark:text-zinc-300">
            Watermark
          </b>
        </Link>
        <Link
          href="/tools/protect-pdf"
          className="p-2.5 sm:py-3 sm:px-2 text-center bg-violet-50/50 dark:bg-zinc-900/90 hover:bg-violet-100/60 dark:hover:bg-zinc-800/80 transition-colors group"
        >
          <span className="w-7 h-7 mx-auto mb-1 rounded-lg bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6d28d9"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="4" y="11" width="16" height="10" rx="3" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </span>
          <b className="block text-[9.5px] font-extrabold tracking-wider uppercase text-zinc-700 dark:text-zinc-300">
            Protect
          </b>
        </Link>
        <Link
          href="/tools/qr-generator"
          className="p-2.5 sm:py-3 sm:px-2 text-center bg-violet-50/50 dark:bg-zinc-900/90 hover:bg-violet-100/60 dark:hover:bg-zinc-800/80 transition-colors group"
        >
          <span className="w-7 h-7 mx-auto mb-1 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1e3a8a"
              strokeWidth="2.2"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <path d="M14 14h3v3h-3zM20 20h1M18 21h-1" />
            </svg>
          </span>
          <b className="block text-[9.5px] font-extrabold tracking-wider uppercase text-zinc-700 dark:text-zinc-300">
            QR Code
          </b>
        </Link>
      </div>

      <style jsx>{`
        .cx-anim {
          animation: none;
        }
        @media (min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
          .cx-ring {
            transform-box: view-box;
            transform-origin: 50% 50%;
          }
          .cx-chip {
            transform-box: fill-box;
          }
          .cx-glow {
            transform-box: fill-box;
            transform-origin: 50% 50%;
          }

          .cx-ring.cx-anim {
            animation: cx-spin 46s linear infinite;
          }
          @keyframes cx-spin {
            to {
              transform: rotate(360deg);
            }
          }

          .cx-glow.cx-anim {
            animation: cx-glow 3.8s ease-in-out infinite;
            will-change: transform, opacity;
          }
          @keyframes cx-glow {
            0%,
            100% {
              opacity: 0.16;
              transform: scale(0.94);
            }
            50% {
              opacity: 0.34;
              transform: scale(1.09);
            }
          }

          .cx-chip.cx-anim {
            animation: cx-float 7s ease-in-out infinite;
            will-change: transform;
          }
          .cx-f1 {
            animation-delay: -0.2s;
          }
          .cx-f2 {
            animation-delay: -2.1s;
            animation-duration: 8.2s;
          }
          .cx-f3 {
            animation-delay: -3.4s;
            animation-duration: 7.6s;
          }
          .cx-f4 {
            animation-delay: -1.2s;
            animation-duration: 9s;
          }
          .cx-f5 {
            animation-delay: -4.2s;
            animation-duration: 8.6s;
          }
          .cx-f6 {
            animation-delay: -2.8s;
            animation-duration: 7.2s;
          }
          @keyframes cx-float {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-7px);
            }
          }

          .cx-badge.cx-anim {
            animation: cx-badge 5s ease-in-out infinite;
          }
          @keyframes cx-badge {
            0%,
            100% {
              opacity: 1;
            }
            50% {
              opacity: 0.72;
            }
          }
        }

        :global(.cx-art-card.cx-paused .cx-anim) {
          animation-play-state: paused !important;
        }

        @media (prefers-reduced-motion: reduce) {
          :global(.cx-art-card *) {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
