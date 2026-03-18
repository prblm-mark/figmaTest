# Icon System

**Library:** [Lucide](https://lucide.dev) — open-source icon set (~1400 icons).

**Critical rule:** Icon names used in Figma components **must exactly match** the Lucide
kebab-case name (e.g. Figma component `arrow-right` -> `data-lucide="arrow-right"`).
Check https://lucide.dev/icons for the canonical name before naming anything in Figma.

## Usage in HTML

```html
<!-- Any element with data-lucide is replaced with an inline SVG at runtime -->
<i data-lucide="arrow-right"></i>
<i data-lucide="chevron-down"></i>
<i data-lucide="x"></i>
```

Icons are initialized globally in `js/app.js` — no per-component setup needed.

## Sizing

Lucide SVGs default to 24x24px. Override with CSS using icon-size tokens:

```css
.icon--sm  { width: 16px; height: 16px; }  /* --ai-icon-size-sm */
.icon--md  { width: 20px; height: 20px; }  /* --ai-icon-size-md */
.icon--lg  { width: 24px; height: 24px; }  /* --ai-icon-size-lg */
.icon--xl  { width: 32px; height: 32px; }  /* --ai-icon-size-xl */
```

Do not use arbitrary pixel sizes — stick to the values above.

## Color

Lucide SVGs use `currentColor` for stroke, so icon color is inherited from CSS `color`.
Always set icon color via `--ai-icon-*` tokens:

```css
.icon               { color: var(--ai-icon-primary); }
.icon--secondary    { color: var(--ai-icon-secondary); }
.icon--muted        { color: var(--ai-icon-contrast); }
.icon--invert       { color: var(--ai-icon-invert); }
.icon--brand        { color: var(--ai-icon-brand); }
```

## Stroke width

Default stroke-width is `2`. For a lighter feel use `1.5`; for bold use `2.5`.
Set globally or per-component via the `attrs` option — do not set per-element inline.

## Common icons (reference)

| Use case | Lucide name |
|---|---|
| Close / dismiss | `x` |
| Confirm / success | `check` |
| Alert / warning | `triangle-alert` |
| Info | `info` |
| Search | `search` |
| Next / forward | `arrow-right` |
| Back | `arrow-left` |
| Expand | `chevron-down` |
| Collapse | `chevron-up` |
| Menu | `menu` |
| Settings | `settings` |
| Edit | `pencil` |
| Delete | `trash-2` |
| Add | `plus` |
| Link / external | `external-link` |

## In production builds

For tree-shaking, replace the wildcard import in `js/app.js` with named imports:

```js
import { createIcons, ArrowRight, ChevronDown, X, Check } from 'lucide';
createIcons({ icons: { ArrowRight, ChevronDown, X, Check } });
```
