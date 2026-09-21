# FilterBar — Figma Notes

## Figma Node

- **File:** `Lus07xi8pPXLN87sQIyrEt` (Affino AI Design System)
- **Component set:** `2977:3811` ("Filters V2")
- **Tier:** `Pattern` → `src/patterns/FilterBar/`
- URL: https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2977-3811

**Two-row card:** row 1 = saved-views + an explicit **Export** button + search/kebab; row 2 =
the filter chips with "Add Filters" pinned right.

## Characteristics

- **Two rows** (border between): row 1 saved-views + Export + search/kebab, row 2 chips.
- **Export** is an explicit `btn--secondary` button in row 1.
- Chips use the **solid Default** FilterItem treatment (only "Add Filters" is dashed), all `--rounded`.
- Views trigger text is **regular** weight.
- **Search mode** replaces row 1 only — the chips row stays.
- **Mobile:** Export collapses out of the bar; chips wrap; search has icon+takeover or the Alt Search inline field.

## Variant matrix (8 Type × Desktop/Mobile, + Alt Search mobile)

`Type` = scenarios of one toolbar (modelled as JS modes + composed-component states).

| Node ID (Desktop / Mobile) | Type | Representation |
|---|---|---|
| 2977:3803 / 2977:3804 | Default | base markup (solid chips) |
| 2977:3801 / 2977:3810 | Filter Active | a chip carries `.filter-item--selected` |
| 2977:3797 / 2977:3808 | Views dropdown | saved-views `.dropdown` is `.is-open` |
| 2977:3799 / 2977:3806 | New View | root `.filter-bar--new-view` |
| 2977:3798 / 2977:3802 | Wrapping | more chips → row 2 flex-wraps |
| 2989:6121 / 2989:6242 | Save View | root `.filter-bar--save-view` reveals a "Save view" primary CTA (Button, sm) pinned right of row 2; Add Filters rejoins the chip flow |
| 2977:3800 / 2977:3809 | Search | root `.filter-bar--search` |
| — / 2999:4699 | Alt Search (mobile) | root `.filter-bar--alt-search` — **mobile-only** alternative to the search icon + takeover: a persistent search field fills row 1 between the views control and the kebab |
| 2977:3807 / 2977:3805 | Actions | kebab `.dropdown` is `.is-open` |

Desktop fetched in full: Default, New View, Search. The rest are state/content permutations.

## Layout

- Outer: `flex-direction: column`, `background: surface-primary`, border-secondary, radius-md.
  **No `overflow: hidden`** — the root's own bg + radius round the card and the inter-row
  divider sits mid-card, so nothing needs clipping; clipping would crop the saved-views /
  kebab dropdown panels (which must escape the card).
- **Row 1** (`.filter-bar__row--top`, `border-bottom`): `[lead (views) .....16px..... [Export · Search · kebab]]`,
  px `--ai-spacing-5` / py `--ai-spacing-4`. **Export, the search field, and the kebab are grouped in
  the `.filter-bar__actions` div** (Figma row-1 "Frame 230", e.g. 2989:6122) with an internal
  `--ai-spacing-3` (8px) gap; the row's `--ai-spacing-5` (16px) gap only separates the lead from that
  group. The **search is a persistent 192px field** (`--ai-size-3`) on desktop (Figma 2977:3803).
- **Row 2**: `[chips (flex-1, wrap) — "Add Filters" is the last chip in the flow]`, same padding.
  (In the Save View state a "Save view" CTA sits as a sibling after `__chips`, pinned right.)
- **Search responsive behaviour:** desktop shows the persistent `.filter-bar__search-bar` field +
  hides the search icon; **mobile (≤767px)** hides the field and shows the **search icon**, which
  enters the full-width **takeover** (`--search` mode → back-arrow + `.filter-bar__search` in lead).
  Implemented mobile-first: `.filter-bar__search-bar { display:none }`, then `@media (min-width:768px)`
  shows it (192px) and hides `.filter-bar__icon-btn[aria-label="Search"]`.
