# Code Connect

Code Connect makes Figma Dev Mode show real production HTML/CSS snippets instead of
auto-generated code when a designer inspects a component.

## Files

| File | Purpose |
|---|---|
| `figma.config.json` | Code Connect config — parser + include glob |
| `.env` | `FIGMA_ACCESS_TOKEN=...` — **not committed** (see `.env.example`) |
| `src/**/*.figma.ts` | One file per component; maps Figma variant props to HTML classes |

## Publish

```bash
cp .env.example .env   # first time only — add your real token
npm run code-connect:publish
```

Token scopes required: `file_content:read`, `code_connect:write`.

## When to update `.figma.ts` files

- A new component is built -> create a new `.figma.ts` in its directory
- Figma variant property names or values change -> update the matching `figma.enum()`
- CSS class names are renamed -> update the mapped string values

## `.figma.ts` pattern

```typescript
import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/...?node-id=XX-YY', {
  props: {
    type: figma.enum('Type', {
      Default: 'btn--primary',
      Secondary: 'btn--secondary',
    }),
    size: figma.enum('Size', {
      base: '',
      sm: 'btn--sm',
    }),
  },
  example: ({ type, size }) => html`
    <button class="btn ${type} ${size}">Label</button>
  `,
})
```

## Token update workflow

Use `/pull-tokens` after re-exporting token files from Figma. The skill runs
`npm run tokens`, diffs the generated CSS, and identifies affected components.
