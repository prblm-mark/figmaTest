/* Seating Planner — Room layout (TASK-344760)
 *
 * Twelfth sub-task onto the workspace shell:
 *
 *     SeatingPlannerWorkspace.on('room-layout', openModal)
 *
 * WHAT THIS TASK IS NOT: a spatial seat-map editor. TASK-344753's notes assumed
 * "Room layout" meant arranging tables on a floor plan, and flagged it as
 * undesigned. The brief settles it — this ATTACHES A FILE (PDF or image) to the
 * SeatingPlan, previews it in-app, and replaces or removes it. The tables grid
 * stays a list.
 *
 * The attachment belongs to the PLAN, not the event, so it is stored per plan
 * chip and the popup title names the plan — as the reference does. Switching
 * plans switches the layout.
 *
 * This one genuinely works offline: an image is read with FileReader and
 * previewed for real, so dropping a floor plan in the prototype shows the floor
 * plan. A PDF cannot be rasterised in a page, so it gets a document card rather
 * than a fake thumbnail — see the handover.
 *
 * TODO(backend:SeatingPlanner): DOM-only, and the file never leaves the browser.
 * Real version uploads to a MediaFileItem and stores the reference on the
 * SeatingPlan — one per plan, so replacing means repointing the reference and
 * letting the old item be garbage-collected by the media layer, not deleting the
 * file blind (it may be shared). Validate type and size SERVER-side too: the
 * accept attribute is a convenience, not a control.
 */
