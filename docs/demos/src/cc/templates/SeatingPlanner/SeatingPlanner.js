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

  /* The create-plan modal lives in its own IIFE and cannot see `setState` — calling it directly
   * from there threw a ReferenceError, so a successful submit closed the modal and then silently
   * failed to advance (found 2026-08-27 by reading the minified build, where the undeclared global
   * was obvious). It already announces itself, so the state machine listens instead: the modal
   * reports what happened, this owns what the page shows. */
  document.addEventListener('seating-planner:plan-created', function () {
    setState('plan');
  });

  var requested = /[?&]state=([a-z-]+)/.exec(window.location.search);
  if (requested) {
    var want = requested[1];
    /* `create-plan` and `create-plan-errors` are MODAL states, not page states — they sit
     * over the no-plan screen. Without this they would match no panel and hide all of them,
     * leaving an empty page behind the modal. */
    if (want.indexOf('create-plan') === 0) want = 'no-plan';
    /* States that exist: no-event · no-plan · plan (+ create-plan* as modals over no-plan). */
    if (document.querySelector('[data-seating-panel="' + want + '"]')) setState(want);
  }

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

/* ── Create Plan modal ──────────────────────────────────────────────────────
 * Figma 3515:212885 / 3515:228092 (help off) and 3515:212593 / 3515:212739 (help on +
 * errors). Opened by the SeatingHeader's own New Plan button.
 *
 * Deliberately a separate block from the picker above rather than a shared helper. The two
 * modals differ in what focus should land on (a search field vs the first form field) and in
 * what closing means (a picker just closes; a form may be mid-edit), and the picker's
 * behaviour is largely delegated to event-picker.js. A shared abstraction over two
 * genuinely different dialogs would hide more than it saved — but the ARIA contract is
 * identical, so the same rules apply: focus moves in on open, returns on close, and Tab is
 * trapped while it is open.
 */
(function () {
  'use strict';

  if (window.__createPlanReady) return;
  window.__createPlanReady = true;

  var OPEN_CLASS = 'modal-overlay--open';
  var FOCUSABLE = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  var overlay = document.querySelector('[data-create-plan]');
  var trigger = document.querySelector('[data-seating-new-plan]');
  if (!overlay || !trigger) return;

  var dialog = overlay.querySelector('[role="dialog"]');
  var form = overlay.querySelector('#create-plan-form');
  var helpToggle = overlay.querySelector('#cp-help-toggle');
  var returnFocusTo = null;

  function isOpen() { return overlay.classList.contains(OPEN_CLASS); }

  function focusable() {
    return Array.prototype.filter.call(
      dialog.querySelectorAll(FOCUSABLE),
      function (el) { return el.offsetParent !== null; }
    );
  }

  function field(name) { return overlay.querySelector('[data-cp-field="' + name + '"]'); }

  function setError(name, message) {
    var wrap = field(name);
    if (!wrap) return;
    var help = wrap.querySelector('[data-cp-help]');
    wrap.classList.add('input--error');
    if (help) {
      help.textContent = message;
      /* The message is an error, so announce it. `.input--error .input__help` is already
       * red in Input.css — the same element serves as hint and error, which is exactly how
       * Figma draws it. */
      help.setAttribute('role', 'alert');
    }
    var control = wrap.querySelector('.input__control');
    if (control) control.setAttribute('aria-invalid', 'true');
  }

  /* Restores whatever hint the markup shipped with — empty for the two fields whose help
   * copy Figma never shows, which `.input__help:empty` then hides. */
  function clearErrors() {
    Array.prototype.forEach.call(overlay.querySelectorAll('[data-cp-field]'), function (wrap) {
      wrap.classList.remove('input--error');
      var help = wrap.querySelector('[data-cp-help]');
      if (help) {
        help.textContent = help.getAttribute('data-cp-help-original') || '';
        help.removeAttribute('role');
      }
      var control = wrap.querySelector('.input__control');
      if (control) control.removeAttribute('aria-invalid');
    });
  }

  /* Stash the shipped hints once, so clearErrors can put them back. */
  Array.prototype.forEach.call(overlay.querySelectorAll('[data-cp-help]'), function (help) {
    help.setAttribute('data-cp-help-original', help.textContent.trim());
  });

  function open() {
    if (isOpen()) return;
    returnFocusTo = document.activeElement;
    overlay.classList.add(OPEN_CLASS);
    trigger.setAttribute('aria-expanded', 'true');
    var first = overlay.querySelector('.input__control');
    if (first) first.focus();
    else dialog.focus();
  }

  function close() {
    if (!isOpen()) return;
    overlay.classList.remove(OPEN_CLASS);
    trigger.setAttribute('aria-expanded', 'false');
    /* Same `<body>` rejection as the picker — see the note there. */
    var target = (returnFocusTo && returnFocusTo !== document.body && returnFocusTo.isConnected)
      ? returnFocusTo
      : trigger;
    returnFocusTo = null;
    target.focus();
  }

  trigger.addEventListener('click', open);

  Array.prototype.forEach.call(overlay.querySelectorAll('[data-cp-close]'), function (btn) {
    btn.addEventListener('click', close);
  });

  overlay.addEventListener('click', function (event) {
    if (event.target === overlay) close();
  });

  overlay.addEventListener('keydown', function (event) {
    if (!isOpen()) return;

    if (event.key === 'Escape') { close(); return; }
    if (event.key !== 'Tab') return;

    var items = focusable();
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1], active = document.activeElement;

    if (event.shiftKey && (active === first || !dialog.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  });

  /* "Show help" reveals each field's hint. The class does the work; the CSS deliberately
   * leaves ERROR messages visible either way — an error you cannot see is worse than a hint
   * you did not ask for, and Figma never draws help-off-with-errors to say otherwise. */
  if (helpToggle) {
    helpToggle.addEventListener('toggle:change', function (event) {
      form.classList.toggle('create-plan__form--help', !!(event.detail && event.detail.active));
    });
  }

  /* Validation uses the two rules Figma's own error copy states, verbatim:
   *   "Plan name is required"
   *   "Seats per table must be between 6 and 12."
   * Nothing is invented — those strings ARE the spec, and transcribing them is why this is
   * wired rather than faked with a demo state. Tables shows a hint reading "Number of tables
   * is required." but Figma renders it grey, as help rather than an error, so it is not
   * validated here. Worth a designer check: that copy reads like validation. */
  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      clearErrors();

      var name = overlay.querySelector('#cp-name');
      var room = overlay.querySelector('#cp-room');
      var tables = overlay.querySelector('#cp-tables');
      var seats = overlay.querySelector('#cp-seats');
      var bad = null;

      if (name && !name.value.trim()) {
        setError('name', 'Plan name is required');
        bad = bad || name;
      }

      /* Room / location became required 2026-08-27. Figma gives it only a hint ("The room or
       * area this plan covers"), never an error, so this message follows the wording of the
       * one required-field error Figma DOES state — "Plan name is required". Derived from the
       * established pattern rather than lifted from a frame; flagged in figma-notes. */
      if (room && !room.value.trim()) {
        setError('room', 'Room / location is required');
        bad = bad || room;
      }

      /* Tables: required, and its own help line already says so in Figma's words.
       *
       * Upper bound added 2026-08-27 with the `max="99"` cap. The stepper's + button disables at
       * 99 so clicking cannot exceed it, but the field is still a real number input — typing 150
       * or pasting it would otherwise submit. Figma states no tables bound at all, so this message
       * follows the wording of the one bounded-field error it DOES state ("Seats per table must be
       * between 6 and 12."). Derived from the established pattern, not lifted from a frame — same
       * footing as the Room message above, and flagged in figma-notes. */
      if (tables) {
        var t = Number(tables.value);
        if (!tables.value.trim() || !Number.isFinite(t) || t < 1) {
          setError('tables', 'Number of tables is required.');
          bad = bad || tables;
        } else if (t > 99) {
          setError('tables', 'Number of tables must be between 1 and 99.');
          bad = bad || tables;
        }
      }

      /* Seats: required AND bounded. Both messages are Figma's own copy. The bounds match
       * the input's min/max, so the native spinner cannot reach an invalid value either. */
      if (seats) {
        var n = Number(seats.value);
        if (!seats.value.trim()) {
          setError('seats', 'Seats per table must be between 6 and 12.');
          bad = bad || seats;
        } else if (!Number.isFinite(n) || n < 6 || n > 12) {
          setError('seats', 'Seats per table must be between 6 and 12.');
          bad = bad || seats;
        }
      }

      if (bad) { bad.focus(); return; }

      close();

      /* The screen that follows IS now designed (3515:177748 / 3515:213426), so the flow continues
       * into it. The transition is driven by the event below rather than a direct call: `setState`
       * belongs to another IIFE and is not in scope here.
       *
       * TODO(backend:SeatingPlanner): creating a plan must generate its tables — see
       * seating-new-plan. The plan screen's 12 tables and its seat rows are static markup;
       * the real screen must render THIS plan's tables at the requested count and shape. */
      overlay.dispatchEvent(new CustomEvent('seating-planner:plan-created', {
        bubbles: true,
        detail: {
          name: (overlay.querySelector('#cp-name') || {}).value || '',
          room: (overlay.querySelector('#cp-room') || {}).value || '',
          tables: (overlay.querySelector('#cp-tables') || {}).value || '',
          seats: (overlay.querySelector('#cp-seats') || {}).value || '',
          /* Table Shape is a Select, so its value lives in the trigger's label rather than
           * on an input. */
          shape: (overlay.querySelector('#cp-shape .sel__value') ||
                  overlay.querySelector('[data-cp-field="shape"] .sel__value') || {}).textContent || ''
        }
      }));
    });
  }

  /* ?state=create-plan / create-plan-errors opens it directly for review; the errors form
   * shows exactly the combination Figma's help-on frame draws. */
  var q = window.location.search;
  if (q.indexOf('state=create-plan') !== -1) {
    open();
    if (q.indexOf('create-plan-errors') !== -1) {
      if (helpToggle) {
        helpToggle.classList.add('toggle--active');
        helpToggle.setAttribute('aria-checked', 'true');
        form.classList.add('create-plan__form--help');
      }
      setError('name', 'Plan name is required');
      setError('seats', 'Seats per table must be between 6 and 12.');
    }
  }
})();


