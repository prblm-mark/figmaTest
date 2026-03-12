# SourcesCarousel — Figma Notes

**Figma URL:** [node 2089:6582](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2089-6582)

## Composes

- Button (`btn btn--secondary btn--sm btn--icon`) — arrow navigation

## Property mapping — Card

| Figma property | CSS token | Value |
|---|---|---|
| Card background | `--ai-chat-card-bg` | #f3f4f6 / #111928 |
| Card padding | `--ai-spacing-4` | 12px |
| Card border-radius | `--ai-radius-md` | 8px |
| Internal gap (text↔image) | `--ai-spacing-5` | 16px |
| Text column gap | `--ai-spacing-1` | 4px |
| Text line-height | `--ai-leading-xs` | 1rem (16px) |
| Category font | `--ai-font-body` + `--ai-font-medium` + `--ai-font-fixed-xxs` | Inter Medium 12px |
| Category color | `--ai-text-secondary` | #4b5563 |
| Title font | `--ai-font-title` + `--ai-font-semibold` + `--ai-font-fixed-xs` | Inter SemiBold 14px |
| Title color | `--ai-text-primary` | #1f2a37 |
| Thumbnail | 56×56px, `--ai-radius-sm` (4px), object-fit cover | — |

## Property mapping — Track

| Figma property | CSS token | Value |
|---|---|---|
| Track gap | `--ai-spacing-3` | 8px |
| Scroll | overflow-x auto, scroll-snap-type x mandatory | — |

## Responsive

- Cards: `calc(100% / 2.5)` mobile, `calc(100% / 3)` at ≥799px
- Arrows hidden ≤768px

## GSAP animation

- Cards: `y: 40, opacity: 0` → `y: 0, opacity: 1`, 0.3s, stagger 0.05, back.out(1.4)
- Nav buttons: fade in after cards
