"""Order View — the record-screen kit filled with an order (code-first, "build first", 2026-10-07).

Structure read from the live Control Centre order screen (/control/order-processing?OrderCode=100412):
the order facts, the line items with their attendee assignment, the payment and its payment rows, the
customer and end user, the invoice / billing / delivery addresses, delivery, the extra order data, the
audit facts and the status history; and the screen's processing actions (send receipt, with invoice,
message with invoice, view invoice, shipping label, despatch notification).

The order, its product and its dates are the live order's. The CUSTOMER is invented: the live record
holds real personal details and these demos are public. Phone numbers are Ofcom's drama range
(020 7946 0xxx), emails use `.example`, the IP is the documentation range (203.0.113.0/24).

Scope (designer, 2026-10-07): View + processing actions — the actions open working demo modals
(OrderView.js) that update the page in memory and confirm with a toast.
"""
import record_markup as m

e = m.e
FILE = "OrderView.html"

# listing-data.js ORDER_STATUSES — the order-status set the Orders listing filters on.
STATUSES = ["Incomplete", "New", "Paid Partial", "Paid Full", "Cancelled", "Shipped Partial", "Shipped", "Completed",
            "On Hold", "Released for Delivery", "Back Ordered", "Pending Return", "Returned", "Partially Refunded",
            "Refunded", "Exported"]
# A status reads by its state: done (success), waiting on someone (warning), moving (info), stopped (neutral).
# Mirrored in OrderView.js (STATUS_TONE) so a changed status takes the same badge.
STATUS_TONE = {"Paid Full": "success", "Shipped": "success", "Completed": "success",
               "Incomplete": "warning", "Paid Partial": "warning", "Shipped Partial": "warning", "On Hold": "warning",
               "Back Ordered": "warning", "Pending Return": "warning",
               "New": "info", "Released for Delivery": "info", "Exported": "info",
               "Cancelled": "neutral", "Returned": "neutral", "Partially Refunded": "neutral", "Refunded": "neutral"}
COURIERS = ["Royal Mail", "Parcelforce", "DPD", "DHL", "UPS", "Collected in person"]

ORDER = {
    "code": "100412", "status": "Paid Full", "type": "New Business", "store": "Affino Store", "zone": "Affino",
    "owner": "Markus Karlsson", "account": "Harbour Lane Publishing", "created": "27 Nov 2019, 07:07",
    "payment": {"method": "No charge", "status": "Paid",
                "rows": [("27 Nov 2019, 07:07:05", "£0.00", "£0.00", "-")]},
    "items": [("Affino Innovation Briefing 2019 - Actionable Intelligence, Case Study and 2020 Roadmap", "AIB2019",
               "1", "£0.00", "£0.00", "£0.00", "£0.00", "Event")],
    "seats": 1,
    "totals": [("Subtotal", "£0.00"), ("Tax", "£0.00"), ("Total", "£0.00")],
    "history": [("Paid Full", "27 Nov 2019, 07:07", "check"), ("Payment received: £0.00", "27 Nov 2019, 07:07", "badge-pound-sterling"),
                ("Incomplete", "27 Nov 2019, 07:07", "shopping-cart")],
}

# The invented customer (and the end user — the same person on this order, as on the live one).
CUSTOMER = {"name": "Thomas Reid", "first": "Thomas", "last": "Reid", "email": "thomas.reid@harbourlane.example",
            "member": "Full account", "job": "Head of Digital", "company": "Harbour Lane Publishing",
            "tel": "020 7946 0592"}
ADDRESS = ["Harbour Lane Publishing Ltd", "4 Quay Street", "Bristol", "BS1 4DB", "United Kingdom"]


def tone(status):
    return STATUS_TONE.get(status, "neutral")


def status_badge(status):
    # data-order-status: every badge for the order's status, so a status change repaints them all (OrderView.js).
    return f'<span class="badge badge--{tone(status)}" data-order-status>{e(status)}</span>'


def _badge(label, t):
    return f'<span class="badge badge--{t}">{e(label)}</span>'


# ── Header ───────────────────────────────────────────────────────────
# One primary (Edit) + one secondary (Update status, the screen's day-to-day job); the live screen's
# receipt, invoice, label and despatch links go in the kebab (CC header rule, designer 2026-09-30).
def _open(mid):
    return f' href="#" aria-haspopup="dialog" data-record-modal-open="{mid}"'


