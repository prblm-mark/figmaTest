# FilterBarV1 — Figma Notes

## Figma Node

- **File:** `Lus07xi8pPXLN87sQIyrEt` (Affino AI Design System)
- **Component set:** `2975:2303` ("Filters V1")
- **Tier:** `Pattern` → `src/patterns/FilterBarV1/`
- URL: https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2975-2303

A/B variant **1** of the filter toolbar (see [FilterBarV2](../FilterBarV2/) for variant 2).
Single-row bar: a saved-views control + a wrapping row of filter chips, with a search icon and
kebab on the right.

## Variant matrix (15 = 8 Type × Desktop/Mobile, + Dropdowns)

`Type` is a set of **scenarios/states of one toolbar**, not separate components — so they're
modelled as JS modes + composed-component states, not 15 CSS variants.

| Node ID (Desktop / Mobile) | Type | How it's represented |
|---|---|---|
| 2975:2302 / 2975:2301 | Default | base markup (empty/dashed chips) |
| 2975:2292 / 2975:2298 | Filter active | a chip carries `.filter-item--selected` |
| 2975:2291 / 2975:2297 | View Dropdown | saved-views `.dropdown` is `.is-open` |
| 2975:2293 / 2975:2295 | New View | root `.filter-bar-v1--new-view` (Input + Create) |
| 2975:2290 / 2975:2299 | Wrapping | more chips → `.filter-bar-v1__chips` flex-wraps |
| 2975:2289 / 2975:2294 | Search | root `.filter-bar-v1--search` (back + full-width Input) |
| 2975:2300 / 2975:2296 | Actions | kebab `.dropdown` is `.is-open` (Export / Generate Shipping Labels) |
| — / 2975:2288 | Dropdowns (mobile) | the saved-views/actions menus as rendered on mobile |

Desktop fetched in full: Default, New View, Search; Mobile Default. The remaining are
state/content permutations of those structures (verified against the parent-frame screenshot).

## Layout

- **Desktop:** single row `[views | chips ........ search-icon  kebab]`. Shell gap `--ai-spacing-5`
  (16px) between the main group and the actions; the chip group sits behind a left divider
  (`border-left` + `padding-left: --ai-spacing-3`).
- **Mobile (≤767px):** `__main` becomes `display: contents` so views + chips promote to the
  outer flex; views + actions share row 1 (actions `margin-left: auto`), chips wrap to row 2
  (`flex-basis: 100%`). Outer gap drops to `--ai-spacing-4` (12px) per Figma mobile.

## Modes (JS — FilterBarV1.js)

| Mode | Class | Entered by | Effect |
|---|---|---|---|
| Search | `.filter-bar-v1--search` | 🔍 (`data-filter-action="search"`) | back-arrow + full-width search Input replace the bar; ← exits |
| New View | `.filter-bar-v1--new-view` | "+ New view" in saved-views menu (`data-filter-action="new-view"`) | views trigger → "New view" Input + Create Button; chips collapse to only the `.filter-bar-v1__add` ("Add Filters") chip (matches Figma New View); × / Create exit |

The saved-views dropdown, kebab actions menu, per-row Copy/Delete mini-menu, and chip
open/clear are owned by the **Dropdown** and **FilterItem** components (their own JS auto-binds).

**Saved-view selection + rename** is wired by `FilterBarV1.js` (`wireViews`):
- **Single click** a `menuitemradio` row → select: updates the trigger's
  `.filter-bar-v1__views-label`, flips `aria-checked`, moves the rendered tick
  (`.dropdown-item__check`), and closes the menu.
- **Double click** a row name → inline rename: overlays a `.filter-bar-v1__rename` `<input>` on the
  row (Enter / blur commits, Escape cancels; committing the current view also updates the trigger).
- **"Rename" in the row's … menu** (`[data-filter-rename]`, alongside Copy / Delete) is the
  touch-friendly equivalent — it runs the same inline rename. The … menu is now present on **every**
  row including the selected one, so any view can be renamed/copied/deleted. (Double-click stays as
  a desktop shortcut.)

Mobile/touch: the per-row … is hover-revealed on desktop but **always visible on touch**
(`@media (hover: none)` in `Dropdown.css`) so Rename/Copy/Delete are reachable without hover.

