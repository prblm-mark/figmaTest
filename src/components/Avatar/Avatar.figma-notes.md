# Avatar — Figma Notes

## Figma Node
- File: `8OAAokH2JXhIvGZFrlzeKT`
- Component set: node `68:5042` — "Avatars"

## Variant Matrix

| Node | Size | px | Show Notification | Checked | Status |
|---|---|---|---|---|---|
| 68:5043 | 1 | 24×24 | False | False | Built |
| 68:5050 | 2 | 32×32 | False | False | Built |
| 68:5057 | 3 | 48×48 | False | False | Built |
| 68:5064 | 4 | 64×64 | False | False | Built |
| 68:5071 | 5 | 80×80 | False | False | Built |
| 68:5130 | 1 | 24×24 | False | True | Built |
| 68:5132 | 2 | 32×32 | False | True | Built |
| 68:5134 | 3 | 48×48 | False | True | Built |
| 68:5041 | 1 | 24×24 | True | False | Not built — unused in current components |
| 68:5047 | 2 | 32×32 | True | False | Not built — unused in current components |

## CSS Class Mapping

| Figma variant | CSS class |
|---|---|
| Size=1 (default) | `.avatar` |
| Size=2 | `.avatar.avatar--size-2` |
| Size=3 | `.avatar.avatar--size-3` |
| Size=4 | `.avatar.avatar--size-4` |
| Size=5 | `.avatar.avatar--size-5` |
| Checked=True | `.avatar.avatar--checked` (add icon: `<i data-lucide="check">`) |

## Token Mapping

| Property | Figma variable | CSS variable |
|---|---|---|
| Size=1 width/height | `size-[24px]` = `--ai-spacing-6` | `--ai-spacing-6` |
| Size=2 width/height | `size-[32px]` = `--ai-spacing-7` | `--ai-spacing-7` |
| Size=3 width/height | `size-[48px]` = `--ai-spacing-9` | `--ai-spacing-9` |
| Size=4 width/height | `size-[64px]` = `--ai-spacing-11` | `--ai-spacing-11` |
| Size=5 width/height | `size-[80px]` = `--ai-spacing-13` | `--ai-spacing-13` |
| Border radius | `--ai-radius-full` | `--ai-radius-full` |
| Placeholder bg | `--ai-surface-contrast` | `--ai-surface-contrast` |
| Checked bg | `Aqua/500` → `--ai-surface-success` | `--ai-surface-success` |
| Checked border | `1px solid --ai-surface-primary` | `--ai-surface-primary` |
| Checked icon size | `size-[16px]` = `--ai-spacing-5` | `--ai-spacing-5` |
| Checked icon color | `--ai-btn-primary-text` | `--ai-btn-primary-text` |

## Token Gaps
None — all design values map to `--ai-*` semantic tokens.

## Notes
- **Photo clipping:** Figma uses a clipping mask to show the profile photo as a circle. In CSS this is achieved with `border-radius: --ai-radius-full` + `overflow: hidden`. Place an `<img src="..." alt="...">` inside `.avatar` for a real photo.
- **Placeholder bg:** The demo uses `--ai-surface-contrast` (light gray) as a placeholder. In production, supply a real image or initials-based fallback.
- **Checked icon colour:** Uses `--ai-btn-primary-text` (always `#ffffff`) rather than `--ai-icon-invert` because `--ai-surface-success` is theme-invariant (same green in both themes) and `--ai-icon-invert` would flip to near-black in dark mode.
- **Show Notification variants** (nodes 68:5041, 68:5047, 68:5054, 68:5061, 68:5068): not yet built — no current component uses them.
- **Used in:** VersionHistoryRow (Size=1, Checked=False and Checked=True)
