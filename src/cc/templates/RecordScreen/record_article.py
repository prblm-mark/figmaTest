"""The record the View / Edit screens render: affino.com Standard Item 626312.

"How charities can use Affino AI plugins" — read 2026-09-29 from
`https://www.affino.com/control/standard-item-edit?Action=view&StandardItemCode=626312` (logged-in
session, READ ONLY: nothing edited or saved). It replaced sf.affino.com 10007 (designer, 2026-09-29)
because it is a real, fully written article: real body copy, image metadata, article questions,
a summary, stats, audit and index status.

ONE table drives both screens — each field is (label, view kind, view value, edit kind, edit value
[, extra]) — so View and Edit cannot disagree. Every live main-column section is here in the live
order; the live Stats / Recent Viewers / Meta Information / Audit / Index Status sections are the
sidebar panels (FACTS / PERF / VIEWERS below). Empty live fields render "-" on View and an empty
control on Edit. View-mode check-marks were read from the live icons (TBY = yes, TBN = no).

Row kinds rich / checkbox / date / datetime / lookup / image / file are code-first — flagged for
Figma (record_markup.py, FieldRow.figma-notes.md).
"""
import record_markup as m

CODE = "626312"
# Its place in Insights' default (by title) order — the Sort Order field's placeholder.
from record_sort_data import INSIGHTS as _INS
SORT_POSITION = str([c for c, _ in _INS].index(int(CODE)) + 1)
TITLE = "How charities can use Affino AI plugins"
SCREEN_NAME = "how-charities-can-use-affino-ai-plugins"
STYLE = "Advanced Article - Insights"
TEASER = ("Affino’s AI plugins for charities: News AI, assistants, enhanced search, summaries, and article "
          "questions, added to the site you already have, no migration required.")
PAGE_DESCRIPTION = ("Affino's AI plugins for charities: News AI, assistants, enhanced search, summaries, and article "
                    "questions, added to the site you already have, no migration required.")
INTRODUCTION = [("p", "Affino offers a series of AI plugins charities can add to the site they already have, without "
                      "migrating: News AI, AI Assistants, AI Enhanced Search, Article Summaries, and Article Questions. "
                      "You feed your content in and the plugins appear on your pages. Here is how they connect, what "
                      "each does, and where to start.")]
MAIN_BODY = [("p", "Most charities now use AI, but the 2026 Charity Digital Skills Report shows most of it is individual "
                   "and ad hoc, with little of it reaching the supporter-facing work that changes outcomes. Affino closes "
                   "that gap with a series of AI plugins you add to the website you already have: high-impact AI "
                   "experiences that answer supporter questions, lift engagement, and take real load off your team. "
                   "There is no need to move your site to Affino."),
             ("p", "The current set is News AI, AI Assistants, AI Enhanced Search, Article Summaries, and Article "
                   "Questions. You can switch on one or several. Here is what each does for your charity, how they "
                   "connect to your site, and where to start.")]
SUMMARY = ("Affino's AI plugins bring high-impact AI to a charity's existing website: an assistant that answers "
           "supporter questions, AI-enhanced search, article summaries, smart follow-on questions, and a personalised "
           "news catch-up. They lift engagement, give faster answers, and take real load off small teams, with no need "
           "to move your site. Shown in practice for charities, with the full Affino platform to grow into.")
QUESTIONS = ["How do Affino AI plugins integrate without migrating your website?",
             "Which plugin resolved 95% of queries at National Deaf Children's Society?",
             "Which plugin gives readers personalised news catch-ups by interest and timeframe?",
             "What does the Article Summaries plugin produce for long reports?",
             "How do the plugins ensure charity data stays controlled and private?"]
IMAGE_ALT = ("A charity professional at a laptop with a friendly on-site AI assistant answering a supporter question, "
             "with search and summary panels and a connected-nodes motif")
IMAGE_FILE = [("Alt text", IMAGE_ALT), ("File name", "ai-1781548787494-12-31536f.jpg"),
              ("File size", "124 KB"), ("Dimensions", "1024 × 1024")]


def _img(align="Center", width="100%"):
    """The article's one real image (Thumbnail + Main Image carry the same asset live)."""
    rows = IMAGE_FILE + ([("Alignment", align), ("Width", width)] if align else [])
    # A thumbnail (no align / width) is alt text only; a content image has all four options.
    return ("media", rows, "image", {"src": True, "alt": IMAGE_ALT, "caption": "", "align": align or "Center",
                                     "width": width or "100%", "alt_only": align is None})


