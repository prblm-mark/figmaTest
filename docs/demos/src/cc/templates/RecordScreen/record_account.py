"""Account View + Edit — the record-screen kit filled with a CRM account (code-first, 2026-10-09).

Structure read from the live Control Centre account screens (AfcCommunityMgr/CC/Accounts.cfm:
screen=AccountView → CRMAccountView.cfm, screen=AccountEdit → CRMAccountEdit.cfm, both driven by
CRMAccountDef.cfm): the header's facts and activity (in the sidebar, as Contact View), the 13 tabs,
the Details panels, and the edit form with its help text (CProperties slot [8]) verbatim.

The account is Northbridge Media, Olivia Bennett's account on Contact View, so the two screens agree.
Its people are INVENTED (the live records are personal data and these demos are public): phones in
Ofcom's drama ranges, emails on `.example`.

Mark's scope (2026-10-09): the core tabs built — Details, Contacts, Tasks, Communication, Commerce,
Events, User Analysis, Page Analysis — reusing Contact View's tab builders; Content, Digital Assets,
Projects, Campaign Dashboards and Engagement Report are labels. Sidebar like Contact. Edit builds every
section, including the ones a CRM profile switches on (Public Information, Subscriptions and its two
grids, Overflow Notifications, Event Credits); Advanced (DesignScript custom fields) is not built.
"""
import record_markup as m
import record_contact as ct

e = m.e
VIEW, EDIT = "AccountView.html", "AccountEdit.html"


def page_for(tab):
    return VIEW if tab == "details" else "AccountView" + tab.title().replace("-", "") + ".html"


BUILT = ("details", "contacts", "tasks", "communication", "commerce", "events", "user-analysis", "page-analysis")


def tabs():
    # The live tab order. Communication is the live default (and remembered per user); here Details
    # leads, as every record screen in the kit.
    names = ["Details", "Contacts", "Tasks", "Communication", "Content", "Commerce", "Digital assets", "Projects",
             "Events", "Campaign dashboards", "Engagement report", "User analysis", "Page analysis"]
    out = []
    for n in names:
        key = n.lower().replace(" ", "-")
        out.append((key, n, page_for(key) if key in BUILT else "#"))
    return out


# Header: one primary (Edit) + one secondary (Add contact); the rest of the live CTA row and action
# icons in the kebab (designer rule, 2026-09-30).
KEBAB = [(label, ico, ' href="#" data-backend-todo="account-actions"') for label, ico in [
    ("Add topic", "tag"), ("Add opportunity", "briefcase"), ("Add pro forma", "receipt-pound-sterling"),
    ("Add to account list", "list-plus"), ("Merge account", "merge"), ("Generate account security", "shield-plus"),
    ("Audit account", "history"), ("View public account", "external-link")]]
KEBAB.append(("Go to list", "list", ' href="../ListingScreen/ListingScreen.html" data-keep-width'))
SECONDARY = ("Add contact", "user-plus", ' data-backend-todo="account-actions"')

LOGO = "https://picsum.photos/seed/northbridge-media/160/160"

# The account's people (invented). (name, seed, job, email, last login, roles)
CONTACTS = [
    ("Olivia Bennett", "olivia-bennett", "Founder & CEO", "olivia.bennett@northbridge-media.example", "27 Aug 2026", ["Primary"]),
    ("James Okafor", "james-okafor", "Head of Marketing", "james.okafor@northbridge-media.example", "02 Oct 2026", ["Marketing"]),
    ("Priya Desai", "priya-desai", "Finance Manager", "priya.desai@northbridge-media.example", "18 Sep 2026", ["Invoice"]),
    ("Tom Hartley", "tom-hartley", "Managing Editor", "tom.hartley@northbridge-media.example", "06 Oct 2026", []),
    ("Sarah Lindqvist", "sarah-lindqvist", "Digital Producer", "sarah.lindqvist@northbridge-media.example", "21 Jul 2026", []),
    ("Ben Asante", "ben-asante", "Data Analyst", "ben.asante@northbridge-media.example", "-", []),
]
FORMER = [("Ellen Marsh", "Commercial Director", "Left Mar 2025")]
PENDING = [("Ravi Patel", "ravi.patel@northbridge-media.example", "Registered 04 Oct 2026")]

