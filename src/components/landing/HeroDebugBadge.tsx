"use client";

import React, { useEffect, useState } from "react";

export default function HeroDebugBadge() {
  const [data, setData] = useState<{
    reducedMotion: boolean;
    windowScrollY: number;
    scrollTop: number;
    count: number;
    line1Transform: string;
    line1Opacity: string;
  } | null>(null);

  useEffect(() => {
    const checkDebug = () => {
      if (typeof window === "undefined") return false;
      const search = window.location.search || "";
      const hash = window.location.hash || "";
      return search.includes("debug=hero") || hash.includes("debug=hero");
    };

    const update = () => {
      if (!checkDebug()) {
        setData(null);
        return;
      }
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const scrollY = Math.round(window.scrollY);
      const scrollTop = Math.round(document.scrollingElement?.scrollTop ?? 0);
      const scrollLines = document.querySelectorAll(".cx-scroll-line");
      const firstLine = scrollLines[0];
      const style = firstLine ? window.getComputedStyle(firstLine) : null;

      setData({
        reducedMotion: reduced,
        windowScrollY: scrollY,
        scrollTop: scrollTop,
        count: scrollLines.length,
        line1Transform: style?.transform ?? "none",
        line1Opacity: style?.opacity ?? "1",
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    window.addEventListener("popstate", update);

    const interval = setInterval(update, 500);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("popstate", update);
      clearInterval(interval);
    };
  }, []);

  if (!data) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "12px",
        left: "12px",
        zIndex: 999999,
        pointerEvents: "none",
        background: "rgba(0, 0, 0, 0.88)",
        color: "#00ff66",
        border: "1px solid rgba(0, 255, 102, 0.4)",
        borderRadius: "8px",
        padding: "8px 12px",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: "11px",
        lineHeight: 1.4,
        boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
        maxWidth: "340px",
      }}
    >
      <div style={{ fontWeight: "bold", color: "#fff", marginBottom: "4px" }}>
        [HERO DEBUG: ?debug=hero]
      </div>
      <div>
        prefers-reduced-motion:{" "}
        <span style={{ color: data.reducedMotion ? "#ff4444" : "#00ff66" }}>
          {String(data.reducedMotion)}
        </span>
      </div>
      <div>window.scrollY: {data.windowScrollY}px</div>
      <div>scrollingElement.scrollTop: {data.scrollTop}px</div>
      <div>.cx-scroll-line count: {data.count}</div>
      <div>line1 transform: {data.line1Transform}</div>
      <div>line1 opacity: {data.line1Opacity}</div>
    </div>
  );
}
