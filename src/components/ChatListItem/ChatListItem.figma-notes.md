# ChatListItem — Figma Notes

**Figma URL:** [node 2110:3000](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2110-3000)

## Component set

| State | Dark Mode | Node |
|---|---|---|
| Default | False | `2110:3000` |
| Hover | False | `2110:3002` |
| Selected | False | `2110:3006` |
| Default | True | `2110:3008` |
| Hover | True | `2110:3010` |
| Selected | True | `2110:3012` |

Dark Mode is handled by `data-theme="dark"` (existing system), not a CSS class.

## Property mapping

| Figma property | CSS token | Value |
|---|---|---|
| Height | `--ai-spacing-7` | 32px |
| Horizontal padding | `--ai-spacing-3` | 8px |
| Border radius | `--ai-radius-md` | 8px |
| Font family | `--ai-font-body` | Inter |
| Font weight | `--ai-font-regular` | 400 |
| Font size | `--ai-font-fixed-xs` | 14px |
| Line height | `--ai-leading-md` | 24px |
| Text color | `--ai-chat-sidebar-text` | inherits from sidebar |
| Default bg | transparent | inherits sidebar bg |
| Hover bg | `--ai-chat-sidebar-hover-bg` | computed — 8% overlay via `color-mix()` |
| Selected bg | `--ai-chat-sidebar-active-bg` | computed — 16% overlay via `color-mix()` |

## Computed token implementation

The hover and selected backgrounds are **computed tokens** — Figma defines them as `$type: "string"` with behavioral descriptions ("slightly darkened" / "slightly lightened"). CSS `color-mix()` computes the overlay at runtime:

- Light sidebar: 8% / 16% mix with `rgb(31 42 55)` (dark tint)
- Dark sidebar: 8% / 16% mix with `white` (light tint)

`src/utils/sidebar-colors.js` detects sidebar luminance and sets `data-sidebar-theme="light|dark"` so the correct CSS `color-mix()` rule applies.

## Transition

Background color: `--ai-transition-default` (150ms ease).
