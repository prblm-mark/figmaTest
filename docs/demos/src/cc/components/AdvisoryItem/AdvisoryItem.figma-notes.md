# AdvisoryItem — Figma Notes

## Figma Node
- File: `Lus07xi8pPXLN87sQIyrEt` (Affino Design System) · page **View & Edit** `3842:146669` · kit section `3861:1902`
- Node: [`3865:2098`](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3865-2098) · Tier: **Component** → `src/cc/components/AdvisoryItem/`
- Used by: `src/cc/templates/RecordScreen/` (ArticleView / ArticleEdit / ArticleSteps)

## Variant Matrix

| Node | Variant | Notes |
|---|---|---|
| `3865:2098` | State=Collapsed | row only |
| `3865:2098` | State=Expanded | row + description |

## CSS Class Mapping

| Figma | CSS |
|---|---|
| Root | `.advisory-item (+ --expanded)` |
| Row | `.advisory-item__row` |
| Icon | `.advisory-item__icon (circle-alert)` |
| Title | `.advisory-item__title` |
| Toggle | `.advisory-item__toggle → btn btn--secondary btn--xs btn--icon; plus/minus swap` |
| Description | `.advisory-item__description` |

## Token Mapping

| Property | Token |
|---|---|
| gap | --ai-spacing-3 |
| icon | --ai-icon-size-sm, --ai-surface-warning |
| title | --ai-font-fixed-2xs SemiBold --ai-text-secondary |
| description | --ai-font-fixed-2xs Regular --ai-text-contrast |
| line height | --ai-leading-xs |

## Token Gaps & Decisions
Icon colour is `--ai-surface-warning` as drawn (no `--ai-icon-warning` token exists). Draft toggle icons mix Minus 24px / Plus 20px components — code uses one icon size. Only the first advisory has description copy in the design; the rest come from the SEO health check (backend).

## Notes
- Built 2026-09-28 from the View & Edit kit (section `3861:1902`, CC Light mode). The kit was
  componentised from a code-capture draft that re-tokenise had bound to random / borrowed tokens;
  the designer ruled "your recommendations are the way to go", so bindings were normalised to the
  right semantic tokens in Figma first and this code follows the kit, not the draft.
- Markup comes from `src/cc/templates/RecordScreen/record_markup.py` — the demo and the templates are
  generated from the same function, so they cannot drift.
