# Header — Figma Notes

## Figma Node
- File: `8OAAokH2JXhIvGZFrlzeKT`
- Component set: node `68:5443` — [open in Figma](https://www.figma.com/design/8OAAokH2JXhIvGZFrlzeKT/Affino-AI---Design-System?node-id=68-5443)

## Variant Matrix

| Node | State | Device | Description |
|---|---|---|---|
| 68:5444 | Default | Default | Desktop row layout, disabled Make Live button |
| 68:5488 | Tooltip | Default | Desktop + absolute tooltip panel below header |
| 68:5498 | Discard | Default | Desktop, two active buttons: Discard Changes + Make Live |
| 68:5452 | Default | Mobile | Stacked layout (title+info column), sm disabled button |
| 68:5463 | Info | Mobile | Stacked + tooltip panel (top: 63px) |
| 68:5476 | Discard | Mobile | Stacked, two active sm buttons: Discard + Make Live |

## CSS Class Mapping

| Figma property | CSS |
|---|---|
| Device=Default | `.header` (default, ≥768px) |
| Device=Mobile | `.header` at `@media (max-width: 767px)` — no modifier class needed |
| State=Tooltip | `.tooltip` present in DOM |
| State=Discard | Different button content in `.header__actions` |
| State=Info | Mobile tooltip-open state — same HTML as Tooltip but with `.header__actions .btn--sm` disabled Make Live |
| showButtons=false | `.header__actions` omitted |

## Dependencies
- `InfoLabel` — `src/components/InfoLabel/`
- `Button` — `src/components/Button/`

## Token Mapping

| Property | Figma variable | CSS variable |
|---|---|---|
| Desktop gap | `--ai-spacing-5` | `--ai-spacing-5` |
| Mobile outer gap | `--ai-spacing-3` | `--ai-spacing-3` |
| Mobile title/info gap | `--ai-spacing-1` | `--ai-spacing-1` |
| Title font | `--ai-font-fluid-xl`, `--ai-font-bold`, `--ai-leading-3` | same |
| Title color | `--ai-text-primary` | `--ai-text-primary` |
| Actions gap | `--ai-spacing-3` | `--ai-spacing-3` |
| Mobile button height | `h-[32px]` = `--ai-spacing-7` | `.header__actions .btn` at `@media max-width:767px` |
| Mobile button padding | `--ai-spacing-4` | same |
| Mobile button font | `--ai-font-fluid-xxs` | same |
| Tooltip bg | `--ai-surface-invert` | `--ai-surface-invert` |
| Tooltip radius | `--ai-radius-lg` | `--ai-radius-lg` |
| Tooltip padding | `--ai-spacing-5` | `--ai-spacing-5` |
| Tooltip text color | `--ai-text-invert` | `--ai-text-invert` |
| Tooltip text font | `--ai-font-body`, `--ai-font-regular`, `--ai-font-fixed-xxs`, `--ai-leading-1` | same |

## Token Gaps
None — all design values map to `--ai-*` semantic tokens.
Tooltip box-shadow (`0 2px 10px rgba(0,0,0,0.15)`) is structural CSS, not tokenised.

## Notes
- `header__title-group` uses `display: contents` on desktop — makes the wrapper transparent to
  the flex layout so title and info slot appear as direct flex children. Switched to `flex-col`
  automatically at `@media (max-width: 767px)` — no `.header--mobile` modifier needed.
- Mobile title renders at 20px (vs 22px desktop) via `--ai-font-fluid-xl` — the fluid token
  handles the breakpoint automatically, no override needed.
- Tooltip is shown/hidden by presence of `.header__tooltip` in the DOM (JS-driven in production).
  `top: 100%` positions it flush below the header regardless of height.
- Discard state: "Discard Changes" uses `btn--alert-outline` (desktop) / `btn--alert-outline btn--sm`
  (mobile). "Make Live" uses `btn--primary` / `btn--primary btn--sm`.
- Desktop Make Live (Default state) is always shown `disabled` per Figma.
- Previously built from node 68:5444 only — missed 5 variants. Fixed by calling `get_metadata`
  on component set 68:5443 first.
