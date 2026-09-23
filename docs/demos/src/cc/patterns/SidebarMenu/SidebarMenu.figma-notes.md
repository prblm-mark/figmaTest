# SidebarMenu — Figma Notes (Control Centre)

**Figma:** [`node 4053:6183`](https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4053-6183) — "SidebarMenu" pattern set, CC Hybrid file.
**Tier:** Pattern (composite layout)
**Files:** `SidebarMenu.css`, `SidebarMenu.html`, `SidebarMenu.figma.ts`, `SidebarMenu.figma-notes.md`
**Composes:** the `Sidebar` rail pattern and the `Menu` panel pattern, side-by-side in a single flex row.

## Variant matrix

| Device | Node | Sidebar variant | Menu variant |
|---|---|---|---|
| Desktop | 4066:18918 | Desktop / State=Default (or Selected) | Any Type — demo uses Control / Default |
| Mobile  | 4066:18916 | Mobile / State=Default (or Selected / Expanded) | Same — demo uses Control / Default |

The composite itself is purely a layout shell. All visuals come from the two child patterns, and the variant matrices of Sidebar (5 variants — see `Sidebar.figma-notes.md`) and Menu (8 variants — see `Menu.figma-notes.md`) are the authoritative source for which states are valid.

## CSS classes

| Element | Class |
|---|---|
| Wrapper (flex row) | `<div class="cc-sidebar-menu">` |
| Sidebar rail | `<nav class="cc-sidebar">` — see Sidebar pattern doc |
| Menu panel | `<nav class="cc-menu">` — see Menu pattern doc |

`.cc-sidebar-menu` has no visual styling of its own beyond layout + a conditional drop shadow:

```css
display: inline-flex;
align-items: stretch;
height: 100%;
font-family: var(--ai-font-body);
position: relative; /* anchor for the hover-flyout overlay menu */

/* Right-edge shadow only when a menu panel is docked open. */
.cc-sidebar-menu:has(.cc-menu:not([hidden])) {
  box-shadow: var(--ai-shadow-cc-rail);
}
```

## Token mapping

The composite owns one token (added 2026-06-01):

| Token | Light value | Dark value | Where |
|---|---|---|---|
| `--ai-shadow-cc-rail` | `4px 0 4px rgba(0, 0, 0, 0.2)` | `none` | `css/tokens-shadows.css` |

Figma node 4167:4735 (SidebarMenu instance, light mode) binds `drop-shadow(4px 0 4px rgba(0,0,0,0.2))` directly as a raw rgba — no token on the Figma side. The composite uses `box-shadow` (visually equivalent for an opaque rectangle, cheaper to render than `filter: drop-shadow`).

All other tokens are resolved by the child patterns:
- Sidebar tokens: see `Sidebar.figma-notes.md`
- Menu tokens: see `Menu.figma-notes.md`

## Notes

- The Mobile composite uses `.cc-sidebar--mobile` on the rail, which switches the rail to 52px width, tighter spacing (6px gap / horizontal padding), and a 40×40 brand cell. An EllipsisVertical button sits immediately after CircleUser as the next sibling in the flex column — no spacer.
- The host application is responsible for swapping the Menu Type to match the active Sidebar button (e.g. clicking the SlidersVertical button on the rail shows Control; clicking the User button shows Account, etc.). Wiring that interaction is a follow-up — v1 ships the layout only.
- For a different app section, swap the Menu Type by changing the demo block — e.g. add `cc-menu--crm` for the CRM panel layout (which has its own bespoke content shape, not MainMenuItem rows).
- **Submenu pinning** (`sidebar-menu.js` → `initSubmenuPins`): on init a pin button is injected into every nav sub-item that doesn't already carry a trailing action (the Favourites trash rows are skipped). Clicking it toggles `.cc-menu__submenu-item--pinned`, which floats the row to the top of its submenu (`order:-1`) and fills the pin icon; `aria-pressed` + the Pin/Unpin label flip accordingly. State is in-memory only — flagged `TODO(backend:ControlScreen) [submenu-pins]` (per menu tree, not synced desktop↔mobile, lost on reload).
- The right-edge drop shadow (light mode) is gated on `:has(.cc-menu:not([hidden]))` — rail-only state stays shadowless to avoid an orphan-looking shadow next to a 56px rail. Toggling a panel open/closed will animate-in / animate-out cleanly because the shadow shows/hides as part of the existing menu toggle.

## Real Control Centre menu data (2026-09-23)

The Control and Analysis panels are now rendered from **real data** —
`sidebar-menu-data.js`, a snapshot of every visible Control Centre screen on
affino.com from the Hub's control profiles (cache of 2026-09-21): 11 modules,
404 screens. Before this each page hand-wrote its own abridged menu (28 items on
the screens, with a "Settings" group that does not exist in the product).

- **Structure matches affino.com/control/** (designer's call): modules in their
  SortOrder; within a module, its own sections (`CenterPageGroupName`, e.g.
  Manage / Import Export / Settings) in the module's declared order; screens by
  SortOrder within a section. Rendered flat — the design has no section heading
  row — so the grouping shows as order. Screens hidden from their module page
  (`ShowOnCenterPage` false — one, Design Script Sections) are left out.
- **11 of the 12 live modules** (designer's call), Custom (client-bespoke
  modules) included; **System Management is dropped** from the demo — it is
  Affino-internal. New icon, not from Figma: Security `shield`.
- **Analysis panel** is derived from each module's analysis sections
  ("Analysis", "Sales Analysis", "Subscription Analysis") — 8 groups — replacing
  the hand-written Dashboards/CRM pair.
- **How:** `renderMenuData()` in `sidebar-menu.js` replaces the items of every
  `.cc-menu[data-cc-panel="control"|"analysis"] > .cc-menu__items` (desktop and
  mobile) with markup identical to the hand-written markup, BEFORE the
  behaviours bind — so toggles, search, pins and the sticky open group all work
  unchanged. A page that doesn't load the data file keeps its own markup. Each
  item carries `data-control-link` with its real route; items still don't
  navigate (`sidebar-nav-data`).
- **Loaded on:** this demo and the seven CC screens (ControlScreen, ControlHub,
  SeatingPlanner, and the four listing screens). Not the Menu pattern demo,
  which is a static gallery of menu states and does not run this script.

Verified in headless Chrome on all eight pages: 11 groups in live order, 404
items, 11 group icons rendered, a pin on every item, 8 analysis groups; a group
expands; searching "orders" finds Orders, Pro Forma Orders and Previous Orders
Report.

