# TableListing — Figma Notes

**Tier:** Pattern
**Built:** 2026-08-25 (Seating Planner module, wave 5)
**Files:** `TableListing.css`, `TableListing.html`, `TableListing.figma.ts`, `TableListing.figma-notes.md`
**Composes:** TableCard (one per table), Toggle (`toggle--xxs`), Input (`input--sm`, label-less)
**JS:** none

## Figma Node

- **File key:** `Lus07xi8pPXLN87sQIyrEt` (Affino AI — Design System)
- **Page:** Seat Planner (`3087:5050`)
- **Component set:** `3488:196339`

## Variant matrix (2 variants)

| Tier | Device | Node | Figma size | CSS |
|---|---|---|---|---|
| Pattern | Desktop | `3474:91854` | 1180×729 | `.table-listing` |
| Pattern | Mobile | `3488:196340` | 390×2019 | `@media (max-width: 767px)` |

Tier is single-valued (`Pattern`). There is no Type or State axis — this pattern is a container, and
all its state lives in the TableCards it holds.

## The grid: auto-fill, not four fixed columns

Figma specifies `repeat(4, minmax(0,1fr))` on desktop and `repeat(1, …)` on mobile, with 8px gaps.
Built as:

```css
grid-template-columns: repeat(auto-fill, minmax(var(--ai-size-4), 1fr));
```

**Why, and why it is not a divergence in practice.** TableCard carries a 240px `min-inline-size`, so
four fixed columns need roughly 984px; between 768px and ~1000px Figma's literal rule would overflow
its own container. auto-fill avoids that without inventing a breakpoint, and it reproduces Figma
exactly at both drawn widths. Measured:

