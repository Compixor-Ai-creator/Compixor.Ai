export interface BiometricSpec {
  headHeightPercent: number; // Crown to chin % of photo height
  headWidthPercent: number;  // Head width % of photo width
  topMarginPercent: number;  // Top edge to crown %
  eyeLinePercent: number;    // Top edge to eye center %
  chinLinePercent: number;   // Top edge to chin %
  minHeadMm: number;         // Official min head height in mm
  maxHeadMm: number;         // Official max head height in mm
  specSummary: string;       // Summary for user guidance
}

export interface Preset {
  id: string;
  name: string;
  country: string;
  widthMm: number;
  heightMm: number;
  widthPx: number;
  heightPx: number;
  aspectRatio: number;
  defaultBgColor: string;
  allowedBgColors: string[];
  verified: boolean;
  description: string;
  flag: string;
  biometricSpec: BiometricSpec;
}

export const standardPresets: Preset[] = [
  {
    id: 'pakistan-passport',
    name: 'Pakistan Passport (DGIP, white background)',
    country: 'Pakistan',
    widthMm: 35,
    heightMm: 45,
    widthPx: 413,
    heightPx: 531,
    aspectRatio: 35 / 45,
    defaultBgColor: '#ffffff',
    allowedBgColors: ['#ffffff', '#f8fafc'],
    verified: false,
    description: '35 x 45 mm (DGIP white background for Pakistan Passport)',
    flag: '🇵🇰',
    biometricSpec: {
      headHeightPercent: 75,
      headWidthPercent: 62,
      topMarginPercent: 8,
      eyeLinePercent: 38,
      chinLinePercent: 83,
      minHeadMm: 32,
      maxHeadMm: 36,
      specSummary: 'Official DGIP photo guidelines • Requirements awaiting confirmation',
    },
  },
  {
    id: 'pakistan-cnic',
    name: 'Pakistan CNIC/NICOP (NADRA, light blue)',
    country: 'Pakistan',
    widthMm: 35,
    heightMm: 45,
    widthPx: 413,
    heightPx: 531,
    aspectRatio: 35 / 45,
    defaultBgColor: '#e0f2fe',
    allowedBgColors: ['#e0f2fe', '#438edb', '#ffffff'],
    verified: false,
    description: '35 x 45 mm (NADRA light blue background for CNIC / NICOP / Smart Card)',
    flag: '🇵🇰',
    biometricSpec: {
      headHeightPercent: 75,
      headWidthPercent: 62,
      topMarginPercent: 8,
      eyeLinePercent: 38,
      chinLinePercent: 83,
      minHeadMm: 32,
      maxHeadMm: 36,
      specSummary: 'Official NADRA guidelines • Requirements awaiting confirmation',
    },
  },
  {
    id: 'us-passport',
    name: 'US Passport / Visa / Green Card',
    country: 'United States',
    widthMm: 51,
    heightMm: 51,
    widthPx: 600,
    heightPx: 600,
    aspectRatio: 1,
    defaultBgColor: '#ffffff',
    allowedBgColors: ['#ffffff', '#f8fafc'],
    verified: true,
    description: '2 x 2 inches (51 x 51 mm) at 300 DPI, solid white background',
    flag: '🇺🇸',
    biometricSpec: {
      headHeightPercent: 58,
      headWidthPercent: 52,
      topMarginPercent: 12,
      eyeLinePercent: 42,
      chinLinePercent: 70,
      minHeadMm: 25,
      maxHeadMm: 35,
      specSummary: 'Head: 25–35 mm (50–69% photo height) • Eye level: 42% from top',
    },
  },
  {
    id: 'uk-eu-passport',
    name: 'UK / Schengen / EU Passport',
    country: 'United Kingdom & Europe',
    widthMm: 35,
    heightMm: 45,
    widthPx: 413,
    heightPx: 531,
    aspectRatio: 35 / 45,
    defaultBgColor: '#ffffff',
    allowedBgColors: ['#ffffff', '#f8fafc', '#f1f5f9'],
    verified: true,
    description: '35 x 45 mm standard ICAO 9303 format (Light gray or white)',
    flag: '🇪🇺',
    biometricSpec: {
      headHeightPercent: 74,
      headWidthPercent: 60,
      topMarginPercent: 9,
      eyeLinePercent: 39,
      chinLinePercent: 83,
      minHeadMm: 29,
      maxHeadMm: 34,
      specSummary: 'Head: 29–34 mm (65–76% photo height) • Eye level: 39% from top',
    },
  },
  {
    id: 'india-passport',
    name: 'India Passport / OCI / Visa',
    country: 'India',
    widthMm: 51,
    heightMm: 51,
    widthPx: 600,
    heightPx: 600,
    aspectRatio: 1,
    defaultBgColor: '#ffffff',
    allowedBgColors: ['#ffffff', '#f8fafc'],
    verified: true,
    description: '2 x 2 inches (51 x 51 mm) pure white background',
    flag: '🇮🇳',
    biometricSpec: {
      headHeightPercent: 70,
      headWidthPercent: 55,
      topMarginPercent: 10,
      eyeLinePercent: 40,
      chinLinePercent: 80,
      minHeadMm: 35,
      maxHeadMm: 40,
      specSummary: 'Head: 35–40 mm (70–80% photo height) • Eye level: 40% from top',
    },
  },
  {
    id: 'canada-passport',
    name: 'Canada Passport',
    country: 'Canada',
    widthMm: 50,
    heightMm: 70,
    widthPx: 590,
    heightPx: 826,
    aspectRatio: 50 / 70,
    defaultBgColor: '#ffffff',
    allowedBgColors: ['#ffffff', '#f8fafc', '#f1f5f9'],
    verified: true,
    description: '50 x 70 mm (2 x 2.75 inches) white or light gray background',
    flag: '🇨🇦',
    biometricSpec: {
      headHeightPercent: 48,
      headWidthPercent: 50,
      topMarginPercent: 15,
      eyeLinePercent: 38,
      chinLinePercent: 63,
      minHeadMm: 31,
      maxHeadMm: 36,
      specSummary: 'Head: 31–36 mm (44–51% photo height) • Eye level: 38% from top',
    },
  },
  {
    id: 'philippines-passport',
    name: 'Philippines Passport',
    country: 'Philippines',
    widthMm: 35,
    heightMm: 45,
    widthPx: 413,
    heightPx: 531,
    aspectRatio: 35 / 45,
    defaultBgColor: '#1d4ed8',
    allowedBgColors: ['#1d4ed8', '#438edb', '#ffffff'],
    verified: true,
    description: '35 x 45 mm (Royal blue background standard)',
    flag: '🇵🇭',
    biometricSpec: {
      headHeightPercent: 74,
      headWidthPercent: 60,
      topMarginPercent: 9,
      eyeLinePercent: 39,
      chinLinePercent: 83,
      minHeadMm: 30,
      maxHeadMm: 35,
      specSummary: 'Head: 30–35 mm (67–78% photo height) • Eye level: 39% from top',
    },
  },
  {
    id: 'china-passport',
    name: 'China Passport',
    country: 'China',
    widthMm: 33,
    heightMm: 48,
    widthPx: 390,
    heightPx: 567,
    aspectRatio: 33 / 48,
    defaultBgColor: '#ffffff',
    allowedBgColors: ['#ffffff', '#e0f2fe', '#438edb'],
    verified: true,
    description: '33 x 48 mm biometric specification (White or Blue)',
    flag: '🇨🇳',
    biometricSpec: {
      headHeightPercent: 65,
      headWidthPercent: 56,
      topMarginPercent: 10,
      eyeLinePercent: 39,
      chinLinePercent: 75,
      minHeadMm: 28,
      maxHeadMm: 33,
      specSummary: 'Head: 28–33 mm (58–68% photo height) • Eye level: 39% from top',
    },
  },
  {
    id: 'australia-passport',
    name: 'Australia Passport',
    country: 'Australia',
    widthMm: 35,
    heightMm: 45,
    widthPx: 413,
    heightPx: 531,
    aspectRatio: 35 / 45,
    defaultBgColor: '#ffffff',
    allowedBgColors: ['#ffffff', '#f1f5f9'],
    verified: true,
    description: '35 x 45 mm (Australian Passport Office light gray/white standard)',
    flag: '🇦🇺',
    biometricSpec: {
      headHeightPercent: 75,
      headWidthPercent: 60,
      topMarginPercent: 9,
      eyeLinePercent: 39,
      chinLinePercent: 84,
      minHeadMm: 32,
      maxHeadMm: 36,
      specSummary: 'Head: 32–36 mm (71–80% photo height) • Eye level: 39% from top',
    },
  },
  {
    id: 'uae-gulf-visa',
    name: 'UAE & Gulf Visa',
    country: 'United Arab Emirates',
    widthMm: 40,
    heightMm: 60,
    widthPx: 472,
    heightPx: 708,
    aspectRatio: 40 / 60,
    defaultBgColor: '#ffffff',
    allowedBgColors: ['#ffffff', '#f8fafc'],
    verified: true,
    description: '40 x 60 mm (White background GDRFA format)',
    flag: '🇦🇪',
    biometricSpec: {
      headHeightPercent: 68,
      headWidthPercent: 55,
      topMarginPercent: 12,
      eyeLinePercent: 40,
      chinLinePercent: 80,
      minHeadMm: 30,
      maxHeadMm: 38,
      specSummary: 'Head: 30–38 mm (60–70% photo height) • Eye level: 40% from top',
    },
  },
];

