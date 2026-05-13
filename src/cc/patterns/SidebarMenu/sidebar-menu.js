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
 *   7. Desktop hover-flyout → hover a rail target on Desktop shows the
 *      matching menu as a floating overlay; suppressed when the target
 *      panel is already docked-active. 150ms grace on mouse-leave so the
 *      mouse can travel from the rail button into the flyout.
 *
 * Scrolled state is handled purely in CSS — brand + search sit above the
 * scrolling items list and the expanded MainMenuItem is `position: sticky`
 * so it pins to the top of the scroll area while submenu rows scroll under.
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
    initHoverFlyout(root);
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

    // Toggle off if the clicked button is already active → close the panel.
    const isAlreadyActive = btn.classList.contains('cc-sidebar__btn--active');

    // Update rail active state.
    root.querySelectorAll('.cc-sidebar__btn[data-cc-target]').forEach((b) => {
      const isActive = !isAlreadyActive && b === btn;
      b.classList.toggle('cc-sidebar__btn--active', isActive);
      if (isActive) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
    });

    // Show matching panel (or hide all when toggling off). Clicking always
    // transitions to docked mode — clear any floating-flyout class.
    root.querySelectorAll('.cc-menu[data-cc-panel]').forEach((panel) => {
      const isMatch = !isAlreadyActive && panel.dataset.ccPanel === target;
      panel.hidden = !isMatch;
      panel.setAttribute('aria-hidden', String(!isMatch));
      panel.classList.remove('cc-menu--floating');
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
    // No submenu → toggle selected state. Clicking another item deselects
    // the previous; clicking the same item again deselects it (nothing selected).
    if (!submenu) {
      const wasSelected = btn.classList.contains('cc-main-menu-item--selected');
      const list = li.parentElement;
      if (list) {
        list
          .querySelectorAll(':scope > li > .cc-main-menu-item')
          .forEach((sib) => sib.classList.remove('cc-main-menu-item--selected'));
      }
      if (!wasSelected) btn.classList.add('cc-main-menu-item--selected');
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

    // When opening, smooth-scroll the new parent to the top of the items
    // list so it becomes the sticky header (rather than snapping into place
    // when sticky kicks in).
    if (!wasExpanded) {
      const itemsList = li.closest('.cc-menu__items');
      if (itemsList) {
        const liRect = li.getBoundingClientRect();
        const listRect = itemsList.getBoundingClientRect();
        const target = itemsList.scrollTop + (liRect.top - listRect.top);
        itemsList.scrollTo({ top: target, behavior: 'smooth' });
      }
    }
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

  /* 7. Desktop hover-flyout ─────────────────────────────────────
   * Hovering a rail button on Desktop shows the matching menu as a
   * floating overlay (`.cc-menu--floating`). The flyout is suppressed
   * when the hovered target is already docked-active. A 150ms grace
   * timer on mouse-leave lets the mouse travel from the rail button
   * into the flyout without dismissing.
   *
   * Same DOM nodes are used for both docked and floating modes — the
   * `.cc-menu--floating` class toggles the visual treatment. Clicking
   * a rail button strips the class (see activateTarget) so a hover
   * preview cleanly transitions into a docked panel. */
  function initHoverFlyout(root) {
    // Desktop only — mobile rails ignore hover.
    const rail = root.querySelector('.cc-sidebar:not(.cc-sidebar--mobile)');
    if (!rail) return;

    const buttons = rail.querySelectorAll('.cc-sidebar__btn[data-cc-target]');
    const panels = root.querySelectorAll('.cc-menu[data-cc-panel]');
    if (buttons.length === 0 || panels.length === 0) return;

    let hideTimer = null;
    let floatingPanel = null;

    const cancelHide = () => {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
    };

    const dismissFlyout = () => {
      if (floatingPanel && floatingPanel.classList.contains('cc-menu--floating')) {
        floatingPanel.classList.remove('cc-menu--floating');
        floatingPanel.hidden = true;
        floatingPanel.setAttribute('aria-hidden', 'true');
      }
      floatingPanel = null;
    };

    const scheduleHide = () => {
      cancelHide();
      hideTimer = setTimeout(dismissFlyout, 150);
    };

    const showFlyout = (target) => {
      cancelHide();
      // Suppress when this target is already docked-active.
      const activeBtn = root.querySelector('.cc-sidebar__btn--active[data-cc-target]');
      if (activeBtn && activeBtn.dataset.ccTarget === target) {
        dismissFlyout();
        return;
      }
      const panel = root.querySelector(`.cc-menu[data-cc-panel="${target}"]`);
      if (!panel) return;
      // If this panel is the current floating one, keep as-is.
      if (panel === floatingPanel) return;
      // Hide any previous floating panel before showing the new one.
      dismissFlyout();
      panel.classList.add('cc-menu--floating');
      panel.hidden = false;
      panel.setAttribute('aria-hidden', 'false');
      floatingPanel = panel;
    };

    buttons.forEach((btn) => {
      btn.addEventListener('mouseenter', () => showFlyout(btn.dataset.ccTarget));
      btn.addEventListener('mouseleave', scheduleHide);
    });

    // Keep the flyout open while the cursor is over it; dismiss on leave.
    panels.forEach((panel) => {
      panel.addEventListener('mouseenter', () => {
        if (panel.classList.contains('cc-menu--floating')) cancelHide();
      });
      panel.addEventListener('mouseleave', () => {
        if (panel.classList.contains('cc-menu--floating')) scheduleHide();
      });
    });
  }
})();
