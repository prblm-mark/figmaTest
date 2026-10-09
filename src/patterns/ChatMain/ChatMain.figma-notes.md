# ChatMain — Figma Notes

**Figma URL:** [node 2139:2759](https://www.figma.com/design/Ikv8jxb5dcRH8ff4q4dR11/Affino-AI---AI-Chat?node-id=2-3752)

## Variant Matrix

| Node ID | Type | View | Show Suggested Questions |
|---|---|---|---|
| `2139:2758` | Desktop | Initial | True |
| `2139:2849` | Desktop | Initial | False |
| `2139:2933` | Desktop | Processing Response | False |
| `2139:3159` | Desktop | Full response | False |
| `2139:2760` | Default (mobile) | Initial | True |
| `2139:2861` | Default (mobile) | Initial | False |
| `2139:2940` | Default (mobile) | Processing Response | False |
| `2139:3150` | Default (mobile) | Full response | False |

## View States

| View | CSS modifier | Description |
|---|---|---|
| Initial | `.chat-main--initial` | Welcome screen with greeting, inline MessageInput, suggested question cards |
| Processing | `.chat-main--processing` | User submitted; WorkingIntro + SourcesCarousel + Skeleton animation |
| Response | `.chat-main--response` | Full AI answer with MessageBubble, prose, sticky MessageInput |

## Component Structure

| Node | Element | Notes |
|---|---|---|
| `2139:2759` | Main | Outer wrapper, fills parent, flex column centered |
| — | Initial section | Welcome view with intro text + inline input + suggestions |
| — | Scroll area | Scrollable content for processing + response views |
| — | Container | Max-width 768px, padded content |
| — | Processing | WorkingIntro + SourcesCarousel + Skeleton (ChatResponse) |
| — | Response | AI prose block |
| — | Footer | Sticky fade + MessageInput |

## CSS Class Mapping

| Element | CSS class |
|---|---|
| Outer wrapper | `.chat-main` |
| Initial view | `.chat-main__initial` |
| Initial inner | `.chat-main__initial-inner` |
| Welcome intro | `.chat-main__intro` |
| Welcome title | `.chat-main__title` |
| Welcome subtitle | `.chat-main__subtitle` |
| Input wrapper (initial) | `.chat-main__input-wrap` |
| Suggestions grid | `.chat-main__suggestions` |
| Feedback text | `.chat-main__feedback` |
| Scrollable area | `.chat-main__scroll` |
| Content container | `.chat-main__container` |
| Processing section | `.chat-main__processing` |
| AI response text | `.chat-main__response` |
| Footer (fade + input) | `.chat-main__footer` |
| Fade gradient | `.chat-main__fade` |
| Input wrapper (footer) | `.chat-main__input` |

## Token Mapping — Initial View

| Property | Token | Value |
|---|---|---|
| Background | `--ao-surface-primary` | #ffffff |
| Container max-width | `--ao-size-11` | 768px |
| Container padding (vertical) | `--ao-spacing-8` | 40px |
| Container padding (horizontal) | `--ao-spacing-6` | 24px (desktop only) |
| Container gap (mobile) | `--ao-spacing-6` | 24px |
| Container gap (desktop) | `--ao-spacing-5` | 16px |
| Title font | `--ao-font-title`, `--ao-font-bold` | Inter 700 |
| Title size (mobile) | `--ao-font-fluid-2xl` | responsive |
| Title size (desktop) | `--ao-font-fluid-4xl` | responsive |
| Title leading (mobile) | `--ao-leading-lg` | 2rem |
| Title leading (desktop) | `--ao-leading-xl` | 2.5rem |
| Title color | `--ao-text-primary` | #1F2A37 |
| Subtitle font | `--ao-font-body`, `--ao-font-regular` | Inter 400 |
| Subtitle size (mobile) | `--ao-font-fluid-sm` | responsive |
| Subtitle size (desktop) | `--ao-font-fluid-md` | responsive |
| Subtitle color | `--ao-text-contrast` | #6B7280 |
| Intro gap | `--ao-spacing-5` | 16px |
| Intro padding-bottom (mobile) | `--ao-spacing-5` | 16px |
| Intro padding-bottom (desktop) | `--ao-spacing-7` | 32px |
| Suggestions grid (mobile) | `repeat(2, 1fr)` | 2 cols |
| Suggestions grid (desktop) | `repeat(3, 1fr)` | 3 cols |
| Suggestions gap | `--ao-spacing-5` | 16px |
| Feedback font-size | `--ao-font-fixed-xxs` | 12px |
| Feedback color | `--ao-text-contrast` | #6B7280 |

## Token Mapping — Scroll Area (Processing + Response)

| Property | Token | Value |
|---|---|---|
| Container max-width | `--ao-size-11` | 768px |
| Container padding | `--ao-spacing-8` `--ao-spacing-6` | 40px 24px |
| Container gap | `--ao-spacing-8` | 40px |
| Response font-family | `--ao-font-body` | Inter |
| Response font-size | `--ao-font-fluid-sm` | 16px (responsive) |
| Response line-height | `--ao-leading-md` | 24px |
| Fade height | `--ao-size-2` | 160px |
| Fade gradient | `--ao-gradient-surface-primary` | to bottom |

## Dependencies

- Composes **SuggestedQuestion** (`src/components/SuggestedQuestion/`)
- Composes **MessageBubble** (`src/components/MessageBubble/`)
- Composes **MessageInput** (`src/patterns/MessageInput/`)
- Composes **WorkingIntro** (`src/components/WorkingIntro/`)
- Composes **SourcesCarousel** (`src/patterns/SourcesCarousel/`)
- Composes **Skeleton** (`src/components/Skeleton/`)
- Composes **Button** (`src/components/Button/`)
- Composes **Tooltip** (`src/components/Tooltip/`)
- Uses **ChatResponse** JS timeline (`src/templates/ChatResponse/ChatResponse.js`)

## Interaction

- Initial → Processing: GSAP fade-out of intro/suggestions, input slides to footer, ChatResponse timeline plays
- Processing → Response: ChatResponse timeline completes, switches to response view
- SuggestedQuestion click: auto-submits the question text
- Transition: `--ao-transition-default` (150ms ease) for hover states
