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

## Notes

- The group CSS only handles layout (radius stripping, border collapse, direction, colour override). All button styling (padding, height, font, interactive states) comes from Button.css.
- The Figma source originally used flat frames instead of Button instances. This code-side build composes the real Button component correctly. The Figma frames pushed back should be restructured to use Button instances.
- Dropdown menu items are ButtonGroup-specific elements (not Button instances).
