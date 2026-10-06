# Workspace Guidelines

## Project Architecture & Philosophy
- **Compixor Web App (`d:/vs code/compixor`):**
  - **Live Reference**: [https://compixor-ai.cloud](https://compixor-ai.cloud)
  - **100% Client-Side Processing**: All conversion, compression, and file processing tools MUST run entirely in the browser (RAM) using WebAssembly, Web Workers, and client-side JS/TS libraries (HTML5 Canvas, pdf-lib, etc.). No user file buffers may ever be uploaded to a backend or external server.
  - **Design System**: Clean, modern glassmorphism UI inspired by SlideSpeak and Microsoft Fluent Design. Features include subtle mesh glow orbs, topo background patterns, dark/light theme persistence (`compixor-theme`), responsive cards, and Lucide React icons.
  - **Core Tool Catalog**:
    - **PDF Tools**: PDF Compressor (`/tools/pdf-compressor`), PDF Merge & Split (`/tools/pdf-organizer`), Watermark Add/Remove (`/tools/add-watermark`, `/tools/remove-watermark`), AES-256 Protect/Unlock (`/tools/protect-pdf`, `/tools/unlock-pdf`), PDF to Word (`/tools/pdf-to-word`).
    - **Word Tools**: Word Compressor (`/tools/word-compressor` for embedded image downscaling), Image to Word Converter (`/tools/img-to-word` using Tesseract.js WebAssembly OCR — supports JPG/PNG/WEBP/BMP batch, 10+ languages, heading/list detection, DOCX output).
    - **Photo & Media Tools**: Biometric Passport Photo Maker (`/tools/passport-photo` at 300 DPI), WhatsApp Full DP Maker (`/tools/full-dp-maker`), Vector QR Code Generator (`/tools/qr-generator`).
  - **Zero Friction UX**: No sign-ups, no paywalls, zero watermarks, and zero artificial queue limits.
