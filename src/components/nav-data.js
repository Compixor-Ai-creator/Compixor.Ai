export const NAV_GROUPS = [
  {
    id: "pdf",
    label: "PDF Tools",
    items: [
      { label: "PDF Compressor", href: "/tools/pdf-compressor", desc: "Reduce PDF size, no uploads" },
      { label: "PDF Merge & Split", href: "/tools/pdf-organizer", desc: "Combine or split pages" },
      { label: "Add Watermark", href: "/tools/add-watermark", desc: "Text or image watermark" },
      { label: "Remove Watermark", href: "/tools/remove-watermark", desc: "Clean watermarks" },
      { label: "Protect PDF", href: "/tools/protect-pdf", desc: "AES-256 password" },
      { label: "Unlock PDF", href: "/tools/unlock-pdf", desc: "Remove PDF password" },
    ],
  },
  {
    id: "word",
    label: "Word Tools",
    items: [
      { label: "PDF to Word", href: "/tools/pdf-to-word", desc: "Convert PDF to DOCX" },
      { label: "Image to Word", href: "/tools/img-to-word", desc: "OCR image to DOCX" },
      { label: "Word Compressor", href: "/tools/word-compressor", desc: "Shrink DOCX files" },
    ],
  },
];

export const NAV_LINKS = [
  { label: "Passport Photo Maker", href: "/tools/passport-photo" },
  { label: "Full DP Maker", href: "/tools/full-dp-maker" },
  { label: "QR Generator", href: "/tools/qr-generator" },
  { label: "Blogs & Guides", href: "/blog" },
  { label: "About", href: "/about" },
];
