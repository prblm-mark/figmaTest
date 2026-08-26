/* Seating Planner — behaviour for the main interface shell (TASK-344753)
 *
 * ADOPTED 2026-07-31. This began as the exploration module for three alternative
 * layouts; worklist v1 won, the others were deleted, and this is now simply the
 * shell's behaviour. Loaded by workspace.html only, after SeatingPlannerWorkspace.js
 * and every sub-task module.
 *
 * It registers ONE action on the workspace registry — `change-event` — and only
 * because nothing owns it: TASK-342608 shipped as the EventPicker pattern, so no
 * sub-task module in this prototype claims that channel, and until now the button
 * toasted "not built" in every layout including the fallback. Everything else the
 * alternatives do is about WHERE things are, not what the controls do; the registry
 * is a single-handler map, so claiming an owned name would switch another module
 * off (see initTrayEcho for the time that bit me).
 *
 * Each feature is behind its own hook guard, so a layout only gets the behaviour
 * its markup asks for:
 *   [data-sp-plans-track]   the rooms scroll sideways; arrows on desktop
 *   [data-sp-list-search]   filter the tables list (all three)
 *   [data-sp-view-toggle]   tables as a list or as cards (both worklists)
 *   [data-sp-resize]        drag a column wider (alt1)
 *   [data-sp-acc]           relocate the ONE seat drawer, below the width named in
 *                           body[data-sp-acc-below] (mobile)
 *
 * The two rules everything here obeys, because breaking either corrupts data:
 *   · exactly ONE [data-sp-seatlist] and ONE [data-sp-tray-list] in the
 *     document, always — nine singleton query sites depend on it, three of which
 *     pair seat rows to card dots BY INDEX;
 *   · the seat list, the cards and the pool stay non-overlapping subtrees, or
 *     Drag.js's verdict() precedence starts resolving drops to the wrong region.
 */
