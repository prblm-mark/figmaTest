# SystemRole — Figma Notes

## Figma Node

- **File key:** `Lus07xi8pPXLN87sQIyrEt`
- **Page node:** `1:769` (Components page)
- **Default variant:** `163:3894`
- **Minimised variant:** `169:2466`
- **Mobile variant:** `176:3242`

## Variant Matrix

| Variant | Node | Size | Padding | Controls | Activation | Notes |
|---|---|---|---|---|---|---|
| Default | 163:3894 | 1512×973px | 40px all (`--ai-spacing-8`) | `panel-right-dashed` + `x` (40×40px) | JS `.system-role--open` | Full-screen modal with blurred backdrop |
| Minimised | 169:2466 | 400px w × 1360px h | pt-16 px-24 pb-24 | `maximize-2` + `x` (32×32px) | JS `.system-role--minimised` | Floating compact panel, draggable, left-edge resizable |
| Mobile | 176:3242 | Full viewport | pt-16 px-24 pb-24 | `panel-right-dashed` + `x` (32×32px) | CSS `@media (max-width: 767px)` | Full-viewport CSS-only layout, no resize/drag, no overlay |

## CSS Class Mapping

### Modal structure

| Figma element | CSS class | Notes |
|---|---|---|
| Root modal | `.system-role` | `position: fixed`, centered via `transform: translate(-50%, -50%)` |
| Open state | `.system-role--open` | `opacity: 1; pointer-events: auto` |
| Minimised state | `.system-role--minimised` | Width/padding overrides + layout changes |
| Dirty state | `.system-role--dirty` | Toggles header button group |
| No-transition (drag/resize) | `.system-role--no-transition` | `transition: none !important` — JS adds/removes during drag |
| Backdrop overlay | `.system-role-overlay` | `position: fixed; inset: 0` |
| Overlay visible | `.system-role-overlay--open` | `opacity: 1` |
| Top bar | `.system-role__top` | Flex row (Default) → flex column (Minimised) |
| Window controls | `.system-role__controls` | Icon button group; `order: 1` in Default, `order: -1` in Minimised; `width: 100%; max-width: 400px` in Default so the controls column aligns with the sidebar below |
| Minimize button | `.system-role__minimize-btn` | `sidebar` icon; hidden in Minimised via CSS |
| Maximize button | `.system-role__maximize-btn` | `maximize-2` icon; hidden in Default via CSS |
| Close button | `.system-role__close-btn` | `x` icon; always visible |
| Body | `.system-role__body` | Flex row (Default) → flex column (Minimised) |
| Prompt area | `.system-role__prompt` | `flex: 1`; bordered with `--ai-surface-contrast` |
| Textarea | `.system-role__textarea` | `flex: 1`; no border/outline |
| Sidebar | `.system-role__sidebar` | `width: 400px` (Default) → `width: 100%` (Minimised) |
| Resize handle (left edge) | `.system-role__resize-handle` | `display: none` (Default) → `display: block` (Minimised) |
| Resize handle (bottom edge) | `.system-role__resize-handle-bottom` | `display: none` (Default) → `display: block` (Minimised); `cursor: ns-resize` |
| Textarea resize handle | `.system-role__textarea-resize-handle` | `display: none` (Default) → `display: block` (Minimised); sits between textarea and sidebar |

### Header button states

| State | Visible buttons | CSS rule |
|---|---|---|
| Clean (default) | `.system-role__btn-default` (disabled Make Live) | Base CSS |
| Dirty (textarea edited) | `.system-role__btn-discard` + `.system-role__btn-save` | `.system-role--dirty` modifier |

## Token Mapping

| Property | CSS Variable | Value |
|---|---|---|
| Modal background | `--ai-surface-elevated-1` | `#FFFFFF` (light) / `#212123` (dark) |
| Modal border | `--ai-border-secondary` | `1px solid` |
| Modal border-radius | `--ai-radius-xl` | `1.5rem` |
| Default padding | `--ai-spacing-8` | `2.5rem` (40px) |
| Minimised padding-top | `--ai-spacing-5` | `1rem` (16px) |
| Minimised padding-left/right/bottom | `--ai-spacing-6` | `1.5rem` (24px) |
| Top bar / body gap | `--ai-spacing-7` | `2rem` (32px) — matches body column gap so header/controls align over prompt/sidebar |
| Body gap (prompt ↔ sidebar) | `--ai-spacing-7` | `2rem` (32px) |
| Sidebar panels gap | `--ai-spacing-7` | `2rem` (32px) |
| Prompt border color | `--ai-surface-contrast` | `#D1D5DB` |
| Prompt border-radius | `--ai-radius-lg` | `1rem` |
| Prompt padding (Default) | `--ai-spacing-6` | `1.5rem` (24px) |
| Prompt padding (Minimised) | `--ai-spacing-5` | `1rem` (16px) — updated in Figma |
| Textarea text | `--ai-text-primary` | `#1F2A37` |
| Textarea font-size | `--ai-font-fixed-xs` | `0.875rem` (14px, fixed — never responsive) |
| Textarea line-height | `--ai-leading-md` | `1.5rem` |
| Minimised icon btn size | `--ai-spacing-7` | `2rem` (32px) |
| Minimised header btn height | `--ai-spacing-7` | `2rem` (32px) |
| Minimised header btn padding | `--ai-spacing-4` | `0.75rem` (12px) |
| Minimised header btn font | `--ai-font-fluid-xxs` | `0.75rem` |

