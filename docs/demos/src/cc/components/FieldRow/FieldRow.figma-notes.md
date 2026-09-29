# FieldRow — Figma Notes

## Figma Node
- File: `Lus07xi8pPXLN87sQIyrEt` (Affino Design System) · page **View & Edit** `3842:146669` · kit section `3861:1902`
- Node: [`3861:1987`](https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=3861-1987) · Tier: **Component** → `src/cc/components/FieldRow/`
- Used by: `src/cc/templates/RecordScreen/` (ArticleView / ArticleEdit / ArticleSteps)

## Variant Matrix

| Node | Variant | Notes |
|---|---|---|
| `3861:1935` | Layout=Wide, Type=Text |  |
| `3861:1939` | Layout=Wide, Type=Tags | Button Tertiary xs chips |
| `3861:1967` | Layout=Wide, Type=Paragraph | top-aligned |
| `3861:1971` | Layout=Wide, Type=Media | MediaMeta |
| `3861:1987` | Layout=Compact, Type=Text | sidebar |
| `3861:1987` | Layout=Compact, Type=Tags | sidebar |
| `3861:1987` | Layout=Wide, Type=Input | Input (Show Label off; help text = Input help) |
| `3861:1987` | Layout=Wide, Type=Select | Select (label hidden) |
| `3861:1987` | Layout=Wide, Type=TagBox | TagBox |
| `3861:1987` | Layout=Wide, Type=Textarea | Textarea |
| `3861:1987` | Layout=Wide, Type=Media Picker | MediaPicker |

## CSS Class Mapping

| Figma | CSS |
|---|---|
| Row | `.field-row (+ --compact, --paragraph, --media, --edit)` |
| Label | `.field-row__label (dt / label / span)` |
| Value | `.field-row__value (dd / div)` |
| Tags | `.field-row__tags` |
| Required (property) | `.field-row__required (red *)` |

## Token Mapping

| Property | Token |
|---|---|
| label column | --ai-size-3 (192) Wide · --ai-size-1 (128) Compact |
| gap | --ai-spacing-5 Wide · --ai-spacing-4 Compact |
| label | --ai-font-fixed-xs Medium --ai-leading-sm --ai-text-secondary --ai-tracking-4 |
| value | --ai-font-fixed-xs Regular --ai-leading-md --ai-text-primary |
| compact text | --ai-font-fixed-xxs --ai-leading-xs (term --ai-text-contrast) |
| edit label offset | padding-top --ai-spacing-4 (centres on the 40px control) |
| required | --ai-text-error |
| tags gap | --ai-spacing-2 |

## Token Gaps & Decisions
Designer decisions 2026-09-28: label weight Medium (draft mixed Medium/SemiBold); label column `--ai-size-3` 192 (draft raw 200); values `--ai-text-primary` (draft `Dark Blue/800` primitive); row gap `--ai-spacing-5` (lives on RecordSection). Sidebar term column `--ai-size-1` is uniform across panels (draft sized per panel). Figma variant text is NOT a shared TEXT property — linked text syncs across variants.

## Notes
- Built 2026-09-28 from the View & Edit kit (section `3861:1902`, CC Light mode). The kit was
  componentised from a code-capture draft that re-tokenise had bound to random / borrowed tokens;
  the designer ruled "your recommendations are the way to go", so bindings were normalised to the
  right semantic tokens in Figma first and this code follows the kit, not the draft.
- Markup comes from `src/cc/templates/RecordScreen/record_markup.py` — the demo and the templates are
  generated from the same function, so they cannot drift.

## Layout=Stacked (2026-09-28)
Nine Figma variants (`3904:16242`… one per Wide Type): label over value, gap `spacing/3`, label padding 0, children fill. **Not a class in code** — it is what `@container record-section (max-width: 559px)` does to a Wide row (RecordSection.css). Media keeps MediaMeta's row (layout B needs no stacked form). Code Connect maps Stacked → no modifier.

## Code-first kinds from Article 10007 (2026-09-29) — FLAG FOR FIGMA
Not in the Figma set yet; built to fill the framework with a real article (RecordScreen/record_10007.py):
`Type=Rich` (view `.field-row__rich` — h2 `fixed-sm` / h3 `fixed-xs` semibold, blockquote 2px
`--ai-border-brand` left rule + `spacing-4` inset, blocks `spacing-4` apart), `Type=Checkbox`
(`.field-row--check`, label padding 0, centred), `Type=Date / Datetime` (DatePicker field), `Type=Lookup`
(`.field-row__lookup`: input + Secondary Select, gap `spacing-3`), `Type=Image` (`.field-row__image`:
MediaPicker then `.field-row__image-options` grid of Alt text / Caption / Alignment radios / Width select,
gap `spacing-4`), `Type=File` (MediaPicker with a file icon + Choose file). Every value is an existing
token; the arrangements are proposals for the designer.

## Image options layout (designer, 2026-09-29)

`.field-row__image-options` is **2 columns** on desktop (Alt text | Caption, then Alignment | Width). It drops to 1 column at `@container record-section (max-width: 559px)`. **Alignment is a SegmentedControl** (`.seg-control.field-row__align`, `data-seg-control`) with icon + text: `align-left` / `align-center` / `align-right` plus Left / Center / Right. It replaced three radios (designer, 2026-09-29) and is the editor-standard alignment control. At 40px (`--ai-spacing-8`) it sits level with Width without any centring rule. It is still a radiogroup for assistive tech (roving tabindex, arrow keys). **Code-first: Figma still draws radios, so flag it for Figma.**
