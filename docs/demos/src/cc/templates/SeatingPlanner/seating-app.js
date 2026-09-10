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
    picked: null,
    /* Which seat the Assign-person modal is filling. Held here rather than read back off the
     * dialog, because the title is prose ("… · seat 4") and parsing a number out of a sentence
     * is exactly the kind of thing that breaks when the copy changes. */
    assignSeat: null
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

  /* ── Table types registry ──────────────────────────────────────────────────────────────────
   * The Table types modal IS the registry — its rows are what the user renames, recolours,
   * removes and adds, and SeatingPlanner.js already rebuilds the Table form's tier dropdown from
   * them. So the tier's label and colour are read back out of those rows on every render rather
   * than kept as a second copy here: a recolour shows on the cards with no sync step to forget.
   *
   * `data-tt-slug` is the stable key and survives a rename; `[data-tt-name]` is the live label.
   * The Standard row has no colour input at all, which is exactly how "no tier" is expressed —
   * so it yields no entry and a Standard table is `typeId: null`.
   *
   * Falls back to the authored `D.TYPES` when the modal is not in the document, so this module
   * still works on a page that hosts the plan without the modals. */
  function registry() {
    var rows = document.querySelectorAll('[data-tt-row]');
    if (!rows.length) return D.TYPES;
    var out = [];
    Array.prototype.forEach.call(rows, function (row) {
      var colour = row.querySelector('.color-picker-input__native');
      var name = row.querySelector('[data-tt-name]');
      if (!colour) return;                       /* Standard — no colour, no chip, no entry */
      out.push({
        id: row.getAttribute('data-tt-slug'),
        label: name ? name.value.trim() : '',
        colour: colour.value
      });
    });
    return out;
  }

  function typeOf(t) {
    if (!t.typeId) return null;
    return registry().filter(function (x) { return x.id === t.typeId; })[0] || null;
  }

  function typeByLabel(label) {
    var want = String(label || '').trim().toLowerCase();
    return registry().filter(function (x) {
      return x.label.toLowerCase() === want;
    })[0] || null;
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
              /* The tier chip. Both its label AND its colour are data: the colour comes straight
               * from the tier's own picker in the Table types modal, set through TableType's
               * documented `--table-type-color` API rather than one of its five preset
               * modifiers. A preset class cannot express a recoloured tier, which is the entire
               * point of that picker. */
              (type
                ? '<span class="table-type" style="--table-type-color: ' + esc(type.colour) + '">' +
                  esc(type.label) + '</span>'
                : '') +
            '</div>' +
            /* The name MUST be wrapped in `__sponsor-name`. Emitted as a bare text node it
             * inherited the card's typography — measured 16px/400/24px in #335562 against the
             * 12px/500/16px `--ai-text-contrast` the row binds in Figma (3476:106259). The row's
             * own gap and 6px padding were right, so only the name was wrong, which is why it
             * read as a styling bug rather than a missing element. */
            (t.sponsor
              ? '<p class="table-card__sponsor"><i data-lucide="handshake" aria-hidden="true"></i>' +
                '<span class="table-card__sponsor-name">' + esc(t.sponsor) + '</span></p>'
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
      /* Same as the card's chip: the colour is the tier's own picked value via
       * `--table-type-color`, not one of TableType's five preset modifiers. */
      rowEl.insertAdjacentHTML('beforeend',
        '<span class="table-type" style="--table-type-color: ' + esc(type.colour) + '">' +
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
  /* ── Assign person ─────────────────────────────────────────────────────────────────────────
   * Figma 3515:204464 / 205148 / 205836 / 206452 / 229072.
   *
   * REPLACES a placeholder: Assign used to take whoever happened to be first in the unassigned
   * queue and seat them as an Attendee, with no picker and no say over the role. Both were
   * flagged at the time; this is the frame's actual behaviour.
   *
   * Two sources. "Event Attendees" is derived — the unassigned pool, which is why the frame's
   * help text can promise "anyone already seated is not listed" without a filter. "CRM Contact"
   * is the authored directory of people who have NOT signed up; seating one adds them to the
   * event, so the header's attendee figure and the unassigned total both move, both being
   * derived from the roster.
   *
   * There is no confirm step. The frame has no Save button — the only button is "Add" for a
   * manual guest — so a row IS the action: click it and the person is seated and the dialog
   * closes. */

  var ASSIGN_OPEN = 'modal-overlay--open';

  function assignOverlay() { return document.querySelector('[data-assign]'); }

  function assign(seatNo) {
    var t = tableById(state.tableId);
    var overlay = assignOverlay();
    if (!t || !overlay) return;

    state.assignSeat = seatNo;

    var titleEl = overlay.querySelector('[data-assign-title]');
    if (titleEl) titleEl.textContent = 'Assign person to ' + t.name + ' · seat ' + seatNo;

    var search = overlay.querySelector('[data-assign-search]');
    if (search) search.value = '';
    var guestName = overlay.querySelector('[data-assign-guest-name]');
    var guestCo = overlay.querySelector('[data-assign-guest-company]');
    if (guestName) guestName.value = '';
    if (guestCo) guestCo.value = '';

    renderAssign();
    overlay.classList.add(ASSIGN_OPEN);
    if (search) search.focus();
  }

  function assignClose() {
    var overlay = assignOverlay();
    if (overlay) overlay.classList.remove(ASSIGN_OPEN);
    state.assignSeat = null;
  }

  /* CRM people who have not been pulled into the event yet. Once seated they are in the roster,
   * so they leave this list and appear under Event Attendees like anyone else. */
  function crmAvailable() {
    var inRoster = {};
    D.roster.forEach(function (p) { inRoster[p.id] = true; });
    return (D.CRM || []).filter(function (c) { return !inRoster[c.id]; });
  }

  function renderAssign() {
    var overlay = assignOverlay();
    if (!overlay) return;
    var host = overlay.querySelector('[data-assign-results]');
    if (!host) return;

    var q = ((overlay.querySelector('[data-assign-search]') || {}).value || '').trim().toLowerCase();
    function match(p) {
      if (!q) return true;
      /* Name AND the second line, which is what the frame's own "an" search demonstrates:
       * it returns Elena Rostanova via "Quantum Tech" and Rosa Delgado via "Panel chair". */
      return p.name.toLowerCase().indexOf(q) > -1 || (p.company || '').toLowerCase().indexOf(q) > -1;
    }

    /* SORTED ALPHABETICALLY (designer, 2026-09-10). The unassigned pool arrives in roster
     * insertion order, which is arbitrary to whoever is reading it — 72 names in no order at all.
     * Sorted on the displayed string, so what you scan is what you compare, and `localeCompare`
     * rather than `<` so accented names land where a reader expects. Copies are sorted, never the
     * model: `pool()` is derived and `D.CRM` is authored, and neither should be reordered by a
     * dialog rendering itself. */
    function byName(a, b) { return a.name.localeCompare(b.name); }

    var attendees = pool().filter(match).sort(byName);
    var crm = crmAvailable().filter(match).sort(byName);

    if (!attendees.length && !crm.length) {
      host.innerHTML = '<p class="assign__empty">No matches — add a guest manually below.</p>';
      return;
    }

    function row(p, source) {
      /* AttendeeCard with `Show Seat Number` and `Show Actions` off — both are formal Figma
       * booleans on that component, so no variant or override is needed. The role comes from the
       * person's record and drives the accent and the label, exactly as the help text says. */
      /* An <article role="button">, NOT a <button>. Tried the real element first and the row
       * collapsed to 4px: a button will not take its block size from a `flex-direction: column`
       * child the way a div does — the body measured its correct 49px inside a 4px button, and
       * `.attendee-card`'s `overflow: hidden` then clipped it. Same pattern TableCard already
       * uses for a whole-card action, so the keyboard path is handled the same way too. */
      return '<article class="attendee-card attendee-card--' + esc(p.role) + ' assign__row"' +
                    ' data-assign-pick="' + esc(p.id) + '"' +
                    ' data-assign-source="' + source + '"' +
                    ' role="button" tabindex="0"' +
                    ' aria-label="Assign ' + esc(p.name) + ', ' + esc(p.company) + ', ' +
                      esc(roleLabel(p.role)) + '">' +
        '<span class="attendee-card__accent" aria-hidden="true">' +
          '<span class="attendee-card__accent-bar"></span></span>' +
        '<div class="attendee-card__body">' +
          '<p class="attendee-card__name">' + esc(p.name) + '</p>' +
          '<p class="attendee-card__meta">' +
            '<span class="attendee-card__company">' + esc(p.company) + '</span>' +
            '<span class="attendee-card__sep" aria-hidden="true">·</span>' +
            '<span class="attendee-card__role">' + esc(roleLabel(p.role)) + '</span>' +
          '</p>' +
        '</div>' +
      '</article>';
    }

    /* An empty section drops its header rather than showing an empty one — what the frame's
     * search state draws, where "Event Attendees" carries one result and "CRM Contact" two.
     *
     * COUNTS (designer, 2026-09-10) say whether to search or scroll, which matters when the pool
     * is 72 names deep. Figma draws no count, so this is plain parenthesised text inside the
     * existing label rather than a new element with new design values to invent. It counts what
     * is LISTED BENEATH IT, not the section total, so the label stays true while filtering — a
     * search that matches one person reads "Event Attendees (1)". */
    function label(text, n) {
      return '<p class="assign__section-label">' + text + ' (' + n + ')</p>';
    }

    host.innerHTML =
      (attendees.length
        ? label('Event Attendees', attendees.length) +
          attendees.map(function (p) { return row(p, 'event'); }).join('')
        : '') +
      (crm.length
        ? label('CRM Contact', crm.length) +
          crm.map(function (p) { return row(p, 'crm'); }).join('')
        : '');
  }

  /* Seat somebody and report it. `person` is a roster entry or a CRM/manual record that is about
   * to become one; `joined` says whether this call is what added them to the event, so Undo can
   * take them back out again. */
  function seatPerson(p, joined) {
    var t = tableById(state.tableId);
    var seatNo = state.assignSeat;
    if (!t || !seatNo) return;

    if (joined) D.roster.push(p);
    t.seats[seatNo - 1] = { personId: p.id, role: p.role };

    assignClose();
    render();

    /* Copy per the designer 2026-09-10: "successfully assigned to", with the object naming the
     * SEAT here because the Assign button always belongs to one. Figma's three toast instances
     * disagree — two say "successfully assigned to" and one drops the word, and the object is a
     * seat in one and a table in the other two — so the rule is one string with the object
     * varying by what was actually targeted. */
    document.dispatchEvent(new CustomEvent('sp:toast', {
      detail: {
        parts: [
          { text: p.name + ' ', strong: true },
          { text: 'successfully assigned to ' },
          { text: 'Seat ' + seatNo, strong: true }
        ],
        undo: function () {
          t.seats[seatNo - 1] = null;
          if (joined) {
            var i = D.roster.indexOf(p);
            if (i > -1) D.roster.splice(i, 1);
          }
          render();
        }
      }
    }));
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

  /* ── Assign-person modal wiring ────────────────────────────────────────────────────────────
   * Delegated like everything else, so re-rendering the list never leaves a dead listener. */

  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;

    if (e.target.closest('[data-assign-close]')) { assignClose(); return; }

    /* Click the backdrop to dismiss — the overlay itself, not anything inside the dialog. */
    var overlay = assignOverlay();
    if (overlay && e.target === overlay) { assignClose(); return; }

    var pick = e.target.closest('[data-assign-pick]');
    if (!pick) return;
    var id = pick.getAttribute('data-assign-pick');
    var source = pick.getAttribute('data-assign-source');

    if (source === 'crm') {
      var c = (D.CRM || []).filter(function (x) { return x.id === id; })[0];
      /* A CRM contact JOINS the event as they are seated — the designer's call, and what keeps
       * the derived attendee figure and the unassigned total consistent with each other. */
      if (c) seatPerson(c, true);
      return;
    }
    var p = person(id);
    if (p && p.id) seatPerson(p, false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var overlay = assignOverlay();
      if (overlay && overlay.classList.contains(ASSIGN_OPEN)) assignClose();
      return;
    }
    /* `role="button"` carries the semantics but not the behaviour — Enter and Space have to be
     * wired by hand, or the rows are announced as buttons that cannot be pressed. */
    if (e.key !== 'Enter' && e.key !== ' ') return;
    if (!e.target.closest) return;
    var row = e.target.closest('[data-assign-pick]');
    if (!row) return;
    e.preventDefault();
    row.click();
  });

  document.addEventListener('input', function (e) {
    if (e.target && e.target.matches('[data-assign-search]')) renderAssign();
  });

  /* Show help drives the search Input's OWN `.input__help`, which is what Figma hides and shows
   * — the paragraph is that Input's Help Slot, not a paragraph belonging to this dialog.
   *
   * `aria-checked` is READ, never written: Toggle.js owns the switch's flip and has already done
   * it by the time this runs. Writing it here too made the two cancel out and the help text
   * never appeared — the same trap the Edit Plan and Table form handlers already document. */
  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    var t = e.target.closest('#assign-help-toggle');
    if (!t) return;
    var help = document.querySelector('[data-assign-help]');
    if (help) help.hidden = t.getAttribute('aria-checked') !== 'true';
  });

  document.addEventListener('submit', function (e) {
    if (!e.target.closest || !e.target.closest('[data-assign-manual]')) return;
    e.preventDefault();
    var overlay = assignOverlay();
    if (!overlay) return;
    var nameEl = overlay.querySelector('[data-assign-guest-name]');
    var coEl = overlay.querySelector('[data-assign-guest-company]');
    var name = nameEl ? nameEl.value.trim() : '';
    if (!name) { if (nameEl) nameEl.focus(); return; }

    /* A manual guest has no record, so there is no role to take from one. Figma does not draw
     * this case — the help text only covers people who HAVE a record — so Attendee is the base
     * role rather than a Figma value. Flagged as seating-assign-manual-guest. */
    seatPerson({
      id: 'g' + (D.roster.length + 1) + '-' + name.replace(/\W+/g, '').toLowerCase(),
      name: name,
      company: coEl ? coEl.value.trim() : '',
      role: 'attendee'
    }, true);
  });

  /* ── The Table form saves to the MODEL ─────────────────────────────────────────────────────
   * Before this, Save changed nothing that lasted: picking a tier and saving left `typeId` null,
   * so no chip appeared and the next render put everything back. The form predates the model and
   * did its work by DOM surgery on the card's HTML, the seat rows and the plan totals — patching
   * "13 tables · 124/148" with a regex — which is exactly the drift the model exists to remove.
   *
   * So this intercepts the submit in the CAPTURE phase and calls `stopImmediatePropagation()`,
   * which retires that whole path: the model is written, every count is re-derived, and the
   * HTML-snapshot Undo goes with it (a snapshot of markup the model no longer agrees with would
   * be restored only to be wiped by the next render — the Undo below reverses the FIELDS).
   *
   * Validation is reproduced rather than inherited, because stopping the handler stops its
   * checks too. Both rules and the empty-name-adopts-the-placeholder behaviour in add mode are
   * the originals. */

  /* Which table the form is on. The legacy module keeps this privately, so it is captured from
   * the trigger the user actually clicked rather than guessed from the selection — Add opens the
   * same form with no table behind it. */
  var formTableId = null;
  var formMode = 'edit';

  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    var add = e.target.closest('[data-tf-add]');
    var open = add ? null : e.target.closest('[data-tf-open]');
    if (!add && !open) return;
    if (add) { formMode = 'add'; formTableId = null; }
    else {
      var card = open.closest('[data-sp-table]');
      formMode = 'edit';
      formTableId = card ? card.getAttribute('data-sp-table') : state.tableId;
    }
    /* Deferred, because the legacy `open()` runs on this same click and writes the tier field
     * itself — from `data-tf-tier` on the card, an attribute the model-driven renderer never
     * sets, so it always resolved to "Standard". Left alone that silently DROPS the tier:
     * open Table 1, change only its name, save, and Headline Sponsor is gone because the
     * field said Standard. */
    setTimeout(fillForm, 0);
  }, true);

  /* Fill the form FROM THE MODEL, every field, replacing what the legacy `open()` just wrote.
   *
   * That function scrapes the card: name and seats out of its rendered text, tier and sponsor
   * out of `data-tf-tier` / `data-tf-sponsor` attributes the old DOM-surgery save used to write
   * back. The model-driven renderer emits neither attribute, so both fields opened blank — and
   * because Save now reads the form, a blank field was a DELETION. Editing only a table's name
   * silently cleared its tier and its sponsor. Reading the model instead removes the whole class
   * of bug rather than patching one field at a time.
   *
   * `shape` and `host` are deliberately left to the legacy behaviour: the model does not carry
   * them, so there is nothing to fill from and nothing is lost on save. Flagged in the manifest.
   *
   * The tier MENU is rebuilt here too. SeatingPlanner.js already does that, but only when the
   * types modal changes — so a first open still showed the six options authored in the HTML and
   * missed any tier added since, including the event's own two. Standard is prepended rather
   * than stored: it is the absence of a tier, not a tier with no colour. */
  function fillForm() {
    var overlay = document.querySelector('[data-table-form]');
    if (!overlay) return;

    var t = formMode === 'edit' ? tableById(formTableId) : null;

    var nameEl = overlay.querySelector('#tf-name');
    if (nameEl) nameEl.value = t ? t.name : '';

    var seatsEl = overlay.querySelector('#tf-seats');
    if (seatsEl && t) seatsEl.value = t.capacity;

    var sponEl = overlay.querySelector('[data-tf-sponsor-value]');
    if (sponEl) sponEl.textContent = (t && t.sponsor) ? t.sponsor : 'Search Accounts…';

    var menu = overlay.querySelector('[data-tf-field="tier"] .sel__menu');
    var value = overlay.querySelector('#tf-tier .sel__value');
    if (!menu || !value) return;

    var standard = (document.querySelector('[data-tt-row][data-tt-slug="standard"] [data-tt-name]')
                    || {}).value || 'Standard';
    var current = (t && typeOf(t)) ? typeOf(t).label : standard;

    menu.innerHTML = [{ label: standard }].concat(registry()).map(function (x) {
      var on = x.label === current;
      return '<li><button type="button" class="sel__menu-item' +
             (on ? ' sel__menu-item--selected' : '') + '" role="option"' +
             (on ? ' aria-selected="true"' : '') + '>' + esc(x.label) +
             (on ? ' <i data-lucide="check"></i>' : '') + '</button></li>';
    }).join('');

    value.textContent = current;
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }

  function fieldError(overlay, name, message) {
    var wrap = overlay.querySelector('[data-tf-field="' + name + '"]');
    if (!wrap) return;
    wrap.classList.add('input--error');
    var help = wrap.querySelector('[data-tf-help]');
    if (help) help.textContent = message;
  }

  function clearErrors(overlay) {
    Array.prototype.forEach.call(overlay.querySelectorAll('[data-tf-field]'), function (wrap) {
      wrap.classList.remove('input--error');
      var help = wrap.querySelector('[data-tf-help]');
      if (help) help.textContent = help.getAttribute('data-tf-help-original') || '';
    });
  }

  document.addEventListener('submit', function (e) {
    if (!e.target || e.target.id !== 'table-form-form') return;
    var overlay = document.querySelector('[data-table-form]');
    if (!overlay) return;

    var nameEl  = overlay.querySelector('#tf-name');
    var seatsEl = overlay.querySelector('#tf-seats');
    var tierEl  = overlay.querySelector('#tf-tier .sel__value');
    var sponEl  = overlay.querySelector('[data-tf-sponsor-value]');

    var name  = nameEl ? nameEl.value.trim() : '';
    var seats = seatsEl ? parseInt(seatsEl.value, 10) : NaN;

    /* Add mode adopts the placeholder, because a suggestion you must retype is not a
     * suggestion — the original behaviour, kept. */
    if (!name && formMode === 'add' && nameEl) name = nameEl.placeholder || '';

    clearErrors(overlay);
    var ok = true;
    if (!name) { fieldError(overlay, 'name', 'Table name is required.'); ok = false; }
    if (!isFinite(seats) || seats < 1) {
      fieldError(overlay, 'seats', 'Enter a number of seats.'); ok = false;
    }
    if (!ok) {
      e.preventDefault();
      e.stopImmediatePropagation();
      var bad = overlay.querySelector('.input--error .input__control');
      if (bad) bad.focus();
      return;
    }

    e.preventDefault();
    e.stopImmediatePropagation();

    /* The tier is chosen by LABEL in the `.sel`, so it is resolved back through the registry.
     * A label that resolves to nothing is Standard — which includes the Standard row itself,
     * since that row has no colour and yields no entry. */
    var tier = tierEl ? typeByLabel(tierEl.textContent) : null;
    var sponsorText = sponEl ? sponEl.textContent.trim() : '';
    /* The placeholder is the empty state, not a sponsor called "Search Accounts…". */
    var sponsor = (!sponsorText || /^search accounts/i.test(sponsorText)) ? null : sponsorText;

    var p = plan();
    var t = formMode === 'add' ? null : tableById(formTableId);
    var before = t && {
      name: t.name, typeId: t.typeId, sponsor: t.sponsor,
      capacity: t.capacity, seats: t.seats.slice()
    };

    if (formMode === 'add') {
      t = { id: 't' + Date.now(), name: name, typeId: null, sponsor: null,
            capacity: seats, seats: [] };
      p.tables.push(t);
    }
    if (!t) return;

    t.name = name;
    t.typeId = tier ? tier.id : null;
    t.sponsor = sponsor;

    /* Capacity. Growing appends empty seats; shrinking drops the seats past the new end, and
     * anyone sitting in them returns to the unassigned pool automatically — the pool is derived
     * as signed-up minus assigned, so removing a seat is all it takes. */
    t.capacity = seats;
    while (t.seats.length < seats) t.seats.push(null);
    if (t.seats.length > seats) t.seats = t.seats.slice(0, seats);

    if (formMode === 'add') state.tableId = t.id;

    var overlayOpen = overlay.classList.contains('modal-overlay--open');
    if (overlayOpen) overlay.classList.remove('modal-overlay--open');
    Array.prototype.forEach.call(document.querySelectorAll('[data-tf-open]'), function (b) {
      b.setAttribute('aria-expanded', 'false');
    });

    render();

    /* Reuses the screen's own toast seam. Undo restores the FIELDS rather than a slab of HTML,
     * so it stays true after any later render. */
    var added = formMode === 'add';
    var renamed = before && before.name !== name;
    var parts = added
      ? [{ text: name + ' ', strong: true }, { text: 'added to ' },
         { text: p.name + '.', strong: true }]
      : renamed
        ? [{ text: before.name + ' ', strong: true }, { text: 'renamed to ' },
           { text: name, strong: true }]
        : [{ text: name + ' ', strong: true }, { text: 'updated' }];

    document.dispatchEvent(new CustomEvent('sp:toast', {
      detail: {
        parts: parts,
        undo: function () {
          if (added) {
            var i = p.tables.indexOf(t);
            if (i > -1) p.tables.splice(i, 1);
            state.tableId = p.tables.length ? p.tables[0].id : null;
          } else if (before) {
            t.name = before.name; t.typeId = before.typeId; t.sponsor = before.sponsor;
            t.capacity = before.capacity; t.seats = before.seats.slice();
          }
          render();
        }
      }
    }));
  }, true);

  /* ── A tier edited in the Table types modal shows on the plan at once ──────────────────────
   * `registry()` re-reads those rows on every render, so nothing needs copying — the cards just
   * have to be told to redraw. One handler for all four of that modal's actions: recolour fires
   * `input` on the colour field, rename fires `input` on the text field, and add/remove are
   * clicks. Runs after the legacy handlers so the rows are already in their new state.
   *
   * A REMOVED tier is dropped from every table that used it, which is the fallback to Standard
   * the modal's own intro promises. Matching on `data-tt-slug` means a rename never triggers
   * this — the slug is stable, only the label moves. */
  function syncTiers() {
    var live = registry().map(function (x) { return x.id; });
    D.plans.forEach(function (pl) {
      pl.tables.forEach(function (tb) {
        if (tb.typeId && live.indexOf(tb.typeId) === -1) tb.typeId = null;
      });
    });
    render();
  }

  document.addEventListener('input', function (e) {
    if (!e.target.closest) return;
    if (e.target.closest('[data-table-types]')) setTimeout(syncTiers, 0);
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    if (e.target.closest('[data-tt-remove]')) setTimeout(syncTiers, 0);
  });

  /* Adding a tier is a SUBMIT, not a click on a `[data-tt-add]` hook — "Add Type" is a
   * `type="submit"` button inside the modal's own form. Keyed on the form, so pressing Enter in
   * the new-tier name field counts too. */
  document.addEventListener('submit', function (e) {
    if (!e.target.closest) return;
    if (e.target.closest('[data-table-types]')) setTimeout(syncTiers, 0);
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
