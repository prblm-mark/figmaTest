# Design System Token Reference

Complete token tables for the Affino Design System. All CSS variables use the `--ai-` prefix.

---

## Surface (backgrounds)

| Variable | Value | Use |
|---|---|---|
| `--ai-surface-primary` | `#FFFFFF` | Page/card background |
| `--ai-surface-elevated-1` | `#FFFFFF` | Cards, dropdowns, popovers (steps up in dark) |
| `--ai-surface-elevated-2` | `#F1F5F9` | Modals, dialogs (steps up further in dark) |
| `--ai-surface-minimal` | `#F8FAFC` | Very subtle background (Grey/50) |
| `--ai-surface-secondary` | `#E9EEF4` | Subtle section background (Grey/150) |
| `--ai-surface-contrast` | `#D6DEE8` | Divider areas, table stripes (Grey/250) |
| `--ai-surface-invert` | `#1E293B` | Dark backgrounds (Grey/800) |
| `--ai-surface-brand` | `#0094AD` | Brand/primary action bg |
| `--ai-surface-brand-light` | `#009FBA` | Hover state on brand |
| `--ai-surface-brand-dark` | `#007A8D` | Pressed state on brand |
| `--ai-surface-brand-soft` | `#D9F2F2` | Light brand tint (focus rings, active backgrounds) |
| `--ai-surface-brand-soft-extra` | `#EDF5F5` | Very light brand tint (chat msg bubbles, soft backgrounds) |

> **Renamed Apr 2026:** `--ai-surface-brand-contrast` → `--ai-surface-brand-soft`,
> `--ai-surface-brand-contrast-extra` → `--ai-surface-brand-soft-extra`,
> `--ai-surface-error-contrast` → `--ai-surface-error-soft`. These tokens act as soft tinted backgrounds; the new name describes what they do. The `-contrast` suffix is now reserved for muted/mid-grey neutrals (`--ai-text-contrast`, `--ai-icon-contrast`, `--ai-border-contrast`, `--ai-surface-contrast`).

## Text

| Variable | Value | Use |
|---|---|---|
| `--ai-text-primary` | `#172033` | Body text, headings (Grey/850) |
| `--ai-text-secondary` | `#3D4B5F` | Secondary/supporting text (Grey/650) |
| `--ai-text-contrast` | `#64748B` | Placeholder, captions (Grey/500) |
| `--ai-text-invert` | `#FFFFFF` | Text on dark/brand backgrounds |

See **Status / feedback** below for `--ai-text-info`, `--ai-text-success`, `--ai-text-warning`, `--ai-text-error`, `--ai-text-neutral`.

## Border / Color

| Variable | Value | Use |
|---|---|---|
| `--ai-border-brand` | `#30B6C2` | Brand-colored borders |
| `--ai-border-primary` | `#64748B` | Strong dividers (Grey/500) |
| `--ai-border-secondary` | `#E2E8F0` | Default input/card borders (Grey/200) |
| `--ai-border-contrast` | `#94A3B8` | Stronger borders (Grey/400) |
| `--ai-border-invert` | `#1E293B` | Borders on inverted/dark surfaces (Grey/800) |

See **Status / feedback** below for `--ai-border-info`, `--ai-border-success`, `--ai-border-warning`, `--ai-border-error`, `--ai-border-neutral`.

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
  background: var(--ai-surface-success-soft);
  color: var(--ai-text-success);
  border-color: var(--ai-border-success);
}
```

Soft backgrounds use a tinted dark in dark mode (e.g. Aqua/950 for success), keeping the same hue family as the light variant.

## Border Radius

| Variable | Value | Use |
|---|---|---|
| `--ai-radius-sm` | `0.25rem` | Tags, badges, small inputs |
| `--ai-radius-md` | `0.5rem` | Buttons, cards, inputs |
| `--ai-radius-lg` | `1rem` | Large cards, modals |
| `--ai-radius-xl` | `1.5rem` | Drawers, bottom sheets |
| `--ai-radius-full` | `6.25rem` | Pills, avatars |

## Icon

| Variable | Value | Use |
|---|---|---|
| `--ai-icon-primary` | `#475569` | Default icon color (Grey/600) |
| `--ai-icon-secondary` | `#64748B` | Secondary icon (Grey/500) |
| `--ai-icon-contrast` | `#94A3B8` | Muted/disabled icon (Grey/400) |
| `--ai-icon-invert` | `#FFFFFF` | Icon on dark background |
| `--ai-icon-brand` | `#0094AD` | Brand-colored icon |

## Icon Sizes

| Variable | Value | Use |
|---|---|---|
| `--ai-icon-size-sm` | `1rem` (16px) | Small icons — buttons, labels, inputs, chevrons |
| `--ai-icon-size-md` | `1.25rem` (20px) | Medium icons — panel headings |
| `--ai-icon-size-lg` | `1.5rem` (24px) | Large icons — avatar checks (size 3-5), Lucide default |
| `--ai-icon-size-xl` | `2rem` (32px) | Extra-large icons |

