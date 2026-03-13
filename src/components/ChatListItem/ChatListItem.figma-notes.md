# ChatListItem — Figma Notes

**Figma URL:** [node 2110:3001](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2110-3001)

## Component set

| State | Dark Mode | Node |
|---|---|---|
| Default | False | `2110:3000` |
| Hover | False | `2110:3002` |
| Hover/Menu | False | `2110:3004` |
| Selected | False | `2110:3006` |
| Selected/Hover | False | `2110:3014` |
| Selected/Menu | False | `2110:3016` |
| Default | True | `2110:3008` |
| Hover | True | `2110:3010` |
| Hover/Menu | True | `2110:3018` |
| Selected | True | `2110:3012` |
| Selected/Hover | True | `2110:3020` |
| Selected/Menu | True | `2110:3022` |

Dark Mode is handled by `data-sidebar-theme="light|dark"` (luminance-based) and `data-theme="dark"` (global theme), not a CSS class.

**Figma boolean props:**
- **Pinned:** Shows a 16px pin icon before the text label

## Variant × state matrix

| Base state | Hover | Menu open | Pinned | Dark Mode |
|---|---|---|---|---|
| Default | CSS :hover | JS toggle | Boolean | Both |
| Selected | CSS :hover | JS toggle | Boolean | Both |

## CSS class mapping

| Figma state | CSS class |
|---|---|
| Default | `.chat-list-item` |
| Hover | `:hover` (CSS only) |
| Hover/Menu | `.chat-list-item--menu-open` |
| Selected | `.chat-list-item--selected` |
| Selected/Hover | `.chat-list-item--selected:hover` |
| Selected/Menu | `.chat-list-item--selected.chat-list-item--menu-open` |
| Pinned | `.chat-list-item--pinned` |

## Token mapping

| Property | Token | Value |
|---|---|---|
| Height | `--ai-spacing-7` | 32px |
| Horizontal padding | `--ai-spacing-3` | 8px |
| Internal gap | `--ai-spacing-2` | 6px |
| Border radius | `--ai-radius-md` | 8px |
| Font family | `--ai-font-body` | Inter |
| Font weight | `--ai-font-regular` | 400 |
| Font size | `--ai-font-fixed-xs` | 14px |
| Line height | `--ai-leading-md` | 24px |
| Text color | `var(--ai-chat-sidebar-text)` | Computed — dark on light bg, light on dark bg |
| Selected text | `var(--ai-chat-sidebar-selected-text)` | Computed — 15% darker/lighter for emphasis |
| Default bg | `transparent` | Inherits sidebar bg |
| Hover bg | `var(--ai-chat-sidebar-hover-bg)` | Computed — 8% overlay via `color-mix()` |
| Selected bg | `var(--ai-chat-sidebar-active-bg)` | Computed — 12% overlay via `color-mix()` |
| Fade gradient width | `--ai-spacing-10` | 56px |
| Ellipsis button size | `--ai-spacing-7` | 32px |
| Pin icon size | `--ai-icon-size-sm` | 16px |
| Ellipsis icon size | `--ai-icon-size-sm` | 16px |

## Computed token implementation

The hover and selected backgrounds are **computed tokens** — Figma defines them as `$type: "string"` with behavioral descriptions ("slightly darkened" / "slightly lightened"). CSS `color-mix()` computes the overlay at runtime:

- Light sidebar: 8% / 12% mix with `rgb(38 55 88)` (dark tint, calculated for exact #E5E7EB target at 12%)
- Dark sidebar: 8% / 12% mix with `white` (light tint)

`src/utils/sidebar-colors.js` detects sidebar luminance and sets `data-sidebar-theme="light|dark"` so the correct CSS `color-mix()` rule applies.

## HTML structure

Changed from `<button>` (v1) to `<div>` to support nested interactive elements:

```html
<div class="chat-list-item [--selected] [--pinned] [--menu-open]" tabindex="0">
  <i data-lucide="pin" class="chat-list-item__pin" aria-hidden="true"></i>
  <span class="chat-list-item__text">Chat title</span>
  <div class="chat-list-item__actions">
    <div class="chat-list-item__fade"></div>
    <button class="chat-list-item__menu-btn" aria-label="Chat options" aria-expanded="false">
      <i data-lucide="ellipsis" aria-hidden="true"></i>
    </button>
  </div>
  <div class="chat-menu"><!-- ChatMenu component --></div>
</div>
```

## Interaction model

1. **Hover:** Shows ellipsis button with fade gradient (CSS `:hover`)
2. **Ellipsis click:** Toggles `.chat-list-item--menu-open` + `.chat-menu--open`, updates `aria-expanded`
3. **Menu item click:** Closes menu
4. **Click outside / Escape:** Closes any open menu
5. **Item click (non-button area):** Selects the item (`.chat-list-item--selected`)

## Dependencies

- **ChatMenu** (`src/components/ChatMenu/`) — context menu dropdown
- **sidebar-colors.js** (`src/utils/`) — luminance detection
- **Lucide icons:** `pin`, `ellipsis`

## Transition

Background color: `--ai-transition-default` (150ms ease).
Actions opacity: `--ai-transition-default` (150ms ease).

## Notes

- Pin icon uses `opacity: 0.6` for subtle de-emphasis
- Fade gradient matches the current state bg (hover-bg for default hover, active-bg for selected)
- Ellipsis button bg uses hover-bg (8% overlay) — provides contrast against selected items (12% overlay)
- `overflow: visible` on the item container allows the ChatMenu dropdown to render outside item bounds
- Text truncation moved to `.chat-list-item__text` span (was on the root element in v1)
