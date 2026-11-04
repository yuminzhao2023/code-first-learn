export function LatencyChart({ data, color = 'var(--color-accent)' }: { data: number[]; color?: string }) {
  const w = 800, h = 210, xPad = 12, yPad = 14;
  const max = Math.max(...data) * 1.12;
  const min = Math.min(...data) * 0.8;
  const points = data.map((n, i) => {
    const x = xPad + (i / (data.length - 1)) * (w - xPad * 2);
    const y = yPad + (1 - (n - min) / (max - min)) * (h - yPad * 2);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const linePath = `M ${points.join(' L ')}`;
  const fillPath = `${linePath} L ${w - xPad},${h} L ${xPad},${h} Z`;
  return (
    <div className="chart-wrap">
      <div className="chart-y-label"><span>{Math.round(max)}</span><span>{Math.round((max + min) / 2)}</span><span>{Math.round(min)}</span></div>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img" aria-label="14-day latency trend line chart">
        <defs><linearGradient id="latencyFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b82ff" stopOpacity="0.26"/><stop offset="100%" stopColor="#8b82ff" stopOpacity="0"/></linearGradient></defs>
        {[0.15, 0.45, 0.75].map(frac => <line key={frac} x1="0" x2={w} y1={h * frac} y2={h * frac} stroke="var(--color-border)" strokeDasharray="5 7"/>) }
        <path d={fillPath} fill="url(#latencyFade)"/><path d={linePath} fill="none" stroke={color} strokeWidth="3.4" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div className="chart-x-label"><span>Oct 21</span><span>Oct 25</span><span>Oct 29</span><span>Nov 03</span></div>
    </div>
  );
}
