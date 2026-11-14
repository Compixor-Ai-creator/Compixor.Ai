# Landing Page Redesign Plan v2

## 1. Stack & File Map
- **Stack**: Next.js 14.2 (App Router, React 18, TS 5.6) · Tailwind CSS 3.4 · Headless UI 2.2 · Local Fonts (Inter, Outfit, Playfair, JetBrains)
- **Editable**: `src/app/page.tsx`, `src/components/CompixorNavbar.jsx`, `src/components/Footer.tsx`, `src/components/landing/*`, `src/styles/*`, metadata
- **Locked**: `src/app/tools/**`, `src/app/blog/**`, `src/app/api/**`, `src/app/privacy`, `src/app/terms`, `src/app/about`, config/deps

## 2. Real Tool Catalog (12 Tools)
- PDF Compressor (`/tools/pdf-compressor`, local) · PDF Merge & Split (`/tools/pdf-organizer`, local)
- PDF to Word (`/tools/pdf-to-word`, server) · Add Watermark (`/tools/add-watermark`, local)
- Remove Watermark (`/tools/remove-watermark`, local) · Protect PDF (`/tools/protect-pdf`, local)
- Unlock PDF (`/tools/unlock-pdf`, local) · Word Compressor (`/tools/word-compressor`, local)
- Image to Word (`/tools/img-to-word`, server) · Passport Photo (`/tools/passport-photo`, server)
- Full DP Maker (`/tools/full-dp-maker`, local) · QR Code Generator (`/tools/qr-generator`, local)

## 3. Real Blog Posts (12 Articles in `blogsData.ts`)
1. Pakistani Passport & NADRA Guide (`passport-size-photo-maker-online-free`, `/blog/passport-photo-maker-thumbnail.webp`)
2. WhatsApp Full DP Guide (`how-to-set-full-dp-on-whatsapp-without-cropping`, `/blog/whatsapp-full-dp-maker-thumbnail.webp`)
3. Custom QR Code with Logo (`how-to-create-custom-qr-code-with-logo`, `/blog/custom-qr-code-with-logo-thumbnail.webp`)
4. Shrink PDF Without Quality Loss (`how-to-compress-pdf-without-losing-quality`, `/blog/pdf-compressor-hero.webp`)
5. Merge & Split PDF Locally (`how-to-merge-and-split-pdf-files-online`, `/blog/merge-and-split-pdf-hero.webp`)
6. Convert PDF to Editable Word (`convert-pdf-to-editable-word-online`, `/blog/pdf-to-word-thumbnail.webp`)
7. Secure PDF with AES-256 (`password-protect-pdf-files-online`, `/blog/password-protect-pdf-hero.webp`)
8. Decrypt & Remove Restrictions (`how-to-remove-password-from-pdf`, `/blog/remove-password-from-pdf-thumbnail.webp`)
9. Apply Watermark Stamps (`how-to-add-watermark-to-pdf`, `/blog/pdf-watermark-hero.webp`)
10. Remove Watermarks Cleanly (`remove-watermark-from-pdf-cleanly`, `/blog/remove-watermark-from-pdf-thumbnail.webp`)
11. Compress Word DOCX (`how-to-compress-word-docx-files`, `/blog/how-to-compress-word-docx-files-thumbnail.webp`)
12. OCR Image to Word (`extract-text-from-image-to-word`, `/blog/extract-text-from-image-to-word-thumbnail.webp`)

## 4. Existing Footer / Legal / Support Links
- **Pages**: `/about` (About Us), `/blog` (Blogs & Guides), `/privacy` (Privacy Policy), `/terms` (Terms of Service), `/contact` (Contact Us)
- **Direct Actions**: `mailto:support@compixor.com` (Contact), Tool Request Modal, Feedback Modal
- **External & Trust**: LinkedIn, X/Twitter, WhatsApp, Facebook, GitHub (`Compixor-Ai-creator`), Dang.ai Verified badge

## 5. Section Order & Planned Changes
1. **Navbar**: Modernize glass container with Glossy Ribbon "C" Logo (`Glossy Purple Ribbon C Logo.png`), preserve navigation/theme toggle.
2. **Hero**: Headline rhythm, trust pill badges, dual CTAs, and integrate "Neon PDF Tools Orbiting Interface" as the hero visual showcase.
3. **Core Tool Grid**: High-contrast glass cards with category filters, processing badges (Local RAM vs HTTPS), and clear CTAs.
4. **Value & Speed Pillars**: Re-architect trust signals using reference-inspired card rhythm and micro-interactions.
5. **How It Works (Step Guide)**: 4-step progressive timeline preserving semantic `<ol>` and snippet-friendly structure.
6. **Architecture Comparison**: Redesign comparison table (Compixor vs Cloud vs Desktop) with cleaner contrast and status badges.
7. **Featured Guides / Blog Carousel**: Highlight top articles with thumbnails and read-time badges directly from `blogsData.ts`.
8. **Semantic Glossary & Why Trust**: Clean accordion/card grid preserving SEO schemas and terminology tags.
9. **FAQ Section**: Headless UI search filter accordion with streamlined typography and instant search.
10. **Final Conversion CTA & Footer**: High-energy CTA banner + cohesive footer with watermarked typography.

## 6. Risks & Safeguards
- **Shared Layout Risk**: Navbar & Footer affect all 12 tool and legal pages; must test site-wide responsiveness and avoid breaking classes.
- **SEO & Schema Risk**: Must preserve `FaqJsonLd`, breadcrumb microdata, and existing heading hierarchy IDs for crawler ranking.
- **Performance Risk**: Large reference PNGs must use Next.js Image optimization (`next/image` with WebP/AVIF) to prevent LCP degradation.
