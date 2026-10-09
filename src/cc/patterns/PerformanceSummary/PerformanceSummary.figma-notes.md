# PerformanceSummary — Figma Notes

## Figma Node
- File: `Lus07xi8pPXLN87sQIyrEt` (Affino Design System) · page **View & Edit** `3842:146669` · kit section `3861:1902`
- Node: [`3867:2067`](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3867-2067) · Tier: **Pattern** → `src/cc/patterns/PerformanceSummary/`
- Used by: `src/cc/templates/RecordScreen/` (ArticleView / ArticleEdit / ArticleSteps)

## Variant Matrix

| Node | Variant | Notes |
|---|---|---|
| `3867:2067` | (single) | 3 StatCards + accounts + Chart + totals + link |

## CSS Class Mapping

| Figma | CSS |
|---|---|
| Root | `.performance-summary` |
| Stats | `.performance-summary__stats / __stats-row (2-col grid)` |
| StatCards | `stat-card --violet-radix / --indigo / --jade` (solid fill, designer 2026-10-02; was `+ --soft`) |
| Accounts | `.performance-summary__accounts / __accounts-heading / __account-chips (btn--secondary btn--xs)` |
| Chart | `.performance-summary__chart → .chart .chart__canvas (Chart.js)` |
| Totals (dl) | `.performance-summary__totals / __total` |
| Link | `.performance-summary__link` |

## Token Mapping

| Property | Token |
|---|---|
| gaps | --ao-spacing-5 root, --ao-spacing-3 stats/chips, --ao-spacing-4 accounts/totals |
| accounts card | --ao-surface-primary, 1px --ao-border-secondary, --ao-radius-md, padding --ao-spacing-4 |
| chart well | --ao-surface-minimal, --ao-radius-md |
| text | --ao-font-fixed-2xs --ao-leading-xs; labels --ao-text-contrast, values Bold --ao-text-primary, link SemiBold --ao-text-brand |

## Token Gaps & Decisions
Draft panel padding was raw 20px → FactPanel `--ao-spacing-5`. Chart height is the Chart component's own (Figma pins 175px). All figures are static (backend).

## Notes
- Built 2026-09-28 from the View & Edit kit (section `3861:1902`, CC Light mode). The kit was
  componentised from a code-capture draft that re-tokenise had bound to random / borrowed tokens;
  the designer ruled "your recommendations are the way to go", so bindings were normalised to the
  right semantic tokens in Figma first and this code follows the kit, not the draft.
- Markup comes from `src/cc/templates/RecordScreen/record_markup.py` — the demo and the templates are
  generated from the same function, so they cannot drift.

**Border rule (designer, 2026-10-02):** top-level panels use `border/card`, and cards INSIDE a panel keep the more prominent `border/secondary`. The accounts box, the Chart and the StatCards are all in-panel, so all stay on `border/secondary`.
