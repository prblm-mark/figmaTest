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