(function () {
  'use strict';

  function one(sel, root) { return (root || document).querySelector(sel); }
  function all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  var body = document.body;
  if (!body || body.className.indexOf('sp-shell') === -1) return;

  /* Declared up here because two features honour it — the rooms scroller and the
     accordion — and the first of them is defined before the second. */
  var REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* -------------------------------------------------------------- change event */

  /* The one registry action this file claims. "Change event" is TASK-342608, which
   * shipped as the EventPicker PATTERN rather than as a sub-task module here, so
   * nothing ever registered a handler and the button toasted "not built" — in the
   * fallback too. With worklist v1 becoming the main interface that has to work, so
   * it goes where the picker lives in this prototype.
   */
  function initChangeEvent() {
    if (!window.SeatingPlannerWorkspace) return;
    SeatingPlannerWorkspace.on('change-event', function () {
      location.href = 'index.html';
    });
  }

  /* ------------------------------------------------- rooms scroller (all three) */

  /* Mark, 2026-07-31: "on desktop i would rather have an arrow than a scrollbar.
   * mobile we can drop the arrow and use touch/swipe."
   *
   * So the scrollbar is hidden in CSS and the arrows are the desktop control. They
   * are only useful when there is somewhere to go, so they carry [hidden] until the
   * track actually overflows, and each one hides again at its end — a control that
   * does nothing is worse than no control.
   *
   * Three things move the goalposts and all three are listened for: scrolling,
   * resizing, and the CHIP COUNT changing, because New plan and Delete plan add and
   * remove cards at runtime. Hence the MutationObserver rather than a one-off
   * measurement at boot.
   */
  function initPlansScroller() {
    var track = one('[data-sp-plans-track]');
    if (!track) return;
    var navs = all('[data-sp-plans-scroll]');

    function sync() {
      /* +1 for sub-pixel track widths — otherwise an arrow flickers on at a
         fractional scrollWidth that cannot actually be scrolled to. */
      var scrollable = track.scrollWidth > track.clientWidth + 1;
      var atStart = track.scrollLeft <= 1;
      var atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
      navs.forEach(function (btn) {
        var prev = btn.getAttribute('data-sp-plans-scroll') === 'prev';
        var dead = !scrollable || (prev ? atStart : atEnd);
        btn.toggleAttribute('hidden', dead);
      });

      /* Touch has no arrow, so the signal that there is more has to be visual. The
         cut card does it at most widths, but with FIXED 240px cards the cards land
         exactly flush at a handful of them (track = 248n − 8: ~527, ~775 and 1023),
         and there the next card is entirely off-screen with nothing to hint at it.
         This attribute drives a trailing fade in the mobile CSS, which does not
         depend on the arithmetic working out. */
      track.toggleAttribute('data-sp-plans-more', scrollable && !atEnd);
    }

    navs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var dir = btn.getAttribute('data-sp-plans-scroll') === 'prev' ? -1 : 1;
        /* 80% of a view, so the card at the edge stays partly visible as a
           landmark rather than a full page turn losing your place */
        track.scrollBy({ left: dir * Math.round(track.clientWidth * 0.8),
                         behavior: REDUCED_MOTION.matches ? 'auto' : 'smooth' });
        /* Re-check after the glide as well as on scroll events. Belt and braces:
           a smooth scroll fires plenty of scroll events in a real browser, but
           under headless virtual time it fires none — the arrows then keep saying
           "more this way" at the end of the track, which is exactly the dead
           control the [hidden] logic exists to prevent. */
        window.setTimeout(sync, 400);
      });
    });

    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    if (window.MutationObserver) {
      new MutationObserver(sync).observe(track, { childList: true });
    }
    sync();
  }

  /* ---------------------------------------------------------- tables filter */

  /* Deliberately NOT the `hidden` attribute: applyFreeSeatsFilter() owns that on
     every card and re-runs on every seat change, so a second mechanism using it
     would be wiped out (or would wipe it out). data-sp-nomatch composes with it
     instead — a card needs to pass both to be visible. */
  function initListSearch() {
    var input = one('[data-sp-list-search]');
    if (!input) return;

    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      all('[data-sp-table]').forEach(function (card) {
        var hit = !q || card.textContent.toLowerCase().indexOf(q) !== -1 ||
          (card.getAttribute('data-sp-occupants') || '').toLowerCase().indexOf(q) !== -1;
        if (hit) { card.removeAttribute('data-sp-nomatch'); shown++; }
        else card.setAttribute('data-sp-nomatch', '');
      });

      var note = one('[data-sp-list-count]');
      if (note) {
        note.textContent = q ? shown + (shown === 1 ? ' table matches' : ' tables match')
                             : '';
      }
    });
  }

  /* --------------------------------------------------- list / grid view (alt1) */

  /* Mark, 2026-07-30: the tables list gets a list/grid toggle.
   *
   * The state is one attribute on <body>, `data-sp-view`, because the CSS that
   * responds to it has to reach BOTH the grid container and the cards inside it,
   * and the cards are re-minted by AddTable/Workspace at runtime — an ancestor
   * attribute survives that, a class on a card would not.
   *
   * Nothing else is touched: grid view simply switches OFF the row restyle and
   * lets the card's own shipped styles apply again, so the two views cannot
   * drift. And because it only sets an attribute, every module — selection,
   * drag, the free-seats filter, the list search — carries on working unchanged
   * in either view.
   */
  // TODO(backend:SeatingPlanner): the chosen tables view is session-only →
  // persist per user alongside the pane widths (see seating-workspace-prefs)
  function initViewToggle() {
    var buttons = all('[data-sp-view-toggle]');
    if (!buttons.length) return;

    function set(view) {
      body.setAttribute('data-sp-view', view);
      buttons.forEach(function (btn) {
        btn.setAttribute('aria-pressed',
          btn.getAttribute('data-sp-view-toggle') === view ? 'true' : 'false');
      });
      /* the open table should stay put across a re-layout */
      var open = one('[data-sp-table].sp-table--selected');
      if (open && open.scrollIntoView) open.scrollIntoView({ block: 'nearest' });
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        set(btn.getAttribute('data-sp-view-toggle'));
      });
    });

    set(body.getAttribute('data-sp-view') || 'list');
  }

  /* ------------------------------------------------- resizable columns (alt1) */

  /* Mark, 2026-07-30: "add a drag handle so we can expand them manually if
   * required. the min width should [be] the default widths - so they should only
   * grow larger."
   *
   * So each handle owns ONE custom property on the pane row — --sp-detail-w or
   * --sp-pool-w — and the grid template reads it. Nothing else has to know: the
   * panes are tracks, so they resize with the grid, and every module inside them
   * keeps working because nothing is re-parented.
   *
   * The minimum is the track's own floor — 320 for both columns — and the maximum
   * is whatever leaves the tables list its own floor, so a column can never be
   * dragged over the top of the list or below the width it was designed for. The
   * detail column ASKS for 384 via minmax() and settles for less when the viewport
   * is tight; a drag replaces that preference with a fixed width.
   *
   * Pointer events, not mousedown/mousemove: setPointerCapture keeps the stream
   * coming even when the pointer leaves the 4px rail — which it will, immediately —
   * and the same handler covers a trackpad, a touchscreen and a pen. Arrow keys do
   * the same job for the keyboard (the ARIA window-splitter pattern), and a
   * double-click puts the column back to its default.
   */
  var KEY_STEP = 16;

  // TODO(backend:SeatingPlanner): a dragged column width lasts as long as the page
  // does → persist per user (seating-workspace-prefs)
  function initResizers() {
    var handles = all('[data-sp-resize]');
    if (!handles.length) return;
    var work = one('.sp-shell__work');
    if (!work) return;

    var PROP = { detail: '--sp-detail-w', pool: '--sp-pool-w' };

    /* The list's floor is read from the CSS rather than hard-coded, so the clamp
       and the grid template can never disagree — and the floor is viewport-
       dependent (size-7 from 1280 up, size-2 below, where three minimums do not
       fit), which a constant in here would get wrong at one end or the other.

       BUT a custom property does not come back resolved. getComputedStyle() gives
       the substituted TOKEN STREAM for a custom property, not a used value, so
       --sp-list-floor reads as "24rem" and a bare parseFloat() takes it as 24px.
       That silently let the detail column grow ~590px past its real ceiling and
       overflow .sp-ws, which clips. Convert the unit explicitly. */
    function toPx(value) {
      var v = String(value).trim();
      var n = parseFloat(v);
      if (!n) return 0;
      if (v.indexOf('rem') !== -1) {
        return n * parseFloat(getComputedStyle(document.documentElement).fontSize);
      }
      if (v.indexOf('em') !== -1) return n * parseFloat(getComputedStyle(work).fontSize);
      return n;   /* px, or unitless */
    }

    function listFloor() {
      return toPx(getComputedStyle(work).getPropertyValue('--sp-list-floor'));
    }

    function tracks() {
      /* the resolved template, so the numbers are what is on screen rather than
         what the tokens say — after a drag they are no longer the same */
      return getComputedStyle(work).gridTemplateColumns.split(' ').map(parseFloat);
    }

    function widthOf(which) {
      var t = tracks();
      return which === 'detail' ? t[2] : t[4];
    }

    /* How far this column can grow before the list hits its floor. */
    function maxFor(which) {
      var t = tracks();
      return widthOf(which) + (t[0] - listFloor());
    }

    function apply(handle, which, px) {
      var min = parseFloat(handle.getAttribute('aria-valuemin'));
      var next = Math.round(Math.max(min, Math.min(px, maxFor(which))));
      work.style.setProperty(PROP[which], next + 'px');
      handle.setAttribute('aria-valuenow', String(next));
      return next;
    }

    handles.forEach(function (handle) {
      var which = handle.getAttribute('data-sp-resize');

      handle.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        var startX = e.clientX;
        var startW = widthOf(which);
        handle.setAttribute('data-sp-resizing', '');
        body.setAttribute('data-sp-resizing', '');
        if (handle.setPointerCapture) handle.setPointerCapture(e.pointerId);

        function move(ev) {
          /* both columns live to the RIGHT of their handle, so dragging left
             (a falling clientX) makes the column wider */
          apply(handle, which, startW + (startX - ev.clientX));
        }
        function up() {
          handle.removeAttribute('data-sp-resizing');
          body.removeAttribute('data-sp-resizing');
          handle.removeEventListener('pointermove', move);
          handle.removeEventListener('pointerup', up);
          handle.removeEventListener('pointercancel', up);
        }
        handle.addEventListener('pointermove', move);
        handle.addEventListener('pointerup', up);
        handle.addEventListener('pointercancel', up);
      });

      handle.addEventListener('keydown', function (e) {
        var w = widthOf(which);
        if (e.key === 'ArrowLeft') apply(handle, which, w + KEY_STEP);
        else if (e.key === 'ArrowRight') apply(handle, which, w - KEY_STEP);
        else if (e.key === 'Home' || e.key === 'Escape') reset();
        else return;
        e.preventDefault();
      });

      function reset() {
        work.style.removeProperty(PROP[which]);
        handle.setAttribute('aria-valuenow', handle.getAttribute('aria-valuemin'));
      }

      handle.addEventListener('dblclick', reset);
    });
  }

  /* ---------------------------------------------------- accordion drawer (alt3) */

  /* ONE drawer, moved to sit immediately after whichever card is open.
   *
   * It is a SIBLING of the card, never a child. Nesting it inside
   * [data-sp-table] is fatal: the shell's document listeners run in registration
   * order, so a click on a seat's unseat button would first match
   * initTableSelect's closest('[data-sp-table]'), which re-renders the seat list
   * and detaches the clicked row — and then initSeatActions runs
   * `seat.outerHTML = …` on a parentless node and throws. The person is removed
   * from the plan and never reaches the pool. As a sibling,
   * closest('[data-sp-table]') from inside the drawer returns null and every
   * behaviour is identical to the fallback.
   *
   * A MutationObserver rather than a click handler, because selectTable() is
   * also called from selectPlan(), AddTable, DeleteTable and Drag — a click
   * handler would miss four paths out of five. Watching `hidden` as well as
   * `class` also parks the drawer when "Only free seats" filters out the very
   * card it is attached to.
   */
  var ACC_OPTS = {
    childList: true, subtree: true,
    attributes: true, attributeFilter: ['class', 'hidden']
  };

  function initAccordion() {
    var grid = one('[data-sp-acc]');
    var drawer = one('[data-sp-acc-drawer]');
    var home = one('[data-sp-panel-home]');
    if (!grid || !drawer || !home) return;

    /* Three panes on a desktop, an accordion below 1024 — there is no room for
       three panes on a phone and no drag and drop to move people between them, so
       the relocation machinery is gated to a media query rather than always on.
       Nothing here hard-codes the breakpoint: the markup declares it. */
    var below = body.getAttribute('data-sp-acc-below');
    var mq = below
      ? window.matchMedia('(max-width: ' + (parseInt(below, 10) - 1) + 'px)')
      : null;
    function accordionOn() { return !mq || mq.matches; }

    var observer = null;
    var queued = false;

    /* ---- closing, animated ------------------------------------------------
       Removing an 800px drawer from the flow moves everything below it up in one
       frame, which reads as a jump. Animating its height to 0 first makes the rows
       slide up, so the collapse is legible. The pixel height has to come from JS —
       CSS cannot transition from `auto` — and the parking happens only when the
       animation finishes.

       `collapse.token` guards a race: tapping ANOTHER table mid-animation must not
       let a pending finish() park the drawer after place() has just moved it, and
       must not leave the inline height:0 on a drawer that is now open. place()
       cancels first, so whichever gesture is latest wins. Transitions do not run
       under headless virtual time, so the timeout is what completes the close in
       tests — the same reason the relocation is batched with setTimeout. */
    var collapse = { token: 0 };

    function cancelCollapse() {
      collapse.token++;
      drawer.removeAttribute('data-sp-collapsing');
      drawer.style.removeProperty('height');
      drawer.style.removeProperty('overflow');
    }

    function closeOpenRow(card) {
      function park() {
        card.classList.remove('sp-table--selected');
        card.setAttribute('aria-pressed', 'false');
        schedule();
      }

      var height = drawer.getBoundingClientRect().height;
      if (REDUCED_MOTION.matches || !height) { park(); return; }

      var mine = ++collapse.token;
      drawer.setAttribute('data-sp-collapsing', '');
      drawer.style.height = height + 'px';
      void drawer.offsetHeight;             /* flush, or there is nothing to ease from */
      drawer.style.height = '0px';

      var finished = false;
      function finish() {
        if (finished || collapse.token !== mine) return;
        finished = true;
        cancelCollapse();
        park();
      }
      drawer.addEventListener('transitionend', finish, { once: true });
      window.setTimeout(finish, 400);       /* 250ms token + slack */
    }

    function place() {
      queued = false;
      cancelCollapse();
      var open = accordionOn() ? one('[data-sp-table].sp-table--selected', grid) : null;
      if (open && open.hasAttribute('hidden')) open = null;

      /* the move mutates what we observe, so stand the observer down for it */
      if (observer) observer.disconnect();

      if (!open) {
        /* The single seat-panel node must never leave the document — nine
           singleton queries would start returning null. Park it instead. */
        if (drawer.parentNode !== home) home.appendChild(drawer);
      } else if (open.nextElementSibling !== drawer) {
        open.after(drawer);
        /* Bring the row to the top and SMOOTHLY — Mark, 2026-07-31: a jump makes
           it hard to tell what just happened, because the thing you tapped moves
           and grows in the same frame. `block: 'start'` puts the row at the top so
           its new detail is the whole screen below it. Reduced motion gets the
           jump back; that preference exists for people the animation would hurt. */
        if (open.scrollIntoView) {
          open.scrollIntoView({
            block: 'start',
            behavior: REDUCED_MOTION.matches ? 'auto' : 'smooth'
          });
        }
      }

      if (observer) {
        observer.takeRecords();
        observer.observe(grid, ACC_OPTS);
      }
    }

    /* setTimeout, not requestAnimationFrame: rAF does not fire under headless
       Chrome's virtual time, which would make this module untestable there. The
       batching behaviour is identical for our purposes. */
    function schedule() {
      if (queued) return;
      queued = true;
      window.setTimeout(place, 0);
    }

    /* Nothing is open when the page loads below the breakpoint — Mark, 2026-07-31:
       "by default can the table details be hidden <1024, only visible when
       clicked". The state file boots with a table selected for the desktop panes,
       so the selection is CLEARED rather than the drawer merely parked. That
       matters: initTableSelect's click handler calls selectTable() on every tap,
       but classList.toggle to a value a card already has mutates nothing, so a tap
       on a still-selected card would not schedule a relocation and would read as a
       dead control. With nothing selected, every first tap changes a class. */
    if (mq && mq.matches) {
      all('[data-sp-table]').forEach(function (c) {
        c.classList.remove('sp-table--selected');
        c.setAttribute('aria-pressed', 'false');
      });
    }

    /* Tap the open row again to close it — Mark, 2026-07-31. Capture phase and
       stopPropagation, because the shell's own document click listener would
       otherwise re-select the card and re-render the panel underneath us. Stopping
       propagation at the document during CAPTURE still lets other listeners on the
       document itself run (that would need stopImmediatePropagation), so Drag.js's
       capture listener is unaffected.

       Only where the accordion is breakpoint-gated — a layout whose detail is a
       permanent column has nothing to close. The card's own controls are let
       through, or Edit and Delete would close the row instead of doing their job. */
    if (mq) {
      document.addEventListener('click', function (e) {
        if (!accordionOn() || !e.target.closest) return;
        var card = e.target.closest('[data-sp-table]');
        if (!card || !card.classList.contains('sp-table--selected')) return;
        if (e.target.closest('[data-sp-action], button, a, input, select, textarea')) return;

        e.stopPropagation();
        closeOpenRow(card);
      }, true);
    }

    if (window.MutationObserver) {
      observer = new MutationObserver(schedule);
      observer.observe(grid, ACC_OPTS);
    }

    /* Crossing the breakpoint has to park the drawer back in its pane, or a
       rotate / resize would leave the seat panel wedged inside the tables list on
       a layout that has a column waiting for it. Coming the other way, the desktop
       has a column standing empty, so re-open the first table it can. */
    if (mq) {
      var onChange = function () {
        if (!mq.matches && !one('[data-sp-table].sp-table--selected') &&
            window.SeatingPlannerWorkspace) {
          var first = all('[data-sp-table]:not([hidden])')[0];
          if (first) SeatingPlannerWorkspace.selectTable(first);
        }
        schedule();
      };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }

    place();
  }

  /* ------------------------------------------------ unassigned count (mobile) */

  /* Below 1024 the pool is hidden — you cannot drag anyone out of it on a touch
   * screen, so it is dead weight (the Assign popup reads it live instead, which
   * is the canonical seating path on every viewport per TASK-344759).
   *
   * Hidden, though, not removed: [data-sp-tray-list] is a singleton nine queries
   * depend on, and the derived pool is where unseated people go. What WOULD be
   * lost is the signal "somebody is still waiting for a seat", so the count is
   * mirrored into the tables pane head.
   *
   * A MutationObserver on the badge, NOT SeatingPlannerWorkspace.on(). That
   * registry is a SINGLE-HANDLER MAP — `on: function (a, fn) { handlers[a] = fn }`
   * — so registering for 'unassigned-tray' does not subscribe, it CLAIMS, and
   * TASK-351550's Tray module already owns that channel. The first version of this
   * echo took it over, and whichever module registered last silently switched the
   * other off. Mirroring one DOM value into another cannot collide with anything.
   */
  function initTrayEcho() {
    var echo = one('[data-sp-tray-echo]');
    var count = one('[data-sp-tray-count]');
    if (!echo || !count) return;

    function sync() {
      var n = parseInt(count.textContent, 10) || 0;
      echo.textContent = n ? n + ' unassigned' : 'Everyone is seated';
      echo.hidden = false;
    }

    if (window.MutationObserver) {
      new MutationObserver(sync)
        .observe(count, { childList: true, characterData: true, subtree: true });
    }
    sync();
  }

  /* --------------------------------------------------- keep the open row in view */

  /* In the fallback the page scrolled; here the pane does. Selecting a table
     from anywhere (a plan switch, Add table, a drag) should still bring it into
     view inside its own scroller. Accordion handles its own via place(). */
  function initFollowSelection() {
    if (one('[data-sp-acc]')) return;

    document.addEventListener('click', function (e) {
      var card = e.target.closest && e.target.closest('[data-sp-table]');
      if (!card || !card.scrollIntoView) return;
      window.setTimeout(function () {
        card.scrollIntoView({ block: 'nearest' });
      }, 0);
    });
  }

  function init() {
    initChangeEvent();
    initPlansScroller();
    initListSearch();
    initViewToggle();
    initResizers();
    initAccordion();
    initTrayEcho();
    initFollowSelection();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
