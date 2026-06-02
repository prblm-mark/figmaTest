# Datatables — Figma Notes

## Figma Node

- **File:** `Lus07xi8pPXLN87sQIyrEt` (Affino AI Design System)
- **Component set / container:** `2562:8289`
- **Tier:** `Component` → built into `src/components/Datatables/`
- URL: https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2562-8289

## Variant matrix (9 variants)

Properties: **Type × Device × Overflow Content**.

| Node ID | Type | Device | Overflow Content | Built |
|---|---|---|---|---|
| 2562:8288 | Pagination | Desktop | Scroll | ✅ via base `.datatables` |
| 2562:8284 | Pagination | Mobile | Scroll | ✅ via `.datatables.datatables--mobile-scroll` |
| 2562:8286 | Pagination | Mobile | Trigger | ✅ via row markup with `.datatables__row` + `.datatables__row-detail` pairs |
| 2562:8287 | Search | Desktop | Scroll | ✅ via base `.datatables` (toolbar swapped for search input + View/Export buttons) |
| 2562:8285 | Search | Mobile | Scroll | ✅ via `.datatables.datatables--mobile-scroll` |
| 2562:8283 | Search | Mobile | Trigger | ✅ via kebab row markup |
| 2764:2397 | Whos Online | Desktop | Scroll | ✅ via Avatar + Button cells in body rows |
| 2764:2715 | Whos Online | Mobile | Scroll | ✅ via `.datatables--mobile-scroll` + 2-column row (User, Account) |
| 2764:2980 | Whos Online | Mobile | Trigger | ✅ via 2-column row (User, Login) + kebab expand for Account/Touch |

Type × Device are pure layout/style differences. Overflow Content is a markup difference: Scroll uses normal table rows; Trigger uses paired `<tr>` rows where the second row holds a hidden `<dl>` revealed when its sibling row's kebab checkbox is checked.

The **Whos Online** type combines the page-size selector AND the search input in a single toolbar (no action buttons). Body rows compose Avatar + Portraits in the USER cell and a tertiary Button in the ACCOUNT cell; the TOUCH column (Desktop only) shows a centred Lucide `fingerprint` icon and is **not sortable**.

## CSS Class Mapping

| Figma element | CSS class | Notes |
|---|---|---|
| Outer container | `.datatables` | White bg, secondary border, `--ai-radius-md`, `overflow: hidden`. Replaces `.table-wrap` from the Table component. |
| Body scroll wrapper | `.datatables__body` | Inner div around the `<table>` only. `overflow-x: auto` lives here, so the toolbar above and pagination footer below stay fixed while the table content scrolls horizontally. |
| Mobile-scroll wrap | `.datatables.datatables--mobile-scroll` | Adds `max-width: 24rem`; the inner `.datatables__body` handles the scroll. Inner `.table` grows to `width: max-content` with `nowrap` cells |
| Toolbar | `.datatables__toolbar` | Flex row, white bg, bottom border. Padding `12/16` (vertical/horizontal) |
| Toolbar meta (left side) | `.datatables__meta` | Inline flex with text + `.datatables__select` for the row-count picker |
| Page-size select | `.datatables__select` | Button styled as a small select (32px tall, `--ai-radius-md`, chevron-down). Native `<select>` doesn't capture cleanly in Figma so this is a button |
| Toolbar search field | `.datatables__search` | Wraps the existing Input component; constrains to ≤18rem on desktop, full-width on mobile |
| Toolbar actions (right side) | `.datatables__actions` | Flex row of action buttons (uses Button component) |
| Sortable column header | `<button class="datatables__sort">` | Slots inside `<th>`; `--active` modifier flips the chevron icon to dark |
| Footer (pagination) | `.datatables__footer` | Flex row, white bg, top border. Padding `8-9/16` |
| Pagination button group | `.datatables__pagination` | Connected segmented buttons inside a single radius-md outline |
| Pagination button | `.datatables__page-btn` | 40×40 cells. `--active` modifier paints `--ai-datatable-table-footer-bg` background with bold text |
| Kebab toggle (Trigger only) | `<label class="datatables__kebab">` | Wraps a hidden checkbox + `more-vertical` icon |
| Kebab cell | `.datatables__kebab-cell` | Last `<th>`/`<td>` column, fixed 48px wide |
| Visible row | `<tr class="datatables__row">` | Pairs with the next sibling row |
| Detail row | `<tr class="datatables__row-detail">` | Hidden by default; revealed when the prev row's kebab input is `:checked` |
| Detail definition list | `<dl class="datatables__detail-list">` | 2-column grid of `<dt>` (uppercase label) / `<dd>` (value) pairs |
| User cell (Whos Online USER column) | `<div class="datatables__user-cell">` | Avatar + 2-line name/role stack |
| User text wrap | `<div class="datatables__user-text">` | Inside `.datatables__user-cell` — column of name + role |
| User name | `<span class="datatables__user-name">` | Title bold fixed-xs text-primary |
| User role / subtitle | `<span class="datatables__user-role">` | Body medium fixed-xs text-contrast |
| Centred icon cell (Whos Online TOUCH) | `<span class="datatables__icon-cell">` | Inline-flex; uses `--ai-icon-secondary` |

