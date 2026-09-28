"""Markup fragments for the record screens (Article View / Edit / Steps).

ONE source for every fragment: _generate.py builds the three templates from these, and the
component demos were generated from the same functions, so a demo can never show markup the
screen does not render (feedback: a renderer silently drops component markup).

Figma: Lus07xi8pPXLN87sQIyrEt · View & Edit page (3842:146669) · kit section 3861:1902.
Content is what the Figma screens show; step titles/openings are the Hub rows in
steps_data.py (copied from the ArticleSteps prototype; content only — no styling is taken from it).
"""
from html import escape as e

IMG = "../../../../img/record/article-thumb.jpg"  # relative to src/cc/templates/RecordScreen/
PARA_SEP = "\n\n"


def icon(name, cls=""):
    c = f' class="{cls}"' if cls else ""
    return f'<i data-lucide="{name}"{c} aria-hidden="true"></i>'


def btn(label, kind="secondary", size="", icon_left=None, icon_only=False, attrs="", tag="button", href="#"):
    cls = f"btn btn--{kind}" + (f" btn--{size}" if size else "") + (" btn--icon" if icon_only else "")
    inner = (icon(icon_left) if icon_left else "") + ("" if icon_only else f"<span>{e(label)}</span>")
    aria = f' aria-label="{e(label)}"' if icon_only else ""
    if tag == "a":
        return f'<a class="{cls}" href="{href}"{aria}{attrs}>{inner}</a>'
    return f'<button type="button" class="{cls}"{aria}{attrs}>{inner}</button>'


def chip(label, kind="tertiary", size="xs"):
    """Linked value chip — Button Tertiary xs (view tags, viewer companies)."""
    return btn(label, kind, size, tag="a")


# ── RecordHeader → CC Header Type=Record ─────────────────────────────
def record_header(record_type, title, mode):
    if mode == "edit":
        actions = (btn("Cancel", "secondary", tag="a", href="ArticleView.html", attrs=' data-keep-width')
                   + btn("Save", "primary", icon_left="check"))
    else:
        actions = (btn("Add", "secondary")
                   + btn("Edit", "primary", icon_left="pencil", tag="a", href="ArticleEdit.html", attrs=' data-keep-width'))
    return f'''<div class="cc-header-cq">
        <header class="cc-header cc-header--record">
          <div class="cc-header__title-block">
            <div class="cc-header__title-block-text">
              <p class="cc-header__record-type">{e(record_type)}</p>
              <h1 class="cc-header__title">{e(title)}</h1>
            </div>
          </div>
          <div class="cc-header__actions">{actions}</div>
        </header>
        </div>'''


# ── RecordTabs ───────────────────────────────────────────────────────
def record_tabs(active, steps_count=8, actions=False, back="ArticleView.html"):
    def tab(label, href, is_active, count=None):
        cur = ' aria-current="page"' if is_active else ""
        cls = "record-tab record-tab--active" if is_active else "record-tab"
        c = f'<span class="record-tab__count" aria-label="{count} steps">{count}</span>' if count is not None else ""
        return f'<a class="{cls}" href="{href}"{cur} data-keep-width>{e(label)}{c}</a>'
    acts = ""
    if actions:
        acts = ('<div class="record-tabs__actions">'
                + btn("Lookup", "secondary", "sm", attrs=' data-backend-todo="steps-lookup"')
                + btn("Add", "primary", "sm", icon_left="plus", attrs=' data-backend-todo="steps-add"')
                + '</div>')
    return f'''<nav class="record-tabs" aria-label="Record sections">
        <div class="record-tabs__list">
          {tab("Details", back, active == "details")}
          {tab("Article steps", "ArticleSteps.html", active == "steps", steps_count)}
        </div>{acts}
      </nav>'''


# ── MediaMeta / MediaPicker ──────────────────────────────────────────
MEDIA = [("Alt text", "Affino 9.0.11.25 - The Refinement Update"), ("File name", "ai-1786980189773-12-4bd8a8.jpg"),
         ("File size", "108 KB"), ("Dimensions", "800 × 800")]


