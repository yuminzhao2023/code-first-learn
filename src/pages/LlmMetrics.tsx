import { useMemo, useState } from 'react';
import {
  latencyDaily,
  modelStats,
  requestsDaily,
  trendDates,
} from '../data/mock';
import { compact, dollars, milliseconds } from '../lib/format';
import type { Model } from '../types/observability';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { MetricCard } from '../components/ui/MetricCard';
import { LatencyChart } from '../components/observability/LatencyChart';

export function LlmMetrics() {
  const [model, setModel] = useState<'all' | Model>('all');
  const [sortCostDescending, setSortCostDescending] = useState(false);
  const visible = useMemo(
    () => modelStats.filter((row) => model === 'all' || row.name === model),
    [model],
  );
  const sortedRows = useMemo(
    () =>
      sortCostDescending
        ? [...visible].sort((a, b) => b.costUsd - a.costUsd)
        : visible,
    [visible, sortCostDescending],
  );
  const summed = useMemo(
    () =>
      visible.reduce(
        (result, item) => ({
          requests: result.requests + item.requests,
          costUsd: result.costUsd + item.costUsd,
          tokens: result.tokens + item.tokens,
          weightedErrors:
            result.weightedErrors + item.errorsPercent * item.requests,
        }),
        { requests: 0, costUsd: 0, tokens: 0, weightedErrors: 0 },
      ),
    [visible],
  );
  // Model quantiles cannot be averaged into an overall quantile. The fixtures do
  // not include request-level latency samples or a mergeable histogram.
  const p95 = model === 'all' ? undefined : visible[0]?.p95;
  const errorRate = summed.requests
    ? (summed.weightedErrors / summed.requests).toFixed(1)
    : '0';
  const sampleNote =
    model === 'all'
      ? 'All models · fixed sample'
      : 'Selected model · fixed sample';

  return (
    <>
      <div className="eyebrow">
        <span className="eyebrow-line" /> MODEL OPERATIONS{' '}
        <span className="eyebrow-tag">PHASE 2</span>
      </div>
      <div className="page-heading">
        <div>
          <h1>LLM Metrics</h1>
          <p>Track request volume, latency, token consumption, and cost.</p>
        </div>
        <div className="heading-actions">
          <label className="filter-select metrics-model-filter">
            <span className="sr-only">Filter by model</span>
            <select
              aria-label="Filter by model"
              value={model}
              onChange={(e) => setModel(e.target.value as typeof model)}
            >
              <option value="all">All models</option>
              {modelStats.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
            <Icon name="chevron" size={14} />
          </label>
        </div>
      </div>
      <div className="metrics-grid">
        <MetricCard
          label="Total Requests"
          value={compact(summed.requests)}
          note={sampleNote}
          icon={<Icon name="layers" size={19} />}
        />
        <MetricCard
          label="P95 Latency"
          value={p95 === undefined ? '—' : milliseconds(p95)}
          note={
            p95 === undefined
              ? 'Requires request-level data'
              : 'Selected model · fixed sample'
          }
          icon={<Icon name="clock" size={19} />}
        />
        <MetricCard
          label="Estimated Cost"
          value={dollars(summed.costUsd)}
          note={sampleNote}
          icon={<Icon name="chart" size={19} />}
        />
        <MetricCard
          label="Error Rate"
          value={`${errorRate}%`}
          note={sampleNote}
          icon={<Icon name="shield" size={19} />}
        />
      </div>
      <div className="metrics-panels">
        <Card
          title="Latency Trend"
          subtitle="Daily average response time · fixed sample"
          action={
            <span className="mini-label">
              <i className="legend-dot llm" />
              Latency (ms)
            </span>
          }
        >
          <LatencyChart data={latencyDaily} dates={trendDates} />
        </Card>
        <Card
          title="Request Activity"
          subtitle="Requests per day · 14-day trend"
          action={
            <span className="mini-label">
              <i className="legend-dot agent" />
              Requests
            </span>
          }
        >
          <div
            className="bar-chart"
            role="img"
            aria-label="14-day request activity bar chart"
          >
            {requestsDaily.map((n, i) => (
              <div key={i} className="bar-chart-col" title={`${n} requests`}>
                <span style={{ height: `${n}%` }} />
              </div>
            ))}
          </div>
          <div className="bar-chart-footer">
            <span>Oct 21</span>
            <span>Nov 03</span>
          </div>
          <div className="sr-only">
            <table>
              <caption>Daily request counts · fixed sample</caption>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Requests</th>
                </tr>
              </thead>
              <tbody>
                {requestsDaily.map((count, index) => (
                  <tr key={trendDates[index]}>
                    <th scope="row">{trendDates[index]}</th>
                    <td>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      <Card
        title="Model Breakdown"
        subtitle="Cost and performance by model · sample data"
        action={<span className="table-count">{visible.length} models</span>}
      >
        <div className="table-scroll">
          <table className="data-table model-table">
            <thead>
              <tr>
                <th>Model</th>
                <th className="text-right">Requests</th>
                <th className="text-right">P95 latency</th>
                <th className="text-right">Error rate</th>
                <th className="text-right">Total tokens</th>
                <th
                  className="text-right"
                  aria-sort={sortCostDescending ? 'descending' : 'none'}
                >
                  <Button
                    variant="ghost"
                    aria-label="Sort by cost descending"
                    onClick={() => setSortCostDescending(true)}
                  >
                    Cost <span aria-hidden="true">↓</span>
                  </Button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((item) => (
                <tr key={item.name}>
                  <td>
                    <span className="model-badge">
                      <Icon name="bolt" size={15} />
                      {item.name}
                    </span>
                  </td>
                  <td className="text-right mono">{compact(item.requests)}</td>
                  <td className="text-right mono">{milliseconds(item.p95)}</td>
                  <td className="text-right">
                    <span
                      className={
                        item.errorsPercent > 2 ? 'text-danger' : 'text-success'
                      }
                    >
                      {item.errorsPercent.toFixed(1)}%
                    </span>
                  </td>
                  <td className="text-right mono">{compact(item.tokens)}</td>
                  <td className="text-right mono">{dollars(item.costUsd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="learning-note">
        <Icon name="shield" size={17} />
        <span>
          <strong>Design system evolution:</strong> This page reuses the shell,
          tokens, cards, badges, and table styling. It adds{' '}
          <code>MetricCard</code> and domain-specific charts. These charts are
          illustrative, not real telemetry.
        </span>
      </div>
    </>
  );
}
