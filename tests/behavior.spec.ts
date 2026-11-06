import { selectTrace } from './helpers/trace-picker';
import { buildErrorEvents, countBy, groupEvents } from '../src/pages/ErrorAnalysis/analysis';
import { errorEvents } from '../src/data/errors';
import { traces } from '../src/data/mock';
import { test, expect } from '@playwright/test';

const events = buildErrorEvents(errorEvents, traces);

test('Trace Explorer: search, select, reset and filter', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Trace Explorer' })).toBeVisible();
  await expect(page.getByRole('button', { name: /analyze_market_signals/ })).toBeVisible();

  await page.getByRole('button', { name: /evaluate_strategy tr-9ba734/ }).click();
  await expect(page.getByText('tr-9ba734').first()).toBeVisible();
  await expect(page.getByRole('region', { name: /Waterfall for evaluate_strategy/ })).toBeVisible();

  await page.getByRole('textbox', { name: 'Search traces' }).fill('risk_report');
  await expect(page.getByRole('button', { name: /generate_risk_report tr-3ce102/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /evaluate_strategy tr-9ba734/ })).toHaveCount(0);

  await page.getByRole('button', { name: /Reset filters/ }).click();
  await expect(page.getByRole('button', { name: /evaluate_strategy tr-9ba734/ })).toBeVisible();

  await page.getByRole('combobox', { name: 'Filter by status' }).selectOption('error');
  await expect(page.getByRole('button', { name: /evaluate_strategy tr-9ba734/ })).toBeVisible();
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

test('LLM Metrics: sorts cost descending and preserves sorting across model filters', async ({ page }) => {
  await page.goto('/metrics');
  const costHeader = page.getByRole('columnheader', { name: 'Sort by cost descending' });
  const costs = page.locator('.model-table tbody tr td:last-child');
  const summary = page.locator('.metrics-grid');
  const originalSummary = await summary.innerText();

  await expect(costHeader).toHaveAttribute('aria-sort', 'none');
  await page.getByRole('button', { name: 'Sort by cost descending' }).focus();
  await page.keyboard.press('Enter');
  await expect(costHeader).toHaveAttribute('aria-sort', 'descending');
  await expect(costs).toHaveText(['$842.10', '$610.45', '$318.20']);
  await expect(summary).toHaveText(originalSummary, { useInnerText: true });

  await page.getByRole('combobox', { name: 'Filter by model' }).selectOption('Gemini');
  await expect(costs).toHaveText(['$318.20']);
  await page.getByRole('combobox', { name: 'Filter by model' }).selectOption('all');
  await expect(costs).toHaveText(['$842.10', '$610.45', '$318.20']);
  await expect(costHeader).toHaveAttribute('aria-sort', 'descending');
});

test('Error Analysis: aggregates failed executions, filters, sorts and preserves selection', async ({ page }) => {
  await page.goto('/errors');
  await expect(page.getByRole('link', { name: 'Error Analysis' })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByTestId('failed-count')).toHaveText('12');
  await expect(page.getByTestId('service-count')).toHaveText('3');
  await expect(page.getByTestId('common-error')).toHaveText('TimeoutError');
  const rows = page.locator('.error-table tbody tr');
  await expect(rows).toHaveCount(5);
  await expect(rows.locator('td:nth-child(4)')).toHaveText(['4', '3', '2', '2', '1']);
  await rows.nth(1).getByRole('button').click();
  await page.getByRole('button', { name: 'Toggle failure count sort' }).click();
  await expect(rows.locator('td:nth-child(4)')).toHaveText(['1', '2', '2', '3', '4']);
  await expect(page.locator('.error-detail h3')).toHaveText('RateLimitError');
  await page.getByRole('button', { name: 'By model' }).click();
  await expect(page.locator('.error-bar > span')).toHaveText(['Claude Sonnet', 'GPT-6', 'Gemini']);
  await expect(page.locator('.error-detail h3')).toHaveText('RateLimitError');
  await page.getByRole('textbox', { name: 'Search errors' }).fill('  TR-ERROR-1-1  ');
  await expect(page.getByTestId('failed-count')).toHaveText('1');
  await expect(page.locator('.error-detail pre')).toContainText('HTTP 429');
  await expect(page.locator('.error-executions li')).toHaveCount(1);
  await expect(page.getByRole('combobox', { name: 'Filter by service' }).locator('option')).toHaveCount(4);
  await page.getByRole('combobox', { name: 'Filter by model' }).selectOption('Gemini');
  await expect(page.getByTestId('failed-count')).toHaveText('0');
  await expect(page.getByTestId('service-count')).toHaveText('0');
  await expect(page.getByTestId('common-error')).toHaveText('暂无异常');
  await expect(page.getByText('No exception selected.')).toBeVisible();
  await expect(page.getByText(/No matching exceptions/)).toBeVisible();
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await expect(page.getByTestId('failed-count')).toHaveText('12');
  await expect(rows.first().getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('columnheader', { name: 'Toggle failure count sort' })).toHaveAttribute('aria-sort', 'descending');
  await expect(page.getByRole('button', { name: 'By service' })).toHaveAttribute('aria-pressed', 'true');
});

test('Error Analysis: search intersections, latest matched event, fallback selection', async ({ page }) => {
  await page.goto('/errors');
  const search = page.getByRole('textbox', { name: 'Search errors' });
  await search.fill(' QUOTA ');
  await expect(page.getByTestId('failed-count')).toHaveText('3');
  await expect(page.locator('.error-executions time')).toHaveText([
    '2026-11-03 10:40:21 UTC+8', '2026-11-03 10:35:44 UTC+8', '2026-11-03 10:21:03 UTC+8',
  ]);
  await search.fill('factor-agent');
  await page.getByRole('combobox', { name: 'Filter by model' }).selectOption('GPT-6');
  await expect(page.getByTestId('failed-count')).toHaveText('1');
  await expect(page.locator('.error-detail h3')).toHaveText('RateLimitError');
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await page.getByRole('combobox', { name: 'Filter by service' }).selectOption('backtest-worker');
  await expect(page.getByTestId('failed-count')).toHaveText('6');
  await expect(page.getByTestId('service-count')).toHaveText('1');
  await page.getByRole('combobox', { name: 'Filter by service' }).selectOption('factor-agent');
  await expect(page.locator('.error-detail h3')).toHaveText('TimeoutError');
  await page.getByRole('combobox', { name: 'Filter by service' }).selectOption('all');
  await search.fill('tr-error-');
  await expect(page.getByTestId('common-error')).toHaveText('TimeoutError');
  await search.fill('tr-error-3-1');
  await expect(page.locator('.error-detail h3')).toHaveText('ValidationError');
  await expect(page.locator('.error-table tbody time')).toHaveText('10:19:30 UTC+8');
});

test('Error Analysis: related Trace links survive refresh and invalid links fall back', async ({ page }) => {
  await page.goto('/errors');
  await page.getByRole('textbox', { name: 'Search errors' }).fill('tr-error-1-1');
  await page.getByRole('link', { name: '查看 Trace' }).click();
  await expect(page).toHaveURL(/\/\?trace=tr-error-1-1$/);
  await expect(page.getByRole('region', { name: 'Waterfall for generate_risk_report' })).toBeVisible();
  await expect(page.locator('.details-list')).toContainText('tr-error-1-1');
  await expect(page.getByRole('textbox', { name: 'Search traces' })).toHaveValue('tr-error-1-1');
  await expect(page.locator('.trace-card tbody tr')).toHaveCount(1);
  await expect(page.locator('.trace-card tbody')).toContainText('tr-error-1-1');
  await page.reload();
  await expect(page.locator('.details-list')).toContainText('tr-error-1-1');
  await expect(page.locator('.trace-card tbody tr')).toHaveCount(1);
  await page.goto('/?trace=invalid');
  await expect(page.locator('.details-list')).toContainText('tr-8fa213');
  await expect(page.getByRole('textbox', { name: 'Search traces' })).toHaveValue('');
  await expect(page.locator('.trace-card tbody tr')).toHaveCount(Math.min(5, traces.length));
});

test('Error Analysis: mobile content stays within viewport and controls work by keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/errors');
  await page.getByRole('button', { name: 'By model' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'By model' })).toHaveAttribute('aria-pressed', 'true');
  const widths = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: innerWidth }));
  expect(widths.content).toBeLessThanOrEqual(widths.viewport + 1);
  await expect(page.locator('.error-detail')).toBeVisible();
});


