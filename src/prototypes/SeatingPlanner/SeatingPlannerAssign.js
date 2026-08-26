/* Seating Planner — Assign person to a seat (TASK-342309)
 *
 * Ninth sub-task onto the workspace shell:
 *
 *     SeatingPlannerWorkspace.on('assign-seat', openModal)
 *
 * Also the documented FALLBACK FOR DRAG-AND-DROP (TASK-344759), which is why it
 * must work on every viewport: HTML5 drag does nothing on touch and keyboard
 * users cannot drag at all. 344759 can reach it directly:
 *
 *     SeatingPlannerAssign.open(seatRow);
 *
 * GROUPED BY SOURCE, NOT BY ROLE:
 *   · Event attendees — already on the guest list and currently unassigned.
 *     Read LIVE from the Unassigned tray, so the popup and the tray can never
 *     disagree, and seating someone removes them from the tray.
 *   · CRM contacts — not on the guest list yet. Seating one of these ADDS them
 *     to the event, which the toast says out loud.
 *
 * A row commits on click; there is no Save footer. With a footer the row click
 * would only be a selection — the extra click the reference deliberately drops.
 * Manual guests are the exception: they need Name / Company / Role first, so
 * that block has its own Add button.
 *
 * ROLE. The brief lists a Role dropdown; the reference shows the role as a
 * badge ON each result row and has no dropdown. Both are honoured: a person
 * already in the system carries the role from their record (visible on the row
 * before you click it), and the dropdown belongs to the manual guest — the one
 * case with no record to read a role from. See the handover: if role must be
 * OVERRIDABLE when seating an existing person, one-click seating has to become
 * select-then-confirm, which is a spec decision, not a build one.
 *
 * TODO(backend:SeatingPlanner): DOM-only. Real version writes the TableSeat
 * occupant — an FK to Attendee/Contact, or a guest name/company pair when there
 * is no record — plus the role and the seat index. Seating a CRM contact must
 * also create the event Attendee row, in the same transaction. Reject a person
 * who already holds a seat in this event rather than duplicating them.
 */
