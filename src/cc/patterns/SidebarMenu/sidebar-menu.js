/* CC SidebarMenu interactivity
 * ---------------------------------------------------------------
 * Wires up every `.cc-sidebar-menu` composite on the page. Pure DOM,
 * no framework. Idempotent: a `data-cc-init` flag prevents double-binding
 * if the script is loaded twice.
 *
 * Behaviours:
 *   1. Rail button click  → swap visible Menu panel (data-cc-target → data-cc-panel)
 *   2. Rail keyboard nav  → arrow keys / Home / End across the toolbar
 *   3. Mobile Ellipsis    → toggle [data-cc-rail-extra] siblings (expanded rail)
 *   4. MainMenuItem click → toggle submenu (single-open within its <ul>)
 *   5. Search input       → live-filter rows inside the current panel
 *   6. CRM show-toggle    → reveal/hide [data-cc-recent-extra] items
 *   7. Items scroll       → toggle .cc-menu--scrolled on the parent panel
 */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    document.querySelectorAll('.cc-sidebar-menu').forEach(initComposite);
  });

  function initComposite(root) {
    if (root.dataset.ccInit === 'true') return;
    root.dataset.ccInit = 'true';

    initRailNav(root);
    initRailKeyboard(root);
    initMobileExpand(root);
    initMainMenuItems(root);
    initSearch(root);
    initShowToggle(root);
    initScrolled(root);
  }

  /* 1. Rail button click → swap panel ──────────────────────────── */
  function initRailNav(root) {
    const rail = root.querySelector('.cc-sidebar');
    if (!rail) return;
    const buttons = rail.querySelectorAll('.cc-sidebar__btn[data-cc-target]');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => activateTarget(root, btn));
    });
  }

  function activateTarget(root, btn) {
    const target = btn.dataset.ccTarget;
    if (!target) return;

    // Update rail active state.
    root.querySelectorAll('.cc-sidebar__btn[data-cc-target]').forEach((b) => {
      const isActive = b === btn;
      b.classList.toggle('cc-sidebar__btn--active', isActive);
      if (isActive) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
    });

    // Show matching panel, hide siblings.
    root.querySelectorAll('.cc-menu[data-cc-panel]').forEach((panel) => {
      const isMatch = panel.dataset.ccPanel === target;
      panel.hidden = !isMatch;
      panel.setAttribute('aria-hidden', String(!isMatch));
    });
  }

  /* 2. Rail keyboard nav ───────────────────────────────────────── */
  function initRailKeyboard(root) {
    const rail = root.querySelector('.cc-sidebar');
    if (!rail) return;

    rail.addEventListener('keydown', (e) => {
      const focusables = Array.from(
        rail.querySelectorAll('.cc-sidebar__btn:not([hidden])')
      );
      if (focusables.length === 0) return;
      const current = focusables.indexOf(document.activeElement);
      if (current === -1) return;

      let next = -1;
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          next = (current + 1) % focusables.length;
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          next = (current - 1 + focusables.length) % focusables.length;
          break;
        case 'Home':
          next = 0;
          break;
        case 'End':
          next = focusables.length - 1;
          break;
        default:
          return;
      }
      e.preventDefault();
      focusables[next].focus();
    });
  }

  /* 3. Mobile Ellipsis → expanded rail ─────────────────────────── */
  function initMobileExpand(root) {
    const toggle = root.querySelector('[data-cc-toggle-extras]');
    if (!toggle) return;
    const extras = root.querySelectorAll('[data-cc-rail-extra]');
    if (extras.length === 0) return;

    // Start collapsed.
    const setExpanded = (expanded) => {
      toggle.setAttribute('aria-expanded', String(expanded));
      toggle.classList.toggle('cc-sidebar__btn--active', expanded);
      extras.forEach((btn) => {
        btn.hidden = !expanded;
      });
    };
    setExpanded(false);

    toggle.addEventListener('click', () => {
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      setExpanded(!isExpanded);
    });
  }

  /* 4. MainMenuItem click → expand/collapse submenu ────────────── */
  function initMainMenuItems(root) {
    root.querySelectorAll('.cc-main-menu-item').forEach((btn) => {
      btn.addEventListener('click', () => toggleMainMenuItem(btn));
    });
  }

  function toggleMainMenuItem(btn) {
    const li = btn.parentElement;
    if (!li) return;
    const submenu = li.querySelector(':scope > .cc-menu__submenu');
    // No submenu → just toggle selected (visual highlight only).
    if (!submenu) {
      // Single-select among siblings inside the same ul.
      const list = li.parentElement;
      if (list) {
        list
          .querySelectorAll(':scope > li > .cc-main-menu-item')
          .forEach((sib) => sib.classList.remove('cc-main-menu-item--selected'));
      }
      btn.classList.add('cc-main-menu-item--selected');
      return;
    }
    const wasExpanded = btn.getAttribute('aria-expanded') === 'true';

    // Single-open accordion: collapse siblings in the same list.
    const list = li.parentElement;
    if (list) {
      list
        .querySelectorAll(':scope > li > .cc-main-menu-item[aria-expanded="true"]')
        .forEach((sib) => {
          if (sib !== btn) {
            sib.setAttribute('aria-expanded', 'false');
            sib.classList.remove('cc-main-menu-item--expanded');
            const sibSubmenu = sib.parentElement?.querySelector(
              ':scope > .cc-menu__submenu'
            );
            if (sibSubmenu) sibSubmenu.hidden = true;
          }
        });
    }

    btn.setAttribute('aria-expanded', String(!wasExpanded));
    btn.classList.toggle('cc-main-menu-item--expanded', !wasExpanded);
    submenu.hidden = wasExpanded;
  }

  /* 5. Search input → filter visible rows ──────────────────────── */
  function initSearch(root) {
    root.querySelectorAll('.cc-menu__search-input').forEach((input) => {
      const panel = input.closest('.cc-menu');
      if (!panel) return;
      input.addEventListener('input', () => filterPanel(panel, input.value));
    });
  }

  function filterPanel(panel, query) {
    const q = query.trim().toLowerCase();
    const matchers = panel.querySelectorAll(
      '.cc-menu__items > li,' +
        ' .cc-menu__submenu > li,' +
        ' .cc-menu__crm-btn,' +
        ' .cc-menu__recent-item'
    );

    matchers.forEach((row) => {
      if (!q) {
        row.hidden = false;
        return;
      }
      // Find the row's label text.
      const labelEl = row.querySelector(
        '.cc-main-menu-item__label,' +
          ' .cc-menu__submenu-item-label,' +
          ' .cc-menu__crm-btn__label,' +
          ' .cc-menu__recent-item__label'
      );
      const text = (labelEl ? labelEl.textContent : row.textContent) || '';
      row.hidden = !text.toLowerCase().includes(q);
    });
  }

  /* 6. CRM show more / show less toggle ────────────────────────── */
  function initShowToggle(root) {
    root.querySelectorAll('[data-cc-show-toggle]').forEach((btn) => {
      const group = btn.closest('.cc-menu__crm-group');
      if (!group) return;
      const extras = group.querySelectorAll('[data-cc-recent-extra]');
      const iconCollapsed = btn.querySelector('[data-cc-icon-collapsed]');
      const iconExpanded = btn.querySelector('[data-cc-icon-expanded]');
      const label = btn.querySelector('[data-cc-toggle-label]');

      const setExpanded = (expanded) => {
        btn.dataset.ccShowToggle = expanded ? 'expanded' : 'collapsed';
        extras.forEach((item) => {
          item.hidden = !expanded;
        });
        if (iconCollapsed) iconCollapsed.hidden = expanded;
        if (iconExpanded) iconExpanded.hidden = !expanded;
        if (label) label.textContent = expanded ? 'show less' : 'show more';
      };
      setExpanded(false);
      btn.addEventListener('click', () => {
        const expanded = btn.dataset.ccShowToggle === 'expanded';
        setExpanded(!expanded);
      });
    });
  }

  /* 7. Items scroll → toggle .cc-menu--scrolled ───────────────── */
  function initScrolled(root) {
    root.querySelectorAll('.cc-menu').forEach((panel) => {
      const list = panel.querySelector('.cc-menu__items');
      if (!list) return;
      const update = () => {
        panel.classList.toggle('cc-menu--scrolled', list.scrollTop > 4);
      };
      list.addEventListener('scroll', update, { passive: true });
      update();
    });
  }
})();
