/* Toast — dismiss behaviour.
 *
 * Clicking a toast's close button (`.toast__close`) removes its `.toast` from
 * the DOM. Document-delegated, so it also covers toasts injected after load
 * (the usual case — toasts are spawned by app code). No markup changes needed
 * beyond the existing `<button class="toast__close" aria-label="Dismiss">`.
 *
 * Include this script on any page that uses Toast and wants the close icon to
 * be functional (the component renders fine without it — the button is simply
 * inert). Mirrors Alert.js.
 */
(function () {
  document.addEventListener('click', function (e) {
    var closeBtn = e.target.closest('.toast__close');
    if (!closeBtn) return;
    var toast = closeBtn.closest('.toast');
    if (toast) toast.remove();
  });
})();
