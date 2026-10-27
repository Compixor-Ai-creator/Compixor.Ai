import React from 'react';

export interface FullDpIconProps extends React.SVGAttributes<SVGElement> {
  size?: number | string;
  className?: string;
  title?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
  variant?: 'full' | 'compact';
}

/**
 * FullDpIcon: Clean, theme-aware vector SVG icon for Compixor's "Full DP Maker" tool.
 * Option 3 design: Filled avatar + 4 corner framing brackets + 4-way expand arrows.
 * 
 * Features:
 * - 100% `currentColor` stroke & fill (adapts to light mode, dark mode, hover, active)
 * - Single source of truth for all placements (tool cards, nav, dropdown, footer, pills)
 * - viewBox 0 0 24 24 with uniform 1.85 stroke width, rounded line caps and joins
 * - Crisp retina geometry with shape-rendering="geometricPrecision"
 */
export default function FullDpIcon({
  size = 24,
  className = '',
  title,
  'aria-hidden': ariaHidden,
  variant, // Accepted for backwards compatibility
  ...props
}: FullDpIconProps) {
  const isDecorative = ariaHidden === true || ariaHidden === 'true';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
      className={className}
      aria-hidden={isDecorative ? 'true' : undefined}
      role={isDecorative ? 'presentation' : 'img'}
      {...props}
    >
      {!isDecorative && <title>{title || 'Full DP Maker'}</title>}

      {/* 4 Corner Framing Brackets */}
      <path d="M 3 7 V 5 C 3 3.9 3.9 3 5 3 H 7" />
      <path d="M 17 3 H 19 C 20.1 3 21 3.9 21 5 V 7" />
      <path d="M 3 17 V 19 C 3 20.1 3.9 21 5 21 H 7" />
      <path d="M 17 21 H 19 C 20.1 21 21 20.1 21 19 V 17" />

      {/* Avatar Head (Filled) */}
      <circle cx="11" cy="7.8" r="3.2" fill="currentColor" stroke="none" />

      {/* Avatar Bust (Filled with clearance notch for expand arrows) */}
      <path
        d="M 4.5 18 C 4.5 14.4 7.2 12.3 11 12.3 C 12.5 12.3 13.6 12.8 14.2 13.6 C 14.5 14.1 14.5 14.7 14.5 15.5 L 14.5 18 Z"
        fill="currentColor"
        stroke="none"
      />

      {/* 4-way Expand Arrows Badge (Bottom Right) */}
      {/* NW: ↖ */}
      <path d="M 16 15.2 L 13.6 12.8" />
      <path d="M 15.8 12.8 H 13.6 V 15" />

      {/* NE: ↗ */}
      <path d="M 17.6 15.2 L 20 12.8" />
      <path d="M 17.8 12.8 H 20 V 15" />

      {/* SW: ↙ */}
      <path d="M 16 16.8 L 13.6 19.2" />
      <path d="M 15.8 19.2 H 13.6 V 17" />

      {/* SE: ↘ */}
      <path d="M 17.6 16.8 L 20 19.2" />
      <path d="M 17.8 19.2 H 20 V 17" />
    </svg>
  );
}
