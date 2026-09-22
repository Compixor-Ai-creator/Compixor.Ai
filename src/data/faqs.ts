import { FaqItem } from '@/components/JsonLd';

export const homeFaqs: FaqItem[] = [
  {
    q: 'How does CompixorAi process files without uploading them?',
    a: 'We leverage modern browser capabilities including HTML5 Canvas, WebAssembly, and local JavaScript workers. Your device performs the computation directly on the raw file buffer.',
  },
  {
    q: 'Is there a limit on how many files I can process?',
    a: 'No! Because all processing happens on your local hardware, there are no artificial hourly limits, paywalls, or queue throttles.',
  },
  {
    q: 'Can I use this on corporate or sensitive business files?',
    a: 'Absolutely. Because files never leave your computer or transmit across the network, CompixorAi is compliant with strict enterprise confidentiality guidelines.',
  },
  {
    q: 'Are printable passport photos formatted correctly for retail printing?',
    a: 'Yes. Our 4x6" printable sheet is rendered at exact 300 DPI resolution, so you can order a standard 4x6" print at CVS, Walgreens, Boots, or Walmart for pennies.',
  },
];

export const pdfCompressorFaqs: FaqItem[] = [
  {
    q: 'How does the Native PDF optimizer preserve vector text?',
    a: "Compixor's PDF Compressor works directly with the PDF's internal content streams instead of converting pages into flattened images (rasterizing). It identifies and removes redundant object data, compresses embedded fonts and streams, and strips unused metadata — while leaving vector paths, text outlines, and form fields fully intact. This means your PDF stays crisp at any zoom level, unlike tools that shrink file size by turning pages into low-resolution images.",
  },
  {
    q: 'Will my text still be selectable (Ctrl+F) and sharp?',
    a: "Yes. Because compression happens at the stream level and not through rasterization, all text remains fully selectable, searchable (Ctrl+F), and copy-pasteable after compression. Fonts are optimized but never converted to images, so there's no blur or pixelation at any zoom level.",
  },
  {
    q: 'What happens if my PDF is already compressed?',
    a: "Compixor's Size Inflation Guard automatically detects when a PDF is already optimized. If running compression again would increase the file size (which can happen with some compression algorithms on already-dense files), the tool automatically returns your original file untouched — so you never end up with a larger file than you started with.",
  },
  {
    q: 'Can I upload multiple PDFs at once?',
    a: 'Yes. You can drop or select up to 5 PDF files at once (each up to 100MB). All files are compressed concurrently in your browser with live progress tracking, and you can download them individually or as a single ZIP archive — all without any file ever leaving your device.',
  },
];

export const wordCompressorFaqs: FaqItem[] = [
  {
    q: 'How does DOCX compression work in the browser?',
    a: "A .docx file is actually a ZIP archive containing XML files and embedded media (usually images). Compixor's Word Compressor unzips the document entirely inside your browser, finds embedded images, re-encodes them at an optimized quality/size ratio, repacks the XML structure efficiently, and rebuilds the .docx — all without uploading anything to a server.",
  },
  {
    q: 'Will my fonts, tables, margins, or formulas change?',
    a: "No. Compression only targets embedded images — fonts, tables, margins, headers/footers, styles, and any formulas or embedded objects (like Excel tables) are left completely untouched. Your document's structure and formatting remain identical; only the file size shrinks.",
  },
  {
    q: 'What if my Word document has no images?',
    a: "If your document contains no embedded images (or only vector-based content like WordArt or shapes), there's very little to compress — text and XML markup are already extremely lightweight. In this case, Compixor will return your file with minimal or no size change, since further compression would provide no real benefit.",
  },
];

export const addWatermarkFaqs: FaqItem[] = [
  {
    q: 'Does this tool upload my documents to any server?',
    a: 'No. Compixor runs 100% locally inside your web browser using WebAssembly and client-side JavaScript. Your files and watermarks never leave your computer or touch an external server.',
  },
  {
    q: 'Will adding a watermark flatten or rasterize my PDF text?',
    a: 'No! Unlike tools that convert entire pages into low-resolution JPEG images, Compixor injects native vector text layers and XObjects directly into the PDF content stream. The underlying text remains 100% crisp, vector-sharp, and selectable.',
  },
  {
    q: 'Can I customize font, opacity, and rotation of the watermark?',
    a: 'Yes. You can configure full opacity, angle of rotation, font sizes, custom hex colors, layer positioning (over or under existing text), and apply to single pages, custom ranges, or the entire document.',
  },
  {
    q: 'Are my watermark settings saved between browser sessions?',
    a: 'Yes. Your selected text, font, color, opacity, rotation, scale, and layout preferences are automatically saved in your browser’s localStorage.',
  },
];

export const removeWatermarkFaqs: FaqItem[] = [
  {
    q: 'How does lossless watermark removal work?',
    a: 'Watermarks created with Compixor are tagged with structured marked content (/Artifact /CompixorWatermark). When removing, our engine strips the dedicated watermark stream while leaving every original page content stream 100% byte-identical.',
  },
  {
    q: 'Can I remove watermarks from PDFs created by other software?',
    a: 'Yes. You can use our "Targeted Text Matcher" to strip matching text operators from the PDF stream, or the "Interactive Erase Box" tool to vector-redact watermark blocks with zero cloud uploads.',
  },
  {
    q: 'Is any login or account required to remove watermarks?',
    a: 'No signup, login, or software installation is required. Everything runs 100% free and client-side directly inside your browser.',
  },
  {
    q: 'What happens to scanned or flattened documents?',
    a: 'For scanned/flattened pages where the watermark is baked into image pixels, automatic stream removal is not possible, so an interactive redaction patch or OCR fallback should be used.',
  },
];