def _no_img(align="Center", width="100%"):
    return ("text", "-", "image", {"align": align or "Center", "width": width or "100%", "alt_only": align is None})


def _yn(on):
    return ("text", "Yes" if on else "No", "checkbox", on)


# (label, view_kind, view_value, edit_kind, edit_value[, tagbox modal / {required, help}])
SECTIONS = [
    ("Presentation Style", [
        ("Presentation Style", "text", STYLE, "select", STYLE),
    ]),
    ("Navigation", [
        ("Zone", "tags", ["Affino"], "select", "Affino"),
        ("Section", "tags", ["Insight"], "lookup", "Insight", {"modal": "modal-section"}),
        ("Sort Order", "text", "-", "lookup", "", {"modal": "modal-sort", "placeholder": SORT_POSITION}),
        ("Multi Display", "tags", ["Coronavirus Hub", "AI", "Insight & Blogs"], "tagbox",
         ["Coronavirus Hub", "AI", "Insight & Blogs"], "modal-multi-display"),
        # Live: blank + 1–30, nothing chosen on 626312 (read 2026-09-29).
        ("Priority", "text", "-", "select", "", {"options": ["Select..."] + [str(i) for i in range(1, 31)]}),
    ]),
    ("Introduction", [
        ("Title", "text", TITLE, "input", TITLE, {"required": True}),
        ("Screen Name", "text", SCREEN_NAME, "input", SCREEN_NAME, {"help": "Used in the article URL."}),
        ("Alternative Title", "text", "-", "input", ""),
        ("Thumbnail",) + _img(None, None),
        ("Alternative Thumbnail",) + _no_img(None, None),
        ("Teaser", "paragraph", TEASER, "textarea", TEASER),
        ("Call to Action", "text", "Book your free consultation", "input", "Book your free consultation"),
    ]),
    ("Topics", [
        ("Category Topic", "tags", ["AI"], "select", "AI"),
        ("Topics and Keywords", "tags", ["Professional Services", "Featured", "Tip", "Charity", "Funding"], "tagbox",
         ["Professional Services", "Featured", "Tip", "Charity", "Funding"], "modal-topics"),
    ]),
    ("SEO", [
        ("Page Title", "text", TITLE, "input", TITLE),
        ("Page Description", "paragraph", PAGE_DESCRIPTION, "textarea", PAGE_DESCRIPTION),
    ]),
    ("Main Body", [
        ("Main Image",) + _img("Center", "100%"),
        ("Label Image",) + _no_img(),
        ("Audio Version (MP3)", "text", "-", "file", ""),
        ("Introduction", "rich", INTRODUCTION, "rich", INTRODUCTION),
        ("Intro Image",) + _no_img("Left", "33%"),
        ("Image Top",) + _no_img("Right", "33%"),
        ("Main Body", "rich", MAIN_BODY, "rich", MAIN_BODY),
        ("Image 1",) + _no_img(),
        ("Image 2",) + _no_img(),
        ("Text 2", "text", "-", "rich", []),
        ("Image 3",) + _no_img(),
        ("Image 4",) + _no_img(),
        ("Text 3", "text", "-", "rich", []),
        ("Image 5",) + _no_img(),
        ("Image 6",) + _no_img(),
        ("Text 4", "text", "-", "rich", []),
        ("Base Image",) + _no_img(),
        ("Text 5", "text", "-", "rich", []),
        ("Background Image",) + _no_img(),
    ]),
    ("Geo Targeting", [
        ("Geo Targeting Type", "text", "None", "select", "None"),
        ("Countries", "text", "-", "tagbox", [], "modal-countries"),
    ]),
    ("Comments And Ratings", [
        ("Hide Comments And Ratings",) + _yn(False),
    ]),
    ("Options", [
        ("Sector", "text", "Professional Services", "select", "Professional Services"),
        ("Type", "text", "Tip", "select", "Tip"),
    ]),
    ("Advanced", [
        ("External Article ID", "text", "-", "input", ""),
        ("Article Code", "text", CODE, "input", CODE),
        ("Article Type", "text", "Insight", "select", "Insight"),
        ("Sponsored Article",) + _yn(False),
        ("Sponsor", "text", "-", "input", ""),
        ("Sponsor Link", "text", "-", "input", ""),
        ("Sponsor Open Link Option", "text", "New Tab", "select", "New Tab"),
        ("Quote", "text", "-", "textarea", ""),
        ("Step By Step Title", "text", "-", "input", ""),
        ("Info Box Title", "text", "-", "input", ""),
        ("Info Box Text", "text", "-", "textarea", ""),
        ("Info Box Auto Bullets",) + _yn(False),
        ("Multimedia", "text", "-", "multimedia", ""),
        ("Credits", "text", "-", "textarea", ""),
        ("Code", "text", "-", "textarea", ""),
    ]),
    ("Social", [(f"Shareline {i}", "text", "-", "input", "") for i in (1, 2, 3)]),
    ("Article Questions", [(f"Question {i}", "text", q, "input", q) for i, q in enumerate(QUESTIONS, 1)]),
    ("Summary", [
        ("Summary", "paragraph", SUMMARY, "textarea", SUMMARY),
    ]),
    ("Security", [
        ("Content Security Right", "text", "-", "select", ""),
    ]),
    ("Publication", [
        ("Creator", "tags", ["Markus Karlsson"], "lookup", "Markus Karlsson", {"modal": "modal-creator"}),
        ("Related Authors", "text", "-", "tagbox", [], "modal-authors"),
        ("Account", "text", "-", "lookup", ""),
        ("Publish Start", "text", "16/06/2026 12:23", "datetime", "16 Jun 2026 12:23"),
        ("Publish End", "text", "16/06/2126 12:23", "datetime", "16 Jun 2126 12:23"),
        # Live shows 01/01/1900 00:00 — the platform's "not set" value, rendered as unset here.
        ("Embargo End", "text", "-", "datetime", ""),
        ("Syndication",) + _yn(False),
        ("Send Via Content / Interest Subscriptions",) + _yn(False),
        ("Live",) + _yn(True),
        ("Private",) + _yn(False),
        ("Hide From Search Results",) + _yn(False),
        ("Exclude From AI Index",) + _yn(False),
        ("Moderated",) + _yn(False),
    ]),
]

