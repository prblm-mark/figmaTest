# StatCard — Figma Notes

**Figma file:** [`Lus07xi8pPXLN87sQIyrEt`](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System) (Affino AI Design System)
**Tier:** Pattern
**Parent frame:** `2758:3020`
**Files:** `StatCard.css`, `StatCard.html`, `StatCard.figma-notes.md`, `StatCard.figma.ts`

---

## Variant matrix

10 variants: 2 Sizes × 5 Types.

| Node | Size | Type | Notes |
|---|---|---|---|
| `2758:3019` | Base | Default | h-64, icon-wrap 40, icon 16 |
| `2758:3029` | Base | Chevron Down | + chevron-down 16 on right |
| `2758:3039` | Base | Chevron Right | + chevron-right 16 on right |
| `2758:3049` | Base | No card | no border/shadow/padding, h-40 |
| `2758:3057` | Base | Number First | value above title |
| `2758:3076` | Lg | Default | h-80, icon-wrap 48, icon 20 |
| `2758:3082` | Lg | Chevron Down | Lg + chevron |
| `2758:3089` | Lg | Chevron Right | Lg + chevron |
| `2758:3096` | Lg | No card | Lg + no card (h-48) |
| `2758:3102` | Lg | Number First | Lg + swapped order |

---

## CSS class mapping

| Figma | CSS |
|---|---|
| Root frame | `.stat-card` (`<div>`) |
| Lg size | `.stat-card--lg` |
| Type=No card | `.stat-card--no-card` |
| Type=Number First | `.stat-card--number-first` (uses `order` to swap) |
| Brand icon square | `.stat-card__icon-wrap` |
| Lucide icon (inside square) | `<i data-lucide="..." aria-hidden="true">` |
| Text column | `.stat-card__text` |
| Title (label) | `.stat-card__title` (`<p>`) |
| Number (value) | `.stat-card__value` (`<p>`) |
| Chevron icon (right) | `.stat-card__chevron` + Lucide |

For Chevron Down/Right variants, add `<div class="stat-card__chevron">` as a sibling after `.stat-card__text`.

---

## Token mapping

| Property | Token | Notes |
|---|---|---|
| Card bg | `var(--ai-surface-primary)` | white (transparent on `--no-card`) |
| Card border | `1px solid var(--ai-border-secondary)` | (none on `--no-card`) |
| Card shadow | `var(--ai-shadow-md)` | maps to Figma `light/shadow-md`; removed on `--no-card` |
| Card radius | `var(--ai-radius-md)` | 8px (Figma bound `--ai-spacing-3` — designer-approved swap) |
| Card gap (Base) | `var(--ai-spacing-4)` | 12px |
| Card gap (Lg) | `var(--ai-spacing-5)` | 16px |
| Card padding (Base) | `var(--ai-spacing-4)` | 12px |
| Card padding (Lg) | `var(--ai-spacing-5)` | 16px |
| Card min-height (Base + card) | `var(--ai-spacing-11)` | 64px |
| Card min-height (Lg + card) | `var(--ai-spacing-13)` | 80px |
| Card min-height (Base + no-card) | `var(--ai-spacing-8)` | 40px |
| Card min-height (Lg + no-card) | `var(--ai-spacing-9)` | 48px |
| Icon-wrap bg | `#2563eb` (Blue/600 primitive — approved) | no `--ai-*` token; documented in CSS |
| Icon-wrap colour (icon) | `var(--ai-text-invert)` | white icon over blue square |
| Icon-wrap size (Base) | `var(--ai-spacing-8)` | 40px |
| Icon-wrap size (Lg) | `var(--ai-spacing-9)` | 48px |
| Icon-wrap radius | `var(--ai-radius-md)` | 8px |
| Inner icon size (Base) | `var(--ai-icon-size-sm)` | 16px |
| Inner icon size (Lg) | `var(--ai-icon-size-md)` | 20px |
| Chevron icon size | `var(--ai-icon-size-sm)` | 16px (same in Base + Lg) |
| Chevron colour | `var(--ai-icon-secondary)` | |
| Text column gap | `var(--ai-spacing-1)` | 4px |
| Title font | `var(--ai-font-body)` + `var(--ai-font-medium)` | Inter Medium |
| Title size | `var(--ai-font-fixed-xs)` | 14px |
| Title colour | `var(--ai-text-contrast)` | |
| Value font | `var(--ai-font-title)` + `var(--ai-font-bold)` | Inter Bold |
| Value size | `var(--ai-font-fixed-sm)` | 16px |
| Value colour | `var(--ai-text-primary)` | |

---

## Token gaps

| # | Property | Figma | Resolution |
|---|---|---|---|
| 1 | Icon-wrap bg | `Blue/600` primitive `#2563eb` (no `--ai-*` semantic) | User-approved: use the primitive directly with a `/* Blue/600 */` comment in CSS. |
| 2 | Card radius binding | Figma binds `--ai-spacing-3` (8px) | User-approved: use `--ai-radius-md` instead (same value, correct semantic). |
| 3 | Card width | Figma frame width 339px (no token) | User-approved: width is consumer-controlled — `width: 100%`. |
| 4 | No card bg | Figma keeps `--ai-surface-primary` (white) | User-approved: render as `background: transparent` so the "no card" variant has no chrome whatsoever (literally just icon + text on the parent bg). |

---

## Dependencies

None — self-contained. Uses Lucide icons (`mail` default + `chevron-down` / `chevron-right` for the chevron variants) but does not depend on any other code-side component.

---

## Notes

- Width is intentionally **100% of parent** — Figma frame uses 339px but the production component is layout-agnostic.
- **Number First** swaps title and value order via CSS `order` (no HTML restructuring needed) — markup stays consistent across all variants.
- **No card** transparent background diverges from Figma (which keeps the white surface-primary) so the variant works on any parent surface. User-approved.
- Chevron variants are **static decorations** — no JS, no expand/collapse, no click handler. Consumer wraps the card in `<a>` or `<button>` if interaction is needed.
- Icon-wrap brand colour (`#2563eb`) is the only token gap that landed as a raw primitive — documented in CSS with a `/* Blue/600 */` comment per the project convention. Worth re-binding to an `--ai-*` token in Figma later.

---

## History

- 2026-05-28: Initial build from Figma frame `2758:3020`. All 10 variants implemented. 4 STOPs resolved (icon-wrap bg primitive, radius rebind, consumer-controlled width, transparent no-card bg).
