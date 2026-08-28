# Button — Figma Notes

## Figma Node

**File:** `Lus07xi8pPXLN87sQIyrEt` — Affino AI Design System
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
| Default (Primary) | base, sm, xs | Default, Hover, Focus, Pressed, Disabled |
| Secondary | base, sm, xs | Default, Hover, Focus, Pressed, Disabled |
| Tertiary | base, sm, xs | Default, Hover, Focus, Pressed, Disabled |
| Alert | base, sm, xs | Default, Hover, Focus, Pressed |
| Alert Outline | base, sm, xs | Default, Hover, Focus, Pressed |
| Icon Only | base, sm, xs | Default, Hover, Focus, Pressed, Disabled |
| Icon Only | **2xs** (code-only) | Default, Hover, Focus, Pressed, Disabled |

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
| `Size` | xs | `.btn--xs` |
| `Size` | _(none — see below)_ | `.btn--icon.btn--2xs` |
| `Icon Only` | True | `.btn--icon` |
| `State` | Disabled | `disabled` attr / `.btn--disabled` |

## Icon Slots (text-button variants)

Figma default for all text-button variants has `showLeftIcon=true` — both slots are visible.

| Slot | Placement | Default Lucide icon | HTML |
|---|---|---|---|
| Left / leading | Before label text | `chevron-right` | `<i data-lucide="chevron-right" aria-hidden="true"></i>` |
| Right / trailing | After label text | `arrow-right` | `<i data-lucide="arrow-right" aria-hidden="true"></i>` |

- **Figma default (both icons):** `<i chevron-right>` Label `<i arrow-right>` — use this in parent components unless Figma shows otherwise
- **Icon-only buttons (`btn--icon`):** single centred icon only, no left or right slot

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
| `--ai-leading-xs` | `--ai-leading-xs` | Line height (16px) |
| `--ai-icon-size-sm` | `--ai-icon-size-sm` | Icon size inside base/sm buttons (16px) |
| `--ai-icon-size-xs` | `--ai-icon-size-xs` | Icon size inside xs buttons (12px) |
| `--ai-spacing-2` / `--ai-spacing-3` | same | xs vertical / horizontal padding (6px / 8px) |
| `--ai-spacing-6` | `--ai-spacing-6` | xs icon-only height (24px) |

## Token Gaps — Action Required in Figma

| State | Figma Primitive | Value | Token Needed | Affected Variants | Status |
|---|---|---|---|---|---|
| Primary focus ring | `--ai-surface-brand-light` | `#3a8fff` | ✓ resolved | Primary | ✅ Implemented |
| Alert hover bg | `Red/400` | `#f87171` | `--ai-btn-alert-hover` | Alert, Alert Outline | ✅ Primitive approved |
| Alert focus ring | `Red/400` | `#f87171` | `--ai-btn-alert-focus-ring` | Alert, Alert Outline | ✅ Primitive approved |
| Alert pressed | `Red/600` | `#dc2626` | `--ai-btn-alert-pressed` | Alert | ✅ Primitive approved |

**Note:** Alert hover/pressed/focus states implemented using Figma primitives directly (approved). If semantic tokens are added to Figma in future, update `Button.css` to use `--ai-*` variables.

## Notes