# The live screen's own side sections, as the sidebar panels.
FACTS = {
    "Record": [("Article Code", CODE), ("Batch Reference", "—")],
    "Meta Information": [("Topics", ["Charity", "Featured", "Funding", "Professional Services", "Tip"])],
    "Index Status": [("Site Search", "16/06/2026 12:58"), ("Affino Support Assistant", "16/06/2026 12:57"),
                     ("Affino.com Assistant", "16/06/2026 12:58")],
    "Audit": [("Created", "16/06/2026 12:23"), ("Created by", ["Markus Karlsson"]), ("Last updated", "16/06/2026 12:57"),
              ("Last updated by", ["Markus Karlsson"]), ("Last view", "26/09/2026 02:18"), ("Impressions", "56")],
}
# Impressions 56 · Consumed 28 · Bookmarked 0 (last 12 months, live). Per day = 56 / 365, derived.
PERF = {"impressions": "56", "consumed": "28", "bookmarked": "0",
        "accounts": ["Affino", "Burning Nights CRPS Support"], "total": "56", "per_day": "0.15"}
# Live Recent Viewers (name, job title, viewed, account).
VIEWERS = [("Mark Foster", "Senior Creative", "20 Jul 2026", ["Affino"], "mark-foster"),
           ("Chris Bristow", "Technical Manager", "02 Jul 2026", ["Affino"], "chris-bristow"),
           ("Stefan Karlsson", "CMO Founder", "25 Jun 2026", ["Affino"], "stefan-karlsson"),
           ("Markus Karlsson", "CEO Founder", "24 Jun 2026", ["Affino"], "markus-karlsson"),
           ("Victoria Abbott-Fleming", "Founder & Chair", "17 Jun 2026", ["Burning Nights CRPS Support"], "victoria-af")]

COUNTRIES_SOURCE = [("United Kingdom", "", "Countries", "Affino"), ("Ireland", "", "Countries", "Affino"),
                    ("United States", "", "Countries", "Affino"), ("Canada", "", "Countries", "Affino"),
                    ("Australia", "", "Countries", "Affino"), ("Germany", "", "Countries", "Affino")]
AUTHORS_SOURCE = [("Markus Karlsson", "", "Authors", "Affino"), ("Luis Montiel", "", "Authors", "Affino"),
                  ("Mark Foster", "", "Authors", "Affino")]
TOPICS_SOURCE = [("Professional Services", "", "Sector", "Affino"), ("Featured", "", "Topics", "Affino"),
                 ("Tip", "", "Type", "Affino"), ("Charity", "", "Topics", "Affino"), ("Funding", "", "Topics", "Affino"),
                 ("AI", "", "Topics", "Affino"), ("Insight", "", "Topics", "Affino")]


