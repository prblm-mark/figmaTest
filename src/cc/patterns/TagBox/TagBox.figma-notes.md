# TagBox — Figma Notes

## Figma Node
- File: `Lus07xi8pPXLN87sQIyrEt` (Affino Design System) · page **View & Edit** `3842:146669` · kit section `3861:1902`
- Node: [`3875:3268`](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3875-3268) · Tier: **Pattern** → `src/cc/patterns/TagBox/`
- Used by: `src/cc/templates/RecordScreen/` (ArticleView / ArticleEdit / ArticleSteps)

## Variant Matrix

| Node | Variant | Notes |
|---|---|---|
| `3875:3268` | (single, Tag 1–8 toggles) | Badges Dismissible Neutral tags + Select |

## CSS Class Mapping

| Figma | CSS |
|---|---|
| Root | `.tag-box [data-tag-box]` |
| Tags (ul) | `.tag-box__tags → li.badge.badge--neutral + .badge__close` |
| Select | `btn btn--secondary btn--sm [data-tag-box-select="<modal id>"]` |
| Modal | `FilterDropdowns Multi Select Modal in .modal-overlay` |

## Token Mapping

| Property | Token |
|---|---|
| box | --ai-surface-primary, 1px --ai-border-secondary, --ai-radius-md, padding --ai-spacing-3, min-height --ai-spacing-8 |
| tag gap | --ai-spacing-2 |
| box → Select | --ai-spacing-3 |

## Token Gaps & Decisions
Designer 2026-09-28: show SELECTED items only, as a tag box (replaced the draft's always-open list). Select opens the existing FilterDropdowns Multi Select Modal (`3039:5630`), pre-ticked; Apply writes ticked rows back (TagBox.js). Modal rows are demo data (backend).

## Notes
- Built 2026-09-28 from the View & Edit kit (section `3861:1902`, CC Light mode). The kit was
  componentised from a code-capture draft that re-tokenise had bound to random / borrowed tokens;
  the designer ruled "your recommendations are the way to go", so bindings were normalised to the
  right semantic tokens in Figma first and this code follows the kit, not the draft.
- Markup comes from `src/cc/templates/RecordScreen/record_markup.py` — the demo and the templates are
  generated from the same function, so they cannot drift.
