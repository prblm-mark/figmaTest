# Design System Governance

This file is read by Claude Code at the start of every session. All rules here are mandatory.

---

## 1. Project Overview

This is a **Figma Design System** project. Designers work in Figma; Claude Code turns Figma
components into production HTML/CSS using **only the design tokens defined below**.

- Token source: `FigmaTokens/` (DTCG JSON exported from Figma)
- Generated CSS: `css/tokens.css` (run `npm run tokens` to rebuild)
- Components: `src/components/<ComponentName>/`
- Global base: `src/styles/base.css`

**Stack:** Vanilla HTML + CSS (no framework). Webpack 5 for bundling.

---

## 2. Design System Tokens

All CSS variables begin with `--ai-`. **Never use raw hex values, arbitrary pixel values, or
named colors in component CSS.** Every visual value must come from the list below.

### Surface (backgrounds)

| Variable | Value | Use |
|---|---|---|
| `--ai-surface-primary` | `#FFFFFF` | Page/card background |
| `--ai-surface-secondary` | `#F3F4F6` | Subtle section background |
| `--ai-surface-contrast` | `#E5E7EB` | Divider areas, table stripes |
| `--ai-surface-invert` | `#111928` | Dark backgrounds |
| `--ai-surface-brand` | `#1C64F2` | Brand/primary action bg |
| `--ai-surface-brand-light` | `#3F83F8` | Hover state on brand |
| `--ai-surface-brand-dark` | `#1A56DB` | Pressed state on brand |
| `--ai-surface-brand-contrast` | `#C3DDFD` | Light brand tint |
| `--ai-surface-brand-contrast-extra` | `#EBF5FF` | Very light brand tint |
| `--ai-surface-error` | `#EF4444` | Error backgrounds |
| `--ai-surface-error-contrast` | `#FBD5D5` | Error tint background |

### Text

| Variable | Value | Use |
|---|---|---|
| `--ai-text-primary` | `#1F2A37` | Body text, headings |
| `--ai-text-secondary` | `#4B5563` | Secondary/supporting text |
| `--ai-text-contrast` | `#6B7280` | Placeholder, captions |
| `--ai-text-invert` | `#FFFFFF` | Text on dark/brand backgrounds |
| `--ai-text-error` | `#EF4444` | Error messages |

### Border / Color

| Variable | Value | Use |
|---|---|---|
| `--ai-border-brand` | `#1C64F2` | Brand-colored borders |
| `--ai-border-primary` | `#111928` | Strong dividers |
| `--ai-border-secondary` | `#E5E7EB` | Default input/card borders |
| `--ai-border-contrast` | `#E5E7EB` | Same as secondary |
| `--ai-border-error` | `#EF4444` | Error state borders |

### Border Radius

| Variable | Value | Use |
|---|---|---|
| `--ai-radius-sm` | `4px` | Tags, badges, small inputs |
| `--ai-radius-md` | `8px` | Buttons, cards, inputs |
| `--ai-radius-lg` | `16px` | Large cards, modals |
| `--ai-radius-xl` | `24px` | Drawers, bottom sheets |
| `--ai-radius-full` | `100px` | Pills, avatars |

### Icon

| Variable | Value | Use |
|---|---|---|
| `--ai-icon-primary` | `#1F2A37` | Default icon color |
| `--ai-icon-secondary` | `#4B5563` | Secondary icon |
| `--ai-icon-contrast` | `#9CA3AF` | Muted/disabled icon |
| `--ai-icon-invert` | `#FFFFFF` | Icon on dark background |
| `--ai-icon-brand` | `#1C64F2` | Brand-colored icon |

### Button Component

| Variable | Value | Use |
|---|---|---|
| `--ai-btn-primary` | `#1C64F2` | Primary button bg |
| `--ai-btn-primary-hover` | `#3F83F8` | Primary hover |
| `--ai-btn-primary-focus` | `#3F83F8` | Primary focus |
| `--ai-btn-primary-pressed` | `#1A56DB` | Primary pressed |
| `--ai-btn-secondary` | `#FFFFFF` | Secondary button bg |
| `--ai-btn-secondary-hover` | `#F9F9FB` | Secondary hover |
| `--ai-btn-secondary-focus` | `#F9F9FB` | Secondary focus |
| `--ai-btn-secondary-pressed` | `#F3F4F6` | Secondary pressed |
| `--ai-btn-disabled` | `#D1D5DB` | Disabled state (all variants) |

