"""Generates the Export pattern pages (TASK-575621) on the ControlScreen shell.

    python3 src/cc/templates/ExportScreen/_generate.py

Edit THIS file, not the generated .html. A page = the ExportSystem shell + the export's own
filters (FieldRows from RecordScreen/record_markup.edit_row, grouped as v1 groups them), its
column presets and columns, and the summary. The behaviour is ExportScreen.js.

v1 rule of thumb for converting a screen: v1's "Comment" rows (CProperties type "cm") are the
group titles; every other row is a filter, EXCEPT rows that add columns (e.g. "Include Activity
Data", "Include All Subscription Plans") — those go to Columns › Also include — and format rows
("File Format", "Pipe delimit…") — those go to the summary's Format block.
"""
import os
import re
import sys
from html import escape as e

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "RecordScreen"))
from record_markup import edit_row, icon  # noqa: E402

SHELL = os.path.join(HERE, "..", "ExportSystem", "ExportSystem.html")


def group(title, rows, open_=False):
    gid = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return f'''<div class="acc__item{" acc__item--open" if open_ else ""}" data-xp-group="{gid}">
              <h3 class="acc__heading">
                <button type="button" class="acc__trigger" data-acc-trigger aria-controls="xp-g-{gid}">
                  <span class="cc-xp__group-title">{e(title)}<span class="badge badge--neutral" data-xp-group-count hidden></span></span>
                  <span class="acc__chevron">{icon("chevron-down")}</span>
                </button>
              </h3>
              <div class="acc__panel" id="xp-g-{gid}"><div class="cc-xp__rows">{"".join(rows)}</div></div>
            </div>'''


def radio(name, value, label_, helper, checked=False, extra=""):
    return f'''<label class="radio">
                  <input type="radio" class="radio__input" name="{name}" value="{value}"{" checked" if checked else ""}{extra}>
                  <span class="radio__indicator"></span>
                  <span class="radio__label"><span class="radio__label-text">{e(label_)}</span>{f'<span class="radio__helper">{e(helper)}</span>' if helper else ""}</span>
                </label>'''


def checkbox(label_, value="", attrs="", checked=False):
    return f'''<label class="checkbox">
                    <input type="checkbox" class="checkbox__input" value="{e(value)}"{attrs}{" checked" if checked else ""}>
                    <span class="checkbox__indicator">{icon("check")}</span>
                    <span class="checkbox__label"><span class="checkbox__label-text">{e(label_)}</span></span>
                  </label>'''


def columns_card(presets, columns, extras):
    total = sum(len(g["items"]) for g in columns)
    pr = "".join(radio("xp-cols", p["id"], p["label"], p["help"] + f' ({p["count"] if p["count"] != "all" else total} columns)', i == 0)
                 for i, p in enumerate(presets))
    pr += radio("xp-cols", "custom", "Choose columns", "Pick exactly which columns go in the file.")
    groups = ""
    for g in columns:
        gid = re.sub(r"[^a-z0-9]+", "-", g["group"].lower())
        boxes = "".join(checkbox(lbl, key, ' data-xp-col') for key, lbl in g["items"])
        groups += f'''<fieldset class="cc-xp__col-group" data-xp-col-group>
                <legend class="cc-xp__col-legend"><span id="xp-cg-{gid}">{e(g["group"])}</span>
                  {checkbox("All", "", f' data-xp-group-all aria-label="All {e(g["group"])} columns"')}</legend>
                <div class="cc-xp__cols">{boxes}</div>
              </fieldset>'''
    extras_html = f'''<div class="cc-xp__rows">{"".join(extras)}</div>''' if extras else ""
    return f'''<!-- TODO(backend:ExportScreen) export-columns: NEW in v3 (Mark, 2026-10-22). v1 has at most two
             presets → the export writes exactly the chosen columns, in this order; presets stay as v1's. -->
        <section class="record-section" aria-labelledby="xp-cols-title" data-xp-columns data-backend-todo="export-columns">
          <div class="record-section__header"><h2 class="record-section__title" id="xp-cols-title">Columns</h2></div>
          <div class="record-section__body">
            <div class="cc-xp__presets" role="radiogroup" aria-labelledby="xp-cols-title" data-xp-presets>{pr}</div>
            <div class="cc-xp__picker" data-xp-picker hidden>
              <div class="cc-xp__picker-head">
                <div class="input"><div class="input__wrap">{icon("search", "input__icon")}<input type="search" class="input__control" placeholder="Find a column" aria-label="Find a column" data-xp-col-search></div></div>
                <span class="cc-xp__picker-count" data-xp-col-count aria-live="polite"></span>
              </div>
              {groups}
              <p class="cc-xp__picker-empty" data-xp-col-empty hidden>No column matches that search.</p>
            </div>
            {extras_html}
          </div>
        </section>'''


