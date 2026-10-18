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

// 1. Google 4-Color "G"
const googleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <circle cx="24" cy="24" r="23" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
  <path fill="#4285F4" d="M35.6 24.3c0-.8-.1-1.6-.2-2.3H24v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7v3.1h3.9c2.3-2.1 3.6-5.2 3.6-9.1z"/>
  <path fill="#34A853" d="M24 36c3.3 0 6.1-1.1 8.1-3l-3.9-3.1c-1.1.7-2.5 1.2-4.2 1.2-3.2 0-6-2.2-7-5.1H9v3.2C11 33.2 17.1 36 24 36z"/>
  <path fill="#FBBC05" d="M17 26c-.3-.8-.4-1.7-.4-2.6 0-.9.1-1.8.4-2.6v-3.2H9C8.3 19 8 20.5 8 22s.3 3 1 4.4l8-3.4z"/>
  <path fill="#EA4335" d="M24 16c1.8 0 3.4.6 4.7 1.8l3.5-3.5C30.1 12.3 27.3 11 24 11c-6.9 0-13 3.8-15 9.4l8 3.4c1-2.9 3.8-4.8 7-4.8z"/>
</svg>`;

// 2. Starbucks Siren Green Badge
const starbucksSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <circle cx="24" cy="24" r="23" fill="#00704a" stroke="#ffffff" stroke-width="2"/>
  <circle cx="24" cy="24" r="16.5" fill="none" stroke="#ffffff" stroke-width="1.2"/>
  <path d="M24 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-2.8 0-5 2.2-5 5v3c0 2 2.2 4 5 4s5-2 5-4v-3c0-2.8-2.2-5-5-5z" fill="#ffffff"/>
  <path d="M19 28c-1.5 1.5-3 4-3 7h16c0-3-1.5-5.5-3-7-1.5 1-3.2 1.5-5 1.5s-3.5-.5-5-1.5z" fill="#ffffff"/>
  <circle cx="16" cy="19" r="1.5" fill="#ffffff"/>
  <circle cx="32" cy="19" r="1.5" fill="#ffffff"/>
</svg>`;

// 3. KFC Colonel Sanders Badge
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

// 4. BMW Bavarian Roundel
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

// 5. UPS Shield Gold & Brown
const upsSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <path d="M24 4 C34 4 40 8 40 18 C40 32 29 42 24 44 C19 42 8 32 8 18 C8 8 14 4 24 4 Z" fill="#fbb03b" stroke="#ffffff" stroke-width="2"/>
  <path d="M24 7 C31 7 36 10 36 18 C36 29 27 37 24 39 C21 37 12 29 12 18 C12 10 17 7 24 7 Z" fill="#351c15"/>
  <text x="24" y="26" font-family="Impact, Arial Black, sans-serif" font-weight="bold" font-size="11" fill="#fbb03b" text-anchor="middle" letter-spacing="-0.5">ups</text>
</svg>`;

// 6. Burger King Retro Bun
const burgerKingSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <circle cx="24" cy="24" r="23" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
  <!-- Top Bun -->
  <path d="M12 20 C12 13 17 10 24 10 C31 10 36 13 36 20 Z" fill="#f5a623"/>
  <!-- Bottom Bun -->
  <path d="M12 28 C12 35 17 38 24 38 C31 38 36 35 36 28 Z" fill="#f5a623"/>
  <!-- Middle Burger Patty / Text Banner -->
  <rect x="9" y="21" width="30" height="6" rx="2" fill="#d62300"/>
  <text x="24" y="25.5" font-family="Arial Black, Impact, sans-serif" font-size="4" font-weight="900" fill="#ffffff" text-anchor="middle">BURGER</text>
</svg>`;

