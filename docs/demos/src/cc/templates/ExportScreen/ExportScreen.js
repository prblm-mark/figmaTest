/* ExportScreen — the v3 Export pattern engine (TASK-575621).
 *
 *   ExportScreen.init({
 *     noun: ['contact', 'contacts'], total: 48210,         // what is exported; the demo's base count
 *     presets: [{ id, label, help, keys: [...] | 'all' }, …], // column presets ('custom' is added)
 *     columns: [{ group, items: [[key, label], …] }, …],     // every column the export can write
 *     formats: ['XLSX', 'CSV', 'TSV'],
 *     filePrefix: 'user-export', email: '…', userName: '…',
 *     recent: [{ id, name, meta, records, format, by, when, status: 'running'|'ready'|'expired', processed }]
 *   });
 *
 * Filters are whatever FieldRows the page puts in [data-xp-filters]; the engine reads them
 * generically (text, lookup, date, select, checkbox, radio), so a new export only lists its fields.
 * Everything is mock: the count is a deterministic fake, the run is a timer, and Download hands
 * over a CSV of the chosen column headers. Contracts: TODO(backend:ExportScreen) markers +
 * HANDOVER.md § Surface: ExportScreen.
 *
 * Demo URL params: ?count=0 (nothing matches)  ?cols=custom (picker open)  ?recent=0 (no history)
 */
