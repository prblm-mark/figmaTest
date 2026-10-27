/* TopicTree — a topic list's hierarchy as a site tree (role="tree").
 *
 * Code-first (Mark, 2026-10-20, Hub TASK-571925): the v3 Topic Manager's Hierarchy view. v1's tree is a
 * plain list of names with a details panel beside it, and that is the model: names only, one row per
 * topic, the selected topic's facts in a panel the HOST draws (Topic Manager uses the FactPanel). A first
 * pass as a tree-TABLE (counts in columns) read as too heavy and was replaced the same day.
 *
 * The data is the v1 schema, normalised — a topic list is a GRAPH, not a tree: TaxonomyCategoryBTNT is
 * many-to-many, so one topic can sit under several parents. Each placement is its own row, keyed by its
 * PATH, and a topic with other parents says so with the "also under" hint.
 *
 *   TopicTree.mount(ul, {
 *     topics:   { <code>: { code, name, children, … } },   // `children` = how many (drives the chevron)
 *               // optional row marks (Site Tree, from Cat's CC copy, TASK-580895 / TASK-582058):
 *               //   icon: 'folder'                            a Lucide name, drawn before the name
 *               //   iconLabel: 'Section'                      what the icon means, for screen readers
 *               //   badges: [{ text: 'Hidden', state: 'neutral' }]   DS Badge sm after the name; state is a
 *               //                                             Badge state (default|neutral|success|warning|
 *               //                                             danger|info, else neutral). Host links Badge.css.
 *               // Topic Manager passes none, and its rows are unchanged.
 *     children: { root: [codes], <code>: [codes] },      // ordered (BTNT.SO, then name); a missing key = not loaded
 *     parents:  { <code>: [codes] },                     // every parent of a topic
 *     label:    'Affino Taxonomy topics',
 *     loadChildren(code) → Promise   // optional; resolves once `children[code]` is filled
 *     onSelect(topic, path)          // optional; the host shows the topic's details
 *     pageSize: 300,                 // v1 caps a level at 300 (TaxonomyManagerDisplayHierarchy.cfm)
 *     emptyHtml: '<li>…</li>'        // what a search with no matches shows
 *   }) → { filter(predicate|null, graph?), open(paths), select(path), render() }
 *
 * Mouse: the chevron opens and closes; the rest of the row selects. Keyboard (APG tree view): ↑ ↓ move,
 * → opens or steps into the first child, ← closes or steps out to the parent, Home / End, Enter or Space
 * selects. One row is in the tab order.
 *
 * Search: `filter(fn, graph)` shows every topic that matches PLUS the ancestors that lead to it, opened;
 * the ancestors are muted (designer, 2026-10-20). `graph` is the search response's { children, parents }.
 * TODO(backend:TopicManager) topic-tree-search: the server must return matches WITH their ancestor
 *   paths → GET /control/topics?TaxonomyCode=&q=&parent=&letter= → { topics{}, children{}, parents{} }
 *   for the matched topics and every ancestor, so the tree can draw them without loading each level.
 */
