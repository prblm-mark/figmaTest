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
| `--ai-radius-sm` | `0.25rem` | Tags, badges, small inputs |
| `--ai-radius-md` | `0.5rem` | Buttons, cards, inputs |
| `--ai-radius-lg` | `1rem` | Large cards, modals |
| `--ai-radius-xl` | `1.5rem` | Drawers, bottom sheets |
| `--ai-radius-full` | `6.25rem` | Pills, avatars |

### Icon

| Variable | Value | Use |
|---|---|---|
| `--ai-icon-primary` | `#1F2A37` | Default icon color |
| `--ai-icon-secondary` | `#6B7280` | Secondary icon |
| `--ai-icon-contrast` | `#9CA3AF` | Muted/disabled icon |
| `--ai-icon-invert` | `#FFFFFF` | Icon on dark background |
| `--ai-icon-brand` | `#1C64F2` | Brand-colored icon |

### Button Component

| Variable | Value | Use |
|---|---|---|
| `--ai-btn-primary` | `#1C64F2` | Primary button bg |
| `--ai-btn-primary-text` | `#FFFFFF` | Primary button text (stays white in dark mode) |
| `--ai-btn-primary-hover` | `#3F83F8` | Primary hover |
| `--ai-btn-primary-focus` | `#3F83F8` | Primary focus |
| `--ai-btn-primary-pressed` | `#1A56DB` | Primary pressed |
| `--ai-btn-secondary` | `#FFFFFF` | Secondary button bg |
| `--ai-btn-secondary-hover` | `#F3F4F6` | Secondary hover |
| `--ai-btn-secondary-focus` | `#F3F4F6` | Secondary focus |
| `--ai-btn-secondary-pressed` | `#F3F4F6` | Secondary pressed |
| `--ai-btn-disabled` | `#D1D5DB` | Disabled state (all variants) |

### Spacing

| Variable | Value | Use |
|---|---|---|
| `--ai-spacing-1` | `0.25rem` | Micro gaps |
| `--ai-spacing-2` | `0.375rem` | Tight padding |
| `--ai-spacing-3` | `0.5rem` | Small padding |
| `--ai-spacing-4` | `0.75rem` | Medium-small padding |
| `--ai-spacing-5` | `1rem` | Standard padding |
| `--ai-spacing-6` | `1.5rem` | Section padding |
| `--ai-spacing-7` | `2rem` | Large section gap |
| `--ai-spacing-8` | `2.5rem` | XL gap |
| `--ai-spacing-9` | `3rem` | 2XL gap |
| `--ai-spacing-10` | `3.5rem` | 3XL gap |
| `--ai-spacing-11` | `4rem` | Section break |
| `--ai-spacing-12` | `4.5rem` | Page section |
| `--ai-spacing-13` | `5rem` | Hero gap |

---

## 2a. Dark Mode

**Activation:** Add `data-theme="dark"` to `<html>` or `<body>`.

**Generated file:** `css/tokens-dark.css` (rebuilt by `npm run tokens`; do not edit manually).

All `--ai-*` variables continue to work in dark mode — the override file replaces their values
under the `[data-theme="dark"]` selector. Brand, error, border, spacing, radius, and typography
tokens are **theme-invariant** (same in both themes).

### Tokens that change in dark mode

