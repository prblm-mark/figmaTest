/* OrderView — the Order record's processing actions, as working demo flows (code-first, 2026-10-07).
 *
 * RecordScreen.js opens and closes the modals ([data-record-modal-open], ×, Cancel, Escape). This file
 * runs what each modal's primary button does, in memory only, then confirms with a Toast:
 *   status     — repaint every [data-order-status] badge and add the change to the Status history
 *   receipt / receipt-invoice / message — "send" (the invoice ones count up Invoices sent)
 *   despatch   — record the courier + AWB, set the status to Shipped
 *   attendee   — assign the event place: a row in the attendee table, "1 of 1 assigned"
 * plus the kebab's Generate shipping label (a toast; the label itself is backend).
 *
 * TODO(backend:RecordScreen) order-status / order-send / order-despatch / order-items / order-shipping-label:
 * every action below is DOM-only → POST to the order-processing endpoint, then re-render from its response.
 */
(function () {
  'use strict';

  // Mirrors record_order.py STATUS_TONE: done = success, waiting = warning, moving = info, stopped = neutral.
  var STATUS_TONE = {
    'Paid Full': 'success', 'Shipped': 'success', 'Completed': 'success',
    'Incomplete': 'warning', 'Paid Partial': 'warning', 'Shipped Partial': 'warning', 'On Hold': 'warning',
    'Back Ordered': 'warning', 'Pending Return': 'warning',
    'New': 'info', 'Released for Delivery': 'info', 'Exported': 'info'
  };
  var TONES = ['success', 'warning', 'info', 'neutral'];
  var TOAST_MS = 4000;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function icons() { if (window.lucide) lucide.createIcons(); }

  function now() {
    var d = new Date();
    var mon = d.toLocaleString('en-GB', { month: 'short' });
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    return pad(d.getDate()) + ' ' + mon + ' ' + d.getFullYear() + ', ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  /* ── Toast (Toast component markup, into the shell's #cc-toasts stack) ── */
  function toast(variant, icon, message) {
    var stack = document.getElementById('cc-toasts');
    if (!stack) return;
    var t = document.createElement('div');
    t.className = 'toast toast--' + variant + ' toast--color';
    t.setAttribute('role', 'status');
    t.innerHTML = '<span class="toast__icon"><i data-lucide="' + icon + '" aria-hidden="true"></i></span>' +
      '<p class="toast__message"></p>' +
      '<button type="button" class="toast__close" aria-label="Dismiss"><i data-lucide="x" aria-hidden="true"></i></button>';
    t.querySelector('.toast__message').textContent = message;
    stack.appendChild(t);
    icons();
    // setTimeout, not rAF: the slide-in still plays, and a background tab does not strand the toast.
    setTimeout(function () { t.classList.add('toast--in'); }, 20);
    var gone = false;
    function dismiss() {
      if (gone) return; gone = true;
      t.classList.remove('toast--in'); t.classList.add('toast--leaving');
      setTimeout(function () { t.remove(); }, 400);
    }
    t.querySelector('.toast__close').addEventListener('click', dismiss);
    setTimeout(dismiss, TOAST_MS);
  }

  /* ── Field helpers ── */
  function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
  function checked(id) { var el = document.getElementById(id); return !!(el && el.checked); }
  function selected(id) { var el = document.getElementById(id); return el ? el.querySelector('.sel__value').textContent.trim() : ''; }
  function setError(id, msg) {
    var input = document.getElementById(id);
    if (!input) return;
    var wrap = input.closest('.input'), help = document.getElementById(id + '-help');
    wrap.classList.toggle('input--error', !!msg);
    if (msg) { input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', id + '-help'); }
    else { input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); }
    if (help) { help.textContent = msg || ''; help.hidden = !msg; }
  }
  // Required + email checks; returns the first failing field's id (focused by the caller).
  function validate(form) {
    var first = null;
    form.querySelectorAll('.input__control').forEach(function (input) {
      var v = input.value.trim(), msg = '';
      if (input.required && !v) msg = 'Enter the ' + lowerFirst(input.closest('.input').querySelector('.input__label').firstChild.textContent.trim()) + '.';
      else if (v && input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'Enter an email address like name@company.com.';
      setError(input.id, msg);
      if (msg && !first) first = input;
    });
    return first;
  }
  // "Tracking / AWB number" → "tracking / AWB number": only the first letter, so acronyms survive.
  function lowerFirst(s) { return s.charAt(0).toLowerCase() + s.slice(1); }
  function close(form) { var x = form.closest('.modal-overlay').querySelector('.modal__close'); if (x) x.click(); }

  /* ── Status ── */
  var orderCode = (document.querySelector('.cc-header__title') || {}).textContent || 'Order';

  function setStatus(status) {
    var tone = STATUS_TONE[status] || 'neutral';
    document.querySelectorAll('[data-order-status]').forEach(function (b) {
      TONES.forEach(function (t) { b.classList.remove('badge--' + t); });
      b.classList.add('badge--' + tone);
      b.textContent = status;
    });
    var sub = $('#modal-order-status .modal__subtitle');
    if (sub) sub.textContent = orderCode + ' is ' + status + '.';
  }

  function addHistory(title, glyph, note) {
    var host = $('[data-order-history]');
    if (!host) return;
    var list = host.querySelector('.record-list');
    if (!list) {   // first entry: replace the empty line with a timeline
      host.innerHTML = '<ol class="record-list record-list--timeline" data-ring-surface></ol>';
      list = host.querySelector('.record-list');
    }
    var li = document.createElement('li');
    li.className = 'record-list__item order-history__new';
    li.innerHTML = '<span class="avatar avatar--size-2 avatar--placeholder record-list__icon signal-icon signal-icon--lagoon" aria-hidden="true">' +
      '<i data-lucide="' + glyph + '" aria-hidden="true"></i></span>' +
      '<div class="record-list__main"><p class="record-list__meta"></p><p class="record-list__title"></p></div>';
    li.querySelector('.record-list__meta').textContent = now() + ' · You';
    li.querySelector('.record-list__title').textContent = title + (note ? ' — ' + note : '');
    list.insertBefore(li, list.firstChild);
    icons();
  }

  /* ── Actions ── */
  var ACTIONS = {
    status: function () {
      var next = selected('order-status-new');
      var current = ($('[data-order-status]') || {}).textContent;
      if (next === current) { toast('info', 'info', 'The order is already ' + next + '.'); return true; }
      setStatus(next);
      addHistory(next, 'refresh-cw', val('order-status-note'));
      document.getElementById('order-status-note').value = '';
      toast('success', 'check', orderCode + ' is now ' + next + (checked('order-status-notify') ? '. The customer has been emailed.' : '.'));
      return true;
    },
    receipt: function (form) { return send(form, 'modal-order-receipt-to', 'Receipt sent to ', false); },
    'receipt-invoice': function (form) { return send(form, 'modal-order-receipt-invoice-to', 'Receipt with invoice sent to ', true); },
    message: function (form) { return send(form, 'modal-order-message-to', 'Message with invoice sent to ', true); },
    despatch: function (form) {
      if (focusFirst(validate(form))) return false;
      var courier = selected('order-courier'), awb = val('order-awb');
      var awbEl = $('[data-order-awb]');
      if (awbEl) awbEl.textContent = courier + ' · ' + awb;
      setStatus('Shipped');
      addHistory('Shipped', 'truck', courier + ' ' + awb);
      document.getElementById('order-awb').value = '';
      toast('success', 'truck', orderCode + ' marked as shipped' + (checked('order-despatch-notify') ? ' and the customer notified.' : '.'));
      return true;
    },
    attendee: function (form) {
      if (focusFirst(validate(form))) return false;
      addAttendee([val('order-att-name'), val('order-att-email'), val('order-att-job'), val('order-att-company'), val('order-att-phone')]);
      form.reset();
      return true;
    }
  };

  function focusFirst(el) { if (el) { el.focus(); return true; } return false; }

  function send(form, toId, said, invoice) {
    if (focusFirst(validate(form))) return false;
    if (invoice) {
      var n = $('[data-order-invoices]');
      if (n) n.textContent = String(parseInt(n.textContent, 10) + 1);
    }
    addHistory(said.replace(/ to $/, ''), 'send', val(toId));
    toast('success', 'send', said + val(toId) + '.');
    return true;
  }

  function addAttendee(cells) {
    var box = $('[data-order-attendees]');
    var seats = parseInt(box.getAttribute('data-seats'), 10);
    var tbody = box.querySelector('tbody');
    var tr = document.createElement('tr');
    cells.forEach(function (c) { var td = document.createElement('td'); td.textContent = c || '-'; tr.appendChild(td); });
    tbody.appendChild(tr);
    var n = tbody.rows.length;
    box.querySelector('[data-order-attendees-empty]').hidden = true;
    box.querySelector('[data-order-attendees-table]').hidden = false;
    var chip = box.querySelector('[data-order-assigned]');
    chip.textContent = n + ' of ' + seats + ' assigned';
    chip.classList.toggle('badge--warning', n < seats);
    chip.classList.toggle('badge--success', n >= seats);
    // Every place is filled: the Add button goes (the live screen hides it too).
    if (n >= seats) box.querySelector('[data-order-add-attendee]').hidden = true;
    if (window.DatatablesFit) DatatablesFit.fit(tbody.closest('table'));
    toast('success', 'user-check', cells[0] + ' added as an attendee.');
  }

  document.addEventListener('submit', function (e) {
    var form = e.target.closest('[data-order-form]');
    if (!form) return;
    e.preventDefault();
    var run = ACTIONS[form.getAttribute('data-order-form')];
    if (run && run(form)) close(form);
  });

  // Kebab items that open a modal are links (DropdownItem markup): keep the page where it is.
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-record-modal-open], a[data-order-label]');
    if (!a) return;
    e.preventDefault();
    if (a.hasAttribute('data-order-label')) toast('success', 'printer', 'Shipping label generated for ' + orderCode + '.');
  }, true);

  // "Use the customer's details" fills the attendee form from the order's customer.
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-order-prefill]');
    if (!b) return;
    [['order-att-name', 'name'], ['order-att-email', 'email'], ['order-att-job', 'job'], ['order-att-company', 'company'],
     ['order-att-phone', 'phone']].forEach(function (p) {
      var input = document.getElementById(p[0]);
      input.value = b.getAttribute('data-' + p[1]);
      setError(p[0], '');
    });
  });

  // A modal that opens fresh: clear the last attempt's errors.
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-record-modal-open]');
    if (!t) return;
    var ov = document.getElementById(t.getAttribute('data-record-modal-open'));
    if (ov) ov.querySelectorAll('.input__control').forEach(function (i) { setError(i.id, ''); });
  });
})();
