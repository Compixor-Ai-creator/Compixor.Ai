'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquarePlus,
  X,
  Wrench,
  Bug,
  Sparkles,
  Send,
  CheckCircle2,
  Mail,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

type Category = 'request' | 'bug' | 'feedback';

interface FeedbackSubmission {
  id: string;
  category: Category;
  message: string;
  email?: string;
  pathname: string;
  submittedAt: string;
}

const CATEGORIES: {
  id: Category;
  label: string;
  icon: React.ElementType;
  badge: string;
  placeholder: string;
}[] = [
  {
    id: 'request',
    label: 'Request Tool',
    icon: Wrench,
    badge: '🛠️ Tool Request',
    placeholder:
      'What tool would you like to see next? (e.g., Image to SVG vectorizer, Excel compressor, WebP batch converter, PDF OCR...)',
  },
  {
    id: 'bug',
    label: 'Report Bug',
    icon: Bug,
    badge: '🐛 Bug Report',
    placeholder:
      'Please describe what happened, what file type was used, and any unexpected error or layout glitch...',
  },
  {
    id: 'feedback',
    label: 'Feedback',
    icon: Sparkles,
    badge: '⭐ Feedback',
    placeholder:
      'Tell us how your experience was, what worked well, or how we can make Compixor AI even better for your workflow...',
  },
];

