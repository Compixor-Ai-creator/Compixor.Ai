'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeProvider';
import {
  Sun,
  Moon,
  Menu,
  X,
  FileDown,
  FileText,
  Camera,
  QrCode,
  Sparkles,
  Info,
  Files,
  Stamp,
  Eraser,
  ChevronDown,
  Lock,
  Unlock,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/SocialIcons';

export interface PdfToolItem {
  href: string;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  badge?: string;
}

export interface PdfCategoryGroup {
  category: string;
  tools: PdfToolItem[];
}

export const pdfCategories: PdfCategoryGroup[] = [
  {
    category: 'Compress & Organize',
    tools: [
      {
        href: '/tools/pdf-compressor',
        label: 'PDF Compressor',
        subtitle: 'Reduce file size without quality loss',
        icon: FileDown,
        gradient: 'from-rose-500 to-red-600',
        badge: 'Popular',
      },
      {
        href: '/tools/pdf-organizer',
        label: 'PDF Merge & Split',
        subtitle: 'Combine or split pages locally',
        icon: Files,
        gradient: 'from-blue-500 to-indigo-600',
      },
    ],
  },
  {
    category: 'Watermark & Redaction',
    tools: [
      {
        href: '/tools/add-watermark',
        label: 'Add PDF Watermark',
        subtitle: 'Stamp text or logo onto PDF',
        icon: Stamp,
        gradient: 'from-pink-500 to-rose-600',
        badge: 'New',
      },
      {
        href: '/tools/remove-watermark',
        label: 'Remove PDF Watermark',
        subtitle: 'Clean stamps and watermark layers',
        icon: Eraser,
        gradient: 'from-amber-500 to-orange-600',
      },
    ],
  },
  {
    category: 'Security & Access',
    tools: [
      {
        href: '/tools/protect-pdf',
        label: 'Protect PDF',
        subtitle: 'Add AES-256 password protection',
        icon: Lock,
        gradient: 'from-indigo-600 to-purple-600',
        badge: 'AES-256',
      },
      {
        href: '/tools/unlock-pdf',
        label: 'Unlock PDF',
        subtitle: 'Remove password and restrictions',
        icon: Unlock,
        gradient: 'from-emerald-500 to-teal-600',
      },
    ],
  },
];

export const pdfToolsList: PdfToolItem[] = pdfCategories.flatMap((c) => c.tools);

const topLevelNavLinks = [
  { href: '/tools/word-compressor', label: 'Word Compressor', icon: FileText },
  { href: '/tools/passport-photo', label: 'Passport Photo Maker', icon: Camera },
  { href: '/tools/full-dp-maker', label: 'Full DP Maker', icon: WhatsAppIcon },
  { href: '/tools/qr-generator', label: 'QR Generator', icon: QrCode },
  { href: '/about', label: 'About', icon: Info },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pdfDropdownOpen, setPdfDropdownOpen] = useState(false);
  const [mobilePdfAccordionOpen, setMobilePdfAccordionOpen] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if any PDF tool is the current active route
  const isPdfRouteActive =
    pathname.startsWith('/tools/pdf-') ||
    pathname === '/tools/add-watermark' ||
    pathname === '/tools/remove-watermark' ||
    pathname === '/tools/protect-pdf' ||
    pathname === '/tools/unlock-pdf';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setPdfDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setPdfDropdownOpen(false);
  }, [pathname]);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setPdfDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setPdfDropdownOpen(false);
    }, 180);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 glass-nav ${
          scrolled ? 'shadow-lg' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold font-display tracking-tight whitespace-nowrap">
                <span className="text-gradient">COMPIXOR</span>
                <span className="text-brand-500 dark:text-brand-400">.AI</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-1.5">
              {/* PDF Tools Unified Dropdown */}
              <div
                ref={dropdownRef}
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => setPdfDropdownOpen((prev) => !prev)}
                  aria-expanded={pdfDropdownOpen}
                  aria-haspopup="true"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isPdfRouteActive || pdfDropdownOpen
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-brand-600 dark:hover:text-brand-300 hover:bg-brand-500/5'
                  }`}
                >
                  <Files className="w-4 h-4 text-brand-500 shrink-0" />
                  <span>PDF Tools</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      pdfDropdownOpen ? 'rotate-180 text-brand-500' : 'text-zinc-400'
                    }`}
                  />
                </button>

                {/* Dropdown Floating Menu */}
                <AnimatePresence>
                  {pdfDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="absolute left-0 mt-2.5 w-[560px] rounded-3xl p-4 sm:p-5 z-50 bg-white/98 dark:bg-zinc-900/98 backdrop-blur-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl"
                    >
                      {/* Top Header Tag */}
                      <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-zinc-100 dark:border-zinc-800/80">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                            Client-Side PDF Toolkit
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300">
                          6 Precision Tools
                        </span>
                      </div>

                      {/* 2-Column Categorized Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Column 1: Compress & Organize + Watermark */}
                        <div className="space-y-4">
                          {pdfCategories.slice(0, 2).map((group) => (
                            <div key={group.category} className="space-y-1">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2">
                                {group.category}
                              </p>
                              <div className="space-y-1">
                                {group.tools.map((item) => {
                                  const isCurrent =
                                    pathname === item.href ||
                                    (item.href === '/tools/pdf-watermark' && pathname === '/tools/add-watermark');
                                  const Icon = item.icon;
                                  return (
                                    <Link
                                      key={item.href}
                                      href={item.href}
                                      onClick={() => setPdfDropdownOpen(false)}
                                      className={`group flex items-center gap-3 p-2 rounded-2xl transition-all duration-150 ${
                                        isCurrent
                                          ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300'
                                          : 'text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/70 hover:text-brand-600 dark:hover:text-brand-400'
                                      }`}
                                    >
                                      {/* Vibrant Rounded Icon Badge */}
                                      <div
                                        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200`}
                                      >
                                        <Icon className="w-4 h-4" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                          <p className="text-xs font-bold leading-tight truncate">
                                            {item.label}
                                          </p>
                                          {item.badge && (
                                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-brand-500/10 text-brand-600 dark:text-brand-300 shrink-0">
                                              {item.badge}
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug line-clamp-1">
                                          {item.subtitle}
                                        </p>
                                      </div>
                                      <ArrowRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Column 2: Security & Privacy + Client-Side Privacy Card */}
                        <div className="space-y-4 flex flex-col justify-between">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2">
                              {pdfCategories[2].category}
                            </p>
                            <div className="space-y-1">
                              {pdfCategories[2].tools.map((item) => {
                                const isCurrent = pathname === item.href;
                                const Icon = item.icon;
                                return (
                                  <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setPdfDropdownOpen(false)}
                                    className={`group flex items-center gap-3 p-2 rounded-2xl transition-all duration-150 ${
                                      isCurrent
                                        ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300'
                                        : 'text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/70 hover:text-brand-600 dark:hover:text-brand-400'
                                    }`}
                                  >
                                    <div
                                      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200`}
                                    >
                                      <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5">
                                        <p className="text-xs font-bold leading-tight truncate">
                                          {item.label}
                                        </p>
                                        {item.badge && (
                                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0">
                                            {item.badge}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug line-clamp-1">
                                        {item.subtitle}
                                      </p>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                                  </Link>
                                );
                              })}
                            </div>
                          </div>

                          {/* Privacy Highlight Card */}
                          <div className="p-3 rounded-2xl bg-gradient-to-br from-brand-500/10 via-purple-500/5 to-zinc-50 dark:to-zinc-800/40 border border-brand-500/20 dark:border-brand-400/20">
                            <div className="flex items-center gap-1.5 mb-1">
                              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                              <span className="text-xs font-bold text-zinc-900 dark:text-white">
                                100% Client-Side Privacy
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                              Documents process in device RAM — zero bytes leave your computer.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Dropdown Bottom Banner */}
                      <div className="mt-3.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between px-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Zero Cloud Uploads · Instant In-Browser
                        </span>
                        <Link
                          href="/#tools"
                          onClick={() => setPdfDropdownOpen(false)}
                          className="font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                        >
                          View All 10 Tools &rarr;
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Remaining Top-Level Nav Links */}
              {topLevelNavLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold whitespace-nowrap shrink-0 transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300 shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-brand-600 dark:hover:text-brand-300 hover:bg-brand-500/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="whitespace-nowrap">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-brand-500/10 text-zinc-600 dark:text-zinc-400 cursor-pointer"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 transition-transform duration-300 hover:rotate-45" />
                ) : (
                  <Moon className="w-5 h-5 transition-transform duration-300 hover:-rotate-12" />
                )}
              </button>

              {/* Get Started Button Desktop */}
              <Link
                href="/tools/pdf-compressor"
                className="hidden sm:inline-flex btn-primary text-xs font-semibold py-2.5 px-4"
              >
                Get Started
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer with Slide Blur Effect */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 top-16 z-40 bg-white/90 dark:bg-surface-950/90 backdrop-blur-2xl lg:hidden p-6 flex flex-col justify-between border-t border-zinc-200/60 dark:border-zinc-800/60 shadow-2xl overflow-y-auto"
          >
            <div className="space-y-3">
              {/* Mobile PDF Tools Accordion */}
              <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-surface-900/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setMobilePdfAccordionOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between p-3.5 text-base font-bold text-zinc-900 dark:text-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500">
                      <Files className="w-4 h-4" />
                    </div>
                    <span>PDF Tools</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                      mobilePdfAccordionOpen ? 'rotate-180 text-brand-500' : ''
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {mobilePdfAccordionOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-zinc-200/60 dark:border-zinc-800/60 px-2 py-2 space-y-1"
                    >
                      <div className="space-y-3 py-1">
                        {pdfCategories.map((group) => (
                          <div key={group.category} className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2.5 pt-1">
                              {group.category}
                            </p>
                            <div className="space-y-1">
                              {group.tools.map((item) => {
                                const isCurrent =
                                  pathname === item.href ||
                                  (item.href === '/tools/pdf-watermark' && pathname === '/tools/add-watermark');
                                const Icon = item.icon;
                                return (
                                  <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 p-2.5 rounded-xl transition ${
                                      isCurrent
                                        ? 'bg-brand-500 text-white shadow-glow'
                                        : 'text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5'
                                    }`}
                                  >
                                    <div
                                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shrink-0 shadow-xs`}
                                    >
                                      <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-semibold leading-tight">{item.label}</p>
                                      <p
                                        className={`text-xs mt-0.5 ${
                                          isCurrent ? 'text-white/80' : 'text-zinc-500 dark:text-zinc-400'
                                        }`}
                                      >
                                        {item.subtitle}
                                      </p>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Other Mobile Nav Links */}
              {topLevelNavLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl text-base font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-500 text-white shadow-glow'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60 space-y-4">
              <Link
                href="/tools/pdf-compressor"
                onClick={() => setMobileOpen(false)}
                className="w-full btn-primary flex items-center justify-center py-3.5 text-sm font-semibold"
              >
                Start Compressing Files
              </Link>
              <p className="text-center text-xs text-zinc-400">
                100% Client-Side • Zero Server Uploads
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

