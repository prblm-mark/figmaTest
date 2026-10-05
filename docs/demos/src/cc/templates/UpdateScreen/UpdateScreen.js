/* UpdateScreen — behaviour for the /control/update demo (TASK-470993).
 *
 *   1. Full width: sections take RecordSection Width=Full, and the warning becomes the Alert
 *      `--fixed` bar (Figma's full-width style), following `cc:width`.
 *   2. Run: actions marked `data-update-confirm` open a confirm modal first (new in v3; classic
 *      ran on one click). The rest run straight away.
 *   3. Result: a success / failure Alert above the sections, worded as classic words it
 *      ("<update type> successful" / "... failed").
 *   4. Clear Cache zone: picking a zone re-counts the Guest / Bot badges.
 *   5. Running state (designer, 2026-10-02): the row shows a Spinner and status line while an
 *      action runs. Actions that report progress (data-update-total: Update All Skins, Update
 *      Internal Links) also show "n of total" and a bar, and their Run button becomes Cancel. The
 *      others are single steps on the server (System, Re-Initialize, CDN…) with nothing to stop
 *      part-way, so they show "Running…" only. Every other Run button is disabled until it
 *      finishes, so two updates can't overlap.
 *
 * Demo switches, for review only:
 *   ?fail=<key>  that action reports failure (e.g. ?fail=system)
 *   ?ssc=1       render as a user whose security list lacks code 2 (hides Release Notes / Updater)
 *
 * TODO(backend:UpdateScreen) [update-actions]: every action here is mock. Real behaviour, from
 * AfcControl/CC/Update.cfm:
 *   - Run       → GET {thisDoc}?uKey=<key>&update=1, server renders the result banner.
 *   - popup     → skins: DC_UpdateSkins.cfm?clearcache=1 (and &ZoneCode= for zone skins);
 *                 Clear Cache: ClearGuestCache.cfm?ZoneCode=<zone>; Internal Links:
 *                 UpdateInternalLinksPopup.cfm. Keep them as dialogs on v3.
 *   - counts    → skins assigned to channels, PageCache Guest / Bot, Site.CDNVersion.
 *   - zone      → PageCache.cfc?method=GetClearCacheCount&zonecode=<zone> → {GUESTCOUNT, BOTCOUNT}.
 *   - rows      → render only when Session.UserProfile SSC contains the row's data-ssc.
 *   - CDN       → bumps Site.CDNVersion, then reloads with ?clearcache=1.
 *   - progress  → NEW: a progress feed for the long-running jobs (skins, internal links), e.g.
 *                 GET …/status?job=<id> → {done, total, state}, polled; and a cancel endpoint
 *                 (POST …/cancel?job=<id>) that stops after the current item and reports `done`.
 *                 The single-step actions only need start → finished / failed.
 */