export interface ColorOption {
  label: string;
  value: string;
  previewClass?: string;
  isGradient?: boolean;
  from?: string;
  to?: string;
}

// Classical colors with Transparent swatch removed (duplicates Cutout tab)
export const classicalColors: ColorOption[] = [
  { label: 'White', value: '#FFFFFF', previewClass: 'bg-white border-zinc-300' },
  { label: 'Off-White', value: '#f8fafc', previewClass: 'bg-slate-50 border-slate-300' },
  { label: 'Light Blue', value: '#e0f2fe', previewClass: 'bg-sky-100 border-sky-300' },
  { label: 'Light Gray', value: '#f1f5f9', previewClass: 'bg-slate-100 border-slate-300' },
  { label: 'Sky Blue', value: '#438EDB', previewClass: 'bg-[#438EDB] border-sky-600' },
  { label: 'Royal Blue', value: '#1d4ed8', previewClass: 'bg-blue-700 border-blue-800' },
  { label: 'Navy', value: '#2A385B', previewClass: 'bg-[#2A385B] border-indigo-950' },
  { label: 'Cyan', value: '#00BFF2', previewClass: 'bg-[#00BFF2] border-cyan-500' },
  { label: 'Red', value: '#FF0000', previewClass: 'bg-[#FF0000] border-red-700' },
];