**Rule:** Always use `--ai-icon-size-sm/md/lg` for icon `width`/`height` — never `--ai-spacing-*`.

## Button Component

| Variable | Value | Use |
|---|---|---|
| `--ai-btn-primary-bg` | `#0094AD` | Primary button background |
| `--ai-btn-primary-bg-hover` | `#009FBA` | Primary hover + focus background |
| `--ai-btn-primary-bg-pressed` | `#007A8D` | Primary pressed background |
| `--ai-btn-primary-text` | `#FFFFFF` | Primary text (theme-invariant) |
| `--ai-btn-primary-text-hover` | `#FFFFFF` | Primary hover text |
| `--ai-btn-primary-border` | `rgba(0,0,0,0)` | Primary default + hover border |
| `--ai-btn-primary-border-hover` | `rgba(0,0,0,0)` | Primary hover border |
| `--ai-btn-secondary-bg` | `transparent` | Secondary button background |
| `--ai-btn-secondary-bg-hover` | `#F8FAFC` | Secondary hover + focus background |
| `--ai-btn-secondary-bg-pressed` | `#E9EEF4` | Secondary pressed background |
| `--ai-btn-secondary-border` | `#D6DEE8` | Secondary default + pressed border; focus ring |
| `--ai-btn-secondary-border-hover` | `#D6DEE8` | Secondary hover border |
| `--ai-btn-secondary-text` | `#172033` | Secondary text |
| `--ai-btn-secondary-text-hover` | `#172033` | Secondary hover text |
| `--ai-btn-tertiary-bg` | `transparent` | Tertiary background |
| `--ai-btn-tertiary-bg-hover` | `#F8FAFC` | Tertiary hover + focus background |
| `--ai-btn-tertiary-bg-pressed` | `#E9EEF4` | Tertiary pressed background |
| `--ai-btn-tertiary-border` | `rgba(0,0,0,0)` | Tertiary default border |
| `--ai-btn-tertiary-border-hover` | `rgba(0,0,0,0)` | Tertiary hover border |
| `--ai-btn-tertiary-text` | `#172033` | Tertiary text |
| `--ai-btn-tertiary-text-hover` | `#172033` | Tertiary hover text |
| `--ai-btn-bg-disabled` | `#CAD5E2` | Disabled background (all variants) |
| `--ai-btn-text-disabled` | `#64748B` | Disabled text (all variants) |

## Spacing

| Variable | Value | Use |
|---|---|---|
| `--ai-spacing-1` | `0.25rem` | Micro gaps |
| `--ai-spacing-2` | `0.375rem` | Tight padding |
| `--ai-spacing-3` | `0.5rem` | Small padding |
| `--ai-spacing-4` | `0.75rem` | Medium-small padding |
| `--ai-spacing-5` | `1rem` | Standard padding |
| `--ai-spacing-6` | `1.5rem` | Section padding |
| `--ai-spacing-7` | `2rem` | Large section gap |
| `--ai-spacing-8` | `2.5rem` | XL gap |
| `--ai-spacing-9` | `3rem` | 2XL gap |
| `--ai-spacing-10` | `3.5rem` | 3XL gap |
| `--ai-spacing-11` | `4rem` | Section break |
| `--ai-spacing-12` | `4.5rem` | Page section |
| `--ai-spacing-13` | `5rem` | Hero gap |

## Size Scale

Fixed-dimension tokens for component and layout widths/heights (not spacing).

| Variable | Value | px equiv |
|---|---|---|
| `--ai-size-1` | `8rem` | 128px |
| `--ai-size-2` | `10rem` | 160px |
| `--ai-size-3` | `12rem` | 192px |
| `--ai-size-4` | `15rem` | 240px |
| `--ai-size-5` | `17.5rem` | 280px |
| `--ai-size-6` | `20rem` | 320px |
| `--ai-size-7` | `24rem` | 384px |
| `--ai-size-8` | `28rem` | 448px |
| `--ai-size-9` | `32rem` | 512px |
| `--ai-size-10` | `40rem` | 640px |
| `--ai-size-11` | `48rem` | 768px |
| `--ai-size-12` | `60rem` | 960px |
| `--ai-size-13` | `70rem` | 1120px |
| `--ai-size-14` | `80rem` | 1280px |

## Chat Component

Chat UI uses a **context mode** (`data-surface="chat"`) that remaps core semantic tokens to chat-neutral values. The dedicated `--ai-chat-surface-*` and `--ai-chat-border` tokens have been removed; components inside a `[data-surface="chat"]` container automatically receive the correct surface, text, border, and button values via the remapped core tokens. See the **Chat Context Mode** section below for full details.

The following tokens remain as explicit chat-specific values:

