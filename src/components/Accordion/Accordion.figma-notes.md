# Accordion — Figma Notes

**Figma URL:** [node 2527:2622](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2527-2622)

## Component Set

Accordion is a Tier=Component design-system component. Each item has a header (trigger) that toggles a body panel below. Variants control the container styling and size.

## Variant × Size Matrix

| Node | Type | Size | Notes |
|---|---|---|---|
| `2527:2621` | Default | Default | Bordered container, single-open behaviour |
| `2527:2742` | Default | sm | Smaller header (40px) and tighter typography |
| `2527:2619` | Separated Cards | Default | Each item is its own card with shadow + gap between cards |
| `2527:2764` | Separated Cards | sm | Smaller separated cards |
| `2527:2618` | All Open | Default | Multiple items can be open at once (JS only — same CSS) |
| `2527:2786` | All Open | sm | Smaller all-open |
| `2527:2617` | Flush | Default | Top + bottom border only — no card chrome, transparent triggers |
| `2527:2811` | Flush | sm | Smaller flush |
| `2527:2620` | Nested | Default | Default container with another `.acc` inside an open panel |
| `2527:2829` | Nested | sm | Smaller nested |

## CSS Class Mapping

| Figma property | CSS class |
|---|---|
| Type=Default | `.acc` (base) |
| Type=Separated Cards | `.acc--separated` |
| Type=All Open | `.acc` with `data-acc="multi"` (JS) |
| Type=Flush | `.acc--flush` |
| Type=Nested | `.acc__panel > .acc` (composition only) |
| Size=Default | `.acc` (base) |
| Size=sm | `.acc--sm` |
| Item open | `.acc__item--open` (JS adds on click) |

## Token Mapping

| Property | Token | Value |
|---|---|---|
| Container bg | `--ai-surface-primary` | #ffffff |
| Container border | `--ai-border-secondary` | #e2e2e3 |
| Container radius | `--ai-radius-md` | 8px |
| Container inner padding | `1px` | spacing/px (raw — optical inner offset) |
| Trigger bg | `--ai-surface-minimal` | #f6f6f7 |
| Trigger hover bg | `--ai-surface-secondary` | #e2e2e3 |
| Trigger height (Default) | `--ai-spacing-10` | 56px |
| Trigger height (sm) | `--ai-spacing-8` | 40px |
| Trigger padding (Default) | `--ai-spacing-5` v / `--ai-spacing-6` h | 16/24px |
| Trigger padding (sm) | `--ai-spacing-5` | 16px |
| Trigger font | `--ai-font-title` `--ai-font-semibold` | Inter 600 |
| Trigger size (Default) | `--ai-font-fixed-sm` | 16px |
| Trigger size (sm) | `--ai-font-fixed-xs` | 14px |
| Trigger color | `--ai-text-primary` | #212123 |
| Item separator | `--ai-border-secondary` | 1px |
| Panel bg | `--ai-surface-primary` | #ffffff (inherits container) |
| Panel border-top | `--ai-border-secondary` | 1px |
| Panel padding (Default) | `--ai-spacing-5` t / `--ai-spacing-6` h+b | 16/24/24px |
| Panel padding (sm) | `--ai-spacing-5` | 16px all |
| Panel text | `--ai-text-secondary` | #3c3c3f |
| Panel size (Default) | `--ai-font-fixed-xs` | 14px |
| Panel size (sm) | `--ai-font-fixed-xxs` | 12px |
| Panel line-height (Default) | `--ai-leading-md` | 24px |
| Panel line-height (sm) | `--ai-leading-sm` | 20px |
| Chevron icon size | `--ai-icon-size-sm` | 16px |
| Chevron color | `--ai-icon-contrast` | #929295 |
| Separated card gap | `--ai-spacing-3` | 8px |
| Separated card shadow | `0 1px 3px rgba(0,0,0,0.05)` | static (raw — card elevation) |
| Nested gap from paragraph | `--ai-spacing-4` | 12px (`margin-top` on `.acc__panel .acc`) |

## Token Gaps

None — all colour, spacing, typography, and radius values resolve to existing `--ai-*` tokens. The `1px` inner padding and the raw separated-card box-shadow are optical/structural values per CLAUDE rules and don't require tokens.

## Icons

| Element | Lucide name |
|---|---|
| Header chevron | `chevron-down` |

## Dependencies

None — Accordion is a self-contained atomic component. It composes Lucide icons via the project's standard `<i data-lucide>` pattern.

## Notes

- Single-open vs multi-open behaviour is controlled by `data-acc="single"` (default) or `data-acc="multi"` (All Open).
- Headings use `<h3>` for top-level accordions and `<h4>` for nested accordions to maintain semantic hierarchy. The `.acc__heading` class strips default heading margins/typography so the `<button>` controls the appearance.
- Chevron rotates 180deg via `.acc__item--open .acc__chevron { transform: rotate(180deg) }`.
- Type=Nested doesn't add any new CSS — it's the same as Default with another `.acc` placed inside an `.acc__panel`. The panel adds `margin-top` to the nested accordion for breathing room from the paragraph above it.
- Type=Separated Cards uses `gap` between items and gives each item its own border, radius, and subtle shadow. Closed items show as fully grey (the trigger's bg-minimal fills the card); open items show grey trigger + white body.
- Type=Flush removes the outer card and shows only top + bottom borders on the container, with transparent triggers and no horizontal padding so the header text aligns to the parent surface.
- Trigger hover is suppressed on Flush variant (transparent bg with hover would jar visually against the parent surface).
- Each item announces its expanded state via `aria-expanded` set by JS on click.
