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

figma.connect('https://www.figma.com/design/FILE_KEY/...?node-id=XX-YY', {
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

## Known state (2026-08-28)

### Ten files fail to parse and are silently omitted from a publish

`npx figma connect parse` reports these on **stderr**, so a publish looks successful while ten
components get no Dev Mode mapping at all. Check stderr, not just the exit:

```bash
npx figma connect parse 2>&1 >/dev/null | grep -A3 "❌"
```

| File | Error |
|---|---|
| `patterns/Unassigned` · `patterns/TableListing` · `patterns/TableDetail` | InternalError — `Cannot read properties of undefined (reading 'name')` |
| `patterns/SeatingHeader` | Identifier placeholder (`${BAR}`, a module-level const) |
| `components/Toggle` · `components/ThemeToggle` · `components/TableCard` · `components/AttendeeCard` · `cc/patterns/TopNavigation` | ConditionalExpression placeholder (`${a ? b : c}`) |
| `components/SeatingToast` | render body is a conditional, not a tagged template |

**The rule the HTML parser enforces**, which none of the above respect:

- the `example` body must be a **single tagged template literal** — not a conditional, not a block
- every `${}` placeholder must be a **destructured prop or a `figma.*()` call** — never a
  conditional expression, never a module-level constant

So any branching has to move **into a prop** (`figma.enum` / `figma.boolean` returning the markup),
not sit in the template. `Input.stepper.figma.ts` is the worked example: five `figma.enum` props,
one flat template.

### Publishing needs a live token

`npm run code-connect:publish` validates against the Figma API before uploading, so an expired
token fails the whole run with `Failed to fetch node info (403): 403 Token expired` and publishes
**nothing** — including the entries that parse fine. Refresh `FIGMA_ACCESS_TOKEN` in `.env`
(scopes: `file_content:read`, `code_connect:write`).
