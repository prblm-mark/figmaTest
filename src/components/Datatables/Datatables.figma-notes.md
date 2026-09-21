# Datatables — Figma Notes

## Figma Node

- **File:** `Lus07xi8pPXLN87sQIyrEt` (Affino AI Design System)
- **Component set / container:** `2562:8289`
- **Tier:** `Component` → built into `src/components/Datatables/`
- URL: https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2562-8289

## Variant matrix (11 variants)

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
| 3648:164786 | **Orders** | Desktop | Scroll | ✅ via `.datatables--orders`, rendered from config |
| 3648:164467 | **Orders** | Mobile | Trigger | ✅ via `.datatables--orders` + container query (ORDER + CUSTOMER only) |

Type × Device are pure layout/style differences. Overflow Content is a markup difference: Scroll uses normal table rows; Trigger uses paired `<tr>` rows where the second row holds a hidden `<dl>` revealed when its sibling row's kebab checkbox is checked.

The **Orders** type (added 2026-09-17 for the Listing Screen template) is the first
Type driven by a **data renderer** rather than hand-authored rows — see
`src/cc/templates/ListingScreen/`. It has no Desktop-Trigger or Mobile-Scroll variant in
Figma, so the set is 11, not 12.

Everything Orders-specific is scoped to `.datatables--orders`. That is deliberate: the
Orders design disagrees with the values the earlier three Types were built from, and the
designer's call (2026-09-17) was to scope rather than migrate so Pagination / Search /
Whos Online keep the rendering they were signed off with. The deltas:

| Element | Types 1–3 | Orders |
|---|---|---|
| Toolbar background | `--ai-datatable-table-header-bg` | `--ai-surface-primary` (desktop only; mobile reverts) |
| Footer background | `--ai-datatable-table-footer-bg` | `--ai-surface-primary` (desktop only) |
| `__user-name` weight | `--ai-font-bold` | `--ai-font-semibold` |
| `__user-role` | `--ai-font-body` / medium / `--ai-text-contrast` | `--ai-font-title` / regular / `--ai-text-secondary` |
| `__user-cell` gap | `--ai-spacing-3` | `--ai-spacing-4` |
| `__page-btn--active` bg | `--ai-datatable-table-border` | `--ai-datatable-table-footer-bg` |
| `__select` height | `--ai-spacing-8` (40px) | `--ai-spacing-7` (32px) |

Only the toolbar background difference is invisible in CC light — the two tokens both
resolve to `#ffffff` there and diverge only in CC dark.

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
- **Toolbar search is full-width below 768px.** At desktop `.datatables__search` is `align-items: flex-end` (content-width, right-aligned) and the Input `--sm` wrap caps at `--ai-size-3` (192px). On a narrow toolbar that fixed width overflowed, so `@container (max-width: 767px)` switches the search to `align-items: stretch` and lifts the wrap's `max-width` to `none` — the field then fills the toolbar's remaining space and shrinks with it.
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


## Row controls: the kebab gained a hover border

2026-09-18, designer. The kebab's hover was a background tint; it now also
draws `1px solid var(--ai-border-secondary)` — the same line the table draws
between its rows. The border is reserved as transparent at rest so the 32px box
does not change size when the pointer arrives.

This came from the Orders listing, where a borderless edit pencil was added
beside the kebab and the two have to read as one set of row controls. The rule
lives here rather than in the template because the pair belongs to the
component: any change to one belongs on both.


## Pagination collapses to a position readout at narrow widths

2026-09-21, designer. Seven page buttons plus two arrows cannot fit beside a
count on a phone: measured at 390px the pager ran off the right edge from page
6 onward, and "Showing 1–20 of 140 results" wrapped to two lines.

Below a 767px CONTAINER the numbered buttons are replaced by "Page 3 of 7" and
the count drops its two framing words, leaving "1–20 of 140". Both fit on one
row afterwards — 251px of content in 374px — so the footer is not stacked;
stacking is the fallback for when compressing is not enough, and it costs a row
of height on the screen with the least of it.

This is the common pattern rather than a house one: Material's table
pagination, Polaris and Carbon all drop numbered buttons for arrows plus a
position readout at small sizes, and GOV.UK keeps only a heavily windowed set.
Jumping to page 5 is a desktop gesture; on a phone it is next and previous that
get used.

**Both forms are always rendered and CSS picks one** — JS cannot read a
container query, and the swap is a container-width question (CLAUDE.md §4a).

One thing the swap broke and had to be fixed with it: the group's dividers were
`.datatables__page-btn + .datatables__page-btn`, and `+` still counts a
`display: none` sibling — so whichever of the two forms was hidden, the Next
arrow lost its divider whenever the hidden member sat in front of it. The
dividers now sit between the GROUP's children (arrow, number set, readout,
arrow), with a second rule between the numbers inside their own wrapper.


## The kebab gets the row's gutter

2026-09-21, designer. Figma's mobile frame puts the kebab cell flush to the
row edge (`--ai-spacing-0` both sides). Overruled: flush reads as the control
falling off the table, and since the kebab is the last thing in the row, the
row's right-hand gutter has to come from that cell or it does not exist.

- **Right: `--ai-spacing-4` (12px)** at narrow container widths — the same
  value the other cells use on their leading edge, so the gutter matches the
  one down the left of the table.
- **Left stays tight (4px)** where the pencil is beside it: the two are one
  pair, and that was the point of tightening it.
- **Left becomes 12px below 1024**, where the device rule hides the pencil.
  With nothing to pair with, 4px is a collision with whatever data column
  happens to end the row rather than a pairing.

That last rule sits AFTER the container block on purpose: the two selectors
carry the same specificity, so source order decides, and this one has to win
where they overlap — a narrow container on a phone.

An instruction that overrides the Figma frame, not a reading of it, so the file
wants updating rather than this being "corrected" back to flush.

Tuned down twice on screen, and the final values are **8px right at desktop**
(down from the 16 every other cell takes) and **6px right when the container is
narrow**. The kebab is a 32px box with its own internal breathing room, so the
cell's padding is the only thing between the icon and the table edge — at 16 it
read as a margin rather than a gutter. Left stays 4px beside the pencil, 8px
below 1024 where there is no pencil to pair with.

Measured: the kebab box sits 6-14px off the row edge depending on width, the
variation being the fit giving that column its measured width rather than
exactly the content's.

## …and the chip follows its column

Same change, same cause as the title: under fixed layout the account/section
chip was CROPPED when the fit handed its column less than the chip's 160px cap.
`max-inline-size: min(var(--ai-size-2), 100%)` — the percentage resolves,
because a fixed-layout cell has a definite width — so the chip ellipsises at
the column instead of overflowing it. `sizeColumns` also stops taking a snug
column below 128px when it is trimming to fit, which is the width at which a
chip is still worth reading.


## The active sort chevron is neutral, not brand

2026-09-21, designer: it was the one coloured thing in a row of grey chevrons
and read as a link rather than as a state.

It does not need the colour. The control is a chevron PAIR at rest and a single
direction chevron once a column is sorting, so the shape already carries the
state — and `--ai-text-primary` matches the label sitting beside it, so the two
now darken together.

Worth knowing how it got there: **two rules 900 lines apart set the same
property to different values**, `--ai-text-primary` first and `--ai-icon-brand`
second, and the later one quietly won. The duplicate is gone with the fix.

Measured, active / inactive / label: light `rgb(0,34,47)` / `rgb(153,170,177)` /
`rgb(0,34,47)`; dark `rgb(241,245,249)` / `rgb(148,163,184)` / same; CC as
light. Icon and label match in every mode, and the active one is plainly
darker than the rest without being a different hue.
