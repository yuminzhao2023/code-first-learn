# AI Agent Working Agreement — Code-first Observability Lab

> READ this document before editing any page or shared UI. It is deliberately concise so coding agents can follow it consistently.

## 1. Priorities

1. Preserve correct behavior and type safety.
2. Reuse approved tokens and UI components before adding new ones.
3. Keep domain components separate from primitive UI components.
4. Prefer small, reviewable changes over wholesale rewrites.
5. Do not claim verification unless the commands actually ran.

## 2. Context required before making changes

Read, in order:
- `docs/UI_GUIDELINES.md` (design language + change rules)
- `src/styles/tokens.css` (canonical semantic tokens)
- `src/components/ui/` (reusable primitives)
- the specific page and any affected domain components
- `tests/behavior.spec.ts` and `tests/visual.spec.ts` (acceptance criteria)

## 3. Change policy

- **Local change**: if a style or component appears in only one feature, keep it local first.
- **Shared UI component**: extract only when there is demonstrated reuse or a stable contract.
- **Design Tokens**: only add semantic tokens with meaningful reuse. Do not add dozens of one-off colors.
- **Global token change**: explain why, list both pages affected, run behavioral and visual regression, and ask for baseline approval before updating snapshots.
- **Accessibility**: retain labels, keyboard access, and visible focus states.
- **Data contracts**: never mutate mock data or alter service contracts merely to fix visual problems.
- **Do not regenerate unrelated code**, introduce dependencies without a reason, or overwrite visual snapshots silently.
- **Never convert an unimplemented feature into a fake functioning button**. Mark it static or implement actual behavior.

## 4. Verification checklist

Before marking a task complete, attempt:

```sh
npm run typecheck
npm run build
npm run test:e2e
npm run test:visual
```

If no approved snapshot exists, `test:visual` may fail. Inspect the page, run `npm run test:visual:update` deliberately, inspect PNG diffs, and commit the baseline only after human approval.

Provide a final report with:
- changed files and reasons
- local vs shared design decisions
- commands actually run (pass/fail/not run)
- test evidence and known gaps
- whether review/approval is required

## 5. No invented metrics

All traces, requests, performance stats and costs in this repo are fixtures. Do not claim they are production observability measurements.

## 6. Optional MCP tools

Figma MCP is NOT required for this repository. Browser Playwright automation is useful for inspection; prefer accessibility-based selectors for interactions and screenshots for visual diagnosis. If MCP tools are unavailable, rely on the included Playwright tests and explain the limitation.
