# SegmentedControl — Figma Notes

## Figma Node

Two Figma sets have produced this control, which is the first thing to know:

| File | Node | Used by |
|---|---|---|
| `Ikv8jxb5dcRH8ff4q4dR11` (AI Chat) | `2162:5079` | the original build, recorded in the registry |
| `Lus07xi8pPXLN87sQIyrEt` (Design System) | `2699:2052` "ThemeToggle" | the **Size** axis, read 2026-09-22 |

**And the Design System set is also built as `src/components/ThemeToggle`** —
the Code-Connect-mapped one, used by the Seating Planner patterns. Two code
components for one Figma component is a duplication worth resolving; `Size=sm`
was added here because this is the generic control the listing screens'
Grid/Listing switch uses. **ThemeToggle wants the same size.**

## Variant × Size Matrix

| Node | State | Size | Frame | Built |
|---|---|---|---|---|
| `2699:2062` | Light | Default | 172×40 | ✅ `.seg-control` |
| `2699:2053` | Dark | Default | 172×40 | ✅ `.seg-control` |
| `3729:25008` | Light | sm | 146×32 | ✅ `.seg-control--sm` |
| `3729:16713` | Dark | sm | 154×32 | ✅ `.seg-control--sm` |

## What `sm` actually changes

Not a scaled-down Default. **Every value on the button is identical** — 32px
tall, `--ai-spacing-4` padding, `--ai-spacing-3` gap, 16px icon, the same
`button/sm` type ramp. What changes is the **container**, and with it the shape
of the whole thing:

| | Default | sm |
|---|---|---|
| Container height | `--ai-spacing-8` (40) | `--ai-spacing-7` (32) |
| Container padding | `--ai-spacing-1` (4) | **0** |
| Active segment | a pill floating inside the box, `--ai-radius-sm` all round | flush to the container edge, `--ai-radius-md` on its **outer corners only** |

So the Default reads as a box containing a pill, and `sm` reads as one joined
bar. The corner treatment follows from the padding, not the other way round.

Corner radii are set **per button** rather than with `overflow: hidden` on the
container: the focus state is a box-shadow ring, and a clipped container would
eat it.

## Token Mapping

| Figma | CSS | Role |
|---|---|---|
| `--ai-surface-primary` | container background | |
| `--ai-border-secondary` | container border | 1px |
| `--ai-radius-md` | container radius, and the sm active segment's outer corners | |
| `--ai-spacing-8` / `--ai-spacing-7` | container height, Default / sm | |
| `--ai-spacing-1` / `0` | container padding, Default / sm | |
| `--ai-spacing-7` | button height (both sizes) | was a hardcoded `32px`; fixed 2026-09-22 |
| `--ai-spacing-4` | button padding-inline (both sizes) | |
| `--ai-spacing-3` | icon-to-label gap (both sizes) | |
| `--ai-icon-size-sm` | icon, 16px (both sizes) | |
| `button/sm` | `--ai-font-body` · `--ai-font-semibold` · `--ai-font-fluid-xxs` · `--ai-leading-xs` | identical on both sizes |
| `--ai-btn-tertiary-text` | active label | |
| `--ai-btn-secondary-text-hover` | inactive label | |

## Token Gaps

None. Every value traces to an `--ai-*` token.

## Flagged for Figma

**1. The two `sm` variants disagree with each other.** `State=Light, Size=sm` is
**146** wide with its buttons at `pl 8 / pr 12`; `State=Dark, Size=sm` is **154**
with `12` both sides, matching the Default. Same control, same size, 8px
different depending on which half is active — a toggle that changes width when
you press it. Built at **12/12**, which two of the three datapoints agree on.

**2. The active segment's background does not match the code.** Figma binds
`--ai-surface-secondary` on the active button in *every* variant, both sizes.
The code has used `--ai-surface-minimal` since the original build. **Not
changed here** — `.seg-control` is also used by StyleSettings and two
EventBuilder prototypes, so correcting it is a decision with a blast radius,
not a tidy-up. Needs a designer call.

**3. The duplication with ThemeToggle**, above.

## Notes

- Icons in Figma are named `Icon/24px/Sun` and `Icon/24px/Moon` but placed at
  **16px** — the design context reports the component's intrinsic size, not the
  placed size. Lucide `sun` / `moon`.
- Each button carries a hidden `Icon/20px/PanelLeft` instance in all four
  variants. Unused; not built.
