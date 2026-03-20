# Getting Started

## Prerequisites

- Node.js >= 18
- npm

## Install

```bash
npm install
```

## Generate tokens

Rebuild CSS token files from the Figma DTCG export:

```bash
npm run tokens
```

This generates four CSS files:
- `css/tokens.css` — Desktop tokens
- `css/tokens-mobile.css` — Mobile overrides (`@media max-width: 639px`)
- `css/tokens-dark.css` — Dark mode overrides (`[data-theme="dark"]`)
- `css/tokens-minimised.css` — Minimised layout overrides (`[data-layout="minimised"]`)

## Dev server

```bash
npm start
```

Opens the component library index at `localhost:8080`.

## Project structure

```
src/
├── components/     Atomic/leaf components (Tier: component)
├── patterns/       Composed components (Tier: pattern)
├── templates/      Full UI screens (Tier: template)
└── styles/         Global base styles (base.css)
```

Each component folder contains:
- `<Name>.html` — Standalone demo page
- `<Name>.css` — BEM-structured styles using `--ai-*` tokens
- `<Name>.figma-notes.md` — Figma node mapping and variant matrix

## Token prefix

All CSS custom properties use the `--ai-` prefix:

```css
background-color: var(--ai-surface-primary);
color: var(--ai-text-primary);
border-radius: var(--ai-radius-md);
```

## Dark mode

Add `data-theme="dark"` to the `<html>` element:

```html
<html data-theme="dark">
```

## BEM naming

Components follow BEM: `.component`, `.component__element`, `.component--modifier`.

```html
<button class="btn btn--primary btn--sm">
  <i data-lucide="arrow-right" aria-hidden="true"></i>
  Label
</button>
```