export default function FeedbackWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<Category>('request');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for custom global event to open widget from Footer or any link
  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ category?: Category }>;
      if (customEvent.detail?.category) {
        setCategory(customEvent.detail.category);
      }
      setIsSubmitted(false);
      setIsOpen(true);
    };

    window.addEventListener('compixor:open-feedback', handleOpen);
    return () => window.removeEventListener('compixor:open-feedback', handleOpen);
  }, []);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const activeCategoryConfig = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];

  const getEmailContent = useCallback(() => {
    const subject = `[Compixor AI - ${activeCategoryConfig.badge}] from ${pathname}`;
    const body = [
      `Hi Compixor AI Team,`,
      '',
      `Category: ${activeCategoryConfig.label}`,
      `Current Page: ${typeof window !== 'undefined' ? window.location.href : pathname}`,
      `My Email: ${email.trim() || 'Not specified'}`,
      '',
      '--- Feedback / Request Details ---',
      message.trim(),
      '',
      '--- System Info ---',
      `Date: ${new Date().toLocaleString()}`,
      `Browser: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}`,
    ].join('\n');

    return { subject, body };
  }, [activeCategoryConfig, pathname, email, message]);

  const getGmailComposeUrl = useCallback(() => {
    const { subject, body } = getEmailContent();
    return `https://mail.google.com/mail/?view=cm&fs=1&to=support@compixor-ai.online&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [getEmailContent]);

  const getOutlookComposeUrl = useCallback(() => {
    const { subject, body } = getEmailContent();
    return `https://outlook.live.com/mail/0/deeplink/compose?to=support@compixor-ai.online&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [getEmailContent]);

  const getMailtoUrl = useCallback(() => {
    const { subject, body } = getEmailContent();
    return `mailto:support@compixor-ai.online?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [getEmailContent]);

  const saveFeedbackLocally = useCallback(() => {
    try {
      const submission: FeedbackSubmission = {
        id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        category,
        message: message.trim(),
        email: email.trim() || undefined,
        pathname,
        submittedAt: new Date().toISOString(),
      };
      if (typeof window !== 'undefined') {
        const existingRaw = localStorage.getItem('compixor_user_feedback');
        const list: FeedbackSubmission[] = existingRaw ? JSON.parse(existingRaw) : [];
        list.unshift(submission);
        localStorage.setItem('compixor_user_feedback', JSON.stringify(list.slice(0, 30)));
      }
    } catch {}
  }, [category, message, email, pathname]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || message.trim().length < 5) {
      toast.error('Please enter at least 5 characters for your message.');
      return;
    }

    setIsSubmitting(true);
    saveFeedbackLocally();
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success('Thank you! Your feedback has been noted.');
  };

  const handleSendViaGmail = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();

    if (!message.trim() || message.trim().length < 5) {
      toast.error('Please enter at least 5 characters for your message.');
      return;
    }

    saveFeedbackLocally();
    const url = getGmailComposeUrl();
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    setIsSubmitted(true);
    toast.success('Opening Gmail Web with pre-filled message...');
  };

  const handleCopy = async () => {
    const { subject, body } = getEmailContent();
    const textToCopy = `Subject: ${subject}\n\n${body}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success('Feedback copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Could not copy to clipboard.');
    }
  };

  const handleReset = () => {
    setMessage('');
    setEmail('');
    setIsSubmitted(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setIsSubmitted(false);
    }, 300);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Discreet Floating Trigger Button */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 print:hidden">
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setIsSubmitted(false);
          }}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label="Submit Feedback or Request a Tool"
          className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-lg shadow-brand-500/25 border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 dark:focus:ring-offset-surface-950"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300" />
          </span>

          <MessageSquarePlus className="w-4 h-4 transition-transform group-hover:rotate-6" />
          <span className="text-xs sm:text-sm font-semibold tracking-wide font-display">
            Feedback / Request Tool
          </span>
        </button>
      </div>

      {/* Interactive Modal / Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 print:hidden">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Modal Dialog Card */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="feedback-dialog-title"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-full sm:max-w-lg bg-white dark:bg-surface-900 border border-zinc-200/80 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-surface-950/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3
                      id="feedback-dialog-title"
                      className="text-base font-bold font-display text-zinc-900 dark:text-white"
                    >
                      Compixor AI Feedback
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Help shape the future of private client-side tools
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Close dialog"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-6 overflow-y-auto space-y-5">
                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Category Selector Tabs */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                        Select Category
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {CATEGORIES.map((cat) => {
                          const Icon = cat.icon;
                          const isSelected = category === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setCategory(cat.id)}
                              className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-medium border transition-all duration-200 ${
                                isSelected
                                  ? 'bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-300 shadow-sm ring-1 ring-brand-500/30 font-semibold'
                                  : 'bg-zinc-50 dark:bg-surface-850/60 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-surface-800'
                              }`}
                            >
                              <Icon
                                className={`w-4 h-4 ${
                                  isSelected
                                    ? 'text-brand-600 dark:text-brand-400'
                                    : 'text-zinc-400 dark:text-zinc-500'
                                }`}
                              />
                              <span>{cat.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Active URL context pill */}
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-surface-850 text-xs text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-800/60">
                      <span className="font-medium text-zinc-500">Current page:</span>
                      <code className="text-brand-600 dark:text-brand-400 font-mono text-[11px] truncate max-w-[240px]">
                        {pathname}
                      </code>
                    </div>

                    {/* Message Textarea */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="feedback-message"
                          className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                        >
                          Your Message <span className="text-brand-500">*</span>
                        </label>
                        <span className="text-[11px] text-zinc-400">
                          {message.length}/1000
                        </span>
                      </div>
                      <textarea
                        id="feedback-message"
                        rows={4}
                        maxLength={1000}
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={activeCategoryConfig.placeholder}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-surface-850 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
                      />
                    </div>

                    {/* Optional Email Input */}
                    <div>
                      <label
                        htmlFor="feedback-email"
                        className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
                      >
                        Your Email <span className="text-zinc-400 font-normal">(optional, for replies)</span>
                      </label>
                      <input
                        id="feedback-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-surface-850 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Privacy Note */}
                    <div className="flex items-start gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span>
                        True client-side privacy. Your input is never used for advertising and does not track personal identifiers.
                      </span>
                    </div>

                    {/* Submit Buttons */}
                    <div className="pt-2 space-y-2">
                      <button
                        type="button"
                        onClick={handleSendViaGmail}
                        disabled={isSubmitting || message.trim().length < 5}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 text-white shadow-md shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                      >
                        <GmailIcon className="w-4 h-4" />
                        <span>Open &amp; Send in Gmail Web (Pre-Filled)</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting || message.trim().length < 5}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Save Locally Only (Zero Cloud Upload)</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Success State Animation & Fallback Options */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-3 text-center space-y-4"
                  >
                    <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center ring-8 ring-emerald-500/5">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-lg font-bold font-display text-zinc-900 dark:text-white">
                        Thank You! Your Request Has Been Noted.
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                        We review every tool request and bug report directly to prioritize upcoming client-side releases.
                      </p>
                    </div>

                    {/* Direct Contact & Fallback Card */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-surface-850 border border-zinc-200 dark:border-zinc-800 text-left space-y-3.5">
                      <div>
                        <p className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                          <span>Open in your Web Mailbox:</span>
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          To, Subject, and your message are 100% pre-written. Just click &quot;Send&quot;!
                        </p>
                      </div>

                      {/* Primary Gmail Web Button */}
                      <a
                        href={getGmailComposeUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 text-white shadow-md shadow-red-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                      >
                        <GmailIcon className="w-4 h-4 shrink-0" />
                        <span>Open in Gmail (Web) — Pre-Written</span>
                      </a>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
                        {/* Outlook Web Button */}
                        <a
                          href={getOutlookComposeUrl()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/20 transition-colors"
                        >
                          <OutlookIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>Outlook Web</span>
                        </a>

                        {/* Default Mailto Button */}
                        <a
                          href={getMailtoUrl()}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span>Default App</span>
                        </a>

                        {/* Copy Request Text */}
                        <button
                          type="button"
                          onClick={handleCopy}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span className="text-emerald-500 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 shrink-0" />
                              <span>Copy Text</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 text-center sm:text-left pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
                        Direct email address:{' '}
                        <a
                          href="mailto:support@compixor-ai.online"
                          className="text-brand-600 dark:text-brand-400 font-mono hover:underline font-semibold"
                        >
                          support@compixor-ai.online
                        </a>
                      </p>
                    </div>

                    {/* Modal Footer Controls */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                      >
                        Submit another note
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function GmailIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.545l8.073-6.052C21.691 2.28 24 3.434 24 5.457z" />
    </svg>
  );
}

function OutlookIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.35.19-.86.19-.45 0-.8-.17-.34-.18-.58-.5-.23-.33-.35-.78-.11-.46-.11-.99 0-.47.12-.92.12-.45.36-.79.24-.35.6-.53.37-.19.86-.19.46 0 .81.18.36.18.59.51.24.33.36.77.13.44.13.96zm-1.12.03q0-.36-.06-.67-.06-.32-.2-.54-.13-.23-.34-.35-.2-.12-.48-.12-.29 0-.5.12-.2.12-.34.35-.13.22-.2.53-.06.31-.06.68 0 .38.06.7.07.31.2.53.14.22.34.34.21.11.49.11.28 0 .49-.12.2-.12.34-.35.14-.23.2-.54.06-.32.06-.68zm17.24-4.82v10.5q0 .8-.56 1.36-.57.57-1.37.57H8.94q-.74 0-1.28-.5-.54-.52-.61-1.25l-.01-.18v-.87l10.9-7.25q.18-.12.3-.3.13-.19.13-.4 0-.44-.31-.75-.3-.31-.75-.31-.19 0-.37.07-.18.06-.32.18L7.04 15.02v-7.8q0-.8.57-1.36.56-.56 1.37-.56h13.11q.8 0 1.37.56.56.56.56 1.36z" />
    </svg>
  );
}
