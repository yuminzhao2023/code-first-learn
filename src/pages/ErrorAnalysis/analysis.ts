/**
 * 异常分析页私有的关联与聚合规则，对应 docs/features/done/error-analysis.md。
 * 显式接收输入，不读取固定样例或依赖 React，便于独立评审统计口径。
 */
import type { ErrorEvent } from '../../data/errors';
import type { Trace } from '../../types/observability';

export interface ErrorAnalysisEvent extends ErrorEvent {
  service: string;
  model: Trace['model'];
  operation: string;
}

// 显式指定排序语言，避免运行环境的默认语言改变并列项顺序。
export const compareNames = (a: string, b: string) => a.localeCompare(b, 'en');

/** 只关联失败 Trace；服务、模型和操作以 Trace 为准，孤立记录及 warning 不参与统计。 */
export function buildErrorEvents(
  errorRecords: readonly ErrorEvent[],
  traceRecords: readonly Trace[],
): ErrorAnalysisEvent[] {
  return errorRecords.flatMap((event) => {
    const trace = traceRecords.find(
      (trace) => trace.id === event.traceId && trace.status === 'error',
    );
    return trace
      ? [
          {
            ...event,
            service: trace.service,
            model: trace.model,
            operation: trace.operation,
          },
        ]
      : [];
  });
}

// 元组序列化保留字段边界，避免字段内分隔符导致不同分组使用同一个键。
const groupKey = (event: ErrorAnalysisEvent) =>
  JSON.stringify([event.type, event.service, event.model]);

/** 按维度统计不同 Trace 的失败次数；次数降序、名称升序，也用于选择最常见异常。 */
export function countBy(
  rows: readonly ErrorAnalysisEvent[],
  field: 'type' | 'service' | 'model',
) {
  const counts = new Map<string, Set<string>>();
  for (const row of rows) {
    const ids = counts.get(row[field]) ?? new Set<string>();
    // 同一失败执行的多个 Span/重复记录不能放大失败次数。
    ids.add(row.traceId);
    counts.set(row[field], ids);
  }
  return [...counts]
    .map(([name, ids]) => ({ name, count: ids.size }))
    .sort((a, b) => b.count - a.count || compareNames(a.name, b.name));
}

/**
 * 输入应为当前筛选结果；按异常类型、服务、模型分组，组内每个 Trace 保留最新事件。
 * 时间相同时按 message 升序选取，避免到达顺序影响结果。
 * 关联执行按时间倒序，items[0] 因而同时提供最近时间与最新错误信息。
 * 只排序新建的分组数组，不改变输入顺序。
 */
export function groupEvents(
  rows: readonly ErrorAnalysisEvent[],
  ascending: boolean,
) {
  const groups = new Map<string, Map<string, ErrorAnalysisEvent>>();
  for (const row of rows) {
    const key = groupKey(row);
    const items = groups.get(key) ?? new Map<string, ErrorAnalysisEvent>();
    const previous = items.get(row.traceId);
    if (
      !previous ||
      Date.parse(row.occurredAt) > Date.parse(previous.occurredAt) ||
      (Date.parse(row.occurredAt) === Date.parse(previous.occurredAt) &&
        compareNames(row.message, previous.message) < 0)
    ) {
      items.set(row.traceId, row);
    }
    groups.set(key, items);
  }

  return (
    [...groups]
      .map(([key, items]) => ({
        key,
        items: [...items.values()].sort(
          (a, b) =>
            Date.parse(b.occurredAt) - Date.parse(a.occurredAt) ||
            compareNames(a.traceId, b.traceId),
        ),
      }))
      // 升降序只作用于次数；并列时始终按最近时间降序，再按分组键升序。
      .sort(
        (a, b) =>
          (ascending ? 1 : -1) * (a.items.length - b.items.length) ||
          Date.parse(b.items[0].occurredAt) -
            Date.parse(a.items[0].occurredAt) ||
          compareNames(a.key, b.key),
      )
  );
}