# Single select (Section) — the live picker's first page (Zone Affino, by name, 2026-09-29), plus
# the article's own section. Live labels it "Insight"; its channel is Insights.
SECTION_SOURCE = [("Insight", "", "Insights", "Affino"), ("AI", "", "AI", "Affino"), ("Coronavirus Hub", "Insights", "Insights", "Affino"),
                  ("Insight & Blogs", "Insights", "Insights", "Affino"),
                  ("2013 Featured Affino Sites", "Links", "Links", "Affino"), ("2020 Affino February Roundtable Tabs", "Event Assets", "Event Assets", "Affino"),
                  ("About Resources", "Links", "Links", "Affino"), ("Active Affino Sites", "Links", "Links", "Affino"),
                  ("Add Review", "", "Add Review", "Affino"), ("Additional Services Links", "Links", "Links", "Affino"),
                  ("Affino 9 Assets", "", "Affino 9 Assets", "Affino"), ("Affino Beta Elements", "", "Affino Beta Elements", "Affino"),
                  ("Affino Case Studies", "", "Affino Case Studies", "Affino"), ("Affino Company Info", "", "Affino Company Info", "Affino"),
                  ("Affino Coverage", "", "Affino Coverage", "Affino"), ("Affino Customer Quotes", "", "Affino Customer Quotes", "Affino"),
                  ("Affino Deployment", "Affinovation", "Affino Online Guides", "Affino"), ("Affino Design Elements", "", "Affino Design Elements", "Affino"),
                  ("Affino Featured Clients", "", "Affino Featured Clients", "Affino"), ("Affino Features", "", "Affino Features", "Affino"),
                  ("Affino Features - Archived", "", "Affino Features - Archived", "Affino"), ("Affino Features X", "", "Affino Features X", "Affino"),
                  ("Affino for Event Organisers", "", "Affino for Event Organisers", "Affino"),
                  ("Affino for Membership Organisations", "", "Affino for Membership Organisations", "Affino")]


def _media_source(families=("image",)):
    """Selector tiles from the Media Items listing's rows (listing-data-media-items.js). Each row is
    read key by key, because documents carry no thumbUrl."""
    import re, os
    js = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../ListingScreen/listing-data-media-items.js"), encoding="utf-8").read()
    out = []
    for row in re.findall(r"\{ itemId: '\d+'[^}]*\}", js):
        f = dict(re.findall(r"(\w+): '([^']*)'", row))
        if f.get("family") not in families:
            continue
        thumb = f.get("thumbUrl", "").replace("/128", "/256")
        out.append((f["title"], thumb, f.get("format", ""), f.get("created", ""), f.get("section", ""), f.get("createdBy", ""), f["family"]))
    return out


MEDIA_SOURCE = _media_source()
# Multimedia takes any media item — video and documents as well as images (designer, 2026-09-29).
MULTIMEDIA_SOURCE = [r for r in _media_source(("video", "document"))] + _media_source()[:14]

from record_sort_data import INSIGHTS
SORT_SOURCE = [(c, t, m.IMG if c == int(CODE) else f"https://picsum.photos/seed/art{c}/80") for c, t in INSIGHTS]


def _view(f):
    return m.view_row(f[0], f[1], f[2])


def _edit(f, errors=None):
    label, _, _, kind, value = f[:5]
    if errors and label in errors:  # failed-Save demo: the submitted value + the validation message
        value, msg = errors[label]
        return m.edit_row(label, kind, value, required=(f[5] or {}).get("required", False) if len(f) > 5 and isinstance(f[5], dict) else False,
                          error=msg)
    extra = f[5] if len(f) > 5 else None
    if kind == "tagbox":
        return m.edit_row(label, "tagbox", tags=value, modal=extra)
    if kind == "checkbox":
        return m.edit_row(label, "checkbox", value)
    opts = extra if isinstance(extra, dict) else {}
    return m.edit_row(label, kind, value, required=opts.get("required", False), help_text=opts.get("help"),
                      modal=opts.get("modal"), placeholder=opts.get("placeholder", "None selected"),
                      options=opts.get("options"))


def view_sections():
    return "".join(m.record_section(t, [_view(f) for f in fields], "view") for t, fields in SECTIONS)


