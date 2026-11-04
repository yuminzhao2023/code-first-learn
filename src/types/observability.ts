export type TraceStatus = 'ok' | 'error' | 'warning';
export type SpanKind = 'agent' | 'llm' | 'tool';
export type Model = 'GPT-6' | 'Claude Sonnet' | 'Gemini';

export interface Span {
  id: string;
  label: string;
  kind: SpanKind;
  offsetMs: number;
  durationMs: number;
  status: TraceStatus;
  depth: number;
}

export interface Trace {
  id: string;
  operation: string;
  service: string;
  model: Model;
  status: TraceStatus;
  durationMs: number;
  startedAt: string;
  tokens: number;
  spans: Span[];
}

export interface ModelStats {
  name: Model;
  requests: number;
  p95: number;
  errorsPercent: number;
  costUsd: number;
  tokens: number;
}