## Overview

SystemRole is a **modal editor for the AI assistant's system prompt** — the instruction text that defines how the LLM behaves (tone, rules, escalation framework, etc.). It's accessed from the ChatHeader admin controls in the AiChat template.

The modal has two panels:
- **Prompt textarea** (left in Default, top in Minimised) — editable text containing the current system prompt
- **Sidebar** (right in Default, below in Minimised) — two helper panels: VersionHistory and PromptTemplates

Uses `data-surface="chat"` for the chat-context token palette.

### Layout modes

| Mode | Trigger | Layout |
|---|---|---|
| Default | Full-screen modal | Side-by-side (prompt + sidebar), blurred backdrop overlay |
| Minimised | Minimize button / `<940px` container query | Stacked (prompt above sidebar), floating draggable/resizable panel |
| Mobile | `@media (max-width: 767px)` | Full-viewport, stacked, no drag/resize, no overlay |

---

## Version History behaviour

Shows previously saved prompt versions, each with an author avatar and timestamp. The live (current) version starts **selected** with a green check circle.

### Interaction model — radio toggle

- **Click a row** → selects it (green check replaces avatar portrait), loads that row's `data-prompt` into the textarea, marks prompt as "template-linked" (border highlights to `--ai-border-primary`)
- **Click the same row again** → deselects it, reverts textarea to last saved value
- **Click a different row** → deselects previous, selects new one
- **Selecting a VH row clears any active Prompt Template** (mutual exclusivity)

### Visual states

| State | Background | Border | Avatar |
|---|---|---|---|
| Default (unselected) | transparent | transparent | Portrait image, `--ai-surface-elevated-1` ring |
| Hover | `--ai-surface-elevated-1` | `--ai-border-invert` | Portrait image |
| Selected | `--ai-surface-elevated-1` | `--ai-border-invert` | Green check circle (`--ai-surface-success`) |
| Live | `--ai-surface-elevated-2` | none | Portrait image |
| Selected & Live | `--ai-surface-elevated-2` | none | Green check circle, wider gap (`--ai-spacing-5`) |

### Live row

- Starts pre-selected with check icon on initial load
- `data-portrait-src` stores the original portrait URL for restoration on deselect
- The avatar swap is handled by JS: portrait `<img>` is replaced with `<i data-lucide="check">` on select, and restored on deselect

### Expand/collapse

Footer toggle ("Show older" / "Show less") reveals additional rows beyond the initial 5 visible.

---

## Prompt Templates behaviour

Shows reusable prompt presets. Each item has an icon, title, and expandable description.

### Interaction model — radio toggle with accordion

- **Click an item** → selects it (border changes to `--ai-border-invert`), loads the item's description text into the textarea, marks prompt as "template-linked"
- **Click the same item again** → deselects, reverts textarea to saved value
- **Click a different item** → deselects previous, selects new
- **Selecting a template clears any active VH row** (mutual exclusivity)

### Chevron accordion

- Click the chevron → expands that item's description panel (chevron rotates 90deg)
- Only one item expanded at a time — others auto-collapse
- Chevron click does NOT trigger selection (`stopPropagation`)
- Clicking outside the panel collapses any expanded item

---

## Mutual exclusivity

Version History and Prompt Templates are **mutually exclusive**. Selecting from one always deselects the other. The textarea always reflects a single source — either a historical version or a template, never both.

---

## Dirty state

Any change to the textarea (including loads from VH/PT) triggers dirty detection:

| State | Header buttons shown | Prompt border |
|---|---|---|
| Clean | "Make Live" (disabled) | `--ai-border-secondary` (default) |
| Dirty | "Discard Changes" + "Save" | `--ai-border-secondary` (default) |
| Template-linked | Per dirty state above | `--ai-border-primary` (highlighted via `.system-role__prompt--template-linked`) |

- **Discard** → reverts textarea to last saved value, clears dirty + template-linked state
- **Save** → updates saved value, clears dirty state

---

## Token Gaps

| Property | Figma value | Decision |
|---|---|---|
| Modal box-shadow | `--ai-shadow-lg` | Resolved — uses shadow token |
| Backdrop colour (light) | `rgba(27, 27, 31, 0.5)` | Approved — Neutral/900 at 50% opacity |
| Backdrop colour (dark) | `rgba(0, 0, 0, 0.6)` | Approved — true black at 60% opacity |
| Backdrop blur | Not specified in tokens | Approved as `blur(2px)` |
| Textarea text colour | Figma: `text-black` (`#000000`) | Approved substitution: `--ai-text-primary` for dark mode correctness |