## Composition

Datatables **wraps the Table component** — the inner `<table class="table">…</table>` uses the production Table CSS for cell padding, header bg, dividers, etc. Datatables only adds the surrounding chrome:

- `Button` (`src/components/Button/`) — toolbar actions, Delete-style buttons, and Whos Online row CTAs
- `Input` (`src/components/Input/`) — search field
- `Table` (`src/components/Table/`) — base table presentation
- `Avatar` (`src/components/Avatar/`) — Whos Online USER cell avatar (size 2)
- `Portraits` (`src/components/Portraits/`) — `<img class="portrait">` inside the Avatar
- Lucide icon `fingerprint` — Whos Online TOUCH column (Desktop only)

## Token Mapping

The Datatables chrome moved to a dedicated `--ai-datatable-*` token namespace
(`components/global/datatable` in the Figma Semantic mode files) on 2026-05-07. The base
Table component (`.table`) still uses generic semantic tokens; Datatables overrides the
column-header bg and cell borders inside `.datatables .table` to switch to the namespaced
tokens.

| Figma value | CSS variable | Role |
|---|---|---|
| `components/global/datatable/table-bg` | `--ai-datatable-table-bg` | Outer container bg, page-size select bg, pagination wrap bg |
| `components/global/datatable/table-header-bg` | `--ai-datatable-table-header-bg` | Toolbar bg (above the table) |
| `components/global/datatable/table-subheader-bg` | `--ai-datatable-table-subheader-bg` | Column-header row bg (inside `.datatables .table thead th`) |
| `components/global/datatable/table-footer-bg` | `--ai-datatable-table-footer-bg` | Pagination footer bg, active page-btn bg, page-btn hover bg |
| `components/global/datatable/table-expanded-bg` | `--ai-datatable-table-expanded-bg` | Expanded row bg + detail-row bg + kebab hover bg |
| `components/global/datatable/table-border` | `--ai-datatable-table-border` | All chrome borders: container, toolbar, footer, pagination dividers, cell borders |
| `text/primary` | `--ai-text-primary` | Body text, page-btn label, sort-active icon |
| `text/secondary` | `--ai-text-secondary` | (inherited via Table) Header text |
| `text/contrast` | `--ai-text-contrast` | Toolbar meta text, footer text, detail-list `<dt>` |
| `icon/contrast` | `--ai-icon-contrast` | Sort-icon (inactive), kebab icon, select chevron |
| `radius/md` (8px) | `--ai-radius-md` | Container, select, kebab, page-btn group |
| `spacing/2` (6px) | `--ai-spacing-2` | Meta gap, kebab→label gap |
| `spacing/3` (8px) | `--ai-spacing-3` | Action gap, footer padding-y, select padding-x |
| `spacing/4` (12px) | `--ai-spacing-4` | Toolbar gap, padding-y |
| `spacing/5` (16px) | `--ai-spacing-5` | Toolbar/footer padding-x, detail-list column gap |
| `spacing/7` (32px) | `--ai-spacing-7` | Select height |
| `spacing/8` (40px) | `--ai-spacing-8` | Page-btn cell size |
| `spacing/9` (48px) | `--ai-spacing-9` | Kebab cell width |
| `font/title` | `--ai-font-title` | All Datatables-specific text |
| `font/fixed-xs` (14px) | `--ai-font-fixed-xs` | Footer text, meta text, page-btn label |
| `font/fixed-xxs` (12px) | `--ai-font-fixed-xxs` | Detail `<dt>` (uppercase labels) |
| `font/medium` | `--ai-font-medium` | Page-size select label |
| `font/bold` | `--ai-font-bold` | Active page-btn, footer `<strong>` |
| `tracking/7` (0.05em) | `--ai-tracking-7` | Detail `<dt>` letter-spacing |

