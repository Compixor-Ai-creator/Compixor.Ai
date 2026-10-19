'use client';

import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface ApprovedFeedback {
  id: string;
  tool_name: string;
  rating: number;
  first_name: string | null;
  message: string;
  created_at: string;
}

export default function WhatUsersSay() {
  const [items, setItems] = useState<ApprovedFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadApproved() {
      try {
        const res = await fetch('/api/feedback');
        if (!res.ok) {
          if (isMounted) setItems([]);
          return;
        }
        const data = await res.json();
        if (isMounted) {
          setItems(Array.isArray(data.items) ? data.items : []);
        }
      } catch {
        if (isMounted) setItems([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadApproved();
    return () => {
      isMounted = false;
    };
  }, []);

  // If loading or if there are no approved items yet, do NOT render this section at all
  if (isLoading || items.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-zinc-900 dark:text-white mb-2">
          What users say
        </h2>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
          Recent feedback from people using our client-side utilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((fb, idx) => (
          <motion.div
            key={fb.id || idx}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="glass-card p-6 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-all duration-300"
          >
            <div className="space-y-3">
              {/* Stars & Tool Name */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= fb.rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-zinc-300 dark:text-zinc-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 truncate max-w-[160px]">
                  {fb.tool_name}
                </span>
              </div>

              {/* Message */}
              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {fb.message}
              </p>
            </div>

            {/* Author */}
            <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                {fb.first_name || 'Anonymous'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
