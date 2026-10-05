/* ExportSystem — behaviour for the /control/export-system-json-and-css demo (TASK-470995).
 *
 *   1. Full width: sections take RecordSection Width=Full and banners the Alert `--fixed` bar,
 *      following `cc:width` (as UpdateScreen).
 *   2. Selection: Export is disabled until a target is ticked and counts them ("Export 3").
 *      Select all / Clear all toggles every box.
 *   3. Export (mock): the button shows a Spinner and "Exporting…" and the boxes lock — classic
 *      runs with a 500-second request timeout, so a wait is real. Then a success Alert lists what
 *      was saved, and the two listed files take a new modified date when they were re-exported.
 *   4. Issues: exporting ControlProfileHelp reports its broken references as a warning Alert,
 *      in classic's wording ("<Profile> - HelpRelated item not found: …").
 *
 * Demo switch, for review only:
 *   ?fail=<Target>  that target fails (e.g. ?fail=TextItem) → a danger Alert names it.
 *
 * TODO(backend:ExportSystem) export-system-run: everything here is mock. Real behaviour, from
 * /AcuSystem/CC/ExportSystemXML.cfm:
 *   - Export  → POST {thisDoc} SystemDB=<1-based indexes into the SORTED target list>. Each target
 *               queries the system DB and writes AfcEngine/<Target>.json (TextItem writes 13,
 *               TextItem<Lang>.json). ControlCentreCSS builds cc-styles.css (lion; not in the
 *               affino.com copy of the file, so its output path wants confirming).
 *   - Result  → classic returns "Saved following data in JSON format:" + "- <Target>" per target.
 *               Send the list as data (target, files[], ok) so failures can be named.
 *   - Issues  → ControlProfileHelp's HelpRelated / HelpSecurityRights entries that resolve to no
 *               Control Profile / security right. Send them as data: [{profile, kind, items[]}].
 * TODO(backend:ExportSystem) export-system-files: the files table is static; Download is "#".
 * TODO(backend:ExportSystem) export-system-download-path: SECURITY — classic's download takes
 *   `path` AND `file` from the URL (?fmAction=download&path=…&file=…) and serves that file from
 *   disk, so it can read any file the server can. The v3 route must accept a file NAME from a
 *   fixed allow-list (ControlProfile.json, ControlProfileHelp.json) and resolve it under
 *   AfcEngine/ itself.
 */
