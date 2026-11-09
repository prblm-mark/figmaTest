/* WhatsOnListing — Control-side behaviour (prototype, in memory only)
 * ────────────────────────────────────────────────────────────────────────────
 * Inbox: Details opens the pre-rendered submission modal; Save & Publish and
 * Reject remove the row and confirm with a toast. Service Credits: Release
 * Hold flips a Held row back to Available. Nothing persists — a reload
 * restores the sample data.
 *
 * TODO(backend:WhatsOn): every action here is DOM-only.
 *   Save & Publish → POST /control/inbox/{articleId}/approve
 *     (ticks Live + Syndication, sets Publish Start/End, deducts the held credit,
 *      writes the audit entry, sends the approval notification)
 *   Reject         → POST /control/inbox/{articleId}/reject {reason, message, notify}
 *     (releases the held credit)
 *   Release Hold   → POST /control/service-credits/{id}/release
 * The held-credit storage model is still open (Lynx, 18 Sep, query 1).
 */

/* Capture mode — same contract as ControlRecordScreen.js:
 *   ?capture=tall&v=<n>&w=<px>
 * names the frame from data-capture-name + version + Desktop/Mobile, and pins
 * the render width on the page (the Chrome window will not hold a size). */
(function () {
  var q = window.location.search;
  var mode = (/[?&]capture=([a-z0-9]+)/.exec(q) || [])[1];
  if (!mode) return;
  var root = document.documentElement;
  /* `tall` unpicks the fixed-height app shell so the frame is the full page
     height, not one viewport (rules in WhatsOnListing.css). */
  root.setAttribute('data-capture', mode);
  var version = 'v' + ((/[?&]v=(\d+)/.exec(q) || [])[1] || '1');
  var w = parseInt((/[?&]w=(\d+)/.exec(q) || [])[1], 10);
  if (w) {
    root.style.width = w + 'px';
    root.style.overflowX = 'hidden';
    document.body.style.width = w + 'px';
    document.body.style.minWidth = w + 'px';
  }
  var name = root.getAttribute('data-capture-name') || document.title;
  /* A popup state is its own frame, so it needs its own name. */
  var opened = (/[?&]open=([\w-]+)/.exec(q) || [])[1];
  if (opened) name += opened === 'wol-reject' ? ' · Reject modal' : ' · Details modal';
  var variant = (w || window.innerWidth) <= 600 ? 'Mobile' : 'Desktop';
  document.title = 'TASK-344419 — WhatsOnListing — ' + name + ' — ' + version + ' · ' + variant;
})();

(function () {
  'use strict';

  var stack = document.getElementById('cc-toasts');

  /* Toast component markup, spawned into the shell's own stack. */
  function toast(variant, icon, message) {
    if (!stack) return;
    var t = document.createElement('div');
    t.className = 'toast toast--' + variant;
    t.setAttribute('role', 'status');
    t.innerHTML =
      '<span class="toast__icon"><i data-lucide="' + icon + '" aria-hidden="true"></i></span>' +
      '<p class="toast__message"></p>' +
      '<button type="button" class="toast__close" aria-label="Dismiss"><i data-lucide="x" aria-hidden="true"></i></button>';
    t.querySelector('.toast__message').textContent = message;
    stack.appendChild(t);
    if (window.lucide) window.lucide.createIcons();
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { t.classList.add('toast--in'); });
    });
    function dismiss() {
      t.classList.remove('toast--in');
      t.classList.add('toast--leaving');
      setTimeout(function () { t.remove(); }, 400);
    }
    t.querySelector('.toast__close').addEventListener('click', dismiss);
    setTimeout(dismiss, 5000);
  }

  /* ── Modals ──────────────────────────────────────────────────────────── */
  var lastTrigger = null;

  function open(id, trigger, quiet) {
    var m = document.getElementById(id);
    if (!m) return;
    lastTrigger = trigger || null;
    m.classList.add('modal-overlay--open');
    document.body.style.overflow = 'hidden';
    /* No focus move when opened from the URL: a capture would draw the
       close button's focus ring as if it were part of the design. */
    var focusable = m.querySelector('.modal__close');
    if (focusable && !quiet) focusable.focus();
  }

  function close(m) {
    m.classList.remove('modal-overlay--open');
    document.body.style.overflow = '';
    if (lastTrigger) lastTrigger.focus();
  }

  /* ?open=<modal id> opens a modal on load, so a popup state has its own URL
     for Figma capture and headless checks (e.g. ?open=wol-detail-101). */
  var initial = (/[?&]open=([\w-]+)/.exec(window.location.search) || [])[1];
  if (initial && initial.indexOf('wol-') === 0) open(initial, null, true);

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var m = document.querySelector('.modal-overlay--open[id^="wol-"]');
    if (m) close(m);
  });

  /* ── Rows ────────────────────────────────────────────────────────────── */
  var pendingReject = null;

  function removeRow(id) {
    var row = document.querySelector('[data-wol-id="' + id + '"]');
    if (!row) return null;
    var title = row.querySelector('.datatables__record-link').textContent;
    row.setAttribute('data-wol-gone', '');
    var tbody = row.parentElement;
    if (!tbody.querySelector('tr:not([data-wol-gone])')) {
      var empty = document.createElement('tr');
      empty.innerHTML = '<td colspan="6" class="wol-muted">Nothing waiting for approval.</td>';
      tbody.appendChild(empty);
    }
    return title;
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-wol-detail],[data-wol-approve],[data-wol-reject],[data-wol-reject-confirm],[data-wol-close],[data-wol-release],[data-wol-toast]');
    if (!t) {
      /* Click on the overlay itself (outside the dialog) closes it. */
      if (e.target.classList && e.target.classList.contains('modal-overlay') && e.target.id.indexOf('wol-') === 0) close(e.target);
      return;
    }

    if (t.hasAttribute('data-wol-detail')) {
      open('wol-detail-' + t.getAttribute('data-wol-detail'), t);
    } else if (t.hasAttribute('data-wol-approve')) {
      var title = removeRow(t.getAttribute('data-wol-approve'));
      toast('success', 'check', title + ' is live. Live and Syndication ticked, 1 held credit deducted, approval sent.');
    } else if (t.hasAttribute('data-wol-reject')) {
      pendingReject = t.getAttribute('data-wol-reject');
      open('wol-reject', t);
    } else if (t.hasAttribute('data-wol-reject-confirm')) {
      var reason = document.querySelector('[data-wol-reason]');
      var name = removeRow(pendingReject);
      close(document.getElementById('wol-reject'));
      toast('info', 'info', name + ' rejected: ' + (reason ? reason.textContent : '') + '. The held credit is back in the promoter’s balance.');
      pendingReject = null;
    } else if (t.hasAttribute('data-wol-close')) {
      close(t.closest('.modal-overlay'));
    } else if (t.hasAttribute('data-wol-release')) {
      var row = t.closest('tr');
      row.querySelector('[data-wol-status]').innerHTML = '<span class="badge badge--success badge--pill">Available</span>';
      row.querySelector('[data-wol-against]').innerHTML = '<span class="wol-muted">—</span>';
      t.remove();
      toast('info', 'info', 'Hold released. The credit is available again and the listing it was held against is cleared.');
    } else if (t.hasAttribute('data-wol-toast')) {
      toast('info', 'info', t.getAttribute('data-wol-toast'));
    }
  });
})();
