/* Listing Screen — renderer
 * ---------------------------------------------------------------
 * Builds the datatable from a config in listing-data.js. Nothing about
 * the Orders screen is hard-coded here: the same renderer drives every
 * listing screen, which is the whole point given ~400 of them share
 * this template.
 *
 * WHY A RENDERER AND NOT STATIC MARKUP
 * The brief is that real data lands later. Hand-authored <tr>s would
 * have to be deleted to make that happen; a renderer means the swap is
 * `config.rows = await fetch(...)` and nothing else moves. It also
 * keeps the mobile detail rows honest — they are generated from the
 * same column list that produced the header, so they cannot drift.
 *
 * NO matchMedia ANYWHERE. Which columns collapse is decided by CSS
 * container queries against the table's own width (CLAUDE.md §4a); JS
 * renders every column every time and lets CSS choose. A docked
 * SidebarMenu narrows the column with no window resize at all, so a
 * media query would simply be wrong here.
 */
(function () {
  'use strict';

  var ICON_SORT = 'chevrons-up-down';

  /* Escapes text before it reaches innerHTML. Row values are mock today
   * but will be API data tomorrow, and this is the seam they arrive
   * through — so it is escaped from the start rather than retrofitted. */
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Class list for a cell/header in a given column. `--hug` shrink-wraps
   * the narrow columns; `--secondary` is what the mobile container query
   * hides; `--mobile` is hidden at desktop. */
  /* Structural columns get a type class so CSS can target them by
   * role (the kebab column sits flush on mobile, for instance). Data
   * columns don't — their styling is per-screen and belongs to the
   * cellClass in the config. */
  var STRUCTURAL = { select: 1, edit: 1, kebab: 1 };

  function colClass(col, extra) {
    var out = [];
    if (col.hug) out.push('datatables__col--hug');
    if (!col.primary) out.push('datatables__col--secondary');
    if (col.mobileOnly) out.push('datatables__col--mobile');
    if (STRUCTURAL[col.type]) out.push('datatables__col--' + col.type);
    if (extra) out.push(extra);
    return out.length ? ' class="' + out.join(' ') + '"' : '';
  }

  var CELL = {
    text: function (row, col) {
      return esc(row[col.key]);
    },

    /* Avatar + name (+ optional role). Two avatar forms in the design:
     * a photo, or brand-tinted initials when there is no photo. */
    user: function (row) {
      var u = row.customer || {};
      var avatar = u.initials
        ? '<div class="avatar avatar--size-2 avatar--initials">' + esc(u.initials) + '</div>'
        : '<div class="avatar avatar--size-2"><img class="portrait" src="' + esc(u.avatar) + '" alt=""></div>';
      return '<div class="datatables__user-cell">' + avatar +
        '<div class="datatables__user-text">' +
          '<span class="datatables__user-name">' + esc(u.name) + '</span>' +
          (u.role ? '<span class="datatables__user-role">' + esc(u.role) + '</span>' : '') +
        '</div></div>';
    },

    /* Account chip — tertiary button plus the contextual border. */
    chip: function (row, col) {
      return '<button type="button" class="btn btn--tertiary btn--sm datatables__account-chip">' +
        esc(row[col.key]) + '</button>';
    },

    select: function (row) {
      return '<label class="checkbox">' +
        '<input type="checkbox" class="checkbox__input" aria-label="Select order ' + esc(row.orderNo) + '">' +
        '<span class="checkbox__indicator"><i data-lucide="check" aria-hidden="true"></i></span>' +
        '</label>';
    },

    /* Figma's row-edit button is node 2926:3566 — the Secondary
     * `Icon Only=True, Size=xs` variant, i.e. the stock 24x24
     * `btn--icon btn--xs` (24px box, 12px icon, radius-sm). Using the
     * 40px `btn--icon` default instead cost 28px of table width and
     * pushed the kebab column off-screen at 390px. */
    edit: function (row) {
      return '<button type="button" class="btn btn--secondary btn--icon btn--xs datatables__row-edit" ' +
        'aria-label="Edit order ' + esc(row.orderNo) + '"><i data-lucide="pencil" aria-hidden="true"></i></button>';
    },

    /* Kebab doubles as the mobile row-detail toggle. The reveal is pure
     * CSS (:has(:checked)) in Datatables.css — no JS listener. */
    kebab: function (row, col, index) {
      return '<label class="datatables__kebab">' +
        '<input type="checkbox" class="datatables__kebab__input" ' +
        'aria-label="Show details for order ' + esc(row.orderNo) + '" data-row="' + index + '">' +
        '<i data-lucide="ellipsis-vertical" aria-hidden="true"></i></label>';
    }
  };

  function renderHead(columns) {
    return '<tr>' + columns.map(function (col) {
      /* Label-less columns (checkbox, edit, kebab) name themselves with
       * aria-label rather than hidden text: the project's
       * .visually-hidden utility lives in css/style.css, which
       * components are not allowed to import (CLAUDE.md §8). */
      if (!col.label) {
        var name = col.key === 'select' ? 'Select' : 'Actions';
        return '<th scope="col" aria-label="' + name + '"' + colClass(col) + '></th>';
      }
      /* Figma shortens some headers on mobile ("Order No" -> "Order").
       * Both strings are rendered and the container query picks one:
       * CSS cannot swap text content, and JS must not read a container
       * query, so this is the only way to keep the mobile label without
       * reintroducing matchMedia (CLAUDE.md §4a). */
      var label = col.shortLabel
        ? '<span class="datatables__label--full">' + esc(col.label) + '</span>' +
          '<span class="datatables__label--short">' + esc(col.shortLabel) + '</span>'
        : esc(col.label);

      var inner = col.sortable
        ? '<button type="button" class="datatables__sort">' + label +
          '<i data-lucide="' + ICON_SORT + '" aria-hidden="true"></i></button>'
        : label;
      return '<th scope="col"' + colClass(col) + '>' + inner + '</th>';
    }).join('') + '</tr>';
  }

  function renderRows(columns, rows) {
    return rows.map(function (row, i) {
      var cells = columns.map(function (col) {
        var fn = CELL[col.type] || CELL.text;
        return '<td' + colClass(col, col.cellClass) + '>' + fn(row, col, i) + '</td>';
      }).join('');

      /* Paired detail row carrying the columns the mobile layout drops.
       * Built from the same `columns` array, so it can never list a
       * field the table does not have. */
      var hidden = columns.filter(function (col) {
        return !col.primary && col.label;
      });
      var detail = hidden.map(function (col) {
        var fn = CELL[col.type] || CELL.text;
        return '<dt>' + esc(col.label) + '</dt><dd>' + fn(row, col, i) + '</dd>';
      }).join('');

      return '<tr class="datatables__row">' + cells + '</tr>' +
        '<tr class="datatables__row-detail"><td class="datatables__row-detail__cell" colspan="' +
        columns.length + '"><dl class="datatables__detail-list">' + detail + '</dl></td></tr>';
    }).join('');
  }

  function renderPagination(page) {
    var out = '<button type="button" class="datatables__page-btn" aria-label="Previous page"' +
      (page.current === 1 ? ' disabled' : '') +
      '><i data-lucide="chevron-left" aria-hidden="true"></i></button>';
    for (var p = 1; p <= page.pages; p++) {
      var active = p === page.current;
      out += '<button type="button" class="datatables__page-btn' +
        (active ? ' datatables__page-btn--active' : '') + '"' +
        /* aria-current carries the state for assistive tech AND for
         * sighted users in CC light, where the active paint resolves to
         * the same white as the container (see Datatables.css). */
        (active ? ' aria-current="page"' : '') + '>' + p + '</button>';
    }
    out += '<button type="button" class="datatables__page-btn" aria-label="Next page"' +
      (page.current === page.pages ? ' disabled' : '') +
      '><i data-lucide="chevron-right" aria-hidden="true"></i></button>';
    return out;
  }

  function render(root, config) {
    var page = config.page;

    root.querySelector('[data-listing-head]').innerHTML = renderHead(config.columns);
    root.querySelector('[data-listing-body]').innerHTML = renderRows(config.columns, config.rows);
    root.querySelector('[data-listing-total]').textContent = String(page.total);
    root.querySelector('[data-listing-range]').textContent = page.from + '–' + page.to;
    root.querySelector('[data-listing-footer-total]').textContent = String(page.total);
    root.querySelector('[data-listing-pagination]').innerHTML = renderPagination(page);

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function init() {
    var root = document.querySelector('[data-listing]');
    if (!root) return;

    var config = (typeof LISTING_SCREENS !== 'undefined')
      ? LISTING_SCREENS[root.getAttribute('data-listing')]
      : null;
    if (!config) return;

    render(root, config);

    /* Exposed so the next pass (filter dropdowns, sort, paging) can
     * re-render from a mutated config without reloading. */
    window.listingScreen = { config: config, render: function () { render(root, config); } };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
