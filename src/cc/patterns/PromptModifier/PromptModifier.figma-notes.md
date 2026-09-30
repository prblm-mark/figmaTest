# PromptModifier (CC) — figma notes

**Tier:** Pattern · **Status:** CODE-FIRST (designer, 2026-09-29). **Drawn in Figma 2026-09-30** (`3938:22948`). Flagged for Figma;
check with Mark before any push. Composes Button and Textarea.

This is the AI prompt on the record sections that the live Control Centre generates: **Social**
(ShareLineGenerationPrompt), **Article Questions** (QuestionGenerationPrompt) and **Summary**
(SummaryGenerationPrompt). The prompt text is live's own (affino.com 626312, read 2026-09-29).
Live shows the full prompt textarea, a Generate button and Copy / Expand icons above the fields.

## Layout

A tinted panel (`--ai-surface-extra-minimal`, designer amend 2026-09-29, was brand-soft-extra; `--ai-border-secondary`, `--ai-radius-md`,
`--ai-spacing-4` padding) at the top of the section body. It reads as tooling that writes the fields
below it, not as an article field.

- **At rest, one row:** a sparkles icon (`--ai-icon-brand`), then the title plus what it fills
  ("Fills Shareline 1–3"), a one-line ellipsised **preview** of the prompt, **Edit prompt**
  (tertiary sm, chevron) and **Generate** (secondary sm, sparkles). The page's Save stays the only
  primary.
- **Edit prompt** opens the prompt textarea (on `--ai-surface-primary`), a hint and **Copy prompt**.
  The preview hides while it is open and follows edits.
- **Generate:** a busy state (label "Generating…", the sparkles icon spins, and it respects reduced
  motion). It then fills the fields that follow the panel, in order, flashes them with a
  `--ai-surface-brand-soft` ring, and shows "Generated n fields just now." with **Undo**, because
  Generate overwrites.
- **Narrow** (`@container prompt-modifier (max-width: 479px)`): the actions drop to their own
  row, left-aligned with the title and preview, indented past the icon (designer, 2026-09-29).

Live's per-field "Expand" arrows are not carried over: our textareas resize natively.

## Handover

- `record-prompt-generate`: canned outputs; needs the AI endpoint.
- `record-prompt-save`: the edited prompt is not saved.

## Files

PromptModifier.css and PromptModifier.js. `PromptModifier.html` is **generated** by
`src/cc/templates/RecordScreen/_generate.py`.

## Figma build 2026-09-30
**PromptModifier `3938:22948`** — State Collapsed `3938:22781` | Expanded `3938:22815` (prompt Textarea + Copy prompt; chevron up)
| Generating `3938:22868` | Generated `3938:22902` (status + Undo). Sparkles icon `--ai-icon-brand`; Edit prompt is tertiary sm
with a `--ai-border-secondary` border, as in code.

## Figma 2026-09-30 (later) — Width axis + placed
Set `3938:22948` is now State × **Width (Wide | Narrow)**. Narrow = the ≤479 container query: icon + text on one line, the
actions on the next, indented 28 (the code's `calc(icon-size-md + spacing-3)`; raw in Figma — no single token). Placed in the
**Social** section of all four Article Edit frames (Standard / Full / Narrow = Wide, Mobile = Narrow) via RecordSection's new
**Show Prompt** property. The **Article Questions** (Question prompt; Question 1–5 as Inputs) and **Summary** (Summary prompt; Summary as a Textarea) sections were added after Social in all four Edit frames (2026-09-30), with the code's questions / summary / prompts. The two desktop Edit frames now hug their content (they were fixed at 2807 and clipped the lower sections).
