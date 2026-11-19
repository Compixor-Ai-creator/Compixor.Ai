import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument, StandardFonts, rgb, PDFName, PDFArray, PDFRef, PDFStream, PDFRawStream, degrees } from 'pdf-lib';
import {
  addTextWatermark,
  addImageWatermark,
  removeCompixorWatermarks,
  stripDigitalWatermarks,
  removeGenericTextWatermark,
  redactAreaOnPage,
  hexToRgb,
  parsePageRange,
  calculateTextPositions,
  RedactionBox,
} from './pdfWatermarkEngine';

// Helper to create a base PDF with original text and a table
async function createSamplePdf(): Promise<{ bytes: Uint8Array; originalContentBytes: Uint8Array }> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([600, 800]);
  const font = await doc.embedFont(StandardFonts.Helvetica);

  // Draw some original document text
  page.drawText('Confidential Invoice Report #99281', {
    x: 50,
    y: 750,
    size: 20,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });

  page.drawText('Item Description                Qty    Price    Total', {
    x: 50,
    y: 700,
    size: 12,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText('Cloud Infrastructure Tier A      1     $450     $450', {
    x: 50,
    y: 680,
    size: 11,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  page.drawText('Custom Security Hardening        2     $250     $500', {
    x: 50,
    y: 660,
    size: 11,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  const bytes = await doc.save();

  // Load saved document to capture committed original content stream bytes
  const doc2 = await PDFDocument.load(bytes);
  const page2 = doc2.getPage(0);
  const contents = page2.node.get(PDFName.of('Contents'));
  let originalContentBytes: Uint8Array = new Uint8Array();
  if (contents instanceof PDFArray && contents.size() > 0) {
    const ref = contents.get(0);
    if (ref instanceof PDFRef) {
      const s = doc2.context.lookup(ref);
      if (s instanceof PDFRawStream) {
        originalContentBytes = new Uint8Array(s.contents);
      } else if (s && 'contents' in s) {
        originalContentBytes = new Uint8Array((s as unknown as { contents: Uint8Array }).contents);
      }
    }
  } else if (contents instanceof PDFRef) {
    const s = doc2.context.lookup(contents);
    if (s instanceof PDFRawStream) {
      originalContentBytes = new Uint8Array(s.contents);
    } else if (s && 'contents' in s) {
      originalContentBytes = new Uint8Array((s as unknown as { contents: Uint8Array }).contents);
    }
  }

  return { bytes, originalContentBytes };
}

// 1x1 Transparent PNG byte array for testing image embedding
const TEST_PNG_BYTES = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
  0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
  0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
]);

test('1. Helper utilities: hexToRgb, parsePageRange, calculateTextPositions', () => {
  const red = hexToRgb('#ff0000');
  assert.equal(red.r, 1);
  assert.equal(red.g, 0);
  assert.equal(red.b, 0);

  const shortHex = hexToRgb('#0f0');
  assert.equal(shortHex.r, 0);
  assert.equal(shortHex.g, 1);
  assert.equal(shortHex.b, 0);

  // Page range tests
  assert.deepEqual(parsePageRange('all', 5), [0, 1, 2, 3, 4]);
  assert.deepEqual(parsePageRange('current', 5, 2), [2]);
  assert.deepEqual(parsePageRange('custom', 10, 0, '1, 3-5, 8'), [0, 2, 3, 4, 7]);

  // Positions
  const centerPositions = calculateTextPositions(600, 800, 100, 20, 'center-single', 0);
  assert.equal(centerPositions.length, 1);
  assert.equal(centerPositions[0].x, 250);
  assert.equal(centerPositions[0].y, 390);

  const cornerPositions = calculateTextPositions(600, 800, 100, 20, 'corners', 0);
  assert.equal(cornerPositions.length, 4);
});

test('2. Add Text Watermark: Watermark object is present after Add', async () => {
  const { bytes: samplePdf } = await createSamplePdf();

  const watermarkedPdf = await addTextWatermark(samplePdf, {
    text: 'CONFIDENTIAL DRAFT',
    fontFamily: 'Helvetica',
    fontStyle: 'bold',
    fontSize: 36,
    color: '#ef4444',
    opacity: 30,
    rotation: -45,
    layer: 'foreground',
    layout: 'diagonal-tiled',
    pageRange: 'all',
  });

  assert.ok(watermarkedPdf.length > samplePdf.length, 'Watermarked PDF should contain new stream bytes');

  // Verify watermark stream exists and is tagged
  const doc = await PDFDocument.load(watermarkedPdf);
  const page = doc.getPage(0);
  const contents = page.node.get(PDFName.of('Contents'));
  assert.ok(contents, 'Page should have Contents');

  let foundWatermark = false;
  if (contents instanceof PDFArray) {
    for (let i = 0; i < contents.size(); i++) {
      const ref = contents.get(i);
      if (ref instanceof PDFRef) {
        const stream = doc.context.lookup(ref);
        if (stream instanceof PDFRawStream || stream instanceof PDFStream) {
          if (stream.dict.get(PDFName.of('CompixorWatermark'))) {
            foundWatermark = true;
            break;
          }
        }
      }
    }
  }

  assert.equal(foundWatermark, true, 'Compixor watermark stream must be present in page Contents');
});

test('3. Remove Watermark: Watermark object is absent after Remove & Non-watermark content is byte-identical', async () => {
  const { bytes: samplePdf, originalContentBytes } = await createSamplePdf();

  // 1. Add watermark
  const watermarkedPdf = await addTextWatermark(samplePdf, {
    text: 'TEST WATERMARK',
    fontFamily: 'Helvetica',
    fontStyle: 'regular',
    fontSize: 40,
    color: '#3b82f6',
    opacity: 50,
    rotation: 0,
    layer: 'foreground',
    layout: 'center-single',
    pageRange: 'all',
  });

  // 2. Remove watermark
  const { pdfBytes: cleanedPdf, removedCount } = await removeCompixorWatermarks(watermarkedPdf);
  assert.equal(removedCount, 1, 'Exactly one watermark stream should be detected and removed');

  // 3. Verify watermark object is absent
  const cleanedDoc = await PDFDocument.load(cleanedPdf);
  const cleanedPage = cleanedDoc.getPage(0);
  const contents = cleanedPage.node.get(PDFName.of('Contents'));

  let foundWatermark = false;
  let remainingContentBytes: Uint8Array = new Uint8Array();

  if (contents instanceof PDFArray) {
    for (let i = 0; i < contents.size(); i++) {
      const ref = contents.get(i);
      if (ref instanceof PDFRef) {
        const stream = cleanedDoc.context.lookup(ref);
        if (stream instanceof PDFRawStream || stream instanceof PDFStream) {
          if (stream.dict.get(PDFName.of('CompixorWatermark'))) {
            foundWatermark = true;
          } else {
            // Original stream
            if (stream instanceof PDFRawStream) {
              remainingContentBytes = new Uint8Array(stream.contents);
            } else if ('contents' in stream) {
              remainingContentBytes = new Uint8Array((stream as unknown as { contents: Uint8Array }).contents);
            }
          }
        }
      }
    }
  } else if (contents instanceof PDFRef) {
    const stream = cleanedDoc.context.lookup(contents);
    if (stream instanceof PDFRawStream || stream instanceof PDFStream) {
      if (stream.dict.get(PDFName.of('CompixorWatermark'))) {
        foundWatermark = true;
      } else {
        if (stream instanceof PDFRawStream) {
          remainingContentBytes = new Uint8Array(stream.contents);
        } else if ('contents' in stream) {
          remainingContentBytes = new Uint8Array((stream as unknown as { contents: Uint8Array }).contents);
        }
      }
    }
  }

  assert.equal(foundWatermark, false, 'Watermark stream must be absent after Remove');

  // 4. Verify non-watermark original content is byte-identical!
  assert.ok(originalContentBytes.length > 0, 'Original content stream should not be empty');
  assert.deepEqual(
    remainingContentBytes,
    originalContentBytes,
    'Original non-watermark stream must be 100% byte-identical after add+remove round trip'
  );
});

test('4. Add and Remove Image Watermark: Embeds XObject and cleans up cleanly', async () => {
  const { bytes: samplePdf } = await createSamplePdf();

  const withImagePdf = await addImageWatermark(samplePdf, {
    imageData: TEST_PNG_BYTES,
    imageFormat: 'png',
    scale: 100,
    opacity: 50,
    rotation: 45,
    layer: 'foreground',
    layout: 'corners',
    pageRange: 'all',
  });

  const doc = await PDFDocument.load(withImagePdf);
  const page = doc.getPage(0);
  const resources = page.node.get(PDFName.of('Resources'));
  assert.ok(resources, 'Page must have Resources');

  const { pdfBytes: cleanedPdf, removedCount } = await removeCompixorWatermarks(withImagePdf);
  assert.equal(removedCount, 1, 'Should remove 1 image watermark layer');

  const cleanedDoc = await PDFDocument.load(cleanedPdf);
  const cleanedPage = cleanedDoc.getPage(0);
  const cleanedContents = cleanedPage.node.get(PDFName.of('Contents'));
  assert.ok(cleanedContents);
});

test('5. Generic Watermark Removal: search string in content stream and erase/redact area', async () => {
  const { bytes: samplePdf } = await createSamplePdf();

  // Test search string removal for "Confidential"
  const { pdfBytes: strippedPdf, matchesRemoved } = await removeGenericTextWatermark(
    samplePdf,
    'Confidential'
  );
  assert.ok(matchesRemoved > 0, 'Should find and remove matching text operator');

  // Test Area Redaction
  const redactedPdf = await redactAreaOnPage(samplePdf, 0, {
    x: 50,
    y: 650,
    width: 200,
    height: 50,
    color: '#ffffff',
  });

  assert.ok(redactedPdf.length > samplePdf.length, 'Redacted PDF should contain redaction vector stream');
});

test('6. Engine A: stripDigitalWatermarks removes digital watermark layers and stamp annotations', async () => {
  const { bytes: samplePdf } = await createSamplePdf();

  // Add a watermark
  const watermarkedPdf = await addTextWatermark(samplePdf, {
    text: 'CONFIDENTIAL DRAFT',
    fontFamily: 'Helvetica',
    fontStyle: 'bold',
    fontSize: 48,
    color: '#ef4444',
    opacity: 40,
    rotation: -45,
    layer: 'foreground',
    layout: 'center-single',
    pageRange: 'all',
  });

  // Strip using Engine A
  const { pdfBytes: strippedPdf, removedCount } = await stripDigitalWatermarks(watermarkedPdf);
  assert.ok(removedCount >= 1, 'Engine A should detect and strip watermark layer');

  const doc = await PDFDocument.load(strippedPdf);
  assert.equal(doc.getPageCount(), 1, 'Page count should remain intact');
});

test('7. Engine A: stripDigitalWatermarks removes transparent overlay Image XObjects with SMask', async () => {
  const { bytes: samplePdf } = await createSamplePdf();
  const doc = await PDFDocument.load(samplePdf);
  const page = doc.getPages()[0];

  // Embed 1x1 transparent PNG or image with SMask
  // 1x1 red PNG
  const pngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const imgBytes = Buffer.from(pngBase64, 'base64');
  const image = await doc.embedPng(imgBytes);

  // Add dedicated overlay stream drawing this image
  const { PDFName } = await import('pdf-lib');
  const stream = doc.context.stream(`q 842 0 0 595 0 0 cm /WatermarkImg Do Q`);
  const streamRef = doc.context.register(stream);

  page.node.addContentStream(streamRef);
  page.node.setXObject(PDFName.of('WatermarkImg'), image.ref);

  const testPdf = await doc.save();
  const { pdfBytes: cleanedPdf, removedCount } = await stripDigitalWatermarks(testPdf);

  assert.ok(removedCount >= 1, 'Should strip candidate watermark overlay stream and XObject');
  const cleanedDoc = await PDFDocument.load(cleanedPdf);
  assert.equal(cleanedDoc.getPageCount(), 1);
});

test('8. Mobile Fix (a & e): Rotated 90° and 270° PDF page handling with combined single cm matrix', async () => {
  const doc = await PDFDocument.create();
  const page90 = doc.addPage([600, 800]);
  page90.setRotation(degrees(90));

  const page270 = doc.addPage([600, 800]);
  page270.setRotation(degrees(270));

  const pdfBytes = await doc.save();

  const watermarkedBytes = await addTextWatermark(pdfBytes, {
    text: 'ROTATED TEST',
    fontFamily: 'Helvetica',
    fontStyle: 'bold',
    fontSize: 36,
    color: '#000000',
    opacity: 50,
    rotation: 0,
    layer: 'foreground',
    layout: 'center-single',
    pageRange: 'all',
  });

  const resDoc = await PDFDocument.load(watermarkedBytes);
  assert.equal(resDoc.getPageCount(), 2);

  // Check page 90 content stream has single combined cm matrix
  const p1 = resDoc.getPage(0);
  const contents1 = p1.node.get(PDFName.of('Contents'));
  assert.ok(contents1 instanceof PDFArray);
  // Last stream is our watermark stream
  const lastRef = contents1.get(contents1.size() - 1);
  const streamObj = resDoc.context.lookup(lastRef);
  const textStr = new TextDecoder().decode((streamObj as any).contents);
  // Verify it contains a single cm inside the placement
  const cmMatches = textStr.match(/cm\n/g);
  assert.equal(cmMatches?.length, 1, 'Should have exactly 1 combined cm matrix per watermark placement');
  assert.ok(textStr.includes('BT\n'), 'Should contain Begin Text');
  assert.ok(textStr.includes('ET\n'), 'Should contain End Text');
});

test('9. Mobile Fix (b): Scanned/full-page-image detection forces foreground layer', async () => {
  const doc = await PDFDocument.create();
  const page = doc.addPage([600, 800]);
  const img = await doc.embedPng(TEST_PNG_BYTES);
  page.drawImage(img, { x: 0, y: 0, width: 600, height: 800 });
  const scannedPdf = await doc.save();

  // User requests 'background' layer, but document is scanned
  const watermarkedBytes = await addTextWatermark(scannedPdf, {
    text: 'SCANNED OVERLAY',
    fontFamily: 'Helvetica',
    fontStyle: 'bold',
    fontSize: 40,
    color: '#ef4444',
    opacity: 30,
    rotation: -45,
    layer: 'background', // should be forced to foreground
    layout: 'center-single',
    pageRange: 'all',
  });

  const resDoc = await PDFDocument.load(watermarkedBytes);
  const p = resDoc.getPage(0);
  const contents = p.node.get(PDFName.of('Contents')) as PDFArray;
  assert.ok(contents.size() >= 2, 'Should wrap and place watermark on top of scanned layer');
  // Watermark is at the end of the content stream array (foreground)
  const lastRef = contents.get(contents.size() - 1);
  const streamObj = resDoc.context.lookup(lastRef);
  const textStr = new TextDecoder().decode((streamObj as any).contents);
  assert.ok(textStr.includes('CompixorWatermark'), 'Watermark stream is in foreground on top of scan');
});

test('10. Mobile Fix (a): Non-zero MediaBox/CropBox origin handling', async () => {
  const doc = await PDFDocument.create();
  const page = doc.addPage();
  page.setMediaBox(50, 100, 500, 700); // non-zero origin: x=50, y=100
  const pdfBytes = await doc.save();

  const watermarkedBytes = await addTextWatermark(pdfBytes, {
    text: 'OFFSET BOX',
    fontFamily: 'Helvetica',
    fontStyle: 'regular',
    fontSize: 32,
    color: '#2563eb',
    opacity: 50,
    rotation: 0,
    layer: 'foreground',
    layout: 'center-single',
    pageRange: 'all',
  });

  const resDoc = await PDFDocument.load(watermarkedBytes);
  const p = resDoc.getPage(0);
  const contents = p.node.get(PDFName.of('Contents')) as PDFArray;
  const lastRef = contents.get(contents.size() - 1);
  const streamObj = resDoc.context.lookup(lastRef);
  const textStr = new TextDecoder().decode((streamObj as any).contents);

  // Verify translation includes the 50pt X offset and 100pt Y offset
  const cmLine = textStr.match(/-?[\d.]+ -?[\d.]+ -?[\d.]+ -?[\d.]+ ([\d.]+) ([\d.]+) cm/);
  assert.ok(cmLine, 'Should find cm matrix with offsets');
  const finalX = parseFloat(cmLine[1]);
  const finalY = parseFloat(cmLine[2]);
  assert.ok(finalX >= 50, `Final X (${finalX}) should be >= MediaBox offset 50`);
  assert.ok(finalY >= 100, `Final Y (${finalY}) should be >= MediaBox offset 100`);
});

test('11. Mobile Fix (c): Smart quotes & Unicode punctuation encoded as WinAnsi hex bytes without mojibake', async () => {
  const { bytes: samplePdf } = await createSamplePdf();

  // Text typed on mobile with smart quotes, en-dash, and non-breaking space
  const mobileInputText = '“Compixor’s Draft” — 100% Verified\u00A0Doc';

  const watermarkedBytes = await addTextWatermark(samplePdf, {
    text: mobileInputText,
    fontFamily: 'Helvetica',
    fontStyle: 'bold',
    fontSize: 28,
    color: '#10b981',
    opacity: 50,
    rotation: -45,
    layer: 'foreground',
    layout: 'center-single',
    pageRange: 'all',
  });

  const resDoc = await PDFDocument.load(watermarkedBytes);
  const p = resDoc.getPage(0);
  const contents = p.node.get(PDFName.of('Contents')) as PDFArray;
  const lastRef = contents.get(contents.size() - 1);
  const streamObj = resDoc.context.lookup(lastRef);
  const textStr = new TextDecoder().decode((streamObj as any).contents);

  // Check for hex string format: <HEX...> Tj
  assert.ok(/<[0-9A-F]+> Tj/.test(textStr), 'Text should be encoded as WinAnsi hex literal <...> Tj');
  // Verify it does NOT contain raw unencoded multi-byte UTF-8 bytes like â€™
  assert.ok(!textStr.includes('â€™'), 'Should not contain mojibake');
});

test('12. Follow-up 1: Non-WinAnsi text ("اردو test", emoji, mixed) must not throw', async () => {
  const { bytes: samplePdf } = await createSamplePdf();

  // Test 1: Urdu text
  await assert.doesNotReject(async () => {
    await addTextWatermark(samplePdf, {
      text: 'اردو test',
      fontFamily: 'Helvetica',
      fontStyle: 'bold',
      fontSize: 24,
      color: '#dc2626',
      opacity: 40,
      rotation: 0,
      layer: 'foreground',
      layout: 'center-single',
      pageRange: 'all',
    });
  }, 'Should not throw on Urdu characters');

  // Test 2: Emoji
  await assert.doesNotReject(async () => {
    await addTextWatermark(samplePdf, {
      text: 'CONFIDENTIAL 🔥🚀',
      fontFamily: 'Helvetica',
      fontStyle: 'bold',
      fontSize: 24,
      color: '#dc2626',
      opacity: 40,
      rotation: 0,
      layer: 'foreground',
      layout: 'center-single',
      pageRange: 'all',
    });
  }, 'Should not throw on emojis');

  // Test 3: Mixed string
  const mixedResult = await addTextWatermark(samplePdf, {
    text: 'Report: اردو 2026 🔥!',
    fontFamily: 'Helvetica',
    fontStyle: 'bold',
    fontSize: 24,
    color: '#dc2626',
    opacity: 40,
    rotation: 0,
    layer: 'foreground',
    layout: 'center-single',
    pageRange: 'all',
  });

  const resDoc = await PDFDocument.load(mixedResult);
  assert.equal(resDoc.getPageCount(), 1);
});

test('13. Follow-up 2: Small logo keeps background layer vs full-page scan forced to foreground', async () => {
  // Case A: Small logo (50x50 on 600x800 page = ~0.5% coverage < 85%)
  const docLogo = await PDFDocument.create();
  const pageLogo = docLogo.addPage([600, 800]);
  const imgLogo = await docLogo.embedPng(TEST_PNG_BYTES);
  pageLogo.drawImage(imgLogo, { x: 50, y: 700, width: 50, height: 50 });
  const pdfLogoBytes = await docLogo.save();

  const watermarkLogoResult = await addTextWatermark(pdfLogoBytes, {
    text: 'BACKGROUND WATERMARK',
    fontFamily: 'Helvetica',
    fontStyle: 'bold',
    fontSize: 30,
    color: '#000000',
    opacity: 30,
    rotation: -45,
    layer: 'background',
    layout: 'center-single',
    pageRange: 'all',
  });

  const docLogoRes = await PDFDocument.load(watermarkLogoResult);
  const pLogo = docLogoRes.getPage(0);
  const contentsLogo = pLogo.node.get(PDFName.of('Contents')) as PDFArray;
  // Background layer should be at index 0 (not forced to foreground)
  const firstRef = contentsLogo.get(0);
  const firstStream = docLogoRes.context.lookup(firstRef);
  const firstStreamText = new TextDecoder().decode((firstStream as any).contents);
  assert.ok(
    firstStreamText.includes('CompixorWatermark'),
    'Small logo page must KEEP watermark in background layer (index 0)'
  );

  // Case B: Full-page scan (600x800 on 600x800 page = 100% coverage >= 85%)
  const docScan = await PDFDocument.create();
  const pageScan = docScan.addPage([600, 800]);
  const imgScan = await docScan.embedPng(TEST_PNG_BYTES);
  pageScan.drawImage(imgScan, { x: 0, y: 0, width: 600, height: 800 });
  const pdfScanBytes = await docScan.save();

  const watermarkScanResult = await addTextWatermark(pdfScanBytes, {
    text: 'SCANNED OVERLAY',
    fontFamily: 'Helvetica',
    fontStyle: 'bold',
    fontSize: 30,
    color: '#000000',
    opacity: 30,
    rotation: -45,
    layer: 'background',
    layout: 'center-single',
    pageRange: 'all',
  });

  const docScanRes = await PDFDocument.load(watermarkScanResult);
  const pScan = docScanRes.getPage(0);
  const contentsScan = pScan.node.get(PDFName.of('Contents')) as PDFArray;
  // Watermark must be forced to foreground (at end of contents array)
  const lastRef = contentsScan.get(contentsScan.size() - 1);
  const lastStream = docScanRes.context.lookup(lastRef);
  const lastStreamText = new TextDecoder().decode((lastStream as any).contents);
  assert.ok(
    lastStreamText.includes('CompixorWatermark'),
    'Full-page scan must be FORCED to foreground layer'
  );
});

test('14. Follow-up 3: Redact box on 90° rotated page covers known text exactly', async () => {
  const doc = await PDFDocument.create();
  const page = doc.addPage([600, 800]);
  const font = await doc.embedFont(StandardFonts.Helvetica);

  // Unrotated text at (x: 100, y: 700, width: 200, height: 30)
  page.drawText('CONFIDENTIAL TEXT', {
    x: 100,
    y: 700,
    size: 20,
    font,
  });

  // Rotate page 90 degrees clockwise
  page.setRotation(degrees(90));
  const pdfBytes = await doc.save();

  // In the rotated viewer (width=800, height=600):
  // The unrotated point (100, 700) rotates to:
  // visual X = y = 700
  // visual Y = 600 - (100 + 200) = 300
  // visual W = 30, visual H = 200
  const visualBox: RedactionBox = {
    x: 700,
    y: 300,
    width: 30,
    height: 200,
    color: '#ffffff',
  };

  const redactedPdfBytes = await redactAreaOnPage(pdfBytes, 0, visualBox);
  const resDoc = await PDFDocument.load(redactedPdfBytes);
  const p = resDoc.getPage(0);
  const contents = p.node.get(PDFName.of('Contents')) as PDFArray;
  const lastRef = contents.get(contents.size() - 1);
  const redactStream = resDoc.context.lookup(lastRef);
  const redactText = new TextDecoder().decode((redactStream as any).contents);

  // Verify the rectangle in PDF coordinates matches the unrotated text bounding box: 100 700 200 30 re
  assert.ok(
    redactText.includes('100.00 700.00 200.00 30.00 re'),
    `Expected redaction rectangle to cover 100 700 200 30, got: ${redactText}`
  );
});

test('15. 180° Rotation Test: Text watermark + Redact box handling', async () => {
  const doc = await PDFDocument.create();
  const page = doc.addPage([600, 800]);
  const font = await doc.embedFont(StandardFonts.Helvetica);

  // Unrotated text at (x: 100, y: 700, width: 200, height: 30)
  page.drawText('CONFIDENTIAL 180 TEXT', {
    x: 100,
    y: 700,
    size: 20,
    font,
  });

  page.setRotation(degrees(180));
  const pdfBytes = await doc.save();

  // 1. Text Watermark test on 180° page
  const watermarkedBytes = await addTextWatermark(pdfBytes, {
    text: 'WATERMARK 180',
    fontFamily: 'Helvetica',
    fontStyle: 'bold',
    fontSize: 32,
    color: '#000000',
    opacity: 50,
    rotation: 0,
    layer: 'foreground',
    layout: 'center-single',
    pageRange: 'all',
  });

  const wmDoc = await PDFDocument.load(watermarkedBytes);
  const wmPage = wmDoc.getPage(0);
  const wmContents = wmPage.node.get(PDFName.of('Contents')) as PDFArray;
  const wmLastRef = wmContents.get(wmContents.size() - 1);
  const wmStreamObj = wmDoc.context.lookup(wmLastRef);
  const wmTextStr = new TextDecoder().decode((wmStreamObj as any).contents);
  assert.ok(wmTextStr.includes('BT\n') && wmTextStr.includes('ET\n'));
  const cmCount = wmTextStr.match(/cm\n/g)?.length;
  assert.equal(cmCount, 1, 'Should have exactly 1 combined cm matrix for 180° placement');

  // 2. Redact box test on 180° rotated page
  // In 180° viewer (width=600, height=800):
  // visual X = 600 - (100 + 200) = 300
  // visual Y = 800 - (700 + 30) = 70
  // visual W = 200, visual H = 30
  const visualBox: RedactionBox = {
    x: 300,
    y: 70,
    width: 200,
    height: 30,
    color: '#ffffff',
  };

  const redactedPdfBytes = await redactAreaOnPage(pdfBytes, 0, visualBox);
  const redDoc = await PDFDocument.load(redactedPdfBytes);
  const redPage = redDoc.getPage(0);
  const redContents = redPage.node.get(PDFName.of('Contents')) as PDFArray;
  const redLastRef = redContents.get(redContents.size() - 1);
  const redStream = redDoc.context.lookup(redLastRef);
  const redText = new TextDecoder().decode((redStream as any).contents);

  // Expected unrotated rectangle in PDF coordinates: 100 700 200 30 re
  assert.ok(
    redText.includes('100.00 700.00 200.00 30.00 re'),
    `Expected 180° redaction rectangle to cover 100 700 200 30, got: ${redText}`
  );
});





