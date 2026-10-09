# ActionCard — Figma Notes

## Figma Node
- **File key:** `Lus07xi8pPXLN87sQIyrEt` (Affino AI — Design System)
- **Component set:** `2930:5757` (ActionCard)

| Node ID | Variant name | Notes |
|---|---|---|
| `2930:5756` | Action=Button, State=Default | Border `--ao-border-secondary` |
| `2930:5753` | Action=Button, State=Hover | Border `--ao-border-primary` |
| `2930:5755` | Action=Right Chevron, State=Default | Border `--ao-border-secondary` |
| `2930:5754` | Action=Right Chevron, State=Hover | Border `--ao-border-primary` |

## Variant × State Matrix

| Action | States | Trailing element |
|---|---|---|
| Button | Default, Hover | Button — Type=Tertiary, Size=xs (`btn btn--tertiary btn--xs`), Plus icon + "add" |
| Right Chevron | Default, Hover | `chevron-right` icon, 16px, `--ao-icon-secondary` |

`State=Hover` is a pure CSS `:hover` (border darkens `--ao-border-secondary` → `--ao-border-primary`) — no JS.

## CSS Class Mapping

| Figma | CSS |
|---|---|
| ActionCard root | `.action-card` |
| Action=Button | `.action-card--button` (root marker; trailing is the Button component) |
| Action=Right Chevron | `.action-card--chevron` (root marker; rendered as `<a>` — whole card navigates) |
| Title text | `.action-card__title` |
| Chevron icon | `.action-card__chevron` |
| "+ add" button | `.btn.btn--tertiary.btn--xs` (composes the Button component) |

| — (code-first, 2026-09-30) | `.action-card__text` wraps title + optional `.action-card__desc`; `.action-card--disabled` (`aria-disabled`, not a link). Built for the Article steps "Add a step" chooser. **Needs Figma:** a Description property and a State=Disabled |

## Token Mapping

| Figma variable | CSS variable | Role |
|---|---|---|
| `--ao-surface-primary` | `--ao-surface-primary` | Card background (#fff) |
| `--ao-border-secondary` | `--ao-border-secondary` | Default border (#e2e2e3) |
| `--ao-border-primary` | `--ao-border-primary` | Hover border (#1b1b1f) |
| `--ao-spacing-6` | `--ao-spacing-6` | Gap between title and action (24px) |
| `--ao-spacing-10` | `--ao-spacing-10` | Fixed card height (56px) |
| `--ao-spacing-4` | `--ao-spacing-4` | Card padding (12px) |
| `--ao-radius-md` | `--ao-radius-md` | Card corner radius (8px) |
| `--ao-font-title` | `--ao-font-title` | Title font family (Inter) |
| `--ao-font-medium` | `--ao-font-medium` | Title weight (500) |
| `--ao-font-fixed-xs` | `--ao-font-fixed-xs` | Title size (14px) |
| `--ao-leading-sm` | `--ao-leading-sm` | Title line height (20px) |
| `--ao-tracking-5` | `--ao-tracking-5` | Title letter-spacing (~0.2px) |
| `--ao-text-primary` | `--ao-text-primary` | Title colour (#212123) |
| `--ao-icon-size-sm` | `--ao-icon-size-sm` | Chevron size (16px) |
| `--ao-icon-secondary` | `--ao-icon-secondary` | Chevron colour (#67676c) |

## Token Gaps
- None outstanding. Resolved during build (2026-06-12):
  - Card height was `h-[54px]` (no token) → designer updated Figma to `--ao-spacing-10` (56px).
  - `--ao-icon-size-xs` (12px, used by the xs Button) was missing → designer exported the new scale token; `npm run tokens` now emits it.

## Dependencies
- **Button** (`btn btn--tertiary btn--xs`). The Action=Button trailing element is a Button
  instance, Type=Tertiary, **Size=xs**. The xs size was added to the Button component as part
  of this build (it previously had only `base` + `sm`). See `Button.figma-notes.md`.

## Notes
- Card `width` is fluid (`100%`) — Figma's `376px` is the frame width; ActionCards stretch to
  their container. The title uses `flex: 1` + `min-width: 0` + ellipsis to truncate.
- Height is fixed via `min-height: --ao-spacing-10` so both Action variants share the same row
  height (the Chevron variant's content alone is shorter).
- Interaction is not exposed by `get_design_context`. Implemented per intent: Action=Button is a
  container `<div>` whose action is the inner "+ add" button; Action=Right Chevron is a whole-card
  `<a>` (chevron is a navigational affordance). Confirm against the Figma prototype if it differs.
- Lucide names: Figma `Icon/24px/Plus` → `plus`; `Icon/24px/ChevronRight` → `chevron-right`.

## Code-first additions (2026-09-30)

| Element | Token |
|---|---|
| `__text` gap | `--ao-spacing-1` |
| `__desc` | `--ao-font-title`, `--ao-font-fixed-2xs`, `--ao-font-regular`, `--ao-leading-sm`, `--ao-text-secondary` (the Modal subtitle's type, the nearest supporting line in the kit) |
| `--disabled` | opacity 0.5, no hover border change, `cursor: not-allowed` |

## Figma build 2026-09-30
`2930:5757` Right Chevron variants: **Show Description** (boolean) + **Description** (text) props; new **State=Disabled**
`3932:145803` (opacity 50%). Height is now min spacing-10, hugging the description.
