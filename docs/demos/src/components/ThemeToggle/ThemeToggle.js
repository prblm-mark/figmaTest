/* ThemeToggle — inline segmented Light | Dark control.
 *
 * Auto-binds to every `.theme-toggle` on the page. Reads the current theme
 * from <html data-theme> (or absence) and reflects it as aria-pressed on
 * the matching segment. Click flips data-theme + persists to localStorage
 * under the 'demo-theme' key (shared with src/components/dark-mode-toggle.js
 * so the two stay in sync).
 *
 * Markup contract:
 *   <div class="theme-toggle">
 *     <button class="theme-toggle__btn" type="button" data-theme-value="light" aria-pressed="…">…</button>
 *     <button class="theme-toggle__btn" type="button" data-theme-value="dark"  aria-pressed="…">…</button>
 *   </div>
 *
 * Pages that include this script after the markup get auto-init. The script
 * also listens for storage events so other tabs / the dark-mode-toggle popover
 * keep all ThemeToggle instances in sync.
 */
(function () {
  var STORAGE_KEY = 'demo-theme';

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark'
      ? 'dark'
      : 'light';
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      /* ignore */
    }
    syncAll();
  }

  function syncOne(root) {
    var theme = currentTheme();
    var buttons = root.querySelectorAll('.theme-toggle__btn[data-theme-value]');
    buttons.forEach(function (btn) {
      var isActive = btn.getAttribute('data-theme-value') === theme;
      btn.setAttribute('aria-pressed', String(isActive));
    });
  }

  function syncAll() {
    document.querySelectorAll('.theme-toggle').forEach(syncOne);
  }

  function init(root) {
    if (root.dataset.themeToggleInit === '1') return;
    root.dataset.themeToggleInit = '1';

    var buttons = root.querySelectorAll('.theme-toggle__btn[data-theme-value]');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var theme = btn.getAttribute('data-theme-value');
        if (theme === 'light' || theme === 'dark') {
          applyTheme(theme);
        }
      });
    });

    syncOne(root);
  }

  function initAll() {
    document.querySelectorAll('.theme-toggle').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Keep all toggles in sync if the theme changes via another tab / mechanism.
  window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY) {
      if (e.newValue === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      syncAll();
    }
  });
})();
