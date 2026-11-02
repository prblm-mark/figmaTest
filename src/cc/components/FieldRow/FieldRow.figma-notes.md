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
| label column | --ao-size-3 (192) Wide · --ao-size-1 (128) Compact |
| gap | --ao-spacing-5 Wide · --ao-spacing-4 Compact |
| label | --ao-font-fixed-xs SemiBold (designer amend 2026-09-29, was Medium — flag for Figma) --ao-leading-sm --ao-text-primary (amend 2026-09-29, was text-secondary) --ao-tracking-4 |
| value | --ao-font-fixed-xs Regular --ao-leading-md --ao-text-primary |
| compact text | --ao-font-fixed-xxs --ao-leading-xs (term --ao-text-contrast) |
| edit label offset | padding-top --ao-spacing-4 (centres on the 40px control) |
| required | --ao-text-error |
| tags gap | --ao-spacing-2 |

## Token Gaps & Decisions
Designer decisions 2026-09-28: label weight Medium (draft mixed Medium/SemiBold); label column `--ao-size-3` 192 (draft raw 200); values `--ao-text-primary` (draft `Dark Blue/800` primitive); row gap `--ao-spacing-5` (lives on RecordSection). Sidebar term column `--ao-size-1` is uniform across panels (draft sized per panel). Figma variant text is NOT a shared TEXT property — linked text syncs across variants.

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
`--ao-border-brand` left rule + `spacing-4` inset, blocks `spacing-4` apart), `Type=Checkbox`
(`.field-row--check`, label padding 0, centred), `Type=Date / Datetime` (DatePicker field), `Type=Lookup`
(`.field-row__lookup`: input + Secondary Select, gap `spacing-3`), `Type=Image` (`.field-row__image`:
MediaPicker then `.field-row__image-options` grid of Alt text / Caption / Alignment radios / Width select,
gap `spacing-4`), `Type=File` (MediaPicker with a file icon + Choose file). Every value is an existing
token; the arrangements are proposals for the designer.

## Image options layout (designer, 2026-09-29)

`.field-row__image-options` is **1 column by default** and **2 columns** (Alt text | Caption, then Alignment | Width) at `@container field-image (min-width: 560px)`. `.field-row__image` is its own container, because the record's value column, not the section, decides the fit: at a 1459 viewport the section is about 1000 but the value column is about 400. Keying on the section gave 175px cells and overlapping Alignment segments (designer screenshot, 2026-09-29). Alignment (`field-align` container, content-box thresholds) tightens its segments below 270 and goes icon-only below 222, keeping each label visually hidden so every radio still has a name. **Alignment is a SegmentedControl** (`.seg-control.field-row__align`, `data-seg-control`) with icon + text: `align-left` / `align-center` / `align-right` plus Left / Center / Right. It replaced three radios (designer, 2026-09-29) and is the editor-standard alignment control. At 40px (`--ao-spacing-8`) it sits level with Width without any centring rule. It is still a radiogroup for assistive tech (roving tabindex, arrow keys). **Code-first: Figma still draws radios, so flag it for Figma.**

The **thumbnail** kind (`alt_only`, i.e. a field with no alignment or width: Thumbnail and Alternative Thumbnail) shows **Alt text only**, in `.field-row__image-options--single`, which is always one column. Content images (Main Image, Intro, Image Top, Image 1/2) keep all four options (designer, 2026-09-29).

## Figma build 2026-09-30 — code-first edit kinds drawn
Set `3861:1987` gains, for Layout=Wide and Stacked: Type=**Lookup** (`3931:19293` / `3931:19637`), **Checkbox** (`3931:19333` /
`3931:19674`), **Date**, **Datetime**, **Image** (MediaPicker + Alt text / Caption / Alignment SegmentedControl / Width select; 2
columns Wide, 1 Stacked), **Multimedia**, **Colour** (ColorPickerInput). Rich text is still a Textarea in Figma (RichTextEditor not
built yet). Labels: SemiBold + text-primary on every non-Compact row; they wrap (hug + max-width, the * stays beside the text).
The Required * visibility had to be relinked on the cloned rows (clone drops property refs).

## Collapsible long values — code-first (2026-10-09), NOT in Figma

Asked by Luismi: article 245's Summary filled a screen and a half on the View. Mark's decisions:

| Rule | Value |
|---|---|
| Which rows | every Wide view row of Type=Paragraph (Summary, Teaser, Page Description, custom text) and Type=Rich (Main Body, Introduction…). Not Compact (sidebar), not Edit, not Media. |
| When | Paragraph after **6 lines**, Rich after **12** (× `--ao-leading-md`). Only when the text really runs past the limit; short values are unchanged and get no button. |
| Collapsed look | capped height, the last line faded (two lines for Rich, whose cut can land in a paragraph gap). The fade is an alpha `mask-image` (`currentColor` → `transparent`), so it needs no gradient colour token and works on any surface. |
| Toggle | Button Secondary xs (as "Image details"), `--ao-spacing-3` above it: `chevron-down` "Show more" ⇄ "Show less" (the chevron rotates), `aria-expanded`. |
| Memory | none: every value starts collapsed. |

`FieldRow.js` enhances the server-rendered markup: it wraps the value in `.field-row__clamp-body`,
appends `.field-row__clamp-toggle`, sets `data-clamped` when the value is long and `data-expanded`
when open, and re-measures with a `ResizeObserver` (the column changes width with no window resize).
`window.fieldRowClamp.init(root)` for content added later. Loaded by every RecordScreen page
(`_generate.py` KIT_JS).

**Figma push pending:** a FieldRow Collapsed / Expanded state for Paragraph and Rich.

## Field note (code-first 2026-11-02, Affino 10.1 task U7) — NOT in Figma yet, flag for Figma

Some commerce settings look like they do nothing, because another screen decides them (the product's "Coupons & Discounts" tick is never checked by coupons, only by automatic discounts). U7 puts a short line under each affected field saying what the setting does today, optionally ending in a link to the screen that controls it.

- **Markup:** `p.field-row__note` holding an `info` icon (`.field-row__note-icon`) and the text, inside `.field-row__value`. Built by `field_note()` in `record_markup.py`; `view_row(..., note=)` and `edit_row(..., note=)` take a string or `(text, link_label, href)`, and the link ends the line.
- **Always visible**, on View and Edit. The "Show help" switch never hides it, because it corrects what the screen seems to say rather than explaining it.
- **Order:** directly under the value or control, help below it. In an Input it sits inside `.input` between the control and the help, spaced by the Input's own gap.
- **Accessibility:** on Edit the control's `aria-describedby` lists the note first, then the help.
- **Every row with a note** (View and Edit) gets `field-row--has-note`, which top-aligns the label. `.field-row` centres the label against the whole value, so without it the note's extra line pushed the label below the value's first line. On View this leaves the same 2px offset Paragraph and Media rows have (20px label line against a 24px value line).
- **Gap:** set on `.field-row__value > .field-row__note`, the same weight as the help line's rule. A bare `.field-row__note` loses to `.field-row__value p { margin: 0 }`, which left the note flush under a checkbox (fixed 2026-11-02).
- **Link:** a plain text link in the same tab (base `a` style), naming the target screen.

| Property | Token |
|---|---|
| gap above | --ao-spacing-3 (help-line gap) |
| type | --ao-font-body, --ao-font-fixed-xxs, Regular, --ao-leading-xs (Input help style) |
| text | --ao-text-secondary |
| icon | Lucide `info`, --ao-icon-size-sm, --ao-icon-secondary |
| icon → text gap | --ao-spacing-2 (code-first choice; confirm when drawn in Figma) |
