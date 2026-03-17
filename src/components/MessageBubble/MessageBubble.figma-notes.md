# MessageBubble — Figma Notes

**Figma URL:** [node 2126:4901](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2126-4901)

## Component Set

MessageBubble is a component-tier element. It is the user's question bubble in the chat UI — right-aligned with a tinted background and hover action buttons.

## Variant Matrix

| Node | State | Type | Notes |
|---|---|---|---|
| `2126:4900` | Default | Default (mobile) | Smaller left padding, smaller font |
| `2137:2657` | Default | Desktop | Larger left padding, larger font |
| `2126:4905` | Hover | Default (mobile) | + copy/link action buttons |
| `2137:2660` | Hover | Desktop | + copy/link action buttons |

## CSS Class Mapping

| Figma property | CSS class |
|---|---|
| Type=Default (mobile) | `.msg-bubble` (base) |
| Type=Desktop | `@media (min-width: 640px)` |
| State=Default | `.msg-bubble` (base) |
| State=Hover | `.msg-bubble:hover .msg-bubble__actions` (display: flex) |

## Token Mapping

| Property | Token (mobile) | Token (desktop) |
|---|---|---|
| Left offset (push right) | `--ai-spacing-8` (40px) | `--ai-spacing-11` (64px) |
| Font size | `--ai-font-fixed-xs` (14px) | `--ai-font-fixed-sm` (16px) |
| Bubble bg | `--ai-chat-msg-bg` | same |
| Bubble text | `--ai-chat-msg-text` | same |
| Bubble padding | `--ai-spacing-4` (12px) | same |
| Bubble radius | `--ai-radius-md` (8px) | same |
| Font family | `--ai-font-body` | same |
| Font weight | `--ai-font-medium` (500) | same |
| Line height | `--ai-leading-md` (24px) | same |
| Text feature | `'case' 1` | same |
| Action buttons gap | `--ai-spacing-2` (6px) | same |

## Token Gaps

None — all values map to existing `--ai-*` tokens.

## Icons

| Element | Lucide name |
|---|---|
| Copy button | `copy` |
| Link button | `link` |

## Dependencies

- Composes **Button** (`src/components/Button/Button.css`) — tertiary sm icon-only for action buttons

## Notes

- Mobile-first: base styles use Type=Default values, `@media (min-width: 640px)` applies Desktop values
- Action buttons are absolutely positioned below the bubble (top: 100%, right: 0) and appear on hover
- `font-feature-settings: 'case' 1` on bubble text matches the chat UI convention
