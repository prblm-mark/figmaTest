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

  /* ── Facets (FilterItem chips) ───────────────────────────
     Each chip filters by one column. Its values are read from the rows themselves — a table
     cell under the header of the same name, or a media tile's data-facets JSON — so a facet
     can never offer a value that matches nothing. Chip click opens a FilterDropdowns
     Multi Select card (checklist + Apply); Apply sets the chip's rollup and re-filters, the ×
     clears it. OR within a facet, AND across facets and the search.
     FilterItem.js is an ES module these pages do not load, so the chip's own states
     (--open / --selected / rollup) are driven here. */
  function items(overlay) {
    var list = $$(overlay, '[data-selector-item]');
    return list.length ? list : $$(overlay, 'tbody tr'); // the multi table's rows carry no data-selector-item
  }

  function facetValue(overlay, el, name) {
    if (el.hasAttribute('data-facets')) {
      try { return JSON.parse(el.getAttribute('data-facets'))[name] || 'None'; } catch (err) { return 'None'; }
    }
    var heads = $$(overlay, 'thead th').map(function (th) { return th.textContent.trim(); });
    var i = heads.indexOf(name);
    var td = i === -1 ? null : el.children[i];
    var v = td ? td.textContent.trim() : '';
    return v && v !== '—' ? v : 'None';
  }

  function facetState(chip) { return chip.__values || (chip.__values = []); }

  function rollup(chip) {
    var vals = facetState(chip);
    var out = $(chip, '.filter-item__values');
    chip.classList.toggle('filter-item--selected', vals.length > 0);
    chip.classList.toggle('filter-item--empty', vals.length === 0);
    out.textContent = '';
    if (!vals.length) return;
    var lead = document.createElement('span');
    lead.className = 'filter-item__values-lead';
    lead.textContent = vals.length <= 3 ? vals.join(', ') : vals[0];
    out.appendChild(lead);
    if (vals.length > 3) {
      var rest = document.createElement('span');
      rest.className = 'filter-item__values-rest';
      rest.textContent = ', and ' + (vals.length - 1) + ' more';
      out.appendChild(rest);
    }
  }

  function closeFacet(chip) {
    if (!chip) return;
    chip.classList.remove('filter-item--open');
    $(chip, '.filter-item__trigger').setAttribute('aria-expanded', 'false');
    var panel = $(chip, '.selector__facet-panel');
    if (panel) panel.remove();
  }

  function closeFacets(scope) { $$(scope, '[data-selector-facet].filter-item--open').forEach(closeFacet); }

  function esc(t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

  function openFacet(chip) {
    var overlay = chip.closest('.modal-overlay');
    closeFacets(overlay);
    var name = chip.getAttribute('data-filter-name');
    var counts = {};
    items(overlay).forEach(function (el) { var v = facetValue(overlay, el, name); counts[v] = (counts[v] || 0) + 1; });
    var chosen = facetState(chip);
    var values = Object.keys(counts).sort(function (a, b) { return a === 'None' ? 1 : b === 'None' ? -1 : a.localeCompare(b); });
    var panel = document.createElement('div');
    panel.className = 'filter-dropdowns filter-dropdowns--list selector__facet-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Filter by ' + name);
    panel.innerHTML = '<div class="input"><span class="input__label">Filter by ' + esc(name) + '</span></div>' +
      '<div class="filter-dropdowns__checklist selector__facet-list">' + values.map(function (v) {
        return '<label class="checkbox"><input type="checkbox" class="checkbox__input" value="' + esc(v) + '"' + (chosen.indexOf(v) !== -1 ? ' checked' : '') + '>' +
          '<span class="checkbox__indicator"><i data-lucide="check" aria-hidden="true"></i></span>' +
          '<span class="checkbox__label"><span class="checkbox__label-text">' + esc(v) + '</span><span class="selector__facet-count">' + counts[v] + '</span></span></label>';
      }).join('') + '</div>' +
      '<button type="button" class="btn btn--primary filter-dropdowns__apply" data-facet-apply>Apply</button>';
    chip.appendChild(panel);
    chip.classList.add('filter-item--open');
    $(chip, '.filter-item__trigger').setAttribute('aria-expanded', 'true');
    icons();
    var first = $(panel, '.checkbox__input');
    if (first) first.focus();
  }

  function applyFacet(chip) {
    chip.__values = $$(chip, '.selector__facet-panel .checkbox__input:checked').map(function (c) { return c.value; });
    rollup(chip);
    closeFacet(chip);
    filter(chip.closest('.modal-overlay'));
    $(chip, '.filter-item__trigger').focus();
  }

  function resetFacet(chip) {
    chip.__values = [];
    rollup(chip);
    closeFacet(chip);
    filter(chip.closest('.modal-overlay'));
  }

  document.addEventListener('filter-item:toggle', function (e) {
    var chip = e.target.closest && e.target.closest('[data-selector-facet]');
    if (!chip) return;
    if (e.detail && e.detail.open) openFacet(chip); else closeFacet(chip);
  });

  document.addEventListener('filter-item:clear', function (e) {
    var chip = e.target.closest && e.target.closest('[data-selector-facet]');
    if (chip) resetFacet(chip);
  });

  function clearFacets(overlay) {
    $$(overlay, '[data-selector-facet]').forEach(function (chip) { chip.__values = []; rollup(chip); closeFacet(chip); });
  }

  /* ── Search (all four modes) ─────────────────────────── */
  function filter(overlay) {
    var input = $(overlay, '[data-selector-search]');
    var q = input ? input.value.trim().toLowerCase() : '';
    var facets = $$(overlay, '[data-selector-facet]').filter(function (c) { return facetState(c).length; });
    var shown = 0;
    items(overlay).forEach(function (el) {
      var hit = (!q || (el.getAttribute('data-selector-item') || el.textContent).toLowerCase().indexOf(q) !== -1) &&
        facets.every(function (c) { return facetState(c).indexOf(facetValue(overlay, el, c.getAttribute('data-filter-name'))) !== -1; });
      el.hidden = !hit;
      if (hit) shown++;
    });
    var empty = $(overlay, '[data-selector-empty]');
    if (empty) empty.hidden = shown > 0;
    var modal = $(overlay, '.selector');
    if (modal) modal.classList.toggle('selector--filtered', !!q || facets.length > 0);
    var hint = $(overlay, '[data-sort-hint]');
    if (hint) hint.hidden = !q && !facets.length;
    return shown;
  }

  function clearSearch(overlay) {
    var input = $(overlay, '[data-selector-search]');
    if (input) input.value = '';
    clearFacets(overlay);
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
    var chip = e.target.closest('[data-selector-facet]');
    if (chip) {
      if (e.target.closest('[data-facet-apply]')) { applyFacet(chip); return; }
      // Where FilterItem.js has bound the chip (the record shell loads it) it toggles --open and
      // clears itself, and says so in filter-item:toggle / filter-item:clear (below). Where it
      // has not (the Selector demo), this does both.
      var owned = chip.dataset.filterItemInit === '1';
      if (!owned && e.target.closest('.filter-item__clear')) { resetFacet(chip); return; }
      if (!owned && e.target.closest('.filter-item__trigger')) { if (chip.classList.contains('filter-item--open')) closeFacet(chip); else openFacet(chip); }
      return; // clicks inside the open panel (checkboxes) stay in the panel
    }
    // Any other click closes an open facet panel.
    closeFacets(document);

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

  // Capture phase: an open facet panel takes Escape before TagBox's / this file's modal close.
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = document.querySelector('[data-selector-facet].filter-item--open');
    if (open) { e.preventDefault(); e.stopPropagation(); closeFacet(open); $(open, '.filter-item__trigger').focus(); }
  }, true);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.matches('[data-sort-position]')) { e.preventDefault(); commitPosition(e.target); e.target.select(); return; }
    if (e.key === 'Escape' && active) { e.preventDefault(); close(true); }
  });
})();
