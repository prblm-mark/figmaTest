/* Badge — auto-removes a .badge when its .badge__close button is clicked.
 * Event-delegated: works for badges added to the DOM after page load. */

function init() {
  document.addEventListener('click', (e) => {
    const close = e.target.closest('.badge__close');
    if (!close) return;
    const badge = close.closest('.badge');
    if (!badge) return;
    badge.remove();
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

export { init };
