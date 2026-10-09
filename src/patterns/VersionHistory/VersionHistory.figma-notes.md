# VersionHistory — Figma Notes

## Figma Node
- File: `Ikv8jxb5dcRH8ff4q4dR11`
- Component set: node `2:7756` — [open in Figma](https://www.figma.com/design/Ikv8jxb5dcRH8ff4q4dR11/Affino-AI---AI-Chat?node-id=2-7756)

## Variant Matrix

| Node | Variant | Description |
|---|---|---|
| 132:3365 | Property 1=Default | Collapsed: heading + 5 rows (1 Live, 4 Default) + "Show older" footer |
| 157:4282 | Property 1=Expanded | Expanded: heading + 12 rows (1 Live, 11 Default) + "Show less" footer |

### What changes between variants

| Element | Default | Expanded |
|---|---|---|
| Row count | 5 (rows 6–12 hidden) | 12 (all rows visible) |
| Chevron direction | Right (`chevron-right`, no rotation) | Down (`chevron-right` rotated 90°) |
| Subtitle `aria-expanded` | `false` | `true` |
| Footer label | "Show older" | "Show less" |
| Timeline line height | Spans first 5 rows | Spans all 12 rows |

## CSS Class Mapping

| Element | CSS class |
|---|---|
| Outer container | `.version-history` |
| Expanded state modifier | `.version-history.version-history--expanded` |
| Heading section | `.version-history__heading` |
| Title row (icon + title text) | `.version-history__heading-title` |
| History icon | `.version-history__icon-history` (Lucide `history`, 24px) |
| Title text | `.version-history__heading-title-text` |
| Subtitle button (toggle trigger) | `.version-history__heading-subtitle` — `<button>` with `aria-expanded` |
| Subtitle text | `.version-history__heading-subtitle-text` |
| Chevron icon | `.version-history__chevron` (Lucide `chevron-right`, 16px, rotates 90° when expanded) |
| Row list wrapper | `.version-history__rows` |
| Timeline line (decoration) | `.version-history__timeline` |
| Standard rows (always visible) | `.version-history-row` (from VersionHistoryRow component) |
| Extra rows (hidden when collapsed) | `.version-history-row.version-history__row-extra` |
| Footer toggle button | `.version-history__footer` — `<button>` (secondary toggle trigger) |
| Footer label text | `.version-history__footer-label` |

## Dependencies
- `Avatar` — `src/components/Avatar/` (Size=1, Checked=False in Default/Live rows)
- `Pill` — `src/components/Pill/` (in the Live row)
- `VersionHistoryRow` — `src/components/VersionHistoryRow/`

## Token Mapping

| Property | Figma variable | CSS variable |
|---|---|---|
| Outer container gap | `--ao-spacing-1` | `--ao-spacing-1` |
| Outer container radius | `--ao-radius-lg` | `--ao-radius-lg` |
| Heading internal gap | `--ao-spacing-2` | `--ao-spacing-2` |
| Heading bottom padding | `--ao-spacing-2` | `--ao-spacing-2` |
| Title row gap | `--ao-spacing-3` | `--ao-spacing-3` |
| History icon size | `20px` (= `--ao-icon-size-md`) | `--ao-icon-size-md` |
| History icon color | `--ao-icon-primary` | `--ao-icon-primary` |
| Title font | `title/base` | `--ao-font-title`, `--ao-font-bold`, `--ao-font-fixed-sm`, `--ao-leading-xs` |
| Title color | `--ao-text-primary` | `--ao-text-primary` |
| Subtitle font | `body/xs` | `--ao-font-body`, `--ao-font-regular`, `--ao-font-fixed-xs`, `--ao-leading-md` |
| Subtitle color | `--ao-text-contrast` | `--ao-text-contrast` |
| Chevron icon size | `16px` (= `--ao-icon-size-sm`) | `--ao-icon-size-sm` |
| Chevron icon color | `--ao-icon-contrast` | `--ao-icon-contrast` |
| Row list gap | `--ao-spacing-1` | `--ao-spacing-1` |
| Timeline line color | `Neutral/200` = `#e5e7eb` | `--ao-border-secondary` |
| Footer padding | `--ao-spacing-3` × `--ao-spacing-5` | `--ao-spacing-3` × `--ao-spacing-5` |
| Footer label font | `body/xxs` | `--ao-font-body`, `--ao-font-regular`, `--ao-font-fixed-xxs`, `--ao-leading-xs` |
| Footer label color | `--ao-text-primary` | `--ao-text-primary` |
| Footer label tracking | `0.12px` | `0.12px` (optical, px) |

## Token Gaps
None — all design values map to `--ao-*` semantic tokens.
`Neutral/200 = #e5e7eb` maps to `--ao-border-secondary`.

## Notes
- **No Header component:** The new VersionHistory uses a custom heading section ("Prompt Template Heading" in Figma), NOT the Header component. All previous Header/InfoLabel/Button/Tooltip dependencies are removed.
- **History icon:** `data-name="Icon/24px/History"` → Lucide `history` icon. Rendered 24px, `--ao-icon-primary` colour.
- **Chevron:** `data-name="Icon/16px/ChevronRight"` in both variants. In Default: no rotation. In Expanded: Figma wraps it in a `rotate-90` container → CSS `transform: rotate(90deg)` on `.version-history--expanded .version-history__chevron`.
- **No transition on chevron:** User confirmed no animation for the expand/collapse toggle.
- **Timeline line:** Absolute-positioned 1px vertical line inside `.version-history__rows`. Centered at `calc(--ao-spacing-5 + --ao-spacing-6 / 2)` = 28px from left (aligns with avatar centres). Spans top-to-bottom of the rows wrapper (excludes footer).
- **Extra rows:** Rows 6–12 carry both `.version-history-row` and `.version-history__row-extra` classes. CSS hides `.version-history__row-extra` on the collapsed variant. JS toggles `.version-history--expanded` on the container.
- **Two toggle triggers:** Both the subtitle row (`"12 previous system roles saved"` + chevron) AND the footer ("Show older"/"Show less") are `<button>` elements that independently toggle expand/collapse. Clicking either syncs `aria-expanded` on both. JS uses a shared `toggleVersionHistory()` helper.
- **Design context shows layout only, not interactions.** The footer nodes appeared as `<div>` in design context output — but Figma prototype interactions exist separately from visual structure. User confirmed both triggers remain interactive. Always verify interaction model with the user or Figma prototype panel, not from design context element types alone.
- **Nested component audit (this session):** VersionHistoryRow, Avatar, and Pill were all verified against current Figma — no changes found. The only updated component is VersionHistory itself.
