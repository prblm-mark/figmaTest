# AiChat — Figma Notes

**Figma component set:** [node 2140:3614](https://www.figma.com/design/Ikv8jxb5dcRH8ff4q4dR11/Affino-AI---AI-Chat?node-id=2-9299)

**Tier:** Template

**Composes:** ChatSidebar, ChatHeader, ChatMain (which in turn composes MessageBubble, MessageInput, SuggestedQuestion, WorkingIntro, SourcesCarousel, Skeleton)

---

## Variant Matrix

| Node ID | Type | Sidebar Open | Notes |
|---|---|---|---|
| `2140:3613` | Default (mobile) | True | Sidebar overlays as absolute panel with shadow |
| `2141:3757` | Default (mobile) | False | No sidebar visible |
| `2141:3616` | Desktop | True | Sidebar inline (280px), main content flex-1 |
| `2141:3837` | Desktop | True | Duplicate desktop variant |

---

## Layout

### Root `.ai-chat`
| Property | Token |
|---|---|
| Display | `flex` (row) |
| Background | `--ai-surface-primary` |
| Width/Height | `100%` / `100%` |
| Overflow | `hidden` |
| Position | `relative` |

### Sidebar `.ai-chat__sidebar`
| Property | Mobile | Desktop (≥1024px) |
|---|---|---|
| Display | `none` (hidden by default) | `flex` (always shown) |
| Position | `absolute` (when open) | `static` (inline) |
| Width | Inherited from `.chat-sidebar` (`--ai-size-5` = 280px) | Same |
| Shadow | `--ai-shadow-lg` (when open) | None |
| z-index | `20` (when open) | Auto |

### Main `.ai-chat__main`
| Property | Token |
|---|---|
| Display | `flex` column |
| Flex | `1` |
| Min-width | `0` |

---

## Sidebar Behavior

- **Mobile (<1024px):** Hidden by default. Toggle via `panel-left` button in ChatHeader. Opens as absolute overlay with shadow + transparent backdrop.
- **Desktop (≥1024px):** Always visible inline. Toggle button still present but class has no effect (CSS overrides).
- **Escape key:** Closes sidebar on mobile.
- **Overlay click:** Closes sidebar on mobile.

---

## Token Gaps

| Property | Figma value | Resolution |
|---|---|---|
| Mobile sidebar shadow | `4px 4px 6px rgba(0,0,0,0.1)` | Used `--ai-shadow-lg` as closest approximation |

---

## ChatHeader Integration

The ChatHeader in this template uses the Default type with `--align-left` not applied (centered selector). The `panel-left` button has `data-sidebar-toggle` attribute for JS binding.

## ChatMain Integration

ChatMain starts in `--initial` view state. Full multi-view support (Initial → Processing → Response) is handled by ChatMain.js.
