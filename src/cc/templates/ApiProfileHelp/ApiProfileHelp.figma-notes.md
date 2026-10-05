# ApiProfileHelp (CC) — Figma Notes

Two screens, one build:

| Screen | Task | Classic | Output |
|---|---|---|---|
| `/control/api-profile-user-help` | TASK-470997 | `/AfcControl/CC/APIProfileUserHelp.cfm` (624 lines) | `ApiProfileUserHelp.html` |
| `/control/api-profile-crm-help` | TASK-470998 | `/AfcControl/CC/APIProfileCRMHelp.cfm` (1,458 lines) | `ApiProfileCRMHelp.html` |

Both are long-form API documentation, labelled `no-design`. Mark asked for them to be done together
(2026-10-05) since they share a layout. Lynx's tasks set the bar: "the content is complete and
correctly formatted".

## Figma Node

**None.** Composed from existing, Figma-built parts on the ControlScreen shell (cloned from
UpdateScreen): RecordSection, Badge. Breadcrumb Zone Selector › Settings › API Profiles › <screen>
(both screens hang off API Profiles, ControlProfileCode 1756; neither is in the menu itself).

## Generated, not hand-written

`_generate.py` builds both pages from the classic CFML, so no word is retyped:

```
python3 _generate.py --classic <dir with the six sources>
```

The sources (`APIProfileUserHelp.cfm`, `APIProfileCRMHelp.cfm`, `AccountsAction.cfc`,
`UsersAction.cfc`, `UserAccountsAction.cfc`, `Subscription.cfc`) are read from affino.com's tree
and **not committed**. Fetch them again to regenerate. Edit the generator, not the HTML.

What it does:

1. **Resolves the ColdFusion.** `#ReplaceNoCase(Application.DB,…)#` → `Comrz`, `CGI.HTTP_HOST` →
   `www.affino.com`. Every `Hash()` and `calculateSignature()` is computed with hashlib from a
   fixed demo instant, `2026-10-05T14:30:15.250Z` (classic uses `now()`, so its examples change on
   every load). `createUUID()`, `Session.IPAddress` and `CGI.HTTP_USER_AGENT` in the tokenLogin
   example are fixed demo values.
2. **Reproduces the server-generated field lists.** The CRM page builds 8 lists from each REST
   action's `getFieldsDef()`. The generator evaluates the CFCs' own struct literals with the page's
   loop rules (required on create / update, AutoScript, `Allowed EQ "all"`, Password excluded). An
   unknown loop shape stops the build rather than guessing. The Lookups section's subscription
   statuses come from `Subscription.SubscriptionStatusOptions()` (14 values).
3. **Drops `<!--- … --->` blocks**, as ColdFusion does. On the CRM page that removes four sections
   that **never render live**: User Preferences, User Subscriptions (Create / Update),
   Permissions, Preferences.
4. **Parses the remaining HTML tolerantly**, with the browser's implied-end-tag and list-item-scope
   rules. The classic markup relies on them: unclosed `<li>`s, and a stray `</li>` before Get
   User's response body that browsers ignore.

### Checks run (2026-10-05)

- hashlib reproduces the classic pages' own stated hashes: the User body MD5 `2CD183EC…`, the CRM
  body MD5 `6471D2C7…`, and the CRM page's full SHA-512 example signature `45FCF7D9…`.
- **Word-for-word diff** of each resolved classic page against the generated content: nothing
  missing, nothing extra, apart from the label colons and "Description:" prefixes the layout
  replaces. The first run caught the stray-`</li>` body above being dropped; it was fixed and
  re-checked.
- Endpoints: User 12, CRM 19 (the CRM page's 24 headings, less the 5 inside the comment).

## Layout

| Part | From | Notes |
|---|---|---|
| On this page | RecordSection + DropdownItem-style links | Sticky rail beside the sections (240px, `size-4`); endpoint count Badges; scroll-spy marks the section in view (`aria-current`). Hover is the row background only: colour and underline are reset against base.css `a:hover` (designer, 2026-10-05) |
| On this page (narrow) | DS Select (`sel`, Select.js) | Below 1023 (`cs-page`) the rail is replaced by ONE sticky Select that names the section in view and jumps to any other (designer, 2026-10-05: wrapping 13 links above the content was neither efficient nor clear). Each option and the closed trigger carry the rail's endpoint-count chip (designer, 2026-10-05); rows reserve the tick's width so the chips line up. Scroll-spy keeps the value, chip and tick in step |
| Sections | RecordSection (`--full` in full width) | One card per classic `<h2>`; the intro card carries the `<h1>` ("User API version 1" / "CRM API version 1") |
| Endpoint | An article per endpoint, divided by `border-secondary` | Name (CRM) as a subhead, then method Badge (GET `info`, POST `success`, PUT `warning`, DELETE `danger`) + path |
| Example rows | key: value grid (key 160px, `size-2`) | Request / Response groups; Header's rows nest in the value column. Stack at RecordSection's 559, where FieldRow's rows stack. Empty values show a muted "—" |
| Code | AutoAnswers' inline code style, token for token | Title font at medium weight on `surface-secondary` (there is no monospace token). The worked examples (signature calculation, error responses) are a wrapped code block, one line per classic `<p>` |
| Parameter names | the same code style, tighter padding | Classic's `<b>` |
| Lookups links | brand text link + external-link icon | Open the CC screen in a new tab, as classic does |

No new tokens. Text is FieldRow's value style; subheads are FieldRow's label style, with endpoint
names one step up (Contract Analysis's table title).

## Responsive

Grid → one column below 1023 (`cs-page`, on the inner `__layout`: the page is the container and
cannot query itself, which the first pass got wrong), with the sticky Select in place of the rail. Example rows stack at RecordSection 559.
Measured at 390: both pages 390/390, no element past the edge.

## Backend (`TODO(backend:ApiProfileHelp)`)

| id | What |
|---|---|
| `api-help-render` | Render server-side with the site's own name and host and a live timestamp, so each example MD5 / Signature is recomputed per request, as classic does. The field lists come from each action's `getFieldsDef()` live. The commented-out sections stay out unless someone revives them on purpose |
| `api-help-source-errors` | Not fixed: the content is carried over as written. Worth a pass by whoever owns the API docs: "sucessful", "usres", "Subriptions", "sting", "greater that"; "not-not-required" (Notes, Update User Subscription, which is commented out anyway); Get User Subscriptions' example signs a POST to `?subscriptions` while the request is a GET to `/subscriptions`; Update User Subscription's example URL `/crm/v1?subscriptions/34`; List Preferences' example calls `/permissions` |
