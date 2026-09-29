'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, CheckCircle2, Quote, Sparkles, Heart } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  location: string;
  avatar: string;
  rating: number;
  review: string;
  toolUsed: string;
  highlight: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Sarah Jenkins',
    role: 'Senior Corporate Counsel',
    location: 'Horizon Law · London, UK',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    highlight: '100% Privacy Compliance',
    review:
      'In corporate law, uploading client NDAs to third-party cloud servers is a massive compliance risk. Compixor’s client-side AES-256 PDF protection lets us lock files with zero cloud exposure. Total peace of mind.',
    toolUsed: 'Protect PDF (AES-256)',
  },
  {
    name: 'Zeeshan Ahmed',
    role: 'Full Stack Engineer',
    location: 'Lahore, Pakistan',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 4.9,
    highlight: 'Saved 2-Hour Studio Wait',
    review:
      'The NADRA Passport Photo tool is brilliant! Auto-removed my background, cropped to standard 35x45mm, and generated a 300 DPI 4x6" printable sheet in 10 seconds. Saved me a trip and PKR 800 studio fee.',
    toolUsed: 'Biometric Passport Photo',
  },
  {
    name: 'Elena Rostova',
    role: 'Lead Visual Designer',
    location: 'Studio Bloom · Berlin, Germany',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    highlight: 'No Subscriptions, Pure SVG',
    review:
      'Most online QR generators lock vector SVG exports behind expensive recurring subscriptions. Compixor gives clean, permanent SVG QR codes with logo embedding directly in browser memory. Truly exceptional.',
    toolUsed: 'High-Res QR Generator',
  },
  {
    name: 'Dr. Marcus Vance',
    role: 'Academic Researcher & Lecturer',
    location: 'MIT · Boston, USA',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    rating: 4.8,
    highlight: '75MB Shrunk to 8.4MB',
    review:
      'I needed to compress a 75MB thesis filled with high-res cell microscopy slides. Compixor reduced it to 8.4MB in under 3 seconds right inside Chrome without any text blurriness. Incredible WebAssembly engine.',
    toolUsed: 'Smart PDF Compressor',
  },
  {
    name: 'Ayesha Noor',
    role: 'Digital Content Creator',
    location: 'Dubai, UAE',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    highlight: 'Perfect 1:1 WhatsApp DPs',
    review:
      'Finally a tool that resizes profile pictures for WhatsApp, Instagram, and Telegram without ugly forced square cropping! The HD background blur effect looks like it was designed in Photoshop.',
    toolUsed: 'No-Crop Full DP Maker',
  },
  {
    name: 'David Miller',
    role: 'Operations Director',
    location: 'BluePeak Logistics · Austin, TX',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    rating: 4.9,
    highlight: 'Local Invoice Redaction',
    review:
      'Removing stamps and merging vendor PDF invoices directly in browser memory without sending private financial records over the internet is a game changer for our operations. Bookmarked across our whole team.',
    toolUsed: 'PDF Watermark Remover',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function CustomerTestimonials() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Subtle Background Glow behind Testimonials */}
      <div
        aria-hidden="true"
        className="hidden md:block pointer-events-none absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[360px] rounded-full opacity-20 dark:opacity-15"
        style={{
          background: 'radial-gradient(ellipse at center, #7c3aed 0%, #06b6d4 45%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading & Trust Metric Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Rating Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 backdrop-blur-sm shadow-xs mb-4 animate-float-subtle">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-bold">4.9 / 5.0 Rating</span>
            <span className="text-zinc-400 dark:text-zinc-500">•</span>
            <span>Based on 12,000+ Reviews</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-zinc-900 dark:text-white mb-4 tracking-tight">
            Loved by Professionals & Creators Worldwide
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            See why thousands of developers, researchers, lawyers, and students rely on Compixor AI every day for zero-server file privacy and instantaneous transforms.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-300">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              Zero Cloud Uploads
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              100% Free & Unlimited
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500/30 shrink-0" />
              99.8% Customer Satisfaction
            </span>
          </div>
        </motion.div>

        {/* 6 Grid Testimonials Cards with Stagger Animation */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          variants={containerVariants}
        >
          {testimonials.map((t, idx) => (
            <motion.div key={idx} variants={itemVariants} className="h-full">
              <div className="glass-card p-6 sm:p-7 h-full flex flex-col justify-between rounded-3xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-500/10 hover:border-brand-500/30 group">
                <div>
                  {/* Top Row: Stars + Quote Icon */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.floor(t.rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-amber-400/60 text-amber-400'
                          }`}
                        />
                      ))}
                      <span className="ml-1.5 text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300">
                        {t.rating.toFixed(1)}
                      </span>
                    </div>
                    <Quote className="w-6 h-6 text-brand-500/30 group-hover:text-brand-500/60 transition-colors shrink-0" />
                  </div>

                  {/* Highlight Tag */}
                  <div className="mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      &ldquo;{t.highlight}&rdquo;
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                    {t.review}
                  </p>
                </div>

                {/* Footer: User Profile + Tool Badge */}
                <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 ring-2 ring-brand-500/20 group-hover:ring-brand-500/50 transition-all">
                      <Image
                        src={t.avatar}
                        alt={t.name}
                        width={44}
                        height={44}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                          {t.name}
                        </p>
                        <span title="Verified User" className="inline-flex shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {t.role}
                      </p>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                        {t.location}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0">
                    {t.toolUsed}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
