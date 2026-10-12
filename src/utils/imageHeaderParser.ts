/**
 * Pre-decode image header parser
 * Reads the first 64KB of JPEG, PNG, or WebP to determine width and height
 * without decoding pixel buffers into memory.
 */

export interface ImageHeaderInfo {
  width: number;
  height: number;
  type: 'jpeg' | 'png' | 'webp' | 'unknown';
}

export const PASSPORT_UPLOAD_CONFIG = {
  MAX_FILE_MB: 15,
  MAX_MEGAPIXELS: 100,
  WORKING_MAX_DIM: 2400,
} as const;

export async function parseImageHeaderDimensions(file: File): Promise<ImageHeaderInfo | null> {
  try {
    const slice = file.slice(0, 65536);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    if (bytes.length < 16) return null;

    // 1. PNG: 89 50 4E 47 0D 0A 1A 0A -> IHDR starts at byte 16
    if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    ) {
      const view = new DataView(buffer);
      const width = view.getUint32(16, false);
      const height = view.getUint32(20, false);
      if (width > 0 && height > 0) {
        return { width, height, type: 'png' };
      }
    }

    // 2. WebP: RIFF ... WEBP
    if (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    ) {
      // VP8 (lossy): 'VP8 ' chunk at offset 12
      if (bytes[12] === 0x56 && bytes[13] === 0x50 && bytes[14] === 0x38 && bytes[15] === 0x20) {
        if (bytes.length >= 30) {
          // Key frame magic: 9d 01 2a
          const width = (bytes[26] | (bytes[27] << 8)) & 0x3fff;
          const height = (bytes[28] | (bytes[29] << 8)) & 0x3fff;
          if (width > 0 && height > 0) return { width, height, type: 'webp' };
        }
      }
      // VP8L (lossless): 'VP8L' chunk at offset 12
      if (bytes[12] === 0x56 && bytes[13] === 0x50 && bytes[14] === 0x38 && bytes[15] === 0x4c) {
        if (bytes.length >= 25 && bytes[20] === 0x2f) {
          const b1 = bytes[21];
          const b2 = bytes[22];
          const b3 = bytes[23];
          const b4 = bytes[24];
          const width = 1 + (((b2 & 0x3f) << 8) | b1);
          const height = 1 + ((((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6)));
          if (width > 0 && height > 0) return { width, height, type: 'webp' };
        }
      }
      // VP8X (extended): 'VP8X' chunk at offset 12
      if (bytes[12] === 0x56 && bytes[13] === 0x50 && bytes[14] === 0x38 && bytes[15] === 0x58) {
        if (bytes.length >= 30) {
          const width = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
          const height = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
          if (width > 0 && height > 0) return { width, height, type: 'webp' };
        }
      }
    }

    // 3. JPEG: FF D8 ... markers
    if (bytes[0] === 0xff && bytes[1] === 0xd8) {
      let offset = 2;
      const len = bytes.length;
      while (offset < len) {
        if (bytes[offset] !== 0xff) {
          offset++;
          continue;
        }
        while (offset < len && bytes[offset] === 0xff) {
          offset++;
        }
        if (offset >= len) break;
        const marker = bytes[offset];
        offset++;

        // Standalone markers without length: SOI (0xD8), EOI (0xD9), RST0-RST7 (0xD0-0xD7)
        if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
          continue;
        }

        // SOF markers with dimensions: SOF0 (0xC0), SOF1 (0xC1), SOF2 (0xC2), SOF3 (0xC3), SOF5-SOF7, SOF9-SOF11, SOF13-SOF15
        if (
          (marker >= 0xc0 && marker <= 0xc3) ||
          (marker >= 0xc5 && marker <= 0xc7) ||
          (marker >= 0xc9 && marker <= 0xcb) ||
          (marker >= 0xcd && marker <= 0xcf)
        ) {
          if (offset + 7 <= len) {
            // Segment length is at offset, then precision at offset+2, height at offset+3..4, width at offset+5..6
            const height = (bytes[offset + 3] << 8) | bytes[offset + 4];
            const width = (bytes[offset + 5] << 8) | bytes[offset + 6];
            if (width > 0 && height > 0) {
              return { width, height, type: 'jpeg' };
            }
          }
        }

        if (offset + 2 > len) break;
        const segmentLen = (bytes[offset] << 8) | bytes[offset + 1];
        offset += segmentLen;
      }
    }

    return null;
  } catch {
    return null;
  }
}
