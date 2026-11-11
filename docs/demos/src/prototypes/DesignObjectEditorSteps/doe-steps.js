/* Design Object Editor: the incremental route.
 * BASELINE = Luismi's redesign as seen on lion.comrzdev.com on 2026-11-09 (DO 99, "2018 Simple DO"):
 * his class names (cc-p-doe__*), cells as .record-section cards, right-hand property panels,
 * the radio-list Cell Content picker and the long checkbox settings modal.
 * STEPS layer improvements from ../DesignObjectEditor on top, one switch each:
 *   1  bordered tool buttons + element icon & type on every cell header
 *   2  searchable, grouped element picker in the Cell Content panel (replaces the radio list)
 *   3  settings modal: search, "modified" filter, collapsible sections, switches
 *   4  clear selected state + status chips on the title line (needs content / hidden at / used in)
 *   5  row structure: each row a labelled, filled box; property-panel groups boxed the same way
 *   6  editor layout: compact editor bar replaces the CC top nav + page header (breakpoints move into it);
 *      the properties panel docks full-height on the right instead of floating as a card
 *   7  add cell on the canvas: + buttons on a hovered / selected cell's edges, and direction buttons
 *      in the cell menu, replace the Add Cell radio panel
 * Steps come from ?steps=1,2,… and the demo gear menu; the URL updates so each state is linkable.
 * TODO(backend:DesignObjectEditor): visual-only mock — no save, no real DO data. */
