/* Live Dashboard — demo data (TASK-471013).
 *
 * WHAT IS REAL: every NAME. The articles are affino.com's own (AffinoComrz top articles by 30-day
 * views, read 2026-10-05: titles, StandardItemCodes, publish dates, authors). Channels, topics and
 * people are the real names already used by the listing demos (listing-data-articles.js,
 * listing-data-media-items.js). Companies are real Affino clients.
 *
 * WHAT IS MOCK: every COUNT, and which person is online at which company.
 *   TODO(backend:LiveDashboard) live-data: classic's own sources, all in
 *   /AfoSiteAnalysis/cfc/Dashboard.cfc — getOnlineUsers (Members, Guests, qGetMembers),
 *   getDayPageViews (qGetPageViews today by hour, qGetAveragePageViews), getTimeFrame (hours back
 *   to 2,000 content views, max 24), getCreatorViews, getChannelViews, getTaxonomyCategoryViews,
 *   getArticleViews (each over that window, with MaxRows paging).
 */
var LD = (function () {
  function avatar(name) { return 'https://i.pravatar.cc/64?u=' + encodeURIComponent(name); }

  /* Online members: real people (the listing demos' creators) at real client companies. */
  var online = [
    ['Laura Fanni', 'The Payment Fintech Club'], ['Kevin Barrow', 'Green Star Media'], ['James Corcoran', 'Charity Digital'],
    ['Simon Hassell', 'The Stage'], ['Susan Kerrigan', 'The Bookseller'], ['James Bolesworth', 'CRM AgriCommodities'],
    ['Maria Mellor', 'Jacobs Media'], ['Janice Johnston', 'Wyvex'], ['Denise Rattray', 'OMG'], ['Erika Simpson', 'The Stage'],
    ['Alexandra Lima', 'Athene'], ['Laura Stanley', 'Charity Digital'], ['Zachariah Markusson', 'Affino'], ['Quang Luong', 'Affino'],
    ['Luis Montiel', 'Affino'], ['Jose Claramunt', 'Affino'], ['Julius Metyko', 'Affino'], ['Markus Karlsson', 'Affino'],
    ['Mark Foster', 'Affino'], ['Stefan Karlsson', 'Affino']
  ].map(function (p, i) { return { code: 10480 + i * 7, name: p[0], company: p[1], avatar: avatar(p[0]) }; });

  var authors = ['Stefan Karlsson', 'Markus Karlsson', 'Mark Foster', 'Quang Luong', 'Zachariah Markusson', 'Laura Fanni',
                 'Kevin Barrow', 'Maria Mellor', 'James Bolesworth', 'Simon Hassell', 'Susan Kerrigan', 'Erika Simpson']
    .map(function (n, i) { return { code: 20010 + i * 11, name: n, avatar: avatar(n), views: Math.round(640 * Math.pow(0.74, i)) + 3 }; });

  var channels = ['Affino Insights', 'Affino Blog', 'Affino Knowledge Base', 'Cookie Armageddon', 'Video Store', 'Members',
                  'Support', 'Store', 'Industries', 'About', 'Media', 'Affino Media']
    .map(function (n, i) { return { code: 300 + i * 13, name: n, views: Math.round(980 * Math.pow(0.7, i)) + 2 }; });

  var topics = ['Affino Features', 'Accessibility', 'Actionable Intelligence', 'Affino Design', 'Ad Blocking',
                'Affiliate Commerce', 'Affino Help', 'Affino Elements', 'Admin', 'Access', 'Affino Brand Design', 'Action']
    .map(function (n, i) { return { code: 5100 + i * 17, name: n, views: Math.round(410 * Math.pow(0.76, i)) + 2 }; });

  /* affino.com's top articles by 30-day views (real), with window view counts (mock). */
  var articles = [
    [625174, '120 Years of Icelandic Art - 9 Favourite Artists and Artworks', 'Stefan Karlsson', '2019-06-16'],
    [625609, '11 Favourite Camden Market Shops', 'Stefan Karlsson', '2022-08-10'],
    [624741, 'Three Reasons Why you should choose Parajumpers as your next High Quality Winter Parka', 'Stefan Karlsson', '2018-01-05'],
    [625608, '10 Favourite Camden Market Eats!', 'Stefan Karlsson', '2022-08-02'],
    [626105, 'Film Release Highlights for 2025', 'Stefan Karlsson', '2025-01-08'],
    [626353, 'Affino 9.0.11.25 - The Refinement Update', 'Markus Karlsson', '2026-09-02'],
    [625612, '10 Key Camden Live Music Venues', 'Stefan Karlsson', '2022-08-17'],
    [504523, 'The Science of Brand Colours', 'Stefan Karlsson', '2013-06-21'],
    [548331, 'Brand Identity - Unique, Relevant, Meaningful, Memorable!', 'Stefan Karlsson', '2015-09-10'],
    [625740, 'Film Release Highlights for 2024', 'Stefan Karlsson', '2024-01-05'],
    [626199, 'Film Release Highlights for 2026', 'Stefan Karlsson', '2026-01-16'],
    [625171, 'Japanese Kawaii Culture and the ever pervasive influence of Cute', 'Stefan Karlsson', '2019-05-14'],
    [626259, 'Affino 9.0.11 - The Connected Update', 'Markus Karlsson', '2026-05-01'],
    [625267, 'CRM', 'Mark Foster', '2020-04-08'],
    [612461, 'Awards Entry Setup Guide', 'Quang Luong', '2017-04-27'],
    [625270, 'Subscription & Membership', 'Mark Foster', '2020-04-08'],
    [625274, 'Events, Awards & Directories', 'Mark Foster', '2020-04-08'],
    [625273, 'CMS', 'Mark Foster', '2020-04-08']
  ].map(function (a, i) {
    return { code: a[0], title: a[1], author: a[2], avatar: avatar(a[2]), published: a[3], views: Math.round(186 * Math.pow(0.83, i)) + 4 };
  });

  /* Page views by hour (mock): a weekday curve that peaks late morning and again mid-afternoon (UK).
     Average = the site's usual day; today runs ahead of it up to the current hour. */
  var shape = [18, 12, 9, 7, 6, 8, 14, 32, 58, 82, 96, 100, 92, 86, 94, 90, 78, 64, 52, 46, 41, 36, 29, 22];
  var average = shape.map(function (s) { return Math.round(s * 7.4); });
  var today = shape.map(function (s, h) { return Math.round(s * 7.4 * (1.12 + 0.12 * Math.sin(h / 2.3))); });

  return {
    timeframe: 3,                    // hours back to 2,000 views (classic's getTimeFrame)
    members: 37, guests: 147,
    online: online, authors: authors, channels: channels, topics: topics, articles: articles,
    pageViews: { today: today, average: average },
    /* Classic's own initial counts and "view more" steps (index.cfm strSettings). */
    paging: { online: [10, 10], creator: [4, 8], channel: [5, 10], taxonomy: [5, 10], article: [5, 10] }
  };
})();
