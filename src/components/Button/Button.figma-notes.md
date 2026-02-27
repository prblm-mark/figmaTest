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
| `--ai-btn-primary-bg` | `--ai-btn-primary-bg` | Primary bg |
| `--ai-btn-primary-bg-hover` | `--ai-btn-primary-bg-hover` | Primary hover + focus bg |
| `--ai-btn-primary-bg-pressed` | `--ai-btn-primary-bg-pressed` | Primary active bg |
| `--ai-btn-primary-text` | `--ai-btn-primary-text` | Primary text (theme-invariant) |
| `--ai-btn-primary-text-hover` | `--ai-btn-primary-text-hover` | Primary hover text |
| `--ai-btn-secondary-bg` | `--ai-btn-secondary-bg` | Secondary bg (transparent) |
| `--ai-btn-secondary-bg-hover` | `--ai-btn-secondary-bg-hover` | Secondary hover + focus bg |
| `--ai-btn-secondary-bg-pressed` | `--ai-btn-secondary-bg-pressed` | Secondary active bg |
| `--ai-btn-secondary-border` | `--ai-btn-secondary-border` | Secondary border (default + pressed + focus ring) |
| `--ai-btn-secondary-border-hover` | `--ai-btn-secondary-border-hover` | Secondary hover border |
| `--ai-btn-secondary-text` | `--ai-btn-secondary-text` | Secondary text |
| `--ai-btn-secondary-text-hover` | `--ai-btn-secondary-text-hover` | Secondary hover text |
| `--ai-btn-tertiary-bg` | `--ai-btn-tertiary-bg` | Tertiary bg (transparent); also focus bg |
| `--ai-btn-tertiary-bg-hover` | `--ai-btn-tertiary-bg-hover` | Tertiary hover bg |
| `--ai-btn-tertiary-bg-pressed` | `--ai-btn-tertiary-bg-pressed` | Tertiary active bg |
| `--ai-btn-tertiary-text` | `--ai-btn-tertiary-text` | Tertiary text |
| `--ai-btn-tertiary-text-hover` | `--ai-btn-tertiary-text-hover` | Tertiary hover text |
| `--ai-btn-bg-disabled` | `--ai-btn-bg-disabled` | Disabled bg (all variants) |
| `--ai-btn-text-disabled` | `--ai-btn-text-disabled` | Disabled text (all variants) |
| `--ai-border-secondary` | `--ai-border-secondary` | Tertiary focus ring |
| `--ai-text-error` | `--ai-text-error` | Alert Outline text |
| `--ai-border-error` | `--ai-border-error` | Alert Outline border |
| `--ai-surface-error` | `--ai-surface-error` | Alert bg (maps from Figma `Red/500`) |
| `--ai-surface-primary` | `--ai-surface-primary` | Alert Outline bg; inner border on primary/secondary focus |
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
- Secondary = **transparent** bg + `--ai-btn-secondary-border` (visually outlined)
- Tertiary = **transparent** bg + **no border** (ghost/text button); uses dedicated `--ai-btn-tertiary-*` tokens
- Tertiary hover bg: `--ai-btn-tertiary-bg-hover` (#F9F9FB); focus ring: `0 0 0 2px --ai-border-secondary` (no inner white border)
- Secondary and tertiary now have dedicated token sets — no longer sharing `--ai-btn-secondary-*`
- Disabled: `--ai-btn-bg-disabled` for bg/border, `--ai-btn-text-disabled` for text (separate tokens)
- Alert background uses Figma primitive `Red/500` → maps to `--ai-surface-error` (#ef4444)
- `.btn--lg` does **not** exist in Figma — removed from implementation
- Figma exports the component collection key as `compnonents` (typo — do not fix in tokens)
