"use client";

import React, { useState, useEffect, useId, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
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
  const id = useId();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [width, setWidth] = useState<number | "auto">("auto");
  const textRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const updateWidthForWord = () => {
    if (textRef.current) {
      // Add padding (16px total) to the measured text width
      const textWidth = textRef.current.scrollWidth + 24;
      setWidth(textWidth);
    }
  };

  useEffect(() => {
    // Update width whenever the word changes
    updateWidthForWord();
  }, [currentWordIndex]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, interval);

    return () => clearInterval(intervalId);
  }, [words, interval]);

  const hasCustomBg = className && (className.includes("bg-") || className.includes("[background:"));
  const defaultBg = hasCustomBg
    ? ""
    : "[background:linear-gradient(to_bottom,#f3f4f6,#e5e7eb)] shadow-[inset_0_-1px_#d1d5db,inset_0_0_0_1px_#d1d5db,_0_4px_8px_#d1d5db] dark:[background:linear-gradient(to_bottom,#374151,#1f2937)] dark:shadow-[inset_0_-1px_#10171e,inset_0_0_0_1px_hsla(205,89%,46%,.24),_0_4px_8px_#00000052]";

  return (
    <motion.span
      layout
      layoutId={`words-here-${id}`}
      animate={{ width: width === "auto" ? "auto" : width }}
      transition={{
        duration: shouldReduceMotion ? 0 : animationDuration / 1800,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "relative inline-flex items-center justify-center rounded-xl px-3 py-0.5 text-center align-baseline",
        defaultBg,
        className,
      )}
      key={words[currentWordIndex]}
    >
      <motion.span
        transition={{
          duration: shouldReduceMotion ? 0 : animationDuration / 1000,
          ease: "easeInOut",
        }}
        className={cn("inline-flex items-center justify-center whitespace-nowrap", textClassName)}
        ref={textRef}
        layoutId={`word-div-${words[currentWordIndex]}-${id}`}
      >
        <span className="inline-flex">
          {words[currentWordIndex].split("").map((letter, index) => (
            <motion.span
              key={`${currentWordIndex}-${index}`}
              className="inline-block"
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      filter: "blur(12px)",
                      y: 8,
                    }
              }
              animate={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : {
                      opacity: 1,
                      filter: "blur(0px)",
                      y: 0,
                    }
              }
              transition={{
                delay: shouldReduceMotion ? 0 : index * 0.03,
                duration: shouldReduceMotion ? 0.15 : 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {letter === " " ? " " : letter}
            </motion.span>
          ))}
        </span>
      </motion.span>
    </motion.span>
  );
}
