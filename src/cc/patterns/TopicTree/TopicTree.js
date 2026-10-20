/* TopicTree — a topic list's hierarchy as a tree-table (role="treegrid").
 *
 * Code-first (Mark, 2026-10-20, Hub TASK-571925): the v3 Topic Manager's Hierarchy view. The kit had no
 * tree, and v1's is a column of nested <table>s that reloads the page on every expand.
 *
 * The data is the v1 schema, normalised — a topic list is a GRAPH, not a tree: TaxonomyCategoryBTNT is
 * many-to-many, so one topic can sit under several parents (v1's List shows a plural "Parents" column).
 * Each placement is its own row, keyed by its PATH, and a topic with other parents says so with the
 * "also under" hint.
 *
 *   TopicTree.mount(host, {
 *     topics:   { <code>: { code, name, externalId?, children, articles, contacts, accounts } },
 *     children: { root: [codes], <code>: [codes] },   // ordered (BTNT.SO, then name); a missing key = not loaded yet
 *     parents:  { <code>: [codes] },                  // every parent of a topic (for the hint + search ancestry)
 *     columns:  [{ key, label, type: 'name'|'count'|'edit', hug? }],
 *     href(topic), editHref(topic),
 *     loadChildren(code) → Promise   // optional; resolves once `children[code]` is filled
 *     pageSize: 300,                 // v1 caps a level at 300 (TaxonomyManagerDisplayHierarchy.cfm)
 *     emptyHtml: '<tr>…</tr>'        // what a search with no matches shows
 *   }) → { filter(predicate|null, graph?), expandAll(), collapseAll(), open(paths) }
 *
 * `host` is a <table class="table">; the tree writes its <thead> and <tbody>.
 *
 * Keyboard (APG treegrid, row-focus): ↑ ↓ move, → expands or steps into the first child, ← collapses or
 * steps out to the parent, Home / End, Enter opens the topic. One row is in the tab order at a time,
 * and only that row's link and pencil are tabbable — so Tab reaches the focused row's Edit, not
 * every pencil in the tree.
 *
 * Search: `filter(fn)` shows every row whose topic matches PLUS the ancestors that lead to it, opened;
 * the ancestors are muted (designer, 2026-10-20). It needs the whole graph, which the demo has.
 * TODO(backend:TopicManager) topic-tree-search: the server must return matches WITH their ancestor
 *   paths → GET /control/topics?TaxonomyCode=&q=&parent=&letter= → { topics{}, children{}, parents{} }
 *   for the matched rows and every ancestor, so the tree can draw them without loading each level.
 */
