"use client";
import "./stars.css";
import { useEffect, useRef } from "react";

function rng(seed: number) {
  let s = seed;
  return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
}
const r = rng(7);
const DOTS = Array.from({ length: 90 }, () => ({
  x: +(r() * 100).toFixed(2),
  y: +(r() * 100).toFixed(2),
  s: +(1 + r() * 1.6).toFixed(1),
  d: +(r() * 5).toFixed(1),
  t: +(2.5 + r() * 3.5).toFixed(1),
}));

export default function Stars({ count = 70 }: { count?: number }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = rootRef.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle("cx-off", !e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="cx-stars" aria-hidden="true">
      {DOTS.slice(0, count).map((d, i) => (
        <i key={i} style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.s, height: d.s,
          animationDelay: `${d.d}s`, animationDuration: `${d.t}s` }} />
      ))}
    </div>
  );
}
