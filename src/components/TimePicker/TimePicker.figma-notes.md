# TimePicker — Figma Notes

**Figma URL:** [node 2522:1532](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2522-1532)

## Component Set

TimePicker is a Tier=Component design-system component for time entry. The set bundles six related compositions sharing the same field styling — single input, segmented input + dropdown, range, range with reveal, and a grid of pre-set slots.

## Variant Matrix

| Node | Type | Notes |
|---|---|---|
| `2522:1529` | Single input | Label + clock icon + time text. Width `--ai-size-1` (128px) |
| `2522:1530` | Duration | Time field + duration dropdown segmented. Width `--ai-size-3` (192px) |
| `2522:1531` | Timezone | Time field + timezone dropdown with globe icon. Width `--ai-size-5` (280px) |
| `2522:1527` | Range | Two single inputs side-by-side (Start / End) |
| `2522:1528` | Range Reveal | Single input with "+ Add end time" button that reveals the second |
| `2522:1526` | Slots | 4×3 grid of selectable time pills with selected and disabled states |

## CSS Class Mapping

| Figma property | CSS class |
|---|---|
| Type=Single input | `.tp.tp--single` |
| Type=Duration | `.tp.tp--segmented.tp--duration` |
| Type=Timezone | `.tp.tp--segmented.tp--timezone` |
| Type=Range | `.tp-range` (wraps two `.tp` fields) |
| Type=Range Reveal | `.tp-reveal` (with `.tp-reveal--open` after JS toggle) |
| Type=Slots | `.tp-slots` (radio group of `.tp-slot`) |
| Slot selected | `.tp-slot__input:checked` styles label |
| Slot disabled | `.tp-slot__input:disabled` styles label |

## Token Mapping

| Property | Token | Value |
|---|---|---|
| Field bg | `--ai-surface-primary` | #ffffff |
| Field border | `--ai-border-secondary` | #e2e2e3 |
| Field radius | `--ai-radius-md` | 8px |
| Field height | `--ai-spacing-8` | 40px |
| Field padding | `--ai-spacing-5` (16px horizontal) | |
| Label gap | `--ai-spacing-3` | 8px |
| Label font | `--ai-font-title` semibold + `--ai-font-fixed-xs` | Inter 600 / 14px |
| Time text font | `--ai-font-title` regular + `--ai-font-fixed-xs` | Inter 400 / 14px |
| Time text color | `--ai-text-primary` | #212123 |
| Icon size | `--ai-icon-size-sm` | 16px |
| Icon color | `--ai-icon-contrast` | #929295 |
| Single input width | `--ai-size-1` | 128px |
| Duration width | `--ai-size-3` | 192px |
| Timezone width | `--ai-size-5` | 280px |
| Dropdown bg | `--ai-surface-minimal` | #f6f6f7 |
| Dropdown hover bg | `--ai-surface-secondary` | #e2e2e3 |
| Dropdown text | `--ai-font-medium` + `--ai-font-fixed-xs` | Inter 500 / 14px |
| Dropdown padding | `--ai-spacing-4` (12px horizontal) | |
| Dropdown gap | `--ai-spacing-2` | 6px |
| Range gap | `--ai-spacing-5` | 16px |
| Reveal "+" button color | `--ai-surface-brand` | #0071d8 |
| Slot label font | `--ai-font-medium` + `--ai-font-fixed-xs` | Inter 500 / 14px |
| Slot label padding | `--ai-spacing-4` (12px horizontal) | |
| Slot grid gap | `--ai-spacing-3` | 8px |
| Slot selected bg | `--ai-surface-brand` | #0071d8 |
| Slot selected text | `--ai-btn-primary-text` | #ffffff |
| Slot disabled bg | `--ai-surface-minimal` | #f6f6f7 |
| Slot disabled text | `--ai-text-contrast` | #67676c |
| Focus ring | `--ai-surface-brand-soft` | brand contrast |

## Token Gaps

None. The `1px` and `2px` raw values used internally are border widths / inner padding offsets — optical units per CLAUDE rules, not token gaps.

## Icons

| Element | Lucide name |
|---|---|
| Time field leading icon | `clock` |
| Dropdown chevron | `chevron-down` |
| Timezone leading icon | `globe` |
| Reveal add button | `plus` |

## Dependencies

None — TimePicker is self-contained. The time text is rendered as `<input type="text">` rather than `<input type="time">` because native time inputs do not display their value as plain text in some Figma capture flows; using `type="text"` keeps the time string visible while still allowing free-text entry.

## Notes

- Figma's variable defs API reports `--ai-text-error` as `#0071d8` (the brand blue), but the generated CSS has `#ef4444`. The token isn't used by TimePicker so it doesn't affect this build, but worth flagging for the next Figma token sync.
- All time inputs use `<input type="text">` for Figma-capture fidelity. Production wiring may swap to native `<input type="time">` if interaction precision matters more than visual fidelity.
- The grid in Type=Slots is positioned absolutely in Figma but expressed with CSS Grid (`repeat(4, 1fr)`) in code — same visual outcome, more flexible for variable column counts.
