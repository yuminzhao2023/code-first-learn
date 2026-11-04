import type { ReactNode } from 'react';

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
