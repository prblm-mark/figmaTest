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

  /* How many filters a screen shows on the bar before the rest move behind
     "Add Filters". A house rule for every listing screen, not an Orders one
     (designer, 2026-09-18) — a screen config may list more, and the extras are
     offered first in the More Filters panel rather than lost. */
  var DEFAULT_CHIPS = 5;

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
   * hides. There is no `--mobile` any more: the edit column was the only
   * mobile-only one and it now shows at every width, so the class and its two
   * rules went with it rather than being left as a hook with no styles. */
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
    if (STRUCTURAL[col.type]) out.push('datatables__col--' + col.type);
    if (extra) out.push(extra);
    return out.length ? ' class="' + out.join(' ') + '"' : '';
  }

  /* Where a row goes. Two destinations, and they are different screens: the
     row opens the order to LOOK at, the pencil opens it to CHANGE.

     TODO(backend:Listing) listing-row-routes: placeholder routes — the real
     paths are the backend team's to supply, and swapping them is these two
     functions. The pencil must not render for a row the operator may not
     change; that permission has to come with the row. They are
     hrefs on real anchors rather than JS navigation on purpose: the order
     number and the pencil are then keyboard-reachable, open in a new tab on
     middle-click, and show their destination on hover, none of which a click
     handler gives you. */
  var ROUTE = {
    view: function (id, noun) { return '#' + (noun || 'order') + '/' + encodeURIComponent(id) + '/view'; },
    edit: function (id, noun) { return '#' + (noun || 'order') + '/' + encodeURIComponent(id) + '/edit'; }
  };

  /* WHICH field identifies a row is per screen, and until Article Archive it
     was hard-coded to `orderNo`. Articles has no such field, so every one of
     its rows rendered `href="#order//edit"` and an aria-label reading
     "Edit order " with nothing after it — a screen reader announcing eight
     identical, empty controls. The screen declares `rowKey` and `routeNoun`;
     both default to Orders' values, so Orders is unchanged. */
  var ROW_ID = { key: 'orderNo', noun: 'order', spoken: 'order' };

  function rowId(row) { return row[ROW_ID.key]; }

  /* Which rows are ticked. Module state for the same reason ROW_ID is: the CELL
     renderers are pure functions of a row and cannot reach config. Shared by
     BOTH views on purpose — the live Grid has Select all and a Move/Delete
     action bar while the Listing's checkboxes do nothing at all, and two views
     of one screen disagreeing about whether selection means anything is the
     bug, not a feature (designer, 2026-09-22). */
  var SELECTED = {};

  function isSelected(row) { return !!SELECTED[rowId(row)]; }

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
      /* The anchor IS the row's navigation — the whole-row click below just
         follows it, so there is one destination and one code path. */
      return '<a class="datatables__order" href="' + esc(ROUTE.view(rowId(row), ROW_ID.noun)) + '"' +
        ' data-row-link>' + esc(rowId(row)) + '</a>' +
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

    /* Thumbnail — the Media Items listing's own first column, and its header
       is deliberately blank, exactly as CProperties declares it.
       TODO(backend:Listing) media-thumbnails: the live screen builds this from
       MediaItem.ImageThumb through an internal DAM path and no read available
       here returns a usable URL, so the demo rows carry a seeded Lorem Picsum
       photo instead (the same host the Orders avatars use). The seam is
       `row.thumbUrl` — point it at the real asset and nothing else changes. */
    thumb: function (row) {
      /* A row that HAS a picture shows it. `alt` is empty on purpose — the
         Title column sits immediately beside it and already names the item, so
         an alt would make a screen reader read every row's name twice. The box
         keeps its background, which is what shows while the image loads and if
         it never does. */
      if (row.thumbUrl) {
        return '<span class="datatables__thumb datatables__thumb--' + esc(row.family) + '"' +
          ' data-backend-todo="media-thumbnails">' +
          '<img src="' + esc(row.thumbUrl) + '" alt="" loading="lazy" decoding="async">' +
        '</span>';
      }
      /* Audio and documents have no picture to show, which is also what the
         live screen concludes — its MediaTypeAR gives those a format icon. */
      var glyph = { audio: 'music', document: 'file-text' }[row.family] || 'file';
      return '<span class="datatables__thumb datatables__thumb--' + esc(row.family) + '"' +
        ' data-backend-todo="media-thumbnails" role="img"' +
        ' aria-label="' + esc(row.family) + ' file">' +
        '<i data-lucide="' + glyph + '" aria-hidden="true"></i>' +
      '</span>';
    },

    /* Type. Live picks one of 30 bespoke 40x40 format icons out of a 49-slot
       array keyed on DocMimeTypeCode — and 19 of those slots are EMPTY, so
       those rows render nothing at all. Four Lucide family glyphs plus the
       format in words instead (designer, 2026-09-22): the families are not
       invented, they are the same grouping the MediaType filter already makes
       of the same mimetype codes. */
    media: function (row) {
      var glyph = { image: 'image', video: 'video', audio: 'music', document: 'file-text' }[row.family]
        || 'file';
      return '<span class="datatables__type-cell">' +
        '<i data-lucide="' + glyph + '" aria-hidden="true"></i>' +
        '<span>' + esc(row.format) + '</span></span>';
    },

    select: function (row) {
      return '<label class="checkbox">' +
        '<input type="checkbox" class="checkbox__input" data-select-row="' + esc(rowId(row)) + '"' +
        (isSelected(row) ? ' checked' : '') +
        ' aria-label="Select ' + esc(ROW_ID.spoken) + ' ' + esc(rowId(row)) + '">' +
        '<span class="checkbox__indicator"><i data-lucide="check" aria-hidden="true"></i></span>' +
        '</label>';
    },

    /* Was Figma's Secondary `Icon Only=True, Size=xs` button (node 2926:3566),
     * and mobile-only. Now on every row at every width, and BORDERLESS
     * (designer, 2026-09-18): it sits next to the kebab, which is a bare icon,
     * and two adjacent row controls drawn differently read as two different
     * kinds of thing. It takes the kebab's treatment exactly — same box, same
     * hover — so the pair reads as one set.
     *
     * An anchor, not a button: see ROUTE above. */
    edit: function (row) {
      return '<a class="datatables__row-edit" href="' + esc(ROUTE.edit(rowId(row), ROW_ID.noun)) + '"' +
        ' data-backend-todo="listing-row-routes"' +
        ' aria-label="Edit ' + esc(ROW_ID.spoken) + ' ' + esc(rowId(row)) + '">' +
        '<i data-lucide="pencil" aria-hidden="true"></i></a>';
    },

    /* Kebab doubles as the mobile row-detail toggle. The reveal is pure
     * CSS (:has(:checked)) in Datatables.css — no JS listener. */
    kebab: function (row, col, index) {
      return '<label class="datatables__kebab">' +
        '<input type="checkbox" class="datatables__kebab__input" ' +
        'aria-label="Show details for ' + esc(ROW_ID.spoken) + ' ' + esc(rowId(row)) + '" data-row="' + index + '">' +
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

  /* One row of a Multi Select Table. Shared by the first render and by every
     redraw the card's sub-filters trigger, so the two cannot drift. */
  /* Column classes for the picker's table, in order. Named so the CSS can hold
     each one's minimum width — the name column needs room to wrap, the code
     and zone columns need to not be squeezed. */
  var PICKER_DROPPABLE = ['datatables__col--name', 'datatables__col--code', 'datatables__col--zone'];

  /* Each picker names its own column classes when its columns are not
     Catalogue Item's — Contact Lists is Name + a date, which wants the date
     width rather than the code one. */
  function pickerCols(f) { return f.tableColClasses || PICKER_DROPPABLE; }

  /* Which row field each column shows. The first column is always the row's
     name — it is what selection is keyed on — and the rest follow
     tableFields in order, so the two lists cannot drift. */
  function pickerFields(f) { return ['name'].concat(f.tableFields || []); }

  /* 20 rows a page, which is the live picker's own `iMaxRows`. That number is
     the one part of its paging worth keeping: it runs 20 with an N+1 probe and
     no offset, so "there is more" is all it can say and narrowing the
     sub-filters is the only way forward. This one can actually go there. */
  var PICKER_PAGE_SIZE = 20;

  /* ── Demo persistence ─────────────────────────────────────
   * TODO(backend:Listing) listing-column-prefs / listing-default-filters:
   * saved views and the column layout belong to the USER, on the server, and
   * both are already in the handover manifest. localStorage is here so the
   * prototype survives a reload — a demo that forgets what you set up two
   * clicks ago cannot be walked through.
   *
   * Every call is wrapped: storage throws in a private window and can be
   * disabled outright, and a screen that will not render because it could not
   * read a preference is a worse failure than one that forgets it.
   */
  var STORE_PREFIX = 'affino.listing.';

  function loadState(screen) {
    try {
      var raw = window.localStorage.getItem(STORE_PREFIX + screen);
      var data = raw ? JSON.parse(raw) : null;
      return (data && typeof data === 'object') ? data : {};
    } catch (e) { return {}; }
  }

  function saveState(screen, state) {
    try {
      window.localStorage.setItem(STORE_PREFIX + screen, JSON.stringify(state));
    } catch (e) { /* private window, quota, or storage switched off */ }
  }

  /* The picker's own pager. Deliberately the DATATABLE's footer markup: it
     inherits the listing's pagination styling, and the collapse to
     "Page 3 of 4" keys on the nearest container — which inside this card IS
     the card, so a 640px picker gets the compact form without a second rule.
     `data-picker-page` rather than `data-page`, so the listing's own pager
     handler cannot pick these up. */
  function renderPickerPager(page, pages, from, to, total) {
    if (pages <= 1) return '';
    var btn = function (to, label, icon, disabled) {
      return '<button type="button" class="datatables__page-btn" aria-label="' + label + '"' +
        ' data-picker-page="' + to + '"' + (disabled ? ' disabled' : '') +
        '><i data-lucide="' + icon + '" aria-hidden="true"></i></button>';
    };
    return '<div class="datatables__footer">' +
      '<span class="datatables__count"><strong>' + from + '\u2013' + to + '</strong> of <strong>' +
        total + '</strong></span>' +
      '<div class="datatables__pagination" role="group" aria-label="Pagination">' +
        btn(page - 1, 'Previous page', 'chevron-left', page === 1) +
        '<span class="datatables__page-position">Page ' + page + ' of ' + pages + '</span>' +
        btn(page + 1, 'Next page', 'chevron-right', page === pages) +
      '</div></div>';
  }

  function pickerRow(o, f, picked) {
    var on = (picked || []).indexOf(o.name) !== -1;
    var cols = pickerCols(f);
    var cells = (f.tableFields || []).map(function (key, i) {
      var cls = cols[i + 1] ? ' class="' + cols[i + 1] + '"' : '';
      return '<td' + cls + '>' + esc(o[key]) + '</td>';
    }).join('');
    return '<tr>' +
      '<td><label class="checkbox"><input type="checkbox" class="checkbox__input"' +
        ' data-row-value="' + esc(o.name) + '"' + (on ? ' checked' : '') +
        ' aria-label="Select ' + esc(o.name) + '"><span class="checkbox__indicator">' +
        '<i data-lucide="check" aria-hidden="true"></i></span></label></td>' +
      '<td>' + esc(o.name) + '</td>' + cells +
      '<td><a class="filter-dropdowns__linkcell" href="#" aria-label="Open ' + esc(o.name) + '">' +
        '<i data-lucide="external-link" aria-hidden="true"></i></a></td>' +
    '</tr>';
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

    /* Type=Multi Select Table (3039:5624) — a 640px card with its own facet
       chips and a Datatables body, for pickers whose options need more than a
       name to choose between. The live Catalogue Item picker is paged and
       letter-filtered with its own sub-filters (confirmed against the Affino
       source), which is why a flat checkbox list was the wrong widget for it.

       The facet chips here are NOT filters for the bar. FilterBar scopes its
       add-filter click to `--more`, so clicking "Name" in this card does not
       put a Name filter on the bar.
       TODO(backend:Listing): those sub-filters are visual only. */
    'multi-select-table': function (f, values) {
      var picked = values || [];

      /* Each sub-filter is a FilterItem that opens its own picker, the same
         gesture as a chip on the bar — so the card is consistent with the
         system rather than inventing a second kind of control. */
      var facets = (f.facets || []).map(function (sub) {
        var build = FILTER_PANELS[sub.type];
        /* SOLID, not dashed. Figma 3039:5624 draws these as the Default
           FilterItem, the same as the bar's own chips; dashed is the "not yet
           added" idiom that belongs to Add Filters and the More Filters
           facets. These are controls that are already here. */
        return '<div class="filter-dropdowns__facet" data-subfilter="' + esc(sub.name) + '">' +
          '<div class="filter-item filter-item--rounded" data-filter-name="' + esc(sub.name) + '">' +
            '<button type="button" class="filter-item__clear" aria-label="Clear ' + esc(sub.name) + '">' +
              '<i data-lucide="x" aria-hidden="true"></i></button>' +
            '<button type="button" class="filter-item__trigger" data-subfilter-trigger aria-expanded="false">' +
              '<i data-lucide="plus" class="filter-item__add" aria-hidden="true"></i>' +
              '<span class="filter-item__name">' + esc(sub.name) + '</span>' +
              '<span class="filter-item__sep" aria-hidden="true">·</span>' +
              '<span class="filter-item__values"></span>' +
              '<i data-lucide="chevron-down" class="filter-item__chevron" aria-hidden="true"></i>' +
            '</button>' +
          '</div>' +
          (build ? '<div class="filter-dropdowns__subpanel" hidden>' +
            build(Object.assign({ label: sub.name }, sub), []) + '</div>' : '') +
        '</div>';
      }).join('');

      /* The first column identifies the row and never drops; the rest are
         tagged so the card's container query can shed them as it narrows. */
      var sortable = f.sortable || [];
      var cols = pickerCols(f);
      var fields = pickerFields(f);
      var head = (f.tableColumns || []).map(function (c, i) {
        var cls = cols[i] ? ' class="' + cols[i] + '"' : '';
        /* Catalogue ID is shown but not sortable — the query orders on
           lowercased copies of Name and Zone only. The button carries the ROW
           FIELD it sorts, not the label: without it the click reached the
           listing's own sort handler with no token and cleared the listing's
           sort instead. */
        var inner = sortable.indexOf(c) !== -1
          ? '<button class="datatables__sort" type="button" data-picker-sort="' + esc(fields[i] || '') + '">' + esc(c) +
            ' <i data-lucide="' + ICON_SORT + '" aria-hidden="true"></i></button>'
          : esc(c);
        return '<th' + cls + '>' + inner + '</th>';
      }).join('');

      /* First paint is the first page, so the card never renders 71 rows and
         then throws 51 of them away. Everything after this goes through
         redrawPickerRows, which owns the paging from then on. */
      var all = f.options || [];
      var firstPages = Math.max(1, Math.ceil(all.length / PICKER_PAGE_SIZE));
      var rows = all.slice(0, PICKER_PAGE_SIZE)
        .map(function (o) { return pickerRow(o, f, picked); }).join('');
      var pager = renderPickerPager(1, firstPages, 1,
        Math.min(PICKER_PAGE_SIZE, all.length), all.length);

      return '<div class="filter-dropdowns filter-dropdowns--table" data-filter-dropdowns>' +
        '<div class="filter-dropdowns__header"><p class="filter-dropdowns__title">' + esc(f.label) + '</p></div>' +
        '<div class="filter-dropdowns__facets">' + facets + '</div>' +
        '<div class="filter-dropdowns__table-region"><div class="datatables"><div class="datatables__body">' +
          '<table class="table"><thead><tr>' +
            '<th class="datatables__col--tight"><label class="checkbox">' +
              '<input type="checkbox" class="checkbox__input" data-select-all aria-label="Select all">' +
              '<span class="checkbox__indicator"><i data-lucide="check" aria-hidden="true"></i></span></label></th>' +
            head +
            '<th class="datatables__col--tight" aria-label="Open"></th>' +
          '</tr></thead><tbody>' + rows + '</tbody></table>' +
        '</div></div></div>' +
        '<div class="filter-dropdowns__table-pager" data-picker-pager>' + pager + '</div>' +
        '<div class="filter-dropdowns__table-footer">' +
          '<button type="button" class="btn btn--primary filter-dropdowns__apply" data-filter-dropdowns-apply>Apply</button>' +
        '</div>' +
      '</div>';
    },

    /* Type=More Filters (3039:5637) — the filters NOT on the bar, as empty
       chips. No Apply: picking one adds it to the bar. */
    'more-filters': function (f, values) {
      var chips = (f.options || []).map(function (o) {
        /* Solid means already on the bar — click to take it off. Dashed with a
           plus means click to add. The facet never leaves this list, so adding
           and removing are the same gesture in the same place. */
        return '<div class="filter-item filter-item--rounded ' +
          (o.added ? 'filter-item--added' : 'filter-item--empty') +
          '" data-filter-name="' + esc(o.name) + '">' +
          '<button type="button" class="filter-item__trigger" aria-expanded="false"' +
            ' aria-pressed="' + (o.added ? 'true' : 'false') + '"' +
            ' aria-label="' + (o.added ? 'Remove ' : 'Add ') + esc(o.name) + ' filter">' +
            '<i data-lucide="' + (o.added ? 'check' : 'plus') + '" class="filter-item__add" aria-hidden="true"></i>' +
            '<span class="filter-item__name">' + esc(o.name) + '</span>' +
          '</button></div>';
      }).join('');
      return '<div class="filter-dropdowns filter-dropdowns--more">' +
        '<div class="filter-dropdowns__facets">' + chips + '</div></div>';
    }
  };

  /* One chip: the FilterItem markup plus its picker, wrapped so the picker can
     anchor to it. The full slot set is always rendered — FilterItem's contract
     is that CSS hides what the current state does not use. */
  function chip(f, extraClass, wrapClass, values) {
    var build = FILTER_PANELS[f.type];
    var card = build ? build(f, values) : '';
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
      (card ? '<div class="filter-bar__panel" hidden>' + card + '</div>' : '') +
    '</div>';
  }

  function renderFilters(config) {
    var added = config.added || [];
    var html = (config.defaultFilters || []).map(function (f) {
      return chip(f, '', '', config.filterValues[f.name] || []);
    }).join('');
    /* `--add` marks the WRAPPER so an empty view can hide the other chips:
       a chip with a picker is wrapped, so FilterBar's bare-chip selector
       cannot reach it. */
    /* No catalogue, no control. Article Archive declares six filters and the
       sixth is the SORT, so its five chips use the catalogue up and there is
       nothing left to add — and a dashed "Add Filters" that opens an empty
       panel is worse than no chip at all. Orders and Articles both have a
       catalogue, so both are unaffected. */
    if (!(config.moreFilters || []).length) return html;

    html += chip(
      {
        name: 'Add Filters', type: 'more-filters',
        /* Alphabetical. `config.moreFilters` keeps its own order — it is the
           catalogue, and the added set is looked up by name, so sorting a copy
           for display changes nothing but the reading order. Nearly fifty
           facets is a list you scan for a name, not one you read. */
        options: (config.moreFilters || []).map(function (o) {
          return { name: o.name, added: added.indexOf(o.name) !== -1 };
        }).sort(function (a, b) { return a.name.localeCompare(b.name); })
      },
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
        /* The select column's header carries SELECT ALL. No visible label —
           the column is a checkbox column and the header is a checkbox
           (designer, 2026-09-22); the name is on the input for a screen
           reader. A screen with no bulk actions has no select column at all,
           so this cannot appear where selection would lead nowhere. */
        if (col.key === 'select') {
          return '<th scope="col"' + colClass(col) + '>' +
            '<label class="checkbox">' +
            /* `data-listing-select-all`, NOT `data-select-all`: FilterDropdowns
               already owns that name for the multi-select-table pickers' own
               header box. Sharing it meant ticking the Section picker's
               select-all also ticked every row in the table behind it. */
            '<input type="checkbox" class="checkbox__input" data-listing-select-all' +
            ' aria-label="Select all rows on this page">' +
            '<span class="checkbox__indicator">' +
            '<i data-lucide="check" aria-hidden="true"></i></span>' +
            '</label></th>';
        }
        return '<th scope="col" aria-label="Actions"' + colClass(col) + '></th>';
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
        var content = fn(row, col, i);
        /* Snug columns truncate rather than set their own width. The cap has
           to sit on a block INSIDE the cell — see `__truncate` in
           Datatables.css. The detail row below deliberately does not do this:
           it exists to show the values in full. */
        /* `truncate` is snug's cap without snug's sizing: the Articles title is
           FLUID — it takes the slack the way Orders' Customer does — but its
           content is free text that ran to 436px at max-content and ate two
           columns' worth of budget on its own. A column can now be one, the
           other, or both. */
        if (col.snug || col.truncate) {
          content = '<span class="datatables__truncate" title="' +
            esc(String(row[col.key] === undefined ? '' : row[col.key])) + '">' + content + '</span>';
        }
        return '<td' + colClass(col, col.cellClass) + '>' + content + '</td>';
      }).join('');

      /* Paired detail row: what the kebab reveals is exactly what the row
       * could not show.
       *
       * EVERY labelled column is rendered here, and which pairs are VISIBLE is
       * decided later, by `syncRowDetail`, from the same flags that hide the
       * columns themselves. It used to filter on `col.tier > 1` — a field that
       * was removed when tiers gave way to the measured fit, so the filter
       * matched nothing and the detail row had been silently empty ever since.
       * Deciding it here at all was the mistake: what fits is a function of the
       * container's width, which changes with no re-render (the CC sidebar
       * docking is enough), so a list baked in at render time is wrong the
       * moment the column does anything. */
      var detail = columns.filter(function (col) {
        return col.label && !STRUCTURAL[col.type];
      }).map(function (col) {
        var fn = CELL[col.type] || CELL.text;
        /* The wrapper is `display: contents`, so the dt/dd still sit in the
           list's own grid; it exists only to give the pair one thing to
           toggle. A <div> around a dt/dd group is valid inside a <dl>. */
        return '<div class="datatables__detail-item" data-detail-col="' +
          esc(col.key) + '" hidden><dt>' + esc(col.label) + '</dt>' +
          '<dd>' + fn(row, col, i) + '</dd></div>';
      }).join('');

      return '<tr class="datatables__row" data-order="' + esc(rowId(row)) + '">' + cells + '</tr>' +
        '<tr class="datatables__row-detail"><td class="datatables__row-detail__cell" colspan="' +
        columns.length + '"><dl class="datatables__detail-list">' + detail +
        '<p class="datatables__detail-empty" hidden>Every column is showing at this width.</p>' +
        '</dl></td></tr>';
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
    /* The numbers are wrapped so a narrow container can swap the whole set for
       the position readout below. BOTH are always rendered and CSS chooses —
       the swap is a container-width question, and JS cannot read a container
       query (CLAUDE.md §4a). */
    out += '<span class="datatables__page-numbers">';
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
    out += '</span>';
    /* What replaces the numbers when there is no room for them. Not
       aria-hidden: whichever one is visible is the one a screen reader should
       find, and the numbered buttons carry aria-current when they are. */
    out += '<span class="datatables__page-position">Page ' + page.current +
      ' of ' + page.pages + '</span>';
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
  var MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  /* Two date formats have to meet here: the rows carry ISO (`2026-09-28`,
     which is what a backend returns) and DatePicker writes what it shows
     (`28 Sep 2026`). Parsing both keeps the comparison honest rather than
     making one side pretend to be the other. */
  function toDate(text) {
    var iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
    if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]);

    var human = /^(\d{1,2})\s+([A-Za-z]{3})[a-z]*\s+(\d{4})$/.exec(text);
    if (human) {
      var month = MONTHS.indexOf(human[2].toLowerCase());
      if (month !== -1) return new Date(+human[3], month, +human[1]);
    }
    return null;
  }

  /* Money and counts arrive with symbols and separators — "£1,204.95". */
  function toNumber(text) {
    var n = parseFloat(String(text).replace(/[^0-9.-]/g, ''));
    return isNaN(n) ? null : n;
  }

  /* WHICH fields a term is matched against can itself be a control. Article
     Archive's "Filter by" is three checkboxes — Section / Article / Channel —
     and the live screen ORs a LIKE per ticked box (ArchiveManagementQDef.cfm).
     So one chip reads another: `scopedBy` names it, `scopeFields` maps each of
     its option names to a row field. No other screen sets either, and without
     them this returns the filter's own single `field`. */
  function scopeFields(filter, config) {
    if (!filter.scopeFields) return [filter.field];
    /* `scopeFields` with no `scopedBy` is a FIXED multi-field search — no chip
       decides it. Media Items needs one: its Title box is LIKE-matched against
       MediaItem.Name OR MediaFileItem.FileName, and against MediaItemCode when
       the term is numeric, so searching only the displayed title would miss
       the filename the operator is actually looking for. */
    if (!filter.scopedBy) {
      return Object.keys(filter.scopeFields).map(function (k) {
        return filter.scopeFields[k];
      });
    }
    var picked = (config.filterValues || {})[filter.scopedBy];
    /* UNSET and EMPTY are different, and the live screen treats them
       differently too. A scope chip nobody has touched holds no key at all, and
       falls back to `scopeDefault` — the CFML's own
       `<cfparam name="FilterType" default="Section,Article">`. A chip the user
       has explicitly emptied holds `[]`, and matches nothing, which is the
       `AND (1 = 0 …)` the query really builds. Collapsing the two with a plain
       `|| []` would make a fresh screen find nothing the moment a term was
       typed. */
    if (picked === undefined) picked = filter.scopeDefault || [];
    return picked.map(function (name) { return filter.scopeFields[name]; })
                 .filter(Boolean);
  }

  function matches(row, filter, values, config) {
    if (!values.length) return true;
    var actual = valueAt(row, filter.field);

    /* Either end may be blank — an open-ended range is still a range. */
    if (filter.type === 'date-range' || filter.type === 'range') {
      var read = filter.type === 'date-range' ? toDate : toNumber;
      var here = read(actual);
      if (here === null) return false;          // unparseable rows cannot match
      var from = read(values[0] || '');
      var to = read(values[1] || '');
      if (from !== null && here < from) return false;
      if (to !== null && here > to) return false;
      return true;
    }

    if (filter.type === 'text') {
      var term = values[0].toLowerCase();
      /* Untick every box and the live screen's `AND (1 = 0 …)` matches
         nothing. Faithful: a term with an explicitly emptied scope finds
         nothing, rather than silently falling back to searching the title.
         An UNTOUCHED scope is a different case — see scopeFields. */
      return scopeFields(filter, config || {}).some(function (field) {
        return valueAt(row, field).toLowerCase().indexOf(term) !== -1;
      });
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
    /* A token with no column of its own leaves the rows in declaration order,
       and Article Archive RELIES on that rather than tripping over it: its
       live default is PublishStart DESC and PublishStart is not one of its six
       columns, so the screen opens on an order no header can claim. Its rows
       ship in that order. */
    if (!col) return rows;

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
          return matches(row, byName[name], config.filterValues[name], config);
        });
      })
    };
  }

  /* Re-render only what filtering changes: the body, the counts and the
     pagination. The chips are left alone — rebuilding them would discard the
     very selections that caused this. */
  /* ── Grid view ────────────────────────────────────────────
     The live screen's other half: MediaLayOut=Grid, rendered through
     MediaLightbox.cfm rather than ListForm.cfm. It is a different rendering of
     the SAME query — same filters, same page size, same paging — which is why
     it lives inside the same `.datatables` block and shares the toolbar and
     the footer rather than being a second screen.

     What live draws is a bordered <table> of 140px cells holding a thumbnail
     and NOTHING ELSE; the name, pixel dimensions, file size and type are all
     in a jQuery hover tooltip (`trailOn`), and `sTempName` is computed and
     truncated in the source and then never printed. The card here carries the
     name and a meta line at rest (designer, 2026-09-22): a wall of 96,000
     unlabelled thumbnails cannot be read without a mouse, and a hover tooltip
     is unreachable by keyboard or screen reader. */
  function gridCard(row) {
    var id = rowId(row);
    var glyph = { audio: 'music', document: 'file-text' }[row.family] || 'file';
    var media = row.thumbUrl
      ? '<img src="' + esc(row.thumbUrl) + '" alt="" loading="lazy" decoding="async">'
      : '<i data-lucide="' + glyph + '" aria-hidden="true"></i>';

    return '<li class="cc-grid__item">' +
      '<div class="cc-grid__card' + (isSelected(row) ? ' cc-grid__card--selected' : '') + '"' +
        ' data-grid-card="' + esc(id) + '">' +
        '<div class="cc-grid__media cc-grid__media--' + esc(row.family) + '">' +
          /* The anchor IS the card's navigation — same route the table row
             uses, so there is one destination and one code path. */
          '<a class="cc-grid__link" href="' + esc(ROUTE.view(id, ROW_ID.noun)) + '"' +
            ' aria-label="' + esc(row.title) + '">' + media + '</a>' +
          '<label class="checkbox cc-grid__select">' +
            '<input type="checkbox" class="checkbox__input" data-select-row="' + esc(id) + '"' +
            (isSelected(row) ? ' checked' : '') +
            ' aria-label="Select ' + esc(ROW_ID.spoken) + ' ' + esc(row.title) + '">' +
            '<span class="checkbox__indicator"><i data-lucide="check" aria-hidden="true"></i></span>' +
          '</label>' +
          '<div class="cc-grid__actions">' + gridActions(row) + '</div>' +
        '</div>' +
        '<div class="cc-grid__text">' +
          '<p class="cc-grid__name" title="' + esc(row.title) + '">' + esc(row.title) + '</p>' +
          '<p class="cc-grid__meta">' + esc(row.format) + ' · ' + esc(row.created) + '</p>' +
        '</div>' +
      '</div></li>';
  }

  /* The live card's hover bar is a checkbox and THREE icons, not one
     (designer, 2026-09-22 — `.MediaButtons` in MediaLightbox.cfm):

       View Album     MediaLibraryAlbumViewIcon   — go to the section holding it
       Slideshow      MEDIALIBRARYSLIDESHOWICON   — open it in the lightbox
       Edit Details   MediaLibraryEditIcon        — open the edit form

     All three are Button at `btn--icon btn--xs` (24x24, 12px icon), TERTIARY
     (designer, 2026-09-22). The first build used secondary on the reasoning
     that these sit on a photograph and need a fill — which had it exactly
     backwards: `--ai-btn-secondary-bg` is `rgba(0,0,0,0)` in every mode, so
     secondary was a bordered box with NO fill over the picture, while
     `--ai-btn-tertiary-bg` is solid under the CC brand (#e7edf0 light,
     #334155 dark). Checked the resolved values this time instead of reasoning
     from the names.

     Live's own conditions are kept rather than showing three unconditionally:
     Slideshow is `ImageYN`-gated there, so a PDF gets two. View Album is gated
     to a search result — the item's section differing from the one being
     browsed — which this prototype has no Browse mode to express, so it shows
     always.
     TODO(backend:Listing) media-card-actions: View Album and Slideshow go
     nowhere; Edit shares the row route. */
  function gridActions(row) {
    var btn = 'btn btn--tertiary btn--icon btn--xs cc-grid__action';
    var out = '<a class="' + btn + '" href="#" data-backend-todo="media-card-actions"' +
      ' aria-label="View the album holding ' + esc(row.title) + '">' +
      '<i data-lucide="folder-open" aria-hidden="true"></i></a>';

    if (row.family === 'image') {
      out += '<a class="' + btn + '" href="#" data-backend-todo="media-card-actions"' +
        ' aria-label="Open ' + esc(row.title) + ' in the slideshow">' +
        '<i data-lucide="expand" aria-hidden="true"></i></a>';
    }

    out += '<a class="' + btn + '" href="' + esc(ROUTE.edit(rowId(row), ROW_ID.noun)) + '"' +
      ' data-backend-todo="listing-row-routes"' +
      ' aria-label="Edit ' + esc(ROW_ID.spoken) + ' ' + esc(row.title) + '">' +
      '<i data-lucide="pencil" aria-hidden="true"></i></a>';
    return out;
  }

  function renderGrid(rows) {
    if (!rows.length) {
      return '<li class="cc-grid__empty"><div class="cc-listing__empty">' +
        '<i data-lucide="search-x" aria-hidden="true"></i>' +
        '<p class="cc-listing__empty-title">No results</p>' +
        '<p class="cc-listing__empty-text">Try removing a filter or searching for something else.</p>' +
        '</div></li>';
    }
    return rows.map(gridCard).join('');
  }

  /* The selection bar. One bar for both views, shown only when something is
     ticked — the live screen keeps a permanent "Select all" above the grid and
     a permanent action row below it, which is two pieces of chrome for a state
     that is usually empty.
     TODO(backend:Listing) listing-bulk-actions: Move and Delete do nothing. */
  /* The actions are per-screen, like `headerActions` and `layouts`, because
     each live screen declares its own set — and they are all SELECTS plus one
     commit button, which is live's own model: `directAction` renders as a
     select of verbs beside an "Action" submit, and Orders adds two more
     selects alongside it.

     Five verbs as five buttons was the first cut and it was wrong (designer,
     2026-09-22): it wrapped to four rows on a phone, and a row of five
     equal-weight buttons gives no clue that Delete is not Copy. One select
     costs one tap to open and reads the same at every width.

     The label repeats as the first menu row, which is how the live selects
     work — `<option value="">Change Status</option>` heads each one — so
     picking it again is how you unset. */
  function renderBulkActions(config) {
    var acts = config.bulkActions || [];
    if (!acts.length) return '';

    var html = acts.map(function (a) {
      return '<div class="sel cc-listing__selection-select" data-sel' +
        ' data-bulk-select="' + esc(a.label) + '">' +
        '<button class="sel__control sel__control--sm" type="button" data-sel-trigger' +
          ' aria-label="' + esc(a.label) + '">' +
          '<span class="sel__value">' + esc(a.label) + '</span>' +
          '<span class="sel__chevron"><i data-lucide="chevron-down" aria-hidden="true"></i></span>' +
        '</button>' +
        '<ul class="sel__menu" role="listbox" aria-label="' + esc(a.label) + '">' +
          '<li><button type="button" class="sel__menu-item" role="option">' +
            esc(a.label) + '</button></li>' +
          (a.options || []).map(function (o) {
            return '<li><button type="button" class="sel__menu-item" role="option">' +
              esc(o) + '</button></li>';
          }).join('') +
        '</ul></div>';
    }).join('');

    /* Disabled until something is chosen — the whole point of a commit button
       is that the destructive step is deliberate, and one that is always live
       is just a second click.
       TODO(backend:Listing) listing-bulk-actions: Apply does nothing. */
    return html + '<button type="button" class="btn btn--primary btn--sm"' +
      ' data-selection-apply disabled>Apply</button>';
  }

  /* What each select currently holds, or null when it is still showing its own
     label. Reading the rendered value rather than keeping a parallel store:
     Select.js owns that text, and a second copy of it would be the thing that
     drifts. */
  function bulkValues(root) {
    var out = {};
    root.querySelectorAll('[data-bulk-select]').forEach(function (sel) {
      var label = sel.getAttribute('data-bulk-select');
      var shown = sel.querySelector('.sel__value').textContent.trim();
      out[label] = shown === label ? null : shown;
    });
    return out;
  }

  /* The header box reflects the PAGE, not the whole selection: it is checked
     when every row on screen is ticked. There is no indeterminate state —
     Checkbox has no Figma variant for one, and inventing a dash glyph is not
     this change's to make. Flagged rather than faked. */
  function refreshSelectAll(root) {
    /* Scoped to the listing's own head — the pickers render their own tables
       inside this same root. */
    var all = root.querySelector('[data-listing-head] [data-listing-select-all]');
    if (!all) return;
    var boxes = root.querySelectorAll('[data-listing-body] [data-select-row]');
    all.checked = boxes.length > 0 &&
      Array.prototype.every.call(boxes, function (b) { return b.checked; });
  }

  function refreshApply(root) {
    var apply = root.querySelector('[data-selection-apply]');
    if (!apply) return;
    var v = bulkValues(root);
    apply.disabled = !Object.keys(v).some(function (k) { return v[k]; });
  }

  /* Put every select back to its label. Called when the selection is cleared
     or emptied — leaving "Delete" sitting in a select after the rows it
     applied to have gone is an accident waiting for the next tick. */
  function resetBulk(root) {
    root.querySelectorAll('[data-bulk-select]').forEach(function (sel) {
      sel.querySelector('.sel__value').textContent = sel.getAttribute('data-bulk-select');
      sel.querySelectorAll('.sel__menu-item').forEach(function (i) {
        i.classList.remove('sel__menu-item--selected');
        i.removeAttribute('aria-selected');
        var check = i.querySelector('[data-lucide], svg');
        if (check) check.remove();
      });
    });
    refreshApply(root);
  }

  function renderSelection(root, config) {
    var bar = root.querySelector('[data-listing-selection]');
    if (!bar) return;
    var n = Object.keys(SELECTED).length;
    var was = bar.hidden;
    var hold = holdScrollAcross(bar);
    bar.hidden = n === 0 || !(config.bulkActions || []).length;
    hold();
    syncSelectionStuck();
    if (bar.hidden) { if (!was) resetBulk(root); return; }
    var count = bar.querySelector('[data-selection-count]');
    if (count) count.textContent = n + (n === 1 ? ' item selected' : ' items selected');
  }

  /* Keep the rows still when the selection bar appears or goes (designer,
     2026-09-23). The bar is IN FLOW above the table, so showing it pushes
     everything below it down by its height — 49px at desktop, 133px where it
     wraps — and the row you just ticked would jump away from the pointer.

     Chrome already prevents that with CSS scroll anchoring: measured, the
     rows hold still with or without this function. It is for browsers that do
     not anchor. With `overflow-anchor: none` forced on the scroller the row
     moved 49px; with this function it moved 0, on tick and on Clear.

     Call before the change; call the returned function after it. It measures
     the first visible element after the bar and, if that moved, scrolls by
     exactly the same amount. Measuring the actual movement rather than
     assuming the bar's height is what stops it double-correcting where the
     browser has already anchored.

     Only while the bar's slot is ABOVE the viewport — i.e. you are scrolled
     into the table. With the top of the table on screen the bar appearing in
     place is the intended reveal, and scrolling there would push the toolbar
     out of view instead. */
  function holdScrollAcross(bar) {
    var scroller = bar.closest('.cc-control__page');
    var anchor = bar.nextElementSibling;
    while (anchor && !anchor.getClientRects().length) anchor = anchor.nextElementSibling;
    if (!scroller || !anchor) return function () {};

    var edge = scroller.getBoundingClientRect().top + scroller.clientTop;
    var before = anchor.getBoundingClientRect().top;
    if (before >= edge) return function () {};

    return function () {
      var moved = anchor.getBoundingClientRect().top - before;
      if (moved) scroller.scrollTop += moved;
    };
  }

  /* Replaced by watchSelectionStuck once the scroller is known; a no-op until
     then, so renderSelection can call it unconditionally. */
  var syncSelectionStuck = function () {};

  /* Shadow on the selection bar only while it is PINNED under the CC header.
     The bar is `position: sticky` (ListingScreen.css); CSS alone cannot tell a
     stuck sticky from one resting in the flow, so this compares the bar's top
     with the scroller's. They coincide exactly when it is pinned — at rest the
     bar sits below the page padding, and once the table has scrolled past its
     end the bar goes up with it, above the edge.

     Measured against `.cc-control__page`, which is what actually scrolls (the
     chrome is outside it), and re-checked on scroll, on a resize of the
     scroller, and whenever the bar is shown or hidden. */
  function watchSelectionStuck(root) {
    var bar = root.querySelector('[data-listing-selection]');
    var scroller = root.closest('.cc-control__page');
    if (!bar || !scroller) return;

    var queued = false;
    function sync() {
      queued = false;
      var edge = scroller.getBoundingClientRect().top + scroller.clientTop;
      var stuck = !bar.hidden && scroller.scrollTop > 0 &&
        Math.abs(bar.getBoundingClientRect().top - edge) < 1;
      bar.classList.toggle('cc-listing__selection--stuck', stuck);
    }
    function queue() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(sync);
    }

    scroller.addEventListener('scroll', queue, { passive: true });
    if (typeof ResizeObserver === 'function') new ResizeObserver(queue).observe(scroller);
    syncSelectionStuck = queue;
    queue();
  }

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

    var gridHost = root.querySelector('[data-listing-grid]');
    if (gridHost) gridHost.innerHTML = renderGrid(rows);

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
    /* The body was just rebuilt, so the column marks went with it. */
    applyColumnVisibility(root, config);
    fitColumns(root, config);
    refreshSelectAll(root);
    renderSelection(root, config);
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
          '<span class="checkbox__label"><span class="checkbox__label-text">' + esc(col.label) + '</span></span>' +
        '</label>' +
      '</div>';
    }).join('');

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
    placeRoomHeading(root, config);
  }

  /* Divide the list where the columns stop fitting.

     The fit fills in order, so everything with no room is the TAIL of the
     list — one heading at the cut says it once, where a note on every row said
     it up to sixteen times. It is the same `dropdown__label` as the "Columns"
     heading above it.

     The heading is PLACED rather than the list regrouped, so the rows keep
     their order and dragging across the heading means what it looks like it
     means: above the line is shown, below it is not. */
  function placeRoomHeading(root, config) {
    var host = document.querySelector('[data-listing-columns]');
    if (!host) return;

    var existing = host.querySelector('[data-column-heading]');
    if (existing) existing.remove();

    var heads = root.querySelectorAll('[data-listing-head] th');
    var firstOut = null;
    config.columns.forEach(function (col, i) {
      if (firstOut || !col.label) return;
      if (heads[i] && heads[i].classList.contains('datatables__col--nofit')) firstOut = col.key;
    });
    if (!firstOut) return;

    var row = host.querySelector('[data-column-row="' + firstOut + '"]');
    if (!row) return;

    var heading = document.createElement('p');
    heading.className = 'dropdown__label cc-listing__column-heading';
    heading.setAttribute('data-column-heading', '');
    heading.textContent = 'No room at this width';
    row.parentNode.insertBefore(heading, row);
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

  /* ── Adaptive column fill ─────────────────────────────────
     Show as many columns as the table can actually hold, in order, with no
     gap left where the next one would have fitted.

     CSS cannot do this. A container query can only reveal a column at a width
     chosen in advance, so between two steps the table always carried dead
     space — ~400px on a 780px table, room for two more columns. Deciding what
     fits means knowing how wide each column WANTS to be, which only layout can
     answer. This is the case CLAUDE.md §4a allows JS for, and it is driven by
     a ResizeObserver rather than a media query because the CC sidebar changes
     this width with no window resize at all.

     Column ORDER is the priority order, so the Edit Columns drag handle is
     also the control for "show me this one first". */

  /* THE LISTING'S OWN datatable, never a picker's.
     A Multi Select Table picker contains a `.datatables` of its own, and it
     lives in the filter bar — which comes FIRST in the DOM. So
     `root.querySelector('.datatables__body')` returned the picker's body the
     moment a Catalogue Item chip existed, and the column fit measured against
     it: 623px while the picker was open, 0 when it was closed. The listing
     collapsed from nine columns to six with the slack pooling in whatever
     column could take it.

     Anchored on `[data-listing-body]`, which only the listing's table has. */
  function listingTable(root) {
    var tbody = root.querySelector('[data-listing-body]');
    if (!tbody) return null;
    return {
      table: tbody.closest('table'),
      body: tbody.closest('.datatables__body'),
      datatable: tbody.closest('.datatables')
    };
  }

  /* Natural width of every column, read with all of them present. The table
     overflows during the pass, which is what makes each column report the
     width it actually wants rather than a share of the container. It all
     happens in one task, so the browser never paints it. */
  function measureColumns(root, config) {
    var heads = root.querySelectorAll('[data-listing-head] th');
    var parts = listingTable(root);
    var table = parts && parts.table;
    var shown = [];

    /* Drop the widths this function's own last run wrote, FIRST.
     *
     * Under fixed layout `sizeColumns` leaves an inline width on every th. Left
     * in place, the next measure reads those back as the columns' "natural"
     * widths — the pass measures its own output, not the content. Each re-fit
     * then starts from a narrower table than the last, so on a resize the
     * columns walk off one by one and never come back. */
    for (var c = 0; c < heads.length; c++) heads[c].style.width = '';

    /* Show the BODY cells for the pass as well, not just the headers.
     *
     * This is what made the select, edit and kebab columns come out cropped.
     * `--measuring` was added to the th only, so during the pass the header row
     * had all fourteen cells while the body rows had only the eight that were
     * not `--nofit`. A table lays out one column structure for both, so the
     * eight visible body cells were assigned to the first eight header slots —
     * the kebab's cell measured under "Publish Start" and reported 155px, the
     * pencil's 96px. Every structural column's measurement was somebody else's.
     *
     * A column switched off in Edit Columns stays off in both rows: that one is
     * a user decision, not a fit, and it must not be measured back into view. */
    var bodyRows = root.querySelectorAll('[data-listing-body] tr.datatables__row');
    config.columns.forEach(function (col, i) {
      if (!heads[i] || config.hiddenColumns.indexOf(col.key) !== -1) return;
      heads[i].classList.add('datatables__col--measuring');
      shown.push(heads[i]);
      bodyRows.forEach(function (tr) {
        var cell = tr.children[i];
        if (cell) { cell.classList.add('datatables__col--measuring'); shown.push(cell); }
      });
    });
    /* The paired DETAIL rows take no part in the measurement. Each is a single
       cell spanning every column, so at max-content it hands its own width
       demand to all of them — a measurement of the panel, not of the columns.
       Hidden ones contribute nothing anyway; this is for the open ones. */
    var details = root.querySelectorAll('[data-listing-body] tr.datatables__row-detail');
    details.forEach(function (tr) { tr.classList.add('datatables__row-detail--measuring'); });

    /* Without this the table stays at container width, twenty columns
       over-constrain it, and every column reports MIN-content — 74px for a
       column that renders at 125px, so the fit lets two more columns in than
       actually fit. */
    if (table) table.classList.add('datatables__table--measuring');

    /* Measure the HEADER and a BODY cell, and take the larger.
     *
     * The header alone is not the column: the select, edit and kebab headers
     * are EMPTY, so they measured 16-20px while the 32px control beneath them
     * needs about 48 — and under fixed layout a column gets exactly what it is
     * given, so those three were cropped (designer, 2026-09-21). Under auto
     * layout the browser silently corrected for the body cells; once the
     * widths are ours to write, the measurement has to look where the content
     * actually is.
     *
     * One body row is enough: every row of a column holds the same kind of
     * thing, and the widest VALUE is already accounted for by the max-content
     * pass this runs inside. */
    var firstRow = root.querySelector('[data-listing-body] tr.datatables__row');
    var natural = config.columns.map(function (col, i) {
      var w = heads[i] ? heads[i].getBoundingClientRect().width : 0;
      var cell = firstRow ? firstRow.children[i] : null;
      if (cell) w = Math.max(w, cell.getBoundingClientRect().width);
      return w;
    });

    details.forEach(function (tr) { tr.classList.remove('datatables__row-detail--measuring'); });
    if (table) table.classList.remove('datatables__table--measuring');
    shown.forEach(function (el) { el.classList.remove('datatables__col--measuring'); });
    return natural;
  }

  function fitColumns(root, config) {
    var parts = listingTable(root);
    var body = parts && parts.body;
    var heads = root.querySelectorAll('[data-listing-head] th');
    if (!body || !heads.length) return;

    var natural = measureColumns(root, config);
    var available = body.clientWidth;
    var used = 0;
    var identity = 0;
    var full = false;
    var hidden = {};

    config.columns.forEach(function (col, i) {
      if (config.hiddenColumns.indexOf(col.key) !== -1) return;   // off: costs nothing

      /* The checkbox, edit and kebab columns are structure — always present
         and always part of the budget, EXCEPT when a container query has taken
         one out (the pencil, on a phone). Charging the budget for a column
         that is not drawn would cost a real column its place at some width;
         the measuring pass forces every column visible, so this has to be read
         back afterwards rather than from the measurement. */
      if (!col.label) {
        if (heads[i] && window.getComputedStyle(heads[i]).display === 'none') return;
        used += natural[i];
        return;
      }

      /* The leading columns identify a row and are shown even if they do not
         fit; a table of anonymous values is worse than one that scrolls.
         HOW MANY is per screen. Orders' two are an order number and a name,
         which fit a phone together. Articles' two would be Title and Section,
         both long free text, and forcing both overflowed a 309px table by
         31px — pushing the kebab, the only route to the other columns, off
         the edge. One identity column is the honest answer there. */
      identity += 1;
      if (identity <= (config.identityColumns || 2)) { used += natural[i]; return; }

      /* Stop at the FIRST column that does not fit rather than skipping to a
         narrower one further down — order is priority, and a table that shows
         column 8 but not column 5 reads as a bug. */
      if (full || used + natural[i] > available) {
        full = true;
        hidden[col.key] = true;
        return;
      }
      used += natural[i];
    });

    function apply() {
      config.columns.forEach(function (col, i) {
        var off = !!hidden[col.key];
        if (heads[i]) heads[i].classList.toggle('datatables__col--nofit', off);
        root.querySelectorAll('[data-listing-body] tr.datatables__row').forEach(function (tr) {
          var cell = tr.children[i];
          if (cell) cell.classList.toggle('datatables__col--nofit', off);
        });
      });
    }
    apply();

    /* Verify, then correct. A column's measured width is what it wants on its
       own; put beside different neighbours it can round or reflow a few pixels
       wider, which left the table ~13px over at one width. Rather than pad the
       budget with a tolerance — a number that would be wrong at some other
       width — the fit checks the result it actually produced and drops the
       last column until the table fits.

       Bounded by the number of columns, and it never removes the two that
       identify a row. */
    var table = parts.table;
    var guard = config.columns.length;
    while (table && guard-- > 0 && table.getBoundingClientRect().width > available + 1) {
      var last = null;
      var seen = 0;
      config.columns.forEach(function (col) {
        if (!col.label || hidden[col.key] || config.hiddenColumns.indexOf(col.key) !== -1) return;
        seen += 1;
        if (seen > 2) last = col.key;
      });
      if (!last) break;
      hidden[last] = true;
      apply();
    }

    /* The widths, now that the SET is settled.
     *
     * Under `table-layout: fixed` the browser stops deciding: every visible
     * column has to be given a width, and what content wants no longer enters
     * into it. That is the whole point — a cell can no longer widen its column,
     * so text follows the column instead of the column following the text.
     *
     * The distribution reads the same three roles the CSS used to express as
     * behaviours:
     *   hug / structural — its measured natural width, as before
     *   snug             — its natural width, capped so one long enumerated
     *                      value cannot take half the table
     *   fluid            — everything left over, and never below its floor
     *
     * Any rounding remainder goes to the fluid column, so the widths sum to
     * the table exactly and there is no gap at the right-hand edge. That
     * property used to be the browser's to keep; it is arithmetic now. */
    sizeColumns(root, config, natural, hidden, available);

    /* Last, so it sees the fit that actually survived the correction loop. */
    syncRowDetail(root, config);
  }

  var SNUG_MAX = 224;          // px — a snug column's ceiling, see sizeColumns
  var SNUG_MIN = 128;          // px — and its floor, so a chip is never cropped
  var FLUID_MIN = 192;         // px — matches --ai-size-3, the Customer floor

  /* Hand `spare` out in equal shares to the columns that can use it — the
     fluid one and the snug ones — and return whatever is left for the fluid
     column to absorb.

     Water-filling, because a snug column has a ceiling: everyone gets an equal
     slice, anyone who hits SNUG_MAX takes only what fits and drops out, and the
     rest is shared again among those still growing. Loops at most once per
     column. The fluid column has no ceiling, so it is always still growing and
     the remainder always has somewhere to go — which is what keeps the widths
     summing to the table exactly, with no gap at the right-hand edge. */
  function shareSpare(config, width, hidden, fluidAt, spare) {
    var open = [];
    config.columns.forEach(function (col, i) {
      if (!width[i] || hidden[col.key]) return;
      if (i === fluidAt || col.snug) open.push(i);
    });
    /* Only the fluid column can grow — nothing to share. */
    if (open.length < 2) return spare;

    var guard = open.length;
    while (spare > 0 && open.length > 1 && guard-- > 0) {
      var share = Math.floor(spare / open.length);
      if (share < 1) break;                      // sub-pixel: let fluid take it
      var still = [];
      open.forEach(function (i) {
        if (i === fluidAt) { still.push(i); return; }   // no ceiling
        var room = SNUG_MAX - width[i];
        var take = Math.min(share, Math.max(room, 0));
        if (take > 0) { width[i] += take; spare -= take; }
        if (take >= share) still.push(i);               // still has headroom
      });
      open = still;
    }
    return spare;
  }

  function sizeColumns(root, config, natural, hidden, available) {
    var heads = root.querySelectorAll('[data-listing-head] th');
    var fluidAt = -1;
    var used = 0;
    var width = [];
    /* The fluid floor comes off on a phone, exactly as the CSS rule it
       replaces did (`@container (max-width: 400px)`): below that the table
       cannot honour a 192px floor AND the columns that identify a row, and
       what it loses by trying is the kebab — the one control that reaches
       everything else. Measured before this: 88px over at a 239px table. */
    var fluidFloor = available < 400 ? 0 : FLUID_MIN;

    config.columns.forEach(function (col, i) {
      if (!heads[i] || hidden[col.key] || config.hiddenColumns.indexOf(col.key) !== -1) {
        width[i] = 0;
        return;
      }
      var w = Math.ceil(natural[i]);
      if (col.snug) w = Math.min(w, SNUG_MAX);
      /* The LAST fluid column. There is normally one.
         Its base is its NATURAL width, the same as every other column, not its
         floor. Basing it on the floor and then sharing the surplus equally made
         the main column the NARROWEST text column on the screen — 193px of
         Title beside 216px of Section — because everyone else started from
         what their content wanted and it started from 192. It still absorbs
         the rounding remainder and still gives width back first when the table
         is over budget; what changed is only where it starts from. */
      if (!col.hug && !col.snug && col.label) { fluidAt = i; w = Math.max(w, fluidFloor); }
      width[i] = w;
      used += w;
    });

    if (fluidAt !== -1) {
      var spare = available - used;
      if (spare > 0) {
        /* Spare width is SHARED, not handed to the fluid column (designer,
           2026-09-22). Giving it all to one column is what left a 555px table
           with a 331px Title beside a 78px Type — the title's own text ran out
           long before its column did, so the row read as one wide column and
           then a huddle on the right.

           Equal shares, not proportional ones: proportional keeps the widest
           column widest, which is the thing being complained about.

           `hug` columns stay out of it on purpose. They are shrink-wrapped by
           role — a date, an ID, a count — and their content is a fixed shape
           that gains nothing from more room. */
        width[fluidAt] += shareSpare(config, width, hidden, fluidAt, spare);
      } else if (spare < 0) {
        /* Over budget. Under fixed layout the table is exactly the sum of
           these numbers, so anything left over is not "a bit of overflow" —
           it is a horizontal scrollbar. Take it off the fluid column first,
           down to its floor, then off the snug ones from the right, which are
           the ones that truncate anyway. Measured before this: 13-18px over at
           three widths. */
        var owed = -spare;
        var give = Math.min(owed, width[fluidAt] - fluidFloor);
        if (give > 0) { width[fluidAt] -= give; owed -= give; }
        for (var k = config.columns.length - 1; k >= 0 && owed > 0; k--) {
          if (!width[k] || !config.columns[k].snug) continue;
          /* …but never below what a snug column can usefully show. Taken too
             far, the account/section chip in it gets cropped rather than
             ellipsised — 128px keeps a chip legible and is the same floor the
             picker's own columns use. */
          var take = Math.min(owed, width[k] - Math.min(SNUG_MIN, width[k]));
          if (take > 0) { width[k] -= take; owed -= take; }
        }
      }
    } else {
      /* No fluid column on this screen: widen the last snug one rather than
         leave the table short of its container. */
      for (var j = config.columns.length - 1; j >= 0; j--) {
        if (width[j] > 0 && config.columns[j].label) {
          var left = available - used;
          if (left > 0) width[j] += left;
          break;
        }
      }
    }

    config.columns.forEach(function (col, i) {
      if (!heads[i]) return;
      heads[i].style.width = width[i] ? width[i] + 'px' : '';
    });

    /* Keep the detail row's colspan to the columns that are actually SHOWING.
     *
     * A `colspan` declares that many column slots exist. With the full column
     * count, opening a row's panel brought back every hidden column as a real
     * slot — and under fixed layout each one then took its assigned width out
     * of the table. Below 1024px, where the pencil column is hidden by the
     * device rule, that left a 44px gap at the end of every row the moment a
     * panel opened. Above it the pencil is visible, which is exactly why this
     * only ever showed on the narrow side (designer, 2026-09-21).
     *
     * Read from the computed display rather than from the fit's own bookkeeping
     * because three different things hide a column here — the fit, Edit
     * Columns, and a media query — and only the browser knows about all
     * three. */
    var showing = 0;
    for (var v = 0; v < heads.length; v++) {
      if (window.getComputedStyle(heads[v]).display !== 'none') showing += 1;
    }
    root.querySelectorAll('[data-listing-body] .cc-listing__empty-cell, [data-listing-body] .datatables__row-detail__cell')
      .forEach(function (cell) { cell.colSpan = showing || 1; });
  }

  /* Keep each row's detail list in step with the table.
   *
   * Read from the HEAD cells rather than recomputed: they already carry the
   * verdict for both reasons a column can be missing, so the detail row cannot
   * disagree with the table it is explaining.
   *
   *   --nofit  no room at this width   -> belongs in the detail row
   *   --off    switched off in Edit Columns -> does NOT. The user said they did
   *            not want it; repeating it behind the kebab would hand it back.
   */
  function syncRowDetail(root, config) {
    var heads = root.querySelectorAll('[data-listing-head] th');
    var show = {};
    var any = false;
    config.columns.forEach(function (col, i) {
      var th = heads[i];
      if (!col.label || !th) return;
      var missing = th.classList.contains('datatables__col--nofit') &&
                    !th.classList.contains('datatables__col--off');
      show[col.key] = missing;
      if (missing) any = true;
    });
    root.querySelectorAll('[data-listing-body] .datatables__detail-item').forEach(function (el) {
      el.hidden = !show[el.getAttribute('data-detail-col')];
    });
    root.querySelectorAll('[data-listing-body] .datatables__detail-empty').forEach(function (el) {
      el.hidden = any;
    });
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
    /* The trigger's LABEL is static markup reading "20", and until Media Items
       every screen happened to open on 20 so nothing showed. It opens on 25,
       and the table dutifully rendered 25 rows under a control claiming 20.
       Set from the config at init, not only when the value changes — the
       fourth per-screen value found living in the shared template. */
    var label = document.querySelector('[data-listing-per-page]');
    if (label) label.textContent = config.perPage;

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
    /* Split once, here, rather than capping at render time: everything
       downstream — adding a filter, saving a view, restoring one — then works
       on the real arrays and never has to know about the limit. */
    /* A fresh screen starts with nothing ticked. Module state, so it has to be
       cleared here rather than relying on it never having been set. */
    SELECTED = {};

    /* Before the first cell is rendered: the CELL renderers read ROW_ID. */
    /* Two nouns, because they are read by different things: `routeNoun` is a
       URL slug and `rowNoun` is what a screen reader says out loud. Article
       Archive's slug is "archived-item" and announcing "Edit archived-item
       5361" puts a hyphen in the middle of a spoken phrase. */
    ROW_ID = {
      key: config.rowKey || 'orderNo',
      noun: config.routeNoun || 'order',
      spoken: config.rowNoun || config.routeNoun || 'order'
    };

    var defaults = (config.defaultFilters || []).slice();
    var overflow = defaults.splice(DEFAULT_CHIPS);

    config = Object.assign({}, config, {
      /* The screen's own chips. Fixed — these cannot be taken off the bar. */
      baseFilters: defaults,
      /* Everything else, as a STABLE catalogue. Filters no longer move out of
         this list when added: More Filters is where you both add and remove,
         so an added one stays listed and shows as already on the bar. */
      moreFilters: overflow.concat(config.moreFilters || []),
      /* Names the user has added, in the order they added them. */
      added: [],
      /* Derived: baseFilters + added. Rebuilt by rebuildFilters(). */
      defaultFilters: defaults.slice(),
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

    /* A chip can OPEN with a value. Orders and Articles both open empty, but
       Article Archive's "Filter by" ships ticked as Section + Article and its
       Type ships as Article — those are the live screen's own defaults
       (`<cfparam name="FilterType" default="Section,Article">`, Type 1), not
       a convenience. Seeded here rather than in the chip renderer so the
       FilterBar's save-view baseline below counts them as the starting point
       and does not offer to save a view the screen opened on. */
    config.baseFilters.concat(config.moreFilters).forEach(function (f) {
      if (f.defaultValues && f.defaultValues.length) {
        config.filterValues[f.name] = f.defaultValues.slice();
      }
    });

    /* Demo persistence, read before the first paint so the table is never
       drawn in one layout and then rearranged into another. */
    var screenKey = root.getAttribute('data-listing') || 'listing';
    var stored = loadState(screenKey);
    if (!stored.views) stored.views = {};
    if (!stored.viewOrder) stored.viewOrder = [];

    function persist() { saveState(screenKey, stored); }

    if (stored.columns && stored.columns.order) {
      /* Ordered by the stored list, then anything it does not mention.
         A column ADDED to the screen since the layout was saved must still
         appear — dropping it would make a stale preference hide new data,
         which is the failure mode that makes people distrust saved layouts. */
      var byKey = {};
      config.columns.forEach(function (c) { byKey[c.key] = c; });
      var ordered = stored.columns.order.map(function (k) { return byKey[k]; }).filter(Boolean);
      var seen = {};
      ordered.forEach(function (c) { seen[c.key] = true; });
      config.columns = ordered.concat(config.columns.filter(function (c) { return !seen[c.key]; }));
      /* Only keys the screen still has: a hidden column that no longer exists
         is noise, and would keep the list growing for ever. */
      config.hiddenColumns = (stored.columns.hidden || []).filter(function (k) { return byKey[k]; });
    }

    /* Header actions, per screen.
     *
     * The listing header has been a bare title since Pass 1 — true of the
     * screens Figma draws — but the CCHeader pattern has always carried an
     * actions cluster (4105:3640), and Articles wants the primary Add from it
     * (designer, 2026-09-21). Declared in the screen's config rather than
     * written into the page, so the next screen that needs one is a config
     * entry like everything else here.
     *
     * The pattern owns the behaviour: `.cc-header__actions` collapses a
     * text+icon button to a 32px icon-only square on a narrow header, and
     * `__btn-label` is the span it hides to do it. Nothing to add for that.
     *
     * TODO(backend:Listing) listing-header-actions: Add goes nowhere — it
     * wants the screen's "new record" route, the sibling of listing-row-routes.
     */
    var headerActions = config.headerActions || [];
    if (headerActions.length) {
      var header = document.querySelector('.cc-header');
      if (header) {
        var slot = header.querySelector('.cc-header__actions');
        if (!slot) {
          slot = document.createElement('div');
          slot.className = 'cc-header__actions';
          header.appendChild(slot);
        }
        slot.innerHTML = headerActions.map(function (a) {
          return '<button type="button" class="btn btn--' + esc(a.variant || 'primary') + '"' +
            ' data-backend-todo="listing-header-actions">' +
            (a.icon ? '<i data-lucide="' + esc(a.icon) + '" aria-hidden="true"></i>' : '') +
            '<span class="cc-header__btn-label">' + esc(a.label) + '</span></button>';
        }).join('');
        if (window.lucide) window.lucide.createIcons();
      }
    }

    var bar = root.querySelector('.filter-bar');

    renderPerPageOptions(config);

    /* ── Layout: listing or grid ──────────────────────────
       Only a screen that declares `layouts` gets the switch; the other three
       have one rendering and no control. The live screen defaults to GRID
       (`<cfparam name="url.MediaLayOut" default="Grid">`) — this defaults to
       LISTING because that is what the demo card is named and what a reviewer
       arriving from the index expects, and `?layout=grid` lands directly on
       the other half. Recorded rather than silently diverged from. */
    var layouts = config.layouts || [];
    var urlLayout = (new RegExp('[?&]layout=(grid|listing)').exec(location.search) || [])[1];
    config.layout = (layouts.indexOf(urlLayout) !== -1 ? urlLayout : layouts[0]) || 'listing';

    function applyLayout() {
      root.setAttribute('data-layout', config.layout);
      var group = root.querySelector('[data-listing-layout]');
      if (group) {
        group.querySelectorAll('[data-layout-value]').forEach(function (btn) {
          var on = btn.getAttribute('data-layout-value') === config.layout;
          btn.classList.toggle('seg-control__btn--active', on);
          btn.setAttribute('aria-checked', on ? 'true' : 'false');
        });
      }
      /* Edit Columns is meaningless in a grid — there are no columns. */
      var cols = root.querySelector('.cc-listing__columns');
      if (cols) cols.hidden = config.layout !== 'listing';
    }

    if (layouts.length > 1) {
      var group = root.querySelector('[data-listing-layout]');
      if (group) {
        group.hidden = false;
        group.addEventListener('click', function (e) {
          var btn = e.target.closest('[data-layout-value]');
          if (!btn) return;
          var next = btn.getAttribute('data-layout-value');
          if (next === config.layout) return;
          config.layout = next;
          applyLayout();
          /* The table only measures correctly once it is on screen again. */
          if (next === 'listing') fitColumns(root, config);
        });
      }
    }
    applyLayout();

    /* Selection — one model, both views. A checkbox exists in the table row
       and on the grid card; either can tick a row and both must agree, which
       is why this listens on the whole screen rather than per view. */
    root.addEventListener('change', function (e) {
      var box = e.target.closest('[data-select-row]');
      if (!box) return;
      var id = box.getAttribute('data-select-row');
      if (box.checked) SELECTED[id] = true; else delete SELECTED[id];
      /* Keep the OTHER view's checkbox for this row in step without a full
         re-render, which would lose scroll position mid-click. */
      root.querySelectorAll('[data-select-row="' + id + '"]').forEach(function (other) {
        other.checked = box.checked;
      });
      var card = root.querySelector('[data-grid-card="' + id + '"]');
      if (card) card.classList.toggle('cc-grid__card--selected', box.checked);
      refreshSelectAll(root);
      renderSelection(root, config);
    });

    /* Select all — every row on the CURRENT PAGE, which is what a header
       checkbox means in a paged table. It runs before the per-row handler
       above would see anything, so it drives the rows itself. */
    root.addEventListener('change', function (e) {
      var all = e.target.closest('[data-listing-select-all]');
      if (!all) return;
      root.querySelectorAll('[data-listing-body] [data-select-row]').forEach(function (b) {
        b.checked = all.checked;
        var id = b.getAttribute('data-select-row');
        if (all.checked) SELECTED[id] = true; else delete SELECTED[id];
        root.querySelectorAll('[data-select-row="' + id + '"]').forEach(function (o) {
          o.checked = all.checked;
        });
        var card = root.querySelector('[data-grid-card="' + id + '"]');
        if (card) card.classList.toggle('cc-grid__card--selected', all.checked);
      });
      renderSelection(root, config);
    });

    /* Rendered once: the set is per screen and does not change with the
       selection, only its visibility does. */
    var actionHost = root.querySelector('[data-selection-actions]');
    if (actionHost) {
      actionHost.innerHTML = renderBulkActions(config);
      /* Select.js binds at the document with delegation — one click listener
         matching `[data-sel-trigger]` — so a select inserted after it loaded
         works with no re-init. Only the icons need a second pass. */
      if (window.lucide) window.lucide.createIcons();
    }

    /* A screen with no bulk actions has nothing to select FOR, so the column
       goes too rather than leaving a checkbox that leads nowhere. */
    if (!(config.bulkActions || []).length) {
      config = Object.assign({}, config, {
        columns: config.columns.filter(function (c) { return c.type !== 'select'; })
      });
    }

    /* Select.js owns the pick and dispatches nothing, so this listens for the
       same click and re-reads the rendered value afterwards. `setTimeout 0`
       because both handlers are on the document: without it this reads the
       value Select.js has not written yet. */
    root.addEventListener('click', function (e) {
      if (!e.target.closest('[data-selection-actions] .sel__menu-item')) return;
      setTimeout(function () { refreshApply(root); }, 0);
    });

    var applyBtn = root.querySelector('[data-selection-apply]');
    if (applyBtn) applyBtn.addEventListener('click', function () {
      /* TODO(backend:Listing) listing-bulk-actions — one request carrying every
         set select, which is what live's single Action submit does: you can
         change status AND add to a list AND archive in one go. */
      resetBulk(root);
    });

    var clearBtn = root.querySelector('[data-selection-clear]');
    if (clearBtn) clearBtn.addEventListener('click', function () {
      resetBulk(root);
      SELECTED = {};
      root.querySelectorAll('[data-select-row]').forEach(function (b) { b.checked = false; });
      root.querySelectorAll('[data-grid-card]').forEach(function (c) {
        c.classList.remove('cc-grid__card--selected');
      });
      refreshSelectAll(root);
      renderSelection(root, config);
    });

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
    /* Picking a facet TOGGLES it. The facet stays in the panel either way, so
       the same click that put a filter on the bar takes it off again. */
    document.addEventListener('filter-bar:add-filter', function (e) {
      var name = e.detail && e.detail.name;
      if (config.added.indexOf(name) !== -1) { removeFilter(name); return; }

      var filter = config.moreFilters.filter(function (f) { return f.name === name; })[0];
      if (!filter) return;
      config.added.push(name);
      rebuildFilters();

      var host = document.querySelector('[data-listing-filters]');
      var addChip = host && host.querySelector('.filter-bar__add');
      var anchor = addChip && addChip.closest('.filter-bar__chip');
      if (!anchor) return;

      /* Spliced in rather than re-rendering the row, which would discard the
         selections already made on the other chips. */
      var holder = document.createElement('div');
      holder.innerHTML = chip(filter, '', '', config.filterValues[name] || []);
      var added = holder.firstChild;
      anchor.parentNode.insertBefore(added, anchor);

      markFacet(anchor.querySelector('.filter-item[data-filter-name="' +
        name.replace(/"/g, '\\"') + '"]'), true);

      /* Same contract the first render uses, scoped to just the new chip. */
      document.dispatchEvent(new CustomEvent('listing:rendered', { detail: { root: added } }));
      announceFilters();
    });


    /* `defaultFilters` is what the bar renders and what filtering looks names
       up in, so it is recomputed whenever the added set changes. */
    /* Adding or removing a chip changes the view, so the bar re-checks its
       Save view CTA. The chip list is already half of its signature, so it
       only needs prompting once the DOM has changed. */
    function announceFilters() {
      if (bar && typeof bar.refreshSaveView === 'function') bar.refreshSaveView();
    }

    function rebuildFilters() {
      var byName = {};
      config.moreFilters.forEach(function (f) { byName[f.name] = f; });
      config.defaultFilters = config.baseFilters.concat(
        config.added.map(function (n) { return byName[n]; }).filter(Boolean)
      );
    }

    /* Show a More Filters facet as on-the-bar or not. The chip keeps
       FilterItem's vocabulary: dashed-and-empty means "add me", solid means
       "already on the bar, click to take it off".

       TODO(design:Listing): Figma's FilterItem has no "already added" state —
       its leading slot is `+` when empty and `×` when it holds values. A check
       is the clearest thing to put there for this meaning, but it wants a real
       variant. */
    function markFacet(facet, on) {
      if (!facet) return;
      facet.classList.toggle('filter-item--empty', !on);
      facet.classList.toggle('filter-item--added', on);

      /* A facet is a BUTTON, not a chip with a picker of its own — it must
         never hold FilterItem's open state. FilterItem adds `--open` on every
         trigger click regardless, so a removed facet was left wearing the
         active palette with no tick: it looked switched on while being off.
         It alternated, because each click toggles that class, which is why it
         only showed up every other time. */
      facet.classList.remove('filter-item--open');
      var icon = facet.querySelector('.filter-item__add');
      if (!icon) icon = facet.querySelector('[data-lucide]');
      if (icon) {
        icon.setAttribute('data-lucide', on ? 'check' : 'plus');
        /* Lucide has already replaced <i> with <svg>; re-running it only
           rewrites elements that still carry the attribute, so the icon is
           reset to an <i> first. */
        var fresh = document.createElement('i');
        fresh.setAttribute('data-lucide', on ? 'check' : 'plus');
        /* getAttribute, not `.className`: by now Lucide has swapped the <i>
           for an <svg>, whose className is an SVGAnimatedString — assigning it
           stringifies to "[object SVGAnimatedString]" and the icon loses the
           class the CSS and the next toggle both look for. */
        fresh.setAttribute('class', icon.getAttribute('class') || 'filter-item__add');
        fresh.setAttribute('aria-hidden', 'true');
        icon.replaceWith(fresh);
      }
      var trigger = facet.querySelector('.filter-item__trigger');
      var label = facet.getAttribute('data-filter-name');
      if (trigger) {
        trigger.setAttribute('aria-pressed', on ? 'true' : 'false');
        trigger.setAttribute('aria-label', (on ? 'Remove ' : 'Add ') + label + ' filter');
        /* Same reason: it expands nothing. */
        trigger.setAttribute('aria-expanded', 'false');
      }
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    }

    function removeFilter(name) {
      var at = config.added.indexOf(name);
      if (at === -1) return;                       // a base filter cannot go
      config.added.splice(at, 1);
      delete config.filterValues[name];            // its filtering goes with it
      rebuildFilters();

      var host = document.querySelector('[data-listing-filters]');
      var wrap = host && host.querySelector('.filter-bar__chip .filter-item[data-filter-name="' +
        name.replace(/"/g, '\\"') + '"]');
      if (wrap) wrap.closest('.filter-bar__chip').remove();

      markFacet(document.querySelector('.filter-bar__panel .filter-item[data-filter-name="' +
        name.replace(/"/g, '\\"') + '"]'), false);

      config.page = 1;
      renderResults(root, config);
      announceFilters();
    }

    /* ── Saved views ─────────────────────────────────────────
       A view IS a filter set: which filters are on the bar, in what order,
       holding what values. The bar owns the list and its rows; the screen owns
       what a row MEANS, so the snapshot is kept here, keyed by the row element.

       TODO(backend:Listing): per-user and server-side in the real screen.
       localStorage stands in so the DEMO survives a reload.
         → POST /control/orders/views  { name, filters:[{name,values}] }
         → GET  /control/orders/views */
    var views = new WeakMap();

    /* The persisted mirror of that WeakMap, keyed by NAME — a row element does
       not survive a reload, and a name is what the user typed and what the
       eventual endpoint will key on too. Duplicate names collapse into one
       entry; the bar allows them and this is a demo store, so last-saved wins
       rather than growing a second identity scheme to prevent it. */
    function persistColumns() {
      stored.columns = {
        order: config.columns.map(function (c) { return c.key; }),
        hidden: config.hiddenColumns.slice()
      };
      persist();
    }

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
        /* The added NAMES, not the filter arrays — `moreFilters` is a fixed
           catalogue now, and `defaultFilters` is derived from these. */
        added: config.added.slice(),
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
      config.added = (snap.added || []).slice();
      rebuildFilters();
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
      if (!e.detail || !e.detail.view) return;
      var snap = snapshot();
      views.set(e.detail.view, snap);
      var name = e.detail.name || '';
      if (!name) return;
      if (stored.viewOrder.indexOf(name) === -1) stored.viewOrder.push(name);
      stored.views[name] = snap;
      persist();
    });

    /* The bar owns the row; this screen owns what the row MEANS, so a deleted
       or renamed row has to move the stored snapshot with it or the demo comes
       back with views that no longer exist. */
    document.addEventListener('filter-bar:delete-view', function (e) {
      var name = e.detail && e.detail.name;
      if (!name) return;
      delete stored.views[name];
      var at = stored.viewOrder.indexOf(name);
      if (at !== -1) stored.viewOrder.splice(at, 1);
      persist();
    });

    document.addEventListener('filter-bar:rename-view', function (e) {
      var from = e.detail && e.detail.from, to = e.detail && e.detail.to;
      if (!from || !to || !stored.views[from]) return;
      stored.views[to] = stored.views[from];
      delete stored.views[from];
      var at = stored.viewOrder.indexOf(from);
      if (at !== -1) stored.viewOrder[at] = to; else stored.viewOrder.push(to);
      persist();
    });

    /* Put the persisted views back on the bar. After `baseline` is taken, so
       restoring one still has the shipped listing to fall back to. */
    if (bar && typeof bar.addSavedView === 'function') {
      stored.viewOrder.forEach(function (name) {
        var snap = stored.views[name];
        if (!snap) return;
        var row = bar.addSavedView(name);
        if (row) views.set(row, snap);
      });
    }

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
        persistColumns();
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

    /* ── Opening a row ───────────────────────────────────────
       Clicking anywhere in the row opens the order's DETAIL view; the pencil
       opens the EDIT screen. Both are anchors, so the pencil needs no
       stopPropagation of its own — the guard below is what keeps them apart,
       and the same guard covers every other control a row contains: the select
       checkbox, the account chip, the kebab's label, and any link a cell adds
       later. A control inside a row owns its own click; only the gaps between
       them belong to the row.

       The row is a shortcut, not the only way in — the order number is a real
       link, which is what a keyboard reaches. */
    /* Say so in the markup, here rather than in the HTML: the class that makes
       a row LOOK clickable is added by the code that makes it clickable, so a
       datatable can never advertise an affordance it does not have. */
    var listing = listingTable(root);
    if (listing && listing.datatable) listing.datatable.classList.add('datatables--rows-clickable');

    root.addEventListener('click', function (e) {
      var tr = e.target.closest('tr.datatables__row');
      /* Listing rows only. A Multi Select Table picker has rows of its own in
         this same subtree; they are not `.datatables__row`, but anchoring on
         the listing's own body says so rather than relying on that. */
      if (!tr || !tr.closest('[data-listing-body]')) return;
      if (e.target.closest('a, button, label, input, select, textarea')) return;
      /* Let a text selection be a text selection. */
      var picked = window.getSelection && window.getSelection();
      if (picked && String(picked).length) return;

      var link = tr.querySelector('[data-row-link]');
      if (link) link.click();
    });

    /* Sorting. A second click on the same column reverses it; a first click
       on a new one starts descending, which is what people expect from a
       date or a value — the two things anyone sorts a listing by first. */
    root.addEventListener('click', function (e) {
      var btn = e.target.closest('.datatables__sort');
      if (!btn) return;
      /* A Multi Select Table has a Datatables of its own INSIDE the bar, so
         this handler sees its headers too. Sorting the picker is not sorting
         the listing. */
      if (e.target.closest('.filter-dropdowns')) return;
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

    /* ── A picker's own sub-filters ───────────────────────────
       The Multi Select Table carries FilterItem chips that narrow ITS table,
       not the listing. Same gesture as a bar chip: click to open a picker,
       Apply to commit.

       Values are read here rather than by FilterBar. The bar reads a panel by
       its SHAPE, which is the right contract for it, but these events must not
       reach it at all — a sub-filter's Apply bubbling up would be taken as the
       Catalogue Item chip committing, and the chip would show a group name
       instead of the items chosen. They are stopped at the subpanel. */
    function subValues(panel) {
      if (panel.querySelector('[data-select-menu]')) {
        return Array.from(panel.querySelectorAll('.filter-dropdown-item--selected .filter-dropdown-item__name'))
          .map(function (n) { return n.textContent.trim(); });
      }
      if (panel.querySelector('.checkbox__input')) {
        return Array.from(panel.querySelectorAll('.checkbox__input:checked')).map(function (c) {
          var t = c.closest('.checkbox').querySelector('.checkbox__label-text');
          return t ? t.textContent.trim() : '';
        }).filter(Boolean);
      }
      var field = panel.querySelector('.input__control');
      var text = field ? field.value.trim() : '';
      return text ? [text] : [];
    }

    /* Which rows survive the card's own sub-filters. */
    function subFilterRows(filter, state, chosen) {
      var picked = chosen || [];
      return (filter.options || []).filter(function (row) {
        /* An item already ticked stays visible however the sub-filters are
           set. The live picker does this with a second query — filtering after
           choosing must not hide what you chose. */
        if (picked.indexOf(row.name) !== -1) return true;
        return (filter.facets || []).every(function (sub) {
          var values = state[sub.name] || [];
          if (!values.length) return true;
          /* An array field joins for the match — Payment Method is a text
             search over the methods an item accepts, not a pick from a list. */
          var actual = row[sub.field];
          actual = String(Array.isArray(actual) ? actual.join(' ') : (actual === undefined ? '' : actual));
          if (sub.type === 'text') return actual.toLowerCase().indexOf(values[0].toLowerCase()) !== -1;
          /* A toggle is not a value to match — ticked means "only rows where
             this is true", unticked means it is not narrowing at all (which
             the empty-values guard above has already handled). */
          if (sub.type === 'checkbox') return !!row[sub.field];
          return values.some(function (v) { return actual === v; });
        });
      });
    }

    var subState = {};   // filter name -> { sub-filter name -> values[] }
    var pickerSort = {};  // filter name -> { by: <row field>, dir: 'asc'|'desc' }
    var pickerPage = {};  // filter name -> 1-based page

    /* Sorting a picker's table, the same rule as the listing's: compare the
       VALUE, and let an unsorted picker keep the order its data arrives in —
       which for Contact Lists is the live query's own Created DESC. */
    function sortPickerRows(rows, filter) {
      var st = pickerSort[filter.name];
      if (!st || !st.by) return rows;
      var dir = st.dir === 'asc' ? 1 : -1;
      return rows.slice().sort(function (a, b) {
        var x = String(a[st.by] === undefined ? '' : a[st.by]).toLowerCase();
        var y = String(b[st.by] === undefined ? '' : b[st.by]).toLowerCase();
        if (x < y) return -1 * dir;
        if (x > y) return 1 * dir;
        return 0;
      });
    }

    /* The header shows which column is sorting and which way, like the
       listing's. Rewriting only the icon keeps the button's own listeners. */
    function paintPickerHead(card, filter) {
      var st = pickerSort[filter.name] || {};
      card.querySelectorAll('[data-picker-sort]').forEach(function (btn) {
        var on = btn.getAttribute('data-picker-sort') === st.by;
        btn.classList.toggle('datatables__sort--active', on);
        var icon = btn.querySelector('[data-lucide], svg');
        if (!icon) return;
        icon.setAttribute('data-lucide',
          on ? (st.dir === 'asc' ? 'chevron-up' : 'chevron-down') : ICON_SORT);
        /* Lucide replaced the <i> with an <svg> on the first pass; it only
           redraws <i> elements, so the swapped node has to go back. */
        if (icon.tagName.toLowerCase() === 'svg') {
          var i = document.createElement('i');
          i.setAttribute('data-lucide', icon.getAttribute('data-lucide'));
          i.setAttribute('aria-hidden', 'true');
          icon.parentNode.replaceChild(i, icon);
        }
      });
    }

    function redrawPickerRows(card, filter) {
      var body = card.querySelector('tbody');
      if (!body) return;
      var state = subState[filter.name] || {};
      /* What the card shows as ticked is what is ticked IN THE CARD, not what
         the chip has committed — otherwise ticking a row on page 1 and paging
         on would un-tick it, since the redraw would reach past the working
         selection to the applied one. */
      var chosen = Array.from(card.querySelectorAll('[data-row-value]:checked'))
        .map(function (c) { return c.getAttribute('data-row-value'); });
      if (!card.dataset.pickerTouched) chosen = config.filterValues[filter.name] || [];
      var rows = sortPickerRows(subFilterRows(filter, state, chosen), filter);

      var pages = Math.max(1, Math.ceil(rows.length / PICKER_PAGE_SIZE));
      var page = Math.min(Math.max(1, pickerPage[filter.name] || 1), pages);
      pickerPage[filter.name] = page;
      var start = (page - 1) * PICKER_PAGE_SIZE;
      var shown = rows.slice(start, start + PICKER_PAGE_SIZE);

      /* A selection must survive paging, and the simplest way to keep one
         mechanism is to keep the row: anything ticked but not on this page is
         rendered HIDDEN. FilterBar reads the card's checked set on Apply, so
         off-page choices come back without a second store to keep in step. */
      var onPage = {};
      shown.forEach(function (o) { onPage[o.name] = true; });
      var offPage = chosen.filter(function (name) { return !onPage[name]; })
        .map(function (name) {
          return (filter.options || []).filter(function (o) { return o.name === name; })[0];
        }).filter(Boolean);

      body.innerHTML = rows.length
        ? shown.map(function (o) { return pickerRow(o, filter, chosen); }).join('') +
          offPage.map(function (o) { return pickerRow(o, filter, chosen).replace('<tr>', '<tr hidden>'); }).join('')
        : '<tr><td class="filter-dropdowns__empty" colspan="' +
            ((filter.tableColumns || []).length + 2) + '">No matching items</td></tr>';

      var pager = card.querySelector('[data-picker-pager]');
      if (pager) {
        pager.innerHTML = rows.length
          ? renderPickerPager(page, pages, start + 1, Math.min(start + PICKER_PAGE_SIZE, rows.length), rows.length)
          : '';
      }

      paintPickerHead(card, filter);
      if (window.lucide) window.lucide.createIcons();
      /* The header checkbox describes a set that just changed. */
      var all = card.querySelector('[data-select-all]');
      if (all) { all.checked = false; all.indeterminate = false; }
    }

    function pickerFilter(card) {
      var wrap = card.closest('.filter-bar__chip');
      var name = wrap && wrap.querySelector('.filter-item').getAttribute('data-filter-name');
      return config.moreFilters.concat(config.baseFilters)
        .filter(function (f) { return f.name === name; })[0];
    }

    /* Ticking a row in the card makes the CARD the source of truth for what is
       selected until Apply commits it. Without this the first redraw after a
       tick — paging, sorting, a sub-filter — would fall back to the chip's
       applied values and silently undo it. */
    document.addEventListener('change', function (e) {
      var box = e.target.closest('[data-row-value]');
      if (!box) return;
      var card = box.closest('.filter-dropdowns--table');
      if (card) card.dataset.pickerTouched = '1';
    });

    /* The picker's own pager. */
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-picker-page]');
      if (!btn || btn.disabled) return;
      var card = btn.closest('.filter-dropdowns--table');
      var filter = card && pickerFilter(card);
      if (!filter) return;
      pickerPage[filter.name] = parseInt(btn.getAttribute('data-picker-page'), 10) || 1;
      redrawPickerRows(card, filter);
    });

    /* Sorting a picker's own table. A second click on the same column
       reverses it; a first click starts ascending — a picker is a list you
       are looking something up in, where A-Z and oldest-first are the useful
       starting points, not the listing's newest-first. */
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-picker-sort]');
      if (!btn) return;
      var card = btn.closest('.filter-dropdowns--table');
      var filter = card && pickerFilter(card);
      if (!filter) return;
      var by = btn.getAttribute('data-picker-sort');
      var st = pickerSort[filter.name];
      pickerSort[filter.name] = (st && st.by === by)
        ? { by: by, dir: st.dir === 'asc' ? 'desc' : 'asc' }
        : { by: by, dir: 'asc' };
      /* A re-sorted list is a different list: page 3 of it is not the page 3
         you were on. Same rule the listing follows. */
      pickerPage[filter.name] = 1;
      redrawPickerRows(card, filter);
    });

    /* Open one sub-picker at a time. */
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-subfilter-trigger]');
      var card = e.target.closest('.filter-dropdowns--table');
      if (!card) return;

      if (trigger) {
        var facet = trigger.closest('.filter-dropdowns__facet');
        var panel = facet.querySelector('.filter-dropdowns__subpanel');
        var wasOpen = panel && !panel.hidden;
        card.querySelectorAll('.filter-dropdowns__subpanel').forEach(function (p) { p.hidden = true; });
        if (panel) panel.hidden = wasOpen;
        return;
      }
      /* A click anywhere else in the card that is not inside an open
         sub-picker closes them. */
      if (!e.target.closest('.filter-dropdowns__subpanel')) {
        card.querySelectorAll('.filter-dropdowns__subpanel').forEach(function (p) { p.hidden = true; });
      }
    });

    document.addEventListener('filter-dropdowns:apply', function (e) {
      var panel = e.target.closest('.filter-dropdowns__subpanel');
      if (!panel) return;
      /* Never let this reach the bar — see subValues above. */
      e.stopPropagation();

      var facet = panel.closest('.filter-dropdowns__facet');
      var card = panel.closest('.filter-dropdowns--table');
      var filter = pickerFilter(card);
      if (!filter) return;

      var name = facet.getAttribute('data-subfilter');
      var values = subValues(panel);
      subState[filter.name] = subState[filter.name] || {};
      subState[filter.name][name] = values;

      /* Narrowing produces a shorter list; whatever page you were on is gone. */
      pickerPage[filter.name] = 1;

      var chip = facet.querySelector('.filter-item');
      if (chip && typeof chip.setFilterValues === 'function') chip.setFilterValues(values);
      /* The sub-picker STAYS OPEN. Narrowing this table is usually an
         iteration — try a term, see what comes back, adjust — and closing the
         control after every attempt makes the user re-open it to do the next
         one. The result is behind it and updates live, so there is nothing to
         get out of the way for. It closes on a click elsewhere in the card,
         like any other picker. */
      redrawPickerRows(card, filter);
    }, true);

    /* Clearing a sub-filter chip clears its narrowing too. */
    document.addEventListener('filter-item:clear', function (e) {
      var facet = e.target.closest('.filter-dropdowns__facet');
      if (!facet) return;
      var card = facet.closest('.filter-dropdowns--table');
      var filter = pickerFilter(card);
      if (!filter) return;
      var name = facet.getAttribute('data-subfilter');
      if (subState[filter.name]) subState[filter.name][name] = [];
      pickerPage[filter.name] = 1;
      var panel = facet.querySelector('.filter-dropdowns__subpanel');
      var card2 = panel && panel.querySelector('[data-filter-dropdowns]');
      if (card2 && typeof card2.resetFilterDropdown === 'function') card2.resetFilterDropdown();
      redrawPickerRows(card, filter);
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
      fitColumns(root, config);
      placeRoomHeading(root, config);
      announceColumns();
      persistColumns();
    });

    watchSelectionStuck(root);

    /* Whether a column has ROOM changes with the container, not the window —
       the CC sidebar resizes the table with no window resize at all — so the
       panel's notes are refreshed from a ResizeObserver on the table
       (CLAUDE.md §4a), never from matchMedia. */
    var observed = listingTable(root);
    var table = observed && observed.body;
    if (table && typeof ResizeObserver === 'function') {
      /* WIDTH only. A ResizeObserver fires on any size change, and the table's
         HEIGHT changes constantly — opening a row's kebab panel is the obvious
         one. Re-fitting then is at best wasted work and at worst wrong: the
         detail row is visible by the time the measure runs, and its single
         `colspan` cell pushes its own width demand across every column it
         spans, so the columns came back narrower than the table (designer,
         2026-09-21). Nothing about a taller table changes what fits across it. */
      var lastWidth = Math.round(table.clientWidth);
      new ResizeObserver(function () {
        var now = Math.round(table.clientWidth);
        if (now === lastWidth) return;
        lastWidth = now;
        fitColumns(root, config);
        placeRoomHeading(root, config);
      }).observe(table);
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
