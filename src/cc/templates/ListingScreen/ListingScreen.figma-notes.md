# Listing Screen — Figma Notes

Tier: **Template** · Product area: **Control Centre / Listing Screens**
Built 2026-09-17 (Pass 1 — Default view).

## Figma Node

| Item | Value |
|---|---|
| File key | `Lus07xi8pPXLN87sQIyrEt` (Affino — Design System) |
| Page | `3644:125909` — "Listings" |
| Built this pass | `3645:148870` (Default · Desktop) · `3648:161126` (Default · Mobile) |
| Datatable type | `3648:164786` (Orders · Desktop · Scroll) · `3648:164467` (Orders · Mobile · Trigger) |
| Shell | `3644:127733` — "CC Shell" (shared with ControlScreen) |

## Why this template exists

Roughly **400 Control Centre screens** are this one layout. They differ in only two
things: which **datatable Type** renders, and which **default filters** show. Both are
config (`listing-data.js`), not markup — so a new screen is a new config entry, not a
new template.

## Variant matrix

The Listings page holds 19 screen frames in three rows. Pass 1 built row 1 only; the
rest are the interaction set and are deliberately deferred (designer's scoping call,
2026-09-17 — "build the screen … then we can work through all of the functionality").

| # | Screen | Desktop | Mobile | Status |
|---|---|---|---|---|
| 1 | Default | `3645:148870` | `3648:161126` | **Built** |
| 2 | Filter Active | `3645:148871` | `3650:166012` | Pass 2 |
| 3 | Wrapping + Multiple Filters | `3645:151046` | `3650:167527` | Pass 2 |
| 4 | View Dropdown | `3645:153953` | `3650:168587` | Pass 2 |
| 5 | New View | `3645:156799` | `3650:169668` | Pass 2 |
| 6 | Save View | `3645:155718` | `3650:170677` | Pass 2 |
| 7 | Actions Menu | `3645:157810` | `3650:171678` | Pass 2 |
| 8 | Datatable Expanded | `3645:158905` | `3650:173002` | Pass 2 |
| 9 | Filter Dropdown / Text | `3664:13374` | — | Pass 2 |
| 10 | Filter Dropdown / Select | `3664:14458` | — | Pass 2 |
| 11 | Filter Dropdown / More Filters | `3664:15491` | — | Pass 2 |

Note: much of rows 2–11 already exists in the **FilterBar** pattern, which was built
from this same page. Pass 2 is finishing and wiring it, not building it cold.

## Template shell — paint values (skill Step 3a)

Every value below traces to a `get_design_context` fetch, not to intuition.

| Wrapper | Property | Figma binding | Applied |
|---|---|---|---|
| Page ground | background | `--cc-ui-primary-bg` | `.cc-control__page` (ControlScreen, reused) |
| Page content | padding | `--ai-spacing-6` (24px) | `.cc-control__page` — already correct, not overridden |
| Content column ("Frame 1") | flex-direction | column | `.cc-listing` |
| Content column | gap | `--ai-spacing-4` (12px) | `.cc-listing` |
| Chrome — top nav | background | `--cc-header-primary-bg` | TopNavigation (reused) |
| Chrome — header band | background | `--cc-header-secondary-bg` | `.cc-header` (reused) |
| Chrome — header band | min-height / padding | `--ai-spacing-11` / `--ai-spacing-5` | `.cc-header` — already correct |
| Header title | font / size / tracking | `--ai-font-title` bold · `--ai-font-fixed-xl` · `--ai-tracking-3` | `.cc-header__title` — already correct |

The shell is **not forked**. In Figma, ControlScreen and every listing screen are
instances of the same `CC Shell` component, so `ControlScreen.css` is linked and its
`.cc-control__*` classes are reused — the same approach SeatingPlanner takes.

`.cc-control__page` already supplies the `cs-page` container context and
`isolation: isolate`, so an open FilterBar dropdown paints above the table for free.

## The header is a contextual override

`get_design_context` on the Chrome instance returns the CC Shell component's **default**
header — avatar, user details, Logout / View Site. The rendered frame shows **none of
it**: just the title "Orders". The screenshot is authoritative. Built as a title-only
`.cc-header--control`, which needed no new CSS, only fewer children.

This is worth remembering for the other ~400 screens: the listing header is always a
bare title.

## Token gaps and Figma-side slips

All three were raised as STOPs and resolved by the designer on 2026-09-17.

| # | Finding | Where | Resolution |
|---|---|---|---|
| 1 | `--spacing-5` **primitive** (not `--ai-spacing-5`) bound to the ORDER NO header + body cells | `3648:164918`, every ORDER NO cell | Normalise to `--ai-spacing-5`. **Figma still needs fixing.** |
| 2 | Raw `px-[12px] py-[8px] gap-[8px]` — unbound — on the ACCOUNT CODE / QTY / ORDER TOTAL header cells, where the other three headers bind `--ai-spacing-5` / `--ai-spacing-2` | `3648:164936/164942/164948` | Normalise all six to `--ai-spacing-5` / `--ai-spacing-2`. This also removed a real 4px header/body misalignment visible in the design. **Figma still needs fixing.** |
| 3 | Mobile customer role bound to raw `12px` | `3648:164504` | Normalise to `--ai-font-fixed-xxs`. **Figma still needs fixing.** |

Mobile header tracking is a raw `0.6px`; that is `--ai-tracking-7` (0.05em) at the 11px
font size, so the token is used. Letter-spacing is in any case a documented raw-px
exception.

## Contextual overrides (Case B)

| Element | Base component | Override | Why not a variant |
|---|---|---|---|
| Account chip | `btn btn--tertiary btn--sm` | `border-color: var(--ai-border-secondary)` | Tertiary's own border token is transparent in every mode. Designer's call: scope it, don't add a Button variant. |
| Initials avatar | `avatar avatar--initials` | brand palette (`--ai-surface-brand-soft-extra` / `--ai-text-brand`) | The Avatar component's own `--initials` is the **info** palette. Applied by analogy with the chip; flagged for the designer to formalise if it turns out to be house style. |

## Column widths are intrinsic, not the Figma pixels

Figma fixes ORDER NO 114, QTY 100, kebab 48, checkbox 32, and min-widths of 250
(CUSTOMER) / 170 (ACCOUNT). None maps to an `--ai-*` token, so writing them would breach
the hardcoded-dimension rule. `.datatables__col--hug` shrink-wraps the narrow columns and
the wide ones absorb the remainder — same visual result, and it holds at every width,
which matters because the content column resizes with no window resize (CLAUDE.md §4a).

## Responsive

Container queries only — no `matchMedia`, no viewport media query. Mobile keeps
**ORDER + CUSTOMER**; the other four columns move into the kebab detail row, which the
renderer builds from the same column list that produced the header, so the two cannot
drift.

