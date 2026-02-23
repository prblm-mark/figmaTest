# Pill — Figma Notes

## Figma Node
- File: `8OAAokH2JXhIvGZFrlzeKT`
- Component instance: node `78:2994` (within VersionHistoryRow component set 78:2957)

## Variant Matrix

| Variant | Description |
|---|---|
| Single | Green success pill with white text label |

## CSS Class Mapping

| Element | CSS class |
|---|---|
| Pill container | `.pill` |
| Label text | `.pill__label` |

## Token Mapping

| Property | Figma variable | CSS variable |
|---|---|---|
| Background | `Aqua/500` → `--ai-surface-success` | `--ai-surface-success` |
| Height | `h-[24px]` = `--ai-spacing-6` | `--ai-spacing-6` |
| Horizontal padding | `--ai-spacing-3` | `--ai-spacing-3` |
| Border radius | `--ai-radius-full` | `--ai-radius-full` |
| Text color | `--ai-text-invert` | `--ai-text-invert` |
| Font size | `--ai-font-fixed-xxs` | `--ai-font-fixed-xxs` |
| Font weight | `--ai-font-medium` | `--ai-font-medium` |
| Line height | `--ai-leading-1` | `--ai-leading-1` |

## Token Gaps
None — `Aqua/500` is now mapped to `--ai-surface-success` (#30cb90).

## Notes
- Used in VersionHistoryRow Type=Live and Type=Selected & Live variants
- Text content is dynamic (e.g. "Live", "2 minutes ago")
- `--ai-text-invert` is white in light mode; note it flips to near-black in dark mode.
  Since `--ai-surface-success` is theme-invariant (same green in both themes), the
  contrast may need review in dark mode if `--ai-text-invert` is applied. Consider
  hardcoding white if dark-mode contrast is insufficient.