(function () {
  'use strict';

  var PAGE = 300;
  var BADGE_STATES = ['default', 'neutral', 'success', 'warning', 'danger', 'info'];   // Badge.css

  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function icons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }

  function mount(list, opts) {
    var topics = opts.topics;
    var children = opts.children;
    var parents = opts.parents || {};
    var pageSize = opts.pageSize || PAGE;

    var open = {};          // path → true
    var loading = {};       // path → true while loadChildren runs
    var shown = {};         // path → how many children are drawn (paging)
    var visible = null;     // search: code → true for matches and their ancestors
    var matched = null;     // search: code → true for matches only
    var folded = {};        // search: paths the user closed (a result opens whole; each chevron still works)
    var searchKids = null;  // search: the response's children, read instead of what is loaded
    var activePath = null;  // the row in the tab order
    var selectedPath = null;

    list.classList.add('topic-tree');
    list.setAttribute('role', 'tree');
    if (opts.label) list.setAttribute('aria-label', opts.label);

    function kids(code) { return (searchKids || children)[code === null ? 'root' : code]; }

    function drawnKids(code) {
      var all = kids(code) || [];
      return visible ? all.filter(function (c) { return visible[c]; }) : all;
    }

    function hasKids(code) {
      if (visible) return drawnKids(code).length > 0;
      var t = topics[code];
      return !!(t && t.children);
    }

    function item(t, key, level, i, size, expandable, expanded) {
      var here = key.indexOf('/') !== -1 ? key.split('/').slice(-2)[0] : null;
      var others = (parents[t.code] || []).filter(function (p) { return p !== here && topics[p]; });
      var badges = t.badges || [];
      return '<div class="topic-tree__item' +
          (matched && !matched[t.code] ? ' topic-tree__item--context' : '') + '" data-level="' + level + '">' +
        (expandable
          ? '<span class="topic-tree__chevron" data-topic-tree-toggle aria-hidden="true"><i data-lucide="chevron-right"></i></span>'
          : '<span class="topic-tree__spacer" aria-hidden="true"></span>') +
        (t.icon ? '<span class="topic-tree__icon" aria-hidden="true"><i data-lucide="' + esc(t.icon) + '"></i></span>' : '') +
        '<span class="topic-tree__name">' + esc(t.name) + '</span>' +
        (badges.length
          ? '<span class="topic-tree__badges" aria-hidden="true">' + badges.map(function (b) {
              var state = BADGE_STATES.indexOf(b.state) !== -1 ? b.state : 'neutral';
              return '<span class="badge badge--' + state + ' badge--sm">' + esc(b.text) + '</span>';
            }).join('') + '</span>'
          : '') +
        (others.length
          ? '<span class="topic-tree__also" data-topic-tree-tip' +
              ' data-tip="Also under: ' + esc(others.map(function (p) { return topics[p].name; }).join(', ')) + '">' +
              '<i data-lucide="link-2" aria-hidden="true"></i></span>'
          : '') +
      '</div>';
    }

    function statusItem(level, html) {
      return '<li class="topic-tree__status" role="none"><div class="topic-tree__item" data-level="' + level + '">' +
        '<span class="topic-tree__spacer" aria-hidden="true"></span>' + html + '</div></li>';
    }

    function rows(code, path, level) {
      var all = drawnKids(code);
      var limit = visible ? all.length : (shown[path.join('/')] || pageSize);
      var out = all.slice(0, limit).map(function (c, i) {
        var t = topics[c];
        if (!t) return '';
        var p = path.concat(c);
        var key = p.join('/');
        var expandable = hasKids(c);
        var expanded = expandable && (visible ? !folded[key] : !!open[key]);
        /* The row's marks are read once, here: the type, each badge, then "also under". The icon and
           badges themselves are aria-hidden. */
        var marks = (t.iconLabel ? [t.iconLabel] : [])
          .concat((t.badges || []).map(function (b) { return b.text; }));
        if ((parents[c] || []).length > 1) {
          marks.push('Also under: ' + (parents[c] || []).filter(function (x) { return x !== path[path.length - 1] && topics[x]; })
            .map(function (x) { return topics[x].name; }).join(', '));
        }
        var others = marks.length ? ' aria-description="' + esc(marks.join(', ')) + '"' : '';
        var li = '<li role="treeitem" data-topic-tree-path="' + esc(key) + '"' +
          ' aria-level="' + level + '" aria-posinset="' + (i + 1) + '" aria-setsize="' + all.length + '"' +
          (expandable ? ' aria-expanded="' + expanded + '"' : '') +
          ' aria-selected="' + (key === selectedPath) + '"' + others +
          ' tabindex="' + (key === activePath ? '0' : '-1') + '">' +
          item(t, key, level, i, all.length, expandable, expanded);
        if (expanded) {
          li += '<ul role="group">' + (loading[key]
            ? statusItem(level + 1,
                '<span class="spinner spinner--sm spinner--neutral" aria-hidden="true"><svg class="spinner__svg" viewBox="0 0 24 24" fill="none">' +
                '<circle class="spinner__track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"></circle>' +
                '<path class="spinner__arc" d="M12 2 a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg></span>' +
                '<span class="topic-tree__status-text" role="status">Loading topics…</span>')
            : rows(c, p, level + 1)) + '</ul>';
        }
        return li + '</li>';
      }).join('');
      if (all.length > limit) {
        out += statusItem(level,
          '<button type="button" class="btn btn--tertiary btn--xs topic-tree__more" data-topic-tree-more="' + esc(path.join('/')) + '">' +
          'Show ' + Math.min(pageSize, all.length - limit) + ' more</button>' +
          '<span class="topic-tree__status-text">' + limit + ' of ' + all.length + '</span>');
      }
      return out;
    }

    function items() { return Array.prototype.slice.call(list.querySelectorAll('[data-topic-tree-path]')); }

    function render() {
      var focused = list.contains(document.activeElement);
      list.innerHTML = rows(null, [], 1) || (opts.emptyHtml || '');
      var all = items();
      if (!all.length) { activePath = null; icons(); return; }
      if (!activePath || !list.querySelector('[data-topic-tree-path="' + activePath + '"]')) {
        activePath = all[0].getAttribute('data-topic-tree-path');
      }
      all.forEach(function (li) { li.tabIndex = li.getAttribute('data-topic-tree-path') === activePath ? 0 : -1; });
      if (focused) focusPath(activePath);
      icons();
    }

    /* `still`: a clicked row is already on screen — focusing it must not scroll, or it undoes the host
       scrolling its panel into view on select (Topic Manager, stacked). */
    function focusPath(key, still) {
      var li = list.querySelector('[data-topic-tree-path="' + key + '"]');
      if (!li) return;
      items().forEach(function (x) { x.tabIndex = -1; });
      li.tabIndex = 0;
      activePath = key;
      li.focus({ preventScroll: !!still });
    }

    function select(key) {
      selectedPath = key;
      items().forEach(function (li) {
        li.setAttribute('aria-selected', String(li.getAttribute('data-topic-tree-path') === key));
      });
      if (opts.onSelect) opts.onSelect(topics[key.split('/').pop()], key);
    }

    function expand(key) {
      var code = key.split('/').pop();
      open[key] = true;
      if (!kids(code) && opts.loadChildren) {
        loading[key] = true;
        render();
        opts.loadChildren(code).then(function () { delete loading[key]; render(); });
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

    list.addEventListener('click', function (e) {
      var more = e.target.closest('[data-topic-tree-more]');
      if (more) {
        var at = more.getAttribute('data-topic-tree-more');
        shown[at] = (shown[at] || pageSize) + pageSize;
        render();
        return;
      }
      /* The nearest treeitem: a click inside a child's row must not reach its parent's. */
      var li = e.target.closest('[data-topic-tree-path]');
      if (!li || !e.target.closest('.topic-tree__item')) return;
      var key = li.getAttribute('data-topic-tree-path');
      activePath = key;
      if (e.target.closest('[data-topic-tree-toggle]')) { toggle(key); focusPath(key, true); return; }
      focusPath(key, true);
      select(key);
    });

    list.addEventListener('keydown', function (e) {
      var li = e.target.closest('[data-topic-tree-path]');
      if (!li || e.target !== li) return;
      var all = items();
      var i = all.indexOf(li);
      var key = li.getAttribute('data-topic-tree-path');
      var expanded = li.getAttribute('aria-expanded');
      var next = null;
      switch (e.key) {
        case 'ArrowDown': next = all[i + 1]; break;
        case 'ArrowUp': next = all[i - 1]; break;
        case 'Home': next = all[0]; break;
        case 'End': next = all[all.length - 1]; break;
        case 'ArrowRight':
          if (expanded === 'false') toggle(key);
          else if (expanded === 'true') next = all[i + 1];
          break;
        case 'ArrowLeft':
          if (expanded === 'true') toggle(key);
          else if (key.indexOf('/') !== -1) next = list.querySelector('[data-topic-tree-path="' + key.slice(0, key.lastIndexOf('/')) + '"]');
          break;
        case 'Enter':
        case ' ':
          select(key);
          break;
        default: return;
      }
      e.preventDefault();
      if (next) focusPath(next.getAttribute('data-topic-tree-path'));
    });

    /* Every code that leads to a match, through EVERY parent — a match under two parents shows twice. */
    function ancestry(code, into) {
      if (into[code]) return;
      into[code] = true;
      (parents[code] || []).forEach(function (p) { ancestry(p, into); });
    }

    render();

    return {
      filter: function (fn, graph) {
        searchKids = fn && graph ? graph.children : null;
        if (fn && graph && graph.parents) parents = graph.parents;
        folded = {};
        if (!fn) {
          visible = matched = null;
        } else {
          matched = {};
          visible = {};
          Object.keys(topics).forEach(function (code) {
            if (fn(topics[code])) { matched[code] = true; ancestry(code, visible); }
          });
        }
        render();
        return Object.keys(matched || {}).length;
      },
      open: function (keys) { keys.forEach(function (k) { open[k] = true; }); render(); },
      select: function (key) { render(); select(key); },
      render: render
    };
  }

  /* The "also under" hint: the DS Tooltip (Arrow=Top), one shared and fixed under the hovered icon — the
   * record summary's pattern (RecordSummary.js). Screen readers get the same text from the row's
   * aria-description, so the tooltip is aria-hidden. Keyboard: it shows while its row has focus. */
  function tooltips() {
    var tip = document.createElement('span');
    tip.className = 'tooltip tooltip--arrow-top topic-tree__float-tip';
    tip.setAttribute('aria-hidden', 'true');
    tip.hidden = true;
    tip.innerHTML = '<span class="tooltip__text"></span>';
    document.body.appendChild(tip);
    var current = null;

    function show(el) {
      current = el;
      tip.firstChild.textContent = el.getAttribute('data-tip');
      tip.hidden = false;
      var r = el.getBoundingClientRect();
      var w = tip.offsetWidth;
      tip.style.left = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), window.innerWidth - w - 8) + 'px';
      tip.style.top = (r.bottom + 10) + 'px';   // clears the Top arrow (6px) with a small gap
    }
    function hide() { current = null; tip.hidden = true; }
    /* The row's OWN hint, not a descendant row's. */
    function ownTip(li) {
      var row = li && li.querySelector(':scope > .topic-tree__item');
      return row && row.querySelector('[data-topic-tree-tip]');
    }

    document.addEventListener('mouseover', function (e) {
      var el = e.target.closest('[data-topic-tree-tip]');
      if (el && el !== current) show(el);
      else if (!el && current) hide();
    });
    document.addEventListener('focusin', function (e) {
      var el = ownTip(e.target.closest && e.target.closest('[data-topic-tree-path]'));
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
