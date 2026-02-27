# SignUpForm — Figma Notes

## Figma Node
- File: `8OAAokH2JXhIvGZFrlzeKT`
- Component: node `96:2429` — [open in Figma](https://www.figma.com/design/8OAAokH2JXhIvGZFrlzeKT/Affino-AI---Design-System?node-id=96-2429)

## Component Tree

```
SignUpForm (root)
├── Header — src/components/Header/
│   └── InfoLabel — src/components/InfoLabel/
├── Input (×3: First Name, Last Name, Email) — src/components/Input/
└── Button (×2: Cancel/secondary, Get Started/primary) — src/components/Button/
```

## Dependencies

| Component | Path | Status |
|---|---|---|
| Header | `src/components/Header/` | ✓ Built |
| InfoLabel | `src/components/InfoLabel/` | ✓ Built |
| Input | `src/components/Input/` | ✓ Built |
| Button | `src/components/Button/` | ✓ Built |

## Token Mapping

| Property | Figma variable | CSS variable |
|---|---|---|
| Container gap | `--ai-spacing-6` | `--ai-spacing-6` |
| Actions gap | `--ai-spacing-3` | `--ai-spacing-3` |

All other tokens are owned by sub-components.

## Token Gaps / Decisions

| Property | Figma value | Resolution |
|---|---|---|
| Placeholder color | `--text/contrast-2` (#6b7280) | Mapped to `--ai-text-contrast` (approved) |
| Error border | `--ai-text-error` in Figma | Using `--ai-border-error` (user to update Figma) |
| Label container gap | `--size-2-5` (0px) | Updated to `--ai-spacing-5` in Figma (confirmed) |

## Contextual Overrides

| Component | Property | Base value | Override | Reason |
|---|---|---|---|---|
| Header | `.header__title` | `flex-shrink: 0` | `flex: 1` | Title fills space, pushes InfoLabel far right |
| Header | `.header__info` | `flex: 1` | `flex: none` | InfoLabel shrinks to content width |

This is a **Case B contextual override** — Figma sets the title to fill-container within the SignUpForm frame. No equivalent variant exists in the Header component set. Override is scoped to `.signup-form .header__title` / `.signup-form .header__info` in SignUpForm.css.

## Notes
- SignUpForm.css contains layout only — sub-component styles live in their own files
- Refactored from monolithic to composed: Header, Input, Button are now independent components
- InfoLabel text color corrected from `--ai-text-secondary` to `--ai-text-primary` per Figma
