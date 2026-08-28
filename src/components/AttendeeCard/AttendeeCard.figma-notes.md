# AttendeeCard — Figma Notes

**Tier:** Component
**Built:** 2026-08-25 (Seating Planner module, wave 2)
**Files:** `AttendeeCard.css`, `AttendeeCard.html`, `AttendeeCard.figma.ts`, `AttendeeCard.figma-notes.md`
**Composes:** Button (`btn btn--secondary btn--sm`) — the Empty variant's Assign action
**JS:** none

## Figma Node

- **File key:** `Lus07xi8pPXLN87sQIyrEt` (Affino AI — Design System)
- **Page:** Seat Planner (`3087:5050`)
- **Component set:** `3474:89292`

## Variant matrix (12 variants)

Axes are **Type × State × Tier**. Tier is single-valued (`Component`) and produces no CSS.

| Type | State | Node | CSS |
|---|---|---|---|
| Attendee | Default | `3474:89287` | `.attendee-card.attendee-card--attendee` |
| Attendee | Dragged Over | `3474:89315` | `+ .attendee-card--dragged-over` |
| VIP | Default | `3474:89290` | `.attendee-card--vip` |
| VIP | Dragged Over | `3474:89359` | `+ .attendee-card--dragged-over` |
| Speaker | Default | `3474:89286` | `.attendee-card--speaker` |
| Speaker | Dragged Over | `3474:89337` | `+ .attendee-card--dragged-over` |
| Sponsor | Default | `3474:89288` | `.attendee-card--sponsor` |
| Sponsor | Dragged Over | `3474:89381` | `+ .attendee-card--dragged-over` |
| Host | Default | `3474:89289` | `.attendee-card--host` |
| Host | Dragged Over | `3474:89293` | `+ .attendee-card--dragged-over` |
| Empty | Default | `3474:89291` | `.attendee-card--empty` |
| Empty | Dragged Over | `3528:102567` | `.attendee-card--empty.attendee-card--dragged-over` |

The five filled types are 50px tall (content-driven); Empty is 48px via
`min-block-size: var(--ai-spacing-9)`.

> **Figma fix outstanding.** `3528:102567` was added on 2026-08-25 to fill the missing
> Empty / Dragged Over combination, but its `State` property still reads **`Default`**, so it
> currently collides with `3474:89291` — two variants share the same property key. The visual is
> unambiguously the Dragged Over treatment (solid brand border, matching the other five), and the
> designer confirmed that is what was added, so it is built as Empty / Dragged Over. Set
> `3528:102567`'s State to `Dragged Over` in Figma and this note can go.

### Booleans

`Show Actions` and `Show Seat Number` are Figma booleans — omit `.attendee-card__actions` or
`.attendee-card__seat` respectively. Both shown in the demo.

## Interaction model

Confirmed with the designer 2026-08-25:

- **Drop target only.** The card never initiates a drag. `--dragged-over` is a class the parent
  module toggles while an attendee is held over the card. No drag JS belongs here.
- Delete and reorder are rendered as real `<button>`s with `aria-label`s. Design context conveys
  visual structure only, never interaction, so the frames Figma draws are buttons in code.

## Colour model

The accent bar and the role label share one custom property, `--attendee-card-role`, the same
pattern as TableType. Defaults bind the Seating Planner tokens:

| Modifier | Token |
|---|---|
| `--attendee` | `--sp-attendee` |
| `--vip` | `--sp-vip` |
| `--speaker` | `--sp-speaker` |
| `--sponsor` | `--sp-sponsor` |
| `--host` | `--sp-host` |
| `--empty` | `--ai-surface-contrast` (neutral, not a role colour) |

**Radix Vivid is the default palette** at `:root`, so the card renders correctly with no extra
markup. Add `data-seating="muted"` or `"radix-soft"` to an ancestor to switch. All three are
shown at the foot of the demo page.

## State deltas