KEBAB = [
    ("Send receipt", "receipt", _open("modal-order-receipt")),
    ("Send receipt with invoice", "file-text", _open("modal-order-receipt-invoice")),
    ("Send message with invoice", "mail", _open("modal-order-message")),
    ("View invoice", "file-search", ' href="#" data-backend-todo="order-invoice"'),
    ("Generate shipping label", "printer", ' href="#" data-order-label data-backend-todo="order-shipping-label"'),
    ("Despatch notification", "truck", _open("modal-order-despatch")),
    ("Go to list", "list", ' href="../ListingScreen/ListingScreen.html" data-keep-width'),
]
SECONDARY = ("Update status", "refresh-cw", ' aria-haspopup="dialog" data-record-modal-open="modal-order-status"')


# ── Main column ──────────────────────────────────────────────────────
def _th(label, keep=False, drop=None, weight=None, fluid=False, num=False):
    attrs = (" data-keep" if keep else "") + (f' data-drop="{drop}"' if drop else "") + \
            (f' data-weight="{weight}"' if weight else "") + (" data-fluid" if fluid else "")
    cls = ' class="contact-tab__num"' if num else ""
    return f"<th{cls}{attrs}>{e(label)}</th>"


def _table(head, rows, cls=""):
    return (f'<div class="datatables__body"><table class="table{cls}" data-fit="even"><thead><tr>{head}</tr></thead>'
            f'<tbody>{"".join(rows)}</tbody></table></div>')


def _card(title, body, count=None, action="", tid=None, todo=None):
    tid = tid or "order-" + "".join(ch for ch in title.lower() if ch.isalnum())
    chip = (" " + m.count_chip(*count)) if count else ""
    attr = f' data-backend-todo="{todo}"' if todo else ""
    return f'''<section class="datatables datatables--orders contact-tab order-card" aria-labelledby="{tid}"{attr}>
          <div class="datatables__toolbar contact-tab__head">
            <h2 class="contact-tab__title" id="{tid}">{e(title)}{chip}</h2>{action}
          </div>
          {body}
        </section>'''


def line_items(o):
    head = (_th("Description", keep=True, weight=3, fluid=True) + _th("Item code", drop=3) + _th("Quantity", keep=True, num=True)
            + _th("Original price", drop=2, num=True) + _th("Discount", drop=1, num=True) + _th("Unit price", drop=4, num=True)
            + _th("Line total", keep=True, num=True) + _th("Type", drop=5))
    rows = [f'<tr><td><a class="datatables__record-link" href="#" data-backend-todo="order-items">{e(d)}</a></td><td>{e(code)}</td>'
            f'<td class="contact-tab__num">{e(q)}</td><td class="contact-tab__num">{e(op)}</td><td class="contact-tab__num">{e(disc)}</td>'
            f'<td class="contact-tab__num">{e(up)}</td><td class="contact-tab__num">{e(lt)}</td><td>{_badge(t, "neutral")}</td></tr>'
            for d, code, q, op, disc, up, lt, t in o["items"]]
    totals = "".join(f'<div class="order-totals__row{" order-totals__row--total" if k == "Total" else ""}">'
                     f'<dt>{e(k)}</dt><dd class="contact-tab__num">{e(v)}</dd></div>' for k, v in o["totals"])
    # The live line's attendee table (event products): who holds each place. "0 of 1 assigned" until
    # someone is added; Add attendees opens the form and the row appears here (OrderView.js).
    att_head = (_th("Attendee", keep=True, weight=2, fluid=True) + _th("Email", drop=4) + _th("Job title", drop=2)
                + _th("Company", drop=3) + _th("Business phone", drop=1))
    attendees = f'''<div class="order-attendees" data-order-attendees data-seats="{o["seats"]}">
            <div class="order-attendees__head">
              <h3 class="order-attendees__title" id="order-attendees-title">Attendees
                <span class="badge badge--warning" data-order-assigned>0 of {o["seats"]} assigned</span></h3>
              <button type="button" class="btn btn--secondary btn--sm" aria-haspopup="dialog" data-record-modal-open="modal-order-attendee"
                      aria-label="Add attendees" data-order-add-attendee>{m.icon("user-plus")}<span class="contact-tab__btn-label">Add attendees</span></button>
            </div>
            <p class="order-attendees__empty" data-order-attendees-empty>No attendees assigned to this place yet.</p>
            <div class="order-attendees__table" data-order-attendees-table hidden>{_table(att_head, [], " order-attendees__list")}</div>
          </div>'''
    # TODO(backend:RecordScreen) order-items: the line items, totals and attendees are static → the order's OrderItem rows + their attendee assignments (EventAttendee by OrderItem); Add attendees POSTs an assignment
    return _card("Line items", _table(head, rows) + attendees + f'<dl class="order-totals">{totals}</dl>',
                 count=(str(len(o["items"])), f'{len(o["items"])} line item'), todo="order-items")


