# Toast — Figma Notes

## Figma Node
- **File:** `Lus07xi8pPXLN87sQIyrEt` (Affino AI — Design System)
- **Component set:** `2856:3020` (frame "Toasts")
- Tier: **Component**

## Variant matrix (Figma "Type" — single 10-value enum)

| Node ID | Type | Code class(es) | Layout |
|---|---|---|---|
| 2856:3015 | Info | `toast toast--info` | status |
| 2856:3011 | Success | `toast toast--success` | status |
| 2856:3018 | Danger | `toast toast--danger` | status |
| 2856:3013 | Warning | `toast toast--warning` | status |
| 2856:3012 | Info Color | `toast toast--info toast--color` | status (filled) |
| 2856:3014 | Success Color | `toast toast--success toast--color` | status (filled) |
| 2856:3017 | Danger Color | `toast toast--danger toast--color` | status (filled) |
| 2856:3010 | Warning Color | `toast toast--warning toast--color` | status (filled) |
| 2856:3019 | Notification | `toast toast--notification` | avatar + name/message/time |
| 2856:3016 | Interactive | `toast toast--interactive` | title + body + actions |

Modelled as **status × fill** (so the 8 status variants are 4 status classes ×
optional `--color`) plus two standalone layout types. Every row is represented in
Toast.css, Toast.html and this matrix.

## CSS Class Mapping
- `.toast` — card (flex, white bg, `--ao-border-secondary`, `--ao-shadow-md`, `--ao-radius-lg`, width `--ao-size-7` 384px)
- `.toast__icon` — 32px status icon chip (status toasts), 20px glyph
- `.toast__message` — status message text
- `.toast__close` — 32px scoped dismiss icon button, 16px glyph (NOT a Button instance — matches Alert's `__close`)
- `.toast--{info|success|danger|warning}` — status (chip bg + glyph colour)
- `.toast--color` — filled fill axis (tinted card + status border/text/close, no chip bg)
- `.toast--notification` — `.toast__content` column + `.toast__name` / `.toast__text` / `.toast__time`; composes Avatar (`.avatar avatar--size-2`)
- `.toast--interactive` — `.toast__content` column + `.toast__title` / `.toast__text` / `.toast__actions`; composes Button (`btn btn--primary btn--sm`, `btn btn--secondary btn--sm`)

## Token Mapping
Shared card: bg `--ao-surface-primary` · border `--ao-border-secondary` · shadow
`--ao-shadow-md` · radius `--ao-radius-lg` · gap/padding `--ao-spacing-4` (status)
/ `--ao-spacing-5` (notification, interactive) · width `--ao-size-7`.

**Gap override (user):** `--color` (filled) variants tighten gap to `--ao-spacing-2` (6px) —
a deliberate deviation from Figma (which uses `--ao-spacing-4` for all status toasts).

| Property | Plain | Color (filled) |
|---|---|---|
| card background | `--ao-surface-primary` | `--ao-surface-{info\|success\|error\|warning}-soft` |
| card border | `--ao-border-secondary` | `--ao-border-{info\|success\|error\|warning}` |
| icon chip background | `--ao-surface-{…}-soft` | transparent |
| icon glyph | `--ao-surface-{info\|success\|error\|warning}` | same |
| message text | `--ao-text-primary` | `--ao-text-{info\|success\|error\|warning}` |
| close glyph | `--ao-icon-contrast` (grey) | `--ao-surface-{info\|success\|error\|warning}` |

Status/error note: Danger maps to the **error** token family (`--ao-surface-error`,
`--ao-text-error`, `--ao-border-error`) — Figma's "Danger" type.

Typography (all toast text uses `--ao-font-title` in Figma):
| Element | size | weight | line-height | colour |
|---|---|---|---|---|
| status message | `--ao-font-fixed-xs` (14) | regular | `--ao-leading-sm` (20) — user override (Figma: leading-md/24) | primary / status |
| notification name | `--ao-font-fixed-sm` (16) | semibold | `--ao-leading-md` (24) | `--ao-text-primary` |
| notification message | `--ao-font-fixed-xs` (14) | regular | `--ao-leading-sm` (20) | `--ao-text-secondary` |
| notification time | `--ao-font-fixed-xxs` (12) | medium | `--ao-leading-md` (24) | `--ao-text-brand` |
| interactive title | `--ao-font-fixed-sm` (16) | semibold | `--ao-leading-md` (24) | `--ao-text-primary`, letter-spacing `--ao-tracking-5` |
| interactive body | `--ao-font-fixed-xs` (14) | regular | `--ao-leading-sm` (20) | `--ao-text-secondary` |

Sizes: icon chip / close button `--ao-spacing-7` (32) · chip glyph `--ao-icon-size-md`
(20) · close glyph `--ao-icon-size-sm` (16) · chip/close radius `--ao-radius-md` (8) ·
avatar `.avatar--size-2` (32) · notification content gap `--ao-spacing-0-5` (2) ·
interactive content gap `--ao-spacing-1` (4) · actions gap + top padding `--ao-spacing-3` (8).

## Token Gaps
- **`--ao-spacing-0-5` (2px)** — Notification inter-line gap. The designer added the 0.5 step
  to the Figma Tokens scale (path key `0-5`); its `codeSyntax.WEB` was `--ao-spacing-0.5`, but a
  `.` is invalid in a CSS custom-property name (it ends the ident, so `var(--ao-spacing-0.5)`
  errored). Fixed in `style-dictionary.config.mjs` (`name/figma-web` now replaces `.`→`-`), so
  `npm run tokens` emits the valid `--ao-spacing-0-5: 0.125rem`. Resolved — no hardcode.
- No other gaps: all colours/borders/text/radii/shadow/sizes/typography trace to existing `--ao-*` tokens.

## Notes
- **Icons (Lucide):** Info → `info`, Success → `check`, Danger → `x`, Warning →
  `triangle-alert`; dismiss → `x`. (Danger glyph and dismiss are both `x` — as in Figma.)
- **Close is not a Button instance.** Figma's "Button - Dismiss" layer is not a Code
  Connect-mapped Button; built as the scoped `.toast__close` (Alert convention).
- **Interactive actions ARE Button instances** (Code Connect: `btn--primary` / `btn--secondary`, `btn--sm`), natural width (not stretched).
- **Dismiss behaviour:** `Toast.js` (document-delegated, removes `.toast` on `.toast__close`
  click) — mirrors `Alert.js`. Component renders fine without it (button is inert).
- `:focus-visible` on close = `2px solid var(--ao-surface-brand)`; `:hover` dims (opacity).
  Figma specifies no close hover/focus — focus ring is the mandated a11y addition.
- Font family is `--ao-font-title` (Figma binding) for all toast text — same Inter family as `--ao-font-body`.
