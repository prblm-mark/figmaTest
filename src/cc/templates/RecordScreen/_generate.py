"""Build ArticleView.html, ArticleEdit.html and ArticleSteps.html.

The app shell (sidebar menu, top navigation, header group, actions rail, theme + width
scripts) is taken verbatim from ../ListingScreen/ListingScreen.html — ported as a bundle
(feedback: port demo chrome as a bundle) — and only four things are swapped:
the <title>, the breadcrumb tail, the header block (→ CC Header Type=Record) and the page
content (+ page scripts). Every swap asserts its anchor, so a shell change fails loudly.

    python3 src/cc/templates/RecordScreen/_generate.py
"""
import importlib.util
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import record_markup as m  # noqa: E402
import record_article as rec  # noqa: E402

# Step content (titles + bodies) read from the Hub for Article 626347 — a copy of the ArticleSteps
# prototype's data, kept here so the template does not depend on an uncommitted prototype.
spec = importlib.util.spec_from_file_location("steps_data", os.path.join(HERE, "steps_data.py"))
sd = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sd)

SHELL = open(os.path.join(HERE, "../ListingScreen/ListingScreen.html"), encoding="utf-8").read()

CSS = """
  <!-- Record screen kit (Figma View & Edit page) -->
  <link rel="stylesheet" href="../../../components/Badge/Badge.css">
  <link rel="stylesheet" href="../../../components/Textarea/Textarea.css">
  <link rel="stylesheet" href="../../components/FieldRow/FieldRow.css">
  <link rel="stylesheet" href="../../components/MediaMeta/MediaMeta.css">
  <link rel="stylesheet" href="../../components/MediaPicker/MediaPicker.css">
  <link rel="stylesheet" href="../../components/ViewerItem/ViewerItem.css">
  <link rel="stylesheet" href="../../components/AdvisoryItem/AdvisoryItem.css">
  <link rel="stylesheet" href="../../patterns/RecordTabs/RecordTabs.css">
  <link rel="stylesheet" href="../../patterns/RecordSection/RecordSection.css">
  <link rel="stylesheet" href="../../patterns/FactPanel/FactPanel.css">
  <link rel="stylesheet" href="../../patterns/ViewerList/ViewerList.css">
  <link rel="stylesheet" href="../../patterns/AdvisoryList/AdvisoryList.css">
  <link rel="stylesheet" href="../../patterns/PerformanceSummary/PerformanceSummary.css">
  <link rel="stylesheet" href="../../patterns/TagBox/TagBox.css">
  <link rel="stylesheet" href="../../patterns/StepsTable/StepsTable.css">
  <link rel="stylesheet" href="RecordScreen.css">
</head>"""


def swap(src, old, new, count=1):
    assert src.count(old) >= 1, f"anchor not found: {old[:60]!r}"
    return src.replace(old, new, count)


def build(page_title, header, page, scripts, modals="", listing=False):
    s = SHELL
    s = re.sub(r"<title>.*?</title>", f"<title>{page_title} — Affino Control Centre</title>", s, count=1)
    s = swap(s, "</head>", CSS)
    s = swap(s, 'href="ListingScreen.css"', 'href="../ListingScreen/ListingScreen.css"')
    s = swap(s, '<li class="breadcrumb__item"><a class="breadcrumb__link" href="#">Level 1</a></li>',
             '<li class="breadcrumb__item"><a class="breadcrumb__link" href="#">Content</a></li>\n'
             '              <li class="breadcrumb__separator" aria-hidden="true"><i data-lucide="chevron-right" aria-hidden="true"></i></li>\n'
             '              <li class="breadcrumb__item"><a class="breadcrumb__link" href="#">Articles</a></li>')
    s = swap(s, 'aria-current="page">Level 2</li>', 'aria-current="page">Article</li>')
    a = s.index('<div class="cc-header-cq">')
    b = s.index("</header>", a)
    c = s.index("</div>", b) + len("</div>")
    s = s[:a] + header + s[c:]
    p = s.index('<div class="cc-control__page cc-control__page--listing">')
    q = s.index("\n  </main>", p)
    s = s[:p] + page + "\n" + s[q:]
    if listing:
        # The steps table runs on the listing engine (full parity, designer 2026-09-29): keep
        # listing-data.js (LISTING_SCREENS + shared column logic), add the steps config, then the engine.
        s = swap(s, '  <script src="listing-data.js"></script>\n',
                 '  <script src="../ListingScreen/listing-data.js"></script>\n  <script src="listing-data-article-steps.js"></script>\n')
        s = swap(s, '  <script src="ListingScreen.js"></script>', scripts + '\n  <script src="../ListingScreen/ListingScreen.js"></script>')
    else:
        s = swap(s, '  <script src="listing-data.js"></script>\n', "")
        s = swap(s, '  <script src="ListingScreen.js"></script>', scripts)
    if modals:
        s = swap(s, "</body>", modals + "\n</body>")
    return s


def page(inner, sidebar_on=True):
    mod = "" if sidebar_on else " record-screen--no-sidebar"
    return f'''<div class="cc-control__page cc-control__page--record">
      <div class="record-screen{mod}" data-record-screen>
        {inner}
      </div>
    </div>'''


def body(sections, side=None):
    return f'''<div class="record-screen__body">
          <div class="record-screen__main">{sections}</div>
          <aside class="record-screen__sidebar" id="record-sidebar" aria-label="Record information">
            <div class="record-screen__handle" data-record-handle role="separator" aria-orientation="vertical"
                 tabindex="0" aria-label="Resize the record information panel"
                 aria-valuemin="384" aria-valuemax="0" aria-valuenow="384">
              <span class="record-screen__handle-bar" aria-hidden="true"></span>
            </div>
            {side or m.sidebar()}
          </aside>
        </div>'''