- **Mobile (≤767px):** rows already stack; the **Export button is hidden** (`display:none`) per the
  Figma mobile variants; the **chips row wraps** to multiple lines (Figma mobile variant 2977:3804).
  The **New View "Create" CTA uses the small button** at mobile (`btn--sm` sizing applied to
  `.filter-bar__create` in the media query — padding `--ai-spacing-4`, `min-height --ai-spacing-7`,
  `font-size --ai-font-fluid-xxs`), per Figma mobile New View variant 2977:3806 (`button/sm`).
  Desktop keeps `button/base`.

## Modes (JS — FilterBar.js)

| Mode | Class | Effect |
|---|---|---|
| Search | `.filter-bar--search` | row 1 → back-arrow + full-width search Input (Export + actions hidden); **chips row 2 stays** |
| New View | `.filter-bar--new-view` | row 1 views → "New view" Input + Create (Export + actions stay); **row 2 collapses to just Add Filters**. **Create** (`new-view-create`) appends the typed name to the saved-views list (`addView`, flagged `data-view-empty="1"`) + selects it (`selectView`) + re-wires its … (`Dropdown.initAll`); **×** cancels. A new (empty) view shows **only "Add Filters"** via `.filter-bar--view-empty` (non-destructive — chips stay in the DOM). Existing views keep their default chips; `selectView` toggles `--view-empty` from the row's flag, so switching back restores them. |
| Alt Search | `.filter-bar--alt-search` | **mobile-only** alternative search treatment (Figma 2999:4699). Instead of the search icon + full-width takeover, the persistent `.filter-bar__search-bar` field is shown and **fills** row 1 (`flex:1`) between the views control and the kebab. The views trigger becomes a **plain borderless control** (`width:auto`, no border / bg / padding — not the 192px field) so the search gets the width; row-1 gap is `--ai-spacing-5` (16px) between the views control and the search field. Search icon hidden. Desktop unchanged. CSS-only (modifier on the root). |
| Save View | `.filter-bar--save-view` | a filter added/amended — **mock**: clicking the "Add Filters" chip (FilterItem bubbles `filter-item:toggle` with `open:true`) reveals the `.filter-bar__save` "Save view" CTA (Button `--primary --sm`) — the last child **inside** `__chips`, after "Add Filters". **Desktop:** `margin-left:auto` pins it to the right edge of the chip row. **Mobile (≤767px):** that margin is dropped so it flows right after "Add Filters" in the wrapping chips (Figma mobile 2989:6242). Clicking the CTA (`data-filter-action="save-view"`) is a mock "save" — drops the class + closes the Add Filters chip. **TODO(backend:Filters)** — real trigger is a persisted filter-set change. |

**Saved-view selection + rename** (`FilterBar.js` `wireViews` —:
double-click OR the **"Rename" item in the row's … menu** (`[data-filter-rename]`, beside Copy/Delete)
runs an inline `.filter-bar__rename` overlay; capture-phase click takeover + 220ms single/double
disambiguation; the … is on every row incl. the selected one and is always-visible on touch via
`@media (hover: none)` in `Dropdown.css`; code-first, not in Figma — flag for designer) and the **right-aligned kebab panel**
(`.filter-bar__menu .dropdown__panel { left:auto; right:0 }`). The search field lives inside
`__lead` (which stays visible in search mode), so it needs no relocation.

## CSS Class Mapping

| Element | Class | Notes |
|---|---|---|
| Root | `.filter-bar` | column, border-secondary, radius-md, overflow hidden |
| Row | `.filter-bar__row` (+`--top`) | flex, gap 16, pad 12/16 (12 all sides at mobile); `--top` adds bottom border |
| Lead (row 1) | `.filter-bar__lead` | flex-1, gap 8 — holds views / new-view / search |
| Views control | `.dropdown.filter-bar__views` | Dropdown filter-views panel; trigger field is **regular** weight |
| Actions | `.filter-bar__actions` | row-1 group (Figma "Frame 230"), 8px gap: **Export** + persistent search field (desktop) / search icon-btn (mobile) + kebab `.dropdown` |
| Export | `.btn.btn--secondary.filter-bar__export` | first child of `.filter-bar__actions`; Button + `download` icon; hidden on mobile |
| Search field (desktop) | `.input.filter-bar__search-bar` | persistent 192px Input; desktop only — replaced by the icon + takeover on mobile |
| Chips (row 2) | `.filter-bar__chips` | flex-wrap, gap 6 (`--ai-spacing-2`, all sizes); chips are FilterItem **default (solid)** / `--selected`, **all `--rounded`** (pill `--ai-radius-full`, per user direction) |
| Add Filters | `.filter-item--empty.filter-item--rounded.filter-bar__add` | dashed pill; **last chip inside `__chips`** (in the flow, after the filter list) |
| Save view CTA | `.btn.btn--primary.btn--sm.filter-bar__save` | composes Button (primary, sm); hidden until `.filter-bar--save-view`, then pinned right of row 2 |
| Search / New-view / Create / Back | `.filter-bar__{search,new-view,create,back}` | compose Input / Button |

