/* Design Object Editor prototype: renderer + light interactions (non-functional mock).
 * Each screen's <body> sets its initial state via data-* attributes:
 *   data-mode="structure|preview"  data-left="navigator|library|history|none"
 *   data-select="<cell id>|<row id>"  data-tab="content|layout|visibility"
 *   data-bp="fluid|1200|1024|800|600|480"  data-nested="1"  data-context="<row id>"  data-insert="1"
 * Everything renders from DOE_DATA so all five screens share one source.
 * TODO(backend:DesignObjectEditor): every control here is visual-only → design object save/patch API. */
(function () {
  var D = window.DOE_DATA;
  var body = document.body;
  var S = {
    mode: body.dataset.mode || 'structure',
    left: body.dataset.left || 'navigator',
    select: body.dataset.select || 'c-al',
    tab: body.dataset.tab || 'layout',
    bp: body.dataset.bp || 'fluid',
    nested: body.dataset.nested === '1',
    context: body.dataset.context || '',
    insert: body.dataset.insert === '1'
  };

  if (S.insert) {
    D.ROWS[4].cells.push({ id: 'c-new', name: 'New cell', kind: 'empty', type: 'Empty', dcc: 0, span: 12 });
  }

  /* ── helpers ─────────────────────────────────────────── */
  function ic(name, cls) { return '<i data-lucide="' + name + '" class="doe-ic ' + (cls || '') + '" aria-hidden="true"></i>'; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function kindIcon(c) {
    if (c.kind === 'do') return 'component';
    if (c.kind === 'script') return 'code-xml';
    if (c.kind === 'empty') return 'square-dashed';
    return (D.ELEMENTS[c.type] || {}).icon || 'square';
  }
  function kindLabel(c) {
    return c.kind === 'do' ? 'Design object' : c.kind === 'script' ? 'Design script' : c.kind === 'empty' ? 'Empty cell' : 'Design element';
  }
  function allRows() {
    var rows = D.ROWS.slice();
    rows.push.apply(rows, D.ROWS[0].cells[0].nested.rows);
    return rows;
  }
  function findCell(id) {
    var hit = null;
    allRows().forEach(function (r) { r.cells.forEach(function (c) { if (c.id === id) hit = { cell: c, row: r }; }); });
    return hit;
  }
  function findRow(id) { return allRows().filter(function (r) { return r.id === id; })[0]; }
  function ibtn(icon, label, cls, extra) {
    return '<button type="button" class="doe-ibtn ' + (cls || '') + '" aria-label="' + label + '" title="' + label + '" ' + (extra || '') + '>' + ic(icon) + '</button>';
  }
  function kbd(k) { return '<kbd class="doe-kbd">' + k + '</kbd>'; }

  /* ── top bar ─────────────────────────────────────────── */
  function topbar() {
    var bps = D.BREAKPOINTS.map(function (b) {
      return '<button type="button" class="doe-bp' + (b.id === S.bp ? ' is-active' : '') + '" data-bp="' + b.id + '" aria-pressed="' + (b.id === S.bp) + '" title="' + b.label + '" aria-label="Preview at ' + b.label + '">' +
        ic(b.icon, b.rotate ? 'doe-ic--rot' : '') + '</button>';
    }).join('');
    var crumbs = S.nested
      ? '<a class="doe-doc__parent" href="structure.html">2018 Simple DO</a>' + ic('chevron-right', 'doe-doc__sep') +
        '<span class="doe-doc__name doe-doc__name--do">' + ic('component') + '2016 RB Navigation</span>'
      : '<span class="doe-doc__name">2018 Simple DO</span>' + ic('chevron-down', 'doe-doc__caret');
    return '' +
      '<header class="doe-topbar">' +
        '<div class="doe-topbar__left">' +
          ibtn('chevron-left', 'Back to Design Objects', 'doe-ibtn--ghost') +
          '<span class="doe-divider" aria-hidden="true"></span>' +
          '<div class="doe-doc">' + crumbs + '</div>' +
          '<span class="doe-savestate">' + '<span class="doe-dot doe-dot--warning" aria-hidden="true"></span>3 unsaved changes</span>' +
        '</div>' +
        '<div class="doe-topbar__centre">' +
          '<div class="doe-bps" role="group" aria-label="Breakpoint">' + bps + '</div>' +
          '<span class="doe-bpread" data-bpread>' + bpReadout() + '</span>' +
          '<button type="button" class="doe-zoom">100%' + ic('chevron-down') + '</button>' +
        '</div>' +
        '<div class="doe-topbar__right">' +
          ibtn('undo-2', 'Undo (⌘Z)', 'doe-ibtn--ghost') + ibtn('redo-2', 'Redo (⇧⌘Z)', 'doe-ibtn--ghost') +
          '<span class="doe-divider" aria-hidden="true"></span>' +
          '<div class="doe-seg" role="group" aria-label="Canvas view">' +
            '<button type="button" class="doe-seg__btn' + (S.mode === 'structure' ? ' is-active' : '') + '" data-mode="structure" aria-pressed="' + (S.mode === 'structure') + '">' + ic('square-dashed-mouse-pointer') + 'Structure</button>' +
            '<button type="button" class="doe-seg__btn' + (S.mode === 'preview' ? ' is-active' : '') + '" data-mode="preview" aria-pressed="' + (S.mode === 'preview') + '">' + ic('eye') + 'Preview</button>' +
          '</div>' +
          '<button type="button" class="doe-ibtn doe-ibtn--ghost" data-theme-flip aria-label="Toggle light/dark theme" title="Toggle light/dark (follows your Control Centre setting)">' + ic('moon', 'doe-theme-moon') + ic('sun', 'doe-theme-sun') + '</button>' +
          ibtn('arrow-up-right', 'Open live preview in a new tab', 'doe-ibtn--ghost') +
          '<button type="button" class="doe-btn doe-btn--primary">' + ic('check') + 'Save</button>' +
        '</div>' +
      '</header>';
  }
  function bpReadout() {
    var b = D.BREAKPOINTS.filter(function (x) { return x.id === S.bp; })[0];
    return b.width ? b.width + ' × auto' : 'Fluid · 1186px';
  }

  /* ── left rail ───────────────────────────────────────── */
  function rail() {
    function r(id, icon, label, key) {
      return '<button type="button" class="doe-rail__btn' + (S.left === id ? ' is-active' : '') + '" data-left="' + id + '" aria-pressed="' + (S.left === id) + '" title="' + label + ' (' + key + ')" aria-label="' + label + '">' + ic(icon) + '</button>';
    }
    return '<nav class="doe-rail" aria-label="Editor tools">' +
      r('library', 'plus', 'Add', 'A') + r('navigator', 'layers', 'Navigator', 'Z') + r('history', 'history', 'History', 'H') +
      '<span class="doe-rail__spacer"></span>' +
      '<button type="button" class="doe-rail__btn" title="Keyboard shortcuts (?)" aria-label="Keyboard shortcuts">' + ic('keyboard') + '</button>' +
      '<button type="button" class="doe-rail__btn" title="Help" aria-label="Help">' + ic('circle-help') + '</button>' +
    '</nav>';
  }

  /* ── navigator (layers tree) ─────────────────────────── */
  function navCell(c, depth, opts) {
    var sel = c.id === S.select ? ' is-selected' : '';
    var cls = 'doe-tree__item doe-tree__item--' + c.kind + sel + (opts && opts.dim ? ' is-dim' : '');
    var trail = '';
    if (c.incomplete) trail += '<span class="doe-tree__flag doe-tree__flag--warn" title="Needs content">' + ic('circle-dashed') + '</span>';
    if (c.hiddenAt) trail += '<span class="doe-tree__flag" title="Hidden at ' + c.hiddenAt.join(', ') + '">' + ic('eye-off') + '</span>';
    var chev = c.kind === 'do' ? ic(c.nested && S.nested ? 'chevron-down' : 'chevron-right', 'doe-tree__chev') : '<span class="doe-tree__chev"></span>';
    var html = '<li><button type="button" class="' + cls + '" style="--depth:' + depth + '" data-sel="' + c.id + '">' + chev +
      '<span class="doe-tree__icon">' + ic(kindIcon(c)) + '</span><span class="doe-tree__name">' + esc(c.name) + '</span>' +
      '<span class="doe-tree__trail">' + trail + '</span></button>';
    if (c.nested && S.nested) {
      html += '<ul class="doe-tree__group">' + c.nested.rows.map(function (r) { return navRow(r, depth + 1, true); }).join('') + '</ul>';
    }
    return html + '</li>';
  }
  function navRow(r, depth, inDo) {
    var sel = r.id === S.select ? ' is-selected' : '';
    return '<li><button type="button" class="doe-tree__item doe-tree__item--row' + sel + (inDo ? ' doe-tree__item--inDo' : '') + (S.nested && !inDo ? ' is-dim' : '') + '" style="--depth:' + depth + '" data-sel="' + r.id + '">' +
      ic('chevron-down', 'doe-tree__chev') + '<span class="doe-tree__icon">' + ic('rows-3') + '</span><span class="doe-tree__name">' + r.name + '</span>' +
      '<span class="doe-tree__meta">' + r.cells.length + '</span></button>' +
      '<ul class="doe-tree__group">' + r.cells.map(function (c) { return navCell(c, depth + 1, { dim: S.nested && !inDo && c.id !== 'c-header' }); }).join('') + '</ul></li>';
  }
  function navigator() {
    return '<section class="doe-panel__view" data-view="navigator"' + (S.left === 'navigator' ? '' : ' hidden') + '>' +
      '<div class="doe-panel__head"><h2 class="doe-panel__title">Navigator</h2>' + ibtn('chevrons-down-up', 'Collapse all', 'doe-ibtn--ghost doe-ibtn--sm') + '</div>' +
      '<div class="doe-panel__search">' + searchField('Find a cell or row') + '</div>' +
      '<div class="doe-panel__scroll"><ul class="doe-tree" role="tree">' +
        '<li><button type="button" class="doe-tree__item doe-tree__item--root" style="--depth:0">' + ic('chevron-down', 'doe-tree__chev') + '<span class="doe-tree__icon">' + ic('layout-template') + '</span><span class="doe-tree__name">2018 Simple DO</span></button>' +
        '<ul class="doe-tree__group">' + D.ROWS.map(function (r) { return navRow(r, 1); }).join('') + '</ul></li>' +
      '</ul></div>' +
      '<div class="doe-panel__foot"><button type="button" class="doe-notice doe-notice--warn" data-sel="c-prime">' + ic('circle-dashed') + '<span>1 cell needs content</span>' + ic('arrow-right') + '</button></div>' +
    '</section>';
  }
  function searchField(ph) {
    return '<label class="doe-search">' + ic('search') + '<input type="search" placeholder="' + ph + '" aria-label="' + ph + '"></label>';
  }

  /* ── add / library ───────────────────────────────────── */
  function library() {
    var recent = ['Article Listing', 'Text', 'Image'];
    function tile(name) {
      var e = D.ELEMENTS[name];
      return '<button type="button" class="doe-tile' + (S.insert && name === 'Article Listing' ? ' is-hover' : '') + '" draggable="true" data-name="' + name.toLowerCase() + '" title="' + e.desc + '">' +
        '<span class="doe-tile__icon">' + ic(e.icon) + '</span><span class="doe-tile__label">' + name + '</span></button>';
    }
    var cats = D.CATEGORIES.map(function (c) {
      return '<details class="doe-libcat" open><summary class="doe-libcat__head">' + ic('chevron-down', 'doe-libcat__chev') + c.label + '<span class="doe-libcat__count">' + c.items.length + '</span></summary>' +
        '<div class="doe-tiles">' + c.items.map(function (i) { return tile(i[0]); }).join('') + '</div></details>';
    }).join('');
    var dos = D.DESIGN_OBJECTS.map(function (d) {
      return '<button type="button" class="doe-libitem">' + '<span class="doe-libitem__icon doe-libitem__icon--do">' + ic('component') + '</span><span class="doe-libitem__text"><span class="doe-libitem__name">' + d[0] + '</span><span class="doe-libitem__meta">Used in ' + d[1] + ' design objects</span></span></button>';
    }).join('');
    var scripts = D.SCRIPTS.map(function (d) {
      return '<button type="button" class="doe-libitem">' + '<span class="doe-libitem__icon doe-libitem__icon--script">' + ic('code-xml') + '</span><span class="doe-libitem__text"><span class="doe-libitem__name">' + d[0] + '</span><span class="doe-libitem__meta">' + d[1] + '</span></span></button>';
    }).join('');
    return '<section class="doe-panel__view" data-view="library"' + (S.left === 'library' ? '' : ' hidden') + '>' +
      '<div class="doe-panel__head"><h2 class="doe-panel__title">Add</h2>' + ibtn('x', 'Close panel', 'doe-ibtn--ghost doe-ibtn--sm', 'data-left="none"') + '</div>' +
      '<div class="doe-libtabs" role="tablist">' +
        '<button type="button" role="tab" class="doe-libtabs__tab is-active" aria-selected="true" data-libtab="el">Elements</button>' +
        '<button type="button" role="tab" class="doe-libtabs__tab" aria-selected="false" data-libtab="do">Design objects</button>' +
        '<button type="button" role="tab" class="doe-libtabs__tab" aria-selected="false" data-libtab="sc">Scripts</button>' +
      '</div>' +
      '<div class="doe-panel__search">' + searchField('Search 41 elements') + '</div>' +
      '<div class="doe-panel__scroll">' +
        '<div data-libpane="el">' +
          '<div class="doe-libcat doe-libcat--recent"><p class="doe-libcat__head doe-libcat__head--static">' + ic('history') + 'Recently used</p><div class="doe-tiles">' + recent.map(tile).join('') + '</div></div>' +
          cats +
        '</div>' +
        '<div data-libpane="do" hidden><div class="doe-liblist">' + dos + '</div></div>' +
        '<div data-libpane="sc" hidden><div class="doe-liblist">' + scripts + '</div></div>' +
      '</div>' +
      '<div class="doe-panel__foot doe-panel__foot--hint">' + ic('mouse-pointer-2') + '<span>Drag onto the canvas, or click to add after the selection</span></div>' +
    '</section>';
  }

  function history() {
    var items = [
      ['Changed padding on AL DE', 'Just now', 'move'], ['Hid Topic related Content Multi Zone at 480px, 600px', '2 min ago', 'eye-off'],
      ['Moved Contacts into Row 3', '6 min ago', 'arrow-left-right'], ['Saved by Mark Foster', 'Today 09:12', 'cloud-check'],
      ['Replaced Smart HL Article element', 'Yesterday 16:40', 'replace'], ['Saved by Luis M.', 'Yesterday 16:41', 'cloud-check']
    ];
    return '<section class="doe-panel__view" data-view="history"' + (S.left === 'history' ? '' : ' hidden') + '>' +
      '<div class="doe-panel__head"><h2 class="doe-panel__title">History</h2></div>' +
      '<div class="doe-panel__scroll"><ol class="doe-history">' + items.map(function (i, n) {
        return '<li class="doe-history__item' + (n === 0 ? ' is-current' : '') + '">' + ic(i[2]) + '<span class="doe-history__text"><span>' + i[0] + '</span><span class="doe-history__time">' + i[1] + '</span></span></li>';
      }).join('') + '</ol></div></section>';
  }

  /* ── canvas: structure ───────────────────────────────── */
  function schematic(c) {
    var t = c.kind === 'de' ? c.type : c.kind;
    var e = D.ELEMENTS[t] || {};
    var line = function (w) { return '<span class="sk-line" style="--w:' + w + '"></span>'; };
    if (c.kind === 'empty') return '<div class="doe-empty"><p class="doe-empty__title">' + ic('plus') + 'Choose what goes in this cell</p><div class="doe-empty__opts">' +
      '<button type="button" class="doe-chipbtn">' + ic('blocks') + 'Element</button><button type="button" class="doe-chipbtn">' + ic('component') + 'Design object</button><button type="button" class="doe-chipbtn">' + ic('code-xml') + 'Script</button></div>' +
      '<p class="doe-empty__hint">or drag one in from the Add panel</p></div>';
    if (c.kind === 'do') return '<div class="sk sk--do">' + (c.nested ? c.nested.rows[0].cells : [1, 2, 3]).map(function (x) { return '<span class="sk-box" style="--span:' + (x.span || 4) + '"></span>'; }).join('') + '</div>';
    if (c.kind === 'script') return '<div class="sk sk--code">' + line('60%') + line('80%') + line('40%') + '</div>';
    if (e.cat === 'listings' || t === 'News' || t === 'Topic Related Content' || t === 'Manually Related Content') {
      return '<div class="sk sk--list">' + [1, 2, 3].map(function () { return '<span class="sk-row"><span class="sk-thumb"></span><span class="sk-lines">' + line('90%') + line('60%') + '</span></span>'; }).join('') + '</div>';
    }
    if (e.cat === 'carousels') return '<div class="sk sk--cards">' + [1, 2, 3].map(function () { return '<span class="sk-card"><span class="sk-thumb sk-thumb--wide"></span>' + line('80%') + '</span>'; }).join('') + '</div>';
    if (t === 'Prime Content') return '<div class="sk">' + line('70%') + line('40%') + '<span class="sk-thumb sk-thumb--hero"></span>' + line('100%') + line('95%') + line('60%') + '</div>';
    if (t === 'Channel/Section Details') return '<div class="sk">' + line('30%') + line('55%') + '</div>';
    if (t === 'Menu') return '<div class="sk sk--pills">' + [1, 2, 3, 4, 5].map(function () { return '<span class="sk-pill"></span>'; }).join('') + '</div>';
    if (t === 'Image') return '<div class="sk"><span class="sk-thumb sk-thumb--logo"></span></div>';
    if (t === 'Search' || t === 'Login') return '<div class="sk"><span class="sk-field"></span></div>';
    if (e.cat === 'members') return '<div class="sk">' + line('50%') + '<span class="sk-field"></span></div>';
    return '<div class="sk">' + line('60%') + line('90%') + line('75%') + '</div>';
  }

  function selToolbar(c, isRow) {
    var label = isRow ? ic('rows-3') + c.name : ic(kindIcon(c)) + esc(c.name);
    var tools = isRow
      ? ibtn('grip-vertical', 'Drag to move row', 'doe-ibtn--sm doe-ibtn--grip') + ibtn('plus', 'Add cell', 'doe-ibtn--sm') + ibtn('copy', 'Duplicate (⌘D)', 'doe-ibtn--sm') + ibtn('ellipsis', 'More actions', 'doe-ibtn--sm')
      : ibtn('grip-vertical', 'Drag to move', 'doe-ibtn--sm doe-ibtn--grip') +
        (c.kind === 'do' ? ibtn('square-pen', 'Edit design object', 'doe-ibtn--sm') : ibtn('settings-2', 'Element settings', 'doe-ibtn--sm', 'data-tab-go="content"')) +
        ibtn('arrow-up', 'Select parent row (⇧Enter)', 'doe-ibtn--sm') + ibtn('copy', 'Duplicate (⌘D)', 'doe-ibtn--sm') + ibtn('ellipsis', 'More actions', 'doe-ibtn--sm');
    return '<div class="doe-sel' + (c.kind === 'do' || c.kind === 'nestedSel' ? ' doe-sel--do' : '') + '"><span class="doe-sel__tag">' + label + '</span><span class="doe-sel__tools">' + tools + '</span></div>';
  }

  function sCell(c, inDo) {
    var sel = c.id === S.select;
    var cls = 'doe-cell doe-cell--' + c.kind + (sel ? ' is-selected' : '') + (c.incomplete ? ' is-incomplete' : '') + (c.hiddenAt && hiddenNow(c) ? ' is-hidden' : '') + (inDo ? ' doe-cell--inDo' : '');
    var badge = '';
    if (c.incomplete) badge = '<span class="doe-cell__badge doe-cell__badge--warn">' + ic('circle-dashed') + 'Needs content</span>';
    else if (c.hiddenAt) badge = '<span class="doe-cell__badge" title="Hidden at ' + c.hiddenAt.join(', ') + '">' + ic('eye-off') + c.hiddenAt.join(', ') + '</span>';
    else if (c.kind === 'do') badge = '<span class="doe-cell__badge doe-cell__badge--do">' + ic('component') + 'Used in ' + (c.nested ? c.nested.usedIn : c.usedIn) + '</span>';
    var inner;
    if (c.nested && S.nested) {
      inner = '<div class="doe-nested">' + c.nested.rows.map(function (r) { return sRow(r, true); }).join('') + '</div>';
    } else {
      inner = '<div class="doe-cell__head"><span class="doe-cell__icon">' + ic(kindIcon(c)) + '</span><span class="doe-cell__name">' + esc(c.name) + '</span>' +
        (c.kind !== 'empty' ? '<span class="doe-cell__type">' + esc(c.type) + '</span>' : '') + badge + '</div>' + schematic(c);
    }
    return '<div class="' + cls + '" style="--span:' + c.span + '" data-sel="' + c.id + '" tabindex="-1">' +
      (sel ? selToolbar(c) : '') + inner + '</div>';
  }
  function hiddenNow(c) { return c.hiddenAt.indexOf(S.bp + 'px') !== -1; }

  function sRow(r, inDo) {
    var sel = r.id === S.select;
    var dim = S.nested && !inDo && r.id !== 'r1';
    var cells = r.cells.map(function (c) { return sCell(c, inDo); }).join('');
    if (S.insert && r.id === 'r5') cells = cells.replace('<div class="doe-cell doe-cell--empty', '<span class="doe-insert" aria-hidden="true"><span class="doe-insert__plus">' + ic('plus') + '</span></span><div class="doe-cell doe-cell--empty');
    return '<div class="doe-row' + (sel ? ' is-selected' : '') + (dim ? ' is-dim' : '') + (inDo ? ' doe-row--inDo' : '') + (S.context === r.id ? ' is-context' : '') + '" data-sel="' + r.id + '">' +
      (sel ? selToolbar(r, true) : '<span class="doe-row__tag">' + ic('rows-3') + r.name + (r.wrap ? ' · wraps' : '') + '</span>') +
      '<div class="doe-row__grid">' + cells + '</div>' +
      (!inDo ? '<button type="button" class="doe-row__add" aria-label="Add row below ' + r.name + '" title="Add row below">' + ic('plus') + '</button>' : '') +
    '</div>';
  }

  function structure() {
    return '<div class="doe-canvas doe-canvas--structure"' + (S.mode === 'structure' ? '' : ' hidden') + '>' +
      D.ROWS.map(function (r) { return sRow(r, false); }).join('') + '</div>';
  }

  /* ── canvas: preview (approximate render of the live page) ── */
  var PV = {
    header: function () {
      return '<div class="pv-header"><span class="pv-logo">Lion<b>Media</b></span><nav class="pv-nav"><span>News</span><span>Analysis</span><span>Events</span><span>Jobs</span><span>Podcasts</span></nav>' +
        '<span class="pv-header__end">' + ic('search') + '<span class="pv-btn pv-btn--sm">Sign in</span></span></div>';
    },
    'Channel/Section Details': function () { return '<p class="pv-eyebrow">Channel</p><h1 class="pv-h1">Business News</h1><p class="pv-lede">The stories shaping UK media, publishing and events this week.</p>'; },
    'Prime Content': function () {
      return '<p class="pv-eyebrow">Analysis · 6 min read</p><h2 class="pv-h2">Why regional publishers are betting on events</h2><p class="pv-meta">By Hannah Okafor · 9 November 2026</p><div class="pv-img pv-img--hero"></div>' +
        '<p class="pv-p">Ticket revenue overtook print advertising at three of the five largest regional groups last year, and the gap is widening. Here is what the leaders did differently.</p>';
    },
    'Article Listing': function () {
      return '<h3 class="pv-h3">Latest</h3>' + ['Audience revenue hits record high', 'Five takeaways from Publishing Expo', 'The newsletter playbook, two years on'].map(function (t, i) {
        return '<div class="pv-li"><div class="pv-img pv-img--thumb"></div><div><p class="pv-li__title">' + t + '</p><p class="pv-meta">' + (i + 2) + ' hours ago</p></div></div>';
      }).join('');
    },
    'Contact Listing': function () {
      return '<h3 class="pv-h3">Contributors</h3>' + ['Hannah Okafor', 'James Whitlock', 'Priya Raman'].map(function (n) {
        return '<div class="pv-li"><span class="pv-avatar">' + n.split(' ').map(function (p) { return p[0]; }).join('') + '</span><div><p class="pv-li__title">' + n + '</p><p class="pv-meta">Senior reporter</p></div></div>';
      }).join('');
    },
    'Event Listing': function () {
      return '<h3 class="pv-h3">Upcoming events</h3>' + [['14', 'NOV', 'Media Leaders Summit'], ['02', 'DEC', 'Awards Night 2026'], ['21', 'JAN', 'Subscriptions Forum']].map(function (e) {
        return '<div class="pv-li"><span class="pv-date"><b>' + e[0] + '</b>' + e[1] + '</span><div><p class="pv-li__title">' + e[2] + '</p><p class="pv-meta">London</p></div></div>';
      }).join('');
    },
    carousel: function (title) {
      return '<div class="pv-carousel__head"><h3 class="pv-h3">' + title + '</h3><span class="pv-arrows">' + ic('chevron-left') + ic('chevron-right') + '</span></div><div class="pv-cards">' +
        ['Paywalls that work', 'Inside the newsroom', 'Video first?', 'The AI desk'].map(function (t) { return '<div class="pv-card"><div class="pv-img pv-img--card"></div><p class="pv-li__title">' + t + '</p></div>'; }).join('') + '</div>';
    },
    generic: function (c) { return '<h3 class="pv-h3">' + esc(c.name) + '</h3><p class="pv-p">' + esc(c.type) + ' content renders here.</p>'; },
    'Mailing List': function () { return '<h3 class="pv-h3">Get the Briefing</h3><p class="pv-p">Every weekday at 7am.</p><div class="pv-form"><span class="pv-input">Email address</span><span class="pv-btn">Sign up</span></div>'; },
    footer: function () { return '<div class="pv-footer"><span class="pv-logo">Lion<b>Media</b></span><nav class="pv-nav"><span>About</span><span>Advertise</span><span>Contact</span><span>Privacy</span></nav></div>'; }
  };
  function pvContent(c) {
    if (c.id === 'c-header') return PV.header();
    if (c.id === 'c-footer') return PV.footer();
    var e = D.ELEMENTS[c.type] || {};
    if (PV[c.type]) return PV[c.type](c);
    if (e.cat === 'carousels') return PV.carousel(c.name);
    if (c.kind === 'script') return '<div class="pv-promo">' + ic('sparkles') + 'Subscribe for £1 a week for your first 3 months</div>';
    if (e.cat === 'listings' || e.cat === 'related') return PV['Article Listing']().replace('Latest', esc(c.name));
    return PV.generic(c);
  }
  function preview() {
    var rows = D.ROWS.map(function (r) {
      return '<div class="pv-row">' + r.cells.map(function (c) {
        if (c.hiddenAt && hiddenNow(c)) return '';
        var sel = c.id === S.select;
        return '<div class="pv-block' + (sel ? ' is-selected' : '') + (c.incomplete ? ' is-incomplete' : '') + '" style="--span:' + c.span + '" data-sel="' + c.id + '">' + (sel ? selToolbar(c) : '<span class="pv-block__tag">' + ic(kindIcon(c)) + esc(c.name) + '</span>') + pvContent(c) + '</div>';
      }).join('') + '</div>';
    }).join('');
    /* data-brand="cc" on the frame re-declares the LIGHT cc tokens, so the page preview stays a
       light "website" even when the editor chrome is dark, the way Figma/Webflow show content. */
    return '<div class="doe-canvas doe-canvas--preview" data-brand="cc"' + (S.mode === 'preview' ? '' : ' hidden') + '>' + rows + '</div>';
  }

  function contextMenu() {
    if (!S.context) return '';
    function mi(icon, label, key, cls) { return '<button type="button" class="doe-menu__item ' + (cls || '') + '" role="menuitem">' + ic(icon) + '<span>' + label + '</span>' + (key ? '<span class="doe-menu__key">' + key + '</span>' : '') + '</button>'; }
    return '<div class="doe-menu" role="menu" aria-label="Row 3 actions">' +
      '<p class="doe-menu__label">Add cell</p>' +
      '<div class="doe-menu__grid">' +
        '<button type="button" class="doe-menu__dir" role="menuitem">' + ic('arrow-up') + 'Above</button><button type="button" class="doe-menu__dir" role="menuitem">' + ic('arrow-down') + 'Below</button>' +
        '<button type="button" class="doe-menu__dir" role="menuitem">' + ic('arrow-left') + 'Left</button><button type="button" class="doe-menu__dir" role="menuitem">' + ic('arrow-right') + 'Right</button>' +
      '</div><span class="doe-menu__sep"></span>' +
      mi('scissors', 'Cut', '⌘X') + mi('copy', 'Copy', '⌘C') + mi('clipboard-paste', 'Paste cells', '⌘V') + mi('copy-plus', 'Duplicate', '⌘D') +
      '<span class="doe-menu__sep"></span>' + mi('arrow-up', 'Move up', '⌥↑') + mi('arrow-down', 'Move down', '⌥↓') +
      '<span class="doe-menu__sep"></span>' + mi('component', 'Save as design object…', '⌥⌘K') + mi('eye-off', 'Hide at this breakpoint', '') +
      '<span class="doe-menu__sep"></span>' + mi('trash-2', 'Delete row', '⌫', 'doe-menu__item--danger') +
    '</div>';
  }

  function stage() {
    var b = D.BREAKPOINTS.filter(function (x) { return x.id === S.bp; })[0];
    var banner = S.nested
      ? '<div class="doe-isolate">' + ic('component') + '<span><b>Editing design object: 2016 RB Navigation.</b> Used in 14 design objects, so changes apply everywhere.</span>' +
        '<a class="doe-btn doe-btn--do" href="structure.html">' + ic('check') + 'Done</a></div>'
      : '';
    return '<main class="doe-stage" aria-label="Canvas">' + banner +
      '<div class="doe-stage__scroll"><div class="doe-frame" data-frame style="' + (b.width ? '--frame:' + b.width + 'px' : '') + '">' +
        '<div class="doe-frame__ruler"><span>' + (b.width ? b.label : 'Fluid') + '</span></div>' +
        structure() + preview() + contextMenu() +
      '</div></div></main>';
  }

  /* ── inspector ───────────────────────────────────────── */
  function sec(title, inner, open, extra) {
    return '<details class="doe-sec"' + (open ? ' open' : '') + '><summary class="doe-sec__head">' + ic('chevron-down', 'doe-sec__chev') + '<span>' + title + '</span>' + (extra || '') + '</summary><div class="doe-sec__body">' + inner + '</div></details>';
  }
  function field(label, control, mod) {
    return '<div class="doe-field"><span class="doe-field__label' + (mod ? ' is-mod' : '') + '">' + label + '</span><div class="doe-field__ctl">' + control + '</div></div>';
  }
  function sel(v) { return '<button type="button" class="doe-select"><span>' + v + '</span>' + ic('chevrons-up-down') + '</button>'; }
  function seg(opts, active, iconOnly) {
    return '<div class="doe-seg doe-seg--fill">' + opts.map(function (o, i) {
      var isA = i === active;
      return '<button type="button" class="doe-seg__btn' + (isA ? ' is-active' : '') + '" aria-pressed="' + isA + '" ' + (iconOnly ? 'title="' + o[1] + '" aria-label="' + o[1] + '"' : '') + '>' + (iconOnly ? ic(o[0]) : o) + '</button>';
    }).join('') + '</div>';
  }
  function sw(on) { return '<button type="button" class="doe-switch' + (on ? ' is-on' : '') + '" role="switch" aria-checked="' + on + '"><span class="doe-switch__knob"></span></button>'; }
  function num(v, unit, ph) { return '<label class="doe-num"><input type="text" value="' + (v || '') + '" placeholder="' + (ph || 'Auto') + '">' + (unit ? '<span class="doe-num__unit">' + unit + '</span>' : '') + '</label>'; }
  function toggleRow(label, on, mod) { return '<div class="doe-toggle"><span class="doe-field__label' + (mod ? ' is-mod' : '') + '">' + label + '</span>' + sw(on) + '</div>'; }

  function bpScope() {
    var b = D.BREAKPOINTS.filter(function (x) { return x.id === S.bp; })[0];
    if (!b.width) return '<div class="doe-scope">' + ic('monitor') + '<span>Editing <b>Fluid</b>. Changes cascade to every breakpoint.</span></div>';
    return '<div class="doe-scope doe-scope--override">' + ic(b.icon, b.rotate ? 'doe-ic--rot' : '') + '<span>Editing at <b>' + b.label + '</b>. Changes apply to ' + b.label + ' and smaller.</span><span class="doe-scope__count">2 overrides</span></div>';
  }

  function boxModel() {
    function v(val, mod, pos) { return '<button type="button" class="doe-box__v doe-box__v--' + pos + (mod ? ' is-mod' : '') + '">' + val + '</button>'; }
    return '<div class="doe-box"><span class="doe-box__label">Margin</span>' +
      v('0', false, 't') + v('0', false, 'r') + v('24', true, 'b') + v('0', false, 'l') +
      '<div class="doe-box__inner"><span class="doe-box__label">Padding</span>' + v('16', true, 't') + v('16', true, 'r') + v('16', true, 'b') + v('16', true, 'l') +
      '<span class="doe-box__core"></span></div></div>';
  }

  function cellLayout() {
    return bpScope() +
      sec('Appearance',
        field('Design style', sel('Card, light')) + field('Design frame', sel('Not set')) +
        field('Spacing', seg(['None', 'S', 'M', 'L'], 2)), true) +
      sec('Alignment',
        field('Horizontal', seg([['align-horizontal-justify-start', 'Left'], ['align-horizontal-justify-center', 'Centre'], ['align-horizontal-justify-end', 'Right'], ['align-horizontal-space-between', 'Stretch']], 0, true)) +
        field('Vertical', seg([['align-start-horizontal', 'Top'], ['align-center-horizontal', 'Middle'], ['align-end-horizontal', 'Bottom']], 0, true)) +
        field('Float', seg(['None', 'Left', 'Right'], 0)) + field('Clear', seg(['None', 'Left', 'Right', 'Both'], 0)), true) +
      sec('Size',
        '<div class="doe-grid2">' + field('Width', num('', 'px')) + field('Height', num('', 'px')) + field('Min W', num('', 'px')) + field('Min H', num('', 'px')) + field('Max W', num('480', 'px'), true) + field('Max H', num('', 'px')) + '</div>', true) +
      sec('Spacing', boxModel(), true, '<span class="doe-sec__mod" title="Modified">5</span>') +
      sec('Background',
        field('Colour', '<button type="button" class="doe-colour"><span class="doe-colour__swatch"></span><span>surface / secondary</span>' + ic('link-2') + '</button>', true) +
        field('Image', '<button type="button" class="doe-imgpick">' + ic('image') + '<span>Choose image</span></button>'), false) +
      sec('Advanced',
        field('Custom ID', '<label class="doe-num doe-num--text"><input type="text" value="exhibitor_listing2"></label>') +
        field('Custom class', '<div class="doe-chips"><span class="doe-chip">card-tight' + ic('x') + '</span><button type="button" class="doe-chip doe-chip--add">' + ic('plus') + 'Add</button></div>') +
        toggleRow('Sticky', false) +
        '<div class="doe-grid2">' + field('Content rows', num('', '', '—')) + field('Content columns', num('', '', '—')) + '</div>' +
        field('Outer CSS', '<textarea class="doe-code" rows="2" placeholder="e.g. border-top: 1px solid …"></textarea>') +
        field('Inner CSS', '<textarea class="doe-code" rows="2"></textarea>'), false);
  }

  function cellContent(c) {
    return '<div class="doe-ctoolbar">' + searchField('Search 64 settings') + '<button type="button" class="doe-filter is-on">' + ic('circle-dot') + 'Modified 6</button></div>' +
      sec('Source', field('Channel', sel('Business News')) + field('Sections', '<div class="doe-chips"><span class="doe-chip">Analysis' + ic('x') + '</span><span class="doe-chip">Interviews' + ic('x') + '</span><button type="button" class="doe-chip doe-chip--add">' + ic('plus') + 'Add</button></div>', true), true, '<span class="doe-sec__mod">2</span>') +
      sec('Main', toggleRow('Show secured content', true) + toggleRow('Hide comments & ratings (detail)', false) + toggleRow('Show sponsored content only', false), false) +
      sec('Listing data',
        '<div class="doe-grid2">' + field('Start at', num('1', '')) + field('Max items', num('6', ''), true) + '</div>' +
        toggleRow('Show item name', true) + field('Title character limit', num('90', 'chars'), true) +
        toggleRow('Show item intro', true) + field('Intro character limit', num('160', 'chars')) +
        field('Hide intro at', '<div class="doe-bpchips">' + ['480', '600', '800'].map(function (w, i) { return '<button type="button" class="doe-bpchip' + (i < 3 ? ' is-on' : '') + '">' + w + '</button>'; }).join('') + '<button type="button" class="doe-bpchip">1024</button><button type="button" class="doe-bpchip">1200</button></div>', true) +
        toggleRow('Do not include duplicates', true, true) + toggleRow('Show previous/next links', false) +
        field('Load more button', seg(['Off', 'Left', 'Centre', 'Full'], 3)), true, '<span class="doe-sec__mod">4</span>') +
      sec('Listing image', toggleRow('Show item image', true) + field('Image type', sel('Item thumbnail')) + field('Max image size', sel('Medium · 480px')), false) +
      sec('Standard', toggleRow('Show more button', true) + field('More button alignment', seg(['Text end', 'Left', 'Right'], 0)) + toggleRow('Show RSS icon', false), false) +
      sec('Meta data', '', false, '<span class="doe-sec__count">14</span>') +
      sec('Item tags', '', false, '<span class="doe-sec__count">6</span>') +
      sec('Item icons', '', false, '<span class="doe-sec__count">5</span>');
  }

  function visibility(c) {
    var hidden = c.hiddenAt || ['480px'];
    return bpScope() +
      sec('Show at breakpoints',
        '<p class="doe-help">Click a breakpoint to hide this ' + (c.cells ? 'row' : 'cell') + ' there. Hidden cells stay on the canvas, faded.</p>' +
        '<div class="doe-devices">' + D.BREAKPOINTS.map(function (b) {
          var off = hidden.indexOf(b.label) !== -1;
          return '<button type="button" class="doe-device' + (off ? ' is-off' : '') + '" aria-pressed="' + !off + '">' + ic(b.icon, b.rotate ? 'doe-ic--rot' : '') + '<span>' + b.label + '</span>' + ic(off ? 'eye-off' : 'eye', 'doe-device__eye') + '</button>';
        }).join('') + '</div>', true) +
      sec('Audience',
        field('Content security right', sel('Non-secured')) +
        '<span class="doe-field__label">Exclude for</span>' +
        '<div class="doe-chips doe-chips--toggle">' + [['Affino staff', false], ['Logged in', false], ['Logged out', true], ['Metered content', false]].map(function (a) {
          return '<button type="button" class="doe-chip doe-chip--toggle' + (a[1] ? ' is-on' : '') + '" aria-pressed="' + a[1] + '">' + (a[1] ? ic('check') : '') + a[0] + '</button>';
        }).join('') + '</div>', true) +
      sec('Behaviour', toggleRow('Sticky', false) + toggleRow('Lazy load below the fold', true), true);
  }

  function emptyInspector() {
    function card(icon, title, desc, cls, on) {
      return '<button type="button" class="doe-kindcard doe-kindcard--' + cls + (on ? ' is-on' : '') + '" aria-pressed="' + !!on + '"><span class="doe-kindcard__icon">' + ic(icon) + '</span><span class="doe-kindcard__text"><b>' + title + '</b><span>' + desc + '</span></span>' + ic('chevron-right', 'doe-kindcard__chev') + '</button>';
    }
    return '<div class="doe-insp__head"><span class="doe-insp__icon doe-insp__icon--empty">' + ic('square-dashed') + '</span><div class="doe-insp__titles"><input class="doe-insp__name" value="New cell" aria-label="Cell name"><span class="doe-insp__type">Empty cell · Row 5</span></div></div>' +
      '<div class="doe-insp__body"><div class="doe-pad">' +
        '<p class="doe-insp__lead">What should this cell show?</p>' +
        card('blocks', 'Design element', 'A listing, carousel, form, menu or other built-in element', 'de', true) +
        card('component', 'Design object', 'Reuse a saved layout, such as a header or footer', 'do') +
        card('code-xml', 'Design script', 'Custom HTML, CSS or JavaScript', 'script') +
        '<p class="doe-help">' + ic('lightbulb') + '<span>Tip: press ' + kbd('/') + ' on the canvas to search elements without leaving the keyboard.</span></p>' +
      '</div></div>';
  }

  function rowLayout(r) {
    function preset(cols, label, on) {
      return '<button type="button" class="doe-preset' + (on ? ' is-on' : '') + '" aria-pressed="' + !!on + '" title="' + label + '">' + cols.map(function (c) { return '<span style="flex:' + c + '"></span>'; }).join('') + '</button>';
    }
    return bpScope() +
      sec('Structure',
        '<div class="doe-presets">' + preset([1], '1 column') + preset([1, 1], '2 columns') + preset([2, 1], '2/3 + 1/3', true) + preset([1, 2], '1/3 + 2/3') + preset([1, 1, 1], '3 columns') + preset([1, 1, 1, 1], '4 columns') + preset([1, 2, 1], '1/4 + 1/2 + 1/4') +
        '<button type="button" class="doe-preset doe-preset--custom" title="Custom">' + ic('sliders-horizontal') + '</button></div>' +
        toggleRow('Wrap cells onto new lines', true, true) +
        field('Horizontal align', seg([['align-horizontal-justify-start', 'Left'], ['align-horizontal-justify-center', 'Centre'], ['align-horizontal-justify-end', 'Right']], 1, true)), true) +
      sec('Outer row',
        field('Width', seg(['Fluid', 'Contained'], 0)) +
        field('Horizontal padding', seg(['None', 'S', 'M', 'L'], 1), true) +
        field('Vertical padding', seg(['None', 'S', 'M', 'L'], 2)), true, '<span class="doe-sec__mod">1</span>') +
      sec('Size', '<div class="doe-grid2">' + field('Width', num('', '%')) + field('Min W', num('', 'px')) + field('Max W', num('1240', 'px')) + '</div>', true) +
      sec('Background',
        field('Colour', '<button type="button" class="doe-colour"><span class="doe-colour__swatch doe-colour__swatch--none"></span><span>None</span></button>') +
        field('Image', '<button type="button" class="doe-imgpick">' + ic('image') + '<span>Choose image</span></button>'), false) +
      sec('Advanced', toggleRow('Sticky', false) + field('Outer row CSS', '<textarea class="doe-code" rows="2"></textarea>') + field('Inner row CSS', '<textarea class="doe-code" rows="2"></textarea>'), false);
  }

  function inspector() {
    var hitC = findCell(S.select);
    var row = !hitC && findRow(S.select);
    var html;
    if (hitC && hitC.cell.kind === 'empty') {
      html = emptyInspector();
    } else {
      var isRow = !!row;
      var c = isRow ? row : hitC.cell;
      var tabs = isRow ? [['layout', 'Layout'], ['visibility', 'Visibility']] : [['content', c.kind === 'do' ? 'Object' : 'Content'], ['layout', 'Layout'], ['visibility', 'Visibility']];
      if (isRow && S.tab === 'content') S.tab = 'layout';
      var head = isRow
        ? '<span class="doe-insp__icon">' + ic('rows-3') + '</span><div class="doe-insp__titles"><input class="doe-insp__name" value="' + row.name + '" aria-label="Row name"><span class="doe-insp__type">Row · ' + row.cells.length + ' cells' + (row.wrap ? ' · wraps' : '') + '</span></div>'
        : '<span class="doe-insp__icon doe-insp__icon--' + c.kind + '">' + ic(kindIcon(c)) + '</span><div class="doe-insp__titles"><input class="doe-insp__name" value="' + esc(c.name) + '" aria-label="Cell name"><span class="doe-insp__type">' + esc(c.type) + ' · DCC ' + c.dcc + '</span></div>' +
          '<button type="button" class="doe-btn doe-btn--quiet doe-btn--sm" title="Replace with another element">' + ic('replace') + 'Replace</button>';
      var panes = {
        content: isRow ? '' : cellContent(c),
        layout: isRow ? rowLayout(row) : cellLayout(),
        visibility: visibility(c)
      };
      html = '<div class="doe-insp__head">' + head + '</div>' +
        (hitC && hitC.cell.incomplete ? '<div class="doe-alert">' + ic('circle-dashed') + '<span>This cell has no content yet. Choose a channel in <b>Source</b>.</span></div>' : '') +
        '<div class="doe-tabs" role="tablist">' + tabs.map(function (t) {
          return '<button type="button" role="tab" class="doe-tabs__tab' + (S.tab === t[0] ? ' is-active' : '') + '" aria-selected="' + (S.tab === t[0]) + '" data-tab="' + t[0] + '">' + t[1] + '</button>';
        }).join('') + '</div>' +
        '<div class="doe-insp__body">' + tabs.map(function (t) {
          return '<div role="tabpanel" data-pane="' + t[0] + '"' + (S.tab === t[0] ? '' : ' hidden') + '>' + panes[t[0]] + '</div>';
        }).join('') + '</div>';
    }
    return '<aside class="doe-insp" aria-label="Inspector">' + html + '</aside>';
  }

  /* ── status bar ──────────────────────────────────────── */
  function statusbar() {
    var hitC = findCell(S.select);
    var row = hitC ? hitC.row : findRow(S.select);
    var path = '<button type="button" class="doe-crumb">' + ic('layout-template') + '2018 Simple DO</button>';
    if (S.nested) path += ic('chevron-right', 'doe-crumb__sep') + '<button type="button" class="doe-crumb doe-crumb--do">' + ic('component') + 'Header</button>';
    if (row) path += ic('chevron-right', 'doe-crumb__sep') + '<button type="button" class="doe-crumb">' + ic('rows-3') + row.name + '</button>';
    if (hitC) path += ic('chevron-right', 'doe-crumb__sep') + '<button type="button" class="doe-crumb is-current">' + ic(kindIcon(hitC.cell)) + esc(hitC.cell.name) + '</button>';
    return '<footer class="doe-status"><nav class="doe-status__path" aria-label="Selection path">' + path + '</nav>' +
      '<span class="doe-status__meta">7 rows · 24 cells · <span class="doe-status__warn">1 needs content</span></span>' +
      '<span class="doe-status__hint">' + kbd('/') + ' add element ' + kbd('⌘D') + ' duplicate ' + kbd('⌫') + ' delete</span></footer>';
  }

  /* ── mount ───────────────────────────────────────────── */
  function render() {
    document.getElementById('doe').innerHTML =
      topbar() +
      '<div class="doe-body' + (S.left === 'none' ? ' doe-body--noleft' : '') + '">' + rail() +
        '<aside class="doe-panel"' + (S.left === 'none' ? ' hidden' : '') + '>' + navigator() + library() + history() + '</aside>' +
        stage() + inspector() +
      '</div>' + statusbar();
    if (window.lucide) lucide.createIcons();
    /* Context menu opens beside the right-clicked row (mock position: right of its top edge). */
    var menu = document.querySelector('.doe-menu');
    var row = S.context && document.querySelector('.doe-row[data-sel="' + S.context + '"]');
    if (menu && row) {
      menu.style.setProperty('--menu-top', (row.offsetTop + 40) + 'px');
      menu.style.setProperty('--menu-left', Math.max(0, row.offsetLeft + row.offsetWidth * 0.55) + 'px');
    }
  }
  render();
  /* Bring the selection into view on load (e.g. the new cell in Row 5 on add-element.html). */
  var selEl = document.querySelector('.doe-stage .is-selected');
  var scroller = document.querySelector('.doe-stage__scroll');
  if (selEl && scroller) {
    var top = selEl.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
    if (top > scroller.clientHeight * 0.6) scroller.scrollTop = top - 96;
  }
  var treeSel = document.querySelector('.doe-tree .is-selected');
  if (treeSel) treeSel.scrollIntoView({ block: 'nearest' });

  /* ── interactions (visual only) ──────────────────────── */
  document.addEventListener('click', function (e) {
    var t = e.target;
    var m = t.closest('[data-mode]'); if (m && m.tagName === 'BUTTON') { S.mode = m.dataset.mode; S.context = ''; return render(); }
    var b = t.closest('[data-bp]'); if (b && b.tagName === 'BUTTON') { S.bp = b.dataset.bp; return render(); }
    var l = t.closest('button[data-left]'); if (l) { S.left = (S.left === l.dataset.left || l.dataset.left === 'none') ? 'none' : l.dataset.left; return render(); }
    var tab = t.closest('[data-tab]'); if (tab && tab.getAttribute('role') === 'tab') { S.tab = tab.dataset.tab; return render(); }
    var go = t.closest('[data-tab-go]'); if (go) { S.tab = go.dataset.tabGo; return render(); }
    if (t.closest('[data-theme-flip]')) {
      var dark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (dark) document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', 'dark');
      try { localStorage.setItem('demo-theme', dark ? 'light' : 'dark'); } catch (err) { /* storage unavailable */ }
      return;
    }
    var lt = t.closest('[data-libtab]');
    if (lt) {
      document.querySelectorAll('[data-libtab]').forEach(function (x) { var on = x === lt; x.classList.toggle('is-active', on); x.setAttribute('aria-selected', on); });
      document.querySelectorAll('[data-libpane]').forEach(function (p) { p.hidden = p.dataset.libpane !== lt.dataset.libtab; });
      return;
    }
    if (t.closest('.doe-sel, .doe-insp, .doe-menu, .doe-topbar')) return;
    var s = t.closest('[data-sel]');
    if (s) {
      e.preventDefault();
      S.select = s.dataset.sel; S.context = '';
      if (findRow(S.select) && S.tab === 'content') S.tab = 'layout';
      return render();
    }
    if (S.context && !t.closest('.doe-menu')) { S.context = ''; render(); }
  });
  document.addEventListener('contextmenu', function (e) {
    var r = e.target.closest('.doe-row[data-sel]');
    if (!r || S.mode !== 'structure') return;
    e.preventDefault(); S.select = r.dataset.sel; S.context = r.dataset.sel; S.tab = 'layout'; render();
  });
  document.addEventListener('input', function (e) {
    if (!e.target.closest('[data-view="library"] .doe-search')) return;
    var q = e.target.value.trim().toLowerCase();
    document.querySelectorAll('[data-view="library"] .doe-tile').forEach(function (tile) { tile.hidden = q && tile.dataset.name.indexOf(q) === -1; });
  });
  window.addEventListener('storage', function (e) {
    if (e.key !== 'demo-theme') return;
    if (e.newValue === 'dark') document.documentElement.setAttribute('data-theme', 'dark'); else document.documentElement.removeAttribute('data-theme');
  });
})();
