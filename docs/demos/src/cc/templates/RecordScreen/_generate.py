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
import record_step as step  # noqa: E402
import record_contact as contact  # noqa: E402

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
  <link rel="stylesheet" href="../../components/RichTextEditor/RichTextEditor.css">
  <link rel="stylesheet" href="../../patterns/PromptModifier/PromptModifier.css">
  <link rel="stylesheet" href="../../../components/AvatarGroup/AvatarGroup.css">
  <link rel="stylesheet" href="../../components/ViewerItem/ViewerItem.css">
  <link rel="stylesheet" href="../../components/AdvisoryItem/AdvisoryItem.css">
  <link rel="stylesheet" href="../../patterns/RecordTabs/RecordTabs.css">
  <link rel="stylesheet" href="../../patterns/RecordSection/RecordSection.css">
  <link rel="stylesheet" href="../../patterns/FactPanel/FactPanel.css">
  <link rel="stylesheet" href="../../patterns/ViewerList/ViewerList.css">
  <link rel="stylesheet" href="../../patterns/AdvisoryList/AdvisoryList.css">
  <link rel="stylesheet" href="../../patterns/PerformanceSummary/PerformanceSummary.css">
  <link rel="stylesheet" href="../../patterns/TagBox/TagBox.css">
  <link rel="stylesheet" href="../../../components/SearchInput/SearchInput.css">
  <link rel="stylesheet" href="../../patterns/Selector/Selector.css">
  <link rel="stylesheet" href="../../../components/SegmentedControl/SegmentedControl.css">
  <link rel="stylesheet" href="../../patterns/StepsTable/StepsTable.css">
  <link rel="stylesheet" href="../../../components/ActionCard/ActionCard.css">
  <link rel="stylesheet" href="../../../components/ColorPickerInput/ColorPickerInput.css">
  <link rel="stylesheet" href="RecordScreen.css">
