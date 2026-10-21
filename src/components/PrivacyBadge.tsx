'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { tools } from '@/data/tools';

interface PrivacyBadgeProps {
  toolSlug: string;
  className?: string;
}

export default function PrivacyBadge({ toolSlug, className = '' }: PrivacyBadgeProps) {
  const tool = tools.find((t) => t.id === toolSlug || t.href === `/tools/${toolSlug}`);
  const slug = tool?.id || toolSlug;

  let message = 'Zero Data Leak. Your files never leave your device. No upload, no signup.';

  if (slug === 'img-to-word' || slug === 'pdf-to-word') {
    message =
      "Files are processed over secure HTTPS and deleted from our server immediately after processing. For Urdu/Arabic text recognition, image portions may be sent to Google's Gemini AI service for transcription.";
  } else if (slug === 'passport-photo' || tool?.processing === 'server') {
    message =
      'Files are processed over secure HTTPS and deleted immediately after processing. Never stored or shared.';
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shadow-xs ${className}`}
      role="status"
    >
      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
