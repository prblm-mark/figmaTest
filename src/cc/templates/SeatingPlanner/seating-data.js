/* Seating Planner — baseline dataset for the working prototype
 * ============================================================
 * Built from the Design System "Populated" frames, `3515:202250` (desktop) and `3515:213496`
 * (mobile). The full extraction, including where those frames do not reconcile, is recorded in
 * SeatingPlanner.figma-notes.md § "The Populated baseline".
 *
 * WHAT IS AUTHORED HERE vs WHAT IS DERIVED
 * Authored: the four plans, their tables, each table's type and sponsor, and which roster person
 * sits in which seat. Everything a screen displays about a count is DERIVED from those by
 * seating-app.js — table occupancy, the per-role legend splits, plan totals, seats free, the
 * unassigned pool, and the event's attendee figure. Nothing that can be counted is stored.
 *
 * That is deliberate: every "hardcoded" caveat on this surface (seating-room-list,
 * seating-table-grid, seating-table-detail, seating-header) exists because those numbers were
 * written by hand and could drift from what they described. Derived numbers cannot.
 *
 * UNASSIGNED = SIGNED UP − ASSIGNED  (designer, 2026-09-09)
 * It is a moving variable and has nothing to do with capacity: "there could be 3000 seats
 * available but only 80 people signed up, and 10 have been assigned so 70 are unassigned."
 * Because "assigned" means assigned to ANY seat in the event, the pool is EVENT-WIDE — switching
 * plans does not change it; only seating or unseating somebody does.
 *
 * The roster is 183, which is what makes the baseline open at the frame's 72 unassigned. The
 * frame's own "386 attendees" cannot coexist with 72 unassigned across 234 seats of capacity
 * (386 − 72 = 314 people to seat, 234 seats to put them in), so the attendee figure is derived
 * from the roster instead of being authored — by the rule above it is a moving variable too.
 *
 * MOCK PEOPLE. The names below are generated, not real, and not from Figma — the frames can only
 * show the handful on screen. Tracked as seating-export-occupant-coverage.
 */
