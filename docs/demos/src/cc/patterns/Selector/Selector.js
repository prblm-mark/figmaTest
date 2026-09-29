/* Selector — behaviour for the four record-screen pickers (see Selector.css for the modes).
 *
 * Markup contract:
 *   Trigger   any element with data-selector-open="<overlay id>". For single + sort it sits in a
 *             .field-row__lookup beside an <input data-selector-value>; for media it sits in a
 *             .media-picker, whose .media-picker__thumb receives the chosen image.
 *   Overlay   <div class="modal-overlay" id="…" data-selector="single|multi|media|sort">
 *             Close: .modal__close, [data-modal-cancel], the backdrop, Escape.
 *   Search    <input data-selector-search> filters every [data-selector-item] by its text;
 *             [data-selector-empty] shows when nothing matches.
 *   Status    [data-selector-count] — the live count / current choice in the footer.
 *
 * The MULTI mode's open / Apply / close stay with TagBox.js (it opened first and still owns the
 * tags); this file only adds search and the "n selected" count to those overlays.
 * Delegated at the document, bound once.
 */
(function () {
  'use strict';
  if (window.__selectorBound) return;
  window.__selectorBound = true;

  var active = null; // { overlay, mode, trigger, snapshot }

  function $(root, sel) { return root.querySelector(sel); }
  function $$(root, sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }
  function icons() { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons(); }

  /* ── Search (all four modes) ─────────────────────────── */
  function filter(overlay) {
    var input = $(overlay, '[data-selector-search]');
    var q = input ? input.value.trim().toLowerCase() : '';
    var items = $$(overlay, '[data-selector-item]');
    // The multi table's rows carry no data-selector-item — filter its tbody rows by their text.
    if (!items.length) items = $$(overlay, 'tbody tr');
    var shown = 0;
    items.forEach(function (el) {
      var hit = !q || (el.getAttribute('data-selector-item') || el.textContent).toLowerCase().indexOf(q) !== -1;
      el.hidden = !hit;
      if (hit) shown++;
    });
    var empty = $(overlay, '[data-selector-empty]');
    if (empty) empty.hidden = shown > 0;
    var modal = $(overlay, '.selector');
    if (modal) modal.classList.toggle('selector--filtered', !!q);
    var hint = $(overlay, '[data-sort-hint]');
    if (hint) hint.hidden = !q;
    return shown;
  }

  function clearSearch(overlay) {
    var input = $(overlay, '[data-selector-search]');
    if (input) input.value = '';
    filter(overlay);
  }

  /* ── Status line ─────────────────────────────────────── */
  function status(overlay, text) {
    var el = $(overlay, '[data-selector-count]');
    if (el) el.textContent = text;
  }

  function countMulti(overlay) {
    var n = $$(overlay, 'tbody .checkbox__input:checked').length;
    status(overlay, n ? n + ' selected' : 'None selected');
  }

  /* ── Open / close (single, media, sort) ──────────────── */
  function valueInput(trigger) {
    var row = trigger.closest('.field-row__lookup');
    return row ? $(row, '[data-selector-value]') : null;
  }

  function open(trigger, overlay) {
    var mode = overlay.getAttribute('data-selector');
    active = { overlay: overlay, mode: mode, trigger: trigger };
    clearSearch(overlay);
    if (mode === 'single') openSingle(overlay, trigger);
    if (mode === 'media') openMedia(overlay);
    if (mode === 'sort') openSort(overlay);
    overlay.classList.add('modal-overlay--open');
    var search = $(overlay, '[data-selector-search]');
    (search || $(overlay, '.modal__close')).focus();
    if (mode === 'sort') jumpToCurrent(overlay, 'auto');
  }

  function close(restore) {
    if (!active) return;
    if (restore && active.mode === 'sort' && active.snapshot) applyOrder(active.overlay, active.snapshot);
    active.overlay.classList.remove('modal-overlay--open');
    var t = active.trigger;
    active = null;
    if (t) t.focus();
  }

  /* ── Single ──────────────────────────────────────────── */
  function openSingle(overlay, trigger) {
    var input = valueInput(trigger);
    var current = input ? input.value.trim() : '';
    var tbody = $(overlay, 'tbody');
    var picked = null;
    $$(overlay, '[data-selector-item]').forEach(function (tr) {
      var on = tr.getAttribute('data-selector-item') === current;
      tr.classList.toggle('selector__row--selected', on);
      $(tr, '[data-selector-pick]').setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on) picked = tr;
    });
    // The current value is pinned to the top, so it is the first thing seen on open.
    if (picked && tbody.firstElementChild !== picked) tbody.insertBefore(picked, tbody.firstElementChild);
    var region = $(overlay, '.modal__scroll');
    if (region) region.scrollTop = 0;
    status(overlay, current ? 'Current: ' + current : 'Nothing selected');
    var clear = $(overlay, '[data-selector-clear]');
    if (clear) clear.disabled = !current;
  }

  function pickSingle(tr) {
    var input = valueInput(active.trigger);
    if (input) {
      input.value = tr.getAttribute('data-selector-item');
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
    close(false);
  }

  function clearSingle() {
    var input = valueInput(active.trigger);
    if (input) {
      input.value = '';
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
    close(false);
  }

  /* ── Media ───────────────────────────────────────────── */
  function openMedia(overlay) {
    $$(overlay, '.selector__tile').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
    $(overlay, '[data-selector-apply]').disabled = true;
    status(overlay, 'Nothing selected');
  }

  function pickMedia(tile) {
    var overlay = active.overlay;
    $$(overlay, '.selector__tile').forEach(function (b) { b.setAttribute('aria-pressed', b === tile ? 'true' : 'false'); });
    $(overlay, '[data-selector-apply]').disabled = false;
    status(overlay, tile.closest('[data-selector-item]').getAttribute('data-selector-item') + ' · ' + tile.getAttribute('data-meta'));
  }

  function applyMedia() {
    var tile = $(active.overlay, '.selector__tile[aria-pressed="true"]');
    var picker = active.trigger.closest('.media-picker');
    if (tile && picker) {
      var thumb = $(picker, '.media-picker__thumb');
      var img = document.createElement('img');
      img.src = tile.getAttribute('data-src');
      img.alt = '';
      thumb.innerHTML = '';
      thumb.appendChild(img);
    }
    close(false);
  }

  /* ── Sort ────────────────────────────────────────────── */
  function list(overlay) { return $(overlay, '[data-sort-list]'); }
  function rows(overlay) { return $$(list(overlay), '[data-sort-key]'); }
  function order(overlay) { return rows(overlay).map(function (r) { return r.getAttribute('data-sort-key'); }); }

  function applyOrder(overlay, keys) {
    var ol = list(overlay);
    keys.forEach(function (k) { ol.appendChild($(ol, '[data-sort-key="' + k + '"]')); });
    renumber(overlay);
  }

  function renumber(overlay) {
    var all = rows(overlay);
    all.forEach(function (r, i) {
      $(r, '[data-sort-position]').value = String(i + 1);
      $(r, '[data-sort-move="top"]').disabled = i === 0;
      $(r, '[data-sort-move="up"]').disabled = i === 0;
      $(r, '[data-sort-move="down"]').disabled = i === all.length - 1;
      $(r, '[data-sort-move="bottom"]').disabled = i === all.length - 1;
    });
    var cur = $(list(overlay), '.selector__sort-row--current');
    if (cur) status(overlay, 'This article: position ' + (all.indexOf(cur) + 1) + ' of ' + all.length);
  }

  function openSort(overlay) {
    active.snapshot = order(overlay);
    renumber(overlay);
  }

  function jumpToCurrent(overlay, behavior) {
    var cur = $(list(overlay), '.selector__sort-row--current');
    if (cur && !cur.hidden) cur.scrollIntoView({ block: 'center', behavior: behavior || 'smooth' });
  }

  // Move `row` to 0-based index `to` in the FULL order (a search only hides rows, never reorders).
  function moveTo(overlay, row, to, focusSel) {
    var all = rows(overlay);
    var from = all.indexOf(row);
    to = Math.max(0, Math.min(all.length - 1, to));
    if (to === from) { renumber(overlay); return; }
    var ol = list(overlay);
    var rest = all.filter(function (r) { return r !== row; });
    ol.insertBefore(row, rest[to] || null);
    renumber(overlay);
    row.classList.add('selector__sort-row--moved');
    setTimeout(function () { row.classList.remove('selector__sort-row--moved'); }, 1200);
    row.scrollIntoView({ block: 'nearest' });
    var live = $(overlay, '[data-sort-live]');
    if (live) live.textContent = row.getAttribute('data-selector-item') + ' moved to position ' + (to + 1) + ' of ' + all.length;
    if (focusSel) {
      var f = $(row, focusSel);
      if (f && !f.disabled) f.focus(); else $(row, '[data-sort-position]').focus();
    }
  }

  function move(btn) {
    var overlay = active.overlay;
    var row = btn.closest('[data-sort-key]');
    var all = rows(overlay);
    var i = all.indexOf(row);
    var dir = btn.getAttribute('data-sort-move');
    var to = dir === 'top' ? 0 : dir === 'bottom' ? all.length - 1 : dir === 'up' ? i - 1 : i + 1;
    moveTo(overlay, row, to, '[data-sort-move="' + dir + '"]');
  }

  function commitPosition(input) {
    var overlay = input.closest('.modal-overlay');
    var row = input.closest('[data-sort-key]');
    var n = parseInt(input.value, 10);
    if (!isFinite(n)) { renumber(overlay); return; }
    moveTo(overlay, row, n - 1, null);
  }

  function saveSort() {
    var overlay = active.overlay;
    var all = rows(overlay);
    var cur = $(list(overlay), '.selector__sort-row--current');
    var input = valueInput(active.trigger);
    var changed = order(overlay).join() !== active.snapshot.join();
    if (input && cur && changed) {
      input.value = 'Position ' + (all.indexOf(cur) + 1) + ' of ' + all.length;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
    close(false);
  }

  /* Drag — Edit Columns' model: the row is draggable only while the pointer is on its grip. */
  var dragRow = null;

  function clearDrop() {
    document.querySelectorAll('.selector__sort-row--over-before, .selector__sort-row--over-after').forEach(function (r) {
      r.classList.remove('selector__sort-row--over-before', 'selector__sort-row--over-after');
    });
  }

  document.addEventListener('pointerdown', function (e) {
    var grip = e.target.closest('[data-sort-grip]');
    if (grip && !grip.closest('.selector--filtered')) grip.closest('[data-sort-key]').draggable = true;
  });

  document.addEventListener('dragstart', function (e) {
    var row = e.target.closest && e.target.closest('.selector__sort-row');
    if (!row) return;
    dragRow = row;
    row.classList.add('selector__sort-row--dragging');
    if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', row.getAttribute('data-sort-key')); }
  });

  document.addEventListener('dragover', function (e) {
    if (!dragRow) return;
    var row = e.target.closest && e.target.closest('.selector__sort-row');
    if (!row || row.parentNode !== dragRow.parentNode) return;
    e.preventDefault();
    var box = row.getBoundingClientRect();
    var before = (e.clientY - box.top) < box.height / 2;
    clearDrop();
    row.classList.add(before ? 'selector__sort-row--over-before' : 'selector__sort-row--over-after');
    // Auto-scroll near the region's edges, so a long list can be crossed in one drag.
    var region = row.closest('.modal__scroll');
    if (region) {
      var r = region.getBoundingClientRect();
      var edge = 48;
      if (e.clientY < r.top + edge) region.scrollTop -= 12;
      else if (e.clientY > r.bottom - edge) region.scrollTop += 12;
    }
  });

  document.addEventListener('drop', function (e) {
    if (!dragRow) return;
    var row = e.target.closest && e.target.closest('.selector__sort-row');
    if (!row || row === dragRow || row.parentNode !== dragRow.parentNode) return;
    e.preventDefault();
    var overlay = row.closest('.modal-overlay');
    var box = row.getBoundingClientRect();
    var before = (e.clientY - box.top) < box.height / 2;
    var all = rows(overlay);
    var target = all.indexOf(row);
    var from = all.indexOf(dragRow);
    var to = before ? target : target + 1;
    if (from < to) to -= 1; // indices shift once the dragged row leaves its place
    moveTo(overlay, dragRow, to, null);
  });

  document.addEventListener('dragend', function () {
    if (dragRow) { dragRow.draggable = false; dragRow.classList.remove('selector__sort-row--dragging'); }
    dragRow = null;
    clearDrop();
  });

  /* ── Wiring ──────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-selector-open]');
    if (opener) {
      var ov = document.getElementById(opener.getAttribute('data-selector-open'));
      if (ov && ov.getAttribute('data-selector') !== 'multi') { e.preventDefault(); open(opener, ov); }
      return;
    }

    // Multi: TagBox has just opened / changed the overlay — refresh search + count after it.
    var tagSelect = e.target.closest('[data-tag-box-select]');
    if (tagSelect) {
      var mov = document.getElementById(tagSelect.getAttribute('data-tag-box-select'));
      if (mov) setTimeout(function () { clearSearch(mov); countMulti(mov); var s = $(mov, '[data-selector-search]'); if (s) s.focus(); }, 0);
      return;
    }
    var multi = e.target.closest('[data-selector="multi"]');
    if (multi && e.target.closest('.checkbox')) { setTimeout(function () { countMulti(multi); }, 0); return; }

    if (!active) return;
    var overlay = active.overlay;
    if (!overlay.contains(e.target)) return;
    if (e.target === overlay || e.target.closest('.modal__close, [data-modal-cancel]')) { close(true); return; }

    if (active.mode === 'single') {
      if (e.target.closest('[data-selector-clear]')) { clearSingle(); return; }
      var tr = e.target.closest('[data-selector-item]');
      if (tr) pickSingle(tr);
      return;
    }
    if (active.mode === 'media') {
      if (e.target.closest('[data-selector-apply]')) { applyMedia(); return; }
      var tile = e.target.closest('.selector__tile');
      if (tile) pickMedia(tile);
      return;
    }
    if (active.mode === 'sort') {
      var mv = e.target.closest('[data-sort-move]');
      if (mv) { move(mv); return; }
      if (e.target.closest('[data-sort-jump]')) { clearSearch(overlay); jumpToCurrent(overlay); return; }
      if (e.target.closest('[data-sort-reset]')) { applyOrder(overlay, active.snapshot); jumpToCurrent(overlay); return; }
      if (e.target.closest('[data-selector-apply]')) saveSort();
    }
  });

  document.addEventListener('dblclick', function (e) {
    if (active && active.mode === 'media' && e.target.closest('.selector__tile')) applyMedia();
  });

  document.addEventListener('input', function (e) {
    if (e.target.matches('[data-selector-search]')) filter(e.target.closest('.modal-overlay'));
  });

  document.addEventListener('change', function (e) {
    if (e.target.matches('[data-sort-position]')) commitPosition(e.target);
    if (e.target.closest('[data-selector="multi"]') && e.target.matches('.checkbox__input')) countMulti(e.target.closest('.modal-overlay'));
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.matches('[data-sort-position]')) { e.preventDefault(); commitPosition(e.target); e.target.select(); return; }
    if (e.key === 'Escape' && active) { e.preventDefault(); close(true); }
  });
})();
