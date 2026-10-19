'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Star, Send, CheckCircle2, MessageSquareHeart, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  shouldShowFeedbackPrompt,
  dismissFeedbackPrompt,
  FILE_DONE_EVENT,
  PROMPT_DISMISSED_EVENT,
} from '@/lib/feedbackCounter';

interface ToolFeedbackProps {
  toolName: string;
}

export default function ToolFeedback({ toolName }: ToolFeedbackProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [firstName, setFirstName] = useState('');
  const [message, setMessage] = useState('');
  const [websiteHoneypot, setWebsiteHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsVisible(shouldShowFeedbackPrompt());

    const handleFileDone = () => {
      const show = shouldShowFeedbackPrompt();
      setIsVisible(show);
      if (show) {
        // Automatically pop up the dialog after download completion threshold reached
        setIsModalOpen(true);
      }
    };

    const handleDismissed = () => {
      setIsVisible(false);
      setIsModalOpen(false);
    };

    const handleOpenModal = () => {
      setIsModalOpen(true);
    };

    window.addEventListener(FILE_DONE_EVENT, handleFileDone);
    window.addEventListener(PROMPT_DISMISSED_EVENT, handleDismissed);
    window.addEventListener('compixor:open-feedback-modal', handleOpenModal);

    return () => {
      window.removeEventListener(FILE_DONE_EVENT, handleFileDone);
      window.removeEventListener(PROMPT_DISMISSED_EVENT, handleDismissed);
      window.removeEventListener('compixor:open-feedback-modal', handleOpenModal);
    };
  }, []);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const handleMaybeLater = useCallback(() => {
    dismissFeedbackPrompt();
    setIsVisible(false);
    setIsModalOpen(false);
  }, []);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleMaybeLater();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, handleMaybeLater]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      toast.error('Please select a star rating (1–5 stars).');
      return;
    }

    const trimmedMsg = message.trim();
    if (trimmedMsg.length < 10) {
      toast.error('Please write at least 10 characters in your message.');
      return;
    }

    if (trimmedMsg.length > 500) {
      toast.error('Message must not exceed 500 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          first_name: firstName.trim() || undefined,
          message: trimmedMsg,
          tool_name: toolName,
          website: websiteHoneypot, // Honeypot
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to submit feedback.');
        setIsSubmitting(false);
        return;
      }

      // Hide box and advance next prompt threshold by +10
      dismissFeedbackPrompt();
      setIsSubmitted(true);
      toast.success('Thanks! Your feedback will appear after review.');

      if (isModalOpen) {
        setTimeout(() => {
          setIsModalOpen(false);
        }, 2200);
      }
    } catch {
      toast.error('Could not connect to server. Please check your internet connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;
  if (!isVisible && !isSubmitted && !isModalOpen) return null;

  // Shared Form Fields for both inline card and popup modal
  const renderFormContent = (isModal: boolean) => (
    <>
      {isSubmitted ? (
        <div className="py-6 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center ring-8 ring-emerald-500/5">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-display text-zinc-900 dark:text-white">
            Thanks! Your feedback will appear after review.
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            We read every submission to keep improving Compixor AI’s free, client-side tools.
          </p>
          {isModal && (
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
            >
              Close
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                <MessageSquareHeart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-display text-zinc-900 dark:text-white">
                  How was your experience?
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Help others discover private, fast tools. Real user feedback only.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMaybeLater}
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors py-1 px-2"
              >
                Maybe later
              </button>
              {isModal && (
                <button
                  type="button"
                  onClick={handleMaybeLater}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Honeypot field (hidden from genuine visitors) */}
          <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
            <label htmlFor={`hp-website-${toolName}-${isModal ? 'modal' : 'inline'}`}>
              Leave this field empty
            </label>
            <input
              id={`hp-website-${toolName}-${isModal ? 'modal' : 'inline'}`}
              type="text"
              name="website"
              value={websiteHoneypot}
              onChange={(e) => setWebsiteHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Star Rating (Required) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
              Rating <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const activeStar = (hoverRating ?? rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 rounded-xl hover:bg-amber-500/10 transition-transform active:scale-95 focus:outline-none"
                    aria-label={`Give ${star} out of 5 stars`}
                  >
                    <Star
                      className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                        activeStar
                          ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                          : 'text-zinc-300 dark:text-zinc-700'
                      }`}
                    />
                  </button>
                );
              })}
              {rating > 0 && (
                <span className="ml-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                  {rating} / 5
                </span>
              )}
            </div>
          </div>

          {/* Message Area (Required, 10-500 chars) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor={`feedback-msg-${toolName}-${isModal ? 'modal' : 'inline'}`}
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider"
              >
                Feedback <span className="text-rose-500">*</span>
              </label>
              <span
                className={`text-[11px] font-mono ${
                  message.length < 10
                    ? 'text-zinc-400'
                    : message.length > 500
                    ? 'text-red-500 font-bold'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {message.length} / 500
              </span>
            </div>
            <textarea
              id={`feedback-msg-${toolName}-${isModal ? 'modal' : 'inline'}`}
              rows={3}
              required
              minLength={10}
              maxLength={500}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What worked well? How was the speed and quality of this tool?"
              className="w-full px-4 py-3 rounded-2xl text-sm bg-zinc-50 dark:bg-surface-850 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none transition"
            />
          </div>

          {/* First Name (Optional, max 40 chars) & Submit Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label
                htmlFor={`feedback-name-${toolName}-${isModal ? 'modal' : 'inline'}`}
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
              >
                First name <span className="text-zinc-400 font-normal">(optional, max 40 chars)</span>
              </label>
              <input
                id={`feedback-name-${toolName}-${isModal ? 'modal' : 'inline'}`}
                type="text"
                maxLength={40}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-surface-850 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
              />
            </div>

            <div className="flex items-center gap-3 sm:justify-end">
              <button
                type="button"
                onClick={handleMaybeLater}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
              >
                Maybe later
              </button>
              <button
                type="submit"
                disabled={isSubmitting || rating === 0 || message.trim().length < 10}
                className="btn-primary px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Sending...' : 'Submit Feedback'}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </>
  );

  return (
    <>
      {/* 1. INLINE FEEDBACK CARD (stays below the download area exactly as originally designed) */}
      {(isVisible || isSubmitted) && (
        <div className="w-full my-8 max-w-4xl mx-auto px-4 print:hidden">
          <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 backdrop-blur-md p-6 sm:p-8 shadow-xl shadow-brand-500/5">
            {/* Subtle glow orb */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full bg-brand-500/10 blur-3xl"
            />
            {renderFormContent(false)}
          </div>
        </div>
      )}

      {/* 2. POPUP MODAL DIALOG (pops up automatically upon reaching the download threshold) */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-dialog-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden animate-in fade-in duration-200"
          onClick={(e) => {
            // Dismiss if clicking backdrop outside dialog card
            if (e.target === e.currentTarget) {
              handleMaybeLater();
            }
          }}
        >
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Subtle glow orb */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full bg-brand-500/15 blur-3xl"
            />
            {renderFormContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
