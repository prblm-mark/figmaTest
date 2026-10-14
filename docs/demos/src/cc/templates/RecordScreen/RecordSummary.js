/* RecordSummary — variant C's Collapse / Expand (code-first, 2026-10-14).
 * Folds the panel to one line (logo, name, quick actions) and remembers it per record type, like
 * the sidebar switch. Page modals are inserted after the scripts, so this waits for the DOM. */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-record-summary]').forEach(function (panel) {
    var btn = panel.querySelector('[data-record-summary-toggle]');
    var body = document.getElementById(btn.getAttribute('aria-controls'));
    var type = (panel.closest('[data-record-type]') || document.body).getAttribute('data-record-type') || 'record';
    var key = 'cc-record-summary-collapsed:' + type;

    function set(collapsed, save) {
      panel.toggleAttribute('data-collapsed', collapsed);
      body.hidden = collapsed;
      btn.setAttribute('aria-expanded', String(!collapsed));
      btn.querySelector('span').textContent = collapsed ? 'Expand' : 'Collapse';
      var icon = btn.querySelector('svg, i');
      if (icon && window.lucide) {
        var i = document.createElement('i');
        i.setAttribute('data-lucide', collapsed ? 'chevron-down' : 'chevron-up');
        i.setAttribute('aria-hidden', 'true');
        icon.replaceWith(i);
        lucide.createIcons();
      }
      if (save) { try { localStorage.setItem(key, collapsed ? '1' : '0'); } catch (e) {} }
    }

    var saved = null;
    try { saved = localStorage.getItem(key); } catch (e) {}
    if (saved === '1') set(true, false);
    btn.addEventListener('click', function () { set(!panel.hasAttribute('data-collapsed'), true); });
  });
});