def media_meta(src=IMG):
    rows = "".join(f'<dt class="media-meta__term">{e(a)}</dt><dd class="media-meta__value">{e(b)}</dd>' for a, b in MEDIA)
    return f'''<div class="media-meta">
              <img class="media-meta__thumb" src="{src}" alt="{e(MEDIA[0][1])}">
              <dl class="media-meta__list">{rows}</dl>
            </div>'''


def media_picker(label, src=None):
    thumb = f'<img src="{src}" alt="">' if src else icon("image")
    return f'''<div class="media-picker">
              <span class="media-picker__thumb">{thumb}</span>
              <div class="media-picker__actions">
                {btn("Edit", "secondary", "sm", icon_left="pencil", attrs=f' aria-label="Choose {e(label)}"')}
                {btn(f"Remove {label}", "secondary", "sm", icon_left="trash-2", icon_only=True)}
              </div>
            </div>'''


# ── FieldRow (view) ──────────────────────────────────────────────────
def view_row(label, kind, value=None, compact=False):
    mods = ["field-row"]
    if compact:
        mods.append("field-row--compact")
    if kind in ("paragraph", "media"):
        mods.append(f"field-row--{kind}")
    if kind == "tags":
        val = '<div class="field-row__tags">' + "".join(chip(t) for t in value) + '</div>'
    elif kind == "media":
        val = media_meta()
    elif kind == "paragraph":
        paras = value if isinstance(value, list) else [value]
        val = "".join(f"<p>{e(p)}</p>" for p in paras)
    else:
        val = e(value)
    return f'''<div class="{' '.join(mods)}">
            <dt class="field-row__label">{e(label)}</dt>
            <dd class="field-row__value">{val}</dd>
          </div>'''


# ── FieldRow (edit) ──────────────────────────────────────────────────
_uid = [0]


def _id(label):
    _uid[0] += 1
    return "f-" + "".join(ch for ch in label.lower() if ch.isalnum())[:24] + f"-{_uid[0]}"


def edit_row(label, kind, value="", required=False, help_text=None, tags=None, modal=None):
    fid = _id(label)
    req = '<span class="field-row__required" aria-hidden="true">*</span>' if required else ""
    reqattr = " required aria-required=\"true\"" if required else ""
    if kind == "input":
        help_html = f'<span class="input__help" id="{fid}-help">{e(help_text)}</span>' if help_text else ""
        desc = f' aria-describedby="{fid}-help"' if help_text else ""
        ctl = f'''<div class="input">
              <div class="input__wrap"><input id="{fid}" type="text" class="input__control" value="{e(value)}"{reqattr}{desc}></div>
              {help_html}
            </div>'''
    elif kind == "select":
        placeholder = not value or value == "Select..."
        shown = "Select..." if placeholder else value
        vcls = "sel__value sel__value--placeholder" if placeholder else "sel__value"
        ctl = f'''<div class="sel" data-sel>
              <button id="{fid}" class="sel__control" type="button" data-sel-trigger aria-haspopup="listbox">
                <span class="{vcls}">{e(shown)}</span>
                <span class="sel__chevron">{icon("chevron-down")}</span>
              </button>
              <ul class="sel__menu" role="listbox">
                <li><button type="button" class="sel__menu-item{' sel__menu-item--selected' if not placeholder else ''}" role="option">{e(shown)}</button></li>
              </ul>
            </div>'''
        # TODO(backend:RecordScreen): select options are the current value only → option source per field
    elif kind == "textarea":
        paras = value if isinstance(value, list) else [value]
        ctl = f'''<div class="textarea">
              <textarea class="textarea__control" id="{fid}" rows="{8 if len(paras) > 1 else 4}">{PARA_SEP.join(e(p) for p in paras)}</textarea>
            </div>'''
    elif kind == "tagbox":
        items = "".join(f'''<li class="badge badge--neutral"><span>{e(t)}</span><button type="button" class="badge__close" aria-label="Remove {e(t)}">{icon("x")}</button></li>''' for t in tags)
        ctl = f'''<div class="tag-box" data-tag-box>
              <ul class="tag-box__tags" id="{fid}" aria-label="{e(label)}" data-empty="None selected">{items}</ul>
              {btn("Select", "secondary", "sm", attrs=f' data-tag-box-select="{modal}" aria-haspopup="dialog"')}
            </div>'''
    elif kind == "media":
        ctl = media_picker(label)
    lab_tag = "label" if kind in ("input", "textarea") else "span"
    lab_for = f' for="{fid}"' if kind in ("input", "textarea") else f' id="{fid}-label"'
    return f'''<div class="field-row field-row--edit">
            <{lab_tag} class="field-row__label"{lab_for}>{e(label)}{req}</{lab_tag}>
            <div class="field-row__value">{ctl}</div>
          </div>'''


