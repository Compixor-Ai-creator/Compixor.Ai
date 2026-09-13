'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, Sparkles } from 'lucide-react';

interface DropAnywhereProps {
  onFileDrop: (file: File) => void;
  accept?: string;
  title?: string;
  subtitle?: string;
  disabled?: boolean;
}

export default function DropAnywhere({
  onFileDrop,
  accept = 'image/*',
  title = 'Drop image anywhere',
  subtitle = 'to upload and process instantly',
  disabled = false,
}: DropAnywhereProps) {
  const [isDraggingOverWindow, setIsDraggingOverWindow] = useState(false);
  const dragCounterRef = useRef(0);

  const isValidFileType = useCallback(
    (file: File) => {
      if (!accept || accept === '*' || accept === 'image/*') {
        return file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|heic|heif)$/i.test(file.name);
      }
      const acceptedList = accept.split(',').map((item) => item.trim().toLowerCase());
      const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
      return acceptedList.some((item) => item === file.type.toLowerCase() || item === ext);
    },
    [accept]
  );

  useEffect(() => {
    if (disabled) return;

    // Window level listeners to prevent browser opening file as URL
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.dataTransfer?.types && Array.from(e.dataTransfer.types).includes('Files')) {
        dragCounterRef.current += 1;
        setIsDraggingOverWindow(true);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current -= 1;
      if (dragCounterRef.current <= 0) {
        dragCounterRef.current = 0;
        setIsDraggingOverWindow(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDraggingOverWindow(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (isValidFileType(file)) {
          onFileDrop(file);
        }
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [disabled, onFileDrop, isValidFileType]);

  return (
    <AnimatePresence>
      {isDraggingOverWindow && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-6 md:p-12 pointer-events-none bg-black/60 dark:bg-black/75 backdrop-blur-md"
        >
          {/* Animated dashed boundary container */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-full h-full max-w-5xl max-h-[85vh] rounded-3xl border-2 sm:border-3 border-dashed border-brand-400/90 dark:border-brand-400 bg-brand-500/10 dark:bg-brand-950/40 shadow-2xl flex flex-col items-center justify-center text-center p-8 relative overflow-hidden"
          >
            {/* Ambient background glow orb */}
            <div
              className="absolute -z-10 w-96 h-96 rounded-full opacity-30 dark:opacity-40 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, #7c3aed 0%, #06b6d4 50%, transparent 70%)',
                filter: 'blur(70px)',
              }}
            />

            {/* Glowing Icon */}
            <div className="relative mb-6">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center shadow-glow-lg text-white animate-pulse">
                <Upload className="w-12 h-12 sm:w-14 sm:h-14 animate-bounce" />
              </div>
              <div className="absolute -top-2 -right-2 p-2 rounded-full bg-white dark:bg-zinc-800 shadow-md text-amber-500">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-white tracking-tight mb-3 drop-shadow-md">
              {title}
            </h2>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-zinc-200 dark:text-zinc-300 max-w-md font-medium">
              {subtitle}
            </p>

            {/* Badge */}
            <div className="mt-8 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold text-white/90 shadow-sm flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <span>Supports JPG, PNG, WebP up to 15MB</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
