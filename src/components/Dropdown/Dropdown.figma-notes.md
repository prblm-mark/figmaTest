# Dropdown — Figma Notes

## Figma Node

- **File:** `Lus07xi8pPXLN87sQIyrEt` (Affino AI Design System)
- **Component set / container:** `2553:3676`
- **Tier:** `Component` → built into `src/components/Dropdown/`
- URL: https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2553-3676

## Variant matrix (5 variants)

| Node ID | Type | Notes | Built |
|---|---|---|---|
| 2553:3674 | Basic | Plain item list, "Settings" highlighted as selected | ✅ |
| 2553:3675 | With Header | Profile block (avatar / name / email) + items + divider + sign-out | ✅ |
| 2553:3673 | Actions | Items with leading icons + divider + Delete CTA (alert button) | ✅ |
| 2553:3671 | Checkbox | Checkbox items (composes existing Checkbox component) | ✅ |
| 2553:3672 | Search | Search input + filterable item list | ✅ |

## CSS Class Mapping

| Figma element | CSS class | Notes |
|---|---|---|
| Container (root) | `.dropdown` | `position: relative` so the panel can absolutely-position underneath the trigger |
| Trigger button | `.btn .btn--secondary .dropdown__trigger` | Reuses Button. `.dropdown__trigger` only adds chevron-rotate-on-open |
| Panel | `.dropdown__panel` | Absolute, white-on-secondary-border, `--ai-shadow-md`. Display toggled by `.dropdown.is-open` |
| Panel — Search variant | `.dropdown__panel .dropdown__panel--search` | Adds vertical gap between search input and list |
| Panel — Actions variant | `.dropdown__panel .dropdown__panel--actions` | Adds vertical gap between item list and Delete CTA |
| Panel — Checkbox variant | `.dropdown__panel .dropdown__panel--checkbox` | Different padding (16px x, 12px y) per Figma |
| List | `.dropdown__list` | Flex column. `--header` modifier adds 4px gap (used in With Header) |
| Item (action / link) | `.dropdown__item` | 40px min-height, 12/8 padding, radius-md. `.dropdown__item--selected` applies bg + medium weight. `aria-selected="true"` and `aria-current="page"` produce the same styling |
| Divider | `.dropdown__divider` | 1px line, `--ai-surface-secondary` |
| Profile block | `.dropdown__profile` | Avatar + name + email — used only by With Header. Always rendered with `--ai-surface-secondary` bg |
| Avatar image | `.dropdown__profile-avatar` | 40px, `--ai-radius-full`, `object-fit: cover` |
| Name | `.dropdown__profile-name` | 14px semibold |
| Email | `.dropdown__profile-email` | 12px regular, `--ai-text-contrast` |
| Search wrapper | `.dropdown__search` | 40px tall, primary bg, secondary border |
| Search input | `.dropdown__search-input` | Native input, no border (parent provides it) |
| Delete CTA | `.btn .btn--alert` | Reuses Button; CSS sets `width: 100%` when inside `.dropdown__panel` |

## Token Mapping

| Figma variable | CSS variable | Role |
|---|---|---|
| `surface/elevated-1` | `--ai-surface-elevated-1` | Panel background |
| `surface/primary` | `--ai-surface-primary` | Trigger bg, search input bg |
| `surface/secondary` | `--ai-surface-secondary` | Selected/hover item bg, profile bg, divider colour |
| `surface/brand` | `--ai-surface-brand` | Checked-checkbox bg (via Checkbox component) |
| `surface/error` | `--ai-surface-error` | Delete button bg (via Button --alert) |
| `border/secondary` | `--ai-border-secondary` | Panel border, trigger border, checkbox border, search border |
| `border/brand` | `--ai-border-brand` | Search input focus border |
| `text/primary` | `--ai-text-primary` | All item text, profile name |
| `text/contrast` | `--ai-text-contrast` | Profile email, search placeholder |
| `btn/primary-text` | `--ai-btn-primary-text` | Delete button text (white) |
| `icon/primary` | `--ai-icon-primary` | Item leading icons |
| `icon/contrast` | `--ai-icon-contrast` | Search input leading icon |
| `radius/md` (8px) | `--ai-radius-md` | Panel, items, profile, trigger |
| `radius/full` | `--ai-radius-full` | Profile avatar |
| `spacing/1` (4px) | `--ai-spacing-1` | With Header list gap |
| `spacing/2` (6px) | `--ai-spacing-2` | Item icon-to-label gap |
| `spacing/3` (8px) | `--ai-spacing-3` | Item py, profile gap, search gap |
| `spacing/4` (12px) | `--ai-spacing-4` | Panel padding, item px |
| `spacing/5` (16px) | `--ai-spacing-5` | Checkbox panel px |
| `spacing/8` (40px) | `--ai-spacing-8` | Trigger height, profile avatar size, search height, default item min-height |
| `font/title` | `--ai-font-title` | All text |
| `font/fixed-xs` (14px) | `--ai-font-fixed-xs` | Trigger label, item text |
| `font/fixed-xxs` (12px) | `--ai-font-fixed-xxs` | Profile email |
| `font/regular/medium/semibold` | `--ai-font-regular/medium/semibold` | Item / selected item / trigger weights |
| `leading/xs` (16px) | `--ai-leading-xs` | Profile name |
| `leading/md` (24px) | `--ai-leading-md` | Item text |

