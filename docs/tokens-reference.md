# Design System Token Reference

Complete token tables for the Affino Design System. All CSS variables use the `--ao-` prefix.

---

## Surface (backgrounds)

| Variable | Value | Use |
|---|---|---|
| `--ao-surface-primary` | `#FFFFFF` | Page/card background |
| `--ao-surface-elevated-1` | `#FFFFFF` | Cards, dropdowns, popovers (steps up in dark) |
| `--ao-surface-elevated-2` | `#F1F5F9` | Modals, dialogs (steps up further in dark) |
| `--ao-surface-minimal` | `#F8FAFC` | Very subtle background (Grey/50) |
| `--ao-surface-secondary` | `#E9EEF4` | Subtle section background (Grey/150) |
| `--ao-surface-contrast` | `#D6DEE8` | Divider areas, table stripes (Grey/250) |
| `--ao-surface-invert` | `#1E293B` | Dark backgrounds (Grey/800) |
| `--ao-surface-brand` | `#0094AD` | Brand/primary action bg |
| `--ao-surface-brand-light` | `#009FBA` | Hover state on brand |
| `--ao-surface-brand-dark` | `#007A8D` | Pressed state on brand |
| `--ao-surface-brand-soft` | `#D9F2F2` | Light brand tint (focus rings, active backgrounds) |
| `--ao-surface-brand-soft-extra` | `#EDF5F5` | Very light brand tint (chat msg bubbles, soft backgrounds) |

> **Renamed Apr 2026:** `--ao-surface-brand-contrast` → `--ao-surface-brand-soft`,
> `--ao-surface-brand-contrast-extra` → `--ao-surface-brand-soft-extra`,
> `--ao-surface-error-contrast` → `--ao-surface-error-soft`. These tokens act as soft tinted backgrounds; the new name describes what they do. The `-contrast` suffix is now reserved for muted/mid-grey neutrals (`--ao-text-contrast`, `--ao-icon-contrast`, `--ao-border-contrast`, `--ao-surface-contrast`).

## Text

| Variable | Value | Use |
|---|---|---|
| `--ao-text-primary` | `#172033` | Body text, headings (Grey/850) |
| `--ao-text-secondary` | `#3D4B5F` | Secondary/supporting text (Grey/650) |
| `--ao-text-contrast` | `#64748B` | Placeholder, captions (Grey/500) |
| `--ao-text-invert` | `#FFFFFF` | Text on dark/brand backgrounds |

See **Status / feedback** below for `--ao-text-info`, `--ao-text-success`, `--ao-text-warning`, `--ao-text-error`, `--ao-text-neutral`.

## Border / Color

| Variable | Value | Use |
|---|---|---|
| `--ao-border-brand` | `#30B6C2` | Brand-colored borders |
| `--ao-border-primary` | `#64748B` | Strong dividers (Grey/500) |
| `--ao-border-secondary` | `#E2E8F0` | Default input/card borders (Grey/200) |
| `--ao-border-card` | `#E2E8F0` | Card outlines. Same as border-secondary in every mode except **CCDark**, where it is Grey/750 `#293548` (secondary is Grey/700) |
| `--ao-border-contrast` | `#94A3B8` | Stronger borders (Grey/400) |
| `--ao-border-invert` | `#1E293B` | Borders on inverted/dark surfaces (Grey/800) |

See **Status / feedback** below for `--ao-border-info`, `--ao-border-success`, `--ao-border-warning`, `--ao-border-error`, `--ao-border-neutral`.

## Status / feedback

Theme-aware semantic tokens for alerts, banners, badges, and any UI that signals state. Each status (`info`, `success`, `warning`, `error`, `neutral`) provides four slots — `surface`, `surface-soft` (tinted bg), `text`, and `border` — in both light and dark mode.

**Light mode values:**

| Status | `surface-{status}` | `surface-{status}-soft` | `text-{status}` | `border-{status}` |
|---|---|---|---|---|
| info | `#0094AD` | `#EDF5F5` | `#007A8D` | `#98D9DC` |
| success | `#30A46C` | `#E6F6EB` | `#218358` | `#ADDDC0` |
| warning | `#F76B15` | `#FFEFD6` | `#CC4E00` | `#FFC182` |
| error | `#E5484D` | `#FEEBEC` | `#CE2C31` | `#FDBDBE` |
| neutral | `#334155` | `#F1F5F9` | `#293548` | `#CAD5E2` |

**Dark mode values:**

| Status | `surface-{status}` | `surface-{status}-soft` | `text-{status}` | `border-{status}` |
|---|---|---|---|---|
| info | `#30B6C2` | `#00282F` | `#30B6C2` | `#007A8D` |
| success | `#30A46C` | `#132D21` | `#8ECEAA` | `#218358` |
| warning | `#F76B15` | `#331E0B` | `#EC9455` | `#CC4E00` |
| error | `#E5484D` | `#3B1219` | `#E5484D` | `#CE2C31` |
| neutral | `#64748B` | `#293548` | `#E2E8F0` | `#64748B` |

**Usage:** combine slots for a complete tinted block. Example for an alert:

```css
.alert--success {
  background: var(--ao-surface-success-soft);
  color: var(--ao-text-success);
  border-color: var(--ao-border-success);
}
```

Soft backgrounds use a tinted dark in dark mode (e.g. Aqua/950 for success), keeping the same hue family as the light variant.

## Accent (categorical colour)

Added 2026-09-28. 21 colours × 4 roles in the Semantic collection (`accent/<colour>/<role>` →
`--ao-accent-<colour>-<role>`), each aliased to a primitive. For colour-coding things that have
no status meaning — StatCard fills, category chips, CC dashboard tiles. **Not** a status palette:
use `--ao-surface-success` etc. for meaning.

