"use client";
import "./tablet-flatten.css";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform, useMotionTemplate,
  useMotionValueEvent, useReducedMotion } from "framer-motion";

const VIDEO_SRC = "/brand/hero-demo.mp4";
const POSTER = "/brand/hero-orbit.png";

// p=0 values = CURRENT .cx-tablet values (hero.css se copy karo)
const FROM = { rx: 26, sx: 1, sy: 1, rot: 0, tx: 0, ty: 0 };
const CLIP_FROM = "polygon(-0.41% 0.58%, 0.13% 0.19%, 2.00% 0.00%, 96.53% 0.00%, 98.40% 0.19%, 98.93% 0.58%, 109.90% 100.00%, -9.76% 100.00%)";
const CLIP_TO = "polygon(0% 0%, 0% 0%, 0% 0%, 100% 0%, 100% 0%, 100% 0%, 100% 100%, 0% 100%)";

export default function TabletFlatten({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const [small, setSmall] = useState(false);
  const [on, setOn] = useState(false);
  const [bad, setBad] = useState(false);
  const vid = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const m = window.matchMedia("(max-width:1023px)");
    const f = () => setSmall(m.matches);
    f(); m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, []);

  const { scrollY } = useScroll();
  const p = useTransform(scrollY, [0, 420], [0, 1], { clamp: true });
  const rx = useTransform(p, [0, 1], [FROM.rx, 0]);
  const sx = useTransform(p, [0, 1], [FROM.sx, 1]);
  const sy = useTransform(p, [0, 1], [FROM.sy, 1]);
  const rot = useTransform(p, [0, 1], [FROM.rot, 0]);
  const tx = useTransform(p, [0, 1], [FROM.tx, 0]);
  const ty = useTransform(p, [0, 1], [FROM.ty, 0]);
  const transform = useMotionTemplate`rotateX(${rx}deg) scale(${sx},${sy}) rotate(${rot}deg) translate(${tx}px,${ty}px)`;
  const clipPath = useTransform(p, [0, 1], [CLIP_FROM, CLIP_TO]);

  useMotionValueEvent(p, "change", (v) => {
    if (reduce) return;
    const el = vid.current;
    if (!el || on) return;
    if (v > 0.9) el.play().catch(() => {}); else el.pause();
  });

  const animate = !reduce && !small;
  return (
    <motion.div
      className="cx-tablet"
      style={animate ? { transform, clipPath, transformOrigin: "50% 0", borderRadius: undefined } : undefined}
    >
      {children}
      {VIDEO_SRC && !bad && (
        <>
          <video
            ref={vid}
            className="cx-tablet__video"
            src={VIDEO_SRC}
            poster={POSTER}
            onError={() => setBad(true)}
            muted
            loop
            playsInline
            preload="metadata"
            controls={on}
          />
          {!on && (
            <button
              className="cx-play"
              aria-label="Play video"
              onClick={() => {
                const v = vid.current;
                if (!v) return;
                v.muted = false;
                v.currentTime = 0;
                v.play().catch(() => {});
                setOn(true);
              }}
            >
              <span />
            </button>
          )}
        </>
      )}
    </motion.div>
  );
}