| Grid width | Columns | Column width |
|---|---|---|
| **1148px** (Figma's desktop) | **4** | **281px** — exactly the cards Figma draws |
| 1149px | 4 | 281.25px |
| 900px | 3 | 294.7px |
| **358px** (Figma's mobile) | **1** | full width |

So the two widths Figma specifies render identically to Figma, and the range in between steps down
through 3 and 2 columns instead of breaking. The mobile single column falls out of the same rule, so
**the media query needs no grid rule at all**. Designer's call 2026-08-25.

## Device=Mobile deltas

| Property | Desktop | Mobile |
|---|---|---|
| root `padding` | `--ai-spacing-5` all round | `--ai-spacing-4` inline, `--ai-spacing-5` block |
| toolbar `flex-direction` | `row` | **`column`** — title+filter, then a full-width search |
| toolbar `padding-block-end` | `--ai-spacing-3` (8px) | `--ai-spacing-0` |
| title `font-size` | `--ai-font-fixed-md` (18px) | `--ai-font-fixed-sm` (16px) |
| `__divider` | present | **`display: none`** |
| `__search` | `--ai-size-6` (320px) | `100%` |
| grid columns | 4 | 1 — from auto-fill, no rule needed |

The "Only free seats" label is **12px at both** breakpoints — worth stating because it would be easy
to assume it steps down with the title.

## Toolbar layout

Desktop is one row: title | filter | divider | search. Figma splits the first two as equal `flex-1`
columns (396px each in a 1148px toolbar), with the divider `shrink-0` and the search a fixed 320px.

Nesting title + filter inside `__toolbar-main` (itself `flex: 1 0 0`) reproduces those widths exactly
— 396 + 12 + 396 = 804, then + 12 + 0 + 12 + 320 = 1148 — **and** gives the mobile two-row layout for
free, since only `__toolbar` needs to flip to a column. Verified: the parts sum to the toolbar width
at every desktop size tested.

## Token mapping

| Figma | CSS | Role |
|---|---|---|
| `--ai-surface-primary` | root `background-color` | |
| `--ai-border-secondary` | root `border-color`, divider `background-color` | |
| `--ai-radius-lg` | root `border-radius` (16px) | |
| `--ai-spacing-5` | root `padding` (desktop), mobile `padding-block`, divider `block-size` (16px) | |
| `--ai-spacing-4` | toolbar `gap`, mobile root `padding-inline` (12px) | |
| `--ai-spacing-3` | root `gap`, toolbar `padding-block-end`, filter `gap`, grid `gap` (8px) | |
| `--ai-spacing-0` | mobile toolbar `padding-block-end` | |
| `--ai-size-6` | search `inline-size` (320px) | |
| `--ai-size-4` | grid column `minmax` floor (240px) | TableCard's own min-width |
| `--ai-font-title` | title, filter label | |
| `--ai-font-fixed-md` / `-sm` | title, desktop / mobile | |
| `--ai-font-fixed-2xs` | filter label (12px) | unbound in Figma — see below |
| `--ai-font-bold` / `-medium` | title / filter label | |
| `--ai-text-primary` / `--ai-text-contrast` | title / filter label | |

## Token gaps and decisions

| Figma | Decision |
|---|---|
| root `w-[1180px]` desktop / `w-[390px]` mobile | **Fluid `inline-size: 100%`** (designer, 2026-08-25). Both unbound and matching no token — they are just the frames Figma drew. This is the main content area, not a fixed rail, so the same call already taken for AttendeeCard and TableCard applies; the grid does the responsive work. |
| filter label `text-[12px]`, unbound | **`--ai-font-fixed-2xs`**, which is exactly 12px, so binding it is visually a no-op. Same treatment as TableCard's company size. **Worth binding in Figma.** |
| divider `line` node stroke, invisible in design context | **`--ai-border-secondary`**, resolved by `get_variable_defs` on the node itself (`3474:91537`). Not a gap — just hidden behind an SVG asset. |
| `--ai-font-fixed-xxs` (13px) and `--ai-font-fixed-xs` (14px) in the set's variable list | **Not gaps.** Neither is used by anything in this pattern's own design context — phantoms of the same kind seen on TableDetail and Unassigned, likely bound on hidden layers or inside TableCard. |

## Two child components had to change

Both were **Case A** — the variant or behaviour already existed in Figma, or had been worked around
repeatedly; the components were simply behind.

### Toggle gained a `xxs` size

The toolbar toggle is `Toggle` at `size="xxs"` — **a real variant in Toggle's Figma set**
(`2025:1081` Initial, `3435:28284` Active), which our component did not have. Added
`.toggle--xxs`: 24×12 track (`--ai-spacing-6` × `--ai-spacing-4`), 8×8 knob (`--ai-spacing-3`), all
tokens. Verified 24×12 / 8×8, knob at 2.5px → 13.5px, track `--ai-border-secondary` →
`--ai-surface-brand`.

Figma defines **only Initial and Active** for this size — no Disabled — so no Disabled row was added
to Toggle's demo. The generic `--disabled` still composes if a consumer ever needs it.

One 0.5px difference: Figma puts the active knob at `left: 14px` (a 2px right inset against a 2.5px
left inset). Toggle's own convention across every other size is a symmetric
`calc(100% - knob - 2.5px)`, which yields 13.5px. Internal consistency was preferred over matching
an asymmetry that reads as a Figma nudge.

### Input lost its 192px cap

The search is 320px, but `.input--sm .input__wrap` carried `max-width: var(--ai-size-3)` (192px), so
an `input--sm` could never fill its container. **Removed from Input entirely** at the designer's
direction, rather than overridden again — a *size* modifier should govern height, padding and
typography, not cap width, and it had already been worked around in three places:

- `Datatables.css` lifted it in a media query, with a comment naming the cap
- `ControlScreen.html` used an inline `style="max-width: none"` (that one targets
  `.datatables__search`'s own 18rem cap, so it stays)
- `Unassigned.css` needed a scoped override the day before

**Proved safe before removing it:** every `input--sm` wrap in Datatables and ControlScreen was
measured at 1400px and 500px before and after — **byte-identical** (288/288/266/266 and 0/297). The
cap was blocking new consumers without shaping any existing one. The two now-redundant workarounds
(Datatables' media-query rule, Unassigned's override) were removed and their comments corrected.

## Interaction model

- **Presentational only, no JS.** The free-seats toggle and the search both filter the grid, which is
  the parent module's job — this pattern renders what it is given.
- The toggle is a real `<button role="switch" aria-checked>` with the label wired via
  `aria-labelledby`, and the label is a `<label for>` so clicking the text also hits the control.
- The search is `<input type="search">` with an `aria-label`, since there is no visible label.
- TableCards bring their own selection contract — the parent toggles `--selected` on them.

## Notes

- **A hidden `View Actions` frame** sits at the end of the toolbar (`3474:91539`, `hidden="true"`)
  holding two 32×32 Buttons — presumably a grid/list view switch. **Not built**, because it is hidden.
  Worth confirming whether it is coming, since it would change the toolbar's right-hand group.
- **Sponsor row and tier pill are `hidden="true"`** on every TableCard instance here, so the cards
  render with just title, bar, legend and footer. That is TableCard's existing optional markup — no
  change needed to it.
- **`get_design_context` on either variant returns ~68KB** and expands all thirteen TableCards.
  Fetch the toolbar frame (`3474:91531`) on its own, or extract the shell lines with a script.
- **The published Code Connect for Input is stale here too** — the snippet emits
  `class="input__field"` where the class is `input__control`. Same finding as Unassigned; a
  re-publish fixes it.
- **The registry cites node `2025:1080` for both Toggle and ToggleDS.** That node is Toggle's set, so
  ToggleDS's row points at the wrong component. Worth correcting.
- **No hover, focus, pressed or disabled variants** for the pattern itself, and no dark-mode variant.
