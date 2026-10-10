# AvatarGroup — Figma Notes

## Figma Node
File `Lus07xi8pPXLN87sQIyrEt` · `4057:2759` "Avatar Group" (a single component symbol, no variant set).
Members: `4082:2831`, `4082:2835`, `4082:2839`, `4082:2843` (Avatars Default Size=2), `4082:2847` "More" (Avatars Initials Size=2, "+2").
Figma description: "Overlapping avatars: Avatars Default Size=2 with a 2px surface/primary ring (separates overlaps on any surface), Initials "+N" counter, -8 overlap. Amended 2026-10-06."

## Variant × Size × State Matrix
| Variant | Size | States |
|---|---|---|
| Default (4 photos + counter) | Size=2 (32px) | none — not interactive |

## CSS Class Mapping
| Figma | CSS |
|---|---|
| Avatar Group | `.avatar-group` |
| Avatars (Default, Size=2) | `.avatar.avatar--size-2` |
| More (Initials, Size=2) | `.avatar.avatar--size-2.avatar--initials.avatar-group__more` |

## Token Mapping
| Figma | CSS | Role |
|---|---|---|
| border-2 `surface/primary` | `2px solid var(--ao-surface-primary)` | ring on every member |
| x step 24 on a 32 avatar | `calc(var(--ao-spacing-3) * -1)` | -8 overlap |
| size 32 | `--ao-spacing-7` (via `.avatar--size-2`) | member size |
| `surface/info-soft`, `text/info`, `font/fixed/xs` semibold | via `.avatar--initials` | "+N" counter |

## Token Gaps
None.

## Notes
- Ring and overlap live on the group (`.avatar-group > .avatar`), not on Avatar, so a lone Avatar is unchanged.
- **Glyph members (code-first, 2026-10-07):** Customer Signals on the record sidebar use the group with Avatar Type=Placeholder members carrying a Lucide glyph, as a stand-in for each signal's own badge image. Live data puts the badge `<img>` in the circle. Glyphs are `--ao-icon-size-sm` (16px) inside a group, not Placeholder Size=2's md (designer, 2026-10-07). Not drawn in Figma.
- Figma draws four members + counter. Customer Signals show **five** (designer, 2026-10-07), then "+N".
- **Expandable counter (code-first 2026-10-07; IN FIGMA 2026-10-10):** when the counter is a `<button data-avatar-group-more>`, pressing it shows the members marked `data-avatar-group-extra hidden`; the button stays last and swaps "+N" for a `chevron-left` "show less" face (`aria-expanded`), and pressing again hides them (`AvatarGroup.js`, designer 2026-10-07). Hover fills the counter `--ao-surface-info` with `--ao-text-invert` text — no Figma hover state exists, so confirm or replace. The toggle's "+N" is `--ao-font-fixed-3xs` (designer, 2026-10-07); a static `<span>` counter keeps Initials Size=2's `--ao-font-fixed-xs`. A `<span>` counter stays static. The counter's `title`/`aria-label` lists the hidden names.
- **Figma set (2026-10-10): `4207:7328`** — State=Static `4057:2759` (the original component, unchanged), State=Collapsed `4207:7285` (counter "+N" fontSize bound to `--ao-font-fixed-3xs`), State=Expanded `4207:7301` (two extra members, the counter detached into a "Less" circle holding Lucide ChevronLeft at `--ao-icon-size-sm`, stroke `--ao-text-info`). Hover (surface-info / text-invert) is still code-only — no Figma hover variant. Code Connect repointed to the set with `variant: { State }`.
- `.avatar-group--wrap` lets a long group wrap instead of overflowing its column.

**Ring = the surface underneath (2026-10-07, designer):** the 2px ring was fixed `--ao-surface-primary`, which is
not every card's colour (the record sidebar panels are #f9fbfb in light). AvatarGroup.js now walks up to the first
opaque ancestor and sets `--ring-surface` on each `.avatar-group` (and any `[data-ring-surface]` element, e.g. the
record timeline's icon ring); the CSS reads `var(--ring-surface, var(--ao-surface-primary))`. Re-painted when
`data-theme` / `class` changes on `<html>` or `<body>`. Verified light + dark: ring = surface on the contact sidebar,
the timeline, Article View's viewer cards and this demo's tinted section.
