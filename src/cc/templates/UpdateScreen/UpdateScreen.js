/* UpdateScreen — behaviour for the /control/update demo (TASK-470993).
 *
 *   1. Full width: sections take RecordSection Width=Full, and the warning becomes the Alert
 *      `--fixed` bar (Figma's full-width style), following `cc:width`.
 *   2. Run: actions marked `data-update-confirm` open a confirm modal first (new in v3; classic
 *      ran on one click). The rest run straight away.
 *   3. Result: a success / failure Alert above the sections, worded as classic words it
 *      ("<update type> successful" / "... failed").
 *   4. Clear Cache zone: picking a zone re-counts the Guest / Bot badges.
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

  function showResult(key, ok) {
    var name = TYPE[key] || 'Update';
    slot.innerHTML =
      '<div class="alert alert--' + (ok ? 'success' : 'danger') + '" role="' + (ok ? 'status' : 'alert') + '">' +
        '<div class="alert__header">' +
          '<span class="alert__icon"><i data-lucide="' + (ok ? 'circle-check' : 'circle-alert') + '" aria-hidden="true"></i></span>' +
          '<div class="alert__text"><span class="alert__title">' + name + (ok ? ' successful' : ' failed') + '</span></div>' +
          '<button type="button" class="alert__close" aria-label="Dismiss"><i data-lucide="x" aria-hidden="true"></i></button>' +
        '</div>' +
      '</div>';
    if (shell && shell.getAttribute('data-cc-width') === 'full') slot.firstChild.classList.add('alert--fixed');
    if (window.lucide) window.lucide.createIcons();
  }

  function run(btn) {
    var key = btn.getAttribute('data-update-action');
    var ok = key !== failKey;
    if (ok && key === 'cdn') {
      var v = page.querySelector('[data-update-count="cdn"]');
      if (v) v.textContent = 'Version ' + (parseInt(v.textContent.replace(/\D/g, ''), 10) + 1);
    }
    if (ok && key === 'ClearGuestCache') setCounts(0, 0);
    showResult(key, ok);
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
      if (btn) run(btn);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('modal-overlay--open')) closeConfirm();
    });
  }

  page.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-update-action]');
    if (!btn) return;
    if (btn.hasAttribute('data-update-confirm')) openConfirm(btn);
    else run(btn);
  });

  /* ── 4. Clear Cache zone re-count ─────────────────────────────── */
  /* Mock per-zone counts. Live: PageCache.cfc?method=GetClearCacheCount. */
  var COUNTS = { 0: [1284, 312], 1: [902, 241], 2: [318, 60], 3: [64, 11] };
  var fmt = new Intl.NumberFormat('en-GB');
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