(function () {
  var D = window.DOE_DATA;
  var params = new URLSearchParams(location.search);
  var S = {
    steps: (params.get('steps') || '').split(',').filter(Boolean).map(Number),
    select: params.get('select') || '',
    panel: params.get('panel') || '',      // cellProps | rowProps | content | addCell
    modal: params.get('modal') === '1',
    menu: params.get('menu') || '',
    nested: params.get('nested') || '',
    dirty: false,
    vals: {},
    secOpen: {},
    clip: null,
    saveState: 'idle',   // idle | saving | saved
    bp: 'fluid',
    panelW: readW()
  };
  /* Docked panel width (step 6), remembered per browser. */
  var PANEL_MIN = 320, PANEL_MAX = 720;
  function readW() { try { var w = parseInt(localStorage.getItem('doe-steps-panel-w'), 10); return w >= PANEL_MIN ? w : 384; } catch (e) { return 384; } }
  function saveW() { try { localStorage.setItem('doe-steps-panel-w', String(S.panelW)); } catch (e) { /* storage unavailable */ } }
  function clampW(w) {
    var shell = document.querySelector('.cc-p-doe--s6');
    var max = shell ? Math.min(PANEL_MAX, Math.round(shell.clientWidth * 0.6)) : PANEL_MAX;
    return Math.max(PANEL_MIN, Math.min(max, Math.round(w)));
  }
  function applyW() {
    var shell = document.querySelector('.cc-p-doe--s6.has-panel');
    if (shell) shell.style.gridTemplateColumns = 'minmax(0, 1fr) ' + S.panelW + 'px';
    var h = document.querySelector('.cc-p-doe__resize');
    if (h) { h.setAttribute('aria-valuenow', S.panelW); h.setAttribute('aria-valuemin', PANEL_MIN); h.setAttribute('aria-valuemax', PANEL_MAX); }
  }
  function on(n) { return S.steps.indexOf(n) !== -1; }

  /* Baseline layout as the live editor drew it: every cell full width, except Text & Image +
     Edition Highlights, which sat side by side. */
  var BASE_SPAN = { 'c-textimg': 4, 'c-edition': 8 };

  function ic(name, cls) { return '<i data-lucide="' + name + '" class="' + (cls || '') + '" aria-hidden="true"></i>'; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function elIcon(c) {
    if (c.kind === 'do') return 'component';
    if (c.kind === 'script') return 'code-xml';
    return (D.ELEMENTS[c.type] || {}).icon || 'square';
  }
  /* Lion, read 2026-11-10 (DO 99). Overrides doe-data.js here only, because the full prototype's
     nested screen depends on the original sample. FOOTER MENU is a Menu element (Footer Mega Menu),
     not a design object, and 2016 RB Navigation's real contents are below (spans from lion). */
  /* Breakpoints: the profile can hold any widths (users add their own), so the icon is worked out from the
     width rather than fixed per breakpoint (Mark, 2026-11-10). Two custom widths are added to show it. */
  function bpIconFor(w) {
    if (!w || w > 1200) return { icon: 'monitor', rotate: false };
    if (w > 1000) return { icon: 'laptop', rotate: false };
    if (w > 800) return { icon: 'tablet', rotate: true };       // tablet, landscape
    if (w > 600) return { icon: 'tablet', rotate: false };      // tablet, portrait
    if (w > 480) return { icon: 'smartphone', rotate: true };   // phone, landscape
    return { icon: 'smartphone', rotate: false };
  }
  if (!D.BREAKPOINTS.some(function (b) { return b.custom; })) {
    D.BREAKPOINTS.splice(1, 0, { id: '1440', label: '1440px', width: 1440, custom: true });
    D.BREAKPOINTS.push({ id: '375', label: '375px', width: 375, custom: true });
  }
  D.BREAKPOINTS.forEach(function (b) { var i0 = bpIconFor(b.width); b.icon = i0.icon; b.rotate = i0.rotate; });
  /* Lion's own profile (the baseline mirrors it) has no custom widths. */
  function baseBps() { return D.BREAKPOINTS.filter(function (b) { return !b.custom; }); }
  function mk(id, name, type, dcc, span) { return { id: id, name: name, kind: 'de', type: type, dcc: dcc, span: span }; }
  var headerCell = D.ROWS[0].cells[0];
  headerCell.nested = { name: '2016 RB Navigation', usedIn: 14, rows: [
    { id: 'n1', name: 'Row 1', cells: [mk('n-geo', 'Geo Targeting', 'Geo Targeting', 3679, 12)] },
    { id: 'n2', name: 'Row 2', cells: [mk('n-logo', 'Logo', 'Image', 1627, 2), mk('n-currency', 'Currency', 'Currency Selector', 2087, 2),
      mk('n-basket', 'Shopping Basket', 'Shopping Basket', 2088, 2), mk('n-login', 'Login', 'Button', 3945, 2)] },
    { id: 'n3', name: 'Row 3', cells: [mk('n-levels', 'Levels DE', 'Levels', 1638, 6), mk('n-search', 'Search Image', 'Button', 2895, 2)] },
    { id: 'n4', name: 'Row 4', cells: [mk('n-menu', 'Menu cell', 'Menu', 3099, 12)] } ] };
  var HEADER_NESTED = headerCell.nested;
  headerCell.doType = 'Row';
  var footerCell = D.ROWS[6].cells[0];
  footerCell.kind = 'de'; footerCell.type = 'Menu'; delete footerCell.nested; delete footerCell.usedIn;
  /* Fuller design-object list for the picker (first page as seen on lion; 67 in total there). */
  var DO_LIST = [['2016 RB Navigation', 'Row'], ['2016 Gill Test', 'Row'], ['2016 RB Article Prime Content', 'Cell'], ['2016 RB Article Related Content', 'Cell'],
    ['2016 RB Article Skin', 'Row'], ['2016 RB Blog Skin', 'Row'], ['2016 RB Burger Menu', 'Row'], ['2016 RB Campaign Navigation', 'Row'],
    ['2016 Footer', 'Row'], ['Newsletter promo', 'Cell'], ['Article sidebar', 'Cell'], ['Event detail header', 'Row'], ['Two-column landing', 'Row']];
  function doTypeOf(name) { var d0 = DO_LIST.filter(function (x) { return x[0] === name; })[0]; return d0 ? d0[1] : 'Row'; }
  /* Design Scripts picker list (first entries as on lion, plus this DO's own script). */
  var SCRIPT_LIST = [['Promo strip script', 'Content HTML'], ['19 DIQ Dynamic Form', 'ColdFusion'], ['19 RMM Magazine Filters (CF)', 'ColdFusion'],
    ['19 RMM Magazine Filters (HTML)', 'Content HTML'], ['2016 CS Google Map Embed', 'Content HTML'], ['2019 DataIQ Filters', 'ColdFusion'],
    ['2019 LBR Predictive Search', 'ColdFusion'], ['2023 AI Chat', 'ColdFusion'], ['22 ChartJS HTML', 'Content HTML'], ['22 Apex Chart - Line', 'Content HTML']];
  function nestedCell() { return S.nested ? D.ROWS.reduce(function (a, r) { return a || r.cells.filter(function (c) { return c.id === S.nested && c.nested; })[0]; }, null) : null; }
  function canvasRows() { var n = nestedCell(); return n ? n.nested.rows : D.ROWS; }
  function allRows() {
    var rows = D.ROWS.slice();
    D.ROWS.forEach(function (r) { r.cells.forEach(function (c) { if (c.nested) rows = rows.concat(c.nested.rows); }); });
    return rows;
  }
  function findCell(id) {
    var hit = null;
    allRows().forEach(function (r) { r.cells.forEach(function (c) { if (c.id === id) hit = { cell: c, row: r }; }); });
    return hit;
  }
  function findRow(id) { return allRows().filter(function (r) { return r.id === id; })[0]; }

  /* ── canvas ─────────────────────────────────────────── */
  function tool(icon, label, act, id) {
    return '<button type="button" class="cc-p-doe__tool" title="' + label + '" aria-label="' + label + '" data-act="' + act + '" data-id="' + id + '">' + ic(icon) + '</button>';
  }
  function cellHtml(c, r) {
    var selected = S.select === c.id;
    /* Lion: the green / orange status is a toggle the editor sets, written straight away (not via Save). */
    var status = c.incomplete
      ? '<button type="button" class="cc-p-doe__status cc-p-doe__status--incomplete" data-act="toggleDone" data-id="' + c.id + '" title="Cell incomplete — click to mark complete" aria-label="Cell incomplete, mark complete">' + ic('circle-dashed') + '</button>'
      : '<button type="button" class="cc-p-doe__status" data-act="toggleDone" data-id="' + c.id + '" title="Cell complete — click to mark incomplete" aria-label="Cell complete, mark incomplete">' + ic('circle-check') + '</button>';
    var head;
    if (on(1)) {
      /* Given name only; the element type lives in the icon's tooltip and the panel header (Mark, 2026-11-10). */
      head = '<span class="cc-p-doe__el-icon cc-p-doe__el-icon--' + c.kind + '" title="' + (c.type ? esc(c.type) : 'No content') + '">' + ic(elIcon(c)) + '</span>' +
        '<span class="cc-p-doe__name">' + esc(c.name) + '</span>';
    } else {
      head = '<span class="cc-p-doe__name">' + esc(c.name) + '</span>';
    }
    var badges = '';
    if (on(4)) {
      if (c.incomplete) badges += '<button type="button" class="badge badge--warning cc-p-doe__badge-btn" data-act="toggleDone" data-id="' + c.id + '" title="Marked incomplete — click to mark complete">' + ic('circle-dashed') + 'Incomplete</button>';
      if (!c.type) badges += '<span class="badge badge--neutral">' + ic('square-dashed') + 'Empty</span>';
      if (c.hiddenAt) badges += '<span class="badge badge--neutral">' + ic('eye-off') + 'Hidden at ' + c.hiddenAt.join(', ') + '</span>';
      if (c.kind === 'do') badges += '<span class="badge cc-p-doe__badge--do">' + ic('component') + 'Used in ' + (c.nested ? c.nested.usedIn : c.usedIn) + '</span>';
    }
    /* Step 4 moves the status into the badge, so the bare icon only shows when it adds something. */
    var showStatus = !(on(4) && c.incomplete);
    var tools = tool('sliders-horizontal', 'Cell properties', 'cellProps', c.id) +
      tool(on(1) ? 'pencil' : 'square-pen', 'Edit cell content', 'content', c.id) +
      (c.kind === 'do' && c.nested ? tool(on(1) ? 'log-in' : 'search', on(1) ? 'Go into this design object' : 'Open the nested Design Object', 'nested', c.id) : '') +
      (hasClearable(c) ? tool('eraser', 'Clear', 'clear', c.id) : '') +
      '<span class="cc-p-doe__menu-wrap">' + tool('ellipsis-vertical', 'Cell actions', 'menu', c.id) + '</span>';
    var span = BASE_SPAN[c.id] || (S.nested && c.span) || 12;
    return '<section class="record-section cc-p-doe__cell' + (selected ? ' is-selected' : '') + (c.incomplete ? ' is-incomplete' : '') + (hiddenNow(c) ? ' is-hidden-bp' : '') + '" style="--span:' + span + '" data-cell="' + c.id + '">' +
      '<div class="cc-p-doe__cell-head">' + '<span class="cc-p-doe__grip" data-doe-grip title="Drag to move">' + ic('grip-vertical') + '</span>' + head +
        /* Step 4: "complete" is the normal state, so it shows nothing; a flag to mark the cell incomplete
           appears on hover / selection (Mark, 2026-11-10). It leads the label group, in the slot the
           Incomplete label takes, so flagging doesn't jump and other labels sit hard right (2026-11-11).
           The baseline keeps lion's tick. */
        (on(4)
          ? '<span class="cc-p-doe__badges">' + (c.incomplete ? '' : '<button type="button" class="cc-p-doe__flag" data-act="toggleDone" data-id="' + c.id + '" title="Mark incomplete" aria-label="Mark ' + esc(c.name) + ' incomplete">' + ic('flag') + '</button>') + badges + '</span>'
          : (badges ? '<span class="cc-p-doe__badges">' + badges + '</span>' : '') + (showStatus && !badges ? status : '')) + '</div>' +
      '<div class="cc-p-doe__tools">' + tools + '</div>' +
      (on(7) ? addDirs(c).map(function (d) {
        return '<button type="button" class="cc-p-doe__addc cc-p-doe__addc--' + d[0] + '" data-act="addAt" data-id="' + c.id + '" data-where="' + d[0] + '" title="' + d[2] + '" aria-label="' + d[2] + '">' + ic('plus') + '</button>';
      }).join('') : '') +
    '</section>';
  }
  /* Clear (lion, 2026-11-10): a menu of Clear Content / Clear Properties / Clear Both. */
  /* Lion: the Clear button shows only on a cell with content. */
  function hasClearable(c) { return !!c.type; }
  function clearCell(id, what) {
    var hit = findCell(id); if (!hit) return;
    var c = hit.cell;
    if (what === 'both') { blank(c); markDirty(); return; }
    if (what === 'content') {
      if (c.kind === 'do') delete c.nested;     // the design object is taken out of the cell
      c.name = 'Blank Cell';                     // a cleared cell is blank again, whatever it was called (Mark, 2026-11-11)
      c.kind = 'de'; c.type = '';             // the complete / incomplete flag is untouched (as lion)
    }
    if (what === 'props') {
      /* lion keeps only identity and content: Name, Custom ID, Custom Class */
      dropVals(id, /\|(name|customId|customClass|b:Name|b:Custom ID|b:Custom Class)$/);
      delete c.hiddenAt;
    }
    markDirty();
  }

  /* Moving cells (drag and drop + the menu's moves). Lion's rules: a cell drops beside any cell of a
     row that takes cells, or at the end of such a row; a row left empty goes; a design object alone in
     its row moves the whole row, above or below another row (its row takes no cells). */
  /* Lion's rule (design-object-editor.js §4): only a design object of TYPE Row, alone in its row, is a
     "layout" cell — its row has no row settings and takes no cells, and the cell moves as the row. A
     Cell-type design object behaves as any other cell. */
  function isLayoutCell(c) { return c.kind === 'do' && (c.doType || doTypeOf(c.type)) === 'Row'; }
  function isCellRow(r) { return !(r.cells.length === 1 && isLayoutCell(r.cells[0])); }
  function rowMover(r, c) { return r.cells.length === 1 && isLayoutCell(c); }
  function loneLayout(c) { var at = locate(c.id); return !!at && rowMover(canvasRows()[at.i], c); }
  /* Delete / Cut / Copy / Paste (lion §6). Cut keeps a copy and blanks the cell; Paste puts a fresh copy
     in the target cell; Delete removes it, and a row left empty goes. Properties travel with the copy. */
  function valsOf(id) { var o = {}; Object.keys(S.vals).forEach(function (k) { if (k.indexOf(id + '|') === 0) o[k.slice(id.length + 1)] = S.vals[k]; }); return o; }
  function dropVals(id, keep) { Object.keys(S.vals).forEach(function (k) { if (k.indexOf(id + '|') === 0 && !(keep && keep.test(k))) delete S.vals[k]; }); }
  function blank(c) { delete c.nested; delete c.hiddenAt; c.kind = 'de'; c.type = ''; c.name = 'Blank Cell'; c.dcc = 0; c.incomplete = false; dropVals(c.id); }
  var newSeq = 0;
  function cellOp(op, id) {
    var at = locate(id), rows = canvasRows(); if (!at) return;
    var c = rows[at.i].cells[at.j];
    if (op === 'copy' || op === 'cut') S.clip = { cell: JSON.parse(JSON.stringify(c)), vals: valsOf(id) };
    if (op === 'cut') blank(c);
    if (op === 'paste' && S.clip) {
      var n = JSON.parse(JSON.stringify(S.clip.cell));
      n.id = 'c-paste-' + (++newSeq); n.dcc = 0;
      if (S.clip.cell.nested) n.nested = S.clip.cell.nested === HEADER_NESTED || S.clip.cell.type === '2016 RB Navigation' ? HEADER_NESTED : n.nested;
      rows[at.i].cells[at.j] = n;
      Object.keys(S.clip.vals).forEach(function (k) { S.vals[n.id + '|' + k] = S.clip.vals[k]; });
      dropVals(id);
      S.select = n.id;
    }
    if (op === 'delete') {
      rows[at.i].cells.splice(at.j, 1);
      if (!rows[at.i].cells.length) rows.splice(at.i, 1);
      dropVals(id);
      if (S.select === id) { S.select = ''; S.panel = ''; }
    }
    if (op !== 'copy') markDirty();
  }
  function moveCell(fromRow, fromIdx, toRow, toIdx) {
    var rows = canvasRows(), src = rows[fromRow];
    var cell = src.cells.splice(fromIdx, 1)[0];
    if (toRow === fromRow && toIdx > fromIdx) toIdx--;
    rows[toRow].cells.splice(toIdx, 0, cell);
    if (!src.cells.length) rows.splice(fromRow, 1);
    markDirty();
  }
  function moveRow(fromRow, toRow) {
    var rows = canvasRows(), row = rows.splice(fromRow, 1)[0];
    rows.splice(toRow > fromRow ? toRow - 1 : toRow, 0, row);
    markDirty();
  }
  function locate(id) {
    var rows = canvasRows();
    for (var i = 0; i < rows.length; i++) for (var j = 0; j < rows[i].cells.length; j++) if (rows[i].cells[j].id === id) return { i: i, j: j };
    return null;
  }
  /* Menu moves: Left/Right swap with the neighbour; Up/Down send the cell to the end of the row above /
     below (a lone design object moves its row instead). */
  function menuMove(id, dir) {
    var at = locate(id), rows = canvasRows(); if (!at) return;
    var r = rows[at.i], c = r.cells[at.j];
    if (dir === 'left') moveCell(at.i, at.j, at.i, at.j - 1);
    else if (dir === 'right') moveCell(at.i, at.j, at.i, at.j + 2);
    else if (rowMover(r, c)) {
      var row = rows.splice(at.i, 1)[0];
      rows.splice(Math.max(0, Math.min(rows.length, at.i + (dir === 'up' ? -1 : 1))), 0, row);
      markDirty();
    } else {
      /* to the end of the nearest row above / below that can take cells (lion's moveVertical) */
      var step = dir === 'up' ? -1 : 1;
      for (var k = at.i + step; k >= 0 && k < rows.length; k += step) {
        if (!isCellRow(rows[k])) continue;
        moveCell(at.i, at.j, k, rows[k].cells.length);
        break;
      }
    }
  }

  /* Lion only offers the moves that are possible: Left/Right when there is a neighbour on that side,
     Up / Down only towards a row that can take cells (checked on every cell + lion's code, 2026-11-10). */
  function moveItems(id) {
    var rows = canvasRows(), out = [];
    rows.forEach(function (r, ri) {
      var ci = r.cells.map(function (c) { return c.id; }).indexOf(id);
      if (ci === -1) return;
      if (ci > 0) out.push(['arrow-left', 'Move Left', 'moveLeft']);
      if (ci < r.cells.length - 1) out.push(['arrow-right', 'Move Right', 'moveRight']);
      /* Up / Down only when a row that can take cells lies that way (lion's actionItems) */
      if (rows.slice(0, ri).some(isCellRow)) out.push(['arrow-up', 'Move Up', 'moveUp']);
      if (rows.slice(ri + 1).some(isCellRow)) out.push(['arrow-down', 'Move Down', 'moveDown']);
    });
    return out;
  }
  function cellMenu() {
    /* '__doc' = the editor bar's ⋮ (design-object actions); anything else is a cell id. */
    var clearFor = S.menu.indexOf('clear:') === 0 ? S.menu.slice(6) : '';
    if (clearFor) {
      return '<div class="dropdown__panel cc-p-doe__menu" role="menu"><ul class="dropdown__list">' +
        [['eraser', 'Clear Content', 'clearContent'], ['brush-cleaning', 'Clear Properties', 'clearProps'], ['circle-x', 'Clear Both', 'clearBoth']].map(function (i) {
          return '<li role="none"><button type="button" class="dropdown-item dropdown-item--xs" role="menuitem" data-act="' + i[2] + '" data-id="' + clearFor + '">' + ic(i[0]) + '<span data-text="' + i[1] + '">' + i[1] + '</span></button></li>';
        }).join('') + '</ul></div>';
    }
    if (S.menu === '__dos') {
      /* Design object switcher: search, recent, all. TODO(backend:DesignObjectEditor): recent list + search → design objects API. */
      var recent = ['2018 Simple DO', '2016 RB Navigation', 'Article sidebar', 'Two-column landing', 'Event detail header', 'Newsletter promo'];
      var ncM = nestedCell(), focused = ncM ? ncM.nested.name : '2018 Simple DO';
      return '<div class="dropdown__panel cc-p-doe__menu cc-p-doe__dos-menu" role="menu">' +
        (S.dirty ? '<p class="cc-p-doe__menu-warn">' + ic('triangle-alert') + 'Unsaved changes will be lost if you switch</p>' : '') +
        /* in a nested design object, the way back up comes first */
        (ncM ? '<p class="cc-p-doe__menu-head">Parent</p><ul class="dropdown__list"><li role="none"><button type="button" class="dropdown-item dropdown-item--xs" role="menuitem" data-act="exitNested">' +
          ic('corner-left-up') + '<span data-text="2018 Simple DO">2018 Simple DO</span></button></li></ul><span class="cc-p-doe__menu-sep" role="separator"></span>' : '') +
        '<div class="cc-p-doe__menu-search">' + ic('search') + '<input type="search" placeholder="Search design objects" aria-label="Search design objects" data-dos-search></div>' +
        '<p class="cc-p-doe__menu-head">Recent</p><ul class="dropdown__list">' + recent.map(function (n) {
          var cur = n === focused;
          return '<li role="none" data-dos-item="' + esc(n.toLowerCase()) + '"><button type="button" class="dropdown-item dropdown-item--xs' + (cur ? ' is-current' : '') + '" role="menuitem" data-act="switchDo" data-id="' + esc(n) + '">' +
            ic('component') + '<span data-text="' + esc(n) + '">' + esc(n) + '</span>' + (cur ? ic('check', 'cc-p-doe__bp-check') : '') + '</button></li>';
        }).join('') +
        '<li role="separator" class="cc-p-doe__menu-sep"></li>' +
        '<li role="none"><button type="button" class="dropdown-item dropdown-item--xs" role="menuitem" data-act="switchDo" data-id="__all">' + ic('list') + '<span data-text="All design objects…">All design objects…</span></button></li></ul></div>';
    }
    if (S.menu === '__bp') {
      return '<div class="dropdown__panel cc-p-doe__menu cc-p-doe__bp-menu" role="menu"><ul class="dropdown__list">' +
        D.BREAKPOINTS.map(function (b) {
          var cur1 = b.id === S.bp;
          return '<li role="none"><button type="button" class="dropdown-item dropdown-item--xs' + (cur1 ? ' is-current' : '') + '" role="menuitemradio" aria-checked="' + cur1 + '" data-act="bp" data-id="' + b.id + '">' +
            ic(b.icon, b.rotate ? 'cc-p-doe__rot' : '') + '<span data-text="' + b.label + '">' + b.label + '</span>' +
            (b.custom ? '<span class="cc-p-doe__bp-tag">Custom</span>' : '') + (cur1 ? ic('check', 'cc-p-doe__bp-check') : '') + '</button></li>';
        }).join('') + '</ul></div>';
    }
    var items = S.menu === '__doc'
      /* Named so they can't be mistaken for editing the design object's layout (Mark, 2026-11-10). */
      ? [['plus', 'Create new design object'], ['file-pen-line', 'Edit details'], null, ['copy', 'Copy design object'], ['list', 'Go to list']]
      : (on(7) ? [] : [['plus', 'Add Cell', 'addCell']]).concat([['trash-2', 'Delete Cell', 'deleteCell']]).concat([, ['scissors', 'Cut Content', 'cutCell'], ['copy', 'Copy Content', 'copyCell']])
          .concat(S.clip ? [['clipboard-paste', 'Paste Content', 'pasteCell']] : [])
          .concat(on(4) ? [(findCell(S.menu) || {}).cell && findCell(S.menu).cell.incomplete ? ['flag-off', 'Mark complete', 'toggleDone'] : ['flag', 'Mark incomplete', 'toggleDone']] : [])
          .concat(moveItems(S.menu));
    /* Step 7: "Add cell" is a row of direction buttons at the top of the cell menu — one click adds. */
    var addHead = '';
    if (on(7) && S.menu !== '__doc') {
      var hm = findCell(S.menu), dirs = addDirs(hm && hm.cell);
      var DIR_IC = { top: 'arrow-up', bottom: 'arrow-down', left: 'arrow-left', right: 'arrow-right' };
      if (dirs.length) addHead = '<p class="cc-p-doe__menu-head">Add cell</p><div class="cc-p-doe__menu-dirs">' + dirs.map(function (d) {
        return '<button type="button" class="cc-p-doe__menu-dir" role="menuitem" data-act="addAt" data-id="' + S.menu + '" data-where="' + d[0] + '" title="' + d[2] + '">' + ic(DIR_IC[d[0]]) + '<span>' + d[1] + '</span></button>';
      }).join('') + '</div><span class="cc-p-doe__menu-sep" role="separator"></span>';
    }
    return '<div class="dropdown__panel cc-p-doe__menu" role="menu">' + addHead + '<ul class="dropdown__list">' + items.map(function (i) {
      if (!i) return '<li role="separator" class="cc-p-doe__menu-sep"></li>';
      return '<li role="none"><button type="button" class="dropdown-item dropdown-item--xs" role="menuitem"' + (i[2] ? ' data-act="' + i[2] + '" data-id="' + S.menu + '"' : ' data-act="noop"') + '>' + ic(i[0]) + '<span data-text="' + i[1] + '">' + i[1] + '</span></button></li>';
    }).join('') + '</ul></div>';
  }
  function bpLabel() { var b = D.BREAKPOINTS.filter(function (x) { return x.id === S.bp; })[0]; return b ? b.label : 'Fluid'; }
  function bpWidth() { var b = D.BREAKPOINTS.filter(function (x) { return x.id === S.bp; })[0]; return b && b.width; }
  function hiddenNow(c) { return !!(c.hiddenAt && c.hiddenAt.indexOf(bpLabel()) !== -1); }
  function rowHtml(r, n) {
    var sel = S.select === r.id;
    /* Lion: the row that holds a nested design object has no row-properties button; every other
       row (including all rows inside a nested DO) has one. */
    var gutter = isCellRow(r);
    return '<div class="cc-p-doe__row' + (gutter ? ' cc-p-doe__row--gutter' : '') + (sel ? ' is-selected' : '') + '" data-row="' + r.id + '">' +
      (on(5) ? '<span class="cc-p-doe__row-tag">' + ic('rows-3') + 'Row ' + (n + 1) + ' · ' + r.cells.length + (r.cells.length === 1 ? ' cell' : ' cells') + '</span>' : '') +
      '<div class="cc-p-doe__cells">' + r.cells.map(function (c) {
        /* lion draws a cell hidden at the current breakpoint with display:none; step 4 keeps it, faded */
        if (hiddenNow(c) && !on(4)) return '';
        return cellHtml(c, r);
      }).join('') + '</div>' +
      (gutter ? '<div class="cc-p-doe__gutter">' + tool('sliders-horizontal', 'Row ' + (n + 1) + ' properties', 'rowProps', r.id) + '</div>' : '') +
    '</div>';
  }

  /* ── right-hand panels ──────────────────────────────── */
  /* Baseline panels: same S.vals binding, keyed "<selected id>|b:<label>" (Hide at shares the
     docked panel's "hide:" keys so both layouts agree). */
  var BASE_OPTS = { 'Design Style': 'style', 'Design Frame': 'frame', 'Content Security Right': 'security', 'Spacing': 'size',
    'Horizontal': 'hAlign', 'Vertical': 'vAlign', 'Float': 'float', 'Clear': 'clear', 'Horizontal Padding': 'size', 'Vertical Padding': 'size', 'Horizontal Align': 'rowAlign' };
  function bk(label) { return S.select + '|b:' + label; }
  function input(label, value, ph) {
    var k = bk(label);
    return '<div class="input"><label class="input__label">' + label + '</label><div class="input__wrap"><input type="text" class="input__control" data-k="' + esc(k) + '" value="' + esc(vget(k, value || '')) + '" placeholder="' + (ph || '') + '"></div></div>';
  }
  function select(label, value) {
    var opts = OPTS[BASE_OPTS[label]] || [value];
    return '<div class="sel"><label class="sel__label">' + label + '</label>' + ddButton(bk(label), value, opts, 'sel__control') + '</div>';
  }
  function checkbox(label, checked, key) {
    var k = key ? S.select + '|' + key : bk(label), on = vget(k, !!checked) === true;
    return '<label class="checkbox"><input type="checkbox" class="checkbox__input" data-k="' + esc(k) + '"' + (on ? ' checked' : '') + '><span class="checkbox__indicator">' + ic('check') + '</span><span class="checkbox__label"><span class="checkbox__label-text">' + label + '</span></span></label>';
  }
  function radio(name, label, checked) {
    return '<label class="radio"><input type="radio" class="radio__input" name="' + name + '"' + (checked ? ' checked' : '') + '><span class="radio__indicator"></span><span class="radio__label"><span class="radio__label-text">' + label + '</span></span></label>';
  }
  function group(title, inner) { return '<div class="cc-p-doe__pgroup"><h3 class="cc-p-doe__pgroup-title">' + title + '</h3>' + inner + '</div>'; }
  function grid(n, inner) { return '<div class="cc-p-doe__pgrid cc-p-doe__pgrid--' + n + '">' + inner + '</div>'; }
  function sub(t) { return '<p class="cc-p-doe__psub">' + t + '</p>'; }

  function panelShell(title, body, saveAct) {
    return '<aside class="cc-p-doe__panel' + (on(6) ? ' cc-p-doe-insp' : '') + '" aria-label="' + title + '">' +
      (on(6) ? '<div class="cc-p-doe__resize" role="separator" aria-orientation="vertical" aria-label="Resize panel" tabindex="0" title="Drag to resize"></div>' : '') +
      '<div class="cc-p-doe__panel-head"><h2 class="cc-p-doe__panel-title">' + title + '</h2>' +
      (on(6)
        /* Docked panel: changes are saved with the editor bar's Save, so the panel only closes. */
        ? '<button type="button" class="cc-p-doe__ghost" data-act="close" aria-label="Close panel" title="Close">' + ic('x') + '</button></div>'
        : '<button type="button" class="btn btn--tertiary btn--sm" data-act="close">Cancel</button>' +
          '<button type="button" class="btn btn--primary btn--sm" data-act="' + (saveAct || 'close') + '">Save</button></div>') +
      '<div class="cc-p-doe__panel-body">' + body + '</div></aside>';
  }
  function cellPropsPanel(c) {
    /* Design object cells only take Custom ID, Custom Class, Sticky and Name (lion, 2026-11-10). */
    if (c.kind === 'do') return panelShell('Cell Properties', group('Main', input('Custom ID', '') + input('Custom Class', '') + checkbox('Sticky', false) + input('Name', c.name)));
    return panelShell('Cell Properties',
      group('Main', input('Custom ID', c.id === 'c-prime' ? 'exhibitor_listing2' : '') + input('Custom Class', '') + checkbox('Sticky', false) +
        input('Name', c.name) + select('Design Style', 'Not set') + select('Design Frame', 'Not set') + select('Content Security Right', 'Non-secured') +
        '<p class="cc-p-doe__plabel">Exclude Content Security Right</p>' + checkbox('Affino') + checkbox('Logged In') + checkbox('Logged Out') + checkbox('Metered Content') +
        select('Spacing', 'Medium')) +
      group('Breakpoint specific: Fluid',
        sub('Align') + grid(2, select('Horizontal', 'Not set') + select('Vertical', 'Not set') + select('Float', 'Not set') + select('Clear', 'Not set')) +
        grid(3, input('Width') + input('Min-Width') + input('Max-Width') + input('Height') + input('Min-Height') + input('Max-Height')) +
        sub('Margin') + grid(4, input('Top') + input('Right') + input('Bottom') + input('Left')) +
        sub('Padding') + grid(4, input('Top') + input('Right') + input('Bottom') + input('Left')) +
        '<p class="cc-p-doe__plabel">Background image</p><div class="cc-p-doe__pinline"><span>None</span><button type="button" class="btn btn--secondary btn--sm">Choose</button></div>' +
        input('Background colour') + input('Outer CSS') + input('Inner CSS') + grid(2, input('Content rows') + input('Content columns')) +
        '<p class="cc-p-doe__plabel">Hide at</p>' + grid(3, baseBps().map(function (b) { return checkbox(b.label, c.hiddenAt && c.hiddenAt.indexOf(b.label) !== -1, 'hide:' + b.label); }).join(''))));
  }
  function rowPropsPanel(r) {
    return panelShell('Row Properties',
      group('Main', select('Content Security Right', 'Non-secured')) +
      group('Outer row: Fluid', grid(2, select('Horizontal Padding', 'Medium') + select('Vertical Padding', 'Medium'))) +
      group('Breakpoint specific: Fluid', grid(2, select('Horizontal Align', 'Center') + '<div class="cc-p-doe__pcheck">' + checkbox('Sticky') + '</div>') +
        /* lion fills these defaults as the panel opens: Width 100%, Max-Width 1280px, Align Center */
        grid(3, input('Width', '100%') + input('Min-Width') + input('Max-Width', '1280px')) +
        '<p class="cc-p-doe__plabel">Background image</p><div class="cc-p-doe__pinline"><span>None</span><button type="button" class="btn btn--secondary btn--sm">Choose</button></div>' +
        input('Background colour') + input('Outer Row CSS') + input('Inner Row CSS')));  // Wrap removed: deprecated (Mark, 2026-11-10)
  }
  /* Add Cell (lion §12): Above / Below unless the design object being edited is a Cell type; Left / Right
     unless the selected cell is a lone Row-type design object. Adds a Blank Cell. */
  /* The directions a cell can be added in beside cell c: [where, label, description]. */
  function addDirs(c) {
    var nc = nestedCell(), out = [];
    var vertical = !(nc && (nc.doType || doTypeOf(nc.type)) === 'Cell');
    if (vertical) out.push(['top', 'Above', 'Add a cell in a new row above'], ['bottom', 'Below', 'Add a cell in a new row below']);
    if (!(c && loneLayout(c))) out.push(['left', 'Left', 'Add a cell to the left'], ['right', 'Right', 'Add a cell to the right']);
    return out;
  }
  function addCellPanel() {
    var hit = findCell(S.select);
    var opts = addDirs(hit && hit.cell);
    var def = opts.length && opts[0][0] === 'top' ? 'bottom' : 'left';
    var radios = opts.map(function (o) {
      return '<label class="radio"><input type="radio" class="radio__input" name="add" value="' + o[0] + '"' + (o[0] === def ? ' checked' : '') + '><span class="radio__indicator"></span><span class="radio__label"><span class="radio__label-text">' + o[1] + '</span></span></label>';
    }).join('');
    return panelShell('Add Cell', radios + (on(6) ? '<button type="button" class="btn btn--primary btn--sm cc-p-doe__add-go" data-act="addCellSave">' + ic('plus') + 'Add cell</button>' : ''), 'addCellSave');
  }
  function addCellAt(where) {
    var at = locate(S.select), rows = canvasRows(); if (!at) return;
    var n = { id: 'c-new-' + (++newSeq), name: 'Blank Cell', kind: 'de', type: '', dcc: 0, span: 12 };
    if (where === 'top' || where === 'bottom') rows.splice(at.i + (where === 'bottom' ? 1 : 0), 0, { id: 'r-new-' + newSeq, name: 'Row', cells: [n] });
    else rows[at.i].cells.splice(at.j + (where === 'right' ? 1 : 0), 0, n);
    S.select = n.id; S.panel = 'content'; S.kindTab = ''; S.modal = false;   // a new cell is blank, so it opens Cell Content (Mark, 2026-11-11)
    markDirty();
  }
  function contentPanel(c) {
    var current = c.kind === 'de' ? c.type : '';
    if (!on(2)) {
      var list = D.CATEGORIES.reduce(function (a, cat) { return a.concat(cat.items.map(function (i) { return i[0]; })); }, []).sort();
      return panelShell('Cell Content',
        radio('kind', 'Design Element', c.kind === 'de') +
        '<div class="cc-p-doe__radiolist">' + list.map(function (n) { return radio('de', n, n === current); }).join('') + '</div>' +
        radio('kind', 'Design Object', c.kind === 'do') + radio('kind', 'Design Script', c.kind === 'script'));
    }
    /* Step 2: same panel, same place. Kind becomes a segmented control; each kind shows a
       searchable 3-column tile grid (as in the full prototype's Add library): icon above a short
       name, description in the tooltip. The current choice is shown by the tick + highlight on its
       tile (and by the cell's own label), so there is no separate "current" row. */
    var tabs = [['blocks', 'Element', 'de', 'Element'], ['component', 'Design object', 'do', 'Object'], ['code-xml', 'Script', 'script', 'Script']];
    var tab = S.kindTab || c.kind;
    if (tab !== 'do' && tab !== 'script') tab = 'de';
    var seg = '<div class="seg-control seg-control--sm cc-p-doe__kinds" role="radiogroup" aria-label="Cell content type">' +
      tabs.map(function (k) {
        var a = k[2] === tab;
        return '<button class="seg-control__btn' + (a ? ' seg-control__btn--active' : '') + '" type="button" role="radio" aria-checked="' + a + '" title="' + k[1] + '" data-act="kindTab" data-id="' + k[2] + '">' + ic(k[0]) + '<span class="cc-p-doe__kind-label">' + k[1] + '</span><span class="cc-p-doe__kind-short" aria-hidden="true">' + k[3] + '</span></button>';
      }).join('') + '</div>';
    function tile(name, icon, desc, kind, isCur) {
      return '<button type="button" draggable="true" class="cc-p-doe__pick cc-p-doe__pick--' + kind + (isCur ? ' is-current' : '') + '" data-pick="' + esc((name + ' ' + desc).toLowerCase()) + '" data-choose="' + esc(name) + '" data-kind="' + kind + '" title="' + esc(desc) + '">' +
        (isCur ? ic('check', 'cc-p-doe__pick-check') : '') +
        '<span class="cc-p-doe__pick-icon">' + ic(icon) + '</span><span class="cc-p-doe__pick-name">' + esc(name) + '</span></button>';
    }
    var body, count, noun;
    if (tab === 'de') {
      count = 41; noun = 'elements';
      /* Collapsible categories, as in the full prototype's Add library; open/closed is remembered. */
      body = D.CATEGORIES.map(function (cat) {
        var k = 'pick|' + cat.label, open = Object.prototype.hasOwnProperty.call(S.secOpen, k) ? S.secOpen[k] : true;
        return '<details class="cc-p-doe__pick-sec" data-sec="' + esc(k) + '" data-pick-group' + (open ? ' open' : '') + '>' +
          '<summary class="cc-p-doe__pick-cat">' + ic('chevron-down', 'cc-p-doe__pick-chev') + cat.label + '<span>' + cat.items.length + '</span></summary>' +
          '<div class="cc-p-doe__pick-group">' +
          cat.items.map(function (i) { return tile(i[0], i[1], i[2], 'de', c.kind === 'de' && i[0] === c.type); }).join('') + '</div></details>';
      }).join('');
    } else if (tab === 'do') {
      count = D.DESIGN_OBJECTS.length; noun = 'design objects';
      body = '<div class="cc-p-doe__pick-group" data-pick-group>' + D.DESIGN_OBJECTS.map(function (d) {
        return tile(d[0], 'component', 'Used in ' + d[1] + ' design objects', 'do', c.kind === 'do' && d[0] === c.type);
      }).join('') + '</div>';
    } else {
      count = D.SCRIPTS.length + 1; noun = 'scripts';
      body = '<div class="cc-p-doe__pick-group" data-pick-group>' + [['Promo strip script', 'Updated 3 days ago']].concat(D.SCRIPTS.slice(1)).map(function (d) {
        return tile(d[0], 'code-xml', d[1], 'script', c.kind === 'script' && d[0] === c.type);
      }).join('') + '<button type="button" class="cc-p-doe__pick cc-p-doe__pick--new" title="Write a new design script"><span class="cc-p-doe__pick-icon">' + ic('plus') + '</span><span class="cc-p-doe__pick-name">New script</span></button></div>';
    }
    return panelShell('Cell Content', seg +
      '<div class="input cc-p-doe__pick-search"><div class="input__wrap">' + ic('search', 'input__icon') + '<input type="search" class="input__control" placeholder="Search ' + count + ' ' + noun + '" aria-label="Search ' + noun + '" data-pick-search></div></div>' +
      '<div class="cc-p-doe__picks">' + body + '</div>');
  }

  /* ── settings modal (Edit cell content) ─────────────── */
  var SETTINGS = [
    ['Main', [['Show Secured Content', 'cb', true], ['Hide Comments & Ratings (Detail)', 'cb', false], ['Show Sponsored Content Only', 'cb', false]]],
    ['Standard', [['Show More Button', 'cb', true], ['Show Download Button (Editions)', 'cb', true], ['More Button Alignment', 'sel', 'Text End'], ['Hide Section/Channel Information', 'cb', false], ['Show URL Topic As Header', 'cb', false], ['Hide Item Title (Detail)', 'cb', false], ['Hide Image Caption (Detail)', 'cb', false], ['Use Alt Text For Caption (Detail)', 'cb', false], ['Show RSS Icon', 'cb', false], ['Show Content Subscription Icon', 'cb', false]]],
    ['Channel / Item Listing Data', [['Do Not Include Duplicates', 'cb', true, 1], ['Exclude From Duplicates List', 'cb', false], ['Start Number', 'num', '1'], ['Maximum Item Number', 'num', '6', 1], ['Show Item Name', 'cb', true], ['Title Character Limit', 'num', '90', 1], ['Show Item Intro', 'cb', true], ['Intro Character Limit', 'num', '160'], ['Hide Item Intro At Breakpoint', 'sel', '800px', 1], ['Show Item Teaser', 'cb', false], ['Teaser Character Limit', 'num', ''], ['Show Item Link', 'cb', true], ['Defer To Original Section', 'cb', false], ['Show Previous/Next Item Links', 'cb', false], ['Load More Items Button Alignment', 'sel', 'Full Width', 1], ['Prioritise Sponsored Listing', 'cb', false], ['Hide Sponsored Label', 'cb', false]]],
    ['Channel / Item Listing Image', [['Show Item Image', 'cb', true], ['Item Image Type', 'sel', 'Item Thumbnail'], ['Maximum Image Size', 'sel', 'Medium'], ['Show Image Caption', 'cb', false]]],
    ['Event Listing', [['Show Event Dates', 'cb', true], ['Show Event Location', 'cb', true]]],
    ['Meta Data (Standard & Media Item Listing)', [['Show Views', 'cb', false], ['Views Label Text', 'num', '']]],
    ['Item Tags (Standard & Media Item Listing)', [['Show All Tags', 'cb', false], ['Show Category Topic Only', 'cb', true, 1]]]
  ];
  function settingCtl(s, c) {
    var k = c.id + '|set:' + s[0];
    if (s[1] === 'cb') {
      if (on(3)) return toggleHtml(k, s[0], !!s[2]);
      return '<label class="checkbox"><input type="checkbox" class="checkbox__input" data-k="' + esc(k) + '"' + (vget(k, !!s[2]) === true ? ' checked' : '') + ' aria-label="' + esc(s[0]) + '"><span class="checkbox__indicator">' + ic('check') + '</span></label>';
    }
    if (s[1] === 'sel') return '<div class="sel">' + ddButton(k, s[2], OPTS[s[0]] || [s[2]], 'sel__control') + '</div>';
    return '<div class="input"><div class="input__wrap"><input type="text" class="input__control" data-k="' + esc(k) + '" value="' + esc(vget(k, s[2])) + '" aria-label="' + esc(s[0]) + '"></div></div>';
  }
  /* Design Objects picker, as on lion: search, Name/Type table with radios, paging, Cancel / Select. */
  function doPickerHtml(c, kind) {
    var isDo = kind !== 'script', list = isDo ? DO_LIST : SCRIPT_LIST;
    var rows = list.map(function (d) {
      var on1 = d[0] === c.type;
      return '<tr class="cc-p-doe__dop-row' + (on1 ? ' is-on' : '') + '" data-dop="' + esc(d[0].toLowerCase()) + '"><td><label class="radio"><input type="radio" class="radio__input" name="dop" value="' + esc(d[0]) + '"' + (on1 ? ' checked' : '') + '><span class="radio__indicator"></span></label></td><td>' + esc(d[0]) + '</td><td>' + d[1] + '</td></tr>';
    }).join('');
    return '<div class="modal-overlay modal-overlay--open cc-p-doe__modal" role="dialog" aria-modal="true" aria-labelledby="doe-dop-title">' +
      '<div class="modal modal--lg"><div class="modal__header"><h2 class="modal__title" id="doe-dop-title">' + (isDo ? 'Design Objects' : 'Design Scripts') + '</h2>' +
      '<button class="modal__close" type="button" aria-label="Close" data-act="close">' + ic('x') + '</button></div>' +
      '<div class="modal__body">' +
        '<div class="input"><div class="input__wrap">' + ic('search', 'input__icon') + '<input type="search" class="input__control" placeholder="Search ' + (isDo ? 'design objects' : 'design scripts') + '" aria-label="Search" data-dop-search></div></div>' +
        '<div class="cc-p-doe__dop-table"><table class="table"><thead><tr><th></th><th>Name</th><th>' + (isDo ? 'Design object type' : 'Script type') + '</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
        '<p class="cc-p-doe__dop-count">Showing <b>1–' + list.length + '</b> of <b>' + (isDo ? 67 : list.length) + '</b> results</p>' +
      '</div><div class="modal__footer"><button class="btn btn--secondary" type="button" data-act="close">Cancel</button><button class="btn btn--primary" type="button" data-act="dopSelect" data-kind="' + (isDo ? 'do' : 'script') + '" data-id="' + c.id + '">Select</button></div></div></div>';
  }
  function modalHtml(c) {
    var total = SETTINGS.reduce(function (a, g) { return a + g[1].length; }, 0);
    var modified = SETTINGS.reduce(function (a, g) { return a + g[1].filter(function (s) { return s[3]; }).length; }, 0);
    var sections = SETTINGS.map(function (g, gi) {
      var mods = g[1].filter(function (s) { return s[3]; }).length;
      var rows = g[1].map(function (s) {
        return '<div class="field-row field-row--edit cc-p-doe__setting' + (on(3) && s[3] ? ' is-mod' : '') + '" data-setting="' + esc(s[0].toLowerCase()) + '"><span class="field-row__label">' + esc(s[0]) + '</span><div class="field-row__value">' + settingCtl(s, c) + '</div></div>';
      }).join('');
      if (!on(3)) {
        return '<section class="record-section"><div class="record-section__header"><h2 class="record-section__title">' + g[0] + '</h2></div><div class="record-section__body">' + rows + '</div></section>';
      }
      return '<details class="record-section cc-p-doe__sec"' + (gi < 3 ? ' open' : '') + '><summary class="record-section__header cc-p-doe__sec-head">' + ic('chevron-down', 'cc-p-doe__sec-chev') +
        '<h2 class="record-section__title">' + g[0] + '</h2><span class="cc-p-doe__sec-meta">' + (mods ? '<span class="badge badge--info">' + mods + ' changed</span>' : '') + '<span class="cc-p-doe__sec-count">' + g[1].length + '</span></span></summary>' +
        '<div class="record-section__body">' + rows + '</div></details>';
    }).join('');
    var tools = on(3)
      ? '<div class="cc-p-doe__mtools"><div class="input"><div class="input__wrap">' + ic('search', 'input__icon') + '<input type="search" class="input__control" placeholder="Search ' + total + ' settings" aria-label="Search settings" data-setting-search></div></div>' +
        '<button type="button" class="btn btn--secondary btn--sm" data-act="modifiedOnly">' + ic('circle-dot') + 'Changed only (' + modified + ')</button>' +
        '<button type="button" class="btn btn--tertiary btn--sm" data-act="collapseAll">' + ic('chevrons-down-up') + 'Collapse all</button></div>'
      : '';
    return '<div class="modal-overlay modal-overlay--open cc-p-doe__modal" role="dialog" aria-modal="true" aria-labelledby="doe-m-title">' +
      '<div class="modal modal--lg"><div class="modal__header"><h2 class="modal__title" id="doe-m-title">' + esc(c.name) + '</h2>' +
      (on(2) ? '<button type="button" class="btn btn--secondary btn--sm cc-p-doe__change" data-act="changeElement" data-id="' + c.id + '">' + ic('replace') + 'Change element</button>' : '') +
      '<button class="modal__close" type="button" aria-label="Close" data-act="close">' + ic('x') + '</button></div>' +
      '<div class="modal__body">' +
        '<div class="cc-p-doe__mtabs"><span class="cc-p-doe__mtab">Details</span><span class="cc-p-doe__help">' +
        '<button class="toggle toggle--xs" type="button" role="switch" aria-checked="false" aria-label="Show help"><span class="toggle__track"><span class="toggle__knob"></span></span></button>Show help</span></div>' +
        tools + '<div class="cc-p-doe__msections">' + sections + '</div>' +
      '</div><div class="modal__footer"><button class="btn btn--secondary" type="button" data-act="close">Cancel</button><button class="btn btn--primary" type="button" data-act="close">Save</button></div></div></div>';
  }

  /* ── mount ──────────────────────────────────────────── */
  /* Step 6: the new prototype's compact editor bar, in place of the CC page header. */
  function editorBar() {
    var dirty = S.dirty;
    var cur = D.BREAKPOINTS.filter(function (b) { return b.id === S.bp; })[0];
    return '<header class="cc-p-doe__ebar">' +
      '<div class="cc-p-doe__ebar-left">' +
        /* Always two levels (Mark, 2026-11-10): "Design Objects" (constant link to the list), then the design
           object in focus with the switcher chevron — the nested one when you've gone into it, whose menu
           then leads back up to its parent. */
        '<a class="cc-p-doe__ecrumb" href="#">Design Objects</a>' + ic('chevron-right', 'cc-p-doe__ecrumb-sep') +
        '<button type="button" class="cc-p-doe__edoc' + (nestedCell() ? ' cc-p-doe__edoc--do' : '') + '" data-act="menu" data-id="__dos" aria-haspopup="menu" aria-expanded="' + (S.menu === '__dos') + '" aria-current="page" title="Switch design object">' +
          (nestedCell() ? ic('component', 'cc-p-doe__edoc-icon') : '') + '<span class="cc-p-doe__edoc-name">' + esc(nestedCell() ? nestedCell().nested.name : '2018 Simple DO') + '</span>' + ic('chevron-down') + '</button>' +
      '</div>' +
      /* One control for any number of breakpoints: current icon + width, the rest in a menu. */
      '<div class="cc-p-doe__ebar-centre"><button type="button" class="cc-p-doe__bp-trigger" data-act="menu" data-id="__bp" aria-haspopup="menu" aria-expanded="' + (S.menu === '__bp') + '" title="Preview breakpoint">' +
        ic(cur.icon, cur.rotate ? 'cc-p-doe__rot' : '') + '<span>' + cur.label + '</span>' + ic('chevron-down', 'cc-p-doe__bp-chev') + '</button></div>' +
      '<div class="cc-p-doe__ebar-right">' +
        /* Save status sits with Undo / Redo / Save, where it's in context (Mark, 2026-11-10). */
        (S.saveState === 'saving' ? '<span class="cc-p-doe__esave">Saving…</span>'
          : dirty ? '<span class="cc-p-doe__esave"><span class="cc-p-doe__edot" aria-hidden="true"></span>Unsaved changes</span>'
          : '') +   // nothing shown when there's nothing to save (Mark, 2026-11-10)
        '<button type="button" class="cc-p-doe__ghost" aria-label="Undo" title="Undo (⌘Z)">' + ic('undo-2') + '</button>' +
        '<button type="button" class="cc-p-doe__ghost" aria-label="Redo" title="Redo (⇧⌘Z) · nothing to redo" aria-disabled="true">' + ic('redo-2') + '</button>' +
        '<span class="cc-p-doe__ediv" aria-hidden="true"></span>' +
        saveButton() +
        '<button type="button" class="cc-p-doe__ghost" aria-label="More actions" title="More actions" aria-haspopup="menu" aria-expanded="' + (S.menu === '__doc') + '" data-act="menu" data-id="__doc">' + ic('ellipsis-vertical') + '</button>' +
      '</div></header>';
  }
  /* ── Docked inspector (step 6) ────────────────────────
     LOOK ONLY. The visual builders (sec, field, sel, num, bpScope…) are COPIED from
     ../DesignObjectEditor/doe.js, unchanged except ic() → pic(), so the docked panel looks like the
     full prototype's inspector. The FIELDS are Luismi's (same as cellPropsPanel/rowPropsPanel):
     no structure presets, segmented controls, spacing box or tabs. */
  var INSP = (function () {
    function pic(name, cls) { return ic(name, 'doe-ic ' + (cls || '')); }
  function sec(title, inner, open, extra) {
    return '<details class="doe-sec"' + (open ? ' open' : '') + '><summary class="doe-sec__head">' + pic('chevron-down', 'doe-sec__chev') + '<span>' + title + '</span>' + (extra || '') + '</summary><div class="doe-sec__body">' + inner + '</div></details>';
  }
  function field(label, control, mod) {
    return '<div class="doe-field"><span class="doe-field__label' + (mod ? ' is-mod' : '') + '">' + label + '</span><div class="doe-field__ctl">' + control + '</div></div>';
  }
  function sel(v) { return '<button type="button" class="doe-select"><span>' + v + '</span>' + pic('chevrons-up-down') + '</button>'; }
  function num(v, unit, ph) { return '<label class="doe-num"><input type="text" value="' + (v || '') + '" placeholder="' + (ph || 'Auto') + '">' + (unit ? '<span class="doe-num__unit">' + unit + '</span>' : '') + '</label>'; }

  function bpScope() {
    var b = D.BREAKPOINTS.filter(function (x) { return x.id === S.bp; })[0];
    if (!b.width) return '<div class="doe-scope">' + pic('monitor') + '<span>Editing <b>Fluid</b>. Changes cascade to every breakpoint.</span></div>';
    return '<div class="doe-scope doe-scope--override">' + pic(b.icon, b.rotate ? 'doe-ic--rot' : '') + '<span>Editing at <b>' + b.label + '</b>. Changes apply to ' + b.label + ' and smaller.</span><span class="doe-scope__count">2 overrides</span></div>';
  }

    return { sec: sec, field: field, sel: sel, num: num, bpScope: bpScope, pic: pic };
  })();

  /* Mock option lists for every dropdown (docked panel, baseline panels, settings modal).
     TODO(backend:DesignObjectEditor): replace with the real lists from the design object API. */
  var OPTS = {
    style: ['Not set', 'Card', 'Card, light', 'Boxed', 'Feature', 'Highlight'],
    frame: ['Not set', 'Hairline border', 'Shadow', 'Rounded'],
    size: ['No Padding', 'Small', 'Medium', 'Large', 'XLarge'],   // as on lion
    security: ['Non-secured', 'Members only', 'Subscribers', 'Staff only'],
    hAlign: ['Not set', 'Left', 'Center', 'Right'],
    vAlign: ['Not set', 'Top', 'Middle', 'Bottom'],
    float: ['Not set', 'None', 'Left', 'Right'],
    clear: ['Not set', 'Left', 'Right', 'Both'],
    rowAlign: ['Left', 'Center', 'Right'],
    'More Button Alignment': ['Text End', 'Left', 'Centre', 'Right'],
    'Hide Item Intro At Breakpoint': ['Never', '480px', '600px', '800px', '1024px'],
    'Load More Items Button Alignment': ['Hidden', 'Left', 'Centre', 'Right', 'Full Width'],
    'Item Image Type': ['Item Thumbnail', 'Item Main Image', 'Item Media'],
    'Maximum Image Size': ['Small', 'Medium', 'Large', 'Original']
  };
  /* Every control carries data-k="<item id>|<field>" and keeps its value in S.vals (the
     listeners below write it), so values survive redraws and switching selection. */
  function vget(k, def) { return Object.prototype.hasOwnProperty.call(S.vals, k) ? S.vals[k] : def; }
  function ddButton(k, def, opts, cls) {
    return '<button type="button" class="' + cls + '" data-dd="' + esc(k) + '" data-opts="' + esc(opts.join('|')) + '" aria-haspopup="listbox" aria-expanded="false"><span' + (cls === 'sel__control' ? ' class="sel__value"' : '') + '>' + esc(vget(k, def)) + '</span>' +
      (cls === 'sel__control' ? '<span class="sel__chevron">' + ic('chevron-down') + '</span>' : ic('chevrons-up-down', 'doe-ic')) + '</button>';
  }
  function toggleHtml(k, label, def) {
    var on = vget(k, def) === true;
    return '<button class="toggle toggle--xs' + (on ? ' toggle--active' : '') + '" type="button" role="switch" aria-checked="' + on + '" aria-label="' + esc(label) + '" data-k="' + esc(k) + '"><span class="toggle__track"><span class="toggle__knob"></span></span></button>';
  }

  function dockedInspector(isRow, item) {
    var I = INSP;
    function K(key) { return item.id + '|' + key; }
    function V(key, def) { return vget(K(key), def); }
    function cb(key, label, def) {
      var on = V(key, def) === true;
      return '<label class="checkbox cc-p-doe-insp__check"><input type="checkbox" class="checkbox__input" data-k="' + esc(K(key)) + '"' + (on ? ' checked' : '') + (label ? '' : ' aria-label="Enabled"') + '><span class="checkbox__indicator">' + ic('check') + '</span>' + (label ? '<span class="checkbox__label"><span class="checkbox__label-text">' + label + '</span></span>' : '') + '</label>';
    }
    function sw(key, label) { return toggleHtml(K(key), label, false); }
    function dd(key, optsKey, def) { return ddButton(K(key), def, OPTS[optsKey], 'doe-select'); }
    function txt(key, def, ph) { return '<label class="doe-num doe-num--text"><input type="text" data-k="' + esc(K(key)) + '" value="' + esc(V(key, def || '')) + '" placeholder="' + (ph || '') + '"></label>'; }
    function num(key, unit, ph) { return I.num(esc(V(key, '')), unit, ph).replace('<input ', '<input data-k="' + esc(K(key)) + '" '); }
    /* Segmented control (full prototype look) for alignment / padding. Same values as the
       dropdowns they replace; data-seg + data-val are handled by the click listener. */
    function seg(key, optsKey, def, show) {
      var cur = V(key, def), opts = OPTS[optsKey];
      return '<div class="doe-seg doe-seg--fill" role="radiogroup" data-seg="' + esc(K(key)) + '">' + opts.map(function (o, i) {
        var lab = show ? show[i] : o, a = o === cur;
        var inner = lab && lab.icon ? ic(lab.icon, 'doe-ic') : esc(lab);
        return '<button type="button" class="doe-seg__btn' + (a ? ' is-active' : '') + '" role="radio" aria-checked="' + a + '" data-val="' + esc(o) + '"' +
          (lab && lab.icon ? ' title="' + esc(o) + '" aria-label="' + esc(o) + '"' : '') + '>' + inner + '</button>';
      }).join('') + '</div>';
    }
    var PAD = ['None', 'S', 'M', 'L', 'XL'];
    var H_ICONS = ['Auto', { icon: 'align-horizontal-justify-start' }, { icon: 'align-horizontal-justify-center' }, { icon: 'align-horizontal-justify-end' }];
    var V_ICONS = ['Auto', { icon: 'align-start-horizontal' }, { icon: 'align-center-horizontal' }, { icon: 'align-end-horizontal' }];
    var ROW_ICONS = [{ icon: 'align-horizontal-justify-start' }, { icon: 'align-horizontal-justify-center' }, { icon: 'align-horizontal-justify-end' }];
    /* Colour: native colour picker behind the swatch; text field for typing a value; "None" when empty. */
    function colour(key) {
      var v = V(key, ''), hex = /^#[0-9a-f]{6}$/i.test(v) ? v : '#ffffff';
      return '<label class="doe-colour cc-p-doe-insp__colour">' +
        '<span class="doe-colour__swatch' + (v ? '' : ' doe-colour__swatch--none') + '"' + (v ? ' style="background:' + esc(v) + '"' : '') + '>' +
        '<input type="color" class="cc-p-doe-insp__picker" value="' + hex + '" data-colour-for="' + esc(K(key)) + '" aria-label="Pick colour"></span>' +
        '<input type="text" class="cc-p-doe-insp__colour-text" data-k="' + esc(K(key)) + '" value="' + esc(v) + '" placeholder="None"></label>';
    }
    /* Toggle chips (multi-select), as in the full prototype's Audience section. */
    function chip(key, label) {
      var on = V(key, false) === true;
      return '<button type="button" class="doe-chip doe-chip--toggle' + (on ? ' is-on' : '') + '" aria-pressed="' + on + '" data-chip="' + esc(K(key)) + '">' + (on ? ic('check', 'doe-ic') : '') + label + '</button>';
    }
    /* Breakpoint tiles: click to hide this cell at that breakpoint (same hide:* data as before). */
    function bpTiles(c) {
      return '<p class="doe-help">Click a breakpoint to hide this cell there. Hidden cells stay on the canvas, faded.</p>' +
        '<div class="doe-devices">' + D.BREAKPOINTS.map(function (b) {
          var off = V('hide:' + b.label, !!(c.hiddenAt && c.hiddenAt.indexOf(b.label) !== -1)) === true;
          return '<button type="button" class="doe-device' + (off ? ' is-off' : '') + '" aria-pressed="' + !off + '" data-hide="' + esc(K('hide:' + b.label)) + '" title="' + (off ? 'Hidden at ' : 'Shown at ') + b.label + '">' +
            ic(b.icon, 'doe-ic' + (b.rotate ? ' doe-ic--rot' : '')) + '<span>' + b.label + '</span>' + ic(off ? 'eye-off' : 'eye', 'doe-ic doe-device__eye') + '</button>';
        }).join('') + '</div>';
    }
    /* Size: one line per axis — value · min · max. */
    function sizeLine(axis, keys, unit) {
      return '<div class="cc-p-doe-insp__size">' + keys.map(function (k, i) {
        return '<label class="cc-p-doe-insp__size-item"><span>' + (i === 0 ? axis : i === 1 ? 'Min' : 'Max') + '</span>' + num(k, unit) + '</label>';
      }).join('') + '</div>';
    }
    function area(key) { return '<textarea class="doe-code" rows="2" data-k="' + esc(K(key)) + '">' + esc(V(key, '')) + '</textarea>'; }
    function trbl(prefix) {   // Top / Right / Bottom / Left, as in the baseline
      return '<div class="cc-p-doe-insp__size cc-p-doe-insp__size--4">' + ['Top', 'Right', 'Bottom', 'Left'].map(function (side) {
        /* Same as the Size inputs: px unit inside, "Auto" placeholder, label above (Mark, 2026-11-10). */
        return '<label class="cc-p-doe-insp__size-item"><span>' + side + '</span>' + num(prefix + ':' + side, 'px') + '</label>';
      }).join('') + '</div>';
    }
    var img = V('bgImage', '');
    var bgImage = I.field('Image', img
      ? '<div class="cc-p-doe-insp__img"><span class="cc-p-doe-insp__thumb">' + ic('image') + '</span><span class="cc-p-doe-insp__file">' + esc(img) + '</span>' +
        '<button type="button" class="cc-p-doe__ghost" data-act="clearImage" data-id="' + esc(K('bgImage')) + '" aria-label="Remove image" title="Remove image">' + ic('x') + '</button></div>'
      : '<button type="button" class="doe-imgpick" data-act="pickImage" data-id="' + esc(K('bgImage')) + '">' + ic('image', 'doe-ic') + '<span>Choose image</span></button>');
    var body;
    if (!isRow && loneLayout(item)) {
      /* Design object cells only take Custom ID, Custom Class, Sticky and Name (lion, 2026-11-10). */
      body = '<p class="doe-help cc-p-doe-insp__note">' + ic('component', 'doe-ic') + '<span>This cell holds a Row design object. Its layout is set inside the design object.</span></p>' +
        I.sec('Main', I.field('Name', txt('name', item.name)) + I.field('Custom ID', txt('customId', '')) + I.field('Custom class', txt('customClass', '')) + I.field('Sticky', sw('sticky', 'Sticky')), true);
    } else if (!isRow) {
      var c = item;
      body = I.bpScope() +
        I.sec('Main',
          I.field('Name', txt('name', c.name)) + I.field('Custom ID', txt('customId', c.id === 'c-prime' ? 'exhibitor_listing2' : '')) + I.field('Custom class', txt('customClass', '')) +
          I.field('Design style', dd('style', 'style', 'Not set')) + I.field('Design frame', dd('frame', 'frame', 'Not set')) + I.field('Spacing', seg('spacing', 'size', 'Medium', PAD)) +
          I.field('Sticky', sw('sticky', 'Sticky')), true) +
        I.sec('Security',
          I.field('Content security right', dd('security', 'security', 'Non-secured')) +
          '<span class="doe-field__label">Exclude for</span>' +
          '<div class="doe-chips doe-chips--toggle">' + chip('ex:Affino', 'Affino staff') + chip('ex:LoggedIn', 'Logged in') + chip('ex:LoggedOut', 'Logged out') + chip('ex:Metered', 'Metered content') + '</div>', true) +
        I.sec('Align', I.field('Horizontal', seg('hAlign', 'hAlign', 'Not set', H_ICONS)) + I.field('Vertical', seg('vAlign', 'vAlign', 'Not set', V_ICONS)) + I.field('Float', seg('float', 'float', 'Not set', ['Auto', 'None', 'Left', 'Right'])) + I.field('Clear', seg('clear', 'clear', 'Not set', ['Auto', 'Left', 'Right', 'Both'])), true) +
        I.sec('Size', sizeLine('Width', ['w', 'minW', 'maxW'], 'px') + sizeLine('Height', ['h', 'minH', 'maxH'], 'px'), true) +
        I.sec('Margin', trbl('margin'), false) +
        I.sec('Padding', trbl('padding'), false) +
        I.sec('Background', I.field('Colour', colour('bgColour')) + bgImage, !!img || !!V('bgColour', '')) +
        I.sec('Custom CSS', I.field('Outer CSS', area('outerCss')) + I.field('Inner CSS', area('innerCss')), false) +
        I.sec('Show at breakpoints', bpTiles(c), true,
          c.hiddenAt ? '<span class="doe-sec__mod" title="Hidden at ' + c.hiddenAt.length + '">' + c.hiddenAt.length + '</span>' : '');
    } else {
      body = I.bpScope() +
        I.sec('Security', I.field('Content security right', dd('security', 'security', 'Non-secured')), true) +
        I.sec('Outer row', I.field('Horizontal padding', seg('hPad', 'size', 'Medium', PAD)) + I.field('Vertical padding', seg('vPad', 'size', 'Medium', PAD)), true) +
        /* Wrap is deprecated (Mark, 2026-11-10), so it is not offered here. */
        I.sec('Alignment', I.field('Horizontal align', seg('rowAlign', 'rowAlign', 'Center', ROW_ICONS)) + I.field('Sticky', sw('sticky', 'Sticky')), true) +
        /* lion fills Width 100% and Max-Width 1280px as the row panel opens */
        I.sec('Size', '<div class="cc-p-doe-insp__size">' + [['Width', 'w', '100%'], ['Min', 'minW', ''], ['Max', 'maxW', '1280px']].map(function (f) {
          return '<label class="cc-p-doe-insp__size-item"><span>' + f[0] + '</span>' + I.num(esc(V(f[1], f[2])), '', 'Auto').replace('<input ', '<input data-k="' + esc(K(f[1])) + '" ') + '</label>';
        }).join('') + '</div>', true) +
        I.sec('Background', I.field('Colour', colour('bgColour')) + bgImage, !!img || !!V('bgColour', '')) +
        I.sec('Custom CSS', I.field('Outer row CSS', area('outerCss')) + I.field('Inner row CSS', area('innerCss')), false);
    }
    body = body.replace(/<details class="doe-sec"( open)?><summary class="doe-sec__head">([\s\S]*?)<span>([^<]+)<\/span>/g, function (m, op, pre, title) {
      var k = item.id + '|' + title, open = Object.prototype.hasOwnProperty.call(S.secOpen, k) ? S.secOpen[k] : !!op;
      return '<details class="doe-sec" data-sec="' + esc(k) + '"' + (open ? ' open' : '') + '><summary class="doe-sec__head">' + pre + '<span>' + title + '</span>';
    });
    var icon = isRow ? 'rows-3' : elIcon(item);
    var type = isRow ? item.cells.length + (item.cells.length === 1 ? ' cell' : ' cells') : (item.type ? esc(item.type) : 'No content');   // no DCC code (Mark, 2026-11-10)
    return '<aside class="cc-p-doe__panel cc-p-doe-insp" aria-label="' + (isRow ? 'Row' : 'Cell') + ' properties">' +
      '<div class="cc-p-doe__resize" role="separator" aria-orientation="vertical" aria-label="Resize panel" tabindex="0" title="Drag to resize"></div>' +
      '<div class="doe-insp__head"><span class="doe-insp__icon doe-insp__icon--' + (isRow ? 'row' : item.kind) + '">' + ic(icon, 'doe-ic') + '</span>' +
        '<div class="doe-insp__titles"><span class="cc-p-doe-insp__title">' + (isRow ? 'Row Properties' : 'Cell Properties') + '</span><span class="doe-insp__type">' + (isRow ? '<span data-live-name>' + esc(item.name) + '</span> · ' : '') + type + '</span></div>' +
        '<button type="button" class="cc-p-doe__ghost" data-act="close" aria-label="Close panel" title="Close">' + ic('x') + '</button></div>' +
      '<div class="doe-insp__body">' + body + '</div></aside>';
  }

  /* ── Save (step 6 editor bar) ──────────────────────────
     Disabled until something changes → spinner "Saving…" → tick "Saved" + success toast → back to
     a disabled Save. aria-disabled (not disabled) while saving/saved keeps the primary colour.
     TODO(backend:DesignObjectEditor): the 1.2s timer stands in for PUT design object. */
  var SPINNER = '<span class="spinner spinner--sm spinner--inverted" role="status" aria-label="Saving"><svg class="spinner__svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<circle class="spinner__track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"></circle>' +
    '<path class="spinner__arc" d="M12 2 a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg></span>';
  function saveButton() {
    if (S.saveState === 'saving') return '<button type="button" class="btn btn--primary btn--sm cc-p-doe__save" aria-disabled="true" aria-busy="true">' + SPINNER + 'Saving…</button>';
    if (S.saveState === 'saved') return '<button type="button" class="btn btn--primary btn--sm cc-p-doe__save cc-p-doe__save--done" aria-disabled="true">' + ic('check') + 'Saved</button>';
    return '<button type="button" class="btn btn--primary btn--sm cc-p-doe__save"' + (S.dirty ? ' data-act="save"' : ' disabled') + '>' + ic('check') + 'Save</button>';
  }
  /* Redraw just the bar, so a field being typed in keeps its focus. */
  function refreshBar() {
    var bar = document.querySelector('.cc-p-doe__ebar');
    if (!bar) return;
    var tmp = document.createElement('div'); tmp.innerHTML = editorBar();
    var fresh = tmp.firstElementChild; bar.replaceWith(fresh);
    if (window.lucide) lucide.createIcons();
    adoptTitles(fresh);
  }
  function markDirty() {
    if (S.dirty && S.saveState === 'idle') return;
    S.dirty = true; S.saveState = 'idle'; clearTimeout(S._saveTimer); refreshBar();
  }
  function doSave() {
    S.saveState = 'saving'; refreshBar();
    S._saveTimer = setTimeout(function () {
      S.saveState = 'saved'; S.dirty = false; refreshBar();
      var nc = nestedCell();
      savedToast(nc ? nc.nested.name : '2018 Simple DO');
      S._saveTimer = setTimeout(function () { S.saveState = 'idle'; refreshBar(); }, 2000);
    }, 1200);
  }
  function infoToast(msg) {
    var stack = document.getElementById('cc-toasts'); if (!stack) return;
    var t = document.createElement('div');
    t.className = 'toast toast--info'; t.setAttribute('role', 'status');
    t.innerHTML = '<span class="toast__icon">' + ic('info') + '</span><p class="toast__message">' + esc(msg) + '</p>';
    stack.appendChild(t);
    if (window.lucide) lucide.createIcons();
    requestAnimationFrame(function () { requestAnimationFrame(function () { t.classList.add('toast--in'); }); });
    setTimeout(function () { t.classList.remove('toast--in'); t.classList.add('toast--leaving'); setTimeout(function () { t.remove(); }, 400); }, 3000);
  }
  function savedToast(name) {
    var stack = document.getElementById('cc-toasts'); if (!stack) return;
    var t = document.createElement('div');
    t.className = 'toast toast--success toast--color'; t.setAttribute('role', 'status');
    t.innerHTML = '<span class="toast__icon">' + ic('check') + '</span><p class="toast__message">“' + esc(name) + '” saved</p>' +
      '<button type="button" class="toast__close" aria-label="Dismiss">' + ic('x') + '</button>';
    stack.appendChild(t);
    if (window.lucide) lucide.createIcons();
    requestAnimationFrame(function () { requestAnimationFrame(function () { t.classList.add('toast--in'); }); });
    function dismiss() {
      if (t.dataset.leaving) return; t.dataset.leaving = '1';
      t.classList.remove('toast--in'); t.classList.add('toast--leaving');
      t.addEventListener('transitionend', function () { t.remove(); }, { once: true });
      setTimeout(function () { t.remove(); }, 600);
    }
    t.querySelector('.toast__close').addEventListener('click', dismiss);
    setTimeout(dismiss, 4000);
  }

  /* Select a cell; an open panel follows it rather than closing (no layout jump). */
  function selectCell(id) {
    S.select = id;
    if (S.panel === 'rowProps' || S.panel === 'addCell') S.panel = 'cellProps';
    var sc = findCell(id).cell;
    if (S.panel === 'content' && !sc.incomplete && sc.type) S.panel = 'cellProps';   // a blank cell keeps Cell Content open
  }

  function nestedBanner() {
    var nc = nestedCell();
    if (!nc) return '';
    /* DS Alert (info, CTA variant): legible in both themes, unlike the earlier purple bar (Mark, 2026-11-10). */
    return '<div class="alert alert--cta alert--info cc-p-doe__nested-alert" role="status"><div class="alert__header">' +
      '<span class="alert__icon">' + ic('component') + '</span>' +
      '<div class="alert__cta-area"><div class="alert__text"><span class="alert__title">Editing design object: ' + esc(nc.nested.name) + '.</span>' +
      '<span class="alert__message"> Used in ' + nc.nested.usedIn + ' design objects, so changes apply everywhere.</span></div>' +
      '<button type="button" class="btn btn--secondary btn--sm alert__cta-btn" data-act="exitNested">' + ic('arrow-left') + 'Back to 2018 Simple DO</button></div>' +
      '</div></div>';
  }


  function render() {
    var hit = findCell(S.select);
    var row = findRow(S.select);
    var panel = '';
    if (S.panel === 'cellProps' && hit) panel = on(6) ? dockedInspector(false, hit.cell) : cellPropsPanel(hit.cell);
    if (S.panel === 'rowProps' && row) panel = on(6) ? dockedInspector(true, row) : rowPropsPanel(row);
    if (S.panel === 'content' && hit) panel = contentPanel(hit.cell);
    if (S.panel === 'addCell') panel = addCellPanel();
    var bp = baseBps().slice().reverse(); // live bar runs 480px → Fluid (lion's profile, no custom widths)
    var s6 = on(6);
    document.body.classList.toggle('doe-s6', s6);
    var nc = nestedCell();
    var bar = '<div class="cc-p-doe__bar"><h2 class="cc-p-doe__title">' +
      (nc ? '<button type="button" class="cc-p-doe__crumb-link" data-act="exitNested">2018 Simple DO</button>' + ic('chevron-right', 'cc-p-doe__ecrumb-sep') + '<span class="cc-p-doe__crumb-do">' + ic('component') + esc(nc.nested.name) + '</span>' : '2018 Simple DO') +
      '</h2><span class="cc-p-doe__undo">' +
      '<button type="button" class="cc-p-doe__tool" aria-label="Undo" title="Undo (⌘Z)">' + ic('undo-2') + '</button><button type="button" class="cc-p-doe__tool" aria-label="Redo" title="Redo (⇧⌘Z) · nothing to redo" aria-disabled="true">' + ic('redo-2') + '</button></span></div>';
    /* Keep the canvas and the panel where they were scrolled across a redraw. */
    var keepCanvas = document.querySelector('.cc-p-doe__canvas'), canvasTop = keepCanvas ? keepCanvas.scrollTop : 0;
    var keepPanel = document.querySelector('.cc-p-doe__panel .doe-insp__body, .cc-p-doe__panel .cc-p-doe__panel-body');
    var panelKey = S.panel + '|' + S.select, panelTop = keepPanel && render._panelKey === panelKey ? keepPanel.scrollTop : 0;
    render._panelKey = panelKey;
    document.getElementById('doe-root').innerHTML =
      (s6 ? editorBar() : '') +
      '<div class="cc-p-doe' + (on(1) ? ' cc-p-doe--s1' : '') + (on(4) ? ' cc-p-doe--s4' : '') + (on(5) ? ' cc-p-doe--s5' : '') + (s6 ? ' cc-p-doe--s6' : '') + (panel ? ' has-panel' : '') + '">' +
        '<div class="cc-p-doe__canvas">' + (s6 ? '' : bar) +
          nestedBanner() + '<div class="cc-p-doe__rows"' + (bpWidth() ? ' style="max-inline-size:' + bpWidth() + 'px"' : '') + '>' + canvasRows().map(rowHtml).join('') + '</div>' +
        '</div>' + panel +
      '</div>' +
      (s6 ? '' : '<nav class="cc-p-doe__bps" aria-label="Breakpoint preview">' + bp.map(function (b) {
        return '<button type="button" class="cc-p-doe__bp' + (b.id === S.bp ? ' is-active' : '') + '" aria-pressed="' + (b.id === S.bp) + '" data-act="bp" data-id="' + b.id + '">' + b.label + '</button>';
      }).join('') + '</nav>');
    /* The modal mounts at body level: inside the page column the CC header would sit over it. */
    var mroot = document.getElementById('doe-modal-root');
    if (!mroot) { mroot = document.createElement('div'); mroot.id = 'doe-modal-root'; document.body.appendChild(mroot); }
    mroot.innerHTML = S.modal === 'doPicker' && hit ? doPickerHtml(hit.cell, 'do') : S.modal === 'scriptPicker' && hit ? doPickerHtml(hit.cell, 'script') : S.modal && hit ? modalHtml(hit.cell) : '';
    document.querySelector('.cc-header__actions [data-doe-save]').disabled = !panel && !S.modal ? true : false;
    /* Cell actions menu mounts at body level, fixed under its trigger: the step-6 canvas is a
       scroll container, which would clip a menu positioned inside it. */
    var proot = document.getElementById('doe-pop-root');
    if (!proot) { proot = document.createElement('div'); proot.id = 'doe-pop-root'; document.body.appendChild(proot); }
    proot.innerHTML = S.menu ? cellMenu() : '';
    var nc2 = document.querySelector('.cc-p-doe__canvas'); if (nc2) nc2.scrollTop = canvasTop;
    var np = document.querySelector('.cc-p-doe__panel .doe-insp__body, .cc-p-doe__panel .cc-p-doe__panel-body'); if (np && panelTop) np.scrollTop = panelTop;
    if (window.lucide) lucide.createIcons();
    adoptTitles(document.getElementById('doe-root')); adoptTitles(proot); if (typeof hideTip === 'function') hideTip();
    placeMenu();
    if (S.menu === '__dos') { var ds = document.querySelector('[data-dos-search]'); if (ds) ds.focus(); }
    applyW();
    syncUrl();
  }
  function placeMenu() {
    var menu = document.querySelector('#doe-pop-root .cc-p-doe__menu');
    var trigger = S.menu && (S.menu.indexOf('clear:') === 0
      ? document.querySelector('[data-act="clear"][data-id="' + S.menu.slice(6) + '"]')
      : document.querySelector('[data-act="menu"][data-id="' + S.menu + '"]'));
    if (!menu || !trigger) return;
    var r = trigger.getBoundingClientRect(), gap = 4;
    var h = menu.offsetHeight, w = menu.offsetWidth;
    var top = r.bottom + gap;
    if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - gap - h);   // flip up when there's no room below
    var left = S.menu === '__dos' ? Math.min(r.left, window.innerWidth - w - 8) : Math.max(8, r.right - w);   // switcher left-aligned, others right-aligned
    menu.style.top = top + 'px'; menu.style.left = left + 'px';
  }
  function syncUrl() {
    var p = new URLSearchParams();
    if (S.steps.length) p.set('steps', S.steps.slice().sort().join(','));
    if (S.select) p.set('select', S.select);
    if (S.panel) p.set('panel', S.panel);
    if (S.modal) p.set('modal', '1');
    if (S.nested) p.set('nested', S.nested);
    var q = p.toString();
    history.replaceState(null, '', location.pathname + (q ? '?' + q : ''));
  }

  /* ── Tooltips: the DS Tooltip component (src/components/Tooltip) for every icon-only button.
     The button's title is moved to data-tip (so the slow native hint doesn't double up), shown
     after 300ms hover or at once on keyboard focus, fixed at body level so nothing clips it.
     "Label (shortcut)" titles render the shortcut as a key hint. */
  var tipEl = null, tipTimer = null;
  function adoptTitles(root) {
    root.querySelectorAll('button[title], a[title]').forEach(function (b) {
      if (b.closest('.cc-p-doe__pick')) return;              // picker tiles: title is a description, keep native
      b.setAttribute('data-tip', b.getAttribute('title')); b.removeAttribute('title');
    });
  }
  function showTip(el) {
    hideTip();
    if (el.getAttribute('aria-expanded') === 'true' || document.querySelector('#doe-pop-root .cc-p-doe__menu')) return;   // no tooltip over an open menu
    var raw = el.getAttribute('data-tip'); if (!raw) return;
    var m = raw.match(/^(.*?)\s*\(([^)]+)\)(.*)$/);
    var html = m ? esc(m[1]) + ' <span class="cc-p-doe__tip-key">' + esc(m[2]) + '</span>' + esc(m[3]) : esc(raw);
    tipEl = document.createElement('div');
    tipEl.className = 'tooltip tooltip--arrow-top cc-p-doe__tip';
    tipEl.setAttribute('role', 'tooltip');
    tipEl.innerHTML = '<p class="tooltip__text">' + html + '</p>';
    document.body.appendChild(tipEl);
    var r = el.getBoundingClientRect(), w = tipEl.offsetWidth, h = tipEl.offsetHeight, gap = 8;
    var top = r.bottom + gap;
    if (top + h > window.innerHeight - 8) { top = r.top - gap - h; tipEl.classList.replace('tooltip--arrow-top', 'tooltip--arrow-bottom'); }
    var left = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), window.innerWidth - w - 8);
    tipEl.style.top = top + 'px'; tipEl.style.left = left + 'px';
    tipEl.style.setProperty('--tip-arrow-x', (r.left + r.width / 2 - left) + 'px');
  }
  function hideTip() { clearTimeout(tipTimer); if (tipEl) { tipEl.remove(); tipEl = null; } }
  document.addEventListener('mouseover', function (e) {
    var el = e.target.closest('[data-tip]');
    if (!el) { hideTip(); return; }
    if (tipEl && e.relatedTarget && el.contains(e.relatedTarget)) return;
    clearTimeout(tipTimer); tipTimer = setTimeout(function () { showTip(el); }, 300);
  });
  document.addEventListener('focusin', function (e) { var el = e.target.closest('[data-tip]'); if (el && el.matches(':focus-visible')) showTip(el); });
  document.addEventListener('focusout', hideTip);
  document.addEventListener('pointerdown', hideTip, true);
  document.addEventListener('scroll', hideTip, true);

  /* ── Property dropdowns: listbox popover at body level (the docked panel scrolls and would clip it). */
  var ddEl = null, ddBtn = null;
  function closeDd(focusBack) {
    if (ddEl) { ddEl.remove(); ddEl = null; }
    if (ddBtn) { ddBtn.setAttribute('aria-expanded', 'false'); if (focusBack) ddBtn.focus(); ddBtn = null; }
  }
  function openDd(btn) {
    closeDd(); hideTip();
    ddBtn = btn; btn.setAttribute('aria-expanded', 'true');
    var cur = btn.querySelector('span').textContent;
    var opts = btn.getAttribute('data-opts').split('|');
    ddEl = document.createElement('div');
    ddEl.className = 'cc-p-doe__dd'; ddEl.setAttribute('role', 'listbox');
    ddEl.innerHTML = '<ul class="cc-p-doe__dd-list">' + opts.map(function (o) {
      var on = o === cur;
      return '<li role="none"><button type="button" class="cc-p-doe__dd-opt' + (on ? ' is-current' : '') + '" role="option" aria-selected="' + on + '" data-val="' + esc(o) + '"><span>' + esc(o) + '</span>' + (on ? ic('check', 'cc-p-doe__dd-check') : '') + '</button></li>';
    }).join('') + '</ul>';
    document.body.appendChild(ddEl);
    if (window.lucide) lucide.createIcons();
    var r = btn.getBoundingClientRect(), h = ddEl.offsetHeight, gap = 4;
    var top = r.bottom + gap;
    if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - gap - h);
    ddEl.style.top = top + 'px'; ddEl.style.left = r.left + 'px'; ddEl.style.minWidth = r.width + 'px';
    (ddEl.querySelector('.is-current') || ddEl.querySelector('.cc-p-doe__dd-opt')).focus();
  }
  function chooseDd(opt) {
    var v = opt.getAttribute('data-val');
    if (ddBtn && ddBtn.querySelector('span').textContent !== v) {
      ddBtn.querySelector('span').textContent = v;
      S.vals[ddBtn.getAttribute('data-dd')] = v;
      markDirty();
    }
    closeDd(true);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('#doe-root [data-dd], #doe-modal-root [data-dd]');
    if (b) { e.stopImmediatePropagation(); if (ddBtn === b) closeDd(true); else openDd(b); return; }
    var o = e.target.closest('.cc-p-doe__dd-opt');
    if (o) { e.stopImmediatePropagation(); chooseDd(o); return; }
    if (ddEl) closeDd(false);
  }, true);
  /* Checkbox bindings (Hide at also updates the cell's chip on the canvas) */
  document.addEventListener('change', function (e) {
    var k = e.target.getAttribute && e.target.getAttribute('data-k');
    if (!k || e.target.type !== 'checkbox') return;
    S.vals[k] = e.target.checked;
    markDirty();
    var m = k.match(/^(.+)\|hide:(.+)$/);
    if (m) {
      var hit = findCell(m[1]);
      if (hit) {
        var on2 = D.BREAKPOINTS.map(function (b) { return b.label; }).filter(function (lbl) {
          return vget(m[1] + '|hide:' + lbl, !!(hit.cell.hiddenAt && hit.cell.hiddenAt.indexOf(lbl) !== -1)) === true;
        });
        hit.cell.hiddenAt = on2.length ? on2 : undefined;
        render();
      }
    }
  });
  /* Fill a cell with an element / design object / script — shared by tile click and tile drop.
     Applies straight away (no per-cell save); the top bar's Save commits the design object. */
  function assignContent(cc, kind, name) {
    if (cc.kind === kind && cc.type === name) return false;
    /* A cell still called "Blank Cell", or named after its old content, takes the new content's
       name; a name the editor typed is kept (Mark, 2026-11-11). */
    if (!cc.name || cc.name === 'Blank Cell' || cc.name === cc.type) cc.name = name;
    cc.kind = kind; cc.type = name; cc.incomplete = false;
    if (kind === 'do') { var dObj = D.DESIGN_OBJECTS.filter(function (x) { return x[0] === name; })[0]; cc.usedIn = dObj ? dObj[1] : 1; cc.doType = doTypeOf(name); if (name === '2016 RB Navigation') cc.nested = HEADER_NESTED; else delete cc.nested; }
    else delete cc.nested;
    markDirty();
    return true;
  }

  /* ── Drag a picker tile onto any cell on the canvas to fill it (Mark, 2026-11-11). */
  var tileDrag = null;
  function clearTileDrop() { document.querySelectorAll('.cc-p-doe__cell--drop').forEach(function (n) { n.classList.remove('cc-p-doe__cell--drop'); n.removeAttribute('data-drop-label'); }); }
  function tileDragMode(on) { var r = document.getElementById('doe-root'); if (r) r.classList.toggle('cc-p-doe--tile-drag', on); }
  function tileDropCell(ev) {
    var cellEl = ev.target.closest && ev.target.closest('#doe-root .cc-p-doe__cell[data-cell]');
    return cellEl && findCell(cellEl.getAttribute('data-cell')) ? cellEl : null;
  }
  document.addEventListener('dragstart', function (ev) {
    var t = ev.target.closest && ev.target.closest('#doe-root .cc-p-doe__pick[data-choose]');
    if (!t) return;
    tileDrag = { kind: t.getAttribute('data-kind'), name: t.getAttribute('data-choose') };
    S.menu = ''; hideTip(); tileDragMode(true);
    if (ev.dataTransfer) { ev.dataTransfer.effectAllowed = 'copy'; ev.dataTransfer.setData('text/plain', tileDrag.name); }
  });
  document.addEventListener('dragover', function (ev) {
    if (!tileDrag) return;
    var cellEl = tileDropCell(ev);
    clearTileDrop();
    if (!cellEl) return;
    ev.preventDefault();
    if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'copy';
    /* Say what the drop will do: fill a blank cell, or replace what is there. */
    var cur = findCell(cellEl.getAttribute('data-cell')).cell;
    cellEl.setAttribute('data-drop-label', cur.type ? (cur.type === tileDrag.name ? 'Already ' + tileDrag.name : 'Replace with ' + tileDrag.name) : 'Add ' + tileDrag.name);
    cellEl.classList.add('cc-p-doe__cell--drop');
  });
  document.addEventListener('drop', function (ev) {
    if (!tileDrag) return;
    var cellEl = tileDropCell(ev), td = tileDrag;
    clearTileDrop(); tileDrag = null; tileDragMode(false);
    if (!cellEl) return;
    ev.preventDefault();
    var id = cellEl.getAttribute('data-cell');
    assignContent(findCell(id).cell, td.kind, td.name);
    S.select = id;            // the dropped-on cell becomes the selection, so the picker ticks its new content
    render();
  });
  document.addEventListener('dragend', function () { if (tileDrag) { tileDrag = null; clearTileDrop(); } tileDragMode(false); });

  /* ── Drag and drop: a cell is draggable only while the pointer is down on its grip (lion's approach). */
  var drag = null;
  function clearDrop() {
    document.querySelectorAll('.cc-p-doe__cell--over-before, .cc-p-doe__cell--over-after, .cc-p-doe__row--over-before, .cc-p-doe__row--over-after, .cc-p-doe__row--over-end')
      .forEach(function (n) { n.classList.remove('cc-p-doe__cell--over-before', 'cc-p-doe__cell--over-after', 'cc-p-doe__row--over-before', 'cc-p-doe__row--over-after', 'cc-p-doe__row--over-end'); });
  }
  function rowIndexOf(el) { var id = el.getAttribute('data-row'); return canvasRows().map(function (r) { return r.id; }).indexOf(id); }
  function dropAt(ev) {
    if (!drag) return null;
    var rowEl = ev.target.closest && ev.target.closest('#doe-root .cc-p-doe__row[data-row]');
    if (!rowEl) return null;
    var i = rowIndexOf(rowEl), rows = canvasRows(), rr = rowEl.getBoundingClientRect();
    if (i < 0) return null;
    if (drag.rowMove) {
      var before = ev.clientY < rr.top + rr.height / 2, to = before ? i : i + 1;
      if (to === drag.i || to === drag.i + 1) return null;
      return { kind: 'row', i: to, node: rowEl, cls: before ? 'cc-p-doe__row--over-before' : 'cc-p-doe__row--over-after' };
    }
    if (!isCellRow(rows[i])) return null;
    var cellEl = ev.target.closest('.cc-p-doe__cell[data-cell]');
    if (cellEl && rowEl.contains(cellEl)) {
      var j = rows[i].cells.map(function (c) { return c.id; }).indexOf(cellEl.getAttribute('data-cell'));
      var cr = cellEl.getBoundingClientRect(), left = ev.clientX < cr.left + cr.width / 2, k = left ? j : j + 1;
      if (i === drag.i && (k === drag.j || k === drag.j + 1)) return null;
      return { kind: 'cell', i: i, k: k, node: cellEl, cls: left ? 'cc-p-doe__cell--over-before' : 'cc-p-doe__cell--over-after' };
    }
    var end = rows[i].cells.length;
    if (i === drag.i && end === drag.j + 1) return null;
    return { kind: 'cell', i: i, k: end, node: rowEl, cls: 'cc-p-doe__row--over-end' };
  }
  document.addEventListener('pointerdown', function (ev) {
    var g = ev.target.closest && ev.target.closest('#doe-root [data-doe-grip]');
    if (!g) return;
    var c = g.closest('.cc-p-doe__cell'); if (c) c.draggable = true;
  });
  document.addEventListener('pointerup', function () {
    document.querySelectorAll('#doe-root .cc-p-doe__cell[draggable="true"]').forEach(function (c) { if (!drag) c.draggable = false; });
  });
  document.addEventListener('dragstart', function (ev) {
    var c = ev.target.closest && ev.target.closest('#doe-root .cc-p-doe__cell');
    if (!c || !c.draggable) return;
    var at = locate(c.getAttribute('data-cell')); if (!at) { ev.preventDefault(); return; }
    var rows = canvasRows();
    S.menu = ''; hideTip();
    drag = { i: at.i, j: at.j, rowMove: rowMover(rows[at.i], rows[at.i].cells[at.j]) };
    c.classList.add('cc-p-doe__cell--dragging');
    if (drag.rowMove) c.closest('.cc-p-doe__row').classList.add('cc-p-doe__row--dragging');
    if (ev.dataTransfer) { ev.dataTransfer.effectAllowed = 'move'; ev.dataTransfer.setData('text/plain', c.getAttribute('data-cell')); }
  });
  document.addEventListener('dragover', function (ev) {
    if (!drag) return;
    var t = dropAt(ev);
    clearDrop();
    if (!t) return;
    ev.preventDefault();
    if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'move';
    t.node.classList.add(t.cls);
  });
  document.addEventListener('drop', function (ev) {
    if (!drag) return;
    var t = dropAt(ev);
    clearDrop();
    if (!t) return;
    ev.preventDefault();
    if (t.kind === 'row') moveRow(drag.i, t.i); else moveCell(drag.i, drag.j, t.i, t.k);
    drag = null;
    render();
  });
  document.addEventListener('dragend', function () {
    clearDrop(); drag = null;
    document.querySelectorAll('.cc-p-doe__cell--dragging, .cc-p-doe__row--dragging').forEach(function (n) { n.classList.remove('cc-p-doe__cell--dragging', 'cc-p-doe__row--dragging'); });
    document.querySelectorAll('#doe-root .cc-p-doe__cell[draggable="true"]').forEach(function (c) { c.draggable = false; });
  });

  /* Remember docked-panel sections opened / closed, so a redraw keeps the editor's place. */
  document.addEventListener('toggle', function (e) {
    var dsec = e.target.closest && e.target.closest('details[data-sec]');
    if (dsec === e.target) S.secOpen[dsec.getAttribute('data-sec')] = dsec.open;
  }, true);
  /* Design Objects picker: clicking a row picks it. */
  document.addEventListener('click', function (e) {
    var tr = e.target.closest('.cc-p-doe__dop-row');
    if (!tr) return;
    var rb = tr.querySelector('input[type="radio"]'); rb.checked = true;
    document.querySelectorAll('.cc-p-doe__dop-row').forEach(function (x) { x.classList.toggle('is-on', x === tr); });
  });
  /* Audience chips: toggle on/off (no redraw). */
  document.addEventListener('click', function (e) {
    var ch = e.target.closest('[data-chip]');
    if (!ch) return;
    var on3 = !ch.classList.contains('is-on');
    S.vals[ch.getAttribute('data-chip')] = on3;
    ch.classList.toggle('is-on', on3); ch.setAttribute('aria-pressed', on3);
    var old = ch.querySelector('svg'); if (old) old.remove();
    if (on3) { ch.insertAdjacentHTML('afterbegin', ic('check', 'doe-ic')); if (window.lucide) lucide.createIcons(); }
    markDirty();
  });
  /* Breakpoint tiles: hide/show the cell at a breakpoint, then redraw so the canvas chip updates. */
  document.addEventListener('click', function (e) {
    var tile2 = e.target.closest('[data-hide]');
    if (!tile2) return;
    var k = tile2.getAttribute('data-hide'), m = k.match(/^(.+)\|hide:(.+)$/), hit = m && findCell(m[1]);
    if (!hit) return;
    S.vals[k] = !tile2.classList.contains('is-off');
    hit.cell.hiddenAt = D.BREAKPOINTS.map(function (b) { return b.label; }).filter(function (lbl) {
      return vget(m[1] + '|hide:' + lbl, !!(hit.cell.hiddenAt && hit.cell.hiddenAt.indexOf(lbl) !== -1)) === true;
    });
    if (!hit.cell.hiddenAt.length) hit.cell.hiddenAt = undefined;
    markDirty(); render();
  });

  /* Segmented controls: pick a value (no redraw, so the panel stays put). */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-seg] .doe-seg__btn');
    if (!b || b.classList.contains('is-active')) return;
    var group = b.closest('[data-seg]');
    group.querySelectorAll('.doe-seg__btn').forEach(function (x) { var a = x === b; x.classList.toggle('is-active', a); x.setAttribute('aria-checked', a); });
    S.vals[group.getAttribute('data-seg')] = b.getAttribute('data-val');
    markDirty();
  });
  /* Colour: the swatch's native picker writes the text field; typing a hex updates the swatch. */
  document.addEventListener('input', function (e) {
    var pk = e.target.getAttribute && e.target.getAttribute('data-colour-for');
    var wrap = e.target.closest && e.target.closest('.cc-p-doe-insp__colour');
    if (!wrap) return;
    var text = wrap.querySelector('.cc-p-doe-insp__colour-text'), sw = wrap.querySelector('.doe-colour__swatch');
    var v = pk ? e.target.value : text.value.trim();
    if (pk) { text.value = v; S.vals[pk] = v; markDirty(); }
    var ok = /^#?[0-9a-f]{3,8}$/i.test(v) || /^(rgb|hsl)a?\(/i.test(v);
    sw.classList.toggle('doe-colour__swatch--none', !v);
    sw.style.background = v && ok ? (v.charAt(0) === '#' || /\(/.test(v) ? v : '#' + v) : '';
  });

  /* Switch bindings: DS Toggle.js flips aria-checked on its own click listener; read it after. */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('.toggle[data-k]');
    if (!t) return;
    setTimeout(function () { S.vals[t.getAttribute('data-k')] = t.getAttribute('aria-checked') === 'true'; }, 0);
  });
  function renameLive(id, name) {
    var hit = findCell(id);
    if (!hit || !name) return;
    hit.cell.name = name;
    var el = document.querySelector('.cc-p-doe__cell[data-cell="' + id + '"] .cc-p-doe__name'); if (el) el.textContent = name;
    var hd = document.querySelector('.cc-p-doe__panel [data-live-name]'); if (hd) hd.textContent = name;
  }

  document.addEventListener('keydown', function (e) {
    if (!ddEl) return;
    var opts = [].slice.call(ddEl.querySelectorAll('.cc-p-doe__dd-opt')), i = opts.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); opts[Math.min(opts.length - 1, i + 1)].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); opts[Math.max(0, i - 1)].focus(); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); closeDd(true); }
    else if (e.key === 'Tab') closeDd(false);
  }, true);
  document.addEventListener('scroll', function (e) { if (ddEl && !ddEl.contains(e.target)) closeDd(false); }, true);
  window.addEventListener('resize', function () { closeDd(false); });

  document.addEventListener('click', function (e) {
    if (e.target.closest('#doe-root .toggle, #doe-modal-root .toggle')) markDirty();
    /* Picker tile: assign the element / design object / script to the cell. */
    var tile = e.target.closest('#doe-root .cc-p-doe__pick[data-choose]');
    if (tile && !tile.classList.contains('is-current')) {
      var hitT = findCell(S.select);
      if (hitT) { assignContent(hitT.cell, tile.getAttribute('data-kind'), tile.getAttribute('data-choose')); render(); return; }
    }
    var a = e.target.closest('[data-act]');
    if (a && a.closest('#doe-root, #doe-modal-root, #doe-pop-root')) {
      var act = a.dataset.act, id = a.dataset.id, openMenu = S.menu;
      S.menu = '';
      /* Close shuts the topmost thing only: an open modal first, the panel otherwise (Mark, 2026-11-10). */
      if (act === 'close') { if (S.modal) S.modal = false; else S.panel = ''; }
      else if (act === 'cellProps' || act === 'rowProps' || act === 'addCell') { S.select = id || S.select; S.panel = act; }
      else if (act === 'content') {
        /* The cell stays selected, so an open properties panel stays open (following it) under the modal. */
        if (S.panel && S.panel !== 'content') { selectCell(id); if (S.panel !== 'cellProps') S.panel = 'cellProps'; }
        S.select = id;
        var c = findCell(id).cell;
        /* The live editor opens the element's own settings in a modal once an element is chosen;
           an empty/incomplete cell opens the Cell Content picker panel instead. */
        /* Lion (§7/§13): a blank cell chooses its content; a design object / design script cell opens
           its picker; a design element opens its settings. Step 2 swaps the pickers for the tile panel. */
        if (!c.type) { S.panel = 'content'; S.modal = false; S.kindTab = ''; }
        else if (c.kind === 'do') { if (on(2)) { S.panel = 'content'; S.kindTab = 'do'; S.modal = false; } else { S.modal = 'doPicker'; } }
        else if (c.kind === 'script') { if (on(2)) { S.panel = 'content'; S.kindTab = 'script'; S.modal = false; } else { S.modal = 'scriptPicker'; } }
        else { S.modal = true; }
      }
      else if (act === 'dopSelect') {
        var chosen = document.querySelector('input[name="dop"]:checked'), dc = findCell(id);
        if (chosen && dc && chosen.value !== dc.cell.type) {
          dc.cell.type = chosen.value;
          if (a.dataset.kind !== 'script') {
            dc.cell.doType = doTypeOf(chosen.value);
            if (chosen.value !== '2016 RB Navigation') delete dc.cell.nested; else dc.cell.nested = HEADER_NESTED;
          }
          markDirty();
        }
        S.modal = false;
      }
      else if (act === 'toggleDone') { var td = findCell(id); if (td) td.cell.incomplete = !td.cell.incomplete; }   // written straight away on lion (no Save)
      else if (act === 'deleteCell') { cellOp('delete', id); }
      else if (act === 'cutCell') { cellOp('cut', id); }
      else if (act === 'copyCell') { cellOp('copy', id); }
      else if (act === 'pasteCell') { cellOp('paste', id); }
      else if (act === 'addAt') { S.select = id; addCellAt(a.dataset.where); }
      else if (act === 'addCellSave') { var w = document.querySelector('input[name="add"]:checked'); if (w) addCellAt(w.value); }
      else if (act === 'noop') { if (openMenu && openMenu.indexOf('__') !== 0) markDirty(); }
      else if (act === 'switchDo') {
        if (id === '2018 Simple DO') { if (S.nested) { S.select = S.nested; S.nested = ''; S.panel = ''; S.modal = false; } }
        else if (id === '2016 RB Navigation' && headerCell.nested) { S.nested = headerCell.id; S.select = ''; S.panel = ''; S.modal = false; }   // in this DO: go into it
        else infoToast(id === '__all' ? 'Would open the Design Objects list' : 'Would open “' + id + '” (not part of this prototype)');
      }
      else if (act === 'save') { doSave(); return; }
      else if (act === 'pickImage') { S.vals[id] = 'hero-banner.webp'; markDirty(); }   // mock media picker
      else if (act === 'clearImage') { delete S.vals[id]; markDirty(); }
      else if (act === 'clear') { S.menu = (openMenu === 'clear:' + id ? '' : 'clear:' + id); selectCell(id); }
      else if (act === 'clearContent' || act === 'clearProps' || act === 'clearBoth') {
        clearCell(id, act === 'clearContent' ? 'content' : act === 'clearProps' ? 'props' : 'both');
        /* A cell left without content opens Cell Content, ready to fill (Mark, 2026-11-11). */
        if (act !== 'clearProps') { S.select = id; S.panel = 'content'; S.kindTab = ''; S.modal = false; }
      }
      else if (act === 'moveLeft' || act === 'moveRight' || act === 'moveUp' || act === 'moveDown') { menuMove(id, act.slice(4).toLowerCase()); }
      else if (act === 'bp') { S.bp = id; }
      else if (act === 'nested') { S.nested = id; S.select = ''; S.panel = ''; S.modal = false; }
      else if (act === 'exitNested') { S.select = S.nested; S.nested = ''; S.panel = ''; S.modal = false; }
      else if (act === 'kindTab') { S.kindTab = id; }
      else if (act === 'changeElement') { S.select = id; S.modal = false; S.panel = 'content'; S.kindTab = ''; }
      else if (act === 'menu') { S.menu = (openMenu === id ? '' : id); if (id.indexOf('__') !== 0) selectCell(id); }
      else if (act === 'modifiedOnly') { a.classList.toggle('btn--active'); filterSettings(); return; }
      else if (act === 'collapseAll') { document.querySelectorAll('.cc-p-doe__sec').forEach(function (d) { d.open = false; }); return; }
      else return;
      return render();
    }
    if (S.menu && !e.target.closest('.cc-p-doe__menu')) { S.menu = ''; render(); return; }
    /* Step 4: clicking a cell body selects it (the live editor only highlights a cell while its panel is open). */
    /* Step 4: click a cell, or a row's padding/label, to select it. If a properties panel is open,
       it follows the selection (selection drives the panel, no extra click). */
    var cell = e.target.closest('.cc-p-doe__cell');
    var rowEl = !cell && e.target.closest('.cc-p-doe__row');
    /* Clicks in a cell's toolbar strip (incl. the gaps between its 24px buttons), on the grip, the chips
       or the row's properties gutter are near-misses on a control, not "open this cell" (Mark, 2026-11-10). */
    var nearControl = e.target.closest('.cc-p-doe__tools, .cc-p-doe__grip, .cc-p-doe__badges, .cc-p-doe__flag, .cc-p-doe__gutter');
    if (on(4) && (cell || rowEl) && !e.target.closest('button') && !nearControl) {
      if (cell) {
        selectCell(cell.dataset.cell);
        S.panel = 'cellProps'; S.modal = false;   // clicking a cell opens its properties, as rows do (Mark, 2026-11-10)
      } else {
        var rr0 = findRow(rowEl.dataset.row);
        if (rr0 && !isCellRow(rr0)) selectCell(rr0.cells[0].id);   // a lone-layout row has no row settings: select its cell
        else { S.select = rowEl.dataset.row; S.panel = 'rowProps'; S.modal = false; }   // clicking a row opens its properties (Mark, 2026-11-10)
      }
      S.menu = '';
      render();
      return;
    }
    if (e.target.classList.contains('modal-overlay')) { S.modal = false; render(); }
  });
  document.addEventListener('input', function (e) {
    if (e.target.matches('[data-pick-search]')) {
      var q = e.target.value.trim().toLowerCase();
      document.querySelectorAll('.cc-p-doe__pick').forEach(function (b) { b.hidden = q && b.dataset.pick.indexOf(q) === -1; });
      document.querySelectorAll('[data-pick-group]').forEach(function (g) {
        g.hidden = !g.querySelector('.cc-p-doe__pick:not([hidden])');
        if (q && !g.hidden && g.tagName === 'DETAILS') g.open = true;   // a match inside a collapsed category shows
      });
    }
    if (e.target.matches('[data-setting-search]')) filterSettings();
    if (e.target.matches('[data-dos-search]')) {
      var sq = e.target.value.trim().toLowerCase();
      document.querySelectorAll('[data-dos-item]').forEach(function (li) { li.hidden = sq && li.getAttribute('data-dos-item').indexOf(sq) === -1; });
    }
    if (e.target.matches('[data-dop-search]')) {
      var dq = e.target.value.trim().toLowerCase();
      document.querySelectorAll('.cc-p-doe__dop-row').forEach(function (tr) { tr.hidden = dq && tr.getAttribute('data-dop').indexOf(dq) === -1; });
    }
    /* Text / number / textarea bindings */
    var kIn = e.target.getAttribute && e.target.getAttribute('data-k');
    if (kIn && e.target.type !== 'checkbox') {
      S.vals[kIn] = e.target.value;
      if (/\|(name|b:Name)$/.test(kIn)) renameLive(kIn.split('|')[0], e.target.value);
    }
    /* Any real edit (not a search box) makes the design object dirty. */
    if (e.target.closest('#doe-root, #doe-modal-root') && !e.target.matches('[type="search"]')) markDirty();
  });
  function filterSettings() {
    var input = document.querySelector('[data-setting-search]');
    var q = input ? input.value.trim().toLowerCase() : '';
    var modOnly = !!document.querySelector('[data-act="modifiedOnly"].btn--active');
    document.querySelectorAll('.cc-p-doe__sec').forEach(function (sec) {
      var any = false;
      sec.querySelectorAll('.cc-p-doe__setting').forEach(function (r) {
        var show = (!q || r.dataset.setting.indexOf(q) !== -1) && (!modOnly || r.classList.contains('is-mod'));
        r.hidden = !show; if (show) any = true;
      });
      sec.hidden = !any; if (any && (q || modOnly)) sec.open = true;
    });
  }
  document.addEventListener('pointerdown', function (e) {
    var h = e.target.closest('.cc-p-doe__resize');
    if (!h) return;
    e.preventDefault();
    var startX = e.clientX, startW = S.panelW;
    h.setPointerCapture(e.pointerId);
    document.body.classList.add('doe-resizing');
    function move(ev) { S.panelW = clampW(startW + (startX - ev.clientX)); applyW(); }
    function up() {
      h.removeEventListener('pointermove', move); h.removeEventListener('pointerup', up); h.removeEventListener('pointercancel', up);
      document.body.classList.remove('doe-resizing'); saveW();
    }
    h.addEventListener('pointermove', move); h.addEventListener('pointerup', up); h.addEventListener('pointercancel', up);
  });
  document.addEventListener('keydown', function (e) {
    if (!e.target.classList || !e.target.classList.contains('cc-p-doe__resize')) return;
    var step = e.shiftKey ? 64 : 16;
    if (e.key === 'ArrowLeft') S.panelW = clampW(S.panelW + step);
    else if (e.key === 'ArrowRight') S.panelW = clampW(S.panelW - step);
    else return;
    e.preventDefault(); applyW(); saveW();
  });
  window.addEventListener('resize', function () { if (on(6)) { S.panelW = clampW(S.panelW); applyW(); } if (S.menu) { S.menu = ''; render(); } });
  document.addEventListener('scroll', function () { if (S.menu) { S.menu = ''; render(); } }, true);
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    /* Esc: menu, then modal, then panel — one layer at a time */
    if (S.menu) { S.menu = ''; render(); }
    else if (S.modal) { S.modal = false; render(); }
    else if (S.panel) { S.panel = ''; render(); }
    else if (S.nested) { S.select = S.nested; S.nested = ''; render(); }
  });

  /* Demo gear menu: one switch per step. */
  var LABELS = ['Step 1 · Buttons & element icons', 'Step 2 · Element picker', 'Step 3 · Settings modal', 'Step 4 · Selection & chips', 'Step 5 · Row structure', 'Step 6 · Editor layout', 'Step 7 · Add cell on canvas'];
  if (window.demoToolbar) {
    window.demoToolbar.addControls(LABELS.map(function (l, i) {
      return { label: l, id: 'step' + (i + 1), active: on(i + 1), onClick: function (btn) {
        var n = i + 1;
        if (on(n)) S.steps = S.steps.filter(function (x) { return x !== n; }); else {
          S.steps.push(n);
          /* Steps 2 and 3 live inside views that are closed by default; open the one each changes. */
          if (n === 2) { S.select = 'c-prime'; S.panel = 'content'; S.modal = false; }
          if (n === 3) { S.select = 'c-al'; S.modal = true; S.panel = ''; }
        }
        btn.classList.toggle('active', on(n));
        render();
      } };
    }).concat([{ label: 'All steps on', onClick: function () { location.search = '?steps=1,2,3,4,5,6,7'; } },
               { label: 'Baseline (all off)', onClick: function () { location.search = ''; } }]));
  }
  render();
})();
