# Checkbox — Figma Notes

## Figma Source

- **URL:** https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2043-2985
- **File:** Affino AI — Design System
- **Node:** `2043:2985`

## Configurations

### States

| State | Trigger | Visual | Notes |
|---|---|---|---|
| Initial | — | `--ai-border-secondary` border, `--ai-surface-minimal` bg, `--ai-radius-sm` | Unchecked resting state |
| Checked | Native `checked` attribute | `--ai-surface-brand` bg, `--ai-border-brand` border, white check icon | Lucide `check` icon (14x14) in `--ai-text-invert` |
| Disabled | Native `disabled` attribute | 50% opacity, `cursor: not-allowed` | Works with both checked and unchecked |

### Optional elements

| Element | Class | Visibility | Notes |
|---|---|---|---|
| Label text | `.checkbox__label` | Always shown | `--ai-text-primary`, `--ai-font-fixed-xs` |
| Helper text | `.checkbox__helper` | Optional | `--ai-text-contrast`, `--ai-font-fixed-xxs`. Remove from HTML to hide |

### Usage examples

**Single checkbox:**
```html
<label class="checkbox">
  <input class="checkbox__input" type="checkbox">
  <span class="checkbox__indicator">
    <i data-lucide="check"></i>
  </span>
  <span class="checkbox__text">
    <span class="checkbox__label">Accept terms</span>
  </span>
</label>
```

**Checkbox group:**
```html
<fieldset class="checkbox-group">
  <label class="checkbox">
    <input class="checkbox__input" type="checkbox" name="features" value="notifications">
    <span class="checkbox__indicator">
      <i data-lucide="check"></i>
    </span>
    <span class="checkbox__text">
      <span class="checkbox__label">Email notifications</span>
      <span class="checkbox__helper">Receive updates by email</span>
    </span>
  </label>
  <label class="checkbox">
    <input class="checkbox__input" type="checkbox" name="features" value="analytics">
    <span class="checkbox__indicator">
      <i data-lucide="check"></i>
    </span>
    <span class="checkbox__text">
      <span class="checkbox__label">Usage analytics</span>
      <span class="checkbox__helper">Help us improve the product</span>
    </span>
  </label>
</fieldset>
```

**Pre-checked checkbox:**
```html
<label class="checkbox">
  <input class="checkbox__input" type="checkbox" checked>
  <span class="checkbox__indicator">
    <i data-lucide="check"></i>
  </span>
  <span class="checkbox__text">
    <span class="checkbox__label">Remember me</span>
  </span>
</label>
```

**Disabled checkbox:**
```html
<label class="checkbox">
  <input class="checkbox__input" type="checkbox" disabled>
  <span class="checkbox__indicator">
    <i data-lucide="check"></i>
  </span>
  <span class="checkbox__text">
    <span class="checkbox__label">Premium feature</span>
    <span class="checkbox__helper">Upgrade to access this feature</span>
  </span>
</label>
```

---

## Variant Matrix

| Variant  | Description                       |
| -------- | --------------------------------- |
| Initial  | Unchecked, default state          |
| Checked  | Checked with brand bg + check icon |
| Disabled | Non-interactive, 50% opacity      |

## CSS Class Mapping

| Figma Variant | CSS Class(es)                          |
| ------------- | -------------------------------------- |
| Initial       | `.checkbox`                            |
| Checked       | `.checkbox` + native `checked` attr    |
| Disabled      | `.checkbox` + native `disabled` attr   |

## Token Mapping

| Figma Property         | CSS Token                        |
| ---------------------- | -------------------------------- |
| Indicator bg           | `--ai-surface-minimal`           |
| Indicator border       | `--ai-border-secondary`          |
| Indicator radius       | `--ai-radius-sm`                 |
| Checked indicator bg   | `--ai-surface-brand`             |
| Checked border         | `--ai-border-brand`              |
| Check icon color       | `--ai-text-invert`               |
| Focus ring inner       | `--ai-surface-primary`           |
| Focus ring outer       | `--ai-surface-brand-soft`    |
| Label text color       | `--ai-text-primary`              |
| Helper text color      | `--ai-text-contrast`             |
| Label font size        | `--ai-font-fixed-xs`             |
| Helper font size       | `--ai-font-fixed-xxs`            |
| Wrapper gap            | `--ai-spacing-3`                 |
| Label gap              | `--ai-spacing-1`                 |
| Transition             | `--ai-transition-default`        |

## Notes

- Uses native `<input type="checkbox">` — no JavaScript needed for toggle behaviour
- Checked state shows a Lucide `check` icon (14x14) inside the indicator
- Indicator uses `--ai-radius-sm` (rounded square) vs Radio's `--ai-radius-full` (circle)
- Checked background is `--ai-surface-brand` (solid brand fill) vs Radio's ring approach
