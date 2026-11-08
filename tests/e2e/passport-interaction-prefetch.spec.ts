import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Passport Photo Studio - Interaction Prefetch & Late Landmark Stability', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('Do NOT prefetch on idle; start prefetch only on dropzone interaction (click or drag-over)', async ({ page }) => {
    const downloadedAssets: string[] = [];

    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('/mediapipe/')) {
        downloadedAssets.push(url);
      }
    });

    // 1. Visit page and wait idle for 2 seconds
    await page.goto('/tools/passport-photo');
    await page.waitForTimeout(2000);

    // On page idle, zero MediaPipe assets must have been fetched
    expect(downloadedAssets.length).toBe(0);

    // 2. Emulate 4G network connection with saveData: false
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'connection', {
        value: {
          saveData: false,
          effectiveType: '4g',
        },
        configurable: true,
      });
    });

    // 3. User clicks on the drop zone ("Upload Photo")
    await page.locator('.drop-zone').click();
    await page.waitForTimeout(1000);

    // Verify prefetch was triggered upon user interaction!
    expect(downloadedAssets.length).toBeGreaterThan(0);
    console.log('[INTERACTION PREFETCH PASSED]: Assets triggered on click:', downloadedAssets);
  });

  test('Late landmark upgrade must only update measurements/badge and NEVER move zoom or pan', async ({ page }) => {
    await page.goto('/tools/passport-photo');
    const samplePath = path.resolve(__dirname, '../../public/images/passport-sample.jpg');
    await page.locator('input[type="file"]').first().setInputFiles(samplePath);

    // Wait for initial layout and wait until controls are enabled
    const zoomSlider = page.locator('input[type="range"]').first();
    await expect(zoomSlider).toBeVisible();
    await expect(zoomSlider).toBeEnabled({ timeout: 20000 });

    // User adjusts zoom slider to 1.46
    await zoomSlider.evaluate((el: HTMLInputElement) => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      nativeSetter?.call(el, '1.46');
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Verify React state updated
    await page.waitForTimeout(200);
    const userZoom = await zoomSlider.inputValue();
    expect(userZoom).toBe('1.46');

    // Wait for Landmarks badge to upgrade
    const landmarkBadge = page.locator('text=Landmarks (152+Iris)');
    await expect(landmarkBadge).toBeVisible({ timeout: 15000 });

    // Verify that zoom has NOT been reset by auto-fit and remains exactly 1.46!
    const zoomAfterUpgrade = await zoomSlider.inputValue();
    expect(zoomAfterUpgrade).toBe('1.46');

    console.log(`[LATE UPGRADE STABILITY PASSED]: User zoom remained untouched at ${zoomAfterUpgrade} after landmarks arrived.`);
  });
});
