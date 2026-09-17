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
  function optionRows(options, selected) {
    var picked = selected || [];
    return (options || []).map(function (o) {
      var sel = picked.indexOf(o.name) !== -1 ? ' filter-dropdown-item--selected' : '';
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
       single-select option list, then Apply. Picking an option closes the
       MENU and fills the field; Apply commits it to the chip. */
    'select-options': function (f, values) {
      var picked = values || [];
      return '<div class="filter-dropdowns filter-dropdowns--select" data-filter-dropdowns data-select>' +
        '<div class="input"><label class="input__label">' + esc(f.label) + '</label>' +
          '<div class="input__wrap filter-dropdowns__trigger" role="button" tabindex="0" aria-haspopup="listbox" aria-expanded="false" aria-label="' + esc(f.name) + '" data-select-trigger>' +
            '<span class="filter-dropdowns__value' + (picked.length ? '' : ' filter-dropdowns__value--placeholder') + '" data-select-value data-placeholder="' + esc(f.placeholder) + '">' + esc(picked.length ? picked.join(', ') : f.placeholder) + '</span>' +
            '<i data-lucide="chevron-down" class="input__icon filter-dropdowns__chevron" aria-hidden="true"></i>' +
          '</div>' +
          '<div class="filter-dropdown-item-group filter-dropdowns__menu" role="listbox" aria-multiselectable="false" aria-label="' + esc(f.name) + ' options" hidden data-select-menu>' +
            optionRows(f.options, values) +
          '</div></div>' +
        '<button type="button" class="btn btn--primary filter-dropdowns__apply" data-filter-dropdowns-apply>Apply</button>' +
      '</div>';
    },

    /* Type=Predictive Text Options (3039:5625), then Apply. Figma's plain
       Predictive Text is consolidated into this one — predictive always
       reveals options. */
    predictive: function (f, values) {
      return '<div class="filter-dropdowns filter-dropdowns--select" data-filter-dropdowns data-predictive>' +
        '<div class="input"><label class="input__label">' + esc(f.label) + '</label>' +
          '<div class="input__wrap">' +
            '<input class="input__control" type="text" value="' + esc((values || [])[0] || '') + '" placeholder="' + esc(f.placeholder) + '" aria-label="' + esc(f.name) + '" data-predictive-input>' +
          '</div>' +
          '<div class="filter-dropdown-item-group filter-dropdowns__menu" role="listbox" aria-label="' + esc(f.name) + ' options" hidden data-select-menu>' +
            optionRows(f.options, values) +
          '</div></div>' +
        '<button type="button" class="btn btn--primary filter-dropdowns__apply" data-filter-dropdowns-apply>Apply</button>' +
      '</div>';
    },

    /* Type=Multi Select (3039:5629) — checkbox list + Apply. `--list` is the
       pattern's own modifier for the wider gap and capped scrolling body. */
    'multi-select': function (f, values) {
      var rows = (f.options || []).map(function (o) {
        var on = (values || []).indexOf(o.name) !== -1;
        return '<label class="checkbox"><input type="checkbox" class="checkbox__input"' + (on ? ' checked' : '') + '>' +
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
    text: function (f, values) {
      return '<div class="filter-dropdowns" data-filter-dropdowns>' +
        '<div class="input"><label class="input__label">' + esc(f.label) + '</label>' +
          '<div class="input__wrap">' +
            '<input class="input__control" type="text" value="' + esc((values || [])[0] || '') + '" placeholder="' + esc(f.placeholder) + '" aria-label="' + esc(f.name) + '">' +
          '</div></div>' +
        '<button type="button" class="btn btn--primary filter-dropdowns__apply" data-filter-dropdowns-apply>Apply</button>' +
      '</div>';
    },

    /* Type=More Filters (3039:5637) — the filters NOT on the bar, as empty
       chips. No Apply: picking one adds it to the bar. */
    'more-filters': function (f, values) {
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
  function chip(f, extraClass, wrapClass, values) {
    var build = FILTER_PANELS[f.type];
    return '<div class="filter-bar__chip' + (wrapClass || '') + '">' +
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
      (build ? '<div class="filter-bar__panel" hidden>' + build(f, values) + '</div>' : '') +
    '</div>';
  }

  function renderFilters(config) {
    var html = (config.defaultFilters || []).map(function (f) {
      return chip(f, '', '', config.filterValues[f.name] || []);
    }).join('');
    /* `--add` marks the WRAPPER so an empty view can hide the other chips:
       a chip with a picker is wrapped, so FilterBar's bare-chip selector
       cannot reach it. */
    html += chip(
      { name: 'Add Filters', type: 'more-filters', options: config.moreFilters || [] },
      ' filter-item--empty filter-bar__add',
      ' filter-bar__chip--add'
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

  /* ── Filtering ────────────────────────────────────────────────
     Front-end only, and only because the rows are mock: the real screen
     filters server-side. See the TODO(backend:Listing) in listing-data.js.

     Config-driven — a filter's `field` names the row property it tests, so
     nothing here knows an Orders column from a Contacts one. */

  function valueAt(row, path) {
    return String(path.split('.').reduce(function (o, k) {
      return (o === null || o === undefined) ? '' : o[k];
    }, row) || '');
  }

  /* A Text filter is a SEARCH — one typed fragment, matched loosely. Every
     other type is a PICK-LIST — the values came from the row data itself, so
     they must match it exactly, and several picks mean "any of these". */
  function matches(row, filter, values) {
    if (!values.length) return true;
    var actual = valueAt(row, filter.field);
    if (filter.type === 'text') {
      return actual.toLowerCase().indexOf(values[0].toLowerCase()) !== -1;
    }
    return values.some(function (v) { return actual === v; });
  }

  function applyFilters(config) {
    var byName = {};
    config.defaultFilters.forEach(function (f) { byName[f.name] = f; });

    /* A filter with no `field` cannot narrow anything, so it does not count as
       active: it must neither empty the table nor make the footer claim a
       result count it did not produce. The More Filters facets are all in that
       position until a designer assigns them types and fields. */
    var active = Object.keys(config.filterValues).filter(function (name) {
      return (config.filterValues[name] || []).length &&
             byName[name] && byName[name].field;
    });
    if (!active.length) return { rows: config.rows, filtered: false };

    return {
      filtered: true,
      rows: config.rows.filter(function (row) {
        return active.every(function (name) {
          return matches(row, byName[name], config.filterValues[name]);
        });
      })
    };
  }

  /* Re-render only what filtering changes: the body, the counts and the
     pagination. The chips are left alone — rebuilding them would discard the
     very selections that caused this. */
  function renderResults(root, config) {
    var result = applyFilters(config);
    var rows = result.rows;

    root.querySelector('[data-listing-body]').innerHTML = rows.length
      ? renderRows(config.columns, rows)
      : renderEmpty(config.columns);

    /* Unfiltered, the mock `page` block stands in for a backend that reports
       296 orders across 3 pages. Once a filter narrows the 10 mock rows those
       numbers would be a lie, so the counts switch to describing what is
       actually on screen. */
    var page = result.filtered
      ? { from: rows.length ? 1 : 0, to: rows.length, total: rows.length, current: 1, pages: 1 }
      : config.page;

    root.querySelector('[data-listing-total]').textContent = String(page.total);
    root.querySelector('[data-listing-range]').textContent = page.from + '–' + page.to;
    root.querySelector('[data-listing-footer-total]').textContent = String(page.total);
    root.querySelector('[data-listing-pagination]').innerHTML = renderPagination(page);

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  /* TODO(design:Listing): Datatables has no empty state in Figma. This mirrors
     EventPicker's `no results` treatment (3108:6659) token for token, since
     that is the established one on the CC surface, but it wants a Figma
     Datatables variant of its own. */
  function renderEmpty(columns) {
    /* The flex column lives in a DIV inside the cell, not on the cell itself:
       `display: flex` on a <td> takes it out of table layout, and a cell that
       is no longer a cell ignores its own colspan — it collapsed to the first
       column's width. */
    return '<tr class="cc-listing__empty-row"><td class="cc-listing__empty-cell" colspan="' + columns.length + '">' +
      '<div class="cc-listing__empty">' +
        '<span class="cc-listing__empty-icon"><i data-lucide="search-x" aria-hidden="true"></i></span>' +
        '<p class="cc-listing__empty-title">No matching orders</p>' +
        '<p class="cc-listing__empty-desc">No orders match the filters you have applied. Try removing one, or clearing them all.</p>' +
      '</div>' +
    '</td></tr>';
  }

  /* Rebuild the WHOLE chip row. Used on first render and when a saved view
     replaces the current filters — never for an everyday change, where
     rebuilding a chip would discard the selection that caused it. */
  function renderChips(config) {
    var chipsHost = document.querySelector('[data-listing-filters]');
    if (!chipsHost) return;
    chipsHost.innerHTML = renderFilters(config);

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    /* Tell the page the chips and pickers now exist. They are rendered here,
       which is after FilterItem.js and FilterDropdowns.js have already
       auto-initialised the static markup — so without this the chips would be
       inert. The listener is scoped to what was just rendered rather than the
       document, because FilterItem.init has no idempotency guard. */
    document.dispatchEvent(new CustomEvent('listing:rendered', { detail: { root: chipsHost } }));

    /* Only now does a chip have setFilterValues, so its label goes on last. */
    chipsHost.querySelectorAll('.filter-bar__chip > .filter-item').forEach(function (el) {
      var values = config.filterValues[el.getAttribute('data-filter-name')];
      if (values && values.length && typeof el.setFilterValues === 'function') {
        el.setFilterValues(values);
      }
    });
  }

  function render(root, config) {
    renderChips(config);
    root.querySelector('[data-listing-head]').innerHTML = renderHead(config.columns);
    renderResults(root, config);
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
      moreFilters: (config.moreFilters || []).slice(),
      /* name -> the values that chip currently holds. The bar reports these;
         they cannot be read back off a chip, whose label rolls 4+ values up
         into "<first>, and 3 more". */
      filterValues: {}
    });

    var bar = root.querySelector('.filter-bar');

    render(root, config);

    /* The bar establishes its baseline before these chips exist, so it would
       read the first render as a change and offer to save the view the screen
       opened on. Hand it the real starting point. */
    if (bar && typeof bar.resetSaveView === 'function') bar.resetSaveView(config.filterValues);

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

    /* ── Saved views ─────────────────────────────────────────
       A view IS a filter set: which filters are on the bar, in what order,
       holding what values. The bar owns the list and its rows; the screen owns
       what a row MEANS, so the snapshot is kept here, keyed by the row element.

       TODO(backend:Listing): in memory, like the rest of the saved-views
       mocking — a reload restores the shipped set.
         → POST /control/orders/views  { name, filters:[{name,values}] }
         → GET  /control/orders/views */
    var views = new WeakMap();

    function snapshot() {
      return {
        defaultFilters: config.defaultFilters.slice(),
        moreFilters: config.moreFilters.slice(),
        filterValues: JSON.parse(JSON.stringify(config.filterValues))
      };
    }

    /* The view the screen opened on — what the pre-existing rows mean, and
       what an unsaved view falls back to. */
    var baseline = snapshot();

    function restore(snap) {
      config.defaultFilters = snap.defaultFilters.slice();
      config.moreFilters = snap.moreFilters.slice();
      config.filterValues = JSON.parse(JSON.stringify(snap.filterValues));
      renderChips(config);
      renderResults(root, config);
      /* The bar now matches the view it names, so the Save view CTA is owed
         nothing. It is handed the values rather than left to remember them —
         these chips are brand new. */
      if (bar && typeof bar.resetSaveView === 'function') bar.resetSaveView(config.filterValues);
    }

    document.addEventListener('filter-bar:save-view', function (e) {
      if (e.detail && e.detail.view) views.set(e.detail.view, snapshot());
    });

    document.addEventListener('filter-bar:select-view', function (e) {
      var view = e.detail && e.detail.view;
      /* A row with no snapshot is one of the shipped mock views (or a brand-new
         empty one), which stand for the unfiltered listing. */
      restore(view && views.has(view) ? views.get(view) : baseline);
    });

    /* A chip committed (Apply) or was cleared — narrow the table. */
    document.addEventListener('filter-bar:change', function (e) {
      var d = e.detail || {};
      if (!d.name) return;
      config.filterValues[d.name] = d.values || [];
      renderResults(root, config);
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
