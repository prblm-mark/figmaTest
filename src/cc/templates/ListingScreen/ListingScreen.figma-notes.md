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
