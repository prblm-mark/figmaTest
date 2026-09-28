# MediaMeta — Figma Notes

## Figma Node
- File: `Lus07xi8pPXLN87sQIyrEt` (Affino Design System) · page **View & Edit** `3842:146669` · kit section `3861:1902`
- Node: [`3861:1922`](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3861-1922) · Tier: **Component** → `src/cc/components/MediaMeta/`
- Used by: `src/cc/templates/RecordScreen/` (ArticleView / ArticleEdit / ArticleSteps)

## Variant Matrix

| Node | Variant | Notes |
|---|---|---|
| `3861:1922` | (single) | 72px thumbnail + Alt text / File name / File size / Dimensions |

## CSS Class Mapping

| Figma | CSS |
|---|---|
| Root | `.media-meta` |
| Thumbnail | `.media-meta__thumb (img)` |
| Definition list | `.media-meta__list (dl)` |
| Term / value | `.media-meta__term / .media-meta__value` |

## Token Mapping

| Property | Token |
|---|---|
| thumb size | --ai-spacing-12 (72) |
| thumb border / radius / bg | --ai-border-secondary / --ai-radius-sm / --ai-surface-minimal |
| gap thumb→list | --ai-spacing-4 |
| list divider + padding | 1px --ai-border-secondary / --ai-spacing-4 |
| column / row gap | --ai-spacing-4 / --ai-spacing-0-5 |
| text | --ai-font-fixed-xxs, --ai-leading-xs, Regular; term --ai-text-contrast, value --ai-text-primary |

## Token Gaps & Decisions
Draft thumb bg was `--ai-btn-secondary-bg-hover` (borrowed) → `--ai-surface-minimal` (same value in CC). Draft 12px text was raw → `--ai-font-fixed-xxs`.

## Notes
- Built 2026-09-28 from the View & Edit kit (section `3861:1902`, CC Light mode). The kit was
  componentised from a code-capture draft that re-tokenise had bound to random / borrowed tokens;
  the designer ruled "your recommendations are the way to go", so bindings were normalised to the
  right semantic tokens in Figma first and this code follows the kit, not the draft.
- Markup comes from `src/cc/templates/RecordScreen/record_markup.py` — the demo and the templates are
  generated from the same function, so they cannot drift.