def page(*, out, title, section, noun_plural, scope_row, groups, presets, columns, extras, format_extra, config):
    body = f'''<div class="cc-xp__result" data-xp-result aria-live="polite"></div>

      <!-- TODO(backend:ExportScreen) export-recent: rows are mock → this user's runs of this export
           (ScheduledTask by Type, own unless right 160) for the last 7 days, with status, progress and
           the finished file. NEW in v3: v1 only emails the link. -->
      <section class="record-section cc-xp__recent" aria-labelledby="xp-recent-title" data-xp-recent data-backend-todo="export-recent" hidden>
        <div class="record-section__header"><div class="cc-xp__title-row"><h2 class="record-section__title" id="xp-recent-title">Your recent exports</h2><span class="badge badge--neutral" data-xp-recent-count></span></div></div>
        <div class="record-section__body">
          <table class="table" aria-labelledby="xp-recent-title">
            <thead><tr><th scope="col">File</th><th scope="col">{e(noun_plural.capitalize())}</th><th scope="col">Format</th><th scope="col">Run by</th><th scope="col">Started</th><th scope="col">Status</th><th scope="col"><span class="cc-xp__sr">Download</span></th></tr></thead>
            <tbody></tbody>
          </table>
        </div>
      </section>

      <div class="cc-xp__layout">
        <div class="cc-xp__main">
          <!-- TODO(backend:ExportScreen) export-filters: fields typed from v1's *Def.cfm by hand →
               each filter posts v1's own field name and value (as User Export on v3 does), and each
               lookup's Select opens v1's picker for it (MultipleLookup type, e.g. CRMPrintProduct). -->
          <section class="record-section cc-xp__filters" aria-labelledby="xp-filters-title" data-xp-filters data-backend-todo="export-filters">
            <div class="record-section__header"><div class="cc-xp__title-row"><h2 class="record-section__title" id="xp-filters-title">Filters</h2><span class="badge badge--neutral" data-xp-filter-count hidden></span></div></div>
            <div class="record-section__body">
              <div class="cc-xp__scope" data-xp-scope>
                <p class="cc-xp__desc">Leave a filter empty to include every {e(noun_plural[:-1] if noun_plural.endswith("s") else noun_plural)}. Filters combine: a record must match all of them.</p>
                {scope_row}
              </div>
              <div class="acc acc--flush">{"".join(groups)}</div>
            </div>
          </section>

          {columns_card(presets, columns, extras)}
        </div>

        <aside class="cc-xp__aside" aria-label="Your export">
          <section class="record-section cc-xp__summary" aria-labelledby="xp-sum-title">
            <div class="record-section__header"><h2 class="record-section__title" id="xp-sum-title">Your export</h2></div>
            <div class="record-section__body">
              <div class="cc-xp__count" data-xp-count aria-live="polite">
                <span class="cc-xp__count-value" data-xp-count-value>—</span>
                <span class="cc-xp__count-label" data-xp-count-label>Counting…</span>
              </div>
              <div class="cc-xp__block">
                <div class="cc-xp__block-head"><h3 class="cc-xp__block-title">From</h3></div>
                <p class="cc-xp__line" data-xp-from></p>
              </div>
              <div class="cc-xp__block">
                <div class="cc-xp__block-head"><h3 class="cc-xp__block-title">Filters</h3>
                  <button type="button" class="btn btn--tertiary btn--xs" data-xp-clear-all hidden><span>Clear all</span></button></div>
                <ul class="cc-xp__applied" data-xp-applied aria-label="Filters applied" hidden></ul>
                <p class="cc-xp__none" data-xp-none tabindex="-1">None. Every {e(noun_plural[:-1])} in the zone is included.</p>
              </div>
              <div class="cc-xp__block">
                <div class="cc-xp__block-head"><h3 class="cc-xp__block-title">Columns</h3>
                  <button type="button" class="btn btn--tertiary btn--xs" data-xp-change-cols><span>Change</span></button></div>
                <p class="cc-xp__line" data-xp-cols-line></p>
              </div>
              <div class="cc-xp__block">
                <div class="cc-xp__block-head"><h3 class="cc-xp__block-title" id="xp-format-title">Format</h3></div>
                <div class="seg-control" role="radiogroup" aria-labelledby="xp-format-title" data-seg-control data-xp-format>
                  <button class="seg-control__btn seg-control__btn--active" type="button" role="radio" aria-checked="true" data-value="xlsx">XLSX</button>
                  <button class="seg-control__btn" type="button" role="radio" aria-checked="false" data-value="csv">CSV</button>
                  <button class="seg-control__btn" type="button" role="radio" aria-checked="false" data-value="tsv">TSV</button>
                </div>
                {format_extra}
              </div>
              <div class="cc-xp__go">
                <!-- TODO(backend:ExportScreen) export-run: see ExportScreen.js run(). -->
                <button type="button" class="btn btn--primary" data-xp-go disabled data-backend-todo="export-run"><span>Export</span></button>
                <p class="cc-xp__note" data-xp-go-note aria-live="polite"></p>
              </div>
            </div>
          </section>
        </aside>
      </div>'''

    s = open(SHELL, encoding="utf-8").read()
    s = s.replace("<title>Export System JSON and CSS — Affino Control Centre</title>", f"<title>{title} — Affino Control Centre</title>")
    s = s.replace('  <link rel="stylesheet" href="ExportSystem.css">',
                  '  <link rel="stylesheet" href="../../../components/Radio/Radio.css">\n'
                  '  <link rel="stylesheet" href="../../../components/Accordion/Accordion.css">\n'
                  '  <link rel="stylesheet" href="../../../components/SegmentedControl/SegmentedControl.css">\n'
                  '  <link rel="stylesheet" href="../../../components/DatePicker/DatePicker.css">\n'
                  '  <link rel="stylesheet" href="ExportScreen.css">')
    s = s.replace('<a class="breadcrumb__link" href="#">System Management</a>', f'<a class="breadcrumb__link" href="#">{section}</a>')
    s = s.replace('aria-current="page">Export System JSON and CSS</li>', f'aria-current="page">{title}</li>')
    s = re.sub(r'(<h1 class="cc-header__title">)Export System JSON and CSS(</h1>)', r'\g<1>' + title + r'\2', s, count=1)
    start = s.index("    <!-- Page content: /control/export-system-json-and-css")
    end = s.index("  </main>", start)
    s = (s[:start] + f"    <!-- Page content: {title} on the v3 Export pattern (TASK-575621). Generated by _generate.py; edit that. -->\n"
         f'    <div class="cc-control__page cc-xp" data-xp>\n\n      {body}\n\n    </div>\n' + s[end:])
    s = s.replace('  <script src="ExportSystem.js"></script>',
                  '  <script src="../../../components/DatePicker/DatePicker.js"></script>\n'
                  '  <script src="../../../components/SegmentedControl/SegmentedControl.js"></script>\n'
                  '  <script src="ExportScreen.js"></script>\n'
                  f'  <script>\n{config}\n  </script>')
    open(os.path.join(HERE, out), "w", encoding="utf-8").write(s)
    print("wrote", out)