| Variable | Light value | Dark value | Use |
|---|---|---|---|
| `--ai-chat-brand` | `#0094AD` | `#30B6C2` | Chat brand accent (theme-invariant) |
| `--ai-chat-msg-bg` | `#EDF5F5` | `#00282F` | User message bubble background |
| `--ai-chat-msg-text` | `#043840` | `#EDF5F5` | User message bubble text |
| `--ai-chat-sidebar-bg` | `#F1F5F9` | `#1B1B1F` | Sidebar background (editable by user) |
| `--ai-chat-sidebar-text` | `#172033` | `#CAD5E2` | Sidebar text (editable by user) |
| `--ai-chat-sidebar-hover-bg` | -- | -- | Computed (see Computed Tokens) |
| `--ai-chat-sidebar-active-bg` | -- | -- | Computed (see Computed Tokens) |

## Skeleton Component

| Variable | Light value | Dark value |
|---|---|---|
| `--ai-skeleton-base` | `#E2E8F0` | `#0F172A` |
| `--ai-skeleton-highlight` | `#FFFFFF` | `#334155` |

## SourcesCarousel Component

| Variable | Light value | Dark value |
|---|---|---|
| `--ai-src-carousel-card-bg` | `#F1F5F9` | `#334155` |

## Shadow

Light values are transcribed by hand from the Figma `light/shadow-*` effect styles
(shadows cannot be exported as DTCG variables). **Dark values are derived, not
transcribed: every light alpha × 2.5, layer geometry unchanged.** Where Figma's
`dark/shadow-*` styles disagree with that rule, the rule wins and Figma is corrected.

**Last synced 2026-08-24.**

| Variable | Light | Dark (light × 2.5) | Use |
|---|---|---|---|
| `--ai-shadow-xxs` | `0 1px 0.5px rgba(29,41,61,0.02)` | `0 1px 0.5px rgba(29,41,61,0.047)` | Barely-there contact lift — Seating Planner components |
| `--ai-shadow-base` | `0 1px 2px -1px rgba(29,41,61,0.1), 0 1px 3px 0 rgba(29,41,61,0.1)` | `0 1px 2px -1px rgba(29,41,61,0.251), 0 1px 3px 0 rgba(29,41,61,0.251)` | Tailwind base shadow, slate-tinted — **same step as `sm`**, see below |
| `--ai-shadow-sm` | `0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)` | `0 1px 2px rgba(0,0,0,0.149), 0 1px 3px rgba(0,0,0,0.255)` | Small dropdowns, toggle thumbs |
| `--ai-shadow-md` | `0 3px 10px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.16)` | `0 3px 10px rgba(0,0,0,0.255), 0 1px 4px rgba(0,0,0,0.4)` | Tooltips, inputs, menus |
| `--ai-shadow-lg` | `0 2px 2px rgba(0,0,0,0.18), 0 0 20px rgba(0,0,0,0.09)` | `0 2px 2px rgba(0,0,0,0.451), 0 0 20px rgba(0,0,0,0.224)` | Modals, cards, panels |
| `--ai-shadow-card` | `0 0 10px rgba(0,0,0,0.05)` | `0 0 10px rgba(0,0,0,0.125)` | Soft even halo (AudioPlayer waveform card) |
| `--ai-shadow-cc-rail` | `4px 0 4px rgba(0,0,0,0.2)` | `none` — deliberate exception | CC SidebarMenu docked right edge |

**Source:** `css/tokens-shadows.css` (static, manually maintained — *not* rebuilt by
`npm run tokens`).

### The 2.5× dark rule

Dark alphas are always `light × 2.5`, with offsets and blur radii left alone. Alphas are
picked to round-trip exactly to the 8-digit hex handed to the designer, so the CSS and the
Figma styles cannot drift:

| Alpha | Figma hex |
|---|---|
| 0.047 | `#1D293D0C` |
| 0.125 | `#00000020` |
| 0.149 | `#00000026` |
| 0.255 | `#00000041` |
| 0.400 | `#00000066` |
| 0.251 | `#1D293D40` (slate `base`) |
| 0.451 | `#00000073` (re-weighted `lg`) |
| 0.224 | `#00000039` (re-weighted `lg`) |

**Notes on the 2026-08-24 sync:**

- `--ai-shadow-xxs` is new, and is the only shadow whose colour is **slate-tinted**
  (`#1D293D`) rather than pure black — it follows the new slate neutral ramp. Figma also
  sets a `0.05` spread on it, dropped as sub-pixel noise. At 0.02 alpha over 0.5px of blur
  it is close to invisible in light mode.
- `--ai-shadow-md`'s light contact layer went back to Figma's `0.16`. It had been held at
  `0.05` since 2026-07-27 as a deliberate designer softening; that divergence is reverted.
- `--ai-shadow-cc-rail` is the **one deliberate exception** to the 2.5× rule: it stays
  `none` in dark. A directional edge shadow is invisible against the already-dark canvas,
  and the rule's 0.5 alpha would read as a black smear rather than depth.
- Dark values apply under `[data-theme="dark"]`, which also covers the CC-dark and
  chat-dark contexts since those carry the same attribute.
### lg was re-weighted on 2026-08-24