def view_sections(o, c):
    t = lambda label, v: m.view_row(label, "text", v or "-")
    order = [t("Order number", o["code"]), t("External order ID", None),
             m.view_row("Order status", "html", status_badge(o["status"])), t("Order type", o["type"]),
             t("Sub order type", None), t("Store", o["store"]), t("Zone", o["zone"]),
             m.view_row("Customer account", "tags", [o["account"]]), t("Order owner", o["owner"]),
             t("CRM topics", None), t("Order notes", None)]
    p = o["payment"]
    pay_rows = [f'<tr><td>{e(d)}</td><td class="contact-tab__num">{e(a)}</td><td class="contact-tab__num">{e(x)}</td><td>{e(ext)}</td></tr>'
                for d, a, x, ext in p["rows"]]
    pay_table = _table(_th("Payment date", keep=True, weight=2, fluid=True) + _th("Amount", keep=True, num=True)
                       + _th("Tax", drop=2, num=True) + _th("External code", drop=1), pay_rows)
    payment = [t("Payment method", p["method"]), m.view_row("Payment status", "html", _badge(p["status"], "success")),
               t("Gateway reference", None), t("Payment ID", None), t("Payment provider return", None)]
    customer = [t("Name", c["name"]), t("Email", c["email"]), t("Member type", c["member"]), t("Job title", c["job"]),
                t("Company VAT number", None), t("End user", c["name"]), t("End user email", c["email"])]
    addr = "<br>".join(e(x) for x in [c["name"]] + ADDRESS + [c["tel"]])
    addresses = [m.view_row(label, "html", f'<address class="order-address">{addr}</address>')
                 for label in ("Invoice address", "Billing address", "Delivery address")]
    delivery = [t("Delivery time frame", None),
                m.view_row("AWB details", "html", '<span data-order-awb>-</span>'),
                m.view_row("Invoices sent", "html", '<span data-order-invoices>0</span>')]
    more = [t("Comments", None), t("Custom data", None), t("Gift Aid", "No"), t("Checkout journey", None)]
    # TODO(backend:RecordScreen) order-record: the order, payment, customer, addresses, delivery and extra data are static → the order (Orders / OrderPayment / OrderAddress), its customer and end user
    return (m.record_section("Order", order, "view")
            + line_items(o)
            + m.record_section("Payment", payment, "view")
            + _card("Payment details", pay_table, count=(str(len(p["rows"])), f'{len(p["rows"])} payment'), todo="order-record")
            + m.record_section("Customer", customer, "view")
            + m.record_section("Addresses", addresses, "view")
            + m.record_section("Delivery", delivery, "view")
            + m.record_section("Additional information", more, "view"))


