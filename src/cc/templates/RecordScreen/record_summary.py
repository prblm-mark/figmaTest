"""Record summary panel: three variants for Account + Contact View (code-first, 2026-10-14).

The CEO uses these screens and misses the live header's grey panel (logo, quick actions under it,
key facts, counts and touch dates). Everything in it is still on the kit, but spread between the
header, the kebab and the sidebar's Record / Engagement panels. These variants bring a panel back
ABOVE the tabs (Mark's suggestion), with the logo (account) or avatar (contact) and the quick actions
kept beneath it (CEO).

  B · Compact: a slim band. Logo with icon-only quick actions beneath it, KPI tiles and the next task
               beside it. Facts stay in the sidebar, which is unchanged.
  C · Collapsible: a titled card. Identity + labelled quick actions, facts in a responsive grid,
               KPI tiles under them. "Collapse" folds it to one line (logo, name, actions), remembered.

Variant pages only: AccountViewPanel{A,B,C}.html, ContactViewPanel{A,B,C}.html. The base View pages
are untouched until a variant is chosen.
"""
import record_markup as m

e = m.e
# A (Classic, the live three-column panel) was built and REMOVED 2026-10-14 (Mark: "classic is not good").
VARIANTS = {"B": "Compact", "C": "Collapsible"}

# Pinning (Markus, 2026-10-14): any kebab action can be pinned to the page — per user, per record type,
# 6 at most. These are the defaults a user starts with (ids = m.action_id(label)).
MAX_PINS = 6
ACCOUNT_PINS = ["add-contact", "add-topic", "add-opportunity", "add-pro-forma", "add-to-account-list"]
CONTACT_PINS = ["add-task", "add-pro-forma", "add-to-topic", "add-to-contact-list", "my-contact"]
ORDER_PINS = []   # no panel to inherit from: the pinned row appears once the user pins something


# ── Data: the same records as the View pages ─────────────────────────────────────────────────────
def account_summary(a, contacts, kebab):
    addr = ", ".join(x for x in a["address"] if x)
    task = a["task_rows"]["open"][0] if a["task_rows"]["open"] else None
    return {
        "kind": "account", "name": a["name"],
        "media": '<img class="record-summary__logo" src="northbridge-logo.svg" alt="Northbridge Media logo">',
        # Quick actions = the user's pinned kebab actions (RecordPins.js). The defaults are the live panel's
        # buttons under the logo (CRMAccountView.cfm), in its order.
        "kebab": kebab, "defaults": ACCOUNT_PINS,
        "facts": [("Account code", e(a["code"])), ("Account type", _chip(a["type"])),
                  ("Next task", _next_task(task[0], task[1], task[2]) if task else "-"),
                  ("Telephone", m.phone_copy(a["tel"])), ("Website", m.web_copy(a["website"])), ("Address", e(addr)),
                  ("Topics", "".join(m.topic_chip(t) for t in a["topics"]))],
        "links": m.quick_links(a["name"], x="@northbridgemedia",
                               linkedin="https://www.linkedin.com/company/northbridge-media-example", address=addr),
        "stats": [(str(len(contacts)), "Contacts", "users"), ("5", "Active contacts", "user-check"), ("1,240", "Points", "award"),
                  ("£98,148", "Won value", "badge-pound-sterling")],
        "dates": [("Updated", "06 Oct 2026", "by Luis Montiel"), ("Created", "08 Jan 2016", None),
                  ("First touch", "08 Jan 2016", "Account created"), ("Last touch", "06 Oct 2026", "Login")],
        "next": task[:3] if task else None,
        "signals": [], "subs": a.get("subs", []), "flags": a.get("flags", []),
    }


def contact_summary(c, kebab):
    task = c["tasks"][0] if c["tasks"] else None
    accounts = c.get("accounts") or []
    facts = [("User code", e(c["code"])), ("External user ID", e(c.get("external") or "-")), ("Job title", e(c.get("job") or "-")),
             ("Account", "".join(_chip(x) for x in accounts) or "-"),
             ("Email", m.email_copy(c.get("email"))),
             ("Telephone", m.phone_copy(c.get("tel"))), ("Mobile", m.phone_copy(c.get("mobile"))),
             ("Next task", _next_task(task[0], *task[1].replace("Due ", "").split(" · ")) if task else "-"),
             ("Topics", "".join(m.topic_chip(t) for t in c["topics"]) or "-")]
    first, last = c["first"].split(" · "), c["last"].split(" · ")
    return {
        "kind": "contact", "name": c["name"],
        "media": (f'<span class="avatar avatar--size-5 record-summary__avatar"><img class="portrait" '
                  f'src="https://i.pravatar.cc/160?u={e(c["seed"])}" alt="{e(c["name"])}"></span>'),
        # Defaults: the live contact panel's buttons under the photo (CRMUserView.cfm).
        "kebab": kebab, "defaults": CONTACT_PINS,
        "facts": facts,
        "links": m.quick_links(" ".join(x for x in (c["name"], (accounts or [""])[0]) if x),
                               x=c.get("x"), linkedin=c.get("linkedin")),
        "stats": [(c["points"], "Points", "award"), (c["level"], "Engagement level", "gauge"),
                  (c["signal_total"], "Customer signals", "activity"), (c["login"], "Last login", "log-in")],
        "dates": [("Updated", "06 Oct 2026", "by Markus Karlsson"), ("Created", first[0], None),
                  ("First touch", first[0], first[1]), ("Last touch", last[0], last[1])],
        "next": (task[0],) + tuple(task[1].replace("Due ", "").split(" · ")) if task else None,
        "signals": c.get("signals", []), "subs": c.get("subs", []), "flags": c.get("flags", []),
    }


