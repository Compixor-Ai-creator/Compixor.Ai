'use client';

import React, { useEffect, useRef } from 'react';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';

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
  const wasOpenRef = useRef(false);

  // Restore focus to explicit triggerRef when closing if provided
  useEffect(() => {
    if (wasOpenRef.current && !isOpen && triggerRef?.current) {
      const target = triggerRef.current;
      window.requestAnimationFrame(() => {
        if (typeof target.focus === 'function') {
          target.focus({ preventScroll: true });
        }
      });
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, triggerRef]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      initialFocus={initialFocusRef}
      aria-labelledby={titleId}
      className="relative z-[10050] print:hidden"
    >
      <DialogBackdrop
        transition
        className="modal-backdrop-blur fixed inset-0 bg-[#0f1219]/40 dark:bg-[#0a0819]/65 backdrop-blur-md transition-opacity duration-200 ease-out data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6">
        <div className="flex min-h-full items-center justify-center">
          <DialogPanel
            transition
            className={`relative w-full ${maxWidthClassName} bg-white dark:bg-[#0f0c24] border border-zinc-200/90 dark:border-white/20 rounded-3xl shadow-[0_20px_50px_rgba(76,29,149,0.14),0_4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.55),0_0_24px_rgba(124,58,237,0.18)] overflow-hidden max-h-[92vh] flex flex-col transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0`}
          >
            {children}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
