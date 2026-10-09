"""Contact View — the record-screen kit filled with a contact (code-first, "build first", 2026-10-07).

Structure read from the live Control Centre contact screen (/control/contacts?screen=UserView, two
contacts: a fully filled one and a sparse one) — the profile fields, accounts, topics and lists, the
membership facts, the customer signals and latest-activity timeline, the CRM tabs (Tasks,
Communication = contact notes, Commerce = opportunities, Events) and the engagement statistics.

The PEOPLE are invented: the live records hold real personal details and these demos are public.
Phone numbers are Ofcom's drama ranges (020 7946 0xxx, 07700 900xxx) and emails use `.example`.

View only for now (designer, 2026-10-07); CRM activity sits in the sidebar so it is there on Details.
"""
import record_markup as m

e = m.e

# The live screen's tab set. Only Details is built; the others are labels for now (as Article View's).
def page_for(c, tab):
    """The file for a contact's tab: ContactView.html → ContactViewCommunication.html, etc."""
    base = c["file"][:-len(".html")]
    return c["file"] if tab == "details" else base + tab.title().replace("-", "") + ".html"


BUILT = ("details", "demographic", "tasks", "communication", "commerce", "events", "analysis",
         "page-analysis", "digital-assets", "permissions")   # every live tab (2026-10-07)


def tabs(c):
    # The live screen's ten tabs. "Badges" and "Assign customer signal" sit beside them there but are
    # actions, not tabs: Badges is in the kebab, Assign on the Customer signals panel.
    names = ["Details", "Demographic", "Tasks", "Communication", "Commerce", "Events",
             "Analysis", "Page analysis", "Digital assets", "Permissions"]
    out = []
    for n in names:
        key = n.lower().replace(" ", "-")
        out.append((key, n, page_for(c, key) if key in BUILT else "#"))
    return out


# The live screen's quick actions and action links. Header rule: one primary (Edit) + one secondary
# (Add note); everything else in the kebab (designer, 2026-09-30).
KEBAB = [(label, ico, f' href="#" data-backend-todo="contact-actions"') for label, ico in [
    ("Add task", "list-todo"), ("Add pro forma", "receipt-pound-sterling"), ("Add to topic", "tag"),
    ("Add to contact list", "list-plus"), ("My contact", "star"), ("Send message", "mail"),
    ("Send info", "send"), ("Relate content", "link-2"), ("Audit user", "history"),
    ("View profile", "external-link"), ("View account", "building-2"), ("Badges", "award"), ("Download vCard", "contact")]]
KEBAB.append(("Go to list", "list", ' href="../ListingScreen/ListingScreen.html" data-keep-width'))

SECONDARY = ("Add note", "notebook-pen", ' data-backend-todo="contact-actions"')


def _tags_or_dash(label, values):
    return m.view_row(label, "tags", values) if values else m.view_row(label, "text", "-")


def _avatar(seed, name):
    return (f'<span class="avatar avatar--size-4 contact-view__photo"><img class="portrait" '
            f'src="https://i.pravatar.cc/128?u={e(seed)}" alt="{e(name)}"></span>')


def view_sections(c):
    """Main column: the profile, the accounts, then interests and lists. Empty fields read "-"
    (the Article View rule)."""
    t = lambda label, v: m.view_row(label, "text", v or "-")
    contact = [m.view_row("Photo", "html", _avatar(c["seed"], c["name"])),
               t("Name", c["name"]), t("Job title", c.get("job")), t("Email", c.get("email")),
               t("Telephone", c.get("tel")), t("Mobile", c.get("mobile")), t("Address", c.get("address"))]
    accounts = [_tags_or_dash("Account", c.get("accounts")), _tags_or_dash("Former accounts", c.get("former")),
                _tags_or_dash("Connections", c.get("connections"))]
    lists = [_tags_or_dash("Topics", c.get("topics")), _tags_or_dash("Mailing lists", c.get("mailing")),
             _tags_or_dash("Contact lists", c.get("lists"))]
    # TODO(backend:RecordScreen) contact-record: the profile, accounts, topics and lists are static → the contact (Users / UserAccount / topics / list membership)
    return (m.record_section("Contact", contact, "view") + m.record_section("Accounts", accounts, "view")
            + m.record_section("Interests and lists", lists, "view"))


def _badge(label, tone):
    return f'<span class="badge badge--{tone}">{e(label)}</span>'


def sidebar(c):
    facts = [("User code", c["code"]), ("Account type", c["type"]), ("Engagement level", c["level"]),
             ("Points", c["points"])]
    for label in ("On-site contacts", "Followers"):
        if c.get(label):
            facts.append((label, c[label]))
    facts += [("First touch", c["first"]), ("Last touch", c["last"]), ("Last login", c["login"])]

    signals = ('<div class="contact-view__signals" data-backend-todo="contact-signals">'
               + m.signal_group(c["signals"]) + '</div>') if c["signals"] else '<p class="fact-panel__empty">No customer signals yet.</p>'

    o = c["opps"]
    opp_summary = m.fact_list([("Open", o["open"]), ("Closed", o["closed"]), ("Won value", o["won"])])
    stage = {"Open": "info", "Closed Won": "success", "Closed": "neutral"}
    opp_rows = m.record_list([(n, f"{s} · {d}", _badge(v, stage[s])) for n, s, v, d in o["rows"]],
                             "No opportunities yet.", todo="contact-opportunities")
    tasks = m.record_list([(t, mt, None) for t, mt in c["tasks"]], "No open tasks.", todo="contact-tasks")
    notes = m.record_list([(t, mt, _badge(kind, "neutral")) for t, mt, kind in c["notes"]], "No contact notes yet.",
                          more=c.get("notes_more"), todo="contact-notes")
    activity = m.record_list(_with_icons(c["activity"]), "No activity yet.", more=c.get("activity_more"), todo="contact-activity",
                             timeline=True)

    # "View all" opens the matching CRM tab (Tasks, Communication, Commerce), not built yet.
    def more_link(what, tab=None):
        href = page_for(c, tab) if tab in BUILT else "#"
        todo = "" if tab in BUILT else ' data-backend-todo="contact-crm-tabs"'
        return (f'<a class="btn btn--tertiary btn--xs" href="{href}" aria-label="View all {e(what)}"{todo} data-keep-width>'
                f'<span>View all</span></a>')
    # TODO(backend:RecordScreen) contact-sidebar: facts, signals, activity, tasks, notes, opportunities, events and engagement are static → the contact's CRM + analysis data (see HANDOVER rows contact-*)
    # Quick links: the live view's search row (CRMUserView.cfm) — LinkedIn when set, then Google / ChatGPT /
    # Perplexity on the contact's name and company.
    links = m.quick_links(" ".join(x for x in (c["name"], (c.get("accounts") or [""])[0]) if x),
                          x=c.get("x"), linkedin=c.get("linkedin"))
    return "".join([
        m.fact_panel("Record", links + m.fact_list(facts)),
        m.fact_panel("Customer signals", signals, count=(c["signal_total"], f'{c["signal_total"]} signals'),
                     action='<button type="button" class="btn btn--tertiary btn--xs" aria-label="Assign a customer signal" '
                            'data-backend-todo="contact-actions"><span>Assign</span></button>'),
        m.fact_panel("Latest activity", activity),
        m.fact_panel("Open tasks", tasks, action=more_link("tasks", "tasks")),
        m.fact_panel("Contact notes", notes, count=(c["notes_count"].split()[0], c["notes_count"]),
                     action=more_link("contact notes", "communication")),
        m.fact_panel("Opportunities", opp_summary + opp_rows, action=more_link("opportunities", "commerce")),
        m.fact_panel("Events", m.fact_list(c["events"])),
        m.fact_panel("Engagement", m.fact_list(c["engagement"]), subtitle="All time unless stated"),
    ])


