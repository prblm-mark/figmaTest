# VersionHistoryRow — Figma Notes

## Figma Node
- File: `8OAAokH2JXhIvGZFrlzeKT`
- Component set: node `78:2957` — "Version History"

## Variant Matrix

| Node | Type | Description |
|---|---|---|
| 78:2958 | Default | No background; avatar circle + name/date |
| 142:3427 | Hover | **Default variant only.** `--ai-surface-primary` bg + `1px solid --ai-border-primary` border on mouseover; Live/Selected/Selected & Live have no hover interaction in Figma. |
| 78:2963 | Live | `--ai-surface-secondary` bg; avatar + name/date + Pill |
| 78:2978 | Selected | `--ai-surface-primary` bg + `--ai-border-primary` border; check circle replaces avatar |
| 78:2970 | Selected & Live | `--ai-surface-secondary` bg; check circle + Pill; gap widens to `--ai-spacing-5` |

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
| Padding horizontal | `--ai-spacing-5` | `--ai-spacing-5` |
| Padding vertical | `--ai-spacing-3` | `--ai-spacing-3` |
| Border radius | `--ai-radius-lg` | `--ai-radius-lg` |
| Name/date gap | `--ai-spacing-1` | `--ai-spacing-1` |
| Gap (Default / Live / Selected) | `--ai-spacing-4` | `--ai-spacing-4` |
| Gap (Selected & Live) | `--ai-spacing-5` | `--ai-spacing-5` |
| Hover bg | `--ai-surface-primary` | `--ai-surface-primary` |
| Hover border | `1px solid` `--ai-border-primary` | `--ai-border-primary` |
| Live bg | `--ai-surface-secondary` | `--ai-surface-secondary` |
| Selected bg | `--ai-surface-primary` | `--ai-surface-primary` |
| Selected border | `1px solid` `--ai-border-primary` | `--ai-border-primary` |
| Selected & Live bg | `--ai-surface-secondary` | `--ai-surface-secondary` |
| Avatar / check circle size | `size-[24px]` = `--ai-spacing-6` | `--ai-spacing-6` |
| Avatar ring (Default variant only — contextual override) | `box-shadow: 0 0 0 2px --ai-surface-primary` | `--ai-surface-primary` |
| Check circle bg | `--ai-surface-success` | `--ai-surface-success` |
| Check circle border | `1px solid --ai-surface-primary` | `--ai-surface-primary` |
| Check icon size | `16×16px` = `--ai-spacing-5` | `--ai-spacing-5` |
| Check icon color | `icon/invert` | `--ai-btn-primary-text` (always white; overrides invert flip in dark mode) |
| Name font size | `--ai-font-fixed-xs` | `--ai-font-fixed-xs` |
| Name font weight | `--ai-font-semibold` | `--ai-font-semibold` |
| Name line height | `--ai-leading-1` | `--ai-leading-1` |
| Name color | `--ai-text-primary` | `--ai-text-primary` |
| Date font size | `--ai-font-fixed-xxs` | `--ai-font-fixed-xxs` |
| Date font weight | `--ai-font-regular` | `--ai-font-regular` |
| Date line height | `--ai-leading-1` | `--ai-leading-1` |
| Date color | `--ai-text-contrast` | `--ai-text-contrast` |
| Date letter-spacing | `0.12px` | `0.12px` (optical, kept as px) |

## Token Gaps
None — all design values map to `--ai-*` semantic tokens. `--ai-surface-success` (`#30cb90`) was added to the token pipeline in this session.

## Notes
- **Check icon colour:** Uses `--ai-btn-primary-text` (always `#ffffff`) rather than `--ai-icon-invert`, because `--ai-surface-success` is theme-invariant (same green in both themes) and `--ai-icon-invert` would flip to near-black in dark mode.
- **Selected & Live gap:** Figma uses `--ai-spacing-5` (wider) for this variant vs `--ai-spacing-4` for the others — always check per-variant gap in Figma rather than assuming uniform spacing.
- **Avatar ring:** A `box-shadow: 0 0 0 2px var(--ai-surface-primary)` ring is applied to avatars in the **Default variant only** via a scoped `:not()` rule in `VersionHistoryRow.css`. Uses `box-shadow` rather than `border` so it doesn't reduce the avatar's visible size. This is a **Case B contextual override** — it is NOT on the Avatar component itself in Figma. Live and Selected variants do not have this ring.
- **Avatar component:** Default/Live rows use `<div class="avatar"><img class="portrait" src="..." alt="..."></div>`; Selected rows use `<div class="avatar avatar--checked"><i data-lucide="check"></i></div>`. Always include a portrait image in non-checked rows — the empty `.avatar` fallback shows a grey circle.
- **Border on Selected:** The base `.version-history-row` rule now includes `border: 1px solid transparent` — this means Selected/Live/Default rows all have the same box dimensions (no layout shift on hover or selection). Selected & Live overrides with `border: none`.
- **Hover redesign (post-Figma-redesign):** Hover state changed from `background-color: --ai-surface-secondary` to `border-color: --ai-border-primary` (node 142:3427). Avatar ring is now always visible on Default rows (no `:not(:hover)` condition needed since bg never changes).
