'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Sparkles, Check, MoveHorizontal } from 'lucide-react';

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
}

export const DEFAULT_BG_PRESETS: ColorOption[] = [
  { id: 'blue', name: 'Passport Blue', hex: '#2D7DE6' },
  { id: 'royal', name: 'NADRA Royal', hex: '#1D4ED8' },
  { id: 'white', name: 'Pure White', hex: '#FFFFFF' },
  { id: 'gray', name: 'Studio Gray', hex: '#E5E7EB' },
  { id: 'sky', name: 'Sky Blue', hex: '#87CEEB' },
  { id: 'transparent', name: 'Transparent', hex: 'transparent' },
];

export interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt?: string;
  afterAlt?: string;
  beforeLabel?: string;
  afterLabel?: string;
  selectedBgColor?: string;
  onBgColorChange?: (colorHex: string) => void;
  showColorSwitcher?: boolean;
  colorOptions?: ColorOption[];
  aspectRatio?: string; // e.g. "3/4" or "35/45"
  className?: string;
  resetKey?: string | number;
  initialPosition?: number; // 0 - 100, default 50
  showBiometricGuide?: boolean;
}

export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt = 'Original casual portrait before background removal',
  afterAlt = 'Processed biometric portrait with transparent hair matting and solid background',
  beforeLabel = 'Before (Casual)',
  afterLabel = 'After (AI Matting)',
  selectedBgColor: controlledBgColor,
  onBgColorChange,
  showColorSwitcher = true,
  colorOptions = DEFAULT_BG_PRESETS,
  aspectRatio = '3/4',
  className = '',
  resetKey,
  initialPosition = 50,
  showBiometricGuide = false,
}: BeforeAfterSliderProps) {
  const [internalBgColor, setInternalBgColor] = useState<string>('#FFFFFF');
  const [sliderPosition, setSliderPosition] = useState<number>(initialPosition);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activeBgColor = controlledBgColor !== undefined ? controlledBgColor : internalBgColor;

  const handleColorSelect = useCallback(
    (hex: string) => {
      setInternalBgColor(hex);
      if (onBgColorChange) {
        onBgColorChange(hex);
      }
    },
    [onBgColorChange]
  );

  // Reset slider position if resetKey changes
  useEffect(() => {
    if (resetKey !== undefined) {
      setSliderPosition(50);
    }
  }, [resetKey]);

  // Pointer position calculation
  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const clampedX = Math.max(0, Math.min(offsetX, rect.width));
    const percentage = (clampedX / rect.width) * 100;
    setSliderPosition(Math.round(percentage * 10) / 10);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only handle primary button / primary touch point
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture fails
    }
    setIsDragging(true);
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
      setIsDragging(false);
    }
  };

  // Keyboard navigation for accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSliderPosition((prev) => Math.max(0, prev - step));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSliderPosition((prev) => Math.min(100, prev + step));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSliderPosition(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSliderPosition(100);
    }
  };

  const isTransparent = activeBgColor === 'transparent';

  return (
    <div className={`w-full flex flex-col items-center ${className}`}>
      {/* Slider Frame */}
      <div
        ref={containerRef}
        className={`relative w-full overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xl select-none group ${
          isDragging ? 'cursor-ew-resize' : 'cursor-pointer'
        }`}
        style={{
          aspectRatio,
          touchAction: 'pan-y', // Keep vertical page scroll fluid while allowing horizontal slider drag
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* =========================================
            LAYER 1 (BOTTOM): BEFORE IMAGE (Casual)
            ========================================= */}
        <div className="absolute inset-0 w-full h-full bg-zinc-900/10 dark:bg-zinc-950 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={beforeSrc}
            alt={beforeAlt}
            draggable={false}
            className="w-full h-full object-cover object-center select-none pointer-events-none"
          />
        </div>

        {/* =========================================
            LAYER 2 (TOP): AFTER CUTOUT + BG COLOR
            Clipped using CSS inset(top right bottom left)
            Left clip is set to sliderPosition%
            ========================================= */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{
            clipPath: `inset(0 0 0 ${sliderPosition}%)`,
            WebkitClipPath: `inset(0 0 0 ${sliderPosition}%)`,
            backgroundColor: isTransparent ? '#ffffff' : activeBgColor,
            backgroundImage: isTransparent
              ? 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)'
              : 'none',
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
            transition: 'background-color 150ms ease',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={afterSrc}
            alt={afterAlt}
            draggable={false}
            className="w-full h-full object-cover object-center select-none pointer-events-none"
          />

          {/* Optional Biometric Guidelines Overlay on the After side */}
          {showBiometricGuide && (
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 opacity-70">
              <div className="w-full flex items-center gap-1.5" style={{ marginTop: '12%' }}>
                <div className="h-px bg-emerald-500 flex-1 border-b border-dashed border-emerald-500" />
                <span className="text-[9px] font-mono font-semibold text-emerald-600 bg-white/90 dark:bg-zinc-900/90 px-1 rounded shadow-xs">
                  Crown
                </span>
                <div className="h-px bg-emerald-500 flex-1 border-b border-dashed border-emerald-500" />
              </div>

              <div className="w-full flex items-center gap-1.5" style={{ marginTop: '-4%' }}>
                <div className="h-px bg-emerald-500 flex-1 border-b border-dashed border-emerald-500" />
                <span className="text-[9px] font-mono font-semibold text-emerald-600 bg-white/90 dark:bg-zinc-900/90 px-1 rounded shadow-xs">
                  Eye Line
                </span>
                <div className="h-px bg-emerald-500 flex-1 border-b border-dashed border-emerald-500" />
              </div>

              <div className="w-full flex items-center gap-1.5" style={{ marginBottom: '22%' }}>
                <div className="h-px bg-emerald-500 flex-1 border-b border-dashed border-emerald-500" />
                <span className="text-[9px] font-mono font-semibold text-emerald-600 bg-white/90 dark:bg-zinc-900/90 px-1 rounded shadow-xs">
                  Chin
                </span>
                <div className="h-px bg-emerald-500 flex-1 border-b border-dashed border-emerald-500" />
              </div>

              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px border-l border-dashed border-emerald-500/60 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Floating Mode Badges */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-900/80 text-white backdrop-blur-md shadow-md border border-white/20">
            {beforeLabel}
          </span>
        </div>

        <div className="absolute top-3 right-3 z-10 pointer-events-none">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600/90 text-white backdrop-blur-md shadow-md border border-emerald-400/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {afterLabel}
          </span>
        </div>

        {/* =========================================
            CENTER DIVIDER LINE & CIRCULAR DRAG HANDLE
            ========================================= */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] pointer-events-none z-20"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Circular Interactive Drag Handle */}
          <div
            role="slider"
            tabIndex={0}
            aria-label="Before and after comparison slider"
            aria-valuenow={Math.round(sliderPosition)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-orientation="horizontal"
            onKeyDown={handleKeyDown}
            className={`pointer-events-auto absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-zinc-900 border-2 border-white dark:border-zinc-700 shadow-2xl flex items-center justify-center text-zinc-700 dark:text-zinc-200 transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
              isDragging ? 'scale-105 ring-2 ring-brand-500' : 'hover:scale-105'
            }`}
          >
            {/* Crisp Inline Double Chevron SVG (< >) */}
            <svg
              className="w-4 h-4 text-zinc-700 dark:text-zinc-200"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="8 6 2 12 8 18" />
              <polyline points="16 6 22 12 16 18" />
            </svg>
          </div>
        </div>
      </div>

      {/* =========================================
          LIVE BACKGROUND COLOR SWITCHER PILLS
          ========================================= */}
      {showColorSwitcher && (
        <div className="w-full mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-1">
            <span className="flex items-center gap-1.5">
              <span>Preview Passport Backdrop:</span>
              <span className="text-zinc-800 dark:text-zinc-200 font-bold">
                {colorOptions.find((c) => c.hex.toLowerCase() === activeBgColor.toLowerCase())?.name || activeBgColor}
              </span>
            </span>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
              Instant Hair-Edge Preview
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 p-2 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800">
            {colorOptions.map((opt) => {
              const isSelected = activeBgColor.toLowerCase() === opt.hex.toLowerCase();
              const isPillTransparent = opt.hex === 'transparent';

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleColorSelect(opt.hex)}
                  className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-md ring-2 ring-brand-500'
                      : 'bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-zinc-800/60'
                  }`}
                  title={`${opt.name} (${opt.hex})`}
                >
                  {/* Color Swatch Dot */}
                  <span
                    className="w-4 h-4 rounded-full border border-black/15 shadow-xs shrink-0 relative overflow-hidden flex items-center justify-center"
                    style={{
                      backgroundColor: isPillTransparent ? '#ffffff' : opt.hex,
                      backgroundImage: isPillTransparent
                        ? 'linear-gradient(45deg, #94a3b8 25%, transparent 25%), linear-gradient(-45deg, #94a3b8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #94a3b8 75%), linear-gradient(-45deg, transparent 75%, #94a3b8 75%)'
                        : 'none',
                      backgroundSize: '8px 8px',
                      backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                    }}
                  >
                    {isSelected && (
                      <Check
                        className={`w-2.5 h-2.5 ${
                          opt.hex === '#FFFFFF' || opt.hex === '#E5E7EB' || isPillTransparent
                            ? 'text-zinc-900'
                            : 'text-white'
                        }`}
                        strokeWidth={3}
                      />
                    )}
                  </span>

                  <span className="leading-tight">{opt.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