(function () {
  'use strict';

  var ACCEPT = /^(application\/pdf|image\/(png|jpeg|jpg|gif|webp|svg\+xml))$/;

  /* planKey → { name, size, type, url } */
  var layouts = {};

  function one(sel, root) { return (root || document).querySelector(sel); }
  function all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function api() { return window.SeatingPlannerWorkspace || {}; }

  function activePlan() {
    var chip = one('[data-sp-plan].sp-plan--active');
    return chip ? chip.getAttribute('data-sp-plan') : null;
  }
  function planLabel() {
    var chip = one('[data-sp-plan].sp-plan--active');
    if (!chip) return '';
    var label = chip.getAttribute('data-sp-plan-label') || '';
    /* the chip label is upper-cased for the toolbar; the dialog wants the name */
    var name = one('.sp-plan__name', chip);
    return name ? name.textContent : label;
  }

  function readableSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  /* ------------------------------------------------------------------ render */

  function render() {
    var body = one('[data-rl-body]');
    if (!body) return;

    var key = activePlan();
    var file = key ? layouts[key] : null;

    one('[data-rl-plan]').textContent = planLabel();

    if (!file) {
      /* the DS DragDropFile component, with this task's copy */
      body.innerHTML =
        '<div class="drag-drop" data-rl-zone>' +
        '<div class="drag-drop__icon-wrap"><i data-lucide="upload-cloud" aria-hidden="true"></i></div>' +
        '<div class="drag-drop__text">' +
        '<p class="drag-drop__title">No layout attached</p>' +
        '<p class="drag-drop__subtitle">Upload a floor plan (PDF or image) of where the ' +
        'tables sit in the room — or drag a file here.</p>' +
        '</div></div>';
    } else if (file.type === 'application/pdf') {
      body.innerHTML =
        '<div class="sp-layout__doc">' +
        '<i data-lucide="file-text" aria-hidden="true"></i>' +
        '<div class="sp-layout__doc-main">' +
        '<p class="sp-layout__name">' + esc(file.name) + '</p>' +
        '<span class="sp-layout__size">PDF · ' + readableSize(file.size) + '</span>' +
        '</div>' +
        '<a class="btn btn--secondary btn--sm" href="' + (file.url || '#') +
        '" target="_blank" rel="noopener">Open</a>' +
        '</div>' +
        '<p class="sp-layout__hint">A PDF can’t be previewed inline here — it opens in a ' +
        'new tab. See the handover: in-app preview needs a PDF viewer.</p>';
    } else {
      body.innerHTML =
        '<img class="sp-layout__preview" src="' + (file.url || '') + '" alt="Floor plan for ' +
        esc(planLabel()) + '">' +
        '<div class="sp-layout__meta">' +
        '<p class="sp-layout__name">' + esc(file.name) + '</p>' +
        '<span class="sp-layout__size">' + readableSize(file.size) + '</span>' +
        '</div>';
    }

    /* the footer changes with the state: upload, or replace + remove */
    var footer = one('[data-rl-footer]');
    if (footer) {
      footer.innerHTML = file
        ? '<button class="btn btn--secondary" type="button" data-rl-close>Close</button>' +
          '<button class="btn btn--secondary" type="button" data-rl-remove>' +
          '<i data-lucide="trash-2" aria-hidden="true"></i>Remove</button>' +
          '<button class="btn btn--primary" type="button" data-rl-pick>Replace</button>'
        : '<button class="btn btn--secondary" type="button" data-rl-close>Close</button>' +
          '<button class="btn btn--primary" type="button" data-rl-pick>Upload PDF / image</button>';
    }

    syncToolbarFlag();
    refreshIcons();
  }

  /* The toolbar button is the only place you can see WHETHER a plan has a layout
     without opening the popup, so it carries a dot. */
  function syncToolbarFlag() {
    var btn = one('[data-sp-action="room-layout"]');
    if (!btn) return;
    var key = activePlan();
    if (key && layouts[key]) btn.setAttribute('data-sp-has-layout', 'true');
    else btn.removeAttribute('data-sp-has-layout');
  }

  /* ------------------------------------------------------------------- files */

  function accept(file) {
    if (!file) return false;
    if (ACCEPT.test(file.type)) return true;
    if (api().toast) {
      api().toast('<strong>' + esc(file.name) + '</strong> isn’t a PDF or an image.');
    }
    return false;
  }

  function take(file) {
    if (!accept(file)) return;
    var key = activePlan();
    if (!key) return;

    var reader = new FileReader();
    reader.onload = function () {
      layouts[key] = { name: file.name, size: file.size, type: file.type, url: reader.result };
      render();
      if (api().toast) {
        api().toast('<strong>' + esc(file.name) + '</strong> attached to ' + planLabel() + '.');
      }
    };
    /* a data URL survives a re-render, where an object URL would need revoking */
    reader.readAsDataURL(file);
  }

  function remove() {
    var key = activePlan();
    if (!key || !layouts[key]) return;
    var name = layouts[key].name;
    delete layouts[key];
    render();
    if (api().toast) {
      api().toast('<strong>' + esc(name) + '</strong> removed from ' + planLabel() + '.');
    }
  }

  /* ------------------------------------------------------------ open / close */

  function openModal() {
    var overlay = one('[data-rl-overlay]');
    if (!overlay) return;
    render();
    overlay.classList.add('modal-overlay--open');
  }

  function closeModal() {
    var overlay = one('[data-rl-overlay]');
    if (overlay) overlay.classList.remove('modal-overlay--open');
  }

  /* ---------------------------------------------------------------- wiring */

  function init() {
    if (!one('[data-rl-modal]')) return;

    if (api().on) api().on('room-layout', openModal);

    /* Seed from markup so a state file can open with a layout already attached */
    all('[data-sp-plan][data-sp-layout]').forEach(function (chip) {
      var parts = (chip.getAttribute('data-sp-layout') || '').split('|');
      if (!parts[0]) return;
      layouts[chip.getAttribute('data-sp-plan')] = {
        name: parts[0],
        size: parseInt(parts[1], 10) || 0,
        type: parts[2] || 'image/png',
        url: chip.getAttribute('data-sp-layout-src') || ''
      };
    });
    syncToolbarFlag();

    var native = one('[data-rl-native]');
    if (native) {
      native.addEventListener('change', function () {
        if (native.files && native.files[0]) take(native.files[0]);
        native.value = '';   /* so choosing the same file twice still fires */
      });
    }

    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-rl-close]')) { e.preventDefault(); closeModal(); return; }
      if (e.target.closest('[data-rl-remove]')) { e.preventDefault(); remove(); return; }
      if (e.target.closest('[data-rl-pick]') || e.target.closest('[data-rl-zone]')) {
        e.preventDefault();
        if (native) native.click();
        return;
      }
      var overlay = one('[data-rl-overlay]');
      if (overlay && e.target === overlay) closeModal();
    });

    /* Drag a file straight onto the dropzone */
    ['dragenter', 'dragover'].forEach(function (type) {
      document.addEventListener(type, function (e) {
        var zone = e.target.closest && e.target.closest('[data-rl-zone]');
        if (!zone) return;
        /* only FILES — a person being dragged from the pool is not a floor plan */
        if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], 'Files') === -1) return;
        e.preventDefault();
        zone.classList.add('drag-drop--active');
      });
    });

    document.addEventListener('dragleave', function (e) {
      var zone = e.target.closest && e.target.closest('[data-rl-zone]');
      if (zone) zone.classList.remove('drag-drop--active');
    });

    document.addEventListener('drop', function (e) {
      var zone = e.target.closest && e.target.closest('[data-rl-zone]');
      if (!zone) return;
      e.preventDefault();
      zone.classList.remove('drag-drop--active');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        take(e.dataTransfer.files[0]);
      }
    });

    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

    /* Switching plans switches the layout, so keep the toolbar dot honest */
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-sp-plan]')) setTimeout(syncToolbarFlag, 0);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
