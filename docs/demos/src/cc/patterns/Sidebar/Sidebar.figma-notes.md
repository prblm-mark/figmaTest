# Sidebar — Figma Notes (Control Centre)

**Figma:** [`node 4055:10681`](https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4055-10681) — "Sidebar" pattern in the CC Hybrid file.
**Tier:** Pattern
**Files:** `Sidebar.css`, `Sidebar.html`, `Sidebar.figma.ts`, `Sidebar.figma-notes.md`

## Variant matrix (5 variants, verified from per-variant `get_design_context`)

| Device | State | Node | Width | Active highlight | Trailing extras |
|---|---|---|---|---|---|
| Desktop | Default | 4061:17211 | 56 | SlidersVertical (workspace) | — |
| Desktop | Selected | 4062:18538 | 56 | SlidersVertical (same) | — |
| Mobile | Default | 4055:10680 | 52 | none | EllipsisVertical immediately after CircleUser |
| Mobile | Selected | 4062:18581 | 52 | SlidersVertical | EllipsisVertical immediately after CircleUser |
| Mobile | Expanded | 4062:18629 | 52 | SlidersVertical + EllipsisVertical | 5 extra tool buttons after Ellipsis (Astroid / Info / Star / ALargeSmall / Minimize2) |

Mobile rails are NOT padded at the bottom — every button is a direct sibling in the flex column with the standard `--ai-spacing-2` (6) gap. There is no spacer.

**Desktop Default and Selected are visually identical** — the workspace button is highlighted in both. The "State" axis on Desktop only changes which menu item in the partner Menu panel is selected (irrelevant to the Sidebar itself).

## CSS classes

| Element | Class |
|---|---|
| Rail | `<nav class="cc-sidebar">` (`role="toolbar"`) |
| Mobile modifier | `.cc-sidebar--mobile` |
| Brand cell | `.cc-sidebar__brand` (CSS `mask` paints `img/affinoMark.svg` in `--cc-mainmenu-icon`) |
| Rail button | `<button class="cc-sidebar__btn">` |
| Active button | `.cc-sidebar__btn--active` (or `aria-current="true"`) — promotes icon colour and adds bg highlight |

## Tokens

| Property | Desktop | Mobile |
|---|---|---|
| Rail width | `56px` (40 + 8×2) | `52px` (40 + 6×2) |
| Rail bg | `--cc-mainmenu-primary-bg` | (same) |
| Active button bg | `--cc-mainmenu-secondary-bg` | (same) |
| Hover button bg | `--cc-mainmenu-secondary-bg` | (same) |
| Gap | `--ai-spacing-3` (8) | `--ai-spacing-2` (6) |
| Padding (vertical / horizontal) | `--ai-spacing-4` `--ai-spacing-3` (12 / 8) | `--ai-spacing-4` `--ai-spacing-2` (12 / 6) |
| Brand cell width × height | 40 × 72 | 40 × 40 |
| Brand mark size | 28 × auto (mask-size) | 24 × auto (mask-size) |
| Rail button | 40 × 40, radius-md | (same) |
| Button icon size | `--ai-icon-size-md` (20) | (same) |
| Default button icon colour | `--ai-icon-invert-secondary` (#a1b7c3) | (same) |
| Active / hover button icon colour | `--cc-mainmenu-icon` (#f3f6f7) | (same) |

Border widths are kept as `px` per project convention. The brand uses a dedicated mark-only SVG `img/affinoMark.svg` (extracted from `affinoLogo.svg` — just the first path, the infinity-loop mark, 36 × 38). `mask-position: center center` centres it inside the 40×72 (Desktop) or 40×40 (Mobile) cell.
