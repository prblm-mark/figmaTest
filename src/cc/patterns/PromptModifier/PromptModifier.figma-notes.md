# PromptModifier (CC) — figma notes

**Tier:** Pattern · **Status:** CODE-FIRST (designer, 2026-09-29). **No Figma node.** Flagged for Figma;
check with Mark before any push. Composes Button and Textarea.

This is the AI prompt on the record sections that the live Control Centre generates: **Social**
(ShareLineGenerationPrompt), **Article Questions** (QuestionGenerationPrompt) and **Summary**
(SummaryGenerationPrompt). The prompt text is live's own (affino.com 626312, read 2026-09-29).
Live shows the full prompt textarea, a Generate button and Copy / Expand icons above the fields.

## Layout

A tinted panel (`--ai-surface-brand-soft-extra`, `--ai-border-secondary`, `--ai-radius-md`,
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
  full-width row.

Live's per-field "Expand" arrows are not carried over: our textareas resize natively.

## Handover

- `record-prompt-generate`: canned outputs; needs the AI endpoint.
- `record-prompt-save`: the edited prompt is not saved.

## Files

PromptModifier.css and PromptModifier.js. `PromptModifier.html` is **generated** by
`src/cc/templates/RecordScreen/_generate.py`.
