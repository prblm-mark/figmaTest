# Design Object Editor — token gaps

These are raw values in the prototype that have no `--ao-*` token. The design owner should review
them before any `/build-component` build of the editor. Every other value uses an existing token.

| Property | Value | Selector(s) | Intent |
|---|---|---|---|
| `line-height` | `1.2`, `1.25`, `1.3`, `1.4`, `1.5`, `1.6`, `1.8` | `.doe-tile__label`, `.doe-field__label`, `.doe-help`, `.doe-cell__badge`, `.doe-sec__mod`, `.pv-*` | Dense tool text and pill heights. There are no line-height tokens anywhere in `css/`. |
| `opacity` | `0.35` / `0.4` / `0.45` / `0.5` | `.doe-row.is-dim`, `.doe-cell.is-hidden`, `.doe-tree__item.is-dim`, `.doe-device.is-off` | De-emphasis for: content outside an isolated nested DO, cells hidden at the current breakpoint, and breakpoints switched off. There is no opacity / disabled-state token. |
| `font-family` | `ui-monospace, SFMono-Regular, Menlo, monospace` | `.doe-code` | Outer/Inner CSS fields. There is no monospace font token. |
| `letter-spacing` | `-0.02em` | `.pv-logo` | Mock client logo in the Preview canvas only. Raw letter-spacing is allowed. |
| JS offset | `40px` (menu top), `96px` (scroll padding) | `doe.js` render/scroll | Where the mock context menu opens and how the selection scrolls into view. These are interaction positions, not styles. |

## Decisions the design owner should confirm (not token gaps)

- **Design-object colour = `--ao-accent-purple-*`, design-script colour = `--ao-accent-orange-*`,
  design elements = brand.** These follow Figma's "components are purple" convention. Each accent
  is used here as a semantic role, so it may deserve its own component tokens
  (e.g. `components/editor/object-*`).
- **The Preview canvas forces light CC tokens** (`data-brand="cc"` on the frame) so that client
  content isn't recoloured by the editor's dark mode.
- **24px bordered tool buttons** (`.doe-ibtn--sm`) are below the 44px touch-target rule on purpose.
  The editor is desktop/laptop only (Mark, 2026-11-09).
