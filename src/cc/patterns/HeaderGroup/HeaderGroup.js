/* HeaderGroup — wires the User Menu "Icon Navigation" + "Hide Labels" toggles
 * to the composed IconNavigation strip in the SAME .cc-header-group.
 *
 *   data-cc-toggle="icon-nav"    → toggles .cc-header-group--icon-nav
 *                                  (shows/hides the strip)
 *   data-cc-toggle="hide-labels" → toggles .cc-icon-nav--no-labels on the strip
 *                                  (icons-only display)
 *
 * The toggle's own .toggle--active state is flipped by its own click handler;
 * this reads the post-click state next tick and mirrors it onto the
 * composition — the same approach Dropdown.js uses for reveal rows. Delegated
 * so it works for toggles injected after parse (the user-menu panel clone).
 */
(function () {
  function sync(toggle) {
    var group = toggle.closest('.cc-header-group');
    if (!group) return;
    var on = toggle.classList.contains('toggle--active');
    var kind = toggle.getAttribute('data-cc-toggle');

    if (kind === 'icon-nav') {
      group.classList.toggle('cc-header-group--icon-nav', on);
      // Hiding the strip resets the labels-hidden state so the Hide Labels
      // sub-toggle starts fresh when the strip is next shown.
      if (!on) {
        var strip = group.querySelector('.cc-icon-nav');
        if (strip) strip.classList.remove('cc-icon-nav--no-labels');
      }
    } else if (kind === 'hide-labels') {
      var stripEl = group.querySelector('.cc-icon-nav');
      if (stripEl) stripEl.classList.toggle('cc-icon-nav--no-labels', on);
    }
  }

  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('.toggle[data-cc-toggle]');
    if (!toggle) return;
    // Active class flips in the toggle's own handler; read it next tick.
    window.setTimeout(function () { sync(toggle); }, 0);
  });

  // Initial sync for any toggles that start active (showcase / persisted state).
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.toggle[data-cc-toggle]').forEach(sync);
  });
})();