### Spacing

| Variable | Value | Use |
|---|---|---|
| `--ai-spacing-1` | `4px` | Micro gaps |
| `--ai-spacing-2` | `6px` | Tight padding |
| `--ai-spacing-3` | `8px` | Small padding |
| `--ai-spacing-4` | `12px` | Medium-small padding |
| `--ai-spacing-5` | `16px` | Standard padding |
| `--ai-spacing-6` | `24px` | Section padding |
| `--ai-spacing-7` | `32px` | Large section gap |
| `--ai-spacing-8` | `40px` | XL gap |
| `--ai-spacing-9` | `48px` | 2XL gap |
| `--ai-spacing-10` | `56px` | 3XL gap |
| `--ai-spacing-11` | `64px` | Section break |
| `--ai-spacing-12` | `72px` | Page section |
| `--ai-spacing-13` | `80px` | Hero gap |

---

## 3. Typography Rules

Font: **Inter** (loaded via Google Fonts in `src/styles/base.css`).

### Font Families

| Variable | Value |
|---|---|
| `--ai-font-title` | `'Inter', sans-serif` |
| `--ai-font-body` | `'Inter', sans-serif` |

### Font Weights

| Variable | CSS Value | Use |
|---|---|---|
| `--ai-font-regular` | `400` | Body text |
| `--ai-font-medium` | `500` | Emphasis |
| `--ai-font-semibold` | `600` | Buttons, subheadings |
| `--ai-font-bold` | `700` | Headings |
| `--ai-font-extrabold` | `800` | Display text |

### Font Sizes (Fixed — Desktop)

| Variable | Value | Use |
|---|---|---|
| `--ai-font-fixed-xxs` | `12px` | Labels, captions |
| `--ai-font-fixed-xs` | `14px` | Small body, metadata |
| `--ai-font-fixed-sm` | `16px` | Body text (default) |
| `--ai-font-fixed-md` | `18px` | Large body |
| `--ai-font-fixed-lg` | `20px` | Small heading |
| `--ai-font-fixed-xl` | `22px` | Heading 5/4 |
| `--ai-font-fixed-2xl` | `26px` | Heading 3 |
| `--ai-font-fixed-3xl` | `28px` | Heading 2 |
| `--ai-font-fixed-4xl` | `32px` | Heading 1 |

### Font Sizes (Fluid — responsive, desktop values)

| Variable | Desktop | Mobile |
|---|---|---|
| `--ai-font-fluid-xxs` | `12px` | `12px` |
| `--ai-font-fluid-xs` | `14px` | `14px` |
| `--ai-font-fluid-sm` | `16px` | `14px` |
| `--ai-font-fluid-md` | `18px` | `16px` |
| `--ai-font-fluid-lg` | `20px` | `18px` |
| `--ai-font-fluid-xl` | `22px` | `20px` |
| `--ai-font-fluid-2xl` | `26px` | `24px` |
| `--ai-font-fluid-3xl` | `28px` | `26px` |
| `--ai-font-fluid-4xl` | `32px` | `30px` |

### Line Heights

| Variable | Value | Use |
|---|---|---|
| `--ai-leading-1` | `16px` | Caption/label |
| `--ai-leading-2` | `24px` | Body default |
| `--ai-leading-3` | `32px` | Heading |
| `--ai-leading-4` | `40px` | Large heading |
| `--ai-leading-5` | `48px` | Display |

---

## 4. Component Architecture

```
src/
└── components/
    └── <ComponentName>/
        ├── <ComponentName>.html       standalone demo page
        ├── <ComponentName>.css        component styles (--ai-* only)
        └── <ComponentName>.figma-notes.md  Figma node URL + property mapping
src/
└── styles/
    └── base.css                       global base; imports css/tokens.css
css/
└── tokens.css                         GENERATED — do not edit manually
```

