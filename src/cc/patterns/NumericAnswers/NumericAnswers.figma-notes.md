# NumericAnswers — Figma Notes

**Tier:** pattern (Control Centre record kit) · **Status:** built code-first 2026-10-29, **drawn in Figma the same day**
· Hub TASK-575540 (AI Profile View held on "Metric Layer is a custom script panel").

## Figma Node

DS file `Lus07xi8pPXLN87sQIyrEt`, Components › Control Centre — Record kit: set **`4529:45811`**,
`State` × `Mode`:

| Variant | Node | Shows |
|---|---|---|
| State=Confirmed, Mode=Edit | `4529:45152` | both warning Alerts; the column Accordion **open** with the Table |
| State=Draft, Mode=Edit | `4529:45422` | the danger Alert; a customised prompt with **Use standard wording** (`Icon/24px/RotateCcw`) |
| State=None, Mode=Edit | `4529:45579` | a neutral "No mapping yet" |
| State=Confirmed, Mode=View | `4529:45706` | "On", the prompt as text, the Accordion closed |

It's built from RecordSection Desktop's header and body, FieldRow Wide (Checkbox / Text; Static, Textarea
and Paragraph rows detached, so the Badge and bar sit in their value column), Badges (hug), Alerts
(Style=Default, Close / Button off), Button Tertiary sm, an Accordion Default item and a Table (detached
and turned into auto-layout rows; cells padded spacing-4 / spacing-5 as Table.css; the reading column
fills and wraps). CCDark twins are in "Control Centre — Record kit — CCDark". Code Connect:
`NumericAnswers.figma.ts`.

**Known difference:** Figma's Alert has one text layer, so the title is bold within it and the advisory
reads inline. The code renders the problems / advisories as a `.alert__list`.

## What it is

AI Profile's **metric layer** (v1 `AfcAI/CC/AIProfileMetricLayerInclude.cfm`, TASK-354014 and TASK-390334).
It tells the AI engine which spreadsheet column is a measure and which is a dimension, so numeric
questions are answered by calculation rather than by the model reading numbers out of prose.

Since Markus's steer (21 Aug) there's **no JSON and there are no Generate / Apply buttons**. Saving the
profile works the mapping out, and saving is the operator's confirmation. Apart from the switch and the
prompt, the panel is a read-only explanation of what the save did. v3 keeps that model exactly.

## Parts (Mark, 2026-10-29)

| Part | Kit pieces | v1 source |
|---|---|---|
| **Numeric Data Answers** switch | FieldRow Checkbox (View: On / Off) | `TypedExtractionYN`, on by default, saved with the profile |
| **Mapping** status | FieldRow (check-aligned) + Badge: Confirmed = success, Draft = warning, No mapping yet = neutral; then "on {date} by {name} · numeric answering is live" | `EXISTS` / `CONFIRMED` / `CONFIRMEDDATE` / `CONFIRMEDBYNAME` |
| Notices (only when needed) | Alert warning: "The figures have not been rebuilt yet…" (`STALE` + `LASTINDEX`) and "This mapping is older than the prompt…" (`PROMPTMOVED`). Alert danger "This mapping can't be put into service yet." lists blocking `PROBLEMS`. Alert warning "Worth checking…" lists the `Check:` advisories (prefix stripped) | v1 drew blocking red, advisory amber |
| **Generation Prompt** | FieldRow Textarea, with a Badge "Standard wording" / "Customised for this profile" and **Use standard wording** (Tertiary sm, `rotate-ccw`, shown only while customised) above it. View: the text + Badge | `PROMPT` / `PROMPTISDEFAULT`; v1's clear-to-reset |
| **How these spreadsheets are being read** | Accordion (default size), **closed on load**. The trigger shows the title + "N spreadsheet columns · N understood" + a warning Badge "N need a look". Panel: Table (Column / Spreadsheet › Sheet / How it's read), "Needs a look" rows first with a warning Badge and the concern in `--ao-text-warning` | `COLUMNS` / `STATS`, wording per v1 `aoMLDescribe` |
| Add (unsaved) | Note: "The numeric data mapping can be set up once this profile has been saved." | v1, same |
| Nothing indexed | Note in the panel: "No spreadsheet columns found…" | v1, same |

The section is titled **"Numeric Data"**, so it doesn't repeat its first field's label.

## Behaviour (NumericAnswers.js)

- The Accordion toggles, with `aria-expanded` kept in step.
- Prompt: the Badge and the reset follow whether the text equals `data-standard`. **Use standard
  wording** puts the standard text back and focuses the field. The backend should store an empty
  override when the text equals the standard (`ml-prompt`), so the profile keeps tracking future
  improvements.

## Token Mapping

All parts keep their own tokens. Pattern CSS adds only:
- gaps `--ao-spacing-2` (status, column title: = TopicTree badges) and `--ao-spacing-3` (notices,
  prompt column and bar: = EditGrid);
- the meta text `--ao-text-secondary`; the concern `--ao-text-warning`;
- the reading column wraps with `--ao-size-4` as its minimum width (Table cells are nowrap).

## Token Gaps

None.

## Backend (HANDOVER → RecordScreen)

- `ml-layer`: every value comes from `AIProfile.cfc getMetricLayerData`.
- `ml-prompt`: store an empty override when the text equals the standard wording.

## Verified (headless Chrome, 2026-10-29)

18 checks pass on AIProfileEdit / View and the demo:
- the section order; the switch; the Confirmed badge with who and when; both notices;
- the accordion is closed on load with its summary and badge, and opens on click;
- "Needs a look" rows come first;
- the prompt Standard → Customised → reset cycle, and its focus;
- View is read-only;
- no overflow at 1280 or 480 (the table scrolls inside its wrap);
- all five demo states render; no page errors.

Screenshots were checked in light and dark.