The scale read inverted. `lg` was wider than `md` — 20px reach vs 13px — but **lighter**: peak
0.10 against md's 0.16, and total ink 1.20 against 1.64. So "large" looked lighter than
"medium".

Swapping the two values was tried first and rejected: it fixed density but inverted *reach*
instead, and left md's 44 consumers (tooltips, inputs, menus) rendering a wide halo while lg's
22 (modals, panels) got a tight one — backwards for those elements. **The assignment is
unchanged; `lg`'s alphas were raised instead**, keeping its wide 2px-contact + 20px-halo
character.

Alphas were derived, not picked: chosen so lg's ink (`2·a1 + 20·a2`) lands ~1.32× md's 1.64
with a peak just above md's 0.16. `0.18 / 0.09` gives peak 0.18, ink 2.16. The ladder is now
monotonic on all three measures:

| Token | Peak α | Ink | Reach |
|---|---|---|---|
| `xxs` | 0.02 | 0.01 | 2px |
| `base` | 0.10 | 0.50 | 4px |
| `sm` | 0.10 | 0.42 | 4px |
| `md` | 0.16 | 1.64 | 13px |
| `lg` | 0.18 | 2.16 | 20px |
| `card` | 0.05 | 0.50 | 10px |

No Figma style exists for the re-weighted `lg` — Figma is to be updated from these values:
light `#0000002E` + `#00000017`, dark `#00000073` + `#00000039`.

**Flagged for a refinement pass.** The 1.32× ratio was chosen to clear the inversion, not
designed. Open questions for that pass: `base` vs `sm` (identical geometry, and base's ink is
actually the higher of the two), whether the steps should be perceptually even, and whether
`card` belongs on the ladder at all.

**Two things to settle:**

1. **`--ai-shadow-base` and `--ai-shadow-sm` occupy the same step.** Identical offsets and blur
   radii; they differ only in tint (slate vs black), layer-1 alpha (0.10 vs 0.06) and a
   `-1px` spread on `shadow`'s first layer. Two names for one visual level — does `shadow`
   supersede `sm`?
2. **Tint is split across the family.** `xxs` and `shadow` are slate (`#1D293D`); `sm`,
   `md`, `lg`, `card` and `cc-rail` are still pure black. The slate pair are the most
   recently authored, so the rest may simply be awaiting the same treatment.

Note the name: the Figma style is called plainly `shadow`, but the CSS token is
`--ai-shadow-base` so it keeps the `--ai-shadow-{size}` convention. This is the one shadow
where the CSS name and the Figma style name deliberately differ.

## Gradient

| Variable | Pattern | Use |
|---|---|---|
| `--ai-gradient-surface-secondary` | `transparent(secondary) -> secondary` (to right) | Fade overlay, edge fade |
| `--ai-gradient-surface-primary` | `transparent(surface-primary) -> surface-primary` (to bottom) | Content fade above input. Re-declared under `[data-surface="chat"]` so it resolves to the chat-context value of `--ai-surface-primary`. |

**Source:** `css/tokens-gradients.css` (static, manually maintained).

**Naming convention:**

| Figma style name | CSS variable | Formula |
|---|---|---|
| `gradient/surface/NAME` | `--ai-gradient-surface-NAME` | `linear-gradient(to right, rgb(from var(--ai-surface-NAME) r g b / 0), var(--ai-surface-NAME))` |
| `gradient/surface/A-B` | `--ai-gradient-surface-A-B` | `linear-gradient(to right, var(--ai-surface-A), var(--ai-surface-B))` |

- Single token name -> fade-out gradient (transparent left, full right). Direction: `to right`.
- Hyphenated name -> solid-to-solid gradient. Direction: `to right`.
- Dark mode: uses CSS Relative Color Syntax — no override needed.

**Adding a new gradient:**
1. Name it in Figma as `gradient/<group>/<name>`
2. Add `--ai-gradient-<group>-<name>` to `css/tokens-gradients.css`
3. Add a row to this table

## Breakpoints

Mobile-first scale (mirrors Tailwind defaults). All `@media` queries use `min-width`.

| Name | Variable | Value | @media usage |
|---|---|---|---|
| sm | `--ai-bp-sm` | `40rem` (640px) | `@media (min-width: 640px)` |
| md | `--ai-bp-md` | `48rem` (768px) | `@media (min-width: 768px)` |
| lg | `--ai-bp-lg` | `64rem` (1024px) | `@media (min-width: 1024px)` |
| xl | `--ai-bp-xl` | `80rem` (1280px) | `@media (min-width: 1280px)` |
| 2xl | `--ai-bp-2xl` | `96rem` (1536px) | `@media (min-width: 1536px)` |

**Rules:**
- Always mobile-first: base styles = mobile, add complexity via `min-width` queries.
- `@media` queries must use the px equivalent (CSS vars not supported in `@media`). `@container` queries CAN use the var.

---

## Dark Mode

**Activation:** Add `data-theme="dark"` to `<html>` or `<body>`.

**Generated file:** `css/tokens-dark.css` (rebuilt by `npm run tokens`; do not edit manually).

