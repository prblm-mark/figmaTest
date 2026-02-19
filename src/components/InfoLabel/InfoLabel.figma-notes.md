# InfoLabel — Figma Notes

## Figma Node
- File: `8OAAokH2JXhIvGZFrlzeKT`
- Component set: node `68:4425`
- Variant (No Label=False): node `68:4410` — [open in Figma](https://www.figma.com/design/8OAAokH2JXhIvGZFrlzeKT/Affino-AI---Design-System?node-id=68-4410)

## Variant Matrix

| Variant | CSS class | Description |
|---|---|---|
| No Label=False | `.info-label` | Text + icon (default) |
| No Label=True | `.info-label.info-label--no-label` | Icon only |

## Token Mapping

| Property | Figma variable | CSS variable | Value |
|---|---|---|---|
| Gap | `--ai-spacing-3` | `--ai-spacing-3` | 8px |
| Text font family | `--ai-font-title` | `--ai-font-title` | Inter |
| Text font size | `--ai-font-fixed-xxs` | `--ai-font-fixed-xxs` | 12px |
| Text font weight | `--ai-font-semibold` | `--ai-font-semibold` | 600 |
| Text line height | `--ai-leading-1` | `--ai-leading-1` | 16px |
| Text color | `--ai-text-primary` | `--ai-text-primary` | #1f2a37 |
| Icon size | — | 16×16px (fixed) | — |
| Icon color | `--ai-icon-primary` | `--ai-icon-primary` | #1f2a37 |

## Token Gaps
None — all design values map to `--ai-*` semantic tokens.

## Notes
- Icon: Figma uses `Icon/16px/Info` → Lucide `info`
- Text has dotted underline (`text-decoration-style: dotted`, `text-underline-offset: 2px`)
- Semantic element: `<button>` (triggers tooltip/info action)
- `aria-label` required on the button when `No Label=True` (no visible text)
