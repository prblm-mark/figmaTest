/**
 * AiChat — Sidebar toggle logic for the AI chat template.
 *
 * On mobile (<1024px): sidebar is hidden by default, toggled via panel-left button.
 * On desktop (≥1024px): sidebar is always visible (inline flex).
 */

import { initSidebarTheme } from '../../utils/sidebar-colors.js';

/**
 * Initializes the AiChat template.
 *
 * @param {HTMLElement} el  The .ai-chat root element
 * @returns {{ toggleSidebar(): void, destroy(): void }}
 */
export function initAiChat(el) {
  const sidebarEl = el.querySelector('.ai-chat__sidebar .chat-sidebar');
  const overlay = el.querySelector('.ai-chat__overlay');
  const toggleBtns = el.querySelectorAll('[data-sidebar-toggle]');

  const LG_BREAKPOINT = 1024;

  // ── Sidebar theme ────────────────────────────────────
  if (sidebarEl) {
    initSidebarTheme(sidebarEl);
  }

  // ── Sidebar toggle ───────────────────────────────────

  function isDesktop() {
    return window.innerWidth >= LG_BREAKPOINT;
  }

  function toggleSidebar() {
    if (isDesktop()) {
      // Desktop: toggle closed state (sidebar visible by default)
      el.classList.toggle('ai-chat--sidebar-closed');
    } else {
      // Mobile: toggle open state (sidebar hidden by default)
      el.classList.toggle('ai-chat--sidebar-open');
    }
  }

  function closeSidebar() {
    el.classList.remove('ai-chat--sidebar-open');
  }

  // Toggle buttons (panel-left in header)
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', toggleSidebar);
  });

  // Overlay click closes sidebar on mobile
  if (overlay) {
    overlay.addEventListener('click', closeSidebar);
  }

  // Close sidebar on Escape
  function handleEscape(e) {
    if (e.key === 'Escape') {
      if (isDesktop()) {
        el.classList.add('ai-chat--sidebar-closed');
      } else {
        closeSidebar();
      }
    }
  }
  document.addEventListener('keydown', handleEscape);

  // On resize: clean up stale classes and suppress transition flash
  const sidebarWrapEl = el.querySelector('.ai-chat__sidebar');
  let wasDesktop = isDesktop();

  function handleResize() {
    const nowDesktop = isDesktop();

    // Crossing a breakpoint — suppress the sidebar transition
    if (nowDesktop !== wasDesktop && sidebarWrapEl) {
      sidebarWrapEl.style.transition = 'none';
      requestAnimationFrame(() => {
        sidebarWrapEl.style.transition = '';
      });
    }

    if (nowDesktop) {
      el.classList.remove('ai-chat--sidebar-open');
    } else {
      el.classList.remove('ai-chat--sidebar-closed');
    }

    wasDesktop = nowDesktop;
  }
  window.addEventListener('resize', handleResize);

  // ── Dark mode: re-init sidebar theme ─────────────────
  const themeObserver = new MutationObserver(() => {
    if (sidebarEl) initSidebarTheme(sidebarEl);
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  // ── Cleanup ──────────────────────────────────────────

  function destroy() {
    toggleBtns.forEach(btn => btn.removeEventListener('click', toggleSidebar));
    if (overlay) overlay.removeEventListener('click', closeSidebar);
    document.removeEventListener('keydown', handleEscape);
    window.removeEventListener('resize', handleResize);
    themeObserver.disconnect();
  }

  return { toggleSidebar, destroy };
}