# ── Sidebar ──────────────────────────────────────────────────────────
def sidebar(o, c):
    facts = m.fact_list([("Order number", o["code"]), ("Total", o["totals"][-1][1]), ("Items", str(len(o["items"]))),
                         ("Payment", o["payment"]["status"]), ("Created", o["created"]), ("Owner", o["owner"])])
    status = (f'<div class="order-status" data-order-status-panel>{status_badge(o["status"])}'
              f'<button type="button" class="btn btn--tertiary btn--xs" aria-haspopup="dialog" data-record-modal-open="modal-order-status">'
              f'<span>Change</span></button></div>')
    history = m.record_list([(t, when, None, g) for t, when, g in o["history"]], "No status changes yet.",
                            todo="order-history", timeline=True)
    customer = m.fact_list([("Name", c["name"]), ("Company", c["company"]), ("Email", c["email"]), ("Telephone", c["tel"])])
    view_contact = ('<a class="btn btn--tertiary btn--xs" href="ContactView.html" aria-label="View the customer\'s contact record" '
                    'data-keep-width data-backend-todo="order-record"><span>View contact</span></a>')
    notes = m.record_list([], "No order notes yet.", todo="order-notes")
    add_note = ('<button type="button" class="btn btn--tertiary btn--xs" aria-label="Create a note" '
                'data-backend-todo="order-notes"><span>Create note</span></button>')
    task = m.record_list([], "No next task.", todo="order-notes")
    add_task = ('<button type="button" class="btn btn--tertiary btn--xs" aria-label="Create a task" '
                'data-backend-todo="order-notes"><span>Create task</span></button>')
    audit = m.fact_list([("IP address", "203.0.113.48"), ("Browser", "Chrome 78 · macOS 10.15"), ("Batch reference", "-"),
                         ("Created", o["created"]), ("Created by", c["name"])])
    # TODO(backend:RecordScreen) order-history: the status history is static → the order's status log (OrderStatusHistory), newest first; status changes made here are appended in memory only
    return "".join([
        m.fact_panel("Status", status + facts),
        m.fact_panel("Status history", f'<div data-order-history>{history}</div>'),
        m.fact_panel("Customer", customer, action=view_contact),
        m.fact_panel("Contact notes", notes, action=add_note),
        m.fact_panel("Next task", task, action=add_task),
        m.fact_panel("Audit", audit),
    ])


# ── Processing modals (OrderView.js runs them) ───────────────────────
def _field_input(fid, label, value="", required=False, kind="text", placeholder="", focus=False):
    req = '<span class="field-row__required" aria-hidden="true">*</span>' if required else ""
    reqattr = ' required aria-required="true"' if required else ""
    ph = f' placeholder="{e(placeholder)}"' if placeholder else ""
    return f'''<div class="input">
          <label class="input__label" for="{fid}">{e(label)}{req}</label>
          <div class="input__wrap"><input id="{fid}" type="{kind}" class="input__control" value="{e(value)}"{reqattr}{ph}{" data-modal-autofocus" if focus else ""}></div>
          <span class="input__help" id="{fid}-help" hidden></span>
        </div>'''


def _field_select(fid, label, options, value, focus=False):
    sel = ' aria-selected="true"'
    items = "".join(f'<li><button type="button" class="sel__menu-item{" sel__menu-item--selected" if o == value else ""}" role="option"'
                    f'{sel if o == value else ""}>{e(o)}</button></li>' for o in options)
    return f'''<div class="sel" data-sel>
          <label class="sel__label" for="{fid}">{e(label)}</label>
          <button id="{fid}" class="sel__control" type="button" data-sel-trigger aria-haspopup="listbox"{" data-modal-autofocus" if focus else ""}>
            <span class="sel__value">{e(value)}</span>
            <span class="sel__chevron">{m.icon("chevron-down")}</span>
          </button>
          <ul class="sel__menu" role="listbox">{items}</ul>
        </div>'''


def _field_textarea(fid, label, value="", placeholder=""):
    return f'''<div class="textarea">
          <label class="textarea__label" for="{fid}">{e(label)}</label>
          <textarea class="textarea__control" id="{fid}" rows="3" placeholder="{e(placeholder)}">{e(value)}</textarea>
        </div>'''


def _field_check(fid, label, helper, checked=True):
    return f'''<label class="checkbox">
          <input type="checkbox" class="checkbox__input" id="{fid}"{" checked" if checked else ""}>
          <span class="checkbox__indicator">{m.icon("check")}</span>
          <span class="checkbox__label"><span class="checkbox__label-text">{e(label)}</span>
            <span class="checkbox__helper">{e(helper)}</span></span>
        </label>'''


def _modal(mid, title, sub, body, submit, action, ico, todo):
    return f'''<div class="modal-overlay" id="{mid}" role="presentation">
    <div class="modal order-modal" role="dialog" aria-modal="true" aria-labelledby="{mid}-title">
      {m._modal_head(mid, title, sub)}
      <!-- TODO(backend:RecordScreen) {todo}: the action updates the page in memory only (OrderView.js) → the order-processing endpoint -->
      <form class="modal__body order-modal__form" id="{mid}-form" data-order-form="{action}" novalidate>{body}</form>
      <div class="modal__footer">
        <button type="button" class="btn btn--secondary" data-modal-cancel>Cancel</button>
        <button type="submit" class="btn btn--primary" form="{mid}-form" data-order-submit="{action}" data-backend-todo="{todo}">{m.icon(ico)}<span>{e(submit)}</span></button>
      </div>
    </div>
  </div>'''


