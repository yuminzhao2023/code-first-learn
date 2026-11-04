import { test, expect } from '@playwright/test';

test('Trace Explorer: search, select, reset and filter', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Trace Explorer' })).toBeVisible();
  await expect(page.getByRole('button', { name: /analyze_market_signals/ })).toBeVisible();

  await page.getByRole('button', { name: /evaluate_strategy/ }).click();
  await expect(page.getByText('tr-9ba734').first()).toBeVisible();
  await expect(page.getByRole('region', { name: /Waterfall for evaluate_strategy/ })).toBeVisible();

  await page.getByRole('textbox', { name: 'Search traces' }).fill('risk_report');
  await expect(page.getByRole('button', { name: /generate_risk_report/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /evaluate_strategy/ })).toHaveCount(0);

  await page.getByRole('button', { name: /Reset filters/ }).click();
  await expect(page.getByRole('button', { name: /evaluate_strategy/ })).toBeVisible();

  await page.getByRole('combobox', { name: 'Filter by status' }).selectOption('error');
  await expect(page.getByRole('button', { name: /evaluate_strategy/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /analyze_market_signals/ })).toHaveCount(0);
});

test('LLM Metrics: reuses app shell and filters model rows', async ({ page }) => {
  await page.goto('/metrics');
  await expect(page.getByRole('heading', { name: 'LLM Metrics' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Trace Explorer' })).toBeVisible();
  await expect(page.locator('.model-table tbody tr')).toHaveCount(3);

  await page.getByRole('combobox', { name: 'Filter by model' }).selectOption('GPT-6');
  await expect(page.locator('.model-table tbody tr')).toHaveCount(1);
  await expect(page.locator('.model-table')).toContainText('GPT-6');
  await expect(page.locator('.model-table')).not.toContainText('Gemini');

  await page.getByRole('combobox', { name: 'Filter by model' }).selectOption('all');
  await expect(page.locator('.model-table tbody tr')).toHaveCount(3);
});

test('mobile: navigation and primary content do not overflow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/metrics');
  await expect(page.getByRole('heading', { name: 'LLM Metrics' })).toBeVisible();
  const widths = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  expect(widths.content).toBeLessThanOrEqual(widths.viewport + 1);
});