# ── User Export (/control/user-export, ControlProfile 612) ───────────────────────────────
# v1: AfcSecurity/CC/UserExport.cfm + UserExportDef.cfm (labels and help below are v1's). On v3
# already as v1's own form (TASK-574226); this is the pattern's version of it.
ANY = "Any"
USER_GROUPS = [
    group("Demographics", [
        edit_row("Contact lists", "lookup", value="VIP Members, Events 2026", help_text="Only contacts on these contact lists."),
        edit_row("Topics", "lookup", help_text="Only contacts with these topics."),
        edit_row("Country", "select", value=ANY, options=[ANY, "United Kingdom", "United States", "Ireland", "Germany", "France"],
                 help_text="Changing the country empties Regions and Cities."),
        edit_row("Regions", "lookup", help_text="Choose a list of regions."),
        edit_row("Cities", "lookup", help_text="Choose a list of cities."),
        edit_row("Postcode", "input", help_text="Filter export by user postcode."),
        edit_row("Member type", "select", value=ANY, options=[ANY, "Member", "Associate", "Student", "Corporate"],
                 help_text="Only users with matching member types will be exported."),
        edit_row("Privacy type", "select", value=ANY, options=[ANY, "Public", "Private"],
                 help_text="Which type of Personal Profile the user has."),
        edit_row("Security groups", "lookup", help_text="Only users within these security groups will be exported."),
        edit_row("Has store credits", "checkbox", help_text="Only users that have store credits."),
        edit_row("Unsubscribed from all marketing", "checkbox", help_text="Users who have unsubscribed from all messages, including hard bounces."),
        edit_row("Duplicate email users", "checkbox", help_text="Users who share an email address with another user. Use User Import to delete or update them."),
        edit_row("Un-used user accounts", "checkbox", help_text="Only users who have never logged in to the site."),
        edit_row("Archived users only", "checkbox", help_text="Only archived users. Mailing-list users are included unless you filter by contact type."),
        edit_row("Job seeker", "checkbox", help_text="Only users who are job seekers."),
    ], open_=True),
    group("Permissions and preferences", [
        edit_row("Preferences", "select", value=ANY, options=[ANY, "Newsletter: Weekly", "Newsletter: Daily", "Events", "Offers from partners"],
                 help_text="Filter by the users' preferences."),
        edit_row("Happy to be contacted by telephone", "checkbox"),
        edit_row("Happy to be contacted by mail", "checkbox"),
        edit_row("Happy to be contacted by email", "checkbox"),
        edit_row("Happy to be contacted by SMS", "checkbox"),
    ]),
    group("Created", [
        edit_row("Created from", "date", help_text="Users created on or after this date."),
        edit_row("Created to", "date", help_text="Users created on or before this date."),
    ]),
    group("Subscription plans", [
        edit_row("Subscription plan", "lookup", help_text="Which subscription plans to export."),
        edit_row("Subscription start", "date", help_text="The start date of the subscription, i.e. the first issue date."),
        edit_row("Subscription end", "date", help_text="The end date of the subscription, i.e. the last issue date."),
        edit_row("Subscription status", "lookup", help_text="With a plan chosen: whether its users are active or lapsed."),
        edit_row("Requested", "select", value=ANY, options=[ANY, "Requested", "Not requested"],
                 help_text="Only use this when exporting a single subscription."),
    ]),
    group("Editions", [
        edit_row("Editions", "lookup", help_text="Only users on these editions. Not while an edition's circulation is being calculated."),
    ]),
    group("Batch reference", [
        edit_row("Batch reference", "input", help_text="Only users imported with this batch reference."),
    ]),
]

