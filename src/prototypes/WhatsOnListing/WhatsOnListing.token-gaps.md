# WhatsOnListing — token gaps

Design owner's review list. Per `/build-prototype`, a value with no token is written raw and logged
here rather than approximated to a near-miss token.

Two stylesheets: `WhatsOnListing.css` (the four Control screens, `control-*.html`) and
`WhatsOnDisplay.css` (the nine display screens, `display-*.html`).

## Display side (`WhatsOnDisplay.css`) — 4 genuine gaps

Audited 2026-09-23 the same way (comments stripped, every declaration matched for hex / rgba /
raw lengths / ratios). No raw colour of any kind.

| Property | Value | Selector | What it is for |
|---|---|---|---|
| `inline-size` | `300px` | `.wod-ad` | IAB advert unit width (MPU / skyscraper). A fixed industry size, not a layout step; `--ao-size-6` is 320 and would misstate the slot. |
| `block-size` | `600px` | `.wod-ad--skyscraper` | IAB half-page / skyscraper height. Same reasoning. |
| `aspect-ratio` | `4 / 3` | `.wod-product__media`, `.wod-pd__media` | Product image frame ratio. The system has no aspect-ratio tokens at all. |
| `text-underline-offset` | `2px` | `.wod-link` | Gap between inline link text and its underline. No token; comparable to the 2px outline offset the focus rule uses. |

Not gaps: 1px/2px borders (pre-approved), `outline-offset: 2px` (the house focus pattern),
`letter-spacing: 0.04em` (letter-spacing may be raw per the rules), `margin-block-end: -1px`
(tab underline overlapping the 1px strip border), the 1px visually-hidden box, and `max-width`
breakpoints in `@container` (px literals by rule).

**Note for design:** `--ao-leading-*` are absolute rem values, so a heading on `--ao-leading-sm`
(1.25rem) under a 1.625rem title overlaps as soon as it wraps. `.wod-title` uses `--ao-leading-lg`.
Worth a look at whether headings want a unitless line-height token.

## Control side (`WhatsOnListing.css`) — genuine gaps: none

Audited by stripping comments from `WhatsOnListing.css` and matching every declaration against
`#hex`, `rgba()` and raw length units (2026-09-23). No raw colour of any kind is used.

## Raw values that are not gaps

| Property | Value | Selector | Why it is not a gap |
|---|---|---|---|
| `border-bottom` | `1px solid var(--ao-border-secondary)` | stacked listing row (narrow) | Border width — pre-approved |
| `inline-size` / `block-size` | `1px` | `.wol-sr` | Visually-hidden text box, not a design value |
| `clip-path` | `inset(50%)` | `.wol-sr` | Same |
| `flex-basis` | `100%` | `.wol-td--full` (narrow) | Structural — "take the whole line" |
| `max-width` | `599px` | `@container cs-page` | Breakpoints must be px literals (CLAUDE.md §2) |

## Borrowed, not owned

The two edit screens use `../ControlRecordScreen/ControlRecordScreen.css` unchanged, so its three
recorded gaps (`78ch` reading measure, `72px` sparkline, `480px` scroll cap) are **not** inherited
here: none of those selectors appear on these screens.
