/* FieldRow — collapsible long values (code-first, 2026-10-09; not in Figma yet).
 *
 * A long view value folds after a set number of lines, with a fade over the last visible line and a
 * "Show more" / "Show less" button under it (Mark, 2026-10-09, from Luismi's article 245 Summary,
 * which filled a screen and a half):
 *   Type=Paragraph (Summary, Teaser, Page Description, custom text)  → 6 lines
 *   Type=Rich      (Main Body, Introduction…)                         → 12 lines
 * Main-column rows only; Compact (sidebar) rows and Edit rows are left alone.
 *
 * PROGRESSIVE: the server renders the value exactly as before. This file wraps the value's content in
 * `.field-row__clamp-body` and adds the toggle, and only marks the row `data-clamped` when the text
 * really runs past the limit — a short value gets no button and looks as it always did. A
 * ResizeObserver re-measures when the column changes width (a docked menu, the sidebar toggle, full
 * width), which no window resize would report. Every value starts collapsed; nothing is remembered.
 *
 *   window.fieldRowClamp.init(root?)  → enhance every eligible row under root (default: document)
 */
(function () {
  var SELECTOR = '.field-row--paragraph:not(.field-row--compact):not(.field-row--edit):not(.field-row--media) > .field-row__value';

  function linesFor(value) {
    return value.querySelector(':scope > .field-row__rich') ? 12 : 6;
  }

  function enhance(value) {
    if (value.hasAttribute('data-field-clamp')) return;
    if (!value.textContent.trim()) return;
    value.setAttribute('data-field-clamp', '');
    value.style.setProperty('--field-row-clamp-lines', String(linesFor(value)));

    var body = document.createElement('div');
    body.className = 'field-row__clamp-body';
    while (value.firstChild) body.appendChild(value.firstChild);
    value.appendChild(body);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn--secondary btn--xs field-row__clamp-toggle';
    btn.setAttribute('aria-expanded', 'false');
    btn.hidden = true;
    btn.innerHTML = '<i data-lucide="chevron-down" aria-hidden="true"></i><span>Show more</span>';
    value.appendChild(btn);

    btn.addEventListener('click', function () {
      var open = value.hasAttribute('data-expanded');
      value.toggleAttribute('data-expanded', !open);
      btn.setAttribute('aria-expanded', String(!open));
      btn.querySelector('span').textContent = open ? 'Show more' : 'Show less';
      /* Collapsing from far down the page would leave the reader below the row: bring it back. */
      if (open && value.getBoundingClientRect().top < 0) value.scrollIntoView({ block: 'nearest' });
    });

    function measure() {
      /* Measure against the collapsed cap even while expanded, so the button stays for as long as
         the value is long enough to need it. */
      var cap = parseFloat(getComputedStyle(body).lineHeight) * linesFor(value);
      var long = body.scrollHeight > cap + 1;
      value.toggleAttribute('data-clamped', long);
      btn.hidden = !long;
    }

    measure();
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(value);
  }

  function init(root) {
    (root || document).querySelectorAll(SELECTOR).forEach(enhance);
    if (window.lucide) window.lucide.createIcons();   /* the toggles' chevrons */
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); });
  else init();

  window.fieldRowClamp = { init: init };
})();

/* FieldRow — the "Show help" switch (code-first, 2026-10-09; not in Figma yet).
 *
 * Every edit row with help carries a help line (`.field-row__help`). On a record screen with
 * `data-help-mode="switch"` the lines are hidden until the tabs bar's Show help switch
 * (`[data-record-help]`, DS Toggle) is on; this file keeps `data-help-visible` in step and saves the
 * choice per viewer. Off by default, as the legacy edit form's hidden help. Mark chose the switch
 * from four options compared on Contact Edit (2026-10-09).
 * TODO(backend:RecordScreen) record-help-preference: localStorage stands in for the per-user preference */
(function () {
  var KEY = 'cc-help-text';

  function init() {
    var screen = document.querySelector('[data-help-mode="switch"]');
    if (!screen) return;
    var sw = screen.querySelector('[data-record-help]');
    var on = false;
    try { on = localStorage.getItem(KEY) === 'on'; } catch (e) { /* storage blocked */ }
    screen.toggleAttribute('data-help-visible', on);
    if (sw) { sw.classList.toggle('toggle--active', on); sw.setAttribute('aria-checked', String(on)); }
    document.addEventListener('toggle:change', function (e) {
      if (!e.target.closest('[data-record-help]')) return;
      var v = !!(e.detail && e.detail.active);
      screen.toggleAttribute('data-help-visible', v);
      try { localStorage.setItem(KEY, v ? 'on' : 'off'); } catch (err) { /* session only */ }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