# ── Small parts ──────────────────────────────────────────────────────────────────────────────────
def _chip(label):
    return f'<span class="badge badge--neutral">{e(label)}</span>'


def _link(href, label=None):
    return f'<a class="record-summary__link" href="{e(href)}">{e(label or href.replace("https://", ""))}</a>'


def _next_task(title, due, who):
    return (f'<span class="record-summary__task"><a class="record-summary__link" href="#">{e(title)}</a>'
            f'<span class="record-summary__meta">Due {e(due)} · {e(who)}</span></span>')


def pinned_actions(kebab, defaults, style):
    """The pinned actions, rendered as RecordPins.js renders them (it re-renders from the user's saved
    pins; this is the no-JS / first-paint default). style: icon (B) · list (C) · bar (no panel)."""
    by_id = {m.action_id(label): (label, ic, attrs) for label, ic, attrs in kebab}
    items = []
    for pid in defaults:
        label, ic, attrs = by_id[pid]
        tip = (f'<span class="tooltip tooltip--arrow-top record-summary__tip" aria-hidden="true"><span class="tooltip__text">{e(label)}</span></span>')
        if style == "icon":
            items.append(f'<li class="record-summary__tip-anchor"><a class="btn btn--secondary btn--icon btn--sm" aria-label="{e(label)}"{attrs}>'
                         f'{m.icon(ic)}</a>{tip}</li>')
        elif style == "bar":
            items.append(f'<li class="record-summary__tip-anchor"><a class="btn btn--secondary btn--xs" aria-label="{e(label)}"{attrs}>'
                         f'{m.icon(ic)}<span class="record-pins__label">{e(label)}</span></a>{tip}</li>')
        else:
            items.append(f'<li><a class="btn btn--tertiary btn--sm"{attrs}>{m.icon(ic)}<span>{e(label)}</span></a></li>')
    if not items and style != "bar":
        items.append('<li class="record-summary__pins-empty">Pin actions from the ⋮ menu</li>')
    # TODO(backend:RecordScreen) record-pinned-actions: pins are saved in localStorage per record type → the user's preferences (GET/PUT the pinned action ids for a record type, max 6)
    return (f'<ul class="record-summary__actions record-summary__actions--{style}" aria-label="Pinned actions" '
            f'data-pinned-actions="{style}" data-default-pins="{",".join(defaults)}" data-max-pins="{MAX_PINS}">{"".join(items)}</ul>')


def _actions(s, style):
    return pinned_actions(s["kebab"], s["defaults"], style)


def pins_bar(kebab, defaults=ORDER_PINS):
    """Screens without a summary panel (Order): a slim row of pinned actions under the header, hidden
    until something is pinned."""
    hidden = "" if defaults else " hidden"
    return (f'<section class="record-pins" aria-label="Pinned actions" data-record-pins-bar{hidden}>'
            f'{pinned_actions(kebab, defaults, "bar")}</section>')


def _facts(s, cls=""):
    rows = "".join(f'<div class="record-summary__fact"><dt>{e(label)}</dt><dd>{v}</dd></div>' for label, v in s["facts"])
    return f'<dl class="record-summary__facts{cls}">{rows}</dl>'


# The figures, in B and in BOTH of C's views, are the DS StatCard (patterns/StatCard), Number First, SOLID icon squares (Mark 2026-10-14, was soft); accents lagoon-first
# (feedback: CC cards lead with lagoon, blue last).
STAT_HUES = ["lagoon", "jade", "violet-radix", "purple"]


def _stat_cards(s):
    cards = "".join(f'<li class="stat-card stat-card--number-first stat-card--{STAT_HUES[i]}">'
                    f'<div class="stat-card__icon-wrap">{m.icon(ic)}</div>'
                    f'<div class="stat-card__text"><p class="stat-card__title">{e(label)}</p><p class="stat-card__value">{e(v)}</p></div></li>'
                    for i, (v, label, ic) in enumerate(s["stats"]))
    return f'<ul class="record-summary__stats record-summary__stats--tiles record-summary__stats--cards" aria-label="Key figures">{cards}</ul>'




