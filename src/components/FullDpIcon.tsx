import React, { useId } from 'react';

export interface FullDpIconProps extends React.SVGAttributes<SVGElement> {
  variant?: 'full' | 'compact';
  size?: number | string;
  className?: string;
  title?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
}

/**
 * FullDpIcon: Unified theme-aware vector SVG icon for Compixor's "Full DP Maker" tool.
 * 
 * Features:
 * - 100% `currentColor` stroke & fill (inherits CSS text color, works seamlessly in light & dark mode)
 * - Two distinct variants:
 *    - `full`: 64x64 viewBox with central avatar, orbit track, and all 8 social media badges
 *      (WhatsApp, Instagram, Facebook, Telegram, LinkedIn, Discord, YouTube, X).
 *    - `compact`: 24x24 viewBox with central avatar, orbit track, and 4 major badges
 *      (WhatsApp, Instagram, Facebook, Telegram) optimized for small UI (nav, pills, buttons).
 * - Automatic variant resolution if omitted (>=40px => 'full', else 'compact').
 * - Crisp retina geometry with shape-rendering="geometricPrecision".
 */
export default function FullDpIcon({
  variant,
  size = 24,
  className = '',
  title,
  'aria-hidden': ariaHidden,
  ...props
}: FullDpIconProps) {
  const rawId = useId();
  const maskId = `orbit-mask-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  // Auto-detect variant if not explicitly provided
  const resolvedVariant: 'full' | 'compact' =
    variant ??
    (typeof size === 'number' && size >= 40
      ? 'full'
      : typeof size === 'string' && parseInt(size, 10) >= 40
      ? 'full'
      : 'compact');

  const isDecorative = ariaHidden === true || ariaHidden === 'true';

  if (resolvedVariant === 'compact') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        shapeRendering="geometricPrecision"
        className={className}
        aria-hidden={isDecorative ? 'true' : undefined}
        role={isDecorative ? 'presentation' : 'img'}
        {...props}
      >
        {!isDecorative && <title>{title || 'Full DP Maker'}</title>}
        <defs>
          <mask id={maskId}>
            <rect x="0" y="0" width="24" height="24" fill="#ffffff" />
            {/* Cutouts for 4 orbiting badges */}
            <circle cx="12" cy="3.5" r="3.4" fill="#000000" />
            <circle cx="20.5" cy="12" r="3.4" fill="#000000" />
            <circle cx="12" cy="20.5" r="3.4" fill="#000000" />
            <circle cx="3.5" cy="12" r="3.4" fill="#000000" />
          </mask>
        </defs>

        {/* Central Avatar Frame */}
        <circle cx="12" cy="12" r="5.1" stroke="currentColor" strokeWidth="1.3" fill="none" />

        {/* Central Avatar Head & Torso */}
        <circle cx="12" cy="9.5" r="1.6" fill="currentColor" stroke="none" />
        <path
          d="M 8.2 15 C 8.6 13 10 12.2 12 12.2 C 14 12.2 15.4 13 15.8 15 C 14.8 16.2 13.5 16.8 12 16.8 C 10.5 16.8 9.2 16.2 8.2 15 Z"
          fill="currentColor"
          stroke="none"
        />

        {/* Orbiting Track Ring (Masked around badges) */}
        <circle
          cx="12"
          cy="12"
          r="8.5"
          stroke="currentColor"
          strokeWidth="1.3"
          fill="none"
          mask={`url(#${maskId})`}
          strokeLinecap="round"
        />

        {/* 1. WhatsApp Badge (Top, 12:00) */}
        <circle cx="12" cy="3.5" r="3" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <path
          d="M 12 1.8 C 10.9 1.8 10.1 2.6 10.1 3.5 C 10.1 3.9 10.2 4.2 10.4 4.5 L 10.2 5.2 L 11 5 C 11.3 5.1 11.6 5.2 12 5.2 C 13.1 5.2 13.9 4.4 13.9 3.5 C 13.9 2.6 13.1 1.8 12 1.8 Z"
          stroke="currentColor"
          strokeWidth="0.65"
          fill="none"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="3.5" r="0.65" fill="currentColor" stroke="none" />

        {/* 2. Instagram Badge (Right, 3:00) */}
        <circle cx="20.5" cy="12" r="3" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <rect x="19" y="10.5" width="3" height="3" rx="0.9" stroke="currentColor" strokeWidth="0.8" fill="none" />
        <circle cx="20.5" cy="12" r="0.75" stroke="currentColor" strokeWidth="0.65" fill="none" />

        {/* 3. Facebook Badge (Bottom, 6:00) */}
        <circle cx="12" cy="20.5" r="3" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <path
          d="M 12.6 18.9 C 11.9 18.9 11.5 19.3 11.5 20 V 20.6 H 10.7 V 21.5 H 11.5 V 22.9 H 12.5 V 21.5 H 13.2 L 13.3 20.6 H 12.5 V 20.1 C 12.5 19.8 12.6 19.7 12.9 19.7 H 13.3 V 18.9 Z"
          fill="currentColor"
          stroke="none"
        />

        {/* 4. Telegram Badge (Left, 9:00) */}
        <circle cx="3.5" cy="12" r="3" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <path d="M 2.1 12.1 L 4.9 10.8 L 4 13.4 L 3.3 12.7 L 3 13.3 L 2.8 12.6 Z" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  // Full Variant (viewBox 0 0 64 64) with all 8 social badges
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      shapeRendering="geometricPrecision"
      className={className}
      aria-hidden={isDecorative ? 'true' : undefined}
      role={isDecorative ? 'presentation' : 'img'}
      {...props}
    >
      {!isDecorative && <title>{title || 'Full DP Maker'}</title>}
      <defs>
        <mask id={maskId}>
          <rect x="0" y="0" width="64" height="64" fill="#ffffff" />
          {/* Cutouts for 8 orbiting badges */}
          <circle cx="32" cy="9" r="6.2" fill="#000000" />
          <circle cx="48.26" cy="15.74" r="6.2" fill="#000000" />
          <circle cx="55" cy="32" r="6.2" fill="#000000" />
          <circle cx="48.26" cy="48.26" r="6.2" fill="#000000" />
          <circle cx="32" cy="55" r="6.2" fill="#000000" />
          <circle cx="15.74" cy="48.26" r="6.2" fill="#000000" />
          <circle cx="9" cy="32" r="6.2" fill="#000000" />
          <circle cx="15.74" cy="15.74" r="6.2" fill="#000000" />
        </mask>
      </defs>

      {/* Central Avatar Frame */}
      <circle cx="32" cy="32" r="13.2" stroke="currentColor" strokeWidth="1.8" fill="none" />

      {/* Central Avatar Head & Torso */}
      <circle cx="32" cy="25" r="3.8" fill="currentColor" stroke="none" />
      <path
        d="M 22.4 39.5 C 23.2 34.5 26.8 32 32 32 C 37.2 32 40.8 34.5 41.6 39.5 C 39.2 42.6 35.8 44.2 32 44.2 C 28.2 44.2 24.8 42.6 22.4 39.5 Z"
        fill="currentColor"
        stroke="none"
      />

      {/* Orbiting Track Ring (Masked around badges) */}
      <circle
        cx="32"
        cy="32"
        r="23"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        mask={`url(#${maskId})`}
        strokeLinecap="round"
      />

      {/* 1. WhatsApp Badge (Top, 12:00 / 0°) */}
      <circle cx="32" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.3" fill="none" />
      <path
        d="M 32 5.9 C 30.2 5.9 28.8 7.3 28.8 9 C 28.8 9.6 29 10.2 29.3 10.7 L 28.9 12.1 L 30.4 11.7 C 30.9 12 31.4 12.1 32 12.1 C 33.8 12.1 35.2 10.7 35.2 9 C 35.2 7.3 33.8 5.9 32 5.9 Z"
        stroke="currentColor"
        strokeWidth="0.85"
        fill="none"
        strokeLinejoin="round"
      />
      <path
        d="M 30.7 8 C 30.5 8 30.3 8.2 30.3 8.5 C 30.3 9.4 31 10.1 31.9 10.1 C 32.2 10.1 32.4 9.9 32.4 9.6 L 31.9 9.1 L 31.5 9.3 C 31.3 9 31.2 8.9 31 8.7 L 31.2 8.3 Z"
        fill="currentColor"
        stroke="none"
      />

      {/* 2. Instagram Badge (1:30 / 45°) */}
      <circle cx="48.26" cy="15.74" r="5.5" stroke="currentColor" strokeWidth="1.3" fill="none" />
      <rect x="45.5" y="13" width="5.5" height="5.5" rx="1.6" stroke="currentColor" strokeWidth="0.9" fill="none" />
      <circle cx="48.25" cy="15.75" r="1.35" stroke="currentColor" strokeWidth="0.8" fill="none" />
      <circle cx="50.1" cy="13.9" r="0.4" fill="currentColor" stroke="none" />

      {/* 3. Facebook Badge (3:00 / 90°) */}
      <circle cx="55" cy="32" r="5.5" stroke="currentColor" strokeWidth="1.3" fill="none" />
      <path
        d="M 55.8 29.5 C 54.8 29.5 54.2 30.1 54.2 31.1 V 32.1 H 53.2 V 33.4 H 54.2 V 36 H 55.6 V 33.4 H 56.7 L 56.9 32.1 H 55.6 V 31.3 C 55.6 30.9 55.8 30.7 56.2 30.7 H 56.9 V 29.5 Z"
        fill="currentColor"
        stroke="none"
      />

      {/* 4. Telegram Badge (4:30 / 135°) */}
      <circle cx="48.26" cy="48.26" r="5.5" stroke="currentColor" strokeWidth="1.3" fill="none" />
      <path d="M 45.8 48.3 L 51.4 46 L 49.6 51.2 L 48.2 49.6 L 47.7 50.8 L 47.4 49.3 Z" fill="currentColor" stroke="none" />

      {/* 5. LinkedIn Badge (6:00 / 180°) */}
      <circle cx="32" cy="55" r="5.5" stroke="currentColor" strokeWidth="1.3" fill="none" />
      <circle cx="29.9" cy="52.7" r="0.55" fill="currentColor" stroke="none" />
      <rect x="29.35" y="53.7" width="1.1" height="3.4" rx="0.2" fill="currentColor" stroke="none" />
      <path
        d="M 31.6 53.7 H 32.7 V 54.3 C 33 53.9 33.5 53.6 34.2 53.6 C 35.1 53.6 35.7 54.1 35.7 55.1 V 57.1 H 34.6 V 55.3 C 34.6 54.9 34.4 54.6 33.9 54.6 C 33.3 54.6 32.7 55 32.7 55.7 V 57.1 H 31.6 Z"
        fill="currentColor"
        stroke="none"
      />

      {/* 6. Discord Badge (7:30 / 225°) */}
      <circle cx="15.74" cy="48.26" r="5.5" stroke="currentColor" strokeWidth="1.3" fill="none" />
      <path
        d="M 13 46.5 C 14 46.1 15.6 46 16.8 46.3 L 18 46.6 C 18.3 47.4 18.7 48.4 18.7 49.2 C 17.7 49.7 16.7 50 15.6 50 C 15.4 49.6 15 49.2 14.7 48.9 C 15.4 48.7 15.8 48.2 15.8 48.2 C 15.2 48.6 14.4 48.8 13.8 48.8 C 13.2 48.8 12.4 48.6 11.8 48.2 C 11.8 48.2 12.2 48.7 12.9 48.9 C 12.6 49.2 12.2 49.6 12 50 C 10.9 50 9.9 49.7 8.9 49.2 C 8.9 48.4 9.3 47.4 9.6 46.6 L 10.8 46.3 C 12 46 13 46.5 13 46.5 Z"
        stroke="currentColor"
        strokeWidth="0.85"
        fill="none"
      />
      <circle cx="14" cy="48" r="0.55" fill="currentColor" stroke="none" />
      <circle cx="17.1" cy="48" r="0.55" fill="currentColor" stroke="none" />

      {/* 7. YouTube Badge (9:00 / 270°) */}
      <circle cx="9" cy="32" r="5.5" stroke="currentColor" strokeWidth="1.3" fill="none" />
      <rect x="6.1" y="29.7" width="5.8" height="4.6" rx="1.4" stroke="currentColor" strokeWidth="0.9" fill="none" />
      <polygon points="8.3,31.1 10.5,32 8.3,32.9" fill="currentColor" stroke="none" />

      {/* 8. X Badge (10:30 / 315°) */}
      <circle cx="15.74" cy="15.74" r="5.5" stroke="currentColor" strokeWidth="1.3" fill="none" />
      <path
        d="M 13.5 13.5 L 15.8 15.7 L 13.5 18 H 14.5 L 16.3 16.2 L 17.8 18 H 18.7 L 16.4 15.7 L 18.6 13.5 H 17.6 L 15.9 15.2 L 14.5 13.5 Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}
