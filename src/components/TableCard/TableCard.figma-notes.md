# TableCard — Figma Notes

**Tier:** Component
**Built:** 2026-08-25 (Seating Planner module, wave 3)
**Files:** `TableCard.css`, `TableCard.html`, `TableCard.figma.ts`, `TableCard.figma-notes.md`
**Composes:** TableType (`.table-type`) — tier pill; FullBadge (`.full-badge`) — at-capacity pill;
Button (`btn btn--secondary btn--icon btn--2xs`) — edit + delete
**JS:** none

## Figma Node

- **File key:** `Lus07xi8pPXLN87sQIyrEt` (Affino AI — Design System)
- **Page:** Seat Planner (`3087:5050`)
- **Component set:** `3470:85483`

## Variant matrix (12 variants)

Axes are **Tier × State × Type × Device**. Tier is single-valued (`Component`). Device is a media
query. **Type produces no CSS at all** — see below. So 12 Figma variants collapse to **one** CSS
class plus a media query.

| Type | State | Device | Node | CSS |
|---|---|---|---|---|
| Empty | Default | Desktop | `3470:85482` | `.table-card` |
| Empty | Selected | Desktop | `3470:85481` | `+ .table-card--selected` |
| Populated | Default | Desktop | `3470:85480` | `.table-card` |
| Populated | Selected | Desktop | `3470:85479` | `+ .table-card--selected` |
| Full | Default | Desktop | `3472:85601` | `.table-card` |
| Full | Selected | Desktop | `3472:85640` | `+ .table-card--selected` |
| Empty | Default | Mobile | `3484:188877` | `@media (max-width: 767px)` |
| Empty | Selected | Mobile | `3484:188900` | ↑ + `--selected` |
| Populated | Default | Mobile | `3484:188923` | ↑ |
| Populated | Selected | Mobile | `3484:189007` | ↑ + `--selected` |
| Full | Default | Mobile | `3484:188962` | ↑ |
| Full | Selected | Mobile | `3484:189046` | ↑ + `--selected` |

Desktop: Empty 289×173, Populated/Full 289×186. Mobile: 289×163 / 289×176.