def modals(o, c):
    status = _modal("modal-order-status", "Update order status", f"Order {o['code']} is {o['status']}.",
                    _field_select("order-status-new", "New status", STATUSES, o["status"], focus=True)
                    + _field_textarea("order-status-note", "Note (optional)", placeholder="Why the status changed, for the history")
                    + _field_check("order-status-notify", "Email the customer", f"Sends the status update to {c['email']}", False),
                    "Update status", "status", "check", "order-status")
    receipt = lambda mid, title, action, sub, extra="": _modal(
        mid, title, sub,
        _field_input(f"{mid}-to", "To", c["email"], required=True, kind="email", focus=True)
        + _field_input(f"{mid}-cc", "Cc (optional)", kind="email", placeholder="name@company.com") + extra,
        "Send", action, "send", "order-send")
    send = receipt("modal-order-receipt", "Send receipt", "receipt", f"The receipt for order {o['code']}.")
    send_inv = receipt("modal-order-receipt-invoice", "Send receipt with invoice", "receipt-invoice",
                       f"The receipt with invoice {o['code']} attached as a PDF.")
    message = receipt("modal-order-message", "Send message with invoice", "message",
                      f"A message of your own, with invoice {o['code']} attached.",
                      _field_input("modal-order-message-subject", "Subject", f"Your invoice for order {o['code']}", required=True)
                      + _field_textarea("modal-order-message-body", "Message",
                                        f"Dear {c['first']},\n\nPlease find attached the invoice for order {o['code']}.\n\nKind regards,\n{o['owner']}"))
    despatch = _modal("modal-order-despatch", "Despatch notification", "Tells the customer the order is on its way and marks it Shipped.",
                      _field_select("order-courier", "Courier", COURIERS, COURIERS[0], focus=True)
                      + _field_input("order-awb", "Tracking / AWB number", required=True, placeholder="e.g. JD014600006781234567")
                      + _field_check("order-despatch-notify", "Email the customer", f"Sends the despatch notification to {c['email']}"),
                      "Mark as shipped", "despatch", "truck", "order-despatch")
    attendee = _modal("modal-order-attendee", "Add attendee", o["items"][0][0],
                      '<div class="order-modal__prefill"><button type="button" class="btn btn--tertiary btn--sm" data-order-prefill '
                      f'data-name="{e(c["name"])}" data-email="{e(c["email"])}" data-job="{e(c["job"])}" data-company="{e(c["company"])}" '
                      f'data-phone="{e(c["tel"])}">{m.icon("user-check")}<span>Use the customer’s details</span></button></div>'
                      + _field_input("order-att-name", "Name", required=True, focus=True)
                      + _field_input("order-att-email", "Email", required=True, kind="email")
                      + '<div class="order-modal__pair">' + _field_input("order-att-job", "Job title")
                      + _field_input("order-att-company", "Company") + '</div>'
                      + _field_input("order-att-phone", "Business phone", kind="tel"),
                      "Add attendee", "attendee", "user-plus", "order-items")
    return "\n".join([status, send, send_inv, message, despatch, attendee])


# ── Order Edit (code-first, 2026-10-09) ─────────────────────────────────────────────────────────
# Fields, order and HELP TEXT verbatim from the live AfoECommerce/CC/OrderProcessingDef.cfm (edit is
# OrderProcessingEdit.cfm, Action=change only; slot [8] help, [13] required) plus its
# PaymentDetailsInclude.cfm grids. Read-only rows (Order No., Customer, End User) show as text
# (Mark). Left out as the live screen would for this order: Pro Forma (none), Purchase Order (not a
# PO payment), Delivery Date (none set). Line items are not editable on an order (Pro Forma only).
# Status drives the form (OrderEdit.js): Paid Partial / Paid Full show the payment grid, Paid Full
# fixes Payment Status at Paid; Partially Refunded / Refunded show the refund grid.
# TODO(backend:RecordScreen) order-edit: values, option lists and lookups are static → the order + option sources; Save writes the form (status side effects: OrderStatus log, OrderCancel, payment-status security changes)
PAYMENT_STATUSES = ["Not Paid", "Paid", "Awaiting Payment Confirmation"]
EDIT_FILE = "OrderEdit.html"


