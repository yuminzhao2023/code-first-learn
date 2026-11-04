import { test, expect } from '@playwright/test';

/**
 * Visual snapshots are NOT shipped as "approved" baselines.
 * First inspect the page manually, then run:
 *   npm run test:visual:update
 * Review PNGs before committing them. Never auto-approve a regression.
 */

test('approved desktop Trace Explorer', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Trace Explorer' })).toBeVisible();
  await expect(page).toHaveScreenshot('trace-explorer-desktop.png', { fullPage: true });
});

test('approved desktop LLM Metrics', async ({ page }) => {
  await page.goto('/metrics');
  await expect(page.getByRole('heading', { name: 'LLM Metrics' })).toBeVisible();
  await expect(page).toHaveScreenshot('llm-metrics-desktop.png', { fullPage: true });
});

test('approved mobile Metrics', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/metrics');
  await expect(page.getByRole('heading', { name: 'LLM Metrics' })).toBeVisible();
  await expect(page).toHaveScreenshot('llm-metrics-mobile.png', { fullPage: true });
});
