import { useMemo, useState } from 'react';
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

export function TraceExplorer() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | TraceStatus>('all');
  const [selectedId, setSelectedId] = useState(traces[0].id);
  const filtered = useMemo(() => traces.filter(t =>
    (status === 'all' || t.status === status) &&
    `${t.operation} ${t.id} ${t.service} ${t.model}`.toLowerCase().includes(search.trim().toLowerCase())
  ), [search, status]);
  const selected = filtered.find(t => t.id === selectedId) ?? filtered[0];

  return (
    <>
      <div className="eyebrow"><span className="eyebrow-line"/> DISTRIBUTED TRACING <span className="eyebrow-tag">FIXED MOCK</span></div>
      <div className="page-heading"><div><h1>Trace Explorer</h1><p>Inspect agent runs, tool calls, and LLM performance in one place.</p></div><div className="heading-actions"><span className="period-control"><Icon name="clock" size={15}/>Last 24 hours<Icon name="chevron" size={14}/></span><Button variant="primary" onClick={() => { setSearch(''); setStatus('all'); setSelectedId(traces[0].id); }}><Icon name="filter" size={15}/> Reset filters</Button></div></div>
      <div className="metrics-grid">
        <MetricCard label="Total Traces" value="29,060" delta="+12.8%" icon={<Icon name="layers" size={19}/>}/>
        <MetricCard label="Success Rate" value="98.4%" delta="+0.6%" icon={<Icon name="shield" size={19}/>}/>
        <MetricCard label="Avg. Duration" value="1.84s" delta="-8.2%" icon={<Icon name="clock" size={19}/>}/>
        <MetricCard label="Total Tokens" value="61.8M" delta="+14.3%" icon={<Icon name="bolt" size={19}/>}/>
      </div>
      <Card title="Recent Traces" subtitle="Explore the latest recorded agent executions" className="trace-card" action={<span className="table-count">{filtered.length} of {traces.length} sample traces</span>}>
        <div className="table-toolbar"><label className="search-field"><Icon name="search" size={17}/><span className="sr-only">Search traces</span><input aria-label="Search traces" placeholder="Search operation, trace ID, service…" value={search} onChange={e => setSearch(e.target.value)}/><span className="kbd">/</span></label><label className="filter-select"><Icon name="filter" size={16}/><span className="sr-only">Filter by status</span><select aria-label="Filter by status" value={status} onChange={e => setStatus(e.target.value as typeof status)}><option value="all">All statuses</option><option value="ok">Success</option><option value="error">Error</option><option value="warning">Warning</option></select><Icon name="chevron" size={14}/></label></div>
        <TraceTable rows={filtered} selectedId={selected?.id ?? ''} onSelect={setSelectedId}/>
      </Card>
      <div className="section-between"><div><h2>Trace inspection</h2><p>Click an operation above to inspect its span timeline.</p></div><span className="section-hint">SPAN VIEW</span></div>
      {selected ? (
        <div className="inspection-grid">
          <Card title="Span Waterfall" subtitle={`${selected.operation} · ${selected.id}`} className="waterfall-card" action={<StatusBadge status={selected.status}/>}><TraceWaterfall trace={selected}/></Card>
          <Card title="Trace Details" subtitle="Selected execution context" className="detail-card"><dl className="details-list"><div><dt>Trace ID</dt><dd className="mono">{selected.id}</dd></div><div><dt>Service</dt><dd>{selected.service}</dd></div><div><dt>Model</dt><dd>{selected.model}</dd></div><div><dt>Duration</dt><dd className="mono">{milliseconds(selected.durationMs)}</dd></div><div><dt>Token usage</dt><dd>{selected.tokens.toLocaleString('en-US')}</dd></div><div><dt>Spans</dt><dd>{selected.spans.length}</dd></div></dl><div className="info-callout"><Icon name="pulse" size={16}/><span>These are deterministic sample traces. Connect an OTel source as a separate exercise.</span></div></Card>
        </div>
      ) : <div className="empty-panel">No trace selected. Clear the filters to inspect a sample.</div>}
    </>
  );
}
