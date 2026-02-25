# Avatar — Figma Notes

## Figma Node
- File: `8OAAokH2JXhIvGZFrlzeKT`
- Component set: node `68:5042` — "Avatars"

## Variant Matrix

| Node | Size | px | Show Notification | Checked | Status |
|---|---|---|---|---|---|
| 68:5041 | 1 | 24×24 | True | False | Built |
| 68:5047 | 2 | 32×32 | True | False | Built |
| 68:5054 | 3 | 48×48 | True | False | Built |
| 68:5061 | 4 | 64×64 | True | False | Built |
| 68:5068 | 5 | 80×80 | True | False | Built |
| 68:5043 | 1 | 24×24 | False | False | Built |
| 68:5050 | 2 | 32×32 | False | False | Built |
| 68:5057 | 3 | 48×48 | False | False | Built |
| 68:5064 | 4 | 64×64 | False | False | Built |
| 68:5071 | 5 | 80×80 | False | False | Built |
| 68:5130 | 1 | 24×24 | False | True | Built |
| 68:5132 | 2 | 32×32 | False | True | Built |
| 68:5134 | 3 | 48×48 | False | True | Built |
| 68:5136 | 4 | 64×64 | False | True | Built |
| 68:5138 | 5 | 80×80 | False | True | Built |

## CSS Class Mapping

| Figma variant | CSS class |
|---|---|
| Size=1 (default) | `.avatar` |
| Size=2 | `.avatar.avatar--size-2` |
| Size=3 | `.avatar.avatar--size-3` |
| Size=4 | `.avatar.avatar--size-4` |
| Size=5 | `.avatar.avatar--size-5` |
| Checked=True | `.avatar.avatar--checked` (add icon: `<i data-lucide="check">`) |
| Show Notification=True | `.avatar` + `<span class="avatar__dot" aria-hidden="true">` |

## Token Mapping

| Property | Figma variable | CSS variable |
|---|---|---|
| Size=1 width/height | `size-[24px]` = `--ai-spacing-6` | `--ai-spacing-6` |
| Size=2 width/height | `size-[32px]` = `--ai-spacing-7` | `--ai-spacing-7` |
| Size=3 width/height | `size-[48px]` = `--ai-spacing-9` | `--ai-spacing-9` |
| Size=4 width/height | `size-[64px]` = `--ai-spacing-11` | `--ai-spacing-11` |
| Size=5 width/height | `size-[80px]` = `--ai-spacing-13` | `--ai-spacing-13` |
| Border radius | `--ai-radius-full` | `--ai-radius-full` |
| Fallback background | `--ai-surface-secondary` | `--ai-surface-secondary` |
| Checked bg | `Aqua/500` → `--ai-surface-success` | `--ai-surface-success` |
| Checked border | `1px solid --ai-surface-primary` | `--ai-surface-primary` |
| Checked icon (Size=1, Size=2) | `size-[16px]` = `--ai-icon-size-sm` | `--ai-icon-size-sm` |
| Checked icon (Size=3, Size=4, Size=5) | `size-[24px]` = `--ai-icon-size-lg` | `--ai-icon-size-lg` |
| Checked icon color | `--ai-btn-primary-text` | `--ai-btn-primary-text` |
| Notification dot bg | `Aqua/500` → `--ai-surface-success` | `--ai-surface-success` |
| Notification dot border | `--ai-surface-primary` | `--ai-surface-primary` |
| Notification dot radius | `--ai-radius-full` | `--ai-radius-full` |
| Notification dot (Size=1, Size=2): 8px | `size-[8px]` = `--ai-spacing-3` | `--ai-spacing-3` |
| Notification dot (Size=3, Size=4): 16px | `size-[16px]` = `--ai-spacing-5` | `--ai-spacing-5` |
| Notification dot (Size=5): 24px | `size-[24px]` = `--ai-spacing-6` | `--ai-spacing-6` |

## Token Gaps
None — all design values map to `--ai-*` semantic tokens.

## Dependencies
- **Portraits** (`src/components/Portraits/`) — portrait photo component used inside the avatar circle.
  Link `Portraits.css` before `Avatar.css` on any page that shows photo avatars.

## Notes
- **Fallback background:** `.avatar` uses `--ai-surface-secondary` as a background — confirmed in Figma.
  Visible only when no portrait image is provided. Adapts correctly in dark mode (`#1F2A37`).
- **Photo clipping:** Uses `clip-path: circle(50%)` on `.portrait` (not `overflow: hidden` on `.avatar`).
  This keeps the circular crop on the photo while allowing the notification dot to sit outside the
  circular clip at `top: 0; right: 0` of the square bounding box.
- **`border-radius: full` on `.avatar` stays:** It clips the background-color of the container element
  (visible in the Checked variant's green circle). Only `overflow: hidden` was removed.
- **Clip relationship:** Avatar clips the photo via `clip-path: circle(50%)` on `.portrait`. Portrait
  fills via `object-fit: cover` and `width/height: 100%`.
- **Notification dot position:** Figma places the dot at `top: 0; right: 0` of the avatar's square
  bounding box — intentionally outside the circular photo area, in the corner of the square container.
- **Checked icon colour:** Uses `--ai-btn-primary-text` (always `#ffffff`) rather than `--ai-icon-invert`
  because `--ai-surface-success` is theme-invariant (same green in both themes) and `--ai-icon-invert`
  would flip to near-black in dark mode.
- **Used in:** VersionHistoryRow (Size=1, Checked=False and Checked=True), VersionHistory (Size=2).
