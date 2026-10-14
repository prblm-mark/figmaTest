"""Record summary panel: three variants for Account + Contact View (code-first, 2026-10-14).

The CEO uses these screens and misses the live header's grey panel (logo, quick actions under it,
key facts, counts and touch dates). Everything in it is still on the kit, but spread between the
header, the kebab and the sidebar's Record / Engagement panels. These variants bring a panel back
ABOVE the tabs (Mark's suggestion), with the logo (account) or avatar (contact) and the quick actions
kept beneath it (CEO).

  A · Classic: the live panel, modernised. Three columns: identity + stacked quick actions ·
               key facts · activity (quick links, counts, touch dates). Record + Engagement leave the sidebar.
  B · Compact: a slim band. Logo with icon-only quick actions beneath it, KPI tiles and the next task
               beside it. Facts stay in the sidebar, which is unchanged.
  C · Collapsible: a titled card. Identity + labelled quick actions, facts in a responsive grid,
               KPI tiles under them. "Collapse" folds it to one line (logo, name, actions), remembered.

Variant pages only: AccountViewPanel{A,B,C}.html, ContactViewPanel{A,B,C}.html. The base View pages
are untouched until a variant is chosen.
"""
import record_markup as m

e = m.e
VARIANTS = {"A": "Classic", "B": "Compact", "C": "Collapsible"}


# ── Data: the same records as the View pages ─────────────────────────────────────────────────────
def account_summary(a, contacts):
    addr = ", ".join(x for x in a["address"] if x)
    task = a["task_rows"]["open"][0] if a["task_rows"]["open"] else None
    return {
        "kind": "account", "name": a["name"],
        "media": '<img class="record-summary__logo" src="northbridge-logo.svg" alt="Northbridge Media logo">',
        # The live panel's buttons under the logo (CRMAccountView.cfm), in its order.
        "actions": [("Add contact", "user-plus"), ("Add topic", "tag"), ("Add opportunity", "briefcase"),
                    ("Add pro forma", "receipt-pound-sterling"), ("Add to account list", "list-plus")],
        "todo": "account-actions",
        "facts": [("Account code", e(a["code"])), ("Account type", _chip(a["type"])),
                  ("Next task", _next_task(task[0], task[1], task[2]) if task else "-"),
                  ("Telephone", e(a["tel"])), ("Website", _link(a["website"])), ("Address", e(addr)),
                  ("Topics", "".join(_chip(t) for t in a["topics"]))],
        "links": m.quick_links(a["name"], x="@northbridgemedia",
                               linkedin="https://www.linkedin.com/company/northbridge-media-example", address=addr),
        "stats": [(str(len(contacts)), "Contacts"), ("5", "Active contacts"), ("1,240", "Points"), ("£98,148", "Won value")],
        "dates": [("Updated", "06 Oct 2026", "by Luis Montiel"), ("Created", "08 Jan 2016", None),
                  ("First touch", "08 Jan 2016", "Account created"), ("Last touch", "06 Oct 2026", "Login")],
        "next": task[:3] if task else None,
    }


def contact_summary(c):
    task = c["tasks"][0] if c["tasks"] else None
    accounts = c.get("accounts") or []
    facts = [("User code", e(c["code"])), ("Job title", e(c.get("job") or "-")),
             ("Account", "".join(_chip(x) for x in accounts) or "-"),
             ("Email", _link("mailto:" + c["email"], c["email"]) if c.get("email") else "-"),
             ("Telephone", e(c.get("tel") or "-")), ("Mobile", e(c.get("mobile") or "-")),
             ("Next task", _next_task(task[0], *task[1].replace("Due ", "").split(" · ")) if task else "-"),
             ("Topics", "".join(_chip(t) for t in c["topics"]) or "-")]
    first, last = c["first"].split(" · "), c["last"].split(" · ")
    return {
        "kind": "contact", "name": c["name"],
        "media": (f'<span class="avatar avatar--size-5 record-summary__avatar"><img class="portrait" '
                  f'src="https://i.pravatar.cc/160?u={e(c["seed"])}" alt="{e(c["name"])}"></span>'),
        # The live contact panel's buttons under the photo (CRMUserView.cfm).
        "actions": [("Add task", "list-todo"), ("Add pro forma", "receipt-pound-sterling"), ("Add to topic", "tag"),
                    ("Add to contact list", "list-plus"), ("My contact", "star")],
        "todo": "contact-actions",
        "facts": facts,
        "links": m.quick_links(" ".join(x for x in (c["name"], (accounts or [""])[0]) if x),
                               x=c.get("x"), linkedin=c.get("linkedin")),
        "stats": [(c["points"], "Points"), (c["level"], "Engagement level"), (c["signal_total"], "Customer signals"),
                  (c["login"], "Last login")],
        "dates": [("Updated", "06 Oct 2026", "by Markus Karlsson"), ("Created", first[0], None),
                  ("First touch", first[0], first[1]), ("Last touch", last[0], last[1])],
        "next": (task[0],) + tuple(task[1].replace("Due ", "").split(" · ")) if task else None,
    }


# ── Small parts ──────────────────────────────────────────────────────────────────────────────────
def _chip(label):
    return f'<span class="badge badge--neutral">{e(label)}</span>'


