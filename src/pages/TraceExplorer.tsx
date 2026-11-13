import { useMemo, useState } from 'react';
import './TraceExplorer.css';
import { useSearchParams } from 'react-router';
import { traces } from '../data/mock';
import { milliseconds } from '../lib/format';
import type { TraceStatus } from '../types/observability';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { TraceTable } from '../components/observability/TraceTable';
import { TraceWaterfall } from '../components/observability/TraceWaterfall';

const PAGE_SIZE = 5;

interface TraceExplorerState {
  page: number;
  traceId: string | null;
  search: string;
  status: 'all' | TraceStatus;
  selectedId: string;
}

export function TraceExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const traceId = searchParams.get('trace');
  const linkedTrace = traces.find((trace) => trace.id === traceId);
  const defaults: TraceExplorerState = {
    traceId,
    page: 1,
    search: linkedTrace?.id ?? '',
    status: 'all',
    selectedId: linkedTrace?.id ?? traces[0].id,
  };
  const [state, setState] = useState(defaults);
  // 本地筛选属于对应的 URL 上下文；前进/后退切换参数时使用该链接的默认范围。
  // 派生当前状态，避免路由异步更新时用旧参数覆盖刚输入的搜索内容。
  const current = state.traceId === traceId ? state : defaults;
  const { search, status, selectedId } = current;
  const filtered = useMemo(
    () =>
      traces.filter(
        (t) =>
          (!linkedTrace || t.id === linkedTrace.id) &&
          (status === 'all' || t.status === status) &&
          `${t.operation} ${t.id} ${t.service} ${t.model}`
            .toLowerCase()
            .includes(search.trim().toLowerCase()),
      ),
    [search, status, linkedTrace],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(current.page, pageCount);
  const pageStart = (page - 1) * PAGE_SIZE;
  const visibleTraces = filtered.slice(pageStart, pageStart + PAGE_SIZE);
  // 详情始终对应当前页的可见记录；翻页后优先选择该页首条。
  const selected =
    visibleTraces.find((t) => t.id === selectedId) ?? visibleTraces[0];

  // 编辑搜索或重置代表离开链接的精确定位范围；保留其他参数，并避免产生逐字历史记录。
  const clearTraceParameter = () => {
    if (traceId === null) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('trace');
    setSearchParams(nextParams, { replace: true });
  };
  const updateSearch = (value: string) => {
    setState({ ...current, traceId: null, page: 1, search: value });
    clearTraceParameter();
  };
  const resetFilters = () => {
    setState({
      traceId: null,
      page: 1,
      search: '',
      status: 'all',
      selectedId: traces[0].id,
    });
    clearTraceParameter();
  };

  return (
    <>
      <div className="eyebrow">
        <span className="eyebrow-line" /> DISTRIBUTED TRACING{' '}
        <span className="eyebrow-tag">FIXED MOCK</span>
      </div>
      <div className="page-heading">
        <div>
          <h1>Trace Explorer</h1>
          <p>
            Inspect agent runs, tool calls, and LLM performance in one place.
          </p>
        </div>
        <div className="heading-actions">
          <Button variant="primary" onClick={resetFilters}>
            <Icon name="filter" size={15} /> Reset filters
          </Button>
        </div>
      </div>
      <div className="metrics-grid">
        <MetricCard
          label="Total Traces"
          value="29,060"
          delta="+12.8%"
          icon={<Icon name="layers" size={19} />}
        />
        <MetricCard
          label="Success Rate"
          value="98.4%"
          delta="+0.6%"
          icon={<Icon name="shield" size={19} />}
        />
        <MetricCard
          label="Avg. Duration"
          value="1.84s"
          delta="-8.2%"
          icon={<Icon name="clock" size={19} />}
        />
        <MetricCard
          label="Total Tokens"
          value="61.8M"
          delta="+14.3%"
          icon={<Icon name="bolt" size={19} />}
        />
      </div>
      <Card
        title="Recent Traces"
        subtitle="Explore the latest recorded agent executions"
        className="trace-card"
        action={
          <span className="table-count">
            {filtered.length} of {traces.length} sample traces
          </span>
        }
      >
        <div className="table-toolbar">
          <label className="search-field">
            <Icon name="search" size={17} />
            <span className="sr-only">Search traces</span>
            <input
              aria-label="Search traces"
              placeholder="Search operation, trace ID, service…"
              value={search}
              onChange={(e) => updateSearch(e.target.value)}
            />
          </label>
          <label className="filter-select">
            <Icon name="filter" size={16} />
            <span className="sr-only">Filter by status</span>
            <select
              aria-label="Filter by status"
              value={status}
              onChange={(e) =>
                setState({
                  ...current,
                  page: 1,
                  status: e.target.value as typeof status,
                })
              }
            >
              <option value="all">All statuses</option>
              <option value="ok">Success</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
            </select>
            <Icon name="chevron" size={14} />
          </label>
        </div>
        <TraceTable
          rows={visibleTraces}
          selectedId={selected?.id ?? ''}
          onSelect={(id) => setState({ ...current, selectedId: id })}
        />
        {pageCount > 1 && (
          <nav className="trace-pagination" aria-label="Trace pagination">
            <span role="status">
              {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, filtered.length)}{' '}
              of {filtered.length} traces
            </span>
            <div className="trace-pagination-controls">
              <Button
                disabled={page === 1}
                onClick={() => setState({ ...current, page: page - 1 })}
              >
                Previous
              </Button>
              <span aria-current="page">
                Page {page} of {pageCount}
              </span>
              <Button
                disabled={page === pageCount}
                onClick={() => setState({ ...current, page: page + 1 })}
              >
                Next
              </Button>
            </div>
          </nav>
        )}
      </Card>
      <div className="section-between">
        <div>
          <h2>Trace inspection</h2>
          <p>Click an operation above to inspect its span timeline.</p>
        </div>
        <span className="section-hint">SPAN VIEW</span>
      </div>
      {selected ? (
        <div className="inspection-grid">
          <Card
            title="Span Waterfall"
            subtitle={`${selected.operation} · ${selected.id}`}
            className="waterfall-card"
            action={<StatusBadge status={selected.status} />}
          >
            <TraceWaterfall trace={selected} />
          </Card>
          <Card
            title="Trace Details"
            subtitle="Selected execution context"
            className="detail-card"
          >
            <dl className="details-list">
              <div>
                <dt>Trace ID</dt>
                <dd className="mono">{selected.id}</dd>
              </div>
              <div>
                <dt>Service</dt>
                <dd>{selected.service}</dd>
              </div>
              <div>
                <dt>Model</dt>
                <dd>{selected.model}</dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd className="mono">{milliseconds(selected.durationMs)}</dd>
              </div>
              <div>
                <dt>Token usage</dt>
                <dd>{selected.tokens.toLocaleString('en-US')}</dd>
              </div>
              <div>
                <dt>Spans</dt>
                <dd>{selected.spans.length}</dd>
              </div>
            </dl>
            <div className="info-callout">
              <Icon name="pulse" size={16} />
              <span>
                These are deterministic sample traces. Connect an OTel source as
                a separate exercise.
              </span>
            </div>
          </Card>
        </div>
      ) : (
        <div className="empty-panel">
          No trace selected. Clear the filters to inspect a sample.
        </div>
      )}
    </>
  );
}
