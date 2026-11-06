import { useState } from 'react';
import { Link } from 'react-router';
import { traces } from '../../data/mock';
import type { Trace } from '../../types/observability';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { milliseconds } from '../../lib/format';
import { alignSteps, describeChange, describePercent } from './comparison';
import './TraceCompare.css';
import { TracePicker } from './TracePicker';

function Execution({ trace, label }: { trace: Trace; label: string }) {
  return <section className="compare-execution" aria-label={label}>
    <h3>{label}</h3><strong>{trace.operation}</strong><p className="mono">{trace.id}</p>
    <dl><dt>Service</dt><dd>{trace.service}</dd><dt>Model</dt><dd>{trace.model}</dd><dt>Status</dt><dd><StatusBadge status={trace.status}/></dd>
      <dt>Total duration</dt><dd>{milliseconds(trace.durationMs)}</dd><dt>Token</dt><dd>{trace.tokens.toLocaleString('en-US')}</dd></dl>
    <Link to={`/?trace=${encodeURIComponent(trace.id)}`}>View {label} Trace →</Link>
  </section>;
}

export function TraceCompare() {
  const [baseId, setBaseId] = useState('');
  const [comparisonId, setComparisonId] = useState('');
  const base = traces.find(trace => trace.id === baseId);
  const candidates = base ? traces.filter(trace => trace.operation === base.operation && trace.id !== base.id) : [];
  const comparison = candidates.find(trace => trace.id === comparisonId);
  const ready = base && comparison;
  const rows = ready ? alignSteps(base.spans, comparison.spans) : [];

  function selectBase(id: string) {
    const next = traces.find(trace => trace.id === id);
    if (!next || !comparison || comparison.id === id || comparison.operation !== next.operation) setComparisonId('');
    setBaseId(id);
  }

  return <div className="trace-compare">
    <div className="eyebrow"><span className="eyebrow-line"/> EXECUTION COMPARISON <span className="eyebrow-tag">FIXED MOCK</span></div>
    <div className="page-heading"><div><h1>Trace Compare</h1><p>Compare duration and steps across two runs of the same operation · Fixed samples</p></div></div>
    <Card title="Select runs" subtitle="Select a baseline and compare another run against it">
      <div className="compare-controls">
        <TracePicker label="Baseline run" traces={traces} value={baseId} onChange={selectBase}/>
        <TracePicker label="Comparison run" traces={candidates} value={comparison?.id ?? ''} disabled={!base || candidates.length === 0} describedBy="comparison-help" onChange={setComparisonId}/>
        <Button disabled={!ready} onClick={() => { setBaseId(comparisonId); setComparisonId(baseId); }}>Swap runs</Button>
      </div>
      <p id="comparison-help" className="compare-help">{!base ? 'Select a baseline first. Select both runs to enable swapping.' : !candidates.length ? 'No other runs are available for this operation.' : 'Compare runs of the same operation with different IDs. Search by operation or Trace ID, or choose Clear selection.'}</p>
    </Card>
    <Card title="Overall comparison" subtitle="Change = comparison − baseline. Duration uses the Trace total, not the sum of spans.">
      {!ready ? <p className="compare-empty">Select a baseline and comparison run to view metrics.</p> : <>
        <div className="compare-columns"><Execution trace={base} label="Baseline run"/><Execution trace={comparison} label="Comparison run"/></div>
        <div className="compare-deltas">{([{ field: 'durationMs', label: 'Duration change', unit: 'ms' }, { field: 'tokens', label: 'Token change', unit: 'Token' }] as const).map(({ field, label, unit }) =>
          <section key={field} aria-label={label}><h3>{label}</h3><strong>{describeChange(base[field], comparison[field], unit)}</strong><p>{describePercent(base[field], comparison[field])}</p></section>
        )}</div>
        <p className="compare-help">Changes describe sample values only; they do not indicate errors, quality improvements, or production performance.</p>
      </>}
    </Card>
    <Card title="Step comparison" subtitle="Steps align by type, name, and occurrence, not by inferred call relationships.">
      {!ready ? <p className="compare-empty">Select two runs to compare steps.</p> : rows.length === 0 ? <p className="compare-empty">No steps to compare.</p> :
        <div className="table-scroll" role="region" aria-label="Step comparison table" tabIndex={0}><table className="data-table compare-table"><thead><tr><th>Step / Type</th><th className="text-right">Baseline duration</th><th className="text-right">Comparison duration</th><th className="text-right">Duration change</th><th>Alignment</th></tr></thead>
          <tbody>{rows.map((row, index) => { const span = row.base ?? row.comparison!; return <tr key={index}><td><span className="mono">{span.label}{row.repeated ? ` #${row.occurrence}` : ''}</span><small>{span.kind}</small></td><td className="text-right mono">{row.base ? milliseconds(row.base.durationMs) : '—'}</td><td className="text-right mono">{row.comparison ? milliseconds(row.comparison.durationMs) : '—'}</td><td className="text-right">{row.base && row.comparison ? describeChange(row.base.durationMs, row.comparison.durationMs, 'ms') : '—'}</td><td>{row.base ? row.comparison ? 'Matched' : 'Removed' : 'Added'}</td></tr>; })}</tbody>
        </table></div>}
    </Card>
  </div>;
}
