# Listing Screens — Build Rules for the Backend Team

> **Who this is for:** the team wiring and building out the ~400 Control Centre listing
> screens from the `ListingScreen` template.
> **What it is:** every rule, behaviour and design decision the template already encodes, so
> that screen 400 looks and behaves like screen 1.
> **What it is not:** the data/API contracts — those live in
> [`HANDOVER.md` § Surface: ListingScreen](../HANDOVER.md#surface-listingscreen) and
> [`docs/handover-manifest.json`](handover-manifest.json). Read both.
>
> Written 2026-09-23 from the template code and its decision log
> (`src/cc/templates/ListingScreen/ListingScreen.figma-notes.md`). Where this document and the
> code disagree, **the code wins — and please report the gap.** File references are given so
> every rule can be checked.

**Reference screens** (run `npm install && npm run tokens && npm start`, then open):

| Screen | Page | Why it is a reference |
|---|---|---|
| Orders | `src/cc/templates/ListingScreen/ListingScreen.html` | The fullest: 3 bulk selects, Export, row links, 6+ filters |
| Articles | `…/Articles.html` | Header **Add** action, one bulk select, 1 identity column |
| Article Archive | `…/ArticleArchive.html` | **No** selection (no bulk actions), default filter values, scoped search |
| Media Items | `…/MediaItems.html` | Listing **and grid** layouts, thumbnails, server-side paging |

---

## 1. The ten rules that matter most

If you remember nothing else:

1. **A screen is config, not markup.** Declare it in a `listing-data-<screen>.js` file under
   `LISTING_SCREENS['<key>']`; the shared `ListingScreen.js` builds the filters, table,
   pagination and selection from it. Do not hand-author table rows or per-screen JS.
2. **Only the first 5 filters show as chips.** Order `defaultFilters` so the five that matter
   most come first; everything after the fifth moves automatically into **Add Filters**.
3. **Column order is priority order.** When the table runs out of width, columns drop from the
   end into the row's kebab panel. Put identifying columns first.
4. **Nothing reacts to the window size for layout — it reacts to the content column.** The CC
   sidebar changes the column width with no window resize. Use container queries in CSS and a
   `ResizeObserver` in JS. **Never `matchMedia`.** (Three deliberate `@media` exceptions — §7.)
5. **No bulk actions → no selection.** If a screen can't act on a selection, it gets no
   checkbox column, no select-all and no selection bar. A checkbox that leads nowhere is a dead
   control.
6. **Bulk actions are Selects plus one Apply.** Apply is disabled until a select holds a value.
   Never a row of buttons.
7. **The selection bar and table header are sticky** under the CC header. This works only while
   the page keeps the hooks and overflow rules in §6 — don't wrap the table in anything that
   sets `overflow`.
8. **Tokens only.** Every colour, size, space and radius is an `--ai-*` token. A value with no
   token is a question for the designer, not a hardcode.
9. **Row values are escaped.** Everything goes through `esc()` in `ListingScreen.js` — that is
   the seam where API data arrives. Keep real data verbatim (trailing spaces, odd names).
10. **Permissions decide what renders.** The Add button, the edit pencil and each bulk verb must
    only appear for an operator allowed to use them — the backend supplies that list.

---

## 2. Anatomy of a screen

```
CC Shell (ControlScreen — sidebar, CC header, .cc-control__page scroller)
└── .cc-listing[data-listing="<key>"]
    ├── FilterBar          ← chips (first 5), Add Filters, Views, Search, (Export), (kebab)
    └── .datatables
        ├── toolbar        ← "Show [20]", Edit Columns (≥1024px), layout switch (Media)
        ├── .cc-listing__selection[data-listing-selection]   ← sticky, only when ticked
        ├── .datatables__body > table
        │     ├── thead[data-listing-head]                    ← sticky
        │     └── tbody[data-listing-body]                    ← rows + kebab detail rows
        ├── ul.cc-listing__grid (Media Items grid only)
        └── footer         ← count + pagination
```

**Composes:** ControlScreen shell (linked, not forked) · FilterBar · FilterItem ·
FilterDropdowns (+ FilterDropdownItem, Checkbox, DatePicker) · Datatables · Table · Avatar ·
Select · Button · ButtonGroup · SegmentedControl (Media) · CCHeader actions.

**Script order on every page:** `listing-data.js` first (it declares `LISTING_SCREENS`), then the
screen's own `listing-data-<screen>.js`, then `ListingScreen.js`. `FilterDropdownItem.js` **must**
load too — without it pickers open but nothing can be picked, and it fails silently.
`DatePicker.js` is needed for any date filter.

The header title, the "All <things>" view label and the mock saved views are currently written
in each page's HTML, not read from config.

---

## 3. Screen config reference

`<div class="cc-listing" data-listing="<key>">` selects `LISTING_SCREENS['<key>']`. The key is
also the local persistence key (`affino.listing.<key>` in the demo).

### Screen fields

| Field | Default | Meaning |
|---|---|---|
| `columns` | required | The columns, **in priority order** (§5). |
| `rows` | — | Mock rows; the real payload replaces these. |
| `defaultFilters` | required | The screen's own filters. **Only the first 5 become chips** (§4); the base chips cannot be removed. |
| `moreFilters` | `[]` | The Add Filters catalogue. If empty (after overflow is added), no Add Filters chip renders. |
| `bulkActions` | none | `[{ type: 'select', label, options[] }]`. **Empty ⇒ no select column, no select-all, no bar.** |
| `rowKey` | `'orderNo'` | Row property that identifies a row — routes, selection ids, aria-labels. **Always set it** — the default is Orders'. |
| `routeNoun` | `'order'` | URL slug for the row's view/edit routes. **Always set it.** |
| `rowNoun` | `routeNoun` | What a screen reader says: "Edit archived item 5361", not "archived-item". |
| `identityColumns` | `2` | Leading labelled columns that identify a row: always shown even when they don't fit, **locked on in Edit Columns**, never dropped by the fit. Use **1** when the first column is long text (Articles, Archive, Media) — two long text columns pushed the kebab off a phone. Blank-headed columns (thumbnail, checkbox) don't count. |
| `perPage` | `20` | Initial page size. |
| `perPageOptions` | `[20,50,100,200]` | The page-size menu. Take it from the live screen. |
| `sort` | `{ by: 'Date', dir: 'desc' }` | Initial sort, `by` = a column's `sort` token. **Always set it** — the default is Orders'. An unknown token leaves rows in the order given. |
| `headerActions` | `[]` | e.g. `[{ label: 'Add', icon: 'plus', variant: 'primary' }]` in the CC header. Only if the operator may create. |
| `layouts` | `['listing']` | More than one shows the Listing/Grid switch; the first is the default; `?layout=grid` overrides. |

### Column fields

| Field | Meaning |
|---|---|
| `key` | Row property. |
| `type` | Cell renderer: `text` (default) · `user` (avatar + name + optional role — **reads `row.customer`**) · `order` (the row's **view link**) · `chip` · `thumb` / `media` · structural `select` / `edit` / `kebab`. |
| `label` | Header text. `''` = a structural column: always drawn, never dropped, never in the kebab. |
| `shortLabel` | Shorter header swapped in on narrow tables. |
| `sort` | The live screen's sort token. **Only columns with one are sortable** — whitelist what the live screen sorts. |
| `hug` | Shrink-wrap: natural width, never takes spare width (checkbox, qty, short codes). |
| `snug` | Natural width capped at 224px, never below 128px; the value truncates. |
| *(neither)* | **Fluid** — normally exactly one; absorbs leftover width, floor 192px (floor removed under a 400px table). |
| `truncate` | Truncate without snug's sizing — for title columns (cap 240px, 128 on a narrow table). |
| `cellClass` | Extra class, e.g. `table__cell--right` for money. |
| `link` | `true` makes this column the row's **record link** — its content is wrapped in the `[data-row-link]` anchor that the whole-row click and the keyboard follow. **Every screen needs exactly one** (usually the identity column: Title, or Orders' order number via `type: 'order'`). Text-like cells only — never a chip or a cell that already holds a link or button. |

### Filter fields

| Field | Meaning |
|---|---|
| `name` | Chip text **and** identity — saved views and values are keyed by it. |
| `type` | `text` · `predictive` · `select-options` · `multi-select` · `multi-select-table` · `date-range` · `range` · `checkbox`. Changing which picker a filter uses is a one-word change. **`predictive` is a type-ahead over `options` — it needs them** (or, wired, an options endpoint queried per keystroke); with none there is nothing to pick. For a free-text "contains" search use `text`. |
| `field` | Row path it tests (dot-paths work: `customer.name`). **A filter with no `field` is never active.** |
| `label`, `placeholder`, `options` | Panel heading, field hint, `[{ name, sub? }]`. |
| `checkboxLabel` | For `checkbox`: the sentence beside the box. |
| `mode` | **Required for `checkbox`** — what a tick means: `only` (keep rows where the field is true — "Only first-time buyers"), `exclude` (drop them — "Exclude subscription orders"), `include` (those rows are **hidden until ticked**, whether or not the chip is on the bar — "Include archived content"), `display` (changes what is shown, not which rows — "Show attendee numbers"; filters nothing). Read it off the live label's wording. The row field must be a **boolean**. |
| `fromPlaceholder` / `toPlaceholder` | For `range`. |
| `facets`, `tableColumns`, `tableFields`, `tableColClasses`, `sortable` | For `multi-select-table` (picker pages of 20, sorted ascending first). |
| `defaultValues` | The chip opens already holding these (Archive's Type). |
| `scopedBy` / `scopeFields` / `scopeDefault` | A text filter whose searched fields are chosen by another filter (Archive's "Filter by"), or a fixed multi-field search (Media Title: name, filename, code). "Unset" falls back to `scopeDefault`; "explicitly emptied" matches nothing — they are different states. |

---

## 4. Filter bar & filters

### The five-chip rule

- **`DEFAULT_CHIPS = 5` is a template constant, for all ~400 screens** — not per-screen config.
- At start-up, `defaultFilters` after the fifth are **moved into the Add Filters catalogue**, not
  dropped.
- **"Promoted" means "written into the first five".** There is no promote flag: the screen
  author orders `defaultFilters`. The house rule is **the live screen's first five filters**,
  unless the designer promotes a different one — e.g. Articles shows the live screen's first
  four plus Presentation Style (promoted from sixth), with Multi-displayed moved to More Filters.
  Record any promotion and the reason in the screen's data file.
- The Add Filters panel is listed **alphabetically**, so an overflow filter is not necessarily at
  the top of it.

### Add Filters (Type = More Filters)

- A dashed **Add Filters** chip opens the catalogue. **No Apply** — clicking a facet adds it to
  the bar. Clicking it again removes it from the bar and drops its values (a toggle).
- The five base chips cannot be removed; added ones can.

### Chips and Apply

- Every picker **commits on Apply**, except More Filters. Picking an option only fills the field.
- The chip label rolls up once 4+ values are chosen; the screen reads values from the
  `filter-bar:change { name, values }` event, never from the label.
- The chip's × clears it and resets its picker.

### How filters match rows

- `text` — contains, case-insensitive.
- `date-range` / `range` — either end may be blank; ISO and "28 Sep 2026" both parse.
- `checkbox` — by its `mode` against a boolean row field (see §3); never by label text.
- everything else — exact match, **any** of the picked values (leading/trailing spaces ignored on
  both sides, since real data keeps stray spaces and the picker trims what it reads).
- Filters combine with **AND**, and search is ANDed on top.

### Saved views

- A view = the filters on the bar **and their values, plus column order and hidden columns**.
- **Search is not part of a view** — it survives switching views and never triggers Save view.
- **Save view appears only when the current state differs from the view's baseline**, not
  whenever a filter is set. The screen must call `resetSaveView()` after its first render.
- Views menu: each row has Rename / Copy / Delete. Single click selects, double click renames
  (told apart by a 220ms timer).
- **Copy** makes "Copy of <view>" (then "(2)", "(3)" — names are unique, because views are keyed
  by name) carrying the **source view's filters and columns**, cloned, and stores it like any
  saved view. The bar announces `filter-bar:copy-view` before selecting the copy; the screen
  clones the snapshot. The real CRUD needs a copy endpoint (or a create-from-snapshot).
- Demo persistence is local; the real CRUD contract is `filter-bar-views` / `listing-default-filters`.

### Search

- **Starts at 3 characters.** Below that the bar reports an empty query. FilterBar owns this
  threshold — don't re-implement it.
- Searches **only text the table shows** (text and chip values; name and role for user
  columns), never hidden fields.
- A new search returns to page 1.
- Desktop: a persistent field. Narrow: an icon that opens a full-width takeover with a Back
  button; leaving clears the query.

### Toolbar actions are per screen

- Export (PDF / Excel .xlsx / CSV split button) and the "More actions" kebab exist **only where
  the live screen has them** — Orders today. A screen opts in by including the markup, not by a
  flag. Export hides on narrow columns.

---

## 5. The table

### Column fitting (measured, not breakpointed)

1. Every column is measured at its natural (`max-content`) width.
2. Columns are placed **in declared order**, stopping at the first that doesn't fit — it never
   skips ahead to a narrower one.
3. Anything that doesn't fit moves into the row's **kebab panel** (the detail row).
4. Spare width is shared among fluid and snug columns; hug columns take none.
5. It re-runs from a `ResizeObserver` on the table, on **width changes only**.

On all three measured listing screens the table has **zero horizontal overflow** at every width
from 320px to 1920px. That is a requirement, not a coincidence: the sticky header (§6) depends on
it.

### Edit Columns

- Users can hide/show columns and drag to reorder (grip only). The first `identityColumns` rows
  are locked on (2 on Orders, 1 on Articles / Archive / Media).
- "No room at this width" is one heading, placed where columns stop fitting.
- Changes are part of the saved view.
- **Only on viewports ≥ 1024px** — a deliberate `@media`: it's a device question ("is this a
  laptop?"), and keying it to the table would hide it on a 1024px laptop with the sidebar
  docked (a 557px table). Hidden in grid view.
- Needs a backend: `listing-column-prefs` — `GET/PUT /control/<screen>/columns { hidden:[key] }`.

### Sort

- First click on a new column sorts **descending**; clicking again reverses.
- Compares values, not rendered text; a value is numeric only if the whole value is.
- Re-sorting returns to page 1. `aria-sort` is set on the header cell.
- The active chevron is **neutral** (`--ai-text-primary`), not brand — brand read as a link.

### Pagination

- Order of operations: **filter → sort → page**.
- A fixed-width window: `1 2 3 4 … 14`.
- On a narrow table the numbers collapse to "Page 3 of 7" and the count drops "Showing"/"results"
  — both forms are rendered, CSS picks one.
- Active page carries `aria-current="page"`.
- **Changing page size keeps the first visible row on screen** rather than jumping to page 1.
- A filter change, a new search or a re-sort returns to page 1.

### Rows

- **The whole row opens the record.** A click on any link, button, label or input inside the row
  belongs to that control; a click that ends a text selection is ignored.
- **The record link is a real `<a>`** (`[data-row-link]`) — the keyboard route, middle-click and
  hover preview. Declare it with `link: true` on one column (Title on Articles, Article Archive
  and Media Items) or use the `order` cell type (Orders). It keeps the cell's colour; an underline
  on hover and focus marks it as a link.
- The pointer cursor and hover tint (`datatables--rows-clickable`) are added by the JS **only when
  the screen declares a record link** — never write the class in HTML. A screen without one gets
  rows that don't look clickable, which is correct: **only advertise a click that does
  something.**
- **Edit pencil**: borderless, same box as the kebab, on every row. **Hidden below a 1024px
  viewport** (temporary designer decision — the row click already opens the record, and it cost
  48px on a phone table). Must not render for a row the operator may not edit.
- **Kebab**: opens the detail row with the columns that didn't fit. When nothing is missing it
  says "Every column is showing at this width."
- **Row control hover**: pencil and kebab gain `1px solid --ai-border-secondary` on hover,
  reserved as a transparent border at rest so nothing shifts.
- **Account chip / bordered tertiary buttons**: tertiary's own border token is transparent, so
  these carry `--ai-border-secondary` at rest *and* through hover/focus (otherwise they vanish
  against the hover tint).

### Empty state

- Mirrors EventPicker's no-results state. **There is no Datatables empty state in Figma yet** —
  and the copy is currently Orders-specific (see §10).

---

## 6. Selection & the sticky stack

### Select column and select-all

- The checkbox column comes first — and is **removed automatically when `bulkActions` is empty**.
- **Select-all lives in the header**, with no visible label (accessible name "Select all rows on
  this page"). It ticks **the current page only**, and unticks itself as soon as any row is
  unticked. **No indeterminate state** — Checkbox has no Figma variant for one.
- **Use `data-listing-select-all`, never `data-select-all`** — FilterDropdowns' table picker owns
  that name, and sharing it made a picker's select-all tick every row in the table.

### The selection bar

- Sits between the toolbar and the table, **shown only when something is ticked** and the screen
  has bulk actions. Not in the footer: the grid has no footer, and Delete must not sit beside
  "next page".
- Reads "N items selected" (`aria-live="polite"`).
- **Clear sits beside the count**, not among the actions — it dismisses a state rather than acting
  on rows. Clear resets every select and checkbox. It carries the bordered-tertiary treatment.
- **Actions = one Select per verb group + one Apply.** A select's first row repeats its label and
  picking it unsets the select. **Apply is disabled until a select holds a value.** One Apply
  sends every set select. (Delete should gain a confirm step when wired.)
- Background `--ai-datatable-table-expanded-bg` — it is a *state of the table*, not a notice.
- On a narrow table the actions take their own line in a **2-column grid**, the 160px select cap
  comes off, and inline padding tightens 16 → 12px.
- Selection is kept across paging, filtering and sorting in the demo; only Clear or a reload
  resets it (see §10, issue 7).

### Sticky bar and header

- **The selection bar pins under the CC header** while the table is on screen and leaves with the
  table when you scroll past its end.
- **The column header pins too** — directly under the CC header, or directly under the bar when
  rows are ticked. Select-all stays reachable.
- **One shadow (`--ai-shadow-sm`) at the bottom of whatever is pinned.** If the header is pinned
  it carries the shadow and the bar drops its own.
- **Rows don't jump** when the bar appears or goes: Chrome's scroll anchoring handles it, and
  `holdScrollAcross` covers browsers that don't anchor.
- Verified on all four reference screens, 1400px and 600px wide, light and dark.

**What a new screen must keep for this to work — and what breaks it:**

| Keep | Why |
|---|---|
| `.cc-listing`, `[data-listing-head]`, `[data-listing-selection]` | The CSS and JS hook onto these. |
| `.cc-control__page` as the scroller, with the CC header outside it | The pin edge is the scroller's top. |
| `.datatables { overflow: clip }` | `hidden` makes it a scroll container and nothing sticks. |
| `.cc-listing .datatables__body { overflow-x: clip }` | `auto` makes it the header's scroll container. **Safe only because the table never overflows sideways (§5)** — if a column set could overflow, it will now clip, not scroll. |
| The negative sticky offset = the page's top padding (24px, 12px below a 768px viewport) | A sticky is inset by its scroller's padding; `top: 0` leaves a gap with rows showing through. **If the page padding ever changes, change this with it.** |
| z-index: rows < header (1) < bar (2) < open menus (10/11) | So the bar's own select menus open over the pinned header. |

**Never** wrap the table, or any ancestor up to `.cc-control__page`, in an element with
`overflow: hidden/auto/scroll` — it silently disables both stickies.

### Grid view (Media Items)

- Cards share the same selection as the table (switching layout keeps it).
- Card controls (checkbox, View Album, Slideshow on images, Edit) appear on hover **and on focus**,
  and **always on touch devices** (`(hover: none), (pointer: coarse)`) — otherwise nothing in the
  grid could be selected on a phone.

---

## 7. Responsive rules

- **Default: container queries.** `cs-page` is the page content box; `.datatables` and
  `.filter-bar` are their own containers. Narrow-table rules key on the table, not the window.
- **JS never uses `matchMedia`** for layout — measure the element and watch it with a
  `ResizeObserver`.
- **The deliberate `@media` exceptions** — each is a *device* question, not a room question:
  - Edit Columns hidden below 1024px.
  - Edit pencil hidden below 1024px (temporary).
  - Sticky offset below 768px, mirroring the page padding (the page can't query its own container).
  - Touch reveal for grid controls: `(hover: none), (pointer: coarse)`.
- **Prefer intrinsic fixes to breakpoints**: `min-inline-size: 0` on flex children that must
  shrink, caps not floors (`flex: 0 1 <size>; max-inline-size: <size>`), ellipsis with `nowrap`.
- **Never re-declare `padding` on `.cc-control__page--listing`** — it loads later and silently
  undoes the scrollbar-gutter trim.

---

## 8. Styling rules

- **Tokens only** (`--ai-*`). Borders and shadow offsets may be raw px; nothing else.
- **Shadows** use the 7-step scale (`--ai-shadow-2xs` … `2xl`); dark mode is derived (light × 2).
- **Dark mode** works through `data-theme="dark"` — never write theme-specific values in a screen.
- **Icons** are Lucide `<i data-lucide="…">`, sized with `--ai-icon-size-*`.
- **`white-space: nowrap` is inherited by every table cell** (Table.css). Anything that must wrap
  inside a cell — detail lists, empty-state text, picker tables — needs `white-space: normal`.
  This has bitten three times.
- A container query doesn't raise specificity — put an override right after the rule it
  overrides. State classes on pseudo-elements must match the base selector's specificity (the
  sticky shadow was invisible for exactly this reason).

### Right-align prices and numbers in the production build — direction from Markus (CEO), 2026-09-23

**In the production screens, all prices and number formats are right-aligned in the datatables** —
money, quantities, counts, percentages, totals. Text stays left-aligned. Identifiers that happen
to be digits (order numbers, item IDs) are labels rather than quantities; confirm with Markus
before right-aligning those.

**This applies to the build only, not to the demo screens.** The designer does not agree with the
direction and has deliberately kept every column in the demo left-aligned, Views included. So for
alignment, **do not take the demo as the reference** — follow this note in the build.

- **How:** give the column `cellClass: 'table__cell--right'` in the screen config (Table.css).
- **The header must align with its figures.** `cellClass` reaches the body cells only, so a
  right-aligned column would still have a left-aligned heading. The template needs to pass the
  alignment to the `<th>` (and its sort button) as part of the build.
- **Columns this covers on the four reference screens:** Orders — Order Total, Qty, Subtotal,
  Tax; Articles — Views. Article Archive and Media Items carry no price or quantity columns.

---

## 9. Accessibility checklist per screen

- [ ] A real `<a>` to each row's record (keyboard, middle-click) — the `link: true` column.
- [ ] `aria-label`s on select, edit and kebab controls built from `rowNoun`.
- [ ] `aria-sort` on sorted headers; `aria-current="page"` on the active page.
- [ ] Select-all has an accessible name; the selection count is `aria-live`.
- [ ] Hover-revealed controls also appear on focus and on touch devices.
- [ ] Visually hidden labels keep their accessible names (icon-only layout switch etc.).
- [ ] Contrast ≥ 4.5:1 text / 3:1 UI; focus ring `2px solid --ai-surface-brand`; 44×44 targets.

---

## 10. Known issues to fix before scaling out

Found while writing this document. **Fix these in the template first** — otherwise every one of
the ~400 screens inherits them.

| # | Issue | Status |
|---|---|---|
| 1 | ~~Rows looked clickable but weren't on Articles, Article Archive and Media Items~~ (no record link, yet pointer + hover tint). | **Fixed 2026-09-23**: generic `link: true` column flag, set on Title on all three; the clickable affordance is now only added when a record link exists. Verified: one link per row on all four screens, row click opens the record at 1400 and 390, long titles still truncate. |
| 2 | **Orders-specific values in shared code**: empty-state copy ("No matching orders"), the `sort` fallback `Date`, the `rowKey`/`routeNoun` defaults, `CELL.user` reading `row.customer`, and the class `datatables--orders` doubling as the listing class. | Found in code; set the config fields explicitly on every screen until fixed. |
| 3 | ~~Checkbox filters compared the row value to the checkbox's label text, so ticking one emptied the table~~ (reproduced: Articles 20 → 0). | **Fixed 2026-09-23**: per-filter `mode` (`only` / `exclude` / `include` / `display`) against a boolean field; `include` applies while unticked. All 14 checkbox filters verified through the UI against expected counts; × restores. Demo rows carry flagged mock booleans (`listing-checkbox-fields`). |
| 4 | ~~Articles' Title filter was `predictive` with no `options`, so a typed title never became a value~~. | **Fixed 2026-09-23**: Title's suggestions are the article titles, derived from the rows; pick-list matching now ignores edge spaces. Verified: type "api" → 3 suggestions, pick one → 44 → 1 row; Orders' Customer type-ahead unaffected (140 → 14). |
| 5 | ~~Edit Columns' locked rows, the drag-unhide and the fit's correction loop hard-coded 2~~, not `identityColumns`. | **Fixed 2026-09-23**: one `identityCount(config)` helper read in all four places. Verified: Orders locks 2 rows, the other three lock 1 and their second column now switches off; no horizontal overflow at 8 widths × 3 screens. |
| 6 | ~~Copying a view dispatched nothing, so the copy had no snapshot and wasn't persisted~~ (confirmed in the code; the old behaviour was not run). | **Fixed 2026-09-23**: `filter-bar:copy-view` announced before the copy is selected; the screen clones the source snapshot and stores it; copy names are unique. Verified: copy of a 35-row saved view restores 35 (was 140), a second copy is "(2)", a copy of a shipped view is 140, all persist and restore after reload. |
| 7 | **Selection is not cleared on filter/sort/page change**, so the count can include rows not on screen. Decide whether that is intended before bulk actions go live. | Behaviour decision needed. |
| 8 | Designer flags still open: FilterItem has no "added" variant; Checkbox has no indeterminate variant; no Datatables empty state; pencil-below-1024 is temporary. | Waiting on design. |

---

## 11. Before you call a new screen done

- [ ] Config declares `rowKey`, `routeNoun`, `rowNoun`, `sort`, `perPageOptions`,
      `identityColumns` explicitly (don't inherit Orders' defaults).
- [ ] Exactly one column is the record link (`link: true`, or `type: 'order'`); rows open the
      record by click and by keyboard.
- [ ] `defaultFilters` = the live screen's first five (or a recorded promotion); the rest in
      `moreFilters`; every filter has a `field`; every checkbox filter has a `mode` and a
      boolean field in the row payload.
- [ ] Columns ordered by priority; exactly one fluid column; sort tokens only where the live
      screen sorts.
- [ ] Production build: every price / number column right-aligned (`table__cell--right`), header
      included (§8). Not in the demo — the demo is deliberately left-aligned.
- [ ] `bulkActions` = the operator's permitted verbs, or empty (⇒ no selection UI).
- [ ] No horizontal overflow at 320 / 390 / 600 / 768 / 1024 / 1280 / 1600 / 1920.
- [ ] Sticky bar and header pin flush under the CC header, with rows ticked and without, at
      desktop and phone widths, in light and dark.
- [ ] With the sidebar docked, the table re-fits with no window resize.
- [ ] `grep -rn "TODO(backend" src/` markers for the screen have manifest entries.
- [ ] Accessibility checklist (§9).
