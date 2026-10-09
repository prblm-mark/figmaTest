/* Order Edit — the live order form's status-driven behaviour (code-first, 2026-10-09).
 *
 * From the live OrderProcessingDef.cfm / PaymentDetailsInclude.cfm:
 *   - Order Status Paid Partial / Paid Full shows the Payment Details grid; Partially Refunded /
 *     Refunded shows the Refund Details grid (the live form also requires refund rows there, and the
 *     refund total may not exceed the order total — the server's checks, not built here).
 *   - Paid Full fixes Payment Status at Paid. Live hides the select; here it is disabled at Paid, so
 *     the value stays readable.
 *   - Each grid adds a blank row, or deletes the ticked rows.
 * Select.js has no change event, so this listens for the option click after Select.js has set it.
 * TODO(backend:RecordScreen) order-edit: in memory only → Save posts the form */
(function () {
  var PAYMENT = ['Paid Partial', 'Paid Full'];
  var REFUND = ['Partially Refunded', 'Refunded'];

  function statusValue() {
    var v = document.querySelector('[data-order-status] .sel__value');
    return v ? v.textContent.trim() : '';
  }

  function sync() {
    var s = statusValue();
    document.querySelectorAll('[data-order-grid]').forEach(function (g) {
      var kind = g.getAttribute('data-order-grid');
      g.hidden = (kind === 'payment' ? PAYMENT : REFUND).indexOf(s) === -1;
    });
    var ps = document.querySelector('[data-payment-status]');
    if (ps) {
      var fixed = s === 'Paid Full';
      ps.toggleAttribute('data-fixed', fixed);
      var ctl = ps.querySelector('.sel__control');
      if (ctl) ctl.disabled = fixed;   /* locked, not hidden: the value stays readable */
      if (fixed) {
        var v = ps.querySelector('.sel__value');
        if (v) { v.textContent = 'Paid'; v.classList.remove('sel__value--placeholder'); }
      }
    }
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-order-status] .sel__menu-item')) { sync(); return; }

    var add = e.target.closest('[data-order-grid-add]');
    if (add) {
      var body = add.closest('[data-order-grid]').querySelector('tbody');
      var last = body.lastElementChild;
      if (!last) return;
      var row = last.cloneNode(true);
      row.querySelectorAll('input').forEach(function (i) { if (i.type === 'checkbox') i.checked = false; else i.value = ''; });
      body.appendChild(row);
      var first = row.querySelector('.input__control');
      if (first) first.focus();
      return;
    }

    var del = e.target.closest('[data-order-grid-delete]');
    if (del) {
      var tbody = del.closest('[data-order-grid]').querySelector('tbody');
      tbody.querySelectorAll('tr').forEach(function (tr) {
        var cb = tr.querySelector('.checkbox__input');
        /* Keep one row, so Add row always has something to copy. */
        if (cb && cb.checked && tbody.children.length > 1) tr.remove();
      });
      return;
    }

  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync);
  else sync();
})();
