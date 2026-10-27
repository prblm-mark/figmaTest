# Capture log

## 2026-10-27 — Phase 1 Listing (attended)
- Page 4466:46. 15 rows: Orders ×7 (Default, Rows selected, Filter open, Edit Columns open, No results, Full width [desktop only], Condensed), Articles, Article Archive, Media Items ×2, Topic Manager ×2, Long Queries ×2.
- All post-processed; `missing` = {} everywhere; no failed captures.
- Fixed by hand: Edit Columns menu landed under the table (capture drops z-index) — moved to frame root in Light + Dark.
- Known gaps: Orders · No results · Mobile has no visible search field (query text not shown); Orders · Edit Columns open · Mobile has no open menu in the frame.
- Very tall frames: Media Items · Grid · Mobile 390×9300, Topic Manager Hierarchy ~3.5–4.2k, Long Queries ~3–4k.
- Runbook updated: `&title=` per capture; overlay z-order check; mobile-hidden controls.
