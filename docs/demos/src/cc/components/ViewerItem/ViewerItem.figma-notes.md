# ViewerItem — Figma Notes

## Figma Node
- File: `Lus07xi8pPXLN87sQIyrEt` (Affino Design System) · page **View & Edit** `3842:146669` · kit section `3861:1902`
- Node: [`3865:1977`](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3865-1977) · Tier: **Component** → `src/cc/components/ViewerItem/`
- Used by: `src/cc/templates/RecordScreen/` (ArticleView / ArticleEdit / ArticleSteps)

## Variant Matrix

| Node | Variant | Notes |
|---|---|---|
| `3865:1977` | (single) | Avatar, name, role, time, company chips |

## CSS Class Mapping

| Figma | CSS |
|---|---|
| Root (li) | `.viewer-item` |
| Body | `.viewer-item__body` |
| Identity | `.viewer-item__identity / __who` |
| Name / role / time | `.viewer-item__name / __role / __time` |
| Companies | `.viewer-item__companies → btn btn--tertiary btn--xs links` |

## Token Mapping

| Property | Token |
|---|---|
| card | --ai-surface-primary, 1px --ai-border-secondary, --ai-radius-md, --ai-shadow-2xs |
| padding / gap | --ai-spacing-4 / --ai-spacing-4 |
| name | --ai-font-fixed-2xs Bold --ai-text-primary |
| role | --ai-font-fixed-xxs --ai-text-contrast |
| time | --ai-font-fixed-5xs --ai-text-contrast |
| line height | --ai-leading-xs (draft "normal") |
| chips gap | --ai-spacing-2 |

## Token Gaps & Decisions
Draft shadow was the retired `light/shadow-xxs` → `shadow/2xs` (`--ai-shadow-2xs`). Draft line-heights were "normal" → `--ai-leading-xs`.

## Notes
- Built 2026-09-28 from the View & Edit kit (section `3861:1902`, CC Light mode). The kit was
  componentised from a code-capture draft that re-tokenise had bound to random / borrowed tokens;
  the designer ruled "your recommendations are the way to go", so bindings were normalised to the
  right semantic tokens in Figma first and this code follows the kit, not the draft.
- Markup comes from `src/cc/templates/RecordScreen/record_markup.py` — the demo and the templates are
  generated from the same function, so they cannot drift.