def _grid(kind, rows, help_text, visible):
    """Payment / Refund Details (PaymentDetailsInclude.cfm): editable rows + Add row / Delete selected."""
    gid = f"order-{kind}-grid"
    refund = kind == "refund"
    head = ["Date", "Amount", "Tax"] + (["Refund reason"] if refund else []) + [""]
    def cell(v, label):
        return (f'<td><div class="input"><div class="input__wrap"><input type="text" class="input__control" '
                f'value="{e(v)}" aria-label="{e(label)}"></div></div></td>')
    def row(r):
        cells = cell(r[0], "Date") + cell(r[1], "Amount") + cell(r[2], "Tax") + (cell(r[3], "Refund reason") if refund else "")
        return (f'<tr>{cells}<td class="datatables__col--tight"><label class="checkbox"><input type="checkbox" class="checkbox__input" '
                f'aria-label="Select row"><span class="checkbox__indicator">{m.icon("check")}</span></label></td></tr>')
    title = "Refund Details" if refund else "Payment Details"
    return f'''<div class="order-edit__grid" id="{gid}" data-order-grid="{kind}"{"" if visible else " hidden"}>
            <h3 class="order-edit__grid-title" id="{gid}-title">{title}</h3>
            <div class="datatables"><div class="datatables__body"><table class="table" aria-labelledby="{gid}-title" aria-describedby="{gid}-help">
              <thead><tr>{"".join(f"<th>{e(h)}</th>" for h in head)}</tr></thead>
              <tbody>{"".join(row(r) for r in rows)}</tbody>
            </table></div></div>
            <div class="order-edit__grid-actions">
              {m.btn("Add row", "secondary", "sm", icon_left="plus", attrs=' data-order-grid-add')}
              {m.btn("Delete selected", "tertiary", "sm", icon_left="trash-2", attrs=' data-order-grid-delete')}
            </div>
            <p class="input__help field-row__help" id="{gid}-help">{e(help_text)}</p>
          </div>'''


def _address_rows(kind, c):
    r = m.edit_row
    county_help = {"Invoice": "Invoice County", "Billing": "Billing County", "Delivery": "Shipping County"}[kind]
    return [
        r("Forename", "input", c["first"], help_text="Customer's First name."),
        r("Surname", "input", c["last"], help_text="Customer's Last name."),
        r("Company", "input", ADDRESS[0], help_text="Company Name."),
        r("Address 1", "input", ADDRESS[1], help_text="First line of address."),
        r("Address 2", "input", "", help_text="Second line of address."),
        r("Town / City", "input", ADDRESS[2], help_text="Town or City."),
        r("Country", "select", ADDRESS[4], options=["United Kingdom", "Ireland", "United States"], help_text="Drop-down selector for Country."),
        r("County / State", "select", "City of Bristol", options=["City of Bristol", "Somerset", "Gloucestershire"],
          help_text="Drop-down selector for County."),
        r("County / State (Other)", "input", "", help_text=f"Customer's manual entry for {county_help}."),
        r("Postcode / Zip", "input", ADDRESS[3], help_text="Postal Code / Zip."),
        r("Phone Number", "input", c["tel"], help_text="Telephone Number including International dialling code."),
        r("E-Mail Address", "input", c["email"], help_text="Customer's Email Address."),
    ]


def _addresses(c):
    """Invoice / Billing / Delivery — one section each, as live (Mark chose it, 2026-10-09, over one
    section with three columns or with tabs)."""
    return "".join(m.record_section(f"{k} Address", _address_rows(k, c), "edit") for k in ("Invoice", "Billing", "Delivery"))


