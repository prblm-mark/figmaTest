# AudioPlayer — Figma Notes

## Figma Node
- File key: `Lus07xi8pPXLN87sQIyrEt` (Affino AI — Design System)
- Parent frame: `3069:5884` "Article Audio Player"
- Variants (Tier=Component):
  | Node ID | Type | Device | Notes |
  |---|---|---|---|
  | 3069:7316 | Default | Desktop | eyebrow label; unplayed |
  | 3076:4114 | Playing | Desktop | eyebrow label; leading bars brand |
  | 3069:7157 | Sticky  | Desktop | article title + `shadow-md`; leading bars brand |
  | 3069:7482 | Default | Mobile  | eyebrow label; unplayed |
  | 3076:4190 | Playing | Mobile  | eyebrow label; leading bars brand |
  | 3069:7076 | Playing | Mobile  | **title version** (labelled "Playing" in Figma but structurally the Sticky/docked mobile layout); leading bars brand |

## Redesign summary (supersedes the old 3-Type version)
The previous component had three distinct layouts (`--compact` / `--card` / `--mini`).
Figma replaced all of them with **one waveform card**. Removed entirely: the thin
`Slider - Seek` scrubber, the headphones eyebrow icon, the uppercase brand label,
the large heading, and the "Narrated · 6 min" subtitle. The waveform is now the
sole seek control across every variant.

## Type → code mapping
| Figma Type | Code | Meaning |
|---|---|---|
| Default | `.audio-player` (base) | Inline player, eyebrow label "Listen to this article · 6 min" |
| Playing | `.audio-player.is-playing` (runtime) | Not a structural variant — played bars turn `--ai-surface-brand` |
| Sticky | `.audio-player--sticky` (+ `--dock` via JS) | Docked appearance: article title + `shadow-md`; reflowed mobile layout |

Per the designer: **Sticky is the same player**, placed inline below the article
title/standfirst, that slides up and fixes to the viewport bottom once scrolled
out of view (JS `--dock`, IntersectionObserver on the inline instance).

## Layout matrix (CSS grid — one DOM, reflowed via grid-template-areas)
| Mode | Desktop areas | Mobile areas |
|---|---|---|
| Default | `label label label label` / `play wave time download` | `label label download` / `play wave time` |
| Sticky | same as Default desktop (wider gaps + shadow) | `play label download` / `wave wave time` |

Gaps: Default desktop col 12 / row 8; Sticky desktop col 16 / row 12. Mobile:
Default col 12 / row 6; Sticky col 12 / row 8. Padding: desktop 12/16, mobile 12.

## CSS Class Mapping
| Figma layer | CSS class |
|---|---|
| Article Audio Player (root) | `.audio-player` (+ `--sticky`, + `--dock`) |
| Text / Heading 2 (label) | `.audio-player__label` → `.audio-player__eyebrow` (Default) / `.audio-player__title` (Sticky) |
| Button - Play / pause | `.audio-player__play` (icons `.audio-player__icon--play/--pause`) |
| Slider - Seek (bars) | `.audio-player__waveform` + `.audio-player__bar` (`.is-played`) |
| current time / "/" / duration | `.audio-player__time` / `.audio-player__time-sep` / `.audio-player__duration`, wrapped in `.audio-player__time-group` |
| Button - Download audio | `.audio-player__download` |

## Token Mapping
| Figma | CSS token | Role |
|---|---|---|
| surface/primary | `--ai-surface-primary` | card bg |
| border/secondary | `--ai-border-secondary` | card border |
| surface/brand | `--ai-surface-brand` | play fill, played bars |
| surface/contrast | `--ai-surface-contrast` | unplayed bars |
| text/primary | `--ai-text-primary` | title |
| text/secondary | `--ai-text-secondary` | eyebrow, current time, duration |
| text/contrast | `--ai-text-contrast` | "/" separator |
| icon/invert | `--ai-icon-invert` | play/pause glyph |
| icon/secondary | `--ai-icon-secondary` | download glyph |
| radius/lg, radius/full | `--ai-radius-lg`, `--ai-radius-full` | card corners, controls |
| shadow-md (effect) | `--ai-shadow-md` | Sticky drop shadow |
| spacing 8/9/6/7 | `--ai-spacing-8/9/6/7` | play & download 40 / waveform h 48 / mobile download 24 / 32 |
| spacing 0-5/1/2/3/4/5 | `--ai-spacing-*` | bar min-w 2 / gaps / padding |
| size/11 | `--ai-size-11` | 768px max-width (frame width) |
| font fixed sm/xs/xxs | `--ai-font-fixed-*` | title 16 / eyebrow 14 / time 12 |
| font semibold/medium | `--ai-font-*` | weights |
| leading sm/xs/md | `--ai-leading-*` | 20 / 16 / 24 |
| icon 20/16 | `--ai-icon-size-md/sm` | play / download+bars |

## Token Gaps & Decisions
- **Play-button fill `--ai-surface-info` vs `--ai-surface-brand`** — Figma binds
  `surface-info` on the Desktop variants and `surface-brand` on Mobile (both
  `#2563eb`, a slip). Played bars use `surface-brand` everywhere. **User approved
  normalising the play button to `--ai-surface-brand`.**
- **Sticky drop shadow** — Figma effect "light/shadow-md" (two layers:
  `#0000001A 0 3 10` + `#00000029 0 1 4`). Mapped to the existing `--ai-shadow-md`
  token (single-layer `0 2px 10px rgba(0,0,0,0.1)`), which Figma named to match.
  The old `--ai-shadow-card` token is no longer used by this component.
- **Mobile Sticky shadow** — the Figma mobile title frame (3069:7076) omits the
  shadow, but `--sticky` applies `shadow-md` on all breakpoints so the docked bar
  reads as a floating element over article content. Minor, intentional.
- **Mobile Sticky download size** — Figma sets the mobile Sticky download to 32px
  (`--ai-spacing-7`); **user chose to normalise it to 24px** (`--ai-spacing-6`),
  matching the mobile Default download, so all mobile downloads are one size.
- **Player-row gap 12 vs 16** — Default desktop (absolute-authored) spaces controls
  ~12px; Sticky desktop (flex-authored) uses `gap-5` (16px). Kept per-mode
  (Default col-gap 12, Sticky 16); the Figma Sticky time↔download inner gap (8px)
  was unified to the row column-gap.

## Interaction / JS (`AudioPlayer.js`)
- Play/pause toggles `.is-playing` → swaps play/pause icon; `aria-pressed` synced.
- Waveform: click-to-seek (`[data-ap-waveform]`), `role="slider"`, `aria-valuenow`
  updated on render.
- Duration button toggles total ↔ `-remaining`.
- Download: no-op — **backend TODO**.
- Bar heights generated deterministically from track width (no `Math.random`);
  bar count derives from width and rebuilds (debounced) on resize.
- **Grouping**: players sharing `[data-ap-group]` are driven by one controller so
  the inline and docked instances stay in sync. `[data-ap-role="inline"]` is
  observed; once it scrolls above the viewport the `[data-ap-role="dock"]` element
  gets `.is-docked-visible` (slides up, `aria-hidden` cleared).

## Notes
- Lucide icons: `play`, `pause`, `download` (exact matches). Headphones icon removed.
- `--ai-surface-brand-dark` play hover and `--ai-surface-secondary` download hover
  are conventional affordances (Figma defines no hover/pressed states).
- `z-index: 50` on `--dock` and `1px` card border are structural (not tokenised).
