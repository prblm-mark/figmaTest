/* Seating Planner — Unassigned pool (TASK-351550)
 *
 * Tenth sub-task onto the workspace shell, and the first that owns a DERIVED
 * view rather than a control, so it registers against the shell's notify hook:
 *
 *     SeatingPlannerWorkspace.on('unassigned-tray', render)
 *
 * THE POOL IS A CALCULATION, NOT A LIST. The brief is explicit — "event
 * attendees / contacts minus the plan's seated TableSeat occupants, plus
 * manually-added guests" — so this module recomputes it from the DOM on every
 * change instead of accumulating rows.
 *
 * That single change fixes a wart in FOUR earlier sub-tasks. Unseat, delete
 * table, delete plan and reduce-capacity each used to PUSH a row labelled by
 * origin ("Table 12 · seat 4") because the occupant's real name wasn't
 * available. It is now (342309 made the card record its occupants), and a
 * derived pool doesn't need pushing at all: the person stops being seated, so
 * the next derive brings them back BY NAME. Those pushes still happen and are
 * harmless — the derive that follows replaces them.
 *
 * SCOPE — EVENT-WIDE, NOT PER-PLAN. The brief says "not yet seated in the
 * selected plan". Taken literally, the 240 people seated in Main Ballroom would
 * be offered as unassigned the moment you switch to Overflow Room B, and could
 * be seated a second time. Three reasons this is implemented event-wide instead:
 *   · the capacities say the plans are COMPLEMENTARY, not alternatives —
 *     300 + 60 = 360 seats for 386 attendees, so both rooms seat one guest list;
 *   · TASK-342309's Assign popup already excludes anyone seated anywhere, so
 *     per-plan here would make the two modules contradict each other;
 *   · it is the conservative reading — event-wide can never double-book, and
 *     widening it later is a one-line change of selector.
 * Raised in the handover for the spec team to confirm.
 *
 * TODO(backend:SeatingPlanner): DOM-only. The real list is a QUERY — the event's
 * attendees and linked contacts LEFT JOIN TableSeat, keeping the unseated —
 * plus guests already stored on a TableSeat. No new stored fields. It must be
 * recomputed server-side after every seating change, not cached client-side.
 */