All `--ai-*` variables continue to work in dark mode. Spacing, radius and typography tokens are
**theme-invariant**.

Colour tokens are mostly NOT theme-invariant. Since the Aug 2026 rework the brand ramp shifts
(`surface-brand` `#0094AD` light -> `#30B6C2` dark) and so do `text-error` / `border-error`.
Only the solid status fills hold across themes: `surface-error`, `surface-success`,
`surface-warning`. Check the table below rather than assuming a token is invariant.

### Tokens that change in dark mode

| Variable | Light value | Dark value |
|---|---|---|
| `--ai-surface-primary` | `#FFFFFF` | `#1E293B` |
| `--ai-surface-elevated-1` | `#FFFFFF` | `#1E293B` |
| `--ai-surface-elevated-2` | `#F1F5F9` | `#334155` |
| `--ai-surface-minimal` | `#F8FAFC` | `#293548` |
| `--ai-surface-secondary` | `#E9EEF4` | `#3D4B5F` |
| `--ai-surface-contrast` | `#D6DEE8` | `#64748B` |
| `--ai-surface-invert` | `#1E293B` | `#F1F5F9` |
| `--ai-surface-brand-soft` | `#D9F2F2` | `#043840` |
| `--ai-surface-brand-soft-extra` | `#EDF5F5` | `#00282F` |
| `--ai-text-primary` | `#172033` | `#F1F5F9` |
| `--ai-text-secondary` | `#3D4B5F` | `#CAD5E2` |
| `--ai-text-contrast` | `#64748B` | `#94A3B8` |
| `--ai-text-invert` | `#FFFFFF` | `#E2E8F0` |
| `--ai-border-primary` | `#64748B` | `#64748B` |
| `--ai-border-secondary` | `#E2E8F0` | `#334155` |
| `--ai-border-contrast` | `#94A3B8` | `#475569` |
| `--ai-border-invert` | `#1E293B` | `#F1F5F9` |
| `--ai-icon-primary` | `#475569` | `#F1F5F9` |
| `--ai-icon-secondary` | `#64748B` | `#CAD5E2` |
| `--ai-icon-contrast` | `#94A3B8` | `#94A3B8` |
| `--ai-icon-invert` | `#FFFFFF` | `#0F172A` |
| `--ai-chat-msg-bg` | `#EDF5F5` | `#00282F` |
| `--ai-chat-msg-text` | `#043840` | `#EDF5F5` |
| `--ai-chat-sidebar-bg` | `#F1F5F9` | `#1B1B1F` |
| `--ai-chat-sidebar-text` | `#172033` | `#CAD5E2` |
| `--ai-btn-secondary-bg-hover` | `#F8FAFC` | `#293548` |
| `--ai-btn-secondary-bg-pressed` | `#E9EEF4` | `#3D4B5F` |
| `--ai-btn-secondary-border` | `#D6DEE8` | `#64748B` |
| `--ai-btn-secondary-border-hover` | `#D6DEE8` | `#64748B` |
| `--ai-btn-secondary-text` | `#172033` | `#F1F5F9` |
| `--ai-btn-secondary-text-hover` | `#172033` | `#F1F5F9` |
| `--ai-btn-tertiary-bg-hover` | `#F8FAFC` | `#293548` |
| `--ai-btn-tertiary-bg-pressed` | `#E9EEF4` | `#3D4B5F` |
| `--ai-btn-tertiary-text` | `#172033` | `#F1F5F9` |
| `--ai-btn-tertiary-text-hover` | `#172033` | `#F1F5F9` |
| `--ai-btn-bg-disabled` | `#CAD5E2` | `#64748B` |
| `--ai-btn-text-disabled` | `#64748B` | `#CAD5E2` |
| `--ai-skeleton-base` | `#E2E8F0` | `#0F172A` |
| `--ai-skeleton-highlight` | `#FFFFFF` | `#334155` |
| `--ai-src-carousel-card-bg` | `#F1F5F9` | `#334155` |

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

Instead of dedicated `--ai-chat-surface-*` tokens, the chat context remaps the **core semantic tokens** (`--ai-surface-*`, `--ai-border-*`, etc.) to chat-neutral values. Components inside a `[data-surface="chat"]` container use the same `--ai-surface-primary`, `--ai-border-secondary`, etc. variables as everywhere else -- they just resolve to different values.

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
| `--ai-surface-primary` | `#FFFFFF` | `#FFFFFF` |
| `--ai-surface-elevated-2` | `#F1F5F9` | `#F6F6F7` |
| `--ai-surface-secondary` | `#E9EEF4` | `#FFFFFF` |
| `--ai-surface-contrast` | `#D6DEE8` | `#F6F6F7` |
| `--ai-surface-minimal` | `#F8FAFC` | `#E2E2E3` |
| `--ai-border-contrast` | `#94A3B8` | `#F6F6F7` |
| `--ai-surface-brand` | `#0094AD` (Lagoon) | `#0588F0` (BlueRadix) |

