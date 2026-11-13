import type { Trace } from '../types/observability';

// Additional deterministic failed executions; existing sample traces remain unchanged.
const definitions = [
  {
    type: 'TimeoutError',
    service: 'backtest-worker',
    model: 'Claude Sonnet',
    operation: 'evaluate_strategy',
    message:
      'tool.run_backtest exceeded the 3000 ms execution limit. Worker did not respond before the deadline.',
    times: ['10:38:20', '10:32:06', '10:25:17'],
    span: 'tool.run_backtest',
  },
  {
    type: 'RateLimitError',
    service: 'report-service',
    model: 'GPT-6',
    operation: 'generate_risk_report',
    message:
      'llm.summarize returned HTTP 429. Request quota exceeded; retry after 30 seconds.',
    times: ['10:40:21', '10:35:44', '10:21:03'],
    span: 'llm.summarize',
  },
  {
    type: 'TimeoutError',
    service: 'factor-agent',
    model: 'Gemini',
    operation: 'select_candidate_factors',
    message:
      'tool.query_factors timed out after 3000 ms while waiting for the factor store.',
    times: ['10:39:47', '10:28:12'],
    span: 'tool.query_factors',
  },
  {
    type: 'ValidationError',
    service: 'backtest-worker',
    model: 'Claude Sonnet',
    operation: 'replay_experiment',
    message:
      'tool.restore_context received an invalid experiment payload: required field strategy_id is missing.',
    times: ['10:36:08', '10:19:30'],
    span: 'tool.restore_context',
  },
  {
    type: 'RateLimitError',
    service: 'factor-agent',
    model: 'GPT-6',
    operation: 'rank_candidate_factors',
    message:
      'llm.rank_factors returned HTTP 429. Concurrent request limit reached.',
    times: ['10:31:45'],
    span: 'llm.rank_factors',
  },
] satisfies {
  type: string;
  service: string;
  model: Trace['model'];
  operation: string;
  message: string;
  times: string[];
  span: string;
}[];

/** 错误诊断只存关联键和异常信息；服务、模型与操作从 Trace 读取，避免两份来源不一致。 */
export interface ErrorEvent {
  traceId: string;
  type: string;
  message: string;
  /** 带时区的完整 ISO 时间；当前样例统一为 2026-11-03、UTC+8。 */
  occurredAt: string;
}
// group/index 同时用于下方 errorEvents 的关联键；调整定义时需保持两侧生成规则一致。
export const errorTraces: Trace[] = definitions.flatMap((d, group) =>
  d.times.map((time, index) => ({
    id: `tr-error-${group}-${index}`,
    operation: d.operation,
    service: d.service,
    model: d.model,
    status: 'error',
    durationMs: 3260,
    startedAt: time,
    tokens: 1240,
    spans: [
      {
        id: 'root',
        label: 'agent.run',
        kind: 'agent',
        offsetMs: 0,
        durationMs: 3260,
        status: 'error',
        depth: 0,
      },
      {
        id: 'failure',
        label: d.span,
        kind: d.span.startsWith('llm.') ? 'llm' : 'tool',
        offsetMs: 260,
        durationMs: 3000,
        status: 'error',
        depth: 1,
      },
    ],
  })),
);
export const errorEvents: ErrorEvent[] = [
  {
    traceId: 'tr-9ba734',
    type: 'TimeoutError',
    message: definitions[0].message,
    occurredAt: '2026-11-03T10:41:55+08:00',
  },
  ...definitions.flatMap((d, group) =>
    d.times.map((time, index) => ({
      traceId: `tr-error-${group}-${index}`,
      type: d.type,
      message: d.message,
      occurredAt: `2026-11-03T${time}+08:00`,
    })),
  ),
];
