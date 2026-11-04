import type { Trace } from '../../types/observability';
import { milliseconds } from '../../lib/format';
import { StatusBadge } from '../ui/StatusBadge';

export function TraceTable({ rows, selectedId, onSelect }: { rows: Trace[]; selectedId: string; onSelect: (id: string) => void }) {
  return (
    <div className="table-scroll">
      <table className="data-table"><thead><tr><th>Operation</th><th>Status</th><th>Service</th><th>Model</th><th className="text-right">Duration</th><th className="text-right">Time</th></tr></thead>
        <tbody>
          {rows.map(trace => (
            <tr key={trace.id} className={selectedId === trace.id ? 'selected' : ''}>
              <td><button type="button" aria-pressed={selectedId === trace.id} className="table-op" onClick={() => onSelect(trace.id)}><span className="op-icon">↳</span><span><strong>{trace.operation}</strong><small>{trace.id}</small></span></button></td>
              <td><StatusBadge status={trace.status}/></td><td className="dim-cell">{trace.service}</td><td className="dim-cell">{trace.model}</td>
              <td className="text-right mono">{milliseconds(trace.durationMs)}</td><td className="text-right dim-cell mono">{trace.startedAt}</td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={6} className="empty-state">No traces match your filters.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