### Key differences from default context (dark mode)

| Token | Default dark | Chat dark |
|---|---|---|
| `--ai-surface-primary` | `#1E293B` | `#212123` |
| `--ai-surface-elevated-1` | `#1E293B` | `#2E2E32` |
| `--ai-surface-elevated-2` | `#334155` | `#3C3C3F` |
| `--ai-surface-secondary` | `#3D4B5F` | `#2E2E32` |
| `--ai-surface-contrast` | `#64748B` | `#1B1B1F` |
| `--ai-border-secondary` | `#334155` | `#3C3C3F` |
| `--ai-border-contrast` | `#475569` | `#1B1B1F` |
| `--ai-surface-brand` | `#30B6C2` (Lagoon) | `#0588F0` (BlueRadix) |

### CSS specificity

| Selector | Specificity |
|---|---|
| `[data-surface="chat"]` | `0,1,0` |
| `[data-theme="dark"] [data-surface="chat"]` | `0,2,0` |

The chat context selector has the same specificity as `[data-theme="dark"]` (`0,1,0`). Because `tokens-chat.css` is loaded after `tokens-dark.css` in `base.css`, the chat context wins when both are active -- which is correct because the dark chat file (`0,2,0`) handles the dark+chat combination explicitly.

---

## Seating Planner Palettes

Role and table-tier colours for the Seating Planner. Namespaced `--sp-*`, **not** `--ai-*`, to
keep them out of the core design-system namespace — the same carve-out the CC component tokens
use with `--cc-`.

Names come from Figma's `codeSyntax.WEB` (added 2026-08-25), so the CSS and the Figma variables
cannot drift. The six table tiers are grouped under `sp-table-*`, which keeps the attendee role
`--sp-vip` distinct from the table tier `--sp-table-vip`.

**Radix Vivid is the default**, emitted at `:root`. The three mode files override it when a
container carries `data-seating="muted" | "radix-soft" | "radix-vivid"`.

**Generated files** (rebuilt by `npm run tokens`; do not edit manually):
`css/tokens-seating-default.css` (`:root`, Radix Vivid) plus
`css/tokens-seating-{muted,radix-soft,radix-vivid}.css`.

> **Import order matters.** `:root` and `[data-seating="…"]` are both specificity `0,1,0`, so
> source order alone decides the winner. `base.css` imports the default file *first*; move it
> after the mode files and the explicit attribute silently stops working.

### Attendee roles — these differ per mode

| Variable | Muted | Radix Soft | **Radix Vivid** (default) |
|---|---|---|---|
| `--sp-attendee` | `#6598F1` | `#5EB1EF` | **`#0797B9`** |
| `--sp-vip` | `#C399F1` | `#CF91D8` | **`#AB4ABA`** |
| `--sp-speaker` | `#2FA68C` | `#53B9AB` | **`#4CBBA5`** |
| `--sp-sponsor` | `#EE6E66` | `#EB8E90` | **`#5B5BD6`** |
| `--sp-host` | `#ED9C51` | `#EC9455` | **`#F76B15`** |

### Table tiers — identical across all three modes

| Variable | All modes |
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

CSS selector override, NOT a media query. Only `--ai-font-fluid-*` values differ:

| Variable | Desktop value | Minimised value |
|---|---|---|
| `--ai-font-fluid-sm` | `1rem` | `0.875rem` |
| `--ai-font-fluid-md` | `1.125rem` | `1rem` |
| `--ai-font-fluid-lg` | `1.25rem` | `1.125rem` |
| `--ai-font-fluid-xl` | `1.375rem` | `1.25rem` |
| `--ai-font-fluid-2xl` | `1.625rem` | `1.5rem` |
| `--ai-font-fluid-3xl` | `1.75rem` | `1.625rem` |
| `--ai-font-fluid-4xl` | `2rem` | `1.875rem` |

`--ai-font-fluid-xxs` and `--ai-font-fluid-xs` are unchanged.

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
| Muted text (labels) | `color: var(--ai-chat-sidebar-text); opacity: 0.6` | same |

### Current computed tokens

| Token | Base | Technique |
|---|---|---|
| `--ai-chat-sidebar-text` | `--ai-chat-sidebar-bg` | Fixed RGB based on luminance detection |
| `--ai-chat-sidebar-selected-text` | `--ai-chat-sidebar-text` | 15% lighter via `color-mix()` |
| `--ai-chat-sidebar-hover-bg` | `--ai-chat-sidebar-bg` | 8% overlay via `color-mix()` |
| `--ai-chat-sidebar-active-bg` | `--ai-chat-sidebar-bg` | 12% overlay via `color-mix()` |

**Utility:** `src/utils/sidebar-colors.js`

### Chat brand-derived colours (message bubble, sources link)

Chat UI colours (`--ai-chat-msg-bg`, `--ai-chat-msg-text`) are **computed at runtime** from `--ai-chat-brand` via `color-mix()`. The static hex values in `tokens-chat.css` (`#f0f3ff` / `#0f406b`) exist for designer reference in Figma only — **do not use them as the source of truth in code**.

