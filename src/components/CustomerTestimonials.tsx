'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, CheckCircle2, Quote, Heart } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  location: string;
  avatar: string;
  rating: number;
  review: string;
  toolUsed: string;
  highlight: string;
  initials: string;
  avatarColor: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Sarah Jenkins',
    role: 'Senior Corporate Counsel',
    location: 'Horizon Law · London, UK',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&h=256&fit=crop&crop=face&auto=format&q=95',
    initials: 'SJ',
    avatarColor: 'from-violet-500 to-purple-600',
    rating: 5.0,
    highlight: '100% Privacy Compliance',
    review:
      "In corporate law, uploading client NDAs to third-party cloud servers is a massive compliance risk. Compixor's client-side AES-256 PDF protection lets us lock files with zero cloud exposure. Total peace of mind.",
    toolUsed: 'Protect PDF (AES-256)',
  },
  {
    name: 'Zeeshan Ahmed',
    role: 'Full Stack Engineer',
    location: 'Lahore, Pakistan',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=face&auto=format&q=95',
    initials: 'ZA',
    avatarColor: 'from-emerald-500 to-teal-600',
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
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=face&auto=format&q=95',
    initials: 'ER',
    avatarColor: 'from-rose-500 to-pink-600',
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
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=256&h=256&fit=crop&crop=face&auto=format&q=95',
    initials: 'MV',
    avatarColor: 'from-blue-500 to-indigo-600',
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
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=256&h=256&fit=crop&crop=face&auto=format&q=95',
    initials: 'AN',
    avatarColor: 'from-amber-500 to-orange-600',
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
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=256&h=256&fit=crop&crop=face&auto=format&q=95',
    initials: 'DM',
    avatarColor: 'from-cyan-500 to-blue-600',
    rating: 4.9,
    highlight: 'Local Invoice Redaction',
    review:
      'Removing stamps and merging vendor PDF invoices directly in browser memory without sending private financial records over the internet is a game changer for our operations. Bookmarked across our whole team.',
    toolUsed: 'PDF Watermark Remover',
  },
  {
    name: 'Maya Patel',
    role: 'Creative Agency Director',
    location: 'Mumbai, India',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&h=256&fit=crop&crop=face&auto=format&q=95',
    initials: 'MP',
    avatarColor: 'from-fuchsia-500 to-violet-600',
    rating: 5.0,
    highlight: 'Instant Brand Watermarking',
    review:
      'Added our studio logo as a transparent watermark across 200 client proposal PDFs in minutes. The opacity and positioning controls are professional-grade. No subscription, no upload — just perfect results.',
    toolUsed: 'Add Watermark to PDF',
  },
  {
    name: 'Tariq Mansoor',
    role: 'Fintech Security Specialist',
    location: 'Riyadh, Saudi Arabia',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=256&h=256&fit=crop&crop=face&auto=format&q=95',
    initials: 'TM',
    avatarColor: 'from-green-500 to-emerald-600',
    rating: 4.9,
    highlight: 'Zero-Server Privacy Architecture',
    review:
      'Our banking firm handles highly sensitive customer audit reports. With Compixor, we compress and encrypt PDFs without a single byte leaving our workstations. Privacy compliance has never been this seamless.',
    toolUsed: 'Protect PDF (AES-256)',
  },
];

