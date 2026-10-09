# Checkbox — Figma Notes

## Figma Source

- **URL:** https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2043-2985
- **File:** Affino AI — Design System
- **Node:** `2043:2985`

## Configurations

### States

| State | Trigger | Visual | Notes |
|---|---|---|---|
| Initial | — | `--ao-border-secondary` border, `--ao-surface-minimal` bg, `--ao-radius-sm` | Unchecked resting state |
| Checked | Native `checked` attribute | `--ao-surface-brand` bg, `--ao-border-brand` border, white check icon | Lucide `check` icon (14x14) in `--ao-text-invert` |
| Disabled | Native `disabled` attribute | 50% opacity, `cursor: not-allowed` | Works with both checked and unchecked |

### Optional elements

| Element | Class | Visibility | Notes |
|---|---|---|---|
| Label text | `.checkbox__label` | Always shown | `--ao-text-primary`, `--ao-font-fixed-xs` |
| Helper text | `.checkbox__helper` | Optional | `--ao-text-contrast`, `--ao-font-fixed-xxs`. Remove from HTML to hide |

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
| Indicator bg           | `--ao-surface-minimal`           |
| Indicator border       | `--ao-border-secondary`          |
| Indicator radius       | `--ao-radius-sm`                 |
| Checked indicator bg   | `--ao-surface-brand`             |
| Checked border         | `--ao-border-brand`              |
| Check icon color       | `--ao-text-invert`               |
| Focus ring inner       | `--ao-surface-primary`           |
| Focus ring outer       | `--ao-surface-brand-soft`    |
| Label text color       | `--ao-text-primary`              |
| Helper text color      | `--ao-text-contrast`             |
| Label font size        | `--ao-font-fixed-xs`             |
| Helper font size       | `--ao-font-fixed-xxs`            |
| Wrapper gap            | `--ao-spacing-3`                 |
| Label gap              | `--ao-spacing-1`                 |
| Transition             | `--ao-transition-default`        |

## Notes

- Uses native `<input type="checkbox">` — no JavaScript needed for toggle behaviour
- Checked state shows a Lucide `check` icon (14x14) inside the indicator
- Indicator uses `--ao-radius-sm` (rounded square) vs Radio's `--ao-radius-full` (circle)
- Checked background is `--ao-surface-brand` (solid brand fill) vs Radio's ring approach
