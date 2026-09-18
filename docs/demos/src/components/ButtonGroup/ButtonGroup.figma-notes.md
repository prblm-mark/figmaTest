# ButtonGroup

## Overview

Groups buttons with collapsed borders and shared border-radius. A layout wrapper that composes the Button component — does not define button styles itself.

## Figma Reference

- **Component set:** [ButtonGroup](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2440:945)
- **File:** Affino AI — Design System (`Lus07xi8pPXLN87sQIyrEt`)

## Variant Matrix

| Node ID | Type | Size | Color | Direction |
|---------|------|------|-------|-----------|
| 2440:225 | Standard | Base | Default | Horizontal |
| 2440:740 | Standard | sm | Default | Horizontal |
| 2440:931 | With Icons | Base | Default | Horizontal |
| 2440:932 | With Icons | sm | Default | Horizontal |
| 2440:944 | Dropdown | Base | Default | Horizontal |
| 2440:942 | Dropdown | sm | Default | Horizontal |
| 2440:939 | Icon Only | Base | Default | Horizontal |
| 2440:938 | Icon Only | sm | Default | Horizontal |
| 2440:941 | Icon Only | Base | Brand | Horizontal |
| 2440:940 | Icon Only | sm | Brand | Horizontal |
| 2440:937 | Standard | Base | Default | Vertical |
| 2440:933 | Standard | sm | Default | Vertical |
| 2440:934 | With Icons | Base | Default | Vertical |
| 2440:943 | With Icons | sm | Default | Vertical |
| 2440:936 | Icon Only | Base | Default | Vertical |
| 2440:935 | Icon Only | sm | Default | Vertical |

## CSS Class Mapping

| Figma Variant | CSS Class |
|---------------|-----------|
| Direction=Horizontal | `.btn-group` |
| Direction=Vertical | `.btn-group--vertical` |
| Color=Brand | `.btn-group--brand` |
| Type=Dropdown | `.btn-group .btn-group__dropdown` (add to `.btn-group`) |
| Size=Base buttons | `.btn` (default) |
| Size=sm buttons | `.btn.btn--sm` |
| Type=Icon Only | `.btn.btn--icon` |
| Type=With Icons | `.btn` with `<i data-lucide="...">` child |

## Token Usage

| Property | Token | Value |
|----------|-------|-------|
| Border radius (outer corners) | `--ai-radius-md` | 0.5rem |
| Border collapse | `margin-left: -1px` / `margin-top: -1px` | — |
| Brand bg | `--ai-btn-primary-bg` | via Button tokens |
| Brand text | `--ai-btn-primary-text` | via Button tokens |
| Brand inner border | `--ai-surface-brand-dark` | #0054a3 |
| Dropdown menu bg | `--ai-surface-primary` | #FFFFFF |
| Dropdown menu border | `--ai-border-secondary` | #D1D5DB |
| Dropdown menu shadow | `--ai-shadow-md` | — |
| Dropdown menu radius | `--ai-radius-md` | 0.5rem |
| Dropdown menu offset | `--ai-spacing-2` | 0.375rem |
| Menu item padding | `--ai-spacing-3` / `--ai-spacing-5` | 0.5rem / 1rem |
| Menu item font | `--ai-font-body` / `--ai-font-fixed-xs` | Inter / 0.875rem |
| Menu item hover bg | `--ai-surface-minimal` | #f3f4f6 |

## Dependencies

- **Button** (`src/components/Button/`) — all buttons inside the group are Button component instances

## Split controls use this (2026-09-17)

A "split button" — one label half plus a chevron half that opens a menu — **is
`.btn-group` with two buttons**. Everything such a control needs was already
here:

| Need | ButtonGroup rule |
|---|---|
| halves read as one control | `.btn + .btn { margin-left: -1px }` collapses the shared edge to a single 1px rule instead of two stacking to 2px |
| outer corners only | `.btn { border-radius: 0 }` + `:first-child` / `:last-child` / `:only-child` |
| hovered half paints its whole outline | `.btn:hover, .btn:focus-visible { z-index: 1 }` |

**It had been hand-written twice before anyone checked.** `SeatingPlanner.css`
and then `FilterBar.css` each carried their own copy of those three rules. Both
were deleted on 2026-09-17 and now use `.btn-group`; geometry measured
identical before and after (label half 102.5×40, chevron 42×40, join −1px,
radii 8/0 and 0/8).

**Consumers keep only what is genuinely theirs** — the chevron half's inline
padding, which differs by surface (`--ai-spacing-4` on the FilterBar,
`--ai-spacing-2` on the Seating Planner toolbar), and any panel sizing.

### The menu is Dropdown's, not ButtonGroup's

These consumers pair `.btn-group` with `.dropdown` / `.dropdown__panel` /
`.dropdown-item--xs`, **not** with this component's own `.btn-group__menu`.
That is deliberate: the Dropdown set is what both surfaces already used, what
Figma's menus map to, and what carries the `data-text` bold-reserve and the
size axis. `.btn-group__menu` predates it and now overlaps it — two menu
systems in the design system, flagged here rather than resolved, since
retiring one is a migration of its own.

### Figma

Figma formalised the split *look* on 2026-09-17 as Button Type
`Secondary / Action` (base `3679:17496`, sm `3679:99941`) — a **single** button
with a divider, which cannot provide two click targets. The designer supplied
it as a visual reference and confirmed Figma will be updated to follow the
product: this is a deliberate expansion beyond the current Figma, not a
divergence to reconcile.

## Notes

- The group CSS only handles layout (radius stripping, border collapse, direction, colour override). All button styling (padding, height, font, interactive states) comes from Button.css.
- The Figma source originally used flat frames instead of Button instances. This code-side build composes the real Button component correctly. The Figma frames pushed back should be restructured to use Button instances.
- Dropdown menu items are ButtonGroup-specific elements (not Button instances).