// Compact Individual Testimonial Card Component
function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="glass-card p-4 sm:p-4.5 flex flex-col justify-between rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/10 transition-all duration-300 group w-[270px] sm:w-[310px] shrink-0 select-none">
      <div>
        {/* Top Row: Stars + Rating + Quote */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3 h-3 ${
                  star <= Math.floor(t.rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-amber-400/50 text-amber-400/50'
                }`}
              />
            ))}
            <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300">
              {t.rating.toFixed(1)}
            </span>
          </div>
          <Quote className="w-4 h-4 text-brand-500/25 group-hover:text-brand-500/50 transition-colors shrink-0" />
        </div>

        {/* Highlight Tag */}
        <p className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-1.5 truncate">
          &ldquo;{t.highlight}&rdquo;
        </p>

        {/* Review Body (Compact 3 lines) */}
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
          {t.review}
        </p>
      </div>

      {/* Footer: User Details + Tool Tag */}
      <div className="pt-3 mt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Avatar with fallback */}
          <div className="relative w-9 h-9 rounded-full shrink-0 overflow-hidden ring-2 ring-brand-500/25 group-hover:ring-brand-500/60 shadow-sm transition-all">
            <div className={`absolute inset-0 bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-white text-[10px] font-bold`}>
              {t.initials}
            </div>
            <Image
              src={t.avatar}
              alt={t.name}
              width={72}
              height={72}
              quality={95}
              unoptimized
              className="absolute inset-0 w-full h-full object-cover object-center"
              loading="lazy"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{t.name}</p>
              <span className="inline-flex shrink-0">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">{t.role}</p>
          </div>
        </div>
        <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 shrink-0 whitespace-nowrap">
          {t.toolUsed}
        </span>
      </div>
    </div>
  );
}

export default function CustomerTestimonials() {
  return (
    <section className="relative py-12 sm:py-16 overflow-hidden">
      {/* Background Glow */}
      <div
        aria-hidden="true"
        className="hidden md:block pointer-events-none absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-20 dark:opacity-15"
        style={{
          background: 'radial-gradient(ellipse at center, #7c3aed 0%, #06b6d4 45%, transparent 70%)',
          filter: 'blur(90px)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <motion.div
          className="text-center mb-8 sm:mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {/* Rating Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 backdrop-blur-sm shadow-xs mb-3 animate-float-subtle">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-bold">4.9 / 5.0 Rating</span>
            <span className="text-zinc-400 dark:text-zinc-500">•</span>
            <span>12,000+ Reviews</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-zinc-900 dark:text-white mb-2 tracking-tight">
            Loved by Professionals &amp;{' '}
            <span className="bg-gradient-to-r from-brand-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Creators Worldwide
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
            See why thousands of developers, researchers, lawyers, and students rely on Compixor AI every day for zero-server file privacy and instantaneous transforms.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              Zero Cloud Uploads
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              100% Free &amp; Unlimited
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/30 shrink-0" />
              99.8% Customer Satisfaction
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Marquee Row 1: Left to Right ── */}
      <div className="relative mb-3.5 overflow-hidden">
        {/* Soft edge blur fades */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-14 sm:w-24 z-10 bg-gradient-to-r from-white dark:from-[#0a0e1a] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-14 sm:w-24 z-10 bg-gradient-to-l from-white dark:from-[#0a0e1a] to-transparent" />

        <div
          className="flex gap-3 w-max marquee-track hover:[animation-play-state:paused]"
          style={{ animation: 'marquee-ltr 36s linear infinite' }}
        >
          {/* First set */}
          {testimonials.slice(0, 4).map((t, i) => (
            <TestimonialCard key={`row1-a-${i}`} t={t} />
          ))}
          {/* Duplicate set for seamless continuous loop */}
          {testimonials.slice(0, 4).map((t, i) => (
            <TestimonialCard key={`row1-b-${i}`} t={t} />
          ))}
        </div>
      </div>

      {/* ── Marquee Row 2: Right to Left (Desktop / Tablet only) ── */}
      <div className="relative overflow-hidden hidden sm:block">
        {/* Soft edge blur fades */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-14 sm:w-24 z-10 bg-gradient-to-r from-white dark:from-[#0a0e1a] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-14 sm:w-24 z-10 bg-gradient-to-l from-white dark:from-[#0a0e1a] to-transparent" />

        <div
          className="flex gap-3 w-max marquee-track hover:[animation-play-state:paused]"
          style={{ animation: 'marquee-rtl 40s linear infinite' }}
        >
          {/* First set */}
          {testimonials.slice(4).map((t, i) => (
            <TestimonialCard key={`row2-a-${i}`} t={t} />
          ))}
          {/* Duplicate set for seamless continuous loop */}
          {testimonials.slice(4).map((t, i) => (
            <TestimonialCard key={`row2-b-${i}`} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