(function () {
  var params = new URLSearchParams(location.search);
  var cfg, root, timer, state;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function num(n) { return n.toLocaleString('en-GB'); }
  function noun(n) { return n === 1 ? cfg.noun[0] : cfg.noun[1]; }
  function icons() { if (window.lucide) window.lucide.createIcons(); }
  function spinner() {
    return '<span class="spinner spinner--sm spinner--inverted" aria-hidden="true">' +
      '<svg class="spinner__svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<circle class="spinner__track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"></circle>' +
      '<path class="spinner__arc" d="M12 2 a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>' +
      '</svg></span>';
  }

  /* ── Reading and clearing a filter FieldRow ──────────── */

  function label(row) {
    var l = $('.field-row__label', row);
    return l ? l.textContent.replace('*', '').trim() : '';
  }

  // The row's current value as text, or '' when it is at its "no filter" state.
  function value(row) {
    var sel = $('.sel', row);
    if (sel) {
      var v = $('.sel__value', sel).textContent.trim();
      var first = $('.sel__menu-item', sel);
      return first && v === first.textContent.trim() ? '' : v;
    }
    var radios = $$('input[type="radio"]', row);
    if (radios.length) {
      var on = radios.filter(function (r) { return r.checked; })[0];
      return on && on !== radios[0] ? on.closest('label').textContent.trim() : '';
    }
    var cb = $('input[type="checkbox"]', row);
    if (cb) return cb.checked ? 'Yes' : '';
    var input = $('input.input__control', row);
    return input ? input.value.trim() : '';
  }

  function clear(row) {
    var sel = $('.sel', row);
    if (sel) {
      var first = $('.sel__menu-item', sel);
      if (first) first.click();
      return;
    }
    var radios = $$('input[type="radio"]', row);
    if (radios.length) { radios[0].checked = true; return; }
    var cb = $('input[type="checkbox"]', row);
    if (cb) { cb.checked = false; return; }
    var input = $('input.input__control', row);
    if (input) input.value = '';
  }

  function filterRows() { return $$('[data-xp-filters] [data-xp-group] .field-row', root); }

  function applied() {
    return filterRows().map(function (row) {
      return { row: row, label: label(row), value: value(row) };
    }).filter(function (f) { return f.value; });
  }

  /* ── Live count (mock) ───────────────────────────────── */

  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }

  // TODO(backend:ExportScreen) export-count: a deterministic fake → a count endpoint per export
  //   that runs the export's own WHERE (same filters, same rights) and returns the number of
  //   records, cheap enough to call on every change (debounced 350ms here).
  function fakeCount(list) {
    if (params.get('count') === '0') return 0;
    var n = cfg.total;
    list.forEach(function (f) {
      var isText = $('input.input__control:not([readonly])', f.row) && !$('.sel', f.row);
      var k = 0.2 + (hash(f.label + '|' + f.value) % 55) / 100;
      n *= isText ? k / 8 : k;
    });
    n = Math.round(n);
    return n > 100 ? Math.round(n / 10) * 10 : n;
  }

  /* ── Columns ─────────────────────────────────────────── */

  function allKeys() { return cfg.columns.reduce(function (a, g) { return a.concat(g.items.map(function (i) { return i[0]; })); }, []); }
  function colLabel(k) { var hit; cfg.columns.some(function (g) { return g.items.some(function (i) { if (i[0] === k) { hit = i[1]; return true; } }); }); return hit || k; }

  function presetKeys(id) {
    var p = cfg.presets.filter(function (x) { return x.id === id; })[0];
    return !p ? [] : p.keys === 'all' ? allKeys() : p.keys.slice();
  }

  function chosenKeys() {
    var id = ($('[data-xp-presets] input:checked', root) || {}).value;
    if (id !== 'custom') return presetKeys(id);
    return $$('[data-xp-col]', root).filter(function (c) { return c.checked; }).map(function (c) { return c.value; });
  }

  function syncPicker() {
    var picker = $('[data-xp-picker]', root);
    var custom = ($('[data-xp-presets] input:checked', root) || {}).value === 'custom';
    picker.hidden = !custom;
    var all = $$('[data-xp-col]', root);
    var on = all.filter(function (c) { return c.checked; }).length;
    $('[data-xp-col-count]', root).textContent = num(on) + ' of ' + num(all.length) + ' columns chosen';
    $$('[data-xp-col-group]', root).forEach(function (g) {
      var boxes = $$('[data-xp-col]', g), n = boxes.filter(function (c) { return c.checked; }).length;
      var gAll = $('[data-xp-group-all]', g);
      gAll.checked = n === boxes.length;
      gAll.indeterminate = n > 0 && n < boxes.length;
    });
  }

  function search(q) {
    q = q.trim().toLowerCase();
    var any = false;
    $$('[data-xp-col-group]', root).forEach(function (g) {
      var shown = 0;
      $$('[data-xp-col]', g).forEach(function (c) {
        var hit = !q || c.closest('label').textContent.toLowerCase().indexOf(q) !== -1;
        c.closest('.checkbox').hidden = !hit;
        if (hit) shown++;
      });
      g.hidden = !shown;
      if (shown) any = true;
    });
    $('[data-xp-col-empty]', root).hidden = any;
  }

  /* ── Summary ─────────────────────────────────────────── */

  function render() {
    var list = applied();
    var ul = $('[data-xp-applied]', root);
    ul.innerHTML = list.map(function (f, i) {
      return '<li class="cc-xp__applied-item"><span class="cc-xp__applied-text"><span class="cc-xp__applied-label">' + esc(f.label) + ': </span>' +
        '<span class="cc-xp__applied-value">' + esc(f.value) + '</span></span>' +
        '<button type="button" class="btn btn--tertiary btn--xs btn--icon" data-xp-clear="' + i + '" aria-label="Remove filter ' + esc(f.label) + '"><i data-lucide="x" aria-hidden="true"></i></button></li>';
    }).join('');
    ul.hidden = !list.length;
    $('[data-xp-none]', root).hidden = !!list.length;
    $('[data-xp-clear-all]', root).hidden = !list.length;
    var chip = $('[data-xp-filter-count]', root);
    chip.textContent = list.length; chip.hidden = !list.length;
    chip.setAttribute('aria-label', list.length + (list.length === 1 ? ' filter' : ' filters'));
    state.list = list;

    // Each group's chip counts its own set filters.
    $$('[data-xp-group]', root).forEach(function (g) {
      var n = $$('.field-row', g).filter(function (r) { return value(r); }).length;
      var c = $('[data-xp-group-count]', g);
      c.textContent = n; c.hidden = !n;
      c.setAttribute('aria-label', n + ' set');
    });

    var scope = $('[data-xp-scope] .field-row', root);
    $('[data-xp-from]', root).textContent = scope ? (value(scope) || $('.sel__value', scope).textContent.trim()) : '';

    var id = ($('[data-xp-presets] input:checked', root) || {}).value;
    var keys = chosenKeys();
    var p = cfg.presets.filter(function (x) { return x.id === id; })[0];
    $('[data-xp-cols-line]', root).textContent = id === 'custom'
      ? num(keys.length) + ' chosen column' + (keys.length === 1 ? '' : 's')
      : p.label + ' (' + num(keys.length) + ')';
    icons();
    recount();
  }

  function recount() {
    var box = $('[data-xp-count]', root);
    box.classList.add('cc-xp__count--busy');
    $('[data-xp-count-label]', root).textContent = 'Counting…';
    state.counting = true;
    syncGo();
    clearTimeout(timer);
    timer = setTimeout(function () {
      state.count = fakeCount(state.list);
      state.counting = false;
      box.classList.remove('cc-xp__count--busy');
      box.classList.toggle('cc-xp__count--zero', state.count === 0);
      $('[data-xp-count-value]', root).textContent = num(state.count);
      $('[data-xp-count-label]', root).textContent = state.count === 0
        ? 'No ' + cfg.noun[1] + ' match. Remove a filter to widen the export.'
        : noun(state.count) + ' match' + (state.count === 1 ? 'es' : '') + ' these filters';
      syncGo();
    }, 350);
  }

  function syncGo() {
    var go = $('[data-xp-go]', root), note = $('[data-xp-go-note]', root);
    if (state.running) return;
    var cols = chosenKeys().length;
    var reason = state.counting ? '' : state.count === 0 ? 'Nothing to export yet.' : !cols ? 'Choose at least one column.' : '';
    go.disabled = state.counting || state.count === 0 || !cols;
    go.innerHTML = '<i data-lucide="download" aria-hidden="true"></i><span>' +
      (state.counting || state.count == null ? 'Export' : 'Export ' + num(state.count) + ' ' + noun(state.count)) + '</span>';
    note.textContent = reason || 'Exports run in the background. We’ll email you when the file is ready, and it appears in Your recent exports.';
    icons();
  }

  /* ── Recent exports ──────────────────────────────────── */

  function statusCell(r) {
    if (r.status === 'running') {
      var pct = r.records ? Math.round(r.processed / r.records * 100) : 0;
      return '<div class="cc-xp__status"><span class="cc-xp__status-text">' + num(r.processed) + ' of ' + num(r.records) + '</span>' +
        '<span class="cc-xp__meter-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + r.records + '" aria-valuenow="' + r.processed + '" aria-label="' + esc(r.name) + '"><span class="cc-xp__meter-fill" style="inline-size:' + pct + '%"></span></span></div>';
    }
    if (r.status === 'ready') return '<div class="cc-xp__status"><span><span class="badge badge--success">Ready</span></span><span class="cc-xp__status-text">' + esc(r.expires || 'Kept for 7 days') + '</span></div>';
    if (r.status === 'failed') return '<span class="badge badge--danger">Failed</span>';
    return '<div class="cc-xp__status"><span><span class="badge badge--neutral">Expired</span></span><span class="cc-xp__status-text">Run it again to get a new file</span></div>';
  }

  function renderRecent() {
    var card = $('[data-xp-recent]', root);
    var rows = params.get('recent') === '0' ? [] : cfg.recent;
    card.hidden = !rows.length;
    var chip = $('[data-xp-recent-count]', card);
    chip.textContent = rows.length; chip.setAttribute('aria-label', rows.length + ' exports');
    $('tbody', card).innerHTML = rows.map(function (r) {
      return '<tr data-xp-row="' + r.id + '"><td><span class="cc-xp__file-name">' + esc(r.name) + '</span><span class="cc-xp__file-meta">' + esc(r.meta) + '</span></td>' +
        '<td>' + num(r.records) + '</td><td>' + esc(r.format) + '</td><td>' + esc(r.by) + '</td><td>' + esc(r.when) + '</td>' +
        '<td>' + statusCell(r) + '</td>' +
        '<td class="cc-xp__dl">' + (r.status === 'ready'
          ? '<button type="button" class="btn btn--secondary btn--sm" data-xp-download="' + r.id + '" aria-label="Download ' + esc(r.name) + '" data-backend-todo="export-download"><i data-lucide="download" aria-hidden="true"></i><span>Download</span></button>'
          : '') + '</td></tr>';
    }).join('');
    icons();
  }

  // TODO(backend:ExportScreen) export-download: hands over a CSV of the chosen column headers →
  //   the finished file from the run (v1 emails a link), served only to the user who ran it (or
  //   right 160), for 7 days; then the row reads Expired.
  function download(id) {
    var r = cfg.recent.filter(function (x) { return String(x.id) === String(id); })[0];
    var keys = r.keys || allKeys().slice(0, 12);
    var q = function (v) { return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([keys.map(function (k) { return q(colLabel(k)); }).join(',') + '\r\n'], { type: 'text/csv' }));
    a.download = r.name.replace(/\.[^.]+$/, '') + '.csv';
    document.body.appendChild(a); a.click(); a.remove();
  }

  /* ── Run ─────────────────────────────────────────────── */

  // TODO(backend:ExportScreen) export-run: a timer → v1's createScheduledTask for this export
  //   (Type, Data = the filters + chosen columns + format, TotalRecords = the count), returning the
  //   ScheduledTaskCode; the row's progress is RecordsProcessed / TotalRecords (v1 TaskProgress).
  function run() {
    var go = $('[data-xp-go]', root);
    var fmt = ($('[data-xp-format] .seg-control__btn--active', root) || {}).textContent;
    fmt = (fmt || cfg.formats[0]).trim();
    var keys = chosenKeys(), count = state.count, list = state.list;
    state.running = true;
    go.disabled = true;
    go.innerHTML = spinner() + '<span>Starting…</span>';
    setTimeout(function () {
      var id = Date.now();
      var meta = ($('[data-xp-from]', root).textContent ? 'From ' + $('[data-xp-from]', root).textContent + ' · ' : '') +
        (list.length ? list.length + (list.length === 1 ? ' filter' : ' filters') : 'No filters') + ' · ' + keys.length + ' columns';
      var row = { id: id, name: cfg.filePrefix + '-2026-10-22.' + fmt.toLowerCase(), meta: meta, records: count, format: fmt,
        by: cfg.userName, when: 'Just now', status: 'running', processed: 0, keys: keys };
      cfg.recent.unshift(row);
      renderRecent();
      $('[data-xp-result]', root).innerHTML =
        '<div class="alert alert--success" role="status"><div class="alert__header"><span class="alert__icon"><i data-lucide="circle-check" aria-hidden="true"></i></span>' +
        '<div class="alert__text"><span class="alert__title">Export started.</span><span class="alert__message"> ' + num(count) + ' ' + noun(count) + ' as ' + esc(fmt) +
        '. It runs in the background; we’ll email <strong>' + esc(cfg.email) + '</strong> when it’s ready, and you can download it from Your recent exports.</span></div></div></div>';
      icons();
      state.running = false;
      syncGo();
      var step = Math.max(1, Math.ceil(count / 6));
      var t = setInterval(function () {
        row.processed = Math.min(count, row.processed + step);
        if (row.processed >= count) { row.status = 'ready'; row.expires = 'Kept until 29 Oct'; clearInterval(t); }
        renderRecent();
      }, 600);
    }, 700);
  }

  /* ── Wiring ──────────────────────────────────────────── */

  function init(config) {
    cfg = config;
    root = $('[data-xp]');
    state = {};

    // Accordion (the component's demo toggles inline; there is no Accordion.js).
    $$('[data-xp-filters] [data-acc-trigger]', root).forEach(function (t) {
      var item = t.closest('.acc__item');
      t.setAttribute('aria-expanded', String(item.classList.contains('acc__item--open')));
      t.addEventListener('click', function () {
        item.classList.toggle('acc__item--open');
        t.setAttribute('aria-expanded', String(item.classList.contains('acc__item--open')));
      });
    });

    var filters = $('[data-xp-filters]', root);
    ['input', 'change'].forEach(function (ev) { filters.addEventListener(ev, render); });
    // Select.js and DatePicker.js set values on click without firing input/change, and the
    // DatePicker redraws its calendar (the clicked day is detached by bubble time). So: capture
    // phase, while the target is still in the filters, then re-read once they have run.
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-xp-filters]')) setTimeout(render, 0);
    }, true);

    root.addEventListener('click', function (e) {
      var c = e.target.closest('[data-xp-clear]');
      if (c) {
        var f = state.list[Number(c.getAttribute('data-xp-clear'))];
        if (f) {
          clear(f.row);
          render();
          // Focus stays in the list: the next remove button, else Export (the list is gone).
          ($('[data-xp-clear]', root) || $('[data-xp-go]', root)).focus();
        }
      }
      if (e.target.closest('[data-xp-clear-all]')) { state.list.forEach(function (f) { clear(f.row); }); render(); $('[data-xp-go]', root).focus(); }
      if (e.target.closest('[data-xp-change-cols]')) {
        var sec = $('[data-xp-columns]', root);
        sec.scrollIntoView({ block: 'start', behavior: 'smooth' });
        var checked = $('[data-xp-presets] input:checked', root);
        if (checked) checked.focus({ preventScroll: true });
      }
      var d = e.target.closest('[data-xp-download]');
      if (d) download(d.getAttribute('data-xp-download'));
      if (e.target.closest('[data-xp-go]')) run();
    });

    // Columns: presets, group select-all, each column, search.
    var cols = $('[data-xp-columns]', root);
    cols.addEventListener('change', function (e) {
      if (e.target.matches('[data-xp-presets] input')) {
        if (e.target.value === 'custom' && !$$('[data-xp-col]', root).some(function (c) { return c.checked; })) {
          var keep = presetKeys(state.lastPreset || cfg.presets[0].id);
          $$('[data-xp-col]', root).forEach(function (c) { c.checked = keep.indexOf(c.value) !== -1; });
        }
        if (e.target.value !== 'custom') state.lastPreset = e.target.value;
      }
      if (e.target.matches('[data-xp-group-all]')) {
        $$('[data-xp-col]', e.target.closest('[data-xp-col-group]')).forEach(function (c) {
          if (!c.closest('.checkbox').hidden) c.checked = e.target.checked;
        });
      }
      syncPicker();
      render();
    });
    $('[data-xp-col-search]', root).addEventListener('input', function (e) { search(e.target.value); });

    state.lastPreset = cfg.presets[0].id;
    if (params.get('cols') === 'custom') {
      var r = $('[data-xp-presets] input[value="custom"]', root);
      r.checked = true;
      var keep = presetKeys(cfg.presets[cfg.presets.length > 1 ? 1 : 0].id);
      $$('[data-xp-col]', root).forEach(function (c) { c.checked = keep.indexOf(c.value) !== -1; });
    }
    syncPicker();
    renderRecent();
    render();
  }

  window.ExportScreen = { init: init };
})();
