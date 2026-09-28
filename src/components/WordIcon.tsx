import React from 'react';

interface WordIconProps {
  className?: string;
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  withBackdropSheet?: boolean;
}

const sizeMap = {
  sm: 32,
  md: 48,
  lg: 72,
  xl: 96,
};

/**
 * Microsoft Word (DOCX) Authentic Fluent Design 3D Icon
 * Matches the official Microsoft Office 365 / SlideSpeak aesthetic.
 */
export default function WordIcon({
  className = '',
  size = 'md',
  withBackdropSheet = true,
}: WordIconProps) {
  const pixelSize = typeof size === 'number' ? size : sizeMap[size] || 48;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      <svg
        viewBox="0 0 120 120"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible select-none drop-shadow-md"
        role="img"
        aria-label="Microsoft Word DOCX Document"
      >
        <defs>
          {/* Soft ambient drop shadows */}
          <filter id="ms-word-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0F3874" floodOpacity="0.28" />
          </filter>
          <filter id="ms-word-badge-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="2" dy="5" stdDeviation="4.5" floodColor="#08224A" floodOpacity="0.35" />
          </filter>
          <filter id="ms-sheet-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="3" stdDeviation="4" floodColor="#64748B" floodOpacity="0.2" />
          </filter>

          {/* Gradients for authentic Office 365 3D layered look */}
          <linearGradient id="ms-word-grad-light" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4BB6FA" />
            <stop offset="100%" stopColor="#2582EB" />
          </linearGradient>

          <linearGradient id="ms-word-grad-mid" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2582EB" />
            <stop offset="100%" stopColor="#185ABD" />
          </linearGradient>

          <linearGradient id="ms-word-grad-deep" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#185ABD" />
            <stop offset="100%" stopColor="#0E3D85" />
          </linearGradient>

          <linearGradient id="ms-word-badge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1F6AD6" />
            <stop offset="100%" stopColor="#0B377B" />
          </linearGradient>

          <linearGradient id="ms-paper-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F1F5F9" />
          </linearGradient>
        </defs>

        {/* Optional background tilted paper sheet (SlideSpeak style) */}
        {withBackdropSheet && (
          <g transform="translate(68, 54) rotate(14) translate(-32, -40)" filter="url(#ms-sheet-shadow)">
            <rect
              x="0"
              y="0"
              width="64"
              height="80"
              rx="10"
              fill="url(#ms-paper-grad)"
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />
            {/* Subtle lines on paper sheet */}
            <circle cx="32" cy="18" r="6" stroke="#E2E8F0" strokeWidth="2" fill="none" />
            <rect x="12" y="34" width="40" height="3" rx="1.5" fill="#E2E8F0" />
            <rect x="12" y="44" width="32" height="3" rx="1.5" fill="#E2E8F0" />
            <rect x="12" y="54" width="36" height="3" rx="1.5" fill="#E2E8F0" />
          </g>
        )}

        {/* Main 3D Word Document Body */}
        <g filter="url(#ms-word-shadow)">
          {/* Top layer (Lighter blue) */}
          <path
            d="M44 14 H84 C89.52 14 94 18.48 94 24 V44 H44 V14 Z"
            fill="url(#ms-word-grad-light)"
          />
          {/* Upper-right rounded corner clip */}
          <path
            d="M44 14 H84 C89.52 14 94 18.48 94 24 V44 H44 Z"
            fill="url(#ms-word-grad-light)"
            rx="12"
          />

          {/* Middle layer */}
          <path
            d="M44 44 H94 V70 H44 V44 Z"
            fill="url(#ms-word-grad-mid)"
          />

          {/* Bottom layer (Deep navy blue) */}
          <path
            d="M44 70 H94 V90 C94 95.52 89.52 100 84 100 H44 V70 Z"
            fill="url(#ms-word-grad-deep)"
          />

          {/* Main outer rounded frame uniting the right side */}
          <rect
            x="44"
            y="14"
            width="50"
            height="86"
            rx="12"
            fill="transparent"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1"
          />
        </g>

        {/* Foreground 'W' Emblem / Badge */}
        <g filter="url(#ms-word-badge-shadow)">
          <rect
            x="14"
            y="32"
            width="52"
            height="52"
            rx="13"
            fill="url(#ms-word-badge-grad)"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1.2"
          />

          {/* Authentic Bold Microsoft 'W' */}
          <path
            d="M26 43 L32.2 69 H36.6 L41 53.5 L45.4 69 H49.8 L56 43 H50.8 L47.4 60.5 L43.2 46 H38.8 L34.6 60.5 L31.2 43 H26 Z"
            fill="#FFFFFF"
            style={{
              filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.35))',
            }}
          />
        </g>
      </svg>
    </div>
  );
}