test('Error Analysis: fixture integrity, deduplication and deterministic ties', () => {
  expect(new Set(errorEvents.map(event => event.traceId)).size).toBe(errorEvents.length);
  expect(buildErrorEvents([
    { ...errorEvents[0], traceId: 'tr-7d91bf' }, // warning is not a failed execution
    { ...errorEvents[0], traceId: 'missing-trace' },
  ], traces)).toEqual([]);
  for (const event of errorEvents) {
    expect(traces.find(trace => trace.id === event.traceId)?.status).toBe('error');
    expect(event.occurredAt).toMatch(/T\d{2}:\d{2}:\d{2}[+]08:00$/);
  }
  const timeout = events[0];
  const rateLimit = events.find(event => event.type === 'RateLimitError')!;
  const validation = events.find(event => event.type === 'ValidationError')!;
  const tied = [timeout, { ...rateLimit, occurredAt: timeout.occurredAt }, { ...validation, occurredAt: timeout.occurredAt }];
  expect(countBy([...tied, timeout], 'type').map(item => [item.name, item.count])).toEqual([
    ['RateLimitError', 1], ['TimeoutError', 1], ['ValidationError', 1],
  ]);
  expect(groupEvents([...tied, timeout], false).map(group => group.items[0].type)).toEqual(['RateLimitError', 'TimeoutError', 'ValidationError']);
  expect(groupEvents([...tied, timeout], true).map(group => group.items[0].type)).toEqual(['RateLimitError', 'TimeoutError', 'ValidationError']);
  expect(groupEvents(events, false).filter(group => group.items.length === 2).map(group => group.items[0].type)).toEqual(['TimeoutError', 'ValidationError']);
});

