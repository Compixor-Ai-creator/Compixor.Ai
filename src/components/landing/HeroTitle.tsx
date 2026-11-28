"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export interface HeroTitleProps {
  className?: string;
  line1?: React.ReactNode;
  line2?: React.ReactNode;
}

// Tune here: scroll distance and per-line motion
const SCROLL_RANGE: [number, number] = [0, 260];
const LINE1 = { y: -150, opacity: 0 };
const LINE2 = { y: -80, opacity: 0.05 };

export default function HeroTitle({
  className = "cx-h1",
  line1 = "Free Private PDF, Word &",
  line2 = "Photo Tools That Run in Your Browser",
}: HeroTitleProps) {
  // Default container = window. Do NOT pass a target/container.
  const { scrollY } = useScroll();

  const line1Y = useTransform(scrollY, SCROLL_RANGE, [0, LINE1.y]);
  const line1Opacity = useTransform(scrollY, SCROLL_RANGE, [1, LINE1.opacity]);
  const line2Y = useTransform(scrollY, SCROLL_RANGE, [0, LINE2.y]);
  const line2Opacity = useTransform(scrollY, SCROLL_RANGE, [1, LINE2.opacity]);

  return (
    <div className="cx-title">
      <h1 id="cx-hero-title" className={className}>
        <motion.span
          className="cx-scroll-line"
          style={{
            display: "block",
            y: line1Y,
            opacity: line1Opacity,
            willChange: "transform, opacity",
          }}
        >
          <span className="cx-line-enter-1" style={{ display: "inline-block" }}>
            {line1}
          </span>
        </motion.span>

        <motion.span
          className="cx-scroll-line"
          style={{
            display: "block",
            y: line2Y,
            opacity: line2Opacity,
            willChange: "transform, opacity",
          }}
        >
          <span
            className="cx-grad cx-line-enter-2"
            style={{ display: "inline-block" }}
          >
            {line2}
          </span>
        </motion.span>
      </h1>
    </div>
  );
}
