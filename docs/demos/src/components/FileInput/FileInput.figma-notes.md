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
- **Default**: neutral grey button (`--ai-surface-secondary`)
- **Brand** (`.file-input--brand`): brand-coloured button (`--ai-surface-brand`)
- **Error** (`.file-input--error`): error-coloured button (`--ai-surface-error`), red border on field, error help text

### States
- **Initial**: placeholder text "No file chosen", clear button hidden
- **Selected** (`.file-input--selected`): filename displayed, clear button visible, text colour promoted to `--ai-text-primary`

### Focus
- Focus-within promotes field border to `--ai-border-brand` (or `--ai-border-error` in error state)

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
| Label font           | `--ai-font-title`                  |
| Label weight         | `--ai-font-semibold`               |
| Label size           | `--ai-font-fixed-xs`               |
| Label colour         | `--ai-text-primary`                |
| Button bg (default)  | `--ai-surface-secondary`           |
| Button bg (brand)    | `--ai-surface-brand`               |
| Button bg (error)    | `--ai-surface-error`               |
| Button text (default)| `--ai-text-secondary`              |
| Button text (brand)  | `--ai-btn-primary-text`            |
| Button text (error)  | `--ai-btn-primary-text`            |
| Field bg             | `--ai-surface-primary`             |
| Field border         | `--ai-border-secondary`            |
| Field border (focus) | `--ai-border-brand`                |
| Field border (error) | `--ai-border-error`                |
| Field text (initial) | `--ai-text-contrast`               |
| Field text (selected)| `--ai-text-primary`                |
| Help text colour     | `--ai-text-secondary`              |
| Help text (error)    | `--ai-text-error`                  |
| Icon size            | `--ai-icon-size-sm`                |
| Clear icon colour    | `--ai-icon-contrast`               |
| Container gap        | `--ai-spacing-3`                   |
| Button padding       | `--ai-spacing-5`                   |
| Button padding (sm)  | `--ai-spacing-4`                   |
| Border radius        | `--ai-radius-md`                   |
