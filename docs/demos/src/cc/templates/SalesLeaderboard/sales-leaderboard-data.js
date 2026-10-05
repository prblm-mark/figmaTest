/* Sales Leaderboard — demo data (TASK-471014).
 *
 * WHAT IS REAL (AffinoComrz config, read 2026-10-05): the currencies and how each one formats
 * (Currency: GBP £ 2dp primary, EUR € 0dp, USD $ 0dp), the product lines (Affino, Digital Leaders
 * Forum, CEO Forum), the product categories (Consultancy, Training, SaaS, Design and Build, Support),
 * the business unit "Affino" and the sales team "Main Affino Sales Team". The sales people are the
 * staff names the other CC demos use; the accounts are real Affino clients.
 *
 * WHAT IS MOCK: every order. affino.com has ONE sales team and ONE business unit, so the live
 * leaderboard there has a single row; the extra teams and units below show the screen at the size
 * it is built for. Products are plausible items in the real categories and lines.
 *   TODO(backend:SalesLeaderboard) sales-data: classic's own sources, all in
 *   /AfoECommerce/cfc/SalesLeaderboard.cfc — getZoneCurrencies, getTotalMonthlySales (this year and
 *   last, by month, ex VAT), getTopSalesTeams, getTopSalesPeople, getMostRecentSales (each from the
 *   time frame's start, MaxRows paging, capped at 100), and getData for the refresh. Orders in the
 *   CRM profile's excluded order / payment statuses are left out, as classic does.
 *
 * The orders are generated from a fixed seed relative to TODAY, so every time frame has data and the
 * demo looks the same on every load.
 */
