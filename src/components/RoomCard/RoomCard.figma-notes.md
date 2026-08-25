# RoomCard — Figma Notes

**Tier:** Component
**Built:** 2026-08-25 (Seating Planner module, wave 2b)
**Files:** `RoomCard.css`, `RoomCard.html`, `RoomCard.figma.ts`, `RoomCard.figma-notes.md`
**Composes:** Button (`btn btn--secondary btn--icon btn--2xs`) — the edit + delete actions
**JS:** none

## Figma Node

- **File key:** `Lus07xi8pPXLN87sQIyrEt` (Affino AI — Design System)
- **Page:** Seat Planner (`3087:5050`)
- **Component set:** `3470:84951`

## Variant matrix (12 variants)

Axes are **Tier × Type × State × Device**. Tier is single-valued (`Component`) and produces no CSS.
Device is a media query, not a modifier — so the 12 Figma variants collapse to 4 CSS classes.

| Type | State | Device | Node | CSS |
|---|---|---|---|---|
| Default | Default | Desktop | `3470:84950` | `.room-card` |
| Default | Selected | Desktop | `3474:90673` | `+ .room-card--selected` |
| Seats Assigned | Default | Desktop | `3470:84949` | `.room-card` (data only — see below) |
| Seats Assigned | Selected | Desktop | `3470:84948` | `+ .room-card--selected` |
| Full | Default | Desktop | `3470:84952` | `+ .room-card--full` |
| Full | Selected | Desktop | `3474:90688` | `+ .room-card--full.room-card--selected` |
| Default | Default | Mobile | `3484:186665` | `@media (max-width: 767px)` |
| Default | Selected | Mobile | `3484:186691` | ↑ + `--selected` |
| Seats Assigned | Default | Mobile | `3484:186701` | ↑ |
| Seats Assigned | Selected | Mobile | `3484:186712` | ↑ + `--selected` |
| Full | Default | Mobile | `3484:186649` | ↑ + `--full` |
| Full | Selected | Mobile | `3484:186675` | ↑ + `--full` + `--selected` |

Desktop is 290×93 as drawn, mobile 291.5×85. Rendered heights are 95 / 87 — Figma strokes are
inside-aligned and don't add to the frame size, whereas a `box-sizing: border-box` element counts
its 1px border. The card is auto-height in a list, so this is cosmetic arithmetic, not a bug.

### Type=Default and Type=Seats Assigned are the same CSS

They differ **only in data**: `0/148` vs `124/148` (so 0% vs 84% bar) and `148 seats free` vs
`24 seats free`. Both labels are brand-coloured; both bars are brand-filled. No CSS branches on
this, so there is deliberately no `.room-card--seats-assigned` — an empty modifier would be dead
code. `Full` is the only Type that earns a class.

### The Seats Assigned bar in Figma is drawn, not computed

Figma sets the fill to a fixed `w-[158px]`, which is ~62% of the track — while the label beside it
says `124/148`, i.e. 84%. The two disagree in Figma. **Never port the 158px.** The fill is driven
by `--room-card-progress`, which the parent computes as `seatsSeated / seatsCapacity`.

## Interaction model

Confirmed with the designer 2026-08-25:

- **Presentational only.** The parent module owns selection and toggles `.room-card--selected`.
  Single-select coordination (only one room active) belongs to whoever renders the list, not here.
- **The whole card is the select trigger.** `.room-card__select` is a real `<button>` wrapping the
  room name, with an `::after` stretched over the card via `position: absolute; inset: 0`.
  `.room-card__actions` is raised on `z-index: 1` so edit and delete stay independently clickable
  inside the larger hit area. Verified by hit-testing: the card's bottom-centre resolves to
  `.room-card__select`, the edit button's centre resolves to its own icon.
- **Focus is drawn on the card, not the name.** A `:focus-visible` ring on the button alone would
  outline just the text run while the clickable area is the whole card, so
  `.room-card:has(.room-card__select:focus-visible)` moves the ring out to the card and the
  button's own outline is suppressed.
- Edit and delete are real `<button>`s with `aria-label`s. Design context conveys visual structure
  only, never interaction.

## State deltas

| | Background | Border |
|---|---|---|
| Default | `--ai-surface-primary` | 1px solid `--ai-border-secondary` |
| Selected | `--ai-surface-minimal` | 1px solid `--ai-border-brand` |