## Token Gaps

- **Drop shadow.** Figma applies `0 4px 6px rgba(0,0,0,0.08)` to the panel. The closest existing token is `--ai-shadow-md` (`0 2px 10px rgba(0,0,0,0.1)`). The token reference in `docs/tokens-reference.md` describes shadow-md as covering "tooltips, inputs, **menus**" so it is the semantically correct choice for this dropdown menu. The visual delta is small (slightly larger blur, slightly higher opacity in shadow-md). Flag to the designer if a dedicated `--ai-shadow-popover` token is preferred.
- **2px gap on the Search variant's list** (Figma `gap-[2px]`). Collapsed to `0` in the build — matches the Basic variant's flush-row pattern, and 2px has no `--ai-spacing-*` equivalent.

No raw hex / arbitrary colour values used.

## Interactivity (Dropdown.js)

Auto-binds on `DOMContentLoaded` to every `.dropdown` on the page.

| Behaviour | Implementation |
|---|---|
| Open / close | Trigger click toggles `.is-open` on the root and flips `aria-expanded` |
| Item click closes | Default — clicking `.dropdown__item` or `.btn--alert` closes the panel |
| Stay-open (Checkbox) | Set `data-dropdown="stay-open"` on the root |
| Click outside closes | Document-level click handler |
| Escape closes | Returns focus to the trigger |
| Search filter | When a `.dropdown__search-input` exists, typing case-insensitive-substring-filters the list items |

## Notes

- **Trigger reuses Button.** The trigger is `.btn .btn--secondary .dropdown__trigger`. The Dropdown-specific class only adds chevron rotation; all sizing / padding / typography come from Button.
- **Selected item state — three valid signals:** the CSS treats `.dropdown__item--selected`, `[aria-selected="true"]`, and `[aria-current="page"]` identically. Use whichever fits the consumer's semantics best (`aria-current` for navigation menus, `aria-selected` for option pickers, the modifier class for static demos).
- **Checkbox variant composes the existing Checkbox component.** No checkbox markup is duplicated — the same `.checkbox / .checkbox__input / .checkbox__indicator / .checkbox__label / .checkbox__label-text` classes are used. Dropdown only adds `padding: var(--ai-spacing-3) 0` to each row via a scoped rule.
- **Profile avatar** uses a plain `<img class="dropdown__profile-avatar">` rather than the Avatar component — Avatar is sized at 24/32/40/56/80px and clips with a circle. The dropdown profile shows only a 40px circular image (no checkmark, no notification dot, no portrait wrapping), so an `<img>` is sufficient and lighter.
- **Search variant 2px item gap** was collapsed to 0 in the build — see Token Gaps.
- **Sign out item** in With Header is a standard `.dropdown__item` — same 8px py, 12px px, and `--ai-radius-md` as every other row. (Earlier Figma revisions had this row at 6px py + radius-sm; the current design unifies it.)

## Dependencies

- `Button` (`src/components/Button/`) — `.btn .btn--secondary` for the trigger; `.btn .btn--alert` for the Delete CTA in the Actions variant.
- `Checkbox` (`src/components/Checkbox/`) — used by the Checkbox variant.
- Lucide icons via CDN — `chevron-down`, `user`, `settings`, `help-circle`, `log-out`, `pencil`, `copy`, `archive`, `trash-2`, `search`, `check`.
