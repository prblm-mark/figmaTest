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
