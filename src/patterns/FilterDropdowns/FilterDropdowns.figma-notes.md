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
| 3039:5634 | Select Options | Input (chevron) + FilterDropdownItemGroup, **no Apply** (open state) | ✅ |
| 3039:5628 | Select Options w/subtext | Input (chevron) + FilterDropdownItemGroup (subtext), **no Apply** | ✅ |
| 3039:5636 | Date In the last | Input (operator) + [number + unit select] | ✅ |
| 3039:5635 | Date Range | Input (operator) + [DatePicker "and" DatePicker] | ✅ |
| 3039:5631 | Date Equal To | Input (operator) + corner + DatePicker | ✅ |
| 3039:5637 | More Filters | FilterItem empty/rounded chips (no Apply) | ✅ |
| 3039:5638 | Predictive Text | *consolidated* → Predictive Text Options (predictive always reveals options) | 🔁 |
| 3039:5625 | Predictive Text Options | text Input + type-to-reveal single-select menu | ✅ |
| 3039:5622 | Predictive text Options w/subtext | same, with subtext rows | ✅ |
| 3039:5624 | Multi Select Table | 640px card: label + FilterItem chips + Datatables (checkbox/Name/Catalogue ID/Zone, row-link) + Apply | ✅ |
| 3039:5630 | Multi Select Modal | 960px Modal: title + 7 FilterItem chips + Datatables (adds Price) + Cancel/Apply | ✅ |

**Select consolidation (user direction, 2026-07-07):** the plain `Select` and
`w/Placeholder` variants are NOT shown as standalone panels. Per the reference, the Select
is represented as **two versions of its open state** — the select field + the
`FilterDropdownItemGroup` dropping below it, one without sub text (`Select Options`) and one
with (`Select Options w/subtext`). These two omit the Apply button: choosing an option is
the action.

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
