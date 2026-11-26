"use client";

import React from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

export interface HeroFadeProps {
  children: React.ReactNode;
  className?: string;
}

export default function HeroFade({ children, className }: HeroFadeProps) {
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();
  const opacity = useTransform(scrollY, [0, 240], [1, 0]);
  const y = useTransform(scrollY, [0, 240], [0, -16]);
  // Restore pointerEvents: when scrolled past 200px, disable pointer-events so faded hero doesn't block clicks
  const pointerEvents = useTransform(scrollY, (v) => (v > 200 ? "none" : "auto"));

  return (
    <motion.div
      className={className}
      style={
        reduce
          ? { pointerEvents }
          : {
              opacity,
              y,
              pointerEvents,
              willChange: "transform, opacity",
            }
      }
    >
      {children}
    </motion.div>
  );
}
