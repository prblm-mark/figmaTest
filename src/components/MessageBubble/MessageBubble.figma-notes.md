# MessageBubble — Figma Notes

**Figma URL:** [node 2126:4901](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2126-4901)

## Component Set

MessageBubble is a component-tier element. It is the user's question bubble in the chat UI — right-aligned with a tinted background and hover action buttons.

## Variant Matrix

| Node | State | Notes |
|---|---|---|
| `2126:4900` | Default | Right-aligned bubble with message text |
| `2126:4905` | Hover | Same bubble + copy/link action buttons below-right |

## CSS Class Mapping

| Figma property | CSS class |
|---|---|
| State=Default | `.msg-bubble` (base) |
| State=Hover | `.msg-bubble:hover .msg-bubble__actions` (display: flex) |

## Token Mapping

| Property | Token | Value |
|---|---|---|
| Bubble bg | `--ai-chat-msg-bg` | #f0f3ff (Blue/FB/50) |
| Bubble text | `--ai-chat-msg-text` | #0f406b (Blue/FB/900) |
| Bubble padding | `--ai-spacing-4` | 12px |
| Bubble radius | `--ai-radius-md` | 8px |
| Left offset (push right) | `--ai-spacing-11` | 64px |
| Font family | `--ai-font-body` | Inter |
| Font weight | `--ai-font-medium` | 500 |
| Font size | `--ai-font-fixed-sm` | 16px |
| Line height | `--ai-leading-md` | 24px |
| Text feature | `font-feature-settings: 'case' 1` | OpenType case forms |
| Action buttons gap from bubble | `--ai-spacing-2` | 6px (margin-top below bubble) |

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

- Action buttons are absolutely positioned below the bubble (top: 100%, right: 0) and appear on hover
- Figma positions actions at fixed `left: 655px; bottom: -37px` but this is variant-specific — CSS uses relative positioning from the bubble
- `font-feature-settings: 'case' 1` on bubble text matches the chat UI convention