SIG = {  # signal → Lucide glyph (stand-ins for each signal's badge image, as Recent Viewers)
    "Campaign message read": "mail-open", "Campaign message sent to": "send", "Contact note": "notebook-pen",
    "Event attendee": "calendar-check", "Login": "log-in", "Member": "user-check", "New opportunity": "briefcase",
    "Newsletter subscription": "newspaper", "Opportunity won": "trophy", "Public profile view": "eye",
    "Read master services agreement": "file-text", "Regular user (10 logins)": "repeat", "Search": "search",
    "Roadmap view": "map",
}


def _signals(pairs):
    return [(f"{n} ({k})", SIG[n]) for n, k in pairs]


# ── The two contacts ─────────────────────────────────────────────────
FULL = {
    "file": "ContactView.html", "edit": "ContactEdit.html", "seed": "olivia-bennett",
    "linkedin": "https://www.linkedin.com/in/olivia-bennett-example", "name": "Olivia Bennett", "job": "Founder & CEO",
    "email": "olivia.bennett@northbridge-media.example", "tel": "020 7946 0381", "mobile": "07700 900461",
    "address": "Northbridge Media Ltd, 3rd Floor, 12 Carver Street, London, EC2A 4BX, United Kingdom",
    "accounts": ["Northbridge Media"], "former": ["Harbour Retail Group"], "connections": [],
    "topics": ["Analysis", "Campaigns", "Commerce", "Content Management", "Control", "Ecommerce", "eCommunity", "eMedia"],
    "mailing": ["Affino News"],
    "lists": ["2023 CEOs and Digital Leads", "2023 July Affino Clients", "2023 PPA Awards Attendance", "2025 Autumn Affino Users",
              "2026 Feb Customer Contacts", "Affino Briefing Mailer Nov 2018", "Affino Briefing Nov 2018",
              "Affino Customers and Subscribers Nov 2019"],
    "code": "208114", "type": "Full account", "level": "Regular", "points": "671",
    "first": "08 Jan 2016 · Member", "last": "27 Aug 2026 · Login", "login": "27 Aug 2026",
    "signals": _signals([("New opportunity", 34), ("Regular user (10 logins)", 10), ("Campaign message read", 5),
                         ("Campaign message sent to", 5), ("Contact note", 3), ("Read master services agreement", 3),
                         ("Login", 3), ("Public profile view", 2), ("Search", 2), ("Opportunity won", 1),
                         ("Event attendee", 1), ("Newsletter subscription", 1), ("Member", 1)]),
    "signal_total": "71",
    "activity": [("Login", "27 Aug 2026, 11:03", None), ("Read master services agreement", "05 Aug 2026, 18:26", None),
                 ("Read master services agreement", "03 Aug 2026, 18:53", None), ("Campaign message read", "10 Jul 2026, 13:12", None),
                 ("Campaign message read", "10 Jul 2026, 12:57", None)],
    "activity_more": "58 more events",
    "tasks": [("Send the 2027 renewal proposal", "Due 14 Oct 2026 · Markus Karlsson"),
              ("Book the data-service review call", "Due 21 Oct 2026 · Luis Montiel")],
    "notes": [("Personal note on the Affino 9.0.11 release", "6 Oct 2026 · Markus Karlsson", "Email"),
              ("Email summary, June to September 2026", "1 Oct 2026 · Markus Karlsson", "Email"),
              ("Data processing addendum received, ready to sign", "27 Feb 2026 · Markus Karlsson", "Review")],
    "notes_count": "48 notes", "notes_more": "45 more notes",
    "opps": {"open": "1", "closed": "26", "won": "£98,148",
             "rows": [("Northbridge Media service renewal Dec 2026", "Open", "£18,200", "closes 02 Dec 2026"),
                      ("Northbridge Media service renewal Dec 2025", "Closed Won", "£17,700", "02 Dec 2025"),
                      ("Northbridge Media dedicated data service", "Closed", "£14,400", "26 Feb 2026")]},
    "events": [("Event attendance", "1"), ("Award entries", "0")],
    "engagement": [("Created", "08 Jan 2016, 15:19"), ("Logins (365 days)", "6"), ("Page views (365 days)", "45"),
                   ("Forum posts", "6"), ("Last forum view", "19 Feb 2026, 17:59"), ("Message opens", "9"),
                   ("Message clicks", "3"), ("Media storage", "0 bytes")],
}

SPARSE = {
    "file": "ContactViewSparse.html", "seed": "daniel-hughes", "name": "Daniel Hughes",
    "email": "d.hughes@clearwater-publishing.example",
    "accounts": ["Clearwater Publishing", "Brightline Retail"], "former": [], "connections": ["Priya Shah"],
    "topics": ["Publishing and Media"], "mailing": ["Affino News"],
    "lists": ["2019 Affino Innovation Briefing Article Read", "2023 July Affino Clients", "2025 Autumn Affino Users",
              "2026 Feb Customer Contacts", "Affino 8 Aware", "Affino Briefing Nov 2018",
              "Affino Customers and Subscribers Nov 2019", "Affino Customers Nov 2018"],
    "code": "208117", "type": "Full account", "level": "Advocate", "points": "55",
    "On-site contacts": "1", "Followers": "1",
    "first": "26 Nov 2018 · Event attendee", "last": "03 Jul 2026 · Campaign message sent to", "login": "15 Jun 2022",
    "signals": _signals([("Campaign message sent to", 5), ("Regular user (10 logins)", 1), ("Event attendee", 1),
                         ("Newsletter subscription", 1), ("Contact note", 2), ("Roadmap view", 1)]),
    "signal_total": "11",
    "activity": [("Campaign message sent to", "03 Jul 2026, 15:33", None), ("Campaign message sent to", "30 Jun 2026, 11:40", None),
                 ("Campaign message sent to", "19 Jun 2026, 16:09", None), ("Regular user (10 logins)", "09 Apr 2021, 12:26", None),
                 ("Roadmap view", "20 Mar 2019, 13:13", None)],
    "activity_more": "6 more events",
    "tasks": [],
    "notes": [("Introduced at the publishing round table", "1 Oct 2019 · Markus Karlsson", "Meeting")],
    "notes_count": "2 notes", "notes_more": "1 more note",
    "opps": {"open": "0", "closed": "0", "won": "£0", "rows": []},
    "events": [("Event attendance", "1"), ("Award entries", "0")],
    "engagement": [("Created", "10 Jan 2016, 22:51"), ("Logins (365 days)", "0"), ("Page views (365 days)", "0"),
                   ("Forum posts", "523"), ("Last forum view", "15 Jun 2022, 16:01"), ("Message opens", "-"),
                   ("Message clicks", "-"), ("Media storage", "10.05 MB")],
}

CONTACTS = [FULL, SPARSE]