## Token Gaps

None — every value maps to an existing `--ai-*` token.

## Notes / Inconsistencies

- **Compact padding below 768px container width.** `.datatables` is a `container-type: inline-size` context. In `@container (max-width: 767px)`, every element that uses spacing-5/spacing-4 padding at desktop (`.datatables__toolbar`, `.datatables__footer`, `.datatables__detail-list`, and the `.table` header/body cells) drops to a uniform `--ai-spacing-3` (8px) on both axes. The cell rules are scoped under `.datatables` so the base Table component used elsewhere is unaffected.
- **`.datatables__col--tight` column modifier.** Add to a column's header `<th>` and every body `<td>` in that column to drop its right padding below 768px, collapsing the column toward its content so the freed width goes to its neighbour. Used on the **Login** column of the Whos Online · Trigger variant (so the wider User column gets the space). Rule lives in the `@container (max-width: 767px)` block with specificity raised above the cell-padding compaction.
- **Header text colour discrepancy across variants.** Figma binds the header `<th>` text to `--ai-text-primary` in some variants (Pagination Desktop) and `--ai-text-secondary` in others (Search Mobile, sometimes a single column within Pagination Mobile). The component normalises to `--ai-text-secondary` everywhere — inheriting the existing Table component's choice. Worth flagging to the designer.
- **Layout via absolute positioning in Figma.** Figma renders cells with absolute positioning + hardcoded pixel widths (e.g. `w-[356.469px]`). The production CSS uses native `<table>` with `border-collapse: collapse` and lets the browser distribute column widths — semantic, accessible, and resilient to content variation.
- **Mobile scroll-indicator pill.** The Mobile/Scroll variants in Figma include a small `bg-[var(--ai-surface-secondary)] h-[10px] rounded-full w-[180px]` pill at the bottom — a visual stand-in for the scrollbar. The production component uses the browser's native scrollbar.
- **Pagination Mobile Trigger meta is just text** ("10 of 1,289") — no row-count select. Smaller toolbar to save space when the row layout already collapses to kebab.
- **Search Desktop uses a primary Export button** (with `download` icon); the Pagination variants use tertiary buttons throughout. The component HTML demos reflect both patterns.

## Interactivity

- **Kebab row expand**: pure CSS via `:has(.datatables__kebab__input:checked) + .datatables__row-detail`. No JS; no popover dismiss; multiple rows can be open simultaneously. Each kebab is independent.
- **Sort buttons, pagination, page-size select**: visual only — actual sorting/pagination/page-size behaviour is the consumer's responsibility.

## Dependencies

- `Table` (`src/components/Table/`) — inner `<table class="table">` styling
- `Button` (`src/components/Button/`) — toolbar actions + Whos Online row CTAs
- `Input` (`src/components/Input/`) — Search variant's search field
- `Avatar` + `Portraits` (`src/components/Avatar/`, `src/components/Portraits/`) — Whos Online USER cell (size-2 avatar with portrait image)
- Lucide icons — `chevron-down`, `chevron-left`, `chevron-right`, `chevrons-up-down`, `arrow-up-narrow-wide`, `more-vertical`, `filter`, `download`, `search`, `eye`, `fingerprint`
