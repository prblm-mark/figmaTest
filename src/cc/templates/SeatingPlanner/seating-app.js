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
    showUnassigned: false,
    /* Who is "in the air". `{ kind:'pool', personId }` or `{ kind:'seat', tableId, seatNo }`.
     * ONE piece of state serves both drag and pick-then-place, which is the whole point:
     * seating-touch-placement records that "pick-then-place is the mechanism and drag is an
     * accelerator for it", because keyboard users cannot drag. Two code paths, one placement. */
    picked: null
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
    var metaEl  = host.querySelector('[data-sp-detail-meta]');
    var rowEl   = host.querySelector('[data-sp-detail-header-row]');
    var seatsEl = host.querySelector('.table-detail__seats');
    var legendEl = host.querySelector('[data-sp-detail-legend]');
    var t = state.tableId ? tableById(state.tableId) : null;

    /* The tier chip sits on row 1 beside the name, so it is added and removed here rather than
     * being written with the meta line — which is now row 2 and no longer shares a box with it.
     * Never left in place as an empty element: `__header-row` is a flex row with an 8px gap, so
     * an empty chip would still take a gap and push the name. */
    function chip(type) {
      if (!rowEl) return;
      var old = rowEl.querySelector('.table-type');
      if (old) old.remove();
      if (!type) return;
      rowEl.insertAdjacentHTML('beforeend',
        '<span class="table-type table-type--' + esc(type.variant) + '">' +
        esc(type.label) + '</span>');
    }

    /* `data-sp-detail-count` must survive every rebuild — SeatingPlanner.js reads it live in six
     * places (the Table form's reduced-capacity warning, the export snapshot, the toasts). */
    function meta(inner) {
      if (metaEl) metaEl.innerHTML =
        '<span class="table-detail__count" data-sp-detail-count>' + inner + '</span>';
    }

    if (!t) {
      if (nameEl) nameEl.textContent = 'No table selected';
      meta('');
      chip(null);
      if (legendEl) legendEl.hidden = true;
      if (seatsEl) seatsEl.innerHTML =
        '<p class="table-detail__empty">Select a table to see who is seated at it.</p>';
      return;
    }

    if (nameEl) nameEl.textContent = t.name;

    /* Meta line and tier chip. Both were missing entirely — the detail panel showed only the
     * name and the count, so a table with a tier and a sponsor (baseline Table 1: Headline
     * Sponsor / Mastercard) looked identical in the rail to an untyped one, even though its own
     * card in the listing drew both. Same class of miss as the legend.
     *
     * The chip's LABEL is data and its COLOUR is the tier's variant — "Headline Sponsor" is the
     * Gold variant relabelled — which is why typeOf() returns the two separately.
     *
     * The `·` is emitted with the sponsor, not before it: a table with no sponsor would
     * otherwise read "10 / 10 seated ·". Figma draws a sponsor and a chip on all four desktop
     * variants and never draws their absence, so the conditional follows TableCard's
     * established rule — untyped means no chip rather than an invented empty state.
     *
     * The chip goes to `__header-row` (row 1) and the meta to its sibling row below, which is
     * why a long tier label no longer truncates the sponsor. Designer's call 2026-09-10; the
     * reasoning and the measurements are in TableDetail.css. */
    meta(seated(t) + ' / ' + t.capacity + ' seated');
    if (metaEl && t.sponsor) {
      metaEl.insertAdjacentHTML('beforeend',
        '<span class="table-detail__sep" aria-hidden="true">\u00b7</span>' +
        '<span class="table-detail__sponsor">' +
          '<i data-lucide="handshake" aria-hidden="true"></i>' +
          '<span class="table-detail__sponsor-name">' + esc(t.sponsor) + '</span>' +
        '</span>');
    }
    chip(typeOf(t));

    /* ── Legend ────────────────────────────────────────────────────────────────────────────
     * Distinct roles actually seated, in the order they first appear down the seat list —
     * which is what reproduces TableDetail's own demo (Host, VIP, Speaker, Sponsor, Attendee
     * for a table whose seat 1 is the host). Deliberately NOT the fixed ROLES order used for
     * TableCard's bar: that one is a proportional bar where a stable left-to-right order
     * matters, this one is a key to a list.
     *
     * Nobody seated means NO legend — TableDetail's notes: "Default has none at all rather
     * than an empty container." Hidden rather than emptied, so it leaves both the layout and
     * the accessibility tree.
     *
     * No counts on these items, unlike TableCard's. */
    if (legendEl) {
      var seen = [];
      t.seats.forEach(function (slot) {
        if (slot && seen.indexOf(slot.role) === -1) seen.push(slot.role);
      });
      legendEl.hidden = seen.length === 0;
      legendEl.innerHTML = seen.map(function (role) {
        return '<span class="table-detail__legend-item table-detail__legend-item--' + role + '">' +
               '<span class="table-detail__swatch"></span>' + esc(roleLabel(role)) + '</span>';
      }).join('');
    }

    if (!seatsEl) return;

    seatsEl.innerHTML = t.seats.map(function (s, i) {
      var num = i + 1;
      if (!s) {
        return '<article class="attendee-card attendee-card--empty"' +
               ' data-sp-seat="' + num + '" tabindex="0"' +
               ' aria-label="Seat ' + num + ', empty">' +
          '<span class="attendee-card__accent" aria-hidden="true">' +
            '<span class="attendee-card__accent-bar"></span></span>' +
          '<span class="attendee-card__seat">' + num + '</span>' +
          '<p class="attendee-card__empty-label">Empty seat</p>' +
          /* Figma's Empty variant composes Button as `btn btn--secondary btn--sm` with the label
           * "Assign" (3474:89216) — AttendeeCard's own notes say so too. The first version used
           * an icon-only `user-plus` action, which is not what the component draws. */
          '<button type="button" class="btn btn--secondary btn--sm" data-sp-assign="' + num + '"' +
                 ' aria-label="Assign someone to seat ' + num + '">Assign</button>' +
        '</article>';
      }
      var p = person(s.personId);
      /* Draggable AND focusable: drag is the accelerator, tabindex is what makes the same
       * placement reachable by keyboard — a keyboard user cannot drag at all. */
      return '<article class="attendee-card attendee-card--' + s.role + '"' +
              ' data-sp-seat="' + num + '" data-sp-pickable draggable="true" tabindex="0"' +
              ' aria-label="Seat ' + num + ', ' + esc(p.name) + '. Press Enter to pick up.">' +
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
          /* Reorder. AttendeeCard already draws and styles this stack — the first version of
           * this renderer simply dropped it. Up/down SWAP with the adjacent seat, so moving into
           * an empty seat and trading places with an occupied one are the same operation. */
          '<div class="attendee-card__reorder">' +
            '<button type="button" class="attendee-card__action" data-sp-move-up="' + num + '"' +
                   ' aria-label="Move ' + esc(p.name) + ' up"' + (num === 1 ? ' disabled' : '') + '>' +
              '<i data-lucide="chevron-up" aria-hidden="true"></i></button>' +
            '<button type="button" class="attendee-card__action" data-sp-move-down="' + num + '"' +
                   ' aria-label="Move ' + esc(p.name) + ' down"' +
                   (num === t.capacity ? ' disabled' : '') + '>' +
              '<i data-lucide="chevron-down" aria-hidden="true"></i></button>' +
          '</div>' +
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
      return '<article class="attendee-card"' +
              ' data-sp-pool-person="' + esc(p.id) + '" data-sp-pickable' +
              ' draggable="true" tabindex="0"' +
              ' aria-label="' + esc(p.name) + ', unassigned. Press Enter to pick up.">' +
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
    decoratePick();
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

  /* ── Placement: the five moves, one function ───────────────────────────────────────────────
   * seating-drag-assign lists four placements from the brief plus a fifth the interaction
   * implies, and they ALL land here:
   *
   *   pool  -> empty seat    seat
   *   pool  -> table card    first free seat, or refused "… is full"
   *   seat  -> seat          move, or SWAP when the target is occupied
   *   seat  -> pool          unseat
   *   seat  -> other card    the implied fifth
   *
   * Drag and pick-then-place both call `place()`, so there is one set of rules rather than two
   * that can disagree. A swap is deliberately a single simultaneous exchange, not
   * remove-then-insert — the manifest warns that modelling it as delete/insert is how the pair
   * ends up in the same seat. */

  /* Can the pick land here, and as what? Returns 'move' | 'swap' | 'full' | null.
   * These double as the highlight rules, so what lights up is exactly what will work. */
  function seatDrop(tableId, seatNo) {
    var src = state.picked;
    if (!src) return null;
    var t = tableById(tableId);
    if (!t) return null;
    if (src.kind === 'seat' && src.tableId === tableId && src.seatNo === seatNo) return null;
    var dest = t.seats[seatNo - 1];
    /* pool -> occupied seat is NOT one of the five. Refusing it beats silently evicting
     * somebody the planner never chose to move. */
    if (src.kind === 'pool') return dest ? null : 'move';
    return dest ? 'swap' : 'move';
  }

  function tableDrop(tableId) {
    var src = state.picked;
    if (!src) return null;
    var t = tableById(tableId);
    if (!t) return null;
    var free = t.seats.indexOf(null);
    return free === -1 ? 'full' : 'move';
  }

  function poolDrop() {
    return state.picked && state.picked.kind === 'seat' ? 'move' : null;
  }

  function takeFrom(src) {
    if (src.kind === 'pool') return { personId: src.personId, role: 'attendee' };
    var t = tableById(src.tableId);
    return t ? t.seats[src.seatNo - 1] : null;
  }

  function nameOf(slot) { return slot ? person(slot.personId).name : ''; }

  function place(target) {
    var src = state.picked;
    if (!src) return;

    /* Resolve a table-card drop to its first free seat, or refuse and KEEP the pick so the
     * planner can aim somewhere else without picking the person up again. */
    if (target.kind === 'table') {
      var t = tableById(target.tableId);
      if (!t) { clearPick(); return; }
      var free = t.seats.indexOf(null);
      if (free === -1) {
        toast([{ text: t.name, strong: true }, { text: ' is full — nothing was moved.' }], 'error');
        return;
      }
      target = { kind: 'seat', tableId: target.tableId, seatNo: free + 1 };
    }

    var moving = takeFrom(src);
    if (!moving) { clearPick(); return; }

    if (target.kind === 'pool') {
      if (src.kind !== 'seat') { clearPick(); return; }      /* pool -> pool is a no-op */
      tableById(src.tableId).seats[src.seatNo - 1] = null;
      finish([{ text: nameOf(moving), strong: true },
              { text: ' returned to the unassigned pool.' }]);
      return;
    }

    var destTable = tableById(target.tableId);
    var kind = seatDrop(target.tableId, target.seatNo);
    if (!kind) { clearPick(); return; }

    var displaced = destTable.seats[target.seatNo - 1];

    if (src.kind === 'seat') {
      /* The exchange, both sides at once. */
      tableById(src.tableId).seats[src.seatNo - 1] = displaced || null;
    }
    destTable.seats[target.seatNo - 1] = moving;

    if (kind === 'swap' && displaced) {
      finish([{ text: nameOf(moving), strong: true },
              { text: ' swapped with ' }, { text: nameOf(displaced), strong: true },
              { text: ' at ' + destTable.name + '.' }]);
    } else {
      finish([{ text: nameOf(moving), strong: true },
              { text: ' seated at ' + destTable.name + ', seat ' + target.seatNo + '.' }]);
    }
  }

  function finish(parts) {
    state.picked = null;
    render();
    toast(parts, 'success');
  }

  /* Picking somebody up changes NO data, so it must not re-render — it only decorates.
   *
   * This was a real bug, not a tidiness point: `pick()` used to call `render()`, which replaced
   * the listing and the detail via innerHTML. On `dragstart` that detaches the very element
   * being dragged, so the browser had nothing to drag and no `drop` ever fired — and because
   * `dragend` also fired on the detached node, `picked` stayed set and the NEXT click was
   * silently treated as a placement. Decorating in place fixes the drag and stops the keyboard
   * path losing focus on pick. */
  function clearPick() {
    if (!state.picked) return;
    state.picked = null;
    undecorate();
  }

  function pick(src) {
    undecorate();
    state.picked = src;
    decoratePick();
  }

  /* Strip every mark decoratePick() can apply. Kept beside it deliberately — a mark added there
   * and not removed here survives as a permanently highlighted row. */
  function undecorate() {
    var bar = document.querySelector('[data-sp-pick-bar]');
    if (bar) bar.hidden = true;
    clearOver();
  }

  /* ── Reorder ───────────────────────────────────────────────────────────────────────────────
   * The up/down chevrons AttendeeCard already draws. A swap with the adjacent seat, so moving
   * into an empty seat and trading places with an occupied one are one operation. */
  function moveSeat(seatNo, delta) {
    var t = tableById(state.tableId);
    if (!t) return;
    var to = seatNo + delta;
    if (to < 1 || to > t.capacity) return;

    var moving = t.seats[seatNo - 1];
    if (!moving) return;
    var other = t.seats[to - 1];

    t.seats[seatNo - 1] = other || null;
    t.seats[to - 1] = moving;
    render();

    /* Keep focus on the row that moved rather than on whatever now occupies the old index —
     * otherwise a keyboard user pressing "down" twice moves two different people. */
    var landed = document.querySelector('[data-sp-seat="' + to + '"] [data-sp-move-' +
                 (delta < 0 ? 'up' : 'down') + '="' + to + '"]');
    if (landed) landed.focus();

    toast(other
      ? [{ text: nameOf(moving), strong: true }, { text: ' swapped with ' },
         { text: nameOf(other), strong: true }, { text: ' — seats ' + seatNo + ' and ' + to + '.' }]
      : [{ text: nameOf(moving), strong: true }, { text: ' moved to seat ' + to + '.' }],
      'success');
  }

  /* ── Pick decoration ──────────────────────────────────────────────────────────────────────
   * Applied AFTER render rather than threaded through every template, so the emitted markup
   * stays byte-identical to the authored markup whenever nothing is in the air — which is what
   * keeps export and the modals reading a DOM they recognise. */
  function decoratePick() {
    var bar = document.querySelector('[data-sp-pick-bar]');
    var src = state.picked;

    if (!src) {
      if (bar) bar.hidden = true;
      return;
    }

    var slot = takeFrom(src);
    if (bar) {
      bar.hidden = false;
      bar.querySelector('[data-sp-pick-name]').textContent = nameOf(slot);
    }

    /* NOTHING is highlighted here. `--dragged-over` means the ONE card currently under the
     * pointer, and it is applied by markOver() below on dragenter / hover / focus.
     *
     * This function used to add it to every LEGAL seat, which lit up most of the list at once.
     * That was the prototype's "legal targets" framing surviving a second time in the same
     * feature — the component's state is named Dragged **Over**, and the designer put it
     * plainly: "it should only highlight the table of attendee when it is being dragged over by
     * the item being dragged."
     *
     * No highlight on a table card or on the tray either. Both are still real drop targets — the
     * brief asks for pool->card and seat->pool — but TableCard has twelve variants and NO drag
     * state, and Unassigned has two variants and no state axis at all. Flagged. */
  }

  /* ── The one card under the pointer ────────────────────────────────────────────────────────
   * `overEl` is tracked so a `dragover` storm (it fires continuously) does not re-run a
   * querySelectorAll on every event. */
  var overEl = null;

  function clearOver() {
    document.querySelectorAll('.attendee-card--dragged-over').forEach(function (el) {
      el.classList.remove('attendee-card--dragged-over');
    });
    overEl = null;
  }

  /* Legality still gates it: an illegal target must NOT light up, or the highlight would promise
   * a drop that place() then refuses. */
  function markOver(el) {
    if (el === overEl) return;
    clearOver();
    if (!el || !state.picked) return;
    var no = parseInt(el.getAttribute('data-sp-seat'), 10);
    if (!seatDrop(state.tableId, no)) return;
    el.classList.add('attendee-card--dragged-over');
    overEl = el;
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

    /* Not the edit/delete buttons inside the card — those are the modals' own hooks. And NOT
     * while somebody is in the air: with a pick live, a card click is a placement, handled
     * below. Without this guard, aiming at a table would silently just change the selection —
     * the trap seating-touch-placement records as "picking does not hijack table selection",
     * here in the other direction. */
    var card = e.target.closest('[data-sp-card]');
    if (card && !state.picked &&
        !e.target.closest('[data-tf-open]') && !e.target.closest('[data-dtb-open]')) {
      selectTable(card.getAttribute('data-sp-table'));
      return;
    }

    var un = e.target.closest('[data-sp-unseat]');
    if (un) { unseat(parseInt(un.getAttribute('data-sp-unseat'), 10)); return; }

    /* Reorder, before the pick/place handling below — these are buttons inside a pickable row,
     * so without returning here a chevron click would also pick the person up. */
    var up = e.target.closest('[data-sp-move-up]');
    if (up) { moveSeat(parseInt(up.getAttribute('data-sp-move-up'), 10), -1); return; }
    var dn = e.target.closest('[data-sp-move-down]');
    if (dn) { moveSeat(parseInt(dn.getAttribute('data-sp-move-down'), 10), 1); return; }

    var as = e.target.closest('[data-sp-assign]');
    if (as) { assign(parseInt(as.getAttribute('data-sp-assign'), 10)); return; }

    if (e.target.closest('[data-sp-pick-cancel]')) { clearPick(); return; }

    /* ── Pick-then-place ──────────────────────────────────────────────────────────────────
     * With nothing in the air a click on a person picks them up; with something in the air a
     * click on a target places them. Same rules as drag, because both call place(). */
    var seatEl = e.target.closest('[data-sp-seat]');
    var poolEl = e.target.closest('[data-sp-pool-person]');
    var poolRegion = e.target.closest('[data-sp-pool]');

    if (state.picked) {
      if (seatEl) {
        place({ kind: 'seat', tableId: state.tableId,
                seatNo: parseInt(seatEl.getAttribute('data-sp-seat'), 10) });
        return;
      }
      /* The pool REGION, not just a row — dropping a seated person anywhere in the tray
       * unseats them, which is what the rail as a target means. */
      if (poolRegion) { place({ kind: 'pool' }); return; }
      if (card) { place({ kind: 'table', tableId: card.getAttribute('data-sp-table') }); return; }
      clearPick();
      return;
    }

    if (poolEl) { pick({ kind: 'pool', personId: poolEl.getAttribute('data-sp-pool-person') }); return; }
    if (seatEl && seatEl.hasAttribute('data-sp-pickable')) {
      pick({ kind: 'seat', tableId: state.tableId,
             seatNo: parseInt(seatEl.getAttribute('data-sp-seat'), 10) });
    }
  });

  /* Enter / Space on a card. The cards are role="button" tabindex="0", so they announce as
   * buttons and take focus — but a div does not synthesise a click from Enter, which is why
   * seating-card-keyboard has been an open WCAG 2.1.1 defect on every layout. Fixed here. */
  document.addEventListener('keydown', function (e) {
    if (!e.target.closest) return;

    /* Esc puts the person back down. The whole flow has to be abandonable without placing
     * somebody somewhere by accident. */
    if (e.key === 'Escape' && state.picked) { e.preventDefault(); clearPick(); return; }

    if (e.key !== 'Enter' && e.key !== ' ') return;

    var seatEl = e.target.closest('[data-sp-seat]');
    var poolEl = e.target.closest('[data-sp-pool-person]');

    /* Pick and place from the keyboard — the reason placement is not drag-only. A keyboard
     * user cannot drag at all, so if this path did not exist the feature would be
     * mouse-exclusive (seating-touch-placement). */
    if (state.picked) {
      if (seatEl) {
        e.preventDefault();
        place({ kind: 'seat', tableId: state.tableId,
                seatNo: parseInt(seatEl.getAttribute('data-sp-seat'), 10) });
        return;
      }
      var cardT = e.target.closest('[data-sp-card]');
      if (cardT) {
        e.preventDefault();
        place({ kind: 'table', tableId: cardT.getAttribute('data-sp-table') });
        return;
      }
    } else if (poolEl || (seatEl && seatEl.hasAttribute('data-sp-pickable'))) {
      e.preventDefault();
      if (poolEl) pick({ kind: 'pool', personId: poolEl.getAttribute('data-sp-pool-person') });
      else pick({ kind: 'seat', tableId: state.tableId,
                  seatNo: parseInt(seatEl.getAttribute('data-sp-seat'), 10) });
      return;
    }

    var card = e.target.closest('[data-sp-card]');
    if (!card) return;
    e.preventDefault();                 /* Space would otherwise scroll the page */
    selectTable(card.getAttribute('data-sp-table'));
  });

  /* ── Drag: an accelerator over the same placement ─────────────────────────────────────────
   * dragstart sets the SAME `picked` state a click would, so the highlighting, the legality
   * rules and the placement are shared. Nothing here re-decides what is allowed. */
  document.addEventListener('dragstart', function (e) {
    var row = e.target.closest && e.target.closest('[data-sp-pickable]');
    if (!row) return;
    if (row.hasAttribute('data-sp-pool-person')) {
      pick({ kind: 'pool', personId: row.getAttribute('data-sp-pool-person') });
    } else {
      pick({ kind: 'seat', tableId: state.tableId,
             seatNo: parseInt(row.getAttribute('data-sp-seat'), 10) });
    }
    /* Firefox refuses to start a drag without payload, even when the payload is unused. */
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', 'sp'); } catch (err) { /* IE guard */ }
    }
  });

  /* preventDefault on dragover is what marks an element as a drop target — without it the
   * browser refuses the drop and no `drop` event ever fires. */
  document.addEventListener('dragover', function (e) {
    if (!state.picked || !e.target.closest) return;
    var seatEl = e.target.closest('[data-sp-seat]');
    if (seatEl && seatDrop(state.tableId, parseInt(seatEl.getAttribute('data-sp-seat'), 10))) {
      markOver(seatEl);                 /* the ONE card under the pointer */
      e.preventDefault(); return;
    }
    markOver(null);                     /* left the seats — drop the highlight */
    if (e.target.closest('[data-sp-pool]') && poolDrop()) { e.preventDefault(); return; }
    var card = e.target.closest('[data-sp-card]');
    if (card && tableDrop(card.getAttribute('data-sp-table')) === 'move') e.preventDefault();
  });

  /* The pointer leaving the seat list entirely still has to put the highlight out — `dragover`
   * simply stops firing, so nothing above would clear it. */
  document.addEventListener('dragleave', function (e) {
    if (!state.picked || !e.target.closest) return;
    if (e.target.closest('[data-sp-seat]') === overEl) markOver(null);
  });

  /* ── The same highlight for the non-drag paths ────────────────────────────────────────────
   * With somebody in the air but no drag in progress — the click and keyboard routes — the card
   * "being dragged over" is whichever one the pointer is on or focus is in. Without this, the
   * mouse and keyboard flows would place a person with no indication of where. */
  document.addEventListener('mouseover', function (e) {
    if (!state.picked || !e.target.closest) return;
    markOver(e.target.closest('[data-sp-seat]'));
  });

  document.addEventListener('focusin', function (e) {
    if (!state.picked || !e.target.closest) return;
    markOver(e.target.closest('[data-sp-seat]'));
  });

  document.addEventListener('drop', function (e) {
    if (!state.picked || !e.target.closest) return;
    e.preventDefault();
    var seatEl = e.target.closest('[data-sp-seat]');
    if (seatEl) {
      place({ kind: 'seat', tableId: state.tableId,
              seatNo: parseInt(seatEl.getAttribute('data-sp-seat'), 10) });
      return;
    }
    if (e.target.closest('[data-sp-pool]')) { place({ kind: 'pool' }); return; }
    var card = e.target.closest('[data-sp-card]');
    if (card) place({ kind: 'table', tableId: card.getAttribute('data-sp-table') });
  });

  /* A drag that ends outside any target must put the person back down, or the highlighting
   * stays on and the next click reads as a placement. */
  document.addEventListener('dragend', function () {
    if (state.picked) clearPick();
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
