import type { ReactNode } from 'react';

type MetricCardProps = {
  label: string;
  value: string;
  icon: ReactNode;
} & (
  | { delta: string; tone?: 'good' | 'neutral' | 'bad'; note?: never }
  | { delta?: never; tone?: never; note: string }
);

/**
 * value 与 delta 由调用方格式化；tone 表示业务上的好坏，不由 delta 正负推断。
 * 有 delta 时比较说明固定为 "vs. previous period"；无上期对比时必须提供 note。
 */
export function MetricCard({
  label,
  value,
  delta,
  tone = 'good',
  note,
  icon,
}: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="metric-card-top">
        <span>{label}</span>
        <span className="metric-icon">{icon}</span>
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-footer">
        {delta !== undefined ? (
          <>
            <span className={`metric-delta ${tone}`}>{delta}</span>
            <span>vs. previous period</span>
          </>
        ) : (
          <span>{note}</span>
        )}
      </div>
    </div>
  );
}
