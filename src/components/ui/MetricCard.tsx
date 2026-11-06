import type { ReactNode } from 'react';

/**
 * value 与 delta 由调用方格式化；tone 表示业务上的好坏，不由 delta 正负推断。
 * 比较说明固定为 "vs. previous period"，不适用于没有上期对比的指标。
 */
export function MetricCard({ label, value, delta, tone = 'good', icon }: {
  label: string; value: string; delta: string; tone?: 'good' | 'neutral' | 'bad'; icon: ReactNode;
}) {
  return (
    <div className="metric-card">
      <div className="metric-card-top"><span>{label}</span><span className="metric-icon">{icon}</span></div>
      <div className="metric-value">{value}</div>
      <div className="metric-footer"><span className={`metric-delta ${tone}`}>{delta}</span><span>vs. previous period</span></div>
    </div>
  );
}
