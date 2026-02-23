/**
 * Dark mode toggle for component demo pages.
 * - Applies saved theme before first paint (no flash)
 * - Injects a fixed toggle button into the page
 * - Persists preference to localStorage under 'demo-theme'
 *
 * Include in <head> before stylesheets:
 *   <script src="../dark-mode-toggle.js"></script>
 */
(function () {
  // Apply saved theme synchronously before CSS renders to prevent flash
  var saved = localStorage.getItem('demo-theme');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Scoped styles — uses --ai-* tokens so the button itself theme-switches
    var style = document.createElement('style');
    style.textContent = [
      '.demo-toggle {',
      '  position: fixed;',
      '  top: var(--ai-spacing-5);',
      '  right: var(--ai-spacing-5);',
      '  z-index: 9999;',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: var(--ai-spacing-2);',
      '  padding: var(--ai-spacing-2) var(--ai-spacing-4);',
      '  border: 1px solid var(--ai-border-secondary);',
      '  border-radius: var(--ai-radius-full);',
      '  background: var(--ai-surface-primary);',
      '  color: var(--ai-text-secondary);',
      '  font-family: var(--ai-font-body), sans-serif;',
      '  font-size: var(--ai-font-fixed-xxs);',
      '  font-weight: var(--ai-font-medium);',
      '  cursor: pointer;',
      '  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);',
      '  transition: background 0.15s, color 0.15s, border-color 0.15s;',
      '}',
      '.demo-toggle:hover {',
      '  background: var(--ai-surface-secondary);',
      '  color: var(--ai-text-primary);',
      '}',
      '.demo-toggle:focus-visible {',
      '  outline: 2px solid var(--ai-surface-brand);',
      '  outline-offset: 2px;',
      '}',
      '.demo-toggle__pip {',
      '  width: 8px;',
      '  height: 8px;',
      '  border-radius: 50%;',
      '  border: 1.5px solid var(--ai-icon-contrast);',
      '  background: transparent;',
      '  transition: background 0.15s, border-color 0.15s;',
      '  flex-shrink: 0;',
      '}',
      '[data-theme="dark"] .demo-toggle__pip {',
      '  background: var(--ai-surface-brand);',
      '  border-color: var(--ai-surface-brand);',
      '}',
    ].join('\n');
    document.head.appendChild(style);

    // Build button
    var btn = document.createElement('button');
    btn.className = 'demo-toggle';
    btn.type = 'button';
    btn.innerHTML =
      '<span class="demo-toggle__pip" aria-hidden="true"></span>' +
      '<span class="demo-toggle__label"></span>';

    function update() {
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      btn.querySelector('.demo-toggle__label').textContent = isDark ? 'Light mode' : 'Dark mode';
      btn.setAttribute('aria-pressed', String(isDark));
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }

    update();

    btn.addEventListener('click', function () {
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.removeItem('demo-theme');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('demo-theme', 'dark');
      }
      update();
    });

    document.body.appendChild(btn);
  });
}());