Measured at 390px viewport (in-shell, not the component's own 384px canvas): content
column 338px → datatable 275px → table 273px, `scrollWidth === clientWidth`, no overflow.

Two fixes were needed to get there, both found by measuring rather than eyeballing:

1. The row-edit button was built as `btn--icon` (40px). Figma's node is `2926:3566` —
   the Secondary `Icon Only=True, Size=xs` variant, i.e. the stock **`btn--icon btn--xs`**
   (24×24). The wrong size cost 28px and pushed the kebab column off-screen.
2. The mobile kebab cell needed `padding-inline: var(--ai-spacing-0)` per Figma. The
   first attempt silently lost the cascade: `.datatables--orders td.<class>` is (0,2,1)
   against the blanket cell rule's (0,2,2) — equal class count, more elements, so the
   blanket rule won. `.table` was added to the selector to lift it to (0,3,1).

Figma also shortens the ORDER NO header to "Order" on mobile. CSS cannot swap text and
JS must not read a container query, so both strings are rendered and the container query
picks one (`.datatables__label--full` / `--short`).

## Demo chrome: no theme cog on this screen

This template loads **`src/styles/theme-param.js`**, not
`src/components/dark-mode-toggle.js` — the only CC screen that does.

Both apply the saved theme from `<head>` before first paint, using the same
`demo-theme` localStorage key, so the light/dark choice still follows a visitor
here from any other page. The difference is that `dark-mode-toggle.js` also
injects the **demo toolbar** — the fixed gear tab pinned to the right edge.
Dropped at the designer's request (2026-09-17): this template is the shell for
~400 real Control Centre screens, and a demo affordance floating over it reads
as part of the product rather than as demo furniture.

The in-product control is unaffected — the **User Menu dropdown still carries
its ThemeToggle** (Figma HeaderGroup `4146:6685`), driven by `ThemeToggle.js`.
That is the real light/dark switch for this surface; only the demo tab is gone.

Other CC screens keep their cog; nothing shared was changed.

## Page padding and the scrollbar gutter

`.cc-control__page` scrolls and sets `scrollbar-gutter: stable`, which reserves
a 15px gutter on the **end edge only**. ControlScreen compensates by trimming
`padding-right` at both breakpoints, so the content sits evenly against it.

| Breakpoint | padding L | padding R | + gutter | visual L / R |
|---|---|---|---|---|
| Desktop (≥768) | `--ai-spacing-6` (24) | `--ai-spacing-4` (12) | 15 | 24 / 27 |
| Mobile (≤767) | `--ai-spacing-4` (12) | `--ai-spacing-0` (0) | 15 | 12 / 15 |

The mobile row was `--ai-spacing-2` (6px) until 2026-09-17, which read as
**12 / 21** — a 9px lean, three times the desktop tolerance, and present on
every CC screen rather than just this one. Fixed in `ControlScreen.css` so all
of them benefit.

**Exactly even is not reachable by trimming at mobile**: the reserved gutter
(15px) is already wider than the 12px left padding, so the only symmetric
option is `scrollbar-gutter: stable both-edges`, which costs 15px of content on
each side of a 390px screen. Deliberately not taken.

**Do not re-declare `padding` on `.cc-control__page--listing`.** It has the same
specificity as `.cc-control__page` but loads later, so a shorthand there wins
and silently restores the untrimmed right padding — which is exactly how the
39px right gap arose on 2026-09-17.

## Filter pickers — which dropdown each chip opens (2026-09-17)

Figma `3681:99951` ("Filter Dropdown / Options") shows a chip's picker anchored
under it. The assignment per filter is the designer's (2026-09-17), and every
Type is **already built** in `src/patterns/FilterDropdowns/` — nothing new was
drawn or written for this screen.

| Filter | Asked for | FilterDropdowns Type | Node | `type` in config |
|---|---|---|---|---|
| Customer | selection options w/subset | Select Options w/subtext | `3039:5628` | `select-options` |
| User Code | predictive text | Predictive Text Options | `3039:5625` | `predictive` |
| Account | multi select | Multi Select | `3039:5629` | `multi-select` |
| Account Code | predictive text | Predictive Text Options | `3039:5625` | `predictive` |
| Order No. | text | Text | `3039:5633` | `text` |
| Add Filters | more filters | More Filters | `3039:5637` | `more-filters` |

Two notes on the mapping:

- **"w/subset" → w/subtext.** Figma has no "subset" type; `Select Options
  w/subtext` is the one that renders a name plus a secondary line, which is what
  the Customer rows need (name + account · code). Read as a typo.
- **Plain `Predictive Text` (`3039:5638`) does not exist in code.** The pattern
  consolidated it into `Predictive Text Options` on the grounds that predictive
  always reveals options — so both predictive filters get that Type.

**It is config, not markup.** Each filter in `listing-data.js` names its `type`;
`ListingScreen.js` `FILTER_PANELS` maps that to the pattern's markup. Assigning a
different picker to a filter is a one-word change, which is what makes this
survivable across ~400 screens.

### Initialisation order

The chips are rendered by `ListingScreen.js` on `DOMContentLoaded`, which is
**after** `FilterItem.js` and `FilterDropdowns.js` have already auto-initialised
whatever was in the static markup. The rendered nodes would therefore be inert.
`ListingScreen.js` dispatches `listing:rendered` and a module listener
re-initialises — **scoped to the new nodes**, because `FilterItem.init` has no
idempotency guard and re-running it over the document would bind every existing
chip twice. (`FilterDropdowns` does guard, via `__filterDropdowns`.)

`Type=More Filters` carries no `data-filter-dropdowns` attribute and is not
initialised — correct, not a miss: it is chips only, with no select, predictive,
search or apply behaviour. The pattern's own demo has it the same way.

## Files

| File | Role |
|---|---|
| `ListingScreen.html` | Full screen. Shell copied from ControlScreen (same Figma component); page content is the listing. |
| `ListingScreen.css` | Only the content column. 63 lines — everything else is reused. |
| `ListingScreen.js` | Config-driven renderer: thead, tbody, detail rows, pagination. |
| `listing-data.js` | Column config + default filters + rows + paging. **The swap point for real data.** |
| `Datatables.css` | `.datatables--orders` lives with its component, since Type=Orders is a Datatables variant. |

## Backend handover

Markers: `listing-default-filters`, `listing-export`, `listing-orders-rows`.
Contract sketch in `listing-data.js`; rows are shaped from the live
`/control/orders` screen so the mapping is one-to-one. See HANDOVER.md.

## Still open

- **Pass 2**: filter dropdowns, apply/clear, sort, paging, the view menus, row expand.
- **Figma fixes**: the three binding slips above.
- **Mobile frame `3648:161126` is titled "Articles"**, not "Orders" — stale title on the
  designer's side. Built as "Orders" to match the desktop frame and the live screen.
- **Pagination active state**: Figma paints it `--ai-datatable-table-footer-bg`, which in
  CC **light** resolves to the same white as the pagination container — so weight alone
  carries the state. `aria-current="page"` is set, but this is a contrast question for
  the designer, not something to "fix" in code.


## Filter selection + Add Filters (pass 2b)

- **Account starts fully deselected.** Its chip therefore renders Default, and
  ticking 1–3 boxes lists them, 4+ rolls up to `<first>, and N more` — the
  rollup is FilterItem's, not this screen's (see FilterBar notes).
- **Add Filters moves a facet onto the bar.** `LISTING_ORDERS_MORE_FILTERS` is
  now a list of full filter configs rather than bare names, because a chosen
  facet needs the same `type`/`options` as a default filter to open a working
  dropdown. `init()` works on a shallow copy of both filter arrays so
  `LISTING_SCREENS` still describes a *fresh* screen afterwards.
- **`FilterDropdownItem.js` must be loaded.** It carries the option rows' click
  handler; FilterDropdowns.js does not. Without it the pickers open and nothing
  can be selected, silently.

### Open with the designer

The five default filters have assigned dropdown types (Customer = Selection
Options, User Code / Account Code = Predictive, Account = Multi Select,
Order No. = Text). The nine More Filters facets have **not** been assigned one,
so each carries `type: 'text'` — the only type needing no invented option list.
Three clearly want a date picker, which FilterDropdowns already provides
(Date Range / Date In the last / Date Equal To) but this screen does not yet
build; the status/method/type facets want Multi Select once their real option
lists are known. Each is a one-word change in `listing-data.js`.


## Table filtering (pass 2c)

Front-end filtering over the mock rows, so the screen is demonstrable before a
backend exists. `TODO(backend:Listing)` in `listing-data.js` marks the seam:
the real `/control/orders` filters server-side and returns the counts with the
rows, at which point `field` becomes the query-parameter name and
`applyFilters()` goes away.

**Config, not code.** Each filter carries a `field` naming the row property it
tests (`customer.name` walks into the object), so nothing in the renderer knows
an Orders column from a Contacts one.

| Filter | Type | Field | Match |
|---|---|---|---|
| Customer | Selection Options | `customer.name` | exact, any of |
| User Code | Text | `userCode` | contains |
| Account | Multi Select | `account` | exact, any of |
| Account Code | Text | `accountCode` | contains |
| Order No. | Text | `orderNo` | contains |

A **Text** filter is a search — one typed fragment, matched loosely. Every
other type is a pick-list whose values came from the row data itself, so they
match exactly, and several picks mean "any of these". Filters combine with AND.

`User Code` and `Account Code` were Predictive; the designer moved both to
plain Text on 2026-09-17. `userCode` has no column — it exists only so that
filter has something to test.

**Values arrive by event, not by reading the chip.** `FilterItem`'s label rolls
4+ values up into `<first>, and 3 more`, which is lossy, so the bar announces
`filter-bar:change` (`{ name, values }`) on every commit and clear.

**A field-less filter is not active.** It cannot narrow the table, so it must
also not make the footer report a count it did not produce — the nine More
Filters facets are all in that position until they get types and fields.

### Empty state — flagged

`TODO(design:Listing)`: **Datatables has no empty state in Figma.**
`.cc-listing__empty` mirrors EventPicker's `Type=Event Picker (no results)`
(3108:6659) token for token, that being the established treatment on the CC
surface, rather than inventing a second one. It wants a Datatables variant of
its own.

Note the cell keeps table display and the flex column is a `div` inside it: a
`<td>` set to `display: flex` leaves table layout and then ignores its own
`colspan`, collapsing the empty state into the first column.


## Saved views (pass 2d)

A view IS a filter set: which filters are on the bar, in what order, holding
what values. FilterBar owns the list and its rows; the screen owns what a row
MEANS, so snapshots live here in a `WeakMap` keyed by the row element.

- **Save view** → names the view → the snapshot is taken and the row selected.
- **Selecting** a view restores its snapshot: the filter list, the More Filters
  remainder, and every value. Chips are rebuilt (this is the one case where a
  full chip re-render is right) with their pickers already showing the restored
  state — ticked checkboxes, filled fields, selected option rows — which is why
  the panel builders take the values.
- A row with **no snapshot** — the shipped mock views, or a brand-new empty one
  — stands for the unfiltered listing.
- After restoring, `bar.resetSaveView(values)` re-baselines, so the Save view
  CTA is not owed. Change something and it returns; undo the change and it goes
  again.

The bar establishes its baseline before these chips exist, so the screen also
calls `resetSaveView` after the FIRST render — otherwise the bar reads the
initial chips as a change and offers to save the view it just opened on.

TODO(backend:Listing): in memory, like the rest of the saved-views mocking.
→ `POST /control/orders/views { name, filters:[{name,values}] }` and
`GET /control/orders/views`.

Also fixed here: FilterBar's empty-view rule hid `.filter-bar__chips > .filter-item`,
but a chip with a picker is WRAPPED in `.filter-bar__chip`, so the listing's
chips stayed visible in an empty view. The wrapper now carries
`.filter-bar__chip--add` so the rule can spare the Add Filters chip.


## Search (pass 2e)

Free text narrows the table alongside the chips — a search inside a filtered
view searches that view, not the whole listing. The threshold lives in
FilterBar; the screen just reacts to `filter-bar:search`.

**What it looks at is derived from the COLUMN config, not the row object.**
Scanning the row would match things the table never shows: every row would be a
hit for "photos", because that is in the avatar URL. So `searchableText()` walks
the columns and reads `text` / `chip` values plus a `user` cell's name and role.

By the same rule the hidden `userCode` is **not** searchable — it is not on
screen, and it has its own filter chip. Worth a check with the designer if the
expectation is that search reaches fields the listing does not display.

**Search is not part of a saved view**, and survives switching between them: a
view is a filter set, and the search is a transient look inside whichever view
is open. It therefore does not make the Save view CTA appear either.


## Real Orders schema (pass 3)

Columns and filters are now the live screen's, read from the Affino source
(client_key Comrz). Provenance is recorded at the top of `listing-data.js`.
Mark, 2026-09-18: replicate the DATA; the presentation and interaction move
to the new design system — "that is the task".

### What is a reproduction

- **20 data columns** from `OrderProcessingDef.cfm` (`CProperties`, rows
  flagged `l`), plus Account / Account Code which are present on the
  standalone screen and suppressed only when embedded on an account record.
- **Seven sortable columns**, the explicit `hs` whitelist from
  `OrderProcessings.cfm`: `OrderNo.` `Date` `Customer` `Account` `Value`
  `Status` `PaymentStatus`. Everything else silently falls through, so Qty,
  Order Total and Tax carry no sort control however sortable they look.
  Default `Date` descending.
- **Six default filters** — the live "Simple Search" form. Customer and
  Order Owner are autocompletes (→ Predictive); User Code, Account, Account
  Code and Order No. are plain text. Customer and User Code are DIFFERENT
  fields shown at once, as are Account and Account Code.
- **47 advanced filters** with their real widget types and, where the source
  defines them statically, their real option lists (Order Status ×16,
  Payment Status ×3, Order Type ×2, Sub Order Type ×7, Order Method ×2 …).
  DB-lookup option VALUES are mock; the names and types are not.
- `TaxRule` is deliberately absent — accepted by the controller and used in
  the query, but no form renders a control for it. Building one would be
  inventing UI.

### What is new, and says so

- **The chip bar.** The live screen swaps a Simple form for an Advanced one
  behind a `+`; it has no default-chips / Add-Filters model.
- **The search field.** The live `Search` param is an `<input type="submit">`
  — the code only tests `Len(Trim(url.Search))` to mean "a search was
  submitted". There is no keyword box on that screen at all.
- **Edit Columns.** No column picker and no per-user column preference exist
  today. Built as a working prototype at Mark's direction.

### Progressive columns

Every column carries a `tier`; tiers reveal as the TABLE widens (~180px
steps, `@container` on the datatable's own inline size). Tier 1 is the row's
identity and is always present. Measured: 5 columns at a 420px page, 22 at
2300px. At a 900px page the table is NARROWER than at 700px because the CC
sidebar expands — a viewport query would show more columns in less space,
which is the §4a failure mode exactly.

Edit Columns answers a different question from the tier: the tier decides
whether there is ROOM, the picker whether a column is WANTED. A wanted
column with no room still hides, and the panel says "No room at this width"
rather than showing a tick against something invisible. That state is read
back off the DOM (hidden `th` without `--off`) rather than by re-deriving
the breakpoints in JS, which would drift from the stylesheet. The notes
refresh from a `ResizeObserver` on the table, never `matchMedia`.

Order No. and Customer are locked in the picker — without them the table is
a list of anonymous rows.

TODO(backend:Listing): column choices are in memory, like the saved views.


## Sort, paging and column widths (pass 4)

Display follows best practice, not the live screen — Mark, 2026-09-18: "we
dont need to follow what the old one does in terms of display. its just about
the data." So the live `SELECT TOP 500` cap is deliberately NOT reproduced;
paging here covers the whole result set.

**Order of operations: filter → sort → page.** Paging first would sort only
the visible slice; sorting first would page a list the filter is about to
change. Any of the three resetting to page 1 where the old page number stops
meaning anything (a new filter, a new search, a re-sort) — except rows-per-page,
which recomputes the page so the first visible row stays on screen: 20 → 50
while reading page 4 should widen the view around where you were.

**Sorting** is by VALUE, not rendered text — "£1,000.00" sorts before "£9.95"
as a string. A value counts as numeric only if the whole of it is one, so
"£9.95" and "100412" are numbers while "EXT-0412" and "Paid Full" are not. A
second click on the same column reverses; a first click on a new one starts
descending, which is what a date or a value is usually wanted by.

**Pagination is windowed** — first, last, current ± 1, gaps elided, constant
width so the control does not resize as you page: `1 2 3 4 … 14`,
`1 … 6 7 8 … 14`, `1 … 11 12 13 14`.

**140 mock rows**, generated deterministically from the ten seed rows, so
paging and sorting are demonstrable and a screenshot stays reproducible.

### The Customer column squeeze — what it actually was

Not a share-of-slack problem. `Table.css` sets `white-space: nowrap` on every
`th` and `td` so a wide table scrolls rather than squashes. Right for a code
or a date; wrong for "Awaiting Payment Confirmation", which on its own made
the table 1281px inside a 1055px container. Once the table overflows there is
no slack at all, and every fluid column collapses to min-content — Customer
rendering as "Mari…" was that, not a width share.

Three changes, in the order they mattered:

1. **`--snug`**: shrink-to-fit that unsets the nowrap, for the enumerated
   columns. Setting `width: 1%` alone did nothing, because the nowrap it was
   meant to escape comes from the Table component, not from Datatables.css.
   Payment Status 240px → 118px, Order Status 173 → 105.
2. **Customer is the only fluid column** — everything else hugs or snugs, so
   it absorbs all the slack rather than an eighth of it.
3. **Tier thresholds re-tuned against measured widths** rather than an even
   180px step. Revealing a tier ~100px too early does not overflow the table,
   it silently starves Customer — which reads as a truncation bug rather than
   as a breakpoint being wrong, and is why these are measured.

Measured after: no overflow at any width from 420px to 2600px, Customer
between 169px and 569px, 5 columns up to 16.

**Known limitation:** the tier is width-only, so switching columns OFF in Edit
Columns does not promote the remaining ones into the freed space. Someone who
wants Pro Forma ID on a 1500px screen cannot get it by turning others off.
Making the reveal respond to how many columns are ON would fix it, and is a
bigger change than it looks — worth doing deliberately rather than now.


## Edit Columns: reordering, and the gap (pass 5)

### Drag to reorder

Each row in the panel has a grip. The row is made `draggable` only while the
pointer is on that grip, so the checkbox stays clickable and a stray drag on
the label does not start a reorder.

Only the LABELLED columns move — the checkbox, spacer, edit and kebab columns
are structure. The reorder happens on the labelled subset and is written back
into the slots those columns occupied, so structure stays put.

**Reordering also re-tiers.** A column's position IS its priority, so dragging
one to the front is how you say "show me this first". Without it, dragging a
tier-9 column to the top would leave it hidden until 2600px, which reads as
broken. Tiers are reassigned in pairs (`floor(i / 2) + 1`) to match the
thresholds in Datatables.css, and the first two columns — whatever they now
are — become the locked pair and are un-hidden if they had been switched off.
This also answers the limitation flagged in pass 4: a column you want on a
narrow screen is now reachable by dragging it up, rather than unreachable.

### The gap after hiding a column

Customer was the only column that could grow, so ALL the freed width pooled in
it: hiding one column stretched Customer from 267px to 372px, leaving a visible
gap between the name and the next column.

`max-inline-size` does **not** fix this — a max-width on a table cell is
advisory under `table-layout: auto`, and the column stayed at 372. Two changes
did:

1. Customer gets a **preferred** width (`width: var(--ai-size-6)`), not `auto`.
   Auto layout treats `width` as a preference, so it still shrinks when space
   is tight but stops growing at 320px.
2. A **spacer column** before the actions absorbs whatever is left. Nothing
   real stretches, the columns stay closed up, and the row rules still run the
   full width of the table.

The spacer is `role="presentation"` with no accessible name, so screen readers
do not announce an empty column.


## Columns are part of the view (pass 6)

Mark, 2026-09-18: editing the table "constitutes a possible new view
(workflow)" — so a column change is a view change and must surface the same
Save view CTA as a filter change.

The bar owns the CTA but must not learn what a column is, so it exposes
`setViewExtra(string)`: an opaque value folded into the signature it already
compares. The screen sends `columnState()` — the column key order plus the
hidden set — on every visibility toggle and every reorder, and before
re-baselining on a view switch.

Snapshots carry `columns` and `hiddenColumns` alongside the filters, COPIED
rather than referenced: reordering rewrites each column's tier in place, so a
stored reference would quietly follow the live table instead of preserving the
layout as saved.

Verified round trip: hide a column → CTA appears; restore it → CTA goes
(the signature is back at baseline, not merely "something happened");
reorder → CTA appears; save → CTA goes and the layout sticks; switch to All
Orders → the original column order returns; switch back → the saved layout
returns, CTA still hidden.


## Cell truncation and rhythm (pass 7)

Designer, 2026-09-18: Customer too wide, long enumerated values should
truncate, tighter line heights.

- **Customer's preferred width 320px → 240px.**
- **Enumerated values truncate** rather than wrap. The cap lives on an INNER
  span, not on the cell: `max-inline-size` on a `td` is advisory under
  `table-layout: auto`, so the column still sizes to max-content and nothing
  truncates. A block inside the cell has a max-content of its own, which is
  what actually caps the column. The full value stays in the `title`, and the
  kebab detail row deliberately does NOT truncate — it exists to show values
  in full.
- **Line heights**: `th` → `--ai-leading-xs` (16px), `td` → `--ai-leading-sm`
  (20px). Scoped to `.datatables--orders` rather than changed in `Table.css`,
  since the Seating Planner's tables use that component and were not part of
  this ask.

### Tier thresholds, re-measured (again)

Switching the enumerated columns from wrapping to truncating made them
**wider**, not narrower — a 160px cap plus padding beats a two-line wrap — so
the previous thresholds overflowed the table at every width past tier 4. That
does not present as overflow so much as Customer silently collapsing back to
127px, which is the same symptom as the original bug and a good reason to
measure rather than nudge.

Thresholds are now the measured cumulative width of every column up to that
tier, relaxed by ~55px. That 55 is the dial between "more columns" and
"roomier Customer" — the only number in the set that is a judgement rather
than a measurement. At a 1500px page it is the difference between 9 columns
with Customer at 199px and 7 columns with Customer at 240px.

Measured after: no overflow from 420px to 3800px; 6 columns at 420px, 23 at
3800px; Customer at its 240px preference everywhere except where space is
genuinely tight.


## Adaptive column fill (pass 8) — replaces the tier system

Designer, 2026-09-18: dead space where another column would have fitted, and
"I really want to make this a strong feature of the new listing screens."

The tier steps could never deliver it. CSS can only reveal a column at a width
chosen in advance, so between two steps the table always carried slack — ~400px
on a 780px table, room for two more columns. Deciding what fits means knowing
how wide each column WANTS to be, and only layout can answer that.

So the fit is measured:

1. **Measure** — show every column and put the TABLE at `width: max-content`,
   read each column's width, restore. One task, so nothing is painted.
2. **Fill** — walk the columns in order, adding each while it still fits.
   Stop at the FIRST that does not rather than skipping to a narrower one
   further down: order is priority, and a table showing column 8 but not
   column 5 reads as a bug.
3. **Verify and correct** — measure the result and drop the last column while
   the table is still over. A column's measured width is what it wants alone;
   beside different neighbours it can round a few pixels wider, which left one
   width 13px over. Checking the actual outcome beats padding the budget with a
   tolerance that would be wrong somewhere else.

Driven by a `ResizeObserver` on the table body, never `matchMedia` — the CC
sidebar changes this width with no window resize (CLAUDE.md §4a). This is the
case §4a allows JS for; a container query genuinely cannot express it.

### Two traps worth recording

- **Measuring with every column shown gives MIN-content, not natural width.**
  Twenty columns over-constrain a container-width table and each collapses:
  a column that renders at 125px measured 74px, so the fit let two more columns
  in than actually fit. The table has to go to `max-content` for the pass.
- **`width: 1%` on the enumerated columns had to go.** Shrink-wrapping every
  column means any width the fit does not use must pool somewhere — in Customer,
  which ballooned, or in a spacer column, which read as a gap. They are now
  `auto` and share the leftover between them, so there is never a visible gap;
  their content is still capped by `__truncate`, so a long value cannot dictate
  the width. **The spacer column is gone**, and with it the trailing dead space.

### Result

Gap is 0 at every width from 420px to 3800px: 2 columns at the narrowest, 20 at
the widest, and the table always exactly fills its container.

Both column controls feed it. Hiding Order Total promotes Account into the
freed space; dragging Invoices Sent to the top brings it on screen immediately
and pushes the last one off. `tier` is gone from the config — **order is
priority**, which makes the drag handle the control for "show me this first".


## Edit Columns: one heading, not a note per row

The panel used to put "No room at this width" on every affected row — up to
sixteen repetitions of the same sentence. Because the fit fills in ORDER,
everything without room is the tail of the list, so a single heading at the
cut says it once: above the line is on screen, below it is not.

It is the same `dropdown__label` as the "Columns" heading above it (designer,
2026-09-18).

The heading is PLACED into the list rather than the list being regrouped, so
the rows keep their order — which matters, because they are draggable and
dragging across the heading has to mean what it looks like it means.

Note a column switched OFF stays above the line: the heading is about room, not
about the tick. Hiding a fitting column promotes the next one above the line,
since the freed width is immediately re-fit.


## Five default chips, for every screen

`DEFAULT_CHIPS = 5` in ListingScreen.js. A screen's config may list more
filters as defaults — Orders lists the six its Simple Search form shows — and
the extras move to the FRONT of the More Filters panel rather than being
dropped. Order Owner is the first thing offered there, and adding it puts it
straight back on the bar.

The split happens once at init, not at render time, so everything downstream —
adding a filter, saving a view, restoring one — works on the real arrays and
never has to know about the limit. The limit lives in the template rather than
in `listing-data.js` because it applies to all ~400 screens.


## Removing a filter you added

Adding used to be one-way. The chip's face has no room for a remove control:
FilterItem's leading slot holds `+` while empty and `×` once values are set, so
a filter that is on the bar but has no value has nowhere to put one, and a
second `×` on the right would fight the chevron (designer, 2026-09-18 — "feels
clunky"). So removal lives in More Filters, which needs no new affordance:

**More Filters toggles.** The panel is a stable CATALOGUE: a facet no longer
leaves it when added, it turns solid with a check. Clicking it again takes the
filter off the bar. Add and remove are the same gesture in the same place.

A second route — a `Remove filter` action under Apply inside the chip's own
picker — was built and then taken out (designer, 2026-09-18: "just keep more
filters toggle for now"). One way in and out is enough while the pattern
settles; worth revisiting if removing turns out to be common enough that
opening Add Filters each time grates.

Removing drops that filter's values with it and re-filters the table — verified:
Order Status narrowed 20 rows to 9, removing it restored 20.

### Model change

`moreFilters` is a fixed catalogue and `config.added` holds the names the user
has put on the bar, in order. `defaultFilters` — what the bar renders and what
filtering looks names up in — is DERIVED from `baseFilters + added`. Saved views
snapshot `added` rather than the arrays, since the arrays no longer move.

### Flagged for Figma

- **FilterItem has no "already added" state.** Its slot is `+` or `×`, and
  neither means "on the bar, click to remove". Implemented as the solid Default
  treatment with a check; it wants a real variant.


## Edit Columns: no text selection

`user-select: none` on the whole `dropdown__panel--columns`. The rows are
draggable, and a drag that starts anywhere but the grip otherwise sweeps a text
selection across the list — which reads as the drag having failed rather than
as having missed the handle (designer, 2026-09-18).

Scoped to this panel rather than set globally: nothing in it is worth copying,
whereas a table of orders obviously is. Checkbox clicks and grip drags are
unaffected — both re-verified after the change.


## Date filters

Order Date / Payment Date / Delivery Date use the real DatePicker. The screen
now loads `DatePicker.css` + `DatePicker.js` and initialises pickers on
`listing:rendered` alongside the other late-rendered components — without that
the panel drew two inert readonly fields.

**Two date formats meet in the comparison** and both are parsed rather than one
pretending to be the other: rows carry ISO (`2026-09-28`, what a backend
returns) and DatePicker writes what it displays (`28 Sep 2026`).

**Either end may be blank** — an open-ended range is still a range. `valuesIn`
keeps both positions, empty included, because collapsing `['', '5 Sep 2026']`
to one value would be read as "from" rather than "up to". FilterItem drops the
empty half from the chip's label by itself.

The same code serves the numeric ranges (Order No. Range, Price Range), which
use the identical two-field widget — `toNumber` strips currency symbols and
separators so "£1,204.95" compares.

Measured: 20–28 Sep gives 18 rows, all within range; "up to 5 Sep" gives 94,
the latest being 2026-09-05.


## A removed facet kept looking active

Toggling a filter off in More Filters left its facet wearing FilterItem's
`--open` palette — highlighted, but with no tick. It alternated, which is why it
only appeared every other time: FilterItem toggles `--open` on every trigger
click, so the add left it on and the remove cleared it, or the other way round
depending on where the sequence started.

`markFacet` now clears `--open` and `aria-expanded` on both paths. A facet is a
BUTTON, not a chip with a picker of its own — it should never carry that state
at all, whichever way it is being toggled.

Verified across four consecutive toggles: every removed state is identical to
the initial one, class, background and border.


## More Filters is listed alphabetically

Forty-eight facets is a list you scan for a name, not one you read, so the
panel sorts them (designer, 2026-09-18).

A COPY is sorted for display. `config.moreFilters` keeps its own order, which
is provenance — the order the live screen declares its filters — and the added
set is looked up by name, so the sort changes nothing but the reading order.

Side effect worth knowing: the overflow default (Order Owner, the sixth filter
the live Simple Search shows) no longer heads the panel. It sits under O with
everything else.


## Catalogue Item uses the Multi Select Table

Designer, 2026-09-18: a flat checkbox list was the wrong widget. The live
picker is paged and letter-filtered with its own Catalogue ID / Payment Method
/ Zone sub-filters, so an item needs more than a name to tell two apart.

Now `type: 'multi-select-table'` — FilterDropdowns Type=Multi Select Table
(3039:5624), verified against the Figma screenshot: 640px card, four facet
chips (Name / Catalogue Group / Catalogue Item Code / Payment Method), a
Datatables body with Name / Catalogue ID / Zone and a row-link column, Apply.

TODO(backend:Listing): the four sub-filter chips are visual only.

**The table's facet chips are not bar filters.** They are FilterItems inside a
picker, and FilterBar's add-filter click was scoped to any
`.filter-bar__panel .filter-item` — so clicking "Name" in this card would have
put a Name filter on the bar. Scoped to `.filter-dropdowns--more` now.

**Values come from `data-row-value`**, read before the generic checkbox branch:
that branch looks for a `.checkbox__label-text`, which a table row does not
have, and would have come back empty.

Measured: two rows selected gives "Annual Membership, Quarterly Pass" and 47
matching orders; select-all ticks all six and returns the full 140.


## Catalogue Item picker: real data, working sub-filters, responsive

### Real data

Name and Catalogue ID are the REAL CatalogueItem table from Affino's own
affino.com instance — all 42 rows, supplied 2026-09-18. Affino's own store
rather than a client's, deliberately, since this is heading into a prototype.

**Catalogue ID is operator-entered free text**, not a composed string. The real
values are `CRZAF5001`, `1`, `444`, `Cat ID`, `glass-3`, `1243264364326` —
someone typed "Cat ID" into the field. Figma's `affino-ai-123-0-4` is an
invented shape and using it would have misrepresented the column. Duplicate
names are real and normal too: Glass v2…v6, "Affino Social" twice, one course
under both Zen-1 and Zen-2 — which is precisely why this picker is a table and
not a list of names.

The orders' `catalogueItem` values are drawn from this same catalogue, so
picking an item actually matches orders. They were mock names before, and the
filter found nothing.

**Zone is NOT real per row** and is flagged as such in the config. The picker
derives it through a five-table chain (item → SKC → article or media item →
section → channel → zone) that cannot be run from here; these are real zone
NAMES spread across the rows so the sub-filter has something to bite on.
Group and payment methods are invented — the picker matches them by name but no
membership data was available.

### Sub-filters

All four are **free text**, each a substring match. Two corrections this
carried, both of which I had guessed wrong:

- **"Name" is a text box, not an A–Z strip.** The underlying param is called
  `Letter`, which is only a variable name.
- **"Payment Method" here is a text box**, matching the method's name. It is
  NOT the Payment Method multi-select modal used from the Orders bar — a
  different lookup entirely. Same words, two different controls.

Each chip opens its own picker, the same gesture as a chip on the bar.
**A chosen row survives the sub-filters**: filtering after choosing must not
hide what you chose, which is what the live picker's second query is for.

Only **Name and Zone** carry a sort control; Catalogue ID is displayed but is
not a sort key.

### One thing NOT built, deliberately

**The live picker has no paging.** It runs 20 rows with an N+1 probe for "there
is more" — no offset, no cursor. Narrowing the sub-filters is the only
navigation there is. Our picker scrolls the whole 42 instead. Adding a pager
would show something the engine cannot currently do, so it is a design decision
rather than a fidelity detail — raised with Mark rather than assumed.

### Responsive

The card is `min(var(--ai-size-10), 100cqi)` and establishes its own container,
so the table responds to the CARD's width rather than the page's — what fits in
the card is a different question from what fits on screen. Zone drops below
520px, Catalogue ID below 380px; Name never drops, or the picker is a list of
codes. Measured inside the bar at 1700 / 1100 / 820 / 620px pages.


## A sub-filter does not close its picker

Applying a sub-filter narrows the table and leaves the sub-picker open.
Narrowing is an iteration — try a term, see what comes back, adjust — and
closing the control after each attempt makes the user re-open it to make the
next one. The result is behind it and updates live. It closes on a click
elsewhere in the card, like any picker.

The OUTER picker's Apply still closes, because that one commits.


## The column fit was measuring the wrong table

A Multi Select Table picker contains a `.datatables` of its own, and it lives
in the FILTER BAR — which comes first in the DOM. So
`root.querySelector('.datatables__body')` returned the PICKER's body the moment
a Catalogue Item chip existed, and `fitColumns` measured against it: 623px with
the picker open, 0 with it closed. The listing collapsed from nine columns to
six, with the slack pooling in whichever column could take it.

It only showed after the picker's Apply, because that is when `renderResults`
next runs — which made it look like Apply was filtering the main table when it
was not. The counts were right throughout; only the columns were wrong.

Every lookup now goes through `listingTable(root)`, anchored on
`[data-listing-body]` — the one thing only the listing's table has. The same
trap caught my own test script, which is a fair sign of how easy it is to hit.

Sibling of the `own()` fix in FilterDropdowns: once a component can appear
inside another instance of itself, a descendant query is no longer a safe way
to find "my" element.


## Contact Lists uses the Multi Select Table too

Designer, 2026-09-18. The second picker on this screen to become a table, and
it is worth saying why it is one, because the reason is not Catalogue Item's.
There, a name is ambiguous (Glass v2…v6, "Affino Social" twice) and the code
disambiguates it. Here the names are unique — but long, near-duplicate and
untidy, and a flat list of them cannot be read:

- "Think Tanks 2021", "Think Tanks 2021 - Messaging" and "Think Tank 2021 -
  Messaging - Attendees" are three different lists, and the third is *Tank*,
  singular.
- The three 2019 Innovation Briefing download lists differ only after 40
  characters.
- The longest name is 78 characters, so the Name column WRAPS. Truncating it
  would collapse exactly the rows a user is trying to tell apart.

### Real data

The whole `ContactList` table from Affino's own affino.com instance (Comrz),
read from `MultipleLookup.cfm`'s `ContactLists` case, lines 6128–6178. **Two
columns is the entire table there** — Name and Created. No owner, no member
count, no code column. The query joins nothing, so unlike Catalogue Item there
is no derived column standing in for something that cannot be run from here.

**71 of 72 lists.** Code 96 "Affino Team (2019) ID: 2" is `SystemYN = 1`, and
the query excludes system lists on BOTH branches of its union — auto-created
lists are never selectable. That is also the answer when a list exists in the
CRM but cannot be found in this picker.

**Names render verbatim, whitespace included.** "Prospects" carries three
trailing spaces and "Core50 170215" one; nothing trims them, so they sort and
match as typed. Trimming on render would make two distinct lists look like one.
Same rule for the double space in "Breakfast Briefing  Sept 2017" and the
"Donwloads" typo in code 87 — production data, not something to tidy.

Orders carry a `contactList` drawn from this same set, so picking a list
actually narrows the listing.

### Sub-filters: two, and one is a toggle

| Chip | Control | Matches |
|---|---|---|
| Name | free text | `Name LIKE '%…%'`, capped at 50 chars |
| My Contact Lists | **checkbox** | rows created by the current user |

The toggle is the first sub-filter in this system that is neither text nor a
list, so `subFilterRows` grew a boolean branch: ticked means "only rows where
this is true", not "match this value" — the generic equality branch would have
compared the row's field to the checkbox's own label text.

**The toggle's data is shaped like the real thing, and that is the point.**
Comrz has only three distinct creators across these 71 lists, split **54 / 14 /
3** (codes 23, 69 and 70 are the three). Which of the other 68 belongs to which
of the two big creators was not available, so that assignment is filler — the
proportions are what matter, and an even split would have flattered the
control. For the creator of 54 the toggle hides 17 rows and leaves a list that
still needs the Name box; for the creator of 3 it collapses the picker to
three. Nearly a no-op for the person most likely to press it, near-total for
everyone else — worth being able to see in the prototype rather than
discovering after it ships.

The legacy screen injects `label[for="MyContactLists1"]{display:none}` to hide
this checkbox's own label — a patch around a layout problem, not a design. Ours
is labelled properly.

### One deliberate divergence

The live query applies the Name condition to **both** branches of its union, so
searching by name there **hides lists you have already ticked**. That is the
opposite of the Catalogue Item picker, whose selected rows survive every
sub-filter (its second query carries none of them). Both readings were
re-checked against the source; the two pickers really do differ, and the
asymmetry looks accidental rather than designed.

This picker keeps the Catalogue Item behaviour: what you have chosen stays
visible while you look for the next one. Raised with Mark as "which is right?"
rather than reproducing either by default.

### Sorting is new — and it was silently breaking the listing

The live query is `ORDER BY "Select" DESC, "Created" DESC`, hardcoded, with **no
sort control on the screen at all**. Name and Created sort here, ascending on
the first click (a picker is a lookup, where A–Z is the useful start; the
listing starts descending because a date or a value is what you sort it by).
The default order is still the live one.

Wiring it up exposed a bug that had been sitting under Catalogue Item since it
was built. Its headers were rendered as `.datatables__sort` buttons with no
`data-sort` — decorative. But the listing's sort handler is bound to `root`,
and the picker is inside it, so a click on the picker's "Name" header read
`data-sort` as `null`, **cleared the listing's sort and re-rendered it**. Now
the picker's headers carry `data-picker-sort="<row field>"` and sort their own
table, and the listing's handler returns early for anything inside a
`.filter-dropdowns`.

Same shape as the `listingTable()` and `own()` fixes: a component that can
contain another instance of a component breaks every "find my element" query
that reaches downward.

### Columns are per-picker now

`PICKER_DROPPABLE` hard-coded Name / code / zone. A filter can now name its own
`tableColClasses`, and Contact Lists uses `--name` + `--date` — a date is the
one cell in this table that must not wrap, since a date broken over two lines
reads as two values.

### Measured

71 rows at Name/Created; sorting by Name puts the three 2019 briefing lists
first; "think" in the Name box returns exactly the four Think Tank(s) rows; the
My Contact Lists toggle returns 54 of 71; picking a row and applying puts it on
the chip and narrows the listing to its 2 orders, with the listing's own sort
still on Created.

### Not built, same as Catalogue Item

`iMaxRows = 20` with an N+1 probe and no offset — the live picker has no paging
at all. Nothing new to raise; it is the same design decision already with Mark.


## Rows open; the pencil edits

Designer, 2026-09-18. Two destinations per row, and they are different screens:
the row opens the order to **look at**, the pencil opens it to **change**.

### The edit icon is on every row now, and borderless

It was `btn btn--secondary btn--icon btn--xs` (Figma node 2926:3566) and
`mobileOnly` — so editing an order, a primary action on this screen, was
reachable only on a phone. It now renders at every width.

Borderless because of what sits next to it: the kebab is a bare icon, and a
bordered control beside a bare one reads as two different kinds of thing. The
pencil takes the kebab's treatment exactly — same 32px box, same radius, same
hover tint — so the two read as one set of row controls. Any change to one
belongs on both, which is why the CSS says so next to the rule.

The `--mobile` column class went with it. Nothing else was mobile-only, and a
class with no rules left behind is a trap for whoever sets `mobileOnly: true`
next and finds it does nothing.

### Anchors, not click handlers

Both are real `<a href>`s built by `ROUTE.view` / `ROUTE.edit`, and the
whole-row click just follows the row's own link. That is one code path instead
of two, and it is what makes the row keyboard-reachable: the order number is a
link, so Tab and Enter get to the same place the mouse does. Middle-click opens
a tab and hover shows the destination, neither of which a click handler gives
you.

The pencil therefore needs no `stopPropagation` of its own. The row handler
ignores any click that landed on `a, button, label, input, select, textarea`,
which covers the pencil, the select checkbox, the account chip and the kebab's
label in one rule — **a control inside a row owns its click; only the gaps
between them belong to the row**. It also bails when there is a text selection,
so selecting an order number does not navigate away from it.

TODO(backend:Listing) `listing-row-routes`: the hrefs are placeholders
(`#order/<orderNo>/view`, `#order/<orderNo>/edit`). Swapping the two `ROUTE`
functions is the whole change. Flagged in the manifest: **the pencil should not
render for a row the operator may not change** — that is a permission the
payload has to carry, not something the template can infer.

### A clickable row has to say so

Pointer plus a hover tint, reusing the tint the expanded row and the kebab hover
already use, so the table gains a state rather than a new colour. The paired
detail row is excluded — it is the expansion of the row above, not a target.

### Measured

At 1400px the table now shows 8 columns where it showed 7, still filling the
body exactly (955/955) with the same data columns — the pencil's 32px came out
of the slack, not out of a column. At 1000px the count is unchanged. Row click
→ `#order/100412/view`, pencil → `#order/100412/edit`, checkbox → neither.

### The pair, tightened — and a hover border

Designer, 2026-09-18, two refinements to the pencil/kebab pair:

**Gap.** Default cell padding put `--ai-spacing-5` on each side of the join —
32px between the two boxes and 48 between the glyphs, which read as two
unrelated controls at opposite ends of the row rather than a set. The edit
cell's right padding goes to 0 and the kebab cell's left padding to
`--ai-spacing-1`, leaving **4px between the boxes and 20px between the
glyphs**, with both 32px hit targets intact. The kebab keeps its right
padding — that one is the row's edge, not the gap.

**Hover border.** Both now draw the same line the table draws between its rows,
`1px solid var(--ai-border-secondary)`. The border is **reserved as transparent
at rest** rather than added on hover: with `box-sizing: border-box` the box
stays 32px either way, so nothing shifts by a pixel as the pointer crosses it.

Applied to the kebab as well as the pencil, at component level — they are one
set, and a bordered pencil beside an unbordered kebab would undo the reason the
pencil lost its border in the first place.

Measured light and dark: hover border resolves to exactly the row's own border
colour in both (`rgb(220,228,232)` / `rgb(51,65,85)`), box still 32×32.

**Harness note.** Both properties are transitioned, and **CSS transitions never
advance under `--virtual-time-budget`** — so a headless probe reads the
*starting* value and reports `rgba(0,0,0,0)` for a hover colour that is
perfectly correct in a real browser. Three probes chased a phantom before the
`*{transition:none}` injection showed the real value. Already in the repo's
headless notes; worth the reminder next to a hover rule.


## The kebab was revealing nothing

Reported 2026-09-21: opening a row's kebab showed an empty band.

The detail row was built from `col.tier > 1`. **`tier` was removed** when the
measured greedy fit replaced the tier steps, so the filter matched no column
and every detail row had been rendering empty ever since — silently, because an
empty `<dl>` still lays out as a band and looks like a styling problem rather
than a missing list.

The deeper mistake was deciding the list at RENDER time at all. What fits is a
function of the container's width, and that changes with no re-render — docking
the CC sidebar is enough. Any list baked in when the rows are built is wrong
the moment the fit moves.

So every labelled column now renders a `dt`/`dd` pair, and `syncRowDetail`
decides which are visible, reading the verdict off the HEAD cells:

| Head class | Meaning | In the kebab? |
|---|---|---|
| `--nofit` | no room at this width | **yes** — this is what the kebab is for |
| `--off` | switched off in Edit Columns | **no** — the user said they did not want it |

Reading the head rather than recomputing means the detail row cannot disagree
with the table it is explaining. It runs at the end of `fitColumns`, after the
correction loop, so it sees the fit that actually survived — and because every
path (render, Edit Columns, the ResizeObserver) ends in `fitColumns`, there is
one call site rather than three to keep in step.

Each pair is wrapped in a `display: contents` div so the two halves stay in the
list's own grid while the pair toggles as one thing. `[hidden]` in base.css
carries `!important`, so hiding still beats `display: contents`.

When nothing is missing — possible once enough columns are switched off — the
panel says so rather than opening empty. Hiding the kebab entirely would be the
alternative; it would shift the row's right edge as the width changes, which
seemed the worse trade.

Measured: at a 955px table, 5 data columns in the row and the other 15 in the
kebab; at 655px, 3 and 17. The two sets are complements at both widths, and
Account renders as its chip inside the detail list, not as flat text.

**Not verified headlessly:** the resize path. A ResizeObserver never fires for
an iframe resize under `--virtual-time-budget`, so the two widths above are two
separate loads. The RO handler calls `fitColumns`, which is the only thing
`syncRowDetail` depends on.


## The account chip vanished on a hovered row

Reported 2026-09-21, and a direct consequence of the row hover tint.

`.btn--tertiary:hover` out-specifies the chip's contextual border (0,2,0 vs
0,1,0) and sets `--ai-btn-tertiary-border-hover` — **transparent in every
mode**. So hovering the chip removed the only edge it had, and what it fell
back to was `rgb(242,244,245)` against a row tint of `rgb(243,246,247)`: one to
two per channel apart, in both Light and CC. No border, no fill contrast, no
chip. Dark was survivable (`rgb(71,85,105)` on `rgb(41,53,72)`) but is fixed
the same way.

The chip now holds `--ai-border-secondary` through hover and focus — the same
colour the edit icon and the kebab use, so all three row controls draw one
line.

### Scoped to clickable rows, not to Orders

Per the designer: this only applies where a row is a target. The scope is a new
`datatables--rows-clickable` modifier rather than `--orders`, because a row is
clickable when something wired it up, not because the table holds orders — and
the listing template is meant to serve ~400 screens.

**The class is added by the code that binds the row click**, not written into
the HTML. A datatable can then never advertise an affordance it does not have,
which is the failure mode a hand-applied class invites. Verified: the listing
carries the class and its rows read `cursor: pointer`; the Datatables component
demo carries neither.

### On verifying a `:hover` rule headlessly

You cannot hover in headless Chrome, and forcing the state with a class tests
your own class rather than the cascade. What settles it is enumerating every
`border-color` rule that matches the chip and ranking them: three rules match,
and `.datatables--rows-clickable .datatables__account-chip:hover` carries one
more class than `.btn--tertiary:hover`, so it wins. Worth knowing the
distinction — the earlier transition trap on this same pair of icons was a
measurement artefact, and this one would have been too.

### The panel flows into columns

Designer, 2026-09-21. One pair per line made 15 hidden columns a 425px scroll
for a row whose point is to be glanced at. The list is now
`repeat(auto-fill, minmax(var(--ai-size-3), 1fr))`.

**No container query, and no chosen breakpoints.** The grid counts the space
itself, so the panel is right at every width rather than at the three or four
someone picked. Measured: 5 columns at a 1155px table, 4 at 955, 2 at 619 and
555, 1 at 419 — and the panel drops from 425px to 253 at the common desktop
width. No horizontal overflow at any of them.

`auto-fill`, not `auto-fit`: auto-fit collapses empty tracks, so a row with a
single hidden column would stretch that one pair across the whole panel.

192px is the minimum a pair needs — an uppercase label like PAYMENT METHOD over
values such as "Awaiting Payment Confirmation". Below that the column COUNT
changes, never the legibility.

Two things the restructure needed:

- The pair is the grid item now, not `display: contents`, and the label sits
  **above** the value. Side by side, labels could only align within their own
  column and the panel would read as ragged.
- `align-self: center` on the `dt` had to be undone. It is correct in the base
  two-column grid — it centres the label against its value on the same row —
  but in a stacked pair the cross axis is horizontal, so the same declaration
  centred every label over its value. Caught in the screenshot, not the
  measurements, which is the argument for taking one.

Also `white-space: normal` on the list: the detail cell is a `<td>`, and
Table.css puts `nowrap` on every cell, which inherits straight in and would
push long values out of a 192px column.

Scoped to `--orders` rather than the component, since it changes the Whos
Online detail row's look too. Worth promoting to the component default once
the designer has seen it there.

**Tightened, 2026-09-21** — the choice was "line-height to xs" or "drop the
pair's 4px gap". Neither wholesale: the panel now mirrors the TABLE's own
rhythm, which is what it stands in for.

- **Label → `--ai-leading-xs` (16px), the same as `.table thead th`.** It was
  inheriting the CELL's 20px, which is loose for 12px uppercase, and that was
  the slack worth taking.
- **Value stays at `--ai-leading-sm` (20px), the same as `.table tbody td`.**
  16px on 14px text is a ratio of 1.14 — too tight for the wrapped lines a
  192px column produces from a catalogue item name, and the panel's whole
  argument is that long values stay readable.
- **The 4px gap went too**, on the designer's call after seeing it: the
  label's own 16px leading already separates it from its value, and the 12px
  row-gap between pairs is what does the grouping — so the gap inside a pair
  was only height. (I had argued to keep it as the binding signal; it is not
  needed once the label's leading is tight.)

The row-gap between pairs then went 12px → **16px** (`--ai-spacing-5`): with
nothing inside a pair, that gap is the only thing grouping a label with its
value, so it has to be unambiguous.

Panel 253px → 237px on the leading alone, 221px with the pair gap out, 233px
once the row-gap opened up; pair height 40px → 36px. Both leadings are now stated rather than inherited, so the pair
keeps its rhythm if the cell's line-height moves.

**Labels step down with the headers on mobile** (designer, 2026-09-21): the
detail `dt` takes `--ai-font-fixed-4xs` in the same `@container (max-width:
767px)` block that steps `.table thead th` down, so the two cannot drift.
They are the same labels — read from behind the kebab rather than across the
row — so a panel whose labels stayed 12px while the table's went to 11px would
read as two different kinds of heading. Measured 12/12 at a 955px table and
11/11 at 419px. Container query, not viewport, so it fires when the TABLE
narrows — the docked sidebar does that with no window resize.


## Mobile footer

See `Datatables.figma-notes.md` — the pager collapses to "Page 3 of 7" and the
count to "1–20 of 140" below a 767px container. The listing's own part is the
markup: "Showing" and "results" are wrapped in `.datatables__count-word` spans
so the container query can drop them, leaving the range and the total, which
are the sentence.


## A floor under the Customer column

Asked 2026-09-21, after the pencil column narrowed Customer by ~36px.

Customer is the only column that can grow, so auto table layout takes all its
slack from there. Measured with no floor: it sat at **124–163px at every
desktop width**, and the NAME truncated on **half the rows** — "Michael
Thompson" as "Michael Th…". The row's job is to identify a record; the role
line beneath can truncate, the name cannot.

`min-inline-size: var(--ai-size-3)` (192px) on the fluid column. 192 is what
the cell needs: 24px avatar + 12px gap + ~124px for the longest name here +
32px of cell padding. A floor, not a width — Customer still takes the slack
above it, up to its 240px preference.

### The cost, measured rather than assumed

Where the floor bites, the fit's correction loop drops the last column instead
of squeezing this one:

| Table width | Before | After |
|---|---|---|
| 740px | 5 cols, names truncating | 4 cols, none truncating |
| 940px | 5 cols, Customer 163 | 4 cols, Customer 240 |
| 1040px | 6 cols | 5 cols |
| 1240px | 7 cols | 6 cols |

Zero truncated names at every width afterwards, no horizontal scroll, and the
table still fills its body exactly — no dead space.

### An option that was tried and is worse

Making 192 the PREFERENCE as well as the floor keeps the same column counts but
pools the freed slack into the snug columns — Order Status reached 333px and
Account 270px — and 2 of 10 names still truncated, because zero truncation
needs about 240. Rejected: same cost, worse result.

### …and the floor comes off when the table is narrow

Reported 2026-09-21: the kebab disappeared at the tight end. The floor was the
cause — at a 390px viewport the table stood at 370px inside a 309px body and
pushed the kebab off the right-hand edge.

Removed below a **400px table**, not lowered: no fixed floor survives the
bottom of the range, since at 320px there are 61px left for Customer after the
other four columns.

**400px, deliberately not the 767px the other narrow rules use.** Measured, the
floor is safe down to a 419px table and only clips at 349 and below. Keyed to
767 the override also fired on a DESKTOP with the sidebar docked — a 1000px
window leaves a 555px table, narrow by container terms but with room to spare —
and names truncated there for nothing. The threshold belongs where the damage
starts, not where the mobile layout starts.

The trade inverts on a phone, which is what makes this the right call rather
than a compromise: wide, the name matters more than one more column; narrow,
the kebab is the only route to the other eighteen columns, and a truncated name
is still a name — the row is clickable either way.

| Viewport | Table | Kebab | Names truncating |
|---|---|---|---|
| 320 | 239 | **clipped** | 5/10 |
| 360 | 279 | visible | 5/10 |
| 390 | 309 | visible | 4/10 |
| 430 | 349 | visible | 0/10 |
| 500–1700 | 419–1255 | visible | 0/10 |

320px still clips, and cannot not: the table's min-content is 279px in a 239px
body, so it scrolls. That is the intrinsic minimum of five columns, not the
floor.

**The override is its own container block, immediately after the rule it
overrides.** A container query does NOT raise specificity, so written up with
the other narrow rules it tied with the floor and lost on source order — and
that failure is invisible: the measurements came back showing Customer still
at 192 with the rule apparently in force.


## Edit Columns is desktop-only

Designer, 2026-09-21. There is nothing for it to do on a phone: the fit is down
to the two columns that identify a row, everything else is already behind the
kebab, and the panel is a 240px drag-and-drop list — choosing and REORDERING
columns is a desktop task on a desktop-sized table. The toolbar keeps the
page-size control, which means something at any width.

### A deliberate `@media`, against the house rule

The first cut keyed this to the datatable's own container at 767px, like every
other narrow rule here. That was wrong for this one control, and the flag I
raised became the answer: with the SidebarMenu docked, a **1024px laptop leaves
a 557px table**, so the button vanished on a machine whose owner is perfectly
able to use it (designer, 2026-09-21).

The container asks *is there room*. This rule asks *what is the person working
on* — a device question, which CLAUDE.md §4a names as the one case a viewport
query is right for. A laptop keeps its column editor however the sidebar is
docked; a phone never has one.

`@media (max-width: 1023px)`. Measured: hidden at 390 / 768 / 1000 / 1023,
shown from 1024 up, and the 240px right-anchored panel sits inside the table at
every width above that — including the 581px table a docked 1024px laptop
produces.


## The pencil is off below a laptop — TEMPORARY

Designer, 2026-09-21, to look at: **it may come back**, and one `@media` block
in `Datatables.css` is the whole change.

The case for dropping it: it costs 48px on a 311px table, the row itself
already opens the record, and the kebab beside it is the only route to the
other eighteen columns.

It also bought back the one width that still overflowed. **At a 320px viewport
the table now fits its body** — 239px of table in a 239px body — where before
it was 279px and pushed the kebab off the edge. Every width from 320 up now
shows the kebab with zero dead space.

`@media (max-width: 1023px)`, the same floor as Edit Columns, because "mobile"
is a device and not a narrow table. Keyed to the table's own container this
would have gone missing on a 1024px laptop with the sidebar docked (a 579px
table) — the exact trap the Edit Columns rule had to be corrected for a few
minutes earlier.

### A structural column that hides no longer charges the budget

`fitColumns` treats the checkbox, pencil and kebab as structure and always adds
their width to what is used. A pencil hidden by a media query would still have
cost a real column its place at some width. It now checks the column's computed
display before charging for it — read back AFTER the measuring pass, which
forces every column visible.


## The empty state did not wrap

Reported 2026-09-21, on a phone and true on a narrow desktop column too: "No
orders match the filters you have applied…" ran as one line, ignored its own
320px cap and pushed the table wider than the page.

`white-space: nowrap` on every `.table` cell, inheriting into the div inside
the `colspan` cell. The description could not wrap, so its `max-width` was
never reached and the cell's min-content set the table's width. The third time
this inheritance has bitten in this template, after the row detail list and the
picker's table.

`white-space: normal` on `.cc-listing__empty`, and the description's cap became
`min(var(--ai-size-6), 100%)` — 320px is a MEASURE, not a floor, and 100% keeps
it inside a column narrower than that.

Measured at 360 / 393 / 700 / 1400: wraps at every width, stays centred, and
the table no longer exceeds its body. The description is 219px on a 279px table
and 320px on a 955px one.


## The picker pages, 20 at a time

Designer, 2026-09-21. 20 is the live picker's own `iMaxRows` — the one part of
its paging worth keeping, since it runs 20 with an N+1 probe and no offset, so
"there is more" is all it can say and narrowing the sub-filters is the only way
forward. This one can actually go there.

The pager is the DATATABLE's footer markup, which buys the listing's styling
and, for free, the collapse to "Page 3 of 4": that rule keys on the nearest
container, and inside this card that IS the card, so a 640px picker gets the
compact form without a second rule. It carries `data-picker-page`, not
`data-page`, so the listing's own pager handler cannot pick the clicks up.
With one page there is no pager at all — `:empty` hides the row.

### A selection has to survive paging

The bar reads a Multi Select Table by its CHECKED rows, so a row that scrolls
out of the DOM takes its selection with it. Rather than add a parallel store to
keep in step, **a selected row that is not on this page is rendered hidden** —
the selection is still the checked set, exactly as FilterBar expects, and
Apply needs no special case.

That also forced a second rule: once a row has been ticked, the card is the
source of truth for what is selected, not the chip's applied values. Without it
the first redraw after a tick — paging, sorting, a sub-filter — would read back
the applied set and silently undo the tick.

Page resets to 1 whenever the list changes underneath it: a sort, a sub-filter
applied, a sub-filter cleared. Page 3 of a different list is a different page.

Measured on Contact Lists (71 rows): 4 pages of 20, "1–20 of 71" beside
"Page 1 of 4"; a row ticked on page 1 survives to page 3 and applies correctly;
narrowing to "affino" gives 2 pages and resets to the first; clearing restores
4.


## localStorage, for the demo

TODO(backend:Listing) `listing-column-prefs` / `listing-default-filters`: saved
views and the column layout belong to the user and the server, and both are
already in the manifest. localStorage stands in so the prototype survives a
reload — a demo that forgets what you set up two clicks ago cannot be walked
through. Per browser, not per user, and not shared between devices.

One key per screen, `affino.listing.<screen>`, holding the saved views and the
column layout.

- **Every call is wrapped.** Storage throws in a private window and can be
  switched off entirely; a screen that will not render because it could not
  read a preference is a worse failure than one that forgets it.
- **Views are keyed by NAME**, not by the row element the in-memory map uses —
  an element does not survive a reload, and a name is what the user typed and
  what the endpoint will key on. Duplicate names collapse to one entry; the bar
  allows them, and last-saved-wins beats inventing a second identity scheme for
  a demo store.
- **Columns are restored before the first paint**, so the table is never drawn
  in one layout and rearranged into another.
- **A column added to the screen since the layout was saved still appears.**
  The stored order is applied first, then anything it does not mention — a
  stale preference that hid new data is exactly what makes people distrust
  saved layouts. Hidden keys that no longer exist are dropped on the way in.

### Two events the FilterBar had to start dispatching

The bar owns the view ROW; this screen owns what a row means. Deleting or
renaming was DOM-only, so the store would have kept views the bar no longer
showed. `filter-bar:delete-view` and `filter-bar:rename-view` now say so, and
`root.addSavedView(name)` puts a persisted view back — doing the icon and
row-menu wiring itself, because a caller that had to know about those would be
holding half the pattern.

Measured across a real reload: a hidden column and a saved view both come back,
selecting the restored view puts its filter back on the bar, and deleting it
empties the store.


# Articles — the second screen on this template

Built 2026-09-21. `Articles.html` + `listing-data-articles.js`; the template,
its CSS and its JS are the Orders ones untouched except for the two knobs
below. Adding a listing screen really is adding a config.

## What came from where

Read from the live `/control/articles` (ControlProfileCode 1097) two ways: the
CFML directly, and a second reading of the responsive controllers by
`claudemain-04`, which is the authority for the definitions because **Articles
is already a "cc2" screen** and declares them properly —
`c-article-definition.cfc :: getTableDefinition()` for columns and
`v-article-listing.cfc :: BuildFilters()` for filters.

| Real | Invented (flagged in the data file) |
|---|---|
| Column set + order, filter catalogue + order, enums, default sort | Section / Style / Zone / Channel **per row** |
| 50 rows: titles, publish dates, live flags, views, authors, IDs | — |
| The ten largest section NAMES and their counts | Which article sits in which |

The articles feed does not join section names and never exposes the
presentation style; per-zone and per-style counts need a GROUP BY the read
tools cannot run.

## Two things the live screen already has

Unlike Orders, Articles **already pages server-side against a real total**
(`row_number() OVER(…)`, not `SELECT TOP 500`) and **already has a working
Edit Columns with drag-reorder**. On this screen those are not new
capabilities the prototype proposes — they are existing ones it re-dresses.
Worth knowing before anyone repeats the Orders framing.

## Sorting: no whitelist, and that IS the finding

Orders gates `hs` to seven values. Articles has nothing equivalent — whatever
the client sends as `SOColumn` is wrapped in quotes and interpolated into the
`ORDER BY`, unvalidated. So every data column carries a `sort` token here,
which is fidelity rather than laxity. Default is `PublishStart DESC`.

## The five chips

The live screen's first FOUR in declaration order — Title, Zone, Channel,
Section — then **Presentation Style promoted from sixth** (designer,
2026-09-21). Multi-displayed, which sits fifth live, moves into More Filters.

Two control choices deliberately differ from the live screen, on the
distribution rather than on taste:

- **Section is a table picker.** 216 distinct sections across 3,570 articles,
  top ten holding 63% and the other 206 averaging 6.4 each. A select with 216
  options is the wrong control; the live screen opens a lookup for the same
  reason. The picker shows the article count beside the name, which is what
  tells two similar sections apart.
- **Creator is a multi-select, where the live screen uses a type-ahead.** 22
  distinct authors — at that size a list is legible and shows people the whole
  set. Same control family as Section, opposite verdict, and the distribution
  is what separates them.

`Articles Per Screen` is NOT a chip: it is the page-size control, which this
template already carries in the toolbar. Shipping both would be two controls
for one setting. Note the live screen disagrees with itself — the filter offers
10/20/50/100/300 and its DataTables `lengthMenu` offers 100/50/25/10; the
toolbar follows the filter's list, which is the one an operator sees.

## The two template knobs Articles needed

Both are per-screen, both default to the Orders behaviour, and both came from
a measurement rather than a preference.

**1. `truncate` — a cap without snug's sizing.** Title is FLUID: it takes the
slack the way Orders' Customer does. But it is free text, and one 84-character
title measured **436px** at max-content and ate two columns' worth of budget
on its own — the table showed two columns at 1400px. A column can now be snug,
truncating, or both. The cap is 240px (the fluid column's own preferred width,
so the two agree), dropping to 128 below a 560px table.

**2. `identityColumns`.** The fit always shows the leading columns even if they
do not fit, because a table of anonymous values is worse than one that
scrolls. Orders' two are an order number and a name, which fit a phone
together. Articles' two would be Title and Section — both long text — and
forcing both overflowed a 309px table by 31px, pushing the KEBAB off the edge:
the one control that reaches the other columns. Articles declares
`identityColumns: 1`.

## Measured

| Table width | Columns | Overflow |
|---|---|---|
| 1255 | 6 | 0 |
| 955 | 4 | 0 |
| 655 / 619 | 3 | 0 |
| 419 / 349 | 2 | 0 |
| 309 / 279 / 239 | 1 | 0 |

No dead space and the kebab visible at every width. Orders re-checked after
both knobs: unchanged at 1400 (4 columns) and 390 (2).

## Still Orders-classed in the markup

The datatable keeps `datatables--orders`. Every listing rule in
`Datatables.css` is scoped to it, so the class is doing double duty as "the
listing datatable Type". That is the right call today — Mark's instruction was
to use the Orders datatable — but the class wants renaming to something like
`--listing` the first time a second Type genuinely diverges.


## The listing table is fixed-layout now

Designer's call, 2026-09-21, after two bugs on Articles that were the same bug:
the Section column flickered between hidden and shown while resizing below
470px, and there was a wide band of empty space beside every title on a phone
(measured 121px at a 309px table).

Both came from one fact: under `table-layout: auto` a cell can always widen its
own column. Everything downstream followed from it —

1. An 84-character title demanded **436px** at max-content and left two
   columns on a 1400px screen.
2. The cap that stopped it then left the space, because the column is FLUID
   and takes the slack while the capped text cannot use it.
3. The cap was container-dependent, so the fit and the cap chased each other
   across a resize — the flicker.

**`table-layout: fixed` removes the cause.** Content can no longer affect a
column, so text ellipsises at whatever width the fit gave it. The measuring
pass still runs at `max-content` — that is where the fit learns what each
column WANTS — and only the render is fixed. Scoped to `--orders`, so the
Multi Select Table pickers keep auto layout; their widths are content-driven
by design.

### The fit now decides widths, not just visibility

`sizeColumns` writes an explicit width per visible column, reading the same
three roles the CSS used to express as behaviours:

| Role | Width |
|---|---|
| hug / structural | its measured natural |
| snug | its natural, capped at 224px so one long enumerated value cannot take half the table |
| fluid | everything left over, never below its 192px floor |

The rounding remainder goes to the fluid column, so the widths sum to the
table exactly. **"No dead space" used to be the browser's to keep; it is
arithmetic now** — which is the real cost of this change and the thing to
check first if a gap ever appears at the right-hand edge.

### Measured, both screens

| | 1255 | 955 | 655 | 619 | 419 | 359 | 309 | 239 |
|---|---|---|---|---|---|---|---|---|
| Articles cols | 7 | 4 | 4 | 3 | 1 | 1 | 1 | 1 |
| Title slack | 32 | 32 | 12 | 12 | 12 | 12 | 12 | 12 |

Slack is now cell padding and nothing else — the band is gone. No overflow at
any width. Orders re-checked: 4 columns at 955 and 2 at 309 as before, and 4
rather than 3 at 619, because a fixed column no longer has to leave room for
what its content might want.

The flicker is addressed by removing its cause rather than by damping it:
there is no container-dependent cap left to chase. That one is reasoned from
the mechanism rather than reproduced — a ResizeObserver never fires for an
iframe resize under a virtual time budget, so a resize sequence is not
something this harness can drive.

### One CSS edit that cost four rounds

Mid-way through, several measurements made no sense — a span reported
`display: inline` with the rule that sets `display: block` plainly present in
the file. The cause was **a single orphan `}`** left by a programmatic edit:
everything after it was dropped by the parser, so `.datatables__truncate` and
every rule below it silently did nothing. Two of the "failed" approaches
before it were probably fine.

`grep -c '{'` against `grep -c '}'` is a two-second check and would have caught
it immediately. Worth doing after any scripted CSS surgery.
