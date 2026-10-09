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
- **Active** (`.drag-drop--active`): border colour changes to `--ao-border-brand` during drag-over
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
| Zone bg                   | `--ao-surface-primary`               |
| Zone border               | `--ao-border-secondary`              |
| Zone border (active)      | `--ao-border-brand`                  |
| Zone border (error)       | `--ao-border-error`                  |
| Zone radius               | `--ao-radius-lg`                     |
| Zone padding              | `--ao-spacing-7`                     |
| Zone gap                  | `--ao-spacing-5`                     |
| Icon circle bg            | `--ao-surface-brand-soft-extra`  |
| Icon circle bg (error)    | `--ao-surface-error-soft`        |
| Icon circle radius        | `--ao-radius-full`                   |
| Icon colour               | `--ao-icon-brand`                    |
| Icon colour (error)       | `--ao-text-error`                    |
| Icon size                 | `--ao-icon-size-lg`                  |
| Title font                | `--ao-font-title`                    |
| Title size                | `--ao-font-fixed-xs`                 |
| Title colour              | `--ao-text-secondary`                |
| Title strong colour       | `--ao-text-primary`                  |
| Subtitle font             | `--ao-font-title`                    |
| Subtitle size             | `--ao-font-fixed-xxs`               |
| Subtitle colour           | `--ao-text-contrast`                 |
| Text group gap            | `--ao-spacing-3`                     |
| Transition                | `--ao-transition-default`            |

---

## Notes

- **280px min-height** is a fixed design value with no corresponding design token. It is hardcoded in CSS as there is no `--ao-*` equivalent.
- The "With Button" variant reuses the existing Button component (`btn btn--primary btn--sm`). `Button.css` must be loaded alongside `DragDropFile.css` when using this variant.
