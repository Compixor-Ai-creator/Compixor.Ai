import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Passport Photo Studio - Option A Landmarks & Option C Fallback', () => {
  test.use({ viewport: { width: 375, height: 812 } }); // Mobile viewport (iPhone 13)

  test('Measures download size and time to first landmark on mobile viewport', async ({ page }) => {
    const downloadedAssets: { url: string; size: number }[] = [];

    page.on('response', async (res) => {
      const url = res.url();
      if (url.includes('/mediapipe/')) {
        const headers = res.headers();
        const contentLength = headers['content-length'] ? parseInt(headers['content-length'], 10) : 0;
        downloadedAssets.push({ url, size: contentLength });
      }
    });

    await page.goto('/tools/passport-photo');

    // Confirm that on initial page load, zero MediaPipe assets have been fetched
    expect(downloadedAssets.length).toBe(0);

    // Upload sample portrait
    const samplePath = path.resolve(__dirname, '../../public/images/passport-sample.jpg');
    const uploadTime = Date.now();
    await page.locator('input[type="file"]').first().setInputFiles(samplePath);

    // Verify Option C badge appears immediately or is active
    const badge = page.locator('text=Biometric Check');
    await expect(badge).toBeVisible();

    // Wait for Landmarks badge to appear
    const landmarkBadge = page.locator('text=Landmarks (152+Iris)');
    await expect(landmarkBadge).toBeVisible({ timeout: 15000 });

    const landmarkTime = Date.now();
    const duration = landmarkTime - uploadTime;

    console.log(`[E2E BENCHMARK] Time from upload to first landmark on mobile: ${duration} ms`);
    console.log('[E2E BENCHMARK] MediaPipe assets downloaded:', downloadedAssets);

    // Verify Pakistan Presets split:
    await expect(page.locator('text=Pakistan Passport (DGIP, white background)').first()).toBeAttached();
    await expect(page.locator('text=Pakistan CNIC/NICOP (NADRA, light blue)').first()).toBeAttached();
  });
});