// 7. WhatsApp Messenger
const whatsappSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <circle cx="24" cy="24" r="23" fill="#25D366" stroke="#ffffff" stroke-width="2"/>
  <path d="M34 14.5c-2.6-2.6-6.1-4-9.8-4-7.7 0-13.9 6.2-13.9 13.9 0 2.5.6 4.9 1.9 7l-2 7.3 7.5-2c2 1.1 4.3 1.7 6.6 1.7 7.7 0 13.9-6.2 13.9-13.9 0-3.7-1.4-7.2-4.2-10z" fill="#ffffff"/>
  <path d="M30.4 27.6c-.4-.2-2.3-1.1-2.6-1.3-.4-.1-.6-.2-.9.2-.3.4-1 1.3-1.3 1.5-.2.3-.5.3-.9.1-.4-.2-1.7-.6-3.2-2-1.2-1.1-2-2.4-2.2-2.8-.2-.4 0-.6.2-.8.2-.2.4-.5.6-.7.2-.2.3-.4.4-.6.1-.2.1-.5 0-.7-.1-.2-.9-2.1-1.2-2.9-.3-.8-.7-.7-.9-.7h-.8c-.3 0-.7.1-1.1.5-.4.4-1.5 1.5-1.5 3.6 0 2.1 1.5 4.2 1.7 4.5.3.3 3 4.6 7.3 6.4 1 .4 1.8.7 2.5.9.8.3 1.6.2 2.2.1.7-.1 2.3-.9 2.6-1.8.3-.9.3-1.7.2-1.8-.1-.3-.4-.4-.8-.6z" fill="#25D366"/>
</svg>`;

// 8. Instagram Sunset Camera
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

// 9. YouTube Play Button
const youtubeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <circle cx="24" cy="24" r="23" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
  <rect x="8" y="14" width="32" height="20" rx="6" fill="#FF0000"/>
  <polygon points="21,19 29,24 21,29" fill="#ffffff"/>
</svg>`;

// 10. Spotify Soundwaves
const spotifySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <circle cx="24" cy="24" r="23" fill="#1DB954" stroke="#ffffff" stroke-width="2"/>
  <path d="M33 21c-4.5-2.7-12-3-16.3-1.7-.7.2-1.4-.2-1.6-.9-.2-.7.2-1.4.9-1.6 5-1.5 13.2-1.2 18.4 1.9.6.4.8 1.2.5 1.8-.4.7-1.2.9-1.9.5zm-.5 5.5c-.4.6-1.2.8-1.8.4-3.7-2.3-9.4-3-13.8-1.6-.7.2-1.4-.2-1.6-.8-.2-.7.2-1.4.8-1.6 5.1-1.5 11.4-.8 15.8 1.8.6.4.8 1.2.6 1.8zm-1.8 5.4c-.3.5-.9.7-1.5.3-3.2-2-7.3-2.4-12.1-1.3-.6.1-1.1-.3-1.2-.8-.1-.6.3-1.1.8-1.2 5.3-1.2 9.8-.7 13.5 1.5.6.3.7.9.5 1.5z" fill="#ffffff"/>
</svg>`;

// 11. X (formerly Twitter)
const xTwitterSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <circle cx="24" cy="24" r="23" fill="#0f172a" stroke="#ffffff" stroke-width="2"/>
  <path d="M28.4 13h3.5l-7.7 8.8 9.1 12.2h-7l-5.5-7.2-6.3 7.2H11l8.3-9.5L10.5 13h7.2l5 6.6L28.4 13zm-1.2 18.9h1.9L17.2 15h-2.1l12.1 16.9z" fill="#ffffff"/>
</svg>`;

// 12. LinkedIn
const linkedinSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <rect x="2" y="2" width="44" height="44" rx="10" fill="#0A66C2" stroke="#ffffff" stroke-width="2"/>
  <path d="M15.5 19h-5v16h5V19zM13 11.5c-1.6 0-2.8 1.2-2.8 2.7s1.2 2.7 2.8 2.7 2.8-1.2 2.8-2.7-1.2-2.7-2.8-2.7zM37.5 25.5c0-4.7-2.5-6.9-5.9-6.9-2.7 0-3.9 1.5-4.6 2.6V19h-5c.1 1.4 0 16 0 16h5v-8.9c0-.5 0-.9.2-1.3.4-1 .9-2 2.5-2 1.8 0 2.5 1.3 2.5 3.3V35h5.3v-9.5z" fill="#ffffff"/>
