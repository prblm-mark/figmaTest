/* Seating Planner — workspace shell behaviour (TASK-344753)
 *
 * Screen 2 of the Seating Planner. Separate from SeatingPlanner.js (screen 1,
 * the Event Picker) so that file stays untouched — it has already fed the
 * production EventPicker pattern.
 *
 * SCOPE. This task is the shell + wiring. The workspace's OWN behaviour is
 * live here:
 *   · plan chip selection swaps the visible plan
 *   · table card selection opens its seat panel
 *   · "Only free seats" filters the grid
 *   · seat reorder / remove (remove returns the person to Unassigned)
 *   · unassigned search + live count
 *   · export split-button menu open/close
 *
 * Everything else belongs to a sub-task and is deliberately NOT built. Those
 * controls are marked up with [data-sp-action] + [data-sp-task] and routed
 * through one registry, so when a sub-task lands it registers a handler and
 * becomes live with no refactor here:
 *
 *     SeatingPlannerWorkspace.on('add-table', function (ctx) { ... });
 *
 * Until then the control announces which task owns it instead of failing
 * silently. Actions and owners:
 *   change-event 342608 (built: EventPicker) · new-plan 342306
 *   copy-plans 344756 · plan-edit 344754 · plan-delete 344755
 *   add-table 344757 · room-layout 344760 · export 344761
 *   table-edit 342307 · table-delete 344758 · assign-seat 342309
 *   drag-seat 344759 · tier-colours 342308 · unassigned-tray 351550
 *
 * TODO(backend:SeatingPlanner): every plan, table, seat and person here is
 * mock DOM data. Real version reads/writes SeatingPlan, Table and TableSeat
 * (data model on the parent task). Seat order is meaningful — it is "who sits
 * next to whom" — so reorder must persist an explicit index, not a sort.
 */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- helpers */

  function all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function one(sel, root) {
    return (root || document).querySelector(sel);
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  /* ------------------------------------------------- deferred-action registry */

  var handlers = {};

  var TASK_LABELS = {
    'change-event': 'Change event — the Event Picker (built)',
    'new-plan': 'New plan',
    'copy-plans': 'Copy plans',
    'plan-edit': 'Edit plan',
    'plan-delete': 'Delete plan',
    'add-table': 'Add table',
    'room-layout': 'Room layout',
    'export': 'Export',
    'table-edit': 'Edit table',
    'table-delete': 'Delete table',
    'assign-seat': 'Assign a person to this seat'
  };

  function toast(message) {
    var host = one('[data-sp-toasts]');
    if (!host) {
      host = document.createElement('div');
      host.className = 'sp-toast-host';
      host.setAttribute('data-sp-toasts', '');
      document.body.appendChild(host);
    }
    var el = document.createElement('div');
    el.className = 'toast toast--info';
    el.setAttribute('role', 'status');
    el.innerHTML =
      '<span class="toast__icon"><i data-lucide="info" aria-hidden="true"></i></span>' +
      '<p class="toast__message">' + message + '</p>' +
      '<button type="button" class="toast__close" aria-label="Dismiss">' +
      '<i data-lucide="x" aria-hidden="true"></i></button>';
    el.querySelector('.toast__close').addEventListener('click', function () { el.remove(); });
    host.appendChild(el);
    refreshIcons();
    setTimeout(function () { el.remove(); }, 4000);
  }

  function runAction(action, task, trigger) {
    if (handlers[action]) {
      handlers[action]({ action: action, task: task, trigger: trigger });
      return;
    }
    var label = TASK_LABELS[action] || action;
    toast('<strong>' + label + '</strong> is specced in ' + (task || 'its own sub-task') +
          ' — not built in this task.');
  }

  /* The second kind of extension point. Click actions cover controls; a sub-task
     that owns a DERIVED view (TASK-351550's Unassigned pool) needs telling when
     the data behind it changed instead. Registration is identical:

         SeatingPlannerWorkspace.on('unassigned-tray', rerender);

     A notified handler must never call refresh() — that is what called it. */
  function notify(action) {
    if (handlers[action]) handlers[action]({ action: action, notify: true });
  }

  function initActions() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-sp-action]');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation(); /* an action on a card must not also select the card */
      runAction(btn.getAttribute('data-sp-action'), btn.getAttribute('data-sp-task'), btn);
    });
  }

  /* ------------------------------------------------------------- people pool */

  /* Deterministic mock occupants, generated so that EVERY SEAT IN THE EVENT HOLDS
     A DISTINCT PERSON.

     Why it changed (TASK-351550): a fixed list of 24 names spread over 300 seats
     put the same person in a dozen chairs at once. That was harmless flavour text
     while the seat panel was the only reader — but the Unassigned pool is
     "attendees minus everyone seated", so a duplicated name means unseating
     someone leaves them seated somewhere else and they never come back to the
     pool. 24 firsts × 30 surnames = 720 combinations, indexed by
     (card ordinal × 20 + seat), so every one of the event's seats is a different
     attendee and the set arithmetic is honest.

     The seven Unassigned people are deliberately NOT in here (found in 342309:
     the prototype was claiming the same person was both seated and unassigned).
     Table 1's occupants are authored in markup and still win. */
  var FIRST = ['Hana', 'Aisha', 'Eve', 'David', 'Mia', 'Sarah', 'Jon', 'Cato',
    'Bella', 'Rafael', 'Simone', 'Hugo', 'Talia', 'Noor', 'Leo', 'Ruth', 'Sam',
    'Beth', 'Ade', 'Clara', 'Ivan', 'Meera', 'Frank', 'Yara'];
  var LAST = ['Ashby', 'Okafor', 'Owens', 'Shah', 'Farah', 'Whitfield', 'Nyman',
    'Krantz', 'Moreau', 'Achebe', 'Lindqvist', 'Bergman', 'Rahimi', 'Mensah',
    'Calloway', 'Iyer', 'Nolan', 'Bakare', 'Voss', 'Petrov', 'Rao', 'Doyle',
    'Haddad', 'Ellery', 'Kirby', 'Santos', 'Ferrand', 'Beaumont', 'Nwosu', 'Alvi'];
  var ORGS = ['GoCardless', 'Visa Europe', 'Wise', 'Revolut', 'Klarna',
    'Barclaycard', 'Trustly', 'Worldline', 'Flutterwave', 'Swish', 'iZettle',
    'Payoneer', 'Mastercard', 'Adyen', 'Checkout.com', 'Worldpay', 'Tink',
    'Nuvei', 'Elavon', 'Zilch', 'Curve', 'Paysafe'];

  /* first name from i, surname from i/24 — injective over all 24 × 30 = 720
     combinations, which is what keeps every seat in the event a distinct person.
     (A "prettier" formula using two strides over one index collapsed the space to
     120 names and produced 161 duplicates; the fix is the INDEX below, not this.) */
  function personAt(i) {
    return [FIRST[i % FIRST.length] + ' ' +
            LAST[Math.floor(i / FIRST.length) % LAST.length],
            ORGS[i % ORGS.length]];
  }

  /* Names that generation must never mint: the authored occupants and everyone in
     the Unassigned pool. Without this the generator can reproduce one of them —
     it did, twice — and the same person ends up seated in two chairs, or seated
     AND unassigned. */
  var reserved = null;

  function reserveExistingNames() {
    reserved = {};
    all('[data-sp-table]').forEach(function (card) {
      (card.getAttribute('data-sp-occupants') || '').split('|').forEach(function (e) {
        if (e) reserved[e.split('~')[0]] = true;
      });
    });
    all('[data-sp-person] .sp-person__name').forEach(function (el) {
      reserved[el.textContent] = true;
    });
  }

  /* Occupant list for a card, as the "Name~Org|…" the panel and the Unassigned
     pool both read. Authored values win; otherwise names are generated from the
     card's position so they are stable and unique event-wide. */
  function occupantsFor(card) {
    var authored = card.getAttribute('data-sp-occupants');
    if (authored) return authored;
    if (!reserved) reserveExistingNames();

    var ordinal = all('[data-sp-table]').indexOf(card);
    var out = [];
    all('.sp-dot', card).forEach(function (dot) {
      if (!roleOf(dot)) return;
      /* Index by SEAT-major order (seat × 41 + table) rather than table-major, so
         both halves of the name change from one seat to the next and a table reads
         like a table instead of ten people sharing a surname. 41 is chosen because
         it exceeds the number of tables (keeping the mapping one-to-one) AND
         41 mod 24 is coprime with 24, so the first name doesn't repeat every third
         seat the way a stride of 40 did. */
      var i = out.length * 41 + ordinal;
      var p = personAt(i);
      /* Step past a reserved name rather than duplicating it. Step by FIRST.length
         — it advances the surname and keeps the first name, which is the only
         stride that is guaranteed to change the name: +720 (the size of the whole
         space) lands on the SAME person, which is how this guard silently did
         nothing the first time round. */
      var guard = 0;
      while (reserved[p[0]] && guard < 30) { i += FIRST.length; p = personAt(i); guard++; }
      reserved[p[0]] = true;
      out.push(p[0] + '~' + p[1]);
    });
    return out.join('|');
  }

  /* Stamp every card up front, so who-sits-where is readable for the WHOLE event
     rather than only for the open table. TASK-351550's pool needs that: it can
     only return a person to the pool if it can see their name. */
  function stampAllCards() {
    reserveExistingNames();
    all('[data-sp-table]').forEach(function (card) {
      var v = occupantsFor(card);
      if (v) card.setAttribute('data-sp-occupants', v);
    });
  }

  var ROLE_NAMES = {
    attendee: 'Attendee', sponsor: 'Sponsor', vip: 'VIP',
    speaker: 'Speaker', host: 'Host', guest: 'Guest'
  };

  function roleOf(dot) {
    var m = (dot.className || '').match(/sp-dot--(attendee|sponsor|vip|speaker|host|guest)/);
    return m ? m[1] : null;
  }

  /* ------------------------------------------------------------ seat panel */

  function seatRowHtml(n, role, name, org) {
    if (!role) {
      return '<div class="sp-seat sp-seat--empty" data-sp-seat="' + n + '">' +
        '<span class="sp-seat__num">' + n + '</span>' +
        '<div class="sp-seat__person"><p class="sp-seat__name">Empty seat</p></div>' +
        '<button class="btn btn--secondary btn--xs" type="button" ' +
        'data-sp-action="assign-seat" data-sp-task="TASK-342309">Assign</button>' +
        '</div>';
    }
    return '<div class="sp-seat" data-sp-seat="' + n + '" data-sp-role="' + role + '" draggable="true">' +
      '<span class="sp-seat__num">' + n + '</span>' +
      '<div class="sp-seat__person">' +
      '<p class="sp-seat__name">' + name + '</p>' +
      '<p class="sp-seat__org">' + org + '</p>' +
      '</div>' +
      '<span class="sp-role sp-role--' + role + '">' + ROLE_NAMES[role] + '</span>' +
      '<div class="sp-seat__actions">' +
      '<span class="sp-seat__reorder">' +
      '<button class="sp-iconbtn" type="button" data-sp-move="up" aria-label="Move up">' +
      '<i data-lucide="chevron-up" aria-hidden="true"></i></button>' +
      '<button class="sp-iconbtn" type="button" data-sp-move="down" aria-label="Move down">' +
      '<i data-lucide="chevron-down" aria-hidden="true"></i></button>' +
      '</span>' +
      '<button class="sp-iconbtn sp-iconbtn--danger" type="button" data-sp-unseat ' +
      'aria-label="Remove from seat"><i data-lucide="x" aria-hidden="true"></i></button>' +
      '</div></div>';
  }

  function renderSeatPanel(card) {
    var body = one('[data-sp-seatlist]');
    if (!body || !card) return;

    var dots = all('.sp-dot', card);
    var name = card.getAttribute('data-sp-name') || 'Table';
    var tier = card.getAttribute('data-sp-tier') || '';
    var sponsor = card.getAttribute('data-sp-sponsor') || '';
    var seated = dots.filter(roleOf).length;

    /* Every card is stamped at boot, so the occupants are read, never re-derived
       — which is what stops the panel renaming people (see stampOccupants) */
    var names = occupantsFor(card).split('|');

    var html = '';
    var filled = 0;
    dots.forEach(function (dot, i) {
      var role = roleOf(dot);
      if (!role) { html += seatRowHtml(i + 1, null); return; }
      var person = (names[filled] || '~').split('~');
      filled++;
      html += seatRowHtml(i + 1, role, person[0] || 'Attendee', person[1] || '');
    });

    body.innerHTML = html;

    var title = one('[data-sp-seat-title]');
    var badge = one('[data-sp-seat-tier]');
    var meta = one('[data-sp-seat-meta]');
    if (title) title.textContent = name;
    if (badge) {
      if (tier) { badge.textContent = tier; badge.removeAttribute('hidden'); }
      else badge.setAttribute('hidden', '');
    }
    if (meta) {
      meta.textContent = seated + ' / ' + dots.length + ' seated' +
        (sponsor ? ' · sponsored by ' + sponsor : '') +
        ' · seat order = who sits next to whom';
    }
    refreshIcons();
  }

  function selectTable(card) {
    all('[data-sp-table]').forEach(function (c) {
      c.classList.toggle('sp-table--selected', c === card);
      c.setAttribute('aria-pressed', c === card ? 'true' : 'false');
    });
    renderSeatPanel(card);
  }

  function initTableSelect() {
    document.addEventListener('click', function (e) {
      var card = e.target.closest('[data-sp-table]');
      if (card) selectTable(card);
    });

    /* Keyboard activation — WCAG 2.1.1. The cards are div[role="button"]
       tabindex="0", and a div does NOT synthesise a click from Enter or Space the
       way a real <button> does. Without this a keyboard user can focus a table and
       never open it, and Space just scrolls the page.

       Dispatch a real click rather than calling selectTable() directly. Everything
       else about a table card hangs off click — including the shell's mobile
       close-on-second-tap capture listener — so synthesising the click makes the
       keyboard path IDENTICAL to the pointer path, instead of a second
       implementation that has to be kept in step with it. It also means keyboard
       users get the mobile open AND close for free. Drag.js's capture listener
       ignores clicks when nothing is held, so it is unaffected. */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;

      var card = e.target.closest && e.target.closest('[data-sp-table]');
      if (!card) return;

      /* A real control inside the card owns its own keys: Enter on Edit must edit,
         not select the table. Native controls synthesise their own click, so
         letting the event through is enough — do not also select. */
      if (e.target !== card &&
          e.target.closest('button, a[href], input, select, textarea, [contenteditable]')) return;

      e.preventDefault();   /* Space would otherwise scroll the page */
      card.click();
    });

    var preset = one('[data-sp-table].sp-table--selected');
    if (preset) renderSeatPanel(preset);
  }

  /* ------------------------------------------------------ reorder / unseat */

  function renumber() {
    all('[data-sp-seatlist] .sp-seat').forEach(function (row, i) {
      row.setAttribute('data-sp-seat', i + 1);
      one('.sp-seat__num', row).textContent = i + 1;
    });
  }

  function initSeatActions() {
    document.addEventListener('click', function (e) {
      var move = e.target.closest('[data-sp-move]');
      if (move) {
        var row = move.closest('.sp-seat');
        var dir = move.getAttribute('data-sp-move');
        if (dir === 'up' && row.previousElementSibling) {
          row.parentNode.insertBefore(row, row.previousElementSibling);
        } else if (dir === 'down' && row.nextElementSibling) {
          row.parentNode.insertBefore(row.nextElementSibling, row);
        }
        renumber();
        return;
      }

      var unseat = e.target.closest('[data-sp-unseat]');
      if (!unseat) return;

      /* Removing a person frees the seat and returns them to Unassigned */
      var seat = unseat.closest('.sp-seat');
      var personName = one('.sp-seat__name', seat).textContent;
      var personOrg = one('.sp-seat__org', seat).textContent;
      var role = seat.getAttribute('data-sp-role');
      var n = seat.getAttribute('data-sp-seat');

      seat.outerHTML = seatRowHtml(n, null);
      addToTray(role, personName, personOrg);
      syncSelectedCard();
      renumber();
      /* TASK-351550: the pool is derived, so it has to be told the person is no
         longer seated — otherwise the row pushed above is all you see, and its
         label is whatever the caller passed rather than the derived person. */
      notify('unassigned-tray');
      updateTrayCount();
      refreshIcons();
    });
  }

  /* Recompute a plan chip's summary from its tables.
     BUG FIX: the chip was written once and never updated, so "240/300 seated ·
     60 free" went stale the moment anyone was unseated — the plan summary lied.
     Published on the API too, since sub-tasks that add or remove tables need it. */
  function syncPlanChip(key) {
    var chip = key ? one('[data-sp-plan="' + key + '"]')
                   : one('[data-sp-plan].sp-plan--active');
    if (!chip) return;

    var planKey = chip.getAttribute('data-sp-plan');
    var cards = all('[data-sp-table][data-sp-belongs="' + planKey + '"]');
    if (!cards.length) return; /* no grid on this screen — leave the chip alone */

    var capacity = 0;
    var seated = 0;
    cards.forEach(function (card) {
      var dots = all('.sp-dot', card);
      capacity += dots.length;
      seated += dots.filter(function (d) {
        return /sp-dot--(attendee|sponsor|vip|speaker|host|guest)/.test(d.className);
      }).length;
    });

    var stats = one('.sp-plan__stats', chip);
    if (stats) {
      stats.textContent = cards.length + (cards.length === 1 ? ' table · ' : ' tables · ') +
        seated + '/' + capacity + ' seated · ' + (capacity - seated) + ' free';
    }
    var fill = one('.sp-seated__fill', chip);
    if (fill) {
      fill.style.setProperty('--sp-seated-pct',
        (capacity ? Math.round(seated / capacity * 100) : 0) + '%');
    }

    /* The toolbar carries the table count for the open plan */
    if (chip.classList.contains('sp-plan--active')) {
      var title = one('[data-sp-plan-title]');
      var label = chip.getAttribute('data-sp-plan-label');
      if (title && label) {
        title.textContent = label + ' · ' + cards.length +
          (cards.length === 1 ? ' table' : ' tables');
      }
    }
  }

  /* Write who is in which seat back onto the card.
     BUG FIX: names for anything but Table 1 were DERIVED from the people pool at
     render time (`PEOPLE[offset + filled]`), so any change to the seats renamed
     everyone below it — unseat the third of ten and the remaining seven became
     different people. Stamping the occupants makes the card the record, so the
     panel survives switching tables and back, and a person assigned by
     TASK-342309 stays who they are. */
  function stampOccupants(card) {
    var rows = all('[data-sp-seatlist] .sp-seat');
    var filled = rows.filter(function (r) { return r.getAttribute('data-sp-role'); });
    if (!filled.length) { card.removeAttribute('data-sp-occupants'); return; }
    card.setAttribute('data-sp-occupants', filled.map(function (r) {
      return (one('.sp-seat__name', r) || {}).textContent + '~' +
             (one('.sp-seat__org', r) || {}).textContent;
    }).join('|'));
  }

  /* Keep the selected card's dots + count honest after an unseat */
  function syncSelectedCard() {
    var card = one('[data-sp-table].sp-table--selected');
    if (!card) return;
    var rows = all('[data-sp-seatlist] .sp-seat');
    var dots = all('.sp-dot', card);
    rows.forEach(function (row, i) {
      if (!dots[i]) return;
      var role = row.getAttribute('data-sp-role');
      dots[i].className = 'sp-dot ' + (role ? 'sp-dot--' + role : 'sp-dot--empty');
    });
    var seated = rows.filter(function (r) { return r.getAttribute('data-sp-role'); }).length;
    var count = one('[data-sp-count]', card);
    if (count) count.textContent = seated + ' / ' + dots.length + ' seated';
    setFillPill(card, seated, dots.length);
    var meta = one('[data-sp-seat-meta]');
    if (meta) meta.textContent = meta.textContent.replace(/^\d+ \/ \d+ seated/, seated + ' / ' + dots.length + ' seated');
    stampOccupants(card);
    syncPlanChip(card.getAttribute('data-sp-belongs'));
    applyFreeSeatsFilter();
  }

  function setFillPill(card, seated, capacity) {
    var pill = one('[data-sp-fill]', card);
    if (!pill) return;
    pill.className = 'badge badge--sm';
    if (seated === 0) { pill.classList.add('badge--neutral'); pill.textContent = 'Empty'; }
    else if (seated < capacity) { pill.classList.add('badge--warning'); pill.textContent = seated + '/' + capacity; }
    else { pill.classList.add('badge--success'); pill.textContent = 'Full'; }
  }

  /* ------------------------------------------------------- unassigned tray */

  function addToTray(role, name, org) {
    var list = one('[data-sp-tray-list]');
    if (!list) return;
    var el = document.createElement('div');
    el.className = 'sp-person';
    el.setAttribute('data-sp-person', '');
    el.setAttribute('draggable', 'true');
    el.innerHTML =
      '<span class="sp-role sp-role--' + (role || 'guest') + '">' +
      (ROLE_NAMES[role] || 'Guest') + '</span>' +
      '<p class="sp-person__name">' + name + '</p>' +
      '<span class="sp-person__org">' + org + '</span>';
    list.insertBefore(el, list.firstChild);
    updateTrayCount();
  }

  function updateTrayCount() {
    var badge = one('[data-sp-tray-count]');
    if (!badge) return;
    var visible = all('[data-sp-person]').filter(function (p) { return !p.hasAttribute('hidden'); });
    badge.textContent = visible.length;
  }

  function initTraySearch() {
    var input = one('[data-sp-tray-search]');
    if (!input) return;
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      all('[data-sp-person]').forEach(function (p) {
        var hit = !q || p.textContent.toLowerCase().indexOf(q) !== -1;
        if (hit) p.removeAttribute('hidden'); else p.setAttribute('hidden', '');
      });
      updateTrayCount();
    });
  }

  /* --------------------------------------------------- only-free-seats filter */

  /* The control is the Toggle component (a button[role=switch]), so read
     aria-checked — but tolerate a checkbox in case a sub-task swaps it. */
  function toggleIsOn(el) {
    if (el.type === 'checkbox') return el.checked;
    return el.getAttribute('aria-checked') === 'true';
  }

  function applyFreeSeatsFilter() {
    var toggle = one('[data-sp-freeseats]');
    if (!toggle) return;
    var on = toggleIsOn(toggle);
    var shown = 0;
    all('[data-sp-table]').forEach(function (card) {
      if (card.hasAttribute('data-sp-offplan')) return; /* other plan — stays hidden */
      var free = all('.sp-dot--empty', card).length > 0;
      if (!on || free) { card.removeAttribute('hidden'); shown++; }
      else card.setAttribute('hidden', '');
    });
    var note = one('[data-sp-filter-note]');
    if (note) {
      note.textContent = on
        ? 'Filtered to ' + shown + ' tables with free seats.'
        : 'Click a table to open its seat list. Fill state: green full · amber partial · grey empty.';
    }
  }

  function initFreeSeats() {
    var toggle = one('[data-sp-freeseats]');
    if (!toggle) return;

    if (toggle.type === 'checkbox') {
      toggle.addEventListener('change', applyFreeSeatsFilter);
    } else {
      toggle.addEventListener('click', function () {
        var next = !toggleIsOn(toggle);
        toggle.setAttribute('aria-checked', next ? 'true' : 'false');
        toggle.classList.toggle('toggle--active', next);
        applyFreeSeatsFilter();
      });
    }

    applyFreeSeatsFilter(); /* a screen can open with the filter already on */
  }

  /* -------------------------------------------------------------- plan chips */

  function selectPlan(chip) {
    var plan = chip.getAttribute('data-sp-plan');
    all('[data-sp-plan]').forEach(function (c) {
      c.classList.toggle('sp-plan--active', c === chip);
      c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
    });

    /* Show only this plan's tables */
    var count = 0;
    all('[data-sp-table]').forEach(function (card) {
      var mine = card.getAttribute('data-sp-belongs') === plan;
      if (mine) { card.removeAttribute('data-sp-offplan'); count++; }
      else card.setAttribute('data-sp-offplan', '');
      card.toggleAttribute('hidden', !mine);
    });

    var title = one('[data-sp-plan-title]');
    if (title) {
      title.textContent = (chip.getAttribute('data-sp-plan-label') || '') + ' · ' + count + ' tables';
    }

    /* Open a table so the seat panel is never orphaned — but respect a table in
       this plan that is already selected (a screen can open with one chosen, and
       adding a table selects it). Only fall back to the first when the previous
       selection belonged to the plan we just switched away from. */
    var visible = all('[data-sp-table]').filter(function (c) { return !c.hasAttribute('hidden'); });
    var keep = visible.filter(function (c) { return c.classList.contains('sp-table--selected'); })[0];
    var open = keep || visible[0];
    if (open) selectTable(open);
    applyFreeSeatsFilter();
  }

  function initPlans() {
    document.addEventListener('click', function (e) {
      var chip = e.target.closest('[data-sp-plan]');
      if (!chip) return;
      /* On the no-plan screen the chip navigates into the workspace */
      var href = chip.getAttribute('data-sp-goto');
      if (href) { location.href = href; return; }
      selectPlan(chip);
    });

    var active = one('[data-sp-plan].sp-plan--active');
    if (active && !active.getAttribute('data-sp-goto')) selectPlan(active);
  }

  /* ------------------------------------------------------ export split menu */

  function initSplit() {
    document.addEventListener('click', function (e) {
      var toggle = e.target.closest('[data-sp-split-toggle]');
      var menu = one('[data-sp-split-menu]');
      if (!menu) return;
      if (toggle) {
        e.stopPropagation();
        menu.toggleAttribute('hidden');
        return;
      }
      if (!e.target.closest('[data-sp-split-menu]')) menu.setAttribute('hidden', '');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var menu = one('[data-sp-split-menu]');
      if (menu) menu.setAttribute('hidden', '');
    });
  }

  /* ------------------------------------------------------------------ boot */

  function boot() {
    stampAllCards();   /* before anything reads who is seated */
    initActions();
    initPlans();
    initTableSelect();
    initSeatActions();
    initTraySearch();
    initFreeSeats();
    initSplit();
    updateTrayCount();
  }

  /* Public surface for the sub-tasks: register a handler by action name and
     that control goes live. Nothing in this file needs to change. */
  window.SeatingPlannerWorkspace = {
    on: function (action, fn) { handlers[action] = fn; },
    toast: toast,
    selectTable: selectTable,
    addToTray: addToTray,
    syncPlanChip: syncPlanChip,
    /* The counterpart of addToTray, for sub-tasks that SEAT someone
       (assign-seat 342309, drag 344759): mirrors the seat rows onto the card's
       dots, count and fill pill, records the occupants, and resyncs the chip. */
    syncSeats: syncSelectedCard,
    /* Re-derive the Unassigned pool, then recount. Order matters: the tray
       renders its rows first, then the shell counts what is visible. */
    refresh: function () {
      applyFreeSeatsFilter();
      notify('unassigned-tray');
      updateTrayCount();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
