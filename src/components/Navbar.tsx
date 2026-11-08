'use client';
// Phase 3 mobile-optimize

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  BookOpen,
  Search,
} from 'lucide-react';
import FullDpIcon from '@/components/FullDpIcon';

const FullDpNavIcon = (props: any) => <FullDpIcon variant="compact" {...props} />;
import {
  tools,
  pdfCategories,
  pdfToolsList,
  wordCategories,
  wordToolsList,
  type ToolItem as PdfToolItem,
  type PdfCategoryGroup,
} from '@/data/tools';

const topLevelNavLinks = [
  { href: '/tools/passport-photo', label: 'Passport Photo Maker', icon: Camera },
  { href: '/tools/full-dp-maker', label: 'Full DP Maker', icon: FullDpNavIcon },
  { href: '/tools/qr-generator', label: 'QR Generator', icon: QrCode },
  { href: '/blog', label: 'Blogs & Guides', icon: BookOpen },
  { href: '/about', label: 'About', icon: Info },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pdfDropdownOpen, setPdfDropdownOpen] = useState(false);
  const [mobilePdfAccordionOpen, setMobilePdfAccordionOpen] = useState(true);
  const [wordDropdownOpen, setWordDropdownOpen] = useState(false);
  const [mobileWordAccordionOpen, setMobileWordAccordionOpen] = useState(true);

  // Tool search state
  const [toolQuery, setToolQuery] = useState('');
  const [toolSearchOpen, setToolSearchOpen] = useState(false);
  const toolSearchRef = useRef<HTMLDivElement>(null);
  const toolInputRef = useRef<HTMLInputElement>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wordDropdownRef = useRef<HTMLDivElement>(null);
  const wordHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time tool search filter
  const matchingTools = toolQuery.trim()
    ? tools.filter((t) => {
        const q = toolQuery.toLowerCase().trim();
        return (
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tagline.toLowerCase().includes(q) ||
          t.href.toLowerCase().includes(q) ||
          (t.badge ? t.badge.toLowerCase().includes(q) : false)
        );
      })
    : [];

  // Check if any PDF tool is the current active route
  const isPdfRouteActive =
    pathname.startsWith('/tools/pdf-') ||
    pathname === '/tools/add-watermark' ||
    pathname === '/tools/remove-watermark' ||
    pathname === '/tools/protect-pdf' ||
    pathname === '/tools/unlock-pdf';

  const isWordRouteActive =
    pathname === '/tools/word-compressor' ||
    pathname === '/tools/pdf-to-word' ||
    pathname === '/tools/img-to-word';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside to close dropdowns & search
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setPdfDropdownOpen(false);
      }
      if (wordDropdownRef.current && !wordDropdownRef.current.contains(event.target as Node)) {
        setWordDropdownOpen(false);
      }
      if (toolSearchRef.current && !toolSearchRef.current.contains(event.target as Node)) {
        setToolSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K or Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toolInputRef.current?.focus();
        setToolSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setToolSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setPdfDropdownOpen(false);
    setWordDropdownOpen(false);
    setToolSearchOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setPdfDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setPdfDropdownOpen(false);
    }, 180);
  };

  const handleWordMouseEnter = () => {
    if (wordHoverTimeoutRef.current) clearTimeout(wordHoverTimeoutRef.current);
    setWordDropdownOpen(true);
  };

  const handleWordMouseLeave = () => {
    wordHoverTimeoutRef.current = setTimeout(() => {
      setWordDropdownOpen(false);
    }, 180);
  };

  const handleToolSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (matchingTools.length > 0) {
      router.push(matchingTools[0].href);
      setToolSearchOpen(false);
      setToolQuery('');
    } else {
      router.push('/#tools');
      setToolSearchOpen(false);
    }
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      >
        {/* Decoupled Frosted Glass Surface */}
        <div
          className={`absolute inset-0 -z-10 pointer-events-none glass-nav ${
            scrolled ? 'shadow-lg' : ''
          }`}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
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
                <div
                  className={`absolute left-0 mt-2.5 w-[560px] rounded-[20px] p-4 sm:p-5 z-50 dropdown-glass transition-all duration-200 ${
                    pdfDropdownOpen
                      ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                      : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/60 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                        PDF Utilities
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300">
                      {pdfToolsList.length} Tools
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {pdfCategories.map((group) => (
                      <div key={group.category} className="space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2">
                          {group.category}
                        </div>
                        <div className="space-y-1">
                          {group.tools.map((item) => {
                            const isCurrent = pathname === item.href;
                            const Icon = item.navIcon || item.icon;
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setPdfDropdownOpen(false)}
                                className={`group flex items-start gap-2.5 p-2 rounded-xl transition-all duration-150 ${
                                  isCurrent
                                    ? 'bg-brand-500/15 text-brand-600 dark:text-brand-300 font-bold'
                                    : 'hover:bg-brand-500/10 text-zinc-700 dark:text-zinc-300 hover:text-brand-600 dark:hover:text-brand-300'
                                }`}
                              >
                                <div className="p-1 rounded-lg bg-brand-500/10 text-brand-500 shrink-0 mt-0.5">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-bold leading-tight truncate">
                                    {item.label}
                                  </div>
                                  <div
                                    className={`text-[11px] mt-0.5 leading-snug line-clamp-1 ${
                                      isCurrent ? 'text-brand-600/70 dark:text-brand-300/70' : 'text-zinc-500 dark:text-zinc-400'
                                    }`}
                                  >
                                    {item.subtitle}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between px-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Private &amp; Secure · Zero Retention
                    </span>
                    <Link
                      href="/#tools"
                      onClick={() => setPdfDropdownOpen(false)}
                      className="font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                    >
                      View All {tools.length} Tools &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              {/* Word Tools Unified Dropdown */}
              <div
                ref={wordDropdownRef}
                className="relative"
                onMouseEnter={handleWordMouseEnter}
                onMouseLeave={handleWordMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => setWordDropdownOpen((prev) => !prev)}
                  aria-expanded={wordDropdownOpen}
                  aria-haspopup="true"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isWordRouteActive || wordDropdownOpen
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-brand-600 dark:hover:text-brand-300 hover:bg-brand-500/5'
                  }`}
                >
                  <FileText className="w-4 h-4 text-brand-500 shrink-0" />
                  <span>Word Tools</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      wordDropdownOpen ? 'rotate-180 text-brand-500' : 'text-zinc-400'
                    }`}
                  />
                </button>

                <div
                  className={`absolute left-0 mt-2.5 w-[380px] rounded-[20px] p-4 sm:p-5 z-50 dropdown-glass transition-all duration-200 ${
                    wordDropdownOpen
                      ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                      : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/60 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                        Word &amp; DOCX Tools
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300">
                      3 Tools
                    </span>
                  </div>

                  <div className="space-y-1">
                    {wordToolsList.map((item) => {
                      const isCurrent = pathname === item.href;
                      const Icon = item.navIcon || item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setWordDropdownOpen(false)}
                          className={`group flex items-start gap-2.5 p-2 rounded-xl transition-all duration-150 ${
                            isCurrent
                              ? 'bg-brand-500/15 text-brand-600 dark:text-brand-300 font-bold'
                              : 'hover:bg-brand-500/10 text-zinc-700 dark:text-zinc-300 hover:text-brand-600 dark:hover:text-brand-300'
                          }`}
                        >
                          <div className="p-1 rounded-lg bg-brand-500/10 text-brand-500 shrink-0 mt-0.5">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold leading-tight truncate">
                              {item.label}
                            </div>
                            <div
                              className={`text-[11px] mt-0.5 leading-snug line-clamp-1 ${
                                isCurrent ? 'text-brand-600/70 dark:text-brand-300/70' : 'text-zinc-500 dark:text-zinc-400'
                              }`}
                            >
                              {item.subtitle}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Privacy-First Architecture
                    </span>
                    <span className="font-semibold text-brand-600 dark:text-brand-400">Fast &amp; Secure</span>
                  </div>
                </div>
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
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* Tool Search Bar (Desktop) with WebMCP Compliance */}
              <div ref={toolSearchRef} className="relative hidden md:block">
                <form
                  id="compixor-tool-submit-form"
                  action="#tools"
                  method="GET"
                  onSubmit={handleToolSearchSubmit}
                  // @ts-expect-error declarative WebMCP attribute
                  toolname="submitQuestion"
                  tooldescription="Submit a question or find a specific browser tool on Compixor"
                  className="relative flex items-center"
                >
                  <label htmlFor="tool-query-input" className="sr-only">
                    Ask or Find Tool
                  </label>
                  <Search className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 absolute left-3 pointer-events-none" />
                  <input
                    ref={toolInputRef}
                    id="tool-query-input"
                    name="question"
                    type="search"
                    value={toolQuery}
                    onChange={(e) => {
                      setToolQuery(e.target.value);
                      setToolSearchOpen(true);
                    }}
                    onFocus={() => setToolSearchOpen(true)}
                    placeholder="Find tool (e.g. merge, compress)..."
                    // @ts-expect-error declarative WebMCP attribute
                    toolparamdescription="Question text or tool name"
                    data-tool-param-description="Question text or tool name"
                    className="w-40 xl:w-52 pl-8 pr-10 py-1.5 rounded-xl text-xs bg-white/70 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 backdrop-blur-md transition-all duration-200 focus:w-56 xl:focus:w-64 shadow-xs"
                    autoComplete="off"
                    required
                  />
                  <kbd className="hidden xl:inline-flex items-center gap-0.5 absolute right-2 px-1.5 py-0.5 text-[9px] font-mono font-semibold text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-700/60 rounded border border-zinc-200/80 dark:border-zinc-600/60 pointer-events-none">
                    ⌘K
                  </kbd>
                </form>

                {/* Live Real-Time Dropdown */}
                {toolSearchOpen && toolQuery.trim().length > 0 && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl p-2.5 z-50 dropdown-glass shadow-xl border border-zinc-200/80 dark:border-zinc-800/80 max-h-96 overflow-y-auto animate-in fade-in duration-150">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 mb-1">
                      <span>Matching Tools ({matchingTools.length})</span>
                      <span className="text-[10px] text-brand-600 dark:text-brand-400 font-normal">Press Enter to open</span>
                    </div>
                    {matchingTools.length > 0 ? (
                      <div className="space-y-1">
                        {matchingTools.map((t) => {
                          const Icon = t.navIcon || t.icon;
                          return (
                            <Link
                              key={t.href}
                              href={t.href}
                              onClick={() => {
                                setToolSearchOpen(false);
                                setToolQuery('');
                              }}
                              className="group flex items-center gap-3 p-2 rounded-xl hover:bg-brand-500/10 transition-colors"
                            >
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 truncate">
                                    {t.title}
                                  </span>
                                  {t.badge && (
                                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 shrink-0">
                                      {t.badge}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                                  {t.description}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
                        No matching tools found for &quot;{toolQuery}&quot;.
                      </div>
                    )}
                  </div>
                )}
              </div>

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
                className="hidden sm:inline-flex btn-primary text-xs font-semibold py-2 px-3.5"
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

      {/* Mobile Drawer with Ultra-Frosted Glassmorphism Effect */}
      {mobileOpen && (
        <div
          className="fixed inset-0 top-16 z-40 mobile-drawer-glass lg:hidden p-5 sm:p-6 flex flex-col justify-between border-t border-white/50 dark:border-white/10 shadow-2xl overflow-y-auto animate-in fade-in slide-in-from-top-3 duration-200"
        >
          <div className="space-y-3">
            {/* Mobile Tool Search Input */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="search"
                value={toolQuery}
                onChange={(e) => setToolQuery(e.target.value)}
                placeholder="Find a tool (e.g. merge, compress, word)..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 backdrop-blur-md"
              />
              {toolQuery.trim().length > 0 && matchingTools.length > 0 && (
                <div className="mt-2 p-2 rounded-xl bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/80 dark:border-zinc-800/80 space-y-1 max-h-56 overflow-y-auto shadow-lg">
                  {matchingTools.map((t) => {
                    const Icon = t.navIcon || t.icon;
                    return (
                      <Link
                        key={t.href}
                        href={t.href}
                        onClick={() => {
                          setMobileOpen(false);
                          setToolQuery('');
                        }}
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-brand-500/10 text-xs font-semibold text-zinc-900 dark:text-white"
                      >
                        <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${t.color} flex items-center justify-center text-white shrink-0`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">{t.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mobile PDF Tools Accordion */}
            <div className="rounded-2xl ultra-subcard overflow-hidden">
              <button
                type="button"
                onClick={() => setMobilePdfAccordionOpen((prev) => !prev)}
                className="w-full flex items-center justify-between p-3.5 text-base font-bold text-zinc-900 dark:text-white min-h-[48px]"
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

              {mobilePdfAccordionOpen && (
                <div
                  className="overflow-hidden border-t border-zinc-200/60 dark:border-zinc-800/60 px-2 py-2 space-y-1 animate-in fade-in duration-150"
                >
                  <div className="space-y-3 py-1">
                    {pdfCategories.map((group) => (
                      <div key={group.category} className="space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2.5 pt-1">
                          {group.category}
                        </div>
                        <div className="space-y-1">
                          {group.tools.map((item) => {
                            const isCurrent = pathname === item.href;
                            const Icon = item.navIcon || item.icon;
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-start gap-2.5 p-2 rounded-xl transition ${
                                  isCurrent
                                    ? 'bg-brand-500/15 text-brand-600 dark:text-brand-300 font-bold'
                                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                }`}
                              >
                                <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-500 shrink-0 mt-0.5">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-semibold leading-tight">{item.label}</div>
                                  <div
                                    className={`text-xs mt-0.5 leading-snug line-clamp-1 ${
                                      isCurrent ? 'text-brand-600/70 dark:text-brand-300/70' : 'text-zinc-500 dark:text-zinc-400'
                                    }`}
                                  >
                                    {item.subtitle}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Word Tools Accordion */}
            <div className="rounded-2xl ultra-subcard overflow-hidden">
              <button
                type="button"
                onClick={() => setMobileWordAccordionOpen((prev) => !prev)}
                className="w-full flex items-center justify-between p-3.5 text-base font-bold text-zinc-900 dark:text-white min-h-[48px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span>Word Tools</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                    mobileWordAccordionOpen ? 'rotate-180 text-brand-500' : ''
                  }`}
                />
              </button>

              {mobileWordAccordionOpen && (
                <div
                  className="overflow-hidden border-t border-zinc-200/60 dark:border-zinc-800/60 px-2 py-2 space-y-1 animate-in fade-in duration-150"
                >
                  <div className="space-y-1 py-1">
                    {wordToolsList.map((item) => {
                      const isCurrent = pathname === item.href;
                      const Icon = item.navIcon || item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-start gap-2.5 p-2 rounded-xl transition ${
                            isCurrent
                              ? 'bg-brand-500/15 text-brand-600 dark:text-brand-300 font-bold'
                              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 shrink-0 mt-0.5">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold leading-tight">{item.label}</div>
                            <div
                              className={`text-xs mt-0.5 leading-snug line-clamp-1 ${
                                isCurrent ? 'text-brand-600/70 dark:text-brand-300/70' : 'text-zinc-500 dark:text-zinc-400'
                              }`}
                            >
                              {item.subtitle}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Top-Level Links */}
            <div className="space-y-1 pt-1">
              {topLevelNavLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl text-base font-semibold transition ${
                      isActive
                        ? 'bg-brand-500/15 text-brand-600 dark:text-brand-300 font-bold'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-zinc-500" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Appearance</span>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
            <div className="text-center text-xs text-zinc-400">
              Privacy-First Processing • Zero File Storage
            </div>
          </div>
        </div>
      )}
    </>
  );
}
