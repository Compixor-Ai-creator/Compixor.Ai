"use client";

import React, { useEffect, useState } from "react";
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
} from "lucide-react";

// NOTE: apni real routes yahan daalein (abhi "#" anchors hain, sirf href badlein).
const navItems = [
  { name: "PDF Tools", href: "/tools/pdf-compressor", icon: Files, accent: "text-indigo-600 dark:text-indigo-400" },
  { name: "Word Tools", href: "/tools/word-compressor", icon: FileText, accent: "text-purple-600 dark:text-purple-400" },
  { name: "Passport Photo Maker", href: "/tools/passport-photo", icon: Camera, accent: "text-slate-700 dark:text-slate-200" },
  { name: "Full DP Maker", href: "/tools/full-dp-maker", icon: Maximize2, accent: "text-slate-700 dark:text-slate-200" },
  { name: "QR Generator", href: "/tools/qr-generator", icon: QrCode, accent: "text-slate-700 dark:text-slate-200" },
  { name: "Blogs & Guides", href: "/blog", icon: BookOpen, accent: "text-slate-700 dark:text-slate-200" },
  { name: "About", href: "/about", icon: Info, accent: "text-slate-700 dark:text-slate-200" },
];

export default function CompixorNavbar() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  // Close mobile menu on Escape and when resizing to desktop
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth >= 1280 && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const glass = `
    backdrop-blur-md backdrop-saturate-[180%]
    border border-white/60 dark:border-white/15
    shadow-[0_8px_32px_0_rgba(31,38,135,0.08),inset_0_1px_0_0_rgba(255,255,255,0.65)]
    dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.12)]
  `;

  return (
    <header className="fixed inset-x-0 top-4 z-50 mx-auto w-full max-w-[1280px] px-4">
      <nav
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
        <a href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
            COMPIXOR.AI
          </span>
        </a>

        {/* Desktop Links */}
        <ul className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <a
                  href={item.href}
                  className="
                    flex items-center gap-1.5 rounded-xl px-3 py-2
                    text-sm font-medium text-slate-900 dark:text-slate-100
                    hover:bg-white/50 dark:hover:bg-white/10
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                    transition-colors duration-200 whitespace-nowrap
                  "
                >
                  <Icon className={`h-4 w-4 ${item.accent}`} />
                  <span>{item.name}</span>
                </a>
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

          <a
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
          </a>

          {/* Hamburger (below xl) */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle Menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="
              xl:hidden flex h-9 w-9 items-center justify-center rounded-xl
              text-slate-700 dark:text-slate-200
              hover:bg-white/50 dark:hover:bg-white/10
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
              transition-all
            "
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {open && (
        <>
          {/* click-outside layer */}
          <div
            className="fixed inset-0 -z-10 xl:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-menu"
            className={`
              xl:hidden mt-2 rounded-2xl p-3
              bg-white/70 dark:bg-slate-900/70
              ${glass}
            `}
          >
            <ul className="flex flex-col">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="
                        flex items-center gap-3 rounded-xl px-3 py-3
                        text-sm font-medium text-slate-900 dark:text-slate-100
                        hover:bg-white/50 dark:hover:bg-white/10
                        transition-colors
                      "
                    >
                      <Icon className={`h-4 w-4 ${item.accent}`} />
                      <span>{item.name}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
            <a
              href="/#tools"
              onClick={() => setOpen(false)}
              className="
                mt-2 block rounded-xl bg-gradient-to-r from-[#6d28d9] to-[#7c3aed]
                px-4 py-3 text-center text-sm font-semibold text-white
                shadow-md shadow-purple-600/25
              "
            >
              Get Started
            </a>
          </div>
        </>
      )}
    </header>
  );
}
