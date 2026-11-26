/**
 * Central Animation Reveal Tokens for Framer Motion components.
 * Keep in sync with CSS tokens in src/app/globals.css (--reveal-*).
 * Update both files together when modifying reveal values.
 */
export const REVEAL = {
  dist: 36, // default rise distance (px) -> maps to --reveal-dist: 36px
  cardDist: 40, // cards rise distance (px) -> maps to --reveal-card-dist: 40px
  dur: 0.6, // default reveal duration (s) -> maps to --reveal-dur: 600ms
  ease: [0.16, 1, 0.3, 1] as const, // maps to --reveal-ease: cubic-bezier(0.16, 1, 0.3, 1)
  stagger: 0.09, // gap between siblings (s) -> maps to --reveal-stagger: 90ms
  staggerCap: 0.45, // maximum stagger delay cap (s) -> maps to --reveal-stagger-cap: 450ms
} as const;
