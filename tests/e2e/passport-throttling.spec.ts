import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Passport Photo Benchmarks & Throttling', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('Check Cache-Control headers on /mediapipe/v1/*', async ({ page }) => {
    let checkedHeaders: { [key: string]: string } = {};

    page.on('response', (res) => {
      const url = res.url();
      if (url.includes('/mediapipe/v1/')) {
        const headers = res.headers();
        checkedHeaders[url] = headers['cache-control'] || 'NONE';
      }
    });

    await page.goto('/tools/passport-photo');
    const samplePath = path.resolve(__dirname, '../../public/images/passport-sample.jpg');
    await page.locator('input[type="file"]').first().setInputFiles(samplePath);

    await expect(page.locator('text=Biometric Check')).toBeVisible();
    await expect(page.locator('text=Landmarks (152+Iris)')).toBeVisible({ timeout: 15000 });

    console.log('[CACHE HEADERS AUDIT]:', checkedHeaders);

    for (const [url, cacheControl] of Object.entries(checkedHeaders)) {
      expect(cacheControl).toContain('immutable');
      expect(cacheControl).toContain('max-age=31536000');
    }
  });

  test('Benchmark on Slow 4G: 12s timeout keeps Option C silently', async ({ context, page }) => {
    test.setTimeout(60000);

    // Load page first unthrottled, then apply throttling to test the MediaPipe asset download
    await page.goto('/tools/passport-photo');

    const client = await context.newCDPSession(page);
    // Emulate Chrome "Slow 4G": 500 kbps download, 500 kbps upload, 400ms latency
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: (500 * 1024) / 8, // ~62.5 KB/s
      uploadThroughput: (500 * 1024) / 8,
      latency: 400,
    });

    const samplePath = path.resolve(__dirname, '../../public/images/passport-sample.jpg');
    await page.locator('input[type="file"]').first().setInputFiles(samplePath);

    // Initial check: Option C appears immediately
    await expect(page.locator('text=Biometric Check')).toBeVisible();

    // On cold Slow 4G, 8MB transfer over throttled network takes > 12s, so 12s timeout safety triggers
    await page.waitForTimeout(13000);
    const hasApproxBadge = await page.locator('text=Approximate (Box)').isVisible();
    console.log(`[SLOW 4G COLD]: 12s timeout elapsed. Approximate badge active: ${hasApproxBadge}`);
    expect(hasApproxBadge).toBe(true);

    // Confirm no technical error toast is shown to user
    await expect(page.locator('.sonner-toast:has-text("Error")')).not.toBeVisible();
    await expect(page.locator('.sonner-toast:has-text("failed")')).not.toBeVisible();
  });

  test('Benchmark on Fast 4G with warm cache on Mobile', async ({ page, context }) => {
    test.setTimeout(60000);

    // 1. Prime cache on initial unthrottled load
    await page.goto('/tools/passport-photo');
    const samplePath = path.resolve(__dirname, '../../public/images/passport-sample.jpg');
    await page.locator('input[type="file"]').first().setInputFiles(samplePath);
    await expect(page.locator('text=Landmarks (152+Iris)')).toBeVisible({ timeout: 15000 });

    // 2. Now emulate Fast 4G on the reload (cached WASM & model from disk cache)
    const client = await context.newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
      latency: 150,
    });

    await page.reload();
    const warmUploadTime = Date.now();
    await page.locator('input[type="file"]').first().setInputFiles(samplePath);
    await expect(page.locator('text=Landmarks (152+Iris)')).toBeVisible({ timeout: 15000 });
    const warmDuration = Date.now() - warmUploadTime;

    console.log(`[FAST 4G WARM CACHE BENCHMARK] Time to first landmark on mobile: ${warmDuration} ms`);
  });

  test('Verify Pakistan Presets (null tolerances) show measured numbers with Spec not verified', async ({ page }) => {
    await page.goto('/tools/passport-photo');
    const samplePath = path.resolve(__dirname, '../../public/images/passport-sample.jpg');
    await page.locator('input[type="file"]').first().setInputFiles(samplePath);

    // Switch to Pakistan Passport (DGIP) preset
    await page.locator('button:has-text("Pakistan Passport (DGIP")').first().click();

    // Verify "Spec Not Verified" badge in title
    await expect(page.locator('text=Spec Not Verified').first()).toBeVisible();

    // Verify measured numbers are displayed with "(Spec not verified)"
    await expect(page.locator('text=/Head size: \\d+(\\.\\d+)?% \\(Spec not verified\\)/').first()).toBeVisible();
    await expect(page.locator('text=/Eye line: \\d+(\\.\\d+)?% \\(Spec not verified\\)/').first()).toBeVisible();

    // Verify no green ticks for head size or eye line on unverified spec
    const headRow = page.locator('div:has-text("Head size:")').last();
    await expect(headRow.locator('svg.text-emerald-500')).not.toBeVisible();
  });
});
