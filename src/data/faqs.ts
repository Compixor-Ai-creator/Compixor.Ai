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
    a: 'Compixor operates directly on the PDF internal stream dictionary structure using native stream compression, metadata stripping, unreferenced object removal, and embedded raster photo optimization. Fonts, curves, vector text, and hyperlinks are never converted to raster images or blurry pixels.',
  },
  {
    q: 'Will my text still be selectable (Ctrl+F) and sharp?',
    a: 'Yes! All vector text, fonts, links, and form fields remain 100% vector without any rasterization. Text stays razor-sharp, searchable, and selectable at any zoom level across all compression tiers.',
  },
  {
    q: 'What happens if my PDF is already compressed?',
    a: 'Compixor includes an automated size inflation guard: if compressing a document would make it larger or equal (common with pure-text or already-compacted files), Compixor automatically preserves your original pristine file and notifies you: "This PDF is already highly compressed and cannot be reduced further."',
  },
  {
    q: 'Can I upload multiple PDFs at once?',
    a: 'Yes! You can upload up to 5 PDFs simultaneously. Each document displays its own live progress bar and individual download button, plus a one-click "Download All (ZIP)" button to export all compressed documents in a single bundle.',
  },
];

export const wordCompressorFaqs: FaqItem[] = [
  {
    q: 'How does DOCX compression work in the browser?',
    a: 'A .docx file is actually a zip archive containing XML structures and a media folder of embedded pictures. We unpack the archive in memory, re-encode embedded JPEG/PNG images with optimized compression, and re-pack the document with identical formatting.',
  },
  {
    q: 'Will my fonts, tables, margins, or formulas change?',
    a: 'Not at all. The underlying WordprocessingML document XML is untouched. Only the binary payload size of images inside the document is optimized.',
  },
  {
    q: 'What if my Word document has no images?',
    a: 'Documents consisting purely of text and tables are already tiny (usually under 50KB). The compression tool will re-archive the XML streams, but the most dramatic reductions (50–90%) happen when documents contain camera photos, screenshots, or pasted illustrations.',
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
    a: 'WhatsApp, Instagram, and Facebook mandate a strict 1:1 square ratio for profile pictures, and then display them inside a circular mask. If your photo is a portrait (tall) or landscape (wide), the app forces you to crop out friends, scenery, or your full outfit. Full DP Maker fits your whole photo inside a square and fills the empty margins with aesthetic blur, color, or gradient backgrounds.',
  },
  {
    q: 'Does the circular guide appear on the downloaded image?',
    a: 'No! The circular dashed guide is strictly a preview aid inside the tool to help you ensure faces and text stay safely inside the avatar boundary. The exported file is a clean, crisp square image.',
  },
  {
    q: 'What is the best background fill mode?',
    a: 'The "Blur" mode is the most popular choice used by influencers and creators: it scales your photo into the background with a soft Gaussian blur, making your profile picture feel expansive and natural. For clean minimal aesthetics, the "Color" (White or Black) and "Gradient" modes are also favorites.',
  },
  {
    q: 'Is my photo uploaded to any server?',
    a: 'Never. Compixor processes all image manipulations, Gaussian blurs, gradients, and exports 100% client-side in your web browser memory sandbox. Your personal photos never leave your device.',
  },
  {
    q: 'Can I paste an image directly from my clipboard?',
    a: 'Yes! Just take a screenshot or copy any image and press Ctrl+V (or Cmd+V on Mac) anywhere on this page to load it instantly.',
  },
];

export const qrGeneratorFaqs: FaqItem[] = [
  {
    q: 'Do the generated QR codes ever expire or require a subscription?',
    a: 'Never! Our QR codes are 100% static, client-side encoded, and permanent. They embed the direct target data without passing through any redirect servers.',
  },
  {
    q: 'How does logo embedding work?',
    a: 'When you upload a logo, it is drawn directly in the center of the QR matrix. We automatically configure high error correction (Level H) so the QR code scans reliably across all devices.',
  },
  {
    q: 'Which format should I download for printing?',
    a: 'For print materials (flyers, menus, business cards, billboards), choose vector SVG format because it scales infinitely without pixelation. For social media or websites, PNG is ideal.',
  },
  {
    q: 'Are Wi-Fi passwords or sensitive contact cards sent to any cloud server?',
    a: 'No. CompixorAi runs 100% locally in your browser memory. No data is stored, cached, or transmitted over the network.',
  },
];
