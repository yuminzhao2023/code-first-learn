# Prompt 04 — 有约束的自然语言视觉反馈

Read `AGENTS.md` and the UI Guidelines first.

At 390px viewport width, the page itself must never overflow horizontally. Wide tabular data may scroll *inside* its own card.

Inspect Trace Explorer and LLM Metrics using Playwright browser screenshots and page DOM dimensions. If an overflow is present, fix only its root cause. Do not hide the problem by applying `overflow-x: hidden` to the body.

Retain keyboard navigation and all search/filter behavior. Run tests, report actual overflow measurements, and do not silently approve visual snapshots.