| | Background | Border |
|---|---|---|
| filled · Default | `--ai-surface-primary` | 1px solid `--ai-border-secondary` |
| filled · Dragged Over | `--ai-surface-minimal` | 1px solid `--ai-border-brand` |
| Empty · Default | `--ai-surface-minimal` | 1px **dashed** `--ai-btn-secondary-border` |
| Empty · Dragged Over | `--ai-surface-minimal` | 1px **solid** `--ai-border-brand` |

Empty's background is already `minimal`, so only its border changes — dashed grey to solid brand.

## Token mapping

| Figma | CSS | Role |
|---|---|---|
| `--ai-surface-primary` / `--ai-surface-minimal` | `background-color` | per state |
| `--ai-border-secondary` / `--ai-border-brand` / `--ai-btn-secondary-border` | `border-color` | per state |
| `--ai-radius-md` | card `border-radius` | |
| `light/shadow-xxs` → `--ai-shadow-xxs` | `box-shadow` | the token added 2026-08-24 |
| `--ai-spacing-2` | card `padding-inline`, accent bar width, meta gap | |
| `--ai-radius-full` | accent bar radius | |
| `--ai-spacing-5` | seat badge box, Empty container gap | Figma draws 18px — see below |
| `--ai-spacing-4` | gap before seat / body | |
| `--ai-spacing-3` | body `padding-block` | |
| `--ai-spacing-0-5` | body gap, actions gap | |
| `--ai-spacing-6` | action hit area | Figma draws 28px — see below |
| `--ai-spacing-9` | Empty `min-block-size` (48px) | |
| `--ai-spacing-px` | role label `padding-block` | |
| `--ai-icon-size-md` | reorder column width | |
| `--ai-icon-size-xs` | all three icons (12px) | |
| `--ai-font-title` | name, seat, role, company | |
| `--ai-font-body` | Empty label | inconsistent — see below |
| `--ai-font-semibold` / `--ai-font-bold` / `--ai-font-medium` / `--ai-font-regular` | weights | |
| `--ai-font-fixed-xs` / `-2xs` / `-4xs` / `-5xs` | name 14 / company 12 / role 11 / seat 10 | |
| `--ai-text-primary` / `--ai-text-contrast` | text | |
| `--ai-icon-contrast` | action icons | |

## Spacing and hover: the CSS deliberately leads Figma

Refined with the designer 2026-08-25 **after** the initial Figma-faithful build. Figma is to be
updated to match, so these are intentional divergences, not drift:

| Element | Property | Figma | CSS now |
|---|---|---|---|
| seat number | leading gap | `--ai-spacing-4` (12px) | **`--ai-spacing-3`** (8px) |
| body (name + meta) | `gap` | `--ai-spacing-0-5` (2px) | **removed** — name and meta sit flush |
| meta row | `gap` | `--ai-spacing-2` (6px) | **`--ai-spacing-1`** (4px) |
| actions | `padding-inline-start` | not set | **`--ai-spacing-3`** (8px) |
| actions | `padding-block` | not set | **`--ai-spacing-2`** (6px) |
| action button | `:hover` | **no hover state exists** | bg `--ai-surface-secondary`, border `--ai-border-secondary`, icon `--ai-icon-secondary` |
| accent wrapper | `inline-size` | `--ai-spacing-1` (4px) | **removed** — shrink-wraps the 6px bar, see below |
| Empty card | container `gap` | `--ai-spacing-5` (16px) | **removed** — see below |

> **Do not "correct" these back from a Figma fetch.** `/update-components` and
> `/review-component` both re-read `get_design_context`, will see the older values and will
> report the CSS as wrong. It is not — Figma is the side that is behind. Delete this section once
> Figma catches up.

### Notes on two of them

