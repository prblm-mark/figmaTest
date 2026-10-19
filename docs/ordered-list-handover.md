# OrderedList: ordered-list fields on migrated record screens. Handover

> **Who this is for:** Cat (and Lynx/Luismi), moving v1's simple Control Centre record screens onto the
> record design through the generic engine.
> **Status:** **built and tested in this repo** (2026-10-19). Use it for every v1 field that is a list
> ordered with ↑ ↓ arrows. Don't use the Selector's Sort type for these.
> **Read first:** [`record-screens-handover.md`](record-screens-handover.md). The record-screen kit rules
> apply unchanged.
> **Data contract:** `ordered-list-value` in [`HANDOVER.md`](../HANDOVER.md) and
> [`handover-manifest.json`](handover-manifest.json) → `surfaces.RecordScreen`.
> Where this document and the code disagree, **the code wins.** Please report the gap.

**Run it:** `npm install && npm run tokens && npm start`, then open
`http://localhost:8080/src/cc/patterns/OrderedList/OrderedList.html`.

| What | Where |
|---|---|
| Pattern (CSS, JS, demo, notes) | `src/cc/patterns/OrderedList/` |
| Record field type | `src/cc/templates/RecordScreen/record_markup.py`: `ordered_list()`, `edit_row(…, "ordered")`, `view_row(…, "ordered")` |
| Spec and token table | `src/cc/patterns/OrderedList/OrderedList.figma-notes.md` |

## 1. Which v1 fields

| v1 screen | Field | Kind |
|---|---|---|
| Search Profile | Content Group Priority (Articles, Contacts, Accounts, Editions) | Fixed |
| Recruitment Sector Profile | Sequence | Fixed |
| Checkout Profile / Demographic Profile | address-field order | Fixed |
| Any field with **Select** + ↑ ↓ (e.g. v1 Contact Topics) | — | Selectable |

**Rule of thumb:** a v1 listbox with ↑ ↓ arrows becomes `ordered`. If it also has a Select button, pass
`modal=` and it becomes Selectable.

## 2. Using it in the engine

```python
# Edit: Kind=Fixed (reorder only). Items are names, or (key, name) when v1 stores codes.
edit_row("Content Group Priority", "ordered",
         tags=[("articles", "Articles"), ("contacts", "Contacts"), ("accounts", "Accounts"), ("editions", "Editions")])

# Edit: Kind=Selectable: adds × per row and Select → the Multi Select Modal (TagBox's modal contract).
edit_row("Contact Topics", "ordered", tags=["Coronavirus Hub", "AI"], modal="modal-topics")

# View: a numbered list. Empty → the field is left out (view screens hide empty fields).
view_row("Content Group Priority", "ordered", ["Articles", "Contacts", "Accounts", "Editions"])
```

Every record page already loads `OrderedList.css` and `OrderedList.js` (`_generate.py`).

## 3. Behaviour (built, keep as is)

- **Reorder:** drag by the grip, or use the ↑ ↓ buttons (Button Tertiary **xs** icon-only). ↑ is hidden on
  the first row and ↓ on the last. Touch screens have no grip, so ↑ ↓ do the job.
- **Selectable:** × removes a row. **Select** opens the modal pre-ticked; **Apply** keeps the order of the
  items that stay and adds new ones **at the bottom**.
- **Saving:** there's no separate Apply. The page's own **Save** stores the order.
- **Accessibility:** a live region announces each change ("Articles moved to position 2 of 4"), and focus
  stays on the arrow pressed.
- **Narrow:** the list is its own container. Under 280px the rows wrap (the buttons drop under the label).

## 4. Backend (`ordered-list-value`)

- `input[type=hidden][data-ordered-list-value]` holds the item **keys in order, comma-joined**. It is
  updated on every change and fires `change`. Submit it with the page's Save in the field's **existing v1
  format**. v1 decides what is stored, so no new contract is needed.
- Selectable: the modal rows are demo data. Feed them from the field's v1 item source, and put the key on
  each row as `data-ordered-list-key` (it falls back to the name).

## 5. Same rule going forward

If another v1 save-bar option or list control comes up with no record-design equivalent, ask Mark rather
than inventing one. The answer for a save-mode toggle is in the "Save & add another" reply: a secondary
button between Cancel and Save.
