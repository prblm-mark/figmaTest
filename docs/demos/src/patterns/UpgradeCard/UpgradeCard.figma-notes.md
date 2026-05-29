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
| Card bg | `var(--ai-surface-primary)` | white |
| Card border | `1px solid var(--ai-border-secondary)` | |
| Card shadow | `var(--ai-shadow-md)` | maps to Figma `light/shadow-md` |
| Card radius | `var(--ai-radius-md)` | 8px (Figma bound `--ai-spacing-3` — approved rebind) |
| Card gap | `var(--ai-spacing-5)` | 16px (both sizes) |
| Card padding (Base) | `var(--ai-spacing-4)` | 12px |
| Card padding (Lg) | `var(--ai-spacing-5)` | 16px |
| Card min-height (Base) | `var(--ai-spacing-11)` | 64px |
| Card min-height (Lg) | `var(--ai-spacing-13)` | 80px |
| Text column gap | `var(--ai-spacing-1)` | 4px |
| Version font | `var(--ai-font-title)` + `var(--ai-font-bold)` | Inter Bold |
| Version size (Base) | `var(--ai-font-fixed-xs)` | 14px |
| Version size (Lg) | `var(--ai-font-fixed-sm)` | 16px |
| Version colour | `var(--ai-text-primary)` | |
| Status font | `var(--ai-font-body)` + `var(--ai-font-medium)` | Inter Medium |
| Status size (Base) | `var(--ai-font-fixed-xxs)` | 12px |
| Status size (Lg) | `var(--ai-font-fixed-xs)` | 14px |
| Status colour | `var(--ai-text-contrast)` | |
| Update button bg (override) | `var(--ai-surface-success)` | Case-B scoped to `.upgrade-card .btn--primary` |

---

## Token gaps

| # | Property | Figma | Resolution |
|---|---|---|---|
| 1 | Card radius binding | `--ai-spacing-3` (8px) | User-approved: use semantic `--ai-radius-md` (same value). |
| 2 | Card width | Figma frame width 286px (no token) | User-approved: `width: 100%` — consumer controls. |
| 3 | Update button bg | `--ai-surface-success` overriding `--ai-btn-primary-bg` (Code Connect mapping is `btn btn--primary btn--sm`) | User-approved as **Case B contextual override** — scoped to `.upgrade-card .btn--primary { background-color: var(--ai-surface-success); border-color: transparent; }`. The base Button stays primary blue across the rest of the system. |

---

## Dependencies

- **Button** (`src/components/Button/`) — `btn btn--primary btn--sm` for the Update CTA. UpgradeCard scopes a Case-B override on this Button instance to swap the bg to success-green; everywhere else `btn--primary` stays the standard primary blue.

---

## Notes

- Width is **consumer-controlled** (`width: 100%`) — Figma frame width 286px is treated as a Figma layout artifact, not a production constraint.
- `No updates` type simply **omits the `<button>` element** from the markup — no extra modifier class needed.
- The Update button's green colour is **scoped to `.upgrade-card .btn--primary`** so the base Button component stays blue everywhere else. If green-on-success becomes a frequent pattern, promoting `--ai-surface-success` to a proper `btn--success` variant is the follow-up.
- Hover / focus / active for the green button use a simple `filter: brightness()` rather than additional tokens — keeps the override minimal until a real success-Button variant lands.

---

## History

- 2026-05-28: Initial build from Figma frame `2758:3140`. All 4 variants implemented. 3 STOPs resolved (radius rebind, consumer-controlled width, Case-B green Button override).
