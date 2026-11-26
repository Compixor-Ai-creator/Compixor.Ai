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
  const [mounted, setMounted] = useState(false);

  // Single unified vertical motion value (GPU-accelerated translateY)
  const y = useMotionValue(0);

  // Velocity lag & frame synchronization refs
  const prevScrollY = useRef(0);
  const currentLag = useRef(0);

  useEffect(() => {
    prevScrollY.current = window.scrollY;
    setMounted(true);
  }, []);

  const isReduced = reduce || !mounted;

  // Frame-by-frame physics: pure vertical parallax + subtle velocity lag (zero skew/tilt)
  useAnimationFrame((_time, delta) => {
    if (isReduced) {
      if (typeof window !== "undefined") {
        prevScrollY.current = window.scrollY;
      }
      if (y.get() !== 0) y.set(0);
      return;
    }

    // Guard against 0 or extreme delta spikes (e.g. tab switching)
    const safeDelta = Math.max(1, Math.min(100, delta || 16.7));

    const currentY = window.scrollY;
    const rawDeltaY = currentY - prevScrollY.current;
    prevScrollY.current = currentY;

    // Normalize deltaY to 60fps baseline (16.7ms)
    const deltaY = rawDeltaY * (16.7 / safeDelta);

    // 1. Position-based subtle Y parallax (0 to 22px over first 400px of scroll)
    const targetParallax = Math.min(22, currentY * 0.055);

    // 2. Velocity-based gentle Y-lag (max 4px up or down, absolutely zero tilt/skew/horizontal drift)
    let targetLag = 0;
    if (Math.abs(deltaY) >= 0.5 && currentY > 2) {
      targetLag = Math.max(-4, Math.min(4, deltaY * 0.08));
    }

    // 3. Frame-rate independent exponential smoothing
    const lerpFactor = 1 - Math.pow(1 - 0.14, safeDelta / 16.7);
    currentLag.current += (targetLag - currentLag.current) * lerpFactor;

    // 4. Guaranteed Snap: When scrolling stops and lag decays below 0.02px, or at page top, force EXACTLY 0
    if (currentY <= 1 || (Math.abs(deltaY) < 0.5 && Math.abs(currentLag.current) < 0.02)) {
      currentLag.current = 0;
    }

    // Total Y: position parallax + subtle velocity inertia
    const totalY = currentY <= 1 ? 0 : targetParallax + currentLag.current;
    y.set(totalY);
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
                transformOrigin: "50% 50%",
                willChange: "transform",
                filter: "none",
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