def edit_sections(o, c):
    r = m.edit_row
    status = o["status"]
    paid_full = status == "Paid Full"
    top = [
        r("Order No.", "static", o["code"], help_text="System Field Only - displays the Order Reference Number."),
        r("External Order ID", "input", "", help_text="Enter an External Order ID. This can be used to identify an order from an external systems."),
        r("Order Notes", "textarea", "", help_text="Enter Note / Comments for this Order."),
        r("Zone", "select", o["zone"], options=["Affino", "Affino Events"], help_text="Zone drop-down selector / indicator."),
        f'<div data-order-status>{r("Order Status", "select", status, options=STATUSES, help_text="Current Status of this order.")}</div>',
        r("Order Type", "select", o["type"], required=True, options=["New Business", "Renewal"], help_text="Select Order Type of this order."),
        # TODO(backend:RecordScreen) order-edit: Sub Order Type options are stand-ins → the store's sub order types
        r("Sub Order Type", "select", "Select...", options=["Select...", "Event", "Subscription", "Service"],
          help_text="Select an option to further categorise this order, note that this will be displayed on the Sales Reports."),
        r("CRM Topics", "tagbox", tags=[], modal="modal-order-topics", help_text="Select the Topics for this Order."),
        r("Customer Account", "lookup", o["account"],
          help_text=("Select the correct Account for this customer. Once set, the Account will be stored against this Order. "
                     "If the Account is changed at a later date or the Contact is added to another Account, it will not change "
                     "the Account already associated to this Order.")),
        r("Order Owner", "lookup", o["owner"],
          help_text=("Select the order owner for this order. Note that the Order Owner is automatically populated from the "
                     "Account and is the Account Manager of the account that this shopper is associated with. Note also that "
                     "the Order Owner is carried over from the Pro Forma Invoice. It is essential that all orders that have "
                     "reporting by sales person and by sales team have designated Order Owners.")),
    ]
    pay_status_help = ("Select the payment status for this order. Awaiting Payment Confirmation is used when there is a short "
                       "waiting period for confirmation of payment from the payment gateway, e.g. this could be up to 5-8 days "
                       "from GoCardless / Stripe. In these cases, the subscription will be set as Active or Active Pending. "
                       "For orders where the subscription is not to be active until paid, the Not Paid status is used.")
    payment = [
        # TODO(backend:RecordScreen) order-edit: Payment Method options are stand-ins → the store's payment methods
        r("Payment Method", "select", o["payment"]["method"], options=["No charge", "Card", "Invoice", "Purchase Order", "Direct Debit"],
          help_text="Payment Method drop-down selector / indicator."),
        r("Gateway Reference", "static", "", help_text="Payment Provider Reference Code"),
        r("Payment ID", "static", "", help_text="Payment ID"),
        f'<div data-payment-status{" data-fixed" if paid_full else ""}>{r("Payment Status", "select", o["payment"]["status"], options=PAYMENT_STATUSES, help_text=pay_status_help)}</div>',
        _grid("payment", [(d, a, t) for d, a, t, _ in o["payment"]["rows"]], "Payment date, amount and tax taken.",
              status in ("Paid Partial", "Paid Full")),
        _grid("refund", [("", "", "", "")], "Refund date, amount and tax taken.", status in ("Partially Refunded", "Refunded")),
    ]
    customer = [
        r("Name", "static", c["name"], help_text="Customer / User First Name. (System Field Only)."),
        r("E-Mail Address", "static", c["email"], help_text="Customer / User Email Address. (System Field Only)."),
        r("Member Type", "static", c["member"], help_text="Customer / User Member Type (System Field Only)"),
        r("Job Title", "static", c["job"], help_text="Customer / User Job Description (System Field Only)."),
        r("Company VAT No.", "static", "", help_text="Enter Company VAT No."),
    ]
    end_user = [
        r("Name", "static", c["name"], help_text="Customer / User First Name. (System Field Only)."),
        r("E-Mail Address", "static", c["email"], help_text="Customer / User Email Address. (System Field Only)."),
    ]
    delivery = [r("AWB Details", "textarea", "", help_text="Enter the full shipping details for the order once it has been shipped.")]
    comments = [r("Gift Aid", "checkbox", False,
                  help_text="Ticked if the user has selected to opt into Gift Aid during the checkout process.")]
    sec = m.record_section
    return (sec("Order", top, "edit") + sec("Payment", payment, "edit") + sec("Customer", customer, "edit")
            + sec("End User", end_user, "edit") + _addresses(c) + sec("Delivery", delivery, "edit")
            + sec("Comments", comments, "edit"))


def edit_modals():
    topics = [(n, "", "Topics", "Affino") for n in ["Events", "Commerce", "Subscriptions", "Renewals"]]
    return (m.multi_select_modal("modal-order-topics", "Select Topics", topics)
            + m.delete_confirm_modal("modal-delete", "order", "Order " + ORDER["code"]))
