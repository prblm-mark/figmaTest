# ChatSidebarItem — Figma Notes

**Figma URL:** [node 2110:3001](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2110-3001)

## Component set

Renamed from ChatListItem. Two types: Thread (chat history items with menu) and Action (icon + label buttons).

### Type=Thread variants

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

### Type=Action variants

| State | Dark Mode | Node |
|---|---|---|
| Default | False | `2110:3024` |
| Hover | False | `2110:3026` |
| Selected | False | `2110:3028` |

Dark Mode is handled by `data-sidebar-theme="light|dark"` (luminance-based), not separate CSS variants.

**Figma boolean props (Thread only):**
- **Pinned:** Shows a 16px pin icon before the text label

## Variant × state matrix

| Type | Base state | Hover | Menu open | Pinned | Dark Mode |
|---|---|---|---|---|---|
| Thread | Default | CSS :hover | JS toggle | Boolean | Both |
| Thread | Selected | CSS :hover | JS toggle | Boolean | Both |
| Action | Default | CSS :hover | — | — | Both |
| Action | Selected | CSS :hover | — | — | Both |

## CSS class mapping

| Figma state | CSS class |
|---|---|
| Thread Default | `.chat-sidebar-item` |
| Thread Hover | `:hover` (CSS only) |
| Thread Hover/Menu | `.chat-sidebar-item--menu-open` |
| Thread Selected | `.chat-sidebar-item--selected` |
| Thread Selected/Hover | `.chat-sidebar-item--selected:hover` |
| Thread Selected/Menu | `.chat-sidebar-item--selected.chat-sidebar-item--menu-open` |
| Thread Pinned | `.chat-sidebar-item--pinned` |
| Action Default | `.chat-sidebar-item.chat-sidebar-item--action` |
| Action Hover | `.chat-sidebar-item--action:hover` |
| Action Selected | `.chat-sidebar-item--action.chat-sidebar-item--selected` |

## Token mapping

### Type=Thread tokens

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
| Text color | `var(--ai-chat-sidebar-text)` | Computed |
| Selected text | `var(--ai-chat-sidebar-selected-text)` | Computed — 15% darker/lighter |
| Default bg | `transparent` | Inherits sidebar bg |
| Hover bg | `var(--ai-chat-sidebar-hover-bg)` | Computed — 8% overlay |
| Selected bg | `var(--ai-chat-sidebar-active-bg)` | Computed — 12% overlay |
| Fade gradient width | `--ai-spacing-10` | 56px |
| Ellipsis button size | `--ai-spacing-7` | 32px |
| Pin icon size | `--ai-icon-size-sm` | 16px |
| Ellipsis icon size | `--ai-icon-size-sm` | 16px |

### Type=Action tokens

| Property | Token | Value |
|---|---|---|
| Height | `--ai-spacing-7` | 32px |
| Horizontal padding | `--ai-spacing-4` | 12px |
| Internal gap | `--ai-spacing-3` | 8px |
| Border radius | `--ai-radius-md` | 8px |
| Font family | `--ai-font-body` | Inter |
| Font weight | `--ai-font-semibold` | 600 |
| Font size | `--ai-font-fluid-xxs` | 12px |
| Line height | `--ai-leading-xs` | 16px |
| Icon | `message-square` (Lucide) | 16px (`--ai-icon-size-sm`) |
| Text color | `var(--ai-chat-sidebar-text)` | Computed |
| Default bg | `transparent` (`--ai-chat-sidebar-bg`) | Base sidebar color |
| Hover bg | `var(--ai-chat-sidebar-hover-bg)` | Computed — 8% overlay |
| Selected bg | `var(--ai-chat-sidebar-active-bg)` | Computed — 12% overlay |
| Text content | "New Chat" | From Figma |

## Computed token implementation

The hover and selected backgrounds are **computed tokens** — Figma defines them as `$type: "string"` with behavioral descriptions. CSS `color-mix()` computes the overlay at runtime:

- Light sidebar: 8% / 12% mix with `rgb(38 55 88)` (dark tint)
- Dark sidebar: 8% / 12% mix with `white` (light tint)

`src/utils/sidebar-colors.js` detects sidebar luminance and sets `data-sidebar-theme="light|dark"`.

## HTML structure

### Type=Thread
```html
<div class="chat-sidebar-item [--selected] [--pinned] [--menu-open]" tabindex="0">
  <i data-lucide="pin" class="chat-sidebar-item__pin" aria-hidden="true"></i>
  <span class="chat-sidebar-item__text">Chat title</span>
  <div class="chat-sidebar-item__actions">
    <div class="chat-sidebar-item__fade"></div>
    <button class="chat-sidebar-item__menu-btn" aria-label="Chat options" aria-expanded="false">
      <i data-lucide="ellipsis" aria-hidden="true"></i>
    </button>
  </div>
  <div class="chat-menu"><!-- ChatMenu component --></div>
</div>
```

### Type=Action
```html
<div class="chat-sidebar-item chat-sidebar-item--action [--selected]" tabindex="0">
  <i data-lucide="message-square" class="chat-sidebar-item__icon" aria-hidden="true"></i>
  <span class="chat-sidebar-item__text">New Chat</span>
</div>
```

## Interaction model

### Thread type
1. **Hover:** Shows ellipsis button with fade gradient (CSS `:hover`)
2. **Ellipsis click:** Toggles `.chat-sidebar-item--menu-open` + `.chat-menu--open`, updates `aria-expanded`
3. **Menu item click:** Closes menu
4. **Click outside / Escape:** Closes any open menu
5. **Item click (non-button area):** Selects the item

### Action type
1. **Hover:** Background changes to hover-bg (CSS `:hover`)
2. **Click:** Triggers the action (e.g. new chat)

## Dependencies

- **ChatMenu** (`src/components/ChatMenu/`) — context menu dropdown (Thread type only)
- **sidebar-colors.js** (`src/utils/`) — luminance detection
- **Lucide icons:** `pin`, `ellipsis` (Thread); `message-square` (Action)

## Transition

Background color: `--ai-transition-default` (150ms ease).
Actions opacity: `--ai-transition-default` (150ms ease).

## Notes

- Renamed from ChatListItem (Mar 2026)
- Pin icon uses `opacity: 0.6` for subtle de-emphasis
- Fade gradient matches the current state bg
- Ellipsis button bg uses hover-bg (8% overlay)
- `overflow: visible` on container allows ChatMenu dropdown to render outside bounds
- Action type has no ellipsis, no fade, no pin, no menu — simpler structure
- Action type uses `button/sm` typography (semibold 12px) vs Thread's regular 14px