**Setup:** Set `data-brand-theme` on the chat container element. Without it, the static fallback tokens win. The `sidebar-colors.js` utility calculates brand luminance and sets the attribute automatically.

**Three luminance tiers:**

| Attribute | Brand luminance | `--ai-chat-msg-bg` | `--ai-chat-msg-text` |
|---|---|---|---|
| `[data-brand-theme]` | Light | `color-mix(in srgb, var(--ai-chat-brand) 8%, var(--ai-surface-primary))` | `color-mix(in srgb, var(--ai-chat-brand) 50%, black)` |
| `[data-brand-theme="medium"]` | Medium | `color-mix(in srgb, var(--ai-chat-brand) 15%, var(--ai-surface-primary))` | `color-mix(in srgb, var(--ai-chat-brand) 35%, black)` |
| `[data-brand-theme="dark"]` | Dark | `color-mix(in srgb, var(--ai-chat-brand) 50%, var(--ai-surface-primary))` | `var(--ai-text-primary)` |

**Reference implementation:** `src/components/SourcesLink/SourcesLink.css` — the `[data-brand-theme]` blocks redefine the tokens.

**Components affected:** MessageBubble, SourcesLink, and any future chat element using brand-derived colours.

**Future override pattern:** When client customisation ships, refactor to:
```css
--ai-chat-msg-bg: var(--ai-chat-msg-bg-override, var(--_brand-msg-bg));
```
This lets users override the computed default. Grep `TODO [brand-override]` in SourcesLink.css for the 3 locations.

---

## Typography

Font: **Inter** (loaded via Google Fonts in `src/styles/base.css`).

### Font Families

| Variable | Value |
|---|---|
| `--ai-font-title` | `'Inter', sans-serif` |
| `--ai-font-body` | `'Inter', sans-serif` |

### Font Weights

| Variable | CSS Value | Use |
|---|---|---|
| `--ai-font-regular` | `400` | Body text |
| `--ai-font-medium` | `500` | Emphasis |
| `--ai-font-semibold` | `600` | Buttons, subheadings |
| `--ai-font-bold` | `700` | Headings |
| `--ai-font-extrabold` | `800` | Display text |

### Font Sizes (Fixed)

| Variable | Value | px | Use |
|---|---|---|---|
| `--ai-font-fixed-5xs` | `0.625rem` | 10px | Micro labels, dense table chrome |
| `--ai-font-fixed-4xs` | `0.6875rem` | 11px | Micro labels |
| `--ai-font-fixed-3xs` | `0.75rem` | 12px | Labels, captions |
| `--ai-font-fixed-2xs` | `0.75rem` | 12px | Labels, captions — **the 12px token used across components** |
| `--ai-font-fixed-xxs` | `0.8125rem` | 13px | Labels, captions (one step up from 12px) |
| `--ai-font-fixed-xs` | `0.875rem` | 14px | Small body, metadata |
| `--ai-font-fixed-sm` | `1rem` | 16px | Body text (default) |
| `--ai-font-fixed-md` | `1.125rem` | 18px | Large body |
| `--ai-font-fixed-lg` | `1.25rem` | 20px | Small heading |
| `--ai-font-fixed-xl` | `1.375rem` | 22px | Heading 5/4 |
| `--ai-font-fixed-2xl` | `1.625rem` | 26px | Heading 3 |
| `--ai-font-fixed-3xl` | `1.75rem` | 28px | Heading 2 |
| `--ai-font-fixed-4xl` | `2rem` | 32px | Heading 1 |
| `--ai-font-fixed-5xl` | `2.25rem` | 36px | Display |
| `--ai-font-fixed-6xl` | `3rem` | 48px | Display |
| `--ai-font-fixed-7xl` | `3.75rem` | 60px | Display |
| `--ai-font-fixed-8xl` | `4.5rem` | 72px | Display |

> **`xxs` changed meaning in the Aug 2026 export.** It used to be the 12px step; the Figma
> variable formerly named `xxs` now emits `--ai-font-fixed-2xs`, and `xxs` was reassigned to a
> new 13px step. All 318 component references were repointed from `--ai-font-fixed-xxs` to
> `--ai-font-fixed-2xs` so nothing shifted visually. **Use `--ai-font-fixed-2xs` for 12px;**
> reach for `xxs` only when you specifically want 13px.
>
> `3xs` and `2xs` are both 12px. `2xs` is the one components use — `3xs` is the ramp position
> that happens to share the value.

### Font Sizes (Fluid — responsive)

| Variable | Desktop | Mobile |
|---|---|---|
| `--ai-font-fluid-xxs` | `0.75rem` | `0.75rem` |
| `--ai-font-fluid-xs` | `0.875rem` | `0.875rem` |
| `--ai-font-fluid-sm` | `1rem` | `0.875rem` |
| `--ai-font-fluid-md` | `1.125rem` | `1rem` |
| `--ai-font-fluid-lg` | `1.25rem` | `1.125rem` |
| `--ai-font-fluid-xl` | `1.375rem` | `1.25rem` |
| `--ai-font-fluid-2xl` | `1.625rem` | `1.5rem` |
| `--ai-font-fluid-3xl` | `1.75rem` | `1.625rem` |
| `--ai-font-fluid-4xl` | `2rem` | `1.875rem` |

