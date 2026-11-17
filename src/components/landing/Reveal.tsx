"use client";
import { useEffect, useRef } from "react";

export default function Reveal({
  children, className = "", delay = 0, itemSelector,
}: { children: React.ReactNode; className?: string; delay?: number; itemSelector?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current; if (!root) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets: HTMLElement[] = itemSelector
      ? Array.from(root.querySelectorAll<HTMLElement>(itemSelector))
      : [root];
    if (!targets.length) return;

    const cleanup = (el: HTMLElement) => {
      el.classList.remove("cx-rv", "cx-rv--in");
      el.style.transitionDelay = "";
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        el.classList.add("cx-rv--in");
        io.unobserve(el);
        const done = (ev: TransitionEvent) => {
          if (ev.propertyName !== "transform") return;
          clearTimeout(timer);
          el.removeEventListener("transitionend", done);
          cleanup(el); // hover transitions par delay/override na rahe
        };
        const timer = setTimeout(() => {
          el.removeEventListener("transitionend", done);
          cleanup(el);
        }, 1200);
        el.addEventListener("transitionend", done);
      });
    }, { rootMargin: "0px 0px -8% 0px" });

    targets.forEach((el, i) => {
      if (el.getBoundingClientRect().top < innerHeight * 0.92) return; // pehle se dikh raha
      el.classList.add("cx-rv");
      el.style.transitionDelay = `${delay + (itemSelector ? (i % 3) * 0.09 : 0)}s`;
      io.observe(el);
    });
    return () => io.disconnect();
  }, [delay, itemSelector]);

  return <div ref={ref} className={className}>{children}</div>;
}