## JS Behaviors

| Behavior | Trigger | Effect |
|---|---|---|
| Dirty detection | `textarea` `input` event | Toggles `.system-role--dirty`; Discard/Save buttons appear |
| Discard | Click `.system-role__btn-discard` | Restores `savedValue` to textarea, removes dirty state |
| Save | Click `.system-role__btn-save` | Updates `savedValue`, removes dirty state |
| Minimise | Click `.system-role__minimize-btn` | Adds `--minimised` + `data-layout="minimised"`, hides overlay, positions top-right |
| Maximise | Click `.system-role__maximize-btn` | Removes `--minimised` + `data-layout`, clears inline styles, restores overlay |
| Close | Click `.system-role__close-btn` | Removes `--open`, hides overlay, shows "Open" button |
| Re-open | Click `#openBtn` | Adds `--open`, restores overlay (if Default mode) |
| Drag | Mousedown on `.system-role__top` (Minimised only, not on buttons) | Updates `left`/`top` inline styles; suppresses transition with `--no-transition` |
| Resize (width) | Mousedown on `.system-role__resize-handle` (Minimised only) | Updates `width` + `left` inline styles; right edge stays fixed; min-width 400px |
| Minimise heights | Click `.system-role__minimize-btn` | Sets `modal.style.height = 75vh`; sets `textarea.style.height = panelHeight/3` |
| Textarea resize | Mousedown on `.system-role__textarea-resize-handle` (Minimised only) | Drags bottom of prompt area; updates `textarea.style.height`; min 80px |
| Panel height resize | Mousedown on `.system-role__resize-handle-bottom` (Minimised only) | Drags bottom edge of panel; updates `modal.style.height`; min 200px, max = viewport bottom minus 16px |

## Minimised Layout Details

Minimised mode is triggered by:
1. `.system-role--minimised` CSS modifier (layout + size overrides)
2. `data-layout="minimised"` attribute (activates `tokens-minimised.css` — shrinks `--ai-font-fluid-*` tokens)

The header in Minimised mode mirrors the `@media (max-width: 767px)` layout in `Header.css`, but applied via a CSS class selector rather than a media query — allowing the compact layout in a deliberate side-panel context independent of screen width.

## Dependencies

| Component | Path | Role |
|---|---|---|
| Button | `src/components/Button/` | Window controls (`btn--tertiary btn--icon`), header actions (primary + alert-outline) |
| InfoLabel | `src/components/InfoLabel/` | Header info label |
| Tooltip | `src/components/Tooltip/` | Header (pulled in by Header.css dependency chain) |
| Header | `src/patterns/Header/` | Top bar title + actions |
| Portraits | `src/components/Portraits/` | Avatar photos inside VersionHistoryRow |
| Avatar | `src/components/Avatar/` | Row avatars in VersionHistory |
| Pill | `src/components/Pill/` | Live badge in VersionHistory |
| VersionHistoryRow | `src/patterns/VersionHistoryRow/` | Individual history rows |
| VersionHistory | `src/patterns/VersionHistory/` | Right-sidebar panel |
| PromptTemplateItem | `src/components/PromptTemplateItem/` | Individual template rows |
| PromptTemplates | `src/patterns/PromptTemplates/` | Right-sidebar panel |

## Contextual Override (Case B)

The Header in the Minimised variant uses a stacked `title-group` layout (matching the mobile
Header variant). This override is applied via `.system-role--minimised .header__title-group`
scoped CSS in `SystemRole.css` — not added to the Header component itself. This is a Case B
contextual override: it is specific to the SystemRole Minimised context and is not a formal
Header variant in Figma.

## Notes

- The `data-layout="minimised"` attribute activates `css/tokens-minimised.css` which shrinks all `--ai-font-fluid-*` tokens to their compact values — no per-property overrides needed for fluid typography.
- Box-shadow token gap noted for future Figma work: `--ai-shadow-modal` or similar.
- Drag and resize use `--no-transition` class to suppress CSS transitions during pointer events. Transitions resume on `mouseup`.
- The right edge of the panel stays fixed during left-edge resize (the panel grows leftward).
- On minimise, JS sets `modal.style.height = 75vh` and `textarea.style.height = panelHeight/3` to give a concrete starting layout. Both heights are independently resizable afterward.
- On maximise, `modal.style.cssText = ''` clears all inline styles; `textarea.style.height = ''` is also cleared so it fills the flex prompt area naturally.
- The bottom resize handle grows the panel downward; sidebar fills remaining body height via `flex: 1` and scrolls internally.
- **Mobile variant (176:3242):** CSS-only — no additional JS. The `panel-right-dashed` minimize button visible in Default mode is also the correct button for mobile (Figma updated to match). Resize handles, drag, and overlay are suppressed via `@media (max-width: 767px)`. The modal fills the full viewport and scrolls vertically. Layout mirrors Minimised visually but is activated by screen width rather than a JS class toggle.
