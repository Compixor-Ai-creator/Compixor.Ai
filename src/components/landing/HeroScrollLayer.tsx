"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface HeroScrollLayerProps {
  children: React.ReactNode;
  className?: string;
  y?: number;        // final y offset in px at the end of the range
  opacity?: number;  // final opacity at the end of the range
  range?: [number, number];
}

export default function HeroScrollLayer({
  children,
  className,
  y = -30,
  opacity = 0.35,
  range = [0, 450],
}: HeroScrollLayerProps) {
  const { scrollY } = useScroll();
  const yValue = useTransform(scrollY, range, [0, y]);
  const opacityValue = useTransform(scrollY, range, [1, opacity]);

  return (
    <motion.div
      className={`cx-scroll-line ${className ?? ""}`.trim()}
      style={{ y: yValue, opacity: opacityValue, willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}
