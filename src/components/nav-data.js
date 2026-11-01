export const NAV_GROUPS = [
  {
    id: "pdf",
    label: "PDF Tools",
    icon: "Files",
    items: [
      { label: "PDF Compressor", href: "/tools/pdf-compressor", desc: "Reduce PDF size, no uploads", icon: "FileDown" },
      { label: "PDF Merge & Split", href: "/tools/pdf-organizer", desc: "Combine or split pages", icon: "Combine" },
      { label: "Add Watermark", href: "/tools/add-watermark", desc: "Text or image watermark", icon: "Stamp" },
      { label: "Remove Watermark", href: "/tools/remove-watermark", desc: "Clean watermarks", icon: "Eraser" },
      { label: "Protect PDF", href: "/tools/protect-pdf", desc: "AES-256 password", icon: "Lock" },
      { label: "Unlock PDF", href: "/tools/unlock-pdf", desc: "Remove PDF password", icon: "Unlock" },
    ],
  },
  {
    id: "word",
    label: "Word Tools",
    icon: "FileText",
    items: [
      { label: "PDF to Word", href: "/tools/pdf-to-word", desc: "Convert PDF to DOCX", icon: "FileType" },
      { label: "Image to Word", href: "/tools/img-to-word", desc: "OCR image to DOCX", icon: "ImageIcon" },
      { label: "Word Compressor", href: "/tools/word-compressor", desc: "Shrink DOCX files", icon: "FileDown" },
    ],
  },
];

export const NAV_LINKS = [
  { label: "Passport Photo Maker", href: "/tools/passport-photo", icon: "Camera" },
  { label: "Full DP Maker", href: "/tools/full-dp-maker", icon: "Maximize2" },
  { label: "QR Generator", href: "/tools/qr-generator", icon: "QrCode" },
  { label: "Blogs & Guides", href: "/blog", icon: "BookOpen" },
  { label: "About", href: "/about", icon: "Info" },
];
