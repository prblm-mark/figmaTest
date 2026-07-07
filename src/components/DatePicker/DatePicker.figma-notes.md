# Date Picker — Figma Notes

## Figma Node
- File: `Lus07xi8pPXLN87sQIyrEt` (Affino AI Design System)
- Component set: `3039:8761` — "Date Picker" — [open in Figma](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=3039-8761)
- Tier: `Component` → built into `src/components/DatePicker/`

A calendar with day / month / year drill-down views, single-date and range
selection (single or dual month), disabled-past dates, and a "Today" shortcut.
Optionally attached to an Input-styled trigger field (popover), or rendered inline.

## Variant matrix (7 Property 1 values → modes/views of one calendar)

| Node ID | Property 1 | Represented as | Built |
|---|---|---|---|
| 3039:8754 | Single Date | `data-mode="single"` + Input trigger + popover; footer "Selected: …" | ✅ |
| 3039:8755 | No selection (today highlighted) | inline, no selection → today = `--today`; footer hidden | ✅ |
| 3039:8757 | With disabled past dates | `data-disable-past` → `--disabled` (opacity .5) on past days | ✅ |
| 3039:8759 | Date Range Single Month | `data-mode="range"` → `--range-start/-end/-in-range` | ✅ |
| 3039:8760 | Date Range Dual Month | `data-mode="range" data-months="2"` — two month panels, prev on left / next on right | ✅ |
| 3039:8758 | Month Selector | drill-down `view=months`; selected month = brand fill, current month = `--current` | ✅ |
| 3039:8756 | Year Selector | drill-down `view=years`; current year = `--current` (grey bg + brand bold) | ✅ |

**These are not independent components** — Month/Year selectors are sub-views reached
by clicking the header title (day-view title → months; months-view title → years).
Range single/dual are the same calendar with `mode=range` and 1 or 2 panels.

## Interaction model (confirmed with user, 2026-07-07)

- **Scope:** fully functional vanilla-JS date picker (`DatePicker.js`), auto-inits `[data-datepicker]`.
- **One picker, drill-down:** single vs range is a config (`data-mode`); month/year selectors are
  reached by clicking the header title and return to the day grid on selection.
- **Single select:** click a day → sets selection, writes the field (`11 Mar 2026`), closes the popover.
- **Range select:** first click sets start, second sets end (auto-normalised if reversed); a third
  click starts a new range. Field shows `9 Mar — 21 Mar 2026`.
- **Nav:** prev/next shifts month (day view), year (month view), or 12-year page (year view).
- **Today:** jumps the view to the current month; in single mode also selects today.
- **Popover:** opens on field focus/click or calendar-icon click; closes on outside-click or Esc.
- Week starts **Monday** (Mo Tu We Th Fr Sa Su).

## CSS Class Mapping

| Figma element | CSS class |
|---|---|
| Calendar surface | `.datepicker__calendar` (`--popover` anchored + hidden until `.datepicker--open`; `--dual` two panels) |
| Row of month panels | `.datepicker__months` |
| One month panel | `.datepicker__month` |
| Header (title + nav) | `.datepicker__header` |
| Month/Year title (drill-down trigger) | `.datepicker__title` |
| Prev/next nav buttons | `.datepicker__nav` / `.datepicker__nav-btn` |
| Weekday row | `.datepicker__weekdays` / `.datepicker__weekday` |
| Day grid | `.datepicker__grid` (7-col); `--months` / `--years` (3-col) |
| Day/month/year cell | `.datepicker__cell` + state modifiers below |
| Footer | `.datepicker__footer` (hidden when no selection) |
| Selected summary | `.datepicker__selected` |
| Today link | `.datepicker__today-btn` |
| Trigger field | Composes the **Input** component (`.input` / `.input__wrap` / `.input__control`) + `.datepicker__field-icon` |

### Cell state modifiers
| Modifier | Treatment | Token |
|---|---|---|
| (base) current-month day | text-primary regular | `--ai-text-primary` |
| `--muted` | adjacent-month day | `--ai-text-contrast` |
| `--today` | grey bg + brand bold | `--ai-surface-minimal` + `--ai-text-brand` + `--ai-font-bold` |
| `--selected` | brand fill + white semibold | `--ai-surface-brand` + `--ai-text-invert` + `--ai-font-semibold` |
| `--range-start` / `--range-end` | brand fill, rounded on one side only | `--ai-surface-brand` + `--ai-text-invert` |
| `--in-range` | soft band + brand medium, square | `--ai-surface-brand-soft-extra` + `--ai-text-brand` + `--ai-font-medium` |
| `--disabled` | 50% opacity, not-allowed | `opacity: 0.5` + `--ai-text-contrast` |
| `--current` (month/year grid) | same as `--today` | `--ai-surface-minimal` + `--ai-text-brand` bold |
| hover (enabled, unselected) | subtle grey | `--ai-surface-minimal` |

## Token Mapping

| Property | Token |
|---|---|
| Calendar bg / border / radius | `--ai-surface-primary` / `--ai-border-secondary` (1px) / `--ai-radius-md` |
| Calendar shadow | `--ai-shadow-lg` (Figma `0 0 10px .05, 0 2px 1px .1` — mapped to the standard card/popover token) |
| Calendar padding | `--ai-spacing-5` (16px) |
| Month panel gap (dual) | `--ai-spacing-6` (24px) |
| Cell size | `--ai-spacing-7` (32px), grid gap `--ai-spacing-1` (4px) |
| Cell radius | `--ai-radius-md` |
| Day / title font | `--ai-font-title` `--ai-font-fixed-xs` (14px) `--ai-leading-xs` |
| Weekday / footer / month-year-cell font | `--ai-font-fixed-xxs` (12px) |
| Nav / field icon | `--ai-icon-size-sm` (16px), `--ai-icon-contrast` |
| Footer border / padding | `--ai-border-secondary` top, `--ai-spacing-4` (12px) |

## Token Gaps / Decisions
- **None.** Every colour, spacing, radius, and type value maps to an existing `--ai-*` token.
- Calendar shadow: Figma specifies `0 0 10px rgba(0,0,0,.05), 0 2px 1px rgba(0,0,0,.1)`; used the
  standard `--ai-shadow-lg` popover token (`0 0 20px …, 0 2px 2px …`) — optical, within tolerance.

## Notes
- **Icons (Lucide):** header nav = `chevron-left` / `chevron-right`; trigger field = `calendar`.
- **Trigger reuses the Input component** (`../Input/Input.css`) rather than a bespoke field — the
  Figma layer was named "Text Input" (not the Input component instance) but is token-identical.
- **Footer visibility:** Figma's "No selection" variant has no footer, so the footer is hidden
  until a date/range is selected.
- **Today-in-range:** a day that is both today and inside a range keeps its **bold** weight
  (Figma shows day 11 bold on the soft band while neighbours are medium).
- `new Date()` is used for "today" — runs in the browser, so real current date drives the highlight.
- Dual-month range hides the redundant nav arrow on each panel (prev only on left, next only on right).
