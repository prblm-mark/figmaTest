# FilterDropdownItem — Figma Notes

## Figma Node
- File: `Lus07xi8pPXLN87sQIyrEt` (Affino AI Design System)
- Component set: `3032:18152` — "FilterDropdownItem" — [open in Figma](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=3032-18152)
- Tier: `Component` → built into `src/components/FilterDropdownItem/`

A selectable filter option row: title ("Option name") + optional sub text, with a
green check-circle shown on the right when selected. Designed for a multi-select
filter dropdown / listbox.

## Variant × State Matrix (4 = Type × State)

| Node ID | Type | State | bg | Check | Built |
|---|---|---|---|---|---|
| 3032:18151 | Initial | Default | transparent | hidden | ✅ |
| 3032:18148 | Initial | Hover | `--ai-surface-minimal` | hidden | ✅ |
| 3032:18150 | Selected | Default | transparent | visible | ✅ |
| 3032:18149 | Selected | Hover | `--ai-surface-minimal` | visible | ✅ |

**Axis independence (verified):** `Type` only toggles the check's *visibility* — the
CircleCheck icon is present in every variant's layer tree (confirmed in the Initial
variant's design context) and merely hidden when Initial. `State=Hover` only adds the
`--ai-surface-minimal` background (confirmed on both Selected/Hover and — same fill —
via the shared token). CSS represents the cross-product with one `--selected` modifier
+ the `:hover` pseudo-class rather than 4 rules.

## Interaction (confirmed with user, 2026-07-07)

- **Multi-select toggle:** clicking an item toggles its own `--selected` (check on/off)
  independently — several items can be selected at once. No sibling clearing.
- Built as `<button aria-pressed>`; `FilterDropdownItem.js` auto-inits `[data-filter-dropdown-item]`,
  toggles `.filter-dropdown-item--selected` + `aria-pressed`, and emits a
  `filter-dropdown-item:toggle` event `{ selected }` for the consuming dropdown.
- Hover / focus-visible are pure CSS.

## CSS Class Mapping

| Figma element | CSS class |
|---|---|
| Row container | `.filter-dropdown-item` (`<button>`, fills container; Figma frame = 280px) |
| Selected (Type) | `.filter-dropdown-item--selected` (reveals the check) |
| Hover (State) | `:hover` → `--ai-surface-minimal` |
| Text block | `.filter-dropdown-item__text` |
| Title | `.filter-dropdown-item__name` |
| Sub text (optional, `showSubText`) | `.filter-dropdown-item__sub` |
| Check icon | `.filter-dropdown-item__check` (Lucide `circle-check`, `visibility: hidden` until `--selected`) |

## Token Mapping

| Property | Figma variable | CSS variable |
|---|---|---|
| Row gap / padding-x | `--ai-spacing-3` (8px) | `--ai-spacing-3` |
| Row padding-y | `--ai-spacing-2` (6px) | `--ai-spacing-2` |
| Row radius | `--ai-spacing-3` (8px) *(see gap)* | `--ai-radius-md` (8px) |
| Hover bg | `--ai-surface-minimal` | `--ai-surface-minimal` |
| Title | `--ai-font-body` medium, `--ai-font-fixed-xs` (14px), `--ai-leading-sm` (20px) | same |
| Title colour | `--ai-text-primary` | `--ai-text-primary` |
| Sub text | `--ai-font-body` regular, `--ai-font-fixed-xxs` (12px) | same |
| Sub text colour | `--ai-text-secondary` | `--ai-text-secondary` |
| Check size | 16px | `--ai-icon-size-sm` |
| Check colour | `--ai-surface-success` (#059669) | `--ai-surface-success` |

## Token Gaps / Decisions
- **No token gaps** — every value maps to an existing `--ai-*` token.
- **Radius binding quirk:** Figma bound the row `border-radius` to `--ai-spacing-3` (a
  *spacing* token, 8px). Used `--ai-radius-md` instead — identical value (8px) and the
  correct semantic category for a radius. Flagged to the user; no visual difference.

## Notes
- **Icon (Lucide):** Figma layer `Icon/24px/CircleCheck` → Lucide `circle-check`. It renders
  at 16px (`--ai-icon-size-sm`) despite the 24px component name (base component size, not placed size).
- **Check colour** uses `--ai-surface-success` (a surface token) exactly as Figma bound it —
  there is no dedicated `--ai-icon-success` token.
- **Width:** the Figma frame is 280px, but the item is built `width: 100%` to fill whatever
  dropdown / listbox contains it (280px is the artboard width, not a fixed component size).
- **Footer/selected reveal:** the check occupies reserved 16px space even when hidden
  (`visibility: hidden`), so Initial and Selected rows share identical layout.
