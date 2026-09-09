/* Seating Planner — render the plan panel from the model
 * ======================================================
 * Reads window.SeatingData and paints the room strip, the table listing, the table detail and the
 * unassigned tray. Everything countable is DERIVED here and nothing is stored: occupancy, the
 * per-role legend, plan totals, seats free, the pool, and the event's attendee figure.
 *
 * WHY THIS EXISTS. Every "hardcoded" caveat on this surface — seating-room-list,
 * seating-table-grid, seating-table-detail, seating-header — had the same root cause: the numbers
 * were authored by hand, so nothing could switch, filter or stay honest. Four plans cannot be
 * hand-authored markup.
 *
 * THE MARKUP IS DELIBERATELY IDENTICAL to what the template authored by hand. That is the whole
 * safety argument: the eight modals, the export split button and the room-layout dialog all read
 * the DOM (`.table-card__count`, `.table-card__legend-item`, `.seating-header__room-name`,
 * `.table-detail__seats .attendee-card`, …), so as long as this emits the same shapes with the
 * same hooks, all of it keeps working untouched. Change a class name here and you break export.
 *
 * UNASSIGNED = SIGNED UP − ASSIGNED, event-wide (designer, 2026-09-09). "Assigned" means seated
 * anywhere, so switching plans does not move the number — only seating or unseating does.
 */