# ── Communication and Commerce tabs (2026-10-07) ─────────────────────
# The live tabs are tables: Communication = the contact's notes, Commerce = its opportunities. Each is
# a Datatables card fitted by DatatablesFit.js (even widths, the first column weighted; columns that do
# not fit drop into the kebab's detail row), as the dashboards' tables.
def _th(label, keep=False, drop=None, weight=None, fluid=False, num=False):
    attrs = (" data-keep" if keep else "") + (f' data-drop="{drop}"' if drop else "") + \
            (f' data-weight="{weight}"' if weight else "") + (" data-fluid" if fluid else "")
    cls = ' class="contact-tab__num"' if num else ""
    return f"<th{cls}{attrs}>{e(label)}</th>"


def _card(title, body, count=None, todo=None, add=None, foot=""):
    """A tab card: the table head's title (+ count chip, + Add) over any body (2026-10-07)."""
    add_btn = (f'<button type="button" class="btn btn--secondary btn--sm" aria-label="{e(add)}" data-backend-todo="{todo}">'
               f'{m.icon("plus")}<span class="contact-tab__btn-label">{e(add)}</span></button>') if add else ""
    chip = (" " + m.count_chip(count, f"{count} {title.lower()}")) if count is not None else ""
    tid = "tab-" + "".join(ch for ch in title.lower() if ch.isalnum())
    attr = f' data-backend-todo="{todo}"' if todo else ""
    return f'''<section class="datatables datatables--orders contact-tab" aria-labelledby="{tid}"{attr}>
          <div class="datatables__toolbar contact-tab__head">
            <h2 class="contact-tab__title" id="{tid}">{e(title)}{chip}</h2>{add_btn}
          </div>
          {body}{foot}
        </section>'''


def _facts(rows):
    return f'<div class="contact-tab__body">{m.fact_list(rows)}</div>'


def _empty(text):
    return f'<p class="contact-tab__empty">{e(text)}</p>'


def _grid(*cards):
    return f'<div class="contact-tab-grid">{"".join(cards)}</div>'


def _table_card(title, count, head, rows, empty, todo, add=None, shown=None):
    add_btn = (f'<button type="button" class="btn btn--secondary btn--sm" aria-label="{e(add)}" data-backend-todo="{todo}">'
               f'{m.icon("plus")}<span class="contact-tab__btn-label">{e(add)}</span></button>') if add else ""
    if not rows:
        body = f'<p class="contact-tab__empty">{e(empty)}</p>'
        foot = ""
    else:
        body = (f'<div class="datatables__body"><table class="table" data-fit="even"><thead><tr>{head}</tr></thead>'
                f'<tbody>{"".join(rows)}</tbody></table></div>')
        more = (f'<button type="button" class="btn btn--tertiary btn--sm" data-backend-todo="{todo}">'
                f'<span>Show more</span>{m.icon("chevron-down")}</button>') if shown and shown < int(count) else ""
        foot = (f'<div class="contact-tab__foot"><span class="contact-tab__count">Showing {shown or len(rows)} of {e(count)}</span>'
                f'{more}</div>')
    tid = "tab-" + "".join(ch for ch in title.lower() if ch.isalnum())
    return f'''<section class="datatables datatables--orders contact-tab" aria-labelledby="{tid}" data-backend-todo="{todo}">
          <div class="datatables__toolbar contact-tab__head">
            <h2 class="contact-tab__title" id="{tid}">{e(title)} {m.count_chip(count, f"{count} {title.lower()}")}</h2>{add_btn}
          </div>
          {body}{foot}
        </section>'''


NOTE_TONE = {"Email": "info", "Call": "success", "Meeting": "warning", "Review": "neutral"}


def communication(c):
    rows = []
    for title, summary, kind, account, opp, created, by, updated, by2 in c.get("note_rows", []):
        rows.append(
            f'<tr><td><a class="datatables__record-link" href="#" data-backend-todo="contact-notes">{e(title)}</a>'
            f'<p class="contact-tab__summary">{e(summary)}</p></td>'
            f'<td>{_badge(kind, NOTE_TONE.get(kind, "neutral"))}</td><td>{e(account)}</td><td>{e(opp or "-")}</td>'
            f'<td>{e(created)}</td><td>{e(by)}</td><td>{e(updated)}</td><td>{e(by2)}</td></tr>')
    head = (_th("Note", keep=True, weight=3, fluid=True) + _th("Type", drop=6) + _th("Account", drop=4)
            + _th("Opportunity", drop=3) + _th("Created", keep=True) + _th("By", drop=5)
            + _th("Last updated", drop=2) + _th("Updated by", drop=1))
    # TODO(backend:RecordScreen) contact-notes: the notes table is static → the contact's notes (ContactNote), newest first, paged; Add note opens the note form
    return _table_card("Contact notes", c["notes_count"].split()[0], head, rows, "No contact notes yet.",
                       "contact-notes", add="Add note", shown=len(rows))


STAGE_TONE = {"Open": "info", "Closed Won": "success", "Closed": "neutral", "Proposal": "warning"}


def _opp_rows(items):
    return [f'<tr><td><a class="datatables__record-link" href="#" data-backend-todo="contact-opportunities">{e(n)}</a></td>'
            f'<td>{_badge(st, STAGE_TONE.get(st, "neutral"))}</td><td>{e(owner)}</td><td class="contact-tab__num">{e(v)}</td>'
            f'<td>{e(task or "-")}</td><td class="contact-tab__num">{e(notes or "-")}</td><td>{e(close)}</td>'
            f'<td>{e(contract)}</td><td>{e(touch)}</td></tr>'
            for n, st, owner, v, task, notes, close, contract, touch in items]


def commerce(c):
    head = (_th("Opportunity", keep=True, weight=2, fluid=True) + _th("Stage", keep=True) + _th("Owner", drop=3)
            + _th("Value", keep=True, num=True) + _th("Next task", drop=1) + _th("Notes", drop=2, num=True)
            + _th("Close date", drop=5) + _th("Contract", drop=4) + _th("Last touch", drop=6))
    o = c.get("opp_rows", {"open": [], "closed": []})
    # TODO(backend:RecordScreen) contact-opportunities: open + closed opportunities are static → the contact's opportunities (Opportunity via OpportunityContact), split by stage, paged
    return (_table_card("Open opportunities", c["opps"]["open"], head, _opp_rows(o["open"]), "No open opportunities.",
                        "contact-opportunities", add="Add opportunity")
            + _table_card("Closed opportunities", c["opps"]["closed"], head, _opp_rows(o["closed"]),
                          "No closed opportunities.", "contact-opportunities", shown=len(o["closed"])))


TAB_PAGES = {"communication": communication, "commerce": commerce}


