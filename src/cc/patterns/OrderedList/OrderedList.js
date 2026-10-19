/* OrderedList — reorder a short list in place; Kind=Selectable also picks and removes items.
 *
 * Markup contract:
 *   <div class="ordered-list" data-ordered-list>
 *     <ol class="ordered-list__items" aria-label="Content Group Priority" data-empty="None selected">
 *       <li class="ordered-list__row" data-ordered-list-key="articles">
 *         <span class="ordered-list__grip" data-ordered-list-grip aria-hidden="true">…grip…</span>
 *         <span class="ordered-list__position">1</span>
 *         <span class="ordered-list__label">Articles</span>
 *         <span class="ordered-list__actions">
 *           <button … data-ordered-list-move="up" aria-label="Move Articles up">…</button>
 *           <button … data-ordered-list-move="down" aria-label="Move Articles down">…</button>
 *           <button … data-ordered-list-remove aria-label="Remove Articles">…</button>   (Selectable)
 *         </span>
 *       </li>
 *     </ol>
 *     <input type="hidden" name="…" value="articles,contacts" data-ordered-list-value>
 *     <p class="ordered-list__live" aria-live="polite" data-ordered-list-live></p>
 *     <button … data-ordered-list-select="modal-id">Select</button>                   (Selectable)
 *   </div>
 *   The Select modal is the FilterDropdowns Multi Select Modal (TagBox's contract): rows' first
 *   cell holds the checkbox, the second the item name; a row may carry data-ordered-list-key.
 *
 * Every move renumbers the rows, refreshes the ↑ ↓ disabled state, writes the keys to the hidden
 * input and announces "<item> moved to position n of N". Apply keeps the order of the items that
 * stay and adds new ones at the bottom. Delegated at the document.
 */
