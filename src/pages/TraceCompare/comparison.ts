import type { Span } from '../../types/observability';

export function describeChange(base: number, comparison: number, unit: string): string {
  const delta = comparison - base;
  return delta === 0 ? 'No change' : `${delta > 0 ? 'Increase of' : 'Decrease of'} ${Math.abs(delta).toLocaleString('en-US')} ${unit}`;
}

export function describePercent(base: number, comparison: number): string {
  if (base === 0) return 'Not calculable';
  const percent = Math.abs((comparison - base) / base * 100);
  return percent > 0 && percent < 0.05 ? 'Less than 0.1%' : `${percent.toFixed(1)}%`;
}

export interface AlignedStep {
  base?: Span;
  comparison?: Span;
  occurrence: number;
  repeated: boolean;
}

/** Match exact kind/label pairs by occurrence, preserving base order then unmatched comparison order. */
export function alignSteps(base: readonly Span[], comparison: readonly Span[]): AlignedStep[] {
  const key = (span: Span) => JSON.stringify([span.kind, span.label]);
  const queues = new Map<string, number[]>();
  comparison.forEach((span, index) => {
    const indexes = queues.get(key(span)) ?? [];
    indexes.push(index);
    queues.set(key(span), indexes);
  });
  const totals = new Map<string, number>();
  for (const spans of [base, comparison]) {
    const counts = new Map<string, number>();
    spans.forEach(span => counts.set(key(span), (counts.get(key(span)) ?? 0) + 1));
    counts.forEach((count, name) => totals.set(name, Math.max(totals.get(name) ?? 0, count)));
  }
  const seen = new Map<string, number>();
  const used = new Set<number>();
  const rows: AlignedStep[] = base.map(span => {
    const name = key(span);
    const occurrence = (seen.get(name) ?? 0) + 1;
    seen.set(name, occurrence);
    const index = queues.get(name)?.[occurrence - 1];
    if (index !== undefined) used.add(index);
    return { base: span, comparison: index === undefined ? undefined : comparison[index], occurrence, repeated: totals.get(name)! > 1 };
  });
  const comparisonSeen = new Map<string, number>();
  comparison.forEach((span, index) => {
    const name = key(span);
    const occurrence = (comparisonSeen.get(name) ?? 0) + 1;
    comparisonSeen.set(name, occurrence);
    if (!used.has(index)) rows.push({ comparison: span, occurrence, repeated: totals.get(name)! > 1 });
  });
  return rows;
}
