# MediaPicker — Figma Notes

## Figma Node
- File: `Lus07xi8pPXLN87sQIyrEt` (Affino Design System) · page **View & Edit** `3842:146669` · kit section `3861:1902`
- Node: [`3875:3331`](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3875-3331) · Tier: **Component** → `src/cc/components/MediaPicker/`
- Used by: `src/cc/templates/RecordScreen/` (ArticleView / ArticleEdit / ArticleSteps)

## Variant Matrix

| Node | Variant | Notes |
|---|---|---|
| `3875:3331` | State=Empty | image icon in the thumb |
| `3875:3331` | State=Filled | image in the thumb |

## CSS Class Mapping

| Figma | CSS |
|---|---|
| Root | `.media-picker` |
| Thumbnail | `.media-picker__thumb (icon or img)` |
| Actions | `.media-picker__actions → btn btn--secondary btn--sm "Edit" + btn--sm btn--icon trash` |

## Token Mapping

| Property | Token |
|---|---|
| thumb size | --ai-spacing-10 (56) |
| thumb bg / border / radius | --ai-surface-minimal / --ai-border-secondary / --ai-radius-sm |
| image icon | --ai-icon-size-md, --ai-icon-secondary |
| gap thumb→actions / between buttons | --ai-spacing-4 / --ai-spacing-2 |

## Token Gaps & Decisions
Figma image icon is bound to `--ai-border-primary`; code uses `--ai-icon-secondary` (same #667f89 in CC, correct semantic). Edit/delete wiring is backend.

## Notes
- Built 2026-09-28 from the View & Edit kit (section `3861:1902`, CC Light mode). The kit was
  componentised from a code-capture draft that re-tokenise had bound to random / borrowed tokens;
  the designer ruled "your recommendations are the way to go", so bindings were normalised to the
  right semantic tokens in Figma first and this code follows the kit, not the draft.
- Markup comes from `src/cc/templates/RecordScreen/record_markup.py` — the demo and the templates are
  generated from the same function, so they cannot drift.
