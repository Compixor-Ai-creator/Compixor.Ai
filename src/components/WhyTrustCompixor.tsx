'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, UserX, LayoutGrid, CheckCircle } from 'lucide-react';

const trustPoints = [
  {
    icon: Cpu,
    title: 'Privacy-First Architecture',
    description: '9 tools run entirely in your browser memory with zero uploads. Server tools delete files immediately.',
    color: 'from-brand-500 to-indigo-500',
    iconColor: 'text-brand-500',
  },
  {
    icon: UserX,
    title: 'No Sign-Up Required',
    description: 'Start using every tool immediately without accounts, logins, or emails.',
    color: 'from-indigo-500 to-purple-500',
    iconColor: 'text-indigo-500',
  },
  {
    icon: LayoutGrid,
    title: '12 Free Tools in One Place',
    description: 'A unified suite for documents, photos, compression, and QR codes.',
    color: 'from-purple-500 to-pink-500',
    iconColor: 'text-purple-500',
  },
  {
    icon: CheckCircle,
    title: 'Zero Watermarks Added',
    description: 'No watermark added to your output. Your exported files stay clean and professional.',
    color: 'from-emerald-500 to-teal-500',
    iconColor: 'text-emerald-500',
  },
];

export default function WhyTrustCompixor() {
  return (
    <section className="py-10 sm:py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-zinc-900 dark:text-white mb-3">
          Why Trust Compixor
        </h2>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
          Straightforward utilities built with privacy and speed by design.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {trustPoints.map((point, index) => {
          const Icon = point.icon;
          return (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              className="glass-card p-5 sm:p-6 rounded-2xl flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center mb-4">
                  <Icon className={`w-6 h-6 ${point.iconColor}`} />
                </div>
                <h3 className="text-base font-bold font-display text-zinc-900 dark:text-white mb-2">
                  {point.title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {point.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
