/**
 * Demo toolbar — fixed tab on the right edge (vertically centered).
 * - Applies saved theme before first paint (no flash)
 * - Gear icon opens a popover with theme toggle
 * - Pages can register extra controls via window.demoToolbar.addControls(items)
 * - Persists theme preference to localStorage under 'demo-theme'
 *
 * Include in <head> before stylesheets:
 *   <script src="../dark-mode-toggle.js"></script>
 */
(function () {
  // Apply theme from URL query param (for iframe embedding in docs site)
  var urlParams = new URLSearchParams(window.location.search);
  var urlTheme = urlParams.get('theme');
  if (urlTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else if (!urlTheme) {
    // No URL override — apply saved theme from localStorage
    var saved = localStorage.getItem('demo-theme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  // Inline SVG icons (from Lucide)
  var sunIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';
  var moonIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
  var settingsIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>';

  // Pending controls from pages that call addControls before DOMContentLoaded
  var pendingControls = [];
  var popoverEl = null;
  var extraSection = null;

  document.addEventListener('DOMContentLoaded', function () {
    // ── Styles ──────────────────────────────────────────
    var style = document.createElement('style');
    style.textContent = [
      '.demo-toolbar {',
      '  position: fixed;',
      '  top: 50%;',
      '  right: 0;',
      '  transform: translateY(-50%);',
      '  z-index: 9999;',
      '}',
      '.demo-toolbar__trigger {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  width: 2.5rem;',
      '  height: 2.5rem;',
      '  border: 1px solid var(--ai-border-secondary);',
      '  border-right: none;',
      '  border-radius: var(--ai-radius-md) 0 0 var(--ai-radius-md);',
      '  background: var(--ai-surface-primary);',
      '  color: var(--ai-icon-secondary);',
      '  cursor: pointer;',
      '  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.08);',
      '  transition: background 150ms ease, color 150ms ease;',
      '}',
      '.demo-toolbar__trigger:hover {',
      '  background: var(--ai-surface-secondary);',
      '  color: var(--ai-icon-primary);',
      '}',
      '.demo-toolbar__trigger:focus-visible {',
      '  outline: 2px solid var(--ai-surface-brand);',
      '  outline-offset: 2px;',
      '}',
      '.demo-toolbar__trigger svg { display: block; }',
      '',
      '.demo-toolbar__popover {',
      '  display: none;',
      '  position: absolute;',
      '  right: 100%;',
      '  top: 50%;',
      '  transform: translateY(-50%);',
      '  margin-right: 0.5rem;',
      '  min-width: 10rem;',
      '  background: var(--ai-surface-primary);',
      '  border: 1px solid var(--ai-border-secondary);',
      '  border-radius: var(--ai-radius-md);',
      '  box-shadow: 0 2px 10px rgba(0,0,0,0.1);',
      '  padding: 0.5rem;',
      '  flex-direction: column;',
      '  gap: 0.25rem;',
      '}',
      '.demo-toolbar__popover--open { display: flex; }',
      '',
      '.demo-toolbar__item {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 0.5rem;',
      '  width: 100%;',
      '  padding: 0.375rem 0.5rem;',
      '  border: none;',
      '  border-radius: 0.25rem;',
      '  background: transparent;',
      '  color: var(--ai-text-secondary);',
      '  font-family: var(--ai-font-body), sans-serif;',
      '  font-size: 0.75rem;',
      '  font-weight: 500;',
      '  cursor: pointer;',
      '  text-align: left;',
      '  white-space: nowrap;',
      '  transition: background 150ms ease, color 150ms ease;',
      '}',
      '.demo-toolbar__item:hover {',
      '  background: var(--ai-surface-minimal);',
      '  color: var(--ai-text-primary);',
      '}',
      '.demo-toolbar__item.active {',
      '  background: var(--ai-surface-brand);',
      '  color: #fff;',
      '}',
      '.demo-toolbar__item svg { flex-shrink: 0; }',
      '',
      '.demo-toolbar__divider {',
      '  height: 1px;',
      '  background: var(--ai-border-secondary);',
      '  margin: 0.25rem 0;',
      '}',
    ].join('\n');
    document.head.appendChild(style);

    // ── Build toolbar ───────────────────────────────────
    var toolbar = document.createElement('div');
    toolbar.className = 'demo-toolbar';

    // Trigger button
    var trigger = document.createElement('button');
    trigger.className = 'demo-toolbar__trigger';
    trigger.type = 'button';
    trigger.innerHTML = settingsIcon;
    trigger.setAttribute('aria-label', 'Demo settings');
    trigger.setAttribute('aria-expanded', 'false');

    // Popover
    popoverEl = document.createElement('div');
    popoverEl.className = 'demo-toolbar__popover';

    // Theme toggle item
    var themeBtn = document.createElement('button');
    themeBtn.className = 'demo-toolbar__item';
    themeBtn.type = 'button';

    function updateThemeBtn() {
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      themeBtn.innerHTML = (isDark ? sunIcon : moonIcon) + '<span>' + (isDark ? 'Light mode' : 'Dark mode') + '</span>';
      themeBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }

    updateThemeBtn();

    themeBtn.addEventListener('click', function () {
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.removeItem('demo-theme');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('demo-theme', 'dark');
      }
      updateThemeBtn();
    });

    popoverEl.appendChild(themeBtn);

    // Extra controls section (populated by addControls)
    extraSection = document.createElement('div');
    extraSection.style.display = 'none';
    popoverEl.appendChild(extraSection);

    // Process any pending controls
    if (pendingControls.length > 0) {
      renderExtraControls(pendingControls);
      pendingControls = [];
    }

    toolbar.appendChild(popoverEl);
    toolbar.appendChild(trigger);
    document.body.appendChild(toolbar);

    // ── Toggle popover ──────────────────────────────────
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = popoverEl.classList.toggle('demo-toolbar__popover--open');
      trigger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!toolbar.contains(e.target)) {
        popoverEl.classList.remove('demo-toolbar__popover--open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  });

  function renderExtraControls(items) {
    if (!extraSection) return;

    // Add divider
    var divider = document.createElement('div');
    divider.className = 'demo-toolbar__divider';
    extraSection.appendChild(divider);

    items.forEach(function (item) {
      var btn = document.createElement('button');
      btn.className = 'demo-toolbar__item';
      if (item.active) btn.classList.add('active');
      btn.type = 'button';
      btn.textContent = item.label;
      if (item.id) btn.setAttribute('data-demo-id', item.id);
      btn.addEventListener('click', function () {
        if (item.onClick) item.onClick(btn);
      });
      extraSection.appendChild(btn);
    });

    extraSection.style.display = 'contents';
  }

  /**
   * Public API for pages to register extra controls.
   *
   * @param {Array<{label: string, id?: string, active?: boolean, onClick: Function}>} items
   */
  window.demoToolbar = {
    addControls: function (items) {
      if (extraSection) {
        renderExtraControls(items);
      } else {
        pendingControls = pendingControls.concat(items);
      }
    },
    /** Set the active state on a control by id */
    setActive: function (id) {
      if (!extraSection) return;
      extraSection.querySelectorAll('.demo-toolbar__item').forEach(function (btn) {
        btn.classList.remove('active');
      });
      if (id) {
        var target = extraSection.querySelector('[data-demo-id="' + id + '"]');
        if (target) target.classList.add('active');
      }
    }
  };
}());
