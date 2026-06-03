/**
 * AiAssistant shell behaviours — the static (non-chat) interactions of the
 * floating AiAssistant panel: sidebar toggle + kebab menus, message-input
 * active state + duration-filter popover, drag-to-move, 4-edge resize, and
 * the close button.
 *
 * Deliberately contains NO chat/view-state logic. The processing/response
 * states (ChatMain.js + GSAP timelines) stay inline in AiAssistant.html and
 * are demo-only — when the panel is mounted in ControlScreen we want just the
 * initial-state view, so only this shell is reused there.
 *
 * All queries are scoped to `root`, so multiple panels (or a panel sitting
 * inside a larger template) never clash on the global `id` attributes.
 */

import { initSidebarTheme } from '../../../utils/sidebar-colors.js';
import { initBrandTheme } from '../../../utils/brand-colors.js';

/**
 * @param {HTMLElement} root  the `.ai-assistant` panel element
 * @param {Object}   [opts]
 * @param {HTMLElement} [opts.brandThemeTarget=document.documentElement]
 *        element that receives `data-brand-theme` (pass the panel root to keep
 *        the chat brand-theme scoped to the panel — e.g. inside ControlScreen)
 * @param {() => void}  [opts.onClose]  invoked after the close button hides the panel
 */
export function initAiAssistantShell(root, opts = {}) {
  if (!root) return;

  const brandTarget = opts.brandThemeTarget || document.documentElement;
  const sidebarEl = root.querySelector('#sidebar');

  // ── Sidebar + brand theme ─────────────────────────
  if (sidebarEl) initSidebarTheme(sidebarEl);
  initBrandTheme(brandTarget);

  // Re-init on theme change
  new MutationObserver(() => {
    if (sidebarEl) initSidebarTheme(sidebarEl);
    initBrandTheme(brandTarget);
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  // ── Sidebar toggle ────────────────────────────────
  {
    const sidebarToggle = root.querySelector('#sidebar-toggle');
    const sidebarOverlay = root.querySelector('#sidebar-overlay');

    const toggleSidebar = () => root.classList.toggle('ai-assistant--sidebar-open');
    const closeSidebar = () => root.classList.remove('ai-assistant--sidebar-open');

    if (sidebarToggle) sidebarToggle.addEventListener('click', toggleSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSidebar();
    });
  }

  // ── ChatSidebar interactions ──────────────────────
  if (sidebarEl) {
    const closeMenus = (focusBtn) => {
      sidebarEl.querySelectorAll('.chat-sidebar-item--menu-open').forEach((item) => {
        item.classList.remove('chat-sidebar-item--menu-open');
        item.querySelector('.chat-sidebar-menu').classList.remove('chat-sidebar-menu--open');
        const btn = item.querySelector('.chat-sidebar-item__menu-btn');
        btn.setAttribute('aria-expanded', 'false');
        if (focusBtn) btn.focus();
      });
    };

    sidebarEl.addEventListener('click', (e) => {
      // Ellipsis button — toggle menu
      const menuBtn = e.target.closest('.chat-sidebar-item__menu-btn');
      if (menuBtn) {
        e.stopPropagation();
        const item = menuBtn.closest('.chat-sidebar-item');
        const menu = item.querySelector('.chat-sidebar-menu');
        const isOpen = item.classList.toggle('chat-sidebar-item--menu-open');
        menu.classList.toggle('chat-sidebar-menu--open', isOpen);
        menuBtn.setAttribute('aria-expanded', isOpen);
        if (isOpen) {
          const rect = menuBtn.getBoundingClientRect();
          menu.style.top = rect.bottom + 'px';
          menu.style.left = (rect.left - 8) + 'px';
        }
        return;
      }

      // Menu item — close menu
      const menuItem = e.target.closest('.chat-sidebar-menu__item');
      if (menuItem) {
        const item = menuItem.closest('.chat-sidebar-item');
        item.classList.remove('chat-sidebar-item--menu-open');
        item.querySelector('.chat-sidebar-menu').classList.remove('chat-sidebar-menu--open');
        item.querySelector('.chat-sidebar-item__menu-btn').setAttribute('aria-expanded', 'false');
        return;
      }

      // Item click — select
      const item = e.target.closest('.chat-sidebar-item');
      if (!item) return;
      sidebarEl.querySelectorAll('.chat-sidebar-item--selected')
        .forEach((el) => el.classList.remove('chat-sidebar-item--selected'));
      item.classList.add('chat-sidebar-item--selected');
    });

    // Close sidebar menus on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.chat-sidebar-item')) closeMenus(false);
    });

    // Close sidebar menus on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenus(true);
    });
  }

  // ── Active state: detect input changes on all textareas ──
  root.querySelectorAll('.msg-input__textarea').forEach((textarea) => {
    const wrapper = textarea.closest('.msg-input');
    textarea.addEventListener('input', () => {
      const active = textarea.value.trim().length > 0;
      wrapper.classList.toggle('msg-input--active', active);
      const sendBtn = wrapper.querySelector('.msg-input__send-btn');
      if (sendBtn) sendBtn.disabled = !active;
    });
  });

  // ── Duration filter: toggle popover on click ──────
  root.querySelectorAll('.msg-input__filter-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const wrapper = btn.closest('.msg-input');
      const popover = wrapper.querySelector('.msg-input__filter-popover');
      if (popover) popover.classList.toggle('msg-input__filter-popover--open');
    });
  });

  // ── Duration filter: select item ──────────────────
  root.querySelectorAll('.msg-input__filter-item').forEach((item) => {
    item.addEventListener('click', () => {
      const popover = item.closest('.msg-input__filter-popover');
      popover.querySelectorAll('.msg-input__filter-item').forEach((i) => {
        i.classList.remove('msg-input__filter-item--selected');
        i.removeAttribute('aria-selected');
        const svg = i.querySelector('svg');
        if (svg) svg.remove();
      });
      item.classList.add('msg-input__filter-item--selected');
      item.setAttribute('aria-selected', 'true');
      const checkEl = document.createElement('i');
      checkEl.setAttribute('data-lucide', 'check');
      checkEl.setAttribute('aria-hidden', 'true');
      item.appendChild(checkEl);
      if (window.lucide) lucide.createIcons();
      popover.classList.remove('msg-input__filter-popover--open');
    });
  });

  // ── Close filter popover on outside click ─────────
  document.addEventListener('click', (e) => {
    root.querySelectorAll('.msg-input__filter-popover--open').forEach((popover) => {
      const wrapper = popover.closest('.msg-input');
      const filterBtn = wrapper.querySelector('.msg-input__filter-btn');
      if (!popover.contains(e.target) && e.target !== filterBtn && !filterBtn.contains(e.target)) {
        popover.classList.remove('msg-input__filter-popover--open');
      }
    });
  });

  // ── Drag to move ──────────────────────────────────
  {
    const dragHandle = root.querySelector('#drag-handle');
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let panelOriginLeft = 0;
    let panelOriginTop = 0;

    if (dragHandle) {
      dragHandle.addEventListener('mousedown', (e) => {
        if (e.target.closest('button')) return;

        isDragging = true;
        root.classList.add('ai-assistant--no-transition');
        document.body.style.userSelect = 'none';

        dragStartX = e.clientX;
        dragStartY = e.clientY;

        const rect = root.getBoundingClientRect();
        panelOriginLeft = rect.left;
        panelOriginTop = rect.top;

        e.preventDefault();
      });

      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;

        root.style.left = (panelOriginLeft + dx) + 'px';
        root.style.top = (panelOriginTop + dy) + 'px';
        root.style.right = 'auto';
        root.style.bottom = 'auto';
      });

      document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        root.classList.remove('ai-assistant--no-transition');
        document.body.style.userSelect = '';
      });
    }
  }

  // ── Resize from any edge ──────────────────────────
  // Each handle pins the opposite edge in place and grows the dragged edge to
  // follow the cursor. On first interaction the panel is converted from
  // bottom/right anchored to inline top/left so the anchor math is consistent
  // across all 4 edges.
  //
  // Constraints (also enforced via CSS max-width / max-height):
  //   width  : --ai-size-6 (320px) … --ai-size-9 (512px)
  //   height : 320px … 100vh − (--ai-spacing-6 × 2)
  {
    const attachResize = (handleId, edge) => {
      const handle = root.querySelector('#' + handleId);
      if (!handle) return;

      const horizontal = edge === 'left' || edge === 'right';
      const cursor = horizontal ? 'ew-resize' : 'ns-resize';

      let active = false;
      let startX = 0;
      let startY = 0;
      let startRect = null;
      let minW = 0;
      let maxW = 0;
      let maxH = 0;
      const minH = 320;

      handle.addEventListener('mousedown', (e) => {
        active = true;
        root.classList.add('ai-assistant--no-transition', 'ai-assistant--resizing');
        document.body.style.userSelect = 'none';
        document.body.style.cursor = cursor;

        startX = e.clientX;
        startY = e.clientY;
        startRect = root.getBoundingClientRect();

        // Pin to inline top/left so opposite-edge math works
        root.style.top = startRect.top + 'px';
        root.style.left = startRect.left + 'px';
        root.style.right = 'auto';
        root.style.bottom = 'auto';

        const styles = getComputedStyle(root);
        const rootFont = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        minW = parseFloat(styles.getPropertyValue('--ai-size-6')) * rootFont;
        maxW = parseFloat(styles.getPropertyValue('--ai-size-9')) * rootFont;
        const spacing6 = parseFloat(styles.getPropertyValue('--ai-spacing-6')) * rootFont;
        maxH = window.innerHeight - spacing6 * 2;

        e.preventDefault();
      });

      document.addEventListener('mousemove', (e) => {
        if (!active) return;

        if (edge === 'top') {
          const dy = startY - e.clientY;
          const newH = Math.min(maxH, Math.max(minH, startRect.height + dy));
          root.style.setProperty('--_panel-height', newH + 'px');
          root.style.top = (startRect.bottom - newH) + 'px';
        } else if (edge === 'bottom') {
          const dy = e.clientY - startY;
          const newH = Math.min(maxH, Math.max(minH, startRect.height + dy));
          root.style.setProperty('--_panel-height', newH + 'px');
          // top stays at startRect.top (already pinned)
        } else if (edge === 'left') {
          const dx = startX - e.clientX;
          const newW = Math.min(maxW, Math.max(minW, startRect.width + dx));
          root.style.setProperty('--_panel-width', newW + 'px');
          root.style.left = (startRect.right - newW) + 'px';
        } else if (edge === 'right') {
          const dx = e.clientX - startX;
          const newW = Math.min(maxW, Math.max(minW, startRect.width + dx));
          root.style.setProperty('--_panel-width', newW + 'px');
          // left stays at startRect.left (already pinned)
        }
      });

      document.addEventListener('mouseup', () => {
        if (!active) return;
        active = false;
        root.classList.remove('ai-assistant--no-transition', 'ai-assistant--resizing');
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      });
    };

    attachResize('resize-handle-top', 'top');
    attachResize('resize-handle-bottom', 'bottom');
    attachResize('resize-handle-left', 'left');
    attachResize('resize-handle-right', 'right');
  }

  // ── Close button ──────────────────────────────────
  {
    const closeBtn = root.querySelector('#close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        root.classList.add('ai-assistant--hidden');
        if (typeof opts.onClose === 'function') opts.onClose();
      });
    }
  }

  // Maximise button (#expand-btn) — visual only for now (user-deferred).
}
