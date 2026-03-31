# SuggestedQuestion — Figma Notes

**Figma URL:** [node 2139:2674](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2139-2674)

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
| Background | `--ai-surface-contrast` | #F6F6F7 |
| Border radius | `--ai-radius-lg` | 1rem |
| Padding | `--ai-spacing-5` | 1rem |
| Icon-to-text gap | `--ai-spacing-3` | 0.5rem |
| Title-to-subtitle gap | `--ai-spacing-1` | 0.25rem |
| Icon | `message-circle-question` (Lucide) | — |
| Icon size | `--ai-icon-size-md` | 1.25rem (20px) |
| Icon color | `--ai-icon-primary` | #1F2A37 |
| Title font-family | `--ai-font-title` | Inter |
| Title font-weight | `--ai-font-semibold` | 600 |
| Title font-size | `--ai-font-fixed-xs` | 0.875rem |
| Title line-height | `--ai-leading-sm` | 1.25rem |
| Title color | `--ai-text-primary` | #1F2A37 |
| Subtitle font-family | `--ai-font-body` | Inter |
| Subtitle font-weight | `--ai-font-regular` | 400 |
| Subtitle font-size | `--ai-font-fixed-xxs` | 0.75rem |
| Subtitle line-height | `1.5` | — |
| Subtitle color | `--ai-text-contrast` | #6B7280 |

## Layout

- `flex-direction: column` — icon stacked above text group
- Subtitle hidden on mobile (`display: none`), shown on desktop (`display: block` at ≥640px)
- `font-feature-settings: 'dlig' 1` on text elements

## Interaction

- Hover: background transitions to `--ai-surface-minimal`
- Click: populates MessageInput and auto-submits (handled by parent ChatMain JS)
- Transition: `--ai-transition-default` (150ms ease)

## Dependencies

None — leaf component.