test('Router: sidebar navigation is client-side and browser history restores active routes', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => { document.body.dataset.navigationMarker = 'same-document'; });
  const navigation = page.getByRole('navigation', { name: 'Main navigation' });
  await navigation.getByRole('link', { name: 'LLM Metrics' }).click();
  await expect(page).toHaveURL('/metrics');
  await expect(navigation.getByRole('link', { name: 'LLM Metrics' })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.breadcrumbs strong')).toHaveText('Metrics');
  await navigation.getByRole('link', { name: 'Error Analysis' }).click();
  await expect(page.getByRole('heading', { name: 'Error Analysis' })).toBeVisible();
  await expect(page.locator('.breadcrumbs strong')).toHaveText('Error Analysis');
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'LLM Metrics' })).toBeVisible();
  await expect(navigation.getByRole('link', { name: 'LLM Metrics' })).toHaveAttribute('aria-current', 'page');
  await page.goForward();
  await expect(page.getByRole('heading', { name: 'Error Analysis' })).toBeVisible();
  await expect(page.locator('body')).toHaveAttribute('data-navigation-marker', 'same-document');
});

test('Router: query-only history navigation updates trace selection and filtering', async ({ page }) => {
  await page.goto('/?trace=tr-9ba734');
  await expect(page.locator('.details-list')).toContainText('tr-9ba734');
  await expect(page.locator('.trace-card tbody tr')).toHaveCount(1);
  // Seed a second same-document history entry, then use actual browser traversal.
  await page.evaluate(() => { window.history.pushState(null, '', '/?trace=tr-error-1-1'); });
  await page.goBack();
  await expect(page.locator('.details-list')).toContainText('tr-9ba734');
  await expect(page.getByRole('textbox', { name: 'Search traces' })).toHaveValue('tr-9ba734');
  await expect(page.locator('.trace-card tbody')).toContainText('tr-9ba734');
  await page.goForward();
  await expect(page.locator('.details-list')).toContainText('tr-error-1-1');
  await expect(page.getByRole('textbox', { name: 'Search traces' })).toHaveValue('tr-error-1-1');
  await expect(page.locator('.trace-card tbody tr')).toHaveCount(1);
  await expect(page.locator('.trace-card tbody')).toContainText('tr-error-1-1');
  await expect(page.getByRole('region', { name: 'Waterfall for generate_risk_report' })).toBeVisible();
});

test('Router: unknown paths redirect to the default page', async ({ page }) => {
  await page.goto('/unknown-page');
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: 'Trace Explorer' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Trace Explorer', exact: true })).toHaveAttribute('aria-current', 'page');
});


