# Modal

## Overview

Dialog pattern for alerts, confirmations, forms, feedback, and scrollable content. Composes Button, Input, Textarea, and Checkbox components.

## Figma Reference

- **Component set:** [Modal](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2464-763)
- **File:** Affino AI — Design System (`Lus07xi8pPXLN87sQIyrEt`)

## Variant Matrix

| Node ID | Type |
|---------|------|
| 2464:762 | Default |
| 2464:760 | Small |
| 2464:761 | Confirmation |
| 2464:758 | Form |
| 2464:756 | Large |
| 2464:757 | Scrollable |
| 2464:755 | Feedback Positive |
| 2464:759 | Positive Negative |

## CSS Class Mapping

| Figma Variant | CSS Class |
|---------------|-----------|
| Default (512px) | `.modal` |
| Small (384px) | `.modal.modal--sm` |
| Large (768px) | `.modal.modal--lg` |
| Confirmation (448px) | `.modal.modal--confirm` |
| Feedback Positive | `.modal.modal--feedback` + `.modal__header-icon--positive` |
| Positive Negative | `.modal.modal--feedback` + `.modal__header-icon--negative` |
| Form | `.modal` with `.modal__form` in body |
| Scrollable | `.modal` with `.modal__body--scroll` |

## Token Usage

| Property | Token |
|----------|-------|
| Background | `--ai-surface-primary` |
| Border radius | `--ai-radius-lg` |
| Shadow | `0 0 20px rgba(0,0,0,0.05), 0 2px 2px rgba(0,0,0,0.1)` |
| Header/footer padding | `--ai-spacing-5` (v) / `--ai-spacing-6` (h) |
| Header/footer border | `--ai-border-secondary` |
| Body padding | `--ai-spacing-6` |
| Body paragraph gap | `--ai-spacing-5` |
| Title font | `--ai-font-title` / `--ai-font-fixed-md` / `--ai-font-semibold` |
| Title color | `--ai-text-primary` |
| Body text | `--ai-font-body` / `--ai-font-fixed-xs` / `--ai-text-secondary` |
| Footer button gap | `--ai-spacing-3` |
| Close button size | `--ai-spacing-7` (32px) |
| Close icon size | `--ai-icon-size-md` (20px) |
| Confirmation icon wrap | 56px circle, `--ai-surface-minimal` bg |
| Confirmation icon | `--ai-icon-size-lg`, `--ai-text-error` |
| Feedback header gap | `--ai-spacing-4` |
| Feedback icon circle | `--ai-spacing-8` (40px), `--ai-radius-full` |
| Feedback positive bg | `#dcfeec` (Aqua/50 — primitive, approved) |
| Feedback positive icon | `--ai-surface-success` |
| Feedback negative bg | `#fef3f3` (Red/50 — primitive, approved) |
| Feedback negative icon | `--ai-text-error` |
| Checkbox list gap | `--ai-spacing-4` |

## Dependencies

- **Button** (`src/components/Button/`) — footer actions, close button styling
- **Input** (`src/components/Input/`) — form variant fields
- **Textarea** (`src/components/Textarea/`) — feedback variant text area
- **Checkbox** (`src/components/Checkbox/`) — form "remember me", negative feedback options

## Notes

- Overlay (`.modal-overlay`) included for interactive demo but is not part of the Figma component — it's an implementation detail.
- Scrollable body max-height (360px) is a hardcoded layout dimension.
- Confirmation icon wrap size (56px) is a hardcoded layout dimension.
- The Figma source uses flat frames for buttons/textarea/checkbox — the code composes the real components.
