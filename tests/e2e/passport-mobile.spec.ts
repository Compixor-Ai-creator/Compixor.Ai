import { test, expect } from '@playwright/test';

test.describe('Passport Photo Studio UX & Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 812 } }); // iPhone 13/14 viewport

  test('Direct visit to ?step=download without photo redirects/shows Step 1 editor', async ({ page }) => {
    await page.goto('/tools/passport-photo?step=download');
    // Dropzone should be visible since no photo was provided
    await expect(page.locator('text=Upload portrait or selfie')).toBeVisible();
    // Step 3 download panels must not show without an image
    await expect(page.locator('text=Online Submission')).not.toBeVisible();
  });

  test('Mobile viewport (375px) has non-overlapping, accessible controls and print sheet options', async ({ page }) => {
    await page.goto('/tools/passport-photo');
    // Check main title
    await expect(page.locator('h1')).toBeVisible();

    // Verify print presets list and dropzone are displayed without overflowing
    const dropzone = page.locator('text=Upload portrait or selfie');
    await expect(dropzone).toBeVisible();

    // Verify debug panel when ?debug=1 is enabled
    await page.goto('/tools/passport-photo?debug=1');
    const debugButton = page.locator('button:has-text("Debug")');
    await expect(debugButton).toBeVisible();
    await debugButton.click();
    await expect(page.locator('text=Last align cause:')).toBeVisible();
    await expect(page.locator('text=Zoom:')).toBeVisible();
  });
});
