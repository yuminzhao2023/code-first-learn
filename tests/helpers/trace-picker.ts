import type { Page } from '@playwright/test';

export async function selectTrace(page: Page, label: string, id: string) {
  const input = page.getByRole('combobox', { name: label, exact: true });
  await input.click();
  await input.fill(id);
  await page.getByRole('listbox', { name: `${label} options`, exact: true }).locator(`[role="option"][data-value="${id}"]`).click();
}
