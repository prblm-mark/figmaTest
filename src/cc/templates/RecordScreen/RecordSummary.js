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

/* Status strip tooltips (code-first, 2026-10-15; Mark): the DS Tooltip on the customer signals and the
 * active subscription badges, in place of the browser's title box. One shared tooltip, placed under
 * whichever item is hovered or focused (the signal circles overlap, so a tooltip per item would sit
 * under its neighbours). Each item keeps its aria-label; the tooltip is aria-hidden, so it isn't read twice. */
document.addEventListener('DOMContentLoaded', function () {
  var ITEMS = '.record-summary__status .avatar, .record-summary__status .avatar-group__more';
  if (!document.querySelector(ITEMS)) return;

  var tip = document.createElement('span');
  tip.className = 'tooltip tooltip--arrow-top record-summary__float-tip';
  tip.setAttribute('aria-hidden', 'true');
  tip.hidden = true;
  tip.innerHTML = '<span class="tooltip__text"></span>';
  document.body.appendChild(tip);
  var current = null;

  function text(el) {
    // Lift the native title into data-tip so the browser box never doubles up (AvatarGroup.js may set it again).
    if (el.title) { el.setAttribute('data-tip', el.title); el.removeAttribute('title'); }
    return el.getAttribute('data-tip') || el.getAttribute('aria-label') || '';
  }

  function show(el) {
    var t = text(el);
    if (!t) return;
    current = el;
    tip.firstChild.textContent = t;
    tip.hidden = false;
    var r = el.getBoundingClientRect();
    var w = tip.offsetWidth;
    var left = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), window.innerWidth - w - 8);
    tip.style.left = left + 'px';
    tip.style.top = (r.bottom + 10) + 'px';   // clears the Top arrow (6px) with a small gap
  }

  function hide() { current = null; tip.hidden = true; }

  // Lift every title up front, so no item can show the browser's own box alongside ours.
  document.querySelectorAll(ITEMS).forEach(text);

  document.addEventListener('mouseover', function (e) {
    var el = e.target.closest(ITEMS);
    if (el && el !== current) show(el);
    else if (!el && current) hide();
  });
  document.addEventListener('focusin', function (e) {
    var el = e.target.closest(ITEMS);
    if (el) show(el); else hide();
  });
  document.addEventListener('focusout', hide);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
  window.addEventListener('scroll', hide, true);
});
