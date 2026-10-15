# Tooltip — Figma Notes

## Figma Node
- File: `Lus07xi8pPXLN87sQIyrEt`
- Component set: node `169:3025` — [open in Figma](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=169-3025)
- Figma description: "Dark tooltip. Hugs its text up to size-7, then wraps. Arrow: None (default) / Top / Bottom /
  Left / Right = the side the arrow sits on, pointing at the target. Arrow is a spacing-4 x spacing-2 triangle in
  the tooltip fill. Amended 2026-10-06 (Frame 197 follow-up)."

## Variant Matrix

| Node ID | Variant | CSS |
|---|---|---|
| 68:4490 | Tier=Component, Arrow=None | `.tooltip` |
| 4081:160050 | Tier=Component, Arrow=Top | `.tooltip.tooltip--arrow-top` |
| 4081:160053 | Tier=Component, Arrow=Bottom | `.tooltip.tooltip--arrow-bottom` |
| 4081:160056 | Tier=Component, Arrow=Left | `.tooltip.tooltip--arrow-left` |
| 4081:160059 | Tier=Component, Arrow=Right | `.tooltip.tooltip--arrow-right` |

No interactive states. The arrow variants were added in Figma on 2026-10-06 and reached code on 2026-10-15
(audit found code still single-variant, 351px fixed width).

## CSS Class Mapping

| Figma | CSS |
|---|---|
| Tooltip frame | `.tooltip` |
| Text | `.tooltip__text` (the container also carries the text style, so a bare text child is styled) |
| Arrow = Top / Bottom / Left / Right | `.tooltip--arrow-top` / `-bottom` / `-left` / `-right` (`::before`, `clip-path` triangle) |

## Token Mapping

| Property | Figma variable | CSS value |
|---|---|---|
| Background | `Neutral/1000` | `#0b0b0c` — approved primitive |
| Arrow fill | `Neutral/1000` | `#0b0b0c` — approved primitive (designer, 2026-10-15) |
| Arrow size | spacing-4 × spacing-2 (12 × 6) | `var(--ao-spacing-4)` × `var(--ao-spacing-2)` |
| Border radius | `border/radius-lg` | `var(--ao-radius-lg)` |
| Padding | `spacing/5` | `var(--ao-spacing-5)` |
| Gap | `spacing/3` | `var(--ao-spacing-3)` |
| Width | hug, max `size/7` | `inline-size: max-content; max-inline-size: var(--ao-size-7)` |
| Text color | `Neutral/0` | `#ffffff` — approved primitive |
| Text font | `body/xxs` (`--ao-font-body`, `--ao-font-regular`, `--ao-font-fixed-xxs`, `--ao-leading-xs`) | same |

## Token Gaps / Approved Primitives

| Property | Value | Resolution |
|---|---|---|
| Background + arrow | `Neutral/1000` = `#0b0b0c` | Approved primitive — the tooltip is a fixed dark panel in both themes. Arrow re-approved 2026-10-15. |
| Text color | `Neutral/0` = `#ffffff` | Approved primitive — always white on the dark panel. |
| Box shadow | Figma: raw `0 2px 10px rgba(0,0,0,0.15)` (no effect style) | Code keeps `var(--ao-shadow-md)` (designer, 2026-10-15). Known mismatch: resolve in Figma by binding a shadow style. |
| Arrow overlap | Figma places the 6px arrow at -5 (1px into the body) | `calc(var(--ao-spacing-2) * -1 + 1px)` — the 1px is an optical overlap so no seam shows. |

## Notes
- **Theme behaviour:** fixed dark in both light and dark themes; it does not invert.
- **Positioning** is the parent's job (Header: `.header .tooltip`; RecordSummary: pinned-icon tips and the status
  strip's shared tip). Pick the Arrow side that points at the target — a tooltip placed BELOW its target is
  Arrow=Top.
- Earlier notes listed `Neutral/950 #0c121c` and a fixed 351px width — both stale; Figma binds Neutral/1000 and
  hugs up to size/7.
- Code Connect (`Tooltip.figma.ts`) maps the Arrow enum to the modifier class — written 2026-10-15, not yet published.