ACCOUNT = {
    "name": "Northbridge Media", "code": "40217", "type": "Client", "industry": "Publishing",
    "ownership": "Private", "size": "45", "turnover": "£6.2m", "tel": "020 7946 0380", "fax": "-",
    "email": "hello@northbridge-media.example", "website": "https://www.northbridge-media.example",
    "address": ["3rd Floor, 12 Carver Street", "", "", "London", "Greater London", "EC2A 4BX", "United Kingdom"],
    "director": "Markus Karlsson", "manager": "Luis Montiel", "team": ["Markus Karlsson", "Luis Montiel"],
    "topics": ["Analysis", "Campaigns", "Commerce", "Content Management", "eMedia"],
    "company_no": "09481372", "vat": "GB 291 4416 08", "external": "SAGE-NBM-0417",
    "forum": "Northbridge Media support", "parent": "-", "children": [], "associated": ["Carver Street Events"],
    "notes": "Renewal runs December. Olivia signs; Priya handles invoices and the PO numbers.",
    # Contact View's tab helpers read these keys (record_contact.communication / commerce / tasks / events).
    "notes_count": "48 notes", "note_rows": ct.FULL["note_rows"], "opps": ct.FULL["opps"], "opp_rows": ct.FULL["opp_rows"],
    "task_rows": ct.FULL["task_rows"],
    "event_rows": {"attendance": [("Affino Innovation Briefing 2025", "18 Jun 2025", "Attended", "Delegate × 3")],
                   "awards": [("Digital Publishing Awards 2026", "Best B2B Platform", "12 Mar 2026", "Shortlisted")]},
    "page_analysis": {"total": "214", "per_day": "0.59", "year": "214", "viewers": m.VIEWERS[:3],
                      "referrers": [("https://www.google.com/", "61"), ("https://www.linkedin.com/", "18"),
                                    ("https://www.northbridge-media.example/about", "9")]},
    "created": "08 Jan 2016, 15:12", "updated": "06 Oct 2026, 10:41", "first": "08 Jan 2016 · Account created",
    "last": "06 Oct 2026 · Login (Tom Hartley)", "public": "Yes",
}


def _retag(html):
    """Contact View's tab builders mark their tables for the contact handover rows; on the account the
    same tables need the account's rows."""
    return html.replace('data-backend-todo="contact-', 'data-backend-todo="account-')


def _yn(v):
    return "Yes" if v else "No"


# ── View: Details ────────────────────────────────────────────────────────────────────────────────
def view_sections(a):
    t = lambda label, v: m.view_row(label, "text", v or "-")
    tags = lambda label, v: m.view_row(label, "tags", v) if v else m.view_row(label, "text", "-")
    names = lambda role: [n for n, _, _, _, _, r in CONTACTS if role in r]
    main = [
        t("Name", a["name"]), t("Screen name", "northbridge-media"), t("Contacted", "Yes"),
        m.view_row("Notes", "paragraph", a["notes"]),
        m.view_row("Logo", "html", m.media_meta(LOGO, rows=[("Alt text", "Northbridge Media logo"), ("File name", "northbridge-media-logo.png"), ("Size", "160 × 160")])),
        t("Account Type", a["type"]), tags("Primary Contacts", names("Primary")),
        tags("Marketing Contacts", names("Marketing")), tags("Invoice Contacts", names("Invoice")),
        t("Account Forum", a["forum"]), t("External Account ID", a["external"]), t("Company Number", a["company_no"]),
        t("Tax Exempt", "No"), t("VAT Number", a["vat"]), t("Best time to Call", "Weekday mornings"),
        t("Account Director", a["director"]), t("Account Manager", a["manager"]), tags("Account Team", a["team"]),
        t("Industry", a["industry"]), t("Ownership", a["ownership"]), t("Active", "Yes"),
    ]
    social = [t("LinkedIn Page", "https://www.linkedin.com/company/northbridge-media-example"), t("Facebook Page", "-"),
              t("X User", "@northbridgemedia"), t("Instagram User", "-"), t("TikTok User", "-"), t("YouTube Channel", "-")]
    public = [t(label, v) for label, v in PUBLIC_VIEW]
    subs = [t("Account Email Domains", "northbridge-media.example"), t("Restrict To IP Addresses", "-"),
            t("Validate IP Address On Login", "No"), t("Auto Approve Users", "Yes")]
    free = ct._simple_table([("Zone", dict(keep=True)), ("Subscription Plan", dict(keep=True, weight=2, fluid=True)),
                             ("Start Date", dict(drop=3)), ("End Date", dict(drop=2)), ("Assignment Type", dict(drop=1)),
                             ("Max Subs", dict(drop=4)), ("Assigned", dict(keep=True))],
                            [[e(c) for c in r] for r in FREE_SUBS])
    overflow = [t("Send Overflow Notifications", "Account primary contact, Account manager")]
    addresses = [t("Warehouse", "Unit 4, Riverside Trading Estate, Dartford, DA1 5PZ, United Kingdom")]
    audit = [t("Batch Reference", "-"), t("Created", a["created"]), t("Created By", "Markus Karlsson"),
             t("Last Updated", a["updated"]), t("Last Updated By", "Luis Montiel")]
    sec = m.record_section
    # Paid subscriptions and Event credits are empty on this account, and the live view hides an empty grid.
    # TODO(backend:RecordScreen) account-record: every Details value is static → the account (Account + its profile-gated panels, subscriptions, addresses, audit)
    return (sec("Account", main, "view") + sec("Social Media", social, "view")
            + sec("Public Information", public, "view") + sec("Subscriptions", subs, "view")
            + sec("Free Subscriptions", [f'<div class="datatables">{free}</div>'], "view")
            + sec("Overflow Notifications", overflow, "view") + sec("Additional Addresses", addresses, "view")
            + sec("Audit", audit, "view"))


