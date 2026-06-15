# Login — Figma Notes

CC Control Centre login screen (Tier=Template). Composes existing DS components
on a centred card. Renders under `[data-brand="cc"]`, so every paint value
resolves to a CC token (brand teal `#3391a4`, `--cc-ui-*` surfaces, etc.).

## Figma Node

- **File:** `ETKqleZdpertwFEo40YB5n` — Affino CC Hybrid · Design System
- **Component frame:** `4254:11692` ("Control Screen")
- **Variants:**
  | Node ID | Variant | Notes |
  |---|---|---|
  | 4254:11691 | Tier=Template, Device=Desktop | px 40, column gap 32, head gap 12, card pad 40, title 22 |
  | 4254:11690 | Tier=Template, Device=Mobile | px 24, column gap 24, head gap 8, card pad 24, title 18 |

  Device axis is implemented responsively via `@media (max-width: 767px)` — no
  `--mobile` modifier class (per project convention).

## Variant × State Matrix

| Axis | Values | Implementation |
|---|---|---|
| Device | Desktop / Mobile | `@media (max-width: 767px)` overrides |
| Tier | Template (fixed) | n/a |

Interactive states live in the composed components (Input hover/focus, Checkbox
checked/focus, Button hover/focus/pressed) — inherited, not redefined here.

## Shell (Figma-bound paint values)

Every shell property traces to a `get_design_context` binding on the variant nodes.

| Wrapper | Property | Desktop token | Mobile token |
|---|---|---|---|
| `.cc-login` (root) | background | `--cc-ui-primary-bg` | (same) |
| `.cc-login` | padding | `--ai-spacing-8` (40) | `--ai-spacing-6` (24) |
| `.cc-login` | layout | flex col, center/center, `min-height:100vh`¹ | (same) |
| `.cc-login__column` | gap | `--ai-spacing-7` (32) | `--ai-spacing-6` (24) |
| `.cc-login__column` | max-width | `--ai-size-9` (512) | (same) |
| `.cc-login__head` | gap | `--ai-spacing-4` (12) | `--ai-spacing-3` (8) |
| `.cc-login__title` | size / leading | `--ai-font-fixed-xl` / `--ai-leading-md` (22/24) | `--ai-font-fixed-md` / `--ai-leading-sm` (18/20) |
| `.cc-login__card` | background | `--cc-ui-secondary-bg` | (same) |
| `.cc-login__card` | gap | `--ai-spacing-6` (24) | (same) |
| `.cc-login__card` | padding | `--ai-spacing-8` (40) | `--ai-spacing-6` (24) |
| `.cc-login__card` | radius | `--ai-radius-lg` (16) | (same) |
| `.cc-login__card` | max-width | `--ai-size-10` (640) | (same) |
| `.cc-login__card` | shadow | `--ai-shadow-sm` ² | (same) |
| `.cc-login__options` | gap | `--ai-spacing-3` (8) | (same) |

¹ Figma's fixed 936px frame uses `justify-center` + `py-[181px]` — an artefact of
the fixed artboard height. In a real full-bleed login the vertical centring is
done with `min-height:100vh` + flex `justify-content:center`; only the horizontal
`px` token is taken literally.

² Figma effect `shadow-1` = `0 1px 2px #00000017` (≈ 9% black). Mapped to the
project's `--ai-shadow-sm` token (closest defined shadow) per the shadow-token rule.

## CSS Class Mapping

| Figma node | CSS class |
|---|---|
| Root frame | `.cc-login` |
| Content column (4252:8997) | `.cc-login__column` |
| Logo + title group (4252:8953) | `.cc-login__head` |
| Affino Logo (4252:8944) | `.cc-login__brand` |
| Title (4252:8952) | `.cc-login__title` |
| Card (4252:8994) | `.cc-login__card` (`<form>`) |
| Email Input (4252:8932) | `.input` + `mail` icon |
| Password Input (4252:8957) | `.input` + `lock` icon |
| Remember row (4252:9006) | `.cc-login__options` |
| Checkbox (4252:8979) | `.checkbox` |
| Forgot password? (4252:9007) | `.cc-login__link` |
| Login Button (4252:8967) | `.btn.btn--primary.cc-login__submit` |
| Footer (4252:9005) | `.cc-login__footer` + `.cc-login__link` |

## Token Mapping

| Figma variable | CSS variable | Role |
|---|---|---|
| `cc/ui/primary-bg` | `--cc-ui-primary-bg` | Page background |
| `cc/ui/secondary-bg` | `--cc-ui-secondary-bg` | Card background |
| `surface/brand` | `--ai-surface-brand` | Wordmark mask paint (teal) |
| `surface/input` | `--ai-surface-input` | Input fields + checkbox box (scoped override) |
| `text/primary` | `--ai-text-primary` | Title, "Remember me", footer text |
| `text/brand` | `--ai-text-brand` | Forgot password / Register Now links |
| `btn/primary/bg` | `--ai-btn-primary-bg` | Login button (via `.btn--primary`) |
| `border/secondary` | `--ai-border-secondary` | Input / checkbox borders |
| `radius/lg` | `--ai-radius-lg` | Card corner radius |
| `size/9`, `size/10` | `--ai-size-9` / `--ai-size-10` | Column / card max-widths |

## Scoped Override

The Figma design paints the Input field background and the Checkbox box with
`surface/input` rather than the components' default `surface/primary`. Implemented
as a `.cc-login`-scoped override (base components unchanged):

```css
.cc-login .input__wrap { background-color: var(--ai-surface-input); }
.cc-login .checkbox__input:not(:checked) + .checkbox__indicator {
  background: var(--ai-surface-input);
}
```

The `:not(:checked)` guard preserves the checked-state brand fill (the
`:checked + .checkbox__indicator` rule has higher specificity anyway, but the
guard makes the intent explicit).

## Logo

The Affino wordmark uses the established CC pattern: a CSS `mask` of
`img/affinoLogo.svg` painted in a colour token (mono), identical to
`.cc-menu__brand`. Painted in `--ai-surface-brand` (teal) for the light page.
Asset dimensions `167×38` are an allowed exception to the no-raw-px rule
(logo/brand asset metadata).

## Backend Handover

Visual/mock front-end only — no real auth. Flagged with `TODO(backend:Login)`
markers (form submit, forgot-password link, register link) and a `Login` surface
entry in `HANDOVER.md` / `docs/handover-manifest.json`.

## Token Gaps

None. Every design value mapped to an existing `--ai-*` / `--cc-*` token.

## Notes

- Lucide icon names: `mail` (email), `lock` (password), `check` (checkbox). All
  exact Lucide kebab-case.
- Clear button (`.input__clear`) from the base Input is omitted — the Figma login
  inputs show only a leading icon + field.
- The "Forgot password?" / "Register Now" links are `title/xs`-style (semibold,
  14px). Both use `--ai-text-brand`.
