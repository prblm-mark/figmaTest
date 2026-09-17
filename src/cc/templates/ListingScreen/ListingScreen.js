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

  /* ── Filter chips and their pickers ──────────────────────────────
   * Each chip opens a FilterDropdowns Type, named by `type` in the config.
   * The markup below is that pattern's, not new: FilterDropdowns.js auto-inits
   * every [data-filter-dropdowns] and owns the select / predictive / search
   * behaviour, so the panels only have to be present and correctly shaped.
   *
   * FilterBar positions and toggles them — it looks for a `.filter-bar__panel`
   * inside a `.filter-bar__chip` wrapper and knows nothing about which Type is
   * inside, which is what keeps one bar serving every listing screen.
   */
  function optionRows(options, selectedFirst) {
    return (options || []).map(function (o, i) {
      var sel = (selectedFirst && i === 0) ? ' filter-dropdown-item--selected' : '';
      return '<button type="button" class="filter-dropdown-item' + sel + '" data-filter-dropdown-item>' +
        '<span class="filter-dropdown-item__text">' +
          '<span class="filter-dropdown-item__name">' + esc(o.name) + '</span>' +
          (o.sub ? '<span class="filter-dropdown-item__sub">' + esc(o.sub) + '</span>' : '') +
        '</span>' +
        '<span class="filter-dropdown-item__check"><i data-lucide="circle-check" aria-hidden="true"></i></span>' +
      '</button>';
    }).join('');
  }

  var FILTER_PANELS = {
    /* Type=Select Options w/subtext (3039:5628) — a field that opens a
       single-select option list; no Apply, per the pattern. */
    'select-options': function (f) {
      return '<div class="filter-dropdowns filter-dropdowns--select" data-filter-dropdowns data-select>' +
        '<div class="input"><label class="input__label">' + esc(f.label) + '</label>' +
          '<div class="input__wrap filter-dropdowns__trigger" role="button" tabindex="0" aria-haspopup="listbox" aria-expanded="false" aria-label="' + esc(f.name) + '" data-select-trigger>' +
            '<span class="filter-dropdowns__value filter-dropdowns__value--placeholder" data-select-value>' + esc(f.placeholder) + '</span>' +
            '<i data-lucide="chevron-down" class="input__icon filter-dropdowns__chevron" aria-hidden="true"></i>' +
          '</div></div>' +
        '<div class="filter-dropdown-item-group filter-dropdowns__menu" role="listbox" aria-multiselectable="false" aria-label="' + esc(f.name) + ' options" hidden data-select-menu>' +
          optionRows(f.options, false) +
        '</div></div>';
    },

    /* Type=Predictive Text Options (3039:5625). Figma's plain Predictive Text
       is consolidated into this one — predictive always reveals options. */
    predictive: function (f) {
      return '<div class="filter-dropdowns filter-dropdowns--select" data-filter-dropdowns data-predictive>' +
        '<div class="input"><label class="input__label">' + esc(f.label) + '</label>' +
          '<div class="input__wrap">' +
            '<input class="input__control" type="text" placeholder="' + esc(f.placeholder) + '" aria-label="' + esc(f.name) + '" data-predictive-input>' +
          '</div></div>' +
        '<div class="filter-dropdown-item-group filter-dropdowns__menu" role="listbox" aria-label="' + esc(f.name) + ' options" hidden data-select-menu>' +
          optionRows(f.options, false) +
        '</div></div>';
    },

    /* Type=Multi Select (3039:5629) — checkbox list + Apply. `--list` is the
       pattern's own modifier for the wider gap and capped scrolling body. */
    'multi-select': function (f) {
      var rows = (f.options || []).map(function (o) {
        return '<label class="checkbox"><input type="checkbox" class="checkbox__input"' + (o.checked ? ' checked' : '') + '>' +
          '<span class="checkbox__indicator"><i data-lucide="check" aria-hidden="true"></i></span>' +
          '<span class="checkbox__label"><span class="checkbox__label-text">' + esc(o.name) + '</span></span></label>';
      }).join('');
      return '<div class="filter-dropdowns filter-dropdowns--list" data-filter-dropdowns>' +
        '<div class="input"><label class="input__label">' + esc(f.label) + '</label></div>' +
        '<div class="filter-dropdowns__checklist">' + rows + '</div>' +
        '<button type="button" class="btn btn--primary filter-dropdowns__apply" data-filter-dropdowns-apply>Apply</button>' +
      '</div>';
    },

    /* Type=Text (3039:5633) — a single field + Apply. */
    text: function (f) {
      return '<div class="filter-dropdowns" data-filter-dropdowns>' +
        '<div class="input"><label class="input__label">' + esc(f.label) + '</label>' +
          '<div class="input__wrap">' +
            '<input class="input__control" type="text" placeholder="' + esc(f.placeholder) + '" aria-label="' + esc(f.name) + '">' +
          '</div></div>' +
        '<button type="button" class="btn btn--primary filter-dropdowns__apply" data-filter-dropdowns-apply>Apply</button>' +
      '</div>';
    },

    /* Type=More Filters (3039:5637) — the filters NOT on the bar, as empty
       chips. No Apply: picking one adds it to the bar. */
    'more-filters': function (f) {
      var chips = (f.options || []).map(function (o) {
        return '<div class="filter-item filter-item--empty filter-item--rounded" data-filter-name="' + esc(o.name) + '">' +
          '<button type="button" class="filter-item__trigger" aria-expanded="false">' +
            '<i data-lucide="plus" class="filter-item__add" aria-hidden="true"></i>' +
            '<span class="filter-item__name">' + esc(o.name) + '</span>' +
          '</button></div>';
      }).join('');
      return '<div class="filter-dropdowns"><div class="filter-dropdowns__facets">' + chips + '</div></div>';
    }
  };

  /* One chip: the FilterItem markup plus its picker, wrapped so the picker can
     anchor to it. The full slot set is always rendered — FilterItem's contract
     is that CSS hides what the current state does not use. */
  function chip(f, extraClass) {
    var build = FILTER_PANELS[f.type];
    return '<div class="filter-bar__chip">' +
      '<div class="filter-item filter-item--rounded' + (extraClass || '') + '" data-filter-name="' + esc(f.name) + '">' +
        '<button type="button" class="filter-item__clear" aria-label="Clear ' + esc(f.name) + ' filter"><i data-lucide="x" aria-hidden="true"></i></button>' +
        '<button type="button" class="filter-item__trigger" aria-haspopup="listbox" aria-expanded="false">' +
          '<i data-lucide="plus" class="filter-item__add" aria-hidden="true"></i>' +
          '<span class="filter-item__name">' + esc(f.name) + '</span>' +
          '<span class="filter-item__sep" aria-hidden="true">·</span>' +
          '<span class="filter-item__values"></span>' +
          '<i data-lucide="chevron-down" class="filter-item__chevron" aria-hidden="true"></i>' +
        '</button>' +
      '</div>' +
      (build ? '<div class="filter-bar__panel" hidden>' + build(f) + '</div>' : '') +
    '</div>';
  }

  function renderFilters(config) {
    var html = (config.defaultFilters || []).map(function (f) { return chip(f); }).join('');
    html += chip(
      { name: 'Add Filters', type: 'more-filters', options: config.moreFilters || [] },
      ' filter-item--empty filter-bar__add'
    );
    /* The Save view CTA is rendered here rather than left in the markup so the
       chips stay DIRECT children of `.filter-bar__chips` — that row is a flex
       container, and a wrapper element around the chips would break its wrap. */
    html += '<button type="button" class="btn btn--primary btn--sm filter-bar__save"' +
            ' data-filter-action="save-view">Save view</button>';
    return html;
  }

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

    var chipsHost = document.querySelector('[data-listing-filters]');
    if (chipsHost) chipsHost.innerHTML = renderFilters(config);

    root.querySelector('[data-listing-head]').innerHTML = renderHead(config.columns);
    root.querySelector('[data-listing-body]').innerHTML = renderRows(config.columns, config.rows);
    root.querySelector('[data-listing-total]').textContent = String(page.total);
    root.querySelector('[data-listing-range]').textContent = page.from + '–' + page.to;
    root.querySelector('[data-listing-footer-total]').textContent = String(page.total);
    root.querySelector('[data-listing-pagination]').innerHTML = renderPagination(page);

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    /* Tell the page the chips and pickers now exist. They are rendered here,
       which is after FilterItem.js and FilterDropdowns.js have already
       auto-initialised the static markup — so without this the chips would be
       inert. The listener is scoped to what was just rendered rather than the
       document, because FilterItem.init has no idempotency guard. */
    document.dispatchEvent(new CustomEvent('listing:rendered', {
      detail: { root: chipsHost || root }
    }));
  }

  function init() {
    var root = document.querySelector('[data-listing]');
    if (!root) return;

    var config = (typeof LISTING_SCREENS !== 'undefined')
      ? LISTING_SCREENS[root.getAttribute('data-listing')]
      : null;
    if (!config) return;

    /* Work on a shallow copy of the filter lists: adding a filter moves it
       from one to the other, and LISTING_SCREENS is the screen DEFINITION,
       which should still describe a fresh screen after the user has played
       with this one. */
    config = Object.assign({}, config, {
      defaultFilters: (config.defaultFilters || []).slice(),
      moreFilters: (config.moreFilters || []).slice()
    });

    render(root, config);

    /* Add Filters: FilterBar reports which facet was picked; the screen owns
       what that filter IS, so it builds the chip here.

       This SPLICES rather than re-rendering the bar. A full re-render would be
       one line, but it would also rebuild every other chip — discarding the
       selections already made on them, which is the opposite of what adding a
       sixth filter should do. */
    document.addEventListener('filter-bar:add-filter', function (e) {
      var name = e.detail && e.detail.name;
      var i = config.moreFilters.findIndex(function (f) { return f.name === name; });
      if (i === -1) return;

      var filter = config.moreFilters.splice(i, 1)[0];
      config.defaultFilters.push(filter);

      var host = document.querySelector('[data-listing-filters]');
      var addChip = host && host.querySelector('.filter-bar__add');
      var anchor = addChip && addChip.closest('.filter-bar__chip');
      if (!anchor) return;

      var holder = document.createElement('div');
      holder.innerHTML = chip(filter);
      var added = holder.firstChild;
      anchor.parentNode.insertBefore(added, anchor);

      /* Drop the facet from the More Filters panel — it is on the bar now. */
      var facet = anchor.querySelector('.filter-item[data-filter-name="' + name.replace(/"/g, '\\"') + '"]');
      if (facet) facet.remove();

      /* Same contract the first render uses, scoped to just the new chip. */
      document.dispatchEvent(new CustomEvent('listing:rendered', { detail: { root: added } }));
    });

    /* Exposed so the next pass (sort, paging) can re-render from a mutated
     * config without reloading. */
    window.listingScreen = { config: config, render: function () { render(root, config); } };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
