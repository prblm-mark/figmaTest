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
- `.toast` — card (flex, white bg, `--ai-border-secondary`, `--ai-shadow-md`, `--ai-radius-lg`, width `--ai-size-7` 384px)
- `.toast__icon` — 32px status icon chip (status toasts), 20px glyph
- `.toast__message` — status message text
- `.toast__close` — 32px scoped dismiss icon button, 16px glyph (NOT a Button instance — matches Alert's `__close`)
- `.toast--{info|success|danger|warning}` — status (chip bg + glyph colour)
- `.toast--color` — filled fill axis (tinted card + status border/text/close, no chip bg)
- `.toast--notification` — `.toast__content` column + `.toast__name` / `.toast__text` / `.toast__time`; composes Avatar (`.avatar avatar--size-2`)
- `.toast--interactive` — `.toast__content` column + `.toast__title` / `.toast__text` / `.toast__actions`; composes Button (`btn btn--primary btn--sm`, `btn btn--secondary btn--sm`)

## Token Mapping
Shared card: bg `--ai-surface-primary` · border `--ai-border-secondary` · shadow
`--ai-shadow-md` · radius `--ai-radius-lg` · gap/padding `--ai-spacing-4` (status)
/ `--ai-spacing-5` (notification, interactive) · width `--ai-size-7`.

| Property | Plain | Color (filled) |
|---|---|---|
| card background | `--ai-surface-primary` | `--ai-surface-{info\|success\|error\|warning}-soft` |
| card border | `--ai-border-secondary` | `--ai-border-{info\|success\|error\|warning}` |
| icon chip background | `--ai-surface-{…}-soft` | transparent |
| icon glyph | `--ai-surface-{info\|success\|error\|warning}` | same |
| message text | `--ai-text-primary` | `--ai-text-{info\|success\|error\|warning}` |
| close glyph | `--ai-icon-contrast` (grey) | `--ai-surface-{info\|success\|error\|warning}` |

Status/error note: Danger maps to the **error** token family (`--ai-surface-error`,
`--ai-text-error`, `--ai-border-error`) — Figma's "Danger" type.

Typography (all toast text uses `--ai-font-title` in Figma):
| Element | size | weight | line-height | colour |
|---|---|---|---|---|
| status message | `--ai-font-fixed-xs` (14) | regular | `--ai-leading-sm` (20) — user override (Figma: leading-md/24) | primary / status |
| notification name | `--ai-font-fixed-sm` (16) | semibold | `--ai-leading-md` (24) | `--ai-text-primary` |
| notification message | `--ai-font-fixed-xs` (14) | regular | `--ai-leading-sm` (20) | `--ai-text-secondary` |
| notification time | `--ai-font-fixed-xxs` (12) | medium | `--ai-leading-md` (24) | `--ai-text-brand` |
| interactive title | `--ai-font-fixed-sm` (16) | semibold | `--ai-leading-md` (24) | `--ai-text-primary`, letter-spacing `--ai-tracking-5` |
| interactive body | `--ai-font-fixed-xs` (14) | regular | `--ai-leading-sm` (20) | `--ai-text-secondary` |

Sizes: icon chip / close button `--ai-spacing-7` (32) · chip glyph `--ai-icon-size-md`
(20) · close glyph `--ai-icon-size-sm` (16) · chip/close radius `--ai-radius-md` (8) ·
avatar `.avatar--size-2` (32) · notification content gap `--ai-spacing-0-5` (2) ·
interactive content gap `--ai-spacing-1` (4) · actions gap + top padding `--ai-spacing-3` (8).

## Token Gaps
- **`--ai-spacing-0-5` (2px)** — Notification inter-line gap. The designer added the 0.5 step
  to the Figma Tokens scale (path key `0-5`); its `codeSyntax.WEB` was `--ai-spacing-0.5`, but a
  `.` is invalid in a CSS custom-property name (it ends the ident, so `var(--ai-spacing-0.5)`
  errored). Fixed in `style-dictionary.config.mjs` (`name/figma-web` now replaces `.`→`-`), so
  `npm run tokens` emits the valid `--ai-spacing-0-5: 0.125rem`. Resolved — no hardcode.
- No other gaps: all colours/borders/text/radii/shadow/sizes/typography trace to existing `--ai-*` tokens.

## Notes
- **Icons (Lucide):** Info → `info`, Success → `check`, Danger → `x`, Warning →
  `triangle-alert`; dismiss → `x`. (Danger glyph and dismiss are both `x` — as in Figma.)
- **Close is not a Button instance.** Figma's "Button - Dismiss" layer is not a Code
  Connect-mapped Button; built as the scoped `.toast__close` (Alert convention).
- **Interactive actions ARE Button instances** (Code Connect: `btn--primary` / `btn--secondary`, `btn--sm`), natural width (not stretched).
- **Dismiss behaviour:** `Toast.js` (document-delegated, removes `.toast` on `.toast__close`
  click) — mirrors `Alert.js`. Component renders fine without it (button is inert).
- `:focus-visible` on close = `2px solid var(--ai-surface-brand)`; `:hover` dims (opacity).
  Figma specifies no close hover/focus — focus ring is the mandated a11y addition.
- Font family is `--ai-font-title` (Figma binding) for all toast text — same Inter family as `--ai-font-body`.
