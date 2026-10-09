# SuggestedQuestion — Figma Notes

**Figma URL:** [node 2139:2674](https://www.figma.com/design/Ikv8jxb5dcRH8ff4q4dR11/Affino-AI---AI-Chat?node-id=2-64)

## Variant Matrix

| Node | Type | Notes |
|---|---|---|
| `2139:2673` | Default | Mobile — icon on top, title only (no subtitle) |
| `2139:2833` | Desktop | Icon on top, title + subtitle visible |

**Key difference:** Type=Desktop adds a subtitle line below the title. Both share the same flex-col layout with icon stacked above the text group.

## CSS Class Mapping

| Element | CSS class |
|---|---|
| Card button | `.suggested-question` |
| Text group | `.suggested-question__body` |
| Title text | `.suggested-question__text` |
| Subtitle text | `.suggested-question__subtext` |

## Token Mapping

| Property | Token | Value |
|---|---|---|
| Background | `--ao-surface-contrast` | #F6F6F7 |
| Border radius | `--ao-radius-lg` | 1rem |
| Padding | `--ao-spacing-5` | 1rem |
| Icon-to-text gap | `--ao-spacing-3` | 0.5rem |
| Title-to-subtitle gap | `--ao-spacing-1` | 0.25rem |
| Icon | `message-circle-question` (Lucide) | — |
| Icon size | `--ao-icon-size-md` | 1.25rem (20px) |
| Icon color | `--ao-icon-primary` | #1F2A37 |
| Title font-family | `--ao-font-title` | Inter |
| Title font-weight | `--ao-font-semibold` | 600 |
| Title font-size | `--ao-font-fixed-xs` | 0.875rem |
| Title line-height | `--ao-leading-sm` | 1.25rem |
| Title color | `--ao-text-primary` | #1F2A37 |
| Subtitle font-family | `--ao-font-body` | Inter |
| Subtitle font-weight | `--ao-font-regular` | 400 |
| Subtitle font-size | `--ao-font-fixed-xxs` | 0.75rem |
| Subtitle line-height | `1.5` | — |
| Subtitle color | `--ao-text-contrast` | #6B7280 |

## Layout

- `flex-direction: column` — icon stacked above text group
- Subtitle hidden on mobile (`display: none`), shown on desktop (`display: block` at ≥640px)
- `font-feature-settings: 'dlig' 1` on text elements

## Interaction

- Hover: background transitions to `--ao-surface-minimal`
- Click: populates MessageInput and auto-submits (handled by parent ChatMain JS)
- Transition: `--ao-transition-default` (150ms ease)

## Dependencies

None — leaf component.