(function () {
  'use strict';

  var PAGE = 300;

  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function icons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }

  function mount(table, opts) {
    var topics = opts.topics;
    var children = opts.children;
    var parents = opts.parents || {};
    var columns = opts.columns;
    var pageSize = opts.pageSize || PAGE;

    var open = {};        // path → true
    var loading = {};     // path → true while loadChildren runs
    var shown = {};       // path → how many children are drawn (paging)
    var match = null;     // search predicate, or null
    var visible = null;   // search: code → true for matches and their ancestors
    var matched = null;   // search: code → true for matches only
    var activePath = null;
    var folded = {};      // search: paths the user folded (a result opens whole, but each chevron still works)

    table.classList.add('topic-tree');
    table.setAttribute('role', 'treegrid');
    if (opts.label) table.setAttribute('aria-label', opts.label);

    table.innerHTML = '<thead><tr>' + columns.map(function (c) {
      var cls = c.type === 'name' ? ' class="topic-tree__name-cell"' : ' class="datatables__col--hug"';
      var col = ' data-topic-tree-col="' + esc(c.key) + '"';
      return c.label
        ? '<th scope="col"' + cls + col + '>' + esc(c.label) + '</th>'
        : '<th scope="col" aria-label="Actions"' + cls + col + '></th>';
    }).join('') + '</tr></thead><tbody></tbody>';
    var tbody = table.tBodies[0];

    var searchGraph = null;   // search: the server's matches + ancestors, read instead of what is loaded

    function kids(code) { return (searchGraph || children)[code === null ? 'root' : code]; }

    /* Children to draw under a node: in search, only the ones on a path to a match. */
    function drawnKids(code) {
      var list = kids(code) || [];
      return visible ? list.filter(function (c) { return visible[c]; }) : list;
    }

    function hasKids(code) {
      if (visible) return drawnKids(code).length > 0;
      var t = topics[code];
      return !!(t && t.children);
    }

    function cell(col, t, path, level, expanded) {
      if (col.type === 'name') {
        var toggle = hasKids(t.code)
          ? '<button type="button" class="btn btn--tertiary btn--xs btn--icon topic-tree__toggle" tabindex="-1"' +
              ' aria-label="' + (expanded ? 'Collapse ' : 'Expand ') + esc(t.name) + '" data-topic-tree-toggle>' +
              '<i data-lucide="chevron-right" aria-hidden="true"></i></button>'
          : '<span class="topic-tree__spacer" aria-hidden="true"></span>';
        /* The OTHER parents — the one this row sits under is already the row above it. */
        var here = path.length > 1 ? path[path.length - 2] : null;
        var others = (parents[t.code] || []).filter(function (p) { return p !== here && topics[p]; });
        var also = others.length
          ? '<span class="topic-tree__also" tabindex="-1" role="img" data-topic-tree-tip' +
              ' aria-label="Also under: ' + esc(others.map(function (p) { return topics[p].name; }).join(', ')) + '">' +
              '<i data-lucide="link-2" aria-hidden="true"></i></span>'
          : '';
        return '<td role="gridcell" class="topic-tree__name-cell">' +
          '<div class="topic-tree__name" data-level="' + level + '">' + toggle +
            '<span class="datatables__truncate" title="' + esc(t.name) + '">' +
              '<a class="datatables__record-link topic-tree__link" href="' + esc(opts.href(t)) + '" tabindex="-1"' +
              ' data-backend-todo="topic-manager-routes">' + esc(t.name) + '</a></span>' +
            also +
          '</div></td>';
      }
      if (col.type === 'edit') {
        return '<td role="gridcell" class="datatables__col--hug datatables__col--edit">' +
          '<a class="datatables__row-edit" href="' + esc(opts.editHref(t)) + '" tabindex="-1"' +
          ' data-backend-todo="topic-manager-routes" aria-label="Edit ' + esc(t.name) + '">' +
          '<i data-lucide="pencil" aria-hidden="true"></i></a></td>';
      }
      var v = t[col.key];
      return '<td role="gridcell" class="datatables__col--hug" data-topic-tree-col="' + esc(col.key) + '">' +
        esc(v === undefined || v === null ? '' : Number(v).toLocaleString('en-GB')) + '</td>';
    }

    function statusRow(level, html) {
      return '<tr class="topic-tree__status" role="row" aria-level="' + level + '">' +
        '<td role="gridcell" colspan="' + columns.length + '"><div class="topic-tree__name" data-level="' + level + '">' +
        '<span class="topic-tree__spacer" aria-hidden="true"></span>' + html + '</div></td></tr>';
    }

    function rows(code, path, level) {
      var list = drawnKids(code);
      var limit = visible ? list.length : (shown[path.join('/')] || pageSize);
      var out = list.slice(0, limit).map(function (c, i) {
        var t = topics[c];
        if (!t) return '';
        var p = path.concat(c);
        var key = p.join('/');
        var expandable = hasKids(c);
        var expanded = expandable && (visible ? !folded[key] : !!open[key]);
        var tr = '<tr class="datatables__row topic-tree__row' +
          (matched && !matched[c] ? ' topic-tree__row--context' : '') + '" role="row"' +
          ' data-topic-tree-path="' + esc(key) + '" aria-level="' + level + '"' +
          ' aria-posinset="' + (i + 1) + '" aria-setsize="' + list.length + '"' +
          (expandable ? ' aria-expanded="' + expanded + '"' : '') +
          ' tabindex="' + (key === activePath ? '0' : '-1') + '">' +
          columns.map(function (col) { return cell(col, t, p, level, expanded); }).join('') + '</tr>';
        if (expanded) {
          if (loading[key]) {
            tr += statusRow(level + 1,
              /* The visible text is the status; the ring is decoration (no hidden label, nothing read twice). */
              '<span class="spinner spinner--sm spinner--neutral" aria-hidden="true"><svg class="spinner__svg" viewBox="0 0 24 24" fill="none">' +
              '<circle class="spinner__track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"></circle>' +
              '<path class="spinner__arc" d="M12 2 a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg></span>' +
              '<span class="topic-tree__status-text" role="status">Loading topics…</span>');
          } else {
            tr += rows(c, p, level + 1);
          }
        }
        return tr;
      }).join('');
      if (list.length > limit) {
        var more = Math.min(pageSize, list.length - limit);
        out += statusRow(level,
          '<button type="button" class="btn btn--tertiary btn--sm topic-tree__more" data-topic-tree-more="' + esc(path.join('/')) + '">' +
          'Show ' + more + ' more</button><span class="topic-tree__status-text">' + limit + ' of ' + list.length + '</span>');
      }
      return out;
    }

    function render() {
      var html = rows(null, [], 1);
      tbody.innerHTML = html || (opts.emptyHtml || '');
      var all = tbody.querySelectorAll('[data-topic-tree-path]');
      if (all.length && !tbody.querySelector('[data-topic-tree-path][tabindex="0"]')) {
        setActive(all[0], false);
      } else {
        syncActive();
      }
      icons();
    }

    function rowEls() { return Array.prototype.slice.call(tbody.querySelectorAll('[data-topic-tree-path]')); }

    /* Only the active row's link and pencil are in the tab order. */
    function syncActive() {
      rowEls().forEach(function (r) {
        var on = r.getAttribute('data-topic-tree-path') === activePath;
        r.tabIndex = on ? 0 : -1;
        r.querySelectorAll('a').forEach(function (a) { a.tabIndex = on ? 0 : -1; });
      });
    }

    function setActive(row, focus) {
      activePath = row.getAttribute('data-topic-tree-path');
      syncActive();
      if (focus) row.focus();
    }

    function focusPath(key) {
      var r = tbody.querySelector('[data-topic-tree-path="' + key + '"]');
      if (r) setActive(r, true);
    }

    function expand(key) {
      var code = key.split('/').pop();
      open[key] = true;
      if (!kids(code) && opts.loadChildren) {
        loading[key] = true;
        render();
        opts.loadChildren(code).then(function () {
          delete loading[key];
          render();
          focusPath(key);
        });
        return;
      }
      render();
    }

    function toggle(key) {
      if (visible) {
        if (folded[key]) delete folded[key]; else folded[key] = true;
        render();
        return;
      }
      if (open[key]) { delete open[key]; render(); } else { expand(key); }
    }

    tbody.addEventListener('click', function (e) {
      var more = e.target.closest('[data-topic-tree-more]');
      if (more) {
        var at = more.getAttribute('data-topic-tree-more');
        shown[at] = (shown[at] || pageSize) + pageSize;
        render();
        return;
      }
      var row = e.target.closest('[data-topic-tree-path]');
      if (!row) return;
      setActive(row, false);
      if (e.target.closest('[data-topic-tree-toggle]')) {
        var key = row.getAttribute('data-topic-tree-path');
        toggle(key);
        focusPath(key);
        return;
      }
      /* The rest of the row opens the topic, as a listing row does — only the chevron folds. */
      if (!e.target.closest('a')) {
        var link = row.querySelector('.topic-tree__link');
        if (link) link.click();
      }
    });

    tbody.addEventListener('keydown', function (e) {
      var row = e.target.closest('[data-topic-tree-path]');
      if (!row || e.target !== row) return;
      var list = rowEls();
      var i = list.indexOf(row);
      var key = row.getAttribute('data-topic-tree-path');
      var expanded = row.getAttribute('aria-expanded');
      var next = null;
      switch (e.key) {
        case 'ArrowDown': next = list[i + 1]; break;
        case 'ArrowUp': next = list[i - 1]; break;
        case 'Home': next = list[0]; break;
        case 'End': next = list[list.length - 1]; break;
        case 'ArrowRight':
          if (expanded === 'false') { toggle(key); focusPath(key); }
          else if (expanded === 'true') next = list[i + 1];
          break;
        case 'ArrowLeft':
          if (expanded === 'true') { toggle(key); focusPath(key); }
          else if (key.indexOf('/') !== -1) focusPath(key.slice(0, key.lastIndexOf('/')));
          break;
        case 'Enter':
          var link = row.querySelector('.topic-tree__link');
          if (link) link.click();
          break;
        default: return;
      }
      e.preventDefault();
      if (next) setActive(next, true);
    });

    tbody.addEventListener('focusin', function (e) {
      var row = e.target.closest('[data-topic-tree-path]');
      if (row && row.getAttribute('data-topic-tree-path') !== activePath) setActive(row, false);
    });

    /* Every code that leads to a match, through EVERY parent — a match under two parents shows twice. */
    function ancestry(code, into) {
      if (into[code]) return;
      into[code] = true;
      (parents[code] || []).forEach(function (p) { ancestry(p, into); });
    }

    var api = {
      /* `graph` is the search response's { children, parents } — the levels a search has to open are
         generally not loaded yet. Without one, the search reads what is loaded. */
      filter: function (fn, graph) {
        match = fn;
        searchGraph = fn && graph ? graph.children : null;
        if (fn && graph && graph.parents) parents = graph.parents;
        if (!fn) {
          visible = matched = null;
        } else {
          matched = {};
          visible = {};
          Object.keys(topics).forEach(function (code) {
            if (fn(topics[code])) { matched[code] = true; ancestry(code, visible); }
          });
        }
        activePath = null;
        folded = {};
        render();
        return Object.keys(matched || {}).length;
      },
      expandAll: function () {
        (function walk(code, path) {
          (kids(code) || []).forEach(function (c) {
            var p = path.concat(c);
            if (kids(c) && kids(c).length) { open[p.join('/')] = true; walk(c, p); }
          });
        })(null, []);
        render();
      },
      collapseAll: function () { open = {}; render(); },
      open: function (keys) { keys.forEach(function (k) { open[k] = true; }); render(); },
      render: render
    };

    render();
    return api;
  }

  /* The "also under" hint: the DS Tooltip (Arrow=Top), one shared and fixed under the hovered or
   * focused icon — the record summary's pattern (RecordSummary.js). The icon keeps its aria-label;
   * the tooltip is aria-hidden so it isn't read twice. */
  function tooltips() {
    var SEL = '[data-topic-tree-tip]';
    var tip = document.createElement('span');
    tip.className = 'tooltip tooltip--arrow-top topic-tree__float-tip';
    tip.setAttribute('aria-hidden', 'true');
    tip.hidden = true;
    tip.innerHTML = '<span class="tooltip__text"></span>';
    document.body.appendChild(tip);
    var current = null;

    function show(el) {
      current = el;
      tip.firstChild.textContent = el.getAttribute('aria-label');
      tip.hidden = false;
      var r = el.getBoundingClientRect();
      var w = tip.offsetWidth;
      tip.style.left = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), window.innerWidth - w - 8) + 'px';
      tip.style.top = (r.bottom + 10) + 'px';   // clears the Top arrow (6px) with a small gap
    }
    function hide() { current = null; tip.hidden = true; }

    document.addEventListener('mouseover', function (e) {
      var el = e.target.closest(SEL);
      if (el && el !== current) show(el);
      else if (!el && current) hide();
    });
    /* Keyboard: the hint shows while its ROW is focused, since the icon itself is not a tab stop. */
    document.addEventListener('focusin', function (e) {
      var row = e.target.closest('[data-topic-tree-path]');
      var el = row && row.querySelector(SEL);
      if (el) show(el); else hide();
    });
    document.addEventListener('focusout', hide);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
    window.addEventListener('scroll', hide, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tooltips);
  else tooltips();

  window.TopicTree = { mount: mount };
})();
