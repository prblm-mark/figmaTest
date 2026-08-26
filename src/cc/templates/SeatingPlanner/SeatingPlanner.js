/* SeatingPlanner — Select Event modal wiring.
 *
 * The EventPicker pattern owns everything INSIDE the dialog: predictive search, the
 * "Live events only" filter, row selection, clear-search, and Escape. It deliberately owns
 * none of the hosting, and says so — "Emits CustomEvents so the host app owns persistence
 * and routing". This file is that host.
 *
 * So the whole job here is four things:
 *   1. open the overlay from the "Select Event" button
 *   2. close it on `event-picker:close` (the × and Cancel), a backdrop click, or Escape
 *   3. close it on `event-picker:select`, and hand the chosen event on
 *   4. manage focus, because Modal.css only toggles `display`
 *
 * WHY THE FOCUS CODE EXISTS. `.modal-overlay` flips display:none → flex and nothing else.
 * The dialog is marked `aria-modal="true"`, which is a promise to the user that focus is
 * inside it and cannot wander out — a promise CSS cannot keep on its own. Without this,
 * opening the picker leaves focus on the button behind the scrim, and Tab walks the whole
 * page underneath. Escape also silently stops working, because EventPicker listens for it
 * on its own root: no focus inside the picker, no keydown, no close.
 *
 * Guarded so including the script twice does not double-bind.
 */
(function () {
  'use strict';

  if (window.__seatingPlannerReady) return;
  window.__seatingPlannerReady = true;

  var OPEN_CLASS = 'modal-overlay--open';
  var FOCUSABLE = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  var overlay = document.querySelector('[data-seating-picker]');
  var trigger = document.querySelector('[data-seating-select-event]');
  if (!overlay || !trigger) return;

  var dialog = overlay.querySelector('[role="dialog"]');
  var returnFocusTo = null;

  /* ── Screen state ─────────────────────────────────────────────────────────
   * The screen has mutually-exclusive states, each a Figma frame of its own:
   *
   *   no-event   the event gate            3515:175956 / 3515:213358
   *   no-plan    event chosen, no plans    3515:176082 / 3515:213400
   *
   * Both states' markup is in the page and one is shown at a time. `hidden` rather than a
   * CSS class, because base.css guarantees `hidden` always wins, and a display:none child
   * is removed from flex layout entirely — so the page's gap never appears around a state
   * that is not on screen.
   *
   * Choosing an event genuinely advances no-event -> no-plan (designer, 2026-08-26), which
   * makes the demo a working flow rather than a set of stills. `?state=no-plan` lands on one
   * directly for review, the same trick `?frame=mobile` uses elsewhere. */
  var page = document.querySelector('[data-seating-state]');
  var panels = document.querySelectorAll('[data-seating-panel]');

  function setState(state) {
    if (!page) return;
    page.setAttribute('data-seating-state', state);
    Array.prototype.forEach.call(panels, function (panel) {
      panel.hidden = panel.getAttribute('data-seating-panel') !== state;
    });
  }

  var requested = /[?&]state=([a-z-]+)/.exec(window.location.search);
  if (requested) setState(requested[1]);

  function isOpen() {
    return overlay.classList.contains(OPEN_CLASS);
  }

  /* Visible focusables only — EventPicker hides non-matching rows with the `hidden`
   * attribute while searching, and a hidden row must not be a tab stop. offsetParent is
   * null for anything display:none'd or hidden, which covers both. */
  function focusable() {
    return Array.prototype.filter.call(
      dialog.querySelectorAll(FOCUSABLE),
      function (el) { return el.offsetParent !== null; }
    );
  }

  function open() {
    if (isOpen()) return;
    returnFocusTo = document.activeElement;
    overlay.classList.add(OPEN_CLASS);
    trigger.setAttribute('aria-expanded', 'true');

    /* The search field, not the first focusable. Typing is what you came to do, and it is
     * also inside the picker root, so EventPicker's own Escape handler starts working
     * immediately. Falls back to the dialog itself if the field ever goes away. */
    var search = dialog.querySelector('[data-ep-search]') || dialog;
    if (search === dialog && !dialog.hasAttribute('tabindex')) dialog.setAttribute('tabindex', '-1');
    search.focus();
  }

  function close() {
    if (!isOpen()) return;
    overlay.classList.remove(OPEN_CLASS);
    trigger.setAttribute('aria-expanded', 'false');

    /* Back where they came from, falling back to the trigger.
     *
     * `<body>` is explicitly rejected, not just null/detached. It is a real, connected
     * element, so an isConnected check alone happily "restores" focus to it — which is the
     * same as losing focus, and sends the next Tab to the top of the page. That is exactly
     * what happens whenever the dialog was opened without the trigger being focused first
     * (a programmatic .click(), or any browser that does not focus a button on click). */
    var target = (returnFocusTo && returnFocusTo !== document.body && returnFocusTo.isConnected)
      ? returnFocusTo
      : trigger;
    returnFocusTo = null;
    target.focus();
  }

  trigger.addEventListener('click', open);

  /* Both bubble from the picker root. */
  overlay.addEventListener('event-picker:close', close);

  overlay.addEventListener('event-picker:select', function (event) {
    var chosen = event.detail || {};
    close();

    /* An event now has somewhere to go: the No Plan state. This is the seam screen 2 left
     * behind, wired up. */
    setState('no-plan');

    /* TODO(backend:SeatingPlanner): the chosen event's name/date/venue should populate the
     * SeatingHeader rather than the hardcoded copy in it, and the choice should persist per
     * user so a reload returns to it — see seating-last-used-event. Which state renders is
     * really the plan COUNT, not the click: an event with plans goes straight to the
     * planner, not to No Plan. That is why the event is still re-emitted for a host to act
     * on rather than being treated as settled here. */
    overlay.dispatchEvent(new CustomEvent('seating-planner:event-chosen', {
      bubbles: true,
      detail: { id: chosen.id || '', name: chosen.name || '' }
    }));
  });

  /* Backdrop. Only a click on the overlay ITSELF — a click that merely bubbles up from
   * inside the dialog must not dismiss it. */
  overlay.addEventListener('click', function (event) {
    if (event.target === overlay) close();
  });

  /* Escape and the focus trap.
   *
   * EventPicker already closes on Escape, but only while focus is inside its root. This
   * catches the case where focus is on the overlay or has otherwise left the picker, so the
   * key works wherever you are. close() is idempotent, so both firing is harmless. */
  overlay.addEventListener('keydown', function (event) {
    if (!isOpen()) return;

    if (event.key === 'Escape') {
      event.stopPropagation();
      close();
      return;
    }

    if (event.key !== 'Tab') return;

    var items = focusable();
    if (!items.length) return;

    var first = items[0];
    var last = items[items.length - 1];
    var active = document.activeElement;

    /* Wrap at both ends, and pull focus back in if it has escaped the dialog entirely. */
    if (event.shiftKey && (active === first || !dialog.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  });
})();
