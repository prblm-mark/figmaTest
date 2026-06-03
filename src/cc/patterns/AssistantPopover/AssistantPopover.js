/* AssistantPopover — dismiss behaviour.
 *
 * Clicking the close button (`.cc-assistant-popover__close`) removes its
 * `.cc-assistant-popover` from the DOM. Document-delegated, so it also covers
 * pop-overs injected after load. No markup changes needed beyond the existing
 * close button.
 *
 * This is the only behaviour wired so far — positioning / show logic is still
 * to be specced separately.
 */
(function () {
  document.addEventListener('click', function (e) {
    var closeBtn = e.target.closest('.cc-assistant-popover__close');
    if (!closeBtn) return;
    var popover = closeBtn.closest('.cc-assistant-popover');
    if (popover) popover.remove();
  });
})();
