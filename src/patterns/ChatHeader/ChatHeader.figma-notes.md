# ChatHeader — Figma Notes

**Figma URL:** [node 2124:3686](https://www.figma.com/design/Ikv8jxb5dcRH8ff4q4dR11/Affino-AI---AI-Chat?node-id=2-2182)

## Component Set

ChatHeader is a pattern-tier component. It is the top header bar of the chat UI, containing a sidebar toggle button, an assistant selector dropdown, and optional admin action buttons or window control buttons.

## Variant Matrix

| Node | Type | State | Options | Notes |
|---|---|---|---|---|
| `2124:4115` | Default | Default | Center | Admin hidden (opacity-0) |
| `2124:3685` | Default | Dropdown | Center | Dropdown menu visible |
| `2124:3687` | Default | Admin View | Center | Admin buttons visible |
| `2124:3723` | Default | Debug On | Center | Identical to Admin View |
| `2124:3761` | Default | Cache Off | Center | Identical to Admin View |
| `2124:3801` | Default | Style | Center | Identical to Admin View |
| `2124:3850` | Default | System Role | Center | Identical to Admin View |
| `2124:4225` | Default | Default | Alignment Left | Selector text left-aligned |
| `2124:4261` | Default | Default | No Border | No bottom border, padding `--ao-spacing-6` |
| `2124:3898` | Minimised | Default | Center | Window buttons (maximize + close) |
| `2124:4162` | Minimised | Dropdown | Center | Dropdown visible + window buttons |
| `2124:3975` | Mobile | Default | Center | Close button only |
| `2124:4195` | Mobile | Dropdown | Center | Dropdown visible + close button |

## CSS Class Mapping

| Figma property | CSS class |
|---|---|
| Type=Default | `.chat-header` (base) |
| Type=Minimised | `.chat-header--minimised` |
| Type=Mobile | `.chat-header--mobile` (close button only, no maximize) |
| Options=Center | default (base) |
| Options=Alignment Left | `.chat-header--align-left` |
| Options=No Border | `.chat-header--no-border` |
| State=Default (admin hidden) | `.chat-header__admin` (display: none) |
| State=Admin View | `.chat-header__admin--visible` |
| State=Dropdown | `.chat-header__dropdown--open` |
| Admin toggle active | `.btn[aria-pressed="true"]` |

## Token Mapping

| Property | Token | Value |
|---|---|---|
| Header padding | `--ao-spacing-4` | 12px |
| Header border-bottom | `1px solid var(--ao-border-contrast)` | #d1d5db |
| Container gap | `--ao-spacing-3` | 8px |
| Selector height | `--ao-spacing-7` | 32px |
| Selector bg | `--ao-surface-primary` | white |
| Selector border | `--ao-border-secondary` | #d1d5db |
| Selector radius | `--ao-radius-md` | 8px |
| Selector text padding | `--ao-spacing-4` | 12px |
| Selector font | `--ao-font-body` + `--ao-font-medium` + `--ao-font-fixed-xxs` | Inter Medium 12px |
| Selector line-height | `--ao-leading-xs` | 16px |
| Selector letter-spacing | `--ao-tracking-5` | 0.0125em (Figma: 0.12px at 12px) |
| Selector text color | `--ao-text-primary` | #1f2a37 |
| Selector text feature | `font-feature-settings: 'case' 1` | OpenType case-sensitive forms |
| Chevron trigger width | `--ao-spacing-7` | 32px |
| Chevron divider | `border-left: 1px solid var(--ao-border-secondary)` | |
| Chevron icon | `--ao-icon-size-sm` | 16px |
| Selector wrap padding-right | `--ao-spacing-8` | 40px (space for right-side buttons) |
| Admin actions gap | `--ao-spacing-3` | 8px |
| Dropdown bg | `--ao-surface-primary` | white |
| Dropdown border | `--ao-border-secondary` | #d1d5db |
| Dropdown radius | `--ao-radius-md` | 8px |
| Dropdown item padding | `--ao-spacing-4` | 12px |
| Dropdown selected bg | `--ao-surface-minimal` | #f3f4f6 |
| No Border padding | `--ao-spacing-6` | 24px |
| Window buttons padding | `--ao-spacing-4` | 12px |

## Token Gaps

- **Letter-spacing:** Figma value is `0.12px` (1% of 12px font). Mapped to `--ao-tracking-5` (`0.0125em` = 0.15px at 12px). Sub-pixel difference approved.

## Icons

| Element | Figma icon | Lucide name |
|---|---|---|
| Sidebar toggle | `Icon/20px/PanelLeft` | `panel-left` |
| Selector chevron | `Icon/16px/ChevronDown` | `chevron-down` |
| Debug button | `Icon/20px/Bug` | `bug` |
| Cache button | `Icon/20px/DatabaseZap` | `database-zap` |
| Style button | `Icon/16px/SwatchBook` | `swatch-book` |
| System Role button | `Icon/16px/Settings` | `settings` |
| Maximize button | `Icon/20px/Maximise` | `maximize` |
| Close button | `Icon/20px/X` | `x` |

## Admin Actions

4 independent toggle buttons, permanently visible when admin mode is enabled (backend setting). Each toggles independently via `aria-pressed`. Active state uses `--ao-surface-minimal` bg.

| Button | Type | Label |
|---|---|---|
| Debug | `btn--secondary btn--sm btn--icon` | icon only |
| Cache | `btn--secondary btn--sm btn--icon` | icon only |
| Style | `btn--secondary btn--sm` | icon + text |
| System Role | `btn--secondary btn--sm` | icon + text |

## Dependencies

- Composes **Button** (`src/components/Button/Button.css`)
- Lucide icons: `panel-left`, `chevron-down`, `bug`, `database-zap`, `swatch-book`, `settings`, `maximize`, `x`

## Notes

- Selector is a custom dropdown (not native `<select>`), using `<button>` with `aria-haspopup="listbox"` for accessibility
- Dropdown positioned absolute relative to `.chat-header__selector-group`
- Admin actions use absolute positioning (right side of header)
- Debug On / Cache Off / Style / System Role Figma variants are visually identical to Admin View — the toggle state shows no visual change in Figma static frames
- `font-feature-settings: 'case' 1` applied to selector text, dropdown items, and admin button labels
- Type=Mobile implemented via `.chat-header--mobile` modifier — shows window buttons with only close (no maximize)
- Transition: `--ao-transition-default` (150ms ease) on selector border-color and dropdown item bg
