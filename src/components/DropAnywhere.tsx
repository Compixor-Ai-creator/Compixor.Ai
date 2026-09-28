'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileType, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

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
  title = 'Drop file anywhere',
  subtitle = 'to upload and process instantly',
  disabled = false,
}: DropAnywhereProps) {
  const [isDraggingOverWindow, setIsDraggingOverWindow] = useState(false);
  const dragCounterRef = useRef(0);

  const isValidFileType = useCallback(
    (file: File): boolean => {
      if (!accept || accept === '*') return true;

      const lowerName = file.name.toLowerCase();
      const lowerType = file.type.toLowerCase();

      // Special handling for PDF
      if (accept.includes('pdf')) {
        if (lowerName.endsWith('.pdf') || lowerType === 'application/pdf' || lowerType.includes('pdf')) {
          return true;
        }
      }

      // Special handling for Word (.docx, .doc)
      if (accept.includes('doc') || accept.includes('word')) {
        if (
          lowerName.endsWith('.docx') ||
          lowerName.endsWith('.doc') ||
          lowerType.includes('word') ||
          lowerType.includes('officedocument')
        ) {
          return true;
        }
      }

      // Default Image handling
      if (accept === 'image/*' || accept.startsWith('image/')) {
        return lowerType.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|heic|heif)$/i.test(lowerName);
      }

      // General extension and MIME matching
      const acceptedList = accept.split(',').map((item) => item.trim().toLowerCase());
      const ext = '.' + (lowerName.split('.').pop() || '');
      return acceptedList.some((item) => item === lowerType || item === ext);
    },
    [accept]
  );

  const handleProcessFile = useCallback(
    (file: File) => {
      dragCounterRef.current = 0;
      setIsDraggingOverWindow(false);

      if (isValidFileType(file)) {
        onFileDrop(file);
      } else {
        const expected = accept.includes('pdf')
          ? 'PDF document (.pdf)'
          : accept.includes('doc')
          ? 'Word document (.docx)'
          : accept;
        toast.error(`Invalid file format. Please drop a ${expected}.`);
      }
    },
    [isValidFileType, onFileDrop, accept]
  );

  useEffect(() => {
    if (disabled) return;

    // Window level listeners in capture phase to prevent browser opening file as URL
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types && Array.from(e.dataTransfer.types).includes('Files')) {
        dragCounterRef.current += 1;
        setIsDraggingOverWindow(true);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current -= 1;
      if (dragCounterRef.current <= 0) {
        dragCounterRef.current = 0;
        setIsDraggingOverWindow(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsDraggingOverWindow(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleProcessFile(files[0]);
      }
    };

    window.addEventListener('dragenter', handleDragEnter, true);
    window.addEventListener('dragover', handleDragOver, true);
    window.addEventListener('dragleave', handleDragLeave, true);
    window.addEventListener('drop', handleDrop, true);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter, true);
      window.removeEventListener('dragover', handleDragOver, true);
      window.removeEventListener('dragleave', handleDragLeave, true);
      window.removeEventListener('drop', handleDrop, true);
    };
  }, [disabled, handleProcessFile]);

  // Badge text helper
  const badgeText = accept.includes('pdf')
    ? 'Supports PDF files up to 100MB'
    : accept.includes('doc')
    ? 'Supports Word (.docx) files up to 100MB'
    : 'Supports JPG, PNG, WebP up to 15MB';

  return (
    <AnimatePresence>
      {isDraggingOverWindow && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-6 md:p-12 pointer-events-auto bg-black/70 backdrop-blur-md cursor-copy"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!e.relatedTarget) {
              dragCounterRef.current = 0;
              setIsDraggingOverWindow(false);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const files = e.dataTransfer?.files;
            if (files && files.length > 0) {
              handleProcessFile(files[0]);
            }
          }}
        >
          {/* Animated dashed boundary container */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-full h-full max-w-5xl max-h-[85vh] rounded-3xl border-2 sm:border-3 border-dashed border-blue-400 bg-blue-500/10 dark:bg-blue-950/40 shadow-2xl flex flex-col items-center justify-center text-center p-8 relative overflow-hidden pointer-events-none"
          >
            {/* Ambient background glow orb */}
            <div
              className="absolute -z-10 w-96 h-96 rounded-full opacity-30 dark:opacity-40"
              style={{
                background: 'radial-gradient(circle, #2563eb 0%, #06b6d4 50%, transparent 70%)',
                filter: 'blur(70px)',
              }}
            />

            {/* Glowing Icon */}
            <div className="relative mb-6">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white animate-pulse">
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
              <FileType className="w-4 h-4 text-cyan-400" />
              <span>{badgeText}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
