import type { TraceStatus } from '../../types/observability';

export function StatusBadge({ status }: { status: TraceStatus }) {
  const label = { ok: 'Success', error: 'Error', warning: 'Warning' }[status];
  return <span className={`status status-${status}`}><span className="status-dot" />{label}</span>;
}
