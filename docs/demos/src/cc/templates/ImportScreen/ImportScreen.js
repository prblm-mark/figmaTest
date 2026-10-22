/* ImportScreen — the v3 Import pattern engine (TASK-575621).
 *
 * One flow for every Control import, configured per screen:
 *
 *   ImportScreen.init({
 *     steps:   ['upload', 'map', 'options', 'review', 'results'],   // 'options' only if the import has any
 *     accept:  ['xlsx', 'csv'],  maxBytes: 104857600,
 *     fields:  [{ key, label, type: 'n'|'e'|'t', length, required, hint, aliases: [] }, …],
 *     rules:   [{ anyOf: ['UserCode', 'Email'], message: '…' }],    // checked at Map
 *     check:   function (row, ctx) { return [{ field, problem, outcome: 'skip'|'fix', value? }] },
 *     demoFile:{ name, bytes, headers: [], rows: [[]] },             // what any picked file "contains"
 *     run:     'scheduled' | 'now',  email: '…',  noun: 'rows',
 *     progress:[{ id, processed, total, by, started, lastRun }]       // v1 TaskProgress rows
 *   });
 *
 * Everything here is mock: the file is never read (any .xlsx/.csv loads demoFile), validation runs
 * in the browser over demoFile, and the run is a timer. The real contracts are the
 * TODO(backend:ImportScreen) markers in the page and HANDOVER.md § Surface: ImportScreen.
 *
 * Demo URL params: ?step=map|options|review|results  ?run=now|scheduled  ?progress=0
 *                  ?upload=type|size (an upload error)  ?clean=1 (a file with no problems)
 */
