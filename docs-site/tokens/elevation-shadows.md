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

Seven steps, from the Figma `shadow/*` effect styles (redefined 2026-09-23). Every layer is pure
black; from `sm` up the lower layer has a negative spread, so the shadow is cast downward.

| Token | Light | Dark (× 2) | Use |
|---|---|---|---|
| `--ai-shadow-2xs` | `0 1px 0 rgba(0,0,0,0.05)` | `… 0.1` | Contact line — Seating Planner cards, listing grid cards |
| `--ai-shadow-xs` | `0 1px 2px rgba(0,0,0,0.05)` | `… 0.1` | — |
| `--ai-shadow-sm` | `0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)` | `… 0.2` | Small dropdowns, toggle thumbs |
| `--ai-shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)` | `… 0.2` | Tooltips, inputs, menus, toasts |
| `--ai-shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)` | `… 0.2` | — |
| `--ai-shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)` | `… 0.2` | Modals, panels, popovers |
| `--ai-shadow-2xl` | `0 25px 50px -12px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)` | `… 0.2` | — |

Two component-specific shadows sit off the scale: `--ai-shadow-card` (an even 10px halo, AudioPlayer)
and `--ai-shadow-cc-rail` (the docked CC sidebar's edge, `none` in dark).

### Dark mode

Dark alphas are **light × 2**, geometry unchanged — a 5–10% black shadow almost vanishes on a dark
surface, so the alpha is scaled to keep the same perceived depth. The one exception is
`--ai-shadow-cc-rail`, which is `none` in dark.

### When to use

- **`shadow-2xs`** — resting cards that only need a contact line
- **`shadow-sm`** — small floating elements close to the surface
- **`shadow-md`** — tooltips, inputs, menus, toasts
- **`shadow-xl`** — modals (SystemRole), panels (AiAssistant, ControlScreen), popovers (DatePicker), floating widgets (AiChatMinimised)
- **`xs`, `lg`, `2xl`** — on the scale, not yet used

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