# ── RecordSection ────────────────────────────────────────────────────
def record_section(title, rows_html, mode):
    sid = "sec-" + "".join(ch for ch in title.lower() if ch.isalnum())
    body_tag = "dl" if mode == "view" else "div"
    return f'''<section class="record-section" aria-labelledby="{sid}">
          <div class="record-section__header"><h2 class="record-section__title" id="{sid}">{e(title)}</h2></div>
          <{body_tag} class="record-section__body">{''.join(rows_html)}</{body_tag}>
        </section>'''


# ── FactPanel / FactList ─────────────────────────────────────────────
def fact_panel(title, content, subtitle=None, badge=None, action=None):
    pid = "panel-" + "".join(ch for ch in title.lower() if ch.isalnum())
    sub = f'<p class="fact-panel__subtitle">{e(subtitle)}</p>' if subtitle else ""
    trail = ""
    if badge or action:
        b = f'<span class="badge badge--pill badge--success"><span class="badge__dot"></span><span>{e(badge)}</span></span>' if badge else ""  # Badge Type=Indicator (designer, 2026-09-28)
        trail = f'<div class="fact-panel__trailing">{b}{action or ""}</div>'
    return f'''<section class="fact-panel" aria-labelledby="{pid}">
          <div class="fact-panel__header">
            <div class="fact-panel__title-block"><h2 class="fact-panel__title" id="{pid}">{e(title)}</h2>{sub}</div>{trail}
          </div>
          {content}
        </section>'''


def fact_list(rows):
    out = []
    for label, v in rows:
        out.append(view_row(label, "tags" if isinstance(v, list) else "text", v, compact=True))
    return f'<dl class="fact-list">{"".join(out)}</dl>'


# ── ViewerItem / ViewerList ──────────────────────────────────────────
def viewer_item(name, role, time, companies, seed):
    chips = "".join(chip(c) for c in companies)
    return f'''<li class="viewer-item">
              <div class="avatar"><img class="portrait" src="https://i.pravatar.cc/64?u={seed}" alt=""></div>
              <div class="viewer-item__body">
                <div class="viewer-item__identity">
                  <div class="viewer-item__who"><p class="viewer-item__name">{e(name)}</p><p class="viewer-item__role">{e(role)}</p></div>
                  <p class="viewer-item__time">{e(time)}</p>
                </div>
                <div class="viewer-item__companies">{chips}</div>
              </div>
            </li>'''


VIEWERS = [("Simon Hassell", "Principal, Argutus Consulting", "5 days, 18hrs", ["Argutus", "Playbook Media Trading Company"], "simon"),
           ("David Delawa", "VP of Media, Ocean Media Group Ltd", "5 days, 18hrs", ["Ocean Media Group Ltd"], "david")]


def viewer_list():
    items = "".join(viewer_item(*v) for v in VIEWERS)
    return f'''<div class="viewer-list">
            <ul class="viewer-list__items">{items}</ul>
            <!-- TODO(backend:RecordScreen): "Add to Contact List" → add the viewers to a contact list (list picker + POST) -->
            {btn("Add to Contact List", "secondary", "sm", attrs=' data-backend-todo="viewers-add-to-contact-list"')}
          </div>'''


# ── AdvisoryItem / AdvisoryList ──────────────────────────────────────
ADVISORIES = [("No social sharelines entered", "Enter alternative versions of the title for visitors to easily share your content.", True),
              ("No topics selected", "Add topics and keywords so this article appears in related listings and search.", False),  # placeholder copy — Figma draws only the first description
              ("Use subheadings (H2, H3) in the Main Body", "Break the Main Body into sections with H2 and H3 headings to help readers and search engines scan it.", False)]  # placeholder copy


