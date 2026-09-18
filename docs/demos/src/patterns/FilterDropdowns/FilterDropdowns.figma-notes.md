# FilterDropdowns — Figma Notes

## Figma Node
- File: `Lus07xi8pPXLN87sQIyrEt` (Affino AI Design System)
- Component set: `3039:5639` — "FilterDropdowns" — [open in Figma](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=3039-5639)
- Tier: `Pattern` → built into `src/patterns/FilterDropdowns/`

The popover bodies that open from a FilterItem / the FilterBar. One shared shell — a
bordered 320px card with a per-type body and a full-width **Apply** button — composes
existing design-system components for each of 17 filter types.

## Dependencies (composed)
- **Input** (`78:2016`) — the "Filter by X" header label, and the select / search / date-operator fields (label + field + right icon).
- **Checkbox** (`2043:2985`) — Multi Select rows and the single Checkbox type.
- **FilterDropdownItemGroup** (`3032:18397`) + **FilterDropdownItem** (`3032:18152`) — the Select Options lists.
- **FilterItem** (`2972:1058`) — the empty/dashed chips in More Filters.
- **DatePicker** (`3039:8761`) — the date operand fields (Date Range / Date Equal To), as popover triggers.
- **Button** (`53:2489`) — the primary Apply button (full-width).

## Variant matrix (17 Type values)

| Node ID | Type | Body composition | Built |
|---|---|---|---|
| 3039:5627 | Select | *consolidated* → shown as Select Options (see below) | 🔁 |
| 3039:5632 | w/Placeholder | *consolidated* → shown as Select Options (see below) | 🔁 |
| 3039:5633 | Text | Input (text) | ✅ |
| 3039:5626 | Checkbox | title + single Checkbox | ✅ |
| 3039:5629 | Multi Select | label + Checkbox list (gap-5, max-h 384px) | ✅ |
| 3039:5623 | Multi Select w/search | Input (search) + scrolling Checkbox list | ✅ |
| 3039:5634 | Select Options | Input (chevron) + FilterDropdownItemGroup + Apply (open state) | ✅ |
| 3039:5628 | Select Options w/subtext | Input (chevron) + FilterDropdownItemGroup (subtext) + Apply | ✅ |
| 3039:5636 | Date In the last | Input (operator) + [number + unit select] | ✅ |
| 3039:5635 | Date Range | Input (operator) + [DatePicker "and" DatePicker] | ✅ |
| 3039:5631 | Date Equal To | Input (operator) + corner + DatePicker | ✅ |
| 3039:5637 | More Filters | FilterItem empty/rounded chips (no Apply) | ✅ |
| 3039:5638 | Predictive Text | *consolidated* → Predictive Text Options (predictive always reveals options) | 🔁 |
| 3039:5625 | Predictive Text Options | text Input + type-to-reveal single-select menu + Apply | ✅ |
| 3039:5622 | Predictive text Options w/subtext | same, with subtext rows + Apply | ✅ |
| 3039:5624 | Multi Select Table | 640px card: label + FilterItem chips + Datatables (checkbox/Name/Catalogue ID/Zone, row-link) + Apply | ✅ |
| 3039:5630 | Multi Select Modal | 960px Modal: title + 7 FilterItem chips + Datatables (adds Price) + Cancel/Apply | ✅ |

**Select consolidation (user direction, 2026-07-07):** the plain `Select` and
`w/Placeholder` variants are NOT shown as standalone panels. Per the reference, the Select
is represented as **two versions of its open state** — the select field + the
`FilterDropdownItemGroup` dropping below it, one without sub text (`Select Options`) and one
with (`Select Options w/subtext`).

**Apply is on EVERY type but More Filters (corrected 2026-09-17).** These four option types
were originally built without it, on the reading that choosing an option is the action.
Figma disagrees: the card is **136px** in every type — label (16) + gap (8) + field (40) +
gap (8) + Apply (40) + padding (2×12) — and the screenshot of `3039:5639` shows the teal
button on all sixteen. Only `More Filters` (3039:5637) has none, because there a chip click
IS the commit.

