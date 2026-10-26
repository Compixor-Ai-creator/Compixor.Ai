"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/utils/cn";

export interface ContainerTextFlipProps {
  /** Array of words to cycle through in the animation */
  words?: string[];
  /** Time in milliseconds between word transitions */
  interval?: number;
  /** Additional CSS classes to apply to the container/pill */
  className?: string;
  /** Additional CSS classes to apply to the text */
  textClassName?: string;
  /** Duration of the transition animation in milliseconds */
  animationDuration?: number;
}

export function ContainerTextFlip({
  words = ["First.", "Guaranteed.", "Protected."],
  interval = 3000,
  className,
  textClassName,
  animationDuration = 300,
}: ContainerTextFlipProps) {
  const id = useId();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [measuredWidth, setMeasuredWidth] = useState<number | undefined>(undefined);
  const currentTextRef = useRef<HTMLSpanElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const currentWord = words[currentWordIndex] || "";

  // Measure the current word's width dynamically
  useEffect(() => {
    const updateWidth = () => {
      if (currentTextRef.current) {
        // Measured element width + padding calculation (0.6em total horizontal padding = 0.3em * 2)
        const rect = currentTextRef.current.getBoundingClientRect();
        if (rect.width > 0) {
          // getComputedStyle to read exact em-to-px horizontal padding if set, or calculate based on font-size
          const fontSize = parseFloat(window.getComputedStyle(currentTextRef.current).fontSize) || 16;
          const horizontalPadding = fontSize * 0.6; // 0.3em left + 0.3em right
          setMeasuredWidth(Math.ceil(rect.width + horizontalPadding));
        }
      }
    };

    updateWidth();

    // Re-check after web fonts are fully loaded
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(updateWidth);
    }

    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [currentWord, textClassName]);

  // Word cycling interval (3000ms by default, cleaned up on unmount)
  useEffect(() => {
    if (words.length <= 1) return;

    const intervalId = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, interval);

    return () => clearInterval(intervalId);
  }, [words.length, interval]);

  return (
    <motion.span
      className={cn(
        "relative inline-flex items-center justify-center border border-white/60 dark:border-white/20 bg-white/45 dark:bg-white/[0.08] shadow-[0_8px_32px_rgba(124,58,237,0.12)] rounded-[0.3em] overflow-hidden align-baseline text-center",
        className
      )}
      style={{
        padding: "0.04em 0.3em",
        verticalAlign: "baseline",
        WebkitBackdropFilter: "blur(14px) saturate(160%)",
        backdropFilter: "blur(14px) saturate(160%)",
      }}
      animate={{
        width: measuredWidth ? `${measuredWidth}px` : "auto",
      }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.35,
        ease: "easeOut",
      }}
    >
      {/* Off-screen measurement span for current word */}
      <span
        ref={currentTextRef}
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-0 top-0 select-none opacity-0 whitespace-nowrap",
          textClassName
        )}
        style={{ visibility: "hidden" }}
      >
        {currentWord}
      </span>

      {/* Animated word transition */}
      <span className="inline-flex items-center justify-center text-center w-full whitespace-nowrap">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={`${currentWord}-${id}`}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.3,
              ease: "easeOut",
            }}
            className={cn("inline-block whitespace-nowrap text-center", textClassName)}
          >
            {currentWord}
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.span>
  );
}
