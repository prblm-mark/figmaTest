/* CRM Analysis — demo data (TASK-471015).
 *
 * CONTRACTS are not here: the page loads ../ContractAnalysis/contract-analysis-data.js and counts
 * them by the same rule as Contract Analysis (not cancelled, not archived), so the two screens show
 * the same contract value, customers and average. It also shares that screen's fixed demo "today"
 * (CONTRACT_ANALYSIS_TODAY, 26 Sep 2026), so "this month" is most of a month.
 *
 * WHAT IS REAL (AffinoComrz CRMProfileOpportunityStage, read 2026-10-05): the opportunity stages,
 * their codes and order. Classic's "open" rule is Stage NOT IN (1, 9, 10, 11): Prospecting, Closed
 * Won, Closed and On Hold are all outside it. The currency is the CRM profile default (GBP, £).
 *
 * WHAT IS MOCK: every count and amount.
 *   TODO(backend:CrmAnalysis) crm-data: classic's queries, all in /AfoSiteAnalysis/CC/CRMAnalysis.cfm —
 *   qGetTotalContacts (distinct AccountContact contacts), qGetTotalAccounts, qGetTotalOpportunities,
 *   qGetTotalWins (Stage 9), qGetContractsMonth / qGetTotalMonthlyContracts, qGetContractValue,
 *   qGetTotalContracts (distinct accounts with a contract), qGetOpportunitiesMonth (Stage NOT IN 9,10),
 *   qGetTotalMonthlyOpportunities, qGetOpportunityValue / qGetTotalOpenOpportunities (NOT IN 1,9,10,11),
 *   qNewContactNotesLast30Days, qUnSubscribesLast30Days.
 */
var CRM = (function () {
  var TODAY = CONTRACT_ANALYSIS_TODAY;

  var stages = [
    { code: 1, name: 'Prospecting', open: false },
    { code: 2, name: 'Qualification', open: true },
    { code: 3, name: 'Needs Analysis', open: true },
    { code: 4, name: 'Value Proposition', open: true },
    { code: 7, name: 'Proposal / Price / Quote', open: true },
    { code: 8, name: 'Negotiation / Review', open: true },
    { code: 9, name: 'Closed Won', open: false, won: true },
    { code: 10, name: 'Closed', open: false },
    { code: 11, name: 'On Hold', open: false }
  ];

  var seed = 471015;
  function rnd() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 10); }

  /* Opportunities over five years, denser recently. Old ones have mostly closed (won or not); the
     open stages hold mostly the last few months, later stages a little older than early ones. */
  var opportunities = [];
  var start = new Date(TODAY.getFullYear() - 5, 0, 1), span = Math.round((TODAY - start) / 864e5);
  for (var i = 0; i < 1296; i++) {
    var created = addDays(start, Math.floor(Math.pow(rnd(), 0.5) * span));
    var age = (TODAY - created) / 864e5, r = rnd(), stage;
    if (age > 240) stage = r < 0.36 ? 9 : r < 0.93 ? 10 : 11;
    else if (age > 90) stage = r < 0.3 ? 9 : r < 0.62 ? 10 : r < 0.68 ? 11 : r < 0.78 ? 8 : r < 0.9 ? 7 : 4;
    else stage = r < 0.12 ? 1 : r < 0.3 ? 2 : r < 0.46 ? 3 : r < 0.6 ? 4 : r < 0.72 ? 7 : r < 0.8 ? 8 : r < 0.88 ? 9 : r < 0.97 ? 10 : 11;
    opportunities.push({ created: created, stage: stage, amount: Math.round((2 + Math.pow(rnd(), 2) * 58) * 1000 / 50) * 50 });
  }

  /* Notes and unsubscribes per day for the last 60 days (classic loads 30; the 30 before give the
     comparison). Notes follow the working week; unsubscribes spike after a newsletter send. */
  function daily(fn) {
    var out = [];
    for (var d = 59; d >= 0; d--) { var day = addDays(TODAY, -d); out.push({ date: day, count: fn(day, d) }); }
    return out;
  }
  var notes = daily(function (day) {
    var w = day.getDay();
    return w === 0 || w === 6 ? Math.floor(rnd() * 3) : 6 + Math.floor(rnd() * 12);
  });
  var unsubscribes = daily(function (day, d) {
    var send = day.getDay() === 2;                       // Tuesday newsletter
    var recent = d < 30 ? 1.25 : 1;                      // a little worse lately
    return Math.round((send ? 9 + rnd() * 8 : rnd() * 4) * recent);
  });

  return {
    today: TODAY,
    contacts: 3842,              // distinct contacts linked to an account
    accounts: 1064,
    stages: stages,
    opportunities: opportunities,
    notes: notes,
    unsubscribes: unsubscribes,
    currency: { prefix: '£', iso: 'GBP' }
  };
})();
