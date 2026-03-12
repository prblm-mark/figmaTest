# ChatResponse — Figma Notes

**Figma URL:** [node 2089:6577](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2089-6577)

## Composes

- WorkingIntro (component)
- SourcesCarousel (pattern) — which composes Button
- Skeleton (component)

## Layout

| Figma property | CSS token | Value |
|---|---|---|
| Container max-width | `48rem` | 768px |
| Sources margin-top | `--ai-spacing-5` | 16px |
| Skeletons gap | `--ai-spacing-6` | 24px |
| Skeletons margin-top | `--ai-spacing-8` | 40px |
| Answer margin-top | `--ai-spacing-7` | 32px |

## Master Timeline (8s)

| Time | Event |
|---|---|
| 0.0s | WorkingIntro starts (logo pulse + title reveal) |
| 0.0s | Skeleton shimmer starts |
| 0.1s | Subtitle scramble 1: "Preparing quick answers" |
| ~0.9s | Subtitle scramble 2: "Searching 24,731 data sources" |
| ~1.7s | Subtitle scramble 3: "Here are your quick answers" |
| 2.0s | Carousel cards slide in (staggered) |
| 2.3s | Carousel arrows appear (desktop) |
| 7.5s | Skeleton stops + fades out |
| 7.5s | Title scrambles to "Please find your explanation below:" |
| 7.5s | Logo pulse stops |
| 8.0s | Answer content fades in (0.8s, sine.inOut) |

## GSAP plugins required

- SplitText
- ScrambleTextPlugin