### Line Heights

| Variable | Value | Use |
|---|---|---|
| `--ai-leading-none` | `1` | Tight headings that should not wrap — **a unitless RATIO, not a length**, so it scales with the element's font-size. Added 2026-08-27 for Modal's header, which Figma renders `leading-none` at both sizes. |
| `--ai-leading-xs` | `1rem` | Caption/label |
| `--ai-leading-sm` | `1.25rem` | Small body |
| `--ai-leading-md` | `1.5rem` | Body default |
| `--ai-leading-lg` | `2rem` | Heading |
| `--ai-leading-xl` | `2.5rem` | Large heading |
| `--ai-leading-2xl` | `3rem` | Display |

> **`--ai-leading-none` is the one leading token that is not a length.** The rest of the scale is
> absolute px→rem; this one is a ratio, because Figma's `leading-none` means "one times the font
> size" and has to keep working across sizes and themes. The Style Dictionary transform
> (`dimension/figma-rem`) therefore leaves any `line height` value of 4 or less unitless — without
> that, a Figma value of `1` would export as `0.0625rem` (1px) and collapse every line box using it.

### Letter Spacing (Tracking)

| Variable | Value | Figma px | Use |
|---|---|---|---|
| `--ai-tracking-1` | `-0.05em` | -0.8px | Tightest (display headings) |
| `--ai-tracking-2` | `-0.025em` | -0.4px | Tight |
| `--ai-tracking-3` | `-0.0125em` | -0.2px | Slightly tight |
| `--ai-tracking-4` | `0em` | 0 | Normal (default) |
| `--ai-tracking-5` | `0.0125em` | 0.2px | Slightly loose |
| `--ai-tracking-6` | `0.025em` | 0.4px | Loose |
| `--ai-tracking-7` | `0.05em` | 0.8px | Loosest (labels, captions) |

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
| `--ai-btn-primary-text` `#FFFFFF` on `--ai-btn-primary-bg` `#0094AD` (light) | 5.17:1 | **3.60:1** | 4.5:1 | ✗ fails |
| `--ai-btn-primary-text` `#FFFFFF` on `--ai-btn-primary-bg` `#009FBA` (dark) | 4.82:1 | **3.15:1** | 4.5:1 | ✗ fails |
| `--ai-border-brand` `#30B6C2` on `--ai-surface-primary` (light) | 5.17:1 | **2.44:1** | 3:1 | ✗ fails |
| `--ai-icon-contrast` `#94A3B8` on `--ai-surface-primary` (light) | 3.10:1 | **2.56:1** | 3:1 | ✗ fails |

The dark-mode brand ramp was darkened one step on 2026-08-24, lifting the dark button from
2.44:1 to 3.15:1 — better, but still short. See root cause 2 in the audit: dark mode cannot
reach 4.5:1 with white text without making the button itself invisible against the page, so it
needs a **dark** `--ai-btn-primary-text` instead.

Everything else measured on the light default context passes, including `text-brand` (5.04:1),
`text-error` (5.21:1), `text-success` (4.72:1), `text-warning` (4.51:1) and `text-contrast`
(4.76:1).

Note `--ai-border-contrast` `#94A3B8` is 2.56:1 — still below 3:1, but it was 1.78:1 before,
so the rework improved it. Pre-existing, not a regression.

Dark-mode teal wants **dark** label text, not white — that is the only option that clears both
the label's 4.5:1 and the button's own 3:1 against the page surface.

### The full audit is done — see `docs/contrast-audit.md`

The six-mode audit was completed on 2026-08-24 and lives in
[`docs/contrast-audit.md`](contrast-audit.md). Re-run it any time with `npm run contrast`
(exits non-zero on any blocking failure, so it works as a gate).

**552 pairings across all six modes: 96 blocking failures**, collapsing into seven root causes.
41 are regressions from the Aug 2026 rework, 55 pre-existing, and 14 pairings were improved by it.

The worst finding is not in the table above: **`--ai-text-invert` does not flip in dark mode**
while `--ai-icon-invert` does, so inverted text lands light-on-light at **1.13:1** (down from
15.90:1). See root cause 1 in the audit.

---

## Transition Presets

| Variable | Value | Use |
|---|---|---|
| `--ai-transition-fast` | `100ms ease` | Quick micro-interactions (toggles, checkboxes) |
| `--ai-transition-default` | `150ms ease` | Standard hover / focus state changes |
| `--ai-transition-slow` | `250ms ease` | More deliberate transitions (panel reveals) |
| `--ai-transition-spring` | `200ms cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy/playful interactions |

Usage: `transition: background-color var(--ai-transition-default);`
