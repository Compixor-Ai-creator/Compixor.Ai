'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/SocialIcons';

const navLinks = [
  { href: '/tools/pdf-compressor', label: 'PDF Compressor', icon: FileDown },
  { href: '/tools/word-compressor', label: 'Word Compressor', icon: FileText },
  { href: '/tools/passport-photo', label: 'Passport Photo', icon: Camera },
  { href: '/tools/full-dp-maker', label: 'Full DP Maker', icon: WhatsAppIcon },
  { href: '/tools/qr-generator', label: 'QR Generator', icon: QrCode },
  { href: '/about', label: 'About', icon: Info },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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
            <div className="hidden lg:flex items-center gap-0.5 xl:gap-1 overflow-x-auto no-scrollbar">
              {navLinks.map((link) => {
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
                className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-brand-500/10 text-zinc-600 dark:text-zinc-400"
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
                className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
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
            className="fixed inset-0 top-16 z-40 bg-white/80 dark:bg-surface-950/85 backdrop-blur-2xl lg:hidden p-6 flex flex-col justify-between border-t border-zinc-200/60 dark:border-zinc-800/60 shadow-2xl"
          >
            <div className="space-y-2">
              {navLinks.map((link) => {
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
                    <Icon className="w-5 h-5" />
                    {link.label}
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
