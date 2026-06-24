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
| Row | `.filter-bar__row` (+`--top`) | flex, gap 16, pad 12/16; `--top` adds bottom border |
| Lead (row 1) | `.filter-bar__lead` | flex-1, gap 8 — holds views / new-view / search |
| Views control | `.dropdown.filter-bar__views` | Dropdown filter-views panel; trigger field is **regular** weight |
| Actions | `.filter-bar__actions` | row-1 group (Figma "Frame 230"), 8px gap: **Export** + persistent search field (desktop) / search icon-btn (mobile) + kebab `.dropdown` |
| Export | `.btn.btn--secondary.filter-bar__export` | first child of `.filter-bar__actions`; Button + `download` icon; hidden on mobile |
| Search field (desktop) | `.input.filter-bar__search-bar` | persistent 192px Input; desktop only — replaced by the icon + takeover on mobile |
| Chips (row 2) | `.filter-bar__chips` | flex-wrap, gap 8; chips are FilterItem **default (solid)** / `--selected`, **all `--rounded`** (pill `--ai-radius-full`, per user direction) |
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

## Notes

- Composition: Dropdown-as-views-trigger, Input search, no invented hover/focus (WCAG `:focus-visible` only).
- Export icon: Figma "Icon/24px/Export" (tray + down arrow) → Lucide **`download`**.

## Backend handover

`TODO(backend:Filters)` — see `HANDOVER.md` → Surface: Filters (shared with FilterItem).

## Dependencies

Dropdown (+ DropdownItem), FilterItem, Input, Button. Lucide: `chevron-down`, `download`, `search`,
`ellipsis-vertical`, `arrow-left`, `plus`, `x`, `check`, `ellipsis`, `copy`, `trash-2`.
