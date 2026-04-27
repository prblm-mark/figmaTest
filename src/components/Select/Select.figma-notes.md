# Select — Figma Notes

**Figma URL:** [node 2527:1995](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2527-1995)

## Component Set

Select is a Tier=Component design-system component for picking from a list of values. Five variant types covering single-select, multi-select list, disabled state, segmented category-region picker, and a minimal underline style. Triggers are rendered as `<button>` (not native `<select>`) so the value text remains visible in Figma capture.

## Variant × Size Matrix

| Node | Type | Size | Notes |
|---|---|---|---|
| `2527:1994` | Default | Default | Bordered button trigger, value text + chevron |
| `2527:1996` | Default | sm | 32px height, smaller font |
| `2527:1993` | Multiselect | Default | List view — selected items highlighted with `--ai-surface-minimal` bg + medium font weight |
| `2527:1992` | Disabled | Default | Greyed bg, muted text, not interactive |
| `2527:2004` | Disabled | sm | Smaller disabled |
| `2527:1990` | Category Dropdown | Default | Segmented — flag + country (left) + region select (right) |
| `2527:2012` | Category Dropdown | sm | Smaller segmented |
| `2527:1991` | Underline | Default | Bottom border only, transparent bg, no horizontal padding |

## CSS Class Mapping

| Figma property | CSS class |
|---|---|
| Type=Default | `.sel__control` |
| Type=Disabled | `.sel__control` + `disabled` attr (or `.sel__control--disabled`) |
| Type=Underline | `.sel__control.sel__control--underline` |
| Type=Multiselect | `.sel__list` (replaces button trigger) |
| Type=Category Dropdown | `.sel-category` (with `.sel-category__category` + `.sel-category__value`) |
| Size=Default | `.sel__control` (base) |
| Size=sm | `.sel__control.sel__control--sm` (button) or `.sel-category--sm` (category) |
| Multiselect item selected | `.sel__list-item--selected` |

## Token Mapping

| Property | Token | Value |
|---|---|---|
| Trigger bg | `--ai-surface-primary` | #ffffff |
| Trigger border | `--ai-border-secondary` | #e2e2e3 |
| Trigger radius | `--ai-radius-md` | 8px |
| Trigger height (Default) | `--ai-spacing-8` | 40px |
| Trigger height (sm) | `--ai-spacing-7` | 32px |
| Trigger padding-left (Default) | `--ai-spacing-5` | 16px |
| Trigger padding-left (sm) | `--ai-spacing-4` | 12px |
| Trigger padding-right (Default) | `--ai-spacing-4` | 12px |
| Trigger padding-right (sm) | `--ai-spacing-3` | 8px |
| Trigger gap | `--ai-spacing-3` | 8px |
| Hover/focus border | `--ai-border-brand` | #0071d8 |
| Focus halo | `--ai-surface-brand-contrast` | brand contrast |
| Label font | `--ai-font-title` semibold + `--ai-font-fixed-xs` | Inter 600 / 14px |
| Value font (Default) | `--ai-font-title` regular + `--ai-font-fixed-xs` | Inter 400 / 14px |
| Value font (sm) | `--ai-font-title` regular + `--ai-font-fixed-xxs` | Inter 400 / 12px |
| Value color | `--ai-text-primary` | #212123 |
| Disabled bg | `--ai-surface-minimal` | #f6f6f7 |
| Disabled text | `--ai-text-contrast` | #67676c |
| Underline border | `--ai-border-secondary` (2px) | grey |
| Underline hover | `--ai-border-brand` (2px) | brand blue |
| Multiselect list padding | `--ai-spacing-2` | 6px |
| Multiselect item padding | `--ai-spacing-2` v / `--ai-spacing-3` h | 6/8px |
| Multiselect item radius | `--ai-radius-sm` | 4px |
| Multiselect item height | `--ai-spacing-8` | 40px (`min-height`) |
| Multiselect item gap | `1px` | spacing/px (raw) |
| Multiselect selected bg | `--ai-surface-minimal` | #f6f6f7 |
| Multiselect selected weight | `--ai-font-medium` | 500 |
| Category divider | `--ai-border-secondary` (1px right) | grey |
| Category bg | `--ai-surface-minimal` | #f6f6f7 |
| Category hover bg | `--ai-surface-secondary` | #e2e2e3 |
| Category flag font | `--ai-font-fixed-md` | 18px |
| Chevron icon size | `--ai-icon-size-sm` | 16px |
| Chevron color | `--ai-icon-contrast` | #929295 |

## Token Gaps

None. The 1px gap between Multiselect items and 2px Underline border are optical units per CLAUDE rules.

## Icons

| Element | Lucide name |
|---|---|
| Trigger / category chevron | `chevron-down` |

## Dependencies

None — Select is self-contained. No native `<select>` element used (button-based triggers display the value as visible HTML text so it captures correctly to Figma).

## Notes

- Triggers are `<button>` elements rather than native `<select>`. Native selects don't render their selected option as visible text in Figma's html-to-design capture, so the chosen value would appear as an empty box. Buttons + a `<span class="sel__value">` keeps the value visible and capturable. Production wiring would connect this to a popover dropdown; the prototype shows the trigger only.
- Country flags use emoji (🇬🇧). For higher-fidelity rendering swap for SVG flags in production.
- Multiselect is shown in its open/list state. In production a multiselect would also have a button trigger that opens this list — same `.sel__list` rendered in a popover.
- Underline variant has no horizontal padding so the value aligns flush-left with the parent surface (matches Figma where pl/pr are 0).
- Disabled `:hover` is suppressed (`border-color: --ai-border-secondary`) to override the brand-border hover.