KIT_JS = '''  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <script src="../../components/AdvisoryItem/AdvisoryItem.js"></script>
  <script src="../../patterns/TagBox/TagBox.js"></script>
  <script src="../../patterns/StepsTable/StepsTable.js"></script>
  <script src="RecordScreen.js"></script>'''

TITLE = "Affino 9.0.11.25 — The Refinement Update"
HEAD_NOTE = "<!-- Generated by _generate.py from the ListingScreen shell — edit record_markup.py, not this file. -->\n"


def steps_rows():
    rows = []
    for i, (title, opening) in enumerate(sd.STEPS[:20], 1):
        html = getattr(sd, f"STEP{i}_HTML", None) or f"<p>{m.e(opening)}</p>"
        rows.append((title, html))
    return rows


# ── Article Steps on the listing engine ─────────────────────────────────────────────────────
# The datatable block is LIFTED from Articles.html at build time rather than retyped, so the Steps
# table cannot drift from the listing it now shares an engine with (toolbar, Edit Columns,
# Settings, selection bar, body, footer). Only the root gains the Steps hooks and the toolbar gains
# the Show details toggle.
def write_steps_config():
    import json
    rows = []
    for i, (title, opening) in enumerate(sd.STEPS, 1):
        html = getattr(sd, f"STEP{i}_HTML", None) or f"<p>{m.e(opening)}</p>"
        rows.append({"stepId": i, "order": i, "title": title, "type": "Content", "float": "None",
                     "designFrame": False, "lookup": False, "createdBy": "Markus Karlsson",
                     "publishStart": "20 Jul 2026", "live": True, "detail": m.step_detail(html)})
    js = f'''/* Article Steps — the steps table as a LISTING screen (generated by _generate.py; edit there).
 *
 * Full parity with the listings (designer, 2026-09-29): the adaptive column fit, Edit Columns with
 * drag-reorder, Settings (Expanding row / Horizontal scroll), saved per user — all from
 * ListingScreen.js. Steps-specific: `rowDetail` puts the step body in the same detail row as any
 * columns that did not fit, and the toolbar's Show details toggle opens every row (StepsTable.js).
 * Columns in priority order, per the StepsTable Figma (3881:7518). Rows: Hub article 626347. */
LISTING_SCREENS['article-steps'] = {{
  title: 'Article steps',
  columns: [
    {{ key: 'select',       type: 'select', label: '',              hug: true }},
    {{ key: 'order',        type: 'text',   label: 'Order',         hug: true, sort: 'Order' }},
    {{ key: 'title',        type: 'text',   label: 'Title',         sort: 'Title', truncate: true, link: true, cellClass: 'steps-table__title-cell' }},
    {{ key: 'type',         type: 'text',   label: 'Type',          hug: true, sort: 'Type' }},
    {{ key: 'float',        type: 'text',   label: 'Float',         hug: true, sort: 'Float' }},
    {{ key: 'designFrame',  type: 'flag',   label: 'Design frame',  hug: true }},
    {{ key: 'lookup',       type: 'flag',   label: 'Lookup',        hug: true }},
    {{ key: 'createdBy',    type: 'chip',   label: 'Created by',    snug: true, sort: 'CreatedBy' }},
    {{ key: 'publishStart', type: 'text',   label: 'Publish start', hug: true, sort: 'PublishStart' }},
    {{ key: 'live',         type: 'flag',   label: 'Live',          hug: true }},
    {{ key: 'edit',         type: 'edit',   label: '',              hug: true }},
    {{ key: 'kebab',        type: 'kebab',  label: '',              hug: true }}
  ],
  defaultFilters: [],
  moreFilters: [],
  rows: {json.dumps(rows, ensure_ascii=False, indent=2)},
  rowDetail: function (row) {{ return row.detail; }},
  /* Checkboxes stay (the Figma draws them); the step bulk actions are not designed yet. */
  selectable: true,
  rowKey: 'stepId',
  routeNoun: 'step',
  rowNoun: 'step',
  /* Order + Title identify a step; both always show. */
  identityColumns: 2,
  perPage: 20,
  perPageOptions: [10, 20, 50, 100],
  sort: {{ by: 'Order', dir: 'asc' }}
}};
'''
    open(os.path.join(HERE, "listing-data-article-steps.js"), "w", encoding="utf-8").write(js)


write_steps_config()

# ArticleView / ArticleEdit ARE affino.com Article 626312 — the framework filled with a real, fully
# written article's whole field set + its own sidebar values (record_article.py; designer, 2026-09-29). The Figma draft's six-section
# content stays in record_markup.py for the component demos; Figma itself still draws the draft.
pages = {
    "ArticleView.html": build("Article · View", m.record_header("Article", rec.TITLE, "view"),
                              page(m.record_tabs("details", sidebar=True) + body(rec.view_sections(), rec.sidebar())), KIT_JS),
    "ArticleEdit.html": build("Article · Edit", m.record_header("Article", rec.TITLE, "edit"),
                              page(m.record_tabs("details", back="ArticleEdit.html", sidebar=False) + body(rec.edit_sections(), rec.sidebar()), sidebar_on=False), KIT_JS,
                              modals=rec.modals()),
    "ArticleSteps.html": build("Article · Steps", m.record_header("Article", rec.TITLE, "view"),
                               page(m.record_tabs("steps", actions=True) + m.steps_listing()), KIT_JS, listing=True),
}

for name, html in pages.items():
    html = html.replace("<!doctype html>\n", "<!doctype html>\n" + HEAD_NOTE, 1)
    open(os.path.join(HERE, name), "w", encoding="utf-8").write(html)
    print("wrote", name, len(html))
