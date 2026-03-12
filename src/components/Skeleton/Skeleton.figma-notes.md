# Skeleton — Figma Notes

**Figma URL:** [node 2077:1526](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2077-1526)

## Component set

Single variant — loading placeholder with 5 lines.

## Property mapping

| Figma property | CSS token | Value |
|---|---|---|
| Container direction | flex column | — |
| Line gap | `--ai-spacing-4` | 12px |
| Line height | `1rem` | 16px |
| Line border-radius | `--ai-radius-sm` | 4px |
| Shimmer base color | `--ai-chat-card-bg` | #f3f4f6 / #111928 |
| Shimmer highlight | `--ai-chat-input` | #ffffff / #374151 |

## Line widths

| Line | Width |
|---|---|
| 1 | 100% |
| 2 | 50% |
| 3 | 84% |
| 4 | 73% |
| 5 | 36% |

## Animation

CSS `@keyframes skeleton-shimmer` — 1.4s linear infinite.
Stagger: 0.1s delay per line (0s, 0.1s, 0.2s, 0.3s, 0.4s).
Activated by `.skeleton--active` class.
