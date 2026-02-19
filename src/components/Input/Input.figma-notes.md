# Input — Figma Notes

## Figma Node
- File: `8OAAokH2JXhIvGZFrlzeKT`
- Component: node `78:2016` — [open in Figma](https://www.figma.com/design/8OAAokH2JXhIvGZFrlzeKT/Affino-AI---Design-System?node-id=78-2016)

## Variant × Size × State Matrix

| Size | State | Border token | Height |
|---|---|---|---|
| Base | Default | `--ai-border-secondary` | `--ai-spacing-8` (40px) |
| Base | Hover | `--ai-border-brand` | `--ai-spacing-8` |
| Base | Active | `--ai-border-brand` | `--ai-spacing-8` |
| Base | Focus | `--ai-border-brand` | `--ai-spacing-8` |
| Base | Error | `--ai-border-error` | `--ai-spacing-8` |
| sm | Default | `--ai-border-secondary` | `--ai-spacing-7` (32px) |
| sm | Hover | `--ai-border-brand` | `--ai-spacing-7` |
| sm | Active | `--ai-border-brand` | `--ai-spacing-7` |
| sm | Focus | `--ai-border-brand` | `--ai-spacing-7` |
| sm | Error | `--ai-border-error` | `--ai-spacing-7` |

Hover, Active, and Focus all share the same visual treatment (brand border) — implemented via `:hover` and `:focus-within` on `.input__wrap`.

## CSS Class Mapping

| Figma property | CSS |
|---|---|
| Size=Base | `.input` (default) |
| Size=sm | `.input.input--sm` |
| State=Error | `.input.input--error` |
| Placeholder View=True | Input empty (`:placeholder-shown`) |
| Placeholder View=False | Input filled (`:not(:placeholder-shown)`) — clear button becomes visible |

## Token Mapping

| Property | Figma variable | CSS variable |
|---|---|---|
| Container gap | `--ai-spacing-3` | `--ai-spacing-3` |
| Label font | `--ai-font-title`, `--ai-font-semibold`, `--ai-font-fixed-xs`, `--ai-leading-1` | same |
| Label color | `--ai-text-primary` | `--ai-text-primary` |
| Label container gap | `--ai-spacing-5` | `--ai-spacing-5` |
| Field height (base) | `--ai-spacing-8` | `--ai-spacing-8` |
| Field height (sm) | `--ai-spacing-7` | `--ai-spacing-7` |
| Field padding-x (base) | `--ai-spacing-5` | `--ai-spacing-5` |
| Field padding-x (sm) | `--ai-spacing-4` | `--ai-spacing-4` |
| Field bg | `--ai-surface-primary` | `--ai-surface-primary` |
| Field border (default) | `--ai-border-secondary` | `--ai-border-secondary` |
| Field border (hover/focus) | `--ai-border-brand` | `--ai-border-brand` |
| Field border (error) | `--ai-border-error` | `--ai-border-error` |
| Content gap | `--ai-spacing-3` | `--ai-spacing-3` |
| Icon size | — | 16×16px |
| Icon color | `--ai-icon-contrast` | `--ai-icon-contrast` |
| Input font | `--ai-font-body`, `--ai-font-regular`, `--ai-font-fixed-xs`, `--ai-leading-2` | same |
| Input color (filled) | `--ai-text-primary` | `--ai-text-primary` |
| Placeholder color | `--text/contrast-2` | `--ai-text-contrast` |
| Help text font | `--ai-font-body`, `--ai-font-regular`, `--ai-font-fixed-xxs`, `--ai-leading-1` | same |
| Help text color | `--ai-text-secondary` | `--ai-text-secondary` |
| Error help color | `--ai-text-error` | `--ai-text-error` |

## Token Gaps / Decisions

| Property | Figma value | Resolution |
|---|---|---|
| Placeholder color | `--text/contrast-2` (#6b7280) | Mapped to `--ai-text-contrast` (approved) |
| Error border | `--ai-text-error` in Figma | Using `--ai-border-error` (semantically correct — user to update Figma) |

## Notes
- No Disabled state found in Figma — not implemented. Add if required.
- Clear button uses `:has(:not(:placeholder-shown))` — shows only when input has a value, no JS needed
- Hover and Active share the same visual treatment as Focus (brand border)
