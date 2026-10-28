'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Share2, Check, Copy, ChevronDown } from 'lucide-react';
import {
  SITE_URL,
  getShareUrls,
} from '@/lib/config';
import {
  LinkedInIcon,
  TwitterXIcon,
  WhatsAppIcon,
  FacebookIcon,
} from '@/components/SocialIcons';

interface ShareToolButtonProps {
  toolName: string;
  toolSlug: string;
  className?: string;
}

export default function ShareToolButton({
  toolName,
  toolSlug,
  className = '',
}: ShareToolButtonProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toolUrl = `${SITE_URL}/tools/${toolSlug}`;
  const shareText = `Free, private online ${toolName} - Compixor AI`;
  const shareUrls = getShareUrls(toolUrl, shareText);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleShareClick = async () => {
    // If native Web Share API is available (primarily mobile devices), trigger it
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `${toolName} | Compixor AI`,
          text: shareText,
          url: toolUrl,
        });
        return;
      } catch (err: unknown) {
        // If user cancelled, don't fallback to open dropdown
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        // Fallback to opening dropdown if share failed
      }
    }
    // Fallback: toggle dropdown with direct social links
    setDropdownOpen((prev) => !prev);
  };

  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(toolUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={handleShareClick}
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
        aria-label={`Share ${toolName}`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-200 hover:text-brand-600 dark:hover:text-brand-300 border border-zinc-200/80 dark:border-zinc-700/60 shadow-xs hover:shadow-sm hover:border-brand-500/30 transition-all cursor-pointer backdrop-blur-sm"
      >
        <Share2 className="w-3.5 h-3.5 text-brand-500 shrink-0" aria-hidden="true" />
        <span>Share this tool</span>
        <ChevronDown
          className={`w-3 h-3 text-zinc-400 transition-transform duration-200 ${
            dropdownOpen ? 'rotate-180 text-brand-500' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-64 p-3 rounded-2xl dropdown-glass z-50 border border-zinc-200/70 dark:border-zinc-800/80 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2 px-1">
            Share {toolName}
          </p>

          <div className="grid grid-cols-4 gap-1.5 mb-2.5 overflow-visible">
            <a
              href={shareUrls.linkedIn}
              target="_blank"
              rel="noopener noreferrer nofollow"
              aria-label={`Share ${toolName} on LinkedIn`}
              className="social-btn !w-full !h-9"
              style={{ '--glow': '#0A66C2' } as React.CSSProperties}
            >
              <LinkedInIcon className="w-[18px] h-[18px]" />
            </a>
            <a
              href={shareUrls.x}
              target="_blank"
              rel="noopener noreferrer nofollow"
              aria-label={`Share ${toolName} on X`}
              className="social-btn social-btn-x !w-full !h-9"
            >
              <TwitterXIcon className="w-[18px] h-[18px]" />
            </a>
            <a
              href={shareUrls.whatsApp}
              target="_blank"
              rel="noopener noreferrer nofollow"
              aria-label={`Share ${toolName} on WhatsApp`}
              className="social-btn !w-full !h-9"
              style={{ '--glow': '#25D366' } as React.CSSProperties}
            >
              <WhatsAppIcon className="w-[18px] h-[18px]" />
            </a>
            <a
              href={shareUrls.facebook}
              target="_blank"
              rel="noopener noreferrer nofollow"
              aria-label={`Share ${toolName} on Facebook`}
              className="social-btn !w-full !h-9"
              style={{ '--glow': '#1877F2' } as React.CSSProperties}
            >
              <FacebookIcon className="w-[18px] h-[18px]" />
            </a>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold bg-zinc-100/80 dark:bg-zinc-800/60 hover:bg-brand-500/10 text-zinc-700 dark:text-zinc-300 hover:text-brand-600 dark:hover:text-brand-300 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-500" />
                <span>Copy Tool Link</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
