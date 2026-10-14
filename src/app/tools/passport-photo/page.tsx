import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, ShieldCheck, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import PassportPhotoClient from './passport-photo-client';
import { standardPresets } from './presets';

const TITLE = 'Free Passport Size Photo Maker – NADRA 35x45mm | Compixor AI';
const DESCRIPTION =
  'Free passport size photo maker online. AI removes the background, fits Pakistan NADRA 35x45 mm and 8 more countries, plus a print-ready A4 sheet.';
const CANONICAL_URL = 'https://compixor-ai.cloud/tools/passport-photo';
const OG_IMAGE = 'https://compixor-ai.cloud/images/og-banner.png';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: CANONICAL_URL,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    url: CANONICAL_URL,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Free Passport Size Photo Maker Online - Compixor AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Compixor AI Passport Photo Maker',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any',
    url: CANONICAL_URL,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://compixor-ai.cloud',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tools',
        item: 'https://compixor-ai.cloud/#tools',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Passport Photo Maker',
        item: CANONICAL_URL,
      },
    ],
  },
];

export default function PassportPhotoPage() {
  const pakistanPreset = standardPresets.find((p) => p.id === 'pakistan-passport') || standardPresets[0];
  const otherCountryPresets = standardPresets.filter((p) => p.id !== 'pakistan-passport');

  return (
    <>
      {jsonLd.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* Interactive Passport Studio Editor */}
      <PassportPhotoClient />

      {/* PART C — Visible SEO Content Section */}
      <section className="mt-16 pt-12 border-t border-zinc-200/80 dark:border-zinc-800/80 max-w-4xl mx-auto px-4 sm:px-6 space-y-12 pb-16">
        {/* C2: Intro Paragraph */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-zinc-200/70 dark:border-zinc-800/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Overview
            </span>
          </div>
          <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
            Make a passport size photo online in under a minute. Upload a portrait and our AI passport size photo maker removes the background automatically. Choose your country&apos;s passport photo size, including Pakistan NADRA 35 × 45 mm, then pick a background colour such as white, off-white, light blue or sky blue. Use Auto-Align Face and the biometric overlay guides to get the head size and eye line right. Download a single JPEG for online portals, or a print-ready sheet (A4, 3 per A4, A6 or A5) with cut marks.
          </p>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Our biometric passport photo size maker ensures compliance with official passport authority and visa guidelines. Whether you are submitting a digital application or printing at home, this passport size photo online maker gives you precision control over cropping, head height, and background specifications.
          </p>
        </div>

        {/* C3: How to make a passport size photo online */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-zinc-200/70 dark:border-zinc-800/60 shadow-sm space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-zinc-900 dark:text-white">
            How to make a passport size photo online
          </h2>
          <ol className="space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
            <li className="flex items-start gap-3.5">
              <span className="w-6 h-6 rounded-lg bg-brand-500/15 text-brand-600 dark:text-brand-400 font-black flex items-center justify-center text-xs shrink-0 mt-0.5">
                1
              </span>
              <span>Upload your photo.</span>
            </li>
            <li className="flex items-start gap-3.5">
              <span className="w-6 h-6 rounded-lg bg-brand-500/15 text-brand-600 dark:text-brand-400 font-black flex items-center justify-center text-xs shrink-0 mt-0.5">
                2
              </span>
              <span>Let the AI remove the background automatically.</span>
            </li>
            <li className="flex items-start gap-3.5">
              <span className="w-6 h-6 rounded-lg bg-brand-500/15 text-brand-600 dark:text-brand-400 font-black flex items-center justify-center text-xs shrink-0 mt-0.5">
                3
              </span>
              <span>Choose your country size and a background colour.</span>
            </li>
            <li className="flex items-start gap-3.5">
              <span className="w-6 h-6 rounded-lg bg-brand-500/15 text-brand-600 dark:text-brand-400 font-black flex items-center justify-center text-xs shrink-0 mt-0.5">
                4
              </span>
              <span>Use Auto-Align Face or adjust position, zoom and rotation, and switch on the biometric overlay guides.</span>
            </li>
            <li className="flex items-start gap-3.5">
              <span className="w-6 h-6 rounded-lg bg-brand-500/15 text-brand-600 dark:text-brand-400 font-black flex items-center justify-center text-xs shrink-0 mt-0.5">
                5
              </span>
              <span>Download the single photo (JPEG) or the print sheet.</span>
            </li>
          </ol>
        </div>

        {/* C4: Pakistan NADRA passport photo size */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-zinc-200/70 dark:border-zinc-800/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🇵🇰</span>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-zinc-900 dark:text-white">
              Pakistan NADRA passport photo size
            </h2>
          </div>
          <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
            Size {pakistanPreset.widthMm} × {pakistanPreset.heightMm} mm ({pakistanPreset.widthPx} × {pakistanPreset.heightPx} px at 300 DPI). Head {pakistanPreset.biometricSpec.minHeadMm}-{pakistanPreset.biometricSpec.maxHeadMm} mm (70-80% of the photo height), eye line about {pakistanPreset.biometricSpec.eyeLinePercent}% from the top. Recommended backgrounds in this tool: White, Off-White, Light Blue, Sky Blue.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">Dimensions</span>
              <span className="font-bold text-zinc-900 dark:text-white font-mono">35 × 45 mm</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">Resolution</span>
              <span className="font-bold text-zinc-900 dark:text-white font-mono">300 DPI</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">Head Height</span>
              <span className="font-bold text-zinc-900 dark:text-white font-mono">32–36 mm</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">Accepted Colors</span>
              <span className="font-bold text-zinc-900 dark:text-white">White, Light Blue</span>
            </div>
          </div>
        </div>

        {/* C5: Passport photo sizes for other countries */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-zinc-200/70 dark:border-zinc-800/60 shadow-sm space-y-5">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-zinc-900 dark:text-white">
            Passport photo sizes for other countries
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Official millimeter and pixel specifications for international passport and visa applications.
          </p>

          <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold">
                <tr>
                  <th className="py-3 px-4">Country</th>
                  <th className="py-3 px-4">Document</th>
                  <th className="py-3 px-4">Size (mm)</th>
                  <th className="py-3 px-4">Size (px @ 300 DPI)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                {otherCountryPresets.map((preset) => (
                  <tr key={preset.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition">
                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                      <span>{preset.flag}</span>
                      <span>{preset.country}</span>
                    </td>
                    <td className="py-3 px-4">{preset.name}</td>
                    <td className="py-3 px-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                      {preset.widthMm} × {preset.heightMm} mm
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-500 dark:text-zinc-400">
                      {preset.widthPx} × {preset.heightPx} px
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* C6: Features */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-zinc-200/70 dark:border-zinc-800/60 shadow-sm space-y-5">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-zinc-900 dark:text-white">
            Features
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
            <li className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-700/40">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>AI background removal</span>
            </li>
            <li className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-700/40">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Background colours</span>
            </li>
            <li className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-700/40">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Auto-Align Face</span>
            </li>
            <li className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-700/40">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Position / zoom / rotate / mirror</span>
            </li>
            <li className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-700/40">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Biometric overlay guides</span>
            </li>
            <li className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-700/40">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Soften edges / trim edge fringe / remove colour halo</span>
            </li>
            <li className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-700/40">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Single JPEG download with file-size limiter</span>
            </li>
            <li className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-700/40">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Print sheets (A4, 3 per A4, A6 2 photos, A5 6 photos, custom) with cut marks</span>
            </li>
            <li className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-700/40 col-span-1 sm:col-span-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Private mode (don&apos;t upload my photo)</span>
            </li>
          </ul>
        </div>

        {/* C7: Tips for a better passport photo */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-zinc-200/70 dark:border-zinc-800/60 shadow-sm space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-zinc-900 dark:text-white">
            Tips for a better passport photo
          </h2>
          <ul className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
            <li className="flex items-start gap-2.5">
              <span className="text-brand-500 font-bold shrink-0 mt-0.5">•</span>
              <span><strong>Remove colour halo:</strong> turn this on if you see a thin light or dark outline around the hair or shoulders.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-brand-500 font-bold shrink-0 mt-0.5">•</span>
              <span><strong>Soften edges:</strong> smooths hair, neck and shoulder edges so they look natural. Increase it a little if the edges look sharp.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-brand-500 font-bold shrink-0 mt-0.5">•</span>
              <span><strong>Trim edge fringe:</strong> removes the thin coloured rim left from the old background. Increase it slightly if you still see a rim.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-brand-500 font-bold shrink-0 mt-0.5">•</span>
              <span>For the cleanest cut, use a plain, well-lit photo facing the camera.</span>
            </li>
          </ul>
        </div>

        {/* C8: Frequently asked questions */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-zinc-200/70 dark:border-zinc-800/60 shadow-sm space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-zinc-900 dark:text-white">
            Frequently asked questions
          </h2>
          <div className="space-y-4 divide-y divide-zinc-200/70 dark:divide-zinc-800/60">
            <div className="pt-3 first:pt-0">
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white mb-1.5">
                Is this passport size photo maker free?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Yes, it is free to use.
              </p>
            </div>

            <div className="pt-4">
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white mb-1.5">
                What is the Pakistan passport photo size?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                35 × 45 mm.
              </p>
            </div>

            <div className="pt-4">
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white mb-1.5">
                Can I change the background colour?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Yes: white, off-white, light blue, sky blue and more.
              </p>
            </div>

            <div className="pt-4">
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white mb-1.5">
                Can I print the photos at home?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Yes, use the print sheet and print at actual size / 100%.
              </p>
            </div>

            <div className="pt-4">
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white mb-1.5">
                Is my photo uploaded?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Use Private mode if you don&apos;t want your photo uploaded.
              </p>
            </div>
          </div>
        </div>

        {/* PART D: Internal Links — More Compixor Tools */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-zinc-200/70 dark:border-zinc-800/60 shadow-sm space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-zinc-900 dark:text-white">
            More Compixor tools
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Explore our collection of free, high-speed document and image processing utilities.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            <Link
              href="/tools/full-dp-maker"
              className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-brand-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition group flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white block group-hover:text-brand-500 transition-colors">
                  WhatsApp Full DP Maker
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  No crop 1:1 profile photos
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-brand-500 group-hover:translate-x-0.5 transition" />
            </Link>

            <Link
              href="/tools/qr-generator"
              className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-brand-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition group flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white block group-hover:text-brand-500 transition-colors">
                  Vector QR Generator
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Permanent static SVG QR codes
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-brand-500 group-hover:translate-x-0.5 transition" />
            </Link>

            <Link
              href="/tools/img-to-word"
              className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-brand-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition group flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white block group-hover:text-brand-500 transition-colors">
                  Image to Word
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  OCR converter to editable DOCX
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-brand-500 group-hover:translate-x-0.5 transition" />
            </Link>

            <Link
              href="/tools/pdf-to-word"
              className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-brand-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition group flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white block group-hover:text-brand-500 transition-colors">
                  PDF to Word
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Convert PDF to editable Word
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-brand-500 group-hover:translate-x-0.5 transition" />
            </Link>

            <Link
              href="/tools/pdf-compressor"
              className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-brand-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition group flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white block group-hover:text-brand-500 transition-colors">
                  PDF Compressor
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Reduce PDF size without quality loss
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-brand-500 group-hover:translate-x-0.5 transition" />
            </Link>

            <Link
              href="/tools/pdf-organizer"
              className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-brand-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition group flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white block group-hover:text-brand-500 transition-colors">
                  PDF Merge &amp; Split
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Organize, reorder, merge PDF pages
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-brand-500 group-hover:translate-x-0.5 transition" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
