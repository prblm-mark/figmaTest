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

## Publishing: what the validator does and does not tell you (2026-08-28)

The first successful publish took several rounds. Four things are worth knowing before the next one.

### 1. Publish is ALL-OR-NOTHING

`figma connect publish` exits non-zero and uploads **nothing** if any single mapping fails
validation. One stale node ID blocks all 86. There is a `--skip-validation` escape hatch — do not
use it: it uploads mappings that reference properties and nodes which do not exist, producing dead
entries in Dev Mode and hiding the real defect.

The practical consequence: an unpublishable mapping must be **parked**, not left in place. Rename
the file to `<Name>.figma.ts.parked` — `figma.config.json` includes `src/**/*.figma.ts`, so the
extension excludes it — and put a header in the file stating the exact Figma-side fix needed to
reinstate it.

### 2. The validation error list is NOT exhaustive

Round 1 reported 22 failures, all in the Affino AI file. After fixing those, **7 completely new
failures appeared in the CC Hybrid file** — they had never been mentioned. Validation appears to
short-circuit per Figma file, so a clean-looking error list only means "nothing else wrong *in the
files it got to*".

**Always re-run `--dry-run` after every fix round, and keep going until it prints
`All Code Connect files are valid`.** Do not estimate remaining work from the first error list.

### 3. A variant URL is never valid — use `variant:` on the SET

The most common failure, 10 of 29 across both rounds:

> `node is not a top level component or component set. Please check that the node is not a variant`

This happens when a session wants different markup per variant and connects the variant node
directly. That is not how it works. Point at the **component set** and restrict with `variant`:

```js
// WRONG — a variant node URL. Parses fine, fails validation.
figma.connect('…?node-id=3470-85482', { example: () => html`…` })

// RIGHT — the set, restricted to one variant.
figma.connect('…?node-id=3470-85483', {
  variant: { Type: 'Empty' },
  example: () => html`…`,
})
```

Verified working: TableCard's Empty / Full / Populated variants each resolve to their own snippet
in `get_code_connect_map`, including the `--selected` combinations.

### 4. Property names are case- and space-sensitive, and a duplicate variant breaks the whole set

`The property "X" does not exist on the Figma component` has two very different causes:

**(a) A name mismatch.** Figma's property names are literal. Four were wrong:

| code had | Figma wants |
|---|---|
| `show label back` | `Show Label Back` |
| `Show Cta` | `Show CTA` |
| `showSubText` | `Show Sub Text` |
| `filterName` | `Filter Name` |

**(b) A duplicate variant in Figma.** If a component set contains two variants with the identical
name (e.g. two `Type=Empty, State=Default`), the set's property definitions are invalidated and
**every** property reports as non-existent — even ones plainly visible in the variant names. Both
Attendee Card (`3474:89292`) and Article Audio Player (`3069:5884`) had this.

The tell is a contradiction from `list_file_components_for_code_connect`: `hasVariants: true`
alongside `properties: {}`. When you see that pairing, call `get_metadata` on the set and look for
two children with the same name — it is a Figma defect, not a mapping bug, and no code change can
fix it.

### Getting the authoritative node IDs

Never read a component-set node ID off the canvas or reuse one from a parent's design context.
Call `list_file_components_for_code_connect` on the file and match by name — it returns every
COMPONENT and COMPONENT_SET with its real `nodeId` and full `properties`. Note it is not
exhaustive either: `3470:84951` validated but was absent from the list, and separately turned out
not to exist at all. Cross-check a suspicious ID with `get_metadata`, which errors loudly on a
node that is not there.