PUBLIC_VIEW = [("Public", "Yes"), ("Public Name", "Northbridge Media"), ("Priority", "5"),
               ("Teaser", "Independent B2B publisher covering media, marketing and events."),
               ("Description", "Northbridge Media publishes three B2B titles and runs the Carver Street events programme."),
               ("Sponsored Account", "No"), ("Message Account", "Yes"), ("Hide From Site Search", "No"),
               ("Hide Logo", "No"), ("Hide Telephone", "No"), ("Hide Email", "Yes"), ("Hide Website", "No"),
               ("Hide Social Icons", "No"), ("Hide Overview Tab", "No"), ("Hide Offices Tab", "Yes"),
               ("Hide Contacts Tab", "No"), ("Hide Articles Tab", "No"), ("Hide Product Tab", "Yes"),
               ("Hide Video Tab", "Yes"), ("Hide Audio Tab", "Yes"), ("Hide Directory Tab", "Yes"), ("Hide Link Tab", "No"),
               ("Hide Associated Accounts Tab", "No"), ("Link to Account Detail From Offices Tab", "No"),
               ("Featured Link Label", "Media pack"), ("Featured Link URL", "https://www.northbridge-media.example/media-pack"),
               ("Open Featured Link In New Tab", "Yes"), ("Featured Contacts", "Olivia Bennett, James Okafor"),
               ("Featured Articles", "-"), ("Featured Images", "-"), ("Featured Documents", "-")]

FREE_SUBS = [("Affino", "Affino Insight Premium", "01 Jan 2026", "31 Dec 2026", "Email domain", "10", "4")]


# ── View: sidebar (the live header's facts and activity) ─────────────────────────────────────────
def sidebar(a):
    addr = ", ".join(x for x in a["address"] if x)
    facts = [("Account code", a["code"]), ("Account type", a["type"]), ("Primary contact", "Olivia Bennett"),
             ("Account manager", a["manager"]), ("Telephone", a["tel"]), ("Email", a["email"]), ("Website", a["website"]),
             ("Address", addr), ("Industry", a["industry"]), ("Company size", a["size"]), ("Turnover", a["turnover"]),
             ("Topics", a["topics"])]
    people = m.record_list([(n, job, ct._badge(r[0], "neutral") if r else None) for n, _, job, _, _, r in CONTACTS[:4]],
                           "No contacts yet.", more=f"{len(CONTACTS) - 4} more contacts", todo="account-contacts")
    tasks = m.record_list([(row[0], f"Due {row[1]} · {row[2]}", None) for row in a["task_rows"]["open"]], "No open tasks.",
                          todo="account-tasks")
    notes = m.record_list([(r[0], f"{r[5]} · {r[6]}", ct._badge(r[2], "neutral")) for r in a["note_rows"][:3]],
                          "No contact notes yet.", more="45 more notes", todo="account-notes")
    o = a["opps"]
    opps = (m.fact_list([("Open", o["open"]), ("Closed", o["closed"]), ("Won value", o["won"])])
            + m.record_list([(n, f"{s} · {d}", ct._badge(v, {"Open": "info", "Closed Won": "success"}.get(s, "neutral")))
                             for n, s, v, d in o["rows"]], "No opportunities yet.", todo="account-opportunities"))
    engagement = [("Total contacts", str(len(CONTACTS))), ("Active contacts", "5"), ("First touch", a["first"]),
                  ("Last touch", a["last"]), ("Updated", a["updated"]), ("Created", a["created"]), ("Public", a["public"])]

    def more_link(what, tab):
        return (f'<a class="btn btn--tertiary btn--xs" href="{page_for(tab)}" aria-label="View all {e(what)}" data-keep-width>'
                f'<span>View all</span></a>')
    # TODO(backend:RecordScreen) account-sidebar: the header facts, contacts, tasks, notes, opportunities and engagement are static → the account's CRM data
    # Quick links: the live header's row (CRMAccountView.cfm) — X and LinkedIn when set, Google / ChatGPT /
    # Perplexity on the account name, the address on Google Maps.
    links = m.quick_links(a["name"], x="@northbridgemedia", linkedin="https://www.linkedin.com/company/northbridge-media-example",
                          address=addr)
    return "".join([
        m.fact_panel("Record", links + m.fact_list(facts)),
        m.fact_panel("Contacts", people, count=(str(len(CONTACTS)), f"{len(CONTACTS)} contacts"), action=more_link("contacts", "contacts")),
        m.fact_panel("Open tasks", tasks, action=more_link("tasks", "tasks")),
        m.fact_panel("Contact notes", notes, count=("48", "48 notes"), action=more_link("contact notes", "communication")),
        m.fact_panel("Opportunities", opps, action=more_link("opportunities", "commerce")),
        m.fact_panel("Engagement", m.fact_list(engagement)),
    ])


