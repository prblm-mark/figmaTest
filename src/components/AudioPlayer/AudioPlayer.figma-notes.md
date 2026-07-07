# AudioPlayer — Figma Notes

## Figma Node
- File key: `Lus07xi8pPXLN87sQIyrEt` (Affino AI — Design System)
- Parent frame: `3055:5458` "Article Audio Player"
- Variants (Tier=Component):
  | Node ID | Type | Device |
  |---|---|---|
  | 3055:5457 | Compact Inline Bar | Desktop |
  | 3055:5455 | Compact Inline Bar | Mobile |
  | 3055:5453 | Card with waveform | Desktop |
  | 3055:5454 | Card with waveform | Mobile |
  | 3055:5456 | Sticky Mini Player | Desktop |
  | 3055:5452 | Sticky Mini Player | Mobile |

## Variant × Device Matrix
Device=Mobile is implemented as `@media (max-width: 767px)` — never a modifier class.

| Type | Modifier | Desktop | Mobile deltas |
|---|---|---|---|
| Compact Inline Bar | `--compact` | pill, `px 12 / py 8`, gap 12, play 40 / icon 20; current-time `fixed-xs` medium, duration `fixed-xs` regular | gap 8, padding 8 all; current-time `fixed-xxs`, duration `fixed-sm` |
| Card with waveform | `--card` | `radius-lg`, padding 24, `shadow-card`; heading `fixed-md`; play 56 / icon 24; waveform h48 gap16 | padding 16; heading `fixed-sm`; play 48 / icon 20; waveform gap 12 |
| Sticky Mini Player | `--mini` | `radius-lg`, `px 16 / py 12`, single row (play · text · scrubber · time · download); play 40 / icon 20 | two rows `[play · text · download]` / `[scrubber · time]`, flex-col gap 8, padding 12; download 32 |

All three share `max-width: --ai-size-11` (768px) and shrink to fill narrower screens (Figma mobile frame = `--ai-size-6` 320px).

## Interaction
No interaction-state *variants* exist in Figma (axes are Type × Device only). Behaviour (JS, `AudioPlayer.js`), confirmed against the validated prototypes:
- Play/pause: toggles `.is-playing` on the root → swaps `--play`/`--pause` icon; `aria-pressed` synced.
- Scrubber / waveform: click-to-seek (`[data-ap-scrubber]` / `[data-ap-waveform]`).
- Duration button: toggles between total time and `-remaining`.
- Download: no-op — **backend TODO** (see below).
- Waveform bars are generated deterministically from the track width (no `Math.random`, stable) — the per-bar heights in Figma are amplitude data, not tokens.

## CSS Class Mapping
| Figma layer | CSS class |
|---|---|
| Article Audio Player (root) | `.audio-player` + `--compact` / `--card` / `--mini` |
| Button - Play / pause | `.audio-player__play` (icon `.audio-player__icon--play/--pause`) |
| Slider - Seek (thin) | `.audio-player__scrubber` + `.audio-player__scrubber-fill` |
| Slider - Seek (waveform) | `.audio-player__waveform` + `.audio-player__bar` (`.is-played`) |
| current time | `.audio-player__time` |
| "/" separator | `.audio-player__time-sep` |
| Button - Toggle remaining time | `.audio-player__duration` |
| Button - Download audio | `.audio-player__download` |
| eyebrow (headphones + label) | `.audio-player__eyebrow` + `.audio-player__eyebrow-label` |
| Heading 2 (card) | `.audio-player__heading` |
| mini title / sub | `.audio-player__title` / `.audio-player__sub` |
| mini row wrappers | `.audio-player__mini-top` / `.audio-player__mini-bottom` (`display: contents` on desktop) |

## Token Mapping
| Figma | CSS token | Role |
|---|---|---|
| surface/primary | `--ai-surface-primary` | container bg |
| border/secondary | `--ai-border-secondary` | container border |
| surface/brand | `--ai-surface-brand` | play fill, scrubber fill, played bars |
| surface/contrast | `--ai-surface-contrast` | scrubber track, unplayed bars |
| text/primary | `--ai-text-primary` | heading, compact duration |
| text/secondary | `--ai-text-secondary` | current time, mini sub, grouped time |
| text/contrast | `--ai-text-contrast` | "/" separator |
| text/brand | `--ai-text-brand` | eyebrow label |
| icon/invert | `--ai-icon-invert` | play/pause glyph (on brand) |
| icon/secondary | `--ai-icon-secondary` | download glyph |
| icon/brand | `--ai-icon-brand` | eyebrow headphones |
| spacing 7/8/9/10 | `--ai-spacing-7/8/9/10` | control box sizes 32/40/48/56 |
| spacing 0-5/1/2/3/4/5/6 | `--ai-spacing-*` | gaps, padding, track height (4), bar min-w (2) |
| radius/full, radius/lg | `--ai-radius-full`, `--ai-radius-lg` | pill controls, card corners |
| size/11, size/6 | `--ai-size-11`, `--ai-size-6` | 768 / 320 frame widths (→ max-width) |
| font fixed xxs/xs/sm/md | `--ai-font-fixed-*` | type ramp |
| font medium/regular/semibold/bold | `--ai-font-*` | weights |
| leading md/sm | `--ai-leading-*` | line heights |
| icon 16/20/24 | `--ai-icon-size-sm/md/lg` | icon sizing |

## Token Gaps & Decisions
- **Control box sizes (40/48/56/32px)** — Figma left these unbound. Approved to
  use the exactly-matching spacing tokens (`--ai-spacing-8/9/10/7`).
- **Card drop-shadow** `0 0 10px rgba(0,0,0,0.05)` — no existing `--ai-shadow-*`
  matched; **new token `--ai-shadow-card`** added to `css/tokens-shadows.css`
  (light + dark).
- **Same-value token slips (normalised, approved):**
  - Sticky **desktop** play + slider-fill used `--ai-surface-info`; every other
    variant used `--ai-surface-brand` (both `#2563eb`) → normalised to `--ai-surface-brand`.
  - Card **mobile** heading used `--ai-text-neutral`; desktop used `--ai-text-primary`
    (both `#212123`) → normalised to `--ai-text-primary`.

## Notes
- Lucide icons: `play`, `pause`, `download`, `headphones` (exact matches).
- **Mini text stack** (`.audio-player__text`): user override — gap removed (Figma 2px) and
  title/sub `line-height` set to `--ai-leading-sm` (20px; Figma `--ai-leading-md` 24px) for a
  tighter two-line block.
- **Icon sizes:** download + headphones are `--ai-icon-size-sm` (16px) on all
  versions. The headphones eyebrow is 16px in Figma; the download icon is a
  **user override** (Figma binds it at 20px / `--ai-icon-size-md`). Play/pause
  glyph stays 20px (24px on the card-desktop 56px button).
- `letter-spacing: 0.48px` on the eyebrow label is an optical value (kept as px).
- Width is `100% / max-width: --ai-size-11` rather than a fixed 768px so the
  component fills its article column and shrinks on mobile — the Figma fixed
  widths are the canvas frame sizes.
- Hover: Figma defines no hover/pressed states. Added conventional, token-based
  affordances only — play → `--ai-surface-brand-dark`, download → `--ai-surface-secondary`.
- The "sticky" positioning (dock-on-scroll) is a *usage* concern, not part of the
  component — the Figma "Sticky Mini Player" variant is just the bar chrome.
