"use client";
import "./tablet-flatten.css";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform, useMotionTemplate,
  useMotionValueEvent, useReducedMotion } from "framer-motion";

const VIDEO_SRC = "/brand/hero-demo.mp4";
// tx, ty are % of the tablet box (so they scale at every width). Old px values: tx 7px, ty -86px.
const FROM = { sx: 0.985, sy: 0.695, rot: 0.6, tx: 0.94, ty: -20.4 };
const TO = { s: 1.5, ty: 16.67 }; // 16.67% = keeps the top edge fixed while growing 1.5x
const CLIP_FROM = "polygon(-0.41% 0.58%, 0.13% 0.19%, 2.00% 0.00%, 96.53% 0.00%, 98.40% 0.19%, 98.93% 0.58%, 109.90% 100.00%, -9.76% 100.00%)";
const CLIP_TO = "polygon(0% 0%, 0% 0%, 0% 0%, 100% 0%, 100% 0%, 100% 0%, 100% 100%, 0% 100%)"; // same point count as CLIP_FROM

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
  const p = useTransform(scrollY, [0, 480], [0, 1], { clamp: true });
  const sx = useTransform(p, [0, 1], [FROM.sx, TO.s]);
  const sy = useTransform(p, [0, 1], [FROM.sy, TO.s]);
  const rot = useTransform(p, [0, 1], [FROM.rot, 0]);
  const tx = useTransform(p, [0, 1], [FROM.tx, 0]);
  const ty = useTransform(p, [0, 1], [FROM.ty, TO.ty]);
  const transform = useMotionTemplate`scale(${sx},${sy}) rotate(${rot}deg) translate(${tx}%,${ty}%)`;
  const clipPath = useTransform(p, [0, 1], [CLIP_FROM, CLIP_TO]);
  const borderRadius = useTransform(p, [0, 1], ["0px", "20px"]);
  const boxShadow = useTransform(p, [0, 1],
    ["0 0 0 rgba(80,40,200,0)", "0 30px 80px rgba(80,40,200,.35)"]);

  useMotionValueEvent(p, "change", (v) => {
    if (reduce) return;
    const el = vid.current;
    if (!el || on) return;
    if (v > 0.9) el.play().catch(() => {}); else el.pause();
  });

  const hasVideo = !!VIDEO_SRC && !bad;
  const animate = !reduce && !small;
  return (
    <motion.div className={`cx-tablet${hasVideo ? " has-video" : ""}`}
      style={animate ? { transform, clipPath, borderRadius, boxShadow } : undefined}>
      {children}
      {hasVideo && (
        <>
          <video ref={vid} className="cx-tablet__video" src={`${VIDEO_SRC}#t=0.1`}
            muted loop playsInline preload="auto" controls={on} onError={() => setBad(true)} />
          {!on && (
            <button className="cx-play" aria-label="Play video"
              onClick={() => { const v = vid.current!; v.muted = false; v.currentTime = 0; v.play(); setOn(true); }}>
              <span />
            </button>
          )}
        </>
      )}
    </motion.div>
  );
}
