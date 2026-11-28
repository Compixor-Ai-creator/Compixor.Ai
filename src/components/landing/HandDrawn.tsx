"use client";

import React from "react";

export interface HandDrawnProps {
  variant: "circle" | "underline";
  children: React.ReactNode;
  className?: string;
}

export default function HandDrawn({
  variant,
  children,
  className = "",
}: HandDrawnProps) {
  return (
    <span className={`cx-hd cx-hd--${variant} ${className}`.trim()}>
      <span className="cx-hd__text">{children}</span>
      {variant === "circle" ? (
        <svg
          className="cx-hd__svg cx-hd__svg--circle"
          viewBox="0 0 200 80"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            className="cx-hd__path cx-hd__path--circle"
            d="M 46,8 C 102,2 178,4 195,30 C 201,52 182,74 108,76 C 36,78 4,62 5,38 C 6,16 64,6 126,10"
            pathLength={1}
            vectorEffect="non-scaling-stroke"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          className="cx-hd__svg cx-hd__svg--underline"
          viewBox="0 0 220 26"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            className="cx-hd__path cx-hd__path--underline"
            d="M 4,14 Q 54,21 106,12 T 196,14"
            pathLength={1}
            vectorEffect="non-scaling-stroke"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            className="cx-hd__dot"
            cx="211"
            cy="14"
            r="2.8"
            fill="currentColor"
          />
        </svg>
      )}
    </span>
  );
}