# Rows for the tab tables (invented, shaped like the live tables).
FULL["note_rows"] = [
    ("Personal note on the Affino 9.0.11 release", "Sent the personal note on what the release means for Northbridge's newsroom.", "Email", "Northbridge Media", None, "6 Oct 2026", "Markus Karlsson", "6 Oct 2026", "Markus Karlsson"),
    ("Email summary, June to September 2026", "Inbox sweep: renewal timing, the data-service scope and two support threads.", "Email", "Northbridge Media", None, "1 Oct 2026", "Markus Karlsson", "1 Oct 2026", "Markus Karlsson"),
    ("Renewal scope call", "Agreed the 2027 scope: the platform, AI assistant and the newsletter module.", "Call", "Northbridge Media", "Northbridge Media service renewal Dec 2026", "18 Sep 2026", "Luis Montiel", "19 Sep 2026", "Luis Montiel"),
    ("Data processing addendum received, ready to sign", "DPA reviewed against the standard terms; no changes needed.", "Review", "Northbridge Media", None, "27 Feb 2026", "Markus Karlsson", "27 Feb 2026", "Markus Karlsson"),
    ("Pipeline review, opportunity closed", "Dedicated data service closed without a decision; revisit after the renewal.", "Review", "Northbridge Media", "Northbridge Media dedicated data service", "26 Feb 2026", "Markus Karlsson", "26 Feb 2026", "Markus Karlsson"),
    ("Quarterly check-in", "Traffic up on last year; asked for a walkthrough of the analytics sidebar.", "Meeting", "Northbridge Media", None, "12 Jan 2026", "Luis Montiel", "12 Jan 2026", "Luis Montiel"),
    ("Renewal signed", "2026 renewal signed on the standard terms.", "Email", "Northbridge Media", "Northbridge Media service renewal Dec 2025", "02 Dec 2025", "Markus Karlsson", "03 Dec 2025", "Markus Karlsson"),
    ("Roadmap briefing", "Walked through the Control Centre roadmap and the new record screens.", "Meeting", "Northbridge Media", None, "14 Oct 2025", "Markus Karlsson", "14 Oct 2025", "Markus Karlsson"),
]
FULL["opp_rows"] = {
    "open": [("Northbridge Media service renewal Dec 2026", "Open", "Markus Karlsson", "£18,200", "Send the 2027 renewal proposal", "2", "02 Dec 2026", "No", "27 Aug 2026")],
    "closed": [
        ("Northbridge Media dedicated data service", "Closed", "Markus Karlsson", "£14,400", None, "3", "26 Feb 2026", "No", "27 Aug 2026"),
        ("Northbridge Media service renewal Dec 2025", "Closed Won", "Markus Karlsson", "£17,700", None, "3", "02 Dec 2025", "Yes", "27 Aug 2026"),
        ("Northbridge Media service renewal Dec 2024", "Closed Won", "Markus Karlsson", "£16,404", None, "1", "12 Dec 2024", "Yes", "27 Aug 2026"),
        ("Northbridge Media service renewal Dec 2023", "Closed Won", "Markus Karlsson", "£15,280", None, "1", "21 Dec 2023", "Yes", "27 Aug 2026"),
        ("Northbridge Media service renewal Dec 2022", "Closed Won", "Markus Karlsson", "£14,220", None, "1", "01 Dec 2022", "Yes", "27 Aug 2026"),
        ("Northbridge Media SSL certificate renewal Jan 2022", "Closed", "Markus Karlsson", "£120", None, None, "15 Dec 2021", "No", "27 Aug 2026"),
        ("Northbridge Media service renewal Dec 2021", "Closed Won", "Markus Karlsson", "£14,220", None, "1", "15 Dec 2021", "Yes", "27 Aug 2026"),
        ("Northbridge Media premium data service", "Closed", "Markus Karlsson", "£9,600", None, "2", "30 Jun 2021", "No", "27 Aug 2026"),
    ],
}
SPARSE["note_rows"] = [
    ("Introduced at the publishing round table", "Met at the round table; interested in the forum tools.", "Meeting", "Clearwater Publishing", None, "1 Oct 2019", "Markus Karlsson", "1 Oct 2019", "Markus Karlsson"),
    ("Follow-up after the round table", "Sent the forum case studies.", "Email", "Clearwater Publishing", None, "3 Oct 2019", "Markus Karlsson", "3 Oct 2019", "Markus Karlsson"),
]
SPARSE["opp_rows"] = {"open": [], "closed": []}


