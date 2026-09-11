# FullBadge — Figma Notes

**Tier:** Component
**Built:** 2026-08-25 (extracted during Seating Planner wave 3)
**Files:** `FullBadge.css`, `FullBadge.html`, `FullBadge.figma.ts`, `FullBadge.figma-notes.md`
**Consumed by:** RoomCard, TableCard
**JS:** none

## It is a real Figma component now (2026-09-11)

It was not, for the first two and a half weeks of its life — the section this replaces existed to
warn that FullBadge had been **extracted from code**, and that Figma drew it as four hand-drawn
`Full-Badge` frames across RoomCard and TableCard rather than one component with four instances.
The designer has now promoted it, which closes all three consequences that note listed.

### Figma node

- **File key:** `Lus07xi8pPXLN87sQIyrEt`
- **Component set:** `3615:110610` — [Full-Badge](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3615-110610)

### Variant matrix (1 variant)

| Node ID | Variant | Size | Notes |
|---|---|---|---|
| `3615:110609` | `Tier=Component` | 45×15 | the only variant |

`Tier` is single-valued and produces no CSS, so **there are no modifiers** — the same shape as
TableType, RoomCard and TableCard in this module. There is also **no TEXT property**: "Full" is a
static text layer (`3615:110607`), so the label is fixed in markup rather than mapped with
`figma.string`. If the badge ever needs other words, that has to become a Figma property first.

### Code Connect is live

`FullBadge.figma.ts` exists as of this build — it could not before, because `figma.connect` needs a
component to attach to and a frame-targeted mapping would have been worse than none. Parses clean
against all 75 files.

### The audit found two mismatches

Both were real, and both compound in the same direction: the badge rendered about **49px wide
against Figma's 45**.

| Property | Figma `3615:110609` | Code was | Resolution |
|---|---|---|---|
| gap | `border/width/border-3` = 3px | `--ai-spacing-1` = 4px | **Figma binding fixed** — see below |
| check icon | 7px | 10px, hardcoded | **new token** — see below |

Everything else matched exactly: `--ai-surface-success`, `--ai-spacing-2` inline, `--ai-spacing-0-5`
block, `--ai-radius-full`, and the full type stack (`--ai-font-title` / `--ai-font-bold` /
`--ai-font-fixed-6xs` / `--ai-text-invert` / uppercase / `leading: normal`). `--ai-surface-success`
is `#30a46c` in **all three modes** — light, dark and CC — so the green is theme-invariant and
matches Figma's value precisely.

#### The gap was a Figma-side binding slip

Figma bound **`border/width/border-3`** — a *border-width* primitive — as the flex gap. A border
width driving spacing is semantically wrong, and it is why the code deviated to `--ai-spacing-1` in
the first place. Designer's call (2026-09-11): **fix the binding in Figma** to `--ai-spacing-1`
rather than propagate 3px into code. **No code change** — the CSS was already right, and it is the
source that moves.

#### The icon needs a 7px token that does not exist yet

Figma draws the check at **7px**. Nothing on the `--ai-*` scale is 7px; the nearest icon token is
`--ai-icon-size-xs` at 12px, which is visibly larger. The code meanwhile carried a **hardcoded
10px**, which was a governance violation predating this audit.

Designer's call: **add a 7px token** (`--ai-icon-size-2xs`) so the value matches Figma *and* stops
being hardcoded.

> **BLOCKED — this is the one item not done.** A token cannot be added from code:
> `FigmaTokens/*.json` and `css/tokens*.css` are generated, and CLAUDE.md forbids editing either by
> hand. The sequence is **Figma variable → re-export → `npm run tokens` → then** the icon rule
> becomes:
>
> ```css
> .full-badge [data-lucide],
> .full-badge svg {
>   inline-size: var(--ai-icon-size-2xs);
>   block-size: var(--ai-icon-size-2xs);
> }
> ```
>
> The rule is deliberately **left at 10px until then** — writing `var(--ai-icon-size-2xs)` against a
> token that does not exist resolves to nothing and would size the icon by its intrinsic default,
> which is worse than the known-wrong 10px. Badge width goes 49 → 45 when it lands.

#### Shrinking to 7px MUST raise the stroke to 5.7, or it undoes the 2026-08-25 fix

This nearly went wrong. The 10px was not sloppiness — it was a deliberate legibility decision
(see *Two places the CSS leads Figma*): Lucide draws on a 24-unit viewBox, so the stroke thins in
proportion to the rendered size, and at 7px the default all but vanished against the green. Moving
to 7px without touching the stroke would quietly reintroduce exactly that, on a badge whose
contrast **already fails AA at 3.16:1**.

Rendered stroke is `stroke-width × size ÷ 24`. Measured at true 1× (a scaled vector preview hides
this, which is why the original decision was verified the same way):

| Size | `stroke-width` | Rendered stroke |
|---|---|---|
| 10px (current) | 4 | **1.67px** |
| 7px | 4 | **1.17px** ← the hairline |
| 7px | 5 | 1.46px |
| **7px** | **5.7** | **1.66px** ← matches today exactly |
| 7px | 7 | 2.04px |

So the two changes are **a pair and must land together**:

```css
.full-badge [data-lucide],
.full-badge svg {
  inline-size: var(--ai-icon-size-2xs);   /* 7px, once the token exists */
  block-size: var(--ai-icon-size-2xs);
  stroke-width: 5.7px;                     /* was 4 — keeps the rendered stroke at 1.67px */
}
```

Applying either alone is a regression: 7px with stroke 4 is a hairline, and 10px with stroke 5.7 is
too heavy. `stroke-width` stays a raw number by the same reasoning as border widths — it is an
optical unit, and the existing `4px` was already documented on that basis.

### Also worth knowing: the Figma file has been renamed

The URL the designer supplied reads `Affino---Design-System`, where every existing `.figma.ts` in
this repo carries the older `Affino-AI---Design-System` slug. Code Connect matches on the **file
key**, not the slug, so all 85 existing mappings still resolve and nothing is broken — but they now
carry a stale name. This file uses the current slug. Worth a sweep if the inconsistency ever grates.

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
| check icon `7×7` | **Was raw 10×10** — no icon token fitted, the smallest (`--ai-icon-size-xs`) being 12px. **SUPERSEDED 2026-09-11**: designer approved a new `--ai-icon-size-2xs` (7px) to match Figma and remove the hardcoded value. Blocked on the Figma variable + re-export, and must land together with `stroke-width: 5.7` — see the component section above. |

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