Rendered heights are **177 / 190**, i.e. +4. Two sources: the card's own 1px border top and bottom
(Figma strokes are inside-aligned and don't add to frame size), and the two rules. Figma draws those
as zero-height `line` nodes with the stroke outside the box; an `<hr>` with a 1px border is genuinely
1px tall. Cosmetic arithmetic in an auto-height card, not a bug.

### The whole Type axis is data, not CSS

Empty, Populated and Full differ **only** in:

- how many bar segments exist (Empty has one, the others five),
- how many legend rows exist (Empty one, the others two after wrapping),
- whether the FullBadge is present.

All three are markup the caller supplies. Nothing branches on Type, so there are deliberately **no
`--empty` / `--populated` / `--full` modifiers** — empty modifier classes would be dead code. Only
State earns CSS. The 13px height difference between Empty and Populated is just the second legend
row (11px + the 2px row gap).

### The bar in Figma contradicts its own legend

Figma draws the segments at fixed widths — 62 / 31 / 31 / 62 with the empty one `flex-1` — against a
legend reading Attendee 2, VIP 1, Speaker 1, Sponsor 2, Empty 4 of a 10-seat table. Those widths put
6 of 10 seated at **73% of the track**, not 60%. **Never port them.**

Each segment instead carries its seat count in a `--seg` custom property and divides the track with
`flex-grow` on a zero `flex-basis`, so the split is exact and the segments always cover the track
(which is why the track needs no background of its own — Figma gives it none). Verified: a
2/1/1/2/4 breakdown renders at exactly 20 / 10 / 10 / 20 / 40 %.

Two further sample-data contradictions in Figma, worth fixing there but not ported:

- **Type=Empty** shows `Empty (4)` beside `0 / 10 seated`. Should be `Empty (10)`. The demo uses 10,
  because shipping a demo that visibly contradicts itself is worse than deviating from broken
  sample text.
- **Type=Full** shows `10 / 10 seated` and the FULL badge, but keeps Populated's legend and its grey
  empty segment. The demo uses a breakdown that actually sums to 10 with nothing empty.

## Interaction model

Confirmed with the designer 2026-08-25 — the same contract as RoomCard and AttendeeCard:

- **Presentational only.** The parent module owns selection and toggles `.table-card--selected`.
  Selecting a table is what opens Table Detail.
- **The whole card is the select trigger.** `.table-card__select` is a real `<button>` wrapping the
  table name, with an `::after` stretched over the card. `.table-card__actions` is raised on
  `z-index: 1` so edit and delete stay independently clickable. Verified by hit-testing: the card's
  lower centre resolves to `.table-card__select`, the edit button's centre to its own icon.
  The tier pill needs no raising — it is not interactive, and the overlay is transparent.
- **Focus rings the card, not the name**, via `.table-card:has(.table-card__select:focus-visible)`.

## State deltas

| | Background | Border |
|---|---|---|
| Default | `--ai-surface-primary` | 1px solid `--ai-border-secondary` |
| Selected | `--ai-surface-minimal` | 1px solid `--ai-border-brand` |

Read from the Selected variant's design context, **not inferred** — `get_variable_defs` on
`3470:85479` returns *both* `--ai-surface-primary` and `--ai-surface-minimal`, so the variable list
alone could not settle which one the card takes.

## Device=Mobile deltas

Only two, verified against `3484:188923`:

| Property | Desktop | Mobile |
|---|---|---|
| card `padding` | `--ai-spacing-5` (16px) | `--ai-spacing-4` (12px) |
| name `font-size` | `--ai-font-fixed-sm` (16px) | `--ai-font-fixed-xs` (14px) |

Bar, legend, swatches, badge, buttons and sponsor row are identical between breakpoints. Note the
`min-inline-size` stays `--ai-size-4` (240px) at both — **unlike RoomCard**, whose min-width steps
280 → 240.

## Token mapping

| Figma | CSS | Role |
|---|---|---|
| `--ai-surface-primary` / `--ai-surface-minimal` | `background-color` | per state |
| `--ai-border-secondary` / `--ai-border-brand` | `border-color` | per state |
| `--ai-border-secondary` | the two rules | resolved via `get_variable_defs` on `3470:85258` |
| `--ai-radius-lg` | card `border-radius` (16px) | |
| `light/shadow-xxs` → `--ai-shadow-xxs` | card `box-shadow` | |
| `--ai-spacing-5` / `--ai-spacing-4` | card `padding` desktop / mobile | |
| `--ai-spacing-4` | card `gap` (12px) | |
| `--ai-size-4` | card `min-inline-size` (240px, both breakpoints) | |
| `--ai-spacing-0` | title-group `gap` (0) | |
| `--ai-font-fixed-sm` / `-xs` | table name, desktop / mobile | |
| `--ai-spacing-2` | sponsor row `gap` + `padding-block-start` (6px) | |
| `--ai-icon-size-sm` | sponsor icon (16px) | via `get_variable_defs` on `3476:106260` |
| `--ai-icon-contrast` | sponsor icon colour | same fetch |
| `--ai-font-fixed-2xs` | sponsor name, seated count (12px) | |
| `--ai-leading-xs` | sponsor name `line-height` | |
| `--ai-text-primary` / `--ai-text-contrast` / `--ai-text-secondary` | name / sponsor + legend / count | |
| `--ai-spacing-3` | bar `block-size` (8px), viz `gap`, legend `column-gap`, footer count `gap` | |
| `--ai-spacing-px` | bar segment `gap` (1px) | |
| `--ai-radius-sm` | bar `border-radius` (4px) | |
| `--ai-spacing-0-5` | legend `row-gap` (2px) | |
| `--ai-radius-xs` | legend swatch `border-radius` (2px) | **token added for this build** |
| `--sp-attendee` / `--sp-vip` / `--sp-speaker` / `--sp-sponsor` | bar segments + legend swatches | |
| `--ai-surface-contrast` | empty segment + swatch | |
| `--ai-font-fixed-6xs` | legend text (9px) | |
| `--ai-font-bold` / `-medium` / `-regular` | name / sponsor + count / legend | |
| `--ai-spacing-1` | legend-item `gap`, actions `gap` (4px) | |

## Token gaps and decisions

Resolved with the designer 2026-08-25 rather than invented.

| Figma | Decision |
|---|---|
| `--ai-font-fixed-6xs` (a **font-size** token) bound as the 9px gap between bar and legend, **and** as the legend's column gap | **Snapped to `--ai-spacing-3`** (8px). A 1px change that stops a type token driving layout. |
| legend swatch `border-radius: 2px`, unbound | **New token `--ai-radius-xs`** (2px). `--ai-radius-sm` (4px) would visibly round an 8px square. Hand-added to `FigmaTokens/{Scale/Scale,Light,Dark}.tokens.json` at the designer's request pending a re-export — id `VariableID:PENDING-FIGMA-EXPORT-radius-xs`, so it is greppable. |
| card `width: 289px` | **Dropped.** The card is fluid and fills its grid cell. 289px has no token; the bound `min-width` does (`--ai-size-4`). |
| sponsor row `height: 22px` | **Dropped as derivable** — it is exactly the 16px icon plus the 6px `padding-top`, so the content defines it. |
| `line` node stroke, invisible in design context | **`--ai-border-secondary`**, resolved by calling `get_variable_defs` on the node itself (`3470:85258`). Not a gap — just hidden behind an SVG asset. |

## Three places the CSS leads Figma

| Element | Property | Figma | CSS |
|---|---|---|---|
| `__header` | `gap` | **not set** | **not set** — left faithful, but see below |
| `__select` (table name) | truncation | `white-space: nowrap` only | **+ `overflow: hidden`, `text-overflow: ellipsis`** |
| `__sponsor-name` | truncation | `white-space: nowrap` only | **+ `overflow: hidden`, `text-overflow: ellipsis`** |

**Neither name truncates in Figma.** With `nowrap` and no `overflow`, a long table name overflows its
flex-1 track and shoves the tier pill out of the card; a long sponsor name does the same. Ellipsis
truncation was added to both. Unlike RoomCard — whose Figma title *does* carry
`overflow-hidden text-ellipsis` — this set omits it, which reads as an oversight rather than intent.

**The header gap was left at Figma's 0**, deliberately, even though RoomCard's equivalent row was
given `--ai-spacing-3` for exactly the clearance this lacks: with the pill `shrink-0` hard against a
flex-1 title, a truncated name ends flush against it. Built faithful and **flagged for a decision**
rather than quietly matching RoomCard — it is a one-line change either way.

## A Figma property inconsistency worth fixing

The three variants expose three different property sets for what is one component:

| Variant | Properties |
|---|---|
| Populated / Default / Desktop (`3470:85480`) | `Show Sponsor` only — and it gates **both** the sponsor row **and** the tier pill |
| Populated / Selected / Desktop (`3470:85479`) | `Show Sponsor`, `Show Table Type`, `Table Name`, plus a `Table Type` slot |
| Populated / Default / Mobile (`3484:188923`) | `Show Sponsor`, `Table Name` |

The Default variant tying the tier pill to `Show Sponsor` is almost certainly an error — a table with
no sponsor should still show its tier. The Selected variant models it correctly with a separate
`Show Table Type`. **Built the correct model**: the sponsor row and the tier pill are independently
optional. `Table Name` also exists on some variants and not others, which is why
`TableCard.figma.ts` does **not** use `figma.string` for it — binding a property that only some
variants carry is how the TableType Code Connect went wrong in wave 1.

## Cross-component findings

- **TableType is unchanged, by decision.** Figma's instance here renders at `--ai-font-fixed-6xs`
  (9px) with `--ai-tracking-6`, while the component is `--ai-font-fixed-5xs` (10px) with
  `--ai-tracking-7` and `--ai-font-bold`. The designer's call 2026-08-25 was that **the component is
  the source of truth** and Figma should follow, so nothing was changed. Its colour model was
  verified correct in passing: Figma's `#b2d5e2` border, `#005777` text and white-80%-over-`#00749e`
  fill are exactly what TableType's three `color-mix()` formulas produce.
- **`--sp-host` is missing from Figma's legend.** The collection defines it and AttendeeCard uses it,
  but Table Card's Figma legend covers only Attendee / VIP / Speaker / Sponsor plus Empty. **Not
  added here** — inventing a variant with no Figma counterpart is how drift starts. But a table
  seating a host currently has no colour for them. Since the colour comes from one custom property,
  adding `--host` later is a single line. **Worth a designer decision.**
- **FullBadge was extracted** rather than scoped a second time, because TableCard draws a copy
  identical to RoomCard's. See `FullBadge.figma-notes.md` — including that Figma still has no
  component for it.

## Accessibility

- **The bar is `aria-hidden`.** The legend states every role and count as text immediately below it,
  and the footer states the total — a bare stack of coloured divs adds nothing but noise.
- **The action buttons are 24×24**, under the 44×44 minimum in CLAUDE.md §9. Built as drawn, matching
  the AttendeeCard and RoomCard decisions. The card's own select target is the full card.
- The FullBadge's white-on-success contrast (3.16:1) is deliberately open — see its notes.
- The table name is an `<h3>`; the demo nests it under `<h2>` section headings.

## Notes

- **`get_design_context` returns the actions frame as an empty `<div>`** on every variant — the two
  Button instances are flattened out. Only `get_metadata` on the frame reveals them. The same happened
  on RoomCard; don't read that empty div as "no actions".
- **Design context under-reports bound tokens.** The seated count renders as raw `text-[12px]` and the
  min-width as `min-w-[240px]`, but `get_variable_defs` shows both bound. Always cross-check before
  flagging a gap.
- **The bar segments are named `Bar-Staff` and `Bar-Guest`** in Figma while the legend beside them says
  "Attendee" and "Sponsor". The legend text is what users see, so the CSS uses `--attendee` and
  `--sponsor`. Worth renaming the Figma layers.
- **No hover, focus, pressed or disabled variants** exist in the set. The action buttons get Button's
  own states; nothing else was invented.
- **No dark-mode variant.** Every colour is a theme-aware `--ai-*` token except the `--sp-*` role
  colours, which are **not** theme-aware — so the bar and legend will not adapt under
  `[data-theme="dark"]`. Not designed or reviewed.
