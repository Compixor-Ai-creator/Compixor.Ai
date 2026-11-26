"use client";
import React from "react";
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

  // Scroll parallax with spring damping
  const progress = useTransform(scrollY, [0, RANGE], [0, 1]);
  const smoothProgress = useSpring(progress, { stiffness: 90, damping: 26, mass: 0.5 });
  const y = useTransform(smoothProgress, [0, 1], [0, 48]);

  // Scroll velocity momentum / subtle dynamic inertia
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 45, stiffness: 350 });
  const skewY = useTransform(smoothVelocity, [-1400, 1400], [-1.2, 1.2]);

  const lineVariants = {
    hidden: { y: "115%", opacity: 0 },
    visible: (customDelay: number) => ({
      y: "0%",
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
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
                willChange: "transform",
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
            style={{ display: "inline-block" }}
          >
            {line2}
          </motion.span>
        </span>
      </motion.h1>
    </div>
  );
}
