# SourcesLink — Figma Notes

## Figma URL

[SourceLink component set](https://www.figma.com/design/Ikv8jxb5dcRH8ff4q4dR11/Affino-AI---AI-Chat?node-id=2-80)

## Variant Matrix

| Type | Icon | Figma node |
|---|---|---|
| Primary | `file-text` | 2133:2734 |
| Link | `link` | 2156:3140 |

## Property Mapping

| Figma property | CSS token / technique |
|---|---|
| Background (Primary) | `color-mix(in srgb, var(--ao-chat-brand) 8%, var(--ao-surface-primary))` |
| Border (Primary) | `color-mix(in srgb, var(--ao-chat-brand) 30%, var(--ao-surface-primary))` |
| Text (Primary) | `var(--ao-chat-brand)` — adjusted via `data-brand-theme` for readability |
| Background (Link) | `--ao-surface-contrast` |
| Border (Link) | `--ao-border-secondary` |
| Text (Link) | `--ao-text-primary` |
| Border radius | `--ao-radius-full` |
| Padding | `--ao-spacing-3` (vertical) `--ao-spacing-5` (horizontal) |
| Gap | `--ao-spacing-3` |
| Max width | `12rem` (192px) |
| Font | `--ao-font-title`, `--ao-font-medium`, `--ao-font-fixed-xxs` (12px) |
| Line height | `--ao-leading-xs` |
| Icon size | `--ao-icon-size-sm` (16px) |

## Dynamic Brand Color

The Primary variant derives all colors from `--ao-chat-brand` using `color-mix()`.
Brand luminance is detected at runtime by `src/utils/brand-colors.js`, which sets
`data-brand-theme="light|dark"` on the container element. This allows the component
to adapt text readability for any arbitrary brand color in both light and dark themes.

### Computed variables (set by `[data-brand-theme]` CSS blocks)

| Variable | Dark brand | Light brand |
|---|---|---|
| `--_brand-text` | `var(--ao-chat-brand)` | `color-mix(brand 50%, black)` |
| `--_brand-bg` | `color-mix(brand 8%, surface)` | `color-mix(brand 15%, surface)` |
| `--_brand-border` | `color-mix(brand 30%, surface)` | `var(--ao-chat-brand)` |

Dark mode override: dark brand text lightened to `color-mix(brand 60%, white)` for contrast.

## Hover states

- Primary: bg intensity increases (8%→15% / 15%→25%), border strengthens
- Link: bg → `--ao-surface-secondary`, border → `--ao-border-brand`, text → `--ao-surface-brand`
- Transition: `--ao-transition-default` (150ms ease)
