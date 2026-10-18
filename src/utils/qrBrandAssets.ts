export interface BrandLogoItem {
  id: string;
  name: string;
  category: 'social' | 'corporate' | 'iconic' | 'utility';
  bgColor: string;
  fgColor: string;
  svgDataUri: string;
}

// Helper to convert SVG string to clean safe data URI
const toDataUri = (svg: string): string => {
  if (typeof window !== 'undefined') {
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  }
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// 1. Compixor AI Brand Badge (Electric Cyber Gradient & Sparkles AI Star)
const compixorSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <defs>
    <linearGradient id="compixorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="50%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>
  <circle cx="24" cy="24" r="23" fill="url(#compixorGrad)" stroke="#ffffff" stroke-width="2"/>
  <path d="M24 9 C24 16 21 19 14 19 C21 19 24 22 24 29 C24 22 27 19 34 19 C27 19 24 16 24 9 Z" fill="#ffffff"/>
  <path d="M33 28 C33 31.5 31.5 33 28 33 C31.5 33 33 34.5 33 38 C33 34.5 34.5 33 38 33 C34.5 33 33 31.5 33 28 Z" fill="#cffafe"/>
  <circle cx="15" cy="31" r="1.5" fill="#ffffff"/>
</svg>`;

// 2. Google 4-Color "G" (Authentic Pixel-Perfect Vector Geometry)
const googleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <circle cx="24" cy="24" r="23" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
  <g transform="translate(10.5, 10.5) scale(1.125)">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.07.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.25 21.31 7.31 24 12 24z"/>
    <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.57H1.26C.46 8.16 0 9.98 0 12s.46 3.84 1.26 5.43l4.02-3.14z"/>
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.26 6.57l4.02 3.14c.95-2.83 3.6-4.96 6.72-4.96z"/>
  </g>
</svg>`;

// 3. Facebook Official Roundel
const facebookSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <circle cx="24" cy="24" r="23" fill="#1877F2" stroke="#ffffff" stroke-width="2"/>
  <path fill="#ffffff" d="M29.5 25.5l.8-5.3h-5.1v-3.4c0-1.4.7-2.8 3-2.8h2.3V9.5s-2.1-.4-4.1-.4c-4.2 0-6.9 2.5-6.9 7.1v4h-4.6v5.3h4.6V39h5.5V25.5h4.5z"/>
</svg>`;

// 4. WhatsApp Messenger
const whatsappSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <circle cx="24" cy="24" r="23" fill="#25D366" stroke="#ffffff" stroke-width="2"/>
  <path d="M34 14.5c-2.6-2.6-6.1-4-9.8-4-7.7 0-13.9 6.2-13.9 13.9 0 2.5.6 4.9 1.9 7l-2 7.3 7.5-2c2 1.1 4.3 1.7 6.6 1.7 7.7 0 13.9-6.2 13.9-13.9 0-3.7-1.4-7.2-4.2-10z" fill="#ffffff"/>
  <path d="M30.4 27.6c-.4-.2-2.3-1.1-2.6-1.3-.4-.1-.6-.2-.9.2-.3.4-1 1.3-1.3 1.5-.2.3-.5.3-.9.1-.4-.2-1.7-.6-3.2-2-1.2-1.1-2-2.4-2.2-2.8-.2-.4 0-.6.2-.8.2-.2.4-.5.6-.7.2-.2.3-.4.4-.6.1-.2.1-.5 0-.7-.1-.2-.9-2.1-1.2-2.9-.3-.8-.7-.7-.9-.7h-.8c-.3 0-.7.1-1.1.5-.4.4-1.5 1.5-1.5 3.6 0 2.1 1.5 4.2 1.7 4.5.3.3 3 4.6 7.3 6.4 1 .4 1.8.7 2.5.9.8.3 1.6.2 2.2.1.7-.1 2.3-.9 2.6-1.8.3-.9.3-1.7.2-1.8-.1-.3-.4-.4-.8-.6z" fill="#25D366"/>
</svg>`;

// 5. Instagram Sunset
const instagramSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <defs>
    <linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fcb045"/>
      <stop offset="50%" stop-color="#fd1d1d"/>
      <stop offset="100%" stop-color="#833ab4"/>
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#igGrad)" stroke="#ffffff" stroke-width="2"/>
  <rect x="11" y="11" width="26" height="26" rx="7" fill="none" stroke="#ffffff" stroke-width="2.5"/>
  <circle cx="24" cy="24" r="6.5" fill="none" stroke="#ffffff" stroke-width="2.5"/>
  <circle cx="31.5" cy="16.5" r="1.5" fill="#ffffff"/>
</svg>`;

// 6. YouTube Play Button
const youtubeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <circle cx="24" cy="24" r="23" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
  <rect x="8" y="14" width="32" height="20" rx="6" fill="#FF0000"/>
  <polygon points="21,19 29,24 21,29" fill="#ffffff"/>
</svg>`;

// 7. Spotify Soundwaves
const spotifySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <circle cx="24" cy="24" r="23" fill="#1DB954" stroke="#ffffff" stroke-width="2"/>
  <path d="M33 21c-4.5-2.7-12-3-16.3-1.7-.7.2-1.4-.2-1.6-.9-.2-.7.2-1.4.9-1.6 5-1.5 13.2-1.2 18.4 1.9.6.4.8 1.2.5 1.8-.4.7-1.2.9-1.9.5zm-.5 5.5c-.4.6-1.2.8-1.8.4-3.7-2.3-9.4-3-13.8-1.6-.7.2-1.4-.2-1.6-.8-.2-.7.2-1.4.8-1.6 5.1-1.5 11.4-.8 15.8 1.8.6.4.8 1.2.6 1.8zm-1.8 5.4c-.3.5-.9.7-1.5.3-3.2-2-7.3-2.4-12.1-1.3-.6.1-1.1-.3-1.2-.8-.1-.6.3-1.1.8-1.2 5.3-1.2 9.8-.7 13.5 1.5.6.3.7.9.5 1.5z" fill="#ffffff"/>
</svg>`;

// 8. TikTok Neon
const tiktokSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <circle cx="24" cy="24" r="23" fill="#010101" stroke="#ffffff" stroke-width="2"/>
  <path fill="#25F4EE" d="M30.6 14.6c1.6 1.8 3.8 2.9 6.2 3.1v4.3c-2.3 0-4.4-.7-6.2-1.9v10.3c0 5.4-4.4 9.8-9.8 9.8-3.9 0-7.3-2.3-8.8-5.6 1.1.2 2.2.1 3.2-.3 1.5 2.1 4 3.4 6.8 3.4 4.7 0 8.5-3.8 8.5-8.5V10.2h4.5c0 1.6-.7 3.2-1.8 4.4h-2.6z"/>
  <path fill="#FE2C55" d="M28.4 12.8v17.6c0 4.7-3.8 8.5-8.5 8.5-4.7 0-8.5-3.8-8.5-8.5 0-4.7 3.8-8.5 8.5-8.5 1 0 1.9.2 2.8.5v4.5c-.8-.5-1.8-.8-2.8-.8-2.6 0-4.7 2.1-4.7 4.7s2.1 4.7 4.7 4.7 4.7-2.1 4.7-4.7V9h3.8c.2 1.4.9 2.7 1.8 3.8h-1.8z"/>
  <path fill="#ffffff" d="M28.4 14.6c1.6 1.8 3.8 2.9 6.2 3.1v-4.3c-2.4-.2-4.5-1.4-5.9-3.2h-3.9v18.7c0 2.6-2.1 4.7-4.7 4.7s-4.7-2.1-4.7-4.7 2.1-4.7 4.7-4.7c1 0 1.9.3 2.8.8v-4.5c-.9-.3-1.8-.5-2.8-.5-4.7 0-8.5 3.8-8.5 8.5s3.8 8.5 8.5 8.5 8.5-3.8 8.5-8.5V14.6h-.2z"/>
</svg>`;

// 9. Apple Silhouette
const appleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <circle cx="24" cy="24" r="23" fill="#0f172a" stroke="#ffffff" stroke-width="2"/>
  <path fill="#ffffff" d="M28.2 14.3c1-.1 2.4-.9 3-1.7.6-.8 1.1-2 1-3.2-1.1 0-2.4.7-3.1 1.6-.6.8-1.1 2-.9 3.3zm3.7 5.4c-2.3-.1-4.3 1.4-5.4 1.4-1.1 0-2.8-1.3-4.6-1.3-2.4 0-4.6 1.4-5.8 3.5-2.5 4.3-.6 10.7 1.8 14.2 1.2 1.7 2.6 3.6 4.4 3.5 1.8-.1 2.5-1.2 4.6-1.2 2.2 0 2.8 1.2 4.6 1.1 1.9 0 3.1-1.7 4.3-3.4 1.4-2 1.9-3.9 2-4-.1-.1-3.8-1.5-3.8-5.8 0-3.6 3-5.3 3.1-5.4-1.7-2.6-4.4-2.9-5.2-3z"/>
</svg>`;

// 10. Amazon Smile
const amazonSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <circle cx="24" cy="24" r="23" fill="#131921" stroke="#ffffff" stroke-width="2"/>
  <text x="24" y="24" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="11" fill="#ffffff" text-anchor="middle" letter-spacing="-0.5">amazon</text>
  <path d="M14 27 C20 32 28 32 34 27" fill="none" stroke="#FF9900" stroke-width="2.4" stroke-linecap="round"/>
  <polygon points="32.5,29.5 35.5,27.5 35,31" fill="#FF9900"/>
</svg>`;

// 11. Netflix Ribbon "N"
const netflixSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <circle cx="24" cy="24" r="23" fill="#141414" stroke="#ffffff" stroke-width="2"/>
  <path d="M17 11 L22 11 L22 37 L17 37 Z" fill="#E50914"/>
  <path d="M26 11 L31 11 L31 37 L26 37 Z" fill="#E50914"/>
  <path d="M17 11 L28 37 L31 37 L20 11 Z" fill="#B81D24"/>
</svg>`;

// 12. Nike Swoosh
const nikeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <circle cx="24" cy="24" r="23" fill="#0f172a" stroke="#ffffff" stroke-width="2"/>
  <path d="M10 24 C14 28 19 32 24 32 C33 32 40 23 40 16 C38 21 32 25 24 25 C17 25 14 21 10 24 Z" fill="#ffffff"/>
</svg>`;

// 13. McDonald's Golden Arches
const mcdonaldsSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <circle cx="24" cy="24" r="23" fill="#DA291C" stroke="#ffffff" stroke-width="2"/>
  <path d="M12 36 C12 25 15 14 19 14 C23 14 24 22 24 28 C24 22 25 14 29 14 C33 14 36 25 36 36 L32.5 36 C32.5 28 31 18 29 18 C26.5 18 26 25 26 31 L22 31 C22 25 21.5 18 19 18 C17 18 15.5 28 15.5 36 Z" fill="#FFC72C"/>
</svg>`;

// 14. KFC Colonel Sanders
const kfcSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <circle cx="24" cy="24" r="23" fill="#e4002b" stroke="#ffffff" stroke-width="2"/>
  <circle cx="24" cy="24" r="18" fill="#ffffff"/>
  <path d="M24 13c-3 0-5.5 2.2-5.5 5 0 1.2.5 2.3 1.3 3.1l-.8 4.9c-.1.6.4 1 1 1h8c.6 0 1.1-.4 1-1l-.8-4.9c.8-.8 1.3-1.9 1.3-3.1 0-2.8-2.5-5-5.5-5z" fill="#1e1e1e"/>
  <path d="M21 28l-2 4h10l-2-4h-6z" fill="#e4002b"/>
  <rect x="22.5" y="27" width="3" height="3" fill="#1e1e1e" rx="0.5"/>
  <circle cx="21.5" cy="18" r="1" fill="#ffffff"/>
  <circle cx="26.5" cy="18" r="1" fill="#ffffff"/>
  <path d="M20 22c1.2 1 2.8 1.5 4 1.5s2.8-.5 4-1.5" stroke="#ffffff" stroke-width="1" stroke-linecap="round" fill="none"/>
</svg>`;

// 15. Starbucks Siren Green
const starbucksSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <circle cx="24" cy="24" r="23" fill="#00704a" stroke="#ffffff" stroke-width="2"/>
  <circle cx="24" cy="24" r="16.5" fill="none" stroke="#ffffff" stroke-width="1.2"/>
  <path d="M24 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-2.8 0-5 2.2-5 5v3c0 2 2.2 4 5 4s5-2 5-4v-3c0-2.8-2.2-5-5-5z" fill="#ffffff"/>
  <path d="M19 28c-1.5 1.5-3 4-3 7h16c0-3-1.5-5.5-3-7-1.5 1-3.2 1.5-5 1.5s-3.5-.5-5-1.5z" fill="#ffffff"/>
  <circle cx="16" cy="19" r="1.5" fill="#ffffff"/>
  <circle cx="32" cy="19" r="1.5" fill="#ffffff"/>
</svg>`;

// 16. BMW Bavarian Roundel
const bmwSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <circle cx="24" cy="24" r="23" fill="#0f172a" stroke="#ffffff" stroke-width="2"/>
  <circle cx="24" cy="24" r="16" fill="#ffffff" stroke="#94a3b8" stroke-width="0.8"/>
  <path d="M24 8 A16 16 0 0 1 40 24 L24 24 Z" fill="#0066b1"/>
  <path d="M8 24 A16 16 0 0 1 24 8 L24 24 Z" fill="#ffffff"/>
  <path d="M24 24 L24 40 A16 16 0 0 1 8 24 Z" fill="#0066b1"/>
  <path d="M24 24 L40 24 A16 16 0 0 1 24 40 Z" fill="#ffffff"/>
  <circle cx="24" cy="24" r="16" fill="none" stroke="#0f172a" stroke-width="1"/>
  <text x="24" y="6.8" font-family="Arial, sans-serif" font-weight="900" font-size="3.5" fill="#ffffff" text-anchor="middle">BMW</text>
</svg>`;

// 17. Burger King
const burgerKingSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <circle cx="24" cy="24" r="23" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
  <path d="M12 20 C12 13 17 10 24 10 C31 10 36 13 36 20 Z" fill="#f5a623"/>
  <path d="M12 28 C12 35 17 38 24 38 C31 38 36 35 36 28 Z" fill="#f5a623"/>
  <rect x="9" y="21" width="30" height="6" rx="2" fill="#d62300"/>
  <text x="24" y="25.5" font-family="Arial Black, Impact, sans-serif" font-size="4" font-weight="900" fill="#ffffff" text-anchor="middle">BURGER</text>
</svg>`;

// 18. UPS Shield Gold & Brown
const upsSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <path d="M24 4 C34 4 40 8 40 18 C40 32 29 42 24 44 C19 42 8 32 8 18 C8 8 14 4 24 4 Z" fill="#fbb03b" stroke="#ffffff" stroke-width="2"/>
  <path d="M24 7 C31 7 36 10 36 18 C36 29 27 37 24 39 C21 37 12 29 12 18 C12 10 17 7 24 7 Z" fill="#351c15"/>
  <text x="24" y="26" font-family="Impact, Arial Black, sans-serif" font-weight="bold" font-size="11" fill="#fbb03b" text-anchor="middle" letter-spacing="-0.5">ups</text>
</svg>`;

// 19. X (formerly Twitter)
const xTwitterSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <circle cx="24" cy="24" r="23" fill="#0f172a" stroke="#ffffff" stroke-width="2"/>
  <path d="M28.4 13h3.5l-7.7 8.8 9.1 12.2h-7l-5.5-7.2-6.3 7.2H11l8.3-9.5L10.5 13h7.2l5 6.6L28.4 13zm-1.2 18.9h1.9L17.2 15h-2.1l12.1 16.9z" fill="#ffffff"/>
</svg>`;

// 20. LinkedIn
const linkedinSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <rect x="2" y="2" width="44" height="44" rx="10" fill="#0A66C2" stroke="#ffffff" stroke-width="2"/>
  <path d="M15.5 19h-5v16h5V19zM13 11.5c-1.6 0-2.8 1.2-2.8 2.7s1.2 2.7 2.8 2.7 2.8-1.2 2.8-2.7-1.2-2.7-2.8-2.7zM37.5 25.5c0-4.7-2.5-6.9-5.9-6.9-2.7 0-3.9 1.5-4.6 2.6V19h-5c.1 1.4 0 16 0 16h5v-8.9c0-.5 0-.9.2-1.3.4-1 .9-2 2.5-2 1.8 0 2.5 1.3 2.5 3.3V35h5.3v-9.5z" fill="#ffffff"/>
</svg>`;

// 21. Telegram Sky
const telegramSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <circle cx="24" cy="24" r="23" fill="#24A1DE" stroke="#ffffff" stroke-width="2"/>
  <path d="M12 24 L34 14 L30 33 L23 28 L19 31 L20 25 L30 18 L17 23 Z" fill="#ffffff" stroke-linejoin="round"/>
</svg>`;

// 22. Discord Blurple
const discordSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <circle cx="24" cy="24" r="23" fill="#5865F2" stroke="#ffffff" stroke-width="2"/>
  <path d="M32.5 16.5c-2-.9-4.2-1.6-6.5-1.8-.3.5-.6 1.1-.8 1.7-2.4-.4-4.8-.4-7.2 0-.2-.6-.5-1.2-.8-1.7-2.3.2-4.5.9-6.5 1.8-4.1 6.1-5.2 12.1-4.7 18 2.7 2 5.3 3.2 7.9 4 .6-.8 1.2-1.7 1.7-2.6-1-.4-1.9-.9-2.7-1.5.2-.2.5-.3.7-.5 5.2 2.4 10.8 2.4 15.9 0 .2.2.5.3.7.5-.9.6-1.8 1.1-2.7 1.5.5.9 1.1 1.8 1.7 2.6 2.6-.8 5.2-2 7.9-4 .6-6.8-.9-12.7-4.7-18zM19 28c-1.4 0-2.5-1.3-2.5-2.8s1.1-2.8 2.5-2.8 2.5 1.3 2.5 2.8c0 1.5-1.1 2.8-2.5 2.8zm10 0c-1.4 0-2.5-1.3-2.5-2.8s1.1-2.8 2.5-2.8 2.5 1.3 2.5 2.8c0 1.5-1.1 2.8-2.5 2.8z" fill="#ffffff"/>
</svg>`;

// 23. Wi-Fi Badge
const wifiSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <circle cx="24" cy="24" r="23" fill="#2563eb" stroke="#ffffff" stroke-width="2"/>
  <path d="M13 17c6.1-5.3 15.9-5.3 22 0M16.5 21.5c4.1-3.6 10.9-3.6 15 0M20.5 26c1.9-1.7 5.1-1.7 7 0" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="24" cy="32" r="2.5" fill="#ffffff"/>
</svg>`;

// 24. Global Web / Link Badge
const webLinkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <circle cx="24" cy="24" r="23" fill="#0284c7" stroke="#ffffff" stroke-width="2"/>
  <circle cx="24" cy="24" r="14" fill="none" stroke="#ffffff" stroke-width="2"/>
  <line x1="10" y1="24" x2="38" y2="24" stroke="#ffffff" stroke-width="2"/>
  <path d="M24 10 C29 15 31 20 31 24 C31 28 29 33 24 38 C19 33 17 28 17 24 C17 20 19 15 24 10 Z" fill="none" stroke="#ffffff" stroke-width="2"/>
</svg>`;

export const brandLogos: BrandLogoItem[] = [
  { id: 'compixor', name: 'Compixor AI', category: 'corporate', bgColor: '#2563eb', fgColor: '#ffffff', svgDataUri: toDataUri(compixorSvg) },
  { id: 'google', name: 'Google', category: 'corporate', bgColor: '#4285F4', fgColor: '#ffffff', svgDataUri: toDataUri(googleSvg) },
  { id: 'facebook', name: 'Facebook', category: 'social', bgColor: '#1877F2', fgColor: '#ffffff', svgDataUri: toDataUri(facebookSvg) },
  { id: 'whatsapp', name: 'WhatsApp', category: 'social', bgColor: '#25D366', fgColor: '#ffffff', svgDataUri: toDataUri(whatsappSvg) },
  { id: 'instagram', name: 'Instagram', category: 'social', bgColor: '#fd1d1d', fgColor: '#ffffff', svgDataUri: toDataUri(instagramSvg) },
  { id: 'youtube', name: 'YouTube', category: 'social', bgColor: '#FF0000', fgColor: '#ffffff', svgDataUri: toDataUri(youtubeSvg) },
  { id: 'tiktok', name: 'TikTok', category: 'social', bgColor: '#010101', fgColor: '#25F4EE', svgDataUri: toDataUri(tiktokSvg) },
  { id: 'spotify', name: 'Spotify', category: 'social', bgColor: '#1DB954', fgColor: '#ffffff', svgDataUri: toDataUri(spotifySvg) },
  { id: 'apple', name: 'Apple', category: 'corporate', bgColor: '#0f172a', fgColor: '#ffffff', svgDataUri: toDataUri(appleSvg) },
  { id: 'amazon', name: 'Amazon', category: 'corporate', bgColor: '#131921', fgColor: '#FF9900', svgDataUri: toDataUri(amazonSvg) },
  { id: 'netflix', name: 'Netflix', category: 'iconic', bgColor: '#141414', fgColor: '#E50914', svgDataUri: toDataUri(netflixSvg) },
  { id: 'nike', name: 'Nike', category: 'iconic', bgColor: '#0f172a', fgColor: '#ffffff', svgDataUri: toDataUri(nikeSvg) },
  { id: 'mcdonalds', name: "McDonald's", category: 'iconic', bgColor: '#DA291C', fgColor: '#FFC72C', svgDataUri: toDataUri(mcdonaldsSvg) },
  { id: 'kfc', name: 'KFC', category: 'iconic', bgColor: '#e4002b', fgColor: '#ffffff', svgDataUri: toDataUri(kfcSvg) },
  { id: 'starbucks', name: 'Starbucks', category: 'iconic', bgColor: '#00704a', fgColor: '#ffffff', svgDataUri: toDataUri(starbucksSvg) },
  { id: 'bmw', name: 'BMW', category: 'iconic', bgColor: '#0f172a', fgColor: '#0066b1', svgDataUri: toDataUri(bmwSvg) },
  { id: 'burger-king', name: 'Burger King', category: 'iconic', bgColor: '#f5a623', fgColor: '#d62300', svgDataUri: toDataUri(burgerKingSvg) },
  { id: 'ups', name: 'UPS', category: 'iconic', bgColor: '#fbb03b', fgColor: '#351c15', svgDataUri: toDataUri(upsSvg) },
  { id: 'x-twitter', name: 'X / Twitter', category: 'social', bgColor: '#0f172a', fgColor: '#ffffff', svgDataUri: toDataUri(xTwitterSvg) },
  { id: 'linkedin', name: 'LinkedIn', category: 'social', bgColor: '#0A66C2', fgColor: '#ffffff', svgDataUri: toDataUri(linkedinSvg) },
  { id: 'telegram', name: 'Telegram', category: 'social', bgColor: '#24A1DE', fgColor: '#ffffff', svgDataUri: toDataUri(telegramSvg) },
  { id: 'discord', name: 'Discord', category: 'social', bgColor: '#5865F2', fgColor: '#ffffff', svgDataUri: toDataUri(discordSvg) },
  { id: 'wifi', name: 'Wi-Fi Hotspot', category: 'utility', bgColor: '#2563eb', fgColor: '#ffffff', svgDataUri: toDataUri(wifiSvg) },
  { id: 'weblink', name: 'Website / Link', category: 'utility', bgColor: '#0284c7', fgColor: '#ffffff', svgDataUri: toDataUri(webLinkSvg) },
];

export interface BrandStylePreset {
  id: string;
  name: string;
  brand: string;
  description: string;
  fgColor: string;
  bgColor: string;
  cornerColor: string;
  cornerDotColor?: string;
  dotType: 'square' | 'dots' | 'rounded' | 'classy' | 'extra-rounded';
  cornerType: 'square' | 'dot' | 'extra-rounded';
  logoId: string;
  logoSize: number;
  logoMargin: number;
  gradientCss?: string;
  gradient?: {
    type: 'linear' | 'radial';
    rotation?: number;
    colorStops: { offset: number; color: string }[];
  };
}

export const brandPresets: BrandStylePreset[] = [
  {
    id: 'brand-compixor',
    name: 'Compixor Cyber AI',
    brand: 'Compixor AI',
    description: 'Electric AI gradient with cyan core and sparkles emblem',
    fgColor: '#2563eb',
    bgColor: '#ffffff',
    cornerColor: '#2563eb',
    cornerDotColor: '#06b6d4',
    dotType: 'classy',
    cornerType: 'extra-rounded',
    logoId: 'compixor',
    logoSize: 0.35,
    logoMargin: 6,
    gradientCss: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 50%, #06b6d4 100%)',
    gradient: {
      type: 'linear',
      rotation: Math.PI / 4,
      colorStops: [
        { offset: 0, color: '#2563eb' },
        { offset: 0.5, color: '#8b5cf6' },
        { offset: 1, color: '#06b6d4' },
      ],
    },
  },
  {
    id: 'brand-google',
    name: 'Google Spectrum',
    brand: 'Google',
    description: 'Official 4-Color Google gradient & authentic G emblem',
    fgColor: '#4285F4',
    bgColor: '#ffffff',
    cornerColor: '#4285F4',
    cornerDotColor: '#EA4335',
    dotType: 'dots',
    cornerType: 'dot',
    logoId: 'google',
    logoSize: 0.35,
    logoMargin: 6,
    gradientCss: 'linear-gradient(135deg, #4285F4 0%, #EA4335 35%, #FBBC05 70%, #34A853 100%)',
    gradient: {
      type: 'linear',
      rotation: Math.PI / 4,
      colorStops: [
        { offset: 0, color: '#4285F4' },
        { offset: 0.35, color: '#EA4335' },
        { offset: 0.7, color: '#FBBC05' },
        { offset: 1, color: '#34A853' },
      ],
    },
  },
  {
    id: 'brand-facebook',
    name: 'Facebook Official',
    brand: 'Facebook',
    description: 'Signature Meta blue matrix with deep azure pupil',
    fgColor: '#1877F2',
    bgColor: '#ffffff',
    cornerColor: '#1877F2',
    cornerDotColor: '#0d56b3',
    dotType: 'rounded',
    cornerType: 'extra-rounded',
    logoId: 'facebook',
    logoSize: 0.36,
    logoMargin: 6,
  },
  {
    id: 'brand-whatsapp',
    name: 'WhatsApp Official',
    brand: 'WhatsApp',
    description: 'Official WhatsApp green with dark teal contrast eyes',
    fgColor: '#25D366',
    bgColor: '#ffffff',
    cornerColor: '#075E54',
    cornerDotColor: '#25D366',
    dotType: 'dots',
    cornerType: 'dot',
    logoId: 'whatsapp',
    logoSize: 0.35,
    logoMargin: 6,
  },
  {
    id: 'brand-instagram',
    name: 'Instagram Sunset',
    brand: 'Instagram',
    description: 'Signature purple-to-gold radiant sunset gradient',
    fgColor: '#fd1d1d',
    bgColor: '#ffffff',
    cornerColor: '#833ab4',
    cornerDotColor: '#fcb045',
    dotType: 'extra-rounded',
    cornerType: 'extra-rounded',
    logoId: 'instagram',
    logoSize: 0.35,
    logoMargin: 6,
    gradientCss: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
    gradient: {
      type: 'linear',
      rotation: Math.PI / 4,
      colorStops: [
        { offset: 0, color: '#833ab4' },
        { offset: 0.5, color: '#fd1d1d' },
        { offset: 1, color: '#fcb045' },
      ],
    },
  },
  {
    id: 'brand-youtube',
    name: 'YouTube Crimson',
    brand: 'YouTube',
    description: 'Ruby red matrix with play emblem',
    fgColor: '#FF0000',
    bgColor: '#ffffff',
    cornerColor: '#282828',
    cornerDotColor: '#FF0000',
    dotType: 'rounded',
    cornerType: 'extra-rounded',
    logoId: 'youtube',
    logoSize: 0.36,
    logoMargin: 6,
  },
  {
    id: 'brand-tiktok',
    name: 'TikTok Neon Pulse',
    brand: 'TikTok',
    description: 'Stealth black matrix with cyan & magenta neon split',
    fgColor: '#010101',
    bgColor: '#ffffff',
    cornerColor: '#25F4EE',
    cornerDotColor: '#FE2C55',
    dotType: 'classy',
    cornerType: 'extra-rounded',
    logoId: 'tiktok',
    logoSize: 0.35,
    logoMargin: 6,
    gradientCss: 'linear-gradient(135deg, #010101 0%, #25F4EE 60%, #FE2C55 100%)',
    gradient: {
      type: 'linear',
      rotation: Math.PI / 4,
      colorStops: [
        { offset: 0, color: '#010101' },
        { offset: 0.6, color: '#25F4EE' },
        { offset: 1, color: '#FE2C55' },
      ],
    },
  },
  {
    id: 'brand-spotify',
    name: 'Spotify Dark Mode',
    brand: 'Spotify',
    description: 'Electric neon green on stealth black canvas',
    fgColor: '#1DB954',
    bgColor: '#121212',
    cornerColor: '#1DB954',
    cornerDotColor: '#ffffff',
    dotType: 'dots',
    cornerType: 'dot',
    logoId: 'spotify',
    logoSize: 0.35,
    logoMargin: 6,
  },
  {
    id: 'brand-apple',
    name: 'Apple Minimalist',
    brand: 'Apple',
    description: 'Obsidian black matrix with precision rounded corners',
    fgColor: '#0f172a',
    bgColor: '#ffffff',
    cornerColor: '#0f172a',
    cornerDotColor: '#64748b',
    dotType: 'rounded',
    cornerType: 'extra-rounded',
    logoId: 'apple',
    logoSize: 0.35,
    logoMargin: 6,
  },
  {
    id: 'brand-amazon',
    name: 'Amazon Prime Gold',
    brand: 'Amazon',
    description: 'Midnight navy canvas with warm amber smile',
    fgColor: '#131921',
    bgColor: '#ffffff',
    cornerColor: '#131921',
    cornerDotColor: '#FF9900',
    dotType: 'rounded',
    cornerType: 'extra-rounded',
    logoId: 'amazon',
    logoSize: 0.37,
    logoMargin: 6,
  },
  {
    id: 'brand-netflix',
    name: 'Netflix Red Stream',
    brand: 'Netflix',
    description: 'Cinematic red on dark canvas with iconic N ribbon',
    fgColor: '#E50914',
    bgColor: '#ffffff',
    cornerColor: '#141414',
    cornerDotColor: '#E50914',
    dotType: 'square',
    cornerType: 'square',
    logoId: 'netflix',
    logoSize: 0.36,
    logoMargin: 6,
  },
  {
    id: 'brand-nike',
    name: 'Nike Just Do It',
    brand: 'Nike',
    description: 'Dynamic monochrome matrix with classic swoosh',
    fgColor: '#0f172a',
    bgColor: '#ffffff',
    cornerColor: '#0f172a',
    cornerDotColor: '#0f172a',
    dotType: 'classy',
    cornerType: 'extra-rounded',
    logoId: 'nike',
    logoSize: 0.36,
    logoMargin: 6,
  },
  {
    id: 'brand-mcdonalds',
    name: "McDonald's Arches",
    brand: "McDonald's",
    description: 'Golden yellow matrix with crimson eye accents',
    fgColor: '#DA291C',
    bgColor: '#ffffff',
    cornerColor: '#DA291C',
    cornerDotColor: '#FFC72C',
    dotType: 'rounded',
    cornerType: 'extra-rounded',
    logoId: 'mcdonalds',
    logoSize: 0.36,
    logoMargin: 6,
  },
  {
    id: 'brand-kfc',
    name: 'KFC Colonel Red',
    brand: 'KFC',
    description: 'Signature Crimson red, concentric eyes & Colonel badge',
    fgColor: '#e4002b',
    bgColor: '#ffffff',
    cornerColor: '#1e1e1e',
    cornerDotColor: '#e4002b',
    dotType: 'dots',
    cornerType: 'extra-rounded',
    logoId: 'kfc',
    logoSize: 0.38,
    logoMargin: 6,
  },
  {
    id: 'brand-starbucks',
    name: 'Starbucks Emerald',
    brand: 'Starbucks',
    description: 'Authentic Siren green & circular emblem',
    fgColor: '#00704a',
    bgColor: '#ffffff',
    cornerColor: '#00704a',
    cornerDotColor: '#00704a',
    dotType: 'rounded',
    cornerType: 'extra-rounded',
    logoId: 'starbucks',
    logoSize: 0.36,
    logoMargin: 6,
  },
  {
    id: 'brand-bmw',
    name: 'BMW Bavarian',
    brand: 'BMW',
    description: 'Midnight obsidian with Bavarian azure eyes',
    fgColor: '#0f172a',
    bgColor: '#ffffff',
    cornerColor: '#0f172a',
    cornerDotColor: '#0066b1',
    dotType: 'square',
    cornerType: 'extra-rounded',
    logoId: 'bmw',
    logoSize: 0.36,
    logoMargin: 6,
  },
  {
    id: 'brand-burger-king',
    name: 'Burger King Flame',
    brand: 'Burger King',
    description: 'Flame red & bun gold gradient with retro badge',
    fgColor: '#d62300',
    bgColor: '#fffdf5',
    cornerColor: '#d62300',
    cornerDotColor: '#f5a623',
    dotType: 'classy',
    cornerType: 'extra-rounded',
    logoId: 'burger-king',
    logoSize: 0.36,
    logoMargin: 6,
    gradientCss: 'linear-gradient(135deg, #f5a623 0%, #d62300 100%)',
    gradient: {
      type: 'linear',
      rotation: Math.PI / 4,
      colorStops: [
        { offset: 0, color: '#f5a623' },
        { offset: 1, color: '#d62300' },
      ],
    },
  },
  {
    id: 'brand-ups',
    name: 'UPS Gold Shield',
    brand: 'UPS',
    description: 'Amber-gold canvas with chocolate brown matrix',
    fgColor: '#351c15',
    bgColor: '#fff8eb',
    cornerColor: '#351c15',
    cornerDotColor: '#fbb03b',
    dotType: 'rounded',
    cornerType: 'extra-rounded',
    logoId: 'ups',
    logoSize: 0.38,
    logoMargin: 6,
  },
  {
    id: 'brand-x-twitter',
    name: 'X Stealth Monolith',
    brand: 'X / Twitter',
    description: 'Minimalist carbon black matrix with clean X core',
    fgColor: '#0f172a',
    bgColor: '#ffffff',
    cornerColor: '#0f172a',
    cornerDotColor: '#0f172a',
    dotType: 'square',
    cornerType: 'square',
    logoId: 'x-twitter',
    logoSize: 0.35,
    logoMargin: 6,
  },
  {
    id: 'brand-linkedin',
    name: 'LinkedIn Professional',
    brand: 'LinkedIn',
    description: 'Corporate sapphire blue with crisp white badge',
    fgColor: '#0A66C2',
    bgColor: '#ffffff',
    cornerColor: '#0A66C2',
    cornerDotColor: '#004182',
    dotType: 'rounded',
    cornerType: 'extra-rounded',
    logoId: 'linkedin',
    logoSize: 0.36,
    logoMargin: 6,
  },
  {
    id: 'brand-telegram',
    name: 'Telegram Sky',
    brand: 'Telegram',
    description: 'Vibrant sky cyan with supersonic airplane center',
    fgColor: '#24A1DE',
    bgColor: '#ffffff',
    cornerColor: '#1d82b4',
    cornerDotColor: '#24A1DE',
    dotType: 'dots',
    cornerType: 'dot',
    logoId: 'telegram',
    logoSize: 0.36,
    logoMargin: 6,
  },
  {
    id: 'brand-discord',
    name: 'Discord Blurple',
    brand: 'Discord',
    description: 'Gaming blurple matrix with friendly controller badge',
    fgColor: '#5865F2',
    bgColor: '#ffffff',
    cornerColor: '#4752C4',
    cornerDotColor: '#5865F2',
    dotType: 'classy',
    cornerType: 'extra-rounded',
    logoId: 'discord',
    logoSize: 0.36,
    logoMargin: 6,
  },
];
