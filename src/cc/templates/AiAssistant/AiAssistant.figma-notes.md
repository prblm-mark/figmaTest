# AiAssistant (CC) — Figma Notes

**Figma file:** [`ETKqleZdpertwFEo40YB5n`](https://www.figma.com/design/ETKqleZdpertwFEo40YB5n/Affino-CC-Hybrid--Design-System?node-id=4152-8323) (CC Hybrid Design System)
**Tier:** Template
**Component set node:** `4152:8323` (frame `AiAssistant`)
**Files:** `AiAssistant.css`, `AiAssistant.html`, `AiAssistant.figma-notes.md`, `AiAssistant.figma.ts`

---

## Variant matrix

Single Type axis, 3 variants. All three states are present in the same demo HTML
and switched via JS class on `.chat-main` (`--initial` / `--processing` / `--response`),
mirroring the existing `AiChatMinimised` template behaviour.

| Node | Type | Notes |
|---|---|---|
| `4151:8248` | Initial | Custom welcome paragraph block — different from the standard AI Chat (no SuggestedQuestion grid). |
| `4152:8324` | Processing | Standard ChatMain Processing: WorkingIntro + SourcesCarousel + Skeleton lines. |
| `4152:8899` | Response | Standard ChatMain Response: MessageBubble + SourcesCarousel + response prose. |

---

## Relationship to AiChatMinimised

This is a **CC-themed sibling** of `src/templates/AiChatMinimised/`:

| Property | AiChatMinimised (AI Chat) | AiAssistant (CC) |
|---|---|---|
| Width | 384px (`--ai-size-7`) | 320px (`--ai-size-6`) |
| Theme | AI default | `data-brand="cc"` |
| Header title | Assistant selector dropdown ("Support Assistant ▾") | Plain text "Affino Assistant" |
| Initial screen | SuggestedQuestion grid + intro | Custom welcome paragraphs only |
| Processing / Response | Standard ChatMain | Same standard ChatMain |
| Drag | Header surface | Same (id `drag-handle`) |
| Resize | Top-edge vertical handle (`cursor: ns-resize`) | Same handle reused verbatim |
| Sidebar | Slide-in overlay on PanelLeft toggle | Same overlay + same content |
| Maximise | Links to AI Chat full page | **Visual only** for now (user-deferred) |
| Close | Hides widget | Same |

The CSS / HTML structure is a clone of AiChatMinimised with `.ai-chat-min` →
`.ai-assistant` rename, `--ai-size-7` → `--ai-size-6`, and the simplified header +
custom Initial content.

---

## CSS class mapping

| Figma | CSS |
|---|---|
| Wrapper (`AiAssistant`) | `.ai-assistant` (`<div>`) |
| Top-edge resize | `.ai-assistant__resize-handle` |
| Header (drag surface) | `.chat-header.chat-header--minimised.ai-assistant__header` |
| Title text "Affino Assistant" | `.ai-assistant__title` |
| Sidebar overlay | `.ai-assistant__overlay` |
| Slide-in sidebar | `.ai-assistant__sidebar` (composes existing `.chat-sidebar`) |
| Main content area | `.ai-assistant__main` (composes `.chat-main`) |
| Initial inner override | `.ai-assistant__initial-inner` (replaces `chat-main__initial-inner` gap/padding) |
| Custom welcome paragraphs | `.ai-assistant__welcome` |
| Hidden state (close) | `.ai-assistant--hidden` |
| Drag-active no-transition | `.ai-assistant--no-transition` |
| Resize-active state | `.ai-assistant--resizing` |
| Sidebar-open state | `.ai-assistant--sidebar-open` |

---

## Token mapping

| Property | Token | Notes |
|---|---|---|
| Width | `var(--ai-size-6)` (320px) | Figma default. User-resizable via top-edge handle. |
| Height | `var(--_panel-height, 668px)` | CSS variable set by resize JS. Min 320px. Max 100vh − 48px. |
| Border-radius | `var(--ai-radius-xl)` (24px) | |
| Background | `var(--ai-surface-primary)` | |
| Shadow | `var(--ai-shadow-lg)` | |
| Header border-bottom | `1px solid var(--ai-border-secondary)` | |
| Title font | `var(--ai-font-body)` semibold, `var(--ai-font-fixed-xs)` (14px), `var(--ai-leading-md)` | |
| Title colour | `var(--ai-text-primary)` | |
| Welcome paragraphs | `var(--ai-font-body)` regular, `var(--ai-font-fixed-xs)` (14px), line-height 1.5 | |
| Welcome colour | `var(--ai-text-secondary)` | |

All values come from existing `--ai-*` semantic tokens. No token gaps — the CC
theme picks up `data-brand="cc"` and re-paints surfaces / brand colours via the
tokens-cc.css overrides.

---

## Interactions

**Drag** — header acts as drag handle (`id="drag-handle"`). Pointerdown → track
deltas → translate position with CSS variables. Click on a button inside the
header (sidebar-toggle / maximise / close) does NOT initiate drag because the
listener checks `closest('button')` first.

**Resize** — top-edge handle (`#resize-handle`) with `cursor: ns-resize`.
Pointerdown → tracks vertical delta → updates `--_panel-height`. Min 320px,
max `calc(100vh - var(--ai-spacing-6) * 2)`.

**Sidebar** — PanelLeft button toggles `.ai-assistant--sidebar-open`. CSS
slide-in via `transform: translateX(-100%) → 0`. Overlay click also closes.

**Close** — hides via `.ai-assistant--hidden { display: none }`.

**Maximise** — button rendered but no click handler yet. User-deferred —
will route to a full-page CC AI Chat when that template lands.

**Chat-state transitions** — Initial → Processing → Response handled by
ChatMain.js auto-init (existing). Click a Suggested Question (none in Initial
here, so direct submit) or submit the textarea → transitions via GSAP.

---

## Token gaps

None. All values map to existing `--ai-*` tokens.

---

## Notes

- `--ai-size-6` resolves to 320px — matches the Figma frame width exactly.
- The Initial screen IS the only structural divergence from the standard chat
  pattern. Once the user submits a question it transitions to Processing /
  Response which use the standard ChatMain markup. Both inherit the mobile-
  pinning rules from `AiAssistant.css` lines ~145+ (reused from AiChatMinimised).
- The internal sidebar reuses the full ChatSidebar component with its existing
  Pinned/Recent/Older sections and item menus.

---

## History

- 2026-05-27: Initial template scaffold. Cloned from
  `src/templates/AiChatMinimised/` with `.ai-chat-min` → `.ai-assistant` rename
  and `--ai-size-7` → `--ai-size-6` (384 → 320px). Header simplified (assistant
  selector removed, replaced with plain "Affino Assistant" title). Initial
  state replaced with the verbatim welcome paragraph block from Figma
  `4151:8248`. CC theme via `data-brand="cc"` on `<html>`. Drag + top-edge
  resize JS reused verbatim. Maximise button kept visual-only pending the
  full-page CC AI Chat template.