def advisory_item(i, title, desc, expanded):
    did = f"advisory-{i}"
    cls = "advisory-item advisory-item--expanded" if expanded else "advisory-item"
    body = f'<p class="advisory-item__description" id="{did}">{e(desc)}</p>' if desc else f'<p class="advisory-item__description" id="{did}" data-backend-todo="seo-advisory-detail"></p>'
    verb = "Hide details: " if expanded else "Show details: "
    return f'''<li class="{cls}">
              <div class="advisory-item__row">
                {icon("circle-alert", "advisory-item__icon")}
                <p class="advisory-item__title">{e(title)}</p>
                <button type="button" class="btn btn--secondary btn--xs btn--icon advisory-item__toggle" data-advisory-toggle aria-expanded="{'true' if expanded else 'false'}" aria-controls="{did}" aria-label="{verb}{e(title)}">{icon("plus", "advisory-item__plus")}{icon("minus", "advisory-item__minus")}</button>
              </div>
              {body}
            </li>'''


def advisory_list():
    # TODO(backend:RecordScreen): advisories + their descriptions come from the SEO health check → SEO health endpoint
    return '<ul class="advisory-list">' + "".join(advisory_item(i + 1, *a) for i, a in enumerate(ADVISORIES)) + '</ul>'


# ── PerformanceSummary ───────────────────────────────────────────────
def stat(title, value, colour, ico):
    return f'''<div class="stat-card stat-card--sm stat-card--{colour} stat-card--soft">
                <div class="stat-card__icon-wrap">{icon(ico)}</div>
                <div class="stat-card__text"><p class="stat-card__title">{e(title)}</p><p class="stat-card__value">{e(value)}</p></div>
              </div>'''


def performance_summary(canvas_id="perf-chart"):
    chips = "".join(chip(c, "secondary", "xs") for c in ["Ocean Media Group", "Playbook Media", "Argutus"])
    return f'''<div class="performance-summary">
            <div class="performance-summary__stats">
              {stat("Total Impressions", "330", "violet-radix", "chart-no-axes-combined")}
              <div class="performance-summary__stats-row">
                {stat("Consumed", "4.68", "indigo", "eye")}
                {stat("Bookmarked", "48", "jade", "book-open")}
              </div>
              <div class="performance-summary__accounts">
                <p class="performance-summary__accounts-heading">Top Account Impressions</p>
                <div class="performance-summary__account-chips">{chips}</div>
              </div>
            </div>
            <div class="performance-summary__chart">
              <div class="chart"><div class="chart__canvas"><canvas id="{canvas_id}" aria-label="Impressions, last 7 days" role="img"></canvas></div></div>
            </div>
            <dl class="performance-summary__totals">
              <div class="performance-summary__total"><dt>Total Impressions</dt><dd>89</dd></div>
              <div class="performance-summary__total"><dt>Impression Per Day</dt><dd>4.68</dd></div>
            </dl>
            <!-- TODO(backend:RecordScreen): "View full analytics" → the record's analytics report URL -->
            <a class="performance-summary__link" href="#" data-backend-todo="performance-full-analytics"><span>View full analytics</span>{icon("arrow-right")}</a>
          </div>'''


# ── Sidebar ──────────────────────────────────────────────────────────
FACTS = {
    "Record": [("Article Code", "626353"), ("Batch Reference", "—")],
    "Meta Information": [("Publisher", "Affino"), ("Creator", ["Markus Karlsson"]), ("Rights", "Markus Karlsson"),
                         ("Date", "17:03 02 September 2026"), ("Language", "English")],
    "Index Status": [("Site Search", "03/09/2026 08:32"), ("Affino.com Assistant", "03/09/2026 08:33")],
    "Audit": [("Created", "02/09/2026 17:03"), ("Created by", ["Markus Karlsson"]), ("Last updated", "03/09/2026 08:32"),
              ("Last updated by", ["Luis Montiel"]), ("Last view", "22/09/2026 03:21"), ("Impressions", "89")],
}


