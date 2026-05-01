# Datatables — Figma Notes

## Figma Node

- **File:** `Lus07xi8pPXLN87sQIyrEt` (Affino AI Design System)
- **Component set / container:** `2562:8289`
- **Tier:** `Component` → built into `src/components/Datatables/`
- URL: https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2562-8289

## Variant matrix (6 variants)

Properties: **Type × Device × Overflow Content**.

| Node ID | Type | Device | Overflow Content | Built |
|---|---|---|---|---|
| 2562:8288 | Pagination | Desktop | Scroll | ✅ via base `.datatables` |
| 2562:8284 | Pagination | Mobile | Scroll | ✅ via `.datatables.datatables--mobile-scroll` |
| 2562:8286 | Pagination | Mobile | Trigger | ✅ via row markup with `.datatables__row` + `.datatables__row-detail` pairs |
| 2562:8287 | Search | Desktop | Scroll | ✅ via base `.datatables` (toolbar swapped for search input + View/Export buttons) |
| 2562:8285 | Search | Mobile | Scroll | ✅ via `.datatables.datatables--mobile-scroll` |
| 2562:8283 | Search | Mobile | Trigger | ✅ via kebab row markup |

Type × Device are pure layout/style differences. Overflow Content is a markup difference: Scroll uses normal table rows; Trigger uses paired `<tr>` rows where the second row holds a hidden `<dl>` revealed when its sibling row's kebab checkbox is checked.

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
| Pagination button | `.datatables__page-btn` | 40×40 cells. `--active` modifier paints `--ai-surface-secondary` background with bold text |
| Kebab toggle (Trigger only) | `<label class="datatables__kebab">` | Wraps a hidden checkbox + `more-vertical` icon |
| Kebab cell | `.datatables__kebab-cell` | Last `<th>`/`<td>` column, fixed 48px wide |
| Visible row | `<tr class="datatables__row">` | Pairs with the next sibling row |
| Detail row | `<tr class="datatables__row-detail">` | Hidden by default; revealed when the prev row's kebab input is `:checked` |
| Detail definition list | `<dl class="datatables__detail-list">` | 2-column grid of `<dt>` (uppercase label) / `<dd>` (value) pairs |

## Composition

Datatables **wraps the Table component** — the inner `<table class="table">…</table>` uses the production Table CSS for cell padding, header bg, dividers, etc. Datatables only adds the surrounding chrome:

- `Button` (`src/components/Button/`) — toolbar actions and Delete-style buttons
- `Input` (`src/components/Input/`) — search field
- `Table` (`src/components/Table/`) — base table presentation

## Token Mapping

| Figma value | CSS variable | Role |
|---|---|---|
| `surface/elevated-1` | `--ai-surface-elevated-1` | Container bg, toolbar bg, footer bg, select bg |
| `surface/minimal` | `--ai-surface-minimal` | Page-btn hover, expanded row bg, detail-row bg |
| `surface/secondary` | `--ai-surface-secondary` | Active pagination button bg |
| `border/secondary` | `--ai-border-secondary` | All container/toolbar/footer borders, divider lines |
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
- `Button` (`src/components/Button/`) — toolbar actions
- `Input` (`src/components/Input/`) — Search variant's search field
- Lucide icons — `chevron-down`, `chevron-left`, `chevron-right`, `chevrons-up-down`, `arrow-up-narrow-wide`, `more-vertical`, `filter`, `download`, `search`, `eye`