// TODO(backend:RecordScreen) ordered-list-value: the hidden input holds the keys in order → submit
//   with the page's Save in the field's own v1 format (e.g. Content Group Priority's ordered list)
(function () {
  'use strict';
  if (window.__orderedListBound) return;
  window.__orderedListBound = true;

  var ICON = { grip: 'grip-vertical', up: 'arrow-up', down: 'arrow-down', remove: 'x' };
  var active = null; // { box, overlay }

  function rows(box) {
    return Array.prototype.slice.call(box.querySelectorAll('.ordered-list__row'));
  }

  function label(row) {
    return row.querySelector('.ordered-list__label').textContent.trim();
  }

  function refresh(box) {
    var all = rows(box);
    all.forEach(function (row, i) {
      row.querySelector('.ordered-list__position').textContent = String(i + 1);
      var up = row.querySelector('[data-ordered-list-move="up"]');
      var down = row.querySelector('[data-ordered-list-move="down"]');
      if (up) up.disabled = i === 0;
      if (down) down.disabled = i === all.length - 1;
    });
    var input = box.querySelector('[data-ordered-list-value]');
    if (input) {
      input.value = all.map(function (r) { return r.getAttribute('data-ordered-list-key'); }).join(',');
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function announce(box, text) {
    var live = box.querySelector('[data-ordered-list-live]');
    if (live) live.textContent = text;
  }

  function moveTo(box, row, to, focusDir) {
    var all = rows(box);
    var from = all.indexOf(row);
    to = Math.max(0, Math.min(all.length - 1, to));
    if (to === from) return;
    var rest = all.filter(function (r) { return r !== row; });
    row.parentNode.insertBefore(row, rest[to] || null);
    refresh(box);
    row.classList.add('ordered-list__row--moved');
    setTimeout(function () { row.classList.remove('ordered-list__row--moved'); }, 1200);
    announce(box, label(row) + ' moved to position ' + (to + 1) + ' of ' + all.length);
    if (focusDir) {
      // Keep focus on the same arrow so repeated presses keep moving; at an end, hand it to the other.
      var same = row.querySelector('[data-ordered-list-move="' + focusDir + '"]');
      var other = row.querySelector('[data-ordered-list-move="' + (focusDir === 'up' ? 'down' : 'up') + '"]');
      (same && !same.disabled ? same : other).focus();
    }
  }

  function button(attr, aria, ico) {
    return '<button type="button" class="btn btn--tertiary btn--xs btn--icon" ' + attr +
      ' aria-label="' + aria + '"><i data-lucide="' + ico + '" aria-hidden="true"></i></button>';
  }

  function makeRow(key, name, removable) {
    var li = document.createElement('li');
    li.className = 'ordered-list__row';
    li.setAttribute('data-ordered-list-key', key);
    var safe = name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    li.innerHTML =
      '<span class="ordered-list__grip" data-ordered-list-grip title="Drag to reorder" aria-hidden="true"><i data-lucide="' + ICON.grip + '"></i></span>' +
      '<span class="ordered-list__position"></span>' +
      '<span class="ordered-list__label">' + safe + '</span>' +
      '<span class="ordered-list__actions">' +
        button('data-ordered-list-move="up"', 'Move ' + safe + ' up', ICON.up) +
        button('data-ordered-list-move="down"', 'Move ' + safe + ' down', ICON.down) +
        (removable ? button('data-ordered-list-remove', 'Remove ' + safe, ICON.remove) : '') +
      '</span>';
    return li;
  }

  /* Select — the Multi Select Modal, as TagBox. */
  function modalRows(overlay) {
    return Array.prototype.slice.call(overlay.querySelectorAll('tbody tr'));
  }

  function rowName(tr) {
    var cell = tr.children[1];
    return cell ? cell.textContent.trim() : '';
  }

  function rowKey(tr) {
    return tr.getAttribute('data-ordered-list-key') || rowName(tr);
  }

  function open(box, overlay) {
    var keys = rows(box).map(function (r) { return r.getAttribute('data-ordered-list-key'); });
    modalRows(overlay).forEach(function (tr) {
      var cb = tr.querySelector('.checkbox__input');
      if (cb) cb.checked = keys.indexOf(rowKey(tr)) !== -1;
    });
    active = { box: box, overlay: overlay };
    overlay.classList.add('modal-overlay--open');
    var first = overlay.querySelector('.modal__close');
    if (first) first.focus();
  }

  function close() {
    if (!active) return;
    active.overlay.classList.remove('modal-overlay--open');
    var trigger = active.box.querySelector('[data-ordered-list-select]');
    active = null;
    if (trigger) trigger.focus();
  }

  function apply() {
    var box = active.box;
    var list = box.querySelector('.ordered-list__items');
    var picked = modalRows(active.overlay).filter(function (tr) {
      var cb = tr.querySelector('.checkbox__input');
      return cb && cb.checked;
    });
    var pickedKeys = picked.map(rowKey);
    // Items that stay keep their place; the rest go.
    rows(box).forEach(function (r) {
      if (pickedKeys.indexOf(r.getAttribute('data-ordered-list-key')) === -1) r.remove();
    });
    var kept = rows(box).map(function (r) { return r.getAttribute('data-ordered-list-key'); });
    var added = 0;
    picked.forEach(function (tr) {
      if (kept.indexOf(rowKey(tr)) === -1) { list.appendChild(makeRow(rowKey(tr), rowName(tr), true)); added++; }
    });
    if (window.lucide) window.lucide.createIcons();
    refresh(box);
    announce(box, rows(box).length + ' selected' + (added ? ', ' + added + ' added at the end' : ''));
    close();
  }

  document.addEventListener('click', function (e) {
    var mv = e.target.closest('[data-ordered-list-move]');
    if (mv && mv.closest('[data-ordered-list]')) {
      var box = mv.closest('[data-ordered-list]');
      var row = mv.closest('.ordered-list__row');
      var dir = mv.getAttribute('data-ordered-list-move');
      moveTo(box, row, rows(box).indexOf(row) + (dir === 'up' ? -1 : 1), dir);
      return;
    }
    var rm = e.target.closest('[data-ordered-list-remove]');
    if (rm) {
      var rbox = rm.closest('[data-ordered-list]');
      var rrow = rm.closest('.ordered-list__row');
      var all = rows(rbox);
      var i = all.indexOf(rrow);
      var name = label(rrow);
      rrow.remove();
      refresh(rbox);
      announce(rbox, name + ' removed');
      var rest = rows(rbox);
      var next = rest[Math.min(i, rest.length - 1)];
      (next ? next.querySelector('[data-ordered-list-remove]') : rbox.querySelector('[data-ordered-list-select]')).focus();
      return;
    }
    var sel = e.target.closest('[data-ordered-list-select]');
    if (sel) {
      var overlay = document.getElementById(sel.getAttribute('data-ordered-list-select'));
      if (overlay) open(sel.closest('[data-ordered-list]'), overlay);
      return;
    }
    if (!active) return;
    if (e.target.closest('[data-filter-dropdowns-apply]')) { apply(); return; }
    if (e.target.closest('.modal__close, [data-modal-cancel]') || e.target === active.overlay) close();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && active) close();
  });

  /* Drag — Selector's / Edit Columns' model: a row is draggable only while the pointer is on its grip. */
  var dragRow = null;

  function clearDrop() {
    document.querySelectorAll('.ordered-list__row--over-before, .ordered-list__row--over-after').forEach(function (r) {
      r.classList.remove('ordered-list__row--over-before', 'ordered-list__row--over-after');
    });
  }

  function dropTarget(e) {
    var row = e.target.closest && e.target.closest('.ordered-list__row');
    return row && dragRow && row.parentNode === dragRow.parentNode ? row : null;
  }

  document.addEventListener('pointerdown', function (e) {
    var grip = e.target.closest('[data-ordered-list-grip]');
    if (grip) grip.closest('.ordered-list__row').draggable = true;
  });

  document.addEventListener('dragstart', function (e) {
    var row = e.target.closest && e.target.closest('.ordered-list__row');
    if (!row) return;
    dragRow = row;
    row.classList.add('ordered-list__row--dragging');
    if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', row.getAttribute('data-ordered-list-key')); }
  });

  document.addEventListener('dragover', function (e) {
    var row = dropTarget(e);
    if (!row) return;
    e.preventDefault();
    var r = row.getBoundingClientRect();
    clearDrop();
    row.classList.add((e.clientY - r.top) < r.height / 2 ? 'ordered-list__row--over-before' : 'ordered-list__row--over-after');
  });

  document.addEventListener('drop', function (e) {
    var row = dropTarget(e);
    if (!row || row === dragRow) return;
    e.preventDefault();
    var box = row.closest('[data-ordered-list]');
    var r = row.getBoundingClientRect();
    var all = rows(box);
    var from = all.indexOf(dragRow);
    var to = all.indexOf(row) + ((e.clientY - r.top) < r.height / 2 ? 0 : 1);
    if (from < to) to -= 1; // indices shift once the dragged row leaves its place
    moveTo(box, dragRow, to, null);
  });

  document.addEventListener('dragend', function () {
    if (dragRow) { dragRow.draggable = false; dragRow.classList.remove('ordered-list__row--dragging'); }
    dragRow = null;
    clearDrop();
  });

  // Rendered markup may arrive without numbers or disabled ends — settle every list once.
  function init() { document.querySelectorAll('[data-ordered-list]').forEach(refresh); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
