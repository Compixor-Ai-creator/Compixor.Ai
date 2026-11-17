"use client";
import { useEffect, useState } from "react";
import {
  motion, useScroll, useSpring, useTransform,
  useMotionTemplate, useReducedMotion,
} from "framer-motion";

const RANGE = 500; // 540 nahi, jaldi dikhe

export default function HeroTitle({
  className, children,
}: { className?: string; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const [small, setSmall] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width:768px)");
    const on = () => setSmall(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const { scrollY } = useScroll();
  const progress = useTransform(scrollY, [0, RANGE], [0, 1]);
  const smooth = useSpring(progress, { stiffness: 100, damping: 30, mass: 0.5 });

  const y = useTransform(smooth, [0, 1], [0, 40]);
  const shadowY = useTransform(smooth, [0, 1], [6, 24]);
  const shadowBlur = useTransform(smooth, [0, 1], [10, small ? 16 : 28]);
  const shadowAlpha = useTransform(smooth, [0, 1], [0.35, 0.7]);
  const filter = useMotionTemplate`drop-shadow(0px ${shadowY}px ${shadowBlur}px rgba(124,58,237,${shadowAlpha}))`;

  // reduced-motion: movement band, par static shadow dikhe
  const style = reduce
    ? { filter: "drop-shadow(0px 12px 18px rgba(124,58,237,.5))" }
    : { y, filter, willChange: "transform, filter" };

  return (
    <div className="cx-title">
      <span className="cx-title__glow" aria-hidden="true" />
      <motion.h1 id="cx-hero-title" className={className} style={style}>{children}</motion.h1>
    </div>
  );
}