Verified identical on both Type=Default (`3474:90673`) and Type=Full (`3474:90688`), so Selected
composes as one modifier rather than branching per type.

## Device=Mobile deltas

Only four things change. Verified against the mobile Full variant (`3484:186649`) that buttons
(24×24), badge (45×15), check (7×7) and bar height (6px) all stay put.

| Property | Desktop | Mobile |
|---|---|---|
| card `padding` | `--ai-spacing-5` (16px) | `--ai-spacing-4` (12px) |
| card `min-inline-size` | `--ai-size-5` (280px) | `--ai-size-4` (240px) |
| name `font-size` | `--ai-font-fixed-sm` (16px) | `--ai-font-fixed-xs` (14px) |
| counts text | `12 tables · 0/148 seated` | `12 tables · 0/148` |

The counts change is **content**, which CSS can't do cleanly. `" seated"` is wrapped in
`.room-card__seated` and clipped with `position: absolute; clip-path: inset(50%)` below 768px —
visually gone, but still in the accessibility tree, so mobile screen-reader users hear the full
sentence. `display: none` would have dropped it outright. Verified: the span measures 1px wide
while `textContent` still reads `"12 tables · 0/148 seated"`.

## Token mapping

| Figma | CSS | Role |
|---|---|---|
| `--ai-surface-primary` / `--ai-surface-minimal` | `background-color` | per state |
| `--ai-border-secondary` / `--ai-border-brand` | `border-color` | per state |
| `--ai-radius-lg` | card `border-radius` (16px) | |
| `light/shadow-xxs` → `--ai-shadow-xxs` | card `box-shadow` | |
| `--ai-spacing-5` / `--ai-spacing-4` | card `padding` desktop / mobile | |
| `--ai-spacing-3` | card `gap`, meta `gap` | |
| `--ai-spacing-1` | actions `gap`, badge `gap` | |
| `--ai-size-5` / `--ai-size-4` | card `min-inline-size` desktop / mobile | |
| `--ai-font-title` | every text node | |
| `--ai-font-fixed-sm` / `-xs` | name, desktop / mobile | |
| `--ai-font-fixed-2xs` | counts (12px) | |
| `--ai-font-fixed-4xs` | seats free (11px) | |
| `--ai-font-fixed-6xs` | FULL badge label (9px) | **token added for this build** |
| `--ai-font-bold` / `-semibold` / `-regular` | name+badge / seats free / counts | |
| `--ai-text-primary` / `--ai-text-contrast` | name / counts | |
| `--ai-text-brand` | seats free | see below |
| `--ai-text-invert` | FULL badge label | was the `Grey/0` primitive |
| `--ai-surface-contrast` | progress track | |
| `--ai-surface-brand` | progress fill (Default, Seats Assigned) | |
| `--ai-surface-success` | progress fill + badge background (Full) | |
| `--ai-radius-full` | track, fill, badge | |
| `--ai-spacing-2` | track `block-size` (6px), badge `padding-inline` | |
| `--ai-spacing-0-5` | badge `padding-block` (2px) | |
| `--ai-icon-size-xs` | action-button icons (12px, via `btn--2xs`) | |
| `--ai-radius-sm` | action-button radius (via `btn--2xs`) | |

## Token gaps and decisions

All five resolved with the designer 2026-08-25 rather than invented.

| Figma | Decision |
|---|---|
| `--ai-surface-brand` bound as the "N seats free" **text** colour | **Rebound to `--ai-text-brand`.** At 11px the surface token gives 3.60:1 on white and 3.44:1 on the Selected surface — both under the 4.5:1 AA floor. `--ai-text-brand` gives 5.04:1 / 4.82:1. **Figma has been updated**, and `3470:84948` already returns `--ai-text-brand`, so this is not a divergence. |
| badge `gap` bound to `border/width/border-3` (3px) | **Corrected to `--ai-spacing-1`** (4px). A border-width token driving a flex gap; 3px matches no spacing step. Figma updated. |
| badge label `9px`, unbound | **New token `--ai-font-fixed-6xs`** (9px). Created in Figma by the designer and added to `FigmaTokens/Typography/{Desktop,Mobile,Minimised}.tokens.json` so the build resolves it now — see the warning below. |
| CheckIcon `7×7px` | **Approved as a raw value.** The smallest icon token is `--ai-icon-size-xs` (12px), which will not fit a 15px-tall badge. Commented at the declaration. |
| `Grey/0` primitive (`#ffffff`) on the badge label | **`--ai-text-invert`**, which is exactly `#ffffff`. |
| card `width: 290px` | **Dropped.** The card is fluid and fills its column. 290px has no token; the bound `min-width` does (`--ai-size-5` / `--ai-size-4`), and those are kept. |