</head>"""


def swap(src, old, new, count=1):
    assert src.count(old) >= 1, f"anchor not found: {old[:60]!r}"
    return src.replace(old, new, count)


def build(page_title, header, page, scripts, modals="", listing=False, crumbs=("Content", "Articles", "Article")):
    s = SHELL
    s = re.sub(r"<title>.*?</title>", f"<title>{page_title} — Affino Control Centre</title>", s, count=1)
    s = swap(s, "</head>", CSS)
    s = swap(s, 'href="ListingScreen.css"', 'href="../ListingScreen/ListingScreen.css"')
    s = swap(s, '<li class="breadcrumb__item"><a class="breadcrumb__link" href="#">Level 1</a></li>',
             f'<li class="breadcrumb__item"><a class="breadcrumb__link" href="#">{crumbs[0]}</a></li>\n'
             # Articles collapses with the current crumb on mobile: the TopNavigation keeps two items
             # there (zone + one level, Figma 4099:3632) — it hides every `--collapse` crumb.
             '              <li class="breadcrumb__separator breadcrumb__separator--collapse" aria-hidden="true"><i data-lucide="chevron-right" aria-hidden="true"></i></li>\n'
             f'              <li class="breadcrumb__item breadcrumb__item--collapse"><a class="breadcrumb__link" href="#">{crumbs[1]}</a></li>')
    s = swap(s, 'aria-current="page">Level 2</li>', f'aria-current="page">{crumbs[2]}</li>')
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


def page(inner, sidebar_on=True, mode=None):
    mod = "" if sidebar_on else " record-screen--no-sidebar"
    mode_attr = f' data-record-mode="{mode}"' if mode else ""
    return f'''<div class="cc-control__page cc-control__page--record">
      <div class="record-screen{mod}" data-record-screen{mode_attr}>
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
  <script src="../../components/MediaPicker/MediaPicker.js"></script>
  <script src="../../patterns/Selector/Selector.js"></script>
  <script src="../../components/RichTextEditor/RichTextEditor.js"></script>
  <script src="../../patterns/PromptModifier/PromptModifier.js"></script>
  <script src="../../../components/SegmentedControl/SegmentedControl.js"></script>
  <script src="../../patterns/StepsTable/StepsTable.js"></script>
  <script src="../../patterns/RecordTabs/RecordTabs.js"></script>
  <script src="../../../components/AvatarGroup/AvatarGroup.js"></script>
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
def edit_errors_main():
    m.ERROR_TARGETS.clear()
    sections = rec.edit_sections(errors=rec.SAVE_ERRORS)
    return m.validation_summary(list(m.ERROR_TARGETS)) + sections


def confirm_main(flagged):
    if flagged:
        words = '<ul class="alert__list"><li>Main Body: 2 words</li><li>Shareline 1: 1 word</li></ul>'
        banner = m.alert("warning", "triangle-alert", "This article needs moderation.",
                         "The profanity check flagged words in it. You can still confirm; it will go live once a moderator approves it.", words)
    else:
        # Warning, not info (designer, 2026-10-05): the article is not saved until Confirm, so leaving loses it.
        banner = m.alert("warning", "triangle-alert", "Not saved yet.", "Check your article, then confirm to save it. Edit to make changes.")
    # TODO(backend:RecordScreen) record-workflow-confirm: banner + flagged fields come from the workflow's confirmation step (profanity check) → Confirm submits, Edit returns to the form with values kept
    return banner + rec.view_sections()


pages = {
    "ArticleView.html": build("Article · View", m.record_header("Article", rec.TITLE, "view"),
                              page(m.record_tabs("details", sidebar=True) + body(rec.view_sections(), rec.sidebar(analytics=True)), mode="view"), KIT_JS),
    "ArticleEdit.html": build("Article · Edit", m.record_header("Article", rec.TITLE, "edit"),
                              page(m.record_tabs("details", back="ArticleEdit.html", sidebar=False) + body(rec.edit_sections(), rec.sidebar()), sidebar_on=False, mode="edit"), KIT_JS,
                              modals=rec.modals() + m.delete_confirm_modal("modal-delete", "article", rec.TITLE)
                                     + m.duplicates_modal("modal-duplicates", rec.DUPLICATES) + m.sector_modal("modal-sector", rec.SECTORS)),
    # Q3 states the design doesn't draw (code-first, 2026-10-05; Hub TASK-531782). A failed Save is a
    # server re-render, so it is its own page; the confirmation step is the View layout, read-only.
    "ArticleEditErrors.html": build("Article · Edit", m.record_header("Article", rec.TITLE, "edit"),
                                    page(m.record_tabs("details", back="ArticleEdit.html", sidebar=False)
                                         + body(edit_errors_main(), rec.sidebar()), sidebar_on=False, mode="edit"), KIT_JS,
                                    modals=rec.modals() + m.delete_confirm_modal("modal-delete", "article", rec.TITLE)),
    "ArticleConfirm.html": build("Article · Confirm", m.record_header("Article", rec.TITLE, "confirm"),
                                 page(body(confirm_main(False), rec.sidebar()), sidebar_on=False, mode="view"), KIT_JS),
    "ArticleConfirmFlagged.html": build("Article · Confirm", m.record_header("Article", rec.TITLE, "confirm"),
                                        page(body(confirm_main(True), rec.sidebar()), sidebar_on=False, mode="view"), KIT_JS),
    "ArticleSteps.html": build("Article · Steps", m.record_header("Article", rec.TITLE, "view"),
                               page(m.record_tabs("steps", actions=True) + m.steps_listing()), KIT_JS, listing=True,
                               modals=m.add_step_modal()),
}

# ── Contact View (code-first "build first", 2026-10-07): the kit as a second record type. Two
# contacts — a fully filled one and a sparse one — whose structure is the live contact screen's.
for c in contact.CONTACTS:
    pages[c["file"]] = build(
        "Contact · View",
        m.record_header("Contact", c["name"], "view", view_href=c["file"], edit_href="#",
                        secondary=contact.SECONDARY, more=contact.KEBAB),
        page(m.record_tabs("details", sidebar=True, tabs=contact.tabs(c["file"]))
             + body(contact.view_sections(c), contact.sidebar(c)), mode="view"),
        KIT_JS, crumbs=("CRM", "Contacts", "Contact"))

# ── Import step (designer, 2026-09-30; code-first, flag for Figma) ──
# The legacy "add Article Step Lookup" form, on the Steps screen: the tabs stay (Details leads back
# to the article), the form replaces the table, and the tab actions become Cancel / Save.
# Lookup rows are the legacy Content Lookup's first page for "affino" (refs screenshot 2026-09-30,
# 50 of 4,134), as (Article, Article step).
STEP_LOOKUP = [
    ("Affino eCommunity", "Comments & Ratings"),
    ("How Affino is quite a different kind of proposition to WordPress and CMS solutions in general", "Ease-of-Use in Setup"),
    ("Affino Social Connectors", "Elements and Dependencies"),
    ("Affino eCommunity", "Message Boards / Forums"),
    ("Affino Media", "MP3 Player / Store"),
    ("Affino Testimonials", "Rósant Guðmundsson, Rarik (Iceland State Electricity) Head of PR and Marketing"),
    ("5 Key Tips & Takeaways from the recent Future of Media Technology Conference", "‘Companies are starting to take ownership of their own data’ – Markus Karlsson, CEO of Affino"),
    ("Affino's Marketing Services Automation Drives Superior Outcomes for Site Owners and Clients alike", "1 : Contact Lists"),
    ("A 12 Step Visual Guide to Affino's Fully Baked-In GDPR Solution", "1 : GDPR Links in Footer / Cookie Consent Bar"),
    ("Upgrading from Affino 2.0 to Affino LX", "1 : Prime Content Area Settings"),
    ("Starting with Affino LX", "1: Configure the Site Security"),
    ("Affino Social Connectors", "1: Make sure you have Status Updates Channel and Blog Channel set up"),
    ("Creating your first Affino Newsletter", "1] Prerequisites"),
    ("Self-guided Affino LX Demonstration", "1] Red Zone"),
    ("Self-guided Affino NX Demonstration", "1] Silver Zone"),
    ("Building an Accessible Affino Website", "1] Use the absolute minimum of graphics and images in your design"),
    ("A 12 Step Visual Guide to Affino's Fully Baked-In GDPR Solution", "10 : Contact Permissions"),
    ("Upgrading from Affino 2.0 to Affino LX", "10 : Update Settings for your Modules"),
    ("Affino Unified Business Platform", "10 Key Elements - Platform"),
    ("Affino Social Connectors", "10: Assign External Integration Profile to User Profile"),
    ("Starting with Affino LX", "10: Fine-tune User Profile and Settings"),
    ("Building an Accessible Affino Website", "10] Be careful of 'adjacent' links and multiple links to the same destination"),
    ("Self-guided Affino NX Demonstration", "10] Content Tree"),
    ("Self-guided Affino LX Demonstration", "10] Content Tree"),
]
IMPORT_POS = str(len(sd.STEPS) + 1)  # a new step goes last by default (legacy: count + 1)


def step_sort_modal(new_label, badge):
    """Sort Order for a step being added or imported: this article's steps, the new one last."""
    return m.sort_order_modal("modal-step-sort", "Sort Order", "this article",
                              [(i, t, None) for i, (t, _) in enumerate(sd.STEPS, 1)] + [(0, new_label, None)], 0,
                              noun="steps", this_label=badge, jump_label="Jump to the new step", find_label="Find a step")
