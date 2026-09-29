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


def build(page_title, header, page, scripts, modals=""):
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
    s = swap(s, '  <script src="listing-data.js"></script>\n', "")
    s = swap(s, '  <script src="ListingScreen.js"></script>', scripts)
    if modals:
        s = swap(s, "</body>", modals + "\n</body>")
    return s


def page(inner):
    return f'''<div class="cc-control__page cc-control__page--record">
      <div class="record-screen" data-record-screen>
        {inner}
      </div>
    </div>'''


def body(sections):
    return f'''<div class="record-screen__body">
          <div class="record-screen__main">{sections}</div>
          <aside class="record-screen__sidebar" aria-label="Record information">
            <div class="record-screen__handle" data-record-handle role="separator" aria-orientation="vertical"
                 tabindex="0" aria-label="Resize the record information panel"
                 aria-valuemin="384" aria-valuemax="0" aria-valuenow="384">
              <span class="record-screen__handle-bar" aria-hidden="true"></span>
            </div>
            {m.sidebar()}
          </aside>
        </div>'''


KIT_JS = '''  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <script src="../../components/AdvisoryItem/AdvisoryItem.js"></script>
  <script src="../../components/MediaMeta/MediaMeta.js"></script>
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


pages = {
    "ArticleView.html": build("Article · View", m.record_header("Article", TITLE, "view"),
                              page(m.record_tabs("details") + body(m.view_sections())), KIT_JS),
    "ArticleEdit.html": build("Article · Edit", m.record_header("Article", TITLE, "edit"),
                              page(m.record_tabs("details", back="ArticleEdit.html") + body(m.edit_sections())), KIT_JS,
                              modals=m.multi_select_modal("modal-multi-display", "Select Multi Display", m.SECTIONS_SOURCE)
                              + m.multi_select_modal("modal-topics", "Select Topics and Keywords", m.TOPICS_SOURCE)),
    "ArticleSteps.html": build("Article · Steps", m.record_header("Article", TITLE, "view"),
                               page(m.record_tabs("steps", actions=True) + m.steps_table(steps_rows(), total=len(sd.STEPS))), KIT_JS),
}

for name, html in pages.items():
    html = html.replace("<!doctype html>\n", "<!doctype html>\n" + HEAD_NOTE, 1)
    open(os.path.join(HERE, name), "w", encoding="utf-8").write(html)
    print("wrote", name, len(html))
