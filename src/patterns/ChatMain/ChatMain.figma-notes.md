# ChatMain — Figma Notes

**Figma URL:** [node 2061:5762](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2061-5762)

## Component Structure

ChatMain is a pattern-tier component. It is the main chat content area containing a user message bubble, an AI response block, a fade gradient overlay, and a sticky MessageInput at the bottom.

| Node | Element | Notes |
|---|---|---|
| `2061:5762` | Main | Outer wrapper, fills parent, flex column centered |
| `2061:5763` | Container | Max-width 768px, padded, scrollable content |
| `2126:4958` | Message Bubble | User question (existing component) |
| `2061:5767` | Response | AI response prose block |
| `2061:5769` | Fade | Gradient overlay above input |
| `2061:5770` | Container (input) | Sticky MessageInput wrapper |
| `2133:2747` | MessageInput | Chat input bar (existing pattern) |

## CSS Class Mapping

| Element | CSS class |
|---|---|
| Outer wrapper | `.chat-main` |
| Scrollable area | `.chat-main__scroll` |
| Content container | `.chat-main__container` |
| AI response text | `.chat-main__response` |
| Footer (fade + input) | `.chat-main__footer` |
| Fade gradient | `.chat-main__fade` |
| Input wrapper | `.chat-main__input` |

## Token Mapping

| Property | Token | Value |
|---|---|---|
| Background | `--ai-chat-surface-primary` | #ffffff |
| Container max-width | `--ai-size-11` | 768px |
| Container padding (vertical) | `--ai-spacing-8` | 40px |
| Container padding (horizontal) | `--ai-spacing-6` | 24px |
| Container gap | `--ai-spacing-9` | 48px |
| Response font-family | `--ai-font-body` | Inter |
| Response font-weight | `--ai-font-regular` | 400 |
| Response font-size | `--ai-font-fluid-sm` | 16px (responsive) |
| Response line-height | `--ai-leading-md` | 24px |
| Response text color | `--ai-text-primary` | #1f2a37 |
| Response bold weight | `--ai-font-medium` | 500 |
| Response font-feature | `'case' 1` | OpenType |
| List item spacing | `--ai-spacing-3` | 8px |
| List padding-left | `--ai-spacing-6` | 24px |
| Paragraph spacing | `--ai-leading-md` | 24px (= 1 line height) |
| Fade height | `--ai-size-2` | 160px |
| Fade gradient | `--ai-gradient-chat-surface-primary` | to bottom, transparent → full |
| Input wrapper padding (h) | `--ai-spacing-6` | 24px |
| Input wrapper bg | `--ai-chat-surface-primary` | #ffffff |

## Token Gaps

| Property | Figma value | Resolution |
|---|---|---|
| Fade height | 163px | Approved: use `--ai-size-2` (160px) — closest token |

## Dependencies

- Composes **MessageBubble** (`src/components/MessageBubble/MessageBubble.css`)
- Composes **MessageInput** (`src/patterns/MessageInput/MessageInput.css`) — includes Button, Tooltip
- Composes **Button** (`src/components/Button/Button.css`)
- Composes **Tooltip** (`src/components/Tooltip/Tooltip.css`)

## Notes

- Scroll area fills available height; MessageInput sticks to bottom via `position: sticky`
- Fade gradient uses new `--ai-gradient-chat-surface-primary` token (vertical, `to bottom`) added to `css/tokens-gradients.css`
- Response text uses `--ai-font-fluid-sm` (responsive) — scales down at mobile breakpoint automatically
- The pattern grows to fill available width (sits alongside ChatSidebar or full viewport when sidebar closed)
- Message Bubble right-aligned with `--ai-spacing-11` (64px) left padding
- `font-feature-settings: 'case' 1` on response text matches Figma
