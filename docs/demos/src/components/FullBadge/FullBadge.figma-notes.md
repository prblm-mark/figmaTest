# FullBadge — Figma Notes

**Tier:** Component
**Built:** 2026-08-25 (extracted during Seating Planner wave 3)
**Files:** `FullBadge.css`, `FullBadge.html`, `FullBadge.figma-notes.md`
**Consumed by:** RoomCard, TableCard
**JS:** none

## There is no Figma component for this

That is the whole reason this file needs reading. FullBadge was **extracted from code**, not built
from a component set. Figma draws it as an inline `Full-Badge` frame in two separate places:

| Consumer | Figma node | Notes |
|---|---|---|
| RoomCard | `3470:84969` | Full / Default, desktop |
| RoomCard | `3474:90697` | Full / Selected, desktop |
| TableCard | `3472:85703` | Full / Default, desktop |
| TableCard | `3484:186684` | Full / Default, mobile — 46px wide, 1px off the others |

`get_metadata` reports every one of them as `<frame>`, never `<instance>` — so they are four hand-drawn
copies of the same thing, not a component with four usages. They are identical apart from that 1px.

**Consequences, in order of how likely they are to bite:**

1. **No Code Connect.** `figma.connect` needs a component to attach to. Until Figma makes one, a
   designer clicking the badge sees nothing. There is deliberately no `FullBadge.figma.ts` — an
   empty or frame-targeted one would be worse than none.
2. **Figma can drift from itself.** Four copies means four things to keep in step; the mobile one is
   already 1px out.
3. **The variant matrix is empty.** No Type, State, Size or Device axes exist, so there are no
   modifiers here and none should be added without a Figma counterpart.

> **Ask the designer to promote it to a real component**, then add the `.figma.ts` and replace the
> four frames with instances. This note can go when that happens.

## Why it was extracted

It was originally scoped inside RoomCard as `.room-card__badge` (2026-08-25). When TableCard turned
out to draw an identical copy, the designer chose extraction over duplicating it — so the open
contrast question below and the check-icon sizing live in one file rather than two.

## Token mapping

| Figma | CSS | Role |
|---|---|---|
| `--ai-surface-success` | `background-color` | |
| `--ai-text-invert` | `color` | was the `Grey/0` primitive in Figma |
| `--ai-radius-full` | `border-radius` | |
| `--ai-spacing-2` | `padding-inline` (6px) | |
| `--ai-spacing-0-5` | `padding-block` (2px) | |
| `--ai-spacing-1` | `gap` (4px) | Figma bound `border/width/border-3` — see below |
| `--ai-font-title` | `font-family` | |
| `--ai-font-fixed-6xs` | `font-size` (9px) | the token added 2026-08-25 |
| `--ai-font-bold` | `font-weight` | |
| `--ai-tracking-7` | `letter-spacing` | CSS leads Figma — see below |

## Token gaps and decisions

Resolved with the designer 2026-08-25 rather than invented.

| Figma | Decision |
|---|---|
| `gap` bound to `border/width/border-3` (3px) | **`--ai-spacing-1`** (4px). A border-width token driving a flex gap, and 3px matches no spacing step. Figma updated. |
| label `9px`, unbound | **New token `--ai-font-fixed-6xs`**, created in Figma and re-exported the same day. |
| `Grey/0` primitive (`#ffffff`) | **`--ai-text-invert`**, which is exactly `#ffffff`. |
| check icon `7×7` | **Raw 10×10** — see below. No icon token fits: the smallest, `--ai-icon-size-xs`, is 12px and will not sit in a 15px badge. |

## Two places the CSS leads Figma

| Property | Figma | CSS |
|---|---|---|
| check icon | `7×7`, default stroke | **`10×10`, `stroke-width: 4`** |
| label `letter-spacing` | **not set** | **`--ai-tracking-7`** (0.05em) |

**The check had to grow to stay legible.** Lucide renders on a 24-unit viewBox, so its default
`stroke-width: 2` thins to roughly 0.6px once scaled to 7px — a hairline that all but disappeared
against the green. 10px with `stroke-width: 4` reads properly. Verified against a true 1× raster
upscaled with nearest-neighbour, not a scaled vector preview, because scaling hides exactly that
thinning. CSS `stroke-width` beats the `stroke-width="2"` presentation attribute Lucide writes onto
the `<svg>`; both `[data-lucide]` and `svg` are targeted because `createIcons()` swaps the element.

**The tracking is an addition** — 9px bold uppercase sets very tight, and it matches the treatment
TableType's uppercase micro-label was given.

Together these render the badge at **49.9×15 against Figma's 45×15**. If Figma is brought into line,
the frame wants to be about 50px.

## Accessibility — one open item

**White on `--ai-surface-success` measures 3.16:1**, under the 4.5:1 WCAG AA requires for 9px bold
text. It needs either a darker success or a dark label — a palette decision, not something this
component can fix. **Deliberately left open** at the designer's direction 2026-08-25; tracked with
the other unresolved pairs in `docs/contrast-audit.md`.

Fixing it here now fixes it for both consumers at once, which is part of why extraction was worth
doing.

## Notes

- **Ships as a `<span>`.** It was a `<p>` while scoped inside RoomCard, which needed a `margin: 0`
  reset — the reset is kept defensively, since a caller reaching for a block element would otherwise
  inherit margins and push its row out of alignment. That bug did occur once, adding 16px to
  RoomCard's Full card only.
- **`flex-shrink: 0`** because it always shares a flex row with a growing text node.
- The Lucide name is `check`, matching Figma's `CheckIcon` / `check` layer names.