(function () {
  'use strict';

  if (window.__seatingAppReady) return;
  window.__seatingAppReady = true;

  var D = window.SeatingData;
  if (!D) return;

  var grid    = document.querySelector('[data-sp-grid]');
  var rooms   = document.querySelector('.seating-header__rooms');
  if (!grid || !rooms) return;              /* not the plan panel — nothing to paint */

  var state = {
    planId: D.activePlanId,
    /* The frame opens with Table 1 selected and its detail panel populated, so the baseline does
     * too — an empty detail rail on load would look like a broken screen rather than a choice. */
    tableId: (D.plans.filter(function (p) { return p.id === D.activePlanId; })[0] || D.plans[0])
               .tables[0].id,
    query: '',
    onlyFree: false,
    showUnassigned: false
  };

  /* ── Derivation ────────────────────────────────────────────────────────────────────────────
   * Every number the screen shows comes from one of these. None of them is cached, because a
   * cached count is exactly the thing that drifts from what it describes. */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function plan(id) {
    return D.plans.filter(function (p) { return p.id === (id || state.planId); })[0] || D.plans[0];
  }

  function tableById(id) {
    var found = null;
    D.plans.forEach(function (p) {
      p.tables.forEach(function (t) { if (t.id === id) found = t; });
    });
    return found;
  }

  function seated(t) { return t.seats.filter(Boolean).length; }

  /* Role tally in ROLES order, so a bar's segments always read the same way left to right. */
  function tally(t) {
    var counts = {};
    t.seats.forEach(function (s) { if (s) counts[s.role] = (counts[s.role] || 0) + 1; });
    var out = D.ROLES.filter(function (r) { return counts[r.key]; })
      .map(function (r) { return { key: r.key, label: r.label, n: counts[r.key] }; });
    var empty = t.capacity - seated(t);
    if (empty > 0) out.push({ key: 'empty', label: 'Empty', n: empty });
    return out;
  }

  function planTotals(p) {
    var s = 0, cap = 0;
    p.tables.forEach(function (t) { s += seated(t); cap += t.capacity; });
    return { tables: p.tables.length, seated: s, capacity: cap, free: cap - s };
  }

  /* Seated anywhere in the event, which is what makes the pool event-wide. */
  function assignedIds() {
    var ids = {};
    D.plans.forEach(function (p) {
      p.tables.forEach(function (t) {
        t.seats.forEach(function (s) { if (s) ids[s.personId] = true; });
      });
    });
    return ids;
  }

  function pool() {
    var taken = assignedIds();
    return D.roster.filter(function (person) { return !taken[person.id]; });
  }

  function person(id) {
    return D.roster.filter(function (p) { return p.id === id; })[0] || { name: '', company: '' };
  }

  function roleLabel(key) {
    var r = D.ROLES.filter(function (x) { return x.key === key; })[0];
    return r ? r.label : key;
  }

  function typeOf(t) {
    if (!t.typeId) return null;
    return D.TYPES.filter(function (x) { return x.id === t.typeId; })[0] || null;
  }

  /* ── Room strip ────────────────────────────────────────────────────────────────────────────
   * Four cards. The selected one takes `--selected`; a full plan swaps its progress fill to
   * success and gains a FullBadge; a plan with nobody seated reads "N tables · Empty" rather
   * than "0/N seated" — a distinct copy form the frame draws, not a formatting edge case. */
  function renderRooms() {
    rooms.innerHTML = D.plans.map(function (p) {
      var tot = planTotals(p);
      var isSel = p.id === state.planId;
      var isFull = tot.capacity > 0 && tot.free === 0;
      var isEmpty = tot.seated === 0;
      var pct = tot.capacity ? Math.round((tot.seated / tot.capacity) * 100) : 0;

      return '' +
        '<article class="room-card' + (isSel ? ' room-card--selected' : '') + '"' +
                ' data-sp-plan-card="' + esc(p.id) + '" data-backend-todo="seating-room-list">' +
          '<div class="room-card__header">' +
            '<h3 class="room-card__name">' +
              '<button type="button" class="room-card__select">' + esc(p.name) + '</button>' +
            '</h3>' +
            '<div class="room-card__actions">' +
              /* data-ep-open / data-dp-open are the Edit Plan and Delete Plan hooks — explicit
               * rather than icon- or label-matched, for the reason the authored markup records:
               * createIcons() consumes data-lucide, so an icon selector stops matching. */
              '<button type="button" class="btn btn--secondary btn--icon btn--2xs"' +
                     ' aria-label="Edit ' + esc(p.name) + '" data-ep-open>' +
                '<i data-lucide="pencil" aria-hidden="true"></i></button>' +
              '<button type="button" class="btn btn--secondary btn--icon btn--2xs"' +
                     ' aria-label="Delete ' + esc(p.name) + '" data-dp-open>' +
                '<i data-lucide="trash" aria-hidden="true"></i></button>' +
            '</div>' +
          '</div>' +
          '<div class="room-card__meta">' +
            '<p class="room-card__counts">' + tot.tables + ' tables · ' +
              (isEmpty ? 'Empty'
                       : tot.seated + '/' + tot.capacity + '<span class="room-card__seated"> seated</span>') +
            '</p>' +
            (isFull ? '<span class="full-badge"><i data-lucide="check" aria-hidden="true"></i>Full</span>'
                    : '<p class="room-card__free">' + tot.free + ' seats free</p>') +
          '</div>' +
          '<div class="room-card__progress" aria-hidden="true">' +
            /* Press Room draws no fill at all rather than a 0%-wide one. */
            (tot.seated === 0 ? '' :
              '<div class="room-card__progress-fill' + (isFull ? ' room-card__progress-fill--full' : '') +
                   '" style="width: ' + pct + '%"></div>') +
          '</div>' +
        '</article>';
    }).join('');
  }

  /* ── Table listing ─────────────────────────────────────────────────────────────────────────
   * `data-sp-table` carries the table's id and `data-sp-card` marks the card, because that is
   * what the Table form and Delete table modals already look for. */
  function visibleTables() {
    var q = state.query.trim().toLowerCase();
    return plan().tables.filter(function (t) {
      if (state.onlyFree && seated(t) >= t.capacity) return false;
      if (!q) return true;
      var type = typeOf(t);
      return t.name.toLowerCase().indexOf(q) > -1 ||
             (t.sponsor || '').toLowerCase().indexOf(q) > -1 ||
             (type ? type.label.toLowerCase().indexOf(q) > -1 : false);
    });
  }

  function renderListing() {
    var list = visibleTables();

    if (!list.length) {
      grid.innerHTML = '<p class="table-listing__empty">No tables match “' + esc(state.query) + '”.</p>';
      return;
    }

    grid.innerHTML = list.map(function (t) {
      var n = seated(t);
      var isFull = n >= t.capacity;
      var type = typeOf(t);
      var split = tally(t);

      var bar = split.map(function (part) {
        return '<span class="table-card__seg table-card__seg--' + part.key +
               '" style="--seg: ' + part.n + '"></span>';
      }).join('');

      var legend = split.map(function (part) {
        return '<span class="table-card__legend-item table-card__legend-item--' + part.key + '">' +
               '<span class="table-card__swatch"></span>' + esc(part.label) + ' (' + part.n + ')</span>';
      }).join('');

      return '' +
        '<article class="table-card' + (t.id === state.tableId ? ' table-card--selected' : '') + '"' +
                ' data-sp-card data-sp-table="' + esc(t.id) + '" tabindex="0" role="button"' +
                ' aria-pressed="' + (t.id === state.tableId ? 'true' : 'false') + '">' +
          /* Nesting matters here, and TableCard's own CSS dictates it: `__header` is a COLUMN,
           * `__titles` is a ROW holding the name and the chip (hence
           * `.table-card__titles .table-type { flex-shrink: 0 }`), and `__sponsor` is a
           * full-width sibling of `__titles` with its own top padding.
           *
           * Both were wrong first time — the sponsor went inside `__titles`, where the row
           * layout squeezed the name into a two-line wrap with "Mastercard" overlapping it, and
           * the chip went outside `__titles`, so it dropped onto its own line instead of
           * sitting right of the name. */
          '<div class="table-card__header">' +
            '<div class="table-card__titles">' +
              '<h3 class="table-card__name">' +
                '<button type="button" class="table-card__select">' + esc(t.name) + '</button>' +
              '</h3>' +
              /* The tier chip. Its LABEL is data and its COLOUR is the tier's variant — the
               * baseline's "Headline Sponsor" and "Platinum" are the Gold and VIP variants with
               * the label overridden, which is why these are two separate fields. */
              (type
                ? '<span class="table-type table-type--' + esc(type.variant) + '">' +
                  esc(type.label) + '</span>'
                : '') +
            '</div>' +
            (t.sponsor
              ? '<p class="table-card__sponsor"><i data-lucide="handshake" aria-hidden="true"></i>' +
                esc(t.sponsor) + '</p>'
              : '') +
          '</div>' +
          '<hr class="table-card__rule">' +
          '<div class="table-card__viz">' +
            '<div class="table-card__bar" aria-hidden="true">' + bar + '</div>' +
            '<div class="table-card__legend">' + legend + '</div>' +
          '</div>' +
          '<hr class="table-card__rule">' +
          '<div class="table-card__footer">' +
            '<div class="table-card__count-group">' +
              '<p class="table-card__count">' + n + ' / ' + t.capacity + ' seated</p>' +
              (isFull ? '<span class="full-badge"><i data-lucide="check" aria-hidden="true"></i>Full</span>' : '') +
            '</div>' +
            '<div class="table-card__actions">' +
              '<button type="button" class="btn btn--secondary btn--icon btn--2xs"' +
                     ' aria-label="Edit ' + esc(t.name) + '" data-tf-open>' +
                '<i data-lucide="pencil" aria-hidden="true"></i></button>' +
              '<button type="button" class="btn btn--secondary btn--icon btn--2xs"' +
                     ' aria-label="Delete ' + esc(t.name) + '" data-dtb-open>' +
                '<i data-lucide="trash" aria-hidden="true"></i></button>' +
            '</div>' +
          '</div>' +
        '</article>';
    }).join('');
  }

  /* ── Table detail ──────────────────────────────────────────────────────────────────────────
   * Occupied seats first in seat order, then the empty ones, which is how the authored markup
   * reads. Each row carries its role modifier so the accent bar matches the role — the authored
   * cards omitted it and therefore all showed the attendee colour. */
  function renderDetail() {
    var host = document.querySelector('[data-sp-detail]');
    if (!host) return;

    var nameEl  = host.querySelector('[data-sp-detail-name]');
    var countEl = host.querySelector('[data-sp-detail-count]');
    var seatsEl = host.querySelector('.table-detail__seats');
    var t = state.tableId ? tableById(state.tableId) : null;

    if (!t) {
      if (nameEl) nameEl.textContent = 'No table selected';
      if (countEl) countEl.textContent = '';
      if (seatsEl) seatsEl.innerHTML =
        '<p class="table-detail__empty">Select a table to see who is seated at it.</p>';
      return;
    }

    if (nameEl) nameEl.textContent = t.name;
    if (countEl) countEl.textContent = seated(t) + ' / ' + t.capacity + ' seated';
    if (!seatsEl) return;

    seatsEl.innerHTML = t.seats.map(function (s, i) {
      var num = i + 1;
      if (!s) {
        return '<article class="attendee-card attendee-card--empty" data-sp-seat="' + num + '">' +
          '<span class="attendee-card__accent" aria-hidden="true">' +
            '<span class="attendee-card__accent-bar"></span></span>' +
          '<span class="attendee-card__seat">' + num + '</span>' +
          '<p class="attendee-card__empty-label">Empty seat</p>' +
          '<div class="attendee-card__actions">' +
            '<button type="button" class="attendee-card__action" data-sp-assign="' + num + '"' +
                   ' aria-label="Assign someone to seat ' + num + '">' +
              '<i data-lucide="user-plus" aria-hidden="true"></i></button>' +
          '</div>' +
        '</article>';
      }
      var p = person(s.personId);
      return '<article class="attendee-card attendee-card--' + s.role + '" data-sp-seat="' + num + '">' +
        '<span class="attendee-card__accent" aria-hidden="true">' +
          '<span class="attendee-card__accent-bar"></span></span>' +
        '<span class="attendee-card__seat">' + num + '</span>' +
        '<div class="attendee-card__body">' +
          '<p class="attendee-card__name">' + esc(p.name) + '</p>' +
          '<p class="attendee-card__meta">' +
            '<span class="attendee-card__company">' + esc(p.company) + '</span>' +
            '<span class="attendee-card__sep" aria-hidden="true">·</span>' +
            '<span class="attendee-card__role">' + esc(roleLabel(s.role)) + '</span>' +
          '</p>' +
        '</div>' +
        '<div class="attendee-card__actions">' +
          '<button type="button" class="attendee-card__action" data-sp-unseat="' + num + '"' +
                 ' aria-label="Remove ' + esc(p.name) + ' from seat ' + num + '">' +
            '<i data-lucide="trash" aria-hidden="true"></i></button>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  /* ── Unassigned tray ───────────────────────────────────────────────────────────────────────
   * Signed up minus assigned, event-wide. Hidden until the toolbar toggle asks for it, which is
   * what that toggle has always implied and never did. */
  function renderPool() {
    var host = document.querySelector('[data-sp-pool]');
    if (!host) return;

    var everyone = pool();
    var q = (document.querySelector('[data-sp-pool-search]') || {}).value || '';
    var shown = q.trim()
      ? everyone.filter(function (p) {
          var t = q.trim().toLowerCase();
          return p.name.toLowerCase().indexOf(t) > -1 || p.company.toLowerCase().indexOf(t) > -1;
        })
      : everyone;

    var countEl = host.querySelector('[data-sp-pool-count]');
    if (countEl) countEl.textContent = everyone.length;

    var listEl = host.querySelector('[data-sp-pool-list]');
    if (!listEl) return;

    if (!shown.length) {
      listEl.innerHTML = '<div class="unassigned__empty">' +
        '<p class="unassigned__empty-title">' +
          (everyone.length ? 'Nobody matches that search' : 'Everyone is seated') + '</p>' +
        '<p class="unassigned__empty-text">' +
          (everyone.length
            ? 'Clear the search to see all ' + everyone.length + ' unassigned.'
            : 'Every signed-up attendee has a seat.') + '</p></div>';
      return;
    }

    listEl.innerHTML = shown.map(function (p) {
      return '<article class="attendee-card" data-sp-pool-person="' + esc(p.id) + '">' +
        '<span class="attendee-card__accent" aria-hidden="true">' +
          '<span class="attendee-card__accent-bar"></span></span>' +
        '<div class="attendee-card__body">' +
          '<p class="attendee-card__name">' + esc(p.name) + '</p>' +
          '<p class="attendee-card__meta">' +
            '<span class="attendee-card__company">' + esc(p.company) + '</span>' +
          '</p>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  /* ── Header and toolbar ────────────────────────────────────────────────────────────────────
   * The attendee figure is the roster length and the unassigned figure is the pool — both
   * derived, both moving, per the designer's definition. */
  function renderChrome() {
    var p = plan();

    document.querySelectorAll('.seating-header__room-name').forEach(function (el) {
      el.textContent = p.name;
    });

    var unEl = document.querySelector('[data-sp-unassigned-count]');
    if (unEl) unEl.textContent = '(' + pool().length + ' Unassigned)';

    var attEl = document.querySelector('[data-sp-attendee-count]');
    if (attEl) attEl.textContent = D.roster.length + ' attendees';

    var aside = document.querySelector('[data-sp-pool-region]');
    if (aside) aside.hidden = !state.showUnassigned;
  }

  function render() {
    renderRooms();
    renderListing();
    renderDetail();
    renderPool();
    renderChrome();
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }

  /* ── Mutation ──────────────────────────────────────────────────────────────────────────────
   * Each of these changes the model and re-renders. Nothing writes a count anywhere. */

  function selectTable(id) {
    state.tableId = id;
    render();
  }

  function unseat(seatNo) {
    var t = tableById(state.tableId);
    if (!t) return;
    var slot = t.seats[seatNo - 1];
    if (!slot) return;
    var p = person(slot.personId);
    t.seats[seatNo - 1] = null;
    render();
    toast([{ text: p.name, strong: true }, { text: ' returned to the unassigned pool.' }], 'success');
  }

  /* Assign takes the first person in the pool — the tray is the queue, so "next up" is the
   * honest behaviour until a picker exists. Role defaults to attendee; changing a seat's role is
   * seating-seat-occupant-record and is not built. */
  function assign(seatNo) {
    var t = tableById(state.tableId);
    if (!t) return;
    var next = pool()[0];
    if (!next) {
      toast([{ text: 'Nobody left to seat', strong: true },
             { text: ' — every signed-up attendee already has a seat.' }], 'error');
      return;
    }
    t.seats[seatNo - 1] = { personId: next.id, role: 'attendee' };
    render();
    toast([{ text: next.name, strong: true },
           { text: ' seated at ' + t.name + ', seat ' + seatNo + '.' }], 'success');
  }

  function toast(parts, type) {
    document.dispatchEvent(new CustomEvent('sp:toast', { detail: { parts: parts, type: type } }));
  }

  /* ── Events ────────────────────────────────────────────────────────────────────────────────
   * Delegated, so a re-render never leaves a dead listener behind. */

  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;

    var planCard = e.target.closest('[data-sp-plan-card]');
    if (planCard && !e.target.closest('[data-ep-open]') && !e.target.closest('[data-dp-open]')) {
      var id = planCard.getAttribute('data-sp-plan-card');
      if (id !== state.planId) {
        state.planId = id;
        /* Select the new plan's first table rather than clearing. Clearing was the first
         * attempt and it left the detail rail empty every time you changed room — including
         * on the way BACK to a plan you had been looking at, which read as the panel breaking
         * rather than as a deliberate "nothing selected". Matches the load behaviour. */
        var first = plan(id).tables[0];
        state.tableId = first ? first.id : null;
        render();
      }
      return;
    }

    /* Not the edit/delete buttons inside the card — those are the modals' own hooks. */
    var card = e.target.closest('[data-sp-card]');
    if (card && !e.target.closest('[data-tf-open]') && !e.target.closest('[data-dtb-open]')) {
      selectTable(card.getAttribute('data-sp-table'));
      return;
    }

    var un = e.target.closest('[data-sp-unseat]');
    if (un) { unseat(parseInt(un.getAttribute('data-sp-unseat'), 10)); return; }

    var as = e.target.closest('[data-sp-assign]');
    if (as) { assign(parseInt(as.getAttribute('data-sp-assign'), 10)); return; }
  });

  /* Enter / Space on a card. The cards are role="button" tabindex="0", so they announce as
   * buttons and take focus — but a div does not synthesise a click from Enter, which is why
   * seating-card-keyboard has been an open WCAG 2.1.1 defect on every layout. Fixed here. */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var card = e.target.closest ? e.target.closest('[data-sp-card]') : null;
    if (!card) return;
    e.preventDefault();                 /* Space would otherwise scroll the page */
    selectTable(card.getAttribute('data-sp-table'));
  });

  document.addEventListener('input', function (e) {
    if (e.target.matches('#sp-find-table')) {
      state.query = e.target.value;
      renderListing();
      if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
      return;
    }
    if (e.target.matches('[data-sp-pool-search]')) {
      renderPool();
      if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
    }
  });

  /* `toggle:change`, NOT `change`. Both switches are `<button role="switch">` driven by
   * Toggle.js, which flips `.toggle--active`, syncs `aria-checked` and emits `toggle:change`
   * (bubbles, `detail: { active }`). A `change` listener reading `.checked` would never fire —
   * a button has no `.checked`. This is the listener seating-header records as missing:
   * "the switch flips itself and reports toggle:change, but nothing listens". */
  document.addEventListener('toggle:change', function (e) {
    var id = e.target && e.target.id;
    if (id === 'sp-free-seats') {
      state.onlyFree = !!e.detail.active;
      renderListing();
      if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
      return;
    }
    if (id === 'sp-show-unassigned') {
      state.showUnassigned = !!e.detail.active;
      renderChrome();
    }
  });

  render();
  window.SeatingApp = { render: render, state: state };
}());
