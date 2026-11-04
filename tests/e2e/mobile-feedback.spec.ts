import { test, expect } from '@playwright/test';

test.describe('Mobile navigation and feedback', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  for (const theme of ['light', 'dark']) {
    test(`feedback dialog is above navbar and can be closed in ${theme} mode`, async ({ page }) => {
      await page.addInitScript((value) => localStorage.setItem('compixor-theme', value), theme);
      await page.goto('/tools/passport-photo');
      const trigger = page.getByRole('button', { name: 'Feedback / Request Tool' });
      await expect(trigger).toBeVisible();
      const alpha = await page.locator('.cnav-glass').evaluate(el =>
        Number(getComputedStyle(el).backgroundColor.match(/[\d.]+/g)?.[3] ?? 1)
      );
      expect(alpha).toBeGreaterThanOrEqual(0.95);
      await trigger.click();
      const dialog = page.getByRole('dialog', { name: 'Compixor AI Feedback' });
      await expect(dialog).toBeVisible();
      const close = dialog.getByRole('button', { name: 'Close dialog' });
      await expect(close).toBeVisible();
      await close.click(); // Playwright verifies the close button receives the pointer event
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
    });
  }
});