USER_COLUMNS = [
    {"group": "Contact", "items": [("UserCode", "UserCode"), ("Title", "Title"), ("FirstName", "First name"), ("LastName", "Last name"),
                                   ("Email", "Email"), ("JobTitle", "Job title"), ("Telephone", "Telephone"), ("Mobile", "Mobile")]},
    {"group": "Address", "items": [("Address1", "Address 1"), ("Address2", "Address 2"), ("Town", "Town"), ("County", "County"),
                                   ("Postcode", "Postcode"), ("Country", "Country")]},
    {"group": "Account", "items": [("Company", "Company"), ("AccountCode", "Account code"), ("AccountType", "Account type"),
                                   ("AccountManager", "Account manager")]},
    {"group": "Registration", "items": [("Zone", "Registration zone"), ("Created", "Created"), ("LastLogin", "Last login"),
                                        ("SecurityGroups", "Security groups"), ("MemberType", "Member type"), ("BatchReference", "Batch reference")]},
    {"group": "Lists, topics and preferences", "items": [("ContactLists", "Contact lists"), ("Topics", "Topics"), ("Preferences", "Preferences"),
                                                         ("Unsubscribed", "Unsubscribed from all marketing")]},
    {"group": "Subscriptions", "items": [("Plan", "Subscription plan"), ("SubStart", "Subscription start"), ("SubEnd", "Subscription end"),
                                         ("SubStatus", "Subscription status")]},
    {"group": "Commerce", "items": [("StoreCredits", "Store credits")]},
]
CONTACT_ONLY = ["Title", "FirstName", "LastName", "JobTitle", "Company", "Address1", "Address2", "Town", "County", "Postcode", "Country",
                "Email", "Telephone", "Mobile"]
