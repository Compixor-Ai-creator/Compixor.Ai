"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/utils/cn";

export interface ContainerTextFlipProps {
  /** Array of words to cycle through in the animation */
  words?: string[];
  /** Time in milliseconds between word transitions */
  interval?: number;
  /** Additional CSS classes to apply to the container */
  className?: string;
  /** Additional CSS classes to apply to the text */
  textClassName?: string;
  /** Duration of the transition animation in milliseconds */
  animationDuration?: number;
}

export function ContainerTextFlip({
  words = ["better", "modern", "beautiful", "awesome"],
  interval = 3000,
  className,
  textClassName,
  animationDuration = 700,
}: ContainerTextFlipProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [textMinWidth, setTextMinWidth] = useState<number | undefined>(undefined);
  const hiddenWordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const shouldReduceMotion = useReducedMotion();

  const wordsKey = useMemo(() => words.join("\0"), [words]);

  // Find the word with maximum characters as an instant CSS fallback before layout measurement
  const longestWord = useMemo(() => {
    return words.reduce((acc, word) => (word.length > acc.length ? word : acc), words[0] || "");
  }, [words]);

  // Measure all words accurately with the exact font and text styling
  useEffect(() => {
    const measureLongestWord = () => {
      const widths = hiddenWordRefs.current.map((el) => el?.getBoundingClientRect().width || 0);
      const maxWidth = Math.max(...widths, 0);
      if (maxWidth > 0) {
        setTextMinWidth(Math.ceil(maxWidth));
      }
    };

    measureLongestWord();

    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(measureLongestWord);
    }

    window.addEventListener("resize", measureLongestWord);
    return () => window.removeEventListener("resize", measureLongestWord);
  }, [wordsKey, textClassName]);

  // Word cycling interval (3000ms by default, cleaned up on unmount)
  useEffect(() => {
    if (words.length <= 1) return;

    const intervalId = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, interval);

    return () => clearInterval(intervalId);
  }, [words.length, wordsKey, interval]);

  const hasCustomBg = className && (className.includes("bg-") || className.includes("[background:"));
  const defaultBg = hasCustomBg
    ? ""
    : "[background:linear-gradient(to_bottom,#f3f4f6,#e5e7eb)] shadow-[inset_0_-1px_#d1d5db,inset_0_0_0_1px_#d1d5db,_0_4px_8px_#d1d5db] dark:[background:linear-gradient(to_bottom,#374151,#1f2937)] dark:shadow-[inset_0_-1px_#10171e,inset_0_0_0_1px_hsla(205,89%,46%,.24),_0_4px_8px_#00000052]";

  const currentWord = words[currentWordIndex] || "";

  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center rounded-xl px-3 py-0.5 text-center align-baseline whitespace-nowrap overflow-hidden max-w-full",
        defaultBg,
        className,
      )}
    >
      {/* Hidden measuring spans to calculate the exact width of the widest word */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 select-none opacity-0 whitespace-nowrap"
        style={{ visibility: "hidden" }}
      >
        {words.map((word, index) => (
          <span
            key={index}
            ref={(el) => {
              hiddenWordRefs.current[index] = el;
            }}
            className={cn("inline-block whitespace-nowrap", textClassName)}
          >
            {word}
          </span>
        ))}
      </span>

      {/* Sized text slot preventing container width jumps */}
      <span
        className="inline-flex items-center justify-center text-center whitespace-nowrap"
        style={{
          minWidth: textMinWidth ? `${textMinWidth}px` : `${longestWord.length}ch`,
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={currentWord}
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 10, filter: "blur(10px)" }
            }
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, filter: "blur(0px)" }
            }
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -10, filter: "blur(10px)" }
            }
            transition={{
              duration: shouldReduceMotion ? 0.15 : 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={cn("inline-flex items-center justify-center whitespace-nowrap text-center w-full", textClassName)}
          >
            {currentWord.split("").map((letter, index) => (
              <motion.span
                key={`${currentWord}-${index}`}
                initial={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : { opacity: 0, y: 6 }
                }
                animate={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : { opacity: 1, y: 0 }
                }
                transition={{
                  delay: shouldReduceMotion ? 0 : index * 0.02,
                  duration: shouldReduceMotion ? 0 : 0.35,
                  ease: "easeOut",
                }}
                className="inline-block"
              >
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