/* ══ Plan selected: table selection, the mobile inline detail, and the resize handle ══════
 *
 * Figma  3515:177748  desktop, first table selected
 *        3515:213426  mobile, nothing selected
 *        3515:228026  mobile, tapped — the detail sits INSIDE the card grid, and the listing
 *                     is at y=-79, i.e. scrolled so the selected card is at the top
 *
 * Selection lives here rather than in TableCard: the card's own figma-notes say the parent
 * module owns it and toggles `--selected`, because only the parent knows which sibling to
 * deselect and which detail panel to fill.
 */
(function () {
  'use strict';

  var plan = document.querySelector('[data-sp-plan]');
  if (!plan) return;

  var grid    = plan.querySelector('[data-sp-grid]');
  var aside   = plan.querySelector('[data-sp-aside]');
  var detail  = plan.querySelector('[data-sp-detail]');
  var handle  = plan.querySelector('[data-sp-handle]');
  var nameEl  = plan.querySelector('[data-sp-detail-name]');
  var countEl = plan.querySelector('[data-sp-detail-count]');
  var cards   = Array.prototype.slice.call(plan.querySelectorAll('[data-sp-card]'));

  /* The CSS stacks this row at `@container cs-page (max-width: 1023px)`. JS cannot read a
   * container query, and `matchMedia` would reintroduce the exact bug the CSS just fixed — a
   * docked SidebarMenu leaves an 820px column at a 2239px viewport, where every viewport query
   * says "desktop". So the threshold is measured off the page container, and a ResizeObserver
   * watches it. STACK_MAX must stay in step with the CSS value. */
  var STACK_MAX = 1023;
  var pageEl = document.querySelector('.cc-control__page') || plan.parentNode;

  function isStacked() {
    return pageEl.getBoundingClientRect().width <= STACK_MAX;
  }

  /* ── Selection ─────────────────────────────────────────────────────────── */

  /* Seeded from the markup rather than starting null: the HTML pre-selects Table 1 so a
   * no-JS render matches the desktop frame. */
  var selected = plan.querySelector('.table-card--selected');

  /* The detail is ONE element that moves, not two copies. On desktop it lives in the aside;
   * on mobile it is inserted straight after the selected card so it lands between two cards
   * exactly as the frame draws it. Two instances would drift apart the moment either changed. */
  function placeDetail() {
    if (!selected || !isStacked()) {
      if (detail.parentNode !== aside) aside.appendChild(detail);
      return;
    }
    if (selected.nextSibling !== detail) {
      selected.parentNode.insertBefore(detail, selected.nextSibling);
    }
  }

  function select(card, opts) {
    var scroll = opts && opts.scroll;

    if (selected === card && isStacked()) {
      /* Tapping the open card again closes it — otherwise a mobile user has no way back to
       * the plain list, since there is no close control in the frame. */
      selected = null;
      card.classList.remove('table-card--selected');
      placeDetail();
      return;
    }

    cards.forEach(function (c) { c.classList.remove('table-card--selected'); });
    card.classList.add('table-card--selected');
    selected = card;

    /* The card's OWN name, not 'Table ' + data-sp-table. The number and the name were always the
     * same string until the Table form let either be edited; now a card renamed to "Headline
     * Sponsors" would open a panel headed "Table 14". The attribute stays as the stable id. */
    var nameSrc = card.querySelector('.table-card__select');
    if (nameEl) nameEl.textContent = nameSrc
      ? nameSrc.textContent.trim()
      : 'Table ' + card.getAttribute('data-sp-table');
    /* TODO(backend:SeatingPlanner): the seat rows are static markup for one empty table — the
     * real panel must load THIS table's seats and its own seated count. See
     * seating-table-detail. Only the title and count are updated here. */
    if (countEl) countEl.textContent = card.querySelector('.table-card__count').textContent;

    placeDetail();

    /* "table in focus should scroll to top of chrome/header group" (designer, 2026-08-27),
     * which is what the mobile frame shows: the listing offset so the card sits at the top.
     * The page is the scroller, so scrollIntoView on the card is the whole behaviour. */
    if (scroll && isStacked() && card.scrollIntoView) {
      card.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }

  grid.addEventListener('click', function (event) {
    var trigger = event.target.closest && event.target.closest('.table-card__select');
    if (!trigger) return;
    var card = trigger.closest('[data-sp-card]');
    if (card) select(card, { scroll: true });
  });

  /* Desktop pre-selects the first table so the detail panel is never empty; mobile does not,
   * because the detail would take too much of the screen (designer, 2026-08-27). Re-applied on
   * every breakpoint crossing, so resizing a desktop window down and back behaves. */
  function applyDefault() {
    if (isStacked()) {
      /* Clear the class off EVERY card, not just the one `selected` points at. The markup
       * ships Table 1 pre-selected so a static render (or a Figma capture) matches the
       * desktop frame without JS — which means on mobile there is a selected card that this
       * function has never seen, and checking `selected` alone left it highlighted. */
      cards.forEach(function (c) { c.classList.remove('table-card--selected'); });
      selected = null;
    } else if (!selected && cards.length) {
      select(cards[0], { scroll: false });
    }
    placeDetail();
  }

  /* ResizeObserver, not a resize listener: the column changes width when the SidebarMenu docks
   * or the rail appears, with no window resize at all — which is the whole reason this screen
   * needed container queries. Guarded so it only re-runs when the stacked/side-by-side state
   * actually flips, since RO fires on every pixel. */
  var wasStacked = null;
  function onContainerResize() {
    var now = isStacked();
    if (now === wasStacked) return;
    wasStacked = now;
    applyDefault();
  }

  if (window.ResizeObserver) {
    new ResizeObserver(onContainerResize).observe(pageEl);
  } else {
    window.addEventListener('resize', onContainerResize);
  }
  onContainerResize();

  /* ── Resize handle ─────────────────────────────────────────────────────── */

  if (handle) {
    /* Custom properties resolve to the AUTHORED string, so --ai-size-4 reads back as "15rem"
     * and parseFloat gives 15, not 240. Convert through the root font size rather than
     * hardcoding 16 — a user with a larger default font would otherwise get wrong bounds. */
    function tokenPx(name) {
      var raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      var n = parseFloat(raw);
      if (!isFinite(n)) return 0;
      if (raw.indexOf('rem') !== -1) {
        return n * parseFloat(getComputedStyle(document.documentElement).fontSize);
      }
      return n;
    }

    /* MIN is --ai-size-4 (240) and DEFAULT is --ai-size-6 (320); both appear in Frame 245's
     * own variable list, so neither is invented. The MAX is half the row, which Figma does
     * NOT specify — flagged in figma-notes as an interaction parameter needing a designer
     * call, along with the arrow-key step. */
    function bounds() {
      var min = tokenPx('--ai-size-4');
      var max = Math.max(min, plan.getBoundingClientRect().width / 2);
      return { min: min, max: max };
    }

    function currentWidth() {
      return aside.getBoundingClientRect().width;
    }

    function setWidth(px) {
      var b = bounds();
      var w = Math.min(b.max, Math.max(b.min, px));
      plan.style.setProperty('--sp-aside-w', w + 'px');
      handle.setAttribute('aria-valuenow', String(Math.round(w)));
      handle.setAttribute('aria-valuemin', String(Math.round(b.min)));
      handle.setAttribute('aria-valuemax', String(Math.round(b.max)));
      return w;
    }

    var dragFrom = 0, dragWidth = 0;

    handle.addEventListener('pointerdown', function (event) {
      if (isStacked()) return;
      dragFrom = event.clientX;
      dragWidth = currentWidth();
      handle.setAttribute('data-dragging', '');
      /* Capture keeps the drag alive when the pointer outruns the 20px handle. */
      if (handle.setPointerCapture) handle.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    handle.addEventListener('pointermove', function (event) {
      if (!handle.hasAttribute('data-dragging')) return;
      /* The aside is on the RIGHT, so dragging left (negative dx) makes it wider. */
      setWidth(dragWidth - (event.clientX - dragFrom));
    });

    function endDrag(event) {
      if (!handle.hasAttribute('data-dragging')) return;
      handle.removeAttribute('data-dragging');
      if (handle.releasePointerCapture && event.pointerId !== undefined) {
        try { handle.releasePointerCapture(event.pointerId); } catch (e) { /* already gone */ }
      }
    }
    handle.addEventListener('pointerup', endDrag);
    handle.addEventListener('pointercancel', endDrag);

    /* Keyboard: a separator that can only be dragged is unusable without a mouse. */
    handle.addEventListener('keydown', function (event) {
      if (isStacked()) return;
      var b = bounds();
      var step = tokenPx('--ai-spacing-5');           /* 16px per press */
      var k = event.key;
      if (k === 'ArrowLeft')       setWidth(currentWidth() + step);
      else if (k === 'ArrowRight') setWidth(currentWidth() - step);
      else if (k === 'Home')       setWidth(b.max);
      else if (k === 'End')        setWidth(b.min);
      else return;
      event.preventDefault();
    });

    /* Double-click resets to Figma's 320 — the usual escape hatch once a splitter has been
     * dragged somewhere unhelpful. */
    handle.addEventListener('dblclick', function () {
      if (isStacked()) return;
      plan.style.removeProperty('--sp-aside-w');
      handle.setAttribute('aria-valuenow', String(Math.round(currentWidth())));
    });

    /* Seed the ARIA values from the real rendered width. */
    if (!isStacked()) setWidth(currentWidth());
  }
})();

/* ══ Chrome shadow on scroll ══════════════════════════════════════════════════════════════
 * This screen deliberately has no header block and no chrome hairline (both designer calls), so
 * nothing separates the chrome from content sliding under it. A `--ai-shadow-sm` that appears
 * only once the page has actually scrolled gives the separation without adding permanent chrome.
 *
 * Keyed off the PAGE's scrollTop, because that is the scroller that moves content under the
 * chrome. When the layout is side by side the card grid scrolls inside its own box instead and
 * nothing passes under the chrome, so no shadow — which is correct, not an omission.
 */
(function () {
  'use strict';

  var page = document.querySelector('.cc-control__page--seating');
  var chrome = document.querySelector('.cc-control__chrome');
  if (!page || !chrome) return;

  var on = null;
  function sync() {
    var scrolled = page.scrollTop > 0;
    if (scrolled === on) return;      /* scroll fires continuously; only touch the DOM on a flip */
    on = scrolled;
    chrome.classList.toggle('is-scrolled', scrolled);
  }

  /* `passive` because this never calls preventDefault — without it the listener can block the
   * scroll it is only observing. */
  page.addEventListener('scroll', sync, { passive: true });

  /* Also re-check when the page stops being scrollable at all: switching to the side-by-side
   * layout, or a panel change, can leave `is-scrolled` stuck on with nothing scrolled. */
  if (window.ResizeObserver) new ResizeObserver(sync).observe(page);

  sync();
})();

/* ── Edit Plan modal ─────────────────────────────────────────────────────────────────────────
 * Figma 3515:176248 (desktop) / 3515:227054 (mobile). Opened by a room card's pencil, pre-filled
 * from that card, and edits only Plan name and Room / location.
 *
 * A separate modal from create-plan by the designer's decision (2026-08-28), so this is a separate
 * IIFE rather than a mode of that one. The two are deliberately parallel in shape — same open/close
 * contract, same error handling, same focus trap — so a change to one is easy to mirror.
 */
(function () {
  'use strict';

  if (window.__editPlanReady) return;
  window.__editPlanReady = true;

  var OPEN_CLASS = 'modal-overlay--open';
  var FOCUSABLE = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  var overlay = document.querySelector('[data-edit-plan]');
  if (!overlay) return;

  var dialog = overlay.querySelector('[role="dialog"]');
  var form = overlay.querySelector('#edit-plan-form');
  var helpToggle = overlay.querySelector('#ep-help-toggle');
  var nameInput = overlay.querySelector('#ep-name');
  var roomInput = overlay.querySelector('#ep-room');
  var returnFocusTo = null;
  /* The card being edited. Save writes back to this one, so it must be remembered across the
   * modal's lifetime rather than re-derived on submit — by then the click target is gone. */
  var editingCard = null;

  function isOpen() { return overlay.classList.contains(OPEN_CLASS); }

  function focusable() {
    return Array.prototype.filter.call(
      dialog.querySelectorAll(FOCUSABLE),
      function (el) { return el.offsetParent !== null; }
    );
  }

  function field(name) { return overlay.querySelector('[data-ep-field="' + name + '"]'); }

  Array.prototype.forEach.call(overlay.querySelectorAll('[data-ep-help]'), function (help) {
    help.setAttribute('data-ep-help-original', help.textContent.trim());
  });

  function setError(name, message) {
    var wrap = field(name);
    if (!wrap) return;
    wrap.classList.add('input--error');
    var help = wrap.querySelector('[data-ep-help]');
    if (help) {
      help.textContent = message;
      help.setAttribute('role', 'alert');
    }
    var control = wrap.querySelector('.input__control');
    if (control) control.setAttribute('aria-invalid', 'true');
  }

  function clearErrors() {
    Array.prototype.forEach.call(overlay.querySelectorAll('[data-ep-field]'), function (wrap) {
      wrap.classList.remove('input--error');
      var help = wrap.querySelector('[data-ep-help]');
      if (help) {
        help.textContent = help.getAttribute('data-ep-help-original') || '';
        help.removeAttribute('role');
      }
      var control = wrap.querySelector('.input__control');
      if (control) control.removeAttribute('aria-invalid');
    });
  }

  function open(card, trigger) {
    if (isOpen()) return;
    editingCard = card;
    returnFocusTo = trigger || document.activeElement;
    clearErrors();

    /* Pre-fill from the card. The name is the select button's text — RoomCard renders it as a
     * button so the whole card is a select target, so `.room-card__select` IS the plan name.
     *
     * RoomCard has nowhere to DISPLAY the room (it shows tables, seats and a progress bar), so the
     * room is stashed on the card in `data-ep-room` when saved and read back here. Without that the
     * field would open blank every time and silently discard whatever was typed last — the existing
     * prototype (`seating-edit-plan` in the handover manifest) updates the room on save, so
     * dropping it here would have been a regression against documented behaviour, not a
     * simplification. First open falls back to the placeholder, which is correct: no room is set. */
    var nameEl = card && card.querySelector('.room-card__select');
    if (nameInput) nameInput.value = nameEl ? nameEl.textContent.trim() : '';
    if (roomInput) roomInput.value = (card && card.getAttribute('data-ep-room')) || '';

    overlay.classList.add(OPEN_CLASS);
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    if (nameInput) nameInput.focus();
    else dialog.focus();
  }

  function close() {
    if (!isOpen()) return;
    overlay.classList.remove(OPEN_CLASS);
    Array.prototype.forEach.call(document.querySelectorAll('[data-ep-open]'), function (b) {
      b.setAttribute('aria-expanded', 'false');
    });
    /* Reject `<body>` as a focus target, and a trigger that has since left the DOM — the same
     * guard the picker and create-plan use. */
    var target = (returnFocusTo && returnFocusTo !== document.body && returnFocusTo.isConnected)
      ? returnFocusTo
      : dialog;
    returnFocusTo = null;
    editingCard = null;
    target.focus();
  }

  /* Delegated, because a room card can be added after load. Scoped to `[data-ep-open]` and NOT to
   * the pencil icon or the aria-label: `createIcons()` replaces the <i data-lucide> with an <svg>,
   * so an icon-attribute selector stops matching after init, and `aria-label^="Edit"` would catch
   * all twelve TableCard pencils on this screen too. */
  document.addEventListener('click', function (event) {
    var btn = event.target.closest ? event.target.closest('[data-ep-open]') : null;
    if (!btn) return;
    event.preventDefault();
    open(btn.closest('.room-card'), btn);
  });

  Array.prototype.forEach.call(overlay.querySelectorAll('[data-ep-close]'), function (btn) {
    btn.addEventListener('click', close);
  });

  overlay.addEventListener('click', function (event) {
    if (event.target === overlay) close();
  });

  overlay.addEventListener('keydown', function (event) {
    if (!isOpen()) return;
    if (event.key === 'Escape') { close(); return; }
    if (event.key !== 'Tab') return;

    var items = focusable();
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1], active = document.activeElement;

    if (event.shiftKey && (active === first || !dialog.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  });

  if (helpToggle) {
    helpToggle.addEventListener('click', function () {
      /* Toggle.js owns the switch's own flip and has already updated aria-checked by the time this
       * runs, so read it rather than tracking a second copy of the state. */
      var on = helpToggle.getAttribute('aria-checked') === 'true';
      form.classList.toggle('edit-plan__form--help', on);
    });
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      clearErrors();

      var name = nameInput ? nameInput.value.trim() : '';
      var room = roomInput ? roomInput.value.trim() : '';
      var ok = true;

      if (!name) { setError('name', 'Plan name is required.'); ok = false; }
      if (!room) { setError('room', 'Room or location is required.'); ok = false; }
      if (!ok) {
        var firstBad = overlay.querySelector('.input--error .input__control');
        if (firstBad) firstBad.focus();
        return;
      }

      /* TODO(backend:SeatingPlanner): DOM-only — this renames the card and nothing else. The plan
       * record it should PATCH is tracked on seating-room-list; the room/location has nowhere to be
       * stored client-side at all, which is why it is not written back here. */
      if (editingCard) {
        var wasSelected = editingCard.classList.contains('room-card--selected');
        var nameEl = editingCard.querySelector('.room-card__select');
        var previousName = nameEl ? nameEl.textContent.trim() : '';
        if (nameEl) nameEl.textContent = name;
        editingCard.setAttribute('data-ep-room', room);

        /* The edit and delete buttons name the plan in their aria-labels, so a rename has to carry
         * to them or the accessible names go stale and point at the old plan. */
        Array.prototype.forEach.call(editingCard.querySelectorAll('[aria-label]'), function (el) {
          var label = el.getAttribute('aria-label');
          if (/^Edit /.test(label)) el.setAttribute('aria-label', 'Edit ' + name);
          if (/^Delete /.test(label)) el.setAttribute('aria-label', 'Delete ' + name);
        });

        /* The toolbar names the ACTIVE plan, so renaming the selected card has to update it too —
         * otherwise the header and the card disagree about what the same plan is called. Guarded on
         * `--selected` so renaming a card that is not active leaves the toolbar alone, and matched
         * on the previous name so a stale label is never overwritten with the wrong plan's. */
        if (wasSelected) {
          var toolbarName = document.querySelector('.seating-header__room-name');
          if (toolbarName && toolbarName.textContent.trim() === previousName) {
            toolbarName.textContent = name;
          }
        }
      }

      close();
    });
  }
})();

/* ── Delete Plan ───────────────────────────────────────────────────────────────────────────
 * Figma 3515:176990 (desktop) / 3515:227162 (mobile). Deliberately parallel in shape to the
 * editPlan IIFE above — same open/close contract, same focus trap — so a change to one is easy to
 * mirror. What it does NOT share is a form: nothing is being edited, so there is no validation,
 * no help toggle, and Cancel is the safe default that focus opens on.
 */
(function () {
  'use strict';

  if (window.__deletePlanReady) return;
  window.__deletePlanReady = true;

  var OPEN_CLASS = 'modal-overlay--open';
  var FOCUSABLE = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  var overlay = document.querySelector('[data-delete-plan]');
  if (!overlay) return;

  var dialog = overlay.querySelector('[role="alertdialog"]');
  var nameEl = overlay.querySelector('[data-dp-name]');
  var consequenceEl = overlay.querySelector('[data-dp-consequence]');
  var cancelBtn = overlay.querySelector('.btn--secondary[data-dp-close]');
  var returnFocusTo = null;
  var deletingCard = null;

  function isOpen() { return overlay.classList.contains(OPEN_CLASS); }

  function focusable() {
    return Array.prototype.filter.call(
      dialog.querySelectorAll(FOCUSABLE),
      function (el) { return el.offsetParent !== null; }
    );
  }

  function plural(n, one, many) { return n === 1 ? one : many; }

  /* Counts come off the card, which renders them as "12 tables · 0/148 seated" — so the seated
   * figure is the NUMERATOR of that fraction, not the whole of it, and 148 is capacity. Parsed by
   * regex rather than by splitting on the separator: the middle dot is a presentation choice and
   * `.room-card__seated` is a span the markup can drop, so anything positional would break the
   * moment RoomCard restyles. A count that will not parse yields null and is treated as unknown
   * below rather than as zero — silently claiming "0 tables" about a plan that has some is exactly
   * the understatement seating-delete-plan warns about. */
  function readCounts(card) {
    var el = card && card.querySelector('.room-card__counts');
    var text = el ? el.textContent : '';
    var tables = /(\d+)\s+tables?\b/i.exec(text);
    var seated = /(\d+)\s*\/\s*(\d+)/.exec(text);
    return {
      tables: tables ? parseInt(tables[1], 10) : null,
      seated: seated ? parseInt(seated[1], 10) : null
    };
  }

  /* The consequence line is DATA-DRIVEN, which is the documented behaviour for this dialog: the
   * people clause is dropped entirely when nobody is seated, rather than rendering "and 0 seated
   * people returned to Unassigned" — a consequence that would not happen. Figma draws the full
   * form (30 tables / 240 people) because that is the state its frame shows; this screen's single
   * plan is 12 tables with 0 seated, so it correctly renders the short form. */
  function buildConsequence(counts) {
    var frag = document.createDocumentFragment();
    if (counts.tables === null) {
      frag.appendChild(document.createTextNode(
        'Its tables will be removed and any seated people returned to Unassigned.'));
      return frag;
    }

    var tablesStrong = document.createElement('strong');
    tablesStrong.textContent = String(counts.tables);

    frag.appendChild(document.createTextNode('Its '));
    frag.appendChild(tablesStrong);
    frag.appendChild(document.createTextNode(
      ' ' + plural(counts.tables, 'table', 'tables') +
      ' will be removed'));

    if (counts.seated) {
      var seatedStrong = document.createElement('strong');
      seatedStrong.textContent = String(counts.seated);
      frag.appendChild(document.createTextNode(' and '));
      frag.appendChild(seatedStrong);
      frag.appendChild(document.createTextNode(
        ' seated ' + plural(counts.seated, 'person', 'people') + ' returned to Unassigned'));
    }

    frag.appendChild(document.createTextNode('.'));
    return frag;
  }

  function open(card, trigger) {
    if (isOpen()) return;
    deletingCard = card;
    returnFocusTo = trigger || document.activeElement;

    var selectEl = card && card.querySelector('.room-card__select');
    if (nameEl) nameEl.textContent = selectEl ? selectEl.textContent.trim() : 'this plan';
    if (consequenceEl) {
      consequenceEl.textContent = '';
      consequenceEl.appendChild(buildConsequence(readCounts(card)));
    }

    overlay.classList.add(OPEN_CLASS);
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    /* Cancel, not Delete. The destructive control should never be one Enter away from a dialog
     * that has only just appeared. */
    if (cancelBtn) cancelBtn.focus();
    else dialog.focus();
  }

  function close(focusTarget) {
    if (!isOpen()) return;
    overlay.classList.remove(OPEN_CLASS);
    Array.prototype.forEach.call(document.querySelectorAll('[data-dp-open]'), function (b) {
      b.setAttribute('aria-expanded', 'false');
    });

    /* On CANCEL the trigger is still there and gets focus back. On CONFIRM it has just been
     * deleted along with its card, so the caller passes somewhere to land instead — leaving focus
     * on a removed node drops it to <body> and loses the keyboard user's place entirely. */
    var target = focusTarget ||
      ((returnFocusTo && returnFocusTo !== document.body && returnFocusTo.isConnected)
        ? returnFocusTo
        : dialog);
    returnFocusTo = null;
    deletingCard = null;
    if (target) target.focus();
  }

  /* Delegated for the same reason as edit: a room card can be added after load. */
  document.addEventListener('click', function (event) {
    var btn = event.target.closest ? event.target.closest('[data-dp-open]') : null;
    if (!btn) return;
    event.preventDefault();
    open(btn.closest('.room-card'), btn);
  });

  Array.prototype.forEach.call(overlay.querySelectorAll('[data-dp-close]'), function (btn) {
    btn.addEventListener('click', function () { close(); });
  });

  overlay.addEventListener('click', function (event) {
    if (event.target === overlay) close();
  });

  overlay.addEventListener('keydown', function (event) {
    if (!isOpen()) return;
    if (event.key === 'Escape') { close(); return; }
    if (event.key !== 'Tab') return;

    var items = focusable();
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1], active = document.activeElement;

    if (event.shiftKey && (active === first || !dialog.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  });

  var confirmBtn = overlay.querySelector('[data-dp-confirm]');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', function () {
      var card = deletingCard;
      if (!card) { close(); return; }

      var wasSelected = card.classList.contains('room-card--selected');
      var rooms = card.parentNode;
      card.parentNode.removeChild(card);

      /* TODO(backend:SeatingPlanner): DOM-only. This removes the card, and the open plan's table
       * cards with it — see seating-delete-plan for the single transaction that must delete the
       * SeatingPlan plus its Table and TableSeat rows and return the occupants to the event pool.
       *
       * The tables are cleared only when the deleted plan was the SELECTED one, because the
       * listing shows the selected plan's tables and nothing else: deleting a background plan must
       * leave the visible list alone. */
      if (wasSelected) {
        var listing = document.querySelector('[data-sp-grid], .table-listing__grid');
        if (listing) {
          Array.prototype.forEach.call(listing.querySelectorAll('.table-card'), function (t) {
            t.parentNode.removeChild(t);
          });
        }
      }

      /* Land focus on the next surviving plan, or on the plans region itself when the last one has
       * gone. `tabindex="-1"` is set here rather than in the markup so the container never becomes
       * a Tab stop — it only needs to be focusABLE, not focusable by keyboard traversal. */
      var next = rooms ? rooms.querySelector('.room-card__select') : null;
      if (!next && rooms) {
        rooms.setAttribute('tabindex', '-1');
        next = rooms;
      }

      /* TODO(backend:SeatingPlanner): deleting the LAST plan should restore the "No plans yet"
       * hint and fold the workspace away — behaviour the prototype has (newplan-no-plans.html) but
       * which has no Figma frame for THIS template, so it is deliberately not invented here. The
       * screen currently just empties. Tracked on seating-delete-plan. */
      close(next);
    });
  }
})();

