/* Seating Planner — Export the plan (TASK-342305)
 *
 * The last sub-task onto the workspace shell:
 *
 *     SeatingPlannerWorkspace.on('export', openPreview)
 *
 * NOTE ON THE TASK NUMBER: the shell's markup carried TASK-344761 for these
 * controls, taken from the parent task's list. The brief for the work is 342305,
 * so the controls now say 342305. If 344761 is a separate piece of export work,
 * it is still unaccounted for — flagged in the handover.
 *
 * Read-only over the plan's tables and seats. Every row is derived from the DOM,
 * which only works because 342309 made each card record its occupants and
 * 351550 made those names unique — before that, "export the plan" could not have
 * named the people at 29 of the 30 tables.
 *
 * THE PREVIEW FOLLOWS THE FORMAT. The reference shows a DOCUMENT: event name,
 * meta line, then each table with a numbered list of its occupants — which is
 * what a PDF will look like. A CSV or .xlsx is not a document, it is the brief's
 * six columns, so those preview as a grid. Showing the document preview for a
 * CSV would misrepresent the file you are about to get.
 *
 * WHAT ACTUALLY DOWNLOADS: the CSV is generated and downloaded for real, in the
 * browser, with no backend. PDF and .xlsx cannot be produced client-side, so
 * they explain themselves instead of pretending — see the handover.
 *
 * TODO(backend:SeatingPlanner): read-only over the plan's Table / TableSeat rows.
 * PDF and XLSX need a server-side generator; the CSV here is genuine but only
 * covers what the browser already has, so the server must build all three from
 * the same query or the three formats will disagree. Empty seats are NOT
 * exported (the brief says "seated attendees") — see the handover, a planner may
 * want them as blank rows.
 */