| Variable | Light value | Dark value |
|---|---|---|
| `--ai-surface-primary` | `#FFFFFF` | `#111928` |
| `--ai-surface-secondary` | `#F3F4F6` | `#1F2A37` |
| `--ai-surface-contrast` | `#E5E7EB` | `#374151` |
| `--ai-surface-invert` | `#111928` | `#F3F4F6` |
| `--ai-text-primary` | `#1F2A37` | `#FFFFFF` |
| `--ai-text-secondary` | `#4B5563` | `#E5E7EB` |
| `--ai-text-contrast` | `#6B7280` | `#9CA3AF` |
| `--ai-text-invert` | `#FFFFFF` | `#111928` |
| `--ai-border-primary` | `#111928` | `#F3F4F6` |
| `--ai-border-secondary` | `#E5E7EB` | `#374151` |
| `--ai-border-contrast` | `#E5E7EB` | `#374151` |
| `--ai-icon-primary` | `#1F2A37` | `#F3F4F6` |
| `--ai-icon-secondary` | `#6B7280` | `#9CA3AF` |
| `--ai-icon-invert` | `#FFFFFF` | `#111928` |
| `--ai-btn-secondary` | `#FFFFFF` | `#111928` |
| `--ai-btn-secondary-hover` | `#F3F4F6` | `#1F2A37` |
| `--ai-btn-secondary-focus` | `#F3F4F6` | `#1F2A37` |
| `--ai-btn-secondary-pressed` | `#F3F4F6` | `#1F2A37` |
| `--ai-btn-disabled` | `#D1D5DB` | `#6B7280` |

### Component dark-mode notes

- **Tooltip:** Fixed dark panel (`#0c121c` = Neutral/950) in both themes. Does **not** invert.
  Uses approved primitives for background and text — see `Tooltip.figma-notes.md`.

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
| `--ai-font-fixed-xxs` | `0.75rem` | Labels, captions |
| `--ai-font-fixed-xs` | `0.875rem` | Small body, metadata |
| `--ai-font-fixed-sm` | `1rem` | Body text (default) |
| `--ai-font-fixed-md` | `1.125rem` | Large body |
| `--ai-font-fixed-lg` | `1.25rem` | Small heading |
| `--ai-font-fixed-xl` | `1.375rem` | Heading 5/4 |
| `--ai-font-fixed-2xl` | `1.625rem` | Heading 3 |
| `--ai-font-fixed-3xl` | `1.75rem` | Heading 2 |
| `--ai-font-fixed-4xl` | `2rem` | Heading 1 |

### Font Sizes (Fluid — responsive, desktop values)

| Variable | Desktop | Mobile |
|---|---|---|
| `--ai-font-fluid-xxs` | `0.75rem` | `0.75rem` |
| `--ai-font-fluid-xs` | `0.875rem` | `0.875rem` |
| `--ai-font-fluid-sm` | `1rem` | `0.875rem` |
| `--ai-font-fluid-md` | `1.125rem` | `1rem` |
| `--ai-font-fluid-lg` | `1.25rem` | `1.125rem` |
| `--ai-font-fluid-xl` | `1.375rem` | `1.25rem` |
| `--ai-font-fluid-2xl` | `1.625rem` | `1.5rem` |
| `--ai-font-fluid-3xl` | `1.75rem` | `1.625rem` |
| `--ai-font-fluid-4xl` | `2rem` | `1.875rem` |

### Line Heights

| Variable | Value | Use |
|---|---|---|
| `--ai-leading-1` | `1rem` | Caption/label |
| `--ai-leading-2` | `1.5rem` | Body default |
| `--ai-leading-3` | `2rem` | Heading |
| `--ai-leading-4` | `2.5rem` | Large heading |
| `--ai-leading-5` | `3rem` | Display |

---

## 4. Icon System