| Role | Use | Radix ramps | 100–900 ramps | Dark mode |
|---|---|---|---|---|
| `solid` | strong fill | step 9 | 600 | unchanged |
| `solid-fg` | icon/text on `solid` | white | white | unchanged |
| `soft` | tinted fill | step 3 | 100 | Radix 12 / ramp 900 |
| `soft-fg` | icon/text on `soft` | step 11 | 700 | Radix 9 / ramp 400 |

Colours: `blue`, `mid-blue`, `dark-blue`, `muted-teal`, `bright-teal`, `emerald`, `orange`, `pink`,
`red`, `green`, `purple`, `indigo`, `blue-radix`, `teal-radix`, `green-radix`, `jade`, `lagoon`,
`orange-radix`, `red-radix`, `violet-radix`, `lime-radix`.

Contrast exceptions (every fg/bg pair ≥ 3:1 in all 6 modes): `solid-fg` is Grey/850 on
`orange-radix`, `lime-radix`, `bright-teal`, `green`; `soft-fg` is 800 on `bright-teal`, `green`;
dark `soft` is step 13 on `orange-radix`; dark `soft-fg` is step 8 on `violet-radix`.
Legibility exceptions (light `soft`): 200 on `mid-blue`, `dark-blue`; 300 on `green` — their 100
step was invisible on a white card.

**`muted-teal` and `bright-teal` are sourced from Lagoon** (2026-09-28 — the Muted Teal / Bright
Teal ramps are retired from use; nearest Lagoon step per role). `muted-teal`: solid Lagoon 10, white
icon, soft 3 / 11, dark soft 12 / 6. `bright-teal`: solid Lagoon 8, Grey/850 icon, soft 4 / 11, dark
soft 13 / 6. Names kept so no class or token breaks.

## Border Radius

| Variable | Value | Use |
|---|---|---|
| `--ao-radius-sm` | `0.25rem` | Tags, badges, small inputs |
| `--ao-radius-md` | `0.5rem` | Buttons, cards, inputs |
| `--ao-radius-lg` | `1rem` | Large cards, modals |
| `--ao-radius-xl` | `1.5rem` | Drawers, bottom sheets |
| `--ao-radius-full` | `6.25rem` | Pills, avatars |

## Icon

| Variable | Value | Use |
|---|---|---|
| `--ao-icon-primary` | `#475569` | Default icon color (Grey/600) |
| `--ao-icon-secondary` | `#64748B` | Secondary icon (Grey/500) |
| `--ao-icon-contrast` | `#94A3B8` | Muted/disabled icon (Grey/400) |
| `--ao-icon-invert` | `#FFFFFF` | Icon on dark background |
| `--ao-icon-brand` | `#0094AD` | Brand-colored icon |

## Icon Sizes

| Variable | Value | Use |
|---|---|---|
| `--ao-icon-size-sm` | `1rem` (16px) | Small icons — buttons, labels, inputs, chevrons |
| `--ao-icon-size-md` | `1.25rem` (20px) | Medium icons — panel headings |
| `--ao-icon-size-lg` | `1.5rem` (24px) | Large icons — avatar checks (size 3-5), Lucide default |
| `--ao-icon-size-xl` | `2rem` (32px) | Extra-large icons |

**Rule:** Always use `--ao-icon-size-sm/md/lg` for icon `width`/`height` — never `--ao-spacing-*`.

## Button Component

| Variable | Value | Use |
|---|---|---|
| `--ao-btn-primary-bg` | `#0094AD` | Primary button background |
| `--ao-btn-primary-bg-hover` | `#009FBA` | Primary hover + focus background |
| `--ao-btn-primary-bg-pressed` | `#007A8D` | Primary pressed background |
| `--ao-btn-primary-text` | `#FFFFFF` | Primary text (theme-invariant) |
| `--ao-btn-primary-text-hover` | `#FFFFFF` | Primary hover text |
| `--ao-btn-primary-border` | `rgba(0,0,0,0)` | Primary default + hover border |
| `--ao-btn-primary-border-hover` | `rgba(0,0,0,0)` | Primary hover border |
| `--ao-btn-secondary-bg` | `transparent` | Secondary button background |
| `--ao-btn-secondary-bg-hover` | `#F8FAFC` | Secondary hover + focus background |
| `--ao-btn-secondary-bg-pressed` | `#E9EEF4` | Secondary pressed background |
| `--ao-btn-secondary-border` | `#D6DEE8` | Secondary default + pressed border; focus ring |
| `--ao-btn-secondary-border-hover` | `#D6DEE8` | Secondary hover border |
| `--ao-btn-secondary-text` | `#172033` | Secondary text |
| `--ao-btn-secondary-text-hover` | `#172033` | Secondary hover text |
| `--ao-btn-tertiary-bg` | `transparent` | Tertiary background |
| `--ao-btn-tertiary-bg-hover` | `#F8FAFC` | Tertiary hover + focus background |
| `--ao-btn-tertiary-bg-pressed` | `#E9EEF4` | Tertiary pressed background |
| `--ao-btn-tertiary-border` | `rgba(0,0,0,0)` | Tertiary default border |
| `--ao-btn-tertiary-border-hover` | `rgba(0,0,0,0)` | Tertiary hover border |
| `--ao-btn-tertiary-text` | `#172033` | Tertiary text |
| `--ao-btn-tertiary-text-hover` | `#172033` | Tertiary hover text |
| `--ao-btn-bg-disabled` | `#CAD5E2` | Disabled background (all variants) |
| `--ao-btn-text-disabled` | `#64748B` | Disabled text (all variants) |

## Spacing