USER_PRESETS = [
    {"id": "all", "label": "All columns", "help": "Every contact attribute, including account details", "count": "all"},
    {"id": "contact", "label": "Contact details only", "help": "Name, job title, company, address and contact details, e.g. for a lead list", "count": len(CONTACT_ONLY)},
]
USER_EXTRAS = [
    edit_row("Include all subscription plans", "checkbox", help_text="Adds every subscription plan each user has, with its start and end dates."),
    edit_row("Include activity data", "checkbox", help_text="Adds page views, logins, new registrations and customer signal points. Can slow the export down for large data sets."),
    edit_row("Activity time frame", "select", value="Last 30 days", options=["Last 30 days", "Last 90 days", "Last 12 months", "All time"],
             help_text="The period the activity columns cover."),
]

USER_CONFIG = """
    ExportScreen.init({
      noun: ['contact', 'contacts'],
      total: 48210,
      formats: ['XLSX', 'CSV', 'TSV'],
      filePrefix: 'user-export',
      email: 'mark.foster@affino.com',
      userName: 'Mark Foster',
      presets: [
        { id: 'all', label: 'All columns', keys: 'all' },
        { id: 'contact', label: 'Contact details only', keys: %s }
      ],
      columns: %s,
      recent: [
        { id: 1, name: 'user-export-2026-10-22.xlsx', meta: 'From Affino · 3 filters · 14 columns', records: 5200, format: 'XLSX', by: 'Priya Shah', when: '2 hours ago', status: 'running', processed: 1840 },
        { id: 2, name: 'user-export-2026-10-20.csv', meta: 'From Affino · Contact lists: VIP Members · 41 columns', records: 312, format: 'CSV', by: 'Mark Foster', when: '20 Oct, 09:14', status: 'ready', expires: 'Kept until 27 Oct' },
        { id: 3, name: 'user-export-2026-10-12.xlsx', meta: 'From Events · No filters · 41 columns', records: 18450, format: 'XLSX', by: 'Mark Foster', when: '12 Oct, 16:02', status: 'expired' }
      ]
    });"""


def js_columns(cols):
    import json
    return json.dumps([{"group": g["group"], "items": [list(i) for i in g["items"]]} for g in cols])


page(
    out="UserExport.html", title="User Export", section="Security", noun_plural="contacts",
    scope_row=edit_row("Registration zone", "select", value="Affino (User Profile: Standard)",
                       options=["Affino (User Profile: Standard)", "Events (User Profile: Delegate)", "Members (User Profile: Member)"],
                       help_text="The zone's user, registration and demographic profiles decide which fields the export can include."),
    groups=USER_GROUPS, presets=USER_PRESETS, columns=USER_COLUMNS, extras=USER_EXTRAS,
    # A plain Checkbox with helper text: a FieldRow stacks its label above the box in a 384px card.
    format_extra=(f'<label class="checkbox"><input type="checkbox" class="checkbox__input" data-xp-pipe>'
                  f'<span class="checkbox__indicator">{icon("check")}</span><span class="checkbox__label">'
                  '<span class="checkbox__label-text">Separate multiple answers with |</span>'
                  '<span class="checkbox__helper">e.g. Red | Yellow | Blue in one cell. The file is still comma-separated.</span></span></label>'),
    config=USER_CONFIG % (__import__("json").dumps(CONTACT_ONLY), js_columns(USER_COLUMNS)),
)