import_modals = (
    m.single_select_modal("modal-step-lookup", "Select Article Step", STEP_LOOKUP, noun="step",
                          columns=("Article", "Article step"), facets=(), search="Search articles and steps",
                          value=lambda r: f"{r[1]} — {r[0]}", total=4134)
    + step_sort_modal("The step you are importing", "Importing"))
# TODO(backend:RecordScreen) steps-import-source: 24 static lookup rows → paged search over all article steps
import_form = m.record_section("Import step", [
    m.edit_row("Article Step", "lookup", required=True, modal="modal-step-lookup"),
    m.edit_row("Sort Order", "lookup", required=True, modal="modal-step-sort", placeholder=IMPORT_POS),
], "edit")
pages["ArticleStepImport.html"] = build(
    "Article · Import step", m.record_header("Article", rec.TITLE, "view"),
    page(m.record_tabs("steps", form="ArticleSteps.html")
         + f'''<div class="record-screen__body"><div class="record-screen__main">{import_form}</div></div>''',
         sidebar_on=False, mode="edit"),
    KIT_JS, modals=import_modals)

# ── Add step (designer, 2026-09-30; code-first, flag for Figma) ──
# + Add opens the "Add a step" chooser modal (ArticleSteps.html); each card leads to its screen.
# Same frame as Import step: tabs stay, the tab actions are Cancel / Save, the form replaces the table.
def add_step_page(kind, page_title):
    modals = step_sort_modal("The step you are adding", "New step")
    if kind == "content":
        modals += (m.media_select_modal("modal-media", "Select Media", rec.MEDIA_SOURCE[:24], len(rec.MEDIA_SOURCE))
                   + m.media_select_modal("modal-multimedia", "Select Multimedia", rec.MULTIMEDIA_SOURCE,
                                          len(rec.MULTIMEDIA_SOURCE), apply_label="Use media"))
    return build(page_title, m.record_header("Article", rec.TITLE, "view"),
                 page(m.record_tabs("steps", form="ArticleSteps.html", save_todo="steps-add-save")
                      + f'''<div class="record-screen__body"><div class="record-screen__main">{step.sections(kind, IMPORT_POS)}</div></div>''',
                      sidebar_on=False, mode="edit"),
                 KIT_JS, modals=modals)


