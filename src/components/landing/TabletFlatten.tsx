"use client";
import "./tablet-flatten.css";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform, useMotionTemplate, useReducedMotion } from "framer-motion";

const VIDEO_SRC = "/brand/hero-demo.mp4";

export default function TabletFlatten({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const [small, setSmall] = useState(false);
  const [on, setOn] = useState(false);
  const [bad, setBad] = useState(false);
  const [ratio, setRatio] = useState(16 / 9);
  const vid = useRef<HTMLVideoElement>(null);
  const card = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const m = window.matchMedia("(max-width:1023px)");
    const f = () => setSmall(m.matches);
    f(); m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, []);

  // autoplay (muted) whenever the card is visible; pause when it leaves the screen
  useEffect(() => {
    const el = vid.current, box = card.current;
    if (!el || !box || reduce || bad) return;
    el.muted = true; // React does not always set the muted attribute; autoplay needs it
    const io = new IntersectionObserver(([e]) => {
      if (on) return;
      if (e.isIntersecting) el.play().catch(() => {}); else el.pause();
    }, { threshold: 0.2 });
    io.observe(box);
    return () => io.disconnect();
  }, [reduce, on, bad]);

  const { scrollY } = useScroll();
  const p = useTransform(scrollY, [0, 460], [0, 1], { clamp: true });
  const rx = useTransform(p, [0, 1], [34, 0]);
  const sc = useTransform(p, [0, 1], [0.9, 1]);
  const transform = useMotionTemplate`rotateX(${rx}deg) scale(${sc})`;
  const boxShadow = useTransform(p, [0, 1],
    ["0 10px 30px rgba(80,40,200,.15)", "0 30px 90px rgba(80,40,200,.40)"]);

  if (bad) return <div className="cx-tablet">{children}</div>; // video failed: old image

  const animate = !reduce && !small;
  const playSound = () => {
    const v = vid.current; if (!v) return;
    v.muted = false; v.currentTime = 0; v.controls = true; v.play().catch(() => {});
    setOn(true);
  };

  return (
    <div className="cx-tablet has-video">
      <div className="cx-vwrap">
        <motion.div ref={card} className="cx-vcard"
          style={{ aspectRatio: ratio, ...(animate ? { transform, boxShadow } : null) }}>
          <video ref={vid} src={VIDEO_SRC} muted loop playsInline autoPlay preload="auto"
            disablePictureInPicture
            onError={() => setBad(true)}
            onLoadedMetadata={(e) => {
              const v = e.currentTarget;
              if (v.videoWidth && v.videoHeight) setRatio(v.videoWidth / v.videoHeight);
            }} />
          {!on && (
            <button className="cx-play" onClick={playSound} aria-label="Play video with sound">
              <i aria-hidden="true" /><span>Watch with sound</span>
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