(function () {
  'use strict';

  var ROLE_NAMES = {
    attendee: 'Attendee', sponsor: 'Sponsor', vip: 'VIP',
    speaker: 'Speaker', host: 'Host', guest: 'Guest'
  };

  /* TODO(backend:SeatingPlanner): mock CRM directory → GET /crm/contacts?q=.
     These people are NOT on the guest list — seating one adds them to it. The
     role travels with the contact record (a sponsor contact seats as Sponsor). */
  var CONTACTS = [
    { name: 'Chloe Ashby',      org: '+1 guest',      role: 'guest' },
    { name: 'Dominic Searle',   org: 'Lloyds',        role: 'attendee' },
    { name: 'Ayesha Riaz',      org: 'NatWest',       role: 'attendee' },
    { name: 'Peter Lund',       org: 'Nets',          role: 'sponsor' },
    { name: 'Rosa Delgado',     org: 'Panel chair',   role: 'speaker' },
    { name: 'Gareth Pryce',     org: 'Affino',        role: 'host' },
    { name: 'Lady Anne Rowntree', org: 'Patron',      role: 'vip' }
  ];

  var seatRow = null;   /* the empty .sp-seat being filled */
  var card = null;      /* its table card */

  function one(sel, root) { return (root || document).querySelector(sel); }
  function all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function roleFromClass(el) {
    var m = (el.className || '').match(/sp-role--(attendee|sponsor|vip|speaker|host|guest)/);
    return m ? m[1] : 'guest';
  }

  /* ------------------------------------------------------- the two sources */

  /* Event attendees = whoever is in the tray right now. Reading the DOM rather
     than a list of my own is the whole point: unseat someone and they are
     immediately offered back here, with no second copy of the truth. */
  function trayPeople() {
    return all('[data-sp-person]').map(function (row) {
      var badge = one('.sp-role', row);
      return {
        name: (one('.sp-person__name', row) || {}).textContent || '',
        org: (one('.sp-person__org', row) || {}).textContent || '',
        role: badge ? roleFromClass(badge) : 'guest',
        row: row
      };
    });
  }

  /* Someone already seated anywhere in this event must not be offered again —
     the mock's list has no such rule, but seating one person twice is invalid. */
  function seatedNames() {
    var taken = {};
    all('[data-sp-table]').forEach(function (c) {
      (c.getAttribute('data-sp-occupants') || '').split('|').forEach(function (entry) {
        if (entry) taken[entry.split('~')[0]] = true;
      });
    });
    all('[data-sp-seatlist] .sp-seat[data-sp-role]').forEach(function (r) {
      taken[(one('.sp-seat__name', r) || {}).textContent || ''] = true;
    });
    return taken;
  }

  /* ------------------------------------------------------------ the list */

  function rowHtml(p, source) {
    return '<button class="sp-assign__row" type="button" data-as-pick' +
      ' data-as-name="' + esc(p.name) + '" data-as-org="' + esc(p.org) + '"' +
      ' data-as-role="' + p.role + '" data-as-source="' + source + '">' +
      '<span class="sp-assign__name">' + esc(p.name) + '</span>' +
      '<span class="sp-role sp-role--' + p.role + '">' + ROLE_NAMES[p.role] + '</span>' +
      '<span class="sp-assign__meta">' + esc(p.org) + '</span>' +
      '</button>';
  }

  function renderList() {
    var host = one('[data-as-results]');
    if (!host) return;

    var field = one('[data-as-search]');
    var q = field ? field.value.trim().toLowerCase() : '';
    var taken = seatedNames();

    function match(p) {
      if (taken[p.name]) return false;
      if (!q) return true;
      return (p.name + ' ' + p.org).toLowerCase().indexOf(q) !== -1;
    }

    var attendees = trayPeople().filter(match);
    var contacts = CONTACTS.filter(match);
    var html = '';

    if (attendees.length) {
      html += '<p class="sp-assign__group">Event attendees</p>' +
        attendees.map(function (p) { return rowHtml(p, 'attendee'); }).join('');
    }
    if (contacts.length) {
      html += '<p class="sp-assign__group">CRM contacts</p>' +
        contacts.map(function (p) { return rowHtml(p, 'contact'); }).join('');
    }
    if (!attendees.length && !contacts.length) {
      var term = field ? field.value.trim() : '';
      html = '<div class="sp-assign__none">' +
        '<p>Nobody on the guest list or in the CRM matches <strong>' + esc(term) +
        '</strong>.</p>' +
        '<button class="btn btn--secondary btn--sm" type="button" data-as-use-term>' +
        '<i data-lucide="user-plus" aria-hidden="true"></i>Add “' + esc(term) +
        '” as a guest</button></div>';
    }

    host.innerHTML = html;
    refreshIcons();
  }

  /* ------------------------------------------------------------ open / close */

  function openForSeat(row) {
    var overlay = one('[data-as-overlay]');
    if (!overlay || !row) return;

    seatRow = row;
    card = row.closest('[data-sp-table]') ||
           one('[data-sp-table].sp-table--selected');

    var seatNo = row.getAttribute('data-sp-seat') || '';
    var tableName = card ? (card.getAttribute('data-sp-name') || 'this table') : 'this table';
    var title = one('[data-as-title]');
    if (title) title.textContent = 'Assign person to ' + tableName + ' · seat ' + seatNo;

    var search = one('[data-as-search]');
    if (search) search.value = '';
    var gName = one('[data-as-guest-name]');
    var gOrg = one('[data-as-guest-org]');
    if (gName) gName.value = '';
    if (gOrg) gOrg.value = '';
    setRole('Guest');

    renderList();
    overlay.classList.add('modal-overlay--open');
    if (search) search.focus();
  }

  function openModal(ctx) {
    var trigger = ctx && ctx.trigger;
    if (!trigger) return;
    openForSeat(trigger.closest('.sp-seat'));
  }

  function closeModal() {
    var overlay = one('[data-as-overlay]');
    if (overlay) overlay.classList.remove('modal-overlay--open');
    seatRow = null;
    card = null;
  }

  /* ------------------------------------------------------------- role select */

  function setRole(label) {
    var value = one('[data-as-role-value]');
    if (value) value.textContent = label;
    all('[data-as-modal] [data-as-role-opt]').forEach(function (item) {
      var on = item.getAttribute('data-as-role-opt') === label;
      item.classList.toggle('sel__menu-item--selected', on);
      item.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }

  function currentRoleKey() {
    var label = (one('[data-as-role-value]') || {}).textContent || 'Guest';
    for (var k in ROLE_NAMES) {
      if (ROLE_NAMES[k] === label) return k;
    }
    return 'guest';
  }

  /* ------------------------------------------------------------------- seat */

  function filledRowHtml(n, role, name, org) {
    return '<div class="sp-seat" data-sp-seat="' + n + '" data-sp-role="' + role + '" draggable="true">' +
      '<span class="sp-seat__num">' + n + '</span>' +
      '<div class="sp-seat__person">' +
      '<p class="sp-seat__name">' + esc(name) + '</p>' +
      '<p class="sp-seat__org">' + esc(org) + '</p>' +
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

  function seat(person, source) {
    if (!seatRow) { closeModal(); return; }

    var n = seatRow.getAttribute('data-sp-seat');
    var target = card;
    seatRow.outerHTML = filledRowHtml(n, person.role, person.name, person.org);

    /* Off the guest list into a seat: the tray row goes with them */
    if (person.row) person.row.remove();

    closeModal();

    if (window.SeatingPlannerWorkspace) {
      /* syncSeats mirrors the rows onto the card's dots, count and fill pill,
         resyncs the plan chip, and stamps who is in which seat */
      if (window.SeatingPlannerWorkspace.syncSeats) window.SeatingPlannerWorkspace.syncSeats();
      if (window.SeatingPlannerWorkspace.refresh) window.SeatingPlannerWorkspace.refresh();
      if (window.SeatingPlannerWorkspace.toast) {
        window.SeatingPlannerWorkspace.toast('<strong>' + esc(person.name) + '</strong> seated at ' +
          (target ? target.getAttribute('data-sp-name') : 'the table') + ' · seat ' + n +
          (source === 'contact' ? ' — and added to the event attendee list' : '') + '.');
      }
    }
    refreshIcons();
  }

  function addGuest() {
    var nameField = one('[data-as-guest-name]');
    var orgField = one('[data-as-guest-org]');
    if (!nameField) return;

    var name = nameField.value.trim();
    if (!name) { nameField.focus(); return; }

    seat({
      name: name,
      org: orgField && orgField.value.trim() ? orgField.value.trim() : 'Guest',
      role: currentRoleKey()
    }, 'guest');
  }

  /* ---------------------------------------------------------------- wiring */

  function init() {
    if (!one('[data-as-modal]')) return;

    if (window.SeatingPlannerWorkspace) {
      window.SeatingPlannerWorkspace.on('assign-seat', openModal);
    }

    var search = one('[data-as-search]');
    if (search) search.addEventListener('input', renderList);

    /* A capture state opens the popup in markup rather than by clicking Assign.
       Adopt the seat its title names so those files stay WORKING states and not
       just pictures — pick a row and it really seats. */
    var pre = one('[data-as-overlay].modal-overlay--open');
    if (pre) {
      var titleEl = one('[data-as-title]');
      var m = titleEl ? (titleEl.textContent || '').match(/seat (\d+)/) : null;
      seatRow = (m && one('[data-sp-seatlist] .sp-seat[data-sp-seat="' + m[1] + '"]')) ||
                one('[data-sp-seatlist] .sp-seat--empty');
      card = one('[data-sp-table].sp-table--selected');
    }

    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-as-close]')) { e.preventDefault(); closeModal(); return; }

      var pick = e.target.closest('[data-as-pick]');
      if (pick) {
        e.preventDefault();
        var name = pick.getAttribute('data-as-name');
        /* keep the tray row reference so seating removes it */
        var fromTray = trayPeople().filter(function (p) { return p.name === name; })[0];
        seat({
          name: name,
          org: pick.getAttribute('data-as-org'),
          role: pick.getAttribute('data-as-role'),
          row: fromTray ? fromTray.row : null
        }, pick.getAttribute('data-as-source'));
        return;
      }

      if (e.target.closest('[data-as-guest-add]')) { e.preventDefault(); addGuest(); return; }

      /* "use this name" — carry the search term into the guest fields rather
         than making the user type it twice */
      if (e.target.closest('[data-as-use-term]')) {
        e.preventDefault();
        var field = one('[data-as-search]');
        var gName = one('[data-as-guest-name]');
        if (field && gName) {
          gName.value = field.value.trim();
          var gOrg = one('[data-as-guest-org]');
          if (gOrg) gOrg.focus();
        }
        return;
      }

      var roleOpt = e.target.closest('[data-as-role-opt]');
      if (roleOpt) {
        e.preventDefault();
        setRole(roleOpt.getAttribute('data-as-role-opt'));
        var sel = roleOpt.closest('.sel');
        if (sel) sel.classList.remove('sel--open');
        return;
      }

      var overlay = one('[data-as-overlay]');
      if (overlay && e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'Enter' && e.target.closest('[data-as-guest-name], [data-as-guest-org]')) {
        e.preventDefault(); addGuest();
      }
    });
  }

  /* Reachable by TASK-344759 so a failed or touch-device drag lands here
     instead of dead-ending */
  window.SeatingPlannerAssign = { open: openForSeat };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
