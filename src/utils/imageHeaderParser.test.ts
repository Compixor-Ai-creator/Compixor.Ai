import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseImageHeaderDimensions,
  PASSPORT_UPLOAD_CONFIG,
} from './imageHeaderParser';

test('Passport Image Upload Pipeline & Pre-decode Validation', async (t) => {
  await t.test('1. MAX_FILE_MB is 15 MB and MAX_MEGAPIXELS is 100 MP', () => {
    assert.equal(PASSPORT_UPLOAD_CONFIG.MAX_FILE_MB, 15);
    assert.equal(PASSPORT_UPLOAD_CONFIG.MAX_MEGAPIXELS, 100);
  });

  await t.test('2. JPEG header dimensions parser extracts correct width and height', async () => {
    // Construct minimal valid JPEG with SOF0 marker (0xFF, 0xC0)
    // 0xFF 0xD8 (SOI), 0xFF 0xC0 (SOF0), length 17 bytes, precision 8, height 600, width 800, 3 components
    const jpegBytes = new Uint8Array([
      0xff, 0xd8, // SOI
      0xff, 0xc0, // SOF0
      0x00, 0x11, // length = 17
      0x08,       // precision = 8
      0x02, 0x58, // height = 600
      0x03, 0x20, // width = 800
      0x03,       // components = 3
      0x01, 0x11, 0x00, 0x02, 0x11, 0x00, 0x03, 0x11, 0x00,
      0xff, 0xd9, // EOI
    ]);

    const fakeFile = new File([jpegBytes], 'test.jpg', { type: 'image/jpeg' });
    const dims = await parseImageHeaderDimensions(fakeFile);
    assert.ok(dims);
    assert.equal(dims.width, 800);
    assert.equal(dims.height, 600);
  });

  await t.test('3. PNG header dimensions parser extracts correct width and height', async () => {
    // Construct minimal PNG IHDR chunk
    // Signature: 89 50 4E 47 0D 0A 1A 0A
    // Chunk length: 00 00 00 0D (13)
    // Type: 49 48 44 52 (IHDR)
    // Width: 00 00 04 00 (1024)
    // Height: 00 00 03 00 (768)
    const pngBytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x04, 0x00, // 1024
      0x00, 0x00, 0x03, 0x00, // 768
      0x08, 0x06, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, // CRC
    ]);

    const fakeFile = new File([pngBytes], 'test.png', { type: 'image/png' });
    const dims = await parseImageHeaderDimensions(fakeFile);
    assert.ok(dims);
    assert.equal(dims.width, 1024);
    assert.equal(dims.height, 768);
  });

  await t.test('4. Large image over 100 Megapixels is identified', async () => {
    // Dimensions 12000 x 9000 = 108 Megapixels (> 100 MP limit)
    const pngBytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x2e, 0xe0, // 12000
      0x00, 0x00, 0x23, 0x28, // 9000
      0x08, 0x06, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
    ]);

    const fakeFile = new File([pngBytes], 'huge.png', { type: 'image/png' });
    const dims = await parseImageHeaderDimensions(fakeFile);
    assert.ok(dims);
    const mp = (dims.width * dims.height) / 1_000_000;
    assert.equal(mp, 108);
    assert.ok(mp > PASSPORT_UPLOAD_CONFIG.MAX_MEGAPIXELS);
  });

  await t.test('5. Non-image or corrupted bytes fail safely without throwing', async () => {
    const corruptFile = new File([new Uint8Array([1, 2, 3, 4, 5])], 'corrupt.jpg', { type: 'image/jpeg' });
    const dims = await parseImageHeaderDimensions(corruptFile);
    assert.equal(dims, null);
  });
});