def _link(href, label=None):
    return f'<a class="record-summary__link" href="{e(href)}">{e(label or href.replace("https://", ""))}</a>'


def _next_task(title, due, who):
    return (f'<span class="record-summary__task"><a class="record-summary__link" href="#">{e(title)}</a>'
            f'<span class="record-summary__meta">Due {e(due)} · {e(who)}</span></span>')


def _actions(s, style):
    todo = f' data-backend-todo="{s["todo"]}"'
    if style == "icon":  # B: icon-only, the label in aria-label + title
        # The DS Tooltip (components/Tooltip) on hover + keyboard focus; the button's own name is its aria-label,
        # so the tooltip is aria-hidden rather than read twice.
        items = "".join(f'<li class="record-summary__tip-anchor"><button type="button" class="btn btn--secondary btn--icon btn--sm" '
                        f'aria-label="{e(label)}"{todo}>{m.icon(ic)}</button>'
                        f'<span class="tooltip record-summary__tip" aria-hidden="true"><span class="tooltip__text">{e(label)}</span></span></li>'
                        for label, ic in s["actions"])
    else:  # A: stacked secondary xs · C: labelled list rows
        kind = "btn--secondary btn--xs" if style == "stack" else "btn--tertiary btn--sm"
        items = "".join(f'<li><button type="button" class="btn {kind}"{todo}>{m.icon(ic)}<span>{e(label)}</span></button></li>'
                        for label, ic in s["actions"])
    return f'<ul class="record-summary__actions record-summary__actions--{style}" aria-label="Quick actions">{items}</ul>'


def _facts(s, cls=""):
    rows = "".join(f'<div class="record-summary__fact"><dt>{e(label)}</dt><dd>{v}</dd></div>' for label, v in s["facts"])
    return f'<dl class="record-summary__facts{cls}">{rows}</dl>'


def _stats(s, cls=""):
    tiles = "".join(f'<li class="record-summary__stat"><span class="record-summary__stat-value">{e(v)}</span>'
                    f'<span class="record-summary__stat-label">{e(label)}</span></li>' for v, label in s["stats"])
    return f'<ul class="record-summary__stats{cls}" aria-label="Key figures">{tiles}</ul>'


def _dates(s):
    rows = "".join(f'<div class="record-summary__date"><dt>{e(label)}</dt><dd><span>{e(v)}</span>'
                   + (f'<span class="record-summary__meta">{e(sub)}</span>' if sub else "") + '</dd></div>'
                   for label, v, sub in s["dates"])
    return f'<dl class="record-summary__dates">{rows}</dl>'


# ── The three variants ───────────────────────────────────────────────────────────────────────────
def panel(variant, s):
    label = f'{s["kind"].title()} summary'
    # TODO(backend:RecordScreen) record-summary: the panel's facts, counts and touch dates are static → the record's CRM data (same source as the sidebar's Record + Engagement panels)
    if variant == "A":
        return f'''<section class="record-summary record-summary--classic record-summary--{s["kind"]}" aria-label="{label}">
          <div class="record-summary__grid">
            <div class="record-summary__identity">{s["media"]}{_actions(s, "stack")}</div>
            {_facts(s)}
            <div class="record-summary__activity">{s["links"]}{_stats(s, " record-summary__stats--list")}{_dates(s)}</div>
          </div>
        </section>'''
    if variant == "B":
        nxt = s["next"]
        task = (f'<div class="record-summary__next"><span class="record-summary__next-label">{m.icon("list-todo")}Next task</span>'
                f'{_next_task(*nxt)}</div>') if nxt else ''
        return f'''<section class="record-summary record-summary--compact record-summary--{s["kind"]}" aria-label="{label}">
          <div class="record-summary__grid">
            <div class="record-summary__identity">{s["media"]}{_actions(s, "icon")}</div>
            <div class="record-summary__body">{_stats(s, " record-summary__stats--tiles")}{task}</div>
          </div>
        </section>'''
    # C carries the touch dates in its fact grid (Engagement leaves the account sidebar here too).
    s = dict(s, facts=s["facts"] + [(label, e(v) + (f'<span class="record-summary__meta">{e(sub)}</span>' if sub else ""))
                                     for label, v, sub in s["dates"]])
    return f'''<section class="record-summary record-summary--collapsible record-summary--{s["kind"]}" aria-label="{label}" data-record-summary>
          <header class="record-summary__header">
            <h2 class="record-summary__title">{label}</h2>
            <button type="button" class="btn btn--tertiary btn--xs record-summary__toggle" aria-expanded="true"
                    aria-controls="record-summary-body" data-record-summary-toggle>{m.icon("chevron-up")}<span>Collapse</span></button>
          </header>
          <div class="record-summary__grid">
            <div class="record-summary__identity">{s["media"]}<p class="record-summary__name">{e(s["name"])}</p>{s["links"]}{_actions(s, "list")}</div>
            <div class="record-summary__body" id="record-summary-body">{_facts(s, " record-summary__facts--grid")}{_stats(s, " record-summary__stats--tiles")}</div>
          </div>
        </section>'''
