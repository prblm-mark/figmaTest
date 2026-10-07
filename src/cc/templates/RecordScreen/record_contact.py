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
def tabs(view_href):
    names = ["Details", "Demographic", "Tasks", "Communication", "Commerce", "Events",
             "Analysis", "Page analysis", "Digital assets", "Permissions", "Badges"]
    return [(n.lower().replace(" ", "-"), n, view_href if n == "Details" else "#") for n in names]


# The live screen's quick actions and action links. Header rule: one primary (Edit) + one secondary
# (Add note); everything else in the kebab (designer, 2026-09-30).
KEBAB = [(label, ico, f' href="#" data-backend-todo="contact-actions"') for label, ico in [
    ("Add task", "list-todo"), ("Add pro forma", "receipt-pound-sterling"), ("Add to topic", "tag"),
    ("Add to contact list", "list-plus"), ("My contact", "star"), ("Send message", "mail"),
    ("Send info", "send"), ("Relate content", "link-2"), ("Audit user", "history"),
    ("View profile", "external-link"), ("View account", "building-2"), ("Download vCard", "contact")]]
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
    activity = m.record_list(c["activity"], "No activity yet.", more=c.get("activity_more"), todo="contact-activity")

    # "View all" opens the matching CRM tab (Tasks, Communication, Commerce), not built yet.
    more_link = lambda what: (f'<a class="btn btn--tertiary btn--xs" href="#" aria-label="View all {e(what)}" '
                              f'data-backend-todo="contact-crm-tabs"><span>View all</span></a>')
    # TODO(backend:RecordScreen) contact-sidebar: facts, signals, activity, tasks, notes, opportunities, events and engagement are static → the contact's CRM + analysis data (see HANDOVER rows contact-*)
    return "".join([
        m.fact_panel("Record", m.fact_list(facts)),
        m.fact_panel("Customer signals", signals, subtitle=f'{c["signal_total"]} signals'),
        m.fact_panel("Latest activity", activity),
        m.fact_panel("Open tasks", tasks, action=more_link("tasks")),
        m.fact_panel("Contact notes", notes, subtitle=c["notes_count"], action=more_link("contact notes")),
        m.fact_panel("Opportunities", opp_summary + opp_rows, action=more_link("opportunities")),
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
    "file": "ContactView.html", "seed": "olivia-bennett", "name": "Olivia Bennett", "job": "Founder & CEO",
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
