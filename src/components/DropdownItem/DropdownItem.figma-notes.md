# DropdownItem — Figma Notes

**Figma:** [`node 2699:2149`](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2699-2149)
**Tier:** Component
**Files:** `DropdownItem.css`, `DropdownItem.html`, `DropdownItem.figma.ts`, `DropdownItem.figma-notes.md`

---

## Variant matrix

Two axes: **State** × **Type** = 4 variants.

| Node | State | Type | bg | Font weight | Text colour |
|---|---|---|---|---|---|
| `2699:2148` | Default | Default | transparent | Regular | `--ai-text-primary` |
| `2699:2147` | Hover | Default | `--ai-surface-secondary` | Medium | `--ai-text-primary` |
| `2699:2155` | Default | Warning | transparent | Regular | `--ai-text-primary` |
| `2699:2151` | Hover | Warning | `--ai-surface-error` (red) | Semibold | white (`--ai-text-invert`) |

**Default Warning is visually identical to Default Default.** Only the Hover state of the
Warning variant shows the destructive red treatment.

The Hover state is achieved either via:
- `:hover` pseudo-class (real mouse interaction)
- `.is-hover` class (forces the visual; useful for static demos / docs)

---

## CSS class mapping

| Figma | CSS |
|---|---|
| Wrapper | `.dropdown-item` (`<button>`) |
| Type=Default | (no modifier — base `.dropdown-item`) |
| Type=Warning | `.dropdown-item--warning` |
| State=Default | (no modifier) |
| State=Hover | `:hover` or `.is-hover` |
| Icon | `<i data-lucide="…">` directly inside `.dropdown-item` |
| Label | `<span>` directly inside (or just text node) |
| Selected (existing) | `.dropdown-item--selected` or `aria-current="page"` |

---

## Token mapping

### Base

| Property | Token |
|---|---|
| Display | `flex`, `align-items: center` |
| Gap | `var(--ai-spacing-3)` (8px) |
| Width | `100%` (fills parent dropdown panel) |
| Padding | `var(--ai-spacing-3) var(--ai-spacing-4)` (8px / 12px) |
| Border-radius | `var(--ai-radius-md)` (8px) |
| Background | `transparent` |
| Border | none |
| Text colour | `var(--ai-text-primary)` |
| Font-family | `var(--ai-font-title)` |
| Font-weight | `var(--ai-font-regular)` |
| Font-size | `var(--ai-font-fixed-xs)` (14px) |
| Line-height | `var(--ai-leading-md)` (24px) |
| Icon size | `var(--ai-icon-size-sm)` (16px) |
| Icon colour | `var(--ai-icon-secondary)` |

### Hover (Default type)

| Property | Token |
|---|---|
| Background | `var(--ai-surface-secondary)` |
| Font-weight | `var(--ai-font-medium)` |

### Hover (Warning type)

| Property | Token |
|---|---|
| Background | `var(--ai-surface-error)` |
| Text colour | `#ffffff` (Neutral/0 — primitive, approved) |
| Font-weight | `var(--ai-font-semibold)` |
| Icon colour | `#ffffff` (Neutral/0 — primitive, approved) |

### Focus

| Property | Token |
|---|---|
| Default focus | `outline: 2px solid var(--ai-surface-brand); outline-offset: -2px` |
| Warning focus | Same but with `--ai-border-error` outline colour |

---

## Token gaps

| Gap | Figma value | Resolution |
|---|---|---|
| Warning hover text + icon colour | `Neutral/0` (`#ffffff`) — primitive, no `--ai-*` semantic | Approved as raw `#ffffff` with `/* Neutral/0 — primitive, approved */` comment. **Theme-invariant**: stays white in dark mode (the red bg is also theme-invariant). Substituting `--ai-text-invert` would have been wrong — that token flips to `#1b1b1f` (near-black) in dark mode, breaking contrast on the red bg. |

No structural token gaps. All sizes and other colours map to existing `--ai-*` tokens.

---

## Accessibility

- Rendered as `<button type="button">` for interactive items, or `<a>` for navigation.
- `aria-current="page"` marks the currently-active route (renders as selected).
- `aria-disabled="true"` + native `disabled` attribute trigger the disabled visual.
- Icon-only items must have `aria-label`; label-bearing items use the label as accessible name.

---

## Dependencies

- **Lucide** for icons.

Used inside **Dropdown** (`src/components/Dropdown/`). Dropdown's panel layout supplies
the surrounding chrome (border, shadow, padding) — DropdownItem is only the row.

---

## History

- 2026-05-27: Extracted from Dropdown's inline `.dropdown__item` selectors to match
  Figma's formal componentisation (component set `2699:2149`). Added Type=Warning
  for destructive actions. Dropdown demos updated to compose this class.
