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

#### The icon is now 7px, as an explicitly approved raw value

Figma draws the check at **7px**. Nothing on the `--ai-*` scale is 7px, and the smallest icon token
(`--ai-icon-size-xs`) is 12px, which will not sit inside a 15px badge. The code meanwhile carried a
**hardcoded 10px**, which was a governance violation predating this audit.

The first decision (2026-09-11) was to add an `--ai-icon-size-2xs` token. That was then **revised the
same day**: the designer approved a **raw 7px** instead, on the grounds that it is a single use.
That is a legitimate resolution of the hardcoded-dimension rule — the rule's own remedies are
"add a token / approve a `calc()` / **approve as a primitive**", and the stop exists to force the
question, not to forbid the answer. Recorded here rather than left as an unexplained literal,
because an *unrecorded* one-off is exactly how hardcoded dimensions accumulate.

```css
inline-size: 7px;     /* Figma 3615:110605 — approved raw, designer 2026-09-11 */
stroke-width: 5.7px;  /* was 4 — see below, these are a pair */
```

If a second component ever needs 7px, that is the signal to promote it to a token rather than copy
the literal.

#### The stroke HAD to go 4 → 5.7, or the resize would have undone the 2026-08-25 fix

This nearly went wrong, and it is the reason the two values are a pair. The 10px was **not**
sloppiness — it was a deliberate legibility decision (see *Two places the CSS leads Figma*): Lucide
draws on a 24-unit viewBox, so the stroke thins in proportion to the rendered size, and at 7px the
default all but vanished against the green. Shrinking the icon without touching the stroke would
have quietly reintroduced exactly that, on a badge whose contrast **already fails AA at 3.16:1**.

Rendered stroke is `stroke-width × size ÷ 24`. Measured at true 1×, because a scaled vector preview
hides this — the same method the original decision was verified with:

| Size | `stroke-width` | Rendered stroke |
|---|---|---|
| 10px (old) | 4 | 1.67px |
| 7px | 4 | **1.17px** ← the hairline |
| 7px | 5 | 1.46px |
| **7px (now)** | **5.7** | **1.66px** ← matches the old weight |
| 7px | 7 | 2.04px |

So the check got **smaller, not thinner**. Applying either value alone is a regression in one
direction or the other. `stroke-width` stays raw by the same reasoning as border widths — it is an
optical unit, the SVG analogue of a border, and the `4px` it replaces was already documented so.

#### Where that leaves the measurements

Measured on the component's own demo, with Inter actually loaded:

| | Figma | Code |
|---|---|---|
| badge | 45 × 15 | **46.9 × 15** |
| icon | 7 | **7** |
| rendered stroke | — | **1.66px** |

Height is now exact. The badge was **49.9** wide before this change, so the icon accounts for the
full 3px improvement. The residual ~1.9px is entirely the two documented *CSS-leads-Figma* items:
the gap is 4px against Figma's 3px (and Figma is being corrected to 4, which closes 1px of it), and
`--ai-tracking-7` adds letter-spacing Figma does not set. Once the gap binding lands, Figma reads 46
and code 46.9.

> **Beware measuring this in a bare probe.** A minimal test page without the real font stack
> reported the badge as 14px tall rather than 15 — the fallback font's `normal` line-height at 9px
> is a pixel shorter than Inter's, and the text box is what drives the height, not the icon. Measure
> on the demo page.

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
| check icon `7×7` | **Raw 7×7 + `stroke-width: 5.7`, designer-approved 2026-09-11.** Was a raw 10×10; no icon token fits, the smallest (`--ai-icon-size-xs`) being 12px. A token (`--ai-icon-size-2xs`) was briefly agreed and then revised the same day to an approved raw value, on the grounds of a single use. The stroke change is not optional — see the component section above. |

## Two places the CSS leads Figma

| Property | Figma | CSS |
|---|---|---|
| check icon | `7×7`, default stroke | `7×7`, **`stroke-width: 5.7`** — size now MATCHES Figma (2026-09-11); only the stroke leads |
| label `letter-spacing` | **not set** | **`--ai-tracking-7`** (0.05em) |

**The check had to grow to stay legible.** Lucide renders on a 24-unit viewBox, so its default
`stroke-width: 2` thins to roughly 0.6px once scaled to 7px — a hairline that all but disappeared
against the green. 10px with `stroke-width: 4` reads properly. Verified against a true 1× raster
upscaled with nearest-neighbour, not a scaled vector preview, because scaling hides exactly that
thinning. CSS `stroke-width` beats the `stroke-width="2"` presentation attribute Lucide writes onto
the `<svg>`; both `[data-lucide]` and `svg` are targeted because `createIcons()` swaps the element.

**The tracking is an addition** — 9px bold uppercase sets very tight, and it matches the treatment
TableType's uppercase micro-label was given.

**Superseded 2026-09-11.** The icon now matches Figma at 7px, so only the stroke and the tracking
lead. The badge renders **46.9×15 against Figma's 45×15** — height exact, and the residual width is
the 1px gap difference (Figma being corrected to 4px) plus the letter-spacing Figma does not set.

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
