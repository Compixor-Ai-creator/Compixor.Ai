'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Star, MessageSquareHeart, X, Send, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import CompixorModal from '@/components/CompixorModal';
import { toast } from 'sonner';

interface ApprovedFeedback {
  id: string;
  tool_name: string;
  rating: number;
  first_name: string | null;
  message: string;
  created_at: string;
}

const TOOL_OPTIONS = [
  'Compixor Suite (General)',
  'PDF Compressor',
  'PDF Organizer (Merge & Split)',
  'PDF to Word',
  'Protect PDF (AES-256)',
  'Unlock PDF',
  'Add Watermark',
  'Remove Watermark',
  'Word Compressor',
  'Biometric Passport Photo Maker',
  'WhatsApp Full DP Maker',
  'Vector QR Code Generator',
  'Other Utility',
];

const LOCAL_STORAGE_KEY = 'compixor_local_feedback';
const RATE_LIMIT_KEY = 'compixor_last_feedback_time';
const RATE_LIMIT_MS = 60 * 1000; // 1 submission per minute per browser

export default function WhatUsersSay() {
  const [items, setItems] = useState<ApprovedFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [firstName, setFirstName] = useState('');
  const [selectedTool, setSelectedTool] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Load reviews from API + merged with local reviews
  const loadApproved = useCallback(async () => {
    try {
      let apiItems: ApprovedFeedback[] = [];
      try {
        const res = await fetch('/api/feedback');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.items)) {
            apiItems = data.items;
          }
        }
      } catch {
        // Fall back gracefully to local storage
      }

      let localItems: ApprovedFeedback[] = [];
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (saved) {
            localItems = JSON.parse(saved);
          }
        } catch {
          // ignore corrupted local storage
        }
      }

      // Merge local and remote, deduplicating by ID
      const seenIds = new Set<string>();
      const merged: ApprovedFeedback[] = [];

      for (const item of [...localItems, ...apiItems]) {
        if (item && item.id && !seenIds.has(item.id)) {
          seenIds.add(item.id);
          merged.push(item);
        }
      }

      setItems(merged);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApproved();
  }, [loadApproved]);

  // Listen to global open event
  useEffect(() => {
    const handleOpen = () => {
      setFormError(null);
      setIsModalOpen(true);
    };

    window.addEventListener('compixor:open-feedback-modal', handleOpen);
    return () => {
      window.removeEventListener('compixor:open-feedback-modal', handleOpen);
    };
  }, []);

  // Modal scroll lock and keyboard trapping managed by CompixorModal

  const handleOpenModal = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) triggerRef.current = e.currentTarget;
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormError(null);
    // CompixorModal restores focus with preventScroll after the exit starts.
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Spam honeypot trap: bots fill this field
    if (honeypot.trim().length > 0) {
      setIsModalOpen(false);
      toast.success('Thank you for sharing your feedback!');
      return;
    }

    // Client-side rate limiting: 1 submission per minute
    if (typeof window !== 'undefined') {
      const lastTimeStr = localStorage.getItem(RATE_LIMIT_KEY);
      if (lastTimeStr) {
        const elapsed = Date.now() - parseInt(lastTimeStr, 10);
        if (elapsed < RATE_LIMIT_MS) {
          const waitSeconds = Math.ceil((RATE_LIMIT_MS - elapsed) / 1000);
          setFormError(`Please wait ${waitSeconds}s before submitting feedback again.`);
          return;
        }
      }
    }

    // Required Star Rating Validation
    if (rating < 1 || rating > 5) {
      setFormError('Please select a star rating (1 to 5 stars).');
      return;
    }

    // Feedback message validation
    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 10) {
      setFormError('Please write at least 10 characters in your feedback.');
      return;
    }
    if (trimmedMessage.length > 500) {
      setFormError('Feedback message must not exceed 500 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        rating,
        first_name: firstName.trim() || undefined,
        tool_name: selectedTool.trim() || 'Compixor Suite',
        message: trimmedMessage,
        website: honeypot, // Honeypot
      };

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFormError(data.error || 'Failed to submit feedback. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Record rate limit timestamp
      if (typeof window !== 'undefined') {
        localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
      }

      // Create new approved feedback object
      const newFeedbackItem: ApprovedFeedback = data.item || {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        tool_name: payload.tool_name,
        rating: payload.rating,
        first_name: payload.first_name || null,
        message: payload.message,
        created_at: new Date().toISOString(),
      };

      // Persist in localStorage so review persists on refresh
      if (typeof window !== 'undefined') {
        try {
          const currentLocal = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
          localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify([newFeedbackItem, ...currentLocal])
          );
        } catch {
          // ignore
        }
      }

      // Prepend to items list in state
      setItems((prev) => [newFeedbackItem, ...prev.filter((i) => i.id !== newFeedbackItem.id)]);

      // Reset form
      setMessage('');
      setFirstName('');
      setSelectedTool('');
      setRating(5);
      setIsModalOpen(false);

      toast.success('Thank you for sharing your feedback!');
    } catch {
      setFormError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <>
      {/* ============ WHAT USERS SAY SECTION ============ */}
      {items.length === 0 ? (
        // Clean empty state when no reviews exist yet
        <section className="py-10 sm:py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="glass-card p-5 sm:p-8 md:p-12 rounded-3xl max-w-xl mx-auto text-center border border-zinc-200/70 dark:border-zinc-800/60 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-4">
              <MessageSquareHeart className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-zinc-900 dark:text-white mb-2">
              Be the first to share your feedback
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-6 max-w-sm mx-auto">
              We value your honest experience. Use any tool and share your review with our community.
            </p>
            <button
              type="button"
              onClick={handleOpenModal}
              className="btn-primary inline-flex items-center justify-center gap-2 text-xs sm:text-sm px-5 py-2.5 font-semibold cursor-pointer min-h-[44px]"
            >
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Share Your Feedback</span>
            </button>
          </div>
        </section>
      ) : (
        // Reviews Grid when reviews exist
        <section className="py-10 sm:py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 sm:mb-10">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-zinc-900 dark:text-white mb-2">
                What users say
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                Recent feedback from people using our client-side utilities.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenModal}
              className="btn-primary inline-flex items-center justify-center gap-2 text-xs sm:text-sm px-4 sm:px-5 py-2.5 font-semibold cursor-pointer shrink-0 min-h-[44px]"
            >
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Share Feedback</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {items.map((fb, idx) => (
              <motion.div
                key={fb.id || idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="glass-card p-5 sm:p-6 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="space-y-3">
                  {/* Stars & Tool Name */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= fb.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-zinc-300 dark:text-zinc-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 truncate max-w-[160px]">
                      {fb.tool_name}
                    </span>
                  </div>

                  {/* Message */}
                  <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">
                    {fb.message}
                  </p>
                </div>

                {/* Author */}
                <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {fb.first_name || 'Anonymous'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ============ ACCESSIBLE FEEDBACK MODAL ============ */}
      <CompixorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        titleId="feedback-dialog-title"
        triggerRef={triggerRef}
        initialFocusRef={closeButtonRef}
        maxWidthClassName="max-w-lg"
      >
              {/* Header */}
              <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                    <MessageSquareHeart className="w-5 h-5" />
                  </div>
                  <div>
                    <h2
                      id="feedback-dialog-title"
                      className="text-base sm:text-lg font-bold font-display text-zinc-900 dark:text-white"
                    >
                      Share Your Feedback
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      No sign up required. Helps us improve Compixor.
                    </p>
                  </div>
                </div>

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={handleCloseModal}
                  aria-label="Close feedback modal"
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                {/* Error Banner */}
                {formError && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Honeypot for spam bots */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="compixor-website-hp">Leave this empty</label>
                  <input
                    id="compixor-website-hp"
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                {/* Rating - Required 1 to 5 stars */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    Rating <span className="text-red-500">*</span>
                  </label>
                  <div
                    className="flex items-center gap-1.5"
                    role="group"
                    aria-label="Rating out of 5 stars"
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        aria-label={`${star} star${star > 1 ? 's' : ''}`}
                        className="p-1 rounded-lg transition-transform active:scale-90 focus-visible:ring-2 focus-visible:ring-brand-500 cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                            (hoverRating !== null ? star <= hoverRating : star <= rating)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-zinc-300 dark:text-zinc-700'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 ml-2">
                      {hoverRating !== null ? hoverRating : rating} / 5
                    </span>
                  </div>
                </div>

                {/* Tool used - Optional */}
                <div>
                  <label
                    htmlFor="feedback-tool-select"
                    className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    Tool used <span className="text-zinc-400 font-normal">(optional)</span>
                  </label>
                  <select
                    id="feedback-tool-select"
                    value={selectedTool}
                    onChange={(e) => setSelectedTool(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                  >
                    <option value="">General / Entire Compixor Suite</option>
                    {TOOL_OPTIONS.map((tool) => (
                      <option key={tool} value={tool}>
                        {tool}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name - Optional */}
                <div>
                  <label
                    htmlFor="feedback-name-input"
                    className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    Your name <span className="text-zinc-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id="feedback-name-input"
                    type="text"
                    maxLength={50}
                    placeholder="e.g. Alex (or leave blank to stay anonymous)"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                  />
                </div>

                {/* Message - Required (10-500 chars) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="feedback-message-input"
                      className="text-xs font-bold text-zinc-700 dark:text-zinc-300"
                    >
                      Your feedback <span className="text-red-500">*</span>
                    </label>
                    <span
                      className={`text-[11px] ${
                        message.length > 500
                          ? 'text-red-500 font-semibold'
                          : 'text-zinc-400 dark:text-zinc-500'
                      }`}
                    >
                      {message.length}/500
                    </span>
                  </div>
                  <textarea
                    id="feedback-message-input"
                    rows={4}
                    required
                    minLength={10}
                    maxLength={500}
                    placeholder="What did you like? What could we improve? (min. 10 characters)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition resize-none"
                  />
                </div>

                {/* Footer buttons */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Feedback</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
      </CompixorModal>
    </>
  );
}
