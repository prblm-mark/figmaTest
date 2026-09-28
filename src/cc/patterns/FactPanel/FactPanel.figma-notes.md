# FactPanel — Figma Notes

## Figma Node
- File: `Lus07xi8pPXLN87sQIyrEt` (Affino Design System) · page **View & Edit** `3842:146669` · kit section `3861:1902`
- Node: [`3865:2136`](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3865-2136) · Tier: **Pattern** → `src/cc/patterns/FactPanel/`
- Used by: `src/cc/templates/RecordScreen/` (ArticleView / ArticleEdit / ArticleSteps)

## Variant Matrix

| Node | Variant | Notes |
|---|---|---|
| `3865:2136` | FactPanel (Title, Show Subtitle, Show Badge, Show Action, Content swap) |  |
| `3865:1944` | FactList (Row 1–8 toggles) | compact FieldRows |

## CSS Class Mapping

| Figma | CSS |
|---|---|
| Panel (section) | `.fact-panel` |
| Header | `.fact-panel__header (+ divider as its bottom border)` |
| Title block | `.fact-panel__title-block / __title (h2) / __subtitle` |
| Trailing | `.fact-panel__trailing → .badge.badge--pill.badge--success` with `.badge__dot` (Badge Type=Indicator `2580:10516`, designer 2026-09-28 — was a plain Pill) and/or action button |
| FactList (dl) | `.fact-list → .field-row--compact rows` |

## Token Mapping

| Property | Token |
|---|---|
| panel | --ai-surface-extra-minimal, 1px --ai-border-secondary, --ai-radius-md, padding --ai-spacing-5, gap --ai-spacing-4 |
| title | --ai-font-fixed-sm SemiBold --ai-leading-sm --ai-text-secondary |
| subtitle | --ai-font-fixed-4xs --ai-leading-xs --ai-text-contrast |
| FactList gap | --ai-spacing-3 |

## Token Gaps & Decisions
Every sidebar panel is this one component with the standard header — the draft's tall headers came from re-tokenise binding 100% line-height to a value of 100 (designer). Panel gap standardised to `--ai-spacing-4`. `--ai-surface-extra-minimal` existed in Figma but was missing from the token export — added to the Semantic JSON from Figma's own values 2026-09-28.

## Notes
- Built 2026-09-28 from the View & Edit kit (section `3861:1902`, CC Light mode). The kit was
  componentised from a code-capture draft that re-tokenise had bound to random / borrowed tokens;
  the designer ruled "your recommendations are the way to go", so bindings were normalised to the
  right semantic tokens in Figma first and this code follows the kit, not the draft.
- Markup comes from `src/cc/templates/RecordScreen/record_markup.py` — the demo and the templates are
  generated from the same function, so they cannot drift.

## Contextual override — header badge type (designer, 2026-09-28)
`.fact-panel__trailing .badge` → `--ai-font-fixed-4xs` (11px) + `--ai-font-bold`, over the Badge base
`fixed-xxs` / semibold. In Figma the FactPanel's Badge instance (`3896:16232`) text is overridden to
`font/size-fixed/4xs` + Bold. The Badge component set is unchanged.
