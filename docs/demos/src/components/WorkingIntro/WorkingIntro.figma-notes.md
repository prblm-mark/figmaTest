# WorkingIntro — Figma Notes

**Figma URLs:**
- Stage 1: [node 2077:1486](https://www.figma.com/design/Ikv8jxb5dcRH8ff4q4dR11/Affino-AI---AI-Chat?node-id=2077-1486)
- Stage 2: [node 2077:1492](https://www.figma.com/design/Ikv8jxb5dcRH8ff4q4dR11/Affino-AI---AI-Chat?node-id=2077-1492)
- Stage 3: [node 2077:1498](https://www.figma.com/design/Ikv8jxb5dcRH8ff4q4dR11/Affino-AI---AI-Chat?node-id=2077-1498)

## Stages

| Stage | Subtitle text | Weight |
|---|---|---|
| 1 | Preparing quick answers | Regular (400) |
| 2 | Searching 24,731 data sources | Regular (400) |
| 3 | Here are your quick answers | Medium (500) |

## Property mapping

| Figma property | CSS token | Value |
|---|---|---|
| Container gap | `--ai-spacing-3` | 8px |
| Title row gap | `--ai-spacing-3` | 8px |
| Avatar size | 24×24px inline SVG | — |
| Title font | `--ai-font-title` + `--ai-font-bold` + `--ai-font-fixed-md` | Inter Bold 18px |
| Title color | `--ai-text-primary` | #1f2a37 |
| Title letter-spacing | `--ai-tracking-3` | -0.0125em |
| Subtitle font | `--ai-font-body` + `--ai-font-regular` + `--ai-font-fixed-sm` | Inter Regular 16px |
| Subtitle color | `--ai-text-secondary` | #4b5563 |
| Subtitle line-height | `--ai-leading-md` | 1.5rem (24px) |
| Subtitle letter-spacing | `--ai-tracking-4` | 0em |
| Subtitle stage 3 weight | `--ai-font-medium` | 500 |

## GSAP animation

- **Logo pulse:** scale 1.0↔1.2, opacity 0.4↔1.0, yoyo, 1.2s, power1.inOut
- **Title reveal:** SplitText chars/lines → slide up y:100, 0.6s expo.out → char shimmer
- **Subtitle:** ScrambleTextPlugin cycles through 3 texts
- **Final state:** Title scrambles to "Please find your explanation below:" (parent orchestrator)
