# PromptTemplateItem — Figma Notes

## Figma Node
- File key: `8OAAokH2JXhIvGZFrlzeKT`
- Component set: `78:2868` (frame named "Prompt Template Item")
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
| Default | `.prompt-template-item` | `--ai-border-secondary` 1px border |
| Hover | `.prompt-template-item:hover` | Whole card border darkens to `--ai-border-primary`; chevron container also gets `--ai-surface-secondary` bg (separate rule) |
| Selected | `.prompt-template-item--selected` | Border flips to `--ai-border-primary` |
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
| `--ai-border-secondary` | `--ai-border-secondary` | Default card border |
| `--ai-border-primary` | `--ai-border-primary` | Selected card border |
| `--ai-radius-lg` | `--ai-radius-lg` | Card corner radius |
| `--ai-spacing-5` | `--ai-spacing-5` | Inner padding (header + details) |
| `--ai-spacing-6` | `--ai-spacing-6` | Chevron container size (24px) |
| `--ai-radius-md` | `--ai-radius-md` | Chevron button corner radius |
| `--ai-icon-size-lg` | `--ai-icon-size-lg` | 24px prompt icon size |
| `--ai-icon-size-sm` | `--ai-icon-size-sm` | 16px chevron icon size |
| `--ai-icon-primary` | `--ai-icon-primary` | Prompt icon colour |
| `--ai-icon-contrast` | `--ai-icon-contrast` | Chevron icon colour (inferred from variable defs — verify if incorrect) |
| `--ai-font-title` | `--ai-font-title` | Title font family |
| `--ai-font-semibold` | `--ai-font-semibold` | Title weight |
| `--ai-font-fixed-xs` | `--ai-font-fixed-xs` | Title + description font size |
| `--ai-leading-1` | `--ai-leading-1` | Title line height |
| `--ai-text-primary` | `--ai-text-primary` | Title colour |
| `--ai-border-primary` | `--ai-border-primary` | Whole-item border on hover (node 178:3388) |
| `--ai-surface-secondary` | `--ai-surface-secondary` | Chevron container bg on hover (node 78:2879) |
| `--ai-surface-contrast` | `--ai-surface-contrast` | Divider border between header and details |
| `--ai-font-body` | `--ai-font-body` | Description font family |
| `--ai-font-regular` | `--ai-font-regular` | Description weight |
| `--ai-leading-2` | `--ai-leading-2` | Description line height |
| `--ai-text-secondary` | `--ai-text-secondary` | Description colour |

## Transitions (defaults used — confirm with user)
- Hover chevron bg: `--ai-transition-default` (150ms ease)
- Selected border: `--ai-transition-default` (150ms ease)
- Chevron rotation: `--ai-transition-default` (150ms ease)
- Description reveal: instant (no animation)

## Token Gaps
None — all design values map to `--ai-*` semantic tokens.

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
- The chevron container width/height uses `--ai-spacing-6` (1.5rem = 24px) — this is the button container, not an icon. Icon sizes still use `--ai-icon-size-*` tokens.
- `--ai-icon-contrast` for chevron colour is inferred from variable defs inclusion; not explicitly visible in design context output.
- Description text for items 2–6 in the demo is placeholder copy — real product copy to be confirmed.
- Description text for item 1 (Support Assistant) is taken exactly from the Figma Expanded variant.
