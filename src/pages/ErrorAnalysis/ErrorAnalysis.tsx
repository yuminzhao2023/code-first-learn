import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { errorEvents } from '../../data/errors';
import { traces } from '../../data/mock';
import {
  buildErrorEvents,
  compareNames,
  countBy,
  groupEvents,
} from './analysis';
import './ErrorAnalysis.css';

// 固定样例在模块加载时关联一次；选项始终来自完整数据，避免选项随筛选结果消失。
const events = buildErrorEvents(errorEvents, traces);
const services = [...new Set(events.map((event) => event.service))].sort(
  compareNames,
);
const models = [...new Set(events.map((event) => event.model))].sort(
  compareNames,
);

// 样例统一采用 +08:00；直接展示记录时间，避免截图随浏览器时区变化。
const displayTime = (value: string) =>
  `${value.slice(0, 10)} ${value.slice(11, 19)} UTC+8`;

export function ErrorAnalysis() {
  const [search, setSearch] = useState('');
  const [service, setService] = useState('all');
  const [model, setModel] = useState('all');
  const [dimension, setDimension] = useState<'service' | 'model'>('service');
  const [ascending, setAscending] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | undefined>();

  // 所有数据区域共享同一筛选结果，避免概览、分布与详情的统计范围不一致。
  const query = search.trim().toLowerCase();
  const visible = events.filter(
    (event) =>
      (service === 'all' || event.service === service) &&
      (model === 'all' || event.model === model) &&
      [event.type, event.message, event.service, event.traceId].some((value) =>
        value.toLowerCase().includes(query),
      ),
  );
  const groups = groupEvents(visible, ascending);
  const selected =
    groups.find((group) => group.key === selectedKey) ?? groups[0];

  // 筛选移除选择时记住首组；清除筛选后不应恢复已经失效的旧选择。
  // 仅在键变化时更新自身状态，下一次渲染即稳定；排序和维度切换不改变选择。
  if (selectedKey !== selected?.key) setSelectedKey(selected?.key);

  const common = countBy(visible, 'type')[0];
  const distribution = countBy(visible, dimension);
  const total = new Set(visible.map((event) => event.traceId)).size;
  const reset = () => {
    setSearch('');
    setService('all');
    setModel('all');
    setDimension('service');
    setAscending(false);
    setSelectedKey(undefined);
  };

  return (
    <div className="error-analysis">
      <div className="eyebrow">
        <span className="eyebrow-line" /> FAILURE DIAGNOSTICS{' '}
        <span className="eyebrow-tag">FIXED MOCK</span>
      </div>
      <div className="page-heading">
        <div>
          <h1>Error Analysis</h1>
          <p>Find frequent failures and inspect the executions behind them.</p>
        </div>
        <span className="period-control">
          <Icon name="clock" size={15} />
          Nov 03, 2026 · 10:00–11:00 UTC+8
        </span>
      </div>

      <div className="error-summary" aria-label="Error overview">
        <div className="metric-card">
          <div className="metric-card-top">
            Failed executions <Icon name="shield" />
          </div>
          <div className="metric-value text-danger" data-testid="failed-count">
            {total}
          </div>
          <p>Distinct failed traces · fixed sample</p>
        </div>
        <div className="metric-card">
          <div className="metric-card-top">
            Affected services <Icon name="layers" />
          </div>
          <div className="metric-value" data-testid="service-count">
            {new Set(visible.map((event) => event.service)).size}
          </div>
          <p>Services in the current results</p>
        </div>
        <div className="metric-card">
          <div className="metric-card-top">
            Most common exception <Icon name="bolt" />
          </div>
          <div className="error-common" data-testid="common-error">
            {common?.name ?? 'No exceptions'}
          </div>
          <p>
            {common
              ? `${common.count} failed executions`
              : 'No matching failures'}
          </p>
        </div>
      </div>

      <div className="error-filters">
        <label className="search-field">
          <Icon name="search" />
          <span className="sr-only">Search errors</span>
          <input
            aria-label="Search errors"
            placeholder="Search exception, message, service, trace ID…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label className="filter-select">
          <span className="sr-only">Filter by service</span>
          <select
            aria-label="Filter by service"
            value={service}
            onChange={(event) => setService(event.target.value)}
          >
            <option value="all">All services</option>
            {services.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label className="filter-select">
          <span className="sr-only">Filter by model</span>
          <select
            aria-label="Filter by model"
            value={model}
            onChange={(event) => setModel(event.target.value)}
          >
            <option value="all">All models</option>
            {models.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <Button onClick={reset}>
          <Icon name="filter" size={15} />
          Reset filters
        </Button>
      </div>

      <Card
        title="Failure Distribution"
        subtitle="Distinct failed executions in the current results"
        action={
          <div className="error-dimensions" aria-label="Distribution dimension">
            {(['service', 'model'] as const).map((value) => (
              <Button
                key={value}
                variant="ghost"
                aria-pressed={dimension === value}
                onClick={() => setDimension(value)}
              >
                By {value}
              </Button>
            ))}
          </div>
        }
      >
        <div className="error-bars" aria-label={`Failures by ${dimension}`}>
          {distribution.map((item) => (
            <div className="error-bar" key={item.name}>
              <span>{item.name}</span>
              <div className="error-track" aria-hidden="true">
                <div
                  style={{
                    width: `${(item.count / distribution[0].count) * 100}%`,
                  }}
                />
              </div>
              <strong>{item.count}</strong>
            </div>
          ))}
          {!distribution.length && <p>No matching failure distribution.</p>}
        </div>
      </Card>

      <div className="error-workspace">
        <Card
          title="Exceptions"
          subtitle={`${groups.length} groups · ${total} failed executions`}
        >
          <div className="table-scroll">
            <table className="data-table error-table">
              <thead>
                <tr>
                  <th>Exception type</th>
                  <th>Service</th>
                  <th>Model</th>
                  <th aria-sort={ascending ? 'ascending' : 'descending'}>
                    <Button
                      variant="ghost"
                      aria-label="Toggle failure count sort"
                      onClick={() => setAscending((value) => !value)}
                    >
                      Failures {ascending ? '↑' : '↓'}
                    </Button>
                  </th>
                  <th>Last seen</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => {
                  const latest = group.items[0];
                  return (
                    <tr
                      key={group.key}
                      className={selected?.key === group.key ? 'selected' : ''}
                    >
                      <td>
                        <Button
                          variant="ghost"
                          aria-pressed={selected?.key === group.key}
                          onClick={() => setSelectedKey(group.key)}
                        >
                          {latest.type}
                        </Button>
                      </td>
                      <td>{latest.service}</td>
                      <td>{latest.model}</td>
                      <td className="mono">{group.items.length}</td>
                      <td>
                        <time
                          dateTime={latest.occurredAt}
                          title={displayTime(latest.occurredAt)}
                        >
                          {latest.occurredAt.slice(11, 19)} UTC+8
                        </time>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!groups.length && (
            <div className="empty-panel">
              No matching exceptions. Adjust filters or reset to see sample
              failures.
            </div>
          )}
        </Card>

        <Card
          title="Exception Details"
          subtitle="Selected group and matching executions"
        >
          {selected ? (
            <div className="error-detail">
              <h3>{selected.items[0].type}</h3>
              <p>
                {selected.items[0].service} · {selected.items[0].model} ·{' '}
                {selected.items.length} failures
              </p>
              <h4>Latest error message</h4>
              <pre>{selected.items[0].message}</pre>
              <h4>Related executions</h4>
              <ul className="error-executions">
                {selected.items.map((event) => (
                  <li key={event.traceId}>
                    <time dateTime={event.occurredAt}>
                      {displayTime(event.occurredAt)}
                    </time>
                    <div>{event.operation}</div>
                    <code>{event.traceId}</code>
                    <Link to={`/?trace=${encodeURIComponent(event.traceId)}`}>
                      View Trace <Icon name="external" size={14} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="empty-panel">No exception selected.</div>
          )}
        </Card>
      </div>
      <p className="error-note">
        All failures and execution data are deterministic fixtures, not
        production measurements.
      </p>
    </div>
  );
}
