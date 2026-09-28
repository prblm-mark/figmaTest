# RecordSection — Figma Notes

## Figma Node
- File: `Lus07xi8pPXLN87sQIyrEt` (Affino Design System) · page **View & Edit** `3842:146669` · kit section `3861:1902`
- Node: [`3871:3259`](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3871-3259) · Tier: **Pattern** → `src/cc/patterns/RecordSection/`
- Used by: `src/cc/templates/RecordScreen/` (ArticleView / ArticleEdit / ArticleSteps)

## Variant Matrix

| Node | Variant | Notes |
|---|---|---|
| `3865:2172` | Width=Standard | white card, Row 1–8 toggles |
| `3871:3247` | Width=Full | flat, bottom border |

## CSS Class Mapping

| Figma | CSS |
|---|---|
| Section | `.record-section (+ --full)` |
| Header | `.record-section__header / __title (h2)` |
| Body | `.record-section__body (dl in view, div in edit)` |

## Token Mapping

| Property | Token |
|---|---|
| card | --ai-surface-primary, 1px --ai-border-secondary, --ai-radius-md; Full: radius-none, bottom border |
| header padding | --ai-spacing-5 / --ai-spacing-6 right, bottom border |
| title | --ai-font-fixed-md SemiBold --ai-leading-sm --ai-text-primary |
| body | padding --ai-spacing-6, gap --ai-spacing-5 |

## Token Gaps & Decisions
Draft card bg/border were borrowed (`--cc-header-secondary-bg`, `--ai-datatable-table-border`) → `--ai-surface-primary` / `--ai-border-secondary` (designer). Row gap was 12 in one section, 16 in another → `--ai-spacing-5`.

## Notes
- Built 2026-09-28 from the View & Edit kit (section `3861:1902`, CC Light mode). The kit was
  componentised from a code-capture draft that re-tokenise had bound to random / borrowed tokens;
  the designer ruled "your recommendations are the way to go", so bindings were normalised to the
  right semantic tokens in Figma first and this code follows the kit, not the draft.
- Markup comes from `src/cc/templates/RecordScreen/record_markup.py` — the demo and the templates are
  generated from the same function, so they cannot drift.

## Narrow layout (designer-approved 2026-09-28)
`.record-section` is a self-container (`record-section`). At ≤559 its non-compact FieldRows stack label over value with a `--ai-spacing-3` gap (the DS Input's label→control gap); the edit label's centring `padding-top` is dropped. No Figma frame — the threshold is 192 label + a ~45ch value + padding.
At the same ≤559, MediaMeta's file facts move under the thumbnail and its divider turns from the list's left edge to its top (designer, 2026-09-28). Kept rather than hidden on mobile: alt text is the a11y-relevant value.
