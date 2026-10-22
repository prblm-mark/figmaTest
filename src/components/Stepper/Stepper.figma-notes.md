# Stepper — Figma Notes

## Figma Node

**None yet: code-first.** Built 2026-10-22 for the v3 Import pattern (TASK-575621) after Mark chose
a one-page flow with a stepper ("always add new components where it optimises the ui/ux"). Push to
Figma for design review; the code is the reference until then.

## Variant × State Matrix

| Step state | Marker | Label | Interactive |
|---|---|---|---|
| Upcoming (default) | number, outlined circle | `text/contrast`, medium | no (`<span>`) |
| Current | number, brand-filled circle | `text/primary`, semibold; `aria-current="step"` | no |
| Complete | Lucide `check`, brand-soft circle | `text/secondary` (primary on hover) | yes (`<button>`), dispatches `stepper:select` |
| Error | `!`, error-filled circle | `text/error` | yes, as Complete |
| Locked (any done step, `locked: true`) | as Complete / Error | as Complete / Error | no |

Connector after a step: `border/secondary`; after a Complete or Error step: `border/brand`.

**Narrow** (the Stepper's own container under 640px = `size-10`): only the current step's label stays
visible; the others are visually hidden but still read out ("Step 2 of 4: Map columns, done").

## CSS Class Mapping

| Part | Class |
|---|---|
| Root (`<nav aria-label>`), its own container `stepper` | `.stepper` |
| Ordered list | `.stepper__list` |
| Step (`<li>`) | `.stepper__step` + `--current` / `--complete` / `--error` |
| Item (`<span>` or `<button>`) | `.stepper__item` |
| Circle | `.stepper__marker` |
| Text | `.stepper__label` |

JS: `Stepper.render(nav, { steps, current, errors, locked })` (Stepper.js). The owner decides whether a
`stepper:select` moves the flow; the Stepper never changes step itself.

## Token Mapping (all existing tokens; code-first choices)

| Property | Token | Why |
|---|---|---|
| Marker size | `spacing-7` (32px) | The CC small-control height; holds a 16px icon with room |
| Marker icon | `icon-size-sm` | Icon rule |
| Marker number | `font-fixed-xxs` semibold, `leading-xs` | Badge-scale numeral |
| Label | `font-fixed-xs` medium (semibold current), `leading-sm` | Body text of the card it sits in |
| Item min height | `spacing-9` (48px) | WCAG 44px touch target for the back buttons |
| Marker ↔ label, step ↔ step gap | `spacing-3` | Button's icon gap |
| Connector min length | `spacing-5` (`spacing-3` narrow) | Keeps steps visibly joined |
| Connector | `2px` border, `border/secondary` → `border/brand` | Border width is a permitted px |
| Focus | `2px solid surface/brand`, 2px offset | CLAUDE.md §9 |

## Token Gaps

None.

## Notes

- Error is "done but needs attention" (Review skipped rows), not a blocking error: the flow has moved on.
- Demo: `src/components/Stepper/Stepper.html` (all states, narrow, a working back-click).
