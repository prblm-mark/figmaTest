# Breakpoints

Mobile-first responsive scale. All `@media` queries use `min-width`.

## Breakpoint scale

| Name | Token | Value | @media usage | Use |
|---|---|---|---|---|
| sm | `--ai-bp-sm` | `40rem` (640px) | `@media (min-width: 640px)` | Mobile → tablet transition |
| md | `--ai-bp-md` | `48rem` (768px) | `@media (min-width: 768px)` | Tablet → small desktop |
| lg | `--ai-bp-lg` | `64rem` (1024px) | `@media (min-width: 1024px)` | Desktop — sidebar inline, nav arrows appear |
| xl | `--ai-bp-xl` | `80rem` (1280px) | `@media (min-width: 1280px)` | Wide desktop — admin controls inline |
| 2xl | `--ai-bp-2xl` | `96rem` (1536px) | `@media (min-width: 1536px)` | Ultra-wide |

## Rules

### Mobile-first

Base styles = mobile. Add complexity via `min-width` queries. Never use `max-width` for responsive scaling (only for overrides like mobile-only behaviour).

```css
/* Base: mobile */
.component { font-size: var(--ai-font-fixed-xs); }

/* Upgrade at tablet */
@media (min-width: 640px) {
  .component { font-size: var(--ai-font-fixed-sm); }
}
```

### CSS variables in @media

`@media` queries **cannot** use CSS custom properties — this is a CSS spec limitation. Always use the px equivalent:

```css
/* Correct */
@media (min-width: 640px) { ... }

/* Wrong — will not work */
@media (min-width: var(--ai-bp-sm)) { ... }
```

`@container` queries **can** use CSS variables.

### Key breakpoints in the system

| Breakpoint | What changes |
|---|---|
| **640px** (sm) | SuggestedQuestion shows subtitle, grid → 3 columns, title sizes upgrade, icon sizes upgrade |
| **768px** (md) | ChatMain footer input padding removed, subtitle size upgrade |
| **1024px** (lg) | AiChat sidebar becomes inline, SourcesCarousel shows nav arrows, 3-column card layout |
| **1280px** (xl) | ChatHeader admin controls shown inline (gear icon hidden) |

### Container queries

SystemRole uses `@container` queries instead of `@media` for internal layout — the modal's content width determines layout, not the viewport:

```css
@container system-role (max-width: 940px) {
  /* Stacked layout: prompt above sidebar */
}
```

This allows the same component to be full-width (side-by-side) or narrow (stacked) based on its own size, not the screen.

## Figma source

Breakpoint tokens live in the **Scale** collection in the Design System library. They are reference values — not directly used in CSS `@media` rules (see above).
