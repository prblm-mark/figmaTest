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
    if (col.snug) out.push('datatables__col--snug');
    if (!col.hug && !col.snug && col.label) out.push('datatables__col--fluid');
    if (col.type === 'spacer') out.push('datatables__col--spacer');
    /* Progressive reveal: tier 1 is always present, higher tiers appear as
       the CONTAINER widens. The class goes on both th and td so one
       container query can hide the whole column. */
    out.push('datatables__col--t' + (col.tier || 1));
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

    /* Order No. is two lines on the live screen —
       CAST(OrderCode AS VARCHAR) + '<br>' + ISNULL(ExternalCode,'') — so the
       external code sits beneath the order code when there is one. */
    order: function (row) {
      return '<span class="datatables__order">' + esc(row.orderNo) + '</span>' +
        (row.externalCode
          ? '<span class="datatables__order-ext">' + esc(row.externalCode) + '</span>'
          : '');
    },

    /* Account chip — tertiary button plus the contextual border. */
    chip: function (row, col) {
      var v = esc(row[col.key]);
      /* The chip truncates when the column is tight, so the full value has to
         stay reachable. */
      return '<button type="button" class="btn btn--tertiary btn--sm datatables__account-chip"' +
        ' title="' + v + '">' + v + '</button>';
    },

    /* Layout only — absorbs the table's leftover width. */
    spacer: function () { return ''; },

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

    /* Type=Date Range (3039:5635) — operator + a DatePicker pair. The live
       screen renders one shared component per date field, each taking
       <Name>RangeFrom / <Name>RangeTo. */
    'date-range': function (f, values) {
      var v = values || [];
      function picker(which, placeholder, value) {
        return '<div class="datepicker" data-datepicker data-mode="single">' +
          '<div class="input"><div class="input__wrap">' +
            '<input class="input__control" type="text" readonly placeholder="' + esc(placeholder) + '"' +
            ' value="' + esc(value || '') + '" data-datepicker-input data-range="' + which + '"' +
            ' aria-label="' + esc(placeholder) + ' date">' +
            '<i data-lucide="calendar" class="input__icon" data-datepicker-toggle aria-hidden="true"></i>' +
          '</div></div></div>';
      }
      return '<div class="filter-dropdowns" data-filter-dropdowns>' +
        '<div class="input"><label class="input__label">' + esc(f.label) + '</label>' +
          '<div class="input__wrap">' +
            '<input class="input__control" type="text" readonly value="Between" aria-label="Date operator">' +
            '<i data-lucide="chevron-down" class="input__icon" aria-hidden="true"></i>' +
          '</div></div>' +
        '<div class="filter-dropdowns__date-row">' +
          picker('from', 'Start', v[0]) +
          '<span class="filter-dropdowns__date-sep">and</span>' +
          picker('to', 'End', v[1]) +
        '</div>' +
        '<button type="button" class="btn btn--primary filter-dropdowns__apply" data-filter-dropdowns-apply>Apply</button>' +
      '</div>';
    },

    /* A numeric between — the live Order No. and Price range pairs
       (OrderFrom/OrderTo, PriceFrom/PriceTo). Same shape as Date Range
       without the calendars. */
    range: function (f, values) {
      var v = values || [];
      function field(which, placeholder, value) {
        return '<div class="input"><div class="input__wrap">' +
          '<input class="input__control" type="text" placeholder="' + esc(placeholder) + '"' +
          ' value="' + esc(value || '') + '" data-range="' + which + '"' +
          ' aria-label="' + esc(f.name) + ' ' + esc(placeholder) + '"></div></div>';
      }
      return '<div class="filter-dropdowns" data-filter-dropdowns>' +
        '<div class="input"><label class="input__label">' + esc(f.label) + '</label></div>' +
        '<div class="filter-dropdowns__date-row">' +
          field('from', f.fromPlaceholder || 'From', v[0]) +
          '<span class="filter-dropdowns__date-sep">and</span>' +
          field('to', f.toPlaceholder || 'To', v[1]) +
        '</div>' +
        '<button type="button" class="btn btn--primary filter-dropdowns__apply" data-filter-dropdowns-apply>Apply</button>' +
      '</div>';
    },

    /* Type=Checkbox (3039:5626) — a titled single checkbox. The live
       screen's YN flags (ExcludeTax, FirstTimeBuyer, ZeroValueOrder …). */
    checkbox: function (f, values) {
      var on = (values || []).length > 0;
      return '<div class="filter-dropdowns" data-filter-dropdowns>' +
        '<div class="filter-dropdowns__checkbox-body">' +
          '<p class="filter-dropdowns__title">' + esc(f.label) + '</p>' +
          '<label class="checkbox"><input type="checkbox" class="checkbox__input"' + (on ? ' checked' : '') + '>' +
            '<span class="checkbox__indicator"><i data-lucide="check" aria-hidden="true"></i></span>' +
            '<span class="checkbox__label"><span class="checkbox__label-text">' + esc(f.checkboxLabel) + '</span></span>' +
          '</label>' +
        '</div>' +
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

  function renderHead(columns, sort) {
    return '<tr>' + columns.map(function (col) {
      /* Label-less columns (checkbox, edit, kebab) name themselves with
       * aria-label rather than hidden text: the project's
       * .visually-hidden utility lives in css/style.css, which
       * components are not allowed to import (CLAUDE.md §8). */
      if (!col.label) {
        /* The spacer is layout, not a column of data — it gets no accessible
           name, so screen readers do not announce an empty column. */
        if (col.type === 'spacer') return '<th' + colClass(col) + ' role="presentation"></th>';
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

      /* `col.sort` is the live screen's `hs` token, and only the seven
         columns it actually sorts by carry one. */
      var active = sort && sort.by === col.sort;
      var icon = active ? (sort.dir === 'asc' ? 'chevron-up' : 'chevron-down') : ICON_SORT;
      var inner = col.sort
        ? '<button type="button" class="datatables__sort' + (active ? ' datatables__sort--active' : '') +
          '" data-sort="' + esc(col.sort) + '">' + label +
          '<i data-lucide="' + icon + '" aria-hidden="true"></i></button>'
        : label;
      /* aria-sort belongs on the header cell, not the button. */
      var ariaSort = active ? ' aria-sort="' + (sort.dir === 'asc' ? 'ascending' : 'descending') + '"' : '';
      return '<th scope="col"' + ariaSort + colClass(col) + '>' + inner + '</th>';
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
        return (col.tier || 1) > 1 && col.label;
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

  /* Which page numbers to show. Listing every page is fine for three and
     unusable for fifty, so the list is windowed: first, last, the current
     page and its neighbours, with gaps elided. Returns 0 for a gap. */
  function pageWindow(current, pages) {
    if (pages <= 7) {
      var all = [];
      for (var i = 1; i <= pages; i++) all.push(i);
      return all;
    }
    var out = [1];
    var from = Math.max(2, current - 1);
    var to = Math.min(pages - 1, current + 1);
    /* Keep the window a constant width at both ends, so the control does
       not change size as you page through. */
    if (current <= 3) to = 4;
    if (current >= pages - 2) from = pages - 3;
    if (from > 2) out.push(0);
    for (var p = from; p <= to; p++) out.push(p);
    if (to < pages - 1) out.push(0);
    out.push(pages);
    return out;
  }

  function renderPagination(page) {
    var out = '<button type="button" class="datatables__page-btn" aria-label="Previous page"' +
      ' data-page="' + (page.current - 1) + '"' +
      (page.current === 1 ? ' disabled' : '') +
      '><i data-lucide="chevron-left" aria-hidden="true"></i></button>';
    pageWindow(page.current, page.pages).forEach(function (p) {
      if (!p) {
        out += '<span class="datatables__page-gap" aria-hidden="true">…</span>';
        return;
      }
      var active = p === page.current;
      out += '<button type="button" class="datatables__page-btn' +
        (active ? ' datatables__page-btn--active' : '') + '" data-page="' + p + '"' +
        /* aria-current carries the state for assistive tech AND for
         * sighted users in CC light, where the active paint resolves to
         * the same white as the container (see Datatables.css). */
        (active ? ' aria-current="page"' : '') + '>' + p + '</button>';
    });
    out += '<button type="button" class="datatables__page-btn" aria-label="Next page"' +
      ' data-page="' + (page.current + 1) + '"' +
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

  /* What the free-text search looks at: the text the table actually SHOWS.
     Derived from the column config rather than from the row object, so it
     cannot accidentally match a field the user cannot see — a row's avatar URL
     would otherwise make every row a hit for "photos". By the same rule a
     hidden field like `userCode` is not searchable; its own filter chip is. */
  function searchableText(row, columns) {
    return columns.map(function (col) {
      var v = row[col.key];
      if (v === null || v === undefined) return '';
      if (col.type === 'user') return [v.name, v.role].filter(Boolean).join(' ');
      if (col.type === 'text' || col.type === 'chip') return String(v);
      return '';
    }).join(' ').toLowerCase();
  }

  /* ── Sorting ──────────────────────────────────────────────
     A column sorts only if it carries a `sort` token — the live screen's
     `hs` value — so the seven sortable columns are data, not a guess here.

     Comparison is by VALUE not by rendered text: "£1,000.00" sorts before
     "£9.95" as a string, and 100412 before 99999. Dates are ISO in the mock
     data and so compare correctly as strings, but going through the same
     numeric path keeps one rule. */
  function sortValue(row, col) {
    var raw = valueAt(row, col.key === 'customer' ? 'customer.name' : col.key);
    var num = raw.replace(/[^0-9.-]/g, '');
    /* Only treat it as a number when the WHOLE value is one — "100412" and
       "£9.95" yes, "EXT-0412" and "Paid Full" no. */
    if (num !== '' && /^[^0-9]*[0-9][0-9.,\s-]*$/.test(raw)) {
      var n = parseFloat(num);
      if (!isNaN(n)) return n;
    }
    return raw.toLowerCase();
  }

  function sortRows(rows, config) {
    var by = config.sort && config.sort.by;
    if (!by) return rows;
    var col = config.columns.filter(function (c) { return c.sort === by; })[0];
    if (!col) return rows;                      // an unknown token sorts nothing

    var dir = config.sort.dir === 'asc' ? 1 : -1;
    /* Copy first — Array.sort is in place, and mutating config.rows would
       make the next sort operate on the previous one's output. */
    return rows.slice().sort(function (a, b) {
      var x = sortValue(a, col), y = sortValue(b, col);
      if (x < y) return -1 * dir;
      if (x > y) return 1 * dir;
      return 0;
    });
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
    var query = (config.query || '').toLowerCase();
    if (!active.length && !query) return { rows: config.rows, filtered: false };

    return {
      filtered: true,
      rows: config.rows.filter(function (row) {
        /* Search and chips narrow together — a search inside a filtered view
           searches that view, not the whole listing. */
        if (query && searchableText(row, config.columns).indexOf(query) === -1) return false;
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
    var matched = sortRows(applyFilters(config).rows, config);

    /* Filter, then sort, then page — in that order. Paging first would sort
       only the visible slice, and sorting first would page a list the filter
       is about to change. */
    var total = matched.length;
    var pages = Math.max(1, Math.ceil(total / config.perPage));
    if (config.page > pages) config.page = pages;     // a filter can strand you past the end
    var start = (config.page - 1) * config.perPage;
    var rows = matched.slice(start, start + config.perPage);

    root.querySelector('[data-listing-body]').innerHTML = rows.length
      ? renderRows(config.columns, rows)
      : renderEmpty(config.columns);

    var page = {
      from: total ? start + 1 : 0,
      to: start + rows.length,
      total: total,
      current: config.page,
      pages: pages
    };

    root.querySelector('[data-listing-total]').textContent = String(page.total);
    root.querySelector('[data-listing-range]').textContent = page.from + '–' + page.to;
    root.querySelector('[data-listing-footer-total]').textContent = String(page.total);
    root.querySelector('[data-listing-pagination]').innerHTML = renderPagination(page);

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
    /* The body was just rebuilt, so the hidden-column marks went with it. */
    applyColumnVisibility(root, config);
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

  /* ── Edit Columns ─────────────────────────────────────────
     NEW capability — the live screen has no column picker (verified in
     source, 2026-09-18). Choices live in `config.hiddenColumns` and are
     lost on reload, like the saved views.

     Two different questions decide whether a column is on screen:
       tier  — is there ROOM for it at this container width?  (CSS)
       here  — is it WANTED?                                  (this)
     A column can be wanted with no room, so the panel says so rather than
     showing a tick against a column the user cannot see. That state is read
     back off the DOM — the th is hidden while not carrying `--off` — rather
     than by re-deriving the tier thresholds in JS, which would drift from
     the stylesheet the moment someone retuned a breakpoint. */
  function renderColumnPicker(root, config) {
    var host = document.querySelector('[data-listing-columns]');
    if (!host) return;

    host.innerHTML = config.columns.filter(function (col) {
      return col.label;   // the checkbox / spacer / edit / kebab are structure
    }).map(function (col, i) {
      var off = config.hiddenColumns.indexOf(col.key) !== -1;
      /* The first two columns identify a row. Whichever they ARE — the order
         is draggable — they cannot be switched off, or the table becomes a
         list of anonymous values. */
      var locked = i < 2;
      return '<div class="cc-listing__column' + (locked ? ' cc-listing__column--locked' : '') + '"' +
        ' data-column-row="' + esc(col.key) + '">' +
        '<span class="cc-listing__column-grip" data-column-grip title="Drag to reorder"' +
          ' aria-hidden="true"><i data-lucide="grip-vertical"></i></span>' +
        '<label class="checkbox">' +
          '<input type="checkbox" class="checkbox__input" data-column="' + esc(col.key) + '"' +
            (off ? '' : ' checked') + (locked ? ' disabled' : '') + '>' +
          '<span class="checkbox__indicator"><i data-lucide="check" aria-hidden="true"></i></span>' +
          '<span class="checkbox__label"><span class="checkbox__label-text">' + esc(col.label) + '</span>' +
            '<span class="cc-listing__column-note" data-column-note></span>' +
          '</span></label>' +
      '</div>';
    }).join('');

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
    annotateColumnRoom(root, config);
  }

  /* Say which ticked columns have no room at the current width. */
  function annotateColumnRoom(root, config) {
    var host = document.querySelector('[data-listing-columns]');
    if (!host) return;
    var heads = root.querySelectorAll('[data-listing-head] th');

    host.querySelectorAll('[data-column]').forEach(function (input, i) {
      void i;
      var key = input.getAttribute('data-column');
      var index = config.columns.findIndex(function (c) { return c.key === key; });
      var th = heads[index];
      var note = input.closest('.cc-listing__column').querySelector('[data-column-note]');
      if (!th || !note) return;
      var hiddenByTier = getComputedStyle(th).display === 'none' &&
                         !th.classList.contains('datatables__col--off');
      note.textContent = (input.checked && hiddenByTier) ? 'No room at this width' : '';
    });
  }

  /* Move a column in front of / behind another.
     Only the LABELLED columns reorder — the checkbox, spacer, edit and kebab
     columns are structure and stay where they are, so the reorder is done on
     the labelled subset and written back into the slots they occupied.

     Reordering also re-tiers: a column's position IS its priority, so dragging
     one to the front is how you say "show me this one first". Without that,
     dragging a tier-9 column to the top would leave it hidden until 2600px,
     which would look broken. Pairs, to match the thresholds in Datatables.css. */
  function moveColumn(config, fromKey, toKey, before) {
    var slots = [];
    config.columns.forEach(function (c, i) { if (c.label) slots.push(i); });
    var labelled = slots.map(function (i) { return config.columns[i]; });

    var from = labelled.findIndex(function (c) { return c.key === fromKey; });
    if (from === -1) return false;
    var moved = labelled.splice(from, 1)[0];
    var to = labelled.findIndex(function (c) { return c.key === toKey; });
    if (to === -1) return false;
    labelled.splice(before ? to : to + 1, 0, moved);

    labelled.forEach(function (col, i) {
      col.tier = Math.min(9, Math.floor(i / 2) + 1);
      config.columns[slots[i]] = col;
    });
    /* The first two are the row's identity and are always shown, whatever was
       switched off before they were dragged there. */
    labelled.slice(0, 2).forEach(function (col) {
      var at = config.hiddenColumns.indexOf(col.key);
      if (at !== -1) config.hiddenColumns.splice(at, 1);
    });
    return true;
  }

  function applyColumnVisibility(root, config) {
    var heads = root.querySelectorAll('[data-listing-head] th');
    config.columns.forEach(function (col, index) {
      var off = config.hiddenColumns.indexOf(col.key) !== -1;
      if (heads[index]) heads[index].classList.toggle('datatables__col--off', off);
      root.querySelectorAll('[data-listing-body] tr.datatables__row').forEach(function (tr) {
        var cell = tr.children[index];
        if (cell) cell.classList.toggle('datatables__col--off', off);
      });
    });
  }

  function renderPerPageOptions(config) {
    var host = document.querySelector('[data-listing-per-page-options]');
    if (!host) return;
    host.innerHTML = (config.perPageOptions || [20, 50, 100, 200]).map(function (n) {
      var on = n === config.perPage;
      return '<li role="none"><button type="button" class="dropdown-item dropdown-item--sm"' +
        ' role="menuitemradio" aria-checked="' + (on ? 'true' : 'false') + '" data-per-page="' + n + '">' +
        n + (on ? '<i data-lucide="check" class="dropdown-item__check" aria-hidden="true"></i>' : '') +
        '</button></li>';
    }).join('');
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }

  function render(root, config) {
    renderChips(config);
    root.querySelector('[data-listing-head]').innerHTML = renderHead(config.columns, config.sort);
    renderResults(root, config);
    renderColumnPicker(root, config);
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
      query: '',
      hiddenColumns: [],
      /* Live state, separate from the shipped defaults so the config object
         still describes a fresh screen. */
      sort: Object.assign({ by: 'Date', dir: 'desc' }, config.sort || {}),
      perPage: config.perPage || 20,
      page: 1,
      /* name -> the values that chip currently holds. The bar reports these;
         they cannot be read back off a chip, whose label rolls 4+ values up
         into "<first>, and 3 more". */
      filterValues: {}
    });

    var bar = root.querySelector('.filter-bar');

    renderPerPageOptions(config);
    render(root, config);

    /* The bar establishes its baseline before these chips exist, so it would
       read the first render as a change and offer to save the view the screen
       opened on. Hand it the real starting point — the columns included, or
       the first column edit would be measured against an empty layout. */
    if (bar && typeof bar.setViewExtra === 'function') bar.setViewExtra(columnState());
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

    /* A view is the filter set AND the table layout. Editing the columns is a
       change to the view in the same way adding a filter is — the two are one
       workflow — so the columns travel with the snapshot and reach the same
       Save view CTA. */
    function columnState() {
      return config.columns.map(function (c) { return c.key; }).join(',') +
        '|' + config.hiddenColumns.slice().sort().join(',');
    }

    /* Tell the bar the table layout changed, so the CTA appears. The bar
       compares this string and never reads it — it has no business knowing
       what a column is. */
    function announceColumns() {
      if (bar && typeof bar.setViewExtra === 'function') bar.setViewExtra(columnState());
    }

    function snapshot() {
      return {
        defaultFilters: config.defaultFilters.slice(),
        moreFilters: config.moreFilters.slice(),
        filterValues: JSON.parse(JSON.stringify(config.filterValues)),
        /* Copied, not referenced: reordering rewrites each column's tier in
           place, so a stored reference would follow the live table. */
        columns: config.columns.map(function (c) { return Object.assign({}, c); }),
        hiddenColumns: config.hiddenColumns.slice()
      };
    }

    /* The view the screen opened on — what the pre-existing rows mean, and
       what an unsaved view falls back to. */
    var baseline = snapshot();

    function restore(snap) {
      config.defaultFilters = snap.defaultFilters.slice();
      config.moreFilters = snap.moreFilters.slice();
      config.filterValues = JSON.parse(JSON.stringify(snap.filterValues));
      if (snap.columns) {
        config.columns = snap.columns.map(function (c) { return Object.assign({}, c); });
        config.hiddenColumns = (snap.hiddenColumns || []).slice();
      }
      renderChips(config);
      root.querySelector('[data-listing-head]').innerHTML = renderHead(config.columns, config.sort);
      renderResults(root, config);
      renderColumnPicker(root, config);
      /* Set the column half of the signature BEFORE re-baselining, or the
         baseline would be taken against the previous view's layout. */
      announceColumns();
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

    /* Drag to reorder. The row is only made draggable while the pointer is on
       its grip, so the checkbox stays clickable and a stray drag on the label
       does not start a reorder. */
    var dragKey = null;

    document.addEventListener('pointerdown', function (e) {
      var grip = e.target.closest('[data-column-grip]');
      if (!grip) return;
      grip.closest('.cc-listing__column').draggable = true;
    });

    document.addEventListener('dragstart', function (e) {
      var row = e.target.closest('[data-column-row]');
      if (!row) return;
      dragKey = row.getAttribute('data-column-row');
      row.classList.add('cc-listing__column--dragging');
      if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
    });

    document.addEventListener('dragover', function (e) {
      var row = e.target.closest('[data-column-row]');
      if (!row || !dragKey) return;
      e.preventDefault();                      // without this there is no drop
      var box = row.getBoundingClientRect();
      var before = (e.clientY - box.top) < box.height / 2;
      document.querySelectorAll('[data-column-row]').forEach(function (r) {
        r.classList.remove('cc-listing__column--over-before', 'cc-listing__column--over-after');
      });
      row.classList.add(before ? 'cc-listing__column--over-before' : 'cc-listing__column--over-after');
    });

    document.addEventListener('drop', function (e) {
      var row = e.target.closest('[data-column-row]');
      if (!row || !dragKey) return;
      e.preventDefault();
      var box = row.getBoundingClientRect();
      var before = (e.clientY - box.top) < box.height / 2;
      var target = row.getAttribute('data-column-row');
      if (target !== dragKey && moveColumn(config, dragKey, target, before)) {
        root.querySelector('[data-listing-head]').innerHTML = renderHead(config.columns, config.sort);
        renderResults(root, config);
        renderColumnPicker(root, config);
        announceColumns();
      }
      dragKey = null;
    });

    document.addEventListener('dragend', function () {
      dragKey = null;
      document.querySelectorAll('[data-column-row]').forEach(function (r) {
        r.draggable = false;
        r.classList.remove('cc-listing__column--dragging',
          'cc-listing__column--over-before', 'cc-listing__column--over-after');
      });
    });

    /* Sorting. A second click on the same column reverses it; a first click
       on a new one starts descending, which is what people expect from a
       date or a value — the two things anyone sorts a listing by first. */
    root.addEventListener('click', function (e) {
      var btn = e.target.closest('.datatables__sort');
      if (!btn) return;
      var token = btn.getAttribute('data-sort');
      if (config.sort.by === token) {
        config.sort.dir = config.sort.dir === 'asc' ? 'desc' : 'asc';
      } else {
        config.sort.by = token;
        config.sort.dir = 'desc';
      }
      /* Re-sorting reorders the whole result, so the current page number no
         longer means anything — page 3 of a different order is a different
         set of rows. Back to the top. */
      config.page = 1;
      root.querySelector('[data-listing-head]').innerHTML = renderHead(config.columns, config.sort);
      renderResults(root, config);
      if (window.lucide) window.lucide.createIcons();
    });

    /* Paging. */
    root.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-page]');
      if (!btn || btn.disabled) return;
      var to = parseInt(btn.getAttribute('data-page'), 10);
      if (!to || to === config.page) return;
      config.page = to;
      renderResults(root, config);
    });

    /* Rows per page. Recomputing the page so the FIRST row stays on screen
       beats resetting to 1 — going 20 → 50 while reading page 4 should widen
       the view around where you were, not throw you back to the start. */
    root.addEventListener('click', function (e) {
      var opt = e.target.closest('[data-per-page]');
      if (!opt) return;
      var firstRow = (config.page - 1) * config.perPage;
      config.perPage = parseInt(opt.getAttribute('data-per-page'), 10);
      config.page = Math.floor(firstRow / config.perPage) + 1;
      var label = document.querySelector('[data-listing-per-page]');
      if (label) label.textContent = String(config.perPage);
      renderPerPageOptions(config);
      renderResults(root, config);
      var dd = opt.closest('.dropdown');
      if (dd) {
        dd.classList.remove('is-open');
        var t = dd.querySelector('.dropdown__trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      }
    });

    /* Edit Columns: toggling a column. */
    document.addEventListener('change', function (e) {
      var input = e.target.closest('[data-column]');
      if (!input) return;
      var key = input.getAttribute('data-column');
      var at = config.hiddenColumns.indexOf(key);
      if (input.checked) { if (at !== -1) config.hiddenColumns.splice(at, 1); }
      else if (at === -1) { config.hiddenColumns.push(key); }
      applyColumnVisibility(root, config);
      annotateColumnRoom(root, config);
      announceColumns();
    });

    /* Whether a column has ROOM changes with the container, not the window —
       the CC sidebar resizes the table with no window resize at all — so the
       panel's notes are refreshed from a ResizeObserver on the table
       (CLAUDE.md §4a), never from matchMedia. */
    var table = root.querySelector('.datatables');
    if (table && typeof ResizeObserver === 'function') {
      new ResizeObserver(function () { annotateColumnRoom(root, config); }).observe(table);
    }

    /* Free text from either search field. FilterBar holds the 3-character
       threshold and reports '' below it, so there is nothing to re-check here.

       Deliberately NOT part of a saved view: a view is a filter set, and the
       search is a transient look inside whichever view is open. It survives
       switching views for the same reason. */
    document.addEventListener('filter-bar:search', function (e) {
      config.query = (e.detail && e.detail.query) || '';
      config.page = 1;
      renderResults(root, config);
    });

    /* A chip committed (Apply) or was cleared — narrow the table. */
    document.addEventListener('filter-bar:change', function (e) {
      var d = e.detail || {};
      if (!d.name) return;
      config.filterValues[d.name] = d.values || [];
      config.page = 1;   // a narrower result makes the old page number meaningless
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
