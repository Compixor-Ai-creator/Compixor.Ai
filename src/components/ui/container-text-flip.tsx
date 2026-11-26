"use client";

import React, { useState, useEffect, useId } from "react";
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
  animationDuration = 240,
}: ContainerTextFlipProps) {
  const id = useId();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const currentWord = words[currentWordIndex] || "";

  // Word cycling interval
  useEffect(() => {
    if (words.length <= 1) return;

    const intervalId = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, interval);

    return () => clearInterval(intervalId);
  }, [words.length, interval]);

  return (
    <span
      className={cn(
        "relative inline-grid items-center justify-center border border-white/60 dark:border-white/20 bg-white/45 dark:bg-white/[0.08] shadow-[0_8px_32px_rgba(124,58,237,0.12)] rounded-[0.3em] overflow-visible align-baseline text-center max-w-full",
        className
      )}
      style={{
        padding: "0.04em 0.3em",
        verticalAlign: "baseline",
        WebkitBackdropFilter: "blur(14px) saturate(160%)",
        backdropFilter: "blur(14px) saturate(160%)",
      }}
    >
      {/* Invisible measurement stack: sizes the pill container naturally to the widest word without animating width or causing layout reflow */}
      <span
        aria-hidden="true"
        className="invisible pointer-events-none select-none inline-grid [grid-area:1/1] items-center justify-center"
      >
        {words.map((w, idx) => (
          <span
            key={idx}
            className={cn("whitespace-nowrap px-[0.3em] [grid-area:1/1] opacity-0", textClassName)}
          >
            {w}
          </span>
        ))}
      </span>

      {/* Active animated word: transform & opacity only, 100% on GPU */}
      <span className="[grid-area:1/1] inline-flex items-center justify-center text-center w-full whitespace-nowrap">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={`${currentWord}-${id}`}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{
              duration: shouldReduceMotion ? 0 : animationDuration / 1000,
              ease: [0.23, 1, 0.32, 1], // Emil Kowalski strong --ease-out
            }}
            className={cn("inline-block whitespace-nowrap text-center px-[0.3em]", textClassName)}
          >
            {currentWord}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
