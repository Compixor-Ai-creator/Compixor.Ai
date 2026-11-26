"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";

const RANGE = 500;

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
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Velocity motion value with active zero-reset mechanism
  const rawVelocity = useMotionValue(0);
  const lastScrollY = useRef(0);
  const lastTime = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    const m = window.matchMedia("(max-width: 768px)");
    const onChange = () => setIsMobile(m.matches);
    onChange();
    m.addEventListener("change", onChange);

    lastScrollY.current = window.scrollY;
    lastTime.current = performance.now();

    // Active scroll listener with velocity decay and guaranteed zero-reset
    const onScroll = () => {
      const now = performance.now();
      const currentY = window.scrollY;
      const dt = Math.max(now - lastTime.current, 8); // min 8ms to prevent div by 0
      const dy = currentY - lastScrollY.current;

      lastScrollY.current = currentY;
      lastTime.current = now;

      // Calculate instantaneous scroll velocity (px/sec), clamped to prevent spikes
      const instantVelocity = Math.max(-1200, Math.min(1200, (dy / dt) * 1000));
      rawVelocity.set(instantVelocity);

      // Clear any pending idle reset timer
      if (idleTimer.current) {
        clearTimeout(idleTimer.current);
      }

      // If user is at or above the top, immediately force 0 velocity
      if (currentY <= 2) {
        rawVelocity.set(0);
        return;
      }

      // When scrolling ceases, actively decay and snap velocity to 0
      // This completely solves the bug where useVelocity hangs with residual non-zero velocity
      idleTimer.current = setTimeout(() => {
        rawVelocity.set(0);
      }, 50);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      m.removeEventListener("change", onChange);
      window.removeEventListener("scroll", onScroll);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [rawVelocity]);

  // Spring with high damping (no bounce, settles smoothly and decisively to 0)
  const smoothVelocity = useSpring(rawVelocity, {
    stiffness: 180,
    damping: 34,
    mass: 0.2,
  });

  // Clamped subtle skew range (1.2deg desktop, 0.6deg mobile - stays strictly within 1-2deg limit)
  const maxSkew = isMobile ? 0.6 : 1.2;
  const skewY = useTransform(smoothVelocity, [-1200, 1200], [-maxSkew, maxSkew], {
    clamp: true,
  });

  // Parallax subtle offset with gentle spring
  const progress = useTransform(scrollY, [0, RANGE], [0, 1]);
  const smoothProgress = useSpring(progress, {
    stiffness: 120,
    damping: 28,
    mass: 0.3,
  });
  const y = useTransform(smoothProgress, [0, 1], [0, 14]);

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

  const isReduced = reduce || !mounted;

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
                transformOrigin: "50% 50%", // Always centered, never drifts to one side
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