# ── View: the other built tabs ───────────────────────────────────────────────────────────────────
def _person(name, seed, sub):
    return (f'<span class="account-tab__person"><span class="avatar avatar--size-2"><img class="portrait" '
            f'src="https://i.pravatar.cc/64?u={e(seed)}" alt=""></span><span class="account-tab__person-text"><a class="datatables__record-link" href="#" '
            f'data-backend-todo="account-contacts">{e(name)}</a><span class="contact-tab__summary">{e(sub)}</span></span></span>')


def contacts_tab(a):
    rows = [[_person(n, seed, job), e(mail), " ".join(ct._badge(r, "neutral") for r in roles) or "-", e(login)]
            for n, seed, job, mail, login, roles in CONTACTS]
    cols = [("Contact", dict(keep=True, weight=2, fluid=True)), ("Email", dict(drop=2)), ("Role", dict(drop=1)),
            ("Last login", dict(keep=True))]
    former = [[e(n), e(job), e(when)] for n, job, when in FORMER]
    pending = [[e(n), e(mail), e(when)] for n, mail, when in PENDING]
    # TODO(backend:RecordScreen) account-contacts: the account's contacts (with primary / marketing / invoice roles), former and pending contacts are static → AccountUser + pending registrations; Add contact opens the account contact form
    return (ct._rows_card("Account contacts", cols, rows, "No contacts yet.", "account-contacts", add="Add contact")
            + ct._grid(ct._rows_card("Former contacts", [("Contact", dict(keep=True, weight=2, fluid=True)), ("Job title", dict(drop=1)),
                                                        ("Left", dict(keep=True))], former, "No former contacts.", "account-contacts"),
                       ct._rows_card("Pending contacts", [("Contact", dict(keep=True, weight=2, fluid=True)), ("Email", dict(drop=1)),
                                                         ("Registered", dict(keep=True))], pending, "No pending contacts.", "account-contacts")))


def communication_tab(a):
    threads = [[f'<a class="datatables__record-link" href="#" data-backend-todo="account-threads">{e(t)}</a>', e(f), e(d)]
               for t, f, d in [("Newsletter module: scheduling question", "Northbridge Media support", "03 Oct 2026"),
                               ("AI assistant answers in the wrong zone", "Northbridge Media support", "11 Sep 2026")]]
    # TODO(backend:RecordScreen) account-threads: the account's forum threads (and its forms and AI questions, not built) are static
    return (_retag(ct.communication(a))
            + ct._rows_card("Account threads", [("Thread", dict(keep=True, weight=3, fluid=True)), ("Forum", dict(drop=1)),
                                                ("Last post", dict(keep=True))], threads, "No threads.", "account-threads"))


def commerce_tab(a):
    orders = [[e(c), ct._badge(s, "success" if s == "Paid Full" else "warning"), f'<span class="contact-tab__num">{e(v)}</span>', e(d)]
              for c, s, v, d in [("100877", "Paid Full", "£17,700.00", "02 Dec 2025"), ("100412", "Paid Full", "£0.00", "27 Nov 2019")]]
    contracts = [[e(n), ct._badge(s, "success" if s == "Active" else "neutral"), e(st), e(en)]
                 for n, s, st, en in [("Affino platform licence 2026", "Active", "01 Jan 2026", "31 Dec 2026"),
                                      ("Affino platform licence 2025", "Expired", "01 Jan 2025", "31 Dec 2025")]]
    # TODO(backend:RecordScreen) account-commerce: orders and contracts (and pro formas, line items, service credits and bills, not built) are static
    return (_retag(ct.commerce(a))
            + ct._grid(ct._rows_card("Orders", [("Order", dict(keep=True)), ("Status", dict(keep=True)), ("Total", dict(drop=1, num=True)),
                                                ("Date", dict(drop=2))], orders, "No orders.", "account-commerce"),
                       ct._rows_card("Contracts", [("Contract", dict(keep=True, weight=2, fluid=True)), ("Status", dict(keep=True)),
                                                   ("Start", dict(drop=2)), ("End", dict(drop=1))], contracts, "No contracts.",
                                     "account-commerce", add="Add contract")))


