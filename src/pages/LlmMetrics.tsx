import { useMemo, useState } from 'react';
import { latencyDaily, modelStats, requestsDaily } from '../data/mock';
import { compact, dollars, milliseconds } from '../lib/format';
import type { Model } from '../types/observability';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { MetricCard } from '../components/ui/MetricCard';
import { LatencyChart } from '../components/observability/LatencyChart';

export function LlmMetrics() {
  const [model, setModel] = useState<'all' | Model>('all');
  const visible = useMemo(() => modelStats.filter(row => model === 'all' || row.name === model), [model]);
  const summed = useMemo(() => visible.reduce((result, item) => ({
    requests: result.requests + item.requests, costUsd: result.costUsd + item.costUsd, tokens: result.tokens + item.tokens,
    weightedLatency: result.weightedLatency + item.p95 * item.requests, weightedErrors: result.weightedErrors + item.errorsPercent * item.requests,
  }), { requests: 0, costUsd: 0, tokens: 0, weightedLatency: 0, weightedErrors: 0 }), [visible]);
  const p95 = summed.requests ? Math.round(summed.weightedLatency / summed.requests) : 0;
  const errorRate = summed.requests ? (summed.weightedErrors / summed.requests).toFixed(1) : '0';

  return (
    <>
      <div className="eyebrow"><span className="eyebrow-line"/> MODEL OPERATIONS <span className="eyebrow-tag">PHASE 2</span></div>
      <div className="page-heading"><div><h1>LLM Metrics</h1><p>Track request volume, latency, token consumption, and cost.</p></div><div className="heading-actions"><label className="filter-select metrics-model-filter"><span className="sr-only">Filter by model</span><select aria-label="Filter by model" value={model} onChange={e => setModel(e.target.value as typeof model)}><option value="all">All models</option>{modelStats.map(item => <option key={item.name} value={item.name}>{item.name}</option>)}</select><Icon name="chevron" size={14}/></label></div></div>
      <div className="metrics-grid">
        <MetricCard label="Total Requests" value={compact(summed.requests)} delta="+11.7%" icon={<Icon name="layers" size={19}/>}/>
        <MetricCard label="P95 Latency" value={milliseconds(p95)} delta="-6.4%" icon={<Icon name="clock" size={19}/>}/>
        <MetricCard label="Estimated Cost" value={dollars(summed.costUsd)} delta="+4.2%" tone="neutral" icon={<Icon name="chart" size={19}/>}/>
        <MetricCard label="Error Rate" value={`${errorRate}%`} delta="-0.3%" icon={<Icon name="shield" size={19}/>}/>
      </div>
      <div className="metrics-panels">
        <Card title="Latency Trend" subtitle="Daily average response time · fixed sample" action={<span className="mini-label"><i className="legend-dot llm"/>Latency (ms)</span>}><LatencyChart data={latencyDaily}/></Card>
        <Card title="Request Activity" subtitle="Requests per day · 14-day trend" action={<span className="mini-label"><i className="legend-dot agent"/>Requests</span>}><div className="bar-chart" role="img" aria-label="14-day request activity bar chart">{requestsDaily.map((n, i) => <div key={i} className="bar-chart-col" title={`${n} requests`}><span style={{ height: `${n}%` }}/></div>)}</div><div className="bar-chart-footer"><span>Oct 21</span><span>Nov 03</span></div></Card>
      </div>
      <Card title="Model Breakdown" subtitle="Cost and performance by model · sample data" action={<span className="table-count">{visible.length} models</span>}>
        <div className="table-scroll"><table className="data-table model-table"><thead><tr><th>Model</th><th className="text-right">Requests</th><th className="text-right">P95 latency</th><th className="text-right">Error rate</th><th className="text-right">Total tokens</th><th className="text-right">Cost</th></tr></thead><tbody>{visible.map(item => <tr key={item.name}><td><span className="model-badge"><Icon name="bolt" size={15}/>{item.name}</span></td><td className="text-right mono">{compact(item.requests)}</td><td className="text-right mono">{milliseconds(item.p95)}</td><td className="text-right"><span className={item.errorsPercent > 2 ? 'text-danger' : 'text-success'}>{item.errorsPercent.toFixed(1)}%</span></td><td className="text-right mono">{compact(item.tokens)}</td><td className="text-right mono">{dollars(item.costUsd)}</td></tr>)}</tbody></table></div>
      </Card>
      <div className="learning-note"><Icon name="shield" size={17}/><span><strong>Design system evolution:</strong> This page reuses the shell, tokens, cards, badges, and table styling. It adds <code>MetricCard</code> and domain-specific charts. These charts are illustrative, not real telemetry.</span></div>
    </>
  );
}