**Library:** [Lucide](https://lucide.dev) — open-source icon set (~1400 icons).

**Critical rule:** Icon names used in Figma components **must exactly match** the Lucide
kebab-case name (e.g. Figma component `arrow-right` → `data-lucide="arrow-right"`).
Check https://lucide.dev/icons for the canonical name before naming anything in Figma.

### Usage in HTML

```html
<!-- Any element with data-lucide is replaced with an inline SVG at runtime -->
<i data-lucide="arrow-right"></i>
<i data-lucide="chevron-down"></i>
<i data-lucide="x"></i>
```

Icons are initialized globally in `js/app.js` — no per-component setup needed.

### Sizing

Lucide SVGs default to 24×24px. Override with CSS using spacing or fixed-pixel tokens:

```css
/* Standard sizes */
.icon--sm  { width: 16px; height: 16px; } /* --ai-spacing-5 equivalent */
.icon--md  { width: 20px; height: 20px; } /* default for body context */
.icon--lg  { width: 24px; height: 24px; } /* default Lucide size */
.icon--xl  { width: 32px; height: 32px; } /* --ai-spacing-7 equivalent */
```

Do not use arbitrary pixel sizes — stick to the values above.

### Color

Lucide SVGs use `currentColor` for stroke, so icon color is inherited from CSS `color`.
Always set icon color via `--ai-icon-*` tokens:

```css
.icon               { color: var(--ai-icon-primary); }
.icon--secondary    { color: var(--ai-icon-secondary); }
.icon--muted        { color: var(--ai-icon-contrast); }
.icon--invert       { color: var(--ai-icon-invert); }
.icon--brand        { color: var(--ai-icon-brand); }
```

### Stroke width

Default stroke-width is `2`. For a lighter feel use `1.5`; for bold use `2.5`.
Set globally or per-component via the `attrs` option — do not set per-element inline.

### Common icons (reference)

| Use case | Lucide name | Figma component name |
|---|---|---|
| Close / dismiss | `x` | `x` |
| Confirm / success | `check` | `check` |
| Alert / warning | `triangle-alert` | `triangle-alert` |
| Info | `info` | `info` |
| Search | `search` | `search` |
| Next / forward | `arrow-right` | `arrow-right` |
| Back | `arrow-left` | `arrow-left` |
| Expand | `chevron-down` | `chevron-down` |
| Collapse | `chevron-up` | `chevron-up` |
| Menu | `menu` | `menu` |
| Settings | `settings` | `settings` |
| Edit | `pencil` | `pencil` |
| Delete | `trash-2` | `trash-2` |
| Add | `plus` | `plus` |
| Link / external | `external-link` | `external-link` |

Full icon list: https://lucide.dev/icons

### In production builds

For tree-shaking, replace the wildcard import in `js/app.js` with named imports:

```js
import { createIcons, ArrowRight, ChevronDown, X, Check } from 'lucide';
createIcons({ icons: { ArrowRight, ChevronDown, X, Check } });
```

---

## 5. Component Architecture

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

## 6. Figma → Code Workflow

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

## 7. Code → Figma Workflow

To push built UI back to Figma:

1. Use the `generate_figma_design` MCP tool with the component HTML/CSS as context
2. The generated Figma frame appears in your current Figma file/page
3. Share the Figma frame URL with the designer for review
4. Designer refines → shares updated URL → restart from Step 5.1

For Code Connect (Org/Enterprise plan only):
- See `src/components/Button/Button.figma-notes.md` for the pattern
- Run `npx figma connect publish --token=$FIGMA_ACCESS_TOKEN` after writing `.figma.js` files

---

## 8. Token Usage Rules

### Priority order when mapping a Figma property to CSS

1. **Semantic token exists** → always use the `--ai-*` CSS variable. No exceptions.
2. **Anything else** — no `--ai-*` semantic token maps to this value (whether it's a Figma
   primitive, an arbitrary hex, or anything unknown) → **STOP. Do not write CSS for that
   property. Ask the user how to proceed before continuing the build.**

Report what was found: the property name, the Figma value, and the primitive name if
identifiable (e.g. "alert hover uses Red/400 = `#f87171` — no semantic token exists, ok to use primitive?"). The user decides: add a semantic token, approve using the primitive, or handle it another way.

### Forbidden

- `color: #1C64F2` → use `color: var(--ai-surface-brand)` *(semantic token exists)*
- `padding: 16px` → use `padding: var(--ai-spacing-5)`
- `font-size: 14px` → use `font-size: var(--ai-font-fixed-xs)`
- `border-radius: 8px` → use `border-radius: var(--ai-radius-md)`
- `font-weight: 600` → use `font-weight: var(--ai-font-semibold)`
- `background: white` → use `background: var(--ai-surface-primary)`
- `color: #9CA3AF` on an icon → use `color: var(--ai-icon-contrast)`
- Using emoji, Unicode symbols, or other icon libraries instead of Lucide
- Hardcoding icon SVG markup inline — always use `data-lucide="name"` and let `createIcons()` render it
- Importing from `css/style.css` directly in components (use `src/styles/base.css`)
- Editing `css/tokens.css` manually (it is generated by `npm run tokens`)
- Adding Tailwind, Bootstrap, or any other CSS framework
- Creating tokens/variables not prefixed with `--ai-`
- Using `!important` except in utility/accessibility classes

---

## 9. Accessibility Standards

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

## 10. Current Components

| Component | Status | Figma URL | Notes |
|---|---|---|---|
| Button | Built | [node 53:2489](https://www.figma.com/design/8OAAokH2JXhIvGZFrlzeKT/Affino-AI---Design-System?node-id=53-2489) | `src/components/Button/` — primary, secondary, tertiary, alert, alert-outline, icon-only variants. Alert hover/pressed use Red/400+600 primitives (approved). |
| InfoLabel | Built | [node 68:4410](https://www.figma.com/design/8OAAokH2JXhIvGZFrlzeKT/Affino-AI---Design-System?node-id=68-4410) | `src/components/InfoLabel/` — No Label=False (text+icon), No Label=True (icon only) |
| Input | Built | [node 78:2016](https://www.figma.com/design/8OAAokH2JXhIvGZFrlzeKT/Affino-AI---Design-System?node-id=78-2016) | `src/components/Input/` — Base + sm sizes, Default/Hover/Focus/Active/Error states |
| Tooltip | Built | [node 68:4490](https://www.figma.com/design/8OAAokH2JXhIvGZFrlzeKT/Affino-AI---Design-System?node-id=68-4490) | `src/components/Tooltip/` — single variant, dark panel. Positioning owned by parent. |
| Header | Built | [node 68:5443](https://www.figma.com/design/8OAAokH2JXhIvGZFrlzeKT/Affino-AI---Design-System?node-id=68-5443) | `src/components/Header/` — State (Default/Tooltip/Discard) × Device (Default/Mobile). Composes Tooltip, InfoLabel, Button. |
| SignUpForm | Built | [node 96:2429](https://www.figma.com/design/8OAAokH2JXhIvGZFrlzeKT/Affino-AI---Design-System?node-id=96-2429) | `src/components/SignUpForm/` — composes Header, InfoLabel, Input, Button. Layout only. |
| Pill | Built | [node 78:2994](https://www.figma.com/design/8OAAokH2JXhIvGZFrlzeKT/Affino-AI---Design-System?node-id=78-2994) | `src/components/Pill/` — single variant, success-coloured status pill. Uses `--ai-surface-success`. |
| Avatar | Built | [node 68:5042](https://www.figma.com/design/8OAAokH2JXhIvGZFrlzeKT/Affino-AI---Design-System?node-id=68-5042) | `src/components/Avatar/` — Size 1–5 (24–80px circles); Checked=True check-circle variant. Show Notification variants not yet built. |
| VersionHistoryRow | Built | [node 78:2957](https://www.figma.com/design/8OAAokH2JXhIvGZFrlzeKT/Affino-AI---Design-System?node-id=78-2957) | `src/components/VersionHistoryRow/` — Default, Live, Selected, Selected & Live variants. Composes Avatar, Pill. |
| VersionHistory | Built | [node 132:3365](https://www.figma.com/design/8OAAokH2JXhIvGZFrlzeKT/Affino-AI---Design-System?node-id=132-3365) | `src/components/VersionHistory/` — composite panel. Composes Header (no-actions, full-width override), VersionHistoryRow, Avatar, Pill, Button. |

Add rows here as components are built. Format: Component Name, Built/In Progress/Figma Only, Figma URL, Notes.

---

## 11. Adding a New Token

1. Change the value in Figma (Variables panel)
2. Re-export: Figma → Plugins → [your export plugin] → export to `FigmaTokens/`
3. Run `npm run tokens` — `css/tokens.css` regenerates automatically
4. Update Section 2 or 3 of this file with the new token

Do **not** manually edit `FigmaTokens/*.json` — they are the source of truth from Figma.