/* ── Table form (Edit table) ───────────────────────────────────────────────────────────────
 * Figma 3515:178044 desktop / 3515:227256 mobile, plus the sponsor-lookup, reduced-capacity and
 * help-on states. Same open/close/focus-trap contract as editPlan and deletePlan above.
 *
 * Edit only — there is no New mode here (designer, 2026-08-29). The toolbar's Add Table button
 * stays unwired; see seating-table-form.
 */
(function () {
  'use strict';

  if (window.__tableFormReady) return;
  window.__tableFormReady = true;

  var OPEN_CLASS = 'modal-overlay--open';
  var FOCUSABLE = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  var overlay = document.querySelector('[data-table-form]');
  if (!overlay) return;

  var dialog = overlay.querySelector('[role="dialog"]');
  var form = overlay.querySelector('#table-form-form');
  var helpToggle = overlay.querySelector('#tf-help-toggle');
  var nameInput = overlay.querySelector('#tf-name');
  var seatsInput = overlay.querySelector('#tf-seats');
  var hostInput = overlay.querySelector('#tf-host');
  var tierValue = overlay.querySelector('#tf-tier .sel__value');
  var shapeValue = overlay.querySelector('#tf-shape .sel__value');
  var sponsorValue = overlay.querySelector('[data-tf-sponsor-value]');
  var sponsorSearch = overlay.querySelector('[data-tf-sponsor-search]');
  var sponsorList = overlay.querySelector('[data-tf-sponsor-list]');
  var warning = overlay.querySelector('[data-tf-warning]');
  var warningText = overlay.querySelector('[data-tf-warning-text]');

  var titleEl = overlay.querySelector('#table-form-title');
  var returnFocusTo = null;
  var editingCard = null;
  /* 'edit' or 'add'. Add Table is the SAME modal — desktop Add (Figma 1:11787) is
   * structurally identical to desktop Edit down to the 462 grid, the 88px tier field with
   * its action row and the 73px footer, so a second dialog would only be a copy that drifts. */
  var mode = 'edit';
  /* The seated count at OPEN time. The warning compares against this rather than re-reading the
   * card, because the card is not rewritten until Save — re-reading mid-edit would compare the
   * typed capacity against itself once a first save had happened. */
  var seatedAtOpen = 0;
  /* Capacity at open, so the plan total can move by the DELTA. Recomputing the plan from the
   * 12 cards would be more correct but is the server's job — see seating-table-form. */
  var counts0 = { seated: 0, capacity: 0 };

  function isOpen() { return overlay.classList.contains(OPEN_CLASS); }

  function focusable() {
    return Array.prototype.filter.call(
      dialog.querySelectorAll(FOCUSABLE),
      function (el) { return el.offsetParent !== null; }
    );
  }

  function field(name) { return overlay.querySelector('[data-tf-field="' + name + '"]'); }

  Array.prototype.forEach.call(overlay.querySelectorAll('[data-tf-help]'), function (help) {
    help.setAttribute('data-tf-help-original', help.textContent.trim());
  });

  function setError(name, message) {
    var wrap = field(name);
    if (!wrap) return;
    wrap.classList.add('input--error');
    var help = wrap.querySelector('[data-tf-help]');
    if (help) { help.textContent = message; help.setAttribute('role', 'alert'); }
    var control = wrap.querySelector('.input__control');
    if (control) control.setAttribute('aria-invalid', 'true');
  }

  function clearErrors() {
    Array.prototype.forEach.call(overlay.querySelectorAll('[data-tf-field]'), function (wrap) {
      wrap.classList.remove('input--error');
      var help = wrap.querySelector('[data-tf-help]');
      if (help) {
        help.textContent = help.getAttribute('data-tf-help-original') || '';
        help.removeAttribute('role');
      }
      var control = wrap.querySelector('.input__control');
      if (control) control.removeAttribute('aria-invalid');
    });
  }

  /* "0 / 10 seated" -> { seated: 0, capacity: 10 }. Regex rather than a split, for the same
   * reason as deletePlan: the separator and the trailing word are presentation. */
  function readCounts(card) {
    var el = card && card.querySelector('.table-card__count');
    var m = el ? /(\d+)\s*\/\s*(\d+)/.exec(el.textContent) : null;
    return m ? { seated: parseInt(m[1], 10), capacity: parseInt(m[2], 10) }
             : { seated: 0, capacity: 0 };
  }

  function plural(n, one, many) { return n === 1 ? one : many; }

  /* Live, and non-blocking: Save stays enabled and the people really are returned (designer,
   * 2026-08-29). Consistent with the other three return paths already documented on
   * seating-unassigned-tray. */
  function syncWarning() {
    if (!warning || !seatsInput) return;
    var next = parseInt(seatsInput.value, 10);
    var removed = (isFinite(next) && seatedAtOpen > next) ? seatedAtOpen - next : 0;
    if (!removed) { warning.hidden = true; return; }
    warningText.textContent =
      removed + ' ' + plural(removed, 'person', 'people') + ' will be returned to Unassigned — ' +
      'the last ' + removed + ' ' + plural(removed, 'seat', 'seats') + ' of ' + seatedAtOpen + ' seated.';
    warning.hidden = false;
  }

  /* max(existing) + 1, deliberately NOT count + 1: table numbers are never resequenced after a
   * delete, so gaps are expected and a count-based number would collide with a survivor. That
   * rule is already recorded on seating-delete-table. */
  function nextTableNumber() {
    var max = 0;
    Array.prototype.forEach.call(document.querySelectorAll('.table-card__select'), function (el) {
      var m = /(\d+)/.exec(el.textContent || '');
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    /* Also consider the stable ids, not just the visible names. A card renamed to something with
     * no digits ("Headline Sponsors") drops out of the name scan, so name-only numbering handed
     * out an id that a renamed card was already using — measured: adding two tables produced two
     * cards both claiming data-sp-table="14". */
    Array.prototype.forEach.call(document.querySelectorAll('[data-sp-table]'), function (el) {
      var v = parseInt(el.getAttribute('data-sp-table'), 10);
      if (isFinite(v)) max = Math.max(max, v);
    });
    return max + 1;
  }

  /* Defaults read off the Add frames, not carried across from Edit: tier Standard, sponsor
   * placeholder, host empty, seats 10, shape Round — and the name field EMPTY behind a "Table N"
   * placeholder, because the frame draws that number in placeholder grey rather than as a filled
   * value. It is a suggestion, not something pre-committed on the user's behalf. */
  function resetFields() {
    var n = nextTableNumber();
    if (nameInput) { nameInput.value = ''; nameInput.placeholder = 'Table ' + n; }
    if (seatsInput) seatsInput.value = '10';
    if (hostInput) hostInput.value = '';
    if (tierValue) tierValue.textContent = 'Standard';
    if (shapeValue) shapeValue.textContent = 'Round';
    if (sponsorValue) sponsorValue.textContent = 'Search Accounts\u2026';
  }

  function openAdd(trigger) {
    if (isOpen()) return;
    mode = 'add';
    editingCard = null;
    returnFocusTo = trigger || document.activeElement;
    clearErrors();
    resetFields();
    /* Nobody is seated at a table that does not exist yet, so the reduced-capacity warning can
     * never apply here — and these two keep it that way rather than relying on it. */
    seatedAtOpen = 0;
    counts0 = { seated: 0, capacity: 0 };
    if (warning) warning.hidden = true;
    if (titleEl) titleEl.textContent = 'Add Table';

    overlay.classList.add(OPEN_CLASS);
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    if (nameInput) nameInput.focus();
    else dialog.focus();
  }

  function open(card, trigger) {
    mode = 'edit';
    /* "Edit table" and "Add Table" — Figma capitalises the two titles differently and both are
     * reproduced rather than harmonised, the same call already made for the Delete Plan dialog's
     * "Delete plan" heading against its "Delete Plan" button. */
    if (titleEl) titleEl.textContent = 'Edit table';
    if (isOpen()) return;
    editingCard = card;
    returnFocusTo = trigger || document.activeElement;
    clearErrors();

    var nameEl = card && card.querySelector('.table-card__select');
    var counts = readCounts(card);
    seatedAtOpen = counts.seated;
    counts0 = counts;

    if (nameInput) nameInput.value = nameEl ? nameEl.textContent.trim() : '';
    if (seatsInput) seatsInput.value = counts.capacity || '';
    /* Tier, sponsor, host and shape have nowhere to live on the card in this template — it
     * renders no tier chip (Figma hides the TableType instance) and no sponsor line — so they
     * round-trip on the card's own dataset, the same trick edit-plan uses for the room. First
     * open falls back to the defaults, which is correct: nothing is set. */
    if (hostInput) hostInput.value = (card && card.getAttribute('data-tf-host')) || '';
    if (tierValue) tierValue.textContent = (card && card.getAttribute('data-tf-tier')) || 'Standard';
    if (shapeValue) shapeValue.textContent = (card && card.getAttribute('data-tf-shape')) || 'Round';
    if (sponsorValue) sponsorValue.textContent = (card && card.getAttribute('data-tf-sponsor')) || 'Search Accounts…';

    if (warning) warning.hidden = true;

    overlay.classList.add(OPEN_CLASS);
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    if (nameInput) nameInput.focus();
    else dialog.focus();
  }

  function close() {
    if (!isOpen()) return;
    overlay.classList.remove(OPEN_CLASS);
    Array.prototype.forEach.call(document.querySelectorAll('[data-tf-open]'), function (b) {
      b.setAttribute('aria-expanded', 'false');
    });
    var target = (returnFocusTo && returnFocusTo !== document.body && returnFocusTo.isConnected)
      ? returnFocusTo
      : dialog;
    returnFocusTo = null;
    editingCard = null;
    target.focus();
  }

  document.addEventListener('click', function (event) {
    var btn = event.target.closest ? event.target.closest('[data-tf-open]') : null;
    if (!btn) return;
    event.preventDefault();
    open(btn.closest('.table-card'), btn);
  });

  /* The toolbar's Add Table button, which had no handler at all until now. */
  var addBtn = document.querySelector('[data-tf-add]');
  if (addBtn) {
    addBtn.addEventListener('click', function (event) {
      event.preventDefault();
      openAdd(addBtn);
    });
  }

  Array.prototype.forEach.call(overlay.querySelectorAll('[data-tf-close]'), function (btn) {
    btn.addEventListener('click', close);
  });

  overlay.addEventListener('click', function (event) {
    if (event.target === overlay) close();
  });

  overlay.addEventListener('keydown', function (event) {
    if (!isOpen()) return;
    if (event.key === 'Escape') { close(); return; }
    if (event.key !== 'Tab') return;

    var items = focusable();
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1], active = document.activeElement;

    if (event.shiftKey && (active === first || !dialog.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  });

  if (helpToggle) {
    helpToggle.addEventListener('click', function () {
      var on = helpToggle.getAttribute('aria-checked') === 'true';
      form.classList.toggle('table-form__form--help', on);
    });
  }

  if (seatsInput) seatsInput.addEventListener('input', syncWarning);

  /* Sponsor lookup. Dropdown.js owns opening the panel and closing it on outside-click; this
   * only adds the two things that are specific to an account picker — filtering, and committing
   * the clicked account back onto the trigger. */
  if (sponsorSearch && sponsorList) {
    sponsorSearch.addEventListener('input', function () {
      var q = sponsorSearch.value.trim().toLowerCase();
      Array.prototype.forEach.call(sponsorList.querySelectorAll('li'), function (li) {
        var label = (li.textContent || '').trim().toLowerCase();
        li.hidden = q ? label.indexOf(q) === -1 : false;
      });
    });
  }

  if (sponsorList) {
    sponsorList.addEventListener('click', function (event) {
      var item = event.target.closest ? event.target.closest('.dropdown-item') : null;
      if (!item || !sponsorValue) return;
      sponsorValue.textContent = item.textContent.trim();
    });
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      clearErrors();

      var name = nameInput ? nameInput.value.trim() : '';
      var seats = seatsInput ? parseInt(seatsInput.value, 10) : NaN;
      var ok = true;

      /* In ADD mode an empty name adopts the placeholder. Figma draws "Table 13" in placeholder
       * grey rather than as a filled value, so it is a suggestion — and a suggestion the user has
       * to retype before Save will accept it is not a suggestion. Renaming an EXISTING table to
       * nothing is still refused. */
      if (!name && mode === 'add') name = nameInput ? nameInput.placeholder : '';
      if (!name) { setError('name', 'Table name is required.'); ok = false; }
      if (!isFinite(seats) || seats < 1) { setError('seats', 'Enter a number of seats.'); ok = false; }
      if (!ok) {
        var firstBad = overlay.querySelector('.input--error .input__control');
        if (firstBad) firstBad.focus();
        return;
      }

      /* TODO(backend:SeatingPlanner): DOM-only — see seating-table-form for the Table record this
       * should PATCH (or POST, in add mode), and seating-unassigned-tray for where the returned
       * occupants belong. */
      /* Seated after the change. Hoisted above BOTH branches because the plan totals below need
       * it either way — left inside the edit branch it was `undefined` in add mode, which made
       * the plan read "13 tables · NaN/158". In add mode it is simply 0. */
      var seated = Math.min(seatedAtOpen, seats);

      /* SNAPSHOT, taken before anything is mutated, so the toast's Undo can put it all back.
       *
       * Snapshotting HTML and restoring it is deliberate over replaying inverse operations: the
       * save touches the card's name, count, five bar segments, five legend entries, four dataset
       * attributes, the seat panel's rows and the plan totals, and an inverse of each is far more
       * to get wrong than one `outerHTML` round-trip. It is only safe because BOTH handlers that
       * act on a card are delegated — selection on the grid via `.table-card__select`, editing on
       * the document via `[data-tf-open]` — so replacing the element keeps it live. */
      var planEl = document.querySelector('.room-card__counts');
      var freeEl = document.querySelector('.room-card__free');
      var detailNameEl = document.querySelector('[data-sp-detail-name]');
      var detailCountEl = document.querySelector('[data-sp-detail-count]');
      var seatsEl = document.querySelector('.table-detail__seats');
      var selectedEl = document.querySelector('.table-card--selected');
      var previousName = '';
      if (editingCard) {
        var prevNameEl = editingCard.querySelector('.table-card__select');
        previousName = prevNameEl ? prevNameEl.textContent.trim() : '';
      }
      var snap = {
        cardId: editingCard ? editingCard.getAttribute('data-sp-table') : null,
        cardHTML: editingCard ? editingCard.outerHTML : null,
        planHTML: planEl ? planEl.innerHTML : null,
        freeText: freeEl ? freeEl.textContent : null,
        detailName: detailNameEl ? detailNameEl.textContent : null,
        detailCount: detailCountEl ? detailCountEl.textContent : null,
        seatsHTML: seatsEl ? seatsEl.innerHTML : null,
        selectedId: selectedEl ? selectedEl.getAttribute('data-sp-table') : null
      };
      var createdCard = null;

      if (mode === 'add') {
        var grid = document.querySelector('[data-sp-grid], .table-listing__grid');
        if (grid) {
          var num = nextTableNumber();
          var card = document.createElement('article');
          card.className = 'table-card';
          card.setAttribute('data-sp-card', '');
          card.setAttribute('data-sp-table', String(num));
          /* Emitted WITH the --empty modifiers on the segment and the legend entry. The twelve
           * cards in the markup shipped without them, which left the edit write-back's
           * `.table-card__seg--empty` lookup finding nothing on eleven of them — so a new card
           * must not reintroduce the same shape. TableCard's own demo is the reference. */
          card.innerHTML =
            '<div class="table-card__header">' +
              '<div class="table-card__titles">' +
                '<h3 class="table-card__name">' +
                  '<button type="button" class="table-card__select"></button>' +
                '</h3>' +
              '</div>' +
            '</div>' +
            '<hr class="table-card__rule">' +
            '<div class="table-card__viz">' +
              '<div class="table-card__bar" aria-hidden="true">' +
                '<span class="table-card__seg table-card__seg--empty"></span>' +
              '</div>' +
              '<div class="table-card__legend">' +
                '<span class="table-card__legend-item table-card__legend-item--empty">' +
                  '<span class="table-card__swatch"></span>' +
                '</span>' +
              '</div>' +
            '</div>' +
            '<hr class="table-card__rule">' +
            '<div class="table-card__footer">' +
              '<div class="table-card__count-group">' +
                '<p class="table-card__count"></p>' +
              '</div>' +
              '<div class="table-card__actions">' +
                '<button type="button" class="btn btn--secondary btn--icon btn--2xs" data-tf-open>' +
                  '<i data-lucide="pencil" aria-hidden="true"></i>' +
                '</button>' +
                '<button type="button" class="btn btn--secondary btn--icon btn--2xs" data-dtb-open>' +
                  '<i data-lucide="trash" aria-hidden="true"></i>' +
                '</button>' +
              '</div>' +
            '</div>';

          /* Text and counts set as text, not interpolated into the HTML above — a user-supplied
           * table name goes through textContent so a name containing markup cannot inject it. */
          card.querySelector('.table-card__select').textContent = name;
          card.querySelector('.table-card__count').textContent = '0 / ' + seats + ' seated';
          card.querySelector('.table-card__seg--empty').style.setProperty('--seg', String(seats));
          card.querySelector('.table-card__legend-item--empty')
              .appendChild(document.createTextNode('Empty (' + seats + ')'));
          card.querySelectorAll('.table-card__actions button')[0]
              .setAttribute('aria-label', 'Edit ' + name);
          card.querySelectorAll('.table-card__actions button')[1]
              .setAttribute('aria-label', 'Delete ' + name);

          card.setAttribute('data-tf-host', hostInput ? hostInput.value.trim() : '');
          if (tierValue) card.setAttribute('data-tf-tier', tierValue.textContent.trim());
          if (shapeValue) card.setAttribute('data-tf-shape', shapeValue.textContent.trim());
          if (sponsorValue) card.setAttribute('data-tf-sponsor', sponsorValue.textContent.trim());

          grid.appendChild(card);
          createdCard = card;
          /* The pencil ships as <i data-lucide>, and createIcons() has already run for the page —
           * without re-running it the new card's two icons stay as empty <i> elements. */
          if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
          }
          /* Both Add frames draw the NEW card selected with the seat panel switched to it, and
           * seating-main-layout already records "Add table opens the table it just created" as
           * the shell's behaviour. Driven by clicking the card's own select button rather than
           * by setting classes, so it goes through the one delegated selection path instead of a
           * second, drifting copy of it. */
          var sel = card.querySelector('.table-card__select');
          if (sel) sel.click();
        }
      }

      if (editingCard) {
        var nameEl = editingCard.querySelector('.table-card__select');
        if (nameEl) nameEl.textContent = name;

        var countEl = editingCard.querySelector('.table-card__count');
        if (countEl) countEl.textContent = seated + ' / ' + seats + ' seated';

        /* Empty seats are the segment that always moves when capacity does. Targeted by the
         * --empty MODIFIER, not by first-match: Table 1 carries five segments
         * (attendee/vip/speaker/sponsor/empty) since the occupants were seeded, and a bare
         * `.table-card__seg` selector picks the ATTENDEE one — which would silently corrupt the
         * bar on every save. Re-derived rather than nudged, per seating-plan-chip-summary. */
        var empty = seats - seated;
        var emptySeg = editingCard.querySelector('.table-card__seg--empty');
        if (emptySeg) emptySeg.style.setProperty('--seg', String(empty));
        var emptyLegend = editingCard.querySelector('.table-card__legend-item--empty');
        if (emptyLegend) emptyLegend.lastChild.textContent = 'Empty (' + empty + ')';

        /* If the capacity cut unseated people, take them off the role segments from the LAST one
         * backwards. Knowingly an approximation: the dialog promises "the last N seats" and seat
         * order is not role order, so only the server re-read that seating-table-form already
         * asks for gets this exactly right. */
        var toDrop = seatedAtOpen - seated;
        if (toDrop > 0) {
          Array.prototype.slice.call(
            editingCard.querySelectorAll('.table-card__seg:not(.table-card__seg--empty)')
          ).reverse().forEach(function (rs) {
            if (toDrop <= 0) return;
            var have = parseInt(rs.style.getPropertyValue('--seg'), 10) || 0;
            var take = Math.min(have, toDrop);
            rs.style.setProperty('--seg', String(have - take));
            toDrop -= take;
            var role = (String(rs.className).match(/table-card__seg--([a-z]+)/) || [])[1];
            var lg = role && editingCard.querySelector('.table-card__legend-item--' + role);
            if (lg && lg.lastChild) {
              lg.lastChild.textContent = lg.lastChild.textContent.replace(/\((\d+)\)/, '(' + (have - take) + ')');
            }
          });
        }

        /* The legend is DERIVED from the roles ACTUALLY seated — TableDetail's spec is explicit
         * that it is not stored, which is why Type=Default has no legend rather than an empty
         * one. So a role that drops to zero leaves the legend entirely instead of rendering
         * "Sponsor (0)", and its zero-width segment goes with it. */
        Array.prototype.forEach.call(editingCard.querySelectorAll('.table-card__seg'), function (g) {
          g.hidden = (parseInt(g.style.getPropertyValue('--seg'), 10) || 0) === 0;
        });
        Array.prototype.forEach.call(editingCard.querySelectorAll('.table-card__legend-item'), function (l) {
          var m = /\((\d+)\)/.exec(l.textContent);
          l.hidden = !!m && parseInt(m[1], 10) === 0;
        });

        /* Keep the rest of the screen honest. These were all zero before the occupants were
         * seeded, so any drift was invisible; now it is not. */
        if (editingCard.classList.contains('table-card--selected')) {
          var detailCount = document.querySelector('[data-sp-detail-count]');
          if (detailCount) detailCount.textContent = seated + ' / ' + seats + ' seated';

          /* Seat rows follow the capacity — EVERY row past it goes, occupied ones included.
           * Dropping only the empties was the first cut and it was wrong: the dialog has just
           * promised that the last N people are returned to Unassigned, so leaving their rows
           * in a table that no longer has those seats contradicts the sentence the user just
           * agreed to. Removing by seat NUMBER is also what makes "the last N seats" literal
           * here, rather than the role-order approximation the bar segments have to settle for. */
          var seatList = document.querySelector('.table-detail__seats');
          if (seatList) {
            Array.prototype.forEach.call(
              seatList.querySelectorAll('.attendee-card'), function (row) {
                var n = parseInt((row.querySelector('.attendee-card__seat') || {}).textContent, 10);
                if (n > seats) row.parentNode.removeChild(row);
              });
            var present = seatList.querySelectorAll('.attendee-card').length;
            for (var n = present + 1; n <= seats; n++) {
              var row = document.createElement('article');
              row.className = 'attendee-card attendee-card--empty';
              row.innerHTML =
                '<span class="attendee-card__accent" aria-hidden="true"><span class="attendee-card__accent-bar"></span></span>' +
                '<span class="attendee-card__seat">' + n + '</span>' +
                '<p class="attendee-card__empty-label">Empty seat</p>' +
                '<button type="button" class="btn btn--secondary btn--sm">Assign</button>';
              seatList.appendChild(row);
            }
          }
        }

        Array.prototype.forEach.call(editingCard.querySelectorAll('[aria-label]'), function (el) {
          var label = el.getAttribute('aria-label');
          if (/^Edit /.test(label)) el.setAttribute('aria-label', 'Edit ' + name);
          if (/^Delete /.test(label)) el.setAttribute('aria-label', 'Delete ' + name);
        });

        /* Round-tripped on the card because the card renders none of these. */
        editingCard.setAttribute('data-tf-host', hostInput ? hostInput.value.trim() : '');
        if (tierValue) editingCard.setAttribute('data-tf-tier', tierValue.textContent.trim());
        if (shapeValue) editingCard.setAttribute('data-tf-shape', shapeValue.textContent.trim());
        if (sponsorValue) editingCard.setAttribute('data-tf-sponsor', sponsorValue.textContent.trim());
      }


      /* The plan totals, for BOTH modes. This used to sit inside the edit branch, so adding a
       * table left the plan still claiming the old table count and the old capacity.
       *
       * Moves by DELTA rather than recomputing from the cards: `counts0.capacity` is 0 in add
       * mode, so the whole new capacity is added, and the table count gains one only when a table
       * was actually created. Recomputing from the twelve cards would be sturdier and is the
       * server's job — seating-table-form already asks for that re-read. */
      var planCounts = document.querySelector('.room-card__counts');
      if (planCounts) {
        planCounts.innerHTML = planCounts.innerHTML.replace(
          /(\d+)\s*tables\s*·\s*(\d+)\/(\d+)/,
          function (_m, t, planSeated, planCap) {
            var nextTables = parseInt(t, 10) + (mode === 'add' ? 1 : 0);
            var nextCap = parseInt(planCap, 10) + (seats - counts0.capacity);
            var nextSeated = parseInt(planSeated, 10) - (seatedAtOpen - seated);
            var free = document.querySelector('.room-card__free');
            if (free) free.textContent = (nextCap - nextSeated) + ' seats free';
            return nextTables + ' tables · ' + nextSeated + '/' + nextCap;
          });
      }


      /* ── Toast ──────────────────────────────────────────────────────────────────────────
       * Figma 1:6881 (add) and 1:6763 (edit). Both emphasise the SUBJECT and the OBJECT with a
       * plain verb phrase between, and the punctuation differs between them — the add copy ends
       * in a full stop inside the bold, the rename copy has none. Reproduced as drawn rather
       * than harmonised, the same call already made for the two modal headings.
       *
       * The third case is NOT drawn: an edit that changes capacity, tier, sponsor or host but
       * leaves the name alone. "renamed to" would be a lie there, so it reads "<name> updated"
       * (designer, 2026-09-09) — generic, but it only claims what actually happened. */
      var parts;
      if (mode === 'add') {
        var planNameEl = document.querySelector('.room-card--selected .room-card__select')
          || document.querySelector('.room-card__select');
        var planName = planNameEl ? planNameEl.textContent.trim() : 'this plan';
        parts = [
          { text: name + ' ', strong: true },
          { text: 'added to ' },
          { text: planName + '.', strong: true }
        ];
      } else if (previousName && previousName !== name) {
        parts = [
          { text: previousName + ' ', strong: true },
          { text: 'renamed to ' },
          { text: name, strong: true }
        ];
      } else {
        parts = [
          { text: name + ' ', strong: true },
          { text: 'updated' }
        ];
      }

      /* DOM-only reversal (designer, 2026-09-09). seating-toast is explicit that a real Undo
       * needs each action to hand back an operation id the toast posts back — "undo the last
       * change" is the wrong contract once two toasts can coexist — so this reverses only what
       * THIS save did, from the snapshot above, and the real contract stays flagged. */
      document.dispatchEvent(new CustomEvent('sp:toast', {
        detail: {
          parts: parts,
          undo: function () {
            if (createdCard && createdCard.parentNode) {
              createdCard.parentNode.removeChild(createdCard);
            }
            if (snap.cardHTML && snap.cardId) {
              var live = document.querySelector('.table-card[data-sp-table="' + snap.cardId + '"]');
              if (live) live.outerHTML = snap.cardHTML;
            }
            if (planEl && snap.planHTML !== null) planEl.innerHTML = snap.planHTML;
            if (freeEl && snap.freeText !== null) freeEl.textContent = snap.freeText;
            if (detailNameEl && snap.detailName !== null) detailNameEl.textContent = snap.detailName;
            if (detailCountEl && snap.detailCount !== null) detailCountEl.textContent = snap.detailCount;
            if (seatsEl && snap.seatsHTML !== null) seatsEl.innerHTML = snap.seatsHTML;

            /* Selection is restored by SETTING the class, not by clicking: a click would run the
             * selection handler, which rewrites the seat panel and would immediately undo the
             * panel restore two lines above. */
            Array.prototype.forEach.call(document.querySelectorAll('.table-card'), function (c) {
              c.classList.remove('table-card--selected');
            });
            if (snap.selectedId) {
              var prev = document.querySelector('.table-card[data-sp-table="' + snap.selectedId + '"]');
              if (prev) prev.classList.add('table-card--selected');
            }
            if (window.lucide && typeof window.lucide.createIcons === 'function') {
              window.lucide.createIcons();
            }
          }
        }
      }));

      close();
    });
  }
})();