| Variable | Value | Use |
|---|---|---|
| `--ao-spacing-1` | `0.25rem` | Micro gaps |
| `--ao-spacing-2` | `0.375rem` | Tight padding |
| `--ao-spacing-3` | `0.5rem` | Small padding |
| `--ao-spacing-4` | `0.75rem` | Medium-small padding |
| `--ao-spacing-5` | `1rem` | Standard padding |
| `--ao-spacing-6` | `1.5rem` | Section padding |
| `--ao-spacing-7` | `2rem` | Large section gap |
| `--ao-spacing-8` | `2.5rem` | XL gap |
| `--ao-spacing-9` | `3rem` | 2XL gap |
| `--ao-spacing-10` | `3.5rem` | 3XL gap |
| `--ao-spacing-11` | `4rem` | Section break |
| `--ao-spacing-12` | `4.5rem` | Page section |
| `--ao-spacing-13` | `5rem` | Hero gap |

## Size Scale

Fixed-dimension tokens for component and layout widths/heights (not spacing).

| Variable | Value | px equiv |
|---|---|---|
| `--ao-size-1` | `8rem` | 128px |
| `--ao-size-2` | `10rem` | 160px |
| `--ao-size-3` | `12rem` | 192px |
| `--ao-size-4` | `15rem` | 240px |
| `--ao-size-5` | `17.5rem` | 280px |
| `--ao-size-6` | `20rem` | 320px |
| `--ao-size-7` | `24rem` | 384px |
| `--ao-size-8` | `28rem` | 448px |
| `--ao-size-9` | `32rem` | 512px |
| `--ao-size-10` | `40rem` | 640px |
| `--ao-size-11` | `48rem` | 768px |
| `--ao-size-12` | `60rem` | 960px |
| `--ao-size-13` | `70rem` | 1120px |
| `--ao-size-14` | `80rem` | 1280px |

## Chat Component

Chat UI uses a **context mode** (`data-surface="chat"`) that remaps core semantic tokens to chat-neutral values. The dedicated `--ao-chat-surface-*` and `--ao-chat-border` tokens have been removed; components inside a `[data-surface="chat"]` container automatically receive the correct surface, text, border, and button values via the remapped core tokens. See the **Chat Context Mode** section below for full details.

The following tokens remain as explicit chat-specific values:

| Variable | Light value | Dark value | Use |
|---|---|---|---|
| `--ao-chat-brand` | `#0094AD` | `#30B6C2` | Chat brand accent (theme-invariant) |
| `--ao-chat-msg-bg` | `#EDF5F5` | `#00282F` | User message bubble background |
| `--ao-chat-msg-text` | `#043840` | `#EDF5F5` | User message bubble text |
| `--ao-chat-sidebar-bg` | `#F1F5F9` | `#1B1B1F` | Sidebar background (editable by user) |
| `--ao-chat-sidebar-text` | `#172033` | `#CAD5E2` | Sidebar text (editable by user) |
| `--ao-chat-sidebar-hover-bg` | -- | -- | Computed (see Computed Tokens) |
| `--ao-chat-sidebar-active-bg` | -- | -- | Computed (see Computed Tokens) |

## Skeleton Component

| Variable | Light value | Dark value |
|---|---|---|
| `--ao-skeleton-base` | `#E2E8F0` | `#0F172A` |
| `--ao-skeleton-highlight` | `#FFFFFF` | `#334155` |

## SourcesCarousel Component

| Variable | Light value | Dark value |
|---|---|---|
| `--ao-src-carousel-card-bg` | `#F1F5F9` | `#334155` |

## Shadow

Light values are transcribed by hand from the Figma `shadow/*` effect styles
(range frame `3730:26393`; shadows cannot be exported as DTCG variables). **Dark values are
derived, not transcribed: every light alpha × 2, layer geometry unchanged.**

**Last synced 2026-09-23** — the designer redefined the whole family as a seven-step scale,
replacing the old `light/shadow-*` / `dark/shadow-*` styles and the xxs/base/sm/md/lg ladder.

| Variable | Light | Dark (light × 2) | Use |
|---|---|---|---|
| `--ao-shadow-2xs` | `0 1px 0 rgba(0,0,0,0.05)` | `0 1px 0 rgba(0,0,0,0.1)` | Contact line — Seating Planner cards and panels, ListingScreen grid cards |
| `--ao-shadow-xs` | `0 1px 2px rgba(0,0,0,0.05)` | `0 1px 2px rgba(0,0,0,0.1)` | — (no consumers yet) |
| `--ao-shadow-sm` | `0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)` | `… 0.2, … 0.2` | Small dropdowns, toggle thumbs, SeatingHeader |
| `--ao-shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)` | `… 0.2, … 0.2` | Tooltips, inputs, menus, toasts |
| `--ao-shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)` | `… 0.2, … 0.2` | — (no consumers yet) |
| `--ao-shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)` | `… 0.2, … 0.2` | Modals, panels, popovers (SystemRole, DatePicker, AiAssistant, ControlScreen, AiChatMinimised, StyleSettings, MessageInput) |
| `--ao-shadow-2xl` | `0 25px 50px -12px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)` | `… 0.2, … 0.2` | — (no consumers yet) |
| `--ao-shadow-card` | `0 0 10px rgba(0,0,0,0.05)` | `0 0 10px rgba(0,0,0,0.1)` | Soft even halo (AudioPlayer waveform card) — not on the scale |
| `--ao-shadow-cc-rail` | `4px 0 4px rgba(0,0,0,0.2)` | `none` — deliberate exception | CC SidebarMenu docked right edge — not on the scale |

**Source:** `css/tokens-shadows.css` (static, manually maintained — *not* rebuilt by
`npm run tokens`). All modes side by side: `src/shadow-modes.html`.

Every layer on the scale is pure black at one of two alphas — `#0000000D` (0.05) for `2xs`/`xs`,
`#0000001A` (0.10) for both layers of `sm` → `2xl`. From `sm` up the lower layer carries a
**negative spread**, which is what makes the shadow read as cast downward rather than as an
even halo.

### The dark rule — × 2

