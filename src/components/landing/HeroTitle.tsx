"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
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
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Motion values for GPU-accelerated transform
  const skewY = useMotionValue(0);
  const y = useMotionValue(0);

  // Frame-by-frame velocity & smoothing refs
  const prevScrollY = useRef(0);
  const currentSkew = useRef(0);

  useEffect(() => {
    prevScrollY.current = window.scrollY;
    setMounted(true);

    const m = window.matchMedia("(max-width: 768px)");
    const onChange = () => setIsMobile(m.matches);
    onChange();
    m.addEventListener("change", onChange);

    return () => m.removeEventListener("change", onChange);
  }, []);

  const isReduced = reduce || !mounted;

  // Frame-by-frame physics loop: decoupled from scroll-event bursts
  useAnimationFrame((_time, delta) => {
    if (isReduced) {
      if (typeof window !== "undefined") {
        prevScrollY.current = window.scrollY;
      }
      if (skewY.get() !== 0) skewY.set(0);
      if (y.get() !== 0) y.set(0);
      return;
    }

    // Guard against 0 or huge delta spikes (e.g. tab switching)
    const safeDelta = Math.max(1, Math.min(100, delta || 16.7));

    const currentY = window.scrollY;
    const rawDeltaY = currentY - prevScrollY.current;
    prevScrollY.current = currentY;

    // Normalize deltaY to 60fps baseline (16.7ms)
    const deltaY = rawDeltaY * (16.7 / safeDelta);

    // 1. Position-based subtle Y parallax (0 to 22px over first 400px of scroll)
    const targetY = Math.min(22, currentY * 0.055);
    y.set(targetY);

    // 2. Velocity-based Skew: 2deg max desktop, 1deg mobile
    const maxDeg = isMobile ? 1.0 : 2.0;
    const k = isMobile ? 0.08 : 0.12;

    let targetSkew = 0;
    if (Math.abs(deltaY) >= 0.5 && currentY > 2) {
      targetSkew = Math.max(-maxDeg, Math.min(maxDeg, deltaY * k));
    }

    // 3. Frame-rate independent exponential smoothing
    const lerpFactor = 1 - Math.pow(1 - 0.14, safeDelta / 16.7);
    currentSkew.current += (targetSkew - currentSkew.current) * lerpFactor;

    // 4. Guaranteed Snap: When scrolling stops and skew decays below 0.01, or at page top, force EXACTLY 0
    if (currentY <= 1 || (Math.abs(deltaY) < 0.5 && Math.abs(currentSkew.current) < 0.01)) {
      currentSkew.current = 0;
    }

    skewY.set(currentSkew.current);
  });

  const lineVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: (customDelay: number) => ({
      y: "0%",
      opacity: 1,
      transition: {
        duration: 0.38,
        ease: [0.23, 1, 0.32, 1], // Emil Kowalski strong --ease-out curve
        delay: customDelay,
      },
    }),
  };

  return (
    <div className="cx-title">
      <motion.h1
        id="cx-hero-title"
        className={className}
        style={
          isReduced
            ? undefined
            : {
                y,
                skewY,
                transformOrigin: "50% 50%", // Always centered, zero horizontal drift
                willChange: "transform",
                z: 0,
              }
        }
      >
        <span
          className="cx-line-mask"
          style={{ display: "block", overflow: "hidden", paddingBottom: "0.06em" }}
        >
          <motion.span
            custom={0.06}
            initial={isReduced ? false : "hidden"}
            animate="visible"
            variants={lineVariants}
            style={{ display: "inline-block" }}
          >
            {line1}
          </motion.span>
        </span>
        <span
          className="cx-line-mask"
          style={{ display: "block", overflow: "hidden", paddingBottom: "0.08em" }}
        >
          <motion.span
            custom={0.18}
            initial={isReduced ? false : "hidden"}
            animate="visible"
            variants={lineVariants}
            className="cx-grad"
            style={{ display: "inline-block" }}
          >
            {line2}
          </motion.span>
        </span>
      </motion.h1>
    </div>
  );
}
