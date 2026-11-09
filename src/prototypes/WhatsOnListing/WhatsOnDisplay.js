/* WhatsOnDisplay — display-side behaviour (prototype, in memory only)
 * ────────────────────────────────────────────────────────────────────────────
 * Accordion toggles, product tabs, the terms modal, the description word count,
 * address choice highlighting, and the "up to 2" cap on the area / event-type
 * lists. Navigation between screens is plain links in the markup.
 *
 * TODO(backend:WhatsOn): nothing here is real — basket, coupon, checkout and
 * submission are mock. Contracts are the Hub plan's build tasks
 * (TASK-470892…470898): Stripe checkout for the catalogue items, the Service
 * Credit hold on Submit, and the LiveEdit Event form for the submission.
 */

/* Capture mode — ?capture=tall&v=<n>&w=<px>. Same contract as the Control
 * screens: names the frame and pins the render width on the page. */
(function () {
  var q = window.location.search;
  var mode = (/[?&]capture=([a-z0-9]+)/.exec(q) || [])[1];
  if (!mode) return;
  var root = document.documentElement;
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
  if (/[?&]open=wod-terms/.test(q)) name += ' · Terms modal';
  var variant = (w || window.innerWidth) <= 600 ? 'Mobile' : 'Desktop';
  document.title = 'TASK-344419 — WhatsOnListing — Display ' + name + ' — ' + version + ' · ' + variant;
})();

(function () {
  'use strict';

  /* ── Accordion — the Accordion component's own demo logic ───────────── */
  document.querySelectorAll('[data-acc-trigger]').forEach(function (trigger) {
    var item = trigger.closest('.acc__item');
    trigger.setAttribute('aria-expanded', String(item.classList.contains('acc__item--open')));
    trigger.addEventListener('click', function () {
      var acc = trigger.closest('.acc');
      if (acc.dataset.acc === 'single') {
        acc.querySelectorAll(':scope > .acc__item').forEach(function (i) {
          if (i !== item) i.classList.remove('acc__item--open');
        });
      }
      item.classList.toggle('acc__item--open');
      trigger.setAttribute('aria-expanded', String(item.classList.contains('acc__item--open')));
    });
  });

  /* ── Tabs (roving tabindex, WAI tabs pattern) ───────────────────────── */
  document.querySelectorAll('.wod-tabs').forEach(function (strip) {
    var tabs = Array.prototype.slice.call(strip.querySelectorAll('.wod-tab'));
    function select(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('wod-tab--active', on);
        t.setAttribute('aria-selected', String(on));
        t.setAttribute('tabindex', on ? '0' : '-1');
        var p = document.getElementById(t.getAttribute('aria-controls'));
        if (p) p.hidden = !on;
      });
    }
    strip.addEventListener('click', function (e) {
      var t = e.target.closest('.wod-tab');
      if (t) select(t);
    });
    strip.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var next = e.key === 'ArrowRight' ? tabs[(i + 1) % tabs.length]
        : e.key === 'ArrowLeft' ? tabs[(i - 1 + tabs.length) % tabs.length] : null;
      if (!next) return;
      e.preventDefault();
      next.focus();
      select(next);
    });
  });

  /* ── Terms modal ────────────────────────────────────────────────────── */
  var terms = document.getElementById('wod-terms');
  var lastTrigger = null;
  function openTerms(trigger, quiet) {
    lastTrigger = trigger || null;
    terms.classList.add('modal-overlay--open');
    document.body.style.overflow = 'hidden';
    if (!quiet) terms.querySelector('.modal__close').focus();
  }
  function closeTerms() {
    terms.classList.remove('modal-overlay--open');
    document.body.style.overflow = '';
    if (lastTrigger) lastTrigger.focus();
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-wod-terms]');
    if (t) { e.preventDefault(); openTerms(t); return; }
    if (e.target.closest('[data-wod-close]') || e.target === terms) closeTerms();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && terms.classList.contains('modal-overlay--open')) closeTerms();
  });
  if (/[?&]open=wod-terms/.test(window.location.search)) openTerms(null, true);

  /* ── Description word count ─────────────────────────────────────────── */
  document.querySelectorAll('[data-wod-words]').forEach(function (ta) {
    var max = parseInt(ta.getAttribute('data-wod-words'), 10);
    var out = ta.closest('.textarea').querySelector('[data-wod-wordcount]');
    function count() {
      var n = (ta.value.trim().match(/\S+/g) || []).length;
      out.textContent = n;
      ta.closest('.textarea').classList.toggle('textarea--error', n > max);
    }
    ta.addEventListener('input', count);
    count();
  });

  /* ── Address choice: the selected card carries the highlight ─────────── */
  document.querySelectorAll('.wod-choices').forEach(function (group) {
    group.addEventListener('change', function () {
      group.querySelectorAll('.wod-choice').forEach(function (c) {
        c.classList.toggle('wod-choice--selected', c.querySelector('input').checked);
      });
    });
  });

  /* ── "Up to 2" on the area and event-type lists ─────────────────────────
     Select.js toggles the item on click; if that makes three, undo it. Runs
     in the capture phase's successor (bubble, after Select.js's handler). */
  document.addEventListener('click', function (e) {
    var item = e.target.closest('[data-multi]');
    if (!item) return;
    var list = item.closest('.sel__list');
    var chosen = list.querySelectorAll('.sel__list-item--selected');
    if (chosen.length > 2) {
      item.classList.remove('sel__list-item--selected');
      item.setAttribute('aria-selected', 'false');
    }
  });
})();
