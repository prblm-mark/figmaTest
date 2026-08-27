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

      /* The screen that follows IS now designed (3515:177748 / 3515:213426), so the flow
       * continues into it instead of stopping at the event. The event is still dispatched —
       * a host needs it to actually create the plan.
       *
       * TODO(backend:SeatingPlanner): creating a plan must generate its tables — see
       * seating-new-plan. The plan screen's 12 tables and its seat rows are static markup;
       * the real screen must render THIS plan's tables at the requested count and shape. */
      setState('plan');

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

    var n = card.getAttribute('data-sp-table');
    if (nameEl) nameEl.textContent = 'Table ' + n;
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
