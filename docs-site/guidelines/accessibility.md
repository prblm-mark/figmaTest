# Accessibility

All components meet **WCAG 2.1 AA** standards.

## Color Contrast

- Normal text: >= 4.5:1 contrast ratio
- Large text (18px+ bold, or 24px+ regular): >= 3:1
- UI components and graphical objects: >= 3:1

## Focus Indicators

All interactive elements have visible focus indicators:

```css
:focus-visible {
  outline: 2px solid var(--ai-surface-brand);
}
```

Components with custom focus rings use a double box-shadow pattern:

```css
box-shadow: 0 0 0 1px var(--ai-surface-primary),
            0 0 0 3px var(--ai-surface-brand-contrast);
```

## Semantic HTML

- `<button>` for actions (not `<div>` or `<span>`)
- `<a>` for navigation links
- `<input>` for form inputs
- Appropriate heading hierarchy (`h1` > `h2` > `h3`)

## ARIA

- `aria-label` on icon-only buttons
- `aria-expanded` on toggle buttons and dropdowns
- `aria-pressed` on toggle state buttons
- `aria-selected` on selectable items
- `aria-disabled` on disabled elements
- `role="switch"` on toggle switches
- `role="radiogroup"` + `role="radio"` on segmented controls
- `role="tooltip"` on tooltip elements

## Touch Targets

Minimum 44x44px for all interactive elements. Achieved via:
- `min-height` on buttons (40px base, 32px small)
- Padding on clickable areas
- Larger hit areas via `::before` pseudo-elements where needed

## Keyboard Navigation

- All interactive elements reachable via Tab
- Enter/Space to activate buttons and toggles
- Escape to close modals, dropdowns, and popovers
- Arrow keys for radio groups and segmented controls

## Dark Mode

All color tokens have dark mode variants. Dark mode is activated via `data-theme="dark"` on `<html>`. Contrast ratios are maintained in both themes.

## Reduced Motion

Animations respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
