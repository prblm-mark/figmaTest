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

## Component set (2026-09-28)
MediaMeta is now a set `3905:140931`: `Layout=Default` (`3861:1922`, the original node — existing instances unchanged) + `Layout=Stacked` (`3905:140918`): facts under the thumbnail, divider on the list's top edge, `spacing/4` top padding. Stacked values are single-line + ellipsis in Figma because Terms and Values are separate columns there (a wrapped value would misalign the rows); code wraps, since its grid keeps rows aligned. Stacked is the RecordSection ≤559 container query — no class. Code Connect repointed to the set.

## Show / Hide details (designer, 2026-09-29)
The file facts are **hidden by default** behind a toggle. View screens only — Edit uses MediaPicker.
- Figma: set gains `State=Collapsed` (default — the original `3861:1922` / `3905:140918`, so every placed instance collapsed) and `State=Expanded` (`3910:18907` Default, `3910:18939` Stacked). A `Details` column holds a Button **Secondary xs** (`Show details` + ChevronDown / `Hide details` + ChevronUp) above the Definition List, gap `spacing/3`.
- Code: `.media-meta__details` column; `.media-meta__toggle` = `btn btn--secondary btn--xs` (the same control as SEO Health's "Expand all" — tertiary is a filled grey chip in CC and read as another tag); `aria-expanded` + `aria-controls`, the list carries `hidden`; chevron rotates 180° when open. `MediaMeta.js` (delegated) flips it and swaps the label. `.media-meta__list[hidden]` restores `display: none` over the grid.
- Narrow (RecordSection ≤559): the details column stretches under the thumbnail.
