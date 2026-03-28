import { test, expect } from '@playwright/test';
import { launchApp, closeApp } from './helpers';
import type { ElectronApplication, Page } from '@playwright/test';

let app: ElectronApplication | undefined;
let page: Page;

test.beforeAll(async () => {
  ({ app, page } = await launchApp());
});

test.afterAll(async () => {
  await closeApp(app);
});

test.describe('Help Menu', () => {
  test('Help dropdown opens with Help and About items', async () => {
    await page.locator('button', { hasText: 'Help' }).click();
    await expect(page.locator('button', { hasText: 'About PostGrip' })).toBeVisible();
  });

  test('About PostGrip opens dialog with version info', async () => {
    // Help menu may already be open from previous test
    const aboutBtn = page.locator('button', { hasText: 'About PostGrip' });
    if (!(await aboutBtn.isVisible())) {
      await page.locator('button', { hasText: 'Help' }).click();
    }
    await aboutBtn.click();
    await expect(page.locator('text=Version')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Electron')).toBeVisible();
    await expect(page.locator('text=Node.js')).toBeVisible();
    await expect(page.locator('text=Platform')).toBeVisible();
    // Close
    await page.locator('button', { hasText: 'Close' }).click();
  });

  test('Help opens markdown viewer', async () => {
    await page.locator('button', { hasText: 'Help' }).click();
    // Click the Help menu item (not the menu button)
    await page.locator('button', { hasText: /^Help$/ }).nth(1).click();
    await expect(page.locator('text=User Guide')).toBeVisible({ timeout: 5000 });
    // Close via X button
    await page.locator('button:has-text("\u00d7")').click();
  });
});
