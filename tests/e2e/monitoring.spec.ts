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

test.describe('Monitoring Panel', () => {
  test('Monitoring button is in menu bar', async () => {
    await expect(page.locator('button', { hasText: 'Monitoring' })).toBeVisible();
  });

  test('clicking Monitoring opens panel', async () => {
    await page.locator('button', { hasText: 'Monitoring' }).click();
    await expect(page.locator('text=Monitoring').first()).toBeVisible();
    await expect(page.locator('button', { hasText: 'Refresh' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Close' }).first()).toBeVisible();
  });

  test('shows connect prompt when no database', async () => {
    await expect(page.locator('text=Connect to a database')).toBeVisible();
  });

  test('Close button hides monitoring panel', async () => {
    await page.locator('button', { hasText: 'Close' }).first().click();
    // Data pane should be back
    await expect(page.getByText('Data', { exact: true })).toBeVisible();
  });

  test('opening SQL Editor closes monitoring', async () => {
    await page.locator('button', { hasText: 'Monitoring' }).click();
    await expect(page.locator('text=Monitoring').first()).toBeVisible();
    await page.locator('button', { hasText: 'SQL Editor' }).click();
    await expect(page.locator('.cm-editor')).toBeVisible({ timeout: 5000 });
    // Clean up
    await page.locator('button', { hasText: 'Close' }).click();
  });
});