Dark alphas are `light × 2`, with offsets, blur and spread left alone. The reason for a rule
at all: a 5–10% black shadow almost disappears on a dark surface, because there is little
luminance left beneath it to darken; scaling the alpha restores roughly the same perceived
depth without changing the shape.

The multiplier was **2.5 until 2026-09-23**, when the designer lowered it to 2 alongside the new
scale. The two dark alphas round-trip exactly to 8-digit hex, so a Figma dark style, if one is
made, can match the CSS to the digit:

| Alpha | Figma hex |
|---|---|
| 0.10 | `#0000001A` |
| 0.20 | `#00000033` |

`--ao-shadow-cc-rail` is the **one deliberate exception**: it stays `none` in dark. A directional
edge shadow is invisible against the already-dark canvas, and doubling it reads as a black smear
rather than depth. Dark values apply under `[data-theme="dark"]`, which also covers CC-dark and
chat-dark since those carry the same attribute.

### Migration from the old ladder (2026-09-23)

| Old token | Now | Why |
|---|---|---|
| `--ao-shadow-xxs` | `--ao-shadow-2xs` | Same contact lift; removed |
| `--ao-shadow-base` | `--ao-shadow-sm` | Identical geometry — the old base/sm duplicate step is gone; removed |
| `--ao-shadow-sm` | `--ao-shadow-sm` | Same offsets and blurs, new alphas |
| `--ao-shadow-md` | `--ao-shadow-md` | Consumers kept; softer and cast downward |
| `--ao-shadow-lg` | `--ao-shadow-xl` | Consumers **re-pointed** — the new `lg` is lighter than the old one, and modals/panels need a clear step above md's menus. Judged side by side before the change |

This also settles the open questions from the 2026-08-24 pass: base vs sm (merged), the split
slate/black tint (all black now), and the lg re-weight (superseded). `card` stays a one-off off
the scale — every scale step is cast downward, and it is an even halo.

## Gradient

| Variable | Pattern | Use |
|---|---|---|
| `--ao-gradient-surface-secondary` | `transparent(secondary) -> secondary` (to right) | Fade overlay, edge fade |
| `--ao-gradient-surface-primary` | `transparent(surface-primary) -> surface-primary` (to bottom) | Content fade above input. Re-declared under `[data-surface="chat"]` so it resolves to the chat-context value of `--ao-surface-primary`. |

**Source:** `css/tokens-gradients.css` (static, manually maintained).

**Naming convention:**

| Figma style name | CSS variable | Formula |
|---|---|---|
| `gradient/surface/NAME` | `--ao-gradient-surface-NAME` | `linear-gradient(to right, rgb(from var(--ao-surface-NAME) r g b / 0), var(--ao-surface-NAME))` |
| `gradient/surface/A-B` | `--ao-gradient-surface-A-B` | `linear-gradient(to right, var(--ao-surface-A), var(--ao-surface-B))` |

- Single token name -> fade-out gradient (transparent left, full right). Direction: `to right`.
- Hyphenated name -> solid-to-solid gradient. Direction: `to right`.
- Dark mode: uses CSS Relative Color Syntax — no override needed.

**Adding a new gradient:**
1. Name it in Figma as `gradient/<group>/<name>`
2. Add `--ao-gradient-<group>-<name>` to `css/tokens-gradients.css`
3. Add a row to this table

## Breakpoints

Mobile-first scale (mirrors Tailwind defaults). All `@media` queries use `min-width`.

| Name | Variable | Value | @media usage |
|---|---|---|---|
| sm | `--ao-bp-sm` | `40rem` (640px) | `@media (min-width: 640px)` |
| md | `--ao-bp-md` | `48rem` (768px) | `@media (min-width: 768px)` |
| lg | `--ao-bp-lg` | `64rem` (1024px) | `@media (min-width: 1024px)` |
| xl | `--ao-bp-xl` | `80rem` (1280px) | `@media (min-width: 1280px)` |
| 2xl | `--ao-bp-2xl` | `96rem` (1536px) | `@media (min-width: 1536px)` |

**Rules:**
- Always mobile-first: base styles = mobile, add complexity via `min-width` queries.
- `@media` queries must use the px equivalent (CSS vars not supported in `@media`). `@container` queries CAN use the var.

---

## Dark Mode

**Activation:** Add `data-theme="dark"` to `<html>` or `<body>`.

**Generated file:** `css/tokens-dark.css` (rebuilt by `npm run tokens`; do not edit manually).

All `--ao-*` variables continue to work in dark mode. Spacing, radius and typography tokens are
**theme-invariant**.

Colour tokens are mostly NOT theme-invariant. Since the Aug 2026 rework the brand ramp shifts
(`surface-brand` `#0094AD` light -> `#30B6C2` dark) and so do `text-error` / `border-error`.
Only the solid status fills hold across themes: `surface-error`, `surface-success`,
`surface-warning`. Check the table below rather than assuming a token is invariant.

### Tokens that change in dark mode