So **picking an option is not yet a filter**: it closes the menu and fills the field, and
Apply commits. Note what this means for layout — Figma anchors the menu 4px under the FIELD,
so an open menu **overlays** the Apply button rather than pushing it below. The menu is
therefore a child of `.input` (which carries `position: relative` in `--select`), not a
sibling of it; anchoring to the card would drop the menu under the button.

**Predictive types (built, user direction 2026-07-07):** consolidated to **2** — a text
Input whose suggestion menu reveals *as characters are typed* (like Select on click), then
single-select fills the field. `Predictive Text` (no options) is dropped since a predictive
field inherently reveals options. Wired by `wirePredictive` in `FilterDropdowns.js`.

**Phase 2 complete (2026-07-07):** Multi Select Table (composes Datatables + FilterItem +
Checkbox + Button; 640px = `--ai-size-10`, Figma's 671px snapped to token per direction) and
Multi Select Modal (composes the Modal pattern + Datatables + FilterItem; 960px = `--ai-size-12`).
All 17 Figma types now represented (Select and Predictive Text consolidated per direction).

## Interaction (confirmed with user, 2026-07-07)

- **Functional, reusing child JS.** Checkboxes toggle natively; Select Options items toggle
  via `FilterDropdownItem.js`; date fields open a `DatePicker` popover via `DatePicker.js`.
- Pattern-owned glue (`FilterDropdowns.js`): live **search-filtering** of the checkbox list
  (Multi Select w/search); an **Apply** button that emits `filter-dropdowns:apply`; and the
  **interactive Select** — clicking the field trigger opens/closes the floating
  `FilterDropdownItemGroup` menu (chevron rotates). The Select Options menus are
  **single-select**: choosing an option clears the others, sets the field value, and closes
  the menu; clicking outside / Esc also closes. (The shared `FilterDropdownItem` component
  remains multi-select for the checkbox-style lists; single-select is enforced in the
  pattern glue for select menus only.)
- The operator / unit selects (Date types) render as readonly Input-chevron fields — a real
  Select/menu can be wired by the consumer.

## CSS Class Mapping

| Figma element | CSS |
|---|---|
| Card shell | `.filter-dropdowns` (`--list` = wider gap + capped scrolling body for Multi Select types) |
| Standalone header title (Checkbox type) | `.filter-dropdowns__title` |
| Checkbox list | `.filter-dropdowns__checklist` (scrolls under `--list`) |
| Single-checkbox body | `.filter-dropdowns__checkbox-body` |
| Date operand row | `.filter-dropdowns__date-row` |
| "and" separator | `.filter-dropdowns__date-sep` |
| Leading corner icon | `.filter-dropdowns__date-corner` (Lucide `corner-down-right`, 20px) |
| More Filters chip wrap | `.filter-dropdowns__facets` |
| Apply | `.btn.btn--primary.filter-dropdowns__apply` (full width) |
| Options popover | `.filter-dropdown-item-group` (child component) |

## Token Mapping

| Property | Token |
|---|---|
| Card bg / border / radius | `--ai-surface-primary` / `--ai-border-secondary` (1px) / `--ai-radius-md` |
| Card padding | `--ai-spacing-4` (12px) |
| Card gap | `--ai-spacing-3` (8px); `--ai-spacing-5` (16px) for `--list` |
| Card shadow | `--ai-shadow-md` (Figma `light/shadow-md`) |
| Card width | `--ai-size-6` (320px); `--list` max-height `--ai-size-7` (384px) |
| Checklist gap / bottom pad | `--ai-spacing-4` / `--ai-spacing-3` |
| Date corner icon | `--ai-icon-size-md` (20px), `--ai-icon-contrast` |
| Header title / label | `--ai-font-title` semibold `--ai-font-fixed-xs` (14px) |

## Token Gaps / Decisions
- **No token gaps** — every value maps to an existing `--ai-*` token.
- **Radius binding quirk:** Figma bound the card `border-radius` to `--ai-spacing-3` (8px).
  Used `--ai-radius-md` (same 8px, correct category) — consistent with FilterDropdownItem(Group).
- **Shadow:** Figma `light/shadow-md` (`0 3px 10px .1, 0 1px 4px .16`) → `--ai-shadow-md`
  (`0 2px 10px .1`) — the design-system's named md shadow; optical, within tolerance.

## Notes
- **Icons (Lucide):** `chevron-down` (select/unit fields), `search` (search field),
  `calendar` (date fields, via DatePicker), `corner-down-right` (indented operand rows),
  `plus`/`circle-check`/`check` come from FilterItem / FilterDropdownItem / Checkbox.
- **Header = Input label:** Figma composes the Input component for the "Filter by X" heading
  (label-only for Multi Select; label + field otherwise). Checkbox type uses a standalone
  `.filter-dropdowns__title` instead of an Input label.
- **Width:** all bodies are 320px (`--ai-size-6`) except the pending Table (671px) and Modal
  (960px) which will not fit this shell — they are separate layouts in phase 2.


## Resetting a card

`root.resetFilterDropdown()` is public on every `[data-filter-dropdowns]`,
like FilterItem's `setFilterValues`. A consuming bar clears the chip and the
card together, and only the card knows what "unset" means per type: drop the
selected rows, untick the checkboxes, empty the fields — **and put the select
field back to its placeholder**, which lives in a closure, not in the markup.

FilterBar used to do this from outside and could only manage the first half.
The chosen name stayed in the field, greyed by the placeholder class, so a
cleared Customer filter looked like it still had a value that could not be
chosen again.

**`data-placeholder` on `[data-select-value]`** is what makes the restore
correct. `wireSelect` previously took the placeholder from whatever the field
said at init — fine when a card is always rendered empty, wrong now that one
can be rendered with a value already in it (restoring a saved view), because
the placeholder became that value and clearing put it straight back. The
attribute is the placeholder; the text is the state.


## Type=More Filters is the one type that is not a fixed 320

`.filter-dropdowns--more` sizes to its contents between a floor and a ceiling
(designer, 2026-09-18: min `--ai-size-6`, max `--ai-size-10`). Figma draws it at
the shared 320px, which suits the nine facets it shows; a real screen carries
far more — Orders has 47 — and at 320 they wrap into a tall narrow column that
is hard to scan.

`max-content` on a wrapping flex row resolves to the width the chips would take
on ONE line, so the rule reads as "as wide as it wants, within bounds".

The ceiling is `min(var(--ai-size-10), 100cqi)`, not a flat 640. The base
panel's `max-width: 100%` cannot cap it: the panel is absolutely positioned, so
its containing block is the chip it hangs off, and 100% of that is a chip's
width. Measured without the cap, a 640px panel on a 378px page sat at left
-345 — off screen entirely.


## Multi Select Table: select-all and row values

Two attributes make this type work for a consumer, added 2026-09-18 when the
Listing Screen started using it:

- `data-select-all` on the header checkbox — `wireSelectAll` ticks and unticks
  every row from it, and reflects partial selection back as `indeterminate`.
  Without it the header checkbox was decoration.
- `data-row-value="<name>"` on each row checkbox — the row's checkbox has no
  label of its own (the name is a sibling cell), so a consuming bar has no way
  to read what was selected without this.

The demo carries both, so the component's own gallery exercises them.


## Multi Select Table: no horizontal scroll

Cells WRAP in this table rather than inheriting Table.css's `white-space:
nowrap`. That nowrap is right for a table that can scroll; in a 640px picker it
is the wrong trade. One real catalogue name — "Affino Innovation Briefing 2019 -
Actionable Intelligence, Case Study and 2020 Roadmap" — took the Name column to
602px and the table to 885 inside a 623 body, putting Catalogue ID and Zone off
the right-hand edge behind a scrollbar. Those are the two columns that tell two
similarly named items apart, which is the whole reason this type is a table.

The two predictable columns carry a preferred width (`--ai-size-1`) and Name
absorbs the variation. Without that, auto layout gave the long names so much
room that the codes broke mid-string — "Aff9882376" rendered as "Aff98823 /
76", which for an operator-typed SKU reads as a different value.

`overflow-wrap: anywhere` stays on the code column as a safety net: a Catalogue
ID is free text and a longer one with no break opportunity would otherwise set
the column's min-content width and bring the scroll back.


## A card can contain a card, so no descendant queries

Every wiring lookup goes through `own()` / `ownAll()`, which keep only elements
whose nearest `[data-filter-dropdowns]` ancestor IS this root.

The Multi Select Table's sub-filters are `.filter-dropdowns` cards in their own
right, so the pattern can now contain itself — and
`root.querySelector('[data-filter-dropdowns-apply]')` reached straight through
one. The outer card bound its Apply to the FIRST apply button in its subtree,
which was a sub-filter's. Clicking that fired an apply for the OUTER card as
well: it committed an empty value to the chip and closed the whole picker,
while the sub-filter appeared to work.

Two events, one click, and only the second looked wrong. The fix is at the
component, not the consumer: the same trap was waiting in `wireSearch`,
`wireSelect`, `wirePredictive`, `wireSelectAll` and `wireReset`, all of which
used the same descendant query.


## Multi Select Table: solid chips, tighter rows

Its four sub-filter chips are the **Default** FilterItem — solid, like the
bar's own chips. They had been built with `--empty`, which is the dashed "not
yet added" idiom and belongs to Add Filters and the More Filters facets; these
are controls that are already present. Figma 3039:5624 draws them solid, so
this was a fidelity fix, not a departure (designer, 2026-09-18).

Rows use `--ai-leading-sm`, matching the listing's own table. The shared Table
default is `leading-md`, which leaves a picker you are scanning for one item
looking airy. Scoped here rather than changed in Table.css.


## Multi Select Table scrolls rather than dropping columns

It used to shed Zone at 520px and Catalogue ID at 380px. That was wrong for
THIS table: those two columns are how you tell two similarly named items apart,
so hiding them at narrow widths removes the reason to use a table (designer,
2026-09-18). Every column is kept and the table overflows instead.

The minimum that forces that lives on the COLUMNS, not on the table. Putting
640 — the card's own width — on the table over-shot by 17px and clipped the
last column on a desktop with room to spare: 640 is the card's OUTER width,
and the scrolling body's inner width is 623. Summing what each column actually
needs instead (32 + 192 + 128 + 128 + 32 = 512) fits comfortably at 623 and
still overflows when the card is genuinely narrow.

Measured: no scroll at all down to a 620px page; 72px of scroll at 900 and
152px at 820, which are the widths where the sidebar squeezes the card to 457
and 377.

Mouse **drag-to-scroll** comes with it. Touch and trackpads already scroll an
overflowing box; a mouse has no gesture for it and a scrollbar under a list you
are reading is easy to miss. A drag never starts on an input, button, link or
label, and needs 4px of travel before it counts — so a click that wobbles is
still a click.

Note this is the opposite call from the LISTING's table, which drops columns
rather than scrolling. The difference is what the table is for: the listing is
a view of many records where the far columns are extra, and the picker is a
disambiguator where they are the point.


## Multi Select Table type matches the Orders datatable

Same tokens, same switch. Wide: `--ai-font-fixed-xxs` headers, `--ai-font-fixed-xs`
cells — the Table defaults. Cramped: `4xs` and `2xs`, the same two the Orders
table steps down to.

The threshold is read from **`cs-page`**, not from the card. Keyed to its own
box the picker could never agree with the listing: the card is never wider than
640 and the listing switches below 767, so at a 1200px page the listing sat at
11/13 while the picker was still at 12/14 — two tables on screen at once, in
different sizes. `cs-page` is the signal the listing is really responding to
(its datatable is the page column less its padding), so at ~800 the two switch
together.

Measured at 1900 / 1500 / 1250 / 1150 / 900 / 820: identical in both tables at
every width.


## Multi Select Table: a date column

Contact Lists (2026-09-18) is the second filter to use this type, with Name +
Created rather than Catalogue Item's Name / Catalogue ID / Zone. Two things
followed:

- The column classes are no longer fixed to that one table — the screen names
  its own per filter. `--date` joins `--code` and `--zone` at the 128px
  preferred width.
- `--date` is the one column here that keeps `white-space: nowrap`. The picker
  turns wrapping on for everything so no column is pushed off the edge, but a
  date broken over two lines reads as two values. `.table` is in the selector
  purely to out-specify that blanket rule, which names an element and would
  otherwise win.