- `button/base` typography: `--ai-font-fluid-xs` (14px), `--ai-font-semibold` (600), `--ai-leading-xs` (16px)
- `button/sm` typography: `--ai-font-fluid-xxs` (12px), `--ai-font-semibold` (600), `--ai-leading-xs` (16px)
- `button/xs` typography: `--ai-font-fluid-xxs` (12px), `--ai-font-medium` (500), `--ai-leading-xs` (16px). xs differs from sm: medium weight (not semibold), `--ai-radius-sm` (4px), `--ai-spacing-1` gap (4px), 12px icons (`--ai-icon-size-xs`), and explicit vertical padding (`--ai-spacing-2`) rather than a fixed-height token — 28px text / 24px icon-only have no spacing token, so xs uses Figma's `py-2` padding directly.
- Secondary = **transparent** bg + `--ai-btn-secondary-border` (visually outlined)
- Tertiary = **transparent** bg + **no border** (ghost/text button); uses dedicated `--ai-btn-tertiary-*` tokens
- Tertiary hover bg: `--ai-btn-tertiary-bg-hover` (#F3F4F6); focus ring: `0 0 0 2px --ai-border-secondary` (no inner white border)
- Secondary and tertiary now have dedicated token sets — no longer sharing `--ai-btn-secondary-*`
- Disabled: `--ai-btn-bg-disabled` for bg/border, `--ai-btn-text-disabled` for text (separate tokens)
- Alert background uses Figma primitive `Red/500` → maps to `--ai-surface-error` (#ef4444)
- `.btn--lg` does **not** exist in Figma — removed from implementation
- Figma exports the component collection key as `compnonents` (typo — do not fix in tokens)

## `btn--2xs` — a 24x24 icon size that led Figma, and is now REDUNDANT

Added 2026-08-25 while building **RoomCard** (`3470:84951`), which places Button instances at
**24x24** with a 12px icon. At the time no existing size produced that.

**Superseded 2026-08-28: the designer squared off the xs icon size, so `.btn--icon.btn--xs` IS
24x24 now and this class duplicates it exactly** — same width, min-height, padding, radius and
icon size. Re-read from the set rather than assumed: every `Icon Only=True, Size=xs` variant
measures 24x24 across all three Types and all five States (Secondary `2926:3565` +
Hover `2926:3577` / Focus `2926:3613` / Pressed `2926:3593` / Disabled `2926:3595`; Primary
`2926:3559`…; Tertiary `2926:3571`…), and `2926:3565` binds `--ai-spacing-6`,
`--ai-icon-size-xs`, `--ai-radius-sm`.

| Size | Icon-only, as drawn in the Button set (`53:2489`) |
|---|---|
| base | 40x40 |
| sm | 32x32 |
| xs | **24x24 — since 2026-08-28. Was 32x24 (Secondary/Tertiary), 28x24 (Primary)** |
| 2xs | 24x24 — **exists only in code, and now duplicates xs** |

**Not retired in the same change, deliberately.** `btn--2xs` has 161 usages across TableCard,
RoomCard, AttendeeCard and SeatingHeader, and its literal string is baked into Code Connect
snippets already published to Figma — so collapsing it into `xs` is a migration plus a
`code-connect:publish`, not a tidy-up to fold into a one-line size fix. Flagged for the designer
to schedule.

Cautionary note for the next audit: this section previously stated xs was 32x24 as settled fact,
and that statement outlived the Figma it described. A dimension recorded in prose here is a
snapshot, not a spec — re-read the set before relying on one.

So RoomCard's buttons are **resized instances**, a Figma-side override rather than a variant. The
designer chose to formalise the size in code (2026-08-25):

```css
.btn--icon.btn--2xs { 24x24, padding 0, --ai-radius-sm, 12px icon }
```

Two things to know about it:

- **It is icon-only on purpose.** There is no text `.btn--2xs`, because Figma defines none, and
  inventing one would be a variant with no Figma counterpart. Writing `btn btn--2xs` without
  `btn--icon` therefore does nothing — the rule is a two-class combination, matching the house
  style of `.btn--icon.btn--sm` / `.btn--icon.btn--xs`.
- **Its radius is set explicitly**, unlike `--xs` which inherits `--ai-radius-sm` from the base
  `.btn--xs` rule. There is no base `.btn--2xs`, so nothing would carry it.
- The icon rule targets **both** `[data-lucide]` and `svg`. `lucide.createIcons()` replaces the
  `<i>` with an `<svg>`, so an `[data-lucide]`-only selector is fragile. Verified 12x12 rendered.

> **Figma follow-up:** add a `Size=2xs` icon-only variant to the Button set so Figma and code
> agree, or resize RoomCard's instances to `xs`. Until then this row is code-ahead-of-Figma.
> **Second consumer waiting:** AttendeeCard's `.attendee-card__action` is the same geometry
> (24px box, 12px icon, `--ai-radius-sm`) built as scoped CSS — worth folding onto `btn--2xs`.