def user_analysis_tab(a):
    tiles = (f'<div class="contact-tab__tiles">{m.stat("Active contacts", "5", "lagoon", "users")}'
             f'{m.stat("Logins (365 days)", "212", "jade", "log-in")}{m.stat("Page views (365 days)", "1,846", "violet-radix", "eye")}'
             f'{m.stat("Message opens", "96", "orange", "mail-open")}</div>')
    latest = [[e(t), e(who), e(d)] for t, who, d in [("Affino 9.0.11.25 - The Refinement Update", "Tom Hartley", "06 Oct 2026"),
                                                      ("How charities can use Affino AI plugins", "James Okafor", "02 Oct 2026"),
                                                      ("A 12 Step Visual Guide to Affino's GDPR Solution", "Priya Desai", "18 Sep 2026")]]
    most = [[e(t), f'<span class="contact-tab__num">{e(n)}</span>'] for t, n in [("Affino 9.0.11.25 - The Refinement Update", "38"),
                                                                                ("Control Centre roadmap 2027", "24"),
                                                                                ("How charities can use Affino AI plugins", "17")]]
    # TODO(backend:RecordScreen) account-analysis: the account's usage stats, latest and most viewed content are static → the account's contacts' site analysis
    return (tiles + ct._grid(
        ct._rows_card("Latest content views", [("Content", dict(keep=True, weight=3, fluid=True)), ("Viewed by", dict(drop=1)),
                                               ("Date", dict(keep=True))], latest, "No content views yet.", "account-analysis"),
        ct._rows_card("Most viewed content", [("Content", dict(keep=True, weight=3, fluid=True)), ("Views", dict(keep=True, num=True))],
                      most, "No content views yet.", "account-analysis")))


TAB_PAGES = {"contacts": contacts_tab, "tasks": lambda a: _retag(ct.tasks(a)), "communication": communication_tab,
             "commerce": commerce_tab, "events": lambda a: _retag(ct.events(a)), "user-analysis": user_analysis_tab,
             "page-analysis": lambda a: _retag(ct.page_analysis(a))}


