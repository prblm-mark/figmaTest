# Header — Figma Notes

## Figma Node
- File: `8OAAokH2JXhIvGZFrlzeKT`
- Component: node `68:5444` — [open in Figma](https://www.figma.com/design/8OAAokH2JXhIvGZFrlzeKT/Affino-AI---Design-System?node-id=68-5444)

## Variant Matrix

| Prop | Values | CSS |
|---|---|---|
| `showButtons` | true / false | Presence of `.header__actions` in HTML |
| `state` | Default / Tooltip | Tooltip state not yet defined in design context — deferred |
| `device` | Default | Single breakpoint |

## Dependencies
- `InfoLabel` — `src/components/InfoLabel/`
- `Button` — `src/components/Button/`

## Token Mapping

| Property | Figma variable | CSS variable |
|---|---|---|
| Container gap | `--ai-spacing-5` | `--ai-spacing-5` |
| Title font family | `--ai-font-title` | `--ai-font-title` |
| Title font size | `--ai-font-fluid-xl` | `--ai-font-fluid-xl` |
| Title font weight | `--ai-font-bold` | `--ai-font-bold` |
| Title line height | `--ai-leading-3` | `--ai-leading-3` |
| Title color | `--ai-text-primary` | `--ai-text-primary` |
| Actions gap | `--ai-spacing-3` | `--ai-spacing-3` |

## Token Gaps
None — all design values map to `--ai-*` semantic tokens.

## Notes
- InfoLabel takes `flex: 1` — fills space between title and actions
- "Make Live" button in Figma is shown in disabled state (`--ai-btn-disabled`) — rendered as `<button disabled>` using existing Button component
- `state=Tooltip` variant exists in Figma but design context is not defined — implement when tooltip component is available