## Token Mapping

Token set: surface-primary, border-secondary, spacing-3/4/5/8, size-3,
radius-md, icon-contrast, icon-size-sm, font-body/fixed-xs/leading-md). The views trigger uses
`--ai-font-regular`. Export button uses the Button component's
`--ai-btn-secondary-*` tokens. Selected chips use `--ai-surface-info-soft` / `--ai-border-info`
via the FilterItem component.

## Token Gaps

None for the shell. Documented Figma artifact: the "Add Filters" **MinimalBadge** uses
raw `#364153` (Gray/700) — replaced here with a proper **FilterItem `--empty`** (`--ai-text-primary`).
Outer frame width is `970px` in Figma (no token) — built **fluid**
(`width: 100%`, consumer-controlled), so the arbitrary 970 is not hardcoded.

## Responsive — container queries, not viewport (changed 2026-09-17)

The Device=Mobile treatment (Export collapses out of the bar, the search field
becomes an icon) keys on **`@container cs-page`**, not `@media`. `cs-page` is
ControlScreen's `.cc-control__page` — the content column.

This was a real bug, not a tidy-up. With the SidebarMenu docked, a **954px
viewport** leaves the content column at **562px**: the datatable collapsed
correctly (it already used container queries) but the FilterBar kept its widest
layout, because 954 > 767. Two failures compounded:

1. **Wrong query type.** Export and the 192px search field stayed visible in a
   column that could not hold them.
2. **An intrinsic floor.** `.filter-bar__lead` is `flex: 1 0 0; min-width: 0`,
   so its box may shrink below its content — but `.filter-bar__views-trigger`
   carried a hard `width: 192px`. The trigger escaped its parent's box and
   painted **over** the Export button (measured: lead box ended at 499.5, the
   trigger ran to 569, Export started at 515.5).

Both are fixed. Fixed widths on the views control, the search field and the
new-view field are now **caps, not floors** (`flex: 0 1 <size>` +
`max-inline-size` + `min-inline-size: 0`), so the bar degrades gracefully in the
band above the breakpoint too.

**The cap sits on `.filter-bar__views`, never on the trigger.** `.filter-bar__views`
is also a `.dropdown`, which is `flex-direction: column` — putting `flex: 0 1 192px`
on the trigger sized its **block** axis and drew a 192×192 square. Same trap applies
to `.input` (also a column): `.filter-bar__search-bar` and `.filter-bar__new-view`
are safe because they *are* the `.input` element and are themselves row items.

`@media (hover: none)` is untouched — that is a device capability, not a size.

**The standalone demo establishes `cs-page` on `body`.** Without it none of the
narrow rules could ever fire and the demo would silently misrepresent the
component (CLAUDE.md §4a). The device-toggle's 384px iframe works because that
iframe's own body establishes the container.

Verified with no overlap and no table overflow at viewport widths 1700, 1400,
1200, 1024, 954, 860, 800, 700, 600, 500 and 390, plus the demo's 384px embed.

## Overflow (kebab) actions menu — Size=xs + leading icons

Built to Figma's "Actions Menu" screen on the Listings page
(`3645:157810` desktop, list frame `3645:158885`, rows `3645:158886/158887`).
Corrected 2026-09-17; it had been base-size with no icons.

