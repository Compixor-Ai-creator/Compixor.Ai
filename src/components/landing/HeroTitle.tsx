"use client";
import React, { useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useReducedMotion,
} from "framer-motion";

const RANGE = 500;

export default function HeroTitle({
  className = "cx-h1",
  line1 = "Free Private PDF, Word &",
  line2 = "Photo Tools That Run in Your Browser",
}: {
  className?: string;
  line1?: React.ReactNode;
  line2?: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const m = window.matchMedia("(max-width: 768px)");
    const onChange = () => setIsMobile(m.matches);
    onChange();
    m.addEventListener("change", onChange);
    return () => m.removeEventListener("change", onChange);
  }, []);

  // Scroll parallax with gentle damping (16px distance maintained)
  const progress = useTransform(scrollY, [0, RANGE], [0, 1]);
  const smoothProgress = useSpring(progress, { stiffness: 90, damping: 26, mass: 0.5 });
  const y = useTransform(smoothProgress, [0, 1], [0, 16]);

  // Scroll velocity momentum with smooth damping (stiffness ~120, damping ~24)
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { stiffness: 120, damping: 24 });

  // Clamped skew range: max 3.5deg desktop, 1.8deg mobile (half amount on mobile to prevent side slide)
  const maxSkew = isMobile ? 1.8 : 3.5;
  const skewY = useTransform(smoothVelocity, [-1200, 1200], [-maxSkew, maxSkew], { clamp: true });

  const lineVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: (customDelay: number) => ({
      y: "0%",
      opacity: 1,
      transition: {
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
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
          reduce
            ? undefined
            : {
                y,
                skewY,
                transformOrigin: "50% 50%",
                z: 0,
              }
        }
      >
        <span className="cx-line-mask" style={{ display: "block", overflow: "hidden", paddingBottom: "0.06em" }}>
          <motion.span
            custom={0.06}
            initial={reduce ? false : "hidden"}
            animate="visible"
            variants={lineVariants}
            style={{ display: "inline-block" }}
          >
            {line1}
          </motion.span>
        </span>
        <span className="cx-line-mask" style={{ display: "block", overflow: "hidden", paddingBottom: "0.08em" }}>
          <motion.span
            custom={0.20}
            initial={reduce ? false : "hidden"}
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