pages["ArticleStepContent.html"] = add_step_page("content", "Article · Add content step")
pages["ArticleStepForm.html"] = add_step_page("form", "Article · Add dynamic form step")

for name, html in pages.items():
    html = html.replace("<!doctype html>\n", "<!doctype html>\n" + HEAD_NOTE, 1)
    open(os.path.join(HERE, name), "w", encoding="utf-8").write(html)
    print("wrote", name, len(html))


# ── Selector demo (src/cc/patterns/Selector/Selector.html) — the pattern's own gallery, built from
#    the same builders + data as ArticleEdit so the two can never drift. Same folder depth, so the
#    relative asset paths (and m.IMG) hold unchanged.
def write_selector_demo():
    css = "".join(f'  <link rel="stylesheet" href="{h}">\n' for h in [
        "../../../styles/base.css", "../../../components/Button/Button.css", "../../../components/Badge/Badge.css",
        "../../../components/Checkbox/Checkbox.css", "../../../components/Input/Input.css",
        "../../../components/SearchInput/SearchInput.css", "../../../components/Table/Table.css",
        "../../../components/Datatables/Datatables.css", "../../../components/FilterItem/FilterItem.css",
        "../../../patterns/Modal/Modal.css", "../../../patterns/FilterDropdowns/FilterDropdowns.css",
        "../../components/FieldRow/FieldRow.css", "../../components/MediaPicker/MediaPicker.css",
        "../../patterns/TagBox/TagBox.css", "Selector.css"])
    sec = lambda title, note, inner: f'''  <div class="demo-section">
    <p class="demo-section__title">{title}</p><p class="demo-note">{note}</p>
    {inner}
  </div>
'''
    rows = [
        ("Type=Single", "Section / Creator. Click a row to choose it and close. The current value is pinned to the top and ticked; Clear selection empties the field.",
         m.edit_row("Section", "lookup", "Insight", modal="modal-section") + m.edit_row("Creator", "lookup", "Markus Karlsson", modal="modal-creator")),
        ("Type=Multi", "Multi Display. The Multi Select Modal (TagBox owns Apply); Selector adds the search and the live count.",
         m.edit_row("Multi Display", "tagbox", tags=["Coronavirus Hub", "AI", "Insight & Blogs"], modal="modal-multi-display")),
        ("Type=Media", "Thumbnail / Main Image. The Media Items grid as a one-pick picker: click a tile, then Use image (or double-click).",
         m.edit_row("Thumbnail", "media")),
        ("Type=Sort", "Sort Order, 73 real Insights articles. Drag by the grip, ↑ ↓ one place, ⤒ ⤓ to the ends, or type a position. Search pauses drag. This article is highlighted and scrolled into view.",
         m.edit_row("Sort Order", "lookup", "", modal="modal-sort", placeholder=rec.SORT_POSITION)),
    ]
    html = f'''<!doctype html>
<!-- GENERATED by src/cc/templates/RecordScreen/_generate.py — edit the .py, not this file. -->
<html lang="en" data-brand="cc">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="../../../components/dark-mode-toggle.js"></script>
  <title>Selector — Control Centre</title>
{css}  <style>
    body {{ margin: 0; padding: var(--ai-spacing-7); background: var(--cc-ui-primary-bg); min-height: 100vh; color: var(--ai-text-primary); font-family: var(--ai-font-body); }}
    .demo-section {{ padding: var(--ai-spacing-6); background: var(--ai-surface-primary); border: 1px solid var(--ai-border-secondary); border-radius: var(--ai-radius-lg); margin-bottom: var(--ai-spacing-5); }}
    .demo-section__title {{ font-size: var(--ai-font-fixed-xs); font-weight: var(--ai-font-semibold); color: var(--ai-text-contrast); text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 var(--ai-spacing-3); }}
    .demo-note {{ margin: 0 0 var(--ai-spacing-5); font-size: var(--ai-font-fixed-xs); color: var(--ai-text-secondary); }}
  </style>
</head>
<body>
  <h1>Selector</h1>
{"".join(sec(t, n, i) for t, n, i in rows)}
  {rec.modals()}

  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
  <script>lucide.createIcons();</script>
  <script src="../TagBox/TagBox.js"></script>
  <script src="../../components/MediaPicker/MediaPicker.js"></script>
  <script src="Selector.js"></script>
</body>
</html>
'''
    open(os.path.join(HERE, "../../patterns/Selector/Selector.html"), "w", encoding="utf-8").write(html)
    print("wrote Selector.html", len(html))