| Variable | Light value | Dark value |
|---|---|---|
| `--ao-surface-primary` | `#FFFFFF` | `#1E293B` |
| `--ao-surface-elevated-1` | `#FFFFFF` | `#1E293B` |
| `--ao-surface-elevated-2` | `#F1F5F9` | `#334155` |
| `--ao-surface-minimal` | `#F8FAFC` | `#293548` |
| `--ao-surface-secondary` | `#E9EEF4` | `#3D4B5F` |
| `--ao-surface-contrast` | `#D6DEE8` | `#64748B` |
| `--ao-surface-invert` | `#1E293B` | `#F1F5F9` |
| `--ao-surface-brand-soft` | `#D9F2F2` | `#043840` |
| `--ao-surface-brand-soft-extra` | `#EDF5F5` | `#00282F` |
| `--ao-text-primary` | `#172033` | `#F1F5F9` |
| `--ao-text-secondary` | `#3D4B5F` | `#CAD5E2` |
| `--ao-text-contrast` | `#64748B` | `#94A3B8` |
| `--ao-text-invert` | `#FFFFFF` | `#E2E8F0` |
| `--ao-border-primary` | `#64748B` | `#64748B` |
| `--ao-border-secondary` | `#E2E8F0` | `#334155` |
| `--ao-border-card` | `#E2E8F0` | `#334155` (CCDark: `#293548`) |
| `--ao-border-contrast` | `#94A3B8` | `#475569` |
| `--ao-border-invert` | `#1E293B` | `#F1F5F9` |
| `--ao-icon-primary` | `#475569` | `#F1F5F9` |
| `--ao-icon-secondary` | `#64748B` | `#CAD5E2` |
| `--ao-icon-contrast` | `#94A3B8` | `#94A3B8` |
| `--ao-icon-invert` | `#FFFFFF` | `#0F172A` |
| `--ao-chat-msg-bg` | `#EDF5F5` | `#00282F` |
| `--ao-chat-msg-text` | `#043840` | `#EDF5F5` |
| `--ao-chat-sidebar-bg` | `#F1F5F9` | `#1B1B1F` |
| `--ao-chat-sidebar-text` | `#172033` | `#CAD5E2` |
| `--ao-btn-secondary-bg-hover` | `#F8FAFC` | `#293548` |
| `--ao-btn-secondary-bg-pressed` | `#E9EEF4` | `#3D4B5F` |
| `--ao-btn-secondary-border` | `#D6DEE8` | `#64748B` |
| `--ao-btn-secondary-border-hover` | `#D6DEE8` | `#64748B` |
| `--ao-btn-secondary-text` | `#172033` | `#F1F5F9` |
| `--ao-btn-secondary-text-hover` | `#172033` | `#F1F5F9` |
| `--ao-btn-tertiary-bg-hover` | `#F8FAFC` | `#293548` |
| `--ao-btn-tertiary-bg-pressed` | `#E9EEF4` | `#3D4B5F` |
| `--ao-btn-tertiary-text` | `#172033` | `#F1F5F9` |
| `--ao-btn-tertiary-text-hover` | `#172033` | `#F1F5F9` |
| `--ao-btn-bg-disabled` | `#CAD5E2` | `#64748B` |
| `--ao-btn-text-disabled` | `#64748B` | `#CAD5E2` |
| `--ao-skeleton-base` | `#E2E8F0` | `#0F172A` |
| `--ao-skeleton-highlight` | `#FFFFFF` | `#334155` |
| `--ao-src-carousel-card-bg` | `#F1F5F9` | `#334155` |

**Elevation in dark mode:** In light mode `surface-primary` and `elevated-1` are both `#FFFFFF` (Neutral/0) and `elevated-2` steps to `#F1F5F9` (Grey/100). In dark mode, `surface-primary` and `elevated-1` share `#1E293B` (Grey/800) and `elevated-2` steps up to `#334155` (Grey/700). This creates visible depth separation on dark backgrounds.

### Component dark-mode notes

- **Tooltip:** Fixed dark panel (`#0B0B0C` = Neutral/1000) in both themes. Does **not** invert.

---

## Chat Context Mode

**Activation:** Add `data-surface="chat"` to a container element. All descendants automatically receive remapped semantic tokens.

**Generated files:**
- `css/tokens-chat.css` -- `[data-surface="chat"]` selector (rebuilt by `npm run tokens`)
- `css/tokens-chat-dark.css` -- `[data-theme="dark"] [data-surface="chat"]` descendant selector (rebuilt by `npm run tokens`)

Both files are auto-generated; do not edit manually.

### How it works

Instead of dedicated `--ao-chat-surface-*` tokens, the chat context remaps the **core semantic tokens** (`--ao-surface-*`, `--ao-border-*`, etc.) to chat-neutral values. Components inside a `[data-surface="chat"]` container use the same `--ao-surface-primary`, `--ao-border-secondary`, etc. variables as everywhere else -- they just resolve to different values.

### Two different neutral families

Since the Aug 2026 token rework the two contexts no longer draw from the same neutral ramp:

- **Default context** uses the slate-blue `Grey/*` ramp (`#F8FAFC` -> `#1E293B`), cool and
  slightly blue-tinted.
- **Chat context** kept the older warm-neutral greys (`#F6F6F7` -> `#1B1B1F`).

So a chat panel sitting next to default chrome is not a lighter or darker step of the same
hue -- it is a different hue family. Compare the columns below as *different palettes*, not as
offsets on one scale.

The accent and status colours DID move in both contexts, but to different hues: default brand
is Lagoon teal (`#0094AD`), chat brand is Radix Blue (`#0588F0`).

### Key differences from default context (light mode)

| Token | Default | Chat context |
|---|---|---|
| `--ao-surface-primary` | `#FFFFFF` | `#FFFFFF` |
| `--ao-surface-elevated-2` | `#F1F5F9` | `#F6F6F7` |
| `--ao-surface-secondary` | `#E9EEF4` | `#FFFFFF` |
| `--ao-surface-contrast` | `#D6DEE8` | `#F6F6F7` |
| `--ao-surface-minimal` | `#F8FAFC` | `#E2E2E3` |
| `--ao-border-contrast` | `#94A3B8` | `#F6F6F7` |
| `--ao-surface-brand` | `#0094AD` (Lagoon) | `#0588F0` (BlueRadix) |

### Key differences from default context (dark mode)