# ── Edit ─────────────────────────────────────────────────────────────────────────────────────────
# Every field, its order and its help text verbatim from CRMAccountDef.cfm (slot [8]); Name and Screen
# name are the only required fields (slot [13]). The profile-gated sections are all shown (Mark).
# TODO(backend:RecordScreen) account-edit: values, option lists and lookups are static → the account + option sources; Save writes the form
def edit_sections(a):
    r = m.edit_row
    names = lambda role: [n for n, _, _, _, _, rr in CONTACTS if role in rr]
    HIDE = "Select to hide the {} from the Account screen, including on the Offices tab if this account is a child account."
    TAB = "Select to hide the {} tab from the Account screen."
    PUB = " Note this will be displayed on the Public page if this account is made public."
    main = [
        r("Name", "input", a["name"], required=True, help_text="Enter Account's name"),
        r("Screen name", "input", "northbridge-media", required=True,
          help_text="Enter a unique Screen Name for the Account - this should be SEO friendly."),
        r("Contacted", "checkbox", True, help_text="Select if this Account has been contacted."),
        r("Notes", "textarea", a["notes"], help_text="Enter in useful information you want to keep with this account record."),
        r("Topics", "tagbox", tags=a["topics"], modal="modal-acc-topics", help_text="Select the key terms which match this account."),
        r("Logo", "media", help_text=("Select the Account logo. This will be presented as appropriate and used in correspondence "
                                      "with regards to this account.")),
        # TODO(backend:RecordScreen) account-edit: Account Type, Industry and Ownership options are stand-ins → the CRM option lists
        r("Account Type", "select", a["type"], options=["Client", "Prospect", "Partner", "Supplier"],
          help_text="Select the Account Type for the account"),
        r("Parent Account", "lookup", "", help_text="Select the Parent for this account"),
        r("Child Accounts", "tagbox", tags=a["children"], modal="modal-acc-accounts",
          help_text="Select the accounts which are child accounts for this account."),
        r("Associated Accounts", "tagbox", tags=a["associated"], modal="modal-acc-accounts",
          help_text=("Select Associated Accounts. This can be used to relate other Accounts as brands that not necessarily has a "
                     "Parent/Child relationship. This will be reflected on the Public Account page under the Overview tab. This "
                     "will be sort listed as alphabetical and the top 6 accounts will be shown first and users have the option to "
                     "view all.")),
        r("Account Contacts", "tagbox", tags=[n for n, *_ in CONTACTS], modal="modal-acc-contacts",
          help_text=("Select all the account contacts. This is essential to surface the contacts, their tasks, orders, "
                     "subscriptions analytics and much more. Also essential for main Account for assigning Tasks and Contact "
                     "Notes to team members.")),
        r("Primary Contacts", "tagbox", tags=names("Primary"), modal="modal-acc-contacts",
          help_text="Select the primary contact for the account."),
        r("Marketing Contacts", "tagbox", tags=names("Marketing"), modal="modal-acc-contacts",
          help_text="Select the marketing contacts for this Account."),
        r("Invoice Contacts", "tagbox", tags=names("Invoice"), modal="modal-acc-contacts",
          help_text=("Select the default invoicing contact for the Account. When selected this will populate the Contract "
                     "Invoice Contact fields with the name and email address of this contact.")),
        r("Account Forum", "lookup", a["forum"], help_text="Select the Forum related to this account."),
        r("External Account ID", "input", a["external"],
          help_text="This can be used to store any external Account Id reference e.g. for Sage."),
        r("Company Number", "input", a["company_no"], help_text="This is the UK Companies House number."),
        r("Tax Exempt", "checkbox", False,
          help_text=("Select this if the Account is exempt from paying tax in your country (for example, International "
                     "Accounts).")),
        r("VAT Number", "input", a["vat"],
          help_text=("If the Client is registered for VAT then their number is stored here. This is also displayed on the "
                     "Customer Invoice.")),
        r("Telephone", "input", a["tel"], help_text="Enter the contact Telephone number"),
        r("Best time to Call", "input", "Weekday mornings", help_text="Enter the best time to call the account."),
        r("Fax", "input", "", help_text="Enter the Fax number"),
        r("Email", "input", a["email"], help_text="Enter in the corporate email address."),
        r("Website", "input", a["website"]),   # the one field without help in the source
        r("Account Director", "lookup", a["director"], help_text="Select the Account Director for the account"),
        r("Account Manager", "lookup", a["manager"], help_text="Select the Account Manager for the account"),
        r("Account Team", "tagbox", tags=a["team"], modal="modal-acc-contacts",
          help_text="Select the Account Team Members. These will be default selected for any notifications."),
        r("Industry", "select", a["industry"], options=["Publishing", "Media", "Events", "Charity", "Professional Services"],
          help_text="Select the main Industry for the account"),
        r("Size (Number of staff)", "input", a["size"],
          help_text="Enter the size of company (number of staff). This can be an alphanumeric value."),
        r("Annual Turnover", "input", a["turnover"],
          help_text="Enter the annual company turnover. This can be an alphanumeric value."),
        r("Ownership", "select", a["ownership"], options=["Private", "Public", "Partnership", "Charity"],
          help_text="Select the company ownership structure"),
        r("Active", "checkbox", True, help_text="Tick this box to make this Account Active"),
    ]
    ad = a["address"]
    address = [
        r("Address 1", "input", ad[0], help_text="Enter first line of Address"),
        r("Address 2", "input", ad[1], help_text="Enter second line of Address"),
        r("Address 3", "input", ad[2], help_text="Enter in any additional address information."),
        r("Town / City", "input", ad[3], help_text="Enter the Town or City"),
        r("County / State", "input", ad[4], help_text="Enter the County or Region."),
        r("Postcode / Zip", "input", ad[5], help_text="Enter the PostCode or Zip"),
        r("Country", "select", ad[6], options=["United Kingdom", "Ireland", "United States"], help_text="Select the Country"),
    ]
    social = [
        r("LinkedIn Page (Full URL)", "input", "https://www.linkedin.com/company/northbridge-media-example",
          help_text="Enter in the account's LinkedIn URL. " + PUB),
        r("Facebook Page (Full URL)", "input", "", help_text="Enter in the account's Facebook URL. " + PUB),
        r("X User", "input", "@northbridgemedia", help_text="Enter your account ID for X." + PUB),
        r("Instagram User", "input", "", help_text="Enter in the account's Instagram URL. " + PUB),
        r("TikTok User", "input", "", help_text="Enter in the account's TikTok URL. " + PUB),
        r("YouTube Channel", "input", "", help_text="Enter in the account's YouTube channel URL. " + PUB),
    ]
    pv = dict(PUBLIC_VIEW)
    yn = lambda label: pv[label] == "Yes"
    public = [
        r("Public", "checkbox", yn("Public"),
          help_text="Select to allow this Account to be listed publicly on the Account Listing and Search channels."),
        r("Public Name", "input", pv["Public Name"],
          help_text="The Public Name is shown on the Display side when listing out account information, e.g. on Recruitment Briefs."),
        r("Priority", "select", pv["Priority"], options=[str(i) for i in range(1, 11)],
          help_text=("Select the priority for this Account, when selected, and depending on the default sort set on the "
                     "listing, this Account will be listed based on the priority selected.")),
        r("Teaser", "textarea", pv["Teaser"],
          help_text="Enter the teaser information for this Account, displayed on the Account channel listing."),
        r("Description", "textarea", pv["Description"],
          help_text="Enter a description for this Account. This is used on the Member Accounts channel."),
        r("Sponsored Account", "checkbox", yn("Sponsored Account"),
          help_text="Select to highlight this account on the Accounts Listing channel."),
        r("Message Account", "checkbox", yn("Message Account"),
          help_text=("Select to show a Message Account button on the Account Detail page. If this Account is a Child Account, "
                     "then the Message Account button will also show under the Offices tab. Please note, if you have Show "
                     "Message Account (All) selected on the Account Profile, then that will apply across all Accounts, despite "
                     "if you have this setting selected or not.")),
        r("Hide From Site Search", "checkbox", yn("Hide From Site Search"), help_text="Select to hide this Account from Site Search."),
        r("Hide Logo", "checkbox", yn("Hide Logo"),
          help_text=("Select to hide the Logo from the Account detail and listing screens, including on the Offices tab if "
                     "this account is a child account.")),
    ]
    public += [r(f"Hide {x}", "checkbox", yn(f"Hide {x}"), help_text=HIDE.format(x))
               for x in ("Telephone", "Email", "Website", "Social Icons")]
    public += [r(f"Hide {x} Tab", "checkbox", yn(f"Hide {x} Tab"), help_text=TAB.format(x))
               for x in ("Overview", "Offices", "Contacts", "Articles", "Product", "Video", "Audio", "Directory", "Link",
                         "Associated Accounts")]
    public += [
        r("Link to Account Detail From Offices Tab", "checkbox", yn("Link to Account Detail From Offices Tab"),
          help_text="Select to link to the Account Detail screen from the Offices tab, if this account is a child account."),
        r("Featured Link Label", "input", pv["Featured Link Label"],
          help_text="Enter a label for a featured link tab to be displayed on the Account."),
        r("Featured Link URL", "input", pv["Featured Link URL"],
          help_text="Enter a custom link for this Account. This will create a new tab on the Account linking to this custom URL."),
        r("Open Featured Link In New Tab", "checkbox", yn("Open Featured Link In New Tab"),
          help_text="Select to open the Featured Link in a new browser tab."),
        r("Featured Contacts", "tagbox", tags=["Olivia Bennett", "James Okafor"], modal="modal-acc-contacts",
          help_text=(" Select the Contacts to be featured on the Accounts channel, Overview tab, filter this list by those "
                     "that are selected on Contacts field.").strip()),
        r("Featured Articles", "tagbox", tags=[], modal="modal-acc-content",
          help_text="Select the articles to be shown on the Featured Articles tab for this Account."),
        r("Featured Images", "tagbox", tags=[], modal="modal-acc-content",
          help_text="Select the images to be shown on the Featured Images tab for this Account."),
        r("Featured Documents", "tagbox", tags=[], modal="modal-acc-content",
          help_text="Select the documents to be shown on the Featured Documents tab for this Account."),
    ]
    subs = [
        r("Account Email Domains", "textarea", "northbridge-media.example",
          help_text=("Enter in a comma separated list of email domains, i.e. the part after the @ sign, for this account. This "
                     "will be used in to assign users to this account and ultimately to also auto assign subscriptions if "
                     "applicable. Note that users with matching emails for these domains will be sent a double-confirm email to "
                     "confirm their ownership of the email address they are registering with, whether it is enabled on the "
                     "Registration Profile or not. Once a user is associated with an account with a matching email domain then "
                     "they can't change their email address from the account, this can only be done by an administrator. Also "
                     "note that users are not affect by the Restrict To IP Addresses in this scenario, so they can register "
                     "from any IP address / IP Range.")),
        r("Restrict To IP Addresses", "textarea", "",
          help_text=("Enter a comma or space separated list of IP Addresses or IP Range to restrict registration and "
                     "subscription assignment (if applicable) from these IP Addresses, this will prevent registration to those "
                     "located remotely or from different IP Addresses. Note that users matching an Account Email Domain will "
                     "not be restricted to be located within these IP Addresses / Range. The following IP formats are "
                     "supported: 10.0.0.0, 10.0.0.0/24, 2001:4860:4860::8888, 2001:0db8:85a3:0000:0000:8a2e:0370:7334")),
        r("Validate IP Address On Login", "checkbox", False,
          help_text=("Select to enforce logging in via authorised IP Addresses. set in the Restrict To IP Addresses field. "
                     "Subscriptions will also be assigned if they don't already have the subscription access, i.e. they were "
                     "previously registered before the auto subscription assignment was enabled.")),
        r("Auto Approve Users", "checkbox", True,
          help_text=("Select to automatically approve the user if 'Require Administrator Approval' is selected on "
                     "Registration Profile or 'Require User Approval' is selected on Member Type(s). This will upgrade the "
                     "user to the Granted Content Security Right, add security group from Member Type, send the approval "
                     "notification email, removes them from Pending Users and trigger Added to Security Group customer "
                     "signals.")),
    ]
    # The three include grids (no help text in the source). A column the row only displays is text.
    paid = m.edit_grid("acc-paid-grid", "Assign Paid Subscriptions",
                       [("Order No.", False), ("Payment Status", False), ("Line Item", False), ("Zone", False),
                        ("Subscription Plan", False), ("Start Date", True), ("End Date", True), ("Assignment Type", True),
                        ("Max Subs", True), ("Assigned", False)],
                       [["100877", "Paid", "Affino Insight Premium × 10", "Affino", "Affino Insight Premium", "01 Jan 2026",
                         "31 Dec 2026", "Email domain", "10", "4"]], show_title=False)
    free = m.edit_grid("acc-free-grid", "Assign Free Subscriptions",
                       [("Zone", True), ("Subscription Plan", True), ("Start Date", True), ("End Date", True),
                        ("Assignment Type", True), ("Max Subs", True), ("Assigned", False)],
                       [list(row) for row in FREE_SUBS], show_title=False)
    overflow = [r("Send Overflow Notifications", "tagbox", tags=["Account primary contact", "Account manager"],
                  modal="modal-acc-overflow",
                  help_text=("Select to send a message to the registrant, account primary contact, account manager and/or "
                             "display an on-screen notice when a subscription level has been oversubscribed. The message "
                             "settings are set on the Store Profile."))]
    credits = m.edit_grid("acc-credit-grid", "Event Credits",
                          [("Catalogue Items", True), ("Product Lines", True), ("Total Credits", True), ("Used Credits", False),
                           ("Max Credits per Item", True), ("Start Date", True), ("End Date", True), ("Security Group", True)],
                          [["", "", "", "", "", "", "", ""]], show_title=False)
    sec = m.record_section
    return (sec("Main", main, "edit") + sec("Account Address", address, "edit") + sec("Social Media", social, "edit")
            + sec("Public Information", public, "edit") + sec("Subscriptions", subs, "edit")
            + sec("Assign Paid Subscriptions", [paid], "edit") + sec("Assign Free Subscriptions", [free], "edit")
            + sec("Overflow Notifications", overflow, "edit") + sec("Event Credits", [credits], "edit"))


def edit_modals(a):
    src = lambda names, group: [(n, "", group, "Affino") for n in names]
    return (m.multi_select_modal("modal-acc-topics", "Select Topics and Keywords", src(a["topics"] + ["Events", "Funding"], "Topics"))
            + m.multi_select_modal("modal-acc-accounts", "Select Accounts",
                                   src(["Carver Street Events", "Harbour Lane Publishing", "Clearwater Publishing"], "Accounts"))
            + m.multi_select_modal("modal-acc-contacts", "Select Contacts",
                                   src([n for n, *_ in CONTACTS] + ["Markus Karlsson", "Luis Montiel"], "Contacts"))
            + m.multi_select_modal("modal-acc-content", "Select Content", src(["Media pack 2026", "Northbridge Media at a glance"], "Content"))
            + m.multi_select_modal("modal-acc-overflow", "Select Notifications",
                                   src(["Registrant", "Account primary contact", "Account manager", "On-screen notice"], "Notifications"))
            + m.delete_confirm_modal("modal-delete", "account", a["name"]))
