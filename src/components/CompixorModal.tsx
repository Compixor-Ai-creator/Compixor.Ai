'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// Global scroll lock counter with scrollbar width compensation to eliminate layout shift
let scrollLockCount = 0;
let originalBodyOverflow = '';
let originalBodyPaddingRight = '';

function lockScroll() {
  if (typeof document === 'undefined') return;
  scrollLockCount++;
  if (scrollLockCount === 1) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    originalBodyOverflow = document.body.style.overflow;
    originalBodyPaddingRight = document.body.style.paddingRight;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';
  }
}

function unlockScroll() {
  if (typeof document === 'undefined') return;
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.style.overflow = originalBodyOverflow;
    document.body.style.paddingRight = originalBodyPaddingRight;
  }
}

export interface CompixorModalProps {
  isOpen: boolean;
  onClose: () => void;
  titleId?: string;
  triggerRef?: React.RefObject<HTMLElement | null> | React.MutableRefObject<HTMLElement | null>;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  maxWidthClassName?: string;
  children: React.ReactNode;
}

export default function CompixorModal({
  isOpen,
  onClose,
  titleId,
  triggerRef,
  initialFocusRef,
  maxWidthClassName = 'max-w-lg',
  children,
}: CompixorModalProps) {
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Mount check for React Portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Manage body scroll locking without layout shift
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement | null;
      lockScroll();
    } else {
      unlockScroll();
    }
    return () => {
      if (isOpen) {
        unlockScroll();
      }
    };
  }, [isOpen]);

  // Focus management and focus trapping
  useEffect(() => {
    if (!isOpen) {
      // Return focus to trigger when closing
      const returnTarget = triggerRef?.current || previousActiveElement.current;
      if (returnTarget && typeof returnTarget.focus === 'function') {
        returnTarget.focus();
      }
      return;
    }

    // Set initial focus inside modal
    const focusTimer = setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else if (dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          focusable[0].focus();
        }
      }
    }, 40);

    return () => clearTimeout(focusTimer);
  }, [isOpen, initialFocusRef, triggerRef]);

  // Global keyboard listener for Escape and Tab trapping
  useEffect(() => {
    if (!isOpen) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: prefersReducedMotion ? 0.15 : 0.24, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      transition: { duration: prefersReducedMotion ? 0.12 : 0.18, ease: 'easeIn' },
    },
  };

  const cardVariants = {
    hidden: prefersReducedMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 12, scale: 0.97 },
    visible: prefersReducedMotion
      ? { opacity: 1, transition: { duration: 0.15 } }
      : {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.24,
            ease: [0.22, 1, 0.36, 1], // Soft cubic-bezier easing
          },
        },
    exit: prefersReducedMotion
      ? { opacity: 0, transition: { duration: 0.12 } }
      : {
          opacity: 0,
          y: 8,
          scale: 0.98,
          transition: {
            duration: 0.18,
            ease: [0.22, 1, 0.36, 1],
          },
        },
  };

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 print:hidden"
          
        >
          {/* Minimal, unique background overlay: subtle brand-purple tint with constant blur */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-[#4c1d95]/[0.10] dark:bg-[#0a0819]/[0.45] backdrop-blur-[6px] backdrop-saturate-[1.15] will-change-[opacity]"
            aria-hidden="true"
          />

          {/* Modal Container with soft purple ambient back-glow */}
          <div className={`relative w-full ${maxWidthClassName} z-10 flex flex-col items-center justify-center`}>
            {/* Soft radial purple glow behind the modal */}
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full opacity-15 dark:opacity-25 blur-3xl -z-10"
              style={{
                background:
                  'radial-gradient(circle, rgba(124, 58, 237, 0.55) 0%, rgba(139, 92, 246, 0.25) 45%, transparent 70%)',
              }}
            />

            {/* Modal Dialog Card (Solid 100% opaque background — never see-through) */}
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full bg-white dark:bg-[#0f0c24] border border-zinc-200/90 dark:border-white/60 rounded-3xl shadow-[0_20px_50px_rgba(76,29,149,0.12),0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.5),0_0_24px_rgba(124,58,237,0.15)] overflow-hidden max-h-[92vh] flex flex-col will-change-[transform,opacity]"
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