| Property | Figma | Built as |
|---|---|---|
| Row height | 36px | **32px** — `dropdown-item--xs` |
| Padding | `py --ai-spacing-2` / `px --ai-spacing-4` | `--ai-spacing-1` / `--ai-spacing-3` |
| Label | `--ai-font-fixed-xs` (14px), regular | `--ai-font-fixed-2xs` (13px), medium |
| Leading icon | 16px | 12px (`--ai-icon-size-xs`) |
| Panel | `p --ai-spacing-3` (8px), `--ai-radius-md`, `--ai-border-secondary`, drop-shadow | as Figma, scoped — see below |

**Size=xs is a deliberate divergence from Figma** (designer, 2026-09-17: "make
them xs on the dropdown__panel"). Figma draws these rows at 36px, i.e.
`dropdown-item--sm`, and that is what was built first. Note xs is not simply a
shorter row — it changes four properties at once (both padding axes, 14px
regular → 13px medium, 16px icon → 12px), which is why the table above lists
Figma and built values separately rather than as a single spec.

The **saved-views menu in the same bar stays `--sm`**, which is what Figma gives
it — so the two menus in this component are now deliberately different sizes.
The chrome's menus (Zone Selector, User Menu) are `40px` base per Figma and were
left alone.

Icons are Lucide **`sheet`** and **`file-spreadsheet`**. Note the Figma layers
are both *named* `Icon/24px/Star` — stale layer names; the exported assets are
the two above, so go by the asset, not the layer name.

**The panel padding is scoped to this menu.** Figma's list frame binds
`--ai-spacing-3` (8px) where the shared `.dropdown__panel` uses
`--ai-spacing-4` (12px), so `.filter-bar__menu .dropdown__panel` overrides it
rather than changing the panel every other dropdown uses.

It was load-bearing at Size=sm: a 16px icon plus a `data-text` reserve measured
at the **bold** weight left "Generate Shipping Labels" 168px against the ~172px
it needed, so it wrapped and the row measured 60px instead of 36px. At Size=xs
(13px text, 12px icon) it clears at either padding — the 8px is kept because it
matches Figma, not because it is still holding the layout up.

## Ghost buttons in the saved-views menu (2026-09-17)

The row menu (Rename / Copy / Delete) and the "New view" footer are
`btn btn--tertiary btn--sm`, and every one of them rendered as a **permanent
grey pill**. Designer: "none of the buttons in the view dropdown should have a
bg by default, they should only be visible on mouseover."

The cause is not the FilterBar. In the **CC theme** the tertiary ladder runs
backwards:

| Token | Base theme | CC theme |
|---|---|---|
| `--ai-btn-tertiary-bg` (rest) | `transparent` | **#e7edf0** — visible |
| `--ai-btn-tertiary-bg-hover` | #f8fafc | **#f2f4f5** — *lighter than rest* |

So in CC a tertiary button is filled at rest and gets **lighter** on hover.
Outside CC it behaves as the ghost button it is meant to be.

Fixed by scoping `.filter-bar__views .btn--tertiary` to transparent, with
`--ai-surface-secondary` on hover — the same `#e7edf0` the buttons were showing
at rest, and the same value `.dropdown-item:hover` uses in the panel directly
above. **The grey is not removed, it is moved to where it belongs.**
`:focus-visible` is aligned to hover on purpose: left alone it inherits the
lighter hover token, so a keyboard user would get a weaker highlight than a
mouse user on the same control.

**This is the fourth independent workaround for the same token bug.**
`Header.css` forces `.cc-header .btn--tertiary` transparent, and `AiAssistant.css`
does it for two more selector groups — restoring the grey on hover with
`var(--ai-btn-tertiary-bg)`, the same move arrived at separately. Four
components patching one token says the token is wrong, not the components.

**The real fix is in Figma**: give `--ai-btn-tertiary-bg` the transparent value
in CC that it already has in the base theme, and let hover carry the grey. That
makes all four blocks redundant — delete them when it lands.

## Row menus collapse with the panel (2026-09-17)

A saved-view row's … menu (Rename / Copy / Delete) stayed open when the panel
around it closed, so re-opening the saved-views dropdown showed the menu still
hanging off a row the user may not have been acting on.

Every row menu is now collapsed whenever the panel loses `is-open`, watched with
a **MutationObserver on the panel's class attribute** rather than by calling a
close helper from each exit.

That choice is deliberate: there are **five** ways this panel closes, and
`FilterBar.js` owns only two of them (`closeDropdowns()` and `selectView()`).
The other three — trigger toggle, outside click and Escape — belong to
`Dropdown.js`, which emits **no close event**; it only removes the class. So
hooking the class is the single place that catches all five without reaching
into the shared Dropdown component.

Verified against all five paths by driving real clicks and key events, and by
re-running with the observer removed to confirm the test actually fails without
it (Escape and trigger-toggle both leave the menu open, and the stale state then
corrupts the next interaction).

One gotcha for anyone testing this: selecting a row runs through a **220ms**
timer that separates single-click-select from double-click-rename, so a test
that waits less than that will see the panel still open and wrongly conclude the
path is broken.

## Export is a split control (2026-09-17)

Export was a single `btn btn--secondary`. It is now the same split control the
Seating Planner toolbar uses (designer: "use the same style as we did for the
seating planner") — the label half runs the default export, the chevron half
opens a format menu of **PDF / Excel (.xlsx) / CSV**.

**Figma formalised the look, not the behaviour.** On the same day the designer
added a Button Type `Secondary / Action` — base `3679:17496`, sm `3679:99941` —
a *single* button with a full-height divider before a trailing icon, and
supplied it as a **visual reference only**. The behaviour built here is the
split control, which one button cannot provide: it needs two separate targets.

The new Type's spec, recorded because it is what the look traces to:

| | base `3679:17496` | sm `3679:99941` |
|---|---|---|
| height | `--ai-spacing-8` (40) | `--ai-spacing-7` (32) |
| gap | `--ai-spacing-4` (12) | `--ai-spacing-3` (8) |
| padding-inline | `--ai-spacing-4` (12) | `--ai-spacing-4` (12) |
| text | `--ai-font-fluid-xs` (14) | `--ai-font-fluid-xxs` (12) |

Both are `--ai-btn-secondary-bg` / `--ai-btn-secondary-border` / `--ai-radius-md`
with a 16px trailing icon. Base and sm were fetched separately and **do differ
beyond size** — the gap steps 12 → 8, which reading the base node alone would
have missed.

**The divider is not an element.** It is the shared border: the halves are
pulled together by `-1px` so two adjacent 1px borders collapse into the single
rule Figma draws instead of stacking to 2px. The hovered/focused half is lifted
with `z-index: 1` so it paints its whole outline including that collapsed edge.

### Open, on the Figma side

- **No interactive states.** `Secondary / Action` exists only as `State=Default`
  at two sizes — no Hover / Focus / Pressed / Disabled, where plain Secondary
  has all five. The halves inherit `btn--secondary`'s states here.
- **The two variants disagree on the Type name**: base is `Secondary / Action`
  (spaces), sm is `Secondary/Action` (none). In Figma those are two distinct
  Type values, so the axis currently reads as two types rather than one.
- **The listing screens still draw a plain Export button** with no divider, so
  the Listings page and the Button set now disagree.

### Resolved: the split is `.btn-group` (2026-09-17)

The duplication flagged when this was built is gone. The split mechanics were
never FilterBar's to own — **ButtonGroup already had all three rules**: the
`-1px` collapsed edge, the first/last radius rounding, and the hover/focus
`z-index`. Both this pattern and `SeatingPlanner.css` had hand-written their
own copy before anyone checked whether a component existed.

`.filter-bar__export-split` was deleted and the wrapper is now `.btn-group`.
Geometry measured identical before and after. What remains here is only what is
genuinely FilterBar's: the chevron half's `--ai-spacing-4` inline padding and
the 160/8 panel sizing.

`ButtonGroup.css` is now linked by this demo, ListingScreen and SeatingPlanner
— none of the three loaded it before.

## Chip pickers (2026-09-17)

Clicking a chip opens the FilterDropdowns it is assigned. `FilterItem` emits
`filter-item:toggle` and its contract says outright *"Mount your own value
picker on this event"* — the bar is that consumer, so the mounting lives here.

**The bar stays generic.** It never knows which dropdown Type a chip has, only
that a chip *may* have a `.filter-bar__panel` sibling inside a
`.filter-bar__chip` wrapper. The screen supplies the panel content, so one bar
serves every listing screen. A chip with no panel simply no-ops — which is why
this demo's 35 chips are unaffected.

Positioning is CSS, not measurement: the panel is a sibling inside a
`position: relative` wrapper. The chips row **wraps**, so a JS-positioned panel
would need recomputing on every reflow — and this column reflows with no window
resize at all when the SidebarMenu docks. The one thing JS does measure is
overflow: after showing, if the 320px card would overrun the bar's end edge it
gets `.filter-bar__panel--end` to flip sides. That cannot be done before showing,
since a hidden element has no box.

`.filter-dropdowns` brings its own card chrome, so the wrapper adds none —
nesting it in a `.dropdown__panel` would draw the border and shadow twice.
Offset and layer match `.dropdown__panel` (`--ai-spacing-3`, z-index 10) so
every popover in the bar sits on one convention.

### The nested-chip trap

**Type=More Filters is itself built from `.filter-item` chips**, and those bubble
`filter-item:toggle` exactly like a bar chip. Without a guard, clicking "Order
Date" inside the Add Filters panel walks up to the Add Filters wrapper and
closes the very panel it lives in. `panelOf()` returns null for any chip that is
`.closest('.filter-bar__panel')`. Caught by testing the nested click, not by
reading the code.

## Notes

- Composition: Dropdown-as-views-trigger, Input search, no invented hover/focus (WCAG `:focus-visible` only).
- Export icon: Figma "Icon/24px/Export" (tray + down arrow) → Lucide **`download`**.

## Backend handover

`TODO(backend:Filters)` — see `HANDOVER.md` → Surface: Filters (shared with FilterItem).

## Dependencies

Dropdown (+ DropdownItem), FilterItem, Input, Button. Lucide: `chevron-down`, `download`, `search`,
`ellipsis-vertical`, `arrow-left`, `plus`, `x`, `check`, `ellipsis`, `copy`, `trash-2`.


## Chip ↔ picker: committing a selection

The bar joins two event contracts it does not own:

| Event | From | Meaning |
|---|---|---|
| `filter-dropdown-item:toggle` | FilterDropdownItem | an option row was picked |
| `filter-dropdowns:apply` | FilterDropdowns | the panel's Apply was pressed |
| `filter-item:clear` | FilterItem | the chip's × was pressed |

`valuesIn(panel)` reads the picked values **from the panel's shape**, never from
a type name, so the bar stays generic and a new picker type needs no change here:

1. a `[data-select-menu]` present → the selected option rows are the value.
   Predictive panels also contain a text input, but that is a SEARCH field —
   the menu must win, or a half-typed query would become the filter value.
2. checkboxes present → every checked label.
3. neither → a plain field, so its text is the value.

The values go to `chip.setFilterValues()`, which is FilterItem's own API and
already implements the Figma rollup (1–3 listed in full, 4+ → `<first>, and N
more`) and the drop back to Default on an empty list. So the chip's selected
state, its label and its separator all fall out of that one call — the bar
computes none of them.

**Everything commits on Apply** — every FilterDropdowns type but More Filters
has the button (3039:5639). Picking an option row closes the MENU and fills the
field; the chip changes only when Apply is pressed. Nothing in the bar listens
to `filter-dropdown-item:toggle` for that reason.

**Gotcha — the option rows are a separate component.** `FilterDropdowns.js`
only CONSTRAINS `.filter-dropdown-item` to single-select; the click handler
lives in `FilterDropdownItem.js`. A page that loads FilterDropdowns without it
gets pickers that open and cannot be picked from, with no error. ListingScreen
hit exactly this.

## Adding a filter to the bar

Clicking a facet in the More Filters panel emits `filter-bar:add-filter`
(bubbles, `detail: { name }`). More Filters is the one type with no Apply, so
the click IS the commit — and the panel stays OPEN: the facets are a pick-list
several of which are usually wanted, and the picked one leaves the list as it
goes. It closes on the outside click, like any panel.

That last part needs `composedPath()`, not `root.contains(e.target)`: the
facet has been removed from the DOM by the time the document-level click
listener runs, so the live-DOM check reports the click as OUTSIDE the bar and
closes the panel the user is still picking from. The path is captured at
dispatch and still remembers where the click came from.

The bar deliberately does
**not** build the chip: it does not know what picker that filter wants. The
screen owns the filter config, so it listens and splices the chip in before the
Add Filters chip, then removes the facet from the panel.

Splice, not re-render: rebuilding the chip row would discard the selections
already made on the other chips, which is the opposite of what adding a sixth
filter should do.


## Save view — when it appears, and what it does

`.filter-bar--save-view` reveals the CTA. The state means **the bar no longer
matches the view it names** — a difference, not "a filter is set". A saved view
full of filters is not dirty, and the CTA must vanish the moment its own view
is saved, so "any chip has values" cannot be the test.

The comparison is a signature of the chips on the bar and the values each
holds. Both halves matter: adding a filter changes the view before it has a
value. Values come from `announce`, never from the chip's label, which rolls
4+ up into `<first>, and 3 more` and would call two different four-value
selections identical. Reverting a change hides the CTA again, for free.

`root.setViewExtra(string)` lets the CONSUMER put its own half of the view
state into the same comparison. The listing uses it for the table layout:
editing the columns is a change to the view in exactly the way adding a filter
is, and has to reach the same CTA — but the bar has no business knowing what a
column is, so the value is opaque and only ever compared.

`root.resetSaveView(valuesByName)` re-baselines — the screen calls it after the
first render, and after a view is selected or saved. It takes the values rather
than trusting the bar's cache, because those chips are brand new.

This replaced a mock that revealed the CTA when the Add Filters chip was merely
OPENED — a look that changes nothing was enough to offer a save.

### Saving

The CTA does not save on the spot; a view needs a name, so it opens the naming
field. That field is **New View's** (2977:3799) — the only naming UI Figma
defines — under a second class, `--saving-view`, because New View also collapses
row 2 to just Add Filters and a view being SAVED is being saved *because of* the
chips on the bar. In that mode the Create button reads **Save** and the CTA that
opened it is hidden (that last rule sits after `--save-view`'s, since both are
one class + one class and the cascade is decided by order).

Create then:

1. marks the row non-empty, so selecting it keeps the chips;
2. dispatches `filter-bar:save-view` `{ name, view }` **before** selecting it —
   the screen snapshots its filter set against that row, and selecting would
   otherwise ask it to restore a view it has not recorded yet;
3. selects the row, which dispatches `filter-bar:select-view` `{ name, view }`.

The bar owns the list and the rows; it never learns what a view MEANS. The
screen keeps the snapshots, keyed by row element, and restores on select.

TODO(backend:Filters): saved views are in memory — a reload restores the
shipped set.


## Search

Both search fields — the persistent desktop one and the mobile takeover — are
the same search, so they mirror each other and either drives it.

`filter-bar:search` (bubbles, `{ query }`) fires on input. The bar owns the
**3-character threshold** and reports `''` below it, so a consumer never has to
re-check: one or two characters match most of a listing, and the table would
thrash on the first keystroke then settle, which reads as a bug rather than a
search. Typing within the threshold emits nothing at all.

Leaving the mobile takeover (`search-exit`) clears the query via
`root.clearSearch()` — otherwise a field that is no longer on screen would keep
filtering.

TODO(backend:Filters): the query belongs in the listing request, not in a
client-side scan.


## One thing open at a time

Every menu on the bar closes when a click lands anywhere else — including on
another control WITHIN the bar. Two things were stopping that:

1. **Dropdown's trigger called `stopPropagation()`**, so a click that opened one
   dropdown never reached `document` and no other dropdown heard it. Opening the
   kebab while the saved-views list was open left both on screen. It is safe to
   remove: each dropdown's own outside-click handler ignores clicks inside
   itself, so letting the event through cannot close the one being opened.
2. **The bar's chip-panel handler asked "was this click inside the BAR?"** — so
   clicking the views control, the kebab, Export, the search field or bare space
   in the bar left an open picker hanging. It now asks "was this click on a CHIP
   or inside its picker?", which is the question that actually matters.

Verified as a chain — chip picker → views → kebab → Edit Columns → rows-per-page
→ bare bar space — with exactly one open at every step and none at the end.
Clicking INSIDE an open picker still does not close it, and More Filters still
stays open while facets are being picked.


## Keeping a picker inside the bar

Two steps, because neither alone is enough:

1. **Flip** to the end edge when the panel hangs off the right.
2. **Nudge** whatever still sticks out, with a translate.

The flip alone was fine while every picker was 320px. A panel anchors to its
CHIP, though, and the chips wrap — so a wide one (More Filters runs to 640px)
can hang off the LEFT even after flipping, simply because its chip sits mid-row.
Measured at a 378px page: a 351px panel sat at left -56. Verified inside the bar
at 430px, 900px and 1600px pages.


## Discard changes — built, then removed

A tertiary "Discard changes" sat beside Save view, sharing its visibility and
restoring the selected view's snapshot. Removed 2026-09-18 ("we may add back in
later"), so this is the record of what it was:

- `filter-bar:discard-view` (bubbles, no detail) — the bar reported the intent,
  the screen restored its snapshot of the CURRENTLY SELECTED view, not the
  baseline.
- The capability still exists without the button: re-picking the current view
  from the saved-views dropdown restores it. The button only made that
  discoverable.
- Two things it needed, worth knowing if it comes back: the pair had to be ONE
  flex item or Discard stayed on the chips line while Save view dropped below
  it, and Discard needed the CC tertiary ghost override or it rendered as a
  solid grey pill next to the primary.


## `valuesIn` checks the table FIRST

Shape alone stopped being enough once panels could nest. A Multi Select Table
carries its own sub-filter pickers, so the panel contains a `[data-select-menu]`
and a checkbox list belonging to controls that narrow the TABLE rather than name
the filter's value — and the menu branch happily read one of those instead.
`[data-row-value]` is therefore tested before any shape test.


## An open picker is re-placed when the bar changes shape

`placePanel()` runs on open AND from a `ResizeObserver` on the bar. Its
position used to be computed once and kept, so resizing the window or docking
the sidebar left an open panel stranded — off the left-hand edge and under the
menu — until it was closed and reopened.

A ResizeObserver on the bar rather than a window resize listener: the CC
sidebar changes this width with no window resize at all (CLAUDE.md §4a). It
also catches the bar gaining a row when chips wrap, which moves every panel
hanging below it.


## Pickers size against the BAR, not the page column

Reported from a real device, 2026-09-21: the More Filters panel hung off the
right of the screen.

The pickers already sized themselves with `100cqi` — "the space available" —
but the nearest container was `cs-page`, the whole page column, which is wider
than the bar sitting inside it by the bar's own margins and padding. At a 393px
viewport that is 329 against 314.

Two consequences, and the first is the one that bites: the More Filters card's
`min-inline-size` floor of 320px was then WIDER than the 314px bar. **A card
that cannot fit cannot be placed** — `placePanel` has to choose which edge to
satisfy and picks the left, so the excess hangs off the right no matter how
good the placement logic is.

Fixed at the source rather than in the placement:

- `.filter-bar` declares `container: fb-bar / inline-size`, so `cqi` in a
  picker now means the bar. Named, so the `@container cs-page` rules in this
  file and in FilterDropdowns.css still reach past it to the page column.
- The More Filters floor became `min(var(--ai-size-6), 100cqi)`. A floor that
  cannot be met is just an overflow with a nicer name.

Measured at 360 / 393 / 430 / 600 / 900 / 1400: the panel never exceeds the
bar, no chip overflows it, and the 640px ceiling still applies where there is
room. The Multi Select Table picker gained the same correction for free — it
used the same `cqi` — and now stops at 312px on a 314px bar instead of 329.

**Not the same bug as the missing page padding** reported the same morning,
though they looked alike on the device: that one is a scrollbar-gutter
compensation that overshoots where scrollbars are overlays (see
`ControlScreen.figma-notes.md`). This one is a card wider than its bar. They
compound — no right padding puts the bar's edge on the screen edge, so the
overhang has nowhere to go.