Because single-click on a `.dropdown-item` normally closes the panel (Dropdown.js), row clicks are
intercepted in the **capture phase** with `stopPropagation`, and a ~220ms timer disambiguates
single vs double click. The rename `<input>` is appended to the `<li>` (it can't nest inside the
row's `<button>`) with the `<li>` made `position: relative` via `.filter-bar-v1__li--renaming`.
**This rename interaction is code-first — not in the Figma spec; flag for designer review.**

Two structural rules this relies on:
- **`.filter-bar-v1__search` is a sibling of `__main`, not a child** — search mode hides `__main`
  (`display:none`), so a search field nested inside it would be hidden too. It lives as a direct
  child of the root.
- **The kebab menu's `.dropdown__panel` is right-aligned** (`left:auto; right:0`) since the kebab
  sits at the far-right edge; the default `left:0` would overflow.

## CSS Class Mapping

| Element | Class | Notes |
|---|---|---|
| Root | `.filter-bar-v1` | bg surface-primary, border-secondary, radius-md, pad 12/16/12/12, gap 16 |
| Main group | `.filter-bar-v1__main` | flex-1, gap 8; `display: contents` on mobile |
| Saved-views control | `.dropdown.filter-bar-v1__views` | composes Dropdown (filter-views panel) |
| Views trigger | `.dropdown__trigger.filter-bar-v1__views-trigger` | field-styled: w `--ai-size-3` (192), h `--ai-spacing-8` (40), px `--ai-spacing-5`, 14px **medium** |
| Chips group | `.filter-bar-v1__chips` | flex-wrap, gap 8, left divider; chips are FilterItem **`--empty`** (dashed) in V1 |
| Actions | `.filter-bar-v1__actions` | search icon-btn + kebab `.dropdown` |
| Icon button | `.filter-bar-v1__icon-btn` | bare 16px icon, `--ai-icon-contrast` |
| Search field | `.filter-bar-v1__search` | composes Input (leading search icon) |
| New-view field | `.filter-bar-v1__new-view` | composes Input (value + `.input__clear`) |
| Create | `.btn.btn--primary.filter-bar-v1__create` | composes Button |
| Back | `.filter-bar-v1__back` | search-mode only, `arrow-left` |

## Token Mapping

| Figma | Token | Role |
|---|---|---|
| surface/primary | `--ai-surface-primary` | bar + field bg |
| border/secondary | `--ai-border-secondary` | bar border, field border, chip divider |
| spacing/5 (16) | `--ai-spacing-5` | bar gap, field px, bar pr |
| spacing/4 (12) | `--ai-spacing-4` | bar py, bar pl, mobile gap |
| spacing/3 (8) | `--ai-spacing-3` | main/chips/actions gap, chip-group pl |
| spacing/8 (40) | `--ai-spacing-8` | views/field height |
| size/3 (192) | `--ai-size-3` | views trigger + new-view width |
| radius/md (8) | `--ai-radius-md` | bar + fields |
| font/body, fixed-xs (14), medium, leading-md (24) | `--ai-font-body` / `--ai-font-fixed-xs` / `--ai-font-medium` / `--ai-leading-md` | views trigger text |
| icon/contrast | `--ai-icon-contrast` | search / kebab / chevron / back icons |
| icon-size/sm (16) | `--ai-icon-size-sm` | those icons |

## Token Gaps

None for the toolbar shell. **One Figma artifact documented, not reproduced:** the "Add Filters"
chip in some variants is a detached **"MinimalBadge"** layer whose label uses the raw hex
`#364153` (Gray/700, no `--ai-*` token). The DS-correct element is a **FilterItem in the Empty
state** (label `--ai-text-primary`), which is what this build composes — the raw hex is not
carried over. Flagged for the designer to replace the detached layer with a proper Filter Item
instance.

## Notes

- **Views trigger is a Dropdown, not a Select.** Figma renders it as a field (`data-name="Input"`),
  but the menu is the rich saved-views panel (label + radio rows + per-row Copy/Delete mini-menu +
  "New view"), which only the **Dropdown** "filter-views" variant provides. So the trigger is a
  field-styled `.dropdown__trigger` and the panel reuses `.dropdown__panel--filter-views`.
- **Search field full-width.** Figma reports the search Input at the component's base `w-192`, but
  the screenshot (and the search scenario's intent) is a full-width field — built as `flex: 1`.
- **No Figma hover/focus** for the bare icons or the field trigger; `:focus-visible` rings added
  for WCAG 2.1 AA only.
- **Width is consumer-controlled** (fills its container). Figma's 960px frame is `--ai-size-12`
  (a canvas width, not a component constraint).

## Backend handover

`TODO(backend:Filters)` — saved-views list, value pickers, search querying, Create (persist a new
view), Export, and the kebab actions are all mock. See `HANDOVER.md` → Surface: Filters.

## Dependencies

- **Dropdown** (`src/components/Dropdown/`) — saved-views (`--filter-views`) panel + kebab actions menu; brings DropdownItem.
- **FilterItem** (`src/components/FilterItem/`) — the chips (V1 uses `--empty`).
- **Input** (`src/components/Input/`) — search + new-view fields.
- **Button** (`src/components/Button/`) — Create (`--primary`), and the tertiary buttons inside the dropdowns.
- Lucide icons: `chevron-down`, `search`, `ellipsis-vertical`, `arrow-left`, `plus`, `x`, `check`, `ellipsis`, `copy`, `trash-2`.
