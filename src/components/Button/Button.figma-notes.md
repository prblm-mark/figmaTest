# Button — Figma Notes

## Figma Node

> Right-click the Button component in Figma → "Copy link" to get the URL.
> Paste it here after connecting to the Figma file.

**Component URL:** _(update when Figma file is shared)_

## Property Mapping

| Figma Property | Values | CSS Implementation |
|---|---|---|
| `Variant` | Primary, Secondary | `.btn--primary`, `.btn--secondary` |
| `Size` | Small, Default, Large | `.btn--sm`, _(none)_, `.btn--lg` |
| `State` | Default, Hover, Pressed, Disabled | CSS pseudo-classes + `:disabled` |
| `Label` | text string | element text content |

## Token Mapping

| Figma Variable | CSS Variable | Role |
|---|---|---|
| `compnonents/button/primary` | `--ai-btn-primary` | Primary background |
| `compnonents/button/primary-hover` | `--ai-btn-primary-hover` | Primary hover background |
| `compnonents/button/primary-pressed` | `--ai-btn-primary-pressed` | Primary active background |
| `compnonents/button/secondary` | `--ai-btn-secondary` | Secondary background |
| `compnonents/button/secondary-hover` | `--ai-btn-secondary-hover` | Secondary hover background |
| `compnonents/button/secondary-pressed` | `--ai-btn-secondary-pressed` | Secondary active background |
| `compnonents/button/all disabled` | `--ai-btn-disabled` | Disabled background |
| `text/invert` | `--ai-text-invert` | Primary button text |
| `text/primary` | `--ai-text-primary` | Secondary button text |
| `border/secondary` | `--ai-border-secondary` | Secondary button border |
| `border/radius-md` | `--ai-radius-md` | Default corner radius |
| `border/radius-sm` | `--ai-radius-sm` | Small button corner radius |
| `border/radius-lg` | `--ai-radius-lg` | Large button corner radius |

## Code Connect Path Forward

When the team upgrades to a Figma Org/Enterprise plan, create `Button.figma.js`:

```js
import figma from '@figma/code-connect';
import { Button } from './Button'; // or adjust for vanilla JS

figma.connect(Button, '<FIGMA_NODE_URL>', {
  props: {
    variant: figma.enum('Variant', { Primary: 'primary', Secondary: 'secondary' }),
    size: figma.enum('Size', { Small: 'sm', Default: undefined, Large: 'lg' }),
    disabled: figma.boolean('State', { Disabled: true }),
    label: figma.string('Label'),
  },
  example: ({ variant, size, disabled, label }) => `
    <button class="btn btn--${variant}${size ? ` btn--${size}` : ''}"${disabled ? ' disabled' : ''}>
      ${label}
    </button>
  `,
});
```

## Notes

- Figma exports the component collection key as `compnonents` (typo in source — do not fix in tokens to avoid breaking aliases)
- Font weight `SemiBold` maps to CSS `font-weight: 600`
- Border radius uses `--ai-radius-md` (8px) for default, not `--ai-border-radius-md`
