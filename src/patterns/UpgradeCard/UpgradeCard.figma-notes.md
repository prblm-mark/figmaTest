# UpgradeCard — Figma Notes

**Figma file:** [`Lus07xi8pPXLN87sQIyrEt`](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System) (Affino AI Design System)
**Tier:** Pattern
**Parent frame:** `2758:3140`
**Files:** `UpgradeCard.css`, `UpgradeCard.html`, `UpgradeCard.figma-notes.md`, `UpgradeCard.figma.ts`

---

## Variant matrix

4 variants: 2 Sizes × 2 Types.

| Node | Size | Type | Notes |
|---|---|---|---|
| `2758:3137` | Base | Update | text + green Update button |
| `2758:3136` | Base | No updates | text only |
| `2758:3139` | Lg | Update | larger type + h-80 + green Update button |
| `2758:3138` | Lg | No updates | larger type + h-80, text only |

(Figma's "Tier" property is auto-generated `Frame 214/215/216/217` — designer didn't apply a consistent Tier label. All four are Pattern-tier by intent.)

---

## CSS class mapping

| Figma | CSS |
|---|---|
| Root frame | `.upgrade-card` (`<div>`) |
| Lg size | `.upgrade-card--lg` |
| Text column | `.upgrade-card__text` |
| Version line | `.upgrade-card__version` (`<p>`) |
| Status line | `.upgrade-card__status` (`<p>`) |
| Update button (`data-name="Button"`) | `<button class="btn btn--primary btn--sm">` — existing Button, contextually green-overridden |
| (No updates type) | omit the Button element from markup |

---

## Token mapping

| Property | Token | Notes |
|---|---|---|
| Card bg | `var(--ao-surface-primary)` | white |
| Card border | `1px solid var(--ao-border-secondary)` | |
| Card shadow | `var(--ao-shadow-md)` | maps to Figma `light/shadow-md` |
| Card radius | `var(--ao-radius-md)` | 8px (Figma bound `--ao-spacing-3` — approved rebind) |
| Card gap | `var(--ao-spacing-5)` | 16px (both sizes) |
| Card padding (Base) | `var(--ao-spacing-4)` | 12px |
| Card padding (Lg) | `var(--ao-spacing-5)` | 16px |
| Card min-height (Base) | `var(--ao-spacing-11)` | 64px |
| Card min-height (Lg) | `var(--ao-spacing-13)` | 80px |
| Text column gap | `var(--ao-spacing-1)` | 4px |
| Version font | `var(--ao-font-title)` + `var(--ao-font-bold)` | Inter Bold |
| Version size (Base) | `var(--ao-font-fixed-xs)` | 14px |
| Version size (Lg) | `var(--ao-font-fixed-sm)` | 16px |
| Version colour | `var(--ao-text-primary)` | |
| Status font | `var(--ao-font-body)` + `var(--ao-font-medium)` | Inter Medium |
| Status size (Base) | `var(--ao-font-fixed-xxs)` | 12px |
| Status size (Lg) | `var(--ao-font-fixed-xs)` | 14px |
| Status colour | `var(--ao-text-contrast)` | |
| Update button bg (override) | `var(--ao-surface-success)` | Case-B scoped to `.upgrade-card .btn--primary` |

---

## Token gaps

| # | Property | Figma | Resolution |
|---|---|---|---|
| 1 | Card radius binding | `--ao-spacing-3` (8px) | User-approved: use semantic `--ao-radius-md` (same value). |
| 2 | Card width | Figma frame width 286px (no token) | User-approved: `width: 100%` — consumer controls. |
| 3 | Update button bg | `--ao-surface-success` overriding `--ao-btn-primary-bg` (Code Connect mapping is `btn btn--primary btn--sm`) | User-approved as **Case B contextual override** — scoped to `.upgrade-card .btn--primary { background-color: var(--ao-surface-success); border-color: transparent; }`. The base Button stays primary blue across the rest of the system. |

---

## Dependencies

- **Button** (`src/components/Button/`) — `btn btn--primary btn--sm` for the Update CTA. UpgradeCard scopes a Case-B override on this Button instance to swap the bg to success-green; everywhere else `btn--primary` stays the standard primary blue.

---

## Notes

- Width is **consumer-controlled** (`width: 100%`) — Figma frame width 286px is treated as a Figma layout artifact, not a production constraint.
- `No updates` type simply **omits the `<button>` element** from the markup — no extra modifier class needed.
- The Update button's green colour is **scoped to `.upgrade-card .btn--primary`** so the base Button component stays blue everywhere else. If green-on-success becomes a frequent pattern, promoting `--ao-surface-success` to a proper `btn--success` variant is the follow-up.
- Hover / focus / active for the green button use a simple `filter: brightness()` rather than additional tokens — keeps the override minimal until a real success-Button variant lands.

---

## History

- 2026-05-28: Initial build from Figma frame `2758:3140`. All 4 variants implemented. 3 STOPs resolved (radius rebind, consumer-controlled width, Case-B green Button override).
