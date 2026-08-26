# SeatingPlanner — token gaps

Raw values used because no `--ai-*` token exists, recorded per `/build-prototype`
tier 2. This file is the design owner's review list and the input to any later
`/build-component` build, where each gap must resolve to a token or an explicit
approval. Recording a gap is **not** minting a token.

| Property | Value | Element | What it is for |
|---|---|---|---|
| `font-family` | `monospace` | `.cmp code` in `SeatingPlannerCompare.css` | Inline code samples on the toolbar review board. The DS has `--ai-font-title` and `--ai-font-body`, both Inter — there is no mono family, and code set in Inter is materially harder to read. A generic CSS family rather than a named face, so it is the mildest form of this gap. |
| `--ai-icon-success` | *(absent)* | `.sp-capacity__note--warn`, tray empty state | Noted earlier in TASK-351550: success exists as surface/text/border but not icon. Icon-status tokens are worth adding as a set. |
| `--ai-icon-warning` | *(absent)* | 5 Lucide icon strokes at `#F97316` in the mobile toolbar capture | **Confirmed in Figma 2026-08-05.** The icon family is `primary · secondary · contrast · invert · invert-secondary · brand` — no status colours at all, so those 5 icon strokes have nowhere semantic to go and stay bound to `Colours/Orange/500`, a primitive that will not follow dark mode. Same gap as `--ai-icon-success` above: **the whole `--ai-icon-{success,warning,error,info}` set is missing** and is worth adding together rather than one at a time. |

**Also recorded, not a raw value but a naming gap:** the DS has no `--ai-text-tertiary`.
`--ai-text-contrast` (`#67676c`) is the dimmer-text semantic and is what dimmed metadata
should use — worth knowing before someone adds a duplicate.
