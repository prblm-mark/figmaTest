# Alert — Figma Notes

**Figma file:** [`Lus07xi8pPXLN87sQIyrEt`](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System) (Affino AI Design System)
**Tier:** Component
**Parent frame:** `2542:5858` (Alerts)
**Files:** `Alert.css`, `Alert.html`, `Alert.figma-notes.md`, `Alert.figma.ts`

---

## Variant matrix (24 variants)

| Type | Style | Device | Node | CSS |
|---|---|---|---|---|
| Info | Default | Desktop | `2542:5857` | `.alert.alert--info` |
| Success | Default | Desktop | `2542:5850` | `.alert.alert--success` |
| Danger | Default | Desktop | `2542:5853` | `.alert.alert--danger` |
| Warning | Default | Desktop | `2542:5856` | `.alert.alert--warning` |
| Neutral | Default | Desktop | `2542:5851` | `.alert.alert--neutral` |
| Info | CTA | Desktop | `2753:2274` | `.alert.alert--cta.alert--info` |
| Success | CTA | Desktop | `2753:2266` | `.alert.alert--cta.alert--success` |
| Danger | CTA | Desktop | `2753:2258` | `.alert.alert--cta.alert--danger` |
| Warning | CTA | Desktop | `2753:2250` | `.alert.alert--cta.alert--warning` |
| Neutral | CTA | Desktop | `2753:2242` | `.alert.alert--cta.alert--neutral` |
| Info | CTA | Mobile | `2767:3435` | same as above — `@media (max-width: 767px)` stacks |
| Success | CTA | Mobile | `2767:3453` | same |
| Danger | CTA | Mobile | `2767:3471` | same |
| Warning | CTA | Mobile | `2767:3386` | same |
| Neutral | CTA | Mobile | `2767:3408` | same |
| Info | Floating | Desktop | `2542:5849` | `.alert.alert--floating.alert--info` |
| Success | Floating | Desktop | `2542:5848` | `.alert.alert--floating.alert--success` |
| Neutral | Floating | Desktop | `2542:5847` | `.alert.alert--floating.alert--neutral` |
| Info | Fixed | Desktop | `2542:5852` | `.alert.alert--fixed.alert--info` |
| Success | Fixed | Desktop | `2542:5855` | `.alert.alert--fixed.alert--success` |
| Danger | Fixed | Desktop | `2542:5854` | `.alert.alert--fixed.alert--danger` |
| Warning | Fixed | Desktop | `2542:5846` | `.alert.alert--fixed.alert--warning` |
| Neutral | Fixed | Desktop | `2542:5845` | `.alert.alert--fixed.alert--neutral` |

**Notes:**
- Floating intentionally only has Info / Success / Neutral — Danger + Warning Floating absent in Figma per user (a).
- CTA Mobile is handled via `@media (max-width: 767px)` rather than a `--mobile` modifier (project convention).
- The Danger variant maps to the `error` token namespace (`--ai-surface-error`, `--ai-text-error`, `--ai-border-error`).

---

## CSS class mapping

| Figma element | CSS class |
|---|---|
| Root wrapper | `.alert` (`<div>`) |
| Type modifier | `.alert--{info,success,danger,warning,neutral}` |
| Style modifier | `.alert--{default = base,cta,floating,fixed}` |
| Header row (icon + text + close) | `.alert__header` |
| Leading icon slot | `.alert__icon` (Lucide via `<i data-lucide>`) |
| Title + message text | `.alert__text` containing `.alert__title` + `.alert__message` spans |
| Close button | `<button class="alert__close">` with Lucide `x` |
| Body block (Default only) | `.alert__body` containing `.alert__list` and CTA button |
| List of points | `<ul class="alert__list">` |
| CTA button | `<button class="btn btn--primary btn--sm alert__cta-btn">` (Case B override — bg picks up type colour) |
| CTA-row middle column (CTA Style) | `.alert__cta-area` (flex row → flex col on mobile) |
| Floating "New" badge | `<span class="alert__badge">` |
| Floating trailing arrow | `<span class="alert__arrow">` with Lucide `arrow-right` |

---

## Token mapping

Per Type — wrapper, border, text all use the type's semantic family:

| Type | bg | border | text | CTA bg / badge bg |
|---|---|---|---|---|
| info | `--ai-surface-info-soft` | `--ai-border-info` | `--ai-text-info` | `--ai-surface-info` |
| success | `--ai-surface-success-soft` | `--ai-border-success` | `--ai-text-success` | `--ai-surface-success` |
| danger | `--ai-surface-error-soft` | `--ai-border-error` | `--ai-text-error` | `--ai-surface-error` |
| warning | `--ai-surface-warning-soft` | `--ai-border-warning` | `--ai-text-warning` | `--ai-surface-warning` |
| neutral | `--ai-surface-neutral-soft` | `--ai-border-neutral` | `--ai-text-neutral` | `--ai-surface-neutral` |

Spacing / radius / typography:

