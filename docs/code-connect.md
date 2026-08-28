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

## What the HTML parser actually accepts

All ten previously-broken files were fixed on 2026-08-28. The rules below are what they violated —
worth reading before writing a new `.figma.ts`, because none of them are documented upstream and
two of the three error messages point at the wrong thing.

### 1. The `example` body must be ONE flat tagged template

Not a conditional, not a block. `example: (p) => cond ? html`…` : html`…`` fails with *"Expected
only a tagged template literal as the body of the render function"*.

### 2. Every `${}` must be a destructured prop or a `figma.*()` call

Rejected: a conditional (`${flag ? a : b}`), a module-level const (`${TOOLBAR}`), a parameterised
helper (`${card('1', true)}`). All branching moves **into a prop** — `figma.enum` and
`figma.boolean` can both return `html` fragments:

```typescript
props: {
  crumbs: figma.enum('Type', { Default: html`<li>…</li>`, Multizone: html`<li>…</li>` }),
  actions: figma.boolean('Show Actions', { true: html`<div>…</div>`, false: html`` }),
}
example: ({ crumbs, actions }) => html`<nav>${crumbs}${actions}</nav>`
```

Two consequences worth planning for: **a prop cannot reference another prop**, so text bound
elsewhere (a name, a seat number) becomes a literal inside a moved fragment; and shared markup has
to be **written out per template**, since a const is not allowed. Duplication is the price of a
working mapping.

Error message caveat: when a file has **no `props` at all**, an unsupported placeholder surfaces as
`InternalError — Cannot read properties of undefined (reading 'name')`, which says nothing useful.
Three files failed that way.

### 3. NO BACKTICKS inside an HTML comment inside a template literal

```html
<!-- the CSS steps both to `sm` and … -->   ← terminates the template. Syntax error.
```

This is plain JavaScript, not a Code Connect rule, but it is invisible in review and the CLI
reports it as *"The second argument to figma.connect() must be an object literal"* — pointing at
the `{` many lines above. It is what kept SeatingHeader broken. Check with:

```bash
node --check <(sed "s|^import.*|const figma={};const html=()=>0;|" path/to/X.figma.ts)
```

### Always read stderr

Failures go to **stderr only**, so a publish looks clean while components are silently dropped:

```bash
npx figma connect parse 2>&1 >/dev/null | grep -A3 "❌"    # must print nothing
```

Current state: **77 files, 86 mappings, zero failures.**

### Publishing needs a live token

`npm run code-connect:publish` validates against the Figma API before uploading, so an expired
token fails the whole run with `Failed to fetch node info (403): 403 Token expired` and publishes
**nothing** — including every entry that parses fine. Refresh `FIGMA_ACCESS_TOKEN` in `.env`
(scopes: `file_content:read`, `code_connect:write`).
