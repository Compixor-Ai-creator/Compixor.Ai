import React from 'react';

interface IconProps {
  className?: string;
}

/** WhatsApp official brand logo */
export function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.004 2C6.48 2 2 6.48 2 12.004c0 1.97.57 3.81 1.56 5.37L2.1 21.9l4.67-1.43a9.96 9.96 0 0 0 5.23 1.48h.004c5.52 0 10-4.48 10-10.004C22.004 6.48 17.524 2 12.004 2zm5.47 14.38c-.23.64-1.33 1.22-1.85 1.3-.47.07-1.06.1-3.21-.77-2.73-1.12-4.48-3.9-4.62-4.08-.13-.18-1.11-1.47-1.11-2.81s.7-2 1-2.27c.25-.27.54-.34.72-.34.18 0 .36 0 .52.01.17.01.39-.06.61.47.23.54.78 1.9.85 2.04.07.14.12.3.02.48-.1.18-.15.29-.29.45-.14.16-.3.35-.43.47-.14.14-.29.3-.12.58.17.28.75 1.24 1.61 2 1.11.99 2.05 1.3 2.34 1.44.29.14.46.12.63-.08.17-.2.72-.84.91-1.13.19-.29.38-.24.64-.15.26.1 1.63.77 1.91.91.28.14.47.21.54.33.07.11.07.67-.16 1.31z" />
    </svg>
  );
}

/** Instagram official brand logo */
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

/** Facebook official brand logo */
export function FacebookIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

/** Telegram icon */
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

/** Twitter / X official brand logo */
export function TwitterXIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/** LinkedIn official brand logo */
export function LinkedInIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

/** GitHub official brand logo */
export function GitHubIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

/** YouTube icon */
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
