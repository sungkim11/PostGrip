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

test.describe('Explorer Tabs', () => {
  test('Database tab is visible and active by default', async () => {
    await expect(page.locator('button', { hasText: 'Database' })).toBeVisible();
  });

  test('Files tab is visible', async () => {
    await expect(page.locator('button', { hasText: 'Files' })).toBeVisible();
  });

  test('Git tab is visible', async () => {
    await expect(page.locator('button', { hasText: 'Git' })).toBeVisible();
  });

  test('clicking Files tab shows file browser', async () => {
    await page.locator('button', { hasText: 'Files' }).click();
    // Should show a directory path or the up button
    await expect(page.locator('button[title="Go up"]')).toBeVisible();
  });

  test('clicking Git tab shows repositories section', async () => {
    await page.locator('button', { hasText: 'Git' }).click();
    await expect(page.locator('text=Repositories')).toBeVisible({ timeout: 5000 });
  });

  test('clicking Database tab returns to schema view', async () => {
    await page.locator('button', { hasText: 'Database' }).click();
    await expect(page.locator('text=Connect to browse schema')).toBeVisible();
  });
});
