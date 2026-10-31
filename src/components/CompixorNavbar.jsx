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

const navItems = [
  { name: "PDF Tools", href: "/tools/pdf-compressor", icon: Files, accent: "text-indigo-400" },
  { name: "Word Tools", href: "/tools/word-compressor", icon: FileText, accent: "text-purple-400" },
  { name: "Passport Photo", href: "/tools/passport-photo", icon: Camera, accent: "text-sky-400" },
  { name: "Full DP", href: "/tools/full-dp-maker", icon: Maximize2, accent: "text-emerald-400" },
  { name: "QR Generator", href: "/tools/qr-generator", icon: QrCode, accent: "text-amber-400" },
  { name: "Blogs", href: "/blog", icon: BookOpen, accent: "text-pink-400" },
  { name: "About", href: "/about", icon: Info, accent: "text-violet-400" },
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

  // Glass dynamics on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on Escape and when resizing to desktop
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth >= 1024 && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-3 sm:top-4 z-50 mx-auto w-full max-w-6xl px-3 sm:px-4">
      <nav
        aria-label="Main Navigation"
        className={`
          flex items-center justify-between
          rounded-full px-4 sm:px-6 py-2.5 sm:py-3
          ${
            scrolled
              ? "bg-zinc-950/85 backdrop-blur-2xl border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.65),inset_0_1px_0_0_rgba(255,255,255,0.2)]"
              : "bg-zinc-950/75 backdrop-blur-xl border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.15)]"
          }
          border transition-all duration-300
        `}
      >
        {/* Brand Logo */}
        <a href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <span className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
            COMPIXOR<span className="text-indigo-400">.AI</span>
          </span>
        </a>

        {/* Desktop Links (Visible on Laptop / Desktop screens >= 1024px) */}
        <ul className="hidden lg:flex items-center gap-1 xl:gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <a
                  href={item.href}
                  className="
                    flex items-center gap-1.5 rounded-full px-3 py-1.5
                    text-xs xl:text-sm font-medium text-zinc-300 hover:text-white
                    hover:bg-white/10
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                    transition-all duration-200
                  "
                >
                  <Icon className={`h-3.5 w-3.5 ${item.accent}`} />
                  <span>{item.name}</span>
                </a>
              </li>
            );
          })}
        </ul>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Dark Mode"
            className="
              flex h-9 w-9 items-center justify-center rounded-full
              text-zinc-300 hover:text-white
              hover:bg-white/10
              border border-transparent hover:border-white/10
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
              transition-all
            "
          >
            {mounted && dark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-zinc-300" />}
          </button>

          <a
            href="/#tools"
            className="
              hidden sm:inline-flex items-center justify-center rounded-full
              bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600
              px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-white
              shadow-md shadow-purple-600/30 border border-white/20
              hover:brightness-110 hover:shadow-lg hover:shadow-purple-600/40 hover:scale-[1.02]
              active:scale-[0.98] transition-all
            "
          >
            Get Started
          </a>

          {/* Hamburger (below lg) */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle Menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="
              lg:hidden flex h-9 w-9 items-center justify-center rounded-full
              text-zinc-300 hover:text-white
              hover:bg-white/10
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
            className="fixed inset-0 -z-10 lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-menu"
            className="
              lg:hidden mt-2.5 rounded-3xl p-3.5
              bg-zinc-950/95 backdrop-blur-2xl
              border border-white/15
              shadow-2xl shadow-black/80
            "
          >
            <ul className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="
                        flex items-center gap-3 rounded-2xl px-3.5 py-3
                        text-sm font-medium text-zinc-200 hover:text-white
                        hover:bg-white/10
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
                mt-3 block rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600
                px-4 py-3 text-center text-sm font-semibold text-white
                shadow-md shadow-purple-600/30 border border-white/20
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
