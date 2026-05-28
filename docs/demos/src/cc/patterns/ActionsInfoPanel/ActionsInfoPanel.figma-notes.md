# ActionsInfoPanel (CC) — Figma Notes

**Figma file:** [`ETKqleZdpertwFEo40YB5n`](https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4164-8667) (CC Hybrid Design System)
**Tier:** Pattern
**Files:** `ActionsInfoPanel.css`, `ActionsInfoPanel.html`, `ActionsInfoPanel.figma-notes.md`, `ActionsInfoPanel.figma.ts`

---

## Variant matrix

Single variant. The Figma symbol name is literally `Tier=Pattern` — a leftover variant-property string rather than a real name. Code Connect's generated React type confirms only one tier value exists (`tier?: "Pattern"`).

| Node | Variant | Notes |
|---|---|---|
| `4164:8667` | Single | Info card with Description + Related + System Security Right sections |

---

## CSS class mapping

| Figma | CSS |
|---|---|
| Root frame (`Tier=Pattern`) | `.cc-actions-info-panel` (`<div>`) |
| Description / Related / Security frame | `.cc-actions-info-panel__section` (`<section>`) |
| Section heading (e.g. "Description") | `.cc-actions-info-panel__heading` (`<h3>`) |
| Description body paragraph | `.cc-actions-info-panel__body` (`<p>`) |
| Pills wrapper (Related, Security) | `.cc-actions-info-panel__pills` (`<div>`) |
| Pill (`data-name="Button"`) | `<button class="btn btn--tertiary btn--sm">` — existing Button component |

---

## Token mapping

| Property | Token | Notes |
|---|---|---|
| Card bg | `var(--ai-surface-primary)` | |
| Card width | `var(--ai-size-5)` | 17.5rem / 280px — Figma is 288px (8px wider). Rounded to nearest size-scale token per design approval. |
| Card padding | `var(--ai-spacing-5)` | 16px |
| Card gap (between sections) | `var(--ai-spacing-6)` | 24px |
| Card radius | `var(--ai-radius-lg)` | 16px |
| Card shadow | `var(--ai-shadow-md)` | maps to Figma `light/shadow-md` |
| Section gap | `var(--ai-spacing-1)` | 4px |
| Heading font | `var(--ai-font-body)` + `var(--ai-font-semibold)` | Inter SemiBold |
| Heading size | `var(--ai-font-fixed-xs)` | 14px |
| Heading line-height | `var(--ai-leading-md)` | 24px |
| Heading colour | `var(--ai-text-primary)` | |
| Body font | `var(--ai-font-body)` + `var(--ai-font-regular)` | Inter Regular |
| Body size | `var(--ai-font-fixed-xs)` | 14px (fixed) |
| Body line-height | `var(--ai-leading-sm)` | Designer-approved tightening from initial `--ai-leading-md`. |
| Body colour | `var(--ai-text-secondary)` | |
| Pills row gap | `var(--ai-spacing-1)` | 4px |
| Pill height / typography | inherited from `btn btn--tertiary btn--sm` | h-32, px-12, font-fluid-xxs (12px), leading-xs (16px), bg-tertiary, text-tertiary |

---

## Token gaps

| # | Property | Figma | Resolution |
|---|---|---|---|
| 1 | Card width | `288px` (no variable binding) | Approved: use `--ai-size-5` (280px) — nearest size-scale token. 8px narrower than Figma. |
| 2 | Body line-height | `1.5` (raw ratio, no token binding) | Approved: use `--ai-leading-md` (24px). Worth re-binding in Figma to a `--ai-leading-*` token. |

---

## Dependencies

- **Button** (`src/components/Button/`) — `btn btn--tertiary btn--sm` for all four pills. Code Connect mapping confirms the Figma `data-name="Button"` instances resolve to this component. The Figma Button template includes chevron + arrow icons by default, but these specific instances are **text-only** (no icon nodes in design context), so the pills render as plain text.

---

## Interactions

Pills are clickable `<button>` elements but have no wired functionality yet — wire up later when the parent ActionsMenu / page context decides what each pill should navigate to or trigger. No selected/active variant exists in Figma.

---

## Notes

- The component pairs with the existing **CC ActionsMenu** pattern — likely opens alongside it when an item is selected, showing contextual info for the focused action. No JS yet; opening/closing behaviour is a parent-level concern.
- Lives in `src/cc/patterns/` per the Figma symbol naming "Tier=Pattern".
- White card with drop-shadow stands proud of the CC ActionsMenu's primary-bg surface — intended to sit *above* it visually (modal-style overlay).
- No interactions or JS yet — pure static markup.

---

## History

- 2026-05-28: Initial build from Figma `4164:8667`. Single variant. Composes existing Button (tertiary, sm). Designer-approved token swaps for card width (288 → `--ai-size-5` 280px) and body line-height (raw 1.5 → `--ai-leading-md`).
