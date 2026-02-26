# SystemRole — Figma Notes

## Figma Node

- **File key:** `8OAAokH2JXhIvGZFrlzeKT`
- **Page node:** `1:769` (Components page)
- **Default variant:** `163:3894`
- **Minimised variant:** `169:2466`

## Variant Matrix

| Variant | Node | Size | Padding | Controls | Notes |
|---|---|---|---|---|---|
| Default | 163:3894 | 1512×973px | 40px all (`--ai-spacing-8`) | `sidebar` + `x` (40×40px) | Full-screen modal with blurred backdrop |
| Minimised | 169:2466 | 400px w × 1360px h | pt-16 px-24 pb-24 | `maximize-2` + `x` (32×32px) | Floating compact panel, draggable, left-edge resizable |

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
| Resize handle | `.system-role__resize-handle` | `display: none` (Default) → `display: block` (Minimised) |

### Header button states

| State | Visible buttons | CSS rule |
|---|---|---|
| Clean (default) | `.system-role__btn-default` (disabled Make Live) | Base CSS |
| Dirty (textarea edited) | `.system-role__btn-discard` + `.system-role__btn-save` | `.system-role--dirty` modifier |

## Token Mapping

| Property | CSS Variable | Value |
|---|---|---|
| Modal background | `--ai-surface-primary` | `#FFFFFF` |
| Modal border-radius | `--ai-radius-xl` | `1.5rem` |
| Default padding | `--ai-spacing-8` | `2.5rem` (40px) |
| Minimised padding-top | `--ai-spacing-5` | `1rem` (16px) |
| Minimised padding-left/right/bottom | `--ai-spacing-6` | `1.5rem` (24px) |
| Top bar / body gap | `--ai-spacing-7` | `2rem` (32px) — matches body column gap so header/controls align over prompt/sidebar |
| Body gap (prompt ↔ sidebar) | `--ai-spacing-7` | `2rem` (32px) |
| Sidebar panels gap | `--ai-spacing-6` | `1.5rem` (24px) |
| Prompt border color | `--ai-surface-contrast` | `#D1D5DB` |
| Prompt border-radius | `--ai-radius-lg` | `1rem` |
| Prompt padding | `--ai-spacing-6` | `1.5rem` (24px) |
| Textarea text | `--ai-text-primary` | `#1F2A37` |
| Textarea font-size | `--ai-font-fixed-xs` | `0.875rem` (14px, fixed — never responsive) |
| Textarea line-height | `--ai-leading-2` | `1.5rem` |
| Minimised icon btn size | `--ai-spacing-7` | `2rem` (32px) |
| Minimised header btn height | `--ai-spacing-7` | `2rem` (32px) |
| Minimised header btn padding | `--ai-spacing-4` | `0.75rem` (12px) |
| Minimised header btn font | `--ai-font-fluid-xxs` | `0.75rem` |

## Token Gaps

| Property | Figma value | Decision |
|---|---|---|
| Modal box-shadow | `0 0 20px rgba(0,0,0,0.05), 0 2px 2px rgba(0,0,0,0.1)` | Approved raw value — no `--ai-shadow-*` token exists yet. Plan to add shadow tokens in a future Figma session. |
| Backdrop colour | Semi-transparent dark overlay | Approved as `rgba(17, 25, 40, 0.5)` — uses `--ai-surface-invert` hue at 50% opacity |
| Backdrop blur | Not specified in tokens | Approved as `blur(4px)` |
| Textarea text colour | Figma: `text-black` (`#000000`) | Approved substitution: `--ai-text-primary` (`#1F2A37`) for dark mode correctness |

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
| Resize | Mousedown on `.system-role__resize-handle` (Minimised only) | Updates `width` + `left` inline styles; right edge stays fixed; min-width 400px |

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