// Deduped stylish solids: Cobalt (vs Royal Blue), Aqua (vs Cyan), Crimson (vs Red), Pale Mint (vs Mint), Sand (vs Beige) removed
export const stylishSolids: ColorOption[] = [
  { label: 'Peach', value: '#F6BEB2', previewClass: 'bg-[#F6BEB2]' },
  { label: 'Mint', value: '#CCE2D6', previewClass: 'bg-[#CCE2D6]' },
  { label: 'Green', value: '#40896E', previewClass: 'bg-[#40896E]' },
  { label: 'Terracotta', value: '#D16541', previewClass: 'bg-[#D16541]' },
  { label: 'Blush', value: '#FCD9E0', previewClass: 'bg-[#FCD9E0]' },
  { label: 'Black', value: '#000000', previewClass: 'bg-black' },
  { label: 'Beige', value: '#DFCCB0', previewClass: 'bg-[#DFCCB0]' },
];

export const stylishGradients: ColorOption[] = [
  { label: 'Sky Gradient', value: 'gradient:#6FB9F2:#C1E3FA', isGradient: true, from: '#6FB9F2', to: '#C1E3FA' },
  { label: 'Silver Gradient', value: 'gradient:#A2A2A2:#F5F5F5', isGradient: true, from: '#A2A2A2', to: '#F5F5F5' },
  { label: 'Slate Gradient', value: 'gradient:#7E8597:#A3AABD', isGradient: true, from: '#7E8597', to: '#A3AABD' },
];

