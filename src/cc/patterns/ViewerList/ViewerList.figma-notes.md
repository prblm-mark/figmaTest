# ViewerList — Figma Notes

## Figma Node
- File: `Lus07xi8pPXLN87sQIyrEt` (Affino Design System) · page **View & Edit** `3842:146669` · kit section `3861:1902`
- Node: [`3865:2008`](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3865-2008) · Tier: **Pattern** → `src/cc/patterns/ViewerList/`
- Used by: `src/cc/templates/RecordScreen/` (ArticleView / ArticleEdit / ArticleSteps)

## Variant Matrix

| Node | Variant | Notes |
|---|---|---|
| `3865:2008` | (single, Viewer 1–3 toggles) | ViewerItems + Add to Contact List |

## CSS Class Mapping

| Figma | CSS |
|---|---|
| Root | `.viewer-list` |
| Items (ul) | `.viewer-list__items → ViewerItem` |
| CTA | `btn btn--secondary btn--sm "Add to Contact List"` |

## Token Mapping

| Property | Token |
|---|---|
| gap items→CTA | --ai-spacing-5 |
| gap between items | --ai-spacing-4 |

## Token Gaps & Decisions
"Add to Contact List" is backend (HANDOVER `viewers-add-to-contact-list`).

## Notes
- Built 2026-09-28 from the View & Edit kit (section `3861:1902`, CC Light mode). The kit was
  componentised from a code-capture draft that re-tokenise had bound to random / borrowed tokens;
  the designer ruled "your recommendations are the way to go", so bindings were normalised to the
  right semantic tokens in Figma first and this code follows the kit, not the draft.
- Markup comes from `src/cc/templates/RecordScreen/record_markup.py` — the demo and the templates are
  generated from the same function, so they cannot drift.
