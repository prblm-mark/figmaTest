# Sidebar — Figma Notes (Control Centre)

**Figma:** [`node 4055:10681`](https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4055-10681) — "Sidebar" pattern in the CC Hybrid file.
**Tier:** Pattern
**Files:** `Sidebar.css`, `Sidebar.html`, `Sidebar.figma.ts`, `Sidebar.figma-notes.md`

## Variant matrix (5 variants, verified from per-variant `get_design_context`)

| Device | State | Node | Width | Active highlight | Trailing extras |
|---|---|---|---|---|---|
| Desktop | Default | 4061:17211 | 56 | SlidersVertical (workspace) | — |
| Desktop | Selected | 4062:18538 | 56 | SlidersVertical (same) | — |
| Mobile | Default | 4055:10680 | 52 | none | EllipsisVertical at bottom |
| Mobile | Selected | 4062:18581 | 52 | SlidersVertical | EllipsisVertical at bottom |
| Mobile | Expanded | 4062:18629 | 52 | SlidersVertical + EllipsisVertical | 5 extra tool buttons after Ellipsis (Astroid / Info / Star / ALargeSmall / Minimize2) |

**Desktop Default and Selected are visually identical** — the workspace button is highlighted in both. The "State" axis on Desktop only changes which menu item in the partner Menu panel is selected (irrelevant to the Sidebar itself).

## CSS classes

| Element | Class |
|---|---|
| Rail | `<nav class="cc-sidebar">` (`role="toolbar"`) |
| Mobile modifier | `.cc-sidebar--mobile` |
| Brand cell | `.cc-sidebar__brand` (CSS `mask` paints `img/affinoLogo.svg` in `--cc-mainmenu-icon`) |
| Rail button | `<button class="cc-sidebar__btn">` |
| Active button | `.cc-sidebar__btn--active` (or `aria-current="true"`) |
| Spacer (Mobile only) | `.cc-sidebar__spacer` (flex: 1, pushes the trailing more-menu to the bottom on Default/Selected mobile) |

## Tokens

| Property | Desktop | Mobile |
|---|---|---|
| Rail bg | `--cc-mainmenu-primary-bg` | (same) |
| Active button bg | `--cc-mainmenu-secondary-bg` | (same) |
| Hover button bg | `--cc-mainmenu-secondary-bg` | (same) |
| Gap | `--ai-spacing-3` (8) | `--ai-spacing-2` (6) |
| Padding (vertical / horizontal) | `--ai-spacing-4` `--ai-spacing-3` (12 / 8) | `--ai-spacing-4` `--ai-spacing-2` (12 / 6) |
| Brand cell width × height | 40 × 72 | 40 × 40 |
| Rail button | 40 × 40, radius-md | (same) |
| Button icon size | `--ai-icon-size-md` (20) | (same) |
| Icon colour | `--cc-mainmenu-icon` | (same) |

Border widths are kept as `px` per project convention. Mask source for the brand: `img/affinoLogo.svg` (the same wordmark used by ChatSidebar / AiChat); `mask-size: auto 38px` + `mask-position: left center` crops to just the "A" mark.
