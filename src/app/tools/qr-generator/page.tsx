import React from 'react';
import dynamic from 'next/dynamic';
import ToolSeoSection from '@/components/ToolSeoSection';
import QrGeneratorSkeleton from './QrGeneratorSkeleton';
const QrGeneratorPreviewMockup = dynamic(
  () => import('@/components/VisualProofMockup').then((m) => m.QrGeneratorPreviewMockup),
  { ssr: false }
);
import {
  Sparkles,
  CheckCircle2,
  Link as LinkIcon,
  Type,
  Wifi,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Image as ImageIcon,
  X,
} from 'lucide-react';

const QrGeneratorStudio = dynamic(() => import('./QrGeneratorStudio'), {
  ssr: false,
  loading: () => <QrGeneratorSkeleton />,
});

export default function QrGeneratorPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        {/* Victory / Transformation Preview Card (Plain Link → Branded Vector QR) */}
        <div className="w-full flex justify-center mb-6 select-none pointer-events-none">
          <div className="p-3 sm:p-4 rounded-3xl bg-white/60 dark:bg-zinc-900/60 border border-purple-500/20 dark:border-purple-500/30 shadow-lg backdrop-blur-md flex items-center justify-center gap-4 sm:gap-6">
            {/* Left: Plain Boring Link (Problem) */}
            <div className="flex flex-col items-center space-y-1">
              <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border-2 border-dashed border-zinc-300 dark:border-zinc-700 relative flex flex-col items-center justify-center p-2">
                <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 truncate max-w-[70px]">https://...</span>
                <div className="w-12 h-1 bg-zinc-300 dark:bg-zinc-600 rounded mt-2" />
                <div className="w-8 h-1 bg-zinc-200 dark:bg-zinc-700 rounded mt-1" />
              </div>
              <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">Plain Link</span>
            </div>

            {/* Center Arrow */}
            <div className="w-7 h-7 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-300 flex items-center justify-center font-black text-sm">
              &rarr;
            </div>

            {/* Right: High-Res Branded QR Code (Victory) */}
            <div className="flex flex-col items-center space-y-1">
              <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-amber-500/20 border-2 border-purple-500 relative flex items-center justify-center p-2 shadow-md">
                <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                  {/* Outer corner markers */}
                  <rect x="4" y="4" width="14" height="14" rx="3" stroke="#8B5CF6" strokeWidth="2.5" fill="none" />
                  <rect x="7.5" y="7.5" width="7" height="7" rx="1.5" fill="#8B5CF6" />
                  <rect x="30" y="4" width="14" height="14" rx="3" stroke="#EC4899" strokeWidth="2.5" fill="none" />
                  <rect x="33.5" y="7.5" width="7" height="7" rx="1.5" fill="#EC4899" />
                  <rect x="4" y="30" width="14" height="14" rx="3" stroke="#F59E0B" strokeWidth="2.5" fill="none" />
                  <rect x="7.5" y="33.5" width="7" height="7" rx="1.5" fill="#F59E0B" />
                  {/* Data blocks */}
                  <rect x="22" y="6" width="4" height="4" rx="1" fill="#8B5CF6" />
                  <rect x="22" y="14" width="4" height="4" rx="1" fill="#EC4899" />
                  <rect x="30" y="22" width="4" height="4" rx="1" fill="#EC4899" />
                  <rect x="38" y="22" width="4" height="4" rx="1" fill="#F59E0B" />
                  <rect x="22" y="30" width="4" height="4" rx="1" fill="#F59E0B" />
                  <rect x="30" y="38" width="4" height="4" rx="1" fill="#8B5CF6" />
                  <rect x="38" y="38" width="4" height="4" rx="1" fill="#EC4899" />
                  {/* Center Brand Icon */}
                  <circle cx="24" cy="24" r="5" fill="#8B5CF6" />
                  <path d="M22 24 L23.5 25.5 L26.5 22.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {/* Verified scan badge */}
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                  ✓
                </div>
              </div>
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">100% Vector SVG</span>
            </div>
          </div>
        </div>

        {/* Animated Badge Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/25 mb-4 animate-float-subtle shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-purple-500 animate-spin-slow" />
          Pro Customizer • Logo Embedding • Unlimited Free
        </div>

        {/* H1 with Vibrant Purple-Pink-Amber Gradient + Floating Particles */}
        <div className="relative inline-block mb-4">
          <div className="absolute -top-3 -left-5 w-2 h-2 rounded-full bg-purple-400/80 animate-pulse" />
          <div className="absolute -top-2 -right-5 w-1.5 h-1.5 rounded-full bg-pink-500/80 animate-pulse" style={{ animationDelay: '0.6s' }} />
          <div className="absolute -bottom-1 left-1/3 w-1.5 h-1.5 rounded-full bg-amber-400/70 animate-pulse" style={{ animationDelay: '1.2s' }} />
          <Sparkles className="absolute -top-6 right-1 w-4 h-4 text-purple-400/70 animate-spin-slow" />

          <h1 className="text-4xl sm:text-5xl font-black font-display text-zinc-900 dark:text-white">
            Free{' '}
            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 bg-clip-text text-transparent">
              QR Code Generator
            </span>{' '}
            Online
          </h1>
        </div>

        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 mb-6">
          Create high-resolution, branded QR codes for websites, Wi-Fi networks, vCards, and emails.
          Embed custom logos, choose themes, and export print-ready vector SVGs.
        </p>

        {/* Clean Keyword Badges / Tags (No '#' prefix) */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-2xl mx-auto mb-6">
          {[
            'Branded QR Code',
            'Embed Logo',
            'Wi-Fi QR',
            'vCard Contact',
            'Print-Ready SVG',
            '100% In-Browser',
          ].map((tag) => (
            <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-white/70 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/60 backdrop-blur-sm text-zinc-700 dark:text-zinc-300 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                {tag}
              </span>
          ))}
        </div>

        {/* Content Type Icons Row (6 items) */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-300 font-medium">
            <LinkIcon className="w-3.5 h-3.5" /> Website URL
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-300 font-medium">
            <Type className="w-3.5 h-3.5" /> Plain Text
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-300 font-medium">
            <Wifi className="w-3.5 h-3.5" /> Wi-Fi Access
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-300 font-medium">
            <User className="w-3.5 h-3.5" /> vCard Contact
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-300 font-medium">
            <Mail className="w-3.5 h-3.5" /> Email
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-300 font-medium">
            <Phone className="w-3.5 h-3.5" /> Phone Call
          </div>
        </div>
      </div>


      {/* Interactive Studio (Lazy-Loaded to Optimize Initial HTML Payload) */}
      <QrGeneratorStudio />

      {/* Feature Highlights Grid */}
      <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Feature 1: Logo Embedding */}
        <div className="p-6 rounded-2xl glass-card flex flex-col justify-between">
          <div>
            {/* Simple flat icon of a QR code pattern with a small logo placeholder square in the center */}
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 p-2.5 flex items-center justify-center mb-4 border border-brand-500/20">
              <svg className="w-full h-full" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="8" height="8" rx="2" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="1.8" />
                <rect x="20" y="4" width="8" height="8" rx="2" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="1.8" />
                <rect x="4" y="20" width="8" height="8" rx="2" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="1.8" />
                <rect x="6" y="6" width="4" height="4" className="fill-blue-600 dark:fill-blue-400" />
                <rect x="22" y="6" width="4" height="4" className="fill-blue-600 dark:fill-blue-400" />
                <rect x="6" y="22" width="4" height="4" className="fill-blue-600 dark:fill-blue-400" />
                {/* Logo placeholder in center */}
                <rect x="12" y="12" width="8" height="8" rx="2" className="fill-purple-500/20 stroke-purple-600" strokeWidth="1.6" />
                <circle cx="16" cy="16" r="1.5" className="fill-purple-600" />
              </svg>
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1">
              Center Logo Overlay
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Upload custom brand logos. Error correction automatically upgrades to Level H to ensure 100% scannability.
            </p>
          </div>
        </div>

        {/* Feature 2: SVG/PNG Export */}
        <div className="p-6 rounded-2xl glass-card flex flex-col justify-between">
          <div>
            {/* Simple flat icon showing two file format badges side by side (SVG and PNG) */}
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 p-2.5 flex items-center justify-center mb-4 border border-blue-500/20">
              <svg className="w-full h-full" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="8" width="12" height="16" rx="2" className="fill-blue-500/10 stroke-blue-600 dark:stroke-blue-400" strokeWidth="1.6" />
                <text x="5" y="19" className="text-[7px] font-black fill-blue-600 dark:fill-blue-400">SVG</text>
                <rect x="17" y="8" width="12" height="16" rx="2" className="fill-emerald-500/10 stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="1.6" />
                <text x="19" y="19" className="text-[7px] font-black fill-emerald-600 dark:fill-emerald-400">PNG</text>
              </svg>
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1">
              Infinite-Scale SVG & PNG
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Download mathematical vector SVG for billboards and print, or high-density PNG for digital screens.
            </p>
          </div>
        </div>

        {/* Feature 3: No Expiry */}
        <div className="p-6 rounded-2xl glass-card flex flex-col justify-between">
          <div>
            {/* Simple flat icon of an infinity symbol combined with a QR code corner pattern */}
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2.5 flex items-center justify-center mb-4 border border-emerald-500/20">
              <svg className="w-full h-full" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="8" height="8" rx="2" className="stroke-zinc-400" strokeWidth="1.5" />
                <rect x="6" y="6" width="4" height="4" className="fill-zinc-400" />
                {/* Infinity symbol in green */}
                <path d="M12 21C12 18.8 14 17 16 19C18 21 20 23 23 23C25.2 23 27 21.2 27 19C27 16.8 25.2 15 23 15C20 15 18 17 16 19C14 21 12 23 9 23C6.8 23 5 21.2 5 19C5 16.8 6.8 15 9 15C12 15 14 17 16 19" className="stroke-emerald-500" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1">
              Never Expires • No Account
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Directly encodes payload data into the matrix. Zero redirects, zero middleman servers, scannable forever.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section with Step-by-Step Visual Cards (matching user screenshot) */}
      <section className="mt-16 p-6 sm:p-8 rounded-3xl glass-card border border-zinc-200/80 dark:border-zinc-800/80">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-zinc-900 dark:text-white">
              How Compixor&apos;s QR Code Generator Works
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
              A QR code is a two-dimensional pattern that encodes data directly into a scannable grid. Everything runs 100% locally in your browser.
            </p>
          </div>

          {/* Step 1 & Step 2 Layout (Exact layout requested in user's image) */}
          <div className="space-y-12">
            {/* Step 1 Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Left Visual Card 1: Input URL, floating pills, QR preview */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50/60 via-zinc-50 to-emerald-50/30 dark:from-zinc-900/90 dark:to-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-4">
                  {/* Left inputs mockup */}
                  <div className="flex-1 space-y-3">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 shadow-xs border border-zinc-200/70 dark:border-zinc-700/60 flex items-center justify-between text-xs">
                      <span className="text-zinc-700 dark:text-zinc-200 font-medium">Enter URL</span>
                      <span className="text-zinc-400">📢</span>
                    </div>

                    <div className="relative pl-3 space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-emerald-500/60 shadow-xs text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        <LinkIcon className="w-3 h-3 text-emerald-600" /> URL
                      </div>
                      <div className="block pl-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-white/70 dark:bg-zinc-800/70 text-[10px] text-zinc-400 border border-zinc-200/60">PDF</span>
                      </div>
                      <div className="block pl-8">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-white/50 dark:bg-zinc-800/50 text-[10px] text-zinc-400 border border-zinc-200/40">Multi-URL</span>
                      </div>
                    </div>
                  </div>

                  {/* Right QR Code mockup */}
                  <div className="w-28 h-28 bg-white dark:bg-zinc-800 p-2 rounded-2xl shadow-sm border border-zinc-200/80 dark:border-zinc-700/70 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full" viewBox="0 0 40 40" fill="currentColor">
                      {/* Corner 1 */}
                      <rect x="4" y="4" width="10" height="10" rx="1.5" />
                      <rect x="6" y="6" width="6" height="6" fill="white" />
                      <rect x="7.5" y="7.5" width="3" height="3" />
                      {/* Corner 2 */}
                      <rect x="26" y="4" width="10" height="10" rx="1.5" />
                      <rect x="28" y="6" width="6" height="6" fill="white" />
                      <rect x="29.5" y="7.5" width="3" height="3" />
                      {/* Corner 3 */}
                      <rect x="4" y="26" width="10" height="10" rx="1.5" />
                      <rect x="6" y="28" width="6" height="6" fill="white" />
                      <rect x="7.5" y="29.5" width="3" height="3" />
                      {/* Matrix dots */}
                      <rect x="18" y="6" width="3" height="3" />
                      <rect x="18" y="12" width="3" height="3" />
                      <rect x="6" y="18" width="3" height="3" />
                      <rect x="12" y="18" width="3" height="3" />
                      <rect x="18" y="18" width="4" height="4" />
                      <rect x="26" y="18" width="3" height="3" />
                      <rect x="32" y="18" width="3" height="3" />
                      <rect x="18" y="26" width="3" height="3" />
                      <rect x="24" y="26" width="4" height="4" />
                      <rect x="30" y="26" width="3" height="3" />
                      <rect x="18" y="32" width="3" height="3" />
                      <rect x="26" y="32" width="3" height="3" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Right Description 1 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm">
                    1
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Choose your QR Code type
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed pl-11">
                  Choose your QR Code type based on what you want it to do: open a URL, share WiFi credentials, display contact details (vCard), launch an email, or send phone numbers.
                </p>
              </div>
            </div>

            {/* Step 2 Row (Alternating matching user screenshot) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Left Description 2 */}
              <div className="space-y-3 order-2 md:order-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm">
                    2
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Customize it your way
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed pl-11">
                  Add your details, change the color, style your QR Code, add a logo in the center, and test it in real time before downloading.
                </p>
              </div>

              {/* Right Visual Card 2: Custom color QR, swatches, Logo.png tag, style pills */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-50/60 via-zinc-50 to-blue-50/40 dark:from-zinc-900/90 dark:to-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-sm order-1 md:order-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    {/* QR with purple eyes & center logo */}
                    <div className="w-24 h-24 bg-white dark:bg-zinc-800 p-2 rounded-2xl shadow-sm border border-zinc-200/80 dark:border-zinc-700/70 relative shrink-0">
                      <svg className="w-full h-full" viewBox="0 0 40 40" fill="currentColor">
                        {/* Purple eye corners */}
                        <rect x="4" y="4" width="10" height="10" rx="3" fill="#8b5cf6" />
                        <rect x="6" y="6" width="6" height="6" fill="white" />
                        <circle cx="9" cy="9" r="2" fill="#8b5cf6" />

                        <rect x="26" y="4" width="10" height="10" rx="3" fill="#8b5cf6" />
                        <rect x="28" y="6" width="6" height="6" fill="white" />
                        <circle cx="31" cy="9" r="2" fill="#8b5cf6" />

                        <rect x="4" y="26" width="10" height="10" rx="3" fill="#8b5cf6" />
                        <rect x="6" y="28" width="6" height="6" fill="white" />
                        <circle cx="9" cy="31" r="2" fill="#8b5cf6" />

                        {/* Dots */}
                        <circle cx="19" cy="7" r="1.2" fill="#18181b" />
                        <circle cx="19" cy="13" r="1.2" fill="#18181b" />
                        <circle cx="7" cy="19" r="1.2" fill="#18181b" />
                        <circle cx="33" cy="19" r="1.2" fill="#18181b" />
                        <circle cx="21" cy="27" r="1.2" fill="#18181b" />
                        <circle cx="27" cy="33" r="1.2" fill="#18181b" />
                      </svg>
                      {/* Logo cake/brand center overlay */}
                      <div className="absolute inset-0 m-auto w-7 h-7 rounded-lg bg-white dark:bg-zinc-900 border border-purple-300 shadow-xs flex items-center justify-center text-xs">
                        🧁
                      </div>
                    </div>

                    {/* Swatches & Logo tag */}
                    <div className="flex-1 space-y-3">
                      {/* Color swatches */}
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-zinc-900 shadow-xs"></span>
                        <span className="w-5 h-5 rounded-md bg-purple-600 ring-2 ring-purple-400 shadow-xs"></span>
                        <span className="w-5 h-5 rounded-md bg-amber-500 shadow-xs"></span>
                      </div>

                      {/* Logo.png pill */}
                      <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xs flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-200 text-[11px]">
                          <ImageIcon className="w-3.5 h-3.5 text-purple-600" /> Logo.png
                        </span>
                        <X className="w-3.5 h-3.5 text-zinc-400" />
                      </div>
                    </div>
                  </div>

                  {/* Style presets row (Classic, Rounded, Thin, Smooth) */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1 text-center">
                    <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                      Classic
                    </div>
                    <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-400 text-[10px] font-bold text-purple-600 dark:text-purple-300 shadow-xs">
                      Rounded
                    </div>
                    <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                      Thin
                    </div>
                    <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                      Smooth
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Left Visual Card 3: Download formats */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50/60 to-zinc-50 dark:from-zinc-900/90 dark:to-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                <div className="bg-white dark:bg-zinc-800/90 rounded-2xl p-5 shadow-sm border border-zinc-200/70 dark:border-zinc-700/60 text-center space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4" /> 100% Static & Permanent
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40">
                      <p className="font-bold text-xs text-blue-900 dark:text-blue-200">SVG Vector</p>
                      <p className="text-[10px] text-blue-600/80 mt-0.5">Infinite Scale for Print</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
                      <p className="font-bold text-xs text-emerald-900 dark:text-emerald-200">PNG Format</p>
                      <p className="text-[10px] text-emerald-600/80 mt-0.5">High-Res for Screens</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Description 3 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm">
                    3
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Instant Download — No Expiry
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed pl-11">
                  Download as PNG (for digital use) or vector SVG (for print, posters, and flyers that scale infinitely). Sensitive information like Wi-Fi passwords never touches an external server.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Proof Output Mockup */}
      <QrGeneratorPreviewMockup />

      <ToolSeoSection toolSlug="qr-generator" />
    </div>
  );
}
