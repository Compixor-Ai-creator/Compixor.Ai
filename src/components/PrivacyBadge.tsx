'use client';

import React from 'react';
import { ShieldCheck, Server } from 'lucide-react';
import { getToolPrivacy } from '@/data/toolsPrivacy';

interface PrivacyBadgeProps {
  toolSlug: string;
  className?: string;
}

export default function PrivacyBadge({ toolSlug, className = '' }: PrivacyBadgeProps) {
  const privacy = getToolPrivacy(toolSlug);
  const isServer = privacy.processingType === 'server';

  const message = isServer
    ? 'Processed over encrypted HTTPS in temporary memory and immediately deleted. Zero permanent storage.'
    : 'Zero Server Uploads: Runs 100% locally in your browser RAM. Your files never leave your device.';

  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold ${
        isServer
          ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20'
          : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
      } shadow-xs ${className}`}
      role="status"
    >
      {isServer ? (
        <Server className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" />
      ) : (
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden="true" />
      )}
      <span>{message}</span>
    </div>
  );
}
