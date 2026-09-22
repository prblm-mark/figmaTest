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

**2. ~~The active segment's background does not match the code.~~ RESOLVED
2026-09-22 — and the two Figma sources were each right about a different
surface.** The Design System's ThemeToggle binds `--ai-surface-secondary`; the
code used `--ai-surface-minimal`, which is what the AI Chat SegmentedControl
binds. Resolved per surface, the reason is plain:

| surface | `--ai-surface-secondary` | container `--ai-surface-primary` | |
|---|---|---|---|
| base | `#e9eef4` | `#ffffff` | ✓ |
| cc | `#e7edf0` | `#ffffff` | ✓ |
| cc-dark | `#3d4b5f` | `#1e293b` | ✓ |
| **chat** | **`#ffffff`** | `#ffffff` | ✗ invisible |
| chat-dark | `#2e2e32` | `#212123` | ✓ |

So `secondary` is now the rule, per the designer, and a
`[data-surface="chat"]` guard keeps `minimal` on the one surface where
`secondary` would make the active segment disappear into its own container —
which is the surface this component's own demo page runs as. Both bindings
kept, each where it is correct. Verified in all four combinations.

**2b. The divider.** `sm` only: a 1px `--ai-border-secondary` on the ACTIVE
segment's inner edge — its right when the left half is active, its left when
the right half is (designer, 2026-09-22). Not in either Figma. The Default
keeps 4px of container padding so its segments never touch, and a line between
them would float in the gap; `sm` has none, so without a divider the bar reads
as a box with a shaded end rather than two joined halves. On the active
segment rather than always on the first button so it sits over the fill and
stays a crisp 1px instead of being a seam between two backgrounds.

**3. The duplication with ThemeToggle**, above.

## Notes

- Icons in Figma are named `Icon/24px/Sun` and `Icon/24px/Moon` but placed at
  **16px** — the design context reports the component's intrinsic size, not the
  placed size. Lucide `sun` / `moon`.
- Each button carries a hidden `Icon/20px/PanelLeft` instance in all four
  variants. Unused; not built.