export const pdfOrganizerFaqs: FaqItem[] = [
  {
    q: 'Is there a limit on how many PDFs I can merge or split?',
    a: 'No! Because all processing takes place entirely on your device using client-side WebAssembly, there are no artificial file count limits, daily quotas, or paywalls. You can merge as many documents as your browser memory allows.',
  },
  {
    q: 'Are my confidential documents uploaded to any server?',
    a: 'Never. Unlike traditional online PDF tools that upload your files to remote cloud servers, Compixor executes 100% locally in your browser memory. Zero file data, metadata, or document contents ever leave your device.',
  },
  {
    q: 'How does the range input syntax work for splitting?',
    a: 'You can enter single pages or page ranges separated by commas, such as "1-3, 5, 8-10". Compixor automatically validates bounds, checks for reversed ranges (e.g. 10-5), removes duplicates, and visually highlights the matching pages on the interactive preview grid.',
  },
  {
    q: 'Can this tool process password-protected or encrypted PDFs?',
    a: 'For security and privacy reasons, standard password-protected PDFs must have their security encryption removed before merging or extracting pages. Compixor will immediately alert you if an uploaded PDF is password-encrypted.',
  },
];

export const passportPhotoFaqs: FaqItem[] = [
  {
    q: 'How does the remove.bg-grade background removal work?',
    a: 'We use the high-precision IS-Net neural matting model (IS-Net FP16) executing 100% client-side via WebAssembly & WebGPU. It features an intermediate canvas smoothing pipeline with alpha boundary choke (to eliminate outer fringing), 1.2px Gaussian edge feathering (to eradicate jagged contours and aliasing along hair and shoulders), and color de-spill to neutralize residual wall color halos.',
  },
  {
    q: 'Can I download just the transparent PNG cutout without any background?',
    a: 'Yes! Select the "Cutout" tab or the "Transparent (PNG Cutout)" swatch. Downloading the single photo will export a pure 32-bit transparent PNG with soft hair edges.',
  },
  {
    q: 'How does the printable sheet with cut marks work?',
    a: 'We generate an exact 300 DPI high-resolution sheet with standard ~1.5px border outlines and corner registration crop ticks extending outside each photo, so you can cleanly cut individual copies with scissors or a paper trimmer.',
  },
  {
    q: 'Is my portrait uploaded to any remote server?',
    a: 'Never. All AI portrait matting, face cropping, background filtering, outfit compositing, and file exports are executed 100% locally in your browser memory sandbox.',
  },
];

export const fullDpMakerFaqs: FaqItem[] = [
  {
    q: 'Why do WhatsApp and Instagram cut off my profile pictures?',
    a: "Phone cameras shoot photos in 3:4, 9:16, or 16:9 ratios, but WhatsApp, Instagram, Telegram, and Facebook all require a 1:1 square profile photo. When you upload a non-square photo directly through the app, it automatically crops the image to fit the square — which often cuts off faces, group members, or important parts of the shot. Full DP Maker fits your entire photo inside a square canvas first, so no cropping happens on the platform's end.",
  },
  {
    q: 'Does the circular guide appear on the downloaded image?',
    a: 'No. The dashed circle guide shown in the live preview is only a visual aid to help you position faces and important details within the area that will actually display as a circle on WhatsApp, Instagram, and other apps. It never appears in your final downloaded image — the exported file is always a clean square.',
  },
  {
    q: 'What is the best background fill mode?',
    a: 'It depends on your photo. Gaussian Blur works well for most photos since it extends the existing background naturally. Solid colors or gradients work best for portraits with simple or plain backgrounds, giving a clean, modern look. Mirror reflection works well for symmetrical or scenic shots where you want the fill to feel intentional rather than blurred. We recommend trying 2-3 modes in the live preview before downloading, since it only takes a second to switch.',
  },
  {
    q: 'Is my photo uploaded to any server?',
    a: "No. Full DP Maker runs entirely inside your browser using client-side image processing. Your photo is never uploaded, transmitted, or stored anywhere — it exists only in your device's memory while you're editing it, and is discarded the moment you close or refresh the tab.",
  },
  {
    q: 'Can I paste an image directly from my clipboard?',
    a: 'Yes. Press Ctrl+V (or Cmd+V on Mac) anywhere on the page after copying an image, and it will be loaded directly into the tool — no need to save the file first or use the file browser.',
  },
];

export const qrGeneratorFaqs: FaqItem[] = [
  {
    q: 'Do the generated QR codes ever expire or require a subscription?',
    a: 'No. Every QR code you create with Compixor is a static QR code — the data (URL, WiFi credentials, contact info, etc.) is encoded directly into the QR pattern itself, not linked to an external redirect service. This means it will scan correctly forever, with no subscription, no expiry date, and no risk of it stopping working if a service shuts down.',
  },
  {
    q: 'How does logo embedding work?',
    a: "When you upload a logo, Compixor automatically increases the QR code's error correction level (to High) before placing your logo in the center. QR codes are designed to remain scannable even with a portion of the pattern obscured — high error correction allows for a logo overlay without breaking the code's ability to be read by a scanner.",
  },
  {
    q: 'Which format should I download for printing?',
    a: "For printing, download the SVG (vector) format. SVGs scale to any size — from a business card to a large poster — without losing sharpness or becoming pixelated, since they're built from mathematical paths rather than a fixed pixel grid. Use PNG for digital use (websites, social media, presentations) where a vector format isn't needed.",
  },
  {
    q: 'Are Wi-Fi passwords or sensitive contact cards sent to any cloud server?',
    a: 'No. All QR code generation happens entirely in your browser. When you create a WiFi QR code or a vCard with contact details, that information is encoded directly into the QR pattern locally — it is never transmitted to, or stored on, any server. This is especially important for WiFi passwords, which many other QR generators process server-side.',
  },
];
