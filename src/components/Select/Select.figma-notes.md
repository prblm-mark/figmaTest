# Select — Figma Notes

**Figma URL:** [node 2527:1995](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2527-1995)

## Component Set

Select is a Tier=Component design-system component for picking from a list of values. Six variant types covering single-select, a horizontal label-left layout, multi-select list, disabled state, segmented category-region picker, and a minimal underline style. Triggers are rendered as `<button>` (not native `<select>`) so the value text remains visible in Figma capture.

## Variant × Size Matrix

| Node | Type | Size | Notes |
|---|---|---|---|
| `2527:1994` | Default | Default | Bordered button trigger, value text + chevron |
| `2527:1996` | Default | sm | 32px height, smaller font |
| `2755:2337` | Label Left | Default | Label beside control on one row (`gap` 16px); control grows to fill. Same trigger as Default |
| `2527:1993` | Multiselect | Default | List view — selected items highlighted with `--ao-surface-minimal` bg + medium font weight |
| `2527:1992` | Disabled | Default | Greyed bg, muted text, not interactive |
| `2527:2004` | Disabled | sm | Smaller disabled |
| `2527:1990` | Category Dropdown | Default | Segmented — flag + country (left) + region select (right) |
| `2527:2012` | Category Dropdown | sm | Smaller segmented |
| `2527:1991` | Underline | Default | Bottom border only, transparent bg, no horizontal padding |

## CSS Class Mapping

| Figma property | CSS class |
|---|---|
| Type=Default | `.sel__control` |
| Type=Label Left | `.sel.sel--label-left` (row layout) + `.sel__field` wrapper around control + menu |
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
| Trigger bg | `--ao-surface-primary` | #ffffff |
| Trigger border | `--ao-border-secondary` | #e2e2e3 |
| Trigger radius | `--ao-radius-md` | 8px |
| Trigger height (Default) | `--ao-spacing-8` | 40px |
| Trigger height (sm) | `--ao-spacing-7` | 32px |
| Trigger padding-left (Default) | `--ao-spacing-5` | 16px |
| Trigger padding-left (sm) | `--ao-spacing-4` | 12px |
| Trigger padding-right (Default) | `--ao-spacing-4` | 12px |
| Trigger padding-right (sm) | `--ao-spacing-3` | 8px |
| Trigger gap | `--ao-spacing-3` | 8px |
| Hover/focus border | `--ao-border-brand` | #0071d8 |
| Focus halo | `--ao-surface-brand-soft` | brand contrast |
| Label font | `--ao-font-title` semibold + `--ao-font-fixed-xs` | Inter 600 / 14px |
| Value font (Default) | `--ao-font-title` regular + `--ao-font-fixed-xs` | Inter 400 / 14px |
| Value font (sm) | `--ao-font-title` regular + `--ao-font-fixed-xxs` | Inter 400 / 12px |
| Value color | `--ao-text-primary` | #212123 |
| Disabled bg | `--ao-surface-minimal` | #f6f6f7 |
| Disabled text | `--ao-text-contrast` | #67676c |
| Underline border | `--ao-border-secondary` (2px) | grey |
| Underline hover | `--ao-border-brand` (2px) | brand blue |
| Multiselect list padding | `--ao-spacing-2` | 6px |
| Multiselect item padding | `--ao-spacing-2` v / `--ao-spacing-3` h | 6/8px |
| Multiselect item radius | `--ao-radius-sm` | 4px |
| Multiselect item height | `--ao-spacing-8` | 40px (`min-height`) |
| Multiselect item gap | `1px` | spacing/px (raw) |
| Multiselect selected bg | `--ao-surface-minimal` | #f6f6f7 |
| Multiselect selected weight | `--ao-font-medium` | 500 |
| Category divider | `--ao-border-secondary` (1px right) | grey |
| Category bg | `--ao-surface-minimal` | #f6f6f7 |
| Category hover bg | `--ao-surface-secondary` | #e2e2e3 |
| Category flag font | `--ao-font-fixed-md` | 18px |
| Chevron icon size | `--ao-icon-size-sm` | 16px |
| Chevron color | `--ao-icon-contrast` | #929295 |

## Token Gaps

None. The 1px gap between Multiselect items and 2px Underline border are optical units per CLAUDE rules.

## Icons

| Element | Lucide name |
|---|---|
| Trigger / category chevron | `chevron-down` |

## Dependencies

- **`Select.js`** (same folder) — shared interactive behaviour module. Auto-binds via document-level event delegation; no init call. Covers single-select (open / choose / close on click-outside + Esc), multi-select toggle, and the Category Dropdown segments. Load it on any page using Select markup (the demo and the ControlScreen template both do).

No native `<select>` element used (button-based triggers display the value as visible HTML text so it captures correctly to Figma).

## Notes

- Triggers are `<button>` elements rather than native `<select>`. Native selects don't render their selected option as visible text in Figma's html-to-design capture, so the chosen value would appear as an empty box. Buttons + a `<span class="sel__value">` keeps the value visible and capturable. The popover dropdown is wired live by `Select.js` (single-select opens the `.sel__menu`, updates `.sel__value`, moves the check).
- Country flags use emoji (🇬🇧). For higher-fidelity rendering swap for SVG flags in production.
- Multiselect is shown in its open/list state. In production a multiselect would also have a button trigger that opens this list — same `.sel__list` rendered in a popover.
- Underline variant has no horizontal padding so the value aligns flush-left with the parent surface (matches Figma where pl/pr are 0).
- Disabled `:hover` is suppressed (`border-color: --ao-border-secondary`) to override the brand-border hover.
- **Label Left** (`2755:2337`) only changes the `.sel` wrapper from a column to a horizontal row (`gap` 16px) — the label, control, value, chevron and popover sub-elements are unchanged. Control + menu are wrapped in `.sel__field` (`position: relative`) so the dropdown anchors to the control, not the full row. Reuses the single-select dropdown JS unchanged.

## Double-include guard (2026-08-27)

`Select.js` now bails if it has already run (`window.__selectReady`), matching `Toggle.js`.

**Why it matters more here than usual.** The trigger branch is a `classList.toggle`, so a second
document click handler cancels the first — the menu never opens, and the component looks *broken*
rather than duplicated. Option clicks still appear to work, because both handlers set the same
value, which makes the failure genuinely confusing to diagnose.

Hit for real on the Seating Planner screen: its ported ControlScreen shell already loads this file,
and adding it again for the create-plan Table Shape select silently killed **every** Select on the
page.



## Size=sm: the menu was never sized with the control (2026-09-22)

`.sel__control--sm` drops to `--ao-font-fixed-xxs` (12px), but `.sel__menu-item`
stayed at `--ao-font-fixed-xs` (14px) — so every small select opened a menu
whose text was **bigger than the field that summoned it**. Found by the
designer on the listing screens' bulk-action selects; it affects every `--sm`
select, not just those.

The menu is a **sibling** of the control, not a child, so it never inherited
the size. `:has()` is what lets the pair stay one component rather than
needing a second modifier class on the wrapper:

```css
.sel:has(.sel__control--sm) .sel__menu-item {
  font-size: var(--ao-font-fixed-3xs);
}
```

`3xs` per the designer. Worth knowing that **`3xs` and `xxs` are both
`0.75rem`** today — so this matches the trigger by value rather than by token.
If the two ever diverge, the trigger is the one to keep it in step with.
