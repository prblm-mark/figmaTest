/* Select — interactive behaviour (shared module)
 *
 * Auto-binding: drop this script onto any page that uses the Select markup
 * (`.sel` / `.sel-category`) and the dropdowns become interactive. No init
 * call required. Uses event delegation at the document level so it also works
 * for Select markup injected after load.
 *
 * Covers three behaviours, matching the Select demo:
 *   • Single-select (Default / Underline / Label Left) — `[data-sel]` wrapper,
 *     `[data-sel-trigger]` button, `.sel__menu-item` options.
 *   • Multi-select list — `[data-multi]` items (toggle, no auto-close).
 *   • Category Dropdown — `[data-cat-group]` groups, `[data-cat-trigger]`
 *     buttons, `.sel-category__menu-item` options.
 *
 * Close behaviour: click-outside and Esc close any open single-select and
 * category group. Lucide icons are refreshed (guarded) after a check is added.
 */
(function () {
  'use strict';

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function closeAllSingle(except) {
    document.querySelectorAll('[data-sel].sel--open').forEach(function (s) {
      if (s !== except) s.classList.remove('sel--open');
    });
  }

  function closeAllCategory(except) {
    document.querySelectorAll('[data-cat-group].sel-category__group--open').forEach(function (g) {
      if (g !== except) g.classList.remove('sel-category__group--open');
    });
  }

  document.addEventListener('click', function (e) {
    // ── Single-select trigger — toggle open (closes other single-selects) ──
    var trigger = e.target.closest('[data-sel-trigger]');
    if (trigger) {
      e.stopPropagation();
      var sel = trigger.closest('[data-sel]');
      closeAllSingle(sel);
      if (sel) sel.classList.toggle('sel--open');
      return;
    }

    // ── Single-select option — choose value, move the check, close ──
    var item = e.target.closest('.sel__menu-item');
    if (item) {
      var selWrap = item.closest('[data-sel]');
      var menu = item.closest('.sel__menu');
      var valueEl = selWrap && selWrap.querySelector('.sel__value');
      var label = item.firstChild ? item.firstChild.textContent.trim() : item.textContent.trim();
      if (valueEl) valueEl.textContent = label;
      menu.querySelectorAll('.sel__menu-item').forEach(function (i) {
        i.classList.remove('sel__menu-item--selected');
        i.removeAttribute('aria-selected');
        var check = i.querySelector('[data-lucide], svg');
        if (check) check.remove();
      });
      item.classList.add('sel__menu-item--selected');
      item.setAttribute('aria-selected', 'true');
      var checkEl = document.createElement('i');
      checkEl.setAttribute('data-lucide', 'check');
      item.appendChild(checkEl);
      refreshIcons();
      if (selWrap) selWrap.classList.remove('sel--open');
      return;
    }

    // ── Category trigger — toggle group (closes other groups + all single) ──
    var catTrigger = e.target.closest('[data-cat-trigger]');
    if (catTrigger) {
      e.stopPropagation();
      var group = catTrigger.closest('[data-cat-group]');
      closeAllCategory(group);
      closeAllSingle(null);
      if (group) group.classList.toggle('sel-category__group--open');
      return;
    }

    // ── Category option — choose value (+ flag), move the check, close ──
    var catItem = e.target.closest('.sel-category__menu-item');
    if (catItem) {
      var catGroup = catItem.closest('[data-cat-group]');
      var catMenu = catItem.closest('.sel-category__menu');
      var catBtn = catGroup.querySelector('[data-cat-trigger]');
      var labelEl = catBtn.querySelector('.sel-category__label');
      var flagEl = catBtn.querySelector('.sel-category__flag');
      var itemFirstSpan = catItem.querySelector('span');
      var itemFlag = catItem.dataset.flag;
      var labelText = itemFirstSpan
        ? Array.from(itemFirstSpan.childNodes)
            .filter(function (n) {
              return n.nodeType === Node.TEXT_NODE ||
                (n.nodeType === Node.ELEMENT_NODE && !n.classList.contains('sel-category__menu-flag'));
            })
            .map(function (n) { return n.textContent; }).join('').trim()
        : catItem.firstChild.textContent.trim();
      if (labelEl) labelEl.textContent = labelText;
      if (flagEl && itemFlag) flagEl.textContent = itemFlag;
      catMenu.querySelectorAll('.sel-category__menu-item').forEach(function (i) {
        i.classList.remove('sel-category__menu-item--selected');
        i.removeAttribute('aria-selected');
        var check = i.querySelector('[data-lucide="check"], svg.lucide-check');
        if (check) check.remove();
      });
      catItem.classList.add('sel-category__menu-item--selected');
      catItem.setAttribute('aria-selected', 'true');
      var catCheck = document.createElement('i');
      catCheck.setAttribute('data-lucide', 'check');
      catItem.appendChild(catCheck);
      refreshIcons();
      catGroup.classList.remove('sel-category__group--open');
      return;
    }

    // ── Multi-select — toggle selected, no auto-close ──
    var multi = e.target.closest('[data-multi]');
    if (multi) {
      var selected = multi.classList.toggle('sel__list-item--selected');
      if (selected) multi.setAttribute('aria-selected', 'true');
      else multi.removeAttribute('aria-selected');
      return;
    }

    // ── Click outside — close any open single-select / category group ──
    document.querySelectorAll('[data-sel].sel--open').forEach(function (s) {
      if (!s.contains(e.target)) s.classList.remove('sel--open');
    });
    document.querySelectorAll('[data-cat-group].sel-category__group--open').forEach(function (g) {
      if (!g.contains(e.target)) g.classList.remove('sel-category__group--open');
    });
  });

  // Esc closes any open single-select / category group
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeAllSingle(null);
      closeAllCategory(null);
    }
  });
})();
