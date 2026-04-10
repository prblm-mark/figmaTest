# AiChatMinimised — Figma Notes

**Figma URL:** [node 2160:4810](https://www.figma.com/design/Ikv8jxb5dcRH8ff4q4dR11/Affino-AI---AI-Chat?node-id=2160-4810)

**Tier:** Template

Floating popup chat widget (384px wide). Embeds the same chat UI as AiChat but in a fixed-position popup with drag, resize, and window controls.

---

## How it differs from AiChat

| Aspect | AiChat | AiChatMinimised |
|---|---|---|
| Layout | Full-page, responsive (fills viewport) | Fixed popup (384px × 668px), bottom-right corner |
| Sidebar | Inline at ≥1024px, overlay on mobile | Always overlay — slides in from left |
| Header | Default ChatHeader with admin controls | ChatHeader `--minimised` with window buttons (maximize + close) |
| Resize | Sidebar width on desktop (col-resize) | Popup height via top-edge handle (ns-resize) |
| Drag | None | Header acts as drag handle (`cursor: move`) |
| Responsiveness | Desktop ↔ mobile via media queries | Always mobile-width; CSS overrides pin all breakpoints |
| Border radius | None (edge-to-edge) | `--ai-radius-xl` rounded corners |
| Shadow | Sidebar only (mobile open state) | `--ai-shadow-lg` on popup container |
| Sidebar logo | Visible | Hidden |
| Sidebar search | Visible | Hidden |
| Admin controls | Visible at xl breakpoint | Not included |
| Max height | None (full viewport) | `calc(100vh - spacing-6 × 2)`, min 320px |

---

## CSS override strategy

### The problem

The 384px popup lives on a **desktop viewport**, so `min-width: 640px` media queries in child components (ChatMain, SourcesCarousel, MessageInput, etc.) fire — incorrectly upgrading font sizes, grid columns, layout directions, and spacing to desktop values inside a mobile-width container.

### The fix

Every desktop escalation is pinned back to its mobile base value using scoped overrides under `.ai-chat-min`. These are **not new styles** — they repeat the component's own mobile/base values, scoped to override the desktop media query.

### ChatMain overrides

| Selector | Property | Value pinned | Desktop value blocked |
|---|---|---|---|
| `.chat-main__initial-inner` | gap, padding | `spacing-6`, `spacing-8 0` | spacing-5, spacing-8 spacing-6 |
| `.chat-main__intro` | gap, padding | `spacing-3`, `0 spacing-5 0` | spacing-5, 0 0 spacing-5 |
| `.chat-main__title` | font-size, line-height | `font-fixed-xl`, `leading-lg` | font-fixed-3xl, leading-xl |
| `.chat-main__subtitle` | font-size | `font-fixed-xs` | font-fixed-sm / font-fixed-md |
| `.chat-main__input-wrap` | padding | `0 spacing-5` | 0 |
| `.chat-main__suggestions` | grid-template-columns, gap, padding | `repeat(2, 1fr)`, `spacing-4`, `0 spacing-5` | repeat(3, 1fr), spacing-5, 0 |
| `.chat-main__container` | padding | `spacing-6` | spacing-8 spacing-6 |
| `.chat-main__response` | font-size | `font-fixed-xs` | font-fluid-sm |
| `.chat-main__response code` | font-size | `font-fixed-xxs` | font-fixed-xs |
| `.chat-main__input` | padding | `0 spacing-2` | 0 |
| `.chat-main__processing .skeletons` | margin-top | `spacing-6` | spacing-8 |
| `.chat-main__processing .answer` | margin-top, font-size | `spacing-6`, `font-fixed-xs` | spacing-7, font-fluid-sm |

### SourcesCarousel overrides

| Selector | Property | Value pinned |
|---|---|---|
| `.sources-card` | flex | Mobile 1.5-card width |
| `.sources-card__inner` | flex-direction, gap | `column`, `spacing-3` |
| `.sources-card__thumb` | order | `0` (thumb first) |
| `.sources-carousel` | padding | `0` |
| `.sources-carousel__nav` | display | `none` (arrows hidden) |

### SourcesLink overrides

| Selector | Property | Value pinned |
|---|---|---|
| `.sources-link` | max-width | `100%` (uncapped) |

### ChatResponseTable overrides

| Selector | Property | Value pinned |
|---|---|---|
| `.chat-response-table` | font-size | `font-fixed-xs` |
| `.chat-response-table th` | font-size | `font-fixed-xxs` |

### SuggestedQuestion overrides

| Selector | Property | Value pinned |
|---|---|---|
| `.suggested-question [data-lucide]` | width, height | `icon-size-sm` |
| `.suggested-question__text` | font-size, line-height | `font-fixed-xxs`, `leading-xs` |
| `.suggested-question__subtext` | display | `none` (hidden) |

### WorkingIntro overrides

| Selector | Property | Value pinned |
|---|---|---|
| `.working-intro` | gap | `spacing-1` |
| `.working-intro__title-row` | flex-direction, align-items, gap | `column`, `flex-start`, `spacing-3` |
| `.working-intro__title` | font-size | `font-fixed-sm` |
| `.working-intro__subtitle` | font-size | `font-fixed-xs` |

### MessageBubble overrides

| Selector | Property | Value pinned |
|---|---|---|
| `.msg-bubble` | padding-left | `spacing-8` |
| `.msg-bubble__text` | font-size | `font-fixed-xs` |

### MessageInput overrides

| Selector | Property | Value pinned |
|---|---|---|
| `.msg-input__box` | padding | `spacing-5` |
| `.msg-input__textarea` | font-size | `font-fixed-xs` |

---

## Unique features

- **Drag:** Header (`cursor: move`) acts as drag surface; buttons retain `cursor: pointer`
- **Height resize:** Top-edge handle (`cursor: ns-resize`), 6px hit area
- **Panel height:** Controlled via `--_panel-height` CSS custom property (default 668px)
- **Transition suppression:** `.ai-chat-min--no-transition` disables all transitions during drag/resize
- **Close state:** `.ai-chat-min--hidden` hides the entire widget (`display: none`)
- **Overflow:** `overflow: clip` on container for rounded corner clipping

---

## Dark mode

- **Scrollbar colors:** Custom `color-mix()` overrides for both light and dark themes, blending `--ai-surface-primary` with blue (light) or white (dark) at different ratios for track and thumb
- **Tertiary button hover:** `[data-theme="dark"] .ai-chat-min .btn--tertiary:hover` uses `--ai-surface-minimal`

---

## Component structure

```
.ai-chat-min (fixed position popup, data-surface="chat")
├── .ai-chat-min__resize-handle (top-edge, ns-resize)
├── ChatHeader --minimised (drag handle)
│   ├── Sidebar toggle button
│   ├── Assistant selector
│   ├── Maximize button
│   └── Close button
└── .ai-chat-min__main
    ├── .ai-chat-min__overlay (sidebar backdrop)
    ├── .ai-chat-min__sidebar (absolute, transform slide-in)
    │   └── ChatSidebar (logo + search hidden)
    └── ChatMain (all breakpoints pinned to mobile)
        ├── Initial view (welcome + suggestions)
        ├── Processing view (WorkingIntro + SourcesCarousel + Skeleton)
        ├── Response view (MessageBubble + prose + QuickLinks + ChatResponseTable)
        └── Footer (fade gradient + MessageInput)
```

---

## Dependencies

- Composes **ChatHeader** (`src/patterns/ChatHeader/`) — `--minimised` variant
- Composes **ChatMain** (`src/patterns/ChatMain/`)
- Composes **ChatSidebar** (`src/patterns/ChatSidebar/`)
- Inherits all ChatMain sub-dependencies: SuggestedQuestion, MessageBubble, MessageInput, WorkingIntro, SourcesCarousel, Skeleton, Button, Tooltip, QuickLinks, SourcesLink, ChatResponseTable

---

## CSS Class Mapping

| Element | CSS class |
|---|---|
| Popup container | `.ai-chat-min` |
| Top resize handle | `.ai-chat-min__resize-handle` |
| Sidebar overlay | `.ai-chat-min__overlay` |
| Sidebar wrapper | `.ai-chat-min__sidebar` |
| Main content area | `.ai-chat-min__main` |
| Hidden state | `.ai-chat-min--hidden` |
| Sidebar open state | `.ai-chat-min--sidebar-open` |
| Drag transition lock | `.ai-chat-min--no-transition` |
| Resize active | `.ai-chat-min--resizing` |

---

## Token Mapping

| Property | Token |
|---|---|
| Popup background | `--ai-surface-primary` (via `data-surface="chat"`) |
| Popup border radius | `--ai-radius-xl` |
| Popup shadow | `--ai-shadow-lg` |
| Popup width | `--ai-size-7` (384px) |
| Popup min-height | 320px |
| Max width | `calc(100vw - spacing-5 × 2)` |
| Max height | `calc(100vh - spacing-6 × 2)` |
| Resize handle hover bg | `--ai-border-secondary` |
| Sidebar shadow (open) | `4px 4px 6px rgba(0,0,0,0.1)` |
