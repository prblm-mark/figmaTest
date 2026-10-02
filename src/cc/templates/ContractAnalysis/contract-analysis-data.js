/* Contract Analysis — mock data (TASK-470978).
 *
 * One flat list of contracts, from which ContractAnalysis.js computes every KPI, chart and
 * table, so that the filters really filter. The field names follow the classic `Contract`
 * table: Amount, OutstandingAmount, PaymentStatus, CancelledYN, ContractOrigin, TypeCode,
 * Created, StartDate, EndDate, AccountCode.
 *
 * Seeded (mulberry32), so the numbers are the same on every load, and dated against a fixed demo
 * "today" of 26 Sep 2026, so the windows (this month, last 12 months, last 5 years) are stable and
 * "this month" has most of a month of data (a real early-month date would leave those charts empty).
 *
 * TODO(backend:ContractAnalysis) [contract-analysis-data]: mock. Live, each tab's figures come
 * from the queries in AfcCommunityMgr/CC/{ContractOverview,ContractTopAccounts,
 * ContractOutstanding,MonthlyReview}.cfm, under ONE shared definition of "counted" (see
 * ContractAnalysis.figma-notes.md, Data rules).
 */
var CONTRACT_ANALYSIS_TODAY = new Date(2026, 8, 26);

var CONTRACT_ANALYSIS_LOOKUPS = {
  accountTypes: ['Advertiser', 'Agency', 'Sponsor', 'Subscriber', 'Partner'],
  contractTypes: ['Advertising', 'Sponsorship', 'Subscription', 'Events', 'Licence'],
  industries: ['Financial Services', 'Technology', 'Healthcare', 'Retail', 'Media', 'Energy', 'Education', 'Travel'],
  owners: ['Sarah Khan', 'David Njoku', 'Aisha Patel', 'Tom Riley', 'Hana Ashby'],
  media: ['Print', 'Digital', 'Events', 'Mixed'],
  paymentStatuses: ['Pending', 'Initial Payment', 'Partially Paid', 'Paid', 'Written Off', 'In Arrears', 'Cancelled']
};

var CONTRACT_ANALYSIS_DATA = (function () {
  'use strict';

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  var rnd = mulberry32(470978);
  function pick(list) { return list[Math.floor(rnd() * list.length)]; }
  function between(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }

  var L = CONTRACT_ANALYSIS_LOOKUPS;
  var TODAY = CONTRACT_ANALYSIS_TODAY;

  var NAMES = ['Mastercard', 'Monzo', 'GoCardless', 'Synergy Partners', 'Wise', 'Adyen', 'Klarna', 'Starling Bank',
    'Revolut', 'Barclays', 'Lloyds Banking Group', 'Ocado', 'Tesco', 'Sainsbury’s', 'BBC Studios', 'Channel 4',
    'Reach plc', 'Future plc', 'Octopus Energy', 'Bulb', 'Pearson', 'FutureLearn', 'Skyscanner', 'Trainline',
    'Babylon Health', 'Cera Care', 'Darktrace', 'Sage', 'Arm', 'Deliveroo', 'Just Eat', 'ASOS', 'Boohoo',
    'Hargreaves Lansdown', 'Zopa', 'Funding Circle', 'OakNorth', 'Thought Machine', 'Cazoo', 'Gymshark',
    'Innovate Solutions', 'Catalyst Enterprises', 'Pinnacle Technologies', 'Nexus Innovations', 'The Creative Hub'];

  var accounts = NAMES.map(function (name, i) {
    /* A few big spenders, a long tail: makes Top Accounts read like a real ranking. */
    var weight = i < 6 ? 4 : i < 16 ? 2 : 1;
    return { code: 1200 + i * 7, name: name, accountType: pick(L.accountTypes), industry: pick(L.industries), weight: weight };
  });

  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function addMonths(d, n) { return new Date(d.getFullYear(), d.getMonth() + n, d.getDate()); }

  var contracts = [];
  var code = 90100;
  /* ~5 years back from today, denser recently (the business grew). */
  var start = new Date(TODAY.getFullYear() - 4, 0, 1);
  var days = Math.round((TODAY - start) / 86400000);
  for (var i = 0; i < 260; i++) {
    var acct = accounts[Math.floor(Math.pow(rnd(), 1.6) * accounts.length)];
    var skew = Math.pow(rnd(), 0.55);                       /* bias towards recent */
    var created = addDays(start, Math.floor(skew * days));
    var type = pick(L.contractTypes);
    var renewable = rnd() > 0.3;
    var origin = rnd() > 0.45 ? 1 : 2;                       /* 1 New business, 2 Renewal */
    var amount = Math.round((between(15, 180) * 100 * acct.weight * (type === 'Sponsorship' ? 2.2 : 1)) / 50) * 50;
    var startDate = addDays(created, between(0, 21));
    var endDate = renewable ? addMonths(startDate, pick([6, 12, 12, 24])) : null;
    var pay = rnd();
    var paymentStatus = pay < 0.55 ? 'Paid' : pay < 0.68 ? 'Partially Paid' : pay < 0.78 ? 'Pending'
      : pay < 0.86 ? 'Initial Payment' : pay < 0.93 ? 'In Arrears' : pay < 0.97 ? 'Written Off' : 'Cancelled';
    var cancelled = paymentStatus === 'Cancelled' || rnd() < 0.03;
    var outstanding = paymentStatus === 'Paid' || paymentStatus === 'Written Off' ? 0
      : paymentStatus === 'Pending' ? amount
      : Math.round(amount * (0.25 + rnd() * 0.6) / 50) * 50;
    contracts.push({
      code: code++,
      name: type + ' ' + created.getFullYear() + (renewable ? '' : ' (one-off)'),
      accountCode: acct.code,
      account: acct.name,
      accountType: acct.accountType,
      industry: acct.industry,
      owner: pick(L.owners),
      type: type,
      origin: origin,
      renewable: renewable,
      media: pick(L.media),
      created: created,
      startDate: startDate,
      endDate: endDate,
      amount: amount,
      outstanding: outstanding,
      paymentStatus: paymentStatus,
      cancelled: cancelled,
      archived: rnd() < 0.02
    });
  }
  return { accounts: accounts, contracts: contracts };
})();
