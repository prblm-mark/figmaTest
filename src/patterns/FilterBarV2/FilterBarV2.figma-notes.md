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

## Variant matrix (8 Type × Desktop/Mobile)

`Type` = scenarios of one toolbar (modelled as JS modes + composed-component states).

| Node ID (Desktop / Mobile) | Type | Representation |
|---|---|---|
| 2977:3803 / 2977:3804 | Default | base markup (solid chips) |
| 2977:3801 / 2977:3810 | Filter Active | a chip carries `.filter-item--selected` |
| 2977:3797 / 2977:3808 | Views dropdown | saved-views `.dropdown` is `.is-open` |
| 2977:3799 / 2977:3806 | New View | root `.filter-bar-v2--new-view` |
| 2977:3798 / 2977:3802 | Wrapping | more chips → row 2 flex-wraps |
| 2989:6121 / 2989:6242 | Save View | root `.filter-bar-v2--save-view` reveals a "Save view" primary CTA (Button, sm) pinned right of row 2; Add Filters rejoins the chip flow |
| 2977:3800 / 2977:3809 | Search | root `.filter-bar-v2--search` |
| 2977:3807 / 2977:3805 | Actions | kebab `.dropdown` is `.is-open` |

Desktop fetched in full: Default, New View, Search. The rest are state/content permutations.

## Layout

- Outer: `flex-direction: column`, `background: surface-primary`, border-secondary, radius-md.
  **No `overflow: hidden`** — the root's own bg + radius round the card and the inter-row
  divider sits mid-card, so nothing needs clipping; clipping would crop the saved-views /
  kebab dropdown panels (which must escape the card).
- **Row 1** (`.filter-bar-v2__row--top`, `border-bottom`): `[lead (views) ........ Export  search  kebab]`,
  px `--ai-spacing-5` / py `--ai-spacing-4`, gap `--ai-spacing-5`.
- **Row 2**: `[chips (flex-1, wrap) — "Add Filters" is the last chip in the flow]`, same padding.
  (In the Save View state a "Save view" CTA sits as a sibling after `__chips`, pinned right.)
- **Mobile (≤767px):** rows already stack; the **Export button is hidden** (`display:none`) per the
  Figma mobile variants; the **chips row scrolls horizontally instead of wrapping** —
  `.filter-bar-v2__chips` becomes `flex-wrap: nowrap; overflow-x: auto` with chips `flex-shrink: 0`
  (Figma mobile variant 2977:3804: single non-wrapping clipped row). Scrollbar hidden for a clean
  look. The Save view CTA stays a sibling outside the scroll area (pinned right).
  The **New View "Create" CTA uses the small button** at mobile (`btn--sm` sizing applied to
  `.filter-bar-v2__create` in the media query — padding `--ai-spacing-4`, `min-height --ai-spacing-7`,
  `font-size --ai-font-fluid-xxs`), per Figma mobile New View variant 2977:3806 (`button/sm`).
  Desktop keeps `button/base`.

## Modes (JS — FilterBarV2.js)

| Mode | Class | Effect |
|---|---|---|
| Search | `.filter-bar-v2--search` | row 1 → back-arrow + full-width search Input (Export + actions hidden); **chips row 2 stays** |
| New View | `.filter-bar-v2--new-view` | row 1 views → "New view" Input + Create (Export + actions stay); **row 2 collapses to just Add Filters**. **Create** (`new-view-create`) appends the typed name to the saved-views list (`addView`, flagged `data-view-empty="1"`) + selects it (`selectView`) + re-wires its … (`Dropdown.initAll`); **×** cancels. A new (empty) view shows **only "Add Filters"** via `.filter-bar-v2--view-empty` (non-destructive — chips stay in the DOM). Existing views keep their default chips; `selectView` toggles `--view-empty` from the row's flag, so switching back restores them. |
| Save View | `.filter-bar-v2--save-view` | a filter added/amended — **mock**: clicking the "Add Filters" chip (FilterItem bubbles `filter-item:toggle` with `open:true`) reveals the `.filter-bar-v2__save` "Save view" CTA (Button `--primary --sm`), a sibling after `__chips` pinned to the right edge of row 2 (`margin-left:auto`; "Add Filters" stays the last chip in the flow). Clicking the CTA (`data-filter-action="save-view"`) is a mock "save" — drops the class + closes the Add Filters chip. **TODO(backend:Filters)** — real trigger is a persisted filter-set change. |

**Saved-view selection + rename** (`FilterBarV2.js` `wireViews` — same model as FilterBarV1:
double-click OR the **"Rename" item in the row's … menu** (`[data-filter-rename]`, beside Copy/Delete)
runs an inline `.filter-bar-v2__rename` overlay; capture-phase click takeover + 220ms single/double
disambiguation; the … is on every row incl. the selected one and is always-visible on touch via
`@media (hover: none)` in `Dropdown.css`; code-first, not in Figma — flag for designer) and the **right-aligned kebab panel**
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
| Add Filters | `.filter-item--empty.filter-bar-v2__add` | dashed; **last chip inside `__chips`** (in the flow, after the filter list) — matches Figma |
| Save view CTA | `.btn.btn--primary.btn--sm.filter-bar-v2__save` | composes Button (primary, sm); hidden until `.filter-bar-v2--save-view`, then pinned right of row 2 |
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