# ── The remaining tabs (2026-10-07) ──────────────────────────────────
def _simple_table(head_cols, rows):
    """head_cols: [(label, attrs-dict for _th)]; rows: [[cell html]]."""
    head = "".join(_th(l, **a) for l, a in head_cols)
    body = "".join("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in rows)
    return (f'<div class="datatables__body"><table class="table" data-fit="even"><thead><tr>{head}</tr></thead>'
            f'<tbody>{body}</tbody></table></div>')


def _rows_card(title, head_cols, rows, empty, todo, add=None, count=None):
    n = count if count is not None else str(len(rows))
    return _card(title, _simple_table(head_cols, rows) if rows else _empty(empty), count=n, todo=todo, add=add)


PRIORITY = {"High": "danger", "Normal": "neutral", "Low": "info"}


def tasks(c):
    t = c.get("task_rows", {"open": [], "closed": []})
    link = lambda x: f'<a class="datatables__record-link" href="#" data-backend-todo="contact-tasks">{e(x)}</a>'
    open_rows = [[link(n), e(due), e(who), _badge(p, PRIORITY[p]), e(rel), e(made)] for n, due, who, p, rel, made in t["open"]]
    closed_rows = [[link(n), e(done), e(who), _badge(p, PRIORITY[p]), e(rel), e(made)] for n, done, who, p, rel, made in t["closed"]]
    cols = lambda second: [("Task", dict(keep=True, weight=3, fluid=True)), (second, dict(keep=True)),
                           ("Assigned to", dict(drop=2)), ("Priority", dict(drop=3)), ("Related to", dict(drop=1)),
                           ("Created", dict(drop=4))]
    # TODO(backend:RecordScreen) contact-tasks: open + closed tasks are static → the contact's tasks (AppUserTask), paged; Add task opens the task form
    return (_rows_card("Open tasks", cols("Due"), open_rows, "No open tasks.", "contact-tasks", add="Add task")
            + _rows_card("Closed tasks", cols("Completed"), closed_rows, "No closed tasks.", "contact-tasks"))


def events(c):
    ev = c.get("event_rows", {"attendance": [], "awards": []})
    att = [[e(n), e(d), _badge(st, "success" if st == "Attended" else "neutral"), e(t)] for n, d, st, t in ev["attendance"]]
    aw = [[e(n), e(cat), e(d), _badge(r, "success" if r == "Shortlisted" else "neutral")] for n, cat, d, r in ev["awards"]]
    # TODO(backend:RecordScreen) contact-events: attendance + award entries are static → the contact's event attendance (EventAttendee) and award entries
    return _grid(
        _rows_card("Event attendance", [("Event", dict(keep=True, weight=2, fluid=True)), ("Date", dict(keep=True)),
                                        ("Status", dict(drop=2)), ("Ticket", dict(drop=1))], att, "No event attendance.", "contact-events"),
        _rows_card("Award entries", [("Award", dict(keep=True, weight=2, fluid=True)), ("Category", dict(drop=2)),
                                     ("Entered", dict(keep=True)), ("Result", dict(drop=1))], aw, "No award entries.", "contact-events"))


def demographic(c):
    # The live tab groups demographic data by the sites / areas it was collected for, each with an Edit link.
    secs = []
    for group, rows in c.get("demographics", []):
        body = [m.view_row(label, "tags", v) if v else m.view_row(label, "text", "-") for label, v in rows]
        secs.append(m.record_section(group, body, "view"))
    # TODO(backend:RecordScreen) contact-demographic: the groups and their values are static → the contact's demographic data per demographic set; Edit opens that set's form
    return "".join(secs) or _card("Demographic information", _empty("No demographic data."), todo="contact-demographic")


def _with_icons(items):
    """Timeline rows with their customer signal's icon (the same glyph the Customer signals group uses)."""
    return [(t, mt, tr, SIG.get(t)) for t, mt, tr in items]


def _chart(cid, kind, labels, values, label, unit, height="md", partial_last=False):
    """A Chart.js canvas drawn by ContactCharts.js from its data attributes (one series, lagoon;
    dataviz: one hue, sorted bars, no legend for one series, hover tooltip, a table view)."""
    import json
    data = json.dumps({"type": kind, "labels": labels, "values": values, "label": label, "unit": unit,
                       "partialLast": partial_last})
    rows = "".join(f"<tr><td>{e(l)}</td><td class=\"contact-tab__num\">{e(str(v))}</td></tr>" for l, v in zip(labels, values))
    return (f'<div class="contact-chart contact-chart--{height}"><canvas id="{cid}" role="img" aria-label="{e(label)}" '
            f"data-contact-chart='{data}'></canvas></div>"
            f'<details class="contact-chart__table"><summary>View as table</summary>'
            f'<table class="table"><thead><tr><th>{e(unit[0])}</th><th class="contact-tab__num">{e(unit[1])}</th></tr></thead>'
            f'<tbody>{rows}</tbody></table></details>')


def _signal_rank(signals):
    """All customer signals as a ranked list: the signal's icon, its name, its count, and a bar for
    its share of the most frequent (Live Dashboard's leaderboard treatment, lagoon)."""
    rows = sorted(((n.rsplit(" (", 1)[0], int(n.rsplit("(", 1)[1].rstrip(")")), g) for n, g in signals),
                  key=lambda r: -r[1])
    top = rows[0][1] if rows else 1
    items = "".join(
        f'<li class="signal-rank__row"><span class="avatar avatar--size-2 avatar--placeholder {m.signal_hue(g)}" aria-hidden="true">{m.icon(g)}</span>'
        f'<span class="signal-rank__main"><span class="signal-rank__line"><span class="signal-rank__name">{e(n)}</span>'
        f'<span class="signal-rank__count">{k}</span></span>'
        f'<span class="signal-rank__bar" aria-hidden="true"><span class="signal-rank__fill" style="--signal-share:{max(2, round(k / top * 100))}%"></span></span>'
        f'</span></li>' for n, k, g in rows)
    return f'<ol class="signal-rank">{items}</ol>'


def analysis(c):
    a = c["analysis"]
    key = dict(a["stats"])
    tiles = (f'<div class="contact-tab__tiles">'
             f'{m.stat("Logins (365 days)", key["Logins (365 days)"], "lagoon", "log-in")}'
             f'{m.stat("Page views (365 days)", key["Page views (365 days)"], "jade", "eye")}'
             f'{m.stat("Message opens", key["Message opens"], "violet-radix", "mail-open")}'
             f'{m.stat("Forum posts", key["Forum posts"], "orange", "messages-square")}</div>')
    pts = sorted(a["points"], key=lambda r: -int(r[1]))
    rest = [r for r in a["stats"] if r[0] not in ("Logins (365 days)", "Page views (365 days)", "Message opens", "Forum posts")]
    uid = c["code"]
    # TODO(backend:RecordScreen) contact-analysis: the tiles, points by type (time frame + view type), activity by month, signal counts, statistics and content views are static → the contact's analysis data
    return (tiles
            + _grid(_card("Engagement points by type", f'<div class="contact-tab__body">' + _chart(
                          f"pts-{uid}", "bar-h", [k for k, _ in pts], [int(v) for _, v in pts],
                          "Engagement points by type, last 12 months", ("Type", "Points")) + '</div>',
                          count=a["points_total"], todo="contact-analysis"),
                    _card("Activity by month", f'<div class="contact-tab__body">' + _chart(
                          f"act-{uid}", "bar", a["month_labels"], a["months"],
                          "Customer signal events per month, last 12 months; the current month is to date",
                          ("Month", "Events"), partial_last=True) + '</div>',
                          count=str(sum(a["months"])), todo="contact-analysis"))
            + _grid(_card("All customer signals", f'<div class="contact-tab__body">{_signal_rank(c["signals"]) if c["signals"] else ""}</div>'
                          if c["signals"] else _empty("No customer signals yet."), count=c["signal_total"], todo="contact-signals"),
                    _card("Latest activity", f'<div class="contact-tab__body">{m.record_list(_with_icons(c["activity"]), "No activity yet.", more=c.get("activity_more"), timeline=True)}</div>',
                          todo="contact-activity"))
            + _grid(_card("Activity statistics", _facts(rest), todo="contact-analysis"),
                    _card("Content views", _empty("No content views in the last 30 days."), todo="contact-analysis")))


def page_analysis(c):
    pa = c["page_analysis"]
    stats = (f'<div class="contact-tab__body contact-tab__stats">{m.stat("Total impressions", pa["total"], "violet-radix", "chart-no-axes-combined")}'
             f'{m.stat("Impressions per day", pa["per_day"], "indigo", "eye")}{m.stat("Last 12 months", pa["year"], "jade", "calendar")}</div>')
    viewers = m.viewer_list(pa["viewers"], "contact-page-analysis", "No recent viewers.") if pa["viewers"] else _empty("No recent viewers.")
    refs = [[f'<span class="record-screen__cell-truncate" title="{e(u)}">{e(u)}</span>', f'<span class="contact-tab__num">{e(n)}</span>'] for u, n in pa["referrers"]]
    # TODO(backend:RecordScreen) contact-page-analysis: the profile page's impressions, recent viewers and referrers are static → the public profile's site analysis
    return (_card("Profile page", stats, todo="contact-page-analysis",
                  foot='<div class="contact-tab__foot"><span class="contact-tab__count">The contact\'s public profile page</span>'
                       '<a class="btn btn--tertiary btn--sm" href="#" data-backend-todo="contact-page-analysis"><span>View on Site Analysis</span></a></div>')
            + _grid(_card("Recent viewers", f'<div class="contact-tab__body">{viewers}</div>' if pa["viewers"] else viewers, todo="contact-page-analysis"),
                    _rows_card("Referring URLs", [("URL", dict(keep=True, weight=3, fluid=True)), ("Visits", dict(keep=True))],
                               refs, "No referring URLs.", "contact-page-analysis")))


def digital_assets(c):
    d = c.get("assets", {"subs": [], "assets": [], "credits": []})
    sub_links = ('<div class="contact-tab__foot contact-tab__foot--links">'
                 + "".join(f'<a class="btn btn--tertiary btn--sm" href="#" data-backend-todo="contact-digital-assets"><span>{e(x)}</span></a>'
                           for x in ("Subscription history", "Edition circulation", "Service credits")) + '</div>')
    subs = [[e(n), e(t), e(a), e(b), _badge(st, "success" if st == "Active" else "neutral")] for n, t, a, b, st in d["subs"]]
    assets = [[e(n), e(t), e(dt)] for n, t, dt in d["assets"]]
    credits = [[e(n), f'<span class="contact-tab__num">{e(v)}</span>', e(dt)] for n, v, dt in d["credits"]]
    # TODO(backend:RecordScreen) contact-digital-assets: subscriptions, digital assets and service credits are static → the contact's content subscriptions (with reassigned toggle), assets and credit entries
    return (_card("Subscriptions", (_simple_table([("Subscription", dict(keep=True, weight=2, fluid=True)), ("Type", dict(drop=2)),
                                                   ("Start", dict(drop=1)), ("End", dict(keep=True)), ("Status", dict(drop=3))], subs)
                                    if subs else _empty("No subscriptions.")), count=str(len(subs)), todo="contact-digital-assets", foot=sub_links)
            + _grid(_rows_card("Digital assets", [("Asset", dict(keep=True, weight=2, fluid=True)), ("Type", dict(drop=1)),
                                                  ("Added", dict(keep=True))], assets, "No digital assets.", "contact-digital-assets"),
                    _rows_card("Service credit entries", [("Entry", dict(keep=True, weight=2, fluid=True)), ("Credits", dict(keep=True)),
                                                          ("Date", dict(drop=1))], credits, "No service credit entries.", "contact-digital-assets")))


HISTORY_KIND = {"mailing": ("Mailing list", "mail"), "content": ("Content subscription", "book-open"),
                "downloads": ("Media download", "download"), "forums": ("Forum subscription", "messages-square")}


def _when(d):
    from datetime import datetime
    return datetime.strptime(d.split(",")[0].strip(), "%d %b %Y")


def _switch(label, on):
    """A read-only switch (Toggle xxs) for a yes / no preference (designer, 2026-10-07: preferences as
    switches). aria-disabled keeps Toggle.js from flipping it; no --disabled class, so it is not greyed."""
    state = "toggle--active" if on else ""
    return (f'<span class="toggle toggle--xxs {state}" role="switch" aria-checked="{"true" if on else "false"}" '
            f'aria-disabled="true" aria-label="{e(label)}"><span class="toggle__track"><span class="toggle__knob"></span></span></span>'
            f'<span class="contact-pref__state">{"On" if on else "Off"}</span>')


def permissions(c):
    p = c["permissions"]
    # 1. Preferences: yes / no as switches, the rest as text.
    rows = []
    for label, v in p["prefs"]:
        if v in ("Yes", "No"):
            rows.append(m.view_row(label, "html", f'<span class="contact-pref">{_switch(label, v == "Yes")}</span>', compact=True))
        else:
            rows.append(m.view_row(label, "text", v, compact=True))
    prefs = f'<div class="contact-tab__body"><dl class="fact-list">{"".join(rows)}</dl></div>'

    # 4. Terms: the latest accepted version is badged Current; older versions are muted.
    terms = sorted(p["terms"], key=lambda t: _when(t[1]), reverse=True)
    trows = [[(f'{e(n)} {_badge("Current", "success")}' if i == 0 else f'<span class="contact-tab__muted">{e(n)}</span>'),
              (e(d) if i == 0 else f'<span class="contact-tab__muted">{e(d)}</span>')] for i, (n, d) in enumerate(terms)]

    # 2. One history: the four subscription / download histories as a single trail, newest first.
    hist = []
    for kind, (noun, glyph) in HISTORY_KIND.items():
        for item, action, d in p[kind]:
            hist.append((_when(d), (f"{action}: {item}", f"{d} · {noun}", None, glyph)))
    hist = [h for _, h in sorted(hist, key=lambda x: x[0], reverse=True)]
    history = (f'<div class="contact-tab__body">{m.record_list(hist, "", timeline=True)}</div>' if hist
               else _empty("No subscriptions or downloads yet."))
    # TODO(backend:RecordScreen) contact-permissions: preferences, accepted terms, permissions and the merged subscription / download history are static → the contact's preferences, T&C acceptances (latest = Current), user permissions and the mailing-list, content-subscription, media-download and forum-subscription histories
    return (_grid(_card("User preferences", prefs, todo="contact-permissions"),
                  _rows_card("Terms and conditions", [("Terms", dict(keep=True, weight=2, fluid=True)), ("Accepted", dict(keep=True))],
                             trows, "No terms accepted.", "contact-permissions"))
            + _rows_card("User permissions", [("Permission", dict(keep=True, weight=2, fluid=True)), ("Granted", dict(keep=True))],
                         [[e(a), e(b)] for a, b in p["perms"]], "No user permissions.", "contact-permissions")
            + _card("Subscription and download history", history, count=str(len(hist)), todo="contact-permissions"))


TAB_PAGES = {"demographic": demographic, "tasks": tasks, "communication": communication, "commerce": commerce,
             "events": events, "analysis": analysis, "page-analysis": page_analysis,
             "digital-assets": digital_assets, "permissions": permissions}


# ── Tab data (invented, shaped like the live tabs) ───────────────────
FULL.update({
    "task_rows": {"open": [("Send the 2027 renewal proposal", "14 Oct 2026", "Markus Karlsson", "High", "Northbridge Media service renewal Dec 2026", "18 Sep 2026"),
                           ("Book the data-service review call", "21 Oct 2026", "Luis Montiel", "Normal", "Northbridge Media", "1 Oct 2026")],
                  "closed": [("Return the signed DPA", "02 Mar 2026", "Markus Karlsson", "Normal", "Northbridge Media", "27 Feb 2026"),
                             ("Send the 2026 renewal invoice", "05 Dec 2025", "Luis Montiel", "High", "Northbridge Media service renewal Dec 2025", "02 Dec 2025"),
                             ("Walk through the analytics sidebar", "20 Jan 2026", "Luis Montiel", "Low", "Northbridge Media", "12 Jan 2026")]},
    "event_rows": {"attendance": [("Affino Innovation Briefing 2025", "18 Jun 2025", "Attended", "Delegate")], "awards": []},
    "demographics": [("Intranet, Affino, Video Store, Events, Funding, Cookie Armageddon", [("Solution interests", ["Publishing", "Analytics", "Commerce"])]),
                     ("Jobs", [("Interests", ["Content Management", "eCommerce", "eCommunity", "eMedia", "ePromotions", "Analysis", "Campaigns",
                                              "Commerce", "Control", "Media", "Promotion", "Publishing", "Security", "Social"])])],
    "analysis": {"points_total": "671",
                 "month_labels": ["Oct 25", "Nov 25", "Dec 25", "Jan 26", "Feb 26", "Mar 26", "Apr 26", "May 26", "Jun 26", "Jul 26", "Aug 26", "Sep 26"],
                 "months": [3, 2, 6, 4, 5, 1, 2, 3, 2, 5, 4, 0],
                 "points": [("Opportunities", "340"), ("Logins", "120"), ("Campaign messages", "95"), ("Contact notes", "48"),
                            ("Profile views", "30"), ("Events", "25"), ("Searches", "13")],
                 "stats": [("Latest login", "27 Aug 2026, 11:01"), ("Created", "08 Jan 2016, 15:19"), ("Logins (24 hours)", "0"),
                           ("Logins (7 days)", "0"), ("Logins (30 days)", "0"), ("Logins (365 days)", "6"),
                           ("Last forum view", "19 Feb 2026, 17:59"), ("Page views (365 days)", "45"), ("Forum posts", "6"),
                           ("Message clicks", "3"), ("Message opens", "9"), ("Media storage", "0 bytes")]},
    "page_analysis": {"total": "1", "per_day": "0.00", "year": "1", "viewers": [], "referrers": []},
    "assets": {"subs": [("Affino Insight Premium", "Content subscription", "01 Jan 2026", "31 Dec 2026", "Active")],
               "assets": [("Affino 9 platform overview.pdf", "Document", "14 Oct 2025")],
               "credits": [("Support hours bundle (10)", "10", "06 Oct 2026")]},
    "permissions": {"prefs": [("Email format", "HTML"), ("Language", "English"), ("Time zone", "Europe/London"),
                              ("Contact by email", "Yes"), ("Contact by phone", "No"), ("Show in member directory", "Yes")],
                    "terms": [("2018 Affino General Terms and Conditions", "19 Nov 2018, 17:55"), ("2009 Affino General Terms", "17 May 2018, 19:07")],
                    "perms": [], "mailing": [("Affino News", "Subscribed", "08 Jan 2016"), ("Affino Briefing", "Unsubscribed", "02 Mar 2024")],
                    "content": [("Affino Insight Premium", "Subscribed", "01 Jan 2026")],
                    "downloads": [("Affino 9 platform overview.pdf", "Downloaded", "14 Oct 2025"), ("AI plugins for publishers.pdf", "Downloaded", "18 Jun 2026")],
                    "forums": [("Affino Product Updates", "Subscribed", "19 Feb 2026")]},
})
SPARSE.update({
    "task_rows": {"open": [], "closed": []},
    "event_rows": {"attendance": [("Affino Publishing Round Table", "26 Nov 2018", "Attended", "Guest")], "awards": []},
    "demographics": [],
    "analysis": {"points_total": "55",
                 "month_labels": ["Oct 25", "Nov 25", "Dec 25", "Jan 26", "Feb 26", "Mar 26", "Apr 26", "May 26", "Jun 26", "Jul 26", "Aug 26", "Sep 26"],
                 "months": [0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 0],
                 "points": [("Campaign messages", "30"), ("Events", "15"), ("Contact notes", "10")],
                 "stats": [("Latest login", "15 Jun 2022, 15:24"), ("Created", "10 Jan 2016, 22:51"), ("Logins (24 hours)", "0"),
                           ("Logins (7 days)", "0"), ("Logins (30 days)", "0"), ("Logins (365 days)", "0"),
                           ("Last forum view", "15 Jun 2022, 16:01"), ("Page views (365 days)", "0"), ("Forum posts", "523"),
                           ("Message clicks", "-"), ("Message opens", "-"), ("Media storage", "10.05 MB")]},
    "page_analysis": {"total": "0", "per_day": "0.00", "year": "0", "viewers": [], "referrers": []},
    "assets": {"subs": [], "assets": [], "credits": []},
    "permissions": {"prefs": [("Email format", "HTML"), ("Language", "English"), ("Time zone", "Europe/London"),
                              ("Contact by email", "Yes"), ("Contact by phone", "-"), ("Show in member directory", "No")],
                    "terms": [("2018 Affino General Terms and Conditions", "26 Nov 2018, 13:40")],
                    "perms": [], "mailing": [("Affino News", "Subscribed", "26 Nov 2018")], "content": [], "downloads": [], "forums": []},
})


# ── Contact Edit (code-first, 2026-10-09) ───────────────────────────────────────────────────────
# Fields, order, required marks and HELP TEXT verbatim from the live definition,
# AfcCommunityMgr/CC/CRMUserDef.cfm (CProperties slot [8] = help, [13] = required), plus its two
# include templates (AvatarField.cfm after Screen name, CountryFields.cfm after Address 2). Values are
# Olivia Bennett's, invented as on the View. Left out, as the live screen would for this record:
# Password (Add only), Use Account Address (only while the address is empty), Delete CV (only when a
# CV is stored), Alternative Avatar (one control profile only). Custom (a DesignScript include) is
# not built. Source typos are kept so the copy matches what the backend will send.
# TODO(backend:RecordScreen) contact-edit: every value, option list and lookup is static → the contact (Users) + option sources; Save writes the form
def edit_sections(c):
    r = m.edit_row
    H = {
        "title": "Enter the title for the contact",
        "first": "Enter First Name",
        "last": "Enter  last name; note that all entry fields with a tick next to them must be filled in",
        "zone": ("Select the Registration Zone for this Contact. This is used to associate the contact to the designated "
                 "User, Registration and Demographics Profiles and also display the relevant Topic List for topic "
                 "targeting. Note: You will only be able to set this field once."),
        "company": ("Enter the Company / Organisation for the contact. This field could be user-populated from the "
                    "registration process. This is different to an Account which is assigned by your company (see "
                    "Accounts panel below)."),
        "job": "Enter the Job Title for the contact.",
        "notes": ("Enter in notes on the contact, these notes used for internal reference only and will never be "
                  "displayed publicly. Useful for providing additional context and for pasting info on the contact "
                  "quickly for later reference / use."),
        "privacy": ("Select the privacy level for this user. Note that it's strongly advised that you do not change their "
                    "preference unless the user specifically requests you to do so, or you are doing the initial user setup."),
        "advanced": "Select to display the user publicly on the Advanced Public Profile page.",
        "email": "Enter a contact Email address",
        "nickname": "Enter the name by which the user is known on the site.",
        "screen": "Enter a unique Screen Name for the User - this should be SEO friendly.",
        "avatar": ("Select to upload a new Avatar for this user. By default this will be populated from icons selected in "
                   "the Public Profile."),
        "default_avatar": ("Select the default avatar to be displayed on the Profile, This will be displayed if User "
                           "doesn't upload User Icon."),
        "tel": "Enter a contact Telephone number", "business": "Enter a Business Phone number", "mobile": "Enter a Mobile number",
        "best": "Enter the best time to call the account.",
        "topics": ("Add Keyword Tags separated by commas that describe this user. This information will only be displayed "
                   "on the Public side to the user if you use the same topics are are on the My Interest or the "
                   "Registration and Demographic Profiles. Make sure that on a single Zone setup that the Topic List is "
                   "the same as on the Zone, do not create a separate CRM Topic List. For a multi-Zone setup aim to have "
                   "a single taxonomy covering as many zones as possible and set it on the CRM Settings. In the future we "
                   "will enforce just one Taxonomy per Affino instance, and you will simply select the Parent Topic for "
                   "the topic tree you want to use on each Zone / the CRM Topics."),
        "crm_topics": "Select the Topics for this user.",
    }
    details = [
        r("Title", "select", "Ms", options=["Mr", "Mrs", "Ms", "Miss", "Dr", "Prof"], help_text=H["title"]),
        r("First Name", "input", c["name"].split()[0], required=True, help_text=H["first"]),
        r("Last Name", "input", c["name"].split()[-1], required=True, help_text=H["last"]),
        r("Registration Zone", "select", "Affino", required=True, options=["Affino", "Affino Events"], help_text=H["zone"]),
        r("Company / Organisation", "input", "Northbridge Media Ltd", help_text=H["company"]),
        r("Job Title", "input", c.get("job", ""), help_text=H["job"]),
        r("Notes", "textarea", "Prefers email. Renewal conversations go through her, sign-off through the board.", help_text=H["notes"]),
        r("Gender", "radio", "Female", options=["Male", "Female"]),
        # TODO(backend:RecordScreen) contact-edit: Contact Type options come from qAccountTypes (these three are stand-ins)
        r("Contact Type", "radio", "Full account", required=True, options=["Full account", "Registered", "Guest"]),
        r("Privacy Level", "radio", "Members Only", required=True,
          options=["Public Profile", "Friends Only", "Private", "Members Only"], help_text=H["privacy"]),
        r("Advanced Public Profile", "checkbox", False, help_text=H["advanced"]),
        r("Primary Email", "input", c.get("email", ""), help_text=H["email"]),
        r("Secondary Email", "input", "", help_text=H["email"]),
        r("Nickname", "input", "Liv", help_text=H["nickname"]),
        r("Screen name", "input", c["seed"], help_text=H["screen"]),
        r("Avatar", "media", help_text=H["avatar"]),
        r("Default Avatar", "media", help_text=H["default_avatar"]),
        r("Telephone", "input", c.get("tel", ""), help_text=H["tel"]),
        r("Business Phone", "input", "", help_text=H["business"]),
        r("Mobile", "input", c.get("mobile", ""), help_text=H["mobile"]),
        r("Best time to Call", "input", "Mornings, before 11", help_text=H["best"]),
    ]
    accounts = [
        # The live Accounts panel is an include (CRMUserAccountsInclude.cfm): the contact's accounts.
        r("Accounts", "tagbox", tags=c.get("accounts") or [], modal="modal-accounts"),
        r("Former accounts", "tagbox", tags=c.get("former") or [], modal="modal-accounts"),
    ]
    topics = [
        r("Topics", "tagbox", tags=(c.get("topics") or [])[:5], modal="modal-topics", help_text=H["topics"]),
        r("CRM Topics - deprecated", "tagbox", tags=[], modal="modal-topics", help_text=H["crm_topics"]),
    ]
    social = [
        r("X User", "input", "@oliviabennett", help_text="Enter your X ID."),
        r("Facebook Page (Full URL)", "input", "", help_text="Enter in the user's Facebook URL."),
        r("LinkedIn Page (Full URL)", "input", "https://www.linkedin.com/in/olivia-bennett-example", help_text="Enter in the user's LinkedIn URL."),
        r("Instagram User", "input", "", help_text="Enter in the contact's Instagram URL."),
        r("TikTok User", "input", "", help_text="Enter in the contact's TikTok URL."),
        r("YouTube Channel", "input", "", help_text="Enter in the contact's YouTube channel URL."),
    ]
    subs = [
        r("Contact Lists", "tagbox", tags=(c.get("lists") or [])[:4], modal="modal-lists",
          help_text="Select specific contact lists you want to add this contact."),
        r("Forum Subscriptions", "tagbox", tags=[], modal="modal-lists", help_text="Select to Subscribe the User to a Forum."),
        r("Mailing List Subscriptions", "tagbox", tags=c.get("mailing") or [], modal="modal-lists",
          help_text="Select additional Mailing Lists to Subscribe for this User."),
        r("Mailing List Unsubscribes", "tagbox", tags=[], modal="modal-lists",
          help_text=("These are the Mailing Lists that the user has un-subscribed from. You can remove the un-subscribes "
                     "if the user has done so in error, but do not do so without the user's consent.")),
        r("Email Bounced", "checkbox", False, help_text="Tick this to manually manage Email Bounced."),
        r("Unsubscribed from all Marketing", "checkbox", False,
          help_text="If checked, user has opted out of receiving Marketing Messages."),
    ]
    address = [
        r("Address 1", "input", "3rd Floor, 12 Carver Street", help_text="Enter first line of the Address"),
        r("Address 2", "input", "", help_text="Enter second line of the Address"),
        r("Country", "select", "United Kingdom", options=["United Kingdom", "Ireland", "United States"],
          help_text="Select the Country for this Contact."),
        r("County / State", "select", "Greater London", options=["Greater London", "Kent", "Surrey"],
          help_text="Select the County for this Contact."),
        r("Town / City", "select", "London", options=["London"], help_text="Select the City for this Contact."),
        r("Postcode / Zip", "input", "EC2A 4BX", help_text="Enter the PostCode or Zip"),
    ]
    more = [
        r("Statement", "textarea", "", help_text="Add Statement details."),
        r("Biography", "textarea", "Olivia founded Northbridge Media in 2014 and leads its publishing and events business.",
          help_text="Add Biography details. These will be displayed on the Contact's Profile (My Information)."),
        r("Skills", "textarea", "", help_text="Enter in the contact's Skills. These will then optionally be displayed on their public profile."),
        r("Areas Of Specialism", "textarea", "", help_text="Enter the Areas Of Specialism for the contact."),
        r("Education", "textarea", "", help_text="Enter the Education for the contact."),
        r("Innovations", "textarea", "", help_text="Enter the Innovations for the contact."),
        r("Publications", "textarea", "", help_text="Enter the Publications for the contact."),
        r("Roles", "textarea", "", help_text="Enter the role(s) for this contact."),
        r("Special Dietary Needs", "textarea", "", help_text="Enter the Special Dietary Needs for the contact."),
        r("Disability Requirements", "textarea", "", help_text="Enter the Disability Requirements for the contact."),
        r("My Homepage", "select", "Home", options=["Home", "My Information", "My Interests"],
          help_text="Select which page on the site is displayed when the Login has been successful"),
        r("External User ID", "input", "",
          help_text=("Enter an External User ID for users. This can be used to identify users on external systems where "
                     "the doesn't have an email address.")),
    ]
    jobs = [
        r("Upload CV", "file", help_text="Select to upload a CV for this user.", file_icon="file-text"),
        r("Job Seeker", "checkbox", False,
          help_text=("If checked, the user has indicated they are a Job Seeker and Job related profiling for the member "
                     "should be enabled.")),
    ]
    credits = [
        r("Service Credits Threshold", "input", "",
          help_text=("Enter a number for minimum Service Credits threshold. When a customer's Service Credits fall below "
                     "this threshold, an email notification will be sent to Administrators set on the Service Credits "
                     "Profile. This value will override the default setting on the Service Credits Profile.")),
    ]
    sec = m.record_section
    return (sec("Contact Details", details, "edit") + sec("Accounts", accounts, "edit") + sec("Topics", topics, "edit")
            + sec("Social Media", social, "edit") + sec("Profile & Subscriptions", subs, "edit")
            + sec("Main Address", address, "edit") + sec("Additional Information", more, "edit")
            + sec("Job Seeker", jobs, "edit") + sec("Service Credits", credits, "edit"))


def edit_modals(c):
    """The tag pickers' Select dialogs (TagBox → multi-select, as ArticleEdit's Topics)."""
    src = lambda names, group: [(n, "", group, "Affino") for n in names]
    lists = (c.get("lists") or []) + (c.get("mailing") or [])
    return (m.multi_select_modal("modal-accounts", "Select Accounts",
                                 src(["Northbridge Media", "Harbour Retail Group", "Carver Street Events", "Affino"], "Accounts"))
            + m.multi_select_modal("modal-topics", "Select Topics and Keywords", src(c.get("topics") or [], "Topics"))
            + m.multi_select_modal("modal-lists", "Select Lists", src(lists, "Lists")))
