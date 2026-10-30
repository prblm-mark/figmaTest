# Capture log

## 2026-10-27 — Phase 1 Listing (attended)
- Page 4466:46. 15 rows: Orders ×7 (Default, Rows selected, Filter open, Edit Columns open, No results, Full width [desktop only], Condensed), Articles, Article Archive, Media Items ×2, Topic Manager ×2, Long Queries ×2.
- All post-processed; `missing` = {} everywhere; no failed captures.
- Fixed by hand: Edit Columns menu landed under the table (capture drops z-index) — moved to frame root in Light + Dark.
- Known gaps: Orders · No results · Mobile has no visible search field (query text not shown); Orders · Edit Columns open · Mobile has no open menu in the frame.
- Very tall frames: Media Items · Grid · Mobile 390×9300, Topic Manager Hierarchy ~3.5–4.2k, Long Queries ~3–4k.
- Runbook updated: `&title=` per capture; overlay z-order check; mobile-hidden controls.

## 2026-10-30 — Phase 2 Article record (attended)
- Page 4532:231 (after Listing). 12 rows: View, Edit, Edit with errors, Confirm, Confirm (flagged), Edit + Sector modal, Delete modal, Steps, Steps + Add step modal, Step Import, Step Content, Step Form. All at 1728 + 390.
- Modal triggers: Sector = `ArticleEdit.html?state=sector`; Delete = `click:[data-record-modal-open="modal-delete"]` on ArticleEdit (the modal has no `data-record-modal` attribute, so check `#modal-delete` directly); Add step = `click:[data-record-modal-open="modal-add-step"]` on ArticleSteps. All `tall=0`.
- `missing` = {} everywhere EXCEPT `Colours/Light/Text 5` ×1 on every frame with the rich-text editor (Edit, Edit with errors, both modals over Edit, Step Content): the editor toolbar's Format Paragraph / Table icon vectors. They stay bound to the remote variable, so they do not flip in the Dark copies. Needs a THEMES-style mapping in postprocess.figma.js once the right local token is chosen.
- Edit with errors · Mobile: the first capture sat in "processing" for 20+ min and never landed; the retry landed (4563:2). If the stuck first capture (c1034f04…) ever lands it will be an unprocessed duplicate frame on the page: delete it.
- Dark check: Article View desktop + Delete modal mobile — no light-on-light.
- Driving tip: one `javascript_tool` call per capture (`await 14 s; location.href = <next URL>`) instead of navigate + wait. Don't return `location.search` from it; the extension blocks query-string output.

## 2026-10-30 — Phase 3 Contact (attended)
- Page 4567:231 (after Article). 15 rows: View, 9 tabs (Analysis, Commerce, Communication, Demographic, Digital Assets, Events, Page Analysis, Permissions, Tasks), Sparse view, Summary panel B, Summary panel C, Edit, Edit with help on. All at 1728 + 390.
- Help switch: a harness `click:[data-record-help]` does NOT stick (FieldRow.js reads `localStorage['cc-help-text']`). Seed it instead: `&ls=cc-help-text:on`, and `:off` on plain Edit so a leftover value can't leak in. Reset it to `off` after the run.
- `missing` = {} on every frame (Contact Edit has no rich-text editor, so no Text 5 icons).
- Dark check: View desktop (panel B) + Analysis tab mobile — no light-on-light.
- Edit with help on · Desktop: first capture stuck in "processing" again (bf2e85d8…); the retry landed (4602:2). Two stuck captures in two phases, both the tallest Edit frames: if one ever lands late, delete the unprocessed duplicate.

## 2026-10-30 — Phase 4 Account (attended)
- Page 4608:231 (after Contact). 11 rows: View, 7 tabs (Commerce, Communication, Contacts, Events, Page Analysis, Tasks, User Analysis), Summary panel B, Summary panel C, Edit. All at 1728 + 390; no retries needed.
- `missing` = {} on every frame. Dark check: View desktop + Edit mobile — fine.
- Gotcha: `generate_figma_design` WITHOUT `nodeId` targets a new page; always pass the phase page id (one stray ID was generated and discarded unused, no page created).

## 2026-10-30 — Phase 5 Media & Order (attended)
- Media page 4634:231: Image view, Image edit, Video view, Video edit, Page analysis, Viewer modal (`click:[data-media-view]`, tall=0).
- Order page 4634:232: View, View with pins, Edit (New), Edit (Paid), Status modal (`click:[data-record-modal-open="modal-order-status"]`, tall=0).
- TRAP: OrderEdit.html opens at Order Status = Paid Full, so "Edit" and "Edit (Paid)" were identical (same heights). Plain Edit was re-captured at status New (payment + refund grids hidden) and the duplicate frames deleted. Status is set via `click:[data-order-status] [data-sel-trigger];wait:200;eval:[...document.querySelectorAll('[data-order-status] .sel__menu-item')].find(e=>e.textContent.trim()==='<Status>').click()`.
- `missing`: `Colours/Light/Text 5` ×1 on all four Media edit frames (rich-text toolbar icons, same gap as Phase 2). Everything else {}.

