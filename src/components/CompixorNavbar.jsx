"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Files,
  FileText,
  Camera,
  Maximize2,
  QrCode,
  BookOpen,
  Info,
  ChevronDown,
  FileDown,
  Combine,
  Stamp,
  Eraser,
  Lock,
  Unlock,
  FileType,
  Image as ImageIcon,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { NAV_GROUPS, NAV_LINKS } from "./nav-data";
import { useTheme } from "@/components/ThemeProvider";

const ICONS = {
  Files,
  FileText,
  Camera,
  Maximize2,
  QrCode,
  BookOpen,
  Info,
  FileDown,
  Combine,
  Stamp,
  Eraser,
  Lock,
  Unlock,
  FileType,
  ImageIcon,
};

function NavIcon({ name, size = 18 }) {
  const Cmp = ICONS[name];
  return Cmp ? <Cmp className="cnav-ico" size={size} strokeWidth={2} aria-hidden="true" /> : null;
}

export default function CompixorNavbar() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";
  const [mounted, setMounted] = useState(false);

  // Desktop dropdown state
  const [openGroup, setOpenGroup] = useState(null);
  const closeTimer = useRef(null);
  const navRef = useRef(null);

  const openNow = (id) => {
    clearTimeout(closeTimer.current);
    setOpenGroup(id);
  };
  const closeSoon = () => {
    closeTimer.current = setTimeout(() => setOpenGroup(null), 120);
  };

  // Mobile menu & accordion state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobGroup, setMobGroup] = useState(null);

  // Body scroll lock & responsive dismiss for mobile menu
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    const onKey = (e) => e.key === "Escape" && setMobileOpen(false);
    const onResize = () => window.innerWidth >= 1024 && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [mobileOpen]);

  // Desktop dropdown close on outside click or Esc
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenGroup(null);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setOpenGroup(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  // Mark mounted for hydration-safe theme icon rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* Phase 1: One Shared Glass System */
            :root {
              --cglass-bg: rgba(255,255,255,0.72);
              --cglass-border: rgba(255,255,255,0.65);
              --cglass-blur: blur(28px) saturate(180%);
              --cglass-shadow: 0 20px 50px rgba(88,60,200,0.18), inset 0 1px 0 rgba(255,255,255,0.7);
              --cglass-noise: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .35  0 0 0 0 .25  0 0 0 0 .7  0 0 0 .22 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
            }
            .dark {
              --cglass-bg: rgba(20,18,35,0.72);
              --cglass-border: rgba(255,255,255,0.10);
              --cglass-shadow: 0 20px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08);
            }

            /* shared surface: apply to header glass layer, dropdown, mobile panel */
            .cglass {
              background: var(--cglass-bg);
              backdrop-filter: var(--cglass-blur);
              -webkit-backdrop-filter: var(--cglass-blur);
              border: 1px solid var(--cglass-border);
              box-shadow: var(--cglass-shadow);
              isolation: isolate;
            }
            /* frosted texture */
            .cglass::after {
              content: ""; position: absolute; inset: 0; border-radius: inherit;
              background-image: var(--cglass-noise); background-size: 160px 160px;
              opacity: .5; pointer-events: none; z-index: 0;
            }
            .cglass > * { position: relative; z-index: 1; }

            @media (max-width: 1023px) {
              :root { --cglass-blur: blur(22px) saturate(170%); --cglass-bg: #ffffff; }
              .dark { --cglass-bg: #0f172a; }
            }
            @supports not (backdrop-filter: blur(1px)) { .cglass { background: rgba(255,255,255,0.96); } .dark .cglass { background: rgba(20,18,35,0.96); } }
            /* A solid, softly textured surface: no page content shows through. */
            @media (max-width: 1023px) {
              .cnav-glass {
                background-color: #ffffff;
                background-image: none;
              }
              .dark .cnav-glass {
                background-color: #0f172a;
                background-image: none;
              }
            }

            /* Dark mode: clean solid header + panel, no glass/noise overlay on any screen */
            .dark .cnav-glass {
              background-color: #0f172a !important;
              background-image: none !important;
              border-color: rgba(255, 255, 255, 0.08) !important;
            }
            .dark .cglass::after { display: none !important; }
            .dark .cnav-bar {
              background: rgba(15, 23, 42, 0.92);
              border: 1px solid rgba(255, 255, 255, 0.06);
            }

            @media (max-width: 1023px) {
              .dark .cnav-panel {
                background: #0f172a !important;
                border: 1px solid rgba(255, 255, 255, 0.08);
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
              }
              .dark .cnav-panel::after { display: none !important; }
              .dark .cnav-backdrop {
                background: rgba(0, 0, 0, 0.45);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
              }
            }

            /* Phase 2: Dedicated Header Structure */
            .cnav-header {
              position: fixed;
              top: 12px;
              left: 12px;
              right: 12px;
              max-width: 1280px;
              margin: 0 auto;
              z-index: 10000;
              border-radius: 22px;
              -webkit-transform: translateZ(0);
              transform: translateZ(0);
            }
            @media (max-width: 768px) {
              .cnav-header {
                top: 8px;
                left: 8px;
                right: 8px;
                border-radius: 16px;
              }
            }
            .cnav-glass {
              position: absolute;
              inset: 0;
              border-radius: inherit;
              z-index: 0;
              pointer-events: none;
            }
            .cnav-bar {
              position: relative;
              z-index: 1;
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 10px 18px;
              border-radius: inherit;
              color: #1a1530;
            }
            @media (max-width: 768px) {
              .cnav-bar {
                padding: 6px 12px;
              }
            }
            .dark .cnav-bar {
              color: #f3f0ff;
            }

            /* Phase 3 & Icons CSS (icons must never shrink) */
            .cnav-ico {
              width: 18px;
              height: 18px !important;
              min-width: 18px;
              min-height: 18px;
              max-width: none;
              flex: 0 0 18px;            /* never shrink in flex rows */
              color: #7c3aed;            /* brand purple */
              opacity: .95;
              transform: none;
            }
            .dark .cnav-ico { color: #a78bfa; }
            .cnav-chev {
              width: 16px;
              height: 16px !important;
              min-width: 16px;
              min-height: 16px;
              flex: 0 0 16px;
              opacity: .75;
              transition: transform .2s ease;
            }

            /* desktop links / triggers */
            .cnav-desktop-link, .cnav-link, .cnav-trigger {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              white-space: nowrap;
              color: #1a1530;
            }
            .dark .cnav-desktop-link, .dark .cnav-link, .dark .cnav-trigger {
              color: #f3f0ff;
            }
            .cnav-theme-btn { color: #1a1530; }
            .dark .cnav-theme-btn { color: #f3f0ff; }

            /* Desktop Dropdowns (>= 1024px) */
            .cnav-group { position: relative; }
            .cnav-trigger { background:none; border:0; cursor:pointer; font: inherit; }
            .cnav-trigger[aria-expanded="true"] .cnav-chev { transform: rotate(180deg); }

            .cnav-drop {
              position: absolute;
              top: calc(100% + 14px);
              left: 50%;
              transform: translate(-50%, -6px);
              min-width: 280px;
              padding: 8px;
              border-radius: 18px;
              background: rgba(255, 255, 255, 0.80);
              opacity: 0;
              visibility: hidden;
              pointer-events: none;
              transition: opacity .2s ease, transform .2s ease, visibility .2s;
              z-index: 10001;
            }
            .cnav-drop.is-open {
              opacity: 1;
              visibility: visible;
              pointer-events: auto;
              transform: translate(-50%, 0);
            }
            .cnav-drop::before {
              content: "";
              position: absolute;
              top: -16px;
              left: 0;
              right: 0;
              height: 16px;
            }

            /* dropdown items */
            .cnav-drop-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 14px; border-radius: 12px; text-decoration: none; color: #1a1530; }
            .cnav-drop-item:hover { background: rgba(124,58,237,0.08); }
            .cnav-drop-item .cnav-ico { width: 16px; height: 16px !important; min-width: 16px; min-height: 16px; flex: 0 0 16px; margin-top: 3px; }
            .cnav-drop-text { display: flex; flex-direction: column; }
            .cnav-drop-title { display: block; font-weight: 600; font-size: 14px; }
            .cnav-drop-desc  { display: block; font-size: 12px; opacity: 0.7; }

            .dark .cnav-drop {
              background: rgba(20, 18, 35, 0.82);
              border-color: rgba(255, 255, 255, 0.10);
            }
            .dark .cnav-drop-item { color: #f3f0ff; }

            /* mobile: icon in a soft tile for easy recognition */
            @media (max-width: 1023px) {
              .cnav-backdrop {
                position: fixed;
                inset: 0;
                z-index: 9998;
                background: rgba(20, 10, 50, 0.18);
                backdrop-filter: blur(4px);
                -webkit-backdrop-filter: blur(4px);
                opacity: 0;
                pointer-events: none;
                transition: opacity .25s ease;
              }
              .cnav-backdrop.is-open { opacity: 1; pointer-events: auto; }

              .cnav-panel {
                position: fixed;
                top: 76px;
                left: 12px;
                right: 12px;
                max-height: calc(100dvh - 96px);
                overflow-y: auto;
                overscroll-behavior: contain;
                padding: 10px;
                border-radius: 24px;
                z-index: 9999;
                background: #ffffff;
                opacity: 0;
                transform: translateY(-8px) scale(.98);
                pointer-events: none;
                visibility: hidden;
                transition: opacity .25s ease, transform .25s ease, visibility .25s;
              }
              .cnav-panel.is-open { opacity: 1; transform: none; pointer-events: auto; visibility: visible; }

              .cnav-acc-btn, .cnav-link {
                display: flex;
                align-items: center;
                gap: 14px;
                justify-content: flex-start;
                width: 100%;
                min-height: 48px;
                padding: 0 14px;
                background: none;
                border: 0;
                font: 600 16px/1 inherit;
                color: #1a1530;
                text-decoration: none;
                border-radius: 14px;
                cursor: pointer;
              }
              .cnav-acc-btn:active, .cnav-link:active { background: rgba(124,58,237,0.08); }
              .cnav-acc-btn .cnav-chev { margin-left: auto; }
              .cnav-acc-btn[aria-expanded="true"] .cnav-chev { transform: rotate(180deg); }

              .cnav-acc-btn .cnav-ico, .cnav-panel .cnav-link .cnav-ico {
                width: 22px;
                height: 22px !important;
                min-width: 22px;
                min-height: 22px;
                flex: 0 0 22px;
              }

              .cnav-sub { max-height: 0; overflow: hidden; opacity: 0; transition: max-height .3s ease, opacity .3s ease; }
              .cnav-sub.is-open { max-height: 420px; opacity: 1; }
              .cnav-sub-item { display: flex; align-items: center; gap: 10px; min-height: 44px; padding: 12px 14px 12px 20px; font-size: 15px; color: #4b4570; text-decoration: none; border-radius: 12px; }
              .cnav-sub-item:active { background: rgba(124,58,237,0.08); }
              .cnav-sub-item .cnav-ico {
                width: 16px;
                height: 16px !important;
                min-width: 16px;
                min-height: 16px;
                flex: 0 0 16px;
              }

              .cnav-cta { display: block; margin-top: 8px; padding: 14px; text-align: center; font-weight: 700; color: #fff; border-radius: 14px; background: linear-gradient(135deg,#6d28d9,#7c3aed); text-decoration: none; }

              .dark .cnav-panel {
                background: #0f172a;
                border-color: rgba(255, 255, 255, 0.08);
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
              }
              .dark .cnav-panel::after { display: none; }
              .dark .cnav-acc-btn, .dark .cnav-link { color: #f3f0ff; }
              .dark .cnav-sub-item { color: #c9c2ee; }
            }

            /* narrow desktops: keep icons, tighten spacing so the bar does not overflow */
            @media (min-width: 1024px) and (max-width: 1279px) {
              .cnav-bar { padding: 8px 12px; }
              .cnav-desktop-link, .cnav-link, .cnav-trigger {
                gap: 5px !important;
                font-size: 12.5px !important;
                padding-left: 6px !important;
                padding-right: 6px !important;
              }
              .cnav-ico { width: 16px; height: 16px !important; min-width: 16px; min-height: 16px; flex: 0 0 16px; }
              .cnav-chev { width: 14px; height: 14px !important; min-width: 14px; flex: 0 0 14px; }
            }

            @media (min-width: 1024px) { .cnav-panel, .cnav-backdrop { display: none; } }
            @media (prefers-reduced-motion: reduce) { .cnav-panel, .cnav-sub, .cnav-drop, .cnav-backdrop { transition: none; } }

            /* Prefers Reduced Transparency Accessibility */
            @media (prefers-reduced-transparency: reduce) {
              .cglass {
                background: rgba(255, 255, 255, 0.97) !important;
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
              }
              .dark .cglass {
                background: rgba(20, 18, 35, 0.97) !important;
              }
            }
          `,
        }}
      />
      <header className="cnav-header">
        <div className="cnav-glass cglass" aria-hidden="true" />
        <nav
          ref={navRef}
          aria-label="Main Navigation"
          className="cnav-bar"
        >
          {/* Brand Logo */}
          <Link
            href="/"
            aria-label="Compixor AI home"
            className="flex items-center shrink-0 group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.webp"
              alt="Compixor AI logo"
              width="44"
              height="44"
              className="h-[38px] lg:h-[44px] w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Links (>= 1024px) */}
          <ul className="hidden lg:flex items-center gap-1">
            {NAV_GROUPS.map((g) => (
              <li
                key={g.id}
                className="cnav-group"
                onMouseEnter={() => openNow(g.id)}
                onMouseLeave={closeSoon}
              >
                <button
                  type="button"
                  className="cnav-trigger rounded-xl px-2.5 xl:px-3 py-2 text-sm font-medium hover:bg-white/50 dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors duration-200"
                  aria-haspopup="true"
                  aria-expanded={openGroup === g.id}
                  onClick={() => setOpenGroup(openGroup === g.id ? null : g.id)}
                >
                  <NavIcon name={g.icon} size={18} />
                  <span>{g.label}</span>
                  <ChevronDown className="cnav-chev" size={16} />
                </button>

                <div
                  className={`cnav-drop cglass ${openGroup === g.id ? "is-open" : ""}`}
                  role="menu"
                >
                  {g.items.map((it) => (
                    <Link
                      key={it.href}
                      href={it.href}
                      role="menuitem"
                      className="cnav-drop-item"
                      onClick={() => setOpenGroup(null)}
                    >
                      <NavIcon name={it.icon} size={16} />
                      <div className="cnav-drop-text">
                        <span className="cnav-drop-title">{it.label}</span>
                        <span className="cnav-drop-desc">{it.desc}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </li>
            ))}

            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="cnav-desktop-link rounded-xl px-2.5 xl:px-3 py-2 text-sm font-medium hover:bg-white/50 dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors duration-200"
                >
                  <NavIcon name={l.icon} size={18} />
                  <span>{l.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle Dark Mode"
              className="
                cnav-theme-btn flex h-9 w-9 items-center justify-center rounded-xl
                hover:bg-white/50 dark:hover:bg-white/10
                border border-transparent hover:border-white/40
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                transition-all
              "
            >
              {mounted && dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <Link
              href="/#tools"
              className="
                hidden sm:inline-block rounded-xl bg-gradient-to-r from-[#6d28d9] to-[#7c3aed]
                px-4 py-2 text-sm font-semibold text-white
                shadow-md shadow-purple-600/25
                hover:brightness-110 hover:shadow-lg hover:shadow-purple-600/35
                active:scale-[0.98] transition-all
              "
            >
              Get Started
            </Link>

            {/* Hamburger / X button (< 1024px) */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle Menu"
              aria-expanded={mobileOpen}
              aria-controls="cnav-mobile"
              className="
                lg:hidden flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl
                hover:bg-white/50 dark:hover:bg-white/10
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                transition-colors duration-200
              "
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* after </header> — Mobile Panel and Backdrop outside header */}
      <div
        className={`cnav-backdrop ${mobileOpen ? "is-open" : ""}`}
        onClick={() => setMobileOpen(false)}
      />
      <nav
        id="cnav-mobile"
        className={`cnav-panel cglass ${mobileOpen ? "is-open" : ""}`}
        aria-hidden={!mobileOpen}
        inert={!mobileOpen ? "" : undefined}
      >
        {NAV_GROUPS.map((g) => (
          <div key={g.id} className="cnav-acc">
            <button
              type="button"
              className="cnav-acc-btn"
              aria-expanded={mobGroup === g.id}
              onClick={() => setMobGroup(mobGroup === g.id ? null : g.id)}
            >
              <NavIcon name={g.icon} size={22} />
              <span>{g.label}</span>
              <ChevronDown size={18} className="cnav-chev" />
            </button>
            <div className={`cnav-sub ${mobGroup === g.id ? "is-open" : ""}`}>
              {g.items.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  className="cnav-sub-item"
                  onClick={() => setMobileOpen(false)}
                >
                  <NavIcon name={it.icon} size={16} />
                  <span>{it.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
        {NAV_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="cnav-link"
            onClick={() => setMobileOpen(false)}
          >
            <NavIcon name={l.icon} size={22} />
            <span>{l.label}</span>
          </Link>
        ))}
        <Link
          href="/#tools"
          className="cnav-cta"
          onClick={() => setMobileOpen(false)}
        >
          Get Started
        </Link>
      </nav>
    </>
  );
}
