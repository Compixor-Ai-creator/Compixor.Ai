"use client";
import "./tablet-flatten.css";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform, useMotionTemplate, useReducedMotion } from "framer-motion";

const VIDEO_SRC = "/brand/hero-demo.mp4";

export default function TabletFlatten({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const [small, setSmall] = useState(false);
  const [bad, setBad] = useState(false);
  const [ratio, setRatio] = useState(16 / 9);
  const [sound, setSound] = useState(false);
  const soundRef = useRef(false);
  const vid = useRef<HTMLVideoElement>(null);
  const card = useRef<HTMLDivElement>(null);

  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

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
    el.muted = !soundRef.current;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (!soundRef.current) el.muted = true;
        el.play().catch(() => {});
      } else {
        el.pause();
      }
    }, { threshold: 0.2 });
    io.observe(box);
    return () => io.disconnect();
  }, [reduce, bad]);

  const toggleSound = () => {
    const el = vid.current;
    if (!el) return;
    if (!soundRef.current) {
      el.muted = false;
      el.currentTime = 0;
      el.play().then(() => setSound(true)).catch(() => { el.muted = true; });
    } else {
      el.muted = true;
      setSound(false);
    }
  };

  const { scrollY } = useScroll();
  const p = useTransform(scrollY, [0, 460], [0, 1], { clamp: true });
  const rx = useTransform(p, [0, 1], [34, 0]);
  const sc = useTransform(p, [0, 1], [0.9, 1]);
  const transform = useMotionTemplate`rotateX(${rx}deg) scale(${sc})`;

  if (bad) return <div className="cx-tablet">{children}</div>; // video failed: old image

  const animate = !reduce && !small;

  return (
    <div className="cx-tablet has-video">
      <div className="cx-vwrap">
        <motion.div
          ref={card}
          className="cx-vcard"
          onContextMenu={(e) => e.preventDefault()}
          style={{ aspectRatio: ratio, ...(animate ? { transform } : null) }}
        >
          <video
            ref={vid}
            src={VIDEO_SRC}
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            disablePictureInPicture
            controlsList="nodownload noplaybackrate noremoteplayback"
            onContextMenu={(e) => e.preventDefault()}
            onError={() => setBad(true)}
            onLoadedMetadata={(e) => {
              const v = e.currentTarget;
              if (v.videoWidth && v.videoHeight) setRatio(v.videoWidth / v.videoHeight);
            }}
          />
          <button type="button" className="cx-play" onClick={toggleSound} aria-pressed={sound}>
            <i aria-hidden="true" />
            <span>{sound ? "Mute" : "Watch with sound"}</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
