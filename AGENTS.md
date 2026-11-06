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
- [UI Guidelines](docs/UI_GUIDELINES.md) (design language + change rules)
- `src/styles/tokens.css` (canonical semantic tokens)
- `src/components/ui/` (reusable primitives)
- the specific page and any affected domain components
- `tests/behavior.spec.ts` and `tests/visual.spec.ts` (acceptance criteria)
- [Code Guidelines](docs/CODE_GUIDELINES.md) (code organization, contracts, comments and documentation references)
- [Workflow](docs/WORKFLOW.md) and [Validation](docs/VALIDATION.md) (execution process and verification requirements)

## 3. Change policy

- **Accessibility**: retain labels, keyboard access, and visible focus states.
- **Data contracts**: never mutate mock data or alter service contracts merely to fix visual problems.
- **Do not regenerate unrelated code**, introduce dependencies without a reason, or overwrite visual snapshots silently.
- **Never convert an unimplemented feature into a fake functioning button**. Mark it static or implement actual behavior.

## 4. Execution and delivery

Use the workflow and validation requirements listed in the required context for execution, checks, baseline approval and delivery.

## 5. No invented metrics

All traces, requests, performance stats and costs in this repo are fixtures. Do not claim they are production observability measurements.

## 6. Optional MCP tools

Figma MCP is NOT required for this repository. Browser Playwright automation is useful for inspection; prefer accessibility-based selectors for interactions and screenshots for visual diagnosis. If MCP tools are unavailable, rely on the included Playwright tests and explain the limitation.
