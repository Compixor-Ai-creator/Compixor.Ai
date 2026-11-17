"use client";
import "./tablet-flatten.css";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
  useSpring,
} from "framer-motion";

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
    f();
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, []);

  // autoplay (muted) whenever the card is visible; pause when it leaves the screen
  useEffect(() => {
    const el = vid.current, box = card.current;
    if (!box) return;
    const io = new IntersectionObserver(([e]) => {
      document.documentElement.classList.toggle("cx-card-view", e.isIntersecting);
      if (el && !bad) {
        if (e.isIntersecting) {
          if (!soundRef.current) el.muted = true;
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      }
    }, { threshold: 0.2 });
    io.observe(box);
    return () => {
      document.documentElement.classList.remove("cx-card-view");
      io.disconnect();
    };
  }, [bad]);

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
  const p = useTransform(scrollY, [0, 460], [0, 1]);
  const sp = useSpring(p, { stiffness: 80, damping: 24, mass: 0.6 });
  const sm = reduce ? p : sp;
  const rotateX = useTransform(sm, [0, 1], [34, 0]);
  const scale = useTransform(sm, [0, 1], [0.9, 1]);
  const shade = useTransform(sm, [0, 1], reduce ? [0, 0] : [1, 0]);
  const transform = useMotionTemplate`rotateX(${rotateX}deg) scale(${scale})`;

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
          <motion.div className="cx-vshade" style={{ opacity: shade }} aria-hidden="true" />
        </motion.div>
        <button type="button" className="cx-play" onClick={toggleSound} aria-pressed={sound}>
          <i aria-hidden="true" />
          <span>{sound ? "Mute" : "Watch with sound"}</span>
        </button>
      </div>
    </div>
  );
}