**Rules:**
- Every `<ComponentName>.css` file imports nothing — it assumes `base.css` and `tokens.css` are loaded by the page
- Every `<ComponentName>.html` links `../../styles/base.css` then `<ComponentName>.css`
- Class names use BEM: `.component`, `.component__element`, `.component--modifier`
- Modifier classes follow the token vocabulary: `--primary`, `--secondary`, `--sm`, `--lg`, etc.

---

## 5. Figma → Code Workflow

**When given a Figma URL, follow these steps:**

1. Call `get_design_context` with the node URL to get layout, spacing, and color info
2. Call `get_variable_defs` to identify which Figma variables are applied to the component
3. Map each Figma variable to its `--ai-*` CSS counterpart using Section 2 above
4. Call `get_code_connect_map` to check if this component already exists in the codebase
5. If new: create `src/components/<Name>/<Name>.css` and `<Name>.html`
6. If existing: update the existing files
7. Generate HTML using semantic elements; CSS using only `--ai-*` variables
8. Write `<Name>.figma-notes.md` with the node URL and property mapping table

**Never** add inline styles. **Never** hardcode values (see Section 7).

---

## 6. Code → Figma Workflow

To push built UI back to Figma:

1. Use the `generate_figma_design` MCP tool with the component HTML/CSS as context
2. The generated Figma frame appears in your current Figma file/page
3. Share the Figma frame URL with the designer for review
4. Designer refines → shares updated URL → restart from Step 5.1

For Code Connect (Org/Enterprise plan only):
- See `src/components/Button/Button.figma-notes.md` for the pattern
- Run `npx figma connect publish --token=$FIGMA_ACCESS_TOKEN` after writing `.figma.js` files

---

## 7. Forbidden Practices

**NEVER do these:**

- `color: #1C64F2` → use `color: var(--ai-surface-brand)`
- `padding: 16px` → use `padding: var(--ai-spacing-5)`
- `font-size: 14px` → use `font-size: var(--ai-font-fixed-xs)`
- `border-radius: 8px` → use `border-radius: var(--ai-radius-md)`
- `font-weight: 600` → use `font-weight: var(--ai-font-semibold)`
- `background: white` → use `background: var(--ai-surface-primary)`
- Importing from `css/style.css` directly in components (use `src/styles/base.css`)
- Editing `css/tokens.css` manually (it is generated by `npm run tokens`)
- Adding Tailwind, Bootstrap, or any other CSS framework
- Creating tokens/variables not prefixed with `--ai-`
- Using `!important` except in utility/accessibility classes

---

## 8. Accessibility Standards

All components must meet **WCAG 2.1 AA**:

- **Color contrast:** Text on background ≥ 4.5:1 (normal text), ≥ 3:1 (large text/UI)
  - `--ai-text-primary` on `--ai-surface-primary`: 12.6:1 ✓
  - `--ai-text-invert` on `--ai-surface-brand`: 4.7:1 ✓
  - `--ai-text-contrast` on `--ai-surface-primary`: 4.6:1 ✓ (barely passes, use sparingly)
- **Focus indicators:** Always use `outline: 2px solid var(--ai-surface-brand)` for `:focus-visible`
- **Semantic HTML:** Use `<button>` for actions, `<a>` for navigation, `<input>` for inputs
- **ARIA:** Add `aria-label`, `aria-disabled`, `aria-pressed` as needed
- **Touch targets:** Minimum 44×44px for interactive elements

---

## 9. Current Components

| Component | Status | Figma URL | Notes |
|---|---|---|---|
| Button | Built | TBD | `src/components/Button/` — primary + secondary variants |

Add rows here as components are built. Format: Component Name, Built/In Progress/Figma Only, Figma URL, Notes.

---

## 10. Adding a New Token

1. Change the value in Figma (Variables panel)
2. Re-export: Figma → Plugins → [your export plugin] → export to `FigmaTokens/`
3. Run `npm run tokens` — `css/tokens.css` regenerates automatically
4. Update Section 2 or 3 of this file with the new token

Do **not** manually edit `FigmaTokens/*.json` — they are the source of truth from Figma.
