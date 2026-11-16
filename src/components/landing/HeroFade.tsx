"use client";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

export default function HeroFade({ children, className }: { children: React.ReactNode; className?: string }) {
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();
  const opacity = useTransform(scrollY, [0, 240], [1, 0]);
  const y = useTransform(scrollY, [0, 240], [0, -40]);
  const pe = useTransform(scrollY, (v) => (v > 200 ? "none" : "auto"));
  return (
    <motion.div className={className} style={reduce ? undefined : { opacity, y, pointerEvents: pe }}>
      {children}
    </motion.div>
  );
}
