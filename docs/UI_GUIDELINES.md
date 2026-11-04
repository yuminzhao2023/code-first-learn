# UI Guidelines — PulseTrace Lab

Version: **V2 example**, evolved from the Trace Explorer screen (V1) to LLM Metrics (V2).

## 1. Design goals

- **Audience**: developers debugging LLM/agent execution.
- **Density**: information-dense, but rows and labels must remain readable.
- **Appearance**: dark developer-tool UI; one accent family; status colors retain semantic meaning.
- **No design handoff required**: approved code and tokens are the implementation reference. Figma can be added for team review later.

## 2. Design Tokens

Source of truth: [`src/styles/tokens.css`](../src/styles/tokens.css).

| Token | Intent | Avoid |
|---|---|---|
| `--color-bg` | app canvas | hardcoding background in pages |
| `--color-surface` | cards/panels | second arbitrary panel theme |
| `--color-text` / `--color-text-muted` | typography hierarchy | faint text for critical information |
| `--color-accent` | active navigation, visual highlights | using accent as error color |
| `--color-success/warning/danger` | state semantics | using color as the only status cue |
| `--radius-card` | shared panel curvature | per-page card radius overrides |
| `--space-*` | repeatable spacing scale | random spacing for every new feature |

**Known learning debt:** `src/styles/app.css` still contains local literal colors/spacing for some one-off details. In Lab 3, audit which should become semantic tokens. Don't indiscriminately move all values to the token layer.

## 3. Component ownership

- `components/ui/` — pure general-purpose UI; zero domain models. Examples: `Card`, `Button`, `MetricCard`, `StatusBadge` (status enum is domain-coupled in this training repo; would move into domain package in a larger app).
- `components/layout/` — shared workspace/navigation shell.
- `components/observability/` — domain-specific visualizations (e.g. `TraceWaterfall`, `TraceTable`, `LatencyChart`).
- `pages/` — composition, data selection, state and route content.

## 4. Extraction decision

Ask these three questions:

1. Is it needed by two places **with the same behavior/visual contract**?
2. Can it have a small, stable API without dozens of booleans?
3. Will extracting it reduce maintenance, not create a generic abstraction for one case?

If not, leave it feature-local and revisit later.

## 5. Layout and interaction

- Desktop reference: 1440×900; mobile reference: 390×844.
- Panels adapt to viewport; wide data tables can horizontally scroll within their container.
- Navigation is real links (`/`, `/metrics`). Search/filter use controlled inputs. Operations in a table are buttons, not clickable `tr` elements.
- Every form control must have a discoverable accessible name; preserve `:focus-visible` styles.
- Empty filtered results must have an informative message; selected trace details reflect visible results.
- Real data/telemetry is **not connected**. UI values are deterministic test fixtures.

## 6. Versioned evolution

### V1 — Trace Explorer

- AppShell, `Card`, `Button`, `MetricCard`, `StatusBadge`, `TraceTable`, `TraceWaterfall`.
- Global dark theme; page header and metrics pattern established.
- Behaviors: search, filter, select trace, reset.

### V2 — LLM Metrics

- **Reuse**: AppShell, Card, shared colors, typography, spacing, data table pattern.
- **Reuse**: existing `MetricCard`; **add** domain `LatencyChart` and fixed 14-day request bars.
- **Do not generalize** `TraceWaterfall` into a generic chart component; semantics differ.

## 7. Change control

When a new page needs a style not in the tokens:

1. Try existing token/primitive.
2. Make a local implementation if truly specific.
3. Propose a token or shared primitive when at least two consumers need it.
4. Review impact across both `/` and `/metrics`.
5. Run typecheck, behavior tests, visual comparison; inspect diffs.
6. Update guidelines when introducing a reusable rule, not for cosmetic one-off tweaks.

Never blindly accept `--update-snapshots`. A failing screenshot test is a review request, not an instruction to rewrite the baseline.
