# ControlRecordScreen — content classification

**Status: PROVISIONAL.** Every row was read off the live v2 screens on 2026-09-22 and is awaiting
Shaz's field inventory (task #853324). The rule being applied:

- **editable → main column.** A field is editable if and only if the *Edit* screen renders a
  control for it. Read from the screen definitions, not inferred from how it looks on View.
- **compact fact → right sidebar.** No control anywhere, and short enough to read in a 320px column.
- **wide evidence → tabs (model A) / compressed summary (model B).** No control anywhere, but needs
  more width than a sidebar has: a chart, a multi-column related-record table, a child listing.

The third bucket is the finding. The original proposal had two buckets; Article's view-only content
does not fit in one column, so it had to split. Article Icon has no wide evidence at all, which is
why models A and B render it identically and it is built once.

Anything Shaz contradicts moves between `main` and `facts` in `_generate.mjs`, all six screens
regenerate, and the affected frames are re-pushed with a bumped `v<n>`.

---

## Article — `/control/standard-item-edit`

19 sections on the live screen. 13 editable, 5 compact facts, 3 wide evidence (Stats and SEO Health
Check split across buckets — the stats panel is wide, the health-check advisory list is short).

### Main column — editable (13 sections)

| Section | Fields |
|---|---|
| Navigation | Zone\*, Section\*, Sort Order, Multi Display, Priority |
| Introduction | Title\*, Screen Name, Alternative Title, Thumbnail |
| Main Body | Alignment, Main Image, Audio Version (MP3), Blog Intro, Blog Entry |
| Topics | Category Topic, Topics and Keywords |
| SEO | Page Title, Page Description |
| Social | Shareline 1–3 |
| Article Questions | Question 1–5 |
| Summary | Summary |
| Publication | Creator, Related Authors, Publish Start, Publish End, Embargo End, Syndication, Live, Private, Send Via Content / Interest Subscription, Hide From Search Results, Exclude From AI Index, Moderated |
| Security | Content Security Right |
| Advanced | External Article ID, Article Type, Multimedia |
| Geo Targeting | Geo Targeting Type, Countries |
| Comments And Ratings | Hide Comments And Ratings |

\* compulsory on the v2 screen.

**Note on Advanced:** *Article Code* (626353) sits in this section on the v2 screen but is a
system-assigned identifier with no control. It moves to the sidebar under **Record**. This is the
clearest single example of the rule doing useful work — it separates the record's identity from
the things you can change about it.

### Right sidebar — compact facts (5 blocks)

| Block | Contents |
|---|---|
| Record | Article Code, Batch Reference |
| SEO health | 3 advisories (no sharelines, no topics, no subheadings) |
| Meta information | Publisher, Creator, Rights, Date, Language — all derived |
| Index status | Site Search, Affino.com Assistant |
| Audit | Created, Created by, Last updated, Last updated by, Last view, Impressions + *View audit trail* |

**Note on Creator:** it appears twice — as an editable picker under Publication, and as a derived
value under Meta Information. That is how the v2 screen has it, and the two are genuinely different
things (the assigned author vs. the Dublin Core metadata field). Kept as-is rather than silently
deduplicated; flag for Shaz to confirm they are separate fields in the data.

### Wide evidence (3 blocks)

| Block | Why it cannot live in a 320px sidebar |
|---|---|
| Performance | 4 metrics + a 12-point impressions chart + 7 account chips |
| Recent viewers | 5 contacts with name, role, account, relative time — 4 columns minimum |
| Article steps | 23 rows with title, type, sort order, creator; own paging; own Lookup action |

Model A puts these in tabs. Model B compresses each to a 3-row summary plus a link out to the
screen that already shows them in full (Site Analysis, Contacts, the Article Steps listing).

---

## Article Icon — `/control/article-icon`

2 sections. This is the floor case, and the point of including it.

| Bucket | Contents |
|---|---|
| Main column — editable | **Main:** Name\*, Article Profile, Target Section, Section, Icon, Description |
| Sidebar — compact facts | **Audit:** Created, Created by, Last updated, Last updated by |
| Wide evidence | *none* |

**What this screen exposes.** With one 4-row fact block, the sidebar is mostly empty and the main
column is 6 fields — so a 1600px screen is largely white space with a small form on the left and a
small card on the right. The pattern does not fail, but it does not earn its keep either. Whether
that matters depends entirely on how common this shape is across the ~1,053 control screens, which
is exactly what the census half of Shaz's brief is for. Do not settle A vs B from the Article
screen alone.

---

## Not yet classified

The other two exemplars Mark named are in Shaz's brief but not in this build:

- **`/control/edition`** — ~6 sections. Carries a large emphasised stat (`Circulation 0`) inside an
  otherwise ordinary field section, and a screen-level action (*Calculate Circulation*) in the
  header. Neither has a home in the current model: an emphasised metric is not a field, and a
  screen action is not a record action. `.crs-stat` exists for the former; the latter belongs in
  `.cc-header__actions`.
- **`/control/directory-article-profile`** — 4 sections, one of which (*Directory Article Limit*) is
  an embedded child table sitting mid-form, and one of which (*Text Items*) is ~40 label-override
  pairs. The child table is wide evidence that is also *editable*, which the current three-bucket
  model does not cover. Worth resolving before the pattern is generalised.
