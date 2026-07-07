# Input — Figma Notes

## Figma Node
- File: `Lus07xi8pPXLN87sQIyrEt`
- Component: node `78:2016` — [open in Figma](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=78-2016)

## Configurations

### Sizes

| Size | Class | Height | Padding | Use |
|---|---|---|---|---|
| Base (default) | `.input` | 40px (`--ai-spacing-8`) | 12px (`--ai-spacing-4`) | Standard form inputs |
| Small | `.input.input--sm` | 32px (`--ai-spacing-7`) | 12px (`--ai-spacing-4`) | Compact forms, inline filters |

### States

| State | Trigger | Border colour | Notes |
|---|---|---|---|
| Default | — | `--ai-border-secondary` | Resting state |
| Hover | `:hover` | `--ai-border-brand` | Mouse over the field |
| Focus | `:focus-within` | `--ai-border-brand` + focus ring | Keyboard or click into field |
| Error | `.input--error` | `--ai-border-error` + red focus ring | Validation failed — add class via JS |
| Disabled | `disabled` attribute | — | Not yet implemented in Figma |

### Optional elements

| Element | Class | Visibility | Notes |
|---|---|---|---|
| Label | `.input__label` | Always shown | Remove from HTML to hide |
| Label back button | `.input__label-back` | Optional (Figma `show label back`, hidden by default) | Back button left of the label. Wrap label + button in `.input__label-row`. See below. |
| Left icon | `.input__icon` | Optional | Lucide icon, `--ai-icon-contrast` |
| Clear button | `.input__clear` | Auto — shown when input has value | Uses `:has(:not(:placeholder-shown))`, no JS |
| Help text | `.input__help` | Optional | Below the field. Turns `--ai-text-error` in error state |

**Label back button (`show label back`, added 2026-07-06):**
```html
<div class="input">
  <div class="input__label-row">
    <button type="button" class="input__label-back" aria-label="Back">
      <i data-lucide="arrow-left" aria-hidden="true"></i>
    </button>
    <label class="input__label">First Name</label>
  </div>
  <div class="input__wrap">
    <input class="input__control" type="text" placeholder="i.e Tom">
  </div>
</div>
```
Only wrap the label in `.input__label-row` when the back button is present; a bare
`.input__label` is otherwise unchanged.

### Usage examples

**Standard input with label and help text:**
```html
<div class="input">
  <label class="input__label">First Name</label>
  <div class="input__wrap">
    <input class="input__control" type="text" placeholder="Enter name">
  </div>
  <p class="input__help">Required field</p>
</div>
```

**Small input without label:**
```html
<div class="input input--sm">
  <div class="input__wrap">
    <input class="input__control" type="text" placeholder="Search...">
  </div>
</div>
```

**Error state:**
```html
<div class="input input--error">
  <label class="input__label">Email</label>
  <div class="input__wrap">
    <input class="input__control" type="email" placeholder="Email" value="invalid">
  </div>
  <p class="input__help">Please enter a valid email address</p>
</div>
```

---

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
| show label back=True | `.input__label-row` wraps `.input__label-back` + `.input__label` |
| show label back=False | Bare `.input__label` (no row wrapper needed) |

## Token Mapping

| Property | Figma variable | CSS variable |
|---|---|---|
| Container gap | `--ai-spacing-3` | `--ai-spacing-3` |
| Label font | `--ai-font-title`, `--ai-font-semibold`, `--ai-font-fixed-xs`, `--ai-leading-xs` | same |
| Label color | `--ai-text-primary` | `--ai-text-primary` |
| Label row gap (back btn ↔ label) | `--ai-spacing-3` | `--ai-spacing-3` |
| Back btn bg | `--ai-btn-secondary-bg` (transparent) | `--ai-btn-secondary-bg` |
| Back btn border | `--ai-btn-secondary-border` | `--ai-btn-secondary-border` |
| Back btn padding | `--ai-spacing-2` (6px) | `--ai-spacing-2` |
| Back btn radius | `--ai-radius-sm` (4px) | `--ai-radius-sm` |
| Back btn icon size | 12px | `--ai-icon-size-xs` (0.75rem) |
| Back btn icon/text color | `--ai-btn-secondary-text` | `--ai-btn-secondary-text` |
| Field height (base) | `--ai-spacing-8` | `--ai-spacing-8` |
| Field height (sm) | `--ai-spacing-7` | `--ai-spacing-7` |
| Field padding-x (base) | `--ai-spacing-5` | `--ai-spacing-4` (user-directed change, 2026-06-01) |
| Field padding-x (sm) | `--ai-spacing-4` | `--ai-spacing-4` |
| Field bg | `--ai-surface-primary` | `--ai-surface-primary` |
| Field border (default) | `--ai-border-secondary` | `--ai-border-secondary` |
| Field border (hover/focus) | `--ai-border-brand` | `--ai-border-brand` |
| Field border (error) | `--ai-border-error` | `--ai-border-error` |
| Content gap | `--ai-spacing-3` | `--ai-spacing-3` |
| Icon size | — | `--ai-icon-size-sm` (16px) |
| Icon color | `--ai-icon-contrast` | `--ai-icon-contrast` |
| Input font | `--ai-font-body`, `--ai-font-regular`, `--ai-font-fixed-xs`, `--ai-leading-md` | same |
| Input color (filled) | `--ai-text-primary` | `--ai-text-primary` |
| Placeholder color | `--text/contrast-2` | `--ai-text-contrast` |
| Help text font | `--ai-font-body`, `--ai-font-regular`, `--ai-font-fixed-xxs`, `--ai-leading-xs` | same |
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
- **Label back button (`show label back`, node `3033:5171`):** in Figma this is a **Button
  component instance**, but its geometry (radius-sm, 12px icon, 6px padding, no fixed height)
  matches no variant of our shared Button component. Per user decision (2026-07-06) it is built
  as a **scoped Case B element** (`.input__label-back`) reusing Button's `--ai-btn-secondary-*`
  tokens, rather than the `.btn` component. If a matching xs icon-button variant is later added
  to Button (with its own Figma variant), migrate this to use it.
- **Icon naming mismatch:** the Figma layer is named `Icon/24px/ArrowRight` but the actual
  asset/visual is a **left-pointing arrow** (a back affordance). Implemented with Lucide
  `arrow-left`, which matches the visual and the "back" semantics.
- Hover/pressed on the back button reuse Button's secondary state tokens
  (`--ai-btn-secondary-bg-hover` / `-bg-pressed`); Figma only specifies the default state.
