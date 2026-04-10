# MessageInput — Figma Notes

**Figma URL:** [node 2126:5007](https://www.figma.com/design/Ikv8jxb5dcRH8ff4q4dR11/Affino-AI---AI-Chat?node-id=2-617)

## Component Set

MessageInput is a pattern-tier component. It is the chat input bar containing a textarea, a filter button with duration popover, a send button, a disclaimer link, and optional tooltips.

## Variant Matrix

| Node | Type | State | Notes |
|---|---|---|---|
| `2126:5022` | Desktop | Default | Placeholder + disabled send button |
| `2128:5300` | Desktop | Active | Enabled send button (JS: input change) |
| `2126:5070` | Desktop | Data Tooltip | Tooltip on disclaimer "How we collect data" |
| `2126:5141` | Desktop | Recent Content Tooltip | Tooltip on filter button |
| `2126:5198` | Desktop | Duration Filter | Filter popover open with 3 options |
| `2126:5006` | Mobile | Default | Smaller padding, NO send button |
| `2128:5282` | Mobile | Active | Both buttons visible |
| `2126:5056` | Minimised | Default | Same sizing as mobile, both buttons visible |

## CSS Class Mapping

| Figma property | CSS class |
|---|---|
| Type=Desktop | `.msg-input` (base) |
| Type=Mobile | `@media (max-width: 767px)` |
| Type=Minimised | `[data-layout="minimised"]` |
| State=Default | `.msg-input` (base) |
| State=Active | `.msg-input--active` (JS adds on input) |
| State=Duration Filter | `.msg-input__filter-popover--open` |
| State=Data Tooltip | `.msg-input__tooltip--data` (positioned via CSS) |
| State=Recent Content Tooltip | `.msg-input__tooltip--filter` (positioned via CSS) |
| Send disabled | `.msg-input__send-btn[disabled]` |

## Token Mapping

| Property | Token | Value |
|---|---|---|
| Input box bg | `--ai-surface-secondary` | #ffffff |
| Input box border | `--ai-border-secondary` | #d1d5db |
| Input box padding (desktop) | `--ai-spacing-6` | 24px |
| Input box padding (mobile/min) | `--ai-spacing-5` | 16px |
| Input box gap | `--ai-spacing-5` | 16px |
| Input box radius | `--ai-radius-lg` | 16px |
| Input box shadow | `--ai-shadow-md` | 0 2px 10px rgba(0,0,0,0.1) |
| Input box max-width | `--ai-size-11` | 768px |
| Placeholder color | `--ai-text-contrast` | #6b7280 |
| Placeholder font (desktop) | `--ai-font-fixed-sm` | 16px |
| Placeholder font (mobile/min) | `--ai-font-fluid-sm` | responsive |
| Placeholder font-feature | `'ss04' 1, 'cv01' 1, 'calt' 0, 'kern' 0` | OpenType |
| Send btn disabled bg | `--ai-btn-bg-disabled` | #d1d5db |
| Send btn disabled opacity | `0.8` | 80% (raw, approved) |
| Send btn active bg | `--ai-btn-primary-bg` | #0071d8 |
| Filter container radius | `--ai-radius-md` | 8px |
| Disclaimer font | `--ai-font-fixed-xxs` | 12px |
| Disclaimer line-height | `--ai-leading-xs` | 16px |
| Disclaimer color | `--ai-text-contrast` | #6b7280 |
| Disclaimer tracking | `--ai-tracking-5` | 0.0125em |
| Disclaimer feature | `'case' 1` | OpenType |
| Disclaimer padding | `--ai-spacing-3` v / `--ai-spacing-6` h | 8px / 24px |
| Filter popover bg | `--ai-surface-secondary` | #ffffff |
| Filter popover border | `--ai-border-secondary` | #d1d5db |
| Filter popover radius | `--ai-radius-md` | 8px |
| Filter popover shadow | `--ai-shadow-lg` | card elevation |
| Filter popover width | `--ai-size-1` | 128px (Figma: 120px, rounded to closest token) |
| Filter popover padding | `1px` | thin inner border effect |
| Filter item min-height | `--ai-spacing-7` | 32px (Figma: 35px, rounded to closest token) |
| Filter item padding | `--ai-spacing-4` | 12px |
| Filter item font | `--ai-font-fixed-xs` | 14px |
| Filter item text | `--ai-text-primary` | #1f2a37 |
| Filter item font-family | `--ai-font-title` | Inter |
| Selected item weight | `--ai-font-medium` | 500 |
| Check icon size | `--ai-icon-size-sm` | 16px |

## Token Gaps

| Property | Figma value | Resolution |
|---|---|---|
| Filter container `border-radius-3` | 6px | Approved: use `--ai-radius-md` (8px) — closest token |
| Filter popover width | 120px | Approved: use `--ai-size-1` (128px) — closest token |
| Filter item height | 35px | Approved: use `--ai-spacing-7` (32px) — closest token |
| Send disabled opacity | 80% | Approved: raw `0.8` |
| Filter popover `spacing/px` | 1px | Approved: raw `1px` (border-like spacing) |

## Icons

| Element | Lucide name |
|---|---|
| Filter button | `funnel` |
| Send button | `move-up` |
| Selected filter check | `check` |

## Dependencies

- Composes **Button** (`src/components/Button/Button.css`) — tertiary sm icon-only (filter), primary sm icon-only (send)
- Composes **Tooltip** (`src/components/Tooltip/Tooltip.css`) — data collection + filter tooltips

## Notes

- Mobile layout via `@media (max-width: 767px)`: padding shrinks to `--ai-spacing-5`, placeholder uses `--ai-font-fluid-sm`, send button hidden in default (visible when active via `.msg-input--active`)
- Minimised layout via `[data-layout="minimised"]`: same sizing as mobile but both buttons always visible
- Active state: JS listens for `input` event on textarea, adds `.msg-input--active` when non-empty
- Duration filter: popover positioned absolutely above the filter button container, 3 options (30 Days, 6 Months, 1 Year), selected item shows `check` icon + medium weight
- Data tooltip: positioned centered below the disclaimer text
- Filter tooltip: positioned above the filter button
- `font-feature-settings: 'ss04' 1, 'cv01' 1, 'calt' 0, 'kern' 0` on placeholder matches the Figma input text style