export interface CountryBiometricTolerance {
  id: string;
  country: string;
  isVerified: boolean;
  minHeadPercent: number | null;
  maxHeadPercent: number | null;
  minEyePercent: number | null;
  maxEyePercent: number | null;
  topMarginPercent: number | null; // TODO: Left as null/TODO unless explicitly mandated by official source URL
  sourceUrl: string;
  notes?: string;
}

export const BIOMETRIC_TOLERANCES: Record<string, CountryBiometricTolerance> = {
  'pakistan-passport': {
    id: 'pakistan-passport',
    country: 'Pakistan (DGIP)',
    isVerified: false, // TODO: Unconfirmed official spec until confirmed. Always show "Not verified", never a green tick.
    minHeadPercent: null, // TODO
    maxHeadPercent: null, // TODO
    minEyePercent: null,  // TODO
    maxEyePercent: null,  // TODO
    topMarginPercent: null, // TODO
    sourceUrl: 'https://onlinemrp.dgip.gov.pk/photo-requirements/', // source: https://onlinemrp.dgip.gov.pk/photo-requirements/
    notes: 'Official DGIP MRP requirements (exact head & eye dimensions awaiting confirmation)',
  },
  'pakistan-cnic': {
    id: 'pakistan-cnic',
    country: 'Pakistan (NADRA)',
    isVerified: false, // TODO: Unconfirmed official spec until confirmed. Always show "Not verified", never a green tick.
    minHeadPercent: null, // TODO
    maxHeadPercent: null, // TODO
    minEyePercent: null,  // TODO
    maxEyePercent: null,  // TODO
    topMarginPercent: null, // TODO
    sourceUrl: 'https://id.nadra.gov.pk/photograph-guideline/', // source: https://id.nadra.gov.pk/photograph-guideline/
    notes: 'Official NADRA guidelines (exact head & eye dimensions awaiting confirmation)',
  },
  'us-passport': {
    id: 'us-passport',
    country: 'United States',
    isVerified: true,
    minHeadPercent: 50.0, // 1 inch of 2 inches (50.0%)
    maxHeadPercent: 68.75, // 1 3/8 inches of 2 inches (68.75%)
    minEyePercent: 31.25, // 1 3/8" from bottom = 31.25% from top
    maxEyePercent: 43.75, // 1 1/8" from bottom = 43.75% from top
    topMarginPercent: null, // TODO: US State Dept explicitly specifies Head (1" to 1 3/8") and Eye height from bottom (1 1/8" to 1 3/8"), but does not dictate a statutory standalone top margin.
    sourceUrl: 'https://travel.state.gov/content/travel/en/passports/how-apply/photos.html', // source: https://travel.state.gov/content/travel/en/passports/how-apply/photos.html
    notes: 'Official US Dept of State: Head must be 1" to 1 3/8" (50% to 68.75%), eye line 1 1/8" to 1 3/8" from bottom of photo',
  },
  'uk-eu-passport': {
    id: 'uk-eu-passport',
    country: 'United Kingdom & Europe',
    isVerified: true,
    minHeadPercent: 64.4, // 29mm of 45mm (64.4%)
    maxHeadPercent: 75.6, // 34mm of 45mm (75.6%)
    minEyePercent: null, // TODO: HM Passport Office specifies head height 29-34mm; eye level is recommended centered but no numeric percentage is statutorily mandated.
    maxEyePercent: null, // TODO
    topMarginPercent: null, // TODO: HM Passport Office mandates head height 29-34mm, but does not define an isolated statutory top margin.
    sourceUrl: 'https://www.gov.uk/photos-for-passports/rules-for-digital-photos', // source: https://www.gov.uk/photos-for-passports/rules-for-digital-photos
    notes: 'Official HM Passport Office: Head height (crown to chin) must be between 29mm and 34mm',
  },
  'india-passport': {
    id: 'india-passport',
    country: 'India',
    isVerified: true,
    minHeadPercent: 68.6, // 35mm of 51mm (68.6%)
    maxHeadPercent: 78.4, // 40mm of 51mm (78.4%)
    minEyePercent: null, // TODO
    maxEyePercent: null, // TODO
    topMarginPercent: null, // TODO
    sourceUrl: 'https://passportindia.gov.in/AppOnlineProject/online/photoSpec', // source: https://passportindia.gov.in/AppOnlineProject/online/photoSpec
    notes: 'Passport Seva: Head height between 35mm and 40mm of 51mm photo',
  },
  'canada-passport': {
    id: 'canada-passport',
    country: 'Canada',
    isVerified: true,
    minHeadPercent: 44.3, // 31mm of 70mm (44.3%)
    maxHeadPercent: 51.4, // 36mm of 70mm (51.4%)
    minEyePercent: null, // TODO
    maxEyePercent: null, // TODO
    topMarginPercent: null, // TODO
    sourceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-passports/photos.html', // source: https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-passports/photos.html
    notes: 'Government of Canada: Head height (chin to crown) must be between 31mm and 36mm',
  },
  'philippines-passport': {
    id: 'philippines-passport',
    country: 'Philippines',
    isVerified: true,
    minHeadPercent: 66.7, // 30mm of 45mm (66.7%)
    maxHeadPercent: 77.8, // 35mm of 45mm (77.8%)
    minEyePercent: null, // TODO
    maxEyePercent: null, // TODO
    topMarginPercent: null, // TODO
    sourceUrl: 'https://consular.dfa.gov.ph/passport-photo-requirements', // source: https://consular.dfa.gov.ph/passport-photo-requirements
    notes: 'DFA: Head height between 30mm and 35mm of 45mm photo',
  },
  'china-passport': {
    id: 'china-passport',
    country: 'China',
    isVerified: true,
    minHeadPercent: 58.3, // 28mm of 48mm (58.3%)
    maxHeadPercent: 68.8, // 33mm of 48mm (68.8%)
    minEyePercent: null, // TODO
    maxEyePercent: null, // TODO
    topMarginPercent: null, // TODO
    sourceUrl: 'https://www.fmprc.gov.cn/chn/gxh/tyb/zxfw/t896898.htm', // source: https://www.fmprc.gov.cn/chn/gxh/tyb/zxfw/t896898.htm
    notes: 'Ministry of Foreign Affairs: Head height between 28mm and 33mm of 48mm photo',
  },
  'australia-passport': {
    id: 'australia-passport',
    country: 'Australia',
    isVerified: true,
    minHeadPercent: 71.1, // 32mm of 45mm (71.1%)
    maxHeadPercent: 80.0, // 36mm of 45mm (80.0%)
    minEyePercent: null, // TODO
    maxEyePercent: null, // TODO
    topMarginPercent: null, // TODO
    sourceUrl: 'https://www.passports.gov.au/protecting-your-identity-and-reporting/passport-photo-guidelines', // source: https://www.passports.gov.au/protecting-your-identity-and-reporting/passport-photo-guidelines
    notes: 'Australian Passport Office: Head height 32mm to 36mm of 45mm photo',
  },
};
