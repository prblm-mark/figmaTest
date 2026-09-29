# RichTextEditor (CC) — figma notes

**Tier:** Component · **Status:** CODE-FIRST (designer, 2026-09-29). **No Figma node.** The only match
is `TextEditor` in the old "Control Centre Presentation" library (2023). Flagged for Figma; check with
Mark before any push.

The record screens' rich-text fields (Introduction, Main Body, Text 2–5) run **TinyMCE 8.8.2**, the
same editor and version the live Control Centre uses (affino.com, read 2026-09-29: six editors per
article). The config mirrors live:

| Setting | Value (as live) |
|---|---|
| toolbar | restoredraft · undo redo · styles · bold italic underline · align ×4 · link **+ Insert image** · bullist numlist outdent indent · pastetext removeformat · ltr rtl · table · fullscreen |
| plugins | autosave lists advlist link table fullscreen wordcount directionality nonbreaking |
| style formats | Headings 1–6 · Inline (bold … code) · Blocks (Paragraph, Quote = `div.aos-ShortQuote`) |
| height / statusbar / menubar | 300 · on (path + word count) · off |

**Added beyond live:** `Insert image` opens the Selector Type=Media (`window.selector.openMedia`) and
inserts the picked image at the cursor. Live's image plugin uses TinyMCE's URL dialog.

## Theming

- **Chrome** (RichTextEditor.css), scoped under `.rich-text` to out-rank the oxide skin: the frame
  is the Textarea's `--ai-border-secondary` / `--ai-radius-md`, with a brand border on focus. The
  toolbar is `--ai-surface-primary`, toolbar controls (buttons, the Styles dropdown) have the input radius `--ai-radius-md`, a hovered button `--ai-surface-minimal`, an active one
  `--ai-surface-brand-soft` / `--ai-text-brand`. The statusbar uses `--ai-text-secondary` at
  `--ai-font-fixed-xxs`. Menus and dialogs keep oxide.
- **Content** (RichTextEditor.content.css, inside the iframe): the token files are loaded into the
  iframe and the page's `data-brand` / `data-theme` are mirrored onto its `<html>`, so body, headings,
  links, lists, quote and table resolve the page's tokens. It follows a theme switch live.
- **Dark:** the `oxide-dark` skin is picked at init, so the chrome follows a theme switch on the next load.

## Fallback

The textarea is the form value (synced on every change). If the CDN is unavailable, it stays a plain
textarea.

## Handover

`record-rich-text`: swap the jsDelivr build and `license_key: 'gpl'` for the product's own TinyMCE
build, licence and config (content_css = the site's LiveEditForm.css + CustomFonts.css).
