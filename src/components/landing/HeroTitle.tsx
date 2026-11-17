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
  const sy = useTransform(smooth, [0, 1], [6, 22]);
  const sb = useTransform(smooth, [0, 1], [10, small ? 16 : 28]);
  const sa = useTransform(smooth, [0, 1], [0.55, 0.9]);
  const dy = useTransform(smooth, [0, 1], [2, 10]);
  const db = useTransform(smooth, [0, 1], [4, 10]);
  const da = useTransform(smooth, [0, 1], [0.4, 0.6]);
  const filter = useMotionTemplate`drop-shadow(0px ${sy}px ${sb}px rgba(var(--cx-ts),${sa})) drop-shadow(0px ${dy}px ${db}px rgba(var(--cx-ts2),${da}))`;

  // reduced-motion: movement band, par static shadow dikhe
  const style = reduce
    ? { filter: "drop-shadow(0px 12px 20px rgba(var(--cx-ts),.6)) drop-shadow(0px 4px 6px rgba(var(--cx-ts2),.45))" }
    : { y, filter, willChange: "transform, filter" };

  return (
    <div className="cx-title">
      <span className="cx-title__glow" aria-hidden="true" />
      <motion.h1 id="cx-hero-title" className={className} style={style}>{children}</motion.h1>
    </div>
  );
}
