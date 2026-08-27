/* Seating Planner — drag to seat, and the tap path that replaces it (TASK-344759)
 *
 * Eleventh sub-task. It registers no action, because dragging is not a control —
 * it is behaviour attached to rows the shell already marked `draggable="true"`
 * as an affordance with nothing behind it. This is what puts something behind it.
 *
 * ONE OPERATION, TWO INPUT METHODS. The brief asks how this works on mobile,
 * where drag is impossible. The answer is that drag is not the mechanism, it is
 * an accelerator for one:
 *
 *     PICK a person  →  PLACE them on a seat, a table, or the pool
 *
 * Tap (or Enter) picks; tap (or Enter) on a destination places; Esc cancels.
 * Dragging runs exactly the same four placements. Keyboard users cannot drag
 * either, so the tap path is not a mobile concession — it is the accessible
 * path, and drag is the shortcut. That is the architecture recommended back in
 * TASK-344753 and it is why TASK-342309's Assign popup exists.
 *
 * The four placements from the brief:
 *   pool  → empty seat   seats them there
 *   pool  → table card   seats them in the table's first free seat, or refuses
 *                        with "Table full"
 *   seat  → seat         moves the person; swaps if the target is occupied
 *   seat  → pool         unseats them
 * Plus one the brief doesn't list but the interaction implies: seat → another
 * table card, which moves them to that table's first free seat.
 *
 * NOTHING HERE RE-IMPLEMENTS SEATING. It moves people between the card dots and
 * the occupant list, then hands off to the shell — selectTable() re-renders the
 * panel, syncSeats() mirrors rows onto the card, refresh() re-derives the pool
 * (TASK-351550), so a person leaving a seat reappears in the pool by name
 * without this module touching the pool at all.
 *
 * TODO(backend:SeatingPlanner): DOM-only. Each placement is a TableSeat write —
 * occupant and seat order — and a swap is TWO rows changing in ONE transaction,
 * or the pair can end up both in the same seat. A move between tables changes
 * the parent Table as well, so it must not be modelled as delete-then-insert.
 */