| Token | Default dark | Chat dark |
|---|---|---|
| `--ao-surface-primary` | `#1E293B` | `#212123` |
| `--ao-surface-elevated-1` | `#1E293B` | `#2E2E32` |
| `--ao-surface-elevated-2` | `#334155` | `#3C3C3F` |
| `--ao-surface-secondary` | `#3D4B5F` | `#2E2E32` |
| `--ao-surface-contrast` | `#64748B` | `#1B1B1F` |
| `--ao-border-secondary` | `#334155` | `#3C3C3F` |
| `--ao-border-card` | `#334155` | `#3C3C3F` |
| `--ao-border-contrast` | `#475569` | `#1B1B1F` |
| `--ao-surface-brand` | `#30B6C2` (Lagoon) | `#0588F0` (BlueRadix) |

### CSS specificity

| Selector | Specificity |
|---|---|
| `[data-surface="chat"]` | `0,1,0` |
| `[data-theme="dark"] [data-surface="chat"]` | `0,2,0` |

The chat context selector has the same specificity as `[data-theme="dark"]` (`0,1,0`). Because `tokens-chat.css` is loaded after `tokens-dark.css` in `base.css`, the chat context wins when both are active -- which is correct because the dark chat file (`0,2,0`) handles the dark+chat combination explicitly.

---

## Seating Planner Palettes

Role and table-tier colours for the Seating Planner. Namespaced `--sp-*`, **not** `--ao-*`, to
keep them out of the core design-system namespace — the same carve-out the CC component tokens
use with `--cc-`.

Names come from Figma's `codeSyntax.WEB` (added 2026-08-25), so the CSS and the Figma variables
cannot drift. The six table tiers are grouped under `sp-table-*`, which keeps the attendee role
`--sp-vip` distinct from the table tier `--sp-table-vip`.

**One palette**, emitted at `:root` (2026-10-09). The Muted / Radix Soft / Radix Vivid modes and the
`data-seating` switch were removed; Figma's Seating Planner collection has a single "Theme" mode
whose values are the old Radix Vivid ones.

**Generated file** (rebuilt by `npm run tokens`; do not edit manually): `css/tokens-seating-default.css`.

### Attendee roles

| Variable | Value |
|---|---|
| `--sp-attendee` | `#0797B9` |
| `--sp-vip` | `#AB4ABA` |
| `--sp-speaker` | `#4CBBA5` |
| `--sp-sponsor` | `#5B5BD6` |
| `--sp-host` | `#F76B15` |

### Table tiers

| Variable | Value |
|---|---|
| `--sp-table-gold` | `#CC4E00` |
| `--sp-table-silver` | `#8B8D98` |
| `--sp-table-bronze` | `#A07553` |
| `--sp-table-head` | `#991B1B` |
| `--sp-table-vip` | `#00749E` |
| `--sp-table-press` | `#5C7C2F` |

Only the five attendee roles vary by mode; the six table tiers are the same in all three. Worth
confirming with the designer whether the tiers were meant to get per-mode values too.

**Consumers:** `AttendeeCard` binds the five role tokens for its accent bar and role label.
`TableType` deliberately does **not** bind these — its tier colours are user-picked from a colour
picker at runtime, so they are raw hex. Note two of its Figma values diverge from these tokens:
Gold is `#D97706` where `--sp-table-gold` is `#CC4E00`, and Silver's base is `#ABB2B8` where
`--sp-table-silver` `#8B8D98` appears as its *text* colour.

---

## Minimised Layout Mode

**Activation:** Add `data-layout="minimised"` to any container element.

**Generated file:** `css/tokens-minimised.css` (rebuilt by `npm run tokens`; do not edit manually).

CSS selector override, NOT a media query. Only `--ao-font-fluid-*` values differ:

| Variable | Desktop value | Minimised value |
|---|---|---|
| `--ao-font-fluid-sm` | `1rem` | `0.875rem` |
| `--ao-font-fluid-md` | `1.125rem` | `1rem` |
| `--ao-font-fluid-lg` | `1.25rem` | `1.125rem` |
| `--ao-font-fluid-xl` | `1.375rem` | `1.25rem` |
| `--ao-font-fluid-2xl` | `1.625rem` | `1.5rem` |
| `--ao-font-fluid-3xl` | `1.75rem` | `1.625rem` |
| `--ao-font-fluid-4xl` | `2rem` | `1.875rem` |

`--ao-font-fluid-xxs` and `--ao-font-fluid-xs` are unchanged.

---

## Computed Tokens

Some tokens depend on runtime context (e.g. client-customisable sidebar background). Figma represents these as `$type: "string"` variables.

### Dynamic background pattern

When a component's background is client-customisable, ALL derived colours must adapt to the actual background luminance — not follow the global theme.

1. **JS:** `initSidebarTheme(el)` reads the bg token, computes luminance, sets `data-sidebar-theme="light|dark"`.
2. **CSS:** `[data-sidebar-theme]` blocks set computed variables via `color-mix()`.
3. **Re-run** after theme toggles or bg customisation.

**Key rule:** Never use semantic tokens for text on a dynamic background — they flip with the global theme. Use fixed RGB values instead.

| Derived property | Light sidebar | Dark sidebar |
|---|---|---|
| Text | `rgb(31 42 55)` (fixed dark) | `rgb(229 231 235)` (fixed light) |
| Selected text | 15% darker — `color-mix(in srgb, text 85%, black)` | 15% lighter — `color-mix(in srgb, text 85%, white)` |
| Hover bg | 8% overlay — `color-mix(in srgb, bg 92%, rgb(38 55 88))` | `color-mix(in srgb, bg 92%, white)` |
| Selected bg | 12% overlay — `color-mix(in srgb, bg 88%, rgb(38 55 88))` | `color-mix(in srgb, bg 88%, white)` |
| Muted text (labels) | `color: var(--ao-chat-sidebar-text); opacity: 0.6` | same |

### Current computed tokens

