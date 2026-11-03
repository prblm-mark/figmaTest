# ChatMain — Figma Notes

**Figma URL:** [node 2:3752](https://www.figma.com/design/Ikv8jxb5dcRH8ff4q4dR11/Affino-AI---AI-Chat?node-id=2-3752)

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
| Suggestions grid (1 question) | `1fr` | full width, all widths — code rule, not in Figma |
| Suggestions grid (2 or 4 questions) | `repeat(2, 1fr)` | even rows (2 × 2 for 4), all widths — code rule, not in Figma |
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

## Even rows by question count (2026-11-03)

Mark's direction, relayed from affino-web (SupportChat, commit c50cb12): the suggestions grid must
never leave one card alone in a row. Figma (`2:3753` desktop, `2:3788` mobile) only draws the
3-question case (3 across desktop; 2 of 3 on mobile), so the other counts are a **code rule**:

| Questions | Narrow (container below 640px) | Wide (container 640px and up) |
|---|---|---|
| 1 | 1 col | 1 col |
| 2 | 2 | 2 |
| 3 | 2 (3rd hidden — Figma) | 3 |
| 4 | 2 × 2 | 2 × 2 |
| 5 | 2 × 2 (3rd hidden) | 3 + 2 |
| 6 | 2 × 3 | 3 × 2 |

- Counts use `:has(> .suggested-question:nth-child(n))`, so questions must come first in
  `.chat-main__suggestions`; `.chat-main__feedback` after them already spans `1 / -1`.
- The mobile hide of the 3rd question is now **odd counts only** (3, 5). It used to be
  unconditional, so 4 questions rendered 1, 2, 4 (two plus one alone).
- The count rules (specificity 0,3,0+) intentionally beat the 2-column pins in AiChatMinimised
  and AiAssistant, so 1 question is full width there too.
- **Figma follow-up (designer):** worth adding a 4-question (2 × 2) instance to the Initial
  variants, so the rule has a drawn source.
- 5 at desktop is 3 + 2 as the request specified ("keep current columns"), so there is an uneven
  last row there.
- **Container query, not viewport (2026-11-03).** `.chat-main__initial` is the query container
  (`container-name: chat-main-initial`; full column width, no padding). The suggestions grid and
  the 3rd-card show switch at `@container chat-main-initial (min-width: 640px)`. This means the
  384px AiChatMinimised and 320px AiAssistant widgets keep the narrow layout on any window, which
  used to need a widget-only override. In AiChat the switch point is unchanged: below 1024px the
  sidebar is hidden, so column = window; at 1024px and up the column is at least ~744px.
- ChatMain's other `@media (min-width: 640px / 768px)` blocks (intro, input wrap, scroll area,
  response) are **still viewport-based**; the widgets pin those with their own overrides.
- Old node ID `2139:2759` in this file was stale (not found in the file); the live set is `2:3752`.
  The variant table above still lists the old `2139:*` IDs.