write_selector_demo()


# ── PromptModifier demo (src/cc/patterns/PromptModifier/PromptModifier.html) — built from the same
#    builders + live prompts as ArticleEdit's Social / Article Questions / Summary sections.
def write_prompt_demo():
    css = "".join(f'  <link rel="stylesheet" href="{h}">\n' for h in [
        "../../../styles/base.css", "../../../components/Button/Button.css", "../../../components/Input/Input.css",
        "../../../components/Textarea/Textarea.css", "../../components/FieldRow/FieldRow.css",
        "../RecordSection/RecordSection.css", "PromptModifier.css"])
    sections = "".join(m.record_section(t, [rec._edit(f) for f in fields], "edit", prompt=rec._prompt(t))
                       for t, fields in rec.SECTIONS if t in rec.PROMPTS)
    html = f'''<!doctype html>
<!-- GENERATED by src/cc/templates/RecordScreen/_generate.py — edit the .py, not this file. -->
<html lang="en" data-brand="cc">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="../../../components/dark-mode-toggle.js"></script>
  <title>PromptModifier — Control Centre</title>
{css}  <style>
    body {{ margin: 0; padding: var(--ai-spacing-7); background: var(--cc-ui-primary-bg); min-height: 100vh; color: var(--ai-text-primary); font-family: var(--ai-font-body); }}
    .demo-stack {{ display: flex; flex-direction: column; gap: var(--ai-spacing-5); max-width: var(--ai-size-12); }}
    .demo-note {{ margin: 0 0 var(--ai-spacing-5); font-size: var(--ai-font-fixed-xs); color: var(--ai-text-secondary); max-width: var(--ai-size-12); }}
  </style>
</head>
<body>
  <h1>PromptModifier</h1>
  <p class="demo-note">The AI prompt on a record section, with live's own prompts (Social, Article Questions, Summary). Generate fills the section's fields with canned demo results and offers Undo. Edit prompt opens the full prompt and Copy prompt.</p>
  <div class="demo-stack">{sections}</div>
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
  <script>lucide.createIcons();</script>
  <script src="PromptModifier.js"></script>
</body>
</html>
'''
    open(os.path.join(HERE, "../../patterns/PromptModifier/PromptModifier.html"), "w", encoding="utf-8").write(html)
    print("wrote PromptModifier.html", len(html))


write_prompt_demo()