# ── Article Export (/control/article-export, ControlProfile 610) ─────────────────────────
# v1: AfcStandard/CC/StandardItemExport.cfm. Groups follow v1's comment rows (Seminar, Review,
# Dates); the Seminar / Review "Include …" rows add columns, so they sit under Columns.
ARTICLE_GROUPS = [
    group("Where", [
        edit_row("Channels", "lookup", help_text="Only articles from these channels."),
        edit_row("Sections", "lookup", value="News, Features", help_text="Only articles in these sections. Leave empty to export every section."),
        edit_row("Include multi-displayed articles", "checkbox", help_text="Also articles multi-displayed in the sections or channels above."),
        edit_row("Archive", "radio", value="All articles", options=["All articles", "Not archived", "Archived only"],
                 help_text="Archived articles only, or only articles that have not been archived."),
    ], open_=True),
    group("Dates", [
        edit_row("Publish start", "date", help_text="Articles published on or after this date."),
        edit_row("Publish end", "date", help_text="Articles published on or before this date."),
        edit_row("Event start", "date", help_text="Events starting on or after this date."),
        edit_row("Event end", "date", help_text="Events starting on or before this date."),
    ]),
    group("Access", [
        edit_row("Content security rights", "lookup",
                 help_text="Only articles with these rights. You can only ever export articles you have the right to see."),
    ]),
]
ARTICLE_COLUMNS = [
    {"group": "Article", "items": [("StandardItemCode", "Article code"), ("Title", "Title"), ("Summary", "Summary"), ("Author", "Author"),
                                   ("Section", "Section"), ("Channel", "Channel"), ("Zone", "Zone"), ("URL", "URL")]},
    {"group": "Dates", "items": [("Created", "Created"), ("PublishStart", "Publish start"), ("PublishEnd", "Publish end"),
                                 ("EventStart", "Event start"), ("EventEnd", "Event end"), ("LastUpdated", "Last updated")]},
    {"group": "Topics and access", "items": [("Topics", "Topics"), ("Security", "Content security right"), ("Archived", "Archived")]},
]
ARTICLE_EXTRAS = [
    edit_row("Include moderators and speakers", "checkbox", help_text="Adds moderators and speakers (Advanced Seminar presentation style only)."),
    edit_row("Include reviews", "checkbox", value=True, help_text="Adds review values (Reviews presentation style only)."),
]
ARTICLE_CONFIG = """
    ExportScreen.init({
      noun: ['article', 'articles'],
      total: 3493,
      formats: ['XLSX', 'CSV', 'TSV'],
      filePrefix: 'article-export',
      email: 'mark.foster@affino.com',
      userName: 'Mark Foster',
      presets: [{ id: 'all', label: 'All columns', keys: 'all' }],
      columns: %s,
      recent: [
        { id: 1, name: 'article-export-2026-10-19.xlsx', meta: 'From all zones · Sections: News · 17 columns', records: 812, format: 'XLSX', by: 'Luis Moreno', when: '19 Oct, 11:30', status: 'ready', expires: 'Kept until 26 Oct' }
      ]
    });"""

page(
    out="ArticleExport.html", title="Article Export", section="Content", noun_plural="articles",
    scope_row=edit_row("Zone", "select", value="All zones", options=["All zones", "Affino", "Events", "Members"],
                       help_text="Choose a zone to export only its articles."),
    groups=ARTICLE_GROUPS,
    presets=[{"id": "all", "label": "All columns", "help": "Every article column", "count": "all"}],
    columns=ARTICLE_COLUMNS, extras=ARTICLE_EXTRAS, format_extra="",
    config=ARTICLE_CONFIG % js_columns(ARTICLE_COLUMNS),
)
