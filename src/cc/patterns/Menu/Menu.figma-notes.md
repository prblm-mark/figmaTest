# Menu — Figma Notes (Control Centre)

**Figma:** [`node 4061:16921`](https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4061-16921) — "Menu" pattern set, CC Hybrid file.
**Tier:** Pattern
**Files:** `Menu.css`, `Menu.html`, `Menu.figma.ts`, `Menu.figma-notes.md`
**Composes:** the `MainMenuItem` component.

## Variant matrix (8 variants, verified per-variant)

| Type | State | Node | Search? | Layout |
|---|---|---|---|---|
| Control | Default | 4061:17610 | ✓ | MainMenuItem × 10 (CRM, Content, Marketing, …, Custom) |
| Control | Selected | 4061:16922 | ✓ | Same + Content expanded with 8 sub-items |
| Control | Scrolled | 4061:16969 | ✗ | No brand/search; Content expanded (5 sub-items visible) |
| Analysis | Default | 4061:18194 | ✗ | MainMenuItem × 8 (Dashboards, CRM, Content, …, System) |
| Analysis | Selected | 4061:18311 | ✗ | Same + Dashboards expanded with 5 sub-items |
| Favourites | Selected | 4061:18403 | ✓ "Search Favourites" | 3 trash-icon rows (Analysis Dashboard / Articles / CRM) |
| CRM | Default | 4061:17731 | ✓ "Search CRM" | 6 plus-icon menu buttons + Recent (5 contacts) + "show more" |
| CRM | Expanded | 4061:18053 | ✓ "Search CRM" | Same + 3 more recents (8 total) + "show less" |

Type controls layout; State controls which item is selected/expanded and whether the search/brand chrome is visible.

## CSS classes

| Element | Class |
|---|---|
| Panel container | `<nav class="cc-menu">` |
| CRM layout modifier | `.cc-menu--crm` (10px gap + padding instead of 12) |
| Affino wordmark strip | `.cc-menu__brand` (CSS `mask` paints the wordmark in `--cc-mainmenu-icon`) |
| Search input | `<label class="cc-menu__search">` containing search icon + input |
| Items list | `<ul class="cc-menu__items">` |
| Submenu list (under an expanded item) | `<ul class="cc-menu__submenu">` |
| Submenu item | `<li class="cc-menu__submenu-item">` |
| Submenu item trailing icon | `<button class="cc-menu__submenu-item__action">` (e.g. pin, trash) |
| CRM type — groups wrapper | `.cc-menu__crm-groups` |
| CRM type — group | `.cc-menu__crm-group` |
| CRM type — menu button (text + plus icon) | `<button class="cc-menu__md-btn">` |
| CRM type — Recent heading | `<p class="cc-menu__recent-heading">` (bold + white) |
| CRM type — Recent item | `<button class="cc-menu__recent-item">` (label + right-pointing chevron) |
| CRM type — show more/less toggle | `<button class="cc-menu__show-toggle">` |

## Token mapping

| Property | Token |
|---|---|
| Panel bg | `--cc-mainmenu-secondary-bg` |
| Panel width | `--ai-size-5` (280) |
| Panel padding | `--ai-spacing-4` (12 — Control/Analysis/Favourites); `10px` (CRM only) |
| Panel gap | `--ai-spacing-3` (8 — Control/Analysis/Favourites); `10px` (CRM only) |
| Items gap | `--ai-spacing-1` (4) |
| Search field bg | `--ai-surface-primary` (white) |
| Search field border | `--ai-border-secondary` |
| Search field height / padding | 40 / `--ai-spacing-5` horizontal |
| Search placeholder | `--ai-text-contrast` |
| Search input typed | `--ai-text-primary` |
| Submenu padding | `--ai-spacing-3` `--ai-spacing-4` (8 / 12) |
| Submenu item gap | `--ai-spacing-2` (6) |
| Submenu item colour | `--ai-text-invert-secondary` |
| Submenu action icon (pin / trash) | `--cc-mainmenu-icon`, opacity 0 → 0.7 on row hover → 1 on icon hover |
| CRM `md-btn` width | 240 |
| CRM `md-btn` icon size | `--ai-icon-size-md` (20) |
| CRM Recent heading colour | `--ai-text-invert` (white, bold) |
| CRM Recent item colour | `--ai-text-invert-secondary` |
| CRM Recent chevron rotation | `rotate(-90deg)` so chevron-down points right |
| CRM `show-toggle` font | `--ai-font-fixed-xxs` (12) |

The MainMenuItem rows inside `.cc-menu__items` (Control / Analysis) compose the `.cc-main-menu-item` component documented separately.

## Notes / Outstanding

- **Scrolled state** in v1 is just the layout: no brand / no search. Hooking a real scroll-shadow that appears when the items list actually scrolls is a follow-up (no JS yet).
- **CRM-only tokens** like the 10px gap/padding don't exist in the token system as `--ai-spacing-*` values. Hardcoded with comments per the project convention for one-off optical values inside CSS.
- The Type=Analysis variant omits the search input per Figma. If the consuming app needs search there, treat it as an override.
