# VersionHistory — Figma Notes

## Figma Node
- File: `8OAAokH2JXhIvGZFrlzeKT`
- Component instance: node `132:3365` — [open in Figma](https://www.figma.com/design/8OAAokH2JXhIvGZFrlzeKT/Affino-AI---Design-System?node-id=132-3365)

## Variant Matrix
Single variant (no Figma props). Rows inside are VersionHistoryRow instances.

## CSS Class Mapping

| Element | CSS class |
|---|---|
| Outer panel | `.version-history` |
| Footer (button row) | `.version-history__footer` |

## Dependencies
- `Header` — `src/components/Header/` (no-actions state; full-width override applied — see Notes)
- `InfoLabel` — `src/components/InfoLabel/` (via Header)
- `Button` — `src/components/Button/` (tertiary sm in footer; via Header)
- `Tooltip` — `src/components/Tooltip/` (via Header)
- `Avatar` — `src/components/Avatar/` (Size=1, Checked=False and Checked=True)
- `Pill` — `src/components/Pill/`
- `VersionHistoryRow` — `src/components/VersionHistoryRow/`

## Token Mapping

| Property | Figma variable | CSS variable |
|---|---|---|
| Panel padding | `--ai-spacing-5` | `--ai-spacing-5` |
| Gap between rows | `--ai-spacing-3` | `--ai-spacing-3` |
| Panel border | `1px solid --ai-border-secondary` | `--ai-border-secondary` |
| Panel border radius | `--ai-radius-lg` | `--ai-radius-lg` |
| Panel background | (implied) `--ai-surface-primary` | `--ai-surface-primary` |

## Token Gaps
None — all design values map to `--ai-*` semantic tokens.

## Notes
- **Header (showButtons=false):** The Header instance inside VersionHistory has no actions slot. In HTML, simply omit `.header__actions` from the Header markup — no extra modifier class needed.
- **Row data in production:** The VersionHistoryRow instances shown in the demo use placeholder names/dates. In production, these are dynamic and populated from API data.
- **"Show older versions" button:** Tertiary sm button (`btn btn--tertiary btn--sm`) with trailing `chevron-right` icon. Right-aligned via `.version-history__footer { justify-content: flex-end }`. Figma design context shows no `border` class on this button — both secondary and tertiary use white bg (`--ai-btn-secondary`), so absence of border is the distinguishing signal for tertiary.
- **Avatar in rows:** Non-checked rows use `<div class="avatar"><img class="portrait" src="..." alt="..."></div>`; selected rows use `<div class="avatar avatar--checked"><i data-lucide="check"></i></div>`. Always include a portrait image in non-checked rows.
- **Pill label in Live row:** The Pill label is dynamic (e.g. "2 minutes ago", "Live"). The Figma demo shows "2 minutes ago" as the Live row label.
