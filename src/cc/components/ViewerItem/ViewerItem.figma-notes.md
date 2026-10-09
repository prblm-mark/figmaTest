# ViewerItem — Figma Notes

## Figma Node
- File: `Lus07xi8pPXLN87sQIyrEt` (Affino Design System) · page **View & Edit** `3842:146669` · kit section `3861:1902`
- Node: [`3865:1977`](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3865-1977) · Tier: **Component** → `src/cc/components/ViewerItem/`
- Used by: `src/cc/templates/RecordScreen/` (ArticleView / ArticleEdit / ArticleSteps)

## Variant Matrix

| Node | Variant | Notes |
|---|---|---|
| `3865:1977` | (single) | Avatar, name, role, time, company chips |

## CSS Class Mapping

| Figma | CSS |
|---|---|
| Root (li) | `.viewer-item` |
| Body | `.viewer-item__body` |
| Identity | `.viewer-item__identity / __who` |
| Name / role / time | `.viewer-item__name / __role / __time` |
| Companies | `.viewer-item__companies → btn btn--tertiary btn--xs links` |

## Token Mapping

| Property | Token |
|---|---|
| card | --ao-surface-primary, 1px --ao-border-secondary, --ao-radius-md, no shadow (removed 2026-10-02, see below) |
| padding / gap | --ao-spacing-4 / --ao-spacing-4 (card); body gap --ao-spacing-2 (designer amend 2026-09-29, was -4 — flag for Figma) |
| name | --ao-font-fixed-2xs Bold --ao-text-primary |
| role | --ao-font-fixed-xxs --ao-text-contrast |
| time | --ao-font-fixed-5xs --ao-text-contrast |
| line height | --ao-leading-xs (draft "normal") |
| chips gap | --ao-spacing-2 |

## Token Gaps & Decisions
Draft shadow was the retired `light/shadow-xxs` → `shadow/2xs` (`--ao-shadow-2xs`). Draft line-heights were "normal" → `--ao-leading-xs`.

## Notes
- Built 2026-09-28 from the View & Edit kit (section `3861:1902`, CC Light mode). The kit was
  componentised from a code-capture draft that re-tokenise had bound to random / borrowed tokens;
  the designer ruled "your recommendations are the way to go", so bindings were normalised to the
  right semantic tokens in Figma first and this code follows the kit, not the draft.
- Markup comes from `src/cc/templates/RecordScreen/record_markup.py` — the demo and the templates are
  generated from the same function, so they cannot drift.


**Shadow removed (designer, 2026-10-02):** ViewerItems sit inside a FactPanel, which now carries `shadow/2xs`
itself, so the item's own shadow is gone in code. **The Figma component 3865:1977 still binds `shadow/2xs`, so remove it
there to match.** The border stays `border/secondary`. **Border rule (designer, 2026-10-02):** top-level panels use `border/card`, and cards INSIDE a panel keep the more prominent `border/secondary`.