/* ── Seating toast ─────────────────────────────────────────────────────────────────────────
 * Figma 1:6763 (table edited) / 1:6881 (table added), both raising SeatingToast Type=Success
 * with an Undo.
 *
 * The COMPONENT owns none of this on purpose — seating-toast records that it ships "no show/hide,
 * no auto-dismiss timer and no JS at all", and that who retires a toast was an open front-end
 * decision. This module is that decision, made with the designer 2026-09-09:
 *   - auto-dismiss after 8s
 *   - the timer PAUSES while the pointer is over the pill or focus is inside it, so Undo cannot
 *     time out from under someone reading the sentence or tabbing to the button (WCAG 2.2 SC 2.2.1
 *     is the reason seating-toast flagged this in the first place)
 *   - Esc dismisses
 *   - one toast at a time; a new one replaces the old
 *
 * Driven by a `sp:toast` CustomEvent rather than a function on `window`, so the raising code does
 * not need this module to have loaded first and nothing new lands on the global object.
 */
(function () {
  'use strict';

  if (window.__spToastReady) return;
  window.__spToastReady = true;

  var DISMISS_MS = 8000;

  var host = document.querySelector('[data-sp-toast-host]');
  if (!host) return;

  /* The live toast: { el, timer, undo }. Null when nothing is showing. */
  var current = null;

  function clear() {
    if (!current) return;
    if (current.timer) window.clearTimeout(current.timer);
    if (current.el && current.el.parentNode) current.el.parentNode.removeChild(current.el);
    current = null;
  }

  function pause() {
    if (current && current.timer) {
      window.clearTimeout(current.timer);
      current.timer = null;
    }
  }

  function resume() {
    if (!current) return;
    if (current.timer) window.clearTimeout(current.timer);
    current.timer = window.setTimeout(clear, DISMISS_MS);
  }

  /* SeatingToast's two Types, and which icon each one carries. Read off the frames rather than
   * assumed: the create and edit toasts (1:6881 / 1:6763) place `Icon/24px/BadgeCheck`, and the
   * DELETE toast (1:43089 / 1:44212) places `Icon/24px/TriangleAlert` with the error ring — a
   * removal is reported as a warning, not a success. */
  var TYPES = {
    success: { modifier: 'seating-toast--success', icon: 'badge-check' },
    error:   { modifier: 'seating-toast--error',   icon: 'triangle-alert' }
  };

  /* `parts` is an array of { text, strong } — the message is built as text nodes and <strong>
   * runs rather than from an HTML string, because a table name is user input. Figma emphasises
   * the subject AND the object ("**Table 13** added to **Main Ballroom.**"), which is why this
   * takes a list rather than a single bold term. */
  function show(parts, undo, type) {
    clear();

    var kind = TYPES[type] || TYPES.success;

    var el = document.createElement('div');
    el.className = 'seating-toast ' + kind.modifier;

    var icon = document.createElement('i');
    icon.className = 'seating-toast__icon';
    icon.setAttribute('data-lucide', kind.icon);
    icon.setAttribute('aria-hidden', 'true');
    el.appendChild(icon);

    var msg = document.createElement('p');
    msg.className = 'seating-toast__message';
    (parts || []).forEach(function (p) {
      if (!p || !p.text) return;
      if (p.strong) {
        var strong = document.createElement('strong');
        strong.textContent = p.text;
        msg.appendChild(strong);
      } else {
        msg.appendChild(document.createTextNode(p.text));
      }
    });
    el.appendChild(msg);

    if (typeof undo === 'function') {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn--secondary btn--xs seating-toast__cta';
      btn.textContent = 'Undo';
      btn.addEventListener('click', function () {
        /* Read the handler BEFORE clearing — clear() nulls `current`. */
        var fn = current && current.undo;
        clear();
        if (fn) fn();
      });
      el.appendChild(btn);
    }

    /* Bound on the PILL, not the host: `mouseenter` does not bubble, and the host is
     * `pointer-events: none` so it never becomes the target itself. */
    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', resume);
    el.addEventListener('focusin', pause);
    el.addEventListener('focusout', resume);

    host.appendChild(el);
    /* The icon ships as <i data-lucide> and createIcons() has already run for the page. */
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    current = { el: el, timer: null, undo: (typeof undo === 'function') ? undo : null };
    resume();
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && current) clear();
  });

  document.addEventListener('sp:toast', function (event) {
    var detail = event.detail || {};
    show(detail.parts, detail.undo, detail.type);
  });
})();

