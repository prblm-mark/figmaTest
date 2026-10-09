# VersionHistoryRow — Figma Notes

## Figma Node
- File: `Ikv8jxb5dcRH8ff4q4dR11`
- Component set: node `2:7693` — "Version History"

## Variant Matrix

| Node | Type | Description |
|---|---|---|
| 78:2958 | Default | No background; avatar circle + name/date |
| 142:3427 | Hover | **Default variant only.** `--ao-surface-primary` bg + `1px solid --ao-border-primary` border on mouseover; Live/Selected/Selected & Live have no hover interaction in Figma. |
| 78:2963 | Live | `--ao-surface-secondary` bg; avatar + name/date + Pill |
| 78:2978 | Selected | `--ao-surface-primary` bg + `--ao-border-primary` border; check circle replaces avatar |
| 78:2970 | Selected & Live | `--ao-surface-secondary` bg; check circle + Pill; gap widens to `--ao-spacing-5` |

## CSS Class Mapping

| Element | CSS class |
|---|---|
| Row (Default) | `.version-history-row` |
| Row (Hover) | `.version-history-row:hover` |
| Row (Live) | `.version-history-row.version-history-row--live` |
| Row (Selected) | `.version-history-row.version-history-row--selected` |
| Row (Selected & Live) | `.version-history-row.version-history-row--selected.version-history-row--live` |
| Avatar (Default/Live rows) | `.avatar` (from Avatar component) |
| Check circle (Selected rows) | `.avatar.avatar--checked` (from Avatar component) |
| Name + date group | `.version-history-row__content` |
| Name text | `.version-history-row__name` |
| Date text | `.version-history-row__date` |

## Dependencies
- `Avatar` — `src/components/Avatar/` (Size=1 default circle; Checked=True check circle)
- `Pill` — `src/components/Pill/`

## Token Mapping

| Property | Figma variable | CSS variable |
|---|---|---|
| Padding horizontal | `--ao-spacing-5` | `--ao-spacing-5` |
| Padding vertical | `--ao-spacing-3` | `--ao-spacing-3` |
| Border radius | `--ao-radius-lg` | `--ao-radius-lg` |
| Name/date gap | `--ao-spacing-1` | `--ao-spacing-1` |
| Gap (Default / Live / Selected) | `--ao-spacing-4` | `--ao-spacing-4` |
| Gap (Selected & Live) | `--ao-spacing-5` | `--ao-spacing-5` |
| Hover bg | `--ao-surface-primary` | `--ao-surface-primary` |
| Hover border | `1px solid` `--ao-border-primary` | `--ao-border-primary` |
| Live bg | `--ao-surface-secondary` | `--ao-surface-secondary` |
| Selected bg | `--ao-surface-primary` | `--ao-surface-primary` |
| Selected border | `1px solid` `--ao-border-primary` | `--ao-border-primary` |
| Selected & Live bg | `--ao-surface-secondary` | `--ao-surface-secondary` |
| Avatar / check circle size | `size-[24px]` = `--ao-spacing-6` | `--ao-spacing-6` |
| Avatar ring (Default variant only — contextual override) | `box-shadow: 0 0 0 2px --ao-surface-primary` | `--ao-surface-primary` |
| Check circle bg | `--ao-surface-success` | `--ao-surface-success` |
| Check circle border | `1px solid --ao-surface-primary` | `--ao-surface-primary` |
| Check icon size | `16×16px` = `--ao-spacing-5` | `--ao-spacing-5` |
| Check icon color | `icon/invert` | `--ao-btn-primary-text` (always white; overrides invert flip in dark mode) |
| Name font size | `--ao-font-fixed-xs` | `--ao-font-fixed-xs` |
| Name font weight | `--ao-font-semibold` | `--ao-font-semibold` |
| Name line height | `--ao-leading-xs` | `--ao-leading-xs` |
| Name color | `--ao-text-primary` | `--ao-text-primary` |
| Date font size | `--ao-font-fixed-xxs` | `--ao-font-fixed-xxs` |
| Date font weight | `--ao-font-regular` | `--ao-font-regular` |
| Date line height | `--ao-leading-xs` | `--ao-leading-xs` |
| Date color | `--ao-text-contrast` | `--ao-text-contrast` |
| Date letter-spacing | `0.12px` | `0.12px` (optical, kept as px) |

## Token Gaps
None — all design values map to `--ao-*` semantic tokens. `--ao-surface-success` (`#30cb90`) was added to the token pipeline in this session.

## Notes
- **Check icon colour:** Uses `--ao-btn-primary-text` (always `#ffffff`) rather than `--ao-icon-invert`, because `--ao-surface-success` is theme-invariant (same green in both themes) and `--ao-icon-invert` would flip to near-black in dark mode.
- **Selected & Live gap:** Figma uses `--ao-spacing-5` (wider) for this variant vs `--ao-spacing-4` for the others — always check per-variant gap in Figma rather than assuming uniform spacing.
- **Avatar ring:** A `box-shadow: 0 0 0 2px var(--ao-surface-primary)` ring is applied to avatars in the **Default variant only** via a scoped `:not()` rule in `VersionHistoryRow.css`. Uses `box-shadow` rather than `border` so it doesn't reduce the avatar's visible size. This is a **Case B contextual override** — it is NOT on the Avatar component itself in Figma. Live and Selected variants do not have this ring.
- **Avatar component:** Default/Live rows use `<div class="avatar"><img class="portrait" src="..." alt="..."></div>`; Selected rows use `<div class="avatar avatar--checked"><i data-lucide="check"></i></div>`. Always include a portrait image in non-checked rows — the empty `.avatar` fallback shows a grey circle.
- **Border on Selected:** The base `.version-history-row` rule now includes `border: 1px solid transparent` — this means Selected/Live/Default rows all have the same box dimensions (no layout shift on hover or selection). Selected & Live overrides with `border: none`.
- **Hover redesign (post-Figma-redesign):** Hover state changed from `background-color: --ao-surface-secondary` to `border-color: --ao-border-primary` (node 142:3427). Avatar ring is now always visible on Default rows (no `:not(:hover)` condition needed since bg never changes).
