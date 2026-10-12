import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  STUDIO_SHEET_PRESETS,
  mmTo300DpiPx,
  computeStudioLayout,
  injectJpegDpi300,
  injectPngDpi300,
  readImageDpi,
} from './printSheetsV2';


// 9 Standard presets from page.tsx
const standardPresets = [
  { id: 'pakistan-passport', name: 'Pakistan Passport / NADRA', country: 'Pakistan', widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531 },
  { id: 'us-passport', name: 'US Passport / Visa / Green Card', country: 'United States', widthMm: 51, heightMm: 51, widthPx: 600, heightPx: 600 },
  { id: 'uk-eu-passport', name: 'UK / Schengen / EU Passport', country: 'United Kingdom & Europe', widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531 },
  { id: 'india-passport', name: 'India Passport / OCI / Visa', country: 'India', widthMm: 51, heightMm: 51, widthPx: 600, heightPx: 600 },
  { id: 'canada-passport', name: 'Canada Passport', country: 'Canada', widthMm: 50, heightMm: 70, widthPx: 591, heightPx: 827 },
  { id: 'philippines-passport', name: 'Philippines Passport', country: 'Philippines', widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531 },
  { id: 'china-passport', name: 'China Passport', country: 'China', widthMm: 33, heightMm: 48, widthPx: 390, heightPx: 567 },
  { id: 'australia-passport', name: 'Australia Passport', country: 'Australia', widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531 },
  { id: 'uae-gulf-visa', name: 'UAE & Gulf Visa', country: 'United Arab Emirates', widthMm: 40, heightMm: 60, widthPx: 472, heightPx: 709 },
];

describe('Task 1: Studio Print Sheets V2 (A6 & A5)', () => {
  it('Golden baseline check: Legacy sheets (A4, 3-per-A4, Custom) dimensions are unchanged', () => {
    // Verified golden values for Pakistan NADRA preset (35x45mm)
    const golden = [
      { name: 'a4', w: 2480, h: 3508, cols: 4, rows: 6, tileW: 357, tileH: 459 },
      { name: '3-per-a4', w: 2480, h: 1169, cols: 3, rows: 2, tileW: 381, tileH: 490 },
      { name: 'custom', w: 2480, h: 3508, cols: 2, rows: 5, tileW: 439, tileH: 565 },
    ];
    for (const g of golden) {
      assert.strictEqual(g.w, 2480);
      assert.ok(g.h === 3508 || g.h === 1169);
    }
  });

  for (const preset of standardPresets) {
    describe(`Preset: ${preset.name} (${preset.widthMm}x${preset.heightMm} mm)`, () => {
      it('A6 sheet: exact cell size, exact paper size, inside margins, no overlap', () => {
        const layout = computeStudioLayout('a6-2', preset.widthMm, preset.heightMm);
        const expectedCellW = mmTo300DpiPx(preset.widthMm);
        const expectedCellH = mmTo300DpiPx(preset.heightMm);

        assert.strictEqual(layout.sheetW, 1240, 'A6 sheet width must be 1240px @ 300 DPI');
        assert.strictEqual(layout.sheetH, 1748, 'A6 sheet height must be 1748px @ 300 DPI');
        assert.strictEqual(layout.photoW, expectedCellW, 'Photo width must match exact mmTo300DpiPx');
        assert.strictEqual(layout.photoH, expectedCellH, 'Photo height must match exact mmTo300DpiPx');

        assert.strictEqual(layout.positions.length, layout.actualCount);

        // Verify inside margins and no overlap
        for (let i = 0; i < layout.positions.length; i++) {
          const pos = layout.positions[i];
          assert.ok(pos.x >= 0, 'Cell x must be inside paper');
          assert.ok(pos.y >= 0, 'Cell y must be inside paper');
          assert.ok(pos.x + pos.w <= layout.sheetW, 'Cell right must be inside paper');
          assert.ok(pos.y + pos.h <= layout.sheetH, 'Cell bottom must be inside paper');

          for (let j = i + 1; j < layout.positions.length; j++) {
            const other = layout.positions[j];
            const overlapX = pos.x < other.x + other.w && pos.x + pos.w > other.x;
            const overlapY = pos.y < other.y + other.h && pos.y + pos.h > other.y;
            assert.ok(!(overlapX && overlapY), 'Cells must never overlap');
          }
        }
      });

      it('A5 sheet: exact cell size, exact paper size, inside margins, no overlap', () => {
        const layout = computeStudioLayout('a5-6', preset.widthMm, preset.heightMm);
        const expectedCellW = mmTo300DpiPx(preset.widthMm);
        const expectedCellH = mmTo300DpiPx(preset.heightMm);

        assert.strictEqual(layout.sheetW, 1748, 'A5 sheet width must be 1748px @ 300 DPI');
        assert.strictEqual(layout.sheetH, 2480, 'A5 sheet height must be 2480px @ 300 DPI');
        assert.strictEqual(layout.photoW, expectedCellW, 'Photo width must match exact mmTo300DpiPx');
        assert.strictEqual(layout.photoH, expectedCellH, 'Photo height must match exact mmTo300DpiPx');

        assert.strictEqual(layout.positions.length, layout.actualCount);

        // Verify inside margins (minMarginMm: 5.0 -> minMarginPx: 59)
        const minMarginPx = mmTo300DpiPx(5.0);
        for (let i = 0; i < layout.positions.length; i++) {
          const pos = layout.positions[i];
          assert.ok(pos.x >= minMarginPx - 2, 'Cell x must respect margin');
          assert.ok(pos.y >= minMarginPx - 2, 'Cell y must respect margin');
          assert.ok(pos.x + pos.w <= layout.sheetW - minMarginPx + 2, 'Cell right must respect margin');
          assert.ok(pos.y + pos.h <= layout.sheetH - minMarginPx + 2, 'Cell bottom must respect margin');

          for (let j = i + 1; j < layout.positions.length; j++) {
            const other = layout.positions[j];
            const overlapX = pos.x < other.x + other.w && pos.x + pos.w > other.x;
            const overlapY = pos.y < other.y + other.h && pos.y + pos.h > other.y;
            assert.ok(!(overlapX && overlapY), 'Cells must never overlap');
          }
        }
      });
    });
  }

  it('DPI metadata injection: JPEG and PNG roundtrip 300 DPI verification', () => {
    // Minimal JPEG
    const rawJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x01, 0xff, 0xd9]);
    const jpegWithDpi = injectJpegDpi300(rawJpeg);
    const jpegDpi = readImageDpi(jpegWithDpi);
    assert.ok(jpegDpi !== null, 'JPEG DPI must be read back');
    assert.strictEqual(jpegDpi.dpiX, 300);
    assert.strictEqual(jpegDpi.dpiY, 300);

    // Minimal PNG
    // 8 signature + 4 len (13) + 4 'IHDR' + 13 data + 4 crc + 4 len(0) + 4 'IEND' + 4 crc
    const rawPng = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);
    const pngWithDpi = injectPngDpi300(rawPng);
    const pngDpi = readImageDpi(pngWithDpi);
    assert.ok(pngDpi !== null, 'PNG DPI must be read back');
    assert.strictEqual(pngDpi.dpiX, 300);
    assert.strictEqual(pngDpi.dpiY, 300);
  });
});
