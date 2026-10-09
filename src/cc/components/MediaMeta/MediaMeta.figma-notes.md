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
| thumb size | --ao-spacing-12 (72) |
| thumb border / radius / bg | --ao-border-secondary / --ao-radius-sm / --ao-surface-minimal |
| gap thumb→list | --ao-spacing-4 |
| list divider + padding | 1px --ao-border-secondary / --ao-spacing-4 |
| column / row gap | --ao-spacing-4 / --ao-spacing-0-5 |
| text | --ao-font-fixed-xxs, --ao-leading-xs, Regular; term --ao-text-contrast, value --ao-text-primary |

## Token Gaps & Decisions
Draft thumb bg was `--ao-btn-secondary-bg-hover` (borrowed) → `--ao-surface-minimal` (same value in CC). Draft 12px text was raw → `--ao-font-fixed-xxs`.

## Notes
- Built 2026-09-28 from the View & Edit kit (section `3861:1902`, CC Light mode). The kit was
  componentised from a code-capture draft that re-tokenise had bound to random / borrowed tokens;
  the designer ruled "your recommendations are the way to go", so bindings were normalised to the
  right semantic tokens in Figma first and this code follows the kit, not the draft.
- Markup comes from `src/cc/templates/RecordScreen/record_markup.py` — the demo and the templates are
  generated from the same function, so they cannot drift.

## Current design — layout B (designer, 2026-09-29)
Chosen over an always-visible asset card (A) and an inline Show/Hide toggle; both removed.
- **Figma** set `3905:140931`, one axis **State**: `Collapsed` (`3861:1922`, default — every placed
  instance) and `Expanded` (`3910:18907`). Thumbnail 72 · Summary (gap `spacing/3`): Caption (alt
  text, bound to the `Alt text` property, `text/secondary`, `font/size-fixed/xs`, 2 lines) + Button
  Secondary xs `Image details` with the Info icon left. Expanded adds an absolutely placed Panel
  (Dropdown chrome: `surface/primary`, `border/secondary`, `radius-md`, `shadow/md`, padding
  `spacing/4`) holding the Definition List. `Layout=Stacked` was removed — B keeps the row at every width.
- **Code** `.media-meta` row; `.media-meta__caption` (2-line clamp); `.media-meta__info` is a DS
  Dropdown (`data-dropdown="stay-open"`, trigger `aria-haspopup="dialog"`, panel `role="dialog"`);
  Dropdown.js owns open / outside-click / Escape. The panel anchors to `.media-meta` (the Dropdown
  root is `position: static`) and is capped at `max-inline-size: 100%`, so it never overruns a phone.
  RecordSection dropped `overflow: hidden` so the panel is not clipped on a section's last row.
