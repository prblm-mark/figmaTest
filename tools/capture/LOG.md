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


## 2026-10-30 — Phase 6 Import & Export (attended)
- Import page 4666:231, 15 rows: User import ×8 (Upload, Upload error `?upload=type`, Map `?step=map`, Options, Review, Importing, Complete, Scheduled `?step=results`), Contact list import ×4 (Upload, Map, Review, Complete), Batch delete ×3 (Default, Selected `clickall:[data-batch]|2`, Confirm modal `+click:[data-batch-delete]`, tall=0).
- Export page 4666:232, 10 rows: User export ×5 (Default, Custom columns `?cols=custom`, Nothing matches `?count=0`, No history `?recent=0`, Export started `click:[data-xp-go];wait:1500`), Article export, Export System ×4 (Default, Targets selected `click:[data-export-all]`, Success `+click:[data-export-go];wait:1600`, Failure `?fail=TextItem` + same steps).
- Importing (mid-run) freeze: the import finishes in ~1 s, so `?step=results&run=now` with `do=eval:Array.from({length:5000},(_,i)=>clearInterval(i))` and `settle=400`. The eval runs INSIDE the frame, which is what makes it work (clearing intervals in the harness window does nothing). Lands at "Importing 2 of 3…". Complete = same URL with settle=3000.
- Export System · Failure · Desktop: capture.js loaded in the frame but never submitted (status stuck). The late Mobile one landed on its own. Fix that worked: trigger it by hand inside the frame — `document.querySelector('iframe').contentWindow.figma.captureForDesign({captureId, endpoint, selector:'body'})` — with a fresh capture id (landed 4718:2). One spare id (a4320c2b…) was generated and never used.
- Post-process: the FRAMES list can be auto-detected per page (`pg.children.filter(n => FRAME && !/· (Light|Dark)$/ && / · (Desktop|Mobile)$/)`), so the same payload is re-run in batches of 8–11 until it returns []. Strip the leading `//` comment lines first — the comment also contains `__FRAMES__`, so a plain replace hits the comment.
- `missing` = {} on every frame (no rich-text editor on these screens).
- Width check FAILED on 7 mobile frames: User export ×5 mobile are 434 wide, Article export mobile 402 — the page content is wider than 390, i.e. a horizontal-overflow bug in those templates at phone width (not a capture artefact; other 390 frames on the same run are exact). Left as captured.
- Dark check: User import Map desktop, Batch delete Confirm modal mobile, Export System Failure desktop, User export mobile — no light-on-light.

## 2026-10-30 — Phase 7 Update & API (attended)
- Update page 4727:231, 4 rows: Default, Confirm modal (`click:[data-update-action="system"];wait:300`, tall=0), Failure (`?fail=system` + the same click, then `click:[data-update-go];wait:2200` — the mock run takes 1.5 s), SSC (`?ssc=1`).
- API page 4727:232 (new, after Update), 5 rows: API help User / CRM, API test tool User / CRM, Response (User test tool with `wait:1500;click:[data-sign];wait:800;click:[data-send];wait:600` — the first form with a Send button is Login, which renders a signed 200 OK block).
- Dry-run trap: the first `[data-response]` on the test tool page belongs to a form WITHOUT a Send button, so checking `querySelector('[data-response]').hidden` reads "still hidden" even when the step worked. Check the Send button's own form, or count visible responses.
- Browser extension dropped once mid-run ("not connected"), which skipped one navigation (Failure · Mobile) — its capture id was still unused, so it was simply re-opened. After any extension error, list the page frames before moving on.
- Update · Confirm modal · Mobile: first capture stuck in "processing" 15+ min (a96834a9…); the retry landed (4750:2). Delete the unprocessed duplicate if the first ever lands.
- `missing` = {} on every frame. Very tall frames: API help CRM mobile 402×33596, desktop 1728×22802; post-process still handles 7 per batch.
- Width check FAILED on all 10 API mobile frames: 402 wide (same 402 as Phase 6 Article export mobile, so probably a shared element overflowing at 390).
- Dark check: Update Failure desktop, Confirm modal mobile, Test tool Response desktop — fine.

## 2026-10-30 — Phase 8 Dashboards (attended)
- Page 4756:231 (new, after API). 11 rows: Control Screen, Control Hub, Live Dashboard, Sales Leaderboard Current week / 12 months (`?timeframe=7`), CRM Analysis, Contract Analysis Contract / Top accounts / Outstanding / Review (`?Navigation=<key>`), No match (`?Navigation=TopAccounts` + `type:.cc-analysis__filters input=zzzz;wait:700`). Chart pages use `settle=2500`.
- HARNESS TRAP: `type:`/`attr:` split selector from value at the FIRST `=`, so an attribute selector like `[data-filter="account"]` breaks the step. Use a selector with no `=` in it (here `.cc-analysis__filters input` — the first filter host in the DOM is Top accounts).
- Browser extension dropped once more mid-run; Top accounts · Mobile was skipped and re-run with its unused id. Pattern now seen twice: after an extension error, poll the ids around it before moving on.
- `missing` = {} on every frame; every mobile frame is exactly 390 (no overflow on these screens).
- Dark check: Live Dashboard + Sales 12 months desktop, No match mobile — Chart.js canvases land as vectors and flip correctly.
- Observation for review: Contract Analysis · No match (mobile) still draws the empty bar chart's axis and column stubs under "No accounts match these filters".
