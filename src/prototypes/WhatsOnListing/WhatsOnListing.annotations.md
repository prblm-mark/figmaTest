# WhatsOnListing — Figma annotations

The Hub prototype (v13 rev14) explains its changes **inside** the screens: "Where the new panel
goes" boxes, `new field` / `2 new columns` pills, and long help paragraphs. Here the screens are
drawn as the product would look, and those explanations move onto the Figma frames as annotations
(Mark, 2026-09-23). One section per frame; each bullet is one annotation.

Tag key: **NEW** = does not exist in Affino today · **CHANGE** = existing screen, altered ·
**EXISTING** = configure only · **OPEN** = unresolved in the spec.

---

## Content › Inbox — `control-inbox.html`

- **CHANGE** — The live Inbox shows only Title, Section, Style and From, with no dates and no
  per-row buttons. Added: **Submitted**, **Waiting**, **Credit** columns and **Details** /
  **Save & Publish** / **Reject** on each row.
- **NEW** — **Credit** column is hidden on channels that do not hold credits.
- **NEW** — **Waiting** turns into a red *past SLA* badge at 2 days. SLA: 2 working days plus
  Saturday 09:00–12:00 cover. Owner George Graham, backup Nicky Murphy.
- **CHANGE** — **Save & Publish** ticks Live and Syndication, overwrites Publish Start (capped by
  the listing lead time) and Publish End (the event end), deducts the held credit, writes the
  audit entry and sends the approval notification. Edits to a live listing come back here
  (Workflow Profile: re-queue on edit).
- **CHANGE** — **Reject** asks for a reason, releases the hold and notifies the promoter.
- The saved view "Awaiting approval" = Channel What's On · Status Submitted · oldest first.
- Sample data: v13 showed an event-contact **phone number** on the first row. Dropped — plan
  decision 8 / Lynx 23 Sep query 6: no phone number is collected or published.

### Inbox · Details modal — `?open=wol-detail-103`

- **NEW** — Read-only popup of the submission, so the editor reviews without leaving the queue.
  Close returns to the Inbox with list and filters unchanged; approve and reject stay on the row.
- Website and Facebook page are fields on the **event article** (new `StandardItem.Website` and
  `StandardItem.FacebookPage` columns, plan decision 16), not on the contact record.
- **OPEN** — The description is drawn at up to 200 words, but it is assigned to
  `StandardItem.Teaser`, which is `nvarchar(500)` ≈ 75 words (Lynx 23 Sep). Options: body +
  truncated teaser (Lynx's recommendation) · cap at ~75 words · widen Teaser. Awaiting the Nicky call.

### Inbox · Reject modal — `?open=wol-reject`

- **EXISTING** — Workflow rejection. The held credit returns to the promoter's balance; Live and
  Syndication stay unticked; both publish dates keep the defaults set at creation.
- Reasons list is v13's sample set — confirm with the What's On editors.

---

## Commerce › Service Credits — `control-service-credits.html`

- **CHANGE** — Two new columns, **Status** (Available / Held / Spent) and **Held against**,
  sitting between Qty and the row actions.
- **CHANGE** — **Release Hold** is added after Use Credits, only on Held rows.
- **EXISTING** — Add (header) is today's Add form: Contact, Plan, Start, End, Quantity. Manual
  grants reach My account with no extra work — they are the same record as a purchase.
- **OPEN** — **How a held credit is stored.** Lynx (18 Sep, query 1): a Service Credit is a
  running total per purchase, not one record per credit, so a 5-pack cannot simply split into
  three status rows as drawn. Quang checking with Julius. This screen may need redrawing once
  that is settled.
- **OPEN** — Credit expiry: TASK-470896 wants "3 credits expire on …" in My account, which
  depends on something writing End Date at checkout (unconfirmed).

---

## Commerce › Service Credit Profile — `control-service-credit-profile.html`

- **EXISTING** — Main panel unchanged.
- **NEW** — **Approval and Limits** panel (6 fields), at the foot of the profile directly below
  Default Low Service Credits.
- **NEW** — **Listing Fields** panel (3 fields).
- There is **no Credit consumption point setting** (dropped in v13, decision 14). The channel's
  Workflow Profile decides both publication and payment: with one, the item queues and its credit
  is held at Submit and deducted on approval; without one, it publishes and deducts at once.
- **Listing lead time is not a submission rule** — a promoter may submit a year ahead. It caps
  Publish Start at approval, so an early listing waits rather than being refused.
- **Maximum event length** is enforced on Submit.
- **Event contact block** drives `HideEmailYN` on the article.
- **Default content creator**: empty = the submitter. Setting a house account makes every Inbox
  row show that account instead of the promoter.
- Right sidebar "Applies to" is a proposed summary, not a live panel.
- **OPEN** — Screen map rev 7 still describes Credit consumption point; v13 wins.

---

## Content › Workflow Profile — `control-workflow-profile.html`

- **EXISTING** — Configure only; no development. Creation group *Event Promoter*, Publish group
  *What's On Editors*, all options and notifications on.
- Notification texts are editable on this profile.
- Right sidebar "Applies to" (owner, backup, review target) is a proposed summary, not a live panel.

---

# Display side (`display-*.html`)

Every display frame also carries: **PROTOTYPE-ONLY** — site shell, event row, product card, tabs,
order summary, address card, account nav and result card are prototype CSS, not design-system
components. Candidates for components once designed.

## 1 · What's On listing
- **NEW** — "List your event" call-to-action: price from £10 ex VAT, editor review, link to terms.
- **EXISTING** — Listing filtered by Area, Type and When.
- Advert slots are IAB-size placeholders. The screen map's separate "List your event" landing page is not drawn in v13.

## 2 · Listing credits
- **EXISTING** — Store listing: Listing credit £10, 5-pack £40 ex VAT. One price for all.

## 3 · Product
- **EXISTING** — Terms (no cash refund, 12-month expiry, 5-pack non-transferable) shown before purchase and agreed again at checkout.

## 4 · Basket
- **EXISTING** — LAUNCH20 is a sample Smart Coupon (20% off). Prices ex VAT, VAT at 20%.

## 5 · Checkout
- **EXISTING** — The Stripe payment step is skipped in the prototype. Terms agreed here and recorded against the order.

## 6 · Order acknowledgement
- **CHANGE** — "What happens next" card at the top of the main column (moved in v11).

## 7 · My account › My listings & credits
- **NEW** — Panel added below My orders; titled from the channel's content type.
- Available / Held / Spent summary; listing status + credit state; Copy / Withdraw / Edit & resubmit.
- **OPEN** — "3 credits expire on …" (TASK-470896) not drawn; depends on End Date written at checkout.

## 8 · Submit an event
- **CHANGE** — Extends the LiveEdit Event form (FormDef ResponsiveEvent); four panels.
- Website / Facebook page are new StandardItem columns. No phone number (plan decision 8).
- Max event length 7 days checked on Submit; 60-day lead time caps Publish Start at approval.
- **OPEN** — 200-word description vs 500-char Teaser (≈75 words).

## 9 · Submission received
- **NEW** — 1 credit held, nothing deducted until approval; Withdraw releases the hold.
