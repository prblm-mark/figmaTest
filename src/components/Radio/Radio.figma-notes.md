# Radio — Figma Notes

## Figma Source

- **URL:** https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2030-1622
- **File:** Affino AI — Design System
- **Node:** `2030:1622`

## Configurations

### States

| State | Trigger | Visual | Notes |
|---|---|---|---|
| Initial | — | `--ai-border-secondary` border, `--ai-surface-minimal` bg | Unchecked resting state |
| Checked | Native `checked` attribute | 4px `--ai-border-brand` ring, `--ai-surface-primary` center | Ring effect via thick border |
| Disabled | Native `disabled` attribute | 50% opacity, `cursor: not-allowed` | Works with both checked and unchecked |

### Optional elements

| Element | Class | Visibility | Notes |
|---|---|---|---|
| Label text | `.radio__label` | Always shown | `--ai-text-primary`, `--ai-font-fixed-xs` |
| Helper text | `.radio__helper` | Optional | `--ai-text-contrast`, `--ai-font-fixed-xxs`. Remove from HTML to hide |

### Usage examples

**Single radio:**
```html
<label class="radio">
  <input class="radio__input" type="radio" name="option" value="one">
  <span class="radio__indicator"></span>
  <span class="radio__text">
    <span class="radio__label">Option one</span>
  </span>
</label>
```

**Radio group (3 items with same name):**
```html
<fieldset class="radio-group">
  <label class="radio">
    <input class="radio__input" type="radio" name="plan" value="free">
    <span class="radio__indicator"></span>
    <span class="radio__text">
      <span class="radio__label">Free</span>
      <span class="radio__helper">Basic features</span>
    </span>
  </label>
  <label class="radio">
    <input class="radio__input" type="radio" name="plan" value="pro" checked>
    <span class="radio__indicator"></span>
    <span class="radio__text">
      <span class="radio__label">Pro</span>
      <span class="radio__helper">All features included</span>
    </span>
  </label>
  <label class="radio">
    <input class="radio__input" type="radio" name="plan" value="enterprise">
    <span class="radio__indicator"></span>
    <span class="radio__text">
      <span class="radio__label">Enterprise</span>
      <span class="radio__helper">Custom pricing</span>
    </span>
  </label>
</fieldset>
```

**Disabled radio:**
```html
<label class="radio">
  <input class="radio__input" type="radio" name="option" value="locked" disabled>
  <span class="radio__indicator"></span>
  <span class="radio__text">
    <span class="radio__label">Unavailable option</span>
    <span class="radio__helper">This option is not available</span>
  </span>
</label>
```

---

## Variant Matrix

| Variant  | Description                  |
| -------- | ---------------------------- |
| Initial  | Unchecked, default state     |
| Checked  | Selected radio indicator     |
| Disabled | Non-interactive, 50% opacity |

## CSS Class Mapping

| Figma Variant | CSS Class(es)                        |
| ------------- | ------------------------------------ |
| Initial       | `.radio`                             |
| Checked       | `.radio` + native `checked` attr     |
| Disabled      | `.radio` + native `disabled` attr    |

## Token Mapping

| Figma Property       | CSS Token                        |
| -------------------- | -------------------------------- |
| Indicator bg         | `--ai-surface-minimal`           |
| Indicator border     | `--ai-border-secondary`          |
| Checked indicator bg | `--ai-surface-primary`           |
| Checked border       | `--ai-border-brand`              |
| Checked border width | `--ai-spacing-1` (4px)           |
| Focus ring inner     | `--ai-surface-primary`           |
| Focus ring outer     | `--ai-surface-brand-soft`    |
| Label text color     | `--ai-text-primary`              |
| Helper text color    | `--ai-text-contrast`             |
| Label font size      | `--ai-font-fixed-xs`             |
| Helper font size     | `--ai-font-fixed-xxs`            |
| Indicator radius     | `--ai-radius-full`               |
| Wrapper gap          | `--ai-spacing-3`                 |
| Label gap            | `--ai-spacing-1`                 |
| Transition           | `--ai-transition-default`        |

## Notes

- Uses native `<input type="radio">` — no JavaScript needed for selection behaviour
- The `name` attribute on radio inputs handles single-select group behaviour natively
- Checked state uses a thick 4px border (`--ai-spacing-1`) to create the filled ring effect
- Disabled state applies `opacity: 0.5` and `cursor: not-allowed`