/* ── Delete table ──────────────────────────────────────────────────────────────────────────
 * Figma 1:12323 desktop / 1:44254 mobile. Deliberately parallel to the deletePlan IIFE above —
 * same open/close contract, same focus trap, same data-driven copy — so a change to one is easy
 * to mirror.
 */
(function () {
  'use strict';

  if (window.__deleteTableReady) return;
  window.__deleteTableReady = true;

  var OPEN_CLASS = 'modal-overlay--open';
  var FOCUSABLE = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  var overlay = document.querySelector('[data-delete-table]');
  if (!overlay) return;

  var dialog = overlay.querySelector('[role="alertdialog"]');
  var nameEl = overlay.querySelector('[data-dtb-name]');
  var consequenceEl = overlay.querySelector('[data-dtb-consequence]');
  var cancelBtn = overlay.querySelector('.btn--secondary[data-dtb-close]');
  var returnFocusTo = null;
  var deletingCard = null;

  function isOpen() { return overlay.classList.contains(OPEN_CLASS); }

  function focusable() {
    return Array.prototype.filter.call(
      dialog.querySelectorAll(FOCUSABLE),
      function (el) { return el.offsetParent !== null; }
    );
  }

  function plural(n, one, many) { return n === 1 ? one : many; }

  /* "6 / 10 seated" -> { seated: 6, capacity: 10 }. Regex rather than positional parsing, the
   * same reasoning as deletePlan: the separator and the trailing word are presentation. */
  function readCounts(card) {
    var el = card && card.querySelector('.table-card__count');
    var m = el ? /(\d+)\s*\/\s*(\d+)/.exec(el.textContent) : null;
    return m ? { seated: parseInt(m[1], 10), capacity: parseInt(m[2], 10) }
             : { seated: null, capacity: null };
  }

  /* Data-driven, and the empty case is the one Figma does not draw: with nobody seated it SAYS
   * so rather than rendering "0 seated people will be returned", which would promise a
   * consequence that never happens (designer, 2026-09-09 — and the documented behaviour for
   * seating-delete-table already said the dialog should say so rather than invent one).
   *
   * Note this differs from Delete Plan, which drops its people clause entirely when nobody is
   * seated. Deliberate: a plan with no one seated still loses its tables, so it has a
   * consequence left to state; an empty table has none, so the line has to carry the fact. */
  function buildConsequence(counts) {
    var frag = document.createDocumentFragment();

    if (counts.seated === null) {
      frag.appendChild(document.createTextNode(
        'Anyone seated at this table will be returned to the Unassigned pool.'));
      return frag;
    }
    if (counts.seated === 0) {
      frag.appendChild(document.createTextNode('No one is seated at this table.'));
      return frag;
    }

    var strong = document.createElement('strong');
    strong.textContent = String(counts.seated);
    frag.appendChild(strong);
    frag.appendChild(document.createTextNode(
      ' seated ' + plural(counts.seated, 'person', 'people') +
      ' will be returned to the Unassigned pool.'));
    return frag;
  }

  function open(card, trigger) {
    if (isOpen()) return;
    deletingCard = card;
    returnFocusTo = trigger || document.activeElement;

    var selectEl = card && card.querySelector('.table-card__select');
    if (nameEl) nameEl.textContent = selectEl ? selectEl.textContent.trim() : 'this table';
    if (consequenceEl) {
      consequenceEl.textContent = '';
      consequenceEl.appendChild(buildConsequence(readCounts(card)));
    }

    overlay.classList.add(OPEN_CLASS);
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    /* Cancel, not Delete — the destructive control should never be one Enter away from a dialog
     * that has only just appeared. */
    if (cancelBtn) cancelBtn.focus();
    else dialog.focus();
  }

  function close(focusTarget) {
    if (!isOpen()) return;
    overlay.classList.remove(OPEN_CLASS);
    Array.prototype.forEach.call(document.querySelectorAll('[data-dtb-open]'), function (b) {
      b.setAttribute('aria-expanded', 'false');
    });
    var target = focusTarget ||
      ((returnFocusTo && returnFocusTo !== document.body && returnFocusTo.isConnected)
        ? returnFocusTo
        : dialog);
    returnFocusTo = null;
    deletingCard = null;
    if (target) target.focus();
  }

  /* Delegated, so a table added by the Table form is deletable without re-binding. */
  document.addEventListener('click', function (event) {
    var btn = event.target.closest ? event.target.closest('[data-dtb-open]') : null;
    if (!btn) return;
    event.preventDefault();
    open(btn.closest('.table-card'), btn);
  });

  Array.prototype.forEach.call(overlay.querySelectorAll('[data-dtb-close]'), function (btn) {
    btn.addEventListener('click', function () { close(); });
  });

  overlay.addEventListener('click', function (event) {
    if (event.target === overlay) close();
  });

  overlay.addEventListener('keydown', function (event) {
    if (!isOpen()) return;
    if (event.key === 'Escape') { close(); return; }
    if (event.key !== 'Tab') return;

    var items = focusable();
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1], active = document.activeElement;

    if (event.shiftKey && (active === first || !dialog.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  });

  var confirmBtn = overlay.querySelector('[data-dtb-confirm]');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', function () {
      var card = deletingCard;
      if (!card) { close(); return; }

      var counts = readCounts(card);
      var wasSelected = card.classList.contains('table-card--selected');
      var grid = card.parentNode;

      /* Snapshot for the toast's Undo, taken before anything is removed. The NEXT SIBLING is part
       * of it: re-appending would drop a restored table at the end of the grid instead of back
       * where it was, and table order is how the user finds them. */
      var snap = {
        cardHTML: card.outerHTML,
        nextId: card.nextElementSibling
          ? card.nextElementSibling.getAttribute('data-sp-table')
          : null,
        wasSelected: wasSelected,
        planHTML: null,
        freeText: null,
        detailName: null,
        detailCount: null,
        seatsHTML: null
      };
      var planElSnap = document.querySelector('.room-card__counts');
      var freeElSnap = document.querySelector('.room-card__free');
      var detailNameSnap = document.querySelector('[data-sp-detail-name]');
      var detailCountSnap = document.querySelector('[data-sp-detail-count]');
      var seatsElSnap = document.querySelector('.table-detail__seats');
      if (planElSnap) snap.planHTML = planElSnap.innerHTML;
      if (freeElSnap) snap.freeText = freeElSnap.textContent;
      if (detailNameSnap) snap.detailName = detailNameSnap.textContent;
      if (detailCountSnap) snap.detailCount = detailCountSnap.textContent;
      if (seatsElSnap) snap.seatsHTML = seatsElSnap.innerHTML;

      var deletedName = (card.querySelector('.table-card__select') || {}).textContent;
      deletedName = deletedName ? deletedName.trim() : 'This table';

      /* TODO(backend:SeatingPlanner): DOM-only. seating-delete-table asks for the Table and its
       * TableSeat rows to go and the occupants to return to the pool in ONE transaction. */
      grid.removeChild(card);

      /* Plan totals move by this table's own numbers, and the table count drops by one. Same
       * delta approach — and same caveat — as the Table form: recomputing from the surviving
       * cards is sturdier and is the server's job. */
      var planCounts = document.querySelector('.room-card__counts');
      if (planCounts) {
        planCounts.innerHTML = planCounts.innerHTML.replace(
          /(\d+)\s*tables\s*·\s*(\d+)\/(\d+)/,
          function (_m, t, planSeated, planCap) {
            var nextTables = Math.max(0, parseInt(t, 10) - 1);
            var nextCap = parseInt(planCap, 10) - (counts.capacity || 0);
            var nextSeated = parseInt(planSeated, 10) - (counts.seated || 0);
            var free = document.querySelector('.room-card__free');
            if (free) free.textContent = (nextCap - nextSeated) + ' seats free';
            return nextTables + ' tables · ' + nextSeated + '/' + nextCap;
          });
      }

      /* If the deleted table was the OPEN one, the seat panel has to go somewhere: the next
       * surviving table, or empty when the plan has none left. That is the documented behaviour
       * for seating-delete-table. Moving it by clicking the next card's own select button keeps
       * this on the single delegated selection path rather than duplicating it. */
      var next = grid ? grid.querySelector('.table-card') : null;
      if (wasSelected) {
        if (next) {
          var sel = next.querySelector('.table-card__select');
          if (sel) sel.click();
        } else {
          var detailName = document.querySelector('[data-sp-detail-name]');
          var detailCount = document.querySelector('[data-sp-detail-count]');
          var seatList = document.querySelector('.table-detail__seats');
          if (detailName) detailName.textContent = 'No table selected';
          if (detailCount) detailCount.textContent = '';
          if (seatList) seatList.innerHTML = '';
        }
      }

      /* Land focus on a surviving table's own delete button where there is one, so a keyboard
       * user stays in the list rather than being dropped to <body> with the card gone. */
      var focusNext = next ? (next.querySelector('[data-dtb-open]') || next.querySelector('.table-card__select')) : null;
      if (!focusNext) {
        var addBtn = document.querySelector('[data-tf-add]');
        focusNext = addBtn || null;
      }

      /* ── Toast ──────────────────────────────────────────────────────────────────────────
       * Figma 1:43029 desktop / 1:44173 mobile. Type=ERROR, not success: both frames place
       * `Icon/24px/TriangleAlert` with the --ai-border-error ring, where the create and edit
       * toasts use BadgeCheck and the success ring. A removal is reported as a warning.
       *
       * Copy follows the same bold-subject / plain-verb / bold-object shape as the add toast,
       * and likewise ends in a full stop inside the emphasis. */
      var planNameEl = document.querySelector('.room-card--selected .room-card__select')
        || document.querySelector('.room-card__select');
      var planName = planNameEl ? planNameEl.textContent.trim() : 'this plan';

      document.dispatchEvent(new CustomEvent('sp:toast', {
        detail: {
          type: 'error',
          parts: [
            { text: deletedName + ' ', strong: true },
            { text: 'has been removed from ' },
            { text: planName + '.', strong: true }
          ],
          /* DOM-only reversal, the same contract as the Table form's — see seating-toast, which
           * records that a real Undo needs the operation id the server hands back. Restores the
           * card AT ITS ORIGINAL POSITION, the plan totals, the seat panel and the selection. */
          undo: function () {
            var host = document.querySelector('[data-sp-grid], .table-listing__grid');
            if (host && snap.cardHTML) {
              var before = snap.nextId
                ? host.querySelector('.table-card[data-sp-table="' + snap.nextId + '"]')
                : null;
              var tmp = document.createElement('div');
              tmp.innerHTML = snap.cardHTML;
              var restored = tmp.firstElementChild;
              if (restored) {
                if (before) host.insertBefore(restored, before);
                else host.appendChild(restored);
              }
            }
            if (planElSnap && snap.planHTML !== null) planElSnap.innerHTML = snap.planHTML;
            if (freeElSnap && snap.freeText !== null) freeElSnap.textContent = snap.freeText;
            if (detailNameSnap && snap.detailName !== null) detailNameSnap.textContent = snap.detailName;
            if (detailCountSnap && snap.detailCount !== null) detailCountSnap.textContent = snap.detailCount;
            if (seatsElSnap && snap.seatsHTML !== null) seatsElSnap.innerHTML = snap.seatsHTML;

            /* Selection set directly rather than by clicking: a click would re-run the selection
             * handler and rewrite the seat panel that was just restored. */
            if (snap.wasSelected) {
              Array.prototype.forEach.call(document.querySelectorAll('.table-card'), function (c) {
                c.classList.remove('table-card--selected');
              });
              var back = document.querySelector('.table-card[data-sp-table="' + card.getAttribute('data-sp-table') + '"]');
              if (back) back.classList.add('table-card--selected');
            }
            if (window.lucide && typeof window.lucide.createIcons === 'function') {
              window.lucide.createIcons();
            }
          }
        }
      }));

      close(focusNext);
    });
  }
})();