# AI prompt modifiers — live's own prompts (affino.com 626312, read 2026-09-29): ShareLineGenerationPrompt,
# QuestionGenerationPrompt, SummaryGenerationPrompt. The outputs are MOCK Generate results.
PROMPTS = {
    "Social": ("social", "Shareline prompt", "Fills Shareline 1–3",
               "Generate 3 promotional sharelines for the article below. Each shareline must be 11 words or fewer, "
               "compelling, and encourage readers to click through to the original article.",
               ["Give supporters instant answers without rebuilding your charity website.",
                "Six AI plugins that lighten the load on small charity teams.",
                "See how charities lift engagement with Affino's AI plugins."]),
    "Article Questions": ("questions", "Question prompt", "Fills Question 1–5",
               "Suggest 5 positive questions based on the key subjects of this article, keep each question no more than "
               "twelve words, no introduction. Do not create questions like 'what do you think?', instead it is more a case "
               "of 'how would this work'. Make sure that you ask a variety of different questions so that no two are similar. "
               "The questions should be phrased in a way that an expert system could answer if it had the content available. "
               "Check and update the questions to make sure they meet the criteria.",
               ["How do Affino AI plugins work with an existing charity website?",
                "Which plugin answers supporter questions on a charity's site?",
                "How does AI-enhanced search improve finding charity content?",
                "What do article summaries give readers of long reports?",
                "How is charity data kept private when plugins run?"]),
    "Summary": ("summary", "Summary prompt", "Fills Summary",
               "Summarise the following article in two to three short paragraphs using a clear, journalistic tone.\n"
               "Begin with one sentence summarising the main point (\u201cThe big picture\u201d).\n"
               "Then highlight the key facts, figures, and context that explain why it matters.\n"
               "Conclude with implications or next steps where relevant.\n\n"
               "Keep the summary under 200 words, concise, factual, and readable \u2014 like an Axios \u201cSmart Brevity\u201d piece.\n"
               "Avoid repetition, adjectives, or opinion; focus only on verified information.",
               ["The big picture: Affino's AI plugins bring an assistant, AI search and article summaries to a charity's "
                "existing website, with no migration.\n\nWhy it matters: small teams answer supporters faster and lift "
                "engagement, and the full Affino platform is there to grow into."]),
}


def _prompt(title):
    if title not in PROMPTS:
        return ""
    pid, name, fills, prompt, outputs = PROMPTS[title]
    return m.prompt_modifier("prompt-" + pid, name, fills, prompt, outputs)


# Q3 demo content (code-first, 2026-10-05; Hub TASK-531782). The help line stands in for text a
# workflow sets per section; 626312's own workflow sets none, so this copy is placeholder.
SECTION_HELP = {"Introduction": "The title and thumbnail appear wherever this article is listed. Keep the title under 70 characters."}
SAVE_ERRORS = {"Title": ("", "Enter a title."),
               "Screen Name": ("Affino 9.0.11.25!", "Use lowercase letters, numbers and hyphens only.")}
DUPLICATES = [("Affino 9.0.11.25 – The Refinement Update", "Affino Social Commerce Blog", "02/09/2026"),
              ("Affino 9.0.11 Release Notes", "Release Notes", "28/08/2026")]
SECTORS = [("Technology", "Software, data and digital roles."), ("Media & Publishing", "Editorial, commercial and production roles."),
           ("Finance", "Banking, insurance and accountancy roles."), ("Healthcare", "Clinical and care roles.")]


def edit_sections(errors=None, help_text=True):
    return "".join(m.record_section(t, [_edit(f, errors) for f in fields], "edit", prompt=_prompt(t),
                                    description=SECTION_HELP.get(t) if help_text else None) for t, fields in SECTIONS)


def sidebar(analytics=False):
    return m.sidebar(facts=FACTS, perf=PERF, viewers=VIEWERS, analytics=analytics)


def modals():
    return (m.single_select_modal("modal-section", "Select Section", SECTION_SOURCE)
            + m.single_select_modal("modal-creator", "Select Creator", AUTHORS_SOURCE, noun="creator")
            + m.media_select_modal("modal-media", "Select Media", MEDIA_SOURCE[:24], len(MEDIA_SOURCE))
            + m.media_select_modal("modal-multimedia", "Select Multimedia", MULTIMEDIA_SOURCE, len(MULTIMEDIA_SOURCE), apply_label="Use media")
            + m.sort_order_modal("modal-sort", "Sort Order", "Insight", SORT_SOURCE, int(CODE))
            + m.multi_select_modal("modal-multi-display", "Select Multi Display", m.SECTIONS_SOURCE)
            + m.multi_select_modal("modal-topics", "Select Topics and Keywords", TOPICS_SOURCE)
            + m.multi_select_modal("modal-countries", "Select Countries", COUNTRIES_SOURCE)
            + m.multi_select_modal("modal-authors", "Select Related Authors", AUTHORS_SOURCE))


FIELD_COUNT = sum(len(f) for _, f in SECTIONS)
