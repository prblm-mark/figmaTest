# Tooltip — Figma Notes

## Figma Node
- File: `8OAAokH2JXhIvGZFrlzeKT`
- Component set: node `68:4490` — [open in Figma](https://www.figma.com/design/8OAAokH2JXhIvGZFrlzeKT/Affino-AI---Design-System?node-id=68-4490)

## Variant Matrix
Single variant — no props.

## Token Mapping

| Property | Figma variable | CSS variable |
|---|---|---|
| Background | `--ai-surface-invert` | `--ai-surface-invert` |
| Border radius | `--ai-radius-lg` | `--ai-radius-lg` |
| Padding | `--ai-spacing-5` | `--ai-spacing-5` |
| Text color | `--ai-text-invert` | `--ai-text-invert` |
| Text font | `--ai-font-body`, `--ai-font-regular`, `--ai-font-fixed-xxs`, `--ai-leading-1` | same |

## Token Gaps

| Property | Value | Resolution |
|---|---|---|
| Width | `351px` | No `--ai-*` token maps to this value. Hardcoded as `width: 351px` with comment. |

## Notes
- `box-shadow: 0 2px 10px rgba(0,0,0,0.15)` is structural CSS — not tokenised.
- The component owns its visual appearance only. Positioning (absolute, top, z-index)
  is the responsibility of the parent that places it (e.g. Header uses `.header .tooltip`).
- Used in: Header (State=Tooltip/Default and State=Info/Mobile variants).