**The action-button hover is entirely additive.** The Figma set has no hover, focus, pressed or
disabled variant for these controls. A hover was added so they read as interactive, then the
designer specified the treatment: icons darken from `--ai-icon-contrast` to `--ai-icon-secondary`,
with a `--ai-border-secondary` border. The button carries `border: 1px solid transparent` at rest
so the hover border cannot reflow it — verified 24×24 in both states, with `box-sizing:
border-box` global from `base.css`.

**The Empty card's container gap was wrong, not just different.** It was applying 16px between
*all four* children on top of the 12px margins, and — with no flex-growing child — the card's
`justify-content: space-between` had free space to distribute, which pushed the seat and label
toward the centre. Figma gets the same result by wrapping accent + seat + label in a `flex: 1 0 0`
group; `__empty-label` now grows instead, which is the flattened equivalent. Verified: accent 27,
seat 39, label 67, Assign flush to the right padding edge.

## Token gaps and dimension decisions

Four dimensions in Figma have no `--ai-*` token. Resolved with the designer 2026-08-25 rather
than invented:

| Figma | Decision |
|---|---|
| card `width: 288px` | **Dropped.** The card is fluid and fills its container (a row in the Unassigned tray / Table Detail). The demo constrains its tray to `--ai-size-6` (320px), which — less the tray's own padding and border — leaves the card near Figma's 288px. |
| seat badge `18px` | **`--ai-spacing-5`** (16px) |
| action hit area `28px` | **`--ai-spacing-6`** (24px) |
| reorder stack `height: 36px` | **Not a fixed height** — fills the available vertical space |

### Three deliberate deviations

1. **The 3px separator dot** is a middot character, not Figma's 3px SVG ellipse. It is a text
   separator, and a character avoids an off-scale dimension with no token.
2. **The action-icon radius** uses `--ai-radius-sm` (4px). Figma binds `--ai-spacing-2` (6px) —
   a *spacing* token used for a radius, and 6px matches no radius step (4/8/16/24/100).
   **Worth correcting in Figma.**
3. **The company font-size** is bound to `--ai-font-fixed-xxs`. Figma leaves it a raw
   `text-[12px]` while every sibling text node cites a token. The token is exactly 12px, so
   binding it is visually a no-op. **Worth binding in Figma.**

### Accessibility

The delete and reorder controls are drawn at 28×28 and 20px wide, both well under the 44×44
touch-target minimum in CLAUDE.md §9. **Built as drawn** at the designer's direction 2026-08-25,
with the gap recorded here for a later pass. Every control has an `aria-label`; the accent bar and
separator are `aria-hidden`.

## Notes

- **Seat badge font family is inconsistent in Figma**: `--ai-font-title` on the five filled types
  but `--ai-font-body` on Empty, for the same element. Built as drawn (title on filled, body on
  Empty) so the component matches Figma, but one of the two is almost certainly unintended.
- **The accent bar is two elements, but the wrapper is no longer sized.** Figma nests a 6px
  rounded bar (`--ai-spacing-2`) inside a 4px-wide wrapper (`--ai-spacing-1`), so the bar's right
  2px overhangs into the following gap. The wrapper's `inline-size` was removed at the designer's
  direction, so it shrink-wraps the bar and the accent occupies its full 6px with no overhang —
  everything after it sits 2px further right (seat now starts at 21px, was 19px). The wrapper is
  still a separate element because it carries the `padding-block` that insets the bar vertically
  from the card edges; collapsing the two would lose that.
- **No hover, focus, pressed or disabled variants exist** in the Figma set, so none are
  implemented beyond a hover on the action buttons (needed for them to read as interactive).
- **No dark-mode variant** in Figma. The card uses theme-aware surface and border tokens
  throughout, so it will re-resolve under `[data-theme="dark"]` — but that has not been designed
  or reviewed. The `--sp-*` role colours are **not** theme-aware.
- **`--ai-shadow-xxs` validated here.** Figma binds `light/shadow-xxs` on this card, which is the
  token added 2026-08-24 — this is its first real consumer.
