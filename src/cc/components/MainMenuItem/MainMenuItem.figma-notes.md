# MainMenuItem — Figma Notes (Control Centre)

**Figma:** [`node 4057:2802`](https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4057-2802) — "Main Menu" component set, CC Hybrid file.
**Tier:** Component
**Files:** `MainMenuItem.css`, `MainMenuItem.html`, `MainMenuItem.figma.ts`, `MainMenuItem.figma-notes.md`

## Variant matrix

| State | Node ID | Bg | Label colour | Icon / chevron colour | Chevron |
|---|---|---|---|---|---|
| Default | 4057:2801 | transparent | `--ai-text-invert-secondary` | `--ai-icon-invert-secondary` | optional chevron-down (submenu triggers only) |
| Hover | 4057:2811 | `--cc-mainmenu-primary-bg` | `--ai-text-invert-secondary` (unchanged) | `--ai-icon-invert-secondary` (unchanged) | chevron-down |
| Selected | 4057:2830 | `--cc-mainmenu-primary-bg` | `--ai-text-invert` (brightened) | `--cc-mainmenu-icon` (brightened) | no rotation |
| Expanded | 4057:2830 (variant) | `--cc-mainmenu-primary-bg` | `--ai-text-invert` (brightened) | `--cc-mainmenu-icon` (brightened) | chevron-down flipped via `scaleY(-1)` |

**State colour rule:** Hover keeps the Default "dusty" label/icon pair and only adds the bg highlight. Selected and Expanded brighten BOTH the label (`--ai-text-invert`) and the icon/chevron (`--cc-mainmenu-icon`). Expanded additionally rotates the chevron.

## CSS classes

| Element | Class |
|---|---|
| Row | `<button class="cc-main-menu-item">` |
| Selected modifier | `.cc-main-menu-item--selected` |
| Expanded modifier | `.cc-main-menu-item--expanded` (or `aria-expanded="true"`) |
| Icon wrapper | `.cc-main-menu-item__icon` (16×16) |
| Label | `.cc-main-menu-item__label` (flex-grow, ellipsis) |
| Chevron wrapper | `.cc-main-menu-item__chevron` (16×16, rotates 180° via `scaleY(-1)` on Expanded) |

## Tokens

| Property | Token |
|---|---|
| Container width | `100%` — fills the parent list/container so the hover/selected bg spans the full row. |
| Container min-height | `--ai-spacing-8` (40) |
| Padding | `--ai-spacing-3` `--ai-spacing-4` (8 / 12) |
| Gap (icon ↔ label / label ↔ chevron) | `--ai-spacing-3` (8) |
| Border radius | `--ai-radius-md` (8) |
| Font family | `--ai-font-body` |
| Font weight | `--ai-font-medium` |
| Font size | `--ai-font-fixed-xs` (14) |
| Tracking | `--ai-tracking-4` (0) |
| Default label colour | `--ai-text-invert-secondary` |
| Default icon / chevron colour | `--ai-icon-invert-secondary` |
| Selected / Expanded label colour | `--ai-text-invert` |
| Selected / Expanded icon / chevron colour | `--cc-mainmenu-icon` |
| Hover / Selected / Expanded bg | `--cc-mainmenu-primary-bg` |
| Icon size | `--ai-icon-size-sm` (16) |

## Dependencies

- Lucide icons via the host page's existing setup.
- Rows fill their parent container by default (`width: 100%`). When the parent is `.cc-menu__items`, that means the panel's full inner width.