</svg>`;

// 13. Wi-Fi Badge
const wifiSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <circle cx="24" cy="24" r="23" fill="#2563eb" stroke="#ffffff" stroke-width="2"/>
  <path d="M13 17c6.1-5.3 15.9-5.3 22 0M16.5 21.5c4.1-3.6 10.9-3.6 15 0M20.5 26c1.9-1.7 5.1-1.7 7 0" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="24" cy="32" r="2.5" fill="#ffffff"/>
</svg>`;

// 14. Global Web / Link Badge
const webLinkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
  <circle cx="24" cy="24" r="23" fill="#0284c7" stroke="#ffffff" stroke-width="2"/>
  <circle cx="24" cy="24" r="14" fill="none" stroke="#ffffff" stroke-width="2"/>
  <line x1="10" y1="24" x2="38" y2="24" stroke="#ffffff" stroke-width="2"/>
  <path d="M24 10 C29 15 31 20 31 24 C31 28 29 33 24 38 C19 33 17 28 17 24 C17 20 19 15 24 10 Z" fill="none" stroke="#ffffff" stroke-width="2"/>
</svg>`;

export const brandLogos: BrandLogoItem[] = [
  { id: 'google', name: 'Google', category: 'corporate', bgColor: '#4285F4', fgColor: '#ffffff', svgDataUri: toDataUri(googleSvg) },
  { id: 'kfc', name: 'KFC', category: 'iconic', bgColor: '#e4002b', fgColor: '#ffffff', svgDataUri: toDataUri(kfcSvg) },
  { id: 'starbucks', name: 'Starbucks', category: 'iconic', bgColor: '#00704a', fgColor: '#ffffff', svgDataUri: toDataUri(starbucksSvg) },
  { id: 'bmw', name: 'BMW', category: 'iconic', bgColor: '#0f172a', fgColor: '#0066b1', svgDataUri: toDataUri(bmwSvg) },
  { id: 'ups', name: 'UPS', category: 'iconic', bgColor: '#fbb03b', fgColor: '#351c15', svgDataUri: toDataUri(upsSvg) },
  { id: 'burger-king', name: 'Burger King', category: 'iconic', bgColor: '#f5a623', fgColor: '#d62300', svgDataUri: toDataUri(burgerKingSvg) },
  { id: 'whatsapp', name: 'WhatsApp', category: 'social', bgColor: '#25D366', fgColor: '#ffffff', svgDataUri: toDataUri(whatsappSvg) },
  { id: 'instagram', name: 'Instagram', category: 'social', bgColor: '#fd1d1d', fgColor: '#ffffff', svgDataUri: toDataUri(instagramSvg) },
  { id: 'youtube', name: 'YouTube', category: 'social', bgColor: '#FF0000', fgColor: '#ffffff', svgDataUri: toDataUri(youtubeSvg) },
  { id: 'spotify', name: 'Spotify', category: 'social', bgColor: '#1DB954', fgColor: '#ffffff', svgDataUri: toDataUri(spotifySvg) },
  { id: 'x-twitter', name: 'X / Twitter', category: 'social', bgColor: '#0f172a', fgColor: '#ffffff', svgDataUri: toDataUri(xTwitterSvg) },
  { id: 'linkedin', name: 'LinkedIn', category: 'social', bgColor: '#0A66C2', fgColor: '#ffffff', svgDataUri: toDataUri(linkedinSvg) },
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
    id: 'brand-google',
    name: 'Google Spectrum',
    brand: 'Google',
    description: '4-Color Google gradient & center G emblem',
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
];
