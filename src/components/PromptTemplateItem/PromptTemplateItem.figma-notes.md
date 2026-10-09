# PromptTemplateItem — Figma Notes

## Figma Node
- File key: `Ikv8jxb5dcRH8ff4q4dR11`
- Component set: `2:7446` (frame named "Prompt Template Item")
- Variants:
  | Node ID | Variant name |
  |---|---|
  | 78:2869 | Property 1=Default |
  | 178:3388 | Property 1=Hover |
  | 78:2874 | Property 1=Selected |
  | 78:2884 | Property 1=Expanded |

## Variant × State Matrix

| Variant | CSS approach | Key visual |
|---|---|---|
| Default | `.prompt-template-item` | `--ao-border-secondary` 1px border |
| Hover | `.prompt-template-item:hover` | Whole card border darkens to `--ao-border-primary`; chevron container also gets `--ao-surface-secondary` bg (separate rule) |
| Selected | `.prompt-template-item--selected` | Border flips to `--ao-border-primary` |
| Expanded | `.prompt-template-item--expanded` | Details section revealed; chevron rotates 90° |

Selected and Expanded are independent JS-toggled states and can be combined.

## Interaction Model
- **Selection:** single-select (radio), click to toggle on/off. Clicking an already-selected item deselects it.
- **Expansion:** click chevron button only (not item body). Click outside or re-click chevron to collapse. Only one item expanded at a time.
- **Keyboard:** Enter/Space on item body → select. Chevron is a `<button>` and handles its own Enter/Space natively.

## CSS Class Mapping

| Figma property | CSS class |
|---|---|
| Root card | `.prompt-template-item` |
| Header row | `.prompt-template-item__header` |
| 24px prompt icon | `.prompt-template-item__icon` (on `<i data-lucide>`) |
| Title text | `.prompt-template-item__title` |
| Chevron button (24×24) | `.prompt-template-item__chevron-btn` |
| Chevron icon (16px) | `[data-lucide]` inside `.prompt-template-item__chevron-btn` |
| Description section | `.prompt-template-item__details` |
| Description text | `.prompt-template-item__description` |
| Selected modifier | `.prompt-template-item--selected` |
| Expanded modifier | `.prompt-template-item--expanded` |

## Token Mapping

| Figma variable | CSS token | Role |
|---|---|---|
| `--ao-border-secondary` | `--ao-border-secondary` | Default card border |
| `--ao-border-primary` | `--ao-border-primary` | Selected card border |
| `--ao-radius-lg` | `--ao-radius-lg` | Card corner radius |
| `--ao-spacing-5` | `--ao-spacing-5` | Inner padding (header + details) |
| `--ao-spacing-6` | `--ao-spacing-6` | Chevron container size (24px) |
| `--ao-radius-md` | `--ao-radius-md` | Chevron button corner radius |
| `--ao-icon-size-lg` | `--ao-icon-size-lg` | 24px prompt icon size |
| `--ao-icon-size-sm` | `--ao-icon-size-sm` | 16px chevron icon size |
| `--ao-icon-primary` | `--ao-icon-primary` | Prompt icon colour |
| `--ao-icon-contrast` | `--ao-icon-contrast` | Chevron icon colour (inferred from variable defs — verify if incorrect) |
| `--ao-font-title` | `--ao-font-title` | Title font family |
| `--ao-font-semibold` | `--ao-font-semibold` | Title weight |
| `--ao-font-fixed-xs` | `--ao-font-fixed-xs` | Title + description font size |
| `--ao-leading-xs` | `--ao-leading-xs` | Title line height |
| `--ao-text-primary` | `--ao-text-primary` | Title colour |
| `--ao-border-primary` | `--ao-border-primary` | Whole-item border on hover (node 178:3388) |
| `--ao-surface-secondary` | `--ao-surface-secondary` | Chevron container bg on hover (node 78:2879) |
| `--ao-surface-contrast` | `--ao-surface-contrast` | Divider border between header and details |
| `--ao-font-body` | `--ao-font-body` | Description font family |
| `--ao-font-regular` | `--ao-font-regular` | Description weight |
| `--ao-leading-md` | `--ao-leading-md` | Description line height |
| `--ao-text-secondary` | `--ao-text-secondary` | Description colour |

## Transitions (defaults used — confirm with user)
- Hover chevron bg: `--ao-transition-default` (150ms ease)
- Selected border: `--ao-transition-default` (150ms ease)
- Chevron rotation: `--ao-transition-default` (150ms ease)
- Description reveal: instant (no animation)

## Token Gaps
None — all design values map to `--ao-*` semantic tokens.

## Icon Name Mapping (Figma → Lucide)

| Figma component name | Lucide icon used | Note |
|---|---|---|
| `Icon/24px/Headset` | `headset` | Name matches |
| `Icon/24px/ChatSquare` | `message-square` | Naming mismatch — Lucide uses `message-square` |
| `Icon/24px/Newspaper` | `newspaper` | Name matches |
| `Icon/24px/Pound` | `pound-sterling` | Naming mismatch — Lucide uses `pound-sterling` |
| `Icon/24px/Atom` | `atom` | Name matches |
| `Icon/24px/Gem` | `gem` | Name matches |
| `Icon/16px/ChevronRight` | `chevron-right` | Name matches |

Icons render as SVG asset images in Figma (not Lucide components), but are visually identical to their Lucide counterparts. Confirm mappings if any icon looks wrong in the browser.

## Dependencies
- None (standalone component)

## Notes
- The chevron container width/height uses `--ao-spacing-6` (1.5rem = 24px) — this is the button container, not an icon. Icon sizes still use `--ao-icon-size-*` tokens.
- `--ao-icon-contrast` for chevron colour is inferred from variable defs inclusion; not explicitly visible in design context output.
- Description text for items 2–6 in the demo is placeholder copy — real product copy to be confirmed.
- Description text for item 1 (Support Assistant) is taken exactly from the Figma Expanded variant.