(function () {
  'use strict';

  var ROLE_NAMES = {
    attendee: 'Attendee', sponsor: 'Sponsor', vip: 'VIP',
    speaker: 'Speaker', host: 'Host', guest: 'Guest'
  };

  var FORMATS = {
    pdf: { label: 'PDF', icon: 'file-text', ext: 'pdf' },
    xlsx: { label: 'Excel (.xlsx)', icon: 'file-spreadsheet', ext: 'xlsx' },
    csv: { label: 'CSV', icon: 'file-text', ext: 'csv' }
  };

  var format = 'pdf';

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
  function api() { return window.SeatingPlannerWorkspace || {}; }
  function roleOfDot(dot) {
    var m = (dot.className || '').match(/sp-dot--(attendee|sponsor|vip|speaker|host|guest)/);
    return m ? m[1] : null;
  }

  /* ------------------------------------------------------------- the data */

  function activeChip() { return one('[data-sp-plan].sp-plan--active'); }

  function planTables() {
    var chip = activeChip();
    var key = chip ? chip.getAttribute('data-sp-plan') : null;
    if (!key) return [];
    return all('[data-sp-table][data-sp-belongs="' + key + '"]');
  }

  /* One row per SEATED seat: Table, Type, Seat, Name, Company, Role.
     Occupant names come off the card, and are paired with the FILLED dots in
     seat order — the same rule the pool uses, so the two can never disagree. */
  function rows() {
    var out = [];
    planTables().forEach(function (card) {
      var tableName = card.getAttribute('data-sp-name') || '';
      var type = card.getAttribute('data-sp-tier') || 'Standard';
      var occupants = (card.getAttribute('data-sp-occupants') || '').split('|').filter(Boolean);
      var filled = 0;

      all('.sp-dot', card).forEach(function (dot, i) {
        var role = roleOfDot(dot);
        if (!role) return;
        var parts = (occupants[filled] || '').split('~');
        filled++;
        out.push({
          table: tableName,
          type: type,
          seat: i + 1,
          name: parts[0] || '',
          company: parts[1] || '',
          role: ROLE_NAMES[role] || role
        });
      });
    });
    return out;
  }

  function summary() {
    var chip = activeChip();
    var cards = planTables();
    var capacity = 0, seated = 0;
    cards.forEach(function (card) {
      var dots = all('.sp-dot', card);
      capacity += dots.length;
      seated += dots.filter(roleOfDot).length;
    });
    return {
      event: (one('.sp-eventbar__name') || {}).textContent || '',
      plan: chip ? (one('.sp-plan__name', chip) || {}).textContent : '',
      room: chip ? (chip.getAttribute('data-sp-plan-room') || '') : '',
      tables: cards.length,
      seated: seated,
      capacity: capacity
    };
  }

  function today() {
    var d = new Date();
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear();
  }

  /* ----------------------------------------------------------- the preview */

  /* PDF: the document, as the reference draws it */
  function docHtml(data, s) {
    var byTable = {};
    var order = [];
    data.forEach(function (r) {
      if (!byTable[r.table]) { byTable[r.table] = []; order.push(r.table); }
      byTable[r.table].push(r);
    });

    var body = planTables().map(function (card) {
      var name = card.getAttribute('data-sp-name') || '';
      var tier = card.getAttribute('data-sp-tier') || '';
      var dots = all('.sp-dot', card);
      var list = byTable[name] || [];
      var head = '<p class="sp-export__table">' + esc(name) +
        ' <span>' + (tier ? esc(tier) + ' · ' : '') +
        list.length + '/' + dots.length + '</span></p>';
      if (!list.length) {
        return head + '<p class="sp-export__empty">No one seated at this table yet.</p>';
      }
      return head + '<ol class="sp-export__list">' + list.map(function (r) {
        return '<li>' + esc(r.name) + (r.company ? ' — ' + esc(r.company) : '') +
          ' <span class="sp-export__role">[' + esc(r.role) + ']</span></li>';
      }).join('') + '</ol>';
    }).join('');

    return '<div class="sp-export__doc-scroll"><div class="sp-export__doc">' +
      '<p class="sp-export__title">' + esc(s.event) + '</p>' +
      '<p class="sp-export__meta">Seating plan: ' + esc(s.plan) +
      (s.room ? ' · ' + esc(s.room) : '') + ' · ' + s.seated + '/' + s.capacity +
      ' seated · generated ' + today() + '</p>' +
      body + '</div></div>';
  }

  /* CSV / XLSX: the brief's six columns, because that is what the file holds */
  function gridHtml(data) {
    return '<div class="sp-export__grid"><table class="table table--bordered">' +
      '<thead><tr><th>Table</th><th>Type</th><th>Seat</th><th>Name</th>' +
      '<th>Company</th><th>Role</th></tr></thead><tbody>' +
      data.map(function (r) {
        return '<tr><td>' + esc(r.table) + '</td><td>' + esc(r.type) + '</td><td>' + r.seat +
          '</td><td>' + esc(r.name) + '</td><td>' + esc(r.company) + '</td><td>' +
          esc(r.role) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  function render() {
    var body = one('[data-ex-body]');
    if (!body) return;

    var data = rows();
    var s = summary();
    var f = FORMATS[format] || FORMATS.pdf;

    one('[data-ex-title]').textContent = 'Preview — ' + f.label + ' export';

    body.innerHTML =
      '<p class="sp-export__format">' +
      '<i data-lucide="' + f.icon + '" aria-hidden="true"></i>' +
      '<span><strong>' + s.tables + (s.tables === 1 ? ' table' : ' tables') + ' · ' +
      data.length + (data.length === 1 ? ' seated person' : ' seated people') +
      '</strong> — every row below is in the file. Empty seats are not exported.</span></p>' +
      (format === 'pdf' ? docHtml(data, s) : gridHtml(data));

    var dl = one('[data-ex-download]');
    if (dl) dl.textContent = 'Download ' + (format === 'xlsx' ? '.xlsx' : f.label);

    refreshIcons();
  }

  /* -------------------------------------------------------------- download */

  function csv(data) {
    var head = ['Table', 'Type', 'Seat', 'Name', 'Company', 'Role'];
    function cell(v) {
      v = String(v == null ? '' : v);
      return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
    }
    return [head.join(',')].concat(data.map(function (r) {
      return [r.table, r.type, r.seat, r.name, r.company, r.role].map(cell).join(',');
    })).join('\r\n');
  }

  function filename(ext) {
    var s = summary();
    return (s.plan || 'seating-plan').toLowerCase().replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-seating.' + ext;
  }

  function download() {
    var data = rows();

    if (format !== 'csv') {
      /* Honest about the limit rather than downloading something fake */
      if (api().toast) {
        api().toast('<strong>' + FORMATS[format].label + '</strong> is generated server-side — ' +
          'see the handover. The CSV downloads for real from here.');
      }
      return;
    }

    var blob = new Blob([csv(data)], { type: 'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename('csv');
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 0);

    if (api().toast) {
      api().toast('<strong>' + data.length + ' rows</strong> exported to ' +
        esc(filename('csv')) + '.');
    }
  }

  /* ------------------------------------------------------------ open / close */

  function openPreview(ctx) {
    var overlay = one('[data-ex-overlay]');
    if (!overlay) return;

    var trigger = ctx && ctx.trigger;
    var wanted = trigger ? trigger.getAttribute('data-sp-format') : null;
    format = FORMATS[wanted] ? wanted : 'pdf';

    /* the split menu stays open otherwise — the click was inside it */
    var menu = one('[data-sp-split-menu]');
    if (menu) menu.setAttribute('hidden', '');

    render();
    overlay.classList.add('modal-overlay--open');
  }

  function closeModal() {
    var overlay = one('[data-ex-overlay]');
    if (overlay) overlay.classList.remove('modal-overlay--open');
  }

  /* ---------------------------------------------------------------- wiring */

  function init() {
    if (!one('[data-ex-modal]')) return;

    if (api().on) api().on('export', openPreview);

    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-ex-close]')) { e.preventDefault(); closeModal(); return; }
      if (e.target.closest('[data-ex-download]')) { e.preventDefault(); download(); return; }
      var overlay = one('[data-ex-overlay]');
      if (overlay && e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
