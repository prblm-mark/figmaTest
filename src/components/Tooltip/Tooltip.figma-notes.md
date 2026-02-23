# Tooltip — Figma Notes

## Figma Node
- File: `8OAAokH2JXhIvGZFrlzeKT`
- Component set: node `68:4490` — [open in Figma](https://www.figma.com/design/8OAAokH2JXhIvGZFrlzeKT/Affino-AI---Design-System?node-id=68-4490)

## Variant Matrix
Single variant — no props.

## Token Mapping

| Property | Figma variable | CSS value |
|---|---|---|
| Background | `Neutral/950` | `#0c121c` — approved primitive |
| Border radius | `--ai-radius-lg` | `var(--ai-radius-lg)` |
| Padding | `--ai-spacing-5` | `var(--ai-spacing-5)` |
| Text color | `Neutral/0` | `#ffffff` — approved primitive |
| Text font | `--ai-font-body`, `--ai-font-regular`, `--ai-font-fixed-xxs`, `--ai-leading-1` | same |

## Token Gaps / Approved Primitives

| Property | Value | Resolution |
|---|---|---|
| Width | `351px` | No `--ai-*` token. Hardcoded as `width: 351px` with comment. |
| Background color | `Neutral/950` = `#0c121c` | No semantic token exists. Approved primitive — tooltip is intentionally a fixed dark panel in both light and dark themes. |
| Text color | `Neutral/0` = `#ffffff` | No semantic token used here. Approved primitive — always white on the dark panel regardless of theme. |
| Box shadow | `rgba(0,0,0,0.15)` | No `--ai-shadow-*` token exists. Approved primitive — black shadow is visually appropriate on both themes. |

## Notes
- **Theme behaviour:** The tooltip background is intentionally fixed dark (`#0c121c`) in both
  light and dark themes. It does NOT invert — it is always a dark floating panel.
- The component owns its visual appearance only. Positioning (absolute, top, z-index)
  is the responsibility of the parent that places it (e.g. Header uses `.header .tooltip`).
- Used in: Header (State=Tooltip/Default and State=Info/Mobile variants).
