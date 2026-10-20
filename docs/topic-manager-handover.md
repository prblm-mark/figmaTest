# Topic Manager (v3): Hierarchy + List. Handover

> **Who this is for:** Cat (and Lynx/Luismi): building the v3 Topic Manager, Hub TASK-571926, from the design
> asked for in TASK-571925.
> **Status:** **designed and built in this repo** (2026-10-20), code-first. The tree is a new pattern,
> **TopicTree**. Everything else is the existing Listing template.
> **Data contract:** surface `TopicManager` in [`HANDOVER.md`](../HANDOVER.md) and
> [`handover-manifest.json`](handover-manifest.json).
> Where this document and the code disagree, **the code wins.** Please report the gap.

**Run it:** `npm install && npm run tokens && npm start`, then open
- the screen: `http://localhost:8080/src/cc/templates/ListingScreen/TopicManager.html`
  (`?layout=listing` opens on List)
- every tree state: `http://localhost:8080/src/cc/patterns/TopicTree/TopicTree.html`

| What | Where |
|---|---|
| Screen | `src/cc/templates/ListingScreen/TopicManager.html` + `listing-data-topics.js` (the screen's config) |
| Tree pattern (CSS, JS, demo, notes) | `src/cc/patterns/TopicTree/` |
| Spec and token table | `src/cc/patterns/TopicTree/TopicTree.figma-notes.md` |
| Listing engine | `ListingScreen.js`: three small additions, see §4 |

## 1. What replaces what

v1: `/control/taxonomy-manager-screen?TaxonomyCode=N` (ControlProfile 850, `AfoTaxonomyMgr/CC/TaxonomyManager.cfm`,
right 190), opened by the Topic List view's "Click here to manage".

| v1 | v3 |
|---|---|
| Title "Topics - ‹topic list›" | page title **Topics – ‹topic list›** |
| Add | header **Add** (primary) |
| Back button (CMethods `origin`) | the **breadcrumb**: Content › Topic Lists › ‹topic list› › Topics |
| Tabs: Hierarchy (default), List | **SegmentedControl** in the table toolbar, Hierarchy first. The same control Media Items uses for Listing / Grid |
| Topic box (`Letter`) | **Topic** chip. v1's rule is kept: one character means "starts with", more means "contains", on Name or External ID |
| Parent box | **Parent** chip |
| A–Z strip | **Starts with** chip (A–Z). One control on the bar instead of 26 buttons |
| Hierarchy: a name tree, page reload per click | **TopicTree**: a name-only site tree in the listing card; levels load as you open them |
| Hierarchy's details panel (code, name, screen name, children, counts, created) + Edit | the **FactPanel** beside the tree, for the selected topic, with **Edit** in its header. It stays in view as the tree scrolls, and stacks under the tree below 1024px |
| List: 17 CProperties columns | the Listing template: 8 shown, the 9 "le2" counts off by default, all in **Edit Columns** |
| A topic's page | the record pattern (List: the row opens it, the pencil edits; Hierarchy: the panel's Edit) |

Search narrows **both** views. In the Hierarchy, matches show with the path to them, opened; ancestors drawn
only for context are muted.

## 2. The tree (TopicTree), the new part

- **Names only**, like v1. The row selects; the chevron opens and closes. The selected topic's details are the
  FactPanel's (`renderTopicPanel` in `listing-data-topics.js`): Topic Code, Screen Name, Parents, Child Topics,
  each non-zero count as a link to that listing filtered to the topic, Created. Empty fields are left out.
- An earlier pass drew the tree as a table with count columns. Mark rejected it as too heavy (2026-10-20).
- **Multi-parent topics** (`TaxonomyCategoryBTNT` is many-to-many) appear under **every** parent. A link icon after
  the name shows "Also under: …" in the DS Tooltip.
- **Rows:** 32px. **Indent:** 22px per level (chevron + gap), so a child's chevron sits under its parent's name.
  Up to 10 levels (v1 walks 10).
- **Keyboard:** APG tree view. ↑ ↓, → / ← open, close or step in and out, Home / End, Enter / Space selects. Only the
  focused row is in the tab order.
- **Per-level cap:** 300, as v1, then "Show N more".
- Mount contract and options: the header of `TopicTree.js`.

## 3. Backend (surface `TopicManager`)

| id | What it needs |
|---|---|
| `topic-tree-data` | one level per call: `parent=root` returns the topics with no parent, A–Z; `parent=<code>` returns its children by `SO` then name; each topic carries its counts and **all** its parents |
| `topic-tree-search` | the matches **plus their ancestor paths**, so a result can be drawn without opening each level |
| `topic-manager-rows` | the List: v1's `TaxonomyManagerDisplayListing.cfm` columns, paged and sorted |
| `topic-manager-routes` | topic Edit (panel) and View / Edit (List rows), Add (new topic in this list), each panel count's filtered listing, the topic list's View for the breadcrumb |

The Listing template's own items (`listing-row-routes`, `listing-column-prefs`, saved views,
`listing-header-actions`) apply unchanged.

## 4. Listing engine additions (backwards compatible)

All opt-in. The existing screens were left as they were, apart from their empty-state wording.

- `layouts` may name any layout, and `?layout=` accepts any declared one (it was `listing|grid` only).
- `renderLayout(root, { rows, filtered })`: a screen's own rendering of the filtered, unpaged result. Topic
  Manager draws the tree and its panel with it.
- `defaultHiddenColumns`: columns a screen ships switched off but listed in Edit Columns.
- The empty state now uses the screen's noun ("No matching topics"). It said "orders" on every screen.

## 5. Not decided / for Mark

- Not drawn in Figma yet. The code is the reference.
- The demo's counts are invented. The names and links are a real 200-topic sample from AffinoComrz.