(function () {
  'use strict';

  /* ── Roles ─────────────────────────────────────────────────────────────────────────────────
   * The five the Seating Planner palette defines. `key` drives the `--<role>` modifiers on
   * TableCard's bar segments and legend, on TableDetail's legend, and on AttendeeCard's accent —
   * so it must stay in step with `--sp-<key>` in css/tokens-seating-*.css. */
  var ROLES = [
    { key: 'attendee', label: 'Attendee' },
    { key: 'vip',      label: 'VIP' },
    { key: 'speaker',  label: 'Speaker' },
    { key: 'sponsor',  label: 'Sponsor' },
    { key: 'host',     label: 'Host' }
  ];

  /* ── Table types ───────────────────────────────────────────────────────────────────────────
   * `{ id, label, colour }`. A tier is a NAME plus a PICKED COLOUR, which is what the Table
   * types modal (Figma `1:43245`) actually edits — each of its rows is a ColorPickerInput chip
   * beside a text field. TableType is built for exactly this: its own CSS documents
   * `--table-type-color` as the API and calls the five `--vip` / `--gold` / … modifiers "just
   * presets carrying the tier colours Figma ships".
   *
   * SO THERE IS NO `variant` FIELD ANY MORE. It used to name one of those five presets, which
   * cannot express a tier the user has recoloured — the whole point of the picker. The colours
   * below are the modal's authored hexes, and `seating-app.js` re-reads them from its rows on
   * every render so a recolour or rename shows on the cards immediately.
   *
   * `Standard` is absent deliberately: it carries no colour and draws no chip, so a Standard
   * table is `typeId: null` rather than a type whose colour happens to be empty. The modal says
   * the same thing by giving that row neither a swatch nor a trash button.
   *
   * "Headline Sponsor" and "Platinum" are the baseline event's own tiers, drawn on the Populated
   * frame as relabelled Gold and VIP instances — so they carry those two colours. */
  var TYPES = [
    { id: 'headline-sponsor', label: 'Headline Sponsor', colour: '#d97706' },
    { id: 'platinum',         label: 'Platinum',         colour: '#00749e' },
    { id: 'head-table',       label: 'Head Table',       colour: '#991b1b' },
    { id: 'gold',             label: 'Gold',             colour: '#d97706' },
    { id: 'silver',           label: 'Silver',           colour: '#abb2b8' },
    { id: 'bronze',           label: 'Bronze',           colour: '#a07553' },
    { id: 'vip',              label: 'VIP',              colour: '#00749e' }
  ];

  /* ── Roster ────────────────────────────────────────────────────────────────────────────────
   * Generated from fixed pools by index, never randomly: the baseline has to be identical on
   * every load, and `Math.random()` would make a screenshot comparison meaningless. */

  var FIRST = [
    'Hana', 'Aisha', 'Eve', 'David', 'Mia', 'Sarah', 'Alan', 'Naomi', 'Ethan', 'Julian',
    'Nina', 'Zara', 'Noah', 'Isabella', 'Omar', 'Priya', 'Tom', 'Grace', 'Samuel', 'Leila',
    'Marcus', 'Freya', 'Idris', 'Chloe', 'Rafael', 'Anya', 'Callum', 'Simone', 'Dev', 'Martha',
    'Oscar', 'Yasmin', 'Felix', 'Rosa', 'Theo', 'Amara', 'Hugo', 'Bea', 'Kofi', 'Elena'
  ];

  var LAST = [
    'Ashby', 'Okafor', 'Owens', 'Shah', 'Farah', 'Prentice', 'Osei', 'Patel', 'Carter',
    'Ivanova', 'Khan', 'Sullivan', 'Torres', 'Haddad', 'Nair', 'Whitfield', 'Boateng',
    'Lindqvist', 'Moreau', 'Rahman', 'Castellano', 'Njoku', 'Petrov', 'Delgado', 'Fitzgerald'
  ];

  var COMPANIES = [
    'GoCardless', 'Visa Europe', 'Wise', 'Revolut', 'Klarna', 'Mastercard', 'Monzo',
    'Nexus Innovations', 'Lunar Technologies', 'Stellar Dynamics', 'SkyNet Solutions',
    'Synergy Partners', 'Vertex Creative', 'Adyen', 'Checkout.com', 'Starling Bank',
    'Curve', 'Zilch', 'Thought Machine', 'Form3'
  ];

  /* 183 people — see the header note for why this number and not 386. */
  var ROSTER_SIZE = 183;

  var roster = [];
  for (var i = 0; i < ROSTER_SIZE; i++) {
    /* Co-prime strides so first names, surnames and companies do not march in lockstep and
     * produce "Hana Ashby / GoCardless" repeating every 20 rows. */
    roster.push({
      id: 'p' + (i + 1),
      name: FIRST[i % FIRST.length] + ' ' + LAST[(i * 7) % LAST.length],
      company: COMPANIES[(i * 11) % COMPANIES.length]
    });
  }

  /* ── CRM directory ─────────────────────────────────────────────────────────────────────────
   * The Assign-person modal (Figma `3515:204464`) offers TWO sources: "Event Attendees" and
   * "CRM Contact". Event Attendees is derived — it is the unassigned pool — but CRM contacts are
   * people who have NOT signed up, so they need their own list. The modal's help text says what
   * this is for: "Search event attendees or accounts to seat someone."
   *
   * The first four are the frame's own authored rows, verbatim, including "Panel chair" sitting
   * in the second slot where the others carry a company — the design uses that line for whatever
   * identifies the person, not strictly an employer. The rest are added so a search has more
   * than four things to find.
   *
   * Seating one of these ADDS THEM TO THE EVENT (designer, 2026-09-10): they become a signed-up
   * attendee who happens to be seated, so the header's attendee count and the unassigned total
   * both move consistently — both are derived from the roster, so neither can drift.
   *
   * `role` comes from the person's record and drives the colour tag, which is the rule the
   * modal's own help text states.
   *
   * MOCK. Tracked as seating-assign-crm-lookup — a real build queries the CRM. */
  var CRM = [
    { id: 'c1',  name: 'Marcus Aurelius',  company: 'Aurora Labs',     role: 'sponsor' },
    { id: 'c2',  name: 'Rosa Delgado',     company: 'Panel chair',     role: 'attendee' },
    { id: 'c3',  name: "Liam O'Connor",    company: 'Partner Group',   role: 'attendee' },
    { id: 'c4',  name: 'Anne Rowntree',    company: 'Apex Design',     role: 'attendee' },
    { id: 'c5',  name: 'Priya Raghavan',   company: 'Thought Machine', role: 'speaker' },
    { id: 'c6',  name: 'Tobias Lindqvist', company: 'Form3',           role: 'attendee' },
    { id: 'c7',  name: 'Grace Boateng',    company: 'Starling Bank',   role: 'vip' },
    { id: 'c8',  name: 'Samuel Osei',      company: 'Checkout.com',    role: 'sponsor' },
    { id: 'c9',  name: 'Martha Whitfield', company: 'Keynote speaker', role: 'speaker' },
    { id: 'c10', name: 'Idris Farah',      company: 'Curve',           role: 'attendee' },
    { id: 'c11', name: 'Simone Castellano', company: 'Adyen',          role: 'vip' },
    { id: 'c12', name: 'Kofi Njoku',       company: 'Table host',      role: 'host' }
  ];

  /* ── Plans ─────────────────────────────────────────────────────────────────────────────────
   * `seats` is an array of length `capacity`. Each entry is either null (empty) or
   * `{ personId, role }`. Occupancy, the legend split and every total are counted off this, so
   * a seat can never disagree with a badge.
   *
   * `pick` walks the roster in order and hands out the next unused person, so nobody is seated
   * twice and the assignment is stable across loads. */
  var cursor = 0;
  function pick(role) {
    var person = roster[cursor++];
    /* THE RECORD CARRIES THE ROLE, and the seat agrees with it.
     *
     * The Assign-person modal states the rule outright — "their role comes from their record and
     * drives the colour tag" — and it shows a role for people who are not seated at all, so the
     * role cannot live only on the seat. Rather than re-deriving the authored tallies from
     * people's records (which would move every legend), the authored tally WRITES the record:
     * whoever gets picked for a Host slot is a Host. The seat keeps its own `role` because that
     * is what the legends read, and this guarantees the two can never disagree. */
    person.role = role;
    return { personId: person.id, role: role };
  }

  /* Fill `capacity` seats from a role tally, e.g. { attendee: 2, vip: 1 }. Remaining seats stay
   * null. Role order follows ROLES so a bar's segments read consistently left to right. */
  function seats(capacity, tally) {
    var out = [];
    ROLES.forEach(function (r) {
      var n = tally[r.key] || 0;
      for (var k = 0; k < n; k++) out.push(pick(r.key));
    });
    while (out.length < capacity) out.push(null);
    return out.slice(0, capacity);
  }

  function table(id, name, typeId, sponsor, capacity, tally) {
    return {
      id: id,
      name: name,
      typeId: typeId || null,
      sponsor: sponsor || null,
      capacity: capacity,
      seats: seats(capacity, tally || {})
    };
  }

  /* Main Ballroom — the 13 tables the listing draws. Tables 1 and 2 carry a type chip and a
   * sponsor; the rest are untyped, which is why their cards show no chip. Role tallies are
   * exactly the legend splits the frame draws, so the derived legend reproduces them —
   * except on the 0/10 cards, where the frame's stale `Empty (4)` becomes the correct
   * `Empty (10)`. See figma-notes for that and the three other corrections. */
  var mainBallroom = [
    table('mb1',  'Table 1',  'headline-sponsor', 'Mastercard', 10,
          { attendee: 2, vip: 1, speaker: 1, sponsor: 2, host: 1 }),   /* 7 / 10 */
    table('mb2',  'Table 2',  'platinum', 'Monzo', 10,
          { attendee: 2, vip: 1, speaker: 2 }),                        /* 5 / 10 */
    table('mb3',  'Table 3',  null, null, 10,
          { attendee: 2, speaker: 1, sponsor: 7 }),                    /* 10 / 10 — Full */
    table('mb4',  'Table 4',  null, null, 10,
          { attendee: 7, speaker: 1, sponsor: 2 }),                    /* 10 / 10 — Full */
    table('mb5',  'Table 5',  null, null, 10,
          { attendee: 1, vip: 1, speaker: 1, sponsor: 1 }),            /* 4 / 10 */
    table('mb6',  'Table 6',  null, null, 10, {}),                     /* 0 / 10 */
    table('mb7',  'Table 7',  null, null, 10,
          { speaker: 1, sponsor: 1 }),                                 /* 2 / 10 */
    table('mb8',  'Table 8',  null, null, 10, {}),
    table('mb9',  'Table 9',  null, null, 10, {}),
    table('mb10', 'Table 10', null, null, 10, {}),
    table('mb11', 'Table 11', null, null, 10, {}),
    /* Tables 12 and 13 exist as instances in the frame but fall outside the listing's visible
     * viewport, so their occupancy is not drawn. Empty, consistent with 8–11 around them. */
    table('mb12', 'Table 12', null, null, 10, {}),
    table('mb13', 'Table 13', null, null, 10, {})
  ];

  /* The other three plans are drawn only as summary cards — "6 tables · 41/48 seated",
   * "4 tables · 32/32 seated", "3 tables · Empty" — so their tables are constructed to total
   * exactly those figures. 8 seats each, which is what the card arithmetic implies (48/6, 32/4,
   * 24/3). Their per-table role mixes are not drawn anywhere and are plausible fill. */
  var overflowAnnex = [
    table('oa1', 'Table 1', 'gold', 'Visa Europe', 8, { attendee: 5, vip: 1, sponsor: 2 }),
    table('oa2', 'Table 2', null, null, 8, { attendee: 6, speaker: 2 }),
    table('oa3', 'Table 3', null, null, 8, { attendee: 7, speaker: 1 }),
    table('oa4', 'Table 4', null, null, 8, { attendee: 8 }),
    table('oa5', 'Table 5', null, null, 8, { attendee: 6, vip: 1, host: 1 }),
    table('oa6', 'Table 6', null, null, 8, { attendee: 1 })             /* 41 / 48 total */
  ];

  var vipLounge = [
    table('vl1', 'Table 1', 'vip', null, 8, { vip: 4, host: 1, speaker: 3 }),
    table('vl2', 'Table 2', 'vip', null, 8, { vip: 6, speaker: 2 }),
    table('vl3', 'Table 3', 'head-table', null, 8, { vip: 5, host: 1, attendee: 2 }),
    table('vl4', 'Table 4', 'vip', null, 8, { vip: 8 })                 /* 32 / 32 — Full */
  ];

  var pressRoom = [
    table('pr1', 'Table 1', null, null, 8, {}),
    table('pr2', 'Table 2', null, null, 8, {}),
    table('pr3', 'Table 3', null, null, 8, {})                          /* 0 / 24 — "Empty" */
  ];

  var PLANS = [
    { id: 'main-ballroom',  name: 'Main Ballroom',  tables: mainBallroom },
    { id: 'overflow-annex', name: 'Overflow Annex', tables: overflowAnnex },
    { id: 'vip-lounge',     name: 'VIP Lounge',     tables: vipLounge },
    { id: 'press-room',     name: 'Press Room',     tables: pressRoom }
  ];

  /* ── Event ─────────────────────────────────────────────────────────────────────────────────
   * `attendees` is deliberately ABSENT. It is the roster length, derived like the pool — see the
   * header note. Everything here is a genuine event fact the frame authors. */
  /* Everyone still unseated needs a record role too — the tray and the Assign modal both show
   * one, and only the seated had theirs written by pick() above. Assigned round-robin over ROLES
   * by index so it is identical on every load and every role is represented in the pool. */
  roster.forEach(function (p, i) {
    if (!p.role) p.role = ROLES[i % ROLES.length].key;
  });

  var EVENT = {
    name: 'The Card & Payments Awards 2026',
    date: '3 Feb 2026',
    venue: 'Grosvenor House, London'
  };

  window.SeatingData = {
    ROLES: ROLES,
    TYPES: TYPES,
    CRM: CRM,
    EVENT: EVENT,
    roster: roster,
    plans: PLANS,
    activePlanId: 'main-ballroom'
  };
}());