(function () {
  'use strict';

  var page = document.querySelector('.cc-update');
  if (!page) return;

  var params = new URLSearchParams(window.location.search);
  var failKey = params.get('fail');

  /* ── Demo SSC preview ─────────────────────────────────────────── */
  if (params.get('ssc') === '1') {
    page.querySelectorAll('[data-ssc="2"]').forEach(function (row) { row.remove(); });
  }

  /* ── 1. Full width ────────────────────────────────────────────── */
  function mirror(mode) {
    var full = mode === 'full';
    page.querySelectorAll('.record-section').forEach(function (s) { s.classList.toggle('record-section--full', full); });
    page.querySelectorAll(':scope > .alert').forEach(function (a) { a.classList.toggle('alert--fixed', full); });
  }
  document.addEventListener('cc:width', function (e) { mirror(e.detail.mode); });
  var shell = document.querySelector('.cc-control');
  mirror(shell ? shell.getAttribute('data-cc-width') : 'standard');

  /* ── 3. Result banner ─────────────────────────────────────────── */
  /* Classic's own names for each update type (sUpdateType). */
  var TYPE = {
    system: 'System Update',
    designelements: 'Design Element Update',
    skins: 'Skins Update',
    ReInitialize: 'Re-Initialization',
    ClearGuestCache: 'Clear Guest Cache',
    cdn: 'CDN Files',
    RegionsAndCities: 'Regions and Cities update',
    ResetScheduledTasks: 'Reset Scheduled Tasks',
    UpdateInternalLinks: 'Internal Links update',
    UpdateAIPrompts: 'AI Prompts update'
  };
  var slot = page.querySelector('[data-update-result]');

  function showResult(key, kind, message) {
    var name = TYPE[key] || 'Update';
    var title = name + (kind === 'success' ? ' successful' : kind === 'warning' ? ' cancelled' : ' failed');
    var icon = kind === 'success' ? 'circle-check' : kind === 'warning' ? 'circle-pause' : 'circle-alert';
    slot.innerHTML =
      '<div class="alert alert--' + kind + '" role="' + (kind === 'danger' ? 'alert' : 'status') + '">' +
        '<div class="alert__header">' +
          '<span class="alert__icon"><i data-lucide="' + icon + '" aria-hidden="true"></i></span>' +
          '<div class="alert__text"><span class="alert__title">' + title + '</span>' +
            (message ? '<span class="alert__message"> ' + message + '</span>' : '') + '</div>' +
          '<button type="button" class="alert__close" aria-label="Dismiss"><i data-lucide="x" aria-hidden="true"></i></button>' +
        '</div>' +
      '</div>';
    if (shell && shell.getAttribute('data-cc-width') === 'full') slot.firstChild.classList.add('alert--fixed');
    if (window.lucide) window.lucide.createIcons();
  }

  /* ── 5. Running state ─────────────────────────────────────────── */
  var SPINNER = '<span class="spinner spinner--sm spinner--brand" aria-hidden="true">' +
    '<svg class="spinner__svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<circle class="spinner__track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"></circle>' +
      '<path class="spinner__arc" d="M12 2 a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>' +
    '</svg></span>';
  var VERB = { skins: 'Updating skins', UpdateInternalLinks: 'Updating internal links' };
  var fmt = new Intl.NumberFormat('en-GB');
  var job = null;   /* one at a time: { btn, key, row, status, timer, done, total, unit, label, aria } */

  function setRunLocked(locked, except) {
    page.querySelectorAll('[data-update-action]').forEach(function (b) {
      if (b !== except) b.disabled = locked;
    });
  }

  function statusText(j) {
    /* The verb names what is counted ("Updating skins… 34 of 128"), so no unit here. */
    return j.total ? (VERB[j.key] || 'Running') + '… ' + fmt.format(j.done) + ' of ' + fmt.format(j.total)
                   : 'Running…';
  }

  function render(j) {
    j.status.querySelector('.cc-update__status-text').textContent = statusText(j);
    var fill = j.status.querySelector('.cc-update__progress-fill');
    if (fill) fill.style.setProperty('--cc-update-progress', (100 * j.done / j.total).toFixed(1) + '%');
  }

  function start(btn) {
    if (job) return;
    var key = btn.getAttribute('data-update-action');
    var row = btn.closest('[data-update-row]');
    var total = parseInt(btn.getAttribute('data-update-total') || '0', 10);
    var cancellable = btn.hasAttribute('data-update-cancellable');
    var status = document.createElement('div');
    status.className = 'cc-update__status';
    status.setAttribute('role', 'status');
    status.innerHTML = '<div class="cc-update__status-line">' + SPINNER + '<span class="cc-update__status-text"></span></div>' +
      (total ? '<div class="cc-update__progress" aria-hidden="true"><div class="cc-update__progress-fill"></div></div>' : '');
    row.querySelector('.field-row__value').appendChild(status);
    row.setAttribute('aria-busy', 'true');

    job = { btn: btn, key: key, row: row, status: status, done: 0, total: total,
            unit: btn.getAttribute('data-update-unit') || '', label: btn.innerHTML, aria: btn.getAttribute('aria-label') };
    render(job);
    setRunLocked(true, cancellable ? btn : null);
    if (cancellable) {
      btn.innerHTML = '<span>Cancel</span>';
      btn.setAttribute('aria-label', 'Cancel ' + row.querySelector('.field-row__label').textContent.trim());
      btn.setAttribute('data-update-running', '');
    } else {
      btn.disabled = true;
    }
    slot.innerHTML = '';

    /* Mock progress. Live: poll the job's status feed (see TODO at the top). */
    if (total) {
      job.timer = setInterval(function () {
        job.done = Math.min(job.total, job.done + Math.ceil(job.total / 40));
        render(job);
        /* ?fail=<key> stops part-way, as a real failure would. */
        if (key === failKey && job.done >= job.total * 0.6) finish('danger');
        else if (job.done >= job.total) finish('success');
      }, 120);
    } else {
      job.timer = setTimeout(function () { finish(key !== failKey ? 'success' : 'danger'); }, 1500);
    }
  }

  function finish(kind) {
    var j = job;
    if (!j) return;
    clearInterval(j.timer);
    clearTimeout(j.timer);
    j.status.remove();
    j.row.removeAttribute('aria-busy');
    j.btn.innerHTML = j.label;
    if (j.aria) j.btn.setAttribute('aria-label', j.aria);
    j.btn.removeAttribute('data-update-running');
    setRunLocked(false);
    j.btn.disabled = false;
    job = null;

    if (kind === 'success' && j.key === 'cdn') {
      var v = page.querySelector('[data-update-count="cdn"]');
      if (v) v.textContent = 'Version ' + (parseInt(v.textContent.replace(/\D/g, ''), 10) + 1);
    }
    if (kind === 'success' && j.key === 'ClearGuestCache') setCounts(0, 0);

    var msg = j.total ? fmt.format(j.done) + ' of ' + fmt.format(j.total) + ' ' + j.unit + ' updated' +
      (kind === 'danger' ? ' before it stopped.' : '.') : '';
    showResult(j.key, kind, msg);
    j.btn.focus();
  }

  /* ── 2. Confirm modal ─────────────────────────────────────────── */
  var modal = document.getElementById('update-confirm');
  var titleEl = document.getElementById('update-confirm-title');
  var bodyEl = document.getElementById('update-confirm-body');
  var goBtn = modal && modal.querySelector('[data-update-go]');
  var pending = null;

  function openConfirm(btn) {
    var row = btn.closest('[data-update-row]');
    var label = row.querySelector('.field-row__label').textContent.trim();
    var desc = row.querySelector('.field-row__value p').textContent.trim();
    var zone = row.querySelector('[data-update-zone] .sel__value');
    pending = btn;
    titleEl.textContent = 'Run ' + label + '?';
    bodyEl.textContent = desc + (zone ? ' Zone: ' + zone.textContent.trim() + '.' : '') +
      ' This can take up to a quarter of an hour on large sites.';
    modal.classList.add('modal-overlay--open');
    goBtn.focus();
  }

  function closeConfirm() {
    modal.classList.remove('modal-overlay--open');
    if (pending) pending.focus();
    pending = null;
  }

  if (modal) {
    modal.querySelectorAll('[data-update-cancel]').forEach(function (b) { b.addEventListener('click', closeConfirm); });
    modal.addEventListener('click', function (e) { if (e.target === modal) closeConfirm(); });
    goBtn.addEventListener('click', function () {
      var btn = pending;
      closeConfirm();
      if (btn) start(btn);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('modal-overlay--open')) closeConfirm();
    });
  }

  page.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-update-action]');
    if (!btn) return;
    if (btn.hasAttribute('data-update-running')) { finish('warning'); return; }
    if (btn.hasAttribute('data-update-confirm')) openConfirm(btn);
    else start(btn);
  });

  /* ── 4. Clear Cache zone re-count ─────────────────────────────── */
  /* Mock per-zone counts. Live: PageCache.cfc?method=GetClearCacheCount. */
  var COUNTS = { 0: [1284, 312], 1: [902, 241], 2: [318, 60], 3: [64, 11] };
  function setCounts(guest, bot) {
    var g = page.querySelector('[data-update-count="guest"]');
    var b = page.querySelector('[data-update-count="bot"]');
    if (g) g.textContent = 'Guest ' + fmt.format(guest);
    if (b) b.textContent = 'Bot ' + fmt.format(bot);
  }
  /* Bubbles after Select.js's document listener has set the value. */
  document.addEventListener('click', function (e) {
    var item = e.target.closest('[data-update-zone] .sel__menu-item');
    if (!item) return;
    var c = COUNTS[item.getAttribute('data-zone-code')] || [0, 0];
    setCounts(c[0], c[1]);
  });
})();