test('Trace Explorer: reset clears linked trace filter and preserves unrelated query parameters', async ({ page }) => {
  await page.goto('/?trace=tr-error-1-1&source=errors');
  await expect(page.locator('.trace-card tbody tr')).toHaveCount(1);
  await page.getByRole('combobox', { name: 'Filter by status' }).selectOption('ok');
  await expect(page.getByText('No traces match your filters.')).toBeVisible();
  await expect(page.getByRole('region', { name: /Waterfall for/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await expect(page).toHaveURL('/?source=errors');
  await expect(page.getByRole('textbox', { name: 'Search traces' })).toHaveValue('');
  await expect(page.getByRole('combobox', { name: 'Filter by status' })).toHaveValue('all');
  await expect(page.locator('.trace-card tbody tr')).toHaveCount(Math.min(5, traces.length));
  await expect(page.locator('.details-list')).toContainText('tr-8fa213');
  await page.reload();
  await expect(page.locator('.trace-card tbody tr')).toHaveCount(Math.min(5, traces.length));
});

test('Trace Explorer: editing linked trace search resumes normal search', async ({ page }) => {
  await page.goto('/?trace=tr-error-1-1&source=errors');
  const search = page.getByRole('textbox', { name: 'Search traces' });
  await expect(search).toHaveValue('tr-error-1-1');
  await search.fill('analyze_market_signals');
  await expect(page).toHaveURL('/?source=errors');
  await expect(page.locator('.trace-card tbody tr')).toHaveCount(1);
  await expect(page.locator('.details-list')).toContainText('tr-8fa213');
  await expect(page.getByRole('region', { name: 'Waterfall for analyze_market_signals' })).toBeVisible();
  await search.fill('');
  await expect(page.locator('.trace-card tbody tr')).toHaveCount(Math.min(5, traces.length));
});


test('Trace Explorer: paginates five rows, selects visible traces and resets pagination on filters', async ({ page }) => {
  await page.goto('/');
  const rows = page.locator('.trace-card tbody tr');
  const pagination = page.getByRole('navigation', { name: 'Trace pagination' });
  const next = pagination.getByRole('button', { name: 'Next', exact: true });
  const previous = pagination.getByRole('button', { name: 'Previous', exact: true });
  await expect(rows).toHaveCount(5);
  await expect(previous).toBeDisabled();
  const visited: string[] = [];
  for (let index = 0; index < Math.ceil(traces.length / 5); index++) {
    await expect(rows.locator('.table-op small')).toHaveText(traces.slice(index * 5, index * 5 + 5).map(trace => trace.id));
    visited.push(...await rows.locator('.table-op small').allTextContents());
    await expect(page.locator('.details-list')).toContainText(traces[index * 5].id);
    if (index < Math.ceil(traces.length / 5) - 1) await next.click();
  }
  expect(visited).toEqual(traces.map(trace => trace.id));
  await expect(next).toBeDisabled();
  await previous.focus();
  await page.keyboard.press('Enter');
  await expect(rows).toHaveCount(5);
  await page.getByRole('textbox', { name: 'Search traces' }).fill('analyze_market_signals');
  await expect(rows).toHaveCount(1);
  await expect(pagination).toHaveCount(0);
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await expect(previous).toBeDisabled();
  await next.click();
  await page.getByRole('combobox', { name: 'Filter by status' }).selectOption('error');
  await expect(previous).toBeDisabled();
  await expect(rows).toHaveCount(5);
  await page.getByRole('textbox', { name: 'Search traces' }).fill('no-such-trace');
  await expect(page.getByText('No traces match your filters.')).toBeVisible();
  await expect(pagination).toHaveCount(0);
  await expect(page.getByRole('region', { name: /Waterfall for/ })).toHaveCount(0);
});

// Comparison calculations are tested independently from the page to cover pairing boundaries.
test('Trace Compare: calculations and stable alignment preserve inputs', async () => {
  const { alignSteps, describeChange, describePercent } = await import('../src/pages/TraceCompare/comparison');
  const { comparisonTraces } = await import('../src/data/comparisons');
  const [base, next] = comparisonTraces;
  const original = JSON.stringify(comparisonTraces);
  const rows = alignSteps(base.spans, next.spans);
  expect(rows.map(row => [row.base?.id, row.comparison?.id])).toEqual([
    ['cb1', 'cn1'], ['cb2', undefined], ['cb3', 'cn2'], ['cb4', undefined], [undefined, 'cn3'],
  ]);
  expect(rows.map(row => row.occurrence)).toEqual([1, 1, 2, 1, 1]);
  expect(alignSteps([], next.spans).every(row => !row.base)).toBe(true);
  expect(alignSteps(base.spans, []).every(row => !row.comparison)).toBe(true);
  expect(alignSteps([], [])).toEqual([]);
  expect(alignSteps(base.spans.slice(0, 1), [next.spans[0], next.spans[1]]).map(row => row.occurrence)).toEqual([1, 2]);
  expect(JSON.stringify(comparisonTraces)).toBe(original);
  expect(describeChange(1000, 1500, 'ms')).toBe('Increase of 500 ms');
  expect(describeChange(1500, 1000, 'ms')).toBe('Decrease of 500 ms');
  expect(describeChange(1, 1, 'Token')).toBe('No change');
  expect(describePercent(1000, 1500)).toBe('50.0%');
  expect(describePercent(1500, 1000)).toBe('33.3%');
  expect(describePercent(0, 1)).toBe('Not calculable');
  expect(describePercent(0, 0)).toBe('Not calculable');
  expect(describePercent(100000, 100001)).toBe('Less than 0.1%');
  expect(describePercent(100001, 100000)).toBe('Less than 0.1%');
  expect(describePercent(1000, 1000)).toBe('0.0%');
});

test('Trace Compare: selection, swap, clearing, unavailable candidates and refresh', async ({ page }) => {
  await page.goto('/compare');
  const base = page.getByRole('combobox', { name: 'Baseline run' });
  const next = page.getByRole('combobox', { name: 'Comparison run' });
  const swap = page.getByRole('button', { name: 'Swap runs' });
  await expect(page.getByRole('link', { name: 'Trace Compare', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(next).toBeDisabled();
  await expect(swap).toBeDisabled();
  await selectTrace(page, 'Baseline run', 'tr-compare-base');
  await next.click();
  await expect(page.getByRole('option')).toHaveCount(3);
  await page.keyboard.press('Escape');
  await selectTrace(page, 'Comparison run', 'tr-compare-next');
  await expect(page.getByRole('region', { name: 'Duration change', exact: true })).toContainText('Increase of 500 ms');
  await expect(page.getByRole('region', { name: 'Duration change', exact: true })).toContainText('50.0%');
  await expect(page.locator('.compare-table tbody tr')).toHaveCount(5);
  await expect(page.locator('.compare-table tbody tr').nth(1)).toContainText('Removed');
  await expect(page.locator('.compare-table tbody tr').last()).toContainText('Added');
  await swap.focus();
  await page.keyboard.press('Enter');
  await expect(base).toHaveAttribute('data-selected-id', 'tr-compare-next');
  await expect(page.getByRole('region', { name: 'Duration change', exact: true })).toContainText('Decrease of 500 ms');
  await expect(page.getByRole('region', { name: 'Duration change', exact: true })).toContainText('33.3%');
  await selectTrace(page, 'Baseline run', 'tr-compare-empty');
  await expect(next).toHaveAttribute('data-selected-id', 'tr-compare-base');
  await expect(page.getByRole('region', { name: 'Token change', exact: true })).toContainText('Not calculable');
  await expect(page.locator('.compare-table tbody tr').first()).toContainText('Added');
  await selectTrace(page, 'Baseline run', 'tr-compare-base');
  await expect(next).toHaveAttribute('data-selected-id', '');
  await expect(page.locator('.compare-table')).toHaveCount(0);
  await selectTrace(page, 'Comparison run', 'tr-compare-next');
  await selectTrace(page, 'Comparison run', '');
  await expect(swap).toBeDisabled();
  await expect(page.getByText('Select a baseline and comparison run to view metrics.')).toBeVisible();
  await selectTrace(page, 'Baseline run', 'tr-8fa213');
  await expect(next).toBeDisabled();
  await expect(page.getByText('No other runs are available for this operation.')).toBeVisible();
  await selectTrace(page, 'Baseline run', 'tr-compare-base');
  await selectTrace(page, 'Comparison run', 'tr-compare-next');
  await selectTrace(page, 'Baseline run', '');
  await expect(next).toHaveAttribute('data-selected-id', '');
  await expect(next).toBeDisabled();
  await selectTrace(page, 'Baseline run', 'tr-compare-base');
  await selectTrace(page, 'Comparison run', 'tr-compare-next');
  await page.reload();
  await expect(base).toHaveAttribute('data-selected-id', '');
  await expect(next).toBeDisabled();
});

test('Trace Compare: zero, empty steps, unchanged and tiny differences', async ({ page }) => {
  await page.goto('/compare');
  const base = page.getByRole('combobox', { name: 'Baseline run' });
  const next = page.getByRole('combobox', { name: 'Comparison run' });
  await selectTrace(page, 'Baseline run', 'tr-compare-zero');
  await selectTrace(page, 'Comparison run', 'tr-compare-zero-next');
  await expect(page.getByText('No steps to compare.')).toBeVisible();
  await expect(page.getByText('Not calculable', { exact: true })).toHaveCount(2);
  await expect(page.getByText('No change', { exact: true })).toHaveCount(2);
  await selectTrace(page, 'Baseline run', 'tr-compare-small-change');
  await selectTrace(page, 'Comparison run', 'tr-compare-long-identifier-for-fixed-sample-execution-with-extended-context');
  await expect(page.getByText('Less than 0.1%', { exact: true })).toHaveCount(2);
  await expect(page.getByRole('region', { name: 'Token change', exact: true })).toContainText('Decrease of 1 Token');
  await expect(page.locator('.compare-table tbody')).toContainText('No change');
});

test('Trace Compare: both deep links locate and refresh the selected Trace', async ({ page }) => {
  for (const [label, id] of [['Baseline run', 'tr-compare-base'], ['Comparison run', 'tr-compare-next']] as const) {
    await page.goto('/compare');
    await selectTrace(page, 'Baseline run', 'tr-compare-base');
    await selectTrace(page, 'Comparison run', 'tr-compare-next');
    await page.getByRole('link', { name: `View ${label} Trace` }).click();
    await expect(page).toHaveURL(`/?trace=${id}`);
    await page.reload();
    await expect(page.getByRole('textbox', { name: 'Search traces' })).toHaveValue(id);
    await expect(page.locator('.trace-card tbody tr')).toHaveCount(1);
    await expect(page.getByRole('region', { name: 'Waterfall for compare_strategy_execution', exact: true })).toBeVisible();
  }
});

test('Trace Compare: mobile and intermediate widths contain long content and keyboard focus', async ({ page }) => {
  await page.goto('/compare');
  await selectTrace(page, 'Baseline run', 'tr-compare-base');
  await selectTrace(page, 'Comparison run', 'tr-compare-next');
  for (const width of [390, 426, 500, 600, 750, 760, 1000]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const swap = page.getByRole('button', { name: 'Swap runs' });
  await page.getByRole('combobox', { name: 'Comparison run' }).focus();
  await page.keyboard.press('Tab');
  await expect(swap).toBeFocused();
  expect(await swap.evaluate(element => getComputedStyle(element).boxShadow)).not.toBe('none');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('combobox', { name: 'Baseline run' })).toHaveAttribute('data-selected-id', 'tr-compare-next');
  await selectTrace(page, 'Baseline run', 'tr-compare-small-change');
  await selectTrace(page, 'Comparison run', 'tr-compare-long-identifier-for-fixed-sample-execution-with-extended-context');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

test('Trace Compare: searchable picker bounds, full text and keyboard dismissal', async ({ page }) => {
  await page.goto('/compare');
  const input = page.getByRole('combobox', { name: 'Baseline run', exact: true });
  await input.focus();
  await page.keyboard.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('End');
  const activeId = await input.getAttribute('aria-activedescendant');
  await expect(page.locator(`[id="${activeId}"]`)).toContainText('tr-compare-small-change');
  await page.keyboard.press('Enter');
  await expect(input).toHaveAttribute('data-selected-id', 'tr-compare-small-change');
  await input.click();
  await expect(page.getByRole('option', { selected: true })).toContainText('tr-compare-small-change');
  await input.fill(' NO-SUCH-TRACE ');
  await expect(page.getByRole('status')).toHaveText('No matching runs. Try another search.');
  await page.keyboard.press('Escape');
  await expect(input).toHaveAttribute('data-selected-id', 'tr-compare-small-change');
  await expect(input).toBeFocused();
  await input.click();
  await input.fill(' TR-COMPARE-LONG-IDENTIFIER ');
  await expect(page.getByRole('option')).toHaveCount(2);
  await page.keyboard.press('Enter');
  await expect(input).toHaveAttribute('data-selected-id', 'tr-compare-long-identifier-for-fixed-sample-execution-with-extended-context');
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await input.click();
    await input.fill('');
    const bounds = await page.locator('.trace-picker-popup').boundingBox();
    const trigger = await input.boundingBox();
    expect(bounds!.width).toBeCloseTo(trigger!.width, 0);
    expect(bounds!.height).toBeLessThanOrEqual(320);
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(844);
    expect(await page.locator('.trace-picker-popup').evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('listbox')).toHaveCount(0);
  }
  await page.setViewportSize({ width: 1440, height: 500 });
  await input.click();
  await input.fill('tr-compare-long-identifier');
  const upward = await page.locator('.trace-picker-popup').boundingBox();
  const anchor = await input.boundingBox();
  expect(upward!.y + upward!.height).toBeCloseTo(anchor!.y - 8, 0);
  await page.getByRole('heading', { name: 'Trace Compare' }).click();
  await expect(input).toHaveAttribute('aria-expanded', 'false');
});

test('App shell: every page keeps navigation, chrome and content within the layout', async ({ page }) => {
  const routes = [
    { path: '/', label: 'Trace Explorer', breadcrumb: 'Traces' },
    { path: '/metrics', label: 'LLM Metrics', breadcrumb: 'Metrics' },
    { path: '/errors', label: 'Error Analysis', breadcrumb: 'Error Analysis' },
    { path: '/compare', label: 'Trace Compare', breadcrumb: 'Trace Compare' },
  ];
  for (const width of [1440, 600, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route.path);
      await expect(page.getByRole('heading', { name: route.label, exact: true })).toBeVisible();
      const navigation = page.getByRole('navigation', { name: 'Main navigation' });
      await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1);
      await expect(navigation.getByRole('link', { name: route.label, exact: true })).toHaveAttribute('aria-current', 'page');
      await expect(page.locator('.breadcrumbs strong')).toHaveText(route.breadcrumb);
      const sidebar = await page.getByRole('complementary', { name: 'Primary sidebar' }).boundingBox();
      const topbar = await page.locator('.topbar').boundingBox();
      const content = await page.locator('.content-wrap').boundingBox();
      expect(sidebar).not.toBeNull();
      expect(topbar).not.toBeNull();
      expect(content).not.toBeNull();
      if (width > 750) expect(content!.x).toBeGreaterThanOrEqual(sidebar!.x + sidebar!.width);
      else expect(topbar!.y).toBeGreaterThanOrEqual(sidebar!.y + sidebar!.height);
      expect(content!.y).toBeGreaterThanOrEqual(topbar!.y + topbar!.height);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
      for (const link of await navigation.getByRole('link').all()) {
        await expect(link).toBeVisible();
        const bounds = await link.boundingBox();
        expect(bounds!.x).toBeGreaterThanOrEqual(0);
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(sidebar!.x + sidebar!.width + 1);
      }
    }
  }
});

test('Visual boundaries: adding a navigation item leaves the page content image unchanged', async ({ page }) => {
  for (const width of [1440, 600, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/metrics');
    await expect(page.getByRole('heading', { name: 'LLM Metrics', exact: true })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const content = page.locator('.content-wrap');
    const before = await content.screenshot({ animations: 'disabled', caret: 'hide' });
    // A test-only DOM change models the navigation-only part of adding a route.
    await page.getByRole('navigation', { name: 'Main navigation' }).evaluate(navigation => {
      const link = document.createElement('a');
      link.className = 'nav-link';
      link.href = '/test-only-page';
      link.textContent = 'New page';
      navigation.append(link);
    });
    const after = await content.screenshot({ animations: 'disabled', caret: 'hide' });
    expect(after.equals(before), `content changed after navigation addition at ${width}px`).toBe(true);
  }
});
