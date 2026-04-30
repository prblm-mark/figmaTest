# SearchInput — Figma Notes

**Figma URL:** [node 2522:711](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2522-711)

## Component Set

SearchInput is a Tier=Component design-system component for search-style input compositions. Eight variant types covering basic search bars, segmented input groups (with category/locale/protocol dropdowns), split layouts where the submit button sits separately, voice search, and advanced double-dropdown variants.

## Variant × Size Matrix

| Node | Type | Size | Notes |
|---|---|---|---|
| `2522:710` | Basic | Default | Single field with leading icon and inset trailing button |
| `2522:707` | Basic Icon Only | Default | Same, button is icon-only square |
| `2522:709` | Category Dropdown Search | Default | Segmented: left dropdown + middle field + right action |
| `2522:732` | Category Dropdown Search | sm | Smaller (32px) version |
| `2522:706` | Split | Default | Field + standalone button (gap-3 between) |
| `2522:747` | Split | sm | Smaller split |
| `2522:705` | Split Icon Only | Default | Split with icon-only standalone button |
| `2522:761` | Split Icon Only | sm | Smaller split icon |
| `2522:708` | Locations Search | Default | Country/flag dropdown + map-pin input + action |
| `2522:704` | Voice Search | Default | Field with leading icon + mic + action |
| `2522:703` | Advanced | Default | Two flanking dropdowns (https:// / .com) + field + action |

## CSS Class Mapping

| Figma property | CSS class |
|---|---|
| Type=Basic / Voice Search | `.search` (with `.search__icon` + `.search__input` + `.search__action`) |
| Type=Basic Icon Only | `.search` + `.search__action.search__action--icon-only` |
| Type=Split / Split Icon Only | `.search-split` (`.search` field + `.search-split__btn`) |
| Type=Category Dropdown Search / Locations / Advanced | `.search-group` (segmented control) |
| Voice Search mic button | `.search__icon-btn` (borderless icon button) |
| Advanced right-side dropdown | `.search-group__dropdown.search-group__dropdown--right` |
| Size=Default | base |
| Size=sm | `.search--sm` / `.search-split--sm` / `.search-group--sm` |

## Token Mapping

| Property | Token | Value |
|---|---|---|
| Field bg | `--ai-surface-primary` | #ffffff |
| Field border | `--ai-border-secondary` | #e2e2e3 |
| Field radius | `--ai-radius-md` | 8px |
| Field height (Default) | `--ai-spacing-8` | 40px |
| Field height (sm) | `--ai-spacing-7` | 32px |
| Basic field padding-left | `--ai-spacing-4` | 12px |
| Basic field padding-right (inset action) | `--ai-spacing-1` | 4px |
| Field gap | `--ai-spacing-3` | 8px |
| Input font | `--ai-font-title` regular + `--ai-font-fixed-xs` | Inter 400 / 14px |
| Input text | `--ai-text-primary` | #212123 |
| Placeholder | `--ai-text-contrast` | #67676c |
| Inset action height | `--ai-spacing-7` | 32px |
| Inset action padding | `--ai-spacing-4` (12px) | |
| Inset action font | `--ai-font-title` semibold + `--ai-font-fixed-xxs` | Inter 600 / 12px |
| Standalone Split button height | `--ai-spacing-8` | 40px |
| Standalone button padding | `--ai-spacing-5` | 16px |
| Standalone button font | `--ai-font-title` semibold + `--ai-font-fixed-xs` | Inter 600 / 14px |
| Action bg | `--ai-surface-brand` | #0071d8 |
| Action hover bg | `--ai-btn-primary-bg-hover` | #3a8fff |
| Action text | `--ai-btn-primary-text` | #ffffff |
| Group dropdown bg | `--ai-surface-minimal` | #f6f6f7 |
| Group dropdown hover bg | `--ai-surface-secondary` | #e2e2e3 |
| Group dropdown padding | `--ai-spacing-4` (12px) | |
| Group dropdown gap | `--ai-spacing-2` | 6px |
| Group dropdown font | `--ai-font-title` medium + `--ai-font-fixed-xs` | Inter 500 / 14px |
| Group divider | `--ai-border-secondary` (1px) | between dropdown and field |
| Group field padding | `--ai-spacing-5` | 16px |
| Group action padding | `--ai-spacing-5` | 16px |
| Mic button hover bg | `--ai-surface-minimal` | #f6f6f7 |
| Icon size | `--ai-icon-size-sm` | 16px |
| Icon color | `--ai-icon-contrast` | #929295 |
| Flag font | `--ai-font-fixed-md` | 18px |
| Focus halo | `--ai-surface-brand-soft` | brand contrast |
| Split gap | `--ai-spacing-3` | 8px |

## Token Gaps

None — all colour, spacing, typography, and radius values resolve to existing `--ai-*` tokens.

## Icons

| Element | Lucide name |
|---|---|
| Field leading icon (Basic / Voice / Split) | `search` |
| Action button icon | `search` |
| Mic button (Voice Search) | `mic` |
| Dropdown chevron | `chevron-down` |
| Locations field icon | `map-pin` |

## Dependencies

None — SearchInput is self-contained. The action buttons are styled inline rather than composing the Button component because their dimensions (`32px` inset action) and colour treatment differ from the standard Button sizes; matching Button exactly would require a new size variant. The standalone Split button could compose `btn btn--primary` but is kept inline so the whole search composition lives in one CSS file.

## Notes

- Three structural patterns:
  - `.search` — single bordered field with optional inset action(s)
  - `.search-split` — `.search` field + standalone `.search-split__btn` separated by `--ai-spacing-3`
  - `.search-group` — segmented control where dropdowns + field + action share a single border with internal dividers
- Voice Search has TWO trailing buttons inside one `.search`: a borderless `.search__icon-btn` (mic) followed by the inset `.search__action` (Search). Both fit inside the 40px field height.
- Advanced uses two `.search-group__dropdown` segments (one with `--right` modifier so the divider sits on the left edge instead of the right).
- Country flags use emoji (🇬🇧). For higher-fidelity rendering swap for SVG flags in production.
- Only Category Dropdown Search, Split, and Split Icon Only have a sm size — the rest are Default-only per the Figma component set.
