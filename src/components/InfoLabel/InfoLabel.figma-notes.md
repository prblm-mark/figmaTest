# InfoLabel — Figma Notes

## Figma Node
- File: `Lus07xi8pPXLN87sQIyrEt`
- Component set: node `68:4425`
- Variant (No Label=False): node `68:4410` — [open in Figma](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=68-4410)

## Variant Matrix

| Variant | CSS class | Description |
|---|---|---|
| No Label=False | `.info-label` | Text + icon (default) |
| No Label=True | `.info-label.info-label--no-label` | Icon only |

## Token Mapping

| Property | Figma variable | CSS variable | Value |
|---|---|---|---|
| Gap | `--ao-spacing-3` | `--ao-spacing-3` | 8px |
| Text font family | `--ao-font-title` | `--ao-font-title` | Inter |
| Text font size | `--ao-font-fixed-xxs` | `--ao-font-fixed-xxs` | 12px |
| Text font weight | `--ao-font-semibold` | `--ao-font-semibold` | 600 |
| Text line height | `--ao-leading-xs` | `--ao-leading-xs` | 16px |
| Text color | `--ao-text-primary` | `--ao-text-primary` | #1f2a37 |
| Icon size | — | `--ao-icon-size-sm` (16px) | — |
| Icon color | `--ao-icon-primary` | `--ao-icon-primary` | #1f2a37 |

## Token Gaps
None — all design values map to `--ao-*` semantic tokens.

## Notes
- Icon: Figma uses `Icon/16px/Info` → Lucide `info`
- Text has dotted underline (`text-decoration-style: dotted`, `text-underline-offset: 2px`)
- Semantic element: `<button>` (triggers tooltip/info action)
- `aria-label` required on the button when `No Label=True` (no visible text)