def sidebar(canvas_id="perf-chart"):
    expand = '<button type="button" class="btn btn--secondary btn--xs" data-advisory-expand-all aria-expanded="false"><span>Expand all</span></button>'
    return "".join([
        fact_panel("Performance", performance_summary(canvas_id), subtitle="Last 12 Months", badge="LIVE"),
        fact_panel("Recent Viewers", viewer_list()),
        fact_panel("Record", fact_list(FACTS["Record"])),
        fact_panel("SEO Health", advisory_list(), action=expand),
        fact_panel("Meta Information", fact_list(FACTS["Meta Information"])),
        fact_panel("Index Status", fact_list(FACTS["Index Status"])),
        fact_panel("Audit", fact_list(FACTS["Audit"])),
    ])


# ── Record content (Article) ─────────────────────────────────────────
TITLE = "Affino 9.0.11.25 - The Refinement Update"
INTRO = ("Affino 9.0.11.25, The Refinement Update, puts the work into the platform you already run: exports and reports "
         "that finish on real data, screens that hold your place as you move through them, sharper defences in front of "
         "your site, a one-tap unsubscribe for your recipients, and a new Orders API your other systems can read.")
ENTRY = ["Affino 9.0.11.25, The Refinement Update, puts the work into the platform you already run. Exports and reports "
         "finish on real data, screens hold your place as you move through them, the defences in front of your site are "
         "sharper, and your recipients get a one-tap unsubscribe.",
         "Five headline updates lead the release. We rebuilt more than twenty exports this release, spanning content, "
         "commerce, subscriptions, CRM, analytics, ad serving, events, and messaging, along with the listings and reports "
         "behind them."]
PAGE_DESC = ("Exports and reports that finish on real data, screens that hold your place, sharper defences against bots "
             "and spoofing, a one-tap unsubscribe your recipients can actually find, and a new Orders API.")


def view_sections():
    return "".join([
        record_section("Navigation", [view_row("Zone", "tags", ["Affino"]), view_row("Section", "tags", ["Affino Social Commerce Blog"]),
                                      view_row("Sort Order", "text", "1"), view_row("Multi Display", "tags", ["Coronavirus Hub", "AI", "Insight & Blogs"]),
                                      view_row("Priority", "text", "-")], "view"),
        record_section("Introduction", [view_row("Title", "text", TITLE), view_row("Screen Name", "text", "affino-901125-the-refinement-update"),
                                        view_row("Alt Title", "text", "-"), view_row("Thumbnail", "media")], "view"),
        record_section("Main Body", [view_row("Alignment", "text", "Center"), view_row("Main Image", "media"),
                                     view_row("Blog Intro", "paragraph", INTRO), view_row("Blog Entry", "paragraph", ENTRY)], "view"),
        record_section("Topics", [view_row("Category Topic", "tags", ["Affino"]),
                                  view_row("Topic & Keywords", "tags", ["Affino Social Commerce Blog", "Affino", "Saas"])], "view"),
        record_section("SEO", [view_row("Page Title", "text", TITLE), view_row("Page Description", "paragraph", PAGE_DESC)], "view"),
        record_section("Social", [view_row(f"Shareline {i}", "text", "-") for i in (1, 2, 3)], "view"),
    ])


def edit_sections():
    return "".join([
        record_section("Navigation", [edit_row("Zone", "select", "Affino", required=True), edit_row("Section", "select", "Affino Social Commerce Blog", required=True),
                                      edit_row("Sort Order", "input", "1"),
                                      edit_row("Multi Display", "tagbox", tags=["Coronavirus Hub", "AI", "Insight & Blogs"], modal="modal-multi-display"),
                                      edit_row("Priority", "select", "")], "edit"),
        record_section("Introduction", [edit_row("Title", "input", TITLE, required=True),
                                        edit_row("Screen Name", "input", "affino-901125-the-refinement-update", help_text="Used in the article URL."),
                                        edit_row("Alternative Title", "input", ""), edit_row("Thumbnail", "media")], "edit"),
        record_section("Main Body", [edit_row("Alignment", "select", "Center"), edit_row("Main Image", "media"),
                                     edit_row("Blog Intro", "textarea", INTRO), edit_row("Blog Entry", "textarea", ENTRY)], "edit"),
        record_section("Topics", [edit_row("Category Topic", "select", ""),
                                  edit_row("Topics and Keywords", "tagbox", tags=["Platform", "Release", "Security"], modal="modal-topics")], "edit"),
        record_section("SEO", [edit_row("Page Title", "input", TITLE), edit_row("Page Description", "textarea", PAGE_DESC)], "edit"),
        record_section("Social", [edit_row(f"Shareline {i}", "input", "") for i in (1, 2, 3)], "edit"),
    ])


