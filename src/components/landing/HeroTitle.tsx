"use client";
import { motion, useScroll, useSpring, useTransform, useReducedMotion } from "framer-motion";

const RANGE = 500;

export default function HeroTitle({ className, children }:
  { className?: string; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const progress = useTransform(scrollY, [0, RANGE], [0, 1]);
  const smooth = useSpring(progress, { stiffness: 100, damping: 30, mass: 0.5 });
  const y = useTransform(smooth, [0, 1], [0, 40]);
  return (
    <div className="cx-title">
      <span className="cx-title__glow" aria-hidden="true" />
      <motion.h1 id="cx-hero-title" className={className} style={reduce ? undefined : { y, willChange: "transform" }}>
        {children}
      </motion.h1>
    </div>
  );
}