(function () {
  'use strict';

  var page = document.querySelector('.cc-export');
  if (!page) return;

  var shell = document.querySelector('.cc-control');
  var params = new URLSearchParams(location.search);
  var failTarget = params.get('fail');

  /* ── 1. Full width ────────────────────────────────────────────── */
  function isFull() { return shell && shell.getAttribute('data-cc-width') === 'full'; }
  function mirror(mode) {
    var full = mode === 'full';
    page.querySelectorAll('.record-section').forEach(function (s) { s.classList.toggle('record-section--full', full); });
    page.querySelectorAll('[data-export-result] > .alert').forEach(function (a) { a.classList.toggle('alert--fixed', full); });
  }
  document.addEventListener('cc:width', function (e) { mirror(e.detail.mode); });
  mirror(isFull() ? 'full' : 'standard');

  /* ── 2. Selection ─────────────────────────────────────────────── */
  var boxes = [].slice.call(page.querySelectorAll('[data-export-target]'));
  var goBtn = page.querySelector('[data-export-go]');
  var goLabel = page.querySelector('[data-export-go-label]');
  var allBtn = page.querySelector('[data-export-all]');
  var busy = false;

  function picked() { return boxes.filter(function (b) { return b.checked; }); }

  function sync() {
    var n = picked().length;
    goBtn.disabled = busy || n === 0;
    if (!busy) goLabel.textContent = n > 1 ? 'Export ' + n : 'Export';
    allBtn.textContent = n === boxes.length ? 'Clear all' : 'Select all';
    allBtn.disabled = busy;
  }
  page.addEventListener('change', function (e) { if (e.target.matches('[data-export-target]')) sync(); });
  allBtn.addEventListener('click', function () {
    var on = picked().length !== boxes.length;
    boxes.forEach(function (b) { b.checked = on; });
    sync();
  });
  sync();

  /* ── 3. Export ────────────────────────────────────────────────── */
  var SPINNER = '<span class="spinner spinner--sm" aria-hidden="true">' +
    '<svg class="spinner__svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<circle class="spinner__track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"></circle>' +
      '<path class="spinner__arc" d="M12 2 a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>' +
    '</svg></span>';

  /* What each target writes — the same words as its checkbox helper. */
  var WRITES = {
    ChannelType: 'ChannelType.json',
    ControlCentreCSS: 'cc-styles.css',
    ControlProfile: 'ControlProfile.json',
    ControlProfileHelp: 'ControlProfileHelp.json',
    DesignCellType: 'DesignCellType.json',
    LanguageItem: 'LanguageItem.json',
    SysSecurity: 'SysSecurity.json',
    SystemSecurityGroup: 'SystemSecurityGroup.json',
    TextItem: '13 TextItem<Lang>.json files'
  };

  /* Mock: two broken references of the kind classic reports. The profile names are real CC
     screens; the missing items are invented. */
  var HELP_ISSUES = [
    { profile: 'Article Archive', kind: 'HelpRelated item', items: ['Archive Settings'] },
    { profile: 'Media Items', kind: 'HelpSecurityRights right', items: ['Media Library Admin', 'DAM Upload'] }
  ];

  var slot = page.querySelector('[data-export-result]');

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function alertHTML(kind, icon, title, message, items) {
    return '<div class="alert alert--' + kind + (isFull() ? ' alert--fixed' : '') + '" role="' + (kind === 'danger' ? 'alert' : 'status') + '">' +
      '<div class="alert__header">' +
        '<span class="alert__icon"><i data-lucide="' + icon + '" aria-hidden="true"></i></span>' +
        '<div class="alert__text"><span class="alert__title">' + esc(title) + '</span>' +
          (message ? '<span class="alert__message"> ' + esc(message) + '</span>' : '') + '</div>' +
        '<button type="button" class="alert__close" aria-label="Dismiss"><i data-lucide="x" aria-hidden="true"></i></button>' +
      '</div>' +
      (items && items.length
        ? '<div class="alert__body"><ul class="alert__list">' + items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul></div>'
        : '') +
    '</div>';
  }

  function stamp(d) {
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' +
      p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  }

  function setBusy(on) {
    busy = on;
    boxes.forEach(function (b) { b.disabled = on; });
    goBtn.setAttribute('aria-busy', on ? 'true' : 'false');
    var spin = goBtn.querySelector('.spinner');
    if (on && !spin) goBtn.insertAdjacentHTML('afterbegin', SPINNER);
    if (!on && spin) spin.remove();
    if (on) goLabel.textContent = 'Exporting…';
    sync();
  }

  goBtn.addEventListener('click', function () {
    var targets = picked().map(function (b) { return b.getAttribute('data-export-target'); });
    if (!targets.length) return;
    slot.innerHTML = '';
    setBusy(true);

    setTimeout(function () {
      var ok = targets.filter(function (t) { return t !== failTarget; });
      var failed = targets.filter(function (t) { return t === failTarget; });
      var html = '';

      if (ok.length) {
        html += alertHTML('success', 'circle-check',
          ok.length === 1 ? 'Export complete.' : ok.length + ' exports complete.',
          'Saved:',
          ok.map(function (t) { return t + ' → ' + WRITES[t]; }));
      }
      if (failed.length) {
        html += alertHTML('danger', 'circle-alert', 'Export failed.', null,
          failed.map(function (t) { return t + ' was not saved. Nothing was overwritten.'; }));
      }
      /* Classic appends its ISSUES block after the status message. */
      if (ok.indexOf('ControlProfileHelp') !== -1) {
        var lines = [];
        HELP_ISSUES.forEach(function (i) {
          lines.push(i.profile + ' — ' + i.kind + (i.items.length > 1 ? 's' : '') + ' not found: ' + i.items.join(', '));
        });
        html += alertHTML('warning', 'triangle-alert', 'ControlProfileHelp has references that don’t resolve.',
          'The file was saved; these entries link to nothing.', lines);
      }
      slot.innerHTML = html;

      /* The two listed files take today's date when they were re-exported. */
      var now = stamp(new Date());
      ok.forEach(function (t) {
        var row = page.querySelector('[data-export-file="' + t + '"] [data-export-modified]');
        if (row) row.textContent = now;
      });

      setBusy(false);
      if (window.lucide) window.lucide.createIcons();
      goBtn.focus();
    }, 1200);
  });

  /* Dismissing a banner removes it. */
  slot.addEventListener('click', function (e) {
    var close = e.target.closest('.alert__close');
    if (close) close.closest('.alert').remove();
  });
})();
