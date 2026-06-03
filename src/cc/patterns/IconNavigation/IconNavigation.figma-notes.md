# IconNavigation — Figma Notes

## Figma Node
- **File key:** `ETKqleZdpertwFEo40YB5n` (Affino CC Hybrid – Design System)
- **Frame:** `4218:4681` "IconNavigation"
- **Component (Tier=Pattern):** `4218:4680`
- **Inner row:** `4218:4466` (768-wide distributed row)

## Variant × State Matrix
Single variant — `Tier=Pattern`. No Selected / Hover / Active variants exist in the
component set. Per user direction: items render as `<a>` links with a CSS-only hover
(glyph + label darken to `--ai-text-primary`). No current-page/active state is implemented
because Figma defines none.

| Item | Icon node | Glyph (intrinsic px) | Label |
|---|---|---|---|
| Publish   | 4218:4268 | 45.663 × 41   → 46 × 41 | Publish |
| Promote   | 4218:4278 | 49 × 41.094   → 49 × 41 | Promote |
| Social    | 4218:4328 | 36.5 × 39     → 37 × 39 | Social |
| Media     | 4218:4288 | 52 × 38       → 52 × 38 | Media |
| Structure | 4218:4295 | 49.25 × 36.76 → 49 × 37 | Structure |
| Design    | 4218:4299 | 52 × 47.719   → 52 × 48 | Design |
| Commerce  | 4218:4318 | 47.5 × 43.438 → 48 × 43 | Commerce |
| Analyse   | 4218:4313 | 52 × 41       → 52 × 41 | Analyse |
| Settings  | 4218:4285 | 44 × 44       → 44 × 44 | Settings |

Glyph dimensions are brand-asset intrinsic sizes (allowed raw-px exception — asset
metadata, not spacing tokens). Rounded to whole px; exact Figma values noted above.

## CSS Class Mapping
| Figma | CSS |
|---|---|
| IconNavigation (4218:4680) — full-width strip | `.cc-icon-nav` |
| Inner 768 row (4218:4466) | `.cc-icon-nav__list` |
| Item column (e.g. 4218:4457) | `.cc-icon-nav__item` > `.cc-icon-nav__link` |
| Icon slot h-48 (e.g. 4218:4470) | `.cc-icon-nav__icon-box` |
| Glyph img (e.g. 4218:4268) | `.cc-icon-nav__icon--<name>` |
| Label `<p>` (e.g. 4218:4260) | `.cc-icon-nav__label` |

## Token Mapping
| Figma variable | CSS token | Role |
|---|---|---|
| `--ai-surface-minimal` (Figma bind) | `--cc-actions-menu-secondary-bg` | Strip background — **user override** (#e7edf0 light / #1e293b dark) to pair with the CC ActionsMenu, instead of the Figma-bound `--ai-surface-minimal` |
| `--ai-spacing-4` (12) | `--ai-spacing-4` | Strip vertical padding |
| `--ai-size-11` (768) | `--ai-size-11` | Row max-width |
| `--ai-spacing-7` (32) | `--ai-spacing-7` | Row horizontal padding + item gap |
| `--ai-spacing-9` (48) | `--ai-spacing-9` | Icon-box height |
| `--ai-spacing-3` (8) | `--ai-spacing-3` | Icon→label gap |
| `--ai-text-secondary` (#335562 CC) | `--ai-text-secondary` | Glyph paint + label colour (rest) |
| `--ai-text-primary` (#00222f CC) | `--ai-text-primary` | Glyph + label on hover |
| `--ai-font-title` (Inter) | `--ai-font-title` | Label family |
| `--ai-font-medium` | `--ai-font-medium` | Label weight |
| `--ai-font-fixed-xxs` (12) | `--ai-font-fixed-xxs` | Label size |

Label `letter-spacing: 0.36px` and `line-height: 1.4` — optical typographic values
(letter-spacing is an allowed raw-px exception; 1.4 is unitless).

## Icon assets
The nine glyphs are the **exact Figma SVGs** exported to `img/cc-nav/<name>.svg`. They are
stroke-based line art (`stroke-width: 1.5`). Rendered via CSS `mask` painted in
`--ai-text-secondary` — the same brand-asset convention used for `affinoMark.svg` /
`affinoLogo.svg` in `Sidebar.css` / `Menu.css`. This keeps the glyphs theme-aware
(CC light/dark) rather than baking the stroke colour into the file. The SVGs are **not**
Lucide icons (they are bespoke Affino module glyphs), so the Lucide rule does not apply.

## Token Gaps
None. Every design value maps to an existing `--ai-*` token; glyph dimensions are the
documented brand-asset exception.

## Notes
- CC brand context: requires `data-brand="cc"` on an ancestor so the `--ai-*` tokens resolve
  to their CC values (`tokens-cc.css` / `tokens-cc-dark.css`).
- No Device=Mobile variant and no "mobile" mode referenced in the design context — the row
  caps at 768 and compresses on narrower viewports; no responsive variant was invented.
- `mask` alpha source: the SVG strokes are opaque so the line art becomes the mask shape;
  `mask-size: 100% 100%` against the per-glyph box reproduces the Figma proportions.