# ── Multi Select Modal (FilterDropdowns Type=Multi Select Modal) ─────
SECTIONS_SOURCE = [("Coronavirus Hub", "", "Coronavirus Hub", "Affino"), ("AI", "", "AI", "Affino"), ("Insight & Blogs", "", "Insight & Blogs", "Affino"),
                   ("Commercial Hub", "", "Commercial Hub", "Affino"), ("Events", "", "Events", "Affino"), ("Affino Social Commerce Blog", "", "Blog", "Affino")]
TOPICS_SOURCE = [("Platform", "", "Topics", "Affino"), ("Release", "", "Topics", "Affino"), ("Security", "", "Topics", "Affino"),
                 ("Affino", "", "Topics", "Affino"), ("Saas", "", "Topics", "Affino"), ("Analytics", "", "Topics", "Affino")]


def multi_select_modal(mid, title, source):
    facets = "".join(f'''<div class="filter-item filter-item--empty filter-item--rounded" data-filter-name="{e(f)}"><button type="button" class="filter-item__trigger" aria-expanded="false">{icon("plus", "filter-item__add")}<span class="filter-item__name">{e(f)}</span></button></div>'''
                     for f in ["Name", "Parent Section", "Channel", "Zone"])
    cb = lambda lbl: f'<label class="checkbox"><input type="checkbox" class="checkbox__input" aria-label="{e(lbl)}"><span class="checkbox__indicator">{icon("check")}</span></label>'
    rows = "".join(f'<tr><td>{cb("Select " + n)}</td><td>{e(n)}</td><td>{e(p) or "—"}</td><td>{e(c)}</td><td>{e(z)}</td><td><a class="filter-dropdowns__linkcell" href="#" aria-label="Open {e(n)}">{icon("external-link")}</a></td></tr>' for n, p, c, z in source)
    return f'''<div class="modal-overlay" id="{mid}" role="presentation">
    <div class="modal filter-dropdowns__modal" role="dialog" aria-modal="true" aria-labelledby="{mid}-title">
      <div class="modal__header">
        <h2 class="modal__title" id="{mid}-title">{e(title)}</h2>
        <button class="modal__close" type="button" aria-label="Close">{icon("x")}</button>
      </div>
      <div class="filter-dropdowns__facets filter-dropdowns__modal-facets">{facets}</div>
      <div class="filter-dropdowns__table-region">
        <div class="datatables"><div class="datatables__body">
          <table class="table">
            <thead><tr>
              <th class="datatables__col--tight">{cb("Select all")}</th>
              <th><button class="datatables__sort datatables__sort--active" type="button">Name {icon("chevrons-up-down")}</button></th>
              <th><button class="datatables__sort" type="button">Parent Section {icon("chevrons-up-down")}</button></th>
              <th><button class="datatables__sort" type="button">Channel {icon("chevrons-up-down")}</button></th>
              <th><button class="datatables__sort" type="button">Zone {icon("chevrons-up-down")}</button></th>
              <th class="datatables__col--tight" aria-label="Open"></th>
            </tr></thead>
            <tbody>{rows}</tbody>
          </table>
        </div></div>
      </div>
      <div class="modal__footer">
        <button type="button" class="btn btn--secondary" data-modal-cancel>Cancel</button>
        <button type="button" class="btn btn--primary" data-filter-dropdowns-apply>Apply</button>
      </div>
    </div>
  </div>'''