| Token | Base | Technique |
|---|---|---|
| `--ao-chat-sidebar-text` | `--ao-chat-sidebar-bg` | Fixed RGB based on luminance detection |
| `--ao-chat-sidebar-selected-text` | `--ao-chat-sidebar-text` | 15% lighter via `color-mix()` |
| `--ao-chat-sidebar-hover-bg` | `--ao-chat-sidebar-bg` | 8% overlay via `color-mix()` |
| `--ao-chat-sidebar-active-bg` | `--ao-chat-sidebar-bg` | 12% overlay via `color-mix()` |

**Utility:** `src/utils/sidebar-colors.js`

### Chat brand-derived colours (message bubble, sources link)

Chat UI colours (`--ao-chat-msg-bg`, `--ao-chat-msg-text`) are **computed at runtime** from `--ao-chat-brand` via `color-mix()`. The static hex values in `tokens-chat.css` (`#f0f3ff` / `#0f406b`) exist for designer reference in Figma only — **do not use them as the source of truth in code**.

**Setup:** Set `data-brand-theme` on the chat container element. Without it, the static fallback tokens win. The `sidebar-colors.js` utility calculates brand luminance and sets the attribute automatically.

**Three luminance tiers:**

| Attribute | Brand luminance | `--ao-chat-msg-bg` | `--ao-chat-msg-text` |
|---|---|---|---|
| `[data-brand-theme]` | Light | `color-mix(in srgb, var(--ao-chat-brand) 8%, var(--ao-surface-primary))` | `color-mix(in srgb, var(--ao-chat-brand) 50%, black)` |
| `[data-brand-theme="medium"]` | Medium | `color-mix(in srgb, var(--ao-chat-brand) 15%, var(--ao-surface-primary))` | `color-mix(in srgb, var(--ao-chat-brand) 35%, black)` |
| `[data-brand-theme="dark"]` | Dark | `color-mix(in srgb, var(--ao-chat-brand) 50%, var(--ao-surface-primary))` | `var(--ao-text-primary)` |

**Reference implementation:** `src/components/SourcesLink/SourcesLink.css` — the `[data-brand-theme]` blocks redefine the tokens.

**Components affected:** MessageBubble, SourcesLink, and any future chat element using brand-derived colours.

**Future override pattern:** When client customisation ships, refactor to:
```css
--ao-chat-msg-bg: var(--ao-chat-msg-bg-override, var(--_brand-msg-bg));
```
This lets users override the computed default. Grep `TODO [brand-override]` in SourcesLink.css for the 3 locations.

---

## Typography

Font: **Inter** (loaded via Google Fonts in `src/styles/base.css`).

### Font Families

| Variable | Value |
|---|---|
| `--ao-font-title` | `'Inter', sans-serif` |
| `--ao-font-body` | `'Inter', sans-serif` |

### Font Weights

| Variable | CSS Value | Use |
|---|---|---|
| `--ao-font-regular` | `400` | Body text |
| `--ao-font-medium` | `500` | Emphasis |
| `--ao-font-semibold` | `600` | Buttons, subheadings |
| `--ao-font-bold` | `700` | Headings |
| `--ao-font-extrabold` | `800` | Display text |

### Font Sizes (Fixed)

| Variable | Value | px | Use |
|---|---|---|---|
| `--ao-font-fixed-5xs` | `0.625rem` | 10px | Micro labels, dense table chrome |
| `--ao-font-fixed-4xs` | `0.6875rem` | 11px | Micro labels |
| `--ao-font-fixed-3xs` | `0.75rem` | 12px | Labels, captions |
| `--ao-font-fixed-xxs` | `0.75rem` | 12px | Labels, captions — **the 12px token used across components** |
| `--ao-font-fixed-2xs` | `0.8125rem` | 13px | Labels, captions (one step up from 12px) |
| `--ao-font-fixed-xs` | `0.875rem` | 14px | Small body, metadata |
| `--ao-font-fixed-sm` | `1rem` | 16px | Body text (default) |
| `--ao-font-fixed-md` | `1.125rem` | 18px | Large body |
| `--ao-font-fixed-lg` | `1.25rem` | 20px | Small heading |
| `--ao-font-fixed-xl` | `1.375rem` | 22px | Heading 5/4 |
| `--ao-font-fixed-2xl` | `1.625rem` | 26px | Heading 3 |
| `--ao-font-fixed-3xl` | `1.75rem` | 28px | Heading 2 |
| `--ao-font-fixed-4xl` | `2rem` | 32px | Heading 1 |
| `--ao-font-fixed-5xl` | `2.25rem` | 36px | Display |
| `--ao-font-fixed-6xl` | `3rem` | 48px | Display |
| `--ao-font-fixed-7xl` | `3.75rem` | 60px | Display |
| `--ao-font-fixed-8xl` | `4.5rem` | 72px | Display |

> **`xxs` and `2xs` have now swapped TWICE — check this table, do not trust memory.**
>
> The Aug 2026 export moved the 12px step from `xxs` to `2xs`, and 318 references were repointed.
> The **28 Aug 2026 export reversed it**: `xxs` is 12px again and `2xs` is the 13px step. All 361
> references were swapped back (and the 5 that genuinely wanted 13px were moved the other way, so
> nothing shifted visually — verified by measuring rendered font sizes, not by counting
> replacements).
>
> **Use `--ao-font-fixed-xxs` for 12px;** reach for `2xs` only when you specifically want 13px.
>
> Because these two names have changed meaning twice, a `2xs` or `xxs` reference in any older
> comment, figma-note or commit message may describe the value it had at the time. The name↔value
> pairing was preserved through both sweeps, so prose that quotes both (`--ao-font-fixed-xxs`
> (12px)) stays true; prose that quotes only the name does not.
>
> `3xs` and `xxs` are both 12px. `xxs` is the one components use — `3xs` is the ramp position
> that happens to share the value.

### Font Sizes (Fluid — responsive)