| Property | Token |
|---|---|
| Min-height | `var(--ai-spacing-9)` (48px) |
| Padding (Default/CTA/Fixed) | `var(--ai-spacing-4) var(--ai-spacing-5)` (12/16px) |
| Padding (Floating) | `var(--ai-spacing-2) var(--ai-spacing-4) var(--ai-spacing-2) var(--ai-spacing-2)` |
| Header gap | `var(--ai-spacing-3)` (8px) |
| Body vertical gap | `var(--ai-spacing-4)` (12px) |
| List indent | `var(--ai-spacing-6)` (24px) |
| Radius — Default/CTA | `var(--ai-radius-md)` |
| Radius — Floating | `var(--ai-radius-full)` |
| Radius — Fixed | `0` (with top `border-top: 3px solid var(--ai-border-{type})`) |
| Body font | `var(--ai-font-body)` |
| Title weight | `var(--ai-font-bold)` |
| Message weight | `var(--ai-font-medium)` |
| Text size | `var(--ai-font-fixed-xs)` (14px) |
| Text leading | `var(--ai-leading-md)` (24px) |
| Floating text size | `var(--ai-font-fixed-xxs)` (12px) |
| Badge height | `var(--ai-spacing-7)` (32px) |
| Badge padding-x | `var(--ai-spacing-3)` |
| Icon size | `var(--ai-icon-size-sm)` (16px) |
| Fixed top-border width | 3px (treated as optical, exception per CLAUDE rules) |

---

## Token gaps

| # | Property | Figma | Resolution |
|---|---|---|---|
| 1 | CTA button bg per Type | Code Connect maps to `btn btn--primary btn--sm` but bg is overridden per Type | User-approved **Case B contextual override**: `.alert--{type} .alert__cta-btn { background-color: var(--ai-surface-{type}); }`. Base Button stays primary-blue. |
| 2 | Fixed Info bg in Figma | bound to `--ai-surface-brand-soft-extra` (`#f0f3ff`) — visually identical to `--ai-surface-info-soft` but inconsistent with other Fixed variants which use their type-specific soft token | User-approved (b): normalise to `--ai-surface-info-soft` for consistency. Designer to update Figma binding. |
| 3 | Floating absent for Danger + Warning | only Info / Success / Neutral defined | User-approved (a): build only the 3 Figma defines. |
| 4 | Type icon | all 5 Default variants reference `Icon/24px/Info` in Figma (placeholder) | Implementation uses semantic Lucide icons per Type: `info` / `check-circle-2` / `alert-circle` / `alert-triangle` / `info` — icon is consumer-controllable content. |

No raw primitives used. All colour, spacing, radius, typography values map to existing `--ai-*` tokens.

---

## Dependencies

- `Button` (`src/components/Button/`) — `btn btn--primary btn--sm` for CTA buttons (with Case B bg override per type)
- Lucide icons — `info`, `check-circle-2`, `alert-circle`, `alert-triangle`, `x`, `arrow-right`

---

## Notes

- **Old prototype removed.** `src/prototypes/Alerts/` was a Flowbite-inspired sketch that pre-dated the formal Figma variants. Deleted as part of this build per `feedback_no_prototype_after_component.md`.
- **Width is consumer-controlled** (`width: 100%`). Figma's 720px / 320px frame widths are layout artifacts.
- **CTA stacking is container-query driven.** `.alert` declares `container-type: inline-size`; the `.alert--cta` mobile rules live under `@container (max-width: 767px)`. Each alert reflows based on its own width — important when an alert sits in a narrow column on a wide viewport (e.g. ControlScreen with the docked sidebar). The container query is set on `.alert` itself so anonymous `@container` queries resolve to the alert's own width.
- **No `min-height` on `.alert`.** Figma binds `min-h-[48px]` on the wrapper, but in Chromium `container-type: inline-size` on a flex column resolves the intrinsic block-size as if the element had no children, so `min-height` becomes an effective `max-height` and clips content (a 32px button + 24px padding = 58px gets capped at 48px). The floor is moot in practice: every alert variant carries content that already exceeds 48px (text at 20px line-height + 24px padding + 2px border = 46px; with any button or list it's higher). Removed entirely rather than papered over.
- **CTA wrapper centres content vertically.** `.alert--cta` adds `justify-content: center` so the single Paragraph row centres inside the flex column when content is shorter than `min-height: var(--ai-spacing-9)`. Default style stays top-aligned.
- **CTA inter-column gap is `--ai-spacing-4` (12px), not `--ai-spacing-3` (8px) like Default.** Override lives on `.alert--cta .alert__header`. Confirmed against Figma `2753:2250` (Warning CTA Desktop) which binds `gap-[var(--ai-spacing-4)]` on the inner Paragraph.
- **Floating badge bg** is type-specific via a small set of overrides on `.alert--floating.alert--{success,neutral}`. (Info inherits the base badge colour.)
- **Fixed top border colour** is overridden per Type using `.alert--fixed.alert--{success,danger,warning,neutral}`. (Info inherits the base.)
- **No JS** — Alert is presentational. Consumer wires the close button to whatever dismissal behaviour they need.

---

## History

- 2026-05-29: Initial build from Figma frame `2542:5858`. All 24 variants implemented (10 newly-added Style=CTA variants + existing Default/Floating/Fixed). 4 STOPs resolved (Case B CTA-button override; normalised Info Fixed bg; Floating left as 3-type subset; Type icons mapped to semantic Lucide). Replaces the prior `src/prototypes/Alerts/` sketch which has been deleted.