# ── StepsTable ───────────────────────────────────────────────────────
COLS = [("Order", True), ("Title", True), ("Type", True), ("Float", True), ("Design frame", False), ("Lookup", False),
        ("Created by", True), ("Publish start", True), ("Live", False)]


def step_detail(body_html):
    chips = "".join(f'<li class="step-detail__chip">{icon(i)}{e(t)}</li>' for i, t in [("image-off", "No step image"), ("image-off", "No presentation image"), ("film", "No multimedia")])
    return f'''<div class="step-detail">
                <ul class="step-detail__media" aria-label="Step media">{chips}</ul>
                <div class="step-detail__body">{body_html}</div>
                <a class="step-detail__link" href="#" data-backend-todo="steps-read-full">Read the full step {icon("arrow-right")}</a>
              </div>'''


def steps_table(steps, total=21):
    cb = lambda lbl, attr: f'<label class="checkbox"><input type="checkbox" class="checkbox__input" aria-label="{e(lbl)}" {attr}><span class="checkbox__indicator">{icon("check")}</span></label>'
    head = "".join(
        (f'<th><button class="datatables__sort{" datatables__sort--active" if i == 0 else ""}" type="button">{e(n)} {icon("chevron-up" if i == 0 else "chevrons-up-down")}</button></th>'
         if s else f'<th>{e(n)}</th>') for i, (n, s) in enumerate(COLS))
    rows = []
    for i, (title, body) in enumerate(steps, 1):
        rows.append(f'''<tr class="datatables__row">
              <td class="datatables__col--tight">{cb("Select step " + str(i), "data-steps-select")}</td>
              <td>{i}</td>
              <td class="steps-table__title-cell"><a class="steps-table__title" href="#" title="{e(title)}">{e(title)}</a></td>
              <td>Content</td><td>None</td>
              <td><span class="steps-table__empty" aria-label="None">{icon("minus")}</span></td>
              <td><span class="steps-table__empty" aria-label="None">{icon("minus")}</span></td>
              <td><a class="btn btn--tertiary btn--sm steps-table__author-chip" href="#"><span>Markus Karlsson</span></a></td>
              <td>20 Jul 2026</td>
              <td><span class="steps-table__live" aria-label="Live">{icon("check")}</span></td>
              <td class="datatables__col--tight"><a class="datatables__row-edit" href="#" aria-label="Edit step {i}">{icon("pencil")}</a></td>
            </tr>
            <tr class="datatables__row-detail"><td colspan="11" class="datatables__row-detail__cell">{step_detail(body)}</td></tr>''')
    return f'''<div class="datatables steps-table" data-steps-table>
        <div class="datatables__toolbar">
          <span class="datatables__meta"><span>Show</span>
            <button type="button" class="datatables__select" aria-label="Rows per page"><span>20</span>{icon("chevron-down")}</button>
            <span>of <strong>{total}</strong></span></span>
          <div class="datatables__actions">
            <span class="steps-table__details-toggle">
              <button class="toggle toggle--xxs" type="button" role="switch" aria-checked="false" aria-labelledby="steps-details-label" data-steps-details><span class="toggle__track"><span class="toggle__knob"></span></span></button>
              <span id="steps-details-label">Show details</span>
            </span>
          </div>
        </div>
        <div class="datatables__body">
          <table class="table">
            <thead><tr><th class="datatables__col--tight">{cb("Select all steps", "data-steps-select-all")}</th>{head}<th class="datatables__col--tight" aria-label="Edit"></th></tr></thead>
            <tbody>{''.join(rows)}</tbody>
          </table>
        </div>
        <div class="datatables__footer">
          <span>Showing <strong>1–{len(steps)}</strong> of <strong>{total}</strong> results</span>
          <div class="datatables__pagination" role="group" aria-label="Pagination">
            <button class="datatables__page-btn" aria-label="Previous">{icon("chevron-left")}</button>
            <button class="datatables__page-btn datatables__page-btn--active" aria-current="page">1</button>
            <button class="datatables__page-btn">2</button>
            <button class="datatables__page-btn" aria-label="Next">{icon("chevron-right")}</button>
          </div>
        </div>
      </div>'''
