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
