# Elevation & Shadows

## Elevation

Elevation communicates depth — surfaces that float above other surfaces. The system uses two levels.

### The problem elevation solves

- **Light mode:** Shadows alone convey depth. Elevated surfaces stay white.
- **Dark mode:** Shadows are nearly invisible (dark on dark). Elevated surfaces must get **lighter** to communicate "above."

### Elevation levels

| Level | Token | Use |
|---|---|---|
| Base | `--ai-surface-primary` | Page background |
| Level 1 | `--ai-surface-elevated-1` | Cards, dropdowns, popovers, modals |
| Level 2 | `--ai-surface-elevated-2` | Content sitting on an elevated-1 surface |

### Values across modes

| Token | Light | Dark | Chat Light | Chat Dark |
|---|---|---|---|---|
| `--ai-surface-primary` | `#FFFFFF` | `#1B1B1F` | `#FFFFFF` | `#212123` |
| `--ai-surface-elevated-1` | `#FFFFFF` | `#212123` | `#FFFFFF` | `#2E2E32` |
| `--ai-surface-elevated-2` | `#FFFFFF` | `#2E2E32` | `#FFFFFF` | `#3C3C3F` |

Each step is one notch up the Neutral palette in dark mode.

### Components using elevation

| Component | Level | Why |
|---|---|---|
| StyleSettings panel | `elevated-1` | Floating settings modal |
| SystemRole modal | `elevated-1` | Full-screen / floating modal |
| VersionHistoryRow (Selected) | `elevated-1` | Selected row on elevated panel |
| VersionHistoryRow (Live) | `elevated-2` | Highlighted row on elevated panel |
| VersionHistoryRow (Selected & Live) | `elevated-2` | Combined state |
| ChatHeader dropdown | `surface-secondary` | Dropdown on chat surface |

## Shadows

Shadow tokens provide the visual depth cue in light mode and supplementary depth in dark mode.

### Shadow scale

| Token | Light | Dark | Use |
|---|---|---|---|
| `--ai-shadow-sm` | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | `0 1px 3px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.15)` | Small dropdowns, toggle thumbs |
| `--ai-shadow-md` | `0 2px 10px rgba(0,0,0,0.1)` | `0 2px 10px rgba(0,0,0,0.25)` | Tooltips, inputs, menus |
| `--ai-shadow-lg` | `0 0 20px rgba(0,0,0,0.05), 0 2px 2px rgba(0,0,0,0.1)` | `0 0 20px rgba(0,0,0,0.15), 0 2px 2px rgba(0,0,0,0.25)` | Modals, cards, panels |

Dark mode uses **stronger opacities** to maintain visible depth on dark backgrounds.

### When to use

- **`shadow-sm`** — small floating elements close to the surface
- **`shadow-md`** — tooltips, input focus rings, filter popovers
- **`shadow-lg`** — modals (SystemRole, StyleSettings), floating widgets (AiChatMinimised)

### Source

`css/tokens-shadows.css` — static file, manually maintained (shadows cannot be exported as DTCG variables from Figma).

## Gradients

| Token | Direction | Formula | Use |
|---|---|---|---|
| `--ai-gradient-surface-secondary` | `to right` | `transparent(secondary) → secondary` | Edge fade overlays |
| `--ai-gradient-surface-primary` | `to bottom` | `transparent(primary) → primary` | Chat content fade above sticky input |

The chat gradient (`--ai-gradient-surface-primary`) is **re-declared** under `[data-surface="chat"]` and `[data-theme="dark"] [data-surface="chat"]` in `tokens-gradients.css` because CSS custom properties containing gradient values resolve `var()` at definition scope, not use scope.

### Source

`css/tokens-gradients.css` — static file, manually maintained. Uses CSS Relative Color Syntax so dark mode is automatic.
