# AdvisoryList — Figma Notes

## Figma Node
- File: `Lus07xi8pPXLN87sQIyrEt` (Affino Design System) · page **View & Edit** `3842:146669` · kit section `3861:1902`
- Node: [`3865:2099`](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3865-2099) · Tier: **Pattern** → `src/cc/patterns/AdvisoryList/`
- Used by: `src/cc/templates/RecordScreen/` (ArticleView / ArticleEdit / ArticleSteps)

## Variant Matrix

| Node | Variant | Notes |
|---|---|---|
| `3865:2099` | (single) | AdvisoryItems with dividers |

## CSS Class Mapping

| Figma | CSS |
|---|---|
| Root (ul) | `.advisory-list` |
| Items | `li.advisory-item` |

## Token Mapping

| Property | Token |
|---|---|
| gap | --ao-spacing-4 |
| divider | 1px --ao-border-secondary + padding-top --ao-spacing-4 |

## Token Gaps & Decisions
Expand all lives on the FactPanel action (`[data-advisory-expand-all]`).

## Notes
- Built 2026-09-28 from the View & Edit kit (section `3861:1902`, CC Light mode). The kit was
  componentised from a code-capture draft that re-tokenise had bound to random / borrowed tokens;
  the designer ruled "your recommendations are the way to go", so bindings were normalised to the
  right semantic tokens in Figma first and this code follows the kit, not the draft.
- Markup comes from `src/cc/templates/RecordScreen/record_markup.py` — the demo and the templates are
  generated from the same function, so they cannot drift.