var SL = (function () {
  function avatar(name) { return 'https://i.pravatar.cc/64?u=' + encodeURIComponent(name); }

  var currencies = [
    { code: 1, iso: 'GBP', prefix: '£', dp: 2, primary: true },
    { code: 4, iso: 'EUR', prefix: '€', dp: 0 },
    { code: 3, iso: 'USD', prefix: '$', dp: 0 }
  ];

  var units = [{ code: 1, name: 'Affino' }, { code: 2, name: 'Affino Events' }, { code: 3, name: 'Affino Media' }];

  var teams = [
    { code: 1, name: 'Main Affino Sales Team', unit: 1 },
    { code: 2, name: 'New Business', unit: 1 },
    { code: 3, name: 'Account Management', unit: 1 },
    { code: 4, name: 'Forums and Events', unit: 2 },
    { code: 5, name: 'Partnerships', unit: 3 },
    { code: 6, name: 'Renewals', unit: 1 },
    { code: 7, name: 'International', unit: 3 }
  ];

  /* teams: one code, or several (classic shows "Multiple" for the team, and for the unit when the
     teams sit in different units). weight = share of the orders they own. */
  var people = [
    ['Markus Karlsson', [1, 2], 9], ['Stefan Karlsson', [2], 8], ['Mark Foster', [3], 6],
    ['Zachariah Markusson', [4], 6], ['Quang Luong', [3], 4], ['Luis Montiel', [5], 4],
    ['Jose Claramunt', [6], 3], ['Julius Metyko', [7], 3], ['Laura Fanni', [4], 2], ['Kevin Barrow', [2], 2],
    ['Maria Mellor', [6], 1], ['Simon Hassell', [7], 1]
  ].map(function (p, i) { return { code: 100120 + i * 13, name: p[0], teams: p[1], weight: p[2], avatar: avatar(p[0]) }; });

  /* [name, category, line, ex-VAT price in GBP] */
  var products = [
    ['Affino SaaS licence - annual', 'SaaS', 'Affino', 18000], ['Affino AI add-on - annual', 'SaaS', 'Affino', 6000],
    ['Additional site licence', 'SaaS', 'Affino', 4500], ['Site audit', 'Consultancy', 'Affino', 3500],
    ['Content strategy workshop', 'Consultancy', 'Affino', 2400], ['Editor training day', 'Training', 'Affino', 1200],
    ['Control Centre masterclass', 'Training', 'Affino', 650], ['Design and build - new site', 'Design and Build', 'Affino', 24000],
    ['Template redesign', 'Design and Build', 'Affino', 7500], ['Premium support - 12 months', 'Support', 'Affino', 9600],
    ['Support hours bundle (10)', 'Support', 'Affino', 1150],
    ['Digital Leaders Forum - annual membership', 'Training', 'Digital Leaders Forum', 2950],
    ['Digital Leaders Forum - summit pass', 'Training', 'Digital Leaders Forum', 795],
    ['CEO Forum - annual membership', 'Consultancy', 'CEO Forum', 4500]
  ].map(function (p, i) { return { code: 40210 + i * 7, name: p[0], category: p[1], line: p[2], price: p[3], weight: [3, 2, 2, 3, 2, 5, 6, 1, 2, 3, 6, 4, 6, 2][i] }; });

  var accounts = ['The Payment Fintech Club', 'Green Star Media', 'Charity Digital', 'The Stage', 'The Bookseller',
    'CRM AgriCommodities', 'Jacobs Media', 'Wyvex', 'OMG', 'Athene'];

  /* Seeded PRNG (mulberry32), so the demo is stable. */
  var seed = 471014;
  function rnd() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  function pick(list) {
    var total = list.reduce(function (s, x) { return s + (x.weight || 1); }, 0), r = rnd() * total;
    for (var i = 0; i < list.length; i++) { r -= list[i].weight || 1; if (r <= 0) return list[i]; }
    return list[list.length - 1];
  }
  var RATE = { 1: 1, 4: 1.17, 3: 1.27 };   // GBP → currency, for mock prices only

  /* Orders from 1 Jan last year to now: about five a weekday. Busier mid-week, quieter in August and over Christmas;
     this year runs about 18% ahead of last. A quarter of orders are web orders with no owner: they
     count in the monthly totals but in no leaderboard (classic's OwnerUserCode > 0). */
  var orders = [];
  var now = new Date();
  var day = new Date(now.getFullYear() - 1, 0, 1, 9, 0, 0);
  var orderNo = 58210;
  while (day <= now) {
    var dow = day.getDay(), m = day.getMonth();
    var base = dow === 0 || dow === 6 ? 0.8 : 5;
    if (m === 7) base *= 0.6;
    if (m === 11 && day.getDate() > 18) base *= 0.3;
    if (day.getFullYear() === now.getFullYear()) base *= 1.18;
    var n = Math.floor(base + rnd() * 3);
    for (var k = 0; k < n; k++) {
      var created = new Date(day.getTime() + Math.floor(rnd() * 9 * 3600000));
      if (created > now) continue;
      var cur = rnd() < 0.74 ? 1 : rnd() < 0.6 ? 4 : 3;
      var owner = rnd() < 0.75 ? pick(people) : null;
      var lines = [], count = rnd() < 0.8 ? 1 : 2;
      for (var j = 0; j < count; j++) {
        var p = pick(products);
        var price = p.price * RATE[cur] * (0.85 + rnd() * 0.3) * 0.4;   // a smaller-ticket mix: more, smaller orders
        price = cur === 1 ? Math.round(price * 100) / 100 : Math.round(price);
        lines.push({ product: p, value: price });
      }
      orders.push({
        code: orderNo++, created: created, currency: cur, owner: owner,
        account: accounts[Math.floor(rnd() * accounts.length)],
        lines: lines, value: lines.reduce(function (s, l) { return s + l.value; }, 0)
      });
    }
    day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1, 9, 0, 0);
  }
  /* Order numbers in the order they were placed, as Affino's order codes are. */
  orders.sort(function (a, b) { return a.created - b.created; });
  orders.forEach(function (o, i) { o.code = 58210 + i; });

  return {
    currencies: currencies, units: units, teams: teams, people: people, products: products, orders: orders,
    /* Classic's time frames (SalesLeaderboard.cfm qTimeFrame) and their order. Default: Current Week. */
    timeframes: [
      { code: 1, name: 'Current week' }, { code: 2, name: '7 days' }, { code: 3, name: 'Current month' },
      { code: 4, name: 'Previous month' }, { code: 5, name: '30 days' }, { code: 6, name: 'Current year' },
      { code: 7, name: '12 months' }
    ],
    /* Classic's initial counts and "view more" steps (strSettings), and getData's 100-row cap. */
    paging: { team: [5, 5], person: [5, 5], recent: [5, 5], max: 100 },
    refreshMs: 300000                    // classic: setTimeout 3E5, only while the window has focus
  };
})();
