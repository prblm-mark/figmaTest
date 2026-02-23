# VersionHistoryRow — Figma Notes

## Figma Node
- File: `8OAAokH2JXhIvGZFrlzeKT`
- Component set: node `78:2957` — "Version History"

## Variant Matrix

| Node | Type | Description |
|---|---|---|
| 78:2958 | Default | No background; avatar circle + name/date |
| 78:2963 | Live | `--ai-surface-secondary` bg; avatar + name/date + Pill |
| 78:2978 | Selected | `--ai-surface-primary` bg + `--ai-border-primary` border; check circle replaces avatar |
| 78:2970 | Selected & Live | `--ai-surface-secondary` bg; check circle + Pill; gap widens to `--ai-spacing-5` |

## CSS Class Mapping

| Element | CSS class |
|---|---|
| Row (Default) | `.version-history-row` |
| Row (Live) | `.version-history-row.version-history-row--live` |
| Row (Selected) | `.version-history-row.version-history-row--selected` |
| Row (Selected & Live) | `.version-history-row.version-history-row--selected.version-history-row--live` |
| Avatar circle | `.version-history-row__avatar` |
| Check circle (Selected states) | `.version-history-row__check` |
| Name + date group | `.version-history-row__content` |
| Name text | `.version-history-row__name` |
| Date text | `.version-history-row__date` |

## Dependencies
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
| Live bg | `--ai-surface-secondary` | `--ai-surface-secondary` |
| Selected bg | `--ai-surface-primary` | `--ai-surface-primary` |
| Selected border | `1px solid` `--ai-border-primary` | `--ai-border-primary` |
| Selected & Live bg | `--ai-surface-secondary` | `--ai-surface-secondary` |
| Avatar / check circle size | `size-[24px]` = `--ai-spacing-6` | `--ai-spacing-6` |
| Check circle bg | `--ai-surface-success` | `--ai-surface-success` |
| Check circle border | `1px solid --ai-surface-primary` | `--ai-surface-primary` |
| Check icon size | `16×16px` = `--ai-spacing-5` | `--ai-spacing-5` |
| Check icon color | `icon/invert` | `--ai-icon-invert` |
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
- **Check icon dark mode:** `--ai-icon-invert` flips to near-black (`#111928`) in dark mode. Since `--ai-surface-success` is theme-invariant (same green in both themes), dark mode contrast may need review. If insufficient, replace with `--ai-btn-primary-text` (always white).
- **Selected & Live gap:** Figma uses `--ai-spacing-5` (wider) for this variant vs `--ai-spacing-4` for the others — always check per-variant gap in Figma rather than assuming uniform spacing.
- **Avatar placeholder:** Demo uses `--ai-surface-brand` as a placeholder bg. In production, replace `.version-history-row__avatar` content with an `<img>` tag or initials-based avatar.
- **Border on Selected:** Adds 2px to the rendered row dimensions vs the other variants. Not compensated with a transparent border on base — the rows stack vertically and the 1px shift is not visually disruptive.
