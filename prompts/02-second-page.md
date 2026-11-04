# Prompt 02 — 基于已批准设计系统开发第二页

Read `AGENTS.md`, `docs/UI_GUIDELINES.md`, and `src/styles/tokens.css` first.

Implement an LLM Metrics page at `/metrics`.

Requirements:
- Reuse AppShell, Card, typography, spacing, and semantic colors from page 1.
- Add a model filter, overview metrics, latency chart, request activity, model breakdown table.
- Keep mock data stable. Do not change trace data contracts.
- Extract components only where there is stable reuse; leave chart logic in the observability domain.
- Keep accessibility names and testable behavior.
- Add behavior tests and propose visual snapshot changes; never auto-approve snapshots.

Deliver: changed files; reused components; new domain components; new tokens (if any) with rationale; test results.
