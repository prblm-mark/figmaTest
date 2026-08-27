# Modal

## Overview

Dialog pattern for alerts, confirmations, forms, feedback, and scrollable content. Composes Button, Input, Textarea, and Checkbox components.

## Figma Reference

- **Component set:** [Modal](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2464-763)
- **File:** Affino AI — Design System (`Lus07xi8pPXLN87sQIyrEt`)

## Variant Matrix

| Node ID | Type |
|---------|------|
| 2464:762 | Default |
| 2464:760 | Small |
| 2464:761 | Confirmation |
| 2464:758 | Form |
| 2464:756 | Large |
| 2464:757 | Scrollable |
| 2464:755 | Feedback Positive |
| 2464:759 | Positive Negative |

## CSS Class Mapping

| Figma Variant | CSS Class |
|---------------|-----------|
| Default (512px) | `.modal` |
| Small (384px) | `.modal.modal--sm` |
| Large (768px) | `.modal.modal--lg` |
| Confirmation (448px) | `.modal.modal--confirm` |
| Feedback Positive | `.modal.modal--feedback` + `.modal__header-icon--positive` |
| Positive Negative | `.modal.modal--feedback` + `.modal__header-icon--negative` |
| Form | `.modal` with `.modal__form` in body |
| Scrollable | `.modal` with `.modal__body--scroll` |

## Token Usage

| Property | Token |
|----------|-------|
| Background | `--ai-surface-primary` |
| Border radius | `--ai-radius-lg` |
| Shadow | `0 0 20px rgba(0,0,0,0.05), 0 2px 2px rgba(0,0,0,0.1)` |
| Header/footer padding | `--ai-spacing-5` (v) / `--ai-spacing-6` (h) |
| Header/footer border | `--ai-border-secondary` |
| Body padding | `--ai-spacing-6` |
| Body paragraph gap | `--ai-spacing-5` |
| Title font | `--ai-font-title` / `--ai-font-fixed-md` / `--ai-font-semibold` |
| Title color | `--ai-text-primary` |
| Body text | `--ai-font-body` / `--ai-font-fixed-xs` / `--ai-text-secondary` |
| Footer button gap | `--ai-spacing-3` |
| Close button size | `--ai-spacing-7` (32px) |
| Close icon size | `--ai-icon-size-md` (20px) |
| Confirmation icon wrap | 56px circle, `--ai-surface-minimal` bg |
| Confirmation icon | `--ai-icon-size-lg`, `--ai-text-error` |
| Feedback header gap | `--ai-spacing-4` |
| Feedback icon circle | `--ai-spacing-8` (40px), `--ai-radius-full` |
| Feedback positive bg | `#dcfeec` (Aqua/50 — primitive, approved) |
| Feedback positive icon | `--ai-surface-success` |
| Feedback negative bg | `#fef3f3` (Red/50 — primitive, approved) |
| Feedback negative icon | `--ai-text-error` |
| Checkbox list gap | `--ai-spacing-4` |

## Dependencies

- **Button** (`src/components/Button/`) — footer actions, close button styling
- **Input** (`src/components/Input/`) — form variant fields
- **Textarea** (`src/components/Textarea/`) — feedback variant text area
- **Checkbox** (`src/components/Checkbox/`) — form "remember me", negative feedback options

## Responsive

**Superseded 2026-08-27.** Figma now DOES define a compact modal — see *Header / Body / Footer are
their own component sets* below — and the Seating Planner's create-plan modal
(`3515:228092` / `3515:212739`) is the first frame to specify it. The rules below were extended
for it.

Original note: Figma defines no mobile modal variant. One responsive rule exists in code:

| Breakpoint | Rule | Origin |
|---|---|---|
| `max-width: 639px` (below `--ai-bp-sm`) | `.modal__header` / `.modal__footer` padding → `var(--ai-spacing-4) var(--ai-spacing-5)` (from `--ai-spacing-5` / `--ai-spacing-6`) | Added 2026-07-27 during the EventPicker build, then applied to **all** modals by request |

`.modal--confirm .modal__footer` is unaffected — it is more specific and keeps its
intentionally borderless, centred `0 var(--ai-spacing-6) var(--ai-spacing-6)` padding.
`.modal__body` padding is also unchanged at every width.

## Overlay scrim — per theme

`.modal-overlay` supplies the scrim for every modal in the system. Its colour and its opacity move
on **two independent axes** (designer, 2026-08-26):

| | light | dark |
|---|---|---|
| default / CC | `rgba(15, 23, 42, 0.5)` — navy | `rgba(15, 23, 42, 0.85)` |
| chat | `rgba(0, 0, 0, 0.5)` — black | `rgba(0, 0, 0, 0.85)` |

**Colour comes from the surface.** `#0F172A` navy for the default, dark, CC-light and CC-dark
themes — this is what Figma draws (Seating Planner overlays `3515:176055` light / `3515:176080`
dark), and black read as too harsh a veil against those slate greys. The **chat** surfaces keep
black, which suits their own near-neutral palette — `--cc-ui-primary-bg` is `#ececed` / `#131316`
there, not the navy-tinted slate the CC and default themes use.

