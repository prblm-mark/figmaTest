# ChatMenu — Figma Notes

**Figma URL:** [node 2110:3001](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2110-3001) (nested within ChatSidebarItem component set)

## Component set

ChatMenu appears as `data-name="ChatMenu"` inside the ChatSidebarItem Hover/Menu and Selected/Menu variants. It is a context menu dropdown containing 4 action buttons.

## Token mapping

| Property | Token | Value |
|---|---|---|
| Padding | `--ai-spacing-3` | 8px |
| Border radius | `--ai-radius-lg` | 16px |
| Background | `var(--ai-chat-sidebar-bg)` | Base sidebar color (computed) |
| Item font | `--ai-font-body` + `--ai-font-semibold` + `--ai-font-fluid-xxs` | Inter SemiBold 12px |
| Item line-height | `--ai-leading-xs` | 16px |
| Item height | `--ai-spacing-7` | 32px (fixed, no vertical padding) |
| Item padding | `0` v / `--ai-spacing-3` h | 0 / 8px |
| Item border-radius | `--ai-radius-md` | 8px |
| Item gap (icon to text) | `--ai-spacing-3` | 8px |
| Item text color | `var(--ai-chat-sidebar-text)` | Computed (dark on light bg, light on dark bg) |
| Item hover bg | `var(--ai-chat-sidebar-hover-bg)` | Computed 8% overlay |
| Item active bg | `var(--ai-chat-sidebar-active-bg)` | Computed 12% overlay |
| Icon size | `--ai-icon-size-sm` | 16px |

## Token gaps

- **Menu shadow:** No `--ai-shadow-*` tokens exist. Raw values used (same precedent as SystemRole):
  - Light: `0 2px 3px rgba(0, 0, 0, 0.1)`
  - Dark: `0 4px 4px rgba(0, 0, 0, 0.25)`

## CSS class mapping

| Figma state | CSS class |
|---|---|
| Hidden (default) | `.chat-menu` (display: none) |
| Visible | `.chat-menu.chat-menu--open` |
| Menu item | `.chat-menu__item` |

## Menu items

| Label | Lucide icon | Notes |
|---|---|---|
| Save | `bookmark` | Icon name provisional — verify against Figma |
| Copy | `copy` | |
| Copy Link | `link` | |
| Delete | `trash-2` | |

## Dependencies

- Inherits computed sidebar-theme variables from ChatSidebarItem.css `[data-sidebar-theme]` rules
- Requires `initSidebarTheme()` from `src/utils/sidebar-colors.js` on the sidebar container

## Notes

- Menu bg uses base sidebar color (`--ai-chat-sidebar-bg`) — shadow provides visual separation
- Menu items use sidebar-computed colors instead of `btn--tertiary` tokens, because tertiary tokens flip with the global theme and would mismatch the sidebar context
- Positioned absolutely relative to the parent ChatSidebarItem (`top: --ai-spacing-6, right: 0`)
- Menu width is content-driven (`min-width: max-content`) — Figma shows 122px which is the natural content width
