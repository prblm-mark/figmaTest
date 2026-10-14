/* RecordSummary — variant C's Collapse / Expand (code-first, 2026-10-14).
 * Expanded shows the full view (facts + dates grid); collapsed shows B's compact view (logo, pinned icons,
 * stat cards, next task) — Mark, 2026-10-14, replacing the earlier one-line strip. Remembered per record
 * type, like the sidebar switch. Page modals are inserted after the scripts, so this waits for the DOM. */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-record-summary]').forEach(function (panel) {
    var btn = panel.querySelector('[data-record-summary-toggle]');
    var full = panel.querySelector('[data-summary-view="full"]');
    var compact = panel.querySelector('[data-summary-view="compact"]');
    var type = (panel.closest('[data-record-type]') || document.body).getAttribute('data-record-type') || 'record';
    var key = 'cc-record-summary-collapsed:' + type;
    // Both chevrons drawn once up front; the toggle shows one (no createIcons() on click — it would redraw
    // icons page-wide, see RecordPins.js).
    var tmp = document.createElement('i');
    tmp.setAttribute('data-lucide', 'chevron-down');
    tmp.setAttribute('aria-hidden', 'true');
    btn.insertBefore(tmp, btn.firstChild);
    if (window.lucide) lucide.createIcons();
    // Never hold the icons: createIcons() redraws existing svgs too (and RecordPins.js runs it again after
    // this), so a stored reference goes stale. Find them on every switch.
    function chevron(dir) { return btn.querySelector('.lucide-chevron-' + dir + ', [data-lucide="chevron-' + dir + '"]'); }

    function set(collapsed, save) {
      panel.toggleAttribute('data-collapsed', collapsed);
      full.hidden = collapsed;
      compact.hidden = !collapsed;
      btn.setAttribute('aria-controls', collapsed ? compact.id : full.id);
      btn.setAttribute('aria-expanded', String(!collapsed));
      btn.querySelector('span').textContent = collapsed ? 'Expand' : 'Collapse';
      var up = chevron('up'), down = chevron('down');
      if (up) up.style.display = collapsed ? 'none' : '';
      if (down) down.style.display = collapsed ? '' : 'none';
      if (save) { try { localStorage.setItem(key, collapsed ? '1' : '0'); } catch (e) {} }
    }

    var saved = null;
    try { saved = localStorage.getItem(key); } catch (e) {}
    set(saved === '1', false);
    btn.addEventListener('click', function () { set(!panel.hasAttribute('data-collapsed'), true); });
  });
});