**Opacity comes from the theme**, regardless of surface: 0.5 light, 0.85 dark. A 50% veil over an
already-dark page barely separates the dialog from it, so the density has to rise to keep the modal
legible. The dark value was read off Figma's own dark frame rather than assumed.

**The selectors mirror the token files exactly**, so a modal is always scrimmed to match the theme
it is actually rendered in:

| Theme | Token file selector | Scrim rule |
|---|---|---|
| light | `:root` | `.modal-overlay` |
| dark | `[data-theme="dark"]` | `[data-theme="dark"] .modal-overlay` |
| CC light | `[data-brand="cc"]` | — inherits the default navy |
| CC dark | `[data-brand="cc"][data-theme="dark"]` | — inherits the dark navy |
| chat light | `[data-surface="chat"]` | `[data-surface="chat"] .modal-overlay` |
| chat dark | `[data-theme="dark"] [data-surface="chat"]` | same, prefixed |

`data-theme` and `data-brand` sit on `<html>`; **`data-surface` sits on `<body>`**, which is why the
chat rules are descendant selectors — the same shape `tokens-chat-dark.css` itself uses. CC needs no
rule of its own: both CC themes take the default navy.

Specificity resolves the overlap without relying on source order — chat-dark is three attributes
deep, so it beats both the plain dark rule and the plain chat rule.

> **This lived in `SeatingPlanner.css` first** and was promoted here on 2026-08-26, because nothing
> about it was specific to that screen. Promoting it changed three existing consumers (this demo,
> ControlScreen, ControlHub) from black to navy in the default themes — intended, not incidental.

### Token gap

**There is no scrim token**, so all four values are raw rgba. `#0f172a` exists as
`--cc-header-primary-bg` (and dark `--cc-ui-primary-bg`), but binding a scrim to a header or page
background would be a category error, and a hex token cannot carry the alpha anyway. The proper fix
is a real `--ai-surface-scrim` with per-theme values in Figma; until then these are deliberate raw
values, not oversights.

## Notes

- Overlay (`.modal-overlay`) included for interactive demo but is not part of the Figma component — it's an implementation detail.
- Scrollable body max-height (360px) is a hardcoded layout dimension.
- Confirmation icon wrap size (56px) is a hardcoded layout dimension.
- The Figma source uses flat frames for buttons/textarea/checkbox — the code composes the real components.

## Header / Body / Footer are their own component sets

Discovered 2026-08-27 while building the Seating Planner's create-plan modal. Modal's parts have
been promoted to component sets of their own, each with a **Size** axis:

| Component | Set | Variants |
|---|---|---|
| ModalHeader | `3427:11820` | `Size=Base` (`3427:11819`), `Size=sm` (`3427:11821`) |
| ModalBody | `3427:12224` | `Size=Base` (`3427:11885`), `Size=sm` (`3427:12231`) |
| Modal Footer | `3427:11838` | `Size=Base` (`3427:11837`), `Size=sm` (`3427:11839`) |

`ModalHeader` also exposes four properties this component did not express: **`subText`**,
**`subTitle`**, **`showIcon`** and **`size`**.

### What was implemented

**`subText`** — as `.modal__title-block` + `.modal__subtitle`. The create-plan modal needed it
("New Seating Plan" over the event name). Purely additive: no existing modal has a subtitle, so
EventPicker, ControlScreen and ControlHub are untouched, and `.modal__title` still works as a direct
header child.

**The sm values** — folded into the existing `max-width: 639px` block (body padding → 16, title →
16, title-block gap → 4, subtitle → 13), joining the header/footer padding rule already there.

### What was NOT, and why it matters

- **`showIcon`** — a 40px tinted disc with a 20px glyph. Its `rgba(48, 203, 144, 0.15)` fill is the
  *same already-approved value* `.modal__header-icon--positive` uses, so there is no token question
  here, only unwritten CSS.
- **`subTitle`** — a second, inline title beside the first, medium weight with `--ai-tracking-3`.
  Distinct from `subText`, which sits *below*.
- **Base/sm are SIZE VARIANTS, not a breakpoint.** This is the important one. Implementing them as
  `@media (max-width: 639px)` reproduces the right values for these screens, but a consumer who
  wants the compact modal at desktop width cannot ask for it, and a `.modal--compact` class would be
  the faithful model. Chosen deliberately (designer, 2026-08-27) as the smaller change; a full
  ModalHeader/Body/Footer audit is its own job.
- **The sm variant's own padding disagrees with the screens using it.** `Size=sm` binds
  `py: --ai-spacing-3` (8) and a 6px heading gap; the create-plan mobile frames bind `py: 12` and a
  4px gap — which is what Modal's existing 639px rule already produced. So those frames are not
  using sm as drawn. Worth resolving before the audit.
- **`.modal` shadow and border still differ from Figma.** Figma binds `light/shadow-md`
  (`--ai-shadow-md`) plus a 1px `--ai-border-secondary`; `.modal` has neither. Pre-existing, flagged
  on the Seating Planner screens too.
- **The overlay's mobile padding.** The create-plan mobile frame places its modal 32px from each
  edge, where `.modal-overlay` pads `--ai-spacing-6` (24) — so the modal renders 354 wide against
  Figma's 338. Not changed, because overlay padding is shared by every modal.

