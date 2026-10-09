# FileInput — Figma Notes

## Figma Source

- **Component set node:** `2043:3128`
- **File:** Affino AI Design System (`Lus07xi8pPXLN87sQIyrEt`)
- **URL:** https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/?node-id=2043:3128

---

## Variant Matrix

| # | Size  | Type    | State    | Node       |
|---|-------|---------|----------|------------|
| 1 | Base  | Default | Initial  | —          |
| 2 | Base  | Default | Selected | —          |
| 3 | Base  | Brand   | Initial  | —          |
| 4 | Base  | Brand   | Selected | —          |
| 5 | Base  | Error   | Initial  | —          |
| 6 | Base  | Error   | Selected | —          |
| 7 | sm    | Default | Initial  | —          |
| 8 | sm    | Default | Selected | —          |
| 9 | sm    | Brand   | Initial  | —          |
| 10| sm    | Brand   | Selected | —          |

---

## Configurations

### Sizes
- **Base** (default): 40px height
- **sm** (`.file-input--sm`): 32px height, smaller padding and font

### Types
- **Default**: neutral grey button (`--ao-surface-secondary`)
- **Brand** (`.file-input--brand`): brand-coloured button (`--ao-surface-brand`)
- **Error** (`.file-input--error`): error-coloured button (`--ao-surface-error`), red border on field, error help text

### States
- **Initial**: placeholder text "No file chosen", clear button hidden
- **Selected** (`.file-input--selected`): filename displayed, clear button visible, text colour promoted to `--ao-text-primary`

### Focus
- Focus-within promotes field border to `--ao-border-brand` (or `--ao-border-error` in error state)

### Usage
```html
<div class="file-input" data-file-input>
  <label class="file-input__label">Upload file</label>
  <div class="file-input__wrap">
    <button type="button" class="file-input__btn" data-file-trigger>
      <i data-lucide="upload" aria-hidden="true"></i>
      Choose file
    </button>
    <div class="file-input__field">
      <span class="file-input__filename">No file chosen</span>
      <button type="button" class="file-input__clear" aria-label="Clear file" data-file-clear>
        <i data-lucide="x" aria-hidden="true"></i>
      </button>
    </div>
  </div>
  <span class="file-input__help">Accepted formats: PNG, JPG, PDF</span>
  <input type="file" class="file-input__native" data-file-native>
</div>
```

---

## Token Mapping

| Figma Property       | CSS Token                          |
|----------------------|------------------------------------|
| Label font           | `--ao-font-title`                  |
| Label weight         | `--ao-font-semibold`               |
| Label size           | `--ao-font-fixed-xs`               |
| Label colour         | `--ao-text-primary`                |
| Button bg (default)  | `--ao-surface-secondary`           |
| Button bg (brand)    | `--ao-surface-brand`               |
| Button bg (error)    | `--ao-surface-error`               |
| Button text (default)| `--ao-text-secondary`              |
| Button text (brand)  | `--ao-btn-primary-text`            |
| Button text (error)  | `--ao-btn-primary-text`            |
| Field bg             | `--ao-surface-primary`             |
| Field border         | `--ao-border-secondary`            |
| Field border (focus) | `--ao-border-brand`                |
| Field border (error) | `--ao-border-error`                |
| Field text (initial) | `--ao-text-contrast`               |
| Field text (selected)| `--ao-text-primary`                |
| Help text colour     | `--ao-text-secondary`              |
| Help text (error)    | `--ao-text-error`                  |
| Icon size            | `--ao-icon-size-sm`                |
| Clear icon colour    | `--ao-icon-contrast`               |
| Container gap        | `--ao-spacing-3`                   |
| Button padding       | `--ao-spacing-5`                   |
| Button padding (sm)  | `--ao-spacing-4`                   |
| Border radius        | `--ao-radius-md`                   |
