import type { ModelStats, Trace } from '../types/observability';

// Fixed mock data = deterministic visual screenshots and repeatable experiments.
export const traces: Trace[] = [
  {
    id: 'tr-8fa213', operation: 'analyze_market_signals', service: 'backtest-agent', model: 'GPT-6',
    status: 'ok', durationMs: 1842, startedAt: '10:42:18', tokens: 2840,
    spans: [
      { id: 'a1', label: 'agent.run', kind: 'agent', offsetMs: 0, durationMs: 1842, status: 'ok', depth: 0 },
      { id: 'a2', label: 'tool.fetch_market_data', kind: 'tool', offsetMs: 120, durationMs: 510, status: 'ok', depth: 1 },
      { id: 'a3', label: 'llm.reason', kind: 'llm', offsetMs: 688, durationMs: 814, status: 'ok', depth: 1 },
      { id: 'a4', label: 'tool.compute_indicators', kind: 'tool', offsetMs: 1530, durationMs: 252, status: 'ok', depth: 1 },
    ],
  },
  {
    id: 'tr-9ba734', operation: 'evaluate_strategy', service: 'backtest-worker', model: 'Claude Sonnet',
    status: 'error', durationMs: 3260, startedAt: '10:41:55', tokens: 1240,
    spans: [
      { id: 'b1', label: 'agent.evaluate', kind: 'agent', offsetMs: 0, durationMs: 3260, status: 'error', depth: 0 },
      { id: 'b2', label: 'tool.load_candles', kind: 'tool', offsetMs: 260, durationMs: 840, status: 'ok', depth: 1 },
      { id: 'b3', label: 'llm.score_strategy', kind: 'llm', offsetMs: 1180, durationMs: 1120, status: 'ok', depth: 1 },
      { id: 'b4', label: 'tool.run_backtest', kind: 'tool', offsetMs: 2360, durationMs: 900, status: 'error', depth: 1 },
    ],
  },
  {
    id: 'tr-3ce102', operation: 'generate_risk_report', service: 'report-service', model: 'GPT-6',
    status: 'ok', durationMs: 980, startedAt: '10:40:21', tokens: 1186,
    spans: [
      { id: 'c1', label: 'agent.report', kind: 'agent', offsetMs: 0, durationMs: 980, status: 'ok', depth: 0 },
      { id: 'c2', label: 'llm.summarize', kind: 'llm', offsetMs: 138, durationMs: 700, status: 'ok', depth: 1 },
    ],
  },
  {
    id: 'tr-7d91bf', operation: 'select_candidate_factors', service: 'factor-agent', model: 'Gemini',
    status: 'warning', durationMs: 2120, startedAt: '10:39:47', tokens: 3210,
    spans: [
      { id: 'd1', label: 'agent.factors', kind: 'agent', offsetMs: 0, durationMs: 2120, status: 'warning', depth: 0 },
      { id: 'd2', label: 'tool.query_factors', kind: 'tool', offsetMs: 210, durationMs: 812, status: 'warning', depth: 1 },
      { id: 'd3', label: 'llm.rank_factors', kind: 'llm', offsetMs: 1090, durationMs: 860, status: 'ok', depth: 1 },
    ],
  },
  {
    id: 'tr-4b29dd', operation: 'replay_experiment', service: 'backtest-worker', model: 'Claude Sonnet',
    status: 'ok', durationMs: 1444, startedAt: '10:38:03', tokens: 2044,
    spans: [
      { id: 'e1', label: 'agent.replay', kind: 'agent', offsetMs: 0, durationMs: 1444, status: 'ok', depth: 0 },
      { id: 'e2', label: 'tool.restore_context', kind: 'tool', offsetMs: 100, durationMs: 520, status: 'ok', depth: 1 },
      { id: 'e3', label: 'llm.verify', kind: 'llm', offsetMs: 644, durationMs: 690, status: 'ok', depth: 1 },
    ],
  },
];

export const modelStats: ModelStats[] = [
  { name: 'GPT-6', requests: 12840, p95: 1842, errorsPercent: 1.2, costUsd: 842.10, tokens: 27400000 },
  { name: 'Claude Sonnet', requests: 9340, p95: 2230, errorsPercent: 2.1, costUsd: 610.45, tokens: 20300000 },
  { name: 'Gemini', requests: 6880, p95: 1530, errorsPercent: 0.8, costUsd: 318.20, tokens: 14100000 },
];

export const latencyDaily = [182, 170, 191, 168, 145, 151, 166, 147, 138, 142, 121, 128, 118, 109];
export const requestsDaily = [32, 46, 40, 58, 63, 55, 71, 69, 77, 73, 86, 91, 98, 94];
