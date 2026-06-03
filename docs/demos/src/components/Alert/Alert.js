/* Alert — dismiss behaviour.
 *
 * Clicking an alert's close button (`.alert__close`) removes its `.alert`
 * from the DOM. Document-delegated, so it also covers alerts injected after
 * load. No markup changes needed beyond the existing
 * `<button class="alert__close" aria-label="Dismiss">`.
 *
 * Include this script on any page that uses Alert and wants the close icon
 * to be functional (the component renders fine without it — the button is
 * simply inert).
 */
(function () {
  document.addEventListener('click', function (e) {
    var closeBtn = e.target.closest('.alert__close');
    if (!closeBtn) return;
    var alert = closeBtn.closest('.alert');
    if (alert) alert.remove();
  });
})();
