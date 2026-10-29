# StylePreview — Figma Notes

**Tier:** pattern (Control Centre record kit) · **Status:** built code-first 2026-10-29, **no Figma frame yet**
· Hub TASK-575540 (the held Design Style / Design Frame rows).

## Figma Node

None yet. When drawn, it is a RecordSection (`3871:3259`) whose header gains an action (a SegmentedControl
sm, `3729:25008` family). RecordSection has no header-action slot today; that is the one structural
addition to formalise.

## What it is

Design Style and Design Frame are styling records. v1 opens them with a live sample drawn in the record's
OWN CSS: Design Style View's resizable `DesignTable` (`AfcDesignCentre/CC/DC_DesignStyle.cfm`), and
Design Frame's Preview tab on View and Edit (`DC_DesignFrameDef.cfm`, `DC_DesignFrame.js`). In v1 the
client CSS is injected into the Control page itself.

v3: a **"Preview" RecordSection, first in the main column, on View AND Edit of both records** (Mark,
2026-10-29: placement, both screens, width presets, slicer later). The sample renders in a **sandboxed
iframe** (`sandbox="allow-same-origin"`, so no scripts run in it). The client's CSS can't restyle the
Control Centre, and the CC's tokens and theme can't leak into the preview. The preview stays the
site's own look in CC dark mode, by design: it shows the site.

## Variant × State Matrix

| Kind (`data-style-preview`) | Screen | Width | Notes |
|---|---|---|---|
| `style` | View, Edit | Desktop / Tablet / Mobile | v1's sample verbatim: H1 title; thumbnail + H2 / H3 / H4 + teaser; paragraph with a link and highlight; error panel. v1's icon row is omitted until the style's icons are served |
| `frame` | View, Edit | Desktop / Tablet / Mobile | Frame header + body sample. The border-image slicer (Border Type = Image) is a separate pass |

Width presets: **Desktop** fills the column; **Tablet** and **Mobile** are the site's Breakpoint
Profile widths (`data-widths`, demo 768px / 375px), centred and capped at the column. On a narrow
column (`cs-page` ≤ 767px) the switch keeps its icons and hides its labels; the labels stay as the
accessible names.

## CSS Class Mapping

| Part | Class | From |
|---|---|---|
| Section | `.record-section.record-section--preview` | RecordSection |
| Width switch | `.seg-control.seg-control--sm.style-preview__widths` (`data-seg-control`, values desktop / tablet / mobile) | SegmentedControl |
| Stage | `.style-preview` (`data-style-preview`, `data-widths`, `data-thumb`) | new |
| Record CSS | `<template data-style-preview-css>` | new |
| Frame | `.style-preview__frame` (iframe, `title="Preview of <name>"`) | new |
| Live field (Edit) | `.field-row[data-preview-prop="--x"][data-preview-unit]` | FieldRow + attr |

## Token Mapping

| Property | Token | Why |
|---|---|---|
| Frame border | `1px solid --ao-border-secondary` | the kit's card edge (Accordion Separated Cards, datatables) |
| Frame radius | `--ao-radius-md` | same |
| Switch spacing | `margin-inline-start: auto` in the RecordSection header (its own gap) | no new value |

Inside the iframe: **the client's CSS only**. Its hex and px values are record data, not DS styling.

## Token Gaps

None. The preset widths are site data (Breakpoint Profile), not design tokens. The frame height is
measured (the sample's height plus the frame's border), not a design value.

## Behaviour (StylePreview.js)

- Builds `srcdoc` from the kind's sample and the template CSS; fits the height on load, when images
  load, on width change and on any column resize (ResizeObserver: the CC column changes width with no
  window resize).
- Width switch: listens for SegmentedControl's `seg-control:change`.
- Edit: `input` / Select picks on `[data-preview-prop]` rows set that custom property on the
  preview's root (an empty value removes it, falling back to the record's value).
- Links inside the preview don't navigate.

## Backend (HANDOVER → RecordScreen)

- `style-preview-css`: the record's generated CSS per record, plus the Breakpoint Profile widths.
- `style-preview-live`: drive the live preview from unsaved field values.
- `design-frame-slicer` (needs design): Border Type = Image's slice editor.

## Verified (headless Chrome, 2026-10-29)

31 checks pass on DesignStyleView / Edit and DesignFrameView / Edit:
- the preview is the first section, and the iframe is sandboxed;
- v1's sample text renders, with the client CSS applied inside and isolated outside;
- the height fits exactly, grows at Tablet and shrinks back at Desktop;
- Tablet is 768 and centred, Mobile is 375, both capped at 480;
- live colour, select and number+px fields update the preview, and clearing one falls back;
- no page errors, no overflow, no second scroller.

Screenshots were checked in light and dark, at 1280 and 480. The demo page (`StylePreview.html`) was
checked at 1280 and 480.
