import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Passport Photo Studio - Quality Gate & Biometric Auto-fit', () => {
  test.use({ viewport: { width: 375, height: 812 } }); // Mobile viewport
  test.setTimeout(60000);

  let activeCutoutFixture = 'tilted-car-photo-cutout.png';

  test.beforeEach(async ({ page }) => {
    // Intercept remove-bg backend requests to make E2E fast and independent of external VPS
    await page.route('**/remove-bg*', async (route) => {
      const cutoutPath = path.resolve(__dirname, `../fixtures/${activeCutoutFixture}`);
      if (fs.existsSync(cutoutPath)) {
        await route.fulfill({
          status: 200,
          contentType: 'image/png',
          headers: {
            'X-Compixor-Engine': 'RMBG-2.0',
            'Access-Control-Allow-Origin': '*',
          },
          body: fs.readFileSync(cutoutPath),
        });
      } else {
        await route.abort();
      }
    });
  });

  test('Tilted car photo: auto-fit preserves crown in frame, fires quality gate warnings, locks green ticks', async ({ page }) => {
    activeCutoutFixture = 'tilted-car-photo-cutout.png';
    await page.goto('http://localhost:3000/tools/passport-photo');

    const tiltedPhotoPath = path.resolve(__dirname, '../fixtures/tilted-car-photo.jpg');
    await page.locator('input[type="file"]').first().setInputFiles(tiltedPhotoPath);

    // Wait for landmarks and auto-fit to settle
    const landmarkBadge = page.locator('text=Landmarks (152+Iris)');
    await expect(landmarkBadge).toBeVisible({ timeout: 15000 });

    // 1. Verify Head Tilted quality gate message appears (|roll| > 7 degrees)
    const tiltedWarning = page.locator('text=Head is tilted. Please face the camera straight.');
    await expect(tiltedWarning).toBeVisible({ timeout: 5000 });

    // 2. Verify Photo Too Close quality gate message appears (face box > 60% width or > 50% height)
    const tooCloseWarning = page.locator('text=Photo is too close. Use a photo with more space around the head.');
    await expect(tooCloseWarning).toBeVisible({ timeout: 5000 });

    // 3. Verify that green ticks are LOCKED while quality issues are active (no green "Compliant" text)
    const compliantBadge = page.locator('text=Head size: 70% of photo height (Compliant)');
    await expect(compliantBadge).toHaveCount(0);

    const lockedHead = page.locator('text=Locked — photo quality issue active');
    await expect(lockedHead.first()).toBeVisible();

    // 4. Verify auto-fit never let the crown or chin leave the frame
    const croppedWarning = page.locator('text=Crown/hair is cropped at the top edge');
    await expect(croppedWarning).toHaveCount(0);
  });

  test('Photo with crown touching original top edge: shows red no-space-above-head warning', async ({ page }) => {
    activeCutoutFixture = 'top-cropped-cutout.png';
    await page.goto('http://localhost:3000/tools/passport-photo');

    const topCroppedPhotoPath = path.resolve(__dirname, '../fixtures/top-cropped-photo.jpg');
    await page.locator('input[type="file"]').first().setInputFiles(topCroppedPhotoPath);

    // Wait for landmarks
    const landmarkBadge = page.locator('text=Landmarks (152+Iris)');
    await expect(landmarkBadge).toBeVisible({ timeout: 15000 });

    // Verify No Space Above Head message appears when crown touches top edge of original photo
    const noSpaceWarning = page.locator('text=No space above the head in your photo. Use a photo that shows the full head and some background above it.');
    await expect(noSpaceWarning).toBeVisible({ timeout: 5000 });

    // Verify green ticks are locked
    const lockedHead = page.locator('text=Locked — photo quality issue active');
    await expect(lockedHead.first()).toBeVisible();
  });

  test('Normal straight photo: passes quality gates with compliant green ticks', async ({ page }) => {
    activeCutoutFixture = 'straight-photo-cutout.png';
    await page.goto('http://localhost:3000/tools/passport-photo');

    const straightPhotoPath = path.resolve(__dirname, '../fixtures/straight-photo.jpg');
    await page.locator('input[type="file"]').first().setInputFiles(straightPhotoPath);

    // Wait for landmarks
    const landmarkBadge = page.locator('text=Landmarks (152+Iris)');
    await expect(landmarkBadge).toBeVisible({ timeout: 15000 });

    // Verify no tilt warning
    const tiltedWarning = page.locator('text=Head is tilted. Please face the camera straight.');
    await expect(tiltedWarning).toHaveCount(0);

    // Verify no photo too close warning
    const tooCloseWarning = page.locator('text=Photo is too close. Use a photo with more space around the head.');
    await expect(tooCloseWarning).toHaveCount(0);

    // Verify no space above head warning is absent
    const noSpaceWarning = page.locator('text=No space above the head in your photo');
    await expect(noSpaceWarning).toHaveCount(0);

    // Verify green ticks (Compliant) are active
    const compliantHead = page.locator('text=Compliant');
    await expect(compliantHead.first()).toBeVisible();
  });

  test('Preset change and new photo upload reset userInteractedTransformRef to re-run auto-fit', async ({ page }) => {
    activeCutoutFixture = 'straight-photo-cutout.png';
    await page.goto('http://localhost:3000/tools/passport-photo');

    const straightPhotoPath = path.resolve(__dirname, '../fixtures/straight-photo.jpg');
    await page.locator('input[type="file"]').first().setInputFiles(straightPhotoPath);

    await expect(page.locator('text=Landmarks (152+Iris)')).toBeVisible({ timeout: 15000 });

    // User interacts (clicks adjust position / zoom in)
    const zoomInBtn = page.locator('button[title*="Zoom In"], button[aria-label*="Zoom In"]').first();
    if (await zoomInBtn.isVisible()) {
      await zoomInBtn.click();
    }

    // Now switch preset (e.g. to US Passport)
    const usPreset = page.locator('text=US Passport / Visa / Green Card').first();
    await usPreset.click();

    // Verify auto-fit ran again on preset change
    await page.waitForTimeout(500);

    // Switch cutout fixture to tilted for next upload
    activeCutoutFixture = 'tilted-car-photo-cutout.png';

    // Click Change Photo to reset project
    const changePhotoBtn = page.locator('button:has-text("Change Photo")').first();
    await changePhotoBtn.click();

    // Upload new photo (tilted photo)
    const tiltedPhotoPath = path.resolve(__dirname, '../fixtures/tilted-car-photo.jpg');
    await page.locator('input[type="file"]').first().setInputFiles(tiltedPhotoPath);

    // Verify auto-fit runs on new photo and quality warnings appear
    await expect(page.locator('text=Landmarks (152+Iris)')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Head is tilted. Please face the camera straight.')).toBeVisible();
  });
});
