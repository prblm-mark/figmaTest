# DragDropFile — Figma Notes

## Figma Source

- **Component set node:** `2043:3377`
- **File:** Affino AI Design System (`Lus07xi8pPXLN87sQIyrEt`)
- **URL:** https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/?node-id=2043:3377

---

## Variant Matrix

| # | Variant       | Description                              |
|---|---------------|------------------------------------------|
| 1 | Default       | Dashed border, upload icon, text prompt  |
| 2 | Active        | Drag-over state, border-brand highlight  |
| 3 | With Button   | Default + Browse files button (btn--sm)  |
| 4 | Error         | Error state, red border + error icon tint|

---

## Configurations

### Variants
- **Default**: dashed border zone with cloud-upload icon and instructional text
- **Active** (`.drag-drop--active`): border colour changes to `--ai-border-brand` during drag-over
- **With Button** (`.drag-drop--with-btn`): includes a `.btn .btn--primary .btn--sm` browse button
- **Error** (`.drag-drop--error`): border-error, icon circle tinted to error, error messaging

### Interaction
- Clicking the zone opens the native file picker
- Dragging files over the zone toggles the active state
- The browse button (when present) also opens the file picker

### Usage
```html
<div class="drag-drop" data-drag-drop>
  <div class="drag-drop__icon-wrap">
    <i data-lucide="upload-cloud" aria-hidden="true"></i>
  </div>
  <div class="drag-drop__text">
    <p class="drag-drop__title"><strong>Click to upload</strong> or drag and drop</p>
    <p class="drag-drop__subtitle">SVG, PNG, JPG or GIF (max. 800x400px)</p>
  </div>
  <!-- Optional: browse button -->
  <button type="button" class="btn btn--primary btn--sm">
    <i data-lucide="search" aria-hidden="true"></i>
    Browse files
  </button>
  <input type="file" class="drag-drop__native" data-drag-native>
</div>
```

---

## Token Mapping

| Figma Property            | CSS Token                            |
|---------------------------|--------------------------------------|
| Zone bg                   | `--ai-surface-primary`               |
| Zone border               | `--ai-border-secondary`              |
| Zone border (active)      | `--ai-border-brand`                  |
| Zone border (error)       | `--ai-border-error`                  |
| Zone radius               | `--ai-radius-lg`                     |
| Zone padding              | `--ai-spacing-7`                     |
| Zone gap                  | `--ai-spacing-5`                     |
| Icon circle bg            | `--ai-surface-brand-contrast-extra`  |
| Icon circle bg (error)    | `--ai-surface-error-contrast`        |
| Icon circle radius        | `--ai-radius-full`                   |
| Icon colour               | `--ai-icon-brand`                    |
| Icon colour (error)       | `--ai-text-error`                    |
| Icon size                 | `--ai-icon-size-lg`                  |
| Title font                | `--ai-font-title`                    |
| Title size                | `--ai-font-fixed-xs`                 |
| Title colour              | `--ai-text-secondary`                |
| Title strong colour       | `--ai-text-primary`                  |
| Subtitle font             | `--ai-font-title`                    |
| Subtitle size             | `--ai-font-fixed-xxs`               |
| Subtitle colour           | `--ai-text-contrast`                 |
| Text group gap            | `--ai-spacing-3`                     |
| Transition                | `--ai-transition-default`            |

---

## Notes

- **280px min-height** is a fixed design value with no corresponding design token. It is hardcoded in CSS as there is no `--ai-*` equivalent.
- The "With Button" variant reuses the existing Button component (`btn btn--primary btn--sm`). `Button.css` must be loaded alongside `DragDropFile.css` when using this variant.
