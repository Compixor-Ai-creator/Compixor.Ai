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

  // Scroll animations: scrollY 0 -> 450px
  // Line 1: y 0 -> -110px, opacity 1 -> 0.25
  const line1Y = useTransform(scrollY, [0, 450], [0, -110], { clamp: true });
  const line1Opacity = useTransform(scrollY, [0, 450], [1, 0.25], { clamp: true });

  // Line 2: y 0 -> -60px, opacity 1 -> 0.2 (Lines move apart, never overlap)
  const line2Y = useTransform(scrollY, [0, 450], [0, -60], { clamp: true });
  const line2Opacity = useTransform(scrollY, [0, 450], [1, 0.2], { clamp: true });

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