(function () {
  'use strict';

  var ROLE_NAMES = {
    attendee: 'Attendee', sponsor: 'Sponsor', vip: 'VIP',
    speaker: 'Speaker', host: 'Host', guest: 'Guest'
  };

  /* Reference order: VIP, Sponsor, Speaker, then the rest. The people who need
     placing carefully are the ones you want at the top of the pool. */
  var ROLE_RANK = ['vip', 'sponsor', 'speaker', 'host', 'attendee', 'guest'];

  /* The event's people who are known NOT to be seated at load. Everyone else in
     the pool is learned from the plan itself (see learn()), so the prototype
     needs no fictional roster of all 386 attendees — the arithmetic is the same
     one the real query does, over the data actually on the page. */
  var ROSTER = [
    { name: 'Dame Helen Verity', org: 'Guest of Honour', role: 'vip' },
    { name: 'Marcus Webb', org: 'Barclaycard', role: 'sponsor' },
    { name: 'Priya Anand', org: 'Keynote', role: 'speaker' },
    { name: 'Tom Fielding', org: 'Revolut', role: 'attendee' },
    { name: 'Grace Owens', org: 'Monzo', role: 'attendee' },
    { name: 'Omar Farah', org: 'Wise', role: 'attendee' },
    { name: 'Nina Kaur', org: 'Stripe', role: 'attendee' }
  ];

  /* Anyone this module has seen seated: how a manually-added guest (TASK-342309)
     survives being unseated, since they are on no attendee list. */
  var known = {};

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
  function roleOfDot(dot) {
    var m = (dot.className || '').match(/sp-dot--(attendee|sponsor|vip|speaker|host|guest)/);
    return m ? m[1] : null;
  }

  /* ------------------------------------------------------- who is seated */

  /* Every seated person in the event, with their role.
     Two sources, because only the OPEN table has seat rows:
       · the open table's seat list — role + name + company on the row itself
       · every other card — data-sp-occupants (name~org per filled seat, in seat
         order) paired with the filled dots, which carry the role in their class
     Pairing is by order: occupants[i] belongs to the i-th filled dot. */
  function seated() {
    var out = {};

    all('[data-sp-seatlist] .sp-seat[data-sp-role]').forEach(function (row) {
      var name = (one('.sp-seat__name', row) || {}).textContent || '';
      if (!name) return;
      out[name] = {
        name: name,
        org: (one('.sp-seat__org', row) || {}).textContent || '',
        role: row.getAttribute('data-sp-role')
      };
    });

    all('[data-sp-table]').forEach(function (card) {
      var occupants = (card.getAttribute('data-sp-occupants') || '').split('|').filter(Boolean);
      if (!occupants.length) return;

      /* Iterate the FILLED SEATS, not the occupant list. Reducing a table's
         capacity (342307) removes dots but leaves the occupant list at its old
         length, so walking the list would keep counting the displaced people as
         seated and they would never reach the pool. The seats are the truth;
         the list is just the names for them. */
      all('.sp-dot', card).filter(roleOfDot).forEach(function (dot, i) {
        var parts = (occupants[i] || '').split('~');
        var name = parts[0];
        if (!name || out[name]) return;   /* the open table's rows win — they're live */
        out[name] = { name: name, org: parts[1] || '', role: roleOfDot(dot) };
      });
    });

    return out;
  }

  /* Remember anyone seated who isn't on the roster — manual guests, and people
     seated before this module loaded. Without this a guest would vanish from the
     pool the moment they were unseated. */
  function learn(seatedNow) {
    Object.keys(seatedNow).forEach(function (name) {
      var onRoster = ROSTER.some(function (p) { return p.name === name; });
      if (!onRoster) known[name] = seatedNow[name];
    });
  }

  /* --------------------------------------------------------------- derive */

  function pool() {
    var seatedNow = seated();
    learn(seatedNow);

    var candidates = ROSTER.slice();
    Object.keys(known).forEach(function (name) { candidates.push(known[name]); });

    var seen = {};
    return candidates
      .filter(function (p) {
        if (seatedNow[p.name] || seen[p.name]) return false;
        seen[p.name] = true;
        return true;
      })
      .sort(function (a, b) {
        return ROLE_RANK.indexOf(a.role) - ROLE_RANK.indexOf(b.role);
      });
  }

  /* ---------------------------------------------------------------- render */

  function rowHtml(p) {
    var role = p.role in ROLE_NAMES ? p.role : 'guest';
    return '<div class="sp-person" data-sp-person draggable="true" data-sp-person-name="' +
      esc(p.name) + '" data-sp-person-role="' + role + '">' +
      '<span class="sp-role sp-role--' + role + '">' + ROLE_NAMES[role] + '</span>' +
      '<p class="sp-person__name">' + esc(p.name) + '</p>' +
      '<span class="sp-person__org">' + esc(p.org) + '</span>' +
      '</div>';
  }

  var EMPTY =
    '<div class="sp-tray__empty" data-sp-tray-empty>' +
    '<i data-lucide="circle-check" aria-hidden="true"></i>' +
    '<p class="sp-tray__empty-title">Everyone is seated</p>' +
    '<p class="sp-tray__empty-desc">Nobody is waiting for a seat. Unseat someone, ' +
    'or add a guest from a seat’s Assign action.</p>' +
    '</div>';

  function render() {
    var list = one('[data-sp-tray-list]');
    if (!list) return;

    var people = pool();
    list.innerHTML = people.length ? people.map(rowHtml).join('') : EMPTY;

    /* A search in progress must survive a re-derive, or unseating someone while
       filtering silently widens the list back out. */
    applySearch();
    refreshIcons();
  }

  /* ---------------------------------------------------------------- search */

  function applySearch() {
    var input = one('[data-sp-tray-search]');
    if (!input) return;
    var q = input.value.trim().toLowerCase();

    var shown = 0;
    all('[data-sp-person]').forEach(function (row) {
      var hit = !q || row.textContent.toLowerCase().indexOf(q) !== -1;
      if (hit) { row.removeAttribute('hidden'); shown++; }
      else row.setAttribute('hidden', '');
    });

    /* "no match" is not the same message as "nobody is unassigned" */
    var none = one('[data-sp-tray-none]');
    var total = all('[data-sp-person]').length;
    if (none) {
      if (q && total && !shown) {
        none.innerHTML = 'Nobody in the pool matches <strong>' + esc(input.value.trim()) +
          '</strong>.';
        none.removeAttribute('hidden');
      } else {
        none.setAttribute('hidden', '');
      }
    }

    var badge = one('[data-sp-tray-count]');
    if (badge) badge.textContent = shown;
  }

  /* ---------------------------------------------------------------- wiring */

  function init() {
    if (!one('[data-sp-tray-list]')) return;

    if (window.SeatingPlannerWorkspace) {
      window.SeatingPlannerWorkspace.on('unassigned-tray', render);
    }

    var input = one('[data-sp-tray-search]');
    if (input) input.addEventListener('input', applySearch);

    /* Learn whoever the authored markup already has in the pool, so a state file
       that opens with extra people keeps them. */
    all('[data-sp-person]').forEach(function (row) {
      var name = (one('.sp-person__name', row) || {}).textContent || '';
      var badge = one('.sp-role', row);
      var m = badge ? (badge.className || '').match(/sp-role--(\w+)/) : null;
      if (!name || ROSTER.some(function (p) { return p.name === name; })) return;
      known[name] = {
        name: name,
        org: (one('.sp-person__org', row) || {}).textContent || '',
        role: m ? m[1] : 'guest'
      };
    });

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