> **`--ai-font-fixed-6xs` was hand-added to the token JSON.** CLAUDE.md §11 forbids editing
> `FigmaTokens/*.json` by hand; this was an explicit designer instruction ("create new var and I
> will upload new tokens") to unblock the build. The `com.figma.variableId` is the placeholder
> `VariableID:PENDING-FIGMA-EXPORT-6xs` so it is greppable. **The next Figma re-export overwrites
> all three files and should carry the real variable at the same 9px value — check that
> `--ai-font-fixed-6xs` survives `npm run tokens`.**

## Button: a new size was added for this component

Figma places the edit/delete actions as **Button instances at 24×24** with a 12px icon, but no
existing size produced that: `btn--icon` is 40×40, `+ .btn--sm` 32×32, `+ .btn--xs` 32×24. At the
designer's direction a new `.btn--icon.btn--2xs` was added to `Button.css` (24×24, 12px icon,
`--ai-radius-sm`).

It is **icon-only by design** — there is no text `.btn--2xs`, because Figma defines none, and
inventing one would be a variant with no Figma counterpart. AttendeeCard's action buttons have
identical geometry (24px box, 12px icon, `--ai-radius-sm`) built as scoped `.attendee-card__action`
CSS; folding those onto `btn--2xs` is a worthwhile follow-up but was out of scope here.

## Accessibility

- **The action buttons are 24×24, well under the 44×44 minimum** in CLAUDE.md §9. Built as drawn,
  matching the same decision taken for AttendeeCard, and recorded here for a later pass. The card's
  own select target is the full card, so the primary action is comfortably large.
- **The progress bar is `aria-hidden`.** "12 tables · 124/148 seated" and "24 seats free" state the
  same value in text immediately above it; a `progressbar` role would make screen readers announce
  the number a third time.
- The FULL badge is **white on `--ai-surface-success` at 3.16:1**, under the 4.5:1 needed for 9px
  bold text. This is a palette-level problem (it would need either a darker success or a dark
  label) rather than something this component can fix — **flagged, not resolved.** It joins the
  open items in `docs/contrast-audit.md`.
- The room name is an `<h3>`; the demo nests it under `<h2>` section headings.

## Notes

- **`Full-Badge` is an inline frame, not a component instance.** `get_metadata` reports it as
  `<frame>` where the two Buttons report as `<instance>` — so it is correctly scoped as
  `.room-card__badge` rather than composed. Rendered 45.1×15 against Figma's 45×15.
- **`get_design_context` returns the actions frame as an empty `<div>`** on every variant — the
  Button instances are flattened out of the output. They are only visible via `get_metadata` on the
  frame. Don't read that empty div as "no actions"; the screenshot shows two.
- **Design context under-reports bound tokens.** The title's size renders as raw `text-[16px]` and
  the min-width as `min-w-[280px]`, but `get_variable_defs` shows both bound
  (`--ai-font-fixed-sm`, `--ai-size-5`). Always cross-check the two before flagging a gap.
- **A single-child flex wrapper around the badge** (`3470:84968`, gap `--ai-spacing-3`) is dropped —
  a gap on a one-child flex container does nothing.
- **No hover, focus, pressed or disabled variants** exist in the Figma set. The action buttons get
  Button's own states; nothing else was invented.
- **No dark-mode variant** in Figma. Every colour is a theme-aware `--ai-*` token, so the card will
  re-resolve under `[data-theme="dark"]`, but that has not been designed or reviewed.
- `font-semibold` on the seats-free text is unbound in Figma while its siblings cite
  `--ai-font-bold` / `--ai-font-regular`. `--ai-font-semibold` (600) is used here. **Worth binding
  in Figma.**
