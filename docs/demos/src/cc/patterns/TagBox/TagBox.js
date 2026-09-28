/* TagBox — remove a selected value, and pick values in the Multi Select Modal.
 *
 * Markup contract:
 *   <div class="tag-box" data-tag-box>
 *     <ul class="tag-box__tags" data-empty="None selected">
 *       <li class="badge badge--neutral"><span>AI</span>
 *         <button type="button" class="badge__close" aria-label="Remove AI">…</button></li>
 *     </ul>
 *     <button type="button" class="btn btn--secondary btn--sm"
 *             data-tag-box-select="modal-id">Select</button>
 *   </div>
 *   The modal is a FilterDropdowns Multi Select Modal inside a Modal overlay:
 *     <div class="modal-overlay" id="modal-id"> <div class="modal filter-dropdowns__modal"> …
 *   Rows: first cell holds the checkbox, the second cell the item name.
 *   Close buttons: .modal__close and [data-modal-cancel]. Apply: [data-filter-dropdowns-apply].
 *
 * Opening the modal pre-ticks the rows already in the box; Apply writes the ticked
 * names back as tags. Delegated at the document.
 */
// TODO(backend:RecordScreen): the modal rows are static demo data → search endpoint for the field's
//   source (sections / topics) returning { id, name, parent, channel, zone }; tags submit as ids.
(function () {
  'use strict';
  if (window.__tagBoxBound) return;
  window.__tagBoxBound = true;

  var active = null; // { box, overlay }

  function names(box) {
    return Array.prototype.map.call(box.querySelectorAll('.tag-box__tags .badge > span:first-child'), function (s) {
      return s.textContent.trim();
    });
  }

  function tag(name) {
    var li = document.createElement('li');
    li.className = 'badge badge--neutral';
    var label = document.createElement('span');
    label.textContent = name;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'badge__close';
    btn.setAttribute('aria-label', 'Remove ' + name);
    btn.innerHTML = '<i data-lucide="x" aria-hidden="true"></i>';
    li.appendChild(label);
    li.appendChild(btn);
    return li;
  }

  function rows(overlay) {
    return overlay.querySelectorAll('tbody tr');
  }

  function rowName(tr) {
    var cell = tr.children[1];
    return cell ? cell.textContent.trim() : '';
  }

  function open(box, overlay) {
    var current = names(box);
    rows(overlay).forEach(function (tr) {
      var cb = tr.querySelector('.checkbox__input');
      if (cb) cb.checked = current.indexOf(rowName(tr)) !== -1;
    });
    active = { box: box, overlay: overlay };
    overlay.classList.add('modal-overlay--open');
    var first = overlay.querySelector('.modal__close');
    if (first) first.focus();
  }

  function close() {
    if (!active) return;
    active.overlay.classList.remove('modal-overlay--open');
    var trigger = active.box.querySelector('[data-tag-box-select]');
    active = null;
    if (trigger) trigger.focus();
  }

  function apply() {
    if (!active) return;
    var list = active.box.querySelector('.tag-box__tags');
    list.innerHTML = '';
    rows(active.overlay).forEach(function (tr) {
      var cb = tr.querySelector('.checkbox__input');
      if (cb && cb.checked) list.appendChild(tag(rowName(tr)));
    });
    if (window.lucide) window.lucide.createIcons();
    close();
  }

  document.addEventListener('click', function (e) {
    var remove = e.target.closest('.tag-box .badge__close');
    if (remove) {
      var li = remove.closest('.badge');
      var box = remove.closest('[data-tag-box]');
      li.remove();
      var next = box.querySelector('.badge__close') || box.querySelector('[data-tag-box-select]');
      if (next) next.focus();
      return;
    }
    var select = e.target.closest('[data-tag-box-select]');
    if (select) {
      var overlay = document.getElementById(select.getAttribute('data-tag-box-select'));
      if (overlay) open(select.closest('[data-tag-box]'), overlay);
      return;
    }
    if (!active) return;
    if (e.target.closest('[data-filter-dropdowns-apply]')) { apply(); return; }
    if (e.target.closest('.modal__close, [data-modal-cancel]') || e.target === active.overlay) close();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && active) close();
  });
})();