| Variable | Desktop | Mobile |
|---|---|---|
| `--ao-font-fluid-xxs` | `0.75rem` | `0.75rem` |
| `--ao-font-fluid-xs` | `0.875rem` | `0.875rem` |
| `--ao-font-fluid-sm` | `1rem` | `0.875rem` |
| `--ao-font-fluid-md` | `1.125rem` | `1rem` |
| `--ao-font-fluid-lg` | `1.25rem` | `1.125rem` |
| `--ao-font-fluid-xl` | `1.375rem` | `1.25rem` |
| `--ao-font-fluid-2xl` | `1.625rem` | `1.5rem` |
| `--ao-font-fluid-3xl` | `1.75rem` | `1.625rem` |
| `--ao-font-fluid-4xl` | `2rem` | `1.875rem` |

### Line Heights

| Variable | Value | Use |
|---|---|---|
| `--ao-leading-none` | `1` | Tight headings that should not wrap — **a unitless RATIO, not a length**, so it scales with the element's font-size. Added 2026-08-27 for Modal's header, which Figma renders `leading-none` at both sizes. |
| `--ao-leading-xs` | `1rem` | Caption/label |
| `--ao-leading-sm` | `1.25rem` | Small body |
| `--ao-leading-md` | `1.5rem` | Body default |
| `--ao-leading-lg` | `2rem` | Heading |
| `--ao-leading-xl` | `2.5rem` | Large heading |
| `--ao-leading-2xl` | `3rem` | Display |

> **`--ao-leading-none` is the one leading token that is not a length.** The rest of the scale is
> absolute px→rem; this one is a ratio, because Figma's `leading-none` means "one times the font
> size" and has to keep working across sizes and themes. The Style Dictionary transform
> (`dimension/figma-rem`) therefore leaves any `line height` value of 4 or less unitless — without
> that, a Figma value of `1` would export as `0.0625rem` (1px) and collapse every line box using it.

### Letter Spacing (Tracking)

| Variable | Value | Figma px | Use |
|---|---|---|---|
| `--ao-tracking-1` | `-0.05em` | -0.8px | Tightest (display headings) |
| `--ao-tracking-2` | `-0.025em` | -0.4px | Tight |
| `--ao-tracking-3` | `-0.0125em` | -0.2px | Slightly tight |
| `--ao-tracking-4` | `0em` | 0 | Normal (default) |
| `--ao-tracking-5` | `0.0125em` | 0.2px | Slightly loose |
| `--ao-tracking-6` | `0.025em` | 0.4px | Loose |
| `--ao-tracking-7` | `0.05em` | 0.8px | Loosest (labels, captions) |

Tracking tokens use `em` units (relative to element font size), not `rem`.

---

## Accessibility — contrast status

WCAG 2.1 AA thresholds (CLAUDE.md §9): **4.5:1** for normal text, **3:1** for large text,
UI components and graphical objects.

### Known failures after the Aug 2026 brand move

The brand moved from blue `#2563EB` to Lagoon teal `#0094AD`. Teal is a lighter hue at the same
nominal ramp position, so three pairings regressed:

| Pairing | Before | After | Needs | Status |
|---|---|---|---|---|
| `--ao-btn-primary-text` `#FFFFFF` on `--ao-btn-primary-bg` `#0094AD` (light) | 5.17:1 | **3.60:1** | 4.5:1 | ✗ fails |
| `--ao-btn-primary-text` `#FFFFFF` on `--ao-btn-primary-bg` `#009FBA` (dark) | 4.82:1 | **3.15:1** | 4.5:1 | ✗ fails |
| `--ao-border-brand` `#30B6C2` on `--ao-surface-primary` (light) | 5.17:1 | **2.44:1** | 3:1 | ✗ fails |
| `--ao-icon-contrast` `#94A3B8` on `--ao-surface-primary` (light) | 3.10:1 | **2.56:1** | 3:1 | ✗ fails |

The dark-mode brand ramp was darkened one step on 2026-08-24, lifting the dark button from
2.44:1 to 3.15:1 — better, but still short. See root cause 2 in the audit: dark mode cannot
reach 4.5:1 with white text without making the button itself invisible against the page, so it
needs a **dark** `--ao-btn-primary-text` instead.

Everything else measured on the light default context passes, including `text-brand` (5.04:1),
`text-error` (5.21:1), `text-success` (4.72:1), `text-warning` (4.51:1) and `text-contrast`
(4.76:1).

Note `--ao-border-contrast` `#94A3B8` is 2.56:1 — still below 3:1, but it was 1.78:1 before,
so the rework improved it. Pre-existing, not a regression.

Dark-mode teal wants **dark** label text, not white — that is the only option that clears both
the label's 4.5:1 and the button's own 3:1 against the page surface.

### The full audit is done — see `docs/contrast-audit.md`

The six-mode audit was completed on 2026-08-24 and lives in
[`docs/contrast-audit.md`](contrast-audit.md). Re-run it any time with `npm run contrast`
(exits non-zero on any blocking failure, so it works as a gate).

**552 pairings across all six modes: 96 blocking failures**, collapsing into seven root causes.
41 are regressions from the Aug 2026 rework, 55 pre-existing, and 14 pairings were improved by it.

The worst finding is not in the table above: **`--ao-text-invert` does not flip in dark mode**
while `--ao-icon-invert` does, so inverted text lands light-on-light at **1.13:1** (down from
15.90:1). See root cause 1 in the audit.

---

## Transition Presets

| Variable | Value | Use |
|---|---|---|
| `--ao-transition-fast` | `100ms ease` | Quick micro-interactions (toggles, checkboxes) |
| `--ao-transition-default` | `150ms ease` | Standard hover / focus state changes |
| `--ao-transition-slow` | `250ms ease` | More deliberate transitions (panel reveals) |
| `--ao-transition-spring` | `200ms cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy/playful interactions |

Usage: `transition: background-color var(--ao-transition-default);`
