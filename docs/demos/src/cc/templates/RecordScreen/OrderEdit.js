/* Order Edit — the live order form's status-driven behaviour (code-first, 2026-10-09).
 *
 * From the live OrderProcessingDef.cfm / PaymentDetailsInclude.cfm:
 *   - Order Status Paid Partial / Paid Full shows the Payment Details grid; Partially Refunded /
 *     Refunded shows the Refund Details grid (the live form also requires refund rows there, and the
 *     refund total may not exceed the order total — the server's checks, not built here).
 *   - Paid Full fixes Payment Status at Paid. Live hides the select; here it is disabled at Paid, so
 *     the value stays readable.
 *   (Adding / deleting grid rows is the kit's, RecordScreen.js.)
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

  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync);
  else sync();
})();