(function () {
  var STEP_LABELS = { upload: 'Upload', map: 'Map columns', options: 'Options', review: 'Review', results: 'Results' };
  var params = new URLSearchParams(location.search);

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
  function plural(n, one, many) { return n.toLocaleString('en-GB') + ' ' + (n === 1 ? one : (many || one + 's')); }
  function bytes(n) {
    if (n < 1024) return n + ' B';
    if (n < 1048576) return Math.round(n / 1024) + ' KB';
    return (n / 1048576).toFixed(1).replace(/\.0$/, '') + ' MB';
  }
  function icons() { if (window.lucide) window.lucide.createIcons(); }

  // The Spinner component's own SVG (Spinner.html's template), as ExportSystem carries it.
  function spinner(extra) {
    return '<span class="spinner spinner--sm ' + (extra || '') + '" aria-hidden="true">' +
      '<svg class="spinner__svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<circle class="spinner__track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"></circle>' +
      '<path class="spinner__arc" d="M12 2 a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>' +
      '</svg></span>';
  }

  var cfg, state, root, stepper;

  /* ── Upload ─────────────────────────────────────────── */

  function setUploadError(msg) {
    var drop = $('[data-import-drop]', root);
    var err = $('[data-import-upload-error]', root);
    drop.classList.toggle('drag-drop--error', !!msg);
    err.hidden = !msg;
    err.textContent = msg || '';
  }

  function acceptFile(name, size) {
    var ext = String(name).split('.').pop().toLowerCase();
    if (cfg.accept.indexOf(ext) === -1) {
      setUploadError('“' + name + '” is not a ' + cfg.accept.map(function (a) { return '.' + a; }).join(' or ') + ' file. Save it as one of those and upload it again.');
      return;
    }
    if (size > cfg.maxBytes) {
      setUploadError('“' + name + '” is ' + bytes(size) + '. The limit is ' + bytes(cfg.maxBytes) + '. Split the file and import each part.');
      return;
    }
    setUploadError('');
    // TODO(backend:ImportScreen) import-upload: the file is never sent → upload it (v1's Document
    //   field, docConflict=makeunique) and return its header row, first rows and row count.
    var f = cfg.demoFile;
    state.file = { name: name, size: size || f.bytes, headers: f.headers, rows: params.get('clean') ? f.rows.filter(function (r, i) { return (cfg.cleanRows || []).indexOf(i) !== -1; }) : f.rows };
    state.mapping = autoMap(state.file.headers);
    state.reached = Math.max(state.reached, 0);
    renderFile();
    update();
  }

  function renderFile() {
    var box = $('[data-import-file]', root);
    var drop = $('[data-import-drop]', root);
    if (!state.file) { box.hidden = true; drop.hidden = false; return; }
    drop.hidden = true;
    box.hidden = false;
    $('[data-import-file-name]', box).textContent = state.file.name;
    $('[data-import-file-meta]', box).textContent =
      plural(state.file.rows.length, 'row') + ' · ' + plural(state.file.headers.length, 'column') + ' · ' + bytes(state.file.size);
  }

  function bindUpload() {
    var drop = $('[data-import-drop]', root);
    var input = $('input[type="file"]', drop);
    input.setAttribute('accept', cfg.accept.map(function (a) { return '.' + a; }).join(','));
    drop.addEventListener('click', function (e) { if (e.target !== input) input.click(); });
    drop.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
    });
    input.addEventListener('change', function () {
      if (input.files && input.files[0]) acceptFile(input.files[0].name, input.files[0].size);
      input.value = '';
    });
    ['dragenter', 'dragover'].forEach(function (t) {
      drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add('drag-drop--active'); });
    });
    ['dragleave', 'drop'].forEach(function (t) {
      drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove('drag-drop--active'); });
    });
    drop.addEventListener('drop', function (e) {
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) acceptFile(f.name, f.size);
    });
    root.addEventListener('click', function (e) {
      if (e.target.closest('[data-import-replace]')) { input.click(); }
      if (e.target.closest('[data-import-remove]')) {
        state.file = null; state.mapping = {}; state.review = null;
        renderFile(); update();
        drop.focus();
      }
    });
  }

  /* ── Map ────────────────────────────────────────────── */

  // TODO(backend:ImportScreen) import-map: NEW in v3 (Mark, 2026-10-22; v1 has fixed columns) →
  //   validate and run must accept a column map {fileColumnIndex: ConfigColumn | ''} and read each
  //   row through it, instead of requiring the file's headers to be the config's column names.
  // Header → field: exact key, then label, then any alias, compared without case, spaces or
  // punctuation ("Contact List IDs" = ContactListIDs). Each field is claimed once, first come.
  function autoMap(headers) {
    var map = {}, used = {};
    headers.forEach(function (h, i) {
      var n = norm(h);
      var hit = cfg.fields.find(function (f) {
        if (used[f.key]) return false;
        return norm(f.key) === n || norm(f.label) === n || (f.aliases || []).some(function (a) { return norm(a) === n; });
      });
      map[i] = hit ? hit.key : '';
      if (hit) used[hit.key] = true;
      state.auto[i] = map[i];
    });
    return map;
  }

  function field(key) { return cfg.fields.find(function (f) { return f.key === key; }); }

  function typeHint(f) {
    if (!f) return 'This column will be left out.';
    var t = { n: 'Number', e: 'Email address', t: 'Text' }[f.type] || 'Text';
    if (f.length) t += ', up to ' + f.length + ' characters';
    if (f.required) t += ' · required';
    return f.hint ? t + '. ' + f.hint : t + '.';
  }

  function samples(i) {
    var vals = [];
    state.file.rows.some(function (r) {
      var v = String(r[i] == null ? '' : r[i]).trim();
      if (v && vals.indexOf(v) === -1) vals.push(v.length > 24 ? v.slice(0, 23) + '…' : v);
      return vals.length >= 2;
    });
    return vals.length ? 'e.g. ' + vals.join(', ') : 'Empty in every row';
  }

  function mapProblems() {
    var probs = [], byField = {};
    Object.keys(state.mapping).forEach(function (i) {
      var k = state.mapping[i];
      if (k) (byField[k] = byField[k] || []).push(Number(i));
    });
    Object.keys(byField).forEach(function (k) {
      if (byField[k].length > 1) {
        probs.push({ dup: k, cols: byField[k], message: field(k).label + ' is chosen for ' + byField[k].length + ' columns: ' +
          byField[k].map(function (c) { return '“' + state.file.headers[c] + '”'; }).join(' and ') + '. Choose it for one only.' });
      }
    });
    cfg.fields.forEach(function (f) {
      if (f.required && !byField[f.key]) probs.push({ message: 'Choose a column for ' + f.label + '. Every row needs it.' });
    });
    (cfg.rules || []).forEach(function (r) {
      if (r.anyOf && !r.anyOf.some(function (k) { return byField[k]; })) probs.push({ message: r.message });
    });
    return { list: probs, byField: byField };
  }

  function renderMap() {
    var body = $('[data-import-map-body]', root);
    var probs = mapProblems();
    var dupCols = {};
    probs.list.forEach(function (p) { (p.cols || []).forEach(function (c) { dupCols[c] = true; }); });

    body.innerHTML = state.file.headers.map(function (h, i) {
      var key = state.mapping[i], f = field(key);
      var badge;
      if (dupCols[i]) badge = '<span class="badge badge--danger">Chosen twice</span>';
      else if (!key) badge = '<span class="badge badge--neutral">Not imported</span>';
      else if (key === state.auto[i]) badge = '<span class="badge badge--success">Matched</span>';
      else badge = '<span class="badge badge--info">Changed</span>';

      var opts = cfg.fields.map(function (fl) {
        var sel = fl.key === key;
        return '<li><button type="button" class="sel__menu-item' + (sel ? ' sel__menu-item--selected' : '') + '" role="option"' +
          (sel ? ' aria-selected="true"' : '') + ' data-value="' + esc(fl.key) + '">' + esc(fl.label) + (sel ? ' <i data-lucide="check"></i>' : '') + '</button></li>';
      }).join('') +
        '<li><button type="button" class="sel__menu-item' + (!key ? ' sel__menu-item--selected' : '') + '" role="option"' +
        (!key ? ' aria-selected="true"' : '') + ' data-value="">Don’t import' + (!key ? ' <i data-lucide="check"></i>' : '') + '</button></li>';

      var id = 'imp-map-' + i;
      return '<tr class="cc-import__map-row' + (key ? '' : ' cc-import__map-row--skip') + '" data-col="' + i + '">' +
        '<td><span class="cc-import__col-name" id="' + id + '-col">' + esc(h) + '</span><span class="cc-import__col-sample">' + esc(samples(i)) + '</span></td>' +
        '<td class="cc-import__map-arrow" aria-hidden="true"><i data-lucide="arrow-right"></i></td>' +
        '<td><div class="sel" data-sel data-import-map="' + i + '">' +
          '<button id="' + id + '" class="sel__control" type="button" data-sel-trigger aria-haspopup="listbox" aria-labelledby="' + id + '-col ' + id + '-val">' +
            '<span class="sel__value" id="' + id + '-val">' + esc(f ? f.label : 'Don’t import') + '</span>' +
            '<span class="sel__chevron"><i data-lucide="chevron-down" aria-hidden="true"></i></span></button>' +
          '<ul class="sel__menu" role="listbox" aria-labelledby="' + id + '-col">' + opts + '</ul></div>' +
          '<span class="cc-import__field-hint">' + esc(typeHint(f)) + '</span></td>' +
        '<td class="cc-import__map-status">' + badge + '</td></tr>';
    }).join('');

    var auto = state.file.headers.filter(function (h, i) { return state.auto[i] && state.mapping[i] === state.auto[i]; }).length;
    $('[data-import-map-lead]', root).innerHTML =
      'We matched <strong>' + auto + ' of ' + plural(state.file.headers.length, 'column') + '</strong> to ' + esc(cfg.target || 'fields') +
      ' by name. Check each one, change any that are wrong, and choose <strong>Don’t import</strong> for columns you don’t need.';

    var left = cfg.fields.filter(function (f) { return !probs.byField[f.key]; }).map(function (f) { return f.label; });
    var leftEl = $('[data-import-fields-left]', root);
    leftEl.hidden = !left.length;
    leftEl.textContent = left.length ? 'Not in your file, so left as they are: ' + left.join(', ') + '.' : '';

    var alert = $('[data-import-map-error]', root);
    alert.hidden = !probs.list.length;
    $('[data-import-map-error-list]', root).innerHTML = probs.list.map(function (p) { return '<li>' + esc(p.message) + '</li>'; }).join('');
    icons();
    return probs.list.length === 0;
  }

  function bindMap() {
    // Select.js sets the value text and closes the menu; this keeps the mapping in step.
    document.addEventListener('click', function (e) {
      var item = e.target.closest('[data-import-map] .sel__menu-item');
      if (!item) return;
      var col = item.closest('[data-import-map]').getAttribute('data-import-map');
      state.mapping[col] = item.getAttribute('data-value');
      state.review = null;
      renderMap();
      update();
      var trig = document.getElementById('imp-map-' + col);
      if (trig) trig.focus();
    });
  }

  /* ── Review ─────────────────────────────────────────── */

  function rowObject(r) {
    var o = {};
    Object.keys(state.mapping).forEach(function (i) { if (state.mapping[i]) o[state.mapping[i]] = r[i]; });
    return o;
  }

  function typeCheck(f, v) {
    var s = v == null ? '' : String(v);
    if (!s.trim()) return null;
    if (f.type === 'n' && !/^\s*\d+\s*$/.test(s)) return { field: f.key, problem: f.label + ' must be a number.', outcome: 'skip' };
    if (f.type === 'e') {
      if (s !== s.trim().toLowerCase() && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.trim())) {
        return { field: f.key, problem: 'Spaces and capitals removed: ' + s.trim().toLowerCase() + '.', outcome: 'fix' };
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.trim())) return { field: f.key, problem: 'Not a valid email address.', outcome: 'skip' };
    }
    if (f.length && s.length > f.length) return { field: f.key, problem: f.label + ' is longer than ' + f.length + ' characters.', outcome: 'skip' };
    return null;
  }

  // TODO(backend:ImportScreen) import-validate: validation runs in the browser over demoFile →
  //   ScheduledTask.validateFileData(Type, Data, Validation=3) with the column map, returning per
  //   row: ok | fixed (what changed) | error (field + message). v1 rejects the whole file on any
  //   error; v3 skips the bad rows instead (Mark, 2026-10-22).
  function validate() {
    var issues = [], fixed = {}, skipped = {}, ctx = { seen: {} };
    state.file.rows.forEach(function (r, idx) {
      var o = rowObject(r), rowNo = idx + 2;
      var found = [];
      cfg.fields.forEach(function (f) {
        if (!(f.key in o)) return;
        if (f.required && !String(o[f.key] || '').trim()) found.push({ field: f.key, problem: f.label + ' is empty.', outcome: 'skip' });
        var t = typeCheck(f, o[f.key]);
        if (t) found.push(t);
      });
      found = found.concat(cfg.check ? cfg.check(o, ctx, rowNo) : []);
      found.forEach(function (p) {
        var f = field(p.field);
        issues.push({ row: rowNo, column: f ? f.label : '—', value: p.value !== undefined ? p.value : (o[p.field] == null ? '' : o[p.field]), problem: p.problem, outcome: p.outcome });
        // 'note' = worth knowing, changes nothing (e.g. the same contact twice): not counted.
        if (p.outcome === 'skip') skipped[rowNo] = true; else if (p.outcome === 'fix') fixed[rowNo] = true;
      });
    });
    var nSkip = Object.keys(skipped).length;
    var nFix = Object.keys(fixed).filter(function (r) { return !skipped[r]; }).length;
    var order = { skip: 0, fix: 1, note: 2 };
    issues.sort(function (a, b) { return a.row - b.row || order[a.outcome] - order[b.outcome]; });
    return { total: state.file.rows.length, ready: state.file.rows.length - nSkip, fixed: nFix, skipped: nSkip, issues: issues };
  }

  function statTiles(r, mode) {
    var readyLabel = mode === 'done' ? 'Imported' : mode === 'queued' ? 'Queued to import' : 'Ready to import';
    return '<li class="cc-import__stat cc-import__stat--ready"><span class="cc-import__stat-value">' + r.ready.toLocaleString('en-GB') + '</span>' +
      '<span class="cc-import__stat-label"><i data-lucide="circle-check" aria-hidden="true"></i>' + readyLabel + '</span></li>' +
      '<li class="cc-import__stat cc-import__stat--fixed"><span class="cc-import__stat-value">' + r.fixed.toLocaleString('en-GB') + '</span>' +
      '<span class="cc-import__stat-label"><i data-lucide="wand-sparkles" aria-hidden="true"></i>Fixed for you</span></li>' +
      '<li class="cc-import__stat cc-import__stat--skipped"><span class="cc-import__stat-value">' + r.skipped.toLocaleString('en-GB') + '</span>' +
      '<span class="cc-import__stat-label"><i data-lucide="circle-x" aria-hidden="true"></i>' + (mode ? 'Skipped' : 'Will be skipped') + '</span></li>';
  }

  function issuesTable(r) {
    if (!r.issues.length) return '';
    var rows = r.issues.map(function (x) {
      var v = String(x.value);
      return '<tr><td>' + x.row + '</td><td>' + esc(x.column) + '</td>' +
        '<td>' + (v === '' ? '<span class="cc-import__value cc-import__value--empty">(empty)</span>' : '<span class="cc-import__value">' + esc(v.replace(/ /g, '·').replace(/\n/g, '↵\n')) + '</span>') + '</td>' +
        '<td>' + esc(x.problem) + '</td>' +
        '<td>' + (x.outcome === 'skip' ? '<span class="badge badge--danger">Skipped</span>' :
          x.outcome === 'fix' ? '<span class="badge badge--info">Fixed</span>' : '<span class="badge badge--neutral">Note</span>') + '</td></tr>';
    }).join('');
    return '<div class="cc-import__issues">' +
      '<div class="cc-import__issues-head"><div class="cc-import__title-row"><h3 class="cc-import__issues-title" id="imp-issues-title">Rows to check</h3>' +
      '<span class="badge badge--neutral" aria-label="' + plural(r.issues.length, 'issue') + '">' + r.issues.length + '</span></div>' +
      (r.skipped ? '<button type="button" class="btn btn--secondary btn--sm" data-import-download-skipped data-backend-todo="import-error-file"><i data-lucide="download" aria-hidden="true"></i><span>Download skipped rows</span></button>' : '') +
      '</div>' +
      '<div class="cc-import__table-wrap cc-import__table-wrap--scroll"><table class="table" aria-labelledby="imp-issues-title">' +
      '<thead><tr><th scope="col">Row</th><th scope="col">Column</th><th scope="col">Value in file</th><th scope="col">Problem</th><th scope="col">Outcome</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div></div>';
  }

  function renderReview() {
    var panel = $('[data-import-panel="review"]', root);
    var busy = $('[data-import-review-busy]', panel);
    var out = $('[data-import-review-out]', panel);
    if (!state.review) {
      busy.hidden = false;
      out.hidden = true;
      $('[data-import-review-busy-text]', panel).textContent = 'Checking ' + plural(state.file.rows.length, 'row') + '…';
      state.checking = true;
      update();
      setTimeout(function () {
        state.review = validate();
        state.checking = false;
        renderReview();
        update();
      }, params.get('step') === 'review' && !state.everChecked ? 0 : 900);
      state.everChecked = true;
      return;
    }
    var r = state.review;
    busy.hidden = true;
    out.hidden = false;
    var alert;
    if (!r.ready) {
      alert = '<div class="alert alert--danger" role="alert"><div class="alert__header"><span class="alert__icon"><i data-lucide="circle-alert" aria-hidden="true"></i></span>' +
        '<div class="alert__text"><span class="alert__title">No rows can be imported.</span><span class="alert__message"> Every row has an error. Fix the file and upload it again.</span></div></div></div>';
    } else if (r.skipped) {
      alert = '<div class="alert alert--warning"><div class="alert__header"><span class="alert__icon"><i data-lucide="triangle-alert" aria-hidden="true"></i></span>' +
        '<div class="alert__text"><span class="alert__title">' + plural(r.skipped, 'row has', 'rows have') + ' errors and will be skipped.</span>' +
        '<span class="alert__message"> The other ' + plural(r.ready, 'row') + ' will import. To bring in the skipped rows, download them, fix them and import that file.</span></div></div></div>';
    } else {
      alert = '<div class="alert alert--success"><div class="alert__header"><span class="alert__icon"><i data-lucide="circle-check" aria-hidden="true"></i></span>' +
        '<div class="alert__text"><span class="alert__title">All ' + plural(r.total, 'row') + ' are ready.</span>' +
        (r.fixed ? '<span class="alert__message"> ' + plural(r.fixed, 'row was', 'rows were') + ' tidied up for you; see below.</span>' : '') + '</div></div></div>';
    }
    out.innerHTML = alert + '<ul class="cc-import__summary" aria-label="Check results">' + statTiles(r) + '</ul>' + issuesTable(r);
    icons();
  }

  /* ── Results ────────────────────────────────────────── */

  function renderResults() {
    var panel = $('[data-import-panel="results"]', root);
    var r = state.review;
    var mode = params.get('run') || cfg.run;
    $('[data-import-step-title]', root).textContent =
      mode === 'now' ? (state.done ? 'Import complete' : 'Importing…') : 'Import scheduled';
    if (mode === 'now') {
      // TODO(backend:ImportScreen) import-run: the run is a timer → run the import now (no
      //   scheduled task) and stream RecordsProcessed / TotalRecords until it finishes.
      if (!state.done) {
        var n = 0;
        panel.innerHTML = '<div class="cc-import__busy">' + spinner('spinner--brand') +
          '<div class="cc-import__meter"><span class="cc-import__meter-text" data-import-run-text>Importing 0 of ' + r.ready + '…</span>' +
          '<span class="cc-import__meter-bar"><span class="cc-import__meter-fill" data-import-run-fill style="inline-size:0%"></span></span></div></div>';
        state.running = true; update();
        var timer = setInterval(function () {
          n = Math.min(r.ready, n + Math.max(1, Math.ceil(r.ready / 5)));
          var t = $('[data-import-run-text]', panel), fl = $('[data-import-run-fill]', panel);
          if (t) t.textContent = 'Importing ' + n + ' of ' + r.ready + '…';
          if (fl) fl.style.inlineSize = Math.round(n / r.ready * 100) + '%';
          if (n >= r.ready) { clearInterval(timer); state.done = true; state.running = false; renderResults(); update(); }
        }, 350);
        return;
      }
      panel.innerHTML =
        '<div class="alert alert--success" role="status"><div class="alert__header"><span class="alert__icon"><i data-lucide="circle-check" aria-hidden="true"></i></span>' +
        '<div class="alert__text"><span class="alert__title">Import complete.</span><span class="alert__message"> ' + plural(r.ready, 'row') + ' imported' +
        (r.skipped ? ', ' + plural(r.skipped, 'row') + ' skipped' : '') + '.</span></div></div></div>' +
        '<ul class="cc-import__summary" aria-label="Import results">' + statTiles(r, 'done') + '</ul>' + issuesTable(r);
    } else {
      // TODO(backend:ImportScreen) import-run: scheduling is mock → ScheduledTask.createScheduledTask
      //   (Type per import, Data = file + column map + options, TotalRecords = ready rows,
      //   DataValidatedYN = true), then return the new ScheduledTaskCode for the in-progress card.
      if (!state.done) {
        state.done = true;
        cfg.nextTaskId = (cfg.nextTaskId || 48213) + 1;
        cfg.progress = [{ id: cfg.nextTaskId - 1, processed: 0, total: r.ready, by: cfg.userName || 'Mark Foster', started: 'Just now', lastRun: 'Not yet' }].concat(cfg.progress || []);
        renderProgress();
      }
      panel.innerHTML =
        '<div class="alert alert--success" role="status"><div class="alert__header"><span class="alert__icon"><i data-lucide="circle-check" aria-hidden="true"></i></span>' +
        '<div class="alert__text"><span class="alert__title">Import scheduled.</span><span class="alert__message"> ' + plural(r.ready, 'row') +
        ' will import in the background. We’ll email you at <strong>' + esc(cfg.email) + '</strong> when it’s done. You can leave this page; its progress shows under Imports in progress.</span></div></div></div>' +
        '<ul class="cc-import__summary" aria-label="Import results">' + statTiles(r, 'queued') + '</ul>' + issuesTable(r);
    }
    icons();
  }

  function renderProgress() {
    var card = $('[data-import-progress]', root);
    if (!card) return;
    var list = params.get('progress') === '0' ? [] : (cfg.progress || []);
    card.hidden = !list.length;
    if (!list.length) return;
    var chip = $('[data-import-progress-count]', card);
    chip.textContent = list.length;
    chip.setAttribute('aria-label', plural(list.length, 'import') + ' in progress');
    $('tbody', card).innerHTML = list.map(function (p) {
      var pct = p.total ? Math.round(p.processed / p.total * 100) : 0;
      return '<tr><td>' + p.id + '</td>' +
        '<td><div class="cc-import__meter"><span class="cc-import__meter-text">' + p.processed.toLocaleString('en-GB') + ' of ' + p.total.toLocaleString('en-GB') + '</span>' +
        '<span class="cc-import__meter-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + p.total + '" aria-valuenow="' + p.processed + '" aria-label="Import ' + p.id + '"><span class="cc-import__meter-fill" style="inline-size:' + pct + '%"></span></span></div></td>' +
        '<td>' + esc(p.by) + '</td><td>' + esc(p.started) + '</td><td>' + esc(p.lastRun) + '</td></tr>';
    }).join('');
  }

  /* ── Download skipped rows (a real CSV of the demo rows, plus an Error column) ── */

  // TODO(backend:ImportScreen) import-error-file: built in the browser from demoFile → the run's
  //   skipped rows as the user's own columns plus an Error column (ImportError.cfc records them).
  function downloadSkipped() {
    var skipRows = {};
    state.review.issues.forEach(function (x) {
      if (x.outcome === 'skip') (skipRows[x.row] = skipRows[x.row] || []).push(x.column + ': ' + x.problem);
    });
    var q = function (v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    var lines = [state.file.headers.concat(['Error']).map(q).join(',')];
    Object.keys(skipRows).forEach(function (rowNo) {
      var r = state.file.rows[rowNo - 2];
      lines.push(r.concat([skipRows[rowNo].join(' | ')]).map(q).join(','));
    });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/csv' }));
    a.download = state.file.name.replace(/\.[^.]+$/, '') + '-skipped-rows.csv';
    document.body.appendChild(a); a.click(); a.remove();
  }

  /* ── Flow ───────────────────────────────────────────── */

  function stepIndex(id) { return cfg.steps.indexOf(id); }

  function go(i) {
    var id = cfg.steps[i];
    state.current = i;
    state.reached = Math.max(state.reached, i);
    $$('[data-import-panel]', root).forEach(function (p) { p.hidden = p.getAttribute('data-import-panel') !== id; });
    $('[data-import-step-title]', root).textContent = cfg.titles[id];
    if (id === 'map') renderMap();
    if (id === 'review') renderReview();
    if (id === 'results') renderResults();
    update();
  }

  function canLeave(id) {
    if (id === 'upload') return !!state.file;
    if (id === 'map') return state.file && mapProblems().list.length === 0;
    if (id === 'review') return state.review && state.review.ready > 0 && !state.checking;
    return true;
  }

  function update() {
    var id = cfg.steps[state.current];
    var back = $('[data-import-back]', root);
    var next = $('[data-import-next]', root);
    var again = $('[data-import-again]', root);
    var note = $('[data-import-footer-note]', root);

    Stepper.render(stepper, {
      steps: cfg.steps.map(function (s) { return STEP_LABELS[s]; }),
      current: state.current,
      errors: state.review && state.review.skipped ? [stepIndex('review')] : [],
      locked: id === 'results'
    });

    back.hidden = state.current === 0 || id === 'results';
    again.hidden = id !== 'results' || state.running;
    next.hidden = id === 'results';
    next.disabled = !canLeave(id) || !!state.checking;
    // The step's primary action: "Continue to <next step>" with a trailing arrow, or on Review the
    // run itself, which names how many rows it will import.
    var nextName = cfg.steps[state.current + 1];
    var html = id === 'review'
      ? '<i data-lucide="upload" aria-hidden="true"></i><span>' + (state.review ? 'Import ' + plural(state.review.ready, 'row') : 'Import') + '</span>'
      : '<span>Continue to ' + (nextName ? STEP_LABELS[nextName].toLowerCase() : '') + '</span><i data-lucide="arrow-right" aria-hidden="true"></i>';
    if (next.getAttribute('data-html') !== html) {
      next.setAttribute('data-html', html);
      next.innerHTML = html;
      icons();
    }
    note.textContent = id === 'upload' && !state.file ? 'Upload a file to continue.' :
      id === 'map' && !canLeave('map') ? 'Fix the column choices above to continue.' : '';
    next.setAttribute('aria-describedby', note.textContent ? 'imp-footer-note' : '');
  }

  function init(config) {
    cfg = config;
    root = $('[data-import]');
    stepper = $('[data-import-stepper]', root);
    state = { current: 0, reached: 0, file: null, mapping: {}, auto: {}, review: null };

    bindUpload();
    bindMap();
    renderProgress();

    $('[data-import-next]', root).addEventListener('click', function () {
      if (!canLeave(cfg.steps[state.current])) return;
      go(state.current + 1);
      $('[data-import-step-title]', root).focus();
    });
    $('[data-import-back]', root).addEventListener('click', function () {
      go(state.current - 1);
      $('[data-import-step-title]', root).focus();
    });
    $('[data-import-again]', root).addEventListener('click', function () {
      state = { current: 0, reached: 0, file: null, mapping: {}, auto: {}, review: null };
      renderFile();
      go(0);
      $('[data-import-drop]', root).focus();
    });
    stepper.addEventListener('stepper:select', function (e) { go(e.detail.index); });
    root.addEventListener('click', function (e) {
      if (e.target.closest('[data-import-download-skipped]')) downloadSkipped();
    });

    // Demo entry points.
    var up = params.get('upload');
    if (up === 'type') acceptFile('contacts-export.pdf', 48211);
    if (up === 'size') acceptFile('all-contacts-2026.xlsx', 162529280);
    var target = stepIndex(params.get('step'));
    if (target > 0) {
      acceptFile(cfg.demoFile.name, cfg.demoFile.bytes);
      if (target > stepIndex('review') && stepIndex('review') !== -1) { state.review = validate(); }
      go(target);
    } else {
      go(0);
    }
  }

  window.ImportScreen = { init: init };
})();