(function () {
  'use strict';

  var ROLE_NAMES = {
    attendee: 'Attendee', sponsor: 'Sponsor', vip: 'VIP',
    speaker: 'Speaker', host: 'Host', guest: 'Guest'
  };

  /* The person in the air: { kind, name, org, role, row } */
  var held = null;

  function one(sel, root) { return (root || document).querySelector(sel); }
  function all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }
  function roleOfDot(dot) {
    var m = (dot.className || '').match(/sp-dot--(attendee|sponsor|vip|speaker|host|guest)/);
    return m ? m[1] : null;
  }
  function api() { return window.SeatingPlannerWorkspace || {}; }

  /* ------------------------------------------------------------ read a person */

  function fromTray(row) {
    var badge = one('.sp-role', row);
    var m = badge ? (badge.className || '').match(/sp-role--(\w+)/) : null;
    return {
      kind: 'tray', row: row,
      name: (one('.sp-person__name', row) || {}).textContent || '',
      org: (one('.sp-person__org', row) || {}).textContent || '',
      role: m ? m[1] : 'guest'
    };
  }

  function fromSeat(row) {
    return {
      kind: 'seat', row: row,
      name: (one('.sp-seat__name', row) || {}).textContent || '',
      org: (one('.sp-seat__org', row) || {}).textContent || '',
      role: row.getAttribute('data-sp-role')
    };
  }

  /* --------------------------------------------------------- card mutations */

  function openCard() { return one('[data-sp-table].sp-table--selected'); }

  function firstFreeIndex(card) {
    var dots = all('.sp-dot', card);
    for (var i = 0; i < dots.length; i++) {
      if (!roleOfDot(dots[i])) return i;
    }
    return -1;
  }

  /* Put a person in a specific seat of a card. The occupant list holds one entry
     per FILLED seat in seat order, so the insertion point is the number of
     filled seats before this one — not the seat number. */
  function placeInCard(card, index, person) {
    var dots = all('.sp-dot', card);
    if (index < 0 || index >= dots.length || roleOfDot(dots[index])) return false;

    var before = 0;
    for (var i = 0; i < index; i++) {
      if (roleOfDot(dots[i])) before++;
    }
    var occ = (card.getAttribute('data-sp-occupants') || '').split('|').filter(Boolean);
    occ.splice(before, 0, person.name + '~' + person.org);
    card.setAttribute('data-sp-occupants', occ.join('|'));
    dots[index].className = 'sp-dot sp-dot--' + person.role;
    syncCardMeta(card);
    return true;
  }

  /* Count + fill pill for a card that may not be the open one, so syncSeats
     (which only knows about the open table) cannot do it. */
  function syncCardMeta(card) {
    var dots = all('.sp-dot', card);
    var seated = dots.filter(roleOfDot).length;
    var count = one('[data-sp-count]', card);
    if (count) count.textContent = seated + ' / ' + dots.length + ' seated';
    var pill = one('[data-sp-fill]', card);
    if (pill) {
      pill.className = 'badge badge--sm';
      if (seated === 0) { pill.classList.add('badge--neutral'); pill.textContent = 'Empty'; }
      else if (seated < dots.length) { pill.classList.add('badge--warning'); pill.textContent = seated + '/' + dots.length; }
      else { pill.classList.add('badge--success'); pill.textContent = 'Full'; }
    }
    if (api().syncPlanChip) api().syncPlanChip(card.getAttribute('data-sp-belongs'));
  }

  /* Reuse the shell's own unseat path rather than a second copy of it: it frees
     the seat, returns the person and resyncs everything. */
  function unseatRow(row) {
    var btn = one('[data-sp-unseat]', row);
    if (btn) btn.click();
  }

  function after(card) {
    if (card && api().selectTable && card === openCard()) api().selectTable(card);
    if (api().refresh) api().refresh();
    refreshIcons();
  }

  /* ------------------------------------------------------------- placements */

  /* What would happen if `held` were dropped on `target`?
     → { ok, kind: 'fill'|'swap'|'unseat'|'table', reason } */
  function verdict(target) {
    if (!held || !target) return { ok: false };

    var seat = target.closest ? target.closest('.sp-seat') : null;
    var card = target.closest ? target.closest('[data-sp-table]') : null;
    var pool = target.closest ? target.closest('[data-sp-tray-list], [data-sp-tray-panel]') : null;

    if (seat) {
      if (seat === held.row) return { ok: false };
      var occupied = !!seat.getAttribute('data-sp-role');
      if (!occupied) return { ok: true, kind: 'fill', el: seat };
      if (held.kind === 'seat') return { ok: true, kind: 'swap', el: seat };
      /* Someone from the pool onto an occupied seat would have to displace the
         sitter. The brief only asks for swap between two SEATS, so this refuses
         rather than quietly unseating a third party — see the handover. */
      return { ok: false, kind: 'fill', el: seat, reason: 'Seat taken' };
    }

    if (card) {
      if (held.kind === 'seat' && card === openCard() && firstFreeIndex(card) === -1) {
        return { ok: false, el: card, reason: 'Table full' };
      }
      if (firstFreeIndex(card) === -1) return { ok: false, el: card, reason: 'Table full' };
      return { ok: true, kind: 'table', el: card };
    }

    if (pool) {
      if (held.kind === 'tray') return { ok: false, el: one('[data-sp-tray-panel]'), reason: 'Already unassigned' };
      return { ok: true, kind: 'unseat', el: one('[data-sp-tray-panel]') };
    }

    return { ok: false };
  }

  function apply(v) {
    if (!held || !v || !v.ok) return;
    var person = held;
    var card = openCard();

    if (v.kind === 'fill') {
      var index = parseInt(v.el.getAttribute('data-sp-seat'), 10) - 1;
      if (person.kind === 'seat') {
        /* a move within the open table: free the old seat first, so the
           occupant list doesn't briefly hold them twice */
        var from = parseInt(person.row.getAttribute('data-sp-seat'), 10) - 1;
        clearIndex(card, from);
        if (from < index) index -= 0; /* dots are positional, so the index holds */
      }
      placeInCard(card, index, person);
      after(card);
      toast(person.name + ' seated at ' + card.getAttribute('data-sp-name') +
            ' · seat ' + (index + 1) + '.');
      return;
    }

    if (v.kind === 'swap') {
      var other = fromSeat(v.el);
      var a = parseInt(person.row.getAttribute('data-sp-seat'), 10) - 1;
      var b = parseInt(v.el.getAttribute('data-sp-seat'), 10) - 1;
      clearIndex(card, a);
      clearIndex(card, b);
      placeInCard(card, a, other);
      placeInCard(card, b, person);
      after(card);
      toast('<strong>' + person.name + '</strong> and <strong>' + other.name +
            '</strong> swapped seats.');
      return;
    }

    if (v.kind === 'table') {
      var target = v.el;
      if (person.kind === 'seat') unseatRow(person.row);
      var free = firstFreeIndex(target);
      placeInCard(target, free, person);
      after(target);
      toast(person.name + ' seated at ' + target.getAttribute('data-sp-name') +
            ' · seat ' + (free + 1) + '.');
      return;
    }

    if (v.kind === 'unseat') {
      unseatRow(person.row);
      after(card);
      toast('<strong>' + person.name + '</strong> returned to Unassigned.');
    }
  }

  /* Free a seat by position, keeping the occupant list aligned */
  function clearIndex(card, index) {
    var dots = all('.sp-dot', card);
    if (!dots[index] || !roleOfDot(dots[index])) return;
    var before = 0;
    for (var i = 0; i < index; i++) {
      if (roleOfDot(dots[i])) before++;
    }
    var occ = (card.getAttribute('data-sp-occupants') || '').split('|').filter(Boolean);
    occ.splice(before, 1);
    card.setAttribute('data-sp-occupants', occ.join('|'));
    dots[index].className = 'sp-dot sp-dot--empty';
    syncCardMeta(card);
  }

  function toast(msg) { if (api().toast) api().toast(msg); }

  /* ------------------------------------------------------------ highlighting */

  function clearMarks() {
    all('.sp-drop, .sp-drop--swap, .sp-drop--reject').forEach(function (el) {
      el.classList.remove('sp-drop', 'sp-drop--swap', 'sp-drop--reject');
      el.removeAttribute('data-sp-reject');
    });
  }

  function mark(v) {
    clearMarks();
    if (!v || !v.el) return;
    if (v.ok) {
      v.el.classList.add('sp-drop');
      if (v.kind === 'swap') v.el.classList.add('sp-drop--swap');
    } else if (v.reason) {
      v.el.classList.add('sp-drop--reject');
      v.el.setAttribute('data-sp-reject', v.reason);
    }
  }

  /* --------------------------------------------------------- pick and place */

  function bar() { return one('[data-sp-place]'); }

  function pick(person) {
    release();
    held = person;
    person.row.classList.add('sp-picked');
    var b = bar();
    if (b) {
      one('[data-sp-place-text]', b).innerHTML =
        'Placing <strong>' + person.name + '</strong> — choose a seat, a table, or the pool.';
      b.removeAttribute('hidden');
      refreshIcons();
    }
  }

  function release() {
    if (held && held.row) held.row.classList.remove('sp-picked', 'sp-drag-source');
    held = null;
    clearMarks();
    var b = bar();
    if (b) b.setAttribute('hidden', '');
  }

  /* ---------------------------------------------------------------- wiring */

  function init() {
    if (!one('[data-sp-seatlist]')) return;

    /* ── drag ── */
    document.addEventListener('dragstart', function (e) {
      var seat = e.target.closest && e.target.closest('.sp-seat[data-sp-role]');
      var tray = e.target.closest && e.target.closest('[data-sp-person]');
      var person = seat ? fromSeat(seat) : (tray ? fromTray(tray) : null);
      if (!person || !person.name) return;
      held = person;
      person.row.classList.add('sp-drag-source');
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        /* Firefox needs data set or the drag never starts */
        e.dataTransfer.setData('text/plain', person.name);
      }
    });

    document.addEventListener('dragover', function (e) {
      if (!held) return;
      var v = verdict(e.target);
      mark(v);
      if (v.ok) { e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'; }
    });

    document.addEventListener('drop', function (e) {
      if (!held) return;
      e.preventDefault();
      var v = verdict(e.target);
      if (v.ok) apply(v);
      else if (v.reason) toast(v.reason + '.');
      release();
    });

    document.addEventListener('dragend', release);

    /* ── tap / click: the same operation without a cursor ── */
    document.addEventListener('click', function (e) {
      /* real controls win — Assign, edit, delete, reorder, unseat */
      if (e.target.closest('[data-sp-action], [data-sp-move], [data-sp-unseat], button, a')) {
        if (e.target.closest('[data-sp-place-cancel]')) { e.preventDefault(); release(); }
        return;
      }

      if (held) {
        var v = verdict(e.target);
        if (v.ok) {
          e.preventDefault();
          e.stopPropagation();   /* a placement must not also select the table */
          apply(v);
          release();
          return;
        }
        if (v.reason) { e.preventDefault(); e.stopPropagation(); toast(v.reason + '.'); return; }
        release();
        return;
      }

      var seat = e.target.closest('.sp-seat[data-sp-role]');
      var tray = e.target.closest('[data-sp-person]');
      if (seat) { e.stopPropagation(); pick(fromSeat(seat)); return; }
      if (tray) { e.stopPropagation(); pick(fromTray(tray)); }
    }, true);   /* capture, so a pick or placement pre-empts card selection */

    /* ── keyboard: pick, place, cancel ── */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && held) { release(); return; }
      if (e.key !== 'Enter' && e.key !== ' ') return;

      var row = e.target.closest && e.target.closest('.sp-seat, [data-sp-person], [data-sp-table]');
      if (!row) return;
      if (e.target.closest('button, a')) return;

      if (held) {
        var v = verdict(e.target);
        if (v.ok) { e.preventDefault(); apply(v); release(); }
        else if (v.reason) { e.preventDefault(); toast(v.reason + '.'); }
        return;
      }
      var seat = row.matches('.sp-seat[data-sp-role]') ? row : null;
      var tray = row.matches('[data-sp-person]') ? row : null;
      if (seat) { e.preventDefault(); pick(fromSeat(seat)); }
      else if (tray) { e.preventDefault(); pick(fromTray(tray)); }
    });

    /* Rows must be reachable by keyboard to be pickable by keyboard */
    function makeFocusable() {
      all('[data-sp-person], .sp-seat[data-sp-role]').forEach(function (row) {
        if (!row.hasAttribute('tabindex')) row.setAttribute('tabindex', '0');
        if (!row.hasAttribute('aria-grabbed')) row.setAttribute('aria-grabbed', 'false');
      });
    }
    makeFocusable();
    /* the panel and the pool are re-rendered constantly, so re-tag after any
       interaction rather than trying to hook every render */
    document.addEventListener('click', makeFocusable);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
