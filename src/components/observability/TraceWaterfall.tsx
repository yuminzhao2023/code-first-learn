import type { Trace } from '../../types/observability';
import { milliseconds } from '../../lib/format';

export function TraceWaterfall({ trace }: { trace: Trace }) {
  const gridTicks = [0, 25, 50, 75, 100];
  return (
    <div className="waterfall" role="region" aria-label={`Waterfall for ${trace.operation}`}>
      <div className="waterfall-head"><div>Span</div><div className="timeline-ticks">{gridTicks.map(tick => <span key={tick}>{Math.round(trace.durationMs * tick / 100)} ms</span>)}</div><div>Duration</div></div>
      {trace.spans.map(span => {
        const left = (span.offsetMs / trace.durationMs) * 100;
        const width = (span.durationMs / trace.durationMs) * 100;
        return (
          <div className="waterfall-row" key={span.id}>
            <div className="span-label" style={{ paddingLeft: `${span.depth * 14}px` }}><span className={`span-kind ${span.kind}`} />{span.label}</div>
            <div className="waterfall-track">{gridTicks.map(tick => <span key={tick} className="waterfall-gridline" style={{ left: `${tick}%` }} />)}<span className={`waterfall-bar ${span.kind} ${span.status === 'error' ? 'has-error' : ''}`} style={{ left: `${left}%`, width: `${width}%` }} title={`${span.label}: ${milliseconds(span.durationMs)}`} /></div>
            <div className="span-duration mono">{milliseconds(span.durationMs)}</div>
          </div>
        );
      })}
      <div className="legend"><span><i className="legend-dot agent"/>Agent</span><span><i className="legend-dot llm"/>LLM</span><span><i className="legend-dot tool"/>Tool</span></div>
    </div>
  );
}
