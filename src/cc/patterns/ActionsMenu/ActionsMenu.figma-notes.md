# ActionsMenu (CC) — Figma Notes

**Figma:** [`node 4146:6684`](https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4146-6684) (CC Hybrid Design System)
**Tier:** Pattern
**Files:** `ActionsMenu.css`, `ActionsMenu.html`, `ActionsMenu.figma.ts`, `ActionsMenu.figma-notes.md`

---

## Variant matrix

Single component (no Type/Device/State axes). Figma renders one ActionsMenu
instance with 6 internal `MenuBtn` layers. The Figma design shows the first
button (Sparkles) with the hover-state background applied — that is a visual
showcase of the hover state, not a permanent treatment of the first button.

| Node | Variant | Notes |
|---|---|---|
| `4146:6684` | Default | Container + 6 stacked MenuBtn icon buttons. First button shown in `.is-hover` state in the Figma reference. |

Per-button states (CSS-only — no JS needed):
- Default (no bg, icon at rest colour)
- Hover (`:hover` or `.is-hover` → `--cc-actions-menu-secondary-bg`)
- Focus (`:focus-visible` → 2px brand outline, -2px offset)
- Disabled (opacity 40%, not-allowed)

---

## CSS class mapping

| Figma | CSS |
|---|---|
| Wrapper (`ActionsMenu`) | `.actions-menu` (`<div>` or `<aside>`) |
| `MenuBtn` (each icon row) | `.actions-menu__btn` (`<button type="button">`) |
| Icon inside button | `<i data-lucide="icon-name">` |

`MenuBtn` is implemented inline as a scoped class rather than extracted as
its own component. The Figma layer named `MenuBtn` uses direct node IDs (no
`I<instance>;<source>` signature), indicating it's a styled layer rather than
a Component Instance — so inline scoped CSS is appropriate.

---

## Token mapping

### Wrapper

| Property | Token | Value |
|---|---|---|
| Background | `var(--cc-actions-menu-primary-bg)` | `#d0dbe1` (CC light), `#334155` (CC dark) |
| Padding | `var(--ai-spacing-4) var(--ai-spacing-3)` | 12px / 8px |
| Gap | `var(--ai-spacing-3)` | 8px |
| Display | `inline-flex` column, centred | — |

Width is implicit: 40px button + 2 × 8px horizontal padding = **56px** total.
No explicit `width` set — wrapper sizes to its content.

### Button

| Property | Token |
|---|---|
| Width × Height | `var(--ai-spacing-8)` × `var(--ai-spacing-8)` (40 × 40) |
| Border-radius | `var(--ai-radius-md)` (8px) |
| Background (default) | `transparent` |
| Background (hover / `.is-hover`) | `var(--cc-actions-menu-secondary-bg)` |
| Icon size | `var(--ai-icon-size-md)` (20px) |
| Icon colour | `var(--cc-actions-menu-icon)` |
| Focus outline | `2px solid var(--ai-surface-brand)`, offset `-2px` |

---

## Token additions (2026-05-27)

A new `--cc-actions-menu-*` token family was added to the CC Semantic tokens
(`CCLight.tokens.json` + `CCDark.tokens.json`):

| Token | Light value | Dark value |
|---|---|---|
| `--cc-actions-menu-primary-bg` | `#d0dbe1` | `#334155` |
| `--cc-actions-menu-secondary-bg` | `#e7edf0` | `#1e293b` |
| `--cc-actions-menu-icon` | `#335562` | `#cbd5e1` |

The three values coincide with existing `--ai-surface-contrast`,
`--ai-surface-secondary`, and `--ai-icon-primary` in CC light — but the
dedicated `--cc-actions-menu-*` family was kept so future re-themes can move
the actions menu independently of the semantic surfaces.

**SD warning:** the token compile emitted a collision warning for
`--cc-actions-menu-icon` (it appears twice in the source with different
values — `#667f89` then `#335562` in light, `#94a3b8` then `#cbd5e1` in dark).
CSS cascade resolves to the second value but the source JSON should be
de-duplicated. Worth a follow-up.

No other token gaps.

---

## Icon inventory

Figma reference uses (top → bottom):

| # | Lucide name | data-name in Figma | Demo `aria-label` |
|---|---|---|---|
| 1 | `sparkles` | `Icon/24px/Sparkles` | AI suggestions |
| 2 | `info` | `Icon/24px/Info` | Info |
| 3 | `star` | `Icon/24px/Star` | Favourite |
| 4 | `a-large-small` | `Icon/24px/ALargeSmall` | Text size |
| 5 | `minimize-2` | `Icon/24px/Minimize2` | Minimise |
| 6 | `printer` | `Icon/24px/Printer` | Print |

The actual icon set / labels depend on the consuming context. The demo's
labels are descriptive placeholders.

---

## Accessibility

- Each button is `<button type="button" aria-label="…">` (icon-only).
- 40 × 40px exceeds the WCAG 44 × 44 touch-target minimum when the rest of the
  surrounding context provides additional spacing (the 8px vertical gap
  between buttons in this menu is the spacing).
- Focus uses a 2px brand-coloured inset outline (offset −2px) so the ring
  stays within the button bounds.
- The hover treatment also serves as the implicit selected/active visual —
  consumers that need a separate selected state can add `.is-hover` or a
  dedicated `--selected` modifier.

---

## Dependencies

- None directly. Uses base tokens + Lucide for icons.

---

## History

- 2026-05-27: Initial pattern scaffold. Built from Figma component
  `4146:6684` (CC Hybrid Design System). New `--cc-actions-menu-*` token
  family added to the CC Semantic source JSONs and regenerated. MenuBtn
  implemented inline (no separate component) since the Figma node IDs are
  direct rather than Component-instance-signatures.
