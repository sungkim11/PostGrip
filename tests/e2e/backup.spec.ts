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

test.describe('Backup & Restore Panel', () => {
  test('Backup & Restore button is in menu bar', async () => {
    await expect(page.locator('button', { hasText: 'Backup & Restore' })).toBeVisible();
  });

  test('clicking opens the backup panel', async () => {
    await page.locator('button', { hasText: 'Backup & Restore' }).click();
    await expect(page.locator('text=Backup & Restore').first()).toBeVisible();
  });

  test('shows Backup Now and Schedule Backup buttons', async () => {
    await expect(page.locator('button', { hasText: 'Backup Now' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Schedule Backup' })).toBeVisible();
  });

  test('shows Backup History section', async () => {
    await expect(page.locator('text=Backup History')).toBeVisible();
  });

  test('shows Change button for backup directory', async () => {
    await expect(page.locator('button', { hasText: 'Change' })).toBeVisible();
  });

  test('shows backup table or empty message', async () => {
    // Either shows backup entries or the empty state — both are valid
    const hasBackups = await page.locator('table').isVisible().catch(() => false);
    const hasEmpty = await page.getByText('No backups yet').isVisible().catch(() => false);
    expect(hasBackups || hasEmpty).toBe(true);
  });

  test('Backup Now shows error when not connected', async () => {
    const btn = page.getByRole('button', { name: 'Backup Now' });
    if (!(await btn.isVisible().catch(() => false))) {
      await page.getByRole('button', { name: 'Backup & Restore', exact: true }).click();
      await btn.waitFor({ timeout: 5000 });
    }
    await btn.click();
    // Without a connection, it should show an error in the status bar
    await expect(page.getByText('No active database connection')).toBeVisible({ timeout: 5000 });
  });

  test('Schedule Backup button is clickable', async () => {
    const btn = page.getByRole('button', { name: 'Schedule Backup' });
    if (!(await btn.isVisible().catch(() => false))) {
      await page.getByRole('button', { name: 'Backup & Restore', exact: true }).click();
      await btn.waitFor({ timeout: 5000 });
    }
    await expect(btn).toBeEnabled();
  });

  test('Close button returns to Data pane', async () => {
    // Ensure backup panel is open
    const closeBtn = page.getByRole('button', { name: 'Close' }).first();
    if (!(await closeBtn.isVisible().catch(() => false))) {
      await page.getByRole('button', { name: 'Backup & Restore', exact: true }).click();
      await closeBtn.waitFor({ timeout: 5000 });
    }
    await closeBtn.click();
    await expect(page.getByText('Data', { exact: true })).toBeVisible();
  });
});
