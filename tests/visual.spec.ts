import { selectTrace } from './helpers/trace-picker';
import { test, expect } from '@playwright/test';

/**
 * Generate and compare screenshots with npm run test:visual:docker in the canonical
 * container. Review candidates before approving or committing new baselines.
 */

// Shared chrome is checked once per layout, independently of page content height.
for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'compact', width: 600, height: 844 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  test(`App shell ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Trace Explorer' })).toBeVisible();
    // Desktop sidebar normally stretches with page height. Fix only its screenshot
    // height so an unrelated page's content length cannot change this baseline.
    const navigationStyle = await page.addStyleTag({
      content: `@media (min-width: 751px) { .sidebar { height: ${viewport.height}px; min-height: ${viewport.height}px; align-self: flex-start; } }`,
    });
    const sidebar = page.getByRole('complementary', { name: 'Primary sidebar' });
    if (viewport.width > 750) await expect(sidebar).toHaveCSS('height', `${viewport.height}px`);
    await expect.soft(sidebar).toHaveScreenshot(`navigation-${viewport.name}.png`);
    await navigationStyle.evaluate(element => element.remove());
    await expect.soft(page.locator('.topbar')).toHaveScreenshot(`topbar-${viewport.name}.png`);
  });
}

test('Trace Explorer content desktop', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Trace Explorer' })).toBeVisible();
  await expect(page.locator('.content-wrap')).toHaveScreenshot('trace-explorer-desktop.png');
});

test('LLM Metrics content desktop', async ({ page }) => {
  await page.goto('/metrics');
  await expect(page.getByRole('heading', { name: 'LLM Metrics' })).toBeVisible();
  await expect(page.locator('.content-wrap')).toHaveScreenshot('llm-metrics-desktop.png');
});

test('LLM Metrics content mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/metrics');
  await expect(page.getByRole('heading', { name: 'LLM Metrics' })).toBeVisible();
  await expect(page.locator('.content-wrap')).toHaveScreenshot('llm-metrics-mobile.png');
});

test('Error Analysis desktop', async ({ page }) => {
  await page.goto('/errors');
  await expect(page.getByRole('heading', { name: 'Error Analysis' })).toBeVisible();
  await expect(page.locator('.content-wrap')).toHaveScreenshot('error-analysis-desktop.png');
});

test('Error Analysis mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/errors');
  await expect(page.getByRole('heading', { name: 'Error Analysis' })).toBeVisible();
  await expect(page.locator('.content-wrap')).toHaveScreenshot('error-analysis-mobile.png');
});

for (const viewport of [{ name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
  test(`Trace Compare ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/compare');
    await selectTrace(page, 'Baseline run', 'tr-compare-base');
    await selectTrace(page, 'Comparison run', 'tr-compare-next');
    await expect(page.locator('.content-wrap')).toHaveScreenshot(`trace-compare-${viewport.name}.png`);
  });
  test(`Trace Compare picker ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/compare');
    const picker = page.getByRole('combobox', { name: 'Baseline run' });
    await picker.click();
    await picker.fill('tr-compare-long-identifier');
    await expect(page.getByRole('listbox')).toBeVisible();
    await expect(page.locator('.trace-picker-popup')).toHaveScreenshot(`trace-compare-picker-${viewport.name}.png`);
  });
}
