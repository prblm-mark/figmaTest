"""Generates the Import pattern pages (TASK-575621) on the ControlScreen shell.

    python3 src/cc/templates/ImportScreen/_generate.py

Edit THIS file, not the generated .html. Each page = the ExportSystem shell (sidebar, top nav,
action rail, AI assistant) with its own title, breadcrumb, header actions, page body and config.
The flow itself is ImportScreen.js; each page only says what its import reads (fields, rules,
options) and what the demo file holds. Options rows reuse the record screens' FieldRow markup
(RecordScreen/record_markup.edit_row), so they look and behave like every other edit form.
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "RecordScreen"))
from record_markup import edit_row, icon  # noqa: E402

SHELL = os.path.join(HERE, "..", "ExportSystem", "ExportSystem.html")
SPINNER_SVG = ('<svg class="spinner__svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
               '<circle class="spinner__track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"></circle>'
               '<path class="spinner__arc" d="M12 2 a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>')


def btn(label, kind, attrs="", icon_left=None, icon_right=None, size=""):
    i_l = icon(icon_left) if icon_left else ""
    i_r = icon(icon_right) if icon_right else ""
    sz = f" btn--{size}" if size else ""
    return f'<button type="button" class="btn btn--{kind}{sz}"{attrs}>{i_l}<span>{label}</span>{i_r}</button>'


def header(title, actions):
    return f'''<div class="cc-header-cq">
        <header class="cc-header">
          <div class="cc-header__title-block">
            <h1 class="cc-header__title">{title}</h1>
          </div>
          <div class="cc-header__actions">{actions}</div>
        </header>
        </div>'''


def progress_card(noun_plural):
    # v1's TaskProgress panel (AfcControl/CC/TaskProgress.cfm): this user's unfinished runs of this
    # import (developers see everyone's). Shown above the flow only when there is one.
    return f'''<!-- TODO(backend:ImportScreen) import-progress: rows are mock → v1 TaskProgress query
           (ScheduledTask by Type, FinishedYN=0, CancelledYN=0, ErrorYN=0, CreatedBy = user unless
           SSC 160), refreshed while the page is open. -->
      <section class="record-section cc-import__progress" aria-labelledby="imp-progress-title" data-import-progress data-backend-todo="import-progress" hidden>
        <div class="record-section__header"><div class="cc-import__title-row"><h2 class="record-section__title" id="imp-progress-title">{noun_plural} in progress</h2><span class="badge badge--neutral" data-import-progress-count></span></div></div>
        <div class="record-section__body"><div class="cc-import__table-wrap--scroll">
          <table class="table" aria-labelledby="imp-progress-title">
            <thead><tr><th scope="col">ID</th><th scope="col">Progress</th><th scope="col">Started by</th><th scope="col">Started</th><th scope="col">Last run</th></tr></thead>
            <tbody></tbody>
          </table>
        </div></div>
      </section>'''


def flow(lead, sample_href, options_html=None):
    options_panel = f'''
            <div class="cc-import__panel" data-import-panel="options" hidden>
              <p class="cc-import__lead">These settings apply to every row in the file.</p>
              <div class="cc-import__options">{options_html}</div>
            </div>''' if options_html else ""
    return f'''<section class="record-section cc-import__flow" aria-labelledby="imp-step-title">
        <div class="record-section__header"><h2 class="record-section__title" id="imp-step-title" tabindex="-1" data-import-step-title>Upload a file</h2></div>
        <div class="cc-import__steps"><nav class="stepper" aria-label="Import steps" data-import-stepper></nav></div>
        <div class="record-section__body">

            <div class="cc-import__panel" data-import-panel="upload">
              <p class="cc-import__lead">{lead}</p>
              <!-- TODO(backend:ImportScreen) import-upload: see ImportScreen.js acceptFile(). -->
              <div class="drag-drop" data-import-drop role="button" tabindex="0" aria-describedby="imp-upload-hint imp-upload-error" data-backend-todo="import-upload">
                <div class="drag-drop__icon-wrap">{icon("file-up")}</div>
                <div class="drag-drop__text">
                  <p class="drag-drop__title"><strong>Click to upload</strong> or drag and drop</p>
                  <p class="drag-drop__subtitle" id="imp-upload-hint">XLSX or CSV, up to 100MB. The first row must be the column names.</p>
                </div>
                <input type="file" class="drag-drop__native" tabindex="-1" aria-hidden="true">
              </div>
              <p class="cc-import__upload-error" id="imp-upload-error" role="alert" data-import-upload-error hidden></p>
              <div class="cc-import__file" data-import-file hidden>
                <span class="cc-import__file-icon">{icon("file-spreadsheet")}</span>
                <span class="cc-import__file-text"><span class="cc-import__file-name" data-import-file-name></span><span class="cc-import__file-meta" data-import-file-meta></span></span>
                <span class="cc-import__file-actions">
                  {btn("Replace", "tertiary", ' aria-label="Replace file" data-import-replace', icon_left="refresh-cw", size="sm")}
                  {btn("Remove", "tertiary", ' aria-label="Remove file" data-import-remove', icon_left="trash-2", size="sm")}
                </span>
              </div>
              <!-- TODO(backend:ImportScreen) import-sample: the link goes nowhere → v1's sample file per
                   import (e.g. /AfcTemp/SampleCSV/ContactListImport.xlsx), ideally generated from getConfig(). -->
              <p class="cc-import__sample">Not sure what the file needs? <a href="{sample_href}" data-backend-todo="import-sample">Download the sample file</a>. It has every column this import reads.</p>
            </div>

            <div class="cc-import__panel cc-import__map" data-import-panel="map" hidden>
              <p class="cc-import__lead" data-import-map-lead></p>
              <div class="alert alert--danger" role="alert" data-import-map-error hidden>
                <div class="alert__header"><span class="alert__icon">{icon("circle-alert")}</span>
                  <div class="alert__text"><span class="alert__title">Fix the column choices to continue.</span></div></div>
                <div class="alert__body"><ul class="alert__list" data-import-map-error-list></ul></div>
              </div>
              <div class="cc-import__table-wrap">
                <table class="table" aria-label="Columns in your file and the field each imports into">
                  <thead><tr><th scope="col">Column in your file</th><th scope="col"><span class="cc-import__sr">Imports into</span></th><th scope="col">Imports into</th><th scope="col">Status</th></tr></thead>
                  <tbody data-import-map-body></tbody>
                </table>
              </div>
              <p class="cc-import__fields-left" data-import-fields-left hidden></p>
            </div>
{options_panel}
            <div class="cc-import__panel" data-import-panel="review" hidden>
              <div class="cc-import__busy" data-import-review-busy role="status">
                <span class="spinner spinner--sm spinner--brand" aria-hidden="true">{SPINNER_SVG}</span>
                <span data-import-review-busy-text>Checking rows…</span>
              </div>
              <div class="cc-import__panel" data-import-review-out hidden></div>
            </div>

            <div class="cc-import__panel" data-import-panel="results" aria-live="polite" hidden></div>

        </div>
        <div class="cc-import__footer">
          {btn("Back", "secondary", " data-import-back hidden", icon_left="arrow-left")}
          <div class="cc-import__footer-end">
            <span class="cc-import__footer-note" id="imp-footer-note" data-import-footer-note></span>
            <button type="button" class="btn btn--primary" data-import-next disabled><span>Continue</span></button>
            {btn("Import another file", "secondary", " data-import-again hidden", icon_left="rotate-ccw")}
          </div>
        </div>
      </section>'''


def page(*, out, title, section, comment, header_actions, body, config, scripts=""):
    s = open(SHELL, encoding="utf-8").read()
    s = s.replace("<title>Export System JSON and CSS — Affino Control Centre</title>",
                  f"<title>{title} — Affino Control Centre</title>")
    s = s.replace('  <link rel="stylesheet" href="ExportSystem.css">',
                  '  <link rel="stylesheet" href="../../../components/Radio/Radio.css">\n'
                  '  <link rel="stylesheet" href="../../../components/DragDropFile/DragDropFile.css">\n'
                  '  <link rel="stylesheet" href="../../../components/Stepper/Stepper.css">\n'
                  '  <link rel="stylesheet" href="ImportScreen.css">')
    s = s.replace('<a class="breadcrumb__link" href="#">System Management</a>',
                  f'<a class="breadcrumb__link" href="#">{section}</a>')
    s = s.replace('aria-current="page">Export System JSON and CSS</li>', f'aria-current="page">{title}</li>')
    s = re.sub(r'<div class="cc-header-cq">.*?</header>\s*</div>', lambda m: header(title, header_actions), s, count=1, flags=re.S)
    start = s.index("    <!-- Page content: /control/export-system-json-and-css")
    end = s.index("  </main>", start)
    s = s[:start] + f"    <!-- {comment} -->\n    <div class=\"cc-control__page cc-import\" data-import>\n\n      {body}\n\n    </div>\n" + s[end:]
    s = s.replace('  <script src="ExportSystem.js"></script>',
                  '  <script src="../../../components/Stepper/Stepper.js"></script>\n'
                  f'{scripts}'
                  '  <script src="ImportScreen.js"></script>\n'
                  f'  <script>\n{config}\n  </script>')
    open(os.path.join(HERE, out), "w", encoding="utf-8").write(s)
    print("wrote", out)


# ── Contact List Import (/control/contact-list-import, ControlProfile 1871) ──────────────
# v1: AfcCommunityMgr/CC/ContactListImport.cfm — one Document field (.xlsx, 100MB), full
# validation, then always a scheduled task. Columns: AfcAutomation/ImportConfig/
# ContactListImportConfig.cfc. Row rules: AfcCommunityMgr/Automation/ContactListImport.cfm
# (UserCode OR Email required; the contact must exist; list IDs must exist; several lists, bios
# and statuses are separated by "|"; a status must be in that list's ContactsStatusList).
CONTACT_LIST_CONFIG = """
    // TODO(backend:ImportScreen) import-config: fields are ContactListImportConfig.cfc, typed by
    //   hand → serve getConfig() (Columns + ColumnTypes) per import, with each column's help text.
    // Demo lookups standing in for the database: contacts by UserCode / email, and each list's
    // ContactsStatusList.
    var CONTACTS = { 1001: 'ana.silva@example.com', 1002: 'ben.okafor@example.com', 1003: 'chloe.martin@example.com',
      1004: 'dan.wright@example.com', 1006: 'eve.shaw@example.com', 1007: 'gus.lee@example.com',
      1008: 'hana.ito@example.com', 1010: 'ivan.petrov@example.com' };
    var EMAILS = Object.keys(CONTACTS).reduce(function (o, k) { o[CONTACTS[k]] = +k; return o; }, {});
    var LISTS = { 12: ['Subscribed', 'Unsubscribed'], 18: ['Invited', 'Registered', 'Attended'], 25: ['Member'] };

    ImportScreen.init({
      steps: ['upload', 'map', 'review', 'results'],
      titles: { upload: 'Upload a file', map: 'Match your columns', review: 'Check the rows', results: 'Import scheduled' },
      target: 'contact list fields',
      accept: ['xlsx', 'csv'],
      maxBytes: 104857600,
      run: 'scheduled',
      email: 'mark.foster@affino.com',
      userName: 'Mark Foster',
      fields: [
        { key: 'UserCode', label: 'UserCode', type: 'n', hint: 'Finds the contact. Use this or Email.', aliases: ['User Code', 'Contact ID'] },
        { key: 'Email', label: 'Email', type: 'e', length: 150, hint: 'Finds the contact when there’s no UserCode.', aliases: ['Email address', 'E-mail'] },
        { key: 'ContactListIDs', label: 'Add to list IDs', type: 't', hint: 'Lists to add the contact to, separated by |. IDs are on the Contact Lists screen.', aliases: ['Contact List IDs', 'Lists', 'List IDs'] },
        { key: 'RemoveContactListIDs', label: 'Remove from list IDs', type: 't', hint: 'Lists to take the contact off, separated by |.', aliases: ['Remove Contact List IDs', 'Remove lists'] },
        { key: 'ListBios', label: 'List bios', type: 't', hint: 'A bio for each list, in the same order, separated by |.', aliases: ['Bio', 'Bios', 'List Bio'] },
        { key: 'Status', label: 'Status', type: 't', hint: 'A status for each list, in the same order, separated by |. Each list has its own statuses.', aliases: ['List status', 'Statuses'] }
      ],
      rules: [{ anyOf: ['UserCode', 'Email'], message: 'Choose a column for UserCode or Email. Each row is matched to a contact by one of them.' }],
      check: function (o, ctx) {
        var out = [];
        var code = String(o.UserCode == null ? '' : o.UserCode).trim();
        var mail = String(o.Email == null ? '' : o.Email).trim().toLowerCase();
        if (!code && !mail) out.push({ field: 'UserCode', value: '', problem: 'No UserCode or Email, so the contact can’t be found.', outcome: 'skip' });
        else if (/^\\d+$/.test(code) && !CONTACTS[code]) out.push({ field: 'UserCode', problem: 'No contact has UserCode ' + code + '.', outcome: 'skip' });
        else if (!code && mail && /@.+\\./.test(mail) && !EMAILS[mail]) out.push({ field: 'Email', problem: 'No contact has this email.', outcome: 'skip' });
        var who = code || mail;
        if (who && ctx.seen[mail || code]) out.push({ field: mail ? 'Email' : 'UserCode', problem: 'Same contact as row ' + ctx.seen[mail || code] + '. Both rows are applied, in order.', outcome: 'note' });
        if (who) ctx.seen[mail || code] = ctx.seen[mail || code] || arguments[2];
        ['ContactListIDs', 'RemoveContactListIDs'].forEach(function (k) {
          var raw = String(o[k] == null ? '' : o[k]).trim();
          if (!raw) return;
          if (/;|,/.test(raw)) out.push({ field: k, problem: 'Separated with “' + (raw.match(/[;,]/)[0]) + '”. Changed to “|”, the separator this import uses.', outcome: 'fix' });
          raw.split(/[|;,]/).forEach(function (id) {
            id = id.trim();
            if (id && !LISTS[id]) out.push({ field: k, value: id, problem: 'No contact list has ID ' + id + '.', outcome: 'skip' });
          });
        });
        var ids = String(o.ContactListIDs == null ? '' : o.ContactListIDs).split(/[|;,]/).map(function (s) { return s.trim(); });
        String(o.Status == null ? '' : o.Status).split(/[|;,]/).forEach(function (st, n) {
          st = st.trim();
          var list = LISTS[ids[n]];
          if (st && list && list.map(function (x) { return x.toLowerCase(); }).indexOf(st.toLowerCase()) === -1) {
            out.push({ field: 'Status', value: st, problem: 'List ' + ids[n] + ' has no “' + st + '” status. It has: ' + list.join(', ') + '.', outcome: 'skip' });
          }
        });
        return out;
      },
      // Cat's sample (TASK-575621): v1's six columns plus a "Notes" column nobody asked for, and
      // the awkward rows she listed. Rows are spreadsheet rows 2–13.
      demoFile: {
        name: 'contact-list-import-sample.xlsx',
        bytes: 5275,
        headers: ['UserCode', 'Email', 'Contact List IDs', 'Remove Contact List IDs', 'List Bios', 'Status', 'Notes'],
        rows: [
          ['1001', 'ana.silva@example.com', '12|18', '', 'Board member|Speaker', 'Subscribed|Registered', ''],
          ['1002', 'ben.okafor@example.com', '12', '25', '', 'Subscribed', 'Moved from VIP'],
          ['', 'chloe.martin@example.com', '18', '', 'Keynote speaker', 'Invited', ''],
          ['1004', 'dan.wright@example', '12', '', '', 'Subscribed', ''],
          ['', '', '12', '', '', 'Subscribed', 'Walk-in, no details'],
          ['', '  Eve.Shaw@Example.COM ', '25', '', '', 'Member', ''],
          ['1007', 'gus.lee@example.com', '12;18', '', '', 'Subscribed|Invited', ''],
          ['1008', 'hana.ito@example.com', '18', '', 'Chairs the panel\\nQ&A host', 'Registered', ''],
          ['A1009', '', '12', '', '', 'Subscribed', 'Code from old CRM'],
          ['1010', 'ivan.petrov@example.com', '12', '', '', 'Maybe', ''],
          ['', 'ana.silva@example.com', '25', '', '', 'Member', ''],
          ['1003', '', '99', '', '', '', '']
        ]
      },
      cleanRows: [0, 1, 2, 7],
      nextTaskId: 48213,
      progress: [{ id: 48207, processed: 1840, total: 5200, by: 'Priya Shah', started: '2 hours ago', lastRun: '4 minutes ago' }]
    });"""

CONTACT_LIST_BODY = progress_card("Imports") + "\n\n      " + flow(
    "Add contacts to contact lists, or take them off, in bulk. Each row is one contact, found by "
    "<strong>UserCode</strong> or <strong>Email</strong>. The contact must already exist.",
    "#")

page(
    out="ContactListImport.html",
    title="Contact List Import",
    section="CRM",
    comment=("Page content: /control/contact-list-import on the v3 Import pattern (TASK-575621). "
             "Generated by _generate.py; edit that. v1: AfcCommunityMgr/CC/ContactListImport.cfm."),
    header_actions=('<a class="btn btn--secondary" href="#" aria-label="Download sample file" data-backend-todo="import-sample">'
                    + icon("download") + '<span class="cc-header__btn-label">Sample file</span></a>'),
    body=CONTACT_LIST_BODY,
    config=CONTACT_LIST_CONFIG,
)


# ── User Import (/control/user-import, ControlProfile 761) ───────────────────────────────
# v1: AfcSecurity/CC/UserImport.cfm. Its form fields become the Options step, in v1's order,
# with v1's help text. Import Type switches the whole import (Full User / User Topics / Contact
# Notes) — v1 hides the user-only options for the other two; here they stay and the type is
# chosen first. Store credits, archive extension and the row window are kept as v1 has them.
USER_OPTIONS = "".join([
    edit_row("Import type", "radio", value="Full user", options=["Full user", "User topics", "Contact notes"],
             help_text="Full user creates or updates contacts. User topics adds topics to matching contacts (the topics must already exist). Contact notes adds notes to matching contacts."),
    edit_row("Action", "radio", value="Add", options=["Add", "Update", "Delete"],
             help_text="On Update, a blank cell leaves that detail as it is. Passwords can't be updated. Contacts are matched by UserCode, then External ID, then Email."),
    edit_row("Batch reference", "input", required=True,
             help_text="Your name for this batch, so you can add to it later or delete it with User Batch Delete."),
    edit_row("Registration zone", "select", value="Affino (User Profile: Standard)",
             options=["Affino (User Profile: Standard)", "Events (User Profile: Delegate)", "Members (User Profile: Member)"],
             help_text="The zone's user, registration and demographic profiles are used for the imported details."),
    edit_row("Security groups", "lookup", placeholder="None selected",
             help_text="The security groups imported contacts are placed in."),
    edit_row("Account", "lookup", placeholder="None selected",
             help_text="The account the contacts are assigned to. Update moves existing contacts to this account."),
    edit_row("Contact lists", "lookup", placeholder="None selected",
             help_text="Imported contacts are added to these contact lists."),
    edit_row("Store credits", "select", value="Don't import", options=["Don't import", "Add", "Update"],
             help_text="Add puts the column's points on top of each contact's balance. Update replaces the balance, so check nobody has spent credits since the file was made."),
    edit_row("Start row", "input", placeholder="",
             help_text="Leave blank to start at row 2 (row 1 is the column names). One run imports up to 10,000 rows; for a bigger file, import it again with the next start row."),
    edit_row("End row", "input",
             help_text="Leave blank to import to the end of the file, up to 10,000 rows per run."),
])

USER_CONFIG = """
    // TODO(backend:ImportScreen) import-config: a representative subset of the user import's
    //   columns (UserImportConfig) → serve getConfig() per import type; Full user has many more.
    var KNOWN = { 'ana.silva@example.com': 1001, 'ben.okafor@example.com': 1002 };
    ImportScreen.init({
      steps: ['upload', 'map', 'options', 'review', 'results'],
      titles: { upload: 'Upload a file', map: 'Match your columns', options: 'Choose how to import', review: 'Check the rows', results: 'Import scheduled' },
      target: 'contact fields',
      accept: ['xlsx', 'csv'],
      maxBytes: 104857600,
      run: 'scheduled',
      email: 'mark.foster@affino.com',
      userName: 'Mark Foster',
      fields: [
        { key: 'UserCode', label: 'UserCode', type: 'n', hint: 'Matches an existing contact on Update or Delete.' },
        { key: 'ExternalID', label: 'External ID', type: 't', length: 50, aliases: ['ExternalID', 'CRM ID'] },
        { key: 'Email', label: 'Email', type: 'e', length: 150, required: true, aliases: ['Email address'] },
        { key: 'Title', label: 'Title', type: 't', length: 20, aliases: ['Salutation'] },
        { key: 'FirstName', label: 'First name', type: 't', length: 50, aliases: ['Forename', 'Given name'] },
        { key: 'LastName', label: 'Last name', type: 't', length: 50, aliases: ['Surname', 'Family name'] },
        { key: 'JobTitle', label: 'Job title', type: 't', length: 100, aliases: ['Position', 'Role'] },
        { key: 'Company', label: 'Company', type: 't', length: 100, aliases: ['Organisation', 'Organization'] },
        { key: 'Telephone', label: 'Telephone', type: 't', length: 30, aliases: ['Phone', 'Tel'] },
        { key: 'Country', label: 'Country', type: 't', length: 60 },
        { key: 'StoreCredits', label: 'Store credits', type: 'n', aliases: ['Credits', 'Points'] }
      ],
      check: function (o, ctx, rowNo) {
        var out = [], m = String(o.Email || '').trim().toLowerCase();
        if (m && ctx.seen[m]) out.push({ field: 'Email', problem: 'Also in row ' + ctx.seen[m] + '. Only the first is imported.', outcome: 'skip' });
        if (m) ctx.seen[m] = ctx.seen[m] || rowNo;
        if (m && KNOWN[m]) out.push({ field: 'Email', problem: 'Already a contact (UserCode ' + KNOWN[m] + '). Add skips existing contacts; use Update to change them.', outcome: 'skip' });
        return out;
      },
      demoFile: {
        name: 'event-delegates-oct.xlsx',
        bytes: 18432,
        headers: ['Email address', 'Forename', 'Surname', 'Job title', 'Organisation', 'Phone', 'Country', 'Dietary needs'],
        rows: [
          ['amira.haddad@example.com', 'Amira', 'Haddad', 'Head of Digital', 'Northbridge Media', '+44 20 7946 0101', 'United Kingdom', 'Vegetarian'],
          ['tom.becker@example.com', 'Tom', 'Becker', 'Editor', 'Rheinpost', '+49 30 901820', 'Germany', ''],
          ['  Lucy.Ng@Example.com', 'Lucy', 'Ng', 'Product Manager', 'Harbour & Co', '', 'United Kingdom', ''],
          ['ana.silva@example.com', 'Ana', 'Silva', 'Publisher', 'Silva Press', '', 'Portugal', ''],
          ['raj.patel@example', 'Raj', 'Patel', 'CTO', 'Kestrel Labs', '', 'India', 'Vegan'],
          ['tom.becker@example.com', 'Thomas', 'Becker', 'Editor', 'Rheinpost', '', 'Germany', ''],
          ['', 'Sam', 'Okoro', 'Analyst', 'Brightline', '', 'Nigeria', '']
        ]
      },
      cleanRows: [0, 1],
      nextTaskId: 48214,
      progress: []
    });"""

USER_BODY = progress_card("Imports") + "\n\n      " + flow(
    "Create, update or delete contacts in bulk. Each row is one contact.", "#", options_html=USER_OPTIONS)

page(
    out="UserImport.html",
    title="User Import",
    section="Security",
    comment=("Page content: /control/user-import on the v3 Import pattern (TASK-575621). "
             "Generated by _generate.py; edit that. v1: AfcSecurity/CC/UserImport.cfm."),
    header_actions=('<a class="btn btn--secondary" href="#" aria-label="Download sample file" data-backend-todo="import-sample">'
                    + icon("download") + '<span class="cc-header__btn-label">Sample file</span></a>'
                    # One secondary, then the kebab (the CC header rule, Figma 4105:3640). v1 puts its
                    # "Batch delete" button on the import form (BatchDelete.getBatchDeleteButton).
                    '<div class="dropdown"><button class="cc-header__kebab dropdown__trigger" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="More actions">'
                    + icon("ellipsis-vertical") + '</button><div class="dropdown__panel" role="menu" aria-label="More actions"><ul class="dropdown__list">'
                    '<li role="none"><a class="dropdown-item dropdown-item--sm" role="menuitem" href="UserBatchDelete.html">'
                    + icon("trash-2") + '<span data-text="Batch delete users">Batch delete users</span></a></li></ul></div></div>'),
    body=USER_BODY,
    config=USER_CONFIG,
    scripts='  <script src="../../components/FieldRow/FieldRow.js"></script>\n' if os.path.exists(os.path.join(HERE, "..", "..", "components", "FieldRow", "FieldRow.js")) else "",
)


# ── User Batch Delete (/control/user-batch-delete, ControlProfile 2049) ──────────────────
# v1: AfcCommunityMgr/CC/UserBatchDelete.cfm + BatchDelete.cfc. Not a file import: it lists the
# batches earlier imports created (Batch Reference, record count, created, by), ticks some, asks
# "N users will be deleted in this batch. Are you sure?", then schedules the delete. A second
# block lists batches already deleted (the audit). The six batch-delete screens share this.
BATCHES = [
    ("EVT-2026-10-DELEGATES", 312, "21 Oct 2026, 16:40", "Priya Shah"),
    ("WEBINAR-SEP-26", 1184, "30 Sep 2026, 09:12", "Mark Foster"),
    ("TRIAL-SIGNUPS-Q3", 57, "2 Sep 2026, 11:05", "Luis Moreno"),
    ("PARTNER-LIST-AUG", 2406, "14 Aug 2026, 14:22", "Priya Shah"),
]


def batch_rows():
    out = []
    for i, (ref, n, when, by) in enumerate(BATCHES):
        cid = f"bd-{i}"
        out.append(f'''<tr data-batch="{ref}" data-count="{n}">
                <td><label class="checkbox"><input type="checkbox" class="checkbox__input" id="{cid}" aria-label="Select batch {ref}, {n:,} users"><span class="checkbox__indicator">{icon("check")}</span></label></td>
                <td><strong>{ref}</strong></td><td>{n:,}</td><td>{when}</td><td>{by}</td>
              </tr>''')
    return "\n              ".join(out)


BATCH_BODY = f'''<div data-batch-result aria-live="polite"></div>

      <!-- TODO(backend:ImportScreen) batch-list: batches are mock → BatchDelete.getBatchDeleteReference
           (Type) as rows (BatchReference, COUNT, MAX(Created), creator) instead of its HTML. -->
      <section class="record-section cc-import__batches" aria-labelledby="bd-title" data-backend-todo="batch-list">
        <div class="record-section__header"><div class="cc-import__title-row"><h2 class="record-section__title" id="bd-title">Imported batches</h2><span class="badge badge--neutral" aria-label="{len(BATCHES)} batches">{len(BATCHES)}</span></div></div>
        <div class="record-section__body"><div class="cc-import__table-wrap--scroll">
          <table class="table" aria-labelledby="bd-title">
            <thead><tr><th scope="col"><span class="cc-import__sr">Select</span></th><th scope="col">Batch reference</th><th scope="col">Users</th><th scope="col">Imported</th><th scope="col">Imported by</th></tr></thead>
            <tbody>
              {batch_rows()}
            </tbody>
          </table>
        </div></div>
        <div class="cc-import__footer">
          <p class="cc-import__lead">A batch is every user imported with the same batch reference. Deleting one removes those users and everything that belongs to them.</p>
          <div class="cc-import__footer-end">
            <span class="cc-import__footer-note" id="bd-note" data-batch-note>Select one or more batches.</span>
            <button type="button" class="btn btn--alert" data-batch-delete disabled aria-describedby="bd-note">{icon("trash-2")}<span data-batch-delete-label>Delete</span></button>
          </div>
        </div>
      </section>

      <!-- TODO(backend:ImportScreen) batch-audit: mock → BatchDelete.getBatchDeleteAudit(Type) as rows. -->
      <section class="record-section" aria-labelledby="bd-audit-title" data-backend-todo="batch-audit">
        <div class="record-section__header"><h2 class="record-section__title" id="bd-audit-title">Deleted batches</h2></div>
        <div class="record-section__body">
          <ul class="cc-import__audit" data-batch-audit>
            <li><strong>SPRING-PROMO-26</strong> was deleted on 3 Jun 2026 at 10:14 by Priya Shah.</li>
            <li><strong>TEST-IMPORT-2</strong> was deleted on 19 May 2026 at 17:02 by Mark Foster.</li>
          </ul>
        </div>
      </section>'''

BATCH_MODAL = f'''
  <!-- Delete confirm: v1 asks "N users will be deleted in this batch. Are you sure?". v3 names the
       batches and the total, and Delete stays off until the total is typed (Mark, 2026-10-22). -->
  <div class="modal-overlay" id="modal-batch-delete" role="presentation">
    <div class="modal modal--confirm" role="alertdialog" aria-modal="true" aria-labelledby="bd-modal-title" aria-describedby="bd-modal-desc">
      <div class="modal__body">
        <div class="modal__icon-wrap">{icon("triangle-alert")}</div>
        <h2 class="modal__confirm-title" id="bd-modal-title" data-bd-modal-title>Delete users?</h2>
        <p class="modal__confirm-desc" id="bd-modal-desc" data-bd-modal-desc></p>
        <div class="cc-import__confirm-field">
          <label class="cc-import__confirm-label" for="bd-confirm" data-bd-confirm-label>Type the number of users to confirm</label>
          <div class="input"><div class="input__wrap"><input id="bd-confirm" type="text" inputmode="numeric" autocomplete="off" class="input__control" data-bd-confirm></div></div>
        </div>
      </div>
      <div class="modal__footer">
        <button type="button" class="btn btn--secondary" data-bd-cancel>Cancel</button>
        <!-- TODO(backend:ImportScreen) batch-delete: mock → BatchDelete.deleteBatch(BatchReference = the
             ticked references, comma-joined; Type), which schedules the delete and returns ScheduledMessage. -->
        <button type="button" class="btn btn--alert" data-bd-go disabled data-backend-todo="batch-delete">{icon("trash-2")}<span>Delete</span></button>
      </div>
    </div>
  </div>
'''

BATCH_JS = r"""
    (function () {
      var root = document.querySelector('[data-import]');
      var go = root.querySelector('[data-batch-delete]');
      var note = root.querySelector('[data-batch-note]');
      var ov = document.getElementById('modal-batch-delete');
      var input = ov.querySelector('[data-bd-confirm]');
      var ok = ov.querySelector('[data-bd-go]');
      function picked() {
        return Array.prototype.slice.call(root.querySelectorAll('[data-batch]')).filter(function (tr) {
          return tr.querySelector('input').checked;
        });
      }
      function total(rows) { return rows.reduce(function (n, tr) { return n + Number(tr.dataset.count); }, 0); }
      function sync() {
        var rows = picked(), n = total(rows);
        go.disabled = !rows.length;
        go.querySelector('[data-batch-delete-label]').textContent = rows.length ? 'Delete ' + n.toLocaleString('en-GB') + ' users' : 'Delete';
        note.textContent = rows.length ? rows.length + (rows.length === 1 ? ' batch' : ' batches') + ' selected.' : 'Select one or more batches.';
      }
      // A click anywhere on the row ticks it.
      root.addEventListener('click', function (e) {
        var tr = e.target.closest('[data-batch]');
        if (tr && !e.target.closest('label, input')) { var cb = tr.querySelector('input'); cb.checked = !cb.checked; }
        if (tr) sync();
      });
      root.addEventListener('change', sync);
      var opener;
      function close() { ov.classList.remove('modal-overlay--open'); if (opener) opener.focus(); }
      go.addEventListener('click', function () {
        var rows = picked(), n = total(rows);
        opener = go;
        ov.querySelector('[data-bd-modal-title]').textContent = 'Delete ' + n.toLocaleString('en-GB') + ' users?';
        ov.querySelector('[data-bd-modal-desc]').textContent =
          'Every user in ' + rows.map(function (tr) { return tr.dataset.batch; }).join(', ') +
          ' will be deleted, with their orders, notes and list memberships. This can’t be undone.';
        ov.querySelector('[data-bd-confirm-label]').textContent = 'Type ' + n + ' to confirm';
        input.value = ''; ok.disabled = true; ok.dataset.need = String(n);
        ov.classList.add('modal-overlay--open');
        ov.querySelector('[data-bd-cancel]').focus();
      });
      input.addEventListener('input', function () { ok.disabled = input.value.replace(/[,\s]/g, '') !== ok.dataset.need; });
      ov.querySelector('[data-bd-cancel]').addEventListener('click', close);
      ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ov.classList.contains('modal-overlay--open')) close(); });
      ok.addEventListener('click', function () {
        var rows = picked(), n = total(rows);
        close();
        root.querySelector('[data-batch-result]').innerHTML =
          '<div class="alert alert--success" role="status"><div class="alert__header"><span class="alert__icon"><i data-lucide="circle-check" aria-hidden="true"></i></span>' +
          '<div class="alert__text"><span class="alert__title">Delete scheduled.</span><span class="alert__message"> ' + n.toLocaleString('en-GB') +
          ' users in ' + rows.map(function (tr) { return tr.dataset.batch; }).join(', ') + ' will be deleted in the background. We’ll email you when it’s done.</span></div></div></div>';
        rows.forEach(function (tr) { tr.remove(); });
        var chip = root.querySelector('#bd-title + .badge'), left = root.querySelectorAll('[data-batch]').length;
        chip.textContent = left; chip.setAttribute('aria-label', left + ' batches');
        sync();
        if (window.lucide) lucide.createIcons();
        go.focus();
      });
    })();"""

page(
    out="UserBatchDelete.html",
    title="User Batch Delete",
    section="Security",
    comment=("Page content: /control/user-batch-delete on the v3 Import pattern (TASK-575621). "
             "Generated by _generate.py; edit that. v1: AfcCommunityMgr/CC/UserBatchDelete.cfm + "
             "AfcAutomation/cfc/BatchDelete.cfc. Shared by the six batch-delete screens."),
    header_actions=('<a class="btn btn--secondary" href="UserImport.html" aria-label="User import">'
                    + icon("upload") + '<span class="cc-header__btn-label">User import</span></a>'),
    body=BATCH_BODY,
    config=BATCH_JS,
)

# The modal sits straight after </main>, before the page scripts that wire it.
p = os.path.join(HERE, "UserBatchDelete.html")
s = open(p, encoding="utf-8").read()
assert s.count("  </main>") == 1
s = s.replace("  </main>", "  </main>\n" + BATCH_MODAL, 1)
# The batch screen has no flow, so it doesn't need ImportScreen.js / Stepper.js.
s = s.replace('  <script src="../../../components/Stepper/Stepper.js"></script>\n', "")
s = s.replace('  <script src="ImportScreen.js"></script>\n', "")
open(p, "w", encoding="utf-8").write(s)
