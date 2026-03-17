/**
 * Dark mode toggle for component demo pages.
 * - Applies saved theme before first paint (no flash)
 * - Injects a fixed toggle button (vertically centered, right edge)
 * - Uses Lucide sun/moon icons (rendered inline since Lucide may not be loaded yet)
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

  // Inline SVG icons (from Lucide) to avoid dependency on Lucide being loaded
  var sunIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';
  var moonIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';

  document.addEventListener('DOMContentLoaded', function () {
    // Scoped styles
    var style = document.createElement('style');
    style.textContent = [
      '.demo-toggle {',
      '  position: fixed;',
      '  top: 50%;',
      '  right: 0;',
      '  transform: translateY(-50%);',
      '  z-index: 9999;',
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
      '  transition: background var(--ai-transition-default), color var(--ai-transition-default), border-color var(--ai-transition-default);',
      '}',
      '.demo-toggle:hover {',
      '  background: var(--ai-surface-secondary);',
      '  color: var(--ai-icon-primary);',
      '}',
      '.demo-toggle:focus-visible {',
      '  outline: 2px solid var(--ai-surface-brand);',
      '  outline-offset: 2px;',
      '}',
      '.demo-toggle svg {',
      '  display: block;',
      '}',
    ].join('\n');
    document.head.appendChild(style);

    // Build button
    var btn = document.createElement('button');
    btn.className = 'demo-toggle';
    btn.type = 'button';

    function update() {
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      btn.innerHTML = isDark ? sunIcon : moonIcon;
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
