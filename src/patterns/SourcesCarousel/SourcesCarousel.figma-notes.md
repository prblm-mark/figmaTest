# SourcesCarousel — Figma Notes

**Figma URL:** [node 2089:6582](https://www.figma.com/design/Ikv8jxb5dcRH8ff4q4dR11/Affino-AI---AI-Chat?node-id=2089-6582)

## Variants — SourcesCarouselItem

| Variant | Node | Layout | Direction | Gap | Image position |
|---|---|---|---|---|---|
| Device=Default | `2077:1559` | flex-col | column | `--ao-spacing-3` (8px) | Top (before text) |
| Device=Desktop | `2107:3829` | flex-row | row | `--ao-spacing-5` (16px) | Right (after text, via `order: 1`) |

Layout switching is handled by a **container query** (`@container (min-width: 15rem)`) on each `.sources-card`. HTML order matches Device=Default (image first, text second); Desktop reorders via CSS `order`.

## Composes

- Button (`btn btn--secondary btn--sm btn--icon`) — arrow navigation

## Property mapping — Card

| Figma property | CSS token | Value |
|---|---|---|
| Card background | `--ao-src-carousel-card-bg` | #f3f4f6 / #111928 |
| Card padding | `--ao-spacing-4` | 12px |
| Card border-radius | `--ao-radius-md` | 8px |
| Internal gap (default/narrow) | `--ao-spacing-3` | 8px |
| Internal gap (desktop/wide) | `--ao-spacing-5` | 16px |
| Text column gap | `--ao-spacing-1` | 4px |
| Text line-height | `--ao-leading-xs` | 1rem (16px) |
| Category font | `--ao-font-body` + `--ao-font-medium` + `--ao-font-fixed-xxs` | Inter Medium 12px |
| Category color | `--ao-text-contrast` | #6b7280 |
| Title font | `--ao-font-title` + `--ao-font-semibold` + `--ao-font-fixed-xs` | Inter SemiBold 14px |
| Title color | `--ao-text-primary` | #1f2a37 |
| Thumbnail size | `--ao-spacing-10` | 3.5rem (56px) |
| Thumbnail radius | `--ao-radius-sm` | 4px |

## Property mapping — Track

| Figma property | CSS token | Value |
|---|---|---|
| Track gap | `--ao-spacing-3` | 8px |
| Scroll | overflow-x auto, scroll-snap-type x mandatory | — |

## Responsive columns

| Breakpoint | Columns | Crop | Nav arrows |
|---|---|---|---|
| Mobile (< 768px) | 1.5 | Half of 2nd card visible | Hidden |
| Tablet (768px–1023px) | 2.5 | Half of 3rd card visible | Hidden |
| Desktop (≥ 1024px) | 3 | Full columns | Visible |

Container query breakpoint: `12rem` (192px = `--ao-size-3`) switches card from vertical to horizontal layout. Nav arrows are hidden (not disabled) when scroll is unavailable.

## GSAP animation

- Cards: `y: 40, opacity: 0` → `y: 0, opacity: 1`, 0.6s, stagger 0.08, power2.out
- Nav buttons: fade in after cards
