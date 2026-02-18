# Sign Up Form — Figma Notes

## Figma Node

**Component URL:** https://www.figma.com/design/8OAAokH2JXhIvGZFrlzeKT/Affino-AI---Design-System?node-id=96-2429&m=dev
**Node ID:** 96:2429
**Component name:** Sign Up form
**Type:** COMPONENT

## Structure

```
Sign Up form  [COMPONENT, VERTICAL, gap: spacing-6]
├── Header  [INSTANCE: 68:5444, HORIZONTAL, gap: spacing-5]
│   ├── Title  [TEXT] "Sign Up"
│   ├── InfoLabel  [INSTANCE, HORIZONTAL, gap: spacing-3]
│   │   ├── "What's this?"  [TEXT]
│   │   └── Icon/16px/Info  [INSTANCE]
│   └── Button "Make Live"  [INSTANCE] ← hidden (Show Buttons: false)
├── Input "First Name"  [INSTANCE, VERTICAL, gap: spacing-3]
│   ├── Label Container → "First Name"  [TEXT]
│   ├── Field  [FRAME, HORIZONTAL, pad: 0/16, radius: 8, bg: surface-primary, border: border-secondary]
│   │   ├── Icon/16px/User
│   │   ├── Text "i.e Tom"  [placeholder]
│   │   └── Icon/16px/X
│   └── Help text "This field is mandatory"
├── Input "Last Name"  [same structure, placeholder "i.e Jones"]
├── Input "Email"  [same structure, icon: Icon/16px/Envelope, placeholder "name@company.com"]
└── Frame 221  [HORIZONTAL, gap: spacing-3, right-aligned]
    ├── Button "Cancel"  [INSTANCE, secondary, border: border-secondary]
    └── Button "Get Started"  [INSTANCE, primary]
```

## Token Mapping

| Layer | Figma Variable ID | Token | CSS Variable |
|---|---|---|---|
| Form gap | VariableID:1:960 | spacing.6 | `--ai-spacing-6` |
| Header gap | VariableID:1:963 | spacing.5 | `--ai-spacing-5` |
| Title fills | VariableID:1:920 | text.primary | `--ai-text-primary` |
| Title fontSize | VariableID:61:2033 | font.size-fluid.xl | `--ai-font-fluid-xl` |
| Title lineHeight | VariableID:1:991 | line height.3 | `--ai-leading-3` |
| Info text fills | VariableID:1:921 | text.secondary | `--ai-text-secondary` |
| Info icon fills | VariableID:1:938 | icon.secondary | `--ai-icon-secondary` |
| Input gap | VariableID:1:957 | spacing.3 | `--ai-spacing-3` |
| Label fills | VariableID:1:920 | text.primary | `--ai-text-primary` |
| Field bg | VariableID:1:916 | surface.primary | `--ai-surface-primary` |
| Field border | VariableID:50:1769 | border.secondary | `--ai-border-secondary` |
| Field pad L/R | VariableID:1:963 | spacing.5 | `--ai-spacing-5` |
| Field radius | VariableID:2:292 | border.radius-md | `--ai-radius-md` |
| Input icon fills | VariableID:1:922 | text.contrast | `--ai-text-contrast` |
| Input text fills | VariableID:1:922 | text.contrast | `--ai-text-contrast` |
| Help text fills | VariableID:1:921 | text.secondary | `--ai-text-secondary` |
| Cancel bg | VariableID:1:945 | compnonents.button.secondary | `--ai-btn-secondary` |
| Cancel border | VariableID:50:1769 | border.secondary | `--ai-border-secondary` |
| Cancel text | VariableID:1:920 | text.primary | `--ai-text-primary` |
| Get Started bg | VariableID:1:941 | compnonents.button.primary | `--ai-btn-primary` |
| Get Started text | VariableID:1:923 | text.invert | `--ai-text-invert` |

## Icon Name Mapping

| Figma Component Name | Lucide Name | Note |
|---|---|---|
| `Icon/16px/Info` | `info` | ✓ exact match |
| `Icon/16px/User` | `user` | ✓ exact match |
| `Icon/16px/X` | `x` | ✓ exact match |
| `Icon/16px/Right Arrow` | `arrow-right` | ✓ exact match |
| `Icon/16px/Envelope` | `mail` | ⚠ mismatch — Figma uses "Envelope", Lucide calls it "mail". Recommend renaming the Figma component to `Icon/16px/Mail` to align naming. |

## Nested Component Properties

| Component | Property | Value | Effect |
|---|---|---|---|
| Header | Show Buttons | `false` | "Make Live" button hidden — not rendered in HTML |
| Header | State | `Default` | |
| Header | Device | `Default` | |

## Notes

- Input icon color uses `--ai-text-contrast` (not `--ai-icon-contrast`) — the Figma variable bound is `text/contrast` (VariableID:1:922), matching the placeholder text color intentionally
- The "Make Live" button exists in the Figma component tree but is hidden via `Show Buttons: false` — it is not rendered in the HTML implementation
- The `form-field` pattern (label + input wrap + help text) appears 3 times — a candidate for extraction into its own `FormField` component
