# FilterBarV2 — Figma Notes

## Figma Node

- **File:** `Lus07xi8pPXLN87sQIyrEt` (Affino AI Design System)
- **Component set:** `2977:3811` ("Filters V2")
- **Tier:** `Pattern` → `src/patterns/FilterBarV2/`
- URL: https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2977-3811

A/B variant **2** of the filter toolbar (see [FilterBarV1](../FilterBarV1/) for variant 1).
**Two-row card:** row 1 = saved-views + an explicit **Export** button + search/kebab; row 2 =
the filter chips with "Add Filters" pinned right.

## How V2 differs from V1

| | V1 | V2 |
|---|---|---|
| Layout | single row | **two rows** (border between) |
| Export | inside the kebab menu | **explicit `btn--secondary` button** (row 1) |
| Chips | dashed **Empty** treatment | **solid Default** treatment (only Add Filters dashed) |
| Views trigger text | medium | regular |
| Kebab items | Export / Generate Shipping Labels | Some action / Generate Shipping Labels |
| Search mode | replaces the whole bar | replaces **row 1 only** — chips row stays |
| Mobile | views+actions row, chips wrap | same, **Export collapses out of the bar** |

## Variant matrix (14 = 7 Type × Desktop/Mobile)

`Type` = scenarios of one toolbar (modelled as JS modes + composed-component states).

| Node ID (Desktop / Mobile) | Type | Representation |
|---|---|---|
| 2977:3803 / 2977:3804 | Default | base markup (solid chips) |
| 2977:3801 / 2977:3810 | Filter Active | a chip carries `.filter-item--selected` |
| 2977:3797 / 2977:3808 | Views dropdown | saved-views `.dropdown` is `.is-open` |
| 2977:3799 / 2977:3806 | New View | root `.filter-bar-v2--new-view` |
| 2977:3798 / 2977:3802 | Wrapping | more chips → row 2 flex-wraps |
| 2977:3800 / 2977:3809 | Search | root `.filter-bar-v2--search` |
| 2977:3807 / 2977:3805 | Actions | kebab `.dropdown` is `.is-open` |

Desktop fetched in full: Default, New View, Search. The rest are state/content permutations.

## Layout

- Outer: `flex-direction: column`, border-secondary, radius-md, `overflow: hidden` (clips the
  inter-row border to the rounded corners).
- **Row 1** (`.filter-bar-v2__row--top`, `border-bottom`): `[lead (views) ........ Export  search  kebab]`,
  px `--ai-spacing-5` / py `--ai-spacing-4`, gap `--ai-spacing-5`.
- **Row 2**: `[chips (flex-1, wrap) ........ Add Filters]`, same padding.
- **Mobile (≤767px):** rows already stack; the **Export button is hidden** (`display:none`) per the
  Figma mobile variants.

## Modes (JS — FilterBarV2.js)

| Mode | Class | Effect |
|---|---|---|
| Search | `.filter-bar-v2--search` | row 1 → back-arrow + full-width search Input (Export + actions hidden); **chips row 2 stays** |
| New View | `.filter-bar-v2--new-view` | row 1 views → "New view" Input + Create (Export + actions stay); **row 2 collapses to just Add Filters** |

**Saved-view selection + double-click inline rename** (`FilterBarV2.js` `wireViews` — same model
as FilterBarV1: capture-phase click takeover, 220ms single/double disambiguation, `.filter-bar-v2__rename`
input overlaid on the `<li>`; code-first, not in Figma — flag for designer) and the **right-aligned kebab panel**
(`.filter-bar-v2__menu .dropdown__panel { left:auto; right:0 }`) match FilterBarV1. V2's search
field lives inside `__lead` (which stays visible in search mode), so it needs no relocation.

## CSS Class Mapping

| Element | Class | Notes |
|---|---|---|
| Root | `.filter-bar-v2` | column, border-secondary, radius-md, overflow hidden |
| Row | `.filter-bar-v2__row` (+`--top`) | flex, gap 16, pad 12/16; `--top` adds bottom border |
| Lead (row 1) | `.filter-bar-v2__lead` | flex-1, gap 8 — holds views / new-view / search |
| Views control | `.dropdown.filter-bar-v2__views` | Dropdown filter-views panel; trigger field is **regular** weight |
| Export | `.btn.btn--secondary.filter-bar-v2__export` | Button + `download` icon + "Export"; hidden on mobile |
| Actions | `.filter-bar-v2__actions` | search icon-btn + kebab `.dropdown` |
| Chips (row 2) | `.filter-bar-v2__chips` | flex-wrap, gap 8; chips are FilterItem **default (solid)** / `--selected` |
| Add Filters | `.filter-item--empty.filter-bar-v2__add` | dashed, pinned right |
| Search / New-view / Create / Back | `.filter-bar-v2__{search,new-view,create,back}` | compose Input / Button |

## Token Mapping

Same token set as FilterBarV1 (surface-primary, border-secondary, spacing-3/4/5/8, size-3,
radius-md, icon-contrast, icon-size-sm, font-body/fixed-xs/leading-md). The views trigger uses
`--ai-font-regular` (V1 uses `--ai-font-medium`). Export button uses the Button component's
`--ai-btn-secondary-*` tokens. Selected chips use `--ai-surface-info-soft` / `--ai-border-info`
via the FilterItem component.

## Token Gaps

None for the shell. Same documented Figma artifact as V1: the "Add Filters" **MinimalBadge** uses
raw `#364153` (Gray/700) — replaced here with a proper **FilterItem `--empty`** (`--ai-text-primary`).
Outer frame width is `970px` in Figma (no token; V1 uses `--ai-size-12` 960) — built **fluid**
(`width: 100%`, consumer-controlled), so the arbitrary 970 is not hardcoded.

## Notes

- Same composition decisions as V1 (Dropdown-as-views-trigger, Input search full-width, no invented
  hover/focus). See [FilterBarV1 notes](../FilterBarV1/FilterBarV1.figma-notes.md).
- Export icon: Figma "Icon/24px/Export" (tray + down arrow) → Lucide **`download`**.

## Backend handover

`TODO(backend:Filters)` — see `HANDOVER.md` → Surface: Filters (shared with V1 + FilterItem).

## Dependencies

Dropdown (+ DropdownItem), FilterItem, Input, Button. Lucide: `chevron-down`, `download`, `search`,
`ellipsis-vertical`, `arrow-left`, `plus`, `x`, `check`, `ellipsis`, `copy`, `trash-2`.
