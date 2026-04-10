# Spacing & Sizing

## 8px grid system

All spacing and sizing in the design system is built on an **8px base grid**. Most values are multiples of 8, with a few 4px and 6px values for micro adjustments.

The 16px browser default (`1rem`) serves as the baseline — all tokens output `rem` values via `÷16` conversion.

## Spacing scale

Used for padding, margin, and gap. 13 steps from 4px to 80px.

| Token | rem | px | Grid | Use |
|---|---|---|---|---|
| `--ai-spacing-0` | `0rem` | 0 | — | Zero spacing |
| `--ai-spacing-1` | `0.25rem` | 4px | 0.5× | Micro gaps (icon-to-text, inline adjustments) |
| `--ai-spacing-2` | `0.375rem` | 6px | — | Tight padding (non-grid exception) |
| `--ai-spacing-3` | `0.5rem` | 8px | 1× | Small padding, button icon gaps |
| `--ai-spacing-4` | `0.75rem` | 12px | 1.5× | Medium-small padding, table cells |
| `--ai-spacing-5` | `1rem` | 16px | 2× | Standard padding, card padding, input padding |
| `--ai-spacing-6` | `1.5rem` | 24px | 3× | Section padding, modal inner padding |
| `--ai-spacing-7` | `2rem` | 32px | 4× | Large section gap, column gaps |
| `--ai-spacing-8` | `2.5rem` | 40px | 5× | XL gap, modal outer padding |
| `--ai-spacing-9` | `3rem` | 48px | 6× | 2XL gap |
| `--ai-spacing-10` | `3.5rem` | 56px | 7× | Thumbnail sizes, scroll fade width |
| `--ai-spacing-11` | `4rem` | 64px | 8× | Desktop message bubble left offset |
| `--ai-spacing-12` | `4.5rem` | 72px | 9× | Page section spacing |
| `--ai-spacing-13` | `5rem` | 80px | 10× | Textarea minimum height |

### When to use spacing tokens

- **`gap`** — always use spacing tokens
- **`padding`** — always use spacing tokens
- **`margin`** — use spacing tokens (prefer gap over margin where possible)
- **`width` / `height`** — use size tokens (below) for fixed dimensions, spacing tokens for min-height on interactive elements

## Size scale

Fixed-dimension tokens for component and layout widths/heights. Not for spacing between elements.

| Token | rem | px | Use |
|---|---|---|---|
| `--ai-size-1` | `8rem` | 128px | Small fixed containers |
| `--ai-size-2` | `10rem` | 160px | Fade gradient height |
| `--ai-size-3` | `12rem` | 192px | Selector group width |
| `--ai-size-4` | `15rem` | 240px | Sidebar min-width |
| `--ai-size-5` | `17.5rem` | 280px | Sidebar default width |
| `--ai-size-6` | `20rem` | 320px | Medium fixed containers |
| `--ai-size-7` | `24rem` | 384px | Minimised popup width |
| `--ai-size-8` | `28rem` | 448px | Sidebar max-width |
| `--ai-size-9` | `32rem` | 512px | — |
| `--ai-size-10` | `40rem` | 640px | — |
| `--ai-size-11` | `48rem` | 768px | Chat main max-width |
| `--ai-size-12` | `60rem` | 960px | Prompt area max-width |
| `--ai-size-13` | `70rem` | 1120px | — |
| `--ai-size-14` | `80rem` | 1280px | — |

## Icon sizes

Dedicated tokens for icon dimensions. **Never use `--ai-spacing-*` for icon width/height.**

| Token | rem | px | Use |
|---|---|---|---|
| `--ai-icon-size-sm` | `1rem` | 16px | Buttons, labels, inputs, chevrons |
| `--ai-icon-size-md` | `1.25rem` | 20px | Panel headings, WorkingIntro logo |
| `--ai-icon-size-lg` | `1.5rem` | 24px | PromptTemplateItem icons, Lucide default |
| `--ai-icon-size-xl` | `2rem` | 32px | Extra-large icons |

## Border radius

| Token | rem | px | Use |
|---|---|---|---|
| `--ai-radius-sm` | `0.25rem` | 4px | Tags, badges, code blocks, active segmented control |
| `--ai-radius-md` | `0.5rem` | 8px | Buttons, cards, inputs, dropdowns |
| `--ai-radius-lg` | `1rem` | 16px | Large cards, prompt areas, message input |
| `--ai-radius-xl` | `1.5rem` | 24px | Modals, panels (SystemRole, StyleSettings) |
| `--ai-radius-full` | `6.25rem` | 100px | Pills, avatars, toggle tracks |

## Units

| Property type | Unit | Notes |
|---|---|---|
| Spacing, sizing, font-size, line-height, radius | `rem` | All dimension tokens output rem (÷16) |
| Border widths | `px` | Optical, not layout (1px, 2px) |
| Box-shadow offsets | `px` | Optical |
| Letter-spacing | `em` | Scales with element font size |

## Figma source

Spacing, size, icon-size, radius, and breakpoint tokens live in the **Scale** collection in the Design System library. They have no modes — values are identical across all themes.
