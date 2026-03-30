# SourcesLink — Figma Notes

## Figma URL

[SourceLink component set](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2133-2733)

## Variant Matrix

| Type | Icon | Figma node |
|---|---|---|
| Primary | `file-text` | 2133:2734 |
| Link | `link` | 2156:3140 |

## Property Mapping

| Figma property | CSS token / technique |
|---|---|
| Background (Primary) | `color-mix(in srgb, var(--ai-chat-brand) 8%, var(--ai-chat-surface-primary))` |
| Border (Primary) | `color-mix(in srgb, var(--ai-chat-brand) 30%, var(--ai-chat-surface-primary))` |
| Text (Primary) | `var(--ai-chat-brand)` — adjusted via `data-brand-theme` for readability |
| Background (Link) | `--ai-chat-surface-contrast` |
| Border (Link) | `--ai-border-secondary` |
| Text (Link) | `--ai-text-primary` |
| Border radius | `--ai-radius-full` |
| Padding | `--ai-spacing-3` (vertical) `--ai-spacing-5` (horizontal) |
| Gap | `--ai-spacing-3` |
| Max width | `12rem` (192px) |
| Font | `--ai-font-title`, `--ai-font-medium`, `--ai-font-fixed-xxs` (12px) |
| Line height | `--ai-leading-xs` |
| Icon size | `--ai-icon-size-sm` (16px) |

## Dynamic Brand Color

The Primary variant derives all colors from `--ai-chat-brand` using `color-mix()`.
Brand luminance is detected at runtime by `src/utils/brand-colors.js`, which sets
`data-brand-theme="light|dark"` on the container element. This allows the component
to adapt text readability for any arbitrary brand color in both light and dark themes.

### Computed variables (set by `[data-brand-theme]` CSS blocks)

| Variable | Dark brand | Light brand |
|---|---|---|
| `--_brand-text` | `var(--ai-chat-brand)` | `color-mix(brand 50%, black)` |
| `--_brand-bg` | `color-mix(brand 8%, surface)` | `color-mix(brand 15%, surface)` |
| `--_brand-border` | `color-mix(brand 30%, surface)` | `var(--ai-chat-brand)` |

Dark mode override: dark brand text lightened to `color-mix(brand 60%, white)` for contrast.

## Hover states

- Primary: bg intensity increases (8%→15% / 15%→25%), border strengthens
- Link: bg → `--ai-surface-secondary`, border → `--ai-border-brand`, text → `--ai-surface-brand`
- Transition: `--ai-transition-default` (150ms ease)
