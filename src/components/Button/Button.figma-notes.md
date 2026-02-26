# Button — Figma Notes

## Figma Node

**File:** `8OAAokH2JXhIvGZFrlzeKT` — Affino AI Design System
**Components page:** node `1:769`
**Button frame (all variants):** node `53:2489`

| Variant | Node ID |
|---|---|
| Default (Primary) base | `53:2488` |
| Secondary base | `53:2506` |
| Tertiary base | `57:1790` |
| Tertiary Hover (text, base) | `57:1794` |
| Tertiary Hover (icon-only, base) | `57:1848` |
| Tertiary Focus (text, base) | `57:1798` |
| Tertiary Focus (icon-only, base) | `57:1845` |
| Alert base | `60:2407` |
| Alert Outline base (Default) | `60:2423` |
| Alert Outline base (Hover) | `60:2426` |
| Alert Outline base (Focus) | `60:2429` |
| Alert Outline base (Pressed) | `60:2432` |
| Icon Only (Default, base) | `57:1809` |

## Variant × Size × State Matrix

| Type | Sizes | States |
|---|---|---|
| Default (Primary) | base, sm | Default, Hover, Focus, Pressed, Disabled |
| Secondary | base, sm | Default, Hover, Focus, Pressed, Disabled |
| Tertiary | base, sm | Default, Hover, Focus, Pressed, Disabled |
| Alert | base, sm | Default, Hover, Focus, Pressed |
| Alert Outline | base, sm | Default, Hover, Focus, Pressed |
| Icon Only | base, sm | Default, Hover, Focus, Pressed, Disabled |

## CSS Class Mapping

| Figma Property | Values | CSS Class |
|---|---|---|
| `Type` | Default | `.btn--primary` |
| `Type` | Secondary | `.btn--secondary` |
| `Type` | Tertiary | `.btn--tertiary` |
| `Type` | Alert | `.btn--alert` |
| `Type` | Alert Outline | `.btn--alert-outline` |
| `Size` | base | _(none — default)_ |
| `Size` | sm | `.btn--sm` |
| `Icon Only` | True | `.btn--icon` |
| `State` | Disabled | `disabled` attr / `.btn--disabled` |

## Token Mapping

| Figma Variable | CSS Variable | Role |
|---|---|---|
| `--ai-btn-primary` | `--ai-btn-primary` | Primary bg |
| `--ai-btn-primary-hover` | `--ai-btn-primary-hover` | Primary hover bg |
| `--ai-btn-primary-pressed` | `--ai-btn-primary-pressed` | Primary active bg |
| `--ai-btn-secondary` | `--ai-btn-secondary` | Secondary/Tertiary bg; also explicit on Tertiary focus |
| `--ai-btn-secondary-hover` | `--ai-btn-secondary-hover` | Secondary hover bg |
| `--ai-surface-minimal` | `--ai-surface-minimal` | Tertiary icon-only hover bg (57:1848) |
| `--ai-btn-secondary-pressed` | `--ai-btn-secondary-pressed` | Secondary/Tertiary active bg |
| `--ai-btn-disabled` | `--ai-btn-disabled` | Disabled bg (all variants) |
| `--ai-text-invert` | `--ai-text-invert` | Primary/Alert button text |
| `--ai-text-primary` | `--ai-text-primary` | Secondary/Tertiary text |
| `--ai-text-contrast` | `--ai-text-contrast` | Disabled text |
| `--ai-text-error` | `--ai-text-error` | Alert Outline text |
| `--ai-border-secondary` | `--ai-border-secondary` | Secondary border |
| `--ai-border-error` | `--ai-border-error` | Alert Outline border |
| `--ai-surface-error` | `--ai-surface-error` | Alert bg (maps from Figma `Red/500`) |
| `--ai-surface-error-contrast` | `--ai-surface-error-contrast` | Alert Outline hover bg |
| `--ai-surface-primary` | `--ai-surface-primary` | Alert Outline bg |
| `--ai-radius-md` | `--ai-radius-md` | Default corner radius (8px) |
| `--ai-radius-sm` | `--ai-radius-sm` | Small button corner radius (4px) |
| `--ai-spacing-8` | `--ai-spacing-8` | Base height (40px) |
| `--ai-spacing-7` | `--ai-spacing-7` | Small height (32px) |
| `--ai-font-fluid-xs` | `--ai-font-fluid-xs` | Base font size (14px) |
| `--ai-font-fluid-xxs` | `--ai-font-fluid-xxs` | Small font size (12px) |
| `--ai-leading-1` | `--ai-leading-1` | Line height (16px) |
| `--ai-icon-size-sm` | `--ai-icon-size-sm` | Icon size inside buttons (16px) |

## Token Gaps — Action Required in Figma

| State | Figma Primitive | Value | Token Needed | Affected Variants | Status |
|---|---|---|---|---|---|
| Primary focus ring | `--ai-surface-brand-light` | `#3f83f8` | ✓ resolved | Primary | ✅ Implemented |
| Alert hover bg | `Red/400` | `#f87171` | `--ai-btn-alert-hover` | Alert, Alert Outline | ✅ Primitive approved |
| Alert focus ring | `Red/400` | `#f87171` | `--ai-btn-alert-focus-ring` | Alert, Alert Outline | ✅ Primitive approved |
| Alert pressed | `Red/600` | `#dc2626` | `--ai-btn-alert-pressed` | Alert | ✅ Primitive approved |

**Note:** Alert hover/pressed/focus states implemented using Figma primitives directly (approved). If semantic tokens are added to Figma in future, update `Button.css` to use `--ai-*` variables.

## Notes

- `button/base` typography: `--ai-font-fluid-xs` (14px), `--ai-font-semibold` (600), `--ai-leading-1` (16px)
- `button/sm` typography: `--ai-font-fluid-xxs` (12px), `--ai-font-semibold` (600), `--ai-leading-1` (16px)
- Tertiary = white bg + **no border** (visually a ghost/text button)
- Tertiary hover (text): border-secondary appears; bg unchanged
- Tertiary hover (icon-only): `--ai-surface-minimal` bg; no border (separate scoped rule `.btn--tertiary.btn--icon:hover`)
- Tertiary focus: explicit `background-color: --ai-btn-secondary` + border-primary + `box-shadow: 0 0 0 2px --ai-border-secondary`
- Secondary = white bg + `--ai-border-secondary` (visually outlined)
- Alert background uses Figma primitive `Red/500` → maps to `--ai-surface-error` (#ef4444)
- `.btn--lg` does **not** exist in Figma — removed from implementation
- Figma exports the component collection key as `compnonents` (typo — do not fix in tokens)