def _status(s):
    """The live header's right-hand status (Markus, 2026-10-15): customer signals, active subscriptions as
    badges, and flags as warnings. Each group shows only when it has something; no groups → no strip.
    Expanded view only (C's full view) — not in B or C's compact view (Mark, 2026-10-15)."""
    groups = []
    if s["signals"]:
        groups.append(('Customer signals', m.signal_group(s["signals"]), ""))
    if s["subs"]:
        # Same 32px as the signal circles, one initial (Mark, 2026-10-15); the name is in the tooltip + label.
        badges = "".join(
            f'<li class="record-summary__sub">'
            f'<span class="avatar avatar--size-2 avatar--initials" role="img" aria-label="{e(name)}, active until {e(until)}" data-tip="{e(name)} · active until {e(until)}">{e(abbr)}</span>'
            # The Avatar component's notification dot (top right, green). A sibling, not a child: the Initials
            # type clips its contents (overflow: hidden), which would cut the dot on the circle's corner.
            f'<span class="avatar__dot avatar__dot--green" aria-hidden="true"></span></li>' for name, abbr, until in s["subs"])
        groups.append(("Active subscriptions", f'<ul class="record-summary__subs">{badges}</ul>', ""))
    if s["flags"]:
        flags = "".join(f'<li class="badge badge--warning">{m.icon("triangle-alert")}{e(f)}</li>' for f in s["flags"])
        groups.append(("Flags", f'<ul class="record-summary__flags">{flags}</ul>', " record-summary__status-group--flags"))
    if not groups:
        return ""
    # TODO(backend:RecordScreen) record-status: signals, active subscriptions (product badge images) and flags are static → the record's signals, live subscriptions and flag rules
    return ('<div class="record-summary__status">' + "".join(
        f'<div class="record-summary__status-group{cls}"><span class="record-summary__status-label">{label}</span>{body}</div>'
        for label, body, cls in groups) + '</div>')


# ── The three variants ───────────────────────────────────────────────────────────────────────────
def panel(variant, s):
    label = f'{s["kind"].title()} summary'
    # TODO(backend:RecordScreen) record-summary: the panel's facts, counts and touch dates are static → the record's CRM data (same source as the sidebar's Record + Engagement panels)
    nxt = s["next"]
    task = (f'<div class="record-summary__next"><span class="record-summary__next-label">{m.icon("list-todo")}Next task</span>'
            f'{_next_task(*nxt)}</div>') if nxt else (
        # No open task: keep the box so the row still meets the icons (an empty cell left a hole).
        f'<div class="record-summary__next"><span class="record-summary__next-label">{m.icon("list-todo")}Next task</span>'
        f'<span class="record-summary__meta">No open tasks</span></div>')
    compact_grid = f'''<div class="record-summary__grid">
            <div class="record-summary__identity">{s["media"]}{_actions(s, "icon")}</div>
            <div class="record-summary__body">{_stat_cards(s)}{task}</div>
          </div>'''
    if variant == "B":
        return f'''<section class="record-summary record-summary--compact record-summary--{s["kind"]}" aria-label="{label}">
          {compact_grid}
        </section>'''
    # C (2026-10-14, Mark): expanded = the full view (facts + dates grid); collapsed = B's compact view, not a
    # one-line strip. Both views are in the markup; RecordSummary.js shows one. The compact view carries B's
    # class, so B's rules lay it out unchanged; C's own rules are scoped to the full view.
    # C carries the touch dates in its fact grid (Engagement leaves the account sidebar here too).
    s = dict(s, facts=s["facts"] + [(label, e(v) + (f'<span class="record-summary__meta">{e(sub)}</span>' if sub else ""))
                                     for label, v, sub in s["dates"]])
    return f'''<section class="record-summary record-summary--collapsible record-summary--{s["kind"]}" aria-label="{label}" data-record-summary>
          <header class="record-summary__header">
            <h2 class="record-summary__title">{label}</h2>
            <button type="button" class="btn btn--tertiary btn--xs record-summary__toggle" aria-expanded="true"
                    aria-controls="record-summary-full" data-record-summary-toggle>{m.icon("chevron-up")}<span>Collapse</span></button>
          </header>
          <div class="record-summary__view record-summary__view--full" id="record-summary-full" data-summary-view="full">
            <div class="record-summary__grid">
              <div class="record-summary__identity">{s["media"]}{s["links"]}{_actions(s, "list")}</div>
              <div class="record-summary__body">{_stat_cards(s)}{_facts(s, " record-summary__facts--grid")}{_status(s)}</div>
            </div>
          </div>
          <div class="record-summary__view record-summary--compact" id="record-summary-compact" data-summary-view="compact" hidden>
          {compact_grid}
          </div>
        </section>'''
