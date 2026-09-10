import React from 'react';

interface IconProps {
  className?: string;
}

/** WhatsApp icon — speech-bubble with telephone handset */
export function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      <path d="M9.5 9a.5.5 0 0 1 .5-.5c.4 0 .8.2 1 .6l.6 1.2a.5.5 0 0 1-.1.6l-.5.5a4.2 4.2 0 0 0 2.1 2.1l.5-.5a.5.5 0 0 1 .6-.1l1.2.6c.4.2.6.6.6 1 0 .3-.2.5-.5.5A5.5 5.5 0 0 1 9.5 9z" />
    </svg>
  );
}

/** Instagram icon — camera with lens */
export function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.01" fill="currentColor" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}

/** Facebook icon — stylised 'f' letterform inside rounded square */
export function FacebookIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M15 8h-2a1 1 0 0 0-1 1v2h3l-.5 3H12v7" />
    </svg>
  );
}

/** Telegram icon — paper-plane inside a circle */
export function TelegramIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8.5 12.5 16 8l-2.5 9-2.5-3-2.5 1.5z" />
      <path d="m11 13.5 1.5-1.5" />
    </svg>
  );
}

/** Twitter / X icon — stylised X letterform */
export function TwitterXIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 4 L20 20 M20 4 L4 20" />
    </svg>
  );
}

/** LinkedIn icon — 'in' letterform inside rounded square */
export function LinkedInIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="4" />
      <line x1="8" y1="11" x2="8" y2="16" />
      <line x1="8" y1="8" x2="8" y2="8.5" strokeWidth="2.5" />
      <path d="M12 11v5" />
      <path d="M12 14a2 2 0 0 1 4 0v2" />
    </svg>
  );
}

/** YouTube icon — play button inside rounded rect */
export function YouTubeIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M22 8s-.25-1.75-1-2.5c-.96-1-2.03-1.01-2.52-1.07C15.97 4.26 12 4.25 12 4.25s-3.97.01-6.48.18C5.03 4.49 3.96 4.5 3 5.5 2.25 6.25 2 8 2 8S1.75 10.06 1.75 12.13v1.87c0 2.06.25 4.12.25 4.12s.25 1.75 1 2.5c.96 1 2.22.97 2.78 1.07C7.53 21.74 12 21.75 12 21.75s3.97-.01 6.48-.18c.5-.06 1.56-.07 2.52-1.07.75-.75 1-2.5 1-2.5S22.25 16.06 22.25 14v-1.87C22.25 10.06 22 8 22 8z" />
      <polygon points="10,9 16,12 10,15" fill="currentColor" stroke="none" />
    </svg>
  );
}
