# Prompt 01 — 从 Spec 到第一个页面

> 这是复刻练习，不要在已经包含完整页面的项目中直接执行“重新生成”；建议从新分支或空的 React/Vite 仓库开始。

Build a Trace Explorer page in React + TypeScript + Vite.

Before coding, propose a minimal token set and component boundaries. Do not build a giant design system upfront.

Acceptance criteria:
- Sidebar; page header; four summary metrics; recent trace table; selected trace waterfall; details card.
- Fixed mock data and deterministic screenshots.
- Search operation / trace ID / service / model.
- Filter trace status: All, Success, Error, Warning.
- Select a row by keyboard-usable button; selected data updates.
- Desktop 1440x900 and mobile 390x844; no document-level horizontal scroll.
- Provide a TypeScript, build, and Playwright behavior verification plan.

After implementation, inspect the browser and report mismatches before saying complete.
