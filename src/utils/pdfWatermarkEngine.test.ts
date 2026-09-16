import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument, StandardFonts, rgb, PDFName, PDFArray, PDFRef, PDFStream, PDFRawStream } from 'pdf-lib';
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


