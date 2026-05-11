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

`.cc-sidebar-menu` has no visual styling of its own beyond:

```css
display: inline-flex;
align-items: stretch;
height: 100%;
font-family: var(--ai-font-body);
```

## Token mapping

This composite owns no tokens of its own. All tokens are resolved by the child patterns:
- Sidebar tokens: see `Sidebar.figma-notes.md`
- Menu tokens: see `Menu.figma-notes.md`

## Notes

- The Mobile composite uses `.cc-sidebar--mobile` on the rail, which switches the rail to 52px width, tighter spacing (6px gap / horizontal padding), and a 40×40 brand cell. An EllipsisVertical button sits immediately after CircleUser as the next sibling in the flex column — no spacer.
- The host application is responsible for swapping the Menu Type to match the active Sidebar button (e.g. clicking the SlidersVertical button on the rail shows Control; clicking the User button shows Account, etc.). Wiring that interaction is a follow-up — v1 ships the layout only.
- For a different app section, swap the Menu Type by changing the demo block — e.g. add `cc-menu--crm` for the CRM panel layout (which has its own bespoke content shape, not MainMenuItem rows).
