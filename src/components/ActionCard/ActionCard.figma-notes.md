# ActionCard — Figma Notes

## Figma Node
- **File key:** `Lus07xi8pPXLN87sQIyrEt` (Affino AI — Design System)
- **Component set:** `2930:5757` (ActionCard)

| Node ID | Variant name | Notes |
|---|---|---|
| `2930:5756` | Action=Button, State=Default | Border `--ai-border-secondary` |
| `2930:5753` | Action=Button, State=Hover | Border `--ai-border-primary` |
| `2930:5755` | Action=Right Chevron, State=Default | Border `--ai-border-secondary` |
| `2930:5754` | Action=Right Chevron, State=Hover | Border `--ai-border-primary` |

## Variant × State Matrix

| Action | States | Trailing element |
|---|---|---|
| Button | Default, Hover | Button — Type=Tertiary, Size=xs (`btn btn--tertiary btn--xs`), Plus icon + "add" |
| Right Chevron | Default, Hover | `chevron-right` icon, 16px, `--ai-icon-secondary` |

`State=Hover` is a pure CSS `:hover` (border darkens `--ai-border-secondary` → `--ai-border-primary`) — no JS.

## CSS Class Mapping

| Figma | CSS |
|---|---|
| ActionCard root | `.action-card` |
| Action=Button | `.action-card--button` (root marker; trailing is the Button component) |
| Action=Right Chevron | `.action-card--chevron` (root marker; rendered as `<a>` — whole card navigates) |
| Title text | `.action-card__title` |
| Chevron icon | `.action-card__chevron` |
| "+ add" button | `.btn.btn--tertiary.btn--xs` (composes the Button component) |

## Token Mapping

| Figma variable | CSS variable | Role |
|---|---|---|
| `--ai-surface-primary` | `--ai-surface-primary` | Card background (#fff) |
| `--ai-border-secondary` | `--ai-border-secondary` | Default border (#e2e2e3) |
| `--ai-border-primary` | `--ai-border-primary` | Hover border (#1b1b1f) |
| `--ai-spacing-6` | `--ai-spacing-6` | Gap between title and action (24px) |
| `--ai-spacing-10` | `--ai-spacing-10` | Fixed card height (56px) |
| `--ai-spacing-4` | `--ai-spacing-4` | Card padding (12px) |
| `--ai-radius-md` | `--ai-radius-md` | Card corner radius (8px) |
| `--ai-font-title` | `--ai-font-title` | Title font family (Inter) |
| `--ai-font-medium` | `--ai-font-medium` | Title weight (500) |
| `--ai-font-fixed-xs` | `--ai-font-fixed-xs` | Title size (14px) |
| `--ai-leading-sm` | `--ai-leading-sm` | Title line height (20px) |
| `--ai-tracking-5` | `--ai-tracking-5` | Title letter-spacing (~0.2px) |
| `--ai-text-primary` | `--ai-text-primary` | Title colour (#212123) |
| `--ai-icon-size-sm` | `--ai-icon-size-sm` | Chevron size (16px) |
| `--ai-icon-secondary` | `--ai-icon-secondary` | Chevron colour (#67676c) |

## Token Gaps
- None outstanding. Resolved during build (2026-06-12):
  - Card height was `h-[54px]` (no token) → designer updated Figma to `--ai-spacing-10` (56px).
  - `--ai-icon-size-xs` (12px, used by the xs Button) was missing → designer exported the new scale token; `npm run tokens` now emits it.

## Dependencies
- **Button** (`btn btn--tertiary btn--xs`). The Action=Button trailing element is a Button
  instance, Type=Tertiary, **Size=xs**. The xs size was added to the Button component as part
  of this build (it previously had only `base` + `sm`). See `Button.figma-notes.md`.

## Notes
- Card `width` is fluid (`100%`) — Figma's `376px` is the frame width; ActionCards stretch to
  their container. The title uses `flex: 1` + `min-width: 0` + ellipsis to truncate.
- Height is fixed via `min-height: --ai-spacing-10` so both Action variants share the same row
  height (the Chevron variant's content alone is shorter).
- Interaction is not exposed by `get_design_context`. Implemented per intent: Action=Button is a
  container `<div>` whose action is the inner "+ add" button; Action=Right Chevron is a whole-card
  `<a>` (chevron is a navigational affordance). Confirm against the Figma prototype if it differs.
- Lucide names: Figma `Icon/24px/Plus` → `plus`; `Icon/24px/ChevronRight` → `chevron-right`.
