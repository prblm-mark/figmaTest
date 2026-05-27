# ThemeToggle — Figma Notes

**Figma:** [`node 2699:2052`](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2699-2052)
**Tier:** Component
**Files:** `ThemeToggle.css`, `ThemeToggle.html`, `ThemeToggle.js`, `ThemeToggle.figma.ts`, `ThemeToggle.figma-notes.md`

---

## Variant matrix

Single axis: **State** = 2 variants.

| Node | State | Active button |
|---|---|---|
| `2699:2062` | Light | Sun/Light highlighted |
| `2699:2053` | Dark | Moon/Dark highlighted |

The two variants are mirror images. Visual state is driven by `aria-pressed`
on the segment buttons.

---

## CSS class mapping

| Figma | CSS |
|---|---|
| Wrapper | `.theme-toggle` (`<div>`) |
| Fill-parent variant | `.theme-toggle--fill` (drops the standalone 172px width) |
| Light / Dark button | `.theme-toggle__btn` (`<button data-theme-value="light\|dark">`) |
| Active state | `aria-pressed="true"` on the chosen button |
| Sun / Moon icon | `<i data-lucide="sun\|moon">` |

---

## Token mapping

### Wrapper

| Property | Token |
|---|---|
| Background | `var(--ai-surface-primary)` |
| Border | `1px solid var(--ai-border-secondary)` |
| Border-radius | `var(--ai-radius-md)` (8px) |
| Height | `var(--ai-spacing-8)` (40px) |
| Padding (horizontal) | `var(--ai-spacing-1)` (4px) |
| Gap | `0` |
| Width (standalone) | `172px` (raw — sub-token optical, Figma value) |

### Segment buttons

| Property | Token |
|---|---|
| Flex | `1 0 0` (each button fills half) |
| Height | `var(--ai-spacing-7)` (32px) |
| Padding (horizontal) | `var(--ai-spacing-4)` (12px) |
| Gap (icon → label) | `var(--ai-spacing-3)` (8px) |
| Background (inactive) | `transparent` |
| Background (active) | `var(--ai-surface-minimal)` |
| Border | none |
| Border-radius (inactive) | `var(--ai-radius-md)` |
| Border-radius (active) | `var(--ai-radius-sm)` |
| Text colour | `var(--ai-text-primary)` (substituted — see Token gaps) |
| Font-family | `var(--ai-font-body)` |
| Font-weight | `var(--ai-font-semibold)` |
| Font-size | `var(--ai-font-fluid-xxs)` (12px) |
| Line-height | `var(--ai-leading-xs)` (16px) |
| Icon size | `var(--ai-icon-size-sm)` (16px) |

### Focus

| Property | Token |
|---|---|
| Outline | `2px solid var(--ai-surface-brand); outline-offset: -2px` |

---

## Token gaps

| Gap | Figma value | Resolution |
|---|---|---|
| 172px (standalone wrapper width) | `172px` | Approved raw — sub-token optical, Figma value |
| Text colour | `--ai-btn-tertiary-text` (inactive), `--ai-btn-secondary-text-hover` (active) | Substituted with `--ai-text-primary`. Both Figma tokens currently resolve to the same value (#212123). Substitution keeps the semantic cleaner — text colour in a non-button context shouldn't reference button tokens. Flagged for designer to consider adding `--ai-text-on-segment` (or similar) if a different value is ever needed. |

---

## Interaction model

Click on either segment:
1. Flips `data-theme="dark"` on `<html>` (sets for Dark, removes for Light)
2. Persists choice to `localStorage` under key `'demo-theme'`
3. Syncs every `.theme-toggle` on the page (`aria-pressed` updated)
4. Listens for `storage` events so cross-tab / cross-instance changes
   propagate

The localStorage key `'demo-theme'` is shared with `src/components/dark-mode-toggle.js`
(the demo-page floating gear toolbar) so the two stay in sync if a page uses both.

---

## Cross-context notes

- **Distinct from `dark-mode-toggle.js`** — that script renders a fixed gear-tab
  on every demo page (for QA). ThemeToggle is an inline app-level control suitable
  for embedding inside dropdowns, settings panels, etc. Both control the same
  underlying `data-theme` attribute and the same localStorage key.
- Used inside **Dropdown** Type=User menu (`src/components/Dropdown/`).

---

## Accessibility

- Each segment is a `<button>` with `aria-pressed` reflecting active state.
- Icons have `aria-hidden="true"` (the visible label is the accessible name).
- Standalone touch target meets WCAG: 40px wrapper + 32px segment buttons exceed
  the 24px minimum when paired with surrounding click targets.

---

## Dependencies

- **Lucide** for `sun` and `moon` icons.

---

## History

- 2026-05-27: Initial scaffold. Built from Figma component set `2699:2052` (Dropdowns
  page). Token gaps documented for the 172px standalone width and the
  button-token-in-non-button-context substitution.
