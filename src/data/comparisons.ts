import type { Span, Trace } from '../types/observability';

const step = (id: string, label: string, kind: Span['kind'], durationMs: number): Span => ({
  id, label, kind, durationMs, offsetMs: 0, depth: 0, status: 'ok',
});

// Separate deterministic fixtures; exported through the shared trace collection for deep links.
export const comparisonTraces: Trace[] = [
  {
    id: 'tr-compare-base', operation: 'compare_strategy_execution', service: 'comparison-agent', model: 'GPT-6',
    status: 'ok', startedAt: '11:00:00', durationMs: 1000, tokens: 1000,
    spans: [step('cb1', 'llm.reason', 'llm', 200), step('cb2', 'tool.retrieve', 'tool', 300), step('cb3', 'llm.reason', 'llm', 100), step('cb4', 'llm.reason', 'tool', 50)],
  },
  {
    id: 'tr-compare-next', operation: 'compare_strategy_execution', service: 'comparison-worker', model: 'Claude Sonnet',
    status: 'warning', startedAt: '11:01:00', durationMs: 1500, tokens: 1500,
    spans: [step('cn1', 'llm.reason', 'llm', 400), step('cn2', 'llm.reason', 'llm', 100), step('cn3', 'tool.validate_strategy_with_extended_market_context_and_historical_risk_constraints', 'tool', 500)],
  },
  {
    id: 'tr-compare-empty', operation: 'compare_strategy_execution', service: 'comparison-agent', model: 'Gemini',
    status: 'ok', startedAt: '11:02:00', durationMs: 0, tokens: 0, spans: [],
  },
  {
    id: 'tr-compare-zero', operation: 'empty_execution', service: 'comparison-agent', model: 'GPT-6',
    status: 'ok', startedAt: '11:03:00', durationMs: 0, tokens: 0, spans: [],
  },
  {
    id: 'tr-compare-zero-next', operation: 'empty_execution', service: 'comparison-agent', model: 'GPT-6',
    status: 'ok', startedAt: '11:04:00', durationMs: 0, tokens: 0, spans: [],
  },
  {
    id: 'tr-compare-long-identifier-for-fixed-sample-execution-with-extended-context',
    operation: 'inspect_strategy_with_extended_market_context_and_historical_risk_constraints', service: 'comparison-agent', model: 'GPT-6',
    status: 'ok', startedAt: '11:05:00', durationMs: 100000, tokens: 100000,
    spans: [step('cl1', 'tool.inspect', 'tool', 0)],
  },
  {
    id: 'tr-compare-small-change', operation: 'inspect_strategy_with_extended_market_context_and_historical_risk_constraints', service: 'comparison-agent', model: 'GPT-6',
    status: 'ok', startedAt: '11:06:00', durationMs: 100001, tokens: 100001,
    spans: [step('cs1', 'tool.inspect', 'tool', 0)],
  },
];
