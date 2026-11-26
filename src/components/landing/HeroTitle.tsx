"use client";

import React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";

export interface HeroTitleProps {
  className?: string;
  line1?: React.ReactNode;
  line2?: React.ReactNode;
}

export default function HeroTitle({
  className = "cx-h1",
  line1 = "Free Private PDF, Word &",
  line2 = "Photo Tools That Run in Your Browser",
}: HeroTitleProps) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();

  // Scroll animations: scrollY 0 -> 400px
  // Line 1: y 0 -> -70px, opacity 1 -> 0.55
  const line1Y = useTransform(scrollY, [0, 400], [0, -70], { clamp: true });
  const line1Opacity = useTransform(scrollY, [0, 400], [1, 0.55], { clamp: true });

  // Line 2: y 0 -> -40px, opacity 1 -> 0.4 (Line 1 moves up more so lines diverge cleanly)
  const line2Y = useTransform(scrollY, [0, 400], [0, -40], { clamp: true });
  const line2Opacity = useTransform(scrollY, [0, 400], [1, 0.4], { clamp: true });

  return (
    <div className="cx-title">
      <h1 id="cx-hero-title" className={className}>
        <span className="cx-line-wrap" style={{ display: "block" }}>
          <motion.span
            style={
              reduce
                ? { display: "block" }
                : {
                    display: "block",
                    y: line1Y,
                    opacity: line1Opacity,
                    willChange: "transform",
                  }
            }
          >
            <span className="cx-line-enter-1" style={{ display: "inline-block" }}>
              {line1}
            </span>
          </motion.span>
        </span>
        <span className="cx-line-wrap" style={{ display: "block" }}>
          <motion.span
            style={
              reduce
                ? { display: "block" }
                : {
                    display: "block",
                    y: line2Y,
                    opacity: line2Opacity,
                    willChange: "transform",
                  }
            }
          >
            <span className="cx-grad cx-line-enter-2" style={{ display: "inline-block" }}>
              {line2}
            </span>
          </motion.span>
        </span>
      </h1>
    </div>
  );
}
