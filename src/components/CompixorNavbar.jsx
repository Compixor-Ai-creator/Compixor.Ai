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
  Moon,
  Sun,
  Sparkles,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { NAV_GROUPS, NAV_LINKS } from "./nav-data";

const GROUP_ICONS = {
  pdf: { icon: Files, accent: "text-indigo-600 dark:text-indigo-400" },
  word: { icon: FileText, accent: "text-purple-600 dark:text-purple-400" },
};

const LINK_ICONS = {
  "/tools/passport-photo": { icon: Camera, accent: "text-slate-700 dark:text-slate-200" },
  "/tools/full-dp-maker": { icon: Maximize2, accent: "text-slate-700 dark:text-slate-200" },
  "/tools/qr-generator": { icon: QrCode, accent: "text-slate-700 dark:text-slate-200" },
  "/blog": { icon: BookOpen, accent: "text-slate-700 dark:text-slate-200" },
  "/about": { icon: Info, accent: "text-slate-700 dark:text-slate-200" },
};

export default function CompixorNavbar() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  // Theme: saved choice -> else system preference
  useEffect(() => {
    let isDark = false;
    try {
      const saved = localStorage.getItem("compixor-theme");
      isDark = saved
        ? saved === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch (e) {}
    document.documentElement.classList.toggle("dark", isDark);
    setDark(isDark);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("compixor-theme", next ? "dark" : "light");
    } catch (e) {}
  };

  // Slightly stronger glass after scrolling
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const glass = `
    backdrop-blur-md backdrop-saturate-[180%]
    border border-white/60 dark:border-white/15
    shadow-[0_8px_32px_0_rgba(31,38,135,0.08),inset_0_1px_0_0_rgba(255,255,255,0.65)]
    dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.12)]
  `;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* Desktop Dropdowns (>= 1024px) */
            .cnav-group { position: relative; }
            .cnav-trigger { display:flex; align-items:center; gap:6px; background:none; border:0; cursor:pointer; font: inherit; color: inherit; }
            .cnav-chev { transition: transform .2s ease; }
            .cnav-trigger[aria-expanded="true"] .cnav-chev { transform: rotate(180deg); }

            .cnav-drop {
              position: absolute; top: calc(100% + 14px); left: 50%;
              transform: translate(-50%, -6px);
              min-width: 280px; padding: 8px; border-radius: 18px;
              background: rgba(255,255,255,0.88);
              backdrop-filter: blur(24px) saturate(180%);
              -webkit-backdrop-filter: blur(24px) saturate(180%);
              border: 1px solid rgba(255,255,255,0.6);
              box-shadow: 0 20px 50px rgba(88,60,200,0.18);
              opacity: 0; visibility: hidden; pointer-events: none;
              transition: opacity .2s ease, transform .2s ease, visibility .2s;
              z-index: 10001;
            }
            .cnav-drop.is-open { opacity: 1; visibility: visible; pointer-events: auto; transform: translate(-50%, 0); }
            .cnav-drop::before { content:""; position:absolute; top:-16px; left:0; right:0; height:16px; } /* hover bridge */

            .cnav-drop-item { display:block; padding:10px 14px; border-radius:12px; text-decoration:none; color:#1a1530; }
            .cnav-drop-item:hover { background: rgba(124,58,237,0.08); }
            .cnav-drop-title { display:block; font-weight:600; font-size:14px; }
            .cnav-drop-desc  { display:block; font-size:12px; opacity:.65; }

            .dark .cnav-drop { background: rgba(20,18,35,0.88); border-color: rgba(255,255,255,0.08); }
            .dark .cnav-drop-item { color:#f3f0ff; }

            /* Mobile Menu (< 1024px) */
            @media (max-width: 1023px) {
              .cnav-backdrop {
                position: fixed; inset: 0; z-index: 9998;
                background: rgba(20,10,50,0.25);
                backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
                opacity: 0; pointer-events: none; transition: opacity .25s ease;
              }
              .cnav-backdrop.is-open { opacity: 1; pointer-events: auto; }

              .cnav-panel {
                position: fixed; top: 84px; left: 12px; right: 12px;
                max-height: calc(100dvh - 104px); overflow-y: auto; overscroll-behavior: contain;
                padding: 10px; border-radius: 24px; z-index: 9999;
                background: rgba(255,255,255,0.88);
                backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%);
                border: 1px solid rgba(255,255,255,0.6);
                box-shadow: 0 20px 50px rgba(88,60,200,0.18);
                opacity: 0; transform: translateY(-8px) scale(.98); pointer-events: none;
                transition: opacity .25s ease, transform .25s ease;
              }
              .cnav-panel.is-open { opacity: 1; transform: none; pointer-events: auto; }

              .cnav-acc-btn, .cnav-link {
                display:flex; align-items:center; justify-content:space-between;
                width:100%; min-height:48px; padding:0 14px; background:none; border:0;
                font: 600 16px/1 inherit; color:#1a1530; text-decoration:none; border-radius:14px; cursor:pointer;
              }
              .cnav-acc-btn:active, .cnav-link:active { background: rgba(124,58,237,0.08); }
              .cnav-acc-btn[aria-expanded="true"] .cnav-chev { transform: rotate(180deg); }

              .cnav-sub { max-height:0; overflow:hidden; opacity:0; transition: max-height .3s ease, opacity .3s ease; }
              .cnav-sub.is-open { max-height: 420px; opacity: 1; }
              .cnav-sub-item { display:block; min-height:44px; padding:12px 14px 12px 30px; font-size:15px; color:#4b4570; text-decoration:none; border-radius:12px; }
              .cnav-sub-item:active { background: rgba(124,58,237,0.08); }

              .cnav-cta { display:block; margin-top:8px; padding:14px; text-align:center; font-weight:700; color:#fff; border-radius:14px; background: linear-gradient(135deg,#6d28d9,#7c3aed); text-decoration:none; }

              .dark .cnav-panel { background: rgba(20,18,35,0.9); border-color: rgba(255,255,255,0.08); }
              .dark .cnav-acc-btn, .dark .cnav-link { color:#f3f0ff; }
              .dark .cnav-sub-item { color:#c9c2ee; }
            }
            @media (min-width: 1024px) { .cnav-panel, .cnav-backdrop { display:none; } }
            @media (prefers-reduced-motion: reduce) { .cnav-panel, .cnav-sub, .cnav-drop, .cnav-backdrop { transition: none; } }
            @supports not (backdrop-filter: blur(1px)) { .cnav-panel, .cnav-drop { background: rgba(255,255,255,0.97); } }
          `,
        }}
      />
      <header className="fixed inset-x-0 top-4 z-[10000] mx-auto w-full max-w-[1280px] px-4">
        <nav
          ref={navRef}
          aria-label="Main Navigation"
          className={`
            flex items-center justify-between
            rounded-2xl px-5 py-3
            ${scrolled ? "bg-white/65 dark:bg-slate-900/60" : "bg-white/55 dark:bg-slate-900/50"}
            ${glass}
            transition-all duration-300
          `}
        >
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
              COMPIXOR.AI
            </span>
          </Link>

          {/* Desktop Links (>= 1024px) */}
          <ul className="hidden lg:flex items-center gap-1">
            {NAV_GROUPS.map((g) => {
              const groupMeta = GROUP_ICONS[g.id];
              const Icon = groupMeta?.icon;
              return (
                <li
                  key={g.id}
                  className="cnav-group"
                  onMouseEnter={() => openNow(g.id)}
                  onMouseLeave={closeSoon}
                >
                  <button
                    type="button"
                    className="cnav-trigger flex items-center gap-1.5 rounded-xl px-2.5 xl:px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 hover:bg-white/50 dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors duration-200 whitespace-nowrap"
                    aria-haspopup="true"
                    aria-expanded={openGroup === g.id}
                    onClick={() => setOpenGroup(openGroup === g.id ? null : g.id)}
                  >
                    {Icon && <Icon className={`h-4 w-4 ${groupMeta.accent}`} />}
                    <span>{g.label}</span>
                    <ChevronDown className="cnav-chev" size={14} />
                  </button>

                  <div
                    className={`cnav-drop ${openGroup === g.id ? "is-open" : ""}`}
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
                        <span className="cnav-drop-title">{it.label}</span>
                        <span className="cnav-drop-desc">{it.desc}</span>
                      </Link>
                    ))}
                  </div>
                </li>
              );
            })}

            {NAV_LINKS.map((l) => {
              const linkMeta = LINK_ICONS[l.href];
              const Icon = linkMeta?.icon;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="flex items-center gap-1.5 rounded-xl px-2.5 xl:px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 hover:bg-white/50 dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors duration-200 whitespace-nowrap"
                  >
                    {Icon && <Icon className={`h-4 w-4 ${linkMeta.accent}`} />}
                    <span>{l.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle Dark Mode"
              className="
                flex h-9 w-9 items-center justify-center rounded-xl
                text-slate-700 dark:text-slate-200
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
                lg:hidden flex h-9 w-9 items-center justify-center rounded-xl
                text-slate-700 dark:text-slate-200
                hover:bg-white/50 dark:hover:bg-white/10
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                transition-all
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
        className={`cnav-panel ${mobileOpen ? "is-open" : ""}`}
        aria-hidden={!mobileOpen}
      >
        {NAV_GROUPS.map((g) => (
          <div key={g.id} className="cnav-acc">
            <button
              type="button"
              className="cnav-acc-btn"
              aria-expanded={mobGroup === g.id}
              onClick={() => setMobGroup(mobGroup === g.id ? null : g.id)}
            >
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
                  {it.label}
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
            {l.label}
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
